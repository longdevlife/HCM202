import React, { useMemo, useState } from "react";

const W = 200; // 600 / 3
const H = 150; // 450 / 3

// Edge definitions for 3x3 jigsaw: [Top, Right, Bottom, Left]
// +1 = tab (bulges outward), -1 = hole (bulges inward), 0 = flat outer border
const PIECE_EDGES = [
  // Row 0
  [ 0,  1,  1,  0], // Piece 0 (top-left)
  [ 0, -1,  1, -1], // Piece 1 (top-center)
  [ 0,  0, -1,  1], // Piece 2 (top-right)
  // Row 1
  [-1,  1, -1,  0], // Piece 3 (mid-left)
  [-1, -1,  1, -1], // Piece 4 (center)
  [ 1,  0,  1,  1], // Piece 5 (mid-right)
  // Row 2
  [ 1, -1,  0,  0], // Piece 6 (bot-left)
  [-1,  1,  0,  1], // Piece 7 (bot-center)
  [-1,  0,  0, -1], // Piece 8 (bot-right)
];

// Generates an edge path segment with classic interlocking jigsaw curve
function getEdgePath(x1, y1, x2, y2, type) {
  if (type === 0) return `L ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const s = type; // +1 for outward tab, -1 for inward hole

  // Clockwise outward normal for SVG screen coordinates: nx = dy, ny = -dx
  const p = (t, d) => {
    const x = x1 + t * dx + s * d * dy;
    const y = y1 + t * dy - s * d * dx;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  };

  return [
    `L ${p(0.38, 0)}`,
    `C ${p(0.38, -0.05)} ${p(0.39, 0.12)} ${p(0.44, 0.16)}`,
    `C ${p(0.47, 0.18)} ${p(0.53, 0.18)} ${p(0.56, 0.16)}`,
    `C ${p(0.61, 0.12)} ${p(0.62, -0.05)} ${p(0.62, 0)}`,
    `L ${x2.toFixed(1)} ${y2.toFixed(1)}`,
  ].join(" ");
}

// Builds the full closed SVG path for a 3x3 jigsaw puzzle piece
function getPiecePath(index) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  const x0 = col * W;
  const y0 = row * H;
  const x1 = x0 + W;
  const y1 = y0 + H;
  const [top, right, bottom, left] = PIECE_EDGES[index];

  return [
    `M ${x0.toFixed(1)} ${y0.toFixed(1)}`,
    getEdgePath(x0, y0, x1, y0, top),
    getEdgePath(x1, y0, x1, y1, right),
    getEdgePath(x1, y1, x0, y1, bottom),
    getEdgePath(x0, y1, x0, y0, left),
    "Z",
  ].join(" ");
}

export default function PuzzleBoard({
  puzzleSet,
  unlockedPieces,
  onPieceClick,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Pre-calculate puzzle paths for all 9 pieces
  const piecePaths = useMemo(() => {
    return Array.from({ length: 9 }, (_, i) => getPiecePath(i));
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto p-3 sm:p-5 md:p-6 rounded-3xl bg-gradient-to-b from-[#2e1d12] via-[#24150c] to-[#1a0e07] border-4 border-[#c9922a]/70 shadow-2xl">
      {/* Decorative Golden Corner Screws */}
      <div className="absolute top-2.5 left-2.5 w-3 h-3 rounded-full bg-[#f59e0b] shadow-inner opacity-80 pointer-events-none z-20"></div>
      <div className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-[#f59e0b] shadow-inner opacity-80 pointer-events-none z-20"></div>
      <div className="absolute bottom-2.5 left-2.5 w-3 h-3 rounded-full bg-[#f59e0b] shadow-inner opacity-80 pointer-events-none z-20"></div>
      <div className="absolute bottom-2.5 right-2.5 w-3 h-3 rounded-full bg-[#f59e0b] shadow-inner opacity-80 pointer-events-none z-20"></div>

      {/* SVG INTERLOCKING JIGSAW PUZZLE BOARD */}
      <svg
        viewBox="0 0 600 450"
        className="w-full h-auto select-none rounded-2xl overflow-visible filter drop-shadow-xl"
        style={{ touchAction: "manipulation" }}
      >
        <defs>
          {/* ClipPath for each of the 9 interlocking puzzle pieces */}
          {piecePaths.map((path, idx) => (
            <clipPath key={`clip-${idx}`} id={`piece-clip-${idx}`}>
              <path d={path} />
            </clipPath>
          ))}

          {/* Gradients */}
          <linearGradient id="boardFrameGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#451a03" />
            <stop offset="50%" stop-color="#271104" />
            <stop offset="100%" stop-color="#140802" />
          </linearGradient>

          <radialGradient id="lockedPieceGrad" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stop-color="#4a2e18" />
            <stop offset="50%" stop-color="#2a170a" />
            <stop offset="100%" stop-color="#190d05" />
          </radialGradient>

          <radialGradient id="lockedHoverGrad" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stop-color="#653f20" />
            <stop offset="50%" stop-color="#3b200e" />
            <stop offset="100%" stop-color="#211107" />
          </radialGradient>

          <linearGradient id="goldMedalGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="50%" stop-color="#d97706" />
            <stop offset="100%" stop-color="#78350f" />
          </linearGradient>

          {/* Glow filter for active/unlocked edges */}
          <filter id="pieceGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Board Background Frame */}
        <rect
          x="0"
          y="0"
          width="600"
          height="450"
          rx="16"
          fill="url(#boardFrameGrad)"
          stroke="#92400e"
          strokeWidth="3"
        />

        {/* Underlying subtle outline grid showing puzzle cuts */}
        <g opacity="0.25">
          {piecePaths.map((path, idx) => (
            <path
              key={`base-outline-${idx}`}
              d={path}
              fill="none"
              stroke="#ca8a04"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          ))}
        </g>

        {/* 9 INTERLOCKING JIGSAW PUZZLE PIECES */}
        {puzzleSet.map((item) => {
          const idx = item.pieceIndex;
          const isUnlocked = Boolean(unlockedPieces[idx]);
          const isHovered = hoveredIndex === idx;
          const path = piecePaths[idx];

          // Center coordinate of this piece cell
          const cx = (item.col + 0.5) * W;
          const cy = (item.row + 0.5) * H;

          return (
            <g
              key={idx}
              className="cursor-pointer"
              onClick={() => onPieceClick(item)}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                transition: "transform 0.2s ease, filter 0.2s ease",
              }}
            >
              {isUnlocked ? (
                /* UNLOCKED: PIECE OF THE THEMATIC ARTWORK (NOT THE REAL SPOILER PHOTO) */
                <g>
                  {/* Clipped Thematic Artwork */}
                  <g clipPath={`url(#piece-clip-${idx})`}>
                    <image
                      href="/images/truytimmanhghep/thematic_puzzle_art.svg"
                      x="0"
                      y="0"
                      width="600"
                      height="450"
                      preserveAspectRatio="none"
                    />
                  </g>

                  {/* Interlocking Puzzle Seam Outline */}
                  <path
                    d={path}
                    fill={isHovered ? "rgba(254, 240, 138, 0.15)" : "rgba(16, 185, 129, 0.05)"}
                    stroke={isHovered ? "#fef08a" : "#10b981"}
                    strokeWidth={isHovered ? "3.5" : "2.5"}
                    filter={isHovered ? "url(#pieceGlow)" : "none"}
                  />

                  {/* Completed Badge on Piece */}
                  <g transform={`translate(${cx}, ${cy + 42})`}>
                    <rect
                      x="-38"
                      y="-10"
                      width="76"
                      height="20"
                      rx="10"
                      fill="rgba(6, 78, 59, 0.9)"
                      stroke="#34d399"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#a7f3d0"
                      fontSize="10"
                      fontWeight="900"
                      letterSpacing="0.5"
                    >
                      ✓ Ô SỐ {item.pieceNumber}
                    </text>
                  </g>

                  {/* Subtle hover prompt to re-read question */}
                  {isHovered && (
                    <g transform={`translate(${cx}, ${cy - 5})`}>
                      <rect
                        x="-46"
                        y="-12"
                        width="92"
                        height="24"
                        rx="12"
                        fill="rgba(0, 0, 0, 0.85)"
                        stroke="#fde047"
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#fef08a"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        Xem lại câu hỏi 👁️
                      </text>
                    </g>
                  )}
                </g>
              ) : (
                /* LOCKED: MYSTERY JIGSAW PIECE WITH TABS & HOLES */
                <g>
                  {/* Textured Jigsaw Piece Body */}
                  <path
                    d={path}
                    fill={isHovered ? "url(#lockedHoverGrad)" : "url(#lockedPieceGrad)"}
                    stroke={isHovered ? "#fde047" : "#c9922a"}
                    strokeWidth={isHovered ? "3.5" : "2"}
                    filter={isHovered ? "url(#pieceGlow)" : "none"}
                  />

                  {/* Center Golden Medal */}
                  <circle
                    cx={cx}
                    cy={cy - 16}
                    r={isHovered ? "22" : "20"}
                    fill="url(#goldMedalGrad)"
                    stroke="#fef08a"
                    strokeWidth="2"
                    style={{ transition: "r 0.2s ease" }}
                  />
                  <text
                    x={cx}
                    y={cy - 10}
                    textAnchor="middle"
                    fontSize={isHovered ? "18" : "16"}
                    fill="#181512"
                    fontWeight="bold"
                  >
                    💡
                  </text>

                  {/* Piece Number & Title */}
                  <text
                    x={cx}
                    y={cy + 18}
                    textAnchor="middle"
                    fill="#fef08a"
                    fontSize="14"
                    fontWeight="900"
                    fontFamily="'Playfair Display', serif"
                  >
                    Ô SỐ {item.pieceNumber}
                  </text>

                  {/* Question Topic Tag */}
                  <text
                    x={cx}
                    y={cy + 35}
                    textAnchor="middle"
                    fill="#dbc39c"
                    fontSize="10.5"
                    fontWeight="600"
                    opacity="0.9"
                  >
                    {item.question.tag}
                  </text>

                  {/* Interactive Button Pill */}
                  <g transform={`translate(${cx}, ${cy + 52})`}>
                    <rect
                      x="-46"
                      y="-8"
                      width="92"
                      height="17"
                      rx="8.5"
                      fill={isHovered ? "rgba(217, 119, 6, 0.9)" : "rgba(0, 0, 0, 0.55)"}
                      stroke={isHovered ? "#fef08a" : "rgba(201, 146, 42, 0.6)"}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={isHovered ? "#ffffff" : "#fde68a"}
                      fontSize="8.5"
                      fontWeight="800"
                      letterSpacing="0.5"
                    >
                      BẤM ĐỂ MỞ 🔍
                    </text>
                  </g>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
