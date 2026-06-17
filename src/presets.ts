/**
 * A curated set of ready-to-use Nuxt Image presets for the revenexx Storage
 * CDN. Spread them into your `nuxt.config` and reference by name:
 *
 * ```ts
 * import { presets } from '@revenexx/storage-nuxt-image'
 *
 * export default defineNuxtConfig({
 *   image: { provider: 'storage', presets },
 * })
 * ```
 *
 * ```vue
 * <NuxtImg preset="card" src="/uploads/photo.jpg" />
 * ```
 *
 * Nuxt expands a preset's options before the provider runs, so these use only
 * widely-available transforms (resize, crop, smart gravity, format, quality,
 * blur) and work on any CDN tier. Extend or override them freely.
 */
import type { TransformModifiers } from './types'

/**
 * A Nuxt Image preset: the standard options applied top-level plus any extra
 * {@link TransformModifiers} under `modifiers`. Mirrors `@nuxt/image`'s preset
 * shape without importing it.
 */
export interface ImagePreset {
  width?: number
  height?: number
  fit?: TransformModifiers['fit']
  format?: string
  quality?: number
  sizes?: string
  densities?: string
  modifiers?: TransformModifiers
}

export const presets: Record<string, ImagePreset> = {
  /** Small square crop for grids and lists. */
  thumbnail: {
    width: 150,
    height: 150,
    fit: 'cover',
    format: 'webp',
    quality: 75,
    modifiers: { gravity: 'sm' },
  },
  /** Round-ready square portrait, smart-cropped to the subject. */
  avatar: {
    width: 96,
    height: 96,
    fit: 'cover',
    format: 'webp',
    quality: 80,
    modifiers: { gravity: 'sm' },
  },
  /** 4:3 content card. */
  card: {
    width: 400,
    height: 300,
    fit: 'cover',
    format: 'webp',
    quality: 80,
    modifiers: { gravity: 'sm' },
  },
  /** Full-width hero / banner. */
  hero: {
    width: 1920,
    height: 1080,
    fit: 'cover',
    format: 'webp',
    quality: 82,
    modifiers: { gravity: 'sm' },
  },
  /** Open Graph / social share card (1200×630). */
  ogImage: {
    width: 1200,
    height: 630,
    fit: 'cover',
    format: 'jpg',
    quality: 85,
    modifiers: { gravity: 'sm' },
  },
  /** Tiny blurred LQIP placeholder to inline while the full image loads. */
  placeholder: {
    width: 32,
    format: 'webp',
    quality: 40,
    modifiers: { blur: 10 },
  },
}
