/**
 * Serialization of {@link ImgproxyModifiers} into imgproxy processing-option
 * segments (e.g. `rs:fill:300:400`, `g:sm`, `q:80`).
 *
 * The full imgproxy OSS + Pro option surface is supported: well-known options
 * map camel-case → short name via {@link KEY_MAP}; structured options
 * (`resize`, `crop`, `gravity`, …) have dedicated normalizers; everything else
 * falls through a generic serializer or {@link ImgproxyModifiers.rawOptions}.
 */
import type {
  Adjust,
  Color,
  Crop,
  Gravity,
  GravityType,
  ImgproxyModifiers,
  Padding,
  Resize,
  Trim,
  Watermark,
} from './types'

/** Standard Nuxt Image modifiers handled specially (not via the generic map). */
const STANDARD_KEYS = new Set([
  'width', 'height', 'fit', 'format', 'background',
  // structured / specially-handled below
  'resize', 'size', 'crop', 'gravity', 'padding', 'trim', 'adjust', 'extend',
  'extendAspectRatio', 'watermark', 'zoom', 'preset', 'rawOptions',
])

/**
 * camelCase modifier → imgproxy short option name. Covers the documented
 * imgproxy processing options (Pro options included).
 *
 * @see https://docs.imgproxy.net/usage/processing
 */
export const KEY_MAP: Record<string, string> = {
  // resize
  resizingType: 'rt',
  resizingAlgorithm: 'ra',
  size: 's',
  // `width`/`height` are emitted as `w`/`h` from the standard mapper
  minWidth: 'mw',
  minHeight: 'mh',
  dpr: 'dpr',
  enlarge: 'el',
  // geometry
  rotate: 'rot',
  autoRotate: 'ar',
  // color & effects
  backgroundAlpha: 'bga',
  brightness: 'br',
  contrast: 'co',
  saturation: 'sa',
  blur: 'bl',
  sharpen: 'sh',
  pixelate: 'pix',
  unsharpening: 'ush',
  monochrome: 'mc',
  duotone: 'dt',
  // watermark
  watermarkUrl: 'wmu',
  watermarkText: 'wmt',
  watermarkSize: 'wms',
  watermarkRotate: 'wmr',
  watermarkShadow: 'wmsh',
  // layout / metadata
  style: 'st',
  stripMetadata: 'sm',
  keepCopyright: 'kcr',
  stripColorProfile: 'scp',
  enforceThumbnail: 'eth',
  dpi: 'dpi',
  // output
  quality: 'q',
  formatQuality: 'fq',
  autoquality: 'aq',
  maxBytes: 'mb',
  jpegOptions: 'jpgo',
  pngOptions: 'pngo',
  gifOptions: 'gifo',
  format: 'f',
  page: 'pg',
  pages: 'pgs',
  disableAnimation: 'da',
  videoThumbnailSecond: 'vts',
  fallbackImageUrl: 'fiu',
  // flow / serving
  skipProcessing: 'skp',
  raw: 'raw',
  cachebuster: 'cb',
  expires: 'exp',
  filename: 'fn',
  returnAttachment: 'att',
  preset: 'pr',
  maxSrcResolution: 'msr',
  maxSrcFileSize: 'msfs',
  maxAnimationFrames: 'maf',
  background: 'bg',
}

/** Options serialized as `short:1` when truthy and omitted when falsy. */
const BOOL_KEYS = new Set([
  'enlarge', 'autoRotate', 'stripMetadata', 'keepCopyright', 'stripColorProfile',
  'enforceThumbnail', 'disableAnimation', 'returnAttachment',
])

function fmtColor(c: Color): string {
  return Array.isArray(c) ? c.join(':') : c
}

function fmtGravity(g: GravityType | Gravity): string {
  if (typeof g === 'string') {
    return g
  }
  const parts: (string | number)[] = [g.type]
  if (g.x != null || g.y != null) {
    parts.push(g.x ?? 0, g.y ?? 0)
  }
  return parts.join(':')
}

function bool(v: unknown): '1' | '0' {
  return v ? '1' : '0'
}

/** Serialize one value into the `:`-joined argument tail of an option. */
function fmtValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(v => (typeof v === 'boolean' ? bool(v) : String(v))).join(':')
  }
  if (typeof value === 'boolean') {
    return bool(value)
  }
  return String(value)
}

/** Drop trailing empty positional args so defaults aren't spelled out. */
function trimTail(parts: (string | number)[]): (string | number)[] {
  const out = [...parts]
  while (out.length > 0 && (out[out.length - 1] === '' || out[out.length - 1] == null)) {
    out.pop()
  }
  return out
}

function resizeOpt(r: Resize): string {
  const parts = trimTail([r.type ?? '', r.width ?? '', r.height ?? '', r.enlarge ? 1 : '', r.extend ? 1 : ''])
  return `rs:${parts.join(':')}`
}

function cropOpt(c: Crop): string {
  const tail = [c.width, c.height]
  if (c.gravity != null) {
    tail.push(fmtGravity(c.gravity) as unknown as number)
  }
  return `c:${tail.join(':')}`
}

function paddingOpt(p: Padding): string {
  if (typeof p === 'number') {
    return `pd:${p}`
  }
  return `pd:${[p.top ?? 0, p.right ?? 0, p.bottom ?? 0, p.left ?? 0].join(':')}`
}

