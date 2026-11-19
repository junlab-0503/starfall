/* ═════════ 세공 (v25): 떠돌이 세공사 린 ═════════
   B4 석회 동굴을 열면 린이 찾아와 창고 옆에 작업대를 차린다(탑 입주자 13명과는 따로, 탑 · 엔딩에 영향 없음).
   제련품(은괴 · 금괴 · 백금괴 · 별빛강)을 원하는 만큼 넣어 세공품 하나(+0)를 만들고, +10까지 두드린다. 실패하면 세공품과 재료가 모두 부서진다.
   판매가 = 만들 때 정해진 기준 가치(재료 수 × 그때의 개당 판매가) × 지금 단계의 배율. 단계마다 도전의 기대값은 1보다 작다(일반 판매보다 평균 수익이 낮음).
   강화 결과는 연출보다 먼저 정하고 저장한다 → 연출 중에 앱을 꺼도 결과는 그대로.
   그림(tools/craft_art.py): art/craft/ lin · silver|gold|plat|star 0~5(학 · 용 · 호랑이 · 별자리) · machine(세공기) · needle(세공침) · icon(단추)
     · fx_ok|fx_fail|fx_ten(효과 프레임 가로 한 장) → ART.craft_…, 소리 art/sfx/craft_ok|fail|ten.mp3 → SFXD */
const CRAFT_KINDS=[{k:'silver',n:'은옥',mat:'silverbar'},{k:'gold',n:'금옥',mat:'goldbar'},{k:'plat',n:'백금옥',mat:'platbar'},{k:'star',n:'별빛옥',mat:'starsteel'}];
const CRAFT_P=[1,.9,.85,.8,.7,.6,.5,.4,.3,.2,.1];            // [목표 단계] 성공 확률 (+0 = 제작 100%)
const CRAFT_M=[1,1.22,1.57,2.14,3.3,5.9,12.3,29,83,310,2000]; // [단계] 기준 가치 대비 판매 배율
// (v28) 강화 도전마다 골드: 지금 판매가의 5%. 비용을 빼고도 +1~+5는 한 단계마다 평균 +2~5% 이득(+5까지 가서 팔면 평균 약 +20%),
//  +6은 본전쯤, +7부터는 평균 손해지만 대박(+10 = 기준 가치 2000배, 끝까지 갈 확률 약 0.015%)
const CRAFT_COST=.05;
const craftCost=a=>a?Math.max(1,Math.ceil(Math.floor(a.base*CRAFT_M[a.lv])*CRAFT_COST)):0;
const CRAFT_MAX=10,CRAFT_QMAX=999999;
const craftStage=l=>l<=1?0:l<=3?1:l<=5?2:l<=7?3:l<=9?4:5;   // 그림 6단계: +0~1 · 2~3 · 4~5 · 6~7 · 8~9 · 10
const craftKind=k=>CRAFT_KINDS.find(x=>x.k===k)||CRAFT_KINDS[0];
const craftArt=(k,l)=>typeof ART!=='undefined'?ART['craft_'+k+craftStage(l)]||'':'';
const craftOpen=()=>S.unlocked>=4;                           // B4를 연 적이 있으면(옛 저장 포함)
const CR=()=>S.craft||(S.craft={a:null,rec:{},met:0,sel:'silver'});
const craftRec=k=>{const c=CR();return c.rec[k]||(c.rec[k]={made:0,succ:0,fail:0,best:0,bestSale:0,ten:false})};
const craftPrice=a=>a?Math.floor(a.base*CRAFT_M[a.lv]):0;
// 투입량: 정수 1 ~ 가진 수(음수 · 소수 · 초과는 안전하게 잘라 냄)
function craftQty(v,have){v=Math.floor(Number(v));if(!isFinite(v)||v<1)v=1;return Math.max(0,Math.min(v,have,CRAFT_QMAX))}
function craftMake(k,n){const c=CR();if(c.a||!craftOpen())return null;const K=craftKind(k),have=cnt(K.mat);n=craftQty(n,have);if(n<1)return null;
  const base=bid(K.mat)*n;   // 일반 판매(sell)와 똑같은 값 → +0으로 바로 팔면 재료를 판 것과 같은 금액(더 많지 않음)
  add(K.mat,-n);c.a={k:K.k,n,base,lv:0,t:Date.now()};const r=craftRec(K.k);r.made++;save();return c.a}
