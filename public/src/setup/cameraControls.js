import { OrbitControls } from "../OrbitControls.js";

export function createControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  return controls;
}

//not car related, for car camera controls go to followCamera.js
