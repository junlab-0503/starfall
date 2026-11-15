/* ═════════ 시작 ═════════ */
initLang();   // 언어팩: 화면 글자를 지금 언어로(처음엔 기기 언어)
buildIcons();navIcons();drawUiIcons();
const had=load();refreshBonus();
if(S.rqRefund){log(`자동 제련소를 정리했어요. 미르가 자동 제련 강화에 쓴 ${big(S.rqRefund)}G를 돌려줬어요.`,true);delete S.rqRefund;save()}
if(!S.next||!LAYERS[S.layer].drops.some(d=>d[0]===S.next))S.next=rollDrop(S.layer);
if(!(S.hp>0)||S.hp>layerHp(S.layer))S.hp=layerHp(S.layer);
if(!had)for(let i=0;i<180;i++)tickMarket(2,true)   // 처음 시작할 때만 시장을 미리 돌려 둠(불러올 때마다 돌리면 다시 켤 때마다 6분씩 앞당겨짐)
// 다시 열 때: 서버 시각을 먼저 확인(최대 1.5초)하고, 시계를 되돌렸는지 본 뒤 자리 비운 시간을 계산
let resuming=false;
async function resume(){if(resuming)return;resuming=true;CLK.hold=true;clockRebase();await syncTime(1500);CLK.hold=false;const back=clockCheck();
  const r=back?null:catchUp((gtime()-S.lastSeen)/1000);S.lastSeen=gtime();resuming=false;if(r)welcome(r);renderAll()}
if(had)resume();else clockCheck();
function welcome(r){const ores=Object.entries(r.ores).sort((a,b)=>b[1]-a[1]),tot=ores.reduce((s,o)=>s+o[1],0);
  const rows=[];if(r.rent>0)rows.push(`<span>${ico('coin','sm')} 입주자 월세</span><span>+${big(r.rent)}G</span>`);
  ores.slice(0,6).forEach(([id,n])=>rows.push(`<span>${ico(id,'sm')} ${ITEMS[id].n}</span><span>×${big(n)}</span>`));if(ores.length>6)rows.push(`<span>그 밖의 광석</span><span>×${big(ores.slice(6).reduce((s,o)=>s+o[1],0))}</span>`);
  if(r.sold&&r.sold.n>0)rows.push(`<span>${ico(ul('refiner')?'crysteel':'brick','sm')} 넘친 광석 ${big(r.sold.n)}개 판매</span><span>+${big(r.sold.g)}G</span>`);
  if(r.drillOff)rows.push(`<span class="dim">드릴 로봇</span><span class="dim">스위치가 꺼져 있어 쉬었어요</span>`);
  if(!rows.length)return;
  story([{k:'다시 왔구나',t:'자리를 비운 사이 모인 것',b:`${r.drillOff?'탑의 입주자들이 일했어요. 드릴 로봇은 꺼 둔 채라 쉬었어요.':'탑의 입주자들과 드릴 로봇이 쉬지 않고 일했어요.'}${r.full?' 보상이 가득 찼어요. 더 오래 비워도 늘지 않아요.':''}`,extra:`<div class="rcard">${rows.join('')}</div><p class="dim small" style="margin:6px 0 0">${r.rent>0?'월세는 탑 탭에서, ':''}${tot?'광석은 채굴 화면의 채굴 보관함에서 받을 수 있어요.':''}</p>`}])}
