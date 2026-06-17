import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { buildImgproxyUrl } from '../src/builder'
import { signPath } from '../src/sign'

const KEY = '943b421c9eb07c830af81030552c86009268de4e532ba2ee2eab8247c6da0881'
const SALT = '520f986b998545b4785e0defbc4f3c1203f22de2374a3d53cb7a7fe9fea309c5'

/** Independent reference signature using node:crypto, per imgproxy's spec. */
function referenceSignature(path: string, signatureSize?: number): string {
  const h = createHmac('sha256', Buffer.from(KEY, 'hex'))
  h.update(Buffer.from(SALT, 'hex'))
  h.update(Buffer.from(path, 'utf8'))
  let digest = h.digest()
  if (signatureSize) {
    digest = digest.subarray(0, signatureSize)
  }
  return digest.toString('base64url')
}

describe('signPath', () => {
  it('matches an independent node:crypto HMAC-SHA256 implementation', () => {
    const path = '/rs:fit:300:300:0/g:no/aHR0cDovL2ltZy5leGFtcGxlLmNvbS9wcmV0dHkvaW1hZ2UuanBn'
    expect(signPath(path, KEY, SALT)).toBe(referenceSignature(path))
  })

  it('matches the reference when truncated', () => {
    const path = '/w:300/plain/uploads/a.jpg'
    expect(signPath(path, KEY, SALT, 8)).toBe(referenceSignature(path, 8))
  })

  it('rejects a non-hex key/salt', () => {
    expect(() => signPath('/w:1/plain/a.jpg', 'zz', SALT)).toThrow(/hex/)
  })
})

describe('buildImgproxyUrl — signing', () => {
  it('signs the path when key + salt are provided', () => {
    const url = buildImgproxyUrl('uploads/a.jpg', { width: 300 }, { key: KEY, salt: SALT })
    const sig = referenceSignature('/w:300/plain/uploads/a.jpg')
    expect(url).toBe(`/cdn/${sig}/w:300/plain/uploads/a.jpg`)
    expect(url).not.toContain('insecure')
  })

  it('omits the signature segment when signature:false', () => {
    expect(buildImgproxyUrl('a.jpg', { width: 1 }, { signature: false }))
      .toBe('/cdn/w:1/plain/a.jpg')
  })

  it('uses a custom signature string when provided', () => {
    expect(buildImgproxyUrl('a.jpg', { width: 1 }, { signature: 'XYZ' }))
      .toBe('/cdn/XYZ/w:1/plain/a.jpg')
  })
})
