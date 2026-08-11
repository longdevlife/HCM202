import React, { useEffect, useState } from "react";
import { ref, set, onValue, get, runTransaction } from "firebase/database";
import { db } from "./firebaseConfig";
import { situations, PHASE_CONFIGS } from "./situations";
import RpgGamePlay from "./RpgGamePlay";
import { CHARACTER_OPTIONS, getCharacterOption } from "./characterOptions";
import { applyDecisionEffects, calculateFinalScore } from "./gameStateUtils";
import {
  IconPhone,
  IconLeaf,
  IconWarning,
  IconBolt,
  IconTrophy,
  IconCrown,
  IconUser,
  IconCheck,
  IconRefresh
} from "./icons";

const getIntegrityStatus = (integrity = 100) => {
  if (integrity >= 60) return "TÍN NHIỆM TỐT";
  if (integrity >= 30) return "CẢNH BÁO";
  if (integrity >= 1) return "MẤT TÍN NHIỆM";
  return "TẠM ĐÌNH CHỈ";
};

const PlayerView = ({ playerId, playerName, setPlayerName, gameState, dbConnected, onResetRole }) => {
  const [tempName, setTempName] = useState(playerName);
  const [selectedCharacterId, setSelectedCharacterId] = useState(() => localStorage.getItem("minigame_character_id") || "reception_officer");
  const [isJoined, setIsJoined] = useState(false);
  const [playerInfo, setPlayerInfo] = useState({ score: 0, integrity: 100, status: "active" });
  const [players, setPlayers] = useState({});
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, "players"), (snapshot) => {
      const data = snapshot.val() || {};
      setPlayers(data);
      if (data[playerId]) {
        setPlayerInfo(data[playerId]);
        setIsJoined(true);
      } else {
        setIsJoined(false);
      }
    });
    return () => unsubscribe();
  }, [playerId]);

  useEffect(() => {
    if (gameState.status === "situation_1" || gameState.status === "situation_2") {
      setHasVoted(false);
      setSelectedVote(null);
      const sitNum = gameState.status === "situation_1" ? 1 : 2;
      get(ref(db, `votes/situation_${sitNum}/${playerId}`)).then((snap) => {
        if (snap.val()) {
          setHasVoted(true);
          setSelectedVote(snap.val().choice);
        }
      });
    }
  }, [gameState.status, playerId]);

  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    const cleanName = tempName.trim().substring(0, 15);
    const selectedCharacter = getCharacterOption(selectedCharacterId);
    setPlayerName(cleanName);
    localStorage.setItem("minigame_player_name", cleanName);
    localStorage.setItem("minigame_character_id", selectedCharacter.id);
    await set(ref(db, `players/${playerId}`), {
      name: cleanName,
      character: selectedCharacter.id,
      color: selectedCharacter.color,
      score: 0,
      integrity: 100,
      status: "active",
      decisionBonus: 0,
      phaseBonus: 0,
      joinedAt: Date.now(),
    });
    setIsJoined(true);
  };

  const handleVote = async (choice) => {
    if (hasVoted) return;
    setSelectedVote(choice);
    setHasVoted(true);
    const sitNum = gameState.status === "situation_1" ? 1 : 2;
    const sit = situations[sitNum - 1];
    const effects = choice === "A" ? sit.optionA.effects : sit.optionB.effects;
    await set(ref(db, `votes/situation_${sitNum}/${playerId}`), { choice, votedAt: Date.now() });
    await runTransaction(
      ref(db, `players/${playerId}`),
      (player) => {
        if (!player) return player;
        const next = applyDecisionEffects(player, effects);
        return {
          ...next,
          decisionBonus: (Number(player.decisionBonus) || 0) + (Number(effects.decisionBonus) || 0),
        };
      },
      { applyLocally: false }
    );
  };

  const getPlayerRank = () => {
    const sorted = Object.entries(players)
      .map(([id, info]) => ({ id, ...info }))
      .sort((a, b) => calculateFinalScore(b) - calculateFinalScore(a));
    const rank = sorted.findIndex((p) => p.id === playerId);
    return rank !== -1 ? rank + 1 : "-";
  };

  const getLearningResult = () => {
    const integrity = Number.isFinite(playerInfo.integrity) ? playerInfo.integrity : 100;
    const score = playerInfo.score || 0;
    if (integrity >= 95) return "Bạn giữ vững nguyên tắc rất tốt: hiệu quả công vụ đi cùng minh bạch, trách nhiệm và phục vụ nhân dân.";
    if (integrity >= 60 && score >= 300) return "Bạn hoàn thành nhiệm vụ tốt, đồng thời giữ được uy tín. Đây là nền tảng của một bộ máy công quyền vững mạnh.";
    if (integrity < 30) return "Bạn đã thấy sức ép quan hệ, thành tích và lợi ích có thể làm suy giảm tín nhiệm nhanh thế nào. Liêm chính cần cả bản lĩnh và cơ chế kiểm soát.";
    return "Bạn vừa trải nghiệm rằng làm đúng công vụ không chỉ là hoàn thành việc, mà còn là giữ niềm tin của nhân dân.";
  };

  const totalPlayersCount = Object.keys(players).length;
  const isRpgPhase = ["phase_1", "phase_2", "phase_3"].includes(gameState.status);
  const isSituation = gameState.status === "situation_1" || gameState.status === "situation_2";
  const currentCharacter = getCharacterOption(playerInfo.character);
  const publicTrust = Number.isFinite(gameState.publicTrust) ? gameState.publicTrust : 70;
  const integrity = Number.isFinite(playerInfo.integrity) ? playerInfo.integrity : 100;

  if (!isJoined) {
    return (
      <div className="minigame-panel player-panel-md">
        <h2 className="minigame-title" style={{ fontSize: "1.8rem" }}>NHẬN NHIỆM VỤ</h2>
        <p className="minigame-subtitle" style={{ fontSize: "1rem", marginBottom: "25px" }}>Nhập vai cán bộ trẻ, xử lý công vụ và giữ vững liêm chính</p>
        <form onSubmit={handleJoinGame} className="join-form">
          <div className="input-group">
            <label className="input-label">Nhập tên / Biệt danh:</label>
            <input type="text" className="game-input" value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder="Ví dụ: Minh Anh" maxLength={15} required />
          </div>
          <div className="input-group" style={{ marginTop: "20px" }}>
            <label className="input-label">Chọn vai trò cán bộ:</label>
            <div className="character-grid">
              {CHARACTER_OPTIONS.map((char) => {
                const isSelected = selectedCharacterId === char.id;
                return (
                  <div key={char.id} className={`character-option ${isSelected ? "selected" : ""}`} style={{ "--character-color": char.color }} onClick={() => setSelectedCharacterId(char.id)}>
                    <div className={`pixel-character ${char.spriteClass}`}>
                      <span className="pixel-hat"></span><span className="pixel-hair"></span><span className="pixel-head"></span><span className="pixel-body"></span><span className="pixel-arm pixel-arm-left"></span><span className="pixel-arm pixel-arm-right"></span><span className="pixel-leg pixel-leg-left"></span><span className="pixel-leg pixel-leg-right"></span><span className="pixel-pack"></span><span className="pixel-accessory"></span>
                    </div>
                    <div className="character-name">{char.label}</div>
                    <div className="character-desc">{char.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <button type="submit" className="btn-cyber btn-cyber-blue" style={{ marginTop: "20px", width: "100%" }}>Tham gia ngay</button>
        </form>
        <button onClick={onResetRole} style={{ background: "none", border: "none", color: "#8b8680", marginTop: "20px", textDecoration: "underline", cursor: "pointer", fontSize: "0.85rem" }}>Quay lại chọn vai trò</button>
      </div>
    );
  }

  if (gameState.status === "waiting") {
    return (
      <div className="minigame-panel player-panel-sm" style={{ textAlign: "center" }}>
        <IconPhone className="w-16 h-16 mx-auto text-cyan-400 animate-bounce" />
        <h2 className="minigame-title" style={{ fontSize: "1.8rem" }}>ĐÃ VÀO CƠ QUAN</h2>
        <p style={{ color: "var(--neon-gold)", fontWeight: "600", fontSize: "1.1rem", margin: "10px 0" }}>Xin chào, {playerName}!</p>
        <div className="selected-character-badge" style={{ "--character-color": currentCharacter.color }}>
          <span>Vai trò: {currentCharacter.label}</span>
        </div>
        <p style={{ color: "#8b8680", fontSize: "0.95rem", lineHeight: "1.6" }}>Bạn đã sẵn sàng nhận nhiệm vụ. Nhìn lên màn hình máy chiếu để nghe MC bắt đầu.</p>
        <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", margin: "30px 0", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--neon-blue)", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}>Tổng số cán bộ:</div>
          <div style={{ fontSize: "2.2rem", fontWeight: "bold", margin: "5px 0", fontFamily: "var(--font-mono)", color: "#fff" }}>{totalPlayersCount}</div>
        </div>
        <div className="loading-dots"><span></span><span></span><span></span></div>
      </div>
    );
  }

  if (isRpgPhase) {
    if (playerInfo.status === "suspended") {
      return (
        <div className="minigame-panel player-panel-sm" style={{ textAlign: "center" }}>
          <IconWarning className="w-16 h-16 mx-auto text-red-500 animate-pulse" />
          <h2 className="minigame-title" style={{ fontSize: "1.6rem" }}>TẠM ĐÌNH CHỈ TÍN NHIỆM</h2>
          <p className="minigame-subtitle" style={{ lineHeight: "1.6" }}>Uy tín của bạn đã về 0. Hãy hoàn thành nhiệm vụ khắc phục để quay lại trạng thái hoạt động.</p>
          <div className="mission-card" style={{ textAlign: "left", marginTop: "20px" }}>
            <div className="mission-label">BÀI HỌC NHANH</div>
            <div className="mission-text">Liêm chính không chỉ là tránh sai phạm lớn. Những lựa chọn nhỏ lặp lại cũng có thể làm mất niềm tin rất nhanh.</div>
          </div>
        </div>
      );
    }

    if ((playerInfo.completedFinalMission || playerInfo.escaped) && gameState.status === "phase_3") {
      return (
        <div className="minigame-panel player-panel-sm" style={{ textAlign: "center" }}>
          <IconTrophy className="w-16 h-16 mx-auto text-yellow-500 animate-bounce" />
          <h2 className="minigame-title" style={{ fontSize: "1.6rem" }}>ĐÃ ĐẾN TRUNG TÂM CÔNG KHAI!</h2>
          <p className="minigame-subtitle" style={{ lineHeight: "1.6" }}>Bạn đã hoàn thành chặng cuối: minh bạch, trách nhiệm và phục vụ nhân dân. Chờ MC công bố kết quả chung.</p>
          <div className="mission-card" style={{ textAlign: "left", marginTop: "20px" }}>
            <div className="mission-label">BÀI HỌC</div>
            <div className="mission-text">Công khai và giải trình là cơ chế giúp quyền lực được sử dụng đúng mục đích, không lệ thuộc vào ý chí cá nhân.</div>
          </div>
        </div>
      );
    }

    return <RpgGamePlay playerId={playerId} playerName={playerName} playerInfo={playerInfo} dbConnected={dbConnected} gameState={gameState} />;
  }

  if (isSituation) {
    const sitIdx = gameState.status === "situation_1" ? 0 : 1;
    const sit = situations[sitIdx];
    return (
      <div className="minigame-panel player-panel-md">
        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <IconBolt className="w-12 h-12 mx-auto text-red-500 animate-pulse" />
          <h2 style={{ color: "var(--neon-red)", fontSize: "1.3rem", fontWeight: "bold", margin: "8px 0" }}>TÌNH HUỐNG {sitIdx + 1}</h2>
          <p style={{ color: "var(--neon-gold)", fontSize: "0.9rem" }}>{sit.title}</p>
        </div>
        <div className="situation-box" style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>{sit.story}</div>
        {!hasVoted ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "25px" }}>
            <button className="option-button" onClick={() => handleVote("A")} style={{ padding: "16px 20px", fontSize: "1rem", textAlign: "left", cursor: "pointer", border: "1px solid rgba(21, 101, 192, 0.3)" }}><span className="option-prefix" style={{ color: "var(--neon-blue)" }}>A.</span> {sit.optionA.label}</button>
            <button className="option-button" onClick={() => handleVote("B")} style={{ padding: "16px 20px", fontSize: "1rem", textAlign: "left", cursor: "pointer", border: "1px solid rgba(46, 125, 50, 0.3)" }}><span className="option-prefix" style={{ color: "var(--neon-green)" }}>B.</span> {sit.optionB.label}</button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "30px 20px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", marginTop: "25px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)" }}>
            <IconCheck className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
            <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: selectedVote === "A" ? "var(--neon-blue)" : "var(--neon-green)" }}>Bạn đã chọn: {selectedVote}</div>
            <p style={{ color: "#8b8680", fontSize: "0.85rem", marginTop: "10px" }}>Nhìn lên máy chiếu để xem kết quả biểu quyết của cả lớp...</p>
          </div>
        )}
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", color: "#8b8680", fontSize: "0.85rem", padding: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", fontVariantNumeric: "tabular-nums" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><IconUser className="w-4 h-4 text-slate-400" /> {playerName}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><IconLeaf className="w-4 h-4 text-emerald-500" /> <span className="pix-num">UT {integrity}</span></span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><IconTrophy className="w-4 h-4 text-yellow-500" /> <span className="pix-num">{playerInfo.score || 0}</span></span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><IconCrown className="w-4 h-4 text-amber-500" /> <span className="pix-num">#{getPlayerRank()}</span></span>
        </div>
      </div>
    );
  }

  if (gameState.status === "finished") {
    const finalRank = getPlayerRank();
    let badgeText = "CẦN CỦNG CỐ TRÁCH NHIỆM";
    let badgeColor = "var(--neon-red)";
    let badgeIcon = <IconWarning className="w-4 h-4 mr-1 inline-block" />;

    if (finalRank === 1) {
      badgeText = "CÁN BỘ LIÊM CHÍNH TIÊU BIỂU";
      badgeColor = "var(--neon-gold)";
      badgeIcon = <IconCrown className="w-4 h-4 mr-1 inline-block" />;
    } else if (finalRank <= 3) {
      badgeText = "GƯƠNG PHỤC VỤ NHÂN DÂN";
      badgeColor = "var(--neon-blue)";
      badgeIcon = <IconTrophy className="w-4 h-4 mr-1 inline-block" />;
    } else if (integrity >= 95) {
      badgeText = "GIỮ VỮNG NGUYÊN TẮC";
      badgeColor = "var(--neon-green)";
      badgeIcon = <IconLeaf className="w-4 h-4 mr-1 inline-block" />;
    } else if (playerInfo.completedFinalMission || playerInfo.phaseTwoQualified) {
      badgeText = "HOÀN THÀNH XUẤT SẮC NHIỆM VỤ";
      badgeColor = "#e1dbd6";
      badgeIcon = <IconUser className="w-4 h-4 mr-1 inline-block" />;
    }

    return (
      <div className="minigame-panel player-panel-sm" style={{ textAlign: "center" }}>
        <IconTrophy className="w-16 h-16 text-yellow-500 animate-pulse mx-auto" />
        <h2 className="minigame-title" style={{ fontSize: "1.8rem" }}>HOÀN THÀNH NHIỆM VỤ</h2>
        <p className="minigame-subtitle" style={{ fontSize: "1rem", marginBottom: "30px" }}>Kết quả công vụ của cán bộ {playerName}</p>
        <div style={{ border: `1px solid ${badgeColor}`, display: "inline-flex", alignItems: "center", padding: "8px 15px", borderRadius: "9999px", color: badgeColor, fontWeight: "bold", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "30px", background: "rgba(255,255,255,0.01)" }}>{badgeIcon} {badgeText}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", padding: "20px", borderRadius: "16px", marginBottom: "30px", fontVariantNumeric: "tabular-nums", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#8b8680" }}>Vị trí xếp hạng:</span><strong className="pix-num" style={{ color: "var(--neon-gold)", fontSize: "1.1rem" }}>#{finalRank} / {totalPlayersCount}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#8b8680" }}>Điểm công vụ:</span><strong style={{ color: "var(--neon-blue)", fontSize: "1.1rem" }}><span className="pix-num">{playerInfo.score || 0}</span></strong></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#8b8680" }}>Uy tín:</span><strong className="pix-num" style={{ color: integrity >= 60 ? "var(--neon-green)" : "var(--neon-red)", fontSize: "1.1rem" }}>{integrity} - {getIntegrityStatus(integrity)}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#8b8680" }}>Niềm tin nhân dân:</span><strong className="pix-num" style={{ color: publicTrust >= 60 ? "var(--neon-gold)" : "var(--neon-red)", fontSize: "1.1rem" }}>{publicTrust}%</strong></div>
        </div>
        <div className="mission-card" style={{ textAlign: "left", marginBottom: "24px" }}>
          <div className="mission-label">BÀI HỌC CỦA BẠN</div>
          <div className="mission-text">{getLearningResult()}</div>
        </div>
        <p style={{ color: "#8b8680", fontSize: "0.85rem", lineHeight: "1.5" }}>Cảm ơn bạn đã tham gia! Hãy lắng nghe MC tổng kết bài học chung.</p>
      </div>
    );
  }

  return null;
};

export default PlayerView;
