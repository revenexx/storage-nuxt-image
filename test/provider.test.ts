import { describe, expect, it } from 'vitest'
import providerFactory, { getImage } from '../src/provider'

describe('Nuxt Image provider', () => {
  it('getImage returns a { url } from src + modifiers + options', () => {
    const { url } = getImage('uploads/a.jpg', {
      modifiers: { width: 300, height: 200, format: 'webp' },
      baseURL: 'https://my-shop.com',
    })
    expect(url).toBe('https://my-shop.com/cdn/uploads/a.jpg?w=300&h=200&fm=webp')
  })

  it('works with no modifiers', () => {
    expect(getImage('a.jpg').url).toBe('/cdn/a.jpg')
  })

  it('default export is a Nuxt-compatible provider factory exposing getImage', () => {
    const provider = providerFactory()
    expect(typeof provider.getImage).toBe('function')
    expect(provider.getImage('a.jpg', { modifiers: { width: 50 } }).url)
      .toBe('/cdn/a.jpg?w=50')
  })

  it('forwards the cdnPath option from the provider config', () => {
    const { url } = getImage('a.jpg', { modifiers: { width: 10, fit: 'cover' }, cdnPath: '/media/' })
    expect(url).toBe('/media/a.jpg?w=10&fit=cover')
  })
})
