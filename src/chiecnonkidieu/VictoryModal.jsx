import React, { useEffect, useRef } from "react";
import { VICTORY_TITLE } from "./wheelData";
import { sounds } from "./SoundEffects";

export default function VictoryModal({
  isOpen,
  onClose,
  onOpenLessonSummary,
  onRestart,
}) {
  const canvasRef = useRef(null);

  // Play fanfare audio on mount / open
  useEffect(() => {
    if (isOpen) {
      sounds.playFanfare();
    }
  }, [isOpen]);

  // Lightweight festive confetti particle animation
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const colors = [
      "#fbbf24", // Amber
      "#f59e0b", // Gold
      "#ef4444", // Red
      "#10b981", // Emerald
      "#3b82f6", // Blue
      "#ec4899", // Pink
      "#ffffff", // White
      "#fde68a", // Light gold
    ];

    const particleCount = 75;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1,
      angle: Math.random() * 360,
      spinSpeed: Math.random() * 4 - 2,
      shape: Math.random() > 0.4 ? "rect" : "circle",
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.spinSpeed;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const keyConcepts = [
    { label: "CƠ CẤU", color: "bg-rose-500/20 text-rose-300 border-rose-500/50" },
    { label: "XÃ HỘI", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" },
    { label: "GIAI CẤP", color: "bg-blue-500/20 text-blue-300 border-blue-500/50" },
    { label: "THỜI KỲ QUÁ ĐỘ", color: "bg-amber-500/20 text-amber-300 border-amber-500/50" },
    { label: "CHỦ NGHĨA XÃ HỘI", color: "bg-purple-500/20 text-purple-300 border-purple-500/50" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Background Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      <div
        className="relative z-20 w-full max-w-3xl bg-gradient-to-b from-[#21160d] via-[#352010] to-[#1a110a] text-white rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.35)] border-2 border-[#f59e0b] overflow-hidden flex flex-col items-center p-6 md:p-10 my-auto text-center"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg cursor-pointer z-30"
        >
          ✕
        </button>

        {/* Laurel / Trophy Emblem */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-[#d97706] via-[#fbbf24] to-[#fef08a] p-1 shadow-2xl flex items-center justify-center mb-4 animate-bounce">
          <div className="w-full h-full rounded-full bg-[#21160d] flex items-center justify-center text-4xl md:text-5xl">
            🏆
          </div>
        </div>

        {/* Celebration Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b] text-[#fde68a] text-xs md:text-sm font-bold uppercase tracking-widest mb-3">
          <span>✨</span>
          <span>CHÚC MỪNG BẠN ĐÃ GIẢI MÃ THÀNH CÔNG!</span>
          <span>✨</span>
        </div>

        <p className="text-xs md:text-sm text-[#e5dfd5] max-w-lg mb-6 leading-relaxed">
          Bạn đã xuất sắc vượt qua toàn bộ 5 câu hỏi của Chiếc Nón Kỳ Diệu để ghép trọn vẹn tựa đề bài học:
        </p>

        {/* The Exact Title Banner requested by User */}
        <div className="w-full p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[#2c1808]/90 via-[#4d2a0d]/90 to-[#2c1808]/90 border-2 border-[#f59e0b] shadow-[0_0_40px_rgba(245,158,11,0.3)] mb-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f59e0b]/10 to-transparent pointer-events-none"></div>

          <div className="text-[11px] uppercase tracking-widest text-[#fde68a] font-bold mb-2">
            ⭐ TỰA ĐỀ BÀI HỌC ĐÃ ĐƯỢC GIẢI MÃ ⭐
          </div>

          <h1
            className="text-xl md:text-3xl lg:text-4xl font-black uppercase text-[#fef08a] tracking-wide leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {VICTORY_TITLE}
          </h1>
        </div>

        {/* 5 Decoded Segments */}
        <div className="w-full mb-8">
          <div className="text-xs uppercase tracking-wider text-[#d5c7b8] mb-3 font-semibold">
            5 Thành Tố Cốt Lõi Vừa Ghép Thành Công:
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {keyConcepts.map((item, idx) => (
              <span
                key={idx}
                className={`px-3 py-1.5 rounded-xl border text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-sm ${item.color}`}
              >
                <span>✓</span>
                <span>{item.label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-3 w-full max-w-sm">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl bg-gradient-to-r from-[#d97706] via-[#c9922a] to-[#b45309] hover:from-[#b45309] hover:to-[#92400e] text-white active:scale-95 cursor-pointer ring-2 ring-[#fde68a]/40 transition-all"
          >
            <span>🎡</span>
            <span>Quay lại Vòng Quay</span>
          </button>
        </div>

        {onRestart && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onRestart();
            }}
            className="mt-4 text-xs font-bold text-[#fde68a]/70 hover:text-[#fde68a] underline transition-colors cursor-pointer"
          >
            🔄 Chơi lại từ đầu
          </button>
        )}
      </div>
    </div>
  );
}
