"""주인공 스프라이트 묶음 만들기: art/source/hero_sheet.webp에서 프레임을 골라 게임 크기로 줄인다.
사용: 작업 폴더에 sheet.webp, lab.npy, comps.json(프레임 분리 결과)을 두고 python3 hero_atlas.py 1.95 2
  첫 값 = 줄이는 배율(3.9 → 게임 1배 크기), 둘째 값 = 화면 배율(2 → 2배 해상도 도트, 그릴 때 절반 크기로 → 같은 크기에 두 배 촘촘)"""
from PIL import Image
import numpy as np,json,sys
from collections import Counter
im=np.asarray(Image.open('sheet.webp').convert('RGBA')).astype(np.float64);lab=np.load('lab.npy')
comps={c[0]:c for c in json.load(open('comps.json'))}
F=float(sys.argv[1]) if len(sys.argv)>1 else 1.95
HS=int(sys.argv[2]) if len(sys.argv)>2 else 2
SEL={'rest':(12,1),'rest2':(11,1),'ready':(33,1),'sw0':(34,1),'sw1':(32,1),'sw2':(37,1),'sw3':(38,1),'sw4':(36,1),'sw5':(35,1),
     'walk0':(13,1),'walk1':(14,1),'walk2':(19,1),'walk3':(15,1),'walk4':(18,1),'walk5':(16,1),
     'joy':(55,0),'yawn':(53,0),'happy':(52,0),'sleep':(64,0)}
# 공용 팔레트: 원본 해상도의 불투명 픽셀로
px=[]
for k,(cid,f) in SEL.items():
    c=comps[cid];x0,y0,x1,y1=c[2],c[3],c[4],c[5];reg=im[y0:y1+1,x0:x1+1];m=(lab[y0:y1+1,x0:x1+1]==cid)&(reg[:,:,3]>128);px.append(reg[m][:,:3])
px=np.concatenate(px);pq=Image.fromarray(px.reshape(1,-1,3).astype(np.uint8)).quantize(colors=36,method=Image.Quantize.MEDIANCUT)
pal=np.array(pq.getpalette()[:36*3]).reshape(-1,3).astype(float);luma=pal@[.3,.59,.11]
def qidx(rgb):return ((rgb[...,None,:]-pal)**2).sum(-1).argmin(-1)
OUT=pal[luma.argmin()]
tiles=[]
for k,(cid,flip) in SEL.items():
    c=comps[cid];x0,y0,x1,y1=c[2],c[3],c[4],c[5];reg=im[y0:y1+1,x0:x1+1];m=(lab[y0:y1+1,x0:x1+1]==cid)&(reg[:,:,3]>128)
    idx=qidx(reg[:,:,:3]);h,w=m.shape;H=max(1,round(h/F));W=max(1,round(w/F))
    res=np.zeros((H,W,4),np.uint8)
    for j in range(H):
        for i in range(W):
            ya,yb=int(round(j*h/H)),max(int(round(j*h/H))+1,int(round((j+1)*h/H)));xa,xb=int(round(i*w/W)),max(int(round(i*w/W))+1,int(round((i+1)*w/W)))
            cm=m[ya:yb,xa:xb];tot=cm.size
            if cm.sum()<tot*.42:continue
            ids=idx[ya:yb,xa:xb][cm];cnt=Counter(ids.tolist())
            dark=[q for q in cnt if luma[q]<62];dn=sum(cnt[q] for q in dark)
            # 밝은 등불(노란 빛)은 작아도 살린다
            lamp=[q for q in cnt if pal[q][0]>200 and pal[q][1]>170 and pal[q][2]<140];ln=sum(cnt[q] for q in lamp)
            if ln>=len(ids)*.25:q=max(lamp,key=lambda q:cnt[q])
            elif dn>=len(ids)*.3:q=max(dark,key=lambda q:cnt[q])
            else:q=cnt.most_common(1)[0][0]
            res[j,i,:3]=pal[q];res[j,i,3]=255
    # 외곽선: 투명과 맞닿은 밝은 픽셀은 어둡게
    A=res[:,:,3]>0;o=res.copy()
    for j in range(H):
        for i in range(W):
            if not A[j,i]:continue
            edge=any(not(0<=j+dj<H and 0<=i+di<W) or not A[j+dj,i+di] for dj,di in((1,0),(-1,0),(0,1),(0,-1)))
            if edge and (res[j,i,:3]@[.3,.59,.11])>70:o[j,i,:3]=OUT
    t=Image.fromarray(o,'RGBA')
    if flip:t=t.transpose(Image.FLIP_LEFT_RIGHT)
    t=t.crop(t.getbbox());tiles.append((k,t))
pad=1;Ht=max(t.height for _,t in tiles);Wt=sum(t.width+pad for _,t in tiles);atlas=Image.new('RGBA',(Wt,Ht));x=0;meta={}
for k,t in tiles:atlas.paste(t,(x,Ht-t.height));meta[k]=[x,Ht-t.height,t.width,t.height];x+=t.width+pad
# 기준점: 아래쪽 절반 불투명 픽셀의 가로 가운데값(몸통 기준, 곡괭이 끝 제외)
A=np.asarray(atlas)
for k,(x,y,w,h) in list(meta.items()):
    ys,xs=np.nonzero(A[y+h//2:y+h,x:x+w,3]>0);meta[k]=[x,y,w,h,int(round(np.median(xs))) if len(xs) else w//2]
meta['_s']=HS
atlas.save('hero.png',optimize=True);json.dump(meta,open('hero_meta.json','w'),separators=(',',':'))
bg=Image.new('RGBA',atlas.size,(46,35,25,255));bg.alpha_composite(atlas);bg.resize((atlas.width*6,atlas.height*6),Image.NEAREST).save('hero_x6.png')
print(atlas.size,meta['rest'],meta['sw1'],meta['sleep'])
