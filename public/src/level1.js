import "./style.css";
import * as THREE from "three";
import { sizes, handleResize } from "./setup/sizes.js";
import { createRenderer } from "./setup/renderer.js";
import { createControls } from "./setup/cameraControls.js";
import { setupLights } from "./setup/lights.js";
import { loadCubeTextures, loadSkybox } from "./setup/skybox.js";
import { initPhysics } from "./setup/physics.js";
import { setupFloor, createBox, createGoalBox } from "./buildWorld.js";
//import stats from "./setup/stats.js";
import Car from "./cars/car.js";
import Car2 from "./cars/car2.js";
import { FollowCamera } from "./setup/followCamera.js"; // Import FollowCamera
import * as CANNON from "cannon-es";
import { drawSpeedo } from "./gameScreenUI/speedometer.js";
import { preRaceCountdown, startCountdown } from "./gameScreenUI/timer.js";
//import { MiniMap } from "./setup/miniMap.js";

// Canvas and Scene
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  0.1,
  10000
);
camera.position.set(0, 40, -30);
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

// Car2
// const car2 = new Car2(scene, world);
// car2.setTarget({ x: -50, y: 0, z: 50 });
// car2.init();

// Lighting
setupLights(scene);

// Environment Textures
scene.environment = loadCubeTextures();

// Floor
setupFloor(scene, world);

loadSkybox(scene);

// Follow Camera
const followCamera = new FollowCamera(camera); // Initialize with default offset

// Animation Loop
const timeStep = 1 / 60; // seconds
let lastCallTime;

//load texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(
  "public/textures/wall/rustic_stone_wall_diff_4k.jpg"
);

// Set the texture's repeat properties
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(35, 3); // Apply texture scaling

// Usage example: Create a few boxes with varying sizes, colors, masses, and positions
const box3 = createBox({
  size: [1, 6, 210],
  color: 0x00ff00,
  mass: 0,
  position: [-5, 3, 105],
  scene: scene,
  world: world,
  texture: texture,
});
const box4 = createBox({
  size: [1, 6, 190],
  color: 0x00ff00,
  mass: 0,
  position: [5, 3, 105],
  scene: scene,
  world: world,
  texture: texture,
});
const box5 = createBox({
  size: [565, 6, 1],
  color: 0x00ff00,
  mass: 0,
  position: [95, 3, 0],
  scene: scene,
  world: world,
  texture: texture,
});
const box6 = createBox({
  size: [150, 6, 1],
  color: 0x00ff00,
  mass: 0,
  position: [70, 3, 210],
  scene: scene,
  world: world,
  texture: texture,
});
const box7 = createBox({
  size: [150, 6, 1],
  color: 0x00ff00,
  mass: 0,
  position: [80, 3, 200],
  scene: scene,
  world: world,
  texture: texture,
});
const box8 = createBox({
  size: [150, 6, 1],
  color: 0x00ff00,
  mass: 0,
  position: [208, 3, 253],
  scene: scene,
  world: world,
  rotationY: -Math.PI / 4,
  texture: texture,
});
const box9 = createBox({
  size: [160, 6, 1],
  color: 0x00ff00,
  mass: 0,
  position: [201, 3, 267],
  scene: scene,
  world: world,
  rotationY: -Math.PI / 4,
  texture: texture,
});
const box10 = createBox({
  size: [150, 6, 1],
  color: 0x00ff00,
  mass: 0,
  position: [313, 3, 253],
  scene: scene,
  world: world,
  rotationY: Math.PI / 4,
  texture: texture,
});
const box11 = createBox({
  size: [180, 6, 1],
  color: 0x00ff00,
  mass: 0,
  position: [313, 3, 267],
  scene: scene,
  world: world,
  rotationY: Math.PI / 4,
  texture: texture,
});
const bigHorirontal1 = createBox({
  size: [405, 6, 1],
  color: 0x00ff00,
  mass: 0,
  position: [185, 3, 105],
  scene: scene,
  world: world,
  rotationY: -Math.PI / 6.5,
  texture: texture,
});
const bigHorirontal2 = createBox({
  size: [405, 6, 1],
  color: 0x00ff00,
  mass: 0,
  position: [185, 3, 95],
  scene: scene,
  world: world,
  rotationY: -Math.PI / 6.5,
  texture: texture,
});
const box12 = createBox({
  size: [1, 6, 190],
  color: 0x00ff00,
  mass: 0,
  position: [365, 3, 95],
  scene: scene,
  world: world,
  texture: texture,
});
const box13 = createBox({
  size: [1, 6, 220],
  color: 0x00ff00,
  mass: 0,
  position: [378, 3, 95],
  scene: scene,
  world: world,
  texture: texture,
});

// Create the goal box
const goalBox = createGoalBox({
  size: [13, 6, 20],
  color: 0x00ff00,
  position: [370, 3, 5],
  scene: scene,
  label: "GOAL",
});

const countdownElement = document.getElementById("countdown");
// Call this function at the start to initiate countdown
preRaceCountdown(5, () => {
  // Start main race timer after countdown completes
  startCountdown(25, countdownElement);
});

// Function to check if car is within the goal box
function checkGoal(carPosition, goalBox) {
  const { x, y, z } = carPosition;
  const halfX = goalBox.geometry.parameters.width / 2;
  const halfY = goalBox.geometry.parameters.height / 2;
  const halfZ = goalBox.geometry.parameters.depth / 2;

  if (
    x > goalBox.position.x - halfX &&
    x < goalBox.position.x + halfX &&
    y > goalBox.position.y - halfY &&
    y < goalBox.position.y + halfY &&
    z > goalBox.position.z - halfZ &&
    z < goalBox.position.z + halfZ
  ) {
    // Trigger end of game
    console.log("Goal reached! Race is over.");
    window.location.href = "../houndsHtml/letter5.html";
    // Add more actions here, like displaying an end screen or stopping the car
  }
}

let isEditMode = false;

document.addEventListener("keydown", (event) => {
  if (event.key === "e") {
    isEditMode = true; // Enter edit mode
    controls.enabled = true; // Enable orbit or other controls for editing
  } else if (event.key === "p") {
    isEditMode = false; // Enter play mode
    controls.enabled = false; // Disable editing controls in play mode
  }
});

// Create a mini-map
// const miniMapElement = document.getElementById("miniMap"); // Ensure you have a div with this ID in your HTML
// const miniMap = new MiniMap(miniMapElement, scene, camera);

const tick = () => {
  //stats.begin();
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

  // Car position and quaternion
  const carPosition = new THREE.Vector3(
    car.car.chassisBody.position.x,
    car.car.chassisBody.position.y,
    car.car.chassisBody.position.z
  );

  checkGoal(carPosition, goalBox);

  //console.log(carPosition);
  const carQuaternion = new THREE.Quaternion(
    car.car.chassisBody.quaternion.x,
    car.car.chassisBody.quaternion.y,
    car.car.chassisBody.quaternion.z,
    car.car.chassisBody.quaternion.w
  );

  if (!isEditMode) followCamera.update(carPosition, carQuaternion);

  renderer.render(scene, camera);
  //stats.end();

  // miniMap.update(camera);
  window.requestAnimationFrame(tick);
};
tick();
