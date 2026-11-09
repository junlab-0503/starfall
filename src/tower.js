/* ═════════ 탑 ═════════ */
function secOf(f){for(let i=0;i<SECTIONS.length;i++)if(f<=SECTIONS[i].to)return i;return -1}
function floorCost(f){const i=secOf(f),s=i>=0?SECTIONS[i]:SKY,from=i>=0?s.from:100,k=f-from;
  return{gold:Math.round(s.g*Math.pow(BAL.tgrow,k)),mats:s.mats.map(([id,q])=>[id,Math.ceil(q*Math.pow(BAL.mgrow,k))]),sec:i}}
const canBuild=c=>S.gold>=c.gold&&c.mats.every(([id,q])=>cnt(id)>=q);
const towerBlocked=()=>S.floors>=99&&!S.ended;
const rentPerSec=()=>SECTIONS.reduce((s,x)=>s+(S.floors>=x.to?x.g*BAL.rent/3600:0),0);
function buildFloor(quiet){if(towerBlocked())return false;const f=S.floors+1,c=floorCost(f);if(!canBuild(c))return false;
  S.gold-=c.gold;c.mats.forEach(([id,q])=>add(id,-q));S.floors=f;
  if(f%5===0){const gift=c.gold*3;S.gold+=gift;log(`${f}층 완공 기념! 마을 사람들이 축하금을 보냈어요: +${big(gift)}G`,!quiet)}
  const sec=SECTIONS.findIndex(s=>s.to===f);
  if(sec>=0){refreshBonus();const t=SECTIONS[sec].t;log(`${SECTIONS[sec].n} 완공! ${t.role} ${J(t.name,'이가')} 탑에 들어왔어요.`);
    story([{k:`${SECTIONS[sec].n} 완공 · 새 입주자`,t:`${t.role} ${t.name}`,b:`"${t.line}"`,portrait:t,extra:`<div class="say"><span class="who">입주 효과</span> ${t.bonus}<br><span class="dim">월세 시간당 ${big(SECTIONS[sec].g*BAL.rent)}G</span></div>`}])}
  if(f===99)story([{k:'99층',t:'하늘에 닿았다',b:'탑 꼭대기에 천공의 용광로를 놓을 자리가 생겼다. 현자의 원석과 별의 파편이 있으면, 별을 돌려보낼 수 있다.'}]);
  return true}
function buildMax(){let n=0;while(n<200&&buildFloor(true))n++;if(n)toast(`${n}층을 쌓았어요!`);renderAll()}
function buyMissing(){const c=floorCost(S.floors+1);let spent=0,got=0;c.mats.forEach(([id,q])=>{const m=q-cnt(id);if(m>0){const r=buy(id,m);spent+=r.t;got+=r.k}});
  toast(got?`부족한 재료 ${got}개를 ${big(spent)}G에 샀어요.`:'살 수 있는 재료가 없어요. 골드나 창고, 장터 물량을 확인해 보세요.');renderAll()}
function collectRent(){if(S.rentAcc<1)return;S.gold+=S.rentAcc;log(`입주자들이 월세 ${big(S.rentAcc)}G를 냈어요.`,true);S.rentAcc=0;renderAll()}
function finale(){if(S.floors<99||S.ended)return;if(cnt('philo')<1||cnt('starshard')<10){toast('현자의 원석 1개와 별의 파편 10개가 필요해요.');return}
  add('philo',-1);add('starshard',-10);S.ended=true;refreshBonus();
  const mins=Math.round((gtime()-S.t0)/60000);
  story(ENDING.map((c,i)=>Object.assign({k:'에필로그'},c)).concat([{k:'기록',t:'별빛골의 기록',b:'등불별이 다시 하늘에 걸렸다. 탑은 계속 쌓을 수 있다.',extra:`<div class="rcard"><span>플레이 시간</span><span>${Math.floor(mins/60)}시간 ${mins%60}분</span><span>캔 광석</span><span>${big(S.mined)}개</span><span>합성</span><span>${big(S.crafts)}번</span><span>발견한 레시피</span><span>${S.found.length}/${RECIPES.length}</span><span>탑</span><span>${S.floors}층</span><span>입주자</span><span>13명</span><span>번 골드</span><span>${big(S.earned)}G</span></div>`}]));
  renderAll()}
