/* ═════════ 장비: 마을 사람들의 공방 ═════════
   곡괭이 = 무쇠(대장장이), 자동 드릴 = 핀(꼬마 기계공), 풀무·용광로 = 미르(연금술사), 창고 = 셈(창고지기), 장터 정보 = 루카(떠돌이 상인)
   기존 장비(곡괭이 Lv, 드릴 수, 풀무, 창고, 정보원)는 저장 필드 그대로 쓰고, 세부 강화는 S.up[키]에 단계로 저장한다. */
const ul=k=>(S.up&&S.up[k])||0;
// 값: 기본 × 배율^단계. 예전 한도(c[3])를 넘는 단계는 완만한 배율(c[2])로
const upCostOf=(k,lv)=>{const c=BAL.ups[k],kn=c[3]??1e9;return Math.round(c[0]*Math.pow(c[1],Math.min(lv,kn))*Math.pow(c[2]||1,Math.max(0,lv-kn)))};
const pc=v=>Math.round(v*100);
const UPS={
  pick:{n:'곡괭이 벼리기',ic:()=>['iron','iron','steel','resonant','obsalloy','stariron'][pickTier()],lv:()=>S.pick,cost:()=>pickCost(S.pick),buy:()=>{const o=pickTier();S.pick++;if(pickTier()>o)log(`새 곡괭이 획득: ${PICK_TIERS[pickTier()][1]}!`,true)},
    d:()=>{const NT=PICK_TIERS[pickTier()+1],a=tapPower(),b=pickPower(S.pick+1)*BON.tap*boostMul();return`탭 한 번에 ${big(a)} 피해 → ${big(b)} (+${Math.round((b/a-1)*100)}%)${NT?` · Lv.${NT[0]}에 ${NT[1]}`:''}`}},   // v33: 다음 단계에 몇 % 세지는지
  crit:{n:'힘껏 내려치기',ic:()=>'meteoriron',max:20,d:l=>`탭할 때 ${pc(critAt(l))}% 확률로 3배 피해를 줘요${l<20?` → ${pc(critAt(l+1))}%`:''}`},
  metal:{n:'쇠맥 찾기',ic:()=>'goldbar',max:20,d:l=>`금속 광석을 캘 때 ${pc(extraAt(l))}% 확률로 한 개를 더 얻어요${l<20?` → ${pc(extraAt(l+1))}%`:''}`},
  gem:{n:'보석 눈썰미',ic:()=>'cutemerald',max:20,d:l=>`보석 원석을 캘 때 ${pc(extraAt(l))}% 확률로 한 개를 더 얻어요${l<20?` → ${pc(extraAt(l+1))}%`:''}`},
  auto:{n:'드릴 로봇',ic:()=>'gear',lv:()=>S.auto,cost:()=>autoCost(S.auto),buy:()=>{S.auto++;if(S.auto===1)log('핀이 만든 드릴 로봇이 채굴을 시작했어요!',true)},
    d:()=>{if(!S.auto)return'혼자서도 바위를 깨는 작은 드릴 로봇을 들여요';const a=drillPow(),b=drillPow(S.auto+1);return`드릴 파워 ${big(a)} → ${big(b)} (+${Math.round((b/a-1)*100)}%)`}},   // v32: 다음 단계에 드릴 파워가 몇 % 오르는지
  box:{n:'채굴 보관함',ic:()=>'brick',d:l=>`창고가 가득 차면 로봇이 여기에 광석을 모아요 · ${big(boxCapOf(l))}칸 → ${big(boxCapOf(l+1))}칸`},
  refiner:{n:'자동 판매 장치',ic:()=>'crysteel',max:10,d:l=>`보관함이 넘치면 광석을 원석 값의 ${Math.round(ofMul(l)*100)}%에 자동으로 팔아요${l<10?` → ${Math.round(ofMul(l+1)*100)}%`:''}`},
  night:{n:'밤샘 근무',ic:()=>'moonstone',max:10,d:l=>`오프라인 보상이 ${pc(nightAt(l))}% 더 빨리 쌓여요${l<10?` → ${pc(nightAt(l+1))}%`:''}`},
  furn:{n:'풀무',ic:()=>'coke',lv:()=>S.furnace,max:5,cost:()=>furnCost(S.furnace),buy:()=>{S.furnace++},d:()=>`제련 성공률 ${Math.round(successRate()*100)}% · 대성공 확률 ${Math.round(greatRate()*100)}%`},
  great:{n:'별빛 불씨',ic:()=>'stardust',max:10,d:l=>`대성공 확률이 +${l}% 올라가요${l<10?` → +${l+1}%`:''}`},
  vheat:{n:'별빛 여운',ic:()=>'gold',max:10,d:l=>`황금 광맥이 ${veinSecAt(l)}초 동안 유지돼요${l<10?` → ${veinSecAt(l+1)}초`:''}`},
  wh:{n:'창고 늘리기',ic:()=>'tile',lv:()=>S.wh,cost:()=>whCost(S.wh),buy:()=>{S.wh++},d:()=>`창고 용량 ${big(cap())}칸 → ${big(capOf(S.wh+1))}칸`},
  autosell:{n:'알뜰 정리',ic:()=>'gear',max:1,d:l=>l?'창고가 가득 차면 가장 싼 원석부터 팔아 공간을 확보해요':'창고가 꽉 차도 가장 싼 원석을 팔아 계속 채굴해요'},
  safe:{n:'월세 금고',ic:()=>'silverbar',max:5,d:l=>`월세를 최대 ${rentCapH(l)}시간분까지 모아 둬요${l<5?` → ${rentCapH(l+1)}시간`:''}`},
  intel:{n:'소문 감정',ic:()=>'cutsapph',lv:()=>S.intel,max:INTEL_MAX,cost:()=>intelCost(S.intel),buy:()=>{S.intel++},d:()=>{const l=S.intel,a=Math.round(intelAcc(l)*100),b=Math.round(intelAcc(l+1)*100);return l?`소문 신뢰도 표시 (적중률 ${a}%)${l<INTEL_MAX?` → ${b}%`:''}`:`아직 소문의 진위를 알 수 없어요 → 적중률 ${b}%`}},
  haggle:{n:'흥정 솜씨',ic:()=>'cutgarnet',max:20,d:l=>`광물 판매가가 +${l}% 올라가요${l<20?` → +${l+1}%`:''}`},
  bulk:{n:'큰손 거래처',ic:()=>'platbar',max:10,d:l=>`지층마다 출입권을 최대 ${BAL.pass.max+10*l}장까지 보유해요${l<10?` → ${BAL.pass.max+10*(l+1)}장`:''}`}};
