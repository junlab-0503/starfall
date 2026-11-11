// 코드로 그린 그림(사용자가 준 그림 제외)을 전부 PNG로 뽑기 → 업그레이드용 참고 자료
// 사용: python3 tools/build.py 후  node tools/export_procedural.js dist/starfall.html exports/procedural
// 각 그림은 "원본" 크기(게임 화면에 실제로 찍히는 픽셀)와 "_x4"(4배 확대, 보기용) 두 장
const {chromium,devices}=require('playwright');const fs=require('fs'),path=require('path');
const OUT=process.argv[3];
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['iPhone 13'],deviceScaleFactor:1});const p=await ctx.newPage();
await p.goto('file://'+path.resolve(process.argv[2]));await p.waitForTimeout(800);
if(await p.isVisible('#titleScr'))await p.click('#titleScr');await p.waitForTimeout(200);
for(let i=0;i<12&&await p.isVisible('#storyNext');i++){await p.click('#storyNext');await p.waitForTimeout(60)}
if(await p.isVisible('#entry')){await p.waitForTimeout(500);await p.click('#entry');await p.waitForTimeout(800)}
await p.evaluate(()=>{S.tutDone=true;S.unlocked=LAYERS.length;S.journal=LAYERS.map((L,i)=>i);ORDER.forEach(id=>{if(!S.seen.includes(id))S.seen.push(id)});S.auto=3;S.autoOn=true;renderAll()});
for(let i=0;i<5&&await p.isVisible('#storyNext');i++)await p.click('#storyNext');
const shots={};
// 1) 채굴 화면 예시(지층 B1 · B7 · B13): 굴 · 버팀목 · 등불 · 주인공이 함께 보이는 실제 화면
for(const L of [0,6,12]){await p.evaluate(L=>{setLayer(L);S.digs[L]=9;camInit=false;S.tab='mine';$('story').hidden=true},L);await p.waitForTimeout(1500);
  shots[`1_굴(땅 판 흔적)/화면예시_B${L+1}`]=await p.evaluate(()=>$('scene').toDataURL())}
