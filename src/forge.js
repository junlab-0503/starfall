/* ═════════ 재련 ═════════ */
function placeInSlot(id){if(!cnt(id))return;const i=S.slots[0]==null?0:S.slots[1]==null?1:1;if(S.slots[1-i]===id&&cnt(id)<2){toast(`${J(ITEMS[id].n,'이가')} 2개 필요해요.`);return}S.slots[i]=id;renderForge()}
const canSmeltWith=sl=>{const[a,b]=sl;if(!a||!b)return false;return a===b?cnt(a)>=2:cnt(a)>=1&&cnt(b)>=1};
function smeltOnce(){const[a,b]=S.slots;if(!canSmeltWith(S.slots))return null;add(a,-1);add(b,-1);S.crafts++;const idx=RMAP[key(a,b)];
  if(idx==null){add('slag',1);return{kind:'bad',msg:`${ITEMS[a].n} + ${ITEMS[b].n}: 반응이 없어요. 광재가 남았어요.`}}
  const out=RECIPES[idx].out,r=!S.tutDone&&S.crafts<=6?greatRate():Math.random();   // 튜토리얼 동안 처음 몇 번은 꼭 성공if(!S.found.includes(idx)){S.found.push(idx);log(`새 레시피 발견: ${ITEMS[a].n} + ${ITEMS[b].n} = ${ITEMS[out].n}`,true)}
  if(r<greatRate()){add(out,2);return{kind:'great',msg:`대성공! ${ITEMS[out].n} 2개`}}
  if(r<successRate()){add(out,1);return{kind:'ok',msg:`${ITEMS[out].n} 완성`}}
  add('slag',1);return{kind:'bad',msg:'불 조절에 실패했어요. 광재가 남았어요.'}}
function showResult(r){const el=$('result');el.className='result '+r.kind;el.textContent=r.msg;const p=$('forgePanel');p.classList.remove('flash');void p.offsetWidth;p.classList.add('flash')}
$('smelt').onclick=()=>{const k=[...S.slots],r=smeltOnce();if(r){S.slots=canSmeltWith(k)?k:S.slots.map(x=>x&&cnt(x)?x:null);showResult(r);renderForge();renderBook();renderHeader()}};
$('smeltMax').onclick=()=>{const k=[...S.slots];let ok=0,gr=0,bd=0,n=0;while(canSmeltWith(k)&&n<999){S.slots=[...k];const r=smeltOnce();n++;if(r.kind==='ok')ok++;else if(r.kind==='great')gr++;else bd++}
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
  setHTML($('preview'),t);renderRQ();
}
function renderBook(){
  $('bookCount').textContent=`${S.found.length} / ${RECIPES.length}`;$('bookCount2').textContent=`도감 ${S.found.length}/${RECIPES.length}`;
  setHTML($('book'),RECIPES.map((r,i)=>{if(S.found.includes(i))return`<div class="rec">${ico(r.out)}<span>${ITEMS[r.a].n} + ${ITEMS[r.b].n} → <b>${ITEMS[r.out].n}</b><span class="tier">B${r.L}</span><br><span class="dim">${pf(bid(r.out))}G</span></span><span class="rec-btns"><button class="px-btn sm" data-fill="${i}" type="button">넣기</button><button class="px-btn sm" data-rq="${i}" type="button">맡기기</button></span></div>`;
    if(r.L>S.unlocked)return`<div class="rec unk"><span class="ico sm" style="opacity:.2"></span><span>? + ? · 더 깊은 곳의 비밀<span class="tier">B${r.L}</span></span><span></span></div>`;
    return`<div class="rec unk">${'<i class="ico sm ic-'+r.out+'" style="filter:brightness(0) opacity(.35)"></i>'}<span>? + ? · ${r.hint}<span class="tier">B${r.L}</span></span><span></span></div>`}).join(''));
}
$('book').addEventListener('click',e=>{const b=e.target.closest('[data-fill]');if(!b)return;const r=RECIPES[+b.dataset.fill];S.slots=[r.a,r.b];renderForge();$('forgePanel').scrollIntoView({behavior:'smooth',block:'start'})});

/* 자동 재련: 레시피를 미르에게 맡기면 시간이 지나며 알아서 재련한다 (칸 수 · 속도는 미르의 용광로에서 강화) */
const rqCan=j=>{const r=RECIPES[j.r];return r.a===r.b?cnt(r.a)>=2:cnt(r.a)>=1&&cnt(r.b)>=1};
function smeltRecipe(idx){const r=RECIPES[idx];if(!rqCan({r:idx}))return null;add(r.a,-1);add(r.b,-1);S.crafts++;const x=Math.random();
  if(x<greatRate()){add(r.out,2);return 2}if(x<successRate()){add(r.out,1);return 1}add('slag',1);return 0}
