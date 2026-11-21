"""별빛광맥 빌드: src/ 의 파일을 합치고 글꼴을 필요한 글자만 남겨 한 파일로 만든다.
  dist/starfall.html     출시용(플레이 스토어): 개발자 코드 · DEV 단추 · 모의 광고/결제 창 없음
  dist/starfall_dev.html 개발용: 개발자 코드(jun) · [DEV 광맥] · [DEV 리뷰] · 모의 광고/결제 창 포함 (테스트는 이 파일로)
  소스 표시: /*DEV{*/ … /*}DEV*/ · <!--DEV{--> … <!--}DEV--> 는 개발용에만, /*REL{ … }REL*/ 는 출시용에만 들어간다.
필요: pip install fonttools brotli
사용: python3 tools/build.py"""
import base64,subprocess,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(R,'src');FONT=os.path.join(R,'fonts');OUT=os.path.join(R,'dist','starfall.html');TMP=os.path.join(R,'.build');os.makedirs(TMP,exist_ok=True)
FILES=['i18n.js','lang_en.js','lang_zh.js','lang_data.js','lang_pat.js','data.js','pixel.js','icons.js','state.js','market.js','mine.js','forge.js','tower.js','ui.js','equip.js','craft.js','sfx.js','tut.js','hooks.js','main.js']
js=''.join(open(os.path.join(SRC,f),encoding='utf-8').read()+'\n' for f in FILES)
# 문법 검사: 주석이 같은 줄의 코드를 삼키는 실수 등으로 깨진 파일이 있으면 빌드를 멈춘다
for f in FILES:
    r=subprocess.run(['node','--check',os.path.join(SRC,f)],capture_output=True,text=True)
    if r.returncode:raise SystemExit('문법 오류: src/'+f+'\n'+r.stderr[-600:])
# 직접 그린 그림 → ART.<이름> (data URL)
#   art/portraits/<입주자>.png(탭 카드 초상화), art/hero/hero.png(주인공), art/shop/<가게>.png · bg_<가게>.png(장비 탭 사람 · 배경 → ART.shop_…),
#   art/strata/*.webp(채굴 화면 지층 → ART.strata_…), art/scene/*.webp(시작 화면 · 광맥 입구 → ART.scene_…)
#   art/story/p1~p6 · b1~b13 · end (.png/.webp, 스토리 삽화 → ART.story_…; 없으면 글만 나옴)
#   art/craft/ (세공: lin 상반신 · gold|silver|star 0~5 단계 메달 · bench 작업대 · hammer 망치 · 있으면 bg · fx_ok · fx_fail · fx_ten → ART.craft_…)
art={}
for sub_,pre_ in (('portraits',''),('hero',''),('shop','shop_'),('strata','strata_'),('scene','scene_'),('sprites','spr_'),('ui','ui_'),('story','story_'),('craft','craft_')):
    d_=os.path.join(R,'art',sub_)
    if os.path.isdir(d_):
        for f in sorted(os.listdir(d_)):
            if f.endswith(('.png','.webp')):art[pre_+os.path.splitext(f)[0]]=('webp' if f.endswith('.webp') else 'png',base64.b64encode(open(os.path.join(d_,f),'rb').read()).decode())
HM=os.path.join(R,'art','hero','hero_meta.json')
if os.path.exists(HM):js='const HERO_META='+open(HM,encoding='utf-8').read().strip()+';\n'+js
DM=os.path.join(R,'art','strata','dug_meta.json')
if os.path.exists(DM):js='const DUG_META='+open(DM,encoding='utf-8').read().strip()+';\n'+js
# 녹음한 효과음: art/sfx/*.mp3 → SFXD.<이름> (data URL)
sfx={};SD=os.path.join(R,'art','sfx')
if os.path.isdir(SD):
    for f in sorted(os.listdir(SD)):
        if f.endswith('.mp3'):sfx[os.path.splitext(f)[0]]=base64.b64encode(open(os.path.join(SD,f),'rb').read()).decode()
