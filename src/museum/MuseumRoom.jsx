import { Html, useTexture, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import {
  LOBBY_SIZE,
  ROOM_SIZE,
  ROOM_LEFT_POS,
  ROOM_CENTER_POS,
  ROOM_RIGHT_POS,
} from "./museumData";

// ── Shared texture loader ──
function useMuseumTextures() {
  const damask = useTexture("/textures/damask-pattern.png");
  const marble = useTexture("/textures/marble-floor.png");

  // Configure tiling
  damask.wrapS = damask.wrapT = THREE.RepeatWrapping;
  marble.wrapS = marble.wrapT = THREE.RepeatWrapping;

  return { damask, marble };
}

// ── Constants ──
const WALL_COLOR = "#3d2e24";
const CEILING_COLOR = "#4a382d";
const BASEBOARD_COLOR = "#5a3f28";
const FLOOR_COLOR = "#f2d89b";
const DOOR_WOOD_COLOR = "#3a2417";
const DOOR_BRASS_COLOR = "#c59a3a";
const TRIM_BRASS_COLOR = "#b88a32";

// ── Individual Room Component ──
function Room({
  position,
  size,
  accent,
  label,
  textures,
  openings = [],
  openingLabels = {},
  chandelier = "small",
  decor = "room",
}) {
  const { w, d, h } = size;
  const { damask, marble } = textures;

  // Clone textures for this room to avoid sharing repeat state
  const wallTex = useMemo(() => {
    const tex = damask.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(w / 3, h / 3);
    return tex;
  }, [damask, h, w]);

  const wallTexSide = useMemo(() => {
    const tex = damask.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(d / 3, h / 3);
    return tex;
  }, [damask, d, h]);

  const floorTex = useMemo(() => {
    const tex = marble.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(w / 4, d / 4);
    return tex;
  }, [marble, d, w]);

  // Determine which walls have openings
  const hasOpening = (wall) => openings.includes(wall);
  const getOpeningLabel = (wall) => openingLabels[wall] || label;

  return (
    <group position={position}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.01, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial
          map={floorTex}
          color={FLOOR_COLOR}
          roughness={0.36}
          metalness={0.03}
        />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={CEILING_COLOR} roughness={0.95} />
      </mesh>

      <CeilingTrim width={w} depth={d} height={h} />
      <MuseumChandelier
        height={h}
        radius={chandelier === "large" ? 1.45 : 0.9}
        scale={chandelier === "large" ? 1 : 0.72}
        intensity={chandelier === "large" ? 0.9 : 0.45}
      />

      {decor === "lobby" ? (
        <LobbyCenterpiece accent={accent} />
      ) : (
        <MuseumBench position={[0, 0, 0]} rotation={[0, hasOpening("left") && hasOpening("right") ? Math.PI / 2 : 0, 0]} />
      )}

      {/* Back Wall (z = -d/2) — may have opening */}
      {!hasOpening("back") ? (
        <mesh position={[0, h / 2, -d / 2]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial
            map={wallTex}
            color={WALL_COLOR}
            roughness={0.72}
          />
        </mesh>
      ) : (
        <WallWithOpening
          position={[0, 0, -d / 2]}
          wallW={w}
          wallH={h}
          openW={4}
          openH={4.5}
          tex={wallTex}
          accent={accent}
          label={getOpeningLabel("back")}
        />
      )}

      {/* Front Wall (z = +d/2) — may have opening */}
      {!hasOpening("front") ? (
        <mesh rotation={[0, Math.PI, 0]} position={[0, h / 2, d / 2]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial
            map={wallTex}
            color={WALL_COLOR}
            roughness={0.72}
          />
        </mesh>
      ) : (
        <WallWithOpening
          position={[0, 0, d / 2]}
          wallW={w}
          wallH={h}
          openW={4}
          openH={4.5}
          tex={wallTex}
          flipZ
          accent={accent}
          label={getOpeningLabel("front")}
        />
      )}

      {/* Left Wall (x = -w/2) — may have opening */}
      {!hasOpening("left") ? (
        <mesh rotation={[0, Math.PI / 2, 0]} position={[-w / 2, h / 2, 0]}>
          <planeGeometry args={[d, h]} />
          <meshStandardMaterial
            map={wallTexSide}
            color={WALL_COLOR}
            roughness={0.72}
          />
        </mesh>
      ) : (
        <WallWithOpening
          position={[-w / 2, 0, 0]}
          wallW={d}
          wallH={h}
          openW={4}
          openH={4.5}
          tex={wallTexSide}
          rotateY={Math.PI / 2}
          accent={accent}
          label={getOpeningLabel("left")}
        />
      )}

      {/* Right Wall (x = +w/2) — may have opening */}
      {!hasOpening("right") ? (
        <mesh rotation={[0, -Math.PI / 2, 0]} position={[w / 2, h / 2, 0]}>
          <planeGeometry args={[d, h]} />
          <meshStandardMaterial
            map={wallTexSide}
            color={WALL_COLOR}
            roughness={0.72}
          />
        </mesh>
      ) : (
        <WallWithOpening
          position={[w / 2, 0, 0]}
          wallW={d}
          wallH={h}
          openW={4}
          openH={4.5}
          tex={wallTexSide}
          rotateY={-Math.PI / 2}
          accent={accent}
          label={getOpeningLabel("right")}
        />
      )}

      {/* Baseboards */}
      <mesh position={[-w / 2 + 0.08, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[d, 0.16, 0.16]} />
        <meshStandardMaterial color={BASEBOARD_COLOR} roughness={0.58} />
      </mesh>
      <mesh position={[w / 2 - 0.08, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[d, 0.16, 0.16]} />
        <meshStandardMaterial color={BASEBOARD_COLOR} roughness={0.58} />
      </mesh>
    </group>
  );
}

function CeilingTrim({ width, depth, height }) {
  const topY = height - 0.28;
  const brassY = height - 0.48;

  return (
    <group>
      <mesh position={[0, topY, -depth / 2 + 0.12]}>
        <boxGeometry args={[width - 0.16, 0.24, 0.24]} />
        <meshStandardMaterial color={DOOR_WOOD_COLOR} roughness={0.48} metalness={0.12} />
      </mesh>
      <mesh position={[0, topY, depth / 2 - 0.12]}>
        <boxGeometry args={[width - 0.16, 0.24, 0.24]} />
        <meshStandardMaterial color={DOOR_WOOD_COLOR} roughness={0.48} metalness={0.12} />
      </mesh>
      <mesh position={[-width / 2 + 0.12, topY, 0]}>
        <boxGeometry args={[0.24, 0.24, depth - 0.16]} />
        <meshStandardMaterial color={DOOR_WOOD_COLOR} roughness={0.48} metalness={0.12} />
      </mesh>
      <mesh position={[width / 2 - 0.12, topY, 0]}>
        <boxGeometry args={[0.24, 0.24, depth - 0.16]} />
        <meshStandardMaterial color={DOOR_WOOD_COLOR} roughness={0.48} metalness={0.12} />
      </mesh>

      <mesh position={[0, brassY, -depth / 2 + 0.2]}>
        <boxGeometry args={[width - 0.9, 0.1, 0.12]} />
        <meshStandardMaterial color={TRIM_BRASS_COLOR} roughness={0.35} metalness={0.35} />
      </mesh>
      <mesh position={[0, brassY, depth / 2 - 0.2]}>
        <boxGeometry args={[width - 0.9, 0.1, 0.12]} />
        <meshStandardMaterial color={TRIM_BRASS_COLOR} roughness={0.35} metalness={0.35} />
      </mesh>
      <mesh position={[-width / 2 + 0.2, brassY, 0]}>
        <boxGeometry args={[0.12, 0.1, depth - 0.9]} />
        <meshStandardMaterial color={TRIM_BRASS_COLOR} roughness={0.35} metalness={0.35} />
      </mesh>
      <mesh position={[width / 2 - 0.2, brassY, 0]}>
        <boxGeometry args={[0.12, 0.1, depth - 0.9]} />
        <meshStandardMaterial color={TRIM_BRASS_COLOR} roughness={0.35} metalness={0.35} />
      </mesh>
    </group>
  );
}

function MuseumBench({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.1, 0.8]} />
        <meshStandardMaterial color="#2d2217" roughness={0.6} />
      </mesh>
      {/* Cushions */}
      <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.9, 0.05, 0.7]} />
        <meshStandardMaterial color="#5e1511" roughness={0.9} />
      </mesh>
      {/* Legs */}
      <mesh position={[-1.2, 0.225, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.45, 0.6]} />
        <meshStandardMaterial color="#bda783" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[1.2, 0.225, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.08, 0.45, 0.6]} />
        <meshStandardMaterial color="#bda783" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}

function StanchionPost({ position }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.15, 0.04, 24]} />
        <meshStandardMaterial color="#c59a3a" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Column */}
      <mesh position={[0, 0.47, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.86, 16]} />
        <meshStandardMaterial color="#c59a3a" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Top Sphere */}
      <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#b88a32" roughness={0.15} metalness={0.85} />
      </mesh>
    </group>
  );
}

