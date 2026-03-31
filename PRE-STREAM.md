# Pre-Stream Checklist

Run through before every stream.

## Notifications

- [ ] `imessage off` — disable iMessage on this Mac
- [ ] Enable Do Not Disturb (Focus mode) for remaining apps

## PII Mask

- [ ] Start daemon: `PiiMaskDaemon` (or verify already running)
- [ ] `pii diag` — confirm daemon alive, full_mask off, shm fresh
- [ ] `pii show` — review safe/masked windows, verify nothing sensitive is SHOW

## OBS

- [ ] Open OBS, verify correct scene collection is loaded
- [ ] Check audio levels — mic peaking around -10 to -20 dB
- [ ] Verify webcam framing
- [ ] Confirm stream keys are set for all platforms

## Announcements

- [ ] `python go-live.py --dry-run` — preview announcement
- [ ] Go live, then `python go-live.py` to post

## Post-Stream

- [ ] `imessage on` — re-enable iMessage
- [ ] Disable Do Not Disturb
