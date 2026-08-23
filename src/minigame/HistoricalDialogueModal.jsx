import React, { useState } from "react";
import { IconCheck, IconX } from "./icons.jsx";

export const HistoricalDialogueModal = ({
  npc,
  onClose,
  onAnswer,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  if (!npc) return null;

  const currentOption = npc.options?.find((opt) => opt.id === selectedOptionId);

  const handleSubmit = () => {
    if (!selectedOptionId || hasSubmitted) return;
    setHasSubmitted(true);
    if (currentOption) {
      onAnswer?.({
        npcId: npc.id,
        scoreDelta: currentOption.scoreDelta || (currentOption.isCorrect ? 10 : 0),
        badge: currentOption.badge,
        isCorrect: currentOption.isCorrect,
        option: currentOption,
      });
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="minigame-panel"
        style={{
          width: "100%",
          maxWidth: "640px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          padding: "16px 14px",
          border: `2px solid ${npc.avatarColor || "#facc15"}`,
          borderRadius: "16px",
          background: "rgba(15, 23, 42, 0.98)",
          boxShadow: `0 12px 48px rgba(0,0,0,0.85), 0 0 30px ${npc.avatarColor || "rgba(245, 158, 11, 0.2)"}`,
          overflow: "hidden",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          ✕
        </button>

        {/* NPC Profile Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: "10px",
            paddingRight: "36px",
            flexShrink: 0,
          }}
        >
          {/* Avatar Icon */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: `radial-gradient(circle at 30% 30%, ${npc.avatarColor || "#facc15"}, #000)`,
              border: `2px solid ${npc.avatarColor || "#facc15"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
              flexShrink: 0,
            }}
          >
            {npc.icon || "👨‍💼"}
          </div>

          <div>
            <div style={{ fontSize: "0.66rem", color: "#f59e0b", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "2px" }}>
              🚩 LỊCH SỬ ĐẢNG CỘNG SẢN VIỆT NAM • KHẢO NGHIỆM THỰC TIỄN
            </div>
            <div style={{ fontSize: "0.72rem", color: npc.avatarColor || "#fde047", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {npc.roleTitle}
            </div>
            <h3 style={{ margin: "2px 0 2px 0", color: "#ffffff", fontSize: "1.15rem", fontWeight: "800" }}>
              {npc.name}
            </h3>
            {npc.quote && (
              <div style={{ fontStyle: "italic", fontSize: "0.78rem", color: "#cbd5e1" }}>
                "{npc.quote}"
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: "1 1 auto", overflowY: "auto", paddingRight: "4px", marginBottom: "12px" }}>
          {/* Historical Context Box */}
          {npc.context && (
            <div
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                borderRadius: "10px",
                padding: "8px 12px",
                marginBottom: "12px",
                fontSize: "0.8rem",
                color: "#e2e8f0",
                lineHeight: "1.45",
              }}
            >
              <strong style={{ color: "#facc15" }}>Bối cảnh lịch sử: </strong>
              {npc.context}
            </div>
          )}

          {/* Dilemma Question */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "0.74rem", color: "var(--neon-gold)", fontWeight: "800", textTransform: "uppercase", marginBottom: "6px" }}>
              CÂU HỎI TÌNH HUỐNG THỰC TIỄN:
            </div>
            <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "#ffffff", lineHeight: "1.4" }}>
              {npc.dilemmaQuestion || npc.question}
            </div>
          </div>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
            {npc.options?.map((opt, idx) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (!hasSubmitted) setSelectedOptionId(opt.id);
                  }}
                  style={{
                    background: isSelected ? "rgba(56, 189, 248, 0.15)" : "rgba(30, 41, 59, 0.6)",
                    border: isSelected ? "2px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    cursor: hasSubmitted ? "default" : "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isSelected ? "0 4px 16px rgba(56, 189, 248, 0.25)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="radio"
                      name="npc_dialogue_opt"
                      checked={isSelected}
                      onChange={() => setSelectedOptionId(opt.id)}
                      disabled={hasSubmitted}
                      style={{ accentColor: "#38bdf8", width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <div style={{ fontSize: "0.88rem", fontWeight: "700", color: isSelected ? "#38bdf8" : "#f1f5f9" }}>
                      {String.fromCharCode(65 + idx)}. {opt.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback Section (Shown after submit) */}
          {hasSubmitted && currentOption && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                background: currentOption.isCorrect ? "rgba(6, 78, 59, 0.35)" : "rgba(127, 29, 29, 0.35)",
                border: currentOption.isCorrect ? "2px solid #10b981" : "2px solid #ef4444",
                marginBottom: "8px",
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "800", fontSize: "0.95rem", color: currentOption.isCorrect ? "#34d399" : "#f87171", marginBottom: "4px" }}>
                {currentOption.isCorrect ? <IconCheck className="w-5 h-5" /> : <IconX className="w-5 h-5" />}
                {currentOption.feedbackTitle}
                {currentOption.isCorrect && (
                  <span className="pix-num" style={{ marginLeft: "auto", color: "var(--neon-gold)", fontSize: "1.05rem" }}>
                    +{currentOption.scoreDelta || 10}đ
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.82rem", color: "#f1f5f9", lineHeight: "1.45" }}>
                {currentOption.feedbackExplanation}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div style={{ flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px" }}>
          {!hasSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOptionId}
              className="btn-cyber btn-cyber-blue"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "0.95rem",
                fontWeight: "800",
                opacity: selectedOptionId ? 1 : 0.5,
                cursor: selectedOptionId ? "pointer" : "not-allowed",
              }}
            >
              XÁC NHẬN PHƯƠNG ÁN ĐỐI THOẠI ⚡
            </button>
          ) : (
            <button
              onClick={onClose}
              className="btn-cyber"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "0.95rem",
                fontWeight: "800",
                background: currentOption?.isCorrect ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "1px solid #fff",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              TIẾP TỤC KHÁM PHÁ BẢN ĐỒ ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricalDialogueModal;
