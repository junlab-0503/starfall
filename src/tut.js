/* ═════════ 튜토리얼 (이장 할머니) ═════════ */
// t·sel은 함수일 수도 있다(상황에 따라 바뀜). next:true → 저절로 넘어가지 않고 [다음]을 눌러야 넘어가는 설명 단계
const slotsFull=()=>!!(S.slots[0]&&S.slots[1]);
const TUT=[
  {t:'화면을 탭해서 바위를 캐 보렴. 암벽에 박힌 광석이 나올 게다.',sel:'#sceneWrap',tab:'mine',done:()=>S.mined>=5},
  {t:'광석이 모였구나. 아래 [관리]를 눌러 창고로 가 보렴.',sel:'.nb[data-tab="manage"]',done:()=>S.tab==='manage'&&S.sub==='store'},
  {t:'[판매]를 눌러 광석을 팔아 보렴. 골드가 생긴단다.',sel:'#inv [data-sellq]',done:()=>S.earned>0},
  {t:'골드가 생겼구나. 아래 [장비]로 가 보렴. 마을 사람들이 도구를 손봐 준단다.',sel:'.nb[data-tab="equip"]',done:()=>S.tab==='equip'},
  {t:'무쇠, 핀, 미르, 셈 할멈, 루카가 저마다 공방을 연단다. 빨간 점이 보이면 지금 강화할 수 있다는 뜻이지. 골드가 모이면 곡괭이부터 벼려 보렴.',sel:'[data-up="pick"]',next:true},
  {t:'이번엔 [재련]으로 가 보자. 할아버지의 용광로가 있단다.',sel:'.nb[data-tab="forge"]',done:()=>S.tab==='forge'},
  {t:()=>slotsFull()?'좋아, 재료가 다 들어갔구나. 이제 [재련]을 눌러 보렴.':'반짝이는 [돌]을 두 번 눌러 재료 칸 두 개에 넣어 보렴. 돌 두 개로도 뭔가 만들어지지.',
   sel:()=>slotsFull()?'#smelt':'#pickGrid [data-pk="stone"]',done:()=>S.crafts>=1,hint:()=>!slotsFull()&&cnt('stone')<2?'돌이 모자라면 채굴 화면에서 조금 더 캐 오렴.':''},
  {t:'이번엔 [장터]로 가 보자.',sel:'.nb[data-tab="market"]',done:()=>S.tab==='market'},
  {t:'여기가 장터란다. 줄마다 오늘 값과 오르내림, 마을 사람의 한마디가 나오지. 쌀 때 사 두고 비쌀 때 팔렴. 줄을 누르면 자세한 시세도 볼 수 있단다.',sel:'#mkList .mrow',next:true},
  {t:'마지막으로 [탑]이다.',sel:'.nb[data-tab="tower"]',done:()=>S.tab==='tower'},
  {t:'골드와 재료를 모아 한 층씩 쌓으면 마을 사람들이 돌아온단다. 아래 입주자 칸을 누르면 그 사람 이야기도 들을 수 있지.',sel:'#floorCard',next:true},
  {t:'이제 할아버지의 일지를 따라 내려가 보렴. 별이 기다리고 있을 게다.',sel:null,last:true}
];
const tv=v=>typeof v==='function'?v():v;
const tutOn=()=>S.prologue&&!S.tutDone&&$('story').hidden;
function tutTick(){if(!tutOn())return tutHide();S.tut=S.tut||0;let st=TUT[S.tut];
  while(st&&!st.last&&!st.next&&st.done()){S.tut++;st=TUT[S.tut];sfx('page')}
  if(!st){S.tutDone=true;return tutHide()}
  $('tut').hidden=false;const h=st.hint?st.hint():'';$('tutT').textContent=tv(st.t)+(h?' '+h:'');
  $('tutGo').hidden=!(st.next||st.last);$('tutGo').textContent=st.last?'시작하기':'다음';$('tutNext').hidden=!!st.last;
  tutGlow()}
// 반짝임: 지금 눌러야 할 것 하나에만. 화면이 다시 그려질 때마다 다시 붙인다
function tutGlow(){const st=tutOn()?TUT[S.tut||0]:null,sel=st?tv(st.sel):null,el=sel?document.querySelector(sel):null;
  document.querySelectorAll('.tut-glow').forEach(e=>{if(e!==el)e.classList.remove('tut-glow')});if(el)el.classList.add('tut-glow')}
function tutHide(){const b=$('tut');if(b)b.hidden=true;document.querySelectorAll('.tut-glow').forEach(e=>e.classList.remove('tut-glow'))}
{const g=name=>{const o=window[name];window[name]=function(...a){const r=o.apply(this,a);tutGlow();return r}};['renderTab','renderForge','renderInv','renderMarket','renderTower'].forEach(g)}
$('tutGo').onclick=()=>{const st=TUT[S.tut||0];if(!st)return;if(st.last){S.tutDone=true;tutHide();return}S.tut++;sfx('page');tutTick()};
$('tutNext').onclick=()=>{S.tutDone=true;tutHide();toast('튜토리얼을 건너뛰었어요. 관리 → 설정에서 다시 볼 수 있어요.')};
