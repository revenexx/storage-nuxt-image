import { describe, expect, it } from 'vitest'
import { buildImageUrl, serializeModifiers } from '../src/builder'
import { presets } from '../src/presets'

describe('presets', () => {
  it('ships the documented preset names', () => {
    expect(Object.keys(presets)).toEqual(
      expect.arrayContaining(['thumbnail', 'avatar', 'card', 'hero', 'ogImage', 'placeholder']),
    )
  })

  it('each preset only uses safe, widely-available modifiers', () => {
    for (const [name, preset] of Object.entries(presets)) {
      expect(preset.format, name).toBeTypeOf('string')
      // Extra modifiers, if any, are limited to gravity/blur.
      for (const key of Object.keys(preset.modifiers ?? {})) {
        expect(['gravity', 'blur'], `${name}.modifiers.${key}`).toContain(key)
      }
    }
  })

  it('a preset resolves to a working URL when its options are applied', () => {
    // Nuxt merges a preset's top-level options into modifiers before the
    // provider; emulate that for `card`.
    const { width, height, fit, format, quality, modifiers } = presets.card!
    const url = buildImageUrl('uploads/p.jpg', { width, height, fit, format, quality, ...modifiers })
    expect(url).toBe('/cdn/uploads/p.jpg?w=400&h=300&fit=cover&q=80&fm=webp&gravity=sm')
  })
})

describe('watermark', () => {
  it('accepts a number shorthand for opacity', () => {
    expect(serializeModifiers({ watermark: 0.5 })).toBe('watermark=0.5')
  })

  it('accepts the full object form with a named position', () => {
    expect(serializeModifiers({ watermark: { opacity: 0.4, position: 'soea', x: 16, y: 16, scale: 0.15 } }))
      .toBe('watermark=0.4:soea:16:16:0.15')
  })
})
