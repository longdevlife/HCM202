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
  const [score, setScore] = useState(0);
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
      // 75% chance to hit an unanswered question
      const pickQuestion = Math.random() < 0.75 || answeredCount === 0;

      if (pickQuestion) {
        const randomUnansweredQ =
          unansweredQuestions[Math.floor(Math.random() * unansweredQuestions.length)];
        const sliceIdx = WHEEL_SLICES.findIndex(
          (s) => s.type === "question" && s.questionId === randomUnansweredQ.id
        );
        targetIdx = sliceIdx !== -1 ? sliceIdx : Math.floor(Math.random() * WHEEL_SLICES.length);
      } else {
        const bonusIndices = WHEEL_SLICES.map((s, i) => (s.type !== "question" ? i : null)).filter(
          (i) => i !== null
        );
        targetIdx =
          bonusIndices.length > 0
            ? bonusIndices[Math.floor(Math.random() * bonusIndices.length)]
            : Math.floor(Math.random() * WHEEL_SLICES.length);
      }
    } else {
      targetIdx = Math.floor(Math.random() * WHEEL_SLICES.length);
    }

    setIsSpinning(true);
    setSpinsCount((c) => c + 1);

    // Trigger wheel spin directly via ref
    if (wheelRef.current) {
      wheelRef.current.spin(targetIdx);
    }
  };

  // When spin finishes
  const handleSpinEnd = (slice) => {
    setIsSpinning(false);

    if (slice.type === "question") {
      const q = questions.find((item) => item.id === slice.questionId);
      if (q) {
        setActiveQuestion(q);
        setIsQuestionModalOpen(true);
      }
    } else if (slice.type === "bonus") {
      const pts = slice.points || 100;
      setScore((s) => s + pts);
      showToast(`🎁 Tuyệt vời! Bạn quay trúng ô ${slice.label} (+${pts} điểm)!`);
    } else if (slice.type === "multiplier") {
      setScore((s) => (s === 0 ? 200 : s * 2));
      showToast(`⚡ Bùng nổ! Bạn quay trúng ô X2 NHÂN ĐÔI ĐIỂM SỐ!`);
    } else if (slice.type === "lucky" || slice.type === "star") {
      const pts = slice.points || 150;
      setScore((s) => s + pts);
      showToast(`⭐ Chúc mừng! Bạn nhận được ${slice.label} (+${pts} điểm)!`);
    }
  };

  // Direct question click
  const handleDirectQuestionClick = (q) => {
    if (isSpinning) return;
    setActiveQuestion(q);
    setIsQuestionModalOpen(true);
  };

  // When user answers in modal
  const handleAnswerSubmit = (qId, isCorrect, chosenOpt) => {
    const q = questions.find((item) => item.id === qId);
    const pts = isCorrect ? (q?.points || 100) : 20;

    setAnsweredQuestions((prev) => {
      const updated = {
        ...prev,
        [qId]: { isCorrect, pointsEarned: pts, chosenOptId: chosenOpt?.id },
      };

      const newCount = Object.keys(updated).length;
      if (newCount >= totalQuestions) {
        sounds.playFanfare();
        showToast("🎉 XUẤT SẮC! ĐÃ GIẢI MÃ TOÀN BỘ TỰA ĐỀ BÀI HỌC!");
      }
      return updated;
    });

    setScore((s) => s + pts);
  };

  // Restart the game
  const handleRestart = () => {
    setAnsweredQuestions({});
    setScore(0);
    setSpinsCount(0);
    setIsSpinning(false);
    showToast("🔄 Đã làm mới trò chơi Chiếc Nón Kỳ Diệu!");
  };

  return (
    <div className="chiecnon-game-container min-h-screen bg-[#ede8e1] text-[#2c1a0e] pt-24 pb-16 px-4 md:px-8 relative overflow-hidden">
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

      <div className="max-w-6xl mx-auto">
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
          <p className="text-xs md:text-sm text-[#6b584a] max-w-xl mx-auto mt-1 font-medium">
            Quay nón dính câu nào câu hỏi sẽ hiện ra. Trả lời hết 5 câu ghép thành tựa đề bài học, bấm cuối cùng để xem <strong>KẾT NỘI DUNG BÀI HỌC</strong>!
          </p>

          {/* Clean Top Status Pills */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="bg-white/80 px-3.5 py-1.5 rounded-full border border-[#e5dfd5] text-xs font-bold text-[#2c1a0e] shadow-sm flex items-center gap-1.5">
              <span>🏆 Điểm:</span>
              <span className="text-[#c9922a] font-black">{score}</span>
            </div>
            <div className="bg-white/80 px-3.5 py-1.5 rounded-full border border-[#e5dfd5] text-xs font-bold text-[#2c1a0e] shadow-sm flex items-center gap-1.5">
              <span>🧩 Tiến độ:</span>
              <span className="font-black text-emerald-700">{answeredCount}/5 câu</span>
            </div>
            <button
              type="button"
              onClick={handleToggleMute}
              className="bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-[#e5dfd5] text-xs font-bold text-[#4a3e35] shadow-sm transition-all"
            >
              {isMuted ? "🔇 Tắt âm" : "🔊 Âm thanh"}
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-[#e5dfd5] text-xs font-bold text-[#991b1b] shadow-sm transition-all"
            >
              🔄 Chơi lại
            </button>
          </div>
        </div>

        {/* Main Stage: Left = Wheel & Spin Button; Right = 5 Questions & Grand Conclusion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Wheel Stage (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="wheel-stage-card p-4 md:p-6 bg-gradient-to-b from-[#faf8f5] to-[#f4eee6] rounded-3xl shadow-xl border-2 border-[#c9922a]/30 relative flex flex-col items-center w-full max-w-[540px]">
              {/* Wheel Canvas (Click on wheel also spins) */}
              <div onClick={handleSpinClick} title="Bấm vào đây để quay nón!">
                <WheelCanvas
                  ref={wheelRef}
                  slices={WHEEL_SLICES}
                  answeredQuestions={answeredQuestions}
                  onSpinStart={() => setIsSpinning(true)}
                  onSpinEnd={handleSpinEnd}
                />
              </div>

              {/* Spin Button */}
              <div className="mt-6 flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={handleSpinClick}
                  className={`px-10 py-3.5 rounded-full font-black text-base md:text-lg uppercase tracking-wider shadow-xl transition-all duration-200 cursor-pointer ${
                    isSpinning
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed scale-95"
                      : "bg-gradient-to-r from-[#d97706] via-[#c9922a] to-[#b45309] hover:from-[#b45309] hover:to-[#92400e] text-white hover:scale-105 active:scale-95 ring-4 ring-[#fde68a]/50"
                  }`}
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {isSpinning ? "Đang Quay Nón..." : "🎡 BẤM ĐỂ QUAY NÓN 🎡"}
                </button>
                <div className="text-[11px] text-[#786c5e]">
                  {isSpinning ? "Đang quay..." : `Đã quay: ${spinsCount} lượt (Bấm nút hoặc bấm vào nón)`}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 5 Questions Checklist & Conclusion Button (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Checklist */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#e5dfd5]">
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="text-base md:text-lg font-bold text-[#2c1a0e]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  5 Câu Đố Ghép Tựa Đề Bài Học
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#c9922a]/15 text-[#855318]">
                  {answeredCount}/5 câu
                </span>
              </div>
              <p className="text-xs text-[#786c5e] mb-3">
                Xoay dính câu nào câu hỏi sẽ hiện ra (hoặc bấm trực tiếp vào thẻ câu hỏi):
              </p>

              {/* 5 Questions Items */}
              <div className="space-y-2">
                {questions.map((q) => {
                  const state = answeredQuestions[q.id];
                  const isDone = Boolean(state);

                  return (
                    <div
                      key={q.id}
                      onClick={() => handleDirectQuestionClick(q)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isDone
                          ? "bg-[#f0fdf4] border-[#86efac] text-[#166534]"
                          : "bg-[#faf8f5] border-[#e5dfd5] hover:border-[#c9922a] hover:bg-[#fffdf9]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                            isDone
                              ? "bg-[#10b981] text-white"
                              : "bg-[#2c1a0e]/10 text-[#2c1a0e]"
                          }`}
                        >
                          {isDone ? "✓" : q.num}
                        </span>
                        <div className="truncate">
                          <div className="text-xs font-bold truncate text-[#2c1a0e]">
                            {q.title}
                          </div>
                          <div className="text-[11px] text-[#786c5e] truncate">
                            {isDone ? (
                              <span className="text-emerald-700 font-black">
                                Mảnh ghép: "{q.secretWord}"
                              </span>
                            ) : (
                              `Thể loại: ${q.typeTag}`
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isDone ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Đã giải ✓
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-[#c9922a] hover:underline">
                            Mở →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Assembled Title Status */}
              <div className="mt-4 pt-3 border-t border-[#e5dfd5]">
                <div className="text-[10px] uppercase font-bold text-[#786c5e] mb-1 tracking-wider">
                  TỰA ĐỀ BÀI HỌC GHÉP ĐƯỢC:
                </div>
                <div
                  className={`text-xs md:text-sm font-bold leading-snug p-2.5 rounded-xl border ${
                    allAnswered
                      ? "bg-amber-50 border-amber-300 text-amber-950 font-black animate-pulse"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  👉 "{FULL_LESSON_TITLE}"
                </div>
              </div>
            </div>

            {/* THE CONCLUSION BUTTON: "bấm cuối cùng khi trẢ LỜI HẾT KẾT NỘI DUNG BÀI HC" */}
            <div
              className={`p-5 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden ${
                allAnswered
                  ? "bg-gradient-to-r from-[#2c1a0e] via-[#452814] to-[#2c1a0e] border-[#c9922a] shadow-xl ring-4 ring-[#c9922a]/40"
                  : "bg-white border-[#e5dfd5] shadow-sm"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-2xl">{allAnswered ? "🎉" : "🔒"}</span>
                <div>
                  <h4
                    className={`font-black text-sm md:text-base ${
                      allAnswered ? "text-[#fef08a]" : "text-[#2c1a0e]"
                    }`}
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    KẾT NỘI DUNG BÀI HỌC
                  </h4>
                  <div
                    className={`text-[11px] ${
                      allAnswered ? "text-amber-100" : "text-[#786c5e]"
                    }`}
                  >
                    {allAnswered
                      ? "Đã trả lời hết cả 5 câu! Bấm nút bên dưới để xem toàn bộ kết luận bài học."
                      : `Cần trả lời đủ 5 câu để mở khóa (Hiện tại: ${answeredCount}/5 câu).`}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setIsSummaryModalOpen(true)}
                className={`w-full mt-3 py-3 px-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all duration-200 ${
                  allAnswered
                    ? "bg-gradient-to-r from-[#f59e0b] via-[#c9922a] to-[#d97706] hover:brightness-110 text-white animate-pulse scale-[1.02] active:scale-95 cursor-pointer shadow-amber-900/50"
                    : "bg-[#2c1a0e]/10 hover:bg-[#2c1a0e]/20 text-[#2c1a0e] cursor-pointer"
                }`}
              >
                <span>📜</span>
                <span>
                  {allAnswered
                    ? "BẤM XEM KẾT NỘI DUNG BÀI HỌC"
                    : "Xem Trước Kết Nội Dung Bài Học"}
                </span>
              </button>
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
      />

      {/* Grand Lesson Summary Modal */}
      <LessonSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onRestart={handleRestart}
        score={score}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
      />
    </div>
  );
}
