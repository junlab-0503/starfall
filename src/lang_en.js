/* ═════════ English ═════════
 d: 화면 글자(단추 · 안내문) 원문 → 번역. 광물 · 지층 · 입주자 · 대사 같은 데이터 문장은 lang/en.txt → src/lang_data.js
 f: 숫자 · 이름이 끼는 문장(틀은 src/lang_pat.js) */
LANGS.en={d:{
// 제목 · 머리
'별빛광맥':'Starlight Vein','할아버지의 일지를 따라, 별을 집으로':"Follow Grandpa's journal and bring the star home",'터치하여 시작하기':'Tap to start','탭하면 건너뛰어요':'Tap to skip',
'골드':'Gold','깊이':'Depth','창고':'Warehouse','탑':'Tower','채굴':'Mine','장비':'Gear','재련':'Smelt','장터':'Market','관리':'Manage',
// 채굴 화면
'황금 광맥!':'Golden Vein!','드릴':'Drill','드릴 ON':'Drill ON','드릴 OFF':'Drill OFF','자리 비워도 캐요':'Digs while you are away','자리 비워도 쉬어요':'Rests while you are away','창고 가득 · 보관함에 모아요':'Warehouse full · storing in stash',
'DEV 광맥':'DEV Vein','확률 보기':'Drop rates','채굴 보관함':'Mining Stash','내일':'Tomorrow','준비 완료! 눌러서 개척':'Ready! Tap to open','모든 지층을 개척했어요. 이제 탑을 쌓아 별을 돌려보내요':'Every layer is open. Now build the tower and send the star home',
'황금 광맥이 발견됐어요!':'A golden vein was found!','캐러 가기 ▶':'Go dig ▶','크게!':'Critical!','창고가 가득 찼어요!':'Warehouse is full!','단서 발견!':'Clue found!',
'바위를 하나 깰 때 나오는 광석이에요. 이 지층 광석이 주로 나오고, 지금 필요한 위 지층 광석도 조금 섞여 나와요.':'What drops when you break one rock. Mostly ore of this layer, with a little ore from upper layers that you still need.',
'종류별로 골라서 창고에 저장하거나 바로 팔 수 있어요.':'Pick by type: store it in the warehouse or sell it right away.','저장':'Store','팔기':'Sell','모두 저장':'Store all','닫기':'Close',
'보관함이 비어 있어요. 드릴 로봇과 출입권이 모은 광석이 여기에 쌓여요.':'The stash is empty. Ore gathered by drill robots and passes piles up here.',
'창고가 가득 차서 옮길 수 없어요. 먼저 팔거나 재련해 보세요.':'The warehouse is full. Sell or smelt something first.','채굴 보관함이 비어 있어요.':'The mining stash is empty.',
'드릴 로봇을 켰어요. 켜 두면 자리를 비운 동안에도 캐요.':'Drill robot ON. While on, it keeps digging even when you are away.','드릴 로봇을 껐어요. 자리를 비운 동안에도 쉬어요.':'Drill robot OFF. It rests while you are away, too.',
'숯의 선물 상자':"Soot's Gift Box",'10분 동안 채굴 2배':'2× mining for 10 minutes','숯이 상자를 물어 왔어요':'Soot brought a box','숯이 꼬리를 흔들며 상자를 내려놓았다.':'Soot wags its tail and sets down a box.','오늘 남은 상자':'Boxes left today',
// 이야기 · 튜토리얼
'프롤로그':'Prologue','에필로그':'Epilogue','이장 할머니':'Granny Chief','다음':'Next','계속':'Continue','건너뛰기':'Skip','시작하기':'Begin',
'할아버지의 유산':"Grandpa's legacy",'낡은 곡괭이':'Old pickaxe','손에 익은 녹슨 곡괭이':'A rusty pickaxe, worn to the hand','채굴 기계':'Mining machine','느리게 도는 자동 드릴':'A slowly turning auto drill',
'좋아, 이제 [재련]을 눌러 보렴.':'Good, now press [Smelt].','[돌]을 두 번 눌러 재료 칸 두 개에 넣어 보렴.':'Tap [Stone] twice to put it in both material slots.',
'튜토리얼을 건너뛰었어요. 관리 → 설정에서 다시 볼 수 있어요.':'Tutorial skipped. You can replay it in Manage → Settings.','튜토리얼을 다시 시작해요.':'Restarting the tutorial.',
'광석을 발견했다!':'Ore discovered!','분류':'Type','평소 가격':'Base price','도감':'Codex','원석':'Raw ore','재련품':'Refined','찌꺼기':'Dregs','지금 팔면':'Sells now for','쓰이는 곳':'Used for',
'아직 찾지 못한 광물이에요. 더 깊이 파 내려가거나 새로운 조합을 시도해 보세요.':'A mineral you have not found yet. Dig deeper or try new combinations.',
'할아버지의 일지':"Grandpa's Journal",'99층':'Floor 99','하늘에 닿았다':'It reached the sky','탑 꼭대기에 천공의 용광로를 놓을 자리가 생겼다. 현자의 원석과 별의 파편이 있으면, 별을 돌려보낼 수 있다.':"There is now room at the top of the tower for the Sky Furnace. With the Philosopher's Stone and star shards, the star can be sent home.",
'기록':'Records','별빛골의 기록':'Records of Starlight Hollow','등불별이 다시 하늘에 걸렸다. 탑은 계속 쌓을 수 있다.':'The Lantern Star hangs in the sky again. You can keep building the tower.',
// 장비
'아직 돌아오지 않은 사람':'Someone who has not returned yet','가게 주인이 돌아오면 여기서 장비를 손볼 수 있어요.':'When the owner returns, you can upgrade your gear here.','최대':'MAX',
'혼자서도 바위를 깨는 작은 로봇을 들여요':'Bring in a little robot that breaks rock on its own','창고가 가득 차도 가장 싼 원석을 팔며 계속 캐요':'Keeps digging when the warehouse is full by selling the cheapest raw ore','창고가 가득 차면 가장 싼 원석을 팔아 자리를 만들어요':'When the warehouse is full, sells the cheapest raw ore to make room',
'소문의 진위를 알 수 없어요':'Cannot tell whether rumors are true','핀이 만들어 준 드릴 로봇이 일을 시작했어요.':'The drill robot Pin built has started working.',
// 재련
'자동 재련소':'Auto Smeltery','레시피를 맡겨 두면 시간이 지나며 알아서 재련해요. 자리를 비운 동안에도 계속돼요.':'Leave a recipe here and it smelts on its own over time, even while you are away.','용광로':'Furnace','가능한 만큼':'As many as possible','맡기기':'Queue',
'재료 고르기':'Choose materials','눌러서 빈 칸에 넣기':'tap to fill an empty slot','레시피 도감':'Recipe Codex','아래에서 고르기':'choose below','넣기':'Load','취소':'Cancel','잠김':'Locked',
'재료가 들어오는 대로 계속':'Keeps going as materials come in','재료 기다리는 중':'waiting for materials','빈 칸 · 재료를 넣고 [맡기기]를 누르거나, 레시피 도감에서 [맡기기]':'Empty · load materials and press [Queue], or press [Queue] in the Recipe Codex',
'더 깊은 곳의 비밀':'a secret from deeper down','창고가 비어 있어요. 채굴부터 해 보세요.':'The warehouse is empty. Go mine first.','불 조절에 실패했어요. 광재가 남았어요.':'The fire got away from you. Only slag is left.',
'재료 두 칸을 먼저 채워 주세요.':'Fill both material slots first.','이 조합은 아무것도 만들어지지 않아요.':'This combination makes nothing.','먼저 직접 한 번 재련해서 레시피를 알아내야 맡길 수 있어요.':'Smelt it once yourself to learn the recipe before queueing it.',
'자동 재련소 칸이 모두 찼어요. 장비 → 용광로에서 칸을 늘릴 수 있어요.':'All Auto Smeltery slots are in use. Add slots in Gear → Furnace.',
// 장터
'지층 출입권':'Layer Passes','광물 거래':'Mineral Trade','소문 게시판':'Rumor Board','파는 값 / 사는 값':'sell / buy','평소':'Normal','1장':'×1','사기':'Buy','판매':'Sell','구매':'Buy','판매하기':'Sell','구매하기':'Buy','절반':'Half','전부':'All','수량':'Quantity',
'출입권을 가지고 있으면 그 지층 광석이 조금씩 채굴 보관함에 들어와요. 소문이 사실로 밝혀지면 값이 크게 오르고, 헛소문이면 내려요.':'Hold a pass and ore from that layer trickles into your mining stash. If a rumor proves true the price jumps; if it is false, it drops.',
'아직 도는 소문이 없어요. 장터에 있다 보면 소문이 들려와요.':'No rumors going around yet. Hang around the market and you will hear some.','아직 기록 없음':'no record yet','정보원: 믿을 만해요':'Informant: seems reliable','정보원: 수상해요':'Informant: seems fishy',
'사실이었어요':'It was true','헛소문이었어요':'It was false','광물을 캐면 여기에 나와요.':'Minerals you dig up appear here.','수량을 입력해 주세요':'Enter a quantity','가진 게 없어요.':'You have none.','골드나 창고 자리가 모자라요.':'Not enough gold or warehouse space.',
'구리':'copper','주석':'tin','철광석':'iron','은':'silver','자수정':'amethyst','코발트':'cobalt','금':'gold','백금':'platinum','별빛':'starlight',
// 탑
'입주자와 구간':'Tenants & Sections','판매가 보너스':'Sale price bonus','한 층 쌓기':'Build a Floor','부족한 재료 장터에서 사기':'Buy missing materials at the market','5층마다 축하금 · 구간을 완공하면 새 입주자가 들어와요':'A gift every 5 floors · finish a section and a new tenant moves in',
'입주 예정: ???':'Moving in: ???','아직 비어 있는 구간':'A section still empty','입주 효과':'Tenant bonus','새로 열렸어요':'Newly opened','월세 받기':'Collect rent',
'천공의 용광로':'The Sky Furnace','하늘에 가장 가까운 용광로. 마지막 재련으로 별을 하늘로 돌려보낼 수 있어요.':'The furnace closest to the sky. One last smelting can send the star back to the heavens.','별을 돌려보내기':'Send the star home','현자의 원석 1개와 별의 파편 10개가 필요해요.':"You need 1 Philosopher's Stone and 10 Star Shards.",
'살 수 있는 재료가 없어요. 골드나 창고, 장터 물량을 확인해 보세요.':'Nothing could be bought. Check your gold, warehouse space, or market stock.','플레이 시간':'Play time','캔 광석':'Ore mined','레시피':'Recipes','발견한 레시피':'Recipes found','번 골드':'Gold earned','가장 큰 거래':'Biggest sale','입주자':'Tenants',
// 관리
'갱도':'Tunnels','설정':'Settings','재련품은 남기고 원석과 광재만 팔아요':'Sells raw ore and slag, keeps refined goods','원석 일괄 판매':'Sell all raw ore','작업 일지':'Work log','개척하고 내려갈 지층':'layers to open and descend','광물 도감':'Mineral Codex',
'창고가 비어 있어요.':'The warehouse is empty.','채굴 중':'Mining','가기':'Go','필요:':'Needs:','개척':'Open','더 깊은 곳':'Deeper down','아직 찾지 못한 장':'Page not found yet',
'개발자 코드':'Developer code','적용':'Apply','코드 입력':'Enter code','언어 · Language':'Language','효과음':'Sound effects','배경음악':'Music','튜토리얼 다시 보기':'Replay tutorial','진행 상황은 이 기기에 자동 저장돼요.':'Progress saves automatically on this device.','처음부터 다시':'Start over','정말요? 한 번 더':'Really? Tap again',
'광고 제거 패키지':'Ad-Free Pack','광고 없이 숯의 선물 상자와 2배 부스트를 바로 받아요':"Get Soot's gift boxes and the 2× boost instantly, with no ads",'자리를 비운 동안 쌓이는 보상 한도 2배':'Double the cap on rewards earned while away','숯이 고마워해요':'Soot is grateful','5,900원':'₩5,900','구매 완료':'Purchased','적용 중':'Active',
'광고':'Ad','광고 자리':'Ad space','프로토타입이라 실제 광고 대신 이 화면이 나와요':'This is a prototype, so this screen stands in for a real ad','그만두기':'Never mind','보상 받기':'Claim reward','광고 제거 패키지가 있으면 바로 받아요':'With the Ad-Free Pack you get it right away','끝!':'Done!',
'상점':'Shop','프로토타입이라 실제 결제는 되지 않아요. 구매한 것으로 처리할까요? 나중에 앱으로 출시하면 이 자리에 스토어 결제가 연결돼요.':'This is a prototype, so no real payment happens. Treat it as purchased? When the app launches, store billing will go here.','5,900원 구매한 것으로 처리':'Treat ₩5,900 as paid',
'광고 제거 패키지가 적용됐어요. 고마워요!':'The Ad-Free Pack is now active. Thank you!','알 수 없는 코드예요.':'Unknown code.','개발자 코드 칸이 열렸어요.':'Developer code field unlocked.',
'개발자 코드 적용: 지층 전부 해금 · 레시피 전부 · 모든 광물 9,999개 · 골드 무한 (탑은 그대로)':'Developer code applied: all layers open · all recipes · 9,999 of every mineral · infinite gold (tower unchanged)',
'적용됨: 골드 무한 · 레시피 전부 알고 있음. 탑은 열지 않았어요(직접 쌓아 입주자 · 가게가 열리는지 확인). 채굴 화면의 [DEV 광맥]으로 황금 광맥을 바로 부를 수 있어요.':'Applied: infinite gold · all recipes known. The tower was left as is (build it yourself to check tenants and shops). Use [DEV Vein] on the mining screen to summon a golden vein.',
'기기 시계가 예전보다 이르게 맞춰져 있어요. 그 시각이 지날 때까지 자리 비운 보상은 쌓이지 않아요.':"The device clock is set earlier than before. Away rewards won't build up until that time has passed.",
// 자리 비움
'다시 왔구나':'Welcome back','자리를 비운 사이 모인 것':'Gathered while you were away','입주자 월세':'Tenant rent','그 밖의 광석':'Other ore','드릴 로봇':'Drill Robot','스위치가 꺼져 있어 쉬었어요':'rested (switch was off)',
'월세는 탑 탭에서, 광석은 채굴 화면의 채굴 보관함에서 받을 수 있어요.':'Collect rent in the Tower tab and ore from the mining stash on the mining screen.','광석은 채굴 화면의 채굴 보관함에서 받을 수 있어요.':'Collect ore from the mining stash on the mining screen.','월세는 탑 탭에서,':'Collect rent in the Tower tab.',
'탑의 입주자들이 일했어요. 드릴 로봇은 꺼 둔 채라 쉬었어요.':'The tower tenants kept working. The drill robot was switched off, so it rested.','탑의 입주자들과 드릴 로봇이 쉬지 않고 일했어요.':'The tower tenants and the drill robot worked without a break.',
// 설명 속성
'굴 단면. 화면을 탭해서 암벽을 캐세요':'Tunnel cross-section. Tap the screen to dig the rock','한국어':'한국어','구매한 것으로 처리':'Treat as purchased','버그 제보':'Report a Bug','이상한 점을 적어 주세요. [메일로 보내기]를 누르면 메일 앱이 열리고, 기기 · 언어 · 진행 정보가 함께 붙어요.':'Tell us what went wrong. [Send by email] opens your mail app with device, language and progress info attached.','언제 · 어디서 · 무엇이 이상했는지':'When, where, and what went wrong','메일로 보내기':'Send by email','무엇이 이상했는지 먼저 적어 주세요.':'Please describe the problem first.','메일 앱에서 [보내기]를 누르면 제보가 전달돼요. 고마워요!':'Press Send in your mail app to deliver the report. Thank you!','받는 메일 주소가 아직 설정되지 않았어요.':'No recipient address is set yet.','아직 모르는 광물':'A mineral not yet known','자동 드릴':'Auto drill','채굴 보관함 열기':'Open the mining stash','재료 칸 1':'Material slot 1','재료 칸 2':'Material slot 2'
},f:{}};
{const F=LANGS.en.f,dur=s=>{const m=s.match(/(?:(\d+)시간 )?(\d+)분/);return m?(m[1]?m[1]+'h ':'')+m[2]+' min':s},
  RN=s=>{const D=LANGS.en.nm;for(const k in D)if(s.endsWith(' '+k))return D[k]+' the '+T(s.slice(0,-k.length-1));return T(s)},to=(b,u='%')=>b!==undefined?` → ${b}${u}`:'',pl=(n,w)=>n+' '+w+(+n===1?'':w.endsWith('s')?'es':'s');
  // 소문 말끝
  const END={'대요!':'—so I hear!','대요. 제 감은 틀린 적이 없거든요!':'—so I hear. My hunches are never wrong!','다는구먼.':", they say.",'다니께, 믿어 보슈.':", I tell ya. Take my word.",'다는 기록이 있어요.':', according to the records.','을 가능성이 높아요.':'—that seems quite likely.',
    '대요!! 진짜예요!':"!! It's true, really!",'대요! 제가 들었어요!':'! I heard it myself!','다더라!':', I heard!','다던데? 히끅.':', or so they say? *hic*','다던데… 글쎄.':', they say… who knows.','다는 소문이 있지.':', or so the rumor goes.','다':'.','':''};
  const STEM=[(n,L)=>`The vein near B${n} ${T(L)} has widened a little`,(n,L,o)=>`More ${T(o)} fragments are turning up in B${n} ${T(L)}`,(n,L,o)=>`A new ${T(o)} seam was found in B${n} ${T(L)}`,(n,L)=>`There is a hidden tunnel beneath B${n} ${T(L)}`,(n,L,o)=>`A great ${T(o)} lode sleeps deep in B${n} ${T(L)}`,(n,L,o)=>`A legendary heap of ${T(o)} came out of B${n} ${T(L)}`,
    (n,L)=>`The tunnels of B${n} ${T(L)} are flooding`,(n,L)=>`The vein in B${n} ${T(L)} is running dry`,(n,L)=>`The ceiling of B${n} ${T(L)} is weakening and the survey team may close it`];
  F.rum=(i,...g)=>{const e=g[g.length-1];return STEM[i](...g)+(END[e]!==undefined?END[e]:'.')};
  Object.assign(F,{
  toLayer:(a,b)=>`To open B${a} ${T(b)}`,openL:a=>`Open B${a} →`,tutHint:(a,b,c,d)=>`(${T(a)} ${b}/${c})`+(d?' If you run short of stone, dig a little more on the mining screen.':''),
  firstDug:(a,b,c)=>`${T(a)} First dug up in B${b} ${T(c)}.`,ofFloat:a=>`Overflow sold +${a}G`,plusItem:(a,b)=>`+${a} ${T(b)}`,newMineral:a=>`New mineral found: ${T(a)}`,journalN:a=>`Grandpa's Journal · ${a}/13`,
  boxTitle:(a,b)=>`${a} / ${b} slots`,freeWh:a=>`Free warehouse space: ${a}`,veinShow:a=>`A golden vein appeared! Dig for ${a} seconds and gold pours out.`,veinEnd:a=>`The golden vein went back to sleep. Gold dug this time: +${a}G`,secN:a=>a+'s',
  boxMoved:(a,b)=>`Moved ${a} ore from the mining stash to the warehouse.`+(b?` (The warehouse filled up, so ${b} stayed in the stash)`:''),boxSold:(a,b,c)=>`Sold ${b} ${T(a)} from the mining stash: +${c}G`,semSold:(a,b,c)=>`Sem sold ${b} ${T(a)} to make room: +${c}G`,
  opened:(a,b)=>`${T(a)} opened! (−${b}m)`,boostOn:a=>`Pickaxe and auto drill are 2× stronger for 10 minutes! (${a} left today)`,
  tenantIn:(a,b)=>`${T(a)} complete! ${RN(b)} moved into the tower.`,newTenant:a=>`${T(a)} complete · New tenant`,roleName:(a,b)=>RN(a+' '+b),rentH:a=>`Rent: ${a}G per hour`,
  floorGift:(a,b)=>`Floor ${a} complete! The villagers sent a gift: +${b}G`,secRange:(a,b,c)=>`${T(a)} (F${b}–${c})`,tenRent:(a,b)=>`Tenants ${a}/13 · Rent ${b}G/h`,collect:a=>'Collect rent'+(a?` ${a}G`:''),buildN:a=>`Build floor ${a}`,rangeF:(a,b)=>`F${a}–${b}`,
  building:(a,b)=>`Under construction (${a}%). Build up to floor ${b} and someone will move in.`,willCome:a=>`Build up to floor ${a} and someone will move in.`,rentPaid:a=>`The tenants paid ${a}G in rent.`,boughtMiss:(a,b)=>`Bought ${a} missing materials for ${b}G.`,builtN:a=>`Built ${pl(a,'floor')}!`,
  shopLock:a=>`Nobody is here yet. Build tower floor ${a} and the owner will return.`,plate:a=>`Tower F${a}`,floorN:a=>a+'F',
  pickD:(a,b,c)=>`${a} damage per tap`+(b?` · ${T(c)} at Lv.${b}`:''),critD:(a,b)=>`${a}% chance of 3× damage on tap`+to(b),extraD:(k,a,b)=>`${a}% chance of one extra when mining ${k==='금속 광석'?'metal ore':'raw gems'}`+to(b),
  capD:(a,b)=>`Capacity ${a} → ${b} slots`,safeD:(a,b)=>`Stores up to ${a} hours of rent`+to(b,' hours'),autoD:(a,b)=>`${pl(a,'robot')} · ${b} damage/sec`,boxD:(a,b)=>`Robots store ore here when the warehouse is full · ${a} → ${b} slots`,
  refD:(s,a,b)=>`Stash overflow is ${s?'smelted and ':''}sold at ${a}% of raw value`+to(b),nightD:(a,b)=>`Away rewards fill ${a}% faster`+to(b),intelD:a=>`Shows rumor reliability (${a}% accurate)`,hagD:(a,b)=>`Mineral sale price +${a}%`+(b!==undefined?` → +${b}%`:''),
  bulkD:(a,b)=>`Up to ${a} passes per layer`+to(b,''),furnD:(a,b)=>`Smelting success ${a}% · Great success ${b}%`,greatD:(a,b)=>`Great success chance +${a}%`+(b!==undefined?` → +${b}%`:''),qslotD:(a,b)=>`Auto-smelt ${pl(a,'recipe')} at once`+to(b,''),qspdD:(a,b)=>`${a}s per auto-smelt`+to(b,'s'),newPick:a=>`New pickaxe: ${T(a)}!`,
  matN:a=>`Material ${a}`,resUnk:(a,b)=>`Result: unknown · Success ${a}% · Great ${b}%`,succ:(a,b)=>`Success ${a}% · Great ${b}%`,rqInfo:(a,b,c)=>`${a}/${b} slots · ${c}s each`,codexN:(a,b)=>`Codex ${a}/${b}`,owned:a=>`Own ${a} · tap to remove`,
  newRecipe:(a,b,c)=>`New recipe found: ${T(a)} + ${T(b)} = ${T(c)}`,great2:(a,b)=>`Great success! ${T(a)} ×${b}`,expect:(a,b,c)=>`${T(a)} · materials ${b}G → expected ${c}G`,noReact:(a,b)=>`${T(a)} + ${T(b)}: no reaction. Only slag is left.`,recipeArrow:(a,b)=>`${T(a)} + ${T(b)} →`,
  smeltN:(a,b,c,d)=>`Smelted ${a}×: success ${b} · great ${c} · failed ${d}`,need2:a=>`You need 2 ${T(a)}.`,rqOpenAt:a=>`The Auto Smeltery opens when you build tower floor ${a}.`,rqAdd:(a,b)=>`Queued ${b} ${T(a)} at the Auto Smeltery.`,rqLoop:a=>`${T(a)} will keep being smelted as materials come in.`,
  rqAlready:a=>`${T(a)} is already being smelted continuously.`,rqMore:(a,b)=>`Queued ${b} more ${T(a)}.`,rqLocked:a=>`Opens when you build tower floor ${a} and the alchemist returns. Leave a recipe and it smelts on its own, even while you are away.`,rqLeft:a=>`${a} left`,done:a=>`${T(a)} made`,
  nextRumor:a=>`Next rumor in about ${dur(a)}`,perLayer:a=>`Up to ${a} per layer`,heldN:(a,b,c)=>`${a}/${b}`+(c?' · Return':''),passInc:a=>`Each pass brings in about ${a}G of ore per hour`,
  rumorLog:(a,b)=>`Rumor — ${NM(a)}: "${T(b)}"`,announce:(t,r,n,p)=>`Survey team: "${T(t)}." — ${r[0]==='사'?'It was true!':'It was a false rumor.'} B${n} pass ${p}%`,
  echo:(a,n)=>`${NM(a)} heard the same rumor, too: about B${n}`,srcRec:(a,b)=>`right ${b} of ${a} times so far`,sameSay:a=>'Same story: '+a.split(', ').map(NM).join(', '),clueN:(a,b)=>`B${a} clues: ${b}`,untilAnn:a=>`About ${dur(a)} until the survey team announces`,iHeld:a=>`I held ${a}`,
  passBought:(n,k,g)=>`Bought ${k} B${n} ${+k===1?'pass':'passes'} for ${g}G.`,passSold:(n,k,g,d)=>`Sold ${k} B${n} ${+k===1?'pass':'passes'} for ${g}G (${d}G).`,passVal:a=>`Passes held: ${a}G`,passB:a=>`B${a} pass`,
  clue1:(n,o)=>`Clue: ${T(o)} fragments glittered in the wall of B${n} (may be tied to a rumor)`,clue2:n=>`Clue: the floor of B${n} is unusually damp (may be tied to a rumor)`,
  qtySell:(a,b,c)=>`Sell ${a} · ${b}G (own ${c})`,qtyBuy:(a,b,c)=>`Buy ${a} · ${b}G (max ${c})`,soldRaw:a=>`Sold all raw ore: +${a}G`,bought:(a,b,c)=>`Bought ${b} ${T(a)} for ${c}G.`,sold:(a,b,c)=>`Sold ${b} ${T(a)}: +${c}G`,
  slots:(a,b)=>`${a}/${b}`,hm:(a,b)=>`${a}h ${b}m`,countN:a=>a,timesN:a=>a+'×',people:a=>a,
  madeFrom:(s,a,b)=>`${T(s)} Made from ${T(a)} + ${T(b)}.`,unkMake:s=>`${T(s)} You don't know how to make it yet.`,mineAt:(s,n,L)=>`${T(s)} Can be mined in B${n} ${T(L)}.`,
  jPrev:p=>{const j=typeof JOURNAL!=='undefined'&&JOURNAL.find(x=>x.startsWith(p));return j?'"'+T(j).slice(0,46)+'…"':'"'+p+'…"'},
  welBody:(a,b)=>T(a)+(b?" The rewards are full. Staying away longer won't add more.":''),ofSold:(a,s)=>`${a} overflow ore ${s?'smelted and ':''}sold`,autoMade:a=>`Auto-smelted ${T(a)}`,
  secDetail:a=>{if(a.endsWith(' 빈 구간'))return T(a.slice(0,-5))+' — empty section, details';const D=LANGS.en.nm;for(const k in D)if(a.endsWith(' '+k))return T(a.slice(0,-k.length-1))+' — '+D[k]+', details';return T(a)+', details'},
  reqItem:(a,b,c)=>`${T(a)} ${b}/${c}`,dotL:a=>'· '+T(a),dotR:a=>T(a)+' ·',layerB:(a,b)=>`B${a} ${T(b)}`})}
