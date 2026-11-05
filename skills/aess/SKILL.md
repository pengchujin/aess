---
name: aess
description: aess (Apple Event Summary Slides) turns any content into one dense bento summary-slide image (PNG) in the style of Apple keynote recap slides — rounded cards, huge numbers, gradient words, a hero tile, and small cards whose form matches the subject (lens selectors for cameras, consoles for dev tools, activity rings for fitness). Landscape 16:9 or phone-friendly portrait 3:4. Use whenever the user sends notes, a press release, a changelog, specs, release notes, a year-in-review, a résumé or a product intro and wants 总结图 / 发布会总结图 / 苹果发布会风格 / 苹果风 / bento 图 / 便当盒布局 / 一图看懂 / 功能汇总图 / 竖版长图 / 手机版总结图 / 小红书配图 / summary slide / recap image / feature wall. Also use when the user just pastes content after invoking /aess — the content alone is the whole brief; do not ask them about layout or colors.
---

# aess — Apple Event Summary Slides

The user sends content; you return one finished PNG. They should not have to direct the design. Ask a question only if the content is too thin to fill 10 cards *and* you can't reasonably cut the count.

## Workflow

1. **Distill.** Read everything, then extract atomic facts. One card = one fact. Every fact and number must come from the user's content or from a source you found in step 5: never invent specs, and never round or embellish, because this image will be read as a statement of fact. Cut anything secondary; the slide's power comes from what is left out.
2. **Pick the format.** Landscape (16–26 cards) by default. Use portrait 3:4 (10–16 cards) when the user mentions phones, 竖屏/竖版, 手机, 小红书, 朋友圈, 公众号 or stories. If they want both, use `--format both`, and mark the less important cards `"secondary": true`; portrait drops those so the type stays readable on a phone.
3. **Write the words short.** Captions ≤ 8 汉字 or 3–4 English words; headline numbers carry the unit ("60 小时", "192GB"). Keep the user's language. Rewriting into noun phrases is the job; full sentences kill the look. Insert `\n` wherever a multi-line headline should break, since explicit breaks stop ugly wrapping and hold text at the size you intended.
4. **Read the subject, then cast the cards.** Read `references/style-guide.md` — it holds the card catalog, the subject→card mapping, and the rhythm rules. This is the step that separates a good slide from a template: decide what this subject *is* and what its small cards should look like, pick a theme, and for a real brand take every color from its official palette (fictional subjects can derive an `accent` from the mood), then choose kinds that show the fact instead of only stating it. A camera's zoom range is a `segments` selector; a dev tool's speed is a `terminal`; a sleep score is a `rings`. Pick exactly one hero.
5. **Search for the right icons and content.** Generic visuals are what make a slide look like a template, so look before you settle.
   - **Icons, every time.** Look up each concept instead of guessing a name, trying English synonyms when the first word misses, and take the most specific result:
     ```bash
     node ~/.claude/skills/aess/scripts/find-icon.mjs "credit card" moon heart
     ```
   - **Official logo and colors: required for any real brand, product, company or organization.** Read `references/official-assets.md` and work through its routes before writing the spec. Save files to `aess-assets/` and open each with Read to confirm it is the real thing. An emoji, a drawn device or a color chosen by mood must never stand in for official assets on a real brand's slide, because a viewer spots a wrong logo or off-brand color at once. If every route fails, stop and ask the user to send the logo; don't deliver without it.
   - **Official product photos, when they exist.** Use them for the hero and large cards, and in place of emoji or icons for the actual products. Skip this step only for fictional or generic subjects, and use the user's own images first when they supply any.
   - **Content, when it fills a real gap.** If the user names a subject but gives too little to fill the slide, or asks you to look things up, search for the missing facts. Start with the official site's own figures, then filings and reliable press, leave out anything you can't confirm, and let the user's content win when the two disagree. If the user's content is already enough, don't add to it, as they chose what to say.
   - **No search tool?** For fictional or generic subjects, carry on with icons, drawn devices, gradients or emoji. For a real brand, ask the user for the logo, since official assets are required.
6. **Write `spec.json`** in the working directory (or wherever the user wants output), then render:
   ```bash
   node ~/.claude/skills/aess/scripts/render.mjs spec.json -o summary.png                  # 16:9, 3840×2160
   node ~/.claude/skills/aess/scripts/render.mjs spec.json --format portrait -o summary.png # 3:4, 2160×2880
   node ~/.claude/skills/aess/scripts/render.mjs spec.json --format both -o summary.png     # summary-landscape.png + summary-portrait.png
   ```
   The renderer lays out the cards, fits the text, and prints JSON with `overflow` and `warnings`.
7. **Look at the PNG with Read, and fix what you see.** Do this every time; the JSON report can't judge taste. Check: Is anything tiny, clipped or wrapped badly? Is the hero dominant? Do you have stretches of same-looking cards? Fix by shortening text, changing a card's `kind` or `size`, or re-rolling with `--seed 2`, `--seed 3`… (each seed is a different arrangement, so try 2–3 if the first composition feels off). If auto layout keeps missing, place cards by hand (see "Manual layout" in the style guide).
8. **Deliver** the PNG path and a one-line note of any facts you dropped. List every fact and image you found by searching, with its source link, so the user can check the facts and confirm they may use the images before publishing. Say so if any product image is still a drawn stand-in, and tell them they can send photos to swap in. The matching `.html` sits beside the PNG for editing.

## Spec at a glance

A real brand adds a `brand` block; rendering stops if the logo file is missing or the colors are invalid, and warns about off-brand colors or a logo no card shows:

```json
{
  "brand": {"name": "老乡鸡", "logo": "aess-assets/logo.png", "colors": ["#0e7a41", "#008042", "#e8dccc"]},
  "cards": [{"kind": "hero", "logo": true, "logoPlate": true, "text": "养了40年鸡\n熬了20年汤", "bg": "brand", "size": "l"}]
}
```

A fictional subject needs no `brand`:

```json
{
  "title": "Halo X",
  "theme": "dark",
  "accent": "#ffcc00",
  "cards": [
    {"kind": "hero", "text": "Halo X", "sub": "口袋里的电影机", "bg": "graphite", "textGrad": "titanium", "size": "l"},
    {"kind": "segments", "items": [".5", "1", "2×", "5×"], "active": 2, "caption": "四档光学变焦"},
    {"kind": "stat", "value": "48MP", "bottom": "主摄", "grad": "gold", "size": "l"},
    {"kind": "stat", "top": "续航", "value": "3.5 小时", "secondary": true}
  ]
}
```

Worked specs, one per subject type, are in `examples/`: `camera.json`, `devtool.json`, `fitness.json`, `travel.json`, `coffee.json`, `dark-eco.json`, `grey-mac.json`, `tech.json`.

## Images

The originals get their impact from real product photography. Use the user's images first, then what you found in step 5, as the hero and as large `feature`/`media` cards; this lifts the result more than anything else. Reference downloaded files by local path rather than by URL, so rendering stays reliable. For fictional or generic subjects without images, use the `device` visuals, gradients, emoji, or a custom inline `svg` you draw for the subject. Use a brand's logo or product photos only when the slide is actually about that brand, and don't pass the slide off as that brand's own. Don't copy Apple's slides, and don't add Apple imagery to slides about anything else — the style is what's being borrowed.

## Requirements

Headless Chrome/Chromium (auto-detected on macOS and Linux, or set `CHROME_PATH`) and Node 18+. SF Pro and PingFang come from macOS; on other systems text falls back to the local sans-serif, so warn the user that the type will differ.
