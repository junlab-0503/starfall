// v24.1: 지층 · 엔딩 삽화와 새 아이콘, 자동 재련소 뺌(산 강화는 골드로 돌려줌), 미르의 새 강화(촉매 연구 · 광재 되살리기), 레시피 도감 → 도감 창, 빠른 제작 개수
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();let h=fs.readFileSync(process.argv[2],'utf8');
fs.writeFileSync('dbg39.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+h+'</body></html>');
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);
for(const L of ['ko','en','zh']){
const ctx=await b.newContext({...devices['Pixel 5'],locale:'ko-KR'});await ctx.addInitScript(l=>{if(!localStorage.getItem('starfall.lang'))localStorage.setItem('starfall.lang',l)},L);
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const close=async()=>{for(let i=0;i<30&&await p.isVisible('#storyNext');i++)await p.click('#storyNext')};
await p.goto('file://'+process.cwd()+'/dbg39.html');await p.waitForTimeout(800);if(await p.isVisible('#titleScr'))await p.click('#titleScr');await p.waitForTimeout(200);await close();if(await p.isVisible('#entry')){await p.waitForTimeout(500);await p.click('#entry');await p.waitForTimeout(700)}await close();
await p.evaluate(()=>{S.tutDone=true;S.whHint=1;S.unlocked=4;S.floors=30;S.seen=Object.keys(ITEMS);refreshBonus();renderAll()});await close();
if(L==='ko'){
  const art=await p.evaluate(()=>({b:[...Array(13)].every((_,i)=>!!ART['story_b'+(i+1)]),e:[...Array(6)].every((_,i)=>!!ART['story_e'+(i+1)]),p:[...Array(6)].some((_,i)=>!!ART['story_p'+(i+1)]),ic:['ui_book','ui_wh','ui_gear'].every(k=>!!ART[k])}));
  ok(art.b&&art.e&&art.ic,`지층 삽화 13장 · 엔딩 6장 · 아이콘(도감 · 창고 · 설정) 들어감 (프롤로그 그림: ${art.p?'있음':'아직 없음 → 글만'})`);
  const isz=await p.evaluate(()=>new Promise(r=>{const out={};let n=0;['ui_book','ui_wh','ui_gear'].forEach(k=>{const im=new Image();im.onload=()=>{out[k]=[im.width,im.height];if(++n===3)r(out)};im.src=ART[k]})}));
  ok(Object.values(isz).every(([w,hh])=>hh<=64&&w<=72),`아이콘은 다른 아이콘처럼 작은 도트(${JSON.stringify(isz)})`);
  // 자동 재련소 없음
  ok(await p.evaluate(()=>!$('rqPanel')&&!$('smeltQ')&&typeof rqRun==='undefined'&&!('rq' in fresh())&&!UPS.qslot&&!UPS.qspeed),'자동 재련소 · 맡기기 · 자동 재련 강화 없음');
  ok(await p.evaluate(()=>SHOPS.find(s=>s.who==='미르').ups.join()==='furn,great,cata,salv'),'미르의 용광로: 풀무 · 별빛 불씨 · 촉매 연구 · 광재 되살리기');
  // 촉매: 성공하면 재료 하나 돌려받음 / 되살리기: 실패해도 재료 둘 다 돌아오고 광재 없음
  const ct=await p.evaluate(()=>{const R=Math.random;S.up.cata=10;S.up.salv=5;S.found=[];const i=RECIPES.findIndex(r=>r.a!==r.b&&r.L<=4);const r=RECIPES[i];
    S.inv={};S.inv[r.a]=5;S.inv[r.b]=5;S.slots=[r.a,r.b];let k=0;const seq=[.001,.01,.5];Math.random=()=>seq[k++]??.5;const x=smeltOnce();const used=10-cnt(r.a)-cnt(r.b);
    S.inv[r.a]=5;S.inv[r.b]=5;S.inv.slag=0;S.slots=[r.a,r.b];k=0;const seq2=[.999,.01];Math.random=()=>seq2[k++]??.5;const y=smeltOnce();const used2=10-cnt(r.a)-cnt(r.b);
    S.up.salv=0;S.inv[r.a]=5;S.inv[r.b]=5;S.slots=[r.a,r.b];Math.random=()=>.999;const z=smeltOnce();Math.random=R;S.up={};return{x:x.kind,saved:x.saved,used,y:y.kind,salv:y.salv,used2,slag:cnt('slag'),z:z.kind}});
  ok(ct.saved===1&&ct.used===1,`촉매 연구: 성공하면 재료 하나 돌려받음(쓴 재료 ${ct.used}개)`);
  ok(ct.salv===1&&ct.used2===0&&ct.z==='bad'&&ct.slag===1,`광재 되살리기: 실패해도 재료를 모두 되살림(쓴 재료 ${ct.used2}개), 강화가 없으면 예전처럼 광재`);
  // 옛 저장: 자동 재련 칸 2단계 · 센 불꽃 3단계 → 그만큼 골드를 돌려줌, 맡겨 둔 목록은 사라짐
  const rf=await p.evaluate(()=>{const d=JSON.parse(JSON.stringify(S));d.up={qslot:2,qspeed:3,great:1};d.rq=[{r:0,n:5,t:0,loop:false}];d.gold=1000;const c=BAL.ups;
    const cost=(k,lv)=>{let g=0;for(let i=0;i<lv;i++)g+=upCostOf(k,i);return g};const exp=cost('qslot',2)+cost('qspeed',3);const s2=cleanSave(d);return{exp,gold:s2.gold,ref:s2.rqRefund,up:JSON.stringify(s2.up),rq:'rq' in s2}});
  ok(rf.gold===1000+rf.exp&&rf.ref===rf.exp&&rf.up==='{"great":1}'&&!rf.rq,`옛 저장의 자동 재련 강화 → +${rf.exp}G 돌려줌, 다른 강화는 그대로`);
  // 재련 탭 순서 · 레시피 도감은 도감 창
  ok(await p.evaluate(()=>{setTab('forge');const f=$('tab-forge');return f.children[0].id==='forgePanel'&&f.children[1].id==='qcPanel'&&!f.contains($('book'))&&$('sub-book').contains($('book'))}),'재련 탭: 용광로 → 빠른 제작, 레시피 도감은 도감 창으로');
  await p.evaluate(()=>{S.found=[RECIPES.findIndex(r=>r.out==='bronze')];openSheet('book')});await p.waitForTimeout(150);
  ok(await p.evaluate(()=>!!document.querySelector('#book [data-fill]')&&$('book').offsetParent!==null),'도감 창에 레시피 도감 보임');
  await p.click('#book [data-fill]');await p.waitForTimeout(150);ok(await p.evaluate(()=>S.tab==='forge'&&$('sheet').hidden&&S.slots.join()==='copper,tin'),'레시피 도감 [넣기] → 재련 탭 용광로에 재료');
  // 빠른 제작 개수
  await p.evaluate(()=>{S.slots=[null,null];S.inv={copper:7,tin:5};renderForge()});await p.waitForTimeout(100);
  const qn=async()=>p.evaluate(()=>({n:+document.querySelector('.qc-n').textContent,btn:$('qcGo').textContent}));
  await p.click('[data-qn="1"]');await p.click('[data-qn="1"]');let s1=await qn();ok(s1.n===3&&/3회 재련/.test(s1.btn),`[+] 두 번 → ${s1.btn}`);
  await p.click('[data-qn="max"]');s1=await qn();ok(s1.n===5,`[최대] → 재료로 만들 수 있는 만큼(${s1.n})`);
  await p.click('[data-qn="10"]');s1=await qn();ok(s1.n===5,'최대보다 늘지 않음');await p.click('[data-qn="-10"]');s1=await qn();ok(s1.n===1,'1보다 줄지 않음');
  await p.click('[data-qn="max"]');const r5=await p.evaluate(()=>{const c0=S.crafts;$('qcGo').click();return{n:S.crafts-c0,cu:cnt('copper'),tin:cnt('tin'),msg:$('qcRes').textContent}});
  ok(r5.n===5&&r5.cu===2&&r5.tin===0&&/5번 재련/.test(r5.msg),`[5회 재련] → 5번 재련, 재료 5개씩 씀 (${r5.msg})`);
}
// 언어: 미르 가게 · 빠른 제작에 한국어 안 남음
await p.evaluate(()=>{S.floors=30;refreshBonus();S.found=[RECIPES.findIndex(r=>r.out==='bronze')];S.inv={copper:3,tin:3};setTab('equip');S.shop=SHOPS.findIndex(s=>s.who==='미르');renderEquip()});await p.waitForTimeout(300);
if(L!=='ko'){const t=await p.evaluate(()=>$('tab-equip').innerText);ok(!/[가-힣]/.test(t),`[${L}] 미르의 용광로 강화 문구 번역됨`+(/[가-힣]/.test(t)?' → '+t.match(/.{0,20}[가-힣]+.{0,20}/)[0]:''));
  await p.evaluate(()=>setTab('forge'));await p.waitForTimeout(300);const t2=await p.evaluate(()=>$('qcPanel').innerText);ok(!/[가-힣]/.test(t2),`[${L}] 빠른 제작 개수 단추 번역: ${t2.replace(/\s+/g,' ').slice(-60)}`);}
ok(errs.length===0,`[${L}] 오류 없음 `+errs.join(' | '));await ctx.close()}
await b.close()})();
