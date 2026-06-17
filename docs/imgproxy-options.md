# imgproxy option reference

Every imgproxy processing option is reachable through `:modifiers` on
`<NuxtImg>` / `<NuxtPicture>`, or as the second argument to `buildImgproxyUrl`.

Keys are **camelCase**; they're serialized to imgproxy's short option names. The
**Pro** column marks options that require an imgproxy Pro license on the server.
For the authoritative semantics of each option, see the
[imgproxy processing docs](https://docs.imgproxy.net/usage/processing).

> Anything not listed here can still be sent verbatim via
> `rawOptions: ['option:arg1:arg2', …]`.

## Standard Nuxt modifiers

| Modifier     | imgproxy      | Pro | Example                                  |
| ------------ | ------------- | --- | ---------------------------------------- |
| `width`      | `w`           |     | `{ width: 800 }`                         |
| `height`     | `h`           |     | `{ height: 600 }`                        |
| `fit`        | `rt`          |     | `{ fit: 'cover' }` → `rt:fill`           |
| `format`     | extension     |     | `{ format: 'webp' }` → `…@webp`          |
| `quality`    | `q`           |     | `{ quality: 80 }`                        |
| `background` | `bg`          |     | `{ background: 'fff' }` / `[255,0,0]`    |

`fit` mapping: `cover→fill`, `contain→fit`, `fill→force`, `inside→fit`,
`outside→fill`. Native imgproxy values (`force`, `auto`, `fill-down`) pass through.

## Resize & dimensions

| Modifier            | imgproxy | Pro | Notes |
| ------------------- | -------- | --- | ----- |
| `resize`            | `rs`     |     | `{ type, width, height, enlarge, extend }` |
| `resizingType`      | `rt`     |     | `fit \| fill \| fill-down \| force \| auto` |
| `resizingAlgorithm` | `ra`     | ✅  | `nearest \| linear \| cubic \| lanczos2 \| lanczos3` |
| `size`              | `s`      |     | `{ width, height, enlarge, extend }` |
| `minWidth`          | `mw`     |     | |
| `minHeight`         | `mh`     |     | |
| `zoom`              | `z`      |     | `number` or `[x, y]` |
| `dpr`               | `dpr`    |     | device pixel ratio |
| `enlarge`           | `el`     |     | boolean |
| `extend`            | `ex`     |     | `true` or `{ gravity }` |
| `extendAspectRatio` | `exar`   |     | `true` or `{ gravity }` |

## Geometry

| Modifier     | imgproxy | Pro | Notes |
| ------------ | -------- | --- | ----- |
| `gravity`    | `g`      |     | `'sm'`, `'ce'`, `'no'`…, or `{ type, x, y }` (e.g. `fp` focus point) |
| `crop`       | `c`      |     | `{ width, height, gravity }` |
| `trim`       | `t`      | ✅  | `{ threshold, color, equalHor, equalVer }` |
| `padding`    | `pd`     |     | `number` or `{ top, right, bottom, left }` |
| `autoRotate` | `ar`     |     | boolean |
| `rotate`     | `rot`    |     | `0 \| 90 \| 180 \| 270` |

## Color & effects

| Modifier          | imgproxy | Pro | Notes |
| ----------------- | -------- | --- | ----- |
| `background`      | `bg`     |     | `'rrggbb'` or `[r, g, b]` |
| `backgroundAlpha` | `bga`    | ✅  | `0`–`1` |
| `adjust`          | `a`      | ✅  | `{ brightness, contrast, saturation }` |
| `brightness`      | `br`     | ✅  | |
| `contrast`        | `co`     | ✅  | |
| `saturation`      | `sa`     | ✅  | |
| `blur`            | `bl`     |     | sigma |
| `sharpen`         | `sh`     |     | sigma |
| `pixelate`        | `pix`    | ✅  | block size |
| `unsharpening`    | `ush`    | ✅  | `[mode, weight, divider]` |
| `monochrome`      | `mc`     | ✅  | |
| `duotone`         | `dt`     | ✅  | |

## Watermark

| Modifier          | imgproxy | Pro | Notes |
| ----------------- | -------- | --- | ----- |
| `watermark`       | `wm`     |     | `{ opacity, position, x, y, scale }` |
| `watermarkUrl`    | `wmu`    | ✅  | base64 URL of the watermark image |
| `watermarkText`   | `wmt`    | ✅  | |
| `watermarkSize`   | `wms`    | ✅  | `[w, h]` |
| `watermarkRotate` | `wmr`    | ✅  | degrees |
| `watermarkShadow` | `wmsh`   | ✅  | |

## Layout & metadata

| Modifier            | imgproxy | Pro | Notes |
| ------------------- | -------- | --- | ----- |
| `style`             | `st`     | ✅  | CSS-like style string |
| `stripMetadata`     | `sm`     |     | boolean |
| `keepCopyright`     | `kcr`    |     | boolean |
| `stripColorProfile` | `scp`    |     | boolean |
| `enforceThumbnail`  | `eth`    | ✅  | boolean |
| `dpi`               | `dpi`    | ✅  | |

## Output

| Modifier             | imgproxy | Pro | Notes |
| -------------------- | -------- | --- | ----- |
| `quality`            | `q`      |     | `0`–`100` |
| `formatQuality`      | `fq`     | ✅  | `{ webp: 80, avif: 60 }` or a raw string |
| `autoquality`        | `aq`     | ✅  | `method:target:min:max` |
| `maxBytes`           | `mb`     | ✅  | cap output size |
| `jpegOptions`        | `jpgo`   | ✅  | array or raw string |
| `pngOptions`         | `pngo`   | ✅  | array or raw string |
| `gifOptions`         | `gifo`   | ✅  | array or raw string |
| `format`             | extension |    | preferred over `f:` |
| `page`               | `pg`     | ✅  | multi-page documents |
| `pages`              | `pgs`    | ✅  | |
| `disableAnimation`   | `da`     | ✅  | boolean |
| `videoThumbnailSecond` | `vts`  | ✅  | |
| `fallbackImageUrl`   | `fiu`    | ✅  | base64 URL |

## Flow & serving

| Modifier             | imgproxy | Pro | Notes |
| -------------------- | -------- | --- | ----- |
| `skipProcessing`     | `skp`    |     | list of extensions to skip |
| `raw`                | `raw`    | ✅  | serve raw bytes |
| `cachebuster`        | `cb`     |     | |
| `expires`            | `exp`    |     | unix timestamp |
| `filename`           | `fn`     |     | download filename |
| `returnAttachment`   | `att`    |     | boolean |
| `preset`             | `pr`     |     | `string` or `string[]` (applied first) |
| `maxSrcResolution`   | `msr`    |     | megapixels |
| `maxSrcFileSize`     | `msfs`   |     | bytes |
| `maxAnimationFrames` | `maf`    |     | |

## Escape hatch

```ts
{
  rawOptions: [
    'gradient:0.5:1:0',     // any option, any version of imgproxy
    'watermark_text:Hello',
  ],
}
```

`rawOptions` segments are appended verbatim after all mapped options.
