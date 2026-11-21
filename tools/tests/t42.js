// v27 · v28 확인: 소문 게시판(지난 발표는 최근 하나만 한 줄) · 세공 4종(백금옥) · 세공기 그림 · 세공침 · 효과 프레임 · 멈칫/흔들림/소리 · 흔들림·번쩍임 줄이기 설정
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();fs.writeFileSync('dbg42.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+fs.readFileSync(process.argv[2],'utf8')+'</body></html>');
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);
const c=await b.newContext({...devices['Pixel 5'],locale:'ko-KR'});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/dbg42.html');await p.waitForTimeout(900);
await p.evaluate(()=>{$('titleScr').hidden=true;$('entry').hidden=true;STQ.length=0;$('story').hidden=true;S.tutDone=true;S.prologue=true;S.unlocked=9;S.floors=25;S.journal=[...Array(9).keys()];S.seen=RAW.slice(0,18);
  S.ntq=[];S.ntDone=['셈','핀','루카','미르','린'];CR().met=1;S.gold=1e7;refreshBonus();renderAll()});
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
await p.click('#crBtn');await p.waitForTimeout(300);await p.click('[data-crk="plat"]');await p.waitForTimeout(150);while(await p.isVisible('#storyNext'))await p.click('#storyNext');await p.click('#crMake');   // v32: 옥 종류를 누르면 보기 팝업 → 닫고 제작await p.waitForTimeout(200);
const g=await p.evaluate(()=>{const m=$('crMedal').getBoundingClientRect(),s=document.querySelector('.cr-slot').getBoundingClientRect(),n=document.querySelector('.cr-ndw').getBoundingClientRect();
  const hx=m.left+m.width*49/103,hy=m.top+m.height*53.5/116;return{dx:Math.abs(s.left+s.width/2-hx),dy:Math.abs(s.top+s.height/2-hy),w:m.width,ar:m.height/m.width,nIn:n.bottom>s.top&&n.left>s.left&&n.right<s.right,a:CR().a&&CR().a.k,item:$('crItem').src===craftArt('plat',0)}});
