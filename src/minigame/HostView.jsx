import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ref, set, onValue, remove, update, get } from "firebase/database";
import { db } from "./firebaseConfig";
import { situations, PHASE_CONFIGS } from "./situations";
import { applyPhaseOneGate, applyPhaseTwoGate, applyVoteOutcome, calculateFinalScore } from "./gameStateUtils";
import { buildRpgSnapshot, createPhaseWorld } from "./rpgBridge";
import {
  IconPhone,
  IconDesktop,
  IconLeaf,
  IconWarning,
  IconFlame,
  IconBook,
  IconBolt,
  IconTrophy,
  IconCrown,
  IconBulb,
  IconMarxTheory,
  IconUser,
  IconPin,
  IconArrowRight,
  IconRefresh
} from "./icons";

const getPhaseIcon = (status, className = "w-5 h-5") => {
  if (status === "phase_1") return <IconLeaf className={`${className} text-emerald-500`} />;
  if (status === "phase_2") return <IconWarning className={`${className} text-amber-500`} />;
  if (status === "phase_3") return <IconFlame className={`${className} text-red-500`} />;
  return null;
};

const getTrustResult = (publicTrust = 70) => {
  if (publicTrust >= 80) return "CƠ QUAN TRONG SẠCH, VỮNG MẠNH";
  if (publicTrust >= 60) return "CƠ QUAN HOẠT ĐỘNG TỐT";
  if (publicTrust >= 40) return "NIỀM TIN ĐANG SUY GIẢM";
  return "KHỦNG HOẢNG NIỀM TIN";
};

const EMPTY_RPG_WORLD = { books: {}, traps: {}, npcs: {}, gates: {} };

