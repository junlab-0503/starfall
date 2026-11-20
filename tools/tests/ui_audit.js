// UI 점검(v29): 320×640 · 393×852 · 430×932 × ko/en/zh × 24화면(후반 상태: 큰 골드 · 99층 · 레시피 다 앎 · 아이템 많음 · 세공 +8)
// 글자 넘침(over) · 화면 밖(off) · 부모 상자에 잘림(clip) · 글자가 아이콘을 25% 넘게 덮음(cover, v30) · 12px 미만 글씨(small) · 44px 미만 터치(touch, ::before 투명 확장 포함) · 가로 스크롤
// 사용: node tools/tests/ui_audit.js dist/starfall.html [out.json] [shots]   (shots면 화면마다 shot_폭_언어_화면.png)
const {chromium}=require('playwright');const fs=require('fs');
const html=process.argv[2],out=process.argv[3]||'audit.json',SHOTS=process.argv[4]==='shots';
const RES=[[320,640],[393,852],[430,932]],LANGS=['ko','en','zh'];
const SCREENS=[
 ['mine',"setTab('mine')"],
 ['forge-furn',"S.fgSub='furn';setTab('forge')"],['forge-quick',"S.fgSub='quick';setTab('forge')"],['forge-rec',"S.fgSub='rec';setTab('forge')"],
 ['market-pass',"S.mkSub='pass';setTab('market')"],['market-ore',"S.mkSub='ore';setTab('market')"],
 ['tower',"setTab('tower')"],
 ...[0,1,2,3,4].map(i=>['equip-'+i,`S.shop=${i};setTab('equip')`]),
 ...['store','shaft','book','set','craft'].map(s=>['sheet-'+s,`setTab('mine');openSheet('${s}')`]),
 ['pop-discover',"setTab('mine');discover('voidstone')"],['pop-made',"setTab('forge');discoverMade('starsteel','meteoriron','steel')"],
 ['pop-qty',"S.mkSub='ore';setTab('market');openQty('iron','sell')"],
 ['pop-info',"setTab('forge');itemInfo('starsteel')"],
 ['pop-exit',"setTab('mine');exitAsk()"],
];
const AUDIT=()=>{const vw=innerWidth,vh=innerHeight,res={hs:0,over:[],small:[],touch:[],off:[],clip:[],cover:[]};
  const se=document.scrollingElement;res.hs=Math.max(se.scrollWidth-vw,document.querySelector('main').scrollWidth-document.querySelector('main').clientWidth,0);
  const vis=e=>{if(!e.getClientRects().length)return false;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity===0)return false;let p=e;while(p){if(p.hidden)return false;p=p.parentElement}return true};
  const name=e=>(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).join('.'):'')||e.tagName.toLowerCase();
  const txt=e=>(e.innerText||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,40);
  const layer=document.querySelector('.story:not([hidden])')||(!$('sheet').hidden?$('sheet'):null);   // 팝업이 열려 있으면 그 안만
  const root=layer||document.body;
  for(const e of root.querySelectorAll('*')){if(e.closest('#titleScr,#entry,script,style,canvas,svg,#tut'))continue;if(!vis(e))continue;
    const own=[...e.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim());const r=e.getBoundingClientRect();if(r.width<1||r.height<1)continue;
    if(own){const cs=getComputedStyle(e);const fs=parseFloat(cs.fontSize);
      if(fs<12)res.small.push(`${fs}px ${name(e)} "${txt(e)}"`);
      if(e.scrollWidth>e.clientWidth+1&&e.clientWidth>0&&cs.display!=='inline'&&!e.classList.contains('ndot'))res.over.push(`${name(e)} "${txt(e)}" ${e.scrollWidth}>${e.clientWidth}`);
      // 글자가 단추 · 칸 밖으로
      const box=e.closest('button,.px-btn,.chip,.stat,.seg button,.sect,.ic-btn,.nb');if(box&&box!==e){const b=box.getBoundingClientRect(),rg=document.createRange();rg.selectNodeContents(e);const t=rg.getBoundingClientRect();if(t.right>b.right+1||t.left<b.left-1)res.over.push(`${name(box)}>${name(e)} "${txt(e)}" 글자 ${Math.round(t.width)} > 칸 ${Math.round(b.width)}`)}
      if(box===e){const rg=document.createRange();rg.selectNodeContents(e);const t=rg.getBoundingClientRect();if(t.right>r.right+1||t.left<r.left-1)res.over.push(`${name(e)} "${txt(e)}" 글자 ${Math.round(t.width)} > 단추 ${Math.round(r.width)}`)}
      let sc=e.parentElement,inScroll=false;while(sc){const o=getComputedStyle(sc).overflowX;if(o==='auto'||o==='scroll'){inScroll=true;break}sc=sc.parentElement}
      {const rg=document.createRange();rg.selectNodeContents(e);const t=rg.getBoundingClientRect();let a=e.parentElement;while(a&&a!==document.body){const cs2=getComputedStyle(a);if(/auto|scroll/.test(cs2.overflowY+cs2.overflowX))break;if(/hidden|clip/.test(cs2.overflowY+cs2.overflowX)){const q=a.getBoundingClientRect();if(t.bottom>q.bottom+2||t.top<q.top-2||t.right>q.right+2||t.left<q.left-2)res.clip.push(`${name(e)} "${txt(e)}" in ${name(a)}`);break}a=a.parentElement}}
      if(!inScroll&&(r.right>vw+1||r.left<-1))res.off.push(`${name(e)} "${txt(e)}" x ${Math.round(r.left)}~${Math.round(r.right)}`)}
    if(e.matches('button,.nb,[data-dx],[data-pk],[data-crk],[data-shop],[data-sec],[data-qc],label.set-chk,input[type=range],summary')&&!e.disabled){const pb=getComputedStyle(e,'::before'),ext=pb.content!=='none'&&pb.position==='absolute'&&getComputedStyle(e).position!=='static';const hh=ext?Math.max(r.height,parseFloat(pb.height)||0):r.height,ww=ext?Math.max(r.width,parseFloat(pb.width)||0):r.width;if(hh<44||ww<44)res.touch.push(`${Math.round(r.width)}×${Math.round(r.height)} ${name(e)} "${txt(e)}"`)}}
  // 글자가 그림(아이콘)을 덮는 비율: 단추 안 그림 넓이의 25% 넘게 덮이면 보고
  for(const im of root.querySelectorAll('button img,.ic-btn img')){if(!vis(im))continue;const a=im.getBoundingClientRect();if(a.width<8)continue;const box=im.closest('button,.ic-btn');for(const t of box.querySelectorAll('span,b,small')){if(!vis(t)||!t.textContent.trim())continue;const c=t.getBoundingClientRect(),ix=Math.max(0,Math.min(a.right,c.right)-Math.max(a.left,c.left)),iy=Math.max(0,Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top)),f=ix*iy/(a.width*a.height);if(f>.25)res.cover.push(`${name(box)} "${txt(t)}" 그림의 ${Math.round(f*100)}%`)}}
  for(const k of['over','small','touch','off','clip','cover'])res[k]=[...new Set(res[k])];return res};
