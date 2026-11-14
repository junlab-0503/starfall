// v18 언어팩 확인: 기기 언어로 기본 선택, 설정에서 바꾸기 · 기억, 한국어는 원문 그대로, 번역 안 된 글자 없음, 숫자 단위
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();let h=fs.readFileSync(process.argv[2],'utf8');
fs.writeFileSync('dbg28.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+h+'</body></html>');const url='file://'+process.cwd()+'/dbg28.html';
const ok=(c,m)=>console.log((c?'OK  ':'FAIL')+' '+m);const errs=[];
const open=async locale=>{const ctx=await b.newContext({...devices['iPhone 13'],locale});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(url);await p.waitForTimeout(700);return p};
const HAN=/[ㄱ-ㆎ가-힣]/;
// 1) 기기 언어 → 기본 언어
for(const[loc,want,title,tap]of[['ko-KR','ko','별빛광맥','터치하여 시작하기'],['en-US','en','Starlight Vein','Tap to start'],['zh-TW','zh','星光礦脈','點擊開始'],['zh-HK','zh','星光礦脈','點擊開始'],['ja-JP','en','Starlight Vein','Tap to start']]){
  const p=await open(loc);const r=await p.evaluate(()=>({l:LANG,t:document.querySelector('.t-name').textContent,tap:document.querySelector('.t-tap').textContent,dt:document.title,hl:document.documentElement.lang}));
  ok(r.l===want&&r.t===title&&r.tap===tap&&r.dt===title,`기기 언어 ${loc} → ${r.l}: "${r.t}" / "${r.tap}" (html lang=${r.hl})`);await p.context().close()}
// 2) 영어로 시작 → 화면에 한글이 남지 않음, 숫자 단위 K/M
const p=await open('en-US');const close=async()=>{for(let i=0;i<30&&await p.isVisible('#storyNext');i++)await p.click('#storyNext')};
await p.click('#titleScr');await p.waitForTimeout(300);const pro=await p.evaluate(()=>$('storyT').textContent+' | '+$('storyB').textContent.slice(0,40));ok(/A Letter/.test(pro)&&/torn down this winter/.test(await p.evaluate(()=>$('storyB').textContent)),'영어 프롤로그: '+pro);
await close();await p.waitForTimeout(500);if(await p.isVisible('#entry')){await p.click('#entry');await p.waitForTimeout(700)}
await p.evaluate(()=>{S.tutDone=true;S.gold=2.5e6;S.floors=30;S.unlocked=6;refreshBonus();renderAll()});await close();
const vis=()=>p.evaluate(()=>{const o=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){const e=n.parentElement;if(!e||e.closest('script,style,#langSeg'))continue;if(e.offsetParent===null)continue;if(/[ㄱ-ㆎ가-힣]/.test(n.nodeValue))o.push(n.nodeValue.trim().slice(0,30))}return o});
let left=[];for(const t of ['mine','equip','forge','market','tower','manage']){await p.click(`[data-tab="${t}"]`);await p.waitForTimeout(350);left=left.concat((await vis()).map(x=>t+': '+x))}
ok(left.length===0,'영어: 여섯 탭 화면에 한글이 남지 않음'+(left.length?' → '+left.slice(0,5).join(' / '):''));
const hd=await p.evaluate(()=>({g:$('gold').textContent,tw:$('towerStat').textContent,nav:[...document.querySelectorAll('.nb span')].map(e=>e.textContent).join()}));
ok(hd.g==='2.5MG'&&hd.tw==='30F'&&hd.nav==='Mine,Gear,Smelt,Market,Tower,Manage','영어 머리글: '+JSON.stringify(hd));
// 3) 설정에서 번체로 → 바로 바뀌고 기억됨
await p.click('[data-tab="manage"]');await p.click('[data-sub="set"]');await p.click('[data-lang="zh"]');await p.waitForTimeout(300);
const z=await p.evaluate(()=>({l:LANG,g:$('gold').textContent,nav:[...document.querySelectorAll('.nb span')].map(e=>e.textContent).join(),on:document.querySelector('[data-lang].on').dataset.lang,ff:getComputedStyle(document.body).fontFamily.split(',')[0],saved:localStorage.getItem('starfall.lang')}));
ok(z.l==='zh'&&z.g==='250萬G'&&z.nav==='挖礦,裝備,精煉,市集,塔,管理'&&z.on==='zh'&&/StarTC/.test(z.ff)&&z.saved==='zh','번체로 바꾸기: '+JSON.stringify(z));
left=[];for(const t of ['mine','equip','forge','market','tower','manage']){await p.click(`[data-tab="${t}"]`);await p.waitForTimeout(350);left=left.concat((await vis()).map(x=>t+': '+x))}
ok(left.length===0,'번체: 여섯 탭 화면에 한글이 남지 않음'+(left.length?' → '+left.slice(0,5).join(' / '):''));
ok(await p.evaluate(()=>document.fonts.check('12px StarTC','挖礦')),'번체 글꼴(StarTC) 불러옴');
// 4) 한국어로 → 원문 그대로 돌아옴
await p.click('[data-tab="manage"]');await p.click('[data-sub="set"]');await p.click('[data-lang="ko"]');await p.waitForTimeout(300);
const k=await p.evaluate(()=>({g:$('gold').textContent,nav:[...document.querySelectorAll('.nb span')].map(e=>e.textContent).join(),set:document.querySelector('#sub-set h2').textContent,miss:MISS.size}));
ok(k.g==='250만G'&&k.nav==='채굴,장비,재련,장터,탑,관리'&&k.set==='설정','한국어로 되돌리기: '+JSON.stringify(k));
// 5) 다시 열어도 고른 언어 그대로(기기 언어보다 우선)
await p.click('[data-lang="en"]');await p.reload();await p.waitForTimeout(700);ok(await p.evaluate(()=>LANG==='en'&&document.querySelector('.t-name').textContent==='Starlight Vein'),'다시 열어도 고른 언어(영어) 그대로');
await p.context().close();
// 6) 한국어 기기: 번역 엔진이 아무것도 건드리지 않음
const q=await open('ko-KR');await q.click('#titleScr');await q.waitForTimeout(300);ok(await q.evaluate(()=>LANG==='ko'&&MISS.size===0&&$('storyT').textContent==='한 통의 편지'&&T('아무 문장')==='아무 문장'),'한국어 기기: 원문 그대로, 번역 엔진은 쉼');
console.log('errors',errs);await b.close()})();
