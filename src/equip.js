/* ═════════ 장비: 마을 사람들의 공방 ═════════
   곡괭이 = 무쇠(대장장이), 자동 드릴 = 핀(꼬마 기계공), 풀무·용광로 = 미르(연금술사), 창고 = 셈(창고지기), 장터 정보 = 루카(떠돌이 상인)
   기존 장비(곡괭이 Lv, 드릴 수, 풀무, 창고, 정보원)는 저장 필드 그대로 쓰고, 세부 강화는 S.up[키]에 단계로 저장한다. */
const ul=k=>(S.up&&S.up[k])||0;
const upCostOf=(k,lv)=>{const c=BAL.ups[k];return Math.round(c[0]*Math.pow(c[1],lv))};
const UPS={
  pick:{n:'곡괭이 벼리기',ic:()=>['iron','iron','steel','resonant','lavaheart','stariron'][pickTier()],lv:()=>S.pick,cost:()=>pickCost(S.pick),buy:()=>{const o=pickTier();S.pick++;if(pickTier()>o)log(`새 곡괭이: ${PICK_TIERS[pickTier()][1]}!`,true)},
    d:()=>{const NT=PICK_TIERS[pickTier()+1];return`한 번 탭에 ${big(tapPower())} 피해${NT?` · Lv.${NT[0]}에 ${NT[1]}`:''}`}},
  crit:{n:'힘껏 내려치기',ic:()=>'charge',max:10,d:l=>`탭할 때 ${l*3}% 확률로 3배 피해${l<10?` → ${(l+1)*3}%`:''}`},
  metal:{n:'쇠맥 찾기',ic:()=>'goldbar',max:10,d:l=>`금속 광석을 캘 때 ${l*5}% 확률로 하나 더${l<10?` → ${(l+1)*5}%`:''}`},
  gem:{n:'보석 눈썰미',ic:()=>'cutemerald',max:10,d:l=>`보석 원석을 캘 때 ${l*5}% 확률로 하나 더${l<10?` → ${(l+1)*5}%`:''}`},
  auto:{n:'드릴 로봇',ic:()=>'drillbit',lv:()=>S.auto,cost:()=>autoCost(S.auto),buy:()=>{S.auto++;if(S.auto===1)log('핀이 만들어 준 드릴 로봇이 일을 시작했어요.',true)},
    d:()=>S.auto?`로봇 ${S.auto}대 · 초당 ${big(autoDps())} 피해`:'혼자서도 바위를 깨는 작은 로봇을 들여요'},
  box:{n:'로봇 보관함',ic:()=>'mortar',d:l=>`창고가 차면 로봇이 여기에 모아요 · ${big(boxCapOf(l))}칸 → ${big(boxCapOf(l+1))}칸`},
  refiner:{n:'자동 재련 장치',ic:()=>'engine',max:5,d:l=>`보관함이 넘치면 ${l?`재련해서 원석 값의 ${Math.round(ofMul(l)*100)}%로`:`원석 값의 ${Math.round(ofMul(0)*100)}%로`} 팔아요${l<5?` → ${Math.round(ofMul(l+1)*100)}%`:''}`},
  night:{n:'밤샘 근무',ic:()=>'abysslamp',max:5,d:l=>`자리 비운 보상이 ${l*15}% 더 빨리 차요${l<5?` → ${(l+1)*15}%`:''}`},
  furn:{n:'풀무',ic:()=>'coke',lv:()=>S.furnace,max:5,cost:()=>furnCost(S.furnace),buy:()=>{S.furnace++},d:()=>`재련 성공 ${Math.round(successRate()*100)}% · 대성공 ${Math.round(greatRate()*100)}%`},
  great:{n:'별빛 불씨',ic:()=>'starember',max:5,d:l=>`대성공 확률 +${l}%${l<5?` → +${l+1}%`:''}`},
  qslot:{n:'자동 재련 칸',ic:()=>'lavaglass',max:3,d:l=>`자동 재련을 ${1+l}가지 동시에${l<3?` → ${2+l}가지`:''}`},
  qspeed:{n:'센 불꽃',ic:()=>'stardust',max:10,d:l=>`자동 재련 한 번에 ${pf(rqTime(l))}초${l<10?` → ${pf(rqTime(l+1))}초`:''}`},
  wh:{n:'창고 늘리기',ic:()=>'tile',lv:()=>S.wh,cost:()=>whCost(S.wh),buy:()=>{S.wh++},d:()=>`용량 ${big(cap())}칸 → ${big(capOf(S.wh+1))}칸`},
  autosell:{n:'알뜰 정리',ic:()=>'gear',max:1,d:l=>l?'창고가 가득 차면 가장 싼 원석을 팔아 자리를 만들어요':'창고가 가득 차도 가장 싼 원석을 팔며 계속 캐요'},
  safe:{n:'월세 금고',ic:()=>'goldbar',max:3,d:l=>`월세를 ${rentCapH(l)}시간치까지 모아 둬요${l<3?` → ${rentCapH(l+1)}시간`:''}`},
  intel:{n:'소문 감정',ic:()=>'lens',lv:()=>S.intel,max:3,cost:()=>intelCost(S.intel),buy:()=>{S.intel++},d:()=>BON.perfectIntel?'점성술사 노을 덕분에 소문의 진위를 늘 알아요':['소문의 진위를 알 수 없어요','소문 신뢰도 표시 (적중 75%)','소문 신뢰도 표시 (적중 88%)','소문 신뢰도 표시 (적중 97%)'][Math.min(S.intel,3)]},
  haggle:{n:'흥정 솜씨',ic:()=>'crown',max:10,d:l=>`광물 판매가 +${l}%${l<10?` → +${l+1}%`:''}`},
  bulk:{n:'큰손 거래처',ic:()=>'carving',max:5,d:l=>`지층마다 출입권을 ${BAL.pass.max+5*l}장까지${l<5?` → ${BAL.pass.max+5*(l+1)}장`:''}`}};
