/* ═════════ 장비: 마을 사람들의 공방 ═════════
   곡괭이 = 무쇠(대장장이), 자동 드릴 = 핀(꼬마 기계공), 풀무·용광로 = 미르(연금술사), 창고 = 셈(창고지기), 장터 정보 = 루카(떠돌이 상인)
   기존 장비(곡괭이 Lv, 드릴 수, 풀무, 창고, 정보원)는 저장 필드 그대로 쓰고, 세부 강화는 S.up[키]에 단계로 저장한다. */
const ul=k=>(S.up&&S.up[k])||0;
// 값: 기본 × 배율^단계. 예전 한도(c[3])를 넘는 단계는 완만한 배율(c[2])로
const upCostOf=(k,lv)=>{const c=BAL.ups[k],kn=c[3]??1e9;return Math.round(c[0]*Math.pow(c[1],Math.min(lv,kn))*Math.pow(c[2]||1,Math.max(0,lv-kn)))};
const pc=v=>Math.round(v*100);
const UPS={
  pick:{n:'곡괭이 벼리기',ic:()=>['iron','iron','steel','resonant','obsalloy','stariron'][pickTier()],lv:()=>S.pick,cost:()=>pickCost(S.pick),buy:()=>{const o=pickTier();S.pick++;if(pickTier()>o)log(`새 곡괭이: ${PICK_TIERS[pickTier()][1]}!`,true)},
    d:()=>{const NT=PICK_TIERS[pickTier()+1];return`한 번 탭에 ${big(tapPower())} 피해${NT?` · Lv.${NT[0]}에 ${NT[1]}`:''}`}},
  crit:{n:'힘껏 내려치기',ic:()=>'meteoriron',max:20,d:l=>`탭할 때 ${pc(critAt(l))}% 확률로 3배 피해${l<20?` → ${pc(critAt(l+1))}%`:''}`},
  metal:{n:'쇠맥 찾기',ic:()=>'goldbar',max:20,d:l=>`금속 광석을 캘 때 ${pc(extraAt(l))}% 확률로 하나 더${l<20?` → ${pc(extraAt(l+1))}%`:''}`},
  gem:{n:'보석 눈썰미',ic:()=>'cutemerald',max:20,d:l=>`보석 원석을 캘 때 ${pc(extraAt(l))}% 확률로 하나 더${l<20?` → ${pc(extraAt(l+1))}%`:''}`},
  auto:{n:'드릴 로봇',ic:()=>'gear',lv:()=>S.auto,cost:()=>autoCost(S.auto),buy:()=>{S.auto++;if(S.auto===1)log('핀이 만들어 준 드릴 로봇이 일을 시작했어요.',true)},
    d:()=>S.auto?`로봇 ${S.auto}대 · 초당 ${big(autoDps())} 피해`:'혼자서도 바위를 깨는 작은 로봇을 들여요'},
  box:{n:'채굴 보관함',ic:()=>'brick',d:l=>`창고가 차면 로봇이 여기에 모아요 · ${big(boxCapOf(l))}칸 → ${big(boxCapOf(l+1))}칸`},
  refiner:{n:'자동 재련 장치',ic:()=>'crysteel',max:10,d:l=>`보관함이 넘치면 ${l?`재련해서 원석 값의 ${Math.round(ofMul(l)*100)}%로`:`원석 값의 ${Math.round(ofMul(0)*100)}%로`} 팔아요${l<10?` → ${Math.round(ofMul(l+1)*100)}%`:''}`},
  night:{n:'밤샘 근무',ic:()=>'moonstone',max:10,d:l=>`자리 비운 보상이 ${pc(nightAt(l))}% 더 빨리 차요${l<10?` → ${pc(nightAt(l+1))}%`:''}`},
  furn:{n:'풀무',ic:()=>'coke',lv:()=>S.furnace,max:5,cost:()=>furnCost(S.furnace),buy:()=>{S.furnace++},d:()=>`재련 성공 ${Math.round(successRate()*100)}% · 대성공 ${Math.round(greatRate()*100)}%`},
  great:{n:'별빛 불씨',ic:()=>'stardust',max:10,d:l=>`대성공 확률 +${l}%${l<10?` → +${l+1}%`:''}`},
  qslot:{n:'자동 재련 칸',ic:()=>'glass',max:5,d:l=>`자동 재련을 ${1+l}가지 동시에${l<5?` → ${2+l}가지`:''}`},
  qspeed:{n:'센 불꽃',ic:()=>'coal',max:20,d:l=>`자동 재련 한 번에 ${pf(rqTime(l))}초${l<20?` → ${pf(rqTime(l+1))}초`:''}`},
  wh:{n:'창고 늘리기',ic:()=>'tile',lv:()=>S.wh,cost:()=>whCost(S.wh),buy:()=>{S.wh++},d:()=>`용량 ${big(cap())}칸 → ${big(capOf(S.wh+1))}칸`},
  autosell:{n:'알뜰 정리',ic:()=>'gear',max:1,d:l=>l?'창고가 가득 차면 가장 싼 원석을 팔아 자리를 만들어요':'창고가 가득 차도 가장 싼 원석을 팔며 계속 캐요'},
  safe:{n:'월세 금고',ic:()=>'silverbar',max:5,d:l=>`월세를 ${rentCapH(l)}시간치까지 모아 둬요${l<5?` → ${rentCapH(l+1)}시간`:''}`},
  intel:{n:'소문 감정',ic:()=>'cutsapph',lv:()=>S.intel,max:3,cost:()=>intelCost(S.intel),buy:()=>{S.intel++},d:()=>['소문의 진위를 알 수 없어요','소문 신뢰도 표시 (적중 75%)','소문 신뢰도 표시 (적중 88%)','소문 신뢰도 표시 (적중 97%)'][Math.min(S.intel,3)]},
  haggle:{n:'흥정 솜씨',ic:()=>'cutgarnet',max:20,d:l=>`광물 판매가 +${l}%${l<20?` → +${l+1}%`:''}`},
  bulk:{n:'큰손 거래처',ic:()=>'platbar',max:10,d:l=>`지층마다 출입권을 ${BAL.pass.max+10*l}장까지${l<10?` → ${BAL.pass.max+10*(l+1)}장`:''}`}};
