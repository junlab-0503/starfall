// 광물 아이콘 전체 보기: node tools/preview/icons.js out.png [id ...]
// 아이콘 전체 보기: node sheet.js out.png [ids...]
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const S=require('path').join(__dirname,'../../src/')+'/';const js=['data.js','pixel.js','icons.js'].map(f=>fs.readFileSync(S+f,'utf8')).join('\n');
const html=`<body style="margin:0;background:#111a30;font:11px sans-serif;color:#cde"><div id=g style="display:grid;grid-template-columns:repeat(10,128px);gap:4px;padding:6px"></div><script>${js}
const only=${JSON.stringify(process.argv.slice(3))};const ids=only.length?only:ORDER;
ids.forEach(id=>{const d=document.createElement('div');const c=drawIcon(id,32).canvas(4);const c2=drawIcon(id,16).canvas(2);d.appendChild(c);d.appendChild(c2);d.append(' '+ITEMS[id].n);document.getElementById('g').appendChild(d)});</script>`;
fs.writeFileSync(require('os').tmpdir()+'/sheet.html',html);const b=await chromium.launch();const p=await b.newPage({viewport:{width:1340,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('os').tmpdir()+'/sheet.html');await p.waitForTimeout(300);await p.screenshot({path:process.argv[2],fullPage:true});console.log('errors',errs);await b.close()})();
