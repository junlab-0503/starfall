/* ═════════ 튜토리얼 (이장 할머니): 캐기 → 광석 발견 → 제련 → 탑 1층(무쇠) → 곡괭이 강화 → 그 밖의 것 → 할머니의 바람 ═════════ */
// t·sel은 함수일 수도 있다(상황에 따라 바뀜). next:true → 저절로 넘어가지 않고 [다음]을 눌러야 넘어가는 설명 단계
const slotsFull=()=>!!(S.slots[0]&&S.slots[1]);
const TUT=[
  {t:'여기가 영감이 평생 판 광맥이란다. 화면을 탭해서 바위를 캐 보렴.',sel:'#sceneWrap',done:()=>S.mined>=1},
  {t:'처음 보는 광석은 도감에 남는단다. 계속 캐서 돌을 넉넉히 모아 보렴.',sel:'#sceneWrap',done:()=>cnt('stone')+cnt('brick')*2>=10,hint:()=>`(돌 ${Math.min(cnt('stone')+cnt('brick')*2,10)}/10)`},
  {t:'돌 두 개를 녹이면 다듬은 돌이 된단다. 아래 [제련]으로 가 보렴.',sel:'.nb[data-tab="forge"]',done:()=>S.tab==='forge'||cnt('brick')>=2},
  {t:()=>slotsFull()?'좋아, 이제 [제련]을 눌러 보렴.':'[돌]을 두 번 눌러 재료 칸 두 개에 넣어 보렴.',sel:()=>slotsFull()?'#smelt':'#pickGrid [data-pk="stone"]',done:()=>cnt('brick')>=2,
   hint:()=>`(다듬은 돌 ${Math.min(cnt('brick'),2)}/2)`+(!slotsFull()&&cnt('stone')<2?' 돌이 모자라면 채굴 화면에서 조금 더 캐 오렴.':'')},
  {t:'잘했다! 이제 [탑]으로 가 보자. 떠난 마을 사람들이 돌아올 집이란다.',sel:'.nb[data-tab="tower"]',done:()=>S.tab==='tower'||S.floors>=1},
  {t:'[한 층 쌓기]를 눌러 1층을 지어 보렴. 대장장이 무쇠가 돌아올 게다.',sel:'#buildBtn',done:()=>S.floors>=1},
  {t:'무쇠가 돌아왔구나! 아래 [장비]로 가서 대장간을 열어 보렴.',sel:'.nb[data-tab="equip"]',done:()=>S.tab==='equip'||S.pick>=2},
  {t:'무쇠에게 [곡괭이 벼리기]를 맡겨 보렴. 바위가 훨씬 쉽게 갈라질 게다.',sel:'[data-up="pick"]',done:()=>S.pick>=2},
  {t:'광석은 채굴 화면 아래 [창고]에서 팔거나 [장터]에서 정해진 값에 사고팔 수 있단다. 골드가 모자라면 팔아서 마련하렴.',sel:()=>S.tab==='mine'?'#whBtn':'.nb[data-tab="mine"]',next:true},
  {t:'채굴 화면 왼쪽 위 [개척]에는 다음 지층을 여는 데 필요한 것이 나온단다. 다 모으면 눌러서 더 깊이 내려가렴. 오른쪽 위 책에는 할아버지의 일지와 도감이 있단다.',sel:()=>S.tab==='mine'?'#nextL':'.nb[data-tab="mine"]',next:true},
  {t:'탑을 높이 쌓을수록 떠났던 사람들이 하나둘 돌아와 가게를 연단다. 6층까지 쌓으면 창고지기 셈이 돌아와 창고를 넓혀 줄 게다. 누가 오면 그 사람이 직접 알려 줄 게야.',sel:'.nb[data-tab="tower"]',next:true},
  {t:'이제 할아버지의 일지를 따라 천천히 내려가 보렴. 할미는 그저… 활기찼던 그 시절 마을을 다시 한번 보고 싶구나. 늘 여기 있으마.',sel:null,last:true}
];
/* 주민 안내(단계 튜토리얼): 일을 맡은 주민이 들어오면(셈 6층 · 핀 10층 · 루카 21층 · 미르 28층 · 린 B4) 그 사람이 직접 자기 일을 짧게 알려 준다.
   이장 할머니 튜토리얼과 같은 말풍선을 쓰고, 이름 · 초상화만 바뀐다. 줄(S.ntq)에 쌓아 두고 이야기 창이 닫힌 뒤 하나씩. 다 본 사람은 S.ntDone */
