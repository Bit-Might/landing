(()=>{
const W=1280,H=714;
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const scoreValue=document.getElementById('scoreValue');
const windName=document.getElementById('windName');
const windDescription=document.getElementById('windDescription');
const stage=document.querySelector('.stage');
const dpr=Math.max(1,Math.min(2,devicePixelRatio||1));
canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
 
const field={left:438,right:848,top:213,bottom:507};
const PADDLE_START_H=70, PADDLE_MIN_H=18, PADDLE_SHRINK=7;
const target={x:800,w:12,h:PADDLE_START_H,minY:228,maxY:448};
const start={x:566,y:390};
const ball={x:start.x,y:start.y,r:7,vx:0,vy:0,active:false,escaping:false};
const mouse={x:target.x,y:start.y,inside:false};
let targetY=236,targetDir=1,score=0,flash=0,last=performance.now();
let winds=[];
let currentWind=null;
let bounces=0;
const MAX_BOUNCES=10, INITIAL_SPEED=400, MIN_SPEED=150, MAX_SPEED=1000, BOUNCE_DAMPING=0.985, TIME_DAMPING=0.999;
 
// --- Ветер: направления заданы как экранные векторы (x вправо+, y вниз+),
// т.к. север — это верх экрана. "Дует с СЗ" значит поток идёт на ЮВ и т.д.
const DIR_N =[0,1];                              // с севера -> вниз
const DIR_S =[0,-1];                             // с юга -> вверх
const DIR_NW=[0.7071,0.7071];                    // с СЗ -> на ЮВ
const DIR_NE=[-0.7071,0.7071];                   // с СВ -> на ЮЗ
const DIR_SE=[-0.7071,-0.7071];                  // с ЮВ -> на СЗ
const DIR_W =[1,0];                              // с запада -> на восток
const windArrowEl=document.getElementById('windArrow');
const BASE_WIND_ACCEL=400; // px/s^2 для силы (strength) = 1
const WIND_PHYSICS={
 'Верховик (Ангара, Север или Сивер)':{dir:DIR_N, mode:'constant', strength:1},
 'Култук (Низовик)':                  {dir:DIR_S, mode:'gusty',    strength:1},
 'Горный':                             {dir:DIR_NW,mode:'gusty',    strength:1.15},
 'Сарма':                              {dir:DIR_NW,mode:'gusty',    strength:2.3},
 'Баргузин':                           {dir:DIR_NE,mode:'constant', strength:1},
 'Шелонник':                           {dir:DIR_SE,mode:'constant', strength:1},
 'Селенга':                            {dir:DIR_SE,mode:'constant', strength:1},
 'Бугульдейка':                        {dir:DIR_W, mode:'gusty',    strength:1.1},
 'Тархаиха':                           {dir:DIR_NW,mode:'constant', strength:1.7},
 'Покатуха':                           {dir:null,  mode:'gusty-random', strength:2},
};
let windState=null;
function makeWindState(physics){
 if(!physics) return null;
 const state={physics,t:0,freq:0.8+Math.random()*1.1,phase:Math.random()*Math.PI*2};
 if(physics.mode==='gusty-random'){
   const a=Math.random()*Math.PI*2;
   state.dir=[Math.cos(a),Math.sin(a)];
   state.nextDirChange=0.5+Math.random()*0.8;
 } else {
   state.dir=physics.dir;
 }
 return state;
}
function windAccel(state,dt){
 if(!state) return [0,0];
 state.t+=dt;
 const p=state.physics;
 let dir=state.dir, factor;
 if(p.mode==='constant'){
   factor=1;
 } else {
   // Порывистость: неравномерные всплески силы вместо ровного давления.
   factor=0.2+0.85*Math.max(0,Math.sin(state.t*state.freq+state.phase))
             +0.35*Math.max(0,Math.sin(state.t*state.freq*2.6+state.phase*1.7));
   if(p.mode==='gusty-random' && state.t>=state.nextDirChange){
     const a=Math.random()*Math.PI*2;
     state.dir=[Math.cos(a),Math.sin(a)];
     dir=state.dir;
     state.nextDirChange=state.t+0.5+Math.random()*0.8;
   }
 }
 const mag=BASE_WIND_ACCEL*p.strength*factor;
 return [dir[0]*mag,dir[1]*mag];
}
function updateWindArrow(){
 if(!windArrowEl)return;
 if(!currentWind||!windState){
   windArrowEl.className='wind-arrow calm';
   windArrowEl.textContent='';
   return;
 }
 const p=windState.physics;
 windArrowEl.className='wind-arrow'+(p.mode!=='constant'?' gust':'');
 windArrowEl.textContent='➤';
 const dir=p.mode==='gusty-random'?windState.dir:p.dir;
 const angle=Math.atan2(dir[1],dir[0])*180/Math.PI;
 windArrowEl.style.transform='rotate('+angle+'deg)';
}
 
function pointFromEvent(e){
 const r=canvas.getBoundingClientRect();
 return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};
}
function setMouse(e){const p=pointFromEvent(e);mouse.x=p.x;mouse.y=p.y;mouse.inside=true;}
function resetBall(){ball.x=start.x;ball.y=start.y;ball.vx=0;ball.vy=0;ball.active=false;ball.escaping=false;bounces=0;targetY=Math.min(targetY,target.maxY);selectRandomWind();}
const CALM_NAME='Безветрие';
const CALM_DESCRIPTION='Воздух неподвижен.';
function selectRandomWind(){
 if(!winds.length)return;
 // Каждый раунд: 50% штиль (без ветра), 50% случайный ветер из списка.
 const isCalm=Math.random()<0.5;
 if(isCalm){
   currentWind=null;
   windState=null;
   windName.textContent=CALM_NAME;
   windDescription.textContent=CALM_DESCRIPTION;
   updateWindArrow();
   return;
 }
 currentWind=winds[Math.floor(Math.random()*winds.length)];
 windState=makeWindState(WIND_PHYSICS[currentWind.name]||null);
 windName.textContent=currentWind.name;
 windDescription.textContent=currentWind.description;
 updateWindArrow();
}
function serve(){
 if(ball.active)return;
 let dx=mouse.x-ball.x,dy=mouse.y-ball.y;
 // Do not allow an accidental click exactly on the ball to create a zero vector.
 if(Math.hypot(dx,dy)<8) return;
 const len=Math.hypot(dx,dy);
 const speed=INITIAL_SPEED;
 ball.vx=dx/len*speed;ball.vy=dy/len*speed;ball.active=true;bounces=0;
}
canvas.addEventListener('mousemove',setMouse);
canvas.addEventListener('mouseenter',e=>{setMouse(e)});
canvas.addEventListener('mouseleave',()=>mouse.inside=false);
canvas.addEventListener('click',e=>{setMouse(e);if(!ball.active)serve()});
window.addEventListener('keydown',e=>{
 if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!ball.active)serve()}
 if(e.code==='KeyR'){score=0;target.h=PADDLE_START_H;targetY=236;targetDir=1;resetBall()}
});
 
