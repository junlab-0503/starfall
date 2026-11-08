/* ═════════ 도트 그래픽 ═════════ */
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const t=f<0?0:255,p=Math.abs(f);
  r=Math.round((t-r)*p+r);g=Math.round((t-g)*p+g);b=Math.round((t-b)*p+b);return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}
function hex2hsl(hex){const n=parseInt(hex.slice(1),16);let r=(n>>16)/255,g=(n>>8&255)/255,b=(n&255)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0,l=(mx+mn)/2;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}return[h,s,l]}
function hsl2hex(h,s,l){h=((h%360)+360)%360;s=Math.max(0,Math.min(1,s));l=Math.max(0,Math.min(1,l));const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let r=0,g=0,b=0;
  if(h<60)[r,g,b]=[c,x,0];else if(h<120)[r,g,b]=[x,c,0];else if(h<180)[r,g,b]=[0,c,x];else if(h<240)[r,g,b]=[0,x,c];else if(h<300)[r,g,b]=[x,0,c];else[r,g,b]=[c,0,x];
  return'#'+[r,g,b].map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('')}
const towardHue=(h,t,a)=>{let d=((t-h+540)%360)-180;return h+d*a};
// 어두워질수록 파랑·보라(250°)로, 밝아질수록 노랑(50°)으로 색조를 튼다
function hshift(c,f){const[h,s,l]=hex2hsl(c);if(f<0){const a=-f;return hsl2hex(towardHue(h,250,a*.28),s*(1+a*.15)+(s<.08?a*.12:0),l*(1-a*.92))}const a=f;return hsl2hex(towardHue(h,52,a*.22),s*(1-a*.25),l+(1-l)*a*.88)}
const RAMP_CACHE={};
const ramp=c=>RAMP_CACHE[c]||(RAMP_CACHE[c]=[hshift(c,-.58),hshift(c,-.3),c,hshift(c,.3),hshift(c,.62)]);
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const strSeed=s=>{let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
class PB{ // 픽셀 버퍼
  constructor(w,h){this.w=w;this.h=h;this.d=new Array(w*h).fill(null)}
  set(x,y,c){x|=0;y|=0;if(x<0||y<0||x>=this.w||y>=this.h||!c)return;this.d[y*this.w+x]=c}
  get(x,y){if(x<0||y<0||x>=this.w||y>=this.h)return null;return this.d[y*this.w+x]}
  rect(x,y,w,h,c){for(let j=0;j<h;j++)for(let i=0;i<w;i++)this.set(x+i,y+j,typeof c==='function'?c(x+i,y+j):c)}
  poly(pts,c){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;pts.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});
    for(let y=Math.floor(y0);y<=Math.ceil(y1);y++)for(let x=Math.floor(x0);x<=Math.ceil(x1);x++){const px=x+.5,py=y+.5;let ins=false;
      for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a[1]>py)!==(b[1]>py)&&px<(b[0]-a[0])*(py-a[1])/(b[1]-a[1])+a[0])ins=!ins}
      if(ins)this.set(x,y,typeof c==='function'?c(x,y):c)}}
  ell(cx,cy,rx,ry,c){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1)this.set(x,y,typeof c==='function'?c(x,y,dx,dy):c)}}
  line(x0,y0,x1,y1,c,w=1){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))*2+1;for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;if(w<=1)this.set(Math.floor(x),Math.floor(y),c);else this.rect(Math.floor(x-w/2+.5),Math.floor(y-w/2+.5),w,w,c)}}
  outline(c){const add=[];for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){if(this.get(x,y))continue;const r=this.get(x+1,y),d=this.get(x,y+1),l=this.get(x-1,y),u=this.get(x,y-1);const nb=r||d||l||u;if(!nb)continue;
      const lit=(r||d)&&!(l||u);let col=c;if(typeof nb==='string'&&nb[0]==='#'&&!this.mono){col=hshift(nb,lit?-.6:-.8)}add.push([x,y,col])}add.forEach(p=>this.set(p[0],p[1],p[2]))}
  canvas(sc=1){const cv=document.createElement('canvas');cv.width=this.w*sc;cv.height=this.h*sc;const g=cv.getContext('2d');for(let i=0;i<this.d.length;i++){const c=this.d[i];if(!c)continue;g.fillStyle=c;g.fillRect((i%this.w)*sc,Math.floor(i/this.w)*sc,sc,sc)}return cv}
}
// 왼쪽 위에서 빛이 오는 음영 (0~4 단계)
const lit=(R,cx,cy,rad,bias=0)=>(x,y)=>{const v=((cx-(x+.5))*.6+(cy-(y+.5))*.8)/rad+bias;return R[Math.max(0,Math.min(4,Math.round(2+v*1.8)))]};
// 광물 아이콘(drawIcon)은 icons.js
// 아이콘을 만들어 CSS 클래스와 캔버스로
const ICON32={},ICON16={};
function buildIcons(){
  let css='';
  ORDER.forEach(id=>{const c32=drawIcon(id,32).canvas(1),c16=drawIcon(id,16).canvas(1);ICON32[id]=c32;ICON16[id]=c16;css+=`.ic-${id}{background-image:url(${c32.toDataURL()})}`});
  // 직접 그린 광물 그림이 있으면 그걸 아이콘으로 (채굴 화면에 날아가는 16px 아이콘도)
  if(typeof ART!=='undefined')ORDER.forEach(id=>{if(!ART[id])return;css+=`.ic-${id}{background-image:url(${ART[id]})}`;
    const im=new Image();im.onload=()=>{const c=ICON16[id],x=c.getContext('2d');x.clearRect(0,0,16,16);x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(im,0,0,16,16)};im.src=ART[id]});
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
}
const ico=(id,sz='')=>`<i class="ico ${sz} ic-${id}" aria-hidden="true"></i>`;