document.documentElement.style.setProperty('--navH',document.querySelector('.bnav').getBoundingClientRect().height+'px');
tutWho('이장 할머니');   // 튜토리얼 말풍선: 이장 할머니 초상화(주민 안내 때는 그 주민으로 바뀜)
setTab(S.tab);sceneResize();newWall();renderAll();
addEventListener('resize',()=>{document.documentElement.style.setProperty('--navH',document.querySelector('.bnav').getBoundingClientRect().height+'px');fitScene()});
// 프롤로그: 편지 → 할아버지의 제련소(유산: 골드 · 낡은 곡괭이 · 느린 채굴 기계) → 일지 → 광맥 입구 → 주인공이 입구로 걸어 들어가는 장면 → B1
function startPrologue(){entryScene(true);story(PROLOGUE.map((c,i)=>Object.assign({gold:1,k:'프롤로그',ill:'p'+(i+1),mode:'full'},c,
  c.legacy?{extra:`<div class="rcard"><span>할아버지의 유산</span><span>+${big(LEGACY.gold)}G</span><span>낡은 곡괭이</span><span>손에 익은 녹슨 곡괭이</span><span>채굴 기계</span><span>느리게 도는 자동 드릴</span></div>`,
    done:()=>{if(!S.legacy){S.legacy=1;S.gold+=LEGACY.gold;S.auto=Math.max(S.auto,LEGACY.auto);S.autoOn=true;sfx('coin');renderAll()}}}:{},
  i===PROLOGUE.length-1?{done:()=>{S.prologue=true;save()},after:()=>entryScene()}:{})))}
// 시작 화면: 터치하면 닫히고, 처음이면 프롤로그
$('titleScr').hidden=false;$('titleScr').style.backgroundImage='';$('titleArt').style.backgroundImage=`url(${ART.scene_title})`;
$('titleScr').addEventListener('click',()=>{$('titleScr').hidden=true;sfx('page');if(!S.prologue)startPrologue();renderAll()});
$('devForm').addEventListener('submit',e=>{e.preventDefault();const v=$('devCode').value.trim().toLowerCase(),msg=$('devMsg');
  if(v==='jun'){S.pick=999;S.auto=999;S.furnace=5;S.intel=INTEL_MAX;S.wh=30;S.unlocked=LAYERS.length;S.prologue=true;
    ORDER.forEach(id=>{S.inv[id]=9999;if(!S.seen.includes(id))S.seen.push(id)});S.found=RECIPES.map((r,i)=>i);S.journal=LAYERS.map((L,i)=>i);S.gold=9.999e14;refreshBonus();   // 탑은 그대로(층 · 입주자 · 가게 개방은 직접 쌓아서 확인)
   S.hp=Math.min(S.hp,layerHp(S.layer));
    S.dev=1;S.tutDone=true;
    log('개발자 코드 적용: 지층 전부 해금 · 레시피 전부 · 모든 광물 9,999개 · 골드 무한 (탑은 그대로)',true);msg.textContent='적용됨: 골드 무한 · 레시피 전부 알고 있음. 탑은 열지 않았어요(직접 쌓아 입주자 · 가게가 열리는지 확인). 채굴 화면의 [DEV 광맥]으로 황금 광맥을 바로 부를 수 있어요.';renderAll()}
  else msg.textContent=v?'알 수 없는 코드예요.':'';$('devCode').value=''});
// 개발자 코드 칸은 숨겨 둠: 채굴 화면 위 톱니바퀴(설정)를 10초 동안 누르고 있으면 나타남
{let devT=0;const off=()=>{clearTimeout(devT);devT=0},b=$('setBtn');
  b.addEventListener('pointerdown',()=>{off();devT=setTimeout(()=>{$('devForm').hidden=false;openSheet('set');toast('개발자 코드 칸이 열렸어요.')},10000)});
  ['pointerup','pointercancel'].forEach(ev=>addEventListener(ev,off,true));b.addEventListener('contextmenu',e=>e.preventDefault())}   // 손을 떼면(어디서든) 취소
let armed=false;$('reset').onclick=()=>{if(!armed){armed=true;$('reset').textContent='정말요? 한 번 더';setTimeout(()=>{armed=false;$('reset').textContent='처음부터 다시'},3000);return}
  try{localStorage.removeItem(SAVE_KEY)}catch(e){}S=fresh();refreshBonus();for(let i=0;i<180;i++)tickMarket(2,true);S.next=rollDrop(0);S.hp=layerHp(0);S.digs={};camInit=false;newWall();armed=false;$('reset').textContent='처음부터 다시';setTab('mine');startPrologue();save()};
