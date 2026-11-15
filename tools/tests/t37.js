// v24 4단계: 스토리 삽화 자리 25장(프롤로그 6 · 지층 13 · 엔딩 6). 그림이 없어도 글은 그대로, 있으면 full/card/hero 연출, 일지에서 다시 보기
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();let h=fs.readFileSync(process.argv[2],'utf8');
fs.writeFileSync('dbg37.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+h+'</body></html>');
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);
for(const withArt of [false,true]){
const ctx=await b.newContext({...devices['Pixel 5'],locale:'ko-KR'});
if(withArt)await ctx.addInitScript(()=>{const mk=(c)=>{const v=document.createElement('canvas');v.width=48;v.height=40;const x=v.getContext('2d');x.fillStyle=c;x.fillRect(0,0,48,40);x.fillStyle='#ffd27a';x.fillRect(20,14,8,8);return v.toDataURL()};
  const keys=[...Array(6)].map((_,i)=>'p'+(i+1)).concat([...Array(13)].map((_,i)=>'b'+(i+1)),[...Array(6)].map((_,i)=>'e'+(i+1)));
  const t=setInterval(()=>{if(typeof ART!=='undefined'){clearInterval(t);keys.forEach((k,i)=>ART['story_'+k]=mk(`hsl(${i*14},40%,35%)`))}},1)});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const tag=withArt?'[그림 있음]':'[그림 없음]';
await p.goto('file://'+process.cwd()+'/dbg37.html');await p.waitForTimeout(800);
if(!withArt)await p.evaluate(()=>{Object.keys(ART).filter(k=>k.startsWith('story_')).forEach(k=>delete ART[k])});   // 그림이 없을 때(지금은 지층 · 엔딩 그림이 들어 있음)
if(withArt)await p.evaluate(()=>{const keys=[...Array(6)].map((_,i)=>'p'+(i+1)).concat([...Array(13)].map((_,i)=>'b'+(i+1)),[...Array(6)].map((_,i)=>'e'+(i+1)));keys.forEach(k=>{if(!ART['story_'+k]){const v=document.createElement('canvas');v.width=8;v.height=8;ART['story_'+k]=v.toDataURL()}})});
await p.click('#titleScr');await p.waitForTimeout(300);
// 프롤로그 6장
const pro=[];for(let i=0;i<6;i++){pro.push(await p.evaluate(()=>({t:$('storyT').textContent,b:$('storyB').textContent.length,full:$('story').classList.contains('m-full'),ill:!$('storyIll').hidden&&!!$('storyIllImg').getAttribute('src')})));await p.click('#storyNext');await p.waitForTimeout(80)}
ok(pro.length===6&&pro.every(x=>x.t&&x.b>10),`${tag} 프롤로그 6장 글 그대로: ${pro.map(x=>x.t).join(' / ')}`);
ok(withArt?pro.every(x=>x.full&&x.ill):pro.every(x=>!x.full&&!x.ill),`${tag} 프롤로그 연출: ${withArt?'큰 삽화 + 아래 글(전체 화면)':'예전 이야기 창(글만)'}`);
await p.waitForTimeout(400);if(await p.isVisible('#entry')){await p.click('#entry');await p.waitForTimeout(700)}for(let i=0;i<20&&await p.isVisible('#storyNext');i++)await p.click('#storyNext');
await p.evaluate(()=>{S.tutDone=true;S.whHint=1;renderAll()});
// 지층 개척 일지: B3(카드) · B13(별의 심장 특별 화면)
await p.evaluate(()=>{S.journal=[0,1];revealJournal(2)});await p.waitForTimeout(100);
const b3=await p.evaluate(()=>({t:$('storyT').textContent,b:$('storyB').textContent,card:$('story').classList.contains('m-card'),ill:!$('storyIll').hidden}));
ok(/B3/.test(b3.t)&&/곡괭이 자국/.test(b3.b)&&(withArt?b3.card&&b3.ill:!b3.card&&!b3.ill),`${tag} B3 개척: ${withArt?'가운데 삽화 + 일지 카드':'글만'}`);await p.click('#storyNext');
await p.evaluate(()=>revealJournal(12));await p.waitForTimeout(100);
const b13=await p.evaluate(()=>({t:$('storyT').textContent,b:$('storyB').textContent,hero:$('story').classList.contains('m-hero'),ill:!!$('storyIllImg').getAttribute('src'),vis:getComputedStyle($('storyIll')).display!=='none'}));
ok(/B13/.test(b13.t)&&/9,999m/.test(b13.b)&&b13.hero&&b13.vis&&b13.ill===withArt,`${tag} B13 별의 심장: 특별 전체 화면(그림 ${withArt?'있음':'없어도 빛나는 자리'})`);await p.click('#storyNext');
ok(await p.evaluate(()=>$('story').hidden&&!['m-full','m-card','m-hero'].some(k=>$('story').classList.contains(k))),`${tag} 창을 닫으면 연출 클래스 정리`);
// 일반 이야기 창(입주자 등)은 그대로
await p.evaluate(()=>{S.floors=6;tenantCard(1)});await p.waitForTimeout(100);ok(await p.evaluate(()=>!$('story').classList.contains('m-card')&&!$('story').classList.contains('m-full')&&$('storyIll').hidden),`${tag} 입주자 · 보상 같은 일반 이야기 창은 그대로`);await p.click('#storyNext');
// 할아버지의 일지에서 다시 보기
await p.evaluate(()=>openSheet('book'));await p.waitForTimeout(150);
const th=await p.evaluate(()=>document.querySelectorAll('#journal .jp-th').length);ok(withArt?th===4:th===0,`${tag} 일지 목록 삽화 미리보기 ${th}개`);
await p.click('[data-jp="2"]');await p.waitForTimeout(100);
const re=await p.evaluate(()=>({t:$('storyT').textContent,b:$('storyB').textContent,card:$('story').classList.contains('m-card'),src:$('storyIllImg').getAttribute('src')===ART.story_b3}));
ok(/B3/.test(re.t)&&/곡괭이 자국/.test(re.b)&&(withArt?re.card&&re.src:!re.card),`${tag} 일지에서 B3 다시 보기: 같은 ${withArt?'삽화 · ':''}글`);await p.click('#storyNext');
await p.evaluate(()=>closeSheet());
// 엔딩 6장
await p.evaluate(()=>{S.floors=99;S.inv.philo=1;S.inv.starshard=10;finale()});await p.waitForTimeout(100);
const en=[];for(let i=0;i<6;i++){en.push(await p.evaluate(()=>({t:$('storyT').textContent,full:$('story').classList.contains('m-full')})));await p.click('#storyNext');await p.waitForTimeout(60)}
ok(en.every(x=>x.t)&&en.every(x=>x.full===withArt),`${tag} 엔딩 6장: ${en.map(x=>x.t).join(' / ')}`);
const last=await p.evaluate(()=>({t:$('storyT').textContent,full:$('story').classList.contains('m-full')}));ok(/기록/.test(last.t)&&!last.full,`${tag} 마지막 기록 창은 일반 창`);
ok(errs.length===0,`${tag} 오류 없음 `+errs.join(' | '));await ctx.close()}
// 영어로도 글 그대로
{const ctx=await b.newContext({...devices['Pixel 5'],locale:'en-US'});const p=await ctx.newPage();await p.goto('file://'+process.cwd()+'/dbg37.html');await p.waitForTimeout(800);await p.click('#titleScr');await p.waitForTimeout(300);
ok(await p.evaluate(()=>/A Letter/.test($('storyT').textContent)),'[영어] 프롤로그 글');await ctx.close()}
await b.close()})();
