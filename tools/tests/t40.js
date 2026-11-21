// v25 세공: 린 등장(B4 · 한 번) · 작업대 · 제작(투입량 검증 · +0 = 재료 판매가) · 강화(결과 먼저 저장 · 연타 · +10) · 판매(확인 · 취소) · 기록 · 저장 호환 · 세 언어
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();let h=fs.readFileSync(process.argv[2],'utf8');
fs.writeFileSync('dbg40t.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+h+'</body></html>');
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);
const ctx=await b.newContext({...devices['Pixel 5'],locale:'ko-KR'});await ctx.addInitScript(()=>{window.__R0=Math.random;try{window.__raw=localStorage.getItem('starfall-v1')}catch(e){}if(!localStorage.getItem('starfall.lang'))localStorage.setItem('starfall.lang','ko')});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const close=async()=>{for(let i=0;i<30&&await p.isVisible('#storyNext');i++)await p.click('#storyNext')};
const start=async()=>{await p.waitForTimeout(800);if(await p.isVisible('#titleScr'))await p.click('#titleScr');await p.waitForTimeout(200);await close();if(await p.isVisible('#entry')){await p.waitForTimeout(500);await p.click('#entry');await p.waitForTimeout(700)}await close()};
const reopen=async(fn)=>{const raw=await p.evaluate(()=>localStorage.getItem(SAVE_KEY));const c=await b.newContext({...devices['Pixel 5']});await c.addInitScript(r=>{if(!sessionStorage.getItem('i')){localStorage.setItem('starfall-v1',r);localStorage.setItem('starfall.lang','ko');sessionStorage.setItem('i','1')}},raw);const q=await c.newPage();
  await q.goto('file://'+process.cwd()+'/dbg40t.html');await q.waitForTimeout(800);if(await q.isVisible('#titleScr'))await q.click('#titleScr');await q.waitForTimeout(300);const r=await q.evaluate(fn);await c.close();return r};
