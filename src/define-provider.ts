/**
 * A self-contained equivalent of `@nuxt/image`'s `defineProvider`, so this
 * package has no runtime dependency on `@nuxt/image` (only an optional peer for
 * types). The Nuxt Image module imports a provider module's default export as a
 * factory and reads `.getImage` off the returned object.
 */
import type { ProviderOptions, TransformModifiers } from './types'

/** Result the Nuxt Image runtime expects from a provider. */
export interface ResolvedImage {
  url: string
}

/**
 * The context the Nuxt Image runtime passes to `getImage`: the resolved
 * modifiers plus the provider's configured `options` (spread in), which for
 * this provider are {@link ProviderOptions}.
 */
export interface StorageImageContext extends ProviderOptions {
  modifiers?: TransformModifiers
}

export type ProviderGetImage = (src: string, context?: StorageImageContext) => ResolvedImage

export interface ImageProvider {
  getImage: ProviderGetImage
}

/** Wrap a provider definition into the factory shape Nuxt Image consumes. */
export function defineProvider(provider: ImageProvider): () => ImageProvider {
  return () => provider
}