ok(g.a==='plat'&&g.item&&g.dx<2&&g.dy<2&&Math.abs(g.ar-116/103)<.02&&g.w>=160,`백금옥 제작 → 세공기(${Math.round(g.w)}px) 구멍 한가운데에 세공품 (어긋남 ${g.dx.toFixed(1)},${g.dy.toFixed(1)}px)`);
ok(g.nIn,'세공침 자리가 세공품 위쪽(구멍 안)으로 내려옴');
// 4) 강화 성공 연출: 세공침 내려옴 → 멈칫 + 흔들림 + 소리 → 효과 프레임 → 끝나면 단계 오름
await p.evaluate(()=>{window.__R=Math.random;Math.random=()=>0;window.__snd=[];const o=window.sample;window.sample=(k,...a)=>{__snd.push(k);return o(k,...a)}});
const g0=await p.evaluate(()=>({g:S.gold,c:craftCost(CR().a),p:craftPrice(CR().a)}));
await p.click('#crTry');await p.evaluate(()=>{Math.random=window.__R});
const t1=await p.evaluate(()=>({drop:$('crMedal').classList.contains('aim'),busy:CRAFT_BUSY,try:!!$('crTry')&&$('crTry').disabled,spent:Math.round(S.gold)}));
ok(g0.c===Math.ceil(g0.p*.05)&&Math.round(g0.g-g0.c)===t1.spent,`강화 비용: 지금 판매가(${g0.p}G)의 5% = ${g0.c}G를 도전할 때 냄`);
await p.waitForTimeout(500);const t15=await p.evaluate(()=>({aim:$('crMedal').classList.contains('aim'),hit:$('crMedal').classList.contains('hit')}));
ok(t15.aim&&!t15.hit,'긴장 시간: 0.5초 뒤에도 아직 세공침이 세공품 위에서 기다림(결과 전)');
await p.waitForTimeout(500);const t2=await p.evaluate(()=>({hit:$('crMedal').classList.contains('hit'),shk:document.querySelector('#sheet .sheet-card').classList.contains('shk'),snd:[...__snd]}));
await p.waitForTimeout(200);const t3=await p.evaluate(()=>{const fx=$('crFx');return{d:fx.style.display,bg:fx.style.backgroundImage.includes(ART.craft_fx_ok.slice(0,60)),pos:fx.style.backgroundPosition,rise:$('crMedal').classList.contains('rise')}});
await p.waitForTimeout(1000);const t4=await p.evaluate(()=>({busy:CRAFT_BUSY,lv:CR().a&&CR().a.lv,fx:getComputedStyle($('crFx')).display}));
ok(t1.drop&&t1.busy&&t1.try,'강화 누르면 세공침이 내려와 멈추고 단추 잠김');
ok(t2.hit&&t2.shk&&t2.snd[0]==='craft_ok',`닿는 순간 멈칫 + 화면 흔들림 + 성공 소리 (${t2.snd.join(',')})`);
ok(t3.d==='block'&&t3.bg&&t3.rise&&t3.pos!=='0% 0px',`효과 프레임 재생 중 (위치 ${t3.pos})`);
ok(!t4.busy&&t4.lv===1&&t4.fx==='none','연출이 끝나면 +1, 효과 숨김, 단추 다시 눌림');
// 5) 실패: 균열 뒤 사라짐
await p.evaluate(()=>{window.__R=Math.random;Math.random=()=>.999});await p.click('#crTry');await p.evaluate(()=>{Math.random=window.__R});
await p.waitForTimeout(2050);const f1=await p.evaluate(()=>({gone:$('crMedal').classList.contains('gone'),fail:$('crMedal').classList.contains('fail'),a:CR().a,snd:__snd.slice(-1)[0]}));
await p.waitForTimeout(500);ok(f1.gone&&f1.fail&&f1.a===null&&f1.snd==='craft_fail','실패: 실패 소리 · 균열 효과 뒤 세공품이 사라짐(저장은 이미 부서짐)');
// 6) 흔들림 · 번쩍임 줄이기: 설정 칸 → 흔들림 · 효과 프레임 없이 결과만, 더 빨리 끝남
await p.evaluate(()=>{closeSheet();openSheet('set')});await p.waitForTimeout(100);await p.click('#lowFx');
const lf=await p.evaluate(()=>({on:S.lowFx,saved:JSON.parse(localStorage.getItem(SAVE_KEY)).lowFx}));ok(lf.on===true&&lf.saved===true,'설정 [흔들림 · 번쩍임 줄이기] 켜짐 · 저장');
await p.evaluate(()=>{closeSheet();S.inv.platbar=5;openSheet('craft');CR().sel='plat';renderCraft()});await p.click('#crMake');await p.waitForTimeout(150);
await p.evaluate(()=>{window.__R=Math.random;Math.random=()=>0;window.__shk=0;const el=document.querySelector('#sheet .sheet-card');new MutationObserver(()=>{if(el.classList.contains('shk'))__shk++}).observe(el,{attributes:true});window.__fxs=0;new MutationObserver(()=>{if($('crFx')&&$('crFx').style.display==='block')__fxs++}).observe($('crBody'),{attributes:true,subtree:true})});
await p.click('#crTry');await p.evaluate(()=>{Math.random=window.__R});await p.waitForTimeout(1800);
const lo=await p.evaluate(()=>({busy:CRAFT_BUSY,lv:CR().a&&CR().a.lv,shk:__shk,fxs:__fxs,snd:__snd.slice(-1)[0]}));
ok(!lo.busy&&lo.lv===1&&lo.shk===0&&lo.fxs===0&&lo.snd==='craft_ok','줄이기 켜면: 흔들림 · 효과 프레임 없이 소리와 결과만');
// 6-2) 골드가 모자라면 강화 단추 잠김 · 안내
const pr=await p.evaluate(()=>{S.gold=0;renderCraft();const b=$('crTry');return{dis:b&&b.disabled,msg:/골드가 모자라요/.test($('crBody').textContent),r:craftTry()}});
ok(pr.dis&&pr.msg&&pr.r===null,'골드가 모자라면 강화 도전 잠김 + "골드가 모자라요."');
await p.evaluate(()=>{S.gold=1e7;renderCraft()});
// 6-3) 확률표 없음 · 말풍선엔 이름만
ok(await p.evaluate(()=>!document.querySelector('.cr-odds')&&$('crStage').querySelector('.bn').textContent.trim()==='린'),'강화 확률표 없음, 린 말풍선엔 이름만');
// 7) 소리 파일 풀기(효과음 음량 따름)
const sd=await p.evaluate(async()=>{samplePreload('craft_ok','craft_fail','craft_ten');for(let i=0;i<40;i++){if(['craft_ok','craft_fail','craft_ten'].every(k=>SBUF[k]&&!SBUF[k].then))break;await new Promise(r=>setTimeout(r,50))}return['craft_ok','craft_fail','craft_ten'].map(k=>SBUF[k]&&SBUF[k].duration?SBUF[k].duration.toFixed(2):'x')});
ok(sd.every(x=>x!=='x'),'소리 3종 풀림(초): '+sd.join(' / '));
// 8) 옛 저장: 3종 기록 → 백금옥 기록 기본값 추가
const old=await p.evaluate(()=>{const d=JSON.parse(JSON.stringify(S));d.craft={a:null,rec:{silver:{made:2,succ:1,fail:1,best:1,bestSale:10,ten:false}},met:1,sel:'gold'};const s=cleanSave(d);return{rec:Object.keys(s.craft.rec).join(),pl:s.craft.rec.plat.made,sv:s.craft.rec.silver.made,low:s.lowFx}});
ok(old.rec==='silver,gold,plat,star'&&old.pl===0&&old.sv===2,'옛 저장: 백금옥 기록이 0으로 더해지고 기존 기록 유지');
// 9) 단계마다 화면의 성공 확률 · 성공하면 값 · 강화 비용 = 실제(5천 번 굴림 · 성공 뒤 판매가 · 실제 차감)
const od=await p.evaluate(()=>{openSheet('craft');const bad=[];const num=t=>{const m=t.match(/([\d.,]+)\s*(만|억)?/);return m?Math.round(+m[1].replace(/,/g,'')*(m[2]==='억'?1e8:m[2]==='만'?1e4:1)):NaN};
  for(let lv=0;lv<10;lv++){CR().a={k:'gold',n:10,base:10000,lv,t:0};S.gold=1e15;CRAFT_BUSY=false;CRFX=null;renderCraft();const cells=[...document.querySelectorAll('.cr-info>div')].map(d=>d.textContent);
    const sp=+(cells.find(t=>/성공 확률/.test(t))||'').match(/(\d+)%/)[1],sv=num((cells.find(t=>/성공하면/.test(t))||'').split('+'+(lv+1))[1]),sc=num((cells.find(t=>/강화 비용/.test(t))||'').replace('강화 비용',''));
    let s=0;for(let i=0;i<5000;i++){CR().a={k:'gold',n:10,base:10000,lv,t:0};CRAFT_BUSY=false;const x=craftTry();if(x&&x.ok)s++}
    CR().a={k:'gold',n:10,base:10000,lv,t:0};CRAFT_BUSY=false;const g0=S.gold,R=Math.random;Math.random=()=>0;craftTry();Math.random=R;
    if(sp!==Math.round(CRAFT_P[lv+1]*100)||Math.abs(s/50-sp)>2.5||sv!==craftPrice(CR().a)||sc!==g0-S.gold)bad.push(lv)}
  CR().a=null;renderCraft();return bad});
