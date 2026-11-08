const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/harness.html');await p.waitForTimeout(200);
const r=await p.evaluate(()=>{const out=[];let snap=null;
  for(const h of [1,4,10,20,30,38]){const r=botRun(BAL,snap,{type:'E'},h*3600,7);snap=r.snap;S=JSON.parse(snap.S);MSC=S.msc||1;refreshBonus();DF=snap.DF;
    const L=S.layer,main=LAYERS[L].drops[0][0],c=cap(),b0=bid(main),tot=quote(main,c,-1),hp=layerHp(L);
    out.push({h,B:L+1,cap:c,main:ITEMS[main].n,dumpWarehouse:Math.round((tot/c/b0-1)*100)+'%',box8h:boxCap(),taps:+(hp/(pickPower(S.pick)*BON.tap)).toFixed(1)})}return out});
r.forEach(x=>console.log(JSON.stringify(x)));await b.close()})();
