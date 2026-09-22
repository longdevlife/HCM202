import { atom, useAtom } from "jotai";
import { useEffect, useRef } from "react";

// ── Magazine state atoms ──
export const pageAtom = atom(0);
export const viewModeAtom = atom("showcase"); // "showcase" | "reading"

export const pages = [
  {
    front: "/textures/hinh/hinh1.png",
    back: "/textures/hinh/hinh2.png",
  },
  {
    front: "/textures/hinh/hinh3.png",
    back: "/textures/hinh/hinh4.png",
  },
  {
    front: "/textures/hinh/hinh5.png",
    back: "/textures/hinh/hinh6.png",
  },
  {
    front: "/textures/hinh/hinh7.png",
    back: "/textures/hinh/hinh8.png",
  },
  {
    front: "/textures/hinh/hinh9.png",
    back: "/textures/hinh/hinh10.png",
  },
];

const pageLabels = [
  "Bìa",
  "Trang 1–2",
  "Trang 3–4",
  "Trang 5–6",
  "Trang 7–8",
  "Bìa sau",
];

/* ── SVG Icons ── */
const MagazineIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const CubeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const LibraryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M9 2v15" />
  </svg>
);

const defaultBook = {
  roman: "I",
  shortTitle: "Cơ cấu xã hội – giai cấp",
  magazineName: "TẠP CHÍ CHUYÊN ĐỀ · QUYỂN I",
  edgeLabel: "CƠ CẤU XÃ HỘI – GIAI CẤP",
  foil: "#C5A028",
};

export const UI = ({ book = defaultBook, onBackToLibrary }) => {
  const [page, setPage] = useAtom(pageAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const hasPlayedInitialPage = useRef(false);

  useEffect(() => {
    if (!hasPlayedInitialPage.current || page === 0) {
      hasPlayedInitialPage.current = true;
      return;
    }

    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.play().catch(() => {});
  }, [page]);

  const totalPages = pages.length + 1;
  const foil = book?.foil || "#C5A028";

  return (
    <>
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      <main className="pointer-events-none select-none z-10 fixed inset-0 overflow-hidden">
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[12px] tracking-[0.3em] font-light opacity-50 whitespace-nowrap uppercase"
          style={{ fontFamily: "'Inter', sans-serif", color: "#E5D5B5" }}
        >
          {book?.magazineName || defaultBook.magazineName}
          <span className="mx-4" style={{ color: foil, opacity: 0.85 }}>●</span>
          HCM202
        </div>

        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 origin-center text-[12px] tracking-[0.3em] font-light opacity-50 whitespace-nowrap uppercase"
          style={{ fontFamily: "'Inter', sans-serif", color: "#E5D5B5" }}
        >
          {book?.edgeLabel || defaultBook.edgeLabel}
        </div>

        <div className="absolute top-28 left-12 flex flex-col items-center opacity-80">
          <div className="w-[1.5px] h-16 mb-4 opacity-80" style={{ background: foil }} />
          <span
            className="text-[13px] tracking-[0.3em] font-bold"
            style={{ writingMode: "vertical-rl", color: foil }}
          >
            QUYỂN {book?.roman || "I"}
          </span>
        </div>

        <div className="absolute top-28 right-12 flex flex-col items-end text-right">
          <span
            className="text-[11px] tracking-[0.3em] uppercase text-[#E5D5B5] opacity-50 mb-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Tiêu Điểm
          </span>
          <span
            className="text-[22px] max-w-[300px]"
            style={{
              fontFamily: "Playfair Display, serif",
              color: foil,
              fontStyle: "italic",
              lineHeight: 1.2,
              fontSize: "clamp(16px, 4.6vw, 22px)",
              width: "min(300px, calc(100vw - 6rem))",
              whiteSpace: "normal",
              overflowWrap: "break-word",
            }}
          >
            {book?.shortTitle || defaultBook.shortTitle}
          </span>
        </div>

        <div className="absolute bottom-12 left-12 flex items-end gap-4 opacity-90">
          <span
            className="text-6xl leading-none font-medium"
            style={{ fontFamily: "Playfair Display, serif", color: foil }}
          >
            {String(page).padStart(2, "0")}
          </span>
          <div className="flex flex-col pb-1.5">
            <div className="w-16 h-[2px] bg-[#E5D5B5] opacity-30 mb-2" />
            <span className="text-[11px] tracking-[0.3em] text-[#E5D5B5] opacity-70 uppercase">
              {page === 0 ? "Bìa" : page === totalPages - 1 ? "Bìa Sau" : `Trang ${page}`}
            </span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center justify-between px-4 absolute top-1/2 left-0 right-0 -translate-y-1/2">
          <button
            className="view-toggle"
            style={{
              padding: "10px",
              opacity: page > 0 ? 1 : 0.3,
              pointerEvents: page > 0 ? "auto" : "none",
            }}
            onClick={() => setPage(Math.max(0, page - 1))}
            aria-label="Trang trước"
          >
            <ChevronLeft />
          </button>
          <button
            className="view-toggle"
            style={{
              padding: "10px",
              opacity: page < totalPages - 1 ? 1 : 0.3,
              pointerEvents: page < totalPages - 1 ? "auto" : "none",
            }}
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            aria-label="Trang sau"
          >
            <ChevronRight />
          </button>
        </div>

        <div className="absolute bottom-6 left-0 right-0 w-full pointer-events-auto flex justify-center">
          <div className="book-nav rounded-full px-2 py-2 flex flex-col items-center gap-0" style={{ maxWidth: "90vw" }}>
            <div className="flex items-center gap-1 overflow-x-auto px-1">
              {[...pages].map((_, index) => (
                <button
                  key={index}
                  className={`book-nav-btn shrink-0 ${index === page ? "active" : ""}`}
                  onClick={() => setPage(index)}
                >
                  {pageLabels[index]}
                </button>
              ))}
              <button
                className={`book-nav-btn shrink-0 ${page === pages.length ? "active" : ""}`}
                onClick={() => setPage(pages.length)}
              >
                {pageLabels[pages.length]}
              </button>
            </div>
          </div>
        </div>
      </main>

      <div
        className="fixed z-20 flex items-center gap-2"
        style={{ bottom: "100px", right: "32px" }}
      >
        <button
          className="view-toggle"
          onClick={onBackToLibrary}
          aria-label="Quay lại thư viện ba quyển"
        >
          <LibraryIcon />
          <span>Thư viện</span>
        </button>

        <button
          className={`view-toggle ${viewMode === "reading" ? "active" : ""}`}
          onClick={() => setViewMode(viewMode === "showcase" ? "reading" : "showcase")}
        >
          {viewMode === "showcase" ? <MagazineIcon /> : <CubeIcon />}
          <span>{viewMode === "showcase" ? "Đọc tạp chí" : "3D View"}</span>
        </button>
      </div>
    </>
  );
};
