"""세공 그림 · 소리 만들기 (v27): 원본 그림을 게임 도트 크기로 줄여 art/craft · art/sfx 에 넣는다.
사용: python3 tools/craft_art.py <메달 격자 그림> <세공기 그림> <효과 팩 폴더> [린 상반신(투명 바탕)]
  메달 격자: 6칸 × 4줄(왼쪽 → 오른쪽 = 강화 단계 +0~1 · 2~3 · 4~5 · 6~7 · 8~9 · 10),
            줄 = 용(금옥) · 학(은옥) · 별자리(별빛옥) · 호랑이(백금옥). 어두운 바탕은 투명으로
  세공기: 가운데 둥근 구멍에 세공품이 들어가는 기계(투명 바탕). 그린 도트 격자(원본 약 10px = 1칸)대로 줄임
  효과 팩: manifest.json + frames/{success,failure,legendary}/*.png(512×512, 메달 가운데 256,308 · 지름 184) + sfx_*.wav
나오는 것: art/craft/{gold,silver,star,plat}{0~5}.png(96×96) · machine.png · icon.png(채굴 화면 단추) · needle.png(세공침)
          · fx_ok/fx_fail/fx_ten.png(프레임을 가로로 이은 한 장, 192×192 칸) · art/sfx/craft_ok/fail/ten.mp3
          · (v28) lin.png: 장비 탭 사람들(tools/shop_art.py)과 같은 방식 — 칸마다 가장 많은 색 · 40색 · 바깥 윤곽, 키 144"""
import sys,os,json,subprocess
from collections import Counter
import numpy as np
from PIL import Image
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(R,'art','craft');SFX=os.path.join(R,'art','sfx')
os.makedirs(OUT,exist_ok=True);os.makedirs(SFX,exist_ok=True)
medals,machine,fx=sys.argv[1:4];linsrc=sys.argv[4] if len(sys.argv)>4 else None

def quant(im,n=64):
    """도트 느낌: 색을 n개로, 반투명 없이(알파 128 기준)"""
    A=np.asarray(im.convert('RGBA')).copy();al=A[...,3]
    rgb=Image.fromarray(A[...,:3]).quantize(colors=n,method=Image.Quantize.MAXCOVERAGE,dither=Image.Dither.NONE).convert('RGB')
    return Image.fromarray(np.dstack([np.asarray(rgb),np.where(al>=128,255,0).astype(np.uint8)]),'RGBA')

# 1) 메달 24장: 칸마다 원판 가운데를 찾아(반짝이 빼고) 그 자리를 가운데로 208px 잘라 96px로
ROWS=['gold','silver','star','plat'];CROP=218
src=Image.open(medals).convert('RGB');a=np.asarray(src).astype(int)
bg=np.median(np.concatenate([a[:6].reshape(-1,3),a[:,:6].reshape(-1,3)]),axis=0)
d=np.abs(a-bg).max(-1);cw,ch=src.width//6,src.height//4
def span(p):
    on=p>p.max()*.3;best=(0,0);s=None
    for i,v in enumerate(list(on)+[False]):
        if v and s is None:s=i
        if not v and s is not None:
            if i-s>best[1]-best[0]:best=(s,i)
            s=None
    return best
for r,k in enumerate(ROWS):
    for c in range(6):
        y0,x0=r*ch,c*cw;blk=d[y0:y0+ch,x0:x0+cw]>60;sx,sy=span(blk.sum(0)),span(blk.sum(1))
        cx,cy=x0+(sx[0]+sx[1])/2,y0+(sy[0]+sy[1])/2
        cr=src.crop((int(cx-CROP/2),int(cy-CROP/2),int(cx+CROP/2),int(cy+CROP/2))).resize((96,96),Image.BOX)
        A=np.asarray(cr).astype(int);alpha=np.where(np.abs(A-bg).max(-1)>22,255,0).astype(np.uint8)
        quant(Image.fromarray(np.dstack([A.astype(np.uint8),alpha]),'RGBA')).save(os.path.join(OUT,f'{k}{c}.png'),optimize=True)
