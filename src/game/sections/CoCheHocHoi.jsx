export default function CoCheHocHoi() {
  const f1 = "'Playfair Display', serif";
  const f2 = "'Inter', sans-serif";

  const steps = [
    {
      step: "01",
      name: "Khủng Hoảng Sinh Tồn",
      tag: "Bế tắc hệ thống",
      desc: "Cơ chế hành chính quan liêu rơi vào tê liệt, năng suất sụt giảm, nạn đói giáp hạt và khan hiếm hàng hóa đe dọa trực tiếp sự ổn định xã hội.",
    },
    {
      step: "02",
      name: "Thử Nghiệm Vi Mô (“Xé Rào”)",
      tag: "Sáng kiến cơ sở",
      desc: "Địa phương và xí nghiệp tự phát tìm lối thoát: Khoán chui Đoàn Xá (Hải Phòng), Đội gạo Ba Thi (TP.HCM), Phương án 304 Dệt Thành Công.",
    },
    {
      step: "03",
      name: "Khảo Sát Thực Địa & Đối Thoại",
      tag: "Lắng nghe nhân dân",
      desc: "Lãnh đạo cấp cao (Đồng chí Trường Chinh, Võ Văn Kiệt, Nguyễn Ngọc Trìu...) trực tiếp về tận cơ sở lội ruộng, ăn ở cùng dân để kiểm chứng hiệu quả thực tế.",
    },
    {
      step: "04",
      name: "Thí Điểm Có Kiểm Soát",
      tag: "Không gian thử nghiệm",
      desc: "Cho phép các địa phương tiên phong mở rộng mô hình ở quy mô thành phố/tỉnh (Nghị quyết 24 Thành ủy Hải Phòng, cơ chế bù giá Long An).",
    },
    {
      step: "05",
      name: "Thể Chế Hóa Vĩ Mô",
      tag: "Đường lối quốc gia",
      desc: "Trung ương tổng kết thực tiễn, nâng tầm thành các quyết sách toàn quốc: Nghị quyết TW6 (1979), Chỉ thị 100 và Quyết định 25/26-CP (1981).",
    },
  ];

  return (
    <section
      id="hoc-hoi"
      className="relative w-full bg-[#E5E0D8] px-6 md:px-16 lg:px-24 py-28 md:py-36 overflow-hidden border-t border-[#3D3529]/10"
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-20">
          <div className="gsap-reveal flex items-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-[#8B261D] gsap-line-draw" />
            <span
              className="text-xs uppercase tracking-[0.25em] font-bold text-[#8B261D]"
              style={{ fontFamily: f2 }}
            >
              Phần 4 • Mô Hình Lý Luận
            </span>
          </div>

          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#3D3529] mb-6 leading-tight"
            style={{ fontFamily: f1 }}
          >
            <span className="gsap-text-reveal block">Cơ Chế Học Hỏi Chính Sách</span>
            <span className="gsap-text-reveal block italic font-light text-[#7A6040]">
              Quy Trình Thích Ứng 5 Giai Đoạn Từ Dưới Lên
            </span>
          </h2>

          <p
            className="gsap-reveal text-base md:text-lg text-[#5A4632] max-w-3xl leading-relaxed font-light"
            style={{ fontFamily: f2 }}
          >
            Tiến trình đổi mới 1979–1981 phản ánh quy trình học hỏi thích ứng từ thực tiễn: Đảng lắng nghe sáng kiến từ người dân, khảo nghiệm thực địa và thể chế hóa thành đường lối.
          </p>
        </div>

        {/* 5-Step Learning Loop Visual */}
        <div className="relative mb-24">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
            {steps.map((s, idx) => (
              <div
                key={s.step}
                className="gsap-stagger-child p-6 bg-white rounded-2xl border border-[#3D3529]/10 hover:border-[#8B261D] hover:-translate-y-1.5 transition-all duration-300 shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-3xl font-light text-[#8B261D]"
                      style={{ fontFamily: f1 }}
                    >
                      {s.step}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8B261D]" />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A028] block mb-2">
                    {s.tag}
                  </span>

                  <h4
                    className="text-base font-bold text-[#3D3529] mb-3 group-hover:text-[#8B261D] transition-colors leading-snug"
                    style={{ fontFamily: f1 }}
                  >
                    {s.name}
                  </h4>

                  <p className="text-xs text-[#6B5744] leading-relaxed font-light">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EDE8E1] flex items-center justify-between text-[11px] font-semibold text-[#7A6040]">
                  <span>Giai đoạn {idx + 1}</span>
                  <span className="text-[#8B261D] font-bold">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trích Dẫn & Triết Lý Lãnh Đạo */}
        <div className="gsap-scale-in p-8 md:p-12 bg-[#3D3529] text-[#EDE8E1] rounded-3xl border border-[#3D3529] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs uppercase tracking-widest font-bold text-[#C5A028]">
                Bản Lĩnh Đổi Mới Của Đảng
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-white leading-snug" style={{ fontFamily: f1 }}>
                Tôn Trọng Thực Tiễn Khách Quan & Nguyện Vọng Nhân Dân
              </h3>
              <p className="text-sm md:text-base text-[#EDE8E1]/80 leading-relaxed font-light">
                Điểm cốt lõi làm nên thắng lợi của giai đoạn 1979–1981 chính là <strong>tinh thần cầu thị</strong> của Đảng: Không dùng mệnh lệnh hành chính thô bạo để bóp nghẹt sáng kiến của dân, mà cử các đồng chí lãnh đạo cao nhất về tận ruộng đồng, xí nghiệp để đối thoại, kiểm chứng và thể chế hóa nguyện vọng chính đáng của nhân dân.
              </p>
            </div>

            <div className="lg:col-span-4 p-6 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-sm">
              <p
                className="text-lg text-[#EDE8E1] italic leading-relaxed mb-3"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                "Thực tiễn là tiêu chuẩn của chân lý. Không thể ngồi trong phòng giấy mà áp đặt các quy định chủ quan cho cuộc sống."
              </p>
              <span className="text-xs font-bold text-[#C5A028] uppercase tracking-wider block">
                — Đồng chí Trường Chinh
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
