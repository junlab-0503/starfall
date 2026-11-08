// 입주자 초상화 전체 보기: node tools/preview/portraits.js out.png
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const S=require('path').join(__dirname,'../../src/')+'/';const tw=fs.readFileSync(S+'tower.js','utf8');const por=tw.slice(tw.indexOf('/* 입주자 초상'));
const js=['data.js','pixel.js'].map(f=>fs.readFileSync(S+f,'utf8')).join('\n')+'\n'+por;
const html=`<body style="margin:0;background:#111a30;font:12px sans-serif;color:#cde"><div id=g style="display:flex;flex-wrap:wrap;gap:6px;padding:6px;width:1250px"></div><script>${js}
const L=SECTIONS.map(s=>s.t).concat([{name:'이장 할머니',hair:'#d8d4cc',hat:'scarf',coat:'#6a5a4a'}]);
L.forEach((t,i)=>{const d=document.createElement('div');const c=document.createElement('canvas');drawPortrait(c,t,false);c.style.width='192px';c.style.height='192px';c.style.imageRendering='pixelated';d.appendChild(c);d.append(' '+t.name);document.getElementById('g').appendChild(d)});
{const c=document.createElement('canvas');drawPortrait(c,L[3],true);c.style.width='96px';c.style.imageRendering='pixelated';document.getElementById('g').appendChild(c)}</script>`;
fs.writeFileSync(require('os').tmpdir()+'/por.html',html);const b=await chromium.launch();const p=await b.newPage({viewport:{width:1260,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('os').tmpdir()+'/por.html');await p.waitForTimeout(300);await p.screenshot({path:process.argv[2],fullPage:true});console.log('errors',errs);await b.close()})();
