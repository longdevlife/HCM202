import React from "react";
import { MYSTERY_IMAGE_SRC } from "./puzzleData";

export default function PuzzleBoard({
  puzzleSet,
  unlockedPieces,
  onPieceClick,
}) {
  return (
    <div className="relative w-full max-w-3xl mx-auto p-3.5 sm:p-5 md:p-6 rounded-3xl bg-gradient-to-b from-[#2e1d12] via-[#24150c] to-[#1a0e07] border-4 border-[#c9922a]/70 shadow-2xl">
      {/* Decorative Golden Corner Screws */}
      <div className="absolute top-2.5 left-2.5 w-3 h-3 rounded-full bg-[#f59e0b] shadow-inner opacity-80"></div>
      <div className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-[#f59e0b] shadow-inner opacity-80"></div>
      <div className="absolute bottom-2.5 left-2.5 w-3 h-3 rounded-full bg-[#f59e0b] shadow-inner opacity-80"></div>
      <div className="absolute bottom-2.5 right-2.5 w-3 h-3 rounded-full bg-[#f59e0b] shadow-inner opacity-80"></div>

      {/* 3x3 Grid of Puzzle Pieces */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 md:gap-4 aspect-[4/3] w-full">
        {puzzleSet.map((item) => {
          const isUnlocked = Boolean(unlockedPieces[item.pieceIndex]);
          const colX = item.col === 0 ? "0%" : item.col === 1 ? "50%" : "100%";
          const rowY = item.row === 0 ? "0%" : item.row === 1 ? "50%" : "100%";

          return (
            <div
              key={item.pieceIndex}
              className="puzzle-card-perspective w-full h-full cursor-pointer select-none"
              onClick={() => onPieceClick(item)}
            >
              <div
                className={`puzzle-card-inner ${
                  isUnlocked ? "is-flipped" : "puzzle-tile-glow"
                }`}
              >
                {/* FRONT: LOCKED GOLDEN MYSTERY TILE */}
                <div className="puzzle-card-front flex flex-col items-center justify-between p-2 sm:p-3 md:p-4 text-[#eee2ca] hover:scale-[1.02] transition-transform duration-300">
                  {/* Top Bar on Tile */}
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#fef08a] uppercase">
                      Ô SỐ {item.pieceNumber}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-[#c9922a]/30 border border-[#c9922a] text-[10px] flex items-center justify-center font-bold text-[#fef08a]">
                      ?
                    </span>
                  </div>

                  {/* Center Mystery Icon & Number */}
                  <div className="flex flex-col items-center justify-center my-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-[#c9922a] to-[#784d14] flex items-center justify-center text-xl sm:text-2xl md:text-3xl shadow-lg border border-[#fde68a]/50">
                      💡
                    </div>
                    <span
                      className="mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-base font-black text-[#fef08a]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Ô Số {item.pieceNumber}
                    </span>
                    <span className="text-[9px] sm:text-[11px] text-[#c5b79e] font-medium line-clamp-1 max-w-[120px] text-center mt-0.5">
                      {item.question.tag}
                    </span>
                  </div>

                  {/* Bottom Prompt */}
                  <div className="w-full text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-black/40 text-[9px] sm:text-[10px] text-amber-200/90 font-bold tracking-wider uppercase border border-amber-500/30">
                      Bấm để mở câu hỏi 🔍
                    </span>
                  </div>
                </div>

                {/* BACK: REVEALED 1/9TH SLICE OF MYSTERY IMAGE */}
                <div
                  className="puzzle-card-back relative overflow-hidden"
                  style={{
                    backgroundImage: `url(${MYSTERY_IMAGE_SRC})`,
                    backgroundSize: "300% 300%",
                    backgroundPosition: `${colX} ${rowY}`,
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  {/* Subtle Dark Vignette & Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none"></div>

                  {/* Top Badge: Unlocked */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-600/95 text-white px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-black shadow-md border border-emerald-300/40">
                    <span>✓</span>
                    <span>Ô số {item.pieceNumber}</span>
                  </div>

                  {/* Bottom Host delivery reminder */}
                  <div className="absolute bottom-1.5 inset-x-1.5 text-center bg-black/70 backdrop-blur-xs rounded-md py-0.5 px-1 border border-white/10">
                    <span className="text-[8px] sm:text-[10px] font-bold text-emerald-300">
                      ✓ Đã mở thành công
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
