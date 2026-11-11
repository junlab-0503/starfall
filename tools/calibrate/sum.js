// 사용: python3 tools/mkharness.py 후 harness.html · bal.json이 있는 폴더에서 실행
// 요약: 한 방식으로 여러 판 → 끝까지 시간 · B13 · 남은 골드 · 광맥 몫
// 사용: node sum.js bal.json '{"vein":true}' 1,2,3,4
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.cwd()+'/harness.html');await p.waitForTimeout(200);
const bal=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),opt=JSON.parse(process.argv[3]||'{}'),seeds=(process.argv[4]||'1,2,3,4').split(',').map(Number),out=[];
for(const seed of seeds){const r=await p.evaluate(([bal,seed,opt])=>{const r=botRun(bal,null,{type:'E'},3600*80,seed,opt);return{e:r.endT,b13:r.unlockT[13],g:r.final.gold,veinG:r.veinG,earned:S.earned,passG:r.passG,pick:r.final.pick,auto:r.final.auto}},[bal,seed,opt]);out.push(r)}
const H=x=>x==null?'-':(x/3600).toFixed(1);
console.log(process.argv[3]||'{}',out.map(r=>`END ${H(r.e)}h(B13 ${H(r.b13)}h, 남은 골드 ${(r.g/1e6).toFixed(1)}M, 광맥 ${(r.veinG/r.earned*100).toFixed(0)}%${r.passG?`, 출입권 ${(r.passG/1e6).toFixed(0)}M`:''}, 곡${r.pick} 드릴${r.auto})`).join(' | '));
if(errs.length)console.log(errs);await b.close()})();
