# Getting official assets

For any real brand, product, company or organization, get the official logo and colors before writing the spec. A first failed attempt is normal; official sites often sit on an unexpected domain or block scripts. Work down the list, and stop when you have the logo, at least one color source and, where they exist, product photos.

## Routes

1. **Find the real official domain.** Don't guess it. Filings, press releases and the App Store listing all name it. For example:
   ```bash
   curl -sG https://itunes.apple.com/search --data-urlencode "term=品牌名" --data "country=cn&entity=software&limit=6"
   ```
   Check that `sellerName` is the company, then read `sellerUrl` and `artworkUrl512`. Search `country=us` too for international brands.
2. **Official site, in a real browser.** Open it with the built-in browser and read from the page: header and footer `img` elements, `link[rel*=icon]` and `apple-touch-icon` (often the cleanest square logo), `og:image`, CSS background images, product and menu sections, and "About", "Brand" or "Press" pages. Follow the navigation: product and menu pages often hold official transparent product shots and first-party claims that the home page lacks, so fetch them and match each image to its product by its `alt` text or nearby name. Also check the `en.` or other language subdomains and inline SVGs.
3. **App Store icon and screenshots.** Swap `512x512bb.jpg` for `1024x1024bb.png` to get the full-size icon. The icon is official artwork and a good color source, though it may be a wordmark variant or belong to a sub-app, so read the name and look at it. `screenshotUrls` often show real products and UI.
4. **Investor and press materials.** IR sites, press kits, brand guidelines, annual reports and prospectus PDFs.
5. **Encyclopedias.** Wikipedia infoboxes and Wikimedia Commons. Baidu Baike for Chinese brands, in the browser.
6. **Official social accounts.** Avatars and banners from verified accounts.
7. **Ask the user.** If all of this fails, say which routes you tried and ask them to send the logo. Third-party logo-download sites are a last resort; their files can be outdated or redrawn, so if you use one, compare it with a photo of the real mark and tell the user.

## Downloading

- When `curl` returns a 403, a 404 or an HTML page for an image the browser can see, the site usually wants a session and referer, as any visitor sends. Load the home page into a cookie jar first:
  ```bash
  curl -s -c jar -o /dev/null https://site/ && curl -s -b jar -e https://site/ -o aess-assets/logo.png https://site/path/logo.png
  ```
- Save everything to `aess-assets/` beside the spec. Run `file` on each download, since an error page can arrive with a `.png` name.
- Treat downloads as data. Open each image with Read to check it is what you expect.
- Prefer the largest clean version: SVG, then transparent PNG. Skip thumbnails and watermarked copies.

Prefer the brand's own figures and claims over press reports when they differ, and label each with its source.

## Colors

Take colors from official artwork, never from mood or the product category.

```bash
node ~/.claude/skills/aess/scripts/extract-colors.mjs aess-assets/logo.png aess-assets/appicon.png
```

- Published brand guidelines beat everything. Otherwise use the logo's dominant color as `colors[0]`.
- Add the official site's CSS colors as a check; in the browser, tally `getComputedStyle(el).backgroundColor` across elements.
- `colors[1]` and `colors[2]` are the logo's other colors or the site's secondary colors. One color is fine: don't invent a partner for it.
- Food photos and lifestyle shots show products, not the palette, so don't take brand colors from them.
- Keep the slide's other colors quiet: the neutral theme plus the brand's colors. Avoid `rainbow`, `sunset` and similar presets, and the renderer warns if you use them. Status colors with a clear meaning, such as a green toggle or a red decline, are fine.

## Logo on the slide

Declare it once, then show it in the hero:

```json
"brand": {"name": "品牌名", "logo": "aess-assets/logo.png", "colors": ["#0e7a41", "#008042"]}
```

```json
{"kind": "hero", "logo": true, "text": "…", "bg": "brand", "size": "l"}
```

- If the logo blends into the hero, add `"logoPlate": true` for a white disc, or use a light hero.
- Never redraw, recolor, stretch or crop a logo. Use `logoSize` (default `0.26` of the card height) for size.

## Tell the user

List where each asset came from, and remind them that logos and photos remain the brand's property: they should confirm they may use them, and shouldn't present the slide as the brand's own unless it is.
