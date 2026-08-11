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

// WORLD CITY DIMENSIONS (Large Open Pixel City Map)
const MAP_WIDTH = 2400;
const MAP_HEIGHT = 1400;
const VIEW_WIDTH = canvas.width;  // 960
const VIEW_HEIGHT = canvas.height; // 540

// Input State
const input = { up: false, down: false, left: false, right: false };

// Camera Viewport
const camera = {
  x: MAP_WIDTH / 2 - VIEW_WIDTH / 2,
  y: MAP_HEIGHT / 2 - VIEW_HEIGHT / 2,
};

// Coordinate mapping between Firebase snapshot (960x540) and Pixel City Map (2400x1400)
const toWorldX = (snapX) => (snapX / 960) * MAP_WIDTH;
const toWorldY = (snapY) => (snapY / 540) * MAP_HEIGHT;
const toSnapX = (worldX) => (worldX / MAP_WIDTH) * 960;
const toSnapY = (worldY) => (worldY / MAP_HEIGHT) * 540;

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
    playTone(140, "triangle", 0.14, 0.35); // Low thump
    setTimeout(() => playTone(880, "square", 0.08, 0.18), 40); // Click
    setTimeout(() => playTone(1046.5, "triangle", 0.16, 0.22), 90); // Chime C6
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
// 6 GRAND CITY BUILDINGS & INTERACTIVE WORKSTATIONS
// ----------------------------------------------------
const BUILDINGS = [
  {
    id: "bldg_reception",
    name: "TÒA NHÀ TIẾP NHẬN HÀNH CHÍNH",
    sub: "Bộ Phận Một Cửa & Bốc Số",
    actionLabel: "Tiếp nhận hồ sơ",
    type: "reception",
    x: 370,
    y: 220,
    w: 500,
    h: 260,
    stationX: 370,
    stationY: 310,
    radius: 70,
    themeColor: "#0284c7",
    accentColor: "#38bdf8",
  },
  {
    id: "bldg_server",
    name: "TRUNG TÂM DỮ LIỆU SỐ HÓA",
    sub: "Viện Công Nghệ & Lưu Trữ Đám Mây",
    actionLabel: "Tra cứu & Minh bạch",
    type: "server",
    x: 1200,
    y: 210,
    w: 520,
    h: 270,
    stationX: 1200,
    stationY: 300,
    radius: 70,
    themeColor: "#059669",
    accentColor: "#34d399",
  },
  {
    id: "bldg_stamp",
    name: "TÒA THÁP THẨM ĐỊNH & ĐÓNG DẤU",
    sub: "Cơ Quan Phê Duyệt & Niêm Phong Công Vụ",
    actionLabel: "Đóng dấu & Nộp hồ sơ",
    type: "stamp",
    x: 2030,
    y: 220,
    w: 500,
    h: 260,
    stationX: 2030,
    stationY: 310,
    radius: 70,
    themeColor: "#b91c1c",
    accentColor: "#f87171",
  },
  {
    id: "bldg_inspection",
    name: "VIỆN THANH TRA & GIÁM SÁT LIÊM CHÍNH",
    sub: "Ủy Ban Kiểm Tra & Giải Trình Tài Sản",
    actionLabel: "Thanh tra & Liêm chính",
    type: "inspection",
    x: 370,
    y: 1070,
    w: 500,
    h: 260,
    stationX: 370,
    stationY: 980,
    radius: 70,
    themeColor: "#d97706",
    accentColor: "#fbbf24",
  },
  {
    id: "bldg_portal",
    name: "ĐẠI SẢNH QUẢNG TRƯỜNG CÔNG KHAI",
    sub: "Đài Tưởng Niệm Minh Bạch & Giải Trình",
    actionLabel: "Bước vào hoàn thành nhiệm vụ",
    type: "gate",
    x: 1200,
    y: 1080,
    w: 520,
    h: 280,
    stationX: 1200,
    stationY: 990,
    radius: 80,
    themeColor: "#0891b2",
    accentColor: "#22d3ee",
  },
  {
    id: "bldg_feedback",
    name: "NHÀ VĂN HÓA TIẾP DÂN CỘNG ĐỒNG",
    sub: "Không Gian Đối Thoại & Lắng Nghe Ý Kiến",
    actionLabel: "Lắng nghe ý kiến người dân",
    type: "feedback",
    x: 2030,
    y: 1070,
    w: 500,
    h: 260,
    stationX: 2030,
    stationY: 980,
    radius: 70,
    themeColor: "#db2777",
    accentColor: "#f472b6",
  },
];

// Particles & Floating Text System
const particles = [];
const floatingTexts = [];