function hit(c,r){
 const qx=Math.max(r.x,Math.min(c.x,r.x+r.w));
 const qy=Math.max(r.y,Math.min(c.y,r.y+r.h));
 return Math.hypot(c.x-qx,c.y-qy)<=c.r;
}
function success(){
 score++;
 target.h=Math.max(PADDLE_MIN_H, PADDLE_START_H-score*PADDLE_SHRINK);
 // Keep the shrinking paddle inside its vertical travel range.
 targetY=Math.max(target.minY,Math.min(targetY,target.maxY));
 flash=.75;resetBall();
}
function fail(){
 score=Math.max(0,score-1);
 flash=.75;resetBall();
}
function update(dt){
 targetY+=targetDir*110*dt;
 if(targetY<=target.minY){targetY=target.minY;targetDir=1}
 if(targetY>=target.maxY){targetY=target.maxY;targetDir=-1}
 if(!ball.active)return;
 if(ball.escaping){
   // Шарик уже проиграл — просто летит по прямой за пределы экрана,
   // без столкновений со стенами и платформой, и уже там запускает рестарт.
   ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
   if(ball.x-ball.r>W){fail();}
   return;
 }
 const prevX=ball.x, prevY=ball.y;
 // Ветер толкает мяч в полёте — до столкновений со стенами/платформой.
 if(windState){
   const acc=windAccel(windState,dt);
   ball.vx+=acc[0]*dt;
   ball.vy+=acc[1]*dt;
   if(windState.physics.mode==='gusty-random') updateWindArrow();
 }
 ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
 // Очень плавное затухание скорости во время полёта — шар не теряет ход раньше времени.
 const timeDamp=Math.pow(TIME_DAMPING,dt*60);
 ball.vx*=timeDamp;ball.vy*=timeDamp;
 // Ветер может разгонять мяч — не даём скорости уйти в неконтролируемый разнос.
 {
   const spd=Math.hypot(ball.vx,ball.vy);
   if(spd>MAX_SPEED){const s=MAX_SPEED/spd;ball.vx*=s;ball.vy*=s;}
 }
 const bounce=()=>{
   bounces++;
   const factor=BOUNCE_DAMPING;
   ball.vx*=factor;ball.vy*=factor;
   const speed=Math.hypot(ball.vx,ball.vy);
   if(speed<MIN_SPEED){
     const scale=MIN_SPEED/(speed||1);
     ball.vx*=scale;ball.vy*=scale;
   }
   if(bounces>=MAX_BOUNCES){fail();return false;}
   return true;
 };
 if(ball.y-ball.r<=field.top){ball.y=field.top+ball.r;ball.vy=Math.abs(ball.vy);if(!bounce())return}
 if(ball.y+ball.r>=field.bottom){ball.y=field.bottom-ball.r;ball.vy=-Math.abs(ball.vy);if(!bounce())return}
 if(ball.x-ball.r<=field.left){ball.x=field.left+ball.r;ball.vx=Math.abs(ball.vx);if(!bounce())return}
 const tr={x:target.x,w:target.w,y:targetY,h:target.h};
 if(ball.vx>0&&hit(ball,tr)){success();return}
 // Платформа — единственное, что может остановить мяч. Если он миновал её
 // и всё-таки долетел до правой стены, значит платформа уже упустила свой
 // шанс — мяч улетает в окно за ней и летит дальше, за пределы экрана,
 // где и сработает рестарт (см. ветку ball.escaping в начале update).
 if(ball.vx>0 && prevX+ball.r<field.right && ball.x+ball.r>=field.right){
   ball.escaping=true;
   return;
 }
}
 
