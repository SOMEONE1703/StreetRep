import * as THREE from "three";
import * as CANNON from "cannon-es";
import { matchStarted } from "../gameScreenUI/timer";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import details from "../showroom/details.json";
import { preloadAudio, playAudio, pauseAudio } from "../setup/audioLoader";

//console.log(details);
var index = 0;
let s = localStorage.getItem("StreetCredCar");
if (s) {
  console.log(s);
  index = parseInt(s);
  if (!index) {
    index = 0;
  }
}
export default class Car {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;

    this.car = {};
    this.chassis = {};
    this.wheels = [];
    this.chassisDimension = {
      x: 1.96,
      y: 1,
      z: 4.47,
    };
    this.chassisModelPos = {
      x: 0,
      y: -0.59,
      z: 0,
    };
    this.wheelScale = {
      frontWheel: 0.67,
      hindWheel: 0.67,
    };
    this.mass = 250;
    this.accelerateSource = null;
    this.isAcceleratePlaying = false;
    this.brakeSource = null;
    this.isBrakePlaying = false;
  }

  // Method to get current speed in miles per hour
  getSpeed() {
    // Calculate the speed using the chassisBody velocity vector
    const velocity = this.car.chassisBody.velocity;
    const speed = Math.sqrt(
      velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2
    );
    return (speed * 2.237).toFixed(0); // Convert to mph and format to two decimals
  }
  // Method to get current gear
  getGear() {
    // Here, you might use some logic to determine the gear
    // For demonstration, let's assume gear changes based on speed
    const speed = this.getSpeed();
    if (speed < 20) {
      this.gear = 1;
    } else if (speed < 40) {
      this.gear = 2;
    } else if (speed < 60) {
      this.gear = 3;
    } else if (speed < 80) {
      this.gear = 4;
    } else {
      this.gear = 5;
    }
    return this.gear;
  }

  // Method to get current RPM
  getRpm() {
    // Assuming RPM is a function of speed and gear
    const speed = parseFloat(this.getSpeed());
    this.engineRpm = (speed * 100) / this.gear; // Simplified calculation for RPM
    //console.log(this.engineRpm);
    return this.engineRpm / 1000;
  }

  async init(
    position = { x: -2, y: 2, z: 20 },
    rotation = { x: 0, y: 0, z: 0 }
  ) {
    this.loadModels();
    this.setChassis();
    this.setInitialPosition(position, rotation); // Set initial position here
    this.setWheels();
    await preloadAudio().then(() => {
      console.log("Audio loaded and ready to play.");
    });
    this.controls();
    this.update();
  }

  loadModels() {
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();

    dracoLoader.setDecoderConfig({ type: "js" });
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");

    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(details[index].chassis_path, (gltf) => {
      this.chassis = gltf.scene;
      this.chassis.scale.set(
        details[index].game_scale[0],
        details[index].game_scale[1],
        details[index].game_scale[2]
      );
      this.chassis.castShadow = true; // Enable shadow casting
      this.chassis.receiveShadow = true; // Enable shadow receiving
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      this.scene.add(this.chassis);
    });

    this.wheels = [];
    for (let i = 0; i < 4; i++) {
      gltfLoader.load(details[index].wheel_path, (gltf) => {
        const model = gltf.scene;
        gltf.scene.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        model.scale.set(
          details[index].game_scale[0] * details[index].wheel_scale,
          details[index].game_scale[1] * details[index].wheel_scale,
          details[index].game_scale[2] * details[index].wheel_scale
        );
        model.castShadow = true; // Enable shadow casting for each wheel
        model.receiveShadow = true; // Enable shadow receiving for each wheel
        this.wheels[i] = model;
        if (i === 1 || i === 3)
          this.wheels[i].scale.set(
            -1 * this.wheelScale.frontWheel * details[index].wheel_scale,
            1 * this.wheelScale.frontWheel * details[index].wheel_scale,
            -1 * this.wheelScale.frontWheel * details[index].wheel_scale
          );
        else
          this.wheels[i].scale.set(
            1 * this.wheelScale.frontWheel * details[index].wheel_scale,
            1 * this.wheelScale.frontWheel * details[index].wheel_scale,
            1 * this.wheelScale.frontWheel * details[index].wheel_scale
          );
        this.scene.add(this.wheels[i]);
      });
    }
  }

  setChassis() {
    const chassisShape = new CANNON.Box(
      new CANNON.Vec3(
        this.chassisDimension.x * 0.5,
        this.chassisDimension.y * 0.5,
        this.chassisDimension.z * 0.5
      )
    );
    const chassisBody = new CANNON.Body({
      mass: this.mass,
      material: new CANNON.Material({ friction: 0 }),
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
      chassisConnectionPointLocal: new CANNON.Vec3(
        details[index].game_wheels[0][0],
        details[index].game_wheels[0][1],
        details[index].game_wheels[0][2]
      ),
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
      chassisConnectionPointLocal: new CANNON.Vec3(
        details[index].game_wheels[1][0],
        details[index].game_wheels[1][1],
        details[index].game_wheels[1][2]
      ),
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
      chassisConnectionPointLocal: new CANNON.Vec3(
        details[index].game_wheels[2][0],
        details[index].game_wheels[2][1],
        details[index].game_wheels[2][2]
      ),
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
      chassisConnectionPointLocal: new CANNON.Vec3(
        details[index].game_wheels[3][0],
        details[index].game_wheels[3][1],
        details[index].game_wheels[3][2]
      ),
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

  setInitialPosition(
    position = { x: 0, y: 4, z: 0 },
    rotation = { x: 0, y: 0, z: 0 }
  ) {
    // Set initial position
    this.car.chassisBody.position.set(position.x, position.y, position.z);

    // Set initial rotation
    const quaternion = new CANNON.Quaternion();
    quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    this.car.chassisBody.quaternion.copy(quaternion);

    // Reset any existing velocity
    this.car.chassisBody.velocity.set(0, 0, 0);
    this.car.chassisBody.angularVelocity.set(0, 0, 0);
  }

  async controls() {
    const maxSteerVal = 0.5;
    const maxForce = 750;
    const brakeForce = 36;
    const slowDownCar = 19.6;
    const keysPressed = [];

    window.addEventListener("keydown", (e) => {
      //this.isReverse = true;
      // e.preventDefault();
      if (!keysPressed.includes(e.key.toLowerCase()))
        keysPressed.push(e.key.toLowerCase());
      hindMovement();
    });
    window.addEventListener("keyup", (e) => {
      //this.isReverse = false;
      // e.preventDefault();
      keysPressed.splice(keysPressed.indexOf(e.key.toLowerCase()), 1);
      hindMovement();
    });

    const stopSteer = () => {
      this.car.setSteeringValue(0, 2);
      this.car.setSteeringValue(0, 3);
    };

    const resetCar = () => {
      this.car.chassisBody.position.set(0, 4, 0);
      this.car.chassisBody.quaternion.set(0, 0, 0, 1);
      this.car.chassisBody.angularVelocity.set(0, 0, 0);
      this.car.chassisBody.velocity.set(0, 0, 0);
    };

    const brake = () => {
      this.car.setBrake(brakeForce, 0);
      this.car.setBrake(brakeForce, 1);
      this.car.setBrake(brakeForce, 2);
      this.car.setBrake(brakeForce, 3);
    };

    const stopCar = () => {
      this.car.setBrake(slowDownCar, 0);
      this.car.setBrake(slowDownCar, 1);
      this.car.setBrake(slowDownCar, 2);
      this.car.setBrake(slowDownCar, 3);
    };

    const playEngineSound = () => {
      if (!this.isAcceleratePlaying) {
        this.accelerateSource = playAudio("accelerate");
        this.isAcceleratePlaying = true;
      }
    };
    const pauseEngineSound = () => {
      if (this.isAcceleratePlaying) {
        pauseAudio(this.accelerateSource);
        this.isAcceleratePlaying = false;
      }
    };
    const playBrakeSound = () => {
      if (!this.isBrakePlaying) {
        this.brakeSource = playAudio("brake");
        this.isBrakePlaying = true;
      }
    };
    const pauseBrakeSound = () => {
      if (this.isBrakePlaying) {
        pauseAudio(this.brakeSource);
        this.isBrakePlaying = false;
      }
    };

    const hindMovement = () => {
      if (keysPressed.includes("r") || keysPressed.includes("r")) resetCar();

      if (!keysPressed.includes(" ") && !keysPressed.includes(" ")) {
        pauseBrakeSound();
        this.car.setBrake(0, 0);
        this.car.setBrake(0, 1);
        this.car.setBrake(0, 2);
        this.car.setBrake(0, 3);

        if (matchStarted) {
          if (keysPressed.includes("arrowleft")) {
            console.log("left");
            this.car.setSteeringValue(maxSteerVal * 1, 2);
            this.car.setSteeringValue(maxSteerVal * 1, 3);
          } else if (keysPressed.includes("arrowright")) {
            this.car.setSteeringValue(maxSteerVal * -1, 2);
            this.car.setSteeringValue(maxSteerVal * -1, 3);
          } else stopSteer();

          if (keysPressed.includes("arrowup")) {
            if (this.getSpeed() > 30) playEngineSound();
            this.isReverse = false;
            this.car.applyEngineForce(maxForce * -1, 0);
            this.car.applyEngineForce(maxForce * -1, 1);
            this.car.applyEngineForce(maxForce * -1, 2);
            this.car.applyEngineForce(maxForce * -1, 3);
          } else if (keysPressed.includes("arrowdown")) {
            pauseEngineSound();
            this.isReverse = true;
            this.car.applyEngineForce(maxForce * 1, 0);
            this.car.applyEngineForce(maxForce * 1, 1);
            this.car.applyEngineForce(maxForce * 1, 2);
            this.car.applyEngineForce(maxForce * 1, 3);
          } else {
            pauseEngineSound();
            stopCar();
          }
        } else {
          pauseEngineSound();
          //playBrakeSound();
          brake();
        }
      } else {
        pauseEngineSound();
        if (this.getSpeed() > 3) {
          playBrakeSound();
        } else {
          pauseBrakeSound();
        }
        brake();
      }
    };
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
        for (let i = 0; i < 4; i++) {
          if (this.car.wheelInfos[i]) {
            this.car.updateWheelTransform(i);
            this.wheels[i].position.copy(
              this.car.wheelInfos[i].worldTransform.position
            );
            this.wheels[i].quaternion.copy(
              this.car.wheelInfos[i].worldTransform.quaternion
            );
          }
        }
      }
    };
    this.world.addEventListener("postStep", updateWorld);
  }
}