function spawnParticles(x, y, color, count = 10, speed = 70, shape = "rect") {
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
    y: y - 14,
    text,
    color,
    life: 0,
    maxLife: 1.4,
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
    x: MAP_WIDTH / 2,
    y: MAP_HEIGHT / 2 + 50,
    radius: 14,
    direction: "down",
    walking: false,
  },
  carriedItem: null,
  collectedIds: new Set(),
  resolvedCollisionIds: new Set(),
  lastMovePostedAt: 0,
  lastFrameAt: performance.now(),
  gameTime: 0,
  screenShakeTimer: 0,
  screenShakeIntensity: 0,
  scanlines: true,
  nearbyBuilding: null,
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
      x: typeof remote.x === "number" ? toWorldX(remote.x) : state.player.x,
      y: typeof remote.y === "number" ? toWorldY(remote.y) : state.player.y,
      id: options.playerId,
      radius: 14,
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

function updateNearbyBuilding() {
  let closest = null;
  let minDist = Infinity;
  for (const bldg of BUILDINGS) {
    const dist = Math.hypot(state.player.x - bldg.stationX, state.player.y - bldg.stationY);
    if (dist <= bldg.radius + 20 && dist < minDist) {
      minDist = dist;
      closest = bldg;
    }
  }
  state.nearbyBuilding = closest;
}

// ----------------------------------------------------
// INTERACTIVE ACTION EXECUTION
// ----------------------------------------------------
function executePlayerAction() {
  if (options.role !== "player" || state.frozen) return;
  getAudioContext();

  // 1. If holding a carried case file -> stamp & submit at Stamp Tower or Tech Server!
  if (state.carriedItem) {
    const item = state.carriedItem;
    sfx.stamp();
    spawnParticles(state.player.x, state.player.y, "#f59e0b", 20, 110, "star");
    spawnFloatingText(
      state.player.x,
      state.player.y,
      `✓ ĐÃ ĐÓNG DẤU & NỘP THÀNH CÔNG: ${item.label || "Hồ sơ"}! (+30 Điểm)`,
      "#4ade80"
    );

    postToParent({ type: "NHAT_SACH", bookId: item.id });
    state.carriedItem = null;
    return;
  }

  // 2. If standing near a Building Workstation:
  if (state.nearbyBuilding) {
    const bldg = state.nearbyBuilding;

    if (bldg.type === "server") {
      sfx.server();
      spawnParticles(bldg.stationX, bldg.stationY, "#10b981", 16, 80, "star");
      spawnFloatingText(state.player.x, state.player.y, "✓ Đã xác thực & số hóa dữ liệu minh bạch!", "#34d399");
    } else if (bldg.type === "inspection") {
      sfx.stamp();
      spawnParticles(bldg.stationX, bldg.stationY, "#f59e0b", 16, 80, "star");
      spawnFloatingText(state.player.x, state.player.y, "✓ Tự kiểm tra & Giải trình liêm chính!", "#fbbf24");
    } else if (bldg.type === "feedback") {
      sfx.npc();
      spawnParticles(bldg.stationX, bldg.stationY, "#ec4899", 16, 80, "star");
      spawnFloatingText(state.player.x, state.player.y, "✓ Đã lắng nghe ý kiến đóng góp từ nhân dân!", "#f472b6");
    } else if (bldg.type === "reception") {
      sfx.pickup();
      spawnParticles(bldg.stationX, bldg.stationY, "#38bdf8", 14, 75, "star");
      spawnFloatingText(state.player.x, state.player.y, "✓ Bốc số thứ tự & Tiếp nhận yêu cầu mới!", "#38bdf8");
    }
  }

  // 3. Scan nearby collectible items or NPCs to pick up
  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (kind === "players" || !entities || typeof entities !== "object") continue;
    for (const [id, entity] of Object.entries(entities)) {
      if (!entity) continue;
      const fullEntity = { ...entity, id: entity.id || id, kind: entity.kind || kind.slice(0, -1) };
      if (state.collectedIds.has(fullEntity.id) || state.resolvedCollisionIds.has(fullEntity.id)) continue;
      if (isEntityResolvedForPlayer(fullEntity, options.playerId)) continue;

      const entityWorldX = toWorldX(fullEntity.x);
      const entityWorldY = toWorldY(fullEntity.y);
      const dist = Math.hypot(state.player.x - entityWorldX, state.player.y - entityWorldY);
      if (dist <= 36) {
        handleEntityInteraction({ ...fullEntity, x: entityWorldX, y: entityWorldY }, performance.now());
        return;
      }
    }
  }
}

