import React, { useState, useEffect } from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { db } from "./firebaseConfig";
import HostView from "./HostView";
import PlayerView from "./PlayerView";
import { createInitialPolicyState } from "./policyStateUtils";
import "./minigame.css";
import "./pixel-ui.css";

import { IconPhone, IconDesktop } from "./icons";

export const MinigamePage = () => {
  // Vai trò: 'host' | 'player' | null
  const [role, setRole] = useState(() => {
    return localStorage.getItem("minigame_role") || null;
  });

  const [playerId, setPlayerId] = useState(() => {
    let id = localStorage.getItem("minigame_player_id");
    if (!id) {
      id = "player_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("minigame_player_id", id);
    }
    return id;
  });

  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem("minigame_player_name") || "";
  });

  const [dbConnected, setDbConnected] = useState(false);
  const [gameState, setGameState] = useState(() => createInitialPolicyState());

  // Kiểm tra kết nối Firebase Realtime Database
  useEffect(() => {
    const connectedRef = ref(db, ".info/connected");
    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        setDbConnected(true);
      } else {
        setDbConnected(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Lắng nghe trạng thái game toàn cục từ Firebase
  useEffect(() => {
    const gameStateRef = ref(db, "gameState");
    const unsubscribe = onValue(gameStateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
      } else {
        set(gameStateRef, createInitialPolicyState());
      }
    });

    return () => unsubscribe();
  }, []);

  const [showHostAuthModal, setShowHostAuthModal] = useState(false);
  const [hostPasswordInput, setHostPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const handleSelectRole = async (selectedRole) => {
    if (selectedRole === "host") {
      setShowHostAuthModal(true);
      setHostPasswordInput("");
      setAuthError("");
      return;
    }

    setRole("player");
    localStorage.setItem("minigame_role", "player");
  };

  const handleConfirmHostAuth = async (e) => {
    e?.preventDefault();
    if (hostPasswordInput.trim().toLowerCase() === "host") {
      setShowHostAuthModal(false);
      setAuthError("");
      setRole("host");
      localStorage.setItem("minigame_role", "host");

      try {
        await set(ref(db, "gameState"), createInitialPolicyState());
        await new Promise((resolve) => setTimeout(resolve, 100));
        await remove(ref(db, "decisions"));
        await remove(ref(db, "positions"));
        await remove(ref(db, "players"));
      } catch (err) {
        console.error("Lỗi reset database khi chọn vai trò Host:", err);
      }
    } else {
      setAuthError("Mật khẩu không chính xác!");
    }
  };

  const handleResetRole = () => {
    setRole(null);
    localStorage.removeItem("minigame_role");
  };

  // Màn hình chọn vai trò ban đầu (Role Selection)
  if (!role) {
    return (
      <div className="minigame-container">
        <div className="minigame-panel role-selection">
          <h1 className="minigame-title">MÔ PHỎNG QUYẾT ĐỊNH CHÍNH SÁCH</h1>
          <p className="minigame-subtitle">Hành trình tháo gỡ khủng hoảng kinh tế & đổi mới thể chế (1978–1981)</p>

          <div className="role-buttons">
            <div className="role-card role-player group" onClick={() => handleSelectRole("player")}>
              <div className="role-icon transition-transform duration-300 group-hover:scale-110 text-cyan-400">
                <IconPhone className="w-16 h-16" />
              </div>
              <div className="role-name">Người Chơi</div>
              <div className="role-desc">
                Dành cho sinh viên cả lớp. Quét mã QR, nhập vai lực lượng thực tiễn (Đoàn Xá, Bà Thi, Dệt Thành Công, Long An), khảo sát thực địa và đưa ra quyết định chính sách.
              </div>
            </div>

            <div className="role-card role-host group" onClick={() => handleSelectRole("host")}>
              <div className="role-icon transition-transform duration-300 group-hover:scale-110 text-red-500">
                <IconDesktop className="w-16 h-16" />
              </div>
              <div className="role-name">Ban Tổ Chức (Host/MC) 🔒</div>
              <div className="role-desc">
                Dành cho nhóm thuyết trình (Cần nhập mật khẩu). Chiếu màn hình lớn, điều phối 4 giai đoạn lịch sử 1978–1981, theo dõi mô hình vĩ mô và bảng xếp hạng realtime.
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "30px",
              fontSize: "0.85rem",
              color: dbConnected ? "var(--neon-green)" : "var(--neon-red)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: dbConnected ? "var(--neon-green)" : "var(--neon-red)",
                boxShadow: dbConnected ? "0 0 10px var(--neon-green)" : "0 0 10px var(--neon-red)",
              }}
            />
            Trạng thái máy chủ: {dbConnected ? "ĐÃ KẾT NỐI (Realtime Firebase)" : "ĐANG KẾT NỐI (Vui lòng kiểm tra Firebase)..."}
          </div>
        </div>

        {/* MODAL NHẬP MẬT KHẨU HOST */}
        {showHostAuthModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <div
              className="minigame-panel"
              style={{
                width: "100%",
                maxWidth: "440px",
                padding: "24px",
                borderRadius: "16px",
                border: "2px solid #ef4444",
                boxShadow: "0 0 40px rgba(239, 68, 68, 0.4)",
                background: "#0f172a",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2.2rem", marginBottom: "8px" }}>🔐</div>
              <h3 style={{ margin: "0 0 6px 0", color: "#f87171", fontSize: "1.25rem", fontWeight: "800" }}>
                XÁC THỰC QUYỀN HOST / MC
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 18px 0", lineHeight: "1.4" }}>
                Vui lòng nhập mật khẩu quản trị viên để vào phòng điều khiển và kích hoạt máy chiếu.
              </p>

              <form onSubmit={handleConfirmHostAuth}>
                <input
                  type="password"
                  value={hostPasswordInput}
                  onChange={(e) => {
                    setHostPasswordInput(e.target.value);
                    if (authError) setAuthError("");
                  }}
                  placeholder="Nhập mật khẩu"
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "rgba(0,0,0,0.6)",
                    border: authError ? "2px solid #ef4444" : "1px solid #38bdf8",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "1rem",
                    textAlign: "center",
                    outline: "none",
                    boxSizing: "border-box",
                    marginBottom: "10px",
                  }}
                />

                {authError && (
                  <div style={{ color: "#ef4444", fontSize: "0.82rem", fontWeight: "bold", marginBottom: "14px" }}>
                    ❌ {authError}
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowHostAuthModal(false);
                      setAuthError("");
                    }}
                    className="btn-cyber"
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#cbd5e1",
                    }}
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="submit"
                    className="btn-cyber btn-cyber-red"
                    style={{
                      flex: 1,
                      padding: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    XÁC NHẬN 🚀
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="minigame-container">
      {role === "host" ? (
        <HostView
          gameState={gameState}
          dbConnected={dbConnected}
          onResetRole={handleResetRole}
        />
      ) : (
        <PlayerView
          playerId={playerId}
          playerName={playerName}
          setPlayerName={setPlayerName}
          gameState={gameState}
          dbConnected={dbConnected}
          onResetRole={handleResetRole}
        />
      )}
    </div>
  );
};

export default MinigamePage;
