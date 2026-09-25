import React from "react";

// Hàm sinh toạ độ SVG cho mảnh ghép puzzle với các mấu lồi/lõm (tabs & sockets)
function generatePuzzlePath(W, H, r = 14, tabs = { top: 0, right: 1, bottom: 0, left: 0 }) {
  const pad = 16;
  const x0 = pad;
  const y0 = pad;
  const x1 = pad + W;
  const y1 = pad + H;

  const tabDepth = 12;
  let d = `M ${x0 + r} ${y0} `;

  // TOP EDGE
  if (tabs.top === 0) {
    d += `L ${x1 - r} ${y0} `;
  } else {
    const dir = tabs.top; // 1 = up (-y), -1 = down (+y)
    const mx = (x0 + x1) / 2;
    d += `L ${mx - 16} ${y0} `;
    d += `C ${mx - 14} ${y0 - dir * 3} ${mx - 11} ${y0 - dir * 5} ${mx - 9} ${y0 - dir * 7} `;
    d += `C ${mx - 14} ${y0 - dir * tabDepth} ${mx + 14} ${y0 - dir * tabDepth} ${mx + 9} ${y0 - dir * 7} `;
    d += `C ${mx + 11} ${y0 - dir * 5} ${mx + 14} ${y0 - dir * 3} ${mx + 16} ${y0} `;
    d += `L ${x1 - r} ${y0} `;
  }

  // Top-Right corner
  d += `A ${r} ${r} 0 0 1 ${x1} ${y0 + r} `;

  // RIGHT EDGE
  if (tabs.right === 0) {
    d += `L ${x1} ${y1 - r} `;
  } else {
    const dir = tabs.right; // 1 = right (+x), -1 = left (-x)
    const my = (y0 + y1) / 2;
    d += `L ${x1} ${my - 16} `;
    d += `C ${x1 + dir * 3} ${my - 14} ${x1 + dir * 5} ${my - 11} ${x1 + dir * 7} ${my - 9} `;
    d += `C ${x1 + dir * tabDepth} ${my - 14} ${x1 + dir * tabDepth} ${my + 14} ${x1 + dir * 7} ${my + 9} `;
    d += `C ${x1 + dir * 5} ${my + 11} ${x1 + dir * 3} ${my + 14} ${x1} ${my + 16} `;
    d += `L ${x1} ${y1 - r} `;
  }

  // Bottom-Right corner
  d += `A ${r} ${r} 0 0 1 ${x1 - r} ${y1} `;

  // BOTTOM EDGE
  if (tabs.bottom === 0) {
    d += `L ${x0 + r} ${y1} `;
  } else {
    const dir = tabs.bottom; // 1 = down (+y), -1 = up (-y)
    const mx = (x0 + x1) / 2;
    d += `L ${mx + 16} ${y1} `;
    d += `C ${mx + 14} ${y1 + dir * 3} ${mx + 11} ${y1 + dir * 5} ${mx + 9} ${y1 + dir * 7} `;
    d += `C ${mx + 14} ${y1 + dir * tabDepth} ${mx - 14} ${y1 + dir * tabDepth} ${mx - 9} ${y1 + dir * 7} `;
    d += `C ${mx - 11} ${y1 + dir * 5} ${mx - 14} ${y1 + dir * 3} ${mx - 16} ${y1} `;
    d += `L ${x0 + r} ${y1} `;
  }

  // Bottom-Left corner
  d += `A ${r} ${r} 0 0 1 ${x0} ${y1 - r} `;

  // LEFT EDGE
  if (tabs.left === 0) {
    d += `L ${x0} ${y0 + r} `;
  } else {
    const dir = tabs.left; // 1 = left (-x), -1 = right (+x)
    const my = (y0 + y1) / 2;
    d += `L ${x0} ${my + 16} `;
    d += `C ${x0 - dir * 3} ${my + 14} ${x0 - dir * 5} ${my + 11} ${x0 - dir * 7} ${my + 9} `;
    d += `C ${x0 - dir * tabDepth} ${my + 14} ${x0 - dir * tabDepth} ${my - 14} ${x0 - dir * 7} ${my - 9} `;
    d += `C ${x0 - dir * 5} ${my - 11} ${x0 - dir * 3} ${my - 14} ${x0} ${my - 16} `;
    d += `L ${x0} ${y0 + r} `;
  }

  // Top-Left corner
  d += `A ${r} ${r} 0 0 1 ${x0 + r} ${y0} `;
  d += "Z";

  return { d, pad, totalW: W + pad * 2, totalH: H + pad * 2 };
}

