/* ═════════ 별빛골 장터 (경제 모델) ═════════
 가격 = 기본가 × (적정 재고 ÷ 시장 재고)^k  — 재고가 적으면 비싸고 많으면 싸다
 재고는 매초 흐름으로 변한다:
   + 광부·수입 공급 = T·r·공급지수·(가격비)^0.7
   − 손님 구매     = T·r·수요지수·(가격비)^-1
   ± 제련 길드     재료 대비 완성품 마진이 평소보다 좋으면 재료를 사서 만든다
   + 상단 도착, ± 플레이어 매매
 수요지수 = 분야 경기 파도 × 계절 × 길드 재고 기억 × 마을 성장 × 입주자 × 사건 × 대체재 × 보완재
 팔 때 값 = 중간가 × (1 − 호가/2) × 질림 × 단골 × 판매 보너스, 단 기본가의 70% 아래로는 내려가지 않는다 */
const ES=.7,ED=1;
// 재고 회복 속도: 흔한 원석은 반감기 약 6분, 귀한 물건은 약 20분
ORDER.forEach(id=>{const it=ITEMS[id];it.rate=.0012*clamp(Math.pow(20/it.p,.25),.3,1)});
let DF={}; // 소식·계절·경기가 값에 바로 반영되는 몫 (한 틱 전 값으로 계산)
const mid=(id,q)=>{const it=ITEMS[id];q=q==null?S.mkt[id].q:q;return it.p*clamp(Math.pow(it.T/Math.max(q,it.T*.05),it.k)*(DF[id]||1),.45,5)};
const halfLife=id=>.693/(ITEMS[id].rate*(ES+ED));
function recoverMin(id){const sp=S.mkt[id].q/ITEMS[id].T;if(sp<1.05)return 0;return Math.ceil(halfLife(id)*Math.log2((sp-1)/.05)/60)}
const spreadOf=id=>ITEMS[id].sp*BON.spread;
const repLv=s=>Math.min(5,Math.floor(Math.log10(1+S.sec[s].rep)));
const repBonus=s=>1+repLv(s)*.01;
function bid(id){const it=ITEMS[id],m=S.mkt[id];const v=mid(id)*(1-spreadOf(id)/2)*(1-.12*m.fat)*repBonus(it.s)*BON.sell;return Math.max(it.p*.7*BON.sell,v)}
const ask=id=>mid(id)*(1+spreadOf(id)/2);
const pr=id=>mid(id)/ITEMS[id].p;
const SUBS=[['coal','coke'],['brick','tile'],['wire','goldwire'],['glass','lavaglass'],['steel','crysteel'],['porcelain','bluechina'],['silverbar','platbar'],['cutame','peridot']];
const COMP=[['glass','mortar'],['gear','steel'],['bluechina','ultramarine'],['charge','powder'],['engine','gear'],['crown','goldbar']];
function seasonIdx(){return Math.floor(S.day/7)%4}
function seasonMul(s){const pos=S.day/7,i=Math.floor(pos)%4,f=pos%1,a=SEASONS[i].d[s]||1,b=SEASONS[(i+1)%4].d[s]||1;return f>.85?a+(b-a)*(f-.85)/.15:a}
const cycle=s=>{const x=S.sec[s];return 1+.1*Math.sin(2*Math.PI*S.clock/x.per+x.ph)};
const need=s=>clamp(1.5-.5*S.sec[s].inv,.7,1.35);
const growth=()=>1+.015*(S.unlocked-1)+.015*BON.done;
function evMul(id,kind){let f=1;for(const e of S.ev){if(e.state!=='active'||e.kind!==kind)continue;if(e.item===id||(e.sector&&e.sector===ITEMS[id].s))f*=e.x}return f}
const secEv=s=>{let f=1;for(const e of S.ev)if(e.state==='active'&&e.kind==='demand'&&e.sector===s)f*=e.x;return f};
function subF(id){let f=1;for(const[a,b]of SUBS){const o=a===id?b:b===id?a:null;if(o)f*=1+.35*clamp(pr(o)/pr(id)-1,-.5,.8)}return f}
function compF(id){let f=1;for(const[a,b]of COMP)if(b===id)f*=1+.2*clamp(pr(a)-1,-.4,.6);return f}
const secDemand=s=>cycle(s)*seasonMul(s)*need(s)*growth()*BON.dem[s]*Math.exp(S.sec[s].x);
const demandIdx=id=>secDemand(ITEMS[id].s)*evMul(id,'demand')*subF(id)*compF(id);
const supplyIdx=id=>evMul(id,'supply');
const busy=s=>{const v=secDemand(s)*secEv(s);return v>1.08?'바쁨':v<.92?'한산':'보통'};
let FL={};const GILD={};
// 지층을 개척하고 탑 구간을 완공할수록 장터가 커진다 (재고도 같은 비율로 늘려 값은 그대로)
const marketScale=()=>1+.25*(S.unlocked-1)+.05*BON.done;
function tickMarket(dt,quiet){
  {const t=marketScale();if(Math.abs(t-MSC)>1e-9){const f=t/MSC;ORDER.forEach(id=>S.mkt[id].q*=f);MSC=t;S.msc=t}}
  S.clock+=dt;S.day+=dt/DAY;
  SKEYS.forEach(k=>{const s=S.sec[k];s.x+=(-.01*s.x)*dt+.004*Math.sqrt(dt)*gauss();s.x=clamp(s.x,-.12,.12)});
  const fl={},cv={},cb={};SKEYS.forEach(k=>{cv[k]=0;cb[k]=0});
  const nDF={};ORDER.forEach(id=>{const it=ITEMS[id],p=pr(id),di=demandIdx(id),si=supplyIdx(id),prod=it.T*it.rate*si*Math.pow(p,ES),cons=it.T*it.rate*di*Math.pow(p,-ED);
    nDF[id]=clamp(Math.pow(di/si,.45),.6,2);fl[id]={prod,cons,gIn:0,gOut:0};cv[it.s]+=cons*it.p;cb[it.s]+=it.T*it.rate*it.p});DF=nDF;
  for(const r of RECIPES){if(r.out==='philo')continue;const R=mid(r.out)/(mid(r.a)+mid(r.b)),R0=ITEMS[r.out].p/(ITEMS[r.a].p+ITEMS[r.b].p);
    const g=clamp((R/R0-1)/.25,-1,1);let x=ITEMS[r.out].rate*.5*ITEMS[r.out].T*g;
    if(x>0)x=Math.min(x,S.mkt[r.a].q*.04/Math.max(dt,1),S.mkt[r.b].q*.04/Math.max(dt,1));else x=Math.max(x,-S.mkt[r.out].q*.04/Math.max(dt,1));
    GILD[r.out]=g;fl[r.out].gIn+=x;fl[r.a].gOut+=x;fl[r.b].gOut+=x}
  ORDER.forEach(id=>{const m=S.mkt[id],f=fl[id],T=ITEMS[id].T;m.q=clamp(m.q+(f.prod-f.cons+f.gIn-f.gOut)*dt,T*.05,T*6);m.fat*=Math.pow(.9985,dt);m.rv=(m.rv||0)*Math.pow(.9985,dt)});
  SKEYS.forEach(k=>{const s=S.sec[k];s.inv=clamp(s.inv+((cv[k]/Math.max(1e-9,cb[k]))-1)*dt/600+(1-s.inv)*dt/900,.2,2.2)});
  FL=fl;
  // 사건
  for(const e of S.ev){e.t-=dt;
    if(e.t>0)continue;
    if(e.state==='rumor'){if(e.real){startPhase(e,0,quiet)}else{e.state='gone';if(!quiet)log('소문은 헛소문이었어요.')}}
    else if(e.state==='active'){if(e.phase+1<e.phases.length)startPhase(e,e.phase+1,quiet);else e.state='gone'}}
  S.ev=S.ev.filter(e=>e.state!=='gone');
  if((S.nextEv-=dt)<=0){if(S.ev.length<2)spawnEvent(quiet);S.nextEv=130+Math.random()*100}
  // 상단
  if(!S.caravan&&S.day>=S.nextCar){const raws=S.seen.filter(id=>!ITEMS[id].cr&&id!=='slag');if(raws.length>=2){const pick=[...raws].sort(()=>Math.random()-.5).slice(0,Math.min(3,raws.length));
    S.caravan={from:['남쪽','북쪽','동쪽','서쪽'][Math.floor(Math.random()*4)],items:pick,at:S.day+1};if(!quiet)log(`${S.caravan.from} 상단이 내일 도착한대요: ${pick.map(i=>ITEMS[i].n).join(', ')}`,true)}else S.nextCar=S.day+1}
  if(S.caravan&&S.day>=S.caravan.at){S.caravan.items.forEach(id=>S.mkt[id].q+=ITEMS[id].T*.35);if(!quiet)log(`${S.caravan.from} 상단 도착! ${J(S.caravan.items.map(i=>ITEMS[i].n).join(', '),'이가')} 장터에 풀렸어요.`,true);S.lastCaravan={items:S.caravan.items,day:S.day,from:S.caravan.from};S.caravan=null;S.nextCar=S.day+2+Math.random()*1.5}
  // 수집가
  if(S.collector){S.collector.t-=dt;if(S.collector.t<=0||S.collector.n<=0){if(!quiet&&S.collector.n>0)log('수집가가 마을을 떠났어요.');S.collector=null}}
  else if((S.nextCol-=dt)<=0){const rare=S.seen.filter(id=>ITEMS[id].p>=100&&id!=='philo');if(rare.length){const id=rare[Math.floor(Math.random()*rare.length)];S.collector={id,x:1.7+Math.random()*.5,n:3+Math.floor(Math.random()*8),t:200};if(!quiet)log(`희귀품 수집가가 ${J(ITEMS[id].n,'을를')} 찾고 있어요!`,true)}S.nextCol=360+Math.random()*300}
}
function startPhase(e,i,quiet){e.state='active';e.phase=i;const ph=e.phases[i];Object.assign(e,{kind:ph.kind,x:ph.x,t:ph.t,text:ph.text});if(!quiet)log(ph.text,true)}
const CHAINS=[
  {need:'metal',rumor:'국경에 분쟁이 생겼다는 소문이 돌아요',phases:[{kind:'demand',x:1.45,t:100,text:'대장간들이 무기를 만드느라 금속을 찾아요'},{kind:'supply',x:1.5,t:80,text:'분쟁이 끝나 녹인 무기가 시장에 풀려요'}]},
  {need:'gem',rumor:'왕녀의 혼례가 다가온다는 소문이에요',phases:[{kind:'demand',x:1.45,t:100,text:'혼례 준비로 보석이 귀해졌어요'},{kind:'demand',x:.82,t:60,text:'혼례가 끝나 보석 수요가 잠잠해요'}]},
  {need:'fuel',rumor:'혹한이 몰려온다는 소문이에요',phases:[{kind:'demand',x:1.5,t:100,text:'추위에 연료가 불티나게 팔려요'},{kind:'demand',x:.85,t:60,text:'날이 풀려 연료가 남아돌아요'}]},
  {need:'build',rumor:'항구 도시 재건 계획이 있다는 소문이에요',phases:[{kind:'demand',x:1.4,t:110,text:'재건 공사로 건축 자재가 필요해요'},{kind:'demand',x:.85,t:60,text:'공사가 끝나 자재 주문이 끊겼어요'}]},
  {need:'arcane',rumor:'왕립 학회가 큰 연구를 시작한대요',phases:[{kind:'demand',x:1.45,t:100,text:'학회가 별의 물질을 사들여요'}]},
  {item:true,rumor:'{i} 광산에 붕락 사고가 났다는 소문이에요',phases:[{kind:'supply',x:.35,t:100,text:'{i} 광산이 멈춰 물량이 줄었어요'},{kind:'supply',x:1.35,t:60,text:'복구된 {i} 광산이 밀린 물량을 풀어요'}]},
  {item:true,rumor:'근처에서 커다란 {i} 광맥이 발견됐다는 소문이에요',phases:[{kind:'supply',x:2.1,t:100,text:'새 광맥의 {i}이(가) 쏟아져요'}]}
];
function seenSectors(){return SKEYS.filter(k=>S.seen.some(id=>ITEMS[id].s===k&&id!=='slag'))}
function spawnEvent(quiet){const secs=seenSectors(),raws=S.seen.filter(id=>!ITEMS[id].cr&&id!=='slag');
  const pool=CHAINS.filter(c=>c.item?raws.length:secs.includes(c.need));if(!pool.length)return;
  const c=pool[Math.floor(Math.random()*pool.length)],item=c.item?raws[Math.floor(Math.random()*raws.length)]:null,nm=item?ITEMS[item].n:'';
  const real=Math.random()<.72,acc=[0,.75,.88,.97][Math.min(S.intel,3)];
  const e={state:'rumor',t:25,real,sector:c.need||null,item,text:c.rumor.replace('{i}',nm),phases:c.phases.map(p=>({...p,text:p.text.replace('{i}이(가)',nm?J(nm,'이가'):'').replace('{i}',nm)})),phase:-1,
    cred:BON.perfectIntel?real:S.intel?(Math.random()<acc?real:!real):null,up:c.phases[0].kind==='demand'?c.phases[0].x>1:c.phases[0].x<1};
  S.ev.push(e);if(!quiet){log('소문: '+e.text,true);if(S.tab!=='market')$('newsDot').hidden=false}}
