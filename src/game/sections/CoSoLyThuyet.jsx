export default function CoSoLyThuyet() {
  const f1 = "'Playfair Display', serif";
  const f2 = "'Inter', sans-serif";

  const characteristics = [
    { t: "Dịch vụ công trực tuyến", i: "100%" },
    { t: "Tài khoản VNeID", i: ">70 Triệu" },
    { t: "Xử lý phản ánh minh bạch", i: "100%" },
    { t: "Xác minh dư luận MXH", i: "24H" },
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
            Thực Tiễn Kỷ Nguyên Số
          </span>
        </h2>
        <p
          className="gsap-reveal text-lg text-[#7A6040] max-w-2xl leading-relaxed font-light"
          style={{ fontFamily: f2 }}
        >
          Lắng nghe dư luận, thực hành dân chủ trực tiếp và nâng cao hiệu quả quản trị quốc gia hiện đại theo Tinh thần Hồ Chí Minh trong môi trường số hóa.
        </p>
      </div>

      {/* 2 Levels — Scale-in cards */}
      <div className="w-full max-w-7xl mx-auto mb-32">
        <div className="gsap-reveal flex items-center gap-4 mb-16">
          <span
            className="text-sm tracking-[0.25em] text-[#7A6040]/60 uppercase font-semibold"
            style={{ fontFamily: f2 }}
          >
            Thực Trạng Kỷ Nguyên Số
          </span>
          <div className="h-[1px] flex-1 bg-[#3D3529]/10 gsap-line-draw" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Card 1 */}
          <div className="gsap-slide-left card-tilt group">
            <div className="h-full p-8 md:p-10 bg-white/50 rounded-[20px] border border-[#3D3529]/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(61,53,41,0.08)]">
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#7A6040]/50 mb-6 block font-semibold"
                style={{ fontFamily: f2 }}
              >
                Block 01
              </span>
              <h3
                className="text-3xl font-bold text-[#3D3529] mb-3"
                style={{ fontFamily: f1 }}
              >
                Dân Chủ Trực Tiếp Qua App Công Dân
              </h3>
              <span
                className="text-[#C5A028] text-sm font-medium mb-6 block italic"
                style={{ fontFamily: f1 }}
              >
                Ứng dụng Phản ánh Hiện trường (Huế-S, 1022, VNeID)
              </span>
              <p
                className="text-[#7A6040] text-base leading-relaxed font-light mb-8"
                style={{ fontFamily: f2 }}
              >
                Người dân trực tiếp gửi phản ánh, góp ý chính sách real-time đến chính quyền. Quy trình xử lý được công khai, minh bạch và dân được trực tiếp đánh giá mức độ hài lòng đối với cán bộ, công chức.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Phản ánh hiện trường",
                  "Đánh giá cán bộ",
                  "Minh bạch xử lý",
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

          {/* Card 2 */}
          <div className="gsap-slide-right card-tilt group">
            <div className="h-full p-8 md:p-10 bg-[#3D3529] rounded-[20px] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(61,53,41,0.2)]">
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#C5A028]/80 mb-6 block font-semibold"
                style={{ fontFamily: f2 }}
              >
                Block 02
              </span>
              <h3
                className="text-3xl font-bold text-[#EDE8E1] mb-3"
                style={{ fontFamily: f1 }}
              >
                Chính Phủ Số - Bỏ "Xin Cho"
              </h3>
              <span
                className="text-[#C5A028] text-sm font-medium mb-6 block italic"
                style={{ fontFamily: f1 }}
              >
                Cổng Dịch vụ công Trực tuyến toàn trình & Đề án 06
              </span>
              <p
                className="text-[#EDE8E1]/70 text-base leading-relaxed font-light mb-8"
                style={{ fontFamily: f2 }}
              >
                Hiện thực hóa Nhà nước "Vì Dân". Thực hiện thủ tục trực tuyến giúp triệt tiêu nhũng nhiễu vặt, giảm chi phí và thời gian cho dân, lấy sự tiện lợi của nhân dân làm thước đo đánh giá hiệu quả phục vụ.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Dịch vụ công",
                  "Không nhũng nhiễu",
                  "Lấy dân làm trung tâm",
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
          {/* Card 3 */}
          <div className="gsap-slide-left card-tilt group">
            <div className="h-full p-8 md:p-10 bg-white/50 rounded-[20px] border border-[#3D3529]/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(61,53,41,0.08)]">
              <h3
                className="text-3xl font-bold text-[#3D3529] mb-6"
                style={{ fontFamily: f1 }}
              >
                Giám Sát Công Quyền MXH
              </h3>
              <p
                className="text-[#7A6040] text-base leading-relaxed font-light mb-8"
                style={{ fontFamily: f2 }}
              >
                Mạng xã hội trở thành công cụ giám sát đắc lực. Dân phản ánh thái độ hạch dịch của cán bộ, buộc cơ quan phải xác minh, xử lý nghiêm minh, khẳng định cán bộ là "đầy tớ" của dân, giám sát "không vùng cấm".
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
                  "Việc gì có hại cho dân, ta phải hết sức tránh. Cán bộ là công bộc của dân."
                </p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="gsap-slide-right card-tilt group">
            <div className="h-full p-8 md:p-10 bg-[#C5A028] rounded-[20px] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(197,160,40,0.3)]">
              <h3
                className="text-3xl font-bold text-white mb-6"
                style={{ fontFamily: f1 }}
              >
                Quốc Hội Số (Trực Tuyến)
              </h3>
              <p
                className="text-white/90 text-base leading-relaxed font-light"
                style={{ fontFamily: f2 }}
              >
                Tiếp xúc cử tri trực tuyến và công khai minh bạch các kỳ họp Quốc hội trên nền tảng số giúp người dân dễ dàng theo dõi, chất vấn và thực thi quyền làm chủ một cách nhanh chóng, hiệu quả nhất.
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
