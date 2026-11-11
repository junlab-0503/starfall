/* ═════════ 튜토리얼 (이장 할머니): 캐기 → 광석 발견 → 재련 → 탑 1층(무쇠) → 곡괭이 강화 → 그 밖의 것 → 최종 목표 ═════════ */
// t·sel은 함수일 수도 있다(상황에 따라 바뀜). next:true → 저절로 넘어가지 않고 [다음]을 눌러야 넘어가는 설명 단계
const slotsFull=()=>!!(S.slots[0]&&S.slots[1]);
const TUT=[
  {t:'여기가 영감이 평생 판 광맥이란다. 화면을 탭해서 바위를 캐 보렴.',sel:'#sceneWrap',done:()=>S.mined>=1},
  {t:'처음 보는 광석은 도감에 남는단다. 계속 캐서 돌을 넉넉히 모아 보렴.',sel:'#sceneWrap',done:()=>cnt('stone')+cnt('brick')*2>=10,hint:()=>`(돌 ${Math.min(cnt('stone')+cnt('brick')*2,10)}/10)`},
  {t:'돌 두 개를 녹이면 다듬은 돌이 된단다. 아래 [재련]으로 가 보렴.',sel:'.nb[data-tab="forge"]',done:()=>S.tab==='forge'||cnt('brick')>=2},
  {t:()=>slotsFull()?'좋아, 이제 [재련]을 눌러 보렴.':'[돌]을 두 번 눌러 재료 칸 두 개에 넣어 보렴.',sel:()=>slotsFull()?'#smelt':'#pickGrid [data-pk="stone"]',done:()=>cnt('brick')>=2,
   hint:()=>`(다듬은 돌 ${Math.min(cnt('brick'),2)}/2)`+(!slotsFull()&&cnt('stone')<2?' 돌이 모자라면 채굴 화면에서 조금 더 캐 오렴.':'')},
  {t:'잘했다! 이제 [탑]으로 가 보자. 떠난 마을 사람들이 돌아올 집이란다.',sel:'.nb[data-tab="tower"]',done:()=>S.tab==='tower'||S.floors>=1},
  {t:'[한 층 쌓기]를 눌러 1층을 지어 보렴. 대장장이 무쇠가 돌아올 게다.',sel:'#buildBtn',done:()=>S.floors>=1},
  {t:'무쇠가 돌아왔구나! 아래 [장비]로 가서 대장간을 열어 보렴.',sel:'.nb[data-tab="equip"]',done:()=>S.tab==='equip'||S.pick>=2},
  {t:'무쇠에게 [곡괭이 벼리기]를 맡겨 보렴. 바위가 훨씬 쉽게 갈라질 게다.',sel:'[data-up="pick"]',done:()=>S.pick>=2},
  {t:'광석은 [관리] 창고에서 팔거나 [장터]에서 정해진 값에 사고팔 수 있단다. 골드가 모자라면 팔아서 마련하렴.',sel:'.nb[data-tab="manage"]',next:true},
  {t:'채굴 화면 위 칸에는 다음 지층을 여는 데 필요한 것이 나온단다. 다 모으면 그 칸을 눌러 더 깊이 내려가렴.',sel:'.nb[data-tab="mine"]',next:true},
  {t:'탑을 높이 쌓을수록 떠났던 사람들이 하나둘 돌아와 가게를 연단다. 누가 오면 그 사람이 직접 알려 줄 게야.',sel:'.nb[data-tab="tower"]',next:true},
  {t:'할아버지의 일지를 따라 별의 심장까지 내려가고, 탑 99층 꼭대기에서 별을 하늘로 돌려보내는 게 네 일이란다. 할미는 늘 여기 있으마.',sel:null,last:true}
];
const tv=v=>typeof v==='function'?v():v;
const tutOn=()=>S.prologue&&!S.tutDone&&$('story').hidden&&$('titleScr').hidden;
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
