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
function fresh(){return{v:SAVE_VER,gold:0,inv:{},seen:[],unlocked:1,layer:0,hp:LAYERS[0].hp,next:null,digs:{},pick:1,auto:0,autoOn:true,furnace:0,intel:0,wh:0,
  found:[],slots:[null,null],box:{},log:[],floors:0,rentAcc:0,ended:false,journal:[],up:{},rq:[],shop:0,ofN:0,ofG:0,prologue:false,
  clock:0,day:0,pass:{},pm:{},pdv:{},rum:[],rumDone:[],srcRec:{},rumT:300,vein:null,veinT:600,legacy:0,tutBrk:0,dev:0,mkSub:'pass',
  ads:{boostUntil:0,day:0,gift:0,boost:0},noAds:false,sound:{sfx:.6,bgm:.3},tut:0,tutDone:false,mined:0,crafts:0,earned:0,bestSale:0,t0:gtime(),lastSeen:gtime(),maxClock:gtime(),tab:'mine',sub:'store'}}
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
let S,BON;
// 저장 정리: 예전 시제품 저장 지우기, 지금 안 쓰는 필드 · 없어진 광물 · 잘못된 숫자 정리, 옛 이름이 남은 일지·소문 비우기
const SAVE_VER=4,KEEP_EXTRA=['lost'];
function cleanSave(d){const f=fresh(),S2={};
  for(const k in f)S2[k]=k in d?d[k]:f[k];KEEP_EXTRA.forEach(k=>{if(k in d)S2[k]=d[k]});
  const num=v=>typeof v==='number'&&isFinite(v);for(const k in f)if(typeof f[k]==='number'&&!num(S2[k]))S2[k]=f[k];
  if(S2.vein&&!(num(S2.vein.left)&&num(S2.vein.pot)&&num(S2.vein.got)))S2.vein=null;
  const items=o=>{const r={};for(const id in o||{})if(ITEMS[id]&&num(o[id])&&o[id]>0)r[id]=Math.floor(o[id]);return r};
  S2.inv=items(S2.inv);S2.box=items(S2.box);
  S2.seen=[...new Set((S2.seen||[]).filter(id=>ITEMS[id]))];S2.found=[...new Set((S2.found||[]).filter(i=>RECIPES[i]))];S2.journal=[...new Set((S2.journal||[]).filter(i=>LAYERS[i]))];
  S2.slots=[0,1].map(i=>{const id=(S2.slots||[])[i];return ITEMS[id]?id:null});
  const a=S2.ads||{};S2.ads={boostUntil:num(a.boostUntil)?a.boostUntil:0,day:num(a.day)?a.day:0,gift:num(a.gift)?a.gift:0,boost:num(a.boost)?a.boost:0};
  const pass={};for(const i in S2.pass||{}){const h=S2.pass[i];if(LAYERS[i]&&h&&num(h.n)&&h.n>0&&num(h.c))pass[i]={n:h.n|0,c:h.c}}S2.pass=pass;
  const pm={};for(const i in S2.pm||{}){const P=S2.pm[i];if(LAYERS[i]&&P&&num(P.m))pm[i]={m:clamp(P.m,.5,3),imp:num(P.imp)?P.imp:0}}S2.pm=pm;
  S2.rum=(Array.isArray(S2.rum)?S2.rum:[]).filter(r=>r&&LAYERS[r.L]&&SOURCES[r.src]&&num(r.t)&&num(r.dur));S2.rumDone=(Array.isArray(S2.rumDone)?S2.rumDone:[]).slice(0,4);
  S2.unlocked=clamp(S2.unlocked|0,1,LAYERS.length);S2.layer=clamp(S2.layer|0,0,S2.unlocked-1);
  if(!['pass','ore'].includes(S2.mkSub))S2.mkSub='pass';
  const up={};for(const k in S2.up||{})if(UPS[k]&&num(S2.up[k])&&S2.up[k]>0)up[k]=Math.min(S2.up[k]|0,UPS[k].max??999);S2.up=up;
  S2.rq=(Array.isArray(S2.rq)?S2.rq:[]).filter(j=>j&&RECIPES[j.r]&&num(j.n)).map(j=>({r:j.r,n:Math.max(0,j.n|0),t:num(j.t)?j.t:0,loop:!!j.loop}));
  if((d.v|0)<SAVE_VER){S2.log=[];S2.ev=[]}S2.v=SAVE_VER;if((d.v|0)<3){S2.mkSub='pass'}if((d.v|0)<4){S2.found=[];S2.rq=[];S2.slots=[null,null]}   // v4: 광물 · 레시피를 새로 짜서 도감 번호가 바뀜 → 도감은 다시 채움S2.log=(S2.log||[]).slice(0,60);
  return S2}
function load(){try{['deepforge-v1','deepforge-v2','deepforge-v3'].forEach(k=>localStorage.removeItem(k));
  const raw=localStorage.getItem(SAVE_KEY);if(raw){S=cleanSave(JSON.parse(raw));return true}}catch(e){}S=fresh();return false}
