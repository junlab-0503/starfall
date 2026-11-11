/* ═════════ 채굴 장면 (옆에서 본 굴) ═════════
 저해상도 캔버스에 그리고 픽셀 그대로 키운다. 주인공은 왼쪽 암벽을 파고, 굴은 오른쪽 위에서부터 계단처럼 이어진다.
 암벽에 박힌 광석이 다음에 나올 광물이다. */
const cv=$('scene'),g=cv.getContext('2d'),SCENE_G=g;
let IW=0,IH=0,SC=3;   // IW·IH = 보이는 월드 크기(월드 1px = 화면 SC px). 캔버스는 화면 해상도(IW·SC)로 → 그림은 2배 촘촘
const STX=24,STY=9,SL=STY/STX,REACH=34; // 굴 한 칸의 가로/세로 이동, 바닥 기울기, 주인공 발 → 곡괭이가 막장에 닿는 거리(화면 px)
const SWH={w:360,h:500};   // 채굴 화면 크기(떠오르는 글씨 자리 계산용)
function sceneResize(){fitScene();const el=cv.parentElement,r={width:el.clientWidth,height:el.clientHeight};if(!r.width)return;SWH.w=r.width;SWH.h=r.height;   // 테두리 안쪽 크기(캔버스가 늘어나 번지지 않게)
  SC=2;cv.width=Math.round(r.width);cv.height=Math.round(r.height);IW=cv.width/SC;IH=cv.height/SC;g.imageSmoothingEnabled=false}   // 캔버스 = 화면 크기 그대로(모서리 장식이 딱 붙게)
addEventListener('resize',()=>{IW=0});
function fitScene(){}
if(window.ResizeObserver)new ResizeObserver(()=>{IW=0}).observe($('sceneWrap'));
/* 지층 그림(art/strata, 사용자 그림): 배경 = 안 판 채굴층 바위(r, 이음매 없이 반복, 원본 크기 그대로), 판 자리(굴 안) = 판 버전의 어두운 안쪽(m_d) */
const STRATA={};
function strata(L){const o=STRATA[L]||(STRATA[L]={});if(o.ok)return o;if(o.wait)return null;o.wait=1;const n=L+1,keys=['r'+n,'dg'+n].filter(k=>ART['strata_'+k]);let left=keys.length;
  keys.forEach(k=>{const im=new Image();im.onload=()=>{if(!--left)buildStrata(L,o)};im.src=ART['strata_'+k];o[k.replace(/\d+/,'')]=im});return null}
function cvs(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]}
function mirror(im){const w=im.width,h=im.height,[c,x]=cvs(w*2,h*2);x.drawImage(im,0,0);x.save();x.scale(-1,1);x.drawImage(im,-w*2,0);x.restore();
  x.save();x.scale(1,-1);x.drawImage(c,0,0,w*2,h,0,-h*2,w*2,h);x.restore();return c}   // 위아래 · 좌우로 뒤집어 이어 붙임(이음매 없게)
function buildStrata(L,o){o.rockC=o.r;o.prock=g.createPattern(o.r,'repeat');
  if(o.dg){const W=o.dg.width,H=o.dg.height,[c,x]=cvs(W,H);x.drawImage(o.dg,0,0);const im=x.getImageData(0,0,W,H),rim=new ImageData(W,H),cave=new ImageData(W,H);   // 알파 255 = 굴 안, 200 = 둘레
    for(let p=0;p<im.data.length;p+=4){const a=im.data[p+3];if(!a)continue;for(let k=0;k<3;k++){rim.data[p+k]=im.data[p+k];if(a>230)cave.data[p+k]=im.data[p+k]}rim.data[p+3]=255;if(a>230)cave.data[p+3]=255}
    const[c1,x1]=cvs(W,H);x1.putImageData(rim,0,0);const[c2,x2]=cvs(W,H);x2.putImageData(cave,0,0);o.dg=c1;o.dc=c2}
  o.ok=1}
