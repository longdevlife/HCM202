import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ref, set, onValue, remove, update, runTransaction } from "firebase/database";
import { db } from "./firebaseConfig";
import { POLICY_CYCLES, getPolicyCycle } from "./policyCycles";
import { createInitialPolicyState } from "./policyStateUtils";
import { buildStartPhasePatch, buildResolvePhasePatch, buildNextPhasePatch } from "./policyGameActions";
import { buildPolicyRpgSnapshot } from "./rpgBridge";
import { subscribeToPlayerPositions } from "./playerPositionSync";
import { getCharacterOption } from "./characterOptions";
import {
  IconDesktop,
  IconLeaf,
  IconWarning,
  IconFlame,
  IconTrophy,
  IconCrown,
  IconBulb,
  IconBolt,
  IconRefresh,
  IconArrowRight
} from "./icons";

const getPhaseIcon = (phaseId, className = "w-5 h-5") => {
  if (phaseId === "phase_1") return <IconLeaf className={`${className} text-emerald-500`} />;
  if (phaseId === "phase_2") return <IconWarning className={`${className} text-cyan-500`} />;
  if (phaseId === "phase_3") return <IconWarning className={`${className} text-amber-500`} />;
  if (phaseId === "phase_4") return <IconFlame className={`${className} text-red-500`} />;
  return null;
};

