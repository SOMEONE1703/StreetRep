import "./style.css";
import * as THREE from "three";
import { sizes, handleResize } from "./setup/sizes.js";
import { createRenderer } from "./setup/renderer.js";
import { createControls } from "./setup/cameraControls.js";
import { setupLights } from "./setup/lights.js";
import { loadCubeTextures, loadSkybox } from "./setup/skybox.js";
import { initPhysics } from "./setup/physics.js";
import { setupPhysFloor, createBox, createColliderBox } from "./buildWorld.js";
// import stats from "./setup/stats.js";
import Car from "./cars/car.js";
import Car2 from "./cars/car2.js";
import { FollowCamera } from "./setup/followCamera.js"; // Import FollowCamera
import * as CANNON from "cannon-es";
import { drawSpeedo } from "./gameScreenUI/speedometer.js";
import { startCountdown, startMatch } from "./gameScreenUI/timer.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MiniMap } from "./setup/miniMap.js";

console.log("what");
// Canvas and Scene
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  0.1,
  10000
);

const checkpoints = [];
let score = 0;

let curr_index = 0;

//make checkpoints for race
checkpoints.push({
  position: [0, 0, 80],
  quaternion: [0, -0.3826834323650898, 0, 0.9238795325112867],
});
checkpoints.push({
  position: [-50.2, 0, 86],
  quaternion: [0, -0.5, 0, 0.8660254038],
});
checkpoints.push({
  position: [-50.35, 0, 141],
  quaternion: [0, 0.5, 0, 0.8660254038],
});
checkpoints.push({
  position: [105, 0, 141],
  quaternion: [0, -0.5, 0, 0.8660254038],
});
checkpoints.push({
  position: [105, 0, 56],
  quaternion: [0, 0.5, 0, 0.8660254038],
});
checkpoints.push({
  position: [-130.7, 0, 53],
  quaternion: [0, 0.5, 0, 0.8660254038],
});
checkpoints.push({
  position: [-130.7, 0, 19.1],
  quaternion: [0, -0.5, 0, 0.8660254038],
});
checkpoints.push({
  position: [-85.8, 0, 17],
  quaternion: [0, -0.5, 0, 0.8660254038],
});
checkpoints.push({
  position: [-75, 0, -34],
  quaternion: [0, -0.4617486132350339, 0, 0.88701208331782217],
});
checkpoints.push({
  position: [-3, 0, -34.5],
  quaternion: [0, 0.382683432354098, 0, 0.923879532511867],
});
//console.log(checkpoints);

//camera.position.set(0, 4, 6);
camera.position.set(0, 50, 10);
scene.add(camera);

// Renderer
const renderer = createRenderer(canvas, sizes);
window.addEventListener("resize", () => handleResize(camera, renderer));

// Controls
const controls = createControls(camera, canvas);

// Physics World
const { world } = initPhysics(scene);

// Car
const car = new Car(scene, world);
car.init();
car.car.chassisBody.position.set(0, 1, 0);
// Car2
// const car2 = new Car2(scene, world);
// car2.setTarget({ x: -50, y: 0, z: 50 });
// car2.init();

// Lighting
setupLights(scene);

// Environment Textures
scene.environment = loadCubeTextures();
loadSkybox(scene);
const textureLoader = new THREE.TextureLoader();
const texture1 = textureLoader.load(
  "/track5/newtextures/Poliigon_GrassPatchyGround_4585_BaseColor.jpg"
);

