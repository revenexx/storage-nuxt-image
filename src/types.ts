/**
 * Public types for `@revenexx/storage-nuxt-image`.
 *
 * The package builds image-transformation URLs for the revenexx Storage CDN.
 * Two surfaces share these types: the pure URL {@link buildImageUrl} builder
 * and the Nuxt Image provider.
 */

/** A `R:G:B` triplet (0-255) or a hex string (`fff`, `ffffff`). */
export type Color = string | [number, number, number]

/**
 * Gravity — the anchor used when cropping/placing. A simple type (`ce`, `sm`,
 * …) or an object with offsets.
 *
 * - `no` north, `so` south, `ea` east, `we` west, `noea`, `nowe`, `soea`,
 *   `sowe`, `ce` center
 * - `sm` smart gravity (detects the most interesting part)
 * - `fp` focus point — provide `x`/`y` as 0..1 fractions
 * - `obj`/`objw` object / weighted-object gravity
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

/** Resizing type. */
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
 * The full transformation surface, plus the standard Nuxt Image modifiers
 * (`width`, `height`, `fit`, `format`, `quality`, `background`). Anything not
 * listed can still be passed through {@link TransformModifiers.rawOptions}.
 *
 * Camel-case keys map to the CDN's short option names; structured options
 * accept ergonomic objects (e.g. `resize`, `crop`, `gravity`, `adjust`,
 * `watermark`).
 */
export interface TransformModifiers {
  // --- Nuxt Image standard modifiers ---------------------------------------
  /** Target width (px). */
  width?: number | string
  /** Target height (px). */
  height?: number | string
  /** How the image fits the box. */
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' | ResizingType
  /** Output format (`webp`, `avif`, `jpg`, `png`, …). Sets the URL extension. */
  format?: string
  /** Quality 0..100. */
  quality?: number | string
  /** Background color for transparent areas. */
  background?: Color

  // --- Resize --------------------------------------------------------------
  resize?: Resize
  resizingType?: ResizingType
  /** Resizing algorithm (`nearest`, `linear`, `cubic`, `lanczos2`, `lanczos3`). */
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
  /** Trim borders. */
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
  pixelate?: number
  /** `mode:weight:divider`. */
  unsharpening?: [string, number, number] | string
  monochrome?: boolean | number
  duotone?: boolean | number

  // --- Watermark -----------------------------------------------------------
  watermark?: Watermark
  watermarkUrl?: string
  watermarkText?: string
  watermarkSize?: [number, number] | string
  watermarkRotate?: number
  watermarkShadow?: number

  // --- Layout / metadata ---------------------------------------------------
  /** Apply a CSS-like style string. */
  style?: string
  stripMetadata?: boolean
  keepCopyright?: boolean
  stripColorProfile?: boolean
  enforceThumbnail?: boolean
  dpi?: number

  // --- Output --------------------------------------------------------------
  /** Per-format quality, e.g. `{ webp: 80, avif: 60 }`. */
  formatQuality?: Record<string, number> | string
  /** Automatic quality, `method:target:min:max`. */
  autoquality?: string | (string | number)[]
  /** Cap the output size in bytes. */
  maxBytes?: number
  jpegOptions?: (string | number | boolean)[] | string
  pngOptions?: (string | number | boolean)[] | string
  gifOptions?: (string | number | boolean)[] | string
  /** Select a page of a multi-page document. */
  page?: number
  pages?: number
  disableAnimation?: boolean
  videoThumbnailSecond?: number
  fallbackImageUrl?: string

  // --- Flow / serving ------------------------------------------------------
  skipProcessing?: string[] | string
  /** Treat the source as raw bytes (no processing). */
  raw?: string[] | string | boolean
  cachebuster?: string
  /** Unix timestamp after which the URL is rejected. */
  expires?: number
  filename?: string
  returnAttachment?: boolean
  /** Apply a named preset (or several). */
  preset?: string | string[]
  maxSrcResolution?: number
  maxSrcFileSize?: number
  maxAnimationFrames?: number

  /**
   * Escape hatch: literal option segments appended verbatim, e.g.
   * `['rs:fill:300:400', 'g:sm']`. Use for any option not modelled above.
   */
  rawOptions?: string[]

  /** Allow unknown keys (forwarded through the generic serializer). */
  [key: string]: unknown
}

/** How the source image is encoded into the URL. */
export type SourceEncoding = 'plain' | 'base64'

/** Options for {@link buildImageUrl} and the Nuxt provider. */
export interface ProviderOptions {
  /**
   * Base URL the CDN is served from — typically the customer's own domain,
   * e.g. `https://my-shop.com`. Empty (default) produces a root-relative URL.
   * This is the "bring your own domain" knob.
   */
  baseURL?: string
  /**
   * Path segment appended after {@link baseURL} that routes to the revenexx
   * edge. Defaults to `/cdn/`. Set to `''` to disable.
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
   *   serve unsigned URLs, the usual setup behind /cdn/);
   * - set to a custom string to hardcode it;
   * - set to `false` to omit the segment entirely (when the edge injects it).
   */
  signature?: string | false
  /**
   * Hex-encoded signing key. When BOTH `key` and `salt` are set the URL is
   * signed (HMAC-SHA256). ⚠️ In a Nuxt provider this runs in the browser too,
   * exposing the key — prefer signing at the edge. Safe for server-only /
   * programmatic use.
   */
  key?: string
  /** Hex-encoded signing salt. See {@link key}. */
  salt?: string
  /** Truncate the signature to N bytes. */
  signatureSize?: number
}
