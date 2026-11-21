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
// v31: 개발용 빌드에서 코드를 넣은 저장만 세공 강화 성공 100%. 일반 플레이 확률은 그대로
const craftP=to=>/*DEV{*/S.dev?1:/*}DEV*/CRAFT_P[to];
function craftTry(){const c=CR(),a=c.a;if(!a||a.lv>=CRAFT_MAX||CRAFT_BUSY)return null;const cost=craftCost(a);if(S.gold<cost)return null;S.gold-=cost;const to=a.lv+1,ok=Math.random()<craftP(to),r=craftRec(a.k),snap={...a};
  if(ok){a.lv=to;r.succ++;r.best=Math.max(r.best,to);if(to===CRAFT_MAX)r.ten=true}
  else{r.fail++;c.a=null;log(`${craftKind(snap.k).n} +${to} 강화 실패! 세공품이 깨졌어요.`)}
  save();return{ok,to,snap,cost}}
function craftSell(){const c=CR(),a=c.a;if(!a||CRAFT_BUSY)return 0;const g=craftPrice(a),r=craftRec(a.k);
  S.gold+=g;S.earned+=g;S.bestSale=Math.max(S.bestSale||0,g);r.bestSale=Math.max(r.bestSale,g);c.a=null;
  log(`세공품 판매 완료: ${craftKind(a.k).n} +${a.lv} → +${big(g)}G`,true);save();return g}

/* ── 화면 ── */
const LIN={hi:'오늘은 어떤 금속을 다듬어 볼까?',ok1:'좋아, 모양이 꽤 잘 잡히고 있어!',ok2:'오, 이건 생각보다 더 잘 나왔는데?',ok3:'잠깐만… 이런 건 나도 처음 봐. 손이 좀 떨리네.',ten:'와… 이런 작품을 내 손으로 만들다니. 믿기지가 않아!',fail:'아… 결국 깨졌네. 미안해. 다음엔 더 잘해 볼게.',sold:'좋은 거래였어! 다음 작품도 가져와 줘.'};
const linOk=l=>l>=10?LIN.ten:l>=7?LIN.ok3:l>=4?LIN.ok2:LIN.ok1;
let CRQ=1,CRSAY=LIN.hi,CRFX=null;   // 투입량 입력값 · 지금 대사 · 연출 중 상태
function linSay(t){CRSAY=t;const p=$('crSay');if(p)p.textContent=T(t)}
function renderCraft(){if($('sub-craft').hidden)return;const c=CR(),a=c.a;
  const st=$('crStage');st.style.backgroundImage=`url(${ART.craft_bg||ART.shop_bg_musoe})`;$('crNpc').src=ART.craft_lin;linSay(CRSAY);
  const cur=CRFX?CRFX.snap:a,sel=cur?cur.k:c.sel;   // 다듬는 중(연출 중 포함)엔 그 종류만
  setHTML($('crSeg'),CRAFT_KINDS.map(K=>`<button data-crk="${K.k}" type="button" class="${K.k===sel?'on':''}" ${cur&&K.k!==cur.k?'data-off="1"':''}><img src="${craftArt(K.k,0)}" alt=""><span>${LANG==='en'?T(K.n).replace(/ Jade$/,''):K.n}</span></button>`).join(''));
  const K=craftKind(sel),M=ITEMS[K.mat];
  if(CRFX){setHTML($('crBody'),craftShowHtml(CRFX.snap,true));return}
  if(a){setHTML($('crBody'),craftShowHtml(a,false));return}
  const have=cnt(K.mat);CRQ=have?craftQty(CRQ,have):0;const base=bid(K.mat)*CRQ;
  setHTML($('crBody'),`${crMachine(craftArt(K.k,0),false,!have)}
    <div class="cr-info"><div><b class="cr-nm">${K.n}</b><span>${ico(K.mat,'sm')} <span class="dim">가진 재료</span> ${big(have)}</span></div><div><span class="dim">기준 가치</span><b class="gold-t">${big(base)}G</b></div></div>
    ${have?`<div class="cr-q"><input id="crQ" type="number" inputmode="numeric" min="1" max="${have}" step="1" value="${CRQ}" aria-label="넣을 재료"><button class="px-btn sm" data-crq="1" type="button">+1</button><button class="px-btn sm" data-crq="10" type="button">+10</button><button class="px-btn sm" data-crq="100" type="button">+100</button><button class="px-btn sm" data-crq="max" type="button">최대</button></div>
    <div class="row-btns"><button class="px-btn lamp grow" id="crMake" type="button">제작</button></div>`
    :`<p class="dim small cr-none">재료가 없어요. [제련]에서 만들어 보세요.</p>`}`)}
