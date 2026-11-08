const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
const fs=require('fs');let h=fs.readFileSync(process.argv[2],'utf8');h='<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+h.replace('/* ═════════ 시작 ═════════ */','window.__d=()=>({S,H,BON});');fs.writeFileSync('dbg4.html',h);
await p.goto('file://'+process.cwd()+'/dbg4.html');await p.waitForTimeout(600);
while(await p.isVisible('#storyNext'))await p.click('#storyNext');
const box=await (await p.$('#scene')).boundingBox();
for(let i=0;i<40;i++){await p.mouse.click(box.x+box.width/2,box.y+box.height/2);await p.waitForTimeout(25)}
while(await p.isVisible('#storyNext'))await p.click('#storyNext');
await p.screenshot({path:'r1.png'});
await p.evaluate(()=>{__d().S.ads.giftAt=0});await p.waitForTimeout(300);
await p.click('#giftBtn');await p.waitForTimeout(300);await p.screenshot({path:'r2.png'});
await p.waitForTimeout(5200);await p.click('#adDone');await p.waitForTimeout(300);await p.screenshot({path:'r3.png'});
while(await p.isVisible('#storyNext'))await p.click('#storyNext');
await p.click('#boostBtn');await p.waitForTimeout(5300);await p.click('#adDone');await p.waitForTimeout(400);
for(let i=0;i<10;i++){await p.mouse.click(box.x+box.width/2,box.y+box.height/2);await p.waitForTimeout(40)}
await p.screenshot({path:'r4.png'});
await p.click('[data-tab="manage"]');await p.click('[data-sub="set"]');await p.click('#buyPkg');await p.click('#shopOk');await p.waitForTimeout(200);
await p.fill('#devCode','jun');await p.click('#devForm button');await p.waitForTimeout(200);await p.screenshot({path:'r5.png'});
await p.click('[data-tab="tower"]');await p.waitForTimeout(300);await p.screenshot({path:'r6.png'});
await p.click('#finaleBtn');await p.waitForTimeout(300);let n=0;while(await p.isVisible('#storyNext')&&n<20){n++;if(n===8)await p.screenshot({path:'r7.png'});await p.click('#storyNext');await p.waitForTimeout(80)}
await p.screenshot({path:'r8.png'});
await p.click('[data-tab="mine"]');await p.waitForTimeout(500);await p.screenshot({path:'r9.png'});
console.log('ended',await p.evaluate(()=>__d().S.ended),'cards',n,errs);await b.close()})();
