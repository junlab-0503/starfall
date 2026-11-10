"""채굴 화면 지층 그림(사용자 원본 art/source/strata/) → 게임용 art/strata/
  r<번호>.webp    : 배경 = 안 판 채굴층 바위 한 장(rock_sheet.webp). 가장자리를 이음매 없이 다듬어(경계선 찾아 잘라 붙이기) 그대로 반복
  m<번호>_d.webp  : 굴 안쪽 벽 = 판 버전(mid_sheet.webp)의 어두운 계단 안쪽에서 가장 큰 부분
  d<번호>_t.webp  : 장식 천장 조각(deco_sheet.webp 왼쪽 그림) → 화면 왼쪽 위
  d<번호>_b.webp  : 장식 바닥 조각(deco_sheet.webp 오른쪽 그림) → 화면 오른쪽 아래
사용: python3 tools/strata_art.py"""
from PIL import Image
import numpy as np
from collections import Counter
SRC='art/source/strata/';OUT='art/strata/'
DECO_SCALE=.6     # 장식 크기(원본 대비). 화면에 1:1로 그림
def grow(seed,allow):
    cur=seed&allow
    while True:
        d=cur.copy();d[1:]|=cur[:-1];d[:-1]|=cur[1:];d[:,1:]|=cur[:,:-1];d[:,:-1]|=cur[:,1:];d&=allow
        if (d==cur).all():return cur
        cur=d
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
def runs(v,th,gap=0):
    o=[];s=None;last=-99
    for i,x in enumerate(list(v>th)+[False]):
        if x and s is None:s=i
        if x:last=i
        if not x and s is not None and i-last>gap:o.append((s,last+1));s=None
    if s is not None:o.append((s,last+1))
    return o
def save(im,path,colors=64):
    im.save(path,lossless=True,quality=100,method=6)
def pixelate(rgba,W,H):
    """칸마다 가장 많은 색(어두운 윤곽은 30%만 넘어도 우선) → 또렷한 도트. 반 이상 투명하면 투명"""
    a=rgba.astype(float);m=a[...,3]>128;px=a[m][:,:3]
    pq=Image.fromarray(px.reshape(1,-1,3).astype(np.uint8)).quantize(64,method=Image.Quantize.MEDIANCUT)
    pal=np.array(pq.getpalette()[:64*3]).reshape(-1,3).astype(float);luma=pal@[.3,.59,.11]
    idx=((a[...,None,:3]-pal)**2).sum(-1).argmin(-1);h,w=m.shape;res=np.zeros((H,W,4),np.uint8)
    for j in range(H):
        ya,yb=j*h//H,max(j*h//H+1,(j+1)*h//H)
        for i in range(W):
            xa,xb=i*w//W,max(i*w//W+1,(i+1)*w//W);cm=m[ya:yb,xa:xb]
            if cm.sum()<cm.size*.5:continue
            cnt=Counter(idx[ya:yb,xa:xb][cm].tolist());n=sum(cnt.values());dk=[q for q in cnt if luma[q]<45]
            q=max(dk,key=lambda q:cnt[q]) if dk and sum(cnt[q] for q in dk)>=n*.3 else cnt.most_common(1)[0][0]
            res[j,i,:3]=pal[q];res[j,i,3]=255
    return res

def seam_wrap(a,ov,axis):
    """끝과 처음이 이어지게: 마지막 ov줄과 처음 ov줄이 겹치는 곳에서 색 차이가 가장 적은 경계선을 찾아, 경계 왼쪽은 끝부분 · 오른쪽은 처음 부분을 씀 → 섞지 않으니 도트가 그대로"""
    if axis==0:return seam_wrap(a.transpose(1,0,2),ov,1).transpose(1,0,2)
    h,w,_=a.shape;A=a[:,:ov].astype(float);B=a[:,w-ov:].astype(float);E=((A-B)**2).sum(2)
    C=E.copy();P=np.zeros_like(E,int)
    for y in range(1,h):
        for x in range(ov):
            lo,hi=max(0,x-1),min(ov,x+2);k=lo+int(np.argmin(C[y-1,lo:hi]));C[y,x]+=C[y-1,k];P[y,x]=k
    x=int(np.argmin(C[-1]));out=a[:,:w-ov].copy()
    for y in range(h-1,-1,-1):
        out[y,:x]=a[y,w-ov:w-ov+x]        # 경계 왼쪽 = 끝부분(앞 타일 끝에서 자연스럽게 이어짐)
        x=P[y,x] if y else x
    return out
