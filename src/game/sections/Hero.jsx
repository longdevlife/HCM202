export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] w-full bg-[#EDE8E1] flex items-center overflow-hidden"
    >
      {/* Subtle warm ambient background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#C5A028]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#8B261D]/10 blur-[100px]" />
      </div>

      {/* Background illustration with parallax & soft blend */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-end">
        <div
          className="absolute inset-0 z-10 hidden md:block"
          style={{
            background:
              "linear-gradient(to right, #EDE8E1 0%, #EDE8E1 40%, rgba(237,232,225,0.6) 65%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-10 md:hidden"
          style={{
            background:
              "linear-gradient(to top, #EDE8E1 0%, rgba(237,232,225,0.95) 45%, rgba(237,232,225,0.5) 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to top, #EDE8E1 0%, rgba(237,232,225,0.1) 15%, transparent 40%)",
          }}
        />

        <img
          src="/!!!!ảnh nền.png"
          alt="Lịch Sử Đảng 1979-1981"
          className="gsap-parallax h-[100dvh] md:h-[110dvh] w-full md:w-[60%] object-cover object-center z-0 opacity-75 mix-blend-multiply"
          data-speed="0.15"
          style={{
            filter: "contrast(1.1) brightness(0.95) saturate(0.85)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 25%)",
            maskImage: "linear-gradient(to right, transparent 0%, black 25%)",
          }}
        />
      </div>

      {/* Editorial Content */}
      <div className="w-full md:w-[75%] lg:w-[65%] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-24 md:py-32 relative z-10 hero-content-fade">
        <div>
          {/* Tag Header */}
          <div className="gsap-reveal flex items-center gap-3 mb-6">
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B261D]/10 border border-[#8B261D]/20 text-[11px] uppercase tracking-[0.2em] font-bold text-[#8B261D]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              CHUYÊN ĐỀ VNR-T17 • GROUP 1
            </span>
            <span className="text-[#7A6040] text-xs font-semibold tracking-wider">
              1979 – 1981
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.1] tracking-tight text-[#3D3529] mb-6 drop-shadow-sm font-bold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <span className="gsap-text-reveal block font-light italic text-[#7A6040] text-xl sm:text-3xl md:text-4xl mb-3">
              Tổng Luận Biện Chứng &
            </span>
            <span className="gsap-text-reveal block text-[#8B261D]">
              BÀI HỌC QUẢN TRỊ THỜI ĐẠI
            </span>
          </h1>

          <p
            className="gsap-reveal text-xs md:text-sm text-[#8B261D] font-semibold tracking-[0.18em] uppercase mb-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Giải mã bước chuyển biến lịch sử "Sản xuất bung ra" (1979–1981)
          </p>

          <p
            className="gsap-reveal text-base md:text-lg text-[#5A4632] max-w-2xl leading-relaxed font-light mb-8"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            dưới lăng kính Triết học Mác - Lênin và Khoa học Chính sách Thích ứng (Adaptive Policy Learning).
          </p>

          {/* Historic Quote */}
          <div className="gsap-reveal mb-10 pl-6 border-l-4 border-[#8B261D] bg-white/50 p-5 rounded-r-2xl backdrop-blur-sm max-w-2xl shadow-sm">
            <p className="text-lg md:text-xl text-[#3D3529] font-medium leading-relaxed italic" style={{ fontFamily: "'EB Garamond', serif" }}>
              "Thực tiễn là tiêu chuẩn của chân lý. Không thể ngồi trong phòng giấy mà áp đặt các quy định chủ quan cho cuộc sống."
            </p>
            <p className="text-xs mt-3 text-[#7A6040] font-bold tracking-wider uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
              — Đồng chí Trường Chinh (Khảo sát thực tế cơ sở, 1979)
            </p>
          </div>

          {/* Jump Navigation Tags */}
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "01. Mâu Thuẫn Kinh Tế", link: "#boi-canh" },
              { label: "02. Nhận Thức Chân Lý", link: "#xe-rao" },
              { label: "03. Phủ Định Biện Chứng", link: "#dot-pha" },
              { label: "04. Chuyển Hóa Lượng - Chất", link: "#hoc-hoi" },
              { label: "05. Bài Học Chiến Lược", link: "#di-san" },
            ].map((tag) => (
              <a
                key={tag.label}
                href={tag.link}
                className="gsap-reveal px-4 py-2 rounded-full border border-[#3D3529]/15 bg-white/70 backdrop-blur-sm text-[11px] uppercase font-semibold tracking-[0.04em] text-[#5A4632] transition-all duration-300 hover:border-[#8B261D] hover:text-[#8B261D] hover:bg-white hover:shadow-sm"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {tag.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
