// v30 확인: 밸런스(드릴 곡선 · 넘침 판매 100% · 힘껏 내려치기 값 · B4 바위) · 드릴 속도 표시 · 로봇 보관함 이름표 · 입주 설명 중복 제거
//          QA: 창고 가득 + 황금 광맥 탭 · 언어 바꿀 때 열린 이야기 · review/rumN 저장 · 저장 실패 알림 · 알림 점 넓이 · 앱 광고/결제/복원/리뷰 연결 자리
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();fs.writeFileSync('dbg44.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+fs.readFileSync(process.argv[2],'utf8')+'</body></html>');
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);
const c=await b.newContext({...devices['Pixel 5'],locale:'ko-KR'});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/dbg44.html');await p.waitForTimeout(900);
const W=ms=>p.waitForTimeout(ms);
await p.evaluate(()=>{$('titleScr').hidden=true;$('entry').hidden=true;STQ.length=0;$('story').hidden=true;S.tutDone=true;S.prologue=true;S.unlocked=5;S.layer=1;S.floors=20;S.seen=ORDER.slice();S.pick=20;S.auto=30;S.autoOn=true;
  S.ntq=[];S.ntDone=['셈','핀','루카','미르','린'];S.gold=1e9;refreshBonus();renderAll();setTab('mine')});
const close=()=>p.evaluate(()=>{STQ.length=0;while(!$('story').hidden)nextStory()});

// 1) 밸런스 값
const pickPower1=await p.evaluate(()=>pickPower(1));
const bal=await p.evaluate(()=>({d1:drillPow(1,1),d2:drillPow(2,1),d20:drillPow(20,1),d21:drillPow(21,1),dp:drillPow(20,30)-drillPow(20,1),g:BAL.drill[1],c:BAL.auto[1],of0:ofMul(0),of5:ofMul(5),of10:ofMul(10),of20:ofMul(20),c5:upCostOf('crit',5),hp4:BAL.hp[3]}));
ok(Math.abs(bal.d1-pickPower1*1.05)<1e-6&&Math.abs(bal.d21/bal.d20-1.3)<.01&&bal.dp<200,`(v32) 드릴 파워: 1단계 ${bal.d1.toFixed(2)}(예전 그대로) · 20단계 ${Math.round(bal.d20)} → 21단계 ${Math.round(bal.d21)}(드릴 몫 +30%) · 곡괭이 1 → 30으로 바꿔도 +${Math.round(bal.dp)}뿐(곡괭이와 거의 따로) · 값 ×${bal.c}/단계`);
ok(bal.of0===.5&&Math.abs(bal.of5-.75)<1e-9&&bal.of10===1&&bal.of20===1,`넘친 광석 판매: 50% → 75% → 최대 100%(직접 파는 값과 같음, 예전 175%)`);
ok(bal.c5===Math.round(494*Math.pow(1.7,5))&&bal.hp4===200,`힘껏 내려치기 5단계 ${bal.c5}G(예전 ${Math.round(494*Math.pow(2.1,5))}G) · B4 바위 강도 200(예전 351)`);
const ofs=await p.evaluate(()=>{S.up.refiner=10;const g0=S.gold;const g=sellOverflow('copper',100);return{g,bid:bid('copper')*100}});
ok(Math.abs(ofs.g-ofs.bid)<1e-6,`자동 판매 장치 10단계: 넘친 구리 광석 100개 ${Math.round(ofs.g)}G = 직접 팔 때 ${Math.round(ofs.bid)}G`);

// 2) 드릴 속도 표시
const ds=await p.evaluate(async()=>{S.inv={};renderMineHud();const on=$('autoSub').textContent;const r=autoRate();
  S.inv={stone:cap()};S.box={};renderMineHud();const full1=$('autoSub').textContent;S.box={stone:boxCap()};renderMineHud();const full2=$('autoSub').textContent;S.inv={};S.box={};renderMineHud();
  S.shop=2;setTab('equip');await new Promise(r=>setTimeout(r,150));const d=[...document.querySelectorAll('[data-up="auto"]')].map(e=>e.closest('.urow,.irow,li,div').innerText).join(' ');setTab('mine');return{on,r,full1,full2,d}});
