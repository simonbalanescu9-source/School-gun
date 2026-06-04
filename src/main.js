import * as THREE from "three";

let scene, camera, renderer;
let player;
let keys = {};
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

let yaw = 0;
let pitch = 0;
let isPointerLocked = false;

let score = 0;
let stamina = 100;
let quest = "Find the classroom";

let interactables = [];
let teachers = [];
let homeworkItems = [];
let desks = [];

const scoreEl = document.getElementById("score");
const staminaEl = document.getElementById("stamina");
const questEl = document.getElementById("quest");
const statusEl = document.getElementById("status");

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 25, 130);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  createLighting();
  createPlayer();
  createSchool();
  createCourtyard();
  createClassrooms();
  createHallway();
  createNPCs();
  createActivities();
  createDecorations();

  camera.position.copy(player.position);
  camera.position.y += 1.5;

  statusEl.textContent = "Click the screen to start. Explore the school and prank teachers safely.";

  document.addEventListener("click", () => {
    document.body.requestPointerLock();
  });

  document.addEventListener("pointerlockchange", () => {
    isPointerLocked = document.pointerLockElement === document.body;
  });

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  window.addEventListener("resize", onResize);
}

function createLighting() {
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.3);
  hemi.position.set(0, 50, 0);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(30, 60, 25);
  sun.castShadow = true;

  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 140;
  sun.shadow.camera.left = -80;
  sun.shadow.camera.right = 80;
  sun.shadow.camera.top = 80;
  sun.shadow.camera.bottom = -80;

  scene.add(sun);

  const warmLight = new THREE.PointLight(0xffcc88, 1.2, 35);
  warmLight.position.set(0, 8, -12);
  warmLight.castShadow = true;
  scene.add(warmLight);
}

function createPlayer() {
  player = new THREE.Object3D();
  player.position.set(0, 1, 20);
  scene.add(player);
}

function createMaterial(color, roughness = 0.7, metalness = 0.05) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness
  });
}

function createBox({
  name = "box",
  position = [0, 0, 0],
  scale = [1, 1, 1],
  color = 0xffffff,
  castShadow = true,
  receiveShadow = true
}) {
  const geo = new THREE.BoxGeometry(scale[0], scale[1], scale[2]);
  const mat = createMaterial(color);
  const mesh = new THREE.Mesh(geo, mat);

  mesh.name = name;
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;

  scene.add(mesh);
  return mesh;
}

function createSchool() {
  createBox({
    name: "ground",
    position: [0, -0.05, 0],
    scale: [160, 0.1, 160],
    color: 0x4f9c55,
    castShadow: false
  });

  createBox({
    name: "school main floor",
    position: [0, 0.02, -20],
    scale: [80, 0.15, 60],
    color: 0xc9c3b8
  });

  createBox({
    name: "school exterior back wall",
    position: [0, 5, -50],
    scale: [80, 10, 1],
    color: 0xd8b07a
  });

  createBox({
    name: "school exterior left wall",
    position: [-40, 5, -20],
    scale: [1, 10, 60],
    color: 0xd8b07a
  });

  createBox({
    name: "school exterior right wall",
    position: [40, 5, -20],
    scale: [1, 10, 60],
    color: 0xd8b07a
  });

  createBox({
    name: "school front wall left",
    position: [-25, 5, 10],
    scale: [30, 10, 1],
    color: 0xd8b07a
  });

  createBox({
    name: "school front wall right",
    position: [25, 5, 10],
    scale: [30, 10, 1],
    color: 0xd8b07a
  });

  createBox({
    name: "roof",
    position: [0, 10.3, -20],
    scale: [84, 1, 64],
    color: 0x8f3c2d
  });

  createBox({
    name: "front door left",
    position: [-4, 2.2, 10.15],
    scale: [3, 4.4, 0.3],
    color: 0x3a2418
  });

  createBox({
    name: "front door right",
    position: [4, 2.2, 10.15],
    scale: [3, 4.4, 0.3],
    color: 0x3a2418
  });

  for (let i = -30; i <= 30; i += 15) {
    createWindow(i, 5.2, 10.25);
    createWindow(i, 5.2, -50.55);
  }

  for (let z = -42; z <= 2; z += 14) {
    createWindow(-40.55, 5.2, z, true);
    createWindow(40.55, 5.2, z, true);
  }
}

function createWindow(x, y, z, side = false) {
  const windowMesh = createBox({
    name: "window",
    position: [x, y, z],
    scale: side ? [0.2, 3, 5] : [5, 3, 0.2],
    color: 0x9ed8ff
  });

  windowMesh.material.emissive = new THREE.Color(0x17354a);
  windowMesh.material.emissiveIntensity = 0.15;
}

