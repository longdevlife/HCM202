import React, { useEffect, useRef, useState } from "react";
import { ref, remove, runTransaction } from "firebase/database";
import { db } from "./firebaseConfig";
import { PHASE_CONFIGS } from "./situations";
import { applyPlayerDelta } from "./gameStateUtils";
import { getCharacterOption } from "./characterOptions";
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


const RpgGamePlay = ({ playerId, playerName, playerInfo, dbConnected, gameState }) => {
  const iframeRef = useRef(null);
  const selectedCharacter = getCharacterOption(playerInfo.character);

  // Trạng thái đóng băng
  const [isFrozen, setIsFrozen] = useState(false);
  const [freezeTime, setFreezeTime] = useState(0);
  const freezeTimeoutRef = useRef(null);

  // Floating text
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [nowMs, setNowMs] = useState(Date.now());

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

  const incrementProgress = (type) =>
    runTransaction(
      ref(db, `players/${playerId}/progress/${gameState.status}/${type}`),
      (current) => (Number(current) || 0) + 1,
      { applyLocally: false }
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

  // 1. Lắng nghe postMessage từ Phaser
  useEffect(() => {
    const applyScoreCapitalDelta = (delta) =>
      runTransaction(
        ref(db, `players/${playerId}`),
        (player) => applyPlayerDelta(player, delta),
        { applyLocally: false }
      );

    const claimBook = async (bookId) => {
      if (!bookId) return false;

      const result = await runTransaction(
        ref(db, `books/${bookId}`),
        (book) => {
          if (!book || book.claimedBy) return book;
          return { ...book, claimedBy: playerId, claimedAt: Date.now() };
        },
        { applyLocally: false }
      );

      const claimedBook = result.snapshot.val();
      const didClaim = claimedBook?.claimedBy === playerId;
      if (didClaim) {
        await remove(ref(db, `books/${bookId}`));
      }
      return didClaim ? claimedBook : null;
    };

    const handleMessage = async (e) => {
      if (!e.data) return;

      // A. Nhặt cơ hội kinh doanh → Bonus theo object type
      if (e.data.type === "NHAT_SACH") {
        const claimedBook = await claimBook(e.data.bookId);
        if (!claimedBook) return;

        const bonusScore = Number.isFinite(claimedBook.score)
          ? claimedBook.score
          : phaseConfig.bookReward.score;
        const bonusCapital = Number.isFinite(claimedBook.capital)
          ? claimedBook.capital
          : phaseConfig.bookReward.capital;

        await applyScoreCapitalDelta({ score: bonusScore, capital: bonusCapital });
        await incrementProgress(claimedBook.type || "opportunity");
        addFloatingText(claimedBook.message || `+${bonusScore}đ Cơ hội`, claimedBook.color || "#2e7d32");
      }

      // B. Va chạm rủi ro nền tảng → Phạt theo hazard type
      if (e.data.type === "DINH_BAY") {
        const hazard = e.data.hazard || {};
        const shouldFreeze = hazard.effect === "freeze" || !hazard.effect;
        const freezeSeconds = Math.ceil((hazard.durationMs || 3000) / 1000);

        if (shouldFreeze) {
          if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
          setIsFrozen(true);
          setFreezeTime(freezeSeconds);
          iframeRef.current?.contentWindow?.postMessage({ type: "FREEZE" }, "*");
          freezeTimeoutRef.current = setTimeout(() => {
            setIsFrozen(false);
            setFreezeTime(0);
            iframeRef.current?.contentWindow?.postMessage({ type: "UNFREEZE" }, "*");
          }, hazard.durationMs || 3000);
        }

        const penScore = Number.isFinite(hazard.score)
          ? hazard.score
          : phaseConfig.trapPenalty.score;
        const penCapital = Number.isFinite(hazard.capital)
          ? hazard.capital
          : phaseConfig.trapPenalty.capital;

        await applyScoreCapitalDelta({ score: penScore, capital: penCapital });
        await incrementProgress(`hit_${hazard.type || "hazard"}`);
        addFloatingText(hazard.message || `${penScore}đ Rủi ro`, hazard.color || "#c5272d");
      }

      // C. Tìm thấy Khách Ruột (Phase 2 NPC) — NPC vẫn ở đó cho người khác tìm
      if (e.data.type === "FOUND_LOYAL_CUSTOMER") {
        await incrementProgress("loyal_customer_found");
        await runTransaction(
          ref(db, `players/${playerId}/progress/${gameState.status}/loyal_customer_found_at`),
          (current) => current || Date.now(),
          { applyLocally: false }
        );
        addFloatingText("🎉 Tìm thấy Khách Ruột!", "#00897b");
      }

      // D. Thoát qua Cổng Thoát (Phase 3)
      if (e.data.type === "ESCAPED_GATE") {
        await incrementProgress("escaped_gate");
        await runTransaction(
          ref(db, `players/${playerId}`),
          (player) => ({
            ...player,
            escaped: true,
            escapedAt: player?.escapedAt || Date.now(),
          }),
          { applyLocally: false }
        );
        addFloatingText("Đã thoát khỏi nền tảng!", "#c9922a");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [playerId, phaseConfig, gameState.status]);

  // 2. Bộ đếm ngược đóng băng
  useEffect(() => {
    if (!isFrozen) return undefined;
    const timer = setInterval(() => {
      setFreezeTime((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isFrozen]);

  useEffect(() => {
    return () => {
      if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
      iframeRef.current?.contentWindow?.postMessage({ type: "UNFREEZE" }, "*");
    };
  }, [gameState.status]);

  // 3. Hiện thông báo phí sàn khi bị trừ tự động (qua Firebase onValue)
  const lastCapitalRef = useRef(playerInfo.capital);
  useEffect(() => {
    // Detect phí sàn bị trừ (capital giảm mà không phải do bẫy/sách)
    if (phaseConfig.platformFeeInterval > 0 && playerInfo.capital < lastCapitalRef.current && !isFrozen) {
      const diff = lastCapitalRef.current - playerInfo.capital;
      // Chỉ hiện nếu đúng mức phí sàn (±20% tolerance)
      if (Math.abs(diff - phaseConfig.platformFeeAmount) < phaseConfig.platformFeeAmount * 0.3) {
        addFloatingText(`-${(phaseConfig.platformFeeAmount / 1000000).toFixed(0)}tr Phí sàn`, "#ff6b35");
      }
    }

    lastCapitalRef.current = playerInfo.capital;
  }, [playerInfo.capital]);

  // 4. D-pad
  const handleDpadPress = (dir) => {
    if (isFrozen) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "DPAD_MOVE", dir }, "*");
  };
  const handleDpadRelease = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: "DPAD_MOVE", dir: "stop" }, "*");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "1400px", margin: "0 auto" }}>

      {/* Phase indicator + HUD - Pixel UI/UX 8-bit styling */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: "#fff6d7", border: "3px solid #000", borderRadius: "0px", padding: "12px 20px", marginBottom: "12px", boxShadow: "5px 5px 0 rgba(0,0,0,0.5)", color: "#2c1a0e" }}>
        {/* Phase badge */}
        <div style={{ textAlign: "center", minWidth: "90px" }}>
          <div style={{ fontSize: "7px", color: "var(--neon-gold)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>Giai đoạn</div>
          <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--neon-red)", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginTop: "2px" }}>
            {getPhaseIcon(gameState.status, "w-4 h-4")} {phaseConfig.name.split(" ").slice(0, 2).join(" ")}
          </div>
        </div>
        <div style={{ width: "2px", background: "#000", margin: "0 12px", height: "30px" }} />

        {/* Vốn */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: "7px", color: "#8b8680", fontWeight: "800", letterSpacing: "1px" }}>VỐN</div>
          <div style={{ fontSize: "0.95rem", fontWeight: "800", color: playerInfo.isBankrupt ? "var(--neon-red)" : "var(--neon-green)", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
            {playerInfo.isBankrupt ? (
              <>
                <IconSkull className="w-4 h-4 text-red-500 animate-pulse" /> PHÁ SẢN
              </>
            ) : (
              <span className="pix-num">{`${(playerInfo.capital || 0).toLocaleString()}đ`}</span>
            )}
          </div>
        </div>
        <div style={{ width: "2px", background: "#000", margin: "0 12px", height: "30px" }} />

        {/* Điểm */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: "7px", color: "#8b8680", fontWeight: "800", letterSpacing: "1px" }}>ĐIỂM TÍCH LŨY</div>
          <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--neon-blue)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
            <span className="pix-num">{playerInfo.score || 0}đ</span>
          </div>
        </div>
        <div style={{ width: "2px", background: "#000", margin: "0 12px", height: "30px" }} />

        {/* Nhân vật */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: "7px", color: "#8b8680", fontWeight: "800", letterSpacing: "1px" }}>CHỦ SHOP</div>
          <div style={{ fontSize: "0.85rem", fontWeight: "800", color: selectedCharacter.color, marginTop: "2px" }}>
            {selectedCharacter.label}
          </div>
        </div>
      </div>

      {/* Thông báo phí sàn */}
      {phaseConfig.platformFeeInterval > 0 && (
        <div style={{ width: "100%", background: "rgba(197,39,45,0.08)", border: "1px solid rgba(197,39,45,0.15)", borderRadius: "10px", padding: "8px 12px", marginBottom: "10px", fontSize: "0.75rem", color: "#ff6b35", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <IconSkull className="w-4 h-4 text-red-500 animate-pulse" />
          <span>Hệ quả Độc quyền (Phí sàn): <b>-{(phaseConfig.platformFeeAmount / 1000000).toFixed(0)} triệu</b> vốn mỗi <b>{phaseConfig.platformFeeInterval / 1000}s</b></span>
        </div>
      )}

      {activeMission && (
        <div className="mission-card">
          <div className="mission-label">NHIỆM VỤ PHASE</div>
          <div className="mission-text">{activeMission}</div>
          {progressText && <div className="mission-progress pix-num">{progressText}</div>}
          {activeMeaning && <div className="mission-meaning">{activeMeaning}</div>}
        </div>
      )}

      {/* Countdown Phase 2 - 60 giây */}
      {phaseCountdown !== null && gameState.status === "phase_2" && (
        <div style={{ width: "100%", background: phaseCountdown <= 10 ? "rgba(197,39,45,0.15)" : "rgba(0,137,123,0.08)", border: `2px solid ${phaseCountdown <= 10 ? "rgba(197,39,45,0.4)" : "rgba(0,137,123,0.2)"}`, borderRadius: "12px", padding: "10px 16px", marginBottom: "10px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <IconTimer className={`w-5 h-5 ${phaseCountdown <= 10 ? "text-red-500 animate-pulse" : "text-teal-500"}`} />
            <span style={{ fontSize: "1.2rem", fontWeight: "800", fontFamily: "var(--font-mono)", color: phaseCountdown <= 10 ? "#c5272d" : "#00897b" }}>
              {phaseCountdown > 0 ? `${phaseCountdown}s` : "HẾT GIỜ!"}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#8b8680" }}>Tìm Khách Ruột</span>
          </div>
          <div style={{ width: "100%", height: "4px", background: "rgba(0,0,0,0.2)", borderRadius: "2px", marginTop: "6px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, (phaseCountdown / 60) * 100)}%`, background: phaseCountdown <= 10 ? "#c5272d" : "#00897b", transition: "width 1s linear", borderRadius: "2px" }} />
          </div>
        </div>
      )}

      {/* Hint Khách Ruột từ Host */}
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
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", overflow: "hidden", background: "#000", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
          <iframe
            ref={iframeRef}
            src={`/rpg/index.html?role=player&id=${playerId}&name=${encodeURIComponent(playerName)}&character=${encodeURIComponent(selectedCharacter.id)}&color=${encodeURIComponent(selectedCharacter.color)}`}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            title="Phaser RPG"
          />

          {/* Overlay đóng băng */}
          {isFrozen && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(21, 101, 192, 0.25)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", pointerEvents: "all" }}>
              <IconWarning className="w-12 h-12 text-cyan-400 animate-pulse" />
              <h3 style={{ color: "#fff", fontWeight: "bold", fontSize: "1.4rem", textShadow: "0 2px 8px rgba(0,0,0,0.6)", marginTop: "12px", letterSpacing: "1px" }}>BỊ PHẠT ĐÓNG BĂNG!</h3>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}>Thời gian còn lại: {freezeTime} giây</p>
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
        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}><IconBook className="w-3.5 h-3.5 text-amber-500" /> Nhặt cơ hội</span>
        <span>•</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}><IconBolt className="w-3.5 h-3.5 text-red-500" /> Né rủi ro nền tảng</span>
      </div>

      {/* D-pad */}
      <div className="dpad-container" style={{ userSelect: "none" }}>
        <button className="dpad-btn" onMouseDown={() => handleDpadPress("up")} onMouseUp={handleDpadRelease} onTouchStart={() => handleDpadPress("up")} onTouchEnd={handleDpadRelease}>▲</button>
        <div style={{ display: "flex", gap: "25px" }}>
          <button className="dpad-btn" onMouseDown={() => handleDpadPress("left")} onMouseUp={handleDpadRelease} onTouchStart={() => handleDpadPress("left")} onTouchEnd={handleDpadRelease}>◀</button>
          <button className="dpad-btn" onMouseDown={() => handleDpadPress("right")} onMouseUp={handleDpadRelease} onTouchStart={() => handleDpadPress("right")} onTouchEnd={handleDpadRelease}>▶</button>
        </div>
        <button className="dpad-btn" onMouseDown={() => handleDpadPress("down")} onMouseUp={handleDpadRelease} onTouchStart={() => handleDpadPress("down")} onTouchEnd={handleDpadRelease}>▼</button>
      </div>
    </div>
  );
};

export default RpgGamePlay;

