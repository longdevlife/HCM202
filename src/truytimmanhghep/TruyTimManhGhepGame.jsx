import React, { useState, useCallback, useMemo } from "react";
import PuzzleBoard from "./PuzzleBoard";
import PuzzleQuestionModal from "./PuzzleQuestionModal";
import MysteryRevealModal from "./MysteryRevealModal";
import { getRandomizedPuzzleSet } from "./puzzleData";
import { sounds } from "../chiecnonkidieu/SoundEffects";
import "./truytimmanhghep.css";
import "../chiecnonkidieu/chiecnonkidieu.css";

export default function TruyTimManhGhepGame() {
  // 9 puzzle pieces randomly picked and shuffled from the 10-question bank
  const [puzzleSet, setPuzzleSet] = useState(() => getRandomizedPuzzleSet());

  // Record of unlocked pieces: { [pieceIndex]: { isCorrect: true } }
  const [unlockedPieces, setUnlockedPieces] = useState({});

  // Active question modal state
  const [activePiece, setActivePiece] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Mystery keyword reveal modal state
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);

  // Notification toast & audio state
  const [toastMessage, setToastMessage] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const unlockedCount = useMemo(
    () => Object.keys(unlockedPieces).length,
    [unlockedPieces]
  );
  const allUnlocked = unlockedCount >= 9;

  // Toggle audio
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
  };

  // Show temporary toast message
  const showToast = useCallback((msg, durationMs = 3500) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, durationMs);
  }, []);

  // When a tile on the 3x3 board is clicked
  const handlePieceClick = (piece) => {
    setActivePiece(piece);
    setIsQuestionModalOpen(true);
  };

  // When answer is submitted in question modal
  const handleAnswerSubmit = (pieceIndex, isCorrect) => {
    if (isCorrect) {
      setUnlockedPieces((prev) => {
        const next = { ...prev, [pieceIndex]: { isCorrect: true } };
        const newCount = Object.keys(next).length;

        if (newCount >= 9) {
          sounds.playFanfare();
          showToast("🎉 CHÚC MỪNG! ĐÃ HOÀN THÀNH BỨC TRANH! BẤM NÚT ĐỂ HIỆN TỪ KHÓA BÍ ẨN!");
        } else {
          showToast(
            `✨ Mảnh #${pieceIndex + 1} mở thành công! Hãy trao 1 mảnh ghép thực tế cho người chơi!`
          );
        }
        return next;
      });
    }
  };

  // Restart / reshuffle new questions from bank
  const handleRestart = () => {
    setPuzzleSet(getRandomizedPuzzleSet());
    setUnlockedPieces({});
    setIsQuestionModalOpen(false);
    setIsRevealModalOpen(false);
    showToast("🔄 Đã tạo ván chơi mới & xáo trộn 9 câu hỏi ngẫu nhiên!");
  };

  return (
    <div className="chiecnon-game-container min-h-screen text-[#eee2ca] pt-24 pb-16 px-4 md:px-8 relative overflow-hidden flex flex-col justify-center items-center">
      {/* Texture grain overlay matching book library & chiếc nón */}
      <div className="chiecnon-grain"></div>

      {/* Background Decorative Glow */}
      <div className="absolute top-12 -left-20 w-96 h-96 rounded-full bg-[#c3a47b]/15 filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full bg-[#a96346]/12 filter blur-3xl pointer-events-none"></div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1d1a15] text-[#fef08a] px-6 py-3.5 rounded-full shadow-2xl border border-[#c3a47b] flex items-center gap-2.5 font-bold text-xs md:text-sm animate-bounce text-center max-w-lg">
          <span className="text-base">🔔</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto w-full flex flex-col items-center relative z-10 space-y-6">
        {/* Game Title & Header Strip */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3a382b]/80 border border-[#c3a47b]/50 text-[#dbc39c] text-xs font-bold uppercase tracking-widest shadow-sm">
            <span>🧩</span>
            <span>Trò Chơi Tương Tác · Chương 5 MLN131</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl md:text-5xl font-black text-[#eee2ca] tracking-tight uppercase"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Truy Tìm Mảnh Ghép
          </h1>

          <p className="text-xs md:text-sm text-[#c5b79e] max-w-xl mx-auto font-medium leading-relaxed">
            Trả lời đúng từng câu hỏi để lật mở từng mảnh ghép của bức tranh bí ẩn.
            Mỗi câu trả lời đúng, quản trò sẽ trao một mảnh ghép thực tế ở bên ngoài cho người chơi!
          </p>

          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 pt-2">
            <div className="bg-[#3a382b]/90 px-4 py-1.5 rounded-full border border-[#c3a47b]/30 text-xs font-bold text-[#eee2ca] shadow-sm flex items-center gap-1.5">
              <span>🧩 Tiến độ:</span>
              <span className="font-black text-emerald-400">
                {unlockedCount}/9 mảnh đã ghép
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
              <span>Trộn lại câu hỏi</span>
            </button>
          </div>
        </div>

        {/* Center Stage: The 3x3 Puzzle Board */}
        <div className="w-full flex flex-col items-center">
          <PuzzleBoard
            puzzleSet={puzzleSet}
            unlockedPieces={unlockedPieces}
            onPieceClick={handlePieceClick}
          />
        </div>

        {/* Mystery Keyword Action Area Below Board */}
        <div className="w-full max-w-4xl flex flex-col items-center gap-3 pt-2">
          {/* THE BUTTON REQUESTED BY USER */}
          <button
            type="button"
            onClick={() => setIsRevealModalOpen(true)}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm md:text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all cursor-pointer ${
              allUnlocked
                ? "bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#b45309] text-white shadow-2xl animate-grand-pulse ring-4 ring-[#fde68a]"
                : "bg-gradient-to-r from-[#3e2716] to-[#25150a] hover:from-[#52331c] hover:to-[#382010] text-[#fef08a] border-2 border-[#c9922a] shadow-lg hover:scale-[1.01]"
            }`}
          >
            <span className="text-xl md:text-2xl">🔍</span>
            <span>
              {allUnlocked
                ? "🎉 BẤM VÀO ĐÂY ĐỂ HIỆN BỨC TRANH THỰC TẾ & TỪ KHÓA BÍ ẨN 🏆"
                : `XEM TỪ KHÓA BỨC TRANH BÍ ẨN (${unlockedCount}/9 MẢNH ĐÃ GHÉP)`}
            </span>
          </button>

          <div className="text-[11px] md:text-xs text-[#a89b87] text-center italic">
            💡 Gợi ý: Bấm trực tiếp vào từng mảnh ghép để trả lời câu hỏi và ghép thành bức tranh hoàn chỉnh!
          </div>
        </div>
      </div>

      {/* Question Modal */}
      <PuzzleQuestionModal
        pieceData={activePiece}
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onAnswerSubmit={handleAnswerSubmit}
        isAlreadyAnswered={Boolean(activePiece && unlockedPieces[activePiece.pieceIndex])}
      />

      {/* Mystery Keyword Reveal Modal */}
      <MysteryRevealModal
        isOpen={isRevealModalOpen}
        onClose={() => setIsRevealModalOpen(false)}
        onRestart={handleRestart}
        allUnlocked={allUnlocked}
      />
    </div>
  );
}
