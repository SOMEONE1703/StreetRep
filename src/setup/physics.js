import * as CANNON from "cannon-es";
import cannonDebugger from "cannon-es-debugger";

export function initPhysics(scene) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
  world.broadphase = new CANNON.SAPBroadphase(world);

  const bodyMaterial = new CANNON.Material();
  const groundMaterial = new CANNON.Material();
  const contactMaterial = new CANNON.ContactMaterial(
    bodyMaterial,
    groundMaterial,
    {
      friction: 0.1,
      restitution: 0.3,
    }
  );
  world.addContactMaterial(contactMaterial);

  cannonDebugger(scene, world.bodies, { color: 0x00ff00 });
  return { world };
}
