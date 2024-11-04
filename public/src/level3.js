import "./style.css";
import * as THREE from "three";
import { sizes, handleResize } from "./setup/sizes.js";
import { createRenderer } from "./setup/renderer.js";
import { createControls } from "./setup/cameraControls.js";
import { setupLights } from "./setup/lights.js";
import { loadCubeTextures } from "./setup/skybox.js";
import { initPhysics } from "./setup/physics.js";
import { setupFloor } from "./buildWorld.js";
// import stats from "./setup/stats.js";
import Car from "./cars/car.js";
import { FollowCamera } from "./setup/followCamera.js";
import * as CANNON from "cannon-es";
import { drawSpeedo } from "./gameScreenUI/speedometer.js";
import {
  startCountdown,
  startMatch,
  preRaceCountdown,
} from "./gameScreenUI/timer.js";
import { MiniMap } from "./setup/miniMap.js";

// Canvas and Scene setup
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
const renderer = createRenderer(canvas, sizes);
window.addEventListener("resize", () => handleResize(camera, renderer));
const controls = createControls(camera, canvas);
const { world } = initPhysics(scene);
const car = new Car(scene, world);
car.init();
setupLights(scene);
scene.environment = loadCubeTextures();
setupFloor(scene, world);

// Follow Camera
const followCamera = new FollowCamera(camera);
const timeStep = 1 / 60;
let lastCallTime;

// Game variables
let lapCount = 0;
let isBoosting = false;
let boostCooldown = false;
let countdown = 3; // Countdown time in seconds
let score = 0;
const maxScore = 3; // Number of balls to score in goal area to win
//const countdownElement = document.getElementById("countdown");

// Texture loader for realistic textures
const textureLoader = new THREE.TextureLoader();
const sphereTexture = textureLoader.load("textures/environmentMaps/ny.png");
const textureLoader2 = new THREE.TextureLoader(); // Replace with your texture file
const wallTexture = textureLoader2.load(
  "textures/wall/rustic_stone_wall_diff_4k.jpg"
);
wallTexture.wrapS = THREE.RepeatWrapping;
wallTexture.wrapT = THREE.RepeatWrapping;

// Set the repeat values (adjust these values based on your texture size and desired appearance)
wallTexture.repeat.set(0.29, 0.2);
// Function to create the walls around the play area
function createWall({ size, position }) {
  const wallGeometry = new THREE.BoxGeometry(...size);
  const wallMaterial = new THREE.MeshStandardMaterial({
    map: wallTexture, // Apply the texture to the material
  });
  const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
  wallMesh.position.set(...position);
  scene.add(wallMesh);

  const wallShape = new CANNON.Box(
    new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2)
  );
  const wallBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(...position),
  });
  wallBody.addShape(wallShape);
  world.addBody(wallBody);
}

// Create the boundary walls around the play area
// Define the play area size
const playAreaSize = 100;

// Create the boundary walls within the play area bounds
createWall({
  size: [playAreaSize, 5, 2],
  position: [0, 2.5, playAreaSize / 2 - 0.5], // Adjusted position to fit within bounds
});
createWall({
  size: [playAreaSize, 5, 2],
  position: [0, 2.5, -playAreaSize / 2 + 50], // Adjusted position to fit within bounds
});
createWall({
  size: [1, 5, playAreaSize],
  position: [playAreaSize / 2 - 0.5, 2.5, 0], // Adjusted position to fit within bounds
});
createWall({
  size: [1, 5, playAreaSize],
  position: [-playAreaSize / 2 + 0.5, 2.5, 0], // Adjusted position to fit within bounds
});

// Create goal area within the existing play area
const goalArea = new THREE.Mesh(
  new THREE.BoxGeometry(10, 0.1, 10),
  new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    opacity: 0.5,
    transparent: true,
  })
);

// Adjusted position to keep goal inside play area boundaries
goalArea.position.set(0, 0.1, -playAreaSize / 2 + 51);
scene.add(goalArea);

// Update physics body position for goal detection
const goalBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(0, 0.1, -playAreaSize / 2 + 50),
});
goalBody.addShape(new CANNON.Box(new CANNON.Vec3(5, 0.1, 5)));
world.addBody(goalBody);