// 탑 구간 색: 구간 이름에 맞춰 (흙 · 돌 · 청동 · 강철 · 은빛 온실 · 수정 · 청화 · 황금 · 용암 · 백금 · 다이아 · 달빛 · 별)
const TCOL=['#8a6440','#8c8a84','#b0743a','#5f7488','#76b09a','#9a6ad0','#3f63b8','#d8a832','#c0482e','#a8b4c4','#5cc8d8','#6a68b8','#f0d890'];
function sectColor(i){return TCOL[i]||ITEMS[SECTIONS[i].mats[0][0]].c}
// 탑: 끊김 없이 위로 갈수록 가늘어지는 한 덩어리. 층마다 그 구간 재료 색, 구간 사이는 점묘로 자연스럽게 섞는다
let towerKey='';
function drawTower(){const key=S.floors+'|'+S.ended+'|'+BON.done;if(key===towerKey)return;towerKey=key;
  const cvT=$('towerCv'),t=cvT.getContext('2d'),W=64,Hh=120;t.imageSmoothingEnabled=false;
  const sky=t.createLinearGradient(0,0,0,Hh);sky.addColorStop(0,'#0b0a1a');sky.addColorStop(1,'#2a1c22');t.fillStyle=sky;t.fillRect(0,0,W,Hh);
  const R=rng(5);for(let i=0;i<26;i++){t.fillStyle=R()<.3?'#ffe9a8':'#7a7aa0';t.fillRect(Math.floor(R()*W),Math.floor(R()*70),1,1)}
  // 오로라: 하늘에 물결치는 초록 · 청록 · 보라 띠
  [['98,240,196',.2,18,0],['95,207,242',.16,26,1.7],['165,140,255',.18,34,3.1]].forEach(([c,al,y0,ph])=>{for(let x=0;x<W;x++){const yy=y0+Math.sin(x*.11+ph)*5+Math.sin(x*.27+ph*2)*2;for(let k=0;k<9;k++){t.fillStyle=`rgba(${c},${(al*(1-k/9)).toFixed(3)})`;t.fillRect(x,Math.round(yy+k),1,1)}}});
  // 마을: 입주자 수만큼 창에 불
  const done=BON.done;t.fillStyle='#1a120c';t.fillRect(0,108,W,12);
  [[2,100,10,8],[14,103,8,5],[44,101,9,7],[54,99,9,9]].forEach((h,k)=>{t.fillStyle='#2e2319';t.fillRect(h[0],h[1],h[2],h[3]);t.fillStyle='#3a2a1c';t.fillRect(h[0]-1,h[1]-2,h[2]+2,2);
    for(let w=0;w<2;w++){const lit=k*2+w<done;t.fillStyle=lit?'#ffb84a':'#120c08';t.fillRect(h[0]+2+w*4,h[1]+2,2,2)}});
  const px=(x,y,c)=>{t.fillStyle=c;t.fillRect(x,y,1,1)};
  const top=16,base=107,hgt=base-top+1,f=S.floors;
  // 폭은 1px씩 좌우 번갈아 줄어 매끈하게. 층(fl)과 구간(si)은 높이 비율로
  const rowOf=r=>{const p=r/(hgt-1),w=Math.round(27-17*Math.pow(p,.8)),fl=Math.min(99,Math.floor(p*99)+1);return{w,x0:32-Math.ceil(w/2),fl,si:secOf(fl)}};
  // 재료 색을 중간 밝기로 맞춰(너무 하얀 은·백금도 음영이 보이게) 구간끼리는 3줄에 걸쳐 섞는다
  const rgb=h=>{const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]},hex=c=>'#'+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
  const tone=i=>{let[r,g,b]=rgb(sectColor(i));const mx=Math.max(r,g,b),mn=Math.min(r,g,b),L=(mx+mn)/510;const k=L>.6?.6/L:L<.32?.32/Math.max(L,.05):1;return[r*k,g*k,b*k]};
  const TONE=SECTIONS.map((_,i)=>tone(i)),mix=(a,b,u)=>a.map((v,j)=>v+(b[j]-v)*u),sh=(c,u)=>u>0?c.map(v=>v+(255-v)*u):c.map(v=>v*(1+u));
  const ghost=[38,31,46];let builtTop=null;
  const colAt=r=>{const {fl,si}=rowOf(r);if(f<fl)return null;let c=TONE[si];
    for(const d of[1,2]){const u=rowOf(Math.min(hgt-1,r+d)),l=rowOf(Math.max(0,r-d));
      if(u.si!==si&&f>=u.fl){c=mix(c,TONE[u.si],d===1?.35:.15);break}if(l.si!==si){c=mix(c,TONE[l.si],d===1?.35:.15);break}}return c};
  for(let r=0;r<hgt;r++){const y=base-r,{w,x0,fl,si}=rowOf(r),c=colAt(r),built=!!c,b=c||ghost;
    // 둥근 기둥처럼: 왼쪽 밝게, 오른쪽 어둡게
    for(let x=0;x<w;x++){const u=x/(w-1),k=u<.12?.38:u<.3?.16:u<.62?0:u<.82?-.2:-.42;px(x0+x,y,hex(sh(b,built?k:k*.5)))}
    px(x0-1,y,'#120c14');px(x0+w,y,'#120c14');
    // 창: 다섯 줄마다, 쌓은 층에만 불
    if(built&&r%5===2&&r>2){const ws=w>=19?[-6,-1,4]:w>=13?[-4,2]:[-1];ws.forEach(o=>{const wx=32+o;px(wx,y,'#ffe2a0');px(wx,y-1,'#ffcf6a');px(wx+1,y,hex(sh(b,-.6)));px(wx+1,y-1,hex(sh(b,-.6)))})}
    if(built)builtTop={y,w,x0}}
  // 꼭대기 테두리
  {const {w,x0}=rowOf(hgt-1);for(let x=-1;x<=w;x++)px(x0+x,top-1,'#120c14')}
  // 받침돌
  t.fillStyle='#4a3a30';t.fillRect(16,105,32,3);t.fillStyle='#6a5444';t.fillRect(16,105,32,1);t.fillStyle='#2a2018';t.fillRect(16,107,32,1);t.fillStyle='#120c14';t.fillRect(15,105,1,3);t.fillRect(48,105,1,3);
  // 짓는 중: 꼭대기에 비계
  if(builtTop&&f<99){const {y,w,x0}=builtTop;t.fillStyle='#8a6a3a';t.fillRect(x0,y-4,1,4);t.fillRect(x0+w-1,y-4,1,4);t.fillRect(x0,y-4,w,1);t.fillStyle='#ffe9a8';t.fillRect(32,y-5,1,1)}
  // 99층: 첨탑과 불빛
  if(f>=99){t.fillStyle='#120c14';t.fillRect(28,top-6,9,6);t.fillStyle='#ff9a4a';t.fillRect(29,top-5,7,5);t.fillStyle='#ffd27a';t.fillRect(30,top-5,2,5);t.fillStyle='#120c14';t.fillRect(31,top-10,3,4);t.fillStyle='#ffe9a8';t.fillRect(32,top-9,1,3)}
  if(S.ended){t.fillStyle='rgba(255,233,168,.25)';t.fillRect(28,1,9,9);t.fillStyle='#ffe9a8';t.fillRect(31,4,3,3);t.fillRect(32,2,1,7);t.fillRect(29,5,7,1)}}