ok(!od.length,'단계 +1~+10 모두: 화면 성공 확률 = 실제(5천 번) · 성공하면 값 = 실제 판매가 · 강화 비용 = 실제 차감'+(od.length?' 어긋남 '+od:''));
// 10) 채굴 화면 [세공] 단추도 창고 단추와 같이 둥둥
ok(await p.evaluate(()=>{closeSheet();setTab('mine');renderAll();const a=getComputedStyle($('crBtnImg')).animationName,b=getComputedStyle($('whBtn').querySelector('img')).animationName;return a==='icb'&&a===b}),'[세공] 단추가 창고 단추와 같은 둥둥 애니메이션');
// 11) 진동: 내려가기 시작 톡 → 째깍마다 짧게 → 내리꽂힐 때 → 닿는 순간(성공 45ms). 설정을 끄면 안 울림. 앱 진동 플러그인이 있으면 그걸로
await p.evaluate(()=>{window.__vib=[];Object.defineProperty(navigator,'vibrate',{configurable:true,value:x=>{__vib.push(x);return true}});S.lowFx=false;S.vib=true;S.gold=1e9;S.inv.platbar=5;CR().a=null;openSheet('craft');CR().sel='plat';renderCraft()});
await p.click('#crMake');await p.waitForTimeout(150);await p.evaluate(()=>{window.__R=Math.random;Math.random=()=>0});await p.click('#crTry');await p.evaluate(()=>{Math.random=window.__R});await p.waitForTimeout(1300);
const vb=await p.evaluate(()=>[...__vib]);const ticks=vb.filter(x=>x===8).length;
ok(vb[0]===12&&ticks>=4&&vb.includes(20)&&vb[vb.length-1]===45&&vb.indexOf(20)<vb.indexOf(45),`진동 순서: 시작 12ms → 째깍 ${ticks}번(8ms) → 내리꽂기 20ms → 성공 45ms`);
await p.waitForTimeout(1200);await p.evaluate(()=>{__vib.length=0;closeSheet();openSheet('set')});await p.click('#vibOn');
const off=await p.evaluate(()=>({vib:S.vib,saved:JSON.parse(localStorage.getItem(SAVE_KEY)).vib}));
await p.evaluate(()=>{closeSheet();openSheet('craft');renderCraft();window.__R=Math.random;Math.random=()=>0;craftDoTry();Math.random=window.__R});await p.waitForTimeout(1500);
ok(off.vib===false&&off.saved===false&&(await p.evaluate(()=>__vib.length))===0,'설정 [진동] 끄면 저장되고 진동 없음');
const hp=await p.evaluate(()=>{S.vib=true;const L=[];window.Capacitor={Plugins:{Haptics:{impact:o=>L.push('impact:'+o.style),vibrate:o=>L.push('vibrate:'+o.duration)}}};buzz(8);buzz(45);buzz([70,50,90]);delete window.Capacitor;return L.join(',')});
ok(hp==='impact:LIGHT,impact:MEDIUM,vibrate:160','앱 진동 플러그인(@capacitor/haptics)이 있으면 그걸로: '+hp);
await p.waitForTimeout(1200);
ok(errs.length===0,'오류 없음 '+errs.join(' | '));
await b.close()})();
