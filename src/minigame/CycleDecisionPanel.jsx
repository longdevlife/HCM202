import React, { useState, useEffect } from "react";
import { getPolicyCycle, POLICY_CYCLES } from "./policyCycles.js";
import { getCharacterOption } from "./characterOptions.js";
import { getDecisionOptions, buildDecisionPayload } from "./cycleDecisionUtils.js";

export { getDecisionOptions, buildDecisionPayload };

export const CycleDecisionPanel = ({
  phaseId,
  playerId,
  roleId,
  taskCompleted = false,
  hasSubmitted = false,
  existingDecision = null,
  onSubmitDecision,
  decisionEndsAt,
  isResolved = false,
}) => {
  const cycle = getPolicyCycle(phaseId);
  const options = cycle?.options || [];
  const [selectedOptionId, setSelectedOptionId] = useState(
    existingDecision?.optionId || cycle?.defaultOptionId || options[0]?.id
  );
  const [submitting, setSubmitting] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState(() =>
    decisionEndsAt ? Math.max(0, decisionEndsAt - Date.now()) : 120000
  );

  useEffect(() => {
    if (existingDecision?.optionId) {
      setSelectedOptionId(existingDecision.optionId);
    }
  }, [existingDecision]);

  useEffect(() => {
    if (!decisionEndsAt || isResolved) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, decisionEndsAt - Date.now());
      setTimeLeftMs(remaining);
    }, 500);
    return () => clearInterval(interval);
  }, [decisionEndsAt, isResolved]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (hasSubmitted || isResolved || submitting) return;

    try {
      setSubmitting(true);
      const payload = buildDecisionPayload({
        playerId,
        roleId,
        phaseId,
        optionId: selectedOptionId,
        taskCompleted,
        autoSubmitted: false,
        submittedAt: Date.now(),
      });
      await onSubmitDecision?.(payload);
    } catch (err) {
      console.error("Lỗi khi gửi quyết định:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const secondsLeft = Math.ceil(timeLeftMs / 1000);
  const isTimeExpired = secondsLeft <= 0;

  return (
    <div
      className="minigame-panel"
      style={{
        maxWidth: "680px",
        maxHeight: "88vh",
        display: "flex",
        flexDirection: "column",
        margin: "0 auto",
        padding: "16px 14px",
        background: "rgba(18, 12, 13, 0.98)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(245, 158, 11, 0.15)",
        border: "2px solid #facc15",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Header phase & countdown */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          paddingBottom: "10px",
          marginBottom: "12px",
          flexShrink: 0,
        }}
      >
        <div>
          <span
            className="selected-character-badge"
            style={{
              "--character-color": "#facc15",
              fontSize: "0.75rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: "20px",
              background: "rgba(250, 204, 21, 0.15)",
              border: "1px solid #facc15",
              color: "#facc15",
              display: "inline-block",
              marginBottom: "4px",
            }}
          >
            NĂM {cycle.year}
          </span>
          <h2 style={{ fontSize: "1.1rem", margin: "2px 0 0 0", color: "#ffffff", fontWeight: "800" }}>
            {cycle.title}
          </h2>
        </div>

        <div
          style={{
            fontSize: "0.88rem",
            color: isTimeExpired ? "#ef4444" : "#fde047",
            fontWeight: "800",
            background: "rgba(0,0,0,0.6)",
            padding: "5px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          ⏱️ {isTimeExpired ? "Hết giờ" : `${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, "0")}`}
        </div>
      </div>

      {/* Scrollable Body */}
      <div style={{ flex: "1 1 auto", overflowY: "auto", paddingRight: "4px", marginBottom: "12px" }}>
        {/* Task status indicator */}
        <div
          style={{
            background: taskCompleted ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
            border: `1px solid ${taskCompleted ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)"}`,
            borderRadius: "10px",
            padding: "8px 12px",
            marginBottom: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.82rem",
          }}
        >
          <span style={{ color: "#e2e8f0" }}>
            {taskCompleted ? "✅ Đã hoàn tất khảo sát thực địa (+5 điểm nhiệm vụ)" : `📍 Nhiệm vụ: ${cycle.task.objectiveLabel}`}
          </span>
          <strong style={{ color: taskCompleted ? "#34d399" : "#fbbf24" }}>
            {taskCompleted ? "ĐÃ HOÀN TẤT" : "CHƯA KHẢO SÁT"}
          </strong>
        </div>

        {/* Decision prompt & options */}
        <div>
          <div style={{ fontSize: "0.78rem", color: "var(--neon-gold)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
            LỰA CHỌN QUYẾT ĐỊNH CHÍNH SÁCH CỦA BẠN:
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {options.map((opt, idx) => {
              const isSelected = selectedOptionId === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (!hasSubmitted && !isResolved && !isTimeExpired) {
                      setSelectedOptionId(opt.id);
                    }
                  }}
                  style={{
                    background: isSelected ? "rgba(245, 158, 11, 0.15)" : "rgba(15, 23, 42, 0.7)",
                    border: isSelected ? "2px solid #facc15" : "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    cursor: hasSubmitted || isResolved || isTimeExpired ? "default" : "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isSelected ? "0 4px 16px rgba(245, 158, 11, 0.25)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input
                        type="radio"
                        name={`decision_${phaseId}`}
                        checked={isSelected}
                        onChange={() => setSelectedOptionId(opt.id)}
                        disabled={hasSubmitted || isResolved || isTimeExpired}
                        style={{ accentColor: "#facc15", width: "16px", height: "16px", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "0.92rem", fontWeight: "800", color: isSelected ? "#facc15" : "#ffffff" }}>
                        {String.fromCharCode(65 + idx)}. {opt.title}
                      </span>
                    </div>
                    {opt.presetKey === "balanced_khoan" && (
                      <span style={{ fontSize: "0.68rem", background: "rgba(16,185,129,0.2)", color: "#34d399", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px" }}>
                        Cân đối
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: "0.8rem", color: "#cbd5e1", margin: "4px 0 0 26px", lineHeight: "1.4" }}>
                    {opt.description}
                  </p>

                  {opt.tradeoff && (
                    <div
                      style={{
                        margin: "6px 0 0 26px",
                        fontSize: "0.76rem",
                        color: isSelected ? "#fef08a" : "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontStyle: "italic",
                      }}
                    >
                      <span>⚡</span>
                      <span>{opt.tradeoff}</span>
                    </div>
                  )}

                  {/* Visual Impact & Simulation Preview */}
                  {isSelected && (
                    <div
                      style={{
                        margin: "10px 0 0 26px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: "rgba(0, 0, 0, 0.45)",
                        border: "1px solid rgba(250, 204, 21, 0.35)",
                      }}
                    >
                      <div style={{ fontSize: "0.72rem", color: "#facc15", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.5px" }}>
                        📊 DỰ BÁO TÁC ĐỘNG CHÍNH SÁCH VĨ MÔ:
                      </div>

                      {/* Phase 4 Preset Allocation Bar */}
                      {opt.preset && (
                        <div style={{ marginBottom: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "4px" }}>
                            <span style={{ color: "#38bdf8" }}>P1 (Pháp lệnh): <strong>{Math.round(opt.preset.P1 * 100)}%</strong></span>
                            <span style={{ color: "#34d399" }}>P2 (Tự chủ): <strong>{Math.round(opt.preset.P2 * 100)}%</strong></span>
                            <span style={{ color: "#fbbf24" }}>P3 (Gia đình): <strong>{Math.round(opt.preset.P3 * 100)}%</strong></span>
                          </div>
                          <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.2)" }}>
                            <div style={{ width: `${opt.preset.P1 * 100}%`, background: "#38bdf8" }} title="P1" />
                            <div style={{ width: `${opt.preset.P2 * 100}%`, background: "#34d399" }} title="P2" />
                            <div style={{ width: `${opt.preset.P3 * 100}%`, background: "#fbbf24" }} title="P3" />
                          </div>
                          {opt.preset.P1 < 0.40 && (
                            <div style={{ fontSize: "0.7rem", color: "#f87171", marginTop: "4px", fontWeight: "bold" }}>
                              ⚠️ Chú ý: P1 &lt; 40% (Dưới ngưỡng pháp lệnh tối thiểu). Sẽ chịu xử lý hành chính!
                            </div>
                          )}
                        </div>
                      )}

                      {/* Effects Summary */}
                      {opt.effectsSummary && (
                        <div style={{ fontSize: "0.75rem", color: "#e2e8f0", lineHeight: "1.4" }}>
                          <span style={{ color: "#38bdf8", fontWeight: "bold" }}>💡 Kết quả thực tế: </span>
                          {opt.effectsSummary}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Fixed Bottom Action Footer */}
      <div style={{ flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px" }}>
        {hasSubmitted ? (
          <div
            style={{
              textAlign: "center",
              padding: "10px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#34d399",
              fontSize: "0.85rem",
              fontWeight: "bold",
            }}
          >
            ✅ ĐÃ GỬI PHIẾU QUYẾT ĐỊNH — Vui lòng chờ Host tổng kết kết quả
          </div>
        ) : isTimeExpired ? (
          <div
            style={{
              textAlign: "center",
              padding: "10px",
              borderRadius: "10px",
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              color: "#fbbf24",
              fontSize: "0.85rem",
              fontWeight: "bold",
            }}
          >
            ⏳ ĐÃ HẾT GIỜ — Hệ thống tự động chọn phương án mặc định của phase
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-cyber btn-cyber-blue"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "0.95rem",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            {submitting ? "Đang gửi quyết định..." : "XÁC NHẬN QUYẾT ĐỊNH CHÍNH SÁCH 📜"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CycleDecisionPanel;
