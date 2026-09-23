import { useState } from "react";

export const IntroScreen = ({ onEnter }) => {
  const [isHiding, setIsHiding] = useState(false);

  const handleEnter = () => {
    setIsHiding(true);
    setTimeout(() => {
      onEnter();
    }, 1000);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isHiding ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{ background: '#F5F0E8' }}
    >
      <div className="noise-overlay" />

      {/* Top Left Group 3 Label */}
      <div className="absolute top-8 left-8 z-20 opacity-0 animate-[fadeIn_1s_ease_0.3s_forwards]">
        <span 
          className="text-xs md:text-sm tracking-[0.2em] uppercase"
          style={{ fontFamily: "'Inter', sans-serif", color: '#8B7355', fontWeight: 600 }}
        >
          Group 3
        </span>
      </div>

      {/* Book Cover Content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-5xl px-6">
        
        {/* Issue info */}
        <div 
          className="flex items-center gap-3 mb-6 opacity-0 animate-[fadeIn_1s_ease_0.3s_forwards]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <span className="text-[10px] tracking-[0.3em] uppercase font-semibold" style={{ color: '#8B7355' }}>Chủ Nghĩa Xã Hội Khoa Học</span>
          <span style={{ color: '#C5272D', fontSize: '8px' }}>●</span>
          <span className="text-[10px] tracking-[0.3em] uppercase font-semibold" style={{ color: '#8B7355' }}>Chương 5: Cơ Cấu Xã Hội – Giai Cấp</span>
        </div>

        {/* Masthead — Book title */}
        <h1
          className="text-2xl md:text-3xl font-semibold mb-4 opacity-0 animate-[slideInFromTop_1s_ease_0.5s_forwards]"
          style={{ fontFamily: "'EB Garamond', serif", color: '#C5272D', letterSpacing: '0.15em', textTransform: 'uppercase' }}
        >
          Sách Học Thuật Chuyên Đề
        </h1>
        
        <h2
          className="text-3xl md:text-5xl font-bold mb-4 opacity-0 animate-[slideInFromTop_1s_ease_0.7s_forwards] w-full"
          style={{ fontFamily: "'EB Garamond', serif", color: '#1A1A1A', lineHeight: 1.4 }}
        >
          CƠ CẤU XÃ HỘI – GIAI CẤP TRONG THỜI KỲ QUÁ ĐỘ LÊN CHỦ NGHĨA XÃ HỘI
        </h2>

        {/* Decorative line */}
        <div className="flex items-center gap-3 my-5 opacity-0 animate-[fadeIn_1s_ease_1s_forwards]">
          <div className="w-16 h-[1px]" style={{ background: '#C5272D' }} />
          <span style={{ color: '#C5272D', fontSize: '10px' }}>✦</span>
          <div className="w-16 h-[1px]" style={{ background: '#C5272D' }} />
        </div>

        {/* Subtitle */}
        <p
          className="tracking-[0.15em] uppercase text-xs mb-3 opacity-0 animate-[fadeIn_1s_ease_1.1s_forwards]"
          style={{ fontFamily: "'Inter', sans-serif", color: '#8B7355' }}
        >
          CHUYÊN KHẢO LÝ LUẬN & THỰC TIỄN VIỆT NAM • BỘ 3 TẬP SÁCH 3D
        </p>

        {/* Tagline */}
        <p
          className="text-sm md:text-base max-w-md mx-auto leading-relaxed mb-10 opacity-0 animate-[fadeIn_1s_ease_1.3s_forwards]"
          style={{ fontFamily: "'EB Garamond', serif", color: '#5C5044', fontStyle: 'italic' }}
        >
          Nghiên cứu vị trí, quy luật biến đổi và sứ mệnh liên minh các giai cấp, tầng lớp trong thời kỳ quá độ
        </p>

        {/* CTA Button */}
        <button
          onClick={handleEnter}
          className="group relative overflow-hidden rounded-full text-sm tracking-[0.1em] uppercase transition-transform hover:scale-105 active:scale-95 opacity-0 animate-[fadeIn_1s_ease_1.6s_forwards]"
          style={{ 
            fontFamily: "'Inter', sans-serif", 
            background: '#1A1A1A', 
            color: '#FEFCF6',
            padding: '14px 36px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)' 
          }}
        >
          <span className="relative z-10 flex items-center gap-3">
            Khám phá Thư viện Sách
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </span>
          <div className="absolute inset-0 bg-[#C5272D] translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-y-0" />
        </button>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-10 text-center opacity-0 animate-[fadeIn_1s_ease_2.2s_forwards]">
        <p className="text-[10px] uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif", color: '#8B7355', opacity: 0.5 }}>
          Sử dụng tai nghe & chuột để có trải nghiệm tốt nhất
        </p>
      </div>
    </div>
  );
};
