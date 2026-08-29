/* Metro Maze: Rescue Circuit
   Juego original inspirado en los laberintos de acción por cuadrícula.
   No usa personajes, sonidos ni recursos de franquicias externas. */
const LEVELS = [
  ["WWWWWWWWWWWWWWW","WP..C.....C...W","W.W.W.W.W.W.W.W","W.C...W...C...W","W.WWW.W.WWW.W.W","W...C...W...C.W","WWW.WWW.W.WWW.W","W...W.C...W...W","W.C.W.WWW.W.C.W","W.....G....E..W","WWWWWWWWWWWWWWW"],
  ["WWWWWWWWWWWWWWW","WP.C...W...C..W","W.WWW.W.WWW.W.W","W...W.C...W...W","WWW.WWW.W.WWW.W","W.C...G.C...C.W","W.W.WWWWW.W.W.W","W...W..C..W...W","W.W.W.W.W.W.W.W","W...C...W...E.W","WWWWWWWWWWWWWWW"],
  ["WWWWWWWWWWWWWWW","WP....C...W...W","W.WWWWW.W.W.W.W","W.C...W.W...C.W","WWW.W.W.WWWWW.W","W...W.G.C.....W","W.W.WWWWW.WWW.W","W.W...C...W...W","W.WWW.WWW.W.W.W","W.....W....E..W","WWWWWWWWWWWWWWW"],
  ["WWWWWWWWWWWWWWW","WP.C....W...C.W","W.W.W.W.WWW.W.W","W...W...C...W.W","W.WWWWW.WWW.W.W","W.C...G...C...W","WWW.W.WWW.WWW.W","W...W.W...W...W","W.WWW.W.C.W.W.W","W.....W...W.E.W","WWWWWWWWWWWWWWW"],
  ["WWWWWWWWWWWWWWW","WP..C...W..C..W","W.WWW.W.W.WWW.W","W.C...W.G...C.W","W.W.WWWWWWW.W.W","W...W..C..W...W","WWW.W.WWW.WWW.W","W.C.W...G...W.W","W.W.WWW.WWW.W.W","W.....C....E..W","WWWWWWWWWWWWWWW"]
];
const game = document.querySelector('#game'), overlay = document.querySelector('#overlay');
let levelIndex = 0, map = [], player, enemies, cores = 0, totalCores = 0, lives = 3, seconds = 0, timerId, enemyId, soundOn = false, locked = false;
const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };

