"""입주자 초상화(사용자 원본 art/source/portraits_all.webp, 액자 13장) → 128×128 도트 art/portraits/<키>.png
양피지 배경(위 · 옆 가장자리에서 이어진 양피지 색)은 갱도 등불 느낌의 어두운 갈색(머리 뒤가 은은하게 밝은 계단식)으로 바꾼다
사용: python3 tools/portrait_art.py"""
from PIL import Image
import numpy as np
from collections import Counter
KEYS=['bau','sem','pin','musoe','luka','ella','serin','hamel','dodam','gangcheol','mir','noeul','arden']
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
for k,(x0,y0) in zip(KEYS,boxes):
    src=a[y0+19:y0+243,x0+19:x0+243].astype(float)   # 액자 안쪽 그림(정사각, 안쪽 장식선은 빼고)
    ok=np.sqrt(((src-np.array([220,157,95.]))**2).sum(2))<40;sd=np.zeros_like(ok);sd[0]=True;sd[:150,0]=True;sd[:150,-1]=True
    m=grow(sd,ok);src[m]=newbg(*m.shape)[m]          # 양피지 → 게임 색 배경
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
