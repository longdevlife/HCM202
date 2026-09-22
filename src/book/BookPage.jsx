import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useSetAtom } from "jotai";
import { Suspense, useState } from "react";
import { Experience } from "./Experience";
import { UI, pageAtom, viewModeAtom } from "./UI";
import { IntroScreen } from "./IntroScreen";
import { BestsellersBookShowcase } from "./showcase/BestsellersBookShowcase";
import { getBookByIndex } from "./showcase/bookCatalog";
import { useBookLibraryStore } from "./showcase/useBookLibraryStore";

export const BookPage = ({ skipIntro = false, onIntroFinish }) => {
  const [isStarted, setIsStarted] = useState(skipIntro);
  const selectedBook = useBookLibraryStore((state) => state.selectedBook);
  const libraryView = useBookLibraryStore((state) => state.view);
  const setSelectedBook = useBookLibraryStore((state) => state.setSelectedBook);
  const openBook = useBookLibraryStore((state) => state.openBook);
  const openLibrary = useBookLibraryStore((state) => state.openLibrary);

  const setPage = useSetAtom(pageAtom);
  const setViewMode = useSetAtom(viewModeAtom);

  const currentBook = getBookByIndex(selectedBook);

  const handleEnter = () => {
    openLibrary();
    setIsStarted(true);
    if (onIntroFinish) onIntroFinish();
  };

  const handleOpenBook = (index) => {
    setPage(0);
    setViewMode("showcase");
    openBook(index);
  };

  if (!isStarted) {
    return <IntroScreen onEnter={handleEnter} />;
  }

  if (libraryView === "library") {
    return (
      <BestsellersBookShowcase
        selectedBook={selectedBook}
        onSelectBook={setSelectedBook}
        onOpenBook={handleOpenBook}
      />
    );
  }

  return (
    <div
      style={{
        opacity: 1,
        transition: "opacity 1s ease",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        pointerEvents: "auto",
        backgroundColor: "#1E1A14",
      }}
    >
      <UI book={currentBook} onBackToLibrary={openLibrary} />
      <Loader />
      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        camera={{
          position: [-0.5, 1, window.innerWidth > 800 ? 4 : 9],
          fov: 45,
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
        performance={{ min: 0.5 }}
      >
        <group position-y={0}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </group>
      </Canvas>
    </div>
  );
};
