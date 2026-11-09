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
// 광물 아이콘(drawIcon)은 icons.js
// 아이콘을 만들어 CSS 클래스와 캔버스로
// 아이콘: 32px는 CSS 배경으로 한 번만 만들고 브라우저에 보관(코드가 바뀌면 새로), 16px(채굴 화면용)은 쓸 때 만든다
const ICON16={},icon16=id=>ICON16[id]||(ICON16[id]=drawIcon(id,16).canvas(1));
function buildIcons(){
  const KEY='starfall-icons',src=(document.currentScript&&document.currentScript.textContent)||'',h=strSeed(src)+':'+src.length;let css=null;
  try{const c=JSON.parse(localStorage.getItem(KEY)||'null');if(c&&c.h===h)css=c.css}catch(e){}
  if(!css){css='';ORDER.forEach(id=>{css+=`.ic-${id}{background-image:url(${drawIcon(id,32).canvas(1).toDataURL()})}`});try{localStorage.setItem(KEY,JSON.stringify({h,css}))}catch(e){}}
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
}
const ico=(id,sz='')=>`<i class="ico ${sz} ic-${id}" aria-hidden="true"></i>`;

/* 캐릭터 (옆모습, 왼쪽을 봄). 발 중앙이 기준점 (16, 31) */
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
function rockTile(L,kind){const N=64,lk=LOOK[L],pb=new PB(N,N),rn=rng(L*131+(kind==='back'?7:1)),back=kind==='back',base=back?lk.dark:lk.rock,R=ramp(base);
  // 둥근 돌이 맞물린 벽: 돌마다 왼쪽 위는 빛을 받아 테두리가 밝고, 오른쪽 아래 틈은 깊게
  const seeds=[];const n=back?14:24;for(let i=0;i<n;i++)seeds.push([rn()*N,rn()*N,.75+rn()*.6,rn()*.6-.3]);
  const AU=['#62f0c4','#5fcff2','#a58cff','#ff8fd6'],au=L>=10?[.3,.55,.85][L-10]:0; // 깊은 지층: 틈 사이로 오로라
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let b1=1e9,b2=1e9,bi=0;seeds.forEach((sd,i)=>{for(let oy=-N;oy<=N;oy+=N)for(let ox=-N;ox<=N;ox+=N){const dx=x+.5-(sd[0]+ox),dy=(y+.5-(sd[1]+oy))*sd[2],d=Math.hypot(dx,dy);if(d<b1){b2=b1;b1=d;bi=i}else if(d<b2)b2=d}});
    const edge=b2-b1,sd=seeds[bi];let c;const th=(BAYER4[y&3][x&3]+.5)/16;
    let dx=x+.5-sd[0],dy=y+.5-sd[1];dx=((dx+N*1.5)%N)-N/2;dy=((dy+N*1.5)%N)-N/2;const side=-(dx*.55+dy*.8);
    if(edge<.8){c=R[0];if(au&&!back){const w=Math.sin(x*.21+y*.13+L)+Math.sin(y*.17-x*.07);if(w>1.1-au*1.4)c=AU[((x+y*2)>>4)&3]}}
    else if(edge<1.8)c=side>0?(th<.5?R[2]:R[1]):R[1];
    else if(edge<2.8&&!back)c=side>2?R[Math.min(4,3+(th<.35?1:0))]:side<-2?R[1]:R[2];
    else{const v=side/7+sd[3],lv=2+v;c=R[Math.max(1,Math.min(back?2:3,lv+th-.5>2.5?3:lv+th-.5>1.5?2:1))]}
    pb.set(x,y,c)}
  if(!back){
    for(let i=0;i<40;i++){const x=Math.floor(rn()*N),y=Math.floor(rn()*N);pb.set(x,y,rn()<.5?lk.spec[0]:lk.spec[1])}
    for(let i=0;i<14;i++){const x=Math.floor(rn()*N),y=Math.floor(rn()*N);if(pb.get(x,y)===R[3])pb.set(x,y,R[4])}
    // 작은 조약돌 (반짝이는 윗면)
    for(let i=0;i<6;i++){const x=Math.floor(rn()*(N-3)),y=Math.floor(rn()*(N-2)),P=ramp(lk.spec[0]);pb.rect(x,y,3,2,P[2]);pb.set(x,y,P[4]);pb.set(x+1,y,P[3]);pb.rect(x,y+2,3,1,R[0])}
    // 층마다 작은 디테일
    const D=lk.deco;
    if(D==='grass')for(let i=0;i<5;i++){const x=Math.floor(rn()*(N-6)),y=Math.floor(rn()*(N-4));for(let k=0;k<6;k++)pb.set(x+k,y+Math.round(Math.sin(k*1.3)),'#6a4a2a');pb.set(x+2,y-1,'#8a6a3a')} // 나무뿌리
    if(D==='shards'||D==='stalactite')for(let i=0;i<4;i++){const x=Math.floor(rn()*(N-4)),y=Math.floor(rn()*(N-5));pb.rect(x+1,y+2,2,3,'#c8b8a0');pb.set(x+1,y+1,'#f0e4d0');pb.rect(x,y+3,1,2,'#8a7a64');pb.set(x+3,y+3,'#d8c0e8');pb.set(x+3,y+2,'#b898d0')} // 작은 버섯
    if(D==='crystal'||D==='drip')for(let i=0;i<4;i++){const x=Math.floor(rn()*(N-4)),y=Math.floor(rn()*(N-6)),C=ramp(lk.band);pb.rect(x+1,y+1,2,4,C[2]);pb.set(x+1,y+1,C[4]);pb.set(x+2,y,C[3]);pb.rect(x,y+3,1,2,C[1]);pb.rect(x+3,y+3,1,2,C[1])}
    if(D==='goldspeck')for(let i=0;i<18;i++){const x=Math.floor(rn()*N),y=Math.floor(rn()*N);pb.set(x,y,rn()<.3?'#fff2a0':'#ffd23f')}
    if(D==='lava')for(let i=0;i<3;i++){let x=rn()*N,y=rn()*N;for(let k=0;k<14;k++){x+=rn()*2-.6;y+=rn()*2-1;pb.set(x,y,k%4?'#e2581e':'#ffb84a')}}
    if(D==='glass'||D==='diamond')for(let i=0;i<6;i++){const x=Math.floor(rn()*(N-2)),y=Math.floor(rn()*(N-2));pb.set(x,y,'#ffffff');pb.set(x+1,y+1,lk.band)}
    if(au)for(let i=0;i<10+L*2;i++){const x=Math.floor(rn()*N),y=Math.floor(rn()*N);pb.set(x,y,rn()<.5?'#ffffff':AU[i&3])}}
  else{for(let y=6;y<N;y+=11)for(let x=0;x<N;x++)if(rn()<.3)pb.set(x,y,R[0]);
    if(au)for(let y=0;y<N;y++)for(let x=0;x<N;x++){const w=Math.sin(x*.09+y*.05+L)*Math.sin(y*.12-x*.03);if(w>.72-au*.3&&((x+y)&1))pb.set(x,y,shade(AU[((x>>3)+L)&3],-.55))}}
  return pb.canvas(1)}
const BAYER4=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
