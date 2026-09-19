# GET STREAMING Plan

Simultaneous streaming to **YouTube** and **Twitch**.

## Phase 1: Account Setup

- [ ] Create/configure Twitch account (twitch.tv)
- [ ] Get Twitch stream key: Dashboard > Settings > Stream
- [ ] Create/configure YouTube channel
- [ ] Enable YouTube live streaming (requires 24hr verification wait for first-timers)
- [ ] Get YouTube stream key: YouTube Studio > Go Live > Stream Settings
- [ ] Check internet upload speed (recommend 10+ Mbps for dual-streaming 1080p)
- [ ] Decide on peripherals: webcam, microphone, lighting
- [ ] Set up any external audio (mic, headphones)

## Phase 2: Multistream Setup

There are three main ways to simulcast. Pick one:

### Option A: Aitum Multistream Plugin (Recommended — free, local)
- [ ] Install the Aitum Multistream plugin from OBS Tools menu or obsproject.com
- [ ] Open OBS > Tools > Aitum Multistream
- [ ] Add Twitch output with your RTMP URL and stream key
- [ ] Add YouTube output with your RTMP URL and stream key
- [ ] Both streams share the same encoder — one encode, two outputs
- [ ] No extra CPU cost, no third-party service needed

### Option B: Restream.io (Easiest — cloud-based)
- [ ] Sign up at restream.io (free tier supports 2 platforms)
- [ ] Connect your Twitch and YouTube accounts in Restream dashboard
- [ ] In OBS: Settings > Stream > Service: Restream.io
- [ ] Paste your Restream stream key
- [ ] OBS sends one stream to Restream, which relays to both platforms
- [ ] Pro: minimal local resource use. Con: adds a middleman, slight latency

### Option C: OBS Multiple Output (Manual)
- [ ] In OBS go to Settings > Stream and set your primary platform (e.g., Twitch)
- [ ] Use Tools > Multiple Output to add a second output for YouTube
- [ ] Enter the YouTube RTMP URL and stream key
- [ ] This encodes twice — more CPU load, but fully local and no third party

## Phase 3: OBS Configuration

- [ ] Open OBS and run the Auto-Configuration Wizard
- [ ] Configure video settings:
  - Base resolution (your monitor res)
  - Output resolution: 1080p recommended
  - FPS: 30 to start, 60 if your machine handles it
- [ ] Configure output settings:
  - Encoder: Apple VT H264 Hardware Encoder (M1 hardware encoding)
  - Bitrate: 6000 kbps (meets both Twitch and YouTube requirements)
  - Audio bitrate: 160 kbps
- [ ] Configure audio settings:
  - Set your mic as the input device
  - Set desktop audio for game/app sound

### Twitch Simulcast Rule
- Your Twitch stream must be equal or better quality than your YouTube stream
- If you stream 1080p60 to YouTube, you must also do 1080p60 (or better) to Twitch
- Using a single encoder output (Aitum) makes this easy — both get the same feed

## Phase 4: Scene Setup