const TH={card:'',sh:''};
function renderTower(){
  drawTower();const f=S.floors,i=secOf(f+1),sec=i>=0?SECTIONS[i]:null,rps=rentPerSec();
  setHTML($('towerSum'),`<span class="big">${big(f)}층</span><span class="dim">${sec?`${sec.n} (${sec.from}~${sec.to}층)`:f>=99?'하늘 너머':''}</span>
    <span>판매가 보너스 <b class="good">+${Math.min(f,99)}%</b></span>
    <span>입주자 ${BON.done}/13 · 월세 시간당 ${big(rps*3600)}G</span>
    <div class="row-btns" style="margin-top:2px"><button class="px-btn ${S.rentAcc>=1?'lamp':''}${badges().rent?' ndot':''}" id="rentBtn" type="button" ${S.rentAcc<1?'disabled':''}>월세 받기 ${S.rentAcc>=1?big(S.rentAcc)+'G':''}</button></div>`);
  let card='';
  if(towerBlocked()){const ok=cnt('philo')>=1&&cnt('starshard')>=10;
    card=`<h2>천공의 용광로</h2><p class="dim">하늘에 가장 가까운 용광로. 마지막 합성으로 별을 하늘로 돌려보낼 수 있어요.</p>
    <div class="matl">${ico('philo')}<span>현자의 원석</span><span class="${cnt('philo')>=1?'ok':'no'}">${cnt('philo')}/1</span></div><div class="matl">${ico('starshard')}<span>별의 파편</span><span class="${cnt('starshard')>=10?'ok':'no'}">${cnt('starshard')}/10</span></div>
    <div class="row-btns"><button class="px-btn lamp grow${ok?' ndot':''}" id="finaleBtn" type="button" ${ok?'':'disabled'}>별을 돌려보내기</button></div>`}
  else{const c=floorCost(f+1),ok=canBuild(c);
    card=`<h2>${f+1}층 짓기 <small>${i>=0?SECTIONS[i].n:'하늘 너머'}</small></h2>`+c.mats.map(([id,q])=>`<div class="matl">${ico(id)}<span>${S.seen.includes(id)?ITEMS[id].n:'???'}</span><span class="${cnt(id)>=q?'ok':'no'}">${big(cnt(id))}/${big(q)}</span></div>`).join('')+
    `<div class="matl"><i class="ico ic-goldbar"></i><span>골드</span><span class="${S.gold>=c.gold?'ok':'no'}">${big(c.gold)}G</span></div>
    <div class="row-btns"><button class="px-btn lamp grow${ok?' ndot':''}" id="buildBtn" type="button" ${ok?'':'disabled'}>한 층 쌓기</button><button class="px-btn" id="buildMaxBtn" type="button" ${ok?'':'disabled'}>가능한 만큼</button></div>
    <div class="row-btns"><button class="px-btn grow" id="buyMissBtn" type="button">부족한 재료 장터에서 사기</button></div>
    <p class="dim small" style="margin:8px 0 0">5층마다 축하금 · 구간을 완공하면 새 입주자가 들어와요</p>`}
  if(TH.card!==card){$('floorCard').innerHTML=card;TH.card=card}
  const sh=SECTIONS.map((s,k)=>{const dn=f>=s.to,cur=!dn&&f>=s.from-1,pct=clamp((f-s.from+1)/(s.to-s.from+1),0,1);
    return`<div class="sect ${dn?'done':cur?'cur':'lock'}" data-sec="${k}" role="button" tabindex="0" aria-label="${s.n} ${dn?s.t.name:'빈 구간'} 자세히 보기"><canvas data-por="${k}" width="48" height="48"></canvas><div><div class="tn">${s.n} <span class="dim">${s.from}~${s.to}층</span></div>
      <div>${dn?`${s.t.role} <b>${s.t.name}</b> · ${s.t.bonus}`:cur?`입주 예정: ???`:'???'}</div><div class="bar"><i style="width:${pct*100}%"></i></div></div><span class="dim">${Math.round(pct*100)}%</span></div>`}).join('');
  if(TH.sh!==sh){$('sections').innerHTML=sh;TH.sh=sh;document.querySelectorAll('[data-por]').forEach(c=>{const k=+c.dataset.por;drawPortrait(c,SECTIONS[k].t,f<SECTIONS[k].to)})}
}
/* 입주자 칸을 누르면: 초상화 · 이름 · 소개 · 그 사람 말투의 한마디 */
const lastSay={};
function tenantCard(k){const s=SECTIONS[k],t=s.t,f=S.floors,dn=f>=s.to,pct=Math.round(clamp((f-s.from+1)/(s.to-s.from+1),0,1)*100);
  if(!dn){story([{k:`${s.n} · ${s.from}~${s.to}층`,t:'아직 비어 있는 구간',b:f>=s.from-1?`지금 쌓는 중이에요 (${pct}%). ${s.to}층까지 다 쌓으면 누군가 이곳에 들어올 거예요.`:`${s.to}층까지 쌓으면 누군가 이곳에 들어올 거예요.`,portrait:t,hide:true}]);return}
  const L=t.says||[t.line];let i=Math.floor(Math.random()*L.length);if(L.length>1&&i===lastSay[k])i=(i+1)%L.length;lastSay[k]=i;
  story([{k:`${s.n} · ${s.from}~${s.to}층`,t:`${t.role} ${t.name}`,b:t.d||'',portrait:t,art:t.art,
    extra:`<div class="say"><span class="who">${t.name}</span> "${L[i]}"</div><div class="say"><span class="who">입주 효과</span> ${t.bonus}<br><span class="dim">월세 시간당 ${big(s.g*BAL.rent)}G</span></div>`}])}
