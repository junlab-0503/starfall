// v22 출시 전 안정성 검사: 출입권(저장 · 불러오기 섞기) · 레시피 등록 5가지 · 저장 유지와 업데이트 · 플레이 시간(백그라운드 · 잠금) · 황금 광맥 드릴 골드 표시 · 소문 주기
// 사용: node t31.js 새빌드.html [이전빌드.html]
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const wrap=(f,o)=>fs.writeFileSync(o,'<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+fs.readFileSync(f,'utf8')+'</body></html>');
wrap(process.argv[2],'dbg31.html');if(process.argv[3])wrap(process.argv[3],'dbg31old.html');
const url=f=>'file://'+process.cwd()+'/'+f;const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);const errs=[];
const ctx=await b.newContext({...devices['iPhone 13'],locale:'ko-KR'});
const page=async f=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(url(f));await p.waitForTimeout(900);return p};
const quiet=p=>p.evaluate(()=>{$('titleScr').hidden=true;STQ.length=0;$('story').hidden=true});
// 3) 업데이트: 이전 빌드에서 진행 → 새 빌드로 열기
if(process.argv[3]){const o=await page('dbg31old.html');await quiet(o);await o.evaluate(()=>{S.tutDone=true;S.prologue=true;S.legacy=1;S.gold=123456;S.unlocked=5;S.layer=4;S.floors=17;S.pick=14;S.auto=6;S.wh=3;S.inv={stone:50,iron:7,steel:3};S.found=[0,1,2,4];S.journal=[0,1,2,3,4];S.up={crit:3,box:2};S.pass={2:{n:7,c:7000}};S.pm={2:{m:.3,imp:.004}};S.noAds=true;S.lang='x';save()});await o.close();
  const n=await page('dbg31.html');const r=await n.evaluate(()=>({g:S.gold,u:S.unlocked,f:S.floors,p:S.pick,a:S.auto,inv:JSON.stringify(S.inv),found:S.found.join(),up:JSON.stringify(S.up),pass:JSON.stringify(S.pass),m:S.pm[2].m,noAds:S.noAds,v:S.v}));
  ok(r.g>=123456&&r.u===5&&r.f===17&&r.p===14&&r.a===6&&r.inv==='{"stone":50,"iron":7,"steel":3}'&&r.found==='0,1,2,4'&&r.up==='{"crit":3,"box":2}'&&r.pass==='{"2":{"n":7,"c":7000}}'&&r.noAds,'업데이트(v21 저장 → 새 빌드): 골드 · 지층 · 탑 · 장비 · 창고 · 도감 · 강화 · 출입권 · 광고 제거 모두 그대로');
  ok(Math.abs(r.m-.3)<.02,`업데이트 뒤 출입권 값(분위기 0.3)이 0.5로 올라가지 않음: ${r.m.toFixed(3)}`);await n.close()}
// 1) 출입권: 여러 수량으로 사고 → 저장 → 다시 열기 → 팔기, 섞어서 반복
let p=await page('dbg31.html');await quiet(p);await p.evaluate(()=>{S.tutDone=true;S.unlocked=8;S.floors=30;S.up.bulk=10;S.gold=5e9;S.pm={};S.pass={};S.rum=[];S.rumT=1e9;refreshBonus();save()});
let g0=await p.evaluate(()=>S.gold);
for(const [L,qs] of [[2,[1,3,10]],[5,[50,7]],[7,[150]]]){for(const q of qs){await p.evaluate(([L,q])=>{passBuy(L,q);save()},[L,q]);await p.close();p=await page('dbg31.html');await quiet(p);await p.evaluate(()=>{S.rumT=1e9;S.rum=[]})}
  await p.evaluate(L=>{passSell(L,2);save()},L);await p.close();p=await page('dbg31.html');await quiet(p);await p.evaluate(L=>{passSell(L,999);save()},L)}
