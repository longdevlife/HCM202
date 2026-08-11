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
  stepComplete: () => {
    playTone(659.25, "triangle", 0.08, 0.2); // E5
    setTimeout(() => playTone(783.99, "triangle", 0.1, 0.22), 60); // G5
    setTimeout(() => playTone(1046.5, "triangle", 0.14, 0.25), 120); // C6
  },
  stamp: () => {
    playTone(140, "triangle", 0.14, 0.35); // Low thump
    setTimeout(() => playTone(880, "square", 0.08, 0.18), 40); // Click
    setTimeout(() => playTone(1046.5, "triangle", 0.16, 0.22), 90); // Chime C6
    setTimeout(() => playTone(1318.5, "triangle", 0.2, 0.2), 160); // Fanfare E6
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
// 6 GRAND CITY BUILDINGS & SOLID WALL BOUNDARIES
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
    stationY: 315,
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
    stationY: 305,
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
    stationY: 315,
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

const BUILDINGS_BY_ID = Object.fromEntries(BUILDINGS.map((b) => [b.id, b]));

// SOLID BUILDING COLLISION RESOLUTION (Player cannot pass through buildings)
function resolveSolidBuildingCollisions(x, y, radius = 14) {
  let resolvedX = x;
  let resolvedY = y;

  for (const bldg of BUILDINGS) {
    const bx = bldg.x - bldg.w / 2;
    const by = bldg.y - bldg.h / 2;
    const bw = bldg.w;
    // Solid top & walls: leave bottom entrance pad area accessible
    const bh = bldg.h - 50;

    const nearestX = Math.max(bx, Math.min(resolvedX, bx + bw));
    const nearestY = Math.max(by, Math.min(resolvedY, by + bh));

    const dx = resolvedX - nearestX;
    const dy = resolvedY - nearestY;
    const distSq = dx * dx + dy * dy;

    if (distSq < radius * radius) {
      const dist = Math.sqrt(distSq) || 0.001;
      const overlap = radius - dist;
      resolvedX += (dx / dist) * overlap;
      resolvedY += (dy / dist) * overlap;
    }
  }

  return { x: resolvedX, y: resolvedY };
}

// ----------------------------------------------------
// DYNAMIC MULTI-STEP DOSSIER QUEST DEFINITIONS
// ----------------------------------------------------
const DOSSIER_QUEST_CONFIGS = {
  case_file: {
    title: "Hồ Sơ Cấp Phép Hành Chính",
    icon: "📄",
    color: "#38bdf8",
    steps: [
      {
        bldgId: "bldg_inspection",
        instruction: "Mang hồ sơ qua Viện Thanh Tra để thẩm tra thực địa & chống tiêu cực",
        actionText: "Thẩm tra hồ sơ",
      },
      {
        bldgId: "bldg_stamp",
        instruction: "Đưa tới Tòa Tháp Đóng Dấu để niêm phong & phê duyệt chính thức",
        actionText: "Đóng dấu phê duyệt",
      },
    ],
  },
  integrity_item: {
    title: "Hồ Sơ Kê Khai & Liêm Chính",
    icon: "🛡️",
    color: "#10b981",
    steps: [
      {
        bldgId: "bldg_inspection",
        instruction: "Thực hiện giải trình công tâm tại Viện Thanh Tra & Giám Sát",
        actionText: "Kê khai & Giải trình",
      },
      {
        bldgId: "bldg_server",
        instruction: "Đồng bộ dữ liệu số hóa lên Cổng Thông Tin Dữ Liệu Quốc Gia",
        actionText: "Số hóa & Xác thực",
      },
    ],
  },
  transparency: {
    title: "Hồ Sơ Đấu Thầu & Minh Bạch Ngân Sách",
    icon: "💻",
    color: "#06b6d4",
    steps: [
      {
        bldgId: "bldg_server",
        instruction: "Niêm yết thông tin công khai tại Trung Tâm Dữ Liệu Số Hóa",
        actionText: "Niêm yết mạng",
      },
      {
        bldgId: "bldg_stamp",
        instruction: "Ký duyệt chứng thư số tại Tòa Tháp Đóng Dấu Công Vụ",
        actionText: "Ký chứng thư số",
      },
    ],
  },
  positive_feedback: {
    title: "Phản Ánh Dân Sinh & Đánh Giá 5 Sao",
    icon: "⭐",
    color: "#f59e0b",
    steps: [
      {
        bldgId: "bldg_feedback",
        instruction: "Lắng nghe nguyện vọng của công dân tại Nhà Văn Hóa Tiếp Dân",
        actionText: "Lắng nghe ý kiến",
      },
      {
        bldgId: "bldg_reception",
        instruction: "Chuyển trả kết quả xử lý tại Tòa Nhà Tiếp Nhận Một Cửa",
        actionText: "Trả kết quả",
      },
    ],
  },
  accountability: {
    title: "Hồ Sơ Trách Nhiệm Giải Trình",
    icon: "⚖️",
    color: "#f59e0b",
    steps: [
      {
        bldgId: "bldg_inspection",
        instruction: "Kiểm tra trách nhiệm giải trình tại Viện Thanh Tra",
        actionText: "Kiểm tra độc lập",
      },
      {
        bldgId: "bldg_portal",
        instruction: "Báo cáo công khai tại Đại Sảnh Quảng Trường Công Khai",
        actionText: "Công khai kết quả",
      },
    ],
  },
  serve_people: {
    title: "Hồ Sơ Trợ Cấp An Sinh Xã Hội",
    icon: "❤️",
    color: "#ec4899",
    steps: [
      {
        bldgId: "bldg_feedback",
        instruction: "Khảo sát hoàn cảnh người yếu thế tại Nhà Văn Hóa Tiếp Dân",
        actionText: "Khảo sát an sinh",
      },
      {
        bldgId: "bldg_stamp",
        instruction: "Phê duyệt chi trả trợ cấp tại Tòa Tháp Đóng Dấu",
        actionText: "Phê duyệt trợ cấp",
      },
    ],
  },
};

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
    maxLife: 1.5,
    vy: -35,
  });
}

