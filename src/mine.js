/* ═════════ 채굴 장면 (옆에서 본 굴) ═════════
 저해상도 캔버스에 그리고 픽셀 그대로 키운다. 주인공은 왼쪽 암벽을 파고, 굴은 오른쪽 위에서부터 계단처럼 이어진다.
 암벽에 박힌 광석이 다음에 나올 광물이다. */
const cv=$('scene'),g=cv.getContext('2d');
let IW=0,IH=0,SC=3;   // IW·IH = 보이는 월드 크기(월드 1px = 화면 SC px). 캔버스는 화면 해상도(IW·SC)로 → 그림은 2배 촘촘
const STX=24,STY=9; // 굴 한 칸의 가로/세로 이동
function sceneResize(){fitScene();const r=cv.parentElement.getBoundingClientRect();if(!r.width)return;SC=Math.max(2,Math.round(r.width/180));IW=Math.ceil(r.width/SC);IH=Math.ceil(r.height/SC);cv.width=IW*SC;cv.height=IH*SC;g.imageSmoothingEnabled=false}
addEventListener('resize',()=>{IW=0;DECO_TOP=-1});
function fitScene(){}
if(window.ResizeObserver)new ResizeObserver(()=>{IW=0;DECO_TOP=-1}).observe($('sceneWrap'));
/* 지층 그림(art/strata): 배경 = 안 판 채굴층 바위 한 장(r, 이음매 없이 다듬어 그대로 반복), 굴 안 = 판 버전의 어두운 안쪽(m_d),
   장식 = 천장 조각(d_t, 화면 왼쪽 위) · 바닥 조각(d_b, 화면 오른쪽 아래) */
const STRATA={};
function strata(L){const o=STRATA[L]||(STRATA[L]={});if(o.ok)return o;if(o.wait)return null;o.wait=1;const n=L+1,keys=['r'+n,'m'+n+'_d','d'+n+'_t','d'+n+'_b'].filter(k=>ART['strata_'+k]);let left=keys.length;
  keys.forEach(k=>{const im=new Image();im.onload=()=>{if(!--left)buildStrata(L,o)};im.src=ART['strata_'+k];o[k.replace(/\d+/,'')]=im});return null}
let DECO_TOP=-1;const decoTop=()=>{if(DECO_TOP<0){const c=document.querySelector('.sc-ore'),w=$('sceneWrap');DECO_TOP=c&&w?Math.round((c.getBoundingClientRect().bottom-w.getBoundingClientRect().top)*cv.width/w.clientWidth):40}return DECO_TOP};
function cvs(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]}
function mirror(im){const w=im.width,h=im.height,[c,x]=cvs(w*2,h*2);x.drawImage(im,0,0);x.save();x.scale(-1,1);x.drawImage(im,-w*2,0);x.restore();
  x.save();x.scale(1,-1);x.drawImage(c,0,0,w*2,h,0,-h*2,w*2,h);x.restore();return c}
function tint(src,col,a){const[c,x]=cvs(src.width,src.height);x.drawImage(src,0,0);x.globalCompositeOperation='source-atop';x.globalAlpha=a;x.fillStyle=col;x.fillRect(0,0,c.width,c.height);return c}
function buildStrata(L,o){const dm=LOOK[L].dim*.55;o.rockC=o.r;o.darkC=mirror(o.m_d);o.prock=g.createPattern(o.rockC,'repeat');o.pdark=g.createPattern(o.darkC,'repeat');
  o.dt=tint(o.d_t,'#07040a',dm);o.db=tint(o.d_b,'#07040a',dm);   // 앞 장식은 조명 밖이라 지층 어둡기만큼 살짝 어둡게
  const[,x1]=cvs(1,1);x1.imageSmoothingEnabled=true;x1.drawImage(o.r,0,0,1,1);const v=x1.getImageData(0,0,1,1).data;o.rock='#'+[v[0],v[1],v[2]].map(n=>n.toString(16).padStart(2,'0')).join('');o.ok=1}   // 굴 바닥 · 천장 색 = 바위 평균색
