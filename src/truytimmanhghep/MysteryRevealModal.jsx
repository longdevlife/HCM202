import React from "react";
import { FULL_IMAGE_SRC } from "./puzzleData";

export default function MysteryRevealModal({
  isOpen,
  onClose,
  onRestart,
  unlockedCount = 0,
  correctCount = 0,
  allUnlocked = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-[#faf7f2] text-[#2c1a0e] rounded-3xl shadow-2xl border-2 border-[#f59e0b] overflow-hidden flex flex-col my-auto max-h-[96vh]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Modal Top Header Strip */}
        <div className="bg-gradient-to-r from-[#2c1a0e] via-[#4a2e18] to-[#2c1a0e] text-white px-5 sm:px-8 py-4 flex items-center justify-between border-b-2 border-[#f59e0b]/60">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#d97706] to-[#fbbf24] text-[#2c1a0e] font-black flex items-center justify-center text-xl shadow-lg animate-bounce">
              🏆
            </span>
            <div>
              <div className="text-[11px] tracking-widest uppercase text-[#fef08a] font-bold">
                KẾT QUẢ KHÁM PHÁ BỨC TRANH BÍ ẨN
              </div>
              <div
                className="text-base sm:text-lg md:text-xl font-black text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Bức Tranh Hoàn Chỉnh 
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

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-4 flex-1">
          {/* Full High-Res Artwork */}
          <div className="relative rounded-2xl overflow-hidden border-4 border-[#c9922a] shadow-2xl bg-black flex items-center justify-center">
            <img
              src={FULL_IMAGE_SRC}
              alt="Bức tranh hoàn chỉnh"
              className="w-full max-h-[68vh] object-contain"
            />
            <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full shadow-lg border border-amber-300/40 flex items-center gap-1.5">
              <span>📸</span>
              <span>BỨC TRANH HOÀN CHỈNH</span>
            </div>
            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-[#fde68a] text-xs font-bold px-3 py-1 rounded-full border border-amber-500/40">
              Tiến độ: {unlockedCount}/9 mảnh · Đúng: {correctCount}/9 câu
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#f2ece4] px-5 sm:px-8 py-4 border-t border-[#e5dfd5] flex items-center justify-between">
          <button
            type="button"
            onClick={onRestart}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>Chơi lại từ đầu</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-[#2c1a0e] to-[#4a2e18] hover:from-[#3e2413] hover:to-[#5c3a1f] text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Đóng bảng đối chiếu
          </button>
        </div>
      </div>
    </div>
  );
}
