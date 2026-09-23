import React from "react";
import { LESSON_SUMMARY } from "./wheelData";

export default function LessonSummaryModal({
  isOpen,
  onClose,
  onRestart,
  answeredCount = 5,
  totalQuestions = 5,
}) {
  if (!isOpen) return null;

  const { header, takeaways, quote } = LESSON_SUMMARY;

  const handleCopySummary = () => {
    const textToCopy = `=== ${header.title} ===\n${header.subtitle}\n\n` +
      takeaways.map((t) => `${t.num}. ${t.title}\n${t.content}`).join("\n\n") +
      `\n\nDanh ngôn: ${quote.text} (${quote.source})`;

    navigator.clipboard.writeText(textToCopy);
    alert("Đã sao chép toàn bộ nội dung tổng kết bài học vào bộ nhớ tạm!");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-[#faf8f5] text-[#2c1a0e] rounded-3xl shadow-2xl border-2 border-[#c9922a] overflow-hidden flex flex-col my-auto max-h-[94vh]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Editorial Top Banner */}
        <div className="bg-gradient-to-r from-[#1e1b18] via-[#3d2715] to-[#1e1b18] text-[#fef08a] px-6 md:px-10 py-6 border-b-2 border-[#c9922a] relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9922a]/30 border border-[#c9922a] text-xs font-bold text-[#fef08a] uppercase tracking-widest mb-2">
                <span>⭐</span>
                <span>{header.tag}</span>
              </div>
              <h1
                className="text-2xl md:text-3xl font-bold text-white tracking-wide"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {header.title}
              </h1>
              <p className="text-sm text-[#e5dfd5] mt-1 max-w-2xl leading-relaxed">
                {header.subtitle}
              </p>
            </div>

            {/* Achievement Pieces Pill */}
            <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-2xl border border-[#c9922a]/40 self-start md:self-auto">
              <div className="text-3xl">🎯</div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#fef08a] font-bold">
                  TIẾN ĐỘ HOÀN THÀNH
                </div>
                <div className="text-lg font-black text-white">
                  {answeredCount}/{totalQuestions} Câu Hỏi
                </div>
              </div>
            </div>
          </div>

          {/* Close X button top right */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Summary Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 bg-gradient-to-b from-[#faf8f5] to-[#f3ece0]">
          {/* Section Introduction */}
          <div className="text-center max-w-2xl mx-auto mb-2">
            <h2
              className="text-xl md:text-2xl font-bold text-[#2c1a0e]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              5 Bài Học Cốt Lõi Về Cơ Cấu Xã Hội & Liên Minh Giai Cấp
            </h2>
            <div className="w-20 h-1 bg-[#c9922a] mx-auto my-2 rounded-full"></div>
            <p className="text-xs text-[#786c5e] italic">
              Nguồn học thuật chuẩn mực: {header.academicRef}
            </p>
          </div>

          {/* 5 Takeaways Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {takeaways.map((item, idx) => (
              <div
                key={item.num}
                className={`p-5 rounded-2xl bg-white shadow-sm border border-[#e5dfd5] hover:shadow-md hover:border-[#c9922a]/60 transition-all duration-200 flex flex-col justify-between ${
                  idx === 4 ? "md:col-span-2 bg-[#fffdfa]" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-2xl font-black opacity-30"
                      style={{ fontFamily: "'Playfair Display', serif", color: item.accent }}
                    >
                      {item.num}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white uppercase tracking-wider"
                      style={{ backgroundColor: item.accent }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <h3
                    className="text-base font-bold text-[#2c1a0e] mb-2 leading-snug"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#4a3e35] leading-relaxed text-justify">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Academic Highlight Quote Box */}
          <div className="p-6 rounded-2xl bg-[#2c1a0e] text-[#fef08a] border-l-4 border-[#c9922a] shadow-md relative overflow-hidden">
            <div className="absolute right-4 bottom-0 text-7xl text-white/5 select-none font-serif">
              ❝
            </div>
            <p
              className="text-base md:text-lg italic font-medium leading-relaxed mb-3 text-[#fff9ea]"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              {quote.text}
            </p>
            <div className="text-xs font-bold uppercase tracking-widest text-[#c9922a]">
              — {quote.source}
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="bg-[#f0e8dc] px-6 py-4 border-t border-[#e5dfd5] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#786c5e]">
            ⭐ Bài thuyết trình chuyên đề MLN131 · FPT University
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-[#c9922a] text-[#2c1a0e] bg-white hover:bg-[#fff9ea] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>📋</span>
              <span>Sao Chép Nội Dung</span>
            </button>

            {onRestart && (
              <button
                type="button"
                onClick={() => {
                  onRestart();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#c9922a] hover:bg-[#b8860b] text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>🔄</span>
                <span>Chơi Lại Vòng Quay</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-xs font-bold bg-[#2c1a0e] hover:bg-[#4a2e18] text-white transition-all shadow-sm active:scale-95"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
