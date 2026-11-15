/* ═════════ 재련 ═════════ */
function placeInSlot(id){if(!cnt(id))return;const i=S.slots[0]==null?0:S.slots[1]==null?1:1;if(S.slots[1-i]===id&&cnt(id)<2){toast(`${J(ITEMS[id].n,'이가')} 2개 필요해요.`);return}S.slots[i]=id;renderForge()}
const canSmeltWith=sl=>{const[a,b]=sl;if(!a||!b)return false;return a===b?cnt(a)>=2:cnt(a)>=1&&cnt(b)>=1};
function smeltOnce(){const[a,b]=S.slots;if(!canSmeltWith(S.slots))return null;add(a,-1);add(b,-1);S.crafts++;const idx=RMAP[key(a,b)];
  if(idx==null){add('slag',1);return{kind:'bad',msg:`${ITEMS[a].n} + ${ITEMS[b].n}: 반응이 없어요. 광재가 남았어요.`}}
  // 튜토리얼 동안 처음 몇 번은 꼭 성공
  const out=RECIPES[idx].out,r=!S.tutDone&&S.crafts<=6?greatRate():Math.random();
  // 레시피는 실제로 만들어졌을 때(성공 · 대성공)만 도감에 남는다. 불 조절에 실패해 광재만 남으면 아직 모르는 레시피
  const learn=()=>{if(!S.found.includes(idx)){S.found.push(idx);log(`새 레시피 발견: ${ITEMS[a].n} + ${ITEMS[b].n} = ${ITEMS[out].n}`,true)}};
  const cata=()=>{if(ul('cata')&&Math.random()<cataAt(ul('cata'))){add(Math.random()<.5?a:b,1);return 1}return 0};   // 미르의 촉매: 재료 하나 돌려받기
  if(r<greatRate()){add(out,2);learn();return{kind:'great',msg:`대성공! ${ITEMS[out].n} 2개`,saved:cata()}}
  if(r<successRate()){add(out,1);learn();return{kind:'ok',msg:`${ITEMS[out].n} 완성`,saved:cata()}}
  if(ul('salv')&&Math.random()<salvAt(ul('salv'))){add(a,1);add(b,1);return{kind:'bad',msg:'불 조절에 실패했지만 미르가 재료를 되살렸어요.',salv:1}}   // 광재 되살리기
  add('slag',1);return{kind:'bad',msg:'불 조절에 실패했어요. 광재가 남았어요.'}}
// 촉매 · 되살리기로 돌려받은 재료 알림(여러 번 재련하면 모아서 한 번)
function smeltPerk(sv,sl){if(sv)toast(`미르의 촉매 덕분에 재료 ${sv}개를 돌려받았어요.`);if(sl&&sl>1)toast(`미르가 실패한 재련 ${sl}번의 재료를 되살렸어요.`)}
function showResult(r){const el=$('result');el.className='result '+r.kind;el.textContent=r.msg;const p=$('forgePanel');p.classList.remove('flash');void p.offsetWidth;p.classList.add('flash')}
$('smelt').onclick=()=>{const k=[...S.slots],r=smeltOnce();if(r){smeltPerk(r.saved||0,0);S.slots=canSmeltWith(k)?k:S.slots.map(x=>x&&cnt(x)?x:null);showResult(r);renderForge();renderBook();renderHeader()}};
$('smeltMax').onclick=()=>{const k=[...S.slots];let ok=0,gr=0,bd=0,n=0,sv=0,sl=0;while(canSmeltWith(k)&&n<999){S.slots=[...k];const r=smeltOnce();n++;sv+=r.saved||0;sl+=r.salv||0;if(r.kind==='ok')ok++;else if(r.kind==='great')gr++;else bd++}smeltPerk(sv,sl);
  S.slots=canSmeltWith(k)?k:k.map(x=>x&&cnt(x)?x:null);if(n){showResult({kind:bd>ok+gr?'bad':'ok',msg:`${n}번 재련: 성공 ${ok} · 대성공 ${gr} · 실패 ${bd}`});renderForge();renderBook();renderHeader()}};
