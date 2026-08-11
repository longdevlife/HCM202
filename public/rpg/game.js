import {
  circlesOverlap,
  collisionMessage,
  isEntityResolvedForPlayer,
  movePlayer,
  normalizeSnapshot,
  parseGameOptions,
} from "./game-core.js";

// Canvas & DOM Setup
const canvas = document.querySelector("#game-canvas");
const status = document.querySelector("#game-status");
const context = canvas.getContext("2d");
const options = parseGameOptions(window.location.search);
const bounds = { width: canvas.width, height: canvas.height };
const input = { up: false, down: false, left: false, right: false };

// Audio Synthesizer (Web Audio API - 0 external files)
let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq, type = "square", duration = 0.12, startGain = 0.15) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(startGain, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
}

const sfx = {
  pickup: () => {
    playTone(523.25, "square", 0.06, 0.15); // C5
    setTimeout(() => playTone(659.25, "square", 0.08, 0.18), 50); // E5
  },
  stamp: () => {
    playTone(150, "triangle", 0.12, 0.3); // Low thump
    setTimeout(() => playTone(880, "square", 0.08, 0.15), 40); // Click
    setTimeout(() => playTone(1046.5, "triangle", 0.15, 0.2), 90); // Chime C6
  },
  server: () => {
    playTone(440, "sine", 0.05, 0.1);
    setTimeout(() => playTone(880, "sine", 0.06, 0.12), 40);
    setTimeout(() => playTone(1320, "sine", 0.08, 0.15), 80);
  },
  hazard: () => {
    playTone(164.81, "sawtooth", 0.25, 0.2); // E3
    setTimeout(() => playTone(130.81, "sawtooth", 0.3, 0.22), 80); // C3
  },
  npc: () => {
    playTone(698.46, "triangle", 0.1, 0.15); // F5
    setTimeout(() => playTone(880.0, "triangle", 0.15, 0.18), 90); // A5
  },
  gate: () => {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
      setTimeout(() => playTone(freq, "triangle", 0.18, 0.2), i * 70);
    });
  },
  freeze: () => {
    playTone(220, "sawtooth", 0.4, 0.25);
  },
};

// ----------------------------------------------------
// 6 FUNCTIONAL DEPARTMENTS & WORKSTATIONS
// ----------------------------------------------------
const WORKSTATIONS = [
  {
    id: "station_reception",
    name: "Bộ Phận Tiếp Nhận & Bốc Số",
    shortLabel: "QUẦY TIẾP NHẬN",
    actionLabel: "Tiếp nhận hồ sơ",
    x: 160,
    y: 110,
    radius: 46,
    type: "reception",
    color: "#38bdf8",
  },
  {
    id: "station_stamp",
    name: "Phòng Thẩm Định & Đóng Dấu",
    shortLabel: "BÀN ĐÓNG DẤU",
    actionLabel: "Đóng dấu & Hoàn tất",
    x: 800,
    y: 110,
    radius: 46,
    type: "stamp",
    color: "#ef4444",
  },
  {
    id: "station_server",
    name: "Trung Tâm Dữ Liệu Số Hóa",
    shortLabel: "MÁY CHỦ SỐ HÓA",
    actionLabel: "Tra cứu & Minh bạch",
    x: 480,
    y: 110,
    radius: 46,
    type: "server",
    color: "#10b981",
  },
  {
    id: "station_inspection",
    name: "Phòng Thanh Tra & Liêm Chính",
    shortLabel: "THANH TRA NỘI BỘ",
    actionLabel: "Giải trình & Liêm chính",
    x: 160,
    y: 420,
    radius: 46,
    type: "inspection",
    color: "#f59e0b",
  },
  {
    id: "station_feedback",
    name: "Khu Tiếp Dân & Lắng Nghe",
    shortLabel: "TIẾP DÂN & Ý KIẾN",
    actionLabel: "Lắng nghe người dân",
    x: 800,
    y: 420,
    radius: 46,
    type: "feedback",
    color: "#ec4899",
  },
  {
    id: "station_portal",
    name: "Đại Sảnh Công Khai & Giải Trình",
    shortLabel: "TT CÔNG KHAI",
    actionLabel: "Bước vào hoàn thành",
    x: 480,
    y: 430,
    radius: 48,
    type: "gate",
    color: "#06b6d4",
  },
];

// Particles & Floating Text System
const particles = [];
const floatingTexts = [];

function spawnParticles(x, y, color, count = 8, speed = 60, shape = "rect") {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = (Math.random() * 0.7 + 0.3) * speed;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      color,
      shape,
      size: Math.random() * 3.5 + 2,
      life: 0,
      maxLife: Math.random() * 0.45 + 0.3,
    });
  }
}

function spawnFloatingText(x, y, text, color = "#ffdf6e") {
  floatingTexts.push({
    x,
    y: y - 12,
    text,
    color,
    life: 0,
    maxLife: 1.3,
    vy: -35,
  });
}

// Game State
const state = {
  frozen: false,
  phase: "waiting",
  snapshot: normalizeSnapshot(),
  player: {
    id: options.playerId,
    name: options.playerName,
    color: options.color,
    x: bounds.width / 2,
    y: bounds.height / 2,
    radius: 12,
    direction: "down",
    walking: false,
  },
  carriedItem: null, // Holds item being processed
  stampingProgress: 0, // Progress timer when stamping at desk
  isStamping: false,
  collectedIds: new Set(),
  resolvedCollisionIds: new Set(),
  lastMovePostedAt: 0,
  lastFrameAt: performance.now(),
  gameTime: 0,
  screenShakeTimer: 0,
  screenShakeIntensity: 0,
  scanlines: true,
  nearbyStation: null,
};