// Handle Walking Contact or Direct Pickup
function handleEntityInteraction(entity, now) {
  if (options.role !== "player") return;
  if (state.collectedIds.has(entity.id) || state.resolvedCollisionIds.has(entity.id)) return;
  if (isEntityResolvedForPlayer(entity, options.playerId)) return;

  const radius = Number.isFinite(entity.radius) ? entity.radius : 18;
  if (!circlesOverlap(state.player, { ...entity, radius })) return;

  const event = collisionMessage(entity);
  if (!event) return;

  // A. ITEM (Hồ sơ, Liêm chính, Minh bạch): Nhặt hồ sơ để mang đến tòa nhà đóng dấu
  if (entity.kind === "item") {
    state.collectedIds.add(entity.id);
    state.resolvedCollisionIds.add(entity.id);
    sfx.pickup();
    spawnParticles(entity.x, entity.y, entity.color || "#ffdf6e", 12, 70, "star");

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
      `ĐÃ NHẬN: ${state.carriedItem.label}! Đến Tòa Đóng Dấu [E]`,
      "#38bdf8"
    );

    postToParent(event);
    return;
  }

  // B. HAZARD / BẪY: Va chạm -> phát nổ và BIẾN MẤT VĨNH VIỄN để tránh spam!
  if (entity.kind === "hazard") {
    state.resolvedCollisionIds.add(entity.id);
    state.collectedIds.add(entity.id);
    sfx.hazard();
    triggerScreenShake(8, 0.3);
    spawnParticles(entity.x, entity.y, "#c5272d", 18, 100, "ember");
    spawnFloatingText(entity.x, entity.y, entity.message || "Bị phạt rủi ro công vụ!", "#ff5252");
    postToParent(event);
    return;
  }

  // C. NPC (Công dân): Tương tác và hoàn tất
  if (entity.kind === "npc") {
    state.resolvedCollisionIds.add(entity.id);
    state.collectedIds.add(entity.id);
    sfx.npc();
    spawnParticles(entity.x, entity.y, "#26c6da", 14, 80, "star");
    spawnFloatingText(entity.x, entity.y, entity.message || "✓ Đã tiếp nhận ý kiến công dân!", "#26c6da");
    postToParent(event);
    return;
  }

  // D. GATE (Quảng trường Công khai & Giải trình):
  if (entity.kind === "gate") {
    state.resolvedCollisionIds.add(entity.id);
    sfx.gate();
    spawnParticles(entity.x, entity.y, "#8cd6f7", 26, 120, "star");
    spawnFloatingText(entity.x, entity.y, "⭐ ĐÃ VÀO TRUNG TÂM CÔNG KHAI ⭐", "#8cd6f7");
    postToParent(event);
  }
}

function checkCollisions(now) {
  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (!Array.isArray(entities) && entities && typeof entities === "object") {
      for (const [id, entity] of Object.entries(entities)) {
        if (kind === "players" || !entity) continue;
        const worldEntity = {
          ...entity,
          id: entity.id || id,
          kind: entity.kind || kind.slice(0, -1),
          x: toWorldX(entity.x),
          y: toWorldY(entity.y),
        };
        handleEntityInteraction(worldEntity, now);
      }
    }
  }
}

// ----------------------------------------------------
// PIXEL CITY GRAPHICS & BUILDING RENDERING
// ----------------------------------------------------

function drawCityGround() {
  // 1. Asphalt Ground Base
  context.fillStyle = "#1e293b";
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // 2. City Road System (Multi-Lane Boulevards & Cross Streets)
  const roadColor = "#0f172a";
  const laneColor = "#facc15";
  const zebraColor = "#f8fafc";

  // Main Horizontal Center Avenue (Highway)
  context.fillStyle = roadColor;
  context.fillRect(0, 600, MAP_WIDTH, 180);
  // Dashed Yellow Center Lines
  context.strokeStyle = laneColor;
  context.lineWidth = 4;
  context.setLineDash([28, 20]);
  context.beginPath();
  context.moveTo(0, 690);
  context.lineTo(MAP_WIDTH, 690);
  context.stroke();
  context.setLineDash([]);

  // Vertical Avenues
  context.fillStyle = roadColor;
  context.fillRect(720, 0, 160, MAP_HEIGHT);
  context.fillRect(1520, 0, 160, MAP_HEIGHT);

  // Vertical Dashed Center Lines
  context.strokeStyle = laneColor;
  context.lineWidth = 4;
  context.setLineDash([28, 20]);
  context.beginPath();
  context.moveTo(800, 0); context.lineTo(800, MAP_HEIGHT);
  context.moveTo(1600, 0); context.lineTo(1600, MAP_HEIGHT);
  context.stroke();
  context.setLineDash([]);

  // Pedestrian Crosswalks (Zebra Stripes)
  drawCrosswalk(680, 600, 40, 180, true);
  drawCrosswalk(880, 600, 40, 180, true);
  drawCrosswalk(1480, 600, 40, 180, true);
  drawCrosswalk(1680, 600, 40, 180, true);

  // 3. Cobblestone Sidewalks & Plazas
  drawSidewalk(80, 80, 580, 500);
  drawSidewalk(910, 80, 580, 500);
  drawSidewalk(1710, 80, 580, 500);

  drawSidewalk(80, 800, 580, 520);
  drawSidewalk(910, 800, 580, 520);
  drawSidewalk(1710, 800, 580, 520);

  // 4. Central Peace Plaza & Grand Water Fountain
  drawCentralPlazaFountain(1200, 690, state.gameTime);
}

