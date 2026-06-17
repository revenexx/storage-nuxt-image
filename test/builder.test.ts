import { describe, expect, it } from 'vitest'
import { buildImageUrl, serializeModifiers } from '../src/builder'

describe('buildImageUrl', () => {
  it('builds a root-relative /cdn/ URL with a query string', () => {
    expect(buildImageUrl('sftp-imports/header.jpg', { width: 200 }))
      .toBe('/cdn/sftp-imports/header.jpg?w=200')
  })

  it('emits no query when there are no modifiers', () => {
    expect(buildImageUrl('sftp-imports/header.jpg')).toBe('/cdn/sftp-imports/header.jpg')
  })

  it('prepends the customer base URL (bring your own domain)', () => {
    expect(buildImageUrl('uploads/a.jpg', { width: 300, height: 200, fit: 'cover', format: 'webp' }, { baseURL: 'https://my-shop.com' }))
      .toBe('https://my-shop.com/cdn/uploads/a.jpg?w=300&h=200&fit=cover&fm=webp')
  })

  it('honours a custom cdnPath and can disable it', () => {
    expect(buildImageUrl('a.jpg', { width: 10 }, { cdnPath: '/img/' })).toBe('/img/a.jpg?w=10')
    expect(buildImageUrl('a.jpg', { width: 10 }, { cdnPath: '', baseURL: 'https://x.test' }))
      .toBe('https://x.test/a.jpg?w=10')
  })

  it('strips a leading slash from relative sources but keeps absolute URLs', () => {
    expect(buildImageUrl('/uploads/a.jpg', { width: 100 })).toBe('/cdn/uploads/a.jpg?w=100')
    expect(buildImageUrl('https://cdn.example.com/a.jpg', { width: 100 }))
      .toBe('/cdn/https://cdn.example.com/a.jpg?w=100')
  })

  it('maps the standard modifiers to their CDN params', () => {
    expect(buildImageUrl('a.jpg', { width: 200, height: 150, fit: 'contain', quality: 70, format: 'avif', background: 'fff' }))
      .toBe('/cdn/a.jpg?w=200&h=150&fit=contain&q=70&fm=avif&background=fff')
  })
})

describe('serializeModifiers', () => {
  it('serializes scalar effects', () => {
    const q = serializeModifiers({ dpr: 2, blur: 5, sharpen: 0.5, rotate: 90, brightness: 10 })
    expect(q).toContain('dpr=2')
    expect(q).toContain('blur=5')
    expect(q).toContain('sharpen=0.5')
    expect(q).toContain('rotate=90')
    expect(q).toContain('brightness=10')
  })

  it('serializes gravity (string and focus-point object) with readable colons', () => {
    expect(serializeModifiers({ gravity: 'sm' })).toBe('gravity=sm')
    expect(serializeModifiers({ gravity: { type: 'fp', x: 0.5, y: 0.3 } })).toBe('gravity=fp:0.5:0.3')
  })

  it('serializes crop with gravity', () => {
    expect(serializeModifiers({ crop: { width: 100, height: 50, gravity: 'sm' } })).toBe('crop=100:50:sm')
  })

  it('serializes adjust, trim, watermark, padding', () => {
    expect(serializeModifiers({ adjust: { brightness: 10, contrast: 0.9, saturation: 1.1 } })).toBe('adjust=10:0.9:1.1')
    expect(serializeModifiers({ trim: { threshold: 10, color: 'ffffff', equalHor: true, equalVer: false } })).toBe('trim=10:ffffff:1:0')
    expect(serializeModifiers({ watermark: { opacity: 0.5, position: 'soea', x: 10, y: 10, scale: 0.2 } })).toBe('watermark=0.5:soea:10:10:0.2')
    expect(serializeModifiers({ padding: 20 })).toBe('padding=20')
    expect(serializeModifiers({ padding: { top: 1, right: 2, bottom: 3, left: 4 } })).toBe('padding=1:2:3:4')
  })

  it('serializes an RGB-triplet background and a per-format quality object', () => {
    expect(serializeModifiers({ background: [255, 0, 128] })).toBe('background=255:0:128')
    expect(serializeModifiers({ formatQuality: { webp: 80, avif: 60 } })).toBe('formatQuality=webp:80:avif:60')
  })

  it('decomposes a resize object onto w/h/fit', () => {
    expect(serializeModifiers({ resize: { type: 'fill', width: 300, height: 400, enlarge: true } }))
      .toBe('w=300&h=400&fit=fill&enlarge=1')
  })

  it('serializes boolean flags as =1 and omits falsy ones', () => {
    expect(serializeModifiers({ stripMetadata: true, enforceThumbnail: true })).toBe('stripMetadata=1&enforceThumbnail=1')
    expect(serializeModifiers({ stripMetadata: false })).toBe('')
  })

  it('serializes presets and the rawOptions escape hatch (→ opts)', () => {
    expect(serializeModifiers({ preset: ['sharp', 'mine'] })).toBe('preset=sharp:mine')
    expect(serializeModifiers({ width: 10, rawOptions: ['gr:0.5:1:0', 'co:0.8'] })).toBe('w=10&opts=gr:0.5:1:0,co:0.8')
  })

  it('returns an empty string with no modifiers', () => {
    expect(serializeModifiers({})).toBe('')
  })
})
