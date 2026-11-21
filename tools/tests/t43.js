// v29 확인: 새 제련품 첫 발견 팝업(처음 1번만) · B4 전 세공 단추 흑백 잠김 + 안내 팝업 · 시트가 탭을 바꾸지 않음 · 탭별 스크롤 기억
//          · 창고 가득 참 경고(잦으면 한 번만) · 상단 상태창 글자 크기 · 상태창 누르면 전체 값 · 개발자 코드는 골드만 9,999조
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();fs.writeFileSync('dbg43.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+fs.readFileSync(process.argv[2],'utf8')+'</body></html>');
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);
const c=await b.newContext({...devices['Pixel 5'],locale:'ko-KR'});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/dbg43.html');await p.waitForTimeout(900);
await p.evaluate(()=>{$('titleScr').hidden=true;$('entry').hidden=true;STQ.length=0;$('story').hidden=true;S.tutDone=true;S.prologue=true;S.unlocked=3;S.floors=5;S.journal=[0,1,2];S.seen=RAW.slice(0,6);
  S.ntq=[];S.ntDone=['셈','핀','루카','미르','린'];S.gold=1e7;refreshBonus();renderAll();setTab('mine')});
const close=()=>p.evaluate(()=>{STQ.length=0;while(!$('story').hidden)nextStory()});

// 1) B4 전: 세공 단추는 흑백으로 보이고, 누르면 안내 팝업(작업대는 안 열림)
const lk=await p.evaluate(()=>{renderMineHud();const cb=$('crBtn'),img=$('crBtnImg');return{vis:!cb.hidden&&cb.getBoundingClientRect().width>0,locked:cb.classList.contains('locked'),gray:getComputedStyle(img).filter}});
ok(lk.vis&&lk.locked&&/grayscale/.test(lk.gray),`B4 전 세공 단추: 보임 ${lk.vis} · 잠김 ${lk.locked} · ${lk.gray}`);
await p.click('#crBtn');await p.waitForTimeout(300);
const lp=await p.evaluate(()=>({story:!$('story').hidden,txt:$('story').innerText,sheet:!$('sheet').hidden&&S.sub==='craft'}));
ok(lp.story&&/지층 4층에서 누군가가 돌아올지도 몰라요!/.test(lp.txt)&&!lp.sheet,'누르면 안내 팝업: '+lp.txt.replace(/\s+/g,' ').slice(0,60));
await close();
// B4를 열면 컬러 단추 → 작업대가 열림
const un=await p.evaluate(()=>{S.unlocked=4;CR().met=1;renderMineHud();return{locked:$('crBtn').classList.contains('locked'),gray:getComputedStyle($('crBtnImg')).filter}});
ok(!un.locked&&!/grayscale/.test(un.gray),'B4 뒤: 잠김 풀림 · 흑백 아님 ('+un.gray+')');
await p.click('#crBtn');await p.waitForTimeout(300);ok(await p.evaluate(()=>!$('sheet').hidden&&S.sub==='craft'),'B4 뒤: 누르면 세공 작업대가 열림');
await p.evaluate(()=>closeSheet());await close();

// 1-2) 세공 작업대는 Pixel 5에서 v28처럼 한 화면 · [강화]/[판매]/[닫기]는 보이는 크기 그대로, 누르는 자리만 48px
const cf=await p.evaluate(async()=>{CR().a={k:'gold',n:5,base:5000,lv:3,t:0};S.gold=1e9;openSheet('craft');await new Promise(r=>setTimeout(r,300));const sb=$('sheetBody'),o={fit:`${sb.scrollHeight}/${sb.clientHeight}`,one:sb.scrollHeight<=sb.clientHeight};
  for(const id of['crTry','crSell','sheetX']){const r=$(id).getBoundingClientRect(),x=r.left+r.width/2;const up=document.elementFromPoint(x,r.top-4),dn=document.elementFromPoint(x,r.bottom+4);o[id]={h:Math.round(r.height),up:!!(up&&up.closest('#'+id)),dn:!!(dn&&dn.closest('#'+id))}}
  CR().a=null;closeSheet();return o});
ok(cf.one,'세공 작업대 한 화면(Pixel 5): '+cf.fit);
ok(['crTry','crSell','sheetX'].every(k=>cf[k].up&&cf[k].dn),'보이는 단추 위아래 4px도 눌림: '+['crTry','crSell','sheetX'].map(k=>`${k} ${cf[k].h}px ${cf[k].up&&cf[k].dn?'O':'X'}`).join(' · '));
await close();

// 2) 새 제련품을 처음 만들면 발견 팝업(광물 발견과 같은 틀), 두 번째는 안 뜸
const mk=await p.evaluate(()=>{const i=RECIPES.findIndex(r=>!S.seen.includes(r.out)&&r.a!==r.b);const R=RECIPES[i];S.inv[R.a]=(S.inv[R.a]||0)+10;S.inv[R.b]=(S.inv[R.b]||0)+10;setTab('forge');
  const rnd=Math.random;Math.random=()=>0.5;S.slots=[R.a,R.b];const before=S.seen.includes(R.out);const r1=smeltOnce();const st1=!$('story').hidden,txt=$('story').innerText,cat=$('story').dataset.cat,hasIco=!!$('story').querySelector('.ic.xl,.halo');
  STQ.length=0;while(!$('story').hidden)nextStory();S.slots=[R.a,R.b];const r2=smeltOnce();const st2=!$('story').hidden;Math.random=rnd;return{out:R.out,name:ITEMS[R.out].n,before,r1:r1&&r1.kind,st1,txt,cat,hasIco,r2:r2&&r2.kind,st2,seen:S.seen.includes(R.out)}});
