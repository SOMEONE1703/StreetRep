import * as THREE from "three";

export function setupLights(scene) {
  // Create a directional light with white color and specified intensity
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(100, 350, 100); // Position the light at an elevated angle
  scene.add(light);

  // Enable shadows for the light
  light.castShadow = true;

  // Set the shadow map size for better resolution
  light.shadow.mapSize.width = 2 * 2048; // Adjust for shadow quality
  light.shadow.mapSize.height = 2 * 2048;

  // Set the shadow camera to cover an 800x800 area
  light.shadow.camera.left = -800; // -800 / 2
  light.shadow.camera.right = 800; // 800 / 2
  light.shadow.camera.top = 800; // 800 / 2
  light.shadow.camera.bottom = -800; // -800 / 2

  // Set the shadow camera near and far planes to enclose the scene
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 1000;

  // Optional: visualize the shadow camera to see the area covered
  // const shadowHelper = new THREE.CameraHelper(light.shadow.camera);
  // scene.add(shadowHelper);
}
