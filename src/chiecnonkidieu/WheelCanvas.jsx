import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { sounds } from "./SoundEffects";

const WheelCanvas = forwardRef(function WheelCanvas(
  { slices, answeredQuestions = {}, onSpinStart, onSpinEnd },
  ref
) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Rotation state in radians
  const currentAngleRef = useRef(0);
  const isSpinningRef = useRef(false);
  const lastTickIndexRef = useRef(-1);
  const [needleBounce, setNeedleBounce] = useState(0);
  const [internalSpinning, setInternalSpinning] = useState(false);

  const numSlices = slices.length;
  const sliceAngle = (2 * Math.PI) / numSlices;

  // Draw the wheel on canvas
  const drawWheel = useCallback(
    (angle) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = canvas.width;
      const center = size / 2;
      const radius = center - 24;

      ctx.clearRect(0, 0, size, size);
      ctx.save();

      // Outer drop shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;

      // Outer metallic gold ring
      const goldGrad = ctx.createLinearGradient(0, 0, size, size);
      goldGrad.addColorStop(0, "#f9d423");
      goldGrad.addColorStop(0.25, "#e65c00");
      goldGrad.addColorStop(0.5, "#ffea85");
      goldGrad.addColorStop(0.75, "#c9922a");
      goldGrad.addColorStop(1, "#834d1b");

      ctx.beginPath();
      ctx.arc(center, center, radius + 14, 0, 2 * Math.PI);
      ctx.fillStyle = goldGrad;
      ctx.fill();

      // Reset shadow
      ctx.shadowColor = "transparent";

      // Dark inner rim
      ctx.beginPath();
      ctx.arc(center, center, radius + 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#1e1b18";
      ctx.fill();

      // Draw slices with rotation
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle);

      for (let i = 0; i < numSlices; i++) {
        const slice = slices[i];
        const startA = i * sliceAngle;
        const endA = startA + sliceAngle;

        const isAnswered =
          slice.type === "question" && answeredQuestions[slice.questionId];

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startA, endA);
        ctx.closePath();

        // Color & Dim if answered
        ctx.fillStyle = isAnswered ? "#475569" : slice.color;
        ctx.fill();

        // Slice dividing line
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.stroke();

        // Label in slice
        ctx.save();
        const midA = startA + sliceAngle / 2;
        ctx.rotate(midA);

        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        if (isAnswered) {
          ctx.fillStyle = "#cbd5e1";
          ctx.font = "bold 13px 'Inter', sans-serif";
          ctx.fillText("✓ ĐÃ XONG", radius - 26, -6);

          ctx.font = "11px 'Inter', sans-serif";
          ctx.fillStyle = "#94a3b8";
          ctx.fillText(slice.label, radius - 26, 12);
        } else {
          ctx.fillStyle = slice.textColor || "#ffffff";
          ctx.font = "bold 15px 'Playfair Display', Georgia, serif";
          ctx.fillText(slice.label, radius - 24, -7);

          ctx.font = "bold 11px 'Inter', sans-serif";
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.fillText(slice.subLabel, radius - 24, 12);
        }

        ctx.restore();
      }

      // Outer gold perimeter pins / pegs
      for (let i = 0; i < numSlices; i++) {
        const pinAngle = i * sliceAngle;
        const px = Math.cos(pinAngle) * (radius - 2);
        const py = Math.sin(pinAngle) * (radius - 2);

        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#c9922a";
        ctx.stroke();
      }

      ctx.restore(); // end wheel rotation

      // 3D Center Hub
      ctx.save();
      ctx.translate(center, center);

      // Hub shadow
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fill();

      // Hub gold gradient
      const hubGrad = ctx.createRadialGradient(-6, -6, 4, 0, 0, 45);
      hubGrad.addColorStop(0, "#fff4cc");
      hubGrad.addColorStop(0.3, "#f9d423");
      hubGrad.addColorStop(0.7, "#b8860b");
      hubGrad.addColorStop(1, "#5c3d0b");

      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, 2 * Math.PI);
      ctx.fillStyle = hubGrad;
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // Hub Center Core
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, 2 * Math.PI);
      ctx.fillStyle = "#2c1a0e";
      ctx.fill();

      // Center Star Icon
      ctx.fillStyle = "#fef08a";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "20px 'Inter', sans-serif";
      ctx.fillText("⭐", 0, 0);

      ctx.restore(); // end center hub

      // Flashing decorative LED lights on outer rim
      const ledCount = numSlices * 3;
      const ledAngleStep = (2 * Math.PI) / ledCount;
      const timeMs = Date.now() / 250;

      for (let i = 0; i < ledCount; i++) {
        const la = i * ledAngleStep;
        const lx = center + Math.cos(la) * (radius + 8);
        const ly = center + Math.sin(la) * (radius + 8);

        const isLightOn = Math.floor(timeMs + i) % 2 === 0;

        ctx.beginPath();
        ctx.arc(lx, ly, 3.2, 0, 2 * Math.PI);
        ctx.fillStyle = isLightOn ? "#fef08a" : "#ca8a04";
        ctx.shadowColor = isLightOn ? "#fde047" : "transparent";
        ctx.shadowBlur = isLightOn ? 8 : 0;
        ctx.fill();
        ctx.shadowColor = "transparent";
      }

      ctx.restore();
    },
    [slices, numSlices, sliceAngle, answeredQuestions]
  );

  // Initial render
  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [drawWheel]);

  // Imperative spin method called by parent
  const spin = useCallback(
    (targetIndex) => {
      if (isSpinningRef.current) return;
      isSpinningRef.current = true;
      setInternalSpinning(true);
      onSpinStart && onSpinStart();

      const startTime = performance.now();
      const initialAngle = currentAngleRef.current % (2 * Math.PI);

      // Top needle pointer is at -90 deg (or 3*PI/2)
      const topPointerAngle = (3 * Math.PI) / 2;
      const targetSliceCenter = (targetIndex + 0.5) * sliceAngle;

      let desiredMod = (topPointerAngle - targetSliceCenter) % (2 * Math.PI);
      if (desiredMod < 0) desiredMod += 2 * Math.PI;

      // 6 to 8 full spins for suspense
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

        // Needle bounce & tick sound
        const normalizedAngle = (3 * Math.PI) / 2 - (currentA % (2 * Math.PI));
        const positiveAngle =
          normalizedAngle >= 0
            ? normalizedAngle % (2 * Math.PI)
            : 2 * Math.PI + (normalizedAngle % (2 * Math.PI));
        const currentPeg = Math.floor(positiveAngle / sliceAngle);

        if (currentPeg !== lastTickIndexRef.current) {
          lastTickIndexRef.current = currentPeg;
          sounds.playTick();
          setNeedleBounce(1);
          setTimeout(() => setNeedleBounce(0), 75);
        }

        drawWheel(currentA);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Finish spinning
          isSpinningRef.current = false;
          setInternalSpinning(false);
          sounds.playLand();
          const finalSlice = slices[targetIndex];
          onSpinEnd && onSpinEnd(finalSlice, targetIndex);
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    },
    [onSpinStart, onSpinEnd, sliceAngle, slices, drawWheel]
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

  return (
    <div className="wheel-canvas-wrapper relative flex flex-col items-center select-none cursor-pointer">
      {/* Top Needle / Indicator with Spring Bounce */}
      <div
        className="pointer-indicator absolute z-20 top-[-6px] left-1/2 -translate-x-1/2 flex flex-col items-center transition-transform duration-75"
        style={{
          transform: `translateX(-50%) rotate(${needleBounce ? -14 : 0}deg)`,
          transformOrigin: "50% 0%",
        }}
      >
        <div className="w-8 h-12 relative filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
          <svg viewBox="0 0 32 48" className="w-full h-full">
            <polygon
              points="16,48 4,4 28,4"
              fill="url(#needleGrad)"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <circle cx="16" cy="12" r="6" fill="#b91c1c" stroke="#ffffff" strokeWidth="1.5" />
            <defs>
              <linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Wheel Canvas */}
      <canvas
        ref={canvasRef}
        width={540}
        height={540}
        className="wheel-canvas max-w-[88vw] max-h-[88vw] md:max-w-[460px] md:max-h-[460px] lg:max-w-[500px] lg:max-h-[500px] rounded-full"
      />
    </div>
  );
});

export default WheelCanvas;