// 강화: 결과를 먼저 정하고 저장. busy 동안엔 다시 못 누름(연타 방지)
let CRAFT_BUSY=false;
function craftTry(){const c=CR(),a=c.a;if(!a||a.lv>=CRAFT_MAX||CRAFT_BUSY)return null;const cost=craftCost(a);if(S.gold<cost)return null;S.gold-=cost;const to=a.lv+1,ok=Math.random()<CRAFT_P[to],r=craftRec(a.k),snap={...a};
  if(ok){a.lv=to;r.succ++;r.best=Math.max(r.best,to);if(to===CRAFT_MAX)r.ten=true}
  else{r.fail++;c.a=null;log(`${craftKind(snap.k).n} +${to} 도전 실패: 부서졌어요`)}
  save();return{ok,to,snap,cost}}
function craftSell(){const c=CR(),a=c.a;if(!a||CRAFT_BUSY)return 0;const g=craftPrice(a),r=craftRec(a.k);
  S.gold+=g;S.earned+=g;S.bestSale=Math.max(S.bestSale||0,g);r.bestSale=Math.max(r.bestSale,g);c.a=null;
  log(`세공품 판매: ${craftKind(a.k).n} +${a.lv} → +${big(g)}G`,true);save();return g}

/* ── 화면 ── */
const LIN={hi:'어떤 금속을 다듬어 볼까?',ok1:'좋아! 제법 모양이 잡히는데?',ok2:'오, 이거 생각보다 훨씬 좋은데!',ok3:'잠깐… 이런 건 나도 처음이야. 손이 떨리네.',ten:'믿을 수 없어… 이런 작품은 평생 처음이야!',fail:'아… 깨져 버렸네. 미안해. 다음엔 더 조심할게.',sold:'좋은 거래였어! 다음 작품도 기대할게.'};
const linOk=l=>l>=10?LIN.ten:l>=7?LIN.ok3:l>=4?LIN.ok2:LIN.ok1;
let CRQ=1,CRSAY=LIN.hi,CRFX=null;   // 투입량 입력값 · 지금 대사 · 연출 중 상태
function linSay(t){CRSAY=t;const p=$('crSay');if(p)p.textContent=T(t)}
function renderCraft(){if($('sub-craft').hidden)return;const c=CR(),a=c.a;
  const st=$('crStage');st.style.backgroundImage=`url(${ART.craft_bg||ART.shop_bg_musoe})`;$('crNpc').src=ART.craft_lin;linSay(CRSAY);
  const cur=CRFX?CRFX.snap:a,sel=cur?cur.k:c.sel;   // 다듬는 중(연출 중 포함)엔 그 종류만
  setHTML($('crSeg'),CRAFT_KINDS.map(K=>`<button data-crk="${K.k}" type="button" class="${K.k===sel?'on':''}" ${cur&&K.k!==cur.k?'disabled':''}><img src="${craftArt(K.k,0)}" alt=""><span>${K.n}</span></button>`).join(''));
  const K=craftKind(sel),M=ITEMS[K.mat];
  if(CRFX){setHTML($('crBody'),craftShowHtml(CRFX.snap,true));return}
  if(a){setHTML($('crBody'),craftShowHtml(a,false));return}
  const have=cnt(K.mat);CRQ=have?craftQty(CRQ,have):0;const base=bid(K.mat)*CRQ;
  setHTML($('crBody'),`${crMachine(craftArt(K.k,0),false,!have)}
    <div class="cr-info"><div><b class="cr-nm">${K.n}</b><span>${ico(K.mat,'sm')} <span class="dim">가진 재료</span> ${big(have)}</span></div><div><span class="dim">기준 가치</span><b class="gold-t">${big(base)}G</b></div></div>
    ${have?`<div class="cr-q"><input id="crQ" type="number" inputmode="numeric" min="1" max="${have}" step="1" value="${CRQ}" aria-label="넣을 재료"><button class="px-btn sm" data-crq="1" type="button">+1</button><button class="px-btn sm" data-crq="10" type="button">+10</button><button class="px-btn sm" data-crq="100" type="button">+100</button><button class="px-btn sm" data-crq="max" type="button">최대</button></div>
    <div class="row-btns"><button class="px-btn lamp grow" id="crMake" type="button">제작</button></div>`
    :`<p class="dim small cr-none">재료가 없어요. 제련 탭에서 만들 수 있어요.</p>`}`)}