// 고르는 칸 순서 = 탑 층이 낮은 순서(무쇠 1층 · 셈 6층 · 핀 10층 · 루카 21층 · 미르 28층)
const SHOPS=[
  {who:'무쇠',ups:['pick','crit','metal','gem'],lines:["날이 꽤 무뎌졌네? 이리 줘, 금방 손봐 줄게!", "오늘도 바위랑 한바탕 붙고 왔구나? 하하!", "망치는 내가 휘두르고, 바위는 네가 깨고. 우리 제법 잘 맞지?", "좋은 쇠는 손에 쥐어 보면 바로 알아.", "불 지폈다! 오늘은 뭐부터 벼릴까?", "곡괭이 한번 들어 봐. …음, 손 좀 봐야겠는데?"]},
  {who:'셈',ups:['wh','autosell','safe'],lines:["뭘 맡길 거야? 몇 개나 필요한지부터 말해.", "창고가 꽉 찼네. 공간 좀 더 만들어 줄까?", "정리는 내가 할게. 넌 광석이나 잔뜩 캐 와.", "장부는 다 맞춰 놨어. 이제 필요한 것만 말해.", "이 가격이면 괜찮아. 내가 계산해 봤어.", "창고에 빈칸이 생기면 속이 다 시원해."]},
  {who:'핀',ups:['auto','box','refiner','night'],lines:["짜잔! 오늘은 뭘 고쳐 드릴까요?", "로봇들이 오늘도 열심히 돌아가고 있어요!", "보관함이 넘쳐도 걱정 마세요. 제 장치가 알아서 팔아 주거든요!", "공구도 꺼내 놨어요. 뭘 손봐 드릴까요?", "이 소리 들려요? 위이잉—! 아주 잘 돌아가죠?", "고장 난 데가 있나요? 아니면 더 빠르게 만들까요?"]},
  {who:'루카',ups:['intel','haggle','bulk'],lines:["정보가 곧 돈이죠! 오늘은 뭘 알고 싶으세요?", "흥정할 땐 일단 웃으세요. 그다음은 제가 알려 드리죠~", "손님, 오늘은 운이 좋아 보이시는데요?", "오늘 거래 장부도 새로 폈답니다. 첫 손님이시네요!", "큰손이 되고 싶으시다고요? 좋은 방법이 좀 있죠~", "쉿, 이건 다른 손님한텐 비밀이에요."]},
  {who:'미르',ups:['furn','great','vheat'],lines:["…불은 거짓말을 하지 않아요.", "재료를 맡겨 주시면… 잘 녹여 볼게요.", "오늘은 불꽃이 맑네요. …좋은 결과가 나올 것 같아요.", "…어떤 재료를 녹여 볼까요?", "용광로에 불을 지펴 뒀어요. …천천히 골라 주세요.", "재료가 섞이는 소리… 들리세요?"]}];
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
// 넘친 광석 판매 배율 (자동 판매 장치). v30: 예전엔 10단계 175%라 직접 파는 것(100%)보다 비싸게 팔려 창고를 꽉 채워 두는 게 이득이었음 → BAL.of=[처음, 단계마다, 최대]로 최대 100%
const ofMul=l=>BAL.of?Math.min(BAL.of[2],BAL.of[0]+BAL.of[1]*l):l<=5?.5+.2*l:1.5+(l-5)*.05;
const offEff=()=>1+nightAt(ul('night'));      // 자리 비운 보상이 차는 속도(상한은 그대로 '켜 두고 1시간치')
const rentCapH=l=>offlineH()+4*l;
// 미르(연금술사)는 '별의 열'을 느끼는 사람 → 황금 광맥을 더 오래 붙잡아 둠(기본 30초, 단계마다 +2초, 10단계 50초)
const veinSecAt=l=>VEIN_SEC+2*l;
/* 화면: 가게를 고르면 한쪽에 그 사람이 서서 말하고, 아래에 강화 목록 */
const THANKS={"무쇠": ["자, 받아! 날이 아주 잘 섰지?", "하하! 이 정도면 바위가 먼저 겁먹겠는데?", "이번 건 정말 잘 나왔어. 나도 마음에 든다!", "손에 쥐어 봐. 전보다 훨씬 편하지?"], "핀": ["짜잔! 어때요, 훨씬 좋아졌죠?", "로봇이 아주 신나서 돌아가는데요!", "이거 정말 잘됐어요! 저도 이렇게 잘 나올 줄은 몰랐어요.", "위이잉—! 들리죠? 제대로 돌아가는 소리예요!"], "미르": ["…불꽃이 한결 고르게 타네요.", "잘 선택하셨어요. …분명 도움이 될 거예요.", "…별빛이 조금 더 또렷해졌어요.", "고마워요. …불꽃도 기분이 좋아 보이네요."], "셈": ["좋아, 장부에 적어 둘게.", "이제 공간이 좀 넉넉해졌겠네.", "계산 끝. 손해 볼 일은 없겠어.", "깔끔하네. 이 정도면 됐어."], "루카": ["거래 성사! 좋은 선택이세요.", "역시 안목이 있으시네요!", "손님 같은 분이 자주 오셔야 장사할 맛이 나죠~", "오늘 거래는 장부에 별표 쳐 둘게요!"]};
// 사람 · 배경: art/shop (tools/shop_art.py), 고르는 액자: 입주자 초상화(art/portraits) + 가게 이름표. flip = 말풍선 쪽을 보게 뒤집기
const SHOP_ART={'무쇠':{k:'musoe',sign:'대장간'},'핀':{k:'pin',sign:'공방'},'미르':{k:'mir',sign:'용광로'},'셈':{k:'sem',sign:'창고'},'루카':{k:'luka',sign:'정보소'}};
// v29: 영어 가게 이름표는 액자 폭(좁은 화면 53px)에 맞는 짧은 이름. 다른 곳의 번역(Warehouse · Workshop · Info Desk)은 그대로
const SIGN_EN={'대장간':'Smithy','창고':'Storage','공방':'Tinker','정보소':'Info','용광로':'Furnace'};
const shopSign=w=>LANG==='en'?SIGN_EN[SHOP_ART[w].sign]:SHOP_ART[w].sign;
const shopLine={};let shopType=null,shopPose='idle',shopPoseT=null;
function shopSay(text,pose){const p=$('npcSay');if(!p)return;text=T(text);clearInterval(shopType);clearTimeout(shopPoseT);let i=0;p.textContent='';
  shopType=setInterval(()=>{i++;p.textContent=text.slice(0,i);npcPose(pose==='happy'?'happy':(i%4<2?'talk':'idle'));if(i>=text.length){clearInterval(shopType);shopPoseT=setTimeout(()=>npcPose('idle'),pose==='happy'?1400:200)}},28)}
