/* ═════════ 밸런스용 자동 플레이 봇 (게임에는 안 들어감) ═════════ */
function botRun(bal,snap,stop,maxSec,seed){
  Object.assign(BAL,JSON.parse(JSON.stringify(bal)));applyBal();
  let rs=snap?snap.rs:seed>>>0;Math.random=()=>{rs=(rs+0x6D2B79F5)>>>0;let t=rs;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
  window.story=()=>{};window.toast=()=>{};window.renderAll=()=>{};window.renderTab=()=>{};window.renderLog=()=>{};window.renderMineHud=()=>{};window.renderLayers=()=>{};window.renderForge=()=>{};window.renderBook=()=>{};window.renderHeader=()=>{};
  window.revealJournal=i=>{if(!S.journal.includes(i))S.journal.push(i)};
  let t=0,endT=null,lost=0,gIncome=0,unlockT={},sectT={},tf=0,RS={};const TAPS=2.5,log=[];
  if(snap){S=JSON.parse(snap.S);MSC=S.msc||1;DF=snap.DF;t=snap.t;tf=snap.tf||0;RS=snap.RS||{};unlockT=snap.unlockT;sectT=snap.sectT;lost=snap.lost;endT=snap.endT;refreshBonus()}
  else{S=fresh();S.prologue=true;S.ads.giftAt=1e15;H={};refreshBonus();DF={};S.hp=layerHp(0);for(let i=0;i<120;i++)tickMarket(2,true)}
  const recipeOf={};RECIPES.forEach((r,i)=>recipeOf[r.out]=i);
  function mine(d){S.hp-=d;const L=S.layer,hp=layerHp(L);let n=0;while(S.hp<=0&&n<5000){S.hp+=hp;n++;const id=rollDrop(L);S.mined++;if(space()>0)add(id,1);else lost++}}
  function needs(){const N={},a=(id,q)=>N[id]=(N[id]||0)+q;const L=LAYERS[S.unlocked];if(L&&L.req)for(const[id,n]of Object.entries(L.req.items))a(id,n);
    if(!towerBlocked())for(let k=1;k<=1;k++)floorCost(S.floors+k).mats.forEach(([id,q])=>a(id,q));
    if(S.unlocked>=13){a('philo',1);a('starshard',10)}
    const T={...N},Q=Object.keys(N);for(let i=0;i<Q.length&&i<400;i++){const id=Q[i];const def=Math.max(0,(T[id]||0)-cnt(id));if(!def||!INS[id])continue;const[x,y]=INS[id],m=Math.ceil(def*1.2);
      if(x===y){T[x]=(T[x]||0)+2*m;Q.push(x)}else{T[x]=(T[x]||0)+m;T[y]=(T[y]||0)+m;Q.push(x,y)}}
    return T}
  function craft(out,n){const r=RECIPES[recipeOf[out]];if(!r||r.L>S.unlocked)return 0;let k=0;S.slots=[r.a,r.b];while(k<n&&canSmeltWith(S.slots)){smeltOnce();k++}S.slots=[null,null];return k}
  function decide(){
    const g0=S.gold;if(S.rentAcc>=1){S.gold+=S.rentAcc;S.rentAcc=0}
    const T=needs();
    // 필요한 합성품 만들기 (얕은 것부터)
    for(let pass=0;pass<4;pass++)Object.keys(T).filter(id=>INS[id]).sort((a,b)=>ITEMS[a]._L-ITEMS[b]._L||ITEMS[a].p-ITEMS[b].p).forEach(id=>{const def=T[id]-cnt(id);if(def>0)craft(id,Math.ceil(def*1.1))});
    // 남는 재료로 이득이 나는 합성
    RECIPES.forEach(r=>{if(r.L>S.unlocked||r.out==='philo')return;const sa=cnt(r.a)-(T[r.a]||0),sb=cnt(r.b)-(T[r.b]||0);const avail=r.a===r.b?Math.floor(sa/2):Math.min(sa,sb);if(avail<=0)return;
      const ev=bid(r.out)*(successRate()+greatRate()),cost=bid(r.a)+bid(r.b);if(ev>cost*1.15)craft(r.out,avail)});
    // 남는 것 팔기
    ORDER.forEach(id=>{const sur=cnt(id)-(T[id]||0);if(sur>0){const g0=S.gold;sell(id,sur);gIncome+=S.gold-g0}});
    // 모자란 원석은 장터에서 사기
    Object.keys(T).filter(id=>!INS[id]&&ITEMS[id].L<=S.unlocked).forEach(id=>{const def=T[id]-cnt(id);if(def>0&&ask(id)*def<S.gold*.35)buy(id,def)});
    for(let pass=0;pass<3;pass++)Object.keys(T).filter(id=>INS[id]).sort((a,b)=>ITEMS[a]._L-ITEMS[b]._L||ITEMS[a].p-ITEMS[b].p).forEach(id=>{const def=T[id]-cnt(id);if(def>0)craft(id,Math.ceil(def*1.1))});
    const earned=Math.max(0,S.gold-g0);tf=Math.min(S.gold,tf+earned*.45);
    // 지층 개척
    const NL=LAYERS[S.unlocked];if(NL&&reqMet(NL)&&S.gold-tf>=NL.req.g){S.gold-=NL.req.g;Object.entries(NL.req.items).forEach(([id,n])=>add(id,-n));S.unlocked++;S.layer=S.unlocked-1;S.hp=layerHp(S.layer);unlockT[S.unlocked]=t}
    // 장비
    for(let k=0;k<30;k++){let did=false;
      const av=S.gold-tf;
      if(pickCost(S.pick)<av*.2){S.gold-=pickCost(S.pick);S.pick++;did=true}
      else if(autoCost(S.auto)<av*.2){S.gold-=autoCost(S.auto);S.auto++;did=true}
      else if(S.furnace<5&&furnCost(S.furnace)<av*.1){S.gold-=furnCost(S.furnace);S.furnace++;did=true}
      else if(cap()/Math.max(.01,(tapPower()*TAPS+autoDps())/layerHp(S.layer))<1200&&whCost(S.wh)<av*.4){S.gold-=whCost(S.wh);S.wh++;did=true}
      if(!did)break}
    // 탑
    let b=0;
    while(b<300&&!towerBlocked()){const c=floorCost(S.floors+1);if(!canBuild(c)||tf<c.gold)break;tf-=c.gold;buildFloor(true);b++;SECTIONS.forEach((s,i)=>{if(S.floors>=s.to&&sectT[i+1]==null)sectT[i+1]=t})}
    if(!towerBlocked()){const fg=floorCost(S.floors+1).gold;if(tf>fg*4)tf=fg*4}
    // 엔딩
    if(S.floors>=99&&!endT){if(cnt('philo')<1)craft('philo',1);if(cnt('philo')>=1&&cnt('starshard')>=10)endT=t}
  }
  const hitF=()=>stop.type==='L'?unlockT[stop.k]!=null:stop.type==='S'?sectT[stop.k]!=null:endT!=null;
  let hit=hitF();
  while(t<maxSec&&!hit){
    {const rate=(tapPower()*TAPS+autoDps())/layerHp(S.layer),k=S.layer+1,o=RS[k]||(RS[k]={n:0,r:0,f:0});o.n++;o.r+=rate;o.f+=cap()/Math.max(rate,1e-6)/60}
    if(space()>0){mine(tapPower()*TAPS);if(S.auto>0)mine(autoDps())}
    tickMarket(1,true);S.rentAcc+=rentPerSec();
    t++;if(t%10===0){decide();hit=hitF()}
    if(t%3600===0)log.push({h:t/3600,gold:Math.round(S.gold),L:S.unlocked,fl:S.floors,pick:S.pick,auto:S.auto,wh:S.wh});
  }
  return{RS,hit,snap:{S:JSON.stringify(S),DF,rs,t,tf,RS,unlockT,sectT,lost,endT},unlockT,sectT,endT,t,lost,log,final:{L:S.unlocked,fl:S.floors,pick:S.pick,auto:S.auto,wh:S.wh,furn:S.furnace,gold:Math.round(S.gold)}};
}
