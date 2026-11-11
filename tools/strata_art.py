"""채굴 화면 지층 그림(사용자 원본 art/source/strata/) → 게임용 art/strata/
  r<번호>.webp    : 배경 = 안 판 채굴층 바위 한 장(rock_sheet.webp). 가장자리를 이음매 없이 다듬어(경계선 찾아 잘라 붙이기) 그대로 반복
  gold.webp       : 황금 광맥 배경(gold_rock.webp, 금맥이 나타난 동안)
  dg<번호>.webp   : 굴 띠(tunnel_sheet.webp) — 아래 1-3) 설명
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

# 1-3) 굴(tunnel_sheet.webp, 사용자 그림 13칸: 칸마다 오른쪽 위 → 왼쪽 아래로 판 굴)
#   그림의 굴은 오른쪽이 높고(약 80px) 왼쪽 끝이 좁아지는 쐐기 모양이라 그대로 이으면 천장이 톱니처럼 끊김
#   → 칸마다: 바닥 · 천장 가장자리(바위 띠)는 그림 그대로 옮기고, 그 사이 어두운 굴 안만 늘려 높이 T로 고르게 한 "굴 띠" 한 장
#   → 게임에서 이 띠를 판 길을 따라 겹쳐 찍으면 한 줄로 쭉 이어진 굴. 왼쪽 끝은 둥근 막장(주인공이 캐는 벽)
#   dg<번호>.webp = 굴 안(알파 255) + 천장 · 바닥 바위 띠(알파 200), 나머지 투명. 가장자리는 점무늬로 흐리게(바위 배경에 섞이게)
#   dug_meta.json = 칸마다 [막장 x, 막장 바닥 y, 굴 높이 T](띠 그림 안 px). 바닥 기울기는 게임의 판 길(9/24)과 같음
SLOPE=9/24;T=84;RIM=20;NOSE=22;LM=24;FADE=34
BAY=np.array([[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]])/16+1/32
tun=np.asarray(Image.open(SRC+'tunnel_sheet.webp').convert('RGBA')).astype(float)
def erode(m,k):return ~dilate(~m,k)
def dilate(m,k):
    o=m.copy()
    for _ in range(k):
        d=o.copy();d[1:]|=o[:-1];d[:-1]|=o[1:];d[:,1:]|=o[:,:-1];d[:,:-1]|=o[:,1:];o=d
    return o
al=tun[...,3]>128
def runs2(v,th,minlen=40):
    o=[];st=None
    for i,x in enumerate(list(v>th)+[False]):
        if x and st is None:st=i
        if not x and st is not None:
            if i-st>=minlen:o.append((st,i))
            st=None
    return o
TB=[(x0,y0,x1,y1) for (y0,y1) in runs2(al.mean(1),.05) for (x0,x1) in runs2(al[y0:y1].mean(0),.2)];assert len(TB)==13,TB
meta=[]
for n,(x0,y0,x1,y1) in enumerate(TB,1):
    rgb=tun[y0:y1,x0:x1,:3];m=tun[y0:y1,x0:x1,3]>200;mi=erode(m,5);h,w=m.shape
    lum=rgb@[.3,.59,.11];s4=box(lum,4);sdv=np.sqrt(np.maximum(box(lum**2,4)-s4**2,0))
    core=(box(lum,10)<np.percentile(box(lum,10)[m],12))&m
    cl=np.median(lum[core]);rl=np.percentile(lum[m],60);sdc=np.median(sdv[core])
    cave=grow(core,(s4<cl+.8*(rl-cl))&(sdv<sdc+5)&m);cave=erode(dilate(cave,3),3)&m   # 매끈하고 어두운 굴 안(바닥 흙 포함)
    xs=[x for x in range(w) if cave[:,x].any()];top=np.array([np.where(cave[:,x])[0].min() for x in xs]);bot=np.array([np.where(cave[:,x])[0].max() for x in xs]);xs=np.array(xs)
    k=(xs>60)&(xs<w-40);fb=np.polyfit(xs[k],bot[k],1)
    topin=np.array([np.where(mi[:,x])[0].min() for x in xs]);k2=k&(top>topin+6);cb=np.polyfit(xs[k2],top[k2],1)
    fl=lambda x:np.polyval(fb,x);ce=lambda x:np.polyval(cb,x)
    # 쓸 범위: 굴이 44px 이상 높고, 천장 · 바닥 띠가 그림 안에 들어오는 곳
    use=[x for x in xs if fl(x)-ce(x)>=44 and ce(x)-RIM>=np.where(mi[:,x])[0].min() and fl(x)+RIM<=np.where(mi[:,x])[0].max()]
    xa,xb=min(use),max(use);Wd=xb-xa+1+LM;Y0=int(np.ceil(2+T+RIM+SLOPE*(Wd-1)));Hd=Y0+RIM+3
    out=np.zeros((Hd,Wd,4),np.uint8)
    for u in range(LM,Wd):
        x=u-LM+xa;Ft=Y0-SLOPE*u;Ct=Ft-T;fs,cs=fl(x),ce(x)
        for v in range(max(0,int(Ct-RIM-1)),min(Hd,int(Ft+RIM)+2)):
            if v>=Ft-6:sy=fs+(v-Ft);band='f'
            elif v<=Ct+6:sy=cs+(v-Ct);band='c'
            else:tt=(v-(Ct+6))/((Ft-6)-(Ct+6));sy=(cs+6)+tt*((fs-6)-(cs+6));band='m'
            sy=int(round(sy))
            if sy<0 or sy>=h or not mi[sy,x]:continue
            isc=cave[sy,x] or band=='m'
            # 막장(왼쪽 끝): 둥근 코 모양 밖은 굴이 아님
            du=u-LM;vm=(v-(Ct+Ft)/2)/(T/2)
            if isc and du<NOSE and du<NOSE*(1-np.sqrt(max(0,1-min(1,vm*vm)))):continue
            out[v,u,:3]=rgb[sy,x].astype(np.uint8);out[v,u,3]=255 if isc else 200
    # 바위 띠 바깥 끝 · 막장 쪽 끝 · 오른쪽 끝은 바위 틈(어두운 줄)을 따라 자름 → 배경 바위와 자연스럽게 맞물림(점무늬 없이)
    L2=out[...,:3].astype(float)@[.3,.59,.11];L2[out[...,3]==0]=999
    def seam(cost):   # cost[i, j]: i번째 줄에서 j번째 자리의 비용 → 한 칸씩 최대 1만 움직이는 가장 어두운 길
        C=cost.copy();P=np.zeros(C.shape,int)
        for i in range(1,len(C)):
            for j in range(C.shape[1]):
                lo,hi=max(0,j-1),min(C.shape[1],j+2);k=lo+int(np.argmin(C[i-1,lo:hi]));C[i,j]+=C[i-1,k];P[i,j]=k
        j=int(np.argmin(C[-1]));path=[0]*len(C)
        for i in range(len(C)-1,-1,-1):path[i]=j;j=P[i,j]
        return path
    DD=list(range(RIM-12,RIM+1))
    for side in('c','f'):
        us=list(range(LM,Wd));cost=np.zeros((len(us),len(DD)))
        for a_,u in enumerate(us):
            Ft=Y0-SLOPE*u;Ct=Ft-T
            for b_,dd in enumerate(DD):
                v=int(round(Ct-dd if side=='c' else Ft+dd));cost[a_,b_]=L2[v,u] if 0<=v<Hd else 999
        cut=seam(cost)
        for a_,u in enumerate(us):
            Ft=Y0-SLOPE*u;Ct=Ft-T
            for dd in range(DD[cut[a_]]+1,RIM+2):
                v=int(round(Ct-dd if side=='c' else Ft+dd))
                if 0<=v<Hd:out[v,u,3]=0
    rows=[v for v in range(Hd) if out[v,LM:,3].any()]
    for lo,hi,keep_right in((LM,LM+12,True),(Wd-FADE,Wd,False)):
        cost=np.array([[L2[v,u] for u in range(lo,hi)] for v in rows]);cut=seam(cost)
        for i,v in enumerate(rows):
            c=lo+cut[i]
            if keep_right:
                for u in range(LM,c):
                    if out[v,u,3]==200:out[v,u,3]=0      # 막장 쪽: 바위 띠만(굴 안은 그대로)
            else:out[v,c+1:,3]=0
    Image.fromarray(out).save(f'{OUT}dg{n}.webp',lossless=True,quality=100,method=6)
    meta.append([LM,int(round(Y0-SLOPE*LM))+5,T])   # 굴 띠를 5px 위로 → 발이 바닥 흙에 살짝 묻히게
    print('tunnel',n,'src x',xa,xb,'slope floor %.3f ceil %.3f'%(-fb[0],-cb[0]),'strip',Wd,Hd)
import json;json.dump(meta,open(OUT+'dug_meta.json','w'))

# 2) 황금 광맥: 안 판 금맥 바위(gold_rock.webp) → 다른 지층 바위와 비슷한 크기로 줄이고 이음매 없이 → gold.webp
gr=np.asarray(Image.open(SRC+'gold_rock.webp').convert('RGBA'));ys,xs=np.where(gr[...,3]>200)
y0,y1,x0,x1=ys.min()+70,ys.max()-70,xs.min()+70,xs.max()-70;sub=gr[y0:y1,x0:x1]
H,W=sub.shape[:2];f=3.0;res=pixelate(sub,round(W/f),round(H/f))[...,:3]
res=seam_wrap(seam_wrap(res,40,1),32,0)
save(Image.fromarray(res).quantize(64,method=Image.Quantize.MEDIANCUT).convert('RGB'),f'{OUT}gold.webp');print('gold',res.shape[1],res.shape[0])

