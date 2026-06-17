---
"@revenexx/storage-nuxt-image": minor
---

Initial release: Nuxt Image provider for the revenexx Storage CDN.

- Query-style `/cdn/` URLs with bring-your-own-domain (relative URLs) support.
- Full transform surface: resize, crop, smart & focus-point gravity, colour
  adjustments, blur/sharpen, watermarks, format/quality, presets, and a raw
  `opts` escape hatch.
- Standard Nuxt modifiers mapped automatically; ergonomic structured options.
- Ready-made presets (`thumbnail`, `avatar`, `card`, `hero`, `ogImage`,
  `placeholder`) and a typed watermark API.
- Framework-agnostic `buildImageUrl` builder (no Nuxt required).
