// 사용: python3 tools/mkharness.py 후 harness.html · bal.json이 있는 폴더에서 node early.js bal.json ['{"pass":true}']
// 처음 2시간: 10분마다 지층 · 탑 층 · 열린 가게 · 골드
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/harness.html');await p.waitForTimeout(200);
const bal=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const opt=JSON.parse(process.argv[3]||'{}');
const rows=await p.evaluate(([bal,opt])=>{const out=[];let snap=null;for(let m=10;m<=120;m+=10){const r=botRun(bal,snap,{type:'E'},m*60,3,opt);snap=r.snap;
  out.push(`${m}분: B${S.unlocked} 탑 ${S.floors}층 · 가게 ${SHOPS.filter((s,i)=>shopOpen(i)).map(s=>s.who).join('·')||'-'} · 곡괭이 ${S.pick} 드릴 ${S.auto} · 골드 ${Math.round(S.gold)}`)}return out},[bal,opt]);
console.log(rows.join('\n'));await b.close()})();
