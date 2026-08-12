export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] w-full bg-[#EDE8E1] flex items-center overflow-hidden"
    >
      {/* Subtle warm ambient */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[#C5A028]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#7A6040]/5 blur-[100px]" />
      </div>

      {/* Background Portrait with parallax & soft blend */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-end">
        {/* Gradients to melt the image smoothly into the #EDE8E1 background */}
        {/* Left-to-right fade for desktop */}
        <div
          className="absolute inset-0 z-10 hidden md:block"
          style={{
            background:
              "linear-gradient(to right, #EDE8E1 0%, #EDE8E1 40%, rgba(237,232,225,0.5) 60%, transparent 100%)",
          }}
        />

        {/* Top-to-bottom fade for mobile (if portrait moves to top/background) */}
        <div
          className="absolute inset-0 z-10 md:hidden"
          style={{
            background:
              "linear-gradient(to top, #EDE8E1 0%, rgba(237,232,225,0.9) 40%, rgba(237,232,225,0.4) 100%)",
          }}
        />

        {/* Bottom fade for grounding */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to top, #EDE8E1 0%, rgba(237,232,225,0.1) 15%, transparent 40%)",
          }}
        />

        <img
          src="/!!!!ảnh nền.png"
          alt="Revolution Background"
          className="gsap-parallax h-[100dvh] md:h-[110dvh] w-full md:w-[60%] object-cover object-center z-0 opacity-85 mix-blend-multiply"
          data-speed="0.15"
          style={{
            filter: "contrast(1.15) brightness(0.95) saturate(0.9)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 25%)",
            maskImage: "linear-gradient(to right, transparent 0%, black 25%)"
          }}
        />
      </div>

      {/* Editorial Typography — fades out on scroll */}
      <div className="w-full md:w-[70%] lg:w-[60%] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-24 md:py-32 relative z-10 hero-content-fade">
        <div>
          <div className="gsap-reveal flex items-center gap-4 mb-10">
            <span
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-semibold text-[#7A6040]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <span className="w-2 h-2 rounded-full bg-[#C5A028]" />
              GROUP 5
            </span>
          </div>

          {/* Title with text-reveal animation */}
          <h1
            className="text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight text-[#3D3529] mb-6 drop-shadow-sm"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <span className="gsap-text-reveal block font-light italic text-[#7A6040] text-3xl md:text-4xl lg:text-5xl mb-3">
              Tư Tưởng
            </span>
            <span className="gsap-text-reveal block">Hồ Chí Minh</span>
          </h1>

          <p
            className="gsap-reveal text-sm md:text-base text-[#C5A028] font-semibold tracking-[0.15em] uppercase mb-6"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Về Nhà Nước Dân Chủ
          </p>

          <p
            className="gsap-reveal text-base md:text-lg text-[#7A6040] max-w-xl leading-relaxed font-light mb-8 drop-shadow-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Xây dựng mô hình quản trị quốc gia "Của dân, Do dân, Vì dân" – Sự kết hợp hài hòa giữa bản chất giai cấp công nhân và sức mạnh đại đoàn kết toàn dân tộc.
          </p>

          <div className="gsap-reveal mb-10 pl-6 border-l-2 border-[#C5A028] italic max-w-2xl">
            <p className="text-lg md:text-xl text-[#3D3529] font-medium leading-relaxed" style={{ fontFamily: "'EB Garamond', serif" }}>
              "Nước ta là nước dân chủ. Bao nhiêu lợi ích đều vì dân. Bao nhiêu quyền hạn đều của dân... Chính quyền từ xã đến Chính phủ trung ương do dân cử ra."
            </p>
            <p className="text-sm mt-3 text-[#7A6040] font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
              — Chủ tịch Hồ Chí Minh (1949)
            </p>
          </div>

          <div className="gsap-reveal flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <a
              href="#phan-1"
              className="magnetic-btn group/btn flex items-center justify-center px-8 py-3.5 bg-[#3D3529] text-[#EDE8E1] rounded-full transition-all duration-500 hover:bg-[#C5A028] hover:-translate-y-0.5 shadow-[0_8px_24px_-8px_rgba(61,53,41,0.3)]"
            >
              <span
                className="font-semibold tracking-[0.08em] text-xs uppercase"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Bắt Đầu Khám Phá
              </span>
            </a>
          </div>

          <div className="mt-14 flex flex-wrap gap-3">
            {[
              { label: "01. Cơ Sở Lý Luận", link: "#phan-1" },
              { label: "02. Liên Hệ Thực Tiễn", link: "#phan-2" },
              { label: "03. Giải Pháp Quản Trị", link: "#phan-3" },
            ].map((tag) => (
              <a
                key={tag.label}
                href={tag.link}
                className="gsap-reveal px-5 py-2.5 rounded-full border border-[#3D3529]/10 bg-[#EDE8E1]/30 backdrop-blur-sm text-[11px] uppercase font-semibold tracking-[0.05em] text-[#7A6040]/90 transition-colors duration-300 hover:border-[#C5A028]/40 hover:text-[#C5A028] hover:bg-white"
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
