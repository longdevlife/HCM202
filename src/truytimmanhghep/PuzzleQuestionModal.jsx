import React, { useState, useEffect, useRef } from "react";
import { sounds } from "../chiecnonkidieu/SoundEffects";

export default function PuzzleQuestionModal({
  question,
  isOpen,
  onClose,
  onFinishQuestion,
}) {
  const [selectedOptId, setSelectedOptId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const modalBodyRef = useRef(null);

  useEffect(() => {
    if (question && isOpen) {
      setSelectedOptId(null);
      setIsSubmitted(false);
      setIsCorrect(false);
      if (modalBodyRef.current) {
        modalBodyRef.current.scrollTop = 0;
      }
    }
  }, [question, isOpen]);

  // When switching to submitted stage (piece revealed), ensure scroll is reset to top
  useEffect(() => {
    if (isSubmitted && modalBodyRef.current) {
      modalBodyRef.current.scrollTop = 0;
    }
  }, [isSubmitted]);

  if (!isOpen || !question) return null;

  const handleSelectOption = (optId) => {
    if (isSubmitted) return;
    setSelectedOptId(optId);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOptId || isSubmitted) return;

    const chosen = question.options.find((o) => o.id === selectedOptId);
    const correct = Boolean(chosen?.isCorrect);

    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }
  };

  // When host closes the modal after viewing the piece:
  // "r khi tôi tắt modal thì ko hiện lên đc nữa vì tôi sẽ phát mảnh ở ngoài"
  const handleProceedAndClose = () => {
    if (!isSubmitted) {
      onClose();
      return;
    }
    onFinishQuestion(question.qNum, isCorrect);
  };

  const getLevelColor = (lvl) => {
    if (lvl.includes("Nhận biết")) return "bg-blue-100 text-blue-900 border-blue-300";
    if (lvl.includes("Thông hiểu")) return "bg-amber-100 text-amber-900 border-amber-300";
    return "bg-purple-100 text-purple-900 border-purple-300";
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* 
        MODAL KÍCH THƯỚC CHUẨN 75% MÀN HÌNH:
        Width: 75vw (75% chiều rộng màn hình)
        Height: tối ưu từ min-h-[70vh] đến max-h-[92vh]
        Bố cục được căn chỉnh để HIỆN ĐẦY ĐỦ 100% CÂU HỎI VÀ TẤT CẢ CÁC ĐÁP ÁN không bị khuất!
      */}
      <div
        style={{ width: "75vw", maxHeight: "92vh" }}
        className="relative w-[95vw] md:w-[75vw] max-w-[75vw] bg-[#faf7f2] text-[#2c1a0e] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] border-2 sm:border-4 border-[#c9922a] overflow-hidden flex flex-col my-auto"
      >
        {/* Modal Top Header (Cố định ở đỉnh) */}
        <div className="bg-gradient-to-r from-[#2c1a0e] via-[#4a2e18] to-[#2c1a0e] text-white px-5 sm:px-7 py-3 sm:py-3.5 flex items-center justify-between border-b-2 border-[#c9922a]/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#b45309] to-[#fde68a] text-[#1c0d05] font-black flex items-center justify-center text-lg sm:text-xl shadow-md border border-[#fef08a]">
              {question.qNum}
            </div>
            <div>
              <div className="text-[11px] sm:text-xs tracking-widest uppercase text-[#fef08a] font-bold">
                {isSubmitted
                  ? `KẾT QUẢ CÂU HỎI SỐ ${question.qNum}`
                  : `CÂU HỎI SỐ ${question.qNum} · ${question.level}`}
              </div>
              <div
                className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {isSubmitted
                  ? `Mảnh ghép nhận được: Mảnh số ${question.qNum}`
                  : `Chủ đề: ${question.tag}`}
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

        {/* Modal Body: Hiển thị đầy đủ, không bị che khuất */}
        <div
          ref={modalBodyRef}
          className="p-4 sm:p-6 md:p-7 overflow-y-auto space-y-4 flex-1"
        >
          {!isSubmitted ? (
            /* ================= GIAI ĐOẠN 1: HIỆN ĐỦ 100% CÂU HỎI & CÁC LỰA CHỌN ================= */
            <div className="space-y-4">
              {/* Question Text Box */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#e5dfd5] shadow-xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getLevelColor(
                      question.level
                    )}`}
                  >
                    {question.level}
                  </span>
                  <span className="text-xs text-gray-500 font-semibold">
                    Mảnh ghép tương ứng: Số {question.qNum}
                  </span>
                </div>

                <h3
                  className="text-base sm:text-xl md:text-2xl font-bold text-[#2c1a0e] leading-relaxed whitespace-pre-line"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {question.question}
                </h3>
              </div>

              {/* 4 Options Grid: Thiết kế gọn gàng, chữ to rõ ràng và không bị tràn */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#e5dfd5] shadow-xs space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Chọn một đáp án đúng nhất:
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {question.options.map((opt) => {
                    const isChosen = selectedOptId === opt.id;
                    const cardClass = `relative flex items-center gap-3.5 p-3 sm:p-3.5 md:p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      isChosen
                        ? "bg-[#fff9ea] border-[#c9922a] ring-2 ring-[#c9922a]/50 shadow-sm scale-[1.008]"
                        : "bg-white border-[#e5dfd5] hover:border-[#c9922a]/70 hover:bg-[#faf6ee]"
                    }`;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.id)}
                        className={cardClass}
                      >
                        <span
                          className={`w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 rounded-lg font-black text-sm sm:text-base flex items-center justify-center transition-colors ${
                            isChosen
                              ? "bg-[#c9922a] text-white shadow"
                              : "bg-[#2c1a0e]/10 text-[#2c1a0e]"
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="flex-1 text-sm sm:text-base md:text-lg font-medium leading-snug">
                          {opt.text}
                        </span>
                        {isChosen && (
                          <span className="text-[#c9922a] font-bold text-xs uppercase ml-1 flex-shrink-0">
                            Đã chọn
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ================= GIAI ĐOẠN 2: ẨN TOÀN BỘ CÂU HỎI VÀ HIỆN MẢNH GHÉP TƯƠNG ỨNG ================= */
            /* "sau khi trả lời ẩn toàn bộ nội dung câu hỏi và hiện là mảnh ghép tương ứng vào trong đó luôn" */
            <div className="space-y-4 animate-fade-in">
              {/* Result Status Banner */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between shadow-xs ${
                  isCorrect
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : "bg-amber-50 border-amber-300 text-amber-950"
                }`}
              >
                <div className="flex items-center gap-2.5 font-black text-sm sm:text-lg">
                  <span className="text-xl sm:text-2xl">{isCorrect ? "🎯" : "💡"}</span>
                  <span>
                    {isCorrect
                      ? "CHÍNH XÁC! Bạn đã trả lời đúng."
                      : `CHƯA CHÍNH XÁC! Đáp án đúng là: ${question.correctId}`}
                  </span>
                </div>
                <div className="px-3.5 py-1 bg-white rounded-full border border-current text-xs sm:text-sm font-black uppercase tracking-wider shadow-xs">
                  Đáp án: {question.correctId}
                </div>
              </div>

              {/* PIECE IMAGE CARD - Hiển thị mảnh ghép tương ứng to, chiếm trọng tâm */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 sm:border-3 border-[#c9922a] shadow-lg flex flex-col items-center space-y-3">
                <div className="w-full flex items-center justify-between pb-2 border-b border-[#e5dfd5]">
                  <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-[#b45309]">
                    <span className="text-base sm:text-lg">🧩</span>
                    <span>MẢNH GHÉP SỐ {question.qNum}</span>
                  </div>
                
                </div>

                {/* Sliced Piece Image */}
                <div className="relative w-full max-w-lg aspect-[3/2] rounded-xl overflow-hidden shadow-md border-2 border-amber-400 bg-black flex items-center justify-center">
                  <img
                    src={question.pieceImage}
                    alt={`Mảnh ghép số ${question.qNum}`}
                    className="w-full h-full object-cover animate-reveal-piece"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-xs text-[#fef08a] px-3 py-1 rounded-full text-xs font-black border border-amber-400/50 flex items-center gap-1.5 shadow">
                    <span>✨</span>
                    <span>Mảnh ghép #{question.qNum}</span>
                  </div>
                </div>

                {/* Host instruction to hand out physical piece */}
           
              </div>

              {/* Academic Takeaway / Explanation */}
              <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-[#e5dfd5] shadow-xs space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-[#92400e] flex items-center gap-1.5">
                  <span className="text-sm">📖</span>
                  <span>Ghi nhớ trọng tâm bài học:</span>
                </div>
                <p className="text-xs sm:text-sm text-[#4a3e35] leading-relaxed text-justify font-medium">
                  {question.explanation}
                </p>
              </div>

              {/* Note about closing */}
            
            </div>
          )}
        </div>

        {/* Modal Footer (Cố định ở đáy, nút Xác Nhận luôn luôn nhìn thấy) */}
        <div className="bg-[#f2ece4] px-5 sm:px-7 py-3 sm:py-3.5 border-t border-[#e5dfd5] flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-gray-500 font-medium">
            {!isSubmitted
              ? selectedOptId
                ? `Đã chọn đáp án ${selectedOptId}`
                : "Vui lòng chọn 1 đáp án"
              : `Đã mở Mảnh ghép số #${question.qNum}`}
          </div>

          {!isSubmitted ? (
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
                onClick={handleConfirmAnswer}
                className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer ${
                  selectedOptId
                    ? "bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] text-white shadow-lg hover:scale-105 active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Xác Nhận Đáp Án
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleProceedAndClose}
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] text-white shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Đóng &amp; Trao Mảnh Ghép</span>
              <span>➜</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