$('slotA').onclick=()=>{S.slots[0]=null;renderForge()};$('slotB').onclick=()=>{S.slots[1]=null;renderForge()};
$('pickGrid').addEventListener('click',e=>{const b=e.target.closest('[data-pk]');if(b)placeInSlot(b.dataset.pk)});
function renderForge(){
  const ids=ORDER.filter(id=>cnt(id)>0);
  setHTML($('pickGrid'),ids.length?ids.map(id=>`<button class="pk${S.slots.includes(id)?' in':''}" data-pk="${id}" type="button">${ico(id)}<span>${ITEMS[id].n}</span><span class="c">${big(cnt(id))}</span></button>`).join(''):'<span class="dim">창고가 비어 있어요. 채굴부터 해 보세요.</span>');
  [0,1].forEach(i=>{const id=S.slots[i],el=$(i?'slotB':'slotA');if(id){el.className='slot filled';setHTML(el,`${ico(id,'lg')}<span>${ITEMS[id].n}</span><span class="dim">보유 ${big(cnt(id))} · 눌러서 빼기</span>`)}else{el.className='slot';setHTML(el,`<span class="dim">재료 ${i+1}<br>아래에서 고르기</span>`)}});
  const ok=canSmeltWith(S.slots);$('smelt').disabled=!ok;$('smeltMax').disabled=!ok;
  const[a,b]=S.slots;let t=`성공 ${Math.round(successRate()*100)}% · 대성공 ${Math.round(greatRate()*100)}%`;
  if(a&&b){const idx=RMAP[key(a,b)];if(idx!=null&&S.found.includes(idx)){const o=RECIPES[idx].out,inV=bid(a)+bid(b),outV=bid(o)*(successRate()+greatRate()),pc=outV/inV-1;
    t=`${ico(o,'sm')} ${ITEMS[o].n} · 재료 ${pf(inV)}G → 기대 ${pf(outV)}G <span class="${pc>=0?'good':'bad'}">(${pc>=0?'+':''}${Math.round(pc*100)}%)</span>`}else t='결과: 알 수 없음 · '+t}
  setHTML($('preview'),t);renderQuick();
}
function renderBook(){
  $('bookCount').textContent=`${S.found.length} / ${RECIPES.length}`;$('bookCount2').textContent=`도감 ${S.found.length}/${RECIPES.length}`;
  setHTML($('book'),RECIPES.map((r,i)=>{if(S.found.includes(i))return`<div class="rec">${ico(r.out)}<span>${ITEMS[r.a].n} + ${ITEMS[r.b].n} → <b>${ITEMS[r.out].n}</b><span class="tier">B${r.L}</span><br><span class="dim">${pf(bid(r.out))}G</span></span><span class="rec-btns"><button class="px-btn sm" data-fill="${i}" type="button">넣기</button></span></div>`;
    if(r.L>S.unlocked)return`<div class="rec unk"><span class="ico sm" style="opacity:.2"></span><span>? + ? · 더 깊은 곳의 비밀<span class="tier">B${r.L}</span></span><span></span></div>`;
    return`<div class="rec unk">${'<i class="ico sm ic-'+r.out+'" style="filter:brightness(0) opacity(.35)"></i>'}<span>? + ? · ${r.hint}<span class="tier">B${r.L}</span></span><span></span></div>`}).join(''));
}
/* 빠른 제작: 한 번이라도 성공해 도감에 있는 레시피만. 고르면 재료를 알아서 넣고 1회 재련(확률 · 재료 소비는 용광로와 같음: smeltOnce) */
let QSEL=null,QN=1;
const quickMax=idx=>{const r=RECIPES[idx];return Math.min(999,r.a===r.b?Math.floor(cnt(r.a)/2):Math.min(cnt(r.a),cnt(r.b)))};
const recipeFor=id=>RECIPES.findIndex(r=>r.out===id);
function quickNeed(idx){const r=RECIPES[idx],need={};need[r.a]=(need[r.a]||0)+1;need[r.b]=(need[r.b]||0)+1;return Object.entries(need).map(([id,q])=>[id,q,Math.max(0,q-cnt(id))])}
function quickSmelt(idx){if(!S.found.includes(idx))return null;const r=RECIPES[idx];if(!canSmeltWith([r.a,r.b]))return null;const keep=[...S.slots];S.slots=[r.a,r.b];const res=smeltOnce();S.slots=keep.map(x=>x&&cnt(x)?x:null);return res}
function renderQuick(){const f=S.found.slice().sort((a,b)=>a-b);$('qcInfo').textContent=f.length?`${f.length}가지`:'';
  if(QSEL!=null&&!f.includes(QSEL))QSEL=null;if(QSEL==null&&f.length)QSEL=f.find(i=>canSmeltWith([RECIPES[i].a,RECIPES[i].b]))??f[0];
  setHTML($('qcGrid'),f.length?f.map(i=>{const o=RECIPES[i].out,can=canSmeltWith([RECIPES[i].a,RECIPES[i].b]);return`<button class="pk qc${i===QSEL?' in':''}${can?'':' dimk'}" data-qc="${i}" type="button">${ico(o)}<span>${ITEMS[o].n}</span></button>`}).join(''):'<p class="dim small">용광로에서 처음 성공한 레시피가 여기에 모여요. 고르면 필요한 재료를 알아서 넣고 한 번 재련해요.</p>');
  if(QSEL==null){setHTML($('qcSel'),'');return}
  const r=RECIPES[QSEL],need=quickNeed(QSEL),can=need.every(x=>!x[2]),mx=quickMax(QSEL);QN=clamp(QN,1,Math.max(1,mx));
  setHTML($('qcSel'),`<div class="qc-sel"><div class="qc-out">${ico(r.out,'lg')}<b>${ITEMS[r.out].n}</b></div>
    <div class="qc-mats">${need.map(([id,q,m])=>`<div class="matl">${ico(id,'sm')}<span>${ITEMS[id].n}</span><span class="${m?'no':'ok'}">${big(cnt(id))}/${q}</span></div>`).join('')}
    ${can?'':`<div class="small bad"><span>재료가 모자라요</span>: ${need.filter(x=>x[2]).map(([id,q,m])=>`<span>${ITEMS[id].n}</span> <span>${m}개</span>`).join(' · ')}</div>`}
    <div class="dim small">${`성공 ${Math.round(successRate()*100)}% · 대성공 ${Math.round(greatRate()*100)}%`}</div></div>
    <div class="row-btns qc-qty"><button class="px-btn sm" data-qn="-10" type="button">−10</button><button class="px-btn sm" data-qn="-1" type="button">−</button><b class="qc-n">${QN}</b><button class="px-btn sm" data-qn="1" type="button">+</button><button class="px-btn sm" data-qn="10" type="button">+10</button><button class="px-btn sm" data-qn="max" type="button">최대</button></div>
    <div class="row-btns"><button class="px-btn lamp grow" id="qcGo" type="button" ${can?'':'disabled'}>${QN}회 재련</button></div><div class="result" id="qcRes"></div></div>`)}
