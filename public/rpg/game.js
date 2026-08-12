import {
  circlesOverlap,
  collisionMessage,
  interpolatePosition,
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

// URL Parameters for Character Customization
const searchParams = new URLSearchParams(window.location.search);
const initialCharacterId = searchParams.get("character") || "male_reception";
const initialGender = searchParams.get("gender") || (initialCharacterId.startsWith("female") ? "female" : "male");
const initialPhaseParam = searchParams.get("phase");

// Audio Synthesizer (Web Audio API)
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
    playTone(523.25, "square", 0.06, 0.15);
    setTimeout(() => playTone(659.25, "square", 0.08, 0.18), 50);
  },
  stepComplete: () => {
    playTone(659.25, "triangle", 0.08, 0.2);
    setTimeout(() => playTone(783.99, "triangle", 0.1, 0.22), 60);
    setTimeout(() => playTone(1046.5, "triangle", 0.14, 0.25), 120);
  },
  stamp: () => {
    playTone(140, "triangle", 0.14, 0.35);
    setTimeout(() => playTone(880, "square", 0.08, 0.18), 40);
    setTimeout(() => playTone(1046.5, "triangle", 0.16, 0.22), 90);
    setTimeout(() => playTone(1318.5, "triangle", 0.2, 0.2), 160);
  },
  server: () => {
    playTone(440, "sine", 0.05, 0.1);
    setTimeout(() => playTone(880, "sine", 0.06, 0.12), 40);
    setTimeout(() => playTone(1320, "sine", 0.08, 0.15), 80);
  },
  hazard: () => {
    playTone(164.81, "sawtooth", 0.3, 0.25);
    setTimeout(() => playTone(130.81, "sawtooth", 0.35, 0.25), 90);
  },
  npc: () => {
    playTone(698.46, "triangle", 0.1, 0.15);
    setTimeout(() => playTone(880.0, "triangle", 0.15, 0.18), 90);
  },
  gate: () => {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
      setTimeout(() => playTone(freq, "triangle", 0.18, 0.2), i * 70);
    });
  },
  freeze: () => {
    playTone(220, "sawtooth", 0.3, 0.2);
  },
};

// ----------------------------------------------------
// 6 DISTINCT ARCHITECTURAL BUILDINGS BASE TEMPLATES
// ----------------------------------------------------
const BUILDING_TEMPLATES = {
  bldg_reception: {
    id: "bldg_reception",
    name: "TÒA NHÀ TIẾP NHẬN HÀNH CHÍNH",
    sub: "Bộ Phận Một Cửa & Bốc Số Tự Động",
    icon: "📋",
    actionLabel: "Tiếp nhận hồ sơ",
    type: "reception",
    themeColor: "#0284c7",
    accentColor: "#38bdf8",
  },
  bldg_server: {
    id: "bldg_server",
    name: "TRUNG TÂM DỮ LIỆU SỐ HÓA",
    sub: "Viện Công Nghệ & Lưu Trữ Đám Mây",
    icon: "💻",
    actionLabel: "Tra cứu & Minh bạch",
    type: "server",
    themeColor: "#059669",
    accentColor: "#34d399",
  },
  bldg_stamp: {
    id: "bldg_stamp",
    name: "TÒA THÁP THẨM ĐỊNH & ĐÓNG DẤU",
    sub: "Cơ Quan Phê Duyệt & Niêm Phong Công Vụ",
    icon: "🏛️",
    actionLabel: "Đóng dấu & Nộp hồ sơ",
    type: "stamp",
    themeColor: "#b91c1c",
    accentColor: "#f87171",
  },
  bldg_inspection: {
    id: "bldg_inspection",
    name: "VIỆN THANH TRA & GIÁM SÁT LIÊM CHÍNH",
    sub: "Ủy Ban Kiểm Tra & Giải Trình Tài Sản",
    icon: "⚖️",
    actionLabel: "Thanh tra & Liêm chính",
    type: "inspection",
    themeColor: "#d97706",
    accentColor: "#fbbf24",
  },
  bldg_portal: {
    id: "bldg_portal",
    name: "ĐẠI SẢNH QUẢNG TRƯỜNG CÔNG KHAI",
    sub: "Đài Tưởng Niệm Minh Bạch & Giải Trình (TT CÔNG KHAI)",
    icon: "🏛️",
    actionLabel: "Bước vào hoàn thành nhiệm vụ",
    type: "gate",
    themeColor: "#0891b2",
    accentColor: "#22d3ee",
  },
  bldg_feedback: {
    id: "bldg_feedback",
    name: "NHÀ VĂN HÓA TIẾP DÂN CỘNG ĐỒNG",
    sub: "Không Gian Đối Thoại & Lắng Nghe Ý Kiến",
    icon: "🏡",
    actionLabel: "Lắng nghe ý kiến người dân",
    type: "feedback",
    themeColor: "#db2777",
    accentColor: "#f472b6",
  },
};

// ----------------------------------------------------
// 3 RADICALLY DIFFERENT PHASE MAP LAYOUTS
// ----------------------------------------------------
const PHASE_MAPS = {
  phase_1: {
    name: "QUẬN HÀNH CHÍNH MỘT CỬA & CÔNG VIÊN DÂN SINH",
    theme: "park_plaza",
    groundColor: "#1e293b",
    roadColor: "#0f172a",
    laneColor: "#facc15",
    buildings: [
      { id: "bldg_reception", x: 810, y: 220, w: 460, h: 260, stationX: 810, stationY: 330, radius: 80 },
      { id: "bldg_feedback", x: 200, y: 220, w: 260, h: 240, stationX: 200, stationY: 330, radius: 70 },
      { id: "bldg_stamp", x: 2200, y: 220, w: 260, h: 240, stationX: 2200, stationY: 330, radius: 70 },
      { id: "bldg_inspection", x: 200, y: 1100, w: 260, h: 240, stationX: 200, stationY: 980, radius: 70 },
      { id: "bldg_portal", x: 1590, y: 1100, w: 480, h: 260, stationX: 1590, stationY: 980, radius: 85 },
      { id: "bldg_server", x: 2200, y: 1100, w: 260, h: 240, stationX: 2200, stationY: 980, radius: 70 },
    ],
  },
  phase_2: {
    name: "ĐÔ THỊ SỐ HÓA & MA TRẬN CÔNG NGHỆ CAO",
    theme: "cyber_grid",
    groundColor: "#0b132b",
    roadColor: "#020617",
    laneColor: "#10b981",
    buildings: [
      { id: "bldg_server", x: 1200, y: 700, w: 560, h: 300, stationX: 1200, stationY: 575, radius: 90 },
      { id: "bldg_portal", x: 1200, y: 180, w: 480, h: 240, stationX: 1200, stationY: 275, radius: 80 },
      { id: "bldg_inspection", x: 260, y: 180, w: 400, h: 240, stationX: 260, stationY: 275, radius: 75 },
      { id: "bldg_stamp", x: 2140, y: 180, w: 400, h: 240, stationX: 2140, stationY: 275, radius: 75 },
      { id: "bldg_reception", x: 260, y: 1220, w: 400, h: 240, stationX: 260, stationY: 1125, radius: 75 },
      { id: "bldg_feedback", x: 2140, y: 1220, w: 400, h: 240, stationX: 2140, stationY: 1125, radius: 75 },
    ],
  },
  phase_3: {
    name: "ĐẠI LỘ DANH DỰ & TRUNG TÂM CÔNG KHAI QUỐC GIA",
    theme: "monumental_axis",
    groundColor: "#18181b",
    roadColor: "#09090b",
    laneColor: "#facc15",
    buildings: [
      { id: "bldg_portal", x: 1200, y: 220, w: 660, h: 300, stationX: 1200, stationY: 350, radius: 95 },
      { id: "bldg_reception", x: 1200, y: 1180, w: 540, h: 270, stationX: 1200, stationY: 1060, radius: 80 },
      { id: "bldg_inspection", x: 450, y: 220, w: 440, h: 250, stationX: 450, stationY: 330, radius: 75 },
      { id: "bldg_server", x: 1950, y: 220, w: 440, h: 250, stationX: 1950, stationY: 330, radius: 75 },
      { id: "bldg_feedback", x: 450, y: 1180, w: 440, h: 250, stationX: 450, stationY: 1060, radius: 75 },
      { id: "bldg_stamp", x: 1950, y: 1180, w: 440, h: 250, stationX: 1950, stationY: 1060, radius: 75 },
    ],
  },
};

function getActivePhaseKey() {
  if (state.phase === "phase_2" || state.phase === "situation_2") return "phase_2";
  if (state.phase === "phase_3" || state.phase === "finished") return "phase_3";
  return "phase_1";
}

function getCurrentPhaseBuildings() {
  const phaseKey = getActivePhaseKey();
  const phaseMap = PHASE_MAPS[phaseKey] || PHASE_MAPS.phase_1;
  return phaseMap.buildings.map((b) => ({
    ...BUILDING_TEMPLATES[b.id],
    ...b,
  }));
}

function getBuildingById(id) {
  const currentBuildings = getCurrentPhaseBuildings();
  return currentBuildings.find((b) => b.id === id) || BUILDING_TEMPLATES[id] || { name: "Tòa Nhà Công Vụ" };
}

