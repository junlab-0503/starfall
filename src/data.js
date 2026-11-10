/* ═════════ 데이터 ═════════ */
const SECT={
  metal:{n:'금속',guild:'대장간 연합',who:'무쇠',c:'#a9bccb'},
  gem:{n:'보석',guild:'보석상 길드',who:'엘라',c:'#c79bf0'},
  fuel:{n:'연료·화학',guild:'연금술 공방',who:'미르',c:'#e7a94a'},
  build:{n:'건축·공예',guild:'석공 조합',who:'바우',c:'#c9ad86'},
  arcane:{n:'별의 물질',guild:'왕립 학회',who:'아르덴',c:'#ff8aa8'}
};
// sh: 아이콘 형태, h: 모암 색, L: 나오는 지층(원석)
const ITEMS={
  stone:{n:'돌',p:2,c:'#8f877b',s:'build',sh:'chunk',L:1},
  clay:{n:'점토',p:3,c:'#b8744a',s:'build',sh:'clay',L:1},
  copper:{n:'구리 광석',p:8,c:'#e0803d',s:'metal',sh:'ore',h:'#6f665c',L:1},
  kaolin:{n:'고령토',p:6,c:'#ece6da',s:'build',sh:'clay',L:2},
  tin:{n:'주석 광석',p:14,c:'#dfe4e6',s:'metal',sh:'ore',h:'#4f4a46',L:2},
  flint:{n:'부싯돌',p:10,c:'#55555f',s:'build',sh:'shard',L:2},
  iron:{n:'철광석',p:20,c:'#b3bdc7',s:'metal',sh:'ore',h:'#5b4a42',L:3},
  coal:{n:'석탄',p:12,c:'#3d3936',s:'fuel',sh:'coal',L:3},
  granite:{n:'화강암',p:16,c:'#c9ad9e',s:'build',sh:'speck',L:3},
  limestone:{n:'석회석',p:25,c:'#e8e2cc',s:'build',sh:'chunk',L:4},
  silver:{n:'은 광석',p:60,c:'#eef4fa',s:'metal',sh:'ore',h:'#55606b',L:4},
  calcite:{n:'방해석',p:40,c:'#f5e3bd',s:'gem',sh:'cube',L:4},
  quartz:{n:'석영',p:45,c:'#eeeae2',s:'gem',sh:'cluster',h:'#4a4652',L:5},
  amethyst:{n:'자수정 원석',p:90,c:'#9a64d6',s:'gem',sh:'cluster',h:'#3f3a48',L:5},
  halite:{n:'암염',p:30,c:'#f2c9c0',s:'fuel',sh:'cube',L:5},
  lapis:{n:'청금석',p:140,c:'#2f57c8',s:'gem',sh:'speck',L:6},
  cobalt:{n:'코발트 광석',p:120,c:'#4a7cf0',s:'metal',sh:'ore',h:'#3b3a44',L:6},
  fossil:{n:'조개 화석',p:100,c:'#dccaa6',s:'build',sh:'fossil',L:6},
  gold:{n:'금 광석',p:260,c:'#ffd23f',s:'metal',sh:'ore',h:'#5a4a3a',L:7},
  pyrite:{n:'황철석',p:90,c:'#d9b84a',s:'metal',sh:'cube',L:7},
  emerald:{n:'에메랄드 원석',p:320,c:'#2fc46e',s:'gem',sh:'cluster',h:'#3a4038',L:7},
  obsidian:{n:'흑요석',p:280,c:'#3e3058',s:'build',sh:'shard',L:8},
  sulfur:{n:'유황',p:180,c:'#ead63c',s:'fuel',sh:'lump',L:8},
  ruby:{n:'루비 원석',p:450,c:'#e02a48',s:'gem',sh:'cluster',h:'#3a2a2a',L:8},
  sapphire:{n:'사파이어 원석',p:650,c:'#2f66e0',s:'gem',sh:'cluster',h:'#30303c',L:9},
  platinum:{n:'백금 광석',p:800,c:'#e6edf0',s:'metal',sh:'ore',h:'#3e3a3a',L:9},
  basalt:{n:'현무암',p:260,c:'#4a4c52',s:'build',sh:'chunk',L:9},
  olivine:{n:'감람석',p:700,c:'#9ccf3c',s:'gem',sh:'lump',L:10},
  diamond:{n:'다이아몬드 원석',p:2000,c:'#e8f6ff',s:'gem',sh:'cluster',h:'#2a2a30',L:10},
  garnet:{n:'석류석 원석',p:900,c:'#a3243a',s:'gem',sh:'lump',L:10},
  voidstone:{n:'그믐돌',p:1500,c:'#4a62c8',s:'arcane',sh:'void',L:11},
  abysspearl:{n:'동굴 진주',p:3200,c:'#dce6f2',s:'gem',sh:'pearl',L:11},
  darkcrystal:{n:'흑수정',p:2200,c:'#5b34a0',s:'arcane',sh:'cluster',h:'#14121c',L:11},
  meteoriron:{n:'운철',p:3000,c:'#7a7f8a',s:'metal',sh:'meteor',L:12},
  stariron:{n:'별빛 광석',p:5000,c:'#bfe0f6',s:'metal',sh:'ore',h:'#1f2440',L:12},
  opal:{n:'오팔 원석',p:4200,c:'#eaf2ff',s:'gem',sh:'opal',L:12},
  starshard:{n:'별의 파편',p:15000,c:'#ffe9a8',s:'arcane',sh:'star',L:13},
  stardust:{n:'별가루',p:7000,c:'#fff3c4',s:'arcane',sh:'dust',L:13},
  starember:{n:'홍염석',p:11000,c:'#ffb35c',s:'arcane',sh:'ember',L:13},
  slag:{n:'광재',p:1,c:'#5b5149',s:'build',sh:'slag'},
  // 재련품
  brick:{n:'다듬은 돌',p:7,c:'#a69b8a',s:'build',sh:'block'},
  tile:{n:'벽돌',p:10,c:'#bd5a3a',s:'build',sh:'block'},
  wire:{n:'구리선',p:24,c:'#e0853f',s:'metal',sh:'wire'},
  bronze:{n:'청동',p:45,c:'#c0904a',s:'metal',sh:'ingot'},
  porcelain:{n:'백자',p:30,c:'#f4f1e8',s:'build',sh:'vase'},
  whetstone:{n:'숫돌',p:22,c:'#70707c',s:'build',sh:'slab'},
  steel:{n:'강철',p:60,c:'#bcc7d0',s:'metal',sh:'ingot'},
  coke:{n:'코크스',p:34,c:'#5c554f',s:'fuel',sh:'powder'},
  gear:{n:'톱니바퀴',p:130,c:'#d6aa52',s:'metal',sh:'gear'},
  pillar:{n:'돌기둥',p:55,c:'#cdb4a6',s:'build',sh:'pillar'},
  lime:{n:'생석회',p:95,c:'#f4f0e4',s:'fuel',sh:'powder'},
  silverbar:{n:'은괴',p:150,c:'#e9f0f5',s:'metal',sh:'ingot'},
  mortar:{n:'회반죽',p:130,c:'#ddd6c4',s:'build',sh:'jar'},
  lens:{n:'돋보기',p:120,c:'#f6ecd2',s:'gem',sh:'lens'},
  pquartz:{n:'맑은 석영',p:125,c:'#f6f3ee',s:'gem',sh:'cut'},
  resonant:{n:'울림 수정',p:260,c:'#c28cf4',s:'gem',sh:'cut'},
  glass:{n:'유리판',p:150,c:'#9ad7d6',s:'build',sh:'glass'},
  polish:{n:'연마 가루',p:120,c:'#ead9d0',s:'fuel',sh:'powder'},
  cutame:{n:'자수정',p:340,c:'#9a5ae0',s:'gem',sh:'cut'},
  ultramarine:{n:'군청 물감',p:420,c:'#2f57c8',s:'fuel',sh:'jar'},
  bluechina:{n:'청화백자',p:380,c:'#eef2fa',s:'build',sh:'vase',acc:'#2f57c8'},
  carving:{n:'화석 장신구',p:300,c:'#e4d2ad',s:'build',sh:'fossil'},
  goldbar:{n:'금괴',p:700,c:'#ffd23f',s:'metal',sh:'ingot'},
  goldwire:{n:'금실',p:900,c:'#ffd84d',s:'metal',sh:'wire'},
  cutemerald:{n:'에메랄드',p:800,c:'#2fc46e',s:'gem',sh:'cut'},
  powder:{n:'화약',p:420,c:'#57534d',s:'fuel',sh:'powder'},
  obsalloy:{n:'흑요강',p:520,c:'#7158a8',s:'metal',sh:'ingot'},
  cutruby:{n:'루비',p:1000,c:'#e42a4a',s:'gem',sh:'cut'},
  lavaglass:{n:'용암 유리',p:620,c:'#ff7a3d',s:'build',sh:'glass'},
  cutsapph:{n:'사파이어',p:1400,c:'#2f66e0',s:'gem',sh:'cut'},
  platbar:{n:'백금괴',p:1700,c:'#e6edf0',s:'metal',sh:'ingot'},
  basalttile:{n:'현무암 타일',p:700,c:'#4c4e55',s:'build',sh:'block'},
  crysteel:{n:'수정강',p:650,c:'#a2e2e8',s:'metal',sh:'ingot'},
  cutdiamond:{n:'다이아몬드',p:4200,c:'#eaf8ff',s:'gem',sh:'cut'},
  peridot:{n:'페리도트',p:1500,c:'#a3d63c',s:'gem',sh:'cut'},
  cutgarnet:{n:'석류석',p:1900,c:'#b0283f',s:'gem',sh:'cut'},
  drillbit:{n:'다이아 드릴날',p:3600,c:'#d2ecf7',s:'metal',sh:'drillbit'},
  charge:{n:'폭약',p:1100,c:'#b8432f',s:'fuel',sh:'charge'},
  engine:{n:'태엽 장치',p:1600,c:'#dbb45c',s:'metal',sh:'engine'},
  abysslamp:{n:'그믐 등불',p:5500,c:'#9fd8ff',s:'arcane',sh:'lantern'},
  moonstone:{n:'월장석',p:5000,c:'#c4d8ff',s:'gem',sh:'cut'},
  voidalloy:{n:'그믐강',p:4800,c:'#5d70cc',s:'metal',sh:'ingot'},
  shadowlens:{n:'흑수정 렌즈',p:4500,c:'#6b3fa8',s:'arcane',sh:'lens'},
  starsteel:{n:'별빛강',p:8000,c:'#d2e8ff',s:'metal',sh:'ingot'},
  meteorbar:{n:'운철괴',p:5200,c:'#80858f',s:'metal',sh:'ingot'},
  cutopal:{n:'오팔',p:7500,c:'#f0f4ff',s:'gem',sh:'opal'},
  starcore:{n:'별의 씨앗',p:9000,c:'#7cc8ff',s:'arcane',sh:'orb'},
  lavaheart:{n:'용암 구슬',p:3000,c:'#ff5a1f',s:'arcane',sh:'orb'},
  crown:{n:'황옥',p:6000,c:'#e8bb4a',s:'gem',sh:'crown'},
  starglass:{n:'별빛 유리',p:26000,c:'#fff1b8',s:'arcane',sh:'glass'},
  astralink:{n:'별빛 잉크',p:12000,c:'#c9b8ff',s:'arcane',sh:'jar'},
  emberheart:{n:'태양석',p:22000,c:'#ffb35c',s:'arcane',sh:'orb'},
  philo:{n:'현자의 원석',p:60000,c:'#ff3d6a',s:'arcane',sh:'orb'}
};
const ORDER=Object.keys(ITEMS);
const RECIPES=[
  ['stone','stone','brick','같은 돌 두 개를 꾹 눌러 보자'],
  ['clay','stone','tile','점토를 돌 위에 구워 보자'],
  ['copper','copper','wire','구리 광석 두 개를 길게 뽑아 보자'],
  ['copper','tin','bronze','붉은 금속과 흰 금속을 섞어 보자'],
  ['kaolin','clay','porcelain','하얀 흙과 붉은 흙'],
  ['flint','stone','whetstone','부싯돌을 돌에 갈아 보자'],
  ['iron','coal','steel','철을 석탄 불에 달궈 보자'],
  ['coal','coal','coke','석탄을 석탄으로 굽기'],
  ['bronze','iron','gear','청동과 철로 무언가 돌아가는 것을'],
  ['granite','brick','pillar','화강암과 다듬은 돌을 쌓아 보자'],
  ['limestone','coke','lime','석회석을 아주 뜨겁게'],
  ['silver','coke','silverbar','은 광석을 뜨거운 불로'],
  ['lime','clay','mortar','하얀 가루와 점토를 섞어'],
  ['calcite','whetstone','lens','투명한 돌을 숫돌에 갈아'],
  ['quartz','quartz','pquartz','석영 두 개, 같은 것끼리'],
  ['quartz','amethyst','resonant','결정층의 두 보석이 함께 울린다'],
  ['quartz','coke','glass','투명한 결정을 녹여 보자'],
  ['halite','quartz','polish','소금과 석영을 곱게 갈아'],
  ['amethyst','polish','cutame','보랏빛 원석을 연마 가루로'],
  ['lapis','polish','ultramarine','푸른 돌을 곱게 갈면'],
  ['cobalt','porcelain','bluechina','푸른 금속으로 백자에 그림을'],
  ['fossil','whetstone','carving','오래된 조개를 정성껏 다듬어'],
  ['gold','coke','goldbar','금 광석을 뜨거운 불로'],
  ['goldbar','wire','goldwire','금괴와 구리선을 함께 뽑아'],
  ['emerald','polish','cutemerald','초록 원석을 연마 가루로'],
  ['sulfur','coke','powder','노란 돌과 구운 연료'],
  ['obsidian','steel','obsalloy','화산 유리와 단단한 합금'],
  ['ruby','polish','cutruby','붉은 원석을 연마 가루로'],
  ['obsidian','glass','lavaglass','화산 유리와 만든 유리'],
  ['sapphire','polish','cutsapph','푸른 원석을 연마 가루로'],
  ['platinum','coke','platbar','백금 광석을 뜨거운 불로'],
  ['basalt','mortar','basalttile','검은 돌을 회반죽으로 붙여'],
  ['steel','resonant','crysteel','강철에 울림 수정을'],
  ['diamond','polish','cutdiamond','가장 단단한 원석을 연마 가루로'],
  ['olivine','polish','peridot','올리브빛 돌을 연마 가루로'],
  ['garnet','polish','cutgarnet','석류빛 돌을 연마 가루로'],
  ['diamond','steel','drillbit','가장 단단한 돌을 강철 끝에'],
  ['powder','steel','charge','화약을 강철 통에 담아'],
  ['gear','crysteel','engine','톱니바퀴와 수정강을 맞물려'],
  ['abysspearl','lavaglass','abysslamp','동굴 진주를 용암 유리에 담아'],
  ['abysspearl','resonant','moonstone','동굴 진주와 울림 수정'],
  ['voidstone','platbar','voidalloy','그믐돌을 백금에 녹여'],
  ['darkcrystal','lens','shadowlens','어두운 수정을 렌즈로'],
  ['stariron','steel','starsteel','하늘의 쇠와 땅의 강철'],
  ['meteoriron','coke','meteorbar','떨어진 쇳덩이를 녹여'],
  ['opal','polish','cutopal','무지갯빛 돌을 연마 가루로'],
  ['voidstone','stariron','starcore','그믐돌과 별빛 광석이 만나면'],
  ['obsalloy','resonant','lavaheart','흑요강과 울림 수정'],
  ['cutruby','cutsapph','crown','붉은 보석과 푸른 보석'],
  ['starshard','lavaglass','starglass','별의 파편을 용암 유리에'],
  ['stardust','ultramarine','astralink','별가루를 군청 물감에'],
  ['starember','lavaheart','emberheart','홍염석을 용암 구슬에'],
  ['starcore','emberheart','philo','별의 씨앗과 태양석']
].map(([a,b,out,hint])=>({a,b,out,hint}));
const key=(a,b)=>[a,b].sort().join('+');
const RMAP={};RECIPES.forEach((r,i)=>RMAP[key(r.a,r.b)]=i);
const OUTS={},INS={};
ORDER.forEach(id=>{OUTS[id]=[];INS[id]=null});
RECIPES.forEach(r=>{[r.a,r.b].forEach(x=>{if(!OUTS[x].includes(r.out))OUTS[x].push(r.out)});INS[r.out]=[r.a,r.b]});
// 재련품의 지층 = 재료 지층 중 가장 깊은 것
function itemLayer(id){const it=ITEMS[id];if(it.L)return it.L;if(it._L)return it._L;if(!INS[id])return 1;return it._L=Math.max(itemLayer(INS[id][0]),itemLayer(INS[id][1]))}
ORDER.forEach(id=>{ITEMS[id].cr=!!INS[id];itemLayer(id)});
RECIPES.forEach(r=>r.L=itemLayer(r.out));

