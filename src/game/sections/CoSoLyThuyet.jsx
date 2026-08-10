export default function CoSoLyThuyet() {
  const f1 = "'Playfair Display', serif";
  const f2 = "'Inter', sans-serif";

  const characteristics = [
    { t: "500 Đại biểu", i: "Quốc hội" },
    { t: "180 Phiếu", i: "LHQ" },
    { t: "304.000 Tỷ", i: "Vạn Thịnh Phát" },
    { t: "Giảm 46.5%", i: "Nồng độ cồn" },
  ];

  return (
    <section
      id="co-so-ly-thuyet"
      className="relative w-full bg-[#E5E0D8] px-4 py-32 md:py-40 overflow-hidden"
    >
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto mb-24 md:mb-32">
        <div className="gsap-reveal flex items-center gap-3 mb-6">
          <div className="h-[1px] w-12 bg-[#3D3529]/15 gsap-line-draw" />
          <span
            className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#7A6040]"
            style={{ fontFamily: f2 }}
          >
            Phần 2
          </span>
        </div>
        <h2
          className="text-5xl md:text-7xl font-bold tracking-tight text-[#3D3529] mb-8 leading-snug"
          style={{ fontFamily: f1 }}
        >
          <span className="gsap-text-reveal block pb-2 md:pb-3">Liên Hệ</span>
          <span className="gsap-text-reveal block italic font-light text-[#7A6040] pt-1">
            Thực Tiễn
          </span>
        </h2>
        <p
          className="gsap-reveal text-lg text-[#7A6040] max-w-2xl leading-relaxed font-light"
          style={{ fontFamily: f2 }}
        >
          Việc xây dựng Nhà nước pháp quyền XHCN tại Việt Nam trong bối cảnh hội
          nhập đạt nhiều thành tựu nhưng cũng đối mặt với không ít thách thức
          hiện hữu.
        </p>
      </div>

      {/* 2 Levels — Scale-in cards */}
      <div className="w-full max-w-7xl mx-auto mb-32">
        <div className="gsap-reveal flex items-center gap-4 mb-16">
          <span
            className="text-sm tracking-[0.25em] text-[#7A6040]/60 uppercase font-semibold"
            style={{ fontFamily: f2 }}
          >
            Thực Trạng Hiện Nay
          </span>
          <div className="h-[1px] flex-1 bg-[#3D3529]/10 gsap-line-draw" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Card 1: Hợp Hiến, Hợp Pháp */}
          <div className="gsap-slide-left card-tilt group">
            <div className="h-full p-8 md:p-10 bg-white/50 rounded-[20px] border border-[#3D3529]/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(61,53,41,0.08)]">
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#7A6040]/50 mb-6 block font-semibold"
                style={{ fontFamily: f2 }}
              >
                Nhà nước hợp hiến, hợp pháp
              </span>
              <h3
                className="text-3xl font-bold text-[#3D3529] mb-3"
                style={{ fontFamily: f1 }}
              >
                Tính Hợp Hiến & Hợp Pháp
              </h3>
              <span
                className="text-[#C5A028] text-sm font-medium mb-6 block italic"
                style={{ fontFamily: f1 }}
              >
                Bầu cử QH khóa XVI & HĐ Nhân quyền
              </span>
              <p
                className="text-[#7A6040] text-base leading-relaxed font-light mb-8"
                style={{ fontFamily: f2 }}
              >
                Bầu cử Quốc hội khóa XVI có 864 người ứng cử, xác nhận 500 đại
                biểu (27/3/2026). Việt Nam tái đắc cử Hội đồng Nhân quyền LHQ
                (2026–2028) với 180 phiếu ủng hộ, khẳng định tư cách pháp lý
                vững chắc trên trường quốc tế.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "500 Đại biểu",
                  "180 Phiếu LHQ",
                  "Bầu cử 2026",
                  "Hợp hiến",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs text-[#7A6040] bg-[#EDE8E1] rounded-full border border-[#3D3529]/5"
                    style={{ fontFamily: f2 }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Pháp quyền nhân nghĩa */}
          <div className="gsap-slide-right card-tilt group">
            <div className="h-full p-8 md:p-10 bg-[#3D3529] rounded-[20px] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(61,53,41,0.2)]">
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#C5A028]/80 mb-6 block font-semibold"
                style={{ fontFamily: f2 }}
              >
                Pháp quyền nhân nghĩa
              </span>
              <h3
                className="text-3xl font-bold text-[#EDE8E1] mb-3"
                style={{ fontFamily: f1 }}
              >
                Đặc Xá & Khoan Hồng Nhân Đạo
              </h3>
              <span
                className="text-[#C5A028] text-sm font-medium mb-6 block italic"
                style={{ fontFamily: f1 }}
              >
                Chính sách Đặc xá 2025 & Chuyến bay giải cứu
              </span>
              <p
                className="text-[#EDE8E1]/70 text-base leading-relaxed font-light mb-8"
                style={{ fontFamily: f2 }}
              >
                Thể hiện tinh thần nhân văn sâu sắc qua đợt đặc xá Quốc khánh 2/9/2025 với hơn 10.000 hồ sơ được xem xét nghiêm ngặt. Đồng thời, vụ án phúc thẩm “Chuyến bay giải cứu” (2023) giảm án cho các bị cáo thành khẩn khắc phục hậu quả là minh chứng sinh động cho pháp luật nghiêm minh nhưng đầy tính cảm hóa.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Đặc xá 2/9/2025",
                  "Khoan hồng nhân đạo",
                  "Khắc phục hậu quả",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs text-[#C5A028] bg-[#C5A028]/10 rounded-full border border-[#C5A028]/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Card 3: Đại án Vạn Thịnh Phát */}
          <div className="gsap-slide-left card-tilt group">
            <div className="h-full p-8 md:p-10 bg-white/50 rounded-[20px] border border-[#3D3529]/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(61,53,41,0.08)]">
              <h3
                className="text-3xl font-bold text-[#3D3529] mb-6"
                style={{ fontFamily: f1 }}
              >
                Đại án Vạn Thịnh Phát
              </h3>
              <p
                className="text-[#7A6040] text-base leading-relaxed font-light mb-8"
                style={{ fontFamily: f2 }}
              >
                Cho thấy người có tiềm lực kinh tế lớn vẫn phải chịu trách nhiệm
                trước pháp luật: 86 bị can truy tố, bà Trương Mỹ Lan chiếm đoạt
                hơn 304.000 tỷ đồng, tuyên án tử hình phúc thẩm.
              </p>
              <div className="pl-6 border-l-2 border-[#C5A028]">
                <p
                  className="gsap-quote-highlight text-[#3D3529]/90 italic font-medium"
                  style={{
                    fontFamily: f1,
                    backgroundImage:
                      "linear-gradient(to right, rgba(197,160,40,0.12), rgba(197,160,40,0.12))",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "100% 100%",
                    backgroundPosition: "0 0",
                    padding: "0.2em 0",
                  }}
                >
                  "Thượng tôn pháp luật không chỉ để xử phạt mà còn bảo vệ lợi
                  ích nhân dân."
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Nghị định 168 */}
          <div className="gsap-slide-right card-tilt group">
            <div className="h-full p-8 md:p-10 bg-[#C5A028] rounded-[20px] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(197,160,40,0.3)]">
              <h3
                className="text-3xl font-bold text-white mb-6"
                style={{ fontFamily: f1 }}
              >
                Nghị định 168 (Nồng độ cồn)
              </h3>
              <p
                className="text-white/90 text-base leading-relaxed font-light"
                style={{ fontFamily: f2 }}
              >
                Sau 3 tháng thực hiện, số vi phạm giảm 46,5%. Trong 4 ngày nghỉ
                lễ 30/4–3/5/2026, phát hiện 11.411 trường hợp vi phạm, xử lý
                theo phương châm "không có vùng cấm, không có ngoại lệ".
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Characteristics — Domino stagger effect */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="gsap-reveal flex items-center justify-center gap-4 mb-16">
          <div className="h-[1px] w-12 bg-[#3D3529]/15 gsap-line-draw" />
          <span
            className="text-sm tracking-[0.25em] text-[#7A6040]/60 uppercase font-semibold"
            style={{ fontFamily: f2 }}
          >
            Những Con Số Biết Nói
          </span>
          <div className="h-[1px] w-12 bg-[#3D3529]/15 gsap-line-draw" />
        </div>
        <div className="gsap-stagger-parent grid grid-cols-2 md:grid-cols-4 gap-4">
          {characteristics.map((item) => (
            <div
              key={item.t}
              className="gsap-stagger-child card-tilt flex flex-col items-center justify-center p-6 bg-white/50 rounded-[16px] border border-[#3D3529]/5 hover:bg-white hover:shadow-sm transition-all duration-300 group"
            >
              <span
                className="text-lg font-light text-[#C5A028] mb-2"
                style={{ fontFamily: f1 }}
              >
                {item.i}
              </span>
              <span
                className="text-[#3D3529] text-sm font-medium text-center"
                style={{ fontFamily: f2 }}
              >
                {item.t}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
