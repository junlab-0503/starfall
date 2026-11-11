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
  const st=document.createElement('style');st.textContent=css+`.ic-coin{background-image:url(${coinIcon()})}`;document.head.appendChild(st);
}
// 골드(돈) 아이콘: 금화 더미(금괴 아이콘과 구분)
function coinIcon(){const pb=new PB(32,32),G=['#6a3e08','#a8661a','#e0a22a','#ffd23f','#fff3b0'],coin=(cx,cy)=>{pb.ell(cx,cy+1.5,7.5,3.6,G[0]);pb.ell(cx,cy,7.5,3.6,G[2]);pb.ell(cx,cy-.3,5.4,2.4,G[3]);pb.rect(cx-1,cy-2,2,1,G[4])},
  side=(cx,top,n)=>{for(let k=0;k<n;k++){const y=top+k*2.4;pb.ell(cx,y+1.5,7.5,3.6,G[0]);pb.rect(cx-7,y,15,2,k%2?G[1]:G[2])}};
  side(10,20,3);coin(10,19);side(22,23,2);coin(22,22);side(15,13,4);coin(15,12);pb.set(12,10,G[4]);pb.set(13,10,G[4]);pb.outline('#2a1606');return pb.canvas(1).toDataURL()}
const ico=(id,sz='')=>`<i class="ico ${sz} ic-${id}" aria-hidden="true"></i>`;

/* 캐릭터 (옆모습, 왼쪽을 봄). 발 중앙이 기준점 (16, 31) */
/* 고양이 숯 */
