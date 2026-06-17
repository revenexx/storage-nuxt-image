/**
 * Serializes {@link TransformModifiers} into the revenexx Storage CDN's query
 * string. The friendly param vocabulary here is the public contract shared with
 * the CDN's delivery layer (`ImgproxyUrlBuilder`) — keep the two in sync.
 *
 * Colons and commas are kept readable in the output (both are valid, unescaped,
 * in a URL query); other unsafe characters are percent-encoded.
 */
import type {
  Color,
  Gravity,
  GravityType,
  TransformModifiers,
} from './types'

/** Scalar/array/object options forwarded as-is (colon-joined). */
const SCALAR_KEYS = [
  'dpr', 'blur', 'sharpen', 'pixelate', 'brightness', 'contrast', 'saturation',
  'background', 'backgroundAlpha', 'rotate', 'minWidth', 'minHeight', 'dpi',
  'maxBytes', 'resizingAlgorithm', 'autoquality', 'monochrome', 'style', 'page',
  'zoom', 'formatQuality', 'unsharpening',
] as const

/** Boolean flags emitted as `=1` when truthy. */
const BOOL_KEYS = [
  'autoRotate', 'stripMetadata', 'keepCopyright', 'stripColorProfile',
  'enforceThumbnail', 'disableAnimation',
] as const

function gravityStr(g: GravityType | Gravity): string {
  if (typeof g === 'string') {
    return g
  }
  const parts: (string | number)[] = [g.type]
  if (g.x != null || g.y != null) {
    parts.push(g.x ?? 0, g.y ?? 0)
  }
  return parts.join(':')
}

function colorStr(c: Color): string {
  return Array.isArray(c) ? c.join(':') : c
}

/** Drop trailing empty positional args so defaults aren't spelled out. */
function trimTail(parts: (string | number)[]): string {
  const out = [...parts]
  while (out.length > 0 && (out[out.length - 1] === '' || out[out.length - 1] == null)) {
    out.pop()
  }
  return out.join(':')
}

/** Format a scalar/array/object value into a colon-joined arg string. */
function fmtScalar(v: unknown): string {
  if (Array.isArray(v)) {
    return v.map(x => (x === true ? '1' : x === false ? '0' : String(x))).join(':')
  }
  if (typeof v === 'boolean') {
    return v ? '1' : ''
  }
  if (v != null && typeof v === 'object') {
    // e.g. formatQuality { webp: 80, avif: 60 } → "webp:80:avif:60"
    return Object.entries(v as Record<string, unknown>).map(([k, val]) => `${k}:${val}`).join(':')
  }
  return String(v)
}

/** Keep `:` and `,` readable; percent-encode everything else unsafe. */
function enc(v: string): string {
  return encodeURIComponent(v).replace(/%3A/gi, ':').replace(/%2C/gi, ',')
}

/**
 * Build the CDN query string (no leading `?`) for the given modifiers. Returns
 * `''` when there are no transforms.
 */
export function serializeModifiers(modifiers: TransformModifiers): string {
  const m = modifiers
  const params: [string, string][] = []
  const add = (key: string, value: string | number | undefined | null): void => {
    if (value !== '' && value != null) {
      params.push([key, String(value)])
    }
  }

  // Resize: width/height/fit, with resize/size objects decomposed onto them.
  let width = m.width
  let height = m.height
  let fit = m.fit
  let enlarge = m.enlarge
  if (m.resize) {
    fit = fit ?? m.resize.type
    width = width ?? m.resize.width
    height = height ?? m.resize.height
    enlarge = enlarge ?? m.resize.enlarge
  }
  if (m.size) {
    width = width ?? m.size.width
    height = height ?? m.size.height
    enlarge = enlarge ?? m.size.enlarge
  }
  add('w', width)
  add('h', height)
  add('fit', fit)
  if (enlarge) {
    add('enlarge', '1')
  }
  add('q', m.quality)
  add('fm', m.format)
  if (m.preset != null) {
    add('preset', Array.isArray(m.preset) ? m.preset.join(':') : m.preset)
  }

  // Structured geometry / effects.
  if (m.gravity != null) {
    add('gravity', gravityStr(m.gravity))
  }
  if (m.crop) {
    const t: (string | number)[] = [m.crop.width, m.crop.height]
    if (m.crop.gravity != null) {
      t.push(gravityStr(m.crop.gravity))
    }
    add('crop', t.join(':'))
  }
  if (m.adjust) {
    add('adjust', trimTail([m.adjust.brightness ?? '', m.adjust.contrast ?? '', m.adjust.saturation ?? '']))
  }
  if (m.trim) {
    const t: (string | number)[] = [m.trim.threshold]
    if (m.trim.color != null || m.trim.equalHor != null || m.trim.equalVer != null) {
      t.push(m.trim.color != null ? colorStr(m.trim.color) : '')
    }
    if (m.trim.equalHor != null || m.trim.equalVer != null) {
      t.push(m.trim.equalHor ? 1 : 0, m.trim.equalVer ? 1 : 0)
    }
    add('trim', t.join(':'))
  }
  if (m.watermark != null) {
    const w = typeof m.watermark === 'number' ? { opacity: m.watermark } : m.watermark
    const t: (string | number)[] = [w.opacity]
    if (w.position != null || w.x != null || w.y != null || w.scale != null) {
      t.push(w.position ?? '', w.x ?? 0, w.y ?? 0, w.scale ?? 0)
    }
    add('watermark', trimTail(t))
  }
  if (m.padding != null) {
    add('padding', typeof m.padding === 'number'
      ? m.padding
      : [m.padding.top ?? 0, m.padding.right ?? 0, m.padding.bottom ?? 0, m.padding.left ?? 0].join(':'))
  }
  for (const key of ['extend', 'extendAspectRatio'] as const) {
    const v = m[key]
    if (v == null) {
      continue
    }
    if (typeof v === 'boolean') {
      add(key, v ? '1' : null)
    }
    else {
      add(key, v.gravity != null ? `1:${gravityStr(v.gravity)}` : '1')
    }
  }
  if (m.background != null) {
    add('background', colorStr(m.background))
  }

  // Scalar passthrough (skip the ones already emitted above).
  for (const key of SCALAR_KEYS) {
    if (key === 'background') {
      continue
    }
    const v = m[key]
    if (v != null && v !== false) {
      add(key, fmtScalar(v))
    }
  }

  // Boolean flags.
  for (const key of BOOL_KEYS) {
    if (m[key]) {
      add(key, '1')
    }
  }

  // Escape hatch → the CDN's `opts` raw-segment param.
  if (Array.isArray(m.rawOptions) && m.rawOptions.length > 0) {
    add('opts', m.rawOptions.filter(Boolean).join(','))
  }

  return params.map(([k, v]) => `${k}=${enc(v)}`).join('&')
}
