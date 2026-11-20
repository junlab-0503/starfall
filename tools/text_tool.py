"""대사 · 화면 문구 뽑기 / 다시 넣기 (v30)

  뽑기:     python3 tools/text_tool.py export      → docs/text/대사.xlsx · docs/text/화면문구.xlsx
  다시 넣기: python3 tools/text_tool.py import [고친 파일.xlsx ...]   (기본: 위 두 파일)

- 게임 코드(src/*.js, src/body.html)에서 한글이 든 문자열을 모두 찾는다. 주석과 번역 파일(lang_*.js · i18n.js)은 뺀다.
- 대사 파일: 이야기(프롤로그 · 에필로그 · 일지 · 지층 사건) · 주민(소개 · 한마디 · 가게 인사 · 감사) · 튜토리얼 · 린 · 소문.
  화면 문구 파일: 그 밖의 단추 · 안내 · 알림 · 설명 · 광물/지층 이름 등.
- 엑셀의 [고칠 문구] 칸에 새 문장을 적고 저장 → import 하면 코드의 그 문장(똑같은 문장이 여러 곳이면 모두)이 바뀐다.
  {1} {2} 같은 자리는 숫자 · 이름이 들어가는 곳이라 그대로 둬야 한다(순서는 바꿔도 됨). <태그>도 그대로.
- 바꾼 줄은 docs/text/번역할_줄.tsv 에 쌓인다(영어 · 번체 중국어를 새로 번역할 목록). 번역 사전은 옛 번역을 새 열쇠로 옮겨 두어
  번역 전까지도 화면이 비지 않는다.
"""
import os,re,sys,json,hashlib
from collections import OrderedDict
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=os.path.join(R,'src');OUT=os.path.join(R,'docs','text')
SKIP={'lang_en.js','lang_zh.js','lang_data.js','lang_pat.js','i18n.js'}
HANGUL=re.compile('[가-힣]')
IDENT=re.compile(r'[A-Za-z_$][\w$]*')