- [ ] Create your first scene (e.g., "Main Stream")
- [ ] Add sources:
  - Display Capture or Window Capture (what you're showing)
  - Video Capture Device (webcam)
  - Audio Input Capture (mic)
  - Audio Output Capture (desktop audio)
- [ ] Arrange and resize sources in the preview
- [ ] Create a "Starting Soon" scene (optional but nice)
- [ ] Create a "Be Right Back" scene (optional)

## Phase 5: Polish

- [ ] Add overlays or alerts (Streamlabs, StreamElements — both support multistream)
- [ ] Set up combined chat (Restream chat or use a tool like chatty for both)
- [ ] Configure hotkeys for scene switching, mute, etc.
- [ ] Add noise suppression filter to your mic source
- [ ] Test audio levels — mic should peak around -10 to -20 dB

## Phase 6: Test & Go Live

- [ ] Do a test recording first (not live) to check quality
- [ ] Review the test recording for audio sync, video quality, framing
- [ ] Do a private/unlisted test stream on BOTH platforms to check connectivity
- [ ] Monitor OBS stream health (bottom bar — dropped frames, bitrate)
- [ ] Verify both platforms are receiving the feed
- [ ] When happy with everything: go live on both!

## M1 Mac Mini Tips

- Use the Apple hardware encoder (VT) — it barely impacts CPU
- Aitum Multistream is ideal for M1 since it reuses one encode for both outputs
- 16GB RAM is solid for dual-streaming + other tasks
- Close unnecessary apps to free up resources
- Use wired ethernet — dual streaming needs stable upload
- Budget ~12 Mbps upload for two 6000 kbps streams (with overhead)
- The M1 handles 1080p30 dual-streaming very comfortably

---

## Reality check (2026-09-19, fm/obs-streaming)

Reconciled against the repo (not the live OBS app — destinations, keys,
and plugin state live outside this tree and were NOT inspected). Original
checkboxes above left untouched; discrepancies named, not silently fixed.

**Verified in repo — works:**

- Phase 4 (scenes): DONE. `scenes/Live Stream.json` carries all 7 scenes
  (`[1080p] Webcam`, `[UW1440] Ultrawide Rec`, `[UW1440] All Sources`,
  `[1080p] Screen Share`, `[1080p] Screen + Side`, `[1080p] Stream Ending`,
  `[1080p] Starting Soon`) with display/webcam/mic/desktop-audio captures.
- Phase 5 (overlays): DONE in substance. Control-center overlays
  (`overlay/starting-soon`, `overlay/brb`, `overlay/stream-ending` on
  `:7400`), Firebot `Stream 1080p` instance + side-panel chat (`:7472`),
  PM5 tailnet side-bar overlay, and a StreamElements overlay are all wired
  as browser sources. Quick-switcher cmd-K palette exists.
- Phase 3 (encoding basics): HALF DONE. Both profiles set 6000 kbps video /
  160 kbps audio, base 1920x1080. BUT output is 1280x720 (not the plan's
  1080p) and the two profiles disagree on encoder (`Live Stream` = x264,
  `Untitled` = apple_h264) — the plan's Apple-VT recommendation matches
  `Untitled`, not `Live Stream`.
- Phase 6 tooling: HALF DONE. `PRE-STREAM.md` checklist and `go-live.py`
  exist; `scripts/stream-ready.sh` is the new repeatable pre-live check
  (run it before every stream).

**Not verifiable from this repo (live-only, unchecked):**

- Phase 1 (accounts/keys) and Phase 2 (Aitum vs Restream vs multi-output):
  no `service.json` under `profiles/` and no Aitum config in the tree, so
  which simulcast option is live — and whether both destinations receive —
  is UNKNOWN until confirmed in the OBS app on the streaming machine.
- Phase 5 leftovers (hotkeys, noise suppression, mic levels) and Phase 6
  (test recording, private test stream): live-app state, unchecked.

**Known discrepancies / fragility:**

- RELAUNCH CLOBBER: worked around, NOT fixed. Sep 15 history
  (`4f48a0f` restore, `4b33ef9` consolidate) recovered session work, but the
  repo now carries THREE near-identical live collections (`Live Stream.json`,
  `Live-Stream.json`, `Untitled.json`) plus seven `.bak*` files. OBS loads
  one collection by name — picking the wrong copy (or another unclean quit)
  silently diverges them again. No automated backup/sync exists; `.bak` files
  are manual copies. A mid-stream OBS restart would load whichever copy was
  last written by the app, NOT necessarily the repo state.
- STALE INVENTORY: this repo has no `obs-aitum-multistream/`, no
  `obs-listener/`, no `pii_mask/`, no `Plans/`, and no root `package.json`
  (`.gitignore` still lists `source-obs/` and `obs-listener/`). Anything
  referencing those (e.g. `PRE-STREAM.md`'s `PiiMaskDaemon`/`pii` steps,
  quick-switcher README's `obs-listener` note) describes tooling that is not
  in this tree.
- `.go-live.env` is gitignored and absent here by design (per-machine
  credentials) — announcements are NOT runnable until the captain creates it
  from `go-live.py`'s expected variables. Its values must never be committed.
- Output resolution is 720p in both profiles vs the plan's 1080p;fps/encoder
  differ between the two profiles. Which profile is live is undetermined.

**Smallest next step:** confirm in the OBS app (a) which scene collection
and profile are active, (b) which Phase-2 simulcast option carries the two
destinations, then do one unlisted test stream to both platforms.
