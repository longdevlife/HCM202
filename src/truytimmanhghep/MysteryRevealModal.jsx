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
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#fffcf7] to-[#f9f5ed] border-2 border-[#e5dfd5] shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5dfd5]">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center text-xl shadow-xs">
                  📖
                </span>
                <div>
                  <h3
                    className="text-lg md:text-xl font-black text-[#2c1a0e] tracking-tight uppercase"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Ý Nghĩa Lý Luận &amp; Thực Tiễn
                  </h3>
                  <div className="text-xs font-bold text-[#b45309] uppercase tracking-wider">
                    Chương 5 MLN131 · Cơ Cấu Xã Hội &amp; Liên Minh Giai Cấp
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold self-start sm:self-auto shadow-xs">
                <span>✓</span>
                <span>Minh chứng thực tiễn Việt Nam</span>
              </div>
            </div>

            {/* Context Summary Lead */}
            <div className="p-4 md:p-5 rounded-2xl bg-[#fffdfa] border-l-4 border-[#c9922a] border-t border-r border-b border-[#e5dfd5] shadow-xs">
              <p className="text-sm md:text-base text-[#4a3e35] leading-relaxed font-medium text-justify">
                {MYSTERY_EXPLANATION.summary}
              </p>
            </div>

            {/* 3 Structured Significance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MYSTERY_EXPLANATION.significance.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-[#e5dfd5] hover:border-[#c9922a] hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3.5 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 group-hover:bg-[#c9922a]/15 text-lg flex items-center justify-center transition-colors shadow-xs">
                        {item.icon}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                        {item.badge}
                      </span>
                    </div>

                    <h4
                      className="text-base font-bold text-[#2c1a0e] leading-snug group-hover:text-[#92400e] transition-colors"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {item.title}
                    </h4>

                    <p className="text-xs md:text-sm text-[#57483b] leading-relaxed text-justify">
                      {item.content}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-[#a16207]">
                    <span>Trọng tâm bài học</span>
                    <span className="font-mono text-sm opacity-60">#{item.num}</span>
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
