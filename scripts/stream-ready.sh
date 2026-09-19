#!/bin/bash
# stream-ready.sh — short, repeatable pre-stream health check.
#
# Read-only: inspects repo files and prints presence/absence only.
# Never prints stream keys or credentials (service.json / .go-live.env
# values are checked for presence, never dumped).
#
# Usage: ./scripts/stream-ready.sh
# Exit 0 = healthy (warnings allowed), 1 = something needs attention.
#
# Reversible: touches nothing; safe to run during a live stream.

set -u

PASS=0
FAIL=0
WARN=0

ok()   { PASS=$((PASS + 1)); echo "ok   $1"; }
fail() { FAIL=$((FAIL + 1)); echo "FAIL $1"; }
warn() { WARN=$((WARN + 1)); echo "warn $1"; }

ROOT="$(cd "$(dirname "$0")/.." && pwd -P)"
cd "$ROOT" || exit 1

echo "== stream-ready: $ROOT =="

# --- 1. Scene collections: valid JSON with the expected 7 scenes ---
EXPECTED_SCENES='[1080p] Webcam|[UW1440] Ultrawide Rec|[UW1440] All Sources|[1080p] Screen Share|[1080p] Screen + Side|[1080p] Stream Ending|[1080p] Starting Soon'
for coll in "scenes/Live Stream.json" "scenes/Live-Stream.json" "scenes/Untitled.json"; do
	if [ ! -f "$coll" ]; then
		fail "missing scene collection: $coll"
		continue
	fi
	names="$(python3 -c "
import json,sys
d = json.load(open(sys.argv[1]))
print('|'.join(s.get('name','') for s in d.get('scene_order', [])))
" "$coll" 2>/dev/null)" || { fail "invalid JSON: $coll"; continue; }
	if [ "$names" = "$EXPECTED_SCENES" ]; then
		ok "scenes present (7/7): $coll"
	else
		fail "unexpected scene list in $coll: $names"
	fi
done

# --- 2. Ambiguity warning: three near-duplicate live collections ---
# (fallout of the Sep 2026 relaunch-clobber saga; OBS loads ONE by name)
n_live=0
for coll in "scenes/Live Stream.json" "scenes/Live-Stream.json" "scenes/Untitled.json"; do
	[ -f "$coll" ] && n_live=$((n_live + 1))
done
if [ "$n_live" -gt 1 ]; then
	warn "$n_live near-duplicate live collections in scenes/ — confirm OBS loads the intended one"
fi

# --- 3. Overlay browser sources wired in the primary collection ---
PRIMARY="scenes/Live Stream.json"
if [ -f "$PRIMARY" ]; then
	for needle in "localhost:7400/overlay/starting-soon" "localhost:7400/overlay/stream-ending" "localhost:7472/overlay/?instance=Stream%201080p" "8765/obs?layout=side-bar" "streamelements.com/overlay"; do
		if grep -q -F "$needle" "$PRIMARY"; then
			ok "overlay wired: $needle"
		else
			fail "overlay missing from $PRIMARY: $needle"
		fi
	done
fi

# --- 4. Profiles present; report encoder/output summary (no secrets) ---
for prof in "profiles/Live Stream" "profiles/Untitled"; do
	ini="$prof/basic.ini"
	if [ ! -f "$ini" ]; then
		fail "missing profile: $ini"
		continue
	fi
	enc="$(grep -E '^StreamEncoder=' "$ini" | cut -d= -f2 | head -1)"
	vbr="$(grep -E '^VBitrate=' "$ini" | cut -d= -f2 | head -1)"
	res="$(grep -E '^OutputC[XY]=' "$ini" | cut -d= -f2 | tr '\n' 'x')"
	ok "profile '$prof': encoder=${enc:-?} vbitrate=${vbr:-?} out=${res:-?}"
done
if [ ! -f "profiles/Live Stream/service.json" ] && [ ! -f "profiles/Untitled/service.json" ]; then
	warn "no service.json in repo — destinations/stream keys live only in the OBS app (unverifiable here)"
fi

# --- 5. Announcements tooling ---
if python3 -m py_compile go-live.py 2>/dev/null; then
	ok "go-live.py compiles"
else
	fail "go-live.py does not compile"
fi
if [ -f ".go-live.env" ]; then
	ok ".go-live.env present (values never shown)"
else
	warn ".go-live.env absent (gitignored, per-machine) — announcements will refuse to run until created"
fi

# --- 6. Quick-switcher ---
if [ -f "quick-switcher/index.html" ] && [ -f "quick-switcher/app.js" ]; then
	ok "quick-switcher present"
else
	fail "quick-switcher files missing"
fi

# --- 7. Control-center overlays ---
for route in "obs-control-center/app/overlay/starting-soon/page.tsx" "obs-control-center/app/overlay/brb/page.tsx" "obs-control-center/app/overlay/stream-ending/page.tsx"; do
	if [ -f "$route" ]; then
		ok "overlay route: $route"
	else
		fail "missing overlay route: $route"
	fi
done

# --- 8. Checklist doc ---
[ -f "PRE-STREAM.md" ] && ok "PRE-STREAM.md present" || fail "PRE-STREAM.md missing"

echo "== result: $PASS ok, $WARN warnings, $FAIL failures =="
[ "$FAIL" -eq 0 ]
