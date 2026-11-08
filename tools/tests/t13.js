const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
const fs=require('fs');let h=fs.readFileSync(process.argv[2],'utf8');h='<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+h.replace('/* ═════════ 시작 ═════════ */','window.__d=()=>({S});');fs.writeFileSync('dbg6.html',h);
const url='file://'+process.cwd()+'/dbg6.html';await p.goto(url);await p.waitForTimeout(600);while(await p.isVisible('#storyNext'))await p.click('#storyNext');
const box=await (await p.$('#scene')).boundingBox();for(let i=0;i<25;i++){await p.mouse.click(box.x+60,box.y+60);await p.waitForTimeout(30)}while(await p.isVisible('#storyNext'))await p.click('#storyNext');
await p.evaluate(()=>{const S=__d().S;S.gold=5000;S.auto=3;S.box={stone:40,copper:12}});
// 1) 자세히 보기 유지 + 4) 구매
await p.click('[data-tab="market"]');await p.waitForTimeout(300);await p.click('.mrow');await p.waitForTimeout(300);
await p.click('details.more summary');await p.waitForTimeout(3500);console.log('1 details still open:',await p.evaluate(()=>document.querySelector('details.more').open));
const g0=await p.evaluate(()=>__d().S.gold);await p.click('[data-db="10"]');await p.waitForTimeout(300);const g1=await p.evaluate(()=>__d().S.gold);console.log('4 bought, gold',Math.round(g0),'->',Math.round(g1),'label:',await p.evaluate(()=>document.querySelector('.trade .tr-row:nth-child(2) .tl').textContent));
await p.screenshot({path:'u1.png',fullPage:true});
// 2) 창고 수량 판매
await p.click('[data-tab="manage"]');await p.click('[data-sub="store"]');await p.waitForTimeout(200);await p.click('[data-sellq]');await p.waitForTimeout(200);await p.fill('#qtyIn','3');await p.dispatchEvent('#qtyIn','input');await p.screenshot({path:'u2.png'});
const c0=await p.evaluate(()=>Object.values(__d().S.inv)[0]);await p.click('#qtyOk');await p.waitForTimeout(200);const c1=await p.evaluate(()=>Object.values(__d().S.inv)[0]);console.log('2 qty sell',c0,'->',c1);
// 3) 도감
await p.click('[data-sub="book"]');await p.waitForTimeout(200);await p.click('[data-dx="stone"]');await p.waitForTimeout(200);await p.screenshot({path:'u3.png'});console.log('3 dex:',await p.textContent('#storyB'));await p.click('#storyNext');
// 로봇 보관함
await p.click('[data-tab="mine"]');await p.waitForTimeout(400);await p.screenshot({path:'u4.png'});const bt=await p.textContent('#boxBtn');await p.click('#boxBtn');await p.waitForTimeout(200);console.log('box:',bt,'-> used',await p.evaluate(()=>Object.values(__d().S.box).length));
// 5) 말투
await p.click('[data-tab="market"]');await p.click('#mkBack').catch(()=>{});await p.waitForTimeout(300);console.log('5 comments:',await p.evaluate(()=>[...document.querySelectorAll('.mrow .cm')].slice(0,4).map(e=>e.textContent)));
// 6) 다시 왔구나
await p.evaluate(()=>{const S=__d().S;S.floors=30;S.lastSeen=Date.now()-3*3600*1000;localStorage.setItem('starfall-v1',JSON.stringify(S))});
await p.goto(url);await p.waitForTimeout(700);await p.screenshot({path:'u5.png'});console.log('6 welcome:',await p.textContent('#storyT'),'|',(await p.textContent('#storyX')).slice(0,120));
console.log('cap lv0..3',await p.evaluate(()=>[0,1,2,3].map(w=>Math.floor(150*Math.pow(1.8,w)))));
console.log('errors',errs);await b.close()})();
