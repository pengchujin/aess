#!/usr/bin/env node
// Render a bento "event summary" slide from a JSON spec to PNG via headless Chrome. No npm deps.
// Usage: node render.mjs spec.json [-o out.png] [--seed N] [--scale 2] [--html-only]
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { execFileSync } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ICONS = JSON.parse(fs.readFileSync(path.join(HERE, '../assets/icons.json'), 'utf8'));

// ───────── args ─────────
const argv = process.argv.slice(2);
const flag0 = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
if (flag0('--format') === 'both') { // re-run once per orientation
  const base = argv.filter((a, i) => a !== '--format' && argv[i - 1] !== '--format' && a !== '-o' && argv[i - 1] !== '-o');
  const o = (flag0('-o') || base.find(a => a.endsWith('.json')).replace(/\.json$/, '.png')).replace(/\.png$/i, '');
  for (const f of ['landscape', 'portrait']) execFileSync(process.execPath, [fileURLToPath(import.meta.url), ...base, '--format', f, '-o', `${o}-${f}.png`], { stdio: 'inherit' });
  process.exit(0);
}
const flag = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const specPath = argv.find((a, i) => !a.startsWith('-') && !['-o', '--seed', '--scale', '--format'].includes(argv[i - 1]));
if (!specPath) { console.error('usage: render.mjs spec.json [-o out.png] [--format landscape|portrait|both] [--seed N] [--scale 2] [--html-only]'); process.exit(2); }
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const specDir = path.dirname(path.resolve(specPath));
const format = flag('--format', spec.format || 'landscape');
const W = spec.width || (format === 'portrait' ? 1080 : 1920), H = spec.height || (format === 'portrait' ? 1440 : 1080), S = Math.min(W, H) / 1080;
const PORTRAIT = H > W;
const scale = +flag('--scale', spec.scale || 2);
const out = path.resolve(flag('-o', spec.output || specPath.replace(/\.json$/, '') + '.png'));
const seed = +flag('--seed', spec.seed ?? 1);
const cards = (spec.cards || []).filter(c => !(PORTRAIT && c.secondary)); if (!cards.length) { console.error('spec.cards is empty'); process.exit(2); }

// ───────── design tokens (measured from the reference slides, normalized to 1920×1080) ─────────
const THEMES = {
  white: { page: '#ffffff', card: '#ececee', ink: '#1d1d1f', mute: '#56565a', num: '#4b4b4f', hair: '#d6d6da' },   // grey cards on white — iPhone/iOS slides
  grey:  { page: '#e8e8e8', card: '#fefefe', ink: '#1d1d1f', mute: '#56565a', num: '#4b4b4f', hair: '#e2e2e4' },   // white cards on grey — Mac slides
  glass: { page: 'transparent', card: 'rgba(255,255,255,.44)', ink: '#1d1d1f', mute: '#3e3e42', num: '#2b2b2f', hair: 'rgba(0,0,0,.14)' }, // frosted cards over a blurred backdrop — spatial/immersive/lifestyle
  dark:  { page: '#000000', card: '#1c1c1e', ink: '#f5f5f7', mute: '#a1a1a6', num: '#e8e8ed', hair: '#3a3a3c' },   // near-black — pro chips, eco
};
const T = THEMES[spec.theme] || THEMES.white;
const GAP = Math.round((spec.gap ?? 17) * S), MARGIN = Math.round((spec.margin ?? 18) * S), RADIUS = Math.round((spec.radius ?? 36) * S);
const GRADS = {
  rainbow: 'linear-gradient(90deg,#f49ac1,#b78cf2 35%,#68aef2 68%,#6fd6c4)',
  blue: 'linear-gradient(90deg,#2f7cf6,#5ac8fa)', teal: 'linear-gradient(90deg,#3f8efc,#3fd0c9)',
  purple: 'linear-gradient(90deg,#6e5cff,#c56bff)', pink: 'linear-gradient(90deg,#c86bff,#ff5fa2)',
  sunset: 'linear-gradient(90deg,#ff8a1f,#ff4b6e)', gold: 'linear-gradient(90deg,#f0b23a,#ee7d30)',
  green: 'linear-gradient(90deg,#28c76f,#7ddc3b)', silver: 'linear-gradient(180deg,#9a9aa0,#4f4f54)',
  ice: 'linear-gradient(90deg,#a3c8ff,#d9c6ff)',
  titanium: 'linear-gradient(180deg,#e4e4e8,#85858b 52%,#c4c4ca)', intelligence: 'linear-gradient(90deg,#4fa8ff,#a770ff 38%,#ff6fb1 68%,#ffb152)',
  ember: 'linear-gradient(90deg,#ffb347,#ff5f2e)', lime: 'linear-gradient(90deg,#b4ec51,#429321)',
};
const SOLID = { accent: spec.accent || '#0a84ff', blue: '#0a84ff', green: '#30c04f', orange: '#ff8a1f', red: '#ff453a', purple: '#8e5cf6', pink: '#ff4f8b', teal: '#23bfc4', yellow: '#ffcc00', gray: '#8a8a8e', black: '#1d1d1f', white: '#fff' };
const BGS = {
  sunset: 'radial-gradient(70% 90% at 12% 110%,#8a5cf0 0,transparent 62%),radial-gradient(70% 90% at 95% 10%,#ff9a3c 0,transparent 60%),linear-gradient(120deg,#ff7a45,#ff6f8f 55%,#ffb36b)',
  sunrise: 'conic-gradient(from -90deg at 50% 125%,#12308a 0deg,#2b62d6 42deg,#f0a25a 72deg,#ffe2b4 88deg,#f28a3c 103deg,#e2574f 124deg,#2b62d6 150deg,#12308a 180deg,#12308a 360deg)',
  violet: 'radial-gradient(38% 60% at 58% 18%,#d5a6ff 0,transparent 70%),radial-gradient(80% 110% at 40% 40%,#8a2be2 0,transparent 75%),linear-gradient(135deg,#3c0f8c,#6f1fd6 55%,#2b0a66)',
  ocean: 'radial-gradient(60% 80% at 80% 15%,#6fe3ff 0,transparent 65%),linear-gradient(135deg,#0a3fb5,#0f7fe0 55%,#16c2d6)',
  mint: 'radial-gradient(70% 90% at 20% 15%,#e6ffd6 0,transparent 65%),linear-gradient(135deg,#17b978,#49d6a5 60%,#0f9fa8)',
  ember: 'radial-gradient(80% 100% at 20% 100%,#ffb347 0,transparent 60%),linear-gradient(120deg,#2a0d05,#a4300f 55%,#ff6a1f)',
  aurora: 'radial-gradient(60% 80% at 10% 20%,#c8ff5e 0,transparent 60%),radial-gradient(70% 90% at 85% 80%,#ff5fd2 0,transparent 60%),linear-gradient(120deg,#0d1b2a,#3a1f5c)',
  graphite: 'radial-gradient(70% 90% at 70% 10%,#55555c 0,transparent 65%),linear-gradient(135deg,#0c0c0e,#2a2a2e)',
  sky: 'linear-gradient(180deg,#a4d6eb,#d9edf4 70%,#eef6f8)',
};