function drawCrosswalk(x, y, w, h, isVertical) {
  context.fillStyle = "#ffffff";
  if (isVertical) {
    for (let i = y + 10; i < y + h - 10; i += 22) {
      context.fillRect(x, i, w, 12);
    }
  } else {
    for (let i = x + 10; i < x + w - 10; i += 22) {
      context.fillRect(i, y, 12, h);
    }
  }
}

function drawSidewalk(x, y, w, h) {
  context.fillStyle = "#334155";
  context.fillRect(x, y, w, h);
  context.strokeStyle = "#475569";
  context.lineWidth = 3;
  context.strokeRect(x, y, w, h);

  // Cobblestone Grid texture
  context.fillStyle = "rgba(255, 255, 255, 0.025)";
  for (let py = y + 8; py < y + h - 8; py += 32) {
    for (let px = x + 8; px < x + w - 8; px += 32) {
      context.fillRect(px, py, 28, 28);
    }
  }
}

function drawCentralPlazaFountain(cx, cy, time) {
  // Circular Plaza Base
  context.fillStyle = "#1e293b";
  context.beginPath(); context.arc(cx, cy, 70, 0, Math.PI * 2); context.fill();
  context.strokeStyle = "#facc15";
  context.lineWidth = 3;
  context.stroke();

  // Water Pool
  context.fillStyle = "#0284c7";
  context.beginPath(); context.arc(cx, cy, 54, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#38bdf8";
  context.beginPath(); context.arc(cx, cy, 48, 0, Math.PI * 2); context.fill();

  // Water Jet Particles
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 + time * 2;
    const dist = 18 + Math.sin(time * 4 + i) * 16;
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 3.5, 0, Math.PI * 2);
    context.fill();
  }

  // Fountain Monument Spire
  context.fillStyle = "#e2e8f0";
  context.beginPath(); context.arc(cx, cy, 14, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#facc15";
  context.font = "bold 14px sans-serif";
  context.textAlign = "center";
  context.fillText("★", cx, cy + 5);
}

