// === BASIC SETUP ===
let scene, camera, renderer;
let player, ground;
let speed = 0.25;
let gravity = -0.018;
let velocityY = 0;
let isJumping = false;
let score = 0;
let obstacles = [];
let gameRunning = false;

// === INIT ===
scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 50);

camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 3, 6);

renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === LIGHT ===
const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(5,10,5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff,0.4));

// === PLAYER ===
const body = new THREE.BoxGeometry(1,2,1);
const bodyMat = new THREE.MeshStandardMaterial({ color:0x00aaff });
player = new THREE.Mesh(body, bodyMat);
player.position.y = 1;
scene.add(player);

// === GROUND ===
const groundGeo = new THREE.PlaneGeometry(100,100);
const groundMat = new THREE.MeshStandardMaterial({ color:0x222222 });
ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI/2;
scene.add(ground);

// === OBSTACLES ===
function spawnObstacle(){
  const geo = new THREE.BoxGeometry(1,1,1);
  const mat = new THREE.MeshStandardMaterial({ color:0xff4444 });
  const obs = new THREE.Mesh(geo, mat);
  obs.position.set(
    (Math.random()-0.5)*6,
    0.5,
    -30
  );
  scene.add(obs);
  obstacles.push(obs);
}

// === CONTROLS ===
let moveX = 0;

window.addEventListener("keydown",e=>{
  if(e.code==="KeyA") moveX = -1;
  if(e.code==="KeyD") moveX = 1;
  if(e.code==="Space") jump();
});

window.addEventListener("keyup",()=>{
  moveX = 0;
});

window.addEventListener("touchstart",e=>{
  if(e.touches[0].clientX < window.innerWidth/2){
    moveX = -1;
  }else{
    moveX = 1;
  }
  jump();
});
window.addEventListener("touchend",()=>{
  moveX = 0;
});

// === JUMP ===
function jump(){
  if(!isJumping && gameRunning){
    velocityY = 0.35;
    isJumping = true;
  }
}

// === START ===
function startGame(){
  gameRunning = true;
  score = 0;
  document.getElementById("score").innerText = "Score: 0";
}

// === LOOP ===
function animate(){
  requestAnimationFrame(animate);

  if(gameRunning){
    score++;
    document.getElementById("score").innerText = "Score: "+score;

    // movement
    player.position.x += moveX * 0.15;
    player.position.x = THREE.MathUtils.clamp(player.position.x,-3,3);

    // gravity
    velocityY += gravity;
    player.position.y += velocityY;

    if(player.position.y <= 1){
      player.position.y = 1;
      velocityY = 0;
      isJumping = false;
    }

    // obstacles
    if(Math.random()<0.02) spawnObstacle();

    obstacles.forEach((o,i)=>{
      o.position.z += speed;
      if(o.position.z > 5){
        scene.remove(o);
        obstacles.splice(i,1);
      }
      // collision
      if(
        Math.abs(o.position.x-player.position.x)<0.8 &&
        Math.abs(o.position.z-player.position.z)<0.8 &&
        Math.abs(o.position.y-player.position.y)<1
      ){
        gameRunning = false;
        alert("Game Over! Score: "+score);
        location.reload();
      }
    });

    // speed up
    speed += 0.00005;
  }

  renderer.render(scene,camera);
}
animate();

// === RESIZE ===
window.addEventListener("resize",()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});