# ───────── 자바스크립트 문자열 찾기(주석 · 정규식 건너뜀, 템플릿 안 ${...}도 따라 들어감) ─────────
def scan_js(src):
    """[(시작, 끝, 종류("'",'"','`'), 내용, 경로)] — 경로: 이 문자열을 감싼 열쇠 · 변수 · 함수 이름들"""
    out=[];i=0;n=len(src);stack=[]   # stack: (여는 글자, 이름표)
    pend=None;last_sig=''              # pend: 바로 앞 '이름:' / '이름=' / 'function 이름' → 다음 괄호 · 문자열의 이름표
    def path():return [s[1] for s in stack if s[1] and not s[1].startswith('fn:')]
    def read_str(i,q):
        j=i+1
        while j<n:
            c=src[j]
            if c=='\\':j+=2;continue
            if c==q:return j+1
            j+=1
        return n
    def read_tpl(i):
        """템플릿 문자열 i(`)부터. 끝 위치와, ${...} 안에서 찾은 문자열들"""
        j=i+1;inner=[]
        while j<n:
            c=src[j]
            if c=='\\':j+=2;continue
            if c=='`':return j+1,inner
            if c=='$' and j+1<n and src[j+1]=='{':
                k=j+2;depth=1
                while k<n and depth:
                    d=src[k]
                    if d in '\'"':e=read_str(k,d);inner.append((k,e,d));k=e;continue
                    if d=='`':e,inn=read_tpl(k);inner.append((k,e,'`'));inner.extend(inn);k=e;continue
                    if d=='{':depth+=1
                    elif d=='}':depth-=1
                    k+=1
                j=k;continue
            j+=1
        return n,inner
    while i<n:
        c=src[i]
        if c=='/' and i+1<n and src[i+1]=='/':
            j=src.find('\n',i);i=n if j<0 else j;continue
        if c=='/' and i+1<n and src[i+1]=='*':
            j=src.find('*/',i+2);i=n if j<0 else j+2;continue
        if c=='/' and (last_sig=='' or last_sig in '(,=:[!&|?{};+-*%<>~^') :
            # 정규식
            j=i+1;cls=False
            while j<n:
                d=src[j]
                if d=='\\':j+=2;continue
                if d=='[':cls=True
                elif d==']':cls=False
                elif d=='/' and not cls:break
                elif d=='\n':break
                j+=1
            i=j+1
            while i<n and src[i].isalpha():i+=1
            last_sig='/';continue
        if c in '\'"`':
            if c=='`':e,inner=read_tpl(i)
            else:e,inner=read_str(i,c),[]
            # 객체 열쇠('셈': ...)면 이름표로만 쓴다
            k=e
            while k<n and src[k] in ' \t\r\n':k+=1
            prev=last_sig
            if c!='`' and k<n and src[k]==':' and prev in '{,':
                pend=src[i+1:e-1];i=e;last_sig="'";continue
            p=path()+([pend] if pend else [])
            out.append((i,e,c,src[i+1:e-1],p))
            for (a,b,q) in inner:out.append((a,b,q,src[a+1:b-1],p+['${}']))
            pend=None;i=e;last_sig="'";continue
        if c in '([{':
            stack.append((c,pend));pend=None;i+=1;last_sig=c;continue
        if c in ')]}':
            if stack:
                o=stack.pop()
                if o[0]=='(' and o[1] and o[1].startswith('fn:'):pend=o[1][3:]   # function 이름(…) { ← 몸통에 이름표
            i+=1;last_sig=c;continue
        m=IDENT.match(src,i)
        if m and (i==0 or not (src[i-1].isalnum() or src[i-1] in '_$')):
            w=m.group(0);j=m.end()
            while j<n and src[j] in ' \t':j+=1
            if w=='function':
                mm=IDENT.match(src,j)
                if mm:pend='fn:'+mm.group(0);i=mm.end();last_sig='a';continue
            if j<n and src[j]==':' and last_sig in '{,(':pend=w
            elif j<n and src[j]=='=' and (j+1>=n or src[j+1] not in '=>'):pend=w
            elif j+1<n and src[j:j+2]=='=>' :pass
            elif w in ('return','typeof','case','in','of','new','else'):pass
            else:
                # 이름 뒤에 바로 괄호가 아니면(값으로 쓰인 이름) 이름표 버림
                if not (j<n and src[j] in '([{'):pend=None if pend!=w else pend
            i=m.end();last_sig='a' if w not in ('return','typeof','case') else '(';continue
        if c==';':pend=None
        if not c.isspace():last_sig=c
        i+=1
    return out

# ───────── 템플릿 ${...} ↔ {1} {2} ─────────
def tpl_to_slots(body):
    """`안녕 ${a}님` → ('안녕 {1}님', ['a'])"""
    s=[];out='';i=0;n=len(body)
    while i<n:
        c=body[i]
        if c=='\\' and i+1<n:out+=body[i:i+2];i+=2;continue
        if c=='$' and i+1<n and body[i+1]=='{':
            k=i+2;depth=1
            while k<n and depth:
                d=body[k]
                if d in '\'"`':
                    q=d;k+=1
                    while k<n and body[k]!=q:
                        if body[k]=='\\':k+=1
                        k+=1
                elif d=='{':depth+=1
                elif d=='}':depth-=1
                k+=1
            s.append(body[i+2:k-1]);out+='{%d}'%len(s);i=k;continue
        out+=c;i+=1
    return out,s
def slots_to_tpl(txt,slots):
    def f(m):
        k=int(m.group(1))
        if not 1<=k<=len(slots):raise ValueError(f'자리 {{{k}}} 가 원래 문장에 없음')
        return '${'+slots[k-1]+'}'
    return re.sub(r'\{(\d+)\}',f,txt)

# ───────── 분류 ─────────
FILE_AREA={'mine.js':'채굴 화면','market.js':'장터 · 소문','forge.js':'제련','tower.js':'탑','equip.js':'장비 · 가게','craft.js':'세공',
  'ui.js':'공통 화면 · 창고 · 도감','state.js':'공통 계산','data.js':'광물 · 지층 · 주민 데이터','main.js':'시작 · 설정 · 광고','tut.js':'튜토리얼',
  'hooks.js':'공통','sfx.js':'소리 · 진동','pixel.js':'그림','icons.js':'그림','body.html':'화면 틀(HTML)'}