const GOLD={};
function goldStrata(){if(GOLD.ok)return GOLD;if(!GOLD.im&&ART.strata_gold){GOLD.im=Object.assign(new Image(),{src:ART.strata_gold});GOLD.im.onload=()=>{GOLD.c=GOLD.im;GOLD.p=g.createPattern(GOLD.im,'repeat');const[c,x]=cvs(GOLD.im.width,GOLD.im.height);x.drawImage(GOLD.im,0,0);x.fillStyle='rgba(10,6,3,.7)';x.fillRect(0,0,c.width,c.height);GOLD.dc=c;GOLD.pd=g.createPattern(c,'repeat');GOLD.ok=1}}return null}
// 사용자 그림 스프라이트(art/sprites, 화면 픽셀 크기)
const SPR={};const spr=k=>{if(!SPR[k]&&ART['spr_'+k])SPR[k]=Object.assign(new Image(),{src:ART['spr_'+k]});const im=SPR[k];return im&&im.complete&&im.naturalWidth?im:null};
// 캔버스 좌표로 무늬 채우기: (ax,ay)에 무늬 원점을 두고 사각형을 채움
function fillPat(p,tw,th,ax,ay,x,y,w,h){const ox=((Math.round(ax)%tw)+tw)%tw,oy=((Math.round(ay)%th)+th)%th;g.save();g.translate(ox,oy);g.fillStyle=p;g.fillRect(x-ox,y-oy,w,h);g.restore()}
const digOf=L=>S.digs[L]||0;
let camX=0,camY=0,camInit=false;
const A={joy:0,yawn:0,yawnT:9,sw:-1,step:0,stepT:0,bobT:0,blinkT:2.5,blink:0,shake:0,crackSeed:1,head:0,autoT:0,autoPh:0,botPh:0};
let PARTS=[],FLY=[];
const DUST=Array.from({length:26},()=>({x:Math.random()*400,y:Math.random()*400,v:.3+Math.random()*.7}));
let LMASK=null,LMK='';
function lightMask(){const dim=LOOK[S.layer].dim+(S.ended?-.08:0),k=IW+'x'+IH+'_'+dim.toFixed(2);if(LMK===k)return LMASK;LMK=k;
  const W=Math.ceil(IW*2)+2,H=Math.ceil(IH*2)+2,c=document.createElement('canvas');c.width=W;c.height=H;const t=c.getContext('2d'),img=t.createImageData(W,H),R=Math.max(IW,IH)*.95,cx=W/2,cy=H/2;
  // 계단식 고리(4단계, 점무늬 없이): 그림 위에 점무늬가 끼지 않게
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const d=Math.hypot(x-cx,(y-cy)*1.1)/R,lv=clamp((d-.22)/.55,0,1),q=Math.ceil(lv*4)/4,a=lv>=1?dim*.95+.05:dim*.9*q;
    const o=(y*W+x)*4;img.data[o]=6;img.data[o+1]=4;img.data[o+2]=10;img.data[o+3]=Math.round(a*255)}
  t.putImageData(img,0,0);LMASK=c;return c}
const charW=()=>({x:-digOf(S.layer)*STX,y:digOf(S.layer)*STY}); // 발 위치(월드)
function crackPaths(){const R=rng(A.crackSeed),out=[];for(let k=0;k<5;k++){let x=0,y=-6-R()*16;const p=[[x,y]];for(let j=0;j<7;j++){x-=1+R()*2.2;y+=(R()-.5)*4;p.push([x,y])}out.push(p)}return out}
let CRACKS=crackPaths();
function oreBlobs(){const R=rng(A.crackSeed*7+3),out=[];for(let i=0;i<4;i++)out.push([-3-R()*10,-6-R()*20,1.6+R()*1.8]);return out}
let BLOBS=oreBlobs();
function newWall(){A.crackSeed=(Math.random()*1e9)|0;CRACKS=crackPaths();BLOBS=oreBlobs();if(!S.next)S.next=rollDrop(S.layer)}
function swing(){A.sw=0}
function full(){return space()<=0}
const HERO={img:null};if(typeof ART!=='undefined'&&ART.hero&&typeof HERO_META!=='undefined'){const im=new Image();im.onload=()=>{HERO.img=im};im.src=ART.hero}
// 곡괭이질 7장: 들어 올림 → 머리 위 → 내려찍기 → 부딪힘 → 따라가기 → 거두기. 쉬기 · 걷기 · 기쁨 · 하품 · 창고 가득(누워 쉬기)
function heroFrameKey(sit,t){if(sit)return'sleep';if(A.sw>=0){const s=A.sw;return s<.2?'sw0':s<.4?'sw1':s<.5?'sw2':s<.62?'sw3':s<.8?'sw4':'sw5'}
  if(A.joy>0)return A.joy>.45?'joy':'happy';if(A.stepT>0)return'walk'+((t*14|0)%6);if(A.yawn>0)return'yawn';return(A.idleT||9)<.9?'ready':'rest'} // 휘두른 직후엔 곡괭이를 든 채, 조금 지나면 똑바로 서 있기