function rqRun(sec){const made={},T=rqTime(ul('qspeed'));S.rq=S.rq||[];
  S.rq.slice(0,rqSlots()).forEach(j=>{j.t+=sec;let g=0;while(j.t>=T&&(j.loop||j.n>0)&&g++<100000){if(!rqCan(j)){j.t=T;break}j.t-=T;const k=smeltRecipe(j.r);if(k){const o=RECIPES[j.r].out;made[o]=(made[o]||0)+k}if(!j.loop)j.n--}});
  const before=S.rq.length;S.rq=S.rq.filter(j=>j.loop||j.n>0);if(Object.keys(made).length||S.rq.length!==before)invDirty=true;return made}
function rqAdd(idx){if(!S.found.includes(idx)){toast('먼저 직접 한 번 재련해서 레시피를 알아내야 맡길 수 있어요.');return}const r=RECIPES[idx],avail=r.a===r.b?Math.floor(cnt(r.a)/2):Math.min(cnt(r.a),cnt(r.b)),ex=S.rq.find(j=>j.r===idx);
  if(ex){if(!ex.loop)ex.n+=avail;toast(ex.loop?`${ITEMS[r.out].n}은(는) 이미 계속 재련 중이에요.`:`${ITEMS[r.out].n} ${avail}개를 더 맡겼어요.`)}
  else{if(S.rq.length>=rqSlots()){toast('자동 재련 칸이 모두 찼어요. 장비 → 미르의 용광로에서 칸을 늘릴 수 있어요.');return}
    S.rq.push({r:idx,n:avail,t:0,loop:avail===0});toast(avail?`미르에게 ${ITEMS[r.out].n} ${avail}개를 맡겼어요.`:`재료가 들어오는 대로 ${ITEMS[r.out].n}을(를) 계속 재련해요.`)}
  sfx('click');renderForge()}
function renderRQ(){const T=rqTime(ul('qspeed')),n=rqSlots();$('rqInfo').textContent=`${S.rq.length}/${n}칸 · 한 번에 ${pf(T)}초`;
  let h=S.rq.slice(0,n).map((j,i)=>{const r=RECIPES[j.r],wait=!rqCan(j);return`<div class="rqj${wait?' wait':''}">${ico(r.out)}<div><b>${ITEMS[r.out].n}</b> <span class="dim small">${ITEMS[r.a].n} + ${ITEMS[r.b].n}</span><br><span class="small">${j.loop?'재료가 들어오는 대로 계속':`남은 ${big(j.n)}개`}${wait?' · <span class="bad">재료 기다리는 중</span>':''}</span><div class="bar"><i data-rqb="${i}"></i></div></div>
    <div class="rq-btns"><button class="px-btn sm${j.loop?' lamp':''}" data-rql="${i}" type="button">계속</button><button class="px-btn sm" data-rqx="${i}" type="button">취소</button></div></div>`}).join('');
  for(let i=S.rq.length;i<n;i++)h+=`<div class="rqj empty dim small">빈 칸 · 재료를 넣고 [맡기기]를 누르거나, 레시피 도감에서 [맡기기]</div>`;
  setHTML($('rq'),h);rqBars()}
function rqBars(){const T=rqTime(ul('qspeed'));document.querySelectorAll('[data-rqb]').forEach(el=>{const j=S.rq[+el.dataset.rqb];if(j)el.style.width=Math.min(100,j.t/T*100)+'%'})}
$('rq').addEventListener('click',e=>{const l=e.target.closest('[data-rql]'),x=e.target.closest('[data-rqx]');
  if(l){const j=S.rq[+l.dataset.rql];if(j){j.loop=!j.loop;if(!j.loop&&j.n<=0)j.n=1}}
  if(x)S.rq.splice(+x.dataset.rqx,1);if(l||x){sfx('click');renderForge()}});
$('smeltQ').onclick=()=>{const[a,b]=S.slots;if(!a||!b){toast('재료 두 칸을 먼저 채워 주세요.');return}const idx=RMAP[key(a,b)];if(idx==null){toast('이 조합은 아무것도 만들어지지 않아요.');return}rqAdd(idx)};
$('book').addEventListener('click',e=>{const b=e.target.closest('[data-rq]');if(b)rqAdd(+b.dataset.rq)});
