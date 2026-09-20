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