const LAYERS=[
  {n:'표토층',d:12,hp:5,drops:[['stone',55],['clay',27],['copper',18]],req:null},
  {n:'점토 퇴적층',d:60,hp:12,drops:[['kaolin',38],['flint',32],['tin',22],['copper',8]],req:{g:250,items:{wire:2}}},
  {n:'암반층',d:140,hp:25,drops:[['coal',36],['iron',32],['granite',24],['tin',8]],req:{g:1500,items:{bronze:3,porcelain:2}}},
  {n:'석회 동굴',d:300,hp:45,drops:[['limestone',40],['calcite',32],['silver',20],['coal',8]],req:{g:6000,items:{steel:4,gear:2}}},
  {n:'결정층',d:620,hp:80,drops:[['quartz',42],['halite',26],['amethyst',22],['silver',10]],req:{g:20000,items:{silverbar:3,lime:3}}},
  {n:'지하 수맥',d:1000,hp:130,drops:[['fossil',36],['cobalt',32],['lapis',22],['quartz',10]],req:{g:60000,items:{resonant:3,glass:4}}},
  {n:'금맥층',d:1400,hp:210,drops:[['pyrite',38],['gold',30],['emerald',20],['cobalt',12]],req:{g:160000,items:{bluechina:3,ultramarine:2}}},
  {n:'용암층',d:1900,hp:330,drops:[['obsidian',38],['sulfur',34],['ruby',18],['gold',10]],req:{g:420000,items:{goldbar:3,cutemerald:2}}},
  {n:'화산 유리층',d:2800,hp:520,drops:[['basalt',40],['platinum',28],['sapphire',20],['obsidian',12]],req:{g:1.1e6,items:{obsalloy:3,powder:4}}},
  {n:'맨틀 상층',d:4000,hp:800,drops:[['olivine',38],['garnet',30],['diamond',16],['platinum',16]],req:{g:2.8e6,items:{platbar:3,crysteel:3}}},
  {n:'심연층',d:5400,hp:1250,drops:[['voidstone',40],['darkcrystal',30],['abysspearl',16],['diamond',14]],req:{g:7e6,items:{cutdiamond:2,engine:2}}},
  {n:'별의 무덤',d:7500,hp:1900,drops:[['meteoriron',40],['opal',28],['stariron',20],['voidstone',12]],req:{g:1.8e7,items:{moonstone:2,voidalloy:3}}},
  {n:'별의 심장',d:9999,hp:3000,drops:[['stardust',40],['starember',30],['starshard',18],['stariron',12]],req:{g:4.5e7,items:{starcore:2,starsteel:3}}}
];
// 지층 색 (암벽, 굴 안쪽, 지층 띠, 어둠, 장식)
const LOOK=[
  {rock:'#7b6247',dark:'#3a2a1c',spec:['#937a5a','#5c4733'],band:'#c9a578',dim:.15,deco:'grass'},
  {rock:'#9a6e52',dark:'#432c1f',spec:['#b38663','#74503a'],band:'#e8d8c0',dim:.22,deco:'shards'},
  {rock:'#5d5961',dark:'#25232a',spec:['#77727b','#45414a'],band:'#a9a3b0',dim:.32,deco:'none'},
  {rock:'#8c8a7a',dark:'#2e2d26',spec:['#a8a690','#6c6a5c'],band:'#efe9d2',dim:.38,deco:'stalactite'},
  {rock:'#454a6a',dark:'#191b2c',spec:['#5d6390','#333851'],band:'#8f97d8',dim:.42,deco:'crystal'},
  {rock:'#34506a',dark:'#13202c',spec:['#456a8a','#26394c'],band:'#7fc4e8',dim:.46,deco:'drip'},
  {rock:'#5e4c34',dark:'#241c12',spec:['#7a6444','#45371f'],band:'#ffd23f',dim:.48,deco:'goldspeck'},
  {rock:'#4b2b24',dark:'#1c0d0a',spec:['#683d31','#381e19'],band:'#ff7a3d',dim:.45,deco:'lava'},
  {rock:'#2e3036',dark:'#111216',spec:['#40434b','#202227'],band:'#9fd0ff',dim:.52,deco:'glass'},
  {rock:'#3d2f2a',dark:'#160f0c',spec:['#55413a','#2a1f1b'],band:'#9ccf3c',dim:.56,deco:'diamond'},
  {rock:'#1f2440',dark:'#080a16',spec:['#2e365e','#141a30'],band:'#7b8cff',dim:.66,deco:'void'},
  {rock:'#2a2a38',dark:'#0c0c14',spec:['#3c3c52','#1c1c28'],band:'#bfe0f6',dim:.62,deco:'meteor'},
  {rock:'#3a3046',dark:'#120e18',spec:['#544466','#261e2e'],band:'#ffe9a8',dim:.5,deco:'star'}
];