const goShop=i=>()=>S.tab==='equip'?`[data-shop="${i}"]`:'.nb[data-tab="equip"]',atShop=i=>()=>S.tab==='equip'&&(S.shop|0)===i;
const NPC_TUT={
  '셈':[{t:'창고지기 셈이야. 아래 [장비]에서 [창고] 가게를 골라 봐.',sel:goShop(1),done:atShop(1)},
       {t:'[창고 늘리기]로 칸을 넓혀. 창고가 꽉 차면 캔 광석이 로봇 보관함에 쌓이고, 거기도 차면 넘친 광석은 헐값에 팔려 버려.',sel:'[data-up="wh"]',next:true},
       {t:'[알뜰 정리]를 들이면 창고가 가득 찰 때 싼 원석부터 알아서 팔아 줘. [월세 금고]는 탑 월세를 더 오래 모아 두는 금고야. 이상, 끝.',sel:'[data-up="autosell"]',next:true}],
  '핀':[{t:'꼬마 기계공 핀이에요! [장비]에서 제 [공방]을 골라 주세요!',sel:goShop(2),done:atShop(2)},
       {t:'[드릴 로봇]을 늘리면 탭하지 않아도 저절로 캐요. 채굴 화면의 드릴 스위치를 켜 두면 자리를 비워도 계속 캐요!',sel:'[data-up="auto"]',next:true},
       {t:'로봇이 캔 광석은 채굴 화면 오른쪽 아래 [로봇 보관함]에 모여요. [채굴 보관함]으로 크기를 키우고, [자동 판매 장치]로 넘친 광석을 더 비싸게 팔 수 있어요!',sel:'[data-up="box"]',next:true}],
  '루카':[{t:'떠돌이 상인 루카예요! 아래 [장터]로 와 보세요~',sel:'.nb[data-tab="market"]',done:()=>S.tab==='market'},
       {t:'[지층 출입권]을 사 두면 그 지층 광석이 조금씩 로봇 보관함으로 들어와요.',sel:()=>S.mkSub==='pass'?'#passes':'[data-mks="pass"]',next:true},
       {t:'소문 게시판도 꼭 보세요. 소문이 사실이면 그 지층 출입권 값이 크게 오르고, 헛소문이면 내려요. 산 뒤 1분 동안은 이익이 +1%까지만 나니까 미리 사 두는 게 요령이에요~',sel:'#rumors',next:true},
       {t:'[장비]의 제 [정보소]에서 [소문 감정]을 키우면 소문이 진짜인지 귀띔해 드려요. 처음엔 50%, 한 단계마다 5%씩 올라 최대 90%까지!',sel:'.nb[data-tab="equip"]',next:true}],
  '미르':[{t:'…연금술사 미르예요. [장비]에서 [용광로]를 골라 주세요.',sel:goShop(4),done:atShop(4)},
       {t:'…[풀무]를 키우면 제련이 더 잘 돼요. [별빛 불씨]는 대성공 확률을 올려요. 대성공이면 두 개가 나와요.',sel:'[data-up="furn"]',next:true},
       {t:'…[별빛 여운]은 황금 광맥이 더 오래 머물게 해요. 광맥이 반짝이면… 힘껏 두드려 주세요.',sel:'[data-up="vheat"]',next:true}],
  '린':[{t:'내 작업대는 채굴 화면 아래 [세공]이야. 눌러 봐!',sel:()=>S.tab==='mine'?'#crBtn':'.nb[data-tab="mine"]',done:()=>!$('sheet').hidden&&S.sub==='craft'},
       {t:'은괴 · 금괴 · 백금괴 · 별빛강 중 하나를 고르고 개수를 정해 [제작]을 눌러. 넣은 재료값이 세공품의 기본값이 돼.',sel:'#crSeg',next:true},
       {t:'[강화 도전]에 성공할 때마다 값이 크게 뛰어. 하지만 실패하면 깨져서 사라져! 적당할 때 [판매]하는 게 요령이야.',sel:'#crBody',next:true}]};