const SHOPS=[
  {who:'무쇠',place:'무쇠네 대장간',ups:['pick','crit','metal','gem'],lines:['허허, 날이 무뎌졌구려. 내가 벼려 주리다.','쇠는 두드릴수록 정직해지는 법이오.','깊이 내려갈수록 연장이 먼저 지치는 법이오. 자주 들르시오!']},
  {who:'핀',place:'핀의 작업대',ups:['auto','box','refiner','night'],lines:['로봇들이 오늘도 열심히 일하고 있어요!','보관함이 넘치면 제 장치가 알아서 재련해서 팔아 줘요!','밤에도 일하게 해 볼까요? 기름만 넉넉하면 돼요!']},
  {who:'미르',place:'미르의 용광로',ups:['furn','great','qslot','qspeed'],lines:['…불은 거짓말을 하지 않아요.','재료만 맡겨 두세요. …알아서 녹여 둘게요.','불씨가 별빛을 닮을수록… 대성공이 잦아지죠.']},
  {who:'셈',place:'셈의 창고',ups:['wh','autosell','safe'],lines:['창고는 넓을수록 좋지. 돈이 들 뿐이야.','바닥에 굴러다니는 광석은 못 봐. 내가 정리해 주지.','월세는 꼬박꼬박. 금고에 잘 넣어 둘게.']},
  {who:'루카',place:'루카의 정보소',ups:['intel','haggle','bulk'],lines:['정보가 곧 돈이죠! 오늘은 뭐가 궁금하세요?','흥정은 웃으면서 하는 거예요. 제가 알려 드릴게요!','큰손 거래처를 소개해 드릴까요? 출입권을 더 많이 가질 수 있어요!']}];
