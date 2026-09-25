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
      className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      {/* Khung Modal thiết kế tối giản, sạch sẽ, không lạm dụng icon */}
      <div
        className="relative w-[95vw] md:w-[75vw] max-w-5xl max-h-[92vh] bg-[#faf7f2] text-[#2c1a0e] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] border-2 sm:border-4 border-[#c9922a] overflow-hidden flex flex-col my-auto"
        style={{ fontFamily: "'Inter', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER TỐI GIẢN ================= */}
        <div className="bg-gradient-to-r from-[#2c1a0e] via-[#4a2e18] to-[#2c1a0e] text-white px-6 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between border-b-2 border-[#c9922a]/50 flex-shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase">
              THỂ LỆ TRÒ CHƠI: TRUY TÌM MẢNH GHÉP
            </h2>
            <p className="text-xs text-[#dbc39c]">
              Quy tắc thi đấu &amp; cách tính điểm dành cho các nhóm
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thể lệ"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-base cursor-pointer border border-[#c9922a]/40"
          >
            ✕
          </button>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* HÀNG 1: 2 CỘT NỘI DUNG (VÒNG 1 VÀ VÒNG 2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CỘT 1: VÒNG 1 */}
            <div className="bg-white rounded-2xl border border-[#e5dfd5] p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#b45309] pb-2.5 border-b border-[#e5dfd5]">
                VÒNG 1: TRUY TÌM MẢNH GHÉP
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-[#2c1a0e] leading-relaxed flex-1">
                <p>
                  Trong mỗi mảnh ghép sẽ có <strong>1 câu hỏi</strong> trắc nghiệm.
                </p>

                <p>
                  Mỗi câu trả lời đúng:{" "}
                  <span className="font-bold text-red-600 whitespace-nowrap">
                    10 điểm / câu
                  </span>
                </p>

                {/* Hộp quy định hình thức trả lời */}
                <div className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#e5dfd5] text-xs space-y-1.5 mt-2">
                  <div className="font-bold text-[#b45309] uppercase tracking-wide text-xs">
                    Quy định hình thức trả lời:
                  </div>
                  <p className="text-gray-700">
                    Trả lời bằng hình thức:{" "}
                    <strong className="text-[#2c1a0e] uppercase">
                      ĐƯA CẢ SỐ (đại diện cho tên nhóm) + ĐÁP ÁN
                    </strong>
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    Ví dụ: Nhóm 1 chọn A đưa &quot;<strong>1A</strong>&quot; · Nhóm 3 chọn C đưa &quot;<strong>3C</strong>&quot;.
                  </p>
                </div>
              </div>
            </div>

            {/* CỘT 2: VÒNG 2 */}
            <div className="bg-white rounded-2xl border border-[#e5dfd5] p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#b45309] pb-2.5 border-b border-[#e5dfd5]">
                VÒNG 2: SẮP XẾP MẢNH GHÉP + ĐOÁN TỪ KHOÁ
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-[#2c1a0e] leading-relaxed flex-1">
                <p>
                  <strong>Sắp xếp mảnh ghép thành hình</strong> hoàn chỉnh theo sơ đồ 3×3.
                </p>

                <p>
                  Sắp xếp xong + Trả lời đúng câu hỏi ở dưới bức hình:{" "}
                  <span className="font-bold text-red-600 whitespace-nowrap">
                    +50 điểm
                  </span>
                </p>

                {/* Hộp điểm tốc độ */}
                <div className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#e5dfd5] text-xs space-y-2 mt-2">
                  <div className="font-bold text-[#b45309] uppercase tracking-wide text-xs">
                    Điểm tốc độ dành cho 3 nhóm hoàn thành nhanh nhất:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    {/* Hạng 1 */}
                    <div className="p-2 rounded-lg bg-white border border-[#e5dfd5]">
                      <div className="text-gray-600 text-xs font-medium whitespace-nowrap">Nhanh nhất:</div>
                      <div className="font-bold text-xs sm:text-sm text-[#b45309] mt-0.5 whitespace-nowrap">
                        +20 điểm
                      </div>
                    </div>

                    {/* Hạng 2 */}
                    <div className="p-2 rounded-lg bg-white border border-[#e5dfd5]">
                      <div className="text-gray-600 text-xs font-medium whitespace-nowrap">Nhanh thứ hai:</div>
                      <div className="font-bold text-xs sm:text-sm text-[#b45309] mt-0.5 whitespace-nowrap">
                        +15 điểm
                      </div>
                    </div>

                    {/* Hạng 3 */}
                    <div className="p-2 rounded-lg bg-white border border-[#e5dfd5]">
                      <div className="text-gray-600 text-xs font-medium whitespace-nowrap">Nhanh thứ ba:</div>
                      <div className="font-bold text-xs sm:text-sm text-[#b45309] mt-0.5 whitespace-nowrap">
                        +10 điểm
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 italic text-center pt-0.5">
                    Các nhóm còn lại không được cộng điểm tốc độ.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HÀNG 2: TỔNG KẾT ĐIỂM */}
          <div className="bg-white rounded-2xl border border-[#e5dfd5] p-4 sm:p-5 shadow-xs text-center space-y-2">
            <div className="text-xs sm:text-sm font-bold text-[#b45309] uppercase tracking-wider">
              CÔNG THỨC TÍNH ĐIỂM TỔNG KẾT
            </div>

            <div className="text-xs sm:text-sm md:text-base font-bold text-[#2c1a0e]">
              Điểm cuối cùng mỗi nhóm = Tổng điểm cả hai vòng chơi
            </div>

            <div className="text-xs sm:text-sm text-gray-700 bg-[#faf7f2] py-1 px-3.5 rounded-full inline-block border border-[#e5dfd5]">
              ( = <span className="text-red-600 font-bold whitespace-nowrap">Điểm trả lời đúng</span> + <span className="text-[#b45309] font-bold whitespace-nowrap">Điểm đoán hình</span> + <span className="text-blue-700 font-bold whitespace-nowrap">Điểm tốc độ</span>. )
            </div>

            <p className="text-xs sm:text-sm text-[#2c1a0e] pt-1">
              Nhóm có tổng điểm cao nhất sau khi kết thúc 2 vòng của trò chơi sẽ <span className="font-bold text-[#b45309]">giành chiến thắng</span>.
            </p>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="bg-[#f2ece4] px-6 sm:px-8 py-3 sm:py-3.5 border-t border-[#e5dfd5] flex items-center justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-2.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#f59e0b] hover:to-[#d97706] text-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            BẮT ĐẦU CHƠI!
          </button>
        </div>
      </div>
    </div>
  );
}
