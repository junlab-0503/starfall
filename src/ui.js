/* ═════════ 화면 ═════════ */
const calText=()=>`${SEASONS[seasonIdx()].n} ${Math.floor(S.day%7)+1}일 · ${Math.floor(S.day/28)+1}년차`;
// 칸보다 글자가 길면 글씨를 줄여서 잘리지 않게 (말줄임표 대신)
function fitText(el,t){if(el.textContent===t&&el.dataset.fit)return;el.textContent=t;el.dataset.fit=1;el.style.fontSize='';for(const fs of[13,12,11,10]){if(el.scrollWidth<=el.clientWidth)break;el.style.fontSize=fs+'px'}}
function renderHeader(){
  fitText($('gold'),big(S.gold)+'G');$('depth').textContent=`−${fmt(LAYERS[S.layer].d)}m`;
  const u=used(),c=cap(),st=$('store');fitText(st,`${cbig(u)}/${cbig(c)}`);st.style.color=u>=c?'var(--bad)':u>=c*.85?'var(--lamp)':'';
  $('towerStat').textContent=big(S.floors)+'층';$('cal').textContent=calText();$('starIc').hidden=!S.ended;
  const B=badges();$('towerDot').hidden=!B.tower;$('manageDot').hidden=!B.manage;$('gearDot').hidden=!B.gear;$('shaftDot').hidden=!B.shaft;
}
// 빨간 점: 지금 할 수 있는 업그레이드·개척·탑 짓기·월세가 있으면 탭 → 하위 탭 → 그 버튼까지
function upReady(){return{pick:S.gold>=pickCost(S.pick),auto:S.gold>=autoCost(S.auto),furn:S.furnace<5&&S.gold>=furnCost(S.furnace),wh:S.gold>=whCost(S.wh),intel:S.intel<3&&S.gold>=intelCost(S.intel)}}
function badges(){const u=upReady(),gear=Object.values(u).some(Boolean),shaft=S.unlocked<LAYERS.length&&reqMet(LAYERS[S.unlocked]),
  build=!towerBlocked()&&canBuild(floorCost(S.floors+1)),rent=S.rentAcc>=rentPerSec()*1800&&rentPerSec()>0,fin=towerBlocked()&&cnt('philo')>=1&&cnt('starshard')>=10;
  return{u,gear,shaft,manage:gear||shaft,build,rent,tower:build||rent||fin}}
function renderMineHud(){
  const L=LAYERS[S.layer],id=S.next||'stone',hp=layerHp(S.layer);
  $('scOre').innerHTML=`${ico(id)}<div style="min-width:0"><div class="nm"><b>${ITEMS[id].n}</b></div><div class="hpbar"><i style="width:${clamp(S.hp/hp,0,1)*100}%"></i></div></div>`;
  const u=used(),c=cap(),f=u>=c;$('scStore').className='sc-store'+(f?' full':'');$('scStore').innerHTML=`창고<br>${cbig(u)}/${cbig(c)}${f?'<br>가득!':''}`;
  $('scInfo').innerHTML=`B${S.layer+1} ${L.n} · −${fmt(L.d)}m<br>${PICK_TIERS[pickTier()][1]} · 탭 ${big(tapPower())}`;
  const ab=$('autoBtn'),bx=$('boxBtn'),bu=boxUsed();if(S.auto>0){ab.hidden=false;ab.className='px-btn sc-auto'+(S.autoOn?' on':'');ab.textContent=`자동 드릴 ${S.autoOn?(f?'창고 가득':'ON'):'OFF'}`}else ab.hidden=true;
  bx.hidden=bu<=0;if(bu>0){bx.className='px-btn sc-boxbtn has';bx.textContent=`로봇 보관함 ${big(bu)}개 받기`;bx.disabled=false}
  renderAdBtns();
  const tot=L.drops.reduce((s,d)=>s+d[1],0);$('drops').innerHTML=L.drops.map(d=>`<span>${ico(d[0],'sm')}${S.seen.includes(d[0])?ITEMS[d[0]].n:'???'} ${Math.round(d[1]/tot*100)}%</span>`).join('');
  $('layerChips').innerHTML=LAYERS.map((l,i)=>i<S.unlocked?`<button class="chip${i===S.layer?' on':''}" data-chip="${i}" type="button">B${i+1} ${l.n}</button>`:i===S.unlocked?`<button class="chip lock" data-chiplock="1" type="button">B${i+1} 개척하기 →</button>`:'').join('');
}
$('autoBtn').addEventListener('pointerdown',e=>e.stopPropagation());$('boxBtn').addEventListener('pointerdown',e=>e.stopPropagation());
$('boxBtn').onclick=e=>{e.stopPropagation();collectBox()};
function collectBox(){let moved=0,left=0;for(const id of Object.keys(S.box||{})){const k=Math.min(S.box[id],space());if(k>0){add(id,k);S.box[id]-=k;moved+=k}if(S.box[id]<=0)delete S.box[id];else left+=S.box[id]}
  if(moved)toast(`드릴 로봇이 캔 광석 ${big(moved)}개를 창고에 옮겼어요.${left?` (창고가 차서 ${big(left)}개는 보관함에 남았어요)`:''}`);else if(left)toast('창고가 가득 차서 옮길 수 없어요. 먼저 팔거나 합성해 보세요.');renderAll()}
