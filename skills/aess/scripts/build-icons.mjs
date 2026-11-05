// One-off: bundle lucide icon geometry into assets/icons.json. Usage: node build-icons.mjs <lucide-react dir> <out.json>
import fs from 'node:fs'; import path from 'node:path';
const [dir,out]=process.argv.slice(2); const d=path.join(dir,'dist/esm/icons'); const res={};
for(const f of fs.readdirSync(d)){ if(!f.endsWith('.mjs'))continue; const s=fs.readFileSync(path.join(d,f),'utf8');
  const m=s.match(/const __iconNode = (\[[\s\S]*?\]);\s*\nconst /); if(!m)continue;
  let nodes; try{nodes=new Function('return '+m[1])()}catch{continue}
  res[f.replace('.mjs','')]=nodes.map(([t,a])=>{const{key,...r}=a;return `<${t} ${Object.entries(r).map(([k,v])=>`${k}="${v}"`).join(' ')}/>`}).join('');}
fs.writeFileSync(out,JSON.stringify(res)); console.log(Object.keys(res).length,'icons');
