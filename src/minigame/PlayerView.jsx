import React, { useEffect, useState, useMemo } from "react";
import { ref, set, onValue, runTransaction } from "firebase/database";
import { db } from "./firebaseConfig";
import { RpgGamePlay } from "./RpgGamePlay";
import { CHARACTER_OPTIONS, getCharacterOption } from "./characterOptions";
import { PixelAvatarPreview } from "./PixelAvatarPreview";
import { getPolicyCycle } from "./policyCycles";
import {
  IconPhone,
  IconLeaf,
  IconWarning,
  IconFlame,
  IconTrophy,
  IconCrown,
  IconUser,
  IconCheck,
  IconRefresh,
  IconBulb
} from "./icons";

export const PlayerView = ({
  playerId,
  playerName,
  setPlayerName,
  gameState = {},
  dbConnected = false,
  onResetRole
}) => {
  const [tempName, setTempName] = useState(playerName);
  const [selectedCharacterId, setSelectedCharacterId] = useState(() =>
    localStorage.getItem("minigame_character_id") || "doan_xa_agriculture"
  );
  const [isJoined, setIsJoined] = useState(false);
  const [playerInfo, setPlayerInfo] = useState({ score: 0, status: "active" });
  const [players, setPlayers] = useState({});
  const [myDecision, setMyDecision] = useState(null);

  const currentPhaseId = gameState.phaseId || gameState.status;
  const isRpgPhase = ["phase_1", "phase_2", "phase_3", "phase_4"].includes(gameState.status);
  const isResolved = gameState.phaseStatus === "resolved";
  const isFinished = gameState.status === "finished";

  // Listen to players
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

  // Listen to player's decision in current phase
  useEffect(() => {
    if (!currentPhaseId || !playerId) return;
    const unsub = onValue(ref(db, `decisions/${currentPhaseId}/${playerId}`), (snap) => {
      setMyDecision(snap.val() || null);
    });
    return () => unsub();
  }, [currentPhaseId, playerId]);

  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    const cleanName = tempName.trim().substring(0, 15);
    const selectedChar = getCharacterOption(selectedCharacterId);

    setPlayerName(cleanName);
    localStorage.setItem("minigame_player_name", cleanName);
    localStorage.setItem("minigame_character_id", selectedChar.id);

    await set(ref(db, `players/${playerId}`), {
      name: cleanName,
      character: selectedChar.id,
      roleId: selectedChar.id,
      color: selectedChar.color,
      score: 0,
      status: "active",
      taskProgress: { phase_1: false, phase_2: false, phase_3: false, phase_4: false },
      submitted: { phase_1: false, phase_2: false, phase_3: false, phase_4: false },
      joinedAt: Date.now(),
    });
    setIsJoined(true);
  };

  const handleSubmitDecision = async (payload) => {
    if (!currentPhaseId || isResolved) return;
    try {
      const decisionResult = await runTransaction(
        ref(db, `decisions/${currentPhaseId}/${playerId}`),
        (existingDecision) => existingDecision || payload
      );
      if (decisionResult.committed) {
        await set(ref(db, `players/${playerId}/submitted/${currentPhaseId}`), true);
      }
    } catch (err) {
      console.error("Lỗi gửi quyết định:", err);
    }
  };

  const currentCharacter = getCharacterOption(playerInfo.roleId || playerInfo.character || selectedCharacterId);
  const totalPlayersCount = Object.keys(players).length;

  const sortedPlayers = useMemo(
    () =>
      Object.entries(players || {})
        .map(([id, p]) => ({ id, ...p }))
        .sort((a, b) => (b.score || 0) - (a.score || 0)),
    [players]
  );

  const getPlayerRank = () => {
    const rank = sortedPlayers.findIndex((p) => p.id === playerId);
    return rank !== -1 ? rank + 1 : "-";
  };

  // MÀN HÌNH 1: NHẬN NHIỆM VỤ (JOIN LOBBY)
  if (!isJoined) {
    return (
      <div className="minigame-panel player-panel-md">
        <h2 className="minigame-title" style={{ fontSize: "1.8rem" }}>NHẬN NHIỆM VỤ</h2>
        <p className="minigame-subtitle" style={{ fontSize: "1rem", marginBottom: "25px" }}>
          Nhập vai lực lượng thực tiễn 1978–1981, tìm đường tháo gỡ khủng hoảng kinh tế
        </p>

        <form onSubmit={handleJoinGame} className="join-form">
          <div className="input-group">
            <label className="input-label">Nhập tên / Biệt danh:</label>
            <input
              type="text"
              className="game-input"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Ví dụ: Minh Anh"
              maxLength={15}
              required
            />
          </div>

          <div className="input-group" style={{ marginTop: "20px" }}>
            <label className="input-label">Chọn vai trò mô phỏng:</label>
            <div className="character-grid">
              {CHARACTER_OPTIONS.map((char) => {
                const isSelected = selectedCharacterId === char.id;
                return (
                  <div
                    key={char.id}
                    className={`character-option ${isSelected ? "selected" : ""}`}
                    style={{
                      "--character-color": char.color,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "10px 8px",
                      cursor: "pointer",
                      border: isSelected ? `2px solid ${char.color}` : "1px solid rgba(255,255,255,0.1)",
                      background: isSelected ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.6)",
                      borderRadius: "12px",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => setSelectedCharacterId(char.id)}
                  >
                    <PixelAvatarPreview character={char} size={50} />
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
                      <span className="character-name" style={{ fontSize: "0.82rem", fontWeight: "700", color: "#fff" }}>
                        {char.label}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--neon-gold)", fontWeight: "600", marginTop: "2px", textAlign: "center" }}>
                      {char.title}
                    </div>
                    <div
                      className="character-desc"
                      style={{ fontSize: "0.68rem", color: "#94a3b8", textAlign: "center", marginTop: "4px", lineHeight: "1.3" }}
                    >
                      {char.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button type="submit" className="btn-cyber btn-cyber-blue" style={{ marginTop: "20px", width: "100%" }}>
            Tham gia ngay
          </button>
        </form>

        <button
          onClick={onResetRole}
          style={{
            background: "none",
            border: "none",
            color: "#8b8680",
            marginTop: "20px",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          Quay lại chọn vai trò
        </button>
      </div>
    );
  }

  // MÀN HÌNH 2: PHÒNG CHỜ (WAITING)
  if (gameState.status === "waiting") {
    return (
      <div className="minigame-panel player-panel-md" style={{ maxWidth: "720px", margin: "0 auto", padding: "24px" }}>
        {/* Top Info */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "16px", marginBottom: "18px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
            <PixelAvatarPreview character={currentCharacter} size={70} />
          </div>
          <h2 className="minigame-title" style={{ fontSize: "1.6rem", margin: "0 0 4px 0" }}>ĐÃ VÀO PHÒNG CHỜ</h2>
          <div style={{ color: "var(--neon-gold)", fontWeight: "700", fontSize: "1.05rem", marginBottom: "8px" }}>
            Xin chào đồng chí <span style={{ color: "#fff", textDecoration: "underline" }}>{playerName}</span>!
          </div>

          <div
            className="selected-character-badge"
            style={{
              "--character-color": currentCharacter.color,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 16px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.06)",
              border: `1.5px solid ${currentCharacter.color}`,
              fontSize: "0.88rem",
            }}
          >
            <span>{currentCharacter.icon} <strong>{currentCharacter.label}</strong> — {currentCharacter.title}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", padding: "6px 14px", borderRadius: "20px", fontSize: "0.82rem", color: "#38bdf8" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 8px #38bdf8", animation: "pulse 1.5s infinite" }} />
            ĐÃ KẾT NỐI • Tổng số người chơi trong phòng: <strong style={{ color: "#fff", fontSize: "0.95rem" }}>{totalPlayersCount}</strong>
          </div>
        </div>

        {/* BẢNG HƯỚNG DẪN CHI TIẾT TRONG PHÒNG CHỜ */}
        <div style={{ background: "rgba(15, 23, 42, 0.75)", border: "1.5px solid rgba(245, 158, 11, 0.4)", borderRadius: "14px", padding: "18px", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--neon-gold)", fontWeight: "800", fontSize: "1.05rem", marginBottom: "12px", borderBottom: "1px solid rgba(245, 158, 11, 0.2)", paddingBottom: "8px" }}>
            <span>📖</span> SỔ TAY HƯỚNG DẪN CÁN BỘ TIÊN PHONG (1978–1981)
          </div>

          {/* Điều khiển */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            <div style={{ background: "rgba(0,0,0,0.35)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "#38bdf8", fontWeight: "700", fontSize: "0.85rem", marginBottom: "4px" }}>💻 Trên Máy Tính:</div>
              <div style={{ fontSize: "0.8rem", color: "#cbd5e1", lineHeight: "1.4" }}>
                • Di chuyển: Phím <code style={{ background: "rgba(255,255,255,0.15)", padding: "1px 4px", borderRadius: "3px" }}>W, A, S, D</code> hoặc <code style={{ background: "rgba(255,255,255,0.15)", padding: "1px 4px", borderRadius: "3px" }}>Mũi Tên</code><br />
                • Tương tác / Khảo sát: Phím <code style={{ background: "rgba(255,255,255,0.15)", padding: "1px 4px", borderRadius: "3px" }}>Space</code> hoặc <code style={{ background: "rgba(255,255,255,0.15)", padding: "1px 4px", borderRadius: "3px" }}>E</code>
              </div>
            </div>

            <div style={{ background: "rgba(0,0,0,0.35)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "#f472b6", fontWeight: "700", fontSize: "0.85rem", marginBottom: "4px" }}>📱 Trên Điện Thoại:</div>
              <div style={{ fontSize: "0.8rem", color: "#cbd5e1", lineHeight: "1.4" }}>
                • Di chuyển: Dùng <strong style={{ color: "#38bdf8" }}>D-pad ảo</strong> ở góc trái màn hình<br />
                • Hành động: Nhấn nút đỏ <strong style={{ color: "#f87171" }}>⚡ KHẢO SÁT</strong> ở góc phải
              </div>
            </div>
          </div>

          {/* 5 Cách kiếm điểm */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ color: "#4ade80", fontWeight: "700", fontSize: "0.88rem" }}>⭐ CÁCH THỨC THỰC HIỆN NHIỆM VỤ & GHI ĐIỂM:</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px", fontSize: "0.8rem", color: "#e2e8f0" }}>
                <strong style={{ color: "#facc15" }}>1. Khảo sát thực địa (+5đ):</strong> Chạy đến <strong>Cột sáng vàng phát sáng 📍</strong> và bấm Khảo sát.
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px", fontSize: "0.8rem", color: "#e2e8f0" }}>
                <strong style={{ color: "#c084fc" }}>2. Đối thoại Lịch sử (+10đ):</strong> Gặp các nhân vật lịch sử để trả lời câu hỏi tình huống.
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px", fontSize: "0.8rem", color: "#e2e8f0" }}>
                <strong style={{ color: "#f472b6" }}>3. Trợ giúp Xã viên (+8đ):</strong> Cứu trợ người dân mang biểu tượng <strong style={{ color: "#f472b6" }}>🆘 CẦN GIÚP ❤️</strong>.
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px", fontSize: "0.8rem", color: "#e2e8f0" }}>
                <strong style={{ color: "#38bdf8" }}>4. Thu thập Tư liệu (+2đ - +10đ):</strong> Nhặt lúa khoán, cuộn sợi bông, kiện cứu trợ khẩn cấp.
              </div>
            </div>

            <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.35)", borderRadius: "8px", padding: "8px 10px", fontSize: "0.8rem", color: "#cbd5e1", marginTop: "2px" }}>
              <strong style={{ color: "#f87171" }}>❄️ Chú ý cạm bẫy:</strong> Né tránh các <strong>Bẫy đóng băng quan liêu ❄️</strong> trên đường (đóng băng 2.5s, <span style={{ color: "#f87171" }}>-3đ</span>).
            </div>
          </div>
        </div>

        <div style={{ color: "#94a3b8", fontSize: "0.85rem", textAlign: "center" }}>
          ⏳ Vui lòng nhìn lên màn hình chính máy chiếu. MC sẽ phát lệnh bắt đầu Phase 1 (Năm 1978)!
        </div>

        <div className="loading-dots" style={{ marginTop: "12px" }}>
          <span></span><span></span><span></span>
        </div>
      </div>
    );
  }

  // MÀN HÌNH 3: GAMEPLAY CHÍNH (RPG MAP + CONTROLS + DECISION MODAL)
  if (isRpgPhase) {
    return (
      <RpgGamePlay
        playerId={playerId}
        playerName={playerName}
        playerInfo={playerInfo}
        players={players}
        dbConnected={dbConnected}
        gameState={gameState}
        myDecision={myDecision}
        onSubmitDecision={handleSubmitDecision}
      />
    );
  }

  // MÀN HÌNH 4: TỔNG KẾT (FINISHED)
  if (isFinished) {
    const finalRank = getPlayerRank();
    let badgeText = "ĐỒNG HÀNH ĐỔI MỚI";
    let badgeColor = "var(--neon-gold)";
    let badgeIcon = <IconCrown className="w-4 h-4 mr-1 inline-block" />;

    if (finalRank === 1) {
      badgeText = "TIÊN PHONG ĐỔI MỚI XUẤT SẮC";
      badgeColor = "var(--neon-gold)";
      badgeIcon = <IconCrown className="w-4 h-4 mr-1 inline-block text-yellow-500" />;
    } else if (finalRank <= 3) {
      badgeText = "CÁN BỘ ĐỔI MỚI TIÊU BIỂU";
      badgeColor = "var(--neon-blue)";
      badgeIcon = <IconTrophy className="w-4 h-4 mr-1 inline-block text-cyan-400" />;
    }

    return (
      <div className="minigame-panel player-panel-sm" style={{ textAlign: "center" }}>
        <IconTrophy className="w-16 h-16 text-yellow-500 animate-pulse mx-auto" />
        <h2 className="minigame-title" style={{ fontSize: "1.8rem" }}>HOÀN THÀNH MÔ PHỎNG</h2>
        <p className="minigame-subtitle" style={{ fontSize: "1rem", marginBottom: "25px" }}>
          Kết quả 4 giai đoạn lịch sử của {playerName}
        </p>

        <div
          style={{
            border: `1px solid ${badgeColor}`,
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 15px",
            borderRadius: "9999px",
            color: badgeColor,
            fontWeight: "bold",
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "25px",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {badgeIcon} {badgeText}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            background: "rgba(255,255,255,0.01)",
            border: "1px solid rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "25px",
            fontVariantNumeric: "tabular-nums",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#8b8680" }}>Vị trí xếp hạng:</span>
            <strong className="pix-num" style={{ color: "var(--neon-gold)", fontSize: "1.1rem" }}>
              #{finalRank} / {totalPlayersCount}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#8b8680" }}>Tổng điểm tích lũy:</span>
            <strong style={{ color: "var(--neon-blue)", fontSize: "1.1rem" }}>
              <span className="pix-num">{playerInfo.score || 0}</span> điểm
            </strong>
          </div>
        </div>

        <div className="mission-card" style={{ textAlign: "left", marginBottom: "24px" }}>
          <div className="mission-label">Ý NGHĨA LỊCH SỬ</div>
          <div className="mission-text">
            Các sáng kiến thực tiễn từ cơ sở giai đoạn 1978–1981 (khoán Đoàn Xá, Kế hoạch 3 phần Dệt Thành Công, cải cách giá Long An) đã chứng minh sức sống của đổi mới, tạo tiền đề để Đảng chính thức khởi xướng đường lối Đổi Mới toàn diện tại Đại hội VI (1986).
          </div>
        </div>

        <button
          onClick={onResetRole}
          className="btn-cyber btn-cyber-blue"
          style={{ width: "100%", padding: "12px", fontSize: "0.95rem" }}
        >
          Quay lại phòng chờ
        </button>
      </div>
    );
  }

  return null;
};

export default PlayerView;
