// Reference Nuxt config showing how to wire up @revenexx/storage-nuxt-image.
// To run: `npm install` here, then `npm run dev` (see playground/README.md).
export default defineNuxtConfig({
  modules: ['@nuxt/image'],
  image: {
    provider: 'storage',
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
