/* ═════════ 밸런스용 자동 플레이 봇 (게임에는 안 들어감) ═════════ */
function botRun(bal,snap,stop,maxSec,seed,opt){opt=opt||{};let passG=0;
  Object.assign(BAL,JSON.parse(JSON.stringify(bal)));applyBal();
  let rs=snap?snap.rs:seed>>>0;Math.random=()=>{rs=(rs+0x6D2B79F5)>>>0;let t=rs;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
  window.story=()=>{};window.toast=()=>{};window.renderAll=()=>{};window.renderTab=()=>{};window.renderLog=()=>{};window.renderMineHud=()=>{};window.renderLayers=()=>{};window.renderForge=()=>{};window.renderBook=()=>{};window.renderHeader=()=>{};
  window.revealJournal=i=>{if(!S.journal.includes(i))S.journal.push(i)};
  let t=0,endT=null,lost=0,gIncome=0,unlockT={},sectT={},tf=0,RS={};const TAPS=2.5,log=[];
  if(snap){S=JSON.parse(snap.S);t=snap.t;tf=snap.tf||0;RS=snap.RS||{};unlockT=snap.unlockT;sectT=snap.sectT;lost=snap.lost;endT=snap.endT;refreshBonus()}
  else{S=fresh();S.prologue=true;S.tutDone=true;S.legacy=1;S.gold+=LEGACY.gold;S.auto=LEGACY.auto;S.autoOn=true;refreshBonus();S.hp=layerHp(0);for(let i=0;i<120;i++)tickMarket(2,true)}
  const recipeOf={};RECIPES.forEach((r,i)=>recipeOf[r.out]=i);
  // 캔 광석: 창고에, 넘치면 드릴 몫은 판매(로봇 보관함 → 넘침 판매를 한 번에), 탭 몫은 버려짐. 쇠맥 찾기 · 보석 눈썰미 포함
  function mine(d,auto){S.hp-=d;const L=S.layer,hp=layerHp(L);let n=0;while(S.hp<=0&&n<5000){S.hp+=hp;n++;rumorClue(L);const id=rollDrop(L),k=1+(Math.random()<extraP(ITEMS[id].s)?1:0);S.mined+=k;const ok=Math.min(k,space());if(ok)add(id,ok);if(k>ok){if(auto)sellOverflow(id,k-ok);else lost+=k-ok}}}
  function needs(){const N={},a=(id,q)=>N[id]=(N[id]||0)+q;const L=LAYERS[S.unlocked];if(L&&L.req)for(const[id,n]of Object.entries(L.req.items))a(id,n);
    if(!towerBlocked())for(let k=1;k<=1;k++)floorCost(S.floors+k).mats.forEach(([id,q])=>a(id,q));
    if(S.unlocked>=13){a('philo',1);a('starshard',10)}
    const T={...N},Q=Object.keys(N);for(let i=0;i<Q.length&&i<400;i++){const id=Q[i];const def=Math.max(0,(T[id]||0)-cnt(id));if(!def||!INS[id])continue;const[x,y]=INS[id],m=Math.ceil(def*1.2);
      if(x===y){T[x]=(T[x]||0)+2*m;Q.push(x)}else{T[x]=(T[x]||0)+m;T[y]=(T[y]||0)+m;Q.push(x,y)}}
    return T}
  function craft(out,n){const r=RECIPES[recipeOf[out]];if(!r||r.L>S.unlocked)return 0;let k=0;S.slots=[r.a,r.b];while(k<n&&canSmeltWith(S.slots)){smeltOnce();k++}S.slots=[null,null];return k}
  // 소문 읽기: 출처 적중 기록 + 정보원 감정 + 다른 사람의 같은 말 + 캐면서 나온 단서로 진짜일 확률을 어림잡는다
  const SZ=[[.3,.15],[.7,.275],[1.25,.45]];
  function pTrue(r){const rec=S.srcRec[r.src]||{h:0,n:0};let o=(rec.h+1.5)/(rec.n-rec.h+1.5);
    const acc=BON.perfectIntel?.99:[0,.75,.88,.97][Math.min(S.intel,3)];if(r.hint!=null&&acc)o*=r.hint?acc/(1-acc):(1-acc)/acc;
    const mins=r.t/60;o*=Math.pow(4,r.echo.length)*Math.exp(-.06*mins);const b=r.brk||0;o*=Math.pow(.012/.003,r.clue)*Math.pow(.988/.997,b-r.clue);return o/(1+o)}
  function passTrade(){const held=new Set(Object.keys(S.pass).map(Number));
    // 발표가 끝난 지층은 바로 판다
    for(const i of held)if(!S.rum.some(r=>r.L===i)){const c=S.pass[i].c,r=passSell(i,999);passG+=r.gain||0;const d=S.rumDone.find(x=>x.L===i);(window.PT=window.PT||[]).push({L:i,ret:r.gain/c,truth:d&&d.truth,ch:d&&d.ch,stake:c,inc:S.earned})}
    for(const r of S.rum){const p=pTrue(r),[up,dn]=SZ[r.size],m=PM(r.L).m/r.m0,ev=r.good?(p*(1+up)+(1-p)*(1-dn*.5))/m:(p*(1-up*.5)+(1-p)*(1+dn*.3))/m,f=r.t/r.dur;
      if(ev>1.06&&f<.85){const av=ev>1.15?S.gold*.95:Math.max(0,S.gold-tf*.5)*.9,n=Math.floor(av/passPrice(r.L));if(n>0){const x=passBuy(r.L,n);if(x.t>S.gold-tf)tf=Math.max(0,S.gold)}}
      else if(ev<.99&&passHeld(r.L)){const x=passSell(r.L,999);passG+=x.gain||0}}}
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
    if(opt.pass)passTrade();
    const earned=Math.max(0,S.gold-g0);tf=Math.min(S.gold,tf+earned*.45);
    // 지층 개척
    const NL=LAYERS[S.unlocked];if(NL&&reqMet(NL)&&S.gold-tf>=NL.req.g){S.gold-=NL.req.g;Object.entries(NL.req.items).forEach(([id,n])=>add(id,-n));S.unlocked++;S.layer=S.unlocked-1;S.hp=layerHp(S.layer);unlockT[S.unlocked]=t}
    // 장비
    for(let k=0;k<30;k++){let did=false;
      const av=S.gold-tf;
      if(upOpen('pick')&&pickCost(S.pick)<av*.2){S.gold-=pickCost(S.pick);S.pick++;did=true}
      else if(upOpen('auto')&&autoCost(S.auto)<av*.2){S.gold-=autoCost(S.auto);S.auto++;did=true}
      else if(upOpen('furn')&&S.furnace<5&&furnCost(S.furnace)<av*.1){S.gold-=furnCost(S.furnace);S.furnace++;did=true}
      else if(cap()/Math.max(.01,(tapPower()*TAPS+autoDps())/layerHp(S.layer))<1200&&upOpen('wh')&&whCost(S.wh)<av*.4){S.gold-=whCost(S.wh);S.wh++;did=true}
      if(!did)for(const k of ['crit','haggle','metal','gem','bulk','refiner','great','autosell'])if(!upMax(k)&&upCost(k)<av*.12){buyUp(k);did=true;break}
      if(!did)break}
    // 탑
    // 확신이 큰 소문이 돌고 있으면 탑 짓기를 잠깐 미루고 돈을 굴린다
    let b=0;const hot=opt.pass&&S.rum.some(r=>{const p=pTrue(r),[up,dn]=SZ[r.size];return r.good&&r.t<r.dur*.85&&p*(1+up)+(1-p)*(1-dn*.5)>1.15});
    while(!hot&&b<300&&!towerBlocked()){const c=floorCost(S.floors+1);if(!canBuild(c)||tf<c.gold)break;tf-=c.gold;buildFloor(true);b++;SECTIONS.forEach((s,i)=>{if(S.floors>=s.to&&sectT[i+1]==null)sectT[i+1]=t})}
    if(!towerBlocked()){const fg=floorCost(S.floors+1).gold;if(tf>fg*4)tf=fg*4}
    // 엔딩
    if(S.floors>=99&&!endT){if(cnt('philo')<1)craft('philo',1);if(cnt('philo')>=1&&cnt('starshard')>=10)endT=t}
  }
  const hitF=()=>stop.type==='L'?unlockT[stop.k]!=null:stop.type==='S'?sectT[stop.k]!=null:endT!=null;
  let hit=hitF();
  while(t<maxSec&&!hit){
    {const rate=(tapPower()*TAPS*(1+2*critP())+autoDps())/layerHp(S.layer),k=S.layer+1,o=RS[k]||(RS[k]={n:0,r:0,f:0});o.n++;o.r+=rate;o.f+=cap()/Math.max(rate,1e-6)/60}
    if(space()>0)mine(tapPower()*TAPS*(1+2*critP()),false);if(S.auto>0)mine(autoDps(),true)
    tickMarket(1,false);S.rentAcc+=rentPerSec();
    t++;if(t%10===0){decide();hit=hitF()}
    if(t%3600===0)log.push({h:t/3600,gold:Math.round(S.gold),L:S.unlocked,fl:S.floors,pick:S.pick,auto:S.auto,wh:S.wh});
  }
  return{RS,hit,snap:{S:JSON.stringify(S),rs,t,tf,RS,unlockT,sectT,lost,endT},unlockT,sectT,endT,t,lost,log,passG:Math.round(passG),final:{L:S.unlocked,fl:S.floors,pick:S.pick,auto:S.auto,wh:S.wh,furn:S.furnace,gold:Math.round(S.gold)}};
}
