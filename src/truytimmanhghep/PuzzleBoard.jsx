import React, { useState } from "react";
import { FULL_IMAGE_SRC } from "./puzzleData";

export default function PuzzleBoard({
  gridPieces,
  unlockedPieces,
  onPieceClick,
  justUnlockedQNum,
  allUnlocked,
}) {
  const [hoveredQNum, setHoveredQNum] = useState(null);

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl p-3 sm:p-5 md:p-6 bg-gradient-to-b from-[#2e1d12] via-[#22130a] to-[#160b05] border-4 border-[#c9922a]/80 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      {/* Decorative Golden Corner Rivets */}
      <div className="absolute top-3 left-3 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#b45309] to-[#fde68a] shadow-md border border-[#78350f] pointer-events-none z-30"></div>
      <div className="absolute top-3 right-3 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#b45309] to-[#fde68a] shadow-md border border-[#78350f] pointer-events-none z-30"></div>
      <div className="absolute bottom-3 left-3 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#b45309] to-[#fde68a] shadow-md border border-[#78350f] pointer-events-none z-30"></div>
      <div className="absolute bottom-3 right-3 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#b45309] to-[#fde68a] shadow-md border border-[#78350f] pointer-events-none z-30"></div>

      {/* Header Plaque */}
      <div className="flex items-center justify-between mb-3 px-2 sm:px-4">
        <div className="flex items-center gap-2">
          <span className="text-[#f59e0b] text-base md:text-lg">🖼️</span>
          <span
            className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-wider text-[#fef08a]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Bức Tranh Bí Ẩn (Lưới 3×3)
          </span>
        </div>
        <div className="text-[11px] sm:text-xs text-[#d4af37] font-semibold">
          {allUnlocked ? (
            <span className="text-emerald-400 font-bold animate-pulse">
              ✨ Đã mở trọn vẹn 9/9 mảnh ghép!
            </span>
          ) : (
            <span>Bấm vào ô số hoặc chọn câu hỏi bên dưới để lật mở</span>
          )}
        </div>
      </div>

      {/* 3x3 Puzzle Canvas Container */}
      <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden bg-black/90 border-2 border-[#b45309]/50 shadow-inner select-none">
        {/* Full Image in background for seamless reveal */}
        <img
          src={FULL_IMAGE_SRC}
          alt="Bức tranh nền"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-10"
        />

        {/* 3x3 Grid of 9 Cells */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[2px] p-[2px] z-10">
          {gridPieces.map((cell) => {
            const isUnlocked = Boolean(unlockedPieces[cell.qNum]);
            const isJustUnlocked = justUnlockedQNum === cell.qNum;
            const isHovered = hoveredQNum === cell.qNum;

            return (
              <div
                key={`cell-${cell.row}-${cell.col}`}
                className="relative w-full h-full overflow-hidden transition-all duration-300"
                onMouseEnter={() => setHoveredQNum(cell.qNum)}
                onMouseLeave={() => setHoveredQNum(null)}
              >
                {isUnlocked ? (
                  /* ================= MẢNH ĐÃ ĐƯỢC LẬT MỞ ================= */
                  <div
                    className={`relative w-full h-full group ${
                      isJustUnlocked ? "animate-reveal-piece" : ""
                    }`}
                  >
                    {/* Sliced Piece Image */}
                    <img
                      src={cell.pieceImage}
                      alt={`Mảnh câu ${cell.qNum}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      loading="eager"
                    />

                    {/* Subtle Golden Border on Hover */}
                    <div
                      className={`absolute inset-0 pointer-events-none transition-all duration-200 ${
                        isHovered
                          ? "ring-2 ring-amber-400/80 bg-amber-400/5"
                          : "ring-1 ring-black/30"
                      }`}
                    ></div>

                    {/* Miniature Completed Indicator */}
                    <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/75 backdrop-blur-xs text-[#fef08a] px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-500/40">
                      Câu #{cell.qNum} ✓
                    </div>
                  </div>
                ) : (
                  /* ================= MẢNH CHE (CHƯA TRẢ LỜI) ================= */
                  <button
                    type="button"
                    onClick={() => onPieceClick(cell.question)}
                    className={`w-full h-full relative flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                      isHovered
                        ? "bg-gradient-to-br from-[#452714] via-[#2f190c] to-[#1c0e06] scale-[0.985] shadow-lg ring-2 ring-[#fbbf24]"
                        : "bg-gradient-to-br from-[#382010] via-[#241309] to-[#150a04] ring-1 ring-[#c9922a]/40"
                    }`}
                  >
                    {/* Subtle grid pattern texture */}
                    <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:12px_12px]"></div>

                    {/* Medallion with the User's Designated Question Number */}
                    <div
                      className={`relative w-11 h-11 sm:w-14 sm:h-14 md:w-18 md:h-18 rounded-full flex items-center justify-center font-black transition-all duration-300 shadow-md ${
                        isHovered
                          ? "bg-gradient-to-tr from-[#d97706] via-[#f59e0b] to-[#fef08a] text-[#2c1a0e] scale-110 shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                          : "bg-gradient-to-tr from-[#92400e] via-[#b45309] to-[#fde68a] text-[#1c0d05] border-2 border-[#fef08a]"
                      }`}
                    >
                      <span
                        className="text-lg sm:text-2xl md:text-3xl font-black drop-shadow-sm"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {cell.qNum}
                      </span>
                    </div>

                    {/* Label below medallion */}
                    <div className="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#d4af37] opacity-90 transition-opacity duration-200">
                      {isHovered ? "Mở câu hỏi" : `Mảnh ${cell.qNum}`}
                    </div>

                    {/* Hover Glow Edge */}
                    {isHovered && (
                      <div className="absolute inset-0 bg-[#f59e0b]/10 pointer-events-none animate-pulse"></div>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
