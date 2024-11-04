import * as THREE from "three";

export function loadCubeTextures() {
  const cubeTextureLoader = new THREE.CubeTextureLoader();
  return cubeTextureLoader.load([
    "/textures/environmentMaps/px.png",
    "/textures/environmentMaps/nx.png",
    "/textures/environmentMaps/py.png",
    "/textures/environmentMaps/ny.png",
    "/textures/environmentMaps/pz.png",
    "/textures/environmentMaps/nz.png",
  ]);
}

//someone add a skybox
export function loadSkybox(scene) {
  console.log("here");
  let materialArray = [];
  let texture_ft = new THREE.TextureLoader().load(
    "/skyboxes/sky/yonder_ft.jpg"
  );
  let texture_bk = new THREE.TextureLoader().load(
    "/skyboxes/sky/yonder_bk.jpg"
  );
  let texture_up = new THREE.TextureLoader().load(
    "/skyboxes/sky/yonder_up.jpg"
  );
  let texture_dn = new THREE.TextureLoader().load(
    "/skyboxes/sky/yonder_dn.jpg"
  );
  let texture_rt = new THREE.TextureLoader().load(
    "/skyboxes/sky/yonder_rt.jpg"
  );
  let texture_lf = new THREE.TextureLoader().load(
    "/skyboxes/sky/yonder_lf.jpg"
  );

  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

  for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;

  let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
  let skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);
}

export function loadSkybox2(scene) {
  console.log("here");
  let materialArray = [];
  let texture_ft = new THREE.TextureLoader().load(
    "/skyboxes/sky/divine_ft.jpg"
  );
  let texture_bk = new THREE.TextureLoader().load(
    "/skyboxes/sky/divine_bk.jpg"
  );
  let texture_up = new THREE.TextureLoader().load(
    "/skyboxes/sky/divine_up.jpg"
  );
  let texture_dn = new THREE.TextureLoader().load(
    "/skyboxes/sky/divine_dn.jpg"
  );
  let texture_rt = new THREE.TextureLoader().load(
    "/skyboxes/sky/divine_rt.jpg"
  );
  let texture_lf = new THREE.TextureLoader().load(
    "/skyboxes/sky/divine_lf.jpg"
  );

  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

  for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;

  let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
  let skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);
}

export function loadWrathbox(scene) {
  console.log("here");
  let materialArray = [];
  let texture_ft = new THREE.TextureLoader().load(
    "/skyboxes/wrath/wrath_ft.jpg"
  );
  let texture_bk = new THREE.TextureLoader().load(
    "/skyboxes/wrath/wrath_bk.jpg"
  );
  let texture_up = new THREE.TextureLoader().load(
    "/skyboxes/wrath/wrath_up.jpg"
  );
  let texture_dn = new THREE.TextureLoader().load(
    "/skyboxes/wrath/wrath_dn.jpg"
  );
  let texture_rt = new THREE.TextureLoader().load(
    "/skyboxes/wrath/wrath_rt.jpg"
  );
  let texture_lf = new THREE.TextureLoader().load(
    "/skyboxes/wrath/wrath_lf.jpg"
  );

  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

  for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;

  let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
  let skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);
}