$('autoBtn').onclick=e=>{e.stopPropagation();S.autoOn=!S.autoOn;toast(S.autoOn?'자동 드릴을 켰어요.':'자동 드릴을 껐어요.');renderMineHud()};
$('layerChips').addEventListener('click',e=>{const c=e.target.closest('[data-chip]');if(c){setLayer(+c.dataset.chip);return}if(e.target.closest('[data-chiplock]')){S.sub='shaft';setTab('manage')}});
/* 갱도 */
const reqMet=L=>!L.req||(S.gold>=L.req.g&&Object.entries(L.req.items).every(([id,n])=>cnt(id)>=n));
function unlockLayer(i){const L=LAYERS[i];if(!reqMet(L)||i!==S.unlocked)return;S.gold-=L.req.g;Object.entries(L.req.items).forEach(([id,n])=>add(id,-n));S.unlocked=i+1;setLayer(i);
  log(`${L.n} 개척! (−${fmt(L.d)}m)`,true);revealJournal(i);setTab('mine');renderAll()}
function renderLayers(){
  $('layers').innerHTML=LAYERS.map((L,i)=>{const d=`<span class="d">B${i+1}<br>${fmt(L.d)}m</span>`;
    if(i<S.unlocked)return`<button class="layer${i===S.layer?' on':''}" data-go="${i}" type="button">${d}<span><span class="nm">${L.n}</span><br><span class="dim">${L.drops.map(x=>S.seen.includes(x[0])?ITEMS[x[0]].n:'???').join(' · ')}</span></span><span class="dim">${i===S.layer?'채굴 중':'가기'}</span></button>`;
    if(i===S.unlocked){const parts=[`<span class="${S.gold>=L.req.g?'ok':''}">${big(L.req.g)}G</span>`].concat(Object.entries(L.req.items).map(([id,n])=>`<span class="${cnt(id)>=n?'ok':''}">${S.seen.includes(id)?ITEMS[id].n:'???'} ${Math.min(cnt(id),n)}/${n}</span>`));
      return`<div class="layer lock">${d}<span><span class="nm">${L.n}</span><br><span class="req dim">필요: ${parts.join(' · ')}</span></span><button class="px-btn lamp sm${reqMet(L)?' ndot':''}" data-unlock="${i}" type="button" ${reqMet(L)?'':'disabled'}>개척</button></div>`}
    return`<div class="layer lock">${d}<span><span class="nm">???</span><br><span class="dim">더 깊은 곳</span></span><span></span></div>`}).join('');
}
$('layers').addEventListener('click',e=>{const g2_=e.target.closest('[data-go]');if(g2_){setLayer(+g2_.dataset.go);setTab('mine');return}const u=e.target.closest('[data-unlock]');if(u)unlockLayer(+u.dataset.unlock)});
/* 장비 */
function renderUps(){const pc=pickCost(S.pick),ac=autoCost(S.auto),fc=furnCost(S.furnace),wc=whCost(S.wh),ic=intelCost(S.intel),T=PICK_TIERS[pickTier()],NT=PICK_TIERS[pickTier()+1];
  const U=upReady(),row=(icn,t,s,key,cost,max)=>`<div class="up${U[key]?' ready':''}">${ico(icn)}<span class="t">${t}</span><span class="s">${s}</span><button class="px-btn${U[key]?' ndot':''}" data-up="${key}" type="button" ${max||S.gold<cost?'disabled':''}>${max?'최대':big(cost)+'G'}</button></div>`;
  $('ups').innerHTML=
    row(['iron','iron','steel','resonant','lavaheart','stariron'][pickTier()],`${T[1]} Lv.${S.pick}`,`한 번 탭에 ${big(tapPower())} 피해${NT?` · Lv.${NT[0]}에 ${NT[1]}`:''}`,'pick',pc)+
    row('drillbit',`자동 드릴 ×${S.auto}`,`초당 ${big(autoDps())} 피해 · 자리를 비운 동안엔 로봇 보관함에 모아요 (최대 ${offlineH()}시간)`,'auto',ac)+
    row('coke',`풀무 Lv.${Math.min(S.furnace,5)}`,`합성 성공 ${Math.round(successRate()*100)}% · 대성공 ${Math.round(greatRate()*100)}%`,'furn',fc,S.furnace>=5)+
    row('brick',`창고 Lv.${S.wh}`,`용량 ${big(cap())}칸 → ${big(capOf(S.wh+1))}칸`,'wh',wc)+
    row('lens',`장터 정보원 Lv.${Math.min(S.intel,3)}`,BON.perfectIntel?'점성술사 노을 덕분에 소문의 진위를 늘 알아요':['소문의 진위를 알 수 없어요','소문 신뢰도 표시 (적중 75%)','소문 신뢰도 표시 (적중 88%)','소문 신뢰도 표시 (적중 97%)'][Math.min(S.intel,3)],'intel',ic,S.intel>=3)}
