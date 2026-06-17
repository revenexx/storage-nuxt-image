# @revenexx/storage-nuxt-image

> Nuxt Image provider for the **revenexx Storage CDN** — build optimized, on-the-fly images straight from your own domain's `/cdn/` endpoint.

[![npm version](https://img.shields.io/npm/v/@revenexx/storage-nuxt-image?color=2B90B6)](https://www.npmjs.com/package/@revenexx/storage-nuxt-image)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

- 🌐 **Bring your own domain.** Images are served from *your* site (`https://my-shop.com/cdn/…`), not a third-party host. Leave the base URL empty and URLs stay relative, so the same build works on every customer domain automatically.
- 🪄 **`/cdn/` is appended for you.** Point your images at a path; the provider routes them through the edge.
- 🧰 **Rich transformations.** Resize, crop, smart/focus-point gravity, watermarks, adjustments, trimming, format/quality, presets — expressed as clean query params.
- 🔒 **Safe by design.** Transforms are plain query params; the CDN validates, clamps and **signs them server-side** — your app never handles signing keys or crafts raw transforms.
- 📐 **Native Nuxt modifiers.** `width`, `height`, `fit`, `format`, `quality`, `background` map automatically — drop it into `<NuxtImg>` / `<NuxtPicture>` and go.
- 🪶 **Tiny & isomorphic.** One dependency (`ufo`), works on server and client, ships ESM + types. Also usable standalone (no Nuxt) via the URL builder.

---

## Installation

```bash
npm install @revenexx/storage-nuxt-image
# or: pnpm add @revenexx/storage-nuxt-image / yarn add @revenexx/storage-nuxt-image
```

You'll also need [`@nuxt/image`](https://image.nuxt.com):

```bash
npx nuxi module add image
```

## Quick start

Register the provider in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/image'],
  image: {
    provider: 'storage', // make it the default (optional)
    providers: {
      storage: {
        provider: '@revenexx/storage-nuxt-image',
        options: {
          // Leave empty for relative URLs (recommended — see "Bring your own
          // domain"), or pin a domain: baseURL: 'https://my-shop.com',
        },
      },
    },
  },
})
```

Use it in a component:

```vue
<template>
  <NuxtImg provider="storage" src="/sftp-imports/header.jpg" width="800" height="450" fit="cover" format="webp" />
</template>
```

Rendered URL:

```
/cdn/sftp-imports/header.jpg?w=800&h=450&fit=cover&fm=webp
```

The browser resolves that relative URL against the current site, so on `my-shop.com` it becomes `https://my-shop.com/cdn/…`, where the revenexx edge serves (and caches) the optimized image.

## Bring your own domain

Many sites run on their own domain (`my-shop.com`) pointed at the revenexx edge, which exposes image processing under `/cdn/`. Two ways to target it:

**1. Relative URLs (recommended for multi-domain / white-label).** Leave `baseURL` empty. The provider emits `/cdn/…`, resolved by the browser against whatever origin serves the page. One build, every domain — no per-tenant configuration.

**2. Absolute URLs.** Set `baseURL` to pin a specific origin (SSR, emails, sitemaps, or images on a different host):

```ts
options: { baseURL: 'https://my-shop.com' }
```

The `/cdn/` segment is always appended automatically — change it with `cdnPath` (or `cdnPath: ''` to disable).

## Modifiers

Standard Nuxt Image modifiers work out of the box:

| Nuxt modifier | Query param | Notes                                                        |
| ------------- | ----------- | ------------------------------------------------------------ |
| `width`       | `w`         |                                                              |
| `height`      | `h`         |                                                              |
| `fit`         | `fit`       | `cover` / `contain` / `fill` / `inside` / `outside`          |
| `format`      | `fm`        | `webp`, `avif`, `jpg`, `png`, `gif`                          |
| `quality`     | `q`         | `0`–`100`                                                    |
| `background`  | `background`| `'ffffff'` or `[r, g, b]`                                     |

```vue
<NuxtImg src="/sftp-imports/p.jpg" :width="600" :modifiers="{ gravity: 'sm', quality: 82, blur: 3 }" />
<!-- /cdn/sftp-imports/p.jpg?w=600&gravity=sm&blur=3&q=82 -->
```

### Advanced transformations

The richer set is available through `:modifiers`; structured options accept ergonomic objects:

