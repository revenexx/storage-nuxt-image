# Transformation reference

Every transformation the revenexx Storage CDN supports is reachable through
`:modifiers` on `<NuxtImg>` / `<NuxtPicture>`, or as the second argument to
`buildImageUrl`. Each modifier becomes a **query parameter** on the `/cdn/` URL;
the CDN validates, clamps and signs the transform server-side.

> Anything not listed here can be sent verbatim via `rawOptions` (→ the CDN's
> `opts` parameter), e.g. `rawOptions: ['gr:0.5:1:0']`.

## Standard Nuxt modifiers

| Modifier     | Query param  | Example                                  |
| ------------ | ------------ | ---------------------------------------- |
| `width`      | `w`          | `{ width: 800 }` → `w=800`               |
| `height`     | `h`          | `{ height: 600 }` → `h=600`              |
| `fit`        | `fit`        | `{ fit: 'cover' }` → `fit=cover`         |
| `format`     | `fm`         | `{ format: 'webp' }` → `fm=webp`         |
| `quality`    | `q`          | `{ quality: 80 }` → `q=80`               |
| `background` | `background` | `{ background: [255,0,0] }` → `background=255:0:0` |

`fit` values: `cover` / `fill` / `crop` fill the box (cropping); `contain` /
`inside` / `outside` fit within it.

## Resize & dimensions

| Modifier            | Query param         | Notes |
| ------------------- | ------------------- | ----- |
| `resize`            | `w` / `h` / `fit`   | `{ type, width, height, enlarge }` — decomposed |
| `size`              | `w` / `h`           | `{ width, height, enlarge }` |
| `resizingAlgorithm` | `resizingAlgorithm` | `nearest \| linear \| cubic \| lanczos2 \| lanczos3` |
| `minWidth`          | `minWidth`          | |
| `minHeight`         | `minHeight`         | |
| `zoom`              | `zoom`              | `number` or `[x, y]` |
| `dpr`               | `dpr`               | device pixel ratio |
| `enlarge`           | `enlarge`           | boolean → `enlarge=1` |
| `extend`            | `extend`            | `true` or `{ gravity }` |
| `extendAspectRatio` | `extendAspectRatio` | `true` or `{ gravity }` |

## Geometry

| Modifier     | Query param  | Notes |
| ------------ | ------------ | ----- |
| `gravity`    | `gravity`    | `'sm'`, `'ce'`, `'no'`…, or `{ type, x, y }` (e.g. `fp` focus point) → `gravity=fp:0.5:0.3` |
| `crop`       | `crop`       | `{ width, height, gravity }` → `crop=100:50:sm` |
| `trim`       | `trim`       | `{ threshold, color, equalHor, equalVer }` |
| `padding`    | `padding`    | `number` or `{ top, right, bottom, left }` |
| `autoRotate` | `autoRotate` | boolean |
| `rotate`     | `rotate`     | `0 \| 90 \| 180 \| 270` |

## Colour & effects

| Modifier          | Query param       | Notes |
| ----------------- | ----------------- | ----- |
| `background`      | `background`      | `'rrggbb'` or `[r, g, b]` |
| `backgroundAlpha` | `backgroundAlpha` | `0`–`1` |
| `adjust`          | `adjust`          | `{ brightness, contrast, saturation }` → `adjust=10:0.9:1.1` |
| `brightness`      | `brightness`      | |
| `contrast`        | `contrast`        | |
| `saturation`      | `saturation`      | |
| `blur`            | `blur`            | sigma |
| `sharpen`         | `sharpen`         | sigma |
| `pixelate`        | `pixelate`        | block size |
| `unsharpening`    | `unsharpening`    | `[mode, weight, divider]` |
| `monochrome`      | `monochrome`      | boolean or value |

## Watermark

| Modifier    | Query param | Notes |
| ----------- | ----------- | ----- |
| `watermark` | `watermark` | `{ opacity, position, x, y, scale }` → `watermark=0.4:soea:16:16:0.15` |

## Layout, metadata & output

| Modifier            | Query param         | Notes |
| ------------------- | ------------------- | ----- |
| `style`             | `style`             | CSS-like style string |
| `stripMetadata`     | `stripMetadata`     | boolean |
| `keepCopyright`     | `keepCopyright`     | boolean |
| `stripColorProfile` | `stripColorProfile` | boolean |
| `enforceThumbnail`  | `enforceThumbnail`  | boolean |
| `dpi`               | `dpi`               | |
| `formatQuality`     | `formatQuality`     | `{ webp: 80, avif: 60 }` → `formatQuality=webp:80:avif:60` |
| `autoquality`       | `autoquality`       | `method:target:min:max` |
| `maxBytes`          | `maxBytes`          | cap output size |
| `page`              | `page`              | multi-page documents |
| `disableAnimation`  | `disableAnimation`  | boolean |

## Presets & escape hatch

| Modifier     | Query param | Notes |
| ------------ | ----------- | ----- |
| `preset`     | `preset`    | `string` or `string[]` (applied first) |
| `rawOptions` | `opts`      | raw, comma-separated transform segments for the long tail |

```ts
{ rawOptions: ['gr:0.5:1:0', 'co:0.8'] } // → ?opts=gr:0.5:1:0,co:0.8
```