$('ups').addEventListener('click',e=>{const b=e.target.closest('[data-up]');if(!b)return;const t=b.dataset.up;
  if(t==='pick'&&S.gold>=pickCost(S.pick)){const old=pickTier();S.gold-=pickCost(S.pick);S.pick++;if(pickTier()>old)log(`새 곡괭이: ${PICK_TIERS[pickTier()][1]}!`,true)}
  if(t==='auto'&&S.gold>=autoCost(S.auto)){S.gold-=autoCost(S.auto);S.auto++;if(S.auto===1)log('핀이 만들어 준 드릴 로봇이 일을 시작했어요.',true)}
  if(t==='furn'&&S.furnace<5&&S.gold>=furnCost(S.furnace)){S.gold-=furnCost(S.furnace);S.furnace++}
  if(t==='wh'&&S.gold>=whCost(S.wh)){S.gold-=whCost(S.wh);S.wh++}
  if(t==='intel'&&S.intel<3&&S.gold>=intelCost(S.intel)){S.gold-=intelCost(S.intel);S.intel++}
  renderAll()});
/* 창고 */
function renderInv(){const ids=ORDER.filter(id=>cnt(id)>0);$('invCap').textContent=`${big(used())}/${big(cap())}칸`;
  $('inv').innerHTML=ids.length?ids.map(id=>`<div class="irow"><button class="nmb" data-mk="${id}" type="button">${ico(id,'sm')}<span>${ITEMS[id].n}</span></button><span class="dim">×${big(cnt(id))}</span><span>${pf(bid(id))}G</span><span class="acts"><button class="px-btn sm" data-sellq="${id}" type="button">판매</button></span></div>`).join(''):'<p class="dim">창고가 비어 있어요.</p>'}
function doSell(id,n){const k=n==='all'?cnt(id):+n;const t=sell(id,k);if(t){log(`${ITEMS[id].n} ${k}개 판매: +${big(t)}G`);S.slots=S.slots.map(x=>x&&cnt(x)?x:null)}renderAll()}
$('inv').addEventListener('click',e=>{const s=e.target.closest('[data-sellq]');if(s){openQty(s.dataset.sellq);return}const m=e.target.closest('[data-mk]');if(m){S.sel=m.dataset.mk;S.mkView='detail';setTab('market')}});
$('sellRaw').onclick=()=>{let t=0;ORDER.filter(id=>!ITEMS[id].cr&&cnt(id)).forEach(id=>t+=sell(id,cnt(id)));if(t)log(`원석 일괄 판매: +${big(t)}G`,true);S.slots=S.slots.map(x=>x&&cnt(x)?x:null);renderAll()};
function renderLog(){const el=$('log');if(el)el.innerHTML=S.log.slice(0,40).map(l=>`<div>${l}</div>`).join('')}
/* 도감·일지·기록 */
function revealJournal(i){if(S.journal.includes(i))return;S.journal.push(i);const ev=LAYER_EVENT[i+1];
  story([{k:`할아버지의 일지 · ${S.journal.length}/13`,t:`B${i+1} ${LAYERS[i].n}`,b:(ev?ev+'\n\n':'')+`"${JOURNAL[i]}"`}])}
function renderBookTab(){
  $('jCount').textContent=`${S.journal.length}/13`;
  $('journal').innerHTML=LAYERS.map((L,i)=>S.journal.includes(i)?`<button class="jp" data-jp="${i}" type="button"><span class="dim">B${i+1} ${L.n}</span><br>"${JOURNAL[i].slice(0,34)}…"</button>`:`<div class="jp unk">B${i+1} · 아직 찾지 못한 장</div>`).join('');
  $('dexCount').textContent=`${S.seen.length}/${ORDER.length}`;
  $('dex').innerHTML=ORDER.map(id=>`<button class="dx${S.seen.includes(id)?'':' unk'}" data-dx="${id}" type="button" aria-label="${S.seen.includes(id)?ITEMS[id].n:'아직 모르는 광물'}">${ico(id)}</button>`).join('');
  const mins=Math.round((gtime()-S.t0)/60000);
  $('records').innerHTML=[['플레이 시간',`${Math.floor(mins/60)}시간 ${mins%60}분`],['캔 광석',big(S.mined)+'개'],['합성',big(S.crafts)+'번'],['레시피',`${S.found.length}/${RECIPES.length}`],['번 골드',big(S.earned)+'G'],['가장 큰 거래',big(S.bestSale)+'G'],['탑',S.floors+'층'],['입주자',BON.done+'/13']].map(r=>`<span>${r[0]}</span><span>${r[1]}</span>`).join('')}
$('journal').addEventListener('click',e=>{const b=e.target.closest('[data-jp]');if(!b)return;const i=+b.dataset.jp;story([{k:'할아버지의 일지',t:`B${i+1} ${LAYERS[i].n}`,b:`"${JOURNAL[i]}"`}])});
/* 장터 */
function sparkSvg(arr,w,h,col){if(!arr||arr.length<2)return'';let mn=Math.min(...arr),mx=Math.max(...arr);if(mx-mn<1e-9){mx+=1;mn-=1}
  const pts=arr.map((v,i)=>`${Math.round(i/(arr.length-1)*(w-1))},${Math.round(h-2-(v-mn)/(mx-mn)*(h-4))}`).join(' ');
  return`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges"><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2"/></svg>`}
