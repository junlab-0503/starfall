"""exports/procedural 안 PNG마다 4배 확대본(_x4)을 만들고, 광물 아이콘을 뺀 나머지를 한 장(_전체_모음.png)에 모은다.
사용: python3 tools/export_sheet.py exports/procedural"""
import os,sys
from PIL import Image,ImageDraw,ImageFont
R=sys.argv[1];FONT='fonts/Galmuri11.woff2'
items=[]
for d,ds,fs in os.walk(R):
    ds.sort()
    if '_x4' in d:continue
    for f in sorted(fs):
        if not f.endswith('.png') or f.startswith('_'):continue
        src=os.path.join(d,f);rel=os.path.relpath(src,R);im=Image.open(src).convert('RGBA')
        dst=os.path.join(R,'_x4',rel);os.makedirs(os.path.dirname(dst),exist_ok=True)
        im.resize((im.width*4,im.height*4),Image.NEAREST).save(dst)
        if not rel.startswith('7_'):items.append((rel,im))
# 모음: 그림을 2배로, 아래에 파일 이름
try:font=ImageFont.truetype('/tmp/galmuri11.ttf',12)
except Exception:font=ImageFont.load_default()
W=1200;pad=10;x=pad;y=pad;rowh=0;cells=[]
for rel,im in items:
    s=2 if max(im.size)<=200 else 1;w,h=im.width*s,im.height*s;cw=max(w,150)+pad
    if x+cw>W:x=pad;y+=rowh+pad;rowh=0
    cells.append((x,y,rel,im.resize((w,h),Image.NEAREST)));x+=cw;rowh=max(rowh,h+18)
H=y+rowh+pad;sheet=Image.new('RGBA',(W,H),(36,26,18,255));dr=ImageDraw.Draw(sheet)
for x,y,rel,im in cells:
    sheet.alpha_composite(im,(x,y));dr.text((x,y+im.height+2),os.path.basename(rel).replace('.png','')[:22],fill=(239,226,200,255),font=font)
sheet.save(os.path.join(R,'_전체_모음.png'));print(len(items),'+x4',W,H)
