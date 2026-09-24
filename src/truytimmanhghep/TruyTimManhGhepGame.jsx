import React, { useState, useCallback, useMemo, useEffect } from "react";
import PuzzleQuestionModal from "./PuzzleQuestionModal";
import PuzzleQuestionCard from "./PuzzleQuestionCard";
import PuzzleAssemblyStage from "./PuzzleAssemblyStage";
import MysteryRevealModal from "./MysteryRevealModal";
import GameRulesModal from "./GameRulesModal";
import { ALL_PUZZLE_QUESTIONS } from "./puzzleData";
import { sounds } from "../chiecnonkidieu/SoundEffects";
import "./truytimmanhghep.css";
import "../chiecnonkidieu/chiecnonkidieu.css";

export default function TruyTimManhGhepGame() {
  // Modal Thể Lệ Trò Chơi (Tự động mở khi vào tab hoặc bấm vào tab)
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(true);

  // Record of completed question numbers: { [qNum]: { isCorrect: boolean } }
  // When a question is completed and closed, it CANNOT be opened again
  const [completedQuestions, setCompletedQuestions] = useState({});

  // Active question modal state
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Mystery full artwork modal state (for host quick comparison if needed)
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);

  // Chế độ xem: "questions" (Danh sách 9 câu hỏi) hoặc "assembly" (Màn hình ghép tranh Hình 1 & 2)
  const [activeView, setActiveView] = useState("questions");

  // Audio and toast notification states
  const [toastMessage, setToastMessage] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Derived counts
  const completedCount = useMemo(
    () => Object.keys(completedQuestions).length,
    [completedQuestions]
  );

  const correctCount = useMemo(
    () => Object.values(completedQuestions).filter((item) => item.isCorrect).length,
    [completedQuestions]
  );

  const allCompleted = completedCount >= 9;

  // List of remaining questions available to pick
  const remainingQuestions = useMemo(() => {
    return ALL_PUZZLE_QUESTIONS.filter((q) => !completedQuestions[q.qNum]);
  }, [completedQuestions]);

  // Lắng nghe sự kiện click từ tab "Truy Tìm Mảnh Ghép" trên thanh Navbar
  useEffect(() => {
    const handleOpenRules = () => {
      setIsRulesModalOpen(true);
    };
    window.addEventListener("open-truytimmanhghep-rules", handleOpenRules);
    return () => {
      window.removeEventListener("open-truytimmanhghep-rules", handleOpenRules);
    };
  }, []);

  // Show temporary toast notification
  const showToast = useCallback((msg, durationMs = 3500) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, durationMs);
  }, []);

  // Toggle sound effects
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
  };

  // Open question modal
  const handleSelectQuestion = (q) => {
    if (!q) return;
    if (completedQuestions[q.qNum]) {
      showToast(`Câu số ${q.qNum} đã hoàn thành và mảnh ghép số ${q.qNum} đã được phát ở ngoài!`);
      return;
    }
    setActiveQuestion(q);
    setIsQuestionModalOpen(true);
  };

  // When modal is closed after viewing the piece:
  const handleFinishQuestion = (qNum, isCorrect) => {
    setIsQuestionModalOpen(false);
    setActiveQuestion(null);

    // Play handover sound
    sounds.playLand();

    setCompletedQuestions((prev) => {
      const next = { ...prev, [qNum]: { isCorrect } };
      const newCount = Object.keys(next).length;

      if (newCount >= 9) {
        setTimeout(() => {
          sounds.playFanfare();
          showToast(
            "🎉 CHÚC MỪNG! ĐÃ HOÀN THÀNH 9 CÂU HỎI & PHÁT ĐỦ 9 MẢNH GHÉP! CHUYỂN SANG MÀN HÌNH GHÉP TRANH...",
            5000
          );
          setActiveView("assembly");
        }, 500);
      } else {
        showToast(
          `🎁 Đã phát Mảnh ghép số #${qNum}! Còn lại ${9 - newCount} câu hỏi.`
        );
      }

      return next;
    });
  };

  // Reset entire game
  const handleRestart = () => {
    setCompletedQuestions({});
    setIsQuestionModalOpen(false);
    setIsRevealModalOpen(false);
    setActiveQuestion(null);
    setActiveView("questions");
    showToast("🔄 Đã làm mới trò chơi! Toàn bộ 9 câu hỏi đã sẵn sàng.");
  };

  const getLevelBadgeClass = (lvl) => {
    if (lvl.includes("Nhận biết"))
      return "bg-blue-900/60 text-blue-200 border-blue-500/40";
    if (lvl.includes("Thông hiểu"))
      return "bg-amber-900/60 text-amber-200 border-amber-500/40";
    return "bg-purple-900/60 text-purple-200 border-purple-500/40";
  };

  return (
    <div className="chiecnon-game-container min-h-screen text-[#eee2ca] pt-24 pb-16 px-3 sm:px-6 md:px-8 relative overflow-hidden flex flex-col items-center">
      {/* Texture grain overlay */}
      <div className="chiecnon-grain pointer-events-none"></div>

      {/* Background Ambient Glows */}
      <div className="absolute top-12 -left-20 w-96 h-96 rounded-full bg-[#c3a47b]/15 filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full bg-[#a96346]/12 filter blur-3xl pointer-events-none"></div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1d1a15]/95 backdrop-blur-md text-[#fef08a] px-6 py-3.5 rounded-full shadow-2xl border-2 border-[#c3a47b] flex items-center gap-2.5 font-bold text-xs md:text-sm animate-bounce text-center max-w-xl">
          <span className="text-lg">🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full flex flex-col items-center relative z-10 space-y-6">
        {/* Game Title & Header */}
        <div className="text-center space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3a382b]/80 border border-[#c3a47b]/50 text-[#dbc39c] text-[11px] sm:text-xs font-bold uppercase tracking-widest shadow-sm">
            <span>🧩</span>
            <span>TRUY TÌM MẢNH GHÉP </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl md:text-5xl font-black text-[#eee2ca] tracking-tight uppercase"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Truy Tìm Mảnh Ghép
          </h1>

          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
            <div className="bg-[#3a382b]/90 px-4 py-1.5 rounded-full border border-[#c3a47b]/30 text-xs font-bold text-[#eee2ca] shadow-sm flex items-center gap-1.5">
              <span>🎁 Mảnh đã phát:</span>
              <span className="font-black text-amber-400">
                {completedCount}/9 mảnh
              </span>
            </div>

            <div className="bg-[#3a382b]/90 px-4 py-1.5 rounded-full border border-[#c3a47b]/30 text-xs font-bold text-[#eee2ca] shadow-sm flex items-center gap-1.5">
              <span>🎯 Điểm đúng:</span>
              <span className="font-black text-emerald-400">
                {correctCount}/9 câu
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsRulesModalOpen(true)}
              className="bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] px-4 py-1.5 rounded-full border border-[#fde68a] text-xs font-black text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <span>📜</span>
              <span>Thể lệ trò chơi</span>
            </button>

            <button
              type="button"
              onClick={handleToggleMute}
              className="bg-[#3a382b]/90 hover:bg-[#4a4738] px-3.5 py-1.5 rounded-full border border-[#c3a47b]/30 text-xs font-bold text-[#eee2ca] shadow-sm transition-all cursor-pointer"
            >
              {isMuted ? "🔇 Tắt âm" : "🔊 Âm thanh"}
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="bg-[#3a382b]/90 hover:bg-[#4a4738] px-3.5 py-1.5 rounded-full border border-[#a96346]/50 text-xs font-bold text-[#fca5a5] shadow-sm transition-all cursor-pointer flex items-center gap-1"
            >
              <span>🔄</span>
              <span>Chơi lại từ đầu</span>
            </button>
          </div>

          {/* TAB SWITCHER: 9 Câu Hỏi vs Màn Hình Ghép Tranh (Hình 1 & 2) */}
          <div className="flex items-center justify-center gap-2 pt-3">
            <button
              type="button"
              onClick={() => setActiveView("questions")}
              className={`px-5 py-2 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-md ${
                activeView === "questions"
                  ? "bg-gradient-to-r from-[#d97706] to-[#b45309] text-white ring-2 ring-[#fde68a]"
                  : "bg-[#2c1a0e]/80 hover:bg-[#3d2414] text-[#dbc39c] border border-[#c9922a]/40"
              }`}
            >
              <span>🧩</span>
              <span>Danh Sách 9 Mảnh Ghép ({completedCount}/9)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("assembly")}
              className={`px-5 py-2 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-md ${
                activeView === "assembly"
                  ? "bg-gradient-to-r from-[#d97706] to-[#b45309] text-white ring-2 ring-[#fde68a]"
                  : "bg-[#2c1a0e]/80 hover:bg-[#3d2414] text-[#dbc39c] border border-[#c9922a]/40"
              }`}
            >
              <span>🖼️</span>
              <span>Màn Hình Ghép Tranh &amp; Đáp Án (Hình 1 &amp; 2)</span>
            </button>
          </div>
        </div>

        {/* ================= GIAI ĐOẠN 1: BẢNG 9 CÂU HỎI TRANH TÀI ================= */}
        {activeView === "questions" ? (
          <div className="w-full max-w-5xl bg-gradient-to-b from-[#2e1d12] via-[#22130a] to-[#160b05] p-5 sm:p-7 md:p-8 rounded-3xl border-4 border-[#c9922a]/80 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#c9922a]/30">
              <div className="flex items-center gap-2.5">
                <span className="text-xl sm:text-2xl"></span>
                <div>
                  <h2
                    className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-wider text-[#fef08a]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    THU THẬP 9 MẢNH GHÉP
                  </h2>
                
                </div>
              </div>

              <div className="px-3.5 py-1 rounded-full bg-[#3a2214] border border-[#c9922a]/50 text-xs font-bold text-[#fef08a]">
                {completedCount}/9 Hoàn thành
              </div>
            </div>

            {/* Lưới các câu hỏi hình mảnh ghép Puzzle 3D sắc nét */}
            {remainingQuestions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {remainingQuestions.map((q, idx) => (
                  <PuzzleQuestionCard
                    key={q.id}
                    question={q}
                    index={idx}
                    onSelect={handleSelectQuestion}
                  />
                ))}
              </div>
            ) : (
              /* Khi toàn bộ 9 câu hỏi đã hoàn thành */
              <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-b from-[#1c3826] to-[#0f2418] border-2 border-emerald-500/60 text-center space-y-4 shadow-xl">
                <span className="text-5xl sm:text-6xl animate-bounce inline-block">
                  🏆
                </span>
                <h3
                  className="text-xl sm:text-3xl font-black text-emerald-300 uppercase tracking-wide"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  ĐÃ HOÀN THÀNH TOÀN BỘ 9 CÂU HỎI!
                </h3>
                <p className="text-sm text-emerald-200/90 max-w-xl mx-auto">
                  Toàn bộ 9 mảnh ghép đã được phát ra ngoài. Hãy bấm nút bên dưới để chuyển sang màn hình ghép mảnh và khám phá quy luật biến đổi xã hội.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveView("assembly")}
                    className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] text-white font-black text-sm uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 mx-auto cursor-pointer ring-4 ring-[#fde68a]"
                  >
                    <span>🧩 MỞ MÀN HÌNH GHÉP TRANH &amp; XEM ĐÁP ÁN (HÌNH 1 &amp; 2)</span>
                    <span>➜</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Action Button below Question List */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#c9922a]/20">
          

          
            </div>
          </div>
        ) : (
          /* ================= GIAI ĐOẠN 2: MÀN HÌNH GHÉP TRANH & ĐÁP ÁN (HÌNH 1 & HÌNH 2) ================= */
          <PuzzleAssemblyStage
            onRestart={handleRestart}
            onBackToQuestions={() => setActiveView("questions")}
            onOpenRules={() => setIsRulesModalOpen(true)}
            completedCount={completedCount}
          />
        )}
      </div>

      {/* Game Rules & Instructions Modal */}
      <GameRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Question Modal: Upon answer, hides question & shows piece image */}
      <PuzzleQuestionModal
        question={activeQuestion}
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onFinishQuestion={handleFinishQuestion}
      />

      {/* Mystery Full Artwork Reveal Modal (Optional reference preview) */}
      <MysteryRevealModal
        isOpen={isRevealModalOpen}
        onClose={() => setIsRevealModalOpen(false)}
        onRestart={handleRestart}
        unlockedCount={completedCount}
        correctCount={correctCount}
        allUnlocked={allCompleted}
      />
    </div>
  );
}
