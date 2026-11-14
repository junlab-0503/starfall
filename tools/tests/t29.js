// v20 확인: 버그 제보 칸 없음, 리뷰 부탁(B4를 열 때 한 번, [나중에]면 B7에서 한 번 더, [리뷰 남기기]면 다시 안 나옴), 개발자 모드 [DEV 리뷰]
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();let h=fs.readFileSync(process.argv[2],'utf8');
fs.writeFileSync('dbg29.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+h+'</body></html>');
const ctx=await b.newContext({...devices['iPhone 13'],locale:'ko-KR'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);const close=async()=>{for(let i=0;i<30&&await p.isVisible('#storyNext');i++)await p.click('#storyNext')};
await p.goto('file://'+process.cwd()+'/dbg29.html');await p.waitForTimeout(800);await p.click('#titleScr');await p.waitForTimeout(200);await close();if(await p.isVisible('#entry')){await p.waitForTimeout(500);await p.click('#entry');await p.waitForTimeout(700)}
await p.evaluate(()=>{S.tutDone=true;renderAll()});await close();
ok(await p.evaluate(()=>!document.getElementById('bugText')&&!/버그 제보/.test(document.body.innerHTML)&&typeof BUG_MAIL==='undefined'),'버그 제보 칸 없음');
const open=i=>p.evaluate(i=>{S.unlocked=i;const L=LAYERS[i];S.gold=L.req.g+1;Object.entries(L.req.items).forEach(([id,n])=>{S.inv[id]=n});unlockLayer(i)},i);
const seen=async()=>{for(let k=0;k<10&&await p.isVisible('#storyNext');k++){const t=await p.evaluate(()=>$('storyT').textContent);if(/마음에 드나요/.test(t))return true;await p.click('#storyNext')}return false};
await open(1);ok(!(await seen()),'B2를 열 때는 리뷰 부탁 없음');await open(2);ok(!(await seen()),'B3을 열 때도 없음');
await open(3);const r1=await seen();ok(r1&&await p.evaluate(()=>$('storyNext').textContent==='나중에'&&!!$('revGo')),'B4를 열 때(B1~B3을 다 캤을 때) 리뷰 부탁 + [리뷰 남기기] · [나중에]');
await p.click('#storyNext');await close();ok(await p.evaluate(()=>S.review==='later'),'[나중에] → 나중에 한 번 더');
await open(4);ok(!(await seen()),'B5에선 없음');await open(5);await close();await open(6);ok(await seen(),'B7을 열 때 한 번 더');await p.click('#revGo');await p.waitForTimeout(100);
ok(await p.evaluate(()=>S.review==='done'),'[리뷰 남기기] → 다시 안 나옴');await close();
// 개발자 모드
ok(await p.evaluate(()=>$('devReview').hidden),'개발자 모드 전엔 [DEV 리뷰] 숨김');
await p.click('[data-tab="manage"]');await p.click('[data-sub="set"]');await p.fill('#devCode','jun');await p.press('#devCode','Enter');await p.waitForTimeout(300);await close();
await p.click('[data-tab="mine"]');await p.waitForTimeout(300);await close();ok(await p.evaluate(()=>!$('devReview').hidden),'개발자 모드: 채굴 화면에 [DEV 리뷰]');
await p.evaluate(()=>{S.review='done'});await p.click('#devReview');await p.waitForTimeout(200);ok(await seen(),'[DEV 리뷰] → 이미 리뷰했어도 메시지 바로 보기');
console.log('errors',errs);await b.close()})();
