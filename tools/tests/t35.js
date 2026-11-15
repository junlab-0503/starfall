// v24 2단계: 빠른 제작(아는 레시피만 · 같은 확률/재료 · 모자라면 꺼짐+부족 표시), 탑 재료 바로가기, 창고 원석·광재/제련품 + 전체 판매 확인 창
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();let h=fs.readFileSync(process.argv[2],'utf8');
fs.writeFileSync('dbg35.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+h+'</body></html>');
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);
for(const L of ['ko','en','zh']){const ctx=await b.newContext({...devices['Pixel 5'],locale:'ko-KR'});await ctx.addInitScript(l=>{if(!localStorage.getItem('starfall.lang'))localStorage.setItem('starfall.lang',l)},L);
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const close=async()=>{for(let i=0;i<30&&await p.isVisible('#storyNext');i++)await p.click('#storyNext')};
await p.goto('file://'+process.cwd()+'/dbg35.html');await p.waitForTimeout(800);if(await p.isVisible('#titleScr'))await p.click('#titleScr');await p.waitForTimeout(200);await close();if(await p.isVisible('#entry')){await p.waitForTimeout(500);await p.click('#entry');await p.waitForTimeout(700)}
await p.evaluate(()=>{S.tutDone=true;S.unlocked=3;S.whHint=1;S.seen=Object.keys(ITEMS);S.found=[];S.inv={};S.wh=10;renderAll()});await close();
if(L==='ko'){
  // 빠른 제작
  await p.evaluate(()=>setTab('forge'));await p.waitForTimeout(200);
  ok(await p.evaluate(()=>!document.querySelector('[data-qc]')&&!!$('qcPanel')&&$('tab-forge').firstElementChild.id==='fgSeg'&&!!$('qcPanel')),'제련 탭: 위에 고르는 칸 · 빠른 제작, 성공한 레시피가 없으면 목록 비어 있음');
  const i0=await p.evaluate(()=>{const i=RECIPES.findIndex(r=>r.a!==r.b&&r.L<=S.unlocked);const r=RECIPES[i];S.inv[r.a]=3;S.inv[r.b]=3;S.slots=[r.a,r.b];renderForge();Math.random=()=>.99;$("smelt").click();return i});
  ok(await p.evaluate(i=>!S.found.includes(i)&&!document.querySelector('[data-qc]')&&cnt('slag')===1,i0),'실패(광재)한 레시피는 빠른 제작에 안 나옴');
  await p.evaluate(()=>{Math.random=()=>.001;$('smelt').click();Math.random=()=>.5;renderAll()});
  ok(await p.evaluate(i=>S.found.includes(i)&&!!document.querySelector(`[data-qc="${i}"]`),i0),'성공한 레시피는 결과물 이름 · 아이콘으로 나옴');
  const q=await p.evaluate(i=>{const r=RECIPES[i];S.slots=[null,null];const a0=cnt(r.a),b0=cnt(r.b),o0=cnt(r.out),c0=S.crafts;document.querySelector(`[data-qc="${i}"]`).click();$('qcGo').click();return{a:a0-cnt(r.a),b:b0-cnt(r.b),o:cnt(r.out)-o0,c:S.crafts-c0,sl:S.slots}},i0);
  ok(q.a===1&&q.b===1&&q.o>=0&&q.c===1&&q.sl[0]===null,`[1회 제련]: 재료 1개씩 쓰고 1회 제련(+${q.o}), 용광로 칸은 그대로`);
  const st=await p.evaluate(i=>{const r=RECIPES[i];let g=0,s=0,f=0;const real=Math.random;let k=0;const seq=[greatRate()/2,(greatRate()+successRate())/2,0.999];Math.random=()=>seq[k++%3];for(let n=0;n<3;n++){S.inv[r.a]=5;S.inv[r.b]=5;const x=quickSmelt(i);x.kind==='great'?g++:x.kind==='ok'?s++:f++}Math.random=real;return{g,s,f,gr:greatRate(),sr:successRate()}},i0);
  ok(st.g===1&&st.s===1&&st.f===1,`용광로와 같은 확률 규칙(대성공 ${Math.round(st.gr*100)}% · 성공 ${Math.round(st.sr*100)}%): 같은 난수에 같은 결과`);
  await p.evaluate(i=>{const r=RECIPES[i];S.inv[r.a]=0;S.inv[r.b]=1;delete S.inv[r.a];renderForge()},i0);
  ok(await p.evaluate(()=>$('qcGo').disabled&&/재료가 모자라요/.test($('qcSel').textContent)),'재료가 모자라면 버튼 꺼짐 + 부족한 재료 표시');
  const b1=await p.evaluate(()=>{$('slotA').click();$('slotB').click();return !!$('smelt')&&!!$('smeltMax')&&!!$('book')});ok(b1,'두 재료 직접 넣기 · 제련 · 가능한 만큼 · 레시피 도감 그대로');
  // 탑 재료 바로가기
  const tw=await p.evaluate(i=>{S.floors=0;const c=floorCost(1);const ref=c.mats.find(([id])=>ITEMS[id].cr);S.inv={};S.found=[RECIPES.findIndex(r=>r.out===ref[0])];setTab('tower');renderTower();return{id:ref[0],n:document.querySelectorAll('[data-gof]').length,raw:document.querySelectorAll('#floorCard .mtag.raw').length,raws:c.mats.filter(([id])=>!ITEMS[id].cr).length}},i0);
  ok(tw.n>0,`탑: 모자란 제련품은 누를 수 있음(${tw.n}개)`);ok(tw.raw===tw.raws,`원석은 [원석] 표시로 구분(${tw.raw}개), 골드는 따로 한 줄`);
  await p.click(`[data-gof="${tw.id}"]`);await p.waitForTimeout(200);
  ok(await p.evaluate(id=>S.tab==='forge'&&RECIPES[QSEL].out===id&&document.querySelector('.qc.in')?.dataset.qc==String(QSEL),tw.id),'아는 레시피 → 제련 탭으로, 빠른 제작에서 골라 둠');
  const un=await p.evaluate(()=>{S.found=[];setTab('tower');renderTower();const c=floorCost(1);return c.mats.find(([id])=>ITEMS[id].cr)[0]});await p.click(`[data-gof="${un}"]`);await p.waitForTimeout(200);
  const ut=await p.evaluate(id=>{const r=RECIPES.find(r=>r.out===id);const t=$('storyX').textContent+$('storyB').textContent;return{tab:S.tab,hint:t.includes(r.hint),leak:t.includes(ITEMS[r.a].n+' +')||t.includes(ITEMS[r.b].n+' →'),found:S.found.length}},un);
  ok(ut.tab==='forge'&&ut.hint&&!ut.leak&&ut.found===0,'모르는 레시피 → 용광로 + 도감 힌트로 안내(조합법은 안 알려 줌)');await close();
  // 창고
  await p.evaluate(()=>{S.inv={stone:10,copper:4,slag:3,bronze:2,brick:5};openSheet('store');renderInv()});await p.waitForTimeout(100);
  const g1=await p.evaluate(()=>({raw:[...document.querySelectorAll('#inv [data-sellq]')].map(b=>b.dataset.sellq).sort(),seg:!!$('invSeg')}));
  ok(g1.raw.join()==='copper,slag,stone','원석 · 광재 보기: 원석과 광재(빠지는 품목 없음)');
  await p.click('#invSeg [data-invf="ref"]');const g2=await p.evaluate(()=>[...document.querySelectorAll('#inv [data-sellq]')].map(b=>b.dataset.sellq).sort());ok(g2.join()==='brick,bronze','제련품 보기: 제련품만');
  const all=await p.evaluate(()=>ORDER.every(id=>(invGroup('raw').includes(id)||invGroup('ref').includes(id))||!cnt(id)));ok(all,'모든 품목이 둘 중 한쪽에 들어감');
  const [ex,exs]=await p.evaluate(()=>{const e=['stone','copper','slag'].reduce((s,id)=>s+bid(id)*cnt(id),0);return[e,big(e)]});
  await p.click('#sellRaw');await p.waitForTimeout(150);
  const cf=await p.evaluate(()=>({open:!$('story').hidden,txt:$('storyX').textContent,go:!!$('sellGo'),btn:$('storyNext').textContent}));
  ok(cf.open&&cf.go&&cf.txt.includes(exs)&&/돌/.test(cf.txt)&&/광재/.test(cf.txt),`전체 판매 전 확인 창: 대상 · 예상 금액 +${ex}G`);
  const before=await p.evaluate(()=>JSON.stringify([S.gold,S.inv]));await p.click('#storyNext');await p.waitForTimeout(100);
  ok(await p.evaluate(b=>JSON.stringify([S.gold,S.inv])===b&&$('story').hidden,before),'[취소] → 아무것도 안 바뀜');
  await p.click('#sellRaw');await p.waitForTimeout(100);const g0=await p.evaluate(()=>S.gold);await p.click('#sellGo');await p.waitForTimeout(100);
  const af=await p.evaluate(()=>({g:S.gold,inv:{...S.inv},hidden:$('story').hidden}));ok(af.g-g0===ex&&!af.inv.stone&&!af.inv.copper&&!af.inv.slag&&af.inv.bronze===2&&af.inv.brick===5&&af.hidden,`[판매하기] → 원석 · 광재만 팔림, 골드 +${af.g-g0}G(예상과 같음)`);
  const ex2=await p.evaluate(()=>bid('bronze')*2+bid('brick')*5);await p.click('#sellRef');await p.click('#sellGo');await p.waitForTimeout(100);
  ok(await p.evaluate(e=>!cnt('bronze')&&!cnt('brick'),ex2),'제련품 전체 판매도 같은 방식');
  ok(await p.evaluate(()=>{S.inv={stone:3};INVF='raw';renderInv();return !!document.querySelector('[data-sellq="stone"]')}),'개별 판매 버튼 그대로');
}else{
  await p.evaluate(()=>{S.inv={stone:3,bronze:1};S.found=[RECIPES.findIndex(r=>r.out==='bronze')];setTab('forge');renderAll()});await p.waitForTimeout(300);
  const t=await p.evaluate(()=>$('qcPanel').textContent+$('qcSel').textContent);ok(!/[가-힣]/.test(t),`[${L}] 빠른 제작 한국어 안 남음: ${t.replace(/\s+/g,' ').slice(0,90)}`);
  await p.evaluate(()=>{openSheet('store');renderInv()});await p.waitForTimeout(200);await p.click('#sellRaw');await p.waitForTimeout(300);
  const t2=await p.evaluate(()=>$('invSeg').textContent+$('sellRaw').textContent+$('sellRef').textContent+$('story').textContent);ok(!/[가-힣]/.test(t2),`[${L}] 창고 · 확인 창 한국어 안 남음: ${t2.replace(/\s+/g,' ').slice(0,120)}`);await close();
  await p.evaluate(()=>{S.floors=0;S.inv={};setTab('tower');renderTower()});await p.waitForTimeout(300);const t3=await p.evaluate(()=>$('floorCard').textContent);ok(!/[가-힣]/.test(t3),`[${L}] 탑 재료 표시 한국어 안 남음`);
}
ok(errs.length===0,`[${L}] 오류 없음 `+errs.join(' | '));await ctx.close()}
await b.close()})();
