import * as THREE from "./three.module.min.js";
console.log("here");
import { OrbitControls } from './OrbitControls.js';
import { GLTFLoader } from "./GLTFLoader.js";
//import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
//import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
//import details from "./details.json";
var details=[
    {
        "name":"Ford Mustang Shelby GT500",
        "logo":"./public/cars/ford_mustang_shelby_gt500/shelby.png",
        "show_scale":[0.7,0.7,0.7],
        "game_scale":[0.865,0.865,0.865],
        "chassis_displacement":[0,0.22,0],
        "wheel_scale":1.35,
        "chassis_path":"./public/cars/ford_mustang_shelby_gt500/chassis.gltf",
        "wheel_path":"./public/cars/ford_mustang_shelby_gt500/wheel.gltf",
        "wheel_orientation":[1,-1,1,-1],
        "game_wheels":[[-0.71,0.07,-1.07],[0.71,0.07,-1.07],[-0.71,0.07,1.26],[0.71,0.07,1.27]],
        "wheel_positions":[[-0.6,0.18,1.04],[0.6,0.18,1.04],[-0.58,0.18,-0.86],[0.58,0.18,-0.86]]
    },
    {
        "name":"Porsche 911 GT3",
        "logo":"./public/cars/porsche_911_gt3/porsche.png",
        "show_scale":[0.55,0.55,0.55],
        "game_scale":[0.78,0.78,0.78],
        "chassis_displacement":[0,0.18,0],
        "wheel_scale":1.2,
        "chassis_path":"./public/cars/porsche_911_gt3/chassis.gltf",
        "wheel_path":"./public/cars/porsche_911_gt3/wheel.gltf",
        "wheel_orientation":[1,-1,1,-1],
        "game_wheels":[[-0.65,0.15,-1.17],[0.65,0.15,-1.17],[-0.65,0.15,1.12],[0.65,0.15,1.12]],
        "wheel_positions":[[-0.48,0.22,0.79],[0.48,0.22,0.79],[-0.48,0.22,-0.83],[0.48,0.22,-0.83]]
    },
    {
        "name":"BMW M6 Gran Coupe",
        "logo":"./public/cars/bmw_m6_gran_coupe/bmw.png",
        "show_scale":[0.7,0.7,0.7],
        "game_scale":[0.865,0.865,0.865],
        "chassis_displacement":[0,0.125,0.5],
        "wheel_scale":-1.35,
        "chassis_path":"./public/cars/bmw_m6_gran_coupe/chassis.gltf",
        "wheel_path":"./public/cars/bmw_m6_gran_coupe/wheel.gltf",
        "wheel_orientation":[-1,1,-1,1],
        "game_wheels":[[-0.68,0.2,-1.45],[0.68,0.2,-1.45],[-0.68,0.2,1.2],[0.68,0.2,1.2]],
        "wheel_positions":[[-0.56,0.27,0.98],[0.56,0.27,0.98],[-0.56,0.27,-1.19],[0.56,0.27,-1.19]]
    },
    {
        "name":"McLaren P1",
        "logo":"./public/cars/mclaren_p1/mclaren.png",
        "show_scale":[0.55,0.55,0.55],
        "game_scale":[0.78,0.78,0.78],
        "chassis_displacement":[0,0.18,0],
        "wheel_scale":-1.2,
        "chassis_path":"./public/cars/mclaren_p1/chassis.gltf",
        "wheel_path":"./public/cars/mclaren_p1/wheel.gltf",
        "wheel_orientation":[-1,1,-1,1],
        "game_wheels":[[-0.65,0.15,-1.04],[0.65,0.15,-1.04],[-0.65,0.15,1.45],[0.65,0.15,1.45]],
        "wheel_positions":[[-0.52,0.22,1.03],[0.515,0.22,1.03],[-0.52,0.22,-0.76],[0.515,0.22,-0.76]]
    }
]

// Set up Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
console.log("uhm");
// Set up Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Sky blue color
console.log("uhm");
// Set up Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(-2, 2, -2);

// Set up Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth the control movements

// Add Lighting, other(spotlights) lights are built into the model with Blender
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft light
scene.add(ambientLight);

//Setup the camera controls
class cameraControls{
    constructor(car){
        this.car = car;
        this.zoomSpeed=1;
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
    }
    onKeyDown(event){
        //Zoom in
        if (event.key==="+"){
            if (camera.fov > 10){
                camera.fov -= this.zoomSpeed;
                camera.updateProjectionMatrix();
            }
        }
        //Zoom out
        if (event.key==="-"){
            if (camera.fov < 100){
                camera.fov += this.zoomSpeed;
                camera.updateProjectionMatrix();
            }
        }
    }
}
  
// Add Ground Plane
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x000000,
});
const groundMesh=new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.rotation.x=-Math.PI / 2;//Rotate to lie flat
groundMesh.position.y=0;
scene.add(groundMesh);

