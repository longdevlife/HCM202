import React, { useState, useCallback } from "react";
import WheelCanvas from "./WheelCanvas";
import QuestionModal from "./QuestionModal";
import LessonSummaryModal from "./LessonSummaryModal";
import { DEFAULT_QUESTIONS, WHEEL_SLICES, FULL_LESSON_TITLE } from "./wheelData";
import { sounds } from "./SoundEffects";
import "./chiecnonkidieu.css";

export default function ChiecNonKiDieuGame() {
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [score, setScore] = useState(0);
  const [spinsCount, setSpinsCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetSliceIndex, setTargetSliceIndex] = useState(null);

  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Editor modal state for customizing questions
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestions, setEditingQuestions] = useState(DEFAULT_QUESTIONS);

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

    // Prioritize slices for unanswered questions
    const unansweredQuestions = questions.filter((q) => !answeredQuestions[q.id]);

    let targetIdx;
    if (unansweredQuestions.length > 0) {
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

    setTargetSliceIndex(targetIdx);
    setIsSpinning(true);
    setSpinsCount((c) => c + 1);
  };

  // When spin finishes
  const handleSpinEnd = (slice) => {
    setIsSpinning(false);
    setTargetSliceIndex(null);

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
        showToast("🎉 XUẤT SẮC! TOÀN BỘ 5 MẢNH GHÉP TỰA ĐỀ ĐÃ ĐƯỢC GIẢI MÃ THÀNH CÔNG!");
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
    setTargetSliceIndex(null);
    showToast("🔄 Đã làm mới trò chơi Chiếc Nón Kỳ Diệu!");
  };

  // Save edited questions
  const handleSaveQuestions = () => {
    setQuestions(editingQuestions);
    setIsEditorOpen(false);
    showToast("✓ Đã cập nhật thành công bộ 5 câu hỏi!");
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

      <div className="max-w-7xl mx-auto">
        {/* Game Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c9922a]/20 border border-[#c9922a] text-[#855318] text-xs font-bold uppercase tracking-widest mb-3">
            <span>🎡</span>
            <span>Trò Chơi Chiếc Nón Kỳ Diệu · MLN131</span>
          </div>
          <h1
            className="text-3xl md:text-5xl font-black text-[#2c1a0e] tracking-tight uppercase"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Giải Mã Tựa Đề Bài Học
          </h1>
          <p className="text-sm md:text-base text-[#6b584a] max-w-2xl mx-auto mt-2 font-medium">
            Quay trúng câu nào câu hỏi sẽ hiện ra để giải mã từng mảnh ghép. Khi trả lời hết 5 câu ghép thành tựa đề bài học, bấm nút cuối cùng để xem <strong>KẾT NỘI DUNG BÀI HỌC</strong>!
          </p>

          {/* Quick HUD Toolbar */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-[#e5dfd5] flex items-center gap-2.5">
              <span className="text-lg">🏆</span>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-[#786c5e]">Điểm Số</div>
                <div className="text-base font-black text-[#c9922a]">{score}</div>
              </div>
            </div>

            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-[#e5dfd5] flex items-center gap-2.5">
              <span className="text-lg">🧩</span>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-[#786c5e]">Tiến Độ Tựa Đề</div>
                <div className="text-base font-black text-[#2c1a0e]">
                  {answeredCount} / {totalQuestions} Mảnh ghép
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleMute}
              className="bg-white hover:bg-[#faf6ee] px-4 py-2 rounded-2xl shadow-sm border border-[#e5dfd5] flex items-center gap-2 text-xs font-bold text-[#4a3e35] transition-all"
            >
              <span>{isMuted ? "🔇 Tắt âm" : "🔊 Bật âm"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditorOpen(true)}
              className="bg-white hover:bg-[#faf6ee] px-4 py-2 rounded-2xl shadow-sm border border-[#e5dfd5] flex items-center gap-2 text-xs font-bold text-[#4a3e35] transition-all"
            >
              <span>⚙️</span>
              <span>Tùy chỉnh câu hỏi</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="bg-white hover:bg-[#faf6ee] px-4 py-2 rounded-2xl shadow-sm border border-[#e5dfd5] flex items-center gap-2 text-xs font-bold text-[#991b1b] transition-all"
            >
              <span>🔄</span>
              <span>Chơi lại</span>
            </button>
          </div>
        </div>

        {/* INTERACTIVE TITLE PUZZLE BOARD (5 SECRET WORDS FLIP BOARD) */}
        <div className="mb-8 p-5 md:p-6 bg-gradient-to-r from-[#2c1a0e] via-[#3d2715] to-[#2c1a0e] rounded-3xl border-2 border-[#c9922a] shadow-xl text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 border-b border-[#c9922a]/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧩</span>
              <h2
                className="text-base md:text-lg font-bold text-[#fef08a] uppercase tracking-wider"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Bảng Giải Mã 5 Mảnh Ghép Tựa Đề Bài Học
              </h2>
            </div>
            <div className="text-xs text-[#e5dfd5]">
              {allAnswered
                ? "✨ Đã ghép hoàn chỉnh tựa đề bài học!"
                : `Còn thiếu ${totalQuestions - answeredCount} mảnh ghép để hoàn tất tựa đề`}
            </div>
          </div>

          {/* 5 Secret Word Puzzle Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {questions.map((q) => {
              const isUnlocked = Boolean(answeredQuestions[q.id]);

              return (
                <div
                  key={q.id}
                  onClick={() => handleDirectQuestionClick(q)}
                  className={`p-3.5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center relative overflow-hidden ${
                    isUnlocked
                      ? "bg-gradient-to-b from-[#15803d] to-[#166534] border-[#4ade80] shadow-lg shadow-green-950/40 transform hover:scale-105"
                      : "bg-[#1e1b18]/80 border-dashed border-[#c9922a]/50 hover:border-[#c9922a] hover:bg-[#1e1b18]"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#fef08a] mb-1">
                    Mảnh {q.num} · {q.typeTag}
                  </span>

                  {isUnlocked ? (
                    <div className="animate-fade-in flex flex-col items-center">
                      <span className="text-sm md:text-base font-black text-white uppercase tracking-wider">
                        {q.secretWord}
                      </span>
                      <span className="text-[10px] text-emerald-200 mt-0.5">✓ Đã giải mã</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center opacity-60">
                      <span className="text-base md:text-lg font-mono font-bold text-amber-200/80 tracking-widest">
                        ❓ [ ? ? ? ]
                      </span>
                      <span className="text-[10px] text-amber-200/70 mt-0.5">Quay để mở</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Full Assembled Title Reveal (Shown dynamically as unlocked) */}
          <div className="mt-4 pt-3 border-t border-[#c9922a]/40 text-center">
            <span className="text-[11px] uppercase tracking-widest text-[#c9922a] font-bold block mb-1">
              TỰA ĐỀ BÀI HỌC HOÀN CHỈNH:
            </span>
            <div
              className={`text-sm md:text-xl font-bold tracking-wide transition-all ${
                allAnswered
                  ? "text-[#fef08a] animate-pulse py-1"
                  : "text-white/60"
              }`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              👉 "{FULL_LESSON_TITLE}"
            </div>
          </div>
        </div>

        {/* Main Game Stage: Wheel on Left, Checklist & Conclusion Button on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Wheel Stage */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
            <div className="wheel-stage-card p-4 md:p-8 bg-gradient-to-b from-[#faf8f5] to-[#f4eee6] rounded-3xl shadow-xl border-2 border-[#c9922a]/30 relative flex flex-col items-center">
              {/* Wheel Canvas */}
              <WheelCanvas
                slices={WHEEL_SLICES}
                answeredQuestions={answeredQuestions}
                isSpinning={isSpinning}
                onSpinStart={() => {}}
                onSpinEnd={handleSpinEnd}
                targetSliceIndex={targetSliceIndex}
              />

              {/* Big Spin Button */}
              <div className="mt-8 flex flex-col items-center gap-2">
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={handleSpinClick}
                  className={`px-10 py-4 rounded-full font-black text-lg md:text-xl uppercase tracking-wider shadow-2xl transition-all duration-200 transform ${
                    isSpinning
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed scale-95"
                      : "bg-gradient-to-r from-[#d97706] via-[#c9922a] to-[#b45309] hover:from-[#b45309] hover:to-[#92400e] text-white hover:scale-105 active:scale-95 ring-4 ring-[#fde68a]/50"
                  }`}
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {isSpinning ? "Đang Quay Nón..." : "🎡 QUAY NÓN KỲ DIỆU 🎡"}
                </button>
                <div className="text-xs text-[#786c5e] font-medium">
                  {isSpinning
                    ? "Hồi hộp chờ kim nón dừng lại..."
                    : `Số lần đã quay: ${spinsCount} lượt`}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 5 Questions Checklist & Conclusion Button */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Checklist */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#e5dfd5]">
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="text-lg font-bold text-[#2c1a0e]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  5 Câu Đố Ghép Tựa Đề
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#c9922a]/15 text-[#855318]">
                  {answeredCount}/5 Đã Giải
                </span>
              </div>
              <p className="text-xs text-[#786c5e] mb-3">
                Xoay dính câu nào câu hỏi sẽ hiện ra. Hoặc bấm trực tiếp vào thẻ câu hỏi để mở nhanh:
              </p>

              {/* 5 Questions Items */}
              <div className="space-y-2.5">
                {questions.map((q) => {
                  const state = answeredQuestions[q.id];
                  const isDone = Boolean(state);

                  return (
                    <div
                      key={q.id}
                      onClick={() => handleDirectQuestionClick(q)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isDone
                          ? "bg-[#f0fdf4] border-[#86efac] text-[#166534]"
                          : "bg-[#faf8f5] border-[#e5dfd5] hover:border-[#c9922a] hover:bg-[#fffdf9]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center flex-shrink-0 ${
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
                              <strong className="text-emerald-700 font-bold">
                                Từ khóa: {q.secretWord}
                              </strong>
                            ) : (
                              `Thể loại: ${q.typeTag}`
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isDone ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Đã giải ✓
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-[#c9922a] hover:underline">
                            Mở câu hỏi →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* THE PROMINENT CONCLUSION BUTTON: "bấm cuối cùng khi trẢ LỜI HẾT KẾT NỘI DUNG BÀI HC" */}
            <div
              className={`p-6 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden ${
                allAnswered
                  ? "bg-gradient-to-r from-[#2c1a0e] via-[#452814] to-[#2c1a0e] border-[#c9922a] shadow-2xl ring-4 ring-[#c9922a]/40"
                  : "bg-white border-[#e5dfd5] shadow-sm"
              }`}
            >
              {allAnswered && (
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#c9922a]/20 rounded-full filter blur-xl pointer-events-none"></div>
              )}

              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{allAnswered ? "🎉" : "🔒"}</span>
                <div>
                  <h4
                    className={`font-black text-base md:text-lg ${
                      allAnswered ? "text-[#fef08a]" : "text-[#2c1a0e]"
                    }`}
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    KẾT NỘI DUNG BÀI HỌC
                  </h4>
                  <div
                    className={`text-xs ${
                      allAnswered ? "text-amber-100" : "text-[#786c5e]"
                    }`}
                  >
                    {allAnswered
                      ? "Đã trả lời hết 5 câu và hoàn thành tựa đề! Bấm nút bên dưới để mở toàn cảnh KẾT NỘI DUNG BÀI HỌC."
                      : `Cần trả lời đủ 5 câu để mở khóa kết luận bài học (Hiện tại: ${answeredCount}/5 câu).`}
                  </div>
                </div>
              </div>

              {/* The Grand Action Button */}
              <button
                type="button"
                onClick={() => setIsSummaryModalOpen(true)}
                className={`w-full mt-4 py-3.5 px-6 rounded-2xl font-black text-sm md:text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
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

      {/* Custom Questions Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#faf8f5] text-[#2c1a0e] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-[#c9922a]">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
              <h3
                className="text-xl font-bold text-[#2c1a0e]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                ⚙️ Tùy Chỉnh 5 Câu Hỏi Chiếc Nón Kỳ Diệu
              </h3>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-gray-500 hover:text-black font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#786c5e] mb-4">
              Bạn có thể chỉnh sửa nội dung 5 câu hỏi bên dưới cho phù hợp với nội dung buổi thuyết trình của nhóm:
            </p>

            <div className="space-y-4">
              {editingQuestions.map((q, qIndex) => (
                <div key={q.id} className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
                  <div className="font-bold text-xs text-[#c9922a] uppercase">
                    Câu hỏi {q.num} - Tiêu đề & Từ khóa
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={q.title}
                      onChange={(e) => {
                        const copy = [...editingQuestions];
                        copy[qIndex].title = e.target.value;
                        setEditingQuestions(copy);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={q.secretWord}
                      placeholder="Từ khóa ghép tựa đề"
                      onChange={(e) => {
                        const copy = [...editingQuestions];
                        copy[qIndex].secretWord = e.target.value;
                        setEditingQuestions(copy);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold text-emerald-700"
                    />
                  </div>
                  <div className="font-bold text-xs text-gray-600">Nội dung câu hỏi:</div>
                  <textarea
                    rows={2}
                    value={q.question}
                    onChange={(e) => {
                      const copy = [...editingQuestions];
                      copy[qIndex].question = e.target.value;
                      setEditingQuestions(copy);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingQuestions(DEFAULT_QUESTIONS)}
                className="px-4 py-2 text-xs font-bold border border-gray-300 rounded-xl hover:bg-gray-100"
              >
                Khôi phục mặc định
              </button>
              <button
                type="button"
                onClick={handleSaveQuestions}
                className="px-5 py-2 text-xs font-bold bg-[#c9922a] text-white rounded-xl hover:bg-[#b45309]"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
