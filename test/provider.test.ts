import { describe, expect, it } from 'vitest'
import providerFactory, { getImage } from '../src/provider'

describe('Nuxt Image provider', () => {
  it('getImage returns a { url } from src + modifiers + options', () => {
    const { url } = getImage('uploads/a.jpg', {
      modifiers: { width: 300, height: 200, format: 'webp' },
      baseURL: 'https://my-shop.com',
    })
    expect(url).toBe('https://my-shop.com/cdn/insecure/w:300/h:200/plain/uploads/a.jpg@webp')
  })

  it('works with no modifiers', () => {
    expect(getImage('a.jpg').url).toBe('/cdn/insecure/plain/a.jpg')
  })

  it('default export is a Nuxt-compatible provider factory exposing getImage', () => {
    const provider = providerFactory()
    expect(typeof provider.getImage).toBe('function')
    expect(provider.getImage('a.jpg', { modifiers: { width: 50 } }).url)
      .toBe('/cdn/insecure/w:50/plain/a.jpg')
  })

  it('forwards encoding and signing options from the provider config', () => {
    const { url } = getImage('a.jpg', { modifiers: { width: 10 }, encode: 'base64', signature: false })
    expect(url).toMatch(/^\/cdn\/w:10\/[\w-]+$/)
  })
})
