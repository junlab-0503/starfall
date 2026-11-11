/* ═════════ 탑 ═════════ */
function secOf(f){for(let i=0;i<SECTIONS.length;i++)if(f<=SECTIONS[i].to)return i;return -1}
function floorCost(f){const i=secOf(f),s=i>=0?SECTIONS[i]:SKY,from=i>=0?s.from:100,k=f-from;
  return{gold:Math.round(s.g*Math.pow(BAL.tgrow,k)),mats:s.mats.map(([id,q])=>[id,Math.ceil(q*Math.pow(BAL.mgrow,k))]),sec:i}}
const canBuild=c=>S.gold>=c.gold&&c.mats.every(([id,q])=>cnt(id)>=q);
const towerBlocked=()=>S.floors>=99&&!S.ended;
const rentPerSec=()=>SECTIONS.reduce((s,x)=>s+(S.floors>=x.to?x.g*BAL.rent/3600:0),0);
// 새 입주자가 들어오면 그 사람이 직접, 새로 열린 것을 알려 준다
const TENANT_INTRO={
  '무쇠':[{t:'무쇠네 대장간',b:'"허허, 다시 망치를 잡게 되었구려. [장비] 탭 대장간에서 곡괭이를 벼려 주리다. 날이 설수록 바위가 쉽게 갈라지지."'}],
  '셈':[{t:'셈의 창고',b:'"창고가 비좁지? [장비] 탭 내 창고에서 칸을 늘려 줄게. 꽉 차면 싼 원석부터 알아서 정리하는 것도 맡겨 둬."'}],
  '핀':[{t:'핀의 작업대',b:'"할아버지 채굴 기계요? 제가 고칠 수 있어요! [장비] 탭 작업대에서 드릴 로봇을 더 빠르게 만들고, 보관함도 넓혀 드릴게요."'}],
  '바우':[{t:'광부 반장 바우',b:'"곡괭이는 힘이 아니라 바위 결로 휘두르는 거여. 내가 요령을 알려 주지. 탭 한 번이 더 세질 게야."'}],
  '루카':[{t:'지층 출입권',b:'"장터에 [지층 출입권]을 열었어요! 출입권을 가지고 있으면 그 지층 광석이 조금씩 로봇 보관함에 들어와요. 한꺼번에 많이 사면 값이 조금씩 올라요."'},
          {t:'소문 게시판',b:'"그리고 소문! 30분쯤마다 지층 소문이 돌고, 15~20분 뒤에 사실인지 발표돼요. 누가 한 말인지, 다른 사람도 같은 말을 하는지, 그 지층에서 단서가 나오는지 잘 보세요. 사실로 밝혀지면 출입권 값이 크게 올라요."'}],
  '미르':[{t:'미르의 용광로',b:'"…용광로는 제가 돌볼게요. [장비] 탭에서 풀무를 키우면 재련이 더 잘 되고, 자동 재련 칸을 늘리면 자리를 비운 동안에도 녹여 둘게요."'}]};
function buildFloor(quiet){if(towerBlocked())return false;const f=S.floors+1,c=floorCost(f);if(!canBuild(c))return false;
  S.gold-=c.gold;c.mats.forEach(([id,q])=>add(id,-q));S.floors=f;
  if(f%5===0){const gift=c.gold*3;S.gold+=gift;log(`${f}층 완공 기념! 마을 사람들이 축하금을 보냈어요: +${big(gift)}G`,!quiet)}
  const sec=SECTIONS.findIndex(s=>s.to===f);
  if(sec>=0){refreshBonus();const t=SECTIONS[sec].t;log(`${SECTIONS[sec].n} 완공! ${t.role} ${J(t.name,'이가')} 탑에 들어왔어요.`);
    story([{gold:1,k:`${SECTIONS[sec].n} 완공 · 새 입주자`,t:`${t.role} ${t.name}`,b:`"${t.line}"`,portrait:t,extra:`<div class="say"><span class="who">입주 효과</span> ${t.bonus}<br><span class="dim">월세 시간당 ${big(SECTIONS[sec].g*BAL.rent)}G</span></div>`}]);
    story((TENANT_INTRO[t.name]||[]).map(c=>({gold:1,k:'새로 열렸어요',t:c.t,b:c.b,portrait:t,art:t.art})))}
  if(f===99)story([{k:'99층',t:'하늘에 닿았다',b:'탑 꼭대기에 천공의 용광로를 놓을 자리가 생겼다. 현자의 원석과 별의 파편이 있으면, 별을 돌려보낼 수 있다.'}]);
  return true}