// ───────── helpers ─────────
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fileUrl = p => /^(https?:|data:|file:)/.test(p) ? p : 'file://' + path.resolve(specDir, p);
const gradOf = (g) => GRADS[g] || (g && g.includes('gradient') ? g : null);
const colorOf = (c) => SOLID[c] || c;
// **x** highlights x with the card's accent; \n forces a line break.
const rich = (s, c = {}) => esc(s).replace(/\*\*(.+?)\*\*/g, (_, x) => `<span class="${gradOf(c.grad) ? 'gt' : ''}" style="${gradOf(c.grad) ? `background-image:${gradOf(c.grad)}` : `color:${colorOf(c.color || spec.accent || 'blue')}`}">${x}</span>`).replace(/\n/g, '<br>');
const icon = (name, sw = 2) => { const g = ICONS[name]; if (!g) { warnings.push(`unknown icon "${name}"`); return ''; } return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${g}</svg>`; };
const warnings = [];
const bgCss = (b) => {
  if (b && b.mesh) { const [a, c = a, d = c] = b.mesh.map(colorOf); return `radial-gradient(70% 90% at 15% 100%,${d} 0,transparent 62%),radial-gradient(60% 85% at 88% 8%,${c} 0,transparent 60%),linear-gradient(125deg,${a},${c} 60%,${d})`; }
  if (b === 'auto') return bgCss({ mesh: [`color-mix(in srgb,${SOLID.accent} 62%,#000)`, SOLID.accent, `color-mix(in srgb,${SOLID.accent} 55%,#fff)`] });
  return BGS[b] || (b && /gradient|^#|^rgb|^color-mix/.test(b) ? b : BGS.ocean);
};

// Hand-drawn marks (original paths) for the marker-style eco cards.
const ARROW = (rot, col) => `<svg class="mk-arrow" viewBox="0 0 60 60" style="transform:rotate(${rot}deg)"><path d="M6 52C20 40 34 26 50 10M26 8c8 1 17 0 25 1 1 8 0 16 1 25" fill="none" stroke="${col}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SKETCH_RING = (col) => `<svg class="mk-ring" viewBox="0 0 200 100" preserveAspectRatio="none"><path d="M18 56C14 24 62 8 108 8c44 0 82 14 84 40 2 30-44 46-92 46C56 94 14 82 10 52 7 28 50 12 86 9" fill="none" stroke="${col}" stroke-width="4.5" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`;

// ───────── visuals ─────────
function visual(v, c) {
  if (!v) return '';
  if (typeof v === 'string') v = { icon: v };
  const col = colorOf(v.color || c.color) || T.ink;
  if (v.image) return `<img class="v-img ${v.fit === 'cover' ? 'cover' : ''}" src="${esc(fileUrl(v.image))}">`;
  if (v.svg) return `<div class="v-svg">${v.svg}</div>`;
  if (v.emoji) return `<div class="v-emoji">${esc(v.emoji)}</div>`;
  if (v.device) return device(v);
  if (v.chip != null) return chip(v);
  if (v.icon) {
    const st = v.style || 'plain';
    if (st === 'circle') return `<div class="v-ico circle" style="background:${colorOf(v.color || 'accent')}">${icon(v.icon, 2.1)}</div>`;
    if (st === 'app') return `<div class="v-ico app" style="background:${bgCss(v.bg || 'ocean')}">${icon(v.icon, 2)}</div>`;
    return `<div class="v-ico plain" style="color:${col}">${icon(v.icon, v.weight || 2)}</div>`;
  }
  return '';
}
function device(v) {
  const scr = v.image ? `background:url('${esc(fileUrl(v.image))}') center/cover` : `background:${bgCss(v.bg || 'sunset')}`;
  const body = v.time ? `<div class="scr-time">${esc(v.time)}</div>` : (v.screenText ? `<div class="scr-time small">${esc(v.screenText)}</div>` : '');
  if (v.device === 'laptop') return `<div class="dev laptop"><div class="lid"><div class="scr" style="${scr}">${body}</div></div><div class="base"></div></div>`;
  if (v.device === 'tablet') return `<div class="dev tablet"><div class="scr" style="${scr}">${body}</div></div>`;
  if (v.device === 'watch') return `<div class="dev watch"><div class="scr" style="${scr}">${body}</div></div>`;
  return `<div class="dev phone"><div class="scr" style="${scr}"><div class="island"></div>${body}</div></div>`;
}
function chip(v) { return `<div class="chip"><div class="chip-name">${esc(v.chip)}</div>${v.sub ? `<div class="chip-sub" style="background-image:${gradOf(v.grad) || GRADS.ice}">${esc(v.sub)}</div>` : ''}</div>`; }

// ───────── card renderers: each returns inner HTML ─────────
const cap = (s, cls = '') => s ? `<div class="t cap ${cls}">${rich(s)}</div>` : '';
const nw = s => String(s ?? '').includes('\n') ? 'nw' : '';
const K = {
  statement(c) {
    const st = c.style || 'plain';
    const col = st === 'gray' ? T.num : colorOf(c.color) || T.ink;
    const g = gradOf(c.grad);
    let cls = 'big ' + nw(c.text), extra = `color:${col}`, inner = rich(c.text, c);
    if (st === 'gradient' && g) { cls += ' gt'; extra = `background-image:${g}`; inner = esc(c.text).replace(/\n/g, '<br>'); }
    if (st === 'outline') { cls += ' outline'; extra = `-webkit-text-stroke-color:${colorOf(c.color) || T.ink}`; }
    if (c.decor === 'ring') cls += ' has-ring';
    if (st === 'metal') { cls += ' gt'; extra = `background-image:${g || GRADS.titanium}`; inner = esc(c.text).replace(/\n/g, '<br>'); }
    if (st === 'script') { cls += ' script'; extra = `color:${colorOf(c.color) || T.ink}`; }
    if (st === 'marker') { cls += ' marker'; extra = `color:${colorOf(c.color) || T.ink}`; }
    const ac = colorOf(c.decorColor || 'green'), arrows = c.decor === 'arrows' ? `<div class="mk-a tl">${ARROW(90, ac)}</div><div class="mk-a tr">${ARROW(180, ac)}</div><div class="mk-a bl">${ARROW(0, ac)}</div><div class="mk-a br">${ARROW(270, ac)}</div>` : '';
    return `<div class="col center">${cap(c.top)}${arrows}<div class="t ${cls}" data-grow ${c.fontSize ? `data-max="${Math.round(c.fontSize * S)}"` : ''} style="${extra}">${inner}${c.decor === 'ring' ? SKETCH_RING(SOLID.green) : ''}</div>${cap(c.bottom || c.sub)}</div>`;
  },
  stat(c) {
    const g = gradOf(c.grad);
    const style = g ? `background-image:${g}` : `color:${colorOf(c.color) || T.num}`;
    return `<div class="col center tight">${cap(c.top)}<div class="t num ${g ? 'gt' : ''}" data-grow style="${style}">${esc(c.value)}</div>${cap(c.bottom)}</div>`;
  },
  pill(c) {
    const col = colorOf(c.color || 'green');
    return `<div class="row center pillrow">${c.before ? `<div class="t cap strong">${esc(c.before)}</div>` : ''}<div class="t pill" style="background:${col}">${esc(c.value)}</div>${c.after ? `<div class="t cap strong">${esc(c.after)}</div>` : ''}</div>`;
  },
  feature(c) {
    const vi = visual(c.visual, c), top = c.captionTop ? cap(c.captionTop) : '';
    const bleed = c.visual && c.visual.image && c.visual.fit === 'cover';
    if (bleed) return `<div class="coverwrap"><div class="cover-img">${vi}</div>${c.caption ? `<div class="t cap cover-cap">${rich(c.caption)}</div>` : ''}</div>`;
    return `<div class="col fill">${top}<div class="vis">${vi}</div>${cap(c.caption)}</div>`;
  },
  hero(c) {
    const col = colorOf(c.textColor) || '#fff';
    const img = c.image ? `background:url('${esc(fileUrl(c.image))}') center/cover` : `background:${bgCss(c.bg)}`;
    const rings = c.pattern === 'rings' ? `<div class="rings"></div>` : '';
    return `<div class="bleed" style="${img}">${rings}</div><div class="col center hero-t" style="color:${col}">${c.top ? `<div class="t cap" style="color:inherit">${esc(c.top)}</div>` : ''}<div class="t big hero-w ${gradOf(c.textGrad) ? 'gt' : ''} ${nw(c.text) || ([...String(c.text)].length <= 18 ? 'nw' : '')}" data-grow style="${gradOf(c.textGrad) ? `background-image:${gradOf(c.textGrad)}` : `color:${col}`}">${gradOf(c.textGrad) ? esc(c.text).replace(/\n/g, '<br>') : rich(c.text, c)}</div>${c.sub ? `<div class="t sub" style="color:inherit">${rich(c.sub)}</div>` : ''}</div>`;
  },
  media(c) {
    const img = c.image ? `background:url('${esc(fileUrl(c.image))}') center/${c.fit || 'cover'} no-repeat` : `background:${bgCss(c.bg)}`;
    return `<div class="bleed" style="${img}"></div>${c.text ? `<div class="col center hero-t"><div class="t big ${nw(c.text)}" data-grow style="color:${colorOf(c.textColor) || '#fff'};text-shadow:0 2px 24px rgba(0,0,0,.28)">${esc(c.text).replace(/\n/g, '<br>')}</div></div>` : ''}${c.caption ? `<div class="t cap media-cap" style="color:${colorOf(c.textColor) || '#fff'}">${rich(c.caption)}</div>` : ''}`;
  },
  side(c) { // icon + label, horizontal ("Conversation Awareness")
    return `<div class="row center sidecard"><div class="side-v">${visual(c.visual, c)}</div><div class="t cap left">${rich(c.label)}</div></div>`;
  },
  icons(c) { // row of small icon+caption ("HDMI · Thunderbolt 4 · SDXC")
    return `<div class="row even">${(c.items || []).map(i => `<div class="col fill icell"><div class="vis">${visual(i.visual || i.icon, c)}</div>${cap(i.label)}</div>`).join('')}</div>`;
  },
  frame(c) { // focus-bracket text
    const col = colorOf(c.color || 'orange');
    return `<div class="framebox" style="--bk:${col}"><i></i><i></i><i></i><i></i><div class="t big fr ${nw(c.text)}" data-grow>${rich(c.text, c)}</div></div>`;
  },
  swatch(c) {
    return `<div class="col fill">${cap(c.top)}<div class="vis"><div class="swatches">${(c.colors || []).map(s => `<b style="background:${colorOf(s)}"></b>`).join('')}</div></div>${cap(c.bottom)}</div>`;
  },
  wave(c) {
    let bars = ''; const col = T.mute; for (let i = 0; i < 13; i++) { const h = 18 + Math.abs(Math.sin(i * 1.9 + 1)) * 62; bars += `<i style="height:${h}%;background:${col};opacity:${.28 + i / 22}"></i>`; }
    const rev = bars.split('</i>').slice(0, -1).reverse().join('</i>') + '</i>';
    const g = gradOf(c.grad) || GRADS.blue;
    return `<div class="row center wave"><div class="bars">${bars}</div><div class="t big gt wv" data-grow style="background-image:${g}">${esc(c.text)}</div><div class="bars">${rev}</div></div>`;
  },
  bubbles(c) {
    return `<div class="col fill"><div class="vis-flow">${(c.items || []).map(b => { const me = b.from === 'me'; return `<div class="t bub ${me ? 'me' : ''}" style="${me ? `background:${colorOf(c.color || 'blue')}` : ''}">${esc(b.text)}</div>`; }).join('')}</div>${cap(c.caption)}</div>`;
  },
  thumbs(c) {
    return `<div class="row center thumbs"><div class="t cap left">${rich(c.label)}</div><div class="thumb-row">${(c.items || []).map(i => `<i style="${i.image ? `background:url('${esc(fileUrl(i.image))}') center/cover` : `background:${bgCss(i.bg || i)}`}"></i>`).join('')}</div></div>`;
  },
  list(c) { // "NO mercury / NO PVC" — style: no | strike | check
    const st = c.style || 'no'; const col = colorOf(c.color || 'green');
    return `<div class="col center listc">${(c.items || []).map(i => {
      if (st === 'strike') return `<div class="t li strike" style="color:${T.mute};--st:${col}">${esc(i)}</div>`;
      if (st === 'check') return `<div class="t li"><span class="lck" style="color:${col}">${icon('check', 3.2)}</span>${esc(i)}</div>`;
      return `<div class="t li"><span class="${/^[\x00-\x7f]+$/.test(c.prefix || 'NO') ? 'mk-no' : 'mk-cjk'}" style="color:${col}">${esc(c.prefix || 'NO')}</span> ${esc(i)}</div>`;
    }).join('')}${cap(c.caption)}</div>`;
  },
  meter(c) { // percentage ring
    const p = Math.max(0, Math.min(100, +c.percent || 0)), col = colorOf(c.color || 'green');
    return `<div class="col fill">${cap(c.top)}<div class="vis"><div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="${T.hair}" stroke-width="10"/><circle cx="50" cy="50" r="42" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${2.639 * p} 999" transform="rotate(-90 50 50)"/></svg><div class="t ringv">${esc(c.value ?? p + '%')}</div></div></div>${cap(c.bottom)}</div>`;
  },
  sizes(c) { // 16" / 14" flanking a device or between dimension lines
    const g = gradOf(c.grad);
    return `<div class="row even sz">${(c.items || []).map(i => `<div class="t num sz-i ${g ? 'gt' : ''}" data-grow style="${g ? `background-image:${g}` : `color:${colorOf(c.color) || T.num}`}">${esc(i)}</div>`).join('<div class="vis sz-m">' + (c.visual ? visual(c.visual, c) : '') + '</div>')}</div>${c.caption ? `<div class="sz-cap">${cap(c.caption)}</div>` : ''}`;
  },
  segments(c) { // ".5 · 1 · 2×" lens/plan/mode selector capsule
    const act = c.active ?? (c.items || []).length - 1;
    return `<div class="col fill">${cap(c.top)}<div class="vis"><div class="segs">${(c.items || []).map((x, i) => `<b class="${i === act ? 'on' : ''}" style="${i === act ? `color:${colorOf(c.color || 'yellow')}` : ''}">${esc(x)}</b>`).join('')}</div></div>${cap(c.caption)}</div>`;
  },
  cores(c) { // die-style cell grid over a value: "10-core GPU"
    const [cx, cy] = c.grid || [4, 2]; const n = cx * cy; const col = colorOf(c.color || 'accent'); let cells = '';
    for (let i = 0; i < n; i++) cells += `<i style="border-color:${col};background:color-mix(in srgb,${col} ${i < (c.lit ?? n) ? 24 : 4}%,transparent)"></i>`;
    const g = gradOf(c.grad);
    return `<div class="col fill tight">${cap(c.top)}<div class="vis"><div class="cgrid" style="grid-template-columns:repeat(${cx},1fr);width:min(90cqw,calc(92cqh*${cx}/${cy}));aspect-ratio:${cx}/${cy}">${cells}</div></div><div class="t num ${g ? 'gt' : ''}" data-grow data-max="${Math.round(58 * S)}" style="${g ? `background-image:${g}` : `color:${T.num}`}">${esc(c.value)}</div>${cap(c.bottom)}</div>`;
  },
  bars(c) { // mini column chart
    const vals = c.values || [], mx = Math.max(...vals, 1), col = colorOf(c.color || 'accent'), hi = c.highlight ?? vals.length - 1;
    return `<div class="col fill">${cap(c.top)}${c.value ? `<div class="t num" data-grow data-max="${Math.round(60 * S)}" style="color:${T.num}">${esc(c.value)}</div>` : ''}<div class="vis"><div class="minibars">${vals.map((v, i) => `<i style="height:${Math.max(6, v / mx * 100)}%;background:${i === hi ? col : `color-mix(in srgb,${col} 28%,${T.card === '#1c1c1e' ? '#333' : '#fff'})`}"></i>`).join('')}</div></div>${c.labels ? `<div class="barl">${c.labels.map(l => `<span class="t">${esc(l)}</span>`).join('')}</div>` : ''}${cap(c.caption)}</div>`;
  },
  spark(c) { // line + area chart
    const v = c.values || [0, 1], mn = Math.min(...v), mx = Math.max(...v), col = colorOf(c.color || 'accent'), rng_ = mx - mn || 1;
    const pts = v.map((y, i) => [i / (v.length - 1) * 100, 46 - (y - mn) / rng_ * 40]); const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('');
    const id = 'sg' + Math.abs(col.split('').reduce((a, ch) => a * 31 + ch.charCodeAt(0) | 0, v.length));
    return `<div class="col fill">${cap(c.top)}${c.value ? `<div class="t num" data-grow data-max="${Math.round(60 * S)}" style="color:${T.num}">${esc(c.value)}</div>` : ''}<div class="vis"><svg class="sparkv" viewBox="0 0 100 50" preserveAspectRatio="none"><defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".35"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs><path d="${d}L100 50L0 50Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg></div>${cap(c.caption)}</div>`;
  },
  toggles(c) { // settings list
    const col = colorOf(c.color || 'green');
    return `<div class="col fill"><div class="vis-flow tgl">${(c.items || []).map(i => `<div class="tgl-r"><span class="t cap left">${esc(i.label)}</span><u class="${i.on === false ? '' : 'on'}" style="${i.on === false ? '' : `background:${col}`}"></u></div>`).join('')}</div>${cap(c.caption)}</div>`;
  },
  window(c) { // miniature app window
    const body = c.image ? `<div class="win-img" style="background:url('${esc(fileUrl(c.image))}') center/cover"></div>` : c.lines ? `<div class="win-txt">${c.lines.map(l => `<div class="t">${esc(l)}</div>`).join('')}</div>` : `<div class="win-sk"><i style="width:80%"></i><i style="width:96%"></i><i style="width:64%;background:${colorOf(c.color || 'accent')}"></i><i style="width:88%"></i></div>`;
    return `<div class="col fill"><div class="vis"><div class="win"><div class="win-bar"><s style="background:#ff5f57"></s><s style="background:#febc2e"></s><s style="background:#28c840"></s>${c.title ? `<em>${esc(c.title)}</em>` : ''}</div>${body}</div></div>${cap(c.caption)}</div>`;
  },
  notif(c) { // notification banner
    return `<div class="col fill"><div class="vis-flow"><div class="nt"><div class="nt-ic" style="background:${bgCss(c.bg || 'auto')}">${c.icon ? icon(c.icon, 2.2) : ''}</div><div class="nt-tx"><div class="t left nt-a">${esc(c.title)}</div><div class="t left nt-b">${esc(c.body)}</div></div></div></div>${cap(c.caption)}</div>`;
  },
  badge(c) { // outlined format badges: "ProRes" "AV1"
    const col = colorOf(c.color) || T.mute;
    return `<div class="col center">${cap(c.top)}<div class="badges">${(c.items || []).map(b => `<b class="t" style="color:${col};border-color:${col}">${esc(b)}</b>`).join('')}</div>${cap(c.caption)}</div>`;
  },
  rings(c) { // concentric activity rings
    const pal = c.colors || ['#ff2d55', '#a6ff00', '#22d3ee', '#ffcc00']; const vals = c.values || [80, 60, 40];
    const sw = 11; const svg = vals.map((v, i) => { const r = 44 - i * (sw + 2.5); const circ = 2 * Math.PI * r; const col = colorOf(pal[i % pal.length]); return `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${col}" stroke-opacity=".2" stroke-width="${sw}"/><circle cx="50" cy="50" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${circ * Math.min(v, 100) / 100} 999" transform="rotate(-90 50 50)"/>`; }).join('');
    return `<div class="col fill">${cap(c.top)}<div class="vis"><div class="ring"><svg viewBox="0 0 100 100">${svg}</svg></div></div>${cap(c.caption)}</div>`;
  },
  ripple(c) { // word inside concentric pastel rings
    const pal = c.colors || ['#ff9ec7', '#c7a6ff', '#8ab8ff', '#7fe0d6']; let rs = ''; for (let i = 0; i < 9; i++) rs += `<circle cx="50" cy="50" r="${49 - i * 5}" fill="none" stroke="${colorOf(pal[i % pal.length])}" stroke-width="1.7"/>`;
    return `<div class="bleed rip"><svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">${rs}</svg></div><div class="col center hero-t"><div class="rip-c"><div class="t big ${nw(c.text)}" data-grow data-max="${Math.round(44 * S)}" style="color:${T.ink}">${esc(c.text).replace(/\n/g, '<br>')}</div></div></div>`;
  },
  chips(c) { // side-by-side tier comparison: base / pro / max
    return `<div class="col fill"><div class="chiprow">${(c.items || []).map(i => `<div class="vis">${chip({ chip: i.name ?? i.chip, sub: i.sub, grad: i.grad })}</div>`).join('')}</div>${cap(c.caption)}</div>`;
  },
  dim(c) { // visual with dimension lines
    return `<div class="col fill"><div class="dimbox"><div class="t cap dim-h">${esc(c.height)}</div><div class="dim-v"></div><div class="vis">${visual(c.visual || { icon: 'box' }, c)}</div><div class="dim-e"></div><div class="dim-b"></div><div class="t cap dim-w">${esc(c.width)}</div></div>${cap(c.caption)}</div>`;
  },
  replace(c) { // old struck out → new word
    const g = gradOf(c.grad);
    return `<div class="col center"><div class="t big strike rp-f nw" style="color:${T.mute};--st:${colorOf(c.color || 'accent')}">${esc(c.from)}</div><div class="t big ${g ? 'gt' : ''}" data-grow style="${g ? `background-image:${g}` : `color:${colorOf(c.color || 'accent')}`}">${esc(c.to)}</div>${cap(c.caption)}</div>`;
  },
  terminal(c) { // dark console for dev subjects
    const col = colorOf(c.color || 'green');
    return `<div class="col fill"><div class="term">${(c.lines || []).map(l => { const m = String(l).match(/^([$>#] )(.*)$/); return `<div class="t left term-l">${m ? `<span style="color:${col}">${esc(m[1])}</span>${esc(m[2])}` : esc(l)}</div>`; }).join('')}</div>${cap(c.caption)}</div>`;
  },
  html(c) { return c.html || ''; },
};