print('메달 24장')

# 2) 세공기: 그린 격자대로(원본 1254px → 126칸) 줄이고 40색, 비슷한 색 잡티만 지우기(리벳 · 하이라이트처럼 대비 큰 점은 그대로), 빈 테두리 자르기
def despeckle(A,passes=3,thr=80):
    A=A.copy();H,W=A.shape[:2]
    for _ in range(passes):
        B=A.copy();key=(A[...,0].astype(int)<<16)|(A[...,1].astype(int)<<8)|A[...,2]
        for y in range(1,H-1):
            for x in range(1,W-1):
                if A[y,x,3]==0:continue
                nb=[(y-1,x),(y+1,x),(y,x-1),(y,x+1)]
                if any(A[j,i,3]==0 for j,i in nb):continue      # 윤곽은 그대로
                ks=[key[j,i] for j,i in nb]
                if key[y,x] in ks:continue
                c,n=Counter(ks).most_common(1)[0]
                if n<2:continue
                j,i=nb[ks.index(c)]
                if np.abs(A[y,x,:3].astype(int)-A[j,i,:3].astype(int)).sum()<=thr:B[y,x]=A[j,i]
        A=B
    return A
m=Image.open(machine).convert('RGBA');s=126/m.width
mm=Image.fromarray(despeckle(np.asarray(quant(m.resize((126,round(m.height*s)),Image.BOX),40))),'RGBA');mm=mm.crop(mm.getbbox());mm.save(os.path.join(OUT,'machine.png'),optimize=True)
# 채굴 화면 단추(다른 단추 그림 크기쯤)
ic=quant(m.resize((72,round(m.height*72/m.width)),Image.BOX));ic=ic.crop(ic.getbbox());ic.save(os.path.join(OUT,'icon.png'),optimize=True)
print('세공기',mm.size,'단추',ic.size)

# 3) 세공침(v28): 세공기 색(놋쇠 · 자줏빛 쇠 · 갈색 윤곽)으로.
#   ① 받침 바로 아래 놋쇠 머리(11×6, 리벳 둘 · 가운데 구멍)를 세공기 그림에 붙임(x 49~59, y 29~34) → 바늘이 기계 안에서 나오는 것처럼
#   ② 움직이는 바늘 5×14: 놋쇠 고리 2줄 · 쇠 바늘대 9줄(빛 한 줄, 3줄마다 끊김) · 쇠 끝 3줄(맨 끝만 빛). 머리 구멍(y 35)에서 내려와 끝이 y 44까지
O=(64,35,29,255);BH,BL,BM,BS,BD=(251,216,125,255),(247,174,68,255),(223,140,54,255),(194,109,47,255),(135,69,42,255)
SH,SL,SM,SD=(240,230,236,255),(196,180,192,255),(138,100,109,255),(68,49,60,255);TL,TH=(250,200,93,255),(255,244,200,255);_=None
head=[[O,BL,BH,BL,BM,BM,BM,BS,BS,BD,O],
      [O,BH,BD,BL,BM,BH,BM,BS,BD,BD,O],
      [O,BM,BS,BM,BM,BM,BM,BM,BS,BD,O],
      [_,O,BS,BS,BS,BS,BS,BD,BD,O,_],
      [_,_,O,O,BD,BD,BD,O,O,_,_],
      [_,_,_,O,SD,SD,SD,O,_,_,_]]
mp=mm.load()
for y,r in enumerate(head):
    for x,c in enumerate(r):
        if c:mp[49+x,29+y]=c
mm.save(os.path.join(OUT,'machine.png'),optimize=True)
rows=[[O,BL,BM,BS,O],[O,BM,BS,BD,O]]+[[O,SH if y%3 else SL,SM,SD,O] for y in range(9)]+[[_,O,SL,O,_],[_,O,SM,O,_],[_,_,TH,_,_]]   # 쇠 끝(금빛 세공품 위에서도 보이게) + 빛나는 점
nd=Image.new('RGBA',(5,len(rows)),(0,0,0,0));p=nd.load()
for y,r in enumerate(rows):
    for x,c in enumerate(r):
        if c:p[x,y]=c