const pctHtml=v=>{const p=Math.round((v-1)*100);if(p===0)return'<span class="pct dim">평소</span>';return`<span class="pct ${p>0?'good':'bad'}">${p>0?'▲':'▼'}${Math.abs(p)}%</span>`};
let mkTouch=0;
function renderMarket(force){if(S.tab!=='market')return;const det=S.mkView==='detail'&&S.sel&&S.seen.includes(S.sel);$('mkMain').hidden=!!det;$('mkDetail').hidden=!det;if(det){if(force===true||Date.now()-mkTouch>2500)renderDetail();return}
  $('mkSeason').textContent=calText();
  let nw='';
  if(S.collector){const c=S.collector;nw+=`<div class="nw col">${ico(c.id,'sm')}<span><span class="who">수집가</span> "${J(ITEMS[c.id].n,'을를')} 찾고 있어요. 개당 ${big(mid(c.id)*c.x*BON.sell)}G에 ${c.n}개까지 사겠어요." <br><button class="px-btn sm" data-col="1" type="button" ${cnt(c.id)?'':'disabled'}>1개 팔기</button> <button class="px-btn sm lamp" data-col="all" type="button" ${cnt(c.id)?'':'disabled'}>가진 만큼</button></span><span class="tm">${Math.ceil(c.t)}초</span></div>`}
  S.ev.forEach(e=>{if(e.state==='rumor'){const cr=e.cred==null?'<span class="cred dim">(진위 불명)</span>':e.cred?'<span class="cred good">(믿을 만해요)</span>':'<span class="cred bad">(수상해요)</span>';nw+=`<div class="nw"><span class="who">루카</span><span>"${e.text}" ${cr}</span><span class="tm">${Math.ceil(e.t)}초</span></div>`}
    else nw+=`<div class="nw active"><span class="who">${e.sector?SECT[e.sector].who:'루카'}</span><span>${e.text} ${e.kind==='demand'?(e.x>1?'<span class="good">▲</span>':'<span class="bad">▼</span>'):(e.x<1?'<span class="good">▲</span>':'<span class="bad">▼</span>')}</span><span class="tm">${Math.ceil(e.t)}초</span></div>`});
  if(S.caravan)nw+=`<div class="nw"><span class="who">루카</span><span>"${S.caravan.from} 상단이 ${S.caravan.at-S.day<.5?'곧':'내일'} 도착해요. ${BON.perfectIntel||S.intel>=2?J(S.caravan.items.map(i=>ITEMS[i].n).join(', '),'을를')+' 잔뜩 싣고 온대요.':'뭘 싣고 오는지는 몰라요.'}"</span></div>`;
  if(!nw)nw='<div class="nw"><span class="who">루카</span><span>"오늘은 조용하네요. 소식이 들어오면 알려 드릴게요."</span></div>';
  $('news').innerHTML=nw;
  const ss=seenSectors();
  $('stalls').innerHTML=[...SKEYS].sort((a,b)=>ss.includes(b)-ss.includes(a)).map(k=>{if(!ss.includes(k))return`<div class="stall" style="opacity:.45"><span>???</span><span class="bz dim">아직 거래 없음</span></div>`;const b=busy(k),rl=repLv(k);
    return`<button class="stall${S.filter===k?' on':''}" data-st="${k}" type="button"><span>${SECT[k].guild}</span><span class="bz ${b==='바쁨'?'up':b==='한산'?'dn':'dim'}">${b}</span><span class="rp">${rl?'단골 '+'★'.repeat(rl):'처음 거래'}</span></button>`}).join('');
  const ids=[...new Set(S.seen)].filter(id=>!S.filter||ITEMS[id].s===S.filter).sort((a,b)=>ORDER.indexOf(a)-ORDER.indexOf(b));
  $('mkList').innerHTML=ids.map(id=>{const r=pr(id),h=(H[id]||[]).slice(-40),cm=comment(id),col=r>1.02?'#8ff0a8':r<.98?'#ff5f86':'#8ea3cc';
    return`<button class="mrow" data-sel="${id}" type="button">${ico(id)}<span class="nmx"><b>${ITEMS[id].n}</b>${cnt(id)?`<span class="dim">×${big(cnt(id))}</span>`:''}</span><span class="px"><b>${pf(bid(id))}G</b> ${pctHtml(r)}</span><span class="cm">${cm.who}: ${cm.t}</span><span style="grid-column:3;grid-row:2">${sparkSvg(h,56,16,col)}</span></button>`}).join('')||'<p class="dim">광물을 캐면 여기에 시세가 나와요.</p>';
}
$('stalls').addEventListener('click',e=>{const b=e.target.closest('[data-st]');if(!b)return;S.filter=S.filter===b.dataset.st?null:b.dataset.st;renderMarket()});
$('news').addEventListener('click',e=>{const b=e.target.closest('[data-col]');if(!b)return;sellCollector(b.dataset.col==='all'?999:1);renderAll()});
$('mkList').addEventListener('click',e=>{const r=e.target.closest('[data-sel]');if(r){S.sel=r.dataset.sel;S.mkView='detail';renderMarket(true);document.querySelector('main').scrollTop=0}});
$('mkBack').onclick=()=>{S.mkView='list';renderMarket()};
function drawChart(id){const W=120,Hh=46,c=document.createElement('canvas');c.width=W;c.height=Hh;c.className='chart';const t=c.getContext('2d'),a=(H[id]||[]).slice(-90),base=ITEMS[id].p;
  t.fillStyle='#1b140e';t.fillRect(0,0,W,Hh);if(a.length<2)return c;let mn=Math.min(...a,base*.8),mx=Math.max(...a,base*1.2);const Y=v=>Math.round(Hh-4-(v-mn)/(mx-mn)*(Hh-8));
  t.fillStyle='#5a4430';for(let x=0;x<W;x+=4)t.fillRect(x,Y(base),2,1);
  let py=null;a.forEach((v,i)=>{const x=Math.round(i/(a.length-1)*(W-3)),y=Y(v);t.fillStyle=v>=base?'rgba(143,211,106,.18)':'rgba(255,122,106,.18)';t.fillRect(x,Math.min(y,Y(base)),2,Math.abs(y-Y(base))+1);
    t.fillStyle=v>=base?'#8fd36a':'#ff7a6a';if(py!=null)t.fillRect(x,Math.min(py,y),2,Math.abs(py-y)+1);else t.fillRect(x,y,2,2);py=y});
  t.fillStyle='#ffe9a8';t.fillRect(W-3,py-1,3,3);return c}
