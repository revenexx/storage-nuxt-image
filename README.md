# @revenexx/storage-nuxt-image

> Nuxt Image provider for the **revenexx Storage CDN** — build optimized, on-the-fly images straight from your own domain's `/cdn/` endpoint.

[![npm version](https://img.shields.io/npm/v/@revenexx/storage-nuxt-image?color=2B90B6)](https://www.npmjs.com/package/@revenexx/storage-nuxt-image)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

- 🌐 **Bring your own domain.** Images are served from *your* site (`https://my-shop.com/cdn/…`), not a third-party host. Leave the base URL empty and URLs stay relative, so the same build works on every customer domain automatically.
- 🪄 **`/cdn/` is appended for you.** Point your images at a path or URL; the provider routes them through the edge.
- 🧰 **Rich transformations.** Resize, crop, smart/focus-point gravity, watermarks, adjustments, trimming, format/quality, presets, signing — plus a raw escape hatch for anything else.
- 📐 **Native Nuxt modifiers.** `width`, `height`, `fit`, `format`, `quality`, `background` are mapped automatically — drop it into `<NuxtImg>` / `<NuxtPicture>` and go.
- 🪶 **Tiny & isomorphic.** Works on server and client. Ships ESM + types. Also usable standalone (no Nuxt required) via the URL builder.

---

## Installation

```bash
npm install @revenexx/storage-nuxt-image
# or: pnpm add @revenexx/storage-nuxt-image / yarn add @revenexx/storage-nuxt-image
```

You'll also need [`@nuxt/image`](https://image.nuxt.com) in your Nuxt app:

```bash
npx nuxi module add image
```

## Quick start

Register the provider in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/image'],
  image: {
    // make it the default provider (optional)
    provider: 'storage',
    providers: {
      storage: {
        provider: '@revenexx/storage-nuxt-image',
        options: {
          // Leave empty to emit relative URLs (recommended — see "Bring your
          // own domain" below), or set your domain explicitly:
          // baseURL: 'https://my-shop.com',
        },
      },
    },
  },
})
```

Use it in a component:

```vue
<template>
  <!-- provider="storage" is unnecessary if you set it as the default above -->
  <NuxtImg provider="storage" src="/uploads/hero.jpg" width="800" height="450" fit="cover" format="webp" />
</template>
```

Rendered URL:

```
/cdn/insecure/w:800/h:450/rt:fill/plain/uploads/hero.jpg@webp
```

The browser resolves that relative URL against the current site, so on `my-shop.com` it becomes `https://my-shop.com/cdn/…`, where the revenexx edge serves the optimized image.

## Bring your own domain

Many sites run on their own domain (`my-shop.com`) that points at the revenexx edge, which exposes image processing under `/cdn/`. You have two ways to target it:

**1. Relative URLs (recommended for multi-domain / white-label).** Leave `baseURL` empty. The provider emits `/cdn/…`, which the browser resolves against whatever origin serves the page. One build, every domain — no per-tenant configuration.

**2. Absolute URLs.** Set `baseURL` to pin a specific origin (useful for SSR, emails, sitemaps, or when images live on a different host than the app):

```ts
options: { baseURL: 'https://my-shop.com' }
```

Make it dynamic with runtime config (e.g. one deployment serving many domains):

```ts
// nuxt.config.ts
runtimeConfig: { public: { siteUrl: '' } }, // set per environment

image: {
  providers: {
    storage: {
      provider: '@revenexx/storage-nuxt-image',
      options: { baseURL: process.env.NUXT_PUBLIC_SITE_URL || '' },
    },
  },
},
```

The `/cdn/` segment is always appended automatically. Change it with `cdnPath` (or set `cdnPath: ''` to disable).

## Modifiers

Standard Nuxt Image modifiers work out of the box and are translated for the CDN:

| Nuxt modifier | CDN option      | Notes                                                        |
| ------------- | --------------- | ------------------------------------------------------------ |
| `width`       | `w`             |                                                              |
| `height`      | `h`             |                                                              |
| `fit`         | `rt` (resizing) | `cover→fill`, `contain→fit`, `fill→force`, `inside→fit`, `outside→fill` |
| `format`      | extension       | `webp`, `avif`, `jpg`, `png`, … (appended as `…@webp`)        |
| `quality`     | `q`             | `0`–`100`                                                    |
| `background`  | `bg`            | `'ffffff'` or `[r, g, b]`                                     |

