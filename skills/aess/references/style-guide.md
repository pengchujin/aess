# Style guide

Distilled from the 2019–2026 Apple event summary slides, studied through the "All Apple Event Summary Slides" collection by Ricky Zhang on Figma Community. The renderer already implements tokens and geometry, so this file is about choices.

## Anatomy of the look

- No slide title, logo or footer. The grid *is* the slide, and the hero names the subject.
- Uniform gap (≈17px at 1920) equals the outer margin. Radius ≈36px. No shadows or borders on cards.
- Roughly 3–5 irregular columns, cards nested inside them. Nothing lines up across the whole slide except column edges.
- All text centered, except labels beside an icon. Captions: weight 500, ≈25px, near-black. They stay the same size across the slide — hierarchy comes from the headlines, not from varying captions.
- Headline numbers: bold, tight tracking, usually **dark grey** rather than black. A *few* get gradients. Small grey words above and below ("Up to / 192GB / unified memory") are the signature pattern.
- Three of every four cards are quiet; one is loud. Color is rationed: at most one full-color hero plus 1–3 gradient words or tinted cards.

## Themes (`theme`)

| value | look | use for |
|---|---|---|
| `white` | white page, grey cards | default; consumer features, software, personal or everyday subjects |
| `grey` | grey page, white cards | hardware, specs, clean technical lists |
| `dark` | black page, charcoal cards | pro/performance, chips, sustainability, anything dramatic |
| `glass` | frosted cards over a colorful `backdrop` (bg name or image path) | immersive, spatial, travel, lifestyle, music |

**Real brands use their official palette only**, set through the `brand` block (see `official-assets.md`). `brand.colors[0]` becomes `accent`, and `"bg":"brand"`, `"grad":"brand"`, and the color names `brand`, `brand2`, `brand3` draw from the same list. The theme table below suggests accents for fictional subjects; for a real brand, its palette overrides them.

For fictional subjects, set `accent` to a color drawn from the subject (product finish, the mood of the topic). It colors `**highlights**`, icon discs, bars, charts, and `"bg":"auto"` heroes, so one value makes the whole slide feel made for this subject.

## Adapt the small cards to the subject

Apple never reuses a generic tile when the feature has a form of its own: zoom is a lens selector, cores are a die, battery is a green pill, audio is a waveform, and privacy is a lock. Do the same. Ask of every fact, "what does this look like in the product or in the real world?", and reach for that form before falling back to `stat` + `feature`.

| subject | theme / accent | signature small cards |
|---|---|---|
| camera, video, imaging | `dark`, gold or yellow | `segments` (zoom), `frame` (focus), `media` with a big word (HDR), `badge` (RAW, Log), metal `statement` |
| chips, hardware, performance | `dark` or `grey`, cool blue/purple | `chips` (tiers), `cores`, `stat` trios, `icons` (ports), `dim` (size) |
| software, OS, apps | `white`, multi-hue `bg` | app-style `feature`, `window`, `notif`, `bubbles`, `toggles` |
| developer tools, infra | `grey` or `dark`, indigo/green | `terminal`, `window`, `badge`, `bars` (with `labels`), `spark`, `replace` (old→new) |
| AI, assistants | `dark` or `white`, `intelligence` gradient | `bubbles`, gradient `statement`, `hero` with `textGrad`, `notif` |
| fitness, health | `white`, red/pink | `rings`, `spark`, `bars`, `toggles`, `ripple`, tinted `statement` |
| audio, music | `dark` or `glass`, violet | `wave`, `ripple`, `bars` as an equalizer, `segments` (modes) |
| sustainability | `dark` or `white`, green | marker `statement` with `decor`, `list` with `NO`, `meter`, green `plain` icons |
| finance, business, annual report | `grey`, deep blue or brand | `stat` with large numbers, `spark` (growth), `bars`, `meter`, `pill` |
| food, retail, consumer brand | `white`, brand warm | emoji or photo `feature`, `swatch` (flavors), `meter`, tinted `stat`, script `statement` |
| travel, personal recap, lifestyle | `glass`, from the photos | `media` with a place name, `thumbs`, emoji `feature`, script `statement`, `bubbles` |
| events, people, résumé | `white` or `grey`, personal | `stat` (impact), `thumbs`, `replace` (before→after), script `statement` |

