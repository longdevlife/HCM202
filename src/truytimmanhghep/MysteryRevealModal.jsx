import React from "react";
import { MYSTERY_KEYWORD, MYSTERY_IMAGE_SRC, MYSTERY_EXPLANATION } from "./puzzleData";

export default function MysteryRevealModal({
  isOpen,
  onClose,
  onRestart,
  allUnlocked = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-[#faf8f5] text-[#2c1a0e] rounded-3xl shadow-2xl border-2 border-[#f59e0b] overflow-hidden flex flex-col my-auto max-h-[95vh]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-[#2c1a0e] via-[#4a2e18] to-[#2c1a0e] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#f59e0b]/60">
          <div className="flex items-center space-x-3">
            <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d97706] to-[#fbbf24] text-[#2c1a0e] font-black flex items-center justify-center text-xl shadow-lg animate-bounce">
              🏆
            </span>
            <div>
              <div className="text-[11px] tracking-widest uppercase text-[#fef08a] font-bold">
                KẾT QUẢ GIẢI MÃ BỨC TRANH BÍ ẨN
              </div>
              <div
                className="text-base md:text-xl font-black text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                TỪ KHÓA BỨC TRANH BÍ ẨN
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-base cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Complete Mystery Image */}
          <div className="relative rounded-2xl overflow-hidden border-4 border-[#c9922a] shadow-xl bg-black flex items-center justify-center">
            <img
              src={MYSTERY_IMAGE_SRC}
              alt={MYSTERY_KEYWORD}
              className="w-full max-h-[60vh] object-contain"
            />
            <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black text-xs md:text-sm px-3.5 py-1.5 rounded-full shadow-lg border border-amber-300/40 flex items-center gap-1.5">
              <span>📸</span>
              <span>BỨC TRANH HOÀN CHỈNH</span>
            </div>
          </div>

          {/* OFFICIAL KEYWORD DISPLAY */}
          <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#fffbeb] via-[#fef3c7] to-[#fde68a] border-2 border-[#d97706] shadow-lg text-center space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-[#d97706] text-white text-[11px] font-black uppercase tracking-widest shadow-sm">
              ✨ TỪ KHÓA CHÍNH XÁC CỦA BỨC TRANH
            </div>
            <h2
              className="text-lg md:text-2xl font-black text-[#78350f] uppercase leading-snug drop-shadow-xs"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {MYSTERY_KEYWORD}
            </h2>
          </div>

          {/* Academic Significance & Connection with Chapter 5 */}
          <div className="space-y-3 p-5 rounded-2xl bg-white border border-[#e5dfd5] shadow-sm">
            <div className="flex items-center gap-2 text-[#92400e] font-black text-sm uppercase tracking-wider">
              <span>📖</span>
              <span>Ý NGHĨA LÝ LUẬN & THỰC TIỄN (CHƯƠNG 5 MLN131)</span>
            </div>
            <p className="text-xs md:text-sm text-[#4b382a] leading-relaxed">
              {MYSTERY_EXPLANATION.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {MYSTERY_EXPLANATION.significance.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#d6cfc5] shadow-xs flex flex-col justify-between"
                >
                  <div className="font-bold text-xs md:text-sm text-[#78350f] mb-1.5">
                    {item.title}
                  </div>
                  <div className="text-xs text-[#57483b] leading-relaxed">
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#f2ece4] px-6 py-4 border-t border-[#e5dfd5] flex items-center justify-between">
          <button
            type="button"
            onClick={onRestart}
            className="px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>Chơi lại & Xáo trộn câu mới</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-bold text-xs md:text-sm bg-gradient-to-r from-[#2c1a0e] to-[#4a2e18] hover:from-[#3e2413] hover:to-[#5c3a1f] text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Đóng bảng giải mã
          </button>
        </div>
      </div>
    </div>
  );
}
