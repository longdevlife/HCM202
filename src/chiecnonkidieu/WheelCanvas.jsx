import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  Suspense,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { sounds } from "./SoundEffects";

// Custom hook to preload the 5 snack images
function useSnackImages(slices) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    let active = true;
    const promises = slices.map((s) => {
      const src = s.image;
      if (!src) return Promise.resolve(null);
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    });

    Promise.all(promises).then((results) => {
      if (active) setImages(results);
    });

    return () => {
      active = false;
    };
  }, [slices]);

  return images;
}

// Generate high-resolution 2D texture mapped onto the 3D Conical Hat
function generateHatTexture(slices, answeredQuestions, snackImages) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  const numSlices = slices.length;
  const colW = canvas.width / numSlices;
  const H = canvas.height;
  const W = canvas.width;

  for (let i = 0; i < numSlices; i++) {
    const slice = slices[i];
    const x = i * colW;
    const cx = x + colW / 2;
    const isAnswered =
      slice.type === "question" && answeredQuestions[slice.questionId];

    // Background gradient: rich lacquer tone along the cone slope
    const grad = ctx.createLinearGradient(x, 0, x, H);
    if (isAnswered) {
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(0.2, "#334155");
      grad.addColorStop(0.8, "#1e293b");
      grad.addColorStop(1, "#090d16");
    } else {
      grad.addColorStop(0, "#1c1308");
      grad.addColorStop(0.18, slice.color);
      grad.addColorStop(0.78, slice.color);
      grad.addColorStop(1, "#150f07");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, colW, H);

    // Fine longitudinal palm leaf fibers (gân lá nón truyền thống)
    for (let gx = x + 3; gx < x + colW; gx += 5) {
      ctx.fillStyle =
        gx % 10 === 0
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.06)";
      ctx.fillRect(gx, 0, 1.5, H);
    }

    // Gold embossed dividing seam between sectors
    const divGrad = ctx.createLinearGradient(x - 4, 0, x + 4, 0);
    divGrad.addColorStop(0, "#78350f");
    divGrad.addColorStop(0.4, "#fde047");
    divGrad.addColorStop(0.7, "#f59e0b");
    divGrad.addColorStop(1, "#451a03");
    ctx.fillStyle = divGrad;
    ctx.fillRect(x - 3, 0, 6, H);

    // Top Badge (Tên phần thưởng / Trạng thái)
    const pillY = 320;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const rewardName = slice.label || `Phần thưởng ${i + 1}`;
    ctx.font = "bold 23px 'Inter', sans-serif";
    const textW = ctx.measureText(rewardName).width;
    const pillW = Math.max(190, textW + 36);

    ctx.fillStyle = isAnswered
      ? "rgba(16, 185, 129, 0.28)"
      : "rgba(0, 0, 0, 0.55)";
    ctx.beginPath();
    ctx.roundRect(cx - pillW / 2, pillY - 24, pillW, 48, 24);
    ctx.fill();
    ctx.strokeStyle = isAnswered ? "#34d399" : "#fef08a";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = isAnswered ? "#a7f3d0" : "#fef08a";
    ctx.fillText(isAnswered ? "✓ ĐÃ NHẬN" : rewardName, cx, pillY);

    // Render the Snack Picture on the sector!
    const img = snackImages?.[i];
    const imgW = 270;
    const imgH = 370;
    const imgY = 430;

    if (img) {
      // Golden aura glow behind snack
      const glowGrad = ctx.createRadialGradient(
        cx,
        imgY + imgH / 2,
        40,
        cx,
        imgY + imgH / 2,
        190
      );
      glowGrad.addColorStop(0, "rgba(254, 240, 138, 0.45)");
      glowGrad.addColorStop(0.7, "rgba(254, 240, 138, 0.12)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, imgY + imgH / 2, 190, 0, Math.PI * 2);
      ctx.fill();

      // White rounded card frame for contrast & crisp details
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      ctx.beginPath();
      ctx.roundRect(cx - imgW / 2 - 8, imgY - 8, imgW + 16, imgH + 16, 20);
      ctx.fill();
      ctx.restore();

      // Draw the snack image
      ctx.drawImage(img, cx - imgW / 2, imgY, imgW, imgH);

      // Gold frame border
      ctx.strokeStyle = isAnswered ? "#34d399" : "#f59e0b";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(cx - imgW / 2 - 8, imgY - 8, imgW + 16, imgH + 16, 20);
      ctx.stroke();

      // Answered overlay
      if (isAnswered) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
        ctx.beginPath();
        ctx.roundRect(cx - imgW / 2 - 8, imgY - 8, imgW + 16, imgH + 16, 20);
        ctx.fill();

        ctx.font = "bold 32px 'Inter', sans-serif";
        ctx.fillStyle = "#34d399";
        ctx.fillText("✓ ĐÃ MỞ", cx, imgY + imgH / 2);
      }
    }
  }

  // 16 Vành nón lá truyền thống (16 concentric bamboo rings)
  for (let r = 1; r <= 16; r++) {
    const y = (H * r) / 17;
    // Bamboo rib groove shadow
    ctx.strokeStyle = "rgba(0, 0, 0, 0.22)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, y + 2);
    ctx.lineTo(W, y + 2);
    ctx.stroke();

    // Bamboo highlight
    ctx.strokeStyle = "rgba(254, 240, 138, 0.42)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Bottom gold rim band
  const rimGrad = ctx.createLinearGradient(0, H - 36, 0, H);
  rimGrad.addColorStop(0, "#f59e0b");
  rimGrad.addColorStop(0.5, "#fef08a");
  rimGrad.addColorStop(1, "#78350f");
  ctx.fillStyle = rimGrad;
  ctx.fillRect(0, H - 32, W, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

// The 3D Scene Model containing the Conical Hat, Apex Cap, Rim Pegs & Pointer
function ChiecNon3DModel({
  slices,
  answeredQuestions,
  rotationY,
  needleBounce,
  onConeClick,
  onApexClick,
}) {
  const snackImages = useSnackImages(slices);

  const texture = useMemo(
    () => generateHatTexture(slices, answeredQuestions, snackImages),
    [slices, answeredQuestions, snackImages]
  );

  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  const radius = 3.3;
  const coneHeight = 1.8;
  const numPegs = 20;

  // Peg angles
  const pegPositions = useMemo(() => {
    const arr = [];
    for (let p = 0; p < numPegs; p++) {
      const a = (p / numPegs) * Math.PI * 2;
      arr.push([
        Math.cos(a) * (radius + 0.03),
        0,
        Math.sin(a) * (radius + 0.03),
      ]);
    }
    return arr;
  }, [numPegs, radius]);

  return (
    <group position={[0, -0.2, 0]}>
      {/* ── Stationary Wooden Pedestal Turntable (Bệ gỗ sơn mài bọc đồng) ── */}
      <group position={[0, 0, 0]}>
        {/* Upper Plinth */}
        <mesh position={[0, -0.16, 0]} receiveShadow>
          <cylinderGeometry args={[1.9, 2.3, 0.32, 48]} />
          <meshStandardMaterial
            color="#22170e"
            roughness={0.55}
            metalness={0.25}
          />
        </mesh>

        {/* Lower Base Step */}
        <mesh position={[0, -0.38, 0]} receiveShadow>
          <cylinderGeometry args={[2.5, 2.7, 0.22, 48]} />
          <meshStandardMaterial
            color="#181109"
            roughness={0.65}
            metalness={0.15}
          />
        </mesh>

        {/* Gold Trim Ring on Pedestal */}
        <mesh position={[0, -0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.32, 0.04, 16, 64]} />
          <meshStandardMaterial
            color="#f59e0b"
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>
      </group>

      {/* ── Rotating 3D Conical Hat Assembly (Chiếc Nón 3D) ── */}
      <group rotation={[0, rotationY, 0]}>
        {/* 1. Main Conical Hat Surface (Lá nón) */}
        <mesh
          position={[0, coneHeight / 2, 0]}
          onClick={onConeClick}
          castShadow
          receiveShadow
        >
          <coneGeometry args={[radius, coneHeight, 128, 32, true]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.42}
            metalness={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 2. Inner Underside Lining (Lòng nón màu mộc sẫm) */}
        <mesh position={[0, coneHeight / 2 - 0.02, 0]}>
          <coneGeometry args={[radius - 0.04, coneHeight - 0.04, 64, 16, true]} />
          <meshStandardMaterial
            color="#241a10"
            roughness={0.7}
            metalness={0.08}
            side={THREE.BackSide}
          />
        </mesh>

        {/* 3. Golden Rim Ring (Vành chân nón) */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius + 0.02, 0.045, 16, 120]} />
          <meshStandardMaterial
            color="#f59e0b"
            metalness={0.92}
            roughness={0.15}
          />
        </mesh>

        {/* 4. Perimeter Gold Pegs (20 Chốt định vị quanh vành) */}
        {pegPositions.map((pos, idx) => (
          <mesh key={idx} position={pos}>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshStandardMaterial
              color="#fffbeb"
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
        ))}

        {/* 5. Golden Apex Cap (Chóp nón dát vàng - Bấm để quay) */}
        <mesh
          position={[0, coneHeight + 0.1, 0]}
          onClick={onApexClick}
          castShadow
        >
          <coneGeometry args={[0.38, 0.42, 32]} />
          <meshStandardMaterial
            color="#ffd700"
            metalness={0.92}
            roughness={0.15}
          />
        </mesh>

        {/* Glowing Apex Star (Ngôi sao phát sáng trên đỉnh nón) */}
        <mesh
          position={[0, coneHeight + 0.32, 0]}
          onClick={onApexClick}
        >
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#f59e0b"
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* ── 3D Needle Indicator (Kim chỉ nón kỳ diệu ở 12 giờ) ── */}
      <group
        position={[0, 0.8, -radius]}
        rotation={[
          needleBounce ? 0.12 : 0,
          0,
          needleBounce ? -0.1 : 0,
        ]}
      >
        {/* Gold Support Bracket */}
        <mesh
          position={[0, 0.4, -0.4]}
          rotation={[Math.PI / 4, 0, 0]}
        >
          <cylinderGeometry args={[0.08, 0.12, 1.2, 16]} />
          <meshStandardMaterial
            color="#d97706"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* Golden Pivot Sphere */}
        <mesh position={[0, 0.45, -0.2]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial
            color="#f59e0b"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* Ruby Needle Arrow Pointing Down Into Rim */}
        <mesh
          position={[0, 0.05, 0.1]}
          rotation={[Math.PI * 0.78, 0, 0]}
        >
          <coneGeometry args={[0.26, 0.85, 16]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#b91c1c"
            emissiveIntensity={0.45}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

// Main Interactive WheelCanvas Component with Three.js R3F
const WheelCanvas = forwardRef(function WheelCanvas(
  {
    slices,
    answeredQuestions = {},
    onSpinStart,
    onSpinEnd,
    onSliceClick,
    onCenterClick,
  },
  ref
) {
  const currentAngleRef = useRef(0);
  const isSpinningRef = useRef(false);
  const lastTickIndexRef = useRef(-1);
  const animFrameRef = useRef(null);
  const controlsRef = useRef(null);

  const [rotationAngle, setRotationAngle] = useState(0);
  const [needleBounce, setNeedleBounce] = useState(0);
  const [internalSpinning, setInternalSpinning] = useState(false);
  const [activeHoverSlice, setActiveHoverSlice] = useState(null);

  const numSlices = slices.length;
  const sliceAngle = (2 * Math.PI) / numSlices;
  const totalPegs = 20;

  // Imperative spin method called by parent
  const spin = useCallback(
    (targetIndex) => {
      if (isSpinningRef.current) return;
      isSpinningRef.current = true;
      setInternalSpinning(true);
      onSpinStart && onSpinStart();

      const startTime = performance.now();
      const initialAngle = currentAngleRef.current;

      // Pointer is at 12 o'clock (-Z axis, angle = PI).
      // Center of target slice is (targetIndex + 0.5) * sliceAngle.
      // Desired angle: R_y + targetSliceCenter = Math.PI (mod 2*PI).
      const targetSliceCenter = (targetIndex + 0.5) * sliceAngle;
      let desiredMod = (Math.PI - targetSliceCenter) % (2 * Math.PI);
      if (desiredMod < 0) desiredMod += 2 * Math.PI;

      // 6 to 8 full spins for excitement
      const fullRounds = (6 + Math.floor(Math.random() * 3)) * (2 * Math.PI);

      const curMod =
        initialAngle >= 0
          ? initialAngle % (2 * Math.PI)
          : 2 * Math.PI + (initialAngle % (2 * Math.PI));
      let deltaAngle = desiredMod - curMod;
      if (deltaAngle < 0) deltaAngle += 2 * Math.PI;

      const totalAngleChange = fullRounds + deltaAngle;
      const durationMs = 5800; // 5.8s smooth spin

      // Quartic easing out
      const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);
      lastTickIndexRef.current = -1;

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        const easedProgress = easeOutQuart(progress);

        const currentA = initialAngle + totalAngleChange * easedProgress;
        currentAngleRef.current = currentA;
        setRotationAngle(currentA);

        // Peg ticking & needle bounce
        const pegStep = (2 * Math.PI) / totalPegs;
        const currentPeg = Math.floor((currentA % (2 * Math.PI)) / pegStep);
        if (currentPeg !== lastTickIndexRef.current) {
          lastTickIndexRef.current = currentPeg;
          sounds.playTick();
          setNeedleBounce(1);
          setTimeout(() => setNeedleBounce(0), 75);
        }

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Finished spinning
          isSpinningRef.current = false;
          setInternalSpinning(false);
          sounds.playLand();
          const finalSlice = slices[targetIndex];
          onSpinEnd && onSpinEnd(finalSlice, targetIndex);
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    },
    [onSpinStart, onSpinEnd, sliceAngle, slices, totalPegs]
  );

  // Expose spin via ref
  useImperativeHandle(ref, () => ({
    spin,
    isSpinning: () => isSpinningRef.current,
  }));

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Raycasting on 3D Cone click
  const handleConeClick = (e) => {
    e.stopPropagation();
    if (isSpinningRef.current) return;

    // If click was near top apex (chóp nón), trigger spin!
    if (e.point && e.point.y > 1.3) {
      if (onCenterClick) onCenterClick();
      return;
    }

    if (e.uv) {
      const sliceIdx = Math.floor(e.uv.x * numSlices) % numSlices;
      const clickedSlice = slices[sliceIdx];
      if (clickedSlice && onSliceClick) {
        onSliceClick(clickedSlice, sliceIdx);
      }
    }
  };

  // Apex Cap Click triggers spin
  const handleApexClick = (e) => {
    e.stopPropagation();
    if (isSpinningRef.current) return;
    if (onCenterClick) onCenterClick();
  };

  // Reset 3D view angle
  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="wheel-canvas-wrapper relative flex flex-col items-center select-none w-full">
      {/* 3D Scene Viewport Container */}
      <div className="w-full max-w-[680px] h-[400px] sm:h-[460px] md:h-[500px] relative rounded-3xl overflow-hidden shadow-2xl border border-[#c3a47b]/30 bg-gradient-to-b from-[#2a241c] via-[#1e1a14] to-[#12100d]">
        <Canvas
          shadows
          camera={{ position: [0, 4.8, 6.2], fov: 38 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          style={{ width: "100%", height: "100%", cursor: "grab" }}
        >
          {/* Lighting Rig */}
          <ambientLight intensity={0.95} color="#fff3e6" />
          <directionalLight
            position={[4, 8, 5]}
            intensity={0.95}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight
            position={[-5, 3, -3]}
            intensity={0.4}
            color="#f59e0b"
          />
          <spotLight
            position={[0, 8, 1]}
            intensity={0.8}
            angle={Math.PI / 3}
            penumbra={0.6}
            color="#fff5e6"
          />

          <Suspense fallback={null}>
            <ChiecNon3DModel
              slices={slices}
              answeredQuestions={answeredQuestions}
              rotationY={rotationAngle}
              needleBounce={needleBounce}
              onConeClick={handleConeClick}
              onApexClick={handleApexClick}
            />
          </Suspense>

          {/* User Orbit Controls: Freely drag to view from 3D angles */}
          <OrbitControls
            ref={controlsRef}
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            minAzimuthAngle={-Math.PI / 3}
            maxAzimuthAngle={Math.PI / 3}
            enableDamping
            dampingFactor={0.06}
          />
        </Canvas>

        {/* Overlay 3D Interactive Badge / Help */}
        <div className="absolute top-3 left-3 bg-[#1e1b15]/85 border border-[#c3a47b]/40 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-[#fef08a] flex items-center gap-1.5 shadow-md pointer-events-none">
          <span>✨</span>
          <span>Nón 3D – Kéo chuột xoay tự do</span>
        </div>

        {/* Quick Reset Camera Button */}
        <button
          type="button"
          onClick={handleResetCamera}
          title="Đặt lại góc nhìn 3D chuẩn"
          className="absolute top-3 right-3 bg-[#1e1b15]/85 hover:bg-[#342b1f] border border-[#c3a47b]/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-bold text-[#eee2ca] shadow-md transition-all cursor-pointer flex items-center gap-1 active:scale-95"
        >
          <span>🔄</span>
          <span>Góc chuẩn</span>
        </button>

        {/* Spinning Notification */}
        {internalSpinning && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#1e1b15]/90 border border-[#f59e0b] px-5 py-2 rounded-full text-xs md:text-sm font-black text-[#fef08a] shadow-xl animate-pulse flex items-center gap-2 pointer-events-none">
            <span className="animate-spin inline-block">🎡</span>
            <span>Chiếc nón 3D đang quay...</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default WheelCanvas;