def classify(fn,path,text):
    P=set(path)
    def has(*k):return any(x in P for x in k)
    if has('PROLOGUE'):return ('대사','이야기 · 프롤로그','')
    if has('ENDING'):return ('대사','이야기 · 에필로그','')
    if has('JOURNAL'):return ('대사','이야기 · 할아버지의 일지','')
    if has('LAYER_EVENT'):return ('대사','이야기 · 지층 사건','')
    if has('SECTIONS'):
        who=next((p for p in path if p not in ('SECTIONS','t','says','line','d','${}') and HANGUL.search(p or '')),'')
        if has('says'):return ('대사','주민 · 한마디(입주자 칸)','')
        if has('line'):return ('대사','주민 · 입주 인사','')
        if path and path[-1]=='d':return ('대사','주민 · 소개','')
    if has('NPC_TUT'):
        who=next((p for p in path if HANGUL.search(p or '')),'');return ('대사','튜토리얼 · 주민 안내',who)
    if has('TUT'):return ('대사','튜토리얼 · 이장 할머니','이장 할머니')
    if has('SHOPS') and has('lines'):return ('대사','가게 · 인사(장비 탭)','')
    if has('THANKS'):
        who=next((p for p in path if HANGUL.search(p or '')),'');return ('대사','가게 · 강화 고마움',who)
    if has('LIN','linIntro'):return ('대사','린 · 세공사','린')
    if has('SOURCES','rumorText'):return ('대사','소문 문장','')
    if fn=='tower.js' and ('하늘에 닿았다' in text or '탑 꼭대기에' in text):return ('대사','이야기 · 탑','')
    return ('문구',FILE_AREA.get(fn,fn),'')

def who_of(path):
    return next((p for p in reversed(path) if p and HANGUL.search(p)),'')

TAG=re.compile(r'(<[^<>]*>)')
def pieces(shown):
    """HTML 틀이 섞인 문장은 태그 사이 글자만(한글 있는 것) 조각으로. [(조각 번호, 앞뒤 공백 뺀 글자)]"""
    if '<' not in shown or not TAG.search(shown):return [(None,shown)]
    parts=TAG.split(shown);o=[]
    for k,pt in enumerate(parts):
        if k%2==0 and HANGUL.search(re.sub(r'\{\d+\}','',pt)):o.append((k,pt.strip()))
    return o
def collect():
    """한 줄(row) = 보이는 글자 하나. 같은 글자(자리 뜻까지 같으면)는 여러 곳(occ)을 한 줄로"""
    rows=OrderedDict()
    def add(text,slots,kind,cat,who,ctx,occ,loc):
        key=(text,tuple(slots))
        r=rows.get(key)
        if not r:r=rows[key]={'text':text,'slots':slots,'kind':kind,'cat':cat,'who':who,'ctx':ctx,'occ':[],'loc':[]}
        elif kind=='대사' and r['kind']!='대사':r.update(kind=kind,cat=cat,who=who)
        r['occ'].append(occ)
        if loc not in r['loc']:r['loc'].append(loc)
    files=sorted(f for f in os.listdir(SRC) if f.endswith('.js') and f not in SKIP)
    for fn in files:
        src=open(os.path.join(SRC,fn),encoding='utf-8').read()
        import bisect
        nl=[0]+[m.end() for m in re.finditer('\n',src)]
        for (a,b,q,body,path) in scan_js(src):
            if not HANGUL.search(body):continue
            if q=='`':shown,slots=tpl_to_slots(body)
            else:shown,slots=body,[]
            if not HANGUL.search(re.sub(r'\{\d+\}','',shown)):continue   # ${...} 안에만 한글 → 안쪽 문자열이 따로 잡힘
            kind,cat,who=classify(fn,path,body)
            if not who and kind=='대사':who=who_of(path)
            ctx='.'.join(p for p in path if p and p!='${}')[-60:]
            for (k,txt) in pieces(shown):
                used=[sl for i,sl in enumerate(slots) if '{%d}'%(i+1) in txt]
                add(txt,slots if k is None else slots,kind,cat,who,ctx,{'f':fn,'q':q,'raw':body,'seg':k,'ctx':ctx},f'{fn}:{bisect.bisect_right(nl,a)}')
    # HTML: 글자 마디 · aria-label · placeholder · title · alt
    import bisect
    hb=open(os.path.join(SRC,'body.html'),encoding='utf-8').read();hl=[0]+[m.end() for m in re.finditer('\n',hb)]
    for m in re.finditer(r'(?:aria-label|placeholder|title|alt)="([^"]*[가-힣][^"]*)"|>([^<>]*[가-힣][^<>]*)<',hb):
        t=(m.group(1) or m.group(2)).strip()
        if t:add(t,[],'문구',FILE_AREA['body.html'],'','aria-label' if m.group(1) else '글자',{'f':'body.html','q':'html','raw':t,'seg':None},f'body.html:{bisect.bisect_right(hl,m.start())}')
    # 고치면 안 되는 것: 조사 · 숫자 단위(코드가 글자를 조합), 사람 이름(저장 데이터 · 코드 열쇠와 연결)
    out=list(rows.values())
    names={r['text'] for r in out if any(re.search(r'\.(name|who)$',o.get('ctx') or '') for o in r['occ'])}|{'린','이장 할머니'}
    for r in out:
        if r['text'] in names:r['lock']='사람 이름'
        elif r['text'] in GRAMMAR and all(o['f']=='state.js' or o['f']=='forge.js' or o['f']=='tower.js' for o in r['occ']) and len(r['text'])<=2:r['lock']='조사 · 단위'
    return out
