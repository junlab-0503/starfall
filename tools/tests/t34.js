// v24 1단계: 황금 광맥 절반, 채굴 입력 초당 30회 제한(터치 · 키보드), 창고 처음 450칸(줄지 않음), 셈 전 첫 가득 참 안내(한 번 · 저장 · 탑으로 가기)
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();let h=fs.readFileSync(process.argv[2],'utf8');
fs.writeFileSync('dbg34.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+h+'</body></html>');
const ctx=await b.newContext({...devices['iPhone 13'],locale:'ko-KR'});const p=await ctx.newPage();p.on('console',m=>{if(/^vein/.test(m.text()))console.log(m.text())});const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);const close=async()=>{for(let i=0;i<30&&await p.isVisible('#storyNext');i++)await p.click('#storyNext')};
const start=async()=>{await p.waitForTimeout(800);if(await p.isVisible('#titleScr'))await p.click('#titleScr');await p.waitForTimeout(200);await close();if(await p.isVisible('#entry')){await p.waitForTimeout(500);await p.click('#entry');await p.waitForTimeout(700)}await close()};
await p.goto('file://'+process.cwd()+'/dbg34.html');await start();
await p.evaluate(()=>{window._story=story;story=()=>{};S.tutDone=true;S.whHint=1;S.inv={};S.wh=25;S.seen=Object.keys(ITEMS);setTab('mine');renderAll()});await close();
// 황금 광맥: 탭 1번 pot/80, 드릴 0.25초마다 pot/800
ok(await p.evaluate(()=>VEIN_K.tap===1/80&&VEIN_K.drill===1/800),'황금 광맥 골드 절반(탭 1/40→1/80, 드릴 1/400→1/800)');
ok(await p.evaluate(()=>{S.vein={left:30,pot:8000,got:0};const g=S.gold;veinGold(VEIN_K.tap,true);const t=S.gold-g;const g2=S.gold;veinGold(VEIN_K.drill,false);const d=S.gold-g2;S.vein=null;return t===100&&d===10}),'pot 8000일 때 탭 +100G · 드릴 +10G');
// 입력 제한: 같은 순간 100번 → 30번만, 1초 뒤 다시 30번
const r=await p.evaluate(()=>{const real=performance.now.bind(performance);let now=1e7;performance.now=()=>now;TAPQ.length=0;const tp=tapPower;let hits=0;window.applyDmg=((f)=>(...a)=>{if(!a[1])hits++;return f(...a)})(applyDmg);
  const sw0=A.sw;for(let i=0;i<100;i++)doTap();const a=hits;now+=500;for(let i=0;i<20;i++)doTap();const b2=hits;now+=501;for(let i=0;i<40;i++)doTap();const c=hits;
  // 보통 손 빠르기(초당 12번) 10초: 모두 인정
  now+=1000;hits=0;for(let i=0;i<120;i++){now+=1000/12;doTap()}const d=hits;
  // 키보드(스페이스)도 같은 제한
  now+=2000;hits=0;for(let i=0;i<60;i++)document.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',bubbles:true}));const k=hits;performance.now=real;TAPQ.length=0;return{a,b:b2-a,c:c-b2,d,k}});
ok(r.a===30,`같은 순간 100번 탭 → ${r.a}번만 인정`);ok(r.b===0,`0.5초 뒤 20번 더 → ${r.b}번(직전 1초에 이미 30번)`);ok(r.c===30,`1초가 지나면 다시 30번 → ${r.c}`);
ok(r.d===120,`초당 12번으로 10초 탭 → 120번 모두 인정(${r.d})`);ok(r.k===30,`키보드 60번 연타 → ${r.k}번만 인정`);
// 넘친 입력엔 골드 · 소리 없음 (광맥 중)
ok(await p.evaluate(()=>{let now=2e7;const real=performance.now.bind(performance);performance.now=()=>now;TAPQ.length=0;S.vein={left:30,pot:8000,got:0};let snd=0;const sf=window.sfx;window.sfx=(...a)=>{snd++;return sf(...a)};
  for(let i=0;i<30;i++)doTap();const g=S.gold,s0=snd;for(let i=0;i<30;i++)doTap();const ok=S.gold===g&&snd===s0;window.sfx=sf;S.vein=null;performance.now=real;TAPQ.length=0;if(!ok)console.log('vein',S.gold-g,snd-s0,TAPQ.length);return ok}),'제한을 넘은 탭: 골드 · 효과음 없음');
// 창고
const cp=await p.evaluate(()=>{const o=[];for(let w=0;w<=14;w++)o.push([capOf(w),Math.floor(300*Math.pow(1.5,w)*BON.wh)]);return o});
ok(cp[0][0]===450,`처음 창고 ${cp[0][0]}칸`);ok(cp.every(([n,o])=>n>=o&&n-o<=150*1.0001*(o/Math.max(1,o))*999),'어느 단계든 예전 용량보다 줄지 않음');
ok(cp.every((c,i)=>i===0||c[0]>cp[i-1][0]),'단계가 오를수록 늘기만 함');ok(cp[1][0]===600&&cp[10][0]-cp[10][1]===150,`늘리는 비율은 그대로(1단계 ${cp[1][0]}칸, 10단계 예전 +${cp[10][0]-cp[10][1]}칸)`);
// 첫 가득 참 안내
await p.evaluate(()=>{story=window._story});await close();
await p.evaluate(()=>{S.whHint=0;S.floors=3;S.wh=0;S.inv={stone:cap()};renderAll()});await p.waitForTimeout(1500);
const t1=await p.evaluate(()=>!$('story').hidden&&/탑을 6층까지 지으면 창고지기 셈이 돌아와/.test($('storyB').textContent)&&!!$('whGo'));ok(t1,'셈 전 창고가 처음 가득 차면 안내 + [탑으로 가기]');
await p.click('#whGo');await p.waitForTimeout(200);ok(await p.evaluate(()=>S.tab==='tower'&&$('story').hidden&&S.whHint===1),'[탑으로 가기] → 탑 화면, 기록됨');
await p.evaluate(()=>{setTab('mine')});await p.waitForTimeout(1500);ok(await p.evaluate(()=>$('story').hidden),'다시 가득 차도 안 나옴');
await p.evaluate(()=>save());await p.reload();await start();await p.waitForTimeout(1500);ok(await p.evaluate(()=>S.whHint===1&&$('story').hidden),'다시 켜도 안 나옴(저장)');
await p.evaluate(()=>{S.whHint=0;S.floors=6;renderAll()});await p.waitForTimeout(1500);ok(await p.evaluate(()=>$('story').hidden&&!S.whHint),'셈이 이미 있으면 안 나옴');
// 옛 저장(whHint 없음)도 열림
ok(await p.evaluate(()=>{const d=JSON.parse(JSON.stringify(S));delete d.whHint;const c=cleanSave(d);return c.whHint===0}),'옛 저장 불러오기: whHint 기본값 0');
ok(errs.length===0,'오류 없음 '+errs.join(' | '));await b.close()})();