// Draw Grand Pixel Buildings with Facades, Roofs, Doors, Windows, and Neon Signs
function drawCityBuildings(time) {
  for (const bldg of BUILDINGS) {
    const bx = bldg.x - bldg.w / 2;
    const by = bldg.y - bldg.h / 2;

    // 1. Building Drop Shadow
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.fillRect(bx + 15, by + 18, bldg.w, bldg.h);

    // 2. Main Wall Facade
    context.fillStyle = "#0f172a";
    context.fillRect(bx, by, bldg.w, bldg.h);
    context.strokeStyle = bldg.themeColor;
    context.lineWidth = 3;
    context.strokeRect(bx, by, bldg.w, bldg.h);

    // 3. Roof Cornice & Architectural Molding
    context.fillStyle = bldg.themeColor;
    context.fillRect(bx - 6, by - 12, bldg.w + 12, 24);
    context.fillStyle = bldg.accentColor;
    context.fillRect(bx - 2, by + 10, bldg.w + 4, 4);

    // 4. Rows of Glowing Windows
    const cols = 8;
    const rows = 4;
    const winW = 34;
    const winH = 26;
    const startX = bx + 36;
    const startY = by + 42;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = startX + c * 54;
        const wy = startY + r * 38;
        const isLit = (Math.sin(time * 2 + r * 3 + c * 5) > -0.2);

        context.fillStyle = isLit ? "rgba(254, 240, 138, 0.85)" : "#1e293b";
        context.fillRect(wx, wy, winW, winH);
        context.strokeStyle = "#334155";
        context.lineWidth = 1.5;
        context.strokeRect(wx, wy, winW, winH);

        // Window pane dividers
        context.strokeStyle = "#0f172a";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(wx + winW / 2, wy); context.lineTo(wx + winW / 2, wy + winH);
        context.moveTo(wx, wy + winH / 2); context.lineTo(wx + winW, wy + winH / 2);
        context.stroke();
      }
    }

    // 5. Grand Entrance Portal & Interactive Station Pad
    const entranceW = 120;
    const entranceH = 50;
    const ex = bldg.stationX - entranceW / 2;
    const ey = by + bldg.h - entranceH;

    context.fillStyle = "#1e293b";
    context.fillRect(ex, ey, entranceW, entranceH);
    context.strokeStyle = bldg.accentColor;
    context.lineWidth = 2;
    context.strokeRect(ex, ey, entranceW, entranceH);

    // Glass Entrance Doors
    context.fillStyle = "rgba(56, 189, 248, 0.4)";
    context.fillRect(ex + 15, ey + 8, entranceW - 30, entranceH - 8);

    // Interactive Station Pad (Glowing circular area)
    const pulse = Math.sin(time * 4) * 4;
    context.strokeStyle = bldg.accentColor;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(bldg.stationX, bldg.stationY, bldg.radius + pulse, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = `${bldg.themeColor}33`;
    context.beginPath();
    context.arc(bldg.stationX, bldg.stationY, bldg.radius - 8, 0, Math.PI * 2);
    context.fill();

    // 6. Grand Neon Header Signboard
    const signW = bldg.w - 60;
    const signH = 34;
    const sx = bldg.x - signW / 2;
    const sy = by + 18;

    context.fillStyle = "rgba(15, 23, 42, 0.95)";
    context.fillRect(sx, sy, signW, signH);
    context.strokeStyle = "#facc15";
    context.lineWidth = 2;
    context.strokeRect(sx, sy, signW, signH);

    context.fillStyle = "#facc15";
    context.font = "bold 13px 'Silkscreen', 'VT323', monospace, sans-serif";
    context.textAlign = "center";
    context.fillText(bldg.name, bldg.x, sy + 16);

    context.fillStyle = "#ffffff";
    context.font = "11px 'VT323', monospace, sans-serif";
    context.fillText(bldg.sub, bldg.x, sy + 28);

    // 7. Streetlamps & Decorative Trees outside building
    drawStreetLamp(bx + 15, by + bldg.h + 20, time);
    drawStreetLamp(bx + bldg.w - 15, by + bldg.h + 20, time);
    drawCityTree(bx - 25, by + bldg.h / 2);
    drawCityTree(bx + bldg.w + 25, by + bldg.h / 2);
  }
}

function drawStreetLamp(x, y, time) {
  // Lamp Post
  context.fillStyle = "#475569";
  context.fillRect(x - 2, y - 36, 4, 36);
  // Lamp Head
  context.fillStyle = "#facc15";
  context.beginPath(); context.arc(x, y - 38, 7, 0, Math.PI * 2); context.fill();

  // Warm Light Glow Cone
  const grad = context.createRadialGradient(x, y - 38, 4, x, y, 40);
  grad.addColorStop(0, "rgba(250, 204, 21, 0.2)");
  grad.addColorStop(1, "rgba(250, 204, 21, 0)");
  context.fillStyle = grad;
  context.beginPath(); context.arc(x, y - 20, 36, 0, Math.PI * 2); context.fill();
}

