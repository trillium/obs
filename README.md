# OBS Streaming Setup

Streaming tools, scenes, overlays, and utilities for dual-streaming to YouTube and Twitch.

## Directory Layout

```
obs/
├── go-live.py          # Post go-live announcements (Bluesky, Twitter, Discord)
├── PRE-STREAM.md       # Pre-stream checklist (grow over time)
├── scripts/            # Local CLI tools (imessage toggle, etc.)
├── obs-listener/       # OBS WebSocket listener (Next.js app)
├── overlays/           # HTML overlays (starting-soon, be-right-back)
├── profiles/           # OBS profiles
├── scenes/             # OBS scene collections
└── GET_STREAMING_PLAN.md
```

## Tools

### `imessage` — Toggle iMessage for Streaming

Disables iMessage on this Mac by unregistering the `imagent` daemon via `launchctl`. Messages continue to arrive on other devices normally and will sync back when re-enabled.

```bash
imessage off      # Quit Messages.app, stop imagent daemon
imessage on       # Restart imagent daemon
imessage status   # Check if imagent is running
```

Installed to `~/bin/imessage` via symlink.

**How it works:** `launchctl bootout` fully unregisters the daemon so launchd won't respawn it (on crash, Mach port lookup, or distributed notification). `launchctl bootstrap` brings it back.

### `go-live.py` — Stream Announcements

Posts go-live messages to Bluesky, Twitter, and copies to clipboard for Discord.

```bash
python go-live.py                          # Default message from .go-live.env
python go-live.py "Custom message"         # Custom message
python go-live.py --dry-run                # Preview without posting
python go-live.py --skip bluesky           # Skip a platform
```

Requires `.go-live.env` with credentials (see `.go-live.env.example`).

## Firebot Overlays

Stream graphics (chat panel, alerts) come from Firebot's overlay system, not
individual web pages. One overlay *instance* = one OBS browser source
(1920x1080); widgets are laid out *inside* it with exact canvas coordinates.

### Manual path (in the Firebot app)

1. Sidebar **Overlays** → Manage Instances → Create New Instance, e.g.
   `Stream 1080p`. The instance URL is
   `http://localhost:7472/overlay/?instance=<Name>`.
2. Sidebar **Triggers → Overlay Widgets** → New Overlay Widget → type
   **Chat** (or Text/Image/Counter/Progress Bar), pick the instance, set exact
   **x/y/width/height**. Our side panel: `x=1440 y=270 w=480 h=810`.
3. In OBS add a browser source with the instance URL at 1920x1080, position
   (0,0). Verify with pixels: `SaveSourceScreenshot` on the source, plus a
   live message (chat widgets only render real Twitch events).

Docs: https://docs.firebot.app/v5/core/overlay-widgets

### File path (no UI — Firebot must be QUIT)

Firebot is open source (`crowbartools/Firebot`, cloned under
`third-party/`). Source-verified facts:

- No HTTP API exists for overlay/instance CRUD (`src/server/api/v1/` has
  effects, commands, counters… no overlays). The overlay page picks its
  instance from `?instance=<Name>` (`src/resources/overlay/js/main.js`).
- Instances are plain strings: `profiles/Main/settings.json →
  OverlayInstances: string[]`.
- Widgets are single records in `profiles/Main/overlay-widgets.json` keyed by
  id, shaped as `OverlayWidgetConfig`
  (`{id, name, type: "firebot:chat", active, position: {x,y,width,height},
  overlayInstance: "<Name>", settings: ChatWidgetSettings}` — see
  `src/types/overlay-widgets.ts` and
  `src/backend/overlay-widgets/builtin-types/chat/chat.ts`).
- Never write these files while Firebot runs (in-memory NeDB state wins).

Procedure: back up `profiles/Main/`, quit Firebot, append the instance name,
write the widget record, relaunch, check the instance URL → 200, swap OBS
sources, send a test message, screenshot-verify.

Live inventory: instance `Stream 1080p`, widget `Side Panel Chat`
(`firebot:chat`, compact, badges, 25s auto-remove) → OBS source
`Firebot Stream Overlay` in `[1080p] Screen + Side`.

## Pre-Stream Checklist

See [PRE-STREAM.md](PRE-STREAM.md).
