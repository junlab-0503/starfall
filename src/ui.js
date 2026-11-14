/* ═════════ 화면 ═════════ */
// 칸보다 글자가 길면 글씨를 줄여서 잘리지 않게 (말줄임표 대신)
function fitText(el,t){if(el.textContent===t&&el.dataset.fit)return;el.textContent=t;el.dataset.fit=1;el.style.fontSize='';for(const fs of[13,12,11,10]){if(el.scrollWidth<=el.clientWidth)break;el.style.fontSize=fs+'px'}}
function renderHeader(){
  fitText($('gold'),big(S.gold)+'G');$('depth').textContent=`−${fmt(LAYERS[S.layer].d)}m`;
  const u=used(),c=cap(),st=$('store');fitText(st,`${cbig(u)}/${cbig(c)}`);st.style.color=u>=c?'var(--bad)':u>=c*.85?'var(--lamp)':'';
  $('towerStat').textContent=big(S.floors)+'층';
  const B=badges();$('towerDot').hidden=!B.tower;$('manageDot').hidden=!B.manage;$('equipDot').hidden=!B.equip;$('shaftDot').hidden=!B.shaft;
}
// 빨간 점: 지금 할 수 있는 업그레이드·개척·탑 짓기·월세가 있으면 탭 → 하위 탭 → 그 버튼까지
function badges(){const equip=SHOPS.some(sh=>sh.ups.some(upCan)),shaft=S.unlocked<LAYERS.length&&reqMet(LAYERS[S.unlocked]),
  build=!towerBlocked()&&canBuild(floorCost(S.floors+1)),rent=S.rentAcc>=rentPerSec()*1800&&rentPerSec()>0,fin=towerBlocked()&&cnt('philo')>=1&&cnt('starshard')>=10;
  return{equip,shaft,manage:shaft,build,rent,tower:build||rent||fin}}
function renderMineHud(){
  const f=used()>=cap(),ab=$('autoBtn'),bx=$('boxBtn'),bu=boxUsed();
  ab.hidden=!(S.auto>0);ab.classList.toggle('on',!!S.autoOn);ab.classList.toggle('full',!!S.autoOn&&f);ab.setAttribute('aria-checked',S.autoOn?'true':'false');
  // 스위치 하나가 켜 둔 동안과 자리 비운 동안 모두를 정함
  $('autoSt').textContent=S.autoOn?'드릴 ON':'드릴 OFF';$('autoSub').textContent=S.autoOn?(f?'창고 가득 · 보관함에 모아요':'자리 비워도 캐요'):'자리 비워도 쉬어요';
  bx.hidden=!(S.auto>0||bu>0);bx.classList.toggle('has',bu>0);$('boxN').textContent=bu>0?cbig(bu):'';
  const vb=$('veinBn'),vo=veinOn();vb.hidden=!vo;if(vo)$('veinBar').style.width=Math.round(clamp(S.vein.left/VEIN_SEC,0,1)*100)+'%';
  $('devVein').hidden=!S.dev;
  renderAdBtns();renderNextL();
  setHTML($('layerChips'),LAYERS.map((l,i)=>i<S.unlocked?`<button class="chip${i===S.layer?' on':''}" data-chip="${i}" type="button">B${i+1} ${l.n}</button>`:i===S.unlocked?`<button class="chip lock" data-chiplock="1" type="button">B${i+1} 개척하기 →</button>`:'').join(''));
}
// 다음 지층까지: 개척에 필요한 골드 · 재료가 얼마나 모였는지 (다 모이면 누르면 바로 개척)
function renderNextL(){const el=$('nextL'),i=S.unlocked;if(i>=LAYERS.length){setHTML(el,'<span class="nl-h">모든 지층을 개척했어요. 이제 탑을 쌓아 별을 돌려보내요</span>');el.classList.remove('ready');return}
  const L=LAYERS[i],ok=reqMet(L),parts=[['',S.gold,L.req.g]].concat(Object.entries(L.req.items).map(([id,n])=>[id,cnt(id),n]));
  setHTML(el,`<span class="nl-h">B${i+1} ${L.n} 개척까지${ok?' <b>준비 완료! 눌러서 개척</b>':''}</span><span class="nl-r">${parts.map(([id,h,n])=>`<span class="nl-i${h>=n?' ok':''}">${ico(id||'coin','sm')}<span>${id?`${Math.min(h,n)}/${n}`:`${big(Math.min(h,n))}/${big(n)}G`}</span><i class="nl-bar"><i style="width:${Math.round(clamp(h/n,0,1)*100)}%"></i></i></span>`).join('')}</span>`);
  el.classList.toggle('ready',ok)}
