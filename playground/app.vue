<script setup lang="ts">
// A few examples of the provider in action. Inspect the generated <img src>
// in your browser devtools to see the generated CDN URLs.
</script>

<template>
  <main style="font-family: sans-serif; max-width: 960px; margin: 2rem auto;">
    <h1>@revenexx/storage-nuxt-image — playground</h1>

    <h2>Basic resize + format</h2>
    <NuxtImg src="/uploads/hero.jpg" width="800" height="450" fit="cover" format="webp" />

    <h2>Presets</h2>
    <NuxtImg preset="thumbnail" src="/uploads/portrait.jpg" />
    <NuxtImg preset="avatar" src="/uploads/user.jpg" />
    <NuxtImg preset="card" src="/uploads/photo.jpg" />

    <h2>Smart gravity crop</h2>
    <NuxtImg
      src="/uploads/portrait.jpg"
      :modifiers="{ crop: { width: 400, height: 400, gravity: 'sm' }, quality: 82 }"
    />

    <h2>Watermark (shorthand + full)</h2>
    <NuxtImg src="/uploads/product.jpg" :width="600" :modifiers="{ watermark: 0.4 }" />
    <NuxtImg
      src="/uploads/product.jpg"
      :width="1200"
      :modifiers="{
        gravity: { type: 'fp', x: 0.5, y: 0.35 },
        watermark: { opacity: 0.35, position: 'soea', x: 16, y: 16, scale: 0.12 },
        format: 'avif',
      }"
    />

    <h2>Responsive (NuxtPicture)</h2>
    <NuxtPicture src="/uploads/banner.jpg" sizes="sm:100vw md:50vw lg:800px" format="avif,webp" />
  </main>
</template>