function renderDetail(){const id=S.sel,it=ITEMS[id],s=SECT[it.s],r=pr(id),m=S.mkt[id],sp=m.q/it.T,cm=comment(id),f=FL[id]||{prod:0,cons:0,gIn:0,gOut:0};
  const p=Math.round((r-1)*100),feel=p>=10?'평소보다 비싸요 · 팔기 좋을 때':p<=-10?'평소보다 싸요 · 사 두기 좋을 때':'평소 가격이에요';
  let h=`<div class="dh">${ico(id,'xl')}<div><div class="t">${it.n}</div><div class="dim small">${s.n} · ${s.guild}</div><div class="quotes"><span>팔 때 <b>${pf(bid(id))}G</b></span><span>살 때 <b>${pf(ask(id))}G</b></span></div><div class="small">${pctHtml(r)} ${feel}</div></div></div>`;
  h+='<div id="chartBox"></div><div class="dim small" style="display:flex;justify-content:space-between"><span>약 12분 전</span><span>점선 = 평소 가격</span><span>지금</span></div>';
  h+=`<div class="say"><span class="who">${cm.who}</span> "${cm.t}"</div>`;
  const blocks=clamp(Math.round(sp*5),0,10),rm=recoverMin(id);h+=`<div class="dsec"><h3>장터 재고 · ${sp<.85?'적음':sp>1.15?'많음':'보통'}</h3><div class="gauge">${Array.from({length:10},(_,i)=>`<i class="${i<blocks?'f':''}"></i>`).join('')}</div>${rm?`<div class="small dim" style="margin-top:4px">물량이 빠져 평소 값으로 돌아오기까지 약 ${rm}분</div>`:''}</div>`;
  const outs=OUTS[id].filter(o=>S.found.some(i=>RECIPES[i].out===o));
  if(OUTS[id].length)h+=`<div class="dsec"><h3>이걸로 만들 수 있는 것</h3>${outs.map(o=>`<button class="lk" data-go-item="${o}" type="button">${ico(o,'sm')}<span class="grow">${ITEMS[o].n}</span><span>${pf(bid(o))}G</span> ${pctHtml(pr(o))}</button>`).join('')}${OUTS[id].length>outs.length?`<div class="dim small">아직 모르는 레시피 ${OUTS[id].length-outs.length}개</div>`:''}</div>`;
  const ins=INS[id];if(ins&&S.found.includes(RMAP[key(ins[0],ins[1])])){const cost=ask(ins[0])+ask(ins[1]),ev=bid(id)*(successRate()+greatRate()),pc=ev/cost-1;
    h+=`<div class="dsec"><h3>만드는 법</h3>${ins.map(x=>`<button class="lk" data-go-item="${x}" type="button">${ico(x,'sm')}<span class="grow">${ITEMS[x].n}</span><span>살 때 ${pf(ask(x))}G</span></button>`).join('')}<div class="say small">재료를 사서 만들어 팔면 <b class="${pc>=0?'good':'bad'}">${pc>=0?'+':''}${Math.round(pc*100)}%</b> ${pc>.15?'· 남는 장사예요':pc<0?'· 지금은 손해예요':''}</div></div>`}
  const have=cnt(id),mb=maxBuy(id);
  h+=`<div class="trade"><div class="tr-row"><span class="tl">팔기 <span class="dim">보유 ${big(have)}</span></span><button class="px-btn sm" data-ds="1" type="button" ${have<1?'disabled':''}>1개</button><button class="px-btn sm" data-ds="10" type="button" ${have<10?'disabled':''}>10개</button><button class="px-btn sm lamp" data-ds="all" type="button" ${have<1?'disabled':''}>전부${have?' '+big(quote(id,have,-1))+'G':''}</button></div>
    <div class="tr-row"><span class="tl">구매하기 <span class="dim">빈칸 ${big(space())}</span></span><button class="px-btn sm" data-db="1" type="button" ${mb<1?'disabled':''}>1개</button><button class="px-btn sm" data-db="10" type="button" ${mb<10?'disabled':''}>10개</button><button class="px-btn sm" data-db="max" type="button" ${mb<1?'disabled':''}>최대 ${big(mb)}개</button></div>${mb<1?`<div class="why-no">${space()<1?'창고가 가득 차서 살 수 없어요. 먼저 팔거나 창고를 넓혀 보세요.':S.gold<ask(id)?`골드가 부족해요. 1개에 ${pf(ask(id))}G가 필요해요.`:'지금은 장터에 남은 물량이 없어요.'}</div>`:mb<10?`<div class="why-no">지금 골드와 창고로는 최대 ${big(mb)}개까지 살 수 있어요.</div>`:''}</div>`;
  const row=(l,v)=>`<span>${l}</span><span>${v}</span>`;
  h+=`<details class="more"${S.moreOpen?' open':''}><summary>자세히 보기</summary><div class="fact">${row('장터 재고',`${fmt(m.q)} / 적정 ${fmt(it.T)}`)}${row('광부·수입 공급',`+${f.prod.toFixed(2)}/초`)}${row('손님 구매',`−${f.cons.toFixed(2)}/초`)}${row('제련 길드',`${(f.gIn-f.gOut).toFixed(2)}/초`)}
    ${row('분야 경기',Math.round((cycle(it.s)-1)*100)+'%')}${row('계절',Math.round((seasonMul(it.s)-1)*100)+'%')}${row('길드 재고 기억',Math.round((need(it.s)-1)*100)+'%')}${row('사건',Math.round((evMul(id,'demand')/evMul(id,'supply')-1)*100)+'%')}${row('대체재·보완재',Math.round((subF(id)*compF(id)-1)*100)+'%')}${row('질림',Math.round(-m.fat*12)+'%')}${row('단골 보너스','+'+repLv(it.s)+'%')}
    </div><p class="small">가격 = 기본가 × (적정 재고 ÷ 장터 재고)<sup>${it.k}</sup> · 호가 차이 ${Math.round(spreadOf(id)*100)}% · 기본가의 70% 아래로는 안 떨어져요</p></details>`;
  $('detail').innerHTML=h;$('chartBox').appendChild(drawChart(id))}
