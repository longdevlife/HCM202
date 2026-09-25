import React, { useEffect } from "react";

/**
 * GameRulesModal - Thể Lệ Tính Điểm
 * Thiết kế tối giản, thanh lịch phong cách trang giấy/slide thuyết trình:
 * - Nền giấy ngà ấm áp (#faf6ed), viền đôi cổ điển sang trọng
 * - Tiêu đề serif "THỂ LỆ TÍNH ĐIỂM"
 * - Chia làm 2 phần (Phần 1 và Phần 2) ở 2 bên không dùng khung hộp rườm rà
 * - Công thức tính điểm và thông điệp chiến thắng ở dưới cùng
 */
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
      className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      {/* Khung ngoài: Viền đôi cổ điển màu nâu đồng thanh lịch */}
      <div
        className="relative w-[96vw] md:w-[92vw] lg:w-[90vw] max-w-6xl max-h-[94vh] bg-[#faf6ed] text-[#2c1810] border-2 sm:border-[3px] border-[#5a2b13] p-2 sm:p-3 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col my-auto"
        style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng modal tối giản ở góc trên bên phải */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thể lệ"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 w-8 h-8 rounded-full border border-[#8b5a2b]/40 text-[#5a2b13] hover:text-white hover:bg-[#5a2b13] flex items-center justify-center transition-all cursor-pointer text-sm font-sans"
        >
          ✕
        </button>

        {/* Khung viền chỉ mảnh bên trong tạo hiệu ứng viền đôi sang trọng như trang slide */}
        <div className="border border-[#cbb79c] rounded-xl px-5 sm:px-8 md:px-10 py-5 sm:py-7 md:py-8 overflow-y-auto flex-1 flex flex-col justify-between space-y-5">
          {/* ================= TIÊU ĐỀ CHÍNH ================= */}
          <div className="text-center pb-3 sm:pb-4 border-b border-[#d8c8b5]/80">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider text-[#3d1a10] uppercase">
              THỂ LỆ TÍNH ĐIỂM
            </h2>
          </div>

          {/* ================= NỘI DUNG 2 CỘT: PHẦN 1 & PHẦN 2 ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-14 py-2 flex-1 items-start px-1 sm:px-3 md:px-5">
            {/* CỘT TRÁI: PHẦN 1 */}
            <div className="space-y-3.5 text-sm sm:text-base text-[#2c1810] leading-relaxed">
              <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#5a2b13] border-b border-[#d8c8b5]/60 pb-1">
                VÒNG 1: TRUY TÌM MẢNH GHÉP
              </h3>

              <div className="space-y-2.5 pt-0.5">
                <p>
                  Mỗi mảnh ghép tương ứng với 01 câu hỏi.
                </p>

                <p className="text-[#3d1a10]">
                  Các nhóm trả lời bằng cách giơ số + đáp án.
                  <br />
                  <span className="italic text-[#5a4235] text-xs sm:text-sm">
                    (Ví dụ: Nhóm 1 trả lời đáp án A thì giơ 1A)
                  </span>
                </p>

                <p>
                  Trả lời đúng:{" "}
                  <strong className="font-bold text-red-600 whitespace-nowrap">+10 điểm</strong>{" "}
                  và nhận mảnh ghép tương ứng.
                </p>

                <p className="text-xs sm:text-sm text-[#5a4235] leading-normal">
                  Các mảnh ghép thu được sẽ được sử dụng ở Vòng 2{" "}
                  <span className="italic">
                    (nên cân nhắc trả lời đúng nhiều nhất để có nhiều mảnh ghép phục vụ cho việc đoán hình)
                  </span>
                </p>

                <p className="pt-0.5 text-[#3d1a10] whitespace-nowrap text-xs sm:text-[13px] md:text-[14px] lg:text-[15px]">
                  <span className="text-[#7c2d12] font-bold">→ </span>
                  Điểm Vòng 1 ={" "}
                  <strong className="font-bold text-red-600 not-italic">
                    Số câu đúng × 10 điểm
                  </strong>
                </p>
              </div>
            </div>

            {/* CỘT PHẢI: PHẦN 2 */}
            <div className="space-y-3.5 text-sm sm:text-base text-[#2c1810] leading-relaxed">
              <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#5a2b13] border-b border-[#d8c8b5]/60 pb-1">
                VÒNG 2: GHÉP HÌNH – ĐOÁN TỪ KHÓA
              </h3>

              <div className="pt-0.5 space-y-1">
                <p className="text-[#2c1810] whitespace-nowrap text-xs sm:text-[13.5px] md:text-[14.5px] lg:text-[15.5px]">
                  Dùng các mảnh ghép đã thu được ở Vòng 1 để hoàn thành bức hình.
                </p>
                <p className="text-[#3d1a10] whitespace-nowrap text-xs sm:text-[13.5px] md:text-[14.5px] lg:text-[15.5px]">
                  <span className="text-[#7c2d12] font-bold">→ </span>
                  <span className="italic">Thiếu mảnh? Có thể mua thêm với giá </span>
                  <strong className="font-bold text-red-600 not-italic whitespace-nowrap">5 điểm/mảnh</strong>.
                </p>
              </div>

              <div className="pt-0.5 leading-snug">
                <span>
                  Sau khi ghép hình, các nhóm đoán đúng từ khóa/câu hỏi ẩn sau bức hình:{" "}
                </span>
                <strong className="font-bold text-red-600 whitespace-nowrap">
                  +50 điểm.
                </strong>
              </div>

              <div className="space-y-1.5 pt-0.5">
                <p className="font-medium text-[#3d1a10]">
                  Thưởng tốc độ cho 3 nhóm hoàn thành xếp hình + trả lời đúng từ khoá/ câu hỏi của bức hình nhanh nhất:
                </p>
                <ul className="space-y-1 pl-1 sm:pl-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#7c2d12] font-bold">•</span>
                    <span>
                      Nhanh nhất: <strong className="font-bold text-red-600 whitespace-nowrap">Cộng 20 điểm.</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#7c2d12] font-bold">•</span>
                    <span>
                      Nhanh thứ hai: <strong className="font-bold text-red-600 whitespace-nowrap">Cộng 15 điểm.</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#7c2d12] font-bold">•</span>
                    <span>
                      Nhanh thứ ba: <strong className="font-bold text-red-600 whitespace-nowrap">Cộng 10 điểm.</strong>
                    </span>
                  </li>
                </ul>
              </div>

              <p className="pt-0.5 text-[#3d1a10] whitespace-nowrap text-xs sm:text-[13px] md:text-[14px] lg:text-[15px]">
                <span className="text-[#7c2d12] font-bold">→ </span>
                Điểm Vòng 2 ={" "}
                <strong className="font-bold text-red-600 not-italic">
                  50 điểm + Điểm tốc độ − Điểm mua mảnh ghép
                </strong>
              </p>
            </div>
          </div>

          {/* ================= KẾT QUẢ ================= */}
          <div className="pt-3 border-t border-[#d8c8b5]/80 space-y-2.5 text-center">
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5a2b13]">
              KẾT QUẢ
            </div>

            <p className="text-sm sm:text-base md:text-lg font-semibold text-[#3d1a10] text-center">
              TỔNG ĐIỂM = <span className="font-bold text-red-600 whitespace-nowrap">VÒNG 1</span> + <span className="font-bold text-red-600 whitespace-nowrap">VÒNG 2</span>
            </p>

            <div className="border-t border-dashed border-[#cbb79c] w-full"></div>

            <p className="italic text-sm sm:text-base md:text-lg font-semibold text-[#2c1810] text-center">
              <span className="text-[#7c2d12] font-bold not-italic">→ </span>
              Nhóm có tổng điểm cao nhất sau hai vòng là đội chiến thắng.
            </p>
          </div>

          {/* ================= NÚT BẮT ĐẦU CHƠI TỐI GIẢN ================= */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-2.5 rounded-full font-serif font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#5a2b13] hover:bg-[#783918] text-[#faf6ed] border border-[#cbb79c] shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              BẮT ĐẦU CHƠI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
