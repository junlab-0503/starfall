"""상점 그림(사용자 원본) → 게임 도트로 줄이기.
사람: art/source/shop/people.webp (검은 바탕)에서 다섯 명을 잘라 상반신(머리 꼭대기 ~ 허리, 모두 같은 비율) 도트로 → art/shop/<키>.png (화면 1:1)
배경: art/source/shop/bg_*.webp의 가로 전체를 360px로 줄여 띠를 자르고 양옆은 가장자리 색을 어둡게 이어 448×200으로(거울처럼 뒤집어 붙이지 않음), 살짝 어둡고 따뜻하게 → art/shop/bg_<키>.png (화면 1:1)
사용: python3 tools/shop_art.py"""
from PIL import Image
import numpy as np,os
from collections import Counter
SRC='art/source/shop/';OUT='art/shop/';os.makedirs(OUT,exist_ok=True)
H=192           # 상반신 도트 높이(화면 1:1)
CH=480          # 원본에서 머리 꼭대기부터 허리까지 높이(다섯 명 모두 같게 → 같은 비율)
OUTLINE=np.array([36,22,12])
def grow(seed,allow):
    cur=seed&allow
    while True:
        d=cur.copy();d[1:]|=cur[:-1];d[:-1]|=cur[1:];d[:,1:]|=cur[:,:-1];d[:,:-1]|=cur[:,1:];d&=allow
        if (d==cur).all():return cur
        cur=d
def pixelate(rgb,mask,W,Hh,ncol):
    """칸마다 가장 많은 색(어두운 윤곽은 30%만 넘어도 우선) → 또렷한 도트"""
    px=rgb[mask];pq=Image.fromarray(px.reshape(1,-1,3).astype(np.uint8)).quantize(colors=ncol,method=Image.Quantize.MEDIANCUT)
    pal=np.array(pq.getpalette()[:ncol*3]).reshape(-1,3).astype(float);luma=pal@[.3,.59,.11]
    idx=np.zeros(mask.shape,int)
    for y0 in range(0,mask.shape[0],256):
        idx[y0:y0+256]=((rgb[y0:y0+256,:,None,:]-pal)**2).sum(-1).argmin(-1)
    h,w=mask.shape;res=np.zeros((Hh,W,4),np.uint8)
    for j in range(Hh):
        ya,yb=j*h//Hh,max(j*h//Hh+1,(j+1)*h//Hh)
        for i in range(W):
            xa,xb=i*w//W,max(i*w//W+1,(i+1)*w//W);cm=mask[ya:yb,xa:xb]
            if cm.sum()<cm.size*.45:continue
            cnt=Counter(idx[ya:yb,xa:xb][cm].tolist());n=sum(cnt.values());dark=[q for q in cnt if luma[q]<50]
            q=max(dark,key=lambda q:cnt[q]) if dark and sum(cnt[q] for q in dark)>=n*.3 else cnt.most_common(1)[0][0]
            res[j,i,:3]=pal[q];res[j,i,3]=255
    return res
def people():
    a=np.asarray(Image.open(SRC+'people.webp').convert('RGB')).astype(float)
    dark=a.max(2)<40;s=np.zeros_like(dark);s[0]=s[-1]=s[:,0]=s[:,-1]=True;fg=~grow(s,dark)
    # 키: (씨앗 x,y, 잘라 볼 x 범위, 좌우 뒤집기) — 모두 화면 가운데(말풍선 쪽)를 보게
    P={'pin':((300,350),(0,600)),'mir':((850,400),(600,1199)),'musoe':((200,950),(0,370)),'sem':((540,1000),(360,712)),'luka':((960,1000),(712,1199))}
    for k,((x,y),(xa,xb)) in P.items():
        allow=fg.copy();allow[:,:xa]=False;allow[:,xb:]=False;sd=np.zeros_like(fg);sd[y,x]=True;m=grow(sd,allow)
        ys,xs=np.where(m);y0=ys.min();y1=y0+CH;m[y1:]=False;ys,xs=np.where(m);x0,x1=xs.min(),xs.max()+1
        sub=a[y0:y1,x0:x1];mm=m[y0:y1,x0:x1];Wd=round((x1-x0)*H/CH)
        r=pixelate(sub,mm,Wd,H,48)
        A=r[:,:,3]>0;o=r.copy()   # 바깥 테두리는 게임 윤곽색으로
        for j in range(H):
            for i in range(Wd):
                if A[j,i] and any(not(0<=j+dj<H and 0<=i+di<Wd) or not A[j+dj,i+di] for dj,di in((1,0),(-1,0),(0,1),(0,-1))) and j<H-1:o[j,i,:3]=OUTLINE
        Image.fromarray(o).quantize(64,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).save(OUT+k+'.png',optimize=True)  # 팔레트 PNG(투명 유지, 용량 절약);print(k,o.shape[1],'x',o.shape[0])
def backgrounds():
    # 가운데 360px은 원본 그림 그대로(가로 전체를 360px로 줄임), 양옆 44px씩은 가장자리 색을 어둡게 이어 붙임(거울처럼 뒤집어 붙이지 않음)
    # → 폰 화면(무대 폭 약 340~400px)에선 원본 그림만 보이고, 더 넓은 화면에선 양끝이 어둡게 가라앉음
    # 키: (원본, 띠 아래쪽 y(원본 px), 좌우 뒤집기, 색 보정)
    BH=200;BW=448;MW=360
    B={'pin':('bg_workshop',230+667,0,(1,1,1)),'musoe':('bg_workshop',1500,1,(1.1,.95,.82)),'mir':('bg_magic',200+667,0,(1,1,1)),'sem':('bg_pantry',120+667,0,(1,1,1)),'luka':('bg_market',250+667,0,(1,1,1))}
    for k,(f,y1,flip,tint) in B.items():
        im=Image.open(SRC+f+'.webp').convert('RGB');w,h=im.size;scl=MW/w;band=im.crop((0,y1-round(BH/scl),w,y1))
        if flip:band=band.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        mid=np.asarray(band.resize((MW,BH),Image.Resampling.BOX)).astype(float);ex=(BW-MW)//2
        def side(edge):   # 가장자리 8px의 줄별 평균색을 위아래로 조금 흐려, 바깥으로 갈수록 어둡게
            c=edge.mean(1);c=np.stack([np.convolve(np.pad(c[:,q],6,mode='edge'),np.ones(13)/13,'valid') for q in range(3)],1)
            return np.stack([c*(.72-.42*i/ex) for i in range(ex)],1)
        L=side(mid[:,:8])[:,::-1];R=side(mid[:,-8:])
        a=np.concatenate([L,mid,R],1)[:,:BW]
        g=a@[.3,.59,.11];a=g[...,None]+(a-g[...,None])*.8;a=a*.76;a[...,0]*=1.04*tint[0];a[...,1]*=tint[1];a[...,2]*=.9*tint[2]
        sm=Image.fromarray(a.clip(0,255).astype(np.uint8)).quantize(64,method=Image.Quantize.MEDIANCUT)
        sm.save(OUT+'bg_'+k+'.png',optimize=True);print('bg',k,sm.size,'mid',MW)
backgrounds()   # 사람은 이제 tools/sprite_art.py(새 그림 shop_emoji.webp)에서 만듦. 옛 사람 그림이 필요하면 people()