function recordHist(){ORDER.forEach(id=>{(H[id]=H[id]||[]).push(mid(id));if(H[id].length>120)H[id].shift()})}
// 짧은 시간에 많이 팔수록 일부는 떠돌이 상단이 사 가서 장터 재고에 덜 쌓인다 (rv: 최근 판매량, 몇 분에 걸쳐 줄어듦)
const sellInc=(it,m)=>1/(1+3*(m.rv||0)/it.T);
function sell(id,n){n=Math.min(n,cnt(id));if(n<=0)return 0;let t=0;const it=ITEMS[id],m=S.mkt[id];for(let i=0;i<n;i++){t+=bid(id);m.q+=sellInc(it,m);m.rv=(m.rv||0)+1;m.fat=Math.min(1,m.fat+2/it.T)}
  add(id,-n);S.gold+=t;S.earned+=t;S.sec[it.s].rep+=t/Math.max(50,it.p);S.bestSale=Math.max(S.bestSale,t);return t}
function buy(id,n){let t=0,k=0;const fl=ITEMS[id].T*.05+1;while(k<n&&S.mkt[id].q>fl&&space()>0){const c=ask(id);if(S.gold<c)break;S.gold-=c;t+=c;S.mkt[id].q-=1;add(id,1);k++}return{k,t}}
function quote(id,n,dir){const m=S.mkt[id],it=ITEMS[id],q0=m.q,f0=m.fat,r0=m.rv||0;let t=0;for(let i=0;i<n;i++){t+=dir>0?ask(id):bid(id);if(dir<0){m.q+=sellInc(it,m);m.rv=(m.rv||0)+1;m.fat=Math.min(1,m.fat+2/it.T)}else m.q-=1}m.q=q0;m.fat=f0;m.rv=r0;return t}
function maxBuy(id){const m=S.mkt[id],q0=m.q,fl=ITEMS[id].T*.05+1;let g=S.gold,k=0;const lim=Math.min(space(),3000);while(k<lim&&m.q>fl){const c=ask(id);if(g<c)break;g-=c;m.q-=1;k++}m.q=q0;return k}
function sellCollector(n){const c=S.collector;if(!c)return;n=Math.min(n,c.n,cnt(c.id));if(n<=0)return;const t=n*mid(c.id)*c.x*BON.sell;add(c.id,-n);S.gold+=t;S.earned+=t;c.n-=n;log(`수집가에게 ${ITEMS[c.id].n} ${n}개를 팔았어요: +${big(t)}G`,true)}
// 마을 사람의 한마디: 지금 가격의 가장 큰 이유를, 분야 대표의 말투로
const PERSONA={
 metal:{fat:'허허, 요 며칠 그것만 잔뜩 들어와서 대장간이 질렸소.',sub:'{o} 값이 치솟으니 다들 이걸로 버티는 중이오!',hi:'{s}이라 쇠 두드릴 일이 많구려. 값 잘 쳐 주겠소!',lo:'{s}엔 대장간 화로도 한가하오.',low:'물건이 귀하오! 가져오기만 하면 두둑이 쳐 주리다.',high:'창고에 쇠가 산더미요. 값을 깎을 수밖에 없소.',busy:'요즘 망치질할 일이 넘쳐나오! 허허!',idle:'연합 창고가 꽉 찼소. 한동안은 조용할 거요.',craft:'이걸로 만들어 팔면 남는 장사라, 다들 이걸 찾소.',normal:'평소랑 다를 게 없소. 허허.'},
 gem:{fat:'요즘 너무 흔해져서요… 손님들이 눈길을 잘 안 주네요.',sub:'{o} 너무 비싸서 다들 이쪽으로 눈을 돌리셨어요.',hi:'{s}이라 보석 찾는 분이 많아요. 지금이 좋은 때예요.',lo:'{s}엔 보석이 잘 안 팔려요. 조금 기다려 보시는 게 어때요?',low:'귀한 물건이에요. 제값을 쳐 드릴게요.',high:'진열장이 가득해서요. 아쉽지만 값을 낮춰야겠어요.',busy:'길드가 요즘 정신없이 바빠요. 좋은 물건이면 다 사겠대요.',idle:'길드 금고가 꽉 찼대요. 한동안은 까다롭게 고를 거예요.',craft:'세공하면 남는 게 많아서 다들 이걸 사 가요.',normal:'평소와 같은 값이에요. 무난하죠.'},
 fuel:{fat:'…같은 것만 들어오네요. 공방이 질렸어요.',sub:'{o} 비싸요. …그래서 이걸 써요.',hi:'{s}… 불이 많이 필요한 때죠. 값이 오릅니다.',lo:'{s}엔 불을 덜 피우죠. …찾는 사람이 줄어요.',low:'…부족해요. 넉넉히 드리죠.',high:'…넘쳐요. 싸게밖에 못 사요.',busy:'공방이 쉬지 않고 돌아가요. …흥미롭게도.',idle:'재료가 쌓여 있어요. 당분간은… 조용하겠죠.',craft:'이걸 섞으면 값어치가 오르죠. 다들 알고 있어요.',normal:'…변화 없어요.'},
 build:{fat:'요새 그것만 쏟아지니 다들 손사래 치는구먼.',sub:'{o} 비싸서 다들 이걸로 때우는 중이여.',hi:'{s}엔 짓는 일이 많아 자재가 금값이여.',lo:'{s}엔 공사가 뜸해서 자재가 남아돈다니께.',low:'자재가 귀하구먼. 제값 받을 때여.',high:'창고에 넘쳐서 값을 깎을 수밖에 없구먼.',busy:'석공 조합이 눈코 뜰 새 없구먼!',idle:'조합 창고가 꽉 차서 한동안 잠잠할 거여.',craft:'만들어 팔면 남으니께 다들 이거 찾는구먼.',normal:'뭐, 평소랑 똑같구먼.'},
 arcane:{fat:'같은 표본만 들어오니 학회도 흥미를 잃었다네.',sub:'{o} 귀하니 학회가 이것으로 대신하고 있소.',hi:'{s}이라 연구가 활발하오. 값을 후하게 쳐 주겠네.',lo:'{s}엔 학회도 쉬어 가는 법이라네.',low:'귀한 표본이오! 학회가 반길 것이네.',high:'표본이 넘치는구려. 값을 낮출 수밖에 없소.',busy:'학회가 밤낮없이 연구 중이라네.',idle:'학회 서고가 가득 찼소. 당분간은 조용할 걸세.',craft:'이것으로 만든 물질이 값지니 다들 찾는다네.',normal:'평소와 다름없소.'}};
