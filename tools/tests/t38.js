// v24 업데이트 호환: 이전 빌드(인수 2)에서 만든 저장을 새 빌드(인수 1)로 열기 — tab=manage, 창고 용량, 튜토리얼 · 일지 · 도감 · 광고 제거 · 언어 그대로
// 옛 저장은 이전 빌드에서 만들어 꺼낸 뒤, 새 창(새 빌드)에 그대로 넣고 연다(앱 업데이트 뒤 다시 켜는 것과 같음)
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const wrap=(src,dst)=>fs.writeFileSync(dst,'<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+fs.readFileSync(src,'utf8')+'</body></html>');
wrap(process.argv[3],'dbg38old.html');wrap(process.argv[2],'dbg38new.html');const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);
const closeAll=async p=>{for(let i=0;i<30&&await p.isVisible('#storyNext');i++)await p.click('#storyNext')};
const newCtx=async(raw,lang)=>{const c=await b.newContext({...devices['Pixel 5'],locale:'ko-KR'});await c.addInitScript(([r,l])=>{try{if(!sessionStorage.getItem('inj')){if(r!=null)localStorage.setItem('starfall-v1',r);localStorage.setItem('starfall.lang',l);sessionStorage.setItem('inj','1')}}catch(e){}},[raw,lang]);return c};
for(const L of ['ko','en','zh']){
  // 1) 이전 빌드에서 저장 만들기
  let ctx=await newCtx(null,L),p=await ctx.newPage();
  await p.goto('file://'+process.cwd()+'/dbg38old.html');await p.waitForTimeout(800);if(await p.isVisible('#titleScr'))await p.click('#titleScr');await p.waitForTimeout(200);await closeAll(p);
  if(await p.isVisible('#entry')){await p.waitForTimeout(500);await p.click('#entry');await p.waitForTimeout(700)}await closeAll(p);
  const old=await p.evaluate(()=>{S.tutDone=true;S.unlocked=6;S.layer=5;S.floors=12;S.wh=3;S.pick=30;S.auto=8;S.inv={stone:50,bronze:7,slag:2};S.box={copper:9};S.found=[0,1,2];S.journal=[0,1,2,3,4,5];S.noAds=true;S.gold=123456;S.tab='manage';S.sub='set';refreshBonus();CLK.hold=true;save();
    return{cap:cap(),gold:S.gold,raw:localStorage.getItem(SAVE_KEY)}});
  await ctx.close();
  // 2) 새 빌드로 열기
  ctx=await newCtx(old.raw,L);p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/dbg38new.html');await p.waitForTimeout(1200);if(await p.isVisible('#titleScr'))await p.click('#titleScr');await p.waitForTimeout(300);await closeAll(p);
  const nw=await p.evaluate(()=>({cap:cap(),gold:S.gold,tab:S.tab,mineVis:!$('tab-mine').hidden,sheet:$('sheet').hidden,tut:S.tutDone,tutVis:!$('tut').hidden,j:S.journal.length,f:S.found.length,inv:(S.inv.stone||0)+(S.inv.bronze||0)+(S.inv.slag||0),box:S.box.copper,noAds:S.noAds,whHint:S.whHint,lang:LANG,floors:S.floors}));
  ok(nw.tab==='mine'&&nw.mineVis&&nw.sheet,`[${L}] 저장된 tab=manage → 채굴 화면`);ok(nw.cap>=old.cap,`[${L}] 창고 용량 ${old.cap} → ${nw.cap} (줄지 않음)`);
  const same=nw.gold>=old.gold&&nw.tut&&!nw.tutVis&&nw.j===6&&nw.f===3&&nw.inv>=59&&nw.box===9&&nw.noAds&&nw.floors===12;if(!same)console.log(JSON.stringify(nw));
  ok(same,`[${L}] 골드 · 튜토리얼 완료 · 일지 · 도감 · 창고 · 로봇 보관함 · 광고 제거 · 탑 그대로`);
  ok(nw.lang===L&&nw.whHint===0,`[${L}] 언어 ${nw.lang} 그대로, 새 기록(whHint) 기본값`);
  await p.click('#whBtn');await p.waitForTimeout(150);ok(await p.evaluate(()=>!$('sheet').hidden&&document.querySelectorAll('#inv [data-sellq]').length>0),`[${L}] 새 창고 창에서 옛 물건 보임`);
  ok(errs.length===0,`[${L}] 오류 없음 `+errs.join(' | '));await ctx.close()}
// 3) 망가진 저장: 새 게임으로 시작하되 원본은 -bak에 남김(덮어써서 잃지 않게)
{const ctx=await newCtx('{"inv":','ko'),p=await ctx.newPage();await p.goto('file://'+process.cwd()+'/dbg38new.html');await p.waitForTimeout(900);
  ok(await p.evaluate(()=>localStorage.getItem(SAVE_KEY+'-bak')==='{"inv":'),'망가진 저장은 지우지 않고 -bak에 보관');await ctx.close()}
await b.close()})();
