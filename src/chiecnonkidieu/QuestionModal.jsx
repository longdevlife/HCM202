import React, { useState, useEffect, useRef } from "react";
import { sounds } from "./SoundEffects";

export default function QuestionModal({
  question,
  isOpen,
  onClose,
  onAnswerSubmit,
  allAnswered = false,
  onOpenSummary,
  onOpenVictory,
  isAlreadyAnswered = false,
}) {
  // State for typed answer (questions 1 & 5)
  const [typedAnswer, setTypedAnswer] = useState("");

  // State for multiple choice (questions 2 & 3)
  const [selectedOptId, setSelectedOptId] = useState(null);

  // State for anagram (question 4)
  const [placedTiles, setPlacedTiles] = useState([]);
  const [availableScrambled, setAvailableScrambled] = useState([]);

  // Submission state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [question, isOpen]);

  useEffect(() => {
    if (question && isOpen) {
      setSelectedOptId(null);
      setIsSubmitted(Boolean(isAlreadyAnswered));
      setIsCorrect(Boolean(isAlreadyAnswered));

      if (question.questionType === "anagram") {
        if (isAlreadyAnswered) {
          const target11 = ["T", "H", "Ờ", "I", "K", "Ì", "Q", "U", "Á", "Đ", "Ộ"];
          setPlacedTiles(target11.map((char, idx) => ({ id: `ans-${char}-${idx}`, char })));
          setAvailableScrambled([]);
        } else if (question.scrambledTiles) {
          setAvailableScrambled(
            question.scrambledTiles.map((char, idx) => ({ id: `${char}-${idx}`, char }))
          );
          setPlacedTiles([]);
        }
      }

      if (question.questionType === "image_riddle") {
        if (isAlreadyAnswered) {
          setTypedAnswer(question.secretWord || "");
        } else {
          setTypedAnswer("");
        }
      }
    }
  }, [question, isOpen, isAlreadyAnswered]);

  // Auto transition to victory celebration screen when all 5 questions are freshly completed
  useEffect(() => {
    if (isOpen && question && !isAlreadyAnswered && isSubmitted && allAnswered && onOpenVictory) {
      const timer = setTimeout(() => {
        onClose();
        onOpenVictory();
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, question, isAlreadyAnswered, isSubmitted, allAnswered, onOpenVictory, onClose]);

  if (!isOpen || !question) return null;

  const normalizeText = (str) =>
    (str || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "i")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Anagram handlers (Question 4)
  const handlePickTile = (tile) => {
    if (isSubmitted) return;
    if (placedTiles.length >= 11) return;

    setAvailableScrambled((prev) => prev.filter((t) => t.id !== tile.id));
    setPlacedTiles((prev) => [...prev, tile]);
  };

  const handleRemoveTile = (index) => {
    if (isSubmitted) return;
    const tileToRemove = placedTiles[index];
    if (!tileToRemove) return;

    setPlacedTiles((prev) => prev.filter((_, idx) => idx !== index));
    setAvailableScrambled((prev) => [...prev, tileToRemove]);
  };

  const handleCheckAnagram = () => {
    if (isSubmitted) return;
    const currentWord = placedTiles.map((t) => t.char).join("");
    const target1 = "THỜIKÌQUÁĐỘ";
    const target2 = "THỜIKỲQUÁĐỘ";

    const isMatch =
      currentWord.toUpperCase() === target1 ||
      currentWord.toUpperCase() === target2 ||
      normalizeText(currentWord) === normalizeText("thoikiquado");

    setIsCorrect(isMatch);
    setIsSubmitted(true);

    if (isMatch) {
      const target11 = ["T", "H", "Ờ", "I", "K", "Ì", "Q", "U", "Á", "Đ", "Ộ"];
      setPlacedTiles(target11.map((char, idx) => ({ id: `correct-${char}-${idx}`, char })));
      setAvailableScrambled([]);
      sounds.playCorrect();
      onAnswerSubmit && onAnswerSubmit(question.id, true);
    } else {
      sounds.playWrong();
      onAnswerSubmit && onAnswerSubmit(question.id, false);
    }
  };

  // Multiple Choice handler (Questions 2 & 3)
  const handleSelectOption = (optId) => {
    if (isSubmitted) return;
    setSelectedOptId(optId);
  };

  const handleCheckMultipleChoice = () => {
    if (!selectedOptId || isSubmitted) return;
    const opt = question.options.find((o) => o.id === selectedOptId);
    const correct = Boolean(opt?.isCorrect);

    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      sounds.playCorrect();
      onAnswerSubmit && onAnswerSubmit(question.id, true, opt);
    } else {
      sounds.playWrong();
      onAnswerSubmit && onAnswerSubmit(question.id, false, opt);
    }
  };

  // Typed Answer handler (Questions 1 & 5)
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
      setTypedAnswer(question.secretWord || typedAnswer);
      sounds.playCorrect();
      onAnswerSubmit && onAnswerSubmit(question.id, true);
    } else {
      sounds.playWrong();
      onAnswerSubmit && onAnswerSubmit(question.id, false);
    }
  };

  // Reveal Answer button
  const handleRevealAnswer = () => {
    if (isSubmitted) return;
    setIsCorrect(true);
    setIsSubmitted(true);
    sounds.playCorrect();

    if (question.questionType === "anagram") {
      const target11 = ["T", "H", "Ờ", "I", "K", "Ì", "Q", "U", "Á", "Đ", "Ộ"];
      setPlacedTiles(target11.map((char, idx) => ({ id: `reveal-${char}-${idx}`, char })));
      setAvailableScrambled([]);
    } else if (question.questionType === "image_riddle") {
      setTypedAnswer(question.secretWord || "");
    }

    onAnswerSubmit && onAnswerSubmit(question.id, true);
  };

  const handleNext = () => {
    onClose();
    if (allAnswered && onOpenVictory) {
      onOpenVictory();
    }
  };

  const handleModalClose = () => {
    onClose();
    if (allAnswered && onOpenVictory) {
      onOpenVictory();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="relative w-[95vw] md:w-[75vw] max-w-[1100px] max-h-[92vh] bg-[#faf8f5] text-[#2c1a0e] rounded-3xl shadow-2xl border-2 border-[#c9922a]/60 overflow-hidden flex flex-col my-auto"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-[#2c1a0e] via-[#4a2e18] to-[#2c1a0e] text-white px-6 md:px-8 py-3.5 md:py-4 flex items-center justify-between border-b border-[#c9922a]/50">
          <div className="flex items-center space-x-3.5">
            <span className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#c9922a] text-[#2c1a0e] font-black flex items-center justify-center text-base md:text-lg shadow-md">
              💡
            </span>
            <div>
              <div className="text-xs tracking-widest uppercase text-[#fef08a] font-bold">
                {question.typeTag}
              </div>
              <div
                className="text-lg md:text-2xl font-bold text-white tracking-wide"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {question.title}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            aria-label="Đóng"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg cursor-pointer active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div ref={bodyRef} className="p-4 md:p-6 overflow-y-auto space-y-3.5 md:space-y-4 flex-1">
          {/* CÂU 1: 2 ẢNH THẬT (KHÔNG CHÚ THÍCH ẢNH) */}
          {question.id === "q1" && question.visualImages && (
            <div className="flex items-center justify-center gap-3 md:gap-6 p-3 md:p-4 bg-white rounded-2xl border border-[#e5dfd5] shadow-sm">
              {/* Hình 1 */}
              <div className="flex-1 aspect-[16/10] max-h-[170px] md:max-h-[210px] rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-100">
                <img
                  src={question.visualImages[0].src}
                  alt="Hình 1"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Dấu cộng */}
              <div className="text-3xl md:text-5xl font-black text-[#c9922a] select-none px-1">
                +
              </div>

              {/* Hình 2 */}
              <div className="flex-1 aspect-[16/10] max-h-[170px] md:max-h-[210px] rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-100 relative">
                <img
                  src={question.visualImages[1].src}
                  alt="Hình 2"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-red-600 text-white font-black text-xs md:text-sm px-2 py-0.5 rounded shadow-md">
                  + (´)
                </div>
              </div>
            </div>
          )}

          {/* CÂU 5: 4 ẢNH THẬT LIÊN HOÀN (KHÔNG CHÚ THÍCH ẢNH) */}
          {question.id === "q5" && question.visualImages && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-2xl border border-[#e5dfd5] shadow-sm">
              {question.visualImages.map((img, idx) => (
                <div
                  key={idx}
                  className="w-full aspect-[4/3] max-h-[125px] md:max-h-[150px] rounded-xl overflow-hidden shadow border border-gray-200 bg-gray-100"
                >
                  <img
                    src={img.src}
                    alt={`Hình ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Question Text */}
          <div className="p-3 md:p-4 bg-white rounded-2xl shadow-sm border border-[#e5dfd5]">
            <h3
              className="text-base md:text-lg lg:text-xl font-bold text-[#2c1a0e] leading-snug whitespace-pre-line"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {question.questionType === "anagram"
                ? question.question.split("\n")[0]
                : question.question}
            </h3>
          </div>

          {/* CÂU 2 & CÂU 3: DẠNG TRẮC NGHIỆM (A, B, C, D) */}
          {question.questionType === "multiple_choice" && question.options && (
            <div className="space-y-4 md:space-y-5 p-4 md:p-6 bg-white rounded-2xl border border-[#e5dfd5] shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
                {question.options.map((opt) => {
                  const isChosen = selectedOptId === opt.id;
                  let cardClass =
                    "relative flex items-center gap-3.5 p-3.5 md:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ";

                  if (!isSubmitted) {
                    if (isChosen) {
                      cardClass +=
                        "bg-[#fff9ea] border-[#c9922a] shadow-md ring-2 ring-[#c9922a]/40 scale-[1.01]";
                    } else {
                      cardClass +=
                        "bg-white border-[#e5dfd5] hover:border-[#c9922a]/70 hover:bg-[#faf6ee]";
                    }
                  } else {
                    if (opt.isCorrect) {
                      cardClass +=
                        "bg-[#ecfdf5] border-[#10b981] text-[#065f46] shadow-sm font-bold";
                    } else if (isChosen && !opt.isCorrect) {
                      cardClass +=
                        "bg-[#fef2f2] border-[#ef4444] text-[#991b1b] shadow-sm";
                    } else {
                      cardClass += "bg-gray-50 border-gray-200 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(opt.id)}
                      className={cardClass}
                    >
                      <span
                        className={`w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-xl font-bold text-sm md:text-base flex items-center justify-center transition-colors ${
                          isSubmitted && opt.isCorrect
                            ? "bg-[#10b981] text-white"
                            : isSubmitted && isChosen && !opt.isCorrect
                            ? "bg-[#ef4444] text-white"
                            : isChosen
                            ? "bg-[#c9922a] text-white"
                            : "bg-[#2c1a0e]/10 text-[#2c1a0e]"
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="flex-1 text-base md:text-lg font-medium leading-snug">
                        {opt.text}
                      </span>
                      {isSubmitted && opt.isCorrect && (
                        <span className="text-emerald-600 font-bold text-sm md:text-base ml-1">✓ Đúng</span>
                      )}
                      {isSubmitted && isChosen && !opt.isCorrect && (
                        <span className="text-rose-600 font-bold text-sm md:text-base ml-1">✗ Sai</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {!isSubmitted && (
                <div className="flex items-center justify-end pt-2">
                  <button
                    type="button"
                    disabled={!selectedOptId}
                    onClick={handleCheckMultipleChoice}
                    className={`px-8 py-3 rounded-xl font-bold text-sm md:text-base uppercase tracking-wider shadow-md transition-all ${
                      selectedOptId
                        ? "bg-[#c9922a] hover:bg-[#b8860b] text-white hover:scale-105 active:scale-95 cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Xác Nhận Đáp Án
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CÂU 4: XẾP CHỮ VÀO DẤU GẠCH CHÂN (GIỮ NGUYÊN) */}
          {question.questionType === "anagram" && (
            <div className="space-y-4 p-4 md:p-6 bg-white rounded-2xl border border-[#e5dfd5] shadow-sm">
              {/* Dãy 11 chữ cái xáo trộn */}
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 p-2.5 md:p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
                {availableScrambled.length > 0 ? (
                  availableScrambled.map((tile) => (
                    <button
                      key={tile.id}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handlePickTile(tile)}
                      className="w-9 h-10 md:w-11 md:h-12 rounded-xl bg-white hover:bg-amber-100 active:scale-95 border-2 border-amber-400 text-[#2c1a0e] font-black text-base md:text-xl flex items-center justify-center shadow-md transition-all cursor-pointer"
                    >
                      {tile.char}
                    </button>
                  ))
                ) : (
                  <span className="text-xs md:text-sm text-amber-800 italic py-1 font-medium">
                    Đã xếp toàn bộ 11 chữ cái vào các ô gạch chân bên dưới!
                  </span>
                )}
              </div>

              {/* Hàng ô gạch chân: THỜI (4) - KÌ (2) - QUÁ (3) - ĐỘ (2) */}
              <div className="p-3.5 md:p-4 bg-gradient-to-b from-[#faf8f5] to-[#f4eee6] rounded-2xl border border-[#c9922a]/30 shadow-inner">
                <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-4">
                  {/* THỜI */}
                  <div className="flex gap-1 md:gap-1.5">
                    {[0, 1, 2, 3].map((slotIdx) => {
                      const tile = placedTiles[slotIdx];
                      return (
                        <div
                          key={slotIdx}
                          onClick={() => handleRemoveTile(slotIdx)}
                          className={`w-8 h-10 md:w-11 md:h-12 rounded-xl border-b-4 flex items-center justify-center font-black text-base md:text-xl transition-all select-none ${
                            isSubmitted ? "cursor-default" : "cursor-pointer"
                          } ${
                            tile
                              ? isSubmitted && isCorrect
                                ? "bg-[#ecfdf5] border-emerald-500 text-emerald-800 shadow-sm scale-105"
                                : "bg-white border-[#c9922a] text-[#2c1a0e] shadow-sm scale-105"
                              : "bg-black/5 border-gray-400 text-transparent"
                          }`}
                        >
                          {tile ? tile.char : "_"}
                        </div>
                      );
                    })}
                  </div>

                  {/* KÌ */}
                  <div className="flex gap-1 md:gap-1.5">
                    {[4, 5].map((slotIdx) => {
                      const tile = placedTiles[slotIdx];
                      return (
                        <div
                          key={slotIdx}
                          onClick={() => handleRemoveTile(slotIdx)}
                          className={`w-8 h-10 md:w-11 md:h-12 rounded-xl border-b-4 flex items-center justify-center font-black text-base md:text-xl transition-all select-none ${
                            isSubmitted ? "cursor-default" : "cursor-pointer"
                          } ${
                            tile
                              ? isSubmitted && isCorrect
                                ? "bg-[#ecfdf5] border-emerald-500 text-emerald-800 shadow-sm scale-105"
                                : "bg-white border-[#c9922a] text-[#2c1a0e] shadow-sm scale-105"
                              : "bg-black/5 border-gray-400 text-transparent"
                          }`}
                        >
                          {tile ? tile.char : "_"}
                        </div>
                      );
                    })}
                  </div>

                  {/* QUÁ */}
                  <div className="flex gap-1 md:gap-1.5">
                    {[6, 7, 8].map((slotIdx) => {
                      const tile = placedTiles[slotIdx];
                      return (
                        <div
                          key={slotIdx}
                          onClick={() => handleRemoveTile(slotIdx)}
                          className={`w-8 h-10 md:w-11 md:h-12 rounded-xl border-b-4 flex items-center justify-center font-black text-base md:text-xl transition-all select-none ${
                            isSubmitted ? "cursor-default" : "cursor-pointer"
                          } ${
                            tile
                              ? isSubmitted && isCorrect
                                ? "bg-[#ecfdf5] border-emerald-500 text-emerald-800 shadow-sm scale-105"
                                : "bg-white border-[#c9922a] text-[#2c1a0e] shadow-sm scale-105"
                              : "bg-black/5 border-gray-400 text-transparent"
                          }`}
                        >
                          {tile ? tile.char : "_"}
                        </div>
                      );
                    })}
                  </div>

                  {/* ĐỘ */}
                  <div className="flex gap-1 md:gap-1.5">
                    {[9, 10].map((slotIdx) => {
                      const tile = placedTiles[slotIdx];
                      return (
                        <div
                          key={slotIdx}
                          onClick={() => handleRemoveTile(slotIdx)}
                          className={`w-8 h-10 md:w-11 md:h-12 rounded-xl border-b-4 flex items-center justify-center font-black text-base md:text-xl transition-all select-none ${
                            isSubmitted ? "cursor-default" : "cursor-pointer"
                          } ${
                            tile
                              ? isSubmitted && isCorrect
                                ? "bg-[#ecfdf5] border-emerald-500 text-emerald-800 shadow-sm scale-105"
                                : "bg-white border-[#c9922a] text-[#2c1a0e] shadow-sm scale-105"
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
                <div className="flex items-center justify-end gap-3 pt-2">
                  {placedTiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvailableScrambled(
                          question.scrambledTiles.map((char, idx) => ({ id: `${char}-${idx}`, char }))
                        );
                        setPlacedTiles([]);
                      }}
                      className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
                    >
                      Xếp lại
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRevealAnswer}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold border border-[#c9922a] text-[#855318] hover:bg-amber-50 cursor-pointer"
                  >
                    Xem đáp án
                  </button>
                  <button
                    type="button"
                    disabled={placedTiles.length < 11}
                    onClick={handleCheckAnagram}
                    className={`px-7 py-3 rounded-xl font-bold text-sm md:text-base uppercase tracking-wider shadow-md transition-all ${
                      placedTiles.length >= 11
                        ? "bg-[#c9922a] hover:bg-[#b8860b] text-white hover:scale-105 active:scale-95 cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Kiểm Tra
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CÂU 1 & CÂU 5: Ô TRẢ LỜI ĐIỀN TỪ (IMAGE RIDDLE) */}
          {question.questionType === "image_riddle" && (() => {
            const riddleWords = (question.secretWord || "").trim().split(/\s+/);
            const typedLetters = (typedAnswer || "").replace(/\s+/g, "").split("");
            let letterCounter = 0;

            return (
              <div className="space-y-3 p-3.5 md:p-4 bg-white rounded-2xl border border-[#e5dfd5] shadow-sm">
                {/* Hàng ô chữ điền đáp án */}
                <div className="p-3 sm:p-3.5 bg-gradient-to-b from-[#faf8f5] to-[#f4eee6] rounded-2xl border border-[#c9922a]/30 shadow-inner">
                  <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 md:gap-5">
                    {riddleWords.map((word, wIdx) => {
                      const chars = word.split("");
                      return (
                        <div key={wIdx} className="flex gap-1 sm:gap-1.5">
                          {chars.map((targetChar, cIdx) => {
                            const slotIdx = letterCounter++;
                            let displayedChar = "";
                            let isFilled = false;

                            if (isSubmitted) {
                              displayedChar = targetChar.toUpperCase();
                              isFilled = true;
                            } else if (slotIdx < typedLetters.length) {
                              displayedChar = typedLetters[slotIdx].toUpperCase();
                              isFilled = true;
                            }

                            return (
                              <div
                                key={cIdx}
                                className={`w-8 h-10 sm:w-10 sm:h-12 md:w-11 md:h-13 rounded-xl border-b-4 flex items-center justify-center font-black text-sm sm:text-base md:text-lg transition-all select-none ${
                                  isFilled
                                    ? isSubmitted && isCorrect
                                      ? "bg-[#ecfdf5] border-emerald-500 text-emerald-800 shadow-sm scale-105"
                                      : "bg-white border-[#c9922a] text-[#2c1a0e] shadow-sm scale-105"
                                    : "bg-black/5 border-gray-400 text-transparent"
                                }`}
                              >
                                {displayedChar || "_"}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form Input */}
                {!isSubmitted ? (
                  <form onSubmit={handleCheckTyped} className="space-y-2.5">
                    <div className="flex gap-2.5">
                      <input
                        type="text"
                        value={typedAnswer}
                        onChange={(e) => setTypedAnswer(e.target.value)}
                        placeholder="Nhập từ ghép..."
                        className="flex-1 px-4 py-2.5 md:px-5 md:py-3 border-2 border-[#e5dfd5] focus:border-[#c9922a] rounded-xl text-sm md:text-base font-bold text-[#2c1a0e] outline-none shadow-inner"
                      />
                      <button
                        type="submit"
                        disabled={!typedAnswer.trim()}
                        className={`px-6 py-2.5 md:px-7 md:py-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider shadow-md transition-all ${
                          typedAnswer.trim()
                            ? "bg-[#c9922a] hover:bg-[#b8860b] text-white active:scale-95 cursor-pointer"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Kiểm Tra
                      </button>
                    </div>

                    <div className="flex items-center justify-end pt-0.5">
                      <button
                        type="button"
                        onClick={handleRevealAnswer}
                        className="text-xs md:text-sm font-bold text-[#c9922a] hover:underline cursor-pointer"
                      >
                        Xem đáp án →
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex gap-2.5 pt-0.5">
                    <input
                      type="text"
                      disabled
                      value={typedAnswer || question.secretWord}
                      className="flex-1 px-4 py-2.5 md:px-5 md:py-3 border-2 border-emerald-400 bg-emerald-50/60 rounded-xl text-sm md:text-base font-bold text-emerald-900 outline-none shadow-inner cursor-not-allowed"
                    />
                    <div className="px-4 py-2.5 md:px-5 md:py-3 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider bg-emerald-600 text-white flex items-center justify-center shadow select-none">
                      ✓ Đáp Án
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Success / Result Box */}
          {isSubmitted && (
            <div
              className={`p-5 md:p-6 rounded-2xl border space-y-2.5 animate-fade-in ${
                isCorrect
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : "bg-rose-50 border-rose-300 text-rose-950"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-black text-base md:text-lg flex items-center gap-2">
                  <span>{isCorrect ? "🎯 CHÍNH XÁC!" : "💡 ĐÁP ÁN ĐÚNG:"}</span>
                </div>
                <div className="px-4 py-1.5 bg-white rounded-full border border-current text-xs md:text-sm font-black uppercase tracking-wider shadow-sm">
                  Đáp án: "{question.secretWord}"
                </div>
              </div>
              <p className="text-sm md:text-base leading-relaxed">{question.explanation}</p>
            </div>
          )}

          {/* All Completed Banner */}
          {isSubmitted && allAnswered && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3.5">
                <span className="text-3xl">🎉</span>
                <div>
                  <div className="font-bold text-base">ĐÃ HOÀN THÀNH TẤT CẢ CÂU ĐỐ!</div>
                  <div className="text-xs md:text-sm text-amber-100">
                    Bấm để mở màn chúc mừng & tựa đề bài học
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-white text-amber-900 font-black text-xs md:text-sm uppercase rounded-xl shadow-md hover:bg-amber-50 active:scale-95 transition-transform whitespace-nowrap ml-2 cursor-pointer"
              >
                Màn Chúc Mừng 🎉
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#f2ece4] px-6 md:px-8 py-4 border-t border-[#e5dfd5] flex items-center justify-end">
          {isSubmitted ? (
            <button
              type="button"
              onClick={handleNext}
              className={`px-8 py-3.5 rounded-full font-bold text-base md:text-lg shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                allAnswered
                  ? "bg-gradient-to-r from-[#d97706] to-[#b45309] text-white ring-2 ring-[#fde68a] animate-pulse"
                  : "bg-[#2c1a0e] hover:bg-[#4a2e18] text-white"
              }`}
            >
              {allAnswered ? "🎉 Xem Màn Chúc Mừng 🎉" : "Tiếp Tục Vòng Quay 🎡"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-black/5 cursor-pointer"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
