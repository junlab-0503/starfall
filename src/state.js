/* ═════════ 상태 · 공용 ═════════ */
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const fmt=n=>Math.floor(n).toLocaleString('ko-KR');
const big=n=>{if(!isFinite(n)||n>=1e20)return'∞';if(n<1e5)return fmt(n);const u=[[1e16,'경'],[1e12,'조'],[1e8,'억'],[1e4,'만']];for(const[v,k]of u)if(n>=v)return(Math.floor(n/v*10)/10).toLocaleString('ko-KR')+k;return fmt(n)};
// 좁은 칸용 짧은 표기: 9,999 · 1.2만 · 862만 · 8628만 · 1.5억 …
const cbig=n=>{if(!isFinite(n)||n>=1e20)return'∞';if(n<1e4)return fmt(n);const u=[[1e16,'경'],[1e12,'조'],[1e8,'억'],[1e4,'만']];for(const[v,k]of u)if(n>=v){const x=n/v;return(x<10?(Math.floor(x*10)/10).toFixed(1):Math.floor(x))+k}return fmt(n)};
const pf=v=>v<10?(Math.round(v*10)/10).toFixed(1):big(v);
const jong=w=>{const c=w.charCodeAt(w.length-1);return c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28!==0};
const J=(w,p)=>w+(p==='이가'?(jong(w)?'이':'가'):p==='을를'?(jong(w)?'을':'를'):p==='은는'?(jong(w)?'은':'는'):'');
const DAY=240; // 게임 속 하루 = 4분
const SAVE_KEY='starfall-v1';
function freshMarket(){const m={};ORDER.forEach(id=>m[id]={q:ITEMS[id].T,fat:0});const s={};SKEYS.forEach((k,i)=>s[k]={ph:Math.random()*6.28,x:0,inv:1,rep:0,per:360+i*70});return{m,s}}
function fresh(){MSC=1;const mk=freshMarket();return{v:1,gold:0,inv:{},seen:[],unlocked:1,layer:0,hp:LAYERS[0].hp,next:null,digs:{},pick:1,auto:0,autoOn:true,furnace:0,intel:0,wh:0,
  found:[],slots:[null,null],box:{},log:[],floors:0,rentAcc:0,ended:false,journal:[],events:[],prologue:false,
  mkt:mk.m,sec:mk.s,clock:0,day:0,ev:[],nextEv:60,caravan:null,nextCar:1.2,collector:null,nextCol:420,
  ads:{boostUntil:0,day:0,gift:0,boost:0},noAds:false,msc:1,sound:{sfx:.6,bgm:.3},tut:0,tutDone:false,mined:0,crafts:0,earned:0,bestSale:0,t0:gtime(),lastSeen:gtime(),maxClock:gtime(),tab:'mine',sub:'store',sel:null,mkView:'list',filter:null}}
/* 시계 조작 방지
   게임 시간 = 기기 시계 + 보정값(CLK.off).
   1) 켜 둔 동안 기기 시계가 실제 흐름(단조 시계)과 다르게 튀면, 그만큼 보정해서 게임 시간은 그대로 흐른다.
   2) 다시 열었을 때 예전에 본 가장 늦은 시각(maxClock)보다 이르면 시계를 되돌린 것: 그 시각부터 이어서 센다.
      → 앞으로 돌려 보상을 받고 되돌려도, 실제 시간이 그 시각을 따라잡을 때까지 오프라인 보상이 없다.
   3) 서버 시각을 받을 수 있으면(같은 주소의 Date 헤더) 기기 시계 대신 그걸 쓴다. */
const CLK={off:0,srv:null,w:Date.now(),m:performance.now(),warned:false};
const gtime=()=>Date.now()+CLK.off;
function clockRebase(){CLK.w=Date.now();CLK.m=performance.now()}
function clockWatch(){const w=Date.now(),m=performance.now(),d=(w-CLK.w)-(m-CLK.m);CLK.w=w;CLK.m=m;if(Math.abs(d)>15000)CLK.off-=d;const g=gtime();if(S&&!CLK.hold&&g>(S.maxClock||0))S.maxClock=g}
function clockCheck(){clockRebase();const g=gtime(),mx=S.maxClock||0,back=g<mx-60000;
  if(back){CLK.off+=mx-g;if(!CLK.warned){CLK.warned=true;setTimeout(()=>toast('기기 시계가 예전보다 이르게 맞춰져 있어요. 그 시각이 지날 때까지 자리 비운 보상은 쌓이지 않아요.'),800)}}
  S.maxClock=Math.max(mx,gtime());return back}
async function syncTime(ms){try{if(!/^https?:$/.test(location.protocol)||/^(localhost|127\.|\[::1\])/.test(location.hostname))return false;
  const ac=new AbortController(),to=setTimeout(()=>ac.abort(),ms||1500),t0=Date.now();
  const u=location.href.split('#')[0];const r=await fetch(u+(u.includes('?')?'&':'?')+'_t='+t0,{method:'HEAD',cache:'no-store',credentials:'same-origin',signal:ac.signal});clearTimeout(to);
  const d=Date.parse(r.headers.get('date')||'');if(!isFinite(d))return false;const age=(+r.headers.get('age')||0)*1000,t1=Date.now();
  const off=d+age+500-(t0+t1)/2;CLK.srv=off;if(Math.abs(off-CLK.off)>60000){CLK.off=off;clockRebase()}return true}catch(e){return false}}