const NPC_P={'린':{name:'린',art:'lin'}},TUT_GRANNY={name:'이장 할머니',art:'granny',hair:'#d8d4cc',hat:'scarf',coat:'#6a5a4a'};
function npcTutQueue(who){if(!NPC_TUT[who]||S.ntDone.includes(who)||S.ntq.includes(who))return;S.ntq.push(who)}
const ntOn=()=>S.tutDone&&S.ntq.length>0&&$('story').hidden&&$('titleScr').hidden&&$('entry').hidden;
const ntStep=()=>ntOn()?NPC_TUT[S.ntq[0]][S.nts|0]:null;
let TUTP='';   // 말풍선 초상화 주인(바뀔 때만 다시 그림)
function tutWho(who){if(TUTP===who)return;TUTP=who;$('tutWho').textContent=who;const i=tenantSec(who);drawPortrait($('tutPor'),NPC_P[who]||(i>=0?SECTIONS[i].t:TUT_GRANNY),false)}
function ntTick(){if(!ntOn())return false;let st=ntStep();
  while(st&&!st.next&&st.done()){S.nts=(S.nts|0)+1;st=ntStep();sfx('page')}
  if(!st){ntEnd();return ntTick()}
  tutWho(S.ntq[0]);$('tut').hidden=false;$('tutT').textContent=T(tv(st.t));const last=(S.nts|0)>=NPC_TUT[S.ntq[0]].length-1;
  $('tutGo').hidden=!st.next;$('tutGo').textContent=last?'알겠어요':'다음';$('tutNext').hidden=false;tutGlow();return true}
function ntEnd(){const w=S.ntq.shift();if(w&&!S.ntDone.includes(w))S.ntDone.push(w);S.nts=0;save()}
const tv=v=>typeof v==='function'?v():v;
const tutOn=()=>S.prologue&&!S.tutDone&&$('story').hidden&&$('titleScr').hidden&&$('entry').hidden;
function tutTick(){if(!tutOn()){if(ntTick())return;return tutHide()}tutWho('이장 할머니');S.tut=S.tut||0;let st=TUT[S.tut];
  while(st&&!st.last&&!st.next&&st.done()){S.tut++;st=TUT[S.tut];sfx('page')}
  if(!st){S.tutDone=true;return tutHide()}
  $('tut').hidden=false;const h=st.hint?st.hint():'';$('tutT').textContent=T(tv(st.t))+(h?' '+T(h):'');
  $('tutGo').hidden=!(st.next||st.last);$('tutGo').textContent=st.last?'시작하기':'다음';$('tutNext').hidden=!!st.last;
  tutGlow()}
// 반짝임: 지금 눌러야 할 것 하나에만. 화면이 다시 그려질 때마다 다시 붙인다
function tutGlow(){const st=tutOn()?TUT[S.tut||0]:ntStep(),sel=st?tv(st.sel):null,el=sel?document.querySelector(sel):null;
  document.querySelectorAll('.tut-glow').forEach(e=>{if(e!==el)e.classList.remove('tut-glow')});if(el)el.classList.add('tut-glow');
  // 대상이 말풍선 자리(화면 아래쪽)에 걸리면 말풍선이 가리지 않게 위로 올림(아래 탭 단추는 그대로)
  // 대상 바로 위에 띄우고(설정 톱니 · 지층 칸은 가리지 않게), 위로 올릴 자리가 없으면 화면 위쪽에
  const tb=$('tut');if(!tb)return;let top=false,above='';
  if(el&&!el.closest('.nb')&&!tb.hidden){const r=el.getBoundingClientRect(),nav=document.querySelector('nav'),lim=(nav?nav.getBoundingClientRect().top:innerHeight)-10-tb.offsetHeight-6;
    if(r.bottom>lim&&r.height<200){if(r.top-tb.offsetHeight-8>110)above=Math.round(innerHeight-r.top+8)+'px';else top=true}}
  tb.style.bottom=above;tb.classList.toggle('top',top)}