function createCourtyard() {
  for (let i = -4; i <= 4; i++) {
    createBox({
      name: "path tile",
      position: [i * 3, 0.03, 25],
      scale: [2.8, 0.08, 6],
      color: 0xb8b8b8
    });
  }

  for (let i = 0; i < 14; i++) {
    const x = -65 + Math.random() * 130;
    const z = -70 + Math.random() * 130;

    if (Math.abs(x) < 45 && z < 15 && z > -55) continue;

    createTree(x, z);
  }

  createBox({
    name: "school sign",
    position: [0, 3, 33],
    scale: [16, 4, 0.5],
    color: 0x222266
  });

  createTextBoard("SIMON SCHOOL", [0, 5.4, 33.3], 0xffffff);
}

function createTree(x, z) {
  createBox({
    name: "tree trunk",
    position: [x, 1.5, z],
    scale: [1, 3, 1],
    color: 0x7a4b25
  });

  const leavesGeo = new THREE.SphereGeometry(3, 24, 24);
  const leavesMat = createMaterial(0x2d7d35);
  const leaves = new THREE.Mesh(leavesGeo, leavesMat);
  leaves.position.set(x, 5, z);
  leaves.castShadow = true;
  leaves.receiveShadow = true;
  scene.add(leaves);
}

function createTextBoard(text, position, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1b1b5a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
  ctx.font = "bold 90px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({ map: texture });
  const geo = new THREE.PlaneGeometry(14, 3.5);
  const mesh = new THREE.Mesh(geo, mat);

  mesh.position.set(position[0], position[1], position[2]);
  scene.add(mesh);
}

function createHallway() {
  createBox({
    name: "hallway floor",
    position: [0, 0.1, -20],
    scale: [12, 0.15, 58],
    color: 0xe8e1c8
  });

  createBox({
    name: "hallway left lockers",
    position: [-7, 2, -20],
    scale: [1, 4, 55],
    color: 0x3366bb
  });

  createBox({
    name: "hallway right lockers",
    position: [7, 2, -20],
    scale: [1, 4, 55],
    color: 0x3366bb
  });

  for (let z = -45; z <= 5; z += 5) {
    createBox({
      name: "locker detail left",
      position: [-6.45, 2.1, z],
      scale: [0.15, 3.2, 0.08],
      color: 0xeeeeee
    });

    createBox({
      name: "locker detail right",
      position: [6.45, 2.1, z],
      scale: [0.15, 3.2, 0.08],
      color: 0xeeeeee
    });
  }

  const bell = createBox({
    name: "school bell",
    position: [0, 7.5, -4],
    scale: [2, 1, 2],
    color: 0xffcc00
  });

  bell.userData = {
    type: "activity",
    label: "Ring the bell",
    used: false,
    action: () => {
      if (bell.userData.used) {
        say("The bell already rang. Everyone is suspicious now.");
        return;
      }

      bell.userData.used = true;
      addScore(25);
      setQuest("Do a harmless prank on a teacher");
      say("BRRING! The hallway goes wild. +25 score.");
    }
  };

  interactables.push(bell);
}

function createClassrooms() {
  createClassroom(-23, -25, "Math Class", 0x8ed1fc);
  createClassroom(23, -25, "Science Lab", 0xb1f5b3);
  createClassroom(-23, -43, "Art Room", 0xffc7e8);
  createClassroom(23, -43, "Library", 0xffe099);
}

function createClassroom(x, z, label, color) {
  createBox({
    name: `${label} floor`,
    position: [x, 0.15, z],
    scale: [26, 0.1, 16],
    color
  });

  createBox({
    name: `${label} back wall`,
    position: [x, 3, z - 8],
    scale: [26, 6, 0.5],
    color: 0xf2e8d5
  });

  createBox({
    name: `${label} left wall`,
    position: [x - 13, 3, z],
    scale: [0.5, 6, 16],
    color: 0xf2e8d5
  });

  createBox({
    name: `${label} right wall`,
    position: [x + 13, 3, z],
    scale: [0.5, 6, 16],
    color: 0xf2e8d5
  });

  createBox({
    name: `${label} front wall left`,
    position: [x - 8, 3, z + 8],
    scale: [10, 6, 0.5],
    color: 0xf2e8d5
  });

  createBox({
    name: `${label} front wall right`,
    position: [x + 8, 3, z + 8],
    scale: [10, 6, 0.5],
    color: 0xf2e8d5
  });

  const board = createBox({
    name: `${label} board`,
    position: [x, 3.5, z - 7.7],
    scale: [14, 3.2, 0.2],
    color: 0x1f5f3b
  });

  board.userData = {
    type: "activity",
    label: `Read ${label} board`,
    action: () => {
      say(`You read the ${label} board. It says: "No running, no yelling, and definitely no whoopee cushions."`);
      addScore(5);
    }
  };

  interactables.push(board);

  createTextLabel(label, [x, 6.3, z + 8.4]);

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const deskX = x - 6 + col * 6;
      const deskZ = z - 2 + row * 4;

      const desk = createDesk(deskX, deskZ);
      desks.push(desk);
      interactables.push(desk);
    }
  }

  createTeacherDesk(x, z - 5.5);
}

