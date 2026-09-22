import React, { useState, useEffect } from "react";
import { sounds } from "./SoundEffects";

export default function QuestionModal({
  question,
  isOpen,
  onClose,
  onAnswerSubmit,
  allAnswered = false,
  onOpenSummary,
}) {
  const [typedAnswer, setTypedAnswer] = useState("");
  // For anagram question 4: state of placed tiles
  // Array of 11 slots corresponding to the 11 target letters
  const [placedTiles, setPlacedTiles] = useState([]);
  const [availableScrambled, setAvailableScrambled] = useState([]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Initialize or reset when a new question opens
  useEffect(() => {
    if (question && isOpen) {
      setTypedAnswer("");
      setIsSubmitted(false);
      setIsCorrect(false);

      if (question.questionType === "anagram" && question.scrambledTiles) {
        setAvailableScrambled(
          question.scrambledTiles.map((char, idx) => ({ id: `${char}-${idx}`, char }))
        );
        setPlacedTiles([]);
      }
    }
  }, [question, isOpen]);

  if (!isOpen || !question) return null;

  // Normalizing string for accent-insensitive check
  const normalizeText = (str) =>
    (str || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "i") // accept both thời kỳ and thời kì
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Anagram tile click: place into next empty slot
  const handlePickTile = (tile) => {
    if (isSubmitted) return;
    if (placedTiles.length >= 11) return;

    setAvailableScrambled((prev) => prev.filter((t) => t.id !== tile.id));
    setPlacedTiles((prev) => [...prev, tile]);
  };

  // Anagram placed slot click: return back to pool
  const handleRemoveTile = (index) => {
    if (isSubmitted) return;
    const tileToRemove = placedTiles[index];
    if (!tileToRemove) return;

    setPlacedTiles((prev) => prev.filter((_, idx) => idx !== index));
    setAvailableScrambled((prev) => [...prev, tileToRemove]);
  };

  // Check / Submit Anagram Answer
  const handleCheckAnagram = () => {
    if (isSubmitted) return;
    const currentWord = placedTiles.map((t) => t.char).join("");
    const targetNormalized = "THỜIKÌQUÁĐỘ";
    const targetNormalized2 = "THỜIKỲQUÁĐỘ";

    const isMatch =
      currentWord.toUpperCase() === targetNormalized ||
      currentWord.toUpperCase() === targetNormalized2 ||
      normalizeText(currentWord) === normalizeText("thoikiquado");

    setIsCorrect(isMatch);
    setIsSubmitted(true);

    if (isMatch) {
      sounds.playCorrect();
      onAnswerSubmit && onAnswerSubmit(question.id, true);
    } else {
      sounds.playWrong();
      onAnswerSubmit && onAnswerSubmit(question.id, false);
    }
  };

  // Check / Submit Typed Answer for Riddle / Knowledge questions
  const handleCheckTyped = (e) => {
    e?.preventDefault();
    if (isSubmitted || !typedAnswer.trim()) return;

    const userNorm = normalizeText(typedAnswer);
    const targetNorm = normalizeText(question.secretWord);

    const isMatch =
      userNorm === targetNorm ||
      (question.acceptedAnswers &&
        question.acceptedAnswers.some((ans) => normalizeText(ans) === userNorm));

    setIsCorrect(isMatch);
    setIsSubmitted(true);

    if (isMatch) {
      sounds.playCorrect();
      onAnswerSubmit && onAnswerSubmit(question.id, true);
    } else {
      sounds.playWrong();
      onAnswerSubmit && onAnswerSubmit(question.id, false);
    }
  };

  // Force Reveal Answer
  const handleRevealAnswer = () => {
    if (isSubmitted) return;
    setIsCorrect(true);
    setIsSubmitted(true);
    sounds.playCorrect();
    onAnswerSubmit && onAnswerSubmit(question.id, true);
  };

  const handleNext = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#faf8f5] text-[#2c1a0e] rounded-3xl shadow-2xl border-2 border-[#c9922a]/50 overflow-hidden flex flex-col my-auto max-h-[94vh]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-[#2c1a0e] via-[#4a2e18] to-[#2c1a0e] text-white px-6 py-4 flex items-center justify-between border-b border-[#c9922a]/50">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-full bg-[#c9922a] text-[#2c1a0e] font-black flex items-center justify-center text-sm shadow-md">
              {question.num}
            </span>
            <div>
              <div className="text-[11px] tracking-widest uppercase text-[#fef08a] font-bold">
                {question.badge} · {question.typeTag}
              </div>
              <div
                className="text-base md:text-lg font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {question.title}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#c9922a]/20 border border-[#c9922a] text-[#fef08a]">
              +{question.points || 100} Điểm
            </span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
          {/* REAL IMAGES FOR QUESTION 1 (2 REAL PHOTOS) */}
          {question.visualImages && question.visualImages.length === 2 && (
            <div className="flex items-center justify-center gap-3 md:gap-4 p-3 bg-white rounded-2xl border border-[#e5dfd5] shadow-sm">
              {/* Image 1 */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow border border-gray-200 bg-gray-100 relative group">
                  <img
                    src={question.visualImages[0].src}
                    alt={question.visualImages[0].caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-xs font-bold text-[#4a3e35] mt-1.5 text-center">
                  {question.visualImages[0].caption}
                </span>
              </div>

              {/* Plus Sign */}
              <div className="text-2xl md:text-3xl font-black text-[#c9922a] select-none">
                +
              </div>

              {/* Image 2 */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow border border-gray-200 bg-gray-100 relative group">
                  <img
                    src={question.visualImages[1].src}
                    alt={question.visualImages[1].caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {question.visualImages[1].hasAcuteAccent && (
                    <div className="absolute top-2 right-2 bg-red-600/90 text-white font-black text-xs md:text-sm px-2 py-0.5 rounded-md shadow">
                      + Dấu Sắc (´)
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold text-[#4a3e35] mt-1.5 text-center">
                  {question.visualImages[1].caption}
                </span>
              </div>
            </div>
          )}

          {/* REAL IMAGES FOR QUESTION 5 (4 REAL PHOTOS GRID) */}
          {question.visualImages && question.visualImages.length === 4 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-3 bg-white rounded-2xl border border-[#e5dfd5] shadow-sm">
              {question.visualImages.map((img, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow border border-gray-200 bg-gray-100 group">
                    <img
                      src={img.src}
                      alt={img.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#4a3e35] mt-1 text-center line-clamp-1">
                    Ô {idx + 1}: {img.caption}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Question Text */}
          <div className="p-3.5 bg-white rounded-xl shadow-sm border border-[#e5dfd5]">
            <h3
              className="text-sm md:text-base font-bold text-[#2c1a0e] leading-relaxed whitespace-pre-line"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {question.question}
            </h3>
          </div>

          {/* QUESTION 4 (ANAGRAM): NO MULTIPLE CHOICE, ONLY SCRAMBLED TILES AND UNDERLINE SLOTS */}
          {question.questionType === "anagram" && (
            <div className="space-y-4 p-4 bg-white rounded-2xl border border-[#e5dfd5] shadow-sm">
              {/* Scrambled Letter Bank */}
              <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-amber-50/60 rounded-xl border border-amber-200">
                {availableScrambled.length > 0 ? (
                  availableScrambled.map((tile) => (
                    <button
                      key={tile.id}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handlePickTile(tile)}
                      className="w-9 h-10 md:w-10 md:h-11 rounded-lg bg-white hover:bg-amber-100 active:scale-95 border-2 border-amber-400 text-[#2c1a0e] font-black text-base md:text-lg flex items-center justify-center shadow-md transition-all cursor-pointer"
                    >
                      {tile.char}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-amber-700 italic py-1">
                    Đã xếp toàn bộ 11 chữ cái vào các ô gạch chân bên dưới!
                  </span>
                )}
              </div>

              {/* Underline Slots Formatted as 4 Words: THỜI - KÌ - QUÁ - ĐỘ (4 + 2 + 3 + 2 = 11) */}
              <div className="p-4 bg-gradient-to-b from-[#faf8f5] to-[#f4eee6] rounded-2xl border border-[#c9922a]/30">
                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
                  {/* Word 1: THỜI (4 slots: 0, 1, 2, 3) */}
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((slotIdx) => {
                      const tile = placedTiles[slotIdx];
                      return (
                        <div
                          key={slotIdx}
                          onClick={() => handleRemoveTile(slotIdx)}
                          className={`w-9 h-11 md:w-10 md:h-12 rounded-lg border-b-4 flex items-center justify-center font-black text-base md:text-lg transition-all cursor-pointer select-none ${
                            tile
                              ? "bg-white border-[#c9922a] text-[#2c1a0e] shadow-sm scale-105"
                              : "bg-black/5 border-gray-400 text-transparent"
                          }`}
                        >
                          {tile ? tile.char : "_"}
                        </div>
                      );
                    })}
                  </div>

                  {/* Word 2: KÌ (2 slots: 4, 5) */}
                  <div className="flex gap-1.5">
                    {[4, 5].map((slotIdx) => {
                      const tile = placedTiles[slotIdx];
                      return (
                        <div
                          key={slotIdx}
                          onClick={() => handleRemoveTile(slotIdx)}
                          className={`w-9 h-11 md:w-10 md:h-12 rounded-lg border-b-4 flex items-center justify-center font-black text-base md:text-lg transition-all cursor-pointer select-none ${
                            tile
                              ? "bg-white border-[#c9922a] text-[#2c1a0e] shadow-sm scale-105"
                              : "bg-black/5 border-gray-400 text-transparent"
                          }`}
                        >
                          {tile ? tile.char : "_"}
                        </div>
                      );
                    })}
                  </div>

                  {/* Word 3: QUÁ (3 slots: 6, 7, 8) */}
                  <div className="flex gap-1.5">
                    {[6, 7, 8].map((slotIdx) => {
                      const tile = placedTiles[slotIdx];
                      return (
                        <div
                          key={slotIdx}
                          onClick={() => handleRemoveTile(slotIdx)}
                          className={`w-9 h-11 md:w-10 md:h-12 rounded-lg border-b-4 flex items-center justify-center font-black text-base md:text-lg transition-all cursor-pointer select-none ${
                            tile
                              ? "bg-white border-[#c9922a] text-[#2c1a0e] shadow-sm scale-105"
                              : "bg-black/5 border-gray-400 text-transparent"
                          }`}
                        >
                          {tile ? tile.char : "_"}
                        </div>
                      );
                    })}
                  </div>

                  {/* Word 4: ĐỘ (2 slots: 9, 10) */}
                  <div className="flex gap-1.5">
                    {[9, 10].map((slotIdx) => {
                      const tile = placedTiles[slotIdx];
                      return (
                        <div
                          key={slotIdx}
                          onClick={() => handleRemoveTile(slotIdx)}
                          className={`w-9 h-11 md:w-10 md:h-12 rounded-lg border-b-4 flex items-center justify-center font-black text-base md:text-lg transition-all cursor-pointer select-none ${
                            tile
                              ? "bg-white border-[#c9922a] text-[#2c1a0e] shadow-sm scale-105"
                              : "bg-black/5 border-gray-400 text-transparent"
                          }`}
                        >
                          {tile ? tile.char : "_"}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Anagram Actions */}
              {!isSubmitted && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  {placedTiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvailableScrambled(
                          question.scrambledTiles.map((char, idx) => ({ id: `${char}-${idx}`, char }))
                        );
                        setPlacedTiles([]);
                      }}
                      className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-800"
                    >
                      Xếp lại
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRevealAnswer}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#c9922a] text-[#855318] hover:bg-amber-50"
                  >
                    Xem đáp án
                  </button>
                  <button
                    type="button"
                    disabled={placedTiles.length < 11}
                    onClick={handleCheckAnagram}
                    className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow transition-all ${
                      placedTiles.length >= 11
                        ? "bg-[#c9922a] hover:bg-[#b8860b] text-white hover:scale-105 active:scale-95"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Kiểm Tra
                  </button>
                </div>
              )}
            </div>
          )}

          {/* QUESTIONS 1, 2, 3, 5: ELEGANT ANSWER INPUT BOX WITH UNDERLINES */}
          {question.questionType !== "anagram" && (
            <div className="space-y-3 p-4 bg-white rounded-2xl border border-[#e5dfd5] shadow-sm">
              {/* Word Pattern Underlines Display */}
              {question.wordPattern && (
                <div className="flex items-center justify-center gap-3 py-1">
                  {question.wordPattern.map((pat, pIdx) => (
                    <span
                      key={pIdx}
                      className="font-mono text-base md:text-lg font-bold text-[#c9922a] tracking-widest bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200"
                    >
                      {pat}
                    </span>
                  ))}
                </div>
              )}

              {/* Form Input */}
              {!isSubmitted ? (
                <form onSubmit={handleCheckTyped} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={typedAnswer}
                      onChange={(e) => setTypedAnswer(e.target.value)}
                      placeholder="Nhập từ ghép suy đoán..."
                      className="flex-1 px-4 py-2.5 border-2 border-[#e5dfd5] focus:border-[#c9922a] rounded-xl text-sm md:text-base font-bold text-[#2c1a0e] outline-none shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={!typedAnswer.trim()}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider shadow transition-all ${
                        typedAnswer.trim()
                          ? "bg-[#c9922a] hover:bg-[#b8860b] text-white active:scale-95 cursor-pointer"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Kiểm Tra
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#786c5e]">
                      Gợi ý: Nhập có dấu hoặc không dấu đều được chấp nhận
                    </span>
                    <button
                      type="button"
                      onClick={handleRevealAnswer}
                      className="text-xs font-bold text-[#c9922a] hover:underline"
                    >
                      Xem đáp án →
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          )}

          {/* Success / Result Box */}
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
                  Mảnh ghép: "{question.secretWord}"
                </div>
              </div>
              <p className="text-xs md:text-sm leading-relaxed">{question.explanation}</p>
            </div>
          )}

          {/* Banner notification if all 5 completed */}
          {isSubmitted && allAnswered && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <div className="font-bold text-sm">ĐÃ GIẢI MÃ ĐỦ 5 MẢNH GHÉP TỰA ĐỀ!</div>
                  <div className="text-xs text-amber-100">
                    Bấm để mở toàn cảnh KẾT NỘI DUNG BÀI HỌC
                  </div>
                </div>
              </div>
              {onOpenSummary && (
                <button
                  type="button"
                  onClick={() => {
                    handleNext();
                    onOpenSummary();
                  }}
                  className="px-4 py-2 bg-white text-amber-900 font-black text-xs uppercase rounded-lg shadow-md hover:bg-amber-50 active:scale-95 transition-transform whitespace-nowrap ml-2"
                >
                  Xem Kết Luận 📜
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#f2ece4] px-6 py-3.5 border-t border-[#e5dfd5] flex items-center justify-end">
          {isSubmitted ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-full font-bold text-sm bg-[#2c1a0e] hover:bg-[#4a2e18] text-white shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              {allAnswered ? "Đóng & Đến Bảng Tựa Đề 📜" : "Tiếp Tục Vòng Quay 🎡"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-xs font-bold text-gray-600 hover:bg-black/5"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