```vue
<NuxtImg
  src="/sftp-imports/p.jpg"
  :modifiers="{
    gravity: { type: 'fp', x: 0.5, y: 0.35 },   // focus point
    crop: { width: 1000, height: 1000, gravity: 'sm' },
    adjust: { brightness: 10, contrast: 0.9, saturation: 1.1 },
    watermark: { opacity: 0.4, position: 'soea', x: 16, y: 16, scale: 0.15 },
    trim: { threshold: 10, color: 'ffffff' },
    padding: { top: 20, bottom: 20 },
    quality: 80,
    stripMetadata: true,
    preset: ['sharp'],
  }"
/>
```

See **[docs/transformations.md](./docs/transformations.md)** for the complete reference. Anything not modelled can be passed verbatim via the escape hatch:

```ts
{ rawOptions: ['gr:0.5:1:0'] } // → ?opts=gr:0.5:1:0
```

## Presets

Define reusable transform bundles once and reference them by name. Ship-ready
presets are included — spread them into your config:

```ts
import { presets } from '@revenexx/storage-nuxt-image'

export default defineNuxtConfig({
  image: {
    provider: 'storage',
    presets, // thumbnail, avatar, card, hero, ogImage, placeholder
  },
})
```

```vue
<NuxtImg preset="card" src="/uploads/photo.jpg" />
<NuxtImg preset="avatar" src="/uploads/user.jpg" />
```

| Preset        | Output                         |
| ------------- | ------------------------------ |
| `thumbnail`   | 150×150, smart crop, webp      |
| `avatar`      | 96×96, smart crop, webp        |
| `card`        | 400×300, smart crop, webp      |
| `hero`        | 1920×1080, smart crop, webp    |
| `ogImage`     | 1200×630 social card, jpg      |
| `placeholder` | 32px blurred LQIP, webp        |

Add your own alongside them, or override:

```ts
image: {
  presets: {
    ...presets,
    banner: { width: 1600, height: 400, fit: 'cover', format: 'webp', quality: 80 },
  },
}
```

> Presets expand to modifiers in Nuxt **before** the request, so they work on
> any CDN tier. (A CDN-side `preset` modifier also exists for server-defined
> presets — see the transformation reference.)

## Watermarks

Overlay the watermark configured on your CDN. The shorthand sets opacity; the
object form adds position, offset and scale:

```vue
<NuxtImg src="/uploads/photo.jpg" :modifiers="{ watermark: 0.4 }" />

<NuxtImg
  src="/uploads/photo.jpg"
  :modifiers="{ watermark: { opacity: 0.4, position: 'soea', x: 16, y: 16, scale: 0.15 } }"
/>
```

`position` is one of `ce no so ea we noea nowe soea sowe re` (`re` tiles it).

> The watermark image itself is configured on the CDN; this modifier controls
> how it is applied.

## Programmatic / standalone usage

No Nuxt needed — import the builder:

```ts
import { buildImageUrl } from '@revenexx/storage-nuxt-image/builder'

buildImageUrl('/sftp-imports/a.jpg', { width: 400, format: 'webp' }, { baseURL: 'https://my-shop.com' })
// → 'https://my-shop.com/cdn/sftp-imports/a.jpg?w=400&fm=webp'
```

Great for plain `<img>` tags, Open Graph image URLs, emails, or back-end services.

## Signing & security

You don't sign anything. Transforms are ordinary query params; the revenexx edge validates and clamps them, then signs the upstream transform request **server-side**. That keeps signing keys off the client and prevents abusive/arbitrary transforms — by design.

## Options reference

| Option    | Type     | Default   | Description                                                      |
| --------- | -------- | --------- | ---------------------------------------------------------------- |
| `baseURL` | `string` | `''`      | Origin to prefix. Empty → relative URLs (bring your own domain). |
| `cdnPath` | `string` | `'/cdn/'` | Path that routes to the edge. `''` disables it.                  |

## TypeScript

Fully typed:

```ts
import type { TransformModifiers, ProviderOptions } from '@revenexx/storage-nuxt-image'
```

## How it works

```
<NuxtImg src="/sftp-imports/a.jpg" width="800" format="webp" />
        │
        ▼  getImage(src, { modifiers, ...options })
@revenexx/storage-nuxt-image
        │  builds a query URL
        ▼
/cdn/sftp-imports/a.jpg?w=800&fm=webp
        │  browser requests it from your domain
        ▼
my-shop.com  ──►  revenexx edge  ──►  optimized image (cached)
```

## License

[MIT](./LICENSE) © revenexx
