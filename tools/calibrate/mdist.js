// 200시간 동안 지층별 값 기준(a) · 분위기(m) 분포
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/harness.html');await p.waitForTimeout(200);
const r=await p.evaluate(()=>{let rs=5;Math.random=()=>{rs=(rs+0x6D2B79F5)>>>0;let t=rs;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
  window.log=()=>{};window.toast=()=>{};S=fresh();S.unlocked=13;S.floors=30;refreshBonus();const ms=[];let n=0;
  for(let t=0;t<200*3600;t++){tickMarket(1,false);if(t%600===0)for(let i=0;i<13;i++)ms.push(PM(i).m)}
  ms.sort((a,b)=>a-b);const q=f=>+ms[Math.floor(f*(ms.length-1))].toFixed(2);const lg=ms.reduce((s,x)=>s+Math.log(x),0)/ms.length;
  return{n:S.rumN,q05:q(.05),q25:q(.25),med:q(.5),q75:q(.75),q95:q(.95),max:q(1),min:q(0),geo:+Math.exp(lg).toFixed(2),at8:ms.filter(x=>x>=7.9).length/ms.length,at015:ms.filter(x=>x<=.16).length/ms.length}});
console.log(JSON.stringify(r));await b.close()})();