const postToParent = (message) => window.parent?.postMessage(message, "*");
const activeInput = () => input.up || input.down || input.left || input.right;
const activeDirection = () => ["up", "down", "left", "right"].find((direction) => input[direction]) || "down";

function setStatus(message) {
  if (status) status.textContent = message;
}

function updatePlayerFromSnapshot() {
  const remote = state.snapshot.players[options.playerId];
  if (remote) {
    state.player = {
      ...state.player,
      ...remote,
      id: options.playerId,
      radius: 12,
    };
  }
}

function setDirection(direction, active) {
  if (direction in input) input[direction] = active;
}

function applyDpadMove(direction) {
  for (const key of Object.keys(input)) input[key] = false;
  if (direction !== "stop") setDirection(direction, true);
}

function triggerScreenShake(intensity = 6, duration = 0.25) {
  state.screenShakeIntensity = intensity;
  state.screenShakeTimer = duration;
}

// Find closest workstation
function updateNearbyWorkstation() {
  let closest = null;
  let minDist = Infinity;
  for (const station of WORKSTATIONS) {
    const dist = Math.hypot(state.player.x - station.x, state.player.y - station.y);
    if (dist <= station.radius + 15 && dist < minDist) {
      minDist = dist;
      closest = station;
    }
  }
  state.nearbyStation = closest;
}

// ----------------------------------------------------
// INTERACTIVE ACTION / STAMPING MECHANISM
// ----------------------------------------------------
function executePlayerAction() {
  if (options.role !== "player" || state.frozen) return;
  getAudioContext();

  // 1. If holding a carried case file/item -> process and stamp it at a workstation!
  if (state.carriedItem) {
    const item = state.carriedItem;
    sfx.stamp();
    spawnParticles(state.player.x, state.player.y, "#f59e0b", 16, 95, "star");
    spawnFloatingText(state.player.x, state.player.y, `✓ ĐÃ ĐÓNG DẤU & NỘP: ${item.label || "Hồ sơ"}!`, "#4ade80");

    postToParent({ type: "NHAT_SACH", bookId: item.id });
    state.carriedItem = null;
    return;
  }

  // 2. If near a workstation with specific department actions:
  if (state.nearbyStation) {
    const station = state.nearbyStation;

    if (station.type === "server") {
      sfx.server();
      spawnParticles(station.x, station.y, "#10b981", 12, 70, "star");
      spawnFloatingText(station.x, station.y, "✓ Đã xác thực & số hóa dữ liệu!", "#34d399");
    } else if (station.type === "inspection") {
      sfx.stamp();
      spawnParticles(station.x, station.y, "#f59e0b", 12, 70, "star");
      spawnFloatingText(station.x, station.y, "✓ Giải trình & Tự kiểm tra liêm chính!", "#fbbf24");
    } else if (station.type === "feedback") {
      sfx.npc();
      spawnParticles(station.x, station.y, "#ec4899", 12, 70, "star");
      spawnFloatingText(station.x, station.y, "✓ Lắng nghe góp ý từ công dân!", "#f472b6");
    } else if (station.type === "reception") {
      sfx.pickup();
      spawnParticles(station.x, station.y, "#38bdf8", 10, 60, "star");
      spawnFloatingText(station.x, station.y, "✓ Bốc số & Tiếp nhận yêu cầu mới!", "#38bdf8");
    }
  }

  // 3. Scan nearby interactive entities to pick up or activate
  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (kind === "players" || !entities || typeof entities !== "object") continue;
    for (const [id, entity] of Object.entries(entities)) {
      if (!entity) continue;
      const fullEntity = { ...entity, id: entity.id || id, kind: entity.kind || kind.slice(0, -1) };
      if (state.collectedIds.has(fullEntity.id) || state.resolvedCollisionIds.has(fullEntity.id)) continue;
      if (isEntityResolvedForPlayer(fullEntity, options.playerId)) continue;

      const dist = Math.hypot(state.player.x - fullEntity.x, state.player.y - fullEntity.y);
      if (dist <= 30) {
        handleEntityInteraction(fullEntity, performance.now());
        return;
      }
    }
  }
}

// Handle Direct Interaction or Walking Pickup
function handleEntityInteraction(entity, now) {
  if (options.role !== "player") return;
  if (state.collectedIds.has(entity.id) || state.resolvedCollisionIds.has(entity.id)) return;
  if (isEntityResolvedForPlayer(entity, options.playerId)) return;

  const radius = Number.isFinite(entity.radius) ? entity.radius : 16;
  if (!circlesOverlap(state.player, { ...entity, radius })) return;

  const event = collisionMessage(entity);
  if (!event) return;

  // A. ITEM (Hồ sơ, Liêm chính, Minh bạch): Nhặt và giữ hồ sơ để mang đi xử lý/đóng dấu
  if (entity.kind === "item") {
    state.collectedIds.add(entity.id);
    state.resolvedCollisionIds.add(entity.id);
    sfx.pickup();
    spawnParticles(entity.x, entity.y, entity.color || "#ffdf6e", 10, 65, "star");

    // Gán hồ sơ đang giữ cho người chơi
    state.carriedItem = {
      id: entity.id,
      type: entity.type || "case_file",
      label: entity.label || entity.name || "Hồ sơ",
      color: entity.color || "#38bdf8",
      message: entity.message,
    };

    spawnFloatingText(
      state.player.x,
      state.player.y,
      `ĐÃ NHẬN: ${state.carriedItem.label}! Đến Bàn Đóng Dấu [E]`,
      "#38bdf8"
    );

    // Gửi event để hệ thống ghi nhận
    postToParent(event);
    return;
  }

  // B. HAZARD / BẪY: Va chạm -> phát nổ, bị phạt và BIẾN MẤT NGAY LẬP TỨC để tránh spam!
  if (entity.kind === "hazard") {
    state.resolvedCollisionIds.add(entity.id);
    state.collectedIds.add(entity.id);
    sfx.hazard();
    triggerScreenShake(7, 0.3);
    spawnParticles(entity.x, entity.y, "#c5272d", 16, 95, "ember");
    spawnFloatingText(entity.x, entity.y, entity.message || "Bị phạt rủi ro!", "#ff5252");
    postToParent(event);
    return;
  }

  // C. NPC (Người dân): Tương tác và biến mất / hoàn tất
  if (entity.kind === "npc") {
    state.resolvedCollisionIds.add(entity.id);
    state.collectedIds.add(entity.id);
    sfx.npc();
    spawnParticles(entity.x, entity.y, "#26c6da", 12, 75, "star");
    spawnFloatingText(entity.x, entity.y, entity.message || "✓ Đã hỗ trợ người dân!", "#26c6da");
    postToParent(event);
    return;
  }

  // D. GATE (Trung tâm Công khai & Giải trình):
  if (entity.kind === "gate") {
    state.resolvedCollisionIds.add(entity.id);
    sfx.gate();
    spawnParticles(entity.x, entity.y, "#8cd6f7", 24, 110, "star");
    spawnFloatingText(entity.x, entity.y, "⭐ ĐÃ VÀO TRUNG TÂM CÔNG KHAI ⭐", "#8cd6f7");
    postToParent(event);
  }
}

