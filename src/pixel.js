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
// 32 기준 좌표를 N 크기로
function drawIcon(id,N){
  const it=ITEMS[id],u=N/32,R=ramp(it.c),pb=new PB(N,N),rn=rng(strSeed(id)),P=a=>a.map(p=>[p[0]*u,p[1]*u]);
  const OUT=shade(it.c,-.78);
  const chunk=(col,pts,c0=[16,16])=>{const RR=ramp(col);pb.poly(P(pts),lit(RR,c0[0]*u,c0[1]*u,12*u));
    for(let i=0;i<14*u*u;i++){const x=Math.floor(rn()*N),y=Math.floor(rn()*N);if(pb.get(x,y))pb.set(x,y,rn()<.5?RR[1]:RR[3])}};
  const CH=[[5,13],[12,5],[23,6],[28,15],[25,26],[13,29],[4,22]];
  const hi=(pts)=>pts.forEach(p=>pb.set(Math.floor(p[0]*u),Math.floor(p[1]*u),R[4]));
  const glow=(col,a)=>{const q=new PB(N,N);q.d=pb.d.slice();for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!q.get(x,y)&&(q.get(x-1,y)||q.get(x+1,y)||q.get(x,y-1)||q.get(x,y+1)||q.get(x-2,y)||q.get(x+2,y)||q.get(x,y-2)||q.get(x,y+2)))pb.set(x,y,col)};
  switch(it.sh){
  case'chunk':chunk(it.c,CH);break;
  case'speck':{chunk(it.c,CH);const sc=id==='lapis'?['#ffd23f','#fff3a0']:['#3a3030','#f4e8e0'];for(let i=0;i<22*u*u;i++){const x=Math.floor(rn()*N),y=Math.floor(rn()*N);if(pb.get(x,y))pb.set(x,y,sc[rn()<.6?0:1])}break}
  case'clay':pb.ell(16*u,18*u,13*u,9.5*u,lit(R,16*u,18*u,10*u));pb.line(9*u,16*u,15*u,15*u,R[1]);pb.line(14*u,21*u,22*u,20*u,R[1]);hi([[10,12],[11,12],[12,11]]);break;
  case'ore':{chunk(it.h,CH);const RR=R;[[11,14,4],[20,19,3.3],[14,23,2.6],[21,10,2.6]].forEach(n=>{pb.ell(n[0]*u,n[1]*u,n[2]*u,n[2]*u*.9,(x,y,dx,dy)=>RR[Math.max(1,Math.min(4,Math.round(2-dx*1.3-dy*1.3)))]);pb.set(Math.floor((n[0]-n[2]*.4)*u),Math.floor((n[1]-n[2]*.4)*u),'#ffffff')});break}
  case'coal':chunk(it.c,[[6,11],[14,4],[25,8],[28,18],[22,27],[11,28],[4,20]]);[[11,11],[19,9],[18,19],[10,20],[23,15]].forEach(p=>{pb.set(p[0]*u,p[1]*u,'#d8d4d0');if(u>.6){pb.set(p[0]*u+1,p[1]*u,'#8a8480');pb.set(p[0]*u,p[1]*u+1,'#8a8480')}});break;
  case'shard':{const C=[16,16],pts=[[15,3],[25,11],[22,28],[8,26],[6,13]],idx=[4,2,1,2,3];for(let i=0;i<pts.length;i++)pb.poly(P([pts[i],pts[(i+1)%pts.length],C]),R[idx[i]]);pb.line(14*u,6*u,9*u,13*u,R[4]);break}
  case'cube':pb.poly(P([[5,12],[16,6],[27,12],[16,18]]),R[3]);pb.poly(P([[5,12],[16,18],[16,29],[5,23]]),R[2]);pb.poly(P([[16,18],[27,12],[27,23],[16,29]]),R[1]);hi([[10,11],[11,10],[12,10],[13,9]]);pb.line(16*u,18*u,16*u,29*u,R[0]);break;
  case'cluster':{chunk(it.h||'#444',[[4,26],[8,21],[16,20],[25,21],[29,26],[23,30],[9,30]],[16,25]);
    const prism=(cx,by,w,h,lean)=>{const t=by-h,tip=t-w*.7;pb.poly(P([[cx-w/2,by],[cx-w/2+lean,t],[cx+lean,tip],[cx,by]]),R[3]);pb.poly(P([[cx,by],[cx+lean,tip],[cx+w/2+lean,t],[cx+w/2,by]]),R[1]);pb.line((cx-w/4+lean*.5)*u,(t+1)*u,(cx-w/4)*u,(by-2)*u,R[4])};
    prism(9,25,6,8,-3);prism(23,25,6,7,3);prism(16,24,8,13,0);break}
  case'lump':[[11,19,7],[21,20,6.5],[16,12,6]].forEach(c=>pb.ell(c[0]*u,c[1]*u,c[2]*u,c[2]*u,(x,y,dx,dy)=>R[Math.max(0,Math.min(4,Math.round(2-dx*1.4-dy*1.6)))]));hi([[14,9],[9,16]]);break;
  case'void':chunk(it.c,CH);pb.ell(16*u,16*u,6*u,5*u,(x,y,dx,dy)=>{const d=Math.hypot(dx,dy);return d<.45?'#05060f':d<.8?'#141a3a':R[0]});pb.set(16*u,16*u,R[4]);break;
  case'pearl':pb.ell(16*u,26*u,13*u,4*u,'#3a3550');pb.ell(16*u,15*u,9.5*u,9.5*u,(x,y,dx,dy)=>R[Math.max(1,Math.min(4,Math.round(2.6-dx*1.3-dy*1.5)))]);hi([[12,10],[13,10],[12,11]]);break;
  case'fossil':{pb.ell(16*u,17*u,12*u,11*u,lit(R,16*u,17*u,10*u));let a=0,r=10;for(let i=0;i<60;i++){a+=.35;r*=.965;pb.set(Math.floor((16+Math.cos(a)*r)*u),Math.floor((17+Math.sin(a)*r*.9)*u),R[0])}for(let k=0;k<6;k++){const aa=k*1.05;pb.line(16*u,17*u,(16+Math.cos(aa)*11)*u,(17+Math.sin(aa)*10)*u,R[1])}break}
  case'meteor':chunk(it.c,[[5,15],[10,6],[21,5],[28,12],[27,24],[17,29],[6,25]]);[[11,12,2.2],[20,10,1.6],[19,21,2.6],[10,22,1.5]].forEach(c=>pb.ell(c[0]*u,c[1]*u,c[2]*u,c[2]*u,R[0]));hi([[9,9],[10,8],[22,7]]);break;
  case'opal':{pb.ell(16*u,16*u,12*u,9.5*u,lit(R,16*u,16*u,10*u));const cs=['#ff8ac0','#8affc8','#8ac8ff','#ffe08a','#c08aff'];for(let i=0;i<34*u*u;i++){const x=Math.floor(rn()*N),y=Math.floor(rn()*N);if(pb.get(x,y))pb.set(x,y,cs[Math.floor(rn()*cs.length)])}hi([[10,11],[11,10]]);break}
  case'star':{const pts=[];for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,r=k%2?5.2:13;pts.push([16+Math.cos(a)*r,17+Math.sin(a)*r])}pb.poly(P(pts),lit(R,16*u,15*u,8*u,.3));glow('rgba(255,233,168,.45)');break}
  case'dust':pb.poly(P([[3,27],[10,17],[16,13],[22,17],[29,27]]),lit(R,16*u,18*u,10*u));for(let i=0;i<10;i++){const x=(5+rn()*22)*u,y=(4+rn()*12)*u;pb.set(x,y,'#ffffff')}break;
  case'ember':pb.poly(P([[16,3],[23,13],[25,21],[21,28],[11,28],[7,21],[10,12],[13,15]]),(x,y)=>{const d=Math.hypot(x/u-16,y/u-21);return d<4?'#fff6c8':d<7?'#ffd36a':d<10?R[2]:R[1]});glow('rgba(255,150,60,.4)');break;
  case'slag':chunk(it.c,[[4,16],[9,8],[19,7],[27,12],[28,21],[19,27],[8,26]]);[[11,13,1.6],[19,12,1.3],[21,20,1.8],[12,21,1.3]].forEach(c=>pb.ell(c[0]*u,c[1]*u,c[2]*u,c[2]*u,'#211c18'));break;
  case'block':pb.poly(P([[4,13],[16,7],[28,13],[16,19]]),R[3]);pb.poly(P([[4,13],[16,19],[16,28],[4,22]]),R[2]);pb.poly(P([[16,19],[28,13],[28,22],[16,28]]),R[1]);pb.line(4*u,17.5*u,16*u,23.5*u,R[0]);pb.line(16*u,23.5*u,28*u,17.5*u,R[0]);pb.line(10*u,16*u,10*u,25*u,R[0]);pb.line(22*u,16*u,22*u,25*u,R[0]);break;
  case'wire':for(let i=0;i<5;i++){const y=10+i*3.6;pb.ell(16*u,y*u,9*u,3*u,(x,yy,dx,dy)=>Math.hypot(dx,dy)>.62?(dy>0?R[2]:R[0]):null)}for(let i=0;i<5;i++)pb.line(9*u,(12+i*3.6)*u,13*u,(12.8+i*3.6)*u,R[4]);pb.line(23*u,8*u,27*u,4*u,R[2],Math.max(1,u*1.6));break;
  case'ingot':pb.poly(P([[3,24],[7,15],[25,15],[29,24]]),R[2]);pb.poly(P([[7,15],[10,9],[22,9],[25,15]]),R[3]);pb.rect(3*u,24*u,26*u,Math.max(1,1.5*u),R[1]);pb.rect(13*u,11*u,6*u,Math.max(1,2*u),R[2]);pb.line(10.5*u,9*u,21.5*u,9*u,R[4]);pb.line(6*u,22*u,9*u,17*u,R[3]);break;
  case'vase':{pb.poly(P([[12,4],[20,4],[19,8],[24,13],[25,20],[21,27],[11,27],[7,20],[8,13],[13,8]]),(x,y)=>{const v=(x/u-16)/9;return R[Math.max(1,Math.min(4,Math.round(3-v*1.6)))]});
    const ac=it.acc||shade(it.c,-.25);pb.line(9*u,15*u,23*u,15*u,ac);pb.line(10*u,21*u,22*u,21*u,ac);if(it.acc){pb.ell(16*u,18*u,2.4*u,2*u,ac)}pb.rect(12*u,4*u,8*u,Math.max(1,u),R[1]);break}
  case'slab':pb.poly(P([[3,17],[17,11],[29,15],[15,21]]),R[3]);pb.poly(P([[3,17],[15,21],[15,26],[3,22]]),R[2]);pb.poly(P([[15,21],[29,15],[29,20],[15,26]]),R[1]);pb.line(7*u,16.5*u,17*u,12.5*u,R[4]);break;
  case'gear':{const pts=[];for(let k=0;k<36;k++){const a=k/36*Math.PI*2,r=(k%4<2)?13.5:10.5;pts.push([16+Math.cos(a)*r,16+Math.sin(a)*r])}pb.poly(P(pts),lit(R,16*u,16*u,11*u));pb.ell(16*u,16*u,6.5*u,6.5*u,(x,y,dx,dy)=>Math.hypot(dx,dy)>.75?R[1]:null);pb.ell(16*u,16*u,3*u,3*u,'#1b1410');break}
  case'pillar':pb.rect(10*u,7*u,12*u,20*u,(x)=>R[Math.max(1,Math.min(4,Math.round(3-(x/u-16)/4)))]);for(let k=0;k<3;k++)pb.line((12.5+k*3.5)*u,9*u,(12.5+k*3.5)*u,25*u,R[1]);pb.rect(7*u,4*u,18*u,3.5*u,R[3]);pb.rect(7*u,26*u,18*u,3.5*u,R[2]);break;
  case'jar':pb.rect(11*u,4*u,10*u,3*u,'#8a5a3a');pb.poly(P([[10,7],[22,7],[25,12],[25,26],[22,29],[10,29],[7,26],[7,12]]),'#cfe6ec');pb.poly(P([[8,15],[24,15],[24,26],[21,28],[11,28],[8,26]]),lit(R,16*u,20*u,7*u));pb.line(10*u,10*u,10*u,25*u,'#ffffff');break;
  case'lens':pb.ell(16*u,16*u,12*u,12*u,(x,y,dx,dy)=>Math.hypot(dx,dy)>.82?R[0]:R[Math.max(1,Math.min(4,Math.round(2.4-dx*1.5-dy*1.5)))]);pb.line(9*u,13*u,13*u,8*u,'#ffffff',Math.max(1,u*1.5));break;
  case'cut':{const o=[],ii=[];for(let k=0;k<8;k++){const a=k/8*Math.PI*2-Math.PI/2,b=a+Math.PI/8;o.push([16+Math.cos(a)*13,16+Math.sin(a)*13]);ii.push([16+Math.cos(b)*7,16+Math.sin(b)*7])}
    for(let k=0;k<8;k++){const n=(k+1)%8,lv=(k>=5||k===0)?1:0;pb.poly(P([o[k],o[n],ii[k]]),R[k%2?1+lv:2+lv]);pb.poly(P([ii[(k+7)%8],o[k],ii[k]]),R[k%2?2+lv:1+lv])}
    pb.poly(P(ii),R[4]);pb.poly(P([ii[5],ii[6],ii[7],[16,16]]),'#ffffff');if(id==='cutopal'||id==='opal'){}break}
  case'powder':pb.poly(P([[3,27],[8,20],[12,13],[16,8],[20,13],[24,20],[29,27]]),lit(R,16*u,18*u,10*u,.2));for(let i=0;i<9;i++){const x=(6+rn()*20)*u,y=(16+rn()*10)*u;pb.set(x,y,rn()<.5?R[4]:R[0])}break;
  case'glass':pb.poly(P([[8,5],[26,3],[25,27],[6,29]]),(x,y)=>R[Math.max(1,Math.min(4,Math.round(3-((x+y)/u-32)/16)))]);pb.line(11*u,13*u,17*u,6*u,'#ffffff');pb.line(10*u,20*u,22*u,7*u,'#ffffff');pb.line(14*u,26*u,24*u,15*u,R[4]);break;
  case'drillbit':pb.poly(P([[10,4],[22,4],[22,10],[16,29],[10,10]]),lit(R,16*u,10*u,8*u));for(let k=0;k<4;k++)pb.line(10*u,(10+k*4)*u,22*u,(8+k*4)*u,R[1]);pb.rect(12*u,1*u,8*u,3*u,'#7a7f8a');break;
  case'charge':[8,13.5,19].forEach(x=>pb.rect(x*u,10*u,5*u,18*u,(xx)=>xx===Math.floor(x*u)?R[3]:R[2]));pb.rect(7*u,18*u,18*u,3*u,'#3b332a');pb.line(16*u,10*u,22*u,4*u,'#8a7a5a');pb.set(23*u,3*u,'#ffd34d');pb.set(22*u,2*u,'#fff6c8');break;
  case'engine':{const g=(cx,cy,r,col)=>{const RR=ramp(col),pts=[];for(let k=0;k<28;k++){const a=k/28*Math.PI*2,rr=(k%4<2)?r:r*.78;pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr])}pb.poly(P(pts),lit(RR,cx*u,cy*u,r*u*.8));pb.ell(cx*u,cy*u,r*.25*u,r*.25*u,'#1b1410')};g(13,18,11,it.c);g(24,9,7,'#a2e2e8');break}
  case'lantern':pb.rect(10*u,3*u,12*u,3*u,'#3a3028');pb.rect(9*u,25*u,14*u,4*u,'#3a3028');pb.ell(16*u,16*u,6*u,8*u,(x,y,dx,dy)=>Math.hypot(dx,dy)<.5?'#ffffff':R[Math.round(3-Math.hypot(dx,dy))]);pb.line(9*u,6*u,9*u,25*u,'#3a3028');pb.line(22*u,6*u,22*u,25*u,'#3a3028');glow('rgba(160,216,255,.35)');break;
  case'orb':pb.ell(16*u,16*u,9.5*u,9.5*u,(x,y,dx,dy)=>{const d=Math.hypot(dx+.35,dy+.35);return d<.35?'#ffffff':d<.7?R[4]:d<1.05?R[3]:R[2]});pb.ell(16*u,16*u,14*u,4*u,(x,y,dx,dy)=>Math.hypot(dx,dy)>.82&&(dy>0||Math.abs(dx)>.85)?R[4]:null);glow(`rgba(${parseInt(it.c.slice(1,3),16)},${parseInt(it.c.slice(3,5),16)},${parseInt(it.c.slice(5,7),16)},.4)`);break;
  case'crown':pb.poly(P([[4,25],[6,10],[11,17],[16,6],[21,17],[26,10],[28,25]]),lit(R,16*u,14*u,9*u));pb.rect(4*u,23*u,24*u,4*u,R[1]);pb.ell(16*u,19*u,2.6*u,2.6*u,'#e42a4a');pb.ell(10*u,21*u,1.7*u,1.7*u,'#2f66e0');pb.ell(22*u,21*u,1.7*u,1.7*u,'#2f66e0');break;
  default:chunk(it.c,CH);
  }
  pb.outline(OUT);
  return pb;
}
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
function drawChar(o){ // o: {ang, bob, sit, step, tier, blink, face} — 2등신, 왼쪽을 봄
  const C=CHAR_PAL,pb=new PB(40,40),ox=18,oy=37+(o.bob||0),sit=o.sit;
  const fy=sit?oy-1:oy; // 발바닥
  // 다리와 신발
  if(sit){pb.rect(ox-7,fy-3,9,3,C.over);pb.rect(ox-9,fy-3,3,3,C.boot);pb.rect(ox-8,fy-1,3,1,C.boot)}
  else{const s=o.step||0;pb.rect(ox-4+s,fy-4,3,2,C.over);pb.rect(ox+1-s,fy-4,3,2,C.overS);pb.rect(ox-5+s,fy-2,4,2,C.boot);pb.rect(ox-s,fy-2,4,2,C.boot)}
  // 몸통 (작고 통통하게)
  const by=sit?fy-3:fy-4;
  pb.rect(ox-4,by-7,9,7,C.over);pb.rect(ox+3,by-7,2,7,C.overS);pb.rect(ox-4,by-7,9,2,C.shirt);pb.rect(ox+3,by-7,2,2,C.shirtS);
  pb.set(ox-3,by-5,C.overS);pb.set(ox+1,by-5,C.overS);pb.rect(ox-2,by-3,3,1,C.overS);
  // 큰 머리
  const hx=ox-1,hy=by-13;
  pb.ell(hx,hy,7,6.5,(x,y)=>x>hx+2?C.skinS:C.skin);
  pb.ell(hx+3.5,hy+.5,3.6,5,(x,y)=>y>hy-2?C.hair:null);pb.rect(hx+4,hy-1,3,5,C.hair);
  // 얼굴 (왼쪽)
  const fc=o.face||'';
  if(fc==='joy'){pb.set(hx-6,hy+1,C.out);pb.set(hx-5,hy,C.out);pb.set(hx-4,hy+1,C.out);pb.rect(hx-5,hy+4,2,1,'#8a3a2a')}
  else if(fc==='tired'){pb.rect(hx-6,hy+1,2,1,C.out);pb.set(hx-4,hy+4,C.skinS);pb.set(hx-1,hy-3,'#9fd8ff');pb.set(hx-1,hy-2,'#9fd8ff')}
  else if(fc==='yawn'){pb.rect(hx-6,hy,2,1,C.out);pb.rect(hx-5,hy+3,2,2,'#5a2a1a')}
  else{pb.rect(hx-5,hy,1,2,o.blink?C.skinS:C.out);if(!o.blink)pb.set(hx-5,hy,'#ffffff')}
  pb.rect(hx-6,hy+3,2,1,C.cheek);pb.set(hx-7,hy+2,C.skin);
  // 헬멧
  pb.ell(hx,hy-2.5,7.6,5.2,(x,y)=>y<hy-1?(x>hx+3?C.helmS:C.helm):null);
  pb.rect(hx-9,hy-2,5,1,C.helmS);pb.rect(hx-3,hy-7,4,1,shade(C.helm,.35));
  pb.rect(hx-7,hy-5,2,2,C.lamp);pb.set(hx-8,hy-4,C.lamp);pb.set(hx-2,hy-6,'#fff3c0');pb.set(hx-1,hy-6,'#fff3c0');pb.set(hx-3,hy-5,'#fff3c0');
  // 팔과 곡괭이
  const sx=ox-1,sy=by-5,a=o.ang*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a);
  const hx2=sx+dx*5,hy2=sy+dy*5;
  const T=PICK_TIERS[o.tier||0],HR=ramp(T[2]);
  const ex=hx2+dx*10,ey=hy2+dy*10,px=-dy,py=dx;
  pb.line(hx2-dx*2,hy2-dy*2,ex,ey,C.handle,1);
  // 곡괭이 머리: 손잡이에 수직, 양 끝이 손 쪽으로 살짝 휨
  const tip=(k)=>[ex+px*k*5.5-dx*1.8,ey+py*k*5.5-dy*1.8];
  const t1=tip(1),t2=tip(-1);
  pb.line(t1[0],t1[1],ex+px*2,ey+py*2,HR[2],2);pb.line(ex-px*2,ey-py*2,t2[0],t2[1],HR[2],2);pb.line(ex-px*2,ey-py*2,ex+px*2,ey+py*2,HR[1],2);
  pb.line(t1[0],t1[1],ex+px*2,ey+py*2,HR[4],1);pb.set(Math.round(t2[0]),Math.round(t2[1]),HR[3]);
  pb.line(sx,sy,hx2,hy2,C.shirtS,2);pb.rect(Math.round(hx2-1),Math.round(hy2-1),2,2,C.skin);
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
function drawBot(state,ph){const pb=new PB(22,18),R=ramp('#d6aa52');
  pb.rect(6,5,12,8,(x,y)=>y<7?R[3]:x>15?R[1]:R[2]);pb.rect(8,7,6,3,'#1b2a2a');
  if(state==='on'){pb.set(9,8,'#7cffc8');pb.set(12,8,'#7cffc8')}else if(state==='full'){pb.set(9,8,'#ff6a5a');pb.set(12,8,'#ff6a5a')}else{pb.line(9,8,12,8,'#5a7a7a')}
  pb.rect(5,13,14,3,'#3a3028');for(let i=0;i<4;i++)pb.set(6+i*3+(ph%2),14,'#7a6a58');
  // 드릴(왼쪽)
  const DR=ramp('#c8d2da');pb.poly([[6,6],[6,12],[0,9]],(x,y)=>((x+y+ph)%3===0)?DR[1]:DR[3]);
  pb.rect(11,2,2,3,'#7a6a58');pb.set(12,1,state==='on'?'#7cffc8':'#5a7a7a');
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