let lastT=0,lastDraw=0,secAcc=0,saveAcc=0,hudAcc=0,invDirtyT=0;
function frame(now){const dt=Math.min(.1,(now-(lastT||now))/1000);lastT=now;if(!document.hidden){clockWatch();S.playT=(S.playT||0)+dt}   // 플레이 시간: 화면이 켜져 있는 동안만
  if(S.tab==='mine'&&!IW)sceneResize();
  update(dt);if(S.tab==='mine'&&IW&&now-lastDraw>=10&&$('titleScr').hidden&&$('entry').hidden){lastDraw=now;draw(now/1000)}   // 120Hz 화면에서도 그리기는 초당 60번까지, 시작 화면 · 입구 장면이 덮고 있는 동안엔 안 그림(렉 줄이기)
  if((hudAcc+=dt)>.2){hudAcc=0;if(S.tab==='mine')renderMineHud();renderHeader();tutTick()}
  if(invDirty&&now-invDirtyT>400){invDirty=false;invDirtyT=now;if(S.tab==='forge')renderForge();if(!$('sheet').hidden&&S.sub==='store')renderInv()}
  if(S.dev){if(S.gold<9e14)S.gold=9.999e14;if(S.found.length<RECIPES.length)S.found=RECIPES.map((r,i)=>i)}   // 개발자: 골드 무한 · 레시피 전부
  secAcc+=dt;while(secAcc>=1){secAcc-=1;tickMarket(1,false);veinTick();mrTick();whHintCheck();S.rentAcc=Math.min(S.rentAcc+rentPerSec(),rentPerSec()*rentCapH(ul('safe'))*3600);
    if(S.tab==='market'||S.tab==='tower'||S.tab==='equip'||S.tab==='forge'||(!$('sheet').hidden&&S.sub!=='set'))renderTab();if(++saveAcc%10===0)save()}
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);
addEventListener('beforeunload',save);
document.addEventListener('visibilitychange',()=>{clockRebase();if(document.hidden)save();else resume()});
/* 앱(Capacitor) 연동 — @capacitor/app 플러그인이 있으면
   · 뒤로가기: 열린 창(수량 · 광고 · 상점 · 아래 창)이 있으면 그것부터 닫고, 없으면 종료 확인 창 → [종료하기]는 저장 후 앱을 완전히 끈다(백그라운드에 남지 않게)
   · 앱이 뒤로 가면(홈 버튼 · 전화 화면) 무음 + 저장, 돌아오면 소리 · 자리 비운 보상
   플러그인이 없는 앱(WebView)이나 홈 화면에 설치한 웹앱에서는 뒤로가기를 기록 한 칸으로 붙잡아 같은 창을 띄운다(일반 브라우저 탭은 건드리지 않음) */
const CAPP=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.App;
function exitAsk(){if(!$('exitModal').hidden){$('exitModal').hidden=true;return}
  const open=['qtyModal','adModal','shopModal'].find(id=>!$(id).hidden);if(open){$(open).querySelector('#qtyCancel,#adCancel,#shopCancel').click();return}
  if(!$('sheet').hidden){closeSheet();return}
  $('exitModal').hidden=false}
function exitNow(){save();audioHold('exit',true);$('exitModal').hidden=true;
  try{if(CAPP&&CAPP.exitApp){CAPP.exitApp();return}if(navigator.app&&navigator.app.exitApp){navigator.app.exitApp();return}}catch(e){}
  window.close();setTimeout(()=>{audioHold('exit',false);toast('브라우저에서는 이 탭을 닫으면 종료돼요.')},400)}
$('exitNo').onclick=()=>{$('exitModal').hidden=true};$('exitYes').onclick=exitNow;
window.starfallBack=()=>{exitAsk();return true};   // 앱 쪽에서 뒤로가기를 직접 넘겨줄 때
if(CAPP&&CAPP.addListener){try{CAPP.addListener('backButton',exitAsk);CAPP.addListener('pause',()=>{audioHold('app',true);clockRebase();save()});CAPP.addListener('resume',()=>{audioHold('app',false);resume()})}catch(e){}}
else if(window.Capacitor||matchMedia('(display-mode: standalone)').matches){try{history.pushState({sf:1},'');addEventListener('popstate',()=>{history.pushState({sf:1},'');exitAsk()})}catch(e){}}