// ----------------------------------------------------
// DYNAMIC MOVING HAZARDS / PATROLLING OBSTACLES SYSTEM
// ----------------------------------------------------
const movingHazardsState = new Map(); // id -> { x, y, vx, vy, speed, radius, trailTimer }

function getOrCreateMovingHazard(entity, id) {
  if (movingHazardsState.has(id)) {
    return movingHazardsState.get(id);
  }

  // Hash id to generate deterministic dynamic movement vectors
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const angle = ((absHash % 360) * Math.PI) / 180;
  const speed = 75 + (absHash % 45); // 75 - 120 px/sec

  const hazard = {
    id,
    x: toWorldX(entity.x),
    y: toWorldY(entity.y),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    speed,
    radius: 18,
    trailTimer: 0,
  };

  movingHazardsState.set(id, hazard);
  return hazard;
}

function updateMovingHazards(deltaSeconds) {
  for (const [id, hazard] of movingHazardsState.entries()) {
    if (state.collectedIds.has(id) || state.resolvedCollisionIds.has(id)) {
      movingHazardsState.delete(id);
      continue;
    }

    hazard.x += hazard.vx * deltaSeconds;
    hazard.y += hazard.vy * deltaSeconds;

    // Bounce on map boundaries
    if (hazard.x < 60) { hazard.x = 60; hazard.vx = Math.abs(hazard.vx); }
    if (hazard.x > MAP_WIDTH - 60) { hazard.x = MAP_WIDTH - 60; hazard.vx = -Math.abs(hazard.vx); }
    if (hazard.y < 60) { hazard.y = 60; hazard.vy = Math.abs(hazard.vy); }
    if (hazard.y > MAP_HEIGHT - 60) { hazard.y = MAP_HEIGHT - 60; hazard.vy = -Math.abs(hazard.vy); }

    // Bounce on solid building walls
    for (const bldg of BUILDINGS) {
      const bx = bldg.x - bldg.w / 2;
      const by = bldg.y - bldg.h / 2;
      const bw = bldg.w;
      const bh = bldg.h - 50;

      if (
        hazard.x + hazard.radius > bx &&
        hazard.x - hazard.radius < bx + bw &&
        hazard.y + hazard.radius > by &&
        hazard.y - hazard.radius < by + bh
      ) {
        // Reverse velocity component
        if (hazard.x < bx + 20 || hazard.x > bx + bw - 20) hazard.vx = -hazard.vx;
        if (hazard.y < by + 20 || hazard.y > by + bh - 20) hazard.vy = -hazard.vy;
      }
    }

    // Trailing Danger Particle Spark
    hazard.trailTimer += deltaSeconds;
    if (hazard.trailTimer >= 0.08) {
      hazard.trailTimer = 0;
      particles.push({
        x: hazard.x + (Math.random() - 0.5) * 6,
        y: hazard.y + (Math.random() - 0.5) * 6,
        vx: -hazard.vx * 0.2,
        vy: -hazard.vy * 0.2,
        color: "#ef4444",
        shape: "rect",
        size: Math.random() * 3 + 1.5,
        life: 0,
        maxLife: 0.35,
      });
    }
  }
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
  activeQuest: null,
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
    if (dist <= bldg.radius + 25 && dist < minDist) {
      minDist = dist;
      closest = bldg;
    }
  }
  state.nearbyBuilding = closest;
}

