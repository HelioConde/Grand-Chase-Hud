'use strict';
(() => {
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
const roster={elesis:{name:'Elesis',portrait:1,color:'#f16b82',speed:265,attack:20,reach:85},lire:{name:'Lire',portrait:2,color:'#a1db70',speed:270,attack:15,reach:175},arme:{name:'Arme',portrait:3,color:'#caa3ff',speed:240,attack:17,reach:150},lass:{name:'Lass',portrait:4,color:'#92cfff',speed:320,attack:18,reach:95}};
const param=new URLSearchParams(location.search).get('char');
const hero=roster[param]||roster.elesis;
$('name').textContent=hero.name;$('portrait').src='img/char_'+hero.portrait+'.png';
const visual3d=createModelRenderer();
const W=960,H=540,ground=463,world=2420,keys=new Set(),gravity=1750;
let player,enemies,particles,portal,score,kills,state,last=0,camera=0,spawnTimer=0,noticeTimer=0,muted=false;
let audio;

function createModelRenderer(){
  const result={ready:false,visible:false,draw:()=>{}};
  const assets={
    elesis:{obj:'models/elesis/Elesis.obj',mtl:'models/elesis/Elesis.mtl',rotation:[1.4,3.15,5.38]},
    lire:{obj:'models/lire/Lire.obj',mtl:'models/lire/Lire.obj.mtl',rotation:[1.4,3.15,5.38]},
    arme:{obj:'models/arme/arme.obj',mtl:'models/arme/arme.obj.mtl',rotation:[1.4,3.15,5.38]},
    lass:{obj:'models/lass/Lass.obj',mtl:'models/lass/Lass.obj.mtl',rotation:[1.4,3.15,5.38]}
  };
  const selected=assets[param]||assets.elesis;
  if(typeof THREE==='undefined'||!THREE.OBJLoader||!THREE.MTLLoader)return result;
  try{
    const scene=new THREE.Scene();
    const camera3d=new THREE.OrthographicCamera(-4.8,4.8,2.7,-2.7,.01,100);
    camera3d.position.set(0,0,15);camera3d.lookAt(0,0,0);
    scene.add(new THREE.AmbientLight(0xffffff,.85));
    const light=new THREE.DirectionalLight(0xffffff,.8);light.position.set(3,6,8);scene.add(light);
    const renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,preserveDrawingBuffer:true});
    renderer.setPixelRatio(1);
    renderer.setSize(960,540,false);
    // Use a distinctive chroma-key background; composite only 3D pixels onto the 2D arena.
    renderer.setClearColor(0xff00ff,1);
    // The WebGL canvas stays offscreen and never covers the 2D level.
    const anchor=new THREE.Group();scene.add(anchor);
    const holder=new THREE.Group();anchor.add(holder);
    const loader=new THREE.MTLLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(selected.mtl,materials=>{
      materials.preload();
      const objloader=new THREE.OBJLoader();objloader.setMaterials(materials);
      objloader.load(selected.obj,mesh=>{
        // Keep the same source model orientation used by the original character-selection screen.
        mesh.rotation.set(selected.rotation[0],selected.rotation[1],selected.rotation[2]);
        holder.add(mesh);
        mesh.traverse(node=>{if(node instanceof THREE.Mesh){node.frustumCulled=false;const mats=Array.isArray(node.material)?node.material:[node.material];mats.forEach(m=>{if(m){m.side=THREE.DoubleSide;m.transparent=false;m.depthWrite=true;m.needsUpdate=true}})}});
        mesh.updateMatrixWorld(true);
        const bbox=new THREE.Box3().setFromObject(holder);
        const size=new THREE.Vector3(bbox.max.x-bbox.min.x,bbox.max.y-bbox.min.y,bbox.max.z-bbox.min.z);
        const center=new THREE.Vector3((bbox.max.x+bbox.min.x)/2,(bbox.max.y+bbox.min.y)/2,(bbox.max.z+bbox.min.z)/2);
        if(!Number.isFinite(size.y)||size.y<=0)return;
        // Normalize every existing OBJ to a common game-world height (~62 px).
        const factor=.62/Math.max(size.y,.001);
        holder.scale.set(factor,factor,factor);
        holder.position.set(-center.x*factor,-bbox.min.y*factor,-center.z*factor);
        result.ready=true;
        console.info('[Grand Chase 3D] modelo carregado:',param||'elesis','dimensões:',size.x,size.y,size.z,'escala:',factor);
      },undefined,error=>console.warn('Não foi possível carregar o OBJ; usando personagem 2D.',error));
    },undefined,error=>console.warn('Não foi possível carregar o material 3D; usando personagem 2D.',error));
    result.draw=(p,scroll,status)=>{
      anchor.visible=result.ready && !!p && !(p.invul>0&&Math.floor(p.invul*16)%2===0);
      if(anchor.visible){
        // Match the pixel coordinates of the original 2D physics/collision engine.
        anchor.position.set((p.x+p.w/2-scroll-480)/100,(270-(p.y+p.h))/100,0);
        anchor.scale.x=p.face;
        holder.rotation.z=p.attackFx>0?(-p.face*.13):0;
      }
      renderer.render(scene,camera3d);
      if(!anchor.visible){result.visible=false;return}
      try{
        const gl=renderer.getContext();
        const screenX=Math.round(p.x+p.w/2-scroll);
        const feetY=Math.round(p.y+p.h);
        const left=Math.max(0,Math.min(959,screenX-70));
        const bottom=Math.max(0,Math.min(539,540-feetY-22));
        const width=Math.min(960-left,140);
        const height=Math.min(540-bottom,115);
        const pixels=new Uint8Array(width*height*4);
        gl.readPixels(left,bottom,width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
        const frame=ctx.createImageData(width,height);
        let count=0;
        for(let y=0;y<height;y++){
          for(let x=0;x<width;x++){
            const src=((height-1-y)*width+x)*4, dst=(y*width+x)*4;
            const r=pixels[src],g=pixels[src+1],b=pixels[src+2],a=pixels[src+3];
            const key=(r>235&&b>235&&g<25);
            frame.data[dst]=r;frame.data[dst+1]=g;frame.data[dst+2]=b;
            frame.data[dst+3]=key?0:a;
            if(!key&&a>30)count++;
          }
        }
        result.visible=count>10;
        if(result.visible)ctx.putImageData(frame,left,540-bottom-height);
      }catch(error){
        result.visible=false;
        if(!result.warned){console.warn('[Grand Chase 3D] falha ao compor modelo sobre a fase:',error);result.warned=true}
      }
    };
    window.addEventListener('pagehide',()=>renderer.dispose(),{once:true});
  }catch(error){console.warn('WebGL indisponível; usando personagem 2D.',error)}
  return result;
}

function beep(freq=300,duration=.07){if(muted)return;try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}catch(_e){}}
function reset(){player={x:90,y:ground-62,w:37,h:62,vx:0,vy:0,face:1,hp:100,mp:0,onGround:false,attackCd:0,dashCd:0,invul:0,flash:0,attackFx:0};enemies=[];particles=[];portal={x:world-110,y:ground-96,w:60,h:96};score=0;kills=0;spawnTimer=0;camera=0;state='play';for(let i=0;i<8;i++)enemies.push(makeEnemy(450+i*238,i));$('overlay').classList.add('hidden');message('Derrote 8 inimigos e alcance o portal!');updateHud()}
function makeEnemy(x,i){return{x,y:ground-48,w:35,h:48,hp:35+(i%3)*13,maxHp:35+(i%3)*13,vx:0,attackCd:Math.random()*.5,hit:0,alive:true,face:-1,origin:x}}
function message(s){$('notice').textContent=s;noticeTimer=3}
function burst(x,y,color,count=8){for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-.5)*260,vy:(Math.random()-.9)*270,life:.45,color})}
function hitEnemy(e,damage){if(!e.alive)return;e.hp-=damage;e.hit=.18;e.vx=player.face*235;burst(e.x+e.w/2,e.y+20,'#ffcf78',7);player.mp=Math.min(100,player.mp+12);score+=10;beep(390,.045);if(e.hp<=0){e.alive=false;kills++;score+=100;burst(e.x+16,e.y+25,'#f8d67d',16);message(kills+'/8 monstros derrotados')}}
function attack(special=false){if(state!=='play'||player.attackCd>0)return;if(special&&player.mp<40){message('MP insuficiente para habilidade especial');return}player.attackCd=special?.62:.28;player.attackFx=special?.35:.16;if(special)player.mp-=40;let range=special?205:hero.reach;for(const e of enemies){if(!e.alive)continue;const dx=(e.x+e.w/2)-(player.x+player.w/2),dy=Math.abs((e.y+e.h/2)-(player.y+player.h/2));if(dx*player.face>=-12&&dx*player.face<=range&&dy<90)hitEnemy(e,(special?45:hero.attack))}beep(special?165:520,special?.19:.06)}
function end(win){state=win?'won':'lost';$('overlayTitle').textContent=win?'Missão concluída!':'Você foi derrotado';$('overlayText').textContent=win?'Você venceu os monstros e atravessou o portal. Pontuação: '+score:'Tente novamente e use o dash para evitar os ataques.';$('overlay').classList.remove('hidden');beep(win?750:180,.3)}
function updateHud(){$('hpFill').style.width=player.hp+'%';$('hpText').textContent=Math.ceil(player.hp)+' / 100 HP';$('mpFill').style.width=player.mp+'%';$('mpText').textContent=Math.floor(player.mp)+' / 100 MP';$('score').textContent=score;$('kills').textContent=kills+' / 8 inimigos'}
function collide(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
const platforms=[{x:280,y:380,w:180,h:15},{x:760,y:340,w:190,h:15},{x:1250,y:375,w:190,h:15},{x:1750,y:350,w:210,h:15}];
function step(dt){if(state!=='play')return;player.attackCd=Math.max(0,player.attackCd-dt);player.attackFx=Math.max(0,player.attackFx-dt);player.dashCd=Math.max(0,player.dashCd-dt);player.invul=Math.max(0,player.invul-dt);noticeTimer-=dt;
let move=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);if(move)player.face=move;
player.vx=move*hero.speed;const previousBottom=player.y+player.h;player.vy+=gravity*dt;player.x=Math.max(0,Math.min(world-player.w,player.x+player.vx*dt));player.y+=player.vy*dt;player.onGround=false;if(player.y+player.h>=ground){player.y=ground-player.h;player.vy=0;player.onGround=true}
for(const p of platforms)if(player.vy>=0&&previousBottom<=p.y+5&&player.y+player.h>=p.y&&player.x+player.w>p.x&&player.x<p.x+p.w){player.y=p.y-player.h;player.vy=0;player.onGround=true}
for(const e of enemies){if(!e.alive)continue;e.hit=Math.max(0,e.hit-dt);e.attackCd-=dt;const dx=player.x-e.x;if(Math.abs(dx)<330){e.face=Math.sign(dx)||1;if(Math.abs(dx)>46)e.vx=e.face*85;else e.vx=0;if(Math.abs(dx)<49&&Math.abs(player.y-e.y)<55&&e.attackCd<=0){e.attackCd=1.25;if(player.invul<=0){player.hp=Math.max(0,player.hp-12);player.invul=.8;player.vy=-170;burst(player.x+18,player.y+28,'#fa627c');beep(130,.12);if(player.hp<=0)end(false)}}}else{e.vx=Math.abs(e.x-e.origin)>60?-Math.sign(e.x-e.origin)*55:Math.sin(performance.now()/600+e.origin)*45}e.x+=e.vx*dt;e.x=Math.max(0,Math.min(world-e.w,e.x))}
for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=gravity*.45*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
if(kills===8&&collide(player,portal))end(true);else if(kills<8&&collide(player,portal)&&noticeTimer<=0)message('Derrote todos os monstros antes de sair!');
camera=Math.max(0,Math.min(world-W,player.x-W*.32));updateHud()}
function draw(){const c=ctx;c.clearRect(0,0,W,H);const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#203d69');sky.addColorStop(1,'#7291a3');c.fillStyle=sky;c.fillRect(0,0,W,H);c.save();c.translate(-camera,0);
for(let j=0;j<21;j++){const x=j*133;c.fillStyle=j%2?'#345472':'#416580';c.beginPath();c.moveTo(x-110,ground);c.lineTo(x+40,185+(j%3)*35);c.lineTo(x+175,ground);c.fill()}
for(let j=0;j<35;j++){const x=j*83;c.fillStyle='#223f48';c.fillRect(x,ground-55-(j%4)*14,13,65);c.beginPath();c.arc(x+6,ground-54-(j%4)*14,35,0,Math.PI*2);c.fill()}
c.fillStyle='#263c37';c.fillRect(0,ground,world,H-ground);c.fillStyle='#709e6c';c.fillRect(0,ground,world,8);for(let x=0;x<world;x+=48){c.fillStyle='#38544b';c.fillRect(x,ground+22+(x%3)*6,25,5)}
for(const p of platforms){c.fillStyle='#5a615f';c.fillRect(p.x,p.y,p.w,p.h);c.fillStyle='#9ebb86';c.fillRect(p.x,p.y,p.w,5)}
c.fillStyle=kills===8?'#9bf7d1':'#7783ac';c.fillRect(portal.x,portal.y,portal.w,portal.h);c.fillStyle=kills===8?'#56acb8':'#303e6a';c.fillRect(portal.x+7,portal.y+8,portal.w-14,portal.h-8);c.fillStyle='#ecf4ff';c.font='15px sans-serif';c.fillText('PORTAL',portal.x-4,portal.y-12);
for(const e of enemies){if(!e.alive)continue;c.save();c.translate(e.x+e.w/2,e.y+e.h/2);c.scale(e.face,1);c.fillStyle=e.hit?'#fff2bc':'#a35c8c';c.beginPath();c.ellipse(0,4,20,24,0,0,Math.PI*2);c.fill();c.fillStyle='#321c37';c.fillRect(5,-3,5,5);c.fillRect(-11,-3,5,5);c.fillStyle='#36253b';c.fillRect(-13,25,11,7);c.fillRect(3,25,11,7);c.restore();c.fillStyle='#201e36';c.fillRect(e.x-6,e.y-14,47,5);c.fillStyle='#ef6b87';c.fillRect(e.x-6,e.y-14,47*Math.max(0,e.hp/e.maxHp),5)}
if(!visual3d.visible && !(player.invul>0&&Math.floor(player.invul*16)%2===0)){c.save();c.translate(player.x+player.w/2,player.y+player.h/2);c.scale(player.face,1);c.fillStyle=hero.color;c.fillRect(-15,-14,30,34);c.fillStyle='#ffe0b9';c.beginPath();c.arc(0,-23,14,0,Math.PI*2);c.fill();c.fillStyle='#17233d';c.fillRect(4,-25,4,4);c.fillStyle='#2e314a';c.fillRect(-14,20,10,12);c.fillRect(4,20,10,12);c.fillStyle='#d9e7f7';c.fillRect(13,-12,17,5);c.restore()}
if(player.attackFx>0){c.fillStyle='rgba(251,232,157,.38)';c.beginPath();c.ellipse(player.x+player.w/2+player.face*(hero.reach/2),player.y+29,hero.reach/2,42,0,0,Math.PI*2);c.fill()}
for(const p of particles){c.globalAlpha=Math.min(1,p.life*2);c.fillStyle=p.color;c.fillRect(p.x,p.y,5,5)}c.globalAlpha=1;c.restore();
if(state==='paused'){c.fillStyle='#060c1ab8';c.fillRect(0,0,W,H);c.fillStyle='white';c.font='bold 45px sans-serif';c.textAlign='center';c.fillText('PAUSADO',W/2,H/2);c.font='20px sans-serif';c.fillText('Pressione ESC para continuar',W/2,H/2+44);c.textAlign='left'}}
function frame(t){const dt=Math.min(.035,(t-last)/1000||0);last=t;step(dt);draw();visual3d.draw(player,camera,state);requestAnimationFrame(frame)}
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.repeat&&['KeyJ','KeyK','ShiftLeft','ShiftRight','Escape'].includes(e.code))return;keys.add(e.code);if(e.code==='Escape'){state=state==='paused'?'play':state==='play'?'paused':state;return}if(state!=='play')return;if((e.code==='KeyW'||e.code==='Space'||e.code==='ArrowUp')&&player.onGround){player.vy=-660;player.onGround=false;beep(600,.035)}if(e.code==='KeyJ')attack();if(e.code==='KeyK')attack(true);if((e.code==='ShiftLeft'||e.code==='ShiftRight')&&player.dashCd===0){player.x=Math.max(0,Math.min(world-player.w,player.x+player.face*115));player.invul=.3;player.dashCd=1;burst(player.x,player.y+35,'#a9f4ff');beep(680,.09)}});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();if(state==='play')state='paused'});
$('retry').addEventListener('click',reset);$('restart').addEventListener('click',reset);$('sound').addEventListener('click',()=>{muted=!muted;$('sound').textContent=muted?'♫ Áudio: desligado':'♫ Áudio: ligado'});reset();requestAnimationFrame(frame);
})();