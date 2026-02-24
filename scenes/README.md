# OBS Scene Collections

- `Untitled.json` — Primary scene collection (used on streaming desktop)
- `macbook-pro-scenes.json` — Scene collection from MacBook Pro, includes blur scene variants

## Blur Scenes (from macbook-pro-scenes)

The blur effect works by downscaling a display capture to a tiny resolution (160x90 or 320x180) via OBS's built-in Scale/Aspect Ratio filter with "point" sampling, then scaling the source up 6x-12x in the scene. No plugins required.

### Note: Dynamic Mask

The `Display Capture LEFT BLUR` source uses an Image Mask/Blend filter that references a PNG file (`left_mask.png`). This mask is **dynamically generated/updated at runtime** — it is not a static asset. On the MacBook Pro it lives at `~/Downloads/left_mask.png`. When porting to another machine, ensure whatever generates the mask is also set up and the path in the OBS filter config is updated to match.
