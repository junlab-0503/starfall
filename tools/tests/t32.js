// v23 확인: 3분마다 앱을 껐다 켜서 보상을 더 받는 방법이 없는지(자리 비움 보상 · 시장 시계 · 광고 횟수 · 황금 광맥 타이머 · 중복 지급)
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();let h=fs.readFileSync(process.argv[2],'utf8');
fs.writeFileSync('dbg32.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+h+'</body></html>');
const ctx=await b.newContext({...devices['iPhone 13'],locale:'ko-KR'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);const close=async()=>{for(let i=0;i<30&&await p.isVisible('#storyNext');i++)await p.click('#storyNext')};
await p.goto('file://'+process.cwd()+'/dbg32.html');await p.waitForTimeout(800);await p.click('#titleScr');await p.waitForTimeout(200);await close();if(await p.isVisible('#entry')){await p.waitForTimeout(500);await p.click('#entry');await p.waitForTimeout(700)}
// 중반 상태: B9까지, 탑 52층, 드릴 로봇 켬
const mid=()=>p.evaluate(()=>{S.tutDone=true;S.unlocked=9;S.layer=8;S.floors=52;S.auto=30;S.pick=60;S.autoOn=true;S.box={};S.rentAcc=0;S.ofG=0;S.ofN=0;refreshBonus();S.hp=layerHp(S.layer);renderAll()});
await mid();await close();
// 1) 같은 3시간: 계속 켜 둠 / 한 번에 비움 / 3분마다 껐다 켬(60번)
const R=await p.evaluate(()=>{const snap=JSON.stringify(S),val=r=>{let v=r.rent+r.sold.g;for(const id in r.ores)v+=r.ores[id]*ITEMS[id].p;return v};
  const online=rentPerSec()*10800+playRate()*10800*0;   // 켜 둔 동안의 월세(채굴 수입은 따로)
  const drillOn=playRate()*10800;                       // 켜 두고 탭 2.5회/초 + 드릴로 캔 광석 수
  S=JSON.parse(snap);refreshBonus();const one=catchUp(10800);const oneN=Object.values(one.ores).reduce((a,b)=>a+b,0)+one.sold.n;
  S=JSON.parse(snap);refreshBonus();let rent=0,n=0,v=0,nulls=0;for(let i=0;i<60;i++){const r=catchUp(180);if(!r){nulls++;continue}rent+=r.rent;n+=Object.values(r.ores).reduce((a,b)=>a+b,0)+r.sold.n;v+=val(r)}
  S=JSON.parse(snap);refreshBonus();const short=catchUp(179);
  S=JSON.parse(snap);refreshBonus();return{online,drillOn,oneRent:one.rent,oneN,oneV:val(one),rent,n,v,nulls,short}});
ok(R.short===null,'3분이 안 되게 비우면 보상 없음');
ok(R.nulls===0&&R.rent<=R.online/8*1.001+1&&R.n<=R.drillOn/8*1.01+2,`3분마다 껐다 켜기(60번): 월세 ${Math.round(R.rent)} ≤ 켜 둔 월세의 1/8 ${Math.round(R.online/8)}, 광석 ${R.n} ≤ 켜 두고 캔 양의 1/8 ${Math.round(R.drillOn/8)}`);
ok(Math.abs(R.rent-R.oneRent)<=R.oneRent*.01+1&&Math.abs(R.n-R.oneN)<=R.oneN*.02+60,`3분씩 60번 = 한 번에 3시간 비움과 같음(월세 ${Math.round(R.rent)} / ${Math.round(R.oneRent)}, 광석 ${R.n} / ${R.oneN})`);
// 2) 실제로 저장 → 3분 뒤 다시 켜기를 여러 번: 시장 시계 · 광고 횟수 · 황금 광맥 타이머 · 보상 한 번만
await mid();await p.evaluate(()=>{adsDay().gift=3;adsDay().boost=7;S.veinT=333;S.rentAcc=0;save()});
let tot=0,clk=[],wels=[];for(let k=0;k<5;k++){
  const c0=await p.evaluate(()=>{CLK.hold=true;S.lastSeen-=181000;S.maxClock=S.lastSeen;   // 닫힐 때 저장이 lastSeen을 덮지 않게
   const c=S.clock;const g=S.rentAcc;localStorage.setItem(SAVE_KEY,JSON.stringify(S));return{c,g}});
  await p.reload();await p.waitForTimeout(2200);
  // 다시 켜자마자 화면 전환이 겹쳐도(보였다 · 숨었다) 보상은 한 번만
  await p.evaluate(()=>{document.dispatchEvent(new Event('visibilitychange'));document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(300);
  const c1=await p.evaluate(()=>({c:S.clock,g:S.rentAcc,gift:adsDay().gift,boost:adsDay().boost,veinT:S.veinT,wel:!!document.querySelector('#story:not([hidden])')}));
  clk.push(+(c1.c-c0.c).toFixed(0));tot+=c1.g-c0.g;wels.push(c1.wel);if(await p.isVisible('#titleScr'))await p.click('#titleScr');await p.waitForTimeout(200);await close();
  if(k===0)ok(c1.gift===3&&c1.boost===7,'다시 켜도 오늘 광고 선물 · 2배 횟수는 그대로');
  if(k===0)ok(c1.veinT<=333&&c1.veinT>300,`다시 켜도 황금 광맥 타이머는 이어서(${Math.round(c1.veinT)}초 남음)`);
}
ok(clk.every(d=>d>=178&&d<200),`다시 켤 때 시장 시계는 비운 만큼만 흐름(${clk.join(', ')}초 — 처음 시작 때의 6분 예열은 없음)`);
ok(wels.every(x=>x),'다시 켤 때마다 자리 비움 보상 창은 한 번씩');
const exp=await p.evaluate(()=>rentPerSec()*offEquiv(181));
ok(tot>=exp*5*.9&&tot<=exp*5*1.1+await p.evaluate(()=>rentPerSec()*15),`5번 껐다 켠 월세 ${Math.round(tot)} ≈ 3분 비움 5번치 ${Math.round(exp*5)} (켜 두었으면 ${await p.evaluate(()=>Math.round(rentPerSec()*181*5))})`);
ok(errs.length===0,'오류 없음 '+errs.join(' | '));await b.close()})();
