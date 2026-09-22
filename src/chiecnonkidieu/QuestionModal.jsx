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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#faf8f5] text-[#2c1a0e] rounded-2xl shadow-2xl border-2 border-[#c9922a]/40 overflow-hidden flex flex-col max-h-[92vh]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-[#2c1a0e] via-[#4a2e18] to-[#2c1a0e] text-white px-6 py-4 flex items-center justify-between border-b border-[#c9922a]/50">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-full bg-[#c9922a] text-[#2c1a0e] font-black flex items-center justify-center text-sm shadow-md">
              {question.num}
            </span>
            <div>
              <div className="text-xs tracking-wider uppercase text-[#fef08a] font-bold">
                {question.badge || "CÂU HỎI CHUYÊN ĐỀ"}
              </div>
              <div
                className="text-base font-bold text-white"
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

        {/* Scrollable Question & Options Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Question Text */}
          <div className="p-4 bg-white rounded-xl shadow-sm border border-[#e5dfd5]">
            <h3
              className="text-lg md:text-xl font-bold text-[#2c1a0e] leading-relaxed"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {question.question}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="space-y-3">
            {question.options.map((opt) => {
              const isChosen = selectedOptId === opt.id;
              let cardClass =
                "relative flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ";

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
                    <span className="text-emerald-600 font-bold text-base ml-2">✓ Đúng</span>
                  )}
                  {isSubmitted && isChosen && !opt.isCorrect && (
                    <span className="text-rose-600 font-bold text-base ml-2">✗ Sai</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detailed Feedback & Scientific Explanation */}
          {isSubmitted && (
            <div
              className={`p-4 rounded-xl border ${
                isCorrect
                  ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                  : "bg-rose-50/90 border-rose-300 text-rose-950"
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm mb-1.5">
                <span>{isCorrect ? "🎯 CHÍNH XÁC!" : "💡 CHƯA CHÍNH XÁC!"}</span>
                <span className="text-xs opacity-75">— Luận giải học thuật:</span>
              </div>
              <p className="text-sm leading-relaxed">{question.explanation}</p>
            </div>
          )}

          {/* Banner notification if all 5 questions are now answered */}
          {isSubmitted && allAnswered && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <div className="font-bold text-sm">XUẤT SẮC! ĐÃ HOÀN THÀNH TOÀN BỘ 5 CÂU HỎI!</div>
                  <div className="text-xs text-amber-100">
                    Bấm nút bên dưới để mở toàn cảnh KẾT NỘI DUNG BÀI HỌC
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
                  className="px-4 py-2 bg-white text-amber-900 font-black text-xs uppercase rounded-lg shadow-md hover:bg-amber-50 active:scale-95 transition-transform"
                >
                  Xem Kết Luận Ngay
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
              : "Hoàn tất câu hỏi chuyên đề"}
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
                {allAnswered ? "Đóng & Đến Tổng Kết 📜" : "Tiếp Tục Vòng Quay 🎡"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
