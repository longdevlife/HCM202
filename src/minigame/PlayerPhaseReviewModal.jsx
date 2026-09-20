import React from "react";
import { getPolicyCycle } from "./policyCycles";

const EVALUATION_GUIDES = {
  phase_1: {
    opt_p1_toandien: {
      isWise: "wise",
      badge: "🌟 LỰA CHỌN RẤT SÁNG SUỐT & ĐÚNG ĐẮN",
      badgeColor: "#10b981",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeBorder: "rgba(16, 185, 129, 0.5)",
      title: "Tiếp cận CCXH toàn diện & Trọng tâm CCXH-GC",
      comment: "Tuyệt vời! Theo chủ nghĩa Mác - Lênin, cơ cấu xã hội - giai cấp giữ vị trí trung tâm, chi phối các cơ cấu khác (nghề nghiệp, dân cư, dân tộc, tôn giáo) vì gắn liền trực tiếp với quan hệ sản xuất và quyền lực chính trị. Lựa chọn của bạn giúp giữ vững định hướng XHCN và gắn kết xã hội vững chắc."
    },
    opt_p1_phiendien: {
      isWise: "unwise",
      badge: "⚠️ LỰA CHỌN CÒN PHIẾN DIỆN, THIẾU ĐỒNG BỘ",
      badgeColor: "#f59e0b",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      badgeBorder: "rgba(245, 158, 11, 0.5)",
      title: "Chỉ chú trọng cơ cấu kỹ thuật nghề nghiệp thuần túy",
      comment: "Cần lưu ý: Nếu chỉ chú trọng kỹ thuật nghề nghiệp mà xem nhẹ quan hệ giai cấp và phân phối lợi ích, xã hội sẽ đối mặt với nguy cơ bất bình đẳng, phân hóa giàu nghèo cực đoan và suy giảm gắn kết chính trị."
    }
  },
  phase_2: {
    opt_p2_haihoa: {
      isWise: "wise",
      badge: "🌟 LỰA CHỌN RẤT SÁNG SUỐT & TOÀN DIỆN",
      badgeColor: "#10b981",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeBorder: "rgba(16, 185, 129, 0.5)",
      title: "Hài hòa giai cấp & Đại đoàn kết toàn dân",
      comment: "Rất chuẩn xác! Cơ cấu xã hội - giai cấp giữ vị trí hàng đầu nhưng không thể tuyệt đối hóa một chiều. Tôn trọng bản sắc văn hóa dân tộc, tự do tín ngưỡng tôn giáo và phát huy sức mạnh đại đoàn kết toàn dân tộc chính là nguyên tắc sống còn của cách mạng Việt Nam."
    },
    opt_p2_tuyetdoi: {
      isWise: "unwise",
      badge: "⚠️ TUYỆT ĐỐI HÓA CỰC ĐOAN, THIẾU THỰC TIỄN",
      badgeColor: "#ef4444",
      badgeBg: "rgba(239, 68, 68, 0.15)",
      badgeBorder: "rgba(239, 68, 68, 0.5)",
      title: "Tuyệt đối hóa vai trò giai cấp một chiều",
      comment: "Cần rút kinh nghiệm: Việc tuyệt đối hóa yếu tố giai cấp một cách máy móc sẽ dẫn đến định kiến hẹp hòi, làm tổn thương tình cảm dân tộc, gây căng thẳng trong tôn giáo và làm suy yếu khối đại đoàn kết dân tộc."
    }
  },
  phase_3: {
    toan_dien_ben_vung: {
      isWise: "wise",
      badge: "🌟 LỰA CHỌN CHIẾN LƯỢC TỐI ƯU & BỀN VỮNG",
      badgeColor: "#10b981",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeBorder: "rgba(16, 185, 129, 0.5)",
      title: "Gói Liên Minh Toàn Diện & Phát Triển Bền Vững",
      comment: "Xuất sắc! Phương án này bảo đảm tỷ trọng nòng cốt của kinh tế nhà nước (P1 = 45% ≥ 40%) theo đúng định hướng XHCN, đồng thời kết hợp hài hòa nông nghiệp công nghệ cao (P2=35%) và kinh tế tri thức (P3=20%), củng cố khối liên minh Công - Nông - Trí thức."
    },
    uu_tien_nong_thon: {
      isWise: "neutral",
      badge: "🌾 LỰA CHỌN AN TOÀN NHƯNG CHẬM CHUYỂN DỊCH",
      badgeColor: "#f59e0b",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      badgeBorder: "rgba(245, 158, 11, 0.5)",
      title: "Gói Ưu Tiên Nông Nghiệp & Nông Thôn Chiến Lược",
      comment: "Phương án này giữ vững an ninh lương thực và ổn định địa bàn nông thôn (P1=60%), tuy nhiên tỷ trọng dành cho kinh tế tri thức và doanh nhân còn thấp, khiến tốc độ công nghiệp hóa - hiện đại hóa đất nước bị chậm lại."
    },
    dot_pha_tri_thuc: {
      isWise: "unwise",
      badge: "⚠️ SUY GIẢM VAI TRÒ NÒNG CỐT NHÀ NƯỚC",
      badgeColor: "#ef4444",
      badgeBg: "rgba(239, 68, 68, 0.15)",
      badgeBorder: "rgba(239, 68, 68, 0.5)",
      title: "Gói Đột Phá Kinh Tế Tri Thức & Doanh Nhân Năng Động",
      comment: "Cảnh báo chính sách: Gói này hạ tỷ trọng trụ cột nhà nước xuống P1 = 30% (< 40%), làm suy giảm vai trò chủ đạo của kinh tế nhà nước trong liên minh công - nông - trí thức, dễ dẫn đến mất kiểm soát vĩ mô và chênh lệch phân hóa giai tầng."
    }
  }
};