let S,H={},BON;
function load(){try{const raw=localStorage.getItem(SAVE_KEY);if(raw){const d=JSON.parse(raw);S=Object.assign(fresh(),d);MSC=S.msc||1;ORDER.forEach(id=>{if(!S.mkt[id])S.mkt[id]={q:ITEMS[id].T,fat:0}});return true}}catch(e){}S=fresh();return false}
function save(){if(!CLK.hold){S.lastSeen=gtime();S.maxClock=Math.max(S.maxClock||0,S.lastSeen)}try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}
const cnt=id=>S.inv[id]||0;
function add(id,n){S.inv[id]=cnt(id)+n;if(S.inv[id]<=0)delete S.inv[id];if(n>0&&!S.seen.includes(id)){S.seen.push(id);if(S.seen.length>1)log(`새 광물 발견: ${ITEMS[id].n}`,true)}}
function log(msg,toastIt){S.log.unshift(msg);S.log=S.log.slice(0,60);if(toastIt)toast(msg);if(typeof renderLog==='function')renderLog()}
function toast(msg){const box=$('toasts');if(!box)return;const t=document.createElement('div');t.className='toast';t.textContent=msg;box.appendChild(t);while(box.children.length>3)box.firstChild.remove();setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),450)},2600)}

/* 보너스: 탑 구간 완공(입주자) + 층수 */
function bonus(){const done=SECTIONS.filter(s=>S.floors>=s.to).length,has=i=>done>i,all=has(12)?1.1:1,sky=Math.max(0,S.floors-99);
  return{done,tap:(1+(has(0)?.1:0))*all*(1+.02*sky),wh:1+(has(1)?.5:0),auto:(1+(has(2)?.25:0)+(has(9)?.5:0))*all,success:has(3)?.05:0,
    sell:(1+(has(4)?.05:0)+(has(7)?.1:0))*(1+.01*Math.min(S.floors,99))*all,spread:has(5)?.7:1,rare:has(6)?1.2:1,rockHp:has(8)?.85:1,great:has(10)?.05:0,
    perfectIntel:has(11),dem:{metal:has(3)?1.1:1,gem:has(5)?1.1:1,fuel:has(10)?1.1:1,arcane:has(12)?1.1:1,build:1}}}
function refreshBonus(){BON=bonus()}

/* 장비 */
const pickPower=l=>Math.round(l*(1+l/20)*10)/10;
const boostOn=()=>gtime()<S.ads.boostUntil;
const boostMul=()=>boostOn()?2:1;
const tapPower=()=>pickPower(S.pick)*BON.tap*boostMul();
const pickCost=l=>Math.round(BAL.pick[0]*Math.pow(BAL.pick[1],l-1));
const autoCost=n=>Math.round(BAL.auto[0]*Math.pow(BAL.auto[1],n));
const autoDps=()=>S.auto*pickPower(S.pick)*BAL.autoEff*BON.auto*boostMul();
const furnCost=n=>Math.round(BAL.furn[0]*Math.pow(BAL.furn[1],n));
const whCost=n=>Math.round(BAL.wh[0]*Math.pow(BAL.wh[1],n));
const intelCost=n=>BAL.intel[n]??Infinity;
const offlineH=()=>S.noAds?16:8;
// 광고 보상 하루 횟수: 한국 시간 자정에 초기화 (기기 시간대를 바꿔도 같은 날)
const GIFT_MAX=5,BOOST_MAX=10;
const dayKey=()=>Math.floor((gtime()+9*3600e3)/864e5);
function adsDay(){const a=S.ads,d=dayKey();if(a.day!==d||a.gift==null){a.day=d;a.gift=0;a.boost=0}return a}
const giftLeft=()=>Math.max(0,GIFT_MAX-adsDay().gift);
const boostLeft=()=>Math.max(0,BOOST_MAX-adsDay().boost);
const giftReady=()=>giftLeft()>0;
const capOf=w=>Math.floor(300*Math.pow(1.5,w)*BON.wh);
const cap=()=>capOf(S.wh);
const boxUsed=()=>Object.values(S.box||{}).reduce((a,b)=>a+b,0);
// 로봇 보관함: 꺼 둔 동안 캔 광석만 담는다 (한도는 오프라인 시간으로 정해짐)
// 오프라인: 비운 8시간 = 직접 플레이 1시간 30분치 (언제나 같은 비율). 패키지는 16시간까지
const OFF_RATIO=1.5/8;
const OFF_EFF=OFF_RATIO;
const playRate=()=>(pickPower(S.pick)*BON.tap*2.5+S.auto*pickPower(S.pick)*BAL.autoEff*BON.auto)/layerHp(S.layer);
const boxCap=()=>Math.floor(playRate()*offlineH()*3600*OFF_RATIO);
function boxAdd(id,n){S.box=S.box||{};if(n>0)S.box[id]=(S.box[id]||0)+n;return n}
const used=()=>Object.values(S.inv).reduce((a,b)=>a+b,0);
const space=()=>Math.max(0,cap()-used());
const successRate=()=>Math.min(.97,.78+Math.min(S.furnace,5)*.04+BON.success);
const greatRate=()=>Math.min(.3,.06+Math.min(S.furnace,5)*.01+BON.great);
const pickTier=()=>{let t=0;PICK_TIERS.forEach((p,i)=>{if(S.pick>=p[0])t=i});return t};
const layerHp=i=>LAYERS[i].hp*BON.rockHp;
function rollDrop(L){const d=LAYERS[L].drops.map(([id,w])=>[id,w<25?w*BON.rare:w]);let t=d.reduce((s,x)=>s+x[1],0),r=Math.random()*t;for(const x of d){if((r-=x[1])<0)return x[0]}return d[0][0]}
