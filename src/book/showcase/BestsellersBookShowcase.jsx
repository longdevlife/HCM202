import { useEffect, useRef, useState } from "react";
import { bindThreeUiShowcase } from "./threeUiContentAdapter.js";
import { BOOKS } from "../content/bookContent.js";

export const BestsellersBookShowcase = ({
  selectedBook = 0,
  onSelectBook,
  onOpenBook,
}) => {
  const iframeRef = useRef(null);
  const [iframeReady, setIframeReady] = useState(false);

  // Bind runtime content adapter to iframe
  useEffect(() => {
    if (!iframeRef.current || !iframeReady) return;

    const cleanup = bindThreeUiShowcase({
      iframe: iframeRef.current,
      books: BOOKS,
      selectedBook,
      onSelectBook,
      onOpenBook,
    });

    return cleanup;
  }, [iframeReady, selectedBook, onSelectBook, onOpenBook]);

  // Fallback postMessage bridge for window communications
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "OPEN_BOOK") {
        const bookMap = { codex: 0, claude: 1, cursor: 2 };
        const index =
          typeof event.data.book === "string"
            ? (bookMap[event.data.book] ?? 0)
            : (event.data.index ?? 0);
        onSelectBook?.(index);
        onOpenBook?.(index);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSelectBook, onOpenBook]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#29251d",
      }}
    >
      <iframe
        ref={iframeRef}
        src="/landing-pages/bestsellers-book-showcase.html"
        title="Thư viện sách Chương 5"
        onLoad={() => setIframeReady(true)}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
      />

      {/* Floating CTA to enter 3D Book directly */}
      <div
        style={{
          position: "fixed",
          bottom: "32px",
          right: "36px",
          zIndex: 60,
          pointerEvents: "auto",
        }}
      >
        <button
          type="button"
          onClick={() => onOpenBook?.(selectedBook ?? 0)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 26px",
            background: "linear-gradient(135deg, #c3a47b 0%, #9a784d 100%)",
            color: "#1d1a15",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            borderRadius: "9999px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow:
              "0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
          onPointerEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px) scale(1.03)";
            e.currentTarget.style.boxShadow =
              "0 16px 36px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.5)";
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow =
              "0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)";
          }}
        >
          <span>Đọc Sách 3D ↗</span>
        </button>
      </div>
    </div>
  );
};

export default BestsellersBookShowcase;
