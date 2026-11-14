"""입주자 초상화(사용자 원본 art/source/portraits_all.webp, 액자 13장) → 128×128 도트 art/portraits/<키>.png
둘째 액자(보라 두건의 할머니)는 이장 할머니(granny). 셈(sem)은 장비 탭 셈 그림(art/source/sprites/shop_emoji.webp)의 머리 · 어깨를 같은 양피지 배경에 얹어 만든다
양피지 배경(위 · 옆 가장자리에서 이어진 양피지 색)은 갱도 등불 느낌의 어두운 갈색(머리 뒤가 은은하게 밝은 계단식)으로 바꾼다
사용: python3 tools/portrait_art.py"""
from PIL import Image
import os
import numpy as np
from collections import Counter
KEYS=['bau','granny','pin','musoe','luka','ella','serin','hamel','dodam','gangcheol','mir','noeul','arden']
im=Image.open('art/source/portraits_all.webp').convert('RGB');a=np.asarray(im).astype(int)
bg=np.abs(a-a[5,5]).sum(2)<30
def runs(v,th):
    o=[];s=None
    for i,x in enumerate(list(v>th)+[False]):
        if x and s is None:s=i
        if not x and s is not None:o.append(s);s=None
    return o
rows=runs((~bg).mean(1),.1)
boxes=[]
for y0 in rows:
    band=~bg[y0+40:y0+200];boxes+=[(x0,y0) for x0 in runs(band.mean(0),.5)]
assert len(boxes)==13,boxes
N=128
RECOLOR=False   # 사용자 요청: 원래 양피지 배경 그대로
def grow(seed,allow):
    cur=seed&allow
    while True:
        d=cur.copy();d[1:]|=cur[:-1];d[:-1]|=cur[1:];d[:,1:]|=cur[:,:-1];d[:,:-1]|=cur[:,1:];d&=allow
        if (d==cur).all():return cur
        cur=d
