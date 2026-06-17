/**
 * Public types for `@revenexx/storage-nuxt-image`.
 *
 * The package builds imgproxy URLs for the Revenexx Storage CDN. Two surfaces
 * share these types: the pure URL {@link buildImgproxyUrl} builder and the Nuxt
 * Image provider.
 */

/** A `R:G:B` triplet (0-255) or a hex string (`fff`, `ffffff`). */
export type Color = string | [number, number, number]

/**
 * imgproxy gravity. A simple type (`ce`, `sm`, …) or an object with offsets.
 *
 * - `no` north, `so` south, `ea` east, `we` west, `noea`, `nowe`, `soea`,
 *   `sowe`, `ce` center
 * - `sm` smart gravity (detects the most interesting part)
 * - `fp` focus point — provide `x`/`y` as 0..1 fractions
 * - `obj`/`objw` object/weighted-object gravity (Pro)
 */
export type GravityType
  = | 'no' | 'so' | 'ea' | 'we'
    | 'noea' | 'nowe' | 'soea' | 'sowe'
    | 'ce' | 'sm' | 'fp' | 'obj' | 'objw'

export interface Gravity {
  type: GravityType
  /** X offset (px) or, for `fp`, a 0..1 fraction. */
  x?: number
  /** Y offset (px) or, for `fp`, a 0..1 fraction. */
  y?: number
}

/** imgproxy resizing type. */
export type ResizingType = 'fit' | 'fill' | 'fill-down' | 'force' | 'auto'

export interface Resize {
  type?: ResizingType
  width?: number
  height?: number
  enlarge?: boolean
  extend?: boolean
}

export interface Crop {
  width: number
  height: number
  gravity?: GravityType | Gravity
}

export interface Trim {
  threshold: number
  color?: Color
  equalHor?: boolean
  equalVer?: boolean
}

export interface Adjust {
  brightness?: number
  contrast?: number
  saturation?: number
}

export interface Watermark {
  /** Opacity 0..1. */
  opacity: number
  position?: string
  x?: number
  y?: number
  scale?: number
}

/** Padding in px. A number applies to all sides. */
export type Padding = number | { top?: number, right?: number, bottom?: number, left?: number }

/**
 * The full imgproxy processing-option surface (OSS + Pro), plus the standard
 * Nuxt Image modifiers (`width`, `height`, `fit`, `format`, `quality`,
 * `background`). Anything not listed can still be passed through {@link raw}.
 *
 * Camel-case keys map to imgproxy options; structured options accept ergonomic
 * objects (e.g. `resize`, `crop`, `gravity`, `adjust`, `watermark`).
 */
export interface ImgproxyModifiers {
  // --- Nuxt Image standard modifiers ---------------------------------------
  /** Target width (px). Maps to imgproxy `w`. */
  width?: number | string
  /** Target height (px). Maps to imgproxy `h`. */
  height?: number | string
  /** How the image fits the box. Maps to imgproxy resizing type. */
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' | ResizingType
  /** Output format (`webp`, `avif`, `jpg`, `png`, …). Sets the URL extension. */
  format?: string
  /** Quality 0..100. Maps to imgproxy `q`. */
  quality?: number | string
  /** Background color for transparent areas. Maps to imgproxy `bg`. */
  background?: Color

  // --- Resize --------------------------------------------------------------
  resize?: Resize
  resizingType?: ResizingType
  /** Pro: resizing algorithm (`nearest`, `linear`, `cubic`, `lanczos2`, `lanczos3`). */
  resizingAlgorithm?: string
  size?: { width?: number, height?: number, enlarge?: boolean, extend?: boolean }
  minWidth?: number
  minHeight?: number
  zoom?: number | [number, number]
  dpr?: number
  enlarge?: boolean
  extend?: boolean | { gravity?: GravityType | Gravity }
  extendAspectRatio?: boolean | { gravity?: GravityType | Gravity }

  // --- Geometry ------------------------------------------------------------
  gravity?: GravityType | Gravity
  crop?: Crop
  /** Pro: trim borders. */
  trim?: Trim
  padding?: Padding
  autoRotate?: boolean
  rotate?: 0 | 90 | 180 | 270

