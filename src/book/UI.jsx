import { atom, useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { BOOKS } from "./content/bookContent.js";

// ── State atoms ──
export const pageAtom = atom(0);
export const viewModeAtom = atom("showcase"); // "showcase" | "reading"

// Backwards-compatible empty pages export (single source of truth is now bookContent.js)
export const pages = [];

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

  const bookPages = (book?.ready && Array.isArray(book?.pages)) ? book.pages : [];
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

  const isReady = book?.ready !== false;

  return (
    <>
      <div className="noise-overlay" />
      <div className="vignette-overlay" />

      {/* Honest Skeleton State for Book II & Book III */}
      {!isReady && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center p-6"
          style={{
            backgroundColor: "rgba(20, 18, 14, 0.88)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            className="max-w-xl w-full p-8 rounded-2xl border text-center flex flex-col items-center"
            style={{
              backgroundColor: "#29251d",
              borderColor: "rgba(195, 164, 123, 0.3)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
              color: "#eee2ca",
            }}
          >
            <div
              className="px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
              style={{
                backgroundColor: "rgba(195, 164, 123, 0.15)",
                color: "#c3a47b",
                border: "1px solid rgba(195, 164, 123, 0.3)",
              }}
            >
              Bản số hóa đang hoàn thiện
            </div>

            <h2
              className="text-2xl sm:text-3xl font-serif font-bold mb-2"
              style={{ color: "#c3a47b" }}
            >
              QUYỂN {roman}: {shortTitle}
            </h2>

            <p
              className="text-sm opacity-80 mb-6 italic"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Chương 5 · {book?.cover?.subtitle || "Chủ nghĩa xã hội khoa học"}
            </p>

            <div
              className="w-full text-left p-4 rounded-lg mb-6 text-xs sm:text-sm leading-relaxed"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <p className="font-semibold mb-2 text-[#c3a47b]">
                {book?.skeletonNotice || `Nội dung Sách 3D của Quyển ${roman} đang được hoàn thiện theo đúng đề cương giáo trình.`}
              </p>
              {Array.isArray(book?.chapters) && book.chapters.length > 0 && (
                <ul className="list-disc list-inside space-y-1 opacity-80">
                  {book.chapters.map((ch) => (
                    <li key={ch.id || ch.title}>
                      <span className="font-medium text-white">{ch.id ? `${ch.id}: ` : ""}</span>
                      {ch.title}
                    </li>
                  ))}
                </ul>
              )}
              {Array.isArray(book?.bibliography) && book.bibliography.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 text-left">
                  <p className="text-xs font-semibold text-[#c3a47b] mb-1 uppercase tracking-wider">
                    Thư mục nguồn & Tài liệu tham khảo
                  </p>
                  <ul className="text-xs space-y-1 opacity-75">
                    {book.bibliography.map((b, idx) => (
                      <li key={idx}>
                        • <strong>{b.title}</strong> — {b.publisher} ({b.year})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onBackToLibrary}
              className="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all"
              style={{
                backgroundColor: "#c3a47b",
                color: "#1d1a15",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.4)",
                cursor: "pointer",
              }}
              onPointerEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.04)";
              }}
              onPointerLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ← Quay Lại Thư Viện Sách
            </button>
          </div>
        </div>
      )}

      {/* Book Engine HUD */}
      <main className="pointer-events-none select-none z-10 fixed inset-0 overflow-hidden">
        {/* Left Vertical Edge Label */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[12px] tracking-[0.3em] font-light opacity-50 whitespace-nowrap uppercase"
          style={{ fontFamily: "'Inter', sans-serif", color: "#E5D5B5" }}
        >
          SÁCH HỌC THUẬT · QUYỂN {roman}
          <span className="mx-4" style={{ color: foil, opacity: 0.85 }}>●</span>
          HCM202
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
              {page === 0 ? "Bìa" : page === totalPages - 1 ? "Bìa Sau" : `Trang ${page}`}
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