const upLv=k=>UPS[k].lv?UPS[k].lv():ul(k);
const upMax=k=>UPS[k].max!=null&&upLv(k)>=UPS[k].max;
const upCost=k=>UPS[k].cost?UPS[k].cost():upCostOf(k,ul(k));
const upCan=k=>!upMax(k)&&S.gold>=upCost(k);
function buyUp(k){if(!upCan(k))return false;S.gold-=upCost(k);if(UPS[k].buy)UPS[k].buy();else{S.up[k]=ul(k)+1}refreshBonus();return true}
/* 효과 */
const critP=()=>ul('crit')*.03;
const extraP=s=>s==='metal'?ul('metal')*.05:s==='gem'?ul('gem')*.05:0;
const boxCapOf=l=>Math.floor(BAL.box[0]*Math.pow(BAL.box[1],l));
const ofMul=l=>.5+.2*l;            // 넘친 광석 판매 배율 (자동 재련 장치)
const offEff=()=>1+.15*ul('night'); // 자리 비운 동안 로봇 효율
const rentCapH=l=>offlineH()+4*l;
const rqTime=l=>8/(1+.25*l);        // 자동 재련 한 번에 걸리는 초
const rqSlots=()=>1+ul('qslot');
/* 화면: 가게를 고르면 한쪽에 그 사람이 서서 말하고, 아래에 강화 목록 */
const THANKS={'무쇠':['허허, 좋은 날이 섰소!','이거면 바위가 두부처럼 쪼개질 거요.'],'핀':['짜잔! 훨씬 좋아졌죠?','로봇들이 신났어요!'],'미르':['…불이 한결 맑아졌어요.','좋은 선택이에요. …정말로.'],
  '셈':['좋아, 장부에 적어 둘게.','이제 좀 넉넉하겠네.'],'루카':['거래 성사! 후회 안 하실 거예요.','역시 보는 눈이 있으시네요!']};
const NPC_KEY={'셈':'sem'};
const tenantOf=who=>(SECTIONS.find(s=>s.t.name===who)||{}).t;
// 전신 도트(32×48): 직접 그린 시트가 있으면 그것, 없으면 머리 모양 · 모자 · 옷으로 알아볼 수 있게 간단히 그린다
const NPC_IMG={},NPC_CV={};
function npcFrame(who,pose){const key=NPC_KEY[who];
  if(key&&typeof NPC_META!=='undefined'&&NPC_META[key]&&ART['npc_'+key]){if(!NPC_IMG[key]){const im=new Image();im.src=ART['npc_'+key];NPC_IMG[key]=im}
    const im=NPC_IMG[key],M=NPC_META[key],f=M[pose]||M.idle;if(!im.complete)return null;const c=document.createElement('canvas');c.width=f[2];c.height=f[3];c.getContext('2d').drawImage(im,f[0],f[1],f[2],f[3],0,0,f[2],f[3]);return c}
  const k=who+'|'+pose;return NPC_CV[k]||(NPC_CV[k]=drawChibi(tenantOf(who),pose).canvas(1))}
