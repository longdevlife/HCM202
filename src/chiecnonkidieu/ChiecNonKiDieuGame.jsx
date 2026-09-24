import React, { useState, useRef, useCallback, useEffect } from "react";
import WheelCanvas from "./WheelCanvas";
import QuestionModal from "./QuestionModal";
import VictoryModal from "./VictoryModal";
import { DEFAULT_QUESTIONS, WHEEL_SLICES, FULL_LESSON_TITLE, VICTORY_TITLE } from "./wheelData";
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
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
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

  // Handle clicking directly on a sector of the 3D conical hat
  useEffect(() => {
    window.__openQuestion = (id) => {
      const q = questions.find((item) => item.id === id);
      if (q) {
        setActiveQuestion(q);
        setIsQuestionModalOpen(true);
      }
    };
    return () => {
      delete window.__openQuestion;
    };
  }, [questions]);

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
    setIsVictoryModalOpen(false);
    showToast("🔄 Đã làm mới trò chơi Chiếc Nón Kỳ Diệu!");
  };

  return (
    <div className="chiecnon-game-container min-h-screen text-[#eee2ca] pt-24 pb-16 px-4 md:px-8 relative overflow-hidden flex flex-col justify-center items-center">
      {/* Texture grain overlay matching book library */}
      <div className="chiecnon-grain"></div>

      {/* Background Decorative Glow */}
      <div className="absolute top-12 -left-20 w-96 h-96 rounded-full bg-[#c3a47b]/15 filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full bg-[#a96346]/12 filter blur-3xl pointer-events-none"></div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1d1a15] text-[#fef08a] px-6 py-3 rounded-full shadow-2xl border border-[#c3a47b] flex items-center gap-2 font-bold text-sm md:text-base animate-bounce">
          <span>🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto w-full flex flex-col items-center relative z-10">
        {/* Simple, Compact Game Header */}
        <div className="text-center mb-6">
          <h1
            className="text-2xl md:text-4xl font-black text-[#eee2ca] tracking-tight uppercase"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Vòng Quay Chiếc Nón Kỳ Diệu
          </h1>

          {/* Clean Top Status Bar */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="bg-[#3a382b]/80 px-4 py-1.5 rounded-full border border-[#c3a47b]/30 text-xs font-bold text-[#eee2ca] shadow-sm flex items-center gap-1.5">
              <span>🧩 Tiến độ:</span>
              <span className="font-black text-emerald-400">{answeredCount}/5</span>
            </div>
            <button
              type="button"
              onClick={handleToggleMute}
              className="bg-[#3a382b]/80 hover:bg-[#4a4738] px-3.5 py-1.5 rounded-full border border-[#c3a47b]/30 text-xs font-bold text-[#eee2ca] shadow-sm transition-all cursor-pointer"
            >
              {isMuted ? "🔇 Tắt âm" : "🔊 Âm thanh"}
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="bg-[#3a382b]/80 hover:bg-[#4a4738] px-3.5 py-1.5 rounded-full border border-[#a96346]/50 text-xs font-bold text-[#fca5a5] shadow-sm transition-all cursor-pointer"
            >
              🔄 Chơi lại
            </button>
          </div>
        </div>

        {/* Center Stage: The Wheel is the Pure Centered Focus */}
        <div className="flex flex-col items-center justify-center w-full">
          <div className="wheel-stage-card p-6 md:p-10 rounded-3xl relative flex flex-col items-center w-full max-w-[760px] mx-auto">
            {/* 3D Conical Hat Canvas */}
            <div className="flex justify-center items-center w-full">
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

            {/* Actions Area Under the 3D Hat */}
            <div className="mt-5 flex flex-col items-center w-full max-w-lg gap-3">
              {/* Prominent Spin Button */}
              <button
                type="button"
                disabled={isSpinning}
                onClick={handleSpinClick}
                className={`w-full max-w-xs py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all cursor-pointer ${
                  isSpinning
                    ? "bg-slate-700/80 text-slate-400 opacity-70 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#f59e0b] hover:brightness-110 text-white active:scale-95 shadow-lg shadow-[#d97706]/30 border border-[#fef08a]/40 animate-pulse-glow"
                }`}
              >
                <span className={isSpinning ? "animate-spin text-base" : "text-base"}>🎡</span>
                <span>{isSpinning ? "NÓN 3D ĐANG QUAY..." : "QUAY CHIẾC NÓN 3D"}</span>
              </button>

              <div className="text-xs md:text-sm font-medium text-[#c5b79e] text-center px-4">
                💡 Bạn có thể <b>kéo chuột để ngắm nón 3D</b>, bấm trực tiếp vào từng ô để trả lời hoặc bấm nút <b>Quay</b>!
              </div>

              {/* WHEN ALL 5 QUESTIONS ARE ANSWERED: GRAND CELEBRATION & LESSON SUMMARY */}
              {allAnswered && (
                <div className="w-full mt-3 p-5 md:p-6 rounded-2xl bg-gradient-to-r from-[#2c1a0e] via-[#452814] to-[#2c1a0e] border-2 border-[#f59e0b] shadow-2xl animate-fade-in text-center flex flex-col items-center gap-3">
                  <div className="text-xs uppercase tracking-widest text-[#fef08a] font-bold">
                    🎉 ĐÃ HOÀN THÀNH TẤT CẢ 5 CÂU ĐỐ
                  </div>

                  {/* Assembled Victory Title */}
                  <div
                    className="text-base md:text-xl font-black uppercase text-[#fef08a] leading-snug px-2 drop-shadow-sm"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {VICTORY_TITLE}
                  </div>

                  {/* Action: View Celebration Screen */}
                  <div className="w-full max-w-sm mt-2">
                    <button
                      type="button"
                      onClick={() => setIsVictoryModalOpen(true)}
                      className="w-full py-3.5 px-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-[#d97706] to-[#b45309] hover:brightness-110 text-white cursor-pointer active:scale-95 transition-all"
                    >
                      <span>🎉</span>
                      <span>XEM MÀN CHÚC MỪNG</span>
                    </button>
                  </div>
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
        onOpenVictory={() => {
          setIsQuestionModalOpen(false);
          setIsVictoryModalOpen(true);
        }}
        isAlreadyAnswered={Boolean(activeQuestion && answeredQuestions[activeQuestion.id])}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={isVictoryModalOpen}
        onClose={() => setIsVictoryModalOpen(false)}
        onRestart={handleRestart}
      />
    </div>
  );
}
