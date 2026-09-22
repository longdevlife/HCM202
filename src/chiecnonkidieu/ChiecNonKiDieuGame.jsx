import React, { useState, useRef, useCallback } from "react";
import WheelCanvas from "./WheelCanvas";
import QuestionModal from "./QuestionModal";
import LessonSummaryModal from "./LessonSummaryModal";
import { DEFAULT_QUESTIONS, WHEEL_SLICES, FULL_LESSON_TITLE } from "./wheelData";
import { sounds } from "./SoundEffects";
import "./chiecnonkidieu.css";

export default function ChiecNonKiDieuGame() {
  const wheelRef = useRef(null);

  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [spinsCount, setSpinsCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answeredQuestions).length;
  const allAnswered = answeredCount >= totalQuestions;

  // Toggle audio mute
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
  };

  // Show temporary toast message
  const showToast = useCallback((msg, durationMs = 3000) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, durationMs);
  }, []);

  // Spin the wheel
  const handleSpinClick = () => {
    if (isSpinning) return;

    // Pick target slice prioritizing unanswered questions
    const unansweredQuestions = questions.filter((q) => !answeredQuestions[q.id]);

    let targetIdx;
    if (unansweredQuestions.length > 0) {
      const randomUnansweredQ =
        unansweredQuestions[Math.floor(Math.random() * unansweredQuestions.length)];
      const sliceIdx = WHEEL_SLICES.findIndex(
        (s) => s.type === "question" && s.questionId === randomUnansweredQ.id
      );
      targetIdx = sliceIdx !== -1 ? sliceIdx : Math.floor(Math.random() * WHEEL_SLICES.length);
    } else {
      targetIdx = Math.floor(Math.random() * WHEEL_SLICES.length);
    }

    setIsSpinning(true);
    setSpinsCount((c) => c + 1);

    if (wheelRef.current) {
      wheelRef.current.spin(targetIdx);
    }
  };

  // When spin finishes
  const handleSpinEnd = (slice) => {
    setIsSpinning(false);

    if (slice?.type === "question") {
      const q = questions.find((item) => item.id === slice.questionId);
      if (q) {
        setActiveQuestion(q);
        setIsQuestionModalOpen(true);
      }
    }
  };

  // Directly click on a slice on the wheel to view/answer that question
  const handleSliceClick = (slice) => {
    if (isSpinning) return;
    if (slice?.type === "question") {
      const q = questions.find((item) => item.id === slice.questionId);
      if (q) {
        setActiveQuestion(q);
        setIsQuestionModalOpen(true);
      }
    }
  };

  // When user answers in modal
  const handleAnswerSubmit = (qId, isCorrect, chosenOpt) => {
    setAnsweredQuestions((prev) => {
      const updated = {
        ...prev,
        [qId]: { isCorrect, chosenOptId: chosenOpt?.id },
      };

      const newCount = Object.keys(updated).length;
      if (newCount >= totalQuestions) {
        sounds.playFanfare();
        showToast("🎉 XUẤT SẮC! BẠN ĐÃ TRẢ LỜI ĐỦ 5 CÂU VÀ MỞ KHÓA TỰA ĐỀ!");
      }
      return updated;
    });
  };

  // Restart the game
  const handleRestart = () => {
    setAnsweredQuestions({});
    setSpinsCount(0);
    setIsSpinning(false);
    showToast("🔄 Đã làm mới trò chơi Chiếc Nón Kỳ Diệu!");
  };

  return (
    <div className="chiecnon-game-container min-h-screen bg-[#ede8e1] text-[#2c1a0e] pt-24 pb-16 px-4 md:px-8 relative overflow-hidden flex flex-col justify-center items-center">
      {/* Background Decorative Glow */}
      <div className="absolute top-12 -left-20 w-96 h-96 rounded-full bg-[#c9922a]/10 filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full bg-[#b91c1c]/10 filter blur-3xl pointer-events-none"></div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#2c1a0e] text-[#fef08a] px-6 py-3 rounded-full shadow-2xl border border-[#c9922a] flex items-center gap-2 font-bold text-sm md:text-base animate-bounce">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto w-full flex flex-col items-center">
        {/* Simple, Compact Game Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9922a]/20 border border-[#c9922a] text-[#855318] text-xs font-bold uppercase tracking-widest mb-2">
            <span>🎡</span>
            <span>Chiếc Nón Kỳ Diệu · MLN131</span>
          </div>
          <h1
            className="text-2xl md:text-4xl font-black text-[#2c1a0e] tracking-tight uppercase"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Vòng Quay Chiếc Nón Kỳ Diệu
          </h1>
          <p className="text-xs md:text-sm text-[#6b584a] max-w-lg mx-auto mt-1 font-medium">
            Quay nón dính câu nào câu hỏi sẽ hiện ra. Trả lời đúng các câu đố để kết nội dung bài học!
          </p>

          {/* Clean Top Status Bar */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="bg-white/80 px-4 py-1.5 rounded-full border border-[#e5dfd5] text-xs font-bold text-[#2c1a0e] shadow-sm flex items-center gap-1.5">
              <span>🧩 Tiến độ:</span>
              <span className="font-black text-emerald-700">{answeredCount}/5</span>
            </div>
            <button
              type="button"
              onClick={handleToggleMute}
              className="bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-full border border-[#e5dfd5] text-xs font-bold text-[#4a3e35] shadow-sm transition-all"
            >
              {isMuted ? "🔇 Tắt âm" : "🔊 Âm thanh"}
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-full border border-[#e5dfd5] text-xs font-bold text-[#991b1b] shadow-sm transition-all"
            >
              🔄 Chơi lại
            </button>
          </div>
        </div>

        {/* Center Stage: The Wheel is the Pure Centered Focus */}
        <div className="flex flex-col items-center justify-center w-full">
          <div className="wheel-stage-card p-6 md:p-10 bg-gradient-to-b from-[#faf8f5] to-[#f4eee6] rounded-3xl shadow-2xl border-2 border-[#c9922a]/30 relative flex flex-col items-center w-full max-w-[760px] mx-auto">
            {/* Wheel Canvas (Click directly on any slice to view question, click center or button to spin) */}
            <div className="flex justify-center items-center">
              <WheelCanvas
                ref={wheelRef}
                slices={WHEEL_SLICES}
                answeredQuestions={answeredQuestions}
                onSpinStart={() => setIsSpinning(true)}
                onSpinEnd={handleSpinEnd}
                onSliceClick={handleSliceClick}
                onCenterClick={handleSpinClick}
              />
            </div>

            {/* Actions Area Under the Wheel */}
            <div className="mt-8 flex flex-col items-center w-full max-w-lg gap-3">
              {/* Spin Button */}
              <button
                type="button"
                disabled={isSpinning}
                onClick={handleSpinClick}
                className={`w-full py-4 md:py-5 rounded-full font-black text-lg md:text-2xl uppercase tracking-wider shadow-2xl transition-all duration-200 cursor-pointer ${
                  isSpinning
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed scale-95"
                    : "bg-gradient-to-r from-[#d97706] via-[#c9922a] to-[#b45309] hover:from-[#b45309] hover:to-[#92400e] text-white hover:scale-105 active:scale-95 ring-4 ring-[#fde68a]/50"
                }`}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {isSpinning ? "Đang Quay Nón..." : "🎡 BẤM ĐỂ QUAY NÓN 🎡"}
              </button>

              <div className="text-xs md:text-sm font-medium text-[#786c5e] text-center">
                {isSpinning
                  ? "Hồi hộp chờ nón dừng lại..."
                  : "💡 Bấm trực tiếp vào các ô trên nón để xem câu hỏi, hoặc bấm nút để quay!"}
              </div>

              {/* WHEN ALL 5 QUESTIONS ARE ANSWERED: GRAND CONCLUSION BUTTON REVEALS HERE! */}
              {allAnswered && (
                <div className="w-full mt-3 p-5 md:p-6 rounded-2xl bg-gradient-to-r from-[#2c1a0e] via-[#452814] to-[#2c1a0e] border-2 border-[#c9922a] shadow-2xl animate-fade-in text-center flex flex-col items-center gap-3">
                  <div className="text-xs uppercase tracking-widest text-[#fef08a] font-bold">
                    🎉 ĐÃ HOÀN THÀNH TẤT CẢ CÂU ĐỐ
                  </div>

                  {/* Assembled Title */}
                  <div
                    className="text-base md:text-lg font-bold text-white leading-snug px-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    👉 "{FULL_LESSON_TITLE}"
                  </div>

                  {/* The Grand Conclusion Button */}
                  <button
                    type="button"
                    onClick={() => setIsSummaryModalOpen(true)}
                    className="w-full mt-2 py-4 px-6 rounded-xl font-black text-base md:text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl bg-gradient-to-r from-[#f59e0b] via-[#c9922a] to-[#d97706] hover:brightness-110 text-white animate-pulse scale-[1.02] active:scale-95 cursor-pointer shadow-amber-900/50"
                  >
                    <span>📜</span>
                    <span>BẤM XEM KẾT NỘI DUNG BÀI HỌC</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Modal */}
      <QuestionModal
        question={activeQuestion}
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onAnswerSubmit={handleAnswerSubmit}
        allAnswered={allAnswered}
        onOpenSummary={() => setIsSummaryModalOpen(true)}
        isAlreadyAnswered={Boolean(activeQuestion && answeredQuestions[activeQuestion.id])}
      />

      {/* Grand Lesson Summary Modal */}
      <LessonSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onRestart={handleRestart}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
      />
    </div>
  );
}