const g1=await p.evaluate(()=>S.gold);const held=await p.evaluate(()=>Object.keys(S.pass).length);
// 시간이 흐르지 않게: 저장 → 불러오기(load)를 같은 화면에서 바로 반복하며 사고팔기
const g2=await p.evaluate(()=>{Object.values(S.pm).forEach(P=>{P.m=1;P.a=1;P.imp=0});S.gold=5e9;const g0=S.gold;
  for(const q of [1,4,25,80,2,9]){passBuy(3,q);save();load();if(q%2)passSell(3,Math.ceil(q/3)),save(),load()}passSell(3,999);save();load();return S.gold-g0});
ok(held===0,`여러 수량 사고 · 저장 · 다시 열기 · 팔기를 섞어 반복: 남은 출입권 없음, 골드 차이 ${Math.round(g1-g0)}G(값의 작은 흔들림만)`);
ok(Math.abs(g2)<=1,`시간이 안 흐를 때 1·4·25·80·2·9장 사고 일부 팔기를 저장 · 불러오기와 섞어 반복 → 다 팔기: ${Math.round(g2)}G (이익 없음)`);
const re=await p.evaluate(()=>{const P=PM(4);P.m=.4;P.a=.4;P.imp=0;save();return P.m});await p.close();p=await page('dbg31.html');await quiet(p);
const re2=await p.evaluate(()=>PM(4).m);ok(Math.abs(re2-re)<.01,`다시 열어도 값이 앞당겨 움직이지 않음(예전엔 켤 때마다 시장 6분): ${re}→${re2.toFixed(3)}`);
// 2) 레시피 등록
const rc=await p.evaluate(()=>{const R=Math.random,i=RMAP[key('copper','tin')],j=RMAP[key('iron','coal')],k=RMAP[key('coal','coal')],o={};const fresh_=x=>{S.found=S.found.filter(y=>y!==x)};
  S.tutDone=true;S.inv.copper=20;S.inv.tin=20;S.inv.iron=20;S.inv.coal=40;
  fresh_(i);S.slots=['copper','tin'];Math.random=()=>.999;o.fail=[smeltOnce().kind,S.found.includes(i)];
  Math.random=()=>.5;o.ok=[smeltOnce().kind,S.found.includes(i)];
  fresh_(j);S.slots=['iron','coal'];Math.random=()=>0;o.great=[smeltOnce().kind,S.found.includes(j)];
  // 튜토리얼 동안(처음 6번)은 꼭 성공
  fresh_(k);S.tutDone=false;S.crafts=2;S.slots=['coal','coal'];Math.random=()=>.999;o.tut=[smeltOnce().kind,S.found.includes(k)];S.tutDone=true;
  // 빠른 제작(v24.1, 자동 제련소 대신): 모르는 레시피는 못 하고, 실패가 섞여도 도감이 바뀌지 않음
  fresh_(k);const before=S.found.length;o.rqUnknown=quickSmelt(k)===null?0:1;S.found.push(k);S.inv.coal=40;Math.random=()=>.999;const x=quickSmelt(k);o.rq=[x&&x.kind==='bad'?1:0,S.found.length===before+1];Math.random=R;o.rqMade=x&&x.kind;return o});