js='const SFXD={'+','.join(f"{k}:'data:audio/mpeg;base64,{v}'" for k,v in sfx.items())+'};\n'+js
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
# 글자 세로 가운데: 픽셀 글꼴은 글자 상자 위쪽에 붙어 그려진다(한글 잉크 위 92~94% · 아래 0%, 상자 위 100% · 아래 10~20%).
# 위·아래 여백의 합(줄 높이)은 그대로 두고 비율만 바꿔 잉크 한가운데 = 상자 한가운데 (버튼 · 줄 글씨가 위로 뜨지 않게)
FONTS=[('Galmuri14','Galmuri14.woff2',(107,13)),('Galmuri11','Galmuri11.woff2',(104.5,12.5)),('Galmuri11B','Galmuri11-Bold.woff2',(104.5,12.5)),('Galmuri9','Galmuri9.woff2',(100,10))]
fonts='\n'.join(f'@font-face{{font-family:"{n}";src:url(data:font/woff2;base64,{sub(f,n+".woff2",kc)}) format("woff2");font-display:swap;ascent-override:{a}%;descent-override:{d}%;line-gap-override:0%}}' for n,f,(a,d) in FONTS)
fonts+=f'\n@font-face{{font-family:"StarTC";src:url(data:font/woff2;base64,{sub("Cubic_11.ttf","StarTC.woff2",tc,"Starfall TC Pixel")}) format("woff2");font-display:swap;ascent-override:87.5%;descent-override:28.5%;line-gap-override:0%}}'
WI=os.path.join(R,'exports','icon','web_icon.webp')   # 게임 아이콘(tools/make_icons.py)
icon=f'<link rel="icon" type="image/webp" sizes="180x180" href="data:image/webp;base64,{base64.b64encode(open(WI,"rb").read()).decode()}">\n' if os.path.exists(WI) else ''
html=f'<meta charset="utf-8">\n<title>별빛광맥</title>\n{icon}<meta name="claude:viewport-fit-sides" content="cover">\n<style>\n/* 글꼴: Galmuri (갈무리) — SIL Open Font License 1.1 / 번체: 俐方體 Cubic 11 (ACh-K, M+ BITMAP FONTS 기반)을 줄여 이름을 바꾼 것 — SIL Open Font License 1.1 (fonts/OFL.txt · fonts/Cubic_11-OFL.txt) */\n{fonts}\n{css}</style>\n{body}\n<script>\n{js}</script>\n'
import re
def variant(t,dev):
    if dev:return re.sub(r'/\*REL\{.*?\}REL\*/','',t,flags=re.S)
    t=re.sub(r'/\*DEV\{\*/.*?/\*\}DEV\*/','',t,flags=re.S);t=re.sub(r'<!--DEV\{-->.*?<!--\}DEV-->','',t,flags=re.S)
    return re.sub(r'/\*REL\{(.*?)\}REL\*/',r'\1',t,flags=re.S)
for dev,name in ((False,'starfall.html'),(True,'starfall_dev.html')):
    out=variant(html,dev)
    if not dev:
        left=[m for m in ('id="devForm"','id="devVein"','id="devReview"','id="adModal"','id="shopModal"','테스트 버전','테스트 구매','개발자 코드','S.dev','DEV{','REL{') if m in out]
        if left:raise SystemExit('출시용에 개발용 흔적이 남음: '+', '.join(left))
    jsf=os.path.join(TMP,name+'.js');open(jsf,'w',encoding='utf-8').write(out[out.index('<script>')+8:out.rindex('</script>')])
    r=subprocess.run(['node','--check',jsf],capture_output=True,text=True)
    if r.returncode:raise SystemExit('문법 오류('+name+')\n'+r.stderr[-600:])
    open(os.path.join(R,'dist',name),'w',encoding='utf-8').write(out);print('dist/'+name,len(out)//1024,'KB')