function LobbyCenterpiece({ accent }) {
  const { scene } = useGLTF("/models/president_ho_chi_minh_statue.glb");
  const statueScene = useMemo(() => scene.clone(), [scene]);

  return (
    <group position={[0, 0, 0]}>
      {/* Brass wayfinding inlay on the floor */}
      <mesh position={[-4.2, 0.035, 0]}>
        <boxGeometry args={[7.2, 0.03, 0.09]} />
        <meshStandardMaterial color={DOOR_BRASS_COLOR} roughness={0.34} metalness={0.5} />
      </mesh>
      <mesh position={[4.2, 0.035, 0]}>
        <boxGeometry args={[7.2, 0.03, 0.09]} />
        <meshStandardMaterial color={DOOR_BRASS_COLOR} roughness={0.34} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.035, -3.8]}>
        <boxGeometry args={[0.09, 0.03, 6.7]} />
        <meshStandardMaterial color={DOOR_BRASS_COLOR} roughness={0.34} metalness={0.5} />
      </mesh>

      {/* Tượng Chủ tịch Hồ Chí Minh uy nghiêm - nâng nhẹ để bệ không thụt xuống sàn */}
      <primitive
        object={statueScene}
        position={[0.22, 1.8, 0.95]}
        scale={[4.2, 4.2, 4.2]}
        rotation={[0, 0, 0]}
      />

      {/* 4 Cột chắn đồng hoàng gia mở rộng thành hình chữ nhật khổng lồ (5.6m x 6.0m) bao quanh tượng vô cùng rộng rãi */}
      <StanchionPost position={[-2.8, 0, 2.6]} />
      <StanchionPost position={[2.8, 0, 2.6]} />
      <StanchionPost position={[-2.8, 0, -3.4]} />
      <StanchionPost position={[2.8, 0, -3.4]} />

      {/* Dây nhung ruy băng màu đỏ thẫm kết nối 4 cột, rộng rãi và hoàn toàn không chạm vào tượng */}
      {/* Cột 1 (Trước-Trái) -> Cột 2 (Trước-Phải) */}
      <mesh position={[0, 0.72, 2.6]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.02, 5.6, 16]} />
        <meshStandardMaterial color="#901111" roughness={0.8} />
      </mesh>
      {/* Cột 3 (Sau-Trái) -> Cột 4 (Sau-Phải) */}
      <mesh position={[0, 0.72, -3.4]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.02, 5.6, 16]} />
        <meshStandardMaterial color="#901111" roughness={0.8} />
      </mesh>
      {/* Cột 1 (Trước-Trái) -> Cột 3 (Sau-Trái) */}
      <mesh position={[-2.8, 0.72, -0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.02, 6.0, 16]} />
        <meshStandardMaterial color="#901111" roughness={0.8} />
      </mesh>
      {/* Cột 2 (Trước-Phải) -> Cột 4 (Sau-Phải) */}
      <mesh position={[2.8, 0.72, -0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.02, 6.0, 16]} />
        <meshStandardMaterial color="#901111" roughness={0.8} />
      </mesh>

      <pointLight position={[0, 2.6, 0]} intensity={0.46} color={accent} distance={5} />

      {/* Giá đỡ bảng tên bằng đồng nghiêng sang trọng đặt phía trước ngoài hàng rào ruy băng mới */}
      <group position={[0, 0, 2.78]}>
        {/* Chân đế giá đỡ */}
        <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.07, 0.09, 0.03, 16]} />
          <meshStandardMaterial color="#c59a3a" roughness={0.25} metalness={0.75} />
        </mesh>
        {/* Cột giá đỡ nghiêng nhẹ ra trước */}
        <mesh position={[0, 0.25, 0.02]} rotation={[0.15, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.5, 16]} />
          <meshStandardMaterial color="#c59a3a" roughness={0.25} metalness={0.75} />
        </mesh>
        {/* Khung đỡ bảng tên bằng đồng đặt nghiêng */}
        <mesh position={[0, 0.5, 0.06]} rotation={[-0.4, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.66, 0.32, 0.02]} />
          <meshStandardMaterial color="#b88a32" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* Bảng tên đồng vinh danh Bác trang trọng đặt nghiêng hướng lên, thêm occlude để ẩn khi bị khuất */}
      <Html position={[0, 0.52, 2.84]} rotation={[-0.4, 0, 0]} transform center scale={0.22} occlude>
        <div
          style={{
            minWidth: 260,
            border: "2px solid #c5a028",
            borderRadius: 4,
            background: "linear-gradient(135deg, #2c1a0e, #1a100a)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            color: "#e4bd67",
            fontFamily: "'Playfair Display', serif",
            fontWeight: "bold",
            fontSize: 13,
            letterSpacing: "0.1em",
            padding: "8px 16px",
            pointerEvents: "none",
            textAlign: "center",
            textTransform: "uppercase",
            borderImage: "linear-gradient(to right, #c5a028, #f4df8a, #c5a028) 1",
          }}
        >
          Chủ tịch Hồ Chí Minh <br />
          <span style={{ fontSize: 10, fontFamily: "'Outfit', sans-serif", opacity: 0.85 }}>
            (1890 - 1969)
          </span>
        </div>
      </Html>
    </group>
  );
}

