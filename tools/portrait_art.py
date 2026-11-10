"""입주자 초상화(사용자 원본 art/source/portraits_all.webp, 액자 13장) → 128×128 도트 art/portraits/<키>.png
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
for k,(x0,y0) in zip(KEYS,boxes):
    src=a[y0+14:y0+244,x0+15:x0+245].astype(float)   # 액자 안쪽 그림(정사각)
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
