/**
 * `@revenexx/storage-nuxt-image/builder`
 *
 * Framework-agnostic image-transformation URL builder for the revenexx Storage
 * CDN. Use it directly anywhere (server scripts, Vue/React, tests) — the Nuxt
 * Image provider is a thin wrapper around {@link buildImageUrl}.
 */
import { joinURL } from 'ufo'
import { serializeModifiers } from './serialize'
import type { ProviderOptions, TransformModifiers } from './types'

export type {
  Adjust,
  Color,
  Crop,
  Gravity,
  GravityType,
  Padding,
  ProviderOptions,
  Resize,
  ResizingType,
  TransformModifiers,
  Trim,
  Watermark,
} from './types'
export { serializeModifiers } from './serialize'

const DEFAULT_CDN_PATH = '/cdn/'

/** True for absolute (`https://…`) or protocol-relative (`//…`) sources. */
function isAbsolute(src: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(src) || src.startsWith('//')
}

/**
 * Normalize a relative source so it joins cleanly: a single leading slash is
 * dropped (`/uploads/a.jpg` → `uploads/a.jpg`). Absolute URLs are untouched.
 */
function normalizeSource(src: string): string {
  return isAbsolute(src) ? src : src.replace(/^\/+/, '')
}

/**
 * Build a CDN URL for `src` with the given `modifiers`.
 *
 * The result is `<baseURL><cdnPath><source>?<query>`, e.g.
 * `https://my-shop.com/cdn/uploads/a.jpg?w=300&fit=cover&fm=webp`. The CDN
 * translates the query into the actual transform, clamps abusive values and
 * signs the request server-side — clients never sign or craft raw transforms.
 *
 * @param src        The image source — a path under the CDN (resolved by the
 *                   edge), or an absolute URL.
 * @param modifiers  Standard Nuxt modifiers and/or the richer transform set.
 * @param options    {@link ProviderOptions} (baseURL, cdnPath).
 */
export function buildImageUrl(
  src: string,
  modifiers: TransformModifiers = {},
  options: ProviderOptions = {},
): string {
  const { baseURL = '', cdnPath = DEFAULT_CDN_PATH } = options
  const query = serializeModifiers(modifiers)
  const path = joinURL(baseURL, cdnPath, normalizeSource(src))
  return query ? `${path}?${query}` : path
}