function trimOpt(t: Trim): string {
  const parts: (string | number)[] = [t.threshold]
  if (t.color != null || t.equalHor != null || t.equalVer != null) {
    parts.push(t.color != null ? fmtColor(t.color) : '')
  }
  if (t.equalHor != null || t.equalVer != null) {
    parts.push(bool(t.equalHor), bool(t.equalVer))
  }
  return `t:${parts.join(':')}`
}

function adjustOpt(a: Adjust): string {
  return `a:${[a.brightness ?? '', a.contrast ?? '', a.saturation ?? ''].join(':')}`
}

function extendOpt(short: 'ex' | 'exar', v: boolean | { gravity?: GravityType | Gravity }): string {
  if (typeof v === 'boolean') {
    return `${short}:${bool(v)}`
  }
  const parts: string[] = ['1']
  if (v.gravity != null) {
    parts.push(fmtGravity(v.gravity))
  }
  return `${short}:${parts.join(':')}`
}

function watermarkOpt(w: Watermark): string {
  const parts: (string | number)[] = [w.opacity]
  if (w.position != null || w.x != null || w.y != null || w.scale != null) {
    parts.push(w.position ?? '', w.x ?? 0, w.y ?? 0, w.scale ?? 0)
  }
  return `wm:${parts.join(':').replace(/:+$/, '')}`
}

function zoomOpt(z: number | [number, number]): string {
  return `z:${Array.isArray(z) ? z.join(':') : z}`
}

/**
 * Map the standard Nuxt `fit` modifier onto an imgproxy resizing type.
 */
const FIT_MAP: Record<string, string> = {
  cover: 'fill',
  contain: 'fit',
  fill: 'force',
  inside: 'fit',
  outside: 'fill',
  // pass-through native imgproxy values
  force: 'force',
  auto: 'auto',
  'fill-down': 'fill-down',
}

/**
 * Build the ordered list of imgproxy processing-option segments from the given
 * modifiers. The output preserves a sensible, deterministic order.
 *
 * Returns `{ segments, format }` — `format` (the resolved output extension) is
 * returned separately because it is encoded as the URL extension, not as a
 * processing option.
 */
export function serializeModifiers(modifiers: ImgproxyModifiers): { segments: string[], format?: string } {
  const segments: string[] = []
  const m = modifiers

  // presets first (imgproxy applies them in order, before other options)
  if (m.preset != null) {
    const presets = Array.isArray(m.preset) ? m.preset : [m.preset]
    if (presets.length) {
      segments.push(`pr:${presets.join(':')}`)
    }
  }

  // --- resize / dimensions -------------------------------------------------
  if (m.resize) {
    segments.push(resizeOpt(m.resize))
  }
  if (m.size) {
    const parts = trimTail([m.size.width ?? '', m.size.height ?? '', m.size.enlarge ? 1 : '', m.size.extend ? 1 : ''])
    segments.push(`s:${parts.join(':')}`)
  }
  if (m.width != null) {
    segments.push(`w:${m.width}`)
  }
  if (m.height != null) {
    segments.push(`h:${m.height}`)
  }
  if (m.fit != null) {
    segments.push(`rt:${FIT_MAP[m.fit] ?? m.fit}`)
  }
  if (m.zoom != null) {
    segments.push(zoomOpt(m.zoom))
  }

  // --- geometry ------------------------------------------------------------
  if (m.gravity != null) {
    segments.push(`g:${fmtGravity(m.gravity)}`)
  }
  if (m.crop) {
    segments.push(cropOpt(m.crop))
  }
  if (m.trim) {
    segments.push(trimOpt(m.trim))
  }
  if (m.padding != null) {
    segments.push(paddingOpt(m.padding))
  }
  if (m.extend != null) {
    segments.push(extendOpt('ex', m.extend))
  }
  if (m.extendAspectRatio != null) {
    segments.push(extendOpt('exar', m.extendAspectRatio))
  }

  // --- color & effects -----------------------------------------------------
  if (m.adjust) {
    segments.push(adjustOpt(m.adjust))
  }
  if (m.background != null) {
    segments.push(`bg:${fmtColor(m.background)}`)
  }
  if (m.watermark) {
    segments.push(watermarkOpt(m.watermark))
  }

  // --- generic key-mapped options (the long tail, incl. Pro) ---------------
  const handled = STANDARD_KEYS
  for (const key of Object.keys(m)) {
    if (handled.has(key) || key === 'baseURL') {
      continue
    }
    const value = m[key]
    if (value == null || value === false) {
      continue
    }
    if (key === 'format') {
      continue // resolved as extension below
    }
    const short = KEY_MAP[key] ?? key
    if (BOOL_KEYS.has(key)) {
      segments.push(`${short}:1`)
    }
    else if (typeof value === 'object' && !Array.isArray(value)) {
      // unknown structured option → join its values (best effort)
      segments.push(`${short}:${Object.values(value as Record<string, unknown>).map(fmtValue).join(':')}`)
    }
    else {
      segments.push(`${short}:${fmtValue(value)}`)
    }
  }

  // raw literal segments, appended verbatim
  if (Array.isArray(m.rawOptions)) {
    segments.push(...m.rawOptions.filter(Boolean))
  }

  const format = m.format != null ? String(m.format) : undefined
  return { segments, format }
}
