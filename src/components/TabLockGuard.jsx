import React, { useState, useEffect } from "react";
import "../chiecnonkidieu/chiecnonkidieu.css";

export default function TabLockGuard({
  tabId,
  tabTitle,
  gameSubtitle,
  password = "hostbygroup3",
  onBackToOverview,
  children,
}) {
  const storageKey = `tab_lock_${tabId}_unlocked`;

  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(storageKey) === "true";
  });

  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [unlockBoth, setUnlockBoth] = useState(false);

  // Sync state if another tab or event changed lock
  useEffect(() => {
    const handleLockChanged = () => {
      setIsUnlocked(sessionStorage.getItem(storageKey) === "true");
    };
    window.addEventListener("tab-lock-changed", handleLockChanged);
    return () => {
      window.removeEventListener("tab-lock-changed", handleLockChanged);
    };
  }, [storageKey]);

  const handleUnlock = (e) => {
    e?.preventDefault();
    const entered = passwordInput.trim().toLowerCase();
    const correct = (password || "hostbygroup3").trim().toLowerCase();

    if (entered === correct) {
      sessionStorage.setItem(storageKey, "true");

      if (unlockBoth) {
        sessionStorage.setItem("tab_lock_chiecnon_unlocked", "true");
        sessionStorage.setItem("tab_lock_truytimmanhghep_unlocked", "true");
      }

      setIsUnlocked(true);
      setErrorMsg("");
      setPasswordInput("");
      window.dispatchEvent(new CustomEvent("tab-lock-changed"));

      if (tabId === "truytimmanhghep") {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("open-truytimmanhghep-rules"));
        }, 150);
      }
    } else {
      setErrorMsg("Mật khẩu không chính xác! Vui lòng thử lại.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleLockAgain = () => {
    sessionStorage.removeItem(storageKey);
    setIsUnlocked(false);
    setErrorMsg("");
    setPasswordInput("");
    window.dispatchEvent(new CustomEvent("tab-lock-changed"));
  };

  if (isUnlocked) {
    return (
      <div className="relative w-full">
        {/* Host quick lock indicator button */}
        <div className="fixed top-24 right-4 md:right-8 z-40">
          <button
            type="button"
            onClick={handleLockAgain}
            title="Bấm để khóa lại tab này (chỉ Host có mật khẩu mới vào lại được)"
            className="group bg-[#1e1a14]/90 hover:bg-[#2e261e] border border-[#c3a47b]/40 hover:border-[#c3a47b] text-[#eee2ca] hover:text-[#fef08a] text-xs font-bold py-1.5 px-3.5 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <span className="text-amber-400 group-hover:scale-110 transition-transform">🔒</span>
            <span>Khóa tab</span>
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="chiecnon-game-container min-h-screen text-[#eee2ca] pt-28 pb-16 px-4 relative overflow-hidden flex flex-col items-center justify-center">
      <style>{`
        @keyframes lockShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .lock-shake {
          animation: lockShake 0.4s ease-in-out;
        }
      `}</style>

      {/* Texture grain overlay */}
      <div className="chiecnon-grain pointer-events-none"></div>

      {/* Decorative Glows */}
      <div className="absolute top-12 -left-20 w-96 h-96 rounded-full bg-[#c3a47b]/15 filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full bg-[#a96346]/12 filter blur-3xl pointer-events-none"></div>

      <div className={`max-w-md w-full relative z-10 transition-transform ${isShaking ? "lock-shake" : ""}`}>
        <div
          className="p-8 sm:p-10 rounded-3xl border border-[#c3a47b]/40 backdrop-blur-xl text-center relative overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(145deg, rgba(35, 30, 24, 0.96), rgba(20, 17, 14, 0.98))",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(238, 226, 202, 0.12)",
          }}
        >
          {/* Lock Icon */}
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-tr from-[#92400e]/30 via-[#d97706]/20 to-[#f59e0b]/10 border border-[#f59e0b]/40 flex items-center justify-center text-4xl shadow-inner shadow-[#d97706]/20">
            <span className="drop-shadow-md">🔒</span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3a382b]/80 border border-[#c3a47b]/40 text-[#fef08a] text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-3">
            <span>🛡️ KHU VỰC DÀNH CHO HOST / BAN TỔ CHỨC</span>
          </div>

          {/* Heading */}
          <h2
            className="text-2xl sm:text-3xl font-black text-[#eee2ca] uppercase tracking-wide mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {tabTitle}
          </h2>

          <p className="text-xs sm:text-sm text-[#c5b79e] mb-6 leading-relaxed">
            {gameSubtitle || "Tab này hiện đang được khóa bảo vệ. Vui lòng nhập mật khẩu Host để mở khóa phần chơi."}
          </p>

          {/* Form */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="Nhập mật khẩu Host..."
                autoFocus
                className="w-full bg-[#15120e] border border-[#c3a47b]/40 focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/30 rounded-xl px-4 py-3.5 pr-12 text-[#eee2ca] placeholder-[#7d7160] text-sm font-medium tracking-wide outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a89985] hover:text-[#eee2ca] text-base p-1 transition-colors cursor-pointer"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Optional checkbox to unlock both */}
            <label className="flex items-center justify-center gap-2 text-xs text-[#c5b79e] cursor-pointer select-none hover:text-[#eee2ca] transition-colors py-1">
              <input
                type="checkbox"
                checked={unlockBoth}
                onChange={(e) => setUnlockBoth(e.target.checked)}
                className="rounded border-[#c3a47b]/40 bg-[#15120e] text-[#d97706] focus:ring-[#d97706] cursor-pointer"
              />
              <span>Mở khóa cho cả 2 tab trò chơi cùng lúc</span>
            </label>

            {errorMsg && (
              <div className="text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-800/60 rounded-xl py-2.5 px-3.5 animate-fade-in flex items-center justify-center gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#f59e0b] hover:brightness-110 text-white cursor-pointer active:scale-95 transition-all shadow-[#d97706]/30 border border-[#fef08a]/30"
            >
              <span>🔓</span>
              <span>Mở Khóa Trò Chơi</span>
            </button>
          </form>

          {/* Back to overview */}
          {onBackToOverview && (
            <div className="mt-6 pt-5 border-t border-[#c3a47b]/20">
              <button
                type="button"
                onClick={onBackToOverview}
                className="text-xs font-medium text-[#a89985] hover:text-[#eee2ca] transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <span>←</span>
                <span>Quay lại Trang Tổng Quan</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
