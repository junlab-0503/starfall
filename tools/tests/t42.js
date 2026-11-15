// v27 확인: 소문 게시판(지난 발표는 최근 하나만 한 줄) · 세공 4종(백금옥) · 세공기 그림 · 세공침 · 효과 프레임 · 멈칫/흔들림/소리 · 흔들림·번쩍임 줄이기 설정
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();fs.writeFileSync('dbg42.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+fs.readFileSync(process.argv[2],'utf8')+'</body></html>');
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);
const c=await b.newContext({...devices['Pixel 5'],locale:'ko-KR'});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/dbg42.html');await p.waitForTimeout(900);
await p.evaluate(()=>{$('titleScr').hidden=true;$('entry').hidden=true;STQ.length=0;$('story').hidden=true;S.tutDone=true;S.prologue=true;S.unlocked=9;S.floors=25;S.journal=[...Array(9).keys()];S.seen=RAW.slice(0,18);
  S.ntq=[];S.ntDone=['셈','핀','루카','미르','린'];CR().met=1;refreshBonus();renderAll()});
// 1) 소문 게시판: 진행 중 소문 + 지난 발표는 가장 최근 하나만 한 줄
const rb=await p.evaluate(()=>{for(let i=0;i<3600;i++)tickMarket(1,false);while(S.rumDone.length<4){const r=S.rum[0];if(!r){newRumor();continue}r.t=r.dur;rumorTick(0)}if(!S.rum.length)newRumor();S.mkSub='pass';setTab('market');renderMarket();
  const el=$('rumors');return{act:S.rum.length,done:S.rumDone.length,cards:el.querySelectorAll('.rum:not(.done)').length,slim:el.querySelectorAll('.rum.done').length,txt:(el.querySelector('.rum.done')||{}).textContent||''}});
ok(rb.done>=2&&rb.slim===1&&rb.cards===rb.act&&/지난 발표/.test(rb.txt),`게시판: 진행 중 ${rb.cards}개 + 지난 발표 1줄 (저장된 발표 ${rb.done}개 중 최근 것만) "${rb.txt.trim()}"`);
// 2) 세공 4종 · 그림
const k4=await p.evaluate(()=>({k:CRAFT_KINDS.map(x=>x.k+':'+x.mat).join(),art:['silver','gold','plat','star'].every(k=>[0,1,2,3,4,5].every(i=>ART['craft_'+k+i])),p10:craftArt('plat',10)===ART.craft_plat5,
  m:!!ART.craft_machine&&!!ART.craft_needle&&!!ART.craft_icon&&['ok','fail','ten'].every(k=>ART['craft_fx_'+k]),sfx:Object.keys(SFXD).sort().join(),old:!!ART.craft_bench||!!ART.craft_hammer}));
ok(k4.k==='silver:silverbar,gold:goldbar,plat:platbar,star:starsteel'&&k4.art&&k4.p10,'세공 4종: 은옥 · 금옥 · 백금옥(백금괴) · 별빛옥, 단계 그림 24장');
ok(k4.m&&k4.sfx==='craft_fail,craft_ok,craft_ten'&&!k4.old,'세공기 · 세공침 · 단추 · 효과 3종 · 소리 3종, 옛 임시 그림(작업대 · 망치) 없음');
// 3) 작업대 열기 → 세공기 안 구멍에 세공품, 단추 그림
await p.evaluate(()=>{setTab('mine');S.inv={platbar:20,silverbar:5};renderAll()});await p.mouse.click(180,300);await p.waitForTimeout(100);
ok(await p.evaluate(()=>$('crBtnImg').src===ART.craft_icon),'채굴 화면 [세공] 단추 = 세공기 그림');
await p.click('#crBtn');await p.waitForTimeout(300);await p.click('[data-crk="plat"]');await p.waitForTimeout(100);await p.click('#crMake');await p.waitForTimeout(200);
const g=await p.evaluate(()=>{const m=$('crMedal').getBoundingClientRect(),s=document.querySelector('.cr-slot').getBoundingClientRect(),n=document.querySelector('.cr-ndw').getBoundingClientRect();
  const hx=m.left+m.width*49/103,hy=m.top+m.height*53.5/116;return{dx:Math.abs(s.left+s.width/2-hx),dy:Math.abs(s.top+s.height/2-hy),w:m.width,ar:m.height/m.width,nIn:n.bottom>s.top&&n.left>s.left&&n.right<s.right,a:CR().a&&CR().a.k,item:$('crItem').src===craftArt('plat',0)}});
