// 지층 개척 시각 · 탑 구간 완공 시각과 구간 사이 걸린 시간(여러 판 평균)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/harness.html');await p.waitForTimeout(200);
const bal=JSON.parse(fs.readFileSync('bal.json','utf8'));const opt=JSON.parse(process.argv[2]||'{}'),seeds=(process.argv[3]||'1,2,3').split(',').map(Number);
const U={},Sx={};let E=0;
for(const sd of seeds){const r=await p.evaluate(([bal,sd,opt])=>{const r=botRun(bal,null,{type:'E'},3600*60,sd,opt);return{u:r.unlockT,s:r.sectT,e:r.endT}},[bal,sd,opt]);
  for(const k in r.u)(U[k]=U[k]||[]).push(r.u[k]/3600);for(const k in r.s)(Sx[k]=Sx[k]||[]).push(r.s[k]/3600);E+=r.e/3600/seeds.length}
const av=a=>a.reduce((x,y)=>x+y,0)/a.length,f=x=>x<1?Math.round(x*60)+'분':x.toFixed(1)+'h';
let prev=0;console.log('지층: '+Object.keys(U).sort((a,b)=>a-b).map(k=>{const t=av(U[k]),d=t-prev;prev=t;return`B${k} ${f(t)}(+${f(d)})`}).join(' · '));
prev=0;const SN=['대장간 터 1','석조 기단 6','청동 회랑 10','강철 골조 15','은빛 온실 21','수정 첨탑 28','청화 회랑 35','황금 전당 43','용암 성소 52','백금 기관실 62','다이아 전망대 75','달빛 첨탑 88','별의 첨탑 99'];
console.log('탑: '+Object.keys(Sx).sort((a,b)=>a-b).map(k=>{const t=av(Sx[k]),d=t-prev;prev=t;return`${SN[k-1]}층 ${f(t)}(+${f(d)})`}).join(' · '));console.log('끝: '+f(E));await b.close()})();
