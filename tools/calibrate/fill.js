const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/harness.html');await p.waitForTimeout(200);
const rows=await p.evaluate(()=>{const out=[];let snap=null;
  for(const h of [0.25,0.5,1,2,4,6,8,10,13,16,20,24,28,32,36,39]){const r=botRun(BAL,snap,{type:'E'},h*3600,7);snap=r.snap;
    S=JSON.parse(snap.S);MSC=S.msc||1;refreshBonus();const L=S.layer,hp=layerHp(L),tap=pickPower(S.pick)*BON.tap*2.5/hp,auto=S.auto*pickPower(S.pick)*BAL.autoEff*BON.auto/hp;
    out.push({h,L:L+1,pick:S.pick,auto:S.auto,wh:S.wh,cap:cap(),tapRate:+tap.toFixed(2),autoRate:+auto.toFixed(2),fillAll:+(cap()/(tap+auto)/60).toFixed(1),fillAuto:auto>0?+(cap()/auto/60).toFixed(1):null,cap5:capOf(S.wh+3),offline8h:Math.round(auto*.4*8*3600)})}
  return out});
console.log('시간 지층 곡괭이 드릴 창고Lv 창고칸 | 초당(탭) 초당(드릴) | 가득(탭+드릴,분) 가득(드릴만,분) | 창고+3레벨 | 현재 오프라인8h');
rows.forEach(r=>console.log([r.h+'h','B'+r.L,r.pick,r.auto,r.wh,r.cap,'|',r.tapRate,r.autoRate,'|',r.fillAll,r.fillAuto,'|',r.cap5,'|',r.offline8h].join(' ')));
await b.close()})();
