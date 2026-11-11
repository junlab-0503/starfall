// 사용: node tools/export_minerals.js dist/starfall.html exports/minerals  (먼저 python3 tools/build.py)
// 게임 안 광물 아이콘(32×32 도트)을 8배로 키워 이름과 함께 PNG로 저장 + 한 장짜리 모음
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const OUT=process.argv[3];
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.setContent(fs.readFileSync(process.argv[2],'utf8'));await p.waitForTimeout(800);
const res=await p.evaluate(async()=>{await document.fonts.load('24px Galmuri11');await document.fonts.load('20px Galmuri9');
  const SC=8,ICON=32*SC,raw=RAW.slice(),cr=ORDER.filter(id=>INS[id]).sort((a,b)=>itemLayer(a)-itemLayer(b)||ITEMS[a].p-ITEMS[b].p),other=['slag'];
  const card=(id)=>{const it=ITEMS[id],ic=drawIcon(id,32).canvas(1),W=288,H=ICON+76,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
    // 판: 따뜻한 짙은 갈색 + 갈색 이중 선(게임 테두리와 같게)
    x.fillStyle='#2a1a0e';x.fillRect(0,0,W,H);x.fillStyle='#6e4c2e';x.fillRect(3,3,W-6,H-6);x.fillStyle='#241a12';x.fillRect(5,5,W-10,H-10);
    x.drawImage(ic,(W-ICON)/2,10,ICON,ICON);
    x.font='24px Galmuri11';x.textAlign='center';x.textBaseline='alphabetic';x.fillStyle='#efe2c8';x.fillText(it.n,W/2,ICON+44);
    x.font='20px Galmuri9';x.fillStyle='#b29c80';const sub=it.L?`B${it.L} ${LAYERS[it.L-1].n}`:INS[id]?`재련품 · B${itemLayer(id)}`:'찌꺼기';x.fillText(sub,W/2,ICON+68);
    return c};
  const out=[];const grp=[['1_원석',raw],['2_재련품',cr],['3_기타',other]];
  for(const[g,ids]of grp)ids.forEach((id,i)=>{const c=card(id),nm=`${String(i+1).padStart(2,'0')}_${ITEMS[id].n}`;out.push({g,name:nm,url:c.toDataURL('image/png')});
    // 아이콘만(배경 투명, 256×256)
    const ic=drawIcon(id,32).canvas(1),t=document.createElement('canvas');t.width=t.height=ICON;const tx=t.getContext('2d');tx.imageSmoothingEnabled=false;tx.drawImage(ic,0,0,ICON,ICON);out.push({g:'아이콘만_투명배경/'+g,name:nm,url:t.toDataURL('image/png')})});
  // 모음 한 장: 원석 · 재련품 · 기타 순, 한 줄에 8개
  const cols=8,cw=288,chh=ICON+76,gap=8,title=56,rowsOf=n=>Math.ceil(n/cols);let H=gap;grp.forEach(([g,ids])=>H+=title+rowsOf(ids.length)*(chh+gap));
  const S=document.createElement('canvas');S.width=cols*(cw+gap)+gap;S.height=H;const x=S.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#1b140e';x.fillRect(0,0,S.width,S.height);
  let y=gap;for(const[g,ids]of grp){x.font='48px Galmuri11B';x.fillStyle='#ffe9a8';x.textAlign='left';x.textBaseline='middle';x.fillText(`${g.slice(2)} (${ids.length})`,gap+4,y+title/2);y+=title;
    ids.forEach((id,i)=>{x.drawImage(card(id),gap+(i%cols)*(cw+gap),y+Math.floor(i/cols)*(chh+gap))});y+=rowsOf(ids.length)*(chh+gap)}
  out.push({g:'',name:'_전체_모음',url:S.toDataURL('image/png')});return out});
fs.mkdirSync(OUT,{recursive:true});for(const r of res){const d=path.join(OUT,r.g);fs.mkdirSync(d,{recursive:true});fs.writeFileSync(path.join(d,r.name+'.png'),Buffer.from(r.url.split(',')[1],'base64'))}
console.log(res.length,'files');await b.close()})();