// 탑 13구간 + 무한. mats: [재료, 기본 수량]
const SECTIONS=[
  {n:'흙벽 기초',to:3,g:4,mats:[['stone',30],['clay',20]],t:{name:'바우',art:'bau',d:'별빛골에서 가장 오래 곡괭이를 잡은 광부. 무뚝뚝해 보여도 정이 많다.',says:["곡괭이는 힘으로 휘두르는 게 아니여. 바위 결을 읽는 거지.", "영감님도 꼭 그 자리에서 땀을 닦았구먼. 쉬엄쉬엄 혀.", "깊이 내려갈수록 바위가 고집이 세지니께, 연장부터 챙기는 거여."],role:'광부 반장',bonus:'탭 위력 +10%',line:'제련소에 불이 켜졌다길래 와 봤수다. 영감님 손주라고? …눈매가 꼭 닮았구먼.',hair:'#3a2a1e',hat:'helmet',coat:'#7a5a3a'}},
  {n:'석조 기단',to:6,g:25,mats:[['brick',20],['tile',20],['wire',10]],t:{name:'셈',art:'sem',d:'광석 한 알도 허투루 두지 않는 깐깐한 창고지기 아가씨. 장부는 늘 머릿속에 있다.',says:["창고가 차면 팔든지 늘리든지 해야지. 바닥에 굴리는 건 안 돼.", "어제 들어온 게 몇 개인지 난 다 알아. 장부 볼 필요도 없지.", "할아버지는 정리를 영 못 하셨는데, 넌 좀 낫구나."],role:'창고지기',bonus:'창고 용량 +50%',line:'광석이 바닥에 굴러다니는 꼴은 못 봐. 오늘부터 창고는 내가 맡지.',hair:'#6a4232',hat:'scarf',hatC:'#efe4cc',coat:'#8a5a3a'}},
  {n:'청동 회랑',to:10,g:160,mats:[['bronze',20],['porcelain',10],['whetstone',20]],t:{name:'핀',d:'고장 난 건 뭐든 뜯어보는 꼬마 기계공. 드릴 로봇이 제일 친한 친구다.',says:["드릴 로봇 소리 들었어요? 오늘은 기분이 좋은가 봐요!", "나사 하나만 더 조이면 더 빨라질 것 같은데… 해 봐도 돼요?", "커서 할아버지 같은 광부 할 거예요. 아니, 기계공! 둘 다요!"],role:'꼬마 기계공',bonus:'자동 드릴 +25%',line:'우와, 저 드릴 로봇 제가 고쳐도 돼요? 훨씬 빨라지게 할 수 있어요!',hair:'#e0853f',hat:'goggles',coat:'#4d7a9a'}},
  {n:'강철 골조',to:15,g:800,mats:[['steel',20],['gear',10],['pillar',10]],t:{name:'무쇠',d:'별빛골 대장간의 주인. 허허 웃으며 하루 종일 쇠를 두드린다.',says:["허허, 쇠는 두드릴수록 정직해지는 법이오.", "재련에 실패했다고 기죽지 마시오. 대장간 망치도 처음엔 다 헛손질이었소!", "영감님 망치가 아직 대장간 벽에 걸려 있소. 언제든 와서 보구려."],role:'대장장이',bonus:'재련 성공률 +5% · 금속 판매가 +10%',line:'별빛골 강철 소리가 다시 들리는군. 연합 녀석들도 곧 돌아올 거요.',hair:'#2a2a2a',hat:'beard',coat:'#8a3a2a'}},
  {n:'은빛 온실',to:21,g:3000,mats:[['silverbar',10],['lime',20],['mortar',10],['lens',10]],t:{name:'루카',d:'여러 마을을 떠도는 상인. 값이 오르내리는 냄새를 누구보다 먼저 맡는다.',says:["싸게 사서 비싸게 판다! 말은 쉽죠? 타이밍이 전부예요.", "상단이 오면 값이 확 떨어져요. 그때가 살 때고요!", "이 마을엔 제가 다시 짐을 풀 이유가 생겼어요. 당신 덕분에요!"],role:'떠돌이 상인',bonus:'판매가 +5%',line:'냄새가 나요, 돈 냄새! 이 마을 다시 뜹니다. 제 감은 틀린 적이 없거든요.',hair:'#8a5a2a',hat:'cap',coat:'#3f8a5a'}},
  {n:'수정 첨탑',to:28,g:9000,mats:[['resonant',10],['glass',20],['cutame',10],['pquartz',10]],t:{name:'엘라',d:'40년 동안 수정을 닦아 온 보석상. 빛만 보고도 원석의 결을 안다.',says:["좋은 보석은 서두르지 않아요. 제값을 알아보는 사람을 기다리죠.", "이 빛 좀 보세요. 깎기 전부터 이미 웃고 있잖아요.", "할아버지께서 처음 가져오신 수정, 아직도 제 진열장에 있어요."],role:'보석상',bonus:'광물 사는 값 할인 · 보석 판매가 +10%',line:'수정이 다시 빛난다는 소문… 사실이었네요. 40년 만이에요.',hair:'#f0d8a0',hat:'hairpin',coat:'#9a5ae0'}},
  {n:'청화 회랑',to:35,g:25000,mats:[['bluechina',10],['ultramarine',10],['carving',10]],t:{name:'서린',d:'할아버지와 오래 편지를 주고받던 지질학자. 지층 이야기만 나오면 눈이 반짝인다.',says:["지층은 책 같아요. 한 장씩 넘길 때마다 다른 시대가 나오죠.", "희귀한 광물은 바위가 오래 버틴 흔적이에요. 소중히 다뤄 주세요.", "편지에 이런 문장이 있었어요. \"깊은 곳일수록 별이 가깝다.\""],role:'지질학자',bonus:'희귀 광물 확률 +20%',line:'당신 할아버지와 편지를 주고받았어요. 마지막 편지에 이 깊이가 적혀 있었죠.',hair:'#2a1e1a',hat:'glasses',coat:'#5a7a6a'}},
  {n:'황금 전당',to:43,g:60000,mats:[['goldbar',10],['goldwire',10],['cutemerald',10],['pyrite',30]],t:{name:'하멜 경',d:'왕실에서 보낸 대리인. 격식을 차리지만 별빛골의 보석에는 진심이다.',says:["왕실은 좋은 물건에 값을 아끼지 않습니다. 품질만 보증된다면요.", "이 마을의 금빛은 수도에서도 소문이 자자합니다.", "실례지만, 그 보석은 아직 팔지 않으셨겠지요?"],role:'왕실 대리인',bonus:'판매가 +10%',line:'왕실은 별빛골의 부활을 주시하고 있습니다. 왕관에 박을 보석이 필요하거든요.',hair:'#b0b0b0',hat:'tophat',coat:'#2a3a7a'}},
  {n:'용암 성소',to:52,g:150000,mats:[['powder',10],['obsalloy',10],['lavaglass',10],['cutruby',10]],t:{name:'도담',d:'바위를 보면 일단 터뜨리고 보는 발파꾼. 웃음소리가 폭음보다 크다.',says:["쾅! 하고 나면 속이 다 시원하죠. 바위도 그럴걸요?", "안전 거리는 열 걸음! 아니, 스무 걸음이요. 하하!", "단단한 바위일수록 터질 때 소리가 예뻐요."],role:'발파꾼',bonus:'바위 강도 −15%',line:'단단한 바위? 그런 건 없어요. 화약이 부족할 뿐이죠!',hair:'#c0402a',hat:'bandana',coat:'#6a5a3a'}},
  {n:'백금 기관실',to:62,g:380000,mats:[['platbar',10],['crysteel',10],['basalttile',20],['cutsapph',10]],t:{name:'강철',d:'말수는 적고 손은 빠른 기관사. 기계 소리만 듣고도 고장 난 곳을 찾는다.',says:["소리가 고르면 기계도 편한 거다. 지금은… 괜찮군.", "기름칠은 미루지 마라. 기계는 서운한 걸 기억하거든.", "꼬마 핀이 또 뭘 뜯었더군. 제법이야."],role:'기관사',bonus:'자동 드릴 +50%',line:'드릴 소리가 엉망이야. 내가 손봐 주지.',hair:'#4a4a4a',hat:'goggles',coat:'#3a4a5a'}},
  {n:'다이아 전망대',to:75,g:900000,mats:[['cutdiamond',10],['engine',10],['charge',10],['peridot',10],['cutgarnet',10],['drillbit',10]],t:{name:'미르',d:'말끝을 흐리는 조용한 연금술사. 재련품에 섞인 별의 기운을 느낄 수 있다.',says:["…섞이는 순간이 제일 아름다워요. 둘이 하나가 되는 순간.", "실패도 기록해 두세요. …다음 성공의 재료니까요.", "이 냄새… 별의 기운이 조금씩 짙어지고 있어요."],role:'연금술사',bonus:'대성공 +5% · 연료·화학 판매가 +10%',line:'당신이 만든 재련품, 흥미롭군요. 별의 기운이 섞여 있어요.',hair:'#e8e8f0',hat:'hood',coat:'#4a3a6a'}},
  {n:'달빛 첨탑',to:88,g:2200000,mats:[['moonstone',10],['abysslamp',10],['voidalloy',10],['shadowlens',10]],t:{name:'노을',d:'밤하늘을 읽는 점성술사. 떠도는 소문 중 무엇이 참인지 별에게 묻는다.',says:["오늘 밤 별들이 조금 수다스러워요. 좋은 소식이 오려나 봐요.", "소문은 바람 같아요. 별은 그중에 진짜를 알려 주죠.", "빈자리가 점점 따뜻해지고 있어요. 등불별이 돌아올 준비를 하나 봐요."],role:'점성술사',bonus:'소문 감정이 거의 틀리지 않음',line:'등불별이 있던 자리가 비어 있어요. 하지만 하늘은 아직 그 자리를 기억해요.',hair:'#e88a5a',hat:'wizard',coat:'#2a2a5a'}},
  {n:'별의 첨탑',to:99,g:5000000,mats:[['starsteel',10],['meteorbar',10],['cutopal',10],['starcore',10]],t:{name:'아르덴 교수',d:'왕립 학회를 이끄는 노학자. 떨어진 별을 되돌린다는 이야기를 직접 보러 왔다.',says:["학문이란 미친 소리를 끝까지 확인해 보는 일이라네.", "별의 파편이 열 개라… 계산은 맞소. 남은 건 용기뿐이지.", "자네 할아버지의 일지, 학회 서고에 꽂아 두고 싶을 정도라네."],role:'왕립 학회장',bonus:'모든 보너스 +10% · 별의 물질 판매가 +10%',line:'떨어진 별을 다시 올려 보내겠다니. 미친 소리지만… 나는 그걸 보러 왔소.',hair:'#f0f0f0',hat:'beard',coat:'#5a2a3a'}}
];
SECTIONS.forEach((s,i)=>s.from=i?SECTIONS[i-1].to+1:1);
const SKY={n:'하늘 너머',g:1.2e7,mats:[['crown',10],['starglass',10],['astralink',10],['emberheart',10]]};

