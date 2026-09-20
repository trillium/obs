"use strict";
/* Quick Switcher — cmd-K palette over Firebot + OBS.
 * No build step, no dependencies. Backends:
 *  Firebot: GET /api/v1/effects/preset, /api/v1/commands/custom (+/system),
 *           trigger via POST <...>/run            (see third-party/Firebot src/server/api/v1/v1-router.ts)
 *  OBS: raw obs-websocket v5 RPC over native WebSocket (hello/identify/call).
 */
const CFG = {
  firebotBase: localStorage.getItem("qs.firebotBase") || "http://localhost:7472",
  obsUrl: localStorage.getItem("qs.obsUrl") || "ws://localhost:4455",
  obsPassword: localStorage.getItem("qs.obsPassword") || "",
};
const params = new URLSearchParams(location.search);
if (params.get("firebot")) CFG.firebotBase = params.get("firebot");
if (params.get("obs")) CFG.obsUrl = params.get("obs");

let ENTRIES = [];   // {kind, name, hint, run}
let selIndex = 0;

const $q = document.getElementById("q");
const $list = document.getElementById("list");
const $toast = document.getElementById("toast");
let toastTimer = null;
function toast(msg) {
  $toast.textContent = msg; $toast.style.display = "block";
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $toast.style.display = "none", 2600);
}
function setStatus(id, ok, text) {
  const el = document.getElementById(id);
  el.textContent = text; el.className = ok ? "ok" : "bad";
}

/* Subsequence fuzzy match; returns score (lower is better) or null. */
function fuzzy(query, target) {
  query = query.toLowerCase(); target = target.toLowerCase();
  let qi = 0, score = 0, last = -1;
  for (let ti = 0; ti < target.length && qi < query.length; ti++) {
    if (target[ti] === query[qi]) {
      score += (last === ti - 1) ? 0 : ti;  // reward contiguous runs
      last = ti; qi++;
    }
  }
  return qi === query.length ? score : null;
}

function render() {
  const q = $q.value.trim();
  const scored = [];
  for (const e of ENTRIES) {
    const s = q === "" ? 0 : fuzzy(q, e.kind + " " + e.name);
    if (s !== null) scored.push([s, e]);
  }
  scored.sort((a, b) => a[0] - b[0] || a[1].name.localeCompare(b[1].name));
  const shown = scored.slice(0, 50).map((x) => x[1]);
  if (selIndex >= shown.length) selIndex = 0;
  $list.innerHTML = "";
  shown.forEach((e, i) => {
    const d = document.createElement("div");
    d.className = "item" + (i === selIndex ? " sel" : "");
    d.innerHTML = `<span class="kind"></span><span class="name"></span><span class="hint"></span>`;
    d.children[0].textContent = e.kind; d.children[1].textContent = e.name;
    d.children[2].textContent = e.hint || "";
    d.onclick = () => { selIndex = i; activate(shown); };
    $list.appendChild(d);
  });
  document.getElementById("st-count").textContent =
    `${shown.length}/${ENTRIES.length} · ↑↓ navigate · ⏎ run · esc clear`;
  render._shown = shown;
}
async function activate(shown) {
  const list = shown || render._shown || [];
  const e = list[selIndex];
  if (!e) return;
  try { await e.run(); toast(`✓ ${e.name}`); }
  catch (err) { toast(`✗ ${e.name}: ${err.message || err}`); }
  refreshDynamic();
}
$q.addEventListener("input", () => { selIndex = 0; render(); });
$q.addEventListener("keydown", (ev) => {
  const shown = render._shown || [];
  if (ev.key === "ArrowDown") { ev.preventDefault(); selIndex = Math.min(selIndex + 1, shown.length - 1); render(); }
  else if (ev.key === "ArrowUp") { ev.preventDefault(); selIndex = Math.max(selIndex - 1, 0); render(); }
  else if (ev.key === "Enter") { activate(shown); }
  else if (ev.key === "Escape") { $q.value = ""; selIndex = 0; render(); }
});
document.addEventListener("keydown", (ev) => {
  if (ev.key === "/" && document.activeElement !== $q) { ev.preventDefault(); $q.focus(); }
});

/* ---------------- Firebot backend ---------------- */
async function loadFirebot() {
  const base = CFG.firebotBase.replace(/\/$/, "");
  const get = async (p) => {
    const r = await fetch(base + p);
    if (!r.ok) throw new Error(`${p} → ${r.status}`);
    return r.json();
  };
  const entries = [];
  try {
    const presets = await get("/api/v1/effects/preset");
    for (const p of (Array.isArray(presets) ? presets : presets.presetLists || [])) {
      const id = p.id, name = p.name || p.id;
      entries.push({
        kind: "preset", name, hint: "firebot effect list",
        run: async () => {
          const r = await fetch(`${base}/api/v1/effects/preset/${encodeURIComponent(id)}/run`, { method: "POST" });
          if (!r.ok) throw new Error(`run → ${r.status}`);
        },
      });
    }
  } catch (e) { console.warn("presets:", e.message); }
  for (const path of ["/api/v1/commands/custom", "/api/v1/commands/system"]) {
    try {
      const cmds = await get(path);
      for (const c of (Array.isArray(cmds) ? cmds : cmds.commands || [])) {
        const id = c.id, name = (c.trigger || c.name || c.id) + "";
        entries.push({
          kind: "command", name, hint: "firebot",
          run: async () => {
            const stem = path.replace("/api/v1", "");
            const r = await fetch(`${base}${stem}/${encodeURIComponent(id)}/run`, { method: "POST" });
            if (!r.ok) throw new Error(`run → ${r.status}`);
          },
        });
      }
    } catch (e) { console.warn(path, e.message); }
  }
  setStatus("st-firebot", entries.length > 0, `firebot: ${entries.length} entries`);
  return entries;
}