$('sections').addEventListener('click',e=>{const el=e.target.closest('[data-sec]');if(el)tenantCard(+el.dataset.sec)});
$('sections').addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const el=e.target.closest('[data-sec]');if(el){e.preventDefault();tenantCard(+el.dataset.sec)}});
$('tab-tower').addEventListener('click',e=>{const id=e.target.closest('button')?.id;if(id==='buildBtn'){if(buildFloor())renderAll()}if(id==='buildMaxBtn')buildMax();if(id==='buyMissBtn')buyMissing();if(id==='rentBtn')collectRent();if(id==='finaleBtn')finale()});
/* 입주자 초상 (48×48): 사람마다 피부 · 머리 모양 · 눈 · 수염 · 소품 · 옷을 다르게 */
const PSTYLE={
  '바우':{skin:'#e0a878',hs:'short',beard:'stub',brow:'thick',age:1,mouth:'flat',wear:'apron'},
  '셈 할멈':{skin:'#f0c8a8',hs:'bun',age:2,glasses:1,mouth:'flat',brow:'stern'},
  '핀':{skin:'#f6d0a8',hs:'messy',freck:1,mouth:'grin',kid:1},
  '무쇠':{skin:'#d89a70',hs:'bald',beard:'full',brow:'thick',mouth:'smile',wear:'apron'},
  '루카':{skin:'#eec098',hs:'short',mouth:'grin',wear:'scarf'},
  '엘라':{skin:'#f4d0b4',hs:'long',age:1,mouth:'smile',lash:1,ear:'#c28cf4'},
  '서린':{skin:'#f2cca8',hs:'long',mouth:'smile',lash:1},
  '하멜 경':{skin:'#f0caa8',hs:'short',beard:'mous',age:1,mono:1,mouth:'flat',wear:'gold'},
  '도담':{skin:'#e8b088',hs:'spiky',mouth:'grin',soot:1},
  '강철':{skin:'#d8a880',hs:'short',brow:'stern',scar:1,mouth:'flat'},
  '미르':{skin:'#f0d8c8',hs:'long',half:1,mouth:'smile',eye:'#8a6ad0'},
  '노을':{skin:'#f4d2b0',hs:'long',mouth:'smile',lash:1,eye:'#d86a3a'},
  '아르덴 교수':{skin:'#ecc4a4',hs:'side',beard:'long',age:2,glasses:1,mouth:'flat'},
  '이장 할머니':{skin:'#f0c8a8',hs:'bun',age:2,mouth:'smile'}};
