import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import details from "./details.json";

// Set up Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Set up Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Sky blue color

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

let room;
loader.load(
    "/showroom/trial.gltf",
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
