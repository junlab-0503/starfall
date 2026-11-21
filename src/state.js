/* ═════════ 상태 · 공용 ═════════ */
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const fmt=n=>Math.floor(n).toLocaleString('ko-KR');
// 큰 수 단위: 한국어 만 · 억 · 조 · 경, 번체 萬 · 億 · 兆 · 京(같은 자릿수), 영어 K · M · B · T
const UNITS=()=>LANG==='en'?[[1e15,'Q'],[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']]:LANG==='zh'?[[1e16,'京'],[1e12,'兆'],[1e8,'億'],[1e4,'萬']]:[[1e16,'경'],[1e12,'조'],[1e8,'억'],[1e4,'만']];
const big=n=>{if(!isFinite(n)||n>=1e20)return'∞';if(n<1e5)return fmt(n);for(const[v,k]of UNITS())if(n>=v)return(Math.floor(n/v*10)/10).toLocaleString('ko-KR')+k;return fmt(n)};
// 좁은 칸용 짧은 표기: 9,999 · 1.2만 · 862만 · 8628만 · 1.5억 …
const cbig=n=>{if(!isFinite(n)||n>=1e20)return'∞';if(n<1e4)return fmt(n);for(const[v,k]of UNITS())if(n>=v){const x=n/v;return(x<10?(Math.floor(x*10)/10).toFixed(1):Math.floor(x))+k}return fmt(n)};
const pf=v=>v<10?(Math.round(v*10)/10).toFixed(1):big(v);
const jong=w=>{const c=w.charCodeAt(w.length-1);return c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28!==0};
const J=(w,p)=>w+(p==='이가'?(jong(w)?'이':'가'):p==='을를'?(jong(w)?'을':'를'):p==='은는'?(jong(w)?'은':'는'):'');
const DAY=240; // 게임 속 하루 = 4분
const SAVE_KEY='starfall-v1';
function fresh(){return{v:SAVE_VER,gold:0,inv:{},seen:[],unlocked:1,layer:0,hp:LAYERS[0].hp,next:null,digs:{},pick:1,auto:0,autoOn:true,furnace:0,intel:0,wh:0,
  found:[],slots:[null,null],box:{},log:[],floors:0,rentAcc:0,ended:false,journal:[],up:{},shop:0,ofN:0,ofG:0,prologue:false,
  clock:0,day:0,playT:0,whHint:0,mr:0,lowFx:false,vib:true,ntq:[],ntDone:[],nts:0,fgSub:'furn',craft:{a:null,rec:{},met:0,sel:'silver'},pass:{},pm:{},pdv:{},rum:[],rumDone:[],srcRec:{},rumT:300,rumN:0,review:null,vein:null,veinT:600,legacy:0,tutBrk:0,dev:0,mkSub:'pass',
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
const SAVE_VER=5,KEEP_EXTRA=['lost'];
function cleanSave(d){const f=fresh(),S2={};
  for(const k in f)S2[k]=k in d?d[k]:f[k];KEEP_EXTRA.forEach(k=>{if(k in d)S2[k]=d[k]});
  const num=v=>typeof v==='number'&&isFinite(v);for(const k in f)if(typeof f[k]==='number'&&!num(S2[k]))S2[k]=f[k];
  if(S2.vein&&!(num(S2.vein.left)&&num(S2.vein.pot)&&num(S2.vein.got)))S2.vein=null;
  const items=o=>{const r={};for(const id in o||{})if(ITEMS[id]&&num(o[id])&&o[id]>0)r[id]=Math.floor(o[id]);return r};
  S2.inv=items(S2.inv);S2.box=items(S2.box);
  S2.seen=[...new Set((S2.seen||[]).filter(id=>ITEMS[id]))];S2.found=[...new Set((S2.found||[]).filter(i=>RECIPES[i]))];S2.journal=[...new Set((S2.journal||[]).filter(i=>LAYERS[i]))];
  S2.slots=[0,1].map(i=>{const id=(S2.slots||[])[i];return ITEMS[id]?id:null});
  const a=S2.ads||{};S2.ads={boostUntil:num(a.boostUntil)?a.boostUntil:0,day:num(a.day)?a.day:0,gift:num(a.gift)?a.gift:0,boost:num(a.boost)?a.boost:0};
  const pass={};for(const i in S2.pass||{}){const h=S2.pass[i];if(LAYERS[i]&&h&&num(h.n)&&h.n>0&&num(h.c)){pass[i]={n:h.n|0,c:h.c};if(num(h.bt))pass[i].bt=h.bt;if(num(h.bm))pass[i].bm=h.bm}}S2.pass=pass;
  const pm={};for(const i in S2.pm||{}){const P=S2.pm[i];if(LAYERS[i]&&P&&num(P.m))pm[i]={m:clamp(P.m,.15,8),a:num(P.a)?clamp(P.a,.15,8):1,imp:num(P.imp)?P.imp:0}}S2.pm=pm;
  S2.rum=(Array.isArray(S2.rum)?S2.rum:[]).filter(r=>r&&LAYERS[r.L]&&SOURCES[r.src]&&num(r.t)&&num(r.dur));S2.rumDone=(Array.isArray(S2.rumDone)?S2.rumDone:[]).slice(0,4);
  // v30: 리뷰 부탁 상태 · 소문 번호(예전엔 저장 정리 때 빠져서 리뷰 창이 다시 뜨고, 소문 번호가 1부터 다시 매겨져 진행 중인 소문과 겹칠 수 있었음)
  S2.review=['later','done','no'].includes(S2.review)?S2.review:null;S2.rumN=Math.max(S2.rumN|0,...S2.rum.map(r=>r.id|0),...S2.rumDone.map(r=>r.id|0),0);
  S2.unlocked=clamp(S2.unlocked|0,1,LAYERS.length);S2.layer=clamp(S2.layer|0,0,S2.unlocked-1);
  if(!['pass','ore'].includes(S2.mkSub))S2.mkSub='pass';
  const up={};for(const k in S2.up||{})if(UPS[k]&&num(S2.up[k])&&S2.up[k]>0)up[k]=Math.min(S2.up[k]|0,UPS[k].max??999);S2.up=up;
  // v24.1: 자동 제련소를 뺌 → 미르의 '자동 제련 칸' · '센 불꽃'에 썼던 골드를 돌려줌(한 번만: 그 단계는 저장에서 사라짐)
  {const old=d.up||{};let g=0;for(const k of ['qslot','qspeed']){const lv=num(old[k])?Math.max(0,old[k]|0):0;const c=BAL.ups[k];if(c)for(let i=0;i<lv;i++)g+=Math.round(c[0]*Math.pow(c[1],Math.min(i,c[3]??1e9))*Math.pow(c[2]||1,Math.max(0,i-(c[3]??1e9))))}
   if(g>0){S2.gold=(num(S2.gold)?S2.gold:0)+g;S2.rqRefund=g}}
  if((d.v|0)<SAVE_VER){S2.log=[];S2.ev=[]}S2.v=SAVE_VER;if((d.v|0)<3){S2.mkSub='pass'}if((d.v|0)<4){S2.found=[];S2.slots=[null,null]}if((d.v|0)<5){S2.intel=[0,6,8,9][clamp(S2.intel|0,0,3)];S2.ntq=[];S2.ntDone=['셈','핀','루카','미르'].filter(w=>SECTIONS[SECTIONS.findIndex(s=>s.t.name===w)].to<=(S2.floors|0));if(d.craft&&d.craft.met)S2.ntDone.push('린')}   // v5: 소문 감정 3단계(75·88·97%) → 9단계(50~90%), 쓰던 정확도에 가까운 단계로   // v4: 광물 · 레시피를 새로 짜서 도감 번호가 바뀜 → 도감은 다시 채움
  S2.log=(S2.log||[]).slice(0,60);S2.lowFx=S2.lowFx===true;S2.vib=S2.vib!==false;
  {const W=['셈','핀','루카','미르','린'],ok=a=>[...new Set((Array.isArray(a)?a:[]).filter(w=>W.includes(w)))];S2.ntDone=ok(S2.ntDone);S2.ntq=ok(S2.ntq).filter(w=>!S2.ntDone.includes(w));if(!S2.ntq.length)S2.nts=0}   // 주민 안내 줄 · 본 사람
  // 세공(v25): 지금 다듬는 세공품 하나(a) · 종류별 기록(rec) · 린을 만났는지(met). 이상한 값은 버리고 안전한 기본값으로
  {const c=d.craft&&typeof d.craft==='object'?d.craft:{},K=['silver','gold','plat','star'],o={a:null,rec:{},met:c.met?1:0,sel:K.includes(c.sel)?c.sel:'silver'};
   const a=c.a;if(a&&K.includes(a.k)&&num(a.n)&&a.n>=1&&num(a.base)&&a.base>=0&&num(a.lv)&&a.lv>=0&&a.lv<=10)o.a={k:a.k,n:Math.floor(a.n),base:a.base,lv:Math.floor(a.lv),t:num(a.t)?a.t:0};
   for(const k of K){const r=(c.rec||{})[k]||{},n=v=>num(v)&&v>=0?Math.floor(v):0;o.rec[k]={made:n(r.made),succ:n(r.succ),fail:n(r.fail),best:Math.min(10,n(r.best)),bestSale:num(r.bestSale)&&r.bestSale>=0?r.bestSale:0,ten:!!r.ten}}
   S2.craft=o}
  return S2}
function load(){try{['deepforge-v1','deepforge-v2','deepforge-v3'].forEach(k=>localStorage.removeItem(k));
  const raw=localStorage.getItem(SAVE_KEY);if(raw){try{S=cleanSave(JSON.parse(raw));return true}catch(e){try{localStorage.setItem(SAVE_KEY+'-bak',raw)}catch(e2){}}}}catch(e){}S=fresh();return false}   // 저장을 못 읽으면 새 게임으로 덮어쓰기 전에 원본을 -bak에 남김
// v30: 저장이 실패하면(저장 공간 부족 · 막힘) 게임은 멈추지 않고 1분에 한 번만 알림. 다시 저장되면 알려 줌
let SAVE_FAIL=0,SAVE_WARN_T=-1e9;
function save(){if(!CLK.hold){S.lastSeen=gtime();S.maxClock=Math.max(S.maxClock||0,S.lastSeen)}
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));if(SAVE_FAIL){SAVE_FAIL=0;if(typeof toast==='function')toast('저장이 다시 잘 되고 있어요.')}}
  catch(e){SAVE_FAIL++;try{console.warn('save failed',e&&e.name)}catch(_){}const now=performance.now();if(now-SAVE_WARN_T>60000&&typeof toast==='function'){SAVE_WARN_T=now;toast('진행 상황을 저장하지 못했어요. 기기 저장 공간을 확인해 주세요.')}}}
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
// 입주 효과는 그 구간 입주자의 것: 0 무쇠(제련 성공 · 금속값) 1 셈 2 핀 3 바우(탭) 4 루카 5 미르(대성공 · 연료값) 6 서린 7 하멜 8 도담 9 강철 10 엘라(사는 값 · 보석값) 11 노을(황금 광맥 간격) 12 아르덴
function bonus(){const done=SECTIONS.filter(s=>S.floors>=s.to).length,has=i=>done>i,all=has(12)?1.1:1,sky=Math.max(0,S.floors-99);
  return{done,tap:(1+(has(3)?.1:0))*all*(1+.02*sky),wh:1+(has(1)?.5:0),auto:(1+(has(2)?.25:0)+(has(9)?.5:0))*all,success:has(0)?.05:0,
    sell:(1+(has(4)?.05:0)+(has(7)?.1:0))*(1+.01*Math.min(S.floors,99))*all*(1+.01*ul('haggle')),spread:has(10)?.7:1,rare:has(6)?1.2:1,rockHp:has(8)?.85:1,great:has(5)?.05:0,
    veinFast:has(11)?.7:1,dem:{metal:has(0)?1.1:1,gem:has(10)?1.1:1,fuel:has(5)?1.1:1,arcane:has(12)?1.1:1,build:1}}}
function refreshBonus(){BON=bonus()}

/* 장비 */
const pickPower=l=>Math.round(l*(1+l/20)*10)/10;
const boostOn=()=>gtime()<S.ads.boostUntil;
const boostMul=()=>boostOn()?2:1;
const tapPower=()=>pickPower(S.pick)*BON.tap*boostMul();
const pickCost=l=>Math.round(BAL.pick[0]*Math.pow(BAL.pick[1],l-1));
const autoCost=n=>Math.round(BAL.auto[0]*Math.pow(BAL.auto[1],n));
/* v32: 드릴 파워 = 곡괭이 몫(1단계 = 예전 그대로, 할아버지 채굴기) + 드릴 자체 몫 D0 × (g^(단계−1) − 1).
   단계마다 드릴 자체 몫 ×g(BAL.drill=[D0, g], g 1.3 = +30%). 예전엔 드릴 피해가 곡괭이 힘에 곱해져서, 곡괭이가 낮으면 드릴을 몇 조어치 올려도 깊은 지층에선 거의 0 */
const drillPow=(n=S.auto,p=S.pick)=>n<=0?0:pickPower(p)*BAL.autoEff+BAL.drill[0]*(Math.pow(BAL.drill[1],n-1)-1);
const autoDps=()=>drillPow()*BON.auto*boostMul();
const autoRate=(n=S.auto)=>drillPow(n)*BON.auto*boostMul()/layerHp(S.layer);   // 드릴이 지금 지층에서 1초에 캐는 개수
const rateTxt=x=>x<10?(Math.round(x*10)/10).toString():big(x);
const furnCost=n=>Math.round(BAL.furn[0]*Math.pow(BAL.furn[1],n));
const whCost=n=>Math.round(BAL.wh[0]*Math.pow(BAL.wh[1],n));
const intelCost=n=>n>=INTEL_MAX?Infinity:Math.round(BAL.intel[0]*Math.pow(BAL.intel[1],n));
const offlineH=()=>S.noAds?16:8;
// 광고 보상 하루 횟수: 한국 시간 자정에 초기화 (기기 시간대를 바꿔도 같은 날)
const GIFT_MAX=5,BOOST_MAX=10;
const dayKey=()=>Math.floor((gtime()+9*3600e3)/864e5);
function adsDay(){const a=S.ads,d=dayKey();if(a.day!==d||a.gift==null){a.day=d;a.gift=0;a.boost=0}return a}
const giftLeft=()=>Math.max(0,GIFT_MAX-adsDay().gift);
const boostLeft=()=>Math.max(0,BOOST_MAX-adsDay().boost);
const giftReady=()=>giftLeft()>0;
const capOf=w=>Math.floor((300*Math.pow(1.5,w)+150)*BON.wh);   // v24: 처음 450칸. 늘리는 비율(×1.5)엔 손대지 않고 150칸만 더함 → 어느 단계든 예전보다 줄지 않음
const cap=()=>capOf(S.wh);
const boxUsed=()=>Object.values(S.box||{}).reduce((a,b)=>a+b,0);
// 채굴 보관함: 꺼 둔 동안 캔 광석만 담는다 (한도는 오프라인 시간으로 정해짐)
// 자리 비움 보상: 8시간에 걸쳐 천천히 차서 '켜 두고 1시간 플레이한 만큼'이 되면 멈춘다 (패키지는 2시간치). 밤샘 근무는 차는 속도만 올린다
const OFF_FILL=8,offCapH=()=>S.noAds?2:1,offEquiv=sec=>Math.min(sec*offEff()/OFF_FILL,offCapH()*3600);
const playRate=()=>(pickPower(S.pick)*BON.tap*2.5+drillPow()*BON.auto)/layerHp(S.layer);
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