// 캔버스 좌표로 무늬 채우기: (ax,ay)에 무늬 원점을 두고 사각형을 채움
function fillPat(p,tw,th,ax,ay,x,y,w,h){const ox=((Math.round(ax)%tw)+tw)%tw,oy=((Math.round(ay)%th)+th)%th;g.save();g.translate(ox,oy);g.fillStyle=p;g.fillRect(x-ox,y-oy,w,h);g.restore()}
const digOf=L=>S.digs[L]||0;
let camX=0,camY=0,camInit=false;
const A={joy:0,yawn:0,yawnT:9,sw:-1,step:0,stepT:0,bobT:0,blinkT:2.5,blink:0,shake:0,crackSeed:1,head:0,autoT:0,autoPh:0,botPh:0};
let PARTS=[],FLY=[];
const DUST=Array.from({length:26},()=>({x:Math.random()*400,y:Math.random()*400,v:.3+Math.random()*.7}));
let LMASK=null,LMK='';
function lightMask(){const dim=LOOK[S.layer].dim+(S.ended?-.08:0),k=IW+'x'+IH+'_'+dim.toFixed(2);if(LMK===k)return LMASK;LMK=k;
  const W=IW*2+2,H=IH*2+2,c=document.createElement('canvas');c.width=W;c.height=H;const t=c.getContext('2d'),img=t.createImageData(W,H),R=Math.max(IW,IH)*.95,cx=W/2,cy=H/2;
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
  applyDmg(d,false);
}
// 알뜰 정리(셈): 창고가 가득 차면 가장 싼 원석을 팔아 자리를 만든다
let autoSellT=0;
function autoSellRoom(){const ids=ORDER.filter(id=>cnt(id)>0&&ITEMS[id].L).sort((a,b)=>bid(a)-bid(b));if(!ids.length)return false;const id=ids[0],k=Math.min(cnt(id),Math.max(1,Math.ceil(cap()*.05)));
  const t=sell(id,k);if(!t)return false;if(performance.now()-autoSellT>4000){autoSellT=performance.now();log(`셈이 ${ITEMS[id].n} ${k}개를 팔아 자리를 만들었어요: +${big(t)}G`)}invDirty=true;return space()>0}
function applyDmg(d,auto){
  S.hp-=d;const w=charW(),wx=w.x-10,wy=w.y-14;
  const T=PICK_TIERS[pickTier()][3],L=LOOK[S.layer];
  if(!auto){for(let i=0;i<6;i++)PARTS.push({x:wx,y:wy+(Math.random()-.5)*6,vx:-20+Math.random()*50,vy:-40-Math.random()*40,life:.5,c:Math.random()<.5?L.spec[0]:L.rock,sz:1});tierFx(T,wx,wy)}
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
  while(S.hp<=0&&n<400){S.hp+=hp;n++;const id=n===1?(S.next||rollDrop(L)):rollDrop(L);got[id]=(got[id]||0)+1+(Math.random()<extraP(ITEMS[id].s)?1:0)}
  const w=charW();
  for(let i=0;i<14;i++)PARTS.push({x:w.x-14+Math.random()*8,y:w.y-24+Math.random()*22,vx:(Math.random()-.8)*80,vy:-40-Math.random()*60,life:.8,c:Math.random()<.4?ITEMS[S.next||'stone'].c:LOOK[L].rock,sz:2,grav:1});
  for(const id in got)gain(id,got[id],auto);
  rumorClue(L);S.digs[L]=digOf(L)+1;A.stepT=.3;A.shake=2;S.next=rollDrop(L);newWall();
  if(!S.journal.includes(0)&&S.mined>=1)revealJournal(0);
}
// 캔 광석: 창고 → (드릴 로봇이면) 로봇 보관함 → 넘치면 판매
let ofFxT=0;
function gain(id,n,auto){S.mined+=n;if(!S.seen.includes(id))A.joy=.9;if(!auto&&space()<n&&ul('autosell'))autoSellRoom();let ok=Math.min(n,space());
  if(ok<n){let rest=n-ok;if(auto){const b=Math.min(rest,Math.max(0,boxCap()-boxUsed()));if(b>0){boxAdd(id,b);rest-=b}const g=sellOverflow(id,rest);if(g&&performance.now()-ofFxT>1500){ofFxT=performance.now();floatText(`넘친 광석 판매 +${big(g)}G`,'#ffd36a')}}else S.lost=(S.lost||0)+rest}if(ok>0){add(id,ok);invDirty=true;const w=charW();FLY.push({id,x0:w.x-12,y0:w.y-18,t:0});floatText(`+${ok} ${ITEMS[id].n}`,'#fff',id)}}
