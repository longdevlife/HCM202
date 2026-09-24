import React, { useEffect } from "react";

export default function GameRulesModal({ isOpen, onClose }) {
  // Đóng modal khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      {/* Khung Modal Dạng Hình Chữ Nhật Ngang Rộng Rãi Cân Đối */}
      <div
        className="relative w-full max-w-5xl xl:max-w-6xl bg-gradient-to-b from-[#2b170c] via-[#1d0f07] to-[#120803] text-[#eee2ca] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95),_0_0_40px_rgba(201,146,42,0.25)] border-2 border-[#c9922a] overflow-hidden flex flex-col my-auto max-h-[96vh]"
        style={{ fontFamily: "'Inter', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER CĂN GIỮA TRANG TRỌNG ================= */}
        <div className="relative bg-gradient-to-r from-[#201007] via-[#3d2212] to-[#201007] text-white px-6 sm:px-10 py-3.5 sm:py-4 border-b-2 border-[#c9922a]/70 shadow-md text-center">
          <div className="flex items-center justify-center gap-2.5">
            <span className="text-2xl sm:text-3xl">📜</span>
            <h2
              className="text-lg sm:text-2xl md:text-3xl font-black text-[#fef08a] tracking-wide uppercase leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              THỂ LỆ TRÒ CHƠI: TRUY TÌM MẢNH GHÉP
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-[#dbc39c]/90 uppercase tracking-widest font-semibold mt-1">
            Quy tắc thi đấu &amp; cách tính điểm dành cho các nhóm
          </p>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thể lệ"
            className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#fef08a] hover:text-white flex items-center justify-center transition-colors text-lg cursor-pointer border border-[#c9922a]/40"
          >
            ✕
          </button>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* HÀNG 1: 2 CỘT CÂN ĐỐI (VÒNG 1 VÀ VÒNG 2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {/* CỘT 1: VÒNG 1: TRUY TÌM MẢNH GHÉP */}
            <div className="rounded-2xl bg-gradient-to-b from-[#381f0f]/95 via-[#29150a]/95 to-[#1a0c04]/95 border-2 border-[#c9922a]/60 shadow-lg flex flex-col justify-between overflow-hidden">
              {/* Header Cột Vòng 1 */}
              <div className="bg-gradient-to-r from-[#b45309] to-[#d97706] text-white px-4 py-2.5 border-b border-[#fde68a]/40 flex items-center justify-center gap-2 shadow-sm">
                <span className="text-lg">🧩</span>
                <h3
                  className="text-sm sm:text-base font-black tracking-wider uppercase text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  VÒNG 1: TRUY TÌM MẢNH GHÉP
                </h3>
              </div>

              {/* Nội dung Vòng 1 */}
              <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5 text-xs sm:text-sm text-[#eee2ca] leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="text-amber-400 font-black text-base shrink-0">●</span>
                    <p>
                      Trong mỗi mảnh ghép sẽ có <strong className="text-[#fef08a]">1 câu hỏi</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-black text-base shrink-0">➜</span>
                    <p>
                      Mỗi câu trả lời đúng:{" "}
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-600/90 text-white font-black text-xs sm:text-sm border border-emerald-400 shadow-xs whitespace-nowrap">
                        10 điểm / câu
                      </span>
                    </p>
                  </div>
                </div>

                {/* Hộp quy định hình thức trả lời */}
                <div className="p-3.5 rounded-xl bg-[#221106] border-2 border-[#eab308]/70 text-xs shadow-inner space-y-2">
                  <div className="font-black text-[#fde68a] flex items-center gap-1.5 uppercase tracking-wide text-xs sm:text-sm">
                    <span>📢</span>
                    <span>Quy định hình thức trả lời:</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-400/50 text-center">
                    <p className="text-amber-200 text-xs sm:text-sm font-semibold">
                      Trả lời bằng hình thức:
                    </p>
                    <p className="text-[#fef08a] font-black text-xs sm:text-sm uppercase tracking-wide mt-0.5">
                      ĐƯA CẢ SỐ (đại diện cho tên nhóm) + ĐÁP ÁN
                    </p>
                  </div>
                  <div className="text-[11px] sm:text-xs text-amber-200/80 italic text-center">
                    👉 Ví dụ: Nhóm 1 chọn A đưa &quot;<strong>1A</strong>&quot; · Nhóm 3 chọn C đưa &quot;<strong>3C</strong>&quot;.
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT 2: VÒNG 2: SẮP XẾP MẢNH GHÉP + ĐOÁN TỪ KHOÁ */}
            <div className="rounded-2xl bg-gradient-to-b from-[#1b253b]/95 via-[#121929]/95 to-[#0b101c]/95 border-2 border-[#3b82f6]/60 shadow-lg flex flex-col justify-between overflow-hidden">
              {/* Header Cột Vòng 2 */}
              <div className="bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white px-4 py-2.5 border-b border-blue-300/40 flex items-center justify-center gap-2 shadow-sm">
                <span className="text-lg">🖼️</span>
                <h3
                  className="text-sm sm:text-base font-black tracking-wider uppercase text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  VÒNG 2: SẮP XẾP MẢNH GHÉP + ĐOÁN TỪ KHOÁ
                </h3>
              </div>

              {/* Nội dung Vòng 2 */}
              <div className="p-4 sm:p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5 text-xs sm:text-sm text-[#eee2ca] leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="text-blue-400 font-black text-base shrink-0">●</span>
                    <p>
                      <strong className="text-blue-200">Sắp xếp mảnh ghép thành hình</strong> hoàn chỉnh theo sơ đồ 3×3.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-black text-base shrink-0">➜</span>
                    <p>
                      Sắp xếp xong + Trả lời đúng câu hỏi ở dưới bức hình:{" "}
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-600/90 text-white font-black text-xs sm:text-sm border border-blue-400 shadow-xs whitespace-nowrap">
                        Cộng 50 điểm
                      </span>
                    </p>
                  </div>
                </div>

                {/* Hộp điểm tốc độ cho 3 nhóm */}
                <div className="p-3 rounded-xl bg-[#09101f] border-2 border-blue-400/50 text-xs shadow-inner space-y-2">
                  <div className="font-black text-[#93c5fd] flex items-center gap-1.5 uppercase tracking-wide text-xs sm:text-sm">
                    <span>⚡</span>
                    <span>Điểm tốc độ dành cho 3 nhóm hoàn thành nhanh nhất :</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Hạng 1 */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gradient-to-b from-[#78350f] to-[#451a03] border-2 border-amber-400/80 text-center shadow-sm">
                      <div className="font-bold text-amber-200 text-[11px] sm:text-xs flex items-center gap-1">
                        <span>🥇</span>
                        <span>Nhanh nhất:</span>
                      </div>
                      <div className="font-black text-xs sm:text-base text-[#fef08a] mt-0.5 whitespace-nowrap">
                        +20 điểm
                      </div>
                    </div>

                    {/* Hạng 2 */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gradient-to-b from-[#334155] to-[#1e293b] border-2 border-slate-300/80 text-center shadow-sm">
                      <div className="font-bold text-slate-200 text-[11px] sm:text-xs flex items-center gap-1">
                        <span>🥈</span>
                        <span>Nhanh thứ hai:</span>
                      </div>
                      <div className="font-black text-xs sm:text-base text-white mt-0.5 whitespace-nowrap">
                        +15 điểm
                      </div>
                    </div>

                    {/* Hạng 3 */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gradient-to-b from-[#7c2d12] to-[#431407] border-2 border-orange-400/80 text-center shadow-sm">
                      <div className="font-bold text-orange-200 text-[11px] sm:text-xs flex items-center gap-1">
                        <span>🥉</span>
                        <span>Nhanh thứ ba:</span>
                      </div>
                      <div className="font-black text-xs sm:text-base text-orange-200 mt-0.5 whitespace-nowrap">
                        +10 điểm
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] sm:text-xs text-blue-200/80 italic text-center pt-0.5">
                    ⚠️ Các nhóm còn lại không được cộng điểm tốc độ.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HÀNG 2: BANNER NGANG DƯỚI - TỔNG KẾT ĐIỂM & CHIẾN THẮNG */}
          <div className="rounded-2xl bg-gradient-to-r from-[#3a200f] via-[#522d15] to-[#3a200f] border-2 border-[#c9922a] p-4 sm:p-5 shadow-xl text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">🏆</span>
              <div
                className="text-xs sm:text-sm font-black text-[#fef08a] uppercase tracking-wider"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                CÔNG THỨC TÍNH ĐIỂM TỔNG KẾT
              </div>
            </div>

            <div className="text-xs sm:text-sm md:text-base font-bold text-[#eee2ca]">
              Điểm cuối cùng mỗi nhóm = Tổng điểm cả hai vòng chơi
            </div>

            <div className="text-xs sm:text-sm text-amber-200 font-semibold bg-[#221106]/80 py-1 px-3 rounded-full inline-block border border-amber-500/40">
              ( = <span className="text-emerald-400 font-black">Điểm trả lời đúng</span> + <span className="text-blue-300 font-black">Điểm đoán hình</span> + <span className="text-amber-400 font-black">Điểm tốc độ</span>. )
            </div>

            <div className="pt-1">
              <p className="text-xs sm:text-sm md:text-base font-black text-[#fef08a] uppercase tracking-wide flex items-center justify-center gap-2">
                <span>👑</span>
                <span>→ Nhóm có tổng điểm cao nhất sau khi kết thúc 2 vòng của trò chơi sẽ giành chiến thắng.</span>
              </p>
            </div>
          </div>
        </div>

        {/* ================= FOOTER NGANG ================= */}
        <div className="bg-[#190c04] px-6 sm:px-8 py-3 sm:py-3.5 border-t border-[#c9922a]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] sm:text-xs text-[#dbc39c]/90 italic text-center sm:text-left">
            
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-2.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] text-white shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-[#fde68a]"
          >
           BẮT ĐẦU CHƠI! 
          </button>
        </div>
      </div>
    </div>
  );
}