// 고르는 칸 순서 = 탑 층이 낮은 순서(무쇠 1층 · 셈 6층 · 핀 10층 · 루카 21층 · 미르 28층)
const SHOPS=[
  {who:'무쇠',ups:['pick','crit','metal','gem'],lines:["날 무뎌졌네? 이리 줘, 금방 세워 줄게!", "오늘도 바위랑 한판 붙고 왔구나. 하하!", "망치는 내가, 땀은 네가. 공평하지?", "좋은 쇠는 좋은 손을 알아본다고.", "불 올렸다! 뭐부터 벼릴까?", "곡괭이 들어 봐. …응, 이건 손 좀 봐야겠다."]},
  {who:'셈',ups:['wh','autosell','safe'],lines:["뭘 맡길 거야? 개수부터 말해.", "창고가 숨 막혀 하네. 칸을 좀 늘려 볼까?", "정리는 내 일이야. 넌 캐기만 해.", "장부는 다 맞춰 놨어. 이제 네 차례야.", "이 가격이면 남는 장사야. 믿어.", "빈칸이 보이면 마음이 편해지지 않아?"]},
  {who:'핀',ups:['auto','box','refiner','night'],lines:["짜잔! 오늘은 뭘 고쳐 드릴까요?", "로봇들이 오늘도 열심히 일하고 있어요!", "보관함이 넘치면 제 장치가 알아서 팔아 줘요!", "공구 상자 열었어요. 준비 완료!", "이 소리 들려요? 위이잉— 좋은 소리죠!", "고장 났어요? 아님 더 빠르게?"]},
  {who:'루카',ups:['intel','haggle','bulk'],lines:["정보가 곧 돈이죠! 오늘은 뭐가 궁금하세요?", "흥정은 웃으면서 하는 거예요. 제가 알려 드릴게요~", "손님, 오늘 운세 좋아 보이는데요?", "거래 장부 새로 폈어요. 첫 손님 환영!", "큰손이 되고 싶으세요? 다 방법이 있죠~", "쉿, 이건 손님한테만 하는 얘기예요."]},
  {who:'미르',ups:['furn','great','qslot','qspeed'],lines:["…불은 거짓말을 하지 않아요.", "재료만 맡겨 두세요. …알아서 녹여 둘게요.", "불씨가 맑네요. …좋은 날이에요.", "…무엇을 녹여 볼까요?", "용광로가 기다리고 있었어요. …조용히.", "섞이는 소리… 들리세요?"]}];