function checkCollisions(now) {
  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (!Array.isArray(entities) && entities && typeof entities === "object") {
      for (const [id, entity] of Object.entries(entities)) {
        if (kind === "players" || !entity) continue;
        handleEntityInteraction({ ...entity, id: entity.id || id, kind: entity.kind || kind.slice(0, -1) }, now);
      }
    }
  }
}

// ----------------------------------------------------
// DETAILED ARCHITECTURAL DEPARTMENTS & MAP DRAWING
// ----------------------------------------------------

function drawEnvironment(time) {
  // Marble Checkerboard Floor Tiles
  const tileSize = 48;
  for (let y = 0; y < bounds.height; y += tileSize) {
    for (let x = 0; x < bounds.width; x += tileSize) {
      const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      context.fillStyle = isAlt ? "#1a2436" : "#141c2c";
      context.fillRect(x, y, tileSize, tileSize);

      // Tile grout lines
      context.fillStyle = "rgba(0, 0, 0, 0.3)";
      context.fillRect(x, y, tileSize, 1);
      context.fillRect(x, y, 1, tileSize);

      // Subtle edge shine
      context.fillStyle = isAlt ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.045)";
      context.fillRect(x + 1, y + 1, tileSize - 2, 2);
    }
  }

  // Central Grand Red Carpet
  const carpetX = 390;
  const carpetW = 180;
  context.fillStyle = "#781014";
  context.fillRect(carpetX, 56, carpetW, bounds.height - 56);
  context.fillStyle = "#991b1b";
  context.fillRect(carpetX + 4, 56, carpetW - 8, bounds.height - 56);
  // Gold Trim
  context.fillStyle = "#d4af37";
  context.fillRect(carpetX + 2, 56, 3, bounds.height - 56);
  context.fillRect(carpetX + carpetW - 5, 56, 3, bounds.height - 56);

  // Top Administrative Header Wall
  context.fillStyle = "#090d16";
  context.fillRect(0, 0, bounds.width, 56);
  context.fillStyle = "#1e293b";
  context.fillRect(0, 53, bounds.width, 3);
  context.fillStyle = "#000000";
  context.fillRect(0, 56, bounds.width, 2);

  // Red & Gold Slogan Banner
  const bannerW = 480;
  const bannerX = (bounds.width - bannerW) / 2;
  context.fillStyle = "#b91c1c";
  context.fillRect(bannerX, 6, bannerW, 40);
  context.strokeStyle = "#f59e0b";
  context.lineWidth = 2;
  context.strokeRect(bannerX + 2, 8, bannerW - 4, 36);

  context.fillStyle = "#fef08a";
  context.font = "bold 12px 'Silkscreen', 'VT323', monospace, sans-serif";
  context.textAlign = "center";
  context.fillText("★ TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG MỘT CỬA ★", bounds.width / 2, 24);
  context.font = "11px 'VT323', monospace, sans-serif";
  context.fillStyle = "#ffffff";
  context.fillText("CÔNG KHAI - MINH BẠCH - LIÊM CHÍNH - VÌ NHÂN DÂN PHỤC VỤ", bounds.width / 2, 38);

  // Wall Clock
  const clockX = 55;
  const clockY = 28;
  context.fillStyle = "#334155";
  context.beginPath(); context.arc(clockX, clockY, 15, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#f8fafc";
  context.beginPath(); context.arc(clockX, clockY, 13, 0, Math.PI * 2); context.fill();
  context.strokeStyle = "#0f172a";
  context.lineWidth = 1.5;
  const secAngle = (time * 1.5) % (Math.PI * 2);
  context.beginPath(); context.moveTo(clockX, clockY);
  context.lineTo(clockX + Math.cos(secAngle) * 9, clockY + Math.sin(secAngle) * 9); context.stroke();
  context.lineWidth = 1;
}

