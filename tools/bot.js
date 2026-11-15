/* ═════════ 밸런스용 자동 플레이 봇 (게임에는 안 들어감) ═════════ */
function botRun(bal,snap,stop,maxSec,seed,opt){opt=opt||{};let passG=0,veinG=0,veinN=0;
  Object.assign(BAL,JSON.parse(JSON.stringify(bal)));applyBal();
  let rs=snap?snap.rs:seed>>>0;Math.random=()=>{rs=(rs+0x6D2B79F5)>>>0;let t=rs;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
  window.story=()=>{};window.toast=()=>{};window.renderAll=()=>{};window.renderTab=()=>{};window.renderLog=()=>{};window.renderMineHud=()=>{};window.renderLayers=()=>{};window.renderForge=()=>{};window.renderBook=()=>{};window.renderHeader=()=>{};
  window.revealJournal=i=>{if(!S.journal.includes(i))S.journal.push(i)};
  let gamIn=0,gamOut=0,gamN=0,gamWin=0,gamMax=0,rentG=0,t=0,endT=null,lost=0,gIncome=0,unlockT={},sectT={},tf=0,RS={};const TAPS=opt.taps??2.5,log=[];
  if(snap){S=JSON.parse(snap.S);t=snap.t;tf=snap.tf||0;RS=snap.RS||{};unlockT=snap.unlockT;sectT=snap.sectT;lost=snap.lost;endT=snap.endT;refreshBonus()}
  else{S=fresh();S.prologue=true;S.tutDone=true;S.legacy=1;S.gold+=LEGACY.gold;S.auto=LEGACY.auto;S.autoOn=true;refreshBonus();S.hp=layerHp(0);for(let i=0;i<120;i++)tickMarket(2,true)}
  const recipeOf={};RECIPES.forEach((r,i)=>recipeOf[r.out]=i);
  // 캔 광석: 창고에, 넘치면 드릴 몫은 판매(로봇 보관함 → 넘침 판매를 한 번에), 탭 몫은 버려짐. 쇠맥 찾기 · 보석 눈썰미 포함
  function mine(d,auto){S.hp-=d;const L=S.layer,hp=layerHp(L);let n=0;while(S.hp<=0&&n<5000){S.hp+=hp;n++;rumorClue(L);const id=rollDrop(L),k=1+(Math.random()<extraP(ITEMS[id].s)?1:0);S.mined+=k;MR_ACC+=bid(id)*k;const ok=Math.min(k,space());if(ok)add(id,ok);if(k>ok){if(auto)sellOverflow(id,k-ok);else lost+=k-ok}}}
  function needs(){const N={},a=(id,q)=>N[id]=(N[id]||0)+q;const L=LAYERS[S.unlocked];if(L&&L.req)for(const[id,n]of Object.entries(L.req.items))a(id,n);
    if(!towerBlocked())for(let k=1;k<=1;k++)floorCost(S.floors+k).mats.forEach(([id,q])=>a(id,q));
    if(S.unlocked>=13){a('philo',1);a('starshard',10)}
    const T={...N},Q=Object.keys(N);for(let i=0;i<Q.length&&i<400;i++){const id=Q[i];const def=Math.max(0,(T[id]||0)-cnt(id));if(!def||!INS[id])continue;const[x,y]=INS[id],m=Math.ceil(def*1.2);
      if(x===y){T[x]=(T[x]||0)+2*m;Q.push(x)}else{T[x]=(T[x]||0)+m;T[y]=(T[y]||0)+m;Q.push(x,y)}}
    return T}
  function craft(out,n){const r=RECIPES[recipeOf[out]];if(!r||r.L>S.unlocked)return 0;let k=0;S.slots=[r.a,r.b];while(k<n&&canSmeltWith(S.slots)){smeltOnce();k++}S.slots=[null,null];return k}
  // 소문 읽기: 출처 적중 기록 + 정보원 감정 + 다른 사람의 같은 말 + 캐면서 나온 단서로 진짜일 확률을 어림잡는다
  const SZ=RUM_SIZE.map(R=>[(R.up[0]+R.up[1])/2,(R.dn[0]+R.dn[1])/2]);   // 크기별 평균 오름폭 · 내림폭
  function pTrue(r){const rec=S.srcRec[r.src]||{h:0,n:0};let o=(rec.h+1.5)/(rec.n-rec.h+1.5);
    const acc=intelAcc(S.intel);if(r.hint!=null&&acc)o*=r.hint?acc/(1-acc):(1-acc)/acc;
    const mins=r.t/60;o*=Math.pow(4,r.echo.length)*Math.exp(-.135*mins);const b=r.brk||0;o*=Math.pow(.03/.0075,r.clue)*Math.pow(.97/.9925,b-r.clue);return o/(1+o)}
  function passTrade(){const held=new Set(Object.keys(S.pass).map(Number));
    // 발표가 끝난 지층은 바로 판다
    for(const i of held)if(!S.rum.some(r=>r.L===i)){const c=S.pass[i].c,r=passSell(i,999);passG+=r.gain||0;const d=S.rumDone.find(x=>x.L===i);(window.PT=window.PT||[]).push({L:i,ret:r.gain/c,truth:d&&d.truth,ch:d&&d.ch,stake:c,inc:S.earned})}
    for(const r of S.rum){const p=pTrue(r),[up,dn]=SZ[r.size],m=PM(r.L).m/r.m0,ev=r.good?(p*(1+up)+(1-p)*(1-dn*.5))/m:(p*(1-dn*1.1)+(1-p)*(1+dn*.4))/m,f=r.t/r.dur;
      if(ev>1.06&&f<.85){const av=ev>1.15?S.gold*.95:Math.max(0,S.gold-tf*.5)*.9,n=Math.floor(av/passPrice(r.L));if(n>0){const x=passBuy(r.L,n);if(x.t>S.gold-tf)tf=Math.max(0,S.gold)}}
      else if(ev<.99&&passHeld(r.L)){const x=passSell(r.L,999);passG+=x.gain||0}}}
  function decide(){
    const g0=S.gold;if(S.rentAcc>=1){S.gold+=S.rentAcc;rentG+=S.rentAcc;S.rentAcc=0}
    const T=needs();
    // 필요한 합성품 만들기 (얕은 것부터)
    for(let pass=0;pass<4;pass++)Object.keys(T).filter(id=>INS[id]).sort((a,b)=>ITEMS[a]._L-ITEMS[b]._L||ITEMS[a].p-ITEMS[b].p).forEach(id=>{const def=T[id]-cnt(id);if(def>0)craft(id,Math.ceil(def*1.1))});
    // 남는 재료로 이득이 나는 합성
    RECIPES.forEach(r=>{if(r.L>S.unlocked||r.out==='philo')return;const sa=cnt(r.a)-(T[r.a]||0),sb=cnt(r.b)-(T[r.b]||0);const avail=r.a===r.b?Math.floor(sa/2):Math.min(sa,sb);if(avail<=0)return;
      const ev=bid(r.out)*(successRate()+greatRate()),cost=bid(r.a)+bid(r.b);if(ev>cost*1.15)craft(r.out,avail)});
    // 세공 도박(opt.gamble=목표 단계): B4부터 남는 은괴 · 금괴 · 별빛강을 전부 세공품으로 → 목표까지 두드리고 판매(실패하면 잃음)
    if(opt.gamble&&S.unlocked>=4)for(const K of CRAFT_KINDS){const sur=cnt(K.mat)-(T[K.mat]||0);if(sur<=0)continue;const base=bid(K.mat)*sur;add(K.mat,-sur);gamIn+=base;gamN++;
      let lv=0,alive=true;while(lv<opt.gamble){if(Math.random()<CRAFT_P[lv+1])lv++;else{alive=false;break}}
      if(alive){const g=base*CRAFT_M[lv];S.gold+=g;S.earned+=g;gamOut+=g;gamMax=Math.max(gamMax,g/Math.max(1,base));gamWin++}}
    // 공격적인 세공 도박(opt.allin={to:목표 단계, frac:골드 비율}): B4부터 20분마다 가장 비싼 막대(은괴/금괴/별빛강, 연 지층까지)를 장터에서 사서 한 덩어리로 세공 → 목표까지 → 판매
    if(opt.allin&&S.unlocked>=4&&t>=(RS._bet||0)){RS._bet=t+1200;const ks=CRAFT_KINDS.filter(K=>{const r=RECIPES.find(r=>r.out===K.mat);return r&&r.L<=S.unlocked});const K=ks[ks.length-1];
      const n=Math.max(0,Math.min(Math.floor(S.gold*opt.allin.frac/ask(K.mat)),space()));if(n>0){const b0=S.gold;buy(K.mat,n);const spent=b0-S.gold,base=bid(K.mat)*n;add(K.mat,-n);gamIn+=spent;gamN++;
        let lv=0,alive=true;while(lv<opt.allin.to){if(Math.random()<CRAFT_P[lv+1])lv++;else{alive=false;break}}
        if(alive){const g=base*CRAFT_M[lv];S.gold+=g;S.earned+=g;gamOut+=g;gamWin++}}}
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
      if(!did)for(const k of ['crit','haggle','metal','gem','bulk','refiner','great','autosell',...(opt.noVheat?[]:['vheat']),...(opt.pass?['intel']:[])])if(!upMax(k)&&upCost(k)<av*.12){buyUp(k);did=true;break}
      if(!did)break}
    // 탑
    // 확신이 큰 소문이 돌고 있으면 탑 짓기를 잠깐 미루고 돈을 굴린다
    let b=0;const hot=opt.pass&&S.rum.some(r=>{const p=pTrue(r),[up,dn]=SZ[r.size];return r.good&&r.t<r.dur*.85&&p*(1+up)+(1-p)*(1-dn*.5)>1.15});
    // 지층을 다 연 뒤엔 더 모을 곳이 없으니 남는 골드를 모두 탑에 (opt.greedy===false면 예전처럼 번 돈의 45%만)
    if(opt.greedy!==false&&S.unlocked>=LAYERS.length)tf=S.gold;
    while(!hot&&b<300&&!towerBlocked()){const c=floorCost(S.floors+1);if(!canBuild(c)||tf<c.gold)break;tf-=c.gold;buildFloor(true);b++;SECTIONS.forEach((s,i)=>{if(S.floors>=s.to&&sectT[i+1]==null)sectT[i+1]=t})}
    if(!towerBlocked()&&!(opt.greedy!==false&&S.unlocked>=LAYERS.length)){const fg=floorCost(S.floors+1).gold;if(tf>fg*4)tf=fg*4}
    // 엔딩
    if(S.floors>=99&&!endT){if(cnt('philo')<1)craft('philo',1);if(cnt('philo')>=1&&cnt('starshard')>=10)endT=t}
  }
  const hitF=()=>stop.type==='L'?unlockT[stop.k]!=null:stop.type==='S'?sectT[stop.k]!=null:endT!=null;
  let hit=hitF();
  // opt.sess=[[켜 둔 분, 비운 분],...]: 짧게 여러 번 접속하는 사람. 비운 동안은 게임의 catchUp(자리 비움 보상)으로 계산하고, 다시 켜면 보관함 광석을 창고로(넘치면 판매)
  let wall=snap&&snap.wall||t,si=0,sOn=0,endW=null;
  // opt.ads={gift:하루 선물 상자 수, boost:하루 채굴 2배(10분) 수}: 접속(세션)마다 하루로 쳐서 선물은 그 자리에서 받고, 2배는 켜 둔 동안 앞에서부터 이어서 씀
  let boostSec=0,adG=0;const adsDayStart=()=>{if(!opt.ads)return;for(let i=0;i<(opt.ads.gift||0);i++){const x=giftGold();S.gold+=x;S.earned+=x;adG+=x}boostSec=(opt.ads.boost||0)*600};if(!snap)adsDayStart();
  while(t<maxSec&&!hit){
    {const rate=(tapPower()*TAPS*(1+2*critP())+autoDps())/layerHp(S.layer),k=S.layer+1,o=RS[k]||(RS[k]={n:0,r:0,f:0});o.n++;o.r+=rate;o.f+=cap()/Math.max(rate,1e-6)/60}
    // 황금 광맥(게임과 같은 규칙, opt.vein===false면 끔): 채굴 화면에서 8~14분마다 45초. 그동안은 광석 대신 골드만
    // 탭 1번 = pot×VEIN_K.tap, 드릴 0.25초마다 pot×VEIN_K.drill, 상한 없음 (pot = 지금 채굴 수입 4분치)
    if(S.vein){const v=S.vein,add=Math.round(v.pot*(TAPS*VEIN_K.tap+(S.auto>0&&S.autoOn?4*VEIN_K.drill:0)));if(add>0){v.got+=add;S.gold+=add;S.earned+=add;veinG+=add;MR_ACC+=add}if(--v.left<=0)S.vein=null}
    else{if(space()>0)mine(tapPower()*TAPS*(1+2*critP()),false);if(S.auto>0)mine(autoDps(),true);
      if(opt.vein!==false&&(S.veinT-=1)<=0){S.vein={left:veinSec(),pot:Math.max(100,Math.round(playIncome()*240)),got:0};S.veinT=(480+Math.random()*360)*(BON.veinFast||1);veinN++}}
    tickMarket(1,false);mrTick();S.rentAcc+=rentPerSec();if(opt.ads){S.ads.boostUntil=boostSec>0?Infinity:0;if(boostSec>0)boostSec--}
    t++;wall++;if(t%10===0){decide();hit=hitF()}
    if(opt.sess&&++sOn>=opt.sess[si%opt.sess.length][0]*60){const off=opt.sess[si%opt.sess.length][1]*60;si++;sOn=0;wall+=off;S.vein=null;S.ads.boostUntil=0;boostSec=0;
      if(catchUp(off)){for(const id in S.box){const n=S.box[id],ok=Math.min(n,space());if(ok)add(id,ok);if(n>ok)sellOverflow(id,n-ok)}S.box={}}adsDayStart();decide();hit=hitF()}
    if(endT!=null&&endW==null)endW=wall;
    if(t%3600===0)log.push({h:t/3600,gold:Math.round(S.gold),L:S.unlocked,fl:S.floors,pick:S.pick,auto:S.auto,wh:S.wh});
  }
  return{gam:{in:Math.round(gamIn),out:Math.round(gamOut),n:gamN,win:gamWin},inc:{sale:Math.round(gIncome+(S.ofG||0)),vein:Math.round(veinG),rent:Math.round(rentG),pass:Math.round(passG),gift:Math.round(adG)},veinG,veinN,RS,hit,wall,endW,snap:{S:JSON.stringify(S),rs,t,tf,RS,unlockT,sectT,lost,endT,wall},unlockT,sectT,endT,t,lost,log,passG:Math.round(passG),final:{L:S.unlocked,fl:S.floors,pick:S.pick,auto:S.auto,wh:S.wh,furn:S.furnace,gold:Math.round(S.gold)}};
}
