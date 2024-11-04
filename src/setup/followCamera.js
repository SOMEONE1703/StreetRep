// followCamera.js
import * as THREE from "three";

export class FollowCamera {
  constructor(camera, offset = new THREE.Vector3(0, 2, -6)) {
    this.offsets=[
      new THREE.Vector3(0, 2, -6),
      new THREE.Vector3(0,1,1),
      new THREE.Vector3(0,1.5,-3)
    ];
    this.camera = camera;
    this.index=0;
    this.offset = offset;
    this.defaultOffset = offset.clone();
    
    // Track key states
    this.keys = { forward: false, left: false, back: false, right: false };

    // Event listeners
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    window.addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    if(e.key=="c"){
      this.index = (this.index + 1) % this.offsets.length;
      this.offset = this.offsets[this.index].clone();
      console.log(this.offset);
    }
    if (e.key === "w") this.keys.forward = true;
    if (e.key === "a") this.keys.left = true;
    if (e.key === "s") this.keys.back = true;
    if (e.key === "d") this.keys.right = true;
  }

  handleKeyUp(e) {
    if (e.key === "w") this.keys.forward = false;
    if (e.key === "a") this.keys.left = false;
    if (e.key === "s") this.keys.back = false;
    if (e.key === "d") this.keys.right = false;
  }

  updateOffset() {
    // Reset to default values initially
    this.offset.x = this.defaultOffset.x;
    this.offset.z = this.defaultOffset.z;
    // Apply combined offsets for directional keys
    if (this.keys.forward && this.keys.left){
      this.offset.z = -6;
      this.offset.x = 6;
    }
    else if (this.keys.forward && this.keys.right){
      this.offset.z = -6;
      this.offset.x = -6;
    }
    else if (this.keys.back && this.keys.left){
      this.offset.z = 6;
      this.offset.x = 6;
    }
    else if (this.keys.back && this.keys.right){
      this.offset.z = 6;
      this.offset.x = -6;
    }
    else if (this.keys.forward) {
      this.offset.z = -6;
    }
    else if (this.keys.back) {
      this.offset.z = 6;
    }
    else if (this.keys.left) {
      this.offset.x = 6;
      this.offset.z = 0;
    }
    else if (this.keys.right) {
      this.offset.x = -6;
      this.offset.z = 0;
    }
  }

  update(carPosition, carQuaternion) {
    this.updateOffset();

    // Calculate the world offset using the car's orientation
    const worldOffset = this.offset.clone().applyQuaternion(carQuaternion);
    const cameraPosition = carPosition.clone().add(worldOffset);

    // Smoothly set camera position
    this.camera.position.set(
      cameraPosition.x,
      cameraPosition.y,
      cameraPosition.z
    );
    this.camera.lookAt(carPosition);
  }
}
