import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { Experience } from "./Experience";
import { UI } from "./UI";
import { IntroScreen } from "./IntroScreen";

export const BookPage = ({ skipIntro = false, onIntroFinish }) => {
  const [isStarted, setIsStarted] = useState(skipIntro);

  const handleEnter = () => {
    setIsStarted(true);
    if (onIntroFinish) onIntroFinish();
  };

  return (
    <>
      {!isStarted && <IntroScreen onEnter={handleEnter} />}

      {isStarted && (
        <div style={{ opacity: 1, transition: 'opacity 1s ease', width: '100%', height: '100vh', overflow: 'hidden', pointerEvents: 'auto', backgroundColor: '#1E1A14' }}>
          <UI />
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
      )}
    </>
  );
};