function doTap(){
  if(full()&&!(ul('autosell')&&autoSellRoom())){A.head=.5;floatText('창고가 가득 찼어요!','#ff8a7a');return}
  swing();let d=tapPower();if(Math.random()<critP()){d*=3;A.shake=3;const w=charW();for(let i=0;i<10;i++)PARTS.push({x:w.x-10,y:w.y-14,vx:-30+Math.random()*60,vy:-60-Math.random()*50,life:.6,c:'#fff2b0',sz:1,star:Math.random()<.4});floatText('크게!','#ffd36a')}
  applyDmg(d,false);veinGold(1/40,true);
}
// 알뜰 정리(셈): 창고가 가득 차면 가장 싼 원석을 팔아 자리를 만든다
let autoSellT=0;
function autoSellRoom(){const ids=ORDER.filter(id=>cnt(id)>0&&ITEMS[id].L).sort((a,b)=>bid(a)-bid(b));if(!ids.length)return false;const id=ids[0],k=Math.min(cnt(id),Math.max(1,Math.ceil(cap()*.05)));
  const t=sell(id,k);if(!t)return false;if(performance.now()-autoSellT>4000){autoSellT=performance.now();log(`셈이 ${ITEMS[id].n} ${k}개를 팔아 자리를 만들었어요: +${big(t)}G`)}invDirty=true;return space()>0}
function applyDmg(d,auto){
  S.hp-=d;const w=charW(),wx=w.x-10,wy=w.y-14;
  const T=PICK_TIERS[pickTier()][3],L=LOOK[S.layer];
  if(!auto){for(let i=0;i<6;i++)PARTS.push({x:wx,y:wy+(Math.random()-.5)*6,vx:-10+Math.random()*60,vy:-40-Math.random()*40,life:.9,c:Math.random()<.5?L.spec[0]:L.rock,sz:i<2?2:1,grav:1});tierFx(T,wx,wy);A.shake=Math.max(A.shake,1)}
  else for(let i=0;i<2;i++)PARTS.push({x:wx+2,y:w.y-4,vx:Math.random()*40,vy:-30-Math.random()*30,life:.35,c:'#ffe9a8',sz:1});
  if(S.hp<=0)breakWall(auto);
}
function tierFx(T,x,y){const add=(n,c,o)=>{for(let i=0;i<n;i++)PARTS.push(Object.assign({x,y,vx:(Math.random()-.3)*90,vy:-30-Math.random()*70,life:.45,c,sz:1},o||{}))};
  if(T==='dust')add(4,'#c9b49a',{vy:-15,life:.6,sz:2});
  if(T==='spark')add(5,'#ffb35c');
  if(T==='spark2'){add(7,'#fff2b0');add(3,'#ffb35c')}
  if(T==='trail'){add(6,'#d7a8ff');add(3,'#ffffff',{life:.3})}
  if(T==='ember'){add(8,'#ff7a3d',{vy:-60});add(4,'#ffd36a')}
  if(T==='star'){add(8,'#fff6c8',{star:1,life:.7});add(4,'#bfe0f6')}}
