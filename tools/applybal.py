"""보정한 밸런스 값(tools/calibrate/bal.json)을 src/data.js 의 BAL 에 반영. 사용: python3 tools/applybal.py"""
import json,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
b=json.load(open(os.path.join(R,'tools/calibrate/bal.json')));p=os.path.join(R,'src/data.js');s=open(p,encoding='utf-8').read()
i=s.index('let BAL=');j=s.index(';',s.index('}',i))+1
open(p,'w',encoding='utf-8').write(s[:i]+'let BAL='+json.dumps(b,separators=(',',':'))+';'+s[j:]);print('applied')