BANDS=[(.36,(108,72,48)),(.6,(84,54,36)),(.84,(64,40,26)),(9,(46,28,18))]   # 머리 뒤 등불빛 → 가장자리 어둠
BAY=np.array([[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]])/16
def newbg(h,w):
    yy,xx=np.mgrid[0:h,0:w];r=np.hypot((xx-w*.5)/w,(yy-h*.36)/h)*1.5;out=np.zeros((h,w,3))
    for y in range(h):
        for x in range(w):
            rr=r[y,x]+(BAY[(y//2)%4,(x//2)%4]-.5)*.06    # 경계에서 2px 단위로 살짝 섞임(도트 느낌)
            out[y,x]=next(c for t,c in BANDS if rr<t)
    return out
SRCS={}
for k,(x0,y0) in zip(KEYS,boxes):
    src=a[y0+19:y0+243,x0+19:x0+243].astype(float)   # 액자 안쪽 그림(정사각, 안쪽 장식선은 빼고)
    ok=np.sqrt(((src-np.array([220,157,95.]))**2).sum(2))<40;sd=np.zeros_like(ok);sd[0]=True;sd[:150,0]=True;sd[:150,-1]=True
    if RECOLOR:m=grow(sd,ok);src[m]=newbg(*m.shape)[m]          # (끔) 양피지 → 게임 색 배경
    SRCS[k]=(src,grow(sd,ok))
# 셈: 양피지 배경(이장 할머니 액자의 양피지에서 사람 자리를 주변 색으로 메움) + 장비 탭 셈 그림의 머리 · 어깨
from PIL import ImageFilter
def parchment(src,m):
    h,w,_=src.shape;num=np.zeros_like(src);num[m]=src[m];den=m.astype(float)
    def bl(x,r):   # 상자 흐림 3번(가우스 흐림 근사)
        x=x.astype(float)
        for _ in range(3):
            for ax in(0,1):
                c=np.cumsum(np.pad(x,[(r+1,r) if a==ax else (0,0) for a in(0,1)],mode='edge'),axis=ax)
                x=(np.take(c,range(2*r+1,c.shape[ax]),axis=ax)-np.take(c,range(0,c.shape[ax]-2*r-1),axis=ax))/(2*r+1)
        return x
    out=src.copy();fill=np.stack([bl(num[...,c],14)/np.maximum(bl(den,14),1e-3) for c in range(3)],2);out[~m]=fill[~m];return out
def sem_src():
    e=np.asarray(Image.open('art/source/sprites/shop_emoji.webp').convert('RGBA')).astype(float)
    sub=e[512:1006,748:1178].copy();al=sub[...,3]>100
    # 가장 큰 덩어리(셈)만 남김: 옆의 느낌표 장식 · 붉은 테두리 조각 지움
    from collections import deque
    lab=np.zeros(al.shape,int);cur=0;sizes=[0]
    for yy,xx in zip(*np.where(al)):
        if lab[yy,xx]:continue
        cur+=1;q=deque([(yy,xx)]);lab[yy,xx]=cur;n=0
        while q:
            y_,x_=q.popleft();n+=1
            for dy,dx in((1,0),(-1,0),(0,1),(0,-1)):
                ny,nx=y_+dy,x_+dx
                if 0<=ny<al.shape[0] and 0<=nx<al.shape[1] and al[ny,nx] and not lab[ny,nx]:lab[ny,nx]=cur;q.append((ny,nx))
        sizes.append(n)
    keep=lab==int(np.argmax(sizes));sub[~keep,3]=0
    # 붉은 테두리(배경 지울 때 남은 빨간 번짐)는 진한 갈색 윤곽으로
    r,g,b=sub[...,0],sub[...,1],sub[...,2];red=(r>150)&(g<90)&(b<90)&(sub[...,3]>0);sub[red,:3]=(58,30,22)
    ys,xs=np.where(sub[...,3]>100);top=ys.min()
    S=376;cx=int(np.median(xs[ys<top+120]))+2   # 머리 가운데. 다른 초상화와 얼굴 크기 · 어깨가 보이는 정도를 맞춤
    x0=cx-S//2;y0=top+10          # 다른 초상화처럼 머리 꼭대기가 액자 위에 닿게
    crop=np.zeros((S,S,4));sy0,sx0=max(0,y0),max(0,x0);sy1,sx1=min(sub.shape[0],y0+S),min(sub.shape[1],x0+S)
    crop[sy0-y0:sy1-y0,sx0-x0:sx1-x0]=sub[sy0:sy1,sx0:sx1]
    g_src,g_m=SRCS['granny'];bg=parchment(g_src,g_m)
    bgS=np.asarray(Image.fromarray(bg.astype(np.uint8)).resize((S,S),Image.LANCZOS)).astype(float)
    # 색조: 다른 초상화(밝기 평균 약 100 · 편차 약 60, 윤곽은 검정이 아니라 짙은 갈색)에 맞게 대비를 낮추고 어두운 곳을 따뜻하게 올림
    fig=crop[...,:3]*.76+np.array([40,27,22.])
    al=crop[...,3:4]/255;return (fig*al+bgS*(1-al)).clip(0,255)
# 셈: 사용자가 따로 그린 셈 초상화(art/source/sem_portrait.webp, 액자 + 이름표)가 있으면 그 액자 안쪽 그림을 그대로 씀
if os.path.exists('art/source/sem_portrait.webp'):
    sp=np.asarray(Image.open('art/source/sem_portrait.webp').convert('RGB')).astype(float)
    SRCS['sem']=(sp[82:902,272:1092],None)   # 금테 · 이름표는 빼고, 다른 초상화처럼 얼굴이 크게(머리 위 ~ 어깨) 정사각
else:SRCS['sem']=(sem_src(),None)
for k in KEYS+['sem']:
    src=SRCS[k][0]
    h,w,_=src.shape
    pq=Image.fromarray(src.astype(np.uint8)).quantize(48,method=Image.Quantize.MEDIANCUT)
    pal=np.array(pq.getpalette()[:48*3]).reshape(-1,3).astype(float);idx=np.asarray(pq);luma=pal@[.3,.59,.11]
    out=np.zeros((N,N,3),np.uint8)
    for j in range(N):
        ya,yb=j*h//N,(j+1)*h//N
        for i in range(N):
            xa,xb=i*w//N,(i+1)*w//N;cnt=Counter(idx[ya:yb,xa:xb].ravel().tolist());n=sum(cnt.values())
            dk=[q for q in cnt if luma[q]<55]
            q=max(dk,key=lambda q:cnt[q]) if dk and sum(cnt[q] for q in dk)>=n*.3 else cnt.most_common(1)[0][0]
            out[j,i]=pal[q]
    Image.fromarray(out).convert('P',palette=Image.Palette.ADAPTIVE,colors=48).save(f'art/portraits/{k}.png',optimize=True)  # 48색 팔레트 PNG(용량 절약)
print('ok',len(boxes))
