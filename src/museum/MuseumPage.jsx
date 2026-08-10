import { useState, useCallback } from "react";

import { MuseumScene } from "./MuseumScene";
import { ArtworkPopup } from "./ArtworkPopup";
import { defaultPanel, museumRooms } from "./museumData";

const LOBBY_VIEW = {
  id: "lobby",
  title: "Sảnh trung tâm",
  shortTitle: "Sảnh",
  accent: "#C5A028",
};

export function MuseumPage() {
  const [focusedPanel, setFocusedPanel] = useState(defaultPanel);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const focusedRoom = focusedPanel
    ? museumRooms.find((room) => room.id === focusedPanel.roomId) || null
    : null;
  const activeView = focusedRoom || LOBBY_VIEW;
  const indicators = [LOBBY_VIEW, ...museumRooms];

  const handleSelectPanel = useCallback((panel) => {
    setSelectedPanel(panel);
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedPanel(null);
  }, []);

  return (
    <main
      className="museum-entrance"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: 620,
        overflow: "hidden",
        background: "#090604",
      }}
    >
      <MuseumScene
        focusedPanel={focusedPanel}
        onFocusPanel={setFocusedPanel}
        onSelectPanel={handleSelectPanel}
        controlsEnabled={!selectedPanel}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 35%, transparent 0%, rgba(0,0,0,0.08) 36%, rgba(0,0,0,0.72) 100%)",
        }}
      />

      <section
        style={{
          position: "absolute",
          left: "clamp(18px, 4vw, 56px)",
          top: "clamp(92px, 13vh, 132px)",
          zIndex: 15,
          maxWidth: 440,
          color: "#fff8ed",
          pointerEvents: "none",
          transition: "opacity 0.3s ease",
        }}
      >
        <div
          style={{
            color: activeView.accent || "#c5a028",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            transition: "color 0.3s ease",
            fontWeight: "bold",
          }}
        >
          {focusedRoom ? `Phòng: ${focusedRoom.title}` : "Sảnh trung tâm"}
        </div>
        <h1
          style={{
            margin: "10px 0 14px",
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(32px, 5vw, 52px)",
            lineHeight: 1.05,
            transition: "all 0.3s ease",
          }}
        >
          {focusedPanel?.title || "Bảo tàng Nhà nước pháp quyền"}
        </h1>
        <p
          style={{
            margin: 0,
            color: "rgba(255,248,237,0.68)",
            lineHeight: 1.8,
            transition: "opacity 0.3s ease",
          }}
        >
          {focusedPanel?.heading}
        </p>
      </section>

      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "clamp(18px, 5vw, 48px)",
          zIndex: 16,
          display: "flex",
          gap: 12,
          pointerEvents: "none",
        }}
      >
        {indicators.map((room) => (
          <div
            key={room.id}
            style={{
              width: room.id === activeView.id ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background:
                room.id === activeView.id
                  ? room.accent
                  : "rgba(255,255,255,0.2)",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Artwork Popup Overlay */}
      <ArtworkPopup panel={selectedPanel} onClose={handleClosePopup} />
    </main>
  );
}
