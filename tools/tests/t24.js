// v13 확인: 시작 화면 → 프롤로그(유산) → 캐기 → 광석 발견 팝업 → 재련 → 탑 1층(무쇠) → 곡괭이 강화 → 안내 → 끝. 상점 잠금 · 출입권 잠금
const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const fs=require('fs');let h=fs.readFileSync(process.argv[2],'utf8');
h='<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+h.replace('/* ═════════ 시작 ═════════ */','window.__d=()=>({S});');fs.writeFileSync('dbg24.html',h);
const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);const S=f=>p.evaluate(f);const tut=()=>p.textContent('#tutT').catch(()=>'');
await p.goto('file://'+process.cwd()+'/dbg24.html');await p.waitForTimeout(700);
ok(await p.isVisible('#titleScr'),'시작 화면');await p.screenshot({path:'v13_title.png'});
await p.click('#titleScr');await p.waitForTimeout(300);
let leg=false;for(let i=0;i<10&&await p.isVisible('#storyNext');i++){const t=await p.textContent('#storyT');if(/재련소/.test(t)){leg=true;await p.screenshot({path:'v13_legacy.png'})}if(/광맥 입구/.test(t))await p.screenshot({path:'v13_entry.png'});await p.click('#storyNext');await p.waitForTimeout(150)}
const g=await S(()=>({gold:__d().S.gold,auto:__d().S.auto,pro:__d().S.prologue}));ok(leg&&g.gold===1000&&g.auto===1&&g.pro,`유산: ${g.gold}G, 채굴 기계 ${g.auto}단계`);
await p.waitForTimeout(500);ok(/탭해서/.test(await tut()),'1단계: '+(await tut()).slice(0,24));
const box=await (await p.$('#scene')).boundingBox();let pops=[];
for(let i=0;i<120;i++){if(await p.isVisible('#storyNext')){const k=await p.textContent('#storyKick');if(/발견/.test(k)){pops.push(await p.textContent('#storyT'));if(pops.length===1)await p.screenshot({path:'v13_discover.png'})}await p.click('#storyNext');continue}
  const st=await S(()=>{const S=__d().S;return S.inv.stone||0});if(st>=10)break;await p.mouse.click(box.x+box.width/2,box.y+box.height/2);await p.waitForTimeout(60)}
ok(pops.length>=3,'발견 팝업: '+pops.join(', '));await p.waitForTimeout(500);ok(/재련/.test(await tut()),'재련 안내: '+(await tut()).slice(0,26));
await p.click('[data-tab="forge"]');await p.waitForTimeout(300);
for(let k=0;k<2;k++){await p.click('[data-pk="stone"]');await p.waitForTimeout(100);await p.click('[data-pk="stone"]');await p.waitForTimeout(100);await p.click('#smelt');await p.waitForTimeout(200);while(await p.isVisible('#storyNext'))await p.click('#storyNext')}
ok((await S(()=>__d().S.inv.brick||0))>=2,'다듬은 돌 2개');ok(/탑/.test(await tut()),'탑 안내: '+(await tut()).slice(0,20));
await p.click('[data-tab="equip"]');await p.waitForTimeout(400);await p.screenshot({path:'v13_equip_locked.png'});
const lock=await S(()=>[...document.querySelectorAll('.shopc')].map(e=>e.classList.contains('lock')));ok(lock.every(x=>x),'1층 전: 상점 모두 잠김(실루엣)');
await p.click('[data-tab="tower"]');await p.waitForTimeout(400);await p.click('#buildBtn');await p.waitForTimeout(300);
let cards=[];while(await p.isVisible('#storyNext')){cards.push(await p.textContent('#storyT'));if(cards.length===1)await p.screenshot({path:'v13_musoe.png'});await p.click('#storyNext');await p.waitForTimeout(150)}
ok((await S(()=>__d().S.floors))===1&&cards.some(c=>/무쇠/.test(c)),'1층 → 무쇠 입주: '+cards.join(' / '));
ok(/장비/.test(await tut()),'장비 안내');await p.click('[data-tab="equip"]');await p.waitForTimeout(400);
const lock2=await S(()=>[...document.querySelectorAll('.shopc')].map(e=>e.classList.contains('lock')));ok(!lock2[0]&&lock2.slice(1).every(x=>x),'대장간만 열림');
await p.click('[data-shop="0"]');await p.waitForTimeout(300);await p.click('[data-up="pick"]');await p.waitForTimeout(300);ok((await S(()=>__d().S.pick))>=2,'곡괭이 강화');
for(let i=0;i<5;i++){if(await p.isVisible('#tutGo')){await p.click('#tutGo');await p.waitForTimeout(200)}}
ok(!(await p.isVisible('#tut')),'튜토리얼 끝');
await p.click('[data-tab="market"]');await p.waitForTimeout(300);ok(!(await p.isVisible('#mkSeg'))&&await p.isVisible('#oreList'),'루카 전: 출입권 숨김, 광물 거래만');
await p.click('[data-tab="mine"]');await p.waitForTimeout(500);await p.click('#oddsBtn');await p.waitForTimeout(300);await p.screenshot({path:'v13_odds.png'});await p.click('#storyNext');
await p.screenshot({path:'v13_mine.png'});
console.log('errors',errs);await b.close()})();