function buildMax(){let n=0;while(n<200&&buildFloor(true))n++;if(n)toast(`${n}층을 쌓았어요!`);renderAll()}
function buyMissing(){const c=floorCost(S.floors+1);let spent=0,got=0;c.mats.forEach(([id,q])=>{const m=q-cnt(id);if(m>0){const r=buy(id,m);spent+=r.t;got+=r.k}});
  toast(got?`부족한 재료 ${got}개를 ${big(spent)}G에 샀어요.`:'살 수 있는 재료가 없어요. 골드나 창고, 장터 물량을 확인해 보세요.');renderAll()}
function collectRent(){if(S.rentAcc<1)return;S.gold+=S.rentAcc;log(`입주자들이 월세 ${big(S.rentAcc)}G를 냈어요.`,true);S.rentAcc=0;renderAll()}
function finale(){if(S.floors<99||S.ended)return;if(cnt('philo')<1||cnt('starshard')<10){toast('현자의 원석 1개와 별의 파편 10개가 필요해요.');return}
  add('philo',-1);add('starshard',-10);S.ended=true;refreshBonus();
  const mins=Math.round((gtime()-S.t0)/60000);
  story(ENDING.map((c,i)=>Object.assign({gold:1,k:'에필로그'},c)).concat([{k:'기록',t:'별빛골의 기록',b:'등불별이 다시 하늘에 걸렸다. 탑은 계속 쌓을 수 있다.',extra:`<div class="rcard"><span>플레이 시간</span><span>${Math.floor(mins/60)}시간 ${mins%60}분</span><span>캔 광석</span><span>${big(S.mined)}개</span><span>재련</span><span>${big(S.crafts)}번</span><span>발견한 레시피</span><span>${S.found.length}/${RECIPES.length}</span><span>탑</span><span>${S.floors}층</span><span>입주자</span><span>13명</span><span>번 골드</span><span>${big(S.earned)}G</span></div>`}]));
  renderAll()}
