// v15 확인: 개발자 코드는 탑을 열지 않음(층 · 입주자 · 가게 개방은 직접 쌓아 확인) · 셈/이장 할머니 초상화 · 탑 그림 · 채굴 화면 배경 캐시 · 넓은 화면 세로 비율
const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const fs=require('fs');let h=fs.readFileSync(process.argv[2],'utf8');
h='<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+h.replace('/* ═════════ 시작 ═════════ */','window.__d=()=>({S});')+'</body></html>';fs.writeFileSync('dbg26.html',h);
const url='file://'+process.cwd()+'/dbg26.html';
const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);
const closeStory=async()=>{for(let i=0;i<30&&await p.isVisible('#storyNext');i++)await p.click('#storyNext')};
await p.goto(url);await p.waitForTimeout(800);
// 튜토리얼 말풍선 초상화 = 이장 할머니 그림
const tp=await p.evaluate(()=>{const c=$('tutPor');return{w:c.width,ink:(()=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n})(),art:!!ART.granny}});
ok(tp.art&&tp.w===128&&tp.ink>128*128*.9,'튜토리얼 초상화 = 이장 할머니 그림 '+JSON.stringify(tp));
ok(await p.evaluate(()=>PROLOGUE.filter(c=>c.art==='granny').length===2&&ENDING.some(c=>c.t==='이장 할머니'&&c.art==='granny')),'프롤로그 2장 · 에필로그 1장에 이장 할머니 초상화');
ok(await p.evaluate(()=>SECTIONS[1].t.name==='셈'&&SECTIONS[1].t.art==='sem'&&!!ART.sem&&ART.sem!==ART.granny),'셈 초상화(새 그림, 이장 할머니와 다름)');
await p.click('#titleScr');await p.waitForTimeout(200);await closeStory();if(await p.isVisible('#entry')){await p.waitForTimeout(500);await p.click('#entry');await p.waitForTimeout(700)}
await p.evaluate(()=>{__d().S.tutDone=true;renderAll()});await p.waitForTimeout(200);await closeStory();
// 개발자 코드: 탑은 그대로
const f0=await p.evaluate(()=>__d().S.floors);
await p.click('[data-tab="manage"]');await p.click('[data-sub="set"]');await p.fill('#devCode','jun');await p.press('#devCode','Enter');await p.waitForTimeout(400);await closeStory();
const d=await p.evaluate(()=>{const S=__d().S;return{fl:S.floors,un:S.unlocked,gold:S.gold,found:S.found.length,rec:RECIPES.length,inv:cnt('stone'),shops:SHOPS.map((s,i)=>shopOpen(i)?1:0).join(''),msg:$('devMsg').textContent}});
ok(d.fl===f0&&d.un===13&&d.gold>9e14&&d.found===d.rec&&d.inv>=9999,`개발자 코드: 탑 ${f0}층 그대로, 지층 ${d.un}개 열림, 골드 무한, 레시피 ${d.found}/${d.rec}, 돌 ${d.inv}`);
ok(/탑은 열지 않았어요/.test(d.msg),'안내: '+d.msg.slice(0,60));
ok(d.shops==='10000'||d.shops.split('').filter(x=>x==='1').length<=1,'가게는 탑을 쌓은 만큼만 열림: '+d.shops);
// 직접 쌓기: 6층(석조 기단)까지 쌓으면 셈 입주 → 셈 가게 열림
const before=await p.evaluate(()=>{const i=SHOPS.findIndex(s=>s.who==='셈');return{i,open:shopOpen(i)}});
await p.evaluate(()=>{const S=__d().S;for(let k=0;k<20&&S.floors<6;k++)buildFloor(true);renderAll()});await p.waitForTimeout(300);await closeStory();
const after=await p.evaluate(i=>({fl:__d().S.floors,open:shopOpen(i)}),before.i);
ok(!before.open&&after.fl>=6&&after.open,`탑을 직접 쌓으면 입주 · 가게 열림: 셈 가게 ${before.open?'열림':'잠김'} → ${after.fl}층에서 ${after.open?'열림':'잠김'}`);
// 탑 그림: 조금 굵은 도트(높이 200)를 330 높이로
await p.click('[data-tab="tower"]');await p.waitForTimeout(600);await closeStory();
const tw=await p.evaluate(()=>new Promise(r=>{const im=new Image();im.onload=()=>r([im.width,im.height]);im.src=ART.scene_tower}));ok(tw[1]===200,'탑 그림 '+tw.join('x'));
await p.screenshot({path:'v15_tower.png'});
// 채굴 화면: 배경 캐시가 그려지고(빈 화면 아님), 한 칸 판 뒤 다시 그려짐
await p.click('[data-tab="mine"]');await p.waitForTimeout(800);
const m=await p.evaluate(()=>{const k0=BGC.k,d=g.getImageData(0,0,cv.width,cv.height).data;let dark=0;for(let i=0;i<d.length;i+=4)if(d[i]+d[i+1]+d[i+2]<15)dark++;S.hp=0;breakWall(false);return{k0,dark:dark/(d.length/4)}});
await p.waitForTimeout(300);const k1=await p.evaluate(()=>BGC.k);
ok(m.k0&&m.dark<.6&&k1!==m.k0,`채굴 배경 캐시: 어두운 칸 ${(m.dark*100).toFixed(0)}%, 판 뒤 다시 그림 ${m.k0} → ${k1}`);
await p.screenshot({path:'v15_mine.png'});
// 넓은 화면: 가운데 세로(9:16) 칸
const dp=await b.newPage({viewport:{width:1280,height:800}});await dp.goto(url);await dp.waitForTimeout(600);
const bw=await dp.evaluate(()=>{const r=document.body.getBoundingClientRect(),t=$('titleScr').getBoundingClientRect();return{bw:r.width,bx:r.left,tw:t.width,tx:t.left}});
ok(Math.abs(bw.bw-450)<2&&Math.abs(bw.tw-450)<2&&Math.abs(bw.bx-415)<2,'넓은 화면 세로 칸: '+JSON.stringify(bw));
console.log('errors',errs);await b.close()})();
