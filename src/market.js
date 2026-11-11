/* ═════════ 장터: 광물은 정해진 값, 돈 버는 재미는 지층 출입권 ═════════
 광물  팔 때 = 기본가 × 판매 보너스(탑 층수 · 흥정 솜씨 · 입주자 분야 보너스), 살 때 = 팔 때 × 1.3 (엘라 입주 후 1.21)
 출입권 지층마다 있다. 1장마다 그 지층 광석이 천천히 로봇 보관함으로 들어온다(약 15시간에 본전).
        값 = 기본값 × 분위기 × (1 + 매수 압력). 소문이 돌면 분위기가 움직이고, 조사단 발표로 크게 오르거나 내린다.
 소문  켜 둔 동안 25~35분마다 하나(동시에 최대 2개), 15~20분 뒤 발표. 진짜인지는 처음에 정해져 저장된다.
        추리 단서: 출처의 적중 기록, 다른 사람의 같은 말(진짜일수록 잦음, 1분에 8% 대 2%), 그 지층을 캘 때 나오는 흔적, 값의 미리 움직임, 정보원 감정 */
function seasonIdx(){return Math.floor(S.day/7)%4}
const sellBon=id=>BON.sell*((BON.dem&&BON.dem[ITEMS[id].s])||1);
function bid(id){return ITEMS[id].p*sellBon(id)}
function ask(id){return bid(id)*(1+.3*BON.spread)}
function quote(id,n,dir){return n*(dir>0?ask(id):bid(id))}
function sell(id,n){n=Math.min(n,cnt(id));if(n<=0)return 0;const t=bid(id)*n;add(id,-n);S.gold+=t;S.earned+=t;S.bestSale=Math.max(S.bestSale,t);return t}
function buy(id,n){const c=ask(id),k=Math.max(0,Math.min(n,Math.floor(S.gold/c),space()));if(k){S.gold-=c*k;add(id,k)}return{k,t:c*k}}
// 로봇이 캔 n개를 지층의 나올 확률대로 나눈다 (많으면 하나씩 굴리지 않고, 쇠맥 찾기 · 보석 눈썰미 포함)
function splitDrops(n,L=S.layer){const o={};if(n>2000){const d=dropW(L),tot=d.reduce((s,x)=>s+x[1],0);let left=n;d.forEach(([id,w],i)=>{const k=i===d.length-1?left:Math.min(left,Math.round(n*w/tot));if(k>0)o[id]=k;left-=k})}
  else for(let i=0;i<n;i++){const id=rollDrop(L);o[id]=(o[id]||0)+1}
  for(const id in o)o[id]=Math.round(o[id]*(1+extraP(ITEMS[id].s)));return o}
// 넘친 광석 팔기: 원석 값의 50% (자동 재련 장치가 있으면 재련해서 더 비싸게)
function sellOverflow(id,n){if(n<=0)return 0;const g=bid(id)*n*ofMul(ul('refiner'));S.gold+=g;S.earned+=g;S.ofN=(S.ofN||0)+n;S.ofG=(S.ofG||0)+g;return g}
// 로봇 보관함으로 (넘치면 판매)
function toBox(id,n){const b=Math.min(n,Math.max(0,boxCap()-boxUsed()));if(b>0)boxAdd(id,b);if(n>b)sellOverflow(id,n-b)}

/* ── 지층 출입권 ── */
const layerAvg=i=>{const d=LAYERS[i].drops,t=d.reduce((s,x)=>s+x[1],0);return d.reduce((s,x)=>s+ITEMS[x[0]].p*x[1],0)/t};
const passBase=i=>BAL.pass.k*layerAvg(i)*Math.pow(BAL.pass.g,i);        // 기본값: 그 지층이 열릴 무렵 몇 분치 수입
const passMax=()=>BAL.pass.max+5*ul('bulk');                            // 지층마다 가질 수 있는 장수
const passDiv=i=>passBase(i)/(BAL.pass.pay*3600);                       // 1장이 1초에 벌어 주는 값(광석으로)
const PM=i=>S.pm[i]||(S.pm[i]={m:1,imp:0});
const passPrice=i=>passBase(i)*PM(i).m*(1+PM(i).imp);
const passHeld=i=>(S.pass[i]&&S.pass[i].n)||0;
// 사고팔기: 한 장마다 값이 0.2%씩 밀린다(시간이 지나면 풀림). 한꺼번에 사면 조금 비싸지는 정도
function passBuy(i,n){const P=PM(i);n=Math.min(n,passMax()-passHeld(i));let k=0,t=0;while(k<n){const c=passPrice(i);if(S.gold<c)break;S.gold-=c;t+=c;P.imp+=.002;k++}
  if(k){const h=S.pass[i]||(S.pass[i]={n:0,c:0});h.n+=k;h.c+=t}return{k,t}}
function passSell(i,n){const P=PM(i),h=S.pass[i];if(!h)return{k:0,t:0};n=Math.min(n,h.n);let t=0;const avg=h.c/h.n;for(let k=0;k<n;k++){t+=passPrice(i);P.imp-=.002}
  S.gold+=t;S.earned+=t;h.c-=avg*n;h.n-=n;if(!h.n)delete S.pass[i];return{k:n,t,gain:t-avg*n}}
