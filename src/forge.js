/* ═════════ 합성 ═════════ */
function placeInSlot(id){if(!cnt(id))return;const i=S.slots[0]==null?0:S.slots[1]==null?1:1;if(S.slots[1-i]===id&&cnt(id)<2){toast(`${J(ITEMS[id].n,'이가')} 2개 필요해요.`);return}S.slots[i]=id;renderForge()}
const canSmeltWith=sl=>{const[a,b]=sl;if(!a||!b)return false;return a===b?cnt(a)>=2:cnt(a)>=1&&cnt(b)>=1};
function smeltOnce(){const[a,b]=S.slots;if(!canSmeltWith(S.slots))return null;add(a,-1);add(b,-1);S.crafts++;const idx=RMAP[key(a,b)];
  if(idx==null){add('slag',1);return{kind:'bad',msg:`${ITEMS[a].n} + ${ITEMS[b].n}: 반응이 없어요. 광재가 남았어요.`}}
  const out=RECIPES[idx].out,r=Math.random();if(!S.found.includes(idx)){S.found.push(idx);log(`새 레시피 발견: ${ITEMS[a].n} + ${ITEMS[b].n} = ${ITEMS[out].n}`,true)}
  if(r<greatRate()){add(out,2);return{kind:'great',msg:`대성공! ${ITEMS[out].n} 2개`}}
  if(r<successRate()){add(out,1);return{kind:'ok',msg:`${ITEMS[out].n} 완성`}}
  add('slag',1);return{kind:'bad',msg:'불 조절에 실패했어요. 광재가 남았어요.'}}
function showResult(r){const el=$('result');el.className='result '+r.kind;el.textContent=r.msg;const p=$('forgePanel');p.classList.remove('flash');void p.offsetWidth;p.classList.add('flash')}
$('smelt').onclick=()=>{const k=[...S.slots],r=smeltOnce();if(r){S.slots=canSmeltWith(k)?k:S.slots.map(x=>x&&cnt(x)?x:null);showResult(r);renderForge();renderBook();renderHeader()}};
$('smeltMax').onclick=()=>{const k=[...S.slots];let ok=0,gr=0,bd=0,n=0;while(canSmeltWith(k)&&n<999){S.slots=[...k];const r=smeltOnce();n++;if(r.kind==='ok')ok++;else if(r.kind==='great')gr++;else bd++}
  S.slots=canSmeltWith(k)?k:k.map(x=>x&&cnt(x)?x:null);if(n){showResult({kind:bd>ok+gr?'bad':'ok',msg:`${n}번 합성: 성공 ${ok} · 대성공 ${gr} · 실패 ${bd}`});renderForge();renderBook();renderHeader()}};
$('slotA').onclick=()=>{S.slots[0]=null;renderForge()};$('slotB').onclick=()=>{S.slots[1]=null;renderForge()};
$('pickGrid').addEventListener('click',e=>{const b=e.target.closest('[data-pk]');if(b)placeInSlot(b.dataset.pk)});
function renderForge(){
  const ids=ORDER.filter(id=>cnt(id)>0);
  $('pickGrid').innerHTML=ids.length?ids.map(id=>`<button class="pk${S.slots.includes(id)?' in':''}" data-pk="${id}" type="button">${ico(id)}<span>${ITEMS[id].n}</span><span class="c">${big(cnt(id))}</span></button>`).join(''):'<span class="dim">창고가 비어 있어요. 채굴부터 해 보세요.</span>';
  [0,1].forEach(i=>{const id=S.slots[i],el=$(i?'slotB':'slotA');if(id){el.className='slot filled';el.innerHTML=`${ico(id,'lg')}<span>${ITEMS[id].n}</span><span class="dim">보유 ${big(cnt(id))} · 눌러서 빼기</span>`}else{el.className='slot';el.innerHTML=`<span class="dim">재료 ${i+1}<br>아래에서 고르기</span>`}});
  const ok=canSmeltWith(S.slots);$('smelt').disabled=!ok;$('smeltMax').disabled=!ok;
  const[a,b]=S.slots;let t=`성공 ${Math.round(successRate()*100)}% · 대성공 ${Math.round(greatRate()*100)}%`;
  if(a&&b){const idx=RMAP[key(a,b)];if(idx!=null&&S.found.includes(idx)){const o=RECIPES[idx].out,inV=bid(a)+bid(b),outV=bid(o)*(successRate()+greatRate()),pc=outV/inV-1;
    t=`${ico(o,'sm')} ${ITEMS[o].n} · 재료 ${pf(inV)}G → 기대 ${pf(outV)}G <span class="${pc>=0?'good':'bad'}">(${pc>=0?'+':''}${Math.round(pc*100)}%)</span>`}else t='결과: 알 수 없음 · '+t}
  $('preview').innerHTML=t;
}
function renderBook(){
  $('bookCount').textContent=`${S.found.length} / ${RECIPES.length}`;$('bookCount2').textContent=`도감 ${S.found.length}/${RECIPES.length}`;
  $('book').innerHTML=RECIPES.map((r,i)=>{if(S.found.includes(i))return`<div class="rec">${ico(r.out)}<span>${ITEMS[r.a].n} + ${ITEMS[r.b].n} → <b>${ITEMS[r.out].n}</b><span class="tier">B${r.L}</span><br><span class="dim">${pf(bid(r.out))}G</span></span><button class="px-btn sm" data-fill="${i}" type="button">넣기</button></div>`;
    if(r.L>S.unlocked)return`<div class="rec unk"><span class="ico sm" style="opacity:.2"></span><span>? + ? · 더 깊은 곳의 비밀<span class="tier">B${r.L}</span></span><span></span></div>`;
    return`<div class="rec unk">${'<i class="ico sm ic-'+r.out+'" style="filter:brightness(0) opacity(.35)"></i>'}<span>? + ? · ${r.hint}<span class="tier">B${r.L}</span></span><span></span></div>`}).join('');
}
$('book').addEventListener('click',e=>{const b=e.target.closest('[data-fill]');if(!b)return;const r=RECIPES[+b.dataset.fill];S.slots=[r.a,r.b];renderForge();$('forgePanel').scrollIntoView({behavior:'smooth',block:'start'})});
