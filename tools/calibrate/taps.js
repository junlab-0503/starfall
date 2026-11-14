// 탭 속도별: 끝까지 시간, 구간별 탭 몫(탭 피해 / 전체 피해), 총 탭 수
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/harness.html');await p.waitForTimeout(200);
const bal=JSON.parse(fs.readFileSync('bal.json','utf8'));
for(const taps of (process.argv[2]||'2.5,1,0.5,0').split(',').map(Number)){
  const r=await p.evaluate(([bal,taps])=>{const out={};let snap=null,share=[];
    for(let h=1;h<=60;h++){const rr=botRun(bal,snap,{type:'E'},h*3600,3,{taps});snap=rr.snap;const tp=tapPower()*taps*(1+2*critP()),au=autoDps();share.push(Math.round(tp/(tp+au)*100));if(rr.endT){out.end=rr.endT;out.u=rr.unlockT;out.s=rr.sectT;break}}
    out.share=share;return out},[bal,taps]);
  const H=x=>x==null?'-':(x/3600).toFixed(1);const end=r.end;
  console.log(`탭 ${taps}/초: 끝 ${H(end)}h · B13 ${H(r.u&&r.u[13])}h · B13 뒤 탑 끝까지 ${end&&r.u?((end-r.u[13])/3600).toFixed(1):'-'}h · 총 탭 ${end?Math.round(taps*end).toLocaleString():'-'}번`);
  console.log('   시간별 탭 몫(%):',r.share.join(' '))}
await b.close()})();
