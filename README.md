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

## Pre-Stream Checklist

See [PRE-STREAM.md](PRE-STREAM.md).
