import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { get, onValue, ref, runTransaction, update } from "firebase/database";
import { db } from "./firebaseConfig";
import { PHASE_CONFIGS } from "./situations";
import { applyEntityRewardClaim, applyFinalGateCompletion, applyPlayerDelta } from "./gameStateUtils";
import { getCharacterOption } from "./characterOptions";
import { buildRpgSnapshot, isRpgMessage, normalizePlayerMove, resolveCanonicalHazard } from "./rpgBridge";
import { createPositionWriter, subscribeToPlayerPositions } from "./playerPositionSync";
import { getHazardQuestion } from "./hazardQuestions";
import {
  IconPhone,
  IconDesktop,
  IconLeaf,
  IconWarning,
  IconFlame,
  IconBook,
  IconBolt,
  IconSkull,
  IconTrophy,
  IconCrown,
  IconTimer,
  IconBulb,
  IconUser,
  IconCheck,
  IconPin,
  IconArrowRight,
  IconRefresh
} from "./icons";

// Helper lấy Icon Phase tương ứng
const getPhaseIcon = (status, className = "w-5 h-5") => {
  if (status === "phase_1") return <IconLeaf className={`${className} text-emerald-500`} />;
  if (status === "phase_2") return <IconWarning className={`${className} text-amber-500`} />;
  if (status === "phase_3") return <IconFlame className={`${className} text-red-500`} />;
  return null;
};

const EMPTY_WORLD = { books: {}, traps: {}, npcs: {}, gates: {} };
const POSITION_UPDATE_INTERVAL_MS = 125;

