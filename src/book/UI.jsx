import { atom, useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { BOOKS } from "./content/bookContent.js";

// ── State atoms ──
export const pageAtom = atom(0);
export const viewModeAtom = atom("showcase"); // "showcase" | "reading"

// 3D Book page texture pairs for Chapter 5 (10 pages)
export const legacyPages = [
  {
    front: "/textures/chapter5/bia.png",
    back: "/textures/chapter5/muc_1.png",
    label: "Bìa",
  },
  {
    front: "/textures/chapter5/1.1.png",
    back: "/textures/chapter5/1.2.png",
    label: "Mục 1.1–1.2",
  },
  {
    front: "/textures/chapter5/muc_2.png",
    back: "/textures/chapter5/2.1.png",
    label: "Mục 2–2.1",
  },
  {
    front: "/textures/chapter5/2.2.png",
    back: "/textures/chapter5/2.3.png",
    label: "Mục 2.2–2.3",
  },
  {
    front: "/textures/chapter5/end.png",
    back: "/textures/chapter5/thanks.png",
    label: "Tổng Kết & Cảm Ơn",
  },
];

export const pages = legacyPages;

/* ── SVG Icons ── */
const BookIcon = () => (
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

export const UI = ({ book = BOOKS[0], onBackToLibrary }) => {
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

  const bookPages = book?.pages?.length > 0 ? book.pages : legacyPages;
  const totalPages = bookPages.length > 0 ? bookPages.length + 1 : 1;
  const pageLabels = bookPages.length > 0
    ? [
        ...bookPages.map((p, idx) => p.label || (idx === 0 ? "Bìa" : `Trang ${idx * 2 - 1}–${idx * 2}`)),
        "Bìa sau",
      ]
    : ["Bìa"];

  const foil = book?.cover?.foilColor || "#C5A028";
  const roman = book?.roman || "I";
  const shortTitle = Array.isArray(book?.cover?.title)
    ? book.cover.title.join(" ")
    : (book?.shortTitle || "Cơ cấu xã hội – giai cấp");

  return (
    <>
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      {/* Book Engine HUD */}
      <main className="pointer-events-none select-none z-10 fixed inset-0 overflow-hidden">
        {/* Left Vertical Edge Label */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[12px] tracking-[0.3em] font-light opacity-50 whitespace-nowrap uppercase"
          style={{ fontFamily: "'Inter', sans-serif", color: "#E5D5B5" }}
        >
          SÁCH HỌC THUẬT · QUYỂN {roman}
          <span className="mx-4" style={{ color: foil, opacity: 0.85 }}>●</span>
          MLN131
        </div>

        {/* Right Vertical Edge Label */}
        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 origin-center text-[12px] tracking-[0.3em] font-light opacity-50 whitespace-nowrap uppercase"
          style={{ fontFamily: "'Inter', sans-serif", color: "#E5D5B5" }}
        >
          {shortTitle}
        </div>

        {/* Top Left: Volume Stamp */}
        <div className="absolute top-28 left-12 flex flex-col items-center opacity-80">
          <div className="w-[1.5px] h-16 mb-4 opacity-80" style={{ background: foil }} />
          <span
            className="text-[13px] tracking-[0.3em] font-bold"
            style={{ writingMode: "vertical-rl", color: foil }}
          >
            QUYỂN {roman}
          </span>
        </div>

        {/* Top Right: Focus Title */}
        <div className="absolute top-28 right-12 flex flex-col items-end text-right">
          <span
            className="text-[11px] tracking-[0.3em] uppercase text-[#E5D5B5] opacity-50 mb-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Tiêu Điểm
          </span>
          <span
            className="text-[22px] max-w-[320px]"
            style={{
              fontFamily: "Playfair Display, serif",
              color: foil,
              fontStyle: "italic",
              lineHeight: 1.2,
              fontSize: "clamp(16px, 4.6vw, 22px)",
              width: "min(320px, calc(100vw - 6rem))",
              whiteSpace: "normal",
              overflowWrap: "break-word",
            }}
          >
            {shortTitle}
          </span>
        </div>

        {/* Bottom Left: Page Indicator */}
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
              {pageLabels[page] || (page === 0 ? "Bìa" : page === totalPages - 1 ? "Bìa Sau" : `Trang ${page}`)}
            </span>
          </div>
        </div>

        {/* Side Arrows */}
        {bookPages.length > 0 && (
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
        )}

        {/* Bottom Nav Island */}
        {bookPages.length > 0 && (
          <div className="absolute bottom-6 left-0 right-0 w-full pointer-events-auto flex justify-center">
            <div className="book-nav rounded-full px-2 py-2 flex flex-col items-center gap-0" style={{ maxWidth: "90vw" }}>
              <div className="flex items-center gap-1 overflow-x-auto px-1">
                {bookPages.map((_, index) => (
                  <button
                    key={index}
                    className={`book-nav-btn shrink-0 ${index === page ? "active" : ""}`}
                    onClick={() => setPage(index)}
                  >
                    {pageLabels[index]}
                  </button>
                ))}
                <button
                  className={`book-nav-btn shrink-0 ${page === bookPages.length ? "active" : ""}`}
                  onClick={() => setPage(bookPages.length)}
                >
                  {pageLabels[bookPages.length]}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Right Controls */}
      <div
        className="fixed z-20 flex items-center gap-2"
        style={{ bottom: "100px", right: "32px" }}
      >
        <button
          className="view-toggle"
          onClick={onBackToLibrary}
          aria-label="Quay lại thư viện sách ba quyển"
        >
          <LibraryIcon />
          <span>Thư viện sách</span>
        </button>

        <button
          className={`view-toggle ${viewMode === "reading" ? "active" : ""}`}
          onClick={() => setViewMode(viewMode === "showcase" ? "reading" : "showcase")}
          aria-label="Chuyển chế độ xem sách"
        >
          {viewMode === "showcase" ? <BookIcon /> : <CubeIcon />}
          <span>{viewMode === "showcase" ? "Đọc sách" : "3D View"}</span>
        </button>
      </div>
    </>
  );
};
