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
  $('towerSum').innerHTML=`<span class="big">${big(f)}층</span><span class="dim">${sec?`${sec.n} (${sec.from}~${sec.to}층)`:f>=99?'하늘 너머':''}</span>
    <span>판매가 보너스 <b class="good">+${Math.min(f,99)}%</b></span>
    <span>입주자 ${BON.done}/13 · 월세 시간당 ${big(rps*3600)}G</span>
    <div class="row-btns" style="margin-top:2px"><button class="px-btn ${S.rentAcc>=1?'lamp':''}" id="rentBtn" type="button" ${S.rentAcc<1?'disabled':''}>월세 받기 ${S.rentAcc>=1?big(S.rentAcc)+'G':''}</button></div>`;
  let card='';
  if(towerBlocked()){const ok=cnt('philo')>=1&&cnt('starshard')>=10;
    card=`<h2>천공의 용광로</h2><p class="dim">하늘에 가장 가까운 용광로. 마지막 합성으로 별을 하늘로 돌려보낼 수 있어요.</p>
    <div class="matl">${ico('philo')}<span>현자의 원석</span><span class="${cnt('philo')>=1?'ok':'no'}">${cnt('philo')}/1</span></div><div class="matl">${ico('starshard')}<span>별의 파편</span><span class="${cnt('starshard')>=10?'ok':'no'}">${cnt('starshard')}/10</span></div>
    <div class="row-btns"><button class="px-btn lamp grow" id="finaleBtn" type="button" ${ok?'':'disabled'}>별을 돌려보내기</button></div>`}
  else{const c=floorCost(f+1),ok=canBuild(c);
    card=`<h2>${f+1}층 짓기 <small>${i>=0?SECTIONS[i].n:'하늘 너머'}</small></h2>`+c.mats.map(([id,q])=>`<div class="matl">${ico(id)}<span>${S.seen.includes(id)?ITEMS[id].n:'???'}</span><span class="${cnt(id)>=q?'ok':'no'}">${big(cnt(id))}/${big(q)}</span></div>`).join('')+
    `<div class="matl"><i class="ico ic-goldbar"></i><span>골드</span><span class="${S.gold>=c.gold?'ok':'no'}">${big(c.gold)}G</span></div>
    <div class="row-btns"><button class="px-btn lamp grow" id="buildBtn" type="button" ${ok?'':'disabled'}>한 층 쌓기</button><button class="px-btn" id="buildMaxBtn" type="button" ${ok?'':'disabled'}>가능한 만큼</button></div>
    <div class="row-btns"><button class="px-btn grow" id="buyMissBtn" type="button">부족한 재료 장터에서 사기</button></div>
    <p class="dim small" style="margin:8px 0 0">5층마다 축하금 · 구간을 완공하면 새 입주자가 들어와요</p>`}
  if(TH.card!==card){$('floorCard').innerHTML=card;TH.card=card}
  const sh=SECTIONS.map((s,k)=>{const dn=f>=s.to,cur=!dn&&f>=s.from-1,pct=clamp((f-s.from+1)/(s.to-s.from+1),0,1);
    return`<div class="sect ${dn?'done':cur?'cur':'lock'}" data-sec="${k}" role="button" tabindex="0" aria-label="${s.n} ${dn?s.t.name:'빈 구간'} 자세히 보기"><canvas data-por="${k}" width="24" height="24"></canvas><div><div class="tn">${s.n} <span class="dim">${s.from}~${s.to}층</span></div>
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
/* 입주자 초상 (24×24) */
function drawPortrait(cvP,t,hide){const pb=new PB(24,24),skin='#f4c8a0',out='#1a120c';
  pb.rect(0,0,24,24,hide?'#1a140e':'#3a2a20');pb.rect(4,17,16,7,hide?'#2a2018':t.coat);pb.ell(12,11,6.5,6.5,hide?'#2a2018':skin);
  if(!hide){pb.rect(7,10,1,2,out);pb.rect(14,10,1,2,out);pb.set(10,14,'#c07a60');pb.set(11,14,'#c07a60');pb.set(6,13,'#e8907a');pb.set(16,13,'#e8907a');
    const h=t.hair;pb.ell(12,6,7,3.5,h);pb.rect(5,6,2,5,h);pb.rect(17,6,2,5,h);
    switch(t.hat){case'helmet':pb.ell(12,5,7.5,4,'#e8b13a');pb.rect(4,6,16,2,'#b07a1e');pb.rect(11,3,2,2,'#fff6c8');break;
      case'scarf':pb.ell(12,5,8,4.5,'#9a6aaa');pb.rect(4,15,16,2,'#9a6aaa');break;
      case'goggles':pb.rect(5,6,14,2,'#4a3a2a');pb.rect(7,5,4,3,'#7cc8ff');pb.rect(13,5,4,3,'#7cc8ff');break;
      case'beard':pb.ell(12,16,5,3.5,h);pb.rect(8,14,8,2,h);break;
      case'cap':pb.ell(12,5,7,3,'#3f8a5a');pb.rect(3,6,9,2,'#2a6a3a');break;
      case'hairpin':pb.rect(16,4,3,2,'#c28cf4');pb.rect(4,8,2,8,h);pb.rect(18,8,2,8,h);break;
      case'glasses':pb.rect(6,9,4,3,null);pb.rect(6,9,4,1,'#2a2a2a');pb.rect(13,9,4,1,'#2a2a2a');pb.rect(10,10,3,1,'#2a2a2a');break;
      case'tophat':pb.rect(7,0,10,5,'#1a1a2a');pb.rect(5,5,14,1,'#1a1a2a');pb.rect(7,4,10,1,'#a03a3a');break;
      case'bandana':pb.ell(12,5,7.5,3.5,'#c0402a');pb.rect(18,6,3,2,'#c0402a');break;
      case'hood':pb.ell(12,8,9,8,(x,y)=>y<9||x<6||x>17?'#4a3a6a':null);break;
      case'wizard':pb.poly([[5,6],[19,6],[13,-2]],'#2a2a6a');pb.set(13,1,'#ffe9a8');pb.rect(4,6,16,1,'#3a3a8a');break}}
  else{pb.rect(10,9,4,4,'#4a3a2a');pb.set(11,13,'#4a3a2a');pb.set(11,15,'#4a3a2a')}
  pb.outline(out);const c2=cvP.getContext('2d');c2.clearRect(0,0,24,24);c2.drawImage(pb.canvas(1),0,0)}