ok(rc.fail[0]==='bad'&&!rc.fail[1],'제련 실패 → 레시피 안 남음');ok(rc.ok[0]==='ok'&&rc.ok[1],'제련 성공 → 레시피 남음');ok(rc.great[0]==='great'&&rc.great[1],'대성공 → 레시피 남음');
ok(rc.tut[0]!=='bad'&&rc.tut[1],`튜토리얼 보장 성공(${rc.tut[0]}) → 레시피 남음`);ok(rc.rqUnknown===0&&rc.rq[0]===1&&rc.rq[1],`빠른 제작: 모르는 레시피는 못 함, 아는 레시피는 실패해도 도감 그대로 (${rc.rqMade})`);
// 4) 플레이 시간: 켜 둔 동안만. 백그라운드(화면 꺼짐 · 잠금) = 페이지 얼림
const t0=await p.evaluate(()=>S.playT);await p.waitForTimeout(2000);const t1=await p.evaluate(()=>S.playT);
// 백그라운드: 화면 그리기(requestAnimationFrame)가 멈춘 채 3초 → 돌아온 첫 프레임에 0.1초까지만 더함
await p.evaluate(()=>{window.__raf=requestAnimationFrame;window.requestAnimationFrame=()=>0});await p.waitForTimeout(3000);await p.evaluate(()=>{window.requestAnimationFrame=window.__raf;requestAnimationFrame(frame)});await p.waitForTimeout(60);const t2=await p.evaluate(()=>S.playT);
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(1500);const t3=await p.evaluate(()=>S.playT);
await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(1000);const t4=await p.evaluate(()=>S.playT);
ok(t1-t0>1.6&&t1-t0<2.5,`켜 둔 2초 → +${(t1-t0).toFixed(2)}초`);ok(t2-t1<.3,`앱이 백그라운드(화면 그리기 멈춤) 3초 → +${(t2-t1).toFixed(2)}초`);ok(t3-t2<.2,`화면 잠금(숨김) 1.5초 → +${(t3-t2).toFixed(2)}초`);ok(t4-t3>.6,`다시 켜면 다시 셈 → +${(t4-t3).toFixed(2)}초`);
// 8) 황금 광맥: 드릴이 캔 골드도 떠오름
await p.evaluate(()=>{ORDER.forEach(id=>S.seen.includes(id)||S.seen.push(id));S.auto=5;S.autoOn=true;STQ.length=0;$('story').hidden=true;setTab('mine');S.vein={left:20,pot:1e6,got:0}});await p.waitForTimeout(2300);
const fl=await p.evaluate(()=>[...document.querySelectorAll('.ftxt')].map(e=>e.textContent));ok(fl.some(t=>/^드릴 \+.+G$/.test(t)),'황금 광맥 동안 드릴 골드 표시: '+fl.join(' / '));
// 7) 소문: 10분쯤마다, 6~8분 뒤 발표
const rm=await p.evaluate(()=>{S.rum=[];S.rumT=0;const t0=S.clock;let first=null,ann=null,gaps=[],last=null;for(let t=0;t<3*3600;t++){const n=S.rumN;tickMarket(1,false);if(S.rumN!==n){if(last!=null)gaps.push(t-last);last=t;if(first==null)first=S.rum[S.rum.length-1].dur}}return{first:Math.round(first),gap:Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length),n:gaps.length+1}});
ok(rm.first>=360&&rm.first<=480&&rm.gap>=500&&rm.gap<=700,`소문 ${rm.n}개/3시간, 평균 ${Math.round(rm.gap/60)}분마다, 발표까지 ${Math.round(rm.first/60)}분`);
// 자리 비움 보상은 3분부터
ok(await p.evaluate(()=>catchUp(170)===null&&catchUp(200)!==null),'자리 비움 보상: 2분 50초는 없음, 3분 20초부터 있음');
// 6) 번역 사전이 지금 게임 문장과 맞는지(원문을 고치고 lang 파일을 안 고치면 그 문장만 한국어로 남음)
const tr=await p.evaluate(()=>{const all=[].concat(ORDER.map(id=>ITEMS[id].n),LAYERS.map(l=>l.n),SECTIONS.map(s=>s.n),SECTIONS.map(s=>s.t.role),SECTIONS.map(s=>s.t.d),SECTIONS.map(s=>s.t.bonus),SECTIONS.map(s=>s.t.line),...SECTIONS.map(s=>s.t.says),JOURNAL,Object.values(LAYER_EVENT),PROLOGUE.map(c=>c.t),PROLOGUE.map(c=>c.b),ENDING.map(c=>c.t),ENDING.map(c=>c.b),TUT.filter(x=>typeof x.t==='string').map(x=>x.t),...SHOPS.map(x=>x.lines),...SHOPS.map(x=>THANKS[x.who]),Object.values(UPS).map(u=>u.n),Object.values(SHAPE_TXT),RECIPES.map(r=>r.hint),PICK_TIERS.map(t=>t[1]));
  return['en','zh'].map(l=>all.filter(x=>!(x in LANGS[l].d)&&!(LANGS[l].nm&&x in LANGS[l].nm)).slice(0,3))});
ok(!tr[0].length&&!tr[1].length,'번역 사전이 지금 게임 문장과 모두 맞음'+(tr[0].length||tr[1].length?' → 빠짐: '+JSON.stringify(tr):''));
await p.close();console.log('errors',errs);await b.close()})();