export const HostView = ({ gameState = {}, dbConnected = false, onResetRole }) => {
  const iframeRef = useRef(null);
  const iframeReadyRef = useRef(false);
  const [players, setPlayers] = useState({});
  const [decisions, setDecisions] = useState({});
  const [qrUrl, setQrUrl] = useState("");
  const positionsRef = useRef({});
  const autoResolvedRef = useRef("");
  const autoNextPhaseRef = useRef("");

  const currentPhaseId = gameState.phaseId || gameState.status;
  const cycle = getPolicyCycle(currentPhaseId);
  const isRpgPhase = ["phase_1", "phase_2", "phase_3", "phase_4"].includes(gameState.status);
  const isResolved = gameState.phaseStatus === "resolved";
  const isFinished = gameState.status === "finished";

  // QR Code
  useEffect(() => {
    const url = window.location.origin + window.location.pathname + "#minigame";
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=c5272d&data=${encodeURIComponent(url)}`);
  }, []);

  // Sync player positions
  useEffect(() => {
    return subscribeToPlayerPositions(db, ({ playerId, position }) => {
      if (position) positionsRef.current[playerId] = position;
      else delete positionsRef.current[playerId];

      if (iframeReadyRef.current) {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "PLAYER_POSITION",
            playerId,
            position,
          },
          "*"
        );
      }
    });
  }, []);

  // Listen to players
  useEffect(() => {
    const unsubPlayers = onValue(ref(db, "players"), (s) => setPlayers(s.val() || {}));
    return () => unsubPlayers();
  }, []);

  // Listen to decisions
  useEffect(() => {
    if (!currentPhaseId) {
      setDecisions({});
      return;
    }
    const unsubDecisions = onValue(ref(db, `decisions/${currentPhaseId}`), (s) => {
      setDecisions(s.val() || {});
    });
    return () => unsubDecisions();
  }, [currentPhaseId]);

  const playerList = useMemo(
    () => Object.entries(players).map(([id, info]) => ({ id, ...info })),
    [players]
  );
  const totalPlayers = playerList.length;
  const decisionsList = useMemo(() => Object.values(decisions || {}), [decisions]);
  const submittedCount = decisionsList.length;

  const sortedPlayers = useMemo(
    () => [...playerList].sort((a, b) => (b.score || 0) - (a.score || 0)),
    [playerList]
  );

  const postRpgSnapshot = useCallback(
    (force = false) => {
      const iframeWindow = iframeRef.current?.contentWindow;
      if (!iframeWindow || (!iframeReadyRef.current && !force)) return;
      iframeWindow.postMessage(
        buildPolicyRpgSnapshot({
          gameState,
          players,
          positions: positionsRef.current,
        }),
        "*"
      );
    },
    [gameState, players]
  );

  const handleIframeLoad = useCallback(() => {
    iframeReadyRef.current = true;
    postRpgSnapshot(true);
  }, [postRpgSnapshot]);

  useEffect(() => {
    postRpgSnapshot();
  }, [postRpgSnapshot]);

  // Host Action: Resolve Phase
  const handleResolvePhase = useCallback(async () => {
    if (!currentPhaseId || gameState.phaseStatus !== "active") return;
    try {
      let resolvedPatch = null;
      const transactionResult = await runTransaction(ref(db, "gameState"), (currentGameState) => {
        if (
          !currentGameState
          || currentGameState.status !== currentPhaseId
          || currentGameState.phaseId !== currentPhaseId
          || currentGameState.phaseStatus !== "active"
        ) {
          return;
        }

        const patch = buildResolvePhasePatch(
          currentGameState,
          currentPhaseId,
          decisions,
          players
        );
        resolvedPatch = patch;
        return {
          ...currentGameState,
          phaseStatus: patch["gameState/phaseStatus"],
          macro: patch["gameState/macro"],
          agriculture: patch["gameState/agriculture"],
          industry: patch["gameState/industry"],
          currentResult: patch["gameState/currentResult"],
          results: {
            ...(currentGameState.results || {}),
            [currentPhaseId]: patch[`gameState/results/${currentPhaseId}`],
          },
        };
      });
      if (!transactionResult.committed || !resolvedPatch) return;

      const playerPatch = Object.fromEntries(
        Object.entries(resolvedPatch).filter(([path]) => !path.startsWith("gameState/"))
      );
      if (Object.keys(playerPatch).length > 0) await update(ref(db), playerPatch);
    } catch (err) {
      console.error("Lỗi resolve phase:", err);
    }
  }, [currentPhaseId, gameState, decisions, players]);

  // Host Action: Next Phase
  const handleNextPhase = useCallback(async () => {
    try {
      const patch = buildNextPhasePatch(gameState, Date.now());
      await update(ref(db), patch);
    } catch (err) {
      console.error("Lỗi next phase:", err);
    }
  }, [gameState]);

  // Host Action: Start Game (Phase 1)
  const handleStartGame = async () => {
    try {
      const initial = createInitialPolicyState();
      const patch = buildStartPhasePatch(initial, "phase_1", Date.now());

      const playerUpdates = {};
      playerList.forEach((p) => {
        playerUpdates[`players/${p.id}/score`] = 0;
        playerUpdates[`players/${p.id}/taskProgress`] = { phase_1: false, phase_2: false, phase_3: false, phase_4: false };
        playerUpdates[`players/${p.id}/submitted`] = { phase_1: false, phase_2: false, phase_3: false, phase_4: false };
        playerUpdates[`players/${p.id}/decisions`] = { phase_1: null, phase_2: null, phase_3: null, phase_4: null };
        playerUpdates[`players/${p.id}/lastScoreDelta`] = 0;
      });

      await remove(ref(db, "decisions"));
      await remove(ref(db, "positions"));
      await update(ref(db), {
        ...patch,
        ...playerUpdates,
      });
    } catch (err) {
      console.error("Lỗi bắt đầu game:", err);
    }
  };

  // Host Action: Reset Game
  const handleResetGame = async () => {
    try {
      const initial = createInitialPolicyState();
      await set(ref(db, "gameState"), initial);
      await remove(ref(db, "decisions"));
      await remove(ref(db, "positions"));
      const playerUpdates = {};
      playerList.forEach((p) => {
        playerUpdates[`players/${p.id}/score`] = 0;
        playerUpdates[`players/${p.id}/taskProgress`] = null;
        playerUpdates[`players/${p.id}/submitted`] = null;
      });
      if (Object.keys(playerUpdates).length > 0) {
        await update(ref(db), playerUpdates);
      }
    } catch (err) {
      console.error("Lỗi reset game:", err);
    }
  };

  // Host Action: Spawn Extra Thematic Items for All Players
  const handleSpawnExtraItems = async () => {
    try {
      await update(ref(db, "gameState"), {
        spawnEvent: Date.now(),
      });
      iframeRef.current?.contentWindow?.postMessage({ type: "SPAWN_EXTRA_ITEMS" }, "*");
    } catch (err) {
      console.error("Lỗi thả thêm vật phẩm từ Host:", err);
    }
  };

  // Authoritative Timers Check Loop
  useEffect(() => {
    if (!isRpgPhase) return;

    const timer = setInterval(() => {
      const now = Date.now();

      if (
        gameState.phaseStatus === "active" &&
        gameState.decisionEndsAt &&
        now >= gameState.decisionEndsAt
      ) {
        const resolveKey = `${currentPhaseId}:${gameState.decisionEndsAt}`;
        if (autoResolvedRef.current !== resolveKey) {
          autoResolvedRef.current = resolveKey;
          handleResolvePhase();
        }
      }

      if (
        gameState.phaseStatus === "resolved" &&
        gameState.phaseEndsAt &&
        now >= gameState.phaseEndsAt
      ) {
        const nextKey = `${currentPhaseId}:${gameState.phaseEndsAt}`;
        if (autoNextPhaseRef.current !== nextKey) {
          autoNextPhaseRef.current = nextKey;
          handleNextPhase();
        }
      }
    }, 500);

    return () => clearInterval(timer);
  }, [isRpgPhase, gameState, currentPhaseId, handleResolvePhase, handleNextPhase]);

  // Countdown timer
  const [secondsLeft, setSecondsLeft] = useState(0);
  useEffect(() => {
    if (!isRpgPhase) return;
    const updateTime = () => {
      const targetTime = isResolved ? gameState.phaseEndsAt : gameState.decisionEndsAt;
      if (targetTime) {
        setSecondsLeft(Math.max(0, Math.ceil((targetTime - Date.now()) / 1000)));
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 500);
    return () => clearInterval(interval);
  }, [isRpgPhase, isResolved, gameState.phaseEndsAt, gameState.decisionEndsAt]);

  const macro = gameState.macro || {
    foodSecurity: 50,
    industrialOutput: 50,
    socialStability: 50,
    foreignCurrency: 50,
    policySupport: 50
  };

  // Vote Stats Calculator for current phase
  const voteStats = useMemo(() => {
    const counts = {};
    const total = decisionsList.length || 1;
    (cycle?.options || []).forEach((opt) => {
      counts[opt.id] = 0;
    });
    decisionsList.forEach((d) => {
      if (counts[d.optionId] !== undefined) {
        counts[d.optionId] += 1;
      }
    });

    const result = {};
    Object.entries(counts).forEach(([optId, count]) => {
      result[optId] = {
        count,
        percent: Math.round((count / total) * 100),
      };
    });
    return { counts: result, total: decisionsList.length };
  }, [decisionsList, cycle]);

  const Leaderboard = ({ max = 5, title = "BẢNG XẾP HẠNG ĐIỂM CÔNG VỤ" }) => (
    <div
      className="dashboard-widget"
      style={{
        background: "rgba(255,255,255,0.01)",
        border: "1px solid rgba(255,255,255,0.04)",
        borderRadius: "14px",
        padding: "16px",
      }}
    >
      <h3
        className="leaderboard-title"
        style={{
          fontSize: "0.85rem",
          color: "var(--neon-gold)",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          marginBottom: "12px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <IconTrophy className="w-4 h-4 text-yellow-500" /> {title}
      </h3>
      <div className="leaderboard-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {sortedPlayers.slice(0, max).map((p, idx) => {
          const char = getCharacterOption(p.roleId || p.character);
          return (
            <div
              className="leaderboard-item-flat"
              key={p.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                background: "rgba(255,255,255,0.01)",
                border: "1px solid rgba(255,255,255,0.03)",
                borderRadius: "10px",
                padding: "10px 12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background:
                        idx === 0
                          ? "var(--neon-gold)"
                          : idx === 1
                          ? "#a0a0a0"
                          : idx === 2
                          ? "#b07040"
                          : "rgba(255,255,255,0.05)",
                      color: idx < 3 ? "#000" : "#8b8680",
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.85rem",
                    }}
                  >
                    {p.name} <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>({char?.shortLabel || ""})</span>
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.78rem" }}>
                  <span className="pix-num" style={{ color: "var(--neon-gold)", fontWeight: "bold" }}>
                    {p.score || 0}đ
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="minigame-panel host-panel">
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconDesktop className="w-5 h-5 text-red-500" />
          <span
            style={{
              fontWeight: 800,
              color: "var(--neon-red)",
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontSize: "0.95rem",
            }}
          >
            Bảng điều khiển MC (VNR-T17)
          </span>
          {isRpgPhase && (
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--neon-gold)",
                marginLeft: "10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {getPhaseIcon(currentPhaseId)} Phase {currentPhaseId.replace("phase_", "")} ({cycle.year}): {cycle.title}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {isRpgPhase && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.95rem",
                fontWeight: "bold",
                color: isResolved ? "var(--neon-green)" : (secondsLeft <= 30 ? "var(--neon-red)" : "var(--neon-blue)"),
                background: "rgba(0,0,0,0.4)",
                padding: "5px 12px",
                borderRadius: "9999px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              ⏱️ {isResolved ? `Chuyển phase sau: ${secondsLeft}s` : `Còn lại: ${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, "0")}`}
            </div>
          )}

          <button
            className="btn-cyber"
            style={{
              padding: "6px 14px",
              fontSize: "0.75rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "9999px",
            }}
            onClick={onResetRole}
          >
            <IconRefresh className="w-3.5 h-3.5 mr-1 inline-block" /> Đổi vai
          </button>
        </div>
      </div>

      {/* MÀN HÌNH CHỜ (WAITING) */}
      {gameState.status === "waiting" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "30px", alignItems: "start" }}>
          <div>
            <h2 className="minigame-title" style={{ fontSize: "2rem" }}>
              MÔ PHỎNG QUYẾT ĐỊNH CHÍNH SÁCH (1978–1981)
            </h2>
            <p className="minigame-subtitle" style={{ fontSize: "1.1rem", marginBottom: "20px" }}>
              Hành trình thực tiễn "xé rào" và quá trình thể chế hóa mở đường cho Đổi Mới
            </p>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
              <div style={{ color: "var(--neon-gold)", fontWeight: "bold", fontSize: "1rem", marginBottom: "8px" }}>
                🎯 HƯỚNG DẪN DÀNH CHO MC & NGƯỜI CHƠI:
              </div>
              <ul style={{ color: "#cbd5e1", fontSize: "0.88rem", lineHeight: "1.65", margin: 0, paddingLeft: "20px" }}>
                <li><strong>4 Giai đoạn lịch sử (1978–1981):</strong> Hải Phòng khoán hộ ➔ TP.HCM 'Xé rào' & Dệt Thành Công ➔ Long An bù giá vào lương ➔ Thể chế hóa Chỉ thị 100 & Quyết định 25-CP.</li>
                <li><strong>Ghi điểm phong phú:</strong> Khảo sát thực địa (<span style={{ color: "#4ade80" }}>+5đ</span>), Đối thoại Nhân vật Lịch sử (<span style={{ color: "#4ade80" }}>+10đ</span>), Cứu giúp nhân dân (<span style={{ color: "#4ade80" }}>+8đ</span>), Thu thập Tư liệu Lịch sử (<span style={{ color: "#4ade80" }}>+2đ đến +10đ</span>).</li>
                <li><strong>Tránh bẫy:</strong> Cẩn thận bẫy đóng băng quan liêu <strong style={{ color: "#38bdf8" }}>❄️</strong> (đóng băng 2.5s, <span style={{ color: "#f87171" }}>-3đ</span>).</li>
                <li><strong>Quyết định chính sách:</strong> Biểu quyết phương án cải cách và phân bổ Kế hoạch 3 phần (P1, P2, P3) để định hình kinh tế vĩ mô đất nước.</li>
              </ul>
            </div>

            <button
              className="btn-cyber btn-cyber-blue"
              style={{ padding: "16px 32px", fontSize: "1.1rem", fontWeight: "800", width: "100%" }}
              disabled={totalPlayers === 0}
              onClick={handleStartGame}
            >
              Bắt đầu Phase 1 (Năm 1978) 🚀
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "24px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--neon-gold)", textTransform: "uppercase", fontWeight: "bold", marginBottom: "12px", letterSpacing: "1px" }}>
              Quét mã QR để tham gia
            </span>
            {qrUrl && (
              <img
                src={qrUrl}
                alt="QR Code"
                style={{ width: "200px", height: "200px", borderRadius: "12px", border: "2px solid var(--neon-red)", padding: "6px", background: "#fff", marginBottom: "16px" }}
              />
            )}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.8rem", color: "#8b8680" }}>Số người chơi đã vào:</div>
              <div style={{ fontSize: "2rem", fontWeight: "bold", fontFamily: "var(--font-mono)", color: "var(--neon-gold)" }}>
                {totalPlayers}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MÀN HÌNH ACTIVE PHASE (PHASE 1 - 4) */}
      {isRpgPhase && !isResolved && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>
          {/* CỘT TRÁI: KPI VĨ MÔ & SPECTATOR MAP */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* KPI Cards Flat */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
              <div className="kpi-card-flat">
                <span className="kpi-label">🌾 Lương Thực</span>
                <span className="kpi-val pix-num" style={{ color: "#34d399" }}>{macro.foodSecurity}</span>
              </div>
              <div className="kpi-card-flat">
                <span className="kpi-label">🏭 Công Nghiệp</span>
                <span className="kpi-val pix-num" style={{ color: "#38bdf8" }}>{macro.industrialOutput}</span>
              </div>
              <div className="kpi-card-flat">
                <span className="kpi-label">🤝 Ổn Định XH</span>
                <span className="kpi-val pix-num" style={{ color: "#fbbf24" }}>{macro.socialStability}</span>
              </div>
              <div className="kpi-card-flat">
                <span className="kpi-label">💵 Ngoại Tệ</span>
                <span className="kpi-val pix-num" style={{ color: "#c084fc" }}>{macro.foreignCurrency}</span>
              </div>
              <div className="kpi-card-flat">
                <span className="kpi-label">🏛️ Thể Chế</span>
                <span className="kpi-val pix-num" style={{ color: "#f472b6" }}>{macro.policySupport}</span>
              </div>
            </div>

            {/* Spectator Iframe Map */}
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "16px",
                overflow: "hidden",
                background: "#000",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              <iframe
                ref={iframeRef}
                src={typeof window !== "undefined" && window.location.pathname.startsWith("/HCM202") ? "/rpg/index.html?role=host" : "./rpg/index.html?role=host"}
                onLoad={handleIframeLoad}
                style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }}
                title="RPG Spectator"
              />
            </div>

            <div style={{ color: "#8b8680", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px" }}>
              <IconBulb className="w-3.5 h-3.5 text-yellow-500" /> Kéo chuột hoặc phím mũi tên để quan sát toàn bộ các trạm trên bản đồ
            </div>
          </div>

          {/* CỘT PHẢI: MC DẪN DẮT, LEADERBOARD & ACTION BUTTON */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div
              className="narrative-widget"
              style={{
                background: "rgba(255,183,0,0.02)",
                border: "1px solid rgba(255,183,0,0.1)",
                borderRadius: "12px",
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--neon-gold)",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                <IconBulb className="w-3.5 h-3.5 text-yellow-500" /> BỐI CẢNH LỊCH SỬ
              </div>
              <p style={{ color: "#e1dbd6", fontStyle: "italic", fontSize: "0.82rem", margin: 0, lineHeight: "1.45" }}>
                "{cycle.description}"
              </p>
            </div>

            {/* Tiến độ nộp phiếu */}
            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px",
                padding: "10px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Tiến độ nộp quyết định:</span>
              <span style={{ fontWeight: "bold", color: "var(--neon-gold)", fontFamily: "var(--font-mono)", fontSize: "0.95rem" }}>
                {submittedCount} / {totalPlayers}
              </span>
            </div>

            <Leaderboard max={5} />

            <button
              className="btn-cyber"
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "0.85rem",
                fontWeight: "bold",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.5)",
                color: "#34d399",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                cursor: "pointer",
              }}
              onClick={handleSpawnExtraItems}
            >
              <span>🌱</span>
              <span>THẢ THÊM TƯ LIỆU CHO CẢ LỚP (+5)</span>
            </button>

            <button
              className="btn-cyber btn-cyber-blue"
              style={{ width: "100%", padding: "14px", fontSize: "0.95rem", fontWeight: "800" }}
              onClick={handleResolvePhase}
            >
              <IconBolt className="w-4 h-4 text-yellow-400 mr-1.5 inline-block" />
              Khóa & Đánh Giá Quyết Định Ngay
            </button>
          </div>
        </div>
      )}

      {/* MÀN HÌNH REVIEW KẾT QUẢ QUYẾT ĐỊNH (RESOLVED) */}
      {isRpgPhase && isResolved && gameState.currentResult && (() => {
        const res = gameState.currentResult;
        const agri = res.agriculture;
        const ind = res.industry;

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Header kết quả */}
            <div style={{ textAlign: "center" }}>
              <span className="selected-character-badge" style={{ "--character-color": "#facc15", padding: "4px 12px", fontSize: "0.8rem", fontWeight: "bold" }}>
                KẾT QUẢ GIAI ĐOẠN NĂM {cycle.year}
              </span>
              <h2 className="minigame-title" style={{ fontSize: "1.8rem", marginTop: "8px" }}>
                QUYẾT ĐỊNH ĐA SỐ: {res.winningOptionTitle}
              </h2>
            </div>

            {/* Voting Options Distribution Cards */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cycle.options.length}, 1fr)`, gap: "16px" }}>
              {cycle.options.map((opt, idx) => {
                const optStats = voteStats.counts[opt.id] || { count: 0, percent: 0 };
                const isWinning = opt.id === res.winningOptionId;

                return (
                  <div
                    key={opt.id}
                    style={{
                      background: isWinning ? "rgba(16, 185, 129, 0.08)" : "rgba(15, 23, 42, 0.5)",
                      border: isWinning ? "2px solid #34d399" : "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "16px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "800", fontSize: "1rem", color: isWinning ? "#34d399" : "#f8fafc", marginBottom: "6px" }}>
                        {String.fromCharCode(65 + idx)}. {opt.title}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#cbd5e1", lineHeight: "1.4", marginBottom: "12px" }}>
                        {opt.description}
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <div style={{ flex: 1, height: "16px", background: "rgba(0,0,0,0.4)", borderRadius: "8px", overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${optStats.percent}%`,
                              background: isWinning ? "linear-gradient(90deg, #059669, #34d399)" : "linear-gradient(90deg, #3b82f6, #60a5fa)",
                              borderRadius: "8px",
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: "800", fontFamily: "var(--font-mono)", fontSize: "0.88rem", color: isWinning ? "#34d399" : "#94a3b8" }}>
                          {optStats.count} ({optStats.percent}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Macro KPIs Impact Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
              {[
                { label: "🌾 Lương Thực", key: "foodSecurity", val: res.macro?.foodSecurity, delta: res.macroDelta?.foodSecurity },
                { label: "🏭 Công Nghiệp", key: "industrialOutput", val: res.macro?.industrialOutput, delta: res.macroDelta?.industrialOutput },
                { label: "🤝 Ổn Định", key: "socialStability", val: res.macro?.socialStability, delta: res.macroDelta?.socialStability },
                { label: "💵 Ngoại Tệ", key: "foreignCurrency", val: res.macro?.foreignCurrency, delta: res.macroDelta?.foreignCurrency },
                { label: "🏛️ Thể Chế", key: "policySupport", val: res.macro?.policySupport, delta: res.macroDelta?.policySupport },
              ].map((m) => (
                <div key={m.key} className="kpi-card-flat" style={{ padding: "10px" }}>
                  <span className="kpi-label">{m.label}</span>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "6px" }}>
                    <span className="kpi-val pix-num">{m.val}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: (m.delta || 0) >= 0 ? "#34d399" : "#f87171" }}>
                      {(m.delta || 0) >= 0 ? `+${m.delta}` : m.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Economic Formulas Explanation */}
            {(agri || ind) && (
              <div style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(250, 204, 21, 0.3)", borderRadius: "16px", padding: "16px" }}>
                <div style={{ color: "#facc15", fontWeight: "800", fontSize: "0.95rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <IconBulb className="w-4 h-4 text-yellow-400" /> MÔ HÌNH TOÁN KINH TẾ & PHÂN BỔ:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "0.82rem", color: "#e2e8f0" }}>
                  {agri && (
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "8px" }}>
                      <strong style={{ color: "#34d399" }}>Nông nghiệp (Hàm Ya):</strong>
                      <div>• Tỷ lệ khoán sản phẩm (Ie): {agri.Ie} (θ kiểm soát: {agri.theta})</div>
                      <div>• Lao động tập trung (Lc): {agri.Lc}%</div>
                      <div>• Hệ số sản lượng (Ya): <span style={{ color: "#34d399", fontWeight: "bold" }}>{agri.YaPercent}%</span></div>
                    </div>
                  )}
                  {ind && (
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "8px" }}>
                      <strong style={{ color: "#38bdf8" }}>Công nghiệp (Kế hoạch 3 phần):</strong>
                      <div>• P1(Pháp lệnh): {Math.round(ind.P1 * 100)}% | P2(Tự cân đối): {Math.round(ind.P2 * 100)}% | P3(Phụ thêm): {Math.round(ind.P3 * 100)}%</div>
                      <div>• Chỉ số hiệu quả (Ei): <span style={{ color: "#38bdf8", fontWeight: "bold" }}>{ind.Ei}</span></div>
                      {ind.administrativePenalty && (
                        <div style={{ color: "#f87171", fontWeight: "bold", marginTop: "4px" }}>
                          ⚠️ Phạt hành chính do P1 &lt; 40%
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              className="btn-cyber btn-cyber-blue"
              style={{ padding: "14px", fontSize: "1rem", fontWeight: "800" }}
              onClick={handleNextPhase}
            >
              Chuyển Sang Phase Tiếp Theo &rarr;
            </button>
          </div>
        );
      })()}

      {/* MÀN HÌNH TỔNG KẾT (FINISHED) */}
      {gameState.status === "finished" && (
        <div style={{ textAlign: "center" }}>
          <h2 className="minigame-title" style={{ display: "inline-flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
            <IconTrophy className="w-10 h-10 text-yellow-500 animate-bounce" /> HOÀN THÀNH MÔ PHỎNG LỊCH SỬ 1978–1981
          </h2>
          <p className="minigame-subtitle">Tổng kết 4 chu kỳ quyết định của toàn cơ quan</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", margin: "24px 0" }}>
            <div className="kpi-card-flat"><span className="kpi-label">🌾 Lương Thực</span><span className="kpi-val pix-num">{macro.foodSecurity}</span></div>
            <div className="kpi-card-flat"><span className="kpi-label">🏭 Công Nghiệp</span><span className="kpi-val pix-num">{macro.industrialOutput}</span></div>
            <div className="kpi-card-flat"><span className="kpi-label">🤝 Ổn Định XH</span><span className="kpi-val pix-num">{macro.socialStability}</span></div>
            <div className="kpi-card-flat"><span className="kpi-label">💵 Ngoại Tệ</span><span className="kpi-val pix-num">{macro.foreignCurrency}</span></div>
            <div className="kpi-card-flat"><span className="kpi-label">🏛️ Thể Chế</span><span className="kpi-val pix-num">{macro.policySupport}</span></div>
          </div>

          <Leaderboard max={10} title="BẢNG XẾP HẠNG CHI TIẾT (TOP 10)" />

          <div className="mission-card" style={{ marginTop: "24px", textAlign: "left" }}>
            <div className="mission-label">BÀI HỌC KINH TẾ CHÍNH TRỊ</div>
            <div className="mission-text">
              Thực tiễn sinh động giai đoạn 1978–1981 đã chứng minh rằng: khi mô hình tập trung quan liêu bộc lộ khuyết tật, những sáng kiến từ cơ sở (khoán sản phẩm, tự chủ sản xuất, cơ chế giá thị trường) đã tạo xung lực mạnh mẽ để mở đường cho Đổi Mới toàn diện 1986.
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
            <button className="btn-cyber" style={{ flex: 1 }} onClick={handleStartGame}>Chơi lại từ Phase 1</button>
            <button className="btn-cyber btn-cyber-blue" style={{ flex: 1 }} onClick={handleResetGame}>Về phòng chờ</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostView;