ok(/^초당 약 [\d.,]+개 채굴 중$/.test(ds.on)&&ds.r>0,`드릴 스위치: "${ds.on}" (계산 ${ds.r.toFixed(1)}개/초)`);
ok(/창고 가득/.test(ds.full1)&&/보관함도 가득/.test(ds.full2),`창고만 가득: "${ds.full1}" · 보관함도 가득: "${ds.full2}"`);
ok(/드릴 파워 [\d.,]+[만억조경]? → [\d.,]+[만억조경]? \(\+\d+%\)/.test(ds.d),'(v32) 장비 탭 드릴 설명: '+(ds.d.match(/드릴 파워[^\n]*?%\)/)||[''])[0]);

// 3) 로봇 보관함 이름표: 상자 아래(가리지 않음)
await p.evaluate(()=>{S.box={stone:5};renderMineHud()});await W(100);
const bx=await p.evaluate(()=>{const i=$('boxBtn').querySelector('img').getBoundingClientRect(),t=$('boxTag').getBoundingClientRect(),sc=$('sceneWrap').getBoundingClientRect();return{ib:i.bottom,tt:t.top,tb:t.bottom,sb:sc.bottom}});
ok(bx.tt>=bx.ib-1&&bx.tb<=bx.sb,`로봇 보관함 이름표가 상자 아래: 상자 아래끝 ${Math.round(bx.ib)} ≤ 이름표 위 ${Math.round(bx.tt)}, 화면 안(${Math.round(bx.tb)} ≤ ${Math.round(bx.sb)})`);

// 4) 입주: '새로 열렸어요' 카드 없이 입주 카드 한 장 → 그 사람 말풍선(자기소개 반복 없음)
const ten=await p.evaluate(()=>{S.floors=5;S.ntDone=[];S.ntq=[];STQ.length=0;$('story').hidden=true;const c=floorCost(6);S.gold+=c.gold*10;c.mats.forEach(([id,q])=>S.inv[id]=q);
  buildFloor(true);const cards=[STC,...STQ].filter(Boolean).map(x=>x.k);const first=NPC_TUT['셈'][0].t;return{cards,q:S.ntq.slice(),first,all:Object.values(NPC_TUT).map(a=>a[0].t)}});
ok(ten.cards.length===1&&!ten.cards.some(k=>/새로 열렸어요/.test(k))&&ten.q.includes('셈'),`셈 입주: 카드 ${ten.cards.length}장(${ten.cards.join(', ')}) → 말풍선 안내 대기`);
ok(!ten.all.some(t=>/창고지기 셈이야|꼬마 기계공 핀이에요|떠돌이 상인 루카예요|연금술사 미르예요/.test(typeof t==='string'?t:'')),'주민 안내 첫 말에 자기소개 반복 없음: '+ten.first);
await close();await p.evaluate(()=>{S.ntq=[];S.ntDone=['셈','핀','루카','미르','린'];tutHide&&tutHide()});

// 5) QA P1: 창고가 가득 차도 황금 광맥 동안엔 탭이 골드를 캔다(드릴도)
const vg=await p.evaluate(()=>{S.auto=0;S.inv={stone:cap()};S.vein={left:30,len:30,pot:10000,got:0};const g0=S.gold;window.tapAllowed=()=>true;doTap();const g1=S.gold;S.vein=null;doTap();const g2=S.gold;return{full:full(),tapVein:g1-g0,tapNoVein:g2-g1}});
ok(vg.full&&vg.tapVein>0&&vg.tapNoVein===0,`창고 가득: 광맥 중 탭 +${vg.tapVein}G, 광맥 없을 땐 막힘(+${vg.tapNoVein}G)`);
const vd=await p.evaluate(async()=>{S.auto=5;S.autoOn=true;S.inv={stone:cap()};S.vein={left:30,len:30,pot:10000,got:0};const g0=S.gold;await new Promise(r=>setTimeout(r,800));const g=S.gold-g0;S.vein=null;S.inv={};return g});
ok(vd>0,`창고 가득: 광맥 중 드릴도 골드 +${vd}G`);

