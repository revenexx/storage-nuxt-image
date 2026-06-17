/**
 * imgproxy URL signing (HMAC-SHA256), per
 * https://docs.imgproxy.net/usage/signing_the_url.
 *
 * The signature is computed over the path that follows the signature segment —
 * i.e. `/<processing_options>/<source>` — using the binary key and salt. The
 * result is URL-safe base64 (no padding), optionally truncated to
 * `signatureSize` bytes (imgproxy's `IMGPROXY_SIGNATURE_SIZE`).
 *
 * Implemented with `@noble/hashes` so it works isomorphically (Node, edge,
 * browser) without `node:crypto`.
 */
import { hmac } from '@noble/hashes/hmac'
import { sha256 } from '@noble/hashes/sha256'

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim()
  if (clean.length % 2 !== 0 || /[^0-9a-f]/i.test(clean)) {
    throw new Error('imgproxy signing key/salt must be a hex string')
  }
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) {
    binary += String.fromCharCode(b)
  }
  const base64 = typeof btoa === 'function'
    ? btoa(binary)
    : Buffer.from(bytes).toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Sign the imgproxy path.
 *
 * @param path        The path after the signature segment, beginning with `/`
 *                    (e.g. `/rs:fill:300:400/plain/https://…`).
 * @param keyHex      Hex-encoded signing key.
 * @param saltHex     Hex-encoded salt.
 * @param signatureSize Optional truncation length in bytes.
 * @returns URL-safe base64 signature.
 */
export function signPath(path: string, keyHex: string, saltHex: string, signatureSize?: number): string {
  const key = hexToBytes(keyHex)
  const salt = hexToBytes(saltHex)
  const message = new TextEncoder().encode(path)

  const data = new Uint8Array(salt.length + message.length)
  data.set(salt, 0)
  data.set(message, salt.length)

  let digest = hmac(sha256, key, data)
  if (signatureSize && signatureSize > 0 && signatureSize < digest.length) {
    digest = digest.slice(0, signatureSize)
  }
  return base64UrlEncode(digest)
}