// Cấu hình mấu nối đặc trưng cho 9 mảnh ghép (3x3 puzzle interlocking)
const PUZZLE_TAB_CONFIGS = [
  { top: 0, right: 1, bottom: -1, left: 0 },  // 1: Góc trên-trái
  { top: 0, right: 1, bottom: 1, left: -1 },  // 2: Cạnh trên-giữa
  { top: 0, right: 0, bottom: -1, left: -1 }, // 3: Góc trên-phải
  { top: 1, right: -1, bottom: 0, left: 0 },  // 4: Cạnh giữa-trái
  { top: -1, right: 1, bottom: 1, left: -1 }, // 5: Mảnh tâm giữa
  { top: 1, right: 0, bottom: -1, left: -1 }, // 6: Cạnh giữa-phải
  { top: 0, right: 1, bottom: 0, left: 0 },   // 7: Góc dưới-trái
  { top: 1, right: -1, bottom: 0, left: -1 }, // 8: Cạnh dưới-giữa
  { top: 1, right: 0, bottom: 0, left: -1 },  // 9: Góc dưới-phải
];

export default function PuzzleQuestionCard({ question, onSelect, index = 0 }) {
  const config = PUZZLE_TAB_CONFIGS[(question.qNum - 1) % PUZZLE_TAB_CONFIGS.length];
  const { d, totalW, totalH } = generatePuzzlePath(300, 160, 14, config);

  return (
    <button
      type="button"
      onClick={() => onSelect(question)}
      aria-label={`Mở câu hỏi Mảnh ghép ${question.qNum}`}
      className="relative w-full aspect-[332/192] min-h-[150px] max-h-[220px] text-center cursor-pointer group hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 block focus:outline-none select-none"
    >
      {/* Khung hình dáng Mảnh Ghép Puzzle bằng SVG */}
      <svg
        className="absolute inset-0 w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] group-hover:drop-shadow-[0_16px_28px_rgba(245,158,11,0.45)] transition-all pointer-events-none"
        viewBox={`0 0 ${totalW} ${totalH}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`cardGrad_${question.qNum}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3d2110" />
            <stop offset="45%" stopColor="#281409" />
            <stop offset="100%" stopColor="#180b04" />
          </linearGradient>

          <linearGradient id={`goldBorder_${question.qNum}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <radialGradient id={`centerGlow_${question.qNum}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,158,11,0.2)" />
            <stop offset="100%" stopColor="rgba(245,158,11,0)" />
          </radialGradient>
        </defs>

        {/* Thân mảnh ghép puzzle */}
        <path
          d={d}
          fill={`url(#cardGrad_${question.qNum})`}
          stroke={`url(#goldBorder_${question.qNum})`}
          strokeWidth="2.4"
          className="group-hover:stroke-[#fef08a] transition-colors"
        />

        {/* Vùng sáng tâm nhẹ */}
        <path
          d={d}
          fill={`url(#centerGlow_${question.qNum})`}
        />

        {/* Viền vát nhẹ bên trong */}
        <path
          d={d}
          fill="none"
          stroke="rgba(254, 240, 138, 0.12)"
          strokeWidth="1"
          transform="scale(0.96) translate(5.5, 4.5)"
        />
      </svg>

      {/* Thiết kế thuần túy như 1 mảnh ghép ngoài đời: không hiện chủ đề, không hiện độ khó, không hiện text rườm rà */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#92400e] via-[#b45309] to-[#fde68a] text-[#1c0d05] border-2 border-[#fef08a] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          <span className="text-2xl sm:text-3xl font-black text-[#1c0d05]">
            {question.qNum}
          </span>
        </div>

        <div className="mt-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#fde68a] group-hover:text-white transition-colors">
          MẢNH GHÉP {question.qNum}
        </div>
      </div>
    </button>
  );
}
