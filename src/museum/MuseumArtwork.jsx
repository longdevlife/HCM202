import { useTexture } from "@react-three/drei";
import { useCallback } from "react";
import * as THREE from "three";

const FRAME_DARK = "#24170e";
const FRAME_GOLD_DARK = "#b99043";
const FRAME_GOLD_LIGHT = "#d2ad61";
const FRAME_INNER_VELVET = "#140e0a";

export function MuseumArtwork({ panel, focused, onSelect }) {
  const texture = useTexture(panel.imageSrc || "/textures/bìa đầu.png");
  texture.colorSpace = THREE.SRGBColorSpace;

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (onSelect) onSelect(panel);
  }, [onSelect, panel]);

  const handlePointerOver = useCallback(() => {
    document.body.style.cursor = "pointer";
  }, []);

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = "default";
  }, []);

  return (
    <group
      position={panel.position}
      rotation={panel.rotation}
      scale={focused ? 0.756 : 0.75}
    >
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
        <meshStandardMaterial color={FRAME_GOLD_LIGHT} roughness={0.32} metalness={0.85} />
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
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[1.8, 2.4]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}