function createTextLabel(text, position) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#111";
  ctx.font = "bold 42px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true
  });

  const geo = new THREE.PlaneGeometry(8, 2);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(position[0], position[1], position[2]);
  scene.add(mesh);
}

function createDesk(x, z) {
  const desk = createBox({
    name: "student desk",
    position: [x, 1.1, z],
    scale: [3, 0.4, 2],
    color: 0x8b5a2b
  });

  createBox({
    name: "desk leg",
    position: [x - 1.1, 0.45, z - 0.7],
    scale: [0.2, 1, 0.2],
    color: 0x5a351e
  });

  createBox({
    name: "desk leg",
    position: [x + 1.1, 0.45, z - 0.7],
    scale: [0.2, 1, 0.2],
    color: 0x5a351e
  });

  createBox({
    name: "desk leg",
    position: [x - 1.1, 0.45, z + 0.7],
    scale: [0.2, 1, 0.2],
    color: 0x5a351e
  });

  createBox({
    name: "desk leg",
    position: [x + 1.1, 0.45, z + 0.7],
    scale: [0.2, 1, 0.2],
    color: 0x5a351e
  });

  desk.userData = {
    type: "activity",
    label: "Sit at desk",
    cooldown: false,
    action: () => {
      if (desk.userData.cooldown) {
        say("You already sat here. Try another activity.");
        return;
      }

      desk.userData.cooldown = true;
      addScore(10);
      stamina = Math.min(100, stamina + 15);
      updateUI();
      say("You sat down and pretended to study. +10 score, +15 stamina.");
    }
  };

  return desk;
}

function createTeacherDesk(x, z) {
  createBox({
    name: "teacher desk",
    position: [x, 1.2, z],
    scale: [6, 0.5, 2.5],
    color: 0x704214
  });

  createBox({
    name: "teacher chair",
    position: [x, 0.9, z + 2],
    scale: [2, 1.8, 1.5],
    color: 0x3c3c3c
  });
}

function createNPCs() {
  createTeacher("Mr. Chalk", -23, -30, 0x3333aa);
  createTeacher("Ms. Science", 23, -30, 0x228833);
  createTeacher("Principal Stone", 0, -42, 0xaa3333);
}

function createTeacher(name, x, z, color) {
  const npc = new THREE.Group();
  npc.position.set(x, 0, z);
  npc.name = name;

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.55, 1.5, 8, 16),
    createMaterial(color)
  );
  body.position.y = 1.5;
  body.castShadow = true;
  npc.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 24, 24),
    createMaterial(0xffcc99)
  );
  head.position.y = 2.7;
  head.castShadow = true;
  npc.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, 24, 24),
    createMaterial(0x2b1b12)
  );
  hair.position.y = 2.95;
  hair.scale.y = 0.45;
  hair.castShadow = true;
  npc.add(hair);

  const leftEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    createMaterial(0x000000)
  );
  leftEye.position.set(-0.16, 2.75, 0.42);
  npc.add(leftEye);

  const rightEye = leftEye.clone();
  rightEye.position.x = 0.16;
  npc.add(rightEye);

  scene.add(npc);

  npc.userData = {
    type: "teacher",
    label: `Prank ${name}`,
    name,
    pranked: false,
    originalX: x,
    originalZ: z,
    walkTimer: Math.random() * 10,
    action: () => prankTeacher(npc)
  };

  teachers.push(npc);
  interactables.push(npc);
}

