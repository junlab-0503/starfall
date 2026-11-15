// v26 확인: 장터 광물 이름 깜빡임 · 판매/구매 버튼 · 출입권 수익률(표시 = 실제) · 1분 매크로 막기 · 소문 감정 50~90% · 광물 값 지층 순서
// · 장비 탭 파란 강조 상자 · 뒤로가기 종료 창(Capacitor) · 전화/포커스 무음 · 주민 안내 · 제련 용어 · 숯의 선물(15분치) · 글자 세로 가운데
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();fs.writeFileSync('dbg41.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+fs.readFileSync(process.argv[2],'utf8')+'</body></html>');
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);const url='file://'+process.cwd()+'/dbg41.html';
// raw: 넣어 둘 저장, cap: Capacitor App 플러그인 흉내(뒤로가기 · 일시정지 · 종료)
const open=async(raw,cap)=>{const c=await b.newContext({...devices['Pixel 5'],locale:'ko-KR'});await c.addInitScript(([r,cap])=>{try{if(!sessionStorage.getItem('inj')){if(r!=null)localStorage.setItem('starfall-v1',r);sessionStorage.setItem('inj','1')}}catch(e){}
  if(cap){const L={};window.__cap={L,exit:0};window.Capacitor={Plugins:{App:{addListener:(n,f)=>{L[n]=f;return{remove(){}}},exitApp:()=>{window.__cap.exit++}}}}}},[raw,cap]);
  const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(url);await p.waitForTimeout(900);
  await p.evaluate(()=>{$('titleScr').hidden=true;$('entry').hidden=true;STQ.length=0;$('story').hidden=true;S.tutDone=true;S.prologue=true});return{c,p,errs}};
let {c,p,errs}=await open(null,true);
// 1) 장터 광물: 개수가 바뀌어 부분 갱신돼도 이름이 그대로
const m1=await p.evaluate(()=>{S.unlocked=6;S.floors=12;S.seen=['stone','copper','clay','tin','iron','coal'];S.inv={stone:3,copper:1};S.mkSub='ore';setTab('market');renderAll();
  const names=()=>[...document.querySelectorAll('#oreList .orow .onm')].map(e=>e.textContent);const n0=names();
  for(let i=0;i<5;i++){S.inv.stone+=7;S.inv.coal=(S.inv.coal||0)+3;renderMarket()}const n1=names();
  const btn=document.querySelector('#oreList [data-osell]'),bb=btn.getBoundingClientRect(),row=document.querySelector('#oreList .orow');
  const tc=e=>{const r=e.getBoundingClientRect();return r.top+r.height/2};const ic=row.querySelector('.ico'),cn=row.querySelector('.ocnt');
  return{n0,n1,sell:btn.textContent,buy:document.querySelector('#oreList [data-obuy]').textContent,h:bb.height,w:bb.width,mid:Math.abs(tc(ic)-tc(cn)),rowMid:Math.abs(tc(row)-tc(btn))}});
ok(m1.n0.length===6&&m1.n0.every(Boolean)&&JSON.stringify(m1.n0)===JSON.stringify(m1.n1),`광물 거래: 개수가 바뀌어도 이름이 그대로 (${m1.n1.join(', ')})`);
ok(m1.sell==='판매'&&m1.buy==='구매'&&m1.h>=38&&m1.w>=54,`버튼 '판매' · '구매', 손가락 크기 ${Math.round(m1.w)}×${Math.round(m1.h)}`);
ok(m1.mid<=2&&m1.rowMid<=2,`아이콘 · 개수 · 버튼이 줄 높이 한가운데 (어긋남 ${m1.mid.toFixed(1)}px, ${m1.rowMid.toFixed(1)}px)`);
// 2) 출입권: 화면 수익률 = 실제 판매 수익률, 사자마자 팔면 본전, 1분 안에는 이익 최대 +1%
const ps=await p.evaluate(()=>{S.floors=21;refreshBonus();S.gold=1e9;const L=2,P=PM(L);P.imp=0;P.m=1;P.a=1;passBuy(L,50);S.mkSub='pass';setTab('market');renderMarket();
  const row=[...document.querySelectorAll('#passes .prow')][L].querySelector('.ph').textContent;const shown=(row.match(/수익률 ([+\-]?[\d.]+%|0%)/)||[])[1];
  const q=passQuote(L,50),g0=S.gold;const r=passSell(L,999);const real=retPct(r.gain/r.cost);
  // 소문 발표로 분위기 +50%: 1분 안 / 1분 뒤
  passBuy(L,10);P.m*=1.5;const qa=passQuote(L,10),ra=qa.gain/qa.cost,lockA=qa.lock;S.clock+=61;const qb=passQuote(L,10),rb=qb.gain/qb.cost;passSell(L,999);P.m=1;
  return{shown,real,diff:Math.round(S.gold-g0-r.t),even:Math.abs(r.gain),ra,rb,lockA,lockB:qb.lock}});