// Draw 6 Architectural Buildings / Rooms
function drawDepartmentsAndStations(time) {
  // 1. KHU 1: Bộ phận tiếp nhận & bốc số (Top Left)
  drawDepartmentRoom(
    30, 64, 260, 105,
    "BỘ PHẬN TIẾP NHẬN & BỐC SỐ",
    "#0284c7",
    () => {
      // 2 Reception Counter Windows
      drawDeskCounter(40, 95, 105, "QUẦY 01: HỒ SƠ", "#38bdf8");
      drawDeskCounter(165, 95, 105, "QUẦY 02: TƯ VẤN", "#38bdf8");
      // Ticket Dispenser Kiosk
      drawTicketKiosk(275, 85, time);
    }
  );

  // 2. KHU 2: Phòng thẩm định & Đóng dấu (Top Right)
  drawDepartmentRoom(
    670, 64, 260, 105,
    "PHÒNG THẨM ĐỊNH & ĐÓNG DẤU",
    "#dc2626",
    () => {
      // Large Verification Desk with Official Seal Stamp Press
      drawVerificationDesk(685, 95, 230, "TRẠM ĐÓNG DẤU CÔNG VỤ", time);
    }
  );

  // 3. KHU 3: Trung tâm dữ liệu số hóa & Minh bạch (Center Top)
  drawDepartmentRoom(
    330, 64, 300, 105,
    "TRUNG TÂM DỮ LIỆU SỐ HÓA",
    "#059669",
    () => {
      // 3 Blinking Server Racks
      drawServerRack(345, 92, time);
      drawServerRack(400, 92, time + 1);
      drawServerRack(455, 92, time + 2);
      // Large Digital Transparency Monitor Screen
      drawDataTerminalScreen(515, 88, 105, time);
    }
  );

  // 4. KHU 4: Phòng thanh tra & Giám sát liêm chính (Bottom Left)
  drawDepartmentRoom(
    30, 360, 260, 115,
    "PHÒNG THANH TRA & LIÊM CHÍNH",
    "#d97706",
    () => {
      drawInspectionDesk(45, 395, 230, "BÀN GIẢI TRÌNH & THANH TRA", time);
    }
  );

  // 5. KHU 5: Khu tiếp dân & Lắng nghe ý kiến (Bottom Right)
  drawDepartmentRoom(
    670, 360, 260, 115,
    "KHU TIẾP DÂN & Ý KIẾN",
    "#db2777",
    () => {
      drawCitizenLounge(685, 395, 230, time);
    }
  );

  // 6. KHU 6: Đại sảnh Công khai & Giải trình (Center Bottom)
  drawPublicAccountabilityPortal(480, 435, time);

  // Plants & Room Dividers
  drawPottedPlant(20, 75);
  drawPottedPlant(940, 75);
  drawPottedPlant(20, 485);
  drawPottedPlant(940, 485);
  drawPottedPlant(310, 75);
  drawPottedPlant(650, 75);
  drawPottedPlant(310, 485);
  drawPottedPlant(650, 485);
}

// Room outline helper
function drawDepartmentRoom(x, y, w, h, title, borderColor, renderContent) {
  // Room floor tint
  context.fillStyle = "rgba(15, 23, 42, 0.65)";
  context.fillRect(x, y, w, h);
  // Room Border Wall
  context.strokeStyle = borderColor;
  context.lineWidth = 2;
  context.strokeRect(x, y, w, h);

  // Room Title Tag Header
  context.fillStyle = borderColor;
  context.fillRect(x, y, w, 18);
  context.fillStyle = "#ffffff";
  context.font = "bold 9px 'Silkscreen', 'VT323', monospace, sans-serif";
  context.textAlign = "left";
  context.fillText(title, x + 8, y + 13);

  if (renderContent) renderContent();
}

function drawDeskCounter(x, y, w, label, color) {
  context.fillStyle = "#334155";
  context.fillRect(x, y, w, 36);
  context.fillStyle = "#475569";
  context.fillRect(x, y, w, 10);
  // Glass partition
  context.fillStyle = "rgba(147, 197, 253, 0.4)";
  context.fillRect(x + 4, y - 12, w - 8, 12);

  // Label
  context.fillStyle = color;
  context.font = "bold 8px 'Silkscreen', 'VT323', monospace, sans-serif";
  context.textAlign = "center";
  context.fillText(label, x + w / 2, y + 26);
}

function drawTicketKiosk(x, y, time) {
  // Kiosk Pillar
  context.fillStyle = "#1e293b";
  context.fillRect(x - 8, y, 16, 44);
  // Screen
  context.fillStyle = "#38bdf8";
  context.fillRect(x - 6, y + 4, 12, 12);
  // Flashing Ticket Slot
  context.fillStyle = Math.sin(time * 6) > 0 ? "#facc15" : "#64748b";
  context.fillRect(x - 4, y + 20, 8, 3);
}

function drawVerificationDesk(x, y, w, label, time) {
  // Heavy Wood Desk
  context.fillStyle = "#451a03";
  context.fillRect(x, y, w, 40);
  context.fillStyle = "#78350f";
  context.fillRect(x, y, w, 12);

  // Red Official Seal Stamper with pulsating golden aura
  const stampX = x + w / 2;
  const stampY = y - 4;
  const pulse = Math.sin(time * 5) * 2;
  context.fillStyle = "#dc2626";
  context.fillRect(stampX - 8, stampY - 8 + pulse, 16, 12);
  context.fillStyle = "#facc15";
  context.fillRect(stampX - 5, stampY - 14 + pulse, 10, 6);
  context.fillRect(stampX - 2, stampY - 18 + pulse, 4, 4);

  // Ink Pad
  context.fillStyle = "#1e293b";
  context.fillRect(stampX + 16, y + 2, 18, 8);
  context.fillStyle = "#ef4444";
  context.fillRect(stampX + 18, y + 4, 14, 4);

  // Label
  context.fillStyle = "#fef08a";
  context.font = "bold 9px 'Silkscreen', 'VT323', monospace, sans-serif";
  context.textAlign = "center";
  context.fillText(label, x + w / 2, y + 30);
}

