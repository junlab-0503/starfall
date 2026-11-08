/* ═════════ 소리 (파일 없이 합성하는 8비트 소리 + 칩튠 배경음악) ═════════ */
let AC=null,SFXG=null,BGMG=null,NOISE=null;const lastPlay={};
function audioInit(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();SFXG=AC.createGain();BGMG=AC.createGain();SFXG.connect(AC.destination);BGMG.connect(AC.destination);applyVol();
  const len=AC.sampleRate*.5,buf=AC.createBuffer(1,len,AC.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;NOISE=buf;bgmStart()}catch(e){AC=null}}
function applyVol(){if(!AC)return;const s=S.sound||{sfx:.6,bgm:.3};SFXG.gain.value=s.sfx*.5;BGMG.gain.value=s.bgm*.25}
['pointerdown','keydown'].forEach(ev=>addEventListener(ev,()=>{audioInit();if(AC&&AC.state==='suspended')AC.resume()},{capture:true}));
document.addEventListener('visibilitychange',()=>{if(!AC)return;if(document.hidden)AC.suspend();else AC.resume()});
function tone(f,dur,type='square',vol=.3,at=0,slide=0){if(!AC)return;const t=AC.currentTime+at,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(SFXG);o.start(t);o.stop(t+dur+.02)}
function noise(dur,vol=.3,at=0,lp=3000){if(!AC||!NOISE)return;const t=AC.currentTime+at,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NOISE;f.type='lowpass';f.frequency.value=lp;
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(SFXG);s.start(t);s.stop(t+dur+.02)}
const NOTE=n=>440*Math.pow(2,(n-69)/12);
function sfx(name){if(!AC||!(S.sound?S.sound.sfx:.6))return;const now=performance.now(),gap={hit:45,gain:90,coin:80,floor:90,click:60}[name]||30;if(now-(lastPlay[name]||0)<gap)return;lastPlay[name]=now;
  const L=S.layer||0,deep=1-L/16;
  switch(name){
  case'hit':noise(.06,.35,0,1200+L*60);tone(180*deep+60,.05,'square',.18,0,.6);break;
  case'deny':tone(140,.08,'square',.2);tone(110,.1,'square',.2,.08);break;
  case'break':noise(.22,.45,0,900);tone(220*deep+70,.18,'triangle',.3,0,.4);break;
  case'breakSoft':noise(.12,.2,0,700);break;
  case'gain':tone(NOTE(76),.06,'square',.15);tone(NOTE(83),.08,'square',.15,.05);break;
  case'rare':[76,80,83,88].forEach((n,i)=>tone(NOTE(n),.12,'triangle',.25,i*.06));break;
  case'craft':[72,76,79].forEach((n,i)=>tone(NOTE(n),.12,'square',.18,i*.07));break;
  case'great':[72,76,79,84,88].forEach((n,i)=>tone(NOTE(n),.14,'square',.2,i*.06));[96,100].forEach((n,i)=>tone(NOTE(n),.1,'triangle',.15,.32+i*.05));break;
  case'fail':tone(NOTE(60),.12,'square',.2,0,.7);tone(NOTE(55),.18,'square',.2,.1,.7);break;
  case'coin':tone(NOTE(88),.05,'square',.16);tone(NOTE(93),.14,'square',.16,.05);break;
  case'buy':tone(NOTE(79),.06,'square',.15);tone(NOTE(74),.1,'square',.15,.06);break;
  case'floor':[60,64,67,72].forEach((n,i)=>tone(NOTE(n),.1,'square',.18,i*.07));noise(.1,.2,0,600);break;
  case'tenant':[67,72,76,79,84].forEach((n,i)=>tone(NOTE(n),.16,'triangle',.25,i*.1));break;
  case'unlock':tone(60,.6,'triangle',.4,0,.5);noise(.5,.3,0,400);[72,79,84].forEach((n,i)=>tone(NOTE(n),.2,'triangle',.22,.35+i*.1));break;
  case'sparkle':[88,91,95,100].forEach((n,i)=>tone(NOTE(n),.08,'triangle',.15,i*.05));break;
  case'page':tone(NOTE(84),.05,'triangle',.12);break;
  case'click':tone(NOTE(81),.03,'square',.08);break;}}
/* 배경음악: 조용한 동굴 칩튠 (Am–F–C–G 아르페지오 + 베이스) */
let BGM_T=null,bgmStep=0,bgmNext=0;
function bgmStart(){if(BGM_T||!AC)return;bgmNext=AC.currentTime+.1;BGM_T=setInterval(bgmTick,50)}
const CH=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],MEL=[76,null,74,72,null,69,72,null,74,null,72,69,67,null,69,null];
function bgmTick(){if(!AC||!(S.sound?S.sound.bgm:.3))return;const sp=60/88/2;while(bgmNext<AC.currentTime+.25){const st=bgmStep%64,ch=CH[Math.floor(st/16)%4],t=bgmNext-AC.currentTime;
  const play=(f,d,type,v)=>{const o=AC.createOscillator(),g=AC.createGain(),tt=bgmNext;o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,tt);g.gain.exponentialRampToValueAtTime(.001,tt+d);o.connect(g);g.connect(BGMG);o.start(tt);o.stop(tt+d+.02)};
  play(NOTE(ch[st%3]+12),sp*.9,'triangle',.18);
  if(st%4===0)play(NOTE(ch[0]-12),sp*3.5,'triangle',.3);
  const m=MEL[st%16];if(st>=16&&m&&Math.floor(st/16)%2===1)play(NOTE(m),sp*1.6,'square',.07);
  bgmStep++;bgmNext+=sp}}