ok(g.a==='plat'&&g.item&&g.dx<2&&g.dy<2&&Math.abs(g.ar-116/103)<.02&&g.w>250,`백금옥 제작 → 세공기(${Math.round(g.w)}px) 구멍 한가운데에 세공품 (어긋남 ${g.dx.toFixed(1)},${g.dy.toFixed(1)}px)`);
ok(g.nIn,'세공침 자리가 세공품 위쪽(구멍 안)으로 내려옴');
// 4) 강화 성공 연출: 세공침 내려옴 → 멈칫 + 흔들림 + 소리 → 효과 프레임 → 끝나면 단계 오름
await p.evaluate(()=>{window.__R=Math.random;Math.random=()=>0;window.__snd=[];const o=window.sample;window.sample=(k,...a)=>{__snd.push(k);return o(k,...a)}});
await p.click('#crTry');await p.evaluate(()=>{Math.random=window.__R});
const t1=await p.evaluate(()=>({drop:$('crMedal').classList.contains('drop'),busy:CRAFT_BUSY,try:!!$('crTry')&&$('crTry').disabled}));
await p.waitForTimeout(390);const t2=await p.evaluate(()=>({hit:$('crMedal').classList.contains('hit'),shk:document.querySelector('#sheet .sheet-card').classList.contains('shk'),snd:[...__snd]}));
await p.waitForTimeout(200);const t3=await p.evaluate(()=>{const fx=$('crFx');return{d:fx.style.display,bg:fx.style.backgroundImage.includes(ART.craft_fx_ok.slice(0,60)),pos:fx.style.backgroundPosition,rise:$('crMedal').classList.contains('rise')}});
await p.waitForTimeout(1000);const t4=await p.evaluate(()=>({busy:CRAFT_BUSY,lv:CR().a&&CR().a.lv,fx:getComputedStyle($('crFx')).display}));
ok(t1.drop&&t1.busy&&t1.try,'강화 누르면 세공침이 내려오고 단추 잠김');
ok(t2.hit&&t2.shk&&t2.snd[0]==='craft_ok',`닿는 순간 멈칫 + 화면 흔들림 + 성공 소리 (${t2.snd.join(',')})`);
ok(t3.d==='block'&&t3.bg&&t3.rise&&t3.pos!=='0% 0px',`효과 프레임 재생 중 (위치 ${t3.pos})`);
ok(!t4.busy&&t4.lv===1&&t4.fx==='none','연출이 끝나면 +1, 효과 숨김, 단추 다시 눌림');
// 5) 실패: 균열 뒤 사라짐
await p.evaluate(()=>{window.__R=Math.random;Math.random=()=>.999});await p.click('#crTry');await p.evaluate(()=>{Math.random=window.__R});
await p.waitForTimeout(1250);const f1=await p.evaluate(()=>({gone:$('crMedal').classList.contains('gone'),fail:$('crMedal').classList.contains('fail'),a:CR().a,snd:__snd.slice(-1)[0]}));
await p.waitForTimeout(500);ok(f1.gone&&f1.fail&&f1.a===null&&f1.snd==='craft_fail','실패: 실패 소리 · 균열 효과 뒤 세공품이 사라짐(저장은 이미 부서짐)');
// 6) 흔들림 · 번쩍임 줄이기: 설정 칸 → 흔들림 · 효과 프레임 없이 결과만, 더 빨리 끝남
await p.evaluate(()=>{closeSheet();openSheet('set')});await p.waitForTimeout(100);await p.click('#lowFx');
const lf=await p.evaluate(()=>({on:S.lowFx,saved:JSON.parse(localStorage.getItem(SAVE_KEY)).lowFx}));ok(lf.on===true&&lf.saved===true,'설정 [흔들림 · 번쩍임 줄이기] 켜짐 · 저장');
await p.evaluate(()=>{closeSheet();S.inv.platbar=5;openSheet('craft');CR().sel='plat';renderCraft()});await p.click('#crMake');await p.waitForTimeout(150);
await p.evaluate(()=>{window.__R=Math.random;Math.random=()=>0;window.__shk=0;const el=document.querySelector('#sheet .sheet-card');new MutationObserver(()=>{if(el.classList.contains('shk'))__shk++}).observe(el,{attributes:true});window.__fxs=0;new MutationObserver(()=>{if($('crFx')&&$('crFx').style.display==='block')__fxs++}).observe($('crBody'),{attributes:true,subtree:true})});
await p.click('#crTry');await p.evaluate(()=>{Math.random=window.__R});await p.waitForTimeout(1150);
const lo=await p.evaluate(()=>({busy:CRAFT_BUSY,lv:CR().a&&CR().a.lv,shk:__shk,fxs:__fxs,snd:__snd.slice(-1)[0]}));
ok(!lo.busy&&lo.lv===1&&lo.shk===0&&lo.fxs===0&&lo.snd==='craft_ok','줄이기 켜면: 흔들림 · 효과 프레임 없이 소리와 결과만(1.1초 안에 끝)');
// 7) 소리 파일 풀기(효과음 음량 따름)
const sd=await p.evaluate(async()=>{samplePreload('craft_ok','craft_fail','craft_ten');for(let i=0;i<40;i++){if(['craft_ok','craft_fail','craft_ten'].every(k=>SBUF[k]&&!SBUF[k].then))break;await new Promise(r=>setTimeout(r,50))}return['craft_ok','craft_fail','craft_ten'].map(k=>SBUF[k]&&SBUF[k].duration?SBUF[k].duration.toFixed(2):'x')});
ok(sd.every(x=>x!=='x'),'소리 3종 풀림(초): '+sd.join(' / '));
// 8) 옛 저장: 3종 기록 → 백금옥 기록 기본값 추가
const old=await p.evaluate(()=>{const d=JSON.parse(JSON.stringify(S));d.craft={a:null,rec:{silver:{made:2,succ:1,fail:1,best:1,bestSale:10,ten:false}},met:1,sel:'gold'};const s=cleanSave(d);return{rec:Object.keys(s.craft.rec).join(),pl:s.craft.rec.plat.made,sv:s.craft.rec.silver.made,low:s.lowFx}});
ok(old.rec==='silver,gold,plat,star'&&old.pl===0&&old.sv===2,'옛 저장: 백금옥 기록이 0으로 더해지고 기존 기록 유지');
ok(errs.length===0,'오류 없음 '+errs.join(' | '));
await b.close()})();