$('nextL').onclick=()=>{const i=S.unlocked;if(i<LAYERS.length&&reqMet(LAYERS[i]))unlockLayer(i);else{S.sub='shaft';setTab('manage')}};
['autoBtn','boxBtn'].forEach(k=>$(k).addEventListener('pointerdown',e=>e.stopPropagation()));
$('boxBtn').onclick=e=>{e.stopPropagation();openBox()};
/* 채굴 보관함 창: 종류별로 골라 [저장](창고로) 또는 [팔기](지금 파는 값으로 골드). 맨 아래 [모두 저장] */
function boxHtml(){const ids=ORDER.filter(id=>(S.box||{})[id]>0),sp=space();
  return(ids.length?`<div class="boxl">${ids.map(id=>`<div class="boxr">${ico(id,'sm')}<span class="bn">${ITEMS[id].n}</span><span class="dim">×${big(S.box[id])}</span><button class="px-btn sm" data-boxget="${id}" type="button" ${sp>0?'':'disabled'}>저장</button><button class="px-btn sm" data-boxsell="${id}" type="button">팔기</button></div>`).join('')}</div>`:'<p class="dim" style="margin:0 0 8px">보관함이 비어 있어요. 드릴 로봇과 출입권이 모은 광석이 여기에 쌓여요.</p>')
    +`<div class="row-btns" style="margin-top:8px"><span class="dim grow small" style="text-align:left">창고 빈칸 ${big(sp)}칸</span><button class="px-btn lamp" data-boxget="all" type="button" ${ids.length&&sp>0?'':'disabled'}>모두 저장</button></div>`}
const boxCard=()=>({box:1,btn:'닫기',k:'채굴 보관함',t:`${big(boxUsed())} / ${big(boxCap())}칸`,b:'종류별로 골라서 창고에 저장하거나 바로 팔 수 있어요.',extra:boxHtml()});
function openBox(){story([boxCard()])}
function boxRefresh(){if(STC&&STC.box&&!$('story').hidden){$('storyT').textContent=`${big(boxUsed())} / ${big(boxCap())}칸`;$('storyX').innerHTML=boxHtml()}renderAll()}
$('storyX').addEventListener('click',e=>{const b=e.target.closest('[data-boxget]'),sl=e.target.closest('[data-boxsell]');
  if(b){if(b.dataset.boxget==='all'){collectBox();boxRefresh();return}
    const id=b.dataset.boxget,k=Math.min(S.box[id]||0,space());if(k>0){add(id,k);S.box[id]-=k;if(S.box[id]<=0)delete S.box[id];sfx('gain')}else toast('창고가 가득 차서 옮길 수 없어요. 먼저 팔거나 재련해 보세요.');boxRefresh()}
  if(sl){const id=sl.dataset.boxsell,n=S.box[id]||0;if(n>0){const t=bid(id)*n;delete S.box[id];S.gold+=t;S.earned+=t;S.bestSale=Math.max(S.bestSale,t);sfx('coin');log(`채굴 보관함의 ${ITEMS[id].n} ${big(n)}개 판매: +${big(t)}G`)}boxRefresh()}});
function collectBox(){let moved=0,left=0;for(const id of Object.keys(S.box||{})){const k=Math.min(S.box[id],space());if(k>0){add(id,k);S.box[id]-=k;moved+=k}if(S.box[id]<=0)delete S.box[id];else left+=S.box[id]}
  if(moved)toast(`채굴 보관함의 광석 ${big(moved)}개를 창고에 옮겼어요.${left?` (창고가 차서 ${big(left)}개는 보관함에 남았어요)`:''}`);else if(left)toast('창고가 가득 차서 옮길 수 없어요. 먼저 팔거나 재련해 보세요.');else toast('채굴 보관함이 비어 있어요.');renderAll()}
$('autoBtn').onclick=e=>{e.stopPropagation();S.autoOn=!S.autoOn;sfx('click');toast(S.autoOn?'드릴 로봇을 켰어요. 켜 두면 자리를 비운 동안에도 캐요.':'드릴 로봇을 껐어요. 자리를 비운 동안에도 쉬어요.');renderMineHud()};
// 개발자: 황금 광맥 바로 부르기
$('veinPop').onclick=()=>setTab('mine');
$('devVein').onclick=()=>{if(!S.dev)return;if(S.vein)endVein();startVein()};
// 확률 보기: 지금 지층에서 광석이 나올 확률
$('oddsBtn').onclick=()=>{const L=LAYERS[S.layer],dw=dropW(S.layer),tot=dw.reduce((s,d)=>s+d[1],0),rows=dw.slice().sort((a,b)=>(ITEMS[b[0]].L===S.layer+1)-(ITEMS[a[0]].L===S.layer+1)||b[1]-a[1]).map(([id,w])=>`<span>${ico(id,'sm')} ${S.seen.includes(id)?ITEMS[id].n:'???'}${ITEMS[id].L!==S.layer+1?` <span class="dim">B${ITEMS[id].L}</span>`:''}</span><span>${pctTxt(w/tot)}</span>`).join('');
  story([{k:'확률 보기',t:`B${S.layer+1} ${L.n}`,b:'바위를 하나 깰 때 나오는 광석이에요. 이 지층 광석이 주로 나오고, 지금 필요한 위 지층 광석도 조금 섞여 나와요.',extra:`<div class="rcard odds-list">${rows}</div>`}])};
const pctTxt=p=>p>=.1?Math.round(p*100)+'%':p>=.01?(p*100).toFixed(1)+'%':(p*100).toFixed(2)+'%';
$('layerChips').addEventListener('click',e=>{const c=e.target.closest('[data-chip]');if(c){setLayer(+c.dataset.chip);return}if(e.target.closest('[data-chiplock]')){S.sub='shaft';setTab('manage')}});
/* 갱도 */
const reqMet=L=>!L.req||(S.gold>=L.req.g&&Object.entries(L.req.items).every(([id,n])=>cnt(id)>=n));
function unlockLayer(i){const L=LAYERS[i];if(!reqMet(L)||i!==S.unlocked)return;S.gold-=L.req.g;Object.entries(L.req.items).forEach(([id,n])=>add(id,-n));S.unlocked=i+1;setLayer(i);
  log(`${L.n} 개척! (−${fmt(L.d)}m)`,true);revealJournal(i);setTab('mine');renderAll()}
