(() => {
'use strict';
const $=s=>document.querySelector(s),c=$('#game'),g=c.getContext('2d'),W=720,H=720,keys=new Set();
const spec={gobbler:{name:'Gobbler',color:'#ffda63',description:'Clear every dot while avoiding the hunters. Power cores turn the chase around.',help:'Arrows / WASD: move · P: pause\nCollect every dot to advance. Glowing cores let you eat hunters for a short time.',buttons:[['←','left'],['↑','up'],['↓','down'],['→','right']]},meteors:{name:'Meteors',color:'#83dcff',description:'Pilot a drifting fighter through a field of splitting space rocks.',help:'← → / A D: rotate · ↑ / W: thrust · Space: shoot · P: pause\nDestroy every rock to advance. Your ship wraps around the edges.',buttons:[['↶','left'],['THRUST','up'],['↷','right'],['FIRE','fire']]},gorillaz:{name:'Gorillaz',color:'#ff9b7c',description:'Climb the industrial tower, leap rolling drums, and reach the beacon.',help:'← → / A D: run · ↑ ↓ / W S: climb ladders · Space: jump · P: pause\nReach the green beacon at the top. Jump drums for bonus points.',buttons:[['←','left'],['↑','up'],['↓','down'],['→','right'],['JUMP','fire']]},shooter:{name:'Star Shooter',color:'#c2a1ff',description:'Fly an isometric corridor. Match the flight gates and blast the drones.',help:'← → / A D: strafe · ↑ ↓ / W S: altitude · Space: fire · P: pause\nMatch the cyan gate opening in position and height. Destroy drones at your altitude.',buttons:[['←','left'],['RISE','up'],['LOWER','down'],['→','right'],['FIRE','fire']]}};
let id=new URLSearchParams(location.search).get('game');if(!spec[id])id='gobbler';const cfg=spec[id];document.title=cfg.name+' · Orbit Games by 3Sci Labs';document.documentElement.style.setProperty('--accent',cfg.color);$('#title').textContent=cfg.name.toUpperCase();$('#help').textContent=cfg.help;
let state='menu',score=0,level=1,lives=3,best=0,t=0,game,prev=0;try{best=+localStorage.getItem('orbit-'+id)||0;}catch{}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),rand=(a,b)=>a+Math.random()*(b-a);
function save(){if(score>best){best=score;try{localStorage.setItem('orbit-'+id,best);}catch{}}}
function stats(){save();for(const[k,v]of Object.entries({score,level,lives,best}))$('#'+k).textContent=v;}
function overlay(title,desc,button='PLAY NOW ↗'){$('#message').textContent=title;$('#description').textContent=desc;$('#start').textContent=button;$('#overlay').hidden=false;}
function start(){score=0;level=1;lives=3;keys.clear();game=engines[id]();game.init();state='playing';$('#overlay').hidden=true;$('#pause').textContent='PAUSE';stats();}
function hit(){lives--;stats();if(lives<=0){state='over';keys.clear();overlay('TRY ANOTHER ORBIT',`Score ${score} · Level ${level}\n${cfg.description}`,'PLAY AGAIN ↗');return true;}return false;}
function pause(){if(state==='playing'){state='paused';keys.clear();overlay('TAKE A BREATHER',cfg.help,'RESUME ↗');$('#pause').textContent='RESUME';}else if(state==='paused'){state='playing';$('#overlay').hidden=true;$('#pause').textContent='PAUSE';}}
function text(s,x,y,size=20,color='#fff'){g.fillStyle=color;g.font=`700 ${size}px system-ui`;g.textAlign='center';g.fillText(s,x,y);}
function circle(x,y,r,color){g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
function line(x,y,x2,y2,color,width=2){g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();}
function backdrop(){g.fillStyle='#050c19';g.fillRect(0,0,W,H);for(let i=0;i<75;i++){const x=(i*137.5)%W,y=(i*79.3+t*(id==='shooter'?35:3))%H;circle(x,y,i%3===0?1.4:.7,'#456078');}}
const engines={
gobbler(){
 const layout=['#####################','#o........#........o#','#.###.###.#.###.###.#','#...................#','#.###.#.#####.#.###.#','#.....#...#...#.....#','#####.###.#.###.#####','#.....#.......#.....#','#.###.#.##.##.#.###.#','#...#...........#...#','###.#.###.###.#.#.###','#...#...#...#.#.....#','#.#####.#.#.#.#####.#','#.......#.#.........#','#.###.###.#.###.###.#','#o..#.....#.....#..o#','#.#.#.###.#.###.#.#.#','#.#...............#.#','#.###.#.#####.#.###.#','#.....#.......#.....#','#####################'];
 const S=30,ox=45,oy=45;let dots,p,ghosts,dir,next,power,timer,inv;
 const open=(x,y)=>y>=0&&y<21&&x>=0&&x<21&&layout[y][x]!=='#';
 function actors(){p={x:10,y:19};dir={x:0,y:0};next={x:0,y:0};ghosts=[{x:9,y:9},{x:11,y:9},{x:10,y:7}];power=0;inv=1.5;timer=0;}
 function init(){dots=new Map();layout.forEach((r,y)=>[...r].forEach((v,x)=>{if(v!=='#')dots.set(x+','+y,v==='o'?5:1);}));dots.delete('10,19');actors();}
 function update(dt){power=Math.max(0,power-dt);inv=Math.max(0,inv-dt);for(const[k,d]of [['left',[-1,0]],['right',[1,0]],['up',[0,-1]],['down',[0,1]]])if(keys.has(k))next={x:d[0],y:d[1]};timer+=dt;if(timer<Math.max(.075,.135-level*.004))return;timer=0;
 if(open(p.x+next.x,p.y+next.y))dir={...next};if(open(p.x+dir.x,p.y+dir.y)){p.x+=dir.x;p.y+=dir.y;}const k=p.x+','+p.y;if(dots.has(k)){if(dots.get(k)===5)power=6;score+=dots.get(k)*10;dots.delete(k);stats();}
 function collision(){for(const h of ghosts)if(h.x===p.x&&h.y===p.y){if(power>0){score+=200;h.x=10;h.y=9;stats();}else if(inv<=0){if(!hit())actors();return true;}}return false;}
 if(collision())return;
 for(const h of ghosts){if(Math.random()<(power>0?.5:.15))continue;let options=[[1,0],[-1,0],[0,1],[0,-1]].filter(([x,y])=>open(h.x+x,h.y+y));options.sort((a,b)=>{const da=Math.abs(h.x+a[0]-p.x)+Math.abs(h.y+a[1]-p.y),db=Math.abs(h.x+b[0]-p.x)+Math.abs(h.y+b[1]-p.y);return power>0?db-da:da-db;});const d=options[Math.random()<.23?Math.floor(Math.random()*options.length):0];if(d){h.x+=d[0];h.y+=d[1];}}
 if(collision())return;if(!dots.size){level++;score+=500;init();stats();}}
 function draw(){layout.forEach((r,y)=>[...r].forEach((v,x)=>{if(v==='#'){g.fillStyle='#172e5a';g.fillRect(ox+x*S+2,oy+y*S+2,S-4,S-4);g.strokeStyle='#284b7e';g.strokeRect(ox+x*S+4,oy+y*S+4,S-8,S-8);}}));for(const[k,v]of dots){const[x,y]=k.split(',').map(Number);circle(ox+x*S+15,oy+y*S+15,v===5?6+Math.sin(t*6):2.4,v===5?'#ffda63':'#b8c7e0');}
 const angle=dir.x===-1?Math.PI:dir.y===1?Math.PI/2:dir.y===-1?-Math.PI/2:0;g.fillStyle=inv>0&&Math.floor(t*10)%2?'#fff':'#ffda63';g.beginPath();g.moveTo(ox+p.x*S+15,oy+p.y*S+15);g.arc(ox+p.x*S+15,oy+p.y*S+15,12,angle+.15+Math.abs(Math.sin(t*10))*.35,angle+Math.PI*2-.15-Math.abs(Math.sin(t*10))*.35);g.closePath();g.fill();ghosts.forEach((h,i)=>{const x=ox+h.x*S+15,y=oy+h.y*S+15;const color=power>0?'#5275e9':['#ff7e94','#c2a1ff','#6bd8cf'][i];circle(x,y-2,12,color);g.fillStyle=color;g.fillRect(x-12,y-2,24,13);circle(x-4,y-3,3,'white');circle(x+5,y-3,3,'white');});if(power>0)text('POWER '+power.toFixed(1),360,25,14,'#ffda63');}
 return{init,update,draw};
},
meteors(){let p,rocks,bullets,shot,inv;
 function rock(x,y,r){return{x,y,r,vx:rand(-60,60)*(1+level*.15),vy:rand(-60,60)*(1+level*.15),a:rand(0,6),shape:Array.from({length:10},()=>rand(.7,1.2))};}
 function field(){rocks=[];for(let i=0;i<3+level;i++){const a=rand(0,6.28);rocks.push(rock((p.x+Math.cos(a)*300+W)%W,(p.y+Math.sin(a)*300+H)%H,rand(35,52)));}bullets=[];inv=2;}
 function init(){p={x:360,y:360,vx:0,vy:0,a:-Math.PI/2};shot=0;field();}
 function update(dt){inv=Math.max(0,inv-dt);shot-=dt;p.a+=((keys.has('right')?1:0)-(keys.has('left')?1:0))*3.7*dt;if(keys.has('up')){p.vx+=Math.cos(p.a)*250*dt;p.vy+=Math.sin(p.a)*250*dt;}p.vx*=Math.pow(.995,dt*60);p.vy*=Math.pow(.995,dt*60);const speed=Math.hypot(p.vx,p.vy);if(speed>360){p.vx*=360/speed;p.vy*=360/speed;}p.x=(p.x+p.vx*dt+W)%W;p.y=(p.y+p.vy*dt+H)%H;
 if(keys.has('fire')&&shot<=0){bullets.push({x:p.x+Math.cos(p.a)*20,y:p.y+Math.sin(p.a)*20,vx:Math.cos(p.a)*520+p.vx,vy:Math.sin(p.a)*520+p.vy,life:1.1});shot=.16;}
 for(const b of bullets){b.x=(b.x+b.vx*dt+W)%W;b.y=(b.y+b.vy*dt+H)%H;b.life-=dt;}
 for(const r of rocks){r.x=(r.x+r.vx*dt+W)%W;r.y=(r.y+r.vy*dt+H)%H;r.a+=dt*.3;}
 for(const b of bullets){if(b.life<=0)continue;const i=rocks.findIndex(r=>dist(r,b)<r.r);if(i>=0){const r=rocks.splice(i,1)[0];b.life=0;score+=r.r>25?50:100;if(r.r>22)rocks.push(rock(r.x,r.y,r.r*.57),rock(r.x,r.y,r.r*.57));stats();}}
 bullets=bullets.filter(b=>b.life>0);if(inv<=0&&rocks.some(r=>dist(r,p)<r.r+10)){if(hit())return;p={x:360,y:360,vx:0,vy:0,a:-Math.PI/2};inv=3;}if(!rocks.length){level++;score+=500;field();stats();}}
 function draw(){for(const r of rocks){g.strokeStyle='#83dcff';g.lineWidth=2;g.beginPath();r.shape.forEach((v,i)=>{const a=i/10*Math.PI*2+r.a,x=r.x+Math.cos(a)*r.r*v,y=r.y+Math.sin(a)*r.r*v;i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();g.stroke();}for(const b of bullets)circle(b.x,b.y,2.5,'#ffda63');if(inv<=0||Math.floor(t*10)%2){g.save();g.translate(p.x,p.y);g.rotate(p.a);g.strokeStyle='#ecf4ff';g.lineWidth=2;g.beginPath();g.moveTo(20,0);g.lineTo(-14,-12);g.lineTo(-8,0);g.lineTo(-14,12);g.closePath();g.stroke();if(keys.has('up')){g.fillStyle='#ffb86b';g.beginPath();g.moveTo(-12,-5);g.lineTo(-25-rand(0,13),0);g.lineTo(-12,5);g.fill();}g.restore();}text('SECTOR '+level,360,35,13,'#83dcff');}
 return{init,update,draw};
},
gorillaz(){const floors=[650,525,400,275,150],ladders=[580,140,580,140];let p,barrels,spawn,inv,jumpHeld;
 function reset(){p={x:75,y:650,vy:0,floor:0,climb:false};inv=2;}
 function init(){reset();barrels=[];spawn=.8;jumpHeld=false;}
 function update(dt){inv=Math.max(0,inv-dt);const dx=(keys.has('right')?1:0)-(keys.has('left')?1:0),up=keys.has('up'),down=keys.has('down'),ground=Math.abs(p.y-floors[p.floor])<.5&&!p.climb;
 if(!p.climb&&ground){if(up&&p.floor<4&&Math.abs(p.x-ladders[p.floor])<24)p.climb=true;else if(down&&p.floor>0&&Math.abs(p.x-ladders[p.floor-1])<24){p.floor--;p.climb=true;}}
 if(p.climb){p.x=ladders[p.floor];p.y+=((down?1:0)-(up?1:0))*150*dt;if(p.y<=floors[p.floor+1]){p.floor++;p.y=floors[p.floor];p.climb=false;}else if(p.y>=floors[p.floor]){p.y=floors[p.floor];p.climb=false;}}
 else{p.x=clamp(p.x+dx*210*dt,45,675);if(keys.has('fire')&&!jumpHeld&&ground)p.vy=-390;p.vy+=1000*dt;p.y+=p.vy*dt;if(p.y>=floors[p.floor]){p.y=floors[p.floor];p.vy=0;}}
 jumpHeld=keys.has('fire');spawn-=dt;if(spawn<=0){barrels.push({x:90,y:150,floor:4,dir:1,fall:false,passed:false});spawn=Math.max(.65,2.3-level*.17);}
 for(const b of barrels){if(b.fall){b.y+=280*dt;if(b.y>=floors[b.floor]){b.y=floors[b.floor];b.fall=false;b.dir*=-1;b.passed=false;}}else{b.x+=b.dir*(120+level*15)*dt;if(b.x>660||b.x<60){if(b.floor===0){b.dead=true;continue;}b.x=clamp(b.x,60,660);b.floor--;b.fall=true;}}
 if(!b.passed&&Math.abs(b.x-p.x)<20&&p.y<b.y-35&&p.y>b.y-120){score+=50;b.passed=true;stats();}if(inv<=0&&Math.abs(b.x-p.x)<24&&Math.abs((b.y-12)-(p.y-19))<28){if(hit())return;reset();}}
 barrels=barrels.filter(b=>!b.dead);if(p.floor===4&&p.x>600){score+=1000;level++;init();stats();}}
 function draw(){for(let i=0;i<5;i++){g.fillStyle='#263a50';g.fillRect(35,floors[i]+3,650,12);for(let x=45;x<680;x+=35)line(x,floors[i]+15,x+18,floors[i]+3,'#ff9b7c',2);if(i<4){const x=ladders[i];line(x-13,floors[i],x-13,floors[i+1],'#81c5dd');line(x+13,floors[i],x+13,floors[i+1],'#81c5dd');for(let y=floors[i+1]+10;y<floors[i];y+=17)line(x-13,y,x+13,y,'#81c5dd');}}
 text('GORILLAZ',105,60,21,'#ff9b7c');g.fillStyle='#b36f59';g.fillRect(66,97,75,40);circle(104,98,26,'#b36f59');circle(96,95,3,'#fff');circle(112,95,3,'#fff');text('◈',635,125,36,'#b8f76a');for(const b of barrels){circle(b.x,b.y-13,13,'#a76348');g.strokeStyle='#ffce8c';g.lineWidth=2;g.strokeRect(b.x-9,b.y-22,18,18);line(b.x-9,b.y-22,b.x+9,b.y-4,'#ffce8c');}
 if(inv<=0||Math.floor(t*10)%2){circle(p.x,p.y-33,10,'#ffda9a');g.fillStyle='#79c7ff';g.fillRect(p.x-10,p.y-24,20,18);line(p.x-6,p.y-6,p.x-9,p.y,'#fff',5);line(p.x+6,p.y-6,p.x+9,p.y,'#fff',5);}text('REACH THE BEACON →',490,55,13,'#b8f76a');}
 return{init,update,draw};
},
shooter(){let p,items,bullets,spawn,shot,inv,progress,nextGate;
 const project=(x,d,z)=>({x:360+x*.72+d*.23,y:625-d*.61+x*.17-z*.72});
 function init(){p={x:0,z:85};items=[];bullets=[];spawn=.5;shot=0;inv=2;progress=0;nextGate=4;}
 function update(dt){inv=Math.max(0,inv-dt);p.x=clamp(p.x+((keys.has('right')?1:0)-(keys.has('left')?1:0))*270*dt,-260,260);p.z=clamp(p.z+((keys.has('up')?1:0)-(keys.has('down')?1:0))*170*dt,20,210);shot-=dt;progress+=dt;const speed=170+level*18;
 if(keys.has('fire')&&shot<=0){bullets.push({x:p.x,z:p.z,d:15});shot=.16;}for(const b of bullets)b.d+=650*dt;
 spawn-=dt;if(spawn<=0){items.push({type:'drone',x:rand(-230,230),z:rand(35,190),d:950});spawn=Math.max(.3,1.05-level*.06);}
 nextGate-=dt;if(nextGate<=0){items.push({type:'gate',x:rand(-135,135),z:rand(60,170),d:950});nextGate=4;}
 for(const a of items){a.d-=speed*dt;if(a.type==='drone'){a.x=clamp(a.x+Math.sin(t*2+a.z)*25*dt,-250,250);for(const b of bullets)if(!b.dead&&Math.abs(b.d-a.d)<32&&Math.abs(b.x-a.x)<35&&Math.abs(b.z-a.z)<28){a.dead=true;b.dead=true;score+=100;stats();break;}}
 if(a.d<=0&&!a.checked&&!a.dead){a.checked=true;const impact=a.type==='gate'?(Math.abs(p.x-a.x)>66||Math.abs(p.z-a.z)>43):(Math.abs(p.x-a.x)<38&&Math.abs(p.z-a.z)<32);if(impact&&inv<=0){if(hit())return;inv=2;}else if(!impact){score+=a.type==='gate'?250:10;stats();}}}
 items=items.filter(a=>a.d>-70&&!a.dead);bullets=bullets.filter(b=>b.d<1100&&!b.dead);if(progress>=22){progress=0;level++;score+=500;stats();}}
 function draw(){const quad=(points,color)=>{g.fillStyle=color;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.fill();};quad([project(-300,0,0),project(300,0,0),project(300,1100,0),project(-300,1100,0)],'#111e35');
 for(let d=0;d<1100;d+=100){const a=project(-300,(d+t*(170+level*18))%1100,0),b=project(300,(d+t*(170+level*18))%1100,0);line(a.x,a.y,b.x,b.y,'#2b3d5c');}for(const x of [-300,-150,0,150,300]){const a=project(x,0,0),b=project(x,1100,0);line(a.x,a.y,b.x,b.y,'#2b3d5c');}for(const x of [-300,300]){const a=project(x,0,10),b=project(x,1100,10);line(a.x,a.y,b.x,b.y,'#c2a1ff',3);}
 for(const a of [...items].sort((a,b)=>b.d-a.d)){if(a.type==='gate'){const l=project(a.x-70,a.d,a.z-45),r=project(a.x+70,a.d,a.z-45),lt=project(a.x-70,a.d,a.z+45),rt=project(a.x+70,a.d,a.z+45);line(l.x,l.y,r.x,r.y,'#6df1db',4);line(l.x,l.y,lt.x,lt.y,'#6df1db',4);line(r.x,r.y,rt.x,rt.y,'#6df1db',4);line(lt.x,lt.y,rt.x,rt.y,'#6df1db',4);const left=project(-300,a.d,a.z),right=project(300,a.d,a.z),mid=project(a.x,a.d,a.z);line(left.x,left.y,mid.x-58,mid.y-14,'#ff7e9466',8);line(mid.x+58,mid.y+14,right.x,right.y,'#ff7e9466',8);}else{const q=project(a.x,a.d,a.z),s=project(a.x,a.d,0);circle(s.x,s.y,11,'#0008');quad([{x:q.x,y:q.y-12},{x:q.x+22,y:q.y},{x:q.x,y:q.y+12},{x:q.x-22,y:q.y}],'#ff8c9d');circle(q.x,q.y,4,'#fff');}}
 for(const b of bullets){const q=project(b.x,b.d,b.z);line(q.x,q.y,q.x+5,q.y-13,'#ffda63',3);}const shadow=project(p.x,0,0);g.fillStyle='#0008';g.beginPath();g.ellipse(shadow.x,shadow.y,25,9,0,0,Math.PI*2);g.fill();const q=project(p.x,0,p.z);if(inv<=0||Math.floor(t*12)%2){quad([{x:q.x+7,y:q.y-25},{x:q.x+25,y:q.y+12},{x:q.x,y:q.y+4},{x:q.x-24,y:q.y+7}],'#c2a1ff');line(q.x,q.y+6,q.x-4,q.y+22+Math.sin(t*25)*6,'#ffcc78',5);}text('ALT '+Math.round(p.z),90,35,15,'#6df1db');text('SECTOR '+level+' · '+Math.floor(progress)+'/22',550,35,13,'#c2a1ff');g.fillStyle='#24354d';g.fillRect(25,70,8,180);g.fillStyle='#6df1db';g.fillRect(25,250-p.z/210*180,8,5);}
 return{init,update,draw};
}};
const mapping={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'fire'};
window.addEventListener('keydown',e=>{if(mapping[e.code]){e.preventDefault();keys.add(mapping[e.code]);}if(e.code==='KeyP'&&!e.repeat)pause();});window.addEventListener('keyup',e=>keys.delete(mapping[e.code]));window.addEventListener('blur',()=>{keys.clear();if(state==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause();});
for(const[label,key]of cfg.buttons){const b=document.createElement('button');b.textContent=label;b.setAttribute('aria-label',key);b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(key);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(key));$('#touch').append(b);}
$('#start').onclick=()=>state==='paused'?pause():start();$('#pause').onclick=pause;game=engines[id]();game.init();overlay(cfg.name.toUpperCase(),cfg.description+'\n'+cfg.help);stats();
function frame(now){const dt=Math.min((now-prev)/1000,.035);prev=now;if(state==='playing'){t+=dt;game.update(dt);}backdrop();game.draw();requestAnimationFrame(frame);}requestAnimationFrame(frame);
})();
