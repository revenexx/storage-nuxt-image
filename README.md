<div align="center">

# @revenexx/storage-nuxt-image

**The Nuxt Image provider for the revenexx Storage CDN.**
Optimized, on-the-fly images straight from *your own domain's* `/cdn/` endpoint — resize, crop, smart gravity, format negotiation, colour grading, watermarks and presets, all as clean query params.

[![npm version](https://img.shields.io/npm/v/@revenexx/storage-nuxt-image?color=2B90B6)](https://www.npmjs.com/package/@revenexx/storage-nuxt-image)
[![npm downloads](https://img.shields.io/npm/dm/@revenexx/storage-nuxt-image?color=2B90B6)](https://www.npmjs.com/package/@revenexx/storage-nuxt-image)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

</div>

---

## Why

- 🌐 **Bring your own domain.** Images are served from *your* site (`https://my-shop.com/cdn/…`), not a third-party host. Leave the base URL empty and URLs stay relative — the **same build works on every customer domain** automatically.
- 🪄 **`/cdn/` is appended for you.** Point images at a path; the provider routes them through the edge.
- 🧰 **The full transform surface.** Resize, crop, smart & focus-point gravity, colour adjustments, blur/sharpen, watermarks, format/quality, presets — and a raw escape hatch for everything else.
- 📐 **Native Nuxt modifiers.** `width`, `height`, `fit`, `format`, `quality`, `background` map automatically. Works with `<NuxtImg>`, `<NuxtPicture>` and `$img`.
- 🎨 **Batteries included.** Ready-made presets (`thumbnail`, `avatar`, `card`, `hero`, `ogImage`, `placeholder`) and a typed watermark API.
- 🔒 **Safe by design.** Transforms are plain query params; the CDN validates, clamps and **signs them server-side** — your app never handles signing keys.
- 🪶 **Tiny & isomorphic.** One dependency (`ufo`), runs on server and client, ships ESM + types. Also usable **without Nuxt** via the URL builder.

## Contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Bring your own domain](#bring-your-own-domain)
- [Usage](#usage) · [`<NuxtImg>`](#nuxtimg) · [`<NuxtPicture>`](#nuxtpicture-responsive--multi-format) · [`$img` composable](#img-composable)
- [Modifiers](#modifiers)
- [Presets](#presets)
- [Watermarks](#watermarks)
- [Recipes](#recipes)
- [Programmatic / standalone](#programmatic--standalone-usage)
- [Security & signing](#security--signing)
- [TypeScript](#typescript)
- [How it works](#how-it-works)
- [Troubleshooting](#troubleshooting)

## Installation

```bash
npm i @revenexx/storage-nuxt-image        # or pnpm add / yarn add
npx nuxi module add image                 # @nuxt/image (peer)
```

## Quick start

```ts
// nuxt.config.ts
import { presets } from '@revenexx/storage-nuxt-image'

export default defineNuxtConfig({
  modules: ['@nuxt/image'],
  image: {
    provider: 'storage',          // make it the default (optional)
    presets,                      // ship-ready presets (optional)
    providers: {
      storage: {
        provider: '@revenexx/storage-nuxt-image',
        options: {
          // Empty → relative URLs (recommended, see below). Or pin a domain:
          // baseURL: 'https://my-shop.com',
        },
      },
    },
  },
})
```

```vue
<template>
  <NuxtImg src="/sftp-imports/header.jpg" width="800" height="450" fit="cover" format="webp" />
</template>
```

→ `/cdn/sftp-imports/header.jpg?w=800&h=450&fit=cover&fm=webp`

The browser resolves that relative URL against the current site, so on
`my-shop.com` it becomes `https://my-shop.com/cdn/…`, where the revenexx edge
serves (and caches) the optimized image.

## Bring your own domain

Sites run on their own domain pointed at the revenexx edge, which exposes image
processing under `/cdn/`. Two ways to target it:

1. **Relative URLs (recommended, multi-domain / white-label).** Leave `baseURL`
   empty → the provider emits `/cdn/…`, resolved against whatever origin serves
   the page. **One build, every domain — zero per-tenant config.**
2. **Absolute URLs.** Set `baseURL` to pin an origin (SSR, emails, sitemaps, or
   images on a different host):

   ```ts
   options: { baseURL: 'https://my-shop.com' }
   ```

`/cdn/` is always appended — change it with `cdnPath` (or `cdnPath: ''` to disable).

## Usage

### `<NuxtImg>`

```vue
<!-- standard modifiers as props -->
<NuxtImg src="/uploads/p.jpg" width="600" height="400" fit="cover" format="webp" quality="80" />

<!-- richer transforms via :modifiers -->
<NuxtImg src="/uploads/p.jpg" :width="600" :modifiers="{ gravity: 'sm', blur: 3 }" />

<!-- a named preset -->
<NuxtImg preset="card" src="/uploads/p.jpg" />
```

### `<NuxtPicture>` (responsive & multi-format)

`<NuxtPicture>` emits a `<picture>` with multiple `<source>`s — perfect for
serving AVIF with a WebP fallback and the right size per viewport:

```vue
<NuxtPicture
  src="/uploads/hero.jpg"
  format="avif,webp"
  sizes="sm:100vw md:50vw lg:1200px"
  :modifiers="{ gravity: 'sm' }"
/>
```

### `$img` composable

Need the URL itself (CSS background, `<meta>` tags, canvas)?

```vue
<script setup lang="ts">
const img = useImage()
const bg = img('/uploads/p.jpg', { width: 1600, format: 'webp' }, { provider: 'storage' })
</script>

<template>
  <section :style="{ backgroundImage: `url(${bg})` }" />
</template>
```

## Modifiers

Standard Nuxt modifiers map automatically:

| Modifier     | Query param  | Notes                                                |
| ------------ | ------------ | ---------------------------------------------------- |
| `width`      | `w`          |                                                      |
| `height`     | `h`          |                                                      |
| `fit`        | `fit`        | `cover` · `contain` · `fill` · `inside` · `outside`  |
| `format`     | `fm`         | `webp`, `avif`, `jpg`, `png`, `gif`                  |
| `quality`    | `q`          | `0`–`100`                                            |
| `background` | `background` | `'ffffff'` or `[r, g, b]`                            |

The richer set (gravity, crop, adjust, blur/sharpen, trim, padding, rotate,
watermark, …) goes through `:modifiers`; structured options take ergonomic
objects:

```vue
<NuxtImg
  src="/uploads/p.jpg"
  :modifiers="{
    gravity: { type: 'fp', x: 0.5, y: 0.35 },   // focus point
    crop: { width: 1000, height: 1000, gravity: 'sm' },
    adjust: { brightness: 10, contrast: 0.9, saturation: 1.1 },
    quality: 80,
    stripMetadata: true,
  }"
/>
```

👉 **Full list with every option, value shape and example:
[docs/transformations.md](./docs/transformations.md).**

Anything not modelled? Use the escape hatch:

```ts
{ rawOptions: ['gr:0.5:1:0'] } // → ?opts=gr:0.5:1:0
```

## Presets

Define transform bundles once, reference them by name. Ship-ready presets are
included — spread them into `image.presets`:

```ts
import { presets } from '@revenexx/storage-nuxt-image'
export default defineNuxtConfig({ image: { provider: 'storage', presets } })
```

```vue
<NuxtImg preset="card" src="/uploads/photo.jpg" />
```

| Preset        | Output                       |
| ------------- | ---------------------------- |
| `thumbnail`   | 150×150, smart crop, webp    |
| `avatar`      | 96×96, smart crop, webp      |
| `card`        | 400×300, smart crop, webp    |
| `hero`        | 1920×1080, smart crop, webp  |
| `ogImage`     | 1200×630 social card, jpg    |
| `placeholder` | 32px blurred LQIP, webp      |

Extend or override:

```ts
image: {
  presets: {
    ...presets,
    banner: { width: 1600, height: 400, fit: 'cover', format: 'webp', quality: 80 },
  },
}
```

> These are **Nuxt** presets — they expand to modifiers before the request, so
> they work on any CDN tier.

## Watermarks

Overlay the watermark configured on your CDN. Shorthand sets opacity; the object
form adds position, offset and scale:

```vue
<NuxtImg src="/uploads/photo.jpg" :modifiers="{ watermark: 0.4 }" />

<NuxtImg
  src="/uploads/photo.jpg"
  :modifiers="{ watermark: { opacity: 0.4, position: 'soea', x: 16, y: 16, scale: 0.15 } }"
/>
```

`position` ∈ `ce no so ea we noea nowe soea sowe re` (`re` tiles it). The
watermark image itself is configured on the CDN; this modifier controls how it
is applied.

## Recipes

Common real-world patterns — responsive hero, LQIP blur-up placeholder, avatars,
Open Graph images, CSS backgrounds, art direction — are collected in the
**[cookbook → docs/recipes.md](./docs/recipes.md)**.

## Programmatic / standalone usage

No Nuxt required — import the builder:

```ts
import { buildImageUrl } from '@revenexx/storage-nuxt-image/builder'

buildImageUrl('/uploads/a.jpg', { width: 400, format: 'webp' }, { baseURL: 'https://my-shop.com' })
// → 'https://my-shop.com/cdn/uploads/a.jpg?w=400&fm=webp'
```

Great for plain `<img>` tags, Open Graph URLs, emails, RSS, or back-end services.

## Security & signing

You don't sign anything. Transforms are ordinary query params; the revenexx edge
validates and clamps them, then signs the upstream transform request
**server-side**. That keeps signing keys off the client and prevents
abusive/arbitrary transforms — by design. (Private assets use short-lived signed
delivery URLs minted by the storage API.)

## TypeScript

Fully typed. Import the public types when you need them:

```ts
import type {
  TransformModifiers, ProviderOptions, ImagePreset, WatermarkPosition,
} from '@revenexx/storage-nuxt-image'
```

### API

| Export              | Kind     | Description                                          |
| ------------------- | -------- | ---------------------------------------------------- |
| `default`           | provider | The Nuxt Image provider (point `provider` here).     |
| `getImage`          | function | The provider's `getImage(src, ctx)`.                 |
| `buildImageUrl`     | function | Framework-agnostic URL builder (also at `/builder`). |
| `serializeModifiers`| function | Modifiers → query string.                            |
| `presets`           | object   | Ready-made Nuxt Image presets.                       |
| types               | —        | `TransformModifiers`, `ProviderOptions`, `ImagePreset`, `WatermarkPosition`, `Gravity`, `Crop`, `Adjust`, `Trim`, `Watermark`, … |

### Provider options

| Option    | Type     | Default   | Description                                     |
| --------- | -------- | --------- | ----------------------------------------------- |
| `baseURL` | `string` | `''`      | Origin to prefix. Empty → relative URLs.        |
| `cdnPath` | `string` | `'/cdn/'` | Path that routes to the edge. `''` disables it. |

## How it works

```
<NuxtImg src="/uploads/a.jpg" width="800" format="webp" />
        │  getImage(src, { modifiers, ...options })
        ▼
@revenexx/storage-nuxt-image   →   /cdn/uploads/a.jpg?w=800&fm=webp
        │  browser requests it from your domain
        ▼
my-shop.com → revenexx edge → (signed, server-side) → optimized image (cached)
```

## Troubleshooting

- **Image isn't transformed (original served).** The path must resolve to an
  asset on the CDN, and at least one modifier must be present. Check the
  generated `<img src>` in devtools.
- **A modifier seems ignored / errors.** Some transforms require a CDN tier or
  source type (e.g. `page` needs a multi-page source). Verify against
  [docs/transformations.md](./docs/transformations.md). Unknown params are
  ignored by the CDN.
- **URLs point at the wrong host.** Set `baseURL` (or leave it empty for
  relative URLs) — see [Bring your own domain](#bring-your-own-domain).
- **Provider not found.** Ensure `@nuxt/image` is installed and the provider is
  registered under `image.providers` with `provider: '@revenexx/storage-nuxt-image'`.

## Requirements

- Nuxt 3/4 with `@nuxt/image` v1 or v2 (peer; optional for standalone builder use).
- Node ≥ 18.

## License

[MIT](./LICENSE) © revenexx