// ----------------------------------------------------
// DYNAMIC MULTI-STEP QUEST WORKFLOW EXECUTION
// ----------------------------------------------------
function executePlayerAction() {
  if (options.role !== "player" || state.frozen) return;
  getAudioContext();

  // A. IF CURRENTLY ENGAGED IN A MULTI-STEP DOSSIER QUEST:
  if (state.activeQuest) {
    const quest = state.activeQuest;
    const currentStep = quest.steps[quest.currentStepIndex];
    const targetBldg = BUILDINGS_BY_ID[currentStep.bldgId];

    const isAtTarget = state.nearbyBuilding && state.nearbyBuilding.id === currentStep.bldgId;

    if (isAtTarget) {
      const isFinalStep = quest.currentStepIndex >= quest.totalSteps - 1;

      if (!isFinalStep) {
        quest.currentStepIndex += 1;
        const nextStep = quest.steps[quest.currentStepIndex];
        const nextBldg = BUILDINGS_BY_ID[nextStep.bldgId];

        sfx.stepComplete();
        spawnParticles(state.player.x, state.player.y, quest.color || "#38bdf8", 16, 90, "star");
        spawnFloatingText(
          state.player.x,
          state.player.y,
          `✓ Xong bước ${quest.currentStepIndex}/${quest.totalSteps}! Tiếp tục đến ${nextBldg.name}!`,
          "#38bdf8"
        );
      } else {
        sfx.stamp();
        spawnParticles(state.player.x, state.player.y, "#f59e0b", 24, 120, "star");
        spawnFloatingText(
          state.player.x,
          state.player.y,
          `★ HOÀN THÀNH TOÀN DIỆN: ${quest.title}! (+30 Điểm Công Vụ)`,
          "#4ade80"
        );

        postToParent({ type: "NHAT_SACH", bookId: quest.entityId });
        state.activeQuest = null;
      }
      return;
    } else {
      spawnFloatingText(
        state.player.x,
        state.player.y,
        `Cần đến: ${targetBldg.name}! (Theo dõi mũi tên vàng)`,
        "#fbbf24"
      );
      return;
    }
  }

  // B. IF NEAR A BUILDING (Free Interactive Actions):
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

  // C. SCAN NEARBY COLLECTIBLES ON THE STREET TO INITIATE QUEST:
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

  // A. ITEM (Hồ sơ): Nhặt hồ sơ và khởi tạo chuỗi nhiệm vụ tương tác qua các tòa nhà!
  if (entity.kind === "item") {
    state.collectedIds.add(entity.id);
    state.resolvedCollisionIds.add(entity.id);
    sfx.pickup();
    spawnParticles(entity.x, entity.y, entity.color || "#ffdf6e", 12, 70, "star");

    const questConfig = DOSSIER_QUEST_CONFIGS[entity.type] || DOSSIER_QUEST_CONFIGS.case_file;
    state.activeQuest = {
      entityId: entity.id,
      typeKey: entity.type || "case_file",
      title: questConfig.title,
      icon: questConfig.icon,
      color: questConfig.color,
      currentStepIndex: 0,
      totalSteps: questConfig.steps.length,
      steps: questConfig.steps,
    };

    const firstStep = state.activeQuest.steps[0];
    const targetBldg = BUILDINGS_BY_ID[firstStep.bldgId];

    spawnFloatingText(
      state.player.x,
      state.player.y,
      `NHẬN NHIỆM VỤ: ${questConfig.title}! Đến ${targetBldg.name}`,
      "#38bdf8"
    );
    return;
  }

  // B. DYNAMIC MOVING HAZARD: Va chạm -> phát nổ và BIẾN MẤT VĨNH VIỄN để tránh spam!
  if (entity.kind === "hazard") {
    state.resolvedCollisionIds.add(entity.id);
    state.collectedIds.add(entity.id);
    movingHazardsState.delete(entity.id);

    sfx.hazard();
    triggerScreenShake(9, 0.35);
    spawnParticles(entity.x, entity.y, "#ef4444", 22, 110, "ember");
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
  // 1. Static Entities (Items, NPCs, Gates)
  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (!Array.isArray(entities) && entities && typeof entities === "object") {
      for (const [id, entity] of Object.entries(entities)) {
        if (kind === "players" || kind === "hazards" || kind === "traps" || !entity) continue;
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

  // 2. Dynamic Moving Hazards Collision Check
  for (const [id, mHazard] of movingHazardsState.entries()) {
    if (state.collectedIds.has(id) || state.resolvedCollisionIds.has(id)) continue;
    const snapHazard = state.snapshot.hazards?.[id] || state.snapshot.traps?.[id];
    if (!snapHazard) continue;

    const dynamicEntity = {
      ...snapHazard,
      id,
      kind: "hazard",
      x: mHazard.x,
      y: mHazard.y,
      radius: mHazard.radius,
    };
    handleEntityInteraction(dynamicEntity, now);
  }
}

// ----------------------------------------------------
// PIXEL CITY GRAPHICS & BUILDING RENDERING
// ----------------------------------------------------

function drawCityGround() {
  context.fillStyle = "#1e293b";
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  const roadColor = "#0f172a";
  const laneColor = "#facc15";

  // Main Horizontal Avenue
  context.fillStyle = roadColor;
  context.fillRect(0, 600, MAP_WIDTH, 180);
  context.strokeStyle = laneColor;
  context.lineWidth = 4;
  context.setLineDash([28, 20]);
  context.beginPath();
  context.moveTo(0, 690); context.lineTo(MAP_WIDTH, 690);
  context.stroke();
  context.setLineDash([]);

  // Vertical Avenues
  context.fillStyle = roadColor;
  context.fillRect(720, 0, 160, MAP_HEIGHT);
  context.fillRect(1520, 0, 160, MAP_HEIGHT);

  context.strokeStyle = laneColor;
  context.lineWidth = 4;
  context.setLineDash([28, 20]);
  context.beginPath();
  context.moveTo(800, 0); context.lineTo(800, MAP_HEIGHT);
  context.moveTo(1600, 0); context.lineTo(1600, MAP_HEIGHT);
  context.stroke();
  context.setLineDash([]);

  // Crosswalks
  drawCrosswalk(680, 600, 40, 180, true);
  drawCrosswalk(880, 600, 40, 180, true);
  drawCrosswalk(1480, 600, 40, 180, true);
  drawCrosswalk(1680, 600, 40, 180, true);

  // Sidewalks
  drawSidewalk(80, 80, 580, 500);
  drawSidewalk(910, 80, 580, 500);
  drawSidewalk(1710, 80, 580, 500);

  drawSidewalk(80, 800, 580, 520);
  drawSidewalk(910, 800, 580, 520);
  drawSidewalk(1710, 800, 580, 520);

  // Central Fountain
  drawCentralPlazaFountain(1200, 690, state.gameTime);
}

function drawCrosswalk(x, y, w, h, isVertical) {
  context.fillStyle = "#ffffff";
  if (isVertical) {
    for (let i = y + 10; i < y + h - 10; i += 22) context.fillRect(x, i, w, 12);
  } else {
    for (let i = x + 10; i < x + w - 10; i += 22) context.fillRect(i, y, 12, h);
  }
}

function drawSidewalk(x, y, w, h) {
  context.fillStyle = "#334155";
  context.fillRect(x, y, w, h);
  context.strokeStyle = "#475569";
  context.lineWidth = 3;
  context.strokeRect(x, y, w, h);

  context.fillStyle = "rgba(255, 255, 255, 0.025)";
  for (let py = y + 8; py < y + h - 8; py += 32) {
    for (let px = x + 8; px < x + w - 8; px += 32) context.fillRect(px, py, 28, 28);
  }
}

function drawCentralPlazaFountain(cx, cy, time) {
  context.fillStyle = "#1e293b";
  context.beginPath(); context.arc(cx, cy, 70, 0, Math.PI * 2); context.fill();
  context.strokeStyle = "#facc15";
  context.lineWidth = 3;
  context.stroke();

  context.fillStyle = "#0284c7";
  context.beginPath(); context.arc(cx, cy, 54, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#38bdf8";
  context.beginPath(); context.arc(cx, cy, 48, 0, Math.PI * 2); context.fill();

  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 + time * 2;
    const dist = 18 + Math.sin(time * 4 + i) * 16;
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 3.5, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = "#e2e8f0";
  context.beginPath(); context.arc(cx, cy, 14, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#facc15";
  context.font = "bold 14px sans-serif";
  context.textAlign = "center";
  context.fillText("★", cx, cy + 5);
}

// Draw Grand Pixel Buildings with Solid Wall Borders & Waypoints
function drawCityBuildings(time) {
  const activeTargetBldgId = state.activeQuest
    ? state.activeQuest.steps[state.activeQuest.currentStepIndex]?.bldgId
    : null;

  for (const bldg of BUILDINGS) {
    const bx = bldg.x - bldg.w / 2;
    const by = bldg.y - bldg.h / 2;
    const isTarget = activeTargetBldgId === bldg.id;

    // 0. Active Target Waypoint Beacon Light Column
    if (isTarget) {
      const gradBeam = context.createLinearGradient(0, by - 120, 0, by + bldg.h);
      gradBeam.addColorStop(0, "rgba(250, 204, 21, 0.45)");
      gradBeam.addColorStop(0.6, "rgba(56, 189, 248, 0.2)");
      gradBeam.addColorStop(1, "rgba(56, 189, 248, 0)");
      context.fillStyle = gradBeam;
      context.fillRect(bldg.stationX - 35, by - 120, 70, bldg.h + 120);

      const pinY = by - 30 + Math.sin(time * 6) * 6;
      context.fillStyle = "#facc15";
      context.font = "bold 20px sans-serif";
      context.textAlign = "center";
      context.fillText("📍", bldg.stationX, pinY);

      context.fillStyle = "#fef08a";
      context.font = "bold 10px 'Silkscreen', 'VT323', monospace, sans-serif";
      context.fillText("MỤC TIÊU TIẾP THEO", bldg.stationX, pinY - 14);
    }

    // 1. Building Drop Shadow
    context.fillStyle = "rgba(0, 0, 0, 0.55)";
    context.fillRect(bx + 15, by + 18, bldg.w, bldg.h);

    // 2. Solid Wall Facade
    context.fillStyle = "#0f172a";
    context.fillRect(bx, by, bldg.w, bldg.h - 35);
    context.strokeStyle = isTarget ? "#facc15" : bldg.themeColor;
    context.lineWidth = isTarget ? 4 : 3;
    context.strokeRect(bx, by, bldg.w, bldg.h - 35);

    // Solid Wall "No Entry" warning lines on top of buildings
    context.fillStyle = "rgba(239, 68, 68, 0.15)";
    context.fillRect(bx, by, bldg.w, 14);

    // 3. Roof Cornice
    context.fillStyle = bldg.themeColor;
    context.fillRect(bx - 6, by - 12, bldg.w + 12, 24);
    context.fillStyle = isTarget ? "#facc15" : bldg.accentColor;
    context.fillRect(bx - 2, by + 10, bldg.w + 4, 4);

    // 4. Windows
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
        const isLit = Math.sin(time * 2 + r * 3 + c * 5) > -0.2;

        context.fillStyle = isLit ? "rgba(254, 240, 138, 0.85)" : "#1e293b";
        context.fillRect(wx, wy, winW, winH);
        context.strokeStyle = "#334155";
        context.lineWidth = 1.5;
        context.strokeRect(wx, wy, winW, winH);

        context.strokeStyle = "#0f172a";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(wx + winW / 2, wy); context.lineTo(wx + winW / 2, wy + winH);
        context.moveTo(wx, wy + winH / 2); context.lineTo(wx + winW, wy + winH / 2);
        context.stroke();
      }
    }

    // 5. Entrance & Station Pad (Walkable in front)
    const entranceW = 120;
    const entranceH = 50;
    const ex = bldg.stationX - entranceW / 2;
    const ey = by + bldg.h - entranceH;

    context.fillStyle = "#1e293b";
    context.fillRect(ex, ey, entranceW, entranceH);
    context.strokeStyle = isTarget ? "#facc15" : bldg.accentColor;
    context.lineWidth = 2;
    context.strokeRect(ex, ey, entranceW, entranceH);

    context.fillStyle = "rgba(56, 189, 248, 0.4)";
    context.fillRect(ex + 15, ey + 8, entranceW - 30, entranceH - 8);

    // Glowing Station Pad Ring
    const pulse = Math.sin(time * (isTarget ? 7 : 4)) * (isTarget ? 6 : 4);
    context.strokeStyle = isTarget ? "#facc15" : bldg.accentColor;
    context.lineWidth = isTarget ? 3 : 2;
    context.beginPath();
    context.arc(bldg.stationX, bldg.stationY, bldg.radius + pulse, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = isTarget ? "rgba(250, 204, 21, 0.25)" : `${bldg.themeColor}33`;
    context.beginPath();
    context.arc(bldg.stationX, bldg.stationY, bldg.radius - 8, 0, Math.PI * 2);
    context.fill();

    // 6. Signboard
    const signW = bldg.w - 60;
    const signH = 34;
    const sx = bldg.x - signW / 2;
    const sy = by + 18;

    context.fillStyle = "rgba(15, 23, 42, 0.95)";
    context.fillRect(sx, sy, signW, signH);
    context.strokeStyle = isTarget ? "#facc15" : bldg.accentColor;
    context.lineWidth = 2;
    context.strokeRect(sx, sy, signW, signH);

    context.fillStyle = isTarget ? "#facc15" : "#ffffff";
    context.font = "bold 13px 'Silkscreen', 'VT323', monospace, sans-serif";
    context.textAlign = "center";
    context.fillText(bldg.name, bldg.x, sy + 16);

    context.fillStyle = isTarget ? "#fef08a" : "#94a3b8";
    context.font = "11px 'VT323', monospace, sans-serif";
    context.fillText(bldg.sub, bldg.x, sy + 28);

    // Decor
    drawStreetLamp(bx + 15, by + bldg.h + 20, time);
    drawStreetLamp(bx + bldg.w - 15, by + bldg.h + 20, time);
    drawCityTree(bx - 25, by + bldg.h / 2);
    drawCityTree(bx + bldg.w + 25, by + bldg.h / 2);
  }
}

function drawStreetLamp(x, y, time) {
  context.fillStyle = "#475569";
  context.fillRect(x - 2, y - 36, 4, 36);
  context.fillStyle = "#facc15";
  context.beginPath(); context.arc(x, y - 38, 7, 0, Math.PI * 2); context.fill();

  const grad = context.createRadialGradient(x, y - 38, 4, x, y, 40);
  grad.addColorStop(0, "rgba(250, 204, 21, 0.2)");
  grad.addColorStop(1, "rgba(250, 204, 21, 0)");
  context.fillStyle = grad;
  context.beginPath(); context.arc(x, y - 20, 36, 0, Math.PI * 2); context.fill();
}

function drawCityTree(x, y) {
  context.fillStyle = "#78350f";
  context.fillRect(x - 5, y - 10, 10, 24);
  context.fillStyle = "#15803d";
  context.beginPath(); context.arc(x, y - 24, 22, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#22c55e";
  context.beginPath(); context.arc(x - 6, y - 28, 14, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#4ade80";
  context.beginPath(); context.arc(x + 6, y - 32, 10, 0, Math.PI * 2); context.fill();
}

// ----------------------------------------------------
// PIXEL SPRITE RENDERERS & WAYPOINT NAVIGATION ARROW
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

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + 14, 13, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shoes
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 7, bobY + 10 + footOffset, 5, 4);
  ctx.fillRect(x + 2, bobY + 10 - footOffset, 5, 4);

  // Pants
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
  if (isLocal && state.activeQuest) {
    const carryY = bobY - 44 + Math.sin(time * 6) * 3;
    ctx.fillStyle = state.activeQuest.color || "#0284c7";
    ctx.fillRect(x - 10, carryY - 8, 20, 15);
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(x - 7, carryY - 10, 14, 4);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(x - 4, carryY - 2, 8, 6);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 10, carryY - 8, 20, 15);
  }

  // Waypoint Compass Arrow
  if (isLocal && state.activeQuest) {
    const currentStep = state.activeQuest.steps[state.activeQuest.currentStepIndex];
    const targetBldg = BUILDINGS_BY_ID[currentStep.bldgId];
    if (targetBldg) {
      const angle = Math.atan2(targetBldg.stationY - y, targetBldg.stationX - x);
      const orbitR = 36;
      const arrowTipX = x + Math.cos(angle) * orbitR;
      const arrowTipY = y + Math.sin(angle) * orbitR;

      ctx.save();
      ctx.translate(arrowTipX, arrowTipY);
      ctx.rotate(angle);
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-6, -6);
      ctx.lineTo(-6, 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Local Player Arrow
  if (isLocal) {
    const arrowY = bobY - (state.activeQuest ? 56 : 30) + Math.sin(time * 6) * 3;
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
  ctx.fillRect(x - tagW / 2, bobY - (state.activeQuest ? 34 : 30), tagW, 14);
  ctx.strokeStyle = isLocal ? "#38bdf8" : "#64748b";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - tagW / 2, bobY - (state.activeQuest ? 34 : 30), tagW, 14);

  ctx.fillStyle = isLocal ? "#38bdf8" : "#f1f5f9";
  ctx.font = "bold 9px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(name, x, bobY - (state.activeQuest ? 23 : 20));
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

// Draw Dynamic Moving Hazard Entity with Hazard Trail & Pulsing Siren
function drawHazardEntity(ctx, entity, time) {
  const x = entity.x;
  const y = entity.y;
  const pulse = Math.sin(time * 7 + entity.x) * 4;
  const type = entity.type || "envelope";
  const label = entity.label || "Cạm bẫy di chuyển";

  // Dynamic Hazard Alert Circle (Pulsing Danger Aura)
  ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 + Math.sin(time * 8) * 0.4})`;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, 22 + pulse, 0, Math.PI * 2);
  ctx.stroke();

  // Siren Exclamation Sign floating above moving hazard
  const sirenY = y - 24 + Math.sin(time * 8) * 3;
  ctx.fillStyle = "#ef4444";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("⚠️", x, sirenY);

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
  ctx.fillRect(x - 34, y + 16, 68, 13);
  ctx.fillStyle = "#fca5a5";
  ctx.font = "bold 8px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label.slice(0, 13), x, y + 25);
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

  context.fillStyle = "rgba(15, 23, 42, 0.9)";
  context.fillRect(mmX, mmY, mmW, mmH);
  context.strokeStyle = "#38bdf8";
  context.lineWidth = 2;
  context.strokeRect(mmX, mmY, mmW, mmH);

  const mapToMmX = (wx) => mmX + (wx / MAP_WIDTH) * mmW;
  const mapToMmY = (wy) => mmY + (wy / MAP_HEIGHT) * mmH;

  // Mini Roads
  context.fillStyle = "rgba(51, 65, 85, 0.6)";
  context.fillRect(mmX, mapToMmY(600), mmW, (180 / MAP_HEIGHT) * mmH);
  context.fillRect(mapToMmX(720), mmY, (160 / MAP_WIDTH) * mmW, mmH);
  context.fillRect(mapToMmX(1520), mmY, (160 / MAP_WIDTH) * mmW, mmH);

  const activeTargetBldgId = state.activeQuest
    ? state.activeQuest.steps[state.activeQuest.currentStepIndex]?.bldgId
    : null;

  // Mini Buildings
  for (const bldg of BUILDINGS) {
    const mx = mapToMmX(bldg.x - bldg.w / 2);
    const my = mapToMmY(bldg.y - bldg.h / 2);
    const mw = (bldg.w / MAP_WIDTH) * mmW;
    const mh = (bldg.h / MAP_HEIGHT) * mmH;
    const isTarget = activeTargetBldgId === bldg.id;

    context.fillStyle = isTarget ? "#facc15" : bldg.themeColor;
    context.fillRect(mx, my, mw, mh);
    context.strokeStyle = isTarget ? "#ffffff" : bldg.accentColor;
    context.lineWidth = isTarget ? 2 : 1;
    context.strokeRect(mx, my, mw, mh);
  }

  // Active Collectibles & Moving Hazards on Radar
  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (kind === "players" || !entities || typeof entities !== "object") continue;
    for (const [id, entity] of Object.entries(entities)) {
      if (!entity) continue;
      const fullId = entity.id || id;
      if (state.collectedIds.has(fullId) || state.resolvedCollisionIds.has(fullId)) continue;
      if (options.role === "player" && isEntityResolvedForPlayer(entity, options.playerId)) continue;

      let worldX = toWorldX(entity.x);
      let worldY = toWorldY(entity.y);

      // If moving hazard, use dynamic coordinates
      if (movingHazardsState.has(fullId)) {
        const mh = movingHazardsState.get(fullId);
        worldX = mh.x;
        worldY = mh.y;
      }

      const px = mapToMmX(worldX);
      const py = mapToMmY(worldY);

      context.fillStyle = kind === "items" || kind === "books" ? "#facc15" : kind === "hazards" || kind === "traps" ? "#ef4444" : "#38bdf8";
      context.fillRect(px - 1.5, py - 1.5, 3, 3);
    }
  }

  // Frustum Box
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

  context.fillStyle = "#38bdf8";
  context.font = "bold 7px monospace";
  context.textAlign = "left";
  context.fillText("RADAR THÀNH PHỐ", mmX + 5, mmY + 9);
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

  if (state.screenShakeTimer > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShakeIntensity * 2;
    const shakeY = (Math.random() - 0.5) * state.screenShakeIntensity * 2;
    context.translate(shakeX, shakeY);
  }

  // 1. CAMERA TRANSLATION INTO WORLD SPACE
  context.translate(-camera.x, -camera.y);

  // 2. Draw Ground & Roads
  drawCityGround();

  // 3. Draw 6 Grand Buildings (Solid Obstacles)
  drawCityBuildings(time);

  // 4. Interactive World Entities
  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (kind === "players" || !entities || typeof entities !== "object") continue;
    for (const [id, entity] of Object.entries(entities)) {
      if (!entity) continue;
      const fullId = entity.id || id;

      if (state.collectedIds.has(fullId) || state.resolvedCollisionIds.has(fullId)) continue;
      if (options.role === "player" && isEntityResolvedForPlayer(entity, options.playerId)) continue;

      if (kind === "items" || kind === "books") {
        drawItemEntity(context, { ...entity, id: fullId, kind: "item", x: toWorldX(entity.x), y: toWorldY(entity.y) }, time);
      } else if (kind === "hazards" || kind === "traps") {
        // Render at dynamic moving hazard coordinates
        const mHazard = getOrCreateMovingHazard(entity, fullId);
        drawHazardEntity(context, { ...entity, id: fullId, kind: "hazard", x: mHazard.x, y: mHazard.y }, time);
      } else if (kind === "npcs") {
        drawNpcEntity(context, { ...entity, id: fullId, kind: "npc", x: toWorldX(entity.x), y: toWorldY(entity.y) }, time);
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

  // 7. Particles
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

  // 8. Floating Combat Text
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
  // SCREEN SPACE OVERLAYS (QUEST TRACKER, RADAR, ACTION PROMPTS)
  // ----------------------------------------------------

  // 9. Mini-Map Radar HUD
  drawMiniMapRadar();

  // 10. Dynamic Quest Tracker Banner (Top-Left HUD)
  if (options.role === "player" && state.activeQuest) {
    const quest = state.activeQuest;
    const currentStep = quest.steps[quest.currentStepIndex];
    const targetBldg = BUILDINGS_BY_ID[currentStep.bldgId];

    const bannerW = 460;
    const bannerH = 46;
    const bx = 16;
    const by = 14;

    context.fillStyle = "rgba(15, 23, 42, 0.95)";
    context.fillRect(bx, by, bannerW, bannerH);
    context.strokeStyle = quest.color || "#38bdf8";
    context.lineWidth = 2;
    context.strokeRect(bx, by, bannerW, bannerH);

    context.fillStyle = "#facc15";
    context.font = "bold 10px 'Silkscreen', 'VT323', monospace, sans-serif";
    context.textAlign = "left";
    context.fillText(`📋 ${quest.title} (BƯỚC ${quest.currentStepIndex + 1}/${quest.totalSteps})`, bx + 10, by + 16);

    context.fillStyle = "#ffffff";
    context.font = "11px 'VT323', monospace, sans-serif";
    context.fillText(`➔ ${currentStep.instruction}`, bx + 10, by + 34);
  }

  // 11. Interactive Action HUD & Prompt (Bottom Bar)
  if (options.role === "player") {
    let promptText = null;

    if (state.activeQuest) {
      const currentStep = state.activeQuest.steps[state.activeQuest.currentStepIndex];
      const isAtTarget = state.nearbyBuilding && state.nearbyBuilding.id === currentStep.bldgId;
      const targetBldg = BUILDINGS_BY_ID[currentStep.bldgId];

      promptText = isAtTarget
        ? `⚡ BẤM [E / SPACE / XỬ LÝ] ĐỂ: ${currentStep.actionText.toUpperCase()} TẠI ${targetBldg.name}`
        : `➔ ĐANG MANG HỒ SƠ ĐẾN: ${targetBldg.name} (BƯỚC ${state.activeQuest.currentStepIndex + 1}/${state.activeQuest.totalSteps})`;
    } else if (state.nearbyBuilding) {
      promptText = `⚡ BẤM [E / SPACE] ${state.nearbyBuilding.actionLabel.toUpperCase()}`;
    }

    if (promptText) {
      const promptY = VIEW_HEIGHT - 24;
      context.fillStyle = "rgba(15, 23, 42, 0.95)";
      context.fillRect(VIEW_WIDTH / 2 - 250, promptY - 14, 500, 26);
      context.strokeStyle = "#facc15";
      context.lineWidth = 2;
      context.strokeRect(VIEW_WIDTH / 2 - 250, promptY - 14, 500, 26);

      context.fillStyle = "#fef08a";
      context.font = "bold 11px 'Silkscreen', 'VT323', monospace, sans-serif";
      context.textAlign = "center";
      context.fillText(promptText, VIEW_WIDTH / 2, promptY + 3);
    }
  }

  // 12. Frozen Overlay
  if (state.frozen) {
    context.fillStyle = "rgba(14, 165, 233, 0.25)";
    context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    context.fillStyle = "#f0f9ff";
    context.font = "bold 20px 'Silkscreen', 'VT323', monospace, sans-serif";
    context.textAlign = "center";
    context.fillText("❄ ĐANG TẠM DỪNG / ĐÓNG BĂNG ❄", VIEW_WIDTH / 2, VIEW_HEIGHT / 2);
  }

  // 13. Scanlines
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

  // Update dynamic moving hazards across city streets
  updateMovingHazards(deltaSeconds);

  // Move player with SOLID BUILDING COLLISION BLOCKING
  if (!state.frozen && options.role === "player" && activeInput()) {
    const rawMoved = movePlayer(state.player, input, deltaSeconds, { width: MAP_WIDTH, height: MAP_HEIGHT });
    // Apply solid wall collision blocking
    const blockedPos = resolveSolidBuildingCollisions(rawMoved.x, rawMoved.y, state.player.radius);
    state.player = {
      ...rawMoved,
      x: blockedPos.x,
      y: blockedPos.y,
    };

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