function renderLayers(){
  setHTML($('layers'),LAYERS.map((L,i)=>{const d=`<span class="d">B${i+1}<br>${fmt(L.d)}m</span>`;
    if(i<S.unlocked)return`<button class="layer${i===S.layer?' on':''}" data-go="${i}" type="button">${d}<span><span class="nm">${L.n}</span><br><span class="dim">${RAW.filter(id=>ITEMS[id].L===i+1).map(id=>S.seen.includes(id)?ITEMS[id].n:'???').join(' · ')}</span></span><span class="dim">${i===S.layer?'채굴 중':'가기'}</span></button>`;
    if(i===S.unlocked){const parts=[`<span class="${S.gold>=L.req.g?'ok':''}">${big(L.req.g)}G</span>`].concat(Object.entries(L.req.items).map(([id,n])=>`<span class="${cnt(id)>=n?'ok':''}">${S.seen.includes(id)?ITEMS[id].n:'???'} ${Math.min(cnt(id),n)}/${n}</span>`));
      return`<div class="layer lock">${d}<span><span class="nm">${L.n}</span><br><span class="req dim">필요: ${parts.join(' · ')}</span></span><button class="px-btn lamp sm${reqMet(L)?' ndot':''}" data-unlock="${i}" type="button" ${reqMet(L)?'':'disabled'}>개척</button></div>`}
    return`<div class="layer lock">${d}<span><span class="nm">???</span><br><span class="dim">더 깊은 곳</span></span><span></span></div>`}).join(''));
}
$('layers').addEventListener('click',e=>{const g2_=e.target.closest('[data-go]');if(g2_){setLayer(+g2_.dataset.go);setTab('mine');return}const u=e.target.closest('[data-unlock]');if(u)unlockLayer(+u.dataset.unlock)});
/* 창고 */
function renderInv(){const ids=ORDER.filter(id=>cnt(id)>0);$('invCap').textContent=`${big(used())}/${big(cap())}칸`;
  patchList($('inv'),ids,ids.map(id=>[`×${big(cnt(id))}`,`${pf(bid(id))}G`]),(id,P)=>`<div class="irow"><button class="nmb" data-mk="${id}" type="button">${ico(id,'sm')}<span>${ITEMS[id].n}</span></button><span class="dim">${P[0]}</span><span>${P[1]}</span><span class="acts"><button class="px-btn sm" data-sellq="${id}" type="button">판매</button></span></div>`,'<p class="dim">창고가 비어 있어요.</p>',[1,2])}
function doSell(id,n){const k=n==='all'?cnt(id):+n;const t=sell(id,k);if(t){log(`${ITEMS[id].n} ${k}개 판매: +${big(t)}G`);S.slots=S.slots.map(x=>x&&cnt(x)?x:null)}renderAll()}
$('inv').addEventListener('click',e=>{const s=e.target.closest('[data-sellq]');if(s){openQty(s.dataset.sellq);return}const m=e.target.closest('[data-mk]');if(m){S.mkSub='ore';setTab('market')}});
$('sellRaw').onclick=()=>{let t=0;ORDER.filter(id=>!ITEMS[id].cr&&cnt(id)).forEach(id=>t+=sell(id,cnt(id)));if(t)log(`원석 일괄 판매: +${big(t)}G`,true);S.slots=S.slots.map(x=>x&&cnt(x)?x:null);renderAll()};
function renderLog(){const el=$('log');if(el)setHTML(el,S.log.slice(0,40).map(l=>`<div>${l}</div>`).join(''))}
/* 도감·일지·기록 */
function revealJournal(i){if(S.journal.includes(i))return;S.journal.push(i);const ev=LAYER_EVENT[i+1];
  story([{gold:1,k:`할아버지의 일지 · ${S.journal.length}/13`,t:`B${i+1} ${LAYERS[i].n}`,b:(ev?ev+'\n\n':'')+`"${JOURNAL[i]}"`}])}
function renderBookTab(){
  $('jCount').textContent=`${S.journal.length}/13`;
  setHTML($('journal'),LAYERS.map((L,i)=>S.journal.includes(i)?`<button class="jp" data-jp="${i}" type="button"><span class="dim">B${i+1} ${L.n}</span><br>"${JOURNAL[i].slice(0,34)}…"</button>`:`<div class="jp unk">B${i+1} · 아직 찾지 못한 장</div>`).join(''));
  $('dexCount').textContent=`${S.seen.length}/${ORDER.length}`;
  setHTML($('dex'),ORDER.map(id=>`<button class="dx${S.seen.includes(id)?'':' unk'}" data-dx="${id}" type="button" aria-label="${S.seen.includes(id)?ITEMS[id].n:'아직 모르는 광물'}">${ico(id)}</button>`).join(''));
  const mins=Math.round((gtime()-S.t0)/60000);
  setHTML($('records'),[['플레이 시간',`${Math.floor(mins/60)}시간 ${mins%60}분`],['캔 광석',big(S.mined)+'개'],['재련',big(S.crafts)+'번'],['레시피',`${S.found.length}/${RECIPES.length}`],['번 골드',big(S.earned)+'G'],['가장 큰 거래',big(S.bestSale)+'G'],['탑',S.floors+'층'],['입주자',BON.done+'/13']].map(r=>`<span>${r[0]}</span><span>${r[1]}</span>`).join(''))}
