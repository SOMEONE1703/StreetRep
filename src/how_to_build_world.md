go to your level,
After the line:
scene.environment = loadCubeTextures();

add your boxes like:
const box1 = createBox({
  size: [2, 4, 2],
  color: 0xff0000,
  mass: 5000,
  position: [0, 50, 100],
  scene: scene,
  world: world,
  rotationY: Math.PI/2,
});
scene and world should striclty be that, the rest feel free to change
the rotation is in radians and it rotates around the y axis


if your object is not supposed to move, set its mass to 0 and don't bother with the following part 
{
then go to:
const tick = () => {
  stats.begin();
  controls.update();

then add somex like:
box1.mesh.position.set(
    box1.body.position.x,
    box1.body.position.y,
    box1.body.position.z
  );
}

There you go, you are done with the first box

- The y position should probably be equal or greater to half your height

There's a function to create a goal area, if the car enters this area the game ends and you win.
You create the goal area like this:
// Create the goal box
const goalBox = createGoalBox({
  size: [13, 6, 10],
  color: 0x0000ff,
  position: [370, 3, 5],
  scene: scene,
  label: "GOAL",
});

Then you go inside tick() and call it like this:
checkGoal(carPosition, goalBox);

Viola, goal area now work, might need a bit of redesign though, but it works


