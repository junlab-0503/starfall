"""세공 그림 · 소리 만들기 (v27): 원본 그림을 게임 도트 크기로 줄여 art/craft · art/sfx 에 넣는다.
사용: python3 tools/craft_art.py <메달 격자 그림> <세공기 그림> <효과 팩 폴더>
  메달 격자: 6칸 × 4줄(왼쪽 → 오른쪽 = 강화 단계 +0~1 · 2~3 · 4~5 · 6~7 · 8~9 · 10),
            줄 = 용(금옥) · 학(은옥) · 별자리(별빛옥) · 호랑이(백금옥). 어두운 바탕은 투명으로
  세공기: 가운데 둥근 구멍에 세공품이 들어가는 기계(투명 바탕). 그린 도트 격자(원본 약 10px = 1칸)대로 줄임
  효과 팩: manifest.json + frames/{success,failure,legendary}/*.png(512×512, 메달 가운데 256,308 · 지름 184) + sfx_*.wav
나오는 것: art/craft/{gold,silver,star,plat}{0~5}.png(96×96) · machine.png · icon.png(채굴 화면 단추) · needle.png(세공침)
          · fx_ok/fx_fail/fx_ten.png(프레임을 가로로 이은 한 장, 192×192 칸) · art/sfx/craft_ok/fail/ten.mp3"""
import sys,os,json,subprocess
import numpy as np
from PIL import Image
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(R,'art','craft');SFX=os.path.join(R,'art','sfx')
os.makedirs(OUT,exist_ok=True);os.makedirs(SFX,exist_ok=True)
medals,machine,fx=sys.argv[1:4]

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

# 2) 세공기: 그린 격자대로(원본 1254px → 126칸) 줄이고 64색, 빈 테두리 자르기
m=Image.open(machine).convert('RGBA');s=126/m.width
mm=quant(m.resize((126,round(m.height*s)),Image.BOX));mm=mm.crop(mm.getbbox());mm.save(os.path.join(OUT,'machine.png'),optimize=True)
# 채굴 화면 단추(다른 단추 그림 크기쯤)
ic=quant(m.resize((72,round(m.height*72/m.width)),Image.BOX));ic=ic.crop(ic.getbbox());ic.save(os.path.join(OUT,'icon.png'),optimize=True)
print('세공기',mm.size,'단추',ic.size)

# 3) 세공침: 세공기와 같은 도트 크기로 직접 그림(5×20). 위는 놋쇠 고리, 가운데 쇠막대, 끝은 뾰족한 금빛
O=(43,27,34,255);BL,BM,BD=(255,214,120,255),(214,152,58,255),(128,80,34,255);SL,SM,SD=(222,216,230,255),(160,150,176,255),(92,80,104,255);TIP=(255,240,180,255)
nd=Image.new('RGBA',(5,20),(0,0,0,0));p=nd.load()
for y in range(20):
    if y<4:row=[O,BL,BM,BD,O]            # 놋쇠 고리
    elif y==4:row=[O,O,O,O,O]
    elif y<16:row=[None,O,SL if y%5 else SM,SD,O]  # 쇠막대(빛 반사 한 줄)
    elif y<18:row=[None,O,SL,O,None]
    elif y==18:row=[None,None,TIP,None,None]
    else:row=[None,None,BL,None,None]
    for x,c in enumerate(row):
        if c:p[x,y]=c
nd.save(os.path.join(OUT,'needle.png'))

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