$('journal').addEventListener('click',e=>{const b=e.target.closest('[data-jp]');if(!b)return;const i=+b.dataset.jp;story([{k:'할아버지의 일지',t:`B${i+1} ${LAYERS[i].n}`,b:`"${JOURNAL[i]}"`}])});
/* 장터: [지층 출입권] 소문을 읽고 사고팔기 · [광물 거래] 정해진 값 */
const pctHtml=v=>{const p=Math.round((v-1)*100);if(p===0)return'<span class="pct dim">평소</span>';return`<span class="pct ${p>0?'good':'bad'}">${p>0?'▲':'▼'}${Math.abs(p)}%</span>`};
const mm=s=>{s=Math.max(0,Math.ceil(s/60));return s>=60?`${Math.floor(s/60)}시간 ${s%60}분`:`${s}분`};
function srcRecTxt(n){const r=S.srcRec[n];return r&&r.n?`지금까지 ${r.n}번 중 ${r.h}번 맞음`:'아직 기록 없음'}
function renderMarket(){if(S.tab!=='market')return;const luka=tenantIn('루카');if(!luka)S.mkSub='ore';$('mkSeg').hidden=!luka;const sub=S.mkSub==='ore'?'ore':'pass';document.querySelectorAll('#mkSeg button').forEach(b=>b.classList.toggle('on',b.dataset.mks===sub));$('mkPass').hidden=sub!=='pass';$('mkOre').hidden=sub!=='ore';
  if(sub==='pass'){
    // 소문 게시판
    let h=S.rum.map(r=>{const left=r.dur-r.t,f=r.t/r.dur;
      return`<div class="rum"><div class="rh"><b>${r.src}</b> <span class="dim">· ${srcRecTxt(r.src)}</span></div><p>"${rumorSay(r)}"</p>
        <div class="rtags">${r.echo.length?`<span class="tg">같은 말: ${r.echo.join(', ')}</span>`:''}${r.clue?`<span class="tg good">B${r.L+1} 단서 ${r.clue}개</span>`:''}${r.hint!=null?`<span class="tg ${r.hint?'good':'bad'}">정보원: ${r.hint?'믿을 만해요':'수상해요'}</span>`:''}<span class="tg">B${r.L+1} 출입권 ${pctHtml(passPrice(r.L)/passBase(r.L))}</span></div>
        <div class="bar"><i style="width:${f*100}%"></i></div><div class="dim small">조사단 발표까지 약 ${mm(left)}</div></div>`}).join('');
    h+=S.rumDone.map(d=>`<div class="rum done"><div class="rh"><b>${d.src}</b> <span class="${d.truth?'good':'bad'}">${d.truth?'사실이었어요':'헛소문이었어요'}</span></div><p class="dim">"${d.txt}"</p><div class="small">B${d.L+1} 출입권 <span class="${d.ch>=0?'good':'bad'}">${d.ch>=0?'+':''}${Math.round(d.ch*100)}%</span>${d.held?` · 내가 가진 ${d.held}장`:''}</div></div>`).join('');
    if(!h)h=`<p class="dim small" style="margin:0">아직 도는 소문이 없어요. 장터에 있다 보면 소문이 들려와요.</p>`;
    setHTML($('rumors'),h);$('rumInfo').textContent=S.rum.length<2?`다음 소문 약 ${mm(S.rumT)} 뒤`:'';
    // 출입권 목록
    const L=[...Array(S.unlocked).keys()],mx=passMax(),pv=passValue();$('passInfo').textContent=pv?`가진 출입권 ${big(pv)}G`:`지층마다 ${mx}장까지`;
    patchList($('passes'),L,L.map(i=>{const v=passPrice(i),hd=S.pass[i],n=passHeld(i),ret=n?v*n/hd.c-1:null,ch=v/passBase(i);
      return[`${pf(v)}G ${pctHtml(ch)}`,n?`${n}/${mx}장 · 수익률 <span class="${ret>=0?'good':'bad'}">${ret>=0?'+':''}${Math.round(ret*100)}%</span>`:`0/${mx}장`,
        `1장마다 시간당 약 ${pf(passDiv(i)*3600)}G어치 광석이 들어와요`,`<button class="px-btn sm" data-pb="${i}" data-n="1" type="button" ${S.gold<v||n>=mx?'disabled':''}>1장</button><button class="px-btn sm" data-pb="${i}" data-n="max" type="button" ${S.gold<v||n>=mx?'disabled':''}>최대</button><button class="px-btn sm" data-ps="${i}" type="button" ${n?'':'disabled'}>팔기</button>`]}),
      (i,P)=>`<div class="prow"><span class="pn"><b>B${i+1}</b> ${LAYERS[i].n}</span><span class="pv">${P[0]}</span><span class="ph">${P[1]}</span><span class="pd dim">${P[2]}</span><span class="pbtn">${P[3]}</span></div>`,'',[1,2,3,4])}
  else{const ids=ORDER.filter(id=>S.seen.includes(id));
    patchList($('oreList'),ids,ids.map(id=>[`×${big(cnt(id))}`,`<span class="good">${pf(bid(id))}</span> / <span class="lamp">${pf(ask(id))}</span>G`]),
      (id,P)=>`<div class="orow">${ico(id,'sm')}<span>${ITEMS[id].n} <span class="dim">${P[0]}</span></span><span class="small">${P[1]}</span><span class="acts"><button class="px-btn sm" data-osell="${id}" type="button">팔기</button><button class="px-btn sm" data-obuy="${id}" type="button">사기</button></span></div>`,'<p class="dim">광물을 캐면 여기에 나와요.</p>',[1,2])}}