function MuseumChandelier({ height, radius, scale, intensity }) {
  const ringY = height - 1.25 * scale;
  const bulbY = ringY - 0.08 * scale;
  const bulbPositions = Array.from({ length: 6 }, (_, index) => {
    const angle = (index / 6) * Math.PI * 2;
    return [Math.cos(angle) * radius, bulbY, Math.sin(angle) * radius];
  });

  return (
    <group>
      <pointLight position={[0, ringY - 0.25, 0]} intensity={intensity} distance={10 * scale} color="#ffd89a" />

      <mesh position={[0, height - 0.42 * scale, 0]}>
        <cylinderGeometry args={[0.03 * scale, 0.03 * scale, 0.75 * scale, 10]} />
        <meshStandardMaterial color={DOOR_BRASS_COLOR} roughness={0.28} metalness={0.55} />
      </mesh>
      <mesh position={[0, ringY + 0.28 * scale, 0]}>
        <cylinderGeometry args={[0.22 * scale, 0.18 * scale, 0.1 * scale, 24]} />
        <meshStandardMaterial color={DOOR_BRASS_COLOR} roughness={0.32} metalness={0.5} />
      </mesh>

      <mesh position={[0, ringY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.035 * scale, 12, 72]} />
        <meshStandardMaterial color={DOOR_BRASS_COLOR} roughness={0.28} metalness={0.55} />
      </mesh>
      <mesh position={[0, height - 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.72, 0.025 * scale, 10, 64]} />
        <meshStandardMaterial color={TRIM_BRASS_COLOR} roughness={0.35} metalness={0.36} />
      </mesh>

      {bulbPositions.map((pos, index) => (
        <mesh key={index} position={pos}>
          <sphereGeometry args={[0.1 * scale, 18, 18]} />
          <meshStandardMaterial
            color="#ffe5b5"
            emissive="#ffc978"
            emissiveIntensity={0.65}
            roughness={0.2}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Wall with archway opening ──
function WallWithOpening({
  position,
  wallW,
  wallH,
  openW,
  openH,
  tex,
  flipZ = false,
  rotateY = 0,
  accent = "#C5A028",
  label = "",
}) {
  const sideW = (wallW - openW) / 2;
  const topH = wallH - openH;
  const ry = rotateY || (flipZ ? Math.PI : 0);

  return (
    <group position={position} rotation={[0, ry, 0]}>
      {/* Left pillar */}
      <mesh position={[-(openW / 2 + sideW / 2), wallH / 2, 0]}>
        <boxGeometry args={[sideW, wallH, 0.5]} />
        <meshStandardMaterial map={tex} color={WALL_COLOR} roughness={0.72} />
      </mesh>

      {/* Right pillar */}
      <mesh position={[(openW / 2 + sideW / 2), wallH / 2, 0]}>
        <boxGeometry args={[sideW, wallH, 0.5]} />
        <meshStandardMaterial map={tex} color={WALL_COLOR} roughness={0.72} />
      </mesh>

      {/* Top beam */}
      <mesh position={[0, openH + topH / 2, 0]}>
        <boxGeometry args={[openW + 0.6, topH, 0.5]} />
        <meshStandardMaterial map={tex} color={WALL_COLOR} roughness={0.72} />
      </mesh>

      {/* Layered museum door casing */}
      <mesh position={[-(openW / 2 + 0.17), openH / 2, 0.31]}>
        <boxGeometry args={[0.34, openH + 0.18, 0.24]} />
        <meshStandardMaterial color={DOOR_WOOD_COLOR} roughness={0.42} metalness={0.16} />
      </mesh>
      <mesh position={[(openW / 2 + 0.17), openH / 2, 0.31]}>
        <boxGeometry args={[0.34, openH + 0.18, 0.24]} />
        <meshStandardMaterial color={DOOR_WOOD_COLOR} roughness={0.42} metalness={0.16} />
      </mesh>
      <mesh position={[0, openH + 0.16, 0.31]}>
        <boxGeometry args={[openW + 0.7, 0.32, 0.24]} />
        <meshStandardMaterial color={DOOR_WOOD_COLOR} roughness={0.42} metalness={0.16} />
      </mesh>
      <mesh position={[0, 0.05, 0.31]}>
        <boxGeometry args={[openW + 0.66, 0.1, 0.22]} />
        <meshStandardMaterial color="#1b120d" roughness={0.48} metalness={0.18} />
      </mesh>

      <mesh position={[-openW / 2, openH / 2, 0.46]}>
        <boxGeometry args={[0.07, openH + 0.03, 0.08]} />
        <meshStandardMaterial color={DOOR_BRASS_COLOR} roughness={0.32} metalness={0.42} />
      </mesh>
      <mesh position={[openW / 2, openH / 2, 0.46]}>
        <boxGeometry args={[0.07, openH + 0.03, 0.08]} />
        <meshStandardMaterial color={DOOR_BRASS_COLOR} roughness={0.32} metalness={0.42} />
      </mesh>
      <mesh position={[0, openH, 0.46]}>
        <boxGeometry args={[openW + 0.1, 0.07, 0.08]} />
        <meshStandardMaterial color={DOOR_BRASS_COLOR} roughness={0.32} metalness={0.42} />
      </mesh>

      {label && (
        <Html position={[0, openH + 0.47, 0.4]} transform center scale={0.3} occlude>
          <div
            style={{
              minWidth: 220,
              border: `1px solid ${accent}70`,
              borderRadius: 999,
              background: "rgba(12, 8, 5, 0.84)",
              boxShadow: `0 0 14px ${accent}30`,
              color: "#fff8ed",
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.09em",
              padding: "6px 12px",
              pointerEvents: "none",
              textAlign: "center",
              textTransform: "uppercase",
              whiteSpace: "normal",
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Hallway connecting lobby to a room ──
function Hallway({ from, to, axis, textures }) {
  const { damask, marble } = textures;
  const hw = 4; // hallway width
  const h = 6;

  let cx, cz, length;

  if (axis === "x") {
    const direction = to[0] < from[0] ? -1 : 1;
    const fromEdge = from[0] + direction * (LOBBY_SIZE.w / 2);
    const toEdge = to[0] - direction * (ROOM_SIZE.w / 2);
    cx = (fromEdge + toEdge) / 2;
    cz = (from[2] + to[2]) / 2;
    length = Math.max(0.01, Math.abs(toEdge - fromEdge));
  } else {
    cx = (from[0] + to[0]) / 2;
    const direction = to[2] < from[2] ? -1 : 1;
    const fromEdge = from[2] + direction * (LOBBY_SIZE.d / 2);
    const toEdge = to[2] - direction * (ROOM_SIZE.d / 2);
    cz = (fromEdge + toEdge) / 2;
    length = Math.max(0.01, Math.abs(toEdge - fromEdge));
  }

  const floorTex = useMemo(() => {
    const tex = marble.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, length / 4);
    return tex;
  }, [marble, length]);

  const wallTex = useMemo(() => {
    const tex = damask.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(length / 3, h / 3);
    return tex;
  }, [damask, length]);

  const isHorizontal = axis === "x";
  const fW = isHorizontal ? length : hw;
  const fD = isHorizontal ? hw : length;

  return (
    <group position={[cx, 0, cz]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[fW, fD]} />
        <meshStandardMaterial map={floorTex} color={FLOOR_COLOR} roughness={0.36} metalness={0.03} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <planeGeometry args={[fW, fD]} />
        <meshStandardMaterial color={CEILING_COLOR} roughness={0.95} />
      </mesh>

      {/* Side walls */}
      {isHorizontal ? (
        <>
          <mesh position={[0, h / 2, -hw / 2]} rotation={[0, 0, 0]}>
            <planeGeometry args={[length, h]} />
            <meshStandardMaterial map={wallTex} color={WALL_COLOR} roughness={0.72} />
          </mesh>
          <mesh position={[0, h / 2, hw / 2]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[length, h]} />
            <meshStandardMaterial map={wallTex} color={WALL_COLOR} roughness={0.72} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[-hw / 2, h / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[length, h]} />
            <meshStandardMaterial map={wallTex} color={WALL_COLOR} roughness={0.72} />
          </mesh>
          <mesh position={[hw / 2, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[length, h]} />
            <meshStandardMaterial map={wallTex} color={WALL_COLOR} roughness={0.72} />
          </mesh>
        </>
      )}
    </group>
  );
}

// ── Main Museum Room Export ──
export function MuseumRoom() {
  const textures = useMuseumTextures();

  return (
    <group>
      {/* ── LOBBY (Sảnh trung tâm) ── */}
      <Room
        position={[0, 0, 0]}
        size={LOBBY_SIZE}
        textures={textures}
        openings={["left", "right", "back"]}
        accent="#C5A028"
        label="Sảnh chính"
        openingLabels={{
          left: "Nhà nước hợp hiến, hợp pháp",
          back: "Nhà nước thượng tôn pháp luật",
          right: "Pháp quyền nhân nghĩa",
        }}
        chandelier="large"
        decor="lobby"
      />

      {/* ── Hallway: Lobby → Center Room ── */}
      <Hallway
        from={[0, 0, 0]}
        to={ROOM_CENTER_POS}
        axis="z"
        textures={textures}
      />

      {/* ── LEFT ROOM: Nhà nước hợp hiến, hợp pháp ── */}
      <Room
        position={ROOM_LEFT_POS}
        size={ROOM_SIZE}
        textures={textures}
        openings={["right"]}
        accent="#C5272D"
        label=""
      />

      {/* ── CENTER ROOM: Nhà nước thượng tôn pháp luật ── */}
      <Room
        position={ROOM_CENTER_POS}
        size={ROOM_SIZE}
        textures={textures}
        openings={["front"]}
        accent="#C5A028"
        label=""
      />

      {/* ── RIGHT ROOM: Pháp quyền nhân nghĩa ── */}
      <Room
        position={ROOM_RIGHT_POS}
        size={ROOM_SIZE}
        textures={textures}
        openings={["left"]}
        accent="#6F8F4E"
        label=""
      />
    </group>
  );
}