/* 캐릭터 (옆모습, 왼쪽을 봄). 발 중앙이 기준점 (16, 31) */
const CHAR_PAL={out:'#2a1610',skin:'#f4c8a0',skinS:'#d9a078',hair:'#4a2e1c',helm:'#e8b13a',helmS:'#b07a1e',lamp:'#fff6c8',shirt:'#5f86b8',shirtS:'#46668f',over:'#7a5a3a',overS:'#5a3f27',boot:'#3a2a20',cheek:'#e8907a',handle:'#7a5030',handleS:'#55361f'};
function drawChar(o){ // o: {ang, bob, sit, step, tier, blink, face} — 2.5등신, 왼쪽을 봄. 머리·몸통·팔·다리가 다 보이게
  const C=CHAR_PAL,pb=new PB(40,40),ox=19,oy=37+(o.bob||0),sit=o.sit,fy=oy;
  // 다리와 장화
  if(sit){pb.rect(ox-9,fy-3,10,3,C.over);pb.rect(ox-9,fy-1,10,1,C.overS);pb.rect(ox-12,fy-4,3,4,C.boot);pb.rect(ox-12,fy-1,4,1,C.out)}
  else{const s=o.step||0;
    pb.rect(ox+1-s,fy-6,3,5,C.overS);pb.rect(ox-s,fy-2,4,2,C.boot);pb.set(ox-s,fy-1,C.out);           // 뒷다리
    pb.rect(ox-4+s,fy-6,3,5,C.over);pb.rect(ox-4+s,fy-6,1,5,shade(C.over,.15));pb.rect(ox-6+s,fy-2,5,2,C.boot);pb.rect(ox-6+s,fy-2,2,1,shade(C.boot,.25))} // 앞다리
  // 몸통: 셔츠 + 멜빵 작업복
  const by=sit?fy-3:fy-6; // 허리
  pb.rect(ox-5,by-9,10,9,C.shirt);pb.rect(ox+2,by-9,3,9,C.shirtS);           // 셔츠
  pb.rect(ox-5,by-4,10,4,C.over);pb.rect(ox+2,by-4,3,4,C.overS);              // 바지 윗부분
  pb.rect(ox-4,by-7,6,4,C.over);pb.rect(ox-3,by-6,3,2,C.overS);                // 앞치마 판과 주머니
  pb.rect(ox-4,by-9,1,3,C.overS);pb.rect(ox+1,by-9,1,3,C.overS);               // 멜빵
  pb.set(ox-4,by-7,'#d8c070');pb.set(ox+1,by-7,'#d8c070');                       // 단추
  pb.rect(ox-5,by-1,10,1,'#4a3020');pb.set(ox-2,by-1,'#c8a050');               // 허리띠
  // 목과 머리 (몸보다 조금 큰 정도)
  const hx=ox-1,hy=by-15;
  pb.rect(hx-1,by-10,3,1,C.skinS);
  pb.ell(hx,hy,6,5.6,(x,y)=>x>hx+2?C.skinS:C.skin);
  pb.ell(hx+3,hy+.5,3.4,4.6,(x,y)=>y>hy-2?C.hair:null);pb.rect(hx+3,hy-1,3,5,C.hair);pb.set(hx+5,hy+4,C.hair);pb.set(hx+2,hy+1,shade(C.hair,.2));
  pb.set(hx+1,hy+1,C.skinS);pb.set(hx+1,hy+2,C.skin); // 귀
  const fc=o.face||'';
  if(fc==='joy'){pb.set(hx-5,hy+1,C.out);pb.set(hx-4,hy,C.out);pb.set(hx-3,hy+1,C.out);pb.rect(hx-5,hy+3,2,1,'#8a3a2a')}
  else if(fc==='tired'){pb.rect(hx-5,hy+1,2,1,C.out);pb.set(hx-4,hy+4,C.skinS);pb.set(hx,hy-3,'#9fd8ff');pb.set(hx,hy-2,'#9fd8ff')}
  else if(fc==='yawn'){pb.rect(hx-5,hy,2,1,C.out);pb.rect(hx-5,hy+3,2,2,'#5a2a1a')}
  else{pb.rect(hx-4,hy,1,2,o.blink?C.skinS:C.out);if(!o.blink)pb.set(hx-4,hy,'#ffffff');pb.set(hx-5,hy+3,'#a85a4a')}
  pb.rect(hx-5,hy+2,2,1,C.cheek);pb.set(hx-6,hy+1,C.skin);
  // 헬멧과 등불
  pb.ell(hx,hy-2.2,6.8,4.6,(x,y)=>y<hy-1?(x>hx+3?C.helmS:C.helm):null);
  pb.rect(hx-8,hy-2,5,1,C.helmS);pb.rect(hx-3,hy-6,4,1,shade(C.helm,.35));
  pb.rect(hx-6,hy-5,2,2,C.lamp);pb.set(hx-7,hy-4,C.lamp);pb.set(hx-2,hy-5,'#fff3c0');
  // 뒷팔(몸 뒤)
  pb.rect(ox+3,by-8,2,5,C.shirtS);pb.rect(ox+3,by-3,2,2,C.skinS);
  // 앞팔과 곡괭이: 어깨에서 손잡이를 쥔다
  const sx=ox-1,sy=by-8,a=o.ang*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a);
  const hx2=sx+dx*5,hy2=sy+dy*5;
  const T=PICK_TIERS[o.tier||0],HR=ramp(T[2]);
  const ex=hx2+dx*10,ey=hy2+dy*10,px=-dy,py=dx;
  pb.line(hx2-dx*2,hy2-dy*2,ex,ey,C.handle,1);
  const tip=(k)=>[ex+px*k*5.5-dx*1.8,ey+py*k*5.5-dy*1.8];
  const t1=tip(1),t2=tip(-1);
  pb.line(t1[0],t1[1],ex+px*2,ey+py*2,HR[2],2);pb.line(ex-px*2,ey-py*2,t2[0],t2[1],HR[2],2);pb.line(ex-px*2,ey-py*2,ex+px*2,ey+py*2,HR[1],2);
  pb.line(t1[0],t1[1],ex+px*2,ey+py*2,HR[4],1);pb.set(Math.round(t2[0]),Math.round(t2[1]),HR[3]);
  pb.line(sx,sy,hx2,hy2,C.shirt,2);pb.rect(Math.round(hx2-1),Math.round(hy2-1),2,2,C.skin);
  pb.outline(C.out);
  return pb;
}
const CHAR_CACHE={};
function charSprite(o){const k=[Math.round(o.ang/8)*8,o.bob|0,o.sit?1:0,o.step|0,o.tier|0,o.blink?1:0,o.face||''].join(',');if(!CHAR_CACHE[k])CHAR_CACHE[k]=drawChar(Object.assign({},o,{ang:Math.round(o.ang/8)*8})).canvas(1);return CHAR_CACHE[k]}
/* 고양이 숯 */
function drawCat(f){const pb=new PB(20,14),B='#1d1a22',B2='#2e2a36',E=f==='sleep'?'#1d1a22':'#ffd23f';
  if(f==='sleep'){pb.ell(10,10,7,3.5,B);pb.ell(5,9,3,2.5,B2);pb.set(3,7,B);pb.set(6,7,B);pb.line(15,11,18,8,B,1)}
  else{pb.ell(11,10,5,3.5,B);pb.rect(5,4,6,5,B);pb.set(5,3,B);pb.set(6,2,B);pb.set(10,3,B);pb.set(9,2,B);pb.set(6,6,E);pb.set(9,6,E);pb.set(7,7,'#e88aa0');
    const t=f==='tail'?-1:0;pb.line(15,10,18,6+t,B,1);pb.line(18,6+t,19,4+t,B,1);pb.rect(7,12,2,2,B);pb.rect(13,12,2,2,B)}
  pb.outline('#08070a');return pb.canvas(1)}
