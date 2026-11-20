// v23.1 확인: 황금 광맥 상한 없음(탭 · 드릴 모두 캐는 만큼 골드), 드릴 몫 "드릴 +nG" 표시(세 언어), 숯의 선물 창의 광고 제거 안내 한 줄(세 언어, 구매하면 안 보임)
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();let h=fs.readFileSync(process.argv[2],'utf8');
fs.writeFileSync('dbg33.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+h+'</body></html>');
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);
// v30: 숯 선물 안내는 없어진 '관리' 탭 대신 설정 위치
const HINT={ko:/광고 제거 패키지.*톱니바퀴 → 설정/,en:/Ad-Free Pack.*gear on the mining screen → Settings/,zh:/去廣告禮包.*齒輪 → 設定/},DR={ko:/^드릴 \+[\d,.]+[KMBT만억]?G$/,en:/^Drill \+/,zh:/鑽|鉆|钻/};
for(const L of ['ko','en','zh']){const ctx=await b.newContext({...devices['iPhone 13'],locale:'ko-KR'});await ctx.addInitScript(l=>{if(!localStorage.getItem('starfall.lang'))localStorage.setItem('starfall.lang',l)},L);
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const close=async()=>{for(let i=0;i<30&&await p.isVisible('#storyNext');i++)await p.click('#storyNext')};
  await p.goto('file://'+process.cwd()+'/dbg33.html');await p.waitForTimeout(800);if(await p.isVisible('#titleScr'))await p.click('#titleScr');await p.waitForTimeout(200);await close();if(await p.isVisible('#entry')){await p.waitForTimeout(500);await p.click('#entry');await p.waitForTimeout(700)}
  await p.evaluate(()=>{S.tutDone=true;setTab('mine');renderAll()});await close();
  if(L==='ko'){
    // 탭: 예전 상한(pot×1.5)을 훨씬 넘겨도 계속 골드
    const r=await p.evaluate(()=>{S.vein={left:30,pot:1000,got:0};const g0=S.gold;let zero=0;for(let i=0;i<200;i++){const g=S.gold;veinGold(1/40,true);if(S.gold<=g)zero++}return{got:S.vein.got,d:S.gold-g0,zero}});
    ok(r.zero===0&&r.got>=4900,`광맥 탭 200번: 매번 골드(+${r.got}G, 예전 상한 1,500G)`);
    const r2=await p.evaluate(()=>{const g=S.gold;for(let i=0;i<100;i++)veinGold(1/400,false);return S.gold-g});ok(r2>=250,`상한을 넘긴 뒤에도 드릴 몫 골드 +${r2}G`);
  }
  // 드릴: 실제로 몇 초 돌려서 "드릴 +nG"가 보이는지
  await p.evaluate(()=>{S.auto=Math.max(S.auto,3);S.autoOn=true;S.vein={left:30,pot:5000,got:0};A.vAutoT=0});await p.waitForTimeout(2600);
  const ft=await p.evaluate(()=>{const f=FLOATS.find(f=>f.id==='$d');return f?f.el.textContent:null});
  ok(ft&&DR[L].test(ft),`[${L}] 드릴 몫 표시: ${ft}`);
  await p.evaluate(()=>{S.vein=null});
  // 숯의 선물 창 안내 한 줄
  await p.evaluate(()=>{adsDay().gift=0;openGift();$('adDone').disabled=false;$('adDone').click()});await p.waitForTimeout(300);
  const t=await p.evaluate(()=>{const e=document.querySelector('.ad-hint');return e&&e.textContent});ok(t&&HINT[L].test(t),`[${L}] 숯의 선물 창 안내: ${t}`);await close();
  await p.evaluate(()=>{S.noAds=true;openGift()});await p.waitForTimeout(300);ok(!(await p.evaluate(()=>!!document.querySelector('.ad-hint'))),`[${L}] 광고 제거를 샀으면 안내 없음`);await close();
  ok(errs.length===0,`[${L}] 오류 없음 `+errs.join(' | '));await ctx.close()}
await b.close()})();