function drawCityTree(x, y) {
  // Trunk
  context.fillStyle = "#78350f";
  context.fillRect(x - 5, y - 10, 10, 24);
  // Foliage
  context.fillStyle = "#15803d";
  context.beginPath(); context.arc(x, y - 24, 22, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#22c55e";
  context.beginPath(); context.arc(x - 6, y - 28, 14, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#4ade80";
  context.beginPath(); context.arc(x + 6, y - 32, 10, 0, Math.PI * 2); context.fill();
}

// ----------------------------------------------------
// PIXEL SPRITE RENDERERS
// ----------------------------------------------------

function drawPixelCharacter(ctx, x, y, options = {}) {
  const color = options.color || "#38bdf8";
  const name = options.name || "Cán bộ";
  const isLocal = options.isLocal || false;
  const isMoving = options.isMoving || false;
  const time = state.gameTime;

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

  // Shirt / Uniform
  ctx.fillStyle = color;
  ctx.fillRect(x - 8, bobY - 6, 16, 11);

  // Tie & Collar
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

  // Head & Face
  ctx.fillStyle = "#fed7aa";
  ctx.fillRect(x - 6, bobY - 17, 12, 11);
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(x - 7, bobY - 20, 14, 6);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 4, bobY - 12, 2, 3);
  ctx.fillRect(x + 2, bobY - 12, 2, 3);

  // Carried Dossier Icon floating above player head
  if (isLocal && state.carriedItem) {
    const carryY = bobY - 44 + Math.sin(time * 6) * 3;
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(x - 10, carryY - 8, 20, 15);
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(x - 7, carryY - 10, 14, 4);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(x - 4, carryY - 2, 8, 6);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 10, carryY - 8, 20, 15);
  }

  // Local Player Arrow
  if (isLocal) {
    const arrowY = bobY - (state.carriedItem ? 56 : 30) + Math.sin(time * 6) * 3;
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(x, arrowY + 6);
    ctx.lineTo(x - 5, arrowY);
    ctx.lineTo(x + 5, arrowY);
    ctx.closePath();
    ctx.fill();
  }

  // Name Tag
  ctx.fillStyle = isLocal ? "rgba(15, 23, 42, 0.95)" : "rgba(30, 41, 59, 0.85)";
  const tagW = Math.max(54, name.length * 7 + 10);
  ctx.fillRect(x - tagW / 2, bobY - (state.carriedItem ? 34 : 30), tagW, 14);
  ctx.strokeStyle = isLocal ? "#38bdf8" : "#64748b";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - tagW / 2, bobY - (state.carriedItem ? 34 : 30), tagW, 14);

  ctx.fillStyle = isLocal ? "#38bdf8" : "#f1f5f9";
  ctx.font = "bold 9px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(name, x, bobY - (state.carriedItem ? 23 : 20));
}

// Draw Item Entity
function drawItemEntity(ctx, entity, time) {
  const x = entity.x;
  const floatY = entity.y + Math.sin(time * 3 + (entity.x % 10)) * 4;
  const type = entity.type || "case_file";
  const label = entity.label || entity.name || (type === "case_file" ? "Hồ sơ" : "Liêm chính");

  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath(); ctx.ellipse(x, entity.y + 12, 12, 4.5, 0, 0, Math.PI * 2); ctx.fill();

  if (type === "integrity_item" || type === "transparency") {
    ctx.fillStyle = "#10b981";
    ctx.fillRect(x - 10, floatY - 12, 20, 15);
    ctx.beginPath();
    ctx.moveTo(x - 10, floatY + 3); ctx.lineTo(x, floatY + 14); ctx.lineTo(x + 10, floatY + 3);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#facc15"; ctx.lineWidth = 2;
    ctx.strokeRect(x - 9, floatY - 11, 18, 13);
  } else if (type === "positive_feedback" || type === "review") {
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath(); ctx.arc(x, floatY, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fef08a";
    ctx.beginPath(); ctx.arc(x, floatY, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#b45309";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("★", x, floatY + 5);
  } else {
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(x - 11, floatY - 13, 22, 19);
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(x - 8, floatY - 15, 16, 6);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(x - 4, floatY - 4, 8, 8);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(x - 2, floatY - 2, 4, 4);
  }

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 30, floatY + 16, 60, 13);
  ctx.fillStyle = "#fef08a";
  ctx.font = "bold 8px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label.slice(0, 11), x, floatY + 25);
}

// Draw Hazard Entity
function drawHazardEntity(ctx, entity, time) {
  const x = entity.x;
  const y = entity.y;
  const pulse = Math.sin(time * 5 + entity.x) * 3;
  const type = entity.type || "envelope";
  const label = entity.label || "Cạm bẫy";

  ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + Math.sin(time * 6) * 0.3})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 20 + pulse, 0, Math.PI * 2);
  ctx.stroke();

  if (type === "envelope") {
    ctx.fillStyle = "#b91c1c";
    ctx.fillRect(x - 13, y - 9, 26, 18);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 13, y - 9, 26, 18);
  } else if (type === "waste") {
    ctx.fillStyle = "#475569";
    ctx.fillRect(x - 11, y - 13, 22, 22);
    ctx.fillStyle = "#eab308";
    ctx.fillRect(x - 9, y - 7, 18, 9);
  } else {
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.moveTo(x, y - 15); ctx.lineTo(x + 15, y + 11); ctx.lineTo(x - 15, y + 11);
    ctx.closePath(); ctx.fill();
  }

  ctx.fillStyle = "#7f1d1d";
  ctx.fillRect(x - 32, y + 16, 64, 13);
  ctx.fillStyle = "#fca5a5";
  ctx.font = "bold 8px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label.slice(0, 12), x, y + 25);
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
  ctx.beginPath(); ctx.arc(x, bubbleY, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#0284c7";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  const icons = ["📋", "⭐", "❤️", "?"];
  const iconIdx = Math.floor(time * 0.8) % icons.length;
  ctx.fillText(icons[iconIdx], x, bubbleY + 3.5);

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 35, y + 16, 70, 13);
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 8px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.fillText(label.slice(0, 13), x, y + 25);
}