const passValue=()=>Object.keys(S.pass||{}).reduce((s,i)=>s+passHeld(i)*passPrice(+i),0);
// 배당: 보유한 출입권만큼 그 지층 광석이 천천히 로봇 보관함으로
function passDividend(sec){for(const i in S.pass||{}){const v=passHeld(i)*passDiv(+i)*sec/layerAvg(+i);S.pdv=S.pdv||{};S.pdv[i]=(S.pdv[i]||0)+v;const n=Math.floor(S.pdv[i]);if(n>0){S.pdv[i]-=n;const o=splitDrops(n,+i);for(const id in o)toBox(id,o[id])}}}

/* ── 소문 ── */
const SOURCES={'루카':{rel:.74,end:['대요!','대요. 제 감은 틀린 적이 없거든요!']},'바우':{rel:.8,end:['다는구먼.','다니께, 믿어 보슈.']},'서린':{rel:.86,end:['다는 기록이 있어요.','을 가능성이 높아요.']},
  '꼬마 핀':{rel:.6,end:['대요!! 진짜예요!','대요! 제가 들었어요!']},'술집 손님':{rel:.45,end:['다더라!','다던데? 히끅.']},'낯선 여행자':{rel:.33,end:['다던데… 글쎄.','다는 소문이 있지.']}};
const SRC_N=Object.keys(SOURCES);
const short=id=>ITEMS[id].n.replace(/ (원석|광석)$/,'');
// 소문 크기: 작음 · 중간 · 큼. good = 좋은 소식(진짜면 값이 오름), 나쁜 소식은 진짜면 내림
const RUM_SIZE=[{p:.35,up:[.2,.4],dn:[.1,.2]},{p:.4,up:[.5,.9],dn:[.2,.35]},{p:.25,up:[1,1.5],dn:[.4,.5]}];
// 그 지층의 가장 귀한 고유 광석(소문 · 단서에 씀)
const layerGem=L=>RAW.filter(id=>ITEMS[id].L===L+1).sort((a,b)=>ITEMS[b].p-ITEMS[a].p)[0];
function rumorText(r){const L=LAYERS[r.L],top=short(layerGem(r.L)),pre=`B${r.L+1} ${L.n}`;
  if(!r.good)return[`${pre} 갱도에 물이 차오르고 있`,`${pre} 광맥이 바닥나 가고 있`,`${pre} 천장이 약해져 조사단이 막을지도 모른`][r.v%3];
  return[[`${pre} 쪽 광맥이 조금 넓어졌`,`${pre}에서 ${top} 부스러기가 늘었`],[`${pre}에서 새 ${top} 줄기가 나왔`,`${pre} 아래에 숨은 갱도가 있`],[`${pre} 깊은 곳에 ${top} 대광맥이 잠들어 있`,`${pre}에서 전설의 ${top} 무더기가 나왔`]][r.size][r.v%2]}
const rumorSay=r=>{const E=SOURCES[r.src].end;return rumorText(r)+E[r.v%E.length]};
function newRumor(){if(S.unlocked<1)return;const w=[];for(let i=0;i<S.unlocked;i++)if(!S.rum.some(r=>r.L===i))w.push([i,Math.pow(i+1,2)]);if(!w.length)return;
  let x=Math.random()*w.reduce((s,a)=>s+a[1],0),L=w[0][0];for(const[i,v]of w){if((x-=v)<0){L=i;break}}
  let u=Math.random(),size=0;for(let k=0;k<3;k++){if((u-=RUM_SIZE[k].p)<0){size=k;break}}
  const src=SRC_N[Math.random()*SRC_N.length|0],good=Math.random()<.8,truth=Math.random()<SOURCES[src].rel,R=RUM_SIZE[size],rnd=a=>a[0]+Math.random()*(a[1]-a[0]);
  const r={id:(S.rumN=(S.rumN||0)+1),L,size,good,truth,src,v:Math.random()*6|0,t:0,dur:900+Math.random()*300,echo:[],clue:0,up:rnd(R.up),dn:rnd(R.dn),m0:PM(L).m};
  const acc=BON.perfectIntel?.99:[0,.75,.88,.97][Math.min(S.intel,3)];r.hint=acc?(Math.random()<acc?r.truth:!r.truth):null;
  S.rum.push(r);log(`소문: ${r.src} "${rumorSay(r)}"`,true);const nd=$('newsDot');if(nd&&S.tab!=='market')nd.hidden=false}
