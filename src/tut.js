/* ═════════ 튜토리얼 (이장 할머니): 캐기 → 광석 발견 → 제련 → 탑 1층(무쇠) → 곡괭이 강화 → 그 밖의 것 → 할머니의 바람 ═════════ */
// t·sel은 함수일 수도 있다(상황에 따라 바뀜). next:true → 저절로 넘어가지 않고 [다음]을 눌러야 넘어가는 설명 단계
const slotsFull=()=>!!(S.slots[0]&&S.slots[1]);
const TUT=[
  {t:'여기가 영감이 평생 파고들던 광맥이란다. 자, 화면을 눌러 바위를 캐 보렴.',sel:'#sceneWrap',done:()=>S.mined>=1},
  {t:'처음 발견한 광석은 도감에 기록된단다. 우선 돌을 넉넉히 모아 보자.',sel:'#sceneWrap',done:()=>cnt('stone')+cnt('brick')*2>=10,hint:()=>`(돌 ${Math.min(cnt('stone')+cnt('brick')*2,10)}/10)`},
  {t:'돌 두 개를 녹이면 다듬은 돌을 만들 수 있단다. 아래 [제련]으로 가 보렴.',sel:'.nb[data-tab="forge"]',done:()=>S.tab==='forge'||cnt('brick')>=2},
  {t:()=>slotsFull()?'그래, 이제 [제련]을 눌러 보자.':'[돌]을 두 번 눌러서 재료 칸 두 곳에 하나씩 넣어 보렴.',sel:()=>slotsFull()?'#smelt':'#pickGrid [data-pk="stone"]',done:()=>cnt('brick')>=2,
   hint:()=>`(다듬은 돌 ${Math.min(cnt('brick'),2)}/2)`+(!slotsFull()&&cnt('stone')<2?' 돌이 부족하다면 채굴 화면으로 돌아가 조금만 더 캐 오렴.':'')},
  {t:'잘했어! 이번엔 [탑]으로 가 보자꾸나. 떠난 사람들이 돌아와 머물 곳을 만드는 거란다.',sel:'.nb[data-tab="tower"]',done:()=>S.tab==='tower'||S.floors>=1},
  {t:'[한 층 쌓기]를 눌러 1층을 지어 보렴. 그러면 대장장이 무쇠가 돌아올 게야.',sel:'#buildBtn',done:()=>S.floors>=1},
  {t:'무쇠가 돌아왔구나! 아래 [장비]에서 대장간에 들러 보렴.',sel:'.nb[data-tab="equip"]',done:()=>S.tab==='equip'||S.pick>=2},
  {t:'무쇠에게 [곡괭이 벼리기]를 부탁해 보렴. 훨씬 수월하게 바위를 깰 수 있을 게다.',sel:'[data-up="pick"]',done:()=>S.pick>=2},
  {t:'캔 광석은 채굴 화면 아래 [창고]에서 팔 수 있고, [장터]에서는 정해진 값에 사고팔 수 있단다. 골드가 부족하면 광석부터 팔아 보렴.',sel:()=>S.tab==='mine'?'#whBtn':'.nb[data-tab="mine"]',next:true},
  {t:'채굴 화면 왼쪽 위 [개척]을 누르면 다음 지층에 필요한 재료가 나온단다. 다 모았으면 눌러서 더 깊이 내려가렴. 오른쪽 위 책에서는 할아버지의 일지와 도감을 볼 수 있어.',sel:()=>S.tab==='mine'?'#nextL':'.nb[data-tab="mine"]',next:true},
  {t:'탑을 높이 쌓으면 떠났던 사람들이 돌아와 가게를 연단다. 6층까지 지으면 창고지기 셈이 돌아와 창고를 넓혀 줄 거야. 새 사람이 오면 직접 인사하러 올 테니 걱정 말고.',sel:'.nb[data-tab="tower"]',next:true},
  {t:'이제 할아버지의 일지를 따라 천천히 내려가 보렴. 할미는 그저… 이 마을에 다시 사람 사는 소리가 들렸으면 좋겠구나.',sel:null,last:true}
];
/* 주민 안내(단계 튜토리얼): 일을 맡은 주민이 들어오면(셈 6층 · 핀 10층 · 루카 21층 · 미르 28층 · 린 B4) 그 사람이 직접 자기 일을 짧게 알려 준다.
   이장 할머니 튜토리얼과 같은 말풍선을 쓰고, 이름 · 초상화만 바뀐다. 줄(S.ntq)에 쌓아 두고 이야기 창이 닫힌 뒤 하나씩. 다 본 사람은 S.ntDone */