function say(s,k,o){return PERSONA[s][k].replace('{s}',SEASONS[seasonIdx()].n).replace('{o}',o?J(o,'이가'):'')}
function comment(id){const it=ITEMS[id],s=it.s,who=SECT[s].who,m=S.mkt[id],sp=m.q/it.T;
  for(const e of S.ev)if(e.state==='active'&&(e.item===id||e.sector===s))return{who,t:e.text};
  if(S.lastCaravan&&S.lastCaravan.items.includes(id)&&S.day-S.lastCaravan.day<1)return{who:'루카',t:`${S.lastCaravan.from} 상단이 잔뜩 풀고 갔어요! 당분간은 흔할 거예요.`};
  if(m.fat>.35)return{who,t:say(s,'fat')};
  for(const[a,b]of SUBS){const o=a===id?b:b===id?a:null;if(o&&pr(o)/pr(id)>1.25)return{who,t:say(s,'sub',ITEMS[o].n)}}
  const sm=seasonMul(s);if(sm>1.1)return{who,t:say(s,'hi')};if(sm<.9)return{who,t:say(s,'lo')};
  if(sp<.85)return{who,t:say(s,'low')};if(sp>1.15)return{who,t:say(s,'high')};
  if(need(s)>1.15)return{who,t:say(s,'busy')};if(need(s)<.85)return{who,t:say(s,'idle')};
  if(GILD[id]>.3)return{who,t:say(s,'craft')};
  return{who,t:say(s,'normal')}}
