// v24 3단계: 아래 탭 5개(제련 · 장터 · 채굴(가운데 · 크게) · 탑 · 장비), 관리 탭 기능 → 채굴 화면 단추와 창, 옛 저장(tab=manage) 복구, 튜토리얼 대상, 작은 화면
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();let h=fs.readFileSync(process.argv[2],'utf8');
fs.writeFileSync('dbg36.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+h+'</body></html>');
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);
for(const dev of ['Galaxy S9+','iPhone SE','Pixel 7']){
const ctx=await b.newContext({...devices[dev],locale:'ko-KR'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const close=async()=>{for(let i=0;i<30&&await p.isVisible('#storyNext');i++)await p.click('#storyNext')};
const start=async()=>{await p.waitForTimeout(800);if(await p.isVisible('#titleScr'))await p.click('#titleScr');await p.waitForTimeout(200);await close();if(await p.isVisible('#entry')){await p.waitForTimeout(500);await p.click('#entry');await p.waitForTimeout(700)}await close()};
await p.goto('file://'+process.cwd()+'/dbg36.html');await start();
await p.evaluate(()=>{S.tutDone=true;S.whHint=1;S.unlocked=4;S.floors=8;S.auto=2;S.box={stone:5};S.seen=ORDER.slice();S.journal=[0,1,2,3];   /* v32: 드릴이 곡괭이와 따로 세져서 시험 중 새 광석 발견 · 일지 창이 끼어들지 않게 */refreshBonus();setTab('mine');renderAll()});await close();
if(dev==='Galaxy S9+'){
  const nav=await p.evaluate(()=>[...document.querySelectorAll('.nb')].map(b=>b.dataset.tab).join());ok(nav==='forge,market,mine,tower,equip',`아래 탭 순서: ${nav}`);
  const mm=await p.evaluate(()=>{const m=document.querySelector('.nb-main .ni').getBoundingClientRect(),o=document.querySelector('[data-tab="forge"] .ni').getBoundingClientRect();return{m:m.width,o:o.width,r:getComputedStyle(document.querySelector('.nb-main .ni')).borderRadius}});
  ok(mm.m>mm.o&&/50%|px/.test(mm.r),`채굴 단추가 더 크고 둥긂(${Math.round(mm.m)} > ${Math.round(mm.o)}, ${mm.r})`);
  ok(await p.evaluate(()=>!document.querySelector('[data-tab="manage"]')&&!$('tab-manage')),'관리 탭 없음');
  const open=async(sel,sub)=>{await p.click(sel);await p.waitForTimeout(150);return p.evaluate(s=>!$('sheet').hidden&&S.sub===s&&!$('sub-'+s).hidden,sub)};
  ok(await open('#whBtn','store'),'채굴 화면 아래 [창고] → 창고 창');ok(await p.evaluate(()=>!!$('inv')&&!!$('log')&&$('log').offsetParent!==null),'창고 창 안에 작업 일지');await p.click('#sheetX');
  ok(await open('#nextL','shaft'),'왼쪽 위 [개척] → 갱도 개척 창');ok(await p.evaluate(()=>$('layers').children.length>0),'갱도 개척 세부 정보 그대로');await p.click('#sheetX');
  ok(await open('#bookBtn','book'),'오른쪽 위 책 → 도감 · 일지');ok(await p.evaluate(()=>!!$('journal')&&!!$('dex')&&!!$('records')),'일지 · 광물 도감 · 기록');await p.click('#sheetX');
  ok(await open('#setBtn','set'),'지층 목록 오른쪽 톱니바퀴 → 설정');
  ok(await p.evaluate(()=>['langSeg','volSfx','volBgm','tutAgain','reset','buyPkg','pkgPrice'].every(id=>$(id)&&$(id).offsetParent!==null)),'설정: 언어 · 소리 · 튜토리얼 · 처음부터 · 광고 제거 상품 모두 있음');
  await p.click('[data-tab="tower"]');await p.waitForTimeout(150);ok(await p.evaluate(()=>$('sheet').hidden&&S.tab==='tower'),'창이 열려 있어도 아래 탭으로 이동(창 닫힘)');
  await p.click('[data-tab="mine"]');await p.evaluate(()=>{const c=document.querySelector('[data-chiplock]');c&&c.click()});await p.waitForTimeout(100);ok(await p.evaluate(()=>!$('sheet').hidden&&S.sub==='shaft'),'지층 목록의 [개척하기] → 갱도 개척 창');await p.click('#sheetX');
  // 개척 단추: 다음 지층 · 준비 정도
  const dg=await p.evaluate(()=>{const t1=$('nextL').textContent;const L=LAYERS[S.unlocked];S.gold=L.req.g;Object.entries(L.req.items).forEach(([id,n])=>S.inv[id]=n);renderMineHud();return{t1,t2:$('nextL').textContent,ready:$('nextL').classList.contains('ready')}});
  ok(/B5 개척/.test(dg.t1)&&/%/.test(dg.t1)&&/준비 완료/.test(dg.t2)&&dg.ready,`개척 단추: "${dg.t1}" → "${dg.t2}"`);
  await p.click('#nextL');await p.waitForTimeout(100);const lb=await p.evaluate(()=>{const b=document.querySelector('#layers [data-open],#layers button:not([disabled])');return!!b});ok(lb,'갱도 개척 창에서 개척할 수 있음');await p.click('#sheetX');
  // 로봇 채굴 보관함 vs 창고
  const bx=await p.evaluate(()=>{const a=$('boxBtn').getBoundingClientRect(),w=$('whBtn').getBoundingClientRect();return{tag:$('boxBtn').textContent.trim(),wt:$('whBtn').textContent.trim(),right:a.left>w.left,img:$('boxBtn').querySelector('img').src!==$('whBtn').querySelector('img').src}});
  ok(bx.right&&bx.img&&/로봇/.test(bx.tag)&&/창고/.test(bx.wt),`로봇 채굴 보관함은 오른쪽 아래 · 그림 · 이름이 창고와 다름(${bx.tag} / ${bx.wt})`);
  await p.click('#boxBtn');await p.waitForTimeout(100);ok(await p.evaluate(()=>/로봇 채굴 보관함/.test($('storyKick').textContent)),'로봇 채굴 보관함 창');await close();
  // 개발자 코드: 톱니바퀴 10초
  await p.evaluate(()=>{$('devForm').hidden=true});await p.dispatchEvent('#setBtn','pointerdown');await p.waitForTimeout(10300);ok(await p.evaluate(()=>!$('devForm').hidden&&!$('sheet').hidden&&S.sub==='set'),'톱니바퀴 10초 누르기 → 개발자 코드 칸');await p.evaluate(()=>{dispatchEvent(new Event('pointerup'));closeSheet()});
  // 옛 저장: tab=manage, sub=store → 채굴 화면으로 열림, 튜토리얼 완료 그대로
  await p.evaluate(()=>{S.tab='manage';S.sub='shaft';S.tutDone=true;CLK.hold=true;localStorage.setItem(SAVE_KEY,JSON.stringify(S))});await p.reload();await start();
  ok(await p.evaluate(()=>S.tab==='mine'&&!$('tab-mine').hidden&&$('sheet').hidden&&S.tutDone&&$('tut').hidden),'옛 저장(tab=manage) → 채굴 화면으로 복구, 튜토리얼 다시 안 함');
  // 튜토리얼: 모든 단계의 반짝임 대상이 지금 화면에 있음
  const tt=await p.evaluate(()=>{const bad=[];for(const tab of ['mine','equip','tower','forge'])TUT.forEach((st,i)=>{setTab(tab);const sel=typeof st.sel==='function'?st.sel():st.sel;if(sel&&/manage|#seg|data-sub/.test(sel))bad.push(i+':'+sel);if(sel&&/^\.nb|#whBtn|#nextL|#bookBtn/.test(sel)&&!document.querySelector(sel))bad.push(tab+' '+i+':'+sel)});setTab('mine');return{bad,n:TUT.length,txt:TUT.map(s=>typeof s.t==='function'?'':s.t).join('|')}});
  ok(tt.bad.length===0&&tt.n===12,`튜토리얼 12단계: 없어진 관리 탭을 가리키는 단계 없음, 새 단추 대상은 모두 있음 ${tt.bad.join(',')}`);ok(!/\[관리\]/.test(tt.txt)&&/\[창고\]/.test(tt.txt)&&/\[개척\]/.test(tt.txt)&&/셈이 돌아와 창고/.test(tt.txt),'튜토리얼 문구: 관리 대신 창고 · 개척 · 책, 셈(6층)이 창고를 넓힘');
  await p.evaluate(()=>{S.tutDone=false;S.prologue=true;S.tut=8;setTab('mine');tutTick()});await p.waitForTimeout(300);
  const tg=await p.evaluate(()=>{const g=document.querySelector('.tut-glow'),r=g&&g.getBoundingClientRect(),t=$('tut').getBoundingClientRect();return{id:g&&g.id,cover:r&&!(r.bottom<t.top||r.top>t.bottom),top:$('tut').classList.contains('top')}});
  ok(tg.id==='whBtn'&&!tg.cover,`튜토리얼 9단계: [창고]가 반짝이고 말풍선이 가리지 않음(${JSON.stringify(tg)})`);
  await p.evaluate(()=>{S.tut=9;tutTick()});await p.waitForTimeout(200);ok(await p.evaluate(()=>document.querySelector('.tut-glow')?.id==='nextL'),'튜토리얼 10단계: [개척] 단추가 반짝임');
  await p.evaluate(()=>{S.tutDone=true;tutHide()});
}
// 화면 크기: 가로 넘침 없음, 아래 단추들이 탭 위에 보임, 창이 화면 안에
await p.evaluate(()=>{setTab('mine');renderAll()});await p.waitForTimeout(300);
const ly=await p.evaluate(()=>{const n=document.querySelector('.bnav').getBoundingClientRect(),f=$('mineFoot').getBoundingClientRect(),d=$('nextL').getBoundingClientRect(),bk=$('bookBtn').getBoundingClientRect(),g=$('setBtn').getBoundingClientRect();
  return{over:document.documentElement.scrollWidth>innerWidth+1,foot:f.bottom<=n.top+1&&f.top>0,dig:d.left>=0&&d.right<bk.left,gear:g.right<=innerWidth+1&&g.top>=0,vw:innerWidth,vh:innerHeight}});
ok(!ly.over&&ly.foot&&ly.dig&&ly.gear,`[${dev} ${ly.vw}×${ly.vh}] 가로 넘침 없음 · 아래 단추 줄이 탭 위 · 개척/책/톱니 화면 안`);
for(const s of ['store','shaft','book','set']){await p.evaluate(s=>openSheet(s),s);await p.waitForTimeout(100);const r=await p.evaluate(()=>{const c=document.querySelector('.sheet-card').getBoundingClientRect(),n=document.querySelector('.bnav').getBoundingClientRect(),x=$('sheetX').getBoundingClientRect();return c.top>=0&&c.bottom<=n.top+1&&x.right<=innerWidth&&x.top>=0});if(!r)ok(false,`[${dev}] ${s} 창이 화면 밖`)}
await p.evaluate(()=>closeSheet());ok(errs.length===0,`[${dev}] 오류 없음 `+errs.join(' | '));await ctx.close()}
await b.close()})();