let FLOATS=[];
function floatText(t,c,id){const wrap=$('sceneWrap');const ex=id&&FLOATS.find(f=>f.id===id&&f.life>.3);
  if(ex){ex.n++;ex.el.querySelector('b').textContent=`+${ex.n} ${ITEMS[id].n}`;ex.life=1.3;ex.pop=.2;FLOATS.splice(FLOATS.indexOf(ex),1);FLOATS.unshift(ex);return}
  const el=document.createElement('div');el.className='ftxt';el.style.color=c;el.innerHTML=(id?ico(id):'')+`<b>${t}</b>`;wrap.appendChild(el);
  FLOATS.unshift({el,id,n:1,life:1.3,y:0,slot:0,pop:.2});while(FLOATS.length>4){FLOATS.pop().el.remove()}}
function stepFloats(dt){const w=charW(),wrap=$('sceneWrap'),H=wrap.clientHeight,sx=(w.x-camX)*SC,base=(w.y-40-camY)*SC;
  FLOATS.forEach((f,i)=>{f.life-=dt;f.pop=Math.max(0,f.pop-dt);f.slot=i*24;f.y=Math.min(f.y+dt*14,12);
    let y=base-f.y-f.slot;y=clamp(y,62,H-80);f.el.style.transform=`translate(${Math.round(clamp(sx-30,6,wrap.clientWidth-190))}px,${Math.round(y)}px) scale(${1+f.pop})`;f.el.style.opacity=Math.min(1,f.life*2.2)});
  FLOATS=FLOATS.filter(f=>{if(f.life<=0){f.el.remove();return false}return true})}