function drawServerRack(x, y, time) {
  context.fillStyle = "#0f172a";
  context.fillRect(x, y, 42, 48);
  context.strokeStyle = "#334155";
  context.lineWidth = 1;
  context.strokeRect(x, y, 42, 48);

  // Blinking Server LEDs
  for (let row = 0; row < 4; row++) {
    const rowY = y + 6 + row * 10;
    context.fillStyle = "#1e293b";
    context.fillRect(x + 4, rowY, 34, 6);

    for (let led = 0; led < 3; led++) {
      const ledX = x + 8 + led * 8;
      const isLit = Math.sin(time * 8 + led + row) > 0;
      context.fillStyle = isLit ? (led === 0 ? "#10b981" : led === 1 ? "#38bdf8" : "#f59e0b") : "#334155";
      context.fillRect(ledX, rowY + 1.5, 3, 3);
    }
  }
}

function drawDataTerminalScreen(x, y, w, time) {
  context.fillStyle = "#0f172a";
  context.fillRect(x, y, w, 52);
  context.strokeStyle = "#10b981";
  context.lineWidth = 1.5;
  context.strokeRect(x, y, w, 52);

  // Live Chart Bars
  context.fillStyle = "#10b981";
  context.font = "bold 7px monospace";
  context.fillText("MINH BẠCH DỮ LIỆU", x + 6, y + 10);

  const bars = [16, 24, 18, 30, 22];
  for (let i = 0; i < bars.length; i++) {
    const h = bars[i] + Math.sin(time * 3 + i) * 4;
    context.fillStyle = i === 3 ? "#facc15" : "#38bdf8";
    context.fillRect(x + 10 + i * 18, y + 46 - h, 12, h);
  }
}

function drawInspectionDesk(x, y, w, label, time) {
  context.fillStyle = "#451a03";
  context.fillRect(x, y, w, 38);
  context.fillStyle = "#78350f";
  context.fillRect(x, y, w, 10);

  // Scales of Justice Icon
  const iconX = x + 24;
  const iconY = y - 4;
  context.fillStyle = "#f59e0b";
  context.font = "bold 14px sans-serif";
  context.textAlign = "center";
  context.fillText("⚖", iconX, iconY + 8);

  // Audit Ledger
  context.fillStyle = "#f8fafc";
  context.fillRect(x + w - 40, y + 2, 22, 10);
  context.fillStyle = "#dc2626";
  context.fillRect(x + w - 38, y + 4, 18, 2);

  context.fillStyle = "#fef08a";
  context.font = "bold 9px 'Silkscreen', 'VT323', monospace, sans-serif";
  context.fillText(label, x + w / 2, y + 27);
}

