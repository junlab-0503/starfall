"""캐릭터 스프라이트 시트에서 고른 프레임을 게임 크기 도트로 줄여 묶음(png + 기준점 json)으로 만든다.
사용: python3 tools/npc_atlas.py <시트> <프레임분리 lab.npy> <comps.json> <배율> <출력이름> 키=성분번호[:f][@배율] ...  (f = 좌우 뒤집기, @배율 = 그 프레임만 다른 배율)"""
from PIL import Image
import numpy as np,json,sys
from collections import Counter
sheet,labf,compf,F,out=sys.argv[1],sys.argv[2],sys.argv[3],float(sys.argv[4]),sys.argv[5]
SEL={};SC={}
for a in sys.argv[6:]:
    k,v=a.split('=');v,_,sc=v.partition('@');SEL[k]=(int(v.split(':')[0]),v.endswith(':f'));SC[k]=float(sc) if sc else F
im=np.asarray(Image.open(sheet).convert('RGBA')).astype(np.float64);lab=np.load(labf);comps={c[0]:c for c in json.load(open(compf))}
px=[]
for k,(cid,f) in SEL.items():
    c=comps[cid];x0,y0,x1,y1=c[2],c[3],c[4],c[5];reg=im[y0:y1+1,x0:x1+1];m=(lab[y0:y1+1,x0:x1+1]==cid)&(reg[:,:,3]>128);px.append(reg[m][:,:3])
px=np.concatenate(px);pq=Image.fromarray(px.reshape(1,-1,3).astype(np.uint8)).quantize(colors=32,method=Image.Quantize.MEDIANCUT)
pal=np.array(pq.getpalette()[:32*3]).reshape(-1,3).astype(float);luma=pal@[.3,.59,.11];OUT=pal[luma.argmin()]
tiles=[]
for k,(cid,flip) in SEL.items():
    c=comps[cid];x0,y0,x1,y1=c[2],c[3],c[4],c[5];reg=im[y0:y1+1,x0:x1+1];m=(lab[y0:y1+1,x0:x1+1]==cid)&(reg[:,:,3]>128)
    idx=((reg[:,:,:3][...,None,:]-pal)**2).sum(-1).argmin(-1);h,w=m.shape;H=max(1,round(h/SC[k]));W=max(1,round(w/SC[k]));res=np.zeros((H,W,4),np.uint8)
    for j in range(H):
        for i in range(W):
            ya,yb=int(round(j*h/H)),max(int(round(j*h/H))+1,int(round((j+1)*h/H)));xa,xb=int(round(i*w/W)),max(int(round(i*w/W))+1,int(round((i+1)*w/W)))
            cm=m[ya:yb,xa:xb]
            if cm.sum()<cm.size*.42:continue
            ids=idx[ya:yb,xa:xb][cm];cnt=Counter(ids.tolist());dark=[q for q in cnt if luma[q]<62];dn=sum(cnt[q] for q in dark)
            q=max(dark,key=lambda q:cnt[q]) if dn>=len(ids)*.3 else cnt.most_common(1)[0][0];res[j,i,:3]=pal[q];res[j,i,3]=255
    A=res[:,:,3]>0;o=res.copy()
    for j in range(H):
        for i in range(W):
            if A[j,i] and any(not(0<=j+dj<H and 0<=i+di<W) or not A[j+dj,i+di] for dj,di in((1,0),(-1,0),(0,1),(0,-1))) and (res[j,i,:3]@[.3,.59,.11])>70:o[j,i,:3]=OUT
    t=Image.fromarray(o,'RGBA');t=t.transpose(Image.FLIP_LEFT_RIGHT) if flip else t;tiles.append((k,t.crop(t.getbbox())))
Ht=max(t.height for _,t in tiles);atlas=Image.new('RGBA',(sum(t.width+1 for _,t in tiles),Ht));x=0;meta={}
for k,t in tiles:atlas.paste(t,(x,Ht-t.height));meta[k]=[x,Ht-t.height,t.width,t.height,t.width//2];x+=t.width+1
atlas.save(out+'.png');json.dump(meta,open(out+'.json','w'),separators=(',',':'));print(atlas.size,meta)
