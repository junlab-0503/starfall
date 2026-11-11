// 사용: python3 tools/mkharness.py 후 harness.html · bal.json이 있는 폴더에서 실행
// 시간별: 골드 · 지층 · 탑 층 · 곡괭이 · 드릴 · 창고, 그리고 다음 목표(개척 · 탑 한 층)에 골드가 모자란지 재료가 모자란지
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/harness.html');await p.waitForTimeout(200);
const bal=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const vein=process.argv[3]!=='vein0';
const rows=await p.evaluate(([bal,vein])=>{const out=[];let snap=null;for(let h=1;h<=34;h++){const r=botRun(bal,snap,{type:'E'},3600*h,3,{vein});snap=r.snap;
  const NL=LAYERS[S.unlocked],fc=towerBlocked()?null:floorCost(S.floors+1);
  const lg=NL?`B${S.unlocked+1}개척 골드 ${(S.gold/NL.req.g*100).toFixed(0)}% 재료 ${reqMet(NL)?'OK':Object.entries(NL.req.items).map(([id,n])=>ITEMS[id].n+' '+Math.min(cnt(id),n)+'/'+n).join(',')}`:'지층 끝';
  const tg=fc?`탑${S.floors+1}층 골드 ${(fc.gold/1e3).toFixed(0)}k 재료 ${canBuild(fc)?'OK':fc.mats.map(([id,q])=>ITEMS[id].n+' '+Math.min(cnt(id),q)+'/'+q).join(',')}`:'탑 끝';
  out.push(`${h}h 골드 ${(S.gold/1e6).toFixed(2)}M  B${S.unlocked} 탑${S.floors} 곡${S.pick} 드릴${S.auto} 창고${S.wh} 용광로${S.furnace} | ${lg} | ${tg} | 곡괭이다음 ${(pickCost(S.pick)/1e6).toFixed(2)}M 드릴다음 ${(autoCost(S.auto)/1e6).toFixed(2)}M`);if(r.endT)break}return out},[bal,vein]);
console.log(rows.join('\n'));await b.close()})();