// 탑 구간 색: 구간 이름에 맞춰 (흙 · 돌 · 청동 · 강철 · 은빛 온실 · 수정 · 청화 · 황금 · 용암 · 백금 · 다이아 · 달빛 · 별)
const TCOL=['#8a6440','#8c8a84','#b0743a','#5f7488','#76b09a','#9a6ad0','#3f63b8','#d8a832','#c0482e','#a8b4c4','#5cc8d8','#6a68b8','#f0d890'];
function sectColor(i){return TCOL[i]||ITEMS[SECTIONS[i].mats[0][0]].c}
// 탑: 끊김 없이 위로 갈수록 가늘어지는 한 덩어리. 층마다 그 구간 재료 색, 구간 사이는 점묘로 자연스럽게 섞는다
let towerKey='';
function drawTower(){const key=S.floors+'|'+S.ended+'|'+BON.done+'|'+S.unlocked;if(key===towerKey)return;towerKey=key;
  const cvT=$('towerCv'),t=cvT.getContext('2d'),W=64,Hh=120;t.imageSmoothingEnabled=false;
  const sky=t.createLinearGradient(0,0,0,Hh);sky.addColorStop(0,'#0b0a1a');sky.addColorStop(1,'#2a1c22');t.fillStyle=sky;t.fillRect(0,0,W,Hh);
  const R=rng(5);for(let i=0;i<26;i++){t.fillStyle=R()<.3?'#ffe9a8':'#7a7aa0';t.fillRect(Math.floor(R()*W),Math.floor(R()*70),1,1)}
  // 오로라: 하늘에 물결치는 초록 · 청록 · 보라 띠
  // 오로라는 깊이 내려갈수록 하늘에 짙어진다
  const auP=S.ended?1:clamp((S.unlocked-1)/(LAYERS.length-1),0,1);
  if(auP>0)[['98,240,196',.2*auP,18,0],['95,207,242',.16*auP,26,1.7],['165,140,255',.18*auP,34,3.1]].forEach(([c,al,y0,ph])=>{for(let x=0;x<W;x++){const yy=y0+Math.sin(x*.11+ph)*5+Math.sin(x*.27+ph*2)*2;for(let k=0;k<9;k++){t.fillStyle=`rgba(${c},${(al*(1-k/9)).toFixed(3)})`;t.fillRect(x,Math.round(yy+k),1,1)}}});
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
    card=`<h2>천공의 용광로</h2><p class="dim">하늘에 가장 가까운 용광로. 마지막 재련으로 별을 하늘로 돌려보낼 수 있어요.</p>
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
  '셈':{skin:'#f6d2b0',hs:'long',mouth:'smile',wear:'apron',eye:'#3a2420'},
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
// 직접 그린 초상화(art/portraits, 128×128)가 있으면 그것. 아직 안 들어온 사람은 어둡게 + ?
const POR_IMG={};
function artPortrait(cvP,key,hide){const im=POR_IMG[key]||(POR_IMG[key]=Object.assign(new Image(),{src:ART[key]})),go=()=>{cvP.width=cvP.height=128;const c=cvP.getContext('2d');c.imageSmoothingEnabled=false;
  c.filter=hide?'brightness(.06) saturate(0) blur(1px)':'none';c.drawImage(im,0,0,128,128);c.filter='none';if(hide){c.fillStyle='#b29c80';c.font='bold 36px sans-serif';c.textAlign='center';c.fillText('?',64,80)}};im.complete?go():im.addEventListener('load',go,{once:true})}
function drawPortrait(cvP,t,hide){if(t.art&&typeof ART!=='undefined'&&ART[t.art])return artPortrait(cvP,t.art,hide);const W=64,pb=new PB(W,W),st=PSTYLE[t.name]||{},SK=st.skin||'#f4c8a0',HR=ramp(t.hair),CR=ramp(t.coat),out='#2a1a18';
  const SR=[shade(SK,-.4),shade(SK,-.12),SK,shade(SK,.16),shade(SK,.38)],hx=32,hy=29,rx=13.2,ry=13.8,eyeC=st.eye||'#3a2830',old=st.age===2;
  const HRd=shade(t.hair,-.35),hairTop=st.hs==='bun'||old?'#dcd6cc':null,R2=hairTop?ramp(hairTop):HR;
  // 몸: 어깨 · 옷 (주름과 단추)
  pb.ell(32,66,27,17,(x,y)=>{const v=(x-32)/27;return v<-.5?CR[3]:v>.42?CR[1]:CR[2]});
  for(let y=52;y<64;y+=4){pb.set(17+(y%8?1:0),y,CR[1]);pb.set(46-(y%8?1:0),y,CR[1])}
  if(st.wear==='apron'){pb.rect(20,51,24,13,(x,y)=>x>38?'#5a3a22':x<23?'#8a5c38':'#7a5030');pb.rect(22,49,2,5,'#5a3a22');pb.rect(40,49,2,5,'#4a2e1a');pb.rect(28,56,8,4,'#6a4428');pb.rect(28,56,8,1,'#8a5c38')}
  pb.poly([[24,46],[32,55],[40,46]],'#efe6d8');pb.poly([[27,46],[32,52],[37,46]],SR[1]);
  if(st.wear==='scarf'){pb.rect(21,45,22,4,'#f0c050');pb.rect(21,45,22,1,'#ffe08a');pb.rect(36,48,4,9,'#d8a030');pb.set(37,57,'#d8a030')}
  if(st.wear==='gold'){pb.rect(31,55,2,9,'#e8c060');[57,61].forEach(y=>pb.set(32,y,'#fff4b0'));pb.line(24,46,30,54,'#e8c060');pb.line(40,46,34,54,'#e8c060')}
  if(!st.wear)[[32,58],[32,62]].forEach(([x,y])=>{pb.set(x,y,CR[0]);pb.set(x,y-1,CR[3])});
  pb.rect(27,39,10,9,SR[1]);pb.rect(34,39,3,9,SR[0]);
  // 긴 머리 뒤 · 두건 뒤
  if(st.hs==='long')pb.ell(32,34,17.5,19,(x,y)=>y>12&&(y<27||x<19||x>45)?(x>42?HR[1]:x<22?HR[3]:HR[2]):null);
  if(t.hat==='hood')pb.ell(32,30,19.5,20,(x,y)=>x>43?'#3a2c58':'#4a3a6a');
  // 얼굴: 둥글게, 턱은 살짝 좁게
  for(let y=Math.floor(hy-ry);y<=hy+ry;y++)for(let x=Math.floor(hx-rx-1);x<=hx+rx+1;x++){const dy=(y+.5-hy)/ry,rr=rx*(1-.16*Math.max(0,dy)**1.5),dx=(x+.5-hx)/rr;if(dx*dx+dy*dy>1)continue;
    pb.set(x,y,dx>.68||dy>.86?SR[1]:dx<-.48&&dy<.25&&dy>-.55?SR[3]:SR[2])}
  pb.rect(17,27,3,7,SR[2]);pb.rect(44,27,3,7,SR[1]);pb.set(18,29,SR[1]);pb.set(18,30,SR[1]);pb.set(45,29,SR[0]);pb.set(45,30,SR[0]);
  if(st.ear){pb.rect(18,34,2,2,st.ear);pb.set(18,34,'#ffffff');pb.rect(45,34,2,2,st.ear)}
  // 눈: 크고 반짝이게 (사람마다 모양)
  const EY=29,E=[[21,EY],[38,EY]];
  E.forEach(([x,y],k)=>{
    if(st.half){pb.rect(x,y+3,5,3,eyeC);pb.rect(x,y+2,5,1,out);pb.rect(x+1,y+3,2,1,'#ffffff')}
    else if(old){pb.rect(x,y+2,5,1,out);pb.rect(x,y+3,5,2,eyeC);pb.set(x+1,y+3,'#ffffff');pb.set(k?x+5:x-1,y+1,SR[0]);pb.set(k?x+5:x-1,y+4,SR[0])}
    else{pb.rect(x,y,5,6,eyeC);pb.rect(x,y,5,1,out);pb.set(x-1,y+1,out);pb.set(x+5,y+1,out);pb.rect(x,y+4,5,2,shade(eyeC,.3));pb.set(x+2,y+5,shade(eyeC,.5));pb.rect(x+1,y+1,2,2,'#ffffff');pb.set(x+3,y+4,'#ffffff');
      if(st.lash){pb.set(k?x+5:x-1,y,out);pb.set(k?x+6:x-2,y-1,out)}}});
  const bc=old?'#dcd6cc':HRd;
  E.forEach(([x,y],k)=>{const by=y-3;if(st.brow==='stern')pb.line(x,k?by+1:by,x+4,k?by:by+1,bc);else{pb.rect(x,by,5,1,bc);if(st.brow==='thick')pb.rect(x,by-1,5,1,bc)}});
  // 코 · 볼 · 입
  pb.set(31,36,SR[1]);pb.set(32,37,SR[0]);
  if(!st.beard||st.beard==='stub'){pb.rect(19,37,4,2,'#f09a8a');pb.set(19,37,'#ffc0b0');pb.rect(41,37,4,2,'#e88a7a')}
  const m=st.mouth;if(m==='grin'){pb.rect(28,39,8,3,'#6a1e1e');pb.rect(29,39,6,1,'#ffffff');pb.rect(30,41,4,1,'#e86a6a')}else if(m==='smile'){pb.set(28,39,'#9a3a3a');pb.rect(29,40,6,1,'#9a3a3a');pb.set(35,39,'#9a3a3a')}else pb.rect(29,40,6,1,'#9a4a40');
  if(st.age){pb.set(22,39,SR[1]);pb.set(41,39,SR[0]);if(old){pb.line(24,26,27,26,SR[1]);pb.set(30,43,SR[1]);pb.set(34,43,SR[1])}}
  if(st.freck)[[22,35],[24,36],[39,36],[41,35],[23,37]].forEach(([x,y])=>pb.set(x,y,'#c88a5a'));
  if(st.soot){pb.rect(39,35,4,1,'#6a6058');pb.set(24,23,'#6a6058');pb.set(25,23,'#6a6058')}
  if(st.scar)pb.line(40,32,43,37,'#b07a68');
  // 수염
  if(st.beard==='stub')for(let x=22;x<=42;x++)for(let y=37;y<=43;y++)if((x+y)%2===0&&Math.hypot((x-32)/9.5,(y-39.5)/5)<1&&!(y===40&&x>=28&&x<=35))pb.set(x,y,shade(t.hair,.1));
  if(st.beard==='full'||st.beard==='long'){const L=st.beard==='long'?12:6,BR=ramp(st.beard==='long'?'#ececf2':t.hair);
    pb.ell(32,40+L/3,11.5,5+L/2,(x,y)=>y>36?(x>37?BR[1]:x<26?BR[3]:BR[2]):null);pb.rect(26,36,12,3,BR[2]);pb.rect(29,40,6,1,'#5a2a2a');for(let k=0;k<4;k++)pb.line(25+k*4,43,26+k*4,46+L/2,BR[1])}
  if(st.beard==='mous'){pb.rect(26,37,12,2,HR[2]);pb.set(25,39,HR[2]);pb.set(38,39,HR[2]);pb.set(27,37,HR[3])}
  // 앞머리 (결과 하이라이트)
  const Hs=st.hs;
  if(Hs!=='bald'){pb.ell(32,20,15,10.5,(x,y)=>y<22?(x>40?R2[1]:x<24?R2[3]:R2[2]):null);
    for(let x=18;x<=46;x++){const sp=Hs==='spiky'?4:Hs==='messy'?3:2,yy=20+((x*7)%5<2?sp:(x*3)%4===0?1:0)+(Hs==='side'&&x<30?-2:0);for(let y=17;y<=yy;y++)pb.set(x,y,x>41?R2[1]:R2[2])}
    pb.rect(18,19,3,9,R2[2]);pb.rect(43,19,3,9,R2[1]);
    [[24,11,26,15],[37,11,38,14]].forEach(([a,b,c,d])=>pb.line(a,b,c,d,R2[3]));pb.line(21,13,27,10,R2[4]);pb.set(28,10,R2[4]);
    if(Hs==='spiky')for(let k=0;k<6;k++)pb.poly([[17+k*5,16],[20+k*5,5+((k*3)%4)],[23+k*5,16]],k>4?R2[1]:R2[2]);
    if(Hs==='messy')[[20,13],[28,10],[36,11],[43,14]].forEach(([x,y])=>pb.poly([[x-3,y+5],[x,y-1],[x+3,y+5]],R2[2]));
    if(Hs==='bun'){pb.ell(32,9,6,5,(x,y)=>x>34?R2[1]:R2[3]);pb.line(29,7,33,6,R2[4])}
    if(Hs==='long'){pb.rect(16,22,4,22,HR[2]);pb.rect(44,22,4,22,HR[1]);pb.line(17,24,17,40,HR[3])}}
  else{pb.rect(17,22,3,8,HR[2]);pb.rect(44,22,3,8,HR[1]);pb.ell(32,19,12.5,7,(x,y)=>y<22?(x<28?SR[3]:SR[2]):null);pb.rect(25,13,3,2,SR[4])}
  // 모자 · 소품
  switch(t.hat){
    case'helmet':{const Y=ramp('#e8b13a');pb.ell(32,20,16,11,(x,y)=>y<21?(x>40?Y[1]:x<24?Y[3]:Y[2]):null);pb.rect(14,20,36,3,Y[1]);pb.rect(15,20,34,1,Y[2]);pb.rect(22,11,4,2,Y[4]);
      pb.ell(32,14,4,3.5,'#5a5a64');pb.ell(32,14,2.6,2.2,'#fff6c8');pb.set(31,13,'#ffffff');break}
    case'scarf':{const Q=ramp(t.hatC||'#9a6aaa');pb.ell(32,20,16.5,12,(x,y)=>y<24?(x>40?Q[1]:x<24?Q[3]:Q[2]):null);pb.rect(16,20,4,13,Q[2]);pb.rect(44,20,4,13,Q[1]);for(let x=19;x<46;x+=5){pb.set(x,15,Q[4]);pb.set(x+2,18,Q[4])}break}
    case'goggles':{pb.rect(17,19,30,3,'#4a3a2a');[[22,16],[35,16]].forEach(([x,y])=>{pb.rect(x,y,8,7,'#8a7a5a');pb.rect(x+1,y+1,6,5,'#7cc8ff');pb.rect(x+1,y+1,2,2,'#e8f8ff');pb.set(x+5,y+4,'#5aa8e0')});break}
    case'cap':{const G=ramp('#3f8a5a');pb.ell(33,18,15,9.5,(x,y)=>y<21?(x>41?G[1]:G[2]):null);pb.rect(10,20,18,3,G[1]);pb.rect(11,20,16,1,G[3]);pb.set(33,9,G[4]);pb.line(26,12,32,10,G[3]);break}
    case'hairpin':pb.rect(40,17,5,4,'#c28cf4');pb.set(41,17,'#f4e0ff');pb.set(42,18,'#ffffff');pb.set(44,20,'#8a5ac8');break;
    case'tophat':{pb.rect(20,0,24,16,(x)=>x>38?'#14141e':'#22222e');pb.rect(20,13,24,3,'#a03a3a');pb.rect(14,16,36,4,'#1a1a28');pb.rect(22,2,2,10,'#3a3a4e');break}
    case'bandana':{const B=ramp('#c0402a');pb.ell(32,18,15.5,9.5,(x,y)=>y<21?(x>40?B[1]:B[2]):null);[[22,14],[31,15],[39,13],[27,11]].forEach(([x,y])=>pb.set(x,y,'#ffe0d0'));pb.poly([[46,18],[54,14],[53,24]],B[1]);pb.poly([[46,19],[52,22],[47,25]],B[2]);break}
    case'hood':{pb.ell(32,19,18,12,(x,y)=>y<23?(x>43?'#3a2c58':'#4a3a6a'):null);pb.rect(14,19,5,25,'#4a3a6a');pb.rect(45,19,5,25,'#3a2c58');pb.line(15,22,15,42,'#5a4a7a');break}
    case'wizard':{const Wz=ramp('#2a2a6a');pb.poly([[15,20],[49,20],[38,-3]],(x,y)=>x>38?Wz[1]:Wz[2]);pb.rect(11,19,42,4,Wz[3]);pb.rect(11,22,42,1,Wz[1]);[[29,11],[35,5],[26,16]].forEach(([x,y])=>{pb.set(x,y,'#ffe9a8');pb.set(x-1,y,'#c8b070');pb.set(x+1,y,'#c8b070');pb.set(x,y-1,'#c8b070')});break}}
  if(st.glasses||t.hat==='glasses'){E.forEach(([x,y])=>{for(let a=0;a<6.28;a+=.22)pb.set(x+2+Math.cos(a)*4.8,y+2.5+Math.sin(a)*4.4,'#3a3040')});pb.rect(27,EY+2,7,1,'#3a3040');pb.set(20,EY-1,'#ffffff')}
  if(st.mono){for(let a=0;a<6.28;a+=.22)pb.set(40.5+Math.cos(a)*4.8,31.5+Math.sin(a)*4.8,'#e8c060');pb.line(42,35,44,46,'#e8c060')}
  pb.outline(out);
  const bg=document.createElement('canvas');bg.width=W;bg.height=W;const g=bg.getContext('2d'),gr=g.createRadialGradient(32,24,6,32,32,46);
  gr.addColorStop(0,hide?'#2a2018':shade(t.coat,-.3));gr.addColorStop(1,hide?'#120c08':shade(t.coat,-.76));g.fillStyle=gr;g.fillRect(0,0,W,W);
  const fg=pb.canvas(1);if(hide){const x=fg.getContext('2d');x.globalCompositeOperation='source-in';x.fillStyle='#3a2c20';x.fillRect(0,0,W,W)}
  g.drawImage(fg,0,0);if(hide){g.fillStyle='#b29c80';g.font='bold 18px sans-serif';g.textAlign='center';g.fillText('?',32,40)}
  cvP.width=W;cvP.height=W;const c2=cvP.getContext('2d');c2.imageSmoothingEnabled=false;c2.clearRect(0,0,W,W);c2.drawImage(bg,0,0)}
