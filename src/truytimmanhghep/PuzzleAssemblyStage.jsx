import React, { useState } from "react";
import {
  FULL_IMAGE_SRC,
  PUZZLE_GRID_LAYOUT,
  ALL_PUZZLE_QUESTIONS,
} from "./puzzleData";
import { sounds } from "../chiecnonkidieu/SoundEffects";

/**
 * Màn hình Ghép Tranh & Khám Phá Quy Luật (Thiết kế Sang Trọng, To Lớn, Chuẩn Trình Chiếu)
 *
 * State 1 (Hình 1 đẹp mắt - Chưa xem đáp án):
 * - Bảng 3x3 kích thước lớn với các ô trống rãnh chìm viền mạ vàng tinh tế
 * - Kế bên có khung tranh đối chiếu mạ vàng có thể bấm phóng to
 * - Phía dưới là khung câu hỏi sơn mài mạ vàng lộng lẫy với biểu tượng dấu hỏi 3D ruby
 * - Nút bấm "XEM ĐÁP ÁN" rực rỡ ánh sáng
 *
 * State 2 (Hình 2 đẹp mắt - Khi bấm xem đáp án):
 * - Toàn bộ 9 mảnh ghép xuất hiện mượt mà tại đúng 9 vị trí:
 *   [ 9 ] [ 1 ] [ 2 ]
 *   [ 4 ] [ 6 ] [ 8 ]
 *   [ 5 ] [ 7 ] [ 3 ]
 * - Mỗi mảnh ghép được đính huy hiệu tròn màu hồng phấn viền vàng kim 3D cực đẹp
 * - Biểu tượng dấu tick xanh ngọc lục bảo phát sáng
 * - Đáp án nổi bật với chữ to rõ ràng, font chữ chuẩn tiếng Việt sắc nét
 */
