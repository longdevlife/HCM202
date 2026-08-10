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
              GROUP 2
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
            className="gsap-reveal text-sm md:text-base text-[#C5A028] font-semibold tracking-[0.15em] uppercase mb-8"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Về Nhà Nước Pháp Quyền
          </p>

          <p
            className="gsap-reveal text-base md:text-lg text-[#7A6040] max-w-xl leading-relaxed font-light mb-12 drop-shadow-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Một nhà nước thực sự "của nhân dân, do nhân dân và vì nhân dân". Sự
            kết hợp hài hoà giữa tính hợp pháp, tính thượng tôn pháp luật và
            pháp quyền nhân nghĩa trong hệ thống chính trị Việt Nam.
          </p>

          <div className="gsap-reveal flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <a
              href="#dat-van-de"
              className="magnetic-btn group/btn flex items-center gap-4 px-6 py-3 bg-[#3D3529] text-[#EDE8E1] rounded-full transition-all duration-500 hover:bg-[#C5A028] hover:-translate-y-0.5 shadow-[0_8px_24px_-8px_rgba(61,53,41,0.3)]"
            >
              <span
                className="font-semibold tracking-[0.08em] text-xs uppercase"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Bắt Đầu Hành Trình
              </span>
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </a>
            <a
              href="#co-so-ly-thuyet"
              className="magnetic-btn group flex items-center gap-3 px-6 py-3 rounded-full border border-[#3D3529]/20 text-[#3D3529] bg-[#EDE8E1]/50 backdrop-blur-sm transition-all duration-500 hover:border-[#C5A028] hover:text-[#C5A028] hover:-translate-y-0.5"
            >
              <span
                className="font-semibold text-xs tracking-[0.08em] uppercase"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Khám Phá Lý Thuyết
              </span>
            </a>
          </div>

          <div className="mt-14 flex flex-wrap gap-3">
            {[
              "Hợp Hiến Hợp Pháp",
              "Thượng Tôn Pháp Luật",
              "Pháp Quyền Nhân Nghĩa",
            ].map((tag) => (
              <span
                key={tag}
                className={`gsap-reveal px-4 py-2 rounded-full border border-[#3D3529]/10 bg-[#EDE8E1]/30 backdrop-blur-sm text-[10px] uppercase font-semibold tracking-[0.1em] text-[#7A6040]/80 cursor-default transition-colors duration-300 hover:border-[#C5A028]/40 hover:text-[#C5A028]`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
