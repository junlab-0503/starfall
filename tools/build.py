"""별빛광맥 빌드: src/ 의 파일을 합치고 글꼴을 필요한 글자만 남겨 dist/starfall.html 한 파일로 만든다.
필요: pip install fonttools brotli
사용: python3 tools/build.py"""
import base64,subprocess,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(R,'src');FONT=os.path.join(R,'fonts');OUT=os.path.join(R,'dist','starfall.html');TMP=os.path.join(R,'.build');os.makedirs(TMP,exist_ok=True)
FILES=['data.js','pixel.js','icons.js','state.js','market.js','mine.js','forge.js','tower.js','ui.js','equip.js','sfx.js','tut.js','hooks.js','main.js']
js=''.join(open(os.path.join(SRC,f),encoding='utf-8').read()+'\n' for f in FILES)
# 직접 그린 그림: art/portraits/<입주자>.png, art/items/<광물 id>.png → ART.<이름> (data URL)
art={}
for sub_ in ('portraits','items'):
    d_=os.path.join(R,'art',sub_)
    if os.path.isdir(d_):
        for f in sorted(os.listdir(d_)):
            if f.endswith('.png'):art[os.path.splitext(f)[0]]=base64.b64encode(open(os.path.join(d_,f),'rb').read()).decode()
js='const ART={'+','.join(f"{k}:'data:image/png;base64,{v}'" for k,v in art.items())+'};\n'+js
css=open(os.path.join(SRC,'style.css'),encoding='utf-8').read();body=open(os.path.join(SRC,'body.html'),encoding='utf-8').read()
chars=set(c for c in js+css+body if ord(c)>127)|set(chr(i) for i in range(32,127))|set('…·→←▲▼★')
open(os.path.join(TMP,'chars.txt'),'w',encoding='utf-8').write(''.join(sorted(chars)))
def sub(src,out):
    subprocess.run(['pyftsubset',os.path.join(FONT,src),'--text-file='+os.path.join(TMP,'chars.txt'),'--flavor=woff2','--output-file='+os.path.join(TMP,out)],check=True,capture_output=True)
    return base64.b64encode(open(os.path.join(TMP,out),'rb').read()).decode()
fonts=f'@font-face{{font-family:"Galmuri14";src:url(data:font/woff2;base64,{sub("Galmuri14.woff2","g14.woff2")}) format("woff2");font-display:swap}}\n@font-face{{font-family:"Galmuri11B";src:url(data:font/woff2;base64,{sub("Galmuri11-Bold.woff2","g11b.woff2")}) format("woff2");font-display:swap}}'
html=f'<meta charset="utf-8">\n<title>별빛광맥</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<style>\n/* 글꼴: Galmuri (갈무리) — SIL Open Font License 1.1 */\n{fonts}\n{css}</style>\n{body}\n<script>\n{js}</script>\n'
open(OUT,'w',encoding='utf-8').write(html);print('dist/starfall.html',len(html)//1024,'KB')
