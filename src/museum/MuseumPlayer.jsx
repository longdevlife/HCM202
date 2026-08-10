import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { WALKABLE_ZONES } from "./museumData";

const DEFAULT_CAMERA_HEIGHT = 2.65;
const MIN_LOOK_PITCH = -0.5;
const MAX_LOOK_PITCH = 0.58;
const CONTROL_KEYS = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

/**
 * Check if a point (x, z) is inside any walkable zone.
 */
function isInsideWalkableArea(x, z) {
  return WALKABLE_ZONES.some(
    (zone) => x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ
  );
}

export function MuseumPlayer({ enabled = true }) {
  const { camera } = useThree();
  const keys = useRef({});
  const velocity = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!enabled) {
      keys.current = {};
      velocity.current.set(0, 0, 0);
    }
  }, [enabled]);

  useEffect(() => {
    camera.rotation.order = "YXZ";

    const handleKeyDown = (event) => {
      if (CONTROL_KEYS.includes(event.code)) {
        event.preventDefault();
        if (!enabled) return;
      }
      keys.current[event.code] = true;
    };
    const handleKeyUp = (event) => {
      keys.current[event.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [camera, enabled]);

  useFrame((_, delta) => {
    if (!enabled) {
      velocity.current.set(0, 0, 0);
      return;
    }

    const speed = 4.2;
    const yawSpeed = 1.5;
    const pitchSpeed = 1.1;

    velocity.current.set(0, 0, 0);

    if (keys.current.KeyW) velocity.current.z -= speed;
    if (keys.current.KeyS) velocity.current.z += speed;
    if (keys.current.KeyA) velocity.current.x -= speed;
    if (keys.current.KeyD) velocity.current.x += speed;

    if (keys.current.ArrowLeft) camera.rotation.y += yawSpeed * delta;
    if (keys.current.ArrowRight) camera.rotation.y -= yawSpeed * delta;
    if (keys.current.ArrowUp) {
      camera.rotation.x = Math.min(MAX_LOOK_PITCH, camera.rotation.x + pitchSpeed * delta);
    }
    if (keys.current.ArrowDown) {
      camera.rotation.x = Math.max(MIN_LOOK_PITCH, camera.rotation.x - pitchSpeed * delta);
    }

    camera.rotation.z = 0;

    const angle = camera.rotation.y;
    const forward = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
    const right = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));

    // Calculate intended new position
    const newPos = camera.position.clone();
    newPos.addScaledVector(forward, velocity.current.z * delta);
    newPos.addScaledVector(right, velocity.current.x * delta);

    // Collision: only move if new position is inside a walkable zone
    // Try X and Z independently for wall-sliding
    const tryX = newPos.x;
    const tryZ = newPos.z;

    if (isInsideWalkableArea(tryX, camera.position.z)) {
      camera.position.x = tryX;
    }
    if (isInsideWalkableArea(camera.position.x, tryZ)) {
      camera.position.z = tryZ;
    }

    camera.position.y = DEFAULT_CAMERA_HEIGHT;
  });

  return null;
}
