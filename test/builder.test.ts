import { describe, expect, it } from 'vitest'
import { buildImgproxyUrl, serializeModifiers } from '../src/builder'

describe('buildImgproxyUrl', () => {
  it('builds a root-relative URL with /cdn/ auto-appended and the insecure signature', () => {
    expect(buildImgproxyUrl('uploads/a.jpg', { width: 300, height: 400 }))
      .toBe('/cdn/insecure/w:300/h:400/plain/uploads/a.jpg')
  })

  it('prepends the customer base URL (bring your own domain)', () => {
    expect(buildImgproxyUrl('uploads/a.jpg', { width: 300 }, { baseURL: 'https://my-shop.com' }))
      .toBe('https://my-shop.com/cdn/insecure/w:300/plain/uploads/a.jpg')
  })

  it('honours a custom cdnPath and can disable it', () => {
    expect(buildImgproxyUrl('a.jpg', { width: 10 }, { cdnPath: '/img/' }))
      .toBe('/img/insecure/w:10/plain/a.jpg')
    expect(buildImgproxyUrl('a.jpg', { width: 10 }, { cdnPath: '', baseURL: 'https://my-shop.com' }))
      .toBe('https://my-shop.com/insecure/w:10/plain/a.jpg')
  })

  it('maps the Nuxt `fit` modifier to an imgproxy resizing type', () => {
    expect(buildImgproxyUrl('a.jpg', { fit: 'cover' })).toContain('/rt:fill/')
    expect(buildImgproxyUrl('a.jpg', { fit: 'contain' })).toContain('/rt:fit/')
    expect(buildImgproxyUrl('a.jpg', { fit: 'fill' })).toContain('/rt:force/')
    expect(buildImgproxyUrl('a.jpg', { fit: 'fill-down' })).toContain('/rt:fill-down/')
  })

  it('encodes the format as a plain @extension', () => {
    expect(buildImgproxyUrl('a.jpg', { width: 100, format: 'webp' }))
      .toBe('/cdn/insecure/w:100/plain/a.jpg@webp')
  })

  it('base64-encodes the source (with .extension) when requested', () => {
    // base64url("https://x.test/a.jpg") = aHR0cHM6Ly94LnР…  (computed at runtime)
    const url = buildImgproxyUrl('https://x.test/a.jpg', { width: 100, format: 'avif' }, { encode: 'base64' })
    expect(url).toMatch(/^\/cdn\/insecure\/w:100\/[\w-]+\.avif$/)
    expect(url).not.toContain('plain/')
  })

  it('supports quality, dpr, blur, sharpen and background', () => {
    const url = buildImgproxyUrl('a.jpg', {
      width: 200,
      quality: 80,
      dpr: 2,
      blur: 5,
      sharpen: 0.5,
      background: 'fff',
    })
    expect(url).toContain('w:200')
    expect(url).toContain('q:80')
    expect(url).toContain('dpr:2')
    expect(url).toContain('bl:5')
    expect(url).toContain('sh:0.5')
    expect(url).toContain('bg:fff')
  })

  it('accepts an RGB-triplet background color', () => {
    expect(buildImgproxyUrl('a.jpg', { background: [255, 0, 128] })).toContain('bg:255:0:128')
  })

  it('strips a leading slash from relative sources (no double slash)', () => {
    expect(buildImgproxyUrl('/uploads/a.jpg', { width: 100 }))
      .toBe('/cdn/insecure/w:100/plain/uploads/a.jpg')
  })

  it('keeps absolute source URLs intact', () => {
    expect(buildImgproxyUrl('https://cdn.example.com/a.jpg', { width: 100 }))
      .toBe('/cdn/insecure/w:100/plain/https://cdn.example.com/a.jpg')
  })
})

describe('serializeModifiers — structured & Pro options', () => {
  const seg = (m: Parameters<typeof serializeModifiers>[0]) => serializeModifiers(m).segments

  it('serializes a structured resize', () => {
    expect(seg({ resize: { type: 'fill', width: 300, height: 400, enlarge: true } }))
      .toContain('rs:fill:300:400:1')
  })

  it('serializes crop with gravity', () => {
    expect(seg({ crop: { width: 100, height: 50, gravity: 'sm' } })).toContain('c:100:50:sm')
    expect(seg({ crop: { width: 100, height: 50, gravity: { type: 'fp', x: 0.5, y: 0.3 } } }))
      .toContain('c:100:50:fp:0.5:0.3')
  })

  it('serializes a focus-point gravity object', () => {
    expect(seg({ gravity: { type: 'fp', x: 0.1, y: 0.9 } })).toContain('g:fp:0.1:0.9')
  })

  it('serializes adjust (Pro)', () => {
    expect(seg({ adjust: { brightness: 10, contrast: 0.8, saturation: 1.2 } }))
      .toContain('a:10:0.8:1.2')
  })

  it('serializes a watermark', () => {
    expect(seg({ watermark: { opacity: 0.5, position: 'soea', x: 10, y: 10, scale: 0.2 } }))
      .toContain('wm:0.5:soea:10:10:0.2')
  })

  it('serializes trim (Pro)', () => {
    expect(seg({ trim: { threshold: 10, color: 'ffffff', equalHor: true, equalVer: false } }))
      .toContain('t:10:ffffff:1:0')
  })

  it('serializes padding from a number or an object', () => {
    expect(seg({ padding: 20 })).toContain('pd:20')
    expect(seg({ padding: { top: 1, right: 2, bottom: 3, left: 4 } })).toContain('pd:1:2:3:4')
  })

  it('serializes presets first', () => {
    expect(seg({ preset: ['sharp', 'mypreset'], width: 100 })[0]).toBe('pr:sharp:mypreset')
  })

  it('serializes boolean Pro/flow flags as :1', () => {
    expect(seg({ stripMetadata: true, enforceThumbnail: true })).toEqual(
      expect.arrayContaining(['sm:1', 'eth:1']),
    )
    // false flags are omitted
    expect(seg({ stripMetadata: false })).not.toContain('sm:1')
  })

  it('passes through the full Pro long-tail via key map', () => {
    const s = seg({
      maxBytes: 100000,
      page: 2,
      expires: 1700000000,
      cachebuster: 'v2',
      filename: 'photo.jpg',
      style: 'border-radius:50%25',
    })
    expect(s).toEqual(expect.arrayContaining([
      'mb:100000', 'pg:2', 'exp:1700000000', 'cb:v2', 'fn:photo.jpg', 'st:border-radius:50%25',
    ]))
  })

  it('appends rawOptions verbatim for anything unmodelled', () => {
    expect(seg({ width: 10, rawOptions: ['gr:0.5:1', 'fancy:opt'] })).toEqual(
      expect.arrayContaining(['w:10', 'gr:0.5:1', 'fancy:opt']),
    )
  })

  it('returns the format separately (encoded as extension, not an option)', () => {
    const { segments, format } = serializeModifiers({ width: 10, format: 'webp' })
    expect(format).toBe('webp')
    expect(segments).not.toContain('f:webp')
  })
})