let invDirty=false;
function update(dt){
  const w=charW(),tx=w.x-IW*.56,ty=w.y-IH*.62;if(!camInit){camX=tx;camY=ty;camInit=true}camX+=(tx-camX)*Math.min(1,dt*6);camY+=(ty-camY)*Math.min(1,dt*6);
  if(A.sw>=0){A.sw+=dt/.26;A.idleT=0;if(A.sw>=1)A.sw=-1}else A.idleT=(A.idleT||0)+dt;
  A.stepT=Math.max(0,A.stepT-dt);A.bobT+=dt;A.blinkT-=dt;if(A.blinkT<0){A.blink=.14;A.blinkT=2+Math.random()*3}A.blink=Math.max(0,A.blink-dt);A.head=Math.max(0,A.head-dt);A.joy=Math.max(0,A.joy-dt);A.yawn=Math.max(0,A.yawn-dt);if(A.sw<0&&!full()){A.yawnT-=dt;if(A.yawnT<0){A.yawn=1.2;A.yawnT=14+Math.random()*12}}else A.yawnT=Math.max(A.yawnT,6);A.shake=Math.max(0,A.shake-dt*8);
  // 자동 드릴
  if(S.auto>0&&S.autoOn){A.autoT+=dt;A.botPh+=dt*12;while(A.autoT>=.25){A.autoT-=.25;applyDmg(autoDps()*.25,true)}}
  PARTS.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.grav?260:140)*dt;p.life-=dt});PARTS=PARTS.filter(p=>p.life>0);
  FLY.forEach(f=>f.t+=dt);FLY=FLY.filter(f=>f.t<.6);
  stepFloats(dt);
}
function draw(t){
  const L=S.layer,lk=LOOK[L],d=digOf(L);
  const sh=A.shake>0?Math.round((Math.random()-.5)*2):0;
  const K=SC,CW=cv.width,CH=cv.height,st=strata(L);g.setTransform(1,0,0,1,sh*K,0);
  if(st){
    // 배경: 안 판 바위(카메라와 같이 움직임 = 파고 들어가는 그 바위)
    fillPat(st.prock,st.rockC.width,st.rockC.height,-camX*K,-camY*K,-K,0,CW+2*K,CH);
    // 굴 안: 판 버전의 어두운 안쪽, 조금 느리게(0.8배) → 안쪽이 깊어 보이게
    for(let i=d;i>=d-30;i--){const x=Math.round(-i*STX-camX),y=Math.round(i*STY-camY);if(x>IW+STX)break;if(x<-STX)continue;
      fillPat(st.pdark,st.darkC.width,st.darkC.height,-camX*K*.8,-camY*K*.8,(x-STX/2)*K,(y-33)*K,(STX+1)*K,33*K)}
  }else{g.fillStyle=LOOK[L].dark;g.fillRect(0,0,CW,CH)}
  g.setTransform(K,0,0,K,sh*K,0);
  // 굴 바닥·천장 음영과 버팀목
  for(let i=d;i>=d-30;i--){const x=Math.round(-i*STX-camX),y=Math.round(i*STY-camY);if(x>IW+STX)break;if(x<-STX)continue;
    {const RR=ramp(st?st.rock:lk.rock),Rn=rng(i*7919+S.layer);for(let k=0;k<STX+1;k++){const xx=x-STX/2+k,bump=Math.floor(Rn()*3),bump2=Math.floor(Rn()*2);
      g.fillStyle=RR[1];g.fillRect(xx,y-33,1,bump+1);g.fillStyle=RR[3];g.fillRect(xx,y-33+bump+1,1,1);
      g.fillStyle=RR[1];g.fillRect(xx,y-bump2,1,bump2+2);g.fillStyle=RR[4];g.fillRect(xx,y-bump2-1,1,1)}
     g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x-STX/2,y-30,STX+1,2)}
    if(i%4===1&&i<d){g.fillStyle='#6b4a2a';g.fillRect(x-STX/2+2,y-32,2,32);g.fillRect(x+STX/2-4,y-32,2,32);g.fillStyle='#8a6038';g.fillRect(x-STX/2+1,y-33,STX-1,3);g.fillStyle='#4a301a';g.fillRect(x-STX/2+1,y-31,STX-1,1)}
    if(i%6===3&&i<d){const lx=x,ly=y-27;g.fillStyle='#3a2a1a';g.fillRect(lx,ly-3,1,3);g.fillStyle='#ffd36a';g.fillRect(lx-1,ly,3,3);g.fillStyle='#fff6c8';g.fillRect(lx,ly+1,1,1)}
    decoCell(lk.deco,i,x,y,t)}
  // 암벽 면과 박힌 광석
  const w=charW(),fx=Math.round(w.x-STX/2-camX),fy=Math.round(w.y-camY);
  g.fillStyle=shade(lk.rock,.18);g.fillRect(fx-1,fy-33,1,33);
  const R=ramp(ITEMS[S.next||'stone'].c);
  BLOBS.forEach(b=>{const cx=fx+b[0],cy=fy+b[1],r=b[2];for(let yy=-3;yy<=3;yy++)for(let xx=-3;xx<=3;xx++){const dd=Math.hypot(xx,yy*1.1);if(dd>r)continue;g.fillStyle=dd>r-.9?R[0]:(xx+yy<-1?R[4]:xx+yy<1?R[3]:R[2]);g.fillRect(Math.round(cx+xx),Math.round(cy+yy),1,1)}});
  if(((t*1.3)%2)<.25){const b=BLOBS[0];g.fillStyle='#fff';g.fillRect(Math.round(fx+b[0]-1),Math.round(fy+b[1]-2),1,1)}
  // 금
  const dmg=clamp(1-S.hp/layerHp(L),0,1);if(dmg>0){g.fillStyle='rgba(0,0,0,.75)';CRACKS.forEach((c,k)=>{const n=Math.floor(dmg*c.length*1.2-(k%2));for(let j=0;j<Math.min(n,c.length);j++)g.fillRect(Math.round(fx+c[j][0]),Math.round(fy+c[j][1]),1,1)})}
  // 숯
  const cx=Math.round(w.x+20-camX),cy=Math.round(w.y-STY*0-camY);const catF=full()||S.autoOn&&S.auto>0&&Math.sin(t*.3)>.6?'sleep':(Math.sin(t*2)>.7?'tail':'sit');
  const cs=catSprite(catF);g.drawImage(cs,cx-2,cy-cs.height+1);
  if(giftReady()){const bx=cx+16,by=cy-7,bb=Math.floor(t*3)%2;g.fillStyle='#c0402a';g.fillRect(bx,by-bb,8,6);g.fillStyle='#ffd23f';g.fillRect(bx+3,by-bb,2,6);g.fillRect(bx,by+2-bb,8,1);g.fillStyle='#ffe9a8';g.fillRect(bx+2,by-2-bb,1,2);g.fillRect(bx+5,by-2-bb,1,2);g.fillStyle='#2a1610';g.fillRect(bx,by+6-bb,8,1)}
  if(boostOn()&&Math.random()<.5)PARTS.push({x:w.x-4+Math.random()*24,y:w.y-30+Math.random()*24,vx:0,vy:-20,life:.6,c:'#ffe9a8',sz:1,star:Math.random()<.3});
  // 드릴 로봇: 주인공보다 먼저(뒤에), 바닥에 붙여 작게
  if(S.auto>0){const st=!S.autoOn?'off':full()?'full':'on',bs=botSprite(st,Math.floor(A.botPh)%3);const bx=Math.round(w.x-STX/2-2-camX),by=Math.round(w.y-camY-bs.height+2);g.drawImage(bs,bx,by);
    if(st==='off'&&Math.sin(t*2)>0){g.fillStyle='#a8c8c8';g.fillRect(bx+15,by-4,3,1);g.fillRect(bx+17,by-5,1,1)}
    if(st==='full'&&Math.random()<.2)PARTS.push({x:w.x+4,y:w.y-14,vx:(Math.random()-.5)*6,vy:-14,life:1,c:'rgba(180,170,160,.7)',sz:2})}
  // 주인공: 직접 그린 스프라이트(art/hero)
  const sit=full()&&A.sw<0,fxw=Math.round(w.x+6-camX),fyw=Math.round(w.y-camY);
  if(HERO.img){const k=heroFrameKey(sit,t),[sx,sy,sw,sh,fx]=HERO_META[k],hs=HERO_META._s||1,bob=k==='rest'&&Math.sin(A.bobT*2.2)>.6?1:0;
    g.drawImage(HERO.img,sx,sy,sw,sh,fxw-fx/hs,fyw-sh/hs+1+bob,sw/hs,sh/hs);   // 2배 도트를 절반 크기로 → 화면 1px = 그림 1px
    if(sit){const z=(t*.8)%1;g.fillStyle=`rgba(232,224,255,${(1-z).toFixed(2)})`;const zx=fxw+8+z*4,zy=fyw-18-z*10;g.fillRect(zx,zy,3,1);g.fillRect(zx+1,zy+1,1,1);g.fillRect(zx,zy+2,3,1)}}
  // 입자
  PARTS.forEach(p=>{g.globalAlpha=Math.min(1,p.life*2.5);g.fillStyle=p.c;const x=Math.round(p.x-camX),y=Math.round(p.y-camY);if(p.star){g.fillRect(x-1,y,3,1);g.fillRect(x,y-1,1,3)}else g.fillRect(x,y,p.sz,p.sz)});g.globalAlpha=1;
  // 조명: 헬멧 등불 주변만 밝게, 계단식 고리
  const lx=Math.round(w.x-3-camX),ly=Math.round(w.y-28-camY),dm=lightMask();g.drawImage(dm,lx-dm.width/2,ly-dm.height/2);
  // 장식: 천장 조각은 왼쪽 위(윗부분은 광석 카드 뒤, 종유석은 카드 아래로 늘어지게), 바닥 조각은 오른쪽 아래
  if(st){g.setTransform(1,0,0,1,sh*K,0);g.drawImage(st.dt,0,Math.max(0,decoTop()-Math.round(st.dt.height*.5)));g.drawImage(st.db,CW-st.db.width,CH-st.db.height);g.setTransform(K,0,0,K,sh*K,0)}
  // 떠다니는 먼지
  DUST.forEach(d=>{const x=Math.round(((d.x+t*d.v*6)%IW+IW)%IW),y=Math.round(((d.y-t*d.v*3)%IH+IH)%IH);const dd=Math.hypot(x-lx,y-ly);if(dd<IW*.35){g.globalAlpha=(1-dd/(IW*.35))*.7;g.fillStyle='#fff3d0';g.fillRect(x,y,1,1)}});g.globalAlpha=1;
  // 날아가는 광석 → 창고
  FLY.forEach(f=>{const k=f.t/.6,e=k*k,x=f.x0-camX+((IW-14)-(f.x0-camX))*e,y=f.y0-camY+(10-(f.y0-camY))*e-Math.sin(k*Math.PI)*20;g.drawImage(icon16(f.id),Math.round(x-8),Math.round(y-8))});
  g.setTransform(1,0,0,1,0,0);
}
function decoCell(type,i,x,y,t){const R=rng(i*97+S.layer*7);
  if(type==='stalactite'&&R()<.6){g.fillStyle='#d8d4c0';const sx=x-8+Math.floor(R()*16);g.fillRect(sx,y-31,2,3);g.fillRect(sx,y-28,1,2)}
  if(type==='crystal'&&R()<.5){const sx=x-10+Math.floor(R()*20),c=['#c28cf4','#eeeae2'][R()<.5?0:1],a=.6+.4*Math.sin(t*2+i);g.globalAlpha=a;g.fillStyle=c;g.fillRect(sx,y-36,2,3);g.fillRect(sx+1,y-38,1,2);g.globalAlpha=1}
  if(type==='drip'&&R()<.5){const sx=x-8+Math.floor(R()*16),ph=(t*.8+R())%1;g.fillStyle='#7fc4e8';g.fillRect(sx,y-31+Math.floor(ph*30),1,2)}
  if(type==='goldspeck'&&R()<.7){const sx=x-10+Math.floor(R()*20),sy=y-40+Math.floor(R()*6);g.fillStyle=(t*2+i)%3<.3?'#fff6c8':'#ffd23f';g.fillRect(sx,sy,1,1)}
  if(type==='lava'&&R()<.5){const sx=x-10+Math.floor(R()*20);g.fillStyle=`rgba(255,${120+Math.floor(60*Math.sin(t*3+i))},40,.9)`;g.fillRect(sx,y+3,4,1);g.fillRect(sx+2,y+4,3,1)}
  if(type==='glass'&&R()<.5){const sx=x-10+Math.floor(R()*20);g.fillStyle='rgba(160,210,255,.6)';g.fillRect(sx,y-40,1,4);g.fillRect(sx+1,y-41,1,2)}
  if(type==='diamond'&&R()<.5&&(t*1.5+i)%3<.4){const sx=x-10+Math.floor(R()*20);g.fillStyle='#ffffff';g.fillRect(sx,y-39,1,1)}
  if(type==='void'&&R()<.4){g.fillStyle=`rgba(120,140,255,${.2+.2*Math.sin(t+i)})`;g.fillRect(x-6+Math.floor(R()*12),y-38,1,1)}
  if(type==='meteor'&&R()<.4){g.fillStyle='#bfe0f6';g.fillRect(x-10+Math.floor(R()*20),y+4,2,1)}
  if(type==='star'&&R()<.6){const a=.4+.6*Math.abs(Math.sin(t*1.5+i));g.fillStyle=`rgba(255,233,168,${a})`;const sx=x-10+Math.floor(R()*20),sy=y-42+Math.floor(R()*8);g.fillRect(sx,sy,1,1);if(a>.8){g.fillRect(sx-1,sy,3,1);g.fillRect(sx,sy-1,1,3)}}
  if(type==='shards'&&R()<.4){g.fillStyle='#e8d8c0';g.fillRect(x-10+Math.floor(R()*20),y+3,2,1)}
  if(type==='grass'&&i<=0){g.fillStyle='#5f8a3a';g.fillRect(x-STX/2,y-35,STX,2);g.fillStyle='#7fae4a';g.fillRect(x-STX/2,y-35,STX,1);
    for(let k=0;k<5;k++){const gx=x-STX/2+2+Math.floor(R()*(STX-4)),gh=1+Math.floor(R()*3),sw=Math.sin(t*2+gx)>.6?1:0;g.fillStyle='#4a7a2e';g.fillRect(gx,y-35-gh,1,gh);g.fillStyle='#9ccf5a';g.fillRect(gx+sw,y-36-gh,1,1)}
    if(R()<.7){const fx=x-STX/2+3+Math.floor(R()*(STX-6));g.fillStyle='#4a7a2e';g.fillRect(fx,y-38,1,3);g.fillStyle='#ffffff';g.fillRect(fx-1,y-40,3,1);g.fillRect(fx,y-41,1,3);g.fillStyle='#ffd23f';g.fillRect(fx,y-40,1,1)}}
}
cv.addEventListener('pointerdown',e=>{e.preventDefault();doTap()});
document.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test(e.target.tagName)||S.tab!=='mine'||$('story').hidden===false)return;if(e.code==='Space'||e.code==='Enter'){e.preventDefault();doTap()}});
function setLayer(i){if(i>=S.unlocked)return;S.layer=i;S.hp=layerHp(i);S.next=rollDrop(i);newWall();camInit=false;renderMineHud();renderLayers()}
