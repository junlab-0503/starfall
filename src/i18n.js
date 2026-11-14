/* ═════════ 언어팩: 한국어(원문) · English · 繁體中文 ═════════
 게임 코드는 한국어 원문 그대로 두고, 화면에 나가는 글자를 그 자리에서 번역한다(게임 규칙 · 저장은 언어와 상관없음).
 - LANGS[언어] = {d: {원문: 번역}, p: [[정규식, 바꿀 말 또는 함수], …]} (src/lang_*.js)
 - 글자 노드: MutationObserver가 새로 생기거나 바뀐 글자를 번역. 원문을 노드마다 기억해 두어 언어를 바꾸면 다시 번역
 - 숫자 단위(만 · 억 · 조 / K · M · B · T / 萬 · 億 · 兆)는 state.js의 big() · cbig()
 - 처음 켤 때는 기기 언어를 따름(한국어 → ko, 중국어 → zh(번체), 그 밖 → en). 설정에서 바꾸면 그 선택을 기억 */
const LANGS={ko:null},LANG_NAMES={ko:'한국어',en:'English',zh:'繁體中文'},LANG_KEY='starfall.lang';
function detectLang(){const l=String((navigator.languages&&navigator.languages[0])||navigator.language||'en').toLowerCase();return l.startsWith('ko')?'ko':l.startsWith('zh')?'zh':'en'}
let LANG=(()=>{try{const v=localStorage.getItem(LANG_KEY);if(v&&LANG_NAMES[v])return v}catch(e){}return detectLang()})();
const HANGUL=/[ㄱ-ㆎ가-힣]/,TCACHE=new Map(),MISS=new Set();
// 한 문장 번역: 사전 → 틀 → (따옴표로 감싼 말 · 빈 줄로 나뉜 문단은 나눠서) → 없으면 원문 그대로
function T(s){if(LANG==='ko'||typeof s!=='string'||!HANGUL.test(s))return s;let c=TCACHE.get(s);if(c===undefined){c=trOne(s);if(TCACHE.size>3000)TCACHE.clear();TCACHE.set(s,c)}return c}
function trOne(s){const D=LANGS[LANG];if(!D)return s;const m=s.match(/^(\s*)([\s\S]*?)(\s*)$/),core=m[2];if(!core)return s;let out=D.d[core],mm;
  if(out===undefined)for(const[re,rep]of D.p){mm=core.match(re);if(mm){out=typeof rep==='function'?rep(...mm):core.replace(re,rep);break}}
  if(out===undefined){   // 두루 쓰는 나눔: 따옴표로 감싼 말 · 줄바꿈 · 가운뎃점( · ) · 쉼표로 이어진 목록은 조각마다 번역
    if((mm=core.match(/^"([\s\S]+)"$/)))out=LANG==='zh'?'「'+T(mm[1])+'」':'"'+T(mm[1])+'"';
    else{const sep=['\n\n','\n',' · ',', '].find(x=>core.includes(x));if(sep)out=core.split(sep).map(T).join(sep);else{MISS.add(core);out=core}}}
  return m[1]+out+m[3]}
// 화면의 글자 노드 번역. ORIG: 노드 → {o: 원문, t: 번역해 넣은 글자}
const ORIG=new WeakMap(),ATTRS=['placeholder','aria-label','alt'];
// 사람 이름이 들어가는 자리(탑 목록 · 입주자 카드 · 말풍선 · 소문 출처): 광물과 같은 글자인 이름(강철)을 이름으로 번역
const NAME_AT='.sect b,.who,.bn b,.rh b,.tut-who';
const TN=(n,v)=>{const D=LANGS[LANG],k=v.trim();return D&&D.nm&&D.nm[k]&&n.parentNode.closest&&n.parentNode.closest(NAME_AT)?v.replace(k,D.nm[k]):T(v)};
const NM=k=>{const D=LANGS[LANG];return(D&&D.nm&&D.nm[k])||T(k)};   // 틀 안에서 사람 이름 번역
function trNode(n){const v=n.nodeValue,r=ORIG.get(n);if(r&&v===r.t)return;
  if(HANGUL.test(v)){if(LANG==='ko'){if(r)ORIG.delete(n);return}const t=TN(n,v);ORIG.set(n,{o:v,t});if(t!==v)n.nodeValue=t}else if(r)ORIG.delete(n)}
function trTree(root){if(root.nodeType===3){trNode(root);return}if(root.nodeType!==1||root.tagName==='SCRIPT'||root.tagName==='STYLE')return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))if(n.parentNode.tagName!=='SCRIPT'&&n.parentNode.tagName!=='STYLE')trNode(n);
  trAttr(root);root.querySelectorAll('[placeholder],[aria-label],[alt]').forEach(trAttr)}
// 설명 속성(화면 낭독기용 이름 · 입력 칸 안내): 원문은 data-i18n… 에 기억
function trAttr(el){ATTRS.forEach(a=>{if(!el.hasAttribute||!el.hasAttribute(a))return;const k='i18n'+a.replace(/-/g,''),v=el.getAttribute(a),o=HANGUL.test(v)?v:el.dataset[k];if(!o||!HANGUL.test(o))return;el.dataset[k]=o;const t=T(o);if(t!==v)el.setAttribute(a,t)})}
const LANG_OBS=new MutationObserver(rs=>{if(LANG==='ko')return;for(const r of rs){if(r.type==='characterData')trNode(r.target);else r.addedNodes.forEach(trTree)}});
// 언어 바꾸기: 화면 전체를 원문에서 다시 번역(글자 노드 + 설명 속성), 제목 · 글꼴 · 설정 단추 표시
function applyLang(lang,keep){if(lang&&LANG_NAMES[lang]){LANG=lang;if(keep)try{localStorage.setItem(LANG_KEY,lang)}catch(e){}}
  TCACHE.clear();document.documentElement.lang=LANG==='zh'?'zh-TW':LANG;
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  while((n=w.nextNode())){const tg=n.parentNode.tagName;if(tg==='SCRIPT'||tg==='STYLE')continue;const r=ORIG.get(n),o=r?r.o:n.nodeValue;if(!HANGUL.test(o))continue;
    if(LANG==='ko'){ORIG.delete(n);if(n.nodeValue!==o)n.nodeValue=o}else{const t=TN(n,o);ORIG.set(n,{o,t});if(n.nodeValue!==t)n.nodeValue=t}}
  document.querySelectorAll('[placeholder],[aria-label],[alt]').forEach(trAttr);
  document.title=T('별빛광맥');document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('on',b.dataset.lang===LANG))}
function initLang(){LANG_OBS.observe(document.body,{subtree:true,childList:true,characterData:true});applyLang();
  const box=document.getElementById('langSeg');if(box)box.addEventListener('click',e=>{const b=e.target.closest('[data-lang]');if(!b||b.dataset.lang===LANG)return;applyLang(b.dataset.lang,true);if(typeof renderAll==='function')renderAll()})}
