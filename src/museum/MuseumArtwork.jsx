import { useTexture } from "@react-three/drei";
import { useCallback, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const FRAME_DARK = "#24170e";
const FRAME_GOLD_DARK = "#b99043";
const FRAME_GOLD_LIGHT = "#d2ad61";
const FRAME_INNER_VELVET = "#140e0a";

export function MuseumArtwork({ panel, focused, onSelect }) {
  const texture = useTexture(panel.imageSrc || "/textures/bìa đầu.png");
  texture.colorSpace = THREE.SRGBColorSpace;
  
  const groupRef = useRef(null);
  const spotLightRef = useRef(null);
  const frameMatRef = useRef(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const artworkPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(artworkPos);

    const toArtwork = new THREE.Vector3().subVectors(artworkPos, state.camera.position);
    const distance = toArtwork.length();
    toArtwork.normalize();

    const cameraForward = new THREE.Vector3();
    state.camera.getWorldDirection(cameraForward);

    const dot = cameraForward.dot(toArtwork);
    const isLookingAt = dot > 0.85 && distance < 15;

    const targetIntensity = isLookingAt ? 2.5 : 0.0;
    const currentIntensity = spotLightRef.current ? spotLightRef.current.intensity : 0;
    const newIntensity = THREE.MathUtils.lerp(currentIntensity, targetIntensity, delta * 6);
    
    if (spotLightRef.current) spotLightRef.current.intensity = newIntensity;
    if (frameMatRef.current) {
        frameMatRef.current.emissive = new THREE.Color("#ffc445");
        frameMatRef.current.emissiveIntensity = newIntensity * 0.4;
    }
  });

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (onSelect) onSelect(panel);
  }, [onSelect, panel]);

  return (
    <group
      ref={groupRef}
      position={panel.position}
      rotation={panel.rotation}
      scale={focused ? 0.756 : 0.75}
    >
      {/* Soft Front Light */}
      <pointLight
        ref={spotLightRef}
        position={[0, 0, 1.2]}
        intensity={0}
        color="#ffebb8"
        distance={4}
      />

      {/* Lớp 1: Khung nền gỗ sẫm */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[2.3, 2.9, 0.1]} />
        <meshStandardMaterial color={FRAME_DARK} roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Lớp 2: Gờ Baroque đồng cổ */}
      <mesh position={[0, 0, -0.015]}>
        <boxGeometry args={[2.24, 2.84, 0.06]} />
        <meshStandardMaterial color={FRAME_GOLD_DARK} roughness={0.36} metalness={0.82} />
      </mesh>

      {/* Lớp 3: Vát cạnh gỗ tối */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[2.14, 2.74, 0.05]} />
        <meshStandardMaterial color="#3a2b20" roughness={0.65} metalness={0.3} />
      </mesh>

      {/* Lớp 4: Chỉ viền đồng cổ sáng */}
      <mesh position={[0, 0, 0.025]}>
        <boxGeometry args={[2.02, 2.62, 0.04]} />
        <meshStandardMaterial ref={frameMatRef} color={FRAME_GOLD_LIGHT} roughness={0.32} metalness={0.85} />
      </mesh>

      {/* Lớp 5: Passpartout nhung đen */}
      <mesh position={[0, 0, 0.035]}>
        <boxGeometry args={[1.94, 2.54, 0.03]} />
        <meshStandardMaterial color={FRAME_INNER_VELVET} roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Lớp 6: Viền kim loại mảnh */}
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[1.86, 2.46, 0.02]} />
        <meshStandardMaterial color={FRAME_GOLD_DARK} roughness={0.38} metalness={0.8} />
      </mesh>

      {/* Ảnh tranh — clickable */}
      <mesh
        position={[0, 0, 0.056]}
        onClick={handleClick}
      >
        <planeGeometry args={[1.8, 2.4]} />
        <meshStandardMaterial map={texture} roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  );
}
