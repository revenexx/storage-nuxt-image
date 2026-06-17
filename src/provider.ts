/**
 * The Nuxt Image provider entry. Registered in `nuxt.config` via
 * `image.providers.<name>.provider = '@revenexx/storage-nuxt-image'`.
 *
 * Nuxt calls `getImage(src, { modifiers, ...options })` on both server and
 * client; the work is delegated to the isomorphic {@link buildImageUrl}.
 */
import { buildImageUrl } from './builder'
import { defineProvider } from './define-provider'
import type { ResolvedImage, StorageImageContext } from './define-provider'

export type { StorageImageContext } from './define-provider'

/**
 * Build an optimized image URL for the revenexx Storage CDN.
 */
export function getImage(src: string, context: StorageImageContext = {}): ResolvedImage {
  const { modifiers = {}, ...options } = context
  return { url: buildImageUrl(src, modifiers, options) }
}

export default defineProvider({ getImage })