//+++++++++++++++++++++++++++++++++++++++++++++++++++++
//Setup the car selection
//const cars=["porsche","bmw_m6_gran_coupe","ford_mustang_shelby_gt500"];
const cars=details;

var index=0;
let s=localStorage.getItem("StreetCredCar");
if (s){
    console.log(s);
    index=parseInt(s);
    if (!index){
        index=0;
    }
}

// Load the Showroom Model
const loader = new GLTFLoader();
console.log("uhm");
let room;
loader.load(
    "./public/showroom/trial.gltf",
    (gltf) => {
        room = gltf.scene;
        room.scale.set(0.5, 0.5, 0.5);
        room.position.x = 0;
        room.position.y = 0;
        room.position.z = -1;
        //new CANNON.Vec3(36,0,24)
        scene.add(room);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
        console.error("An error occurred while loading the model:", error);
    }
);
var loading=false;
//Function to load the car
async function load_car() {
    return new Promise((resolve, reject) => {
        if (loading) return;
        let him=document.getElementById("holder");
        if(!him.firstChild){
            let her=document.createElement("div");
            her.className="loader";
            him.appendChild(her);
        }
        loading = true;
        
        const car_set = [];
        const loader = new GLTFLoader();
        
        // Load chassis
        loader.load(
            details[index].chassis_path,
            (gltf) => {
                const car_obj = gltf.scene;
                car_obj.scale.set(
                    details[index].show_scale[0],
                    details[index].show_scale[1],
                    details[index].show_scale[2]
                );
                car_obj.position.set(
                    details[index].chassis_displacement[0],
                    details[index].chassis_displacement[1],
                    details[index].chassis_displacement[2]
                );
                
                car_set.push(car_obj); // Add chassis to car_set
                var camera_controls = new cameraControls(car_obj); // Set up camera controls
                
                // Load wheels in parallel
                const wheelPromises = [];
                
                for (let i = 0; i < 4; i++) {
                    wheelPromises.push(
                        new Promise((resolveWheel, rejectWheel) => {
                            loader.load(
                                details[index].wheel_path,
                                (gltf) => {
                                    const wheel = gltf.scene;
                                    wheel.scale.set(
                                        details[index].show_scale[0] * details[index].wheel_orientation[i],
                                        details[index].show_scale[1] * details[index].wheel_orientation[i],
                                        details[index].show_scale[2] * details[index].wheel_orientation[i]
                                    );
                                    wheel.position.set(
                                        car_obj.position.x + details[index].wheel_positions[i][0],
                                        car_obj.position.y + details[index].wheel_positions[i][1],
                                        car_obj.position.z + details[index].wheel_positions[i][2]
                                    );

                                    if (i === 0) {
                                        scene.add(car_obj); // Add chassis to the scene once
                                    }
                                    
                                    scene.add(wheel); // Add each wheel to the scene
                                    car_set.push(wheel); // Add wheel to car_set
                                    resolveWheel();
                                },
                                (xhr) => {
                                    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
                                },
                                (error) => {
                                    console.error("An error occurred while loading a wheel:", error);
                                    rejectWheel(error); // Reject if there's an error loading the wheel
                                }
                            );
                        })
                    );
                }

                // Wait for all wheels to load before resolving the entire car
                Promise.all(wheelPromises)
                    .then(() => {
                        loading = false;
                        document.getElementById("name").textContent=details[index].name;
                        document.getElementById("image").src=details[index].logo;
                        document.getElementById("holder").replaceChildren();
                        resolve(car_set);
                    })
                    .catch((error) => {
                        loading = false;
                        reject(error); // Reject if any wheel fails to load
                    });
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
            },
            (error) => {
                console.error("An error occurred while loading the chassis:", error);
                loading = false;
                reject(error); // Reject if there's an error loading the chassis
            }
        );
    });
}
//load an initial car
var current_car;
try {
    current_car = await load_car();
    loading=false;
} catch (error) {
    console.error("Failed to load car:", error);
}

async function handleKeydown(e){
    if (loading){
        return;
    }
    //Accept choice
    if (e.key=="Enter"){
        localStorage.setItem("StreetCredCar",index.toString());
        console.log("what");
        window.history.go(-1);
        return;
    }
    else if(e.key=="Escape"){
        window.history.go(-1);
        return;
    }
    else if (e.key=="ArrowRight"){
        if (index==cars.length-1){
            index=0;
        }
        else{
            index++;
        }
    }
    else if (e.key=="ArrowLeft"){
        if (index==0){
            index=cars.length-1;
        }
        else{
            index--;
        }
    }
    else{
        return;
    }
    if (current_car.length>0){
        //remove current car before adding a new one
        for (let i=0;i<current_car.length;i++){
            scene.remove(current_car[i]);
        }
        current_car=[];
    }
    //load new car
    current_car=await load_car();
}
//Listen for key presses
window.addEventListener("keydown",(event) => handleKeydown(event));
// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Adjust on Window Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