// 6) QA P2: 이야기 창이 열린 채 언어를 바꾸면 본문도 바뀜(보상 · 콜백은 다시 안 함)
const lg=await p.evaluate(async()=>{let done=0;STQ.length=0;$('story').hidden=true;story([{k:'일지',t:'할아버지의 일지',b:JOURNAL[0],done:()=>done++}]);const w=()=>new Promise(r=>setTimeout(r,80));
  const pick=L=>{document.querySelector(`#langSeg [data-lang="${L}"]`).click()};
  pick('en');await w();const en=$('storyB').innerText;pick('zh');await w();const zh=$('storyB').innerText,zt=$('storyT').innerText;pick('ko');await w();const ko=$('storyB').innerText;nextStory();return{en,zh,zt,ko,done}});
ok(!/[가-힣]/.test(lg.en)&&/[一-鿿]/.test(lg.zh)&&!/[A-Za-z]{4}/.test(lg.zh)&&/[가-힣]/.test(lg.ko)&&lg.done===1,`언어 바꾸면 열린 일지 본문도: en "${lg.en.slice(0,20)}…" → zh "${lg.zh.slice(0,10)}…" → ko "${lg.ko.slice(0,10)}…" (done ${lg.done}번)`);

// 7) QA P2: review · 소문 번호가 저장 정리 뒤에도 남음
const cs=await p.evaluate(()=>{const a=cleanSave({...fresh(),review:'done',rumN:41,rum:[],rumDone:[{id:57,L:1,src:'루카',txt:'',truth:true}]});const bad=cleanSave({...fresh(),review:'what'});return{rv:a.review,n:a.rumN,bad:bad.review}});
ok(cs.rv==='done'&&cs.n===57&&cs.bad===null,`저장 정리: review "${cs.rv}" 남음 · 소문 번호 ${cs.n}(지난 발표 번호보다 작아지지 않음) · 이상한 값은 비움`);

// 8) 저장 실패: 멈추지 않고 1분에 한 번만 알림, 다시 되면 알림
const sf=await p.evaluate(async()=>{const ls=Storage.prototype.setItem,msgs=[];const ot=window.toast;window.toast=m=>msgs.push(m);
  Storage.prototype.setItem=function(){throw new Error('QuotaExceededError')};save();save();save();Storage.prototype.setItem=ls;save();window.toast=ot;return msgs});
ok(sf.length===2&&/저장하지 못했어요/.test(sf[0])&&/다시 정상적으로 저장되고/.test(sf[1]),'저장 실패 알림 1번 + 다시 저장되면 알림: '+sf.join(' / '));

// 9) 알림 점이 단추 넓이를 늘리지 않음(QA P3) · 설명 속성 번역
const nd=await p.evaluate(async()=>{S.shop=0;S.gold=1e12;setTab('equip');await new Promise(r=>setTimeout(r,150));const bs=[...document.querySelectorAll('main .px-btn.ndot')].filter(e=>e.offsetParent);return{n:bs.length,over:bs.filter(e=>e.scrollWidth>e.clientWidth+1).length}});
ok(nd.n>0&&nd.over===0,`알림 점 단추 ${nd.n}개 중 넓이 넘침 ${nd.over}개`);
const ar=await p.evaluate(async()=>{const o=[];for(const L of['en','zh']){applyLang(L);setTab('mine');await new Promise(r=>setTimeout(r,80));o.push($('boxBtn').getAttribute('aria-label'),$('whBtn').getAttribute('aria-label'))}applyLang('ko');return o});
ok(ar.every(v=>!/[가-힣]/.test(v)),'설명 속성 번역: '+ar.join(' / '));

