// Reference Nuxt config showing how to wire up @revenexx/storage-nuxt-image.
// To run: `npm install` here, then `npm run dev` (see playground/README.md).
import { presets } from '@revenexx/storage-nuxt-image'

export default defineNuxtConfig({
  modules: ['@nuxt/image'],
  image: {
    provider: 'storage',
    // Ready-made presets: <NuxtImg preset="card" …>. Spread + extend as needed.
    presets: {
      ...presets,
      banner: { width: 1600, height: 400, fit: 'cover', format: 'webp', quality: 80 },
    },
    providers: {
      storage: {
        provider: '@revenexx/storage-nuxt-image',
        options: {
          // Leave empty for relative `/cdn/…` URLs (recommended — works on any
          // customer domain). Or pin an origin: baseURL: 'https://my-shop.com'.
          baseURL: '',
        },
      },
    },
  },
})
