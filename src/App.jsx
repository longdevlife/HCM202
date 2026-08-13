import { Suspense, lazy, useEffect, useState } from "react";
import Navbar from "./game/sections/Navbar";

const BookPage = lazy(() => import("./book/BookPage").then((module) => ({ default: module.BookPage })));
const TheoryPage = lazy(() => import("./game/TheoryPage").then((module) => ({ default: module.TheoryPage })));
const MuseumPage = lazy(() => import("./museum/MuseumPage").then((module) => ({ default: module.MuseumPage })));
const MinigamePage = lazy(() => import("./minigame/MinigamePage").then((module) => ({ default: module.MinigamePage })));

const TABS = [
  { id: "intro", label: "Mở Đầu" },
  { id: "book", label: "Tạp chí" },
  { id: "museum", label: "Bảo tàng" },
  { id: "minigame", label: "Mini Game" },
];

function getActiveTab() {
  const hash = window.location.hash.replace("#", "");
  const path = window.location.pathname.replace("/", "");
  const from = TABS.find(t => t.id === hash || t.id === path);
  return from ? from.id : "intro";
}

function App() {
  const [activeTab, setActiveTab] = useState(getActiveTab);
  const [hasVisitedBook, setHasVisitedBook] = useState(false);

  // React to browser back/forward and hash changes
  useEffect(() => {
    const onNav = () => setActiveTab(getActiveTab());
    window.addEventListener("hashchange", onNav);
    window.addEventListener("popstate", onNav);
    return () => {
      window.removeEventListener("hashchange", onNav);
      window.removeEventListener("popstate", onNav);
    };
  }, []);

  const handleTabChange = (id) => {
    setActiveTab(id);
    window.location.hash = id;
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
      {/* Tab Content */}
      <div style={{ width: "100%", minHeight: "100vh" }}>
        <Suspense
          fallback={
            <div
              style={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                background: "#090604",
                color: "#fff8ed",
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Đang tải
            </div>
          }
        >
          {activeTab === "intro" && <TheoryPage />}
          {activeTab === "book" && <BookPage skipIntro={hasVisitedBook} onIntroFinish={() => setHasVisitedBook(true)} />}
          {activeTab === "museum" && <MuseumPage />}
          {activeTab === "minigame" && <MinigamePage />}
        </Suspense>
      </div>
    </div>
  );
}

export default App;