$('qcPanel').addEventListener('click',e=>{const b=e.target.closest('[data-qc]');if(b){if(+b.dataset.qc!==QSEL)QN=1;QSEL=+b.dataset.qc;sfx('click');renderQuick();return}
  const q=e.target.closest('[data-qn]');if(q&&QSEL!=null){const mx=Math.max(1,quickMax(QSEL)),v=q.dataset.qn;QN=v==='max'?mx:clamp(QN+(+v),1,mx);sfx('click');renderQuick();return}
  // [n회 재련]: 같은 레시피를 n번(재료가 떨어지면 거기서 멈춤). 한 번씩은 용광로와 같은 smeltOnce
  if(e.target.closest('#qcGo')){let n=0,ok=0,gr=0,bd=0,sv=0,sl=0,last=null;while(n<QN){const r=quickSmelt(QSEL);if(!r)break;n++;last=r;sv+=r.saved||0;sl+=r.salv||0;if(r.kind==='ok')ok++;else if(r.kind==='great')gr++;else bd++}
    if(!n)return;smeltPerk(sv,sl);QN=1;renderForge();renderBook();renderHeader();const el=$('qcRes');if(el){el.className='result '+(n===1?last.kind:bd>ok+gr?'bad':'ok');el.textContent=n===1?last.msg:`${n}번 재련: 성공 ${ok} · 대성공 ${gr} · 실패 ${bd}`}}});
// 탑에서 모자란 재련품을 누르면: 아는 레시피면 빠른 제작에서 골라 두고, 모르면 용광로와 도감 힌트로 안내(조합법은 알려 주지 않음)
function goForgeFor(id){const idx=recipeFor(id);setTab('forge');
  if(idx>=0&&S.found.includes(idx)){QSEL=idx;renderQuick();setTimeout(()=>$('qcPanel').scrollIntoView({block:'start'}),0);return}
  const r=RECIPES[idx];setTimeout(()=>$('forgePanel').scrollIntoView({block:'start'}),0);
  story([{k:'재련',t:S.seen.includes(id)?ITEMS[id].n:'???',b:'아직 만드는 법을 몰라요. 용광로에 재료 두 가지를 넣어 직접 찾아보세요.',extra:r?`<div class="say"><span class="who">도감 힌트</span> ${r.L>S.unlocked?'더 깊은 곳의 비밀':r.hint}</div>`:''}])}
$('book').addEventListener('click',e=>{const b=e.target.closest('[data-fill]');if(!b)return;const r=RECIPES[+b.dataset.fill];S.slots=[r.a,r.b];setTab('forge');renderForge();setTimeout(()=>$('forgePanel').scrollIntoView({block:'start'}),0)});   // 레시피 도감(도감 창)에서 [넣기] → 재련 탭 용광로

// (v24.1) 자동 재련소는 뺌: 빠른 제작 · 가능한 만큼으로 바로 재련

