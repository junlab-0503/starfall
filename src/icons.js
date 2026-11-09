/* ═════════ 광물 아이콘 ═════════
   작은 입체(바위, 결정, 주괴, 보석 컷, 항아리…)를 비스듬히 돌려 면마다 빛을 받아 칠하고,
   도트 외곽선 · 반짝임 · 은은한 빛무리를 더한다. 빛은 왼쪽 위 앞에서. 32×32(아이콘), 16×16(채굴 화면). */
const V3={rx(p,a){const c=Math.cos(a),s=Math.sin(a);return[p[0],p[1]*c-p[2]*s,p[1]*s+p[2]*c]},
  ry(p,a){const c=Math.cos(a),s=Math.sin(a);return[p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c]},
  rz(p,a){const c=Math.cos(a),s=Math.sin(a);return[p[0]*c-p[1]*s,p[0]*s+p[1]*c,p[2]]},
  sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],nrm:a=>{const l=Math.hypot(a[0],a[1],a[2]);return l?[a[0]/l,a[1]/l,a[2]/l]:[0,0,0]}};
const H32=(x,y,s=0)=>{let h=Math.imul((x|0)*374761393+(y|0)*668265263+s*982451653,1274126177);h^=h>>>13;h=Math.imul(h,1103515245);return((h>>>0)%10007)/10007};
// 변형: 크기 → 제자리 돌기(ry) → 기울기(rx) → 눕히기(rz) → 옮기기
function T3(M,{s=1,sx=s,sy=s,sz=s,rx=0,ry=0,rz=0,x=0,y=0,z=0,sh=0}={}){return{...M,v:M.v.map(p=>{let q=[p[0]*sx+p[1]*sh,p[1]*sy,p[2]*sz];if(ry)q=V3.ry(q,ry);if(rx)q=V3.rx(q,rx);if(rz)q=V3.rz(q,rz);return[q[0]+x,q[1]+y,q[2]+z]})}}
// 각기둥(결정·상자·원통). tip: 위 뾰족, tipB: 아래 뾰족, rt: 윗면 반지름
function mPrism(n,r,h,o={}){const{rt=r,tip=0,tipB=0,rot=0}=o,v=[],f=[];
  for(let k=0;k<n;k++){const a=rot+k/n*6.2832;v.push([Math.cos(a)*r,0,Math.sin(a)*r])}
  for(let k=0;k<n;k++){const a=rot+k/n*6.2832;v.push([Math.cos(a)*rt,h,Math.sin(a)*rt])}
  for(let k=0;k<n;k++){const q=(k+1)%n;f.push([k,q,n+q,n+k])}
  if(tip){v.push([0,h+tip,0]);const t=v.length-1;for(let k=0;k<n;k++)f.push([n+k,n+(k+1)%n,t])}else f.push([...Array(n).keys()].map(k=>n+k));
  if(tipB){v.push([0,-tipB,0]);const t=v.length-1;for(let k=0;k<n;k++)f.push([k,(k+1)%n,t])}else f.push([...Array(n).keys()]);
  return{v,f}}
const mBox=(w,h,d,o={})=>T3(mPrism(4,Math.SQRT1_2,h,{rot:Math.PI/4,rt:Math.SQRT1_2*(o.inset??1)}),{sx:w,sz:d});
// 울퉁불퉁한 돌덩이 (어긋난 고리로 삼각면)
function mRock(seed,{rings=4,segs=7,j=.18,flat=.6}={}){const R=rng(seed),v=[],f=[],ph0=R()*6.28;
  v.push([(R()-.5)*.25,1+(R()-.5)*j,(R()-.5)*.25]);
  for(let i=1;i<rings;i++){const ph=i/rings*Math.PI,off=(i%2)*.5;for(let k=0;k<segs;k++){const th=ph0+(k+off)/segs*6.2832,rr=1+(R()-.5)*2*j;v.push([Math.sin(ph)*Math.cos(th)*rr,Math.cos(ph)*rr,Math.sin(ph)*Math.sin(th)*rr])}}
  v.push([0,-1,0]);const B=v.length-1,I=(i,k)=>1+(i-1)*segs+((k%segs)+segs)%segs;
  for(let k=0;k<segs;k++)f.push([0,I(1,k),I(1,k+1)]);
  for(let i=1;i<rings-1;i++)for(let k=0;k<segs;k++){if(i%2===0){f.push([I(i,k),I(i,k+1),I(i+1,k)]);f.push([I(i,k+1),I(i+1,k+1),I(i+1,k)])}else{f.push([I(i,k),I(i+1,k+1),I(i+1,k)]);f.push([I(i,k),I(i,k+1),I(i+1,k+1)])}}
  for(let k=0;k<segs;k++)f.push([B,I(rings-1,k+1),I(rings-1,k)]);
  if(flat<1)v.forEach(p=>{if(p[1]<-flat)p[1]=-flat});return{v,f}}
// 돌림판 모양(항아리, 병, 그릇, 구슬): prof=[[반지름,높이]…] 아래에서 위로
function mLathe(prof,segs=12,rot=0){const v=[],f=[],ref=[],n=prof.length;
  prof.forEach(([r,y])=>{for(let k=0;k<segs;k++){const a=rot+k/segs*6.2832;v.push([Math.cos(a)*r,y,Math.sin(a)*r])}});
  for(let j=0;j<n-1;j++){const[r0,y0]=prof[j],[r1,y1]=prof[j+1],dr=r1-r0,dy=y1-y0,l=Math.hypot(dr,dy)||1,rm=(r0+r1)/2,ym=(y0+y1)/2;
    for(let k=0;k<segs;k++){const q=(k+1)%segs,a=rot+(k+.5)/segs*6.2832,rr=rm-.2*dy/l;f.push([j*segs+k,j*segs+q,(j+1)*segs+q,(j+1)*segs+k]);v.push([Math.cos(a)*rr,ym+.2*dr/l,Math.sin(a)*rr]);ref.push(v.length-1)}}
  if(prof[n-1][0]>0){f.push([...Array(segs).keys()].map(k=>(n-1)*segs+k));v.push([0,prof[n-1][1]-1,0]);ref.push(v.length-1)}
  if(prof[0][0]>0){f.push([...Array(segs).keys()]);v.push([0,prof[0][1]+1,0]);ref.push(v.length-1)}
  return{v,f,ref}}
const sphereProf=(r=1,k=7)=>[...Array(k+1).keys()].map(i=>{const a=-Math.PI/2+i/k*Math.PI;return[Math.max(0,Math.cos(a)*r)+(i===0||i===k?0:0),Math.sin(a)*r]});
// 납작한 판을 위로 밀어 올린 모양 (톱니바퀴 등)
function mExtrude(pts,h){const v=[],f=[],ref=[],n=pts.length;let A=0;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];A+=a[0]*b[1]-b[0]*a[1]}const sg=A>0?1:-1;
  pts.forEach(([x,z])=>v.push([x,0,z]));pts.forEach(([x,z])=>v.push([x,h,z]));
  for(let i=0;i<n;i++){const q=(i+1)%n,a=pts[i],b=pts[q],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;f.push([i,q,n+q,n+i]);v.push([(a[0]+b[0])/2-sg*.2*dz/l,h/2,(a[1]+b[1])/2+sg*.2*dx/l]);ref.push(v.length-1)}
  f.push([...Array(n).keys()].map(k=>n+k));v.push([0,h-1,0]);ref.push(v.length-1);f.push([...Array(n).keys()]);v.push([0,1,0]);ref.push(v.length-1);
  return{v,f,ref}}
