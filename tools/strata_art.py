"""지층 타일셋(사용자 원본 art/source/strata/strata_sheet.webp, 13장)을 채굴 화면용으로 나눈다 → art/strata/
  s<번호>.webp    : 지층 그림 전체(뒤 배경 · 가운데 채굴층 무늬로 씀)
  s<번호>_b.webp  : 앞쪽 바닥 조각(아래 가장자리에 붙은 바위 · 결정, 화면 아래에 겹쳐 그림)
  s<번호>_t.webp  : 앞쪽 천장 조각(위 가장자리에 붙은 종유석)
  m<번호>.webp    : 가운데 채굴층 바위 무늬(사용자 채굴 중간층 시트 art/source/strata/mid_sheet.webp에서 굴이 없는 가장 큰 바위 부분)
  m<번호>_d.webp  : 굴 안쪽 벽(같은 시트의 어두운 계단 안쪽에서 가장 큰 부분)
앞/뒤 분리는 대충(밝기로 바위를 고르고 가장자리에서 이어진 부분만): 나중에 따로 그린 그림이 오면 그것으로 바꾸면 됨
사용: python3 tools/strata_art.py"""
from PIL import Image
import numpy as np
SHEET='art/source/strata/strata_sheet.webp';OUT='art/strata/'
# 카드 안쪽 그림 영역(원본 px). 위쪽 이름표와 테두리는 피해서
B=[(12,152,307,324),(331,152,621,324),(645,152,936,324),(945,152,1221,324),(1245,152,1529,324),
   (12,442,377,610),(400,442,755,610),(780,442,1135,610),(1165,442,1529,610),
   (12,732,367,934),(392,732,752,934),(776,732,1133,934),(1157,732,1529,934)]
def grow(seed,allow):
    cur=seed&allow
    while True:
        d=cur.copy();d[1:]|=cur[:-1];d[:-1]|=cur[1:];d[:,1:]|=cur[:,:-1];d[:,:-1]|=cur[:,1:];d&=allow
        if (d==cur).all():return cur
        cur=d
def outline(rgba,col=(10,6,12)):
    A=rgba[:,:,3]>0;e=np.zeros_like(A)
    e[1:]|=A[1:]&~A[:-1];e[:-1]|=A[:-1]&~A[1:];e[:,1:]|=A[:,1:]&~A[:,:-1];e[:,:-1]|=A[:,:-1]&~A[:,1:]
    rgba[e,:3]=col;return rgba
im=Image.open(SHEET).convert('RGB')
for n,b in enumerate(B,1):
    art=im.crop(b).quantize(64,method=Image.Quantize.MEDIANCUT).convert('RGB');a=np.asarray(art).astype(float);h,w,_=a.shape
    art.save(f'{OUT}s{n}.webp',lossless=True,quality=100,method=6)
    lum=a@[.3,.59,.11];T=np.percentile(lum,38)            # 이보다 밝으면 바위 · 결정(앞에 둘 후보), 어두우면 먼 굴 속
    rock=lum>T
    R=np.random.default_rng(n)
    for part,(r0,r1),edge in (('b',(int(h*.66),h),-1),('t',(0,int(h*.26)),0)):
        sub=rock[r0:r1];H=r1-r0
        if edge==0:sub=sub[::-1]                       # 천장은 뒤집어서 바닥과 같은 방식으로
        # 가장자리에서 이어진 바위(4방향 연결) → 열마다 가장 높은 곳까지 채움(구멍 없음) → 가는 가시는 열림 연산으로 제거
        sd=np.zeros_like(sub);sd[-1]=True;con=grow(sd,sub)
        run=np.array([H-np.argmax(con[:,x]) if con[:,x].any() else 0 for x in range(w)],float)
        run=np.array([np.median(run[max(0,x-4):x+5]) for x in range(w)])
        mn=np.array([run[max(0,x-3):x+4].min() for x in range(w)]);run=np.array([mn[max(0,x-3):x+4].max() for x in range(w)])
        cap=H*(.55+.4*(.5+.5*np.sin(np.arange(w)/w*np.pi*2*R.uniform(2,4)+R.uniform(0,6))))   # 너무 높으면 물결 모양으로 깎기
        run=np.minimum(run,cap).round().astype(int)
        m=np.zeros((H,w),bool)
        for x in range(w):
            if run[x]>0:m[H-run[x]:,x]=True
        if edge==0:m=m[::-1]
        rgba=np.zeros((H,w,4),np.uint8);rgba[...,:3]=a[r0:r1].astype(np.uint8);rgba[...,3]=m*255
        Image.fromarray(outline(rgba)).save(f'{OUT}s{n}_{part}.webp',lossless=True,quality=100,method=6)
    print(n,w,h)

# ── 가운데 채굴층: 칸마다 어두운 굴(가장 큰 어두운 덩어리)을 찾고, 굴과 겹치지 않는 가장 큰 바위 사각형 · 굴 안쪽 사각형을 자른다
def box(m,k):
    p=np.pad(m.astype(float),((k,k),(k,k)),mode='edge');c=np.pad(p.cumsum(0).cumsum(1),((1,0),(1,0)));n=2*k+1;h,w=m.shape
    return (c[n:n+h,n:n+w]-c[:h,n:n+w]-c[n:n+h,:w]+c[:h,:w])/(n*n)
def maxrect(m):
    h,w=m.shape;H=np.zeros(w,int);best=(0,0,0,0,0)
    for y in range(h):
        H=np.where(m[y],H+1,0);st=[]
        for x in range(w+1):
            cur=H[x] if x<w else 0;s0=x
            while st and st[-1][1]>=cur:
                s0,hh=st.pop()
                if hh*(x-s0)>best[0]:best=(hh*(x-s0),s0,y-hh+1,x-s0,hh)
            st.append((s0,cur))
    return [int(v) for v in best[1:]]
mid=Image.open('art/source/strata/mid_sheet.webp').convert('RGB')
XS=[(21,360),(378,717),(735,1072),(1091,1429)];YS=[(89,294),(342,547),(595,801),(848,1054)]
for n,b in enumerate([(x0,y0,x1,y1) for (y0,y1) in YS for (x0,x1) in XS][:13],1):
    art=mid.crop(b);a=np.asarray(art).astype(float);h,w,_=a.shape;sm=box(a@[.3,.59,.11],6);dark=sm<np.percentile(sm,30)
    sub=sm[h//4:h*3//4,w//2:];j,i=np.unravel_index(sub.argmin(),sub.shape);sd=np.zeros_like(dark);sd[h//4+j,w//2+i]=True;tun=grow(sd,dark)
    rx,ry,rw,rh=maxrect(~(box(tun,5)>0));tx,ty,tw,th=maxrect(box(tun,4)>.999)
    art.crop((rx,ry,rx+rw,ry+rh)).quantize(64,method=Image.Quantize.MEDIANCUT).convert('RGB').save(f'{OUT}m{n}.webp',lossless=True,quality=100,method=6)
    art.crop((tx,ty,tx+tw,ty+th)).quantize(32,method=Image.Quantize.MEDIANCUT).convert('RGB').save(f'{OUT}m{n}_d.webp',lossless=True,quality=100,method=6)
    print('mid',n,(rw,rh),(tw,th))