// 지층 그림이 다 불러와지게
await p.evaluate(async()=>{for(let L=0;L<LAYERS.length;L++)strata(L);await new Promise(r=>setTimeout(r,1500))});
// 나머지는 채굴 화면을 멈추고(다른 탭) 따로 캔버스에 그림
const res=await p.evaluate(()=>{S.tab='manage';const out={},K=2,cw=STX*K,ch=33*K,sy=STY*K;
  const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]};
  const put=(k,c)=>out[k]=c.toDataURL();
  const RRof=L=>ramp((strata(L)||{}).rock||LOOK[L].rock);
  // 굴 한 칸(지층마다 바위 평균색으로 물듦): 천장 그림자 · 매달린 바위 · 발판 · 윤곽 · 계단 턱
  // (굴 안쪽 어두운 면은 사용자 그림이라 여기선 짙은 갈색 단색으로 채움)
  LAYERS.forEach((Ly,L)=>{const[c,x]=mk(cw+8,ch+sy+8);x.fillStyle='#1a120c';x.fillRect(4,sy+4,cw,ch);tdCell(x,RRof(L),1,L,2,4,sy+4,sy+4+ch,cw,ch,sy);put(`1_굴(땅 판 흔적)/굴한칸_B${L+1}_${Ly.n}`,c)});
  // 계단처럼 이어진 굴 흔적(6칸, B1 색)
  {const n=6,[c,x]=mk(cw*n+8,ch+sy*n+8);x.fillStyle='#1a120c';for(let j=0;j<n;j++)x.fillRect(4+j*cw,4+sy*(n-1-j)+sy,cw,ch);for(let j=0;j<n;j++){const i=n-1-j;tdCell(x,RRof(0),i,0,n-1,4+j*cw,4+sy*(n-1-j)+sy,4+sy*(n-1-j)+sy+ch,cw,ch,sy)}put('1_굴(땅 판 흔적)/굴흔적_6칸계단_B1',c)}
  // 같은 6칸 + 버팀목 · 등불 자리(게임처럼 4칸 · 6칸마다)
  {const n=6,[c,x]=mk(cw*n+8,ch+sy*n+8),cells=[];for(let j=0;j<n;j++){const i=n-1-j;cells.push([i,4+j*cw,4+sy*(n-1-j)+sy,4+sy*(n-1-j)+sy+ch])}
    x.fillStyle='#1a120c';cells.forEach(([i,x0,c0,f0])=>x.fillRect(x0,c0,cw,ch));cells.forEach(([i,x0,c0,f0])=>tdCell(x,RRof(0),i,0,n-1,x0,c0,f0,cw,ch,sy));
    cells.forEach(([i,x0,c0,f0])=>{if(i===1)tdSupport(x,x0,c0,f0,cw,ch);if(i===3)tdLamp(x,x0,c0,cw,i,0)});put('1_굴(땅 판 흔적)/굴흔적_6칸_버팀목·등불_B1',c)}
  // 버팀목 · 나무 기둥
  {const[c,x]=mk(cw+4,ch+4);tdSupport(x,2,4,4+ch,cw,ch);put('2_버팀목·나무기둥/버팀목',c)}
  {const[c,x]=mk(14,ch+2);tdPost(x,4,1,1+ch,ch);put('2_버팀목·나무기둥/나무기둥_하나',c)}
  // 등불
  {const[c,x]=mk(cw,40);tdLamp(x,0,0,cw,3,0,true);put('3_등불/등불',c)}
  {const[c,x]=mk(cw+44,92);tdLamp(x,22,26,cw,3,0);put('3_등불/등불_빛포함',c)}
  // 지층 장식(그 지층 굴 안에 그려지는 작은 것들): 6칸씩, 월드 좌표를 2배로
  const types=[...new Set(LOOK.map(l=>l.deco))].filter(t=>t!=='none');
  types.forEach(tp=>{const L=LOOK.findIndex(l=>l.deco===tp),[c,x]=mk(6*STX*K,60*K);x.setTransform(K,0,0,K,0,0);const s0=S.layer;S.layer=L;
    for(let j=0;j<6;j++){const i=tp==='grass'?-j:j+1;decoCell(tp,i,j*STX+STX/2,46,0,x)}S.layer=s0;put(`4_지층장식/${tp}_B${L+1}`,c)});
  // 숯(고양이) · 드릴 로봇 · 바닥 선물 상자: 월드 1px = 화면 2px
  ['sit','tail','sleep'].forEach(f=>{const s=catSprite(f),[c,x]=mk(s.width*K,s.height*K);x.drawImage(s,0,0,c.width,c.height);put(`5_숯·드릴로봇/숯_${({sit:'앉기',tail:'꼬리',sleep:'잠'})[f]}`,c)});
  ['on','off','full'].forEach(st=>[0,1,2].forEach(ph=>{const s=botSprite(st,ph),[c,x]=mk(s.width*K,s.height*K);x.drawImage(s,0,0,c.width,c.height);put(`5_숯·드릴로봇/드릴로봇_${({on:'켜짐',off:'꺼짐',full:'가득'})[st]}_${ph+1}`,c)}));
  {const[c,x]=mk(8*K,9*K);x.setTransform(K,0,0,K,0,0);floorGift(x,0,2);put('5_숯·드릴로봇/바닥_선물상자',c)}
  // 채굴 화면 UI 아이콘(보관함 · 숯의 선물 · 2배)
  Object.entries({box:'로봇보관함',gift:'숯의선물',ff:'채굴2배'}).forEach(([k,n])=>put(`6_UI아이콘/${n}`,UI_IC[k]().canvas(1)));
  // 아래 탭 아이콘(16px)
  const css=[...document.querySelectorAll('style')].map(s=>s.textContent).join('');const NM={mine:'채굴',equip:'장비',forge:'재련',market:'장터',tower:'탑',manage:'관리'};
  for(const m of css.matchAll(/\.ni-(\w+)\{background-image:url\((data:image\/png;base64,[^)]+)\)\}/g))out[`6_UI아이콘/탭_${NM[m[1]]||m[1]}`]=m[2];
  // 광물 아이콘(32px)
  ORDER.forEach(id=>{const it=ITEMS[id],g2=it.L?'원석':INS[id]?'재련품':'기타';put(`7_광물아이콘/${g2}/${it.n}`,drawIcon(id,32).canvas(1))});
  // 탑 그림(탑 탭)
  const f0=S.floors,e0=S.ended;[[0,0],[15,0],[50,0],[99,0],[99,1]].forEach(([f,e])=>{S.floors=f;S.ended=!!e;refreshBonus();towerKey='';drawTower();put(`8_탑그림/탑_${f}층${e?'_엔딩':''}`,$('towerCv'))});S.floors=f0;S.ended=e0;refreshBonus();
  // 이장 할머니 초상화(코드로 그린 것, 튜토리얼 얼굴)
  put('9_이장할머니/이장할머니_초상화',$('tutPor'));
  return out});
Object.assign(shots,res);
fs.mkdirSync(OUT,{recursive:true});let n=0;
for(const[k,url]of Object.entries(shots)){const f=path.join(OUT,k+'.png');fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,Buffer.from(url.split(',')[1],'base64'));n++}
console.log(n,'images');await b.close()})();