ok(!mk.before&&mk.seen&&mk.st1&&/새 제련품을 만들었다!/.test(mk.txt)&&mk.txt.includes(mk.name)&&/처음 만들었어요/.test(mk.txt),`첫 제작 팝업: ${mk.name} (${mk.r1}) "${mk.txt.replace(/\s+/g,' ').slice(0,70)}"`);
ok(mk.hasIco&&/평소 가격/.test(mk.txt)&&/도감/.test(mk.txt),'팝업 형식: 광물 발견과 같은 그림 · 분류 · 평소 가격 · 도감 칸');
ok(!mk.st2,`두 번째 제작(${mk.r2})에는 팝업 없음`);
await close();
// 옛 저장(이미 본 제련품)은 팝업 없음 · 영어/중국어 문구
const tr=await p.evaluate(async()=>{const R=RECIPES.find(r=>S.seen.includes(r.out));const o=[];for(const L of['en','zh']){applyLang(L);STQ.length=0;discoverMade(R.out,R.a,R.b);await new Promise(r=>setTimeout(r,80));o.push($('story').innerText.replace(/\s+/g,' ').slice(0,90));STQ.length=0;while(!$('story').hidden)nextStory()}applyLang('ko');return o});
ok(/New refined good made!/.test(tr[0])&&/First made from/.test(tr[0]),'영어: '+tr[0]);
ok(/做出新的精煉品了！/.test(tr[1])&&/第一次用/.test(tr[1]),'중국어: '+tr[1]);
await close();

// 3) 시트(창고 · 설정 등)를 열어도 지금 탭 그대로, 닫으면 같은 탭 · 같은 스크롤
const sh=await p.evaluate(async()=>{S.unlocked=13;S.seen=ORDER.slice();S.found=RECIPES.map((r,i)=>i);ORDER.forEach(id=>S.inv[id]=500);S.wh=30;renderAll();S.mkSub='ore';setTab('market');await new Promise(r=>setTimeout(r,200));
  const M=document.querySelector('main');M.scrollTop=600;const y0=M.scrollTop;openSheet('store');await new Promise(r=>setTimeout(r,150));const during={tab:S.tab,open:!$('sheet').hidden,mk:!$('tab-market').hidden};
  closeSheet();await new Promise(r=>setTimeout(r,150));return{y0,during,after:{tab:S.tab,y:M.scrollTop,mk:!$('tab-market').hidden}}});
ok(sh.y0>0&&sh.during.tab==='market'&&sh.during.open&&sh.after.tab==='market'&&sh.after.mk,`장터에서 창고 시트: 탭 ${sh.during.tab} 그대로 → 닫으면 ${sh.after.tab}`);
ok(Math.abs(sh.after.y-sh.y0)<=2,`닫은 뒤 스크롤 그대로: ${sh.y0} → ${sh.after.y}`);
// 뒤로가기(앱의 뒤로 단추 → starfallBack)로 닫아도 같은 탭
const bk=await p.evaluate(async()=>{openSheet('set');await new Promise(r=>setTimeout(r,100));starfallBack();await new Promise(r=>setTimeout(r,200));return{open:!$('sheet').hidden,tab:S.tab}});
ok(!bk.open&&bk.tab==='market',`뒤로가기로 시트 닫힘 → 탭 ${bk.tab}`);

// 4) 탭마다 스크롤 기억(짧아지면 끝까지만), 새 게임은 처음부터
const sc=await p.evaluate(async()=>{const M=document.querySelector('main'),w=()=>new Promise(r=>setTimeout(r,120));setTab('equip');await w();M.scrollTop=400;const f0=M.scrollTop;
  setTab('market');await w();M.scrollTop=300;const m0=M.scrollTop;setTab('tower');await w();const t0=M.scrollTop;setTab('equip');await w();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const f1=M.scrollTop;
  setTab('market');await w();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const m1=M.scrollTop;setTab('mine');await w();const mi=M.scrollTop;return{f0,f1,m0,m1,t0,mi}});
ok(sc.f0>0&&Math.abs(sc.f1-sc.f0)<=2&&sc.m0>0&&Math.abs(sc.m1-sc.m0)<=2,`탭 스크롤 기억: 장비 ${sc.f0}→${sc.f1} · 장터 ${sc.m0}→${sc.m1}`);
ok(sc.t0===0&&sc.mi===0,`처음 가는 탭 · 채굴 탭은 맨 위(탑 ${sc.t0}, 채굴 ${sc.mi})`);


