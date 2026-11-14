"""언어팩 데이터 사전 만들기: lang/ko.json(원문, tools/lang_dump.js가 게임에서 뽑음) + lang/<언어>.txt(같은 순서로 한 줄씩) → src/lang_data.js
번역 파일: '## 구역' 아래에 그 구역 문장을 원문과 같은 순서로 한 줄에 하나씩. 줄바꿈은 \\n 으로 적는다. 줄 수가 원문과 다르면 멈춘다.
화면 글자(단추 · 안내문 · 틀)는 src/lang_en.js · src/lang_zh.js 에 직접 적는다.
사용: python3 tools/lang_build.py"""
import json,os,sys
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KO=json.load(open(os.path.join(R,'lang','ko.json'),encoding='utf-8'))
out=['/* 언어팩 데이터 사전 (tools/lang_build.py가 만듦 — 직접 고치지 말고 lang/*.txt 를 고칠 것) */']
for lang in ('en','zh'):
    p=os.path.join(R,'lang',lang+'.txt')
    if not os.path.exists(p):continue
    sec={};cur=None
    for line in open(p,encoding='utf-8').read().split('\n'):
        if line.startswith('## '):cur=line[3:].strip();sec[cur]=[]
        elif cur is not None and line.strip()!='':sec[cur].append(line.replace('\\n','\n'))
    d={}
    for k,ko in KO.items():
        tr=sec.get(k)
        if tr is None:sys.exit(f'{lang}: 구역 {k} 없음')
        if len(tr)!=len(ko):sys.exit(f'{lang}: 구역 {k} 줄 수가 다름 (원문 {len(ko)}, 번역 {len(tr)})')
        for a,b in zip(ko,tr):
            if a in d and d[a]!=b:print(f'  {lang}: 같은 원문에 다른 번역 — "{a}": "{d[a]}" / "{b}" (사전엔 앞의 것, 사람 이름 자리에선 nm을 씀)');continue
            d[a]=b
    # 사람 이름(입주자 · 소문 출처)은 따로: 광물 이름과 같은 글자(강철 = 사람 이름이자 광물)를 자리로 구분
    nm={a:b for k in ('names','src') for a,b in zip(KO[k],sec[k])}
    out.append(f'Object.assign(LANGS.{lang}.d,{json.dumps(d,ensure_ascii=False,separators=(",",":"))});')
    out.append(f'LANGS.{lang}.nm={json.dumps(nm,ensure_ascii=False,separators=(",",":"))};')
    print(lang,len(d),'문장')
open(os.path.join(R,'src','lang_data.js'),'w',encoding='utf-8').write('\n'.join(out)+'\n')