Use the table as a starting point. Invent freely when the subject suggests something else: `html` or `svg` can draw anything, and a card that could only belong to this subject is worth more than three generic ones. Skip a card whose metaphor doesn't apply: a `segments` selector needs real discrete options, and a `spark` needs real data points from the user, so never draw a shape that implies data you weren't given.

## Card catalog

Every card takes optional `size` (`xs s m l xl xxl`), `center: true` to pull it toward the middle, `aspect` (w/h) to force a shape, `tint` (any color; a soft wash of it) or `cardBg` (exact background), and `secondary: true` to drop it from portrait. Text fields support `**accent**` (uses the card's `grad`, else `color`) and `\n`.

| kind | fields | when |
|---|---|---|
| `hero` | `text, top, sub, bg, image, logo (true = brand.logo, or a path), logoPlate, logoSize, pattern:"rings", textColor, textGrad` | Exactly one big full-bleed gradient or photo tile with white title. Always `size:"l"` or larger. |
| `stat` | `top, value, bottom, color, grad` | Any number. The workhorse: use for ≈1/3 of cards. |
| `statement` | `text, top, bottom, style(plain/gray/gradient/metal/outline/script/marker), grad, color, decor(arrows/ring), fontSize` | Short claim ("Thinnest ever", "无风扇设计"). `fontSize` caps it. |
| `feature` | `visual, caption, captionTop` | Icon, device, chip or photo with caption. The other workhorse. |
| `media` | `image` or `bg`, `text, caption, textColor, fit` | Full-bleed photo or gradient, with an optional big word on it ("HDR", "GPS") and a caption. |
| `side` | `visual, label` | Small icon + label in a row ("Conversation Awareness"). |
| `icons` | `items:[{icon or visual, label}], caption` | Row of 2–4 ports or minor specs. |
| `pill` | `before, value, after, color` | "Up to [21 hours] battery life". |
| `frame` | `text, color` | Text in orange focus brackets — camera/precision features. |
| `wave` | `text, grad` | Gradient word between waveforms — audio/voice features. |
| `swatch` | `top, colors, bottom` | Color options. |
| `bubbles` | `items:[{text, from:"me"}], caption, color` | Messaging/social/AI chat. |
| `thumbs` | `label, items:[bg name or {image}]` | Label beside thumbnails — galleries, collections. |
| `list` | `items, style(no/strike/check), prefix, color, caption` | "NO mercury / NO PVC", struck-out or checked items. |
| `meter` | `percent, value, top, bottom, color` | A percentage worth showing as a ring. |
| `sizes` | `items, visual, grad, caption` | Two values flanking a visual (16″ / 14″). |
| `segments` | `items, active, color, top, caption` | Discrete options in a capsule: zoom levels, plans, modes. |
| `cores` | `grid:[cols,rows], lit, value, bottom, color, grad` | Die-style cell grid over a value: core counts, slots, seats. |
| `chips` | `items:[{name,sub,grad}], caption` | Side-by-side tiers (base/pro/max). |
| `bars` | `values, labels, highlight, value, top, caption, color` | Small column chart from real numbers. Add `labels` for comparisons. |
| `spark` | `values, value, top, caption, color` | Line and area chart from real numbers. |
| `toggles` | `items:[{label,on}], caption, color` | Settings list; options, permissions, automations. |
| `window` | `title, lines, image, caption, color` | Tiny app window with text, a screenshot or skeleton lines. |
| `notif` | `title, body, icon, bg, caption` | Notification banner: alerts, real-time features. |
| `badge` | `items, top, caption, color` | Outlined format tags: "ProRes", "AV1", "ESM". |
| `rings` | `values, colors, top, caption` | Concentric activity rings; goals, multi-part progress. |
| `ripple` | `text, colors` | A word at the center of pastel rings: haptics, sound, signal, reach. |
| `dim` | `width, height, visual, caption` | A visual with dimension lines. |
| `replace` | `from, to, caption, color, grad` | Old struck out, new below: "Hey → Siri", before→after. |
| `terminal` | `lines (prefix "$ " to color), caption, color` | Console for developer subjects. |
| `html` | `html` | Escape hatch for a truly bespoke card. |

**`visual`** is one of:
- `{"icon":"wifi","style":"plain|circle|app","color":"blue","bg":"violet"}` — 1,700 Lucide names in English kebab-case; find them with `scripts/find-icon.mjs <keyword>`. `circle` = white on a colored disc; `app` = app-icon squircle; `plain` = bare glyph.
- `{"device":"phone|tablet|laptop|watch","bg":"sunset","image":"shot.png","time":"9:41","screenText":"…"}`
- `{"chip":"X3","sub":"ULTRA","grad":"ice"}` — dark processor square. Use only for actual chips or a similar "core engine".
- `{"logo":true}` — the official logo from `brand.logo`.
- `{"image":"photo.png","fit":"cover"}` — `cover` fills the card edge to edge; the default is contained. PNG, JPG, WebP and SVG all work. Add `"scale": 1.4` when a transparent product shot has wide empty margins.
- `{"emoji":"🎧"}` — large objects when no icon or photo fits.
- `{"svg":"<svg…>"}` — draw a custom illustration when the subject deserves it.

**Tokens.** `grad`: `brand rainbow blue teal purple pink sunset gold green silver ice titanium intelligence ember lime`, or any CSS gradient. `color`: `accent brand brand2 brand3 blue green orange red purple pink teal yellow gray black white`, or any CSS color. `bg`: `brand` (official colors), `sunset sunrise violet ocean mint ember aurora graphite sky`, `auto` (built from `accent`), `{"mesh":["#a","#b","#c"]}`, or any CSS gradient.

## Casting the slide

- **Open with the hero.** Name the product, the year, the person. Pick a `bg` that suits the subject.
- **Mix.** Target for 20 cards: 1 hero, 6–7 `stat`, 6–7 `feature`, 2–3 `statement`, 2–4 specialty cards (`wave`, `frame`, `bubbles`, `pill`, `list`…). Specialty cards are what make it feel designed, so use them when the content fits, and never force a card whose metaphor doesn't apply.
- **Sizes tell the story.** The 3–4 most important facts go `l`; supporting ones `m`/`s`. If everything is the same size, the slide looks like a spreadsheet.
- **Gradients are rationed.** 1–3 per slide, on the most impressive number or word. `rainbow` suits the single most striking stat (contrast, color counts). Leave other numbers grey.
- **One visual idea per family.** All connectivity icons as blue `circle`s, all eco icons green `plain`, and so on. That consistency is much of what makes it look expensive.
- **Non-product content** works the same way: a year-in-review hero is the year, stats are milestones, features are projects; a résumé hero is the name, stats are impact numbers.
- **Green marker style** (`style:"marker"`, `decor`, `list` with `NO`) belongs to sustainability or a playful hand-made subject; it looks random elsewhere. Marker Felt has no Chinese glyphs, so Chinese falls back to a handwriting font if installed — prefer the plain bold style for Chinese.

## Portrait (3:4)

`--format portrait` renders 1080×1440 at 2× (2160×2880). The hero moves to the top, type is larger so it holds up at phone width, and cards marked `secondary` are dropped. Aim for 10–16 cards, favor tall or square kinds, and leave out wide ones (`wave`, `icons`, `thumbs`) unless they earn it.

## Manual layout

Auto layout handles most slides. To place by hand, set `"grid":[12,8]` at the top level and `"at":[col,row,colSpan,rowSpan]` on every card; check coverage yourself, because holes render as empty page.

## Other options

`format` (`landscape`, `portrait`), `width`, `height` (any custom size, for example 1080×1920), `scale` (default 2), `seed`, `accent`, `backdrop`, `gap`, `margin`, `radius`.