// ───────── auto layout: seeded random guillotine search on a snap grid ─────────
const SPEC = { // [minAspect, maxAspect, baseArea]
  statement: [1.1, 3.0, 3.6], stat: [.85, 1.7, 2.6], pill: [2.2, 6, 1.5], feature: [.72, 1.5, 3.3], hero: [1.35, 2.3, 8], media: [.9, 2.2, 8],
  side: [1.9, 4.2, 1.5], icons: [2.4, 5.5, 2.5], frame: [1.9, 4, 2], swatch: [.85, 1.5, 2.2], wave: [3, 7, 1.8], bubbles: [.95, 1.7, 3.2],
  thumbs: [2.6, 5, 1.9], list: [.95, 1.8, 3], meter: [.85, 1.4, 3], sizes: [1.5, 3.5, 3], segments: [1.05, 2.4, 2.4], cores: [.8, 1.4, 3], bars: [.9, 1.8, 3], spark: [1.1, 2.3, 3.2], toggles: [1, 1.8, 3], window: [1, 1.7, 4], notif: [1.5, 3.2, 2.8], badge: [1.5, 4, 1.8], rings: [.85, 1.3, 2.8], ripple: [.85, 1.35, 2.4], chips: [1.7, 3.8, 3.8], dim: [.85, 1.45, 3.2], replace: [1.05, 2.2, 2.6], terminal: [1.25, 2.6, 3.8], html: [.6, 3, 3],
};
const SIZE = { xs: .55, s: .75, m: 1, l: 1.9, xl: 3.4, xxl: 5 };
function rng(s) { let a = s >>> 0 || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function autoLayout() {
  const innerW = W - 2 * MARGIN + GAP, innerH = H - 2 * MARGIN + GAP;
  const cols = Math.round(innerW / (40 * S)), rows = Math.round(innerH / (40 * S));
  const info = cards.map((c, i) => { const sp = SPEC[c.kind] || SPEC.html; let lo = sp[0], hi = sp[1];
    if (c.kind === 'feature' && c.visual && c.visual.device === 'laptop') { lo = 1; hi = 1.8; }
    const vw = t => Math.max(...String(t || '').split('\n').map(l => [...l.replace(/\*\*/g, '')].reduce((a, ch) => a + (ch.charCodeAt(0) > 0x2e7f ? 1 : .56), 0)));
    if (c.kind === 'stat') { const L = vw(c.value); lo = Math.max(lo, Math.min(3.2, L * .27)); hi = Math.max(hi, L * .55); }
    if (c.kind === 'statement') { const L = vw(c.text), ln = String(c.text).split('\n').length; lo = Math.max(lo, Math.min(3.6, L * .3 / ln)); hi = Math.max(hi, L * .95 / ln); }
    if (c.kind === 'badge') { lo = Math.max(lo, (c.items || []).reduce((a, b) => a + vw(b) + 1.2, 0) * .24); hi = Math.max(hi, lo * 2.2); }
    if (c.kind === 'pill') { lo = Math.max(lo, (vw(c.before) + vw(c.value) + vw(c.after)) * .3 + .6); hi = Math.max(hi, lo * 2); }
    if (c.kind === 'wave') { lo = Math.max(lo, vw(c.text) * .42 + 1.7); hi = Math.max(hi, lo * 1.6); }
    if (c.kind === 'frame') { const L = vw(c.text), ln = String(c.text).split('\n').length; lo = Math.max(lo, L * .34 / ln + .6); hi = Math.max(hi, lo * 1.8); }
    if (c.kind === 'hero') { const L = vw(c.text), ln = String(c.text).split('\n').length; lo = Math.max(lo, Math.min(2, L * .3 / ln)); }
    if (c.kind === 'feature' && c.visual) { const v = c.visual; if (v.device === 'phone' || v.device === 'watch' || v.device === 'tablet') { lo = .62; hi = 1.1; } else if (v.icon || v.emoji) { lo = .85; hi = 1.35; } else if (v.chip != null) { lo = .85; hi = 1.3; } }
    if (c.aspect) { lo = c.aspect * .85; hi = c.aspect * 1.18; }
    const heroish = c.kind === 'hero' || c.center || ((SIZE[c.size] || 1) >= 3);
    const small = c.kind === 'feature' && c.visual && (c.visual.icon || c.visual.emoji) ? .68 : 1;
    const lines = String(c.text || '').split('\n').length;
    const minH = ({ stat: (c.top ? 58 : 0) + (c.bottom ? 58 : 0) + 96, statement: (c.top ? 40 : 0) + (c.bottom ? 44 : 0) + 76 * lines, frame: 66 * lines + 34, feature: PORTRAIT ? 215 : 150, bubbles: 58 * ((c.items || []).length + (c.caption ? 1 : 0)) + 30, list: 48 * ((c.items || []).length + (c.caption ? 1 : 0)) + 30, meter: 190, toggles: 52 * ((c.items || []).length + (c.caption ? 1 : 0)) + 30, terminal: 44 * ((c.lines || []).length + (c.caption ? 1 : 0)) + 40, badge: 120, replace: 170, cores: 200, chips: 170, notif: 130, rings: 180, window: 180 })[c.kind] || 0;
    return { i, kind: c.kind, lo, hi, minH: minH * S, area: sp[2] * small * (SIZE[c.size] || 1), heroish }; });
  const tot = info.reduce((s, x) => s + x.area, 0), cw = innerW / cols, rh = innerH / rows;
  const rand = rng(seed * 7919 + 13); let best = null, bestS = Infinity; const pool = [];
  const trials = 120000;
  for (let t = 0; t < trials; t++) {
    const items = info.slice(); for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
    const leaves = []; let bad = false;
    const split = (x, y, w, h, list, depth) => {
      if (bad) return; if (list.length === 1) { leaves.push({ x, y, w, h, it: list[0] }); return; }
      const px = w * cw, py = h * rh; let vert;
      if (depth === 0) vert = !PORTRAIT; else if (PORTRAIT && depth === 1) vert = rand() < .7; else if (depth === 1 && px / py > 1.1) vert = rand() < .85; else vert = rand() < (px / py > 1.5 ? .78 : px / py < .8 ? .15 : .45);
      const sum = list.reduce((s, a) => s + a.area, 0); const k = 1 + Math.floor(rand() * (list.length - 1));
      const a = list.slice(0, k), b = list.slice(k); const fr = Math.min(.92, Math.max(.08, a.reduce((s, q) => s + q.area, 0) / sum * (.8 + rand() * .4)));
      if (vert) { const c = Math.round(w * fr); if (c < 3 || w - c < 3) { bad = true; return; } split(x, y, c, h, a, depth + 1); split(x + c, y, w - c, h, b, depth + 1); }
      else { const c = Math.round(h * fr); if (c < 3 || h - c < 3) { bad = true; return; } split(x, y, w, c, a, depth + 1); split(x, y + c, w, h - c, b, depth + 1); }
    };
    split(0, 0, cols, rows, items, 0); if (bad || leaves.length !== items.length) continue;
    let s = 0;
    const pool_push = () => { pool.push({ s, leaves }); if (pool.length > 400) { pool.sort((a, b) => a.s - b.s); pool.length = 60; } };
    for (const l of leaves) { const ar = (l.w * cw - GAP) / (l.h * rh - GAP); const it = l.it;
      if (ar < it.lo) s += 22 * Math.log(it.lo / ar) ** 2; else if (ar > it.hi) s += 22 * Math.log(ar / it.hi) ** 2;
      const ph = l.h * rh - GAP; if (ph < it.minH) s += 3 + 26 * Math.log(it.minH / ph) ** 2;
      const tgt = it.area / tot * cols * rows, a = l.w * l.h; s += 2.4 * Math.log(a / tgt) ** 2; if (it.heroish && a < tgt) s += 30 * Math.log(tgt / a) ** 2; if (!it.heroish && a > tgt * 1.9) s += 5 * Math.log(a / (tgt * 1.9)) ** 2;
      if (it.heroish) { const dx = (l.x + l.w / 2) / cols - .5, dy = (l.y + l.h / 2) / rows - (PORTRAIT ? .24 : .5); s += 26 * dx * dx + (PORTRAIT ? 20 : 8) * dy * dy; }
      if (s > bestS + 6) break; }
    if (s >= bestS + 6) continue;
    // separate like kinds so the rhythm stays mixed
    for (let i = 0; i < leaves.length; i++) for (let j = i + 1; j < leaves.length; j++) { const a = leaves[i], b = leaves[j];
      const touch = (a.x + a.w === b.x || b.x + b.w === a.x) && a.y < b.y + b.h && b.y < a.y + a.h || (a.y + a.h === b.y || b.y + b.h === a.y) && a.x < b.x + b.w && b.x < a.x + a.w;
      if (touch && a.it.kind === b.it.kind) s += a.it.kind === 'hero' || a.it.kind === 'media' ? 1.2 : .28; }
    pool_push(); if (s < bestS) { bestS = s; best = leaves; }
  }
  const scoreLeaf = (l, it) => { const ar = (l.w * cw - GAP) / (l.h * rh - GAP); let s = 0;
    if (ar < it.lo) s += 22 * Math.log(it.lo / ar) ** 2; else if (ar > it.hi) s += 22 * Math.log(ar / it.hi) ** 2;
    const ph = l.h * rh - GAP; if (ph < it.minH) s += 3 + 26 * Math.log(it.minH / ph) ** 2;
    const tgt = it.area / tot * cols * rows, a = l.w * l.h; s += 2.4 * Math.log(a / tgt) ** 2; if (it.heroish && a < tgt) s += 30 * Math.log(tgt / a) ** 2; if (!it.heroish && a > tgt * 1.9) s += 5 * Math.log(a / (tgt * 1.9)) ** 2;
    if (it.heroish) { const dx = (l.x + l.w / 2) / cols - .5, dy = (l.y + l.h / 2) / rows - (PORTRAIT ? .24 : .5); s += 26 * dx * dx + (PORTRAIT ? 20 : 8) * dy * dy; } return s; };
  const adj = (ls) => { let s = 0; for (let i = 0; i < ls.length; i++) for (let j = i + 1; j < ls.length; j++) { const a = ls[i], b = ls[j];
    const touch = (a.x + a.w === b.x || b.x + b.w === a.x) && a.y < b.y + b.h && b.y < a.y + a.h || (a.y + a.h === b.y || b.y + b.h === a.y) && a.x < b.x + b.w && b.x < a.x + a.w;
    if (touch && a.it.kind === b.it.kind) s += a.it.kind === 'hero' || a.it.kind === 'media' ? 1.2 : .28; } return s; };
  const total = ls => ls.reduce((q, l) => q + scoreLeaf(l, l.it), 0) + adj(ls);
  pool.sort((a, b) => a.s - b.s); bestS = Infinity;
  for (const cand of pool.slice(0, 40)) { const ls = cand.leaves.map(l => ({ ...l })); let cur = total(ls), improved = true;
    while (improved) { improved = false;
      for (let i = 0; i < ls.length; i++) for (let j = i + 1; j < ls.length; j++) { [ls[i].it, ls[j].it] = [ls[j].it, ls[i].it]; const nx = total(ls);
        if (nx < cur - 1e-6) { cur = nx; improved = true; } else { [ls[i].it, ls[j].it] = [ls[j].it, ls[i].it]; } } }
    if (cur < bestS) { bestS = cur; best = ls; } }
  if (!best) { console.error('layout failed: too many cards for this canvas'); process.exit(3); }
  return best.map(l => ({ i: l.it.i, x: MARGIN + l.x * cw, y: MARGIN + l.y * rh, w: l.w * cw - GAP, h: l.h * rh - GAP }));
}
function manualLayout() { // card.at = [col,row,colSpan,rowSpan] on spec.grid = [cols,rows]
  const [cols, rows] = spec.grid; const cw = (W - 2 * MARGIN + GAP) / cols, rh = (H - 2 * MARGIN + GAP) / rows;
  return cards.map((c, i) => ({ i, x: MARGIN + c.at[0] * cw, y: MARGIN + c.at[1] * rh, w: c.at[2] * cw - GAP, h: c.at[3] * rh - GAP }));
}
if (PORTRAIT && cards.length > 16) warnings.push(`portrait has ${cards.length} cards; 10-16 reads best on a phone — mark the rest "secondary": true`);
const boxes = spec.grid ? manualLayout() : autoLayout();

// ───────── page ─────────
const n = cards.length, capBase = Math.round((PORTRAIT ? (n <= 12 ? 31 : n <= 16 ? 29 : 26) : (n <= 18 ? 25 : n <= 24 ? 23 : n <= 30 ? 21 : 19)) * S);
const FONT = `-apple-system,BlinkMacSystemFont,"SF Pro Display","PingFang SC","Hiragino Sans GB","Helvetica Neue",Arial,sans-serif`;
const MARK = `"Marker Felt","Hannotate SC","HanziPen SC","Chalkboard SE",-apple-system,"PingFang SC",sans-serif`;
const css = `
*{box-sizing:border-box;margin:0}html,body{width:${W}px;height:${H}px;overflow:hidden;background:${T.page}}
body{font-family:${FONT};color:${T.ink};-webkit-font-smoothing:antialiased;font-feature-settings:"kern","ss01"}
.card{position:absolute;background:${T.card};border-radius:${RADIUS}px;overflow:hidden;corner-shape:squircle}
.in{position:absolute;inset:0;padding:${Math.round(22 * S)}px ${Math.round(22 * S)}px ${Math.round(20 * S)}px;display:flex;flex-direction:column;justify-content:center;min-height:0}
.col{display:flex;flex-direction:column;gap:${Math.round(6 * S)}px;min-height:0;width:100%}.col.center{align-items:center;justify-content:center;flex:1}.col.fill{flex:1;align-items:center}.col.tight{gap:${Math.round(2 * S)}px}
.row{display:flex;align-items:center;min-height:0;width:100%;flex:1}.row.center{justify-content:center}.row.even{justify-content:space-evenly;gap:${Math.round(10 * S)}px;align-items:stretch}
.t{text-align:center;letter-spacing:-.012em;line-height:1.16;text-wrap:balance;line-break:strict;max-width:100%}
.nw{white-space:nowrap}
.cap{font-size:${capBase}px;font-weight:500;color:${T.ink};flex:none}.cap.left{text-align:left}.cap.strong{font-weight:600}
.sub{font-size:${Math.round(capBase * 1.14)}px;font-weight:500;line-height:1.22}
.big{font-weight:700;letter-spacing:-.024em;line-height:1.06}
.num{font-weight:700;letter-spacing:-.03em;line-height:1.02;white-space:nowrap}
.gt{-webkit-background-clip:text;background-clip:text;color:transparent!important}
.outline{color:transparent;-webkit-text-stroke-width:.028em}
.marker{font-family:${MARK};font-weight:700;letter-spacing:.015em;line-height:1.06;transform:rotate(-1.2deg);position:relative}
.vis{flex:1;min-height:0;width:100%;display:flex;align-items:center;justify-content:center;container-type:size;position:relative}
.v-img{max-width:100%;max-height:100%;object-fit:contain;display:block;width:100cqw;height:100cqh}
.v-img.cover{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.bleed{position:absolute;inset:0;overflow:hidden}.bleed .v-img{width:100%;height:100%;max-width:none;max-height:none}
.coverwrap{position:absolute;inset:0;display:flex;flex-direction:column}.cover-img{flex:1;min-height:0;position:relative;overflow:hidden}.cover-cap{flex:none;margin:${Math.round(12*S)}px ${Math.round(16*S)}px ${Math.round(14*S)}px}
.media-cap{position:absolute;left:${Math.round(18*S)}px;right:${Math.round(18*S)}px;bottom:${Math.round(16 * S)}px;text-shadow:0 1px 12px rgba(0,0,0,.4)}
.v-svg{width:100cqw;height:100cqh;display:flex;align-items:center;justify-content:center}.v-svg svg{width:100%;height:100%}
.v-emoji{font-size:78cqmin;line-height:1;font-family:"Apple Color Emoji"}
.v-ico{display:flex;align-items:center;justify-content:center}
.v-ico.plain{width:min(66cqmin,${Math.round(108 * S)}px);height:min(66cqmin,${Math.round(108 * S)}px)}.v-ico.plain svg{width:100%;height:100%}
.v-ico.circle{width:min(62cqmin,${Math.round(92 * S)}px);height:min(62cqmin,${Math.round(92 * S)}px);border-radius:50%;color:#fff}.v-ico.circle svg{width:60%;height:60%}
.v-ico.app{width:min(84cqmin,${Math.round(148 * S)}px);height:min(84cqmin,${Math.round(148 * S)}px);border-radius:22.5%;color:#fff;box-shadow:0 ${Math.round(6 * S)}px ${Math.round(22 * S)}px rgba(0,0,0,.2)}.v-ico.app svg{width:58%;height:58%}
.chip{width:min(82cqmin,${Math.round(310 * S)}px);height:min(82cqmin,${Math.round(310 * S)}px);border-radius:9%;background:linear-gradient(145deg,#2c2c30,#0b0b0d);display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 0 0 1.5px #4a4a4e inset,0 ${Math.round(10 * S)}px ${Math.round(26 * S)}px rgba(0,0,0,.25);color:#f5f5f7}
.chip-name{font-size:min(19cqmin,${Math.round(74 * S)}px);font-weight:600;letter-spacing:-.02em;line-height:1.05}.chip-sub{font-size:min(8cqmin,${Math.round(30 * S)}px);font-weight:600;letter-spacing:.14em;-webkit-background-clip:text;background-clip:text;color:transparent;margin-top:.2em}
.dev{position:relative}.dev .scr{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.phone{height:min(96cqh,calc(96cqw/.49));aspect-ratio:.49;background:#0b0b0d;border-radius:15%/7.4%;padding:1.2%;box-shadow:0 0 0 1.5px #5a5a5f,0 ${Math.round(8 * S)}px ${Math.round(26 * S)}px rgba(0,0,0,.22)}
.phone .scr{height:100%;width:100%;border-radius:14%/6.9%}.island{position:absolute;top:2%;left:34%;right:34%;height:3.4%;background:#000;border-radius:99px}
.tablet{height:min(94cqh,calc(94cqw/.74));aspect-ratio:.74;background:#111;border-radius:6%/4.4%;padding:2.4%;box-shadow:0 ${Math.round(8 * S)}px ${Math.round(26 * S)}px rgba(0,0,0,.22)}.tablet .scr{height:100%;border-radius:3.6%/2.6%}
.watch{height:min(90cqh,calc(90cqw/.84));aspect-ratio:.84;background:#101012;border-radius:24%/20%;padding:5%;box-shadow:0 0 0 2px #5a5a5f}.watch .scr{height:100%;border-radius:20%/17%}
.laptop{width:min(92cqw,calc(88cqh*1.56));display:flex;flex-direction:column;align-items:center}.lid{width:88%;aspect-ratio:1.55;background:#0d0d0f;border-radius:3.4%/5.2%;padding:1.2%;box-shadow:0 0 0 1px #8a8a8e}.lid .scr{height:100%;border-radius:1.6%/2.5%}
.base{width:100%;height:calc(min(92cqw,88cqh*1.56)*.032);background:linear-gradient(180deg,#d8d8dc,#9c9ca2);border-radius:0 0 40% 40%/0 0 100% 100%}
.scr-time{color:#fff;font-weight:600;font-size:min(30cqw,13cqh);letter-spacing:-.02em;text-shadow:0 1px 10px rgba(0,0,0,.2)}.scr-time.small{font-size:min(16cqw,7cqh);font-weight:700;text-align:center;line-height:1.1;padding:6%}
.hero-t{position:relative;z-index:1;gap:${Math.round(8 * S)}px}.hero-w{font-weight:600;letter-spacing:-.02em}
.rings{position:absolute;left:50%;top:6%;width:62%;aspect-ratio:1;transform:translateX(-50%);border-radius:50%;background:repeating-radial-gradient(circle,rgba(255,255,255,.2) 0 7%,rgba(255,255,255,.05) 7% 14%);filter:blur(1px)}
.sidecard{gap:${Math.round(14 * S)}px}.side-v{width:${Math.round(66 * S)}px;height:${Math.round(66 * S)}px;flex:none;container-type:size;display:flex;align-items:center;justify-content:center}.sidecard .v-ico{width:100cqmin!important;height:100cqmin!important}
.icell{flex:1;min-width:0}
.pillrow{gap:${Math.round(14 * S)}px;flex-wrap:nowrap}.pill{color:#fff;font-weight:700;font-size:${Math.round(capBase * 1.3)}px;padding:.2em .62em;border-radius:.42em;white-space:nowrap;letter-spacing:-.015em;flex:none}
.framebox{position:relative;flex:1;width:100%;display:flex;align-items:center;justify-content:center;padding:${Math.round(10 * S)}px ${Math.round(22 * S)}px}.framebox i{position:absolute;width:${Math.round(26 * S)}px;height:${Math.round(26 * S)}px;border:${Math.max(3, Math.round(4 * S))}px solid var(--bk)}
.framebox i:nth-child(1){left:0;top:0;border-right:0;border-bottom:0;border-top-left-radius:${Math.round(12 * S)}px}.framebox i:nth-child(2){right:0;top:0;border-left:0;border-bottom:0;border-top-right-radius:${Math.round(12 * S)}px}.framebox i:nth-child(3){left:0;bottom:0;border-right:0;border-top:0;border-bottom-left-radius:${Math.round(12 * S)}px}.framebox i:nth-child(4){right:0;bottom:0;border-left:0;border-top:0;border-bottom-right-radius:${Math.round(12 * S)}px}
.swatches{display:flex;gap:min(4cqw,${Math.round(14*S)}px);justify-content:center;width:100%}.swatches b{width:min(19cqw,${Math.round(84 * S)}px);aspect-ratio:1;border-radius:50%;box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.09)}
.wave{gap:${Math.round(14 * S)}px}.bars{display:flex;align-items:center;gap:${Math.max(2, Math.round(4 * S))}px;flex:1 1 0;height:68%;min-width:0;justify-content:center;overflow:hidden}.bars i{display:block;width:${Math.max(2, Math.round(3 * S))}px;border-radius:9px;flex:none}.wv{white-space:nowrap;flex:none}
.vis-flow{flex:1;min-height:0;width:100%;display:flex;flex-direction:column;justify-content:center;gap:${Math.round(9 * S)}px}
.bub{align-self:flex-start;background:${spec.theme === 'dark' ? '#3a3a3c' : spec.theme === 'white' ? '#dcdce0' : '#e9e9eb'};color:${T.ink};font-size:${Math.round(capBase * 1.04)}px;font-weight:500;padding:.38em .78em;border-radius:1.05em;text-align:left;text-wrap:pretty}.bub.me{align-self:flex-end;color:#fff}
.thumbs{gap:${Math.round(16 * S)}px}.thumbs .cap{flex:0 1 auto;white-space:normal}.thumb-row{display:flex;gap:${Math.round(8 * S)}px;flex:1;height:72%;min-width:0}.thumb-row i{flex:1;border-radius:${Math.round(10 * S)}px;display:block;min-width:0}
.listc{gap:${Math.round(3 * S)}px}.li{font-size:${Math.round(capBase * 1.55)}px;font-weight:700;letter-spacing:-.015em;line-height:1.14;white-space:nowrap}.mk-no{font-family:${MARK};font-weight:700;margin-right:.1em}.mk-cjk{font-weight:800;margin-right:.1em}.lck{display:inline-block;width:.86em;height:.86em;vertical-align:-.08em;margin-right:.26em}.lck svg{width:100%;height:100%}
.strike{position:relative}.strike:after{content:"";position:absolute;left:0;right:0;top:46%;height:.11em;border-radius:9px;background:var(--st);transform:rotate(-1.4deg)}
.ring{position:relative;height:min(92cqmin,${Math.round(190 * S)}px);aspect-ratio:1}.ring svg{width:100%;height:100%;display:block}.ringv{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:min(23cqmin,${Math.round(46 * S)}px);letter-spacing:-.02em;color:${T.num}}
.sz{align-items:center}.sz-i{flex:0 0 auto}.sz-m{flex:1}.sz-cap{flex:none}
.mk-a{position:absolute;width:${Math.round(46 * S)}px;height:${Math.round(46 * S)}px}.mk-a svg{width:100%;height:100%}.mk-a.tl{left:${Math.round(16 * S)}px;top:${Math.round(16 * S)}px}.mk-a.tr{right:${Math.round(16 * S)}px;top:${Math.round(16 * S)}px}.mk-a.bl{left:${Math.round(16 * S)}px;bottom:${Math.round(16 * S)}px}.mk-a.br{right:${Math.round(16 * S)}px;bottom:${Math.round(16 * S)}px}
.mk-ring{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}.has-ring{position:relative;padding:.34em .62em;transform:rotate(-2deg)}
body.glass{background:${spec.backdrop && BGS[spec.backdrop] ? BGS[spec.backdrop] : spec.backdrop ? `url('${fileUrl(spec.backdrop)}') center/cover` : BGS.sunset}}body.glass .card{-webkit-backdrop-filter:blur(36px) saturate(1.5);backdrop-filter:blur(36px) saturate(1.5);box-shadow:inset 0 0 0 1px rgba(255,255,255,.34)}
.script{font-family:"Snell Roundhand","Apple Chancery","Kaiti SC","STKaiti",cursive;font-weight:600;letter-spacing:0;line-height:1.1}
.segs{display:flex;gap:min(3cqmin,${Math.round(9 * S)}px);padding:min(4cqmin,${Math.round(10 * S)}px);border-radius:999px;background:color-mix(in srgb,${T.ink} 9%,transparent)}.segs b{min-width:min(26cqw,${Math.round(62 * S)}px);height:min(26cqw,${Math.round(62 * S)}px);padding:0 .3em;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${Math.round(capBase * .95)}px;font-weight:600;color:${T.ink};background:color-mix(in srgb,${T.ink} 8%,transparent)}.segs b.on{background:#1d1d1f}
.cgrid{display:grid;gap:min(2.4cqmin,${Math.round(6 * S)}px)}.cgrid i{display:block;border:1.5px solid;border-radius:${Math.round(5 * S)}px}
.minibars{display:flex;align-items:flex-end;gap:min(3cqw,${Math.round(9 * S)}px);width:92cqw;height:92cqh}.minibars i{flex:1;border-radius:${Math.round(6 * S)}px ${Math.round(6 * S)}px ${Math.round(2 * S)}px ${Math.round(2 * S)}px;display:block}
.barl{display:flex;gap:min(3cqw,${Math.round(9 * S)}px);width:92%;flex:none}.barl span{flex:1;font-size:${Math.round(capBase * .66)}px;font-weight:500;color:${T.mute};min-width:0}.sparkv{width:100cqw;height:92cqh;display:block}
.tgl{gap:${Math.round(8 * S)}px}.tgl-r{display:flex;align-items:center;justify-content:space-between;gap:${Math.round(12 * S)}px}.tgl-r .t{min-width:0}.tgl-r u{flex:none;display:block;width:${Math.round(58 * S)}px;height:${Math.round(34 * S)}px;border-radius:99px;background:${T.hair};position:relative}.tgl-r u:after{content:"";position:absolute;width:${Math.round(29 * S)}px;height:${Math.round(29 * S)}px;top:${Math.round(2.5 * S)}px;left:${Math.round(2.5 * S)}px;background:#fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.25)}.tgl-r u.on:after{left:auto;right:${Math.round(2.5 * S)}px}
.win{width:92cqw;max-height:96cqh;background:${spec.theme === 'dark' ? '#2c2c2e' : '#fff'};border-radius:${Math.round(14 * S)}px;box-shadow:0 ${Math.round(4 * S)}px ${Math.round(20 * S)}px rgba(0,0,0,.16);overflow:hidden;display:flex;flex-direction:column}.win-bar{display:flex;align-items:center;gap:${Math.round(6 * S)}px;padding:${Math.round(9 * S)}px ${Math.round(11 * S)}px;flex:none}.win-bar s{display:block;width:${Math.round(11 * S)}px;height:${Math.round(11 * S)}px;border-radius:50%}.win-bar em{font-style:normal;font-size:${Math.round(capBase * .68)}px;font-weight:600;color:${T.mute};margin-left:${Math.round(6 * S)}px;white-space:nowrap;overflow:hidden}.win-img{aspect-ratio:1.8;width:100%}.win-txt{padding:${Math.round(2 * S)}px ${Math.round(13 * S)}px ${Math.round(12 * S)}px;font-size:${Math.round(capBase * .78)}px;color:${T.ink};font-weight:500}.win-txt .t{text-align:left;margin-bottom:.3em}.win-sk{padding:${Math.round(4 * S)}px ${Math.round(13 * S)}px ${Math.round(14 * S)}px;display:flex;flex-direction:column;gap:${Math.round(8 * S)}px}.win-sk i{display:block;height:${Math.round(10 * S)}px;border-radius:9px;background:${T.hair}}
.nt{display:flex;align-items:center;gap:${Math.round(12 * S)}px;background:${spec.theme === 'dark' ? '#2c2c2e' : '#fff'};border-radius:${Math.round(20 * S)}px;padding:${Math.round(12 * S)}px;box-shadow:0 ${Math.round(3 * S)}px ${Math.round(16 * S)}px rgba(0,0,0,.13)}.nt-ic{flex:none;width:${Math.round(54 * S)}px;height:${Math.round(54 * S)}px;border-radius:24%;display:flex;align-items:center;justify-content:center;color:#fff}.nt-ic svg{width:60%;height:60%}.nt-tx{min-width:0;flex:1}.nt-a{font-size:${Math.round(capBase * .84)}px;font-weight:700}.nt-b{font-size:${Math.round(capBase * .78)}px;font-weight:500;color:${T.mute}}.left{text-align:left}
.badges{display:flex;gap:${Math.round(10 * S)}px;flex-wrap:nowrap;justify-content:center}.badges b{border:${Math.max(2, Math.round(2.5 * S))}px solid;border-radius:${Math.round(11 * S)}px;padding:.22em .55em;font-size:${Math.round(capBase * 1.12)}px;font-weight:600;letter-spacing:-.01em;white-space:nowrap}
.rip svg{width:100%;height:100%;display:block}.rip-c{background:${T.card};border-radius:50%;padding:.6em .9em;display:flex}
.chiprow{flex:1;min-height:0;display:flex;gap:${Math.round(10 * S)}px;width:100%}.chiprow .vis{flex:1;min-width:0}.chiprow .chip{width:min(92cqmin,${Math.round(190 * S)}px);height:min(92cqmin,${Math.round(190 * S)}px)}
.dimbox{flex:1;min-height:0;width:100%;display:grid;grid-template-columns:auto ${Math.round(14 * S)}px 1fr ${Math.round(14 * S)}px;grid-template-rows:1fr ${Math.round(14 * S)}px auto;column-gap:${Math.round(6 * S)}px;align-items:center}.dimbox .vis{grid-column:3;grid-row:1;height:100%}.dim-h{grid-column:1;grid-row:1}.dim-v{grid-column:2;grid-row:1;height:86%;justify-self:center;border-left:2px solid ${T.mute};position:relative}.dim-e{grid-column:4;grid-row:1}.dim-b{grid-column:3;grid-row:2;height:2px;background:${T.mute};width:86%;justify-self:center}.dim-w{grid-column:3;grid-row:3}
.rp-f{font-weight:600;font-size:${Math.round(capBase * 1.3)}px}
.term{flex:1;min-height:0;width:100%;background:#101012;border-radius:${Math.round(14 * S)}px;padding:${Math.round(14 * S)}px ${Math.round(16 * S)}px;display:flex;flex-direction:column;justify-content:center;gap:${Math.round(4 * S)}px;overflow:hidden}.term-l{color:#f2f2f4;font-family:"SF Mono",Menlo,Consolas,monospace;font-size:${Math.round(capBase * .84)}px;font-weight:500;letter-spacing:0;text-wrap:nowrap;white-space:pre}
#report{display:none}
`;
const cardHtml = boxes.map(b => { const c = cards[b.i]; const fn = K[c.kind]; if (!fn) { warnings.push(`unknown kind "${c.kind}" (card ${b.i})`); return ''; }
  const bg = c.cardBg ? `background:${c.cardBg};` : c.tint ? `background:color-mix(in srgb,${colorOf(c.tint)} ${spec.theme === 'dark' ? 26 : 16}%,${T.card});` : '';
  return `<div class="card k-${c.kind}" data-i="${b.i}" style="left:${b.x.toFixed(1)}px;top:${b.y.toFixed(1)}px;width:${b.w.toFixed(1)}px;height:${b.h.toFixed(1)}px;${bg}"><div class="in">${fn(c)}</div></div>`; }).join('\n');

// Runtime fit: grow headline text to fill its card, then shrink anything that overflows; report what cannot fit.
const fit = `
const CAPS={'k-stat':${Math.round(96*S)},'k-sizes':${Math.round(96*S)},'k-statement':${Math.round(74*S)},'k-hero':${Math.round(170*S)},'k-frame':${Math.round(44*S)},'k-wave':${Math.round(40*S)}},PAD=${Math.round(11*S)},MING=${Math.round(16 * S)},MINC=${Math.round(13 * S)},rep=[];
const over=(c,inn)=>{const r=c.getBoundingClientRect();if(inn.scrollHeight>inn.clientHeight+1||inn.scrollWidth>inn.clientWidth+1)return true;
 for(const t of c.querySelectorAll('.t')){if(t.scrollWidth>t.clientWidth+1)return true;const q=t.getBoundingClientRect();if(q.left<r.left+PAD||q.right>r.right-PAD||q.top<r.top+PAD||q.bottom>r.bottom-PAD)return true;}
 for(const b of c.querySelectorAll('.vis')){if(b.clientHeight<4)return true;}return false};
for(const c of document.querySelectorAll('.card')){const inn=c.querySelector('.in');const g=[...c.querySelectorAll('[data-grow]')];
 const R=c.getBoundingClientRect();
 for(const el of g){const cm=Object.keys(CAPS).find(k=>c.classList.contains(k));let lo=MING,hi=Math.min(+el.dataset.max||CAPS[cm]||${Math.round(80*S)},R.height*.62);
  for(let k=0;k<12;k++){const m=(lo+hi)/2;el.style.fontSize=m+'px';over(c,inn)?hi=m:lo=m}el.style.fontSize=lo+'px';}
 let guard=0;const others=[...c.querySelectorAll('.t:not([data-grow])')];
 while(over(c,inn)&&guard++<40){let moved=false;for(const t of others){const f=parseFloat(getComputedStyle(t).fontSize);if(f>MINC){t.style.fontSize=(f*.95)+'px';moved=true}}
  for(const el of g){const f=parseFloat(el.style.fontSize);if(f>MINC){el.style.fontSize=(f*.95)+'px';moved=true}}if(!moved)break}
 if(over(c,inn))rep.push({card:+c.dataset.i,kind:c.className.replace('card k-',''),problem:'overflow'});
 const cf=others[0]&&parseFloat(getComputedStyle(others[0]).fontSize);if(cf&&cf<=MINC*1.05)rep.push({card:+c.dataset.i,problem:'caption at minimum size — shorten text or enlarge card'});
}
document.getElementById('report').textContent=JSON.stringify(rep);
`;
const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><title>${esc(spec.title || 'summary')}</title><style>${css}</style></head><body class="${spec.theme === 'glass' ? 'glass' : ''}">${cardHtml}<pre id="report"></pre><script>document.fonts.ready.then(()=>{${fit}})</script></body></html>`;
const htmlPath = out.replace(/\.png$/i, '') + '.html'; fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(htmlPath, html);

// ───────── chrome ─────────
function findChrome() {
  const c = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  const pw = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  if (fs.existsSync(pw)) for (const d of fs.readdirSync(pw).filter(x => /^chromium-\d/.test(x)).sort().reverse()) for (const a of ['chrome-mac-arm64', 'chrome-mac']) { c.push(path.join(pw, d, a, 'Chromium.app/Contents/MacOS/Chromium')); c.push(path.join(pw, d, a, 'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing')); }
  return c.find(p => p && fs.existsSync(p));
}
if (argv.includes('--html-only')) { console.log(JSON.stringify({ html: htmlPath, cards: n, warnings })); process.exit(0); }
const chrome = findChrome(); if (!chrome) { console.error('No Chrome/Chromium found; set CHROME_PATH. HTML written to ' + htmlPath); process.exit(4); }
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'ess-'));
const base = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--allow-file-access-from-files', `--user-data-dir=${prof}`, `--window-size=${W},${H}`, `--force-device-scale-factor=${scale}`, '--virtual-time-budget=4000'];
const url = 'file://' + htmlPath;
let fitReport = [];
try {
  const dom = execFileSync(chrome, [...base, '--dump-dom', url], { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'], timeout: 90000 });
  const m = dom.match(/<pre id="report"[^>]*>([\s\S]*?)<\/pre>/); if (m && m[1]) fitReport = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
  execFileSync(chrome, [...base, `--screenshot=${out}`, url], { stdio: 'ignore', timeout: 90000 });
} finally { fs.rmSync(prof, { recursive: true, force: true }); }
console.log(JSON.stringify({ png: out, html: htmlPath, size: [W * scale, H * scale], cards: n, seed, warnings, overflow: fitReport }, null, 1));
