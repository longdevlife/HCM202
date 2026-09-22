import React, { useState } from "react";
import { sounds } from "./SoundEffects";

export default function QuestionModal({
  question,
  isOpen,
  onClose,
  onAnswerSubmit,
  allAnswered = false,
  onOpenSummary,
}) {
  const [selectedOptId, setSelectedOptId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!isOpen || !question) return null;

  const handleSelect = (optId) => {
    if (isSubmitted) return;
    setSelectedOptId(optId);
  };

  const handleSubmit = () => {
    if (!selectedOptId || isSubmitted) return;
    const opt = question.options.find((o) => o.id === selectedOptId);
    const correct = Boolean(opt?.isCorrect);
    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }

    onAnswerSubmit && onAnswerSubmit(question.id, correct, opt);
  };

  const handleNext = () => {
    setSelectedOptId(null);
    setIsSubmitted(false);
    setIsCorrect(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#faf8f5] text-[#2c1a0e] rounded-3xl shadow-2xl border-2 border-[#c9922a]/50 overflow-hidden flex flex-col my-auto max-h-[94vh]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-[#2c1a0e] via-[#4a2e18] to-[#2c1a0e] text-white px-6 py-4 flex items-center justify-between border-b border-[#c9922a]/50">
          <div className="flex items-center space-x-3">
            <span className="w-9 h-9 rounded-full bg-[#c9922a] text-[#2c1a0e] font-black flex items-center justify-center text-sm shadow-md">
              {question.num}
            </span>
            <div>
              <div className="text-xs tracking-widest uppercase text-[#fef08a] font-bold">
                {question.badge} · {question.typeTag}
              </div>
              <div
                className="text-base md:text-lg font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {question.title}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#c9922a]/20 border border-[#c9922a] text-[#fef08a]">
              +{question.points || 100} Điểm
            </span>
          </div>
        </div>

        {/* Scrollable Question & Clues Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Visual Clues / Scrambled Tiles for Puzzle Questions */}
          {question.visualClues && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 shadow-inner">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <span>🎨</span>
                <span>Gợi ý hình ảnh trực quan:</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                {question.visualClues.map((item, idx) =>
                  item.plus ? (
                    <span key={idx} className="text-amber-500 font-black text-lg">
                      {item.plus}
                    </span>
                  ) : (
                    <div
                      key={idx}
                      className="flex flex-col items-center bg-white px-3 py-2 rounded-xl shadow-sm border border-amber-200 text-center min-w-[70px]"
                    >
                      <span className="text-2xl mb-1">{item.icon}</span>
                      <span className="text-[10px] text-gray-500 font-medium leading-tight">
                        {item.label}
                      </span>
                      {isSubmitted && (
                        <span className="text-xs font-black text-amber-700 mt-1 uppercase">
                          = {item.word}
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Scrambled Letter Tiles for Question 4 */}
          {question.scrambledTiles && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 shadow-inner">
              <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <span>🔤</span>
                <span>Hàng ngang gồm 11 chữ cái đang bị đảo lộn:</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
                {question.scrambledTiles.map((char, idx) => (
                  <span
                    key={idx}
                    className="w-8 h-9 md:w-9 md:h-10 rounded-lg bg-white border-2 border-purple-300 text-purple-900 font-black text-base md:text-lg flex items-center justify-center shadow-sm"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Question Text */}
          <div className="p-4 bg-white rounded-xl shadow-sm border border-[#e5dfd5]">
            <h3
              className="text-base md:text-lg font-bold text-[#2c1a0e] leading-relaxed whitespace-pre-line"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {question.question}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="space-y-2.5">
            {question.options.map((opt) => {
              const isChosen = selectedOptId === opt.id;
              let cardClass =
                "relative flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ";

              if (!isSubmitted) {
                if (isChosen) {
                  cardClass +=
                    "bg-[#fff9ea] border-[#c9922a] shadow-md ring-2 ring-[#c9922a]/30";
                } else {
                  cardClass +=
                    "bg-white border-[#e5dfd5] hover:border-[#c9922a]/70 hover:bg-[#faf6ee]";
                }
              } else {
                if (opt.isCorrect) {
                  cardClass +=
                    "bg-[#ecfdf5] border-[#10b981] text-[#065f46] shadow-sm";
                } else if (isChosen && !opt.isCorrect) {
                  cardClass +=
                    "bg-[#fef2f2] border-[#ef4444] text-[#991b1b] shadow-sm";
                } else {
                  cardClass += "bg-gray-50 border-gray-200 opacity-60";
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => handleSelect(opt.id)}
                  className={cardClass}
                >
                  <span
                    className={`w-7 h-7 flex-shrink-0 rounded-lg font-bold text-sm flex items-center justify-center transition-colors ${
                      isSubmitted && opt.isCorrect
                        ? "bg-[#10b981] text-white"
                        : isSubmitted && isChosen && !opt.isCorrect
                        ? "bg-[#ef4444] text-white"
                        : isChosen
                        ? "bg-[#c9922a] text-white"
                        : "bg-[#2c1a0e]/10 text-[#2c1a0e]"
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="flex-1 text-sm md:text-base font-medium leading-relaxed">
                    {opt.text}
                  </span>
                  {isSubmitted && opt.isCorrect && (
                    <span className="text-emerald-600 font-bold text-sm ml-2">✓ Đáp án đúng</span>
                  )}
                  {isSubmitted && isChosen && !opt.isCorrect && (
                    <span className="text-rose-600 font-bold text-sm ml-2">✗ Sai</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Secret Word Reveal */}
          {isSubmitted && (
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                isCorrect
                  ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                  : "bg-rose-50/90 border-rose-300 text-rose-950"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm flex items-center gap-1.5">
                  <span>{isCorrect ? "🎯 CHÍNH XÁC!" : "💡 CHƯA CHÍNH XÁC!"}</span>
                </div>
                <div className="px-3 py-1 bg-white/80 rounded-full border border-current text-xs font-black uppercase tracking-wider">
                  Mảnh ghép: {question.secretWord}
                </div>
              </div>
              <p className="text-xs md:text-sm leading-relaxed">{question.explanation}</p>
            </div>
          )}

          {/* All 5 questions completed notification */}
          {isSubmitted && allAnswered && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <div className="font-bold text-sm">ĐÃ GIẢI MÃ ĐỦ 5 MẢNH GHÉP TỰA ĐỀ!</div>
                  <div className="text-xs text-amber-100">
                    Toàn bộ tựa đề bài học đã được ghép hoàn chỉnh. Bấm xem Kết luận nội dung ngay!
                  </div>
                </div>
              </div>
              {onOpenSummary && (
                <button
                  type="button"
                  onClick={() => {
                    handleNext();
                    onOpenSummary();
                  }}
                  className="px-4 py-2 bg-white text-amber-900 font-black text-xs uppercase rounded-lg shadow-md hover:bg-amber-50 active:scale-95 transition-transform whitespace-nowrap ml-2"
                >
                  Xem Kết Luận 📜
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#f2ece4] px-6 py-4 border-t border-[#e5dfd5] flex items-center justify-between">
          <div className="text-xs text-[#786c5e]">
            {!isSubmitted
              ? "Chọn 1 đáp án và bấm Xác nhận"
              : `Mảnh ghép mở khóa: "${question.secretWord}"`}
          </div>

          <div className="flex items-center space-x-3">
            {!isSubmitted ? (
              <button
                type="button"
                disabled={!selectedOptId}
                onClick={handleSubmit}
                className={`px-6 py-2.5 rounded-full font-bold text-sm shadow-md transition-all ${
                  selectedOptId
                    ? "bg-[#c9922a] hover:bg-[#b8860b] text-white hover:scale-105 active:scale-95"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Xác Nhận Câu Trả Lời
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-full font-bold text-sm bg-[#2c1a0e] hover:bg-[#4a2e18] text-white shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                {allAnswered ? "Đóng & Đến Bảng Tựa Đề 📜" : "Tiếp Tục Vòng Quay 🎡"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
