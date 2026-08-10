import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";

// 10 pages: cover(front) + 4 spreads (8 inner pages) + back-cover(back)
// Each "page" object = 1 physical sheet with front and back
export const pageAtom = atom(0);
export const pages = [
  { front: "Cover page - Open", back: "2_Page_1" },
  { front: "2_Page 2", back: "3_page_1" },
  { front: "3_page_2", back: "4_page_1" },
  { front: "4_page_2", back: "5_page_1" },
  { front: "5_page_2", back: "6_page_1" },
  { front: "6_page_2", back: "7_page_1" },
  { front: "7_page_2", back: "8_page_1" },
  { front: "8_page_2", back: "9_page_1" },
  { front: "9_page_2", back: "10_page_1" },
  { front: "10_page_2", back: "cover end" },
];

const pageLabels = [
  "Bìa",
  "Trang 2",
  "Trang 3",
  "Trang 4",
  "Trang 5",
  "Trang 6",
  "Trang 7",
  "Trang 8",
  "Trang 9",
  "Trang 10",
];

export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);
  const [navVisible, setNavVisible] = useState(false);

  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.play().catch(() => {});
  }, [page]);

  return (
    <>
      <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col">
        {/* Header */}
        <div className="pointer-events-auto flex items-center justify-between px-8 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
                 style={{ background: '#C5272D' }}>
              <span className="text-white text-sm font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>M</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wider uppercase"
                  style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}>
                Karl Marx
              </h1>
              <p className="text-xs tracking-widest uppercase" style={{ color: '#8B8680', fontSize: '10px' }}>
                Tồn tại xã hội & Ý thức
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="tracking-widest uppercase" style={{ color: '#8B8680', fontSize: '10px' }}>
              Chương III • Tư Tưởng Hồ Chí Minh
            </p>
          </div>
        </div>

        {/* Bottom Nav – hover zone (pointer-events-auto so hover works) */}
        <div
          className="w-full pointer-events-auto flex justify-center"
          onMouseEnter={() => setNavVisible(true)}
          onMouseLeave={() => setNavVisible(false)}
        >
          {/* Invisible hover trigger strip */}
          <div className="absolute bottom-0 left-0 w-full h-20" />

          {/* Nav buttons */}
          <div
            className="overflow-auto flex items-center gap-3 max-w-full p-6"
            style={{
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              opacity: navVisible ? 1 : 0,
              transform: navVisible ? 'translateY(0)' : 'translateY(12px)',
              pointerEvents: navVisible ? 'auto' : 'none',
            }}
          >
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`transition-all duration-300 px-5 py-2.5 rounded-full text-xs uppercase shrink-0 border tracking-wider`}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  ...(index === page
                    ? { background: '#1A1A1A', color: '#FAFAF8', borderColor: '#1A1A1A' }
                    : { background: 'rgba(255,255,255,0.7)', color: '#8B8680', borderColor: '#d4ccc4' }
                  ),
                }}
                onClick={() => setPage(index)}
              >
                {pageLabels[index] || `Trang ${index}`}
              </button>
            ))}
            <button
              className="transition-all duration-300 px-5 py-2.5 rounded-full text-xs uppercase shrink-0 border tracking-wider"
              style={{
                fontFamily: 'Inter, sans-serif',
                ...(page === pages.length
                  ? { background: '#1A1A1A', color: '#FAFAF8', borderColor: '#1A1A1A' }
                  : { background: 'rgba(255,255,255,0.7)', color: '#8B8680', borderColor: '#d4ccc4' }
                ),
              }}
              onClick={() => setPage(pages.length)}
            >
              Bìa sau
            </button>
          </div>
        </div>
      </main>

      {/* Background scrolling text */}
      <div className="fixed inset-0 flex items-center -rotate-2 select-none overflow-hidden">
        <div className="relative">
          {[1, 2].map((n) => (
            <div
              key={n}
              className={`${n === 2 ? 'absolute top-0 left-0 ' : ''}flex items-center gap-8 w-max px-8`}
              style={{ animation: `horizontal-scroll${n === 2 ? '-2' : ''} 20s linear infinite` }}
            >
              <h1 className="shrink-0 text-10xl font-black"
                  style={{ fontFamily: 'Playfair Display, serif', color: 'rgba(26,26,26,0.04)' }}>
                Karl Marx
              </h1>
              <h2 className="shrink-0 text-8xl italic font-light"
                  style={{ fontFamily: 'EB Garamond, serif', color: 'rgba(26,26,26,0.03)' }}>
                Tồn tại Xã hội
              </h2>
              <h2 className="shrink-0 text-12xl font-bold"
                  style={{ fontFamily: 'Playfair Display, serif', color: 'rgba(26,26,26,0.04)' }}>
                Ý thức
              </h2>
              <h2 className="shrink-0 text-12xl font-bold italic outline-text">
                Triết học
              </h2>
              <h2 className="shrink-0 text-9xl font-medium"
                  style={{ fontFamily: 'Playfair Display, serif', color: 'rgba(26,26,26,0.04)' }}>
                Chương III
              </h2>
              <h2 className="shrink-0 text-9xl font-extralight italic"
                  style={{ fontFamily: 'EB Garamond, serif', color: 'rgba(26,26,26,0.03)' }}>
                Vật chất
              </h2>
              <h2 className="shrink-0 text-13xl font-bold"
                  style={{ fontFamily: 'Playfair Display, serif', color: 'rgba(197,39,45,0.05)' }}>
                Đời sống
              </h2>
              <h2 className="shrink-0 text-13xl font-bold italic outline-text">
                Biện chứng
              </h2>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
