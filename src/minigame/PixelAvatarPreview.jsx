import React from "react";

export function PixelAvatarPreview({ character, size = 64, animated = true }) {
  const char = character || {};
  const gender = char.gender || "male";
  const color = char.color || "#0284c7";
  const accentColor = char.accentColor || "#38bdf8";
  const hairColor = char.hairColor || "#331800";
  const hairStyle = char.hairStyle || (gender === "female" ? "ponytail" : "side_part");

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
        {/* Shadow */}
        <ellipse cx="16" cy="37" rx="10" ry="2.5" fill="rgba(0,0,0,0.35)" />

        {/* Legs & Shoes */}
        <rect x="10" y="32" width="4" height="5" fill="#0f172a" />
        <rect x="18" y="32" width="4" height="5" fill="#0f172a" />
        {/* Pants / Skirt */}
        {gender === "female" && char.id === "female_dialogue" ? (
          <polygon points="9,26 23,26 25,32 7,32" fill="#1e293b" />
        ) : (
          <>
            <rect x="10" y="26" width="12" height="7" fill="#1e293b" />
            <line x1="16" y1="28" x2="16" y2="33" stroke="#0f172a" strokeWidth="1" />
          </>
        )}

        {/* Torso / Clothes */}
        <rect x="8" y="16" width="16" height="11" fill={color} />
        {/* Lapel / White Collared Shirt */}
        <polygon points="13,16 19,16 16,21" fill="#ffffff" />
        {/* Tie or Ribbon */}
        {gender === "male" ? (
          <polygon points="15.5,18 16.5,18 17,25 15,25" fill="#b91c1c" />
        ) : (
          <circle cx="16" cy="19" r="1.5" fill="#facc15" />
        )}
        {/* Badge Pin */}
        <rect x="10" y="18" width="2" height="2" fill="#facc15" />

        {/* Arms */}
        <rect x="5" y="17" width="3" height="8" fill={color} />
        <rect x="24" y="17" width="3" height="8" fill={color} />
        {/* Hands */}
        <rect x="5" y="25" width="3" height="3" fill="#fed7aa" />
        <rect x="24" y="25" width="3" height="3" fill="#fed7aa" />

        {/* Head / Face */}
        <rect x="10" y="6" width="12" height="11" fill="#fed7aa" />
        {/* Eyes */}
        <rect x="12" y="11" width="2" height="2.5" fill="#0f172a" />
        <rect x="18" y="11" width="2" height="2.5" fill="#0f172a" />
        <rect x="13" y="11" width="1" height="1" fill="#ffffff" />
        <rect x="19" y="11" width="1" height="1" fill="#ffffff" />

        {/* Blush for Female */}
        {gender === "female" && (
          <>
            <rect x="11" y="13.5" width="2" height="1" fill="#f472b6" opacity="0.8" />
            <rect x="19" y="13.5" width="2" height="1" fill="#f472b6" opacity="0.8" />
          </>
        )}

        {/* Hair Styles */}
        {hairStyle === "side_part" && (
          <>
            <rect x="9" y="3" width="14" height="5" fill={hairColor} />
            <rect x="8" y="5" width="3" height="5" fill={hairColor} />
            <rect x="21" y="5" width="3" height="4" fill={hairColor} />
            <polygon points="12,5 16,5 14,8" fill={hairColor} />
          </>
        )}

        {hairStyle === "short_taper" && (
          <>
            <rect x="9" y="3" width="14" height="4" fill={hairColor} />
            <rect x="8" y="4" width="2" height="6" fill={hairColor} />
            <rect x="22" y="4" width="2" height="6" fill={hairColor} />
            <rect x="11" y="4" width="10" height="3" fill={hairColor} />
          </>
        )}

        {hairStyle === "neat_pompadour" && (
          <>
            <rect x="9" y="2" width="14" height="6" fill={hairColor} />
            <rect x="8" y="4" width="3" height="6" fill={hairColor} />
            <rect x="21" y="4" width="3" height="6" fill={hairColor} />
            <rect x="11" y="2" width="8" height="2" fill="#475569" opacity="0.4" />
          </>
        )}

        {hairStyle === "ponytail" && (
          <>
            <rect x="8" y="3" width="16" height="5" fill={hairColor} />
            <rect x="7" y="5" width="3" height="7" fill={hairColor} />
            <rect x="22" y="5" width="3" height="7" fill={hairColor} />
            {/* Long ponytail back hair */}
            <rect x="23" y="10" width="4" height="12" fill={hairColor} />
            <rect x="22" y="10" width="2" height="2" fill="#facc15" />
          </>
        )}

        {hairStyle === "bob_clip" && (
          <>
            <rect x="8" y="3" width="16" height="5" fill={hairColor} />
            <rect x="7" y="5" width="4" height="10" fill={hairColor} />
            <rect x="21" y="5" width="4" height="10" fill={hairColor} />
            <rect x="19" y="6" width="3" height="2" fill="#facc15" />
          </>
        )}

        {hairStyle === "long_twin" && (
          <>
            <rect x="8" y="3" width="16" height="5" fill={hairColor} />
            <rect x="6" y="6" width="4" height="13" fill={hairColor} />
            <rect x="22" y="6" width="4" height="13" fill={hairColor} />
            <rect x="6" y="9" width="3" height="2" fill="#ec4899" />
            <rect x="23" y="9" width="3" height="2" fill="#ec4899" />
          </>
        )}
      </svg>
    </div>
  );
}