function npcPose(p){if(p===shopPose)return;shopPose=p;const n=$('npcImg');if(n)n.dataset.pose=p}
let shopShown=-1;
function renderEquip(){const si=Math.min(SHOPS.length-1,S.shop|0),sh=SHOPS[si];
  setHTML($('shopTabs'),SHOPS.map((x,i)=>`<button class="shopc${i===si?' on':''}${shopOpen(i)?'':' lock'}" data-shop="${i}" type="button"><span class="fr"><img src="${shopOpen(i)?ART[SHOP_ART[x.who].k]:ART['shop_'+SHOP_ART[x.who].k]}" alt="${shopOpen(i)?x.who:'아직 돌아오지 않은 주민'}"></span><span class="plate">${shopOpen(i)?shopSign(x.who):`탑 ${SECTIONS[tenantSec(x.who)].to}층`}</span>${x.ups.some(upCan)?'<i class="dot"></i>':''}</button>`).join(''));
  const op=shopOpen(si);
  if(shopShown!==si+(op?'':'x')){shopShown=si+(op?'':'x');const st=$('shopStage');st.className='panel stage '+(si%2?'side-r':'side-l');
    const a=SHOP_ART[sh.who];st.style.backgroundImage=`url(${ART['shop_bg_'+a.k]})`;
    setHTML(st,`<div class="npcw${a.flip?' flip':''}${op?'':' sil'}"><img class="npc" id="npcImg" src="${ART['shop_'+a.k]}" alt="${op?sh.who:'???'}"></div><div class="bubble"><div class="bn"><b>${op?sh.who:'???'}</b></div><p id="npcSay"></p></div>`);
    shopPose='';npcPose('idle');if(op)shopSay(sh.lines[shopLine[si]=((shopLine[si]??-1)+1)%sh.lines.length]);else $('npcSay').textContent=`아직 가게 주인이 없어요. 탑을 ${SECTIONS[tenantSec(sh.who)].to}층까지 지으면 돌아올 거예요.`}
  if(!op){setHTML($('shopUps'),`<p class="dim small" style="margin:0">주인이 돌아오면 여기서 장비를 강화할 수 있어요.</p>`);return}
  setHTML($('shopUps'),sh.ups.map(k=>{const U=UPS[k],l=upLv(k),mx=upMax(k),can=upCan(k),c=upCost(k);
    return`<div class="up${can?' ready':''}">${ico(U.ic())}<span class="t">${U.n} <span class="dim">Lv.${l}${U.max!=null?'/'+U.max:''}</span></span><span class="s">${U.d(ul(k))}</span><button class="px-btn${can?' ndot':''}" data-up="${k}" type="button" ${mx||!can?'disabled':''}>${mx?'최대':big(c)+'G'}</button></div>`}).join(''))}
$('tab-equip').addEventListener('click',e=>{const b=e.target.closest('[data-up]');if(b){if(buyUp(b.dataset.up)){sfx('buy');const w=SHOPS[S.shop|0].who,L=THANKS[w];shopSay(L[Math.random()*L.length|0],'happy');renderAll()}return}
  const c=e.target.closest('[data-shop]');if(c){S.shop=+c.dataset.shop;renderEquip();return}
  if(e.target.closest('#npcImg')){const si=S.shop|0,sh=SHOPS[si];if(!shopOpen(si))return;shopSay(sh.lines[shopLine[si]=((shopLine[si]??0)+1)%sh.lines.length])}});
