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
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Rotation state in radians
  const currentAngleRef = useRef(0);
  const isSpinningRef = useRef(false);
  const lastTickIndexRef = useRef(-1);
  const [needleBounce, setNeedleBounce] = useState(0);
  const [internalSpinning, setInternalSpinning] = useState(false);
  const [hoverTitle, setHoverTitle] = useState("Bấm vào các ô câu hỏi để trả lời!");

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
      const radius = center - 28;

      ctx.clearRect(0, 0, size, size);
      ctx.save();

      // Outer drop shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 28;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 12;

      // Outer metallic gold ring
      const goldGrad = ctx.createLinearGradient(0, 0, size, size);
      goldGrad.addColorStop(0, "#f9d423");
      goldGrad.addColorStop(0.25, "#e65c00");
      goldGrad.addColorStop(0.5, "#ffea85");
      goldGrad.addColorStop(0.75, "#c9922a");
      goldGrad.addColorStop(1, "#834d1b");

      ctx.beginPath();
      ctx.arc(center, center, radius + 16, 0, 2 * Math.PI);
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
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
        ctx.stroke();

        // Label in slice
        ctx.save();
        const midA = startA + sliceAngle / 2;
        ctx.rotate(midA);

        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        if (isAnswered) {
          ctx.fillStyle = "#cbd5e1";
          ctx.font = "bold 18px 'Inter', sans-serif";
          ctx.fillText("✓ ĐÃ XONG", radius - 30, -10);

          ctx.font = "14px 'Inter', sans-serif";
          ctx.fillStyle = "#94a3b8";
          ctx.fillText(slice.label, radius - 30, 14);
        } else {
          ctx.fillStyle = slice.textColor || "#ffffff";
          ctx.font = "bold 21px 'Playfair Display', Georgia, serif";
          ctx.fillText(slice.label, radius - 28, -10);

          ctx.font = "bold 14px 'Inter', sans-serif";
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fillText(slice.subLabel, radius - 28, 14);
        }

        ctx.restore();
      }

      // Outer gold perimeter pins / pegs
      for (let i = 0; i < numSlices; i++) {
        const pinAngle = i * sliceAngle;
        const px = Math.cos(pinAngle) * (radius - 3);
        const py = Math.sin(pinAngle) * (radius - 3);

        ctx.beginPath();
        ctx.arc(px, py, 5.5, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#c9922a";
        ctx.stroke();
      }

      ctx.restore(); // end wheel rotation

      // 3D Center Hub
      ctx.save();
      ctx.translate(center, center);

      // Hub shadow
      ctx.beginPath();
      ctx.arc(0, 0, 58, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fill();

      // Hub gold gradient
      const hubGrad = ctx.createRadialGradient(-8, -8, 6, 0, 0, 56);
      hubGrad.addColorStop(0, "#fff4cc");
      hubGrad.addColorStop(0.3, "#f9d423");
      hubGrad.addColorStop(0.7, "#b8860b");
      hubGrad.addColorStop(1, "#5c3d0b");

      ctx.beginPath();
      ctx.arc(0, 0, 52, 0, 2 * Math.PI);
      ctx.fillStyle = hubGrad;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // Hub Center Core
      ctx.beginPath();
      ctx.arc(0, 0, 38, 0, 2 * Math.PI);
      ctx.fillStyle = "#2c1a0e";
      ctx.fill();

      // Center Star Icon
      ctx.fillStyle = "#fef08a";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "26px 'Inter', sans-serif";
      ctx.fillText("⭐", 0, 0);

      ctx.restore(); // end center hub

      // Flashing decorative LED lights on outer rim
      const ledCount = 30; // 30 evenly spaced festive LED lights
      const ledAngleStep = (2 * Math.PI) / ledCount;
      const timeMs = Date.now() / 250;

      for (let i = 0; i < ledCount; i++) {
        const la = i * ledAngleStep;
        const lx = center + Math.cos(la) * (radius + 9);
        const ly = center + Math.sin(la) * (radius + 9);

        const isLightOn = Math.floor(timeMs + i) % 2 === 0;

        ctx.beginPath();
        ctx.arc(lx, ly, 4, 0, 2 * Math.PI);
        ctx.fillStyle = isLightOn ? "#fef08a" : "#ca8a04";
        ctx.shadowColor = isLightOn ? "#fde047" : "transparent";
        ctx.shadowBlur = isLightOn ? 10 : 0;
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

  // Calculate slice from click coordinates
  const handleCanvasClick = (e) => {
    if (isSpinningRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const center = canvas.width / 2;
    const radius = center - 28;

    const clickX = (e.clientX - rect.left) * scaleX - center;
    const clickY = (e.clientY - rect.top) * scaleY - center;
    const dist = Math.sqrt(clickX * clickX + clickY * clickY);

    // Click outside wheel
    if (dist > radius + 16) return;

    // Click center hub -> Trigger Spin!
    if (dist <= 52) {
      if (onCenterClick) {
        onCenterClick();
      }
      return;
    }

    // Click on slice
    let clickAngle = Math.atan2(clickY, clickX);
    if (clickAngle < 0) clickAngle += 2 * Math.PI;

    const currentAngle =
      currentAngleRef.current >= 0
        ? currentAngleRef.current % (2 * Math.PI)
        : 2 * Math.PI + (currentAngleRef.current % (2 * Math.PI));

    let relativeAngle = (clickAngle - currentAngle) % (2 * Math.PI);
    if (relativeAngle < 0) relativeAngle += 2 * Math.PI;

    const clickedSliceIndex = Math.floor(relativeAngle / sliceAngle) % numSlices;
    const clickedSlice = slices[clickedSliceIndex];

    if (clickedSlice && onSliceClick) {
      onSliceClick(clickedSlice, clickedSliceIndex);
    }
  };

  // Hover feedback
  const handleCanvasMouseMove = (e) => {
    if (isSpinningRef.current) {
      setHoverTitle("Nón đang quay...");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const center = canvas.width / 2;
    const radius = center - 28;

    const clickX = (e.clientX - rect.left) * scaleX - center;
    const clickY = (e.clientY - rect.top) * scaleY - center;
    const dist = Math.sqrt(clickX * clickX + clickY * clickY);

    if (dist <= 52) {
      setHoverTitle("Chiếc Nón Kỳ Diệu");
      return;
    }

    if (dist > radius + 16) {
      setHoverTitle("Chiếc nón kỳ diệu");
      return;
    }

    let clickAngle = Math.atan2(clickY, clickX);
    if (clickAngle < 0) clickAngle += 2 * Math.PI;

    const currentAngle =
      currentAngleRef.current >= 0
        ? currentAngleRef.current % (2 * Math.PI)
        : 2 * Math.PI + (currentAngleRef.current % (2 * Math.PI));

    let relativeAngle = (clickAngle - currentAngle) % (2 * Math.PI);
    if (relativeAngle < 0) relativeAngle += 2 * Math.PI;

    const sliceIdx = Math.floor(relativeAngle / sliceAngle) % numSlices;
    const slice = slices[sliceIdx];
    if (slice) {
      const isDone = answeredQuestions[slice.questionId];
      setHoverTitle(
        `👉 Bấm để xem ${slice.label} (${slice.subLabel})${isDone ? " - Đã giải ✓" : ""}`
      );
    }
  };

  return (
    <div className="wheel-canvas-wrapper relative flex flex-col items-center select-none cursor-pointer">
      {/* Top Needle / Indicator with Spring Bounce */}
      <div
        className="pointer-indicator absolute z-20 -top-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center transition-transform duration-75 pointer-events-none"
        style={{
          transform: `translateX(-50%) rotate(${needleBounce ? -14 : 0}deg)`,
          transformOrigin: "50% 0%",
        }}
      >
        <div className="w-10 h-16 relative filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.65)]">
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
        width={680}
        height={680}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        title={hoverTitle}
        className="wheel-canvas w-[92vw] h-[92vw] max-w-[360px] max-h-[360px] sm:max-w-[480px] sm:max-h-[480px] md:max-w-[580px] md:max-h-[580px] lg:max-w-[660px] lg:max-h-[660px] rounded-full drop-shadow-2xl transition-transform duration-200 hover:scale-[1.008] cursor-pointer"
      />
    </div>
  );
});

export default WheelCanvas;
