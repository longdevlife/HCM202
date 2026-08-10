import { useEffect } from 'react';

/**
 * GSAP ScrollTrigger Animation Hook
 * Uses gsap.from() with ScrollTrigger for scroll-driven reveals.
 * Key fix: uses `once: true` on all triggers and calls ScrollTrigger.refresh()
 * after a frame to handle elements already in viewport on load.
 */
export default function useGsapAnimations() {
  useEffect(() => {
    let ctx;
    let timeout;

    const initGsap = async () => {
      try {
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');

        gsap.registerPlugin(ScrollTrigger);

        // Small delay to let React finish painting the DOM
        timeout = setTimeout(() => {
          ctx = gsap.context(() => {

            // ── 1. Basic reveals (fade up) ──
            gsap.utils.toArray('.gsap-reveal').forEach((el) => {
              gsap.fromTo(el,
                { y: 40, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.9,
                  ease: 'power3.out',
                  scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                    once: true,
                  },
                }
              );
            });

            // ── 2. Text split word reveal ──
            gsap.utils.toArray('.gsap-text-reveal').forEach((el) => {
              const text = el.textContent.trim();
              if (!text) return;
              const words = text.split(/\s+/);
              el.innerHTML = words
                .map((w) => `<span class="gsap-word" style="display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.4em;margin-bottom:-0.4em;padding-top:0.2em;margin-top:-0.2em;padding-right:0.05em;margin-right:-0.05em;"><span style="display:inline-block">${w}</span></span>`)
                .join(' ');

              const innerSpans = el.querySelectorAll('.gsap-word > span');
              gsap.fromTo(innerSpans,
                { y: '110%', opacity: 0 },
                {
                  y: '0%',
                  opacity: 1,
                  duration: 0.7,
                  stagger: 0.04,
                  ease: 'power3.out',
                  scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                    once: true,
                  },
                }
              );
            });

            // ── 3. Stagger cards (progressive revelation) ──
            gsap.utils.toArray('.gsap-stagger-parent').forEach((parent) => {
              const children = parent.querySelectorAll('.gsap-stagger-child');
              if (!children.length) return;
              gsap.fromTo(children,
                { y: 50, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.8,
                  stagger: 0.12,
                  ease: 'power3.out',
                  scrollTrigger: {
                    trigger: parent,
                    start: 'top 88%',
                    once: true,
                  },
                }
              );
            });

            // ── 4. Scale-in cards ──
            gsap.utils.toArray('.gsap-scale-in').forEach((el) => {
              gsap.fromTo(el,
                { scale: 0.92, opacity: 0 },
                {
                  scale: 1,
                  opacity: 1,
                  duration: 0.8,
                  ease: 'power3.out',
                  scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    once: true,
                  },
                }
              );
            });

            // ── 5. Slide from left ──
            gsap.utils.toArray('.gsap-slide-left').forEach((el) => {
              gsap.fromTo(el,
                { x: -60, opacity: 0 },
                {
                  x: 0,
                  opacity: 1,
                  duration: 0.9,
                  ease: 'power3.out',
                  scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    once: true,
                  },
                }
              );
            });

            // ── 6. Slide from right ──
            gsap.utils.toArray('.gsap-slide-right').forEach((el) => {
              gsap.fromTo(el,
                { x: 60, opacity: 0 },
                {
                  x: 0,
                  opacity: 1,
                  duration: 0.9,
                  ease: 'power3.out',
                  scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    once: true,
                  },
                }
              );
            });

            // ── 7. Counter animation ──
            gsap.utils.toArray('.gsap-counter').forEach((el) => {
              const originalText = el.textContent;
              const target = parseInt(el.dataset.target || originalText, 10);
              if (isNaN(target)) return;
              const suffix = originalText.includes('.') ? '.' : '';
              
              // Only pad if the original text had a leading zero
              const padLength = originalText.startsWith('0') ? 2 : 0;

              const obj = { val: 0 };
              gsap.to(obj, {
                val: target,
                duration: 1.5,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 90%',
                  once: true,
                },
                onUpdate: () => {
                  let strVal = Math.round(obj.val).toString();
                  if (padLength > 0) {
                    strVal = strVal.padStart(padLength, '0');
                  }
                  el.textContent = strVal + suffix;
                },
              });
            });

            // ── 8. Line draw effect ──
            gsap.utils.toArray('.gsap-line-draw').forEach((el) => {
              gsap.fromTo(el,
                { scaleX: 0 },
                {
                  scaleX: 1,
                  transformOrigin: 'left center',
                  duration: 1,
                  ease: 'power2.inOut',
                  scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                    once: true,
                  },
                }
              );
            });

            // ── 9. Parallax elements ──
            gsap.utils.toArray('.gsap-parallax').forEach((el) => {
              const speed = parseFloat(el.dataset.speed || '0.3');
              gsap.to(el, {
                y: () => -speed * 100,
                ease: 'none',
                scrollTrigger: {
                  trigger: el.closest('section') || el.parentElement,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1,
                },
              });
            });

            // ── 10. Hero fade-out on scroll ──
            const heroSection = document.querySelector('#hero');
            if (heroSection) {
              const heroContent = heroSection.querySelector('.hero-content-fade');
              if (heroContent) {
                gsap.to(heroContent, {
                  opacity: 0,
                  y: -30,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: heroSection,
                    start: 'top top',
                    end: '60% top',
                    scrub: 1,
                  },
                });
              }
            }

            // ── 11. Quote highlight ──
            gsap.utils.toArray('.gsap-quote-highlight').forEach((el) => {
              gsap.fromTo(el,
                { backgroundSize: '0% 100%' },
                {
                  backgroundSize: '100% 100%',
                  duration: 1.2,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    once: true,
                  },
                }
              );
            });

          }); // end gsap.context

          // Force recalculation — handles elements already in viewport
          ScrollTrigger.refresh();

        }, 100); // end setTimeout

      } catch (e) {
        // Fallback: if GSAP fails to load, just show everything
        console.warn('GSAP not loaded, showing all elements:', e);
        document.querySelectorAll(
          '.gsap-reveal, .gsap-text-reveal, .gsap-stagger-child, .gsap-scale-in, .gsap-slide-left, .gsap-slide-right'
        ).forEach((el) => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }
    };

    initGsap();

    return () => {
      if (timeout) clearTimeout(timeout);
      if (ctx) ctx.revert();
    };
  }, []);
}