const RpgGamePlay = ({ playerId, playerName, playerInfo, players, dbConnected, gameState }) => {
  const iframeRef = useRef(null);
  const iframeReadyRef = useRef(false);
  const lastPlayerMoveAtRef = useRef(0);
  const positionsRef = useRef({});
  const selectedCharacter = getCharacterOption(playerInfo.character);
  const [world, setWorld] = useState(EMPTY_WORLD);

  const positionWriter = useMemo(() => createPositionWriter({
    writeModern: (move) => update(ref(db, `positions/${playerId}`), {
      x: move.x,
      y: move.y,
      direction: move.direction,
    }),
    writeLegacy: (move) => update(ref(db, `players/${playerId}`), {
      position: { x: move.x, y: move.y },
      direction: move.direction,
    }),
  }), [playerId]);

  // Trạng thái dừng khi trả lời câu hỏi tình huống
  const [isFrozen, setIsFrozen] = useState(false);
  const [activeHazardQuiz, setActiveHazardQuiz] = useState(null);

  // Floating text
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [nowMs, setNowMs] = useState(Date.now());

  // Tutorial
  const [showTutorial, setShowTutorial] = useState(gameState.status === "phase_1");


  // Lấy config phase hiện tại
  const phaseConfig = PHASE_CONFIGS[gameState.status] || PHASE_CONFIGS.phase_1;
  const activeMission = gameState.mission || phaseConfig.mission;
  const activeMeaning = gameState.learningMeaning || phaseConfig.learningMeaning;
  const progressGoals = gameState.progressGoals || phaseConfig.progressGoals || [];
  const phaseProgress = playerInfo.progress?.[gameState.status] || {};
  const elapsedSeconds = gameState.phaseStartedAt
    ? Math.max(0, Math.floor((nowMs - gameState.phaseStartedAt) / 1000))
    : 0;

  // Phase 2 countdown (60 giây)
  const phaseCountdown = gameState.phaseEndsAt
    ? Math.max(0, Math.ceil((gameState.phaseEndsAt - nowMs) / 1000))
    : null;

  const progressText = progressGoals
    .map((goal) => {
      const current = goal.type === "survive_seconds"
        ? Math.min(goal.target, elapsedSeconds)
        : Math.min(goal.target, Number(phaseProgress[goal.type]) || 0);
      return `${goal.label}: ${current}/${goal.target}`;
    })
    .join(" | ");

  const incrementProgress = useCallback(
    (type) =>
      runTransaction(
        ref(db, `players/${playerId}/progress/${gameState.status}/${type}`),
        (current) => (Number(current) || 0) + 1,
        { applyLocally: false }
      ),
    [gameState.status, playerId]
  );

  const applyScoreIntegrityDelta = useCallback(
    (delta) =>
      runTransaction(
        ref(db, `players/${playerId}`),
        (player) => applyPlayerDelta(player, delta),
        { applyLocally: false }
      ),
    [playerId]
  );

  const addFloatingText = (text, color) => {
    const id = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev, { id, text, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
    }, 1500);
  };

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const collections = ["books", "traps", "npcs", "gates"];
    const unsubscribes = collections.map((collection) => onValue(ref(db, collection), (snapshot) => {
      setWorld((currentWorld) => ({
        ...currentWorld,
        [collection]: snapshot.val() || {},
      }));
    }));
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, []);

  useEffect(() => subscribeToPlayerPositions(db, ({ playerId: incomingPlayerId, position }) => {
    if (position) positionsRef.current[incomingPlayerId] = position;
    else delete positionsRef.current[incomingPlayerId];

    if (iframeReadyRef.current) {
      iframeRef.current?.contentWindow?.postMessage({
        type: "PLAYER_POSITION",
        playerId: incomingPlayerId,
        position,
      }, "*");
    }
  }), []);

  const postRpgSnapshot = useCallback((force = false) => {
    const iframeWindow = iframeRef.current?.contentWindow;
    if (!iframeWindow || (!iframeReadyRef.current && !force)) return;
    iframeWindow.postMessage(
      buildRpgSnapshot(gameState, { ...world, players }, positionsRef.current),
      "*",
    );
  }, [gameState, players, world]);

  const handleIframeLoad = useCallback(() => {
    iframeReadyRef.current = true;
    postRpgSnapshot(true);
    // Tự động focus để người chơi có thể điều khiển được ngay khi tải xong
    setTimeout(() => {
      iframeRef.current?.focus();
    }, 100);
  }, [postRpgSnapshot]);

  useEffect(() => {
    postRpgSnapshot();
  }, [postRpgSnapshot]);

  // Xử lý chọn đáp án câu hỏi tình huống bẫy/rủi ro
  const handleSelectQuizAnswer = async (index) => {
    if (!activeHazardQuiz || activeHazardQuiz.isAnswered) return;
    const { hazard, question } = activeHazardQuiz;
    const isCorrect = index === question.correctIndex;

    const deltaScore = isCorrect ? (question.rewardScore || 40) : (question.penaltyScore || -30);
    const deltaIntegrity = isCorrect ? (question.rewardIntegrity || 10) : (question.penaltyIntegrity || -15);

    await applyScoreIntegrityDelta({ score: deltaScore, integrity: deltaIntegrity });
    await incrementProgress(isCorrect ? `quiz_correct_${hazard.type || "hazard"}` : `quiz_wrong_${hazard.type || "hazard"}`);
    await incrementProgress(`hit_${hazard.type || "hazard"}`);

    if (isCorrect) {
      addFloatingText(`+${deltaScore}đ | +${deltaIntegrity} Liêm chính (Chính xác!)`, "#4ade80");
    } else {
      addFloatingText(`${deltaScore}đ | ${deltaIntegrity} Liêm chính (Xử lý sai!)`, "#ef4444");
    }

    setActiveHazardQuiz((prev) => ({
      ...prev,
      selectedAnswer: index,
      isAnswered: true,
      isCorrect,
    }));
  };

  // Đóng modal câu hỏi và tiếp tục chơi
  const handleCloseQuiz = () => {
    setActiveHazardQuiz(null);
    setIsFrozen(false);
    iframeRef.current?.contentWindow?.postMessage({ type: "UNFREEZE" }, "*");
  };

  // Lắng nghe phím tắt cho câu hỏi tình huống
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeHazardQuiz) return;

      if (!activeHazardQuiz.isAnswered) {
        if (e.key === "1" || e.code === "Digit1" || e.code === "KeyA") {
          e.preventDefault();
          handleSelectQuizAnswer(0);
        } else if (e.key === "2" || e.code === "Digit2" || e.code === "KeyB") {
          e.preventDefault();
          handleSelectQuizAnswer(1);
        } else if (e.key === "3" || e.code === "Digit3" || e.code === "KeyC") {
          e.preventDefault();
          handleSelectQuizAnswer(2);
        } else if (e.key === "4" || e.code === "Digit4" || e.code === "KeyD") {
          if (activeHazardQuiz.question.options.length >= 4) {
            e.preventDefault();
            handleSelectQuizAnswer(3);
          }
        }
      } else {
        if (e.code === "Space" || e.code === "Enter" || e.code === "KeyE") {
          e.preventDefault();
          handleCloseQuiz();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeHazardQuiz]);

  // 1. Lắng nghe postMessage từ iframe RPG
  useEffect(() => {
    const recordEntityResolution = (collection, entityId, field, resolvedAt) =>
      runTransaction(
        ref(db, `${collection}/${entityId}`),
        (entity) => {
          if (!entity) return undefined;
          const resolutionMap = entity[field] && typeof entity[field] === "object"
            ? entity[field]
            : {};
          if (Object.prototype.hasOwnProperty.call(resolutionMap, playerId)) return entity;
          return {
            ...entity,
            [field]: {
              ...resolutionMap,
              [playerId]: resolvedAt,
            },
          };
        },
        { applyLocally: false }
      );

    const claimRewardEntity = async (collection, entityId, recoveryTask = false) => {
      if (!entityId) return null;
      const entitySnapshot = await get(ref(db, `${collection}/${entityId}`));
      const entity = entitySnapshot.val();
      if (!entity || typeof entity.type !== "string") return null;

      const claimedAt = Date.now();
      const result = await runTransaction(
        ref(db, `players/${playerId}`),
        (player) => applyEntityRewardClaim(player, {
          phaseKey: gameState.status,
          collection,
          entityId,
          entity,
          claimedAt,
          recoveryTask,
        }) || undefined,
        { applyLocally: false }
      );

      const recordedAt = result.snapshot.val()?.rpgClaims?.[gameState.status]?.[collection]?.[entityId];
      if (Number.isFinite(recordedAt)) {
        await recordEntityResolution(collection, entityId, "claimedBy", recordedAt);
      }
      return result.committed ? entity : null;
    };

    const completeFinalGate = async (gateId) => {
      let resolvedGateId = gateId;
      let gateSnapshot = resolvedGateId ? await get(ref(db, `gates/${resolvedGateId}`)) : null;
      if (!gateSnapshot || !gateSnapshot.exists()) {
        const allGatesSnap = await get(ref(db, "gates"));
        if (allGatesSnap.exists()) {
          const gatesObj = allGatesSnap.val();
          const firstKey = Object.keys(gatesObj)[0];
          resolvedGateId = firstKey;
          gateSnapshot = { val: () => gatesObj[firstKey], exists: () => true };
        }
      }

      const completedAt = Date.now();
      const result = await runTransaction(
        ref(db, `players/${playerId}`),
        (player) => applyFinalGateCompletion(player, {
          phaseKey: gameState.status,
          gateId: resolvedGateId || "public_center_1",
          completedAt,
        }) || undefined,
        { applyLocally: false }
      );
      if (resolvedGateId) {
        const recordedAt = result.snapshot.val()?.rpgClaims?.phase_3?.gates?.[resolvedGateId];
        if (Number.isFinite(recordedAt)) {
          await recordEntityResolution("gates", resolvedGateId, "completedBy", recordedAt);
        }
      }
      return result.committed ? (gateSnapshot?.val() || { type: "public_center" }) : null;
    };

    const handleMessage = async (e) => {
      if (e.source !== iframeRef.current?.contentWindow || !isRpgMessage(e.data)) return;

      if (e.data.type === "RPG_READY") {
        iframeReadyRef.current = true;
        postRpgSnapshot(true);
        return;
      }

      if (e.data.type === "PLAYER_MOVE") {
        const move = normalizePlayerMove(e.data);
        const now = Date.now();
        if (!move || !["up", "down", "left", "right"].includes(move.direction) || now - lastPlayerMoveAtRef.current < POSITION_UPDATE_INTERVAL_MS) return;
        lastPlayerMoveAtRef.current = now;
        try {
          await positionWriter(move);
        } catch (error) {
          console.error("Không thể đồng bộ vị trí người chơi:", error);
        }
        return;
      }

      // A. Nhặt vật phẩm tích cực -> điểm công vụ / uy tín theo phase
      if (e.data.type === "NHAT_SACH") {
        const claimedBook = await claimRewardEntity("books", e.data.bookId);
        if (!claimedBook) return;

        const bonusScore = Number.isFinite(claimedBook.score) ? claimedBook.score : 0;
        addFloatingText(claimedBook.message || `+${bonusScore} Công vụ`, claimedBook.color || "#2e7d32");
      }

      // B. Va chạm rủi ro công vụ -> Mở câu hỏi tình huống: Đúng cộng điểm, Sai trừ điểm
      if (e.data.type === "DINH_BAY") {
        const hazardId = e.data.hazard?.id;
        const hazardSnapshot = hazardId ? await get(ref(db, `traps/${hazardId}`)) : null;
        const hazard = (hazardSnapshot && hazardSnapshot.exists())
          ? resolveCanonicalHazard(e.data.hazard, hazardSnapshot.val())
          : (e.data.hazard && typeof e.data.hazard === "object" ? e.data.hazard : null);

        if (!hazard) return;

        // Đánh dấu bẫy/rủi ro đã xử lý để biến mất khỏi bản đồ
        if (hazardId && hazardSnapshot && hazardSnapshot.exists()) {
          await recordEntityResolution("traps", hazardId, "claimedBy", Date.now());
        }

        // Lấy câu hỏi tương ứng với loại bẫy / rủi ro
        const question = getHazardQuestion(hazard.type, Date.now());

        setIsFrozen(true);
        iframeRef.current?.contentWindow?.postMessage({ type: "FREEZE" }, "*");

        setActiveHazardQuiz({
          hazard,
          question,
          selectedAnswer: null,
          isAnswered: false,
          isCorrect: null,
        });
      }

      // C. Event NPC cũ được map thành hỗ trợ/phản ánh người dân.
      if (e.data.type === "FOUND_LOYAL_CUSTOMER") {
        const reward = await claimRewardEntity("npcs", e.data.npcId, true);
        if (!reward) return;
        await runTransaction(
          ref(db, `players/${playerId}/progress/${gameState.status}/citizen_support_at`),
          (current) => current || Date.now(),
          { applyLocally: false }
        );
        addFloatingText(reward.message || "Đã hỗ trợ người dân!", reward.color || "#00897b");
      }

      // D. Event cổng được map thành Trung tâm Công khai & Giải trình.
      if (e.data.type === "ESCAPED_GATE") {
        const gate = await completeFinalGate(e.data.gateId);
        if (!gate) {
          addFloatingText("Cần đủ: 1 Minh bạch, 1 Trách nhiệm, 1 Phục vụ ND!", "#f59e0b");
          return;
        }
        addFloatingText("⭐ ĐÃ VÀO TRUNG TÂM CÔNG KHAI! (+100 ĐIỂM) ⭐", "#22d3ee");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [
    gameState.status,
    playerId,
    positionWriter,
    postRpgSnapshot,
    selectedCharacter.id,
    selectedCharacter.color,
  ]);

  // 2. Unfreeze & đóng modal quiz khi chuyển phase
  useEffect(() => {
    setActiveHazardQuiz(null);
    setIsFrozen(false);
    iframeRef.current?.contentWindow?.postMessage({ type: "UNFREEZE" }, "*");
  }, [gameState.status]);

  // Tự động focus lại iframe khi hết đóng băng để người chơi có thể di chuyển bằng bàn phím ngay
  useEffect(() => {
    if (!isFrozen && iframeRef.current) {
      setTimeout(() => {
        iframeRef.current.focus();
      }, 50);
    }
  }, [isFrozen]);

  // 3. Hiện thông báo khi uy tín thay đổi mạnh.
  const lastIntegrityRef = useRef(playerInfo.integrity);
  useEffect(() => {
    const currentIntegrity = Number.isFinite(playerInfo.integrity) ? playerInfo.integrity : 100;
    if (currentIntegrity < lastIntegrityRef.current && !isFrozen) {
      addFloatingText(`-${lastIntegrityRef.current - currentIntegrity} Uy tín`, "#ff6b35");
    }
    lastIntegrityRef.current = currentIntegrity;
  }, [playerInfo.integrity, isFrozen]);

  // 4. D-pad & Action Handlers
  const handleDpadPress = (dir, e) => {
    if (e && e.cancelable && e.type === "touchstart") e.preventDefault();
    if (isFrozen) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "DPAD_MOVE", dir }, "*");
  };
  const handleDpadRelease = (e) => {
    if (e && e.cancelable && e.type === "touchend") e.preventDefault();
    iframeRef.current?.contentWindow?.postMessage({ type: "DPAD_MOVE", dir: "stop" }, "*");
  };
  const handleActionPress = (e) => {
    if (e && e.cancelable && e.type === "touchstart") e.preventDefault();
    if (isFrozen) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "ACTION_INTERACT" }, "*");
  };

  // Lấy danh sách xếp hạng
  const sortedPlayers = Object.entries(players || {})
    .filter(([id, p]) => p && p.character)
    .map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", gap: "20px", width: "100%", maxWidth: "1920px", margin: "0 auto" }}>
      
      {/* CỘT TRÁI: Bảng xếp hạng (Chỉ hiện trên PC/Tablet) */}
      <div className="hidden lg:flex" style={{ width: "260px", flexDirection: "column", gap: "16px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "16px", padding: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <h3 style={{ margin: 0, color: "#facc15", fontSize: "1rem", fontFamily: "var(--font-mono)", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>BẢNG XẾP HẠNG</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {sortedPlayers.slice(0, 10).map((p, idx) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.3)", padding: "8px 12px", borderRadius: "8px", border: p.id === playerId ? "1px solid rgba(56, 189, 248, 0.5)" : "1px solid transparent" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: idx === 0 ? "#facc15" : idx === 1 ? "#94a3b8" : idx === 2 ? "#b45309" : "#64748b", fontWeight: "bold", fontSize: "1.1rem", fontFamily: "var(--font-mono)" }}>#{idx + 1}</span>
                <span style={{ fontSize: "0.85rem", color: p.id === playerId ? "#38bdf8" : "#f8fafc", maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: p.id === playerId ? "bold" : "normal" }}>{p.name || p.id}</span>
              </div>
              <span className="pix-num" style={{ color: "var(--neon-blue)", fontSize: "1rem" }}>{p.score || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CỘT GIỮA: Màn hình game */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "1 1 auto", minWidth: "320px", maxWidth: "1400px" }}>

      {/* Phase indicator + HUD - (Chỉ hiện trên mobile, PC sẽ ẩn để xem ở 2 cột) */}
      <div className="flex lg:hidden" style={{ justifyContent: "space-between", alignItems: "center", width: "100%", background: "#fff6d7", border: "3px solid #000", borderRadius: "0px", padding: "12px 20px", marginBottom: "12px", boxShadow: "5px 5px 0 rgba(0,0,0,0.5)", color: "#2c1a0e" }}>
        {/* Phase badge */}
        <div style={{ textAlign: "center", minWidth: "90px" }}>
          <div style={{ fontSize: "7px", color: "var(--neon-gold)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>Giai đoạn</div>
          <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--neon-red)", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginTop: "2px" }}>
            {getPhaseIcon(gameState.status, "w-4 h-4")} {phaseConfig.name.split(" ").slice(0, 2).join(" ")}
          </div>
        </div>
        <div style={{ width: "2px", background: "#000", margin: "0 12px", height: "30px" }} />

        {/* Uy tín */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: "7px", color: "#8b8680", fontWeight: "800", letterSpacing: "1px" }}>UY TÍN</div>
          <div style={{ fontSize: "0.95rem", fontWeight: "800", color: (playerInfo.integrity ?? 100) >= 60 ? "var(--neon-green)" : "var(--neon-red)", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
            <span className="pix-num">{playerInfo.integrity ?? 100}</span>
          </div>
        </div>
        <div style={{ width: "2px", background: "#000", margin: "0 12px", height: "30px" }} />

        {/* Điểm */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: "7px", color: "#8b8680", fontWeight: "800", letterSpacing: "1px" }}>ĐIỂM CÔNG VỤ</div>
          <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--neon-blue)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
            <span className="pix-num">{playerInfo.score || 0}</span>
          </div>
        </div>
        <div style={{ width: "2px", background: "#000", margin: "0 12px", height: "30px" }} />

        {/* Niềm tin */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: "7px", color: "#8b8680", fontWeight: "800", letterSpacing: "1px" }}>NIỀM TIN</div>
          <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--neon-gold)", marginTop: "2px" }}>
            {Number.isFinite(gameState.publicTrust) ? gameState.publicTrust : 70}%
          </div>
        </div>
      </div>

      {/* Thông báo áp lực */}
      {phaseConfig.pressureLabel && (
        <div style={{ width: "100%", background: "rgba(197,39,45,0.08)", border: "1px solid rgba(197,39,45,0.15)", borderRadius: "10px", padding: "8px 12px", marginBottom: "10px", fontSize: "0.75rem", color: "#ff6b35", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <IconWarning className="w-4 h-4 text-red-500 animate-pulse" />
          <span>{phaseConfig.pressureLabel}: quyền lực đi kèm trách nhiệm, minh bạch và sức ép lựa chọn.</span>
        </div>
      )}





      {/* Manh mối từ Host */}
      {gameState.phase2Hint && gameState.status === "phase_2" && (
        <div style={{ width: "100%", background: "rgba(0,137,123,0.06)", border: "1px solid rgba(0,137,123,0.15)", borderRadius: "10px", padding: "8px 14px", marginBottom: "10px", fontSize: "0.82rem", color: "#00897b", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <IconBulb className="w-4 h-4 text-teal-500" />
          <span>💡 Manh mối: <b>{gameState.phase2Hint}</b></span>
        </div>
      )}

      {/* Game console */}
      <div className="game-console-wrapper" style={{ width: "100%", background: "var(--panel-bg)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "16px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 45px rgba(0,0,0,0.6)" }}>
        {/* LED & Phase name */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 10px 10px", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: dbConnected ? "var(--neon-green)" : "var(--neon-red)", boxShadow: dbConnected ? "0 0 10px var(--neon-green)" : "0 0 10px var(--neon-red)" }} />
            <span style={{ fontSize: "0.7rem", color: "#8b8680", fontWeight: "bold" }}>MÁY CHỦ REALTIME</span>
          </div>
          <span style={{ fontSize: "9px", color: "var(--neon-gold)", letterSpacing: "1.5px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
            {getPhaseIcon(gameState.status, "w-3.5 h-3.5")} {phaseConfig.name.toUpperCase()}
          </span>
        </div>

        {/* Iframe Phaser RPG */}
        <div style={{ position: "relative", width: "100%", height: "70vh", minHeight: "450px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", overflow: "hidden", background: "#000", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column" }}>
          <iframe
            ref={iframeRef}
            src={`/rpg/index.html?role=player&id=${playerId}&name=${encodeURIComponent(playerName)}&character=${encodeURIComponent(selectedCharacter.id)}&color=${encodeURIComponent(selectedCharacter.color)}&phase=${encodeURIComponent(gameState.status || "phase_1")}`}
            onLoad={handleIframeLoad}
            style={{ width: "100%", flex: 1, border: "none", display: "block" }}
            title="Phaser RPG"
          />

          {/* Mission HUD Overlay inside Game Canvas (Compact, Top-Left) */}
          {activeMission && (
            <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 10, pointerEvents: "none", maxWidth: "calc(100% - 24px)" }}>
              <div style={{ background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(6px)", border: "1px solid rgba(56, 189, 248, 0.4)", borderRadius: "8px", padding: "8px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)", pointerEvents: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ fontSize: "0.65rem", color: "#38bdf8", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase" }}>MỤC TIÊU PHASE</div>
                <div style={{ fontSize: "0.85rem", color: "#f8fafc", fontWeight: "700", lineHeight: "1.3", textShadow: "1px 1px 0 rgba(0,0,0,0.8)" }}>{activeMission}</div>
                {progressText && <div style={{ fontSize: "0.95rem", color: "#facc15", fontFamily: "var(--font-mono)", fontWeight: "bold", marginTop: "2px" }}>{progressText}</div>}
              </div>
            </div>
          )}

          {/* Countdown HUD Overlay inside Game Canvas (Compact, Top-Right) */}
          {phaseCountdown !== null && gameState.status === "phase_2" && (
            <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 10, pointerEvents: "none" }}>
              <div style={{ background: phaseCountdown <= 10 ? "rgba(185, 28, 28, 0.9)" : "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(6px)", border: `1px solid ${phaseCountdown <= 10 ? "#fca5a5" : "rgba(56, 189, 248, 0.4)"}`, borderRadius: "8px", padding: "6px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end", pointerEvents: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <IconTimer className={`w-4 h-4 ${phaseCountdown <= 10 ? "text-white animate-pulse" : "text-teal-400"}`} />
                  <span style={{ fontSize: "1.2rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: phaseCountdown <= 10 ? "#fff" : "#38bdf8", textShadow: "1px 1px 0 rgba(0,0,0,0.8)" }}>
                    {phaseCountdown > 0 ? `${Math.floor(phaseCountdown / 60)}:${String(phaseCountdown % 60).padStart(2, "0")}` : "HẾT GIỜ!"}
                  </span>
                </div>
                <div style={{ width: "100%", height: "4px", background: "rgba(0,0,0,0.4)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (phaseCountdown / Math.ceil((phaseConfig.durationMs || 300000) / 1000)) * 100)}%`, background: phaseCountdown <= 10 ? "#fff" : "#10b981", transition: "width 1s linear" }} />
                </div>
              </div>
            </div>
          )}

          {/* Modal Câu hỏi Tình huống Công vụ khi va chạm Bẫy/Rủi ro */}
          {activeHazardQuiz && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(10, 15, 29, 0.94)",
                backdropFilter: "blur(8px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 30,
                pointerEvents: "all",
                padding: "16px",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "580px",
                  background: "#161b26",
                  border: `3px solid ${activeHazardQuiz.isAnswered ? (activeHazardQuiz.isCorrect ? "#10b981" : "#ef4444") : (activeHazardQuiz.question.metadata?.borderColor || "#f59e0b")}`,
                  borderRadius: "12px",
                  padding: "18px 22px",
                  boxShadow: "0 12px 35px rgba(0,0,0,0.8), 0 0 20px rgba(245, 158, 11, 0.2)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  animation: "fadeIn 0.25s ease-out",
                }}
              >
                {/* Header: Hazard Tag & Theme */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.6rem" }}>{activeHazardQuiz.question.metadata?.icon || "⚠️"}</span>
                    <div>
                      <div style={{ fontSize: "0.95rem", fontWeight: "800", color: activeHazardQuiz.question.metadata?.badgeColor || "#f59e0b", fontFamily: "var(--font-heading)", letterSpacing: "0.5px" }}>
                        {activeHazardQuiz.question.metadata?.label || "RỦI RO CÔNG VỤ"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        Chủ đề: <span style={{ color: "#fef08a" }}>{activeHazardQuiz.question.metadata?.theme || "Chuẩn mực liêm chính"}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", padding: "3px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.08)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
                      {activeHazardQuiz.isAnswered ? (activeHazardQuiz.isCorrect ? "✅ ĐÚNG" : "❌ SAI") : "⚡ THỬ THÁCH"}
                    </span>
                  </div>
                </div>

                {/* Question Box */}
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "8px",
                    padding: "12px 14px",
                  }}
                >
                  <p style={{ color: "#ffffff", fontSize: "0.98rem", fontWeight: "600", lineHeight: "1.5", margin: 0 }}>
                    {activeHazardQuiz.question.question}
                  </p>
                </div>

                {/* Options List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  {activeHazardQuiz.question.options.map((opt, idx) => {
                    const isSelected = activeHazardQuiz.selectedAnswer === idx;
                    const isCorrectOpt = activeHazardQuiz.question.correctIndex === idx;
                    const answered = activeHazardQuiz.isAnswered;

                    let btnBg = "rgba(30, 41, 59, 0.85)";
                    let btnBorder = "1px solid rgba(255, 255, 255, 0.15)";
                    let badgeBg = "#334155";
                    let badgeColor = "#f8fafc";

                    if (answered) {
                      if (isCorrectOpt) {
                        btnBg = "linear-gradient(135deg, rgba(6, 78, 59, 0.95), rgba(4, 120, 87, 0.95))";
                        btnBorder = "2px solid #34d399";
                        badgeBg = "#059669";
                        badgeColor = "#ffffff";
                      } else if (isSelected && !activeHazardQuiz.isCorrect) {
                        btnBg = "linear-gradient(135deg, rgba(127, 29, 29, 0.95), rgba(153, 27, 27, 0.95))";
                        btnBorder = "2px solid #f87171";
                        badgeBg = "#dc2626";
                        badgeColor = "#ffffff";
                      } else {
                        btnBg = "rgba(15, 23, 42, 0.5)";
                        btnBorder = "1px solid rgba(255, 255, 255, 0.05)";
                      }
                    }

                    return (
                      <button
                        key={opt.key || idx}
                        disabled={answered}
                        onClick={() => handleSelectQuizAnswer(idx)}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          background: btnBg,
                          border: btnBorder,
                          color: "#f8fafc",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                          lineHeight: "1.4",
                          textAlign: "left",
                          cursor: answered ? "default" : "pointer",
                          transition: "all 0.15s ease",
                          outline: "none",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "24px",
                            height: "24px",
                            borderRadius: "4px",
                            background: badgeBg,
                            color: badgeColor,
                            fontWeight: "800",
                            fontSize: "0.78rem",
                            flexShrink: 0,
                          }}
                        >
                          {answered && isCorrectOpt ? "✓" : (answered && isSelected && !activeHazardQuiz.isCorrect ? "✕" : (opt.key || idx + 1))}
                        </span>
                        <span style={{ flex: 1 }}>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback & Continue Area */}
                {activeHazardQuiz.isAnswered ? (
                  <div
                    style={{
                      background: activeHazardQuiz.isCorrect ? "rgba(6, 78, 59, 0.35)" : "rgba(127, 29, 29, 0.35)",
                      border: `1px solid ${activeHazardQuiz.isCorrect ? "rgba(52, 211, 153, 0.5)" : "rgba(248, 113, 113, 0.5)"}`,
                      borderRadius: "8px",
                      padding: "12px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: activeHazardQuiz.isCorrect ? "#4ade80" : "#f87171", fontWeight: "800", fontSize: "0.95rem" }}>
                        {activeHazardQuiz.isCorrect ? "🎉 CHÍNH XÁC!" : "❌ CHƯA CHÍNH XÁC!"}
                      </span>
                      <span style={{ fontWeight: "800", fontSize: "0.9rem", color: activeHazardQuiz.isCorrect ? "#86efac" : "#fca5a5" }}>
                        {activeHazardQuiz.isCorrect
                          ? `+${activeHazardQuiz.question.rewardScore || 40}đ | +${activeHazardQuiz.question.rewardIntegrity || 10} Liêm chính`
                          : `${activeHazardQuiz.question.penaltyScore || -30}đ | ${activeHazardQuiz.question.penaltyIntegrity || -15} Liêm chính`}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: "0.82rem", color: "#e2e8f0", lineHeight: "1.45" }}>
                      💡 {activeHazardQuiz.question.explanation}
                    </p>

                    <button
                      onClick={handleCloseQuiz}
                      style={{
                        marginTop: "6px",
                        padding: "11px 20px",
                        borderRadius: "8px",
                        background: activeHazardQuiz.isCorrect
                          ? "linear-gradient(135deg, #10b981, #059669)"
                          : "linear-gradient(135deg, #3b82f6, #2563eb)",
                        border: "2px solid rgba(255,255,255,0.4)",
                        color: "#ffffff",
                        fontWeight: "800",
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <span>⚡ TIẾP TỤC NHIỆM VỤ</span>
                      <span style={{ fontSize: "0.75rem", opacity: 0.85 }}>[SPACE / ENTER]</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", fontSize: "0.78rem", color: "#94a3b8" }}>
                    Nhấn số [1, 2, 3] hoặc bấm trực tiếp vào đáp án để chọn
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Floating text */}
          {floatingTexts.map((ft) => (
            <div
              key={ft.id}
              style={{
                position: "absolute", top: "40%", left: "50%", transform: "translateX(-50%)",
                fontSize: "1.4rem", fontWeight: "800", color: ft.color,
                textShadow: "0 2px 8px rgba(0,0,0,0.8)", animation: "floatUp 1.5s ease-out forwards",
                pointerEvents: "none", zIndex: 10,
              }}
            >
              {ft.text}
            </div>
          ))}
        </div>
      </div>

      <div style={{ color: "#8b8680", fontSize: "0.75rem", marginTop: "10px", textAlign: "center", display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
        <span>Điều khiển: WASD / Mũi tên</span>
        <span>•</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}><IconBook className="w-3.5 h-3.5 text-amber-500" /> Đến các bàn làm việc / trạm để xử lý</span>
        <span>•</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}><IconBolt className="w-3.5 h-3.5 text-red-500" /> Bấm ⚡ / [E] để đóng dấu & nộp</span>
      </div>

      {/* D-pad & Action Button Container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "28px",
          marginTop: "12px",
          width: "100%",
          maxWidth: "440px",
          opacity: isFrozen ? 0.35 : 1,
          filter: isFrozen ? "grayscale(0.85)" : "none",
          pointerEvents: isFrozen ? "none" : "auto",
          transition: "opacity 0.2s, filter 0.2s",
        }}
      >
        {/* D-pad */}
        <div className="dpad-container" style={{ userSelect: "none", margin: 0 }}>
          <button className="dpad-btn" disabled={isFrozen} onMouseDown={(e) => handleDpadPress("up", e)} onMouseUp={(e) => handleDpadRelease(e)} onTouchStart={(e) => handleDpadPress("up", e)} onTouchEnd={(e) => handleDpadRelease(e)}>▲</button>
          <div style={{ display: "flex", gap: "25px" }}>
            <button className="dpad-btn" disabled={isFrozen} onMouseDown={(e) => handleDpadPress("left", e)} onMouseUp={(e) => handleDpadRelease(e)} onTouchStart={(e) => handleDpadPress("left", e)} onTouchEnd={(e) => handleDpadRelease(e)}>◀</button>
            <button className="dpad-btn" disabled={isFrozen} onMouseDown={(e) => handleDpadPress("right", e)} onMouseUp={(e) => handleDpadRelease(e)} onTouchStart={(e) => handleDpadPress("right", e)} onTouchEnd={(e) => handleDpadRelease(e)}>▶</button>
          </div>
          <button className="dpad-btn" disabled={isFrozen} onMouseDown={(e) => handleDpadPress("down", e)} onMouseUp={(e) => handleDpadRelease(e)} onTouchStart={(e) => handleDpadPress("down", e)} onTouchEnd={(e) => handleDpadRelease(e)}>▼</button>
        </div>

        {/* Action Button: Xử lý / Đóng dấu */}
        <button
          className="action-stamp-btn"
          disabled={isFrozen}
          onClick={(e) => handleActionPress(e)}
          onTouchStart={(e) => handleActionPress(e)}
          style={{
            width: "84px",
            height: "84px",
            borderRadius: "50%",
            background: isFrozen
              ? "radial-gradient(circle at 30% 30%, #64748b, #334155)"
              : "radial-gradient(circle at 30% 30%, #ef4444, #991b1b)",
            border: isFrozen ? "4px solid #64748b" : "4px solid #facc15",
            boxShadow: isFrozen ? "none" : "0 6px 18px rgba(239, 68, 68, 0.45), 0 0 0 2px #000",
            color: "#ffffff",
            fontFamily: "var(--font-heading)",
            fontSize: "0.78rem",
            fontWeight: "800",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: isFrozen ? "not-allowed" : "pointer",
            touchAction: "manipulation",
            userSelect: "none",
            gap: "2px",
          }}
        >
          <span style={{ fontSize: "1.3rem" }}>⚡</span>
          <span>XỬ LÝ</span>
          <span style={{ fontSize: "8px", color: "#fef08a" }}>[E / SPACE]</span>
        </button>
      </div>

      </div> {/* Kết thúc cột giữa */}

      {/* CỘT PHẢI: Trạng thái & Điểm số (Chỉ hiện trên PC/Tablet) */}
      <div className="hidden lg:flex" style={{ width: "260px", flexDirection: "column", gap: "16px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "16px", padding: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <h3 style={{ margin: 0, color: "#38bdf8", fontSize: "1rem", fontFamily: "var(--font-mono)", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span>THÔNG TIN CÁN BỘ</span>
          <span style={{ fontSize: "0.75rem", color: "#f8fafc", fontWeight: "normal" }}>{playerName}</span>
        </h3>
        
        <div style={{ background: "rgba(0,0,0,0.4)", padding: "16px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", letterSpacing: "1px", marginBottom: "6px", fontWeight: "bold" }}>GIAI ĐOẠN</div>
          <div style={{ fontSize: "1.1rem", color: "var(--neon-gold)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {getPhaseIcon(gameState.status, "w-5 h-5")} 
            <span>{phaseConfig.name.split(" ").slice(0, 2).join(" ")}</span>
          </div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.4)", padding: "16px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", letterSpacing: "1px", marginBottom: "6px", fontWeight: "bold" }}>ĐIỂM CÔNG VỤ</div>
          <div className="pix-num" style={{ fontSize: "2rem", color: "var(--neon-blue)" }}>{playerInfo.score || 0}</div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.4)", padding: "16px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", letterSpacing: "1px", marginBottom: "6px", fontWeight: "bold" }}>UY TÍN</div>
          <div className="pix-num" style={{ fontSize: "2rem", color: (playerInfo.integrity ?? 100) >= 60 ? "var(--neon-green)" : "var(--neon-red)" }}>{playerInfo.integrity ?? 100}</div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.4)", padding: "16px", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", letterSpacing: "1px", marginBottom: "6px", fontWeight: "bold" }}>NIỀM TIN NHÂN DÂN</div>
          <div className="pix-num" style={{ fontSize: "2rem", color: "var(--neon-gold)" }}>{Number.isFinite(gameState.publicTrust) ? gameState.publicTrust : 70}%</div>
        </div>
      </div>
      
      {/* Tutorial Modal */}
      {showTutorial && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.85)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
            border: "2px solid #38bdf8",
            borderRadius: "16px", padding: "30px", maxWidth: "500px", width: "90%",
            boxShadow: "0 10px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(56,189,248,0.3) inset",
            color: "#f8fafc", textAlign: "center"
          }}>
            <h2 style={{ color: "#38bdf8", fontSize: "1.8rem", marginBottom: "15px", fontFamily: "var(--font-heading)" }}>
              HƯỚNG DẪN CHƠI
            </h2>
            <div style={{ textAlign: "left", fontSize: "1rem", lineHeight: "1.6", marginBottom: "25px", color: "#cbd5e1" }}>
              <p style={{ marginBottom: "10px" }}><strong>1. Di chuyển:</strong> Sử dụng các phím <span style={{color: "#facc15"}}>W, A, S, D</span> hoặc các nút điều hướng trên màn hình để di chuyển nhân vật.</p>
              <p style={{ marginBottom: "10px" }}><strong>2. Thu thập:</strong> Tiến lại gần các hồ sơ, bằng chứng hoặc vật phẩm (như Minh bạch, Liêm chính) để thu thập chúng.</p>
              <p style={{ marginBottom: "10px" }}><strong>3. Xử lý công việc:</strong> Đi đến các bục xử lý và nhấn phím <span style={{color: "#facc15"}}>[E] / [SPACE]</span> hoặc nút <span style={{color: "#ef4444", fontWeight: "bold"}}>⚡ XỬ LÝ</span> để hoàn thành nhiệm vụ.</p>
              <p style={{ marginBottom: "10px" }}><strong>4. Cẩn thận rủi ro:</strong> Né tránh các cám dỗ, quan liêu, hối lộ để bảo vệ điểm uy tín của bạn!</p>
              <p style={{ marginTop: "15px", fontStyle: "italic", textAlign: "center", color: "#94a3b8" }}>Hoàn thành nhiệm vụ ở góc trái phía trên màn hình để qua màn.</p>
            </div>
            <button 
              onClick={() => setShowTutorial(false)}
              style={{
                background: "linear-gradient(90deg, #0ea5e9, #2563eb)",
                border: "none", borderRadius: "8px", padding: "12px 30px",
                color: "white", fontSize: "1.1rem", fontWeight: "bold",
                cursor: "pointer", boxShadow: "0 4px 15px rgba(14, 165, 233, 0.4)",
                transition: "transform 0.1s"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              ĐÃ HIỂU, BẮT ĐẦU!
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default RpgGamePlay;
