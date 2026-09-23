import React from "react";

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

      {/* 3x3 Grid of Question Tiles */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 md:gap-4 aspect-[4/3] w-full">
        {puzzleSet.map((item) => {
          const isUnlocked = Boolean(unlockedPieces[item.pieceIndex]);

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

                {/* BACK: COMPLETED STATUS TILE (NO SPOILER IMAGE) */}
                <div className="puzzle-card-back flex flex-col items-center justify-between p-2 sm:p-3 md:p-4 text-[#eee2ca] hover:scale-[1.02] transition-transform duration-300">
                  {/* Top Bar on Unlocked Tile */}
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-black tracking-widest text-emerald-300 uppercase flex items-center gap-1">
                      <span>✓</span>
                      <span>Ô SỐ {item.pieceNumber}</span>
                    </span>
                    <span className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400 text-[10px] flex items-center justify-center font-black text-emerald-300">
                      ✓
                    </span>
                  </div>

                  {/* Center Completed Icon & Title */}
                  <div className="flex flex-col items-center justify-center my-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center text-xl sm:text-2xl md:text-3xl shadow-lg border border-emerald-300/50">
                      ✅
                    </div>
                    <span
                      className="mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-base font-black text-emerald-200"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Đã Trả Lời Đúng
                    </span>
                    <span className="text-[9px] sm:text-[11px] text-emerald-300/80 font-medium line-clamp-1 max-w-[120px] text-center mt-0.5">
                      {item.question.tag}
                    </span>
                  </div>

                  {/* Bottom Action Prompt */}
                  <div className="w-full text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-950/70 text-[9px] sm:text-[10px] text-emerald-300 font-bold tracking-wider uppercase border border-emerald-500/40">
                      Bấm xem lại 👁️
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