function breakWall(auto){
  const L=S.layer,hp=layerHp(L);let n=0;const got={};
  if(auto&&!S.tutDone&&L===0){S.hp=hp;got.stone=1}   // 튜토리얼 동안 드릴 로봇은 돌만(새 광석은 직접 캐서 발견하게)
  const td=!auto&&!S.tutDone&&L===0&&S.tutBrk<TUT_DROPS.length?TUT_DROPS[S.tutBrk]:null;   // 튜토리얼: 정해진 광석(탑 1층 재료가 바로 모이게)
  if(td){S.hp=hp;S.tutBrk++;got[td]=td==='stone'?2:1}
  else if(!got.stone||!auto)while(S.hp<=0&&n<400){S.hp+=hp;n++;const id=n===1?(S.next||rollDrop(L)):rollDrop(L);got[id]=(got[id]||0)+1+(Math.random()<extraP(ITEMS[id].s)?1:0)}
  const w=charW();
  for(let i=0;i<14;i++)PARTS.push({x:w.x-14+Math.random()*8,y:w.y-24+Math.random()*22,vx:(Math.random()-.8)*80,vy:-40-Math.random()*60,life:1.3,c:Math.random()<.4?ITEMS[S.next||'stone'].c:LOOK[L].rock,sz:2,grav:1});
  // 황금 광맥이 나타난 동안엔 광석 대신 골드만(골드는 탭 · 드릴이 veinGold로 캠)
  if(veinOn()){for(let i=0;i<10;i++)PARTS.push({x:w.x-12+Math.random()*8,y:w.y-20+Math.random()*16,vx:(Math.random()-.8)*70,vy:-50-Math.random()*50,life:.8,c:'#ffd23f',sz:2,grav:1,star:Math.random()<.4})}
  else for(const id in got)gain(id,got[id],auto);
  rumorClue(L);S.digs[L]=digOf(L)+1;A.stepT=.3;A.shake=2;S.next=!S.tutDone&&L===0&&S.tutBrk<TUT_DROPS.length?TUT_DROPS[S.tutBrk]:rollDrop(L);newWall();
  if(!S.journal.includes(0)&&S.mined>=1)revealJournal(0);
}
// 캔 광석: 창고 → (드릴 로봇이면) 로봇 보관함 → 넘치면 판매
let ofFxT=0;
function gain(id,n,auto){S.mined+=n;if(!S.seen.includes(id))A.joy=.9;if(!auto&&space()<n&&ul('autosell'))autoSellRoom();let ok=Math.min(n,space());
  if(ok<n){let rest=n-ok;if(auto){const b=Math.min(rest,Math.max(0,boxCap()-boxUsed()));if(b>0){boxAdd(id,b);rest-=b}const g=sellOverflow(id,rest);if(g&&performance.now()-ofFxT>1500){ofFxT=performance.now();floatText(`넘친 광석 판매 +${big(g)}G`,'#ffd36a')}}else S.lost=(S.lost||0)+rest}if(ok>0){add(id,ok);invDirty=true;const w=charW();FLY.push({id,x0:w.x-12,y0:w.y-18,t:0});floatText(`+${ok} ${ITEMS[id].n}`,'#fff',id)}}
let FLOATS=[];
function floatText(t,c,id){const wrap=$('sceneWrap');const ex=id&&FLOATS.find(f=>f.id===id&&f.life>.3);
  if(ex){ex.n+=id==='$g'?ex.add:1;ex.el.querySelector('b').textContent=id==='$g'?`+${big(ex.n)}G`:`+${ex.n} ${ITEMS[id].n}`;ex.life=1.3;ex.pop=.2;FLOATS.splice(FLOATS.indexOf(ex),1);FLOATS.unshift(ex);return}
  const el=document.createElement('div');el.className='ftxt';el.style.color=c;el.innerHTML=(id&&ITEMS[id]?ico(id):'')+`<b>${t}</b>`;wrap.appendChild(el);
  FLOATS.unshift({el,id,n:1,life:1.3,y:0,slot:0,pop:.2});while(FLOATS.length>4){FLOATS.pop().el.remove()}}
function stepFloats(dt){if(!FLOATS.length)return;const w=charW(),H=SWH.h,sx=(w.x-camX)*SC,base=(w.y-40-camY)*SC;   // 크기는 sceneResize 때 재 둔 값(매 프레임 레이아웃 강제 계산 안 함)
  FLOATS.forEach((f,i)=>{f.life-=dt;f.pop=Math.max(0,f.pop-dt);f.slot=i*24;f.y=Math.min(f.y+dt*14,12);
    let y=base-f.y-f.slot;y=clamp(y,62,H-80);const tr=`translate(${Math.round(clamp(sx-30,6,SWH.w-190))}px,${Math.round(y)}px) scale(${(1+f.pop).toFixed(2)})`,op=Math.min(1,f.life*2.2).toFixed(2);if(f.tr!==tr){f.tr=tr;f.el.style.transform=tr}if(f.op!==op){f.op=op;f.el.style.opacity=op}});
  FLOATS=FLOATS.filter(f=>{if(f.life<=0){f.el.remove();return false}return true})}