// 가게는 그 사람이 탑에 들어와야 열린다(그 전엔 고르는 칸에 검은 실루엣)
const tenantSec=who=>SECTIONS.findIndex(s=>s.t.name===who);
const tenantIn=who=>{const i=tenantSec(who);return i>=0&&S.floors>=SECTIONS[i].to};
const shopOpen=i=>tenantIn(SHOPS[i].who);
const UP_SHOP={};SHOPS.forEach((sh,i)=>sh.ups.forEach(k=>UP_SHOP[k]=i));
const upOpen=k=>shopOpen(UP_SHOP[k]);
const upLv=k=>UPS[k].lv?UPS[k].lv():ul(k);
const upMax=k=>UPS[k].max!=null&&upLv(k)>=UPS[k].max;
const upCost=k=>UPS[k].cost?UPS[k].cost():upCostOf(k,ul(k));
const upCan=k=>upOpen(k)&&!upMax(k)&&S.gold>=upCost(k);
function buyUp(k){if(!upCan(k))return false;S.gold-=upCost(k);if(UPS[k].buy)UPS[k].buy();else{S.up[k]=ul(k)+1}refreshBonus();return true}
/* 효과 */
// 단계별 효과: 예전 한도(10 · 5단계)까지는 그대로, 그 뒤 단계는 조금씩
const critAt=l=>l<=10?l*.03:.3+(l-10)*.01;            // 20단계 40%
const extraAt=l=>l<=10?l*.05:.5+(l-10)*.02;          // 20단계 70%
const nightAt=l=>l<=5?l*.15:.75+(l-5)*.05;           // 10단계 +100%(8시간 → 4시간에 가득)
const critP=()=>critAt(ul('crit'));
const extraP=s=>s==='metal'?extraAt(ul('metal')):s==='gem'?extraAt(ul('gem')):0;
const boxCapOf=l=>Math.floor(BAL.box[0]*Math.pow(BAL.box[1],l));
const ofMul=l=>l<=5?.5+.2*l:1.5+(l-5)*.05;   // 넘친 광석 판매 배율 (자동 재련 장치, 10단계 175%)
const offEff=()=>1+nightAt(ul('night'));      // 자리 비운 보상이 차는 속도(상한은 그대로 '켜 두고 1시간치')
const rentCapH=l=>offlineH()+4*l;
const rqTime=l=>8/(1+.25*l);        // 자동 재련 한 번에 걸리는 초
const rqSlots=()=>1+ul('qslot');
/* 화면: 가게를 고르면 한쪽에 그 사람이 서서 말하고, 아래에 강화 목록 */
const THANKS={"무쇠": ["자, 받아! 이 날 좀 봐, 번쩍번쩍하지?", "하하! 바위가 무서워서 도망가겠는데?", "이번 건 진짜 잘 나왔다. 내 자랑이야!", "손에 쥐어 봐. 딱 맞지?"], "핀": ["짜잔! 훨씬 좋아졌죠?", "로봇들이 신났어요!", "이거 제 최고 걸작이에요, 진짜로요!", "위이잉— 들리죠? 기분 좋은 소리!"], "미르": ["…불이 한결 맑아졌어요.", "좋은 선택이에요. …정말로.", "…별이 조금 더 가까워졌어요.", "고마워요. …불도 고마워하네요."], "셈": ["좋아, 장부에 적어 둘게.", "이제 좀 넉넉하겠네.", "계산 끝. 손해 본 사람 없어.", "깔끔하네. 마음에 들어."], "루카": ["거래 성사! 후회 안 하실 거예요.", "역시 보는 눈이 있으시네요!", "손님 같은 분만 있으면 장사할 맛 나죠~", "이 거래, 제 장부에 금색으로 적어 둘게요!"]};
// 사람 · 배경: art/shop (tools/shop_art.py), 고르는 액자: 입주자 초상화(art/portraits) + 가게 이름표. flip = 말풍선 쪽을 보게 뒤집기
const SHOP_ART={'무쇠':{k:'musoe',sign:'대장간'},'핀':{k:'pin',sign:'공방'},'미르':{k:'mir',sign:'용광로'},'셈':{k:'sem',sign:'창고'},'루카':{k:'luka',sign:'정보소'}};
const shopLine={};let shopType=null,shopPose='idle',shopPoseT=null;
function shopSay(text,pose){const p=$('npcSay');if(!p)return;text=T(text);clearInterval(shopType);clearTimeout(shopPoseT);let i=0;p.textContent='';
  shopType=setInterval(()=>{i++;p.textContent=text.slice(0,i);npcPose(pose==='happy'?'happy':(i%4<2?'talk':'idle'));if(i>=text.length){clearInterval(shopType);shopPoseT=setTimeout(()=>npcPose('idle'),pose==='happy'?1400:200)}},28)}