const HostView = ({ gameState, dbConnected, onResetRole }) => {
  const iframeRef = useRef(null);
  const iframeReadyRef = useRef(false);
  const [players, setPlayers] = useState({});
  const [votes, setVotes] = useState({});
  const [qrUrl, setQrUrl] = useState("");
  const [rpgWorld, setRpgWorld] = useState(EMPTY_RPG_WORLD);

  useEffect(() => {
    const url = window.location.origin + window.location.pathname + "#minigame";
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=c5272d&data=${encodeURIComponent(url)}`);
  }, []);

  useEffect(() => {
    const unsubPlayers = onValue(ref(db, "players"), (s) => setPlayers(s.val() || {}));
    return () => unsubPlayers();
  }, []);

  useEffect(() => {
    const collections = ["books", "traps", "npcs", "gates"];
    const unsubscribes = collections.map((collection) => onValue(ref(db, collection), (snapshot) => {
      setRpgWorld((currentWorld) => ({
        ...currentWorld,
        [collection]: snapshot.val() || {},
      }));
    }));
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, []);

  useEffect(() => {
    if (gameState.status === "situation_1" || gameState.status === "situation_2") {
      const sitNum = gameState.status === "situation_1" ? 1 : 2;
      const unsubVotes = onValue(ref(db, `votes/situation_${sitNum}`), (s) => setVotes(s.val() || {}));
      return () => unsubVotes();
    }
    setVotes({});
    return undefined;
  }, [gameState.status]);

  const playerList = useMemo(() => Object.entries(players).map(([id, info]) => ({ id, ...info })), [players]);
  const totalPlayers = playerList.length;
  const currentConfig = PHASE_CONFIGS[gameState.status];
  const publicTrust = Number.isFinite(gameState.publicTrust) ? gameState.publicTrust : 70;
  const averageIntegrity = totalPlayers
    ? Math.round(playerList.reduce((sum, p) => sum + (Number.isFinite(p.integrity) ? p.integrity : 100), 0) / totalPlayers)
    : 100;
  const activePlayersCount = playerList.filter((p) => p.status !== "suspended").length;
  const suspendedPlayersCount = playerList.filter((p) => p.status === "suspended").length;
  const totalCaseFiles = playerList.reduce((sum, p) => {
    const phaseProgress = p.progress?.[gameState.status] || p.progress?.phase_1 || {};
    return sum + (Number(phaseProgress.case_file) || 0);
  }, 0);
  const phaseCompletedCount = playerList.filter((p) => {
    if (gameState.status === "phase_1") return p.phaseOneQualified;
    if (gameState.status === "phase_2") return p.phaseTwoQualified;
    if (gameState.status === "phase_3") return p.completedFinalMission || p.escaped;
    return false;
  }).length;

  const getVoteStats = () => {
    let aCount = 0;
    let bCount = 0;
    Object.values(votes).forEach((v) => {
      if (v.choice === "A") aCount++;
      if (v.choice === "B") bCount++;
    });
    const total = aCount + bCount || 1;
    return {
      aCount,
      bCount,
      total: aCount + bCount,
      aPercent: Math.round((aCount / total) * 100),
      bPercent: Math.round((bCount / total) * 100),
    };
  };

  const sortedPlayers = [...playerList].sort((a, b) => calculateFinalScore(b) - calculateFinalScore(a));
  const rpgCollections = useMemo(() => ({ players, ...rpgWorld }), [players, rpgWorld]);

  const postRpgSnapshot = useCallback((force = false) => {
    const iframeWindow = iframeRef.current?.contentWindow;
    if (!iframeWindow || (!iframeReadyRef.current && !force)) return;
    iframeWindow.postMessage(buildRpgSnapshot(gameState, rpgCollections), "*");
  }, [gameState, rpgCollections]);

  const handleIframeLoad = useCallback(() => {
    iframeReadyRef.current = true;
    postRpgSnapshot(true);
  }, [postRpgSnapshot]);

  useEffect(() => {
    postRpgSnapshot();
  }, [postRpgSnapshot]);

  const handleStartPhase = async (phaseKey, publicTrustOverride = publicTrust) => {
    const config = PHASE_CONFIGS[phaseKey];

    if (phaseKey === "phase_1") {
      const playerUpdates = {};
      playerList.forEach((p) => {
        playerUpdates[`${p.id}/score`] = 0;
        playerUpdates[`${p.id}/integrity`] = 100;
        playerUpdates[`${p.id}/status`] = "active";
        playerUpdates[`${p.id}/recoveryTasksRemaining`] = null;
        playerUpdates[`${p.id}/progress`] = null;
        playerUpdates[`${p.id}/phaseOneQualified`] = null;
        playerUpdates[`${p.id}/phaseOneMessage`] = null;
        playerUpdates[`${p.id}/phaseTwoQualified`] = null;
        playerUpdates[`${p.id}/phaseTwoMessage`] = null;
        playerUpdates[`${p.id}/completedFinalMission`] = null;
        playerUpdates[`${p.id}/completedAt`] = null;
        playerUpdates[`${p.id}/decisionBonus`] = 0;
        playerUpdates[`${p.id}/phaseBonus`] = 0;
      });
      if (Object.keys(playerUpdates).length > 0) await update(ref(db, "players"), playerUpdates);
      await remove(ref(db, "votes"));
      await remove(ref(db, "marketEvents"));
      await remove(ref(db, "npcs"));
      await remove(ref(db, "gates"));
    }

    const world = createPhaseWorld(phaseKey, config, Date.now());
    await update(ref(db), {
      books: world.books,
      traps: world.traps,
      npcs: world.npcs,
      gates: world.gates,
    });

    const gameStateData = {
      status: phaseKey,
      phaseStartedAt: Date.now(),
      publicTrust: phaseKey === "phase_1" ? 70 : publicTrustOverride,
      mission: config.mission,
      learningMeaning: config.learningMeaning,
      recap: config.recap,
      progressGoals: config.progressGoals,
    };

    if (config.durationMs) {
      gameStateData.phaseEndsAt = Date.now() + config.durationMs;
    }

    await set(ref(db, "gameState"), gameStateData);
  };

  const handleMarketEvent = async (eventType) => {
    const id = `${Date.now()}_${eventType}`;
    await set(ref(db, `marketEvents/${id}`), {
      type: eventType,
      phase: gameState.status,
      createdAt: Date.now(),
    });
  };

  const applyCollectiveGoal = async (phaseKey, updates) => {
    const config = PHASE_CONFIGS[phaseKey];
    if (!config?.collectiveGoal || totalPlayers === 0) return updates;
    const completed = Object.values(updates).filter((p) => (
      phaseKey === "phase_1" ? p.phaseOneQualified : p.phaseTwoQualified
    )).length;
    const ratio = completed / totalPlayers;
    if (ratio >= config.collectiveGoal.ratio) {
      await update(ref(db, "gameState"), {
        publicTrust: Math.min(100, publicTrust + config.collectiveGoal.trustReward),
        collectiveMessage: "NHIỆM VỤ TẬP THỂ HOÀN THÀNH",
      });
    } else {
      await update(ref(db, "gameState"), {
        collectiveMessage: phaseKey === "phase_1" ? "Hồ sơ tồn đọng đang tăng." : "Thử thách quyền lực vẫn còn nhiều áp lực.",
      });
    }
    return updates;
  };

  const handleTriggerSituation = async (sitNum) => {
    const updates = {};
    if (sitNum === 1) {
      playerList.forEach((p) => {
        const { id, ...playerData } = p;
        updates[id] = applyPhaseOneGate(playerData);
      });
      await applyCollectiveGoal("phase_1", updates);
    }
    if (sitNum === 2) {
      playerList.forEach((p) => {
        const { id, ...playerData } = p;
        updates[id] = applyPhaseTwoGate(playerData);
      });
      await applyCollectiveGoal("phase_2", updates);
    }
    if (Object.keys(updates).length > 0) await update(ref(db, "players"), updates);
    await set(ref(db, "gameState/status"), `situation_${sitNum}`);
  };

  const handleStartNextPhaseFromSituation = async (nextPhase, sitNum) => {
    const stats = getVoteStats();
    const nextState = applyVoteOutcome(gameState, sitNum, stats);
    await update(ref(db, "gameState"), nextState);
    await handleStartPhase(nextPhase, nextState.publicTrust);
  };

  const handleFinishGame = async () => {
    const phaseThreeConfig = PHASE_CONFIGS.phase_3;
    if (phaseThreeConfig?.collectiveGoal && totalPlayers > 0) {
      const completed = playerList.filter((p) => p.completedFinalMission || p.escaped).length;
      if (completed / totalPlayers >= phaseThreeConfig.collectiveGoal.ratio) {
        await update(ref(db, "gameState"), {
          publicTrust: Math.min(100, publicTrust + phaseThreeConfig.collectiveGoal.trustReward),
          collectiveMessage: "NHIỆM VỤ TẬP THỂ CUỐI HOÀN THÀNH",
        });
      }
    }
    await set(ref(db, "gameState/status"), "finished");
  };

  const handleResetGame = async () => {
    await set(ref(db, "gameState"), { status: "waiting", publicTrust: 70 });
    await new Promise((resolve) => setTimeout(resolve, 100));
    await remove(ref(db, "votes"));
    await remove(ref(db, "books"));
    await remove(ref(db, "traps"));
    await remove(ref(db, "marketEvents"));
    await remove(ref(db, "players"));
    await remove(ref(db, "npcs"));
    await remove(ref(db, "gates"));
  };

  const Leaderboard = ({ max = 5, title = "XẾP HẠNG LIÊM CHÍNH" }) => (
    <div className="dashboard-widget" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "14px", padding: "16px" }}>
      <h3 className="leaderboard-title" style={{ fontSize: "0.85rem", color: "var(--neon-gold)", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "12px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
        <IconTrophy className="w-4 h-4 text-yellow-500" /> {title}
      </h3>
      <div className="leaderboard-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {sortedPlayers.slice(0, max).map((p, idx) => {
          const integrity = Number.isFinite(p.integrity) ? p.integrity : 100;
          const finalScore = calculateFinalScore(p);
          const barColor = integrity >= 80 ? "var(--neon-green)" : integrity >= 60 ? "var(--neon-gold)" : "var(--neon-red)";
          return (
            <div className="leaderboard-item-flat" key={p.id} style={{ display: "flex", flexDirection: "column", gap: "6px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "10px", padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: idx === 0 ? "var(--neon-gold)" : idx === 1 ? "#a0a0a0" : idx === 2 ? "#b07040" : "rgba(255,255,255,0.05)", color: idx < 3 ? "#000" : "#8b8680", fontSize: "0.7rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>{idx + 1}</span>
                  <span style={{ fontWeight: "bold", color: "#fff", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.85rem" }}>
                    {p.name} {p.status === "suspended" && <IconWarning className="w-3.5 h-3.5 text-red-500 inline-block" />}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.78rem" }}>
                  <span className="pix-num" style={{ color: barColor, fontWeight: "bold" }}>UT {integrity}</span>
                  <span className="pix-num" style={{ color: "var(--neon-gold)", fontWeight: "bold" }}>{finalScore}</span>
                </div>
              </div>
              <div style={{ width: "100%", height: "3px", background: "rgba(255,255,255,0.04)", borderRadius: "1.5px", overflow: "hidden" }}>
                <div style={{ width: `${integrity}%`, height: "100%", background: barColor, borderRadius: "1.5px", transition: "width 0.4s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const isRpgPhase = ["phase_1", "phase_2", "phase_3"].includes(gameState.status);

  return (
    <div className="minigame-panel host-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconDesktop className="w-5 h-5 text-red-500" />
          <span style={{ fontWeight: 800, color: "var(--neon-red)", letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.95rem" }}>Bảng điều khiển MC</span>
          {currentConfig && (
            <span style={{ fontSize: "0.85rem", color: "var(--neon-gold)", marginLeft: "10px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              {getPhaseIcon(gameState.status)} {currentConfig.name}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-cyber" style={{ padding: "6px 14px", fontSize: "0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9999px" }} onClick={onResetRole}>
            <IconRefresh className="w-3.5 h-3.5 mr-1 inline-block" /> Đổi vai
          </button>
          <button className="btn-cyber" style={{ padding: "6px 14px", fontSize: "0.75rem", background: "rgba(197, 39, 45, 0.1)", border: "1px solid rgba(197, 39, 45, 0.2)", borderRadius: "9999px", color: "var(--neon-red)" }} onClick={handleResetGame}>Reset</button>
        </div>
      </div>

      {gameState.status === "waiting" && (
        <div className="lobby-waiting">
          <h2 className="minigame-title">SỨ MỆNH LIÊM CHÍNH</h2>
          <p className="minigame-subtitle">Hành trình xây dựng Nhà nước trong sạch, vững mạnh</p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "50px", margin: "35px 0" }}>
            {qrUrl && (
              <div style={{ background: "#fff", padding: "15px", borderRadius: "15px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
                <img src={qrUrl} alt="QR Code" style={{ display: "block" }} />
                <div style={{ color: "#333", fontSize: "0.85rem", fontWeight: "bold", marginTop: "10px" }}>QUÉT ĐỂ NHẬN NHIỆM VỤ</div>
              </div>
            )}
            <div style={{ textAlign: "left", maxWidth: "430px" }}>
              <div style={{ fontSize: "1rem", marginBottom: "12px", color: "var(--neon-gold)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
                <IconPhone className="w-5 h-5 text-cyan-400" /> LUẬT CHƠI:
              </div>
              <ol style={{ paddingLeft: "20px", color: "#8b8680", lineHeight: "1.7" }}>
                <li>Nhập vai cán bộ trẻ trong cơ quan hành chính mô phỏng</li>
                <li>Thu thập <b>hồ sơ, phản hồi tốt, liêm chính, minh bạch</b></li>
                <li>Né <b>quan liêu, lãng phí, lợi ích cá nhân, đặc quyền</b></li>
                <li>Giữ <b>Uy tín</b> cá nhân và nâng <b>Niềm tin nhân dân</b> của cả lớp</li>
              </ol>
              <div className="player-count" style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                Đã tham gia: <span className="pix-num" style={{ fontFamily: "var(--font-mono)", fontWeight: "bold" }}>{totalPlayers}</span> cán bộ
                <div className="loading-dots"><span></span><span></span><span></span></div>
              </div>
              <button className="btn-cyber btn-cyber-blue" style={{ width: "100%", marginTop: "20px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }} onClick={() => handleStartPhase("phase_1")}>
                <IconLeaf className="w-5 h-5" /> Bắt đầu Phase 1: Vì Dân Phục Vụ
              </button>
            </div>
          </div>
          {totalPlayers > 0 && (
            <div className="player-grid">
              {playerList.map((p) => (
                <div className="player-pill" key={p.id} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <IconUser className="w-4 h-4 text-slate-400" /> {p.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isRpgPhase && currentConfig && (
        <div className="host-dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "20px", marginTop: "15px", textAlign: "left" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              <div className="kpi-card-flat"><span className="kpi-label">Cán Bộ Đang Hoạt Động</span><span className="kpi-val pix-num" style={{ color: "var(--neon-blue)" }}>{activePlayersCount}<span style={{ fontSize: "0.85rem", color: "#8b8680", fontWeight: "normal" }}>/{totalPlayers}</span></span></div>
              <div className="kpi-card-flat"><span className="kpi-label">Uy Tín Trung Bình</span><span className="kpi-val pix-num" style={{ color: averageIntegrity >= 60 ? "var(--neon-green)" : "var(--neon-red)" }}>{averageIntegrity}</span></div>
              <div className="kpi-card-flat"><span className="kpi-label">Hồ Sơ Đã Giải Quyết</span><span className="kpi-val pix-num" style={{ color: "var(--neon-green)" }}>{totalCaseFiles}</span></div>
              <div className="kpi-card-flat"><span className="kpi-label">Niềm Tin Nhân Dân</span><span className="kpi-val pix-num" style={{ color: publicTrust >= 60 ? "var(--neon-gold)" : "var(--neon-red)" }}>{publicTrust}%</span></div>
            </div>
            {suspendedPlayersCount > 0 && (
              <div style={{ background: "rgba(197,39,45,0.06)", border: "1px solid rgba(197,39,45,0.12)", borderRadius: "10px", padding: "8px 12px", fontSize: "0.8rem", color: "var(--neon-red)", display: "flex", alignItems: "center", gap: "6px" }}>
                <IconWarning className="w-4 h-4 flex-shrink-0" />
                <span>{suspendedPlayersCount} cán bộ đang cần hoàn thành nhiệm vụ khắc phục để lấy lại tín nhiệm.</span>
              </div>
            )}
            <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden", background: "#000", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
              <iframe ref={iframeRef} src="/rpg/index.html?role=host" onLoad={handleIframeLoad} style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }} title="RPG Spectator" />
            </div>
            <div style={{ color: "#8b8680", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px" }}>
              <IconBulb className="w-3.5 h-3.5 text-yellow-500" /> Kéo chuột hoặc phím mũi tên để quan sát bản đồ
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="narrative-widget" style={{ background: "rgba(255,183,0,0.01)", border: "1px solid rgba(255,183,0,0.06)", borderRadius: "12px", padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--neon-gold)", fontWeight: "bold", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "6px" }}>
                <IconBulb className="w-3.5 h-3.5 text-yellow-500" /> MC Dẫn Dắt
              </div>
              <p style={{ color: "#e1dbd6", fontStyle: "italic", fontSize: "0.85rem", margin: 0, lineHeight: "1.5" }}>"{currentConfig.mcNarration}"</p>
            </div>
            <Leaderboard />
            <div className="dashboard-widget" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "14px", padding: "16px" }}>
              <h4 style={{ fontSize: "0.8rem", color: "var(--neon-blue)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px 0" }}>Kích Hoạt Sự Kiện</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {currentConfig.hostEvents?.map((event) => (
                  <button key={event.type} className="btn-market-flat" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", padding: "10px 14px", borderRadius: "8px", cursor: "pointer", border: "1px solid rgba(255,255,255,0.03)", background: "rgba(255,255,255,0.02)", width: "100%" }} onClick={() => handleMarketEvent(event.type)}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "bold", fontSize: "0.8rem", color: "#fff" }}><IconBook className="w-4 h-4 text-amber-500" /> {event.label}</span>
                    <span style={{ color: "#8b8680", fontSize: "0.7rem" }}>{event.hint}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              {gameState.collectiveMessage && (
                <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "10px", padding: "10px 12px", fontSize: "0.8rem", color: "var(--neon-gold)" }}>{gameState.collectiveMessage}</div>
              )}
              <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "10px", padding: "10px 12px", fontSize: "0.8rem" }}>
                <span style={{ color: "var(--neon-gold)", fontWeight: "bold", display: "block", marginBottom: "3px" }}>MC CHỐT Ý:</span>
                <span style={{ color: "#a8a29a", lineHeight: "1.4" }}>{currentConfig.recap}</span>
              </div>
              {gameState.status === "phase_1" && <button className="btn-cyber" style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px", fontSize: "0.95rem" }} onClick={() => handleTriggerSituation(1)}><IconBolt className="w-4 h-4 text-yellow-500 animate-pulse" /> Chốt Phase 1 & Tình huống 1</button>}
              {gameState.status === "phase_2" && <button className="btn-cyber" style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px", fontSize: "0.95rem" }} onClick={() => handleTriggerSituation(2)}><IconBolt className="w-4 h-4 text-yellow-500 animate-pulse" /> Chốt Phase 2 & Tình huống 2</button>}
              {gameState.status === "phase_3" && <button className="btn-cyber btn-cyber-blue" style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px", fontSize: "0.95rem" }} onClick={handleFinishGame}><IconTrophy className="w-4 h-4 text-yellow-500 animate-bounce" /> Kết thúc & Tổng kết</button>}
            </div>
          </div>
        </div>
      )}

      {(gameState.status === "situation_1" || gameState.status === "situation_2") && (() => {
        const sitIdx = gameState.status === "situation_1" ? 0 : 1;
        const sit = situations[sitIdx];
        const stats = getVoteStats();
        const nextPhase = gameState.status === "situation_1" ? "phase_2" : "phase_3";
        return (
          <div>
            <h2 style={{ color: "var(--neon-red)", fontSize: "1.4rem", fontWeight: "bold", textAlign: "center", marginBottom: "5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <IconBolt className="w-5 h-5 text-red-500 animate-pulse" /> TÌNH HUỐNG {sitIdx + 1}: {sit.title.toUpperCase()}
            </h2>
            <div className="situation-box" style={{ fontSize: "1.15rem", lineHeight: "1.7", marginBottom: "25px" }}>{sit.story}</div>
            <div style={{ margin: "25px 0" }}>
              <h3 style={{ fontSize: "1rem", color: "var(--neon-blue)", textTransform: "uppercase", marginBottom: "15px", display: "flex", alignItems: "center", gap: "6px" }}>
                <IconUser className="w-4 h-4 text-cyan-400" /> Kết quả biểu quyết cả lớp: ({stats.total}/{totalPlayers} đã bầu)
              </h3>
              <div style={{ marginBottom: "15px" }}>
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>A. {sit.optionA.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><div style={{ flex: 1, height: "28px", background: "rgba(0,0,0,0.3)", borderRadius: "14px", overflow: "hidden" }}><div style={{ height: "100%", width: `${stats.aPercent}%`, background: "var(--neon-blue)", transition: "width 0.8s", borderRadius: "14px" }} /></div><span style={{ width: "85px", textAlign: "right", fontWeight: "bold", fontFamily: "var(--font-mono)" }}>{stats.aCount} ({stats.aPercent}%)</span></div>
              </div>
              <div>
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>B. {sit.optionB.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><div style={{ flex: 1, height: "28px", background: "rgba(0,0,0,0.3)", borderRadius: "14px", overflow: "hidden" }}><div style={{ height: "100%", width: `${stats.bPercent}%`, background: "var(--neon-green)", transition: "width 0.8s", borderRadius: "14px" }} /></div><span style={{ width: "85px", textAlign: "right", fontWeight: "bold", fontFamily: "var(--font-mono)" }}>{stats.bCount} ({stats.bPercent}%)</span></div>
              </div>
            </div>
            <div className="explanation-section">
              <div className="explanation-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}><IconPin className="w-4 h-4 text-yellow-500" /> Hệ quả lựa chọn A:</div>
              <p className="explanation-text">{sit.optionA.consequence}</p>
              <div className="explanation-title" style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "6px" }}><IconPin className="w-4 h-4 text-yellow-500" /> Hệ quả lựa chọn B:</div>
              <p className="explanation-text">{sit.optionB.consequence}</p>
              <div className="marx-section">
                <div className="marx-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}><IconMarxTheory className="w-4 h-4 text-red-500" /> MC thảo luận:</div>
                <p className="marx-text">"{sit.discussionQuestion}"</p>
                <p className="marx-text">"{sit.marxLenin}"</p>
              </div>
            </div>
            <Leaderboard max={5} title="BẢNG XẾP HẠNG TẠM THỜI" />
            <button className="btn-cyber btn-cyber-blue" style={{ width: "100%", marginTop: "25px", padding: "16px", fontSize: "1.1rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }} onClick={() => handleStartNextPhaseFromSituation(nextPhase, sitIdx + 1)}>
              {getPhaseIcon(nextPhase, "w-5 h-5")} Bắt đầu Phase {nextPhase.replace("phase_", "")}: {PHASE_CONFIGS[nextPhase].name} <IconArrowRight className="w-4 h-4" />
            </button>
          </div>
        );
      })()}

      {gameState.status === "finished" && (
        <div style={{ textAlign: "center" }}>
          <h2 className="minigame-title" style={{ display: "inline-flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
            <IconTrophy className="w-10 h-10 text-yellow-500 animate-bounce" /> {getTrustResult(publicTrust)}
          </h2>
          <p className="minigame-subtitle">Tổng kết Sứ Mệnh Liêm Chính của toàn cơ quan</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", margin: "24px 0" }}>
            <div className="kpi-card-flat"><span className="kpi-label">Cán bộ tham gia</span><span className="kpi-val pix-num">{totalPlayers}</span></div>
            <div className="kpi-card-flat"><span className="kpi-label">Hoàn thành Phase 3</span><span className="kpi-val pix-num">{phaseCompletedCount}</span></div>
            <div className="kpi-card-flat"><span className="kpi-label">Uy tín trung bình</span><span className="kpi-val pix-num">{averageIntegrity}</span></div>
            <div className="kpi-card-flat"><span className="kpi-label">Niềm tin nhân dân</span><span className="kpi-val pix-num">{publicTrust}%</span></div>
          </div>
          <Leaderboard max={10} title="BẢNG XẾP HẠNG CHI TIẾT (TOP 10)" />
          <div className="mission-card" style={{ marginTop: "24px", textAlign: "left" }}>
            <div className="mission-label">LỚP VỪA TRẢI NGHIỆM GÌ?</div>
            <div className="mission-text">Quyền lực không tự nhiên tạo ra một bộ máy tốt. Khi thực thi công vụ, cán bộ luôn có thể gặp sức ép của quan hệ cá nhân, thành tích, lợi ích và sự quan liêu.</div>
          </div>
          <div style={{ background: "rgba(255,183,0,0.04)", border: "1px solid rgba(255,183,0,0.15)", borderRadius: "16px", padding: "24px", marginTop: "30px", textAlign: "left", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)" }}>
            <div style={{ fontWeight: "bold", color: "var(--neon-gold)", marginBottom: "10px", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <IconBulb className="w-5 h-5 text-yellow-500" /> Bài học tổng kết:
            </div>
            <p style={{ color: "#e1dbd6", lineHeight: "1.7" }}>
              Xây dựng Nhà nước trong sạch, vững mạnh không chỉ cần cán bộ có đạo đức mà còn cần trách nhiệm, minh bạch và cơ chế kiểm soát quyền lực. Một cơ quan phục vụ nhân dân phải vừa hiệu quả, vừa công khai, vừa giữ được niềm tin.
            </p>
          </div>
          <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
            <button className="btn-cyber" style={{ flex: 1 }} onClick={() => handleStartPhase("phase_1")}>Chơi lại</button>
            <button className="btn-cyber btn-cyber-blue" style={{ flex: 1 }} onClick={handleResetGame}>Về phòng chờ</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostView;