$('mkSeg').addEventListener('click',e=>{const b=e.target.closest('[data-mks]');if(b){S.mkSub=b.dataset.mks;renderMarket()}});
$('passes').addEventListener('click',e=>{const b=e.target.closest('[data-pb]'),s_=e.target.closest('[data-ps]');
  if(b){const i=+b.dataset.pb,r=passBuy(i,b.dataset.n==='max'?999:1);if(r.k){sfx('buy');toast(`B${i+1} 출입권 ${r.k}장을 ${big(r.t)}G에 샀어요.`)}renderAll()}
  if(s_){const i=+s_.dataset.ps,r=passSell(i,999);if(r.k){sfx('coin');toast(`B${i+1} 출입권 ${r.k}장을 ${big(r.t)}G에 팔았어요 (${r.gain>=0?'+':''}${big(r.gain)}G).`)}renderAll()}});
$('oreList').addEventListener('click',e=>{const s_=e.target.closest('[data-osell]'),b=e.target.closest('[data-obuy]');if(s_)openQty(s_.dataset.osell,'sell');if(b)openQty(b.dataset.obuy,'buy')});
/* 이야기 창 */
const STQ=[];
function story(cards){STQ.push(...cards);if($('story').hidden)nextStory()}
// done: 카드가 뜰 때, after: 그 카드를 넘긴 뒤(창이 닫히거나 다음 카드로)
let STC=null;
function nextStory(){const prev=STC,c=STQ.shift();STC=c||null;if(!c){$('story').hidden=true;if(prev&&prev.after)prev.after();return}if(prev&&prev.after)prev.after();
  $('storyKick').textContent=c.k||'';$('storyT').textContent=c.t||'';$('storyB').innerHTML=T(c.b||'').replace(/\n/g,'<br>');$('storyX').innerHTML=c.extra||'';
  const p=$('portrait'),pa=$('portraitArt'),art=c.art&&typeof ART!=='undefined'&&ART[c.art];pa.hidden=!art;if(art){pa.src=art;pa.alt=c.t||''}
  if(c.portrait&&!art){p.hidden=false;drawPortrait(p,c.portrait,!!c.hide)}else p.hidden=true;$('storyNext').textContent=c.btn||(STQ.length?'다음':'계속');$('story').querySelector('.story-card').classList.toggle('gold',!!c.gold);$('story').hidden=false;if(c.done)c.done()}
$('storyNext').onclick=nextStory;
/* 탭 */
const TABS=['mine','equip','forge','market','tower','manage'];
function setTab(t){if(!TABS.includes(t))t='mine';S.tab=t;document.querySelector('main').classList.toggle('mine-mode',t==='mine');document.querySelector('main').scrollTop=0;TABS.forEach(k=>$('tab-'+k).hidden=k!==t);document.querySelectorAll('.nb').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));
  if(t==='mine')setTimeout(()=>{fitScene();if(!IW)sceneResize()},0);if(t==='market')$('newsDot').hidden=true;veinPop();renderTab();scrollTo(0,0)}
document.querySelectorAll('.nb').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
$('seg').addEventListener('click',e=>{const b=e.target.closest('[data-sub]');if(!b)return;S.sub=b.dataset.sub;renderManage()});
function renderManage(){['store','shaft','book','set'].forEach(k=>$('sub-'+k).hidden=k!==S.sub);document.querySelectorAll('#seg button').forEach(b=>b.classList.toggle('on',b.dataset.sub===S.sub));
  if(S.sub==='store'){renderInv();renderLog()}if(S.sub==='shaft')renderLayers();if(S.sub==='book')renderBookTab();if(S.sub==='set'){renderPkg();renderSnd()}}
function renderTab(force){renderHeader();if(S.tab==='mine')renderMineHud();if(S.tab==='forge'){renderForge();renderBook()}if(S.tab==='market')renderMarket(force);if(S.tab==='tower')renderTower();if(S.tab==='equip')renderEquip();if(S.tab==='manage')renderManage()}
function renderAll(){renderTab(true)}
/* 아래 탭 아이콘 (도트) */
// 아래 탭 아이콘(사용자 그림 art/ui/nav_*.png)
function navIcons(){const st=document.createElement('style');st.textContent=['mine','equip','forge','market','tower','manage'].map(k=>`.ni-${k}{background-image:url(${ART['ui_nav_'+k]})}`).join('');(document.body||document.head).appendChild(st)}

