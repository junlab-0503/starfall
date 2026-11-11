"""별빛광맥 빌드: src/ 의 파일을 합치고 글꼴을 필요한 글자만 남겨 dist/starfall.html 한 파일로 만든다.
필요: pip install fonttools brotli
사용: python3 tools/build.py"""
import base64,subprocess,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(R,'src');FONT=os.path.join(R,'fonts');OUT=os.path.join(R,'dist','starfall.html');TMP=os.path.join(R,'.build');os.makedirs(TMP,exist_ok=True)
FILES=['data.js','pixel.js','icons.js','state.js','market.js','mine.js','forge.js','tower.js','ui.js','equip.js','sfx.js','tut.js','hooks.js','main.js']
js=''.join(open(os.path.join(SRC,f),encoding='utf-8').read()+'\n' for f in FILES)
# 직접 그린 그림 → ART.<이름> (data URL)
#   art/portraits/<입주자>.png(탭 카드 초상화), art/hero/hero.png(주인공), art/shop/<가게>.png · bg_<가게>.png(장비 탭 사람 · 배경 → ART.shop_…),
#   art/strata/*.webp(채굴 화면 지층 → ART.strata_…), art/scene/*.webp(시작 화면 · 광맥 입구 → ART.scene_…)
art={}
for sub_,pre_ in (('portraits',''),('hero',''),('shop','shop_'),('strata','strata_'),('scene','scene_'),('sprites','spr_'),('ui','ui_')):
    d_=os.path.join(R,'art',sub_)
    if os.path.isdir(d_):
        for f in sorted(os.listdir(d_)):
            if f.endswith(('.png','.webp')):art[pre_+os.path.splitext(f)[0]]=('webp' if f.endswith('.webp') else 'png',base64.b64encode(open(os.path.join(d_,f),'rb').read()).decode())
HM=os.path.join(R,'art','hero','hero_meta.json')
if os.path.exists(HM):js='const HERO_META='+open(HM,encoding='utf-8').read().strip()+';\n'+js
DM=os.path.join(R,'art','strata','dug_meta.json')
if os.path.exists(DM):js='const DUG_META='+open(DM,encoding='utf-8').read().strip()+';\n'+js
js='const ART={'+','.join(f"{k}:'data:image/{t};base64,{v}'" for k,(t,v) in art.items())+'};\n'+js
css=open(os.path.join(SRC,'style.css'),encoding='utf-8').read();body=open(os.path.join(SRC,'body.html'),encoding='utf-8').read()
chars=set(c for c in js+css+body if ord(c)>127)|set(chr(i) for i in range(32,127))|set('…·→←▲▼★')
open(os.path.join(TMP,'chars.txt'),'w',encoding='utf-8').write(''.join(sorted(chars)))
def sub(src,out):
    subprocess.run(['pyftsubset',os.path.join(FONT,src),'--text-file='+os.path.join(TMP,'chars.txt'),'--flavor=woff2','--output-file='+os.path.join(TMP,out)],check=True,capture_output=True)
    return base64.b64encode(open(os.path.join(TMP,out),'rb').read()).decode()
FONTS=[('Galmuri14','Galmuri14.woff2'),('Galmuri11','Galmuri11.woff2'),('Galmuri11B','Galmuri11-Bold.woff2'),('Galmuri9','Galmuri9.woff2')]
fonts='\n'.join(f'@font-face{{font-family:"{n}";src:url(data:font/woff2;base64,{sub(f,n+".woff2")}) format("woff2");font-display:swap}}' for n,f in FONTS)
html=f'<meta charset="utf-8">\n<title>별빛광맥</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<style>\n/* 글꼴: Galmuri (갈무리) — SIL Open Font License 1.1 */\n{fonts}\n{css}</style>\n{body}\n<script>\n{js}</script>\n'
open(OUT,'w',encoding='utf-8').write(html);print('dist/starfall.html',len(html)//1024,'KB')
