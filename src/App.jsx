import { Suspense, lazy, useEffect, useState } from "react";
import Navbar from "./game/sections/Navbar";

const TheoryPage = lazy(() => import("./game/TheoryPage").then((module) => ({ default: module.TheoryPage || module.default })));
const BookPage = lazy(() => import("./book/BookPage").then((module) => ({ default: module.BookPage || module.default })));
const MinigamePage = lazy(() => import("./minigame/MinigamePage").then((module) => ({ default: module.MinigamePage || module.default })));

const TABS = [
  { id: "overview", label: "Tổng quan" },
  { id: "book", label: "Tạp chí" },
  { id: "minigame", label: "Mini Game" },
];

function getActiveTab() {
  const hash = window.location.hash.replace("#", "");
  const path = window.location.pathname.replace("/", "");
  if (hash === "intro" || path === "intro") return "overview";
  const from = TABS.find((t) => t.id === hash || t.id === path);
  return from ? from.id : "overview";
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
    const targetId = id === "intro" ? "overview" : id;
    setActiveTab(targetId);
    window.location.hash = targetId;
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
                background: "#EDE8E1",
                color: "#3D3529",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Đang tải nội dung...
            </div>
          }
        >
          {(activeTab === "overview" || activeTab === "intro") && <TheoryPage />}
          {activeTab === "book" && <BookPage skipIntro={hasVisitedBook} onIntroFinish={() => setHasVisitedBook(true)} />}
          {activeTab === "minigame" && <MinigamePage />}
        </Suspense>
      </div>
    </div>
  );
}

export default App;
