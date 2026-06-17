/**
 * `@revenexx/storage-nuxt-image/builder`
 *
 * Framework-agnostic image-transformation URL builder for the revenexx Storage CDN. Use it
 * directly anywhere (server scripts, Vue/React, tests) — the Nuxt Image
 * provider is a thin wrapper around {@link buildImageUrl}.
 */
import { joinURL } from 'ufo'
import { serializeModifiers } from './options'
import { signPath } from './sign'
import type { TransformModifiers, ProviderOptions } from './types'

export type { TransformModifiers, ProviderOptions, SourceEncoding } from './types'
export type {
  Adjust,
  Color,
  Crop,
  Gravity,
  GravityType,
  Padding,
  Resize,
  ResizingType,
  Trim,
  Watermark,
} from './types'
export { KEY_MAP, serializeModifiers } from './options'
export { signPath } from './sign'

const DEFAULT_CDN_PATH = '/cdn/'

function base64Url(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (const b of bytes) {
    binary += String.fromCharCode(b)
  }
  const base64 = typeof btoa === 'function'
    ? btoa(binary)
    : Buffer.from(bytes).toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** True for absolute (`https://…`) or protocol-relative (`//…`) sources. */
function isAbsolute(src: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(src) || src.startsWith('//')
}

/**
 * Normalize a relative source so it joins cleanly: a single leading slash is
 * dropped (`/uploads/a.jpg` → `uploads/a.jpg`) so it resolves against the
 * edge's base URL without a double slash. Absolute URLs are untouched.
 */
function normalizeSource(src: string): string {
  if (isAbsolute(src)) {
    return src
  }
  return src.replace(/^\/+/, '')
}

/** Encode the source into the source part of the path. */
function encodeSource(src: string, encode: 'plain' | 'base64', format?: string): string {
  if (encode === 'base64') {
    const b64 = base64Url(src)
    return format ? `${b64}.${format}` : b64
  }
  // plain: keep slashes readable, escape the rest; the CDN percent-decodes it.
  const escaped = encodeURI(src).replace(/\?/g, '%3F').replace(/#/g, '%23')
  return format ? `plain/${escaped}@${format}` : `plain/${escaped}`
}

/**
 * Build a transformation URL for `src` with the given `modifiers`.
 *
 * The result is `<baseURL><cdnPath><signature>/<processing-options>/<source>`,
 * e.g. `https://my-shop.com/cdn/insecure/rs:fill:300:400/g:sm/plain/uploads/a.jpg`.
 *
 * @param src        The image source — a relative path (resolved by the edge's
 *                   the CDN's base URL) or an absolute URL.
 * @param modifiers  Standard Nuxt modifiers and/or transformation options.
 * @param options    {@link ProviderOptions} (baseURL, cdnPath, encoding, signing).
 */
export function buildImageUrl(
  src: string,
  modifiers: TransformModifiers = {},
  options: ProviderOptions = {},
): string {
  const {
    baseURL = '',
    cdnPath = DEFAULT_CDN_PATH,
    encode = 'plain',
    key,
    salt,
    signature,
    signatureSize,
  } = options

  const { segments, format } = serializeModifiers(modifiers)
  const processing = segments.join('/')
  const source = encodeSource(normalizeSource(src), encode, format)

  // The path the CDN signs / serves, after the signature segment.
  const signedPath = '/' + [processing, source].filter(Boolean).join('/')

  let sig: string | undefined
  if (key && salt) {
    sig = signPath(signedPath, key, salt, signatureSize)
  }
  else if (signature === false) {
    sig = undefined
  }
  else {
    sig = signature ?? 'insecure'
  }

  // joinURL drops empty parts, so a missing signature or empty processing list
  // collapses cleanly.
  return joinURL(baseURL, cdnPath, sig ?? '', processing, source)
}
