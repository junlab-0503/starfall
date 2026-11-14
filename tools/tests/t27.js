// v17 확인: 프롤로그/에필로그/튜토리얼 문구, 입주 카드, 장비 탭 순서 · 액자, 개발자 코드 숨김(10초 누르기), 채굴 보관함 창, 황금 광맥(30초 · 다른 탭 알림), 돌 조각, 강화 한도, 출입권
const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const fs=require('fs');let h=fs.readFileSync(process.argv[2],'utf8');
h='<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+h.replace('/* ═════════ 시작 ═════════ */','window.__d=()=>({S});')+'</body></html>';fs.writeFileSync('dbg27.html',h);
const ctx=await b.newContext({...devices['iPhone 13'],locale:'ko-KR'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);
const closeStory=async()=>{for(let i=0;i<30&&await p.isVisible('#storyNext');i++)await p.click('#storyNext')};
await p.goto('file://'+process.cwd()+'/dbg27.html');await p.waitForTimeout(800);
// 이야기 · 문구
const T=await p.evaluate(()=>({letter:PROLOGUE[0].b,journal:PROLOGUE.find(c=>c.t==='할아버지의 일지')?.b||'',machine:PROLOGUE.some(c=>c.t==='느리게 도는 기계'),art:PROLOGUE.some(c=>c.art),end:ENDING.some(c=>c.t==='이장 할머니'),last:TUT[TUT.length-1].t,bau:!!TENANT_INTRO['바우'],intro:Object.keys(TENANT_INTRO).join()}));
ok(/철거 예정/.test(T.letter)&&/아직 죽지 않았다/.test(T.journal)&&/숨 쉬고/.test(T.journal)&&/하늘로 가는 길/.test(T.journal)&&T.machine&&!T.art,'프롤로그: 편지 · 일지 문구, 느리게 도는 기계 그대로, 이장 할머니 그림 없음');
ok(!T.end,'에필로그에 이장 할머니 카드 없음');
ok(!/99층|별을 하늘로/.test(T.last)&&/마을/.test(T.last),'튜토리얼 마지막 말: '+T.last.slice(0,40));
ok(!T.bau&&T.intro==='무쇠,셈,핀,루카,미르','입주 뒤 한 장 더 설명하는 사람은 가게 주인만: '+T.intro);
ok(await p.evaluate(()=>{const pk=[...document.querySelectorAll('#sub-set .panel')].find(e=>/광고 제거/.test(e.textContent));return pk&&!/Galmuri/.test(pk.textContent)&&/Galmuri/.test(document.querySelector('.credit').textContent)&&/© 2026 jun/.test(document.querySelector('.t-copy').textContent)&&!/배당/.test(document.getElementById('tab-market').innerHTML)}),'글꼴 · 저작권 표기는 관리 탭 아래와 시작 화면 아래(광고 제거 패키지 칸엔 없음) · 장터에 "배당" 단어 없음');
await p.click('#titleScr');await p.waitForTimeout(200);await closeStory();if(await p.isVisible('#entry')){await p.waitForTimeout(500);await p.click('#entry');await p.waitForTimeout(700)}
await p.evaluate(()=>{__d().S.tutDone=true;renderAll()});await closeStory();
// 장비 탭: 순서 · 액자 크기
await p.click('[data-tab="equip"]');await p.waitForTimeout(400);
const fr=await p.evaluate(()=>({who:SHOPS.map(s=>s.who).join(),plates:[...document.querySelectorAll('.shopc .plate')].map(e=>e.textContent).join(),hs:[...document.querySelectorAll('.shopc .fr')].map(e=>Math.round(e.getBoundingClientRect().height)),ws:[...document.querySelectorAll('.shopc .fr')].map(e=>Math.round(e.getBoundingClientRect().width))}));
ok(fr.who==='무쇠,셈,핀,루카,미르'&&/탑 1층.*탑 6층.*탑 10층.*탑 21층.*탑 28층/.test(fr.plates),'장비 탭 순서 = 탑 층 순서: '+fr.plates);
ok(new Set(fr.hs).size===1&&fr.hs[0]===fr.ws[0],'잠긴 액자 5칸 모두 같은 정사각: '+fr.hs.join());
// 강화 한도 · 출입권 한도
const up=await p.evaluate(()=>({crit:UPS.crit.max,c20:critAt(20),m20:extraAt(20),hag:UPS.haggle.max,night:UPS.night.max,n10:nightAt(10),ref:ofMul(10),q:UPS.qslot.max,pm:passMax(),bulk:UPS.bulk.max,c11:upCostOf('crit',11)/upCostOf('crit',10),c5:upCostOf('crit',5)/upCostOf('crit',4)}));
ok(up.crit===20&&Math.abs(up.c20-.4)<1e-9&&Math.abs(up.m20-.7)<1e-9&&up.hag===20&&up.night===10&&Math.abs(up.n10-1)<1e-9&&Math.abs(up.ref-1.75)<1e-9&&up.q===5,'강화 한도: 힘껏 내려치기 20(40%) · 쇠맥/보석 20(70%) · 흥정 20 · 밤샘 10(+100%) · 자동 재련 장치 10(175%) · 자동 재련 칸 5');
ok(Math.abs(up.c5-2.1)<.01&&Math.abs(up.c11-1.4)<.01,`강화 값: 예전 한도까지 ×${up.c5.toFixed(2)}, 그 뒤 ×${up.c11.toFixed(2)}`);
ok(up.pm===50&&up.bulk===10,'출입권 한도: 지층마다 50장(큰손 거래처 1단계마다 +10장, 10단계)');
ok(await p.evaluate(()=>{const S=__d().S,f=S.floors;S.floors=88;refreshBonus();const a=BON.veinFast;S.floors=f;refreshBonus();return a===.7&&BON.veinFast===1&&/황금 광맥/.test(SECTIONS[11].t.bonus)}),'노을 입주 효과: 황금 광맥 간격 ×0.7');
// 개발자 코드 칸: 다시 보이게(v19, 출시 전에 지울 것)
await p.click('[data-tab="manage"]');await p.click('[data-sub="set"]');await p.waitForTimeout(200);ok(await p.evaluate(()=>!$('devForm').hidden),'개발자 코드 칸 보임');
// 채굴 보관함
await p.evaluate(()=>{const S=__d().S;S.auto=3;S.autoOn=false;S.box={stone:120,copper:44,clay:30};['stone','copper','clay'].forEach(i=>S.seen.includes(i)||S.seen.push(i));setTab('mine')});await p.waitForTimeout(300);await closeStory();
const bx=await p.evaluate(()=>({tag:$('boxBtn').querySelector('.ic-tag').textContent,n:$('boxN').textContent,has:$('boxBtn').classList.contains('has')}));ok(bx.tag==='채굴 보관함'&&bx.has&&bx.n==='194','보관함 버튼: '+JSON.stringify(bx));
await p.click('#boxBtn');await p.waitForTimeout(200);const rows=await p.evaluate(()=>[...document.querySelectorAll('.boxr')].length);
const cu0=await p.evaluate(()=>cnt('copper'));await p.click('[data-boxget="copper"]');const g0=await p.evaluate(()=>__d().S.gold);await p.click('[data-boxsell="clay"]');await p.waitForTimeout(100);
const b2=await p.evaluate(()=>({box:__d().S.box,cu:cnt('copper'),g:__d().S.gold,rows:document.querySelectorAll('.boxr').length,btn:$('storyNext').textContent}));
ok(rows===3&&b2.rows===1&&b2.cu-cu0===44&&!b2.box.copper&&!b2.box.clay&&b2.box.stone===120&&b2.g>g0&&b2.btn==='닫기',`보관함 창: 종류별 저장(구리 44개 → 창고) · 팔기(점토 +${Math.round(b2.g-g0)}G) · 돌은 남음`);
await p.click('[data-boxget="all"]');await p.waitForTimeout(100);ok(await p.evaluate(()=>cnt('stone')>=120&&!Object.keys(__d().S.box).length),'모두 저장');await closeStory();
// 황금 광맥: 30초, 다른 탭에서도 다음 광맥까지 시간이 흐르고 알림 띠가 뜸
await p.click('[data-tab="tower"]');await p.evaluate(()=>{__d().S.veinT=2});await p.waitForTimeout(3200);await closeStory();
const v1=await p.evaluate(()=>({vein:!!__d().S.vein,left:__d().S.vein&&__d().S.vein.left,pop:!$('veinPop').hidden,txt:$('veinPop').innerText.replace(/\n/g,' '),sec:VEIN_SEC,on:veinOn()}));
ok(v1.sec===30&&v1.vein&&v1.pop&&/황금 광맥이 발견됐어요/.test(v1.txt)&&!v1.on,`다른 탭(탑)에서 광맥 등장 + 알림 띠: "${v1.txt}" (남은 ${v1.left}초)`);
const g1=await p.evaluate(()=>__d().S.gold);await p.click('#veinPop');await p.waitForTimeout(300);
const v2=await p.evaluate(()=>({tab:__d().S.tab,pop:!$('veinPop').hidden,on:veinOn(),bn:!$('veinBn').hidden}));
await p.evaluate(()=>{for(let i=0;i<10;i++)doTap()});const v3=await p.evaluate(()=>({g:__d().S.gold,got:__d().S.vein.got}));
ok(v2.tab==='mine'&&!v2.pop&&v2.on&&v3.got>0&&v3.g>g1,`알림 띠를 누르면 채굴 화면으로, 탭하면 골드 +${Math.round(v3.g-g1)}`);
await p.evaluate(()=>{__d().S.vein.left=1});await p.waitForTimeout(1500);ok(await p.evaluate(()=>!__d().S.vein&&$('veinPop').hidden),'30초가 지나면 광맥 끝');await closeStory();
// 돌 조각: 막장 앞쪽으로는 안 쌓이고, 시간이 지나면 사라짐(계속 쌓이지 않음)
await p.evaluate(()=>{const S=__d().S;S.auto=3;S.autoOn=true;S.pick=30;refreshBonus()});
const pr=await p.evaluate(()=>new Promise(r=>{let n=0;const iv=setInterval(()=>{doTap();if(++n>=60){clearInterval(iv);setTimeout(()=>r({n:PARTS.length,front:PARTS.filter(q=>q.grav&&q.x<faceWX()-.01).length,chips:PARTS.filter(q=>q.rk!=null).length,ck:!!(STRATA[S.layer]&&STRATA[S.layer].chunks)}),300)}},60)}));
ok(pr.n<=140&&pr.front===0&&pr.chips>0&&pr.ck,`돌 조각 ${pr.chips}개(전체 입자 ${pr.n}), 막장 앞쪽 ${pr.front}개, 바위 그림 조각 사용 ${pr.ck}`);
await p.evaluate(()=>{__d().S.autoOn=false});await p.waitForTimeout(9000);const left=await p.evaluate(()=>PARTS.length);ok(left===0,'9초 뒤 남은 입자 '+left+'개(계속 쌓이지 않음)');
console.log('errors',errs);await b.close()})();