ok(ps.shown===ps.real,`출입권 50장: 화면 수익률 ${ps.shown} = 실제로 팔았을 때 ${ps.real}`);
ok(ps.even<1,`산 그 자리에서 팔면 본전 (차이 ${ps.even.toFixed(3)}G)`);
ok(ps.lockA>50&&ps.ra<=.0101&&ps.ra>0,`산 지 1분 안에 값이 50% 올라도 이익 최대 +1% (${(ps.ra*100).toFixed(2)}%)`);
ok(ps.lockB===0&&ps.rb>.4,`1분이 지나면 오른 만큼 그대로 (${(ps.rb*100).toFixed(1)}%)`);
const toastPct=await p.evaluate(async()=>{const L=3;S.gold=1e9;PM(L).imp=0;passBuy(L,5);S.clock+=61;PM(L).m*=1.2;renderMarket();const row=[...document.querySelectorAll('#passes .prow')][L].querySelector('.ph').textContent;
  document.querySelector(`[data-ps="${L}"]`).click();await new Promise(r=>setTimeout(r,50));const t=[...document.querySelectorAll('.toast')].map(e=>e.textContent).pop()||'';PM(L).m=1;
  return{row:(row.match(/수익률 ([+\-]?[\d.]+%)/)||[])[1],toast:t}});