// 앱을 꺼 둔 동안: 시장을 빠르게 돌리고, 월세와 자동 드릴 몫을 계산
function catchUp(sec){sec=Math.min(sec,16*3600);if(sec<30)return null;const steps=Math.floor(sec/5);for(let i=0;i<steps;i++){tickMarket(5,true);if(i%Math.max(1,Math.floor(steps/120))===0)recordHist()}
  sec=Math.min(sec,offlineH()*3600);const rent=Math.min(rentPerSec()*sec,rentPerSec()*offlineH()*3600-S.rentAcc);S.rentAcc+=Math.max(0,rent);
  let ores={};if(S.auto>0&&S.autoOn){let n=Math.floor(playRate()*sec*OFF_RATIO);n=Math.max(0,Math.min(n,boxCap()-boxUsed()));
    // 많으면 하나씩 굴리지 않고 확률대로 나눈다 (개발자 모드처럼 수백만 개일 때 멈추지 않게)
    if(n>2000){const d=LAYERS[S.layer].drops.map(([id,w])=>[id,w<25?w*BON.rare:w]),tot=d.reduce((s,x)=>s+x[1],0);let left=n;d.forEach(([id,w],i)=>{const k=i===d.length-1?left:Math.min(left,Math.round(n*w/tot));if(k>0)ores[id]=k;left-=k})}
    else for(let i=0;i<n;i++){const id=rollDrop(S.layer);ores[id]=(ores[id]||0)+1}for(const id in ores)boxAdd(id,ores[id])}
  return{sec,rent:Math.max(0,rent),ores,capped:sec>=offlineH()*3600}}