$('detail').addEventListener('pointerdown',()=>{mkTouch=Date.now()});
$('detail').addEventListener('toggle',e=>{if(e.target.matches('details.more'))S.moreOpen=e.target.open},true);
$('detail').addEventListener('click',e=>{mkTouch=Date.now();const g_=e.target.closest('[data-go-item]');if(g_){S.sel=g_.dataset.goItem;renderDetail();scrollTo(0,0);return}
  const s=e.target.closest('[data-ds]');if(s){doSell(S.sel,s.dataset.ds);return}
  const b=e.target.closest('[data-db]');if(b){const n=b.dataset.db==='max'?maxBuy(S.sel):+b.dataset.db;const r=buy(S.sel,n);if(r.k)log(`${ITEMS[S.sel].n} ${r.k}개 구매: −${big(r.t)}G`);renderAll()}});
/* 이야기 창 */
const STQ=[];
function story(cards){STQ.push(...cards);if($('story').hidden)nextStory()}
function nextStory(){const c=STQ.shift();if(!c){$('story').hidden=true;return}
  $('storyKick').textContent=c.k||'';$('storyT').textContent=c.t||'';$('storyB').innerHTML=(c.b||'').replace(/\n/g,'<br>');$('storyX').innerHTML=c.extra||'';
  const p=$('portrait'),pa=$('portraitArt'),art=c.art&&typeof ART!=='undefined'&&ART[c.art];pa.hidden=!art;if(art){pa.src=art;pa.alt=c.t||''}
  if(c.portrait&&!art){p.hidden=false;drawPortrait(p,c.portrait,!!c.hide)}else p.hidden=true;$('storyNext').textContent=STQ.length?'다음':'계속';$('story').hidden=false;if(c.done)c.done()}
$('storyNext').onclick=nextStory;
/* 탭 */
const TABS=['mine','forge','market','tower','manage'];
function setTab(t){if(!TABS.includes(t))t='mine';S.tab=t;document.querySelector('main').classList.toggle('mine-mode',t==='mine');document.querySelector('main').scrollTop=0;TABS.forEach(k=>$('tab-'+k).hidden=k!==t);document.querySelectorAll('.nb').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));
  if(t==='mine')setTimeout(()=>{fitScene();if(!IW)sceneResize()},0);if(t==='market')$('newsDot').hidden=true;renderTab();scrollTo(0,0)}
document.querySelectorAll('.nb').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
$('seg').addEventListener('click',e=>{const b=e.target.closest('[data-sub]');if(!b)return;S.sub=b.dataset.sub;renderManage()});
function renderManage(){['store','gear','shaft','book','set'].forEach(k=>$('sub-'+k).hidden=k!==S.sub);document.querySelectorAll('#seg button').forEach(b=>b.classList.toggle('on',b.dataset.sub===S.sub));
  if(S.sub==='store'){renderInv();renderLog()}if(S.sub==='gear')renderUps();if(S.sub==='shaft')renderLayers();if(S.sub==='book')renderBookTab();if(S.sub==='set'){renderPkg();renderSnd()}}