let invDirty=false;
function update(dt){
  const w=charW(),tx=w.x-IW*.46,ty=w.y-IH*.62;if(!camInit){camX=tx;camY=ty;camInit=true}camX+=(tx-camX)*Math.min(1,dt*6);camY+=(ty-camY)*Math.min(1,dt*6);
  if(A.sw>=0){A.sw+=dt/.26;A.idleT=0;if(A.sw>=1)A.sw=-1}else A.idleT=(A.idleT||0)+dt;
  A.stepT=Math.max(0,A.stepT-dt);A.bobT+=dt;A.blinkT-=dt;if(A.blinkT<0){A.blink=.14;A.blinkT=2+Math.random()*3}A.blink=Math.max(0,A.blink-dt);A.head=Math.max(0,A.head-dt);A.joy=Math.max(0,A.joy-dt);A.yawn=Math.max(0,A.yawn-dt);if(A.sw<0&&!full()){A.yawnT-=dt;if(A.yawnT<0){A.yawn=1.2;A.yawnT=14+Math.random()*12}}else A.yawnT=Math.max(A.yawnT,6);A.shake=Math.max(0,A.shake-dt*8);
  // 자동 드릴
  // 시작 화면 · 광맥 입구 장면이 떠 있는 동안엔 드릴도 기다림
  if(S.auto>0&&S.autoOn&&$('titleScr').hidden&&$('entry').hidden){A.autoT+=dt;A.botPh+=dt*12;while(A.autoT>=.25){A.autoT-=.25;applyDmg(autoDps()*.25,true);veinGold(1/400,false)}}
  PARTS.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.grav?260:140)*dt;p.life-=dt;
    if(p.grav){const fl=w.y+(w.x+6-p.x)*SL-1;if(p.y>fl){p.y=fl;if(p.vy>50){p.vy*=-.3;p.vx*=.6}else{p.vy=0;p.vx*=.7}}}});   // 돌 조각은 굴 바닥에 떨어져 튕기고 잠깐 쌓임PARTS=PARTS.filter(p=>p.life>0);
  FLY.forEach(f=>f.t+=dt);FLY=FLY.filter(f=>f.t<.6);
  stepFloats(dt);
}
/* 배경 캐시: 바위 무늬 + 판 굴 흔적을 화면보다 조금 큰 캔버스 한 장에 그려 두고, 카메라가 움직이는 동안엔 그 한 장만 옮겨 붙인다.
   다시 그리는 때: 한 칸 더 팠을 때 · 지층/황금 광맥/화면 크기가 바뀔 때 · 카메라가 여백(BGM)을 벗어날 때. 그림 · 위치는 예전과 픽셀 단위로 같음 */
const BGC={c:null,x:null,k:'',ax:0,ay:0},BGM=96;
function bgCache(L,st,gv,d,DM,K,CW,CH,bite){
  let ox=Math.round((BGC.ax-camX)*K),oy=Math.round((BGC.ay-camY)*K);
  const key=[L,d,gv?1:0,CW,CH,K,bite].join(),ok=BGC.k===key&&Math.abs(ox)<=BGM-K-2&&Math.abs(oy)<=BGM-2;
  if(!ok){const W=CW+2*BGM,H=CH+2*BGM;if(!BGC.c){[BGC.c,BGC.x]=cvs(W,H)}else if(BGC.c.width!==W||BGC.c.height!==H){BGC.c.width=W;BGC.c.height=H;BGC.x.imageSmoothingEnabled=false}
    const x=BGC.x,ax=Math.floor(camX),ay=Math.floor(camY);BGC.ax=ax;BGC.ay=ay;BGC.k=key;ox=Math.round((ax-camX)*K);oy=Math.round((ay-camY)*K);
    x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,H);
    // 배경: 안 판 바위(카메라와 같이 움직임). 황금 광맥이 나타난 동안은 금맥 바위
    const im=gv?gv.c:st.rockC,tw=im.width,th=im.height,pox=(((-ax*K+BGM)%tw)+tw)%tw,poy=(((-ay*K+BGM)%th)+th)%th;
    x.save();x.translate(pox,poy);x.fillStyle=x.createPattern(im,'repeat');x.fillRect(-pox,-poy,W,H);x.restore();
    // 판 굴: 굴 띠(사용자 그림을 고른 높이로 편 것)를 판 길을 따라 3칸마다 + 지금 파는 칸(막장)에 찍음.
    // 바위 띠까지(dg) 먼저 모두, 굴 안(dc)을 위에 모두 → 한 줄로 이어진 굴. 막장 띠의 왼쪽 끝(둥근 벽)이 주인공 곡괭이 앞. 황금 광맥 동안엔 굴 안만
    // bite: 지금 바위를 캔 만큼 막장이 조금씩 파고듦(굴 안만 왼쪽 아래로 밀어 한 번 더)
    if(st.dg){const RS=Math.round(REACH*SL),sx=i=>(-i*STX+6-ax)*K-REACH-DM[0]+BGM,sy=i=>(i*STY-ay)*K+RS-DM[1]+BGM,TW=st.dg.width,TH=st.dg.height,list=[];
      for(let i=d-((d%3+3)%3||3);i>=d-48&&i>=0;i-=3){const px=sx(i),py=sy(i);if(px>W||py+TH<0)break;if(px+TW<0||py>H)continue;list.push([px,py])}
      list.reverse();list.push([sx(d),sy(d)]);
      if(!gv)list.forEach(([px,py])=>x.drawImage(st.dg,px,py));list.forEach(([px,py])=>x.drawImage(st.dc,px,py));
      if(bite)x.drawImage(st.dc,sx(d)-bite,sy(d)+Math.round(bite*SL))}}
  return{c:BGC.c,ox:ox-BGM,oy:oy-BGM}}
