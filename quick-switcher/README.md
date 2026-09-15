# Quick Switcher

A cmd-K style palette over **Firebot** (preset effect lists, custom + system
commands) and **OBS** (scenes with live markers, stream/record controls).
No build step, no dependencies — just open it in a browser.

## Run

Serve over HTTP (not `file://`, so the Firebot API calls have an origin):

```bash
cd quick-switcher && python3 -m http.server 8901
# → http://localhost:8901
```

Query params: `?firebot=http://host:7472&obs=ws://host:4455`.
Otherwise defaults are `localhost` both; the OBS password and base URLs can be
persisted via `localStorage` keys `qs.obsPassword`, `qs.obsUrl`,
`qs.firebotBase` (open devtools console to set).

## Use

- Type to fuzzy-filter · `↑↓` navigate · `⏎` run · `esc` clear · `/` refocus
- Cold start → triggered effect in < 5 keystrokes is the design goal
- Status bar shows per-backend entry counts (or the connection error)

## Backends (source-verified)

- Firebot: `GET /api/v1/effects/preset`, `/api/v1/commands/custom`,
  `/api/v1/commands/system`; trigger via `POST …/run`
  (see `third-party/Firebot src/server/api/v1/v1-router.ts`).
- OBS: raw obs-websocket v5 RPC over native WebSocket
  (Hello → Identify with `b64(sha256(password+salt))` /
  `b64(sha256(secret+challenge))` → Request). No client library.

## Notes

- Firebot preset/command lists are empty until you create some — the palette
  then shows OBS entries only. That's expected, not a bug.
- Related in-repo work: `obs-listener/…/obs-command-search/` (fuzzy UX over
  raw websocket requests) — candidate to unify into this palette later.
