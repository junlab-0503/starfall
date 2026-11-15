/* ═════════ 세공 (v25): 떠돌이 세공사 린 ═════════
   B4 석회 동굴을 열면 린이 찾아와 창고 옆에 작업대를 차린다(탑 입주자 13명과는 따로, 탑 · 엔딩에 영향 없음).
   재련품(은괴 · 금괴 · 별빛강)을 원하는 만큼 넣어 세공품 하나(+0)를 만들고, +10까지 두드린다. 실패하면 세공품과 재료가 모두 부서진다.
   판매가 = 만들 때 정해진 기준 가치(재료 수 × 그때의 개당 판매가) × 지금 단계의 배율. 단계마다 도전의 기대값은 1보다 작다(일반 판매보다 평균 수익이 낮음).
   강화 결과는 연출보다 먼저 정하고 저장한다 → 연출 중에 앱을 꺼도 결과는 그대로.
   그림: art/craft/(lin · gold|silver|star 0~5 · bench · hammer, 있으면 bg · fx_ok · fx_fail · fx_ten) → ART.craft_… */
const CRAFT_KINDS=[{k:'silver',n:'은옥',mat:'silverbar'},{k:'gold',n:'금옥',mat:'goldbar'},{k:'star',n:'별빛옥',mat:'starsteel'}];
const CRAFT_P=[1,.9,.85,.8,.7,.6,.5,.4,.3,.2,.1];            // [목표 단계] 성공 확률 (+0 = 제작 100%)
const CRAFT_M=[1,1.05,1.2,1.45,1.9,2.9,5,10,25,70,250];      // [단계] 기준 가치 대비 판매 배율
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
function craftTry(){const c=CR(),a=c.a;if(!a||a.lv>=CRAFT_MAX||CRAFT_BUSY)return null;const to=a.lv+1,ok=Math.random()<CRAFT_P[to],r=craftRec(a.k),snap={...a};
  if(ok){a.lv=to;r.succ++;r.best=Math.max(r.best,to);if(to===CRAFT_MAX)r.ten=true}
  else{r.fail++;c.a=null;log(`${craftKind(snap.k).n} +${to} 도전 실패: 부서졌어요`)}
  save();return{ok,to,snap}}
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
  setHTML($('crBody'),`<div class="cr-medal"><img src="${craftArt(K.k,0)}" alt=""></div>
    <div class="cr-name"><b>${K.n}</b></div>
    <div class="rcard"><span>${ico(K.mat,'sm')} <span>${M.n}</span></span><span><span class="dim">가진 재료</span> ${big(have)}</span></div>
    ${have?`<div class="cr-q"><span class="dim">넣을 재료</span><input id="crQ" type="number" inputmode="numeric" min="1" max="${have}" step="1" value="${CRQ}"><button class="px-btn sm" data-crq="1" type="button">+1</button><button class="px-btn sm" data-crq="10" type="button">+10</button><button class="px-btn sm" data-crq="100" type="button">+100</button><button class="px-btn sm" data-crq="max" type="button">최대</button></div>
    <div class="cr-v"><span class="dim">기준 가치</span><b class="gold-t">${big(base)}G</b></div>
    <div class="row-btns"><button class="px-btn lamp grow" id="crMake" type="button">제작</button></div>`
    :`<p class="dim small cr-none">재료가 없어요. 재련 탭에서 만들 수 있어요.</p>`}
    ${craftOddsHtml()}`)}
function craftShowHtml(a,anim){const K=craftKind(a.k),M=ITEMS[K.mat],to=a.lv+1,top=a.lv>=CRAFT_MAX,pr=craftPrice(a);
  return`<div class="cr-medal${anim?' anim':''}" id="crMedal"><img src="${craftArt(a.k,a.lv)}" alt=""><img class="cr-hammer" src="${ART.craft_hammer}" alt=""><i class="cr-flash"></i></div>
    <div class="cr-name"><b>${K.n}</b> <b class="cr-lv">+${a.lv}</b></div>
    <div class="rcard"><span>${ico(K.mat,'sm')} <span>${M.n}</span></span><span>×${big(a.n)}</span>
      <span class="dim">지금 판매가</span><span class="gold-t cr-big">${big(pr)}G</span>
      ${top?'':`<span class="dim">다음 강화</span><span>+${to} · <span class="dim">성공 확률</span> <b>${Math.round(CRAFT_P[to]*100)}%</b></span>
      <span class="dim">성공하면</span><span class="gold-t">${big(Math.floor(a.base*CRAFT_M[to]))}G</span>`}</div>
    ${top?`<p class="small cr-top">최고 단계에 이르렀어요.</p>`:`<p class="small bad cr-warn">실패하면 세공품과 재료가 모두 부서져요.</p>`}
    <div class="row-btns">${top?'':`<button class="px-btn lamp grow" id="crTry" type="button" ${anim?'disabled':''}>강화 도전</button>`}<button class="px-btn grow" id="crSell" type="button" ${anim?'disabled':''}>지금 판매</button></div>
    ${craftOddsHtml()}`}
function craftOddsHtml(){return`<details class="cr-odds"><summary>강화 확률표</summary><div class="rcard"><span class="dim">단계</span><span class="dim"><span>성공 확률</span> · <span>판매 배율</span></span>${CRAFT_P.slice(1).map((p,i)=>`<span>+${i+1}</span><span>${Math.round(p*100)}% · ×${CRAFT_M[i+1]}</span>`).join('')}</div></details>`}
// 강화 연출: 결과는 이미 저장됨. 망치 3번(약 1.2초) → 빛(성공) · 균열(실패) · 큰 빛(+10)
function craftDoTry(){const r=craftTry();if(!r)return;CRAFT_BUSY=true;CRFX=r;renderCraft();
  [0,400,800].forEach(t=>setTimeout(()=>sfx('hit'),t));
  setTimeout(()=>{const m=$('crMedal');if(m)m.classList.add(r.ok?(r.to===CRAFT_MAX?'ten':'ok'):'fail');sfx(r.ok?(r.to>=7?'rare':'gain'):'deny')},1200);
  setTimeout(()=>{CRAFT_BUSY=false;CRFX=null;linSay(r.ok?linOk(r.to):LIN.fail);if(r.ok&&r.to===CRAFT_MAX)toast(`${craftKind(r.snap.k).n} +10!`);renderCraft();renderMineHud()},r.ok?1900:2100)}
function openCraft(){if(!craftOpen())return;if(!CR().met){linIntro(true);return}openSheet('craft')}
// 린 첫 등장(한 번만): B4를 열 때 일지 다음에, 옛 저장이면 작업대를 처음 누를 때
function linIntro(thenOpen){const L=['"여기가 별빛골이야? 광산이 다시 열린다기에 와 봤는데… 꽤 괜찮은 금속들이 있네!"','"나는 린. 이곳저곳 떠돌며 금속을 세공하는 장인이야."','"창고 옆에 작업대를 하나 차려도 될까? 평범한 금속도 어떻게 두드리느냐에 따라 엄청난 가치를 가질 수 있거든."','"하지만 조심해야 해. 욕심내서 너무 두드리면… 그대로 깨져 버릴 수도 있으니까!"'];
  story(L.map((b,i)=>({k:'떠돌이 세공사',t:'린',b,art:'lin',...(i===L.length-1?{done:()=>{CR().met=1;save();renderMineHud()},after:()=>{toast('창고 옆에 린의 세공 작업대가 생겼어요.');if(thenOpen)openSheet('craft')}}:{})})))}
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
