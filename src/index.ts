/**
 * `@revenexx/storage-nuxt-image`
 *
 * Default export: the Nuxt Image provider (point `image.providers.<name>.provider`
 * here). Named exports: the framework-agnostic {@link buildImageUrl} builder,
 * `getImage`, and all public types.
 */
export { default, getImage } from './provider'
export type { ResolvedImage, StorageImageContext } from './define-provider'
export { buildImageUrl, serializeModifiers } from './builder'
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
