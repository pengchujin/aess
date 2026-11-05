#!/usr/bin/env node
// Print the dominant non-neutral colors of an image, so brand palettes come from official artwork rather than guesses.
// Usage: node extract-colors.mjs logo.png [more.png ...]
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { execFileSync } from 'node:child_process';
const files = process.argv.slice(2);
if (!files.length) { console.error('usage: extract-colors.mjs <image> [image...]'); process.exit(2); }
const chrome = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(p => p && fs.existsSync(p));
if (!chrome) { console.error('No Chrome/Chromium found; set CHROME_PATH.'); process.exit(4); }
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'aess-c-'));
const page = path.join(prof, 'c.html');
const list = files.map(f => 'file://' + path.resolve(f));
fs.writeFileSync(page, `<!doctype html><pre id=o></pre><script>
const hex=(r,g,b)=>'#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
Promise.all(${JSON.stringify(list)}.map(u=>new Promise(res=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas'),s=Math.min(1,256/Math.max(i.naturalWidth,i.naturalHeight));c.width=Math.max(1,i.naturalWidth*s|0);c.height=Math.max(1,i.naturalHeight*s|0);const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(i,0,0,c.width,c.height);const d=x.getImageData(0,0,c.width,c.height).data,b={};let n=0;
for(let k=0;k<d.length;k+=4){if(d[k+3]<128)continue;n++;const r=d[k],g=d[k+1],h=d[k+2],mx=Math.max(r,g,h),mn=Math.min(r,g,h);if(mx-mn<28||mx<40||mn>236)continue;const q=hex(r&0xE0|16,g&0xE0|16,h&0xE0|16);(b[q]=b[q]||{c:0,r:0,g:0,b:0});b[q].c++;b[q].r+=r;b[q].g+=g;b[q].b+=h}
res({u,colors:Object.values(b).sort((a,z)=>z.c-a.c).slice(0,5).map(v=>({hex:hex(v.r/v.c|0,v.g/v.c|0,v.b/v.c|0),share:+(v.c/n*100).toFixed(1)}))})};i.onerror=()=>res({u,error:'could not load'});i.src=u}))).then(r=>{document.getElementById('o').textContent=JSON.stringify(r)})
</script>`);
try {
  const dom = execFileSync(chrome, ['--headless=new', '--disable-gpu', '--allow-file-access-from-files', `--user-data-dir=${path.join(prof, 'p')}`, '--virtual-time-budget=4000', '--dump-dom', 'file://' + page], { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'], timeout: 60000 });
  const m = dom.match(/<pre id="o">([\s\S]*?)<\/pre>/); const r = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
  for (const f of r) console.log(path.basename(decodeURI(f.u)) + ': ' + (f.error || f.colors.map(c => `${c.hex} (${c.share}%)`).join('  ') || '(only neutral colors)'));
} finally { fs.rmSync(prof, { recursive: true, force: true }); }