/* ---------------- OBS backend (raw obs-websocket v5) ---------------- */
// obs-websocket v5 auth, byte-identical to the flow verified against live OBS:
//   secret = b64(sha256(password + salt)); auth = b64(sha256(secret + challenge))
async function b64sha256(str) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)));
  return btoa(String.fromCharCode(...bytes));
}
async function obsAuth(password, salt, challenge) {
  const secret = await b64sha256(password + salt);
  return b64sha256(secret + challenge);
}

let obsSocket = null, obsSeq = 0;
const obsPending = new Map();
function obsConnect() {
  return new Promise((resolve, reject) => {
    if (obsSocket && obsSocket.readyState === WebSocket.OPEN) return resolve();
    const ws = new WebSocket(CFG.obsUrl);
    const timer = setTimeout(() => { try { ws.close(); } catch (_) {} reject(new Error("obs connect timeout")); }, 5000);
    ws.onmessage = async (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.op === 0) { // Hello
        const auth = msg.d.authentication;
        const identify = { op: 1, d: { rpcVersion: 1 } };
        if (auth) identify.d.authentication = await obsAuth(CFG.obsPassword, auth.salt, auth.challenge);
        ws.send(JSON.stringify(identify));
      } else if (msg.op === 2) { // Identified
        clearTimeout(timer); obsSocket = ws; resolve();
      } else if (msg.op === 7) { // RequestResponse
        const p = obsPending.get(msg.d.requestId);
        if (p) { obsPending.delete(msg.d.requestId); p(msg.d); }
      } else if (msg.op === 5) { /* event: ignore */ }
    };
    ws.onerror = () => { clearTimeout(timer); reject(new Error("obs socket error")); };
    ws.onclose = () => { if (obsSocket === ws) obsSocket = null; };
  });
}
async function obsCall(requestType, requestData) {
  await obsConnect();
  return new Promise((resolve, reject) => {
    const requestId = "qs-" + (++obsSeq);
    obsPending.set(requestId, (d) => {
      if (d.requestStatus && d.requestStatus.result) resolve(d.responseData || {});
      else reject(new Error((d.requestStatus && d.requestStatus.comment) || "obs call failed"));
    });
    obsSocket.send(JSON.stringify({ op: 6, d: { requestType, requestId, requestData } }));
    setTimeout(() => { if (obsPending.delete(requestId)) reject(new Error("obs call timeout")); }, 8000);
  });
}
const OBS_QUICK_ACTIONS = [
  ["Start Streaming", "StartStream"], ["Stop Streaming", "StopStream"],
  ["Start Recording", "StartRecord"], ["Stop Recording", "StopRecord"],
  ["Toggle Studio Mode", "ToggleStudioMode"],
];
async function loadObs() {
  const entries = [];
  try {
    const scenes = await obsCall("GetSceneList");
    const current = scenes.currentProgramSceneName;
    for (const s of (scenes.scenes || [])) {
      const name = s.sceneName;
      entries.push({
        kind: "scene", name, hint: name === current ? "● live" : "obs",
        run: () => obsCall("SetCurrentProgramScene", { sceneName: name }).then(() => {}),
      });
    }
    const status = await obsCall("GetStreamStatus").catch(() => null);
    if (status) entries.unshift({
      kind: "obs", name: status.outputActive ? "Stop Streaming (live now)" : "Start Streaming",
      hint: `${status.outputSkippedFrames || 0} skipped`,
      run: () => obsCall(status.outputActive ? "StopStream" : "StartStream").then(() => {}),
    });
    for (const [label, req] of OBS_QUICK_ACTIONS.slice(1)) {
      entries.push({ kind: "obs", name: label, hint: "obs", run: () => obsCall(req).then(() => {}) });
    }
    setStatus("st-obs", true, `obs: ${entries.length} entries`);
  } catch (e) {
    setStatus("st-obs", false, `obs: ${e.message} — set ?obs=ws://… or localStorage qs.obsPassword`);
  }
  return entries;
}

async function refreshDynamic() {
  // Re-pull scene list + stream status so ● live markers stay true. Cheap; best-effort.
  const keep = ENTRIES.filter((e) => e.kind === "preset" || e.kind === "command");
  const obs = await loadObs();
  ENTRIES = [...keep, ...obs];
  render();
}

(async function init() {
  render();
  const [fb, obs] = await Promise.all([loadFirebot().catch(() => []), loadObs().catch(() => [])]);
  ENTRIES = [...fb, ...obs];
  render();
  $q.focus();
})();