// 보석 컷: 브릴리언트(테두리 16점) / 계단 컷(테두리 n점)
function mBrill(out,{table=.56,crown=.32,pav=.85}={}){const v=out.map(([x,z])=>[x,0,z]),f=[];for(let k=0;k<8;k++){const[x,z]=out[2*k];v.push([x*table,crown,z*table])}v.push([0,-pav,0]);
  const C=v.length-1,G=i=>((i%16)+16)%16,Tt=k=>16+((k%8)+8)%8;f.push([...Array(8).keys()].map(Tt));
  for(let k=0;k<8;k++){f.push([Tt(k),Tt(k+1),G(2*k+1)]);f.push([Tt(k),G(2*k+1),G(2*k)]);f.push([Tt(k+1),G(2*k+2),G(2*k+1)])}
  for(let i=0;i<16;i++)f.push([G(i),G(i+1),C]);return{v,f}}
function mStep(out,rings=[[1,0],[.84,.13],[.7,.23],[.58,.29]],pav=.65){const n=out.length,v=[],f=[];rings.forEach(([s,y])=>out.forEach(([x,z])=>v.push([x*s,y,z*s])));
  for(let r=0;r<rings.length-1;r++)for(let k=0;k<n;k++){const q=(k+1)%n;f.push([r*n+k,r*n+q,(r+1)*n+q,(r+1)*n+k])}
  f.push([...Array(n).keys()].map(k=>(rings.length-1)*n+k));v.push([0,-pav,0]);const C=v.length-1;for(let k=0;k<n;k++)f.push([k,(k+1)%n,C]);return{v,f}}
const GIRDLE={round:k=>{const a=k/16*6.2832;return[Math.cos(a),Math.sin(a)]},oval:k=>{const a=k/16*6.2832;return[Math.cos(a)*.78,Math.sin(a)]},
  cushion:k=>{const a=k/16*6.2832,c=Math.cos(a),s=Math.sin(a),r=Math.pow(Math.pow(Math.abs(c),3.2)+Math.pow(Math.abs(s),3.2),-1/3.2)*.86;return[c*r,s*r]},
  pear:k=>{const a=k/16*6.2832,c=Math.cos(a),s=Math.sin(a),w=s<0?1-.78*Math.pow(-s,1.6):1;return[c*.8*w,s*(s<0?1.12:.86)]},
  trill:k=>{const a=k/16*6.2832-Math.PI/2,c=Math.cos(a),s=Math.sin(a),t=((a%2.0944)+2.0944)%2.0944-1.0472,r=.62/Math.cos(t*.86);return[c*r,s*r]}};
const girdle=t=>[...Array(16).keys()].map(GIRDLE[t]);
const OCT=(w,l,c=.2)=>[[-w+c,-l],[w-c,-l],[w,-l+c],[w,l-c],[w-c,l],[-w+c,l],[-w,l-c],[-w,-l+c]];
// 색 계단
const metalRamp=c=>[hshift(c,-.82),hshift(c,-.58),hshift(c,-.3),c,hshift(c,.6)];
const gemRamp=c=>[hshift(c,-.82),hshift(c,-.56),hshift(c,-.24),c,hshift(c,.55)];
const MAT={
  rock:(c,o={})=>({R:ramp(c),jit:.7,tex:(x,y,i,col,R)=>{const h=H32(x,y,o.seed||3);return h<(o.dk??.13)?R[Math.max(0,i-1)]:h>1-(o.lt??.07)?R[Math.min(4,i+1)]:o.fleck&&h>.5&&h<.5+o.fleck[1]?o.fleck[0]:col},...o}),
  metal:(c,o={})=>({R:metalRamp(c),sp:1,ex:22,...o}),
  gem:(c,o={})=>({R:gemRamp(c),sp:1,ex:26,jit:1.7,b:-.15,...o}),
  glass:(c,o={})=>({R:ramp(c),sp:1,ex:18,...o}),
  flat:(c,o={})=>({R:ramp(c),...o})};
// 그리기: 면을 깊이 순서로, 빛 방향에 따라 5단계 + 반사광
const LIT=V3.nrm([-.4,.8,.45]),HV=V3.nrm([LIT[0],LIT[1],LIT[2]+1.2]);
function draw3(pb,list,{cx,cy,sc,tilt}){const F=[],N=pb.w,own=new Int16Array(N*N).fill(-1),mz=[];
  list.forEach((M,mi)=>{const V=M.v.map(p=>V3.rx(p,tilt));let c=[0,0,0];V.forEach(p=>{c[0]+=p[0];c[1]+=p[1];c[2]+=p[2]});c=c.map(x=>x/V.length);mz[mi]=c[2]+(M.m.zb||0)+(M.zo||0);
    M.f.forEach((f,k)=>{const P=f.map(i=>V[i]);let n=V3.nrm(V3.cross(V3.sub(P[1],P[0]),V3.sub(P[2],P[0])));if(!n[0]&&!n[1]&&!n[2]&&P[3])n=V3.nrm(V3.cross(V3.sub(P[2],P[0]),V3.sub(P[3],P[0])));
      const fc=[0,1,2].map(j=>P.reduce((s,p)=>s+p[j],0)/P.length),ref=M.ref&&M.ref[k]!=null?V[M.ref[k]]:c;if(V3.dot(n,V3.sub(fc,ref))<0)n=n.map(x=>-x);
      if(n[2]<=.015)return;F.push({P,n,z:fc[2]+(M.m.zb||0),m:M.m,k,mi,tab:M.tf===k})})});
  F.sort((a,b)=>a.z-b.z);
  F.forEach(o=>{const m=o.m,d=V3.dot(o.n,LIT);let i=Math.round((d+1)/2*5.4-1+(m.b||0)+(m.jit?((o.k*37+11)%9/8-.5)*m.jit:0));i=Math.max(0,Math.min(4,i));
    const sp=m.sp?Math.pow(Math.max(0,V3.dot(o.n,HV)),m.ex||12)*m.sp:0,R=m.R;let col=R[i];if(sp>.72)col=m.hi||'#ffffff';else if(sp>.38)col=R[Math.min(4,i+1)];
    const pts=o.P.map(p=>[cx+p[0]*sc,cy-p[1]*sc]),mx=pts.reduce((s,p)=>s+p[0],0)/pts.length,my=pts.reduce((s,p)=>s+p[1],0)/pts.length;
    const ex=pts.map(([x,y])=>{const dx=x-mx,dy=y-my,l=Math.hypot(dx,dy)||1;return[x+dx/l*.3,y+dy/l*.3]});
    pb.poly(ex,(x,y)=>{own[(y|0)*N+(x|0)]=o.mi;let cc=m.tex?m.tex(x,y,i,col,R):col;
      if(o.tab){const dx=x+.5-mx,dy=y+.5-my,v=(dx+dy)/(sc*.5),a=Math.atan2(dy,dx),w=((a+Math.PI)/(Math.PI/4)|0)%2;cc=v<-.55?R[4]:v<-.25?R[3]:v>.45?R[1]:w?R[2]:R[3]}
      return cc})});
  // 앞에 놓인 물체와 맞닿은 뒤쪽 물체 가장자리를 어둡게 (겹친 결정·진주·벽돌이 한 덩어리로 보이지 않게)
  const src=pb.d.slice();for(let y=0;y<N;y++)for(let x=0;x<N;x++){const a=own[y*N+x];if(a<0||list[a].m.noEdge)continue;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=N||yy>=N)continue;const b=own[yy*N+xx];
      if(b>=0&&b!==a&&mz[b]>mz[a]+.02&&!list[b].m.noEdge){const c0=src[y*N+x];if(c0&&c0[0]==='#')pb.set(x,y,hshift(c0,-.62));break}}}}
