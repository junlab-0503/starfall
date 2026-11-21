"""세공품 그림(4종 × 6단계) 다시 뽑기 (v35)
원본: art/source/medals_src.webp (1536×1024, 칸 256px: 줄 = 금옥(용) · 은옥(학) · 별빛옥(별자리) · 백금옥(호랑이), 칸 = 단계 0~5)
      art/source/medals_centers.json (칸마다 세공품 가운데 x · y · 너비 · 높이)
예전(v27)엔 218px 틀을 96px로 줄여 넣어 크게 볼 때 도트가 깨졌음 → 같은 218px 틀을 줄이지 않고 1:1로 잘라 넣는다(세공기 속 크기 · 위치는 그대로)
배경(24,13,14)은 가장자리에서 이어진 곳만 투명하게(그림 속 어두운 선은 그대로)
사용: python3 tools/craft_medals.py → art/craft/{gold,silver,star,plat}{0..5}.webp"""
import os,json
import numpy as np
from PIL import Image,ImageDraw
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=Image.open(os.path.join(R,'art','source','medals_src.webp')).convert('RGB');C=json.load(open(os.path.join(R,'art','source','medals_centers.json')))
BOX=218;BG=np.array([24,13,14])
for row,kind in enumerate(['gold','silver','star','plat']):
    for st in range(6):
        cx,cy=C[row][st][:2];x0,y0=round(cx-BOX/2),round(cy-BOX/2)
        a=np.asarray(src.crop((x0,y0,x0+BOX,y0+BOX))).astype(int)
        near=(np.abs(a-BG).max(2)<=14)
        m=Image.fromarray((near*255).astype(np.uint8)).copy()   # Pillow 12: 배열에서 만든 그림은 읽기 전용
        for x in range(0,BOX,7):
            for xy in ((x,0),(x,BOX-1),(0,x),(BOX-1,x)):
                if m.getpixel(xy)==255:ImageDraw.floodfill(m,xy,128)
        bg=np.asarray(m)==128
        out=np.dstack([a.astype(np.uint8),np.where(bg,0,255).astype(np.uint8)])
        p=os.path.join(R,'art','craft',f'{kind}{st}.webp');Image.fromarray(out,'RGBA').save(p,quality=92,alpha_quality=100,method=6)   # 손실 압축(가장자리 투명도는 무손실) 1장 약 17KB
        old=os.path.join(R,'art','craft',f'{kind}{st}.png')
        if os.path.exists(old):os.remove(old)
print('세공품 24장 →',BOX,'px')
