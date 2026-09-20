import React from "react";

export function PixelAvatarPreview({ character, size = 64, animated = true }) {
  const char = character || {};
  const gender = char.gender || "male";
  const color = char.color || "#0284c7";
  const accentColor = char.accentColor || "#38bdf8";
  const hairColor = char.hairColor || "#331800";
  const hairStyle = char.hairStyle || (gender === "female" ? "ponytail" : "side_part");

  const roleId = char.id || "worker_leader";
  const isWorker = roleId === "worker_leader" || roleId === "det_thanh_cong_industry";
  const isFarmer = roleId === "farmer_strategic" || roleId === "doan_xa_agriculture";
  const isIntellectual = roleId === "intellectual_core" || roleId === "ba_thi_distribution";
  const isEntrepreneur = roleId === "entrepreneur_dynamic" || roleId === "long_an_policy";

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size * 1.25}px`,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        imageRendering: "pixelated",
      }}
    >
      <svg
        viewBox="0 0 32 40"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
        shapeRendering="crispEdges"
      >
        {/* Ground Shadow */}
        <ellipse cx="16" cy="37" rx="10" ry="2.5" fill="rgba(0,0,0,0.35)" />

        {/* Legs & Shoes */}
        <rect x="10" y="32" width="4" height="5" fill="#0f172a" />
        <rect x="18" y="32" width="4" height="5" fill="#0f172a" />

        {/* Pants / Lower Attire */}
        {isFarmer ? (
          <rect x="10" y="26" width="12" height="7" fill="#334155" />
        ) : isWorker ? (
          <rect x="10" y="26" width="12" height="7" fill="#1e3a8a" />
        ) : isEntrepreneur ? (
          <rect x="10" y="26" width="12" height="7" fill="#0f172a" />
        ) : (
          <rect x="10" y="26" width="12" height="7" fill="#1e293b" />
        )}
        <line x1="16" y1="28" x2="16" y2="33" stroke="#0f172a" strokeWidth="1" />

        {/* Torso / Clothes by Class */}
        {isWorker && (
          <>
            {/* Worker Blue Dungarees / Jumpsuit */}
            <rect x="8" y="16" width="16" height="11" fill="#0284c7" />
            {/* Reflective Neon Stripe */}
            <rect x="8" y="21" width="16" height="2" fill="#facc15" />
            {/* Tool Chest Pocket */}
            <rect x="10" y="17" width="4" height="3" fill="#0369a1" />
          </>
        )}

        {isFarmer && (
          <>
            {/* Farmer Bà Ba Shirt (Green/Brown) */}
            <rect x="8" y="16" width="16" height="11" fill="#15803d" />
            {/* Nam Bo Checkered Scarf (Khăn Rằn) */}
            <rect x="13" y="16" width="6" height="8" fill="#f1f5f9" />
            <line x1="14" y1="16" x2="14" y2="24" stroke="#ef4444" strokeWidth="1" />
            <line x1="17" y1="16" x2="17" y2="24" stroke="#ef4444" strokeWidth="1" />
          </>
        )}

        {isIntellectual && (
          <>
            {/* Intellectual Smart Violet Blazer / Lab Coat */}
            <rect x="8" y="16" width="16" height="11" fill="#6d28d9" />
            <polygon points="13,16 19,16 16,21" fill="#ffffff" />
            {/* Dark Blue Tie */}
            <polygon points="15.5,18 16.5,18 17,24 15,24" fill="#38bdf8" />
            {/* Pen in pocket */}
            <rect x="10" y="18" width="1" height="3" fill="#facc15" />
          </>
        )}

        {isEntrepreneur && (
          <>
            {/* Modern Tailored Suit (Charcoal Navy + Amber Accent) */}
            <rect x="8" y="16" width="16" height="11" fill="#1e293b" />
            <polygon points="12,16 20,16 16,22" fill="#ffffff" />
            {/* Golden Amber Silk Tie */}
            <polygon points="15.5,18 16.5,18 17,25 15,25" fill="#f59e0b" />
            {/* Gold Lapel Badge */}
            <rect x="9" y="18" width="2" height="2" fill="#facc15" />
          </>
        )}

        {!isWorker && !isFarmer && !isIntellectual && !isEntrepreneur && (
          <>
            <rect x="8" y="16" width="16" height="11" fill={color} />
            <polygon points="13,16 19,16 16,21" fill="#ffffff" />
          </>
        )}

        {/* Arms */}
        <rect x="5" y="17" width="3" height="8" fill={isWorker ? "#0284c7" : isFarmer ? "#15803d" : isIntellectual ? "#6d28d9" : "#1e293b"} />
        <rect x="24" y="17" width="3" height="8" fill={isWorker ? "#0284c7" : isFarmer ? "#15803d" : isIntellectual ? "#6d28d9" : "#1e293b"} />
        <rect x="5" y="25" width="3" height="3" fill="#fed7aa" />
        <rect x="24" y="25" width="3" height="3" fill="#fed7aa" />

        {/* Handheld Props / Accessories */}
        {isWorker && (
          /* Industrial Wrench Tool */
          <g>
            <rect x="25" y="23" width="2" height="7" fill="#94a3b8" />
            <rect x="24" y="22" width="4" height="2" fill="#cbd5e1" />
          </g>
        )}

        {isFarmer && (
          /* Golden Grain Sheaf (Bông lúa vàng) */
          <g>
            <line x1="26" y1="28" x2="28" y2="18" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="28" cy="18" r="1.5" fill="#facc15" />
            <circle cx="27" cy="20" r="1.2" fill="#fde047" />
            <circle cx="29" cy="22" r="1.2" fill="#facc15" />
          </g>
        )}

        {isIntellectual && (
          /* High-Tech Tablet / Research Dossier */
          <g>
            <rect x="24" y="23" width="6" height="7" fill="#1e1b4b" stroke="#818cf8" strokeWidth="0.6" rx="0.5" />
            <rect x="25" y="24" width="4" height="5" fill="#38bdf8" opacity="0.8" />
          </g>
        )}

        {isEntrepreneur && (
          /* Executive Leather Briefcase */
          <g>
            <rect x="24" y="24" width="7" height="6" fill="#78350f" rx="0.5" />
            <rect x="26.5" y="23" width="2" height="1.5" fill="#b45309" />
            <rect x="27" y="26" width="1" height="1" fill="#facc15" />
          </g>
        )}

        {/* Head / Face */}
        <rect x="10" y="6" width="12" height="11" fill="#fed7aa" />
        {/* Eyes */}
        <rect x="12" y="11" width="2" height="2" fill="#0f172a" />
        <rect x="18" y="11" width="2" height="2" fill="#0f172a" />

        {/* Intellectual Smart Glasses */}
        {isIntellectual && (
          <g>
            <rect x="11" y="10" width="4" height="3.5" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" strokeWidth="0.8" />
            <rect x="17" y="10" width="4" height="3.5" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" strokeWidth="0.8" />
            <line x1="15" y1="11.5" x2="17" y2="11.5" stroke="#38bdf8" strokeWidth="0.8" />
          </g>
        )}

        {/* Headgear & Hair */}
        {isWorker ? (
          /* Yellow Hard Hat (Mũ bảo hộ công nhân) */
          <g>
            <polygon points="8,7 24,7 22,1 10,1" fill="#eab308" />
            <rect x="6" y="6" width="20" height="2" fill="#facc15" rx="0.5" />
            <rect x="14" y="2" width="4" height="2" fill="#ffffff" />
          </g>
        ) : isFarmer ? (
          /* Traditional Conical Hat (Nón Lá) */
          <g>
            <polygon points="16,0 3,8 29,8" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
            <line x1="16" y1="1" x2="10" y2="8" stroke="#ca8a04" strokeWidth="0.4" />
            <line x1="16" y1="1" x2="22" y2="8" stroke="#ca8a04" strokeWidth="0.4" />
          </g>
        ) : isIntellectual ? (
          /* Scholar Neat Side Hair */
          <g>
            <rect x="9" y="3" width="14" height="4" fill="#1e293b" />
            <rect x="8" y="5" width="3" height="5" fill="#1e293b" />
            <rect x="21" y="5" width="3" height="5" fill="#1e293b" />
          </g>
        ) : isEntrepreneur ? (
          /* Executive Styled Hair */
          <g>
            <rect x="9" y="2" width="14" height="5" fill="#0f172a" />
            <rect x="8" y="4" width="3" height="6" fill="#0f172a" />
            <rect x="21" y="4" width="3" height="5" fill="#0f172a" />
            <polygon points="12,3 18,2 17,5 11,5" fill="#334155" />
          </g>
        ) : (
          /* Default Hair */
          <rect x="9" y="3" width="14" height="4" fill="#331800" />
        )}
      </svg>
    </div>
  );
}
