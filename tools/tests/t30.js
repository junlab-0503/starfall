// v21 확인: 출입권 사고 바로 팔면 본전(무위험 수익 없음), 재련 실패 땐 레시피가 도감에 안 남음, 플레이 시간은 켜 둔 시간만, 루카 안내에 "많이 사면 값이 올라요" 없음
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();fs.writeFileSync('dbg30.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+fs.readFileSync(process.argv[2],'utf8')+'</body></html>');
const ctx=await b.newContext({...devices['iPhone 13'],locale:'ko-KR'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);await p.goto('file://'+process.cwd()+'/dbg30.html');await p.waitForTimeout(800);
await p.evaluate(()=>{$('titleScr').hidden=true;STQ.length=0;$('story').hidden=true;S.tutDone=true;S.unlocked=6;S.floors=30;refreshBonus()});
// 1) 출입권
const r=await p.evaluate(()=>{const out=[];for(const n of [1,10,50,150]){S.up.bulk=10;const L=3,P=PM(L);P.imp=0;S.gold=1e12;const g0=S.gold;const a=passBuy(L,n);const s=passSell(L,n);out.push({n:a.k,diff:Math.round(S.gold-g0),imp:P.imp})}
  // 섞어서 사고팔기(여러 번 나눠 사고 한꺼번에 팔기 등)
  const L=4,P=PM(L);P.imp=0;S.gold=1e12;const g0=S.gold;for(let i=0;i<10;i++)passBuy(L,7);for(let i=0;i<7;i++)passSell(L,10);passBuy(L,20);passSell(L,999);out.push({mix:Math.round(S.gold-g0),imp:+P.imp.toFixed(9)});return out});
ok(r.slice(0,4).every(x=>Math.abs(x.diff)<=1&&Math.abs(x.imp)<1e-9),'사자마자 팔면 본전: '+r.slice(0,4).map(x=>`${x.n}장 ${x.diff}G`).join(', '));
ok(Math.abs(r[4].mix)<=2,'나눠 사고 팔기를 섞어도 본전: '+r[4].mix+'G');
ok(await p.evaluate(()=>!TENANT_INTRO['루카'].some(c=>/많이 사면|값이 조금씩 올라/.test(c.b))),'루카 안내에 "많이 사면 값이 올라요" 없음');
// 2) 재련 실패 → 레시피 안 남음, 성공 → 남음
const f=await p.evaluate(()=>{const R=Math.random,idx=RMAP[key('copper','tin')];S.found=S.found.filter(i=>i!==idx);S.inv.copper=10;S.inv.tin=10;S.slots=['copper','tin'];
  Math.random=()=>.999;const a=smeltOnce();const f1=S.found.includes(idx);Math.random=()=>.5;const b=smeltOnce();const f2=S.found.includes(idx);Math.random=R;return{a:a.kind,f1,b:b.kind,f2}});
ok(f.a==='bad'&&!f.f1&&f.b==='ok'&&f.f2,`재련 실패(${f.a}) → 레시피 안 남음 ${!f.f1}, 성공(${f.b}) → 남음 ${f.f2}`);
// 3) 플레이 시간: 화면이 켜져 있는 동안만
const t0=await p.evaluate(()=>S.playT);await p.waitForTimeout(2000);const t1=await p.evaluate(()=>S.playT);
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true})});await p.waitForTimeout(1500);const t2=await p.evaluate(()=>S.playT);
await p.evaluate(()=>{delete document.hidden;S.t0=Date.now()-5*3600e3;S.playT=125*60;S.sub='book';setTab('manage')});await p.waitForTimeout(200);
const rec=await p.evaluate(()=>$('records').textContent);
ok(t1-t0>1.5&&t1-t0<2.6&&t2-t1<.2,`켜 둔 2초 동안 +${(t1-t0).toFixed(1)}초, 화면이 꺼진 동안 +${(t2-t1).toFixed(1)}초`);
ok(/2시간 5분/.test(rec),'관리 → 기록: 시작한 지 5시간이어도 켜 둔 시간(2시간 5분)으로 표시');
console.log('errors',errs);await b.close()})();