GRAMMAR={'이','가','을','를','은','는','을를','은는','이가','와','과','와과','으로','로','만','억','조','경'}

def rid(r):return hashlib.md5((r['text']+'\x00'+'\x01'.join(r['slots'])).encode()).hexdigest()[:8]

# ───────── 엑셀 ─────────
HEAD=['번호','분류','말하는 사람 · 쓰임','지금 문구','고칠 문구 (비워 두면 그대로)','자리 {n} 뜻','위치(파일:줄)','열쇠']
def write_xlsx(path,rows,title,guide,locked=None):
    from openpyxl import Workbook
    from openpyxl.styles import Font,Alignment,PatternFill
    wb=Workbook();ws=wb.active;ws.title=title
    ws.append([guide]);ws.merge_cells(start_row=1,start_column=1,end_row=1,end_column=len(HEAD));ws['A1'].alignment=Alignment(wrap_text=True,vertical='top');ws.row_dimensions[1].height=96
    ws.append(HEAD)
    for c in ws[2]:c.font=Font(bold=True);c.fill=PatternFill('solid',fgColor='F3E2C2')
    for k,r in enumerate(rows,1):
        ws.append([k,r['cat'],r['who'] or r['ctx'],r['text'],'',' · '.join(f'{{{i+1}}} = {s}' for i,s in enumerate(r['slots'])),', '.join(r['loc'][:6])+(' …' if len(r['loc'])>6 else ''),rid(r)])
    for col,w in zip('ABCDEFGH',[6,22,18,60,60,30,22,10]):ws.column_dimensions[col].width=w
    for row in ws.iter_rows(min_row=3):
        for c in row:c.alignment=Alignment(wrap_text=True,vertical='top')
        row[4].fill=PatternFill('solid',fgColor='FFF8E1')
    ws.freeze_panes='E3'
    if locked:
        w2=wb.create_sheet('고치지 않는 낱말')
        w2.append(['사람 이름과 조사 · 단위는 저장 데이터 · 계산과 묶여 있어서 이 파일로는 바꾸지 않아요. 이름을 바꾸고 싶으면 따로 말씀해 주세요(저장 호환까지 같이 고쳐야 해요).'])
        w2.append(['낱말','까닭','쓰인 곳'])
        for c in w2[2]:c.font=Font(bold=True)
        for r in locked:w2.append([r['text'],r['lock'],', '.join(r['loc'][:8])])
        w2.column_dimensions['A'].width=18;w2.column_dimensions['B'].width=14;w2.column_dimensions['C'].width=80
    wb.save(path)

