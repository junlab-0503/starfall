"""게임(앱) 아이콘 세트 만들기 (v35)
원본: art/icon/source.webp (사용자가 준 1254×1254 그림, 둥근 네모 바깥 모서리가 검정)
사용: python3 tools/make_icons.py  →  exports/icon/ 아래에 만든다
  play_store_512.png              플레이 스토어 앱 아이콘(512×512 꽉 찬 정사각형: 스토어가 모서리를 둥글게 깎으므로 모서리 검정을 그림으로 채움)
  capacitor_assets/icon-*.png     @capacitor/assets 용 1024 원본(icon-only · icon-foreground · icon-background)
  android_res/mipmap-*/…          android/app/src/main/res 에 그대로 덮어쓰는 런처 아이콘
     ic_launcher.png(둥근 네모, 모서리 투명) · ic_launcher_round.png(동그라미) · ic_launcher_foreground.png(적응형 앞층)
     mipmap-anydpi-v26/ic_launcher.xml · ic_launcher_round.xml, values/ic_launcher_background.xml(적응형 뒷층 색)
  web_icon.webp                   HTML 아이콘(브라우저 탭 · 180px webp 15KB) — build.py 가 dist 에 넣음
  preview.png                     런처 모양(동그라미 · 둥근 네모 · 물방울)으로 잘렸을 때 미리보기
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(R,'art','icon','source.webp');OUT=os.path.join(R,'exports','icon')
im=Image.open(SRC).convert('RGB');N=im.size[0];a=np.asarray(im).astype(np.float32)

# 1) 바깥 검정: 네 모서리에서 어두운 픽셀만 따라 채워 찾기(그림 속 어두운 선은 건드리지 않음)
dark=Image.fromarray(((a.sum(2)<90)*255).astype(np.uint8)).copy()   # Pillow 12: 배열에서 만든 그림은 읽기 전용이라 복사
for xy in ((0,0),(N-1,0),(0,N-1),(N-1,N-1)):ImageDraw.floodfill(dark,xy,128)
out=(np.asarray(dark)==128)
hole=np.asarray(Image.fromarray((out*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)))>0   # 경계의 어두운 번짐까지

# 2) 꽉 찬 정사각형: 구멍을 피라미드(밀고 당기기) 방식으로 주변 색에서 채우고, 살짝 질감을 남김
def pushpull(img,known):
    if min(img.shape[:2])<=2 or known.all():
        m=img[known].mean(0) if known.any() else np.zeros(3);o=img.copy();o[~known]=m;return o
    h,w=img.shape[:2];h2,w2=(h+1)//2,(w+1)//2
    pi=np.zeros((h2*2,w2*2,3),np.float32);pk=np.zeros((h2*2,w2*2),np.float32);pi[:h,:w]=img*known[...,None];pk[:h,:w]=known
    s=pi.reshape(h2,2,w2,2,3).sum((1,3));c=pk.reshape(h2,2,w2,2).sum((1,3))
    small=np.where(c[...,None]>0,s/np.maximum(c,1)[...,None],0);sk=c>0
    up=pushpull(small,sk).repeat(2,0).repeat(2,1)[:h,:w]
    up=np.asarray(Image.fromarray(np.clip(up,0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)
    o=img.copy();o[~known]=up[~known];return o
full=pushpull(a,~hole)
full=Image.fromarray(np.clip(full,0,255).astype(np.uint8))
# 채운 자리와 원래 그림의 이음매를 부드럽게
soft=Image.fromarray((hole*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
full=Image.composite(full.filter(ImageFilter.GaussianBlur(2)),full,soft)

# 3) 둥근 네모(모서리 투명): 원래 모양 그대로
alpha=Image.fromarray(((~out)*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
rounded=im.convert('RGBA');rounded.putalpha(alpha)

def save(img,rel,size=None):
    p=os.path.join(OUT,rel);os.makedirs(os.path.dirname(p),exist_ok=True)
    if size:img=img.resize((size,size),Image.LANCZOS)
    img.save(p,optimize=True);return img
def circle(img,size,ss=4):
    m=Image.new('L',(size*ss,size*ss),0);ImageDraw.Draw(m).ellipse((0,0,size*ss-1,size*ss-1),fill=255);m=m.resize((size,size),Image.LANCZOS)
    o=img.resize((size,size),Image.LANCZOS).convert('RGBA');o.putalpha(m);return o
# 적응형 앞층: 108dp 캔버스 중 보이는 곳은 가운데 72dp(동그라미면 그 안의 원). 그림을 84dp로 넣어 가장자리 조금만 가려지게(얼굴 · 별 조각 · 숯이 다 보임)
FG_SCALE=84/108
def adaptive_fg(size):
    c=Image.new('RGBA',(size,size),(0,0,0,0));s=round(size*FG_SCALE);o=(size-s)//2
    c.paste(full.resize((s,s),Image.LANCZOS).convert('RGBA'),(o,o));return c
edge=np.asarray(full.resize((64,64),Image.LANCZOS)).astype(int);ring=np.concatenate([edge[0],edge[-1],edge[:,0],edge[:,-1]]);bg=tuple(int(x) for x in ring.mean(0))
BG='#%02x%02x%02x'%bg

save(full,'play_store_512.png',512)
save(full,'capacitor_assets/icon-only.png',1024)
save(adaptive_fg(1024),'capacitor_assets/icon-foreground.png')
save(Image.new('RGB',(1024,1024),bg),'capacitor_assets/icon-background.png')
for d,px in (('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)):
    save(rounded,f'android_res/mipmap-{d}/ic_launcher.png',px)
    save(circle(full,px),f'android_res/mipmap-{d}/ic_launcher_round.png')
    save(adaptive_fg(round(px*108/48)),f'android_res/mipmap-{d}/ic_launcher_foreground.png')
xml='<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/ic_launcher_background"/>\n    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n</adaptive-icon>\n'
for n in ('ic_launcher','ic_launcher_round'):
    p=os.path.join(OUT,'android_res','mipmap-anydpi-v26',n+'.xml');os.makedirs(os.path.dirname(p),exist_ok=True);open(p,'w').write(xml)
p=os.path.join(OUT,'android_res','values','ic_launcher_background.xml');os.makedirs(os.path.dirname(p),exist_ok=True)
open(p,'w').write(f'<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">{BG}</color>\n</resources>\n')
full.resize((180,180),Image.LANCZOS).save(os.path.join(OUT,'web_icon.webp'),quality=88)

# 4) 미리보기: 스토어(20% 둥근 모서리) · 동그라미 · 둥근 네모 · 물방울 런처 모양(적응형 72dp 보이는 곳)
def masked(shape,size=216):
    fg=adaptive_fg(size*108//72);c=Image.new('RGBA',fg.size,bg+(255,));c.alpha_composite(fg);o=(fg.size[0]-size)//2;v=c.crop((o,o,o+size,o+size))
    m=Image.new('L',(size*4,size*4),0);d=ImageDraw.Draw(m);S=size*4-1
    if shape=='circle':d.ellipse((0,0,S,S),fill=255)
    elif shape=='squircle':d.rounded_rectangle((0,0,S,S),radius=int(S*.3),fill=255)
    else:d.rounded_rectangle((0,0,S,S),radius=int(S*.5),fill=255);d.rectangle((S//2,S//2,S,S),fill=255)
    v.putalpha(m.resize((size,size),Image.LANCZOS));return v
store=full.resize((216,216),Image.LANCZOS).convert('RGBA');m=Image.new('L',(864,864),0);ImageDraw.Draw(m).rounded_rectangle((0,0,863,863),radius=int(864*.2),fill=255);store.putalpha(m.resize((216,216),Image.LANCZOS))
pv=Image.new('RGBA',(216*5+20*6,216+40),(236,236,240,255));x=20
for t in (store,masked('circle'),masked('squircle'),masked('drop'),rounded.resize((216,216),Image.LANCZOS)):
    pv.alpha_composite(t,(x,20));x+=236
pv.convert('RGB').save(os.path.join(OUT,'preview.png'))
print('아이콘 세트:',OUT,'· 적응형 뒷층 색',BG)