function drawChibi(t,pose){const st=PSTYLE[t.name]||{},pb=new PB(32,48),SK=st.skin||'#f4c8a0',S2=shade(SK,-.15),HR=ramp(t.hair),CR=ramp(t.coat),out='#2a1a12',hx=16,hy=17;
  pb.ell(16,46.5,10,1.6,'rgba(0,0,0,.25)');
  pb.rect(10,44,5,3,'#3a2a20');pb.rect(18,44,5,3,'#3a2a20');pb.rect(11,40,3,4,CR[0]);pb.rect(19,40,3,4,CR[0]);            // 신발 · 다리
  pb.ell(16,35,8.5,7,(x,y)=>x>19?CR[1]:x<12?CR[3]:CR[2]);pb.rect(8,33,16,8,(x)=>x>19?CR[1]:x<12?CR[3]:CR[2]);             // 몸
  pb.rect(5,31,3,8,CR[2]);pb.rect(24,31,3,8,CR[1]);pb.rect(5,38,3,2,SK);pb.rect(24,38,3,2,S2);                            // 팔 · 손
  if(st.wear==='apron'){pb.rect(11,33,10,8,'#7a5030');pb.rect(11,33,10,1,'#9a6a40')}
  if(st.wear==='scarf'){pb.rect(10,28,12,3,'#f0c050');pb.rect(18,30,3,5,'#d8a030')}
  if(st.wear==='gold'){pb.rect(15,31,2,10,'#e8c060')}
  pb.poly([[12,28],[16,32],[20,28]],'#efe6d8');
  if(st.hs==='long')pb.ell(16,22,12,13,(x,y)=>y>10&&(y<17||x<7||x>25)?(x>23?HR[1]:HR[2]):null);
  if(t.hat==='hood')pb.ell(16,19,13,14,(x)=>x>24?'#3a2c58':'#4a3a6a');
  pb.ell(hx,hy,10.5,10,(x,y,dx,dy)=>dx>.55?S2:SK);                                                                        // 머리(크게)
  const E='#2a1a1a';[[11,18],[19,18]].forEach(([x,y])=>{if(st.half){pb.rect(x,y+1,2,1,E)}else if(st.age===2){pb.rect(x,y+1,2,1,E)}else{pb.rect(x,y,2,3,E);pb.set(x,y,'#ffffff')}});
  pb.rect(9,21,2,1,'#f09a8a');pb.rect(21,21,2,1,'#f09a8a');
  if(pose==='talk'||pose==='happy')pb.rect(14,23,4,2,'#7a2a2a');else pb.rect(14,23,3,1,'#9a4a40');
  if(pose==='happy'){[[11,18],[19,18]].forEach(([x,y])=>{pb.rect(x,y,2,3,SK);pb.set(x,y+1,E);pb.set(x+1,y,E);pb.set(x+2,y+1,E)})}
  if(st.beard==='full'||st.beard==='long'){const BR=ramp(st.beard==='long'?'#ececf2':t.hair);pb.ell(16,25+(st.beard==='long'?2:0),7,st.beard==='long'?6:4,(x,y)=>y>21?(x>19?BR[1]:BR[2]):null)}
  if(st.beard==='stub')for(let x=10;x<=22;x++)for(let y=22;y<=26;y++)if((x+y)%2===0&&Math.hypot((x-16)/7,(y-23.5)/3.6)<1)pb.set(x,y,shade(t.hair,.1));
  if(st.beard==='mous')pb.rect(12,22,8,1,HR[2]);
  const top=st.hs==='bun'||st.age===2?ramp('#dcd6cc'):HR;
  if(st.hs!=='bald'){pb.ell(16,11,11,7,(x,y)=>y<13?(x>21?top[1]:x<11?top[3]:top[2]):null);for(let x=6;x<=26;x++){const yy=12+((x*7)%5<2?(st.hs==='spiky'?3:st.hs==='messy'?2:1):0);for(let y=9;y<=yy;y++)pb.set(x,y,x>22?top[1]:top[2])}
    pb.rect(5,11,2,7,top[2]);pb.rect(25,11,2,7,top[1]);if(st.hs==='spiky')for(let k=0;k<5;k++)pb.poly([[5+k*5,10],[7+k*5,2],[10+k*5,10]],top[2]);if(st.hs==='bun')pb.ell(16,3,3.5,3,top[3])}
  else{pb.rect(5,13,2,5,HR[2]);pb.rect(25,13,2,5,HR[1]);pb.set(11,9,'#ffffff')}
  switch(t.hat){
    case'helmet':{const Y=ramp('#e8b13a');pb.ell(16,10,12,7,(x,y)=>y<11?(x>21?Y[1]:Y[2]):null);pb.rect(3,10,26,2,Y[1]);pb.ell(16,6,2.2,2,'#fff6c8');break}
    case'scarf':{const Q=ramp(t.hatC||'#9a6aaa');pb.ell(16,10,12.5,8,(x,y)=>y<13?(x>21?Q[1]:Q[2]):null);pb.rect(4,10,3,8,Q[2]);pb.rect(25,10,3,8,Q[1]);break}
    case'goggles':{pb.rect(5,10,22,2,'#4a3a2a');[[9,8],[17,8]].forEach(([x,y])=>{pb.rect(x,y,6,5,'#8a7a5a');pb.rect(x+1,y+1,4,3,'#7cc8ff');pb.set(x+1,y+1,'#e8f8ff')});break}
    case'cap':{const G=ramp('#3f8a5a');pb.ell(17,9,11,6,(x,y)=>y<11?G[2]:null);pb.rect(1,10,14,2,G[1]);break}
    case'tophat':{pb.rect(9,-1,14,9,'#22222e');pb.rect(9,6,14,2,'#a03a3a');pb.rect(5,8,22,2,'#1a1a28');break}
    case'bandana':{const B=ramp('#c0402a');pb.ell(16,9,11.5,6,(x,y)=>y<11?B[2]:null);pb.poly([[26,9],[31,6],[30,13]],B[1]);break}
    case'hood':{pb.ell(16,10,13,8,(x,y)=>y<13?(x>24?'#3a2c58':'#4a3a6a'):null);break}
    case'wizard':{const Wz=ramp('#2a2a6a');pb.poly([[4,10],[28,10],[20,-6]],Wz[2]);pb.rect(2,9,28,3,Wz[3]);pb.set(18,2,'#ffe9a8');break}
    case'hairpin':pb.rect(22,8,3,2,'#c28cf4');break}
  if(st.glasses)[[11,18],[19,18]].forEach(([x,y])=>{for(let a=0;a<6.28;a+=.5)pb.set(x+1+Math.cos(a)*2.6,y+1.5+Math.sin(a)*2.4,'#3a3040')});
  pb.outline(out);return pb}