CAT_ORDER=['이야기 · 프롤로그','튜토리얼 · 이장 할머니','이야기 · 할아버지의 일지','이야기 · 지층 사건','주민 · 소개','주민 · 입주 인사','주민 · 한마디(입주자 칸)','튜토리얼 · 주민 안내','가게 · 인사(장비 탭)','가게 · 강화 고마움','린 · 세공사','소문 문장','이야기 · 탑','이야기 · 에필로그']
def export():
    os.makedirs(OUT,exist_ok=True);rows=collect()
    dia=[r for r in rows if r['kind']=='대사'];txt=[r for r in rows if r['kind']=='문구']
    dia.sort(key=lambda r:(CAT_ORDER.index(r['cat']) if r['cat'] in CAT_ORDER else 99))
    txt.sort(key=lambda r:(r['cat'],r['loc'][0]))
    G=('[고칠 문구] 칸(노란 칸)에만 새 문장을 적어 주세요. 비워 두면 그대로예요.\n'
       '• {1} {2} 같은 자리는 숫자 · 이름 · 광물이 들어가는 곳이라 지우지 말고 그대로 두세요(순서는 바꿔도 돼요). 뜻은 [자리 {n} 뜻] 칸에 있어요.\n'
       '• <b> <span …> 같은 꺾쇠 태그와 [장비] 같은 대괄호 이름(단추 이름)은 그대로 두는 게 좋아요. \\n 은 줄바꿈이에요.\n'
       '• 똑같은 문장이 여러 곳에 쓰이면 한 줄로 모았어요(고치면 모두 바뀌어요). 영어 · 번체 중국어는 고친 한국어에 맞춰 나중에 새로 번역해요.')
    locked=[r for r in rows if r.get('lock')];dia=[r for r in dia if not r.get('lock')];txt=[r for r in txt if not r.get('lock')]
    write_xlsx(os.path.join(OUT,'대사.xlsx'),dia,'대사',G)
    write_xlsx(os.path.join(OUT,'화면문구.xlsx'),txt,'화면 문구',G,locked)
    from collections import Counter
    print('대사',len(dia),dict(Counter(r['cat'] for r in dia)))
    print('화면 문구',len(txt),dict(Counter(r['cat'] for r in txt)))

# ───────── 다시 넣기 ─────────
def lit_apply(occ,new_txt,slots):
    """한 곳(occ)의 문자열 안에서 그 글자를 새 글자로 → 새 문자열 본문"""
    q=occ['q'];raw=occ['raw']
    shown=tpl_to_slots(raw)[0] if q=='`' else raw
    if occ['seg'] is None:new_shown=new_txt
    else:
        parts=TAG.split(shown);pt=parts[occ['seg']];lead=pt[:len(pt)-len(pt.lstrip())];tail=pt[len(pt.rstrip()):]
        parts[occ['seg']]=lead+new_txt+tail;new_shown=''.join(parts)
    if q=='`':return slots_to_tpl(new_shown,tpl_to_slots(raw)[1])
    if q in '\'"' and q in new_shown and ('\\'+q) not in new_shown:new_shown=new_shown.replace(q,'\\'+q)
    return new_shown
