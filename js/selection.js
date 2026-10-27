'use strict';
(() => {
const roster={
 elesis:{name:'Elesis',role:'Guerreira',obj:'models/elesis/Elesis.obj',mtl:'models/elesis/Elesis.mtl',scale:.015,frontYaw:0},
 lire:{name:'Lire',role:'Arqueira',obj:'models/lire/Lire.obj',mtl:'models/lire/Lire.obj.mtl',scale:1.9,frontYaw:0},
 arme:{name:'Arme',role:'Maga',obj:'models/arme/arme.obj',mtl:'models/arme/arme.obj.mtl',scale:1,frontYaw:Math.PI/2},
 lass:{name:'Lass',role:'Assassino',obj:'models/lass/Lass.obj',mtl:'models/lass/Lass.obj.mtl',scale:.23,frontYaw:0}
};
const $=id=>document.getElementById(id);
const viewer=$('background'),status=$('viewerStatus'),name=$('selectedName'),desc=$('selectedDesc'),start=$('startGame');
let selected='elesis',renderer,scene,camera,actor,loadId=0,zoom=1,dragging=false,dragX=0,raf=0;
const failures=[];
window.addEventListener('error',e=>{failures.push(String(e.message||'Erro'));if(failures.length>20)failures.shift()});
window.addEventListener('unhandledrejection',e=>{failures.push(String(e.reason));if(failures.length>20)failures.shift()});
function report(message){status.hidden=false;status.textContent=message}
function init(){
 if(!window.THREE||!THREE.WebGLRenderer||!THREE.OBJLoader||!THREE.MTLLoader){report('Visualizador 3D indisponível neste navegador.');return}
 try{
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,1,.01,100);
  camera.position.set(0,1.25,5.5);camera.lookAt(0,1,0);
  scene.add(new THREE.AmbientLight(0xffffff,.92));
  const light=new THREE.DirectionalLight(0xffffff,.85);light.position.set(3,7,6);scene.add(light);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setClearColor(0x000000,0);
  viewer.appendChild(renderer.domElement);
  const resize=()=>{const w=Math.max(1,viewer.clientWidth),h=Math.max(1,viewer.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};
  resize();window.addEventListener('resize',resize);
  if(window.ResizeObserver)new ResizeObserver(resize).observe(viewer);
  const render=()=>{raf=requestAnimationFrame(render);renderer.render(scene,camera)};
  render();
  select(selected);
 }catch(e){report('Não foi possível iniciar o WebGL.');failures.push(String(e))}
}
function select(id){
 if(!roster[id])return;
 selected=id;
 const item=roster[id];name.textContent=item.name;desc.textContent=item.role+' · Modelo 3D disponível';
 start.href='./game.html?char='+encodeURIComponent(id);
 document.querySelectorAll('.char-card').forEach(b=>{const active=b.dataset.char===id;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))});
 $('selectionStatus').textContent=item.name+' selecionad'+(id==='elesis'||id==='lire'||id==='arme'?'a':'o');
 if(!scene)return;
 const seq=++loadId;
 if(actor){scene.remove(actor);actor=null}
 zoom=1;camera.position.set(0,1.25,5.5);
 report('Carregando '+item.name+'…');window.__GC_CAPTURE_POSE__=null;window.__GC_VISUAL_QA__={character:id,loaded:false};
 const mtl=new THREE.MTLLoader();
 mtl.load(item.mtl,materials=>{
  if(seq!==loadId)return;
  materials.preload();
  const loader=new THREE.OBJLoader();loader.setMaterials(materials);
  loader.load(item.obj,mesh=>{
   if(seq!==loadId)return;
   const group=new THREE.Group();
   mesh.rotation.set(1.4,3.15,5.38);
   group.add(mesh);
   mesh.updateMatrixWorld(true);
   const bounds=new THREE.Box3().setFromObject(group);
   // Three.js r78 does not provide Box3.getSize/getCenter.
   const size=new THREE.Vector3(bounds.max.x-bounds.min.x,bounds.max.y-bounds.min.y,bounds.max.z-bounds.min.z);
   const center=new THREE.Vector3((bounds.min.x+bounds.max.x)/2,(bounds.min.y+bounds.max.y)/2,(bounds.min.z+bounds.max.z)/2);
   if(!Number.isFinite(size.y)||size.y<=0){report('Modelo sem dimensões válidas.');return}
   const scale=2.75/Math.max(size.y,.001);group.scale.setScalar(scale);
   group.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
   // Pivot around the character, not the translated model origin.
   const pivot=new THREE.Group();pivot.add(group);
   actor=pivot;actor.rotation.y=item.frontYaw;scene.add(actor);status.hidden=true;
   window.__GC_VISUAL_QA__={character:id,loaded:true,initialYaw:item.frontYaw,modelHeight:size.y,scale,webgl:!!renderer};
   window.__GC_CAPTURE_POSE__=yaw=>{if(!actor)return false;actor.rotation.y=yaw;return true};
  },undefined,e=>{if(seq===loadId){report('Erro ao carregar o modelo OBJ.');failures.push(String(e))}});
 },undefined,e=>{if(seq===loadId){report('Erro ao carregar materiais do modelo.');failures.push(String(e))}});
}
document.querySelectorAll('.char-card:not(:disabled)').forEach(b=>b.addEventListener('click',()=>select(b.dataset.char)));
viewer.addEventListener('pointerdown',e=>{dragging=true;dragX=e.clientX;viewer.setPointerCapture(e.pointerId)});
viewer.addEventListener('pointermove',e=>{if(!dragging||!actor)return;actor.rotation.y+=(e.clientX-dragX)*.008;dragX=e.clientX});
viewer.addEventListener('pointerup',()=>dragging=false);viewer.addEventListener('pointercancel',()=>dragging=false);
viewer.addEventListener('wheel',e=>{if(!camera)return;e.preventDefault();zoom=Math.max(.65,Math.min(1.65,zoom+Math.sign(e.deltaY)*.08));camera.position.z=5.5*zoom},{passive:false});
$('resetView').addEventListener('click',()=>{zoom=1;if(camera)camera.position.z=5.5;if(actor)actor.rotation.y=roster[selected].frontYaw});
document.addEventListener('keydown',e=>{if(e.key==='Escape')location.href='./';if(!actor||e.target.closest('button,a,input'))return;if(e.key==='ArrowLeft')actor.rotation.y-=.15;if(e.key==='ArrowRight')actor.rotation.y+=.15});
window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);if(renderer)renderer.dispose()},{once:true});
init();
})();