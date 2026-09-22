import { useEffect, useRef, useState } from "react";
import { bindThreeUiShowcase } from "./threeUiContentAdapter.js";
import { BOOKS } from "../content/bookContent.js";

export const BestsellersBookShowcase = ({
  selectedBook = null,
  isDetailOpen = false,
  onSelectBook,
  onCloseDetail,
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
      isDetailOpen,
      onSelectBook,
      onCloseDetail,
      onOpenBook,
    });

    return cleanup;
  }, [iframeReady, selectedBook, isDetailOpen, onSelectBook, onCloseDetail, onOpenBook]);

  // Fallback postMessage bridge for window communications
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "OPEN_BOOK") {
        const bookMap = { codex: 0, claude: 1, cursor: 2 };
        const index =
          typeof event.data.book === "string"
            ? (bookMap[event.data.book] ?? 0)
            : (event.data.index ?? 0);
        onSelectBook?.(index, true);
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
    </div>
  );
};

export default BestsellersBookShowcase;