```vue
<NuxtImg src="/uploads/p.jpg" :width="600" :modifiers="{ gravity: 'sm', quality: 82, blur: 3 }" />
```

### Advanced transformations

The full transformation surface is available through `:modifiers`. Structured options accept ergonomic objects:

```vue
<NuxtImg
  src="/uploads/p.jpg"
  :modifiers="{
    resize: { type: 'fill', width: 1200, height: 630, enlarge: true },
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

See **[docs/transformations.md](./docs/transformations.md)** for the complete option reference. Anything not modelled can be passed verbatim:

```ts
{ rawOptions: ['gradient:0.5:1:0', 'some-future-option:value'] }
```

## Programmatic / standalone usage

You don't need Nuxt to build URLs — import the framework-agnostic builder:

```ts
import { buildImageUrl } from '@revenexx/storage-nuxt-image/builder'

buildImageUrl('/uploads/a.jpg', { width: 400, format: 'webp' }, { baseURL: 'https://my-shop.com' })
// → 'https://my-shop.com/cdn/insecure/w:400/plain/uploads/a.jpg@webp'
```

Great for `<img>` tags in plain Vue/React, Open Graph image URLs, emails, or back-end services.

## Source encoding

| `encode`           | Output                          | When to use                                                       |
| ------------------ | ------------------------------- | ----------------------------------------------------------------- |
| `'plain'` (default) | `…/plain/uploads/a.jpg`         | Readable URLs; relative sources resolved by the edge's base URL.  |
| `'base64'`          | `…/aHR0cHM6Ly8…`                | Absolute source URLs with query strings or special characters.    |

```ts
options: { encode: 'base64' }
```

## Signing

Behind the revenexx edge, image URLs are typically **unsigned at the app layer** — the edge handles request security and signing itself, and the provider emits an `insecure` marker segment. That's the default, and nothing is required from you.

If you operate your own image backend and want signed URLs:

```ts
options: {
  key: process.env.CDN_SIGN_KEY!,   // hex
  salt: process.env.CDN_SIGN_SALT!, // hex
  // signatureSize: 32,             // optional truncation
}
```

> ⚠️ **Security:** A Nuxt image provider runs in the browser too, so configuring `key`/`salt` here ships your signing secret to the client. Prefer signing **at the edge**. Use in-provider signing only for server-only rendering or the standalone builder. To omit the signature segment entirely (edge injects it), set `signature: false`.

## Options reference

| Option          | Type                                  | Default       | Description                                                      |
| --------------- | ------------------------------------- | ------------- | ---------------------------------------------------------------- |
| `baseURL`       | `string`                              | `''`          | Origin to prefix. Empty → relative URLs (bring your own domain). |
| `cdnPath`       | `string`                              | `'/cdn/'`     | Path that routes to the edge. `''` disables it.                  |
| `encode`        | `'plain' \| 'base64'`                 | `'plain'`     | How the source is encoded into the URL.                          |
| `signature`     | `string \| false`                     | `'insecure'`  | Signature segment; `false` omits it.                             |
| `key` / `salt`  | `string` (hex)                        | —             | Enable HMAC-SHA256 signing (see caveat above).                   |
| `signatureSize` | `number`                              | full          | Truncate the signature to N bytes.                               |

## TypeScript

Fully typed. Import the public types when you need them:

```ts
import type { TransformModifiers, ProviderOptions } from '@revenexx/storage-nuxt-image'
```

## How it works

```
<NuxtImg src="/uploads/a.jpg" width="800" format="webp" />
        │
        ▼  getImage(src, { modifiers, ...options })
@revenexx/storage-nuxt-image
        │  builds a transformation URL
        ▼
/cdn/insecure/w:800/rt:fill/plain/uploads/a.jpg@webp
        │  browser requests it from your domain
        ▼
my-shop.com  ──►  revenexx edge  ──►  optimized image (cached)
```

## License

[MIT](./LICENSE) © revenexx
