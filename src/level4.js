import "./style.css";
import * as THREE from "three";
import { sizes, handleResize } from "./setup/sizes.js";
import { createRenderer } from "./setup/renderer.js";
import { createControls } from "./setup/cameraControls.js";
import { setupLights } from "./setup/lights.js";
import { loadCubeTextures, loadWrathbox } from "./setup/skybox.js";
import { initPhysics } from "./setup/physics.js";
import {
  setupFloor,
  createBox,
  createGoalBox,
  setupDryFloor,
} from "./buildWorld.js";
//import stats from "./setup/stats.js";
import Car from "./cars/car.js";
import Car2 from "./cars/car2.js";
import { FollowCamera } from "./setup/followCamera.js"; // Import FollowCamera
import * as CANNON from "cannon-es";
import { drawSpeedo } from "./gameScreenUI/speedometer.js";
import { startCountdown, startMatch } from "./gameScreenUI/timer.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { MiniMap } from "./setup/miniMap.js";

// Canvas and Scene
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  0.1,
  10000
);
camera.position.set(0, 4, 6);
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
car.init({ x: -380, y: 55, z: 30 });

// Car2
// const car2 = new Car2(scene, world);
// car2.setTarget({ x: -50, y: 0, z: 50 });
// car2.init();

// Lighting
setupLights(scene);

// Environment Textures
scene.environment = loadCubeTextures();

// Floor
setupDryFloor(scene, world);

// Initialize the GLTF loader
const loader = new GLTFLoader();

// Load the GLTF model
loader.load(
  "public/models/death.gltf", // Path to your GLTF model file
  (gltf) => {
    // Adjust model settings if needed (position, scale, rotation)
    gltf.scene.position.set(0, 0, 400); // Set position
    gltf.scene.scale.set(5, 5, 5); // Scale the model

    //cast and receive shadows
    gltf.scene.castShadow = true;
    gltf.scene.receiveShadow = true;

    gltf.scene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    scene.add(gltf.scene); // Add the model to the scene

    // Optional: Log to check model's structure or debug
    console.log("Model loaded", gltf.scene);
  },
  (xhr) => {
    console.log(`Model ${(xhr.loaded / xhr.total) * 100}% loaded`);
  },
  (error) => {
    console.error("An error occurred while loading the model", error);
  }
);

//load texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(
  "public/textures/ground/concrete_floor_painted_diff_4k.jpg"
);

// Set the texture's repeat properties
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(1, 35);
// Apply texture scaling
const texture1 = textureLoader.load(
  "public/textures/ground/concrete_floor_painted_diff_4k.jpg"
);
//rotate texture
texture1.rotation = Math.PI / 2;

// Set the texture's repeat properties
texture1.wrapS = THREE.RepeatWrapping;
texture1.wrapT = THREE.RepeatWrapping;
texture1.repeat.set(1, 35); // Apply texture scaling

const texture4 = textureLoader.load(
  "public/textures/ground/concrete_floor_painted_diff_4k.jpg"
);

// Set the texture's repeat properties
texture4.wrapS = THREE.RepeatWrapping;
texture4.wrapT = THREE.RepeatWrapping;
texture4.repeat.set(10, 35);

const texture5 = textureLoader.load(
  "public/textures/ground/concrete_floor_painted_diff_4k.jpg"
);

// Set the texture's repeat properties
texture5.wrapS = THREE.RepeatWrapping;
texture5.wrapT = THREE.RepeatWrapping;
texture5.repeat.set(35, 10);

const box3 = createBox({
  size: [50, 100, 200],
  color: 0x00ff00,
  mass: 0,
  position: [-375, 3, 105],
  scene: scene,
  world: world,
  texture: texture4,
});
const box4 = createBox({
  size: [3, 2, 390],
  color: 0xff0000,
  mass: 0,
  position: [-375, 52, 400],
  scene: scene,
  world: world,
  texture: texture,
});
const box5 = createBox({
  size: [50, 100, 200],
  color: 0x00ff00,
  mass: 0,
  position: [-375, 3, 800 - 105],
  scene: scene,
  world: world,
  texture: texture4,
});

// texture.repeat.set(1, 35); // Apply texture scaling