// ----------------------------------------------------
// MINI-MAP RADAR HUD (Screen Space Overlay)
// ----------------------------------------------------
function drawMiniMapRadar() {
  const mmW = 160;
  const mmH = 95;
  const mmX = VIEW_WIDTH - mmW - 14;
  const mmY = 14;

  // Radar Box
  context.fillStyle = "rgba(15, 23, 42, 0.9)";
  context.fillRect(mmX, mmY, mmW, mmH);
  context.strokeStyle = "#38bdf8";
  context.lineWidth = 2;
  context.strokeRect(mmX, mmY, mmW, mmH);

  // Mini Roads
  const mapToMmX = (wx) => mmX + (wx / MAP_WIDTH) * mmW;
  const mapToMmY = (wy) => mmY + (wy / MAP_HEIGHT) * mmH;

  context.fillStyle = "rgba(51, 65, 85, 0.6)";
  context.fillRect(mmX, mapToMmY(600), mmW, (180 / MAP_HEIGHT) * mmH);
  context.fillRect(mapToMmX(720), mmY, (160 / MAP_WIDTH) * mmW, mmH);
  context.fillRect(mapToMmX(1520), mmY, (160 / MAP_WIDTH) * mmW, mmH);

  // Mini Buildings
  for (const bldg of BUILDINGS) {
    const mx = mapToMmX(bldg.x - bldg.w / 2);
    const my = mapToMmY(bldg.y - bldg.h / 2);
    const mw = (bldg.w / MAP_WIDTH) * mmW;
    const mh = (bldg.h / MAP_HEIGHT) * mmH;

    context.fillStyle = bldg.themeColor;
    context.fillRect(mx, my, mw, mh);
    context.strokeStyle = bldg.accentColor;
    context.lineWidth = 1;
    context.strokeRect(mx, my, mw, mh);
  }

  // Active Collectible Items & Traps
  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (kind === "players" || !entities || typeof entities !== "object") continue;
    for (const [id, entity] of Object.entries(entities)) {
      if (!entity) continue;
      const fullId = entity.id || id;
      if (state.collectedIds.has(fullId) || state.resolvedCollisionIds.has(fullId)) continue;
      if (options.role === "player" && isEntityResolvedForPlayer(entity, options.playerId)) continue;

      const px = mapToMmX(toWorldX(entity.x));
      const py = mapToMmY(toWorldY(entity.y));

      context.fillStyle = kind === "items" || kind === "books" ? "#facc15" : kind === "hazards" || kind === "traps" ? "#ef4444" : "#38bdf8";
      context.fillRect(px - 1.5, py - 1.5, 3, 3);
    }
  }

  // Camera Viewport Frustum Box
  const camBoxX = mapToMmX(camera.x);
  const camBoxY = mapToMmY(camera.y);
  const camBoxW = (VIEW_WIDTH / MAP_WIDTH) * mmW;
  const camBoxH = (VIEW_HEIGHT / MAP_HEIGHT) * mmH;

  context.strokeStyle = "#ffffff";
  context.lineWidth = 1;
  context.strokeRect(camBoxX, camBoxY, camBoxW, camBoxH);

  // Local Player Dot
  const lpx = mapToMmX(state.player.x);
  const lpy = mapToMmY(state.player.y);
  context.fillStyle = "#22c55e";
  context.beginPath(); context.arc(lpx, lpy, 3.5, 0, Math.PI * 2); context.fill();

  // Radar Title Tag
  context.fillStyle = "#38bdf8";
  context.font = "bold 7px monospace";
  context.textAlign = "left";
  context.fillText("RADAR BẢN ĐỒ THÀNH PHỐ", mmX + 5, mmY + 9);
}