// 10) 앱 연결 자리(window.starfallNative): 광고는 끝까지 봤을 때만 한 번 · 결제 · 복원 · 리뷰
const nv=await p.evaluate(async()=>{const w=()=>new Promise(r=>setTimeout(r,30));S.noAds=false;S.ads.day=dayKey();S.ads.gift=0;let calls=0,res=[true,false];
  window.starfallNative={showRewarded:()=>{calls++;return new Promise(r=>setTimeout(()=>r(res.shift()),20))},purchase:()=>Promise.resolve(true),restore:()=>Promise.resolve(true),requestReview:()=>{window._rev=1;return Promise.resolve()}};
  const g0=S.ads.gift;openGift();openGift();await w();await w();STQ.length=0;while(!$('story').hidden)nextStory();const afterOk=S.ads.gift;openGift();await w();await w();const afterNo=S.ads.gift;
  renderPkg();const rv=!$('restorePkg').hidden;$('buyPkg').click();await w();const bought=S.noAds;
  S.noAds=false;$('restorePkg').click();await w();const restored=S.noAds;
  askReview(true);await w();document.querySelector('#revGo').click();await w();const rev=window._rev===1;
  delete window.starfallNative;renderPkg();const rvHtml=$('restorePkg').hidden;return{calls,g0,afterOk,afterNo,rv,bought,restored,rev,rvHtml,modal:$('adModal').hidden}});
ok(nv.calls===2&&nv.afterOk===nv.g0+1&&nv.afterNo===nv.afterOk&&nv.modal,`광고: 두 번 연달아 눌러도 한 번만 요청 · 끝까지 봄 → 선물 +1 · 중간에 닫음 → 보상 없음 (요청 ${nv.calls}번)`);
ok(nv.bought&&nv.restored&&nv.rev&&nv.rv&&nv.rvHtml,'앱 결제 → 광고 제거 · 구매 복원 단추(앱에서만) · 리뷰 버튼 → 스토어 리뷰 요청');

// 11) 숯 선물 안내 문구: 없어진 '관리' 탭 대신 설정 위치
const gh=await p.evaluate(()=>{S.noAds=false;S.ads.gift=0;delete window.starfallNative;openGift();$('adDone').disabled=false;$('adDone').click();const t=$('storyX').innerText;STQ.length=0;while(!$('story').hidden)nextStory();return t});
ok(/톱니바퀴/.test(gh)&&!/관리/.test(gh),'숯 선물 안내: '+(gh.match(/광고 제거[^\n]*/)||[''])[0]);

// 12) (v31) 세공 작업대: 큰 화면에선 세공기 아래 빈 곳만큼 린 무대가 커짐(최대 230px) · 스크롤은 생기지 않음 · 작은 화면은 그대로
for(const [w,h] of [[412,915],[393,852],[360,640]]){const c2=await b.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true,locale:'ko-KR'});const q=await c2.newPage();await q.goto('file://'+process.cwd()+'/dbg44.html');await q.waitForTimeout(800);
  const r=await q.evaluate(async()=>{$('titleScr').hidden=true;$('entry').hidden=true;STQ.length=0;$('story').hidden=true;S.tutDone=true;S.prologue=true;S.unlocked=9;S.ntq=[];S.ntDone=['셈','핀','루카','미르','린'];CR().met=1;S.gold=1e9;renderAll();setTab('mine');
    const o={};for(const st of ['pick','work']){CR().a=st==='work'?{k:'gold',n:5,base:5000,lv:3,t:0}:null;openSheet('craft');await new Promise(r=>setTimeout(r,250));const sb=$('sheetBody');o[st]={stage:$('crStage').offsetHeight,lin:$('crNpc').offsetHeight,scroll:sb.scrollHeight>sb.clientHeight+1};closeSheet()}CR().a=null;return o});
  const big=w>=393;ok(big?(r.work.stage>138&&r.work.stage<=230&&!r.work.scroll&&!r.pick.scroll&&r.work.lin===r.work.stage+6):r.work.stage===138,`세공 작업대 ${w}×${h}: 린 무대 ${r.pick.stage}/${r.work.stage}px(린 ${r.work.lin}px) · 새 스크롤 ${r.work.scroll||r.pick.scroll?'있음':'없음'}`);await c2.close()}