export const PlayerPhaseReviewModal = ({
  phaseId,
  playerInfo = {},
  myDecision = null,
  currentResult = null,
  sortedPlayers = [],
  playerId,
  playerRank,
  phaseEndsAt = null,
}) => {
  const cycle = getPolicyCycle(phaseId);
  const decisionOptionId = myDecision?.optionId || currentResult?.winningOptionId;
  const isAutoSubmitted = Boolean(myDecision?.autoSubmitted);

  const phaseEvaluations = EVALUATION_GUIDES[phaseId] || {};
  const evalData = phaseEvaluations[decisionOptionId] || {
    isWise: "neutral",
    badge: "📜 ĐÃ GHI NHẬN PHIẾU QUYẾT ĐỊNH",
    badgeColor: "#38bdf8",
    badgeBg: "rgba(56, 189, 248, 0.15)",
    badgeBorder: "rgba(56, 189, 248, 0.5)",
    title: myDecision?.optionTitle || "Chính sách chiến lược",
    comment: "Quyết định của bạn đã được tổng hợp vào kết quả vĩ mô của toàn thể đại biểu hội nghị."
  };

  const scoreDelta = playerInfo.lastScoreDelta !== undefined ? playerInfo.lastScoreDelta : (evalData.isWise === "wise" ? 25 : 15);
  const totalScore = playerInfo.score || 0;

  // Compact top 5 players + current player if outside top 5
  const topPlayers = sortedPlayers.slice(0, 5);
  const isPlayerInTop5 = topPlayers.some((p) => p.id === playerId);
  const currentPlayerObj = sortedPlayers.find((p) => p.id === playerId);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(3, 7, 18, 0.88)",
        backdropFilter: "blur(10px)",
        zIndex: 120,
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
          maxWidth: "680px",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 30, 0.99) 100%)",
          border: "2px solid rgba(250, 204, 21, 0.6)",
          borderRadius: "18px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(245, 158, 11, 0.2)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          color: "#f8fafc",
          position: "relative",
        }}
      >
        {/* Header: Title & Phase Badge */}
        <div
          style={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            paddingBottom: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "1rem" }}>🏛️</span>
              <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--neon-gold)", textTransform: "uppercase", letterSpacing: "1px" }}>
                TỔNG KẾT GIAI ĐOẠN {cycle.year}
              </span>
            </div>
            <h2 style={{ margin: "2px 0 0", fontSize: "1.15rem", fontWeight: "800", color: "#ffffff" }}>
              {cycle.title}
            </h2>
          </div>

          <div
            style={{
              background: "rgba(16, 185, 129, 0.2)",
              border: "1px solid rgba(16, 185, 129, 0.6)",
              borderRadius: "20px",
              padding: "4px 12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.78rem",
              fontWeight: "bold",
              color: "#34d399",
            }}
          >
            <span>✓</span>
            <span>HOST ĐÃ CHỐT PHASE</span>
          </div>
        </div>

        {/* Section 1: Đánh giá Lựa chọn của Người chơi (Có sáng suốt không?) */}
        <div
          style={{
            background: evalData.badgeBg,
            border: `1.5px solid ${evalData.badgeBorder}`,
            borderRadius: "14px",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: "800",
                color: evalData.badgeColor,
                letterSpacing: "0.5px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {evalData.badge}
            </span>

            <span
              className="pix-num"
              style={{
                fontSize: "1.05rem",
                fontWeight: "800",
                color: scoreDelta >= 0 ? "#4ade80" : "#f87171",
                background: "rgba(0,0,0,0.4)",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} điểm
            </span>
          </div>

          <div style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#ffffff" }}>
            Phương án của bạn: <span style={{ color: "#fde047" }}>{evalData.title}</span>
            {isAutoSubmitted && (
              <span style={{ fontSize: "0.72rem", color: "#fca5a5", marginLeft: "6px" }}>
                (Hết giờ - Tự động chốt)
              </span>
            )}
          </div>

          <div style={{ fontSize: "0.82rem", color: "#e2e8f0", lineHeight: 1.5, background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "8px" }}>
            {evalData.comment}
          </div>

          {playerInfo.lastExplanation && (
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontStyle: "italic" }}>
              💡 Chi tiết: {playerInfo.lastExplanation}
            </div>
          )}
        </div>

        {/* Section 2: Tổng quan Điểm & Thứ hạng cá nhân */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          {/* Card Tổng Điểm */}
          <div
            style={{
              background: "rgba(30, 41, 59, 0.7)",
              border: "1px solid rgba(250, 204, 21, 0.3)",
              borderRadius: "12px",
              padding: "12px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: "bold" }}>
              TỔNG ĐIỂM CỦA BẠN
            </div>
            <div
              className="pix-num"
              style={{
                fontSize: "1.8rem",
                fontWeight: "900",
                color: "var(--neon-gold)",
                margin: "2px 0",
              }}
            >
              {totalScore}
              <span style={{ fontSize: "1rem", marginLeft: "4px" }}>đ</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#34d399", fontWeight: "bold" }}>
              +{scoreDelta >= 0 ? scoreDelta : 0}đ vừa nhận ở chặng này
            </div>
          </div>

          {/* Card Thứ Hạng */}
          <div
            style={{
              background: "rgba(30, 41, 59, 0.7)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "12px",
              padding: "12px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: "bold" }}>
              VỊ TRÍ XẾP HẠNG
            </div>
            <div
              className="pix-num"
              style={{
                fontSize: "1.8rem",
                fontWeight: "900",
                color: playerRank === 1 ? "#facc15" : (playerRank === 2 ? "#e2e8f0" : (playerRank === 3 ? "#d97706" : "#38bdf8")),
                margin: "2px 0",
              }}
            >
              #{playerRank}
              <span style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: "normal", marginLeft: "4px" }}>
                / {sortedPlayers.length}
              </span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#cbd5e1" }}>
              {playerRank <= 3 ? "🏆 Trong Top Xuất Sắc Nhất" : "💪 Tiếp tục bứt phá ở chặng sau"}
            </div>
          </div>
        </div>

        {/* Section 3: Bảng xếp hạng Gọn gàng (Compact Leaderboard) */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.78rem",
              fontWeight: "800",
              color: "#38bdf8",
              textTransform: "uppercase",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              paddingBottom: "6px",
            }}
          >
            <span>🏆 BẢNG XẾP HẠNG TOÀN DIỆN</span>
            <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>Điểm</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "150px", overflowY: "auto" }}>
            {topPlayers.map((p, idx) => {
              const isMe = p.id === playerId;
              const medals = ["🥇", "🥈", "🥉"];
              const rankIcon = medals[idx] || `#${idx + 1}`;

              return (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: isMe ? "rgba(245, 158, 11, 0.22)" : "rgba(0, 0, 0, 0.35)",
                    border: isMe ? "1.5px solid rgba(245, 158, 11, 0.7)" : "1px solid transparent",
                    borderRadius: "8px",
                    padding: "6px 10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <span style={{ width: "22px", fontSize: idx < 3 ? "1rem" : "0.82rem", fontWeight: "bold", textAlign: "center", color: "#94a3b8" }}>
                      {rankIcon}
                    </span>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: isMe ? "bold" : "normal",
                        color: isMe ? "#fde047" : "#f8fafc",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.name || p.id} {isMe && <span style={{ color: "#34d399", fontSize: "0.72rem" }}>(Bạn)</span>}
                    </span>
                  </div>

                  <span className="pix-num" style={{ fontSize: "0.9rem", fontWeight: "bold", color: "var(--neon-gold)" }}>
                    {p.score || 0}đ
                  </span>
                </div>
              );
            })}

            {/* If current player is NOT in top 5, show a pinned row for them */}
            {!isPlayerInTop5 && currentPlayerObj && (
              <>
                <div style={{ textAlign: "center", color: "#64748b", fontSize: "0.7rem", lineHeight: 1 }}>•••</div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(245, 158, 11, 0.22)",
                    border: "1.5px solid rgba(245, 158, 11, 0.7)",
                    borderRadius: "8px",
                    padding: "6px 10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <span style={{ width: "22px", fontSize: "0.82rem", fontWeight: "bold", textAlign: "center", color: "#facc15" }}>
                      #{playerRank}
                    </span>
                    <span style={{ fontSize: "0.82rem", fontWeight: "bold", color: "#fde047" }}>
                      {currentPlayerObj.name || currentPlayerObj.id} <span style={{ color: "#34d399", fontSize: "0.72rem" }}>(Bạn)</span>
                    </span>
                  </div>

                  <span className="pix-num" style={{ fontSize: "0.9rem", fontWeight: "bold", color: "var(--neon-gold)" }}>
                    {currentPlayerObj.score || 0}đ
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 4: Trạng thái chờ Host chuyển Phase (Tự động chuyển màn) */}
        <div
          style={{
            background: "rgba(14, 165, 233, 0.12)",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            borderRadius: "12px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>⏳</span>
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: "800", color: "#38bdf8" }}>
              ĐANG CHỜ BAN TỔ CHỨC (HOST) CHUYỂN SANG CHẶNG TIẾP THEO...
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>
              Màn hình sẽ tự động chuyển sang chặng mới ngay khi Host kích hoạt. Nhạc nền sẽ tự động phát lại!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPhaseReviewModal;