// ----------------------------------------------------
// MAIN RENDER SCENE
// ----------------------------------------------------
function drawScene() {
  const time = state.gameTime;

  // Smooth Camera Tracking (Lerp follow player)
  const targetCamX = state.player.x - VIEW_WIDTH / 2;
  const targetCamY = state.player.y - VIEW_HEIGHT / 2;
  camera.x += (Math.max(0, Math.min(MAP_WIDTH - VIEW_WIDTH, targetCamX)) - camera.x) * 0.12;
  camera.y += (Math.max(0, Math.min(MAP_HEIGHT - VIEW_HEIGHT, targetCamY)) - camera.y) * 0.12;

  context.save();

  // Screen shake
  if (state.screenShakeTimer > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShakeIntensity * 2;
    const shakeY = (Math.random() - 0.5) * state.screenShakeIntensity * 2;
    context.translate(shakeX, shakeY);
  }

  // 1. CAMERA TRANSLATION INTO WORLD SPACE
  context.translate(-camera.x, -camera.y);

  // 2. Draw Pixel City Ground & Roads
  drawCityGround();

  // 3. Draw 6 Grand Pixel Buildings
  drawCityBuildings(time);

  // 4. Interactive World Entities
  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (kind === "players" || !entities || typeof entities !== "object") continue;
    for (const [id, entity] of Object.entries(entities)) {
      if (!entity) continue;
      const fullEntity = {
        ...entity,
        id: entity.id || id,
        kind: entity.kind || kind.slice(0, -1),
        x: toWorldX(entity.x),
        y: toWorldY(entity.y),
      };

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

  // 5. Remote Players
  for (const [id, remote] of Object.entries(state.snapshot.players)) {
    if (options.role !== "player" || id !== options.playerId) {
      drawPixelCharacter(context, toWorldX(remote.x), toWorldY(remote.y), {
        name: remote.name || remote.id || "Cán bộ",
        color: remote.color || "#64748b",
        isLocal: false,
        isMoving: false,
      });
    }
  }

  // 6. Local Player
  if (options.role === "player") {
    drawPixelCharacter(context, state.player.x, state.player.y, {
      name: state.player.name || options.playerName,
      color: state.player.color || options.color,
      isLocal: true,
      isMoving: activeInput() && !state.frozen,
    });
  }

  // 7. Particles Update & Render (in world space)
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

  // 8. Floating Combat Text (in world space)
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

  context.restore(); // RESTORE TO SCREEN SPACE

  // ----------------------------------------------------
  // SCREEN SPACE OVERLAYS (HUD, RADAR, ACTION PROMPTS)
  // ----------------------------------------------------

  // 9. Mini-Map Radar HUD
  drawMiniMapRadar();

  // 10. Interactive Action HUD & Prompt
  if (options.role === "player" && (state.nearbyBuilding || state.carriedItem)) {
    const bldg = state.nearbyBuilding;
    const promptText = state.carriedItem
      ? `⚡ BẤM [E / SPACE / XỬ LÝ] ĐỂ ĐÓNG DẤU & NỘP: ${state.carriedItem.label.toUpperCase()}`
      : `⚡ BẤM [E / SPACE] ${bldg ? bldg.actionLabel.toUpperCase() : "TƯƠNG TÁC"}`;

    const promptY = VIEW_HEIGHT - 24;
    context.fillStyle = "rgba(15, 23, 42, 0.95)";
    context.fillRect(VIEW_WIDTH / 2 - 240, promptY - 14, 480, 26);
    context.strokeStyle = "#facc15";
    context.lineWidth = 2;
    context.strokeRect(VIEW_WIDTH / 2 - 240, promptY - 14, 480, 26);

    context.fillStyle = "#fef08a";
    context.font = "bold 11px 'Silkscreen', 'VT323', monospace, sans-serif";
    context.textAlign = "center";
    context.fillText(promptText, VIEW_WIDTH / 2, promptY + 3);
  }

  // 11. Frozen Overlay
  if (state.frozen) {
    context.fillStyle = "rgba(14, 165, 233, 0.25)";
    context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    context.fillStyle = "#f0f9ff";
    context.font = "bold 20px 'Silkscreen', 'VT323', monospace, sans-serif";
    context.textAlign = "center";
    context.fillText("❄ ĐANG TẠM DỪNG / ĐÓNG BĂNG ❄", VIEW_WIDTH / 2, VIEW_HEIGHT / 2);
  }

  // 12. Scanlines
  if (state.scanlines) {
    context.fillStyle = "rgba(0, 0, 0, 0.08)";
    for (let y = 0; y < VIEW_HEIGHT; y += 4) {
      context.fillRect(0, y, VIEW_WIDTH, 1.5);
    }
  }

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
    state.player = movePlayer(state.player, input, deltaSeconds, { width: MAP_WIDTH, height: MAP_HEIGHT });
    if (now - state.lastMovePostedAt >= 100) {
      state.lastMovePostedAt = now;
      postToParent({
        type: "PLAYER_MOVE",
        playerId: options.playerId,
        x: Math.round(toSnapX(state.player.x)),
        y: Math.round(toSnapY(state.player.y)),
        direction: activeDirection(),
      });
    }
  }

  updateNearbyBuilding();
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