(async()=>{const b=await chromium.launch();const R={};const src=fs.readFileSync(html,'utf8');fs.writeFileSync('dbgaudit.html','<!doctype html><html><head><meta charset=utf8><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+src+'</body></html>');
for(const[w,h]of RES)for(const L of LANGS){const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:SHOTS?2:1,isMobile:true,hasTouch:true,locale:L==='zh'?'zh-TW':L==='en'?'en-US':'ko-KR'});
  await c.addInitScript(l=>{try{localStorage.setItem('starfall.lang',l)}catch(e){}},L);const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/dbgaudit.html');await p.waitForTimeout(900);
  await p.evaluate(()=>{$('titleScr').hidden=true;$('entry').hidden=true;STQ.length=0;$('story').hidden=true;S.tutDone=true;S.prologue=true;S.unlocked=13;S.layer=12;S.floors=99;S.gold=987654321098;S.journal=[...Array(13).keys()];
    S.seen=ORDER.slice();S.found=RECIPES.map((r,i)=>i);S.wh=40;S.pick=180;S.auto=150;S.furnace=5;S.intel=9;S.ntq=[];S.ntDone=['셈','핀','루카','미르','린'];CR().met=1;
    for(const k in UPS)if(UPS[k].max!=null&&!UPS[k].lv)S.up[k]=UPS[k].max-1;
    S.inv={};ORDER.forEach((id,i)=>S.inv[id]=12345+i*777);S.box={stariron:9999,meteoriron:8888,coal:777};
    for(let i=0;i<13;i++)S.pass[i]={n:150,c:150*passPrice(i)*.95};S.rentAcc=123456789;
    CR().a={k:'star',n:999,base:7987654,lv:8,t:0};refreshBonus();for(let i=0;i<600;i++)tickMarket(1,false);renderAll()});
  for(const[nm,fn]of SCREENS){await p.evaluate(()=>{STQ.length=0;$('story').hidden=true;['qtyModal','exitModal','adModal','shopModal'].forEach(id=>$(id).hidden=true);if(!$('sheet').hidden)closeSheet()});
    await p.evaluate(fn);await p.waitForTimeout(250);const r=await p.evaluate(AUDIT);R[`${w}x${h} ${L} ${nm}`]=r;
    if(SHOTS)await p.screenshot({path:`shot_${w}_${L}_${nm}.png`})}
  if(errs.length)R[`${w}x${h} ${L} errors`]={errs};await c.close()}
await b.close();fs.writeFileSync(out,JSON.stringify(R,null,1));
// 요약
const sum={over:{},small:{},touch:{},off:{},clip:{},cover:{},hs:[]};for(const[k,v]of Object.entries(R)){if(v.errs){console.log('ERR',k,v.errs);continue}if(v.hs>0)sum.hs.push(k+' '+v.hs);for(const t of['over','small','touch','off','clip','cover'])for(const x of v[t]){(sum[t][x]=sum[t][x]||[]).push(k)}}
for(const t of['over','off','clip','cover','small','touch']){const ks=Object.keys(sum[t]);console.log(`\n== ${t}: ${ks.length}종`);ks.sort((a,b)=>sum[t][b].length-sum[t][a].length).slice(0,t==='touch'||t==='small'?40:80).forEach(x=>console.log(`  [${sum[t][x].length}] ${x}  (${sum[t][x].slice(0,2).join(' | ')})`))}
console.log('\n== 가로 스크롤',sum.hs.length,sum.hs.slice(0,10))})();