function createActivities() {
  createHomework(-2, -10);
  createHomework(12, -28);
  createHomework(-32, -43);
  createHomework(31, -42);

  createPrankItem("whoopee cushion", -12, -7, 0xff55aa);
  createPrankItem("paper airplane", 13, -8, 0xffffff);
  createPrankItem("chalk dust", 0, -35, 0xe0e0e0);

  const vending = createBox({
    name: "vending machine",
    position: [34, 3, 0],
    scale: [3, 6, 2],
    color: 0xcc2222
  });

  vending.userData = {
    type: "activity",
    label: "Buy soda",
    used: false,
    action: () => {
      if (score < 10) {
        say("You need 10 score to buy soda.");
        return;
      }

      if (vending.userData.used) {
        say("The vending machine is empty.");
        return;
      }

      vending.userData.used = true;
      score -= 10;
      stamina = Math.min(100, stamina + 35);
      updateUI();
      say("You bought soda. -10 score, +35 stamina.");
    }
  };

  interactables.push(vending);
}

let prankInventory = {
  whoopee: false,
  airplane: false,
  chalk: false
};

function createPrankItem(type, x, z, color) {
  const item = createBox({
    name: type,
    position: [x, 0.7, z],
    scale: [1, 0.4, 1],
    color
  });

  item.userData = {
    type: "item",
    label: `Pick up ${type}`,
    picked: false,
    action: () => {
      if (item.userData.picked) {
        say("Already picked up.");
        return;
      }

      item.userData.picked = true;
      item.visible = false;

      if (type === "whoopee cushion") prankInventory.whoopee = true;
      if (type === "paper airplane") prankInventory.airplane = true;
      if (type === "chalk dust") prankInventory.chalk = true;

      addScore(10);
      setQuest("Find a teacher and press E nearby");
      say(`Picked up ${type}. Harmless prank unlocked. +10 score.`);
    }
  };

  interactables.push(item);
}

function createHomework(x, z) {
  const paper = createBox({
    name: "homework paper",
    position: [x, 0.35, z],
    scale: [1.2, 0.05, 1.5],
    color: 0xffffff
  });

  paper.userData = {
    type: "collectible",
    label: "Collect homework",
    collected: false,
    action: () => {
      if (paper.userData.collected) {
        say("Already collected.");
        return;
      }

      paper.userData.collected = true;
      paper.visible = false;
      addScore(15);
      say("Collected forgotten homework. +15 score.");
      checkHomeworkQuest();
    }
  };

  homeworkItems.push(paper);
  interactables.push(paper);
}

function checkHomeworkQuest() {
  const collected = homeworkItems.filter(item => item.userData.collected).length;

  if (collected >= homeworkItems.length) {
    setQuest("All homework collected. Become school legend.");
    addScore(50);
    say("You collected every homework sheet. Bonus +50 score.");
  } else {
    setQuest(`Collect homework: ${collected}/${homeworkItems.length}`);
  }
}

function prankTeacher(teacher) {
  if (teacher.userData.pranked) {
    say(`${teacher.userData.name} is already watching you carefully.`);
    return;
  }

  const hasAnyPrank =
    prankInventory.whoopee ||
    prankInventory.airplane ||
    prankInventory.chalk;

  if (!hasAnyPrank) {
    say("You need to find a harmless prank item first.");
    setQuest("Find a prank item");
    return;
  }

  teacher.userData.pranked = true;

  let prankName = "mystery prank";

  if (prankInventory.whoopee) {
    prankInventory.whoopee = false;
    prankName = "whoopee cushion";
  } else if (prankInventory.airplane) {
    prankInventory.airplane = false;
    prankName = "paper airplane";
  } else if (prankInventory.chalk) {
    prankInventory.chalk = false;
    prankName = "chalk dust";
  }

  addScore(40);
  stamina = Math.max(0, stamina - 20);
  updateUI();

  teacher.children[0].material.color.set(0xffaa00);

  say(`You used the ${prankName} on ${teacher.userData.name}. They are confused, not hurt. +40 score.`);

  setTimeout(() => {
    teacher.children[0].material.color.set(0x555555);
  }, 1200);

  const allPranked = teachers.every(t => t.userData.pranked);

  if (allPranked) {
    setQuest("You became the harmless prank master!");
    addScore(100);
    say("All teachers got harmlessly pranked. Legendary bonus +100.");
  }
}

