/* ═════════ 소리 연결 ═════════ */
{const w=(name,fn)=>{const o=window[name];window[name]=function(...a){const r=o.apply(this,a);try{fn(r,a)}catch(e){}return r}};
 const _tap=doTap;doTap=function(){sfx(full()&&!ul('autosell')?'deny':'hit');return _tap()};
 w('breakWall',(r,a)=>sfx(a[0]?'breakSoft':'break'));
 const _gain=gain;gain=function(id,n,auto){const isNew=!S.seen.includes(id);const r=_gain(id,n,auto);if(isNew&&ITEMS[id].L&&S.prologue)discover(id);sfx(isNew||ITEMS[id].L>=S.layer+1?'rare':'gain');return r};
 w('showResult',(r,a)=>sfx(a[0].kind==='great'?'great':a[0].kind==='ok'?'craft':'fail'));
 w('doSell',()=>sfx('coin'));
 w('buy',r=>{if(r&&r.k)sfx('buy')});
 w('buildFloor',r=>{if(r)sfx('floor')});
 w('unlockLayer',()=>sfx('unlock'));w('collectBox',()=>sfx('gain'));
 w('nextStory',()=>{if(!$('story').hidden)sfx($('portrait').hidden?'page':'tenant')});
 document.addEventListener('click',e=>{if(e.target.closest('button')&&!e.target.closest('#scene'))sfx('click')},true);}
/* 설정: 음량, 튜토리얼 다시 보기 */
function renderSnd(){S.sound=S.sound||{sfx:.6,bgm:.3};$('volSfx').value=Math.round(S.sound.sfx*100);$('volBgm').value=Math.round(S.sound.bgm*100)}
$('volSfx').addEventListener('input',e=>{S.sound.sfx=e.target.value/100;applyVol();sfx('coin')});
$('volBgm').addEventListener('input',e=>{S.sound.bgm=e.target.value/100;applyVol()});
$('tutAgain').onclick=()=>{S.tut=0;S.tutDone=false;setTab('mine');toast('튜토리얼을 다시 시작해요.')};