  // --- Color & effects -----------------------------------------------------
  backgroundAlpha?: number
  adjust?: Adjust
  brightness?: number
  contrast?: number
  saturation?: number
  blur?: number
  sharpen?: number
  /** Pro */
  pixelate?: number
  /** Pro: `mode:weight:divider`. */
  unsharpening?: [string, number, number] | string
  /** Pro */
  monochrome?: boolean | number
  /** Pro */
  duotone?: boolean | number

  // --- Watermark (Pro for url/text) ----------------------------------------
  watermark?: Watermark
  watermarkUrl?: string
  watermarkText?: string
  watermarkSize?: [number, number] | string
  watermarkRotate?: number
  watermarkShadow?: number

  // --- Layout / metadata ---------------------------------------------------
  /** Pro: apply a CSS-like style string. */
  style?: string
  stripMetadata?: boolean
  keepCopyright?: boolean
  stripColorProfile?: boolean
  /** Pro */
  enforceThumbnail?: boolean
  /** Pro */
  dpi?: number

  // --- Output --------------------------------------------------------------
  /** Pro: per-format quality, e.g. `{ webp: 80, avif: 60 }`. */
  formatQuality?: Record<string, number> | string
  /** Pro: automatic quality, `method:target:min:max`. */
  autoquality?: string | (string | number)[]
  /** Pro: cap the output size in bytes. */
  maxBytes?: number
  /** Pro */
  jpegOptions?: (string | number | boolean)[] | string
  /** Pro */
  pngOptions?: (string | number | boolean)[] | string
  /** Pro */
  gifOptions?: (string | number | boolean)[] | string
  /** Pro: select a page of a multi-page document. */
  page?: number
  /** Pro */
  pages?: number
  /** Pro */
  disableAnimation?: boolean
  /** Pro */
  videoThumbnailSecond?: number
  /** Pro */
  fallbackImageUrl?: string

  // --- Flow / serving ------------------------------------------------------
  skipProcessing?: string[] | string
  /** Pro: treat the source as raw bytes (no processing). */
  raw?: string[] | string | boolean
  cachebuster?: string
  /** Unix timestamp after which the URL is rejected. */
  expires?: number
  filename?: string
  returnAttachment?: boolean
  /** Apply a named imgproxy preset (or several). */
  preset?: string | string[]
  maxSrcResolution?: number
  maxSrcFileSize?: number
  maxAnimationFrames?: number

  /**
   * Escape hatch: literal processing-option segments appended verbatim, e.g.
   * `['rs:fill:300:400', 'g:sm']`. Use for any option not modelled above.
   */
  rawOptions?: string[]

  /** Allow unknown keys (forwarded through the generic serializer). */
  [key: string]: unknown
}

/** How the source image is encoded into the imgproxy URL. */
export type SourceEncoding = 'plain' | 'base64'

/** Options for {@link buildImgproxyUrl} and the Nuxt provider. */
export interface ProviderOptions {
  /**
   * Base URL the CDN is served from — typically the customer's own domain,
   * e.g. `https://my-shop.com`. Empty (default) produces a root-relative URL.
   * This is the "bring your own domain" knob.
   */
  baseURL?: string
  /**
   * Path segment appended after {@link baseURL} that routes to the Revenexx
   * edge / imgproxy. Defaults to `/cdn/`. Set to `''` to disable.
   */
  cdnPath?: string
  /**
   * How to encode the source into the URL.
   * - `plain` (default): readable `…/plain/<src>` — works great with relative
   *   sources resolved by the edge's configured base URL.
   * - `base64`: URL-safe base64 — robust for arbitrary absolute URLs with
   *   query strings or special characters.
   */
  encode?: SourceEncoding
  /**
   * The signature path segment.
   * - omit `key`/`salt` and leave this unset → `insecure` (requires the edge to
   *   run imgproxy with unsafe URLs enabled, the usual setup behind /cdn/);
   * - set to a custom string to hardcode it;
   * - set to `false` to omit the segment entirely (when the edge injects it).
   */
  signature?: string | false
  /**
   * Hex-encoded imgproxy signing key. When BOTH `key` and `salt` are set the
   * URL is signed (HMAC-SHA256). ⚠️ In a Nuxt provider this runs in the browser
   * too, exposing the key — prefer signing at the edge. Safe for server-only /
   * programmatic use.
   */
  key?: string
  /** Hex-encoded imgproxy signing salt. See {@link key}. */
  salt?: string
  /** Truncate the signature to N bytes (imgproxy `IMGPROXY_SIGNATURE_SIZE`). */
  signatureSize?: number
}
