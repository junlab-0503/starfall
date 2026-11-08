const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/harness.html');await p.waitForTimeout(200);
const r=await p.evaluate(()=>botRun(BAL,null,{type:'E'},3600*75,7));const H=x=>x==null?'-':(x/3600).toFixed(1);
console.log('END',H(r.endT),JSON.stringify(r.final));console.log('L',Object.entries(r.unlockT).map(([k,v])=>k+':'+H(v)).join(' '));console.log('S',Object.entries(r.sectT).map(([k,v])=>k+':'+H(v)).join(' '));await b.close()})();