function npcPose(p){if(p===shopPose)return;shopPose=p;const n=$('npcImg');if(n)n.dataset.pose=p}
let shopShown=-1;
function renderEquip(){const si=Math.min(SHOPS.length-1,S.shop|0),sh=SHOPS[si];
  setHTML($('shopTabs'),SHOPS.map((x,i)=>`<button class="shopc${i===si?' on':''}${shopOpen(i)?'':' lock'}" data-shop="${i}" type="button"><span class="fr"><img src="${shopOpen(i)?ART[SHOP_ART[x.who].k]:ART['shop_'+SHOP_ART[x.who].k]}" alt="${shopOpen(i)?x.who:'아직 돌아오지 않은 사람'}"></span><span class="plate">${shopOpen(i)?SHOP_ART[x.who].sign:`탑 ${SECTIONS[tenantSec(x.who)].to}층`}</span>${x.ups.some(upCan)?'<i class="dot"></i>':''}</button>`).join(''));
  const op=shopOpen(si);
  if(shopShown!==si+(op?'':'x')){shopShown=si+(op?'':'x');const st=$('shopStage');st.className='panel stage '+(si%2?'side-r':'side-l');
    const a=SHOP_ART[sh.who];st.style.backgroundImage=`url(${ART['shop_bg_'+a.k]})`;
    setHTML(st,`<div class="npcw${a.flip?' flip':''}${op?'':' sil'}"><img class="npc" id="npcImg" src="${ART['shop_'+a.k]}" alt="${op?sh.who:'???'}"></div><div class="bubble"><div class="bn"><b>${op?sh.who:'???'}</b></div><p id="npcSay"></p></div>`);
    shopPose='';npcPose('idle');if(op)shopSay(sh.lines[shopLine[si]=((shopLine[si]??-1)+1)%sh.lines.length]);else $('npcSay').textContent=`아직 아무도 없어요. 탑 ${SECTIONS[tenantSec(sh.who)].to}층을 쌓으면 이곳 주인이 돌아와요.`}
  if(!op){setHTML($('shopUps'),`<p class="dim small" style="margin:0">가게 주인이 돌아오면 여기서 장비를 손볼 수 있어요.</p>`);return}
  setHTML($('shopUps'),sh.ups.map(k=>{const U=UPS[k],l=upLv(k),mx=upMax(k),can=upCan(k),c=upCost(k);
    return`<div class="up${can?' ready':''}">${ico(U.ic())}<span class="t">${U.n} <span class="dim">Lv.${l}${U.max!=null?'/'+U.max:''}</span></span><span class="s">${U.d(ul(k))}</span><button class="px-btn${can?' ndot':''}" data-up="${k}" type="button" ${mx||!can?'disabled':''}>${mx?'최대':big(c)+'G'}</button></div>`}).join(''))}
$('tab-equip').addEventListener('click',e=>{const b=e.target.closest('[data-up]');if(b){if(buyUp(b.dataset.up)){sfx('buy');const w=SHOPS[S.shop|0].who,L=THANKS[w];shopSay(L[Math.random()*L.length|0],'happy');renderAll()}return}
  const c=e.target.closest('[data-shop]');if(c){S.shop=+c.dataset.shop;renderEquip();return}
  if(e.target.closest('#npcImg')){const si=S.shop|0,sh=SHOPS[si];if(!shopOpen(si))return;shopSay(sh.lines[shopLine[si]=((shopLine[si]??0)+1)%sh.lines.length])}});