function save(){if(!CLK.hold){S.lastSeen=gtime();S.maxClock=Math.max(S.maxClock||0,S.lastSeen)}try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}
// 화면 갱신: 같은 내용이면 건드리지 않고, 긴 목록은 바뀐 줄만 바꾼다 (매초 다시 그려도 끊기지 않게)
const HC=new WeakMap();
function setHTML(el,h){if(!el||HC.get(el)===h)return;HC.set(el,h);el.innerHTML=h}
// 같은 줄 목록이면 바뀐 칸만 고친다. slot[j] = j번째 칸이 줄의 몇 번째 자식인지
function patchList(el,keys,parts,row,empty,slot){if(!el)return;const key=keys.join(','),prev=HC.get(el);
  if(!keys.length){if(prev!=='')el.innerHTML=empty||'';HC.set(el,'');return}
  if(prev&&prev.key===key&&el.children.length===keys.length)parts.forEach((P,i)=>{const r=el.children[i];P.forEach((h,j)=>{if(prev.parts[i][j]!==h)r.children[slot[j]].innerHTML=h})});
  else el.innerHTML=keys.map((k,i)=>row(k,parts[i])).join('');HC.set(el,{key,parts})}
const cnt=id=>S.inv[id]||0;
function add(id,n){S.inv[id]=cnt(id)+n;if(S.inv[id]<=0)delete S.inv[id];if(n>0&&!S.seen.includes(id)){S.seen.push(id);if(S.seen.length>1)log(`새 광물 발견: ${ITEMS[id].n}`,true)}}
function log(msg,toastIt){S.log.unshift(msg);S.log=S.log.slice(0,60);if(toastIt)toast(msg);if(typeof renderLog==='function')renderLog()}
function toast(msg){const box=$('toasts');if(!box)return;const t=document.createElement('div');t.className='toast';t.textContent=msg;box.appendChild(t);while(box.children.length>3)box.firstChild.remove();setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),450)},2600)}

/* 보너스: 탑 구간 완공(입주자) + 층수 */
// 입주 효과는 그 구간 입주자의 것: 0 무쇠(재련 성공 · 금속값) 1 셈 2 핀 3 바우(탭) 4 루카 5 미르(대성공 · 연료값) 6 서린 7 하멜 8 도담 9 강철 10 엘라(사는 값 · 보석값) 11 노을 12 아르덴
function bonus(){const done=SECTIONS.filter(s=>S.floors>=s.to).length,has=i=>done>i,all=has(12)?1.1:1,sky=Math.max(0,S.floors-99);
  return{done,tap:(1+(has(3)?.1:0))*all*(1+.02*sky),wh:1+(has(1)?.5:0),auto:(1+(has(2)?.25:0)+(has(9)?.5:0))*all,success:has(0)?.05:0,
    sell:(1+(has(4)?.05:0)+(has(7)?.1:0))*(1+.01*Math.min(S.floors,99))*all*(1+.01*ul('haggle')),spread:has(10)?.7:1,rare:has(6)?1.2:1,rockHp:has(8)?.85:1,great:has(5)?.05:0,
    perfectIntel:has(11),dem:{metal:has(0)?1.1:1,gem:has(10)?1.1:1,fuel:has(5)?1.1:1,arcane:has(12)?1.1:1,build:1}}}
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
// 자리 비움 보상: 8시간에 걸쳐 천천히 차서 '켜 두고 1시간 플레이한 만큼'이 되면 멈춘다 (패키지는 2시간치). 밤샘 근무는 차는 속도만 올린다
const OFF_FILL=8,offCapH=()=>S.noAds?2:1,offEquiv=sec=>Math.min(sec*offEff()/OFF_FILL,offCapH()*3600);
const playRate=()=>(pickPower(S.pick)*BON.tap*2.5+S.auto*pickPower(S.pick)*BAL.autoEff*BON.auto)/layerHp(S.layer);
const boxCap=()=>boxCapOf(ul('box'));
function boxAdd(id,n){S.box=S.box||{};if(n>0)S.box[id]=(S.box[id]||0)+n;return n}
const used=()=>Object.values(S.inv).reduce((a,b)=>a+b,0);
const space=()=>Math.max(0,cap()-used());
const successRate=()=>Math.min(.97,.78+Math.min(S.furnace,5)*.04+BON.success);
const greatRate=()=>Math.min(.35,.06+Math.min(S.furnace,5)*.01+BON.great+ul('great')*.01);
const pickTier=()=>{let t=0;PICK_TIERS.forEach((p,i)=>{if(S.pick>=p[0])t=i});return t};
const layerHp=i=>LAYERS[i].hp*BON.rockHp;
// 서린의 입주 효과(BON.rare): 그 지층 고유 광석 중 더 귀한 것(값이 비싼 쪽)이 더 잘 나옴
const dropW=L=>{const own=LAYERS[L].drops.filter(([id])=>ITEMS[id].L===L+1),gem=own.length?own.reduce((a,b)=>ITEMS[a[0]].p>ITEMS[b[0]].p?a:b)[0]:null;return LAYERS[L].drops.map(([id,w])=>[id,id===gem?w*BON.rare:w])};
function rollDrop(L){const d=dropW(L);let t=d.reduce((s,x)=>s+x[1],0),r=Math.random()*t;for(const x of d){if((r-=x[1])<0)return x[0]}return d[0][0]}