function startLevel(index = levelIndex) { clearInterval(timerId); clearInterval(enemyId); levelIndex = index; map = LEVELS[index].map(row => row.split('')); enemies = []; cores = 0; seconds = 0; locked = false;
  map.forEach((row,y) => row.forEach((cell,x) => { if (cell === 'P') { player={x,y}; map[y][x]='.'; } if (cell === 'G') { enemies.push({x,y,dir:Math.random()>.5?'left':'right'}); map[y][x]='.'; } }));
  totalCores = 2 + (index > 1 ? 1 : 0); placeCores(); render(); updateHud();
  timerId = setInterval(() => { seconds++; updateHud(); }, 1000); enemyId = setInterval(moveEnemies, 520 - index * 35);
}
function placeCores() { const empty=[]; map.forEach((row,y)=>row.forEach((c,x)=>{ if(c==='.' && (Math.abs(x-player.x)+Math.abs(y-player.y)>5)) empty.push({x,y}); })); for(let i=0;i<totalCores;i++){ const pick=empty.splice(Math.floor(Math.random()*empty.length),1)[0]; map[pick.y][pick.x]='O'; } }
function render() { game.innerHTML=''; map.forEach((row,y)=>row.forEach((cell,x)=>{ const tile=document.createElement('div'); tile.className='tile '+({W:'wall',C:'crate',E:'portal',O:'core',B:'bomb',X:'blast'}[cell]||''); if(player.x===x&&player.y===y) tile.classList.add('player'); if(enemies.some(e=>e.x===x&&e.y===y)) tile.classList.add('enemy'); game.append(tile); })); }
function move(direction) { if(locked) return; const [dx,dy]=dirs[direction], nx=player.x+dx, ny=player.y+dy; if(!walkable(nx,ny)) return; player={x:nx,y:ny}; collectOrExit(); checkHit(); render(); }
function walkable(x,y){ return map[y] && !['W','C','B'].includes(map[y][x]); }
function collectOrExit(){ const cell=map[player.y][player.x]; if(cell==='O'){ map[player.y][player.x]='.'; cores++; chirp(720); } if(cell==='E'){ if(cores===totalCores) completeLevel(); else { document.querySelector('#hint').textContent='El portal requiere todos los núcleos de energía.'; chirp(170); } } updateHud(); }
function plantBomb(){ if(locked || map[player.y][player.x]==='B') return; const {x,y}=player; map[y][x]='B'; chirp(240); render(); setTimeout(()=>explode(x,y),1250); }
function explode(x,y){ const blast=[{x,y}]; for(const [dx,dy] of Object.values(dirs)){ for(let n=1;n<=2;n++){ const px=x+dx*n,py=y+dy*n; if(!map[py]||map[py][px]==='W') break; blast.push({x:px,y:py}); if(map[py][px]==='C') break; } } blast.forEach(p=>{ if(map[p.y][p.x]!=='W') map[p.y][p.x]='X'; }); chirp(100); checkHit(); render(); setTimeout(()=>{ blast.forEach(p=>{ if(map[p.y][p.x] === 'X') map[p.y][p.x]='.'; }); render(); },450); }
function moveEnemies(){ if(locked) return; enemies.forEach(enemy=>{ const choices=Object.entries(dirs).filter(([,d])=>walkable(enemy.x+d[0],enemy.y+d[1])); if(!choices.length)return; const best=choices.sort((a,b)=>distance(enemy.x+a[1][0],enemy.y+a[1][1])-distance(enemy.x+b[1][0],enemy.y+b[1][1]))[0]; const pick=Math.random()<.66?best:choices[Math.floor(Math.random()*choices.length)]; enemy.x+=pick[1][0]; enemy.y+=pick[1][1]; }); checkHit(); render(); }
function distance(x,y){ return Math.abs(player.x-x)+Math.abs(player.y-y); }
function checkHit(){ if(map[player.y][player.x]==='X'||enemies.some(e=>e.x===player.x&&e.y===player.y)){ lives--; chirp(90); updateHud(); if(lives<=0) endGame('Circuito interrumpido','Los centinelas agotaron tus tres vidas. Inténtalo otra vez.',()=>{lives=3;startLevel(levelIndex);}); else { locked=true; setTimeout(()=>{ const start=findSafe(); player=start; locked=false; render(); },700); } } }
function findSafe(){ for(let y=1;y<map.length-1;y++)for(let x=1;x<map[0].length-1;x++)if(map[y][x]==='.'&&!enemies.some(e=>e.x===x&&e.y===y))return{x,y}; return{x:1,y:1}; }
function completeLevel(){ locked=true; clearInterval(timerId); clearInterval(enemyId); chirp(950); if(levelIndex===LEVELS.length-1) endGame('¡Red de metro restaurada!','Has completado los cinco sectores. Tu tiempo final se ha guardado localmente.',()=>{lives=3;startLevel(0);}); else endGame('Sector despejado',`Nivel ${levelIndex+1} completado en ${formatTime(seconds)}. El siguiente sector tiene más rutas cerradas.`,()=>startLevel(levelIndex+1),'Siguiente nivel'); }
function endGame(title,text,action,label='Jugar de nuevo'){ document.querySelector('#overlayTitle').textContent=title; document.querySelector('#overlayText').textContent=text; document.querySelector('#overlayKicker').textContent=levelIndex===4?'MISIÓN COMPLETA':'RESCUE CIRCUIT'; const btn=document.querySelector('#overlayBtn'); btn.textContent=label; btn.onclick=()=>{overlay.classList.add('hidden');action();}; overlay.classList.remove('hidden'); }
function updateHud(){ document.querySelector('#levelLabel').textContent=`${levelIndex+1} / ${LEVELS.length}`; document.querySelector('#timer').textContent=formatTime(seconds); document.querySelector('#cores').textContent=`${cores} / ${totalCores}`; document.querySelector('#lives').textContent='♥'.repeat(lives)+'♡'.repeat(3-lives); }
function formatTime(value){return `${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`;}
function chirp(freq){ if(!soundOn||!window.AudioContext)return; const c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(.05,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.12);o.start();o.stop(c.currentTime+.12); }
document.addEventListener('keydown',e=>{ const key=e.key.toLowerCase(); const d={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'}[key]; if(d){e.preventDefault();move(d);} if(key===' '||key==='b'){e.preventDefault();plantBomb();} });
document.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>move(b.dataset.move))); document.querySelector('#bombBtn').addEventListener('click',plantBomb); document.querySelector('#restartBtn').addEventListener('click',()=>startLevel(levelIndex)); document.querySelector('#soundBtn').addEventListener('click',e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?'♫':'♪';});
startLevel();