// 5) 창고가 가득 차 광석을 놓치면: 작은 경고(글자 + 창고 단추 흔들림), 짧은 사이 여러 번이어도 한 번만
const fw=await p.evaluate(()=>{setTab('mine');const c=cap();S.inv={};S.inv.stone=c;FLOATS.forEach(f=>f.el.remove());FLOATS.length=0;FULLW=0;$('whBtn').classList.remove('warn');const l0=S.lost||0,g0=S.gold;
  for(let i=0;i<5;i++)gain('stone',3,false);const msgs=FLOATS.filter(f=>/창고가 가득 차/.test(f.el.textContent)).length;return{lost:(S.lost||0)-l0,msgs,warn:$('whBtn').classList.contains('warn'),floats:FLOATS.length,gold:S.gold===g0,inv:S.inv.stone===c}});
ok(fw.lost>=15&&fw.warn&&fw.msgs===1&&fw.inv,`가득 참 경고: 놓친 광석 ${fw.lost} · 경고 글자 ${fw.msgs}번(5번 놓쳐도) · 창고 단추 흔들림 ${fw.warn} · 창고 그대로 ${fw.inv}`);

// 6) 상단 상태창: 큰 수도 같은 글자 크기(13px 아래로 안 줄어듦), 누르면 전체 값
const hd=await p.evaluate(()=>{S.gold=123456789012345;S.floors=99;S.wh=40;renderHeader();const o={};for(const id of['gold','depth','store','towerStat']){const e=$(id);o[id]={t:e.textContent,fs:parseFloat(getComputedStyle(e).fontSize),ov:e.scrollWidth>e.clientWidth+1}}return o});
ok(Object.values(hd).every(v=>v.fs>=13&&!v.ov),'상태창 글자: '+Object.entries(hd).map(([k,v])=>`${k} "${v.t}" ${v.fs}px`).join(' · '));
await p.click('#gold');await p.waitForTimeout(200);const tg=await p.evaluate(()=>[...document.querySelectorAll('.toast,#toast,.toasts *')].map(e=>e.textContent).join('|'));
ok(/123,456,789,012,345/.test(tg),'골드 누르면 전체 값: '+tg.slice(0,60));

// 7) 개발자 코드: 골드만 9,999조, 나머지 그대로
const dv=await p.evaluate(()=>{S.gold=5;S.dev=0;STQ.length=0;while(!$('story').hidden)nextStory();const b={fl:S.floors,found:S.found.length,pick:S.pick,auto:S.auto,wh:S.wh};$('devForm').hidden=false;$('devCode').value='jun';$('devForm').requestSubmit?$('devForm').requestSubmit():$('devForm').querySelector('button').click();
  return{gold:S.gold,un:S.unlocked,seen:S.seen.length,all:ORDER.length,jr:S.journal.length,pop:!$('story').hidden,same:b.fl===S.floors&&b.found===S.found.length&&b.pick===S.pick&&b.auto===S.auto&&b.wh===S.wh,msg:$('devMsg').textContent}});
ok(dv.gold===9.999e15&&dv.un===13&&dv.seen===dv.all&&dv.jr===13&&dv.same&&!dv.pop&&/지층 · 광물 모두 열림/.test(dv.msg),`개발자 코드(v31): 골드 9,999조 · 지층 ${dv.un}/13 · 광물 도감 ${dv.seen}/${dv.all} · 일지 ${dv.jr}/13 · 곡괭이 · 드릴 · 창고 · 레시피 · 탑 그대로 ${dv.same} · 발견 창 없음 ${!dv.pop} · "${dv.msg}"`);
const cp=await p.evaluate(()=>{const o=[];for(let i=0;i<20;i++){CR().a={k:'gold',n:5,base:5000,lv:i%10,t:0};CRAFT_BUSY=false;const r=craftTry();o.push(!!(CR().a&&CR().a.lv===i%10+1))}CR().a={k:'gold',n:5,base:5000,lv:3,t:0};CR().met=1;openSheet('craft');renderCraft();const txt=$('crBody').innerText;closeSheet();S.dev=0;const p0=craftP(4);S.dev=1;CR().a=null;return{all:o.every(x=>x),p0,txt:/100%/.test(txt)&&!/실패하면 부서져요/.test(txt)}});
ok(cp.all&&cp.p0<1&&cp.txt,`개발자 코드 세공: 화면 100% · 경고 없음 · 강화 20번 모두 성공 · 일반 저장은 원래 확률(+4 ${Math.round(cp.p0*100)}%)`);
await p.waitForTimeout(1500);ok(await p.evaluate(()=>S.gold<=9.999e15),'골드가 저절로 다시 채워지지 않음(무한 골드 아님)');

// 8) 새 게임(처음부터 다시 두 번 누르기): 탭 스크롤 기억도 비움 · 채굴 탭에서 시작
const ng=await p.evaluate(()=>{TAB_Y.market=300;TAB_Y.equip=50;$('reset').onclick();$('reset').onclick();return{keys:Object.keys(TAB_Y).length,tab:S.tab,gold:S.gold}});
ok(ng.keys===0&&ng.tab==='mine',`새 게임: 탭 스크롤 기억 ${ng.keys}개 · 탭 ${ng.tab}`);

console.log('errors',errs);await b.close()})();
