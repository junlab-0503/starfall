const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const fs=require('fs');let h=fs.readFileSync(process.argv[2],'utf8');h='<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+h.replace('/* ═════════ 시작 ═════════ */','window.__d=()=>({S,H,BON});');
fs.writeFileSync('/tmp/claude-0/-home-user/607f5601-cab5-5967-aa26-5addad61ad4f/scratchpad/dbg2.html',h);
await p.goto('file:///tmp/claude-0/-home-user/607f5601-cab5-5967-aa26-5addad61ad4f/scratchpad/dbg2.html');await p.waitForTimeout(800);
await p.screenshot({path:'q0.png'});
for(let i=0;i<4;i++){await p.click('#storyNext');await p.waitForTimeout(150)}
const box=await (await p.$('#scene')).boundingBox();
for(let i=0;i<30;i++){await p.mouse.click(box.x+box.width/2,box.y+box.height/2);await p.waitForTimeout(70);if(i===12){if(await p.isVisible('#storyNext'))await p.click('#storyNext')}}
await p.waitForTimeout(100);await p.screenshot({path:'q1.png'});
if(await p.isVisible('#storyNext'))await p.click('#storyNext');
await p.click('[data-tab="forge"]');await p.waitForTimeout(200);await p.screenshot({path:'q2.png'});
await p.click('[data-tab="market"]');await p.waitForTimeout(300);await p.screenshot({path:'q3.png'});
await p.click('.mrow');await p.waitForTimeout(300);await p.screenshot({path:'q4.png',fullPage:true});
await p.click('[data-tab="tower"]');await p.waitForTimeout(300);await p.screenshot({path:'q5.png',fullPage:true});
await p.click('[data-tab="manage"]');await p.click('[data-sub="set"]');await p.fill('#devCode','jun');await p.click('#devForm button');await p.waitForTimeout(200);
await p.evaluate(()=>{const d=__d();d.S.gold=1e12;});
await p.click('[data-sub="gear"]');await p.waitForTimeout(200);await p.screenshot({path:'q6.png'});
await p.click('[data-tab="mine"]');
for(const L of [3,7,10,12]){await p.click(`[data-chip="${L}"]`);await p.waitForTimeout(300);for(let i=0;i<6;i++){await p.mouse.click(box.x+box.width/2,box.y+box.height/2);await p.waitForTimeout(90)}await p.screenshot({path:`qL${L}.png`})}
console.log('errors',errs);await b.close()})();