/* 세공기(tools/craft_art.py, 103×116칸): 둥근 구멍(가운데 49,53.5 · 지름 46)에 세공품, 위 놋쇠 받침에서 세공침이 내려오고, 맨 위에 효과 프레임.
   자리는 세공기 크기에 대한 %라서 화면 폭이 달라도 그대로 맞음(style.css .cr-mach) */
const crMachine=(src,anim,dim)=>`<div class="cr-mach${anim?' anim':''}${dim?' dim':''}" id="crMedal"><i class="cr-back"></i><div class="cr-slot"><img class="cr-item" id="crItem" src="${src}" alt=""></div><img class="cr-m-bg" src="${ART.craft_machine}" alt=""><div class="cr-ndw"><img class="cr-nd" src="${ART.craft_needle}" alt=""></div><i class="cr-fx" id="crFx"></i></div>`;
function craftShowHtml(a,anim){const K=craftKind(a.k),to=a.lv+1,top=a.lv>=CRAFT_MAX,pr=craftPrice(a),cost=craftCost(a),poor=!top&&S.gold<cost;
  return`${crMachine(craftArt(a.k,a.lv),anim)}
    <div class="cr-info"><div><b class="cr-nm">${K.n} <b class="cr-lv">+${a.lv}</b></b><span><span class="dim">지금 판매가</span> <b class="gold-t">${big(pr)}G</b></span></div>
      ${top?`<div><span class="small">최고 단계에 이르렀어요.</span></div>`:`<div><span class="dim">성공하면 +${to}</span><b class="gold-t">${big(Math.floor(a.base*CRAFT_M[to]))}G</b></div>
      <div><span class="dim">성공 확률</span><b>${Math.round(CRAFT_P[to]*100)}% <span class="bad cr-warn">실패하면 부서져요</span></b></div><div><span class="dim">강화 비용</span><b class="${poor?'bad':''}">${big(cost)}G${poor?' <span class="cr-warn">골드가 모자라요.</span>':''}</b></div>`}</div>
    <div class="row-btns">${top?'':`<button class="px-btn lamp grow" id="crTry" type="button" ${anim||poor?'disabled':''}>강화 도전</button>`}<button class="px-btn grow" id="crSell" type="button" ${anim?'disabled':''}>지금 판매</button></div>`}
/* 강화 연출(효과 팩 안내 + v28 긴장 시간). 결과는 이미 저장됨
   긴장: 세공침이 반쯤 내려와 멈춘 채 떨리고, 째깍 소리가 점점 빨라지고, 세공품이 점점 빛남(0.9초 + 단계마다 0.09초: +1 약 1초 · +10 약 1.8초)
   → 세공침이 내리꽂힘 → 닿는 순간 멈칫(성공 55 · 실패 75 · +10 90ms) + 화면 흔들림(2 · 3 · 4px) + 소리
   진동(설정 [진동]): 내려가기 시작 톡 · 째깍마다 아주 짧게 · 내리꽂힐 때 조금 세게 · 닿는 순간 성공/실패/+10 따로
   → 효과 프레임(65 · 65 · 70ms씩 13 · 15 · 20장) → 성공: 세공품이 1.06배로 튀었다 돌아옴 · 실패: 금이 간 뒤 사라짐 · +10: 1.1배로 커지며 빛남
   '흔들림 · 번쩍임 줄이기'(설정) 또는 기기의 동작 줄이기 설정이면 흔들림 · 효과 프레임 없이 결과만 */