# 1) 배경: 안 판 바위(둥근 모서리 안쪽만)
rock=Image.open(SRC+'rock_sheet.webp').convert('RGB')
RX=[(15,362),(372,719),(730,1076),(1087,1432)];RY=[(23,275),(284,536),(545,798),(808,1061)]
for n,(x0,y0,x1,y1) in enumerate([(x0,y0,x1,y1) for (y0,y1) in RY for (x0,x1) in RX][:13],1):
    a=np.asarray(rock.crop((x0+8,y0+8,x1-8,y1-8)));a=seam_wrap(seam_wrap(a,56,1),48,0)
    save(Image.fromarray(a).quantize(64,method=Image.Quantize.MEDIANCUT).convert('RGB'),f'{OUT}r{n}.webp')

# 2) 굴 안쪽: 판 버전의 어두운 계단 안쪽
mid=Image.open(SRC+'mid_sheet.webp').convert('RGB')
XS=[(21,360),(378,717),(735,1072),(1091,1429)];YS=[(89,294),(342,547),(595,801),(848,1054)]
for n,b in enumerate([(x0,y0,x1,y1) for (y0,y1) in YS for (x0,x1) in XS][:13],1):
    art=mid.crop(b);a=np.asarray(art).astype(float);h,w,_=a.shape;sm=box(a@[.3,.59,.11],6);dark=sm<np.percentile(sm,30)
    sub=sm[h//4:h*3//4,w//2:];j,i=np.unravel_index(sub.argmin(),sub.shape);sd=np.zeros_like(dark);sd[h//4+j,w//2+i]=True;tun=grow(sd,dark)
    tx,ty,tw,th=maxrect(box(tun,4)>.999)
    save(art.crop((tx,ty,tx+tw,ty+th)).quantize(32,method=Image.Quantize.MEDIANCUT).convert('RGB'),f'{OUT}m{n}_d.webp')

# 3) 장식: 왼쪽 = 이름표 + 천장 조각, 오른쪽 = 바닥 조각. 왼쪽 단 B01~B07, 오른쪽 단 B08~B13
deco=np.asarray(Image.open(SRC+'deco_sheet.webp').convert('RGBA'));op=deco[...,3]>100
for (cx0,cx1),(fx0,fx1),first in (((42,459),(490,728),1),((780,1203),(1245,1500),8)):
    rows=runs(op[:,cx0:cx1].mean(1),.002,6)
    for k,(y0,y1) in enumerate(rows):
        n=first+k
        cr=runs(op[y0:y1,cx0:cx1+4].mean(0),0,3);x0=cx0+cr[1][0];x1=cx0+cr[-1][1]        # 첫 덩어리 = 이름표 → 건너뜀
        fr=runs(op[:,fx0:fx1].mean(1),.002,6);fy0,fy1=min(fr,key=lambda r:abs((r[0]+r[1])/2-(y0+y1)/2))
        for part,(a0,a1,b0,b1) in (('t',(x0,x1,y0,y1)),('b',(fx0,fx1,fy0,fy1))):
            sub=deco[b0:b1,a0:a1];m=sub[...,3]>100;ys,xs=np.where(m);sub=sub[ys.min():ys.max()+1,xs.min():xs.max()+1]
            H,W=sub.shape[:2];res=pixelate(sub,round(W*DECO_SCALE),round(H*DECO_SCALE))
            save(Image.fromarray(res),f'{OUT}d{n}_{part}.webp');print(n,part,res.shape[1],res.shape[0])