ok(toastPct.row&&toastPct.toast.includes(`, ${toastPct.row})`)&&/\(\+[\d,.]+[만억]?G, \+/.test(toastPct.toast),`판매 알림에 금액과 (±%) 함께: "${toastPct.toast}" / 줄 표시 ${toastPct.row}`);
// 3) 소문 감정: 50% → 5%씩 → 90%, 9단계
const it=await p.evaluate(()=>({acc:[...Array(10).keys()].map(l=>Math.round(intelAcc(l)*100)),max:UPS.intel.max,cost:[0,1,8].map(intelCost),inf:intelCost(9),d0:(S.intel=0,UPS.intel.d()),d4:(S.intel=4,UPS.intel.d())}));
ok(JSON.stringify(it.acc)===JSON.stringify([0,50,55,60,65,70,75,80,85,90])&&it.max===9&&it.inf===Infinity&&it.cost[0]<it.cost[1]&&it.cost[1]<it.cost[2],`소문 감정 단계별 적중 ${it.acc.slice(1).join('/')}%, 최대 Lv.9`);
ok(it.d0.includes('50%')&&it.d4.includes('65%')&&it.d4.includes('70%'),`설명: "${it.d0}" / "${it.d4}"`);
// 4) 광물 값: 깊은 지층 광물이 앞 지층 광물보다 항상 비쌈 + 끝판 재료가 깊은 지층에서도 나옴
const pr=await p.evaluate(()=>{let mx=0,bad=[];for(let L=1;L<=13;L++){const ids=Object.keys(ITEMS).filter(k=>ITEMS[k].L===L),mn=Math.min(...ids.map(k=>ITEMS[k].p));if(mn<=mx)bad.push(L);mx=Math.max(...ids.map(k=>ITEMS[k].p))}
  const deep=new Set();LAYERS.slice(10).forEach(l=>l.drops.forEach(([id])=>deep.add(id)));return{bad,deep:['coal','iron','quartz','gold','voidstone','diamond','meteoriron'].filter(k=>!deep.has(k))}});
ok(!pr.bad.length,`광물 값: 모든 지층이 앞 지층보다 비쌈 ${pr.bad.length?'(어긋남 B'+pr.bad.join(',B')+')':''}`);
ok(!pr.deep.length,`석탄 · 철 · 석영 · 금 · 그믐돌 · 다이아 · 운철이 B11~B13에서도 나옴 ${pr.deep.join(',')}`);
// 5) 장비 탭: 눌러도 파란 강조 상자 · 그림 선택이 안 생김
const eq=await p.evaluate(()=>{setTab('equip');renderAll();const im=document.querySelector('#npcImg'),cs=getComputedStyle(im),hs=getComputedStyle(document.documentElement);
  return{hl:hs.webkitTapHighlightColor,us:getComputedStyle(document.body).userSelect,drag:cs.webkitUserDrag,touch:cs.touchAction}});
ok(eq.hl==='rgba(0, 0, 0, 0)'&&eq.us==='none'&&eq.drag==='none',`장비 탭 캐릭터: 탭 강조색 ${eq.hl}, 선택 ${eq.us}, 끌기 ${eq.drag}`);
// 6) 뒤로가기(Capacitor): 열린 창 먼저 닫기 → 종료 확인 창 → [종료하기]면 저장 후 앱 종료
const bk=await p.evaluate(async()=>{const L=window.__cap.L,out={};setTab('mine');openSheet('store');L.backButton();out.sheetClosed=$('sheet').hidden&&$('exitModal').hidden;
  L.backButton();out.ask=!$('exitModal').hidden;L.backButton();out.close=$('exitModal').hidden;L.backButton();S.gold=123457;$('exitYes').click();await new Promise(r=>setTimeout(r,50));
  out.exit=window.__cap.exit;out.saved=JSON.parse(localStorage.getItem(SAVE_KEY)).gold;out.muted=MUTE.has('exit');return out});
ok(bk.sheetClosed&&bk.ask&&bk.close,'뒤로가기: 열린 창을 먼저 닫고 → 종료 확인 창 → 한 번 더 누르면 닫힘');
ok(bk.exit===1&&bk.saved===123457&&bk.muted,`[종료하기]: 저장(${bk.saved}G) · 소리 끔 · 앱 종료 호출 ${bk.exit}번`);
// 7) 무음: 앱이 뒤로 감 · 포커스 잃음(전화 알림) · 앱이 알려 준 오디오 포커스 잃음 → 소리 멈춤, 돌아오면 다시
await p.evaluate(()=>MUTE.delete('exit'));await p.mouse.click(180,300);await p.waitForTimeout(200);
const mu=await p.evaluate(async()=>{const w=()=>new Promise(r=>setTimeout(r,80)),st=[];const L=window.__cap.L;st.push(AC.state);
  L.pause();await w();st.push(AC.state);L.resume();await w();st.push(AC.state);dispatchEvent(new Event('blur'));await w();st.push(AC.state);dispatchEvent(new Event('focus'));await w();st.push(AC.state);
  starfallAudio(false);await w();st.push(AC.state);starfallAudio(true);await w();st.push(AC.state);return st});
ok(mu.join()==='running,suspended,running,suspended,running,suspended,running',`소리: 앱 일시정지 · 포커스 잃음 · 오디오 포커스 잃음 때 멈추고 돌아오면 다시 (${mu.join(' → ')})`);
// 8) 주민 안내: 6층에 셈이 들어오면 셈이 [장비] → [창고] → 설명 순서로 알려 줌
const nt=await p.evaluate(()=>{S.floors=5;S.ntq=[];S.ntDone=[];S.gold=1e9;S.inv={brick:999,tile:999,wire:999};setTab('mine');buildFloor();STQ.length=0;$('story').hidden=true;tutTick();
  return{q:[...S.ntq],who:$('tutWho').textContent,vis:!$('tut').hidden,t:$('tutT').textContent,glow:!!document.querySelector('.nb[data-tab="equip"].tut-glow')}});
ok(nt.q[0]==='셈'&&nt.vis&&nt.who==='셈'&&/창고/.test(nt.t)&&nt.glow,`6층 → 셈의 안내: "${nt.t}" (장비 탭 반짝임)`);
await p.click('.nb[data-tab="equip"]');await p.waitForTimeout(150);await p.click('[data-shop="1"]');await p.waitForTimeout(200);
const nt2=await p.evaluate(()=>{tutTick();return{s:S.nts,glow:(document.querySelector('.tut-glow')||{}).dataset,go:!$('tutGo').hidden}});
ok(nt2.s===1&&nt2.glow&&nt2.glow.up==='wh'&&nt2.go,'[창고] 가게를 고르면 다음 단계: [창고 늘리기] 반짝임 + [다음]');
await p.click('#tutGo');await p.waitForTimeout(100);await p.click('#tutGo');await p.waitForTimeout(100);
ok(await p.evaluate(()=>S.ntDone.includes('셈')&&!S.ntq.length&&$('tut').hidden),'셈의 안내를 다 보면 기록되고 말풍선이 닫힘');
const lin=await p.evaluate(()=>{S.ntDone=S.ntDone.filter(w=>w!=='린');CR().met=0;linIntro(false);while(STQ.length||!$('story').hidden){nextStory()}tutTick();return{q:[...S.ntq],who:$('tutWho').textContent,t:$('tutT').textContent}});
ok(lin.q[0]==='린'&&lin.who==='린'&&/세공/.test(lin.t),`B4 린: 세공 작업대 안내 "${lin.t}"`);
// 9) 제련 용어: 화면 어디에도 '재련' 없음
const jr=await p.evaluate(()=>{S.ntq=[];$('tut').hidden=true;const out=[];for(const t of ['forge','market','mine','tower','equip']){setTab(t);renderAll();if(/재련/.test(document.body.innerText))out.push(t)}
  for(const s of ['store','book','set','craft']){openSheet(s);renderAll();if(/재련/.test(document.body.innerText))out.push(s)}closeSheet();return out});
ok(!jr.length,`'재련' 대신 '제련' (남은 화면: ${jr.join(',')||'없음'})`);
// 10) 숯의 선물: 최근 실제 채굴 수입(또는 가장 깊은 지층 기준) 15분치
const gf=await p.evaluate(()=>{S.unlocked=6;S.layer=0;S.mr=0;const a=giftGold(),base=playIncomeAt(5)*GIFT_MIN*60;S.mr=playIncomeAt(5)*3;const c=giftGold();return{a,base,c,ratio:c/a,min:GIFT_MIN}});
ok(Math.abs(gf.a-gf.base)<=1&&gf.min===15,`선물: 가장 깊은 지층(B6) 기준 ${gf.min}분치 = ${Math.round(gf.a)}G (B1에 있어도)`);
ok(gf.ratio>2.9,`열심히 캐서 최근 수입이 3배면 선물도 ${gf.ratio.toFixed(1)}배`);
// 11) 글꼴 세로 가운데 보정
ok(await p.evaluate(()=>[...document.querySelectorAll('style')].some(s=>/font-family:"Galmuri14"[^}]*ascent-override:107%/.test(s.textContent))),'픽셀 글꼴 위·아래 여백 보정(글자가 버튼 한가운데)');
ok(errs.length===0,'오류 없음 '+errs.join(' | '));await c.close();
// 12) 옛 저장(v4): 소문 감정 3단계 → 9단계로, 이미 들어온 주민 안내는 본 것으로
{const o=await open(null,false);const raw=await o.p.evaluate(()=>{S.floors=12;S.intel=2;CR().met=1;S.v=4;delete S.ntDone;delete S.ntq;CLK.hold=true;const d=JSON.parse(JSON.stringify(S));d.v=4;return JSON.stringify(d)});await o.c.close();
 const n=await open(raw,false);const r=await n.p.evaluate(()=>({intel:S.intel,acc:intelAcc(S.intel),done:S.ntDone,q:S.ntq}));
 ok(r.intel===8&&Math.round(r.acc*100)===85,`옛 저장 소문 감정 Lv.2(88%) → Lv.${r.intel}(${Math.round(r.acc*100)}%)`);
 ok(r.done.includes('셈')&&r.done.includes('핀')&&r.done.includes('린')&&!r.done.includes('루카')&&!r.q.length,`옛 저장: 이미 들어온 주민(${r.done.join(',')}) 안내는 건너뜀`);
 ok(n.errs.length===0,'옛 저장 열기 오류 없음 '+n.errs.join(' | '));await n.c.close()}
await b.close()})();
