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

  const getLevelBadgeClass = (lvl) => {
    if (lvl.includes("Nhận biết"))
      return "bg-blue-900/90 text-blue-200 border-blue-400/50";
    if (lvl.includes("Thông hiểu"))
      return "bg-amber-900/90 text-amber-200 border-amber-400/50";
    return "bg-purple-900/90 text-purple-200 border-purple-400/50";
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(question)}
      className="relative w-full aspect-[332/192] min-h-[160px] max-h-[220px] text-left cursor-pointer group hover:scale-[1.03] transition-all duration-300 block focus:outline-none"
    >
      {/* Khung hình dáng Mảnh Ghép Puzzle bằng SVG */}
      <svg
        className="absolute inset-0 w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] group-hover:drop-shadow-[0_16px_28px_rgba(245,158,11,0.4)] transition-all pointer-events-none"
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

          <linearGradient id={`badgeGrad_${question.qNum}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {/* Thân mảnh ghép puzzle */}
        <path
          d={d}
          fill={`url(#cardGrad_${question.qNum})`}
          stroke={`url(#goldBorder_${question.qNum})`}
          strokeWidth="2.2"
          className="group-hover:stroke-yellow-300 transition-colors"
        />

        {/* Viền trang trí beveled bóng chìm */}
        <path
          d={d}
          fill="none"
          stroke="rgba(254, 240, 138, 0.1)"
          strokeWidth="1"
          transform="scale(0.96) translate(5.5, 4.5)"
        />
      </svg>

      {/* Nội dung bên trong nằm gọn gàng với padding tối ưu */}
      <div className="absolute inset-[16px] px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col justify-between select-none">
        {/* Hàng 1: Huy hiệu số mảnh ghép + Tiêu đề + Badge độ khó */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          <div className="flex items-center gap-2 min-w-0">
            {/* Huy hiệu số hình dáng Mảnh Ghép Puzzle 3D */}
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 group-hover:rotate-6 transition-transform">
              <svg viewBox="0 0 44 44" className="w-full h-full filter drop-shadow-md">
                <path
                  d="M 8 4 L 18 4 C 18.5 1.5 20.5 0 22 0 C 23.5 0 25.5 1.5 26 4 L 36 4 A 4 4 0 0 1 40 8 L 40 18 C 42.5 18.5 44 20.5 44 22 C 44 23.5 42.5 25.5 40 26 L 40 36 A 4 4 0 0 1 36 40 L 26 40 C 25.5 37.5 23.5 36 22 36 C 20.5 36 18.5 37.5 18 40 L 8 40 A 4 4 0 0 1 4 36 L 4 26 C 6.5 25.5 8 23.5 8 22 C 8 20.5 6.5 18.5 4 18 L 4 8 A 4 4 0 0 1 8 4 Z"
                  fill={`url(#badgeGrad_${question.qNum})`}
                  stroke="#fef08a"
                  strokeWidth="1.5"
                />
                <text
                  x="22"
                  y="23"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#1c0d05"
                  fontSize="16"
                  fontWeight="900"
                >
                  {question.qNum}
                </text>
              </svg>
            </div>

            <div className="min-w-0 flex flex-col justify-center">
              <span className="text-[11.5px] sm:text-xs font-black text-[#fde68a] tracking-wide uppercase whitespace-nowrap">
                MẢNH GHÉP {question.qNum}
              </span>
              
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[9.5px] font-black uppercase tracking-wide border flex-shrink-0 whitespace-nowrap ${getLevelBadgeClass(
              question.level
            )}`}
          >
            {question.level.split("/")[0]}
          </span>
        </div>

        {/* Hàng 2: Chủ đề câu hỏi */}
        <div className="my-0.5">
          <div className="text-[11px] sm:text-xs uppercase font-bold text-[#d4af37] tracking-wider truncate">
            Chủ đề: {question.tag}
          </div>
        </div>

        {/* Hàng 3: Nút bấm ở chân thẻ */}
        <div className="pt-1.5 border-t border-amber-900/40 flex items-center justify-between text-[11px] sm:text-xs font-bold text-[#d4af37] group-hover:text-[#fde68a]">
          <span>Bấm để mở câu hỏi</span>
          <span className="group-hover:translate-x-1.5 transition-transform text-sm">➜</span>
        </div>
      </div>
    </button>
  );
}
