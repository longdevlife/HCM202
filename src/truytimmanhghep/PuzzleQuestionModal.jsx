import React, { useState, useEffect, useRef } from "react";
import { sounds } from "../chiecnonkidieu/SoundEffects";

export default function PuzzleQuestionModal({
  question,
  isOpen,
  onClose,
  onFinishQuestion,
}) {
  const [selectedOptId, setSelectedOptId] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isPieceRevealed, setIsPieceRevealed] = useState(false);
  const modalBodyRef = useRef(null);

  useEffect(() => {
    if (question && isOpen) {
      setSelectedOptId(null);
      setIsAnswerChecked(false);
      setIsCorrect(false);
      setIsPieceRevealed(false);
      if (modalBodyRef.current) {
        modalBodyRef.current.scrollTop = 0;
      }
    }
  }, [question, isOpen]);

  useEffect(() => {
    if (isPieceRevealed && modalBodyRef.current) {
      modalBodyRef.current.scrollTop = 0;
    }
  }, [isPieceRevealed]);

  if (!isOpen || !question) return null;

  const handleSelectOption = (optId) => {
    if (isAnswerChecked) return;
    setSelectedOptId(optId);
  };

  const handleCheckAnswer = () => {
    if (!selectedOptId || isAnswerChecked) return;

    const chosen = question.options.find((o) => o.id === selectedOptId);
    const correct = Boolean(chosen?.isCorrect);

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }
  };

  const handleOpenPiece = () => {
    setIsPieceRevealed(true);
  };

  const handleProceedAndClose = () => {
    if (!isAnswerChecked) {
      onClose();
      return;
    }
    onFinishQuestion(question.qNum, isCorrect);
  };

  const getLevelColor = (lvl) => {
    if (!lvl) return "bg-blue-50 text-blue-800 border-blue-200";
    if (lvl.includes("Nhận biết")) return "bg-blue-50 text-blue-800 border-blue-200";
    if (lvl.includes("Thông hiểu")) return "bg-amber-50 text-amber-800 border-amber-200";
    return "bg-purple-50 text-purple-800 border-purple-200";
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        style={{ maxHeight: "92vh", fontFamily: "'Inter', sans-serif" }}
        className="relative w-[96vw] md:w-[85vw] lg:w-[75vw] max-w-5xl bg-[#faf7f2] text-[#2c1a0e] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] border-2 sm:border-4 border-[#c9922a] overflow-hidden flex flex-col my-auto"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#2c1a0e] via-[#4a2e18] to-[#2c1a0e] text-white px-5 sm:px-7 py-3 sm:py-3.5 flex items-center justify-between border-b-2 border-[#c9922a]/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#b45309] to-[#fde68a] text-[#1c0d05] font-bold flex items-center justify-center text-lg sm:text-xl shadow-md border border-[#fef08a]">
              {question.qNum}
            </div>
            <div>
              <div className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight">
                {isPieceRevealed
                  ? `Mảnh ghép nhận được: Mảnh số ${question.qNum}`
                  : `Mảnh ghép số ${question.qNum}`}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleProceedAndClose}
            aria-label="Đóng"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div
          ref={modalBodyRef}
          className="p-4 sm:p-6 md:p-7 overflow-y-auto space-y-4 flex-1"
        >
          {!isPieceRevealed ? (
            /* ================= PHIÊN ĐÁP ÁN: HIỂN THỊ CÂU HỎI & CÁC LỰA CHỌN ================= */
            /* Khi chọn đáp án hiển thị đúng sai luôn ở phiên đáp án này */
            <div className="space-y-4 animate-fade-in">
              {/* Question Text Box - Định dạng chữ đơn giản, đồng bộ, có mức độ câu hỏi ở chỗ cũ */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#e5dfd5] shadow-xs space-y-2.5">
                {question.level && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getLevelColor(
                        question.level
                      )}`}
                    >
                      {question.level}
                    </span>
                  </div>
                )}
                <h3 className={`text-base sm:text-lg md:text-xl font-bold text-[#2c1a0e] leading-relaxed break-words ${question.question.includes('\n') ? 'whitespace-pre-line' : ''}`}>
                  {question.question}
                </h3>
              </div>

              {/* Thông báo kết quả ngay ở phiên đáp án sau khi kiểm tra */}
              {isAnswerChecked && (
                <div
                  className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-bold shadow-xs animate-fade-in ${
                    isCorrect
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : "bg-rose-50 border-rose-300 text-rose-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl">{isCorrect ? "🎯" : "💡"}</span>
                    <span>
                      {isCorrect
                        ? "Chính xác! Nhóm được cộng 10 điểm."
                        : `Chưa chính xác! Đáp án đúng là: ${question.correctId}`}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-white rounded-lg border border-current text-xs font-bold uppercase">
                    Đáp án: {question.correctId}
                  </span>
                </div>
              )}

              {/* Danh sách 4 lựa chọn - Hiển thị đúng/sai trực tiếp trên các đáp án */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#e5dfd5] shadow-xs space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Chọn một đáp án đúng nhất:
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {question.options.map((opt) => {
                    const isChosen = selectedOptId === opt.id;
                    const isThisCorrect = opt.isCorrect;

                    let cardClass =
                      "relative flex items-center gap-3.5 p-3 sm:p-3.5 md:p-4 rounded-xl border text-left transition-all duration-200 ";
                    let badgeClass =
                      "w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center transition-colors ";
                    let statusBadge = null;

                    if (!isAnswerChecked) {
                      // Giai đoạn đang chọn đáp án
                      if (isChosen) {
                        cardClass +=
                          "bg-[#fff9ea] border-[#c9922a] ring-2 ring-[#c9922a]/50 shadow-sm cursor-pointer";
                        badgeClass += "bg-[#c9922a] text-white shadow";
                        statusBadge = (
                          <span className="text-[#c9922a] font-bold text-xs uppercase ml-1 flex-shrink-0">
                            Đã chọn
                          </span>
                        );
                      } else {
                        cardClass +=
                          "bg-white border-[#e5dfd5] hover:border-[#c9922a]/70 hover:bg-[#faf6ee] cursor-pointer";
                        badgeClass += "bg-[#2c1a0e]/10 text-[#2c1a0e]";
                      }
                    } else {
                      // Đã kiểm tra đáp án: Hiển thị đúng sai luôn ở phiên đáp án!
                      if (isThisCorrect) {
                        cardClass +=
                          "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/40 shadow-sm";
                        badgeClass += "bg-emerald-600 text-white shadow";
                        statusBadge = (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-xs uppercase flex-shrink-0 flex items-center gap-1">
                            ✓ Đúng
                          </span>
                        );
                      } else if (isChosen && !isThisCorrect) {
                        cardClass +=
                          "bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/40 shadow-sm";
                        badgeClass += "bg-rose-600 text-white shadow";
                        statusBadge = (
                          <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-bold text-xs uppercase flex-shrink-0 flex items-center gap-1">
                            ✗ Sai
                          </span>
                        );
                      } else {
                        cardClass += "bg-gray-50/70 border-gray-200 text-gray-400 opacity-60";
                        badgeClass += "bg-gray-200 text-gray-500";
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={isAnswerChecked}
                        onClick={() => handleSelectOption(opt.id)}
                        className={cardClass}
                      >
                        <span className={badgeClass}>{opt.id}</span>
                        <span className="flex-1 text-sm sm:text-base md:text-lg leading-snug">
                          {opt.text}
                        </span>
                        {statusBadge}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ================= PHIÊN HIỆN MẢNH GHÉP: CHỈ HIỆN MỖI MẢNH GHÉP THÔI ================= */
            /* "để phiên hiện mảnh ghép chỉ hiện mỗi mảnh ghép thôi ko cần coi câu trả lời đúng" */
            <div className="flex flex-col items-center justify-center p-2 sm:p-6 space-y-4 animate-fade-in my-auto">
              <div className="text-center space-y-1">
                <div className="text-xs uppercase font-bold tracking-widest text-[#b45309]">
                  MẢNH GHÉP SỐ {question.qNum}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#2c1a0e]">
                  Mảnh ghép #{question.qNum} đã được mở thành công
                </h3>
              </div>

              {/* Sliced Piece Image - Trọng tâm duy nhất là mảnh ghép */}
              <div className="relative w-full max-w-lg aspect-[3/2] rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-4 border-[#c9922a] bg-black flex items-center justify-center">
                <img
                  src={question.pieceImage}
                  alt={`Mảnh ghép số ${question.qNum}`}
                  className="w-full h-full object-cover animate-reveal-piece"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-xs text-[#fef08a] px-3 py-1 rounded-full text-xs font-bold border border-amber-400/50 flex items-center gap-1.5 shadow">
                  <span>🧩</span>
                  <span>Mảnh ghép #{question.qNum}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#f2ece4] px-5 sm:px-7 py-3 sm:py-3.5 border-t border-[#e5dfd5] flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-gray-500 font-medium">
            {!isAnswerChecked
              ? selectedOptId
                ? `Đã chọn đáp án ${selectedOptId}`
                : "Vui lòng chọn 1 đáp án"
              : !isPieceRevealed
              ? isCorrect
                ? "Trả lời chính xác!"
                : "Trả lời chưa chính xác!"
              : `Đã mở Mảnh ghép số #${question.qNum}`}
          </div>

          {!isAnswerChecked ? (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-600 hover:bg-black/5 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={!selectedOptId}
                onClick={handleCheckAnswer}
                className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer ${
                  selectedOptId
                    ? "bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] text-white shadow-lg hover:scale-105 active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Xác Nhận Đáp Án
              </button>
            </div>
          ) : !isPieceRevealed ? (
            <button
              type="button"
              onClick={handleOpenPiece}
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] text-white shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Xem Mảnh Ghép Số {question.qNum}</span>
              <span>➜</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleProceedAndClose}
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] text-white shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Đóng &amp; Trao Mảnh Ghép Số {question.qNum}</span>
              <span>➜</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