const shopLine={};let shopType=null,shopPose='idle',shopPoseT=null;
function shopSay(text,pose){const p=$('npcSay');if(!p)return;clearInterval(shopType);clearTimeout(shopPoseT);let i=0;p.textContent='';
  shopType=setInterval(()=>{i++;p.textContent=text.slice(0,i);npcPose(pose==='happy'?'happy':(i%4<2?'talk':'idle'));if(i>=text.length){clearInterval(shopType);shopPoseT=setTimeout(()=>npcPose('idle'),pose==='happy'?1400:200)}},28)}
function npcPose(p){if(p===shopPose)return;shopPose=p;drawNpc()}
function drawNpc(){const cv=$('npcCv');if(!cv)return;const sh=SHOPS[S.shop|0],f=npcFrame(sh.who,shopPose);if(!f){setTimeout(drawNpc,60);return}cv.width=40;cv.height=50;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,40,50);x.drawImage(f,Math.round((40-f.width)/2),50-f.height)}
let shopShown=-1;
// 얼굴 칸: 직접 그린 초상화(art/portraits)가 있으면 그것, 없으면 도트 초상화
function drawHead(cv,t){if(t.art&&typeof ART!=='undefined'&&ART[t.art]){const im=new Image();im.onload=()=>{cv.width=cv.height=64;const x=cv.getContext('2d');x.imageSmoothingEnabled=true;x.drawImage(im,0,0,64,64)};im.src=ART[t.art]}else drawPortrait(cv,t,false)}
function renderEquip(){const si=Math.min(SHOPS.length-1,S.shop|0),sh=SHOPS[si];
  setHTML($('shopTabs'),SHOPS.map((x,i)=>`<button class="shopc${i===si?' on':''}" data-shop="${i}" type="button"><canvas data-head="${i}" width="64" height="64"></canvas><span>${x.who}</span>${x.ups.some(upCan)?'<i class="dot"></i>':''}</button>`).join(''));
  document.querySelectorAll('[data-head]').forEach(cv=>{if(!cv.dataset.done){const t=tenantOf(SHOPS[+cv.dataset.head].who);if(t)drawHead(cv,t);cv.dataset.done=1}});
  if(shopShown!==si){shopShown=si;const st=$('shopStage');st.className='panel stage '+(si%2?'side-r':'side-l');
    setHTML(st,`<canvas class="npc" id="npcCv" width="40" height="50"></canvas><div class="bubble"><div class="bn"><b>${sh.who}</b> <span class="dim">${sh.place}</span></div><p id="npcSay"></p></div>`);
    shopPose='';npcPose('idle');shopSay(sh.lines[shopLine[si]=((shopLine[si]??-1)+1)%sh.lines.length])}
  setHTML($('shopUps'),sh.ups.map(k=>{const U=UPS[k],l=upLv(k),mx=upMax(k),can=upCan(k),c=upCost(k);
    return`<div class="up${can?' ready':''}">${ico(U.ic())}<span class="t">${U.n} <span class="dim">Lv.${l}${U.max!=null?'/'+U.max:''}</span></span><span class="s">${U.d(ul(k))}</span><button class="px-btn${can?' ndot':''}" data-up="${k}" type="button" ${mx||!can?'disabled':''}>${mx?'최대':big(c)+'G'}</button></div>`}).join(''))}
$('tab-equip').addEventListener('click',e=>{const b=e.target.closest('[data-up]');if(b){if(buyUp(b.dataset.up)){sfx('buy');const w=SHOPS[S.shop|0].who,L=THANKS[w];shopSay(L[Math.random()*L.length|0],'happy');renderAll()}return}
  const c=e.target.closest('[data-shop]');if(c){S.shop=+c.dataset.shop;renderEquip();return}
  if(e.target.closest('#npcCv')){const si=S.shop|0,sh=SHOPS[si];shopSay(sh.lines[shopLine[si]=((shopLine[si]??0)+1)%sh.lines.length])}});
