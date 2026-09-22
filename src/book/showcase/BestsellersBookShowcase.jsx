import { useEffect, useRef, useState } from "react";
import { BOOK_CATALOG } from "./bookCatalog";
import "./bestsellers-book-showcase.css";

const MotionCover = ({ type }) => {
  if (type === "convergence") {
    return (
      <svg className="bestseller-motion bestseller-motion--convergence" viewBox="0 0 240 340" aria-hidden="true">
        <g className="convergence-lines">
          <path d="M22 54 L120 170" />
          <path d="M218 54 L120 170" />
          <path d="M22 286 L120 170" />
          <path d="M218 286 L120 170" />
          <path d="M120 24 L120 170" />
          <path d="M120 316 L120 170" />
        </g>
        <circle className="convergence-core convergence-core--outer" cx="120" cy="170" r="38" />
        <circle className="convergence-core convergence-core--inner" cx="120" cy="170" r="9" />
      </svg>
    );
  }

  if (type === "orbit") {
    return (
      <svg className="bestseller-motion bestseller-motion--orbit" viewBox="0 0 240 340" aria-hidden="true">
        <g transform="translate(120 170)">
          <ellipse className="orbit-ring orbit-ring--one" rx="78" ry="34" />
          <ellipse className="orbit-ring orbit-ring--two" rx="58" ry="86" transform="rotate(34)" />
          <ellipse className="orbit-ring orbit-ring--three" rx="92" ry="52" transform="rotate(-28)" />
          <circle className="orbit-core" r="8" />
          <circle className="orbit-dot orbit-dot--one" cx="76" cy="0" r="4" />
          <circle className="orbit-dot orbit-dot--two" cx="-34" cy="69" r="3.5" />
          <circle className="orbit-dot orbit-dot--three" cx="18" cy="-82" r="3" />
        </g>
      </svg>
    );
  }

  return (
    <svg className="bestseller-motion bestseller-motion--network" viewBox="0 0 240 340" aria-hidden="true">
      <g className="network-lines">
        <path d="M38 86 L95 128 L160 82 L204 142 L164 226 L92 250 L42 194 Z" />
        <path d="M95 128 L92 250 M160 82 L164 226 M42 194 L204 142" />
      </g>
      {[
        [38, 86],
        [95, 128],
        [160, 82],
        [204, 142],
        [164, 226],
        [92, 250],
        [42, 194],
      ].map(([cx, cy], index) => (
        <circle key={index} className={"network-node network-node--" + (index + 1)} cx={cx} cy={cy} r="4.5" />
      ))}
    </svg>
  );
};

export const BestsellersBookShowcase = ({
  selectedBook = 0,
  onSelectBook,
  onOpenBook,
}) => {
  const rootRef = useRef(null);
  const openTimerRef = useRef(null);
  const [hoveredBook, setHoveredBook] = useState(null);
  const [openingBook, setOpeningBook] = useState(null);

  const activeBook = hoveredBook ?? openingBook ?? selectedBook;
  const activeRecord = BOOK_CATALOG[activeBook] ?? BOOK_CATALOG[0];

  useEffect(() => {
    return () => {
      if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
    };
  }, []);

  const handlePointerMove = (event) => {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    rootRef.current.style.setProperty("--pointer-x", x.toFixed(3));
    rootRef.current.style.setProperty("--pointer-y", y.toFixed(3));
  };

  const handlePointerLeave = () => {
    setHoveredBook(null);
    rootRef.current?.style.setProperty("--pointer-x", "0");
    rootRef.current?.style.setProperty("--pointer-y", "0");
  };

  const handleOpenBook = (index) => {
    if (openingBook !== null) return;

    onSelectBook?.(index);
    setOpeningBook(index);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      onOpenBook?.(index);
      return;
    }

    openTimerRef.current = window.setTimeout(() => {
      onOpenBook?.(index);
    }, 760);
  };

  return (
    <section
      ref={rootRef}
      className={"bestseller-showcase" + (openingBook !== null ? " is-opening" : "")}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label="Thư viện ba quyển chuyên đề"
      style={{
        "--active-color": activeRecord.color,
        "--active-foil": activeRecord.foil,
      }}
    >
      <div className="bestseller-showcase__grain" aria-hidden="true" />
      <div className="bestseller-showcase__halo" aria-hidden="true" />

      <header className="bestseller-showcase__header">
        <div>
          <p className="bestseller-showcase__eyebrow">THƯ VIỆN CHUYÊN ĐỀ · 03 QUYỂN</p>
          <h1>Những lát cắt của cơ cấu xã hội và liên minh giai cấp</h1>
        </div>
        <p className="bestseller-showcase__instruction">
          Di chuột để khám phá · Nhấn vào bìa để mở tạp chí
        </p>
      </header>

      <div className="bestseller-books" role="list">
        {BOOK_CATALOG.map((book, index) => {
          const position = index === 0 ? "left" : index === 1 ? "center" : "right";
          const isHovered = hoveredBook === index;
          const isSelected = selectedBook === index;
          const isOpening = openingBook === index;
          const isActive = activeBook === index;

          return (
            <button
              key={book.id}
              type="button"
              role="listitem"
              className={[
                "bestseller-book-card",
                isHovered ? "is-hovered" : "",
                isSelected ? "is-selected" : "",
                isOpening ? "is-opening-book" : "",
                isActive ? "is-active" : "",
              ].filter(Boolean).join(" ")}
              data-position={position}
              data-motion={book.motion}
              aria-label={"Mở Quyển " + book.roman + ": " + book.shortTitle}
              aria-pressed={isSelected}
              onFocus={() => {
                setHoveredBook(index);
                onSelectBook?.(index);
              }}
              onBlur={() => setHoveredBook(null)}
              onPointerEnter={() => {
                setHoveredBook(index);
                onSelectBook?.(index);
              }}
              onClick={() => handleOpenBook(index)}
              style={{
                "--book-color": book.color,
                "--book-deep": book.colorDeep,
                "--book-foil": book.foil,
                "--book-paper": book.paper,
              }}
            >
              <span className="bestseller-book-shadow" aria-hidden="true" />
              <span className="bestseller-book-object">
                <span className="bestseller-book-page-fan" aria-hidden="true" />
                <span className="bestseller-book-spine" aria-hidden="true" />
                <span className="bestseller-book-cover">
                  <MotionCover type={book.motion} />
                  <span className="bestseller-book-cover__rule" />
                  <span className="bestseller-book-cover__eyebrow">{book.eyebrow}</span>
                  <span className="bestseller-book-cover__title">
                    {book.titleLines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </span>
                  <span className="bestseller-book-cover__subtitle">{book.subtitle}</span>
                  <span className="bestseller-book-cover__mark">HCM202 · FIELD MANUALS</span>
                </span>
              </span>
              <span className="bestseller-book-caption" aria-hidden="true">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{book.shortTitle}</span>
              </span>
            </button>
          );
        })}
      </div>

      <aside className="bestseller-book-meta" aria-live="polite">
        <div className="bestseller-book-meta__index">
          <span>0{activeRecord.index + 1}</span>
          <span>/03</span>
        </div>
        <div className="bestseller-book-meta__copy">
          <p>{activeRecord.eyebrow}</p>
          <h2>{activeRecord.shortTitle}</h2>
          <span>{activeRecord.description}</span>
        </div>
        <div className="bestseller-book-meta__action">
          <span>OPEN MAGAZINE</span>
          <span aria-hidden="true">↗</span>
        </div>
      </aside>

      <div className="bestseller-open-wash" aria-hidden="true" />
    </section>
  );
};

export default BestsellersBookShowcase;
