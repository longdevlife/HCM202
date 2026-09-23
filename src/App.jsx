import { Suspense, lazy, useEffect, useState } from "react";
import Navbar from "./game/sections/Navbar";

const TheoryPage = lazy(() => import("./game/TheoryPage").then((module) => ({ default: module.TheoryPage || module.default })));
const BookPage = lazy(() => import("./book/BookPage").then((module) => ({ default: module.BookPage || module.default })));
const MinigamePage = lazy(() => import("./minigame/MinigamePage").then((module) => ({ default: module.MinigamePage || module.default })));
const ChiecNonKiDieuGame = lazy(() => import("./chiecnonkidieu/ChiecNonKiDieuGame").then((module) => ({ default: module.ChiecNonKiDieuGame || module.default })));

const TABS = [
  { id: "book", label: "Sách 3D" },
  { id: "chiecnon", label: "Chiếc Nón Kỳ Diệu" },
];

function getActiveTab() {
  const hash = window.location.hash.replace("#", "");
  const path = window.location.pathname.replace("/", "");
  const from = TABS.find((t) => t.id === hash || t.id === path);
  return from ? from.id : "book";
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
    const targetId = id === "intro" || id === "overview" ? "book" : id;
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
          {activeTab === "overview" && <TheoryPage />}
          {activeTab === "book" && <BookPage skipIntro={hasVisitedBook} onIntroFinish={() => setHasVisitedBook(true)} />}
          {activeTab === "minigame" && <MinigamePage />}
          {activeTab === "chiecnon" && <ChiecNonKiDieuGame />}
        </Suspense>
      </div>
    </div>
  );
}

export default App;