// 진짜·가짜일 때 발표 순간의 값 변화(분위기 배율)
const rumMove=r=>r.good?(r.truth?1+r.up:1-r.dn*.5):(r.truth?1-r.up*.5:1+r.dn*.3);
function rumorTick(dt){S.rum.forEach(r=>{r.t+=dt;const f=Math.min(1,r.t/r.dur),P=PM(r.L);
    // 발표 전: 사람들 기대만큼 조금, 진짜면 누군가 미리 사들여서 조금 더 움직인다
    const exp=(r.good?1:-1)*(.5*r.up-.5*r.dn)*.3+(r.truth?1:-.6)*(r.good?1:-1)*.12*r.up;P.m+=(r.m0*(1+exp*f)-P.m)*Math.min(1,dt*.05);
    // 다른 사람의 같은 말: 진짜면 1분에 8%, 가짜면 2%
    if(Math.random()<dt/60*(r.truth?.08:.02)){const o=SRC_N.filter(n=>n!==r.src&&!r.echo.includes(n));if(o.length){const n=o[Math.random()*o.length|0];r.echo.push(n);log(`${n}도 같은 소문을 들었대요: B${r.L+1} 이야기`)}}
    if(r.t>=r.dur)announce(r)});
  S.rum=S.rum.filter(r=>!r.done)}
function announce(r){const P=PM(r.L),before=passPrice(r.L);P.m=Math.max(.5,r.m0*rumMove(r));r.done=1;const ch=passPrice(r.L)/before-1;
  const rec=S.srcRec[r.src]||(S.srcRec[r.src]={h:0,n:0});rec.n++;if(r.truth)rec.h++;
  const h=passHeld(r.L),msg=`조사단 발표: "${rumorText(r)}다" — ${r.truth?'사실이었어요!':'헛소문이었어요.'} B${r.L+1} 출입권 ${ch>=0?'+':''}${Math.round(ch*100)}%`;
  S.rumDone.unshift({id:r.id,L:r.L,src:r.src,txt:rumorSay(r),truth:r.truth,ch,held:h,at:S.clock});S.rumDone=S.rumDone.slice(0,4);log(msg,true);const nd=$('newsDot');if(nd&&S.tab!=='market')nd.hidden=false}
// 채굴 단서: 소문이 도는 지층을 캐면 가끔 흔적이 나온다 (진짜면 훨씬 자주)
function rumorClue(L){for(const r of S.rum){if(r.L!==L)continue;r.brk=(r.brk||0)+1;if(Math.random()<(r.truth?.012:.003)){r.clue++;const t=r.good?`B${L+1} 벽에서 ${short(layerGem(L))} 부스러기가 반짝였어요`:`B${L+1} 바닥이 유난히 축축해요`;
    log(`단서: ${t} (소문과 관련 있을지도)`);if(typeof floatText==='function'&&S.tab==='mine')floatText('단서 발견!','#ffd36a')}}}

/* 매초: 날짜, 출입권 분위기(작은 흔들림 → 1로 돌아옴), 매수 압력 풀림, 소문, 배당. offline=true면 새 소문 · 배당 없이 시간만 */
function tickMarket(dt,offline){S.clock+=dt;S.day+=dt/DAY;
  for(let i=0;i<S.unlocked;i++){const P=PM(i),inR=S.rum.some(r=>r.L===i);if(!inR)P.m+=(1-P.m)*Math.min(1,dt/1200)+.002*Math.sqrt(dt)*gauss();P.m=clamp(P.m,.5,3);P.imp*=Math.exp(-dt/90)}
  rumorTick(dt);
  if(!offline){S.rumT=(S.rumT??300)-dt;if(S.rumT<=0){if(S.rum.length<2&&tenantIn('루카'))newRumor();S.rumT=1500+Math.random()*600}passDividend(dt)}}

// 앱을 꺼 둔 동안: 소문 발표는 진행되고, 월세 · 드릴 로봇(스위치가 켜져 있을 때만) · 배당 · 자동 재련은 '켜 두고 1시간'치까지만
function catchUp(sec){sec=Math.min(sec,16*3600);if(sec<30)return null;const steps=Math.min(2000,Math.floor(sec/5)),st=sec/steps;for(let i=0;i<steps;i++)tickMarket(st,true);
  const E=offEquiv(sec),full=sec*offEff()/OFF_FILL>=offCapH()*3600; // E: 켜 두고 플레이한 것으로 치는 초
  const capR=rentPerSec()*rentCapH(ul('safe'))*3600,rent=Math.max(0,Math.min(rentPerSec()*E,capR-S.rentAcc));S.rentAcc+=rent;
  const box0={...(S.box||{})},ofG0=S.ofG||0,ofN0=S.ofN||0;
  // 드릴 로봇: 스위치가 켜져 있을 때만(켜 둔 동안과 같은 규칙). 꺼 두면 자리를 비운 동안에도 쉰다
  const drill=S.auto>0&&S.autoOn;if(drill){const all=splitDrops(Math.floor(playRate()*E));for(const id in all)toBox(id,all[id])}
  passDividend(E);
  const ores={};for(const id in S.box||{}){const d=S.box[id]-(box0[id]||0);if(d>0)ores[id]=d}
  const made=rqRun(E);
  return{sec,rent,ores,sold:{n:(S.ofN||0)-ofN0,g:(S.ofG||0)-ofG0},made,full,drillOff:S.auto>0&&!S.autoOn}}