/* 세공기(tools/craft_art.py, 103×116칸): 둥근 구멍(가운데 49,53.5 · 지름 46)에 세공품, 위 놋쇠 받침에서 세공침이 내려오고, 맨 위에 효과 프레임.
   자리는 세공기 크기에 대한 %라서 화면 폭이 달라도 그대로 맞음(style.css .cr-mach) */
const crMachine=(src,anim,dim)=>`<div class="cr-mach${anim?' anim':''}${dim?' dim':''}" id="crMedal"><i class="cr-back"></i><div class="cr-slot"><img class="cr-item" id="crItem" src="${src}" alt=""></div><img class="cr-m-bg" src="${ART.craft_machine}" alt=""><div class="cr-ndw"><img class="cr-nd" src="${ART.craft_needle}" alt=""></div><i class="cr-fx" id="crFx"></i></div>`;
function craftShowHtml(a,anim){const K=craftKind(a.k),to=a.lv+1,top=a.lv>=CRAFT_MAX,pr=craftPrice(a),cost=craftCost(a),poor=!top&&S.gold<cost;
  return`${crMachine(craftArt(a.k,a.lv),anim)}
    <div class="cr-info"><div><b class="cr-nm">${K.n} <b class="cr-lv">+${a.lv}</b></b><span><span class="dim">지금 판매가</span> <b class="gold-t">${big(pr)}G</b></span></div>
      ${top?`<div><span class="small">최대 강화 단계에 도달했어요.</span></div>`:`<div><span class="dim">성공하면 +${to} 단계</span><b class="gold-t">${big(Math.floor(a.base*CRAFT_M[to]))}G</b></div>
      <div><span class="dim">성공 확률</span><b>${Math.round(craftP(to)*100)}%</b></div><div><span class="dim">강화 비용</span><b class="${poor?'bad':''}">${big(cost)}G</b></div>`}</div>
    ${!top&&craftP(to)<1?'<span class="cr-risk bad">실패하면 세공품이 깨져요</span>':''}${!top&&poor?'<span class="cr-risk r bad">골드가 부족해요.</span>':''}
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
function openCraft(){if(!craftOpen()){sfx('click');story([{k:'세공',t:'???',b:'4번째 지층에 도착하면 누군가 찾아올지도 몰라요!',extra:`<div class="cr-lockill"><img src="${ART.craft_icon}" alt=""></div>`}]);return}if(!CR().met){linIntro(true);return}openSheet('craft');samplePreload('craft_ok','craft_fail','craft_ten')}
// 린 첫 등장(한 번만): B4를 열 때 일지 다음에, 옛 저장이면 작업대를 처음 누를 때
function linIntro(thenOpen){const L=['"여기가 별빛골이야? 광산이 다시 열린다길래 와 봤는데… 생각보다 괜찮은 금속이 많네!"','"난 린이야. 여기저기 돌아다니면서 금속을 세공하고 있지."','"창고 옆에 작업대 하나 놓아도 될까? 평범한 금속도 손을 어떻게 대느냐에 따라 값이 확 달라지거든."','"대신 너무 욕심부리진 마. 계속 두드리다 보면… 어느 순간 와장창 깨질 수도 있으니까!"'];
  story(L.map((b,i)=>({k:'떠돌이 세공사',t:'린',b,art:'lin',...(i===L.length-1?{done:()=>{CR().met=1;npcTutQueue('린');save();renderMineHud()},after:()=>{toast('창고 옆에 린이 세공 작업대를 차렸어요.');if(thenOpen)openSheet('craft')}}:{})})))}
$('crBtn').addEventListener('click',openCraft);
$('sub-craft').addEventListener('click',e=>{const c=CR();
  const kb=e.target.closest('[data-crk]');if(kb){if(CRFX)return;const k=kb.dataset.crk;if(!c.a&&c.sel!==k){c.sel=k;CRQ=1;renderCraft()}craftInfo(k);return}   // v32: 고르면서 그 옥 보기(만드는 중엔 다른 종류는 보기만)
  if(e.target.closest('.cr-slot')&&!CRFX){craftInfo(c.a?c.a.k:c.sel);return}
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
/* v32: 세공품 보기 — 옥 종류 단추나 세공기 속 세공품을 누르면: 큰 그림 · 몇 강 · 그 단계 이름 · 설명 · 6단계 모음(아직 못 간 단계는 그림자) · 판매가 · 최고 기록.
   그림 6단계(+0~1 · 2~3 · 4~5 · 6~7 · 8~9 · 10)마다 이름과 한 줄 설명 */
const CRAFT_LORE={silver:{head:'은괴로 다듬는 학 무늬 세공품',st:[['거친 은옥','막 떼어 낸 은빛 덩어리. 흐릿하게 학의 날개 자국이 보인다.'],['학이 깃든 은옥','린이 둥글게 다듬은 판 위에 날개를 편 학 한 마리가 새겨졌다.'],['구름 위의 학','은빛 광택이 돌고, 학 주위로 구름 무늬가 또렷해졌다.'],['달빛 학','빛을 받을 때마다 별가루가 흩어진다. 학이 금방이라도 날아오를 것 같다.'],['빛을 두른 학','푸른 빛무리가 테두리를 감쌌다. 마을 사람 누구나 한 번쯤 만져 보고 싶어 한다.'],['천년 학','구름 테를 두른 전설의 은옥. 학이 하늘로 오르는 순간을 그대로 붙잡았다.']]},gold:{head:'금괴로 다듬는 용 무늬 세공품',st:[['거친 금옥','울퉁불퉁한 금빛 덩어리 속에 무언가 꿈틀거리는 모양이 숨어 있다.'],['용이 깃든 금옥','둥글게 다듬은 판 위로 몸을 감은 용 한 마리가 드러났다.'],['비늘이 선 용','비늘 하나하나가 빛을 받아 반짝인다. 금 특유의 따뜻한 광택이 돈다.'],['여의주를 노리는 용','불티가 튀고, 용의 눈매가 한층 매서워졌다.'],['불꽃을 두른 용','붉은 금빛이 테두리를 따라 타오른다. 들고 있으면 손바닥이 따뜻해진다.'],['승천하는 황금룡','구름을 뚫고 오르는 황금룡. 별빛골 어디에도 이만한 금옥은 없었다.']]},plat:{head:'백금괴로 다듬는 호랑이 무늬 세공품',st:[['거친 백금옥','차갑고 단단한 백금 덩어리. 줄무늬 같은 결이 희미하게 보인다.'],['호랑이가 깃든 백금옥','둥근 판 위에 으르렁거리는 호랑이 얼굴이 새겨졌다.'],['줄무늬가 선 호랑이','줄무늬마다 은은한 광택이 돌아 털결이 살아 있는 것 같다.'],['눈을 뜬 호랑이','빛이 스칠 때마다 호랑이 눈이 번뜩인다. 쉽게 다가가기 어려운 기운이 감돈다.'],['서리를 두른 호랑이','푸른 서릿빛이 테두리를 감쌌다. 손에 쥐면 서늘한 기운이 전해진다.'],['산을 지키는 백호','구름 테 속에서 포효하는 백호. 이 메달 하나로 산 하나를 지킨다는 말이 있다.']]},star:{head:'별빛강으로 다듬는 별자리 무늬 세공품',st:[['거친 별빛옥','밤하늘 조각처럼 어두운 덩어리. 안쪽에서 작은 빛 하나가 깜빡인다.'],['별자리가 깃든 별빛옥','둥근 판 위로 별들이 이어져 별자리 하나가 나타났다.'],['빛나는 별자리','가운데 별이 또렷하게 빛나고, 별자리 선이 구름 사이로 이어진다.'],['별가루가 이는 별빛옥','돌릴 때마다 별가루가 흩날린다. 할아버지가 쫓던 별빛이 이런 색이었을까.'],['보랏빛을 두른 별자리','보랏빛 빛무리가 테두리를 감쌌다. 어두운 곳에서도 스스로 빛난다.'],['별의 심장','금빛 구름 테에 싸인 전설의 별빛옥. 떨어진 별의 조각이 여기 다시 모인 것 같다.']]}};
function craftInfo(k){const K=craftKind(k),c=CR(),a=c.a&&c.a.k===k?c.a:null,r=craftRec(k),L=CRAFT_LORE[k],best=r.best|0,lv=a?a.lv:best,si=craftStage(lv),st=L.st[si];
  const reach=Math.max(craftStage(best),a?craftStage(a.lv):0);
  const strip=[0,1,2,3,4,5].map(i=>`<img data-crs="${i}" class="${i===si?'on':''}${i>reach?' sil':''}" src="${ART['craft_'+k+i]||''}" alt="">`).join('');
  const rows=a?`<span>지금 판매가</span><span>${big(craftPrice(a))}G</span>${a.lv<CRAFT_MAX?`<span>성공하면 +${a.lv+1} 단계</span><span>${big(Math.floor(a.base*CRAFT_M[a.lv+1]))}G</span>`:''}`
    :`<span>가진 재료</span><span><b>${ITEMS[K.mat].n}</b> ${big(cnt(K.mat))}</span>`;
  sfx('click');story([{k:a?'지금 다듬는 세공품':r.made?'세공 기록':'세공품 미리 보기',t:K.n,b:st[1],
    extra:`<div class="crp" data-k="${k}" data-lv="${lv}" data-reach="${reach}"><img class="crp-big" src="${craftArt(k,lv)}" alt=""><b class="crp-lv">+${lv}</b></div><p class="crp-nm">${st[0]}</p><div class="crp-strip">${strip}</div><div class="rcard">${rows}<span>최고 단계</span><span>+${best}</span></div><p class="dim small crp-head">${L.head}</p>`}])}
// v33: 세공품 보기 팝업에서 이미 도달한 단계 그림을 누르면 그 단계의 큰 그림 · 이름 · 설명(그림자 단계는 아직 비밀)
const CRP_LV=['+0~1','+2~3','+4~5','+6~7','+8~9','+10'];
$('storyX').addEventListener('click',e=>{const im=e.target.closest('[data-crs]'),box=$('storyX').querySelector('.crp');if(!im||!box)return;const i=+im.dataset.crs;if(i>+box.dataset.reach){sfx('deny');return}
  const k=box.dataset.k,lv=+box.dataset.lv,st=CRAFT_LORE[k].st[i],cur=craftStage(lv)===i;sfx('click');
  box.querySelector('.crp-big').src=ART['craft_'+k+i]||'';box.querySelector('.crp-lv').textContent=cur?'+'+lv:CRP_LV[i];
  $('storyX').querySelector('.crp-nm').textContent=st[0];$('storyB').innerHTML=T(st[1]);if(STC)STC.b=st[1];
  $('storyX').querySelectorAll('[data-crs]').forEach(x=>x.classList.toggle('on',+x.dataset.crs===i))});
/* v31 · v32: 세공 작업대 — 세공기 아래 남는 세로 공간만큼 린 무대를 키움(138px → 최대 CR_STAGE_MAX). 스크롤이 새로 생기진 않게.
   v32: 크기는 화면 크기마다 한 번만 정해 고정(가장 긴 화면인 강화 화면을 몰래 그려 재고 그 기준으로) → 은옥 · 금옥을 바꾸거나 만들기 ↔ 강화를 오가도 린 크기가 그대로 */
const CR_STAGE_MAX=230,CRFIT={};
function crTallest(){const cb=$('crBody');if(!cb)return 0;const w=cb.getBoundingClientRect().width,g0=S.gold;let h=cb.offsetHeight;
  // 강화 화면 몇 가지(보통 · 아주 큰 값 · 골드 모자람 · 최고 단계)를 같은 폭으로 몰래 그려 가장 긴 높이(id는 그대로 둬야 같은 스타일이 붙음 — 바로 지움)
  for(const [lv,base,poor] of [[3,5000,0],[8,9.99e14,0],[5,123456789,1],[10,1e6,0]]){S.gold=poor?0:Math.max(g0,1e300);const html=craftShowHtml({k:'star',n:999999,base,lv,t:0},false);S.gold=g0;
    const cl=cb.cloneNode(false);cl.removeAttribute('id');cl.style.cssText=`position:absolute;visibility:hidden;left:0;top:0;width:${w}px;pointer-events:none`;cl.innerHTML=html;cb.parentNode.appendChild(cl);h=Math.max(h,cl.offsetHeight);cl.remove()}
  S.gold=g0;return h+8}   // 숫자 자릿수에 따라 한 줄 더 꺾일 수 있어 8px 여유
function crFit(){const sc=$('sub-craft'),sb=$('sheetBody'),st=$('crStage'),npc=$('crNpc');if(!sc||sc.hidden||!st||!sb||$('sheet').hidden)return;
  const key=sb.clientWidth+'x'+sb.clientHeight;let h=CRFIT[key];
  if(h==null){st.style.height='';const base=st.offsetHeight,cs=getComputedStyle(sb),avail=sb.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
    const tall=sc.offsetHeight-$('crBody').offsetHeight+crTallest();h=CRFIT[key]=Math.round(Math.max(base,Math.min(CR_STAGE_MAX,base+avail-tall)))}
  const px=h+'px';if(st.style.height!==px){st.style.height=px;if(npc)npc.style.height=(h+6)+'px';st.style.backgroundSize=h>194?`${Math.round(h*2.24)}px ${h}px`:''}}
{const _rc=renderCraft;renderCraft=function(){const r=_rc.apply(this,arguments);crFit();return r}}
addEventListener('resize',()=>{if(!$('sheet').hidden&&S.sub==='craft')crFit()});
