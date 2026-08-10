import { useEffect, useState, useRef } from 'react';

/**
 * LeninPresenter — Sticky Lenin figure that "guides" through theory sections
 * Uses GSAP ScrollTrigger for scroll-driven position & speech bubble changes
 * NO background box — just the cutout Lenin image floating
 */
export default function LeninPresenter() {
  const containerRef = useRef(null);
  const [activeSection, setActiveSection] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  const speeches = {
    'dat-van-de': 'Hiến pháp và luật pháp là công cụ cốt lõi để bảo vệ nhân dân!',
    'co-so-ly-thuyet': 'Pháp luật phải nghiêm minh, tuyệt đối không có vùng cấm...',
    'giai-phap': 'Một nhà nước thực sự của dân, do dân, vì dân!',
  };

  // Typewriter effect
  useEffect(() => {
    if (!activeSection || !isVisible) {
      setDisplayedText('');
      return;
    }
    const fullText = speeches[activeSection];
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      setDisplayedText(fullText.substring(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(timer);
    }, 40); // speed of typing
    return () => clearInterval(timer);
  }, [activeSection, isVisible]);

  useEffect(() => {
    let ctx;
    const init = async () => {
      try {
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);

        const sections = ['dat-van-de', 'co-so-ly-thuyet', 'giai-phap'];

        ctx = gsap.context(() => {
          sections.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;

            ScrollTrigger.create({
              trigger: el,
              start: 'top 60%',
              end: 'bottom 40%',
              onEnter: () => {
                setActiveSection(id);
                setIsVisible(true);
              },
              onEnterBack: () => {
                setActiveSection(id);
                setIsVisible(true);
              },
              onLeave: () => {
                if (id === 'giai-phap') setIsVisible(false);
              },
              onLeaveBack: () => {
                if (id === 'dat-van-de') setIsVisible(false);
              },
            });
          });
        });
      } catch (e) {
        console.warn('LeninPresenter: GSAP not available', e);
      }
    };

    init();
    return () => { if (ctx) ctx.revert(); };
  }, []);

  return (
    <>
      {/* Container 1: Lenin Image with mixBlendMode applied to the PARENT to bypass stacking context isolation */}
      <div
        ref={containerRef}
        className="hidden lg:block fixed right-4 bottom-0 z-40 pointer-events-none"
        style={{
          transition: 'opacity 0.8s cubic-bezier(0.32, 0.72, 0, 1), transform 0.8s cubic-bezier(0.32, 0.72, 0, 1)',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          mixBlendMode: 'darken'
        }}
      >
        <img
          src="/textures/lenin_pointing.png"
          alt="Lenin pointing"
          className="w-[200px] h-auto relative z-0"
          style={{
            filter: 'contrast(1.15)',
            transition: 'transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        />
      </div>

      {/* Container 2: Speech Bubble — floating ABOVE Lenin */}
      <div
        className="hidden lg:block fixed right-[150px] bottom-[210px] z-50 pointer-events-none w-max"
        style={{
          transition: 'opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s',
          opacity: isVisible && activeSection ? 1 : 0,
          transform: isVisible && activeSection ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
        }}
      >
        <div
          className="relative bg-[#FDFBF7]/95 backdrop-blur-xl rounded-2xl px-6 py-4 max-w-[260px]"
          style={{
            fontFamily: "'Inter', sans-serif",
            boxShadow: '0 12px 40px -8px rgba(61,53,41,0.2)',
            border: '1px solid rgba(61,53,41,0.08)',
          }}
        >
          {/* Typewriter text */}
          <p className="text-[#3D3529] text-sm leading-relaxed font-medium min-h-[40px]">
            {displayedText}
            <span className="inline-block w-[2px] h-[1em] bg-[#C5A028] ml-0.5 align-middle animate-pulse" style={{ animationDuration: '0.8s' }}></span>
          </p>
          
          {/* Tail arrow pointing DOWN */}
          <div className="absolute right-[40px] bottom-[-10px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-[#FDFBF7]/95" />
        </div>
      </div>
    </>
  );
}
