"""밸런스 봇용 하네스: 게임 코드 + 봇을 harness.html(저장소 루트)로 만든다. 사용: python3 tools/mkharness.py"""
import os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES=['src/data.js','src/pixel.js','src/icons.js','src/state.js','src/market.js','src/mine.js','src/forge.js','src/tower.js','src/ui.js','src/equip.js','src/sfx.js','src/tut.js','tools/bot.js']
js=''.join(open(os.path.join(R,f),encoding='utf-8').read()+'\n' for f in FILES)
body=open(os.path.join(R,'src/body.html'),encoding='utf-8').read()
open(os.path.join(R,'harness.html'),'w',encoding='utf-8').write(f"<html><body>{body}<script>{js}\nS=fresh();refreshBonus();</script></body></html>");print('harness.html')