function tutHide(){const b=$('tut');if(b)b.hidden=true;document.querySelectorAll('.tut-glow').forEach(e=>e.classList.remove('tut-glow'))}
{const g=name=>{const o=window[name];window[name]=function(...a){const r=o.apply(this,a);tutGlow();return r}};['renderTab','renderForge','renderInv','renderMarket','renderTower'].forEach(g)}
$('tutGo').onclick=()=>{if(!tutOn()&&ntOn()){S.nts=(S.nts|0)+1;sfx('page');if(S.nts>=NPC_TUT[S.ntq[0]].length)ntEnd();if(!ntTick())tutHide();return}
  const st=TUT[S.tut||0];if(!st)return;if(st.last){S.tutDone=true;tutHide();return}S.tut++;sfx('page');tutTick()};
$('tutNext').onclick=()=>{if(!tutOn()&&ntOn()){ntEnd();if(!ntTick())tutHide();return}
  S.tutDone=true;tutHide();toast('튜토리얼을 건너뛰었어요. 채굴 화면 위 톱니바퀴(설정)에서 다시 볼 수 있어요.')};
/* 광맥 입구 장면: 마을 뒤 광산 입구 그림(art/scene/entry) 위로 주인공 도트가 걸어가 입구 안으로 들어가고, 어두워지며 "B1 표토층"이 뜬 뒤 채굴 화면으로.
   그림 좌표(원본 2000×667): 땅 높이 y 503, 입구 문턱 x 1560, 입구 안 x 1665, 등불 (1645, 318). 탭하면 건너뜀 */
