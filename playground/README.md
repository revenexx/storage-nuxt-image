# Playground

A minimal Nuxt app demonstrating `@revenexx/storage-nuxt-image`. It is a
reference example — not part of the package's build or test run.

## Run it

```bash
cd playground
npm install nuxt @nuxt/image @revenexx/storage-nuxt-image
npm run dev   # or: npx nuxi dev
```

Then open the app and inspect the generated `<img src>` values in devtools to
see the imgproxy URLs the provider produces.

> While developing the package locally, link it instead of installing from npm:
> from the repo root run `npm pack` and `npm install ../<tarball>.tgz` here, or
> use your package manager's workspace/link feature.
