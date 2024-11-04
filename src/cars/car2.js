import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export default class Car2 {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.car = {};
    this.chassis = {};
    this.wheels = [];
    this.targetPosition = null; // Target position for the AI
    this.chassisDimension = { x: 1.96, y: 1, z: 4.47 };
    this.chassisModelPos = { x: 0, y: -0.59, z: 0 };
    this.wheelScale = { frontWheel: 0.67, hindWheel: 0.67 };
    this.mass = 250;
  }

  // Set the target position for AI navigation
  setTarget(position) {
    this.targetPosition = new CANNON.Vec3(position.x, position.y, position.z);
  }

  init() {
    this.loadModels();
    this.setupChassis();
    this.setInitialPosition({ x: 2, y: 2, z: 0 }, { x: 0, y: 0, z: 0 });
    this.setWheels();
    this.update();
  }

  loadModels() {
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: "js" });
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load("./car/chassis.gltf", (gltf) => {
      this.chassis = gltf.scene;
      this.scene.add(this.chassis);
    });

    this.wheels = [];
    for (let i = 0; i < 4; i++) {
      gltfLoader.load("./car/wheel.gltf", (gltf) => {
        const wheelModel = gltf.scene;
        this.wheels[i] = wheelModel;
        if (i === 1 || i === 3)
          this.wheels[i].scale.set(
            -1 * this.wheelScale.frontWheel,
            1 * this.wheelScale.frontWheel,
            -1 * this.wheelScale.frontWheel
          );
        else
          this.wheels[i].scale.set(
            1 * this.wheelScale.frontWheel,
            1 * this.wheelScale.frontWheel,
            1 * this.wheelScale.frontWheel
          );
        this.scene.add(wheelModel);
      });
    }
  }

  setupChassis() {
    const chassisShape = new CANNON.Box(
      new CANNON.Vec3(
        this.chassisDimension.x * 0.5,
        this.chassisDimension.y * 0.5,
        this.chassisDimension.z * 0.5
      )
    );
    const chassisBody = new CANNON.Body({
      mass: this.mass,
      material: new CANNON.Material({ friction: 0.3 }),
    });
    chassisBody.addShape(chassisShape);

    this.car = new CANNON.RaycastVehicle({
      chassisBody,
      indexRightAxis: 0,
      indexUpAxis: 1,
      indexForwardAxis: 2,
    });
    this.car.addToWorld(this.world);
  }

  setWheels() {
    this.car.wheelInfos = [];
    this.car.addWheel({
      radius: 0.34,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 55,
      suspensionRestLength: 0.5,
      frictionSlip: 30,
      dampingRelaxation: 2.3,
      dampingCompression: 4.3,
      maxSuspensionForce: 10000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(0.75, 0.1, -1.32),
      maxSuspensionTravel: 1,
      customSlidingRotationalSpeed: 30,
    });
    this.car.addWheel({
      radius: 0.34,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 55,
      suspensionRestLength: 0.5,
      frictionSlip: 30,
      dampingRelaxation: 2.3,
      dampingCompression: 4.3,
      maxSuspensionForce: 10000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(-0.78, 0.1, -1.32),
      maxSuspensionTravel: 1,
      customSlidingRotationalSpeed: 30,
    });
    this.car.addWheel({
      radius: 0.34,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 55,
      suspensionRestLength: 0.5,
      frictionSlip: 30,
      dampingRelaxation: 2.3,
      dampingCompression: 4.3,
      maxSuspensionForce: 10000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(0.75, 0.1, 1.25),
      maxSuspensionTravel: 1,
      customSlidingRotationalSpeed: 30,
    });
    this.car.addWheel({
      radius: 0.34,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 55,
      suspensionRestLength: 0.5,
      frictionSlip: 30,
      dampingRelaxation: 2.3,
      dampingCompression: 4.3,
      maxSuspensionForce: 10000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(-0.78, 0.1, 1.25),
      maxSuspensionTravel: 1,
      customSlidingRotationalSpeed: 30,
    });

    this.car.wheelInfos.forEach(
      function (wheel, index) {
        const cylinderShape = new CANNON.Cylinder(
          wheel.radius,
          wheel.radius,
          wheel.radius / 2,
          20
        );
        const wheelBody = new CANNON.Body({
          mass: 1,
          material: new CANNON.Material({ friction: 0 }),
        });
        const quaternion = new CANNON.Quaternion().setFromEuler(
          -Math.PI / 2,
          0,
          0
        );
        wheelBody.addShape(cylinderShape, new CANNON.Vec3(), quaternion);
        // this.wheels[index].wheelBody = wheelBody;
      }.bind(this)
    );
  }
  // AI movement control towards target
  driveToTarget() {
    if (!this.targetPosition) return;

    const maxForce = 750;
    const maxSteerVal = 0.5;
    const steeringDamping = 0.1; // Added damping factor to smooth steering
    const angleThreshold = 0.1; // Minimum angle before steering is applied
    const targetThreshold = 50; // Distance threshold for slowing down
    const brakeForce = 36;

    // Calculate direction to target
    const direction = new CANNON.Vec3()
      .copy(this.targetPosition)
      .vsub(this.car.chassisBody.position);
    const distance = direction.length();
    direction.normalize();

    const brake = () => {
      this.car.setBrake(brakeForce, 0);
      this.car.setBrake(brakeForce, 1);
      this.car.setBrake(brakeForce, 2);
      this.car.setBrake(brakeForce, 3);
    };

    if (distance < 17) {
      brake();
      return;
    }

    console.log(this.car.chassisBody.position);

    // Get car's forward vector
    const carForward = this.car.chassisBody.quaternion.vmult(
      new CANNON.Vec3(0, 0, -1)
    );

    // Calculate angle between car's forward direction and target direction
    const dotProduct = direction.dot(carForward);
    const angleToTarget = Math.acos(Math.max(-1, Math.min(1, dotProduct)));

    // Calculate steering with damping and threshold
    let steerValue = 0;
    if (Math.abs(angleToTarget) > angleThreshold) {
      const crossProduct = direction.cross(carForward);
      const steerDirection = Math.sign(crossProduct.y);
      steerValue =
        steerDirection *
        maxSteerVal *
        Math.min(1, angleToTarget / Math.PI) *
        steeringDamping;
    }

    // Apply steering more smoothly
    this.car.setSteeringValue(steerValue, 2);
    this.car.setSteeringValue(steerValue, 3);

    // Apply engine force with gradual slowdown
    let engineForce = -maxForce;
    if (distance < targetThreshold) {
      // Gradually reduce force as we get closer to target
      engineForce *= Math.max(0, (distance - 0.5) / targetThreshold);
    }

    // Apply engine force to all wheels
    for (let i = 0; i < 4; i++) {
      this.car.applyEngineForce(engineForce, i);
    }
  }

  setInitialPosition(
    position = { x: 0, y: 4, z: 0 },
    rotation = { x: 0, y: 0, z: 0 }
  ) {
    this.car.chassisBody.position.set(position.x, position.y, position.z);
    const quaternion = new CANNON.Quaternion();
    quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    this.car.chassisBody.quaternion.copy(quaternion);
    this.car.chassisBody.velocity.set(0, 0, 0);
    this.car.chassisBody.angularVelocity.set(0, 0, 0);
  }

  update() {
    const updateWorld = () => {
      if (
        this.car.wheelInfos &&
        this.chassis.position &&
        this.wheels[0].position
      ) {
        this.chassis.position.set(
          this.car.chassisBody.position.x + this.chassisModelPos.x,
          this.car.chassisBody.position.y + this.chassisModelPos.y,
          this.car.chassisBody.position.z + this.chassisModelPos.z
        );
        this.chassis.quaternion.copy(this.car.chassisBody.quaternion);

        // Correct wheel positions and rotations
        for (let i = 0; i < 4; i++) {
          if (this.car.wheelInfos[i]) {
            this.car.updateWheelTransform(i);

            // Positioning and rotating wheels
            this.wheels[i].position.copy(
              this.car.wheelInfos[i].worldTransform.position
            );
            this.wheels[i].quaternion.copy(
              this.car.wheelInfos[i].worldTransform.quaternion
            );

            // Adjust quaternion to align with the wheel's axis
            // const rotationCorrection = new THREE.Quaternion();
            // rotationCorrection.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);
            // this.wheels[i].quaternion
            //   .copy(this.car.wheelInfos[i].worldTransform.quaternion)
            //   .multiply(rotationCorrection);
          }
        }
      }
      this.driveToTarget(); // Run AI driving logic
    };

    this.world.addEventListener("postStep", updateWorld);
  }
}
