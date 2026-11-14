"""광맥 입구 장면(art/scene/entry.webp) 아래로 이어지는 땅속 바위 무늬 → art/scene/under.webp
입구 그림의 땅속 바위 줄(y 540~620)을 위아래 · 좌우 이음매 없이 다듬은 한 장(경계선을 찾아 잘라 붙임).
게임(src/tut.js)에서 그림 아래에 줄마다 옆으로 어긋나게 깔고, 아래로 갈수록 어둠 속으로 사라지게 그린다(같은 띠를 복사해 붙인 느낌 없이).
사용: python3 tools/scene_art.py"""
from PIL import Image
import numpy as np
def seam_wrap(a,ov,axis):
    """axis=1: 좌우, 0: 위아래. 끝 ov만큼을 처음과 겹쳐, 가장 차이가 적은 길을 따라 잘라 붙임"""
    if axis==0:return seam_wrap(a.transpose(1,0,2),ov,1).transpose(1,0,2)
    h,w,_=a.shape;A=a[:,:ov].astype(float);B=a[:,w-ov:].astype(float);D=((A-B)**2).sum(2);C=D.copy();P=np.zeros((h,ov),int)
    for y in range(1,h):
        for x in range(ov):
            lo,hi=max(0,x-1),min(ov,x+2);k=lo+int(np.argmin(C[y-1,lo:hi]));C[y,x]+=C[y-1,k];P[y,x]=k
    x=int(np.argmin(C[-1]));out=a[:,:w-ov].copy()
    for y in range(h-1,-1,-1):
        out[y,:x]=a[y,w-ov:w-ov+x]
        x=P[y,x] if y else x
    return out
a=np.asarray(Image.open('art/scene/entry.webp').convert('RGB'))
band=a[540:620]                      # 풀뿌리 아래 ~ 어두워지기 전의 바위 한 줄
t=seam_wrap(seam_wrap(band,24,0),80,1)
Image.fromarray(t).save('art/scene/under.webp',quality=82,method=6);print('art/scene/under.webp',t.shape[1],'x',t.shape[0])