// Create sphere obstacles with texture and physic
function createSphereObstacle({ radius, position, mass = 5, color }) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    map: sphereTexture,
    color: color,
  });
  const sphere = new THREE.Mesh(geometry, material);

  sphere.position.set(position[0], position[1], position[2]);
  scene.add(sphere);

  // Physics body with small mass for movement
  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
    mass: mass,
    position: new CANNON.Vec3(position[0], position[1], position[2]),
    material: new CANNON.Material({
      friction: 0.3,
      restitution: 0.8,
    }),
  });
  body.addShape(shape);
  world.addBody(body);

  return { mesh: sphere, body };
}

// Obstacles array to hold spheres
const obstacles = [];
for (let i = 0; i < maxScore; i++) {
  const obstacle = createSphereObstacle({
    radius: 1,
    color: 0xffffff,
    position: [Math.random() * 30 - 0, 1, Math.random() * 30 - 0],
  });
  obstacles.push(obstacle);
}

const countdownElement = document.getElementById("countdown");
// Call this function at the start to initiate countdown
preRaceCountdown(5, () => {
  // Start main race timer after countdown completes
  startCountdown(120, countdownElement, 4);
});

// Create a mini-map
const miniMapElement = document.getElementById("miniMap"); // Ensure you have a div with this ID in your HTML
const miniMap = new MiniMap(miniMapElement, scene, camera);

// Boost mechanic
document.addEventListener("keydown", (event) => {
  if (event.key === "b" && !boostCooldown) {
    isBoosting = true;
    boostCooldown = true;
    setTimeout(() => {
      isBoosting = false;
    }, 1000); // Boost lasts for 1 second

    setTimeout(() => {
      boostCooldown = false; // Cooldown lasts for 3 seconds
    }, 3000);
  }
});

// Check if a ball enters the goal area
// Global variable to keep track of scored obstacles
let scoredObstaclesCount = 0;
let scoreDisplay = document.getElementById("scoreDisplay");

// Check if a ball enters the goal area
function checkGoal(obstacle) {
  const distanceToGoal = obstacle.body.position.distanceTo(goalBody.position);
  if (distanceToGoal < 5) {
    score++;
    scoredObstaclesCount++; // Increment scored count
    console.log(`Score: ${score}`);
    scoreDisplay.textContent = `Score: ${scoredObstaclesCount}`;

    // Remove the scored obstacle from the scene and world
    scene.remove(obstacle.mesh);
    world.removeBody(obstacle.body);
    //window.location.href = "../houndsHtml/letter4.html";
    // Check if all balls have been scored
    if (scoredObstaclesCount >= maxScore) {
      console.log("Game Over! You scored all the balls!");
      // Implement any game over logic here, like stopping the game loop
      window.location.href = "../houndsHtml/letter4.html";
      // You could also add UI elements to display the game over screen
    } else {
      // Reset ball position if not all scored
      obstacle.body.position.set(
        Math.random() * 30 - 15,
        1,
        Math.random() * 30 - 15
      );
      obstacle.body.velocity.set(0, 0, 0);
    }
  }
}

// Game loop
const tick = () => {
  //stats.begin();
  controls.update();

  const time = performance.now() / 1000;
  const dt = lastCallTime ? time - lastCallTime : timeStep;
  world.step(timeStep, dt);
  lastCallTime = time;

  // Apply boost speed if active
  if (isBoosting) {
    car.accelerate(10); // Increase speed temporarily
  }

  // Retrieve car speed and update speedometer
  const carSpeed = car.getSpeed();
  const carGear = car.getGear();
  const carRpm = car.getRpm();
  drawSpeedo(carSpeed, carGear, carRpm, 160, car.isReverse);

  // Update car position and quaternion
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

  followCamera.update(carPosition, carQuaternion);

  // Update obstacles and check if they are in the goal
  obstacles.forEach((obstacle) => {
    obstacle.mesh.position.copy(obstacle.body.position);
    obstacle.mesh.quaternion.copy(obstacle.body.quaternion);
    checkGoal(obstacle);
  });

  miniMap.update(camera);

  renderer.render(scene, camera);
  //stats.end();
  window.requestAnimationFrame(tick);
};
tick();