// 이야기
const JOURNAL=[
  '별이 떨어진 자리의 흙은 40년이 지나도 미지근하다. 사람들은 온천수 탓이라지만, 나는 안다.',
  '점토 속에서 옛 그릇 조각이 나왔다. 등불별을 그려 넣은 그릇이다. 이 마을은 별과 함께 살았다.',
  '곡괭이가 무뎌졌다. 바위가 단단한 게 아니라 내가 늙은 거겠지. 그래도 내려간다.',
  '동굴에서 하룻밤 묵었다. 물방울 소리를 듣다 잠들었는데, 꿈에서 별이 숨 쉬는 소리를 들었다.',
  '수정이 빛난다! 희미하지만 분명하다. 별빛이 땅속까지 스며든 거다. 내가 틀리지 않았다.',
  '땅속 강물이 별빛을 머금고 흐른다. 이 물이 마을 우물로 이어진다면, 언젠가 마을도 다시 빛날까.',
  '옛 광부들이 꿈꾸던 금맥이다. 젊었을 때라면 춤을 췄겠지. 지금 내가 찾는 건 금이 아니다.',
  '땅이 뜨겁다. 별의 열기다. 이렇게 뜨거운 걸 보니, 별은 아직 살아 있다.',
  '녹았다 굳은 유리 속에 별빛이 갇혀 있다. 별이 떨어지던 그 밤의 빛이 그대로 멈춰 있다.',
  '맥박이 느껴진다. 아주 느리고 약하다. 서두르지 않으면 늦을지도 모른다.',
  '빛도 소리도 없는 곳. 혼자라는 게 이렇게 무거운 줄 몰랐다. 손주 녀석 얼굴이 보고 싶다.',
  '별은 떨어지며 부서졌다. 조각들을 모아야 한다. 하지만 이 늙은 몸으로는 위로 가져갈 수가 없다.',
  '드디어 찾았다. 별은 잠들어 있다. 나는 아래로 가는 법은 알았지만, 위로 쌓는 법은 몰랐다. 그러니 여기 곡괭이를 두고 간다. 이 일지를 따라온 네가 길을 쌓아 다오. 별을 집으로 보내 다오.'
];
const LAYER_EVENT={
  3:'바위에 오래된 곡괭이 자국이 남아 있다. 할아버지의 것이다.',
  4:'동굴 구석에 식은 모닥불 자국이 있다. 할아버지가 쉬어 가던 자리다.',
  5:'처음으로, 스스로 빛나는 수정을 캐냈다. 이 소식은 금세 마을 밖으로 퍼질 것이다.',
  8:'연금술사 미르가 말했다. "이건 땅의 열이 아니에요. 별의 열이에요."',
  10:'땅속 깊은 곳에서 맥박 같은 진동이 느껴진다. 숯이 갱도 입구를 떠나지 않는다.',
  12:'별에서 떨어져 나온 쇳덩이들이 흩어져 있다. 별은 떨어지며 부서진 것이다.',
  13:'−9,999m. 거대한 별이 잠들어 있다. 그 옆 바위에 낡은 곡괭이 하나가 기대어 있다.'
};
const PROLOGUE=[
  {t:'한 통의 편지',b:'"할아버지의 제련소가 이번 겨울에 철거된단다. 가져갈 물건이 있으면 와서 챙겨 가거라." — 별빛골 이장'},
  {t:'별빛골',b:'40년 전 겨울밤, 마을을 비추던 등불별이 떨어졌다. 그날 이후 광물은 빛을 잃었고, 길드는 떠났다. 이제 이곳은 잿빛 폐광촌이다.'},
  {t:'식은 용광로',b:'녹슨 곡괭이 하나, 식은 용광로 하나. 그리고 책상 서랍 속 낡은 일지. 검은 고양이 한 마리가 용광로 옆에서 나를 바라본다. 할아버지의 고양이, 숯이다.'},
  {t:'일지 첫 장',b:'"이 일지를 읽는 사람이 내 손주이기를 바란다. 별은 죽지 않았다. 아래로 내려가 조각을 모아라. 그리고 하늘로 가는 길을 쌓아라. 나는 아래로 가는 법은 알았지만, 위로 쌓는 법은 몰랐다."'}
];
const ENDING=[
  {t:'천공의 용광로',b:'99층 꼭대기, 하늘에 가장 가까운 용광로에 불이 들어온다. 마을 사람들과 탑의 입주자 열세 명이 모두 광장에 모였다.'},
  {t:'할아버지의 곡괭이',b:'별의 심장에서 가져온 낡은 곡괭이를 용광로 옆에 걸었다. 손잡이가 아직 따뜻하다.'},
  {t:'마지막 재련',b:'현자의 원석과 별의 파편을 용광로에 넣는다. 땅속 깊은 곳에서 빛이 솟아오른다. 갱도를 지나, 광장의 구멍을 지나, 탑을 따라 한 층 한 층.'},
  {t:'별이 돌아가다',b:'아흔아홉 개의 층이 차례로 빛나고, 탑 꼭대기에서 별이 하늘로 떠오른다. 40년 전 그 자리에, 등불별이 다시 걸린다.'},
  {t:'별빛골',b:'별빛이 마을에 내려앉는다. 광장의 돌도, 집집의 그릇도, 창고의 광석도 모두 은은하게 빛나기 시작한다.'},
  {t:'이장 할머니',b:'"…그 영감, 결국 해냈구먼. 손주 손을 빌려서."'},
  {t:'마지막 일지',b:'"할아버지, 길을 다 쌓았어요. 별은 집에 돌아갔어요."'}
];
const PICK_TIERS=[[1,'녹슨 곡괭이','#8a6a4a','dust'],[6,'철 곡괭이','#b3bdc7','spark'],[12,'강철 곡괭이','#d8e2ea','spark2'],[20,'수정 곡괭이','#c28cf4','trail'],[30,'용암 곡괭이','#ff7a3d','ember'],[42,'별빛 곡괭이','#bfe0f6','star']];
const SEASONS=[{n:'봄',d:{gem:1.15,build:1.05}},{n:'여름',d:{build:1.2,fuel:.9}},{n:'가을',d:{metal:1.15,fuel:1.05}},{n:'겨울',d:{fuel:1.3,build:.85}}];