function drawPortrait(cvP,t,hide){const W=48,pb=new PB(W,W),st=PSTYLE[t.name]||{},SK=st.skin||'#f4c8a0',HR=ramp(t.hair),CR=ramp(t.coat),SR=[shade(SK,-.42),shade(SK,-.13),SK,shade(SK,.18),shade(SK,.4)],out='#141020';
  const hx=24,hy=21,rx=9.6,ry=10.6,eye=st.eye||'#2a2034';
  // 몸: 어깨와 옷
  pb.ell(24,47,19,12,(x,y)=>{const v=(x-24)/19;return v<-.55?CR[3]:v>.45?CR[1]:CR[2]});
  if(st.wear==='apron'){pb.rect(15,38,18,10,(x,y)=>x>28?'#5a3a22':'#7a5030');pb.rect(17,37,2,4,'#5a3a22');pb.rect(29,37,2,4,'#4a2e1a')}
  pb.poly([[19,35],[24,41],[29,35]],'#e8e0d4');pb.poly([[21,35],[24,39],[27,35]],SR[1]);           // 깃과 목
  if(st.wear==='scarf'){pb.rect(17,35,14,3,'#e8b84a');pb.rect(26,37,3,6,'#d09a2a')}
  if(st.wear==='gold'){pb.rect(23,41,2,7,'#e8c060');[42,45].forEach(y=>pb.set(24,y,'#fff0a0'));pb.line(19,35,23,40,'#e8c060');pb.line(29,35,25,40,'#e8c060')}
  pb.rect(21,30,6,6,SR[1]);pb.rect(25,30,2,6,shade(SK,-.25));                                               // 목
  // 긴 머리 뒷부분
  if(st.hs==='long')pb.ell(24,25,13,14,(x,y)=>y>10&&(y<20||x<17||x>31)?(x>30?HR[1]:HR[2]):null);
  if(t.hat==='hood')pb.ell(24,22,14.5,15,(x,y)=>x>31?'#3a2c58':'#4a3a6a');
  // 얼굴(턱은 조금 좁게)
  for(let y=hy-ry;y<=hy+ry;y++)for(let x=hx-rx-1;x<=hx+rx+1;x++){const dy=(y+.5-hy)/ry,rr=rx*(1-.2*Math.max(0,dy)**1.6),dx=(x+.5-hx)/rr;if(dx*dx+dy*dy>1)continue;
    pb.set(x,y,dx>.62||dy>.82?SR[1]:dx<-.45&&dy<.1&&dy>-.6?SR[3]:SR[2])}
  pb.rect(13,21,2,4,SR[2]);pb.rect(33,21,2,4,SR[1]);pb.set(14,22,SR[1]);pb.set(33,22,SR[0]);       // 귀
  if(st.ear){pb.set(14,25,st.ear);pb.set(33,25,st.ear)}
  // 눈 · 눈썹
  const ey=23,eyes=[[18,ey],[28,ey]];
  eyes.forEach(([x,y],k)=>{if(st.half){pb.rect(x,y+1,3,1,eye);pb.rect(x,y,3,1,SR[0])}
    else if(st.age===2){pb.rect(x,y,2,2,eye);pb.set(x,y,'#ffffff');pb.set(k?x+3:x-2,y-1,SR[0]);pb.set(k?x+3:x-2,y+2,SR[0])}
    else{pb.rect(x,y,3,3,eye);pb.rect(x,y+2,3,1,shade(eye,.25));pb.set(x,y,'#ffffff');if(st.lash){pb.rect(x-(k?0:1),y-1,4,1,out)}}});
  const bc=st.age===2?'#d8d4cc':shade(t.hair,-.25);
  eyes.forEach(([x,y],k)=>{const by=y-3;if(st.brow==='stern'){pb.line(k?x:x,k?by+1:by,k?x+3:x+3,k?by:by+1,bc)}else{pb.rect(x,by,3,1,bc);if(st.brow==='thick')pb.rect(x,by-1,3,1,bc)}});
  // 코 · 볼 · 입
  pb.set(24,26,SR[1]);pb.set(25,27,SR[0]);
  if(!st.beard||st.beard==='stub'){pb.rect(16,27,2,1,'#e88a7a');pb.rect(31,27,2,1,'#e88a7a')}
  const m=st.mouth;if(m==='grin'){pb.rect(21,29,6,2,'#5a1e1e');pb.rect(22,29,4,1,'#ffffff')}else if(m==='smile'){pb.set(21,29,'#8a3a3a');pb.rect(22,30,4,1,'#8a3a3a');pb.set(26,29,'#8a3a3a')}else pb.rect(22,30,4,1,'#8a4a40');
  if(st.age){pb.set(16,29,SR[1]);pb.set(31,29,SR[0]);if(st.age===2){pb.line(19,20,21,20,SR[1]);pb.set(22,32,SR[1]);pb.set(26,32,SR[1])}}
  if(st.freck)[[17,26],[19,27],[29,27],[31,26]].forEach(([x,y])=>pb.set(x,y,'#c88a5a'));
  if(st.soot){pb.rect(29,26,3,1,'#6a6058');pb.set(18,18,'#6a6058')}
  if(st.scar)pb.line(30,24,32,28,'#b07a68');
  // 수염
  if(st.beard==='stub')for(let x=18;x<=30;x++)for(let y=28;y<=32;y++)if((x+y)%2===0&&Math.hypot((x-24)/6.5,(y-29)/4)<1&&!(y===30&&x>=22&&x<=25))pb.set(x,y,shade(t.hair,.1));
  if(st.beard==='full'||st.beard==='long'){const L=st.beard==='long'?9:5,BR=ramp(st.beard==='long'?'#e8e8f0':t.hair);
    pb.ell(24,30+L/3,8.5,4+L/2,(x,y)=>y>27?(x>27?BR[1]:x<20?BR[3]:BR[2]):null);pb.rect(20,27,8,2,BR[2]);pb.rect(22,30,4,1,'#5a2a2a')}
  if(st.beard==='mous'){pb.rect(20,28,8,1,HR[2]);pb.set(19,29,HR[2]);pb.set(28,29,HR[2])}
  // 앞머리
  const Hs=st.hs;
  if(Hs!=='bald'){const top=Hs==='bun'||st.age===2?'#d8d4cc':null,R2=top?ramp(top):HR;
    pb.ell(24,16,11,7.5,(x,y)=>y<17?(x>29?R2[1]:x<19?R2[3]:R2[2]):null);
    for(let x=14;x<=34;x++){const sp=Hs==='spiky'?3:Hs==='messy'?2:1,yy=15+((x*7)%5<2?sp:0)+(Hs==='side'&&x<22?-1:0);for(let y=13;y<=yy;y++)pb.set(x,y,x>29?R2[1]:R2[2])}
    pb.rect(14,15,2,6,R2[2]);pb.rect(33,15,2,6,R2[1]);
    if(Hs==='spiky')for(let k=0;k<5;k++)pb.poly([[15+k*4,12],[17+k*4,4+((k*3)%3)],[19+k*4,12]],k>3?R2[1]:R2[2]);
    if(Hs==='messy')[[16,9],[22,7],[28,8],[32,11]].forEach(([x,y])=>pb.poly([[x-2,y+4],[x,y],[x+2,y+4]],R2[2]));
    if(Hs==='bun')pb.ell(24,8,4.5,3.8,(x,y)=>x>25?R2[1]:R2[3]);
    if(Hs==='long'){pb.rect(13,17,3,15,HR[2]);pb.rect(32,17,3,15,HR[1])}
    pb.line(18,11,22,10,R2[4]);pb.set(23,10,R2[3])}
  else{pb.rect(13,17,2,6,HR[2]);pb.rect(33,17,2,6,HR[1]);pb.ell(24,14,9.5,5,(x,y)=>y<17?(x<21?SR[3]:SR[2]):null);pb.set(19,10,'#ffffff')}
  // 모자와 소품
  switch(t.hat){
    case'helmet':{const Y=ramp('#e8b13a');pb.ell(24,15,12,8.5,(x,y)=>y<16?(x>30?Y[1]:x<18?Y[3]:Y[2]):null);pb.rect(11,15,26,2,Y[1]);pb.rect(12,15,24,1,Y[2]);pb.rect(16,9,3,2,Y[4]);
      pb.ell(24,11,3,2.6,'#5a5a64');pb.ell(24,11,1.8,1.6,'#fff6c8');pb.set(23,10,'#ffffff');break}
    case'scarf':{const Q=ramp('#9a6aaa');pb.ell(24,15,12.5,9,(x,y)=>y<18?(x>30?Q[1]:x<18?Q[3]:Q[2]):null);pb.rect(12,15,3,10,Q[2]);pb.rect(33,15,3,10,Q[1]);for(let x=14;x<34;x+=4)pb.set(x,12,Q[4]);break}
    case'goggles':{pb.rect(13,15,22,2,'#4a3a2a');[[17,13],[26,13]].forEach(([x,y])=>{pb.rect(x,y,6,5,'#8a7a5a');pb.rect(x+1,y+1,4,3,'#7cc8ff');pb.set(x+1,y+1,'#e8f8ff')});break}
    case'cap':{const G=ramp('#3f8a5a');pb.ell(25,14,11,7,(x,y)=>y<16?(x>30?G[1]:G[2]):null);pb.rect(8,15,14,2,G[1]);pb.rect(9,15,12,1,G[3]);pb.set(25,8,G[4]);break}
    case'hairpin':pb.rect(30,13,4,3,'#c28cf4');pb.set(31,13,'#f0d8ff');pb.set(33,15,'#8a5ac8');break;
    case'tophat':{pb.rect(15,1,18,12,(x)=>x>28?'#14141e':'#22222e');pb.rect(15,10,18,2,'#a03a3a');pb.rect(11,12,26,3,'#1a1a28');pb.rect(16,2,2,8,'#3a3a4e');break}
    case'bandana':{const B=ramp('#c0402a');pb.ell(24,14,11.5,7,(x,y)=>y<16?(x>30?B[1]:B[2]):null);[[17,11],[25,12],[30,10]].forEach(([x,y])=>pb.set(x,y,'#ffe0d0'));pb.poly([[34,14],[40,11],[39,18]],B[1]);break}
    case'hood':{pb.ell(24,14,13.5,9,(x,y)=>y<17?(x>31?'#3a2c58':'#4a3a6a'):null);pb.rect(11,14,4,18,'#4a3a6a');pb.rect(33,14,4,18,'#3a2c58');break}
    case'wizard':{const Wz=ramp('#2a2a6a');pb.poly([[12,15],[36,15],[28,-2]],(x,y)=>x>28?Wz[1]:Wz[2]);pb.rect(9,14,30,3,Wz[3]);pb.rect(9,16,30,1,Wz[1]);[[22,8],[26,4]].forEach(([x,y])=>{pb.set(x,y,'#ffe9a8');pb.set(x-1,y,'#c8b070');pb.set(x+1,y,'#c8b070')});break}}
  if(st.glasses||t.hat==='glasses'){eyes.forEach(([x,y])=>{for(let a=0;a<6.28;a+=.4)pb.set(x+1+Math.cos(a)*3,y+1+Math.sin(a)*2.6,'#3a3040')});pb.rect(21,ey+1,4,1,'#3a3040');pb.set(19,ey-1,'#ffffff')}
  if(st.mono){for(let a=0;a<6.28;a+=.4)pb.set(29+Math.cos(a)*3,24+Math.sin(a)*3,'#e8c060');pb.line(32,25,33,34,'#e8c060')}
  pb.outline(out);
  // 배경: 인물 색을 은은하게, 가장자리는 어둡게
  const bg=document.createElement('canvas');bg.width=W;bg.height=W;const g=bg.getContext('2d');const gr=g.createRadialGradient(24,18,4,24,24,34);
  gr.addColorStop(0,hide?'#1c2440':shade(t.coat,-.35));gr.addColorStop(1,hide?'#0c1022':shade(t.coat,-.78));g.fillStyle=gr;g.fillRect(0,0,W,W);
  const fg=pb.canvas(1);if(hide){const x=fg.getContext('2d');x.globalCompositeOperation='source-in';x.fillStyle='#2a3352';x.fillRect(0,0,W,W)}
  g.drawImage(fg,0,0);if(hide){g.fillStyle='#8ea3cc';g.font='bold 14px sans-serif';g.textAlign='center';g.fillText('?',24,30)}
  cvP.width=W;cvP.height=W;const c2=cvP.getContext('2d');c2.imageSmoothingEnabled=false;c2.clearRect(0,0,W,W);c2.drawImage(bg,0,0)}