// 13) (v32) 사용자 상황: 곡괭이는 1단계인데 드릴에 1조 · 9,999조를 쓴 경우 가장 깊은 B13에서도 확실히 캐짐(예전엔 0.02개/초)
const us=await p.evaluate(()=>{const keep={p:S.pick,a:S.auto,L:S.layer,u:S.unlocked,f:S.floors};S.pick=1;S.unlocked=13;S.layer=12;S.floors=99;refreshBonus();const lv=g=>{let n=0,t=0;while(t+autoCost(n)<=g){t+=autoCost(n);n++}return n};
  const o={};for(const g of [1e12,9.999e15]){S.auto=lv(g);o[g]={lv:S.auto,r:autoRate()};renderMineHud();o[g].sub=$('autoSub').textContent}Object.assign(S,{pick:keep.p,auto:keep.a,layer:keep.L,unlocked:keep.u,floors:keep.f});refreshBonus();renderMineHud();return o});
ok(us[1e12].r>=5&&us[9.999e15].r>=100&&/초당/.test(us[1e12].sub),`곡괭이 1단계 · B13: 드릴에 1조 → Lv${us[1e12].lv} 초당 ${us[1e12].r.toFixed(1)}개 · 9,999조 → Lv${us[9.999e15].lv} 초당 ${Math.round(us[9.999e15].r)}개 ("${us[1e12].sub}")`);
const sl=await p.evaluate(()=>{const keep={a:S.auto,L:S.layer};S.auto=1;S.layer=12;renderMineHud();const t=$('autoSub').textContent;S.auto=keep.a;S.layer=keep.L;renderMineHud();return t});
ok(/^약 \d+초에 1개 채굴 중$/.test(sl),'느린 드릴은 "초당 0개" 대신: '+sl);

// 14) (v32) 세공: 옥 종류를 누르면 이름 · 몇 강 · 단계 이름 · 설명 팝업, 린 무대 크기는 종류를 바꿔도 그대로
const cj=await p.evaluate(async()=>{const w=()=>new Promise(r=>setTimeout(r,200));S.unlocked=Math.max(S.unlocked,4);CR().met=1;CR().a=null;S.inv.silverbar=30;S.inv.goldbar=30;craftRec('gold').best=5;openSheet('craft');await w();
  const h0=$('crStage').offsetHeight;document.querySelector('[data-crk="gold"]').click();await w();const pop={t:$('storyT').innerText,k:$('storyKick').innerText,x:$('storyX').innerText,sil:document.querySelectorAll('#storyX .crp-strip img.sil').length,lv:($('storyX').querySelector('.crp-lv')||{}).textContent};
  STQ.length=0;while(!$('story').hidden)nextStory();const h1=$('crStage').offsetHeight;document.querySelector('[data-crk="silver"]').click();await w();STQ.length=0;while(!$('story').hidden)nextStory();const h2=$('crStage').offsetHeight;
  CR().a={k:'gold',n:5,base:5000,lv:3,t:0};renderCraft();await w();const h3=$('crStage').offsetHeight;document.querySelector('#crBody .cr-slot').click();await w();const pop2={t:$('storyT').innerText,lv:($('storyX').querySelector('.crp-lv')||{}).textContent,nm:($('storyX').querySelector('.crp-nm')||{}).textContent,b:$('storyB').innerText};
  STQ.length=0;while(!$('story').hidden)nextStory();CR().a=null;closeSheet();return{pop,pop2,hs:[h0,h1,h2,h3],sel:CR().sel}});
ok(cj.pop.t==='금옥'&&cj.pop.lv==='+5'&&/최고 단계/.test(cj.pop.x)&&cj.pop.sil===3,`금옥 누르면: "${cj.pop.k} · ${cj.pop.t} ${cj.pop.lv}" · 아직 못 간 단계 그림자 ${cj.pop.sil}개`);
ok(cj.pop2.lv==='+3'&&cj.pop2.nm==='용이 깃든 금옥'&&/용/.test(cj.pop2.b),`세공기 속 세공품 누르면: ${cj.pop2.t} ${cj.pop2.lv} · ${cj.pop2.nm} · "${cj.pop2.b}"`);
ok(new Set(cj.hs).size===1,'린 무대 크기 고정(은옥 ↔ 금옥 · 만들기 ↔ 강화): '+cj.hs.join(' / ')+'px');
console.log('errors',errs);await b.close()})();
