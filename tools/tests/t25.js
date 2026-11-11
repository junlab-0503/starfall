// v13.1 확인: 재련 레시피 발견 → 도감 등록 → 다시 쓰기(자동 재련 맡기기), 황금 광맥은 채굴 화면에서만, 드릴 스위치가 켜 둔 동안 · 자리 비운 동안 같게, 지층 확률
const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const fs=require('fs');let h=fs.readFileSync(process.argv[2],'utf8');
h='<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+h.replace('/* ═════════ 시작 ═════════ */','window.__d=()=>({S});');fs.writeFileSync('dbg25.html',h);
const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);const E=(f,a)=>p.evaluate(f,a);const close=async()=>{while(await p.isVisible('#storyNext'))await p.click('#storyNext')};
await p.goto('file://'+process.cwd()+'/dbg25.html');await p.waitForTimeout(700);await p.click('#titleScr');await close();await p.waitForTimeout(300);if(await p.isVisible('#entry')){await p.waitForTimeout(500);await p.click('#entry');await p.waitForTimeout(700)}
await E(()=>{const S=__d().S;S.tutDone=true;S.floors=30;refreshBonus();S.inv.copper=6;S.inv.tin=4;S.unlocked=3;S.gold=1e6;renderAll()});
// 1) 레시피 발견 · 도감 · 다시 쓰기
await p.click('[data-tab="forge"]');await p.waitForTimeout(300);
const n0=await E(()=>__d().S.found.length);await p.click('[data-pk="copper"]');await p.click('[data-pk="tin"]');await p.click('#smelt');await p.waitForTimeout(300);await close();
const r1=await E(()=>{const S=__d().S,i=RMAP[key('copper','tin')];return{has:S.found.includes(i),n:S.found.length,book:$('book').innerHTML.includes(ITEMS.bronze.n),cnt:$('bookCount').textContent,i}});
ok(r1.has&&r1.n===n0+1&&r1.book,`새 레시피(구리+주석=청동) 도감 등록: ${n0}→${r1.n}, ${r1.cnt}`);
await p.click('[data-pk="copper"]');await p.click('[data-pk="tin"]');await p.click('#smelt');await p.waitForTimeout(200);await close();
ok((await E(()=>__d().S.found.length))===r1.n,'같은 레시피는 두 번 등록되지 않음');
const q=await E(i=>{const S=__d().S;S.inv.copper=4;S.inv.tin=4;rqAdd(i);return S.rq.length},r1.i);ok(q>=1,'도감에 오른 레시피는 자동 재련에 맡길 수 있음');
const dup=await E(()=>{const S=__d().S;S.inv.stone=4;S.slots=['stone','stone'];const a=S.found.length;smeltOnce();smeltOnce();return S.found.length-a});ok(dup===1,'다른 새 레시피(돌+돌)도 한 번만 등록: +'+dup);
// 2) 황금 광맥: 채굴 화면에서만
await p.click('[data-tab="market"]');await p.waitForTimeout(200);
const v0=await E(()=>{const S=__d().S;S.vein=null;S.veinT=3;return S.veinT});await p.waitForTimeout(4200);
ok(await E(()=>{const S=__d().S;return !S.vein&&S.veinT===3}),'다른 탭에선 광맥 등장 시간이 흐르지 않음');
await p.click('[data-tab="mine"]');for(let i=0;i<6;i++){await close();await p.waitForTimeout(800)}const v1=await E(()=>!!__d().S.vein);if(!v1)console.log('dbg',await E(()=>({veinT:__d().S.veinT,mp:minePlaying(),tut:__d().S.tutDone,ent:$('entry').hidden})));ok(v1,'채굴 화면에선 시간이 흘러 광맥 등장');
await close();const l1=await E(()=>__d().S.vein.left);await p.click('[data-tab="equip"]');await p.waitForTimeout(3200);const l2=await E(()=>__d().S.vein&&__d().S.vein.left);
ok(l2===l1,`다른 탭에 있는 동안 광맥 남은 시간 멈춤: ${l1}→${l2}`);
await p.click('[data-tab="mine"]');for(let i=0;i<3;i++){await close();await p.waitForTimeout(800)}const l3=await E(()=>__d().S.vein.left);ok(l3<l2,`채굴 화면으로 돌아오면 다시 흐름: ${l2}→${l3}`);
await E(()=>{endVein()});
// 3) 드릴 스위치: 켜 둔 동안과 자리 비운 동안 같은 규칙
const sw=await E(()=>{const S=__d().S;S.auto=3;S.autoOn=true;renderMineHud();return $('autoSt').textContent+' / '+$('autoSub').textContent});ok(/ON/.test(sw)&&/자리 비워도 캐요/.test(sw),'스위치 표시: '+sw);
const off=await E(()=>{const S=__d().S;S.autoOn=false;renderMineHud();const t=$('autoSt').textContent+' / '+$('autoSub').textContent;S.box={};S.hp=layerHp(S.layer);const hp0=S.hp;
  const r=catchUp(3*3600);let ores=0;for(const k in r.ores)ores+=r.ores[k];return{t,ores,drillOff:r.drillOff}});
ok(off.ores===0&&off.drillOff&&/OFF/.test(off.t),`OFF: 자리 비운 3시간 동안 광석 ${off.ores}개, 안내 표시 / ${off.t}`);
const hp1=await E(()=>{const S=__d().S;S.hp=layerHp(S.layer);return S.hp});await p.waitForTimeout(1500);const hp2=await E(()=>__d().S.hp);ok(hp1===hp2,'OFF: 켜 둔 동안에도 드릴이 바위를 안 깸');
const on=await E(()=>{const S=__d().S;S.autoOn=true;S.box={};const r=catchUp(3*3600);let ores=0;for(const k in r.ores)ores+=r.ores[k];return{ores,drillOff:r.drillOff}});ok(on.ores>0&&!on.drillOff,`ON: 자리 비운 3시간 동안 광석 ${on.ores}개`);
// 4) 지층 확률: 고유 광석이 대부분, 위 지층 광석 3~5종
const L=await E(()=>LAYERS.map((L,i)=>{const t=L.drops.reduce((s,x)=>s+x[1],0),own=L.drops.filter(x=>ITEMS[x[0]].L===i+1).reduce((s,x)=>s+x[1],0)/t,pri=L.drops.filter(x=>ITEMS[x[0]].L<i+1).length;return[i+1,Math.round(own*100),pri]}));
ok(L.every(([k,o,pr])=>k===1?o===100:o>=70&&pr>=3&&pr<=5),'지층마다 고유 광석 70% 이상 + 위 지층 3~5종: '+L.map(x=>`B${x[0]} ${x[1]}%+${x[2]}`).join(' '));
await close();await p.click('#oddsBtn');await p.waitForTimeout(300);ok(/확률 보기/.test(await p.textContent('#storyKick')),'확률 보기 창');await close();
console.log('errors',errs);await b.close()})();
