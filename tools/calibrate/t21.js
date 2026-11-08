const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/harness.html');await p.waitForTimeout(200);
const r=await p.evaluate(()=>{const out=[];let snap=null;for(const h of [1,10,30]){const r=botRun(BAL,snap,{type:'E'},h*3600,7);snap=r.snap;S=JSON.parse(snap.S);MSC=S.msc||1;refreshBonus();S.box={};S.autoOn=true;
  const rate=playRate(),c=catchUp(8*3600),n=Object.values(c.ores).reduce((a,b)=>a+b,0);out.push({h,B:S.layer+1,rate:+rate.toFixed(2),offline8h:n,equivMin:Math.round(n/rate/60),cap:cap()})}return out});
r.forEach(x=>console.log(JSON.stringify(x)));await b.close()})();
