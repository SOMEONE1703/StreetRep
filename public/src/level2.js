import "./style.css";
import * as THREE from "three";
import { sizes, handleResize } from "./setup/sizes.js";
import { createRenderer } from "./setup/renderer.js";
import { createControls } from "./setup/cameraControls.js";
import { setupLights } from "./setup/lights.js";
import { loadCubeTextures, loadSkybox, loadSkybox2 } from "./setup/skybox.js";
import { initPhysics } from "./setup/physics.js";
import { setupFloor, createBox, createGoalBox } from "./buildWorld.js";
//import stats from "./setup/stats.js";
import Car from "./cars/car.js";
import Car2 from "./cars/car2.js";
import { FollowCamera } from "./setup/followCamera.js"; // Import FollowCamera
import * as CANNON from "cannon-es";
import { drawSpeedo } from "./gameScreenUI/speedometer.js";
import {
  preRaceCountdown,
  startCountdown,
  startMatch,
} from "./gameScreenUI/timer.js";
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
car.init();

// Lighting
setupLights(scene);

// Environment Textures
scene.environment = loadCubeTextures();

// Create a mini-map
const miniMapElement = document.getElementById("miniMap"); // Ensure you have a div with this ID in your HTML
const miniMap = new MiniMap(miniMapElement, scene, camera);

// Floor and Skybox
setupFloor(scene, world);
loadSkybox2(scene);

const textureLoaders = new THREE.TextureLoader();
const texture = textureLoaders.load(
  "public/textures/wall/rustic_stone_wall_diff_4k.jpg"
);
// Set the texture's repeat properties
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(30, 3); // Apply texture scaling

// Load texture for obstacles
const textureLoader = new THREE.TextureLoader();
const obstacleTextureStatic = textureLoader.load(
  "textures/environmentMaps/rock.png"
);
const obstacleTextureMoving = textureLoader.load(
  "textures/environmentMaps/rock.jpg"
); // Different texture or color

// Function to create a static obstacle with a unique color
function createSphericalObstacle({ radius, position, world, scene }) {
  const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    map: obstacleTextureStatic,
  }); // Red color for static obstacles
  const mesh = new THREE.Mesh(sphereGeometry, material);
  mesh.position.set(...position);
  scene.add(mesh);

  // Create physics body
  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({ mass: 0 }); // Static obstacle
  body.addShape(shape);
  body.position.set(...position);
  world.addBody(body);

  return { mesh, body };
}

// Create static obstacles
const obstacles = [
  createSphericalObstacle({ radius: 1.5, position: [3, 1, 150], world, scene }),
  createSphericalObstacle({ radius: 1, position: [-3, 1, 200], world, scene }),
  createSphericalObstacle({ radius: 2, position: [2, 1, 300], world, scene }),
  createSphericalObstacle({
    radius: 0.75,
    position: [-2, 1, 400],
    world,
    scene,
  }),
  createSphericalObstacle({ radius: 1, position: [0, 1, 500], world, scene }),
  createSphericalObstacle({
    radius: 1.3,
    position: [-2, 0, 400],
    world,
    scene,
  }),
  createSphericalObstacle({ radius: 1, position: [-2, 1, 30], world, scene }),
];

// Function to create a moving obstacle with a unique color
function createMovingSphericalObstacle({
  radius,
  startPosition,
  endPosition,
  speed,
  world,
  scene,
}) {
  const sphereGeometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    map: obstacleTextureMoving,
  }); // Green color for moving obstacles
  const mesh = new THREE.Mesh(sphereGeometry, material);
  mesh.position.set(...startPosition);
  scene.add(mesh);

  // Physics body
  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({ mass: 0 }); // Static obstacle
  body.addShape(shape);
  body.position.set(...startPosition);
  world.addBody(body);

  // Movement properties
  let direction = 1;
  const updatePosition = () => {
    body.position.x += speed * direction; // Moves horizontally on the x-axis
    mesh.position.x = body.position.x;

    // Reverse direction if reaching end points
    if (
      body.position.x > endPosition[0] ||
      body.position.x < startPosition[0]
    ) {
      direction *= -1;
    }
  };

  return { mesh, body, updatePosition };
}

// Create moving obstacles
const movingObstacles = [
  createMovingSphericalObstacle({
    radius: 1,
    startPosition: [-9, 1, 100],
    endPosition: [9, 1, 100],
    speed: 0.2, // Increased speed
    world,
    scene,
  }),
  createMovingSphericalObstacle({
    radius: 1,
    startPosition: [-9, 1, 200],
    endPosition: [9, 1, 200],
    speed: 0.3, // Increased speed
    world,
    scene,
  }),
  createMovingSphericalObstacle({
    radius: 1,
    startPosition: [-9, 1, 300],
    endPosition: [9, 1, 300],
    speed: 0.5, // Increased speed
    world,
    scene,
  }),
  createMovingSphericalObstacle({
    radius: 1,
    startPosition: [-9, 1, 400],
    endPosition: [9, 1, 400],
    speed: 0.7, // Increased speed
    world,
    scene,
  }),

  createMovingSphericalObstacle({
    radius: 1,
    startPosition: [-9, 1, 45],
    endPosition: [9, 1, 45],
    speed: 0.1, // Increased speed
    world,
    scene,
  }),

  createMovingSphericalObstacle({
    radius: 1,
    startPosition: [-9, 1, 600],
    endPosition: [9, 1, 600],
    speed: 0.7, // Increased speed
    world,
    scene,
  }),
];