function renderTab(force){renderHeader();if(S.tab==='mine')renderMineHud();if(S.tab==='forge'){renderForge();renderBook()}if(S.tab==='market')renderMarket(force);if(S.tab==='tower')renderTower();if(S.tab==='manage')renderManage()}
function renderAll(){renderTab(true)}
/* 아래 탭 아이콘 (도트) */
function navIcons(){const mk=f=>{const pb=new PB(16,16);f(pb);pb.outline('#05070e');return pb.canvas(1).toDataURL()},C='#d8e6ff';
  const icons={mine:mk(p=>{p.line(3,13,11,5,'#8a6040',2);p.line(7,2,14,9,C,2)}),forge:mk(p=>{p.rect(3,6,10,8,C);p.rect(5,3,6,3,C);p.rect(6,9,4,3,'#ff7a3d')}),
    market:mk(p=>{p.rect(2,4,12,3,'#ff7a6a');p.rect(2,7,12,1,C);p.rect(3,8,2,6,C);p.rect(11,8,2,6,C);p.rect(6,9,4,3,'#ffd23f')}),
    tower:mk(p=>{p.rect(6,3,4,11,C);p.rect(5,6,6,2,C);p.rect(4,11,8,3,C);p.set(7,1,'#ffe9a8');p.set(8,1,'#ffe9a8')}),
    manage:mk(p=>{p.rect(3,3,10,10,C);p.rect(5,5,6,1,'#8a6040');p.rect(5,8,6,1,'#8a6040');p.rect(5,11,4,1,'#8a6040')})};
  const st=document.createElement('style');st.textContent=Object.entries(icons).map(([k,v])=>`.ni-${k}{background-image:url(${v})}`).join('');document.head.appendChild(st)}

