import React, { useState } from "react";
import {
  FULL_IMAGE_SRC,
  PUZZLE_GRID_LAYOUT,
  ALL_PUZZLE_QUESTIONS,
} from "./puzzleData";
import { sounds } from "../chiecnonkidieu/SoundEffects";

/**
 * Màn hình Ghép Tranh & Khám Phá Quy Luật
 * Thiết kế nền sáng đồng bộ với modal câu hỏi:
 * - State 1 (Hình 1 - Chưa xem đáp án): 9 ô trống rãnh chìm sáng sủa, trang nhã; khung câu hỏi format font Inter cố định.
 * - State 2 (Hình 2 - Xem đáp án): 9 mảnh ghép hiện đủ ở 9 vị trí; khung đáp án format font Inter cố định.
 */
export default function PuzzleAssemblyStage({
  onRestart,
  onBackToQuestions,
  onOpenRules,
  completedCount = 9,
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [manuallyPlaced, setManuallyPlaced] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPreviewZoom, setIsPreviewZoom] = useState(false);

  const handleToggleReveal = () => {
    if (!isRevealed) {
      sounds.playFanfare();
      setIsRevealed(true);
    } else {
      setIsRevealed(false);
    }
  };

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
          ? "fixed inset-0 z-[300] bg-[#faf7f2] text-[#2c1a0e] p-3 sm:p-6 overflow-y-auto justify-center"
          : "max-w-6xl mx-auto space-y-4"
      }`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ================= THANH ĐIỀU KHIỂN TRÊN CÙNG ================= */}
      <div
        className={`w-full flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl border-2 border-[#c9922a]/50 shadow-md bg-gradient-to-r from-[#2c1a0e] via-[#4a2e18] to-[#2c1a0e] text-white ${
          isFullscreen ? "max-w-6xl mx-auto mb-3" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d97706] to-[#fde68a] text-[#1c0d05] font-bold text-lg flex items-center justify-center shadow border border-[#fef08a]">
            🧩
          </div>
          <div>
            <div className="text-xs sm:text-sm uppercase font-bold text-[#fde68a] tracking-wider">
              {isRevealed
                ? "KẾT QUẢ GHÉP TRANH & ĐÁP ÁN QUY LUẬT"
                : "SÂN KHẤU GHÉP TRANH TỔNG KẾT"}
            </div>
            <div className="text-xs text-[#dbc39c]">
              {isRevealed
                ? "Hình 2: Tranh hoàn chỉnh và đáp án quy luật"
                : "Hình 1: Bảng 9 mảnh ghép và câu hỏi đối chiếu"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Nút Xem / Ẩn Đáp Án */}
          <button
            type="button"
            onClick={handleToggleReveal}
            className={`px-5 py-2 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2 ${
              isRevealed
                ? "bg-[#3a2214] hover:bg-[#4d2d1b] text-[#fef08a] border border-[#c9922a]"
                : "bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] text-white hover:scale-105 active:scale-95 ring-2 ring-[#fde68a]"
            }`}
          >
            <span>{isRevealed ? "ẨN ĐÁP ÁN (VỀ Ô TRỐNG)" : "XEM ĐÁP ÁN & GHÉP TRANH"}</span>
          </button>

          {/* Nút Xem thể lệ trò chơi */}
          {onOpenRules && (
            <button
              type="button"
              onClick={onOpenRules}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#d97706]/30 hover:bg-[#d97706]/50 text-[#fde68a] border border-[#f59e0b]/60 shadow-sm transition-all cursor-pointer"
            >
              Thể lệ
            </button>
          )}

          {/* Nút Trình chiếu toàn màn hình */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-[#eee2ca] border border-[#c3a47b]/40 shadow-sm transition-all cursor-pointer"
          >
            {isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
          </button>

          {/* Nút quay lại 9 câu hỏi */}
          {onBackToQuestions && (
            <button
              type="button"
              onClick={() => {
                if (isFullscreen) setIsFullscreen(false);
                onBackToQuestions();
              }}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-[#eee2ca] border border-[#c3a47b]/40 shadow-sm transition-all cursor-pointer"
            >
              9 Câu hỏi
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
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-[#fca5a5] border border-[#a96346]/50 shadow-sm transition-all cursor-pointer"
            >
              Chơi lại
            </button>
          )}
        </div>
      </div>

      {/* ================= KHUNG TRÌNH CHIẾU NỀN SÁNG ĐỒNG BỘ CÂU HỎI ================= */}
      <div className="w-full bg-[#faf7f2] text-[#2c1a0e] rounded-3xl p-4 sm:p-7 md:p-8 border-2 sm:border-4 border-[#c9922a] shadow-[0_20px_50px_rgba(0,0,0,0.12)] relative overflow-hidden flex flex-col items-center space-y-5 sm:space-y-6 select-none">
        {/* ================= KHU VỰC TRUNG TÂM: HÌNH GỢI Ý + KHUNG LƯỚI 3x3 ================= */}
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 relative z-10">
          {/* HÌNH GỢI Ý BÊN TRÁI */}
          <div className="flex-shrink-0 flex flex-col items-center group">
            <div className="relative p-1.5 rounded-2xl bg-white border-2 border-[#c9922a] shadow-md hover:shadow-lg transition-all duration-300">
              <img
                src={FULL_IMAGE_SRC}
                alt="Hình gợi ý nhỏ để ghép"
                onClick={() => setIsPreviewZoom(!isPreviewZoom)}
                className="w-24 sm:w-28 md:w-32 lg:w-36 aspect-[3/2] object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform"
              />
              <div className="absolute -top-2 -right-2 bg-[#d97706] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow border border-amber-200">
                🔍
              </div>
            </div>
            <span className="text-xs font-bold text-[#b45309] mt-2 tracking-wide uppercase">
              Hình Gợi Ý
            </span>
          </div>

          {/* KHUNG LƯỚI 3x3 NỀN SÁNG, RÕ NÉT */}
          <div className="w-full max-w-2xl lg:max-w-3xl aspect-[3/2] rounded-2xl overflow-hidden border-2 sm:border-4 border-[#c9922a] shadow-md bg-white p-1 sm:p-1.5 grid grid-cols-3 grid-rows-3 gap-1 sm:gap-1.5">
            {PUZZLE_GRID_LAYOUT.map((cell) => {
              const isFilled = isRevealed || manuallyPlaced[cell.qNum];
              const q = ALL_PUZZLE_QUESTIONS.find((item) => item.qNum === cell.qNum);
              const pieceSrc = q
                ? q.pieceImage
                : `/images/truytimmanhghep/pieces/piece_cau_${cell.qNum}.jpg`;

              return (
                <div
                  key={`cell-${cell.row}-${cell.col}`}
                  className="relative w-full h-full overflow-hidden rounded-xl transition-all duration-300"
                >
                  {isFilled ? (
                    /* ================= MẢNH GHÉP ĐÃ ĐƯỢC LẮP VÀO (HÌNH 2) ================= */
                    <div className="relative w-full h-full animate-fade-in group overflow-hidden rounded-xl border border-amber-300/50 shadow-xs">
                      <img
                        src={pieceSrc}
                        alt={`Mảnh ghép số ${cell.qNum}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="eager"
                      />

                      {/* Viền sáng vàng nhẹ khi rê chuột */}
                      <div className="absolute inset-0 pointer-events-none border border-transparent group-hover:border-amber-400 group-hover:bg-amber-400/5 transition-all"></div>

                      {/* Huy hiệu tròn số mảnh ghép */}
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-[#f472b6] via-[#fbcfe8] to-[#ffffff] text-[#111827] font-bold text-xs sm:text-sm flex items-center justify-center shadow-md border-2 border-white pointer-events-none select-none">
                        {cell.qNum}
                      </div>

                      {/* Nhãn tooltip nhỏ khi rê chuột */}
                      <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/85 text-[#fde68a] text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md pointer-events-none">
                        Mảnh #{cell.qNum}
                      </div>
                    </div>
                  ) : (
                    /* ================= Ô TRỐNG RÃNH CHÌM NỀN SÁNG (HÌNH 1) ================= */
                    <button
                      type="button"
                      onClick={() => handleToggleCell(cell.qNum)}
                      title={`Bấm để lắp Mảnh ghép số ${cell.qNum}`}
                      className="w-full h-full relative flex flex-col items-center justify-center bg-[#faf8f5] hover:bg-[#fff9ee] border-2 border-dashed border-[#d5c3aa] hover:border-[#c9922a] rounded-xl transition-all duration-300 cursor-pointer group shadow-inner"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border border-[#d5c3aa] text-[#8c6b38] font-bold text-base sm:text-lg flex items-center justify-center group-hover:scale-105 group-hover:border-[#c9922a] group-hover:text-[#b45309] shadow-xs transition-all">
                        {cell.qNum}
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= KHU VỰC CÂU HỎI VÀ ĐÁP ÁN: 1 ĐỊNH DẠNG CHỮ CỐ ĐỊNH, KHÔNG BỊ LỖI XUỐNG DÒNG ================= */}
        <div className="w-full max-w-4xl relative z-10">
          {!isRevealed ? (
            /* ================= STATE 1: BẢNG CÂU HỎI (HÌNH 1) ================= */
            <div className="w-full p-5 sm:p-6 md:p-7 rounded-2xl bg-white border border-[#e5dfd5] shadow-xs animate-fade-in text-center sm:text-left space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#b45309]">
                CÂU HỎI QUY LUẬT TRANH
              </div>

              <p className="text-base sm:text-lg md:text-xl font-bold text-[#2c1a0e] leading-relaxed">
                Hình trên minh hoạ cho 1 trong 3 sự biến đổi có tính quy luật của cơ cấu xã hội - giai cấp trong thời kỳ quá độ:{" "}
                <span className="text-[#b45309]">Đó là sự biến đổi nào?</span>
              </p>
            </div>
          ) : (
            /* ================= STATE 2: BẢNG ĐÁP ÁN CHÍNH XÁC (HÌNH 2) ================= */
            <div className="w-full p-5 sm:p-6 md:p-7 rounded-2xl bg-white border-2 border-emerald-400 shadow-xs animate-fade-in text-center sm:text-left space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                ĐÁP ÁN CHÍNH XÁC
              </div>

              <p className="text-base sm:text-lg md:text-xl font-bold text-[#2c1a0e] leading-relaxed">
                Cơ cấu xã hội - giai cấp biến đổi trong{" "}
                <span className="text-red-600 decoration-red-400/60 underline-offset-4">
                  mối quan hệ vừa đấu tranh, vừa liên minh, từng bước xóa bỏ bất bình đẳng xã hội dẫn đến sự xích lại gần nhau.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL PHÓNG TO HÌNH GỢI Ý KHI NGƯỜI DÙNG CLICK VÀO HÌNH NHỎ */}
      {isPreviewZoom && (
        <div
          className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsPreviewZoom(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#faf7f2] p-4 rounded-3xl border-2 sm:border-4 border-[#c9922a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <button
              type="button"
              onClick={() => setIsPreviewZoom(false)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#2c1a0e] text-white font-bold flex items-center justify-center border-2 border-white shadow-lg cursor-pointer hover:bg-black"
            >
              ✕
            </button>
            <img
              src={FULL_IMAGE_SRC}
              alt="Hình gợi ý phóng to"
              className="max-h-[75vh] w-auto object-contain rounded-2xl border border-[#e5dfd5]"
            />
            <div className="text-center text-xs font-bold text-[#b45309] mt-3">
              Bức tranh gốc đầy đủ để đối chiếu mảnh ghép (Bấm ✕ hoặc bấm ra ngoài để đóng)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
