// 1층(대장간 터)의 골드는 튜토리얼용 고정값(TUT_FLOOR_G)이라 맞추지 않는다
const {chromium}=require('playwright');const fs=require('fs');
const SC=+(process.env.SC||.606),END=+(process.env.END||30),TL0={1:0,2:.15,3:.55,4:1.3,5:2.6,6:4.6,7:7.2,8:10.5,9:14.5,10:19,11:24.5,12:30.5,13:37},TU0={0:0,1:.4,2:1,3:2,4:3.5,5:5.8,6:8.8,7:12.5,8:16.8,9:21.5,10:27,11:33.5,12:41,13:49.5};
const TL={},TU={};for(const k in TL0)TL[k]=TL0[k]*SC;for(const k in TU0)TU[k]=TU0[k]*SC;
const RT=[0,1.6,1.5,1.4,1.35,1.3,1.2,1.15,1.1,1,.95,.9,.85,.8];
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/harness.html');await p.waitForTimeout(200);
let bal=JSON.parse(fs.readFileSync('bal.json','utf8'));const iters=+process.argv[2]||12;
for(let it=0;it<iters;it++){const t0=Date.now();
  const r=await p.evaluate(([bal])=>{const r=botRun(bal,null,{type:'E'},3600*80,7);return{u:r.unlockT,s:r.sectT,e:r.endT,f:r.final,RS:r.RS}},[bal]);
  const H=x=>x/3600,u={1:0},s={0:0};for(const k in r.u)u[k]=H(r.u[k]);for(const k in r.s)s[k]=H(r.s[k]);
  const rate={},fill={};for(const k in r.RS){rate[k]=r.RS[k].r/r.RS[k].n;fill[k]=r.RS[k].f/r.RS[k].n}
  console.log(`#${it} ${((Date.now()-t0)/1000)|0}s END=${r.e?H(r.e).toFixed(1):'-'} fl=${r.f.fl} L=${r.f.L} pick=${r.f.pick} auto=${r.f.auto} wh=${r.f.wh}`);
  console.log('  L '+Object.keys(TL).filter(k=>k>1).map(k=>`${k}:${u[k]!=null?u[k].toFixed(1):'-'}`).join(' ')+' | S '+Object.keys(TU).filter(k=>k>0).map(k=>`${k}:${s[k]!=null?s[k].toFixed(1):'-'}`).join(' '));
  console.log('  rate/s '+Object.keys(rate).map(k=>`B${k}:${rate[k].toFixed(2)}`).join(' '));
  console.log('  fill분 '+Object.keys(fill).map(k=>`B${k}:${fill[k].toFixed(0)}`).join(' '));
  fs.writeFileSync('bal9_it'+it+'.json',JSON.stringify(bal));
  const rateOK=Object.keys(rate).every(k=>Math.abs(rate[k]/RT[k]-1)<.2);
  if(r.e&&Math.abs(H(r.e)-END)<1.2&&rateOK&&it>0){console.log('converged');break}
  for(const k in rate){const f=Math.min(3,Math.max(.33,Math.pow(rate[k]/RT[k],.85)));bal.hp[k-1]=+(bal.hp[k-1]*f).toPrecision(4)}
  const last=r.e?H(r.e):80;
  for(let k=2;k<=13;k++){if(u[k-1]==null)break;const D=TL[k]-TL[k-1],d=u[k]!=null?u[k]-u[k-1]:(80-u[k-1])*1.5;bal.unlock[k-1]=+(bal.unlock[k-1]*Math.min(2.2,Math.max(.4,Math.pow(D/Math.max(d,.02),.7)))).toPrecision(4)}
  for(let k=2;k<=13;k++){if(s[k-1]==null)break;const E=TU[k]-TU[k-1],e=s[k]!=null?s[k]-s[k-1]:(80-s[k-1])*1.5;bal.tg[k-1]=+(bal.tg[k-1]*Math.min(2.2,Math.max(.4,Math.pow(E/Math.max(e,.02),.7)))).toPrecision(4)}
  for(let i=2;i<bal.tg.length;i++)if(bal.tg[i]<bal.tg[i-1]*1.2)bal.tg[i]=+(bal.tg[i-1]*1.2).toPrecision(4);
  bal.sky=+(bal.tg[12]*2.5).toPrecision(4);fs.writeFileSync('bal.json',JSON.stringify(bal));
}
await b.close()})();