function drawCitizenLounge(x, y, w, time) {
  // Round Consultation Tea Table
  const tableX = x + 50;
  const tableY = y + 20;
  context.fillStyle = "#5b3d2e";
  context.beginPath(); context.arc(tableX, tableY, 20, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#b45309";
  context.beginPath(); context.arc(tableX, tableY, 17, 0, Math.PI * 2); context.fill();

  // Flower Vase on table
  context.fillStyle = "#ec4899";
  context.beginPath(); context.arc(tableX, tableY, 5, 0, Math.PI * 2); context.fill();

  // Suggestion Box with Red Heart
  const boxX = x + w - 45;
  const boxY = y + 6;
  context.fillStyle = "#b91c1c";
  context.fillRect(boxX, boxY, 26, 28);
  context.fillStyle = "#facc15";
  context.strokeRect(boxX, boxY, 26, 28);
  context.fillStyle = "#ffffff";
  context.font = "bold 9px sans-serif";
  context.textAlign = "center";
  context.fillText("❤", boxX + 13, boxY + 18);

  // Label
  context.fillStyle = "#fbcfe8";
  context.font = "bold 9px 'Silkscreen', 'VT323', monospace, sans-serif";
  context.fillText("BÀN LẮNG NGHE & GÓP Ý", x + w / 2, y + 46);
}

function drawPublicAccountabilityPortal(x, y, time) {
  const width = 140;
  const height = 75;

  // Swirling Vortex Background
  const rot = time * 2.5;
  const grad = context.createRadialGradient(x, y, 4, x, y, 46);
  grad.addColorStop(0, "rgba(56, 189, 248, 0.95)");
  grad.addColorStop(0.5, "rgba(14, 165, 233, 0.65)");
  grad.addColorStop(1, "rgba(3, 105, 161, 0)");
  context.fillStyle = grad;
  context.beginPath(); context.arc(x, y, 44, 0, Math.PI * 2); context.fill();

  // Swirling Energy Particles
  for (let i = 0; i < 6; i++) {
    const angle = rot + (i * Math.PI) / 3;
    const dist = 16 + Math.sin(time * 3 + i) * 14;
    context.fillStyle = i % 2 === 0 ? "#facc15" : "#38bdf8";
    context.beginPath();
    context.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 3.5, 0, Math.PI * 2);
    context.fill();
  }

  // Stone Archway Pillars
  context.fillStyle = "#334155";
  context.fillRect(x - width / 2, y - height / 2, 14, height);
  context.fillRect(x + width / 2 - 14, y - height / 2, 14, height);
  context.fillStyle = "#d97706";
  context.fillRect(x - width / 2 - 2, y - height / 2 - 4, 18, 6);
  context.fillRect(x + width / 2 - 16, y - height / 2 - 4, 18, 6);

  // Top Arch
  context.fillStyle = "#1e293b";
  context.fillRect(x - width / 2 - 4, y - height / 2 - 14, width + 8, 14);
  context.strokeStyle = "#facc15";
  context.lineWidth = 1.5;
  context.strokeRect(x - width / 2 - 4, y - height / 2 - 14, width + 8, 14);

  // Emblem
  context.fillStyle = "#ef4444";
  context.beginPath(); context.arc(x, y - height / 2 - 7, 7, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#facc15";
  context.font = "bold 9px sans-serif";
  context.textAlign = "center";
  context.fillText("★", x, y - height / 2 - 4);

  // Title Banner
  context.fillStyle = "rgba(15, 23, 42, 0.95)";
  context.fillRect(x - 85, y + height / 2 + 2, 170, 16);
  context.fillStyle = "#38bdf8";
  context.font = "bold 9px 'Silkscreen', 'VT323', monospace, sans-serif";
  context.fillText("ĐẠI SẢNH CÔNG KHAI & GIẢI TRÌNH", x, y + height / 2 + 13);
}

function drawPottedPlant(x, y) {
  context.fillStyle = "#9a3412";
  context.fillRect(x - 8, y, 16, 16);
  context.fillStyle = "#c2410c";
  context.fillRect(x - 9, y - 2, 18, 4);

  context.fillStyle = "#15803d";
  context.beginPath(); context.arc(x, y - 8, 12, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#22c55e";
  context.beginPath(); context.arc(x - 4, y - 10, 7, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#4ade80";
  context.beginPath(); context.arc(x + 3, y - 12, 6, 0, Math.PI * 2); context.fill();
}

// ----------------------------------------------------
// PIXEL SPRITE RENDERERS & CARRIED ITEMS
// ----------------------------------------------------

function drawPixelCharacter(ctx, x, y, options = {}) {
  const color = options.color || "#38bdf8";
  const name = options.name || "Cán bộ";
  const isLocal = options.isLocal || false;
  const isMoving = options.isMoving || false;
  const time = state.gameTime;

  // Walking bobbing offset
  const walkCycle = isMoving ? Math.sin(time * 14) : 0;
  const footOffset = isMoving ? Math.sin(time * 14) * 4 : 0;
  const bobY = y + Math.abs(walkCycle) * 2;

  // Drop Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + 14, 13, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Feet / Shoes
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 7, bobY + 10 + footOffset, 5, 4);
  ctx.fillRect(x + 2, bobY + 10 - footOffset, 5, 4);

  // Trousers
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x - 7, bobY + 4, 14, 7);

  // Torso / Shirt
  ctx.fillStyle = color;
  ctx.fillRect(x - 8, bobY - 6, 16, 11);

  // Tie / Collar
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 3, bobY - 6, 6, 4);
  ctx.fillStyle = "#b91c1c";
  ctx.fillRect(x - 1, bobY - 4, 2, 6);

  // Arms & Hands
  ctx.fillStyle = color;
  ctx.fillRect(x - 10, bobY - 5 - footOffset * 0.5, 3, 8);
  ctx.fillRect(x + 7, bobY - 5 + footOffset * 0.5, 3, 8);
  ctx.fillStyle = "#fed7aa";
  ctx.fillRect(x - 10, bobY + 3 - footOffset * 0.5, 3, 3);
  ctx.fillRect(x + 7, bobY + 3 + footOffset * 0.5, 3, 3);

  // Head
  ctx.fillStyle = "#fed7aa";
  ctx.fillRect(x - 6, bobY - 17, 12, 11);

  // Hair
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(x - 7, bobY - 20, 14, 6);
  ctx.fillRect(x - 7, bobY - 17, 3, 5);

  // Eyes
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 4, bobY - 12, 2, 3);
  ctx.fillRect(x + 2, bobY - 12, 2, 3);

  // CARRIED DOSSIER / ITEM FLOATING ABOVE HEAD
  if (isLocal && state.carriedItem) {
    const carryY = bobY - 42 + Math.sin(time * 6) * 3;
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(x - 9, carryY - 8, 18, 14);
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(x - 6, carryY - 10, 12, 4);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(x - 3, carryY - 2, 6, 6);

    // Glow aura
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 9, carryY - 8, 18, 14);
  }

  // Local Player Arrow Indicator
  if (isLocal) {
    const arrowY = bobY - (state.carriedItem ? 52 : 28) + Math.sin(time * 6) * 3;
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(x, arrowY + 6);
    ctx.lineTo(x - 5, arrowY);
    ctx.lineTo(x + 5, arrowY);
    ctx.closePath();
    ctx.fill();
  }

  // Name Tag
  ctx.fillStyle = isLocal ? "rgba(15, 23, 42, 0.92)" : "rgba(30, 41, 59, 0.85)";
  const tagW = Math.max(50, name.length * 7 + 10);
  ctx.fillRect(x - tagW / 2, bobY - (state.carriedItem ? 32 : 30), tagW, 14);
  ctx.strokeStyle = isLocal ? "#38bdf8" : "#64748b";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - tagW / 2, bobY - (state.carriedItem ? 32 : 30), tagW, 14);

  ctx.fillStyle = isLocal ? "#38bdf8" : "#f1f5f9";
  ctx.font = "bold 9px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(name, x, bobY - (state.carriedItem ? 22 : 20));
}