/* 밸런스: 자동 플레이 봇으로 맞춘 값 (applyBal로 적용) */
let BAL={"hp":[4.074,24.76,83.92,180,274.6,398.7,505.8,720,988.7,1383,2186,2930,3630],"unlock":[0,568.6,2923,15070,133100,234400,861700,2114000,3785000,11260000,30740000,54460000,127500000],"tg":[864.8,3823,9987,23930,54780,105100,219200,366900,671600,1255000,1655000,3642000,9265000],"tgrow":1.16,"mgrow":1.12,"sky":23160000,"pick":[20,1.6],"auto":[100,1.75],"autoEff":0.6,"furn":[300,2.6],"wh":[100,2.6],"intel":[800,12000,150000],"rent":4,"box":[200,1.6],"pass":{"k":3000,"g":1,"max":30,"pay":15},"ups":{"crit":[400,2.1],"metal":[600,2.3],"gem":[900,2.3],"box":[150,2.2],"refiner":[3000,4.5],"night":[1500,3.2],"great":[2000,3],"qslot":[2500,7],"qspeed":[800,2.2],"autosell":[5000,1],"safe":[4000,4],"haggle":[500,2],"bulk":[2000,3]}};
function applyBal(){LAYERS.forEach((L,i)=>{L.hp=BAL.hp[i];if(L.req)L.req.g=BAL.unlock[i]});SECTIONS.forEach((s,i)=>s.g=BAL.tg[i]);SKY.g=BAL.sky}
applyBal();
