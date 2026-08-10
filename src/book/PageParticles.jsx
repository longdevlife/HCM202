import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useAtom } from "jotai";
import { pageAtom } from "./UI";

/**
 * PageParticles — burst of sparkles when page flips
 * Uses drei's Sparkles with conditional rendering
 */
export const PageParticles = () => {
  const [page] = useAtom(pageAtom);
  const [showParticles, setShowParticles] = useState(false);
  const prevPage = useRef(page);

  useEffect(() => {
    if (prevPage.current !== page) {
      prevPage.current = page;
      setShowParticles(true);
      const timer = setTimeout(() => setShowParticles(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [page]);

  if (!showParticles) return null;

  return (
    <group position={[0, 0, 0.05]}>
      {/* Main golden dust burst */}
      <Sparkles
        count={40}
        scale={[1.5, 2, 0.5]}
        size={3}
        speed={1.5}
        opacity={0.7}
        color="#d4ccc4"
      />
      {/* Accent red subtle sparkles */}
      <Sparkles
        count={12}
        scale={[1, 1.5, 0.3]}
        size={2}
        speed={2}
        opacity={0.4}
        color="#C5272D"
      />
    </group>
  );
};
