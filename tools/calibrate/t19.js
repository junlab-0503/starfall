const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/harness.html');await p.waitForTimeout(200);
const r=await p.evaluate(()=>{const out=[];
  const cases={1:[['stone',500],['copper',500]],3:[['steel',1000],['iron',3000]],6:[['resonant',2000],['quartz',10000]],10:[['steel',10000],['olivine',10000],['diamond',5000]],13:[['starshard',10000],['stariron',20000]]};
  const done={1:0,3:2,6:5,10:9,13:13};
  for(const L in cases){S=fresh();S.unlocked=+L;S.floors=done[L]?SECTIONS[done[L]-1].to:0;refreshBonus();for(let i=0;i<60;i++)tickMarket(2,true);
    const row={L,ms:MSC.toFixed(1)};for(const[id,n]of cases[L]){const b0=bid(id);const tot=quote(id,n,-1);const m=S.mkt[id],q0=m.q,r0=m.rv,f0=m.fat;S.inv[id]=n;sell(id,n);const after=bid(id);row[`${id}×${n}`]=`평균${Math.round((tot/n/b0-1)*100)}% 끝${Math.round((after/b0-1)*100)}%`}out.push(row)}return out});
console.log(r.map(x=>JSON.stringify(x)).join('\n'));await b.close()})();
