/**
 * Public types for `@revenexx/storage-nuxt-image`.
 *
 * The package builds image-transformation URLs for the revenexx Storage CDN.
 * Transforms are expressed as **query parameters** on a `/cdn/` URL (the CDN
 * translates, clamps and signs them server-side); two surfaces share these
 * types: the pure {@link buildImageUrl} builder and the Nuxt Image provider.
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

/**
 * Watermark anchor position (imgproxy gravity codes): center, the four edges,
 * the four corners, or `re` to replicate/tile across the image.
 */
export type WatermarkPosition
  = | 'ce' | 'no' | 'so' | 'ea' | 'we'
    | 'noea' | 'nowe' | 'soea' | 'sowe' | 're'

export interface Watermark {
  /** Opacity 0..1. */
  opacity: number
  /** Where to place the watermark (default: the CDN's configured default). */
  position?: WatermarkPosition
  /** X offset from the position (px). */
  x?: number
  /** Y offset from the position (px). */
  y?: number
  /** Scale relative to the result (0..1). */
  scale?: number
}

/** Padding in px. A number applies to all sides. */
export type Padding = number | { top?: number, right?: number, bottom?: number, left?: number }

/**
 * The transformation surface, mapped to the revenexx Storage CDN's query
 * parameters. Standard Nuxt Image modifiers (`width`, `height`, `fit`,
 * `format`, `quality`, `background`) are first-class; the richer options below
 * cover gravity, cropping, colour, effects and watermarking. Anything beyond
 * this set can be passed through {@link TransformModifiers.rawOptions}.
 */
export interface TransformModifiers {
  // --- Nuxt Image standard modifiers ---------------------------------------
  /** Target width (px). */
  width?: number | string
  /** Target height (px). */
  height?: number | string
  /** How the image fits the box. */
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' | ResizingType
  /** Output format (`webp`, `avif`, `jpg`, `png`, `gif`). */
  format?: string
  /** Quality 0..100. */
  quality?: number | string
  /** Background colour for transparent areas. */
  background?: Color

  // --- Resize --------------------------------------------------------------
  /** Structured resize; decomposed to width/height/fit/enlarge. */
  resize?: Resize
  size?: { width?: number, height?: number, enlarge?: boolean }
  resizingAlgorithm?: string
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
  trim?: Trim
  padding?: Padding
  autoRotate?: boolean
  rotate?: 0 | 90 | 180 | 270

  // --- Colour & effects ----------------------------------------------------
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

  // --- Watermark -----------------------------------------------------------
  /**
   * Overlay the CDN's configured watermark. A number is shorthand for the
   * opacity (`watermark: 0.5`); the object form adds position/offset/scale.
   * Requires a watermark to be configured on the CDN to be visible.
   */
  watermark?: number | Watermark

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
  /** Select a page of a multi-page document. */
  page?: number
  disableAnimation?: boolean

  // --- Presets & escape hatch ----------------------------------------------
  /** Apply a named preset (or several). */
  preset?: string | string[]
  /**
   * Escape hatch: raw transform segments appended verbatim (e.g.
   * `['gr:0.5:1:0']`). Use for any option not modelled above.
   */
  rawOptions?: string[]

  /** Allow unknown keys (forwarded through the generic serializer). */
  [key: string]: unknown
}

/** Options for {@link buildImageUrl} and the Nuxt provider. */
export interface ProviderOptions {
  /**
   * Base URL the CDN is served from — typically the customer's own domain,
   * e.g. `https://my-shop.com`. Empty (default) produces a root-relative URL,
   * which the browser resolves against the current origin (bring your own
   * domain — one build works on every customer domain).
   */
  baseURL?: string
  /**
   * Path segment between {@link baseURL} and the source that routes to the
   * revenexx edge. Defaults to `/cdn/`. Set to `''` to disable.
   */
  cdnPath?: string
}