const ENTRY={ground:503,start:300,door:1560,inside:1665,lamp:[1645,318],W:2000,H:667,speed:330};
// still: 프롤로그 카드 뒤에 깔리는 멈춘 한 장면(주인공은 출발 자리에 서 있음, 탭해도 넘어가지 않음)
function entryScene(still){const el=$('entry'),cv=$('entryCv'),x=cv.getContext('2d'),bg=new Image();bg.src=ART.scene_entry;el.hidden=false;el.classList.remove('out','dark');el.classList.toggle('still',!!still);
  let t0=null,raf=0,ended=false;const tWalk=(ENTRY.door-ENTRY.start)/ENTRY.speed,tIn=1.1,tDark=.6,tCard=1.6;
  const finish=()=>{if(ended)return;ended=true;cancelAnimationFrame(raf);el.classList.add('out');setTimeout(()=>{el.hidden=true;el.classList.remove('out','dark');renderAll()},450)};
  el.onclick=still?null:()=>{if(t0!=null&&performance.now()-t0>400)finish()};   // 들어오자마자 누른 탭은 무시
  const step=now=>{if(ended)return;if(!bg.complete||!HERO.img){raf=requestAnimationFrame(step);return}if(t0==null)t0=now;const t=(now-t0)/1000;
    const dpr=window.devicePixelRatio||1,W=Math.round(el.clientWidth*dpr),H=Math.round(el.clientHeight*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
    const s=Math.max(H*.74/ENTRY.H,W/ENTRY.W),top=Math.round((H-ENTRY.H*s)*.3);
    // 주인공 위치(그림 좌표): 걷기 → 입구 안으로
    let hx,fade=1,shrink=1;if(t<tWalk)hx=ENTRY.start+ENTRY.speed*t;else{const k=Math.min(1,(t-tWalk)/tIn);hx=ENTRY.door+(ENTRY.inside-ENTRY.door)*k;fade=1-k;shrink=1-.18*k}
    const camX=clamp(hx*s-W*.42,0,ENTRY.W*s-W);
    x.imageSmoothingEnabled=true;x.fillStyle='#7b9ffa';x.fillRect(0,0,W,top+2);x.drawImage(bg,-camX,top,ENTRY.W*s,ENTRY.H*s);
    // 그림 아래: 땅속 바위 무늬(art/scene/under.webp, 위아래 · 좌우 이음매 없음)를 줄마다 옆으로 어긋나게 깔고, 아래로 갈수록 매끈하게 어두워짐
    const un=ENTRY.un||(ENTRY.un=Object.assign(new Image(),{src:ART.scene_under}));
    if(un.complete&&un.naturalWidth){const uw=un.width*s,uh=un.height*s;let yy=top+612*s,row=0;while(yy<H){let xx=-(((row*.37*uw+camX)%uw+uw)%uw);for(;xx<W;xx+=uw)x.drawImage(un,Math.floor(xx),Math.floor(yy),Math.ceil(uw)+1,Math.ceil(uh)+1);yy+=uh;row++}}
    {const y0=top+575*s,gd=x.createLinearGradient(0,y0,0,H);gd.addColorStop(0,'rgba(16,9,18,0)');gd.addColorStop(.5,'rgba(16,9,18,.6)');gd.addColorStop(1,'rgba(16,9,18,.95)');x.fillStyle=gd;x.fillRect(0,y0,W,H-y0)}
    // 등불이 은은하게 흔들림
    const lx=ENTRY.lamp[0]*s-camX,ly=top+ENTRY.lamp[1]*s,fl=.7+.3*Math.sin(t*9)*Math.sin(t*3.7),gr=x.createRadialGradient(lx,ly,2,lx,ly,90*s);gr.addColorStop(0,`rgba(255,200,110,${(.35*fl).toFixed(2)})`);gr.addColorStop(1,'rgba(255,200,110,0)');x.fillStyle=gr;x.fillRect(lx-100*s,ly-100*s,200*s,200*s);
    // 주인공: 걷는 도트(왼쪽을 보는 그림이라 좌우 뒤집음), 화면 픽셀에 맞춘 정수 배율
    const f=HERO_META['walk'+(Math.floor(t*10)%6)],hs=HERO_META._s||1,k=Math.max(1,Math.round(245*s*.4*shrink/(68/hs)))/hs,fw=f[2]*k,fh=f[3]*k,px=Math.round(hx*s-camX),py=Math.round(top+ENTRY.ground*s);
    // 한 장짜리 캔버스에 주인공을 그리고(입구 안으로 들어갈수록 어둡게), 화면엔 좌우를 뒤집어 붙임
    const hc=ENTRY.hc||(ENTRY.hc=document.createElement('canvas'));hc.width=f[2];hc.height=f[3];const hx2=hc.getContext('2d');hx2.drawImage(HERO.img,f[0],f[1],f[2],f[3],0,0,f[2],f[3]);
    if(fade<1){hx2.globalCompositeOperation='source-atop';hx2.globalAlpha=(1-fade)*.85;hx2.fillStyle='#0a0606';hx2.fillRect(0,0,f[2],f[3])}
    x.save();x.globalAlpha=Math.max(0,Math.min(1,fade*1.6));x.imageSmoothingEnabled=false;x.translate(px,py);x.scale(-1,1);x.drawImage(hc,-(f[2]-f[4])*k,-fh,fw,fh);x.restore();
    if(still)return;   // 멈춘 한 장면: 한 번만 그림
    if(t>tWalk+tIn*.7&&!el.classList.contains('dark')){el.classList.add('dark');sfx('page')}
    if(t>tWalk+tIn+tDark+tCard){finish();return}
    raf=requestAnimationFrame(step)};
  raf=requestAnimationFrame(step)}

