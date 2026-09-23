import React, { useState, useEffect } from "react";
import { sounds } from "../chiecnonkidieu/SoundEffects";

export default function PuzzleQuestionModal({
  pieceData,
  isOpen,
  onClose,
  onAnswerSubmit,
  isAlreadyAnswered = false,
}) {
  const [selectedOptId, setSelectedOptId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (pieceData && isOpen) {
      setSelectedOptId(null);
      setIsSubmitted(Boolean(isAlreadyAnswered));
      setIsCorrect(Boolean(isAlreadyAnswered));
    }
  }, [pieceData, isOpen, isAlreadyAnswered]);

  if (!isOpen || !pieceData) return null;

  const { pieceNumber, question } = pieceData;

  const handleSelect = (id) => {
    if (isSubmitted) return;
    setSelectedOptId(id);
  };

  const handleConfirm = () => {
    if (!selectedOptId || isSubmitted) return;

    const chosen = question.options.find((o) => o.id === selectedOptId);
    const correct = Boolean(chosen?.isCorrect);

    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      sounds.playCorrect();
      onAnswerSubmit && onAnswerSubmit(pieceData.pieceIndex, true);
    } else {
      sounds.playWrong();
      onAnswerSubmit && onAnswerSubmit(pieceData.pieceIndex, false);
    }
  };

  const handleModalClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#faf8f5] text-[#2c1a0e] rounded-3xl shadow-2xl border-2 border-[#c9922a]/50 overflow-hidden flex flex-col my-auto max-h-[94vh]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-[#2c1a0e] via-[#4a2e18] to-[#2c1a0e] text-white px-6 py-3.5 flex items-center justify-between border-b border-[#c9922a]/50">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-full bg-[#c9922a] text-[#2c1a0e] font-black flex items-center justify-center text-sm shadow-md">
              🧩
            </span>
            <div>
              <div className="text-[11px] tracking-widest uppercase text-[#fef08a] font-bold">
                MẢNH GHÉP SỐ {pieceNumber} · CÂU HỎI {question.level?.toUpperCase()}
              </div>
              <div
                className="text-base md:text-lg font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Chủ đề: {question.tag}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            aria-label="Đóng"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-base cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Question Text Card */}
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-[#e5dfd5]">
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 mb-2">
              {question.level}
            </div>
            <h3
              className="text-base md:text-lg font-bold text-[#2c1a0e] leading-relaxed whitespace-pre-line"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {question.question}
            </h3>
          </div>

          {/* 4 Options Grid */}
          <div className="space-y-2.5 p-4 bg-white rounded-2xl border border-[#e5dfd5] shadow-sm">
            <div className="grid grid-cols-1 gap-2.5">
              {question.options.map((opt) => {
                const isChosen = selectedOptId === opt.id;
                let cardClass =
                  "relative flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ";

                if (!isSubmitted) {
                  if (isChosen) {
                    cardClass +=
                      "bg-[#fff9ea] border-[#c9922a] shadow-md ring-2 ring-[#c9922a]/40 scale-[1.01]";
                  } else {
                    cardClass +=
                      "bg-white border-[#e5dfd5] hover:border-[#c9922a]/70 hover:bg-[#faf6ee]";
                  }
                } else {
                  if (opt.isCorrect) {
                    cardClass +=
                      "bg-[#ecfdf5] border-[#10b981] text-[#065f46] shadow-sm font-bold";
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
                    <span className="flex-1 text-sm md:text-base font-medium">
                      {opt.text}
                    </span>
                    {isSubmitted && opt.isCorrect && (
                      <span className="text-emerald-600 font-bold text-xs ml-1 flex-shrink-0">
                        ✓ Đúng
                      </span>
                    )}
                    {isSubmitted && isChosen && !opt.isCorrect && (
                      <span className="text-rose-600 font-bold text-xs ml-1 flex-shrink-0">
                        ✗ Sai
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Confirm button */}
            {!isSubmitted && (
              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  disabled={!selectedOptId}
                  onClick={handleConfirm}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider shadow transition-all ${
                    selectedOptId
                      ? "bg-[#c9922a] hover:bg-[#b8860b] text-white hover:scale-105 active:scale-95 cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Xác Nhận Đáp Án
                </button>
              </div>
            )}
          </div>

          {/* Feedback & Host Instruction Banner */}
          {isSubmitted && (
            <div
              className={`p-4 rounded-2xl border space-y-2 animate-fade-in ${
                isCorrect
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : "bg-rose-50 border-rose-300 text-rose-950"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-black text-sm md:text-base flex items-center gap-1.5">
                  <span>{isCorrect ? "🎯 CHÍNH XÁC!" : "💡 ĐÁP ÁN ĐÚNG:"}</span>
                </div>
                <div className="px-3.5 py-1 bg-white rounded-full border border-current text-xs font-black uppercase tracking-wider shadow-sm">
                  Đáp án: {question.correctId}
                </div>
              </div>

              {/* Host Real-Life Instruction */}
              {isCorrect && (
                <div className="p-3 bg-emerald-600 text-white rounded-xl shadow flex items-center gap-2.5 font-bold text-xs md:text-sm">
                  <span className="text-lg">🎁</span>
                  <span>
                    Mảnh ghép số {pieceNumber} đã mở! Hãy trao 1 mảnh ghép thực tế ở bên ngoài cho người chơi!
                  </span>
                </div>
              )}

              <p className="text-xs md:text-sm leading-relaxed">{question.explanation}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#f2ece4] px-6 py-3 border-t border-[#e5dfd5] flex items-center justify-end">
          {isSubmitted ? (
            <button
              type="button"
              onClick={handleModalClose}
              className="px-6 py-2.5 rounded-full font-bold text-sm bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Tiếp Tục Bảng Mảnh Ghép 🧩
            </button>
          ) : (
            <button
              type="button"
              onClick={handleModalClose}
              className="px-5 py-2 rounded-full text-xs font-bold text-gray-600 hover:bg-black/5 cursor-pointer"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
