// 확인: 설정 문구, 창고 표기, 입주자 카드, 광고 하루 횟수, 시계 조작 방지 (튜토리얼은 t24)
const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const fs=require('fs');let h=fs.readFileSync(process.argv[2],'utf8');
h='<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+h.replace('/* ═════════ 시작 ═════════ */','window.__d=()=>({S});');fs.writeFileSync('dbg23.html',h);
const url='file://'+process.cwd()+'/dbg23.html';
const ctx=await b.newContext({...devices['Galaxy S9+']});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);
const closeStory=async()=>{while(await p.isVisible('#storyNext'))await p.click('#storyNext')};
const glow=()=>p.evaluate(()=>[...document.querySelectorAll('.tut-glow')].map(e=>e.id||e.dataset.pk||e.dataset.tab||e.className.split(' ')[0]).join(','));
await p.goto(url);await p.waitForTimeout(500);if(await p.isVisible('#titleScr'))await p.click('#titleScr');await p.waitForTimeout(200);await closeStory();if(await p.isVisible('#entry')){await p.waitForTimeout(500);await p.click('#entry');await p.waitForTimeout(700)}
// 튜토리얼은 t24에서 확인. 여기선 건너뜀
await p.evaluate(()=>{__d().S.tutDone=true;renderAll()});await p.waitForTimeout(300);
ok((await p.textContent('#tutAgain'))==='튜토리얼 다시 보기','설정 버튼 문구');
// 입주자 카드
await p.evaluate(()=>{const S=__d().S;S.floors=40;refreshBonus();renderAll()});await p.click('[data-tab="tower"]');await p.waitForTimeout(1200);await closeStory();
await p.screenshot({path:'v83_tower40.png'});
await p.click('[data-sec="0"]');await p.waitForTimeout(300);const card=await p.evaluate(()=>({t:$('storyT').textContent,b:$('storyB').textContent,x:$('storyX').textContent,por:!$('portrait').hidden||!$('portraitArt').hidden}));
ok(card.por&&/무쇠/.test(card.t)&&card.b.length>5&&/"/.test(card.x),'무쇠 카드: '+card.t+' | '+card.b.slice(0,20)+' | '+card.x.slice(0,40));
await p.screenshot({path:'v83_tenant.png'});await closeStory();
await p.click('[data-sec="10"]');await p.waitForTimeout(300);ok(/비어 있는/.test(await p.textContent('#storyT')),'잠긴 구간: '+await p.textContent('#storyB'));await closeStory();
// 개발자 코드 → 창고 표기
await p.click('[data-tab="manage"]');await p.click('[data-sub="set"]');await p.evaluate(()=>{document.getElementById('devForm').hidden=false});await p.fill('#devCode','jun');await p.press('#devCode','Enter');await p.waitForTimeout(500);await closeStory();
const st=await p.evaluate(()=>{const e=$('store');return{t:e.textContent,ov:e.scrollWidth>e.clientWidth}});ok(!st.ov&&!/…/.test(st.t),'헤더 창고 표기 잘림 없음: '+st.t);
await p.click('[data-tab="mine"]');await p.waitForTimeout(400);const sc=await p.evaluate(()=>$('nextL').innerText.replace(/\n/g,' '));ok(true,'다음 지층 칸: '+sc);await p.screenshot({path:'v83_dev_mine.png'});
await p.click('[data-tab="tower"]');await p.waitForTimeout(800);await p.screenshot({path:'v83_tower99.png'});
// 광고 하루 횟수
await p.click('[data-tab="mine"]');await p.waitForTimeout(300);
const r=await p.evaluate(()=>{const S=__d().S;S.noAds=true;const g0=S.gold;let n=0;for(let i=0;i<8;i++){if(giftReady()){openGift();n++}while(!$('story').hidden)nextStory()}
  const inc=playIncome()*900;let bn=0;for(let i=0;i<14;i++){S.ads.boostUntil=0;if(boostLeft()>0){startBoost();bn++}}renderAdBtns();return{n,bn,gold:S.gold-g0,inc,gift:$('giftBtn').innerText,boost:$('boostBtn').innerText}});
ok(r.n===5&&r.bn===10,`선물 ${r.n}번, 부스트 ${r.bn}번 / 선물 1번 ≈ ${Math.round(r.gold/5)}G (15분치 ${Math.round(r.inc)}G) / ${r.gift.replace(/\n/g,' ')} / ${r.boost.replace(/\n/g,' ')}`);
// 시계: 켜 둔 채 기기 시계를 하루 앞으로 → 게임 시간은 그대로, 광고 횟수도 그대로
const c1=await p.evaluate(async()=>{const real=Date.now.bind(Date),g0=gtime(),d0=dayKey();Date.now=()=>real()+86400e3;await new Promise(r=>setTimeout(r,500));const g1=gtime(),d1=dayKey(),left=giftLeft();Date.now=real;return{jump:Math.round((g1-g0)/1000),same:d0===d1,left}});
ok(c1.jump<5&&c1.same&&c1.left===0,`켜 둔 채 시계 +1일: 게임 시간 ${c1.jump}초만 흐름, 같은 날 ${c1.same}, 선물 남은 ${c1.left}`);
// 시계를 뒤로 돌려서 다시 열기 → 자리 비운 보상 없음
const save=await p.evaluate(()=>{const S=__d().S;S.floors=30;refreshBonus();S.rentAcc=0;S.box={};S.lastSeen=Date.now()-3*3600e3;S.maxClock=Date.now()+5*3600e3;return JSON.stringify(S)});
const p2=await ctx.newPage();await p2.addInitScript(s=>{if(!sessionStorage.x){localStorage.setItem('starfall-v1',s);sessionStorage.x=1}},save);await p.close();
await p2.goto(url,{waitUntil:'domcontentloaded'});await p2.waitForTimeout(1800);const w2=await p2.evaluate(()=>({story:$('story').hidden?'':$('storyT').textContent,rent:__d().S.rentAcc,toast:[...document.querySelectorAll('.toast')].map(t=>t.textContent).join('|'),lag:Math.round((__d().S.maxClock-Date.now())/3600e3),rps:rentPerSec()*10}));
ok(!w2.story&&w2.rent<w2.rps&&/시계/.test(w2.toast),`시계를 되돌린 채 열기: 보상 없음(월세 ${Math.round(w2.rent)}), 안내 "${w2.toast.slice(0,30)}"`);
// 정상: 3시간 비우고 열기 → 보상
const save2=await p2.evaluate(()=>{const S=__d().S;S.rentAcc=0;S.box={};S.lastSeen=Date.now()-3*3600e3;S.maxClock=S.lastSeen;return JSON.stringify(S)});
const p3=await ctx.newPage();await p3.addInitScript(s=>{if(!sessionStorage.y){localStorage.setItem('starfall-v1',s);sessionStorage.y=1}},save2);await p2.close();
await p3.goto(url,{waitUntil:'domcontentloaded'});await p3.waitForTimeout(1500);const w3=await p3.evaluate(()=>({story:$('story').hidden?'':$('storyT').textContent,rent:Math.round(__d().S.rentAcc)}));
ok(/자리를 비운/.test(w3.story)&&w3.rent>0,`정상 3시간 비움: "${w3.story}" 월세 ${w3.rent}`);
console.log('errors',errs);await b.close()})();
