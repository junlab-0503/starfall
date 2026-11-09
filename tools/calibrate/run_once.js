// 봇 한 판: 엔딩 시간과 지층·구간 도달 시간 (사용: python3 tools/mkharness.py 후 harness.html과 bal.json이 있는 폴더에서 node run_once.js bal.json)
// 한 번 돌려 보기: 끝까지 걸린 시간과 지층/구간 시간
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.cwd()+'/harness.html');await p.waitForTimeout(200);
const bal=JSON.parse(fs.readFileSync(process.argv[2]||'bal.json','utf8'));const t0=Date.now();
const r=await p.evaluate(([bal])=>{const r=botRun(bal,null,{type:'E'},3600*80,3);return{u:r.unlockT,s:r.sectT,e:r.endT,f:r.final,up:JSON.stringify(S.up),of:Math.round(S.ofG||0),earned:Math.round(S.earned)}},[bal]);
const H=x=>(x/3600).toFixed(1);console.log('sec',((Date.now()-t0)/1000)|0,'END',r.e?H(r.e):'-',JSON.stringify(r.f),r.up,'overflowG',r.of,'earned',r.earned);
console.log('L',Object.entries(r.u).map(([k,v])=>k+':'+H(v)).join(' '));console.log('S',Object.entries(r.s).map(([k,v])=>k+':'+H(v)).join(' '));console.log(errs);await b.close()})();