/* 광고 두 가지 + 광고 제거 패키지 (프로토타입: 가짜 광고 화면, 결제 없음) */
const mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`};
const hm=ms=>{const m=Math.max(1,Math.ceil(ms/60000));return m>=60?`${Math.floor(m/60)}시간 ${m%60}분`:`${m}분`};
function renderAdBtns(){const now=gtime(),tag=S.noAds?'':'▶ 광고 · ';
  const gb=$('giftBtn'),gl=giftLeft();if(gl>0){gb.className='px-btn ad-btn ready';gb.innerHTML=`숯의 선물 상자<span class="tag">${tag}오늘 ${gl}/${GIFT_MAX}</span>`;gb.disabled=false}
  else{gb.className='px-btn ad-btn';gb.disabled=true;gb.innerHTML='선물 상자<span class="tag">오늘은 다 받았어요 · 자정에 다시</span>'}
  const bb=$('boostBtn'),bl=boostLeft();if(boostOn()){bb.className='px-btn ad-btn live';bb.disabled=true;bb.innerHTML=`2배 부스트 중<span class="tag">${mmss(S.ads.boostUntil-now)} 남음</span>`}
  else if(bl<=0){bb.className='px-btn ad-btn';bb.disabled=true;bb.innerHTML='2배 부스트<span class="tag">오늘은 다 썼어요 · 자정에 다시</span>'}
  else{bb.className='px-btn ad-btn ready';bb.disabled=false;bb.innerHTML=`10분 동안 채굴 2배<span class="tag">${tag}오늘 ${bl}/${BOOST_MAX}</span>`}}
let AD_CB=null,AD_T=null;
function showAd(title,cb){if(S.noAds){cb();return}AD_CB=cb;$('adT').textContent=title;let n=5;$('adCnt').textContent=n;$('adDone').disabled=true;$('adModal').hidden=false;clearInterval(AD_T);
  AD_T=setInterval(()=>{n--;$('adCnt').textContent=n>0?n:'끝!';if(n<=0){clearInterval(AD_T);$('adDone').disabled=false}},1000)}
$('adDone').onclick=()=>{$('adModal').hidden=true;const cb=AD_CB;AD_CB=null;if(cb)cb()};
$('adCancel').onclick=()=>{clearInterval(AD_T);$('adModal').hidden=true;AD_CB=null};
function incomePerSec(){const L=S.layer,d=LAYERS[L].drops,tot=d.reduce((s,x)=>s+x[1],0),avg=d.reduce((s,x)=>s+bid(x[0])*x[1],0)/tot;return(pickPower(S.pick)*BON.tap*2.5+S.auto*pickPower(S.pick)*BAL.autoEff*BON.auto*(S.autoOn?1:0))/layerHp(L)*avg}
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
function renderPkg(){const b=$('buyPkg');b.disabled=S.noAds;b.textContent=S.noAds?'구매 완료':'구매하기';$('pkgState').textContent=S.noAds?'적용 중':''}

/* 수량 입력 판매 */
let QTY=null;
function openQty(id){if(!cnt(id))return;QTY=id;$('qtyT').innerHTML=`${ico(id)} ${ITEMS[id].n}`;$('qtyIn').max=cnt(id);$('qtyIn').value=cnt(id);updQty();$('qtyModal').hidden=false}
function qtyVal(){return clamp(Math.floor(+$('qtyIn').value||0),0,cnt(QTY))}
function updQty(){const n=qtyVal();$('qtySum').textContent=n?`${big(n)}개 판매 · 약 ${big(quote(QTY,n,-1))}G (보유 ${big(cnt(QTY))}개)`:'판매할 수량을 입력해 주세요';$('qtyOk').disabled=!n}
$('qtyIn').addEventListener('input',updQty);
$('qtyModal').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b)return;const v=b.dataset.q,c=cnt(QTY);$('qtyIn').value=v==='all'?c:v==='half'?Math.max(1,Math.floor(c/2)):clamp(qtyVal()+(+v),1,c);updQty()});
$('qtyCancel').onclick=()=>{$('qtyModal').hidden=true;QTY=null};
$('qtyOk').onclick=()=>{const n=qtyVal();if(n&&QTY){doSell(QTY,n)}$('qtyModal').hidden=true;QTY=null};
/* 도감: 광물 설명 */
const SHAPE_TXT={chunk:'단단한 바위 덩어리예요.',speck:'반점이 박힌 돌이에요.',clay:'손으로 빚을 수 있는 말랑한 흙이에요.',ore:'모암 속에 금속 알갱이가 박혀 있어요. 불에 녹이면 쓸 수 있어요.',coal:'잘 타는 검은 돌이에요. 대장간과 용광로의 연료예요.',shard:'날카롭게 깨지는 돌이에요.',cube:'반듯한 정육면체로 자라는 결정이에요.',cluster:'바위 위로 결정 기둥이 솟아 있어요. 갈아 내면 빛이 살아나요.',lump:'동글동글하게 뭉친 덩어리예요.',void:'들여다보면 빛을 빨아들이는 것 같은 돌이에요.',pearl:'깊은 물속에서 자란 진주예요.',fossil:'아주 오래전 바다의 흔적이에요.',meteor:'하늘에서 떨어진 쇳덩이예요.',opal:'보는 각도마다 색이 바뀌는 보석이에요.',star:'등불별이 떨어지며 남긴 조각이에요. 아직 따뜻해요.',dust:'손가락 사이로 반짝이며 흘러내리는 가루예요.',ember:'꺼지지 않고 타는 작은 불씨예요.',slag:'합성에 실패하면 남는 찌꺼기예요. 값은 거의 없어요.',block:'단단하게 굳힌 건축 재료예요.',wire:'길게 뽑아 감은 금속 줄이에요.',ingot:'녹여서 굳힌 금속 덩어리예요.',vase:'정성껏 구운 그릇이에요.',slab:'날을 세우는 데 쓰는 납작한 돌이에요.',gear:'기계를 움직이는 부품이에요.',pillar:'탑을 받치는 기둥이에요.',jar:'유리병에 담아 둔 재료예요.',lens:'빛을 모으는 렌즈예요.',cut:'정성껏 깎아 빛이 살아난 보석이에요.',powder:'곱게 간 가루예요.',glass:'빛이 통과하는 판이에요.',drillbit:'무엇이든 뚫는 드릴 끝이에요.',charge:'바위를 한 번에 무너뜨리는 폭약이에요.',engine:'정밀하게 맞물려 돌아가는 기관이에요.',lantern:'어둠 속에서도 꺼지지 않는 등불이에요.',orb:'안에서 빛이 일렁이는 구슬이에요.',crown:'왕실에 바칠 만한 보석 장식이에요.'};
function itemInfo(id){if(!S.seen.includes(id)){story([{k:'도감',t:'???',b:'아직 찾지 못한 광물이에요. 더 깊이 파 내려가거나 새로운 조합을 시도해 보세요.'}]);return}
  const it=ITEMS[id],L=itemLayer(id),src=it.cr?(()=>{const i=RMAP[key(INS[id][0],INS[id][1])];return S.found.includes(i)?`${ITEMS[INS[id][0]].n} + ${ITEMS[INS[id][1]].n}로 만들어요.`:'만드는 법은 아직 몰라요.'})():id==='slag'?'':`B${L} ${LAYERS[L-1].n}에서 캘 수 있어요.`;
  const uses=OUTS[id].filter(o=>S.found.some(i=>RECIPES[i].out===o)).map(o=>ITEMS[o].n);
  story([{k:`도감 · ${SECT[it.s].n}`,t:it.n,b:`${SHAPE_TXT[it.sh]||''} ${src}`,extra:`<div style="display:flex;justify-content:center;margin-bottom:8px">${ico(id,'xl')}</div><div class="rcard"><span>분류</span><span>${it.cr?'합성품':id==='slag'?'찌꺼기':'원석'}</span><span>평소 가격</span><span>${pf(it.p)}G</span><span>지금 팔면</span><span>${pf(bid(id))}G</span>${uses.length?`<span>쓰이는 곳</span><span>${uses.join(', ')}</span>`:''}</div>`}])}
$('dex').addEventListener('click',e=>{const b=e.target.closest('[data-dx]');if(b)itemInfo(b.dataset.dx)});