// 바위를 캔 만큼 막장이 파고드는 정도(화면 px, 0 · 4 · 8 · 12)
function digBite(L){return Math.min(3,Math.floor(clamp(1-S.hp/layerHp(L),0,1)*4))*4}
// 발밑 그림자(화면 좌표, 가운데 x · 바닥 y · 폭)
function shadow(cx,y,w){g.fillStyle='rgba(8,4,2,.38)';g.fillRect(Math.round(cx-w/2)+2,y-2,w-4,1);g.fillRect(Math.round(cx-w/2),y-1,w,2);g.fillRect(Math.round(cx-w/2)+2,y+1,w-4,1)}
function draw(t){
  const L=S.layer,lk=LOOK[L],d=digOf(L);
  const sh=A.shake>0?Math.round((Math.random()-.5)*2):0;
  const K=SC,CW=cv.width,CH=cv.height,st=strata(L);g.setTransform(1,0,0,1,sh*K,0);
  // 굴 띠(사용자 그림 dg/dc). DUG_META[L] = [막장 x, 막장 바닥 y, 굴 높이](띠 그림 안 px)
  // 주인공은 막장 바로 앞(곡괭이가 닿는 거리 REACH)에 서고, 캔 만큼(bite) 막장과 함께 조금씩 앞으로
  const w=charW(),DM=(typeof DUG_META!=='undefined'&&DUG_META[L])||[24,120,84],bite=digBite(L),
    hS0=Math.round((w.x+6-camX)*K),fS0=Math.round((w.y-camY)*K),heroS=hS0-bite,fyS=fS0+Math.round(bite*SL),
    faceS=heroS-REACH,ffS=fyS+Math.round(REACH*SL),fx=faceS/K,fy=ffS/K,kk=K/2;   // heroS · fyS: 주인공 발, faceS · ffS: 막장 · 막장 바닥(화면 px), kk: 스프라이트 배율
  if(st){
    // 배경(바위 + 판 굴)은 미리 그려 둔 한 장을 붙이기만 함 → 매 프레임 큰 그림 수십 장을 다시 그리지 않음(렉 줄이기)
    const gv=veinOn()&&goldStrata(),bc=bgCache(L,st,gv,d,DM,K,CW,CH,bite);g.drawImage(bc.c,bc.ox,bc.oy);
  }else{g.fillStyle=LOOK[L].dark;g.fillRect(0,0,CW,CH)}
  g.setTransform(K,0,0,K,sh*K,0);
  // 막장에 박힌 다음 광석 · 금(막장 왼쪽 바위)
  const R=ramp(ITEMS[S.next||'stone'].c);
  BLOBS.forEach(b=>{const cx=fx+b[0],cy=fy+b[1],r=b[2];for(let yy=-3;yy<=3;yy++)for(let xx=-3;xx<=3;xx++){const dd=Math.hypot(xx,yy*1.1);if(dd>r)continue;g.fillStyle=dd>r-.9?R[0]:(xx+yy<-1?R[4]:xx+yy<1?R[3]:R[2]);g.fillRect(Math.round(cx+xx),Math.round(cy+yy),1,1)}});
  if(((t*1.3)%2)<.25){const b=BLOBS[0];g.fillStyle='#fff';g.fillRect(Math.round(fx+b[0]-1),Math.round(fy+b[1]-2),1,1)}
  const dmg=clamp(1-S.hp/layerHp(L),0,1);if(dmg>0){g.fillStyle='rgba(0,0,0,.75)';CRACKS.forEach((c,k)=>{const n=Math.floor(dmg*c.length*1.2-(k%2));for(let j=0;j<Math.min(n,c.length);j++)g.fillRect(Math.round(fx+c[j][0]),Math.round(fy+c[j][1]),1,1)})}
  // 숯: 주인공(과 드릴 로봇) 뒤 굴 바닥(오르막). 선물 상자는 숯 옆. 발밑 그림자로 바닥에 붙어 있게
  g.setTransform(1,0,0,1,sh*K,0);
  {const catF=full()||S.autoOn&&S.auto>0&&Math.sin(t*.3)>.6?'sleep':(Math.sin(t*2)>.7?'tail':'sit'),cs=spr('cat_'+catF),cx=hS0+(S.auto>0?104:52),cy=fS0-Math.round((S.auto>0?104:52)*SL);
    shadow(cx,cy,20);
    if(cs){const cw=Math.round(cs.width*kk),ch=Math.round(cs.height*kk);g.drawImage(cs,cx-Math.round(cw/2),cy-ch+kk*2,cw,ch)}
    const gf=spr('gift');if(gf&&giftReady()){const bw=Math.round(gf.width*kk),bh=Math.round(gf.height*kk),bb=(Math.floor(t*3)%2)*2;g.drawImage(gf,cx+Math.round(14*kk),cy-bh-bb+kk*2,bw,bh)}}
  g.setTransform(K,0,0,K,sh*K,0);
  if(boostOn()&&Math.random()<.5)PARTS.push({x:w.x-4+Math.random()*24,y:w.y-30+Math.random()*24,vx:0,vy:-20,life:.6,c:'#ffe9a8',sz:1,star:Math.random()<.3});
  // 드릴 로봇: 주인공 바로 뒤 굴 바닥(주인공이 막장 앞, 로봇은 뒤따라오며 같이 캠)
  if(S.auto>0){const st2=!S.autoOn?'off':full()?'full':'on',ph=st2==='off'?1:Math.floor(A.botPh)%3+1,bs=spr(`robot_${st2}${ph}`);
    if(bs){g.setTransform(1,0,0,1,sh*K,0);const bw=Math.round(bs.width*kk),bh=Math.round(bs.height*kk),body=Math.round(54*kk),rx=heroS+18,ry=fyS-Math.round((18+bw/2)*SL)+2;shadow(rx+Math.round(bw*.55),ry,Math.round(body*.8));g.drawImage(bs,rx,ry-bh+kk*2,bw,bh);g.setTransform(K,0,0,K,sh*K,0)}
    if(st2==='full'&&Math.random()<.2)PARTS.push({x:w.x+4,y:w.y-14,vx:(Math.random()-.5)*6,vy:-14,life:1,c:'rgba(180,170,160,.7)',sz:2})}
  // 주인공: 직접 그린 스프라이트(art/hero)
  const sit=full()&&A.sw<0,fxw=Math.round(w.x+6-camX)-bite/K,fyw=Math.round(w.y-camY)+Math.round(bite*SL)/K;
  g.setTransform(1,0,0,1,sh*K,0);shadow(heroS-2,fyS,24);g.setTransform(K,0,0,K,sh*K,0);
  if(HERO.img){const k=heroFrameKey(sit,t),[sx,sy,sw,sh,fx]=HERO_META[k],hs=HERO_META._s||1,bob=k==='rest'&&Math.sin(A.bobT*2.2)>.6?1:0;
    g.drawImage(HERO.img,sx,sy,sw,sh,fxw-fx/hs,fyw-sh/hs+1+bob,sw/hs,sh/hs);   // 2배 도트를 절반 크기로 → 화면 1px = 그림 1px
    if(sit){const z=(t*.8)%1;g.fillStyle=`rgba(232,224,255,${(1-z).toFixed(2)})`;const zx=fxw+8+z*4,zy=fyw-18-z*10;g.fillRect(zx,zy,3,1);g.fillRect(zx+1,zy+1,1,1);g.fillRect(zx,zy+2,3,1)}}
  // 입자
  PARTS.forEach(p=>{g.globalAlpha=Math.min(1,p.life*2.5);g.fillStyle=p.c;const x=Math.round(p.x-camX),y=Math.round(p.y-camY);if(p.star){g.fillRect(x-1,y,3,1);g.fillRect(x,y-1,1,3)}else g.fillRect(x,y,p.sz,p.sz)});g.globalAlpha=1;
  // 조명: 헬멧 등불 주변만 밝게, 계단식 고리
  const lx=Math.round(fxw-9),ly=Math.round(fyw-28),dm=lightMask();g.drawImage(dm,lx-dm.width/2,ly-dm.height/2);
  // 떠다니는 먼지
  DUST.forEach(d=>{const x=Math.round(((d.x+t*d.v*6)%IW+IW)%IW),y=Math.round(((d.y-t*d.v*3)%IH+IH)%IH);const dd=Math.hypot(x-lx,y-ly);if(dd<IW*.35){g.globalAlpha=(1-dd/(IW*.35))*.7;g.fillStyle='#fff3d0';g.fillRect(x,y,1,1)}});g.globalAlpha=1;
  // 날아가는 광석 → 창고
  FLY.forEach(f=>{const k=f.t/.6,e=k*k,x=f.x0-camX+((IW-14)-(f.x0-camX))*e,y=f.y0-camY+(10-(f.y0-camY))*e-Math.sin(k*Math.PI)*20;g.drawImage(icon16(f.id),Math.round(x-8),Math.round(y-8))});
  g.setTransform(1,0,0,1,0,0);
}
cv.addEventListener('pointerdown',e=>{e.preventDefault();doTap()});
document.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test(e.target.tagName)||S.tab!=='mine'||$('story').hidden===false)return;if(e.code==='Space'||e.code==='Enter'){e.preventDefault();doTap()}});
function setLayer(i){if(i>=S.unlocked)return;S.layer=i;S.hp=layerHp(i);S.next=rollDrop(i);newWall();camInit=false;renderMineHud();renderLayers()}
/* 황금 광맥: 채굴 화면을 보며 캐고 있을 때만 다음 광맥까지의 시간이 흐르고(8~14분), 나타나면 45초 동안 탭 · 자동 드릴이 골드를 직접 캐냄.
   다른 탭 · 이야기 창 · 시작 화면 · 앱이 뒤로 간 동안엔 등장도, 남은 시간도 멈춤 (한 번에 켜 두고 4분치를 탭 40번에 나눠, 최대 6분치) */