// SOLID BUILDING COLLISION RESOLUTION
function resolveSolidBuildingCollisions(x, y, radius = 14) {
  let resolvedX = x;
  let resolvedY = y;
  const currentBuildings = getCurrentPhaseBuildings();

  for (const bldg of currentBuildings) {
    const bx = bldg.x - bldg.w / 2;
    const by = bldg.y - bldg.h / 2;
    const bw = bldg.w;

    let wallY = by;
    let wallH = bldg.h - 55;
    if (bldg.y > 600) {
      wallY = by + 50;
      wallH = bldg.h - 50;
    }

    const nearestX = Math.max(bx, Math.min(resolvedX, bx + bw));
    const nearestY = Math.max(wallY, Math.min(resolvedY, wallY + wallH));

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
// DYNAMIC MOVING HAZARDS / CITY PATROLS SYSTEM
// ----------------------------------------------------
const movingHazardsState = new Map();

const AMBIENT_CITY_HAZARDS = [
  { id: "ambient_h1", type: "envelope", label: "Phong bì lót tay", message: "Bẫy phong bì: -25đ, -10 Liêm chính!", x: 450, y: 690, angle: 0, speed: 85 },
  { id: "ambient_h2", type: "waste", label: "Bệnh thành tích", message: "Bệnh thành tích: -30đ, -15 Liêm chính!", x: 1950, y: 690, angle: Math.PI, speed: 95 },
  { id: "ambient_h3", type: "group_interest", label: "Lợi ích nhóm", message: "Lợi ích nhóm: -35đ, -20 Liêm chính!", x: 800, y: 350, angle: Math.PI / 2, speed: 90 },
  { id: "ambient_h4", type: "bureaucracy", label: "Quan liêu cửa quyền", message: "Quan liêu: -25đ, -10 Liêm chính!", x: 1600, y: 1050, angle: -Math.PI / 2, speed: 80 },
  { id: "ambient_h5", type: "waste", label: "Lãng phí công quỹ", message: "Lãng phí: -25đ, -10 Liêm chính!", x: 1200, y: 520, angle: Math.PI / 4, speed: 75 },
  { id: "ambient_h6", type: "envelope", label: "Quà biếu vụ lợi", message: "Quà biếu vụ lợi: -25đ, -15 Liêm chính!", x: 600, y: 1100, angle: -Math.PI / 3, speed: 90 },
  { id: "ambient_h7", type: "waste", label: "Báo cáo khống", message: "Báo cáo khống: -30đ, -15 Liêm chính!", x: 1800, y: 320, angle: (3 * Math.PI) / 4, speed: 85 },
  { id: "ambient_h8", type: "buck_passing", label: "Đùn đẩy trách nhiệm", message: "Đùn đẩy việc: -25đ, -10 Liêm chính!", x: 1200, y: 850, angle: -(3 * Math.PI) / 4, speed: 100 },
];

function initAmbientHazards() {
  for (const h of AMBIENT_CITY_HAZARDS) {
    if (!movingHazardsState.has(h.id) && !state.collectedIds.has(h.id) && !state.resolvedCollisionIds.has(h.id)) {
      movingHazardsState.set(h.id, {
        id: h.id,
        type: h.type,
        label: h.label,
        message: h.message,
        x: h.x,
        y: h.y,
        vx: Math.cos(h.angle) * h.speed,
        vy: Math.sin(h.angle) * h.speed,
        speed: h.speed,
        radius: 18,
        trailTimer: 0,
      });
    }
  }
}

function getOrCreateMovingHazard(entity, id) {
  if (movingHazardsState.has(id)) {
    return movingHazardsState.get(id);
  }

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const angle = ((absHash % 360) * Math.PI) / 180;
  const speed = 75 + (absHash % 45);

  const hazard = {
    id,
    type: entity.type || "envelope",
    label: entity.label || "Cạm bẫy",
    message: entity.message || "Bị phạt rủi ro công vụ!",
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
  initAmbientHazards();
  const currentBuildings = getCurrentPhaseBuildings();

  for (const [id, hazard] of movingHazardsState.entries()) {
    if (state.collectedIds.has(id) || state.resolvedCollisionIds.has(id)) {
      movingHazardsState.delete(id);
      continue;
    }

    hazard.x += hazard.vx * deltaSeconds;
    hazard.y += hazard.vy * deltaSeconds;

    // Bounce on boundaries
    if (hazard.x < 60) { hazard.x = 60; hazard.vx = Math.abs(hazard.vx); }
    if (hazard.x > MAP_WIDTH - 60) { hazard.x = MAP_WIDTH - 60; hazard.vx = -Math.abs(hazard.vx); }
    if (hazard.y < 60) { hazard.y = 60; hazard.vy = Math.abs(hazard.vy); }
    if (hazard.y > MAP_HEIGHT - 60) { hazard.y = MAP_HEIGHT - 60; hazard.vy = -Math.abs(hazard.vy); }

    // Bounce on solid building walls
    for (const bldg of currentBuildings) {
      const bx = bldg.x - bldg.w / 2;
      const by = bldg.y - bldg.h / 2;
      const bw = bldg.w;
      const bh = bldg.h - 55;

      if (
        hazard.x + hazard.radius > bx &&
        hazard.x - hazard.radius < bx + bw &&
        hazard.y + hazard.radius > by &&
        hazard.y - hazard.radius < by + bh
      ) {
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
  freezeTimer: 0,
  phase: initialPhaseParam && initialPhaseParam !== "waiting" ? initialPhaseParam : "phase_1",
  snapshot: normalizeSnapshot(),
  player: {
    id: options.playerId,
    name: options.playerName,
    color: options.color,
    characterId: initialCharacterId,
    gender: initialGender,
    x: MAP_WIDTH / 2,
    y: MAP_HEIGHT / 2 + 60,
    radius: 14,
    direction: "down",
    walking: false,
    localPositionInitialized: false,
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
  justTriggeredGate: false,
};

const remotePlayerRenderState = new Map();

const postToParent = (message) => window.parent?.postMessage(message, "*");
const activeInput = () => input.up || input.down || input.left || input.right;
const activeDirection = () => ["up", "down", "left", "right"].find((direction) => input[direction]) || "down";
const hasFinitePosition = (value) => (
  value
  && typeof value.x === "number"
  && Number.isFinite(value.x)
  && typeof value.y === "number"
  && Number.isFinite(value.y)
);

function setStatus(message) {
  if (status) status.textContent = message;
}

function updatePlayerFromSnapshot() {
  const remote = state.snapshot.players[options.playerId];
  if (!remote) return;

  const shouldAnchorPosition = !state.player.localPositionInitialized && hasFinitePosition(remote);
  state.player = {
    ...state.player,
    ...remote,
    x: shouldAnchorPosition ? toWorldX(remote.x) : state.player.x,
    y: shouldAnchorPosition ? toWorldY(remote.y) : state.player.y,
    id: options.playerId,
    characterId: remote.character || state.player.characterId,
    gender: remote.gender || (remote.character?.startsWith("female") ? "female" : state.player.gender),
    radius: 14,
    localPositionInitialized: state.player.localPositionInitialized || shouldAnchorPosition,
  };
}

function syncRemotePlayerTarget(id, remote) {
  if (options.role === "player" && id === options.playerId) return;
  if (!hasFinitePosition(remote)) {
    remotePlayerRenderState.delete(id);
    return;
  }

  const targetX = toWorldX(remote.x);
  const targetY = toWorldY(remote.y);
  const targetDirection = typeof remote.direction === "string" ? remote.direction : "down";
  const current = remotePlayerRenderState.get(id);

  if (!current) {
    remotePlayerRenderState.set(id, {
      x: targetX,
      y: targetY,
      targetX,
      targetY,
      direction: targetDirection,
      targetDirection,
      name: remote.name,
      color: remote.color,
      character: remote.character,
      gender: remote.gender,
    });
    return;
  }

  current.targetX = targetX;
  current.targetY = targetY;
  current.targetDirection = targetDirection;
  current.name = remote.name;
  current.color = remote.color;
  current.character = remote.character;
  current.gender = remote.gender;
}

function syncRemotePlayerTargets(players = {}) {
  const seen = new Set();
  for (const [id, remote] of Object.entries(players)) {
    if (options.role === "player" && id === options.playerId) continue;
    if (!hasFinitePosition(remote)) continue;
    seen.add(id);
    syncRemotePlayerTarget(id, remote);
  }

  for (const id of remotePlayerRenderState.keys()) {
    if (!seen.has(id)) remotePlayerRenderState.delete(id);
  }
}

function advanceRemotePlayers(deltaSeconds) {
  const alpha = 1 - Math.exp(-12 * Math.max(0, deltaSeconds));
  for (const remote of remotePlayerRenderState.values()) {
    const next = interpolatePosition(remote, {
      x: remote.targetX,
      y: remote.targetY,
      direction: remote.targetDirection,
    }, alpha);
    remote.x = next.x;
    remote.y = next.y;
    remote.direction = next.direction;

    if (Math.hypot(remote.targetX - remote.x, remote.targetY - remote.y) < 0.25) {
      remote.x = remote.targetX;
      remote.y = remote.targetY;
    }
  }
}

function applyPlayerPositionDelta(message) {
  const playerId = typeof message.playerId === "string" ? message.playerId : "";
  if (!playerId) return;

  if (message.position === null) {
    delete state.snapshot.players[playerId];
    remotePlayerRenderState.delete(playerId);
  } else if (hasFinitePosition(message.position)) {
    const current = state.snapshot.players[playerId] || { id: playerId, kind: "player" };
    state.snapshot.players[playerId] = {
      ...current,
      ...message.position,
      id: playerId,
      kind: "player",
    };
    if (playerId === options.playerId) updatePlayerFromSnapshot();
    syncRemotePlayerTarget(playerId, state.snapshot.players[playerId]);
  } else {
    return;
  }

  if (window.__RPG_TEST_HOOK__) {
    const updateCount = Number(canvas.dataset.positionUpdates) || 0;
    canvas.dataset.positionUpdates = String(updateCount + 1);
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

function distanceToBuilding(px, py, bldg) {
  const bx = bldg.x - bldg.w / 2;
  const by = bldg.y - bldg.h / 2;
  const bw = bldg.w;
  const bh = bldg.h;

  const nearestX = Math.max(bx, Math.min(px, bx + bw));
  const nearestY = Math.max(by, Math.min(py, by + bh));

  return Math.hypot(px - nearestX, py - nearestY);
}

function updateNearbyBuilding() {
  let closest = null;
  let minDist = Infinity;
  const currentBuildings = getCurrentPhaseBuildings();

  for (const bldg of currentBuildings) {
    const dist = distanceToBuilding(state.player.x, state.player.y, bldg);
    if (dist <= 50 && dist < minDist) {
      minDist = dist;
      closest = bldg;
    }
  }
  state.nearbyBuilding = closest;

  // Auto-progress quest step when walking up to the building facade!
  if (state.activeQuest && closest) {
    const currentStep = state.activeQuest.steps[state.activeQuest.currentStepIndex];
    if (currentStep && currentStep.bldgId === closest.id) {
      const isTouching = minDist <= 35;
      if (isTouching && !state.activeQuest.justTriggered) {
        state.activeQuest.justTriggered = true;
        executePlayerAction();
        setTimeout(() => {
          if (state.activeQuest) state.activeQuest.justTriggered = false;
        }, 1200);
      }
    }
  }

  // Auto-trigger Public Accountability Center when walking up to the building
  if (closest && (closest.id === "bldg_portal" || closest.type === "gate")) {
    const isTouching = minDist <= 35;
    if (isTouching && !state.justTriggeredGate) {
      state.justTriggeredGate = true;
      executePlayerAction();
      setTimeout(() => {
        state.justTriggeredGate = false;
      }, 1500);
    }
  }
}

// ----------------------------------------------------
// DYNAMIC MULTI-STEP QUEST WORKFLOW EXECUTION
// ----------------------------------------------------
function executePlayerAction() {
  if (options.role !== "player") return;
  getAudioContext();

  // WHEN FROZEN: Strict lock, do nothing until timer expires!
  if (state.frozen || state.freezeTimer > 0) return;

  // A. IF CURRENTLY ENGAGED IN A MULTI-STEP DOSSIER QUEST:
  if (state.activeQuest) {
    const quest = state.activeQuest;
    const currentStep = quest.steps[quest.currentStepIndex];
    const targetBldg = getBuildingById(currentStep.bldgId);

    const isAtTarget = state.nearbyBuilding && state.nearbyBuilding.id === currentStep.bldgId;

    if (isAtTarget) {
      const isFinalStep = quest.currentStepIndex >= quest.totalSteps - 1;

      if (!isFinalStep) {
        quest.currentStepIndex += 1;
        const nextStep = quest.steps[quest.currentStepIndex];
        const nextBldg = getBuildingById(nextStep.bldgId);

        sfx.stepComplete();
        spawnParticles(state.player.x, state.player.y, quest.color || "#38bdf8", 20, 95, "star");
        spawnFloatingText(
          state.player.x,
          state.player.y,
          `✓ Xong bước ${quest.currentStepIndex}/${quest.totalSteps}! Tiếp tục đến ${nextBldg.name}!`,
          "#38bdf8"
        );
      } else {
        sfx.stamp();
        spawnParticles(state.player.x, state.player.y, "#f59e0b", 32, 140, "star");
        spawnFloatingText(
          state.player.x,
          state.player.y,
          `★ HOÀN THÀNH: ${quest.title}! (+30 Điểm Công Vụ)`,
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
        `Mục tiêu: ${targetBldg.name}! (Theo dõi mũi tên vàng)`,
        "#fbbf24"
      );
      return;
    }
  }

  // B. IF NEAR A BUILDING (INCLUDING TT CÔNG KHAI / GATE):
  if (state.nearbyBuilding) {
    const bldg = state.nearbyBuilding;

    if (bldg.id === "bldg_portal" || bldg.type === "gate") {
      sfx.gate();
      spawnParticles(state.player.x, state.player.y, "#22d3ee", 34, 150, "star");
      spawnFloatingText(state.player.x, state.player.y, "⭐ TIẾN VÀO TRUNG TÂM CÔNG KHAI ⭐", "#22d3ee");

      const gateId = Object.keys(state.snapshot.gates || {})[0] || "public_center_1";
      postToParent({ type: "ESCAPED_GATE", gateId });
      return;
    } else if (bldg.type === "stamp") {
      sfx.stamp();
      spawnParticles(bldg.stationX, bldg.stationY, "#f87171", 16, 80, "star");
      spawnFloatingText(state.player.x, state.player.y, "✓ Đã kiểm định & Niêm phong hồ sơ!", "#f87171");
    } else if (bldg.type === "server") {
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

  // C. SCAN NEARBY COLLECTIBLES ON THE STREET:
  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (kind === "players" || !entities || typeof entities !== "object") continue;
    for (const [id, entity] of Object.entries(entities)) {
      if (!entity) continue;
      const fullEntity = { ...entity, id: entity.id || id, kind: entity.kind || kind.slice(0, -1) };
      if (state.collectedIds.has(fullEntity.id) || state.resolvedCollisionIds.has(fullEntity.id)) continue;
      if (isEntityResolvedForPlayer(fullEntity, options.playerId)) continue;

      const baseWorldX = toWorldX(fullEntity.x);
      const baseWorldY = toWorldY(fullEntity.y);
      const safePos = resolveSolidBuildingCollisions(baseWorldX, baseWorldY, 24);
      const dist = Math.hypot(state.player.x - safePos.x, state.player.y - safePos.y);
      if (dist <= 48) {
        handleEntityInteraction({ ...fullEntity, x: safePos.x, y: safePos.y }, performance.now());
        return;
      }
    }
  }
}

// Handle Contact with World Entities
function handleEntityInteraction(entity, now) {
  if (options.role !== "player") return;
  if (state.collectedIds.has(entity.id) || state.resolvedCollisionIds.has(entity.id)) return;
  if (isEntityResolvedForPlayer(entity, options.playerId)) return;

  const radius = Number.isFinite(entity.radius) ? entity.radius : 20;
  if (!circlesOverlap(state.player, { ...entity, radius })) return;

  const event = collisionMessage(entity);

  // A. ITEM:
  if (entity.kind === "item") {
    if (state.activeQuest) {
      // Đang cầm 1 hồ sơ nhiệm vụ -> Không thể nhặt thêm item khác cho đến khi hoàn thành!
      return;
    }
    state.collectedIds.add(entity.id);
    state.resolvedCollisionIds.add(entity.id);
    sfx.pickup();
    spawnParticles(entity.x, entity.y, entity.color || "#ffdf6e", 16, 80, "star");

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
    const targetBldg = getBuildingById(firstStep.bldgId);

    spawnFloatingText(
      state.player.x,
      state.player.y,
      `NHẬN NHIỆM VỤ: ${questConfig.title}! Đến ${targetBldg.name}`,
      "#38bdf8"
    );
    return;
  }

  // B. DYNAMIC MOVING HAZARD / BẪY:
  if (
    entity.kind === "hazard" ||
    entity.id?.startsWith("ambient_h") ||
    entity.type === "envelope" ||
    entity.type === "waste" ||
    entity.type === "group_interest" ||
    entity.type === "bureaucracy" ||
    entity.type === "buck_passing" ||
    entity.type === "late_deadline" ||
    entity.type === "personal_gain" ||
    entity.type === "achievement_disease" ||
    entity.type === "privilege"
  ) {
    state.resolvedCollisionIds.add(entity.id);
    state.collectedIds.add(entity.id);
    movingHazardsState.delete(entity.id);

    sfx.hazard();
    triggerScreenShake(12, 0.35);
    spawnParticles(entity.x, entity.y, "#f59e0b", 24, 120, "ember");
    spawnFloatingText(entity.x, entity.y, "❓ TÌNH HUỐNG: " + (entity.label || "Thử thách công vụ"), "#fbbf24");

    // Pause player movement for answering question
    state.frozen = true;
    state.freezeTimer = 0;

    postToParent({
      type: "DINH_BAY",
      hazard: {
        id: entity.id,
        type: entity.type || "envelope",
        label: entity.label || "Rủi ro công vụ",
        score: Number.isFinite(entity.score) && entity.score !== 0 ? entity.score : -25,
        integrity: Number.isFinite(entity.integrity) && entity.integrity !== 0 ? entity.integrity : -10,
        message: entity.message || "Tình huống thử thách",
      },
    });
    return;
  }

  // C. NPC:
  if (entity.kind === "npc") {
    state.resolvedCollisionIds.add(entity.id);
    state.collectedIds.add(entity.id);
    sfx.npc();
    spawnParticles(entity.x, entity.y, "#26c6da", 18, 90, "star");
    spawnFloatingText(entity.x, entity.y, entity.message || "✓ Đã tiếp nhận ý kiến công dân!", "#26c6da");
    if (event) postToParent(event);
    return;
  }

  // D. GATE:
  if (entity.kind === "gate" || entity.type === "public_center") {
    state.resolvedCollisionIds.add(entity.id);
    sfx.gate();
    spawnParticles(entity.x, entity.y, "#8cd6f7", 34, 150, "star");
    spawnFloatingText(entity.x, entity.y, "⭐ ĐÃ VÀO TRUNG TÂM CÔNG KHAI ⭐", "#8cd6f7");
    postToParent({ type: "ESCAPED_GATE", gateId: entity.id });
  }
}

function checkCollisions(now) {
  // 1. Static Entities
  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (!Array.isArray(entities) && entities && typeof entities === "object") {
      for (const [id, entity] of Object.entries(entities)) {
        if (kind === "players" || !entity) continue;
        if (kind === "hazards" || kind === "traps") {
          getOrCreateMovingHazard(entity, id);
          continue;
        }
        const baseWorldX = toWorldX(entity.x);
        const baseWorldY = toWorldY(entity.y);
        const safePos = resolveSolidBuildingCollisions(baseWorldX, baseWorldY, 24);
        const worldEntity = {
          ...entity,
          id: entity.id || id,
          kind: entity.kind || kind.slice(0, -1),
          x: safePos.x,
          y: safePos.y,
        };
        handleEntityInteraction(worldEntity, now);
      }
    }
  }

  // 2. Dynamic Moving Hazards
  for (const [id, mHazard] of movingHazardsState.entries()) {
    if (state.collectedIds.has(id) || state.resolvedCollisionIds.has(id)) continue;
    const snapHazard = state.snapshot.hazards?.[id] || state.snapshot.traps?.[id];

    const dynamicEntity = {
      ...(snapHazard || {}),
      id,
      type: mHazard.type || snapHazard?.type || "envelope",
      label: mHazard.label || snapHazard?.label || "Rủi ro tuần tra",
      message: mHazard.message || snapHazard?.message || "Bị phạt rủi ro công vụ!",
      kind: "hazard",
      x: mHazard.x,
      y: mHazard.y,
      radius: mHazard.radius,
    };
    handleEntityInteraction(dynamicEntity, now);
  }
}

// ----------------------------------------------------
// 3 RICH, DISTINCT STANDALONE PHASE MAPS
// ----------------------------------------------------

function drawCityGround() {
  const time = state.gameTime;
  const phaseKey = getActivePhaseKey();

  if (phaseKey === "phase_1") {
    drawPhase1ParkMap(time);
  } else if (phaseKey === "phase_2") {
    drawPhase2CyberMap(time);
  } else {
    drawPhase3MonumentalMap(time);
  }
}

// ----------------------------------------------------
// MAP 1: QUẬN HÀNH CHÍNH & CÔNG VIÊN DÂN SINH (PHASE 1)
// ----------------------------------------------------
function drawPhase1ParkMap(time) {
  // 1. Warm Earthy Cobblestone Ground
  context.fillStyle = "#1e293b";
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // 2. Asphalt Grand Boulevards
  context.fillStyle = "#0f172a";
  context.fillRect(0, 600, MAP_WIDTH, 200);
  context.fillRect(340, 0, 160, MAP_HEIGHT);
  context.fillRect(1120, 0, 160, MAP_HEIGHT);
  context.fillRect(1900, 0, 160, MAP_HEIGHT);

  // Yellow Lane Dividers
  context.strokeStyle = "#facc15";
  context.lineWidth = 3;
  context.setLineDash([28, 18]);
  context.beginPath();
  context.moveTo(0, 700); context.lineTo(MAP_WIDTH, 700);
  context.moveTo(420, 0); context.lineTo(420, MAP_HEIGHT);
  context.moveTo(1200, 0); context.lineTo(1200, MAP_HEIGHT);
  context.moveTo(1980, 0); context.lineTo(1980, MAP_HEIGHT);
  context.stroke();
  context.setLineDash([]);

  // Crosswalks
  drawCrosswalk(320, 600, 40, 200, true);
  drawCrosswalk(480, 600, 40, 200, true);
  drawCrosswalk(1040, 600, 40, 200, true);
  drawCrosswalk(1280, 600, 40, 200, true);
  drawCrosswalk(1880, 600, 40, 200, true);
  drawCrosswalk(2040, 600, 40, 200, true);

  // 3. Perfectly Aligned Sidewalk Blocks Snapped Exactly to Curbs
  drawSidewalk(60, 60, 280, 540);
  drawSidewalk(500, 60, 620, 540);
  drawSidewalk(1280, 60, 620, 540);
  drawSidewalk(2060, 60, 280, 540);

  drawSidewalk(60, 800, 280, 540);
  drawSidewalk(500, 800, 620, 540);
  drawSidewalk(1280, 800, 620, 540);
  drawSidewalk(2060, 800, 280, 540);

  // 4. GOLDEN LOTUS MEMORIAL PLAZAS (100% OFF-ROAD INSIDE PARK BLOCKS)
  drawMemorialPlaza(810, 440, 75, "lotus");
  drawGoldenLotusMemorial(810, 440, time);

  drawMemorialPlaza(1590, 440, 75, "lotus");
  drawGoldenLotusMemorial(1590, 440, time);

  // 5. Flowerbeds & Park Benches
  drawFlowerBed(520, 568, 140, 22);
  drawFlowerBed(960, 568, 140, 22);
  drawFlowerBed(1300, 568, 140, 22);
  drawFlowerBed(1740, 568, 140, 22);

  drawFlowerBed(520, 810, 140, 22);
  drawFlowerBed(960, 810, 140, 22);
  drawFlowerBed(1300, 810, 140, 22);
  drawFlowerBed(1740, 810, 140, 22);

  drawParkBench(720, 440); drawParkBench(900, 440);
  drawParkBench(1500, 440); drawParkBench(1680, 440);
  drawParkBench(200, 920); drawParkBench(2200, 920);

  drawFireHydrant(315, 575); drawFireHydrant(1925, 575);
  drawFireHydrant(315, 825); drawFireHydrant(1925, 825);
  drawDualRecycleBin(1100, 570); drawDualRecycleBin(1300, 570);
  drawBicycleRack(1040, 570); drawBicycleRack(1360, 570);

  // 6. Streetlamps
  const lamps = [
    { x: 140, y: 575 }, { x: 500, y: 575 }, { x: 1120, y: 575 },
    { x: 1280, y: 575 }, { x: 1900, y: 575 }, { x: 2260, y: 575 },
    { x: 140, y: 825 }, { x: 500, y: 825 }, { x: 1120, y: 825 },
    { x: 1280, y: 825 }, { x: 1900, y: 825 }, { x: 2260, y: 825 },
  ];
  for (const lp of lamps) drawStreetLamp(lp.x, lp.y, time);

  // 7. Trees
  drawPixelTree(200, 440, "oak", time);
  drawPixelTree(810, 340, "cherry", time);
  drawPixelTree(1590, 340, "cherry", time);
  drawPixelTree(2200, 440, "oak", time);

  drawPixelTree(200, 1020, "cherry", time);
  drawPixelTree(810, 1020, "oak", time);
  drawPixelTree(1590, 1020, "oak", time);
  drawPixelTree(2200, 1020, "cherry", time);
}

// ----------------------------------------------------
// MAP 2: ĐÔ THỊ SỐ HÓA & MA TRẬN CÔNG NGHỆ CAO (PHASE 2)
// ----------------------------------------------------
function drawPhase2CyberMap(time) {
  // 1. Dark Slate Cyber Pavement Ground
  context.fillStyle = "#0b132b";
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // 2. DUAL HORIZONTAL & DUAL VERTICAL HIGH-SPEED EXPRESSWAYS
  context.fillStyle = "#020617";
  context.fillRect(0, 320, MAP_WIDTH, 160);
  context.fillRect(0, 920, MAP_WIDTH, 160);
  context.fillRect(480, 0, 160, MAP_HEIGHT);
  context.fillRect(1760, 0, 160, MAP_HEIGHT);

  // Glowing Cyan & Emerald Laser Dividers
  context.strokeStyle = "#10b981";
  context.lineWidth = 3.5;
  context.setLineDash([24, 14]);
  context.beginPath();
  context.moveTo(0, 400); context.lineTo(MAP_WIDTH, 400);
  context.moveTo(0, 1000); context.lineTo(MAP_WIDTH, 1000);
  context.moveTo(560, 0); context.lineTo(560, MAP_HEIGHT);
  context.moveTo(1840, 0); context.lineTo(1840, MAP_HEIGHT);
  context.stroke();
  context.setLineDash([]);

  // Crosswalks at Cyber Intersections
  drawCrosswalk(460, 320, 30, 160, true);
  drawCrosswalk(630, 320, 30, 160, true);
  drawCrosswalk(1740, 320, 30, 160, true);
  drawCrosswalk(1910, 320, 30, 160, true);

  drawCrosswalk(460, 920, 30, 160, true);
  drawCrosswalk(630, 920, 30, 160, true);
  drawCrosswalk(1740, 920, 30, 160, true);
  drawCrosswalk(1910, 920, 30, 160, true);

  // 3. Cyber Sidewalk Platforms Snapped Perfectly to Expressways
  drawSidewalk(40, 40, 440, 280, "cyber");
  drawSidewalk(1920, 40, 440, 280, "cyber");
  drawSidewalk(40, 1080, 440, 280, "cyber");
  drawSidewalk(1920, 1080, 440, 280, "cyber");

  // Center Pedestrian Cyber Island & North/South Plazas
  drawSidewalk(640, 40, 1120, 280, "cyber");
  drawSidewalk(640, 480, 1120, 440, "cyber");
  drawSidewalk(640, 1080, 1120, 280, "cyber");

  // 4. 4 QUANTUM CYBER MATRIX ORBS (PLACED SAFELY ON PEDESTRIAN ISLANDS, OFF-ROAD!)
  drawMemorialPlaza(800, 680, 60, "quantum");
  drawQuantumCyberMatrixOrb(800, 680, time);

  drawMemorialPlaza(1600, 680, 60, "quantum");
  drawQuantumCyberMatrixOrb(1600, 680, time);

  drawMemorialPlaza(800, 200, 50, "quantum");
  drawQuantumCyberMatrixOrb(800, 200, time);

  drawMemorialPlaza(1600, 200, 50, "quantum");
  drawQuantumCyberMatrixOrb(1600, 200, time);

  // 5. Tech Solar Benches & Planters
  drawSolarChargingBench(720, 680); drawSolarChargingBench(880, 680);
  drawSolarChargingBench(1520, 680); drawSolarChargingBench(1680, 680);
  drawBicycleRack(660, 500); drawBicycleRack(1700, 500);
  drawDualRecycleBin(660, 900); drawDualRecycleBin(1700, 900);

  // 6. Cyber LED Streetlamps
  const lamps = [
    { x: 100, y: 300 }, { x: 440, y: 300 }, { x: 1960, y: 300 }, { x: 2300, y: 300 },
    { x: 100, y: 900 }, { x: 440, y: 900 }, { x: 1960, y: 900 }, { x: 2300, y: 900 },
  ];
  for (const lp of lamps) drawStreetLamp(lp.x, lp.y, time);

  // 7. Bioluminescent Tech Trees
  drawBioluminescentTree(120, 180, time);
  drawBioluminescentTree(380, 180, time);
  drawBioluminescentTree(2020, 180, time);
  drawBioluminescentTree(2280, 180, time);

  drawBioluminescentTree(120, 1220, time);
  drawBioluminescentTree(380, 1220, time);
  drawBioluminescentTree(2020, 1220, time);
  drawBioluminescentTree(2280, 1220, time);
}

// ----------------------------------------------------
// MAP 3: ĐẠI LỘ DANH DỰ & TRUNG TÂM CÔNG KHAI (PHASE 3)
// ----------------------------------------------------
function drawPhase3MonumentalMap(time) {
  // 1. Imperial Anthracite & Polished Marble Ground
  context.fillStyle = "#18181b";
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // 2. MONUMENTAL MARBLE AXIS RUNNING NORTH-SOUTH (WIDTH 720px)
  context.fillStyle = "#27272a";
  context.fillRect(840, 0, 720, MAP_HEIGHT);

  // White Marble Processional Border Ribbons
  context.fillStyle = "#f8fafc";
  context.fillRect(840, 0, 18, MAP_HEIGHT);
  context.fillRect(1542, 0, 18, MAP_HEIGHT);

  // Outer Connector Boulevards (Snug at y: 600..760)
  context.fillStyle = "#09090b";
  context.fillRect(0, 600, 840, 160);
  context.fillRect(1560, 600, 840, 160);

  // Gold Trim Pavement Lines
  context.strokeStyle = "#facc15";
  context.lineWidth = 2.5;
  context.setLineDash([28, 18]);
  context.beginPath();
  context.moveTo(1200, 0); context.lineTo(1200, MAP_HEIGHT);
  context.moveTo(0, 680); context.lineTo(840, 680);
  context.moveTo(1560, 680); context.lineTo(MAP_WIDTH, 680);
  context.stroke();
  context.setLineDash([]);

  // Crosswalks
  drawCrosswalk(820, 600, 30, 160, true);
  drawCrosswalk(1550, 600, 30, 160, true);

  // 3. Imperial Colonnade Sidewalks Snapped to Curbs
  drawSidewalk(60, 60, 780, 540, "marble");
  drawSidewalk(1560, 60, 780, 540, "marble");
  drawSidewalk(60, 760, 780, 580, "marble");
  drawSidewalk(1560, 760, 780, 580, "marble");

  // 4. GOLDEN JUSTICE & INTEGRITY MEMORIALS (PLACED SAFELY ON MARBLE PLAZAS, OFF-ROAD!)
  drawMemorialPlaza(450, 340, 75, "justice");
  drawGoldenJusticeMemorial(450, 340, time);

  drawMemorialPlaza(1950, 340, 75, "justice");
  drawGoldenJusticeMemorial(1950, 340, time);

  // 5. Grand Colonnade Pillars Lining the Entire Center Marble Promenade
  for (let cy = 80; cy < 1320; cy += 120) {
    if (cy < 420 || cy > 960) {
      drawMarbleColonnadePillar(870, cy);
      drawMarbleColonnadePillar(1530, cy);
    }
  }

  // 6. Eternal Flame Braziers Guarding the Promenade
  drawEternalFlameBrazier(870, 460, time);
  drawEternalFlameBrazier(1530, 460, time);
  drawEternalFlameBrazier(870, 920, time);
  drawEternalFlameBrazier(1530, 920, time);

  // 7. Classical Marble Benches & Flowerbeds
  drawMarbleBench(350, 340); drawMarbleBench(550, 340);
  drawMarbleBench(1850, 340); drawMarbleBench(2050, 340);

  drawFlowerBed(100, 570, 140, 22);
  drawFlowerBed(660, 570, 140, 22);
  drawFlowerBed(1600, 570, 140, 22);
  drawFlowerBed(2160, 570, 140, 22);

  // 8. Streetlamps
  const lamps = [
    { x: 100, y: 575 }, { x: 780, y: 575 }, { x: 1620, y: 575 }, { x: 2300, y: 575 },
    { x: 100, y: 785 }, { x: 780, y: 785 }, { x: 1620, y: 785 }, { x: 2300, y: 785 },
  ];
  for (const lp of lamps) drawStreetLamp(lp.x, lp.y, time);

  // 9. Noble Italian Cypress Trees
  drawCypressTree(200, 220, time);
  drawCypressTree(700, 220, time);
  drawCypressTree(1700, 220, time);
  drawCypressTree(2200, 220, time);

  drawCypressTree(200, 1180, time);
  drawCypressTree(700, 1180, time);
  drawCypressTree(1700, 1180, time);
  drawCypressTree(2200, 1180, time);
}

// ----------------------------------------------------
// DEDICATED MEMORIAL COURTYARD PLAZA
// ----------------------------------------------------
function drawMemorialPlaza(cx, cy, radius = 75, theme = "lotus") {
  context.fillStyle = theme === "quantum" ? "#0f172a" : theme === "justice" ? "#f8fafc" : "#334155";
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = theme === "quantum" ? "#10b981" : theme === "justice" ? "#facc15" : "#f59e0b";
  context.lineWidth = 3;
  context.stroke();

  context.strokeStyle = theme === "quantum" ? "rgba(45, 212, 191, 0.3)" : theme === "justice" ? "rgba(202, 138, 4, 0.25)" : "rgba(254, 240, 138, 0.25)";
  context.lineWidth = 1.5;
  context.beginPath();
  context.arc(cx, cy, radius - 15, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.arc(cx, cy, radius - 30, 0, Math.PI * 2);
  context.stroke();
}

// 1. PHASE 1: ĐÀI SEN VÀNG MINH TRIẾT & DÂN SINH
function drawGoldenLotusMemorial(x, y, time) {
  context.fillStyle = "rgba(0, 0, 0, 0.4)";
  context.beginPath(); context.ellipse(x, y + 16, 42, 16, 0, 0, Math.PI * 2); context.fill();

  context.fillStyle = "#475569";
  context.fillRect(x - 30, y + 2, 60, 14);
  context.fillStyle = "#64748b";
  context.fillRect(x - 24, y - 6, 48, 8);
  context.fillStyle = "#94a3b8";
  context.fillRect(x - 18, y - 14, 36, 8);

  const petalCount = 8;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2 + time * 0.4;
    const r = 22;
    const px = x + Math.cos(angle) * r;
    const py = y - 18 + Math.sin(angle) * (r * 0.45);

    context.fillStyle = (i % 2 === 0) ? "#facc15" : "#eab308";
    context.beginPath();
    context.ellipse(px, py, 9, 14, angle, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#ca8a04";
    context.lineWidth = 1;
    context.stroke();
  }

  const pulse = Math.sin(time * 4) * 3;
  context.fillStyle = "rgba(254, 240, 138, 0.4)";
  context.beginPath(); context.arc(x, y - 24, 18 + pulse, 0, Math.PI * 2); context.fill();

  context.fillStyle = "#fef08a";
  context.beginPath(); context.arc(x, y - 24, 10, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#ffffff";
  context.beginPath(); context.arc(x - 3, y - 27, 4, 0, Math.PI * 2); context.fill();

  for (let i = 0; i < 5; i++) {
    const spAngle = (i / 5) * Math.PI * 2 + time * 1.5;
    const spDist = 18 + Math.sin(time * 5 + i) * 6;
    const sx = x + Math.cos(spAngle) * spDist;
    const sy = y - 26 + Math.sin(spAngle) * (spDist * 0.5);
    context.fillStyle = "#facc15";
    context.fillRect(sx - 1.5, sy - 1.5, 3, 3);
  }
}

// 2. PHASE 2: LÕI NĂNG LƯỢNG LƯỢNG TỬ & QUẢ CẦU MINH BẠCH SỐ 4.0
function drawQuantumCyberMatrixOrb(x, y, time) {
  context.fillStyle = "rgba(0, 0, 0, 0.45)";
  context.beginPath(); context.ellipse(x, y + 16, 36, 14, 0, 0, Math.PI * 2); context.fill();

  context.fillStyle = "#0f172a";
  context.fillRect(x - 22, y + 2, 44, 14);
  context.strokeStyle = "#10b981";
  context.lineWidth = 2;
  context.strokeRect(x - 22, y + 2, 44, 14);

  context.fillStyle = "#022c22";
  context.fillRect(x - 8, y - 16, 16, 18);
  context.fillStyle = "#34d399";
  context.fillRect(x - 2, y - 16, 4, 18);

  const floatOrbY = y - 24 + Math.sin(time * 4) * 4;

  for (let i = 0; i < 3; i++) {
    context.strokeStyle = i === 0 ? "#34d399" : i === 1 ? "#38bdf8" : "#a7f3d0";
    context.lineWidth = 1.5;
    context.beginPath();
    context.ellipse(x, floatOrbY, 22, 9, time * (1.2 + i * 0.5), 0, Math.PI * 2);
    context.stroke();
  }

  context.fillStyle = "#06b6d4";
  context.beginPath(); context.arc(x, floatOrbY, 11, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#a5f3fc";
  context.beginPath(); context.arc(x - 3, floatOrbY - 3, 5, 0, Math.PI * 2); context.fill();

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + time * 3;
    const r = 20 + Math.sin(time * 6 + i) * 4;
    const qx = x + Math.cos(angle) * r;
    const qy = floatOrbY + Math.sin(angle) * (r * 0.4);
    context.fillStyle = "#67e8f9";
    context.fillRect(qx - 2, qy - 2, 4, 4);
  }
}

// 3. PHASE 3: ĐÀI CÂN CÔNG LÝ & NGỌN ĐUỐC LIÊM CHÍNH HOÀNG GIA
function drawGoldenJusticeMemorial(x, y, time) {
  context.fillStyle = "rgba(0, 0, 0, 0.4)";
  context.beginPath(); context.ellipse(x, y + 18, 44, 18, 0, 0, Math.PI * 2); context.fill();

  context.fillStyle = "#e2e8f0";
  context.fillRect(x - 32, y + 4, 64, 14);
  context.fillStyle = "#f8fafc";
  context.fillRect(x - 26, y - 6, 52, 10);
  context.strokeStyle = "#facc15";
  context.lineWidth = 2;
  context.strokeRect(x - 26, y - 6, 52, 10);

  context.fillStyle = "#ffffff";
  context.fillRect(x - 8, y - 26, 16, 20);
  context.fillStyle = "#facc15";
  context.fillRect(x - 12, y - 28, 24, 4);

  const beamY = y - 30;
  const tilt = Math.sin(time * 2) * 2;
  context.fillStyle = "#ca8a04";
  context.fillRect(x - 22, beamY + tilt, 44, 4);

  context.fillStyle = "#facc15";
  context.beginPath();
  context.moveTo(x - 22, beamY + tilt);
  context.lineTo(x - 28, beamY + 12 + tilt);
  context.lineTo(x - 16, beamY + 12 + tilt);
  context.closePath();
  context.stroke();
  context.beginPath(); context.ellipse(x - 22, beamY + 13 + tilt, 8, 3, 0, 0, Math.PI * 2); context.fill();

  context.beginPath();
  context.moveTo(x + 22, beamY - tilt);
  context.lineTo(x + 16, beamY + 12 - tilt);
  context.lineTo(x + 28, beamY + 12 - tilt);
  context.closePath();
  context.stroke();
  context.beginPath(); context.ellipse(x + 22, beamY + 13 - tilt, 8, 3, 0, 0, Math.PI * 2); context.fill();

  const flameH = 14 + Math.sin(time * 10) * 4;
  context.fillStyle = "#ef4444";
  context.beginPath();
  context.moveTo(x - 6, beamY - 4);
  context.quadraticCurveTo(x, beamY - 4 - flameH * 1.4, x + 6, beamY - 4);
  context.closePath();
  context.fill();

  context.fillStyle = "#facc15";
  context.beginPath();
  context.moveTo(x - 3, beamY - 4);
  context.quadraticCurveTo(x, beamY - 4 - flameH * 0.9, x + 3, beamY - 4);
  context.closePath();
  context.fill();
}

function drawEternalFlameBrazier(x, y, time) {
  context.fillStyle = "#78350f";
  context.fillRect(x - 8, y - 20, 16, 24);
  context.fillStyle = "#facc15";
  context.fillRect(x - 12, y - 24, 24, 5);

  const flameH = 16 + Math.sin(time * 12 + x) * 4;
  context.fillStyle = "#ef4444";
  context.beginPath();
  context.moveTo(x - 8, y - 24);
  context.quadraticCurveTo(x, y - 24 - flameH * 1.3, x + 8, y - 24);
  context.closePath();
  context.fill();

  context.fillStyle = "#facc15";
  context.beginPath();
  context.moveTo(x - 4, y - 24);
  context.quadraticCurveTo(x, y - 24 - flameH * 0.8, x + 4, y - 24);
  context.closePath();
  context.fill();
}

function drawBioluminescentTree(x, y, time) {
  context.fillStyle = "rgba(0, 0, 0, 0.4)";
  context.beginPath(); context.ellipse(x, y + 26, 26, 10, 0, 0, Math.PI * 2); context.fill();

  context.fillStyle = "#1e293b";
  context.fillRect(x - 5, y + 4, 10, 22);

  const pulse = Math.sin(time * 3 + x) * 3;
  context.fillStyle = "#047857";
  context.beginPath(); context.arc(x, y - 8, 28 + pulse, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#10b981";
  context.beginPath(); context.arc(x - 5, y - 14, 20 + pulse, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#6ee7b7";
  context.beginPath(); context.arc(x - 8, y - 18, 12, 0, Math.PI * 2); context.fill();
}

function drawCypressTree(x, y, time) {
  context.fillStyle = "rgba(0, 0, 0, 0.35)";
  context.beginPath(); context.ellipse(x, y + 26, 16, 7, 0, 0, Math.PI * 2); context.fill();

  context.fillStyle = "#451a03";
  context.fillRect(x - 4, y + 10, 8, 16);

  const sway = Math.sin(time * 2 + x) * 1.5;
  context.fillStyle = "#064e3b";
  context.beginPath();
  context.moveTo(x + sway, y - 48);
  context.lineTo(x + 14 + sway, y + 12);
  context.lineTo(x - 14 + sway, y + 12);
  context.closePath();
  context.fill();

  context.fillStyle = "#047857";
  context.beginPath();
  context.moveTo(x + sway - 3, y - 44);
  context.lineTo(x + 8 + sway, y + 10);
  context.lineTo(x - 10 + sway, y + 10);
  context.closePath();
  context.fill();
}

function drawSolarChargingBench(x, y) {
  context.fillStyle = "rgba(0, 0, 0, 0.35)";
  context.fillRect(x - 18, y + 10, 36, 6);

  context.fillStyle = "#334155";
  context.fillRect(x - 16, y, 4, 12);
  context.fillRect(x + 12, y, 4, 12);

  context.fillStyle = "#0284c7";
  context.fillRect(x - 18, y - 4, 36, 5);
  context.fillStyle = "#38bdf8";
  context.fillRect(x - 18, y - 12, 36, 4);
}

function drawMarbleBench(x, y) {
  context.fillStyle = "rgba(0, 0, 0, 0.35)";
  context.fillRect(x - 18, y + 10, 36, 6);

  context.fillStyle = "#cbd5e1";
  context.fillRect(x - 16, y - 2, 32, 14);
  context.fillStyle = "#f8fafc";
  context.fillRect(x - 18, y - 6, 36, 6);
  context.strokeStyle = "#94a3b8";
  context.lineWidth = 1;
  context.strokeRect(x - 18, y - 6, 36, 6);
}

function drawCrosswalk(x, y, w, h, isVertical) {
  context.fillStyle = "#ffffff";
  if (isVertical) {
    for (let i = y + 10; i < y + h - 10; i += 22) context.fillRect(x, i, w, 12);
  } else {
    for (let i = x + 10; i < x + w - 10; i += 22) context.fillRect(i, y, 12, h);
  }
}

function drawSidewalk(x, y, w, h, theme = "standard") {
  context.fillStyle = theme === "cyber" ? "#1e293b" : theme === "marble" ? "#334155" : "#334155";
  context.fillRect(x, y, w, h);
  context.strokeStyle = theme === "cyber" ? "#10b981" : theme === "marble" ? "#94a3b8" : "#475569";
  context.lineWidth = 3;
  context.strokeRect(x, y, w, h);

  // Snapped 32x32 tiles from border
  context.fillStyle = theme === "cyber" ? "rgba(52, 211, 153, 0.04)" : "rgba(255, 255, 255, 0.04)";
  for (let py = y + 4; py <= y + h - 32; py += 32) {
    for (let px = x + 4; px <= x + w - 32; px += 32) {
      if ((Math.floor((px - x) / 32) + Math.floor((py - y) / 32)) % 2 === 0) {
        context.fillRect(px, py, 30, 30);
      }
    }
  }
}

function drawMarbleColonnadePillar(x, y) {
  context.fillStyle = "#e2e8f0";
  context.fillRect(x - 8, y - 24, 16, 48);
  context.strokeStyle = "#cbd5e1";
  context.lineWidth = 1;
  context.strokeRect(x - 8, y - 24, 16, 48);
  context.fillStyle = "#facc15";
  context.fillRect(x - 11, y - 28, 22, 5);
  context.fillRect(x - 11, y + 23, 22, 5);
}

function drawStreetLamp(x, y, time) {
  const glowGrad = context.createRadialGradient(x, y, 4, x, y, 65);
  glowGrad.addColorStop(0, "rgba(254, 240, 138, 0.35)");
  glowGrad.addColorStop(0.5, "rgba(250, 204, 21, 0.12)");
  glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = glowGrad;
  context.beginPath(); context.arc(x, y, 65, 0, Math.PI * 2); context.fill();

  context.fillStyle = "rgba(0, 0, 0, 0.4)";
  context.beginPath(); context.ellipse(x, y + 4, 8, 4, 0, 0, Math.PI * 2); context.fill();

  context.fillStyle = "#0f172a";
  context.fillRect(x - 2.5, y - 36, 5, 40);
  context.fillStyle = "#334155";
  context.fillRect(x - 1.5, y - 36, 2, 40);

  context.fillStyle = "#1e293b";
  context.fillRect(x - 6, y - 4, 12, 6);
  context.fillStyle = "#facc15";
  context.fillRect(x - 4, y - 2, 8, 2);

  context.fillStyle = "#0f172a";
  context.fillRect(x - 7, y - 46, 14, 4);
  context.fillStyle = "#fef08a";
  context.fillRect(x - 5, y - 42, 10, 8);
  context.strokeStyle = "#f59e0b";
  context.lineWidth = 1;
  context.strokeRect(x - 5, y - 42, 10, 8);

  context.fillStyle = "#facc15";
  context.fillRect(x - 1.5, y - 49, 3, 3);
}

function drawParkBench(x, y) {
  context.fillStyle = "rgba(0, 0, 0, 0.35)";
  context.fillRect(x - 18, y + 10, 36, 6);

  context.fillStyle = "#0f172a";
  context.fillRect(x - 15, y, 4, 12);
  context.fillRect(x + 11, y, 4, 12);

  context.fillStyle = "#92400e";
  context.fillRect(x - 18, y - 4, 36, 5);
  context.fillRect(x - 18, y - 12, 36, 5);
  context.fillStyle = "#b45309";
  context.fillRect(x - 18, y - 3, 36, 2);
  context.fillRect(x - 18, y - 11, 36, 2);
}

function drawFireHydrant(x, y) {
  context.fillStyle = "rgba(0, 0, 0, 0.35)";
  context.beginPath(); context.ellipse(x, y + 4, 6, 3, 0, 0, Math.PI * 2); context.fill();

  context.fillStyle = "#dc2626";
  context.fillRect(x - 4, y - 12, 8, 14);
  context.fillStyle = "#ef4444";
  context.fillRect(x - 2, y - 12, 3, 14);

  context.fillStyle = "#e2e8f0";
  context.fillRect(x - 7, y - 8, 3, 4);
  context.fillRect(x + 4, y - 8, 3, 4);
  context.fillRect(x - 5, y - 15, 10, 3);
}

function drawBicycleRack(x, y) {
  context.fillStyle = "#64748b";
  for (let i = 0; i < 4; i++) {
    const rx = x + i * 10;
    context.strokeRect(rx, y - 10, 6, 12);
  }
}

function drawDualRecycleBin(x, y) {
  context.fillStyle = "#15803d";
  context.fillRect(x - 10, y - 12, 9, 14);
  context.fillStyle = "#22c55e";
  context.fillRect(x - 11, y - 15, 11, 3);

  context.fillStyle = "#0284c7";
  context.fillRect(x + 1, y - 12, 9, 14);
  context.fillStyle = "#38bdf8";
  context.fillRect(x, y - 15, 11, 3);
}

function drawFlowerBed(x, y, w, h) {
  context.fillStyle = "#475569";
  context.fillRect(x, y, w, h);
  context.fillStyle = "#334155";
  context.fillRect(x + 2, y + 2, w - 4, h - 4);

  context.fillStyle = "#3b1d11";
  context.fillRect(x + 4, y + 4, w - 8, h - 8);

  const colors = ["#ef4444", "#facc15", "#c084fc", "#f472b6", "#38bdf8"];
  for (let fx = x + 8; fx < x + w - 8; fx += 10) {
    const col = colors[(Math.floor(fx / 10)) % colors.length];
    context.fillStyle = "#15803d";
    context.fillRect(fx + 1, y + 8, 2, 4);
    context.fillStyle = col;
    context.fillRect(fx, y + 6, 4, 3);
    context.fillStyle = "#ffffff";
    context.fillRect(fx + 1, y + 7, 2, 1);
  }
}

function drawPixelTree(x, y, type = "oak", time = 0) {
  context.fillStyle = "rgba(0, 0, 0, 0.35)";
  context.beginPath();
  context.ellipse(x, y + 26, 28, 11, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#5c2b09";
  context.fillRect(x - 6, y + 4, 12, 22);
  context.fillStyle = "#381703";
  context.fillRect(x - 6, y + 4, 4, 22);
  context.fillStyle = "#854d0e";
  context.fillRect(x + 2, y + 4, 4, 22);

  const sway = Math.sin(time * 2 + x) * 2.5;

  if (type === "cherry") {
    context.fillStyle = "#be185d";
    context.beginPath(); context.arc(x + sway, y - 8, 30, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#db2777";
    context.beginPath(); context.arc(x + sway - 6, y - 14, 22, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#f472b6";
    context.beginPath(); context.arc(x + sway - 10, y - 18, 14, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#fdf2f8";
    context.beginPath(); context.arc(x + sway - 12, y - 20, 6, 0, Math.PI * 2); context.fill();
  } else {
    context.fillStyle = "#14532d";
    context.beginPath(); context.arc(x + sway, y - 8, 30, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#15803d";
    context.beginPath(); context.arc(x + sway - 6, y - 14, 22, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#22c55e";
    context.beginPath(); context.arc(x + sway - 10, y - 18, 14, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#86efac";
    context.beginPath(); context.arc(x + sway - 12, y - 20, 6, 0, Math.PI * 2); context.fill();
  }
}

// ----------------------------------------------------
// 6 DISTINCT CUSTOM PIXEL BUILDING RENDERERS
// ----------------------------------------------------

function drawDistinctBuilding(bldg, time, isTarget) {
  const bx = bldg.x - bldg.w / 2;
  const by = bldg.y - bldg.h / 2;

  // Waypoint Beacon Beam
  if (isTarget) {
    const gradBeam = context.createLinearGradient(0, by - 140, 0, by + bldg.h);
    gradBeam.addColorStop(0, "rgba(250, 204, 21, 0.55)");
    gradBeam.addColorStop(0.6, `${bldg.accentColor}33`);
    gradBeam.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradBeam;
    context.fillRect(bldg.stationX - 50, by - 140, 100, bldg.h + 140);

    const pinY = by - 38 + Math.sin(time * 6) * 6;
    context.fillStyle = "#facc15";
    context.font = "bold 26px sans-serif";
    context.textAlign = "center";
    context.fillText("📍", bldg.stationX, pinY);

    context.fillStyle = "#fef08a";
    context.font = "bold 11px 'Silkscreen', 'VT323', monospace, sans-serif";
    context.fillText("MỤC TIÊU HIỆN TẠI", bldg.stationX, pinY - 18);
  }

  // Building Ground Shadow
  context.fillStyle = "rgba(0, 0, 0, 0.55)";
  context.fillRect(bx + 14, by + 18, bldg.w, bldg.h);

  switch (bldg.type) {
    case "reception":
      drawReceptionBuilding(bx, by, bldg, time, isTarget);
      break;
    case "server":
      drawServerDataBuilding(bx, by, bldg, time, isTarget);
      break;
    case "stamp":
      drawStampingTowerBuilding(bx, by, bldg, time, isTarget);
      break;
    case "inspection":
      drawInspectionFortressBuilding(bx, by, bldg, time, isTarget);
      break;
    case "gate":
      drawPublicAccountabilityHall(bx, by, bldg, time, isTarget);
      break;
    case "feedback":
      drawCommunityDialoguePavilion(bx, by, bldg, time, isTarget);
      break;
    default:
      drawDefaultBuilding(bx, by, bldg, time, isTarget);
      break;
  }

  // Header Neon Signboard
  const signW = bldg.w - 40;
  const signH = 38;
  const sx = bldg.x - signW / 2;
  const sy = by + 16;

  context.fillStyle = "rgba(15, 23, 42, 0.96)";
  context.fillRect(sx, sy, signW, signH);
  context.strokeStyle = isTarget ? "#facc15" : bldg.accentColor;
  context.lineWidth = 2;
  context.strokeRect(sx, sy, signW, signH);

  context.fillStyle = isTarget ? "#facc15" : "#ffffff";
  context.font = "bold 13px 'Silkscreen', 'VT323', monospace, sans-serif";
  context.textAlign = "center";
  context.fillText(bldg.name, bldg.x, sy + 16);

  context.fillStyle = isTarget ? "#fef08a" : bldg.accentColor;
  context.font = "11px 'VT323', monospace, sans-serif";
  context.fillText(bldg.sub, bldg.x, sy + 32);
}

// 1. Reception Glass Atrium (Cyan & Sky Blue)
function drawReceptionBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#0c4a6e";
  context.fillRect(bx, by, bldg.w, bldg.h - 40);
  context.strokeStyle = isTarget ? "#facc15" : "#38bdf8";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 40);

  context.fillStyle = "#0284c7";
  context.fillRect(bx - 8, by - 14, bldg.w + 16, 26);
  context.fillStyle = "#38bdf8";
  context.fillRect(bx - 4, by + 8, bldg.w + 8, 4);

  const cols = 8;
  const rows = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = bx + 36 + c * ((bldg.w - 72) / cols);
      const wy = by + 46 + r * 38;
      const isLit = Math.sin(time * 2 + r + c) > -0.3;
      context.fillStyle = isLit ? "rgba(56, 189, 248, 0.85)" : "#075985";
      context.fillRect(wx, wy, 34, 24);
      context.strokeStyle = "#38bdf8";
      context.lineWidth = 1.5;
      context.strokeRect(wx, wy, 34, 24);
    }
  }

  const ex = bldg.stationX - 60;
  const ey = by + bldg.h - 45;
  context.fillStyle = "#0369a1";
  context.fillRect(ex, ey, 120, 45);
  context.fillStyle = "rgba(255, 255, 255, 0.4)";
  context.fillRect(ex + 20, ey + 8, 80, 37);
  context.fillStyle = "#facc15";
  context.font = "bold 10px monospace";
  context.textAlign = "center";
  context.fillText("01 CỬA", bldg.stationX, ey - 6);
}

// 2. Data & Cloud Cyber Server Tower (Matrix Emerald & Neon Mint)
function drawServerDataBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#064e3b";
  context.fillRect(bx, by, bldg.w, bldg.h - 40);
  context.strokeStyle = isTarget ? "#facc15" : "#34d399";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 40);

  context.fillStyle = "#059669";
  context.fillRect(bx - 6, by - 14, bldg.w + 12, 24);
  context.fillStyle = "#34d399";
  context.fillRect(bx, by + 6, bldg.w, 4);

  context.fillStyle = "#94a3b8";
  context.beginPath(); context.arc(bx + 60, by - 24, 18, Math.PI * 0.8, Math.PI * 1.9); context.stroke();
  context.beginPath(); context.arc(bx + bldg.w - 60, by - 24, 18, Math.PI * 1.1, Math.PI * 2.2); context.stroke();

  const cols = 7;
  const rows = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sx = bx + 42 + c * ((bldg.w - 84) / cols);
      const sy = by + 46 + r * 38;
      context.fillStyle = "#022c22";
      context.fillRect(sx, sy, 38, 26);
      context.strokeStyle = "#059669";
      context.lineWidth = 1;
      context.strokeRect(sx, sy, 38, 26);

      const ledColor = (c + r + Math.floor(time * 6)) % 3 === 0 ? "#34d399" : (c % 2 === 0 ? "#10b981" : "#059669");
      context.fillStyle = ledColor;
      context.fillRect(sx + 6, sy + 5, 8, 4);
      context.fillRect(sx + 6, sy + 11, 8, 4);
      context.fillRect(sx + 6, sy + 17, 8, 4);
      context.fillStyle = "#10b981";
      context.fillRect(sx + 20, sy + 5, 12, 16);
    }
  }

  const ex = bldg.stationX - 60;
  const ey = by + bldg.h - 45;
  context.fillStyle = "#047857";
  context.fillRect(ex, ey, 120, 45);
  context.fillStyle = "#10b981";
  context.font = "bold 9px monospace";
  context.textAlign = "center";
  context.fillText("CLOUD DATA CENTER", bldg.stationX, ey - 6);
}

// 3. Stamping Clocktower (Crimson & Gold Peak Dome)
function drawStampingTowerBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#7f1d1d";
  context.fillRect(bx, by, bldg.w, bldg.h - 40);
  context.strokeStyle = isTarget ? "#facc15" : "#f87171";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 40);

  context.fillStyle = "#991b1b";
  context.fillRect(bx - 8, by - 16, bldg.w + 16, 28);
  context.fillStyle = "#facc15";
  context.fillRect(bx - 4, by + 8, bldg.w + 8, 4);

  const tx = bldg.x;
  context.fillStyle = "#b91c1c";
  context.beginPath();
  context.moveTo(tx - 45, by - 16);
  context.lineTo(tx, by - 60);
  context.lineTo(tx + 45, by - 16);
  context.closePath();
  context.fill();
  context.strokeStyle = "#facc15";
  context.lineWidth = 2.5;
  context.stroke();

  context.fillStyle = "#fef08a";
  context.beginPath(); context.arc(tx, by - 26, 14, 0, Math.PI * 2); context.fill();
  context.strokeStyle = "#7f1d1d";
  context.lineWidth = 2;
  context.stroke();

  context.strokeStyle = "#000000";
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(tx, by - 26);
  context.lineTo(tx + Math.cos(time * 3) * 8, by - 26 + Math.sin(time * 3) * 8);
  context.moveTo(tx, by - 26);
  context.lineTo(tx + Math.cos(time * 0.5) * 5, by - 26 + Math.sin(time * 0.5) * 5);
  context.stroke();

  const cols = 8;
  const rows = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = bx + 36 + c * ((bldg.w - 72) / cols);
      const wy = by + 46 + r * 38;
      context.fillStyle = "#fef08a";
      context.fillRect(wx, wy, 32, 24);
      context.strokeStyle = "#991b1b";
      context.lineWidth = 1.5;
      context.strokeRect(wx, wy, 32, 24);
    }
  }

  const ex = bldg.stationX - 60;
  const ey = by + bldg.h - 45;
  context.fillStyle = "#991b1b";
  context.fillRect(ex, ey, 120, 45);
  context.fillStyle = "#facc15";
  context.font = "bold 9px monospace";
  context.textAlign = "center";
  context.fillText("★ PHÊ DUYỆT CÔNG VỤ ★", bldg.stationX, ey - 6);
}

// 4. Inspection Fortress (Fortified Stone & Amber Scales of Justice)
function drawInspectionFortressBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#78350f";
  context.fillRect(bx, by, bldg.w, bldg.h - 40);
  context.strokeStyle = isTarget ? "#facc15" : "#fbbf24";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 40);

  context.fillStyle = "#b45309";
  context.fillRect(bx - 6, by - 14, bldg.w + 12, 24);
  const batCount = Math.floor(bldg.w / 54);
  for (let i = 0; i < batCount; i++) {
    context.fillRect(bx + i * 54 + 6, by - 24, 28, 12);
  }

  context.fillStyle = "#facc15";
  context.font = "bold 20px sans-serif";
  context.textAlign = "center";
  context.fillText("⚖️", bldg.x, by + 48);

  const cols = 8;
  const rows = 3;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = bx + 36 + c * ((bldg.w - 72) / cols);
      const wy = by + 68 + r * 38;
      context.fillStyle = "#fbbf24";
      context.fillRect(wx, wy, 32, 24);
      context.strokeStyle = "#451a03";
      context.lineWidth = 1.5;
      context.strokeRect(wx, wy, 32, 24);
    }
  }

  const ex = bldg.stationX - 60;
  const ey = by + 20;
  context.fillStyle = "#451a03";
  context.fillRect(ex, ey, 120, 45);
  context.fillStyle = "#facc15";
  context.font = "bold 9px monospace";
  context.textAlign = "center";
  context.fillText("VIỆN THANH TRA & GIÁM SÁT", bldg.stationX, ey + 26);
}

// 5. Public Accountability Hall / Gate (Roman Temple Pillars & Eternal Flame)
function drawPublicAccountabilityHall(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#164e63";
  context.fillRect(bx, by, bldg.w, bldg.h - 40);
  context.strokeStyle = isTarget ? "#facc15" : "#22d3ee";
  context.lineWidth = 3.5;
  context.strokeRect(bx, by, bldg.w, bldg.h - 40);

  const tx = bldg.x;
  context.fillStyle = "#0891b2";
  context.beginPath();
  context.moveTo(bx - 10, by - 12);
  context.lineTo(tx, by - 65);
  context.lineTo(bx + bldg.w + 10, by - 12);
  context.closePath();
  context.fill();
  context.strokeStyle = "#facc15";
  context.lineWidth = 3;
  context.stroke();

  context.fillStyle = "#facc15";
  context.font = "bold 12px 'Silkscreen', monospace";
  context.textAlign = "center";
  context.fillText("★ MINH BẠCH - CÔNG KHAI - DÂN BIẾT DÂN BÀN ★", tx, by - 24);

  const pillarCount = 6;
  const pStep = (bldg.w - 60) / (pillarCount - 1);
  for (let i = 0; i < pillarCount; i++) {
    const px = bx + 30 + i * pStep;
    context.fillStyle = "#e2e8f0";
    context.fillRect(px - 10, by + 42, 20, bldg.h - 90);
    context.strokeStyle = "#94a3b8";
    context.lineWidth = 1;
    context.strokeRect(px - 10, by + 42, 20, bldg.h - 90);

    context.fillStyle = "#facc15";
    context.fillRect(px - 14, by + 38, 28, 6);
    context.fillRect(px - 14, by + bldg.h - 52, 28, 6);
  }

  const ex = bldg.stationX;
  const ey = bldg.stationY;
  context.fillStyle = "#facc15";
  context.beginPath(); context.arc(ex, ey, 14, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#ef4444";
  context.font = "bold 18px sans-serif";
  context.fillText("🔥", ex, ey + 6);
}

// 6. Community Dialogue Pavilion (Vietnamese Sloping Pagoda Roof)
function drawCommunityDialoguePavilion(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#831843";
  context.fillRect(bx, by, bldg.w, bldg.h - 40);
  context.strokeStyle = isTarget ? "#facc15" : "#f472b6";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 40);

  context.fillStyle = "#be185d";
  context.beginPath();
  context.moveTo(bx - 24, by + 4);
  context.quadraticCurveTo(bldg.x, by - 45, bx + bldg.w + 24, by + 4);
  context.lineTo(bx + bldg.w + 8, by - 8);
  context.quadraticCurveTo(bldg.x, by - 48, bx - 8, by - 8);
  context.closePath();
  context.fill();
  context.strokeStyle = "#facc15";
  context.lineWidth = 2.5;
  context.stroke();

  const cols = 7;
  const rows = 3;
  const noteColors = ["#fef08a", "#fbcfe8", "#bbf7d0", "#bae6fd"];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const nx = bx + 44 + c * ((bldg.w - 88) / cols);
      const ny = by + 68 + r * 38;
      context.fillStyle = noteColors[(r + c) % noteColors.length];
      context.fillRect(nx, ny, 34, 24);
      context.strokeStyle = "#831843";
      context.lineWidth = 1;
      context.strokeRect(nx, ny, 34, 24);
    }
  }

  const ex = bldg.stationX - 60;
  const ey = by + 20;
  context.fillStyle = "#9d174d";
  context.fillRect(ex, ey, 120, 45);
  context.fillStyle = "#f472b6";
  context.font = "bold 9px monospace";
  context.textAlign = "center";
  context.fillText("KHÔNG GIAN TIẾP DÂN", bldg.stationX, ey + 26);
}

function drawDefaultBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#0f172a";
  context.fillRect(bx, by, bldg.w, bldg.h - 40);
}

// ----------------------------------------------------
// PIXEL CHARACTER RENDERER (MALE & FEMALE SPRITES)
// ----------------------------------------------------

function drawPixelCharacter(ctx, x, y, options = {}) {
  const charId = options.characterId || options.character || "male_reception";
  const gender = options.gender || (charId.startsWith("female") ? "female" : "male");
  const color = options.color || (gender === "female" ? "#db2777" : "#0284c7");
  const name = options.name || "Cán bộ";
  const isLocal = options.isLocal || false;
  const isMoving = options.isMoving || false;
  const time = state.gameTime;

  const walkCycle = isMoving ? Math.sin(time * 14) : 0;
  const footOffset = isMoving ? Math.sin(time * 14) * 4 : 0;
  const bobY = y + Math.abs(walkCycle) * 2;

  // Ground Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y + 14, 13, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shoes & Feet
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 7, bobY + 10 + footOffset, 5, 4);
  ctx.fillRect(x + 2, bobY + 10 - footOffset, 5, 4);

  // Legs / Skirt / Trousers
  if (gender === "female" && charId === "female_dialogue") {
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(x - 8, bobY + 4);
    ctx.lineTo(x + 8, bobY + 4);
    ctx.lineTo(x + 9, bobY + 10);
    ctx.lineTo(x - 9, bobY + 10);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x - 7, bobY + 4, 14, 7);
  }

  // Torso / Outfit
  ctx.fillStyle = color;
  ctx.fillRect(x - 8, bobY - 6, 16, 11);

  // Lapel / White Collared Shirt
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(x - 4, bobY - 6);
  ctx.lineTo(x + 4, bobY - 6);
  ctx.lineTo(x, bobY - 1);
  ctx.closePath();
  ctx.fill();

  // Tie or Ribbon
  if (gender === "male") {
    ctx.fillStyle = "#b91c1c";
    ctx.fillRect(x - 1, bobY - 4, 2, 6);
  } else {
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(x, bobY - 3, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Official Badge Pin on Left Chest
  ctx.fillStyle = "#facc15";
  ctx.fillRect(x - 6, bobY - 4, 2, 2);

  // Arms & Sleeves
  ctx.fillStyle = color;
  ctx.fillRect(x - 10, bobY - 5 - footOffset * 0.5, 3, 8);
  ctx.fillRect(x + 7, bobY - 5 + footOffset * 0.5, 3, 8);
  ctx.fillStyle = "#fed7aa";
  ctx.fillRect(x - 10, bobY + 3 - footOffset * 0.5, 3, 3);
  ctx.fillRect(x + 7, bobY + 3 + footOffset * 0.5, 3, 3);

  // Head & Skin Tone
  ctx.fillStyle = "#fed7aa";
  ctx.fillRect(x - 6, bobY - 17, 12, 11);

  // Eyes
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 4, bobY - 12, 2, 3);
  ctx.fillRect(x + 2, bobY - 12, 2, 3);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 3, bobY - 12, 1, 1);
  ctx.fillRect(x + 3, bobY - 12, 1, 1);

  // Soft Blush for Female Characters
  if (gender === "female") {
    ctx.fillStyle = "rgba(244, 114, 182, 0.85)";
    ctx.fillRect(x - 5, bobY - 9, 2, 1.5);
    ctx.fillRect(x + 3, bobY - 9, 2, 1.5);
  }

  // Distinct Hairstyle & Accessories
  const hairColor = gender === "female" ? (charId === "female_inspector" ? "#451a03" : "#1c1917") : (charId === "male_digital" ? "#1e293b" : "#331800");

  if (gender === "female") {
    if (charId === "female_inspector") {
      ctx.fillStyle = hairColor;
      ctx.fillRect(x - 8, bobY - 20, 16, 5);
      ctx.fillRect(x - 8, bobY - 17, 3, 9);
      ctx.fillRect(x + 5, bobY - 17, 3, 9);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(x + 3, bobY - 18, 3, 2);
    } else if (charId === "female_youth") {
      ctx.fillStyle = hairColor;
      ctx.fillRect(x - 8, bobY - 20, 16, 5);
      ctx.fillRect(x - 8, bobY - 16, 3, 12);
      ctx.fillRect(x + 5, bobY - 16, 3, 12);
      ctx.fillStyle = "#ec4899";
      ctx.fillRect(x - 8, bobY - 13, 2, 2);
      ctx.fillRect(x + 6, bobY - 13, 2, 2);
    } else {
      ctx.fillStyle = hairColor;
      ctx.fillRect(x - 8, bobY - 20, 16, 5);
      ctx.fillRect(x - 7, bobY - 17, 3, 7);
      ctx.fillRect(x + 4, bobY - 17, 3, 7);
      ctx.fillRect(x + 6, bobY - 14, 4, 11);
      ctx.fillStyle = "#facc15";
      ctx.fillRect(x + 5, bobY - 14, 2, 2);
    }
  } else {
    ctx.fillStyle = hairColor;
    ctx.fillRect(x - 7, bobY - 20, 14, 6);
    ctx.fillRect(x - 7, bobY - 17, 2, 5);
    ctx.fillRect(x + 5, bobY - 17, 2, 5);
  }

  // Active Quest Dossier Carrier Animation
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

  // Waypoint Guidance Arrow to Target Building
  if (isLocal && state.activeQuest) {
    const currentStep = state.activeQuest.steps[state.activeQuest.currentStepIndex];
    const targetBldg = getBuildingById(currentStep.bldgId);
    if (targetBldg) {
      const angle = Math.atan2(targetBldg.stationY - y, targetBldg.stationX - x);
      const orbitR = 38;
      const arrowTipX = x + Math.cos(angle) * orbitR;
      const arrowTipY = y + Math.sin(angle) * orbitR;

      ctx.save();
      ctx.translate(arrowTipX, arrowTipY);
      ctx.rotate(angle);
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(9, 0);
      ctx.lineTo(-7, -7);
      ctx.lineTo(-7, 7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Local Player Arrow Marker
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
  const tagW = Math.max(54, name.length * 7 + 14);
  ctx.fillRect(x - tagW / 2, bobY - (state.activeQuest ? 34 : 30), tagW, 14);
  ctx.strokeStyle = isLocal ? "#38bdf8" : "#64748b";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - tagW / 2, bobY - (state.activeQuest ? 34 : 30), tagW, 14);

  ctx.fillStyle = isLocal ? "#38bdf8" : "#f1f5f9";
  ctx.font = "bold 9px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(name, x, bobY - (state.activeQuest ? 23 : 20));
}

// ----------------------------------------------------
// BEAUTIFUL 32-BIT PIXEL ART ITEM GRAPHICS
// ----------------------------------------------------
function drawItemEntity(ctx, entity, time) {
  const x = entity.x;
  const floatY = entity.y + Math.sin(time * 3.5 + (entity.x % 10)) * 5;
  const type = entity.type || "case_file";
  const label = entity.label || entity.name || (type === "case_file" ? "Hồ sơ" : "Liêm chính");

  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.beginPath(); ctx.ellipse(x, entity.y + 14, 15, 5, 0, 0, Math.PI * 2); ctx.fill();

  const glowRadius = 20 + Math.sin(time * 4) * 3;

  if (type === "case_file") {
    ctx.fillStyle = "rgba(56, 189, 248, 0.3)";
    ctx.beginPath(); ctx.arc(x, floatY, glowRadius, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#0369a1";
    ctx.fillRect(x - 13, floatY - 15, 26, 22);
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(x - 11, floatY - 13, 22, 18);

    ctx.fillStyle = "#facc15";
    ctx.fillRect(x - 13, floatY - 15, 4, 3);
    ctx.fillRect(x + 9, floatY - 15, 4, 3);
    ctx.fillRect(x - 13, floatY + 4, 4, 3);
    ctx.fillRect(x + 9, floatY + 4, 4, 3);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - 9, floatY - 11, 18, 14);
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(x - 6, floatY - 8, 12, 2);
    ctx.fillRect(x - 6, floatY - 4, 12, 1.5);
    ctx.fillRect(x - 6, floatY - 1, 8, 1.5);

    ctx.fillStyle = "#dc2626";
    ctx.fillRect(x - 4, floatY + 2, 8, 7);
    ctx.fillStyle = "#ef4444";
    ctx.beginPath(); ctx.arc(x, floatY + 5, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#facc15";
    ctx.fillRect(x - 1, floatY + 4, 2, 2);

    ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 13, floatY - 15, 26, 22);

  } else if (type === "integrity_item") {
    ctx.fillStyle = "rgba(16, 185, 129, 0.35)";
    ctx.beginPath(); ctx.arc(x, floatY, glowRadius, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(x - 14, floatY - 15); ctx.lineTo(x + 14, floatY - 15);
    ctx.lineTo(x + 14, floatY + 3); ctx.lineTo(x, floatY + 18); ctx.lineTo(x - 14, floatY + 3);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#b45309"; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.fillStyle = "#047857";
    ctx.beginPath();
    ctx.moveTo(x - 9, floatY - 11); ctx.lineTo(x + 9, floatY - 11);
    ctx.lineTo(x + 9, floatY + 2); ctx.lineTo(x, floatY + 13); ctx.lineTo(x - 9, floatY + 2);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.moveTo(x - 6, floatY - 8); ctx.lineTo(x + 6, floatY - 8);
    ctx.lineTo(x + 6, floatY + 1); ctx.lineTo(x, floatY + 9); ctx.lineTo(x - 6, floatY + 1);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = "#fef08a";
    ctx.fillRect(x - 2, floatY - 7, 4, 12);
    ctx.fillRect(x - 6, floatY - 3, 12, 4);

  } else if (type === "transparency") {
    ctx.fillStyle = "rgba(6, 182, 212, 0.4)";
    ctx.beginPath(); ctx.arc(x, floatY, glowRadius, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = "rgba(103, 232, 249, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, floatY, 18, 7, time * 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#0891b2";
    ctx.beginPath();
    ctx.moveTo(x, floatY - 17); ctx.lineTo(x + 15, floatY); ctx.lineTo(x, floatY + 17); ctx.lineTo(x - 15, floatY);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#67e8f9"; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = "#22d3ee";
    ctx.beginPath();
    ctx.moveTo(x, floatY - 17); ctx.lineTo(x + 15, floatY); ctx.lineTo(x, floatY);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = "#a5f3fc";
    ctx.beginPath();
    ctx.moveTo(x, floatY - 17); ctx.lineTo(x, floatY); ctx.lineTo(x - 15, floatY);
    ctx.closePath(); ctx.fill();

  } else if (type === "positive_feedback" || type === "review") {
    ctx.fillStyle = "rgba(245, 158, 11, 0.4)";
    ctx.beginPath(); ctx.arc(x, floatY, glowRadius, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#b91c1c";
    ctx.fillRect(x - 8, floatY - 20, 16, 11);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(x - 2, floatY - 20, 4, 11);

    ctx.fillStyle = "#f59e0b";
    ctx.beginPath(); ctx.arc(x, floatY + 2, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#78350f"; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.fillStyle = "#fef08a";
    ctx.beginPath(); ctx.arc(x, floatY + 2, 11, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#b45309";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("★", x, floatY + 7.5);

  } else if (type === "accountability") {
    ctx.fillStyle = "rgba(250, 204, 21, 0.35)";
    ctx.beginPath(); ctx.arc(x, floatY, glowRadius, 0, Math.PI * 2); ctx.fill();

    // Imperial Gold Scroll of Accountability
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(x - 14, floatY - 14, 28, 22);
    ctx.fillStyle = "#ca8a04";
    ctx.fillRect(x - 16, floatY - 16, 4, 26);
    ctx.fillRect(x + 12, floatY - 16, 4, 26);

    ctx.fillStyle = "#92400e";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚖️", x, floatY + 2);

    ctx.strokeStyle = "#ca8a04"; ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 14, floatY - 14, 28, 22);

    // Label Box
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(x - 38, floatY + 18, 76, 13);
    ctx.strokeStyle = "#facc15"; ctx.lineWidth = 1;
    ctx.strokeRect(x - 38, floatY + 18, 76, 13);

    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 8px 'Silkscreen', 'VT323', monospace, sans-serif";
    ctx.fillText("Sổ Giải Trình", x, floatY + 27);
    return;

  } else if (type === "serve_people") {
    drawCitizenInNeedEntity(ctx, x, entity.y, time);
    return;

  } else {
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(x - 11, floatY - 13, 22, 19);
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(x - 8, floatY - 15, 16, 6);
  }

  // Label Box
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 34, floatY + 20, 68, 14);
  ctx.strokeStyle = "#facc15"; ctx.lineWidth = 1;
  ctx.strokeRect(x - 34, floatY + 20, 68, 14);

  ctx.fillStyle = "#fef08a";
  ctx.font = "bold 8px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label.slice(0, 13), x, floatY + 30);
}

// ----------------------------------------------------
// PIXEL ART CITIZEN IN NEED (NGƯỜI DÂN CẦN HỖ TRỢ)
// ----------------------------------------------------
function drawCitizenInNeedEntity(ctx, x, y, time) {
  const floatBob = Math.sin(time * 3) * 2;
  const cy = y + floatBob;

  // Ground Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath(); ctx.ellipse(x, y + 14, 14, 5, 0, 0, Math.PI * 2); ctx.fill();

  // Pants & Shoes
  ctx.fillStyle = "#334155";
  ctx.fillRect(x - 6, cy + 4, 12, 9);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 6, cy + 12, 5, 3);
  ctx.fillRect(x + 1, cy + 12, 5, 3);

  // Humble Coat / Shirt
  ctx.fillStyle = "#9a3412";
  ctx.fillRect(x - 8, cy - 6, 16, 11);
  ctx.fillStyle = "#ea580c";
  ctx.fillRect(x - 6, cy - 5, 12, 4);

  // Wooden Walking Cane on left side
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 9, cy - 2);
  ctx.lineTo(x - 11, cy + 14);
  ctx.stroke();

  // Waving Hand on right side
  const waveOffset = Math.sin(time * 7) * 4;
  ctx.fillStyle = "#9a3412";
  ctx.fillRect(x + 7, cy - 6 - waveOffset, 3, 6);
  ctx.fillStyle = "#fed7aa";
  ctx.fillRect(x + 7, cy - 10 - waveOffset, 3, 4);

  // Head & Facial Features
  ctx.fillStyle = "#fed7aa";
  ctx.fillRect(x - 5, cy - 16, 10, 10);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 3, cy - 12, 2, 2);
  ctx.fillRect(x + 1, cy - 12, 2, 2);

  // Traditional Conical Hat (Nón Lá)
  ctx.fillStyle = "#fef08a";
  ctx.beginPath();
  ctx.moveTo(x, cy - 25);
  ctx.lineTo(x + 14, cy - 15);
  ctx.lineTo(x - 14, cy - 15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#ca8a04";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Animated Speech / Help Callout Bubble
  const bubbleY = cy - 36 + Math.sin(time * 5) * 3;
  ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
  ctx.fillRect(x - 28, bubbleY - 12, 56, 18);
  ctx.strokeStyle = "#ec4899";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - 28, bubbleY - 12, 56, 18);

  // Speech Bubble Pointer
  ctx.fillStyle = "#ec4899";
  ctx.beginPath();
  ctx.moveTo(x - 4, bubbleY + 6);
  ctx.lineTo(x, bubbleY + 11);
  ctx.lineTo(x + 4, bubbleY + 6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f472b6";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🆘 CẦN GIÚP", x, bubbleY + 1);

  // Floating Pulsing Heart above
  const heartScale = 1 + Math.sin(time * 6) * 0.2;
  ctx.fillStyle = "#ec4899";
  ctx.font = `bold ${Math.round(13 * heartScale)}px sans-serif`;
  ctx.fillText("❤️", x, bubbleY - 15);

  // Footer Tag
  ctx.fillStyle = "#831843";
  ctx.fillRect(x - 38, cy + 18, 76, 13);
  ctx.strokeStyle = "#f472b6";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 38, cy + 18, 76, 13);

  ctx.fillStyle = "#fdf2f8";
  ctx.font = "bold 8px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.fillText("Dân cần hỗ trợ", x, cy + 27);
}

// Draw Hazard Entity with Pulsing Siren & Red Border
function drawHazardEntity(ctx, entity, time) {
  const x = entity.x;
  const y = entity.y;
  const pulse = Math.sin(time * 7 + (entity.x % 10)) * 4;
  const type = entity.type || "envelope";
  const label = entity.label || "Cạm bẫy di chuyển";

  ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 + Math.sin(time * 8) * 0.4})`;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, 22 + pulse, 0, Math.PI * 2);
  ctx.stroke();

  const sirenY = y - 24 + Math.sin(time * 8) * 3;
  ctx.fillStyle = "#ef4444";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("⚠️", x, sirenY);

  if (type === "envelope") {
    ctx.fillStyle = "#b91c1c";
    ctx.fillRect(x - 14, y - 10, 28, 18);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 14, y - 10, 28, 18);
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(x - 6, y - 14, 12, 6);
  } else if (type === "waste") {
    ctx.fillStyle = "#475569";
    ctx.fillRect(x - 11, y - 13, 22, 22);
    ctx.fillStyle = "#eab308";
    ctx.fillRect(x - 9, y - 7, 18, 9);
  } else if (type === "group_interest") {
    ctx.fillStyle = "#1e1b4b";
    ctx.fillRect(x - 13, y - 9, 26, 18);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(x - 3, y - 6, 6, 6);
  } else {
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.moveTo(x, y - 15); ctx.lineTo(x + 15, y + 11); ctx.lineTo(x - 15, y + 11);
    ctx.closePath(); ctx.fill();
  }

  ctx.fillStyle = "#7f1d1d";
  ctx.fillRect(x - 36, y + 16, 72, 13);
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
// MINI-MAP RADAR HUD
// ----------------------------------------------------
function drawMiniMapRadar() {
  const mmW = 180;
  const mmH = 105;
  const mmX = VIEW_WIDTH - mmW - 14;
  const mmY = 14;
  const phaseKey = getActivePhaseKey();

  context.fillStyle = "rgba(15, 23, 42, 0.94)";
  context.fillRect(mmX, mmY, mmW, mmH);
  context.strokeStyle = "#38bdf8";
  context.lineWidth = 2;
  context.strokeRect(mmX, mmY, mmW, mmH);

  const mapToMmX = (wx) => mmX + (wx / MAP_WIDTH) * mmW;
  const mapToMmY = (wy) => mmY + (wy / MAP_HEIGHT) * mmH;

  context.fillStyle = "rgba(51, 65, 85, 0.65)";
  if (phaseKey === "phase_1") {
    context.fillRect(mmX, mapToMmY(600), mmW, (200 / MAP_HEIGHT) * mmH);
    context.fillRect(mapToMmX(340), mmY, (160 / MAP_WIDTH) * mmW, mmH);
    context.fillRect(mapToMmX(1120), mmY, (160 / MAP_WIDTH) * mmW, mmH);
    context.fillRect(mapToMmX(1900), mmY, (160 / MAP_WIDTH) * mmW, mmH);
  } else if (phaseKey === "phase_2") {
    context.fillRect(mmX, mapToMmY(320), mmW, (160 / MAP_HEIGHT) * mmH);
    context.fillRect(mmX, mapToMmY(920), mmW, (160 / MAP_HEIGHT) * mmH);
    context.fillRect(mapToMmX(480), mmY, (160 / MAP_WIDTH) * mmW, mmH);
    context.fillRect(mapToMmX(1760), mmY, (160 / MAP_WIDTH) * mmW, mmH);
    context.fillStyle = "rgba(16, 185, 129, 0.35)";
    context.fillRect(mapToMmX(640), mapToMmY(480), (1120 / MAP_WIDTH) * mmW, (440 / MAP_HEIGHT) * mmH);
  } else {
    context.fillStyle = "rgba(248, 250, 252, 0.4)";
    context.fillRect(mapToMmX(840), mmY, (720 / MAP_WIDTH) * mmW, mmH);
    context.fillStyle = "rgba(51, 65, 85, 0.65)";
    context.fillRect(mmX, mapToMmY(600), (840 / MAP_WIDTH) * mmW, (160 / MAP_HEIGHT) * mmH);
    context.fillRect(mapToMmX(1560), mapToMmY(600), (840 / MAP_WIDTH) * mmW, (160 / MAP_HEIGHT) * mmH);
  }

  const currentBuildings = getCurrentPhaseBuildings();
  const activeTargetBldgId = state.activeQuest
    ? state.activeQuest.steps[state.activeQuest.currentStepIndex]?.bldgId
    : null;

  for (const bldg of currentBuildings) {
    const mx = mapToMmX(bldg.x - bldg.w / 2);
    const my = mapToMmY(bldg.y - bldg.h / 2);
    const mw = (bldg.w / MAP_WIDTH) * mmW;
    const mh = (bldg.h / MAP_HEIGHT) * mmH;
    const isTarget = activeTargetBldgId === bldg.id;

    context.fillStyle = bldg.themeColor;
    context.fillRect(mx, my, mw, mh);
    context.strokeStyle = isTarget ? "#facc15" : bldg.accentColor;
    context.lineWidth = isTarget ? 2.5 : 1;
    context.strokeRect(mx, my, mw, mh);

    if (isTarget) {
      context.fillStyle = "#facc15";
      context.beginPath();
      context.arc(mapToMmX(bldg.stationX), mapToMmY(bldg.stationY), 5, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = "#facc15";
      context.lineWidth = 1;
      context.setLineDash([3, 3]);
      context.beginPath();
      context.moveTo(mapToMmX(state.player.x), mapToMmY(state.player.y));
      context.lineTo(mapToMmX(bldg.stationX), mapToMmY(bldg.stationY));
      context.stroke();
      context.setLineDash([]);
    }
  }

  for (const [id, mHazard] of movingHazardsState.entries()) {
    if (state.collectedIds.has(id) || state.resolvedCollisionIds.has(id)) continue;
    const px = mapToMmX(mHazard.x);
    const py = mapToMmY(mHazard.y);
    context.fillStyle = "#ef4444";
    context.fillRect(px - 1.5, py - 1.5, 3, 3);
  }

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

  const camBoxX = mapToMmX(camera.x);
  const camBoxY = mapToMmY(camera.y);
  const camBoxW = (VIEW_WIDTH / MAP_WIDTH) * mmW;
  const camBoxH = (VIEW_HEIGHT / MAP_HEIGHT) * mmH;

  context.strokeStyle = "#ffffff";
  context.lineWidth = 1;
  context.strokeRect(camBoxX, camBoxY, camBoxW, camBoxH);

  const lpx = mapToMmX(state.player.x);
  const lpy = mapToMmY(state.player.y);
  context.fillStyle = "#22c55e";
  context.beginPath(); context.arc(lpx, lpy, 4, 0, Math.PI * 2); context.fill();

  context.fillStyle = "#38bdf8";
  context.font = "bold 8px monospace";
  context.textAlign = "left";
  context.fillText(`RADAR - ${phaseKey.toUpperCase()}`, mmX + 6, mmY + 11);
}

// ----------------------------------------------------
// MAIN RENDER SCENE
// ----------------------------------------------------
function drawScene() {
  const time = state.gameTime;

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

  // 1. CAMERA TRANSLATION
  context.translate(-camera.x, -camera.y);

  // 2. Standalone Dynamic City Ground for Active Phase
  drawCityGround();

  // 3. Dynamic 6 Buildings for Active Phase
  const currentBuildings = getCurrentPhaseBuildings();
  const activeTargetBldgId = state.activeQuest
    ? state.activeQuest.steps[state.activeQuest.currentStepIndex]?.bldgId
    : null;

  for (const bldg of currentBuildings) {
    drawDistinctBuilding(bldg, time, activeTargetBldgId === bldg.id);
  }

  // 4. Interactive World Entities
  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (kind === "players" || !entities || typeof entities !== "object") continue;
    for (const [id, entity] of Object.entries(entities)) {
      if (!entity) continue;
      const fullId = entity.id || id;

      if (state.collectedIds.has(fullId) || state.resolvedCollisionIds.has(fullId)) continue;
      if (options.role === "player" && isEntityResolvedForPlayer(entity, options.playerId)) continue;

      if (kind === "items" || kind === "books") {
        const itemPos = resolveSolidBuildingCollisions(toWorldX(entity.x), toWorldY(entity.y), 24);
        drawItemEntity(context, { ...entity, id: fullId, kind: "item", x: itemPos.x, y: itemPos.y }, time);
      } else if (kind === "npcs") {
        const npcPos = resolveSolidBuildingCollisions(toWorldX(entity.x), toWorldY(entity.y), 20);
        drawNpcEntity(context, { ...entity, id: fullId, kind: "npc", x: npcPos.x, y: npcPos.y }, time);
      }
    }
  }

  // 5. Dynamic Moving Hazards
  for (const [id, mHazard] of movingHazardsState.entries()) {
    if (state.collectedIds.has(id) || state.resolvedCollisionIds.has(id)) continue;
    drawHazardEntity(context, mHazard, time);
  }

  // 6. Remote Players
  for (const [id, remote] of Object.entries(state.snapshot.players)) {
    if (options.role !== "player" || id !== options.playerId) {
      const rendered = remotePlayerRenderState.get(id);
      drawPixelCharacter(context, rendered?.x ?? toWorldX(remote.x), rendered?.y ?? toWorldY(remote.y), {
        name: remote.name || remote.id || "Cán bộ",
        color: rendered?.color || remote.color || "#64748b",
        characterId: rendered?.character || remote.character || "male_reception",
        gender: rendered?.gender || remote.gender || (remote.character?.startsWith("female") ? "female" : "male"),
        isLocal: false,
        isMoving: Boolean(rendered && Math.hypot(rendered.targetX - rendered.x, rendered.targetY - rendered.y) > 1),
      });
    }
  }

  // 7. Local Player
  if (options.role === "player") {
    drawPixelCharacter(context, state.player.x, state.player.y, {
      name: state.player.name || options.playerName,
      color: state.player.color || options.color,
      characterId: state.player.characterId,
      gender: state.player.gender,
      isLocal: true,
      isMoving: activeInput() && !state.frozen,
    });
  }

  // 8. Particles
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

  // 9. Floating Text
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

  context.restore();

  // ----------------------------------------------------
  // SCREEN SPACE OVERLAYS
  // ----------------------------------------------------

  drawMiniMapRadar();

  if (options.role === "player" && state.activeQuest) {
    const quest = state.activeQuest;
    const currentStep = quest.steps[quest.currentStepIndex];
    const targetBldg = getBuildingById(currentStep.bldgId);

    const bannerW = 480;
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
    context.fillText(`➔ Đến: ${targetBldg.name} (${currentStep.actionText})`, bx + 10, by + 34);
  }

  if (options.role === "player") {
    let promptText = null;

    if (state.frozen || state.freezeTimer > 0) {
      promptText = `❓ ĐANG XỬ LÝ CÂU HỎI TÌNH HUỐNG TRÊN MÀN HÌNH`;
    } else if (state.activeQuest) {
      const currentStep = state.activeQuest.steps[state.activeQuest.currentStepIndex];
      const isAtTarget = state.nearbyBuilding && state.nearbyBuilding.id === currentStep.bldgId;
      const targetBldg = getBuildingById(currentStep.bldgId);

      promptText = isAtTarget
        ? `⚡ ĐÃ ĐẾN NƠI! BẤM [E / SPACE / XỬ LÝ] ĐỂ: ${currentStep.actionText.toUpperCase()}`
        : `➔ ĐANG MANG HỒ SƠ ĐẾN: ${targetBldg.name} (BƯỚC ${state.activeQuest.currentStepIndex + 1}/${state.activeQuest.totalSteps})`;
    } else if (state.nearbyBuilding) {
      promptText = `⚡ BẤM [E / SPACE / XỬ LÝ] ${state.nearbyBuilding.actionLabel.toUpperCase()}`;
    }

    if (promptText) {
      const promptY = VIEW_HEIGHT - 24;
      context.fillStyle = state.frozen ? "rgba(185, 28, 28, 0.95)" : "rgba(15, 23, 42, 0.95)";
      context.fillRect(VIEW_WIDTH / 2 - 280, promptY - 14, 560, 26);
      context.strokeStyle = state.frozen ? "#ef4444" : "#facc15";
      context.lineWidth = 2;
      context.strokeRect(VIEW_WIDTH / 2 - 280, promptY - 14, 560, 26);

      context.fillStyle = state.frozen ? "#fecaca" : "#fef08a";
      context.font = "bold 11px 'Silkscreen', 'VT323', monospace, sans-serif";
      context.textAlign = "center";
      context.fillText(promptText, VIEW_WIDTH / 2, promptY + 3);
    }
  }

  // Question / Hazard Pause Overlay
  if (state.frozen || state.freezeTimer > 0) {
    context.fillStyle = "rgba(15, 23, 42, 0.4)";
    context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    context.fillStyle = "#facc15";
    context.font = "bold 18px 'Silkscreen', 'VT323', monospace, sans-serif";
    context.textAlign = "center";
    context.fillText("❓ THỬ THÁCH TÌNH HUỐNG CÔNG VỤ ❓", VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 10);
    context.font = "bold 13px 'VT323', monospace, sans-serif";
    context.fillStyle = "#ffffff";
    context.fillText("Vui lòng chọn đáp án xử lý đúng trên màn hình!", VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 15);
  }

  // Scanlines
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

  if (state.freezeTimer > 0) {
    state.freezeTimer -= deltaSeconds;
    if (state.freezeTimer <= 0) {
      state.frozen = false;
      state.freezeTimer = 0;
      setStatus(options.role === "host" ? "Chế độ Host sẵn sàng" : `Cán bộ ${options.playerName} sẵn sàng`);
    }
  }

  updateMovingHazards(deltaSeconds);
  advanceRemotePlayers(deltaSeconds);

  // Move player with SOLID BUILDING COLLISION BLOCKING
  if (!state.frozen && state.freezeTimer <= 0 && options.role === "player" && activeInput()) {
    const rawMoved = movePlayer(state.player, input, deltaSeconds, { width: MAP_WIDTH, height: MAP_HEIGHT });
    const blockedPos = resolveSolidBuildingCollisions(rawMoved.x, rawMoved.y, state.player.radius);
    state.player = {
      ...rawMoved,
      x: blockedPos.x,
      y: blockedPos.y,
    };

    if (now - state.lastMovePostedAt >= 125) {
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
  if (state.frozen || state.freezeTimer > 0) {
    event.preventDefault();
    return;
  }

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

// Canvas Direct Click/Tap Interaction Handler
canvas.addEventListener("pointerdown", (event) => {
  getAudioContext();
  if (state.frozen || state.freezeTimer > 0) return;

  const rect = canvas.getBoundingClientRect();
  const clickCanvasX = (event.clientX - rect.left) * (VIEW_WIDTH / rect.width);
  const clickCanvasY = (event.clientY - rect.top) * (VIEW_HEIGHT / rect.height);
  const worldClickX = clickCanvasX + camera.x;
  const worldClickY = clickCanvasY + camera.y;

  const currentBuildings = getCurrentPhaseBuildings();

  for (const bldg of currentBuildings) {
    const dist = Math.hypot(worldClickX - bldg.stationX, worldClickY - bldg.stationY);
    if (dist <= bldg.radius + 35) {
      executePlayerAction();
      return;
    }
  }

  executePlayerAction();
});

// Parent Window PostMessage Listener
window.addEventListener("message", (event) => {
  if (event.source !== window.parent) return;
  const message = event.data;
  if (!message || typeof message !== "object") return;

  if (message.type === "GAME_SNAPSHOT") {
    const nextPhase = typeof message.phase === "string" ? message.phase : state.phase;
    const phaseChanged = nextPhase !== state.phase
      && nextPhase !== "waiting"
      && nextPhase !== "finished";
    if (phaseChanged) {
      state.player.localPositionInitialized = false;
      remotePlayerRenderState.clear();
    }
    state.snapshot = normalizeSnapshot(message);
    if (nextPhase !== "waiting" && nextPhase !== "finished") {
      state.phase = nextPhase;
    }
    updatePlayerFromSnapshot();
    syncRemotePlayerTargets(state.snapshot.players);
    setStatus(`${options.role === "host" ? "Chế độ Ban Tổ Chức (Host)" : "Người chơi"}: ${state.phase}`);
  } else if (message.type === "PLAYER_POSITION") {
    applyPlayerPositionDelta(message);
  } else if (message.type === "DPAD_MOVE") {
    getAudioContext();
    if (!state.frozen && state.freezeTimer <= 0) {
      applyDpadMove(message.dir);
    }
  } else if (message.type === "ACTION_INTERACT") {
    executePlayerAction();
  } else if (message.type === "FREEZE") {
    state.frozen = true;
    state.freezeTimer = 0;
    sfx.freeze();
    setStatus("❓ Đang xử lý tình huống công vụ");
  } else if (message.type === "UNFREEZE") {
    state.frozen = false;
    state.freezeTimer = 0;
    setStatus(`${options.role === "host" ? "Chế độ Ban Tổ Chức (Host)" : "Người chơi"}: ${state.phase}`);
  } else if (message.type === "TOGGLE_SOUND") {
    soundEnabled = !soundEnabled;
  }
});

// Initial Setup
setStatus(options.role === "host" ? "Chế độ Host sẵn sàng" : `Cán bộ ${options.playerName} sẵn sàng`);
postToParent({ type: "RPG_READY", role: options.role, playerId: options.playerId });
requestAnimationFrame(frame);
