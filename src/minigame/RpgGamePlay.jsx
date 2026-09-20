import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { get, onValue, ref, runTransaction, update, set } from "firebase/database";
import { db } from "./firebaseConfig";
import { getCharacterOption } from "./characterOptions";
import { buildPolicyRpgSnapshot, isPolicyStationMessage, normalizePlayerMove } from "./rpgBridge";
import { createPositionWriter, subscribeToPlayerPositions } from "./playerPositionSync";
import { getPolicyCycle, POLICY_CYCLES } from "./policyCycles";
import { PixelAvatarPreview } from "./PixelAvatarPreview";
import { CycleDecisionPanel } from "./CycleDecisionPanel";
import { PhaseResult } from "./PhaseResult";
import { PlayerPhaseReviewModal } from "./PlayerPhaseReviewModal";
import { HISTORICAL_NPCS_BY_PHASE } from "./historicalNpcData";
import { HistoricalDialogueModal } from "./HistoricalDialogueModal";
import {
  IconLeaf,
  IconWarning,
  IconFlame,
  IconBook,
  IconBolt,
  IconTrophy,
  IconCrown,
  IconBulb,
  IconUser,
  IconCheck,
  IconPin,
  IconArrowRight,
  IconRefresh
} from "./icons";

const getPhaseIcon = (status, className = "w-5 h-5") => {
  if (status === "phase_1") return <IconLeaf className={`${className} text-emerald-500`} />;
  if (status === "phase_2") return <IconWarning className={`${className} text-cyan-500`} />;
  if (status === "phase_3") return <IconFlame className={`${className} text-amber-500`} />;
  return null;
};

const POSITION_UPDATE_INTERVAL_MS = 125;