await p.goto('file://'+process.cwd()+'/dbg40t.html');await start();
await p.evaluate(()=>{S.tutDone=true;S.ntDone=['셈','핀','루카','미르','린'];S.whHint=1;S.unlocked=3;S.review='done';renderAll()});
ok(await p.evaluate(()=>!$('crBtn').hidden&&$('crBtn').classList.contains('locked')&&!craftOpen()),'B4 전(v29): 세공 단추는 흑백 잠김으로 보임');
ok(await p.evaluate(()=>document.querySelectorAll('.bnav .nb').length===5&&SECTIONS.length===13&&SECTIONS.every(s=>s.t.name!=='린')),'하단 탭 5개 그대로, 탑 입주자 13명 그대로(린은 따로)');
// B4 개척 → 일지 → 린 4장(한 번)
await p.evaluate(()=>{const L=LAYERS[3];S.gold=L.req.g+1;Object.entries(L.req.items).forEach(([id,n])=>S.inv[id]=n);unlockLayer(3)});await p.waitForTimeout(150);
const seq=[];for(let i=0;i<8&&await p.isVisible('#storyNext');i++){seq.push(await p.evaluate(()=>$('storyT').textContent));await p.click('#storyNext');await p.waitForTimeout(80)}
ok(/B4/.test(seq[0])&&seq.slice(1,5).every(t=>t==='린')&&seq.length===5,`B4: 일지 다음에 린 등장 4장 (${seq.join(' / ')})`);
ok(await p.evaluate(()=>S.craft.met===1&&!$('crBtn').hidden),'등장을 마치면 작업대 열림(저장됨)');
await p.evaluate(()=>save());{const r=await reopen(()=>({lin:!$('story').hidden&&/린/.test($('storyT').textContent),met:S.craft.met,un:S.unlocked}));ok(!r.lin&&r.met===1&&r.un===4,`다시 켜도 린 등장은 다시 안 나옴 ${JSON.stringify(r)}`)}
// 옛 저장: B6까지 열었고 세공 데이터 없음 → 작업대 보임, 처음 누를 때만 린 등장 후 창
const old=await p.evaluate(()=>{const d=JSON.parse(JSON.stringify(S));delete d.craft;d.unlocked=6;const c=cleanSave(d);return{met:c.craft.met,a:c.craft.a,rec:Object.keys(c.craft.rec).join()}});
ok(old.met===0&&old.a===null&&old.rec==='silver,gold,plat,star','옛 저장(세공 없음) → 기본값으로 안전하게 추가');
await p.evaluate(()=>{S.craft={a:null,rec:{},met:0,sel:'silver'};S.unlocked=6;renderAll()});await p.click('#crBtn');await p.waitForTimeout(150);
let n=0;for(;n<8&&await p.isVisible('#storyNext');n++){await p.click('#storyNext');await p.waitForTimeout(80)}
ok(n===4&&await p.evaluate(()=>S.craft.met===1&&!$('sheet').hidden&&S.sub==='craft'),'옛 저장: 작업대를 처음 누르면 린 등장 4장 → 세공 창');
// 투입량 검증
const q=await p.evaluate(()=>{S.inv.silverbar=40;return[craftQty(-5,40),craftQty(2.7,40),craftQty(999,40),craftQty('abc',40),craftQty(10,0)]});
ok(q.join()==='1,2,40,1,0',`투입량: 음수→1, 소수→내림, 초과→가진 수, 글자→1, 재료 없음→0 (${q.join()})`);
await p.evaluate(()=>{CRQ=1;renderCraft()});await p.fill('#crQ','-3');await p.dispatchEvent('#crQ','change');ok(await p.evaluate(()=>CRQ===1),'입력칸 음수 → 1');
await p.click('[data-crq="10"]');await p.click('[data-crq="100"]');ok(await p.evaluate(()=>CRQ===40),'+10 · +100은 가진 수(40)까지만');
await p.click('[data-crq="max"]');await p.fill('#crQ','25');await p.dispatchEvent('#crQ','change');
const g0=await p.evaluate(()=>({g:S.gold,bid:bid('silverbar')}));await p.click('#crMake');await p.waitForTimeout(100);
const m=await p.evaluate(()=>({a:S.craft.a,inv:cnt('silverbar'),made:S.craft.rec.silver.made}));
ok(m.a&&m.a.n===25&&m.a.lv===0&&m.inv===15&&Math.abs(m.a.base-g0.bid*25)<1e-6&&m.made===1,`제작: 은괴 25개 소모, +0 세공품 하나, 기준 가치 = 25 × 개당 판매가(${Math.round(g0.bid*25)}G)`);
ok(await p.evaluate(()=>craftMake('silver',5)===null&&craftMake('gold',1)===null&&cnt('silverbar')===15),'세공품이 있으면 새로 못 만듦(중복 생성 없음)');
ok(await p.evaluate(()=>{const offs=[...document.querySelectorAll('#crSeg button')].filter(x=>x.dataset.off).length,k0=S.craft.a.k;const o=[...document.querySelectorAll('#crSeg button')].find(x=>x.dataset.off);o.click();const kept=S.craft.a&&S.craft.a.k===k0,pop=!$('story').hidden;STQ.length=0;while(!$('story').hidden)nextStory();return offs===3&&kept&&pop}),'(v32) 다른 종류는 흐리게 · 누르면 보기 팝업만, 지금 세공품 유지');
ok(await p.evaluate(()=>Math.abs(craftPrice(S.craft.a)-bid('silverbar')*25)<1),'+0으로 팔면 재료를 그냥 판 것과 같은 금액(더 많지 않음)');
// 판매 보너스가 올라도 기준 가치는 그대로
ok(await p.evaluate(()=>{const b0=craftPrice(S.craft.a);S.up.haggle=10;refreshBonus();const b1=craftPrice(S.craft.a);S.up.haggle=0;refreshBonus();return b0===b1}),'만든 뒤 판매 보너스가 올라도 세공품 값은 그대로');
// 강화: 결과가 먼저 저장 · 연타는 한 번만
await p.evaluate(()=>{window._R=Math.random;Math.random=()=>0.01;S.gold=1e12});   // v28: 강화마다 골드가 듦
await p.evaluate(()=>{$('crTry').click();$('crTry')&&$('crTry').click();craftDoTry()});
const mid=await p.evaluate(()=>({lv:S.craft.a.lv,saved:JSON.parse(localStorage.getItem(SAVE_KEY)).craft.a.lv,busy:CRAFT_BUSY,dis:$('crTry').disabled}));
ok(mid.lv===1&&mid.saved===1&&mid.busy&&mid.dis,`강화 결과는 연출 전에 저장(연출 중 저장값 +${mid.saved}), 연타는 한 번만, 연출 중 단추 꺼짐`);
await p.waitForTimeout(2300);ok(await p.evaluate(()=>!CRAFT_BUSY&&/좋아/.test($('crSay').textContent)),'+1 성공 → 린 대사 "좋아! 제법 모양이 잡히는데?"');
// 연출 중 껐다 켜도 결과 그대로
await p.evaluate(()=>{craftDoTry()});{const r=await reopen(()=>S.craft.a&&S.craft.a.lv);ok(r===2,`연출 중에 앱을 꺼도 결과(+2) 그대로(새로 연 창에서 +${r})`)}await p.waitForTimeout(2700);
// +10까지, 더는 안 됨
await p.evaluate(()=>{Math.random=()=>0.01;for(let i=0;i<20;i++){CRAFT_BUSY=false;craftTry()}});ok(await p.evaluate(()=>S.craft.a.lv===10&&craftTry()===null&&S.craft.rec.silver.ten&&S.craft.rec.silver.best===10),'+10에서 멈춤, 더 강화 못 함, +10 기록');
// 판매: 확인 창 → 취소(변화 없음) → 판매
await p.evaluate(()=>{openSheet('craft');CRAFT_BUSY=false;renderCraft()});await p.waitForTimeout(100);
const CRAFT_M_10=await p.evaluate(()=>CRAFT_M[10]);const pr=await p.evaluate(()=>({p:craftPrice(S.craft.a),g:S.gold,base:S.craft.a.base}));ok(Math.abs(pr.p-Math.floor(pr.base*CRAFT_M_10))<1,'+10 판매가 = 기준 가치 × '+CRAFT_M_10);
await p.click('#crSell');await p.waitForTimeout(100);ok(await p.evaluate(()=>!$('story').hidden&&!!$('crSellGo')),'판매 확인 창');
await p.click('#storyNext');await p.waitForTimeout(80);ok(await p.evaluate(g=>S.gold===g&&!!S.craft.a,pr.g),'취소 → 아무것도 안 바뀜');
await p.click('#crSell');await p.waitForTimeout(80);await p.click('#crSellGo');await p.waitForTimeout(100);
const af=await p.evaluate(()=>({g:S.gold,a:S.craft.a,bs:S.craft.rec.silver.bestSale,say:$('crSay').textContent}));
ok(Math.abs(af.g-pr.g-pr.p)<1&&af.a===null&&af.bs===pr.p&&/좋은 거래/.test(af.say),`판매 → 골드 +${pr.p}, 세공품 사라짐, 최고 판매 기록, 대사`);
await p.evaluate(()=>{$('crSellGo')&&$('crSellGo').click()});ok(await p.evaluate(g=>Math.abs(S.gold-g)<1,af.g),'판매 단추를 또 눌러도 두 번 지급 안 됨');
// 실패: 부서짐 · 재료 반환 없음
await p.evaluate(()=>{S.gold=1e12;S.inv.goldbar=10;S.craft.sel='gold';craftMake('gold',10);Math.random=()=>0.999;CRAFT_BUSY=false;craftTry()});
ok(await p.evaluate(()=>S.craft.a===null&&cnt('goldbar')===0&&S.craft.rec.gold.fail===1),'실패 → 세공품 · 재료 모두 사라짐(반환 없음)');
// 확률 확인(실제 난수)
const st=await p.evaluate(()=>{Math.random=window.__R0;S.gold=1e12;let s=0;const N=20000;for(let i=0;i<N;i++){S.craft.a={k:'silver',n:1,base:1,lv:0,t:0};CRAFT_BUSY=false;if(craftTry().ok)s++}S.craft.a=null;return s/N});
ok(Math.abs(st-.9)<.01,`+1 성공률 실제 ${(st*100).toFixed(1)}% (표기 90%)`);
// 망가진 세공 저장 → 안전하게
ok(await p.evaluate(()=>{const d=JSON.parse(JSON.stringify(S));d.craft={a:{k:'x',n:-3,base:'a',lv:99},rec:{silver:{made:-1,best:50}},met:1};const c=cleanSave(d).craft;return c.a===null&&c.rec.silver.made===0&&c.rec.silver.best===10&&c.met===1}),'이상한 세공 저장값은 버리고 안전한 값으로');
// 도감 세공 기록
await p.evaluate(()=>openSheet('book'));await p.waitForTimeout(100);ok(await p.evaluate(()=>!$('crRecPanel').hidden&&$('crRec').querySelectorAll('.cr-rec').length===4&&/★/.test($('crRec').textContent)),'도감 창: 세공 기록 4종(+10 표시)');
ok(errs.length===0,'오류 없음 '+errs.join(' | '));await ctx.close();
// 영어 · 번체
for(const L of ['en','zh']){const c2=await b.newContext({...devices['Pixel 5']});await c2.addInitScript(l=>localStorage.setItem('starfall.lang',l),L);const q2=await c2.newPage();const e2=[];q2.on('pageerror',e=>e2.push(e.message));
  await q2.goto('file://'+process.cwd()+'/dbg40t.html');await q2.waitForTimeout(800);if(await q2.isVisible('#titleScr'))await q2.click('#titleScr');await q2.waitForTimeout(200);for(let i=0;i<20&&await q2.isVisible('#storyNext');i++)await q2.click('#storyNext');if(await q2.isVisible('#entry')){await q2.waitForTimeout(500);await q2.click('#entry');await q2.waitForTimeout(700)}for(let i=0;i<20&&await q2.isVisible('#storyNext');i++)await q2.click('#storyNext');
  await q2.evaluate(()=>{S.tutDone=true;S.ntDone=['셈','핀','루카','미르','린'];S.unlocked=4;S.craft.met=0;S.inv.silverbar=30;renderAll()});await q2.click('#crBtn');await q2.waitForTimeout(150);
  const intro=await q2.evaluate(()=>$('story').innerText);for(let i=0;i<6&&await q2.isVisible('#storyNext');i++)await q2.click('#storyNext');await q2.waitForTimeout(200);
  const t1=await q2.evaluate(()=>$('sheet').innerText);await q2.click('#crMake');await q2.waitForTimeout(150);const t2=await q2.evaluate(()=>$('sheet').innerText);
  const ko=s=>(s.match(/[가-힣][^\n]{0,20}/g)||[]).slice(0,3).join(' / ');
  ok(!/[가-힣]/.test(intro+t1+t2),`[${L}] 린 등장 · 세공 창 한국어 안 남음 ${ko(intro+t1+t2)}`);ok(e2.length===0,`[${L}] 오류 없음`);await c2.close()}
await b.close()})();