export default function PuzzleAssemblyStage({
  onRestart,
  onBackToQuestions,
  completedCount = 9,
}) {
  // Trạng thái hiển thị đáp án (false = Trạng thái ô trống, true = Trạng thái ghép tranh & đáp án)
  const [isRevealed, setIsRevealed] = useState(false);

  // Cho phép người dùng hoặc giáo viên bấm ghép từng ô thủ công nếu muốn
  const [manuallyPlaced, setManuallyPlaced] = useState({});

  // Chế độ toàn màn hình trình chiếu
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Bật/tắt xem hình phóng to của tranh đối chiếu
  const [isPreviewZoom, setIsPreviewZoom] = useState(false);

  const handleToggleReveal = () => {
    if (!isRevealed) {
      sounds.playFanfare();
      setIsRevealed(true);
    } else {
      setIsRevealed(false);
    }
  };

  // Ghép hoặc gỡ 1 ô thủ công
  const handleToggleCell = (qNum) => {
    if (isRevealed) return;
    setManuallyPlaced((prev) => {
      const next = { ...prev, [qNum]: !prev[qNum] };
      const placedCount = Object.values(next).filter(Boolean).length;
      if (placedCount >= 9) {
        sounds.playFanfare();
        setIsRevealed(true);
      } else {
        sounds.playLand();
      }
      return next;
    });
  };

  return (
    <div
      className={`w-full flex flex-col items-center animate-fade-in ${
        isFullscreen
          ? "fixed inset-0 z-[300] bg-[#1a0e06]/98 p-3 sm:p-6 overflow-y-auto justify-center"
          : "max-w-6xl mx-auto space-y-4"
      }`}
    >
      {/* ================= THANH ĐIỀU KHIỂN TRÊN CÙNG ================= */}
      <div
        className={`w-full flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 rounded-2xl border-2 border-[#c9922a]/70 shadow-2xl bg-gradient-to-r from-[#2c170b] via-[#3a200f] to-[#201007] text-white ${
          isFullscreen ? "max-w-6xl mx-auto mb-3" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d97706] to-[#fde68a] text-[#1c0d05] font-black text-xl flex items-center justify-center shadow-lg border border-[#fef08a]">
            🧩
          </div>
          <div>
            <div className="text-xs sm:text-sm uppercase font-black text-[#fde68a] tracking-wider flex items-center gap-2">
              <span>{isRevealed ? "KẾT QUẢ GHÉP TRANH & ĐÁP ÁN QUY LUẬT" : "SÂN KHẤU GHÉP TRANH TỔNG KẾT"}</span>
              
            </div>
            
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Nút Xem / Ẩn Đáp Án */}
          <button
            type="button"
            onClick={handleToggleReveal}
            className={`px-5 py-2 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-2 ${
              isRevealed
                ? "bg-[#3a2214] hover:bg-[#4d2d1b] text-[#fef08a] border border-[#c9922a]"
                : "bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] text-white hover:scale-105 active:scale-95 ring-2 ring-[#fde68a] shadow-amber-900/40"
            }`}
          >
            <span>{isRevealed ? "🔄" : "👁️"}</span>
            <span>{isRevealed ? "ẨN ĐÁP ÁN (VỀ Ô TRỐNG)" : "XEM ĐÁP ÁN & GHÉP TRANH"}</span>
          </button>

          {/* Nút Trình chiếu toàn màn hình */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#3a382b]/90 hover:bg-[#4a4738] text-[#eee2ca] border border-[#c3a47b]/40 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>{isFullscreen ? "🗗" : "⛶"}</span>
            <span className="hidden sm:inline">{isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}</span>
          </button>

          {/* Nút quay lại 9 câu hỏi */}
          {onBackToQuestions && (
            <button
              type="button"
              onClick={() => {
                if (isFullscreen) setIsFullscreen(false);
                onBackToQuestions();
              }}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#3a382b]/90 hover:bg-[#4a4738] text-[#eee2ca] border border-[#c3a47b]/40 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>📋</span>
              <span className="hidden sm:inline">9 Câu hỏi</span>
            </button>
          )}

          {/* Nút chơi lại */}
          {onRestart && (
            <button
              type="button"
              onClick={() => {
                if (isFullscreen) setIsFullscreen(false);
                onRestart();
              }}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#3a382b]/90 hover:bg-[#4a4738] text-[#fca5a5] border border-[#a96346]/50 shadow-sm transition-all cursor-pointer flex items-center gap-1"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">Chơi lại</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= KHUNG TRÌNH CHIẾU SIÊU ĐẸP & TO LỚN ================= */}
      <div className="w-full bg-gradient-to-b from-[#2b170c] via-[#1f1007] to-[#140a04] text-[#eee2ca] rounded-3xl p-4 sm:p-7 md:p-8 border-4 border-[#c9922a] shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col items-center space-y-5 sm:space-y-6 select-none">
        {/* Đinh tán kim loại trang trí 4 góc */}
        <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-gradient-to-tr from-[#b45309] to-[#fde68a] border border-[#78350f] shadow-md pointer-events-none"></div>
        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-gradient-to-tr from-[#b45309] to-[#fde68a] border border-[#78350f] shadow-md pointer-events-none"></div>
        <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full bg-gradient-to-tr from-[#b45309] to-[#fde68a] border border-[#78350f] shadow-md pointer-events-none"></div>
        <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-gradient-to-tr from-[#b45309] to-[#fde68a] border border-[#78350f] shadow-md pointer-events-none"></div>

        {/* Vệt sáng trang trí nền */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-amber-500/10 filter blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-amber-600/10 filter blur-3xl pointer-events-none"></div>

        {/* ================= KHU VỰC TRUNG TÂM: HÌNH GỢI Ý + KHUNG LƯỚI 3x3 TO ================= */}
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 relative z-10">
          {/* HÌNH GỢI Ý BÊN TRÁI ĐƯỢC THIẾT KẾ ĐẸP MẮT */}
          <div className="flex-shrink-0 flex flex-col items-center group">
            <div className="relative p-1.5 rounded-2xl bg-gradient-to-b from-[#4a2e18] to-[#25150a] border-2 border-[#c9922a] shadow-xl hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all duration-300">
              <img
                src={FULL_IMAGE_SRC}
                alt="Hình gợi ý nhỏ để ghép"
                onClick={() => setIsPreviewZoom(!isPreviewZoom)}
                className="w-24 sm:w-28 md:w-32 lg:w-36 aspect-[3/2] object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform"
              />
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow border border-amber-200">
                🔍
              </div>
            </div>
            <span className="text-xs font-bold text-[#fde68a] mt-1.5 tracking-wide uppercase flex items-center gap-1">
              <span>🖼️</span>
              <span>Hình Gợi Ý</span>
            </span>
          </div>

          {/* KHUNG LƯỚI 3x3 KÍCH THƯỚC LỚN, RÕ NÉT (MAX-W-2XL / 3XL) */}
          <div className="w-full max-w-2xl lg:max-w-3xl aspect-[3/2] rounded-2xl overflow-hidden border-3 sm:border-4 border-[#c9922a] shadow-[0_15px_35px_rgba(0,0,0,0.8)] bg-[#0d0703] p-1 sm:p-1.5 grid grid-cols-3 grid-rows-3 gap-1 sm:gap-1.5">
            {PUZZLE_GRID_LAYOUT.map((cell) => {
              const isFilled = isRevealed || manuallyPlaced[cell.qNum];
              const q = ALL_PUZZLE_QUESTIONS.find((item) => item.qNum === cell.qNum);
              const pieceSrc = q
                ? q.pieceImage
                : `/images/truytimmanhghep/pieces/piece_cau_${cell.qNum}.jpg`;

              return (
                <div
                  key={`cell-${cell.row}-${cell.col}`}
                  className="relative w-full h-full overflow-hidden rounded-lg bg-gradient-to-br from-[#2a170c] to-[#180c05] flex items-center justify-center border border-[#78350f]/60 transition-all duration-300"
                >
                  {isFilled ? (
                    /* ================= MẢNH GHÉP ĐÃ ĐƯỢC LẮP VÀO ================= */
                    <div className="relative w-full h-full animate-fade-in group overflow-hidden">
                      <img
                        src={pieceSrc}
                        alt={`Mảnh ghép số ${cell.qNum}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="eager"
                      />

                      {/* Viền sáng vàng khi hover */}
                      <div className="absolute inset-0 pointer-events-none border border-amber-300/40 group-hover:border-amber-400 group-hover:bg-amber-400/5 transition-all"></div>

                      {/* HUY HIỆU TRÒN MÀU HỒNG PHẤN VIỀN KIM LOẠI 3D (Đúng vị trí Hình 2) */}
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-[#f472b6] via-[#fbcfe8] to-[#ffffff] text-[#111827] font-black text-sm sm:text-base flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.6)] border-2 border-white ring-2 ring-pink-400/60 pointer-events-none select-none group-hover:scale-110 transition-transform">
                        {cell.qNum}
                      </div>

                      {/* Nhãn tooltip nhỏ khi rê chuột */}
                      <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/85 text-[#fde68a] text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md border border-amber-400/40 pointer-events-none">
                        Mảnh ghép #{cell.qNum}
                      </div>
                    </div>
                  ) : (
                    /* ================= Ô TRỐNG RÃNH CHÌM SANG TRỌNG (HÌNH 1) ================= */
                    <button
                      type="button"
                      onClick={() => handleToggleCell(cell.qNum)}
                      title={`Bấm để lắp Mảnh ghép số ${cell.qNum}`}
                      className="w-full h-full relative flex flex-col items-center justify-center bg-gradient-to-br from-[#2f1b0f] via-[#241309] to-[#150a04] hover:from-[#452714] hover:to-[#261408] transition-all duration-300 cursor-pointer group shadow-inner"
                    >
                      {/* Vân lưới chấm tinh tế */}
                      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:10px_10px]"></div>

                      {/* Khung viền mờ rãnh ghép */}
                      <div className="absolute inset-1.5 rounded border border-dashed border-[#c9922a]/30 group-hover:border-[#fde68a]/70 transition-colors pointer-events-none"></div>

                      {/* Huy hiệu ô trống */}
                      

                    
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= KHU VỰC CÂU HỎI VÀ ĐÁP ÁN TO RÕ RÀNG ================= */}
        <div className="w-full max-w-4xl relative z-10">
          {!isRevealed ? (
            /* ================= STATE 1: BẢNG CÂU HỎI QUY LUẬT MẠ VÀNG (HÌNH 1) ================= */
            <div className="w-full p-4 sm:p-6 md:p-7 rounded-2xl bg-gradient-to-r from-[#3e2413] via-[#2f190c] to-[#3e2413] border-3 border-[#c9922a] shadow-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 animate-fade-in font-sans">
              {/* Huy hiệu Dấu Hỏi ? màu Đỏ Ruby phát sáng */}
              <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-[#991b1b] via-[#dc2626] to-[#f87171] text-white flex items-center justify-center flex-shrink-0 shadow-[0_0_25px_rgba(220,38,38,0.5)] border-2 border-white/60 animate-pulse">
                <span className="text-3xl sm:text-4xl md:text-5xl font-black drop-shadow-md leading-none">
                  ?
                </span>
              </div>

              {/* Khung nội dung câu hỏi to, rõ, sang trọng */}
              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-[#fde68a] border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
                  <span>❓</span>
                  <span>CÂU HỎI </span>
                </div>

                <p className="text-sm sm:text-lg md:text-xl text-[#fef08a] font-medium leading-relaxed">
                  Hình trên minh hoạ cho 1 trong 3 sự biến đổi có tính quy luật
                  
                  của cơ cấu xã hội - giai cấp trong thời kỳ quá độ.
                </p>

                <p className="text-base sm:text-xl md:text-2xl font-black text-[#f87171] tracking-wide pt-0.5">
                  ĐÓ LÀ SỰ BIẾN ĐỔI NÀO?
                </p>
              </div>
            </div>
          ) : (
            /* ================= STATE 2: BẢNG KẾT QUẢ & CÂU TRẢ LỜI VINH QUANG (HÌNH 2) ================= */
            <div className="w-full p-4 sm:p-6 md:p-7 rounded-2xl bg-gradient-to-r from-[#143320] via-[#0f2818] to-[#143320] border-3 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.35)] flex flex-col sm:flex-row items-center gap-4 sm:gap-6 animate-fade-in font-sans">
              {/* Huy hiệu Dấu Tích Xanh Ngọc Lục Bảo 3D */}
              <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-[#059669] via-[#10b981] to-[#34d399] text-white flex items-center justify-center flex-shrink-0 shadow-[0_0_30px_rgba(16,185,129,0.6)] border-2 border-emerald-200 animate-bounce">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Nội dung câu trả lời to lớn, nổi bật hoàn toàn */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold uppercase tracking-wider">
                  <span>🎯</span>
                  <span>ĐÁP ÁN CHÍNH XÁC</span>
                </div>

                <p className="text-base sm:text-xl md:text-2xl leading-relaxed font-bold text-white">
                  Cơ cấu xã hội - giai cấp biến đổi trong{" "}
                  <span className="text-[#fca5a5] italic font-black underline decoration-red-400/60 underline-offset-4">
                    mối quan hệ vừa đấu tranh, vừa liên minh, từng bước xóa bỏ bất bình đẳng xã hội dẫn đến sự xích lại gần nhau.
                  </span>
                </p>

                {/* 3 Quy luật tóm tắt bài học */}
              
              </div>
            </div>
          )}
        </div>

        {/* NÚT BẤM HÀNH ĐỘNG CHÍNH - TO LỚN, RỰC RỠ */}
      
      </div>

      {/* MODAL PHÓNG TO HÌNH GỢI Ý KHI NGƯỜI DÙNG CLICK VÀO HÌNH NHỎ */}
      {isPreviewZoom && (
        <div
          className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsPreviewZoom(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-[#221309] p-3 rounded-2xl border-2 border-[#c9922a] shadow-2xl">
            <button
              type="button"
              onClick={() => setIsPreviewZoom(false)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center border-2 border-white shadow-lg cursor-pointer"
            >
              ✕
            </button>
            <img
              src={FULL_IMAGE_SRC}
              alt="Hình gợi ý phóng to"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
            <div className="text-center text-xs font-bold text-[#fde68a] mt-2">
              Bức tranh gốc đầy đủ để đối chiếu mảnh ghép (Bấm vào ngoài để đóng)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