def do_import(paths):
    from openpyxl import load_workbook
    rows={rid(r):r for r in collect()}
    todo=[];errs=[];changed=set()
    names=[f for f in os.listdir(SRC) if (f.endswith('.js') and f not in SKIP) or f=='body.html']
    srcs={f:open(os.path.join(SRC,f),encoding='utf-8').read() for f in names}
    langs={f:open(os.path.join(SRC,f),encoding='utf-8').read() for f in ('lang_en.js','lang_zh.js')}
    edits=[]
    for p in paths:
        ws=load_workbook(p).active
        for row in ws.iter_rows(min_row=3,values_only=True):
            if not row or len(row)<8 or row[7] is None:continue
            new=row[4]
            if new is None or str(new).strip()=='':continue
            new=str(new).strip('\n');r=rows.get(str(row[7]))
            if not r:errs.append(f'{row[7]}: 원래 문장을 코드에서 못 찾음(이미 바뀌었을 수도) — "{row[3]}"');continue
            if new==r['text']:continue
            if r.get('lock'):errs.append(f'"{r["text"]}" 은(는) {r["lock"]}라 바꾸지 않았어요');continue
            need=sorted(set(int(x) for x in re.findall(r'\{(\d+)\}',r['text'])));got=sorted(set(int(x) for x in re.findall(r'\{(\d+)\}',new)))
            if [g for g in got if g not in need]:errs.append(f'{row[7]} "{r["text"][:30]}": 원래 없던 자리 {[g for g in got if g not in need]} — 건너뜀');continue
            if [g for g in need if g not in got]:errs.append(f'{row[7]} "{r["text"][:30]}": 자리 {[g for g in need if g not in got]} 가 빠졌어요(그 숫자 · 이름이 안 보이게 됨, 그래도 넣음)')
            edits.append((r,new))
    # 같은 문자열 안의 여러 조각을 차례로 고칠 수 있게: 문자열(파일, 원문) 단위로 모아서
    cur={}   # (파일, 따옴표, 원문) → 지금 본문
    for r,new in edits:
        for occ in r['occ']:
            k=(occ['f'],occ['q'],occ['raw']);base=cur.get(k,occ['raw'])
            o2=dict(occ,raw=base)
            try:cur[k]=lit_apply(o2,new,r['slots'])
            except Exception as e:errs.append(f'"{r["text"][:30]}": {e}')
        todo.append((rid(r),r['cat'],r['text'],new,'틀 문장(번역 틀도 고칠 것)' if r['slots'] else ''))
        # 번역 사전 열쇠: 문장 전체가 그대로 열쇠인 경우만 옮김(번역은 옛것, 나중에 새로)
        if not r['slots']:
            for f in langs:
                for qo in ("'"+r['text'].replace("'","\\'")+"'",'"'+r['text'].replace('"','\\"')+'"'):
                    if qo+':' in langs[f]:langs[f]=langs[f].replace(qo+':',"'"+new.replace("'","\\'")+"':")
    for (f,q,raw),body in cur.items():
        if q=='html':
            if raw in srcs[f]:srcs[f]=srcs[f].replace(raw,body);changed.add(f)
            continue
        old=q+raw+q;nb=q+body+q
        if old in srcs[f]:srcs[f]=srcs[f].replace(old,nb);changed.add(f)
        else:errs.append(f'{f}: 원래 문자열을 못 찾음 "{raw[:30]}"')
    # 게임 데이터 번역 사전(lang/ko.json — 줄 순서로 lang/en.txt · zh.txt 와 짝): 옛 문장 → 새 문장(번역은 옛것, 나중에 새로)
    kp=os.path.join(R,'lang','ko.json');K=json.load(open(kp,encoding='utf-8'));kc=0
    for r,new in edits:
        if r['slots']:continue
        for sec in K:
            for i,x in enumerate(K[sec]):
                if x==r['text']:K[sec][i]=new;kc+=1
    if kc:
        open(kp,'w',encoding='utf-8').write(json.dumps(K,ensure_ascii=False,separators=(',',':')).replace('],"','],\n"'))
        import subprocess;subprocess.run([sys.executable,os.path.join(R,'tools','lang_build.py')],check=False,stdout=subprocess.DEVNULL)
    for f in changed:open(os.path.join(SRC,f),'w',encoding='utf-8').write(srcs[f])
    for f in langs:open(os.path.join(SRC,f),'w',encoding='utf-8').write(langs[f])
    if todo:
        tp=os.path.join(OUT,'번역할_줄.tsv');nf=not os.path.exists(tp)
        with open(tp,'a',encoding='utf-8') as o:
            if nf:o.write('열쇠\t분류\t옛 한국어\t새 한국어\t비고\n')
            for t in todo:o.write('\t'.join(x.replace('\t',' ').replace('\n','\\n') for x in t)+'\n')
    print(f'바꾼 문장 {len(todo)}개 · 고친 파일 {sorted(changed)}')
    for e in errs:print('  !',e)
    print('다음: python3 tools/build.py 로 빌드해 확인 → 영어 · 번체 중국어는 docs/text/번역할_줄.tsv 를 보고 새로 번역')

if __name__=='__main__':
    cmd=sys.argv[1] if len(sys.argv)>1 else 'export'
    if cmd=='export':export()
    elif cmd=='import':do_import(sys.argv[2:] or [os.path.join(OUT,'대사.xlsx'),os.path.join(OUT,'화면문구.xlsx')])
    else:print(__doc__)