// Floor
setupPhysFloor(world);
let room;
const loader = new GLTFLoader();
loader.load(
  "/track5/scene.gltf",
  (gltf) => {
    room = gltf.scene;
    room.scale.set(0.5, 0.5, 0.5);
    room.position.x = -35;
    room.position.y = -1;
    room.position.z = -20;
    //new CANNON.Vec3(36,0,24)
    scene.add(room);
    room.traverse((node) => {
      //ground texture
      if (node.name.includes("Plane")) {
        node.material = new THREE.MeshStandardMaterial({ map: texture1 });
      }
      //add collider boxes
      //Van in the back
      if (node.name.includes("Cube_VanMat")) {
        const box3 = createColliderBox({
          size: [3, 4, 7.2],
          color: 0x00ff00,
          mass: 0,
          position: [110, 1, -28.7],
          scene: scene,
          world: world,
        });
      }
      //candy shop
      if (node.name.includes("Cube_0")) {
        const box3 = createColliderBox({
          size: [3, 4, 5.5],
          color: 0x00ff00,
          mass: 0,
          position: [102.5, 1, -34.3],
          scene: scene,
          world: world,
        });
      }
      //food stand
      if (node.name.includes("Object_13")) {
        const box3 = createColliderBox({
          size: [2, 4, 4],
          color: 0x00ff00,
          mass: 0,
          position: [102, 1, -26.5],
          scene: scene,
          world: world,
        });
      }
      //stands
      if (node.name.includes("Cube004_Material005_0")) {
        console.log(node);
        const box3 = createColliderBox({
          size: [12, 14, 35],
          color: 0x00ff00,
          mass: 0,
          position: [107.5, 6, -2],
          scene: scene,
          world: world,
        });
      }
      //road guards
      if (node.name.includes("Sketchfab_model021")) {
        const box3 = createColliderBox({
          size: [9, 4, 0.4],
          color: 0x00ff00,
          mass: 0,
          position: [110, 0, 47.8],
          rotationY: -0.45,
          scene: scene,
          world: world,
        });
      }
      if (node.name.includes("Sketchfab_model022")) {
        const box3 = createColliderBox({
          size: [9, 4, 0.4],
          color: 0x00ff00,
          mass: 0,
          position: [117, 0, 52.8],
          rotationY: -0.95,
          scene: scene,
          world: world,
        });
      }
      if (node.name.includes("Sketchfab_model023")) {
        const box3 = createColliderBox({
          size: [0.4, 4, 9],
          color: 0x00ff00,
          mass: 0,
          position: [120.2, 0, 61],
          rotationY: 0.14,
          scene: scene,
          world: world,
        });
      }
      if (node.name.includes("Sketchfab_model024")) {
        const box3 = createColliderBox({
          size: [9, 4, 0.4],
          color: 0x00ff00,
          mass: 0,
          position: [101, 0, 45],
          rotationY: -0.1,
          scene: scene,
          world: world,
        });
      }
    });
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("An error occurred while loading the model:", error);
  }
);
var camera_toggle = false;
var follower;
window.addEventListener("keydown", (e) => {
  // console.log(e.key);
  if (e.key == "c") {
    camera_toggle = !camera_toggle;
  }
  if (camera_toggle) {
    //camera.position.set(0, 10, 10);
    followCamera.update(
      new THREE.Vector3(0, 20, 10),
      new THREE.Quaternion(0, 0, 0, 1)
    );
  }
});

const this_geometry = new THREE.TorusGeometry(8, 0.5, 10, 100);
const this_material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
let this_one = new THREE.Mesh(this_geometry, this_material);
this_one.position.set(1, 0, 10);
scene.add(this_one);

// Follow Camera
const followCamera = new FollowCamera(camera); // Initialize with default offset

// Animation Loop
const timeStep = 1 / 60; // seconds
let lastCallTime;

// Usage example: Create a few boxes with varying sizes, colors, masses, and positions

const that_geometry = new THREE.TorusGeometry(8, 0.5, 10, 100);
const that_material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
let that_one = new THREE.Mesh(that_geometry, that_material);
that_one.position.set(
  checkpoints[curr_index].position[0],
  checkpoints[curr_index].position[1],
  checkpoints[curr_index].position[2]
);
// Convert 45 degrees to radians
that_one.quaternion.set(
  checkpoints[curr_index].quaternion[0],
  checkpoints[curr_index].quaternion[1],
  checkpoints[curr_index].quaternion[2],
  checkpoints[curr_index].quaternion[3]
);
scene.add(that_one);

