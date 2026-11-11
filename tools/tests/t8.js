const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const fs=require('fs');let h=fs.readFileSync(process.argv[2],'utf8');// 게시된 아티팩트처럼 <body> 안에 넣어서 띄움(스타일 순서 문제를 잡으려고)
h='<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+h.replace('/* ═════════ 시작 ═════════ */','window.__d=()=>({S,BON});');
fs.writeFileSync('dbg2.html',h);
await p.goto('file://'+process.cwd()+'/dbg2.html');await p.waitForTimeout(800);if(await p.isVisible('#titleScr'))await p.click('#titleScr');await p.waitForTimeout(200);
await p.screenshot({path:'q0.png'});
while(await p.isVisible('#storyNext')){await p.click('#storyNext');await p.waitForTimeout(150)}
if(await p.isVisible('#entry')){await p.waitForTimeout(500);await p.click('#entry');await p.waitForTimeout(700)}
const navBg=await p.evaluate(()=>[...document.querySelectorAll('.ni')].filter(e=>getComputedStyle(e).backgroundImage==='none').length);console.log((navBg?'FAIL':'OK  ')+' 아래 탭 아이콘(아티팩트처럼 띄워도 보임): 빠진 것 '+navBg+'개');
const box=await (await p.$('#scene')).boundingBox();
for(let i=0;i<30;i++){if(await p.isVisible('#storyNext')){await p.click('#storyNext');continue}await p.mouse.click(box.x+box.width/2,box.y+box.height/2);await p.waitForTimeout(70)}
await p.waitForTimeout(100);await p.screenshot({path:'q1.png'});
while(await p.isVisible('#storyNext'))await p.click('#storyNext');
await p.click('[data-tab="forge"]');await p.waitForTimeout(200);await p.screenshot({path:'q2.png'});
await p.click('[data-tab="market"]');await p.waitForTimeout(300);await p.screenshot({path:'q3.png'});
if(await p.isVisible('[data-mks="ore"]'))await p.click('[data-mks="ore"]');await p.waitForTimeout(300);await p.screenshot({path:'q4.png',fullPage:true});
await p.click('[data-tab="tower"]');await p.waitForTimeout(300);await p.screenshot({path:'q5.png',fullPage:true});
while(await p.isVisible('#storyNext'))await p.click('#storyNext');await p.click('[data-tab="manage"]');await p.click('[data-sub="set"]');await p.fill('#devCode','jun');await p.click('#devForm button');await p.waitForTimeout(200);
await p.evaluate(()=>{const d=__d();d.S.gold=1e12;});
while(await p.isVisible('#storyNext'))await p.click('#storyNext');await p.click('[data-tab="equip"]');await p.waitForTimeout(200);await p.screenshot({path:'q6.png'});
await p.click('[data-tab="mine"]');
for(const L of [3,7,10,12]){while(await p.isVisible('#storyNext'))await p.click('#storyNext');await p.click(`[data-chip="${L}"]`);await p.waitForTimeout(300);for(let i=0;i<6;i++){if(await p.isVisible('#storyNext')){await p.click('#storyNext');continue}await p.mouse.click(box.x+box.width/2,box.y+box.height/2);await p.waitForTimeout(90)}await p.screenshot({path:`qL${L}.png`})}
console.log('errors',errs);await b.close()})();