const box6 = createBox({
  size: [300, 2, 3],
  color: 0xff0000,
  mass: 0,
  position: [-185, 50, 700],
  scene: scene,
  world: world,
  texture: texture1,
});

// Create a moving platform
const blueBox = createBox({
  size: [20, 1, 100], // Adjust size as needed
  color: 0x0000ff, // Platform color
  mass: 0, // Mass 0 to make it static (but we will manually move it)
  position: [0, 47, 700], // Initial position
  scene: scene,
  world: world,
  texture: texture4,
});

const box7 = createBox({
  size: [200, 89, 50],
  color: 0x00ff00,
  mass: 0,
  position: [90, 3, 625],
  scene: scene,
  world: world,
  texture: texture5,
});

// const box8 = createBox({
//   size: [50, 89, 200],
//   color: 0x00ff00,
//   mass: 0,
//   position: [215, 3, 550],
//   scene: scene,
//   world: world,
// });

//load texture
//const textureLoader = new THREE.TextureLoader();
const texture2 = textureLoader.load(
  "public/textures/wall/rustic_stone_wall_diff_4k.jpg"
);

// Set the texture's repeat properties
texture2.wrapS = THREE.RepeatWrapping;
texture2.wrapT = THREE.RepeatWrapping;
texture2.repeat.set(20, 20); // Apply texture scaling

const box9 = createBox({
  size: [2, 50, 50],
  color: 0xf0f00f,
  mass: 0,
  position: [12, 50, 622],
  scene: scene,
  world: world,
  texture: texture2,
});

const box10 = createBox({
  size: [2, 50, 50],
  color: 0xf0f00f,
  mass: 0,
  position: [22, 50, 600],
  scene: scene,
  world: world,
  texture: texture2,
});

const box11 = createBox({
  size: [2, 50, 50],
  color: 0xf0f00f,
  mass: 0,
  position: [22, 50, 655],
  scene: scene,
  world: world,
  texture: texture2,
});

// const initialY = movingBox.mesh.position.y; // Store initial Y position
// const amplitude = 5; // Height of the up and down movement
// const speed = 1; // Speed of the movement

// createRamp(scene, world);

// Follow Camera
const followCamera = new FollowCamera(camera); // Initialize with default offset

// Animation Loop
const timeStep = 1 / 60; // seconds
let lastCallTime;

// Usage example: Create a few boxes with varying sizes, colors, masses, and positions

const countdownElement = document.getElementById("countdown");
//startCountdown(50, countdownElement);
startMatch();

setupLights(scene);

loadWrathbox(scene);

// Create the goal box
const goalBox = createGoalBox({
  size: [13, 6, 10],
  color: 0x00ff00,
  position: [300, 30, 625],
  scene: scene,
  label: "GOAL",
});

// Create a mini-map
const miniMapElement = document.getElementById("miniMap"); // Ensure you have a div with this ID in your HTML
const miniMap = new MiniMap(miniMapElement, scene, camera);

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
    window.location.href = "../houndsHtml/letter1b.html";
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

startMatch();

const tick = () => {
  //stats.begin();
  controls.update();

  const time = performance.now() / 1000; // seconds
  const dt = lastCallTime ? time - lastCallTime : timeStep;
  world.step(timeStep, dt);
  lastCallTime = time;

  // // Update moving platform position with sinusoidal motion
  // movingBox.mesh.position.y = initialY + amplitude * Math.sin(speed * time);

  // // Sync the physics body with the new position
  // movingBox.body.position.y = movingBox.mesh.position.y;

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

  if (car.car.chassisBody.position.y <= 20) {
    window.location.href = "../houndsHtml/lose1.html";
  }

  const carQuaternion = new THREE.Quaternion(
    car.car.chassisBody.quaternion.x,
    car.car.chassisBody.quaternion.y,
    car.car.chassisBody.quaternion.z,
    car.car.chassisBody.quaternion.w
  );

  checkGoal(carPosition, goalBox);

  // if (!isEditMode)
  followCamera.update(carPosition, carQuaternion);

  miniMap.update(camera);

  renderer.render(scene, camera);
  //stats.end();

  window.requestAnimationFrame(tick);
};
tick();