export const RpgGamePlay = ({
  playerId,
  playerName,
  playerInfo = {},
  players = {},
  dbConnected = false,
  gameState = {},
  myDecision = null,
  onSubmitDecision
}) => {
  const iframeRef = useRef(null);
  const iframeReadyRef = useRef(false);
  const lastPlayerMoveAtRef = useRef(0);
  const positionsRef = useRef({});
  const selectedCharacter = getCharacterOption(playerInfo.roleId || playerInfo.character);

  const [floatingTexts, setFloatingTexts] = useState([]);
  const [nowMs, setNowMs] = useState(Date.now());
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [activeNpcDialogue, setActiveNpcDialogue] = useState(null);
  const [isBgmOn, setIsBgmOn] = useState(() => {
    try {
      return localStorage.getItem("minigame_bgm_muted") === "false";
    } catch {
      return false;
    }
  });

  const handleToggleBgm = () => {
    setIsBgmOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("minigame_bgm_muted", (!next).toString());
      } catch {}
      iframeRef.current?.contentWindow?.postMessage({
        type: "SET_BGM_MUTED",
        muted: !next,
      }, "*");
      return next;
    });
  };

  const phaseId = gameState.status || gameState.phaseId || "phase_1";
  const cycle = getPolicyCycle(phaseId);
  const isTaskCompleted = Boolean(
    playerInfo.taskProgress?.[phaseId] || playerInfo.taskCompleted
  );
  const hasSubmitted = Boolean(
    myDecision || playerInfo.submitted?.[phaseId]
  );
  const isResolved = gameState.phaseStatus === "resolved";

  const positionWriter = useMemo(
    () =>
      createPositionWriter({
        writeModern: (move) =>
          update(ref(db, `positions/${playerId}`), {
            x: move.x,
            y: move.y,
            direction: move.direction,
          }),
        writeLegacy: (move) =>
          update(ref(db, `players/${playerId}`), {
            position: { x: move.x, y: move.y },
            direction: move.direction,
          }),
      }),
    [playerId]
  );

  const addFloatingText = (text, color = "var(--neon-green)") => {
    const id = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev, { id, text, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  };

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return subscribeToPlayerPositions(db, ({ playerId: incomingPlayerId, position }) => {
      if (position) positionsRef.current[incomingPlayerId] = position;
      else delete positionsRef.current[incomingPlayerId];

      if (iframeReadyRef.current) {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "PLAYER_POSITION",
            playerId: incomingPlayerId,
            position,
          },
          "*"
        );
      }
    });
  }, []);

  const postRpgSnapshot = useCallback(
    (force = false) => {
      const iframeWindow = iframeRef.current?.contentWindow;
      if (!iframeWindow || (!iframeReadyRef.current && !force)) return;
      iframeWindow.postMessage(
        buildPolicyRpgSnapshot({
          gameState,
          players,
          positions: positionsRef.current,
          currentPlayerId: playerId,
        }),
        "*"
      );
    },
    [gameState, players, playerId]
  );

  const handleIframeLoad = useCallback(() => {
    iframeReadyRef.current = true;
    postRpgSnapshot(true);
    iframeRef.current?.contentWindow?.postMessage({
      type: "SET_BGM_MUTED",
      muted: !isBgmOn,
    }, "*");
    setTimeout(() => {
      iframeRef.current?.focus();
    }, 100);
  }, [postRpgSnapshot, isBgmOn]);

  const lastSpawnEventRef = useRef(0);
  useEffect(() => {
    if (gameState.spawnEvent && gameState.spawnEvent > lastSpawnEventRef.current) {
      lastSpawnEventRef.current = gameState.spawnEvent;
      iframeRef.current?.contentWindow?.postMessage({ type: "SPAWN_EXTRA_ITEMS" }, "*");
      addFloatingText("🌱 Ban Tổ Chức đã thả thêm 5 tư liệu trên bản đồ!", "#34d399");
    }
  }, [gameState.spawnEvent]);

  useEffect(() => {
    postRpgSnapshot();
  }, [postRpgSnapshot]);

  // Handle postMessage from RPG iframe
  useEffect(() => {
    const handleMessage = async (e) => {
      const msg = e.data;
      if (!msg || typeof msg !== "object") return;

      if (msg.type === "BGM_STATE") {
        setIsBgmOn(!msg.muted);
        return;
      }

      if (msg.type === "PLAYER_MOVE") {
        const move = normalizePlayerMove(msg);
        const now = Date.now();
        if (now - lastPlayerMoveAtRef.current < POSITION_UPDATE_INTERVAL_MS) return;
        lastPlayerMoveAtRef.current = now;
        positionWriter.write(move);
        return;
      }

      if (msg.type === "POLICY_ITEM_COLLECT") {
        try {
          const delta = Number.isFinite(msg.scoreDelta) ? msg.scoreDelta : 2;
          await runTransaction(ref(db, `players/${playerId}/score`), (currentScore) => Math.max(0, (currentScore || 0) + delta));
          addFloatingText(msg.message || `${delta >= 0 ? "+" : ""}${delta}đ`, delta >= 0 ? "#fde047" : "#ef4444");
        } catch (err) {
          console.error("Lỗi cập nhật điểm item:", err);
        }
        return;
      }

      if (msg.type === "NPC_DIALOGUE_OPEN") {
        const npcs = HISTORICAL_NPCS_BY_PHASE[phaseId] || HISTORICAL_NPCS_BY_PHASE.phase_1;
        const targetNpc = npcs.find((n) => n.id === msg.npcId) || npcs[0];
        if (targetNpc) {
          setActiveNpcDialogue(targetNpc);
        }
        return;
      }

      if (msg.type === "POLICY_STATION_INTERACT") {
        if (!isTaskCompleted && msg.phaseId === phaseId) {
          try {
            await set(ref(db, `players/${playerId}/taskProgress/${phaseId}`), true);
            addFloatingText("✅ Khảo sát thực địa thành công! (+5 Điểm)", "#4ade80");
            setTimeout(() => {
              setIsDecisionModalOpen(true);
            }, 800);
          } catch (err) {
            console.error("Lỗi cập nhật taskProgress:", err);
          }
        } else {
          setIsDecisionModalOpen(true);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [phaseId, playerId, isTaskCompleted, positionWriter]);

  // Sync BGM with Phase status: When Host resolves, music stops; when entering next phase, music plays
  useEffect(() => {
    if (isResolved) {
      iframeRef.current?.contentWindow?.postMessage({
        type: "SET_BGM_MUTED",
        muted: true,
      }, "*");
    } else if (isBgmOn) {
      iframeRef.current?.contentWindow?.postMessage({
        type: "SET_BGM_MUTED",
        muted: false,
      }, "*");
    }
  }, [isResolved, isBgmOn]);

  
  // Global Keyboard Controls Forwarding to RPG iframe
  useEffect(() => {
    const keyMap = {
      KeyW: "up", ArrowUp: "up", w: "up", W: "up", ư: "up", Ư: "up",
      KeyS: "down", ArrowDown: "down", s: "down", S: "down",
      KeyA: "left", ArrowLeft: "left", a: "left", A: "left",
      KeyD: "right", ArrowRight: "right", d: "right", D: "right", đ: "right", Đ: "right",
    };

    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.code === "KeyE" || e.code === "Space" || e.code === "Enter" || e.key === "e" || e.key === "E" || e.key === " ") {
        e.preventDefault();
        iframeRef.current?.contentWindow?.postMessage({ type: "ACTION_INTERACT" }, "*");
        return;
      }

      if (e.code === "KeyQ" || e.key === "q" || e.key === "Q" || e.code === "ShiftLeft" || e.code === "ShiftRight") {
        e.preventDefault();
        iframeRef.current?.contentWindow?.postMessage({ type: "ACTIVATE_PERK" }, "*");
        return;
      }

      const dir = keyMap[e.code] || keyMap[e.key];
      if (dir) {
        e.preventDefault();
        iframeRef.current?.contentWindow?.postMessage({ type: "SET_DIRECTION", direction: dir, active: true }, "*");
      }
    };

    const handleKeyUp = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const dir = keyMap[e.code] || keyMap[e.key];
      if (dir) {
        e.preventDefault();
        iframeRef.current?.contentWindow?.postMessage({ type: "SET_DIRECTION", direction: dir, active: false }, "*");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Answer NPC Historical Dialogue
  const handleAnswerNpcDialogue = async ({ npcId, scoreDelta, badge }) => {
    try {
      if (scoreDelta > 0) {
        await runTransaction(ref(db, `players/${playerId}/score`), (currentScore) => (currentScore || 0) + scoreDelta);
        addFloatingText(`★ ${badge || "ĐỐI THOẠI XUẤT SẮC"} (+${scoreDelta}đ)!`, "var(--neon-gold)");
      }
      iframeRef.current?.contentWindow?.postMessage({ type: "NPC_DIALOGUE_ANSWERED", npcId }, "*");
    } catch (err) {
      console.error("Lỗi cộng điểm NPC:", err);
    }
  };

  // D-pad & Action Handlers
  const handleDpadPress = (dir, e) => {
    if (e && e.cancelable && e.type === "touchstart") e.preventDefault();
    iframeRef.current?.contentWindow?.postMessage({ type: "SET_DIRECTION", direction: dir, active: true }, "*");
  };
  const handleDpadRelease = (dir, e) => {
    if (e && e.cancelable && e.type === "touchend") e.preventDefault();
    iframeRef.current?.contentWindow?.postMessage({ type: "SET_DIRECTION", direction: dir, active: false }, "*");
  };
  const handleActionPress = (e) => {
    if (e && e.cancelable && e.type === "touchstart") e.preventDefault();
    iframeRef.current?.contentWindow?.postMessage({ type: "ACTION_INTERACT" }, "*");
  };

  const sortedPlayers = useMemo(
    () =>
      Object.entries(players || {})
        .map(([id, p]) => ({ id, ...p }))
        .sort((a, b) => (b.score || 0) - (a.score || 0)),
    [players]
  );

  const playerRank = useMemo(() => {
    const rank = sortedPlayers.findIndex((p) => p.id === playerId);
    return rank !== -1 ? rank + 1 : "-";
  }, [sortedPlayers, playerId]);

  const timerEndsAt = isResolved ? gameState.phaseEndsAt : gameState.decisionEndsAt;
  const secondsLeft = timerEndsAt
    ? Math.max(0, Math.ceil((timerEndsAt - nowMs) / 1000))
    : 120;

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      role: "player",
      id: playerId,
      name: playerName || "Player",
      color: selectedCharacter?.color || "#059669",
      character: selectedCharacter?.id || "worker_leader",
      roleId: selectedCharacter?.id || "worker_leader",
    });
    const basePath = typeof window !== "undefined" && window.location.pathname.startsWith("/HCM202")
      ? "/rpg/index.html"
      : "./rpg/index.html";
    return `${basePath}?${params.toString()}`;
  }, [playerId, playerName, selectedCharacter]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "20px",
        width: "100%",
        maxWidth: "1920px",
        margin: "0 auto",
      }}
    >
      {/* CỘT TRÁI: Bảng xếp hạng (Chỉ hiện trên PC/Tablet) */}
      <div
        className="hidden lg:flex"
        style={{
          width: "260px",
          flexDirection: "column",
          gap: "16px",
          background: "rgba(15, 23, 42, 0.7)",
          borderRadius: "16px",
          padding: "16px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "var(--neon-gold)",
            fontSize: "0.95rem",
            fontFamily: "var(--font-mono)",
            textAlign: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <IconTrophy className="w-4 h-4 text-yellow-500" /> BẢNG XẾP HẠNG
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {sortedPlayers.slice(0, 10).map((p, idx) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: p.id === playerId ? "rgba(245, 158, 11, 0.15)" : "rgba(0,0,0,0.3)",
                padding: "8px 12px",
                borderRadius: "8px",
                border: p.id === playerId ? "1px solid rgba(245, 158, 11, 0.6)" : "1px solid transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    color:
                      idx === 0
                        ? "#facc15"
                        : idx === 1
                        ? "#94a3b8"
                        : idx === 2
                        ? "#b45309"
                        : "#64748b",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  #{idx + 1}
                </span>
                <span
                  style={{
                    fontSize: "0.82rem",
                    color: p.id === playerId ? "#fde047" : "#f8fafc",
                    maxWidth: "110px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontWeight: p.id === playerId ? "bold" : "normal",
                  }}
                >
                  {p.name || p.id}
                </span>
              </div>
              <span className="pix-num" style={{ color: "var(--neon-gold)", fontSize: "0.95rem", fontWeight: "bold" }}>
                {p.score || 0}đ
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CỘT GIỮA: Màn hình game & Canvas */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: "1 1 auto",
          width: "100%",
          minWidth: 0,
          maxWidth: "1400px",
        }}
      >
        {/* Phase indicator + HUD trên Mobile & PC */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
            width: "100%",
            background: "rgba(18, 12, 13, 0.92)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "14px",
            padding: "8px 12px",
            marginBottom: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {/* Phase badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {getPhaseIcon(phaseId, "w-5 h-5")}
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--neon-gold)", fontWeight: "800", textTransform: "uppercase" }}>
                Giai đoạn {cycle.year}
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#ffffff" }}>
                {cycle.title}
              </div>
            </div>
          </div>

          {/* Mobile Player Score & Rank Badge (Hiện rõ trên màn hình điện thoại) */}
          <div
            className="flex lg:hidden items-center gap-1.5"
            style={{
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(250, 204, 21, 0.35)",
              borderRadius: "20px",
              padding: "3px 10px",
            }}
          >
            <span style={{ fontSize: "0.82rem", color: "var(--neon-gold)", fontWeight: "bold" }}>
              ⭐ {playerInfo.score || 0}đ
            </span>
            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
              (#{playerRank})
            </span>
          </div>

          {/* Timer & Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={handleToggleBgm}
              title={isBgmOn ? "Tắt nhạc nền (Lovely Garden)" : "Bật nhạc nền (Lovely Garden)"}
              style={{
                background: isBgmOn ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                border: isBgmOn ? "1px solid rgba(16, 185, 129, 0.5)" : "1px solid rgba(239, 68, 68, 0.5)",
                color: isBgmOn ? "#34d399" : "#f87171",
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "0.75rem",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.2s ease",
              }}
            >
              <span>{isBgmOn ? "🔊" : "🔇"}</span>
              <span className="hidden sm:inline">{isBgmOn ? "NHẠC (Lovely Garden)" : "TẮT NHẠC"}</span>
            </button>

            <button
              onClick={() => setIsHelpModalOpen(true)}
              style={{
                background: "rgba(245, 158, 11, 0.15)",
                border: "1px solid rgba(245, 158, 11, 0.5)",
                color: "#fde047",
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "0.75rem",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.2s ease",
              }}
            >
              <span>❓</span>
              <span className="hidden sm:inline">HƯỚNG DẪN</span>
            </button>

            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.95rem",
                fontWeight: "bold",
                color: secondsLeft <= 30 ? "#ef4444" : "#38bdf8",
                background: "rgba(0,0,0,0.4)",
                padding: "3px 8px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              ⏱️ {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* 2-Step Mission Progress Tracker */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            width: "100%",
            background: "rgba(15, 23, 42, 0.95)",
            border: isTaskCompleted ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(245, 158, 11, 0.35)",
            borderRadius: "12px",
            padding: "6px 12px",
            marginBottom: "8px",
          }}
        >
          {/* Step 1 */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: isTaskCompleted ? "#10b981" : "#f59e0b",
                color: "#000",
                fontWeight: "bold",
                fontSize: "0.72rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {isTaskCompleted ? "✓" : "1"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.64rem", color: "#94a3b8", fontWeight: "bold" }}>BƯỚC 1: KHẢO SÁT</div>
              <div style={{ fontSize: "0.76rem", fontWeight: "bold", color: isTaskCompleted ? "#34d399" : "#facc15", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {isTaskCompleted ? "✓ Đã khảo sát (+5đ)" : "Đến Cột sáng vàng 📍"}
              </div>
            </div>
          </div>

          <div style={{ color: "#64748b", fontWeight: "bold", fontSize: "0.8rem", flexShrink: 0 }}>➔</div>

          {/* Step 2 */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: hasSubmitted ? "#10b981" : (isTaskCompleted ? "#38bdf8" : "#475569"),
                color: "#000",
                fontWeight: "bold",
                fontSize: "0.72rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {hasSubmitted ? "✓" : "2"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.64rem", color: "#94a3b8", fontWeight: "bold" }}>BƯỚC 2: QUYẾT ĐỊNH</div>
              <div style={{ fontSize: "0.76rem", fontWeight: "bold", color: hasSubmitted ? "#34d399" : (isTaskCompleted ? "#38bdf8" : "#94a3b8"), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {hasSubmitted ? "✓ Đã gửi phiếu" : "Mở Phiếu Quyết Định 📜"}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas wrapper (16/9 RPG frame) */}
        <div
          style={{
            position: "relative",
            width: "100%",
            border: "2px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            overflow: "hidden",
            background: "#000",
            boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
          }}
        >
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            onLoad={handleIframeLoad}
            allow="autoplay"
            style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }}
            title="RPG Gameplay Canvas"
            tabIndex={0}
          />

          {/* Floating text notifications */}
          {floatingTexts.map((ft) => (
            <div
              key={ft.id}
              style={{
                position: "absolute",
                top: "40%",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "1.3rem",
                fontWeight: "800",
                color: ft.color,
                textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                animation: "floatUp 1.5s ease-out forwards",
                pointerEvents: "none",
                zIndex: 10,
                background: "rgba(0,0,0,0.75)",
                padding: "8px 16px",
                borderRadius: "10px",
                border: `1px solid ${ft.color}`,
              }}
            >
              {ft.text}
            </div>
          ))}

          {/* Quick Decision Action Overlay Banner */}
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              zIndex: 20,
            }}
          >
            <button
              onClick={() => !isResolved && setIsDecisionModalOpen(true)}
              disabled={isResolved}
              style={{
                background: isResolved
                  ? "rgba(71, 85, 105, 0.92)"
                  : (hasSubmitted ? "rgba(16, 185, 129, 0.95)" : "linear-gradient(135deg, #f59e0b, #d97706)"),
                border: "2px solid #fff",
                borderRadius: "10px",
                padding: "7px 12px",
                color: "#000",
                fontWeight: "800",
                fontSize: "0.8rem",
                boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                touchAction: "manipulation",
              }}
            >
              <span>📜</span>
              <span>{hasSubmitted ? "ĐÃ NỘP PHIẾU ✓" : "PHIẾU QUYẾT ĐỊNH"}</span>
            </button>
          </div>
        </div>

        {/* MODAL OVERLAY: ĐÁNH GIÁ LỰA CHỌN SÁNG SUỐT & BẢNG XẾP HẠNG KHI HOST CHỐT PHASE */}
        {isResolved && gameState.currentResult && (
          <PlayerPhaseReviewModal
            phaseId={phaseId}
            playerInfo={playerInfo}
            myDecision={myDecision}
            currentResult={gameState.currentResult}
            sortedPlayers={sortedPlayers}
            playerId={playerId}
            playerRank={playerRank}
            phaseEndsAt={gameState.phaseEndsAt}
          />
        )}

        {/* Controls Helper Text */}
        <div
          style={{
            color: "#8b8680",
            fontSize: "0.75rem",
            marginTop: "10px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            justifyContent: "center",
          }}
        >
          <span>Điều khiển: WASD / Mũi tên</span>
          <span>•</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
            <IconBook className="w-3.5 h-3.5 text-amber-500" /> {cycle.task.objectiveLabel}
          </span>
          <span>•</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
            <IconBolt className="w-3.5 h-3.5 text-red-500" /> ⚡ [SPACE] Khảo sát / ✨ [Q] Kỹ năng
          </span>
        </div>

        {/* Virtual Touch D-pad & Action Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            marginTop: "12px",
            width: "100%",
            maxWidth: "460px",
          }}
        >
          {/* D-pad */}
          <div className="dpad-container" style={{ userSelect: "none", margin: 0 }}>
            <button
              className="dpad-btn"
              onMouseDown={(e) => handleDpadPress("up", e)}
              onMouseUp={(e) => handleDpadRelease("up", e)}
              onMouseLeave={(e) => handleDpadRelease("up", e)}
              onTouchStart={(e) => handleDpadPress("up", e)}
              onTouchEnd={(e) => handleDpadRelease("up", e)}
              onTouchCancel={(e) => handleDpadRelease("up", e)}
            >
              ▲
            </button>
            <div style={{ display: "flex", gap: "25px" }}>
              <button
                className="dpad-btn"
                onMouseDown={(e) => handleDpadPress("left", e)}
                onMouseUp={(e) => handleDpadRelease("left", e)}
                onMouseLeave={(e) => handleDpadRelease("left", e)}
                onTouchStart={(e) => handleDpadPress("left", e)}
                onTouchEnd={(e) => handleDpadRelease("left", e)}
                onTouchCancel={(e) => handleDpadRelease("left", e)}
              >
                ◀
              </button>
              <button
                className="dpad-btn"
                onMouseDown={(e) => handleDpadPress("right", e)}
                onMouseUp={(e) => handleDpadRelease("right", e)}
                onMouseLeave={(e) => handleDpadRelease("right", e)}
                onTouchStart={(e) => handleDpadPress("right", e)}
                onTouchEnd={(e) => handleDpadRelease("right", e)}
                onTouchCancel={(e) => handleDpadRelease("right", e)}
              >
                ▶
              </button>
            </div>
            <button
              className="dpad-btn"
              onMouseDown={(e) => handleDpadPress("down", e)}
              onMouseUp={(e) => handleDpadRelease("down", e)}
              onMouseLeave={(e) => handleDpadRelease("down", e)}
              onTouchStart={(e) => handleDpadPress("down", e)}
              onTouchEnd={(e) => handleDpadRelease("down", e)}
              onTouchCancel={(e) => handleDpadRelease("down", e)}
            >
              ▼
            </button>
          </div>

          {/* Action & Perk Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Class Perk Skill Button */}
            <button
              className="action-stamp-btn"
              onClick={(e) => {
                if (e && e.cancelable && e.type === "touchstart") e.preventDefault();
                iframeRef.current?.contentWindow?.postMessage({ type: "ACTIVATE_PERK" }, "*");
              }}
              onTouchStart={(e) => {
                if (e && e.cancelable && e.type === "touchstart") e.preventDefault();
                iframeRef.current?.contentWindow?.postMessage({ type: "ACTIVATE_PERK" }, "*");
              }}
              title="Kích hoạt đặc quyền giai cấp"
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                background: "radial-gradient(circle at 30% 30%, #38bdf8, #0369a1)",
                border: "3px solid #7dd3fc",
                boxShadow: "0 4px 14px rgba(56, 189, 248, 0.45), 0 0 0 2px #000",
                color: "#ffffff",
                fontFamily: "var(--font-heading)",
                fontSize: "0.68rem",
                fontWeight: "800",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                touchAction: "manipulation",
                userSelect: "none",
                gap: "1px",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>✨</span>
              <span style={{ fontSize: "9px" }}>KỸ NĂNG</span>
              <span style={{ fontSize: "7px", color: "#e0f2fe" }}>[Q]</span>
            </button>

            {/* Main Action Button: Khảo sát / Tương tác */}
            <button
              className="action-stamp-btn"
              onClick={(e) => handleActionPress(e)}
              onTouchStart={(e) => handleActionPress(e)}
              style={{
                width: "82px",
                height: "82px",
                borderRadius: "50%",
                background: "radial-gradient(circle at 30% 30%, #ef4444, #991b1b)",
                border: "4px solid #facc15",
                boxShadow: "0 6px 18px rgba(239, 68, 68, 0.45), 0 0 0 2px #000",
                color: "#ffffff",
                fontFamily: "var(--font-heading)",
                fontSize: "0.76rem",
                fontWeight: "800",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                touchAction: "manipulation",
                userSelect: "none",
                gap: "2px",
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>⚡</span>
              <span>KHẢO SÁT</span>
              <span style={{ fontSize: "8px", color: "#fef08a" }}>[SPACE]</span>
            </button>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: Trạng thái & Điểm số cá nhân (Chỉ hiện trên PC/Tablet) */}
      <div
        className="hidden lg:flex"
        style={{
          width: "260px",
          flexDirection: "column",
          gap: "16px",
          background: "rgba(15, 23, 42, 0.7)",
          borderRadius: "16px",
          padding: "16px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "#38bdf8",
            fontSize: "0.95rem",
            fontFamily: "var(--font-mono)",
            textAlign: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span>THÔNG TIN CÁN BỘ</span>
          <span style={{ fontSize: "0.75rem", color: "#f8fafc", fontWeight: "normal" }}>{playerName}</span>
        </h3>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <PixelAvatarPreview character={selectedCharacter} size={54} />
        </div>

        <div
          style={{
            background: "rgba(0,0,0,0.4)",
            padding: "14px",
            borderRadius: "12px",
            textAlign: "center",
            border: "1px solid rgba(56, 189, 248, 0.2)",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase" }}>Tổng Điểm</div>
          <div className="pix-num" style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--neon-gold)", margin: "4px 0" }}>
            {playerInfo.score || 0}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#cbd5e1" }}>Xếp hạng: #{playerRank}</div>
        </div>

        {selectedCharacter && (
          <div
            style={{
              background: "rgba(15, 23, 42, 0.85)",
              border: `1px solid ${selectedCharacter.color || "#38bdf8"}55`,
              borderRadius: "10px",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.9rem" }}>✨</span>
              <span style={{ fontSize: "0.78rem", fontWeight: "800", color: selectedCharacter.color || "#38bdf8" }}>
                {selectedCharacter.perkBadge || "Đặc quyền giai cấp"}
              </span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#cbd5e1", lineHeight: 1.35 }}>
              {selectedCharacter.perkDesc || "Kỹ năng hỗ trợ khảo sát và vượt thử thách."}
            </div>
          </div>
        )}

        <div className="mission-card" style={{ padding: "12px", borderRadius: "10px" }}>
          <div className="mission-label">MỤC TIÊU PHASE {cycle.year}</div>
          <div className="mission-text" style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>
            {cycle.task.objectiveLabel}
          </div>
        </div>

        <button
          onClick={() => setIsDecisionModalOpen(true)}
          className="btn-cyber btn-cyber-blue"
          style={{ width: "100%", padding: "10px", fontSize: "0.85rem", fontWeight: "bold" }}
        >
          📜 Phiếu Quyết Định
        </button>
      </div>

      {/* MODAL OVERLAY: PHIẾU QUYẾT ĐỊNH CHÍNH SÁCH */}
      {isDecisionModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDecisionModalOpen(false);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
              <button
                onClick={() => setIsDecisionModalOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            <CycleDecisionPanel
              phaseId={phaseId}
              playerId={playerId}
              roleId={selectedCharacter.id}
              taskCompleted={isTaskCompleted}
              hasSubmitted={hasSubmitted}
              existingDecision={myDecision}
              onSubmitDecision={async (payload) => {
                await onSubmitDecision?.(payload);
                setIsDecisionModalOpen(false);
                addFloatingText("✓ Đã gửi phiếu quyết định!", "#34d399");
              }}
              decisionEndsAt={gameState.decisionEndsAt}
              isResolved={isResolved}
            />
          </div>
        </div>
      )}

      {/* MODAL OVERLAY: HƯỚNG DẪN NHIỆM VỤ CHI TIẾT */}
      {isHelpModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsHelpModalOpen(false);
          }}
        >
          <div
            className="minigame-panel"
            style={{
              width: "100%",
              maxWidth: "640px",
              maxHeight: "88vh",
              overflowY: "auto",
              position: "relative",
              padding: "24px",
              border: "2px solid var(--neon-gold)",
              borderRadius: "16px",
              background: "rgba(15, 23, 42, 0.98)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.4rem" }}>🎯</span>
                <h3 style={{ margin: 0, color: "var(--neon-gold)", fontSize: "1.2rem", fontWeight: "800" }}>
                  HƯỚNG DẪN TRÒ CHƠI & NHIỆM VỤ CHIẾN LƯỢC (CHƯƠNG 5)
                </h3>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", color: "#e2e8f0", fontSize: "0.86rem", lineHeight: "1.5" }}>
              {/* Mục tiêu */}
              <div style={{ background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.35)", borderRadius: "10px", padding: "12px" }}>
                <div style={{ fontWeight: "800", color: "#facc15", marginBottom: "4px", fontSize: "0.92rem" }}>
                  🚩 MỤC TIÊU CỦA BẠN:
                </div>
                <div>
                  Nhập vai 4 lực lượng rường cột (Công nhân tiên phong, Nông dân chiến lược, Trí thức sáng tạo, Doanh nhân năng động). Trải qua 3 chặng chuyên đề Chương 5 để nắm vững bản chất CCXH-GC, quy luật biến đổi khách quan và củng cố khối đại đoàn kết liên minh giai cấp, tầng lớp trong thời kỳ quá độ lên CNXH.
                </div>
              </div>

              {/* Điều khiển */}
              <div style={{ background: "rgba(30, 41, 59, 0.7)", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: "10px", padding: "12px" }}>
                <div style={{ fontWeight: "800", color: "#38bdf8", marginBottom: "6px", fontSize: "0.92rem" }}>
                  🕹️ CÁCH THỨC ĐIỀU KHIỂN:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px" }}>
                    <strong style={{ color: "#fef08a" }}>💻 Trên Máy Tính (PC):</strong>
                    <div style={{ marginTop: "4px" }}>
                      • Di chuyển: Phím <code style={{ background: "rgba(255,255,255,0.15)", padding: "1px 4px", borderRadius: "3px" }}>W, A, S, D</code> hoặc <code style={{ background: "rgba(255,255,255,0.15)", padding: "1px 4px", borderRadius: "3px" }}>Mũi Tên</code><br />
                      • Tương tác / Khảo sát: Phím <code style={{ background: "rgba(255,255,255,0.15)", padding: "1px 4px", borderRadius: "3px" }}>Space</code> hoặc <code style={{ background: "rgba(255,255,255,0.15)", padding: "1px 4px", borderRadius: "3px" }}>E</code>
                    </div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px" }}>
                    <strong style={{ color: "#fef08a" }}>📱 Trên Điện Thoại:</strong>
                    <div style={{ marginTop: "4px" }}>
                      • Di chuyển: Dùng cụm phím <strong style={{ color: "#38bdf8" }}>D-pad ảo</strong> ở góc trái màn hình<br />
                      • Hành động: Nhấn nút đỏ <strong style={{ color: "#f87171" }}>⚡ KHẢO SÁT</strong> ở góc phải
                    </div>
                  </div>
                </div>
              </div>

              {/* Các hoạt động kiếm điểm */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontWeight: "800", color: "#4ade80", fontSize: "0.92rem" }}>
                  ⭐ 5 CÁCH GHI ĐIỂM TRONG MỖI CHẶNG:
                </div>

                {/* 1. Khảo sát */}
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", background: "rgba(0,0,0,0.35)", padding: "10px", borderRadius: "8px" }}>
                  <div style={{ background: "#f59e0b", color: "#000", fontWeight: "bold", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.75rem" }}>1</div>
                  <div>
                    <strong style={{ color: "#facc15" }}>Khảo sát thực địa trạm nhiệm vụ (<span style={{ color: "#4ade80" }}>+5 điểm</span>):</strong> Di chuyển đến <strong>Cột sáng vàng phát sáng 📍</strong> của giai đoạn, đứng gần và bấm <code style={{ background: "rgba(255,255,255,0.15)", padding: "1px 4px", borderRadius: "3px" }}>Space</code> hoặc <strong style={{ color: "#f87171" }}>⚡ KHẢO SÁT</strong>.
                  </div>
                </div>

                {/* 2. Đối thoại NPC */}
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", background: "rgba(0,0,0,0.35)", padding: "10px", borderRadius: "8px" }}>
                  <div style={{ background: "#c084fc", color: "#000", fontWeight: "bold", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.75rem" }}>2</div>
                  <div>
                    <strong style={{ color: "#e9d5ff" }}>Đối thoại Chuyên gia & Đại biểu (<span style={{ color: "#4ade80" }}>+10 điểm</span>):</strong> Đến gần các chuyên gia lý luận và đại biểu thực tiễn (GS. Nguyễn Văn An, Chuyên viên Thống kê, Ban Dân tộc - Tôn giáo, Đại biểu Công đoàn, TS. Lê Thị Mai Lan...) bấm <code style={{ background: "rgba(255,255,255,0.15)", padding: "1px 4px", borderRadius: "3px" }}>E / Space</code> để giải câu hỏi chuyên đề Chương 5.
                  </div>
                </div>

                {/* 3. Hỗ trợ đại biểu nhân dân */}
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", background: "rgba(0,0,0,0.35)", padding: "10px", borderRadius: "8px" }}>
                  <div style={{ background: "#ec4899", color: "#fff", fontWeight: "bold", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.75rem" }}>3</div>
                  <div>
                    <strong style={{ color: "#f472b6" }}>Hỗ trợ Đại biểu & Quần chúng (<span style={{ color: "#4ade80" }}>+8 điểm</span>):</strong> Gặp gỡ và hỗ trợ các đại biểu, người dân mang biểu tượng <strong style={{ color: "#ec4899" }}>💬 CẦN HỖ TRỢ ❤️</strong> để tiếp thu ý kiến, phản ánh cơ sở.
                  </div>
                </div>

                {/* 4. Nhặt vật phẩm */}
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", background: "rgba(0,0,0,0.35)", padding: "10px", borderRadius: "8px" }}>
                  <div style={{ background: "#38bdf8", color: "#000", fontWeight: "bold", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.75rem" }}>4</div>
                  <div>
                    <strong style={{ color: "#7dd3fc" }}>Thu thập Dữ liệu & Văn Kiện (<span style={{ color: "#4ade80" }}>+2đ đến +10đ</span>):</strong> Chạy qua các tư liệu thực địa trên đường (<strong style={{ color: "#38bdf8" }}>📊 Hồ sơ CCXH</strong>, <strong style={{ color: "#facc15" }}>📜 Biến đổi CCXH</strong>, <strong style={{ color: "#f87171" }}>⭐ Văn kiện Liên minh</strong>, <strong style={{ color: "#fde047" }}>⭐ Hòm văn kiện đặc biệt</strong>).
                  </div>
                </div>

                {/* 5. Phiếu quyết định */}
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", background: "rgba(0,0,0,0.35)", padding: "10px", borderRadius: "8px" }}>
                  <div style={{ background: "#10b981", color: "#000", fontWeight: "bold", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.75rem" }}>5</div>
                  <div>
                    <strong style={{ color: "#6ee7b7" }}>Gửi Phiếu Quyết Định Chiến Lược:</strong> Bấm nút <strong style={{ color: "#fde047" }}>📜 PHIẾU QUYẾT ĐỊNH</strong> ở cột bên phải để chọn phương án tiếp cận CCXH toàn diện hoặc biểu quyết gói phân bổ nguồn lực liên minh (P1, P2, P3).
                  </div>
                </div>
              </div>

              {/* Cảnh báo Bẫy */}
              <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "10px", padding: "12px" }}>
                <div style={{ fontWeight: "800", color: "#f87171", marginBottom: "4px", fontSize: "0.92rem" }}>
                  ❄️ CẢNH BÁO BẪY ĐÓNG BĂNG & ĐỊNH KIẾN XÃ HỘI:
                </div>
                <div style={{ color: "#cbd5e1" }}>
                  Hãy cẩn thận tránh né các <strong style={{ color: "#38bdf8" }}>Bẫy Đóng Băng pha lê ❄️</strong> và bẫy chia rẽ trên đường! Nếu dẫm phải bẫy, bạn sẽ bị <strong style={{ color: "#38bdf8" }}>đóng băng bất động trong 2.5 giây</strong> và bị <strong style={{ color: "#f87171" }}>trừ 3 điểm</strong>.
                </div>
              </div>

              {/* Đặc quyền 4 giai tầng & Bệ tăng tốc */}
              <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "10px", padding: "12px" }}>
                <div style={{ fontWeight: "800", color: "#34d399", marginBottom: "6px", fontSize: "0.92rem" }}>
                  ✨ ĐẶC QUYỀN 4 LỰC LƯỢNG & BỆ TĂNG TỐC ĐỔI MỚI:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.82rem", color: "#cbd5e1" }}>
                  <div>🛡️ <strong style={{ color: "#38bdf8" }}>Giai cấp Công nhân:</strong> Tự động kích hoạt khiên năng lượng miễn nhiễm 1 bẫy đóng băng mỗi giai đoạn!</div>
                  <div>🌾 <strong style={{ color: "#34d399" }}>Giai cấp Nông dân:</strong> Tinh thần cần cù bồi đắp, được thưởng thêm +1 điểm cho mỗi tư liệu/văn kiện nhặt được.</div>
                  <div>💡 <strong style={{ color: "#c084fc" }}>Tầng lớp Trí thức:</strong> Tư duy lý luận sắc bén, tự động gạch bỏ 1 phương án sai trong đối thoại NPC!</div>
                  <div>⚡ <strong style={{ color: "#fde047" }}>Đội ngũ Doanh nhân:</strong> Bấm phím <code style={{ background: "rgba(255,255,255,0.15)", padding: "1px 4px", borderRadius: "3px" }}>Q / Shift</code> (hoặc nút Kỹ năng) để bứt phá tốc độ (+45% trong 4s, hồi chiêu 9s)!</div>
                  <div>🚀 <strong style={{ color: "#22d3ee" }}>Bệ Tăng Tốc Neon:</strong> Di chuyển đè lên 3 bệ phóng ánh sáng xanh trên các đại lộ để lướt siêu tốc!</div>
                </div>
              </div>

              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="btn-cyber btn-cyber-blue"
                style={{ width: "100%", marginTop: "6px", padding: "12px", fontWeight: "bold", fontSize: "0.95rem" }}
              >
                ĐÃ HIỂU RÕ - BẮT ĐẦU NHIỆM VỤ NGAY 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORICAL NPC DIALOGUE & DILEMMA MODAL */}
      {activeNpcDialogue && (
        <HistoricalDialogueModal
          npc={activeNpcDialogue}
          playerRoleId={selectedCharacter?.id}
          onAnswer={handleAnswerNpcDialogue}
          onClose={() => setActiveNpcDialogue(null)}
        />
      )}
    </div>
  );
};

export default RpgGamePlay;