// Draw Item Entity
function drawItemEntity(ctx, entity, time) {
  const x = entity.x;
  const floatY = entity.y + Math.sin(time * 3 + (entity.x % 10)) * 4;
  const type = entity.type || "case_file";
  const label = entity.label || entity.name || (type === "case_file" ? "Hồ sơ" : "Liêm chính");

  // Floating Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath(); ctx.ellipse(x, entity.y + 12, 10, 4, 0, 0, Math.PI * 2); ctx.fill();

  if (type === "integrity_item" || type === "transparency") {
    // Emerald / Gold Shield
    ctx.fillStyle = "#10b981";
    ctx.fillRect(x - 9, floatY - 11, 18, 14);
    ctx.beginPath();
    ctx.moveTo(x - 9, floatY + 3); ctx.lineTo(x, floatY + 12); ctx.lineTo(x + 9, floatY + 3);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#facc15"; ctx.lineWidth = 2;
    ctx.strokeRect(x - 8, floatY - 10, 16, 12);
  } else if (type === "positive_feedback" || type === "review") {
    // Golden Star Medal
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath(); ctx.arc(x, floatY, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fef08a";
    ctx.beginPath(); ctx.arc(x, floatY, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#b45309";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("★", x, floatY + 4);
  } else {
    // Dossier Folder
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(x - 10, floatY - 12, 20, 18);
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(x - 7, floatY - 14, 14, 6);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(x - 4, floatY - 4, 8, 8);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(x - 2, floatY - 2, 4, 4);
  }

  // Label tag
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 28, floatY + 14, 56, 12);
  ctx.fillStyle = "#fef08a";
  ctx.font = "bold 8px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label.slice(0, 10), x, floatY + 23);
}

// Draw Hazard Entity
function drawHazardEntity(ctx, entity, time) {
  const x = entity.x;
  const y = entity.y;
  const pulse = Math.sin(time * 5 + entity.x) * 3;
  const type = entity.type || "envelope";
  const label = entity.label || "Cạm bẫy";

  // Danger Radius Ring
  ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + Math.sin(time * 6) * 0.3})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 18 + pulse, 0, Math.PI * 2);
  ctx.stroke();

  if (type === "envelope") {
    ctx.fillStyle = "#b91c1c";
    ctx.fillRect(x - 12, y - 8, 24, 16);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 12, y - 8, 24, 16);
  } else if (type === "waste") {
    ctx.fillStyle = "#475569";
    ctx.fillRect(x - 10, y - 12, 20, 20);
    ctx.fillStyle = "#eab308";
    ctx.fillRect(x - 8, y - 6, 16, 8);
  } else {
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.moveTo(x, y - 14); ctx.lineTo(x + 14, y + 10); ctx.lineTo(x - 14, y + 10);
    ctx.closePath(); ctx.fill();
  }

  // Label
  ctx.fillStyle = "#7f1d1d";
  ctx.fillRect(x - 30, y + 14, 60, 12);
  ctx.fillStyle = "#fca5a5";
  ctx.font = "bold 8px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label.slice(0, 11), x, y + 23);
}

// Draw NPC Entity
function drawNpcEntity(ctx, entity, time) {
  const x = entity.x;
  const y = entity.y;
  const label = entity.label || entity.name || "Người dân";

  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath(); ctx.ellipse(x, y + 12, 12, 5, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#0284c7";
  ctx.fillRect(x - 7, y - 5, 14, 13);
  ctx.fillStyle = "#fed7aa";
  ctx.fillRect(x - 6, y - 16, 12, 11);
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(x - 7, y - 18, 14, 5);

  // Animated Thought Bubble
  const bubbleY = y - 28 + Math.sin(time * 4) * 2;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(x, bubbleY, 9, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = "#0284c7";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  const icons = ["📋", "⭐", "❤️", "?"];
  const iconIdx = Math.floor(time * 0.8) % icons.length;
  ctx.fillText(icons[iconIdx], x, bubbleY + 3);

  // Name Tag
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 35, y + 14, 70, 12);
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 8px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.fillText(label.slice(0, 13), x, y + 23);
}

// ----------------------------------------------------
// MAIN RENDER SCENE
// ----------------------------------------------------

function drawScene() {
  const time = state.gameTime;

  context.save();
  if (state.screenShakeTimer > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShakeIntensity * 2;
    const shakeY = (Math.random() - 0.5) * state.screenShakeIntensity * 2;
    context.translate(shakeX, shakeY);
  }

  // 1. Environment Floor, Carpet, Wall, Clock
  drawEnvironment(time);

  // 2. 6 Functional Architectural Departments & Workstations
  drawDepartmentsAndStations(time);

  // 3. Interactive World Entities (Filtered if collected or claimed)
  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (kind === "players" || !entities || typeof entities !== "object") continue;
    for (const [id, entity] of Object.entries(entities)) {
      if (!entity) continue;
      const fullEntity = { ...entity, id: entity.id || id, kind: entity.kind || kind.slice(0, -1) };

      if (state.collectedIds.has(fullEntity.id) || state.resolvedCollisionIds.has(fullEntity.id)) continue;
      if (options.role === "player" && isEntityResolvedForPlayer(fullEntity, options.playerId)) continue;

      if (fullEntity.kind === "item") {
        drawItemEntity(context, fullEntity, time);
      } else if (fullEntity.kind === "hazard") {
        drawHazardEntity(context, fullEntity, time);
      } else if (fullEntity.kind === "npc") {
        drawNpcEntity(context, fullEntity, time);
      }
    }
  }

  // 4. Remote Players
  for (const [id, remote] of Object.entries(state.snapshot.players)) {
    if (options.role !== "player" || id !== options.playerId) {
      drawPixelCharacter(context, remote.x, remote.y, {
        name: remote.name || remote.id || "Cán bộ",
        color: remote.color || "#64748b",
        isLocal: false,
        isMoving: false,
      });
    }
  }

  // 5. Local Player
  if (options.role === "player") {
    drawPixelCharacter(context, state.player.x, state.player.y, {
      name: state.player.name || options.playerName,
      color: state.player.color || options.color,
      isLocal: true,
      isMoving: activeInput() && !state.frozen,
    });
  }

  // 6. Interactive Station Action HUD & Prompt
  if (options.role === "player" && (state.nearbyStation || state.carriedItem)) {
    const station = state.nearbyStation;
    const promptText = state.carriedItem
      ? `⚡ BẤM [E / SPACE / XỬ LÝ] ĐỂ ĐÓNG DẤU: ${state.carriedItem.label.toUpperCase()}`
      : `⚡ BẤM [E / SPACE] ${station ? station.actionLabel.toUpperCase() : "TƯƠNG TÁC"}`;

    const promptY = state.player.y > 440 ? 30 : bounds.height - 24;
    context.fillStyle = "rgba(15, 23, 42, 0.95)";
    context.fillRect(bounds.width / 2 - 210, promptY - 14, 420, 26);
    context.strokeStyle = "#facc15";
    context.lineWidth = 2;
    context.strokeRect(bounds.width / 2 - 210, promptY - 14, 420, 26);

    context.fillStyle = "#fef08a";
    context.font = "bold 11px 'Silkscreen', 'VT323', monospace, sans-serif";
    context.textAlign = "center";
    context.fillText(promptText, bounds.width / 2, promptY + 3);
  }

  // 7. Particles Update & Render
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life += 0.016;
    if (p.life >= p.maxLife) {
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;
    const alpha = 1 - p.life / p.maxLife;

    context.fillStyle = p.color || "#ffffff";
    context.globalAlpha = alpha;
    if (p.shape === "star") {
      context.beginPath(); context.arc(p.x, p.y, p.size, 0, Math.PI * 2); context.fill();
    } else {
      context.fillRect(p.x, p.y, p.size, p.size);
    }
    context.globalAlpha = 1.0;
  }

  // 8. Floating Text Update & Render
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.life += 0.016;
    if (ft.life >= ft.maxLife) {
      floatingTexts.splice(i, 1);
      continue;
    }
    ft.y += ft.vy * 0.016;
    const alpha = 1 - ft.life / ft.maxLife;

    context.save();
    context.globalAlpha = alpha;
    context.font = "bold 13px 'Silkscreen', 'VT323', monospace, sans-serif";
    context.textAlign = "center";
    context.fillStyle = "#000000";
    context.fillText(ft.text, ft.x + 1, ft.y + 1);
    context.fillStyle = ft.color || "#ffdf6e";
    context.fillText(ft.text, ft.x, ft.y);
    context.restore();
  }

  // 9. Frozen Overlay
  if (state.frozen) {
    context.fillStyle = "rgba(14, 165, 233, 0.25)";
    context.fillRect(0, 0, bounds.width, bounds.height);
    context.fillStyle = "#f0f9ff";
    context.font = "bold 20px 'Silkscreen', 'VT323', monospace, sans-serif";
    context.textAlign = "center";
    context.fillText("❄ ĐANG TẠM DỪNG / ĐÓNG BĂNG ❄", bounds.width / 2, bounds.height / 2);
  }

  // 10. Scanlines Overlay
  if (state.scanlines) {
    context.fillStyle = "rgba(0, 0, 0, 0.08)";
    for (let y = 0; y < bounds.height; y += 4) {
      context.fillRect(0, y, bounds.width, 1.5);
    }
  }

  context.restore();
  canvas.dataset.rendered = "true";
}