const VEIN_SEC=45;
const minePlaying=()=>S.tab==='mine'&&!document.hidden&&$('story').hidden&&$('titleScr').hidden;
const veinOn=()=>!!S.vein&&S.vein.left>0&&minePlaying();
function veinTick(){if(!minePlaying())return;if(S.vein){if((S.vein.left-=1)<=0)endVein();return}if(!S.tutDone)return;if((S.veinT-=1)<=0)startVein()}
function startVein(){const pot=Math.max(100,Math.round(playIncome()*240));S.vein={left:VEIN_SEC,pot,got:0};S.veinT=480+Math.random()*360;
  A.joy=.9;sfx('rare');toast('황금 광맥이 드러났어요! 45초 동안 캐면 골드가 쏟아져요.');for(let i=0;i<30;i++)PARTS.push({x:camX+Math.random()*IW,y:camY+Math.random()*IH,vx:0,vy:-10,life:1.2,c:'#ffd23f',sz:1,star:Math.random()<.5});renderMineHud()}
function endVein(){const g=S.vein?S.vein.got:0;S.vein=null;if(g>0)log(`황금 광맥이 다시 잠들었어요. 이번에 캔 골드 +${big(g)}G`,true);renderMineHud()}
function veinGold(k,tap){if(!veinOn())return;const v=S.vein,amt=Math.round(Math.min(v.pot*1.5-v.got,v.pot*k));if(amt<=0)return;v.got+=amt;S.gold+=amt;S.earned+=amt;
  if(tap){const ex=FLOATS.find(f=>f.id==='$g'&&f.life>.3);if(ex)ex.add=amt;floatText(`+${big(amt)}G`,'#ffd23f','$g');const f0=FLOATS[0];if(f0&&f0.id==='$g'&&!ex)f0.n=amt;sfx('coin');const w=charW();for(let i=0;i<5;i++)PARTS.push({x:w.x-12,y:w.y-16,vx:-20+Math.random()*40,vy:-50-Math.random()*30,life:.6,c:'#ffd23f',sz:1,star:Math.random()<.5})}}