/* 광고 두 가지 + 광고 제거 패키지 (프로토타입: 가짜 광고 화면, 결제 없음) */
const mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`};
function renderAdBtns(){const now=gtime(),gl=giftLeft(),gb=$('giftBtn');gb.disabled=gl<=0;gb.classList.toggle('ready',gl>0);$('giftTag').textContent=gl>0?`${gl}/${GIFT_MAX}`:'내일';
  const bb=$('boostBtn'),bl=boostLeft(),on=boostOn();bb.disabled=on||bl<=0;bb.classList.toggle('live',on);bb.classList.toggle('ready',!on&&bl>0);$('boostTag').textContent=on?mmss(S.ads.boostUntil-now):bl>0?`×2 ${bl}/${BOOST_MAX}`:'내일'}
let AD_CB=null,AD_T=null;
function showAd(title,cb){if(S.noAds){cb();return}AD_CB=cb;$('adT').textContent=title;let n=5;$('adCnt').textContent=n;$('adDone').disabled=true;$('adModal').hidden=false;clearInterval(AD_T);
  AD_T=setInterval(()=>{n--;$('adCnt').textContent=n>0?n:'끝!';if(n<=0){clearInterval(AD_T);$('adDone').disabled=false}},1000)}
$('adDone').onclick=()=>{$('adModal').hidden=true;const cb=AD_CB;AD_CB=null;if(cb)cb()};
$('adCancel').onclick=()=>{clearInterval(AD_T);$('adModal').hidden=true;AD_CB=null};
// 켜 두고 직접 캘 때(탭 + 자동 드릴) 초당 버는 골드
function playIncome(){const L=S.layer,d=LAYERS[L].drops,tot=d.reduce((s,x)=>s+x[1],0),avg=d.reduce((s,x)=>s+bid(x[0])*x[1],0)/tot;return playRate()*avg}
// 선물 상자: 켜 두고 15분 동안 캔 만큼의 골드 (하루 5번). 화면엔 시간 환산을 쓰지 않는다
function openGift(){if(!giftReady())return;showAd('숯의 선물 상자',()=>{if(!giftReady())return;adsDay().gift++;
  const gold=Math.max(50,Math.round(playIncome()*15*60));S.gold+=gold;
  A.joy=1;story([{k:'숯의 선물 상자',t:'숯이 상자를 물어 왔어요',b:'숯이 꼬리를 흔들며 상자를 내려놓았다.',extra:`<div class="rcard"><span>골드</span><span>+${big(gold)}G</span><span>오늘 남은 상자</span><span>${giftLeft()}/${GIFT_MAX}</span></div>`}]);renderAll()})}
// 10분 동안 채굴 2배 (하루 10번, 켜져 있는 동안은 다시 못 씀)
function startBoost(){if(boostOn()||boostLeft()<=0)return;showAd('10분 동안 채굴 2배',()=>{if(boostOn()||boostLeft()<=0)return;adsDay().boost++;S.ads.boostUntil=gtime()+10*60000;A.joy=1;toast(`10분 동안 곡괭이와 자동 드릴이 2배로 강해져요! (오늘 ${boostLeft()}번 남음)`);renderAll()})}
$('giftBtn').onclick=openGift;$('boostBtn').onclick=startBoost;
$('buyPkg').onclick=()=>{if(S.noAds)return;$('shopModal').hidden=false};
$('shopCancel').onclick=()=>$('shopModal').hidden=true;
$('shopOk').onclick=()=>{S.noAds=true;$('shopModal').hidden=true;log('광고 제거 패키지가 적용됐어요. 고마워요!',true);renderAll()};
function renderPkg(){const b=$('buyPkg');b.disabled=S.noAds;b.textContent=S.noAds?'구매 완료':'구매하기';$('pkgState').textContent=S.noAds?'적용 중':'';const pr=pkgPrice();$('pkgPrice').textContent=pr;$('pkgPrice2').textContent=pr}
// 광고 제거 패키지 값: 나라별(기기 지역) 한국 5,900원 · 대만 NT$149 · 그 밖(미국 기준) US$4.99. 출시 땐 스토어가 알려 주는 현지 가격으로 바꿀 자리
function pkgRegion(){const L=[].concat(navigator.languages||[],navigator.language||[]);for(const l of L){const m=String(l).match(/^([a-z]{2,3})(?:-([A-Za-z]{4}))?(?:-([A-Za-z]{2}))?/i);if(!m)continue;const lg=m[1].toLowerCase(),sc=(m[2]||'').toLowerCase(),rg=(m[3]||'').toUpperCase();
  if(rg)return rg==='KR'||rg==='TW'?rg:'US';if(lg==='ko')return'KR';if(lg==='zh'&&sc==='hant')return'TW'}return'US'}
const pkgPrice=()=>({KR:'5,900원',TW:'NT$149'})[pkgRegion()]||'US$4.99';
/* 버그 제보: 메일 앱으로(받는 사람 · 제목 · 본문에 기기 정보). 받는 주소 BUG_MAIL은 빌드 때 bug_mail.txt에서 넣음 */
const GAME_VER='v19';
function bugMail(){const t=$('bugText').value.trim(),info=[`버전 ${GAME_VER}`,`언어 ${typeof LANG!=='undefined'?LANG:'ko'}`,`기기 ${navigator.userAgent}`,`화면 ${innerWidth}×${innerHeight}`,`진행: B${S.unlocked} · 탑 ${S.floors}층 · 곡괭이 ${S.pick} · 드릴 ${S.auto}`].join('\n');
  return'mailto:'+BUG_MAIL+'?subject='+encodeURIComponent('[별빛광맥] 버그 제보')+'&body='+encodeURIComponent((t||'(내용)')+'\n\n— — —\n'+info)}
$('bugTo').textContent=BUG_MAIL;
$('bugText').addEventListener('input',()=>{$('bugSend').href=bugMail()});
$('bugSend').addEventListener('click',e=>{const t=$('bugText').value.trim();if(!BUG_MAIL){e.preventDefault();toast('받는 메일 주소가 아직 설정되지 않았어요.');return}if(!t){e.preventDefault();toast('무엇이 이상했는지 먼저 적어 주세요.');return}e.currentTarget.href=bugMail();setTimeout(()=>{toast('메일 앱에서 [보내기]를 누르면 제보가 전달돼요. 고마워요!')},300)});

/* 수량 입력 판매 */
let QTY=null,QM='sell';
const qtyMax=()=>QM==='sell'?cnt(QTY):Math.max(0,Math.min(Math.floor(S.gold/ask(QTY)),space()));
function openQty(id,mode){QM=mode||'sell';QTY=id;const mx=qtyMax();if(!mx){toast(QM==='sell'?'가진 게 없어요.':'골드나 창고 자리가 모자라요.');QTY=null;return}
  $('qtyT').innerHTML=`${ico(id)} ${ITEMS[id].n}`;$('qtyKick').textContent=QM==='sell'?'판매':'구매';$('qtyOk').textContent=QM==='sell'?'판매하기':'구매하기';$('qtyIn').max=mx;$('qtyIn').value=QM==='sell'?mx:Math.min(mx,10);updQty();$('qtyModal').hidden=false}
function qtyVal(){return clamp(Math.floor(+$('qtyIn').value||0),0,qtyMax())}
function updQty(){const n=qtyVal();$('qtySum').textContent=n?(QM==='sell'?`${big(n)}개 판매 · ${big(quote(QTY,n,-1))}G (보유 ${big(cnt(QTY))}개)`:`${big(n)}개 구매 · ${big(quote(QTY,n,1))}G (최대 ${big(qtyMax())}개)`):'수량을 입력해 주세요';$('qtyOk').disabled=!n}
$('qtyIn').addEventListener('input',updQty);
$('qtyModal').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b)return;const v=b.dataset.q,c=qtyMax();$('qtyIn').value=v==='all'?c:v==='half'?Math.max(1,Math.floor(c/2)):clamp(qtyVal()+(+v),1,c);updQty()});
$('qtyCancel').onclick=()=>{$('qtyModal').hidden=true;QTY=null};
$('qtyOk').onclick=()=>{const n=qtyVal();if(n&&QTY){if(QM==='sell')doSell(QTY,n);else{const r=buy(QTY,n);if(r.k){sfx('buy');toast(`${ITEMS[QTY].n} ${r.k}개를 ${big(r.t)}G에 샀어요.`)}renderAll()}}$('qtyModal').hidden=true;QTY=null};
/* 도감: 광물 설명 */
const SHAPE_TXT={chunk:'단단한 바위 덩어리예요.',speck:'반점이 박힌 돌이에요.',clay:'손으로 빚을 수 있는 말랑한 흙이에요.',ore:'모암 속에 금속 알갱이가 박혀 있어요. 불에 녹이면 쓸 수 있어요.',coal:'잘 타는 검은 돌이에요. 대장간과 용광로의 연료예요.',shard:'날카롭게 깨지는 돌이에요.',cube:'반듯한 정육면체로 자라는 결정이에요.',cluster:'바위 위로 결정 기둥이 솟아 있어요. 갈아 내면 빛이 살아나요.',lump:'동글동글하게 뭉친 덩어리예요.',void:'들여다보면 빛을 빨아들이는 것 같은 돌이에요.',pearl:'깊은 물속에서 자란 진주예요.',fossil:'아주 오래전 바다의 흔적이에요.',meteor:'하늘에서 떨어진 쇳덩이예요.',opal:'보는 각도마다 색이 바뀌는 보석이에요.',star:'등불별이 떨어지며 남긴 조각이에요. 아직 따뜻해요.',dust:'손가락 사이로 반짝이며 흘러내리는 가루예요.',ember:'꺼지지 않고 타는 작은 불씨예요.',slag:'재련에 실패하면 남는 찌꺼기예요. 값은 거의 없어요.',block:'단단하게 굳힌 건축 재료예요.',wire:'길게 뽑아 감은 금속 줄이에요.',ingot:'녹여서 굳힌 금속 덩어리예요.',vase:'정성껏 구운 그릇이에요.',slab:'날을 세우는 데 쓰는 납작한 돌이에요.',gear:'기계를 움직이는 부품이에요.',pillar:'탑을 받치는 기둥이에요.',jar:'유리병에 담아 둔 재료예요.',lens:'빛을 모으는 렌즈예요.',cut:'정성껏 깎아 빛이 살아난 보석이에요.',powder:'곱게 간 가루예요.',glass:'빛이 통과하는 판이에요.',drillbit:'무엇이든 뚫는 드릴 끝이에요.',charge:'바위를 한 번에 무너뜨리는 폭약이에요.',engine:'정밀하게 맞물려 돌아가는 기관이에요.',lantern:'어둠 속에서도 꺼지지 않는 등불이에요.',orb:'안에서 빛이 일렁이는 구슬이에요.',crown:'왕실에 바칠 만한 보석 장식이에요.'};
// 광석 발견 후광: 도트로 찍은 빛 2장(40×40칸, 화면에선 3배). 계단식 둥근 빛 + 빛살 8갈래(십자 · 대각선 길이가 번갈아) + 작은 별
let HALO_URL='';
function haloUrl(){if(HALO_URL)return HALO_URL;const N=40,[c,x]=cvs(N*2,N),C=19.5;
  for(let f=0;f<2;f++){const px=(X,Y,col)=>{if(X<0||Y<0||X>=N||Y>=N)return;x.fillStyle=col;x.fillRect(f*N+X,Y,1,1)};
    for(let Y=0;Y<N;Y++)for(let X=0;X<N;X++){const d=Math.hypot(X-C,Y-C);if(d<6.6)px(X,Y,'rgba(255,244,200,.62)');else if(d<9.6)px(X,Y,'rgba(255,226,150,.4)');else if(d<12.6)px(X,Y,'rgba(255,208,120,.22)')}
    const ray=(dx,dy,r0,r1,w)=>{for(let r=r0;r<=r1;r++){const k=(r-r0)/(r1-r0),col=k<.5?'rgba(255,246,208,.95)':k<.8?'rgba(255,214,120,.9)':'rgba(255,190,90,.75)',X=Math.round(C+dx*r-.5+(dx<0?1:0)*0),Y=Math.round(C+dy*r-.5);px(X,Y,col);if(w&&k<.45){px(X+(dy?1:0),Y+(dx?1:0),col);px(X-(dy?1:0),Y-(dx?1:0),col)}}};
    const card=[[1,0],[-1,0],[0,1],[0,-1]],diag=[[1,1],[-1,1],[1,-1],[-1,-1]];
    card.forEach(([dx,dy])=>ray(dx,dy,10,f?15:19,!f));diag.forEach(([dx,dy])=>ray(dx*.72,dy*.72,10,f?19:14,f));
    (f?[[6,9],[33,7],[8,31],[31,33]]:[[10,5],[34,12],[4,27],[29,35]]).forEach(([X,Y])=>{px(X,Y,'#fff6d0');px(X-1,Y,'rgba(255,220,130,.9)');px(X+1,Y,'rgba(255,220,130,.9)');px(X,Y-1,'rgba(255,220,130,.9)');px(X,Y+1,'rgba(255,220,130,.9)')})}
  return HALO_URL=c.toDataURL()}
// 처음 캔 원석: 도감 카드가 도트 후광과 함께 → "광석을 발견했다!"
function discover(id){const it=ITEMS[id],L=it.L;sfx('sparkle');
  story([{gold:1,k:'광석을 발견했다!',t:it.n,b:`${SHAPE_TXT[it.sh]||''} B${L} ${LAYERS[L-1].n}에서 처음 캐냈어요.`,extra:`<div class="halo"><span class="hr" style="background-image:url(${haloUrl()})"></span>${ico(id,'xl')}</div><div class="rcard"><span>분류</span><span>${SECT[it.s].n} · 원석</span><span>평소 가격</span><span>${pf(it.p)}G</span><span>도감</span><span>${S.seen.filter(x=>ITEMS[x].L).length} / ${RAW.length}</span></div>`}])}
function itemInfo(id){if(!S.seen.includes(id)){story([{k:'도감',t:'???',b:'아직 찾지 못한 광물이에요. 더 깊이 파 내려가거나 새로운 조합을 시도해 보세요.'}]);return}
  const it=ITEMS[id],L=itemLayer(id),src=it.cr?(()=>{const i=RMAP[key(INS[id][0],INS[id][1])];return S.found.includes(i)?`${ITEMS[INS[id][0]].n} + ${ITEMS[INS[id][1]].n}로 만들어요.`:'만드는 법은 아직 몰라요.'})():id==='slag'?'':`B${L} ${LAYERS[L-1].n}에서 캘 수 있어요.`;
  const uses=OUTS[id].filter(o=>S.found.some(i=>RECIPES[i].out===o)).map(o=>ITEMS[o].n);
  story([{k:`도감 · ${SECT[it.s].n}`,t:it.n,b:`${SHAPE_TXT[it.sh]||''} ${src}`,extra:`<div style="display:flex;justify-content:center;margin-bottom:8px">${ico(id,'xl')}</div><div class="rcard"><span>분류</span><span>${it.cr?'재련품':id==='slag'?'찌꺼기':'원석'}</span><span>평소 가격</span><span>${pf(it.p)}G</span><span>지금 팔면</span><span>${pf(bid(id))}G</span>${uses.length?`<span>쓰이는 곳</span><span>${uses.join(', ')}</span>`:''}</div>`}])}
$('dex').addEventListener('click',e=>{const b=e.target.closest('[data-dx]');if(b)itemInfo(b.dataset.dx)});
// 채굴 화면 아이콘(사용자 그림 art/ui: 채굴 보관함 · 숯의 선물 · 채굴 2배)
function drawUiIcons(){document.querySelectorAll('img[data-ic]').forEach(im=>{im.src=ART['ui_'+im.dataset.ic]})}