// 덧그림 도구
function fxGlow(pb,col,r=2){const N=pb.w,src=pb.d.slice(),a=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(src[y*N+x])continue;let best=9;
  for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=N||yy>=N||!src[yy*N+xx])continue;best=Math.min(best,Math.hypot(dx,dy))}
  if(best<=r+.3)a.push([x,y,best])}a.forEach(([x,y,d])=>pb.set(x,y,col.replace('A',(.55*(1-(d-1)/(r+.5))).toFixed(2))))}
function fxSpark(pb,x,y,n=2,c='#ffffff',c2='rgba(255,255,255,.55)'){x|=0;y|=0;pb.set(x,y,c);for(let k=1;k<=n;k++){const cc=k===n?c2:c;pb.set(x+k,y,cc);pb.set(x-k,y,cc);pb.set(x,y+k,cc);pb.set(x,y-k,cc)}}
function fxRim(pb){const N=pb.w,src=pb.d.slice(),g=(x,y)=>x<0||y<0||x>=N||y>=N?null:src[y*N+x];for(let y=0;y<N;y++)for(let x=0;x<N;x++){const c=g(x,y);if(!c||c[0]!=='#')continue;if(!g(x-1,y)&&!g(x,y-1)||!g(x,y-1)&&!g(x-1,y-1))pb.set(x,y,hshift(c,.28))}}

/* 아이콘별 설계. c = 도구 모음 */
const ICON_SH={
  rock(c,col=c.it.c,o={}){c.add(T3(mRock(c.seed,{rings:4,segs:7,j:.2,flat:.55}),{sx:1.05,sy:.8,sz:.92,ry:c.rn()*6,...o.t}),MAT.rock(col,o));
    if(o.pebble!==false)c.add(T3(mRock(c.seed+9,{rings:3,segs:5,j:.25,flat:.5}),{s:.3,x:.86,y:-.52,z:.45}),MAT.rock(col,o))},
  ore(c){const{it}=c,host=it.h||'#5a5550',fl={copper:['#4fbf8a',.05],cobalt:['#e070a8',.05],iron:['#a65a32',.07],gold:['#ffe27a',.03],tin:['#3a3028',.06]}[c.id];
    ICON_SH.rock(c,host,{fleck:fl,pebble:false});const big=c.id==='gold'?1.25:1;
    [[-.42,.42,.55,.33],[.36,.52,.42,.27],[.06,.02,.88,.25],[.6,0,.58,.19],[-.7,-.1,.5,.16]].forEach(([x,y,z,s],k)=>c.add(T3(mRock(c.seed+k*7+1,{rings:3,segs:5,j:.32,flat:1}),{s:s*big,x,y,z,ry:k*1.3}),MAT.metal(it.c)))},
  cluster(c,spec){const{it}=c;c.add(T3(mRock(c.seed,{rings:3,segs:7,j:.22,flat:.3}),{sx:1.12,sy:.42,sz:.85,y:-.5,ry:c.rn()*6}),MAT.rock(it.h||'#3a3a44',{dk:.18}));
    spec.forEach(([x,z,r,h,lean,tw,n,tip,rt,tb],k)=>c.add(T3(mPrism(n||6,r,h,{tip:tip??r*.9,rt:rt??r,tipB:tb||0}),{ry:k*.9+.3,rz:lean,rx:tw||0,x,y:-.55,z}),MAT.gem(it.c,c.gemo||{})))},
  gem(c,cut,o={}){if(o.side!==false){const st=cut==='step',out=o.out||OCT(.68,1),M=st?mStep(out,[[1,0],[.84,.14],[.68,.24]],.95):mBrill(girdle(cut),{table:.56,crown:.4,pav:1.05});M.tf=st?M.f.length-1-out.length:0;
      c.add(T3(M,{s:o.s||1.08,rx:o.rx??-.02,ry:o.spin??.25,y:.32}),MAT.gem(c.it.c,c.gemo||{}));c.fx.push(pb=>fxSpark(pb,9*c.u,9*c.u,c.u>.7?2:1));return}
    const M=cut==='step'?mStep(o.out||OCT(.68,1)):mBrill(girdle(cut),o);M.tf=cut==='step'?M.f.length-1-(o.out||OCT(.68,1)).length:0;c.add(T3(M,{s:o.s||1.02,rx:.62,ry:o.spin??.18,y:o.y??-.12}),MAT.gem(c.it.c,c.gemo||{}));
    c.fx.push(pb=>{fxSpark(pb,9*c.u,9*c.u,c.u>.7?2:1)})},
  cabo(c,o={}){c.add(T3(mLathe([[1,0],[.97,.22],[.86,.46],[.66,.66],[.38,.8],[0,.86]],16),{sx:o.sx||.82,sz:1,sy:.9,rx:.5,y:-.25}),{...MAT.glass(c.it.c,{ex:10,sp:.9}),tex:o.tex})},
  ingot(c,o={}){const col=o.col||c.it.c;c.add(T3(mBox(1.75,.55,.9,{inset:.78}),{ry:-.52,y:-.38}),MAT.metal(col,{tex:o.tex}));
    c.add(T3(mBox(.55,.05,.28),{ry:-.52,y:.17,x:.02}),MAT.metal(col,{b:-.9,sp:.3,zb:.05}))},
  powder(c,col,bowl){if(bowl)c.add(T3(mLathe([[.55,-.6],[.9,-.35],[1.05,0]],14),{y:-.15}),MAT.rock(bowl,{dk:.05,lt:.03}));
    c.add(T3(mLathe([[.98,0],[.75,.22],[.4,.42],[0,.52]],14),{y:bowl?-.17:-.5,s:bowl?.95:1.1}),MAT.rock(col,{dk:.2,lt:.18}))},
  glow(c,col,r=2){c.fx.push(pb=>fxGlow(pb,col,r))}
};
// 톱니바퀴는 도트로 직접: 이빨 모양(사다리꼴) · 아래로 깔린 두께 · 테두리 홈 · 바람구멍 · 가운데 축
function gear2D(pb,u,{cx,cy,R,n=9,col,T=3,spokes=4,sq=.88,rot=.12}){const RR=[hshift(col,-.82),hshift(col,-.58),hshift(col,-.28),col,hshift(col,.5)],cxp=cx*u,cyp=cy*u,Rp=R*u,R0p=R*.72*u,N=pb.w;
  const prof=a=>{let t=((a/(6.2832/n))%1+1)%1;t=Math.abs(t-.5)*2;return t<.4?1:t>.66?0:1-(t-.4)/.26};
  const pol=(x,y)=>{const dx=x+.5-cxp,dy=(y+.5-cyp)/sq;return[Math.hypot(dx,dy)/Rp,Math.atan2(dy,dx),dx/Rp,dy/Rp]};
  // 0: 바깥, 1: 몸체, 2: 뚫린 곳(바퀴살 사이)
  const kind=(x,y)=>{const[r,a,dx,dy]=pol(x,y);if(r*Rp>R0p+(Rp-R0p)*prof(a+rot))return 0;if(r<.56&&r>.22&&spokes){let ok=false;for(let k=0;k<spokes;k++){const b=k/spokes*6.2832+.4,d=Math.abs(-Math.sin(b)*dx+Math.cos(b)*dy),f=Math.cos(b)*dx+Math.sin(b)*dy;if(d<.085&&f>0)ok=true}if(!ok)return 2}return 1};
  const Td=Math.max(1,Math.round(T*u));
  for(let d=Td;d>=1;d--)for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(kind(x,y-d)===1&&kind(x,y)!==1)pb.set(x,y,d===Td?RR[0]:RR[1]);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const k=kind(x,y);if(k!==1)continue;const[r,a]=pol(x,y),lt=-Math.cos(a+.8);
    const edgeO=kind(x-1,y)===0||kind(x,y-1)===0||kind(x+1,y)===0||kind(x,y+1)===0,edgeH=kind(x-1,y)===2||kind(x,y-1)===2||kind(x+1,y)===2||kind(x,y+1)===2;
    let c=RR[3];if(edgeO)c=lt>.15?RR[4]:lt<-.35?RR[2]:RR[3];else if(edgeH)c=lt<-.15?RR[4]:RR[2];else if(r>.62&&r<.7)c=lt>0?RR[2]:RR[4];else if(r<.2)c=r<.09?'#0c0806':(lt>0?RR[4]:RR[2]);else if(lt>.6&&r>.7)c=RR[4];
    pb.set(x,y,c)}}