function syncBadges(){
 scoreValue.textContent=score;
}
 
// --- Фоновая музыка ---
// Браузеры блокируют автозапуск звука без жеста пользователя. Нажатие
// кнопки «ИГРАТЬ» на интро-экране — как раз такой жест, поэтому музыку
// включаем сразу после него (см. блок интро ниже).
const bgm=document.getElementById('bgm');
bgm.volume=0.5;
let musicStarted=false;
function tryStartMusic(){
 if(musicStarted) return;
 bgm.play().then(()=>{musicStarted=true;}).catch(()=>{/* попробуем при следующем жесте */});
}
canvas.addEventListener('click',tryStartMusic);
window.addEventListener('keydown',tryStartMusic);
 
// --- Интро-гиф перед стартом игры ---
// GIF зациклен сам по себе и не даёт события «конец», поэтому просто
// проигрывается на фоне, а кнопка «ИГРАТЬ» в любой момент запускает игру.
const introOverlay=document.getElementById('introOverlay');
const introStart=document.getElementById('introStart');
const rulesOverlay=document.getElementById('rulesOverlay');
const rulesStart=document.getElementById('rulesStart');
 
// Интро -> экран с правилами (музыка ещё не запускается, чтобы не
// перебивать её потом при старте игры).
function showRules(){
 introOverlay.classList.add('hidden');
 introOverlay.addEventListener('transitionend',()=>{
   introOverlay.style.display='none';
 },{once:true});
 rulesOverlay.classList.add('show');
}
// Экран с правилами -> сама игра.
function startGame(){
 rulesOverlay.classList.remove('show');
 tryStartMusic();
 rulesOverlay.addEventListener('transitionend',()=>{
   rulesOverlay.style.display='none';
 },{once:true});
}
introStart.addEventListener('click',showRules);
rulesStart.addEventListener('click',startGame);
 
function draw(){
 ctx.clearRect(0,0,W,H);
 // The background has no baked-in paddle/ball/table; all game elements below are live.
 ctx.save();ctx.shadowColor='rgba(255,150,0,.55)';ctx.shadowBlur=10;ctx.fillStyle='#ff9800';ctx.fillRect(target.x,targetY,target.w,target.h);ctx.restore();
 ctx.save();ctx.shadowColor='rgba(255,150,0,.6)';ctx.shadowBlur=9;ctx.fillStyle='#ff9800';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();ctx.restore();
 syncBadges();
 if(flash>0){ctx.save();ctx.fillStyle=score>0?'rgba(255,180,40,.10)':'rgba(255,80,40,.10)';ctx.fillRect(0,0,W,H);ctx.restore()}
}
function loop(now){const dt=Math.min(.025,(now-last)/1000);last=now;update(dt);flash=Math.max(0,flash-dt);draw();requestAnimationFrame(loop)}
draw();
 
function normalizeWinds(data){
  return Array.isArray(data) ? data.filter(w=>w&&w.name&&w.description) : [];
}
function showWinds(data){
  winds=normalizeWinds(data);
  if(winds.length) selectRandomWind();
  else {
    windName.textContent='Ветер не загружен';
    windDescription.textContent='Не удалось найти список ветров.';
  }
}
 
// В обычном web-сервере читаем winds.json — это основной источник данных.
// При запуске index.html напрямую через file:// браузеры часто блокируют fetch()
// локального JSON из-за CORS. Поэтому используем сгенерированный из того же JSON
// резервный массив WINDS_DATA, чтобы игра работала и без локального сервера.
fetch('assets/winds.json')
  .then(r=>{if(!r.ok) throw new Error('HTTP '+r.status); return r.json();})
  .then(showWinds)
  .catch(err=>{
    console.warn('winds.json не загружен, использую локальную копию:', err);
    showWinds(window.WINDS_DATA || []);
  });
 
requestAnimationFrame(loop);
})();
 

