"""채굴 화면 지층 그림(사용자 원본 art/source/strata/) → 게임용 art/strata/
  r<번호>.webp    : 배경 = 안 판 채굴층 바위 한 장(rock_sheet.webp). 가장자리를 이음매 없이 다듬어(경계선 찾아 잘라 붙이기) 그대로 반복
  gold.webp       : 황금 광맥 배경(gold_rock.webp, 금맥이 나타난 동안)
사용: python3 tools/strata_art.py"""
from PIL import Image
import numpy as np
from collections import Counter
SRC='art/source/strata/';OUT='art/strata/'
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

# 1-3) 땅 판 흔적(dug_sheet.webp, 13칸): 칸마다 굴(어두운 부분)을 찾아
#   dg<번호>.webp = 굴(알파 255) + 둘레 6px(알파 200, 바위 가장자리), 나머지 투명
#   dug_meta.json = 칸마다 [주인공 발 x, 발 y, 숯 발 y, 파는 벽 x](원본 px)
dug=np.asarray(Image.open(SRC+'dug_sheet.webp').convert('RGB')).astype(float)
DRY=[(65,298),(313,545),(561,798),(816,1050)];DRX=[(20,359),(378,715),(733,1072),(1087,1426)];meta=[]
def dilate(m,k):
    o=m.copy()
    for _ in range(k):
        d=o.copy();d[1:]|=o[:-1];d[:-1]|=o[1:];d[:,1:]|=o[:,:-1];d[:,:-1]|=o[:,1:];o=d
    return o
for n,(x0,x1,y0,y1) in enumerate([(x0,x1,y0,y1) for (y0,y1) in DRY for (x0,x1) in DRX][:13],1):
    t=dug[y0:y1,x0:x1];h,w,_=t.shape;L=t@[.3,.59,.11];sm=box(L,5);big=box(L,14)
    light=t.min(2)>225;sd=np.zeros((h,w),bool);sd[0]=sd[-1]=sd[:,0]=sd[:,-1]=True;inside=~grow(sd,light)
    dark=(sm<np.percentile(sm[inside],22))&inside
    reg=big.copy();reg[:,:int(w*.4)]=1e9;reg[:h//4]=1e9;reg[h*3//4:]=1e9;reg[~inside]=1e9;j,i=np.unravel_index(reg.argmin(),reg.shape)
    s2=np.zeros((h,w),bool);s2[j,i]=True;cave=grow(s2,dark)
    # 굴 가장자리를 3px 단위로 다듬지 않고 그대로(사용자 그림의 결) · 바탕 흰색 테두리는 빼고
    rim=dilate(cave,6)&inside
    ys,xs=np.where(cave);cl=xs.min()
    fl={x:ys[xs==x].max() for x in range(w) if (xs==x).any()}
    top={x:ys[xs==x].min() for x in range(w) if (xs==x).any()}
    # 주인공 자리: 굴 왼쪽 끝에서 20~70px 사이 가장 높은(천장 ~ 바닥) 곳
    hx=max(range(cl+20,cl+70),key=lambda x:(fl.get(x,0)-top.get(x,0)));fy=fl[hx]
    cx=hx+56;cy=fl.get(cx,fy)
    band=(ys>=fy-50)&(ys<=fy);wx=int(xs[band].min())   # 파는 벽: 주인공 높이에서 굴 왼쪽 끝
    meta.append([int(hx),int(fy),int(cy),wx])
    # 한 장에: 알파 255 = 굴 안, 200 = 둘레(바위 가장자리), 0 = 투명 → 게임에서 둘로 나눠 씀
    rgba=np.zeros((h,w,4),np.uint8);rgba[...,:3]=t.astype(np.uint8);rgba[...,3]=np.where(cave,255,np.where(rim,200,0))
    Image.fromarray(rgba).save(f'{OUT}dg{n}.webp',lossless=True,quality=100,method=6)
    print('dug',n,'hero',hx,fy,'cat y',cy,'cave h',fy-top[hx])
import json;json.dump(meta,open(OUT+'dug_meta.json','w'))

# 2) 황금 광맥: 안 판 금맥 바위(gold_rock.webp) → 다른 지층 바위와 비슷한 크기로 줄이고 이음매 없이 → gold.webp
gr=np.asarray(Image.open(SRC+'gold_rock.webp').convert('RGBA'));ys,xs=np.where(gr[...,3]>200)
y0,y1,x0,x1=ys.min()+70,ys.max()-70,xs.min()+70,xs.max()-70;sub=gr[y0:y1,x0:x1]
H,W=sub.shape[:2];f=3.0;res=pixelate(sub,round(W/f),round(H/f))[...,:3]
res=seam_wrap(seam_wrap(res,40,1),32,0)
save(Image.fromarray(res).quantize(64,method=Image.Quantize.MEDIANCUT).convert('RGB'),f'{OUT}gold.webp');print('gold',res.shape[1],res.shape[0])