function createDecorations() {
  for (let i = 0; i < 20; i++) {
    const x = -35 + Math.random() * 70;
    const z = -48 + Math.random() * 55;

    if (Math.abs(x) < 9) continue;

    createBox({
      name: "poster",
      position: [x, 3 + Math.random() * 2, z],
      scale: [2, 1.4, 0.08],
      color: randomPosterColor()
    });
  }

  createBox({
    name: "basketball court",
    position: [-45, 0.03, 45],
    scale: [28, 0.05, 18],
    color: 0xd98b39
  });

  createBox({
    name: "basketball hoop pole",
    position: [-45, 3, 35],
    scale: [0.4, 6, 0.4],
    color: 0xffffff
  });

  createBox({
    name: "basketball backboard",
    position: [-45, 6, 34.5],
    scale: [5, 3, 0.3],
    color: 0xffffff
  });

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 24, 24),
    createMaterial(0xff7f00)
  );
  ball.position.set(-50, 0.8, 45);
  ball.castShadow = true;
  scene.add(ball);

  ball.userData = {
    type: "activity",
    label: "Shoot basketball",
    used: false,
    action: () => {
      if (ball.userData.used) {
        say("You already made the shot.");
        return;
      }

      ball.userData.used = true;
      addScore(30);
      say("Clean basketball shot. +30 score.");
    }
  };

  interactables.push(ball);
}

function randomPosterColor() {
  const colors = [
    0xff6666,
    0x66ff66,
    0x6666ff,
    0xffff66,
    0xff66ff,
    0x66ffff
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}

function onMouseMove(e) {
  if (!isPointerLocked) return;

  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch));
}

function onKeyDown(e) {
  keys[e.code] = true;

  if (e.code === "KeyE") {
    interact();
  }
}

function onKeyUp(e) {
  keys[e.code] = false;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateMovement(delta) {
  direction.set(0, 0, 0);

  if (keys["KeyW"]) direction.z -= 1;
  if (keys["KeyS"]) direction.z += 1;
  if (keys["KeyA"]) direction.x -= 1;
  if (keys["KeyD"]) direction.x += 1;

  direction.normalize();

  const running = keys["ShiftLeft"] || keys["ShiftRight"];
  let speed = running && stamina > 0 ? 9 : 5;

  if (running && direction.length() > 0) {
    stamina = Math.max(0, stamina - 18 * delta);
  } else {
    stamina = Math.min(100, stamina + 8 * delta);
  }

  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

  velocity.set(0, 0, 0);
  velocity.addScaledVector(forward, -direction.z * speed * delta);
  velocity.addScaledVector(right, direction.x * speed * delta);

  const nextPos = player.position.clone().add(velocity);

  if (canMoveTo(nextPos)) {
    player.position.copy(nextPos);
  }

  camera.position.copy(player.position);
  camera.position.y += 1.6;

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  updateUI();
}

function canMoveTo(pos) {
  if (pos.x < -76 || pos.x > 76 || pos.z < -76 || pos.z > 76) {
    return false;
  }

  return true;
}

function interact() {
  const nearest = getNearestInteractable();

  if (!nearest) {
    say("Nothing to interact with nearby.");
    return;
  }

  if (nearest.userData && typeof nearest.userData.action === "function") {
    nearest.userData.action();
  }
}

function getNearestInteractable() {
  let nearest = null;
  let nearestDist = 3.5;

  for (const obj of interactables) {
    if (!obj.visible) continue;

    const pos = new THREE.Vector3();
    obj.getWorldPosition(pos);

    const dist = pos.distanceTo(player.position);

    if (dist < nearestDist) {
      nearest = obj;
      nearestDist = dist;
    }
  }

  return nearest;
}

function updateTeachers(delta) {
  for (const teacher of teachers) {
    teacher.userData.walkTimer += delta;

    const radius = teacher.userData.pranked ? 2 : 1;
    const xOffset = Math.sin(teacher.userData.walkTimer) * radius;
    const zOffset = Math.cos(teacher.userData.walkTimer * 0.7) * radius;

    teacher.position.x = teacher.userData.originalX + xOffset;
    teacher.position.z = teacher.userData.originalZ + zOffset;

    teacher.rotation.y += delta * 0.5;
  }
}

function updateInteractionStatus() {
  const nearest = getNearestInteractable();

  if (nearest && nearest.userData && nearest.userData.label) {
    statusEl.textContent = `Press E: ${nearest.userData.label}`;
  } else {
    statusEl.textContent = "Explore the school. Find activities, homework, prank items, and teachers.";
  }
}

function addScore(amount) {
  score += amount;
  updateUI();
}

function setQuest(text) {
  quest = text;
  updateUI();
}

function updateUI() {
  scoreEl.textContent = Math.floor(score);
  staminaEl.textContent = Math.floor(stamina);
  questEl.textContent = quest;
}

function say(text) {
  statusEl.textContent = text;
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  updateMovement(delta);
  updateTeachers(delta);
  updateInteractionStatus();

  renderer.render(scene, camera);
}
