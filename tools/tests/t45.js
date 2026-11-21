// v33 출시용 빌드(dist/starfall.html) 확인: 개발자 코드 · DEV 단추 · 모의 광고/결제 창 없음,
// 앱 연결(window.starfallNative)이 없으면 광고 보상은 바로 · 결제는 '스토어 연결 불가' 안내(공짜 적용 없음),
// 앱 연결이 있으면 광고 · 결제 · 복원이 연결을 거침, 세공 확률은 저장의 dev 표시와 무관, 화면 돌아보기 중 오류 없음
// 사용: node t45.js dist/starfall.html
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();fs.writeFileSync('dbg45.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+fs.readFileSync(process.argv[2],'utf8')+'</body></html>');
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);
const src=fs.readFileSync(process.argv[2],'utf8');
ok(!/id="devForm"|id="devVein"|id="devReview"|id="adModal"|id="shopModal"|테스트 버전|테스트 구매|개발자 코드|S\.dev/.test(src),'파일 안에 개발자 코드 · DEV 단추 · 모의 광고/결제 흔적 없음');
async function page(native,lang){const c=await b.newContext({...devices['Pixel 5'],locale:lang==='en'?'en-US':'ko-KR'});
  if(native)await c.addInitScript(()=>{window.__calls=[];window.starfallNative={showRewarded:n=>{__calls.push('ad:'+n);return Promise.resolve(true)},purchase:k=>{__calls.push('buy:'+k);return Promise.resolve(true)},restore:()=>{__calls.push('restore');return Promise.resolve(false)},requestReview:()=>Promise.resolve()}});
  const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await p.goto('file://'+process.cwd()+'/dbg45.html');await p.waitForTimeout(900);
  await p.evaluate(()=>{$('titleScr').hidden=true;$('entry').hidden=true;STQ.length=0;$('story').hidden=true;S.tutDone=true;S.prologue=true;S.unlocked=4;S.floors=8;S.gold=1e6;S.ntq=[];S.ntDone=['셈','핀','루카','미르','린'];refreshBonus();setTab('mine');renderAll()});
  return {p,c,errs}}
// 1) 앱 연결 없음(웹 미리보기)
{const {p,c,errs}=await page(false,'ko');
 const r=await p.evaluate(async()=>{const g0=S.gold,left0=giftLeft();$('giftBtn').click();await new Promise(r=>setTimeout(r,300));
   const gift={modal:!!document.querySelector('#adModal'),got:S.gold>g0,used:giftLeft()===left0-1,story:!$('story').hidden};STQ.length=0;while(!$('story').hidden)nextStory();
   $('boostBtn').click();await new Promise(r=>setTimeout(r,200));const boost=boostOn();
   openSheet('set');await new Promise(r=>setTimeout(r,200));$('buyPkg').click();await new Promise(r=>setTimeout(r,200));
   const toast=[...document.querySelectorAll('.toast')].map(t=>t.textContent).join(' / ');closeSheet();
   S.dev=1;const cp=craftP(5);
   return{gift,boost,noAds:S.noAds,toast,cp,dev:!!document.querySelector('#devForm,#devVein,#devReview,#shopModal'),restoreHidden:$('restorePkg').hidden}});
 ok(r.gift.got&&r.gift.used&&r.gift.story&&!r.gift.modal,'연결 없음: 선물 상자는 모의 광고 창 없이 바로 보상 · 횟수 차감');
 ok(r.boost,'연결 없음: 채굴 2배도 바로 켜짐');
 ok(!r.noAds&&/스토어에 연결할 수 없어요/.test(r.toast),'연결 없음: 광고 제거 구매는 적용되지 않고 안내만 ('+r.toast+')');
 ok(r.restoreHidden,'연결 없음: [구매 복원] 숨김');
 ok(r.cp<1,'저장에 dev 표시가 있어도 세공 확률은 그대로 ('+Math.round(r.cp*100)+'%)');
 ok(!r.dev,'개발자 칸 · DEV 단추 · 모의 결제 창 요소 없음');
 // 톱니바퀴 10초 눌러도 개발자 칸이 안 생김
 await p.evaluate(()=>{closeSheet();setTab('mine')});const gb=await p.$('#setBtn');const bx=await gb.boundingBox();
 await p.mouse.move(bx.x+bx.width/2,bx.y+bx.height/2);await p.mouse.down();await p.waitForTimeout(10500);await p.mouse.up();
 ok(await p.evaluate(()=>!document.querySelector('#devForm')&&![...document.querySelectorAll('.toast')].some(t=>/개발자/.test(t.textContent))),'톱니바퀴를 10초 눌러도 개발자 칸 없음');
 // 뒤로 가기(Escape)로 열린 창 닫기: 없는 모의 창 때문에 멈추지 않음
 const bk=await p.evaluate(()=>{openSheet('set');exitAsk();const a=$('sheet').hidden;exitAsk();const q=!$('exitModal').hidden;exitAsk();return a&&q&&$('exitModal').hidden});
 ok(bk,'뒤로 가기: 설정 창 닫힘 → 종료 확인 창 → 다시 누르면 닫힘(모의 창이 없어도 오류 없음)');
 // 모든 탭 · 시트 돌아보기
 await p.evaluate(async()=>{const w=()=>new Promise(r=>setTimeout(r,80));for(const t of['forge','market','mine','tower','equip']){setTab(t);renderAll();await w()}for(const s of['store','book','set','craft','shaft']){openSheet(s);renderAll();await w();closeSheet()}});
 ok(errs.length===0,'화면 돌아보기 중 오류 없음 '+JSON.stringify(errs.slice(0,3)));await c.close()}
// 2) 앱 연결 있음(플레이 스토어 앱)
{const {p,c,errs}=await page(true,'ko');
 const r=await p.evaluate(async()=>{const g0=S.gold;$('giftBtn').click();await new Promise(r=>setTimeout(r,300));const got=S.gold>g0;STQ.length=0;while(!$('story').hidden)nextStory();
   openSheet('set');await new Promise(r=>setTimeout(r,200));const rh=$('restorePkg').hidden;$('buyPkg').click();await new Promise(r=>setTimeout(r,300));closeSheet();
   return{got,calls:__calls.slice(),noAds:S.noAds,rh}});
 ok(r.got&&r.calls.includes('ad:숯의 선물 상자'),'앱 연결: 선물 상자는 앱 광고(showRewarded)를 거쳐 보상');
 ok(r.noAds&&r.calls.includes('buy:no_ads'),'앱 연결: 구매(purchase no_ads) 확인 뒤 광고 제거 적용');
 ok(!r.rh,'앱 연결: [구매 복원] 보임');
 ok(errs.length===0,'오류 없음 '+JSON.stringify(errs.slice(0,3)));await c.close()}
// 3) 영어: 스토어 안내 번역
{const {p,c}=await page(false,'en');await p.evaluate(()=>applyLang('en'));
 const t=await p.evaluate(async()=>{openSheet('set');await new Promise(r=>setTimeout(r,200));$('buyPkg').click();await new Promise(r=>setTimeout(r,200));return [...document.querySelectorAll('.toast')].map(t=>t.textContent).join(' / ')});
 ok(/connect to the store/.test(t)&&!/[가-힣]/.test(t),'영어: 스토어 안내 번역 ('+t+')');await c.close()}
await b.close()})();
