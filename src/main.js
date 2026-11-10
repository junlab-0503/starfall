/* ═════════ 시작 ═════════ */
buildIcons();navIcons();
const had=load();refreshBonus();
if(!S.next||!LAYERS[S.layer].drops.some(d=>d[0]===S.next))S.next=rollDrop(S.layer);
if(!(S.hp>0)||S.hp>layerHp(S.layer))S.hp=layerHp(S.layer);
for(let i=0;i<180;i++)tickMarket(2,true)
// 다시 열 때: 서버 시각을 먼저 확인(최대 1.5초)하고, 시계를 되돌렸는지 본 뒤 자리 비운 시간을 계산
let resuming=false;
async function resume(){if(resuming)return;resuming=true;CLK.hold=true;clockRebase();await syncTime(1500);CLK.hold=false;const back=clockCheck();
  const r=back?null:catchUp((gtime()-S.lastSeen)/1000);S.lastSeen=gtime();resuming=false;if(r)welcome(r);renderAll()}
if(had)resume();else clockCheck();
function welcome(r){const ores=Object.entries(r.ores).sort((a,b)=>b[1]-a[1]),tot=ores.reduce((s,o)=>s+o[1],0);
  const rows=[];if(r.rent>0)rows.push(`<span>${ico('goldbar','sm')} 입주자 월세</span><span>+${big(r.rent)}G</span>`);
  ores.slice(0,6).forEach(([id,n])=>rows.push(`<span>${ico(id,'sm')} ${ITEMS[id].n}</span><span>×${big(n)}</span>`));if(ores.length>6)rows.push(`<span>그 밖의 광석</span><span>×${big(ores.slice(6).reduce((s,o)=>s+o[1],0))}</span>`);
  if(r.sold&&r.sold.n>0)rows.push(`<span>${ico(ul('refiner')?'engine':'mortar','sm')} 넘친 광석 ${big(r.sold.n)}개 ${ul('refiner')?'재련해서 ':''}판매</span><span>+${big(r.sold.g)}G</span>`);
  const mk=Object.entries(r.made||{});mk.slice(0,4).forEach(([id,n])=>rows.push(`<span>${ico(id,'sm')} 자동 재련 ${ITEMS[id].n}</span><span>×${big(n)}</span>`));
  if(!rows.length)return;
  story([{k:'다시 왔구나',t:'자리를 비운 사이 모인 것',b:`탑의 입주자들과 드릴 로봇이 쉬지 않고 일했어요.${r.full?' 보상이 가득 찼어요. 더 오래 비워도 늘지 않아요.':''}`,extra:`<div class="rcard">${rows.join('')}</div><p class="dim small" style="margin:6px 0 0">${r.rent>0?'월세는 탑 탭에서, ':''}${tot?'광석은 채굴 화면의 로봇 보관함에서 받을 수 있어요.':''}</p>`}])}
document.documentElement.style.setProperty('--navH',document.querySelector('.bnav').getBoundingClientRect().height+'px');
drawPortrait($('tutPor'),{name:'이장 할머니',hair:'#d8d4cc',hat:'scarf',coat:'#6a5a4a'},false);
setTab(S.tab);sceneResize();newWall();renderAll();
addEventListener('resize',()=>{document.documentElement.style.setProperty('--navH',document.querySelector('.bnav').getBoundingClientRect().height+'px');fitScene()});
if(!S.prologue)story(PROLOGUE.map((c,i)=>Object.assign({k:'프롤로그'},c,i===PROLOGUE.length-1?{done:()=>{S.prologue=true;save()}}:{})));
$('devForm').addEventListener('submit',e=>{e.preventDefault();const v=$('devCode').value.trim().toLowerCase(),msg=$('devMsg');
  if(v==='jun'){S.pick=999;S.auto=999;S.furnace=5;S.intel=3;S.wh=30;S.unlocked=LAYERS.length;S.prologue=true;
    ORDER.forEach(id=>{S.inv[id]=9999;if(!S.seen.includes(id))S.seen.push(id)});S.found=RECIPES.map((r,i)=>i);S.journal=LAYERS.map((L,i)=>i);S.gold=9.999e11;S.floors=99;refreshBonus();S.hp=Math.min(S.hp,layerHp(S.layer));
    log('개발자 코드 적용: 전부 해금 · 모든 광물 9,999개 · 골드 9,999억 · 탑 99층',true);msg.textContent='적용됨: 탑 탭에서 바로 별을 돌려보낼 수 있어요.';renderAll()}
  else msg.textContent=v?'알 수 없는 코드예요.':'';$('devCode').value=''});
let armed=false;$('reset').onclick=()=>{if(!armed){armed=true;$('reset').textContent='정말요? 한 번 더';setTimeout(()=>{armed=false;$('reset').textContent='처음부터 다시'},3000);return}
  try{localStorage.removeItem(SAVE_KEY)}catch(e){}S=fresh();refreshBonus();for(let i=0;i<180;i++)tickMarket(2,true);S.next=rollDrop(0);S.hp=layerHp(0);S.digs={};camInit=false;newWall();armed=false;$('reset').textContent='처음부터 다시';setTab('mine');story(PROLOGUE.map(c=>Object.assign({k:'프롤로그'},c)));S.prologue=true;save()};
let lastT=0,secAcc=0,saveAcc=0,hudAcc=0,invDirtyT=0;
function frame(now){const dt=Math.min(.1,(now-(lastT||now))/1000);lastT=now;if(!document.hidden)clockWatch();
  if(S.tab==='mine'&&!IW)sceneResize();
  update(dt);rqRun(dt);if(S.tab==='mine'&&IW)draw(now/1000);
  if((hudAcc+=dt)>.2){hudAcc=0;if(S.tab==='mine')renderMineHud();if(S.tab==='forge')rqBars();renderHeader();tutTick()}
  if(invDirty&&now-invDirtyT>400){invDirty=false;invDirtyT=now;if(S.tab==='forge')renderForge();if(S.tab==='manage'&&S.sub==='store')renderInv()}
  secAcc+=dt;while(secAcc>=1){secAcc-=1;tickMarket(1,false);S.rentAcc=Math.min(S.rentAcc+rentPerSec(),rentPerSec()*rentCapH(ul('safe'))*3600);
    if(S.tab==='market'||S.tab==='tower'||S.tab==='equip'||S.tab==='forge'||(S.tab==='manage'&&S.sub!=='set'))renderTab();if(++saveAcc%10===0)save()}
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);
addEventListener('beforeunload',save);
document.addEventListener('visibilitychange',()=>{clockRebase();if(document.hidden)save();else resume()});