// Set up collision detection
let hasCollided = false;

function setupCollisionDetection(
  car,
  staticObstacles,
  movingObstacles,
  boundaryWalls
) {
  car.car.chassisBody.addEventListener("collide", (event) => {
    staticObstacles
      .concat(movingObstacles, boundaryWalls)
      .forEach((obstacle) => {
        if (event.body === obstacle.body) {
          hasCollided = true;
          console.log("Collision detected with obstacle! Game Over.");
          window.location.href = "../houndsHtml/lose3.html";
        }
      });
  });
}

// Call collision detection setup with both static and moving obstacles
//setupCollisionDetection(car, obstacles, movingObstacles);

// Boundary Walls// Current boundary walls
// Boundary Walls
// Adjusted Side Walls
createBox({
  size: [1, 50, 1500], // Thickness, height, length
  color: 0x32cd32,
  texture: texture,
  mass: 0,
  position: [10, 5, 0], // Right side
  scene,
  world,
}),
  createBox({
    size: [1, 50, 1500],
    color: 0x32cd32,
    texture: texture,
    mass: 0,
    position: [-10, 5, 0], // Left side
    scene,
    world,
  });

let boundaryWalls = [
  createBox({
    size: [1, 50, 1500], // Thickness, height, length
    color: 0x32cd32,
    texture: texture,
    mass: 0,
    position: [10, 5, 0], // Right side
    scene,
    world,
  }),
  createBox({
    size: [1, 50, 1500],
    color: 0x32cd32,
    texture: texture,
    mass: 0,
    position: [-10, 5, 0], // Left side
    scene,
    world,
  }),
];

// Call collision detection setup with both static and moving obstacles
setupCollisionDetection(car, obstacles, movingObstacles, boundaryWalls);

// New Front and Back Walls to Close the Road
createBox({
  size: [20, 50, 1], // Width, height, thickness
  color: 0x32cd32,
  texture: texture,
  mass: 0,
  position: [0, 5, -750], // Position the wall at the front (start of the road)
  scene,
  world,
});

createBox({
  size: [20, 50, 1],
  color: 0x32cd32,
  texture: texture,
  mass: 0,
  position: [0, 5, 750], // Position the wall at the back (end of the road)
  scene,
  world,
});
// Adjusted width of the road

// Goal Box
const goalBox = createGoalBox({
  size: [10, 10, 10],
  color: 0x00ff00,
  position: [0, 5, 655],
  scene: scene,
  label: "GOAL",
});

// Follow Camera
const followCamera = new FollowCamera(camera);

// Countdown
// const countdownElement = document.getElementById("countdown");
// startCountdown(20, countdownElement);

// Check if car reaches goal
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
    console.log("Goal reached! Race is over.");
    window.location.href = "../houndsHtml/letter3.html";
  }
}

// Edit Mode Controls
let isEditMode = false;
document.addEventListener("keydown", (event) => {
  if (event.key === "e") {
    isEditMode = true;
    controls.enabled = true;
  } else if (event.key === "p") {
    isEditMode = false;
    controls.enabled = false;
  }
});

// Start Match
//startMatch();

const countdownElement = document.getElementById("countdown");
// Call this function at the start to initiate countdown
//preRaceCountdown(0, () => {
// Start main race timer after countdown completes
startCountdown(23, countdownElement, 3);
//});
startMatch();

// Set up win condition timer
let startTime = Date.now();
const winConditionTime = 30 * 1000; // 1 minute 30 seconds in milliseconds

// Animation Loop with Win Condition Check
const timeStep = 1 / 60;
let lastCallTime;

// car.car.chassisBody.addEventListener("collide", (event) => {
//   if (!hasCollided) {
//     staticObstacles.concat(movingObstacles).forEach((obstacle) => {
//       if (event.body === obstacle.body) {
//         hasCollided = true;
//         console.log("Collision detected with obstacle! Game Over.");
//         window.location.href = "../lose.html";
//       }
//     });
//   }
// });

const tick = () => {
  //stats.begin();
  controls.update();

  const time = performance.now() / 1000;
  const dt = lastCallTime ? time - lastCallTime : timeStep;
  world.step(timeStep, dt);
  lastCallTime = time;

  movingObstacles.forEach((obstacle) => obstacle.updatePosition());

  const carSpeed = car.getSpeed();
  const carGear = car.getGear();
  const carRpm = car.getRpm();
  drawSpeedo(carSpeed, carGear, carRpm, 160, car.isReverse);

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

  // Check goal and update follow camera
  checkGoal(carPosition, goalBox);
  if (!isEditMode) followCamera.update(carPosition, carQuaternion);

  // Check for win condition
  //const elapsedTime = Date.now() - startTime;
  // if (!hasCollided && elapsedTime > winConditionTime) {
  //   console.log("Player has won! Time exceeded without collision.");
  //   window.location.href = "../win.html";
  // }

  miniMap.update(carPosition, carQuaternion);

  renderer.render(scene, camera);
  //stats.end();

  window.requestAnimationFrame(tick);
};
tick();