// Main Game Loop
function frame(now) {
  const deltaSeconds = Math.min(0.1, Math.max(0, (now - state.lastFrameAt) / 1000));
  state.lastFrameAt = now;
  state.gameTime += deltaSeconds;

  if (state.screenShakeTimer > 0) {
    state.screenShakeTimer -= deltaSeconds;
  }

  if (!state.frozen && options.role === "player" && activeInput()) {
    state.player = movePlayer(state.player, input, deltaSeconds, bounds);
    if (now - state.lastMovePostedAt >= 100) {
      state.lastMovePostedAt = now;
      postToParent({
        type: "PLAYER_MOVE",
        playerId: options.playerId,
        x: state.player.x,
        y: state.player.y,
        direction: activeDirection(),
      });
    }
  }

  updateNearbyWorkstation();
  checkCollisions(now);
  drawScene();
  requestAnimationFrame(frame);
}

// Keyboard Controls
const keyboardDirections = {
  ArrowUp: "up", KeyW: "up",
  ArrowDown: "down", KeyS: "down",
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
};

window.addEventListener("keydown", (event) => {
  if (event.code === "KeyE" || event.code === "Space" || event.code === "Enter") {
    event.preventDefault();
    executePlayerAction();
    return;
  }

  const direction = keyboardDirections[event.code];
  if (!direction) return;
  getAudioContext();
  event.preventDefault();
  setDirection(direction, true);
});

window.addEventListener("keyup", (event) => {
  const direction = keyboardDirections[event.code];
  if (!direction) return;
  event.preventDefault();
  setDirection(direction, false);
});

window.addEventListener("pointerdown", () => {
  getAudioContext();
});

// Parent Window PostMessage Listener
window.addEventListener("message", (event) => {
  if (event.source !== window.parent) return;
  const message = event.data;
  if (!message || typeof message !== "object") return;

  if (message.type === "GAME_SNAPSHOT") {
    state.snapshot = normalizeSnapshot(message);
    state.phase = typeof message.phase === "string" ? message.phase : "waiting";
    updatePlayerFromSnapshot();
    setStatus(`${options.role === "host" ? "Chế độ Ban Tổ Chức (Host)" : "Người chơi"}: ${state.phase}`);
  } else if (message.type === "DPAD_MOVE") {
    getAudioContext();
    applyDpadMove(message.dir);
  } else if (message.type === "ACTION_INTERACT") {
    executePlayerAction();
  } else if (message.type === "FREEZE") {
    state.frozen = true;
    sfx.freeze();
    setStatus("Đang tạm dừng di chuyển");
  } else if (message.type === "UNFREEZE") {
    state.frozen = false;
    setStatus(`${options.role === "host" ? "Chế độ Ban Tổ Chức (Host)" : "Người chơi"}: ${state.phase}`);
  } else if (message.type === "TOGGLE_SOUND") {
    soundEnabled = !soundEnabled;
  }
});

// Initial Setup
setStatus(options.role === "host" ? "Chế độ Host sẵn sàng" : `Cán bộ ${options.playerName} sẵn sàng`);
postToParent({ type: "RPG_READY", role: options.role, playerId: options.playerId });
requestAnimationFrame(frame);
