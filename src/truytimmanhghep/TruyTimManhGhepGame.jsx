import React, { useState, useCallback, useMemo } from "react";
import PuzzleQuestionModal from "./PuzzleQuestionModal";
import MysteryRevealModal from "./MysteryRevealModal";
import { ALL_PUZZLE_QUESTIONS, MYSTERY_TITLE } from "./puzzleData";
import { sounds } from "../chiecnonkidieu/SoundEffects";
import "./truytimmanhghep.css";
import "../chiecnonkidieu/chiecnonkidieu.css";

export default function TruyTimManhGhepGame() {
  // Record of completed question numbers: { [qNum]: { isCorrect: boolean } }
  // When a question is completed and closed, it CANNOT be opened again:
  // "r khi tôi tắt modal thì ko hiện lên đc nữa vì tôi sẽ phát mảnh ở ngoài"
  const [completedQuestions, setCompletedQuestions] = useState({});

  // Active question modal state
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Mystery full artwork modal state (for host to project at the end to check physical puzzle)
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);

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
      showToast(`Câu số ${q.qNum} đã hoàn thành và mảnh ghép đã được phát ở ngoài!`);
      return;
    }
    setActiveQuestion(q);
    setIsQuestionModalOpen(true);
  };

  // When modal is closed after viewing the piece:
  // "r khi tôi tắt modal thì ko hiện lên đc nữa vì tôi sẽ phát mảnh ở ngoài"
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
            "🎉 CHÚC MỪNG! ĐÃ HOÀN THÀNH 9 CÂU HỎI & PHÁT ĐỦ 9 MẢNH GHÉP Ở NGOÀI!",
            5000
          );
        }, 400);
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

      <div className="max-w-6xl mx-auto w-full flex flex-col items-center relative z-10 space-y-6">
        {/* Game Title & Header */}
        <div className="text-center space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3a382b]/80 border border-[#c3a47b]/50 text-[#dbc39c] text-[11px] sm:text-xs font-bold uppercase tracking-widest shadow-sm">
            <span>🧩</span>
            <span>TRUY TÌM MẢNH GHÉP</span>
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
        </div>

        {/* ================= BẢNG CÂU HỎI TRUNG TÂM ================= */}
        {/* Người dùng yêu cầu: Bỏ phần bức tranh bí ẩn đi, chỉ để các câu hỏi; trả lời xong thì câu hỏi mất luôn */}
        <div className="w-full max-w-5xl bg-gradient-to-b from-[#2e1d12] via-[#22130a] to-[#160b05] p-5 sm:p-7 md:p-8 rounded-3xl border-4 border-[#c9922a]/80 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#c9922a]/30">
            <div className="flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl">📋</span>
              <div>
                <h2
                  className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-wider text-[#fef08a]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Danh Sách Câu Hỏi Tranh Tài
                </h2>
            
              </div>
            </div>

            <div className="px-3.5 py-1 rounded-full bg-[#3a2214] border border-[#c9922a]/50 text-xs font-bold text-[#fef08a]">
              {completedCount}/9 Hoàn thành
            </div>
          </div>

          {/* Grid of Available Question Cards (Lưới các câu hỏi chưa mở) */}
          {remainingQuestions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {remainingQuestions.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleSelectQuestion(q)}
                  className="relative p-5 rounded-2xl bg-gradient-to-br from-[#382010] via-[#28150a] to-[#1a0e06] border-2 border-[#c9922a]/60 hover:border-[#fef08a] shadow-lg hover:shadow-[0_10px_25px_rgba(245,158,11,0.25)] transition-all duration-300 hover:scale-[1.03] text-left cursor-pointer group flex flex-col justify-between min-h-[160px]"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between w-full">
                    <span className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#92400e] via-[#b45309] to-[#fde68a] text-[#1c0d05] font-black text-xl flex items-center justify-center shadow border border-[#fef08a] group-hover:scale-110 transition-transform">
                      {q.qNum}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getLevelBadgeClass(
                        q.level
                      )}`}
                    >
                      {q.level.split("/")[0]}
                    </span>
                  </div>

                  {/* Card Topic & Question Teaser */}
                  <div className="my-3 space-y-1">
                    <div className="text-xs uppercase tracking-wider text-[#d4af37] font-semibold">
                      Chủ đề: {q.tag}
                    </div>
                  
                  </div>

                  {/* Card Footer Button */}
                  <div className="w-full pt-2 border-t border-[#c9922a]/20 flex items-center justify-between text-xs font-bold text-[#d4af37] group-hover:text-[#fde68a]">
                    <span>Bấm để mở câu hỏi</span>
                    <span className="text-base group-hover:translate-x-1 transition-transform">
                      ➜
                    </span>
                  </div>
                </button>
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
             
              <div className="pt-2">
          
              </div>
            </div>
          )}
        </div>

        {/* Action Button: Host Reference Preview */}
        <div className="w-full max-w-5xl flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsRevealModalOpen(true)}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm md:text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all cursor-pointer ${
              allCompleted
                ? "bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#b45309] text-white shadow-2xl animate-grand-pulse ring-4 ring-[#fde68a]"
                : "bg-gradient-to-r from-[#3e2716] to-[#25150a] hover:from-[#52331c] hover:to-[#382010] text-[#fef08a] border-2 border-[#c9922a] shadow-lg hover:scale-[1.01]"
            }`}
          >
            <span className="text-xl md:text-2xl">🖼️</span>
            <span>
              {allCompleted
                ? " XEM BỨC TRANH HOÀN CHỈNH  "
                : `XEM BỨC TRANH GỐC ĐỐI CHIẾU (${completedCount}/9 MẢNH ĐÃ PHÁT)`}
            </span>
          </button>


        </div>
      </div>

      {/* Question Modal: Upon answer, hides question & shows piece image */}
      <PuzzleQuestionModal
        question={activeQuestion}
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onFinishQuestion={handleFinishQuestion}
      />

      {/* Mystery Full Artwork Reveal Modal */}
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
