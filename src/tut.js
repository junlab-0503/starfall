/* ═════════ 첫 플레이 안내 (이장 할머니) ═════════ */
const TUT=[
  {t:'화면을 탭해서 바위를 캐 보렴. 암벽에 박힌 광석이 나올 게다.',sel:'#sceneWrap',tab:'mine',done:()=>S.mined>=5},
  {t:'광석이 모였구나. 아래 [관리]를 눌러 창고로 가 보렴.',sel:'.nb[data-tab="manage"]',done:()=>S.tab==='manage'&&S.sub==='store'},
  {t:'[판매]를 눌러 광석을 팔아 보렴. 골드가 생긴단다.',sel:'#inv [data-sellq]',done:()=>S.earned>0},
  {t:'이번엔 [합성]으로 가 보자. 할아버지의 용광로가 있단다.',sel:'.nb[data-tab="forge"]',done:()=>S.tab==='forge'},
  {t:'재료를 두 번 눌러 칸에 넣고 [합성]을 눌러 보렴. 돌 두 개로도 뭔가 만들어지지.',sel:'#pickGrid',done:()=>S.crafts>=1,hint:()=>cnt('stone')<2?'돌이 모자라면 채굴 화면에서 조금 더 캐 오렴.':''},
  {t:'[장터]에선 마을 사람들이 시세를 알려 준단다. 쌀 때 사고 비쌀 때 팔렴.',sel:'.nb[data-tab="market"]',done:()=>S.tab==='market'},
  {t:'마지막으로 [탑]이다. 돈과 재료를 모아 한 층씩 쌓으면 마을 사람들이 돌아온단다.',sel:'.nb[data-tab="tower"]',done:()=>S.tab==='tower'},
  {t:'이제 할아버지의 일지를 따라 내려가 보렴. 별이 기다리고 있을 게다.',sel:null,done:()=>false,last:true}
];
let tutEl=null;
function tutTick(){if(!S.prologue||S.tutDone||!$('story').hidden)return tutHide();S.tut=S.tut||0;let st=TUT[S.tut];if(!st){S.tutDone=true;return tutHide()}
  while(st&&!st.last&&st.done()){S.tut++;st=TUT[S.tut];sfx('page')}
  if(!st){S.tutDone=true;return tutHide()}
  const b=$('tut');b.hidden=false;$('tutT').textContent=st.t+(st.hint&&st.hint()?' '+st.hint():'');$('tutNext').textContent=st.last?'시작하기':'건너뛰기';
  document.querySelectorAll('.tut-glow').forEach(e=>{if(!st.sel||!e.matches(st.sel))e.classList.remove('tut-glow')});
  if(st.sel){const el=document.querySelector(st.sel);if(el)el.classList.add('tut-glow')}}
function tutHide(){const b=$('tut');if(b)b.hidden=true;document.querySelectorAll('.tut-glow').forEach(e=>e.classList.remove('tut-glow'))}
$('tutNext').onclick=()=>{const st=TUT[S.tut||0];if(st&&st.last){S.tutDone=true;tutHide();return}S.tutDone=true;tutHide();toast('안내를 건너뛰었어요. 관리 → 설정에서 다시 볼 수 있어요.')};