const countdownElement = document.getElementById("countdown");
//startCountdown(50, countdownElement);
function countdown(n, who) {
  if (n === 4) {
    who.material.color.setHex(0xff0000);
  } else if (n === 2) {
    who.material.color.setHex(0xffa500);
  } else if (n === 0) {
    who.material.color.setHex(0x00ff00);
    startMatch();
    startCountdown(30, countdownElement, 2);
    return;
  }
  //renderer.render(scene, camera);
  setTimeout(() => countdown(n - 1, who), 1000);
}
countdown(6, this_one);

function distanceBetweenVectors(v1, v2) {
  const dx = v2[0] - v1.x;
  const dy = v2[1] - v1.y;
  const dz = v2[2] - v1.z;
  //console.log(v1);
  //console.log(v2);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Create a mini-map
const miniMapElement = document.getElementById("miniMap"); // Ensure you have a div with this ID in your HTML
const miniMap = new MiniMap(miniMapElement, scene, camera);

const tick = () => {
  //console.log("tick");
  // stats.begin();
  controls.update();

  const time = performance.now() / 1000; // seconds
  const dt = lastCallTime ? time - lastCallTime : timeStep;
  world.step(timeStep, dt);
  lastCallTime = time;

  // Retrieve car speed and update speedometer
  const carSpeed = car.getSpeed(); // Assume car.getSpeed() returns speed value
  const carGear = car.getGear(); // Assume car.getGear() returns current gear
  const carRpm = car.getRpm(); // Assume car.getRpm() returns RPM value
  drawSpeedo(carSpeed, carGear, carRpm, 160, car.isReverse); // Update speedometer display

  //Car position and quaternion
  const carPosition = new THREE.Vector3(
    car.car.chassisBody.position.x,
    car.car.chassisBody.position.y,
    car.car.chassisBody.position.z
  );
  const carQuaternion = new THREE.Quaternion(
    car.car.chassisBody.quaternion.x,
    car.car.chassisBody.quaternion.y,
    car.car.chassisBody.quaternion.z,
    car.car.chassisBody.quaternion.w
  );
  if (curr_index < checkpoints.length) {
    let ddd = distanceBetweenVectors(
      carPosition,
      checkpoints[curr_index].position
    );
    //console.log(ddd);
    if (ddd < 10) {
      if (that_one) {
        scene.remove(that_one);
      }
      curr_index++;
      if (curr_index < checkpoints.length) {
        score++;
        const that_geometry = new THREE.TorusGeometry(8, 0.5, 10, 100);
        const that_material = new THREE.MeshStandardMaterial({
          color: 0x00ff00,
        });
        that_one = new THREE.Mesh(that_geometry, that_material);
        that_one.position.set(
          checkpoints[curr_index].position[0],
          checkpoints[curr_index].position[1],
          checkpoints[curr_index].position[2]
        );
        // Convert 45 degrees to radians
        that_one.quaternion.set(
          checkpoints[curr_index].quaternion[0],
          checkpoints[curr_index].quaternion[1],
          checkpoints[curr_index].quaternion[2],
          checkpoints[curr_index].quaternion[3]
        );
        scene.add(that_one);
      }
    }
  }
  let ddd = distanceBetweenVectors(carPosition, [0, 0, 0]);
  if (score == 9 && ddd < 10) {
    //you have finished the race
    console.log("done");
    window.location.href = "../houndsHtml/letter2.html";
  }
  // if (camera_toggle) {
  followCamera.update(carPosition, carQuaternion);
  // }
  // Update the mini-map with the main camera's position
  miniMap.update(camera);
  renderer.render(scene, camera);
  // stats.end();

  window.requestAnimationFrame(tick);
};
tick();
