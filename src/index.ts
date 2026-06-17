/**
 * `@revenexx/storage-nuxt-image`
 *
 * Default export: the Nuxt Image provider (point `image.providers.<name>.provider`
 * here). Named exports: the framework-agnostic {@link buildImgproxyUrl} builder,
 * `getImage`, and all public types.
 */
export { default, getImage } from './provider'
export type { ResolvedImage, StorageImageContext } from './define-provider'
export {
  buildImgproxyUrl,
  KEY_MAP,
  serializeModifiers,
  signPath,
} from './builder'
export type {
  Adjust,
  Color,
  Crop,
  Gravity,
  GravityType,
  ImgproxyModifiers,
  Padding,
  ProviderOptions,
  Resize,
  ResizingType,
  SourceEncoding,
  Trim,
  Watermark,
} from './types'
