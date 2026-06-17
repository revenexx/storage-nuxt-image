<script setup lang="ts">
// A few examples of the provider in action. Inspect the generated <img src>
// in your browser devtools to see the imgproxy URLs.
</script>

<template>
  <main style="font-family: sans-serif; max-width: 960px; margin: 2rem auto;">
    <h1>@revenexx/storage-nuxt-image — playground</h1>

    <h2>Basic resize + format</h2>
    <NuxtImg src="/uploads/hero.jpg" width="800" height="450" fit="cover" format="webp" />

    <h2>Smart gravity crop (imgproxy)</h2>
    <NuxtImg
      src="/uploads/portrait.jpg"
      :modifiers="{ crop: { width: 400, height: 400, gravity: 'sm' }, quality: 82 }"
    />

    <h2>Pro: adjust + watermark + focus point</h2>
    <NuxtImg
      src="/uploads/product.jpg"
      :width="1200"
      :modifiers="{
        gravity: { type: 'fp', x: 0.5, y: 0.35 },
        adjust: { brightness: 8, saturation: 1.1 },
        watermark: { opacity: 0.35, position: 'soea', x: 16, y: 16, scale: 0.12 },
        format: 'avif',
      }"
    />

    <h2>Responsive (NuxtPicture)</h2>
    <NuxtPicture src="/uploads/banner.jpg" sizes="sm:100vw md:50vw lg:800px" format="avif,webp" />
  </main>
</template>