const goShop=i=>()=>S.tab==='equip'?`[data-shop="${i}"]`:'.nb[data-tab="equip"]',atShop=i=>()=>S.tab==='equip'&&(S.shop|0)===i;
const NPC_TUT={
  '셈':[{t:'내 가게는 [장비]에 있어. [창고] 칸을 눌러 봐.',sel:goShop(1),done:atShop(1)},
       {t:'[창고 늘리기]로 보관 공간을 늘릴 수 있어. 창고가 꽉 차면 로봇이 캔 건 보관함에 쌓이고, 거기까지 차면 헐값에 팔려 나가니까 조심해.',sel:'[data-up="wh"]',next:true},
       {t:'[알뜰 정리]를 사 두면 창고가 찼을 때 싼 원석부터 알아서 팔아 줄게. [월세 금고]는 월세를 더 오래 모아 두는 거고. 알아들었지?',sel:'[data-up="autosell"]',next:true}],
  '핀':[{t:'제 공방은 [장비]에 있어요! 한번 들러 보세요!',sel:goShop(2),done:atShop(2)},
       {t:'[드릴 로봇]을 강화하면 가만히 있어도 바위를 캐 줘요. 강화할 때마다 드릴 파워가 확 올라가요! 켜 두면 자리를 비운 동안에도 일해요.',sel:'[data-up="auto"]',next:true},
       {t:'로봇이 캔 광석은 먼저 창고로 가요. 창고가 차면 오른쪽 아래 [로봇 보관함]에 쌓이고요! [채굴 보관함]으로 공간을 늘리고, [자동 판매 장치]를 달면 넘치는 광석도 제값에 가깝게 팔 수 있어요.',sel:'[data-up="box"]',next:true}],
  '루카':[{t:'아래 [장터]에 한번 와 보세요~ 재미있는 걸 보여 드릴게요.',sel:'.nb[data-tab="market"]',done:()=>S.tab==='market'},
       {t:'이게 [지층 출입권]이에요. 갖고만 있어도 그 지층 광석이 조금씩 로봇 보관함에 들어온답니다.',sel:()=>S.mkSub==='pass'?'#passes':'[data-mks="pass"]',next:true},
       {t:'소문 게시판도 구경해 보세요! 10분쯤마다 새 소문이 돌고, 몇 분 뒤에 진짜인지 발표가 나요. 사실이면 출입권 값이 오르고, 헛소문이면 떨어지죠. 미리 사 두는 편이 좋을 거에요~',sel:'#rumors',next:true},
       {t:'어느 소문을 믿을지 고민되시죠? [장비]에 있는 제 [정보소]에서 [소문 감정]을 강화해 보세요. 처음엔 반반이지만, 나중엔 최대 90%까지 진짜인지 맞힐 수 있거든요.',sel:'.nb[data-tab="equip"]',next:true}],
  '미르':[{t:'…[장비]에서 [용광로]를 선택해 주세요.',sel:goShop(4),done:atShop(4)},
       {t:'[풀무]를 강화하면 제련이 더 잘돼요. [별빛 불씨]는… 대성공 확률을 높여 줘요. 대성공이면 결과물이 두 개 나오고요.',sel:'[data-up="furn"]',next:true},
       {t:'[별빛 여운]은 황금 광맥이 사라지는 걸 조금 늦춰 줘요. 나타나면… 놓치지 말고 캐 보세요.',sel:'[data-up="vheat"]',next:true}],
  '린':[{t:'내 작업대는 채굴 화면 아래 [세공]에 있어. 한번 눌러 봐!',sel:()=>S.tab==='mine'?'#crBtn':'.nb[data-tab="mine"]',done:()=>!$('sheet').hidden&&S.sub==='craft'},
       {t:'은괴 · 금괴 · 백금괴 · 별빛강 중에서 재료를 고르고, 개수를 정한 뒤 [제작]을 누르면 돼. 쓴 재료의 값이 세공품 기본값이 되지.',sel:'#crSeg',next:true},
       {t:'[강화 도전]에 성공하면 값이 확 올라. 대신 실패하면 깨져서 사라진다는 거, 잊지 마! 언제 팔지도 잘 생각하고.',sel:'#crBody',next:true}]};
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
function tutHide(){const b=$('tut');setHid(b,true);document.querySelectorAll('.tut-glow').forEach(e=>e.classList.remove('tut-glow'))}
{const g=name=>{const o=window[name];window[name]=function(...a){const r=o.apply(this,a);tutGlow();return r}};['renderTab','renderForge','renderInv','renderMarket','renderTower'].forEach(g)}
$('tutGo').onclick=()=>{if(!tutOn()&&ntOn()){S.nts=(S.nts|0)+1;sfx('page');if(S.nts>=NPC_TUT[S.ntq[0]].length)ntEnd();if(!ntTick())tutHide();return}
  const st=TUT[S.tut||0];if(!st)return;if(st.last){S.tutDone=true;tutHide();return}S.tut++;sfx('page');tutTick()};
$('tutNext').onclick=()=>{if(!tutOn()&&ntOn()){ntEnd();if(!ntTick())tutHide();return}
  S.tutDone=true;tutHide();toast('튜토리얼을 건너뛰었어요. 채굴 화면 위쪽 톱니바퀴(설정)에서 다시 시작할 수 있어요.')};
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

