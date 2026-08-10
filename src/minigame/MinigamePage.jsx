import React, { useState, useEffect } from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { db } from "./firebaseConfig";
import HostView from "./HostView";
import PlayerView from "./PlayerView";
import { normalizeGameState } from "./gameStateUtils";
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
  const [gameState, setGameState] = useState({
    status: "waiting", // waiting | phase_1 | situation_1 | phase_2 | situation_2 | phase_3 | finished
  });

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
        const normalized = normalizeGameState(data);
        setGameState(normalized);
        if (normalized.status !== data.status) {
          set(gameStateRef, normalized);
        }
      } else {
        // Khởi tạo trạng thái mặc định nếu database trống
        set(gameStateRef, { status: "waiting" });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectRole = async (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem("minigame_role", selectedRole);

    // Nếu chọn làm Host/MC, tự động reset game về trạng thái phòng chờ ban đầu để sẵn sàng đón người chơi mới
    if (selectedRole === "host") {
      try {
        // 1. Đưa trạng thái game về waiting trước để tất cả client unmount game ngay lập tức
        await set(ref(db, "gameState"), { status: "waiting" });
        
        // 2. Chờ một khoảng trễ ngắn (100ms) để các client kịp nhận tin, unmount và dừng ghi dữ liệu vị trí
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 3. Sau đó mới dọn dẹp sạch sẽ database
        await remove(ref(db, "votes"));
        await remove(ref(db, "books"));
        await remove(ref(db, "traps"));
        await remove(ref(db, "marketEvents"));
        await remove(ref(db, "players"));
      } catch (err) {
        console.error("Lỗi reset database khi chọn vai trò Host:", err);
      }
    }
  };

  const handleResetRole = () => {
    setRole(null);
    localStorage.removeItem("minigame_role");
  };

  // Màn hình chọn vai trò ban đầu
  if (!role) {
    return (
      <div className="minigame-container">
        <div className="minigame-panel role-selection">
          <h1 className="minigame-title">SINH TỒN TRÊN SÀN SỐ</h1>
          <p className="minigame-subtitle">Sự vận động của Cạnh tranh & Độc quyền trong Nền kinh tế số</p>
          
          <div className="role-buttons">
            <div className="role-card role-player group" onClick={() => handleSelectRole("player")}>
              <div className="role-icon transition-transform duration-300 group-hover:scale-110 text-cyan-400">
                <IconPhone className="w-16 h-16" />
              </div>
              <div className="role-name">Người Chơi</div>
              <div className="role-desc">Dành cho sinh viên cả lớp. Quét mã QR, nhập vai chủ shop handmade, di chuyển nhặt sách và né bẫy trên điện thoại.</div>
            </div>

            <div className="role-card role-host group" onClick={() => handleSelectRole("host")}>
              <div className="role-icon transition-transform duration-300 group-hover:scale-110 text-red-500">
                <IconDesktop className="w-16 h-16" />
              </div>
              <div className="role-name">Ban Tổ Chức (Host/MC)</div>
              <div className="role-desc">Dành cho nhóm thuyết trình. Quản lý trạng thái game, trình chiếu câu hỏi và bảng xếp hạng realtime lên máy chiếu.</div>
            </div>
          </div>

          <div style={{ marginTop: "30px", fontSize: "0.85rem", color: dbConnected ? "var(--neon-green)" : "var(--neon-red)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ 
              width: "8px", 
              height: "8px", 
              borderRadius: "50%", 
              background: dbConnected ? "var(--neon-green)" : "var(--neon-red)",
              boxShadow: dbConnected ? "0 0 10px var(--neon-green)" : "0 0 10px var(--neon-red)"
            }} />
            Trạng thái máy chủ: {dbConnected ? "ĐÃ KẾT NỐI (Realtime)" : "MẤT KẾT NỐI (Vui lòng cấu hình Firebase)"}
          </div>
        </div>
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