nd.save(os.path.join(OUT,'needle.png'));print('세공침',nd.size)

# 4) 효과: 512 → 192칸(우리 도트 크기). 칸마다 가장 밝고 진한 점을 골라(가는 선이 사라지지 않게), 반투명은 3단계로
man=json.load(open(os.path.join(fx,'manifest.json')));T=192;S=man['canvas'][0];E=[int(round(i*S/T)) for i in range(T+1)]
def pool(f):
    A=np.asarray(Image.open(f).convert('RGBA')).astype(np.int32);sc=A[...,3]*(A[...,0]*3+A[...,1]*6+A[...,2]+1);o=np.zeros((T,T,4),np.uint8)
    for j in range(T):
        for i in range(T):
            b=sc[E[j]:E[j+1],E[i]:E[i+1]];k=np.unravel_index(np.argmax(b),b.shape);o[j,i]=A[E[j]+k[0],E[i]+k[1]]
    al=o[...,3].astype(int);o[...,3]=np.where(al<40,0,np.where(al<110,96,np.where(al<200,170,255)));return Image.fromarray(o,'RGBA')
for mode,key in (('success','ok'),('failure','fail'),('legendary','ten')):
    fr=man['modes'][mode]['frames'];sh=Image.new('RGBA',(T*len(fr),T))
    for i,f in enumerate(fr):sh.paste(pool(os.path.join(fx,f)),(i*T,0))
    sh.save(os.path.join(OUT,f'fx_{key}.png'),optimize=True)
    w=man['modes'][mode]['sfx'];subprocess.run(['ffmpeg','-y','-loglevel','error','-i',os.path.join(fx,w),'-ac','1','-ar','32000','-b:a','64k',os.path.join(SFX,f'craft_{key}.mp3')],check=True)
print('효과 · 소리')

# 5) 린 상반신: 장비 탭 사람들과 같은 도트(칸마다 가장 많은 색, 어두운 윤곽은 30%만 넘어도 우선) · 40색 · 바깥 윤곽 · 키 128
if linsrc:
    OL=(43,27,34);L=Image.open(linsrc).convert('RGBA');a=np.asarray(L).astype(float);mask=a[...,3]>127;H=144;W=round(L.width*H/L.height);rgb=a[...,:3]
    pq=Image.fromarray(rgb[mask].reshape(1,-1,3).astype(np.uint8)).quantize(colors=40,method=Image.Quantize.MEDIANCUT)
    pal=np.array(pq.getpalette()[:120]).reshape(-1,3).astype(float);luma=pal@[.3,.59,.11];idx=((rgb[:,:,None,:]-pal)**2).sum(-1).argmin(-1)
    h,w=mask.shape;o=np.zeros((H,W,4),np.uint8)
    for j in range(H):
        ya,yb=j*h//H,max(j*h//H+1,(j+1)*h//H)
        for i in range(W):
            xa,xb=i*w//W,max(i*w//W+1,(i+1)*w//W);cm=mask[ya:yb,xa:xb]
            if cm.sum()<cm.size*.45:continue
            cnt=Counter(idx[ya:yb,xa:xb][cm].tolist());n=sum(cnt.values());dk=[q for q in cnt if luma[q]<50]
            q=max(dk,key=lambda q:cnt[q]) if dk and sum(cnt[q] for q in dk)>=n*.3 else cnt.most_common(1)[0][0];o[j,i,:3]=pal[q];o[j,i,3]=255
    A=o[...,3]>0;r=o.copy()
    for j in range(H-1):
        for i in range(W):
            if A[j,i] and any(not(0<=j+dj<H and 0<=i+di<W) or not A[j+dj,i+di] for dj,di in((1,0),(-1,0),(0,1),(0,-1))):r[j,i,:3]=OL
    Image.fromarray(r).save(os.path.join(OUT,'lin.png'),optimize=True);print('린',W,H)
