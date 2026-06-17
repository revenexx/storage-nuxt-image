# Cookbook

Real-world patterns with `@revenexx/storage-nuxt-image`. All examples assume the
provider is registered (and set as default) — see the [README](../README.md).

## Responsive hero

Serve AVIF (with WebP fallback) at the right size per breakpoint, smart-cropped:

```vue
<NuxtPicture
  src="/uploads/hero.jpg"
  format="avif,webp"
  sizes="sm:100vw md:100vw lg:1600px"
  :modifiers="{ gravity: 'sm', quality: 80 }"
  :img-attrs="{ class: 'hero', alt: 'Welcome' }"
/>
```

## Blur-up placeholder (LQIP)

Use the `placeholder` preset (32px, blurred) as a lightweight preview while the
full image loads. Nuxt Image's built-in `placeholder` prop pairs well:

```vue
<NuxtImg
  src="/uploads/photo.jpg"
  width="1200"
  format="webp"
  :placeholder="[32, 18, 40, 10]"  
/>
```

Or build the tiny preview URL yourself:

```ts
import { buildImageUrl } from '@revenexx/storage-nuxt-image/builder'
const lqip = buildImageUrl('/uploads/photo.jpg', { width: 32, blur: 10, format: 'webp' })
```

## Avatars

Square, smart-cropped to the face, rounded via CSS:

```vue
<NuxtImg preset="avatar" src="/uploads/user.jpg" class="rounded-full" alt="" />
```

Or with a focus point if you know where the subject is:

```vue
<NuxtImg
  src="/uploads/user.jpg"
  :width="96" :height="96" fit="cover"
  :modifiers="{ gravity: { type: 'fp', x: 0.5, y: 0.3 }, format: 'webp' }"
/>
```

## Open Graph / social card

Generate a 1200×630 card URL for `<meta property="og:image">`:

```vue
<script setup lang="ts">
const img = useImage()
const ogImage = img('/uploads/cover.jpg', {}, { provider: 'storage', preset: 'ogImage' })
useSeoMeta({ ogImage })
</script>
```

Standalone (e.g. in a Nitro route):

```ts
import { buildImageUrl } from '@revenexx/storage-nuxt-image/builder'
const ogImage = buildImageUrl('/uploads/cover.jpg',
  { width: 1200, height: 630, fit: 'cover', gravity: 'sm', format: 'jpg', quality: 85 },
  { baseURL: 'https://my-shop.com' })
```

## CSS background image

```vue
<script setup lang="ts">
const img = useImage()
const url = img('/uploads/bg.jpg', { width: 1920, format: 'webp', quality: 75 }, { provider: 'storage' })
</script>

<template>
  <section :style="{ backgroundImage: `url('${url}')` }" />
</template>
```

## Art direction (different crops per viewport)

```vue
<picture>
  <source media="(max-width: 640px)" :srcset="img('/uploads/p.jpg', { width: 640, height: 800, fit: 'cover', gravity: 'sm', format: 'webp' }, { provider: 'storage' })" />
  <NuxtImg src="/uploads/p.jpg" :width="1600" :height="600" fit="cover" :modifiers="{ gravity: 'sm' }" format="webp" />
</picture>
```

## Gallery thumbnails

```vue
<NuxtImg v-for="p in photos" :key="p.id" preset="thumbnail" :src="p.path" :alt="p.alt" loading="lazy" />
```

## Colour grading (Pro)

```vue
<NuxtImg
  src="/uploads/p.jpg"
  :width="800"
  :modifiers="{ adjust: { brightness: 8, contrast: 0.95, saturation: 1.15 }, format: 'webp' }"
/>

<!-- monochrome -->
<NuxtImg src="/uploads/p.jpg" :width="800" :modifiers="{ monochrome: true }" />
```

## Watermarked downloads

```vue
<NuxtImg
  src="/uploads/proof.jpg"
  :width="1200"
  :modifiers="{ watermark: { opacity: 0.35, position: 'soea', x: 16, y: 16, scale: 0.15 } }"
/>
```

## Rounded corners (style)

`style` takes plain CSS; output as PNG to keep the transparency:

```vue
<NuxtImg src="/uploads/p.jpg" :width="400" format="png" :modifiers="{ style: 'border-radius:24px' }" />
```

## High-DPR / retina

```vue
<NuxtImg src="/uploads/p.jpg" :width="400" :modifiers="{ dpr: 2 }" />
```

(Nuxt Image also generates `densities` automatically for `<NuxtImg>`/`<NuxtPicture>`;
`dpr` is there when you build URLs by hand.)

---

See **[transformations.md](./transformations.md)** for the complete option
reference.
