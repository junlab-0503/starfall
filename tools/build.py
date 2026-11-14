"""별빛광맥 빌드: src/ 의 파일을 합치고 글꼴을 필요한 글자만 남겨 dist/starfall.html 한 파일로 만든다.
필요: pip install fonttools brotli
사용: python3 tools/build.py"""
import base64,subprocess,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(R,'src');FONT=os.path.join(R,'fonts');OUT=os.path.join(R,'dist','starfall.html');TMP=os.path.join(R,'.build');os.makedirs(TMP,exist_ok=True)
FILES=['i18n.js','lang_en.js','lang_zh.js','lang_data.js','lang_pat.js','data.js','pixel.js','icons.js','state.js','market.js','mine.js','forge.js','tower.js','ui.js','equip.js','sfx.js','tut.js','hooks.js','main.js']
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
# 버그 제보 받는 주소: 저장소 맨 위 bug_mail.txt(한 줄)
BM=os.path.join(R,'bug_mail.txt');js='const BUG_MAIL='+repr(open(BM,encoding='utf-8').read().strip() if os.path.exists(BM) else '')+';\n'+js
js='const ART={'+','.join(f"{k}:'data:image/{t};base64,{v}'" for k,(t,v) in art.items())+'};\n'+js
css=open(os.path.join(SRC,'style.css'),encoding='utf-8').read();body=open(os.path.join(SRC,'body.html'),encoding='utf-8').read()
allc=set(c for c in js+css+body if ord(c)>127)|set(chr(i) for i in range(32,127))|set('…·→←▲▼★')
# 한자 · 전각 문장부호는 번체(대만) 언어팩에서만 쓰므로 갈무리에서는 빼고, 번체용 글꼴(俐方體 Cubic 11)에만 넣는다
isTC=lambda c:0x2E80<=ord(c)<=0x9FFF or 0xF900<=ord(c)<=0xFAFF or 0xFE30<=ord(c)<=0xFE4F or 0xFF00<=ord(c)<=0xFFEF
isKO=lambda c:0x1100<=ord(c)<=0x11FF or 0x3130<=ord(c)<=0x318F or 0xAC00<=ord(c)<=0xD7A3
def sub(src,out,chars,rename=None):
    cf=os.path.join(TMP,out+'.chars.txt');open(cf,'w',encoding='utf-8').write(''.join(sorted(chars)))
    subprocess.run(['pyftsubset',os.path.join(FONT,src),'--text-file='+cf,'--flavor=woff2','--name-IDs=0,13,14','--output-file='+os.path.join(TMP,out)],check=True,capture_output=True)
    if rename:   # OFL: 고친(줄인) 글꼴은 원래 이름(Cubic · 俐方體)을 쓰지 않는다. 저작권 · 라이선스 표기(이름표 0 · 13 · 14)는 그대로 둠
        from fontTools.ttLib import TTFont
        t=TTFont(os.path.join(TMP,out))
        for nid,v in ((1,rename),(2,'Regular'),(4,rename),(6,rename.replace(' ',''))):t['name'].setName(v,nid,3,1,0x409)
        t.flavor='woff2';t.save(os.path.join(TMP,out))
    return base64.b64encode(open(os.path.join(TMP,out),'rb').read()).decode()
kc=set(c for c in allc if not isTC(c));tc=set(c for c in allc if not isKO(c))
FONTS=[('Galmuri14','Galmuri14.woff2'),('Galmuri11','Galmuri11.woff2'),('Galmuri11B','Galmuri11-Bold.woff2'),('Galmuri9','Galmuri9.woff2')]
fonts='\n'.join(f'@font-face{{font-family:"{n}";src:url(data:font/woff2;base64,{sub(f,n+".woff2",kc)}) format("woff2");font-display:swap}}' for n,f in FONTS)
fonts+=f'\n@font-face{{font-family:"StarTC";src:url(data:font/woff2;base64,{sub("Cubic_11.ttf","StarTC.woff2",tc,"Starfall TC Pixel")}) format("woff2");font-display:swap}}'
html=f'<meta charset="utf-8">\n<title>별빛광맥</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<style>\n/* 글꼴: Galmuri (갈무리) — SIL Open Font License 1.1 / 번체: 俐方體 Cubic 11 (ACh-K, M+ BITMAP FONTS 기반)을 줄여 이름을 바꾼 것 — SIL Open Font License 1.1 (fonts/OFL.txt · fonts/Cubic_11-OFL.txt) */\n{fonts}\n{css}</style>\n{body}\n<script>\n{js}</script>\n'
open(OUT,'w',encoding='utf-8').write(html);print('dist/starfall.html',len(html)//1024,'KB')