/* 드릴 로봇 */
function drawBot(state,ph){const pb=new PB(20,13),R=ramp('#d6aa52');
  pb.rect(6,2,10,7,(x,y)=>y<4?R[3]:x>13?R[1]:R[2]);pb.rect(8,4,5,2,'#1b2a2a');
  if(state==='on'){pb.set(9,5,'#7cffc8');pb.set(11,5,'#7cffc8')}else if(state==='full'){pb.set(9,5,'#ff6a5a');pb.set(11,5,'#ff6a5a')}else{pb.line(9,5,11,5,'#5a7a7a')}
  pb.rect(5,9,12,3,'#3a3028');for(let i=0;i<4;i++)pb.set(6+i*3+(ph%2),10,'#7a6a58');
  const DR=ramp('#c8d2da');pb.poly([[6,3],[6,9],[0,6]],(x,y)=>((x+y+ph)%3===0)?DR[1]:DR[3]);
  pb.rect(12,0,1,2,'#7a6a58');pb.set(12,0,state==='on'?'#7cffc8':'#5a7a7a');
  pb.outline('#120c08');return pb.canvas(1)}
const BOT_CACHE={};const botSprite=(s,ph)=>BOT_CACHE[s+ph]||(BOT_CACHE[s+ph]=drawBot(s,ph));
const CAT_CACHE={};const catSprite=f=>CAT_CACHE[f]||(CAT_CACHE[f]=drawCat(f));
/* 지층 타일 (32×32, 이어 붙여도 자연스럽게): 둥근 돌덩이들이 맞물리고 틈은 어둡게 */
function rockTile(L,kind){const N=64,lk=LOOK[L],pb=new PB(N,N),rn=rng(L*131+(kind==='back'?7:1)),base=kind==='back'?lk.dark:lk.rock,R=ramp(base);
  const seeds=[];const n=kind==='back'?14:26;for(let i=0;i<n;i++)seeds.push([rn()*N,rn()*N,.75+rn()*.6,rn()*.6-.3]);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let b1=1e9,b2=1e9,bi=0;seeds.forEach((sd,i)=>{for(let oy=-N;oy<=N;oy+=N)for(let ox=-N;ox<=N;ox+=N){const dx=x+.5-(sd[0]+ox),dy=(y+.5-(sd[1]+oy))*sd[2],d=Math.hypot(dx,dy);if(d<b1){b2=b1;b1=d;bi=i}else if(d<b2)b2=d}});
    const edge=b2-b1,sd=seeds[bi];let c;const th=(BAYER4[y&3][x&3]+.5)/16;
    if(edge<.8)c=R[1];else if(edge<1.8)c=th<.5?R[1]:R[2];else{let dx=x+.5-sd[0],dy=y+.5-sd[1];dx=((dx+N*1.5)%N)-N/2;dy=((dy+N*1.5)%N)-N/2;const v=-(dx*.55+dy*.8)/7+sd[3];
      const lv=2+v;c=R[Math.max(1,Math.min(kind==='back'?2:3,lv+th-.5>2.5?3:lv+th-.5>1.5?2:1))]}
    pb.set(x,y,c)}
  if(kind!=='back'){for(let i=0;i<40;i++){const x=Math.floor(rn()*N),y=Math.floor(rn()*N);pb.set(x,y,rn()<.5?lk.spec[0]:lk.spec[1])}for(let i=0;i<14;i++){const x=Math.floor(rn()*N),y=Math.floor(rn()*N);if(pb.get(x,y)===R[3])pb.set(x,y,R[4])}}
  else{for(let y=6;y<N;y+=11)for(let x=0;x<N;x++)if(rn()<.3)pb.set(x,y,R[0])}
  return pb.canvas(1)}
const BAYER4=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