const SPARK_IN=(c,pts)=>c.fx.push(pb=>pts.forEach(([x,y,n])=>fxSpark(pb,x*c.u,y*c.u,c.u>.7?(n||1):1)));
const ICON_DEF={
  /* ── 돌·흙 ── */
  stone:c=>ICON_SH.rock(c),
  clay:c=>{c.add(T3(mRock(c.seed,{rings:5,segs:9,j:.07,flat:.45}),{sx:1.05,sy:.62,sz:.9,y:-.2}),MAT.rock(c.it.c,{sp:.5,ex:5,dk:.06,lt:.03}));
    c.add(T3(mRock(c.seed+2,{rings:4,segs:7,j:.08,flat:.4}),{s:.38,x:.75,y:-.45,z:.4}),MAT.rock(c.it.c,{sp:.5,ex:5,dk:.06,lt:.03}))},
  kaolin:c=>ICON_DEF.clay(c),
  flint:c=>{c.add(T3(mRock(c.seed,{rings:3,segs:6,j:.28,flat:.5}),{sx:1.1,sy:.75,sz:.8,ry:.4}),MAT.rock(c.it.c,{sp:.9,ex:9,hi:'#c8d2e8',tex:(x,y,i,col,R)=>(Math.floor(Math.hypot(x-10*c.u,y-9*c.u)/(2.2*c.u))%2?R[Math.min(4,i+1)]:col)}))},
  obsidian:c=>{const m=MAT.glass(c.it.c,{ex:24,tex:(x,y,i,col,R)=>(Math.floor((x+y*1.4)/(3*c.u))%3===0&&i<4?R[i+1]:col)});
    c.add(T3(mPrism(5,.44,1.15,{rt:.3,tip:.5,tipB:.3}),{rz:-.55,ry:.4,y:-.45,x:.1}),m);c.add(T3(mPrism(4,.26,.55,{tip:.35,tipB:.15}),{rz:.7,x:-.55,y:-.55,z:.3}),m)},
  granite:c=>ICON_SH.rock(c,c.it.c,{tex:(x,y,i,col,R)=>{const h=H32(x,y,5);return h<.12?'#2a2428':h<.2?'#f6ece4':h<.3?'#e09a8a':h<.36?R[Math.max(0,i-1)]:col}}),
  limestone:c=>{c.add(T3(mRock(c.seed,{rings:3,segs:5,j:.12,flat:.55}),{sx:1.1,sy:.82,sz:.9,ry:.6}),MAT.rock(c.it.c,{tex:(x,y,i,col,R)=>(y/c.u|0)%5===0?R[Math.max(0,i-1)]:H32(x,y)<.05?R[Math.max(0,i-1)]:col}))},
  basalt:c=>{const m=MAT.flat(c.it.c,{b:.2,tex:(x,y,i,col,R)=>H32(x,y)<.08?R[Math.max(0,i-1)]:col});[[-.42,.12,1.05],[.42,.18,.82],[0,-.42,1.3],[.05,.6,.7]].forEach(([x,z,h],k)=>c.add(T3(mPrism(6,.42,h,{rot:.3}),{x,z,y:-.75}),m))},
  coal:c=>{const m=MAT.rock(c.it.c,{sp:1,ex:6,hi:'#b8c8e8',dk:.05,lt:.05});c.add(T3(mRock(c.seed,{rings:3,segs:6,j:.3,flat:.5}),{sx:.9,sy:.75,sz:.8,x:-.18,y:-.05}),m);c.add(T3(mRock(c.seed+3,{rings:3,segs:5,j:.3,flat:.5}),{s:.5,x:.62,y:-.4,z:.35}),m)},
  slag:c=>{c.add(T3(mRock(c.seed,{rings:4,segs:7,j:.22,flat:.5}),{sx:1,sy:.72,sz:.85}),MAT.rock(c.it.c,{sp:.6,ex:8,tex:(x,y,i,col,R)=>{const cx=Math.floor(x/(4*c.u)),cy=Math.floor(y/(4*c.u)),h=H32(cx,cy,2);return h<.35&&Math.hypot(x/(4*c.u)-cx-.5,y/(4*c.u)-cy-.5)<.28?'#1a1612':col}}))},
  /* ── 결정·입방 ── */
  halite:c=>{const m=MAT.glass(c.it.c,{ex:10,sp:.7,b:.3});[[0,0,.6,0],[-.55,.3,.45,.5],[.5,.35,.4,.9]].forEach(([x,z,s,r],k)=>c.add(T3(mBox(s*1.4,s*1.4,s*1.4),{ry:r+.3,x,z,y:-.7+(k?0:.05)}),m))},
  calcite:c=>{const m=MAT.glass(c.it.c,{ex:12,sp:.8,b:.2});c.add(T3(mBox(1.15,1.05,.9),{sh:.42,ry:.5,y:-.6,x:-.2}),m);c.add(T3(mBox(.5,.45,.4),{sh:.3,ry:.3,x:.7,y:-.62,z:.4}),m)},
  pyrite:c=>{const m=MAT.metal(c.it.c,{tex:(x,y,i,col,R)=>((x+y)/c.u|0)%3===0&&i>0?R[i-1]:col});[[-.15,0,.75,.4,.1],[.55,.3,.5,1.1,-.05],[-.6,.45,.42,.7,0]].forEach(([x,z,s,r,yy])=>c.add(T3(mBox(s*1.2,s*1.2,s*1.2),{ry:r,rx:.15,x,z,y:-.7+yy}),m))},
  quartz:c=>ICON_SH.cluster(c,[[0,0,.27,1.05,0],[-.4,.1,.22,.75,.45],[.38,.15,.2,.65,-.5],[.12,.42,.15,.45,-.2],[-.15,-.3,.17,.55,.15]]),
  amethyst:c=>ICON_SH.cluster(c,[[0,.05,.3,.75,0],[-.42,.15,.27,.55,.45],[.42,.15,.26,.5,-.45],[-.12,.45,.22,.4,.2],[.2,-.3,.24,.6,-.12]]),
  emerald:c=>ICON_SH.cluster(c,[[.05,0,.3,1.05,-.1,0,6,0],[-.45,.15,.25,.7,.42,0,6,0],[.48,.2,.22,.6,-.5,0,6,0],[-.1,.45,.17,.42,.15,0,6,0]]),
  ruby:c=>{c.gemo={R:['#3a0610','#7a1024','#c01e3a','#ff3a58','#ffc0c8']};ICON_SH.cluster(c,[[-.05,.15,.46,.5,.2,.45,6,0],[.55,.3,.32,.38,-.35,.4,6,0],[-.55,.35,.28,.32,.45,.35,6,0]])},
  sapphire:c=>ICON_SH.cluster(c,[[0,0,.28,.75,0,0,6,.45,.2],[-.45,.2,.22,.55,.45,0,6,.35,.16],[.45,.2,.2,.5,-.45,0,6,.3,.15]]),
  diamond:c=>{c.add(T3(mRock(c.seed,{rings:3,segs:7,j:.22,flat:.3}),{sx:1.12,sy:.4,sz:.85,y:-.62}),MAT.rock(c.it.h||'#2a2a30',{dk:.18}));const m=MAT.gem(c.it.c,{b:.4,jit:1.6,R:['#5a6a80','#8aa0b8','#c8d8e8','#eef6ff','#ffffff']});
    [[0,-.05,.1,.55,.3],[-.62,-.3,.35,.34,.6],[.62,-.32,.32,.3,-.2]].forEach(([x,y,z,r,a])=>c.add(T3(mPrism(4,r,.01,{tip:r*1.05,tipB:r*1.05}),{ry:a,rz:a*.5,x,y,z}),m));c.fx.push(pb=>{for(let i=0;i<6;i++){const x=(8+H32(i,1)*16)*c.u,y=(8+H32(i,2)*12)*c.u;if(pb.get(x|0,y|0))pb.set(x,y,['#ff9ac8','#9affd8','#9ad0ff','#fff09a'][i%4])}})},
  darkcrystal:c=>{c.gemo={sp:1.3,ex:12};ICON_SH.cluster(c,[[0,0,.26,1.15,0],[-.42,.12,.22,.8,.4],[.4,.18,.2,.7,-.45],[.12,.45,.15,.5,-.15]])},
  sulfur:c=>{c.add(T3(mRock(c.seed,{rings:3,segs:7,j:.22,flat:.3}),{sx:1.1,sy:.45,sz:.85,y:-.5}),MAT.rock('#7a7468',{}));const m=MAT.gem(c.it.c,{jit:.8,sp:.6});
    [[0,0,.26,.45],[-.45,.15,.2,.35],[.42,.1,.22,.38],[-.1,.45,.17,.3],[.3,-.3,.15,.28],[-.35,-.25,.14,.25]].forEach(([x,z,r,t],k)=>c.add(T3(mPrism(4,r,.08,{tip:t,tipB:t*.6}),{ry:k,rz:(k%3-1)*.35,x,z,y:-.35}),m))},
  olivine:c=>{[[-.45,-.1,.4],[.35,-.15,.42],[0,.35,.36],[-.1,-.5,.3],[.62,.35,.28],[-.65,.4,.26],[.25,.6,.24]].forEach(([x,y,s],k)=>c.add(T3(mRock(c.seed+k,{rings:3,segs:6,j:.15,flat:1}),{s,x,y:y*.8-.1,z:-y*.3}),MAT.gem(shade(c.it.c,(k%3-1)*.12),{jit:.6,sp:.8})))},
  garnet:c=>{ICON_SH.rock(c,'#8a8478',{pebble:false,tex:(x,y,i,col,R)=>H32(x,y,4)<.08?'#d8d0e0':col});[[-.35,.35,.55,.36],[.42,.45,.4,.3],[.05,-.1,.85,.26]].forEach(([x,y,z,s],k)=>c.add(T3(mRock(c.seed+k*5,{rings:3,segs:6,j:0,flat:1}),{s,x,y,z,ry:k}),MAT.gem(c.it.c,{jit:1})))},
  lapis:c=>ICON_SH.rock(c,c.it.c,{tex:(x,y,i,col,R)=>{const h=H32(x,y,6);return h<.07?'#ffd84d':h<.1?'#fff6b0':Math.abs(((x*.6+y)/c.u)%11-5)<.6?'#dfe6f0':h<.2?R[Math.max(0,i-1)]:col}}),
  fossil:c=>{c.add(T3(mRock(c.seed,{rings:4,segs:9,j:.06,flat:.4}),{sx:1.05,sy:.42,sz:1,rx:1.05,y:-.05}),MAT.rock(c.it.c,{dk:.06,lt:.04,jit:.3}));
    c.fx0.push(pb=>{const cx=16*c.u,cy=16.5*c.u;let a=0,r=9;for(let i=0;i<150;i++){a+=.1;r*=.991;const x=cx+Math.cos(a)*r*c.u,y=cy+Math.sin(a)*r*.86*c.u;if(pb.get(x|0,y|0))pb.set(x,y,shade(c.it.c,-.5));if(i%5===0){const x2=cx+Math.cos(a)*(r-2)*c.u,y2=cy+Math.sin(a)*(r-2)*.86*c.u;if(pb.get(x2|0,y2|0))pb.set(x2,y2,shade(c.it.c,-.32))}}})},
  /* ── 광석 ── */
  stariron:c=>{ICON_SH.rock(c,c.it.h,{pebble:false,tex:(x,y,i,col,R)=>{const v=Math.abs(Math.sin(x*.55/c.u+y*.3/c.u)+Math.sin(y*.5/c.u-x*.2/c.u));return v<.22?'#bfe8ff':v<.4?'#5a8ad8':H32(x,y)<.06?'#ffffff':col}});ICON_SH.glow(c,'rgba(150,210,255,A)',2);SPARK_IN(c,[[11,10,2],[22,16]])},
  meteoriron:c=>{c.add(T3(mRock(c.seed,{rings:4,segs:7,j:.22,flat:.5}),{sx:1.05,sy:.8,sz:.9}),MAT.metal(c.it.c,{sp:.7,ex:10,tex:(x,y,i,col,R)=>{const cx=Math.floor(x/(5*c.u)),cy=Math.floor(y/(5*c.u));return Math.hypot(x/(5*c.u)-cx-.5,y/(5*c.u)-cy-.5)<.3&&H32(cx,cy)<.6?R[Math.max(0,i-1)]:col}}))},
  voidstone:c=>{c.add(T3(mRock(c.seed,{rings:4,segs:8,j:.12,flat:.5}),{sx:1.02,sy:.82,sz:.92}),{R:['#05061a','#0b1238','#16205a','#2a3a88','#4a62c8'],sp:.5,ex:8,hi:'#8aa8ff',tex:(x,y,i,col)=>{const h=H32(x,y,9);return h<.035?'#ffffff':h<.06?'#ffe9a8':h>.93?'#5a3a9a':col}});ICON_SH.glow(c,'rgba(90,110,230,A)',2)},
  abysspearl:c=>{c.add(T3(mRock(c.seed,{rings:3,segs:8,j:.15,flat:.3}),{sx:1.05,sy:.4,sz:.85,y:-.55}),MAT.rock('#6a6070',{}));const pm=s=>({R:['#8a90a8','#b8c0d6',c.it.c,'#f4f8ff','#ffffff'],sp:1,ex:8,hi:'#fff0f8',tex:(x,y,i,col)=>H32(x,y,8)<.06&&i<4?['#ffd6ec','#d6f0ff'][x&1]:col});
    [[-.38,-.05,.42,.42],[.38,.0,.38,.38],[0,.0,-.3,.4]].forEach(([x,y,z,s])=>c.add(T3(mLathe(sphereProf(1,7),12),{s,x,y,z}),pm(s)))},
  opal:c=>{ICON_SH.rock(c,'#8a6a4a',{pebble:false,tex:(x,y,i,col)=>{const v=Math.sin(x*.7/c.u)+Math.cos(y*.6/c.u+x*.2/c.u);return v>1.1?['#ff8ac8','#8affd0','#8ac8ff','#ffe08a','#c09aff'][(H32(x>>1,y>>1)*5)|0]:col}})},
  /* ── 별의 물질 ── */
  starshard:c=>{const m={R:['#8a5a1a','#d29a3a','#ffd36a','#fff0b8','#ffffff'],sp:1,ex:20,jit:1.3};c.add(T3(mPrism(6,.42,.95,{tip:.62,tipB:.5,rt:.36}),{rz:-.55,ry:.7,y:-.42,x:.08}),m);
    c.add(T3(mPrism(5,.22,.35,{tip:.35,tipB:.2}),{rz:.75,ry:.3,x:-.62,y:-.62,z:.3}),m);c.add(T3(mPrism(5,.18,.3,{tip:.3,tipB:.15}),{rz:-1.2,x:.72,y:-.72,z:.35}),m);
    ICON_SH.glow(c,'rgba(255,225,140,A)',3);SPARK_IN(c,[[17,14,3],[7,8,1],[26,8,1]])},
  stardust:c=>{c.add(T3(mLathe([[.5,-.95],[.62,-.8],[.64,.2],[.4,.4],[.32,.55]],12),{y:-.02}),{...MAT.glass('#e8f0ff',{ex:18}),tex:(x,y,i,col,R)=>{if(y/c.u<15.5)return col;const h=H32(x,y,3);return h<.18?'#ffffff':h<.45?'#ffd86a':h<.7?'#ffc040':'#e8a030'}});
    c.add(T3(mLathe([[.34,.5],[.36,.85]],10),{y:-.02}),MAT.rock('#a87a4a',{}));ICON_SH.glow(c,'rgba(255,236,170,A)',2);SPARK_IN(c,[[8,9,2],[25,12,1],[23,4,1],[6,21,1]])},
  starember:c=>{c.add(T3(mRock(c.seed,{rings:4,segs:7,j:.22,flat:.5}),{sx:1.02,sy:.8,sz:.9}),{R:['#1a0c0a','#2e1612','#4a2018','#6a3020','#8a4428'],tex:(x,y,i,col)=>{const v=Math.abs(Math.sin(x*.62/c.u+Math.sin(y*.4/c.u)*2)+Math.cos(y*.7/c.u-x*.15/c.u));return v<.16?'#fff2b0':v<.34?'#ffb84a':v<.5?'#e2581e':col}});ICON_SH.glow(c,'rgba(255,140,60,A)',2)},
  /* ── 합성: 돌·건축 ── */
  brick:c=>{c.add(T3(mBox(1.5,.95,1.05),{ry:-.55,y:-.62}),MAT.rock(c.it.c,{tex:(x,y,i,col,R)=>H32(x,y,2)<.1?R[Math.max(0,i-1)]:(H32(x>>1,y,4)<.05?R[Math.min(4,i+1)]:col)}))},
  tile:c=>{const m=MAT.rock(c.it.c,{dk:.12,lt:.05});[[-.48,-.72,0],[.5,-.72,.05],[0,-.18,.02]].forEach(([x,y,z])=>c.add(T3(mBox(.92,.5,.62),{ry:-.5,x,y,z}),m))},
  basalttile:c=>{const m=MAT.rock(c.it.c,{b:.3,dk:.06});[[0,-.72,.2],[.05,-.48,-.15],[-.05,-.24,.45]].forEach(([x,y,r])=>c.add(T3(mPrism(6,.92,.2,{rot:r}),{x,y,sx:1,sz:.95}),m))},
  whetstone:c=>{c.add(T3(mBox(1.75,.38,.75),{ry:-.5,y:-.58}),MAT.rock('#5a5a66',{}));c.add(T3(mBox(1.75,.34,.75),{ry:-.5,y:-.2}),MAT.rock('#b8a890',{dk:.08,lt:.04}))},
  pillar:c=>{const m=MAT.rock(c.it.c,{tex:(x,y,i,col,R)=>{const h=H32(x,y,5);return h<.08?'#3a3034':h<.14?'#f4e8e0':col}});c.add(T3(mPrism(8,.72,.26,{rot:.2}),{y:-1.02}),m);c.add(T3(mPrism(8,.46,1.45,{rot:.2}),{y:-.78}),m);c.add(T3(mPrism(8,.72,.26,{rot:.2}),{y:.66}),m)},
  porcelain:c=>c.add(T3(mLathe([[.32,-.95],[.62,-.78],[.86,-.4],[.9,0],[.78,.4],[.5,.62],[.34,.68],[.36,.84]],14),{y:.05}),{R:['#6a7088','#a4aabc','#d6d8dc','#f4f1e8','#ffffff'],sp:.9,ex:14}),
  bluechina:c=>{c.add(T3(mLathe([[.3,-.95],[.42,-.8],[.72,-.45],[.8,-.05],[.62,.32],[.3,.55],[.26,.75],[.36,.9]],14),{y:.02}),MAT.glass(c.it.c,{sp:.8,ex:10,tex:(x,y,i,col)=>{const yy=y/c.u;return(yy>13&&yy<15)||(yy>23.5&&yy<25)?'#2f57c8':(yy>16&&yy<22&&H32(x>>1,y>>1,7)<.3)?'#4a74d8':col}}))},
  /* ── 합성: 금속 ── */
  bronze:c=>ICON_SH.ingot(c),
  steel:c=>ICON_SH.ingot(c),
  silverbar:c=>ICON_SH.ingot(c),
  goldbar:c=>ICON_SH.ingot(c),
  platbar:c=>ICON_SH.ingot(c),
  obsalloy:c=>ICON_SH.ingot(c),
  crysteel:c=>{ICON_SH.ingot(c,{tex:(x,y,i,col,R)=>((x-y)/c.u|0)%5===0&&i<4?R[i+1]:col})},
  voidalloy:c=>{ICON_SH.ingot(c,{tex:(x,y,i,col)=>H32(x,y,9)<.05?'#ffffff':col})},
  starsteel:c=>{ICON_SH.ingot(c);ICON_SH.glow(c,'rgba(190,225,255,A)',2);SPARK_IN(c,[[10,13,2]])},
  meteorbar:c=>ICON_SH.ingot(c,{tex:(x,y,i,col,R)=>(((x+y)/c.u|0)%4===0||((x-y)/c.u|0)%5===0)&&i>0?R[i-1]:col}),
  wire:c=>{c.add(T3(mLathe([[.95,-.85],[.95,-.68],[.55,-.68],[.55,.5],[.95,.5],[.95,.67]],14),{y:.05,rx:.1}),MAT.rock('#8a5a34',{dk:.05}));
    c.add(T3(mLathe([[.82,-.66],[.86,-.4],[.86,.2],[.82,.48]],14),{y:.05,rx:.1}),MAT.metal(c.it.c,{zb:.01,tex:(x,y,i,col,R)=>(y/c.u|0)%2===0&&i>0?R[i-1]:col}))},
  goldwire:c=>{ICON_DEF.wire(c);c.fx0.push(pb=>{for(let i=0;i<9;i++){const x=(24+i*.7)*c.u,y=(16+Math.sin(i*.8)*3+i*1.2)*c.u;pb.set(x,y,shade(c.it.c,.2))}})},
  gear:c=>c.fx0.push(pb=>gear2D(pb,c.u,{cx:15.5,cy:15,R:13.5,col:c.it.c,T:3})),
  engine:c=>{c.fx0.push(pb=>{gear2D(pb,c.u,{cx:22.5,cy:9.5,R:8,n:7,col:'#b8ccd8',T:2,spokes:0,rot:.3});gear2D(pb,c.u,{cx:13,cy:18,R:12,col:c.it.c,T:3})});
    c.fx.push(pb=>{const C='#e8ecf4',D='#6a6e7a';[[24,27],[25,27],[26,27],[25,26],[25,28]].forEach(([x,y])=>pb.set(x*c.u,y*c.u,C));[[22,25],[23,26],[28,25],[27,26],[22,29],[23,28],[28,29],[27,28]].forEach(([x,y])=>pb.set(x*c.u,y*c.u,D))})},
  drillbit:c=>{c.add(T3(mLathe([[0,-1.2],[.2,-.92],[.38,-.35],[.44,.15],[.44,.32],[.2,.38],[.2,.95]],12),{rz:-.75,x:.1,y:.05}),MAT.metal(c.it.c,{tex:(x,y,i,col,R)=>(((x*.9-y)/c.u|0)%4===0)&&i>0?R[i-1]:col}));SPARK_IN(c,[[25,25,2]])},
  charge:c=>{const m=MAT.rock(c.it.c,{sp:.4,ex:6,dk:.04,lt:.02});[[-.45,.1],[.45,.1],[0,-.25]].forEach(([x,z])=>c.add(T3(mPrism(10,.36,1.45),{x,z,y:-.85,rx:.05}),m));
    c.add(T3(mPrism(14,1.05,.22,{}),{y:-.2,sx:1,sz:.72}),MAT.rock('#3b332a',{zb:-.01}));c.fx.push(pb=>{for(let i=0;i<8;i++)pb.set((16+i*.8)*c.u,(5-i*.4+Math.sin(i)*.8)*c.u,'#8a7a5a');fxSpark(pb,23*c.u,2*c.u,1,'#fff6c8','#ffd34d')})},
  /* ── 합성: 가루·통·병 ── */
  coke:c=>{const m=MAT.rock(c.it.c,{tex:(x,y,i,col,R)=>H32(x>>1,y>>1,3)<.22?'#24201c':col});c.add(T3(mRock(c.seed,{rings:3,segs:6,j:.3,flat:.5}),{sx:.85,sy:.7,sz:.8,x:-.25}),m);c.add(T3(mRock(c.seed+4,{rings:3,segs:6,j:.3,flat:.5}),{s:.55,x:.55,y:-.32,z:.3}),m)},
  lime:c=>{const m=MAT.rock(c.it.c,{dk:.1,lt:.02,b:-.2});[[-.4,-.25,.0,.5],[.42,-.3,.1,.44],[0,.05,-.35,.48],[.05,-.55,.45,.32]].forEach(([x,y,z,s],k)=>c.add(T3(mRock(c.seed+k*3,{rings:3,segs:6,j:.22,flat:.6}),{s,x,y,z}),m))},
  polish:c=>ICON_SH.powder(c,c.it.c,'#c8c0d8'),
  powder:c=>{c.add(T3(mLathe([[.62,-.95],[.78,-.6],[.82,0],[.78,.55],[.62,.85]],12),{y:.05}),MAT.rock('#8a5a34',{tex:(x,y,i,col,R)=>{const yy=y/c.u;return(yy>9&&yy<11)||(yy>21&&yy<23)?'#4a4448':col}}));
    c.fx0.push(pb=>{for(let i=0;i<14;i++){const x=(21+H32(i,4)*8)*c.u,y=(26+H32(i,5)*3)*c.u;pb.set(x,y,'#2a2624')}})},
  mortar:c=>{c.add(T3(mLathe([[.66,-.95],[.92,.45]],14),{y:-.05}),MAT.rock('#8a5a34',{tex:(x,y,i,col,R)=>{const yy=y/c.u;return(yy>12&&yy<14)||(yy>23&&yy<25)?'#6a6a74':col}}));c.add(T3(mLathe([[.88,0],[.6,.14],[0,.2]],14),{y:.38}),MAT.rock(c.it.c,{dk:.08}))},
  ultramarine:c=>{c.add(T3(mLathe([[.7,-.9],[.78,-.75],[.78,.2],[.6,.4],[.58,.52]],12),{}),MAT.glass(c.it.c,{ex:16,b:-.2,tex:(x,y,i,col,R)=>H32(x,y,2)<.12?R[Math.max(0,i-1)]:col}));c.add(T3(mLathe([[.6,.5],[.64,.85]],12),{}),MAT.rock('#a87a4a',{}))},
  astralink:c=>{c.add(T3(mLathe([[.85,-.9],[.92,-.55],[.88,-.1],[.4,.2],[.28,.45],[.32,.62]],12),{}),{...MAT.glass(c.it.c,{ex:16}),tex:(x,y,i,col)=>H32(x,y,4)<.06?'#ffffff':col});c.add(T3(mLathe([[.22,.6],[.24,.92]],8),{}),MAT.rock('#4a3a6a',{}));ICON_SH.glow(c,'rgba(201,184,255,A)',2);SPARK_IN(c,[[12,20,1],[19,24,1]])},
  /* ── 합성: 렌즈·유리 ── */
  lens:c=>{c.add(T3(mBox(.22,1.05,.22),{rz:.75,x:.62,y:-.95,z:.2}),MAT.rock('#8a5a34',{}));c.add(T3(mPrism(18,.8,.14),{rx:-1.15,ry:.2,x:-.2,y:.18}),MAT.metal('#d6aa52',{ex:12}));
    c.add(T3(mPrism(18,.62,.16),{rx:-1.15,ry:.2,x:-.2,y:.2,z:.02}),{...MAT.glass('#a8dcf0',{ex:14,b:.2}),zb:.05,noEdge:true});c.fx.push(pb=>{pb.line(8*c.u,11*c.u,11*c.u,7*c.u,'#ffffff');pb.line(10*c.u,14*c.u,15*c.u,8*c.u,'rgba(255,255,255,.7)')})},
  shadowlens:c=>{c.add(T3(mPrism(18,.92,.16),{rx:-1.15,ry:.2,y:-.05}),MAT.metal('#b8c0d0',{ex:12}));c.add(T3(mPrism(18,.74,.18),{rx:-1.15,ry:.2,y:-.03,z:.02}),{...MAT.glass(c.it.c,{ex:14}),zb:.05});ICON_SH.glow(c,'rgba(140,90,210,A)',2)},
  glass:c=>{c.add(T3(mBox(1.5,1.6,.14),{ry:-.6,rz:.08,y:-.85}),MAT.glass(c.it.c,{b:.2,tex:(x,y,i,col)=>{const v=(x+y)/c.u;return(v>26&&v<27.5)||(v>30&&v<31)?'#ffffff':col}}))},
  lavaglass:c=>{c.add(T3(mRock(c.seed,{rings:3,segs:6,j:.25,flat:.5}),{sx:1.05,sy:.85,sz:.85}),{...MAT.glass(c.it.c,{ex:12,b:.3}),tex:(x,y,i,col)=>H32(x,y,3)<.05?'#fff0c8':col});ICON_SH.glow(c,'rgba(255,122,61,A)',1)},
  starglass:c=>{c.add(T3(mBox(1.5,1.6,.14),{ry:-.6,rz:.08,y:-.85}),MAT.glass(c.it.c,{b:.3,tex:(x,y,i,col)=>{const h=H32(x,y,5);return h<.06?'#ffffff':h<.1?'#ffd86a':col}}));ICON_SH.glow(c,'rgba(255,236,170,A)',2);SPARK_IN(c,[[13,13,2]])},
  /* ── 합성: 보석 ── */
  pquartz:c=>{const m=MAT.gem(c.it.c,{b:.5,R:['#6a7488','#a0acc0','#d4dce8','#f2f6fc','#ffffff']});c.add(T3(mPrism(6,.36,.85,{tip:.5}),{rz:.15,x:-.2,y:-1}),m);c.add(T3(mPrism(6,.26,.55,{tip:.38}),{rz:-.45,x:.48,y:-.95,z:.2}),m);SPARK_IN(c,[[12,7,2]])},
  resonant:c=>{c.add(T3(mPrism(6,.38,.95,{tip:.5}),{rz:.18,x:-.25,y:-.95}),MAT.gem(c.it.c,{}));c.fx.push(pb=>{[[4,0],[7,.7]].forEach(([r,o])=>{for(let a=-.9;a<=.9;a+=.12){pb.set((21+o+Math.cos(a)*r)*c.u,(16+Math.sin(a)*r)*c.u,'rgba(220,190,255,.85)')}})})},
  cutame:c=>ICON_SH.gem(c,'pear'),
  cutemerald:c=>ICON_SH.gem(c,'step',{out:OCT(.72,.9,.24)}),
  cutruby:c=>ICON_SH.gem(c,'oval',{spin:1.3}),
  cutsapph:c=>ICON_SH.gem(c,'cushion'),
  cutdiamond:c=>{c.gemo={b:.4,jit:2,R:['#4a5a78','#8aa0c0','#cfe0f0','#f0f8ff','#ffffff']};ICON_SH.gem(c,'round');c.fx.push(pb=>{for(let i=0;i<7;i++){const x=(9+H32(i,1)*14)*c.u,y=(8+H32(i,2)*16)*c.u;if(pb.get(x|0,y|0))pb.set(x,y,['#ff9ac8','#9affd8','#9ad0ff','#fff09a'][i%4])}})},
  peridot:c=>ICON_SH.gem(c,'step',{out:OCT(.85,.85,.3),s:1}),
  cutgarnet:c=>ICON_SH.gem(c,'round',{s:.96}),
  crown:c=>{ICON_SH.gem(c,'cushion',{s:1.14});SPARK_IN(c,[[25,21,1]])},
  emberheart:c=>{c.gemo={tex:(x,y,i,col)=>H32(x,y,2)<.1?'#fff0a0':col};ICON_SH.gem(c,'oval',{spin:1.2});ICON_SH.glow(c,'rgba(255,180,90,A)',1)},
  moonstone:c=>{ICON_SH.cabo(c,{tex:(x,y,i,col)=>{const d=Math.hypot(x-12*c.u,y-14*c.u)/c.u;return d<4.5?'#a8c8ff':d<6.5&&i>1?'#d6e4ff':col}});ICON_SH.glow(c,'rgba(170,200,255,A)',1)},
  cutopal:c=>ICON_SH.cabo(c,{tex:(x,y,i,col)=>{const v=Math.sin(x*.8/c.u)+Math.cos(y*.7/c.u+x*.3/c.u);return v>.7?['#ff8ac8','#8affd0','#8ac8ff','#ffe08a','#c09aff'][(H32(x>>1,y>>1)*5)|0]:col}}),
  carving:c=>{c.fx0.push(pb=>{for(let a=3.5;a<=5.95;a+=.05)pb.set((16+Math.cos(a)*9)*c.u,(14+Math.sin(a)*9)*c.u,'#6a4a2a')});c.add(T3(mLathe([[1,0],[.98,.12],[.6,.2],[0,.22]],16),{rx:1.15,s:.7,y:-.3}),MAT.rock(c.it.c,{dk:.04,jit:.2}));
    c.fx.push(pb=>{const cx=16*c.u,cy=20.5*c.u;let a=0,r=6.2;for(let i=0;i<95;i++){a+=.14;r*=.985;const x=cx+Math.cos(a)*r*c.u,y=cy+Math.sin(a)*r*.85*c.u;if(pb.get(x|0,y|0))pb.set(x,y,shade(c.it.c,-.48))}})},
  /* ── 구슬·등불 ── */
  starcore:c=>{c.add(T3(mLathe(sphereProf(1,7),14),{s:.72,y:-.05}),{R:['#2a5aa8','#4a8ae0',c.it.c,'#c8ecff','#ffffff'],sp:.9,ex:10,b:.4});ICON_SH.glow(c,'rgba(124,200,255,A)',3);SPARK_IN(c,[[16,16,3]])},
  lavaheart:c=>{c.add(T3(mLathe(sphereProf(1,7),14),{s:.74,y:-.05}),{R:['#1a0c0a','#3a1610','#5a2216','#7a3420','#a04a2a'],tex:(x,y,i,col)=>{const v=Math.abs(Math.sin(x*.7/c.u+Math.sin(y*.5/c.u)*2)+Math.cos(y*.8/c.u));return v<.2?'#fff2b0':v<.42?'#ffa040':v<.6?'#e2501e':col}});ICON_SH.glow(c,'rgba(255,110,40,A)',2)},
  philo:c=>{c.gemo={b:.1,jit:1.6,R:['#3a0410','#7a0c24','#c81a3e','#ff4a6e','#ffd0d8']};ICON_SH.gem(c,'round',{s:1.12});ICON_SH.glow(c,'rgba(255,61,106,A)',3);SPARK_IN(c,[[24,8,2]])},
  abysslamp:c=>{const dm=MAT.metal('#4a4a5a',{ex:10});c.add(T3(mLathe([[.55,-1],[.6,-.8],[.45,-.72]],10),{}),dm);c.add(T3(mLathe([[.42,-.74],[.46,-.2],[.42,.38]],10),{zb:-.02}),{R:['#3a6aa8','#5a9ad8',c.it.c,'#d6f0ff','#ffffff'],b:.6,tex:(x,y,i,col)=>{const d=Math.hypot(x-16*c.u,y-18*c.u)/c.u;return d<2.2?'#ffffff':d<3.8?'#d6f0ff':col}});
    c.add(T3(mLathe([[.45,.36],[.58,.48],[.2,.7],[.1,.78]],10),{}),dm);c.fx.push(pb=>{for(let a=Math.PI;a<=Math.PI*2;a+=.15)pb.set((16+Math.cos(a)*4)*c.u,(5+Math.sin(a)*3)*c.u,'#6a6a7a')});ICON_SH.glow(c,'rgba(160,216,255,A)',3)}
};
function drawIcon(id,N){const it=ITEMS[id],u=N/32,pb=new PB(N,N),list=[],c={id,it,u,seed:strSeed(id),rn:rng(strSeed(id)),list,fx:[],fx0:[],gemo:null,add:(M,m)=>{list.push({...M,m})}};
  (ICON_DEF[id]||ICON_SH[it.sh]||(cc=>ICON_SH.rock(cc)))(c,undefined);
  draw3(pb,list,{cx:16*u,cy:17.4*u,sc:11*u,tilt:.42});
  c.fx0.forEach(f=>f(pb));if(u>.7)fxRim(pb);pb.outline('#0b0d18');c.fx.forEach(f=>f(pb));
  return pb}