const CFX={ok:{n:13,ms:65,stop:55,shk:2,vib:45},fail:{n:15,ms:65,stop:75,shk:3,vib:[70,50,90]},ten:{n:20,ms:70,stop:90,shk:4,vib:[60,40,60,40,160]}};   // vib: 닿는 순간 진동(성공 단단히 · 실패 투둑 · +10 길게)
const lowFx=()=>!!S.lowFx||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
function shakeView(px){const el=document.querySelector('#sheet .sheet-card');if(!el)return;el.style.setProperty('--shk',px+'px');el.classList.remove('shk');void el.offsetWidth;el.classList.add('shk');setTimeout(()=>el.classList.remove('shk'),300)}
function craftDoTry(){const r=craftTry();if(!r)return;CRAFT_BUSY=true;CRFX=r;renderCraft();
  const md=r.ok?(r.to===CRAFT_MAX?'ten':'ok'):'fail',C=CFX[md],low=lowFx(),m=$('crMedal'),fx=$('crFx'),it=$('crItem'),at=(t,f)=>setTimeout(()=>{try{f()}catch(e){}},t),nextArt=()=>{if(r.ok)it.src=craftArt(r.snap.k,r.to)};
  const pre=900+90*r.to;m.style.setProperty('--pre',pre+'ms');m.style.setProperty('--aim',Math.round(pre*.35)+'ms');
  sfx('click');buzz(12);m.classList.add('aim');if(!low)m.classList.add('sus');
  // 째깍: 간격 240ms → 60ms, 소리도 점점 높게
  {const tick=i=>{if(AC&&S.sound&&S.sound.sfx)tone(520+i*45,.035,'square',.07);buzz(8)};let t=120,k=0;while(t<pre-110){const kk=k++;at(t,()=>tick(kk));t+=Math.round(240-180*t/pre)}}
  at(pre-110,()=>{m.classList.remove('aim','sus');m.classList.add('drop');buzz(20)});   // 내리꽂기
  at(pre,()=>{m.classList.add('hit');sample('craft_'+md);buzz(C.vib);if(!low)shakeView(C.shk)});
  const f0=pre+C.stop;
  at(f0,()=>{m.classList.remove('hit','drop');m.classList.add('rise',md);m.classList.add('done');if(low){if(r.ok){nextArt();m.classList.add(md==='ten'?'big':'pop')}else m.classList.add('gone');return}
    fx.style.backgroundImage=`url(${ART['craft_fx_'+md]})`;fx.style.backgroundSize=`${C.n*100}% 100%`;fx.style.display='block'});
  if(!low)for(let i=0;i<C.n;i++)at(f0+i*C.ms,()=>{fx.style.backgroundPosition=`${i/(C.n-1)*100}% 0`;
    if(md==='ok'){if(i===4){nextArt();m.classList.add('pop')}if(i===7)m.classList.remove('pop')}
    if(md==='ten'&&i===6){nextArt();m.classList.add('big')}
    if(md==='fail'&&i===C.n-3)m.classList.add('gone')});
  at(f0+(low?520:C.n*C.ms)+120,()=>{fx.style.display='none';CRAFT_BUSY=false;CRFX=null;linSay(r.ok?linOk(r.to):LIN.fail);if(r.ok&&r.to===CRAFT_MAX)toast(`${craftKind(r.snap.k).n} +10!`);renderCraft();renderMineHud()})}
