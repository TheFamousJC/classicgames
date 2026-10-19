(() => {
  'use strict';
  const canvas = document.querySelector('#game'), ctx = canvas.getContext('2d');
  const W=720,H=800, $=s=>document.querySelector(s), keys=new Set();
  let state='menu', score=0, wave=1, lives=3, best=0, player, enemies=[], shots=[], hostile=[], particles=[], direction=1, fireTimer=0, enemyTimer=0, clock=0, last=0, sound=false, audio;
  try{best=Number(localStorage.getItem('earth-defence-best'))||0;}catch{}
  const stars=Array.from({length:100},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+.3}));
  function tone(f=400){if(!sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.setValueAtTime(f,audio.currentTime);o.frequency.exponentialRampToValueAtTime(f/2,audio.currentTime+.09);g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.1);o.start();o.stop(audio.currentTime+.11);}catch{}}
  function hud(){$('#score').textContent=String(score).padStart(5,'0');$('#wave').textContent=String(wave).padStart(2,'0');$('#lives').textContent='◆ '.repeat(lives)||'—';$('#best').textContent=String(best).padStart(5,'0');}
  function formation(){enemies=[];direction=1;for(let row=0;row<4;row++)for(let col=0;col<9;col++)enemies.push({x:104+col*64,y:95+row*53,row});enemyTimer=1;hostile=[];shots=[];}
  function start(){score=0;wave=1;lives=3;player={x:W/2,y:H-75,cool:0,inv:1,dash:0};fireTimer=0;formation();state='playing';$('#overlay').style.display='none';$('#pause').hidden=false;hud();}
  function burst(x,y,color){for(let i=0;i<15;i++)particles.push({x,y,vx:(Math.random()-.5)*230,vy:(Math.random()-.5)*230,life:.6,color});}
  function end(){state='over';keys.clear();best=Math.max(best,score);try{localStorage.setItem('earth-defence-best',best);}catch{}hud();$('#overlay').style.display='flex';$('#overlay h3').innerHTML='SIGNAL LOST.<br><em>RISE AGAIN.</em>';$('#overlay p').textContent=`Final score: ${score} · Wave ${wave}`;$('#play').innerHTML='REDEPLOY FIGHTER <span>↗</span>';$('#pause').hidden=true;}
  function pause(){if(state==='playing'){state='paused';$('#pause').textContent='▶';}else if(state==='paused'){state='playing';$('#pause').textContent='Ⅱ';}}
  function update(dt){clock+=dt;if(state!=='playing')return;
    player.cool=Math.max(0,player.cool-dt);player.inv=Math.max(0,player.inv-dt);player.dash=Math.max(0,player.dash-dt);
    const move=(keys.has('right')?1:0)-(keys.has('left')?1:0);
    if(keys.has('dash')&&player.cool===0){player.dash=.17;player.inv=.3;player.cool=2.5;tone(180);}
    player.x=Math.max(24,Math.min(W-24,player.x+move*(player.dash>0?1100:360)*dt));
    fireTimer-=dt;if(keys.has('fire')&&fireTimer<=0){shots.push({x:player.x,y:player.y-22});fireTimer=.17;tone(700);}
    let edge=false;for(const e of enemies){e.x+=direction*(24+wave*9+(36-enemies.length)*1.3)*dt;if(e.x<30||e.x>W-30)edge=true;}
    if(edge){direction*=-1;for(const e of enemies){e.y+=22;e.x=Math.max(30,Math.min(W-30,e.x));}}
    enemyTimer-=dt;if(enemyTimer<=0&&enemies.length){const e=enemies[Math.floor(Math.random()*enemies.length)];hostile.push({x:e.x,y:e.y+18});enemyTimer=Math.max(.18,.85-wave*.055);}
    for(const s of shots)s.y-=650*dt;for(const b of hostile)b.y+=(210+wave*14)*dt;
    for(const s of shots){if(s.y<0)continue;const idx=enemies.findIndex(e=>Math.abs(e.x-s.x)<23&&Math.abs(e.y-s.y)<18);if(idx>=0){const e=enemies[idx];burst(e.x,e.y,e.row<2?'#b8f76a':'#6ddfdb');enemies.splice(idx,1);s.y=-50;score+=10+(3-e.row)*5;tone(230);hud();}}
    for(const b of hostile){if(player.inv<=0&&Math.abs(b.x-player.x)<21&&Math.abs(b.y-player.y)<22){b.y=H+50;lives--;player.inv=1.5;burst(player.x,player.y,'#ff9476');tone(90);hud();if(lives<=0){end();return;}}}
    shots=shots.filter(s=>s.y>0);hostile=hostile.filter(b=>b.y<H+20);
    if(enemies.some(e=>e.y>player.y-32)){end();return;}
    if(!enemies.length){wave++;player.inv=1;formation();hud();}
  }
  function fighter(x,y){ctx.save();ctx.translate(x,y);ctx.shadowBlur=18;ctx.shadowColor='#b8f76a';ctx.fillStyle='#b8f76a';ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(10,-4);ctx.lineTo(24,12);ctx.lineTo(24,20);ctx.lineTo(5,13);ctx.lineTo(0,19);ctx.lineTo(-5,13);ctx.lineTo(-24,20);ctx.lineTo(-24,12);ctx.lineTo(-10,-4);ctx.closePath();ctx.fill();ctx.fillStyle='#102334';ctx.fillRect(-3,-8,6,16);ctx.shadowColor='#6ddfdb';ctx.fillStyle='#6ddfdb';ctx.fillRect(-6,23,12,10+Math.sin(clock*30)*5);ctx.restore();}
  function alien(e){ctx.save();ctx.translate(e.x,e.y);ctx.fillStyle=e.row<2?'#b8f76a':'#68d8db';ctx.globalAlpha=.85;const step=Math.floor(clock*3)%2;const pattern=['00100100','00011000','01111110','11011011','11111111','10100101',step?'10000001':'00100100'];pattern.forEach((line,y)=>[...line].forEach((p,x)=>{if(p==='1')ctx.fillRect((x-4)*5,(y-3)*4,4,3);}));ctx.restore();}
  function render(dt){ctx.fillStyle='#050b18';ctx.fillRect(0,0,W,H);for(const s of stars){s.y=(s.y+dt*(s.r*9))%H;ctx.fillStyle=`rgba(157,190,218,${s.r/3})`;ctx.fillRect(s.x,s.y,s.r,s.r);}
    ctx.strokeStyle='#172a35';ctx.lineWidth=1;ctx.beginPath();ctx.arc(W/2,H+250,410,Math.PI,Math.PI*2);ctx.stroke();ctx.strokeStyle='#122431';ctx.beginPath();ctx.arc(W/2,H+250,430,Math.PI,Math.PI*2);ctx.stroke();
    if(state==='menu'){for(let r=0;r<3;r++)for(let c=0;c<9;c++)alien({x:104+c*64,y:105+r*53,row:r});fighter(W/2,H-75);}else{for(const e of enemies)alien(e);if(player&&(player.inv<=0||Math.floor(clock*14)%2===0))fighter(player.x,player.y);ctx.fillStyle='#b8f76a';for(const s of shots)ctx.fillRect(s.x-2,s.y,4,19);ctx.fillStyle='#ff8a79';for(const b of hostile)ctx.fillRect(b.x-3,b.y,6,13);if(player){ctx.fillStyle='#26374b';ctx.fillRect(player.x-24,player.y+45,48,3);ctx.fillStyle='#6ddfdb';ctx.fillRect(player.x-24,player.y+45,48*(1-player.cool/2.5),3);}}
    particles=particles.filter(p=>p.life>0);for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;ctx.globalAlpha=Math.max(0,p.life/.6);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3);}ctx.globalAlpha=1;
    if(state==='paused'){ctx.fillStyle='#050b18bb';ctx.fillRect(0,0,W,H);ctx.fillStyle='#b8f76a';ctx.font='bold 40px sans-serif';ctx.textAlign='center';ctx.fillText('PAUSED',W/2,H/2);}
  }
  const mapping={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'fire',ShiftLeft:'dash',ShiftRight:'dash'};
  window.addEventListener('keydown',e=>{if(mapping[e.code]){e.preventDefault();keys.add(mapping[e.code]);}if(e.code==='KeyP'&&!e.repeat)pause();});window.addEventListener('keyup',e=>keys.delete(mapping[e.code]));
  window.addEventListener('blur',()=>{keys.clear();if(state==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();if(state==='playing')pause();}});
  for(const id of ['left','right','fire','dash']){const b=$('#'+id);b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(id);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(id));}
  $('#play').onclick=start;$('#pause').onclick=pause;$('#sound').onclick=()=>{sound=!sound;$('#sound').textContent=sound?'SOUND ON':'SOUND OFF';if(sound)tone();};hud();
  function frame(t){const dt=Math.min((t-last)/1000,.035);last=t;update(dt);render(dt);requestAnimationFrame(frame);}requestAnimationFrame(frame);
})();
