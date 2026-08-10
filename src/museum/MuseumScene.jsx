import { ContactShadows, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";

import { MuseumArtwork } from "./MuseumArtwork";
import { MuseumPlayer } from "./MuseumPlayer";
import { MuseumRoom } from "./MuseumRoom";
import { museumPanels, ROOM_LEFT_POS, ROOM_CENTER_POS, ROOM_RIGHT_POS } from "./museumData";
import { MuseumVisitors } from "./MuseumVisitors";

function CameraDirectionTracker({ onFocusPanel }) {
  const { camera } = useThree();
  const lastFocusedId = useRef(null);
  
  useFrame(() => {
    let closestPanel = null;
    let minDistance = 12;
    
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    
    museumPanels.forEach(panel => {
      const panelPos = new THREE.Vector3(...panel.position);
      const toPanel = panelPos.clone().sub(camera.position);
      const distance = toPanel.length();
      
      if (distance < 12) {
        toPanel.normalize();
        const dot = forward.dot(toPanel);
        if (dot > 0.8 && distance < minDistance) {
          minDistance = distance;
          closestPanel = panel;
        }
      }
    });
    
    const nextFocusedId = closestPanel?.id || null;
    if (lastFocusedId.current !== nextFocusedId) {
      lastFocusedId.current = nextFocusedId;
      onFocusPanel(closestPanel);
    }
  });
  
  return null;
}

function MuseumWorld({ focusedPanel, onFocusPanel, onSelectPanel, controlsEnabled }) {
  return (
    <>
      <color attach="background" args={["#090604"]} />
      <fog attach="fog" args={["#090604", 16, 55]} />

      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#ffffff", "#4a3324", 0.9]} />
      <directionalLight position={[4, 7, 5]} intensity={0.7} />
      <pointLight position={[0, 5.2, 5.2]} intensity={0.4} color="#f4d49a" distance={12} />
      
      {/* ── Lobby Lights ── */}
      <spotLight position={[0, 5.8, 0]} angle={0.85} penumbra={0.8} intensity={3.5} color="#fef0d8" castShadow={false} />
      
      {/* ── Left Room Lights (Red accent) ── */}
      <spotLight 
        position={[ROOM_LEFT_POS[0], 5.8, ROOM_LEFT_POS[2]]} 
        angle={0.85} penumbra={0.8} intensity={3.5} color="#ffede0" castShadow={false}
      />

      {/* ── Center Room Lights (Gold accent) ── */}
      <spotLight 
        position={[ROOM_CENTER_POS[0], 5.8, ROOM_CENTER_POS[2]]} 
        angle={0.85} penumbra={0.8} intensity={3.5} color="#fef0d8" castShadow={false}
      />

      {/* ── Right Room Lights (Green accent) ── */}
      <spotLight 
        position={[ROOM_RIGHT_POS[0], 5.8, ROOM_RIGHT_POS[2]]} 
        angle={0.85} penumbra={0.8} intensity={3.5} color="#eef7e0" castShadow={false}
      />

      {/* Sparkles in lobby area */}
      <Sparkles count={35} scale={[22, 8, 22]} position={[0, 3, 0]} size={2.4} speed={0.16} opacity={0.08} color="#f4d49a" />

      <MuseumPlayer enabled={controlsEnabled} />
      <CameraDirectionTracker onFocusPanel={onFocusPanel} />
      <MuseumRoom />
      <MuseumVisitors />

      {museumPanels.map((panel) => (
        <MuseumArtwork
          key={panel.id}
          panel={panel}
          focused={focusedPanel?.id === panel.id}
          onSelect={onSelectPanel}
        />
      ))}

      {/* Contact shadows for each area */}
      <ContactShadows position={[0, 0.02, 0]} opacity={0.35} scale={22} blur={2.8} far={4} frames={1} color="#000000" />
      <ContactShadows position={[ROOM_LEFT_POS[0], 0.02, ROOM_LEFT_POS[2]]} opacity={0.3} scale={14} blur={2.8} far={4} frames={1} color="#000000" />
      <ContactShadows position={[ROOM_CENTER_POS[0], 0.02, ROOM_CENTER_POS[2]]} opacity={0.3} scale={14} blur={2.8} far={4} frames={1} color="#000000" />
      <ContactShadows position={[ROOM_RIGHT_POS[0], 0.02, ROOM_RIGHT_POS[2]]} opacity={0.3} scale={14} blur={2.8} far={4} frames={1} color="#000000" />
    </>
  );
}

export function MuseumScene({ focusedPanel, onFocusPanel, onSelectPanel, controlsEnabled = true }) {
  return (
    <Canvas
      camera={{ position: [0, 2.65, 5], rotation: [0, 0, 0], fov: 55 }}
      dpr={[1, 1.5]}
      shadows={false}
      performance={{ min: 0.5 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <MuseumWorld
          focusedPanel={focusedPanel}
          onFocusPanel={onFocusPanel}
          onSelectPanel={onSelectPanel}
          controlsEnabled={controlsEnabled}
        />
      </Suspense>
    </Canvas>
  );
}