function openCraft(){if(!craftOpen()){sfx('click');story([{k:'세공',t:'???',b:'지층 4층에서 누군가가 돌아올지도 몰라요!',extra:`<div class="cr-lockill"><img src="${ART.craft_icon}" alt=""></div>`}]);return}if(!CR().met){linIntro(true);return}openSheet('craft');samplePreload('craft_ok','craft_fail','craft_ten')}
// 린 첫 등장(한 번만): B4를 열 때 일지 다음에, 옛 저장이면 작업대를 처음 누를 때
function linIntro(thenOpen){const L=['"여기가 별빛골이야? 광산이 다시 열린다기에 와 봤는데… 꽤 괜찮은 금속들이 있네!"','"나는 린. 이곳저곳 떠돌며 금속을 세공하는 장인이야."','"창고 옆에 작업대를 하나 차려도 될까? 평범한 금속도 어떻게 두드리느냐에 따라 엄청난 가치를 가질 수 있거든."','"하지만 조심해야 해. 욕심내서 너무 두드리면… 그대로 깨져 버릴 수도 있으니까!"'];
  story(L.map((b,i)=>({k:'떠돌이 세공사',t:'린',b,art:'lin',...(i===L.length-1?{done:()=>{CR().met=1;npcTutQueue('린');save();renderMineHud()},after:()=>{toast('창고 옆에 린의 세공 작업대가 생겼어요.');if(thenOpen)openSheet('craft')}}:{})})))}
$('crBtn').addEventListener('click',openCraft);
$('sub-craft').addEventListener('click',e=>{const c=CR();
  const kb=e.target.closest('[data-crk]');if(kb&&!c.a){c.sel=kb.dataset.crk;CRQ=1;sfx('click');renderCraft();return}
  const qb=e.target.closest('[data-crq]');if(qb){const K=craftKind(c.sel),have=cnt(K.mat),v=qb.dataset.crq;CRQ=v==='max'?have:craftQty(CRQ+(+v),have);sfx('click');renderCraft();return}
  if(e.target.closest('#crMake')){const a=craftMake(c.sel,CRQ);if(a){sfx('buy');linSay(LIN.hi);CRQ=1;renderCraft();renderHeader()}return}
  if(e.target.closest('#crTry')){craftDoTry();return}
  if(e.target.closest('#crSell')&&c.a&&!CRAFT_BUSY&&!CRFX){const pr=craftPrice(c.a),K=craftKind(c.a.k);
    story([{k:'세공',t:'세공품 판매',b:'이 세공품을 팔까요?',btn:'취소',extra:`<div class="rcard"><span><b>${K.n}</b> <b>+${c.a.lv}</b></span><span></span><span class="dim">판매 금액</span><span class="gold-t cr-big">+${big(pr)}G</span></div><div class="row-btns" style="justify-content:center;margin:6px 0 2px"><button class="px-btn lamp" id="crSellGo" type="button">판매하기</button></div>`}])}});
$('sub-craft').addEventListener('change',e=>{if(e.target.id==='crQ'){const K=craftKind(CR().sel);CRQ=craftQty(e.target.value,cnt(K.mat));renderCraft()}});
$('storyX').addEventListener('click',e=>{if(!e.target.closest('#crSellGo'))return;const g=craftSell();nextStory();if(g){sfx('coin');linSay(LIN.sold);renderCraft();renderHeader();renderMineHud()}});
// 도감 창: 세공 기록
function renderCraftRec(){const el=$('crRec');if(!el)return;
  setHTML(el,CRAFT_KINDS.map(K=>{const r=craftRec(K.k);return`<div class="cr-rec"><img src="${craftArt(K.k,r.best)}" alt=""><div><b>${K.n}</b>${r.ten?' <span class="gold-t">★ +10</span>':''}<div class="rcard"><span class="dim">제작</span><span>${r.made}</span><span class="dim">성공</span><span>${r.succ}</span><span class="dim">실패</span><span>${r.fail}</span><span class="dim">최고 단계</span><span>+${r.best}</span><span class="dim">최고 판매</span><span>${big(r.bestSale)}G</span></div></div></div>`}).join(''))}
