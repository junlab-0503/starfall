// 게임 데이터의 한국어 문장을 구역별로 뽑아 lang/ko.json 으로 (번역 파일은 같은 순서로 한 줄씩)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
fs.writeFileSync('lang_dump_tmp.html','<!doctype html><html><head><meta charset=utf8></head><body>'+fs.readFileSync(process.argv[2],'utf8')+'</body></html>');
await p.addInitScript(()=>{try{localStorage.setItem('starfall.lang','ko')}catch(e){}});await p.goto('file://'+process.cwd()+'/lang_dump_tmp.html');await p.waitForTimeout(800);
const D=await p.evaluate(()=>{const o={};
  o.items=ORDER.map(id=>ITEMS[id].n);o.layers=LAYERS.map(l=>l.n);o.sections=SECTIONS.map(s=>s.n).concat([SKY.n]);
  o.names=SECTIONS.map(s=>s.t.name);o.roles=SECTIONS.map(s=>s.t.role);o.desc=SECTIONS.map(s=>s.t.d);o.bonus=SECTIONS.map(s=>s.t.bonus);o.line=SECTIONS.map(s=>s.t.line);
  o.says=[].concat(...SECTIONS.map(s=>s.t.says));
  o.journal=JOURNAL.slice();o.event=Object.values(LAYER_EVENT);o.proT=PROLOGUE.map(c=>c.t);o.proB=PROLOGUE.map(c=>c.b);o.endT=ENDING.map(c=>c.t);o.endB=ENDING.map(c=>c.b);
  o.tut=[];TUT.forEach(st=>{if(typeof st.t==='string')o.tut.push(st.t)});
  o.intro=[];Object.values(TENANT_INTRO).forEach(a=>a.forEach(c=>{o.intro.push(c.t);o.intro.push(c.b)}));
  o.shopLines=[].concat(...SHOPS.map(s=>s.lines));o.thanks=[].concat(...SHOPS.map(s=>THANKS[s.who]));o.signs=SHOPS.map(s=>SHOP_ART[s.who].sign);
  o.ups=Object.values(UPS).map(u=>u.n);o.shape=Object.values(SHAPE_TXT);o.sect=Object.values(SECT).map(s=>s.n);o.hints=RECIPES.map(r=>r.hint);o.picks=PICK_TIERS.map(t=>t[1]);o.seasons=SEASONS.map(s=>s.n);o.src=Object.keys(SOURCES);
  return o});
let n=0;for(const k in D){n+=D[k].length}console.log(Object.entries(D).map(([k,v])=>k+':'+v.length).join(' '),'total',n,errs);
fs.writeFileSync('/home/user/starfall/lang/ko.json',JSON.stringify(D,null,0).replace(/\],"/g,'],\n"'));await b.close()})();
