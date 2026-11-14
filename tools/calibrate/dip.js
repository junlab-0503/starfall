// 출입권 "발표 직후 떨어진 지층을 사서 기다렸다 팔기" 수익 분포 (시장만 돌림, 1초씩, 200시간)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/harness.html');await p.waitForTimeout(200);
const r=await p.evaluate((wait)=>{let rs=11;Math.random=()=>{rs=(rs+0x6D2B79F5)>>>0;let t=rs;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
  window.log=()=>{};window.toast=()=>{};S=fresh();S.unlocked=13;S.floors=30;S.tutDone=true;refreshBonus();
  const trades=[],open=[];let lastDone=0;
  for(let t=0;t<200*3600;t++){tickMarket(1,false);
    // 새 발표를 보면: 값이 0.9 아래로 떨어졌으면 산다(가격 기준)
    if(S.rumDone.length&&S.rumDone[0].id!==lastDone){const d=S.rumDone[0];lastDone=d.id;const P=PM(d.L);if(P.m<(window.TH||.9))open.push({L:d.L,buy:passBase(d.L)*P.m,t})}
    for(let k=open.length-1;k>=0;k--){const o=open[k];if(t-o.t>=wait){const sell=passBase(o.L)*PM(o.L).m;trades.push(sell/o.buy-1);open.splice(k,1)}}}
  trades.sort((a,b)=>a-b);const n=trades.length,avg=trades.reduce((a,b)=>a+b,0)/n,loss=trades.filter(x=>x<0).length;
  return{n,avg:+(avg*100).toFixed(1),loss,min:+(trades[0]*100).toFixed(1),med:+(trades[n>>1]*100).toFixed(1),max:+(trades[n-1]*100).toFixed(1)}},+process.argv[2]);
console.log('기다린 시간',process.argv[2]/60,'분:',JSON.stringify(r));await b.close()})();
