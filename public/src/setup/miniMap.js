import * as THREE from "three";

export class MiniMap {
  constructor(miniMapElement, scene, mainCamera) {
    this.miniMapElement = miniMapElement;
    this.scene = scene;
    this.mainCamera = mainCamera;

    // Create a WebGLRenderer for the minimap
    this.miniMapRenderer = new THREE.WebGLRenderer({ alpha: true });
    this.miniMapRenderer.setSize(this.miniMapElement.offsetWidth, this.miniMapElement.offsetHeight);
    this.miniMapElement.appendChild(this.miniMapRenderer.domElement);

    // Create a camera for the minimap
    this.miniMapCamera = new THREE.PerspectiveCamera(
      45,
      this.miniMapElement.offsetWidth / this.miniMapElement.offsetHeight,
      0.1,
      1000
    );
    this.miniMapCamera.position.set(0, 50, 0); // Initial position above the scene
    
    this.miniMapCamera.lookAt(0, 0, 0);

    // Set the minimap background
    this.miniMapScene = new THREE.Scene();
    this.miniMapScene.background = new THREE.Color(0x444444);
  }

  update() {
    // Update the minimap camera's position based on the main camera
    this.miniMapCamera.position.x = this.mainCamera.position.x;
    this.miniMapCamera.position.z = this.mainCamera.position.z;

    // Maintain a fixed height for the minimap camera
    this.miniMapCamera.position.y = 75; // You can adjust this height as needed

    // Keep the minimap camera looking down at the scene
    this.miniMapCamera.lookAt(this.mainCamera.position.x, 0, this.mainCamera.position.z);
    this.miniMapCamera.rotation.z=this.mainCamera.rotation.z;
    // Render the minimap scene
    this.miniMapRenderer.render(this.scene, this.miniMapCamera);
  }
}
