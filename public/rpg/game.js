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
// VNR-T17 HISTORICAL BUILDINGS & LANDMARK TEMPLATES (1978–1981)
// ----------------------------------------------------
const BUILDING_TEMPLATES = {
  // Phase 1 (1978: Hải Phòng - Nông nghiệp)
  bldg_doan_xa: {
    id: "bldg_doan_xa",
    name: "HTX NÔNG NGHIỆP ĐOÀN XÁ",
    sub: "Thực Nghiệm Khoán Chui Hải Phòng 1978",
    icon: "🌾",
    actionLabel: "Khảo sát thực địa khoán",
    type: "coop",
    themeColor: "#15803d",
    accentColor: "#4ade80",
  },
  bldg_rice_field: {
    id: "bldg_rice_field",
    name: "CÁNH ĐỒNG LÚA MÙA VỤ",
    sub: "Khoán Sản Phẩm Đến Nhóm & Người Lao Động",
    icon: "🌾",
    actionLabel: "Khảo sát mùa vụ",
    type: "field",
    themeColor: "#ca8a04",
    accentColor: "#facc15",
  },
  bldg_granary: {
    id: "bldg_granary",
    name: "KHO LƯƠNG THỰC & THÓC GIỐNG",
    sub: "Dữ Liệu Thu Hoạch Vượt Khoán Nông Hộ",
    icon: "🧺",
    actionLabel: "Kiểm kê kho thóc",
    type: "granary",
    themeColor: "#b45309",
    accentColor: "#fbbf24",
  },
  bldg_tractor: {
    id: "bldg_tractor",
    name: "TRẠM MÁY KÉO & NÔNG CỤ",
    sub: "Tập Trung Tư Liệu Sản Xuất",
    icon: "🚜",
    actionLabel: "Kiểm tra máy móc",
    type: "tractor",
    themeColor: "#0284c7",
    accentColor: "#38bdf8",
  },

  // Phase 2 (1979: TP.HCM - Dệt Thành Công)
  bldg_thanh_cong: {
    id: "bldg_thanh_cong",
    name: "XÍ NGHIỆP DỆT THÀNH CÔNG",
    sub: "Đột Phá Tự Cân Đối Sản Xuất 1979",
    icon: "🏭",
    actionLabel: "Kiểm tra xưởng dệt",
    type: "factory",
    themeColor: "#0369a1",
    accentColor: "#38bdf8",
  },
  bldg_yarn_warehouse: {
    id: "bldg_yarn_warehouse",
    name: "KHO BÔNG SỢI NHẬP KHẨU",
    sub: "Tự Cân Đối Nguyên Liệu Sản Xuất",
    icon: "🧶",
    actionLabel: "Nhập kho bông sợi",
    type: "warehouse",
    themeColor: "#059669",
    accentColor: "#34d399",
  },
  bldg_port: {
    id: "bldg_port",
    name: "BẾN CẢNG XUẤT NHẬP KHẨU",
    sub: "Giao Thương & Hợp Tác Ngoại Thương",
    icon: "🚢",
    actionLabel: "Kiểm tra hàng xuất khẩu",
    type: "port",
    themeColor: "#0891b2",
    accentColor: "#22d3ee",
  },
  bldg_director_office: {
    id: "bldg_director_office",
    name: "VĂN PHÒNG GIÁM ĐỐC (BÀ THI)",
    sub: "Chỉ Đạo Phá Rào Tìm Nguồn Gạo & Sợi",
    icon: "🏢",
    actionLabel: "Họp ban giám đốc",
    type: "office",
    themeColor: "#b91c1c",
    accentColor: "#f87171",
  },

  // Phase 3 (1980: Long An & Khảo Sát TW)
  bldg_tw_survey: {
    id: "bldg_tw_survey",
    name: "TRỤ SỞ ĐOÀN KHẢO SÁT TW",
    sub: "Đối Thoại Thực Tiễn Với Lãnh Đạo",
    icon: "📋",
    actionLabel: "Trình bày báo cáo",
    type: "survey",
    themeColor: "#b45309",
    accentColor: "#fbbf24",
  },
  bldg_long_an_gov: {
    id: "bldg_long_an_gov",
    name: "ỦY BAN NHÂN DÂN TỈNH LONG AN",
    sub: "Mô Hình Bù Giá Vào Lương",
    icon: "🏛️",
    actionLabel: "Thảo luận cơ chế giá",
    type: "long_an",
    themeColor: "#b91c1c",
    accentColor: "#f87171",
  },
  bldg_rice_market: {
    id: "bldg_rice_market",
    name: "CHỢ ĐẦU MỐI LÚA GẠO TÂN AN",
    sub: "Thị Trường & Lưu Thông Tự Do",
    icon: "🏪",
    actionLabel: "Khảo sát giá chợ",
    type: "market",
    themeColor: "#15803d",
    accentColor: "#4ade80",
  },
  bldg_river_port: {
    id: "bldg_river_port",
    name: "BẾN SÔNG VÀM CỎ TÂY",
    sub: "Vận Tải Lương Thực Liên Tỉnh",
    icon: "⚓",
    actionLabel: "Ghe thuyền chở gạo",
    type: "river_port",
    themeColor: "#0284c7",
    accentColor: "#38bdf8",
  },

  // Phase 4 (1981: Hà Nội - Hội Nghị Thể Chế)
  bldg_policy_hall: {
    id: "bldg_policy_hall",
    name: "HỘI TRƯỜNG THỂ CHẾ HÓA 1981",
    sub: "Ban Hành Chỉ Thị 100 & Quyết Định 25-CP",
    icon: "🏛️",
    actionLabel: "Phân bổ chỉ tiêu",
    type: "hall",
    themeColor: "#b91c1c",
    accentColor: "#facc15",
  },
  bldg_planning_committee: {
    id: "bldg_planning_committee",
    name: "ỦY BAN KẾ HOẠCH NHÀ NƯỚC",
    sub: "Cơ Chế Kế Hoạch 3 Phần P1-P2-P3",
    icon: "📊",
    actionLabel: "Phê duyệt kế hoạch",
    type: "committee",
    themeColor: "#0369a1",
    accentColor: "#38bdf8",
  },
  bldg_econ_institute: {
    id: "bldg_econ_institute",
    name: "VIỆN NGHIÊN CỨU QUẢN LÝ KINH TẾ",
    sub: "Đánh Giá Thực Tiễn & Lý Luận Đổi Mới",
    icon: "📑",
    actionLabel: "Nghiên cứu thể chế",
    type: "institute",
    themeColor: "#059669",
    accentColor: "#34d399",
  },
  bldg_monument: {
    id: "bldg_monument",
    name: "TƯỢNG ĐÀI KHỞI SỰ ĐỔI MỚI",
    sub: "Ghi Dấu Bước Chuyển Lịch Sử 1978–1981",
    icon: "🎖️",
    actionLabel: "Chiêm ngưỡng di sản",
    type: "monument",
    themeColor: "#d97706",
    accentColor: "#fde047",
  },

  // Fallbacks
  bldg_reception: { id: "bldg_reception", name: "TRỤ SỞ LÀM VIỆC", sub: "Văn phòng cơ quan", icon: "📋", actionLabel: "Khảo sát", type: "reception", themeColor: "#0284c7", accentColor: "#38bdf8" },
  bldg_server: { id: "bldg_server", name: "KHO LƯU TRỮ", sub: "Tài liệu kinh tế", icon: "💻", actionLabel: "Tra cứu", type: "server", themeColor: "#059669", accentColor: "#34d399" },
  bldg_stamp: { id: "bldg_stamp", name: "CƠ QUAN PHÊ DUYỆT", sub: "Duyệt văn bản", icon: "🏛️", actionLabel: "Đóng dấu", type: "stamp", themeColor: "#b91c1c", accentColor: "#f87171" },
  bldg_inspection: { id: "bldg_inspection", name: "BAN THANH TRA", sub: "Kiểm tra thực địa", icon: "⚖️", actionLabel: "Kiểm tra", type: "inspection", themeColor: "#d97706", accentColor: "#fbbf24" },
  bldg_portal: { id: "bldg_portal", name: "TRUNG TÂM HỘI NGHỊ", sub: "Tổng kết công vụ", icon: "🏛️", actionLabel: "Báo cáo", type: "gate", themeColor: "#0891b2", accentColor: "#22d3ee" },
  bldg_feedback: { id: "bldg_feedback", name: "NHÀ VĂN HÓA", sub: "Ý kiến nhân dân", icon: "🏡", actionLabel: "Đối thoại", type: "feedback", themeColor: "#db2777", accentColor: "#f472b6" },
};

// ----------------------------------------------------
// 4 HISTORICAL PHASE MAP LAYOUTS (1978–1981)
// ----------------------------------------------------
const PHASE_MAPS = {
  phase_1: {
    name: "HỢP TÁC XÃ ĐOÀN XÁ (HẢI PHÒNG - 1978)",
    theme: "rural_coop",
    groundColor: "#1c331a",
    roadColor: "#854d0e",
    laneColor: "#facc15",
    buildings: [
      { id: "bldg_doan_xa", x: 1200, y: 240, w: 580, h: 280, stationX: 1200, stationY: 360, radius: 90 },
      { id: "bldg_rice_field", x: 380, y: 240, w: 420, h: 260, stationX: 380, stationY: 350, radius: 80 },
      { id: "bldg_granary", x: 2020, y: 240, w: 420, h: 260, stationX: 2020, stationY: 350, radius: 80 },
      { id: "bldg_tractor", x: 380, y: 1120, w: 420, h: 260, stationX: 380, stationY: 1000, radius: 80 },
      { id: "bldg_granary", x: 1200, y: 1120, w: 520, h: 260, stationX: 1200, stationY: 1000, radius: 85 },
      { id: "bldg_rice_field", x: 2020, y: 1120, w: 420, h: 260, stationX: 2020, stationY: 1000, radius: 80 },
    ],
  },
  phase_2: {
    name: "XÍ NGHIỆP DỆT THÀNH CÔNG (TP. HỒ CHÍ MINH - 1979)",
    theme: "factory_zone",
    groundColor: "#1e293b",
    roadColor: "#0f172a",
    laneColor: "#38bdf8",
    buildings: [
      { id: "bldg_thanh_cong", x: 1200, y: 240, w: 600, h: 280, stationX: 1200, stationY: 360, radius: 95 },
      { id: "bldg_yarn_warehouse", x: 380, y: 240, w: 420, h: 260, stationX: 380, stationY: 350, radius: 80 },
      { id: "bldg_director_office", x: 2020, y: 240, w: 420, h: 260, stationX: 2020, stationY: 350, radius: 80 },
      { id: "bldg_port", x: 380, y: 1120, w: 420, h: 260, stationX: 380, stationY: 1000, radius: 80 },
      { id: "bldg_yarn_warehouse", x: 1200, y: 1120, w: 520, h: 260, stationX: 1200, stationY: 1000, radius: 85 },
      { id: "bldg_port", x: 2020, y: 1120, w: 420, h: 260, stationX: 2020, stationY: 1000, radius: 80 },
    ],
  },
  phase_3: {
    name: "ĐOÀN KHẢO SÁT TRUNG ƯƠNG & TỈNH LONG AN (1980)",
    theme: "survey_delta",
    groundColor: "#143126",
    roadColor: "#78350f",
    laneColor: "#facc15",
    buildings: [
      { id: "bldg_tw_survey", x: 1200, y: 240, w: 600, h: 280, stationX: 1200, stationY: 360, radius: 95 },
      { id: "bldg_long_an_gov", x: 380, y: 240, w: 420, h: 260, stationX: 380, stationY: 350, radius: 80 },
      { id: "bldg_rice_market", x: 2020, y: 240, w: 420, h: 260, stationX: 2020, stationY: 350, radius: 80 },
      { id: "bldg_river_port", x: 380, y: 1120, w: 420, h: 260, stationX: 380, stationY: 1000, radius: 80 },
      { id: "bldg_rice_market", x: 1200, y: 1120, w: 520, h: 260, stationX: 1200, stationY: 1000, radius: 85 },
      { id: "bldg_long_an_gov", x: 2020, y: 1120, w: 420, h: 260, stationX: 2020, stationY: 1000, radius: 80 },
    ],
  },
  phase_4: {
    name: "HỘI NGHỊ THỂ CHẾ HÓA CHÍNH SÁCH KINH TẾ (HÀ NỘI - 1981)",
    theme: "policy_hall",
    groundColor: "#1c1917",
    roadColor: "#0c0a09",
    laneColor: "#f59e0b",
    buildings: [
      { id: "bldg_policy_hall", x: 1200, y: 240, w: 640, h: 290, stationX: 1200, stationY: 365, radius: 100 },
      { id: "bldg_planning_committee", x: 380, y: 240, w: 420, h: 260, stationX: 380, stationY: 350, radius: 80 },
      { id: "bldg_econ_institute", x: 2020, y: 240, w: 420, h: 260, stationX: 2020, stationY: 350, radius: 80 },
      { id: "bldg_monument", x: 380, y: 1120, w: 420, h: 260, stationX: 380, stationY: 1000, radius: 80 },
      { id: "bldg_planning_committee", x: 1200, y: 1120, w: 520, h: 260, stationX: 1200, stationY: 1000, radius: 85 },
      { id: "bldg_monument", x: 2020, y: 1120, w: 420, h: 260, stationX: 2020, stationY: 1000, radius: 80 },
    ],
  },
};

function getActivePhaseKey() {
  if (state.phase === "phase_2" || state.phase === "situation_2") return "phase_2";
  if (state.phase === "phase_3") return "phase_3";
  if (state.phase === "phase_4" || state.phase === "finished") return "phase_4";
  return "phase_1";
}

function getCurrentPhaseBuildings() {
  const phaseKey = getActivePhaseKey();
  const phaseMap = PHASE_MAPS[phaseKey] || PHASE_MAPS.phase_1;
  return (phaseMap.buildings || []).map((bldg) => {
    const template = BUILDING_TEMPLATES[bldg.id] || BUILDING_TEMPLATES.bldg_doan_xa || {};
    return {
      ...template,
      ...bldg,
    };
  });
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

    // Check if point is inside the bounding box
    if (resolvedX >= bx && resolvedX <= bx + bw && resolvedY >= wallY && resolvedY <= wallY + wallH) {
      const distToLeft = resolvedX - bx;
      const distToRight = (bx + bw) - resolvedX;
      const distToTop = resolvedY - wallY;
      const distToBottom = (wallY + wallH) - resolvedY;
      const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

      if (minDist === distToTop) resolvedY = wallY - radius;
      else if (minDist === distToBottom) resolvedY = wallY + wallH + radius;
      else if (minDist === distToLeft) resolvedX = bx - radius;
      else resolvedX = bx + bw + radius;
      continue;
    }

    const nearestX = Math.max(bx, Math.min(resolvedX, bx + bw));
    const nearestY = Math.max(wallY, Math.min(resolvedY, wallY + wallH));

    const dx = resolvedX - nearestX;
    const dy = resolvedY - nearestY;
    const distSq = dx * dx + dy * dy;

    if (distSq < radius * radius && distSq > 0) {
      const dist = Math.sqrt(distSq);
      const overlap = radius - dist;
      resolvedX += (dx / dist) * overlap;
      resolvedY += (dy / dist) * overlap;
    }
  }

  return {
    x: Math.max(radius, Math.min(MAP_WIDTH - radius, resolvedX)),
    y: Math.max(radius, Math.min(MAP_HEIGHT - radius, resolvedY))
  };
}

// ----------------------------------------------------
// DYNAMIC MULTI-STEP DOSSIER QUEST DEFINITIONS
// ----------------------------------------------------
// DYNAMIC MULTI-STEP DOSSIER & DELIVERY QUEST DEFINITIONS
// ----------------------------------------------------
const DOSSIER_QUEST_CONFIGS = {
  // ==================== PHASE 1 (1978 - HTX ĐOÀN XÁ) ====================
  // 1. Cánh đồng lúa -> Kho thóc giống
  bldg_rice_field: {
    questKey: "bldg_rice_field",
    title: "Vận Chuyển Thóc Vượt Khoán",
    icon: "🌾",
    color: "#ca8a04",
    steps: [
      {
        bldgId: "bldg_granary",
        instruction: "Vận chuyển 10 bao thóc vượt khoán về Kho Lương Thực & Thóc Giống",
        actionText: "Nhập kho thóc",
      },
    ],
  },
  // 2. Trạm máy kéo & nông cụ -> Cánh đồng lúa
  bldg_tractor: {
    questKey: "bldg_tractor",
    title: "Tiếp Tế Xăng Dầu & Nông Cụ",
    icon: "🚜",
    color: "#0284c7",
    steps: [
      {
        bldgId: "bldg_rice_field",
        instruction: "Chuyển dầu máy và lưỡi cày máy kéo ra Cánh Đồng Lúa Đoàn Xá",
        actionText: "Tiếp tế đồng ruộng",
      },
    ],
  },
  // 3. Kho thóc giống -> Trụ sở HTX Đoàn Xá
  bldg_granary: {
    questKey: "bldg_granary",
    title: "Phân Phối Thóc Giống Vụ Đông",
    icon: "🌱",
    color: "#16a34a",
    steps: [
      {
        bldgId: "bldg_doan_xa",
        instruction: "Chuyển giống lúa mới ngắn ngày chịu hạn về Trụ Sở HTX Đoàn Xá",
        actionText: "Giao giống lúa",
      },
    ],
  },

  // ==================== PHASE 2 (1979 - DỆT THÀNH CÔNG) ====================
  // 1. Bến cảng ngoại thương -> Xưởng Dệt Thành Công
  bldg_port: {
    questKey: "bldg_port",
    title: "Cung Ứng Bông Sợi Ngoại Thương",
    icon: "🧵",
    color: "#38bdf8",
    steps: [
      {
        bldgId: "bldg_thanh_cong",
        instruction: "Chuyển kiện sợi dệt nhập khẩu từ bến cảng đến Xí Nghiệp Dệt Thành Công",
        actionText: "Giao sợi cho máy dệt",
      },
    ],
  },
  // 2. Văn phòng giám đốc -> Bến cảng
  bldg_director_office: {
    questKey: "bldg_director_office",
    title: "Hợp Đồng Bảo Lãnh Ngoại Tệ",
    icon: "📑",
    color: "#ef4444",
    steps: [
      {
        bldgId: "bldg_port",
        instruction: "Chuyển hồ sơ ủy thác xuất khẩu vải sang Bến Cảng để nhận bông sợi",
        actionText: "Nộp hồ sơ bảo lãnh",
      },
    ],
  },
  // 3. Kho bông sợi -> Văn phòng giám đốc
  bldg_yarn_warehouse: {
    questKey: "bldg_yarn_warehouse",
    title: "Báo Cáo Sản Lượng Vải Tự Cân Đối",
    icon: "📦",
    color: "#34d399",
    steps: [
      {
        bldgId: "bldg_director_office",
        instruction: "Trình mẫu vải dệt tự cân đối vượt kế hoạch lên Văn Phòng Giám Đốc",
        actionText: "Trình mẫu vải",
      },
    ],
  },

  // ==================== PHASE 3 (1980 - LONG AN & ĐOÀN KHẢO SÁT TW) ====================
  // 1. Chợ gạo Tân An -> Trụ sở Khảo sát TW
  bldg_rice_market: {
    questKey: "bldg_rice_market",
    title: "Báo Cáo Khảo Sát Giá Gạo Thị Trường",
    icon: "📋",
    color: "#f59e0b",
    steps: [
      {
        bldgId: "bldg_tw_survey",
        instruction: "Trình sổ tay khảo sát chênh lệch giá gạo tự do tại Trụ Sở Khảo Sát TW",
        actionText: "Trình nộp báo cáo",
      },
    ],
  },
  // 2. Bến sông Vàm Cỏ Tây -> Chợ gạo Tân An
  bldg_river_port: {
    questKey: "bldg_river_port",
    title: "Vận Tải Gạo Miền Tây Liên Tỉnh",
    icon: "⚓",
    color: "#0284c7",
    steps: [
      {
        bldgId: "bldg_rice_market",
        instruction: "Vận chuyển 50 tấn gạo ghe miền Tây vào Chợ Đầu Mối Tân An",
        actionText: "Bốc dỡ gạo lên chợ",
      },
    ],
  },
  // 3. UBND Tỉnh Long An -> Trụ sở Khảo sát TW
  bldg_long_an_gov: {
    questKey: "bldg_long_an_gov",
    title: "Đề Án 'Bù Giá Vào Lương'",
    icon: "🏛️",
    color: "#f87171",
    steps: [
      {
        bldgId: "bldg_tw_survey",
        instruction: "Chuyển đề án thí điểm bỏ tem phiếu, bù giá vào lương của Long An cho Đoàn TW",
        actionText: "Trình đề án cải cách",
      },
    ],
  },

  // ==================== PHASE 4 (1981 - THỂ CHẾ HÓA CHÍNH SÁCH) ====================
  // 1. Viện Kinh Tế -> Hội Trường Thể Chế
  bldg_econ_institute: {
    questKey: "bldg_econ_institute",
    title: "Luận Cứ Thể Chế Hóa Chỉ Thị 100",
    icon: "📜",
    color: "#34d399",
    steps: [
      {
        bldgId: "bldg_policy_hall",
        instruction: "Trình bản tổng kết kinh nghiệm khoán sản phẩm nông nghiệp vào Hội Trường 1981",
        actionText: "Trình nộp dự thảo",
      },
    ],
  },
  // 2. Ủy ban Kế hoạch Nhà nước -> Viện Kinh Tế
  bldg_planning_committee: {
    questKey: "bldg_planning_committee",
    title: "Hướng Dẫn Kế Hoạch 3 Phần (QĐ 25-CP)",
    icon: "📊",
    color: "#38bdf8",
    steps: [
      {
        bldgId: "bldg_econ_institute",
        instruction: "Chuyển dự thảo phân bổ P1-P2-P3 cho Viện Nghiên Cứu Quản Lý Kinh Tế",
        actionText: "Chuyển dự thảo P1-P3",
      },
    ],
  },
  // 3. Tượng đài khởi sự -> Hội Trường Thể Chế
  bldg_monument: {
    questKey: "bldg_monument",
    title: "Hồ Sơ Di Sản 'Xé Rào' Lịch Sử",
    icon: "🎖️",
    color: "#fde047",
    steps: [
      {
        bldgId: "bldg_policy_hall",
        instruction: "Chuyển tư liệu thực tiễn 1978–1981 vào Hội đồng biểu quyết chính sách",
        actionText: "Nộp sử liệu bước chuyển",
      },
    ],
  },
};

// ----------------------------------------------------
// HISTORICAL CITIZENS IN NEED (NHIỆM VỤ TRỢ GIÚP DÂN THỰC ĐỊA)
// ----------------------------------------------------
const HISTORICAL_CITIZENS_CONFIG = {
  phase_1: [
    {
      id: "citizen_p1_1",
      name: "Bác Ba Nông Dân",
      sub: "Xã viên thiếu thóc giống vụ đông",
      x: 1620,
      y: 840,
      needText: "Xin cấp thóc giống ngắn ngày chịu hạn!",
      resolvedText: "Đã cấp phát 2 bao thóc giống chịu hạn cho gia đình Bác Ba (+8đ)!",
      scoreDelta: 8,
    },
  ],
  phase_2: [
    {
      id: "citizen_p2_1",
      name: "Cô Hoa Thợ Dệt",
      sub: "Công nhân cần gạo trợ cấp gia đình",
      x: 820,
      y: 840,
      needText: "Xin mua gạo theo giá tự cân đối của nhà máy!",
      resolvedText: "Đã trích quỹ phúc lợi xí nghiệp hỗ trợ gia đình Cô Hoa (+8đ)!",
      scoreDelta: 8,
    },
  ],
  phase_3: [
    {
      id: "citizen_p3_1",
      name: "Bác Năm Thương Hồ",
      sub: "Ghe chở 20 tấn gạo bị kẹt tại chốt kiểm soát",
      x: 1620,
      y: 840,
      needText: "Xin giấy giới thiệu khảo sát thực tế để thông quan gạo!",
      resolvedText: "Đã cấp giấy thông hành thực nghiệm lưu thông tự do cho Bác Năm (+8đ)!",
      scoreDelta: 8,
    },
  ],
  phase_4: [
    {
      id: "citizen_p4_1",
      name: "Cán Bộ Hợp Tác Xã Cơ Sở",
      sub: "Cần mẫu biểu hướng dẫn Chỉ thị 100",
      x: 820,
      y: 840,
      needText: "Xin bản mẫu khoán sản phẩm đến nhóm và người lao động!",
      resolvedText: "Đã trao tay tập tài liệu hướng dẫn Chỉ thị 100 (+8đ)!",
      scoreDelta: 8,
    },
  ],
};

const resolvedCitizenIds = new Set();

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
// DEDICATED HISTORICAL THEMATIC COLLECTIBLE SPAWNS (1978–1981)
// ----------------------------------------------------
const movingHazardsState = new Map();


// ----------------------------------------------------
// HISTORICAL NPCS BY PHASE (1978–1981)
// ----------------------------------------------------
const HISTORICAL_NPCS_DATA = {
  phase_1: [
    {
      id: "npc_p1_farmer",
      name: "Bác Hai Lúa",
      sub: "Xã viên HTX Đoàn Xá (1978)",
      icon: "👨‍🌾",
      avatarColor: "#059669",
      gender: "male",
      x: 600,
      y: 520,
      radius: 24,
    },
    {
      id: "npc_p1_secretary",
      name: "Đ/c Đoàn Duy Thành",
      sub: "Bí Thư Thành Ủy Hải Phòng",
      icon: "👨‍💼",
      avatarColor: "#dc2626",
      gender: "male",
      x: 1480,
      y: 520,
      radius: 24,
    },
  ],
  phase_2: [
    {
      id: "npc_p2_ba_thi",
      name: "Bà Ba Thi (Nguyễn Thị Ráo)",
      sub: "Giám Đốc Lương Thực TP.HCM",
      icon: "👩‍💼",
      avatarColor: "#db2777",
      gender: "female",
      x: 600,
      y: 520,
      radius: 24,
    },
    {
      id: "npc_p2_engineer",
      name: "Kỹ Sư Dệt Thành Công",
      sub: "Xí Nghiệp Dệt Thành Công",
      icon: "🏭",
      avatarColor: "#0284c7",
      gender: "male",
      x: 1480,
      y: 520,
      radius: 24,
    },
  ],
  phase_3: [
    {
      id: "npc_p3_chin_can",
      name: "Đ/c Chín Cần",
      sub: "Bí Thư Tỉnh Ủy Long An",
      icon: "🏛️",
      avatarColor: "#b91c1c",
      gender: "male",
      x: 600,
      y: 520,
      radius: 24,
    },
    {
      id: "npc_p3_tw_inspector",
      name: "Trưởng Đoàn Khảo Sát",
      sub: "Đoàn Khảo Sát TW 1980",
      icon: "📋",
      avatarColor: "#d97706",
      gender: "male",
      x: 1480,
      y: 520,
      radius: 24,
    },
  ],
  phase_4: [
    {
      id: "npc_p4_theorist",
      name: "Chuyên Gia Kinh Tế",
      sub: "Viện Nghiên Cứu QLKT 1981",
      icon: "📚",
      avatarColor: "#7c2d12",
      gender: "male",
      x: 600,
      y: 520,
      radius: 24,
    },
    {
      id: "npc_p4_delegate",
      name: "Đại Biểu Hội Nghị",
      sub: "Hội Nghị Thể Chế Hóa 1981",
      icon: "🏛️",
      avatarColor: "#991b1b",
      gender: "male",
      x: 1480,
      y: 520,
      radius: 24,
    },
  ],
};

function getActivePhaseNPCs() {
  const phaseKey = getActivePhaseKey();
  return HISTORICAL_NPCS_DATA[phaseKey] || HISTORICAL_NPCS_DATA.phase_1;
}

function getActivePhaseCitizens() {
  const phaseKey = getActivePhaseKey();
  return HISTORICAL_CITIZENS_CONFIG[phaseKey] || HISTORICAL_CITIZENS_CONFIG.phase_1;
}

const answeredNpcIds = new Set();

const PHASE_COLLECTIBLES_CONFIG = {
  phase_1: [
    // 🌾 LÚA KHOÁN (1978): Nằm dọc các tuyến đường, bờ ruộng và quảng trường Đoàn Xá
    { id: "p1_rice_1", type: "rice_sheaf", label: "Lúa Khoán", x: 380, y: 440, message: "🌾 Gặt lúa vượt khoán cánh đồng Tây! (+2đ)" },
    { id: "p1_rice_2", type: "rice_sheaf", label: "Lúa Khoán", x: 750, y: 440, message: "🌾 Lúa khoán sản phẩm nông hộ! (+2đ)" },
    { id: "p1_rice_3", type: "rice_sheaf", label: "Lúa Khoán", x: 1200, y: 440, message: "🌾 Thửa ruộng mẫu Đoàn Xá Hải Phòng! (+2đ)" },
    { id: "p1_rice_4", type: "rice_sheaf", label: "Lúa Khoán", x: 1650, y: 440, message: "🌾 Thu hoạch lúa mùa vụ mới! (+2đ)" },
    { id: "p1_rice_5", type: "rice_sheaf", label: "Lúa Khoán", x: 2020, y: 440, message: "🌾 Lúa vượt khoán chia về hộ gia đình! (+2đ)" },
    { id: "p1_rice_6", type: "rice_sheaf", label: "Lúa Khoán", x: 750, y: 700, message: "🌾 Đổi mới phương thức quản trị khoán! (+2đ)" },
    { id: "p1_rice_7", type: "rice_sheaf", label: "Lúa Khoán", x: 1650, y: 700, message: "🌾 Thóc giống chất lượng cao! (+2đ)" },
    { id: "p1_rice_8", type: "rice_sheaf", label: "Lúa Khoán", x: 380, y: 920, message: "🌾 Lúa mùa chiêm Hải Phòng! (+2đ)" },
    { id: "p1_rice_9", type: "rice_sheaf", label: "Lúa Khoán", x: 1200, y: 920, message: "🌾 Thóc nộp kho hợp tác xã đủ định ngạch! (+2đ)" },
    { id: "p1_rice_10", type: "rice_sheaf", label: "Lúa Khoán", x: 2020, y: 920, message: "🌾 Thóc dư thừa bán theo giá thỏa thuận! (+2đ)" },
  ],
  phase_2: [
    // 🧵 SỢI BÔNG (1979): Nằm dọc tuyến phố Dệt Thành Công & Bến Cảng
    { id: "p2_yarn_1", type: "yarn_spool", label: "Sợi Bông", x: 380, y: 440, message: "🧵 Nhập kho bông sợi tự cân đối! (+2đ)" },
    { id: "p2_yarn_2", type: "yarn_spool", label: "Sợi Bông", x: 750, y: 440, message: "🧵 Kiểm kê sợi dệt Kế hoạch 3 phần! (+2đ)" },
    { id: "p2_yarn_3", type: "yarn_spool", label: "Sợi Bông", x: 1200, y: 440, message: "🧵 Cung cấp sợi cho máy dệt Thành Công! (+2đ)" },
    { id: "p2_yarn_4", type: "yarn_spool", label: "Sợi Bông", x: 1650, y: 440, message: "🧵 Hoàn tất lô vải xuất khẩu! (+2đ)" },
    { id: "p2_yarn_5", type: "yarn_spool", label: "Sợi Bông", x: 2020, y: 440, message: "🧵 Báo cáo giám đốc: Đã đủ sợi dệt! (+2đ)" },
    { id: "p2_yarn_6", type: "yarn_spool", label: "Sợi Bông", x: 750, y: 700, message: "🧵 Sợi tự cân đối xuất khẩu P2! (+2đ)" },
    { id: "p2_yarn_7", type: "yarn_spool", label: "Sợi Bông", x: 1650, y: 700, message: "🧵 Thoi sợi dệt phụ thêm đời sống P3! (+2đ)" },
    { id: "p2_yarn_8", type: "yarn_spool", label: "Sợi Bông", x: 380, y: 920, message: "🧵 Kiện bông nhập khẩu cập Bến Cảng! (+2đ)" },
    { id: "p2_yarn_9", type: "yarn_spool", label: "Sợi Bông", x: 1200, y: 920, message: "🧵 Tiếp nhận nguyên liệu ngoại thương! (+2đ)" },
    { id: "p2_yarn_10", type: "yarn_spool", label: "Sợi Bông", x: 2020, y: 920, message: "🧵 Container sợi cập cảng TP.HCM! (+2đ)" },
  ],
  phase_3: [
    // 📋 BÁO CÁO TW (1980): Nằm trên 3 Cầu sông Vàm Cỏ & Trục đường Bờ Bắc/Bờ Nam Long An
    { id: "p3_doc_1", type: "survey_doc", label: "Báo Cáo TW", x: 380, y: 460, message: "📋 Khảo sát thực tiễn tại UBND Tỉnh Long An! (+2đ)" },
    { id: "p3_doc_2", type: "survey_doc", label: "Báo Cáo TW", x: 750, y: 460, message: "📋 Ghi nhận ý kiến tiểu thương bãi bỏ trạm gác! (+2đ)" },
    { id: "p3_doc_3", type: "survey_doc", label: "Báo Cáo TW", x: 1200, y: 460, message: "📋 Báo cáo thực tiễn với Đoàn Khảo Sát TW! (+2đ)" },
    { id: "p3_doc_4", type: "survey_doc", label: "Báo Cáo TW", x: 1650, y: 460, message: "📋 Đề án bù giá vào lương tỉnh Long An! (+2đ)" },
    { id: "p3_doc_5", type: "survey_doc", label: "Báo Cáo TW", x: 2020, y: 460, message: "📋 Khảo sát giá gạo tự do tại Chợ Tân An! (+2đ)" },
    { id: "p3_doc_6", type: "survey_doc", label: "Báo Cáo TW", x: 480, y: 700, message: "📋 Dữ liệu lưu thông lương thực trên cầu Tây! (+2đ)" },
    { id: "p3_doc_7", type: "survey_doc", label: "Báo Cáo TW", x: 1200, y: 700, message: "📋 Dữ liệu lưu thông lương thực trên cầu chính! (+2đ)" },
    { id: "p3_doc_8", type: "survey_doc", label: "Báo Cáo TW", x: 1920, y: 700, message: "📋 Dữ liệu lưu thông lương thực trên cầu Đông! (+2đ)" },
    { id: "p3_doc_9", type: "survey_doc", label: "Báo Cáo TW", x: 380, y: 920, message: "📋 Ghe thuyền chở gạo cập bến Vàm Cỏ Tây! (+2đ)" },
    { id: "p3_doc_10", type: "survey_doc", label: "Báo Cáo TW", x: 1200, y: 920, message: "📋 Thu mua lúa gạo theo giá thỏa thuận thực tế! (+2đ)" },
  ],
  phase_4: [
    // 📜 CHỈ THỊ 100 & QUYẾT ĐỊNH 25-CP (1981): Nằm tại các trục đường thể chế
    { id: "p4_res_1", type: "directive_100", label: "Chỉ Thị 100", x: 380, y: 440, message: "📜 Tiếp nhận Dự thảo Đổi mới Quản lý Kinh tế! (+2đ)" },
    { id: "p4_res_2", type: "directive_100", label: "Chỉ Thị 100", x: 750, y: 440, message: "📜 Góp ý lý luận của Viện Nghiên Cứu Quản Lý! (+2đ)" },
    { id: "p4_res_3", type: "directive_100", label: "Chỉ Thị 100", x: 1200, y: 440, message: "📜 Bản thảo Chỉ thị 100 Ban Bí thư 1/1981! (+2đ)" },
    { id: "p4_res_4", type: "directive_100", label: "Chỉ Thị 100", x: 1650, y: 440, message: "📜 Dự thảo Quyết định 25-CP Chính phủ 1/1981! (+2đ)" },
    { id: "p4_res_5", type: "directive_100", label: "Chỉ Thị 100", x: 2020, y: 440, message: "📜 Đề xuất phân bổ Kế hoạch 3 phần P1-P2-P3! (+2đ)" },
    { id: "p4_res_6", type: "directive_100", label: "Chỉ Thị 100", x: 750, y: 700, message: "📜 Kế hoạch chỉ tiêu pháp lệnh Nhà nước P1! (+2đ)" },
    { id: "p4_res_7", type: "directive_100", label: "Chỉ Thị 100", x: 1650, y: 700, message: "📜 Cơ chế tự cân đối kinh doanh tự chủ P2! (+2đ)" },
    { id: "p4_res_8", type: "directive_100", label: "Chỉ Thị 100", x: 380, y: 920, message: "📜 Động lực phát triển sản xuất phụ gia đình P3! (+2đ)" },
    { id: "p4_res_9", type: "directive_100", label: "Chỉ Thị 100", x: 1200, y: 920, message: "📜 Văn kiện Thể chế hóa thành công bước chuyển lịch sử! (+2đ)" },
    { id: "p4_res_10", type: "directive_100", label: "Chỉ Thị 100", x: 2020, y: 920, message: "📜 Xung lực mở đường cho Đổi Mới toàn diện! (+2đ)" },
  ],
};

// ----------------------------------------------------
// ----------------------------------------------------
// DYNAMIC PATROLS, HISTORICAL HAZARDS & FREEZE TRAPS ❄️
// ----------------------------------------------------
const PHASE_HAZARDS_CONFIG = {
  phase_1: [
    { id: "h_p1_pest", type: "pest", label: "Sâu Bệnh Ruộng Lúa", message: "Sâu bệnh hoành hành làm sụt giảm năng suất! (-3đ)", x: 780, y: 700, vx: 80, vy: 35, radius: 22 },
    { id: "h_p1_drought", type: "drought", label: "Luồng Hạn Hán", message: "Hạn hán gay gắt đe dọa mùa màng! (-3đ)", x: 1620, y: 700, vx: -75, vy: -45, radius: 22 },
    { id: "h_p1_freeze", type: "freeze_trap", label: "Bẫy Đóng Băng Quan Liêu", message: "❄️ Bị đóng băng trong cơ chế quan liêu 2.5s! (-3đ)", x: 1200, y: 700, vx: 45, vy: 0, radius: 24 },
  ],
  phase_2: [
    { id: "h_p2_inspect", type: "bureaucracy", label: "Thanh Tra Chỉ Tiêu", message: "Bị thanh tra cơ chế quan liêu giữ lại! (-3đ)", x: 920, y: 680, vx: 90, vy: 0, radius: 24 },
    { id: "h_p2_power", type: "power_out", label: "Sự Cố Mất Điện", message: "Mất điện đột xuất đình đốn máy dệt! (-3đ)", x: 1480, y: 680, vx: -85, vy: 50, radius: 22 },
    { id: "h_p2_freeze", type: "freeze_trap", label: "Bẫy Đóng Băng Phân Bổ", message: "❄️ Bị đóng băng thiếu nguyên liệu sợi 2.5s! (-3đ)", x: 1200, y: 700, vx: -50, vy: 35, radius: 24 },
  ],
  phase_3: [
    { id: "h_p3_chk1", type: "checkpoint", label: "Trạm Gác Ngăn Sông", message: "Trạm gác 'Ngăn sông cấm chợ' chặn đường! (-3đ)", x: 800, y: 460, vx: 90, vy: 0, radius: 24 },
    { id: "h_p3_chk2", type: "checkpoint", label: "Đội Kiểm Soát Gạo", message: "Kiểm soát lưu thông lúa gạo liên tỉnh! (-3đ)", x: 1600, y: 460, vx: -85, vy: 0, radius: 24 },
    { id: "h_p3_freeze", type: "freeze_trap", label: "Bẫy Đóng Băng Ngăn Sông", message: "❄️ Bị đóng băng tại trạm kiểm soát 2.5s! (-3đ)", x: 1200, y: 700, vx: 0, vy: 50, radius: 24 },
  ],
  phase_4: [
    { id: "h_p4_debate", type: "debate", label: "Áp Lực Kế Hoạch Cứng", message: "Áp lực chỉ tiêu pháp lệnh cứng nhắc! (-3đ)", x: 900, y: 700, vx: 75, vy: -45, radius: 24 },
    { id: "h_p4_freeze", type: "freeze_trap", label: "Bẫy Đóng Băng Giáo Điều", message: "❄️ Bị đóng băng tư duy giáo điều 2.5s! (-3đ)", x: 1500, y: 700, vx: -65, vy: 40, radius: 24 },
  ],
};

function isPositionBlockedByBuilding(x, y, padding = 45) {
  const currentBuildings = getCurrentPhaseBuildings();
  for (const bldg of currentBuildings) {
    const minX = bldg.x - bldg.w / 2 - padding;
    const maxX = bldg.x + bldg.w / 2 + padding;
    const minY = bldg.y - bldg.h / 2 - padding;
    const maxY = bldg.y + bldg.h / 2 + padding;
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      return true;
    }
  }
  return false;
}

// ----------------------------------------------------
// DYNAMIC PROCEDURAL MAP-WIDE WALKABLE POSITION GENERATOR
// Continuously shifts and distributes items to prevent any clumping
// ----------------------------------------------------
function getRandomWalkableLocation(phaseKey, minDistance = 55) {
  for (let attempt = 0; attempt < 50; attempt++) {
    let candidateX, candidateY;

    if (phaseKey === "phase_3") {
      // Phase 3: North road, South road, or 3 Bridge Corridors
      const zone = Math.floor(Math.random() * 5);
      if (zone === 0) {
        candidateX = 140 + Math.random() * (MAP_WIDTH - 280);
        candidateY = 390 + Math.random() * 90;
      } else if (zone === 1) {
        candidateX = 140 + Math.random() * (MAP_WIDTH - 280);
        candidateY = 860 + Math.random() * 90;
      } else if (zone === 2) {
        candidateX = 410 + (Math.random() - 0.5) * 60;
        candidateY = 380 + Math.random() * 600;
      } else if (zone === 3) {
        candidateX = 1170 + (Math.random() - 0.5) * 60;
        candidateY = 380 + Math.random() * 600;
      } else {
        candidateX = 1930 + (Math.random() - 0.5) * 60;
        candidateY = 380 + Math.random() * 600;
      }
    } else {
      // Phases 1, 2, 4: Wide array across 6 major zones
      const zone = Math.floor(Math.random() * 6);
      if (zone === 0) {
        // North Road corridor
        candidateX = 140 + Math.random() * (MAP_WIDTH - 280);
        candidateY = 400 + Math.random() * 80;
      } else if (zone === 1) {
        // Central Boulevard
        candidateX = 140 + Math.random() * (MAP_WIDTH - 280);
        candidateY = 640 + Math.random() * 100;
      } else if (zone === 2) {
        // South Road corridor
        candidateX = 140 + Math.random() * (MAP_WIDTH - 280);
        candidateY = 880 + Math.random() * 80;
      } else if (zone === 3) {
        // West Vertical Roads
        const vCols = [380, 760];
        candidateX = vCols[Math.floor(Math.random() * vCols.length)] + (Math.random() - 0.5) * 60;
        candidateY = 380 + Math.random() * 600;
      } else if (zone === 4) {
        // Central Plaza & Square
        candidateX = 960 + Math.random() * 480;
        candidateY = 560 + Math.random() * 260;
      } else {
        // East Vertical Roads
        const vCols = [1640, 2020];
        candidateX = vCols[Math.floor(Math.random() * vCols.length)] + (Math.random() - 0.5) * 60;
        candidateY = 380 + Math.random() * 600;
      }
    }

    candidateX = Math.max(100, Math.min(MAP_WIDTH - 100, candidateX));
    candidateY = Math.max(380, Math.min(MAP_HEIGHT - 100, candidateY));

    // Check collision with solid buildings
    if (isPositionBlockedByBuilding(candidateX, candidateY, 35)) continue;

    // In Phase 3, ensure not in river water outside bridges
    if (phaseKey === "phase_3" && candidateY >= 550 && candidateY <= 790) {
      const onBridge = (candidateX >= 380 && candidateX <= 500) ||
                       (candidateX >= 1140 && candidateX <= 1260) ||
                       (candidateX >= 1900 && candidateX <= 2020);
      if (!onBridge) continue;
    }

    // Anti-clumping check: verify not too close to any existing active item
    let tooClose = false;
    for (const [, item] of movingHazardsState.entries()) {
      if (state.collectedIds.has(item.id)) continue;
      const d = Math.hypot(candidateX - item.x, candidateY - item.y);
      if (d < minDistance) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) {
      return { x: candidateX, y: candidateY };
    }
  }

  // Fallback safe position with random jitter
  const fallbackX = 200 + Math.random() * (MAP_WIDTH - 400);
  const fallbackY = phaseKey === "phase_3" ? (Math.random() > 0.5 ? 440 : 900) : (440 + Math.random() * 460);
  return { x: fallbackX, y: fallbackY };
}

function spawnExtraThematicItems(count = 5) {
  const phaseKey = getActivePhaseKey();
  const spawnList = PHASE_COLLECTIBLES_CONFIG[phaseKey] || PHASE_COLLECTIBLES_CONFIG.phase_1;
  const sample = spawnList[0] || { type: "rice_sheaf", label: "Tư liệu", message: "+2đ" };

  for (let i = 0; i < count; i++) {
    const extraId = `extra_${phaseKey}_${Date.now()}_${Math.floor(Math.random() * 10000)}_${i}`;
    const loc = getRandomWalkableLocation(phaseKey, 55);

    movingHazardsState.set(extraId, {
      id: extraId,
      type: sample.type,
      label: sample.label,
      message: sample.message,
      kind: "item",
      x: loc.x,
      y: loc.y,
      baseX: loc.x,
      baseY: loc.y,
      vx: 0,
      vy: 0,
      speed: 0,
      radius: 20,
      trailTimer: 0,
    });

    spawnParticles(loc.x, loc.y, "#facc15", 28, 140, "star");
  }

  sfx.pickup();
  spawnFloatingText(state.player.x, state.player.y, `✨ ĐÃ THẢ THÊM ${count} TƯ LIỆU RẢI RÁC TRÊN BẢN ĐỒ!`, "#34d399");
}

function triggerEmergencyCrisis(phaseKey) {
  sfx.gate();
  state.screenShakeTimer = 0.5;
  state.screenShakeIntensity = 6;

  const crisisTitles = {
    phase_1: "⚡ SỰ CỐ 1978: Cứu hạn khẩn cấp ruộng lúa Đoàn Xá trước bão! (+10đ/kiện)",
    phase_2: "⚡ SỰ CỐ 1979: Tàu chở sợi bông cập cảng cần bốc dỡ khẩn cấp! (+10đ/kiện)",
    phase_3: "⚡ SỰ CỐ 1980: Đoàn Khảo Sát TW cần gấp số liệu giá gạo thực tế! (+10đ/kiện)",
    phase_4: "⚡ SỰ CỐ 1981: Hội nghị bắt đầu biểu quyết Chỉ thị 100! (+10đ/kiện)",
  };

  const bannerText = crisisTitles[phaseKey] || "⚡ SỰ CỐ THỰC ĐỊA KHẨN CẤP (+10đ/kiện)";
  spawnFloatingText(state.player.x, state.player.y - 40, bannerText, "#facc15");

  const spawnPoints = [
    { x: 960, y: 680 },
    { x: 1440, y: 680 },
    { x: 720, y: 740 },
    { x: 1680, y: 740 },
  ];

  spawnPoints.forEach((pt, idx) => {
    const cId = `crisis_${phaseKey}_${idx}`;
    movingHazardsState.set(cId, {
      id: cId,
      type: "crisis_pkg",
      label: "Kiện Cứu Trợ",
      message: `⭐ Thu gom Kiện Cứu Trợ Lịch Sử Khẩn Cấp (+10đ)!`,
      kind: "item",
      scoreValue: 10,
      x: pt.x,
      y: pt.y,
      baseX: pt.x,
      baseY: pt.y,
      vx: 0,
      vy: 0,
      speed: 0,
      radius: 24,
      trailTimer: 0,
    });
    spawnParticles(pt.x, pt.y, "#facc15", 35, 140, "star");
  });
}

function initAmbientHazards() {
  const phaseKey = getActivePhaseKey();
  const spawnList = PHASE_COLLECTIBLES_CONFIG[phaseKey] || PHASE_COLLECTIBLES_CONFIG.phase_1;
  const hazardList = PHASE_HAZARDS_CONFIG[phaseKey] || PHASE_HAZARDS_CONFIG.phase_1;

  for (const item of spawnList) {
    if (!movingHazardsState.has(item.id) && !state.collectedIds.has(item.id) && !state.resolvedCollisionIds.has(item.id)) {
      movingHazardsState.set(item.id, {
        id: item.id,
        type: item.type,
        label: item.label,
        message: item.message,
        kind: "item",
        x: item.x,
        y: item.y,
        baseX: item.x,
        baseY: item.y,
        vx: 0,
        vy: 0,
        speed: 0,
        radius: 20,
        trailTimer: 0,
      });
    }
  }

  for (const haz of hazardList) {
    if (!movingHazardsState.has(haz.id)) {
      movingHazardsState.set(haz.id, {
        id: haz.id,
        type: haz.type,
        label: haz.label,
        message: haz.message,
        kind: "hazard",
        x: haz.x,
        y: haz.y,
        vx: haz.vx,
        vy: haz.vy,
        speed: Math.hypot(haz.vx, haz.vy),
        radius: haz.radius || 22,
        trailTimer: 0,
        lastHitAt: 0,
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

    if (hazard.speed > 0) {
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
    } else {
      // Thematic Stationary Collectible: gentle floating bob in its historical zone
      if (hazard.baseY) {
        hazard.y = hazard.baseY + Math.sin(state.gameTime * 3 + (hazard.x % 7)) * 4;
      }
    }

    // Sparkling ambient aura particles
    hazard.trailTimer += deltaSeconds;
    if (hazard.trailTimer >= 0.25) {
      hazard.trailTimer = 0;
      const auraColor = (
        hazard.type === "rice_sheaf" ? "#facc15" :
        hazard.type === "yarn_spool" ? "#38bdf8" :
        hazard.type === "survey_doc" ? "#fbbf24" :
        hazard.type === "directive_100" ? "#f87171" : "#fef08a"
      );
      particles.push({
        x: hazard.x + (Math.random() - 0.5) * 12,
        y: hazard.y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 15 - 5,
        color: auraColor,
        shape: "star",
        size: Math.random() * 2.5 + 1.5,
        life: 0,
        maxLife: 0.5,
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
    speedMultiplier: 1.0,
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
  comboCount: 0,
  lastItemCollectedAt: 0,
  sprintTimer: 0,
  crisisTriggeredForPhase: new Set(),
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
    const distBox = distanceToBuilding(state.player.x, state.player.y, bldg);
    const distStation = Math.hypot(state.player.x - bldg.stationX, state.player.y - bldg.stationY);
    const effectiveDist = Math.min(distBox, distStation);

    if (effectiveDist <= 110 && effectiveDist < minDist) {
      minDist = effectiveDist;
      closest = bldg;
    }
  }
  state.nearbyBuilding = closest;

  // Auto-progress delivery quest step when walking up to the building facade
  if (state.activeQuest && closest) {
    const currentStep = state.activeQuest.steps[state.activeQuest.currentStepIndex];
    if (currentStep && (currentStep.bldgId === closest.id || currentStep.bldgId === closest.type || closest.id.includes(currentStep.bldgId))) {
      const isTouching = minDist <= 95;
      if (isTouching && !state.activeQuest.justTriggered) {
        state.activeQuest.justTriggered = true;
        executePlayerAction();
        setTimeout(() => {
          if (state.activeQuest) state.activeQuest.justTriggered = false;
        }, 1200);
      }
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

  
  // Check Nearby Historical NPC Dialogue:
  const activeNpcs = getActivePhaseNPCs();
  for (const npc of activeNpcs) {
    const dist = Math.hypot(state.player.x - npc.x, state.player.y - npc.y);
    if (dist <= 65) {
      sfx.npc();
      spawnParticles(npc.x, npc.y, npc.avatarColor, 20, 90, "star");
      postToParent({
        type: "NPC_DIALOGUE_OPEN",
        npcId: npc.id,
        phaseId: state.phase,
      });
      return;
    }
  }

  // Check Nearby Citizen in Need (Nhiệm vụ Trợ giúp dân / Xã viên):
  const activeCitizens = getActivePhaseCitizens();
  for (const citizen of activeCitizens) {
    if (resolvedCitizenIds.has(citizen.id)) continue;
    const dist = Math.hypot(state.player.x - citizen.x, state.player.y - citizen.y);
    if (dist <= 75) {
      resolvedCitizenIds.add(citizen.id);
      sfx.stepComplete();
      spawnParticles(citizen.x, citizen.y, "#ec4899", 30, 120, "star");
      spawnFloatingText(
        state.player.x,
        state.player.y,
        `💖 ${citizen.resolvedText || "Đã trợ giúp nhân dân (+8đ)!"}`,
        "#f472b6"
      );
      postToParent({
        type: "POLICY_ITEM_COLLECT",
        itemId: citizen.id,
        itemType: "citizen_aid",
        scoreDelta: citizen.scoreDelta || 8,
        message: `💖 ${citizen.resolvedText || `Đã trợ giúp ${citizen.name} (+8đ)!`}`,
      });
      return;
    }
  }

  // 1. POLICY SIMULATION STATION INTERACTION:
  if (state.policyStation && !state.taskCompletedByPlayer) {
    const stX = toWorldX(state.policyStation.x);
    const stY = toWorldY(state.policyStation.y);
    const dist = Math.hypot(state.player.x - stX, state.player.y - stY);
    if (dist <= (state.policyStation.radius || 40) + state.player.radius + 35) {
      state.taskCompletedByPlayer = true;
      postToParent({
        type: "POLICY_STATION_INTERACT",
        phaseId: state.policyStation.phaseId || state.phase,
        stationId: state.policyStation.id,
      });
      return;
    }
  }

  // A. IF CURRENTLY ENGAGED IN A MULTI-STEP DOSSIER QUEST:
  if (state.activeQuest) {
    const quest = state.activeQuest;
    const currentStep = quest.steps[quest.currentStepIndex];
    const currentBuildings = getCurrentPhaseBuildings();
    const matchingTargets = currentBuildings.filter(b => b.id === currentStep.bldgId || b.type === currentStep.bldgId || b.id.includes(currentStep.bldgId));
    const targetBldg = matchingTargets[0] || getBuildingById(currentStep.bldgId);

    let isAtTarget = false;
    let reachedBldg = null;
    for (const b of (matchingTargets.length > 0 ? matchingTargets : [targetBldg])) {
      if (!b) continue;
      const stX = b.stationX !== undefined ? b.stationX : b.x;
      const stY = b.stationY !== undefined ? b.stationY : b.y;
      const distStation = Math.hypot(state.player.x - stX, state.player.y - stY);
      const distBox = distanceToBuilding(state.player.x, state.player.y, b);
      if (distStation <= 160 || distBox <= 120 || (state.nearbyBuilding && (state.nearbyBuilding.id === b.id || state.nearbyBuilding.type === b.type))) {
        isAtTarget = true;
        reachedBldg = b;
        break;
      }
    }

    if (isAtTarget) {
      const isFinalStep = quest.currentStepIndex >= quest.totalSteps - 1;

      if (!isFinalStep) {
        quest.currentStepIndex += 1;
        const nextStep = quest.steps[quest.currentStepIndex];
        const nextBldg = getBuildingById(nextStep.bldgId) || currentBuildings.find(b => b.id === nextStep.bldgId);

        sfx.stepComplete();
        spawnParticles(state.player.x, state.player.y, quest.color || "#38bdf8", 20, 95, "star");
        spawnFloatingText(
          state.player.x,
          state.player.y,
          `✓ Xong bước ${quest.currentStepIndex}/${quest.totalSteps}! Tiếp tục đến ${nextBldg ? nextBldg.name : "Điểm tiếp theo"}!`,
          "#38bdf8"
        );
      } else {
        sfx.stamp();
        spawnParticles(state.player.x, state.player.y, "#f59e0b", 35, 140, "star");
        spawnFloatingText(
          state.player.x,
          state.player.y,
          `★ HOÀN THÀNH: ${quest.title}! (+5 Điểm)`,
          "#4ade80"
        );

        postToParent({
          type: "POLICY_ITEM_COLLECT",
          itemId: quest.entityId,
          itemType: "delivery_quest",
          scoreDelta: 5,
          message: `★ Hoàn thành vận chuyển: ${quest.title}! (+5đ)`,
        });
        state.activeQuest = null;
      }
      return;
    } else {
      spawnFloatingText(
        state.player.x,
        state.player.y,
        `Đích đến: ${targetBldg ? targetBldg.name : "Nơi nhận hàng"}! (Theo dõi mũi tên vàng)`,
        "#fbbf24"
      );
      return;
    }
  }

  // B. IF NEAR A BUILDING:
  if (state.nearbyBuilding) {
    const bldg = state.nearbyBuilding;

    // Check if this building can grant a delivery quest (Điểm A -> Điểm B)
    if (!state.activeQuest && DOSSIER_QUEST_CONFIGS[bldg.id]) {
      const qCfg = DOSSIER_QUEST_CONFIGS[bldg.id];
      state.activeQuest = {
        entityId: bldg.id,
        typeKey: qCfg.questKey,
        title: qCfg.title,
        icon: qCfg.icon,
        color: qCfg.color,
        currentStepIndex: 0,
        totalSteps: qCfg.steps.length,
        steps: qCfg.steps,
      };

      const destBldg = getBuildingById(qCfg.steps[0].bldgId);
      sfx.pickup();
      spawnParticles(state.player.x, state.player.y, qCfg.color, 24, 100, "star");
      spawnFloatingText(
        state.player.x,
        state.player.y,
        `${qCfg.icon} NHẬN NHIỆM VỤ: ${qCfg.title}! Giao đến: ${destBldg.name}`,
        "#facc15"
      );
      return;
    }

    sfx.stamp();
    spawnParticles(bldg.stationX, bldg.stationY, bldg.accentColor || "#facc15", 18, 90, "star");
    spawnFloatingText(state.player.x, state.player.y, `✓ ${bldg.name}: Đã ghi nhận thông tin!`, bldg.accentColor || "#38bdf8");
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

function handleEntityInteraction(entity, now = performance.now(), mHazardRef = null) {
  if (!entity || !entity.id) return;
  if (state.collectedIds.has(entity.id) || state.resolvedCollisionIds.has(entity.id)) return;
  if (isEntityResolvedForPlayer(entity, options.playerId)) return;

  const radius = Number.isFinite(entity.radius) ? entity.radius : 20;
  if (!circlesOverlap(state.player, { ...entity, radius })) return;

  // 1. IF DYNAMIC HAZARD / PATROL GUARD / FREEZE TRAP:
  if (entity.kind === "hazard") {
    const targetRef = mHazardRef || entity;
    if (targetRef.lastHitAt && now - targetRef.lastHitAt < 2000) return;
    targetRef.lastHitAt = now;
    if (entity !== targetRef) entity.lastHitAt = now;

    const isFreezeTrap = entity.type === "freeze_trap" || entity.type === "ice_trap" || (entity.label && entity.label.includes("Đóng Băng"));
    if (isFreezeTrap) {
      state.freezeTimer = 2.5;
    }

    sfx.hazard();
    state.screenShakeTimer = 0.35;
    state.screenShakeIntensity = 7;
    state.comboCount = 0;
    state.sprintTimer = 0;
    state.player.speedMultiplier = 0.6;
    setTimeout(() => {
      if (state.player && state.freezeTimer <= 0) state.player.speedMultiplier = 1.0;
    }, 1800);

    const particleColor = isFreezeTrap ? "#38bdf8" : "#ef4444";
    spawnParticles(entity.x, entity.y, particleColor, 30, 130, "star");
    const warnMsg = isFreezeTrap
      ? `❄️ BỊ ĐÓNG BĂNG 2.5s! (-3đ)`
      : (entity.message || `⚠️ ${entity.label || "Rủi ro tuần tra"} (-3đ)`);
    spawnFloatingText(state.player.x, state.player.y, warnMsg, particleColor);

    postToParent({
      type: "POLICY_ITEM_COLLECT",
      itemId: entity.id,
      itemType: isFreezeTrap ? "freeze_penalty" : "hazard_penalty",
      scoreDelta: -3,
      message: warnMsg,
    });
    return;
  }

  // 2. COLLECT HISTORICAL ITEM / CRISIS ITEM WITH COMBO & SPRINT SYSTEM:
  state.collectedIds.add(entity.id);
  state.resolvedCollisionIds.add(entity.id);
  movingHazardsState.delete(entity.id);

  // Combo Streak Mechanics
  if (now - (state.lastItemCollectedAt || 0) < 4500) {
    state.comboCount = (state.comboCount || 0) + 1;
  } else {
    state.comboCount = 1;
  }
  state.lastItemCollectedAt = now;

  let baseDelta = entity.scoreValue || 2;
  const isCrisis = entity.type === "crisis_pkg" || entity.type === "crisis_item";

  if (isCrisis) {
    baseDelta = 10;
    sfx.stepComplete();
    state.screenShakeTimer = 0.25;
    state.screenShakeIntensity = 4;
  } else if (state.comboCount >= 3) {
    state.sprintTimer = 6.0;
    state.player.speedMultiplier = 1.35;
    sfx.stepComplete();
    spawnParticles(state.player.x, state.player.y, "#f59e0b", 30, 130, "star");
    spawnFloatingText(
      state.player.x,
      state.player.y - 22,
      `🔥 COMBO x${state.comboCount}! TĂNG TỐC ĐỔI MỚI (+${baseDelta * 2}đ)!`,
      "#facc15"
    );
    baseDelta *= 2;
  } else {
    sfx.pickup();
  }

  const itemType = entity.type || "rice_sheaf";
  const particleColor = (
    isCrisis ? "#facc15" :
    itemType === "rice_sheaf" ? "#facc15" :
    itemType === "yarn_spool" ? "#38bdf8" :
    itemType === "survey_doc" ? "#fbbf24" :
    itemType === "directive_100" ? "#ef4444" : "#4ade80"
  );
  spawnParticles(entity.x, entity.y, particleColor, isCrisis ? 35 : 24, isCrisis ? 140 : 110, "star");

  const msg = entity.message || `✓ Thu thập ${entity.label || "Tư liệu"} (+${baseDelta}đ)`;
  spawnFloatingText(state.player.x, state.player.y, msg, particleColor);

  postToParent({
    type: "POLICY_ITEM_COLLECT",
    itemId: entity.id,
    itemType: itemType,
    scoreDelta: baseDelta,
    message: msg,
  });
}

function checkCollisions(now) {
  // 1. Static Entities from snapshot
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

  // 2. Dynamic Moving Hazards & Collectible Items
  for (const [id, mHazard] of movingHazardsState.entries()) {
    if (state.collectedIds.has(id) || state.resolvedCollisionIds.has(id)) {
      movingHazardsState.delete(id);
      continue;
    }
    const snapHazard = state.snapshot.hazards?.[id] || state.snapshot.traps?.[id];
    const isCollectible = mHazard.kind === "item" ||
      mHazard.type === "rice_sheaf" ||
      mHazard.type === "yarn_spool" ||
      mHazard.type === "survey_doc" ||
      mHazard.type === "directive_100" ||
      mHazard.type === "crisis_pkg";

    const dynamicEntity = {
      ...(snapHazard || {}),
      id,
      type: mHazard.type || snapHazard?.type || "envelope",
      label: mHazard.label || snapHazard?.label || (isCollectible ? "Tư liệu" : "Rủi ro tuần tra"),
      message: mHazard.message || snapHazard?.message,
      kind: isCollectible ? "item" : (mHazard.kind || "hazard"),
      scoreValue: mHazard.scoreValue || (mHazard.type === "crisis_pkg" ? 10 : 2),
      x: mHazard.x,
      y: mHazard.y,
      radius: mHazard.radius || 20,
      lastHitAt: mHazard.lastHitAt,
    };
    handleEntityInteraction(dynamicEntity, now, mHazard);
  }
}

// ----------------------------------------------------
// 3 RICH, DISTINCT STANDALONE PHASE MAPS
// ----------------------------------------------------

function drawCityGround() {
  const time = state.gameTime;
  const phaseKey = getActivePhaseKey();

  if (phaseKey === "phase_1") {
    drawPhase1RuralMap(time);
  } else if (phaseKey === "phase_2") {
    drawPhase2FactoryMap(time);
  } else if (phaseKey === "phase_3") {
    drawPhase3SurveyMap(time);
  } else {
    drawPhase4PolicyHallMap(time);
  }
}

// ----------------------------------------------------
// MAP 1: NÔNG THÔN HẢI PHÒNG & HTX ĐOÀN XÁ (PHASE 1 - 1978)
// ----------------------------------------------------
function drawPhase1RuralMap(time) {
  // 1. Lush Green Earth Ground
  context.fillStyle = "#1e3a1e";
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // 2. Golden Rice Paddy Plots with Animated Breezes
  const plots = [
    { x: 80, y: 80, w: 260, h: 480 },
    { x: 520, y: 80, w: 580, h: 480 },
    { x: 1300, y: 80, w: 580, h: 480 },
    { x: 2060, y: 80, w: 260, h: 480 },
    { x: 80, y: 780, w: 260, h: 490 },
    { x: 520, y: 780, w: 580, h: 490 },
    { x: 1300, y: 780, w: 580, h: 490 },
    { x: 2060, y: 780, w: 260, h: 490 },
  ];

  for (const plot of plots) {
    context.fillStyle = "#3a2512";
    context.fillRect(plot.x - 6, plot.y - 6, plot.w + 12, plot.h + 12);
    context.fillStyle = "#855a10";
    context.fillRect(plot.x, plot.y, plot.w, plot.h);

    context.strokeStyle = "#ca8a04";
    context.lineWidth = 1.5;
    const wave = Math.sin(time * 3 + plot.x * 0.01) * 3;
    for (let rx = plot.x + 14; rx < plot.x + plot.w; rx += 28) {
      for (let ry = plot.y + 16; ry < plot.y + plot.h; ry += 32) {
        context.beginPath();
        context.moveTo(rx, ry);
        context.lineTo(rx + wave, ry - 10);
        context.stroke();
      }
    }
  }

  // 3. Earthen Village Roads
  context.fillStyle = "#78350f";
  context.fillRect(0, 580, MAP_WIDTH, 180);
  context.fillRect(360, 0, 140, MAP_HEIGHT);
  context.fillRect(1130, 0, 140, MAP_HEIGHT);
  context.fillRect(1900, 0, 140, MAP_HEIGHT);

  // Red Clay Brick Center Pathway
  context.fillStyle = "#b45309";
  context.fillRect(0, 650, MAP_WIDTH, 40);
  context.fillRect(410, 0, 40, MAP_HEIGHT);
  context.fillRect(1180, 0, 40, MAP_HEIGHT);
  context.fillRect(1950, 0, 40, MAP_HEIGHT);

  // 4. Irrigation Water Canal (Mương Thủy Lợi)
  context.fillStyle = "#0284c7";
  context.fillRect(0, 560, MAP_WIDTH, 20);
  context.fillRect(0, 760, MAP_WIDTH, 20);
  context.fillStyle = "#38bdf8";
  for (let wx = 0; wx < MAP_WIDTH; wx += 90) {
    const ripX = (wx + time * 40) % MAP_WIDTH;
    context.fillRect(ripX, 568, 30, 4);
    context.fillRect(ripX + 45, 768, 30, 4);
  }

  // 5. Rustic Trees
  drawPixelTree(200, 500, "oak", time);
  drawPixelTree(1200, 500, "oak", time);
  drawPixelTree(2200, 500, "oak", time);
  drawPixelTree(200, 850, "oak", time);
  drawPixelTree(1200, 850, "oak", time);
  drawPixelTree(2200, 850, "oak", time);
}

// ----------------------------------------------------
// MAP 2: XÍ NGHIỆP DỆT THÀNH CÔNG (PHASE 2 - 1979)
// ----------------------------------------------------
function drawPhase2FactoryMap(time) {
  // 1. Industrial Slate Factory Ground
  context.fillStyle = "#1e293b";
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // 2. Main Transport Boulevards & Corridors
  context.fillStyle = "#0f172a";
  context.fillRect(0, 580, MAP_WIDTH, 180);
  context.fillRect(360, 0, 150, MAP_HEIGHT);
  context.fillRect(1125, 0, 150, MAP_HEIGHT);
  context.fillRect(1890, 0, 150, MAP_HEIGHT);

  // Yellow/Black Industrial Safety Stripes
  context.strokeStyle = "#eab308";
  context.lineWidth = 4;
  context.setLineDash([20, 20]);
  context.beginPath();
  context.moveTo(0, 670); context.lineTo(MAP_WIDTH, 670);
  context.moveTo(435, 0); context.lineTo(435, MAP_HEIGHT);
  context.moveTo(1200, 0); context.lineTo(1200, MAP_HEIGHT);
  context.moveTo(1965, 0); context.lineTo(1965, MAP_HEIGHT);
  context.stroke();
  context.setLineDash([]);

  // 3. Freight Rail Line for Raw Material Transport
  context.fillStyle = "#475569";
  context.fillRect(0, 770, MAP_WIDTH, 16);
  context.fillStyle = "#78350f";
  for (let rx = 0; rx < MAP_WIDTH; rx += 36) {
    context.fillRect(rx, 764, 14, 28);
  }
  context.fillStyle = "#94a3b8";
  context.fillRect(0, 768, MAP_WIDTH, 4);
  context.fillRect(0, 784, MAP_WIDTH, 4);

  // 4. Warehouse Yards
  drawSidewalk(60, 60, 280, 500, "standard");
  drawSidewalk(530, 60, 570, 500, "standard");
  drawSidewalk(1300, 60, 570, 500, "standard");
  drawSidewalk(2060, 60, 280, 500, "standard");

  drawSidewalk(60, 800, 280, 500, "standard");
  drawSidewalk(530, 800, 570, 500, "standard");
  drawSidewalk(1300, 800, 570, 500, "standard");
  drawSidewalk(2060, 800, 280, 500, "standard");

  const lamps = [
    { x: 120, y: 550 }, { x: 480, y: 550 }, { x: 1240, y: 550 }, { x: 2000, y: 550 },
    { x: 120, y: 810 }, { x: 480, y: 810 }, { x: 1240, y: 810 }, { x: 2000, y: 810 },
  ];
  for (const lp of lamps) drawStreetLamp(lp.x, lp.y, time);
}

// ----------------------------------------------------
// MAP 3: ĐỒNG BẰNG LONG AN & KHẢO SÁT TW (PHASE 3 - 1980)
// ----------------------------------------------------
function drawPhase3SurveyMap(time) {
  // 1. Delta Soil & Greenery Ground
  context.fillStyle = "#143d2b";
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // 2. Vàm Cỏ River Channel (Sông Vàm Cỏ Tây)
  context.fillStyle = "#0369a1";
  context.fillRect(0, 560, MAP_WIDTH, 220);
  context.fillStyle = "#38bdf8";
  for (let wx = 0; wx < MAP_WIDTH; wx += 80) {
    const curX = (wx + time * 35) % MAP_WIDTH;
    context.fillRect(curX, 610, 45, 5);
    context.fillRect(curX + 30, 680, 45, 5);
    context.fillRect(curX + 60, 730, 35, 4);
  }

  // 3. Wooden Bridges & River Docks
  const bridges = [390, 1150, 1910];
  for (const bx of bridges) {
    context.fillStyle = "#78350f";
    context.fillRect(bx, 550, 100, 240);
    context.fillStyle = "#92400e";
    for (let by = 550; by < 790; by += 16) {
      context.fillRect(bx, by, 100, 2);
    }
    context.fillStyle = "#facc15";
    context.fillRect(bx, 550, 6, 240);
    context.fillRect(bx + 94, 550, 6, 240);
  }

  // 4. Sandy Delta Roads
  context.fillStyle = "#854d0e";
  context.fillRect(0, 360, MAP_WIDTH, 140);
  context.fillRect(0, 840, MAP_WIDTH, 140);
  context.fillRect(390, 0, 100, MAP_HEIGHT);
  context.fillRect(1150, 0, 100, MAP_HEIGHT);
  context.fillRect(1910, 0, 100, MAP_HEIGHT);

  drawPixelTree(200, 320, "palm", time);
  drawPixelTree(1000, 320, "palm", time);
  drawPixelTree(1800, 320, "palm", time);
  drawPixelTree(200, 960, "palm", time);
  drawPixelTree(1000, 960, "palm", time);
  drawPixelTree(1800, 960, "palm", time);
}

// ----------------------------------------------------
// MAP 4: HỘI TRƯỜNG THỂ CHẾ HÓA 1981 (PHASE 4 - 1981)
// ----------------------------------------------------
function drawPhase4PolicyHallMap(time) {
  // 1. Dark Imperial Marble Ground
  context.fillStyle = "#18181b";
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // 2. Grand Central Ceremonial Carpet (Red & Gold Trim - Clean Elegance)
  context.fillStyle = "#7f1d1d";
  context.fillRect(980, 0, 440, MAP_HEIGHT);
  context.fillStyle = "#f59e0b";
  context.fillRect(980, 0, 10, MAP_HEIGHT);
  context.fillRect(1410, 0, 10, MAP_HEIGHT);
  context.fillStyle = "rgba(245, 158, 11, 0.35)";
  context.fillRect(1000, 0, 4, MAP_HEIGHT);
  context.fillRect(1396, 0, 4, MAP_HEIGHT);

  // 3. Polished Marble Boulevards
  context.fillStyle = "#27272a";
  context.fillRect(0, 580, MAP_WIDTH, 180);
  context.fillRect(360, 0, 140, MAP_HEIGHT);
  context.fillRect(1900, 0, 140, MAP_HEIGHT);

  context.strokeStyle = "#facc15";
  context.lineWidth = 2.5;
  context.setLineDash([28, 18]);
  context.beginPath();
  context.moveTo(0, 670); context.lineTo(980, 670);
  context.moveTo(1420, 670); context.lineTo(MAP_WIDTH, 670);
  context.stroke();
  context.setLineDash([]);

  // 4. White Marble Colonnade Sidewalks
  drawSidewalk(60, 60, 280, 500, "marble");
  drawSidewalk(520, 60, 440, 500, "marble");
  drawSidewalk(1440, 60, 440, 500, "marble");
  drawSidewalk(2060, 60, 280, 500, "marble");

  drawSidewalk(60, 780, 280, 520, "marble");
  drawSidewalk(520, 780, 440, 520, "marble");
  drawSidewalk(1440, 780, 440, 520, "marble");
  drawSidewalk(2060, 780, 280, 520, "marble");
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
    context.font = "bold 11px 'Segoe UI', 'Inter', system-ui, sans-serif";
    context.fillText("MỤC TIÊU HIỆN TẠI", bldg.stationX, pinY - 18);
  }

  // Building Ground Shadow
  context.fillStyle = "rgba(0, 0, 0, 0.55)";
  context.fillRect(bx + 14, by + 18, bldg.w, bldg.h);

  switch (bldg.id) {
    // Phase 1 (1978: Hải Phòng - Đoàn Xá)
    case "bldg_doan_xa":
      drawDoanXaBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_rice_field":
      drawRiceFieldHutBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_granary":
      drawGranaryBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_tractor":
      drawTractorStationBuilding(bx, by, bldg, time, isTarget);
      break;

    // Phase 2 (1979: TP.HCM - Dệt Thành Công)
    case "bldg_thanh_cong":
      drawThanhCongBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_yarn_warehouse":
      drawYarnWarehouseBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_port":
      drawPortBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_director_office":
      drawDirectorOfficeBuilding(bx, by, bldg, time, isTarget);
      break;

    // Phase 3 (1980: Long An & Khảo Sát TW)
    case "bldg_tw_survey":
      drawTwSurveyBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_long_an_gov":
      drawLongAnGovBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_rice_market":
      drawRiceMarketBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_river_port":
      drawRiverPortBuilding(bx, by, bldg, time, isTarget);
      break;

    // Phase 4 (1981: Hà Nội - Hội Nghị Thể Chế)
    case "bldg_policy_hall":
      drawPolicyHallBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_committee":
      drawCommitteeBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_institute":
      drawInstituteBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_monument":
      drawMonumentBuilding(bx, by, bldg, time, isTarget);
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
  context.font = "bold 12.5px 'Segoe UI', 'Inter', system-ui, sans-serif";
  context.textAlign = "center";
  context.fillText(bldg.name, bldg.x, sy + 16);

  context.fillStyle = isTarget ? "#fef08a" : bldg.accentColor;
  context.font = "11px 'Segoe UI', 'Inter', system-ui, sans-serif";
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


// ----------------------------------------------------
// 16 DISTINCT HISTORICAL ARCHITECTURAL BUILDING RENDERERS
// ----------------------------------------------------

// 1. HTX Nông nghiệp Đoàn Xá (Mái ngói đỏ rêu, tường vàng đất nung, cờ búa liềm)
function drawDoanXaBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#ca8a04";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#16a34a";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái ngói đỏ rêu phong
  context.fillStyle = "#b91c1c";
  context.beginPath();
  context.moveTo(bx - 14, by + 18);
  context.lineTo(bx + bldg.w / 2, by - 28);
  context.lineTo(bx + bldg.w + 14, by + 18);
  context.closePath();
  context.fill();
  context.strokeStyle = "#854d0e";
  context.lineWidth = 2;
  context.stroke();

  // Cờ đỏ búa liềm trung tâm
  context.fillStyle = "#dc2626";
  context.fillRect(bx + bldg.w / 2 - 16, by - 48, 32, 20);
  context.fillStyle = "#facc15";
  context.font = "bold 11px sans-serif";
  context.textAlign = "center";
  context.fillText("☭", bx + bldg.w / 2, by - 34);

  // Cửa sổ gỗ
  const cols = 6;
  for (let c = 0; c < cols; c++) {
    const wx = bx + 28 + c * ((bldg.w - 56) / cols);
    context.fillStyle = "#78350f";
    context.fillRect(wx, by + 46, 26, 20);
    context.fillStyle = "#fef08a";
    context.fillRect(wx + 3, by + 49, 20, 14);
  }

  // Cổng chính
  const ex = bldg.stationX - 55;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#451a03";
  context.fillRect(ex, ey, 110, 40);
  context.fillStyle = "#facc15";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🌾 HTX ĐOÀN XÁ", bldg.stationX, ey - 6);
}

// 2. Chòi canh lúa & Nông hộ (Mái lá cọ vàng, cột tre, đống rơm)
function drawRiceFieldHutBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#78350f";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#eab308";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái lá cọ vàng óng
  context.fillStyle = "#d97706";
  context.beginPath();
  context.moveTo(bx - 12, by + 22);
  context.lineTo(bx + bldg.w / 2, by - 22);
  context.lineTo(bx + bldg.w + 12, by + 22);
  context.closePath();
  context.fill();
  context.fillStyle = "#fef08a";
  for (let i = 0; i < 8; i++) {
    context.fillRect(bx + 10 + i * (bldg.w / 9), by - 12 + (i % 2) * 4, 12, 18);
  }

  // Đống rơm vàng hai bên
  context.fillStyle = "#ca8a04";
  context.beginPath();
  context.arc(bx + 30, by + bldg.h - 40, 22, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(bx + bldg.w - 30, by + bldg.h - 40, 22, 0, Math.PI * 2);
  context.fill();

  const ex = bldg.stationX - 50;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#451a03";
  context.fillRect(ex, ey, 100, 40);
  context.fillStyle = "#fde047";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🌾 NÔNG HỘ KHOÁN", bldg.stationX, ey - 6);
}

// 3. Kho Lương Thực & Thóc Giống (Vách gỗ sẫm, mái tôn sóng xám, bao thóc)
function drawGranaryBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#451a03";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#b45309";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái tôn sóng xám
  context.fillStyle = "#475569";
  context.fillRect(bx - 8, by - 14, bldg.w + 16, 26);
  context.fillStyle = "#64748b";
  for (let x = bx; x < bx + bldg.w; x += 16) {
    context.fillRect(x, by - 14, 8, 26);
  }

  // Các bao tải thóc vàng xếp trước hiên
  context.fillStyle = "#ca8a04";
  for (let i = 0; i < 5; i++) {
    context.fillRect(bx + 20 + i * 22, by + bldg.h - 52, 18, 14);
    context.fillRect(bx + 28 + i * 22, by + bldg.h - 64, 16, 12);
  }

  const ex = bldg.stationX - 50;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#292524";
  context.fillRect(ex, ey, 100, 40);
  context.fillStyle = "#facc15";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🧺 KHO THÓC GIỐNG", bldg.stationX, ey - 6);
}

// 4. Trạm Máy Kéo & Nông Cụ (Khung thép xanh lam, gara máy cày, thùng dầu)
function drawTractorStationBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#0f172a";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#0284c7";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái thép vát xéo công nghiệp
  context.fillStyle = "#0369a1";
  context.beginPath();
  context.moveTo(bx - 10, by + 10);
  context.lineTo(bx + bldg.w + 10, by - 18);
  context.lineTo(bx + bldg.w + 10, by + 10);
  context.closePath();
  context.fill();

  // Mô hình máy kéo đỏ trong gara
  context.fillStyle = "#dc2626";
  context.fillRect(bx + 30, by + 40, 44, 28);
  context.fillStyle = "#1e293b";
  context.beginPath();
  context.arc(bx + 42, by + 74, 14, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(bx + 66, by + 74, 10, 0, Math.PI * 2);
  context.fill();

  // Thùng dầu vàng đen
  context.fillStyle = "#eab308";
  context.fillRect(bx + bldg.w - 50, by + 45, 24, 30);
  context.fillStyle = "#000000";
  context.fillRect(bx + bldg.w - 50, by + 57, 24, 6);

  const ex = bldg.stationX - 50;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#0c4a6e";
  context.fillRect(ex, ey, 100, 40);
  context.fillStyle = "#38bdf8";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🚜 TRẠM MÁY KÉO", bldg.stationX, ey - 6);
}

// 5. Xí Nghiệp Dệt Thành Công (Mái răng cưa xanh, ống khói gạch đỏ nhả khói)
function drawThanhCongBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#0c4a6e";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#38bdf8";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái răng cưa 5 chóp
  context.fillStyle = "#0284c7";
  const teeth = 5;
  const toothW = bldg.w / teeth;
  context.beginPath();
  context.moveTo(bx, by);
  for (let i = 0; i < teeth; i++) {
    context.lineTo(bx + i * toothW, by - 22);
    context.lineTo(bx + (i + 1) * toothW, by);
  }
  context.closePath();
  context.fill();

  // Ống khói gạch đỏ nhả khói trắng
  context.fillStyle = "#991b1b";
  context.fillRect(bx + bldg.w - 38, by - 55, 18, 55);
  context.fillStyle = "rgba(255, 255, 255, 0.75)";
  for (let i = 0; i < 3; i++) {
    const puffY = by - 65 - i * 14 + Math.sin(time * 3 + i) * 4;
    const puffX = bx + bldg.w - 29 + Math.cos(time * 2 + i) * 6;
    context.beginPath();
    context.arc(puffX, puffY, 8 + i * 3, 0, Math.PI * 2);
    context.fill();
  }

  // Cửa kính lớn
  const cols = 7;
  for (let c = 0; c < cols; c++) {
    const wx = bx + 24 + c * ((bldg.w - 48) / cols);
    context.fillStyle = "rgba(56, 189, 248, 0.85)";
    context.fillRect(wx, by + 46, 28, 22);
    context.strokeStyle = "#38bdf8";
    context.strokeRect(wx, by + 46, 28, 22);
  }

  const ex = bldg.stationX - 55;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#082f49";
  context.fillRect(ex, ey, 110, 40);
  context.fillStyle = "#38bdf8";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🏭 DỆT THÀNH CÔNG", bldg.stationX, ey - 6);
}

// 6. Kho Bông Sợi Nhập Khẩu (Mái vòm kim loại xanh ngọc, kiện bông trắng)
function drawYarnWarehouseBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#064e3b";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#34d399";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái vòm bán nguyệt xanh ngọc
  context.fillStyle = "#059669";
  context.beginPath();
  context.arc(bx + bldg.w / 2, by + 10, bldg.w / 2, Math.PI, 0);
  context.fill();

  // Kiện bông trắng xếp tầng
  context.fillStyle = "#f8fafc";
  for (let i = 0; i < 4; i++) {
    context.fillRect(bx + 30 + i * 32, by + bldg.h - 60, 26, 18);
    context.fillRect(bx + 44 + i * 32, by + bldg.h - 76, 22, 16);
  }

  const ex = bldg.stationX - 50;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#022c22";
  context.fillRect(ex, ey, 100, 40);
  context.fillStyle = "#6ee7b7";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🧶 KHO BÔNG SỢI", bldg.stationX, ey - 6);
}

// 7. Bến Cảng Xuất Nhập Khẩu (Cần cẩu cam, container xếp chồng 3 màu)
function drawPortBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#1e293b";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#f97316";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Cần cẩu khung thép cam
  context.strokeStyle = "#ea580c";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(bx + 40, by + 40);
  context.lineTo(bx + 60, by - 45);
  context.lineTo(bx + 140, by - 45);
  context.stroke();
  // Dây cáp cẩu
  context.strokeStyle = "#facc15";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(bx + 120, by - 45);
  context.lineTo(bx + 120, by - 15);
  context.stroke();

  // Thùng Container 3 màu
  context.fillStyle = "#0284c7";
  context.fillRect(bx + 160, by + 25, 48, 22);
  context.fillStyle = "#dc2626";
  context.fillRect(bx + 175, by + 50, 48, 22);
  context.fillStyle = "#eab308";
  context.fillRect(bx + bldg.w - 70, by + 35, 48, 22);

  const ex = bldg.stationX - 50;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#0f172a";
  context.fillRect(ex, ey, 100, 40);
  context.fillStyle = "#fb923c";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🚢 BẾN CẢNG XUẤT NHẬP", bldg.stationX, ey - 6);
}

// 8. Văn Phòng Giám Đốc - Bà Thi (Tòa nhà trắng ngọc, ban công navy, giàn hoa)
function drawDirectorOfficeBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#f1f5f9";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#db2777";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái bằng viền xanh navy
  context.fillStyle = "#1e3a8a";
  context.fillRect(bx - 6, by - 14, bldg.w + 12, 22);

  // Ban công tầng 2 với giàn hoa hồng
  context.fillStyle = "#e2e8f0";
  context.fillRect(bx + 20, by + 35, bldg.w - 40, 20);
  context.fillStyle = "#ec4899";
  for (let i = 0; i < 8; i++) {
    context.beginPath();
    context.arc(bx + 30 + i * (bldg.w / 9), by + 32, 5, 0, Math.PI * 2);
    context.fill();
  }

  const ex = bldg.stationX - 55;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#831843";
  context.fillRect(ex, ey, 110, 40);
  context.fillStyle = "#f472b6";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🏢 VP GIÁM ĐỐC", bldg.stationX, ey - 6);
}

// 9. Trụ Sở Đoàn Khảo Sát TW (Vàng hoàng thổ, cột cờ Quốc kỳ ★)
function drawTwSurveyBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#d97706";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#fbbf24";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái ngói đỏ Nam Bộ
  context.fillStyle = "#b45309";
  context.fillRect(bx - 8, by - 12, bldg.w + 16, 22);

  // Cột cờ Quốc kỳ Việt Nam
  context.strokeStyle = "#facc15";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(bldg.x, by - 12);
  context.lineTo(bldg.x, by - 52);
  context.stroke();
  context.fillStyle = "#dc2626";
  context.fillRect(bldg.x, by - 52, 28, 18);
  context.fillStyle = "#facc15";
  context.font = "bold 12px sans-serif";
  context.fillText("★", bldg.x + 14, by - 38);

  const cols = 6;
  for (let c = 0; c < cols; c++) {
    const wx = bx + 28 + c * ((bldg.w - 56) / cols);
    context.fillStyle = "#fef3c7";
    context.fillRect(wx, by + 48, 28, 22);
  }

  const ex = bldg.stationX - 50;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#451a03";
  context.fillRect(ex, ey, 100, 40);
  context.fillStyle = "#facc15";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("📋 KHẢO SÁT TW", bldg.stationX, ey - 6);
}

// 10. UBND Tỉnh Long An (Đỏ nung trang nghiêm, hàng cột vuông trắng)
function drawLongAnGovBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#991b1b";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#ef4444";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Hàng cột vuông bề thế
  const cols = 6;
  for (let c = 0; c < cols; c++) {
    const cx = bx + 24 + c * ((bldg.w - 48) / (cols - 1));
    context.fillStyle = "#f8fafc";
    context.fillRect(cx - 5, by + 18, 10, bldg.h - 55);
  }

  // Quốc huy vàng trên đỉnh
  context.fillStyle = "#facc15";
  context.beginPath();
  context.arc(bldg.x, by - 12, 16, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#dc2626";
  context.font = "bold 14px sans-serif";
  context.fillText("★", bldg.x, by - 7);

  const ex = bldg.stationX - 50;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#450a0a";
  context.fillRect(ex, ey, 100, 40);
  context.fillStyle = "#fca5a5";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🏛️ UBND LONG AN", bldg.stationX, ey - 6);
}

// 11. Chợ Đầu Mối Tân An (Mái ngói rêu, sạp thúng gạo tẻ gạo nếp)
function drawRiceMarketBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#78350f";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#ca8a04";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái bạt che nhiều màu
  for (let i = 0; i < 6; i++) {
    context.fillStyle = i % 2 === 0 ? "#dc2626" : "#2563eb";
    context.fillRect(bx + i * (bldg.w / 6), by - 12, bldg.w / 6, 20);
  }

  // Các thúng gạo tròn
  for (let i = 0; i < 5; i++) {
    context.fillStyle = "#ca8a04";
    context.beginPath();
    context.arc(bx + 30 + i * 36, by + 54, 14, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fef08a";
    context.beginPath();
    context.arc(bx + 30 + i * 36, by + 54, 10, 0, Math.PI * 2);
    context.fill();
  }

  const ex = bldg.stationX - 50;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#451a03";
  context.fillRect(ex, ey, 100, 40);
  context.fillStyle = "#fde047";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🏪 CHỢ LÚA GẠO", bldg.stationX, ey - 6);
}

// 12. Bến Sông Vàm Cỏ Tây (Cầu tàu gỗ vươn dài, ghe chở lúa Nam Bộ)
function drawRiverPortBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#0c4a6e";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#0284c7";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Cầu tàu gỗ vươn ra
  context.fillStyle = "#78350f";
  context.fillRect(bx + 20, by + 20, bldg.w - 40, 24);
  context.fillStyle = "#a16207";
  for (let x = bx + 24; x < bx + bldg.w - 24; x += 14) {
    context.fillRect(x, by + 20, 3, 24);
  }

  // Thuyền ghe Nam Bộ
  context.fillStyle = "#854d0e";
  context.beginPath();
  context.ellipse(bx + bldg.w / 2, by + 66, 42, 14, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#facc15";
  context.fillRect(bx + bldg.w / 2 - 18, by + 58, 36, 12);

  const ex = bldg.stationX - 50;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#082f49";
  context.fillRect(ex, ey, 100, 40);
  context.fillStyle = "#38bdf8";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("⚓ BẾN GHE THUYỀN", bldg.stationX, ey - 6);
}

// 13. Hội Trường Thể Chế Hóa 1981 (Cẩm thạch trắng nguy nga, 8 cột La Mã, Quốc huy sao vàng)
function drawPolicyHallBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#18181b";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#f59e0b";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái tam giác cẩm thạch trắng
  context.fillStyle = "#f8fafc";
  context.beginPath();
  context.moveTo(bx - 12, by + 16);
  context.lineTo(bx + bldg.w / 2, by - 30);
  context.lineTo(bx + bldg.w + 12, by + 16);
  context.closePath();
  context.fill();

  context.fillStyle = "#facc15";
  context.font = "bold 20px sans-serif";
  context.textAlign = "center";
  context.fillText("⭐", bx + bldg.w / 2, by + 2);

  // 8 Cột cẩm thạch
  const cols = 8;
  for (let c = 0; c < cols; c++) {
    const cx = bx + 24 + c * ((bldg.w - 48) / (cols - 1));
    context.fillStyle = "#e2e8f0";
    context.fillRect(cx - 5, by + 20, 10, bldg.h - 55);
  }

  const ex = bldg.stationX - 55;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#991b1b";
  context.fillRect(ex, ey, 110, 40);
  context.fillStyle = "#facc15";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🏛️ HỘI TRƯỜNG 1981", bldg.stationX, ey - 6);
}

// 14. Ủy Ban Kế Hoạch Nhà Nước (Khối vuông bê tông Xô Viết xám đá, bảng P1-P2-P3)
function drawCommitteeBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#334155";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#94a3b8";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Khối kiến trúc Xô Viết đối xứng
  context.fillStyle = "#1e293b";
  context.fillRect(bx + 16, by - 18, bldg.w - 32, 22);

  // Bảng phân bổ P1-P2-P3
  context.fillStyle = "#0f172a";
  context.fillRect(bx + 24, by + 30, bldg.w - 48, 30);
  context.fillStyle = "#38bdf8";
  context.font = "bold 9px monospace";
  context.textAlign = "center";
  context.fillText("KẾ HOẠCH 3 PHẦN: P1 - P2 - P3", bldg.x, by + 48);

  const ex = bldg.stationX - 50;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#0f172a";
  context.fillRect(ex, ey, 100, 40);
  context.fillStyle = "#e2e8f0";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("📊 ỦY BAN KẾ HOẠCH", bldg.stationX, ey - 6);
}

// 15. Viện Nghiên Cứu Quản Lý Kinh Tế (Nâu đồng cổ kính, tháp đồng hồ trung tâm)
function drawInstituteBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#7c2d12";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#f97316";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Tháp đồng hồ
  context.fillStyle = "#9a3412";
  context.fillRect(bldg.x - 22, by - 44, 44, 44);
  context.fillStyle = "#fef3c7";
  context.beginPath();
  context.arc(bldg.x, by - 22, 14, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#7c2d12";
  context.lineWidth = 2;
  context.stroke();

  // Kệ sách nghiên cứu
  const cols = 5;
  for (let c = 0; c < cols; c++) {
    const wx = bx + 24 + c * ((bldg.w - 48) / cols);
    context.fillStyle = "#fed7aa";
    context.fillRect(wx, by + 44, 28, 24);
  }

  const ex = bldg.stationX - 50;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#431407";
  context.fillRect(ex, ey, 100, 40);
  context.fillStyle = "#fdba74";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("📚 VIỆN NGHIÊN CỨU", bldg.stationX, ey - 6);
}

// 16. Quảng Trường & Tượng Đài Đổi Mới (Đá hoa cương đen bóng, phù điêu mạ vàng, đài phun nước)
function drawMonumentBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#09090b";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#eab308";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Tượng đài trung tâm hoa cương
  context.fillStyle = "#27272a";
  context.beginPath();
  context.moveTo(bldg.x, by - 38);
  context.lineTo(bldg.x - 26, by + 20);
  context.lineTo(bldg.x + 26, by + 20);
  context.closePath();
  context.fill();

  context.fillStyle = "#facc15";
  context.font = "bold 14px sans-serif";
  context.textAlign = "center";
  context.fillText("🌾⚙️", bldg.x, by - 4);

  // Đài phun nước
  context.fillStyle = "rgba(56, 189, 248, 0.65)";
  context.beginPath();
  context.arc(bldg.x, by + 56, 18, 0, Math.PI * 2);
  context.fill();

  const ex = bldg.stationX - 50;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#18181b";
  context.fillRect(ex, ey, 100, 40);
  context.fillStyle = "#fde047";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🏛️ TƯỢNG ĐÀI ĐỔI MỚI", bldg.stationX, ey - 6);
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

  // Distinct Hairstyle & Accessories for 4 Historical Roles
  const hairColor = options.hairColor || (gender === "female" ? "#1c1917" : "#331800");

  if (charId === "ba_thi_distribution" || gender === "female") {
    // Bà Thi: Tóc ngắn uốn cúp Nam Bộ với kẹp nơ hoa
    ctx.fillStyle = hairColor;
    ctx.fillRect(x - 8, bobY - 20, 16, 6);
    ctx.fillRect(x - 8, bobY - 16, 3, 10);
    ctx.fillRect(x + 5, bobY - 16, 3, 10);
    ctx.fillStyle = "#f472b6";
    ctx.fillRect(x - 8, bobY - 13, 2, 2);
    ctx.fillRect(x + 6, bobY - 13, 2, 2);
  } else if (charId === "doan_xa_agriculture") {
    // Cán bộ Đoàn Xá: Tóc rẽ ngôi nông nghiệp
    ctx.fillStyle = hairColor;
    ctx.fillRect(x - 7, bobY - 20, 14, 6);
    ctx.fillRect(x - 7, bobY - 17, 2, 5);
    ctx.fillRect(x + 5, bobY - 17, 2, 5);
  } else if (charId === "det_thanh_cong_industry") {
    // Giám đốc Dệt Thành Công: Tóc ngắn gọn gàng công nghiệp
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x - 7, bobY - 21, 14, 7);
    ctx.fillRect(x - 7, bobY - 17, 2, 4);
    ctx.fillRect(x + 5, bobY - 17, 2, 4);
  } else {
    // Đoàn Khảo Sát Long An
    ctx.fillStyle = "#0f172a";
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

  // Waypoint Guidance Arrow to Target (Delivery -> Policy Station -> Unvisited NPC)
  if (isLocal) {
    let targetX = null;
    let targetY = null;
    let targetLabel = "MỤC TIÊU";
    let arrowColor = "#facc15";

    if (state.activeQuest) {
      const currentStep = state.activeQuest.steps[state.activeQuest.currentStepIndex];
      const currentBuildings = getCurrentPhaseBuildings();
      const targetBldg = currentBuildings.find(b => b.id === currentStep.bldgId || b.type === currentStep.bldgId || b.id.includes(currentStep.bldgId)) || getBuildingById(currentStep.bldgId);
      if (targetBldg) {
        targetX = targetBldg.stationX !== undefined ? targetBldg.stationX : targetBldg.x;
        targetY = targetBldg.stationY !== undefined ? targetBldg.stationY : targetBldg.y;
        targetLabel = `📦 GIAO: ${targetBldg.name || "NƠI NHẬN"}`;
        arrowColor = "#38bdf8";
      }
    } else if (state.policyStation && !state.taskCompletedByPlayer) {
      targetX = state.policyStation.stationX !== undefined ? state.policyStation.stationX : toWorldX(state.policyStation.x);
      targetY = state.policyStation.stationY !== undefined ? state.policyStation.stationY : toWorldY(state.policyStation.y);
      targetLabel = `📍 TRẠM: ${(state.policyStation.shortLabel || "KHẢO SÁT").toUpperCase()}`;
      arrowColor = "#facc15";
    } else {
      // Guide to nearest unvisited historical NPC or citizen in need
      const activeNpcs = getActivePhaseNPCs();
      const unvisitedNpc = activeNpcs.find(n => !answeredNpcIds.has(n.id));
      if (unvisitedNpc) {
        targetX = unvisitedNpc.x;
        targetY = unvisitedNpc.y;
        targetLabel = `💬 GẶP: ${unvisitedNpc.name}`;
        arrowColor = "#c084fc";
      } else {
        const activeCitizens = getActivePhaseCitizens();
        const unassistedCitizen = activeCitizens.find(c => !resolvedCitizenIds.has(c.id));
        if (unassistedCitizen) {
          targetX = unassistedCitizen.x;
          targetY = unassistedCitizen.y;
          targetLabel = `💖 CỨU TRỢ: ${unassistedCitizen.name}`;
          arrowColor = "#ec4899";
        }
      }
    }

    if (targetX !== null && targetY !== null) {
      const angle = Math.atan2(targetY - y, targetX - x);
      const distPx = Math.hypot(targetX - x, targetY - y);
      const distMeters = Math.round(distPx / 20);

      const orbitR = 40;
      const arrowTipX = x + Math.cos(angle) * orbitR;
      const arrowTipY = y + Math.sin(angle) * orbitR;

      ctx.save();
      ctx.translate(arrowTipX, arrowTipY);
      ctx.rotate(angle);
      ctx.fillStyle = arrowColor;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-8, -6);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-8, 6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Floating distance badge above player (Dynamic Width)
      const badgeY = bobY - (state.activeQuest ? 56 : 46);
      const badgeText = `${targetLabel} (${distMeters}m)`;
      ctx.font = "bold 9px 'Segoe UI', 'Inter', system-ui, sans-serif";
      const badgeW = Math.max(76, ctx.measureText(badgeText).width + 16);

      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.fillRect(x - badgeW / 2, badgeY - 8, badgeW, 16);
      ctx.strokeStyle = arrowColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - badgeW / 2, badgeY - 8, badgeW, 16);

      ctx.fillStyle = arrowColor;
      ctx.textAlign = "center";
      ctx.fillText(badgeText, x, badgeY + 4);
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

  // Name Tag (Dynamic Width with full Vietnamese support)
  ctx.font = "bold 9px 'Segoe UI', 'Inter', system-ui, sans-serif";
  const nameW = Math.max(56, ctx.measureText(name).width + 18);
  ctx.fillStyle = isLocal ? "rgba(15, 23, 42, 0.95)" : "rgba(30, 41, 59, 0.9)";
  ctx.fillRect(x - nameW / 2, bobY - (state.activeQuest ? 34 : 30), nameW, 15);
  ctx.strokeStyle = isLocal ? "#38bdf8" : "#64748b";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - nameW / 2, bobY - (state.activeQuest ? 34 : 30), nameW, 15);

  ctx.fillStyle = isLocal ? "#38bdf8" : "#f1f5f9";
  ctx.textAlign = "center";
  ctx.fillText(name, x, bobY - (state.activeQuest ? 23 : 19));

  // ❄️ FROZEN ICE BLOCK OVERLAY ON PLAYER
  if (isLocal && state.freezeTimer > 0) {
    ctx.save();
    ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.fillRect(x - 22, bobY - 32, 44, 52);
    ctx.strokeRect(x - 22, bobY - 32, 44, 52);

    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("❄️", x, bobY - 38);

    ctx.fillStyle = "#0c4a6e";
    ctx.fillRect(x - 24, bobY + 22, 48, 14);
    ctx.fillStyle = "#e0f2fe";
    ctx.font = "bold 9px 'Segoe UI', monospace";
    ctx.fillText(`${state.freezeTimer.toFixed(1)}s`, x, bobY + 32);
    ctx.restore();
  }
}

// ----------------------------------------------------
// BEAUTIFUL 32-BIT PIXEL ART ITEM GRAPHICS
// ----------------------------------------------------
function drawItemEntity(ctx, entity, time) {
  const x = entity.x;
  const floatY = entity.y + Math.sin(time * 3.5 + (entity.x % 10)) * 5;
  const type = entity.type || "rice_sheaf";
  const phaseKey = getActivePhaseKey();

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath(); ctx.ellipse(x, entity.y + 14, 15, 5, 0, 0, Math.PI * 2); ctx.fill();

  const glowRadius = 22 + Math.sin(time * 4) * 3;

  if (type === "crisis_pkg" || type === "crisis_item") {
    // ⭐ Kiện Cứu Trợ Lịch Sử Khẩn Cấp
    const rayAngle = time * 2;
    ctx.strokeStyle = "rgba(250, 204, 21, 0.45)";
    ctx.lineWidth = 1.5;
    for (let r = 0; r < 8; r++) {
      const a = rayAngle + (r * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(x, floatY);
      ctx.lineTo(x + Math.cos(a) * (glowRadius + 10), floatY + Math.sin(a) * (glowRadius + 10));
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(234, 179, 8, 0.4)";
    ctx.beginPath(); ctx.arc(x, floatY, glowRadius + 4, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#b45309";
    ctx.fillRect(x - 13, floatY - 13, 26, 26);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(x - 11, floatY - 11, 22, 22);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(x - 3, floatY - 11, 6, 22);
    ctx.fillRect(x - 11, floatY - 3, 22, 6);

    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⭐", x, floatY + 6);

  } else if (type === "rice_sheaf" || type === "rice" || phaseKey === "phase_1") {
    // 🌾 Bó lúa vàng óng
    ctx.fillStyle = "rgba(234, 179, 8, 0.35)";
    ctx.beginPath(); ctx.arc(x, floatY, glowRadius, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#ca8a04";
    ctx.fillRect(x - 10, floatY - 12, 20, 24);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(x - 8, floatY - 10, 16, 20);
    ctx.fillStyle = "#b45309";
    ctx.fillRect(x - 10, floatY, 20, 3);

    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🌾", x, floatY + 5);

  } else if (type === "yarn_spool" || type === "cotton" || phaseKey === "phase_2") {
    // 🧵 Cuộn sợi dệt Thành Công
    ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
    ctx.beginPath(); ctx.arc(x, floatY, glowRadius, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#0284c7";
    ctx.fillRect(x - 10, floatY - 12, 20, 24);
    ctx.fillStyle = "#e0f2fe";
    ctx.fillRect(x - 8, floatY - 10, 16, 20);

    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🧵", x, floatY + 5);

  } else if (type === "survey_doc" || phaseKey === "phase_3") {
    // 📋 Sổ tay khảo sát thực tế Long An
    ctx.fillStyle = "rgba(245, 158, 11, 0.35)";
    ctx.beginPath(); ctx.arc(x, floatY, glowRadius, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#78350f";
    ctx.fillRect(x - 11, floatY - 13, 22, 26);
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(x - 9, floatY - 11, 18, 22);

    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📋", x, floatY + 5);

  } else {
    // 📜 Bản thảo Chỉ thị 100 / Quyết định 25-CP
    ctx.fillStyle = "rgba(220, 38, 38, 0.35)";
    ctx.beginPath(); ctx.arc(x, floatY, glowRadius, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#991b1b";
    ctx.fillRect(x - 12, floatY - 14, 24, 28);
    ctx.fillStyle = "#fef2f2";
    ctx.fillRect(x - 10, floatY - 12, 20, 24);

    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📜", x, floatY + 5);
  }

  // Label tag above item (Dynamic width with full Vietnamese support)
  const label = entity.label || (
    type === "crisis_pkg" ? "Cứu Trợ (+10đ)" :
    phaseKey === "phase_1" ? "Lúa Khoán" :
    phaseKey === "phase_2" ? "Sợi Bông" :
    phaseKey === "phase_3" ? "Tài Liệu TW" : "Chỉ Thị 100"
  );
  ctx.font = "bold 9px 'Segoe UI', 'Inter', system-ui, sans-serif";
  const itemTagW = Math.max(64, ctx.measureText(label).width + 16);
  ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
  ctx.fillRect(x - itemTagW / 2, floatY - 26, itemTagW, 16);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - itemTagW / 2, floatY - 26, itemTagW, 16);

  ctx.fillStyle = type === "crisis_pkg" ? "#fbbf24" : "#facc15";
  ctx.textAlign = "center";
  ctx.fillText(label, x, floatY - 14);
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
  ctx.fillRect(x - 36, bubbleY - 12, 72, 18);
  ctx.strokeStyle = "#ec4899";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - 36, bubbleY - 12, 72, 18);

  // Speech Bubble Pointer
  ctx.fillStyle = "#ec4899";
  ctx.beginPath();
  ctx.moveTo(x - 4, bubbleY + 6);
  ctx.lineTo(x, bubbleY + 11);
  ctx.lineTo(x + 4, bubbleY + 6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f472b6";
  ctx.font = "bold 9px 'Segoe UI', 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🆘 CẦN GIÚP", x, bubbleY + 1);

  // Floating Pulsing Heart above
  const heartScale = 1 + Math.sin(time * 6) * 0.2;
  ctx.fillStyle = "#ec4899";
  ctx.font = `bold ${Math.round(13 * heartScale)}px sans-serif`;
  ctx.fillText("❤️", x, bubbleY - 15);

  // Footer Tag (Dynamic Width)
  const citizenLabel = "Dân cần hỗ trợ (+8đ)";
  ctx.font = "bold 9px 'Segoe UI', 'Inter', system-ui, sans-serif";
  const citTagW = Math.max(84, ctx.measureText(citizenLabel).width + 16);
  ctx.fillStyle = "#831843";
  ctx.fillRect(x - citTagW / 2, cy + 18, citTagW, 16);
  ctx.strokeStyle = "#f472b6";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - citTagW / 2, cy + 18, citTagW, 16);

  ctx.fillStyle = "#fdf2f8";
  ctx.textAlign = "center";
  ctx.fillText(citizenLabel, x, cy + 30);
}

// Draw Hazard Entity with Pulsing Siren & Red Border or Freeze Trap Cyan Glow ❄️
function drawHazardEntity(ctx, entity, time) {
  const x = entity.x;
  const y = entity.y;
  const pulse = Math.sin(time * 7 + (entity.x % 10)) * 4;
  const type = entity.type || "envelope";
  const label = entity.label || "Cạm bẫy di chuyển";
  const isFreeze = type === "freeze_trap" || type === "ice_trap";

  if (isFreeze) {
    // ❄️ BẪY ĐÓNG BĂNG HIỆU ỨNG PHA LÊ TUYẾT
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.6 + Math.sin(time * 8) * 0.35})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, 22 + pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(14, 165, 233, 0.25)";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    const sirenY = y - 24 + Math.sin(time * 8) * 3;
    ctx.font = "15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("❄️", x, sirenY);

    // Ice crystal diamond shape
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(x, y - 14);
    ctx.lineTo(x + 14, y);
    ctx.lineTo(x, y + 14);
    ctx.lineTo(x - 14, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#e0f2fe";
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x + 8, y);
    ctx.lineTo(x, y + 8);
    ctx.lineTo(x - 8, y);
    ctx.closePath();
    ctx.fill();

    ctx.font = "bold 9px 'Segoe UI', 'Inter', system-ui, sans-serif";
    const freezeTagW = Math.max(88, ctx.measureText(label).width + 16);
    ctx.fillStyle = "#0c4a6e";
    ctx.fillRect(x - freezeTagW / 2, y + 16, freezeTagW, 16);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - freezeTagW / 2, y + 16, freezeTagW, 16);
    ctx.fillStyle = "#7dd3fc";
    ctx.textAlign = "center";
    ctx.fillText(label, x, y + 28);
    return;
  }

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

  ctx.font = "bold 9px 'Segoe UI', 'Inter', system-ui, sans-serif";
  const hazardTagW = Math.max(76, ctx.measureText(label).width + 16);
  ctx.fillStyle = "#7f1d1d";
  ctx.fillRect(x - hazardTagW / 2, y + 16, hazardTagW, 16);
  ctx.strokeStyle = "#f87171";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - hazardTagW / 2, y + 16, hazardTagW, 16);
  ctx.fillStyle = "#fca5a5";
  ctx.textAlign = "center";
  ctx.fillText(label, x, y + 28);
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

  ctx.font = "bold 9px 'Segoe UI', 'Inter', system-ui, sans-serif";
  const npcTagW = Math.max(68, ctx.measureText(label).width + 16);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - npcTagW / 2, y + 16, npcTagW, 16);
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - npcTagW / 2, y + 16, npcTagW, 16);
  ctx.fillStyle = "#38bdf8";
  ctx.textAlign = "center";
  ctx.fillText(label, x, y + 28);
}

// ----------------------------------------------------
// HISTORICAL NPCS IN-WORLD RENDERING
// ----------------------------------------------------
function drawHistoricalNPCs(ctx, time) {
  const npcs = getActivePhaseNPCs();
  for (const npc of npcs) {
    const isAnswered = answeredNpcIds.has(npc.id);
    const distToPlayer = Math.hypot(state.player.x - npc.x, state.player.y - npc.y);
    const isNear = distToPlayer <= 85;

    // Draw Pixel Character for NPC
    drawPixelCharacter(ctx, npc.x, npc.y, {
      name: npc.name,
      color: npc.avatarColor || "#facc15",
      characterId: npc.gender === "female" ? "female_reception" : "male_reception",
      gender: npc.gender || "male",
      isLocal: false,
      isMoving: false,
    });

    // Overhead Animated Dialogue Bubble (Dynamic Width)
    const bobY = npc.y - 48 + Math.sin(time * 4) * 3;
    const bubbleText = isAnswered ? "✓ ĐÃ ĐỐI THOẠI" : (isNear ? "💬 [E/SPACE] ĐỐI THOẠI +10Đ" : "💬 ĐỐI THOẠI (+10Đ)");
    ctx.font = "bold 9px 'Segoe UI', 'Inter', system-ui, sans-serif";
    const bubbleW = Math.max(105, ctx.measureText(bubbleText).width + 20);
    const bubbleH = 20;

    ctx.save();
    ctx.fillStyle = isAnswered ? "rgba(6, 78, 59, 0.94)" : (isNear ? "rgba(88, 28, 135, 0.96)" : "rgba(15, 23, 42, 0.94)");
    ctx.strokeStyle = isAnswered ? "#10b981" : (isNear ? "#facc15" : "#c084fc");
    ctx.lineWidth = isNear ? 2 : 1.5;
    ctx.fillRect(npc.x - bubbleW / 2, bobY - bubbleH / 2, bubbleW, bubbleH);
    ctx.strokeRect(npc.x - bubbleW / 2, bobY - bubbleH / 2, bubbleW, bubbleH);

    // Bubble pointer triangle
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(npc.x, bobY + bubbleH / 2 + 4);
    ctx.lineTo(npc.x - 4, bobY + bubbleH / 2);
    ctx.lineTo(npc.x + 4, bobY + bubbleH / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = isAnswered ? "#34d399" : (isNear ? "#fef08a" : "#e9d5ff");
    ctx.textAlign = "center";
    ctx.fillText(bubbleText, npc.x, bobY + 3.5);

    // Subtitle badge (Dynamic Width)
    if (npc.sub) {
      ctx.font = "8px 'Segoe UI', 'Inter', system-ui, sans-serif";
      const subW = ctx.measureText(npc.sub).width + 12;
      ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
      ctx.fillRect(npc.x - subW / 2, npc.y + 16, subW, 13);
      ctx.fillStyle = "rgba(241, 245, 249, 0.95)";
      ctx.fillText(npc.sub, npc.x, npc.y + 25.5);
    }

    ctx.restore();
  }
}

// ----------------------------------------------------
// MINI-MAP RADAR HUD
// ----------------------------------------------------
function drawMiniMapRadar() {
  const mmW = 200;
  const mmH = 120;
  const mmX = VIEW_WIDTH - mmW - 14;
  const mmY = 14;
  const phaseKey = getActivePhaseKey();
  const time = state.gameTime;

  context.fillStyle = "rgba(15, 23, 42, 0.95)";
  context.fillRect(mmX, mmY, mmW, mmH);
  context.strokeStyle = "#38bdf8";
  context.lineWidth = 2;
  context.strokeRect(mmX, mmY, mmW, mmH);

  const mapToMmX = (wx) => mmX + (wx / MAP_WIDTH) * mmW;
  const mapToMmY = (wy) => mmY + (wy / MAP_HEIGHT) * mmH;

  // Ground zones
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

  // 1. Buildings on Minimap
  const currentBuildings = getCurrentPhaseBuildings();
  for (const bldg of currentBuildings) {
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

  // 2. Active Thematic Collectible Items & Hazards on Minimap
  for (const [id, item] of movingHazardsState.entries()) {
    if (state.collectedIds.has(id) || state.resolvedCollisionIds.has(id)) continue;
    const px = mapToMmX(item.x);
    const py = mapToMmY(item.y);

    if (item.kind === "hazard") {
      // Cyan blip for freeze traps, Red blip for patrol guards
      const isFreeze = item.type === "freeze_trap" || item.type === "ice_trap";
      context.fillStyle = isFreeze ? "#38bdf8" : "#ef4444";
      context.fillRect(px - 2, py - 2, 4, 4);
    } else {
      const itemColor = (
        item.type === "crisis_pkg" ? "#fbbf24" :
        item.type === "rice_sheaf" ? "#facc15" :
        item.type === "yarn_spool" ? "#38bdf8" :
        item.type === "survey_doc" ? "#fbbf24" :
        item.type === "directive_100" ? "#f87171" : "#4ade80"
      );
      context.fillStyle = itemColor;
      context.fillRect(px - 2, py - 2, 4, 4);
    }
  }

  // 3. Historical NPCs on Minimap
  const activeNpcs = getActivePhaseNPCs();
  for (const npc of activeNpcs) {
    const nMmX = mapToMmX(npc.x);
    const nMmY = mapToMmY(npc.y);
    const isAnswered = answeredNpcIds.has(npc.id);

    if (isAnswered) {
      context.fillStyle = "#10b981";
      context.beginPath();
      context.arc(nMmX, nMmY, 3, 0, Math.PI * 2);
      context.fill();
    } else {
      const nPulse = 4 + Math.sin(time * 5) * 2;
      context.fillStyle = "rgba(192, 132, 252, 0.45)";
      context.beginPath();
      context.arc(nMmX, nMmY, nPulse, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "#c084fc";
      context.beginPath();
      context.arc(nMmX, nMmY, 3.5, 0, Math.PI * 2);
      context.fill();
    }
  }

  // 3.1 Historical Citizens in Need on Minimap
  const activeCitizens = getActivePhaseCitizens();
  for (const citizen of activeCitizens) {
    if (!resolvedCitizenIds.has(citizen.id)) {
      const cMmX = mapToMmX(citizen.x);
      const cMmY = mapToMmY(citizen.y);
      const cPulse = 4 + Math.sin(time * 6) * 2;
      context.fillStyle = "rgba(236, 72, 153, 0.5)";
      context.beginPath();
      context.arc(cMmX, cMmY, cPulse, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "#ec4899";
      context.beginPath();
      context.arc(cMmX, cMmY, 3.5, 0, Math.PI * 2);
      context.fill();
    }
  }

  // 4. Target Policy Station or Delivery Destination GPS Line
  let gpsTargetX = null;
  let gpsTargetY = null;
  let gpsLabel = "MỤC TIÊU";
  let gpsColor = "#facc15";

  if (state.activeQuest) {
    const currentStep = state.activeQuest.steps[state.activeQuest.currentStepIndex];
    const targetBldg = currentBuildings.find(b => b.id === currentStep.bldgId || b.type === currentStep.bldgId || b.id.includes(currentStep.bldgId)) || getBuildingById(currentStep.bldgId);
    if (targetBldg) {
      gpsTargetX = targetBldg.stationX !== undefined ? targetBldg.stationX : targetBldg.x;
      gpsTargetY = targetBldg.stationY !== undefined ? targetBldg.stationY : targetBldg.y;
      gpsLabel = "GIAO HÀNG";
      gpsColor = "#38bdf8";
    }
  } else if (state.policyStation && !state.taskCompletedByPlayer) {
    gpsTargetX = state.policyStation.stationX !== undefined ? state.policyStation.stationX : toWorldX(state.policyStation.x);
    gpsTargetY = state.policyStation.stationY !== undefined ? state.policyStation.stationY : toWorldY(state.policyStation.y);
    gpsLabel = (state.policyStation.shortLabel || "TRẠM").toUpperCase();
    gpsColor = "#facc15";
  }

  if (gpsTargetX !== null && gpsTargetY !== null) {
    const stMmX = mapToMmX(gpsTargetX);
    const stMmY = mapToMmY(gpsTargetY);
    const pulseR = 6 + Math.sin(time * 6) * 3;

    // Glowing target station halo
    context.fillStyle = state.activeQuest ? "rgba(56, 189, 248, 0.4)" : "rgba(250, 204, 21, 0.4)";
    context.beginPath();
    context.arc(stMmX, stMmY, pulseR, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = gpsColor;
    context.beginPath();
    context.arc(stMmX, stMmY, 4, 0, Math.PI * 2);
    context.fill();

    // Dashed GPS route path from player to target station
    context.strokeStyle = gpsColor;
    context.lineWidth = 1.5;
    context.setLineDash([4, 3]);
    context.beginPath();
    context.moveTo(mapToMmX(state.player.x), mapToMmY(state.player.y));
    context.lineTo(stMmX, stMmY);
    context.stroke();
    context.setLineDash([]);
  }

  // Camera viewport box
  const camBoxX = mapToMmX(camera.x);
  const camBoxY = mapToMmY(camera.y);
  const camBoxW = (VIEW_WIDTH / MAP_WIDTH) * mmW;
  const camBoxH = (VIEW_HEIGHT / MAP_HEIGHT) * mmH;
  context.strokeStyle = "rgba(255, 255, 255, 0.6)";
  context.lineWidth = 1;
  context.strokeRect(camBoxX, camBoxY, camBoxW, camBoxH);

  // Player dot
  const lpx = mapToMmX(state.player.x);
  const lpy = mapToMmY(state.player.y);
  context.fillStyle = "#22c55e";
  context.beginPath();
  context.arc(lpx, lpy, 4, 0, Math.PI * 2);
  context.fill();

  // Radar Title & Distance
  context.fillStyle = "#38bdf8";
  context.font = "bold 8px monospace";
  context.textAlign = "left";
  context.fillText(`RADAR - ${phaseKey.toUpperCase()}`, mmX + 6, mmY + 11);

  if (gpsTargetX !== null && gpsTargetY !== null) {
    const distPx = Math.hypot(gpsTargetX - state.player.x, gpsTargetY - state.player.y);
    const distMeters = Math.round(distPx / 20);
    context.fillStyle = gpsColor;
    context.font = "bold 8px 'Silkscreen', monospace";
    context.textAlign = "right";
    context.fillText(`${state.activeQuest ? "📦" : "📍"} ${distMeters}m`, mmX + mmW - 6, mmY + 11);
  }

  // Mini-Legend at bottom of Radar
  context.fillStyle = "rgba(15, 23, 42, 0.92)";
  context.fillRect(mmX, mmY + mmH - 12, mmW, 12);
  context.font = "7px 'Silkscreen', monospace";
  context.textAlign = "left";
  context.fillStyle = "#facc15";
  context.fillText("🟡Trạm", mmX + 4, mmY + mmH - 3);
  context.fillStyle = "#c084fc";
  context.fillText("🟣NPC", mmX + 44, mmY + mmH - 3);
  context.fillStyle = "#ec4899";
  context.fillText("💖Dân", mmX + 80, mmY + mmH - 3);
  context.fillStyle = "#38bdf8";
  context.fillText("🔵Giao", mmX + 114, mmY + mmH - 3);
  context.fillStyle = "#ef4444";
  context.fillText("🔴Rủi ro", mmX + 150, mmY + mmH - 3);
}

// ----------------------------------------------------
// MAIN RENDER SCENE
// ----------------------------------------------------
function drawScene() {
  const time = state.gameTime;
  const phaseKey = getActivePhaseKey();
  const activeNpcs = getActivePhaseNPCs();
  const activeCitizens = getActivePhaseCitizens();

  if (options.role === "host") {
    const camSpeed = 12;
    let dx = 0; let dy = 0;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    camera.x += dx * camSpeed;
    camera.y += dy * camSpeed;
    camera.x = Math.max(0, Math.min(MAP_WIDTH - VIEW_WIDTH, camera.x));
    camera.y = Math.max(0, Math.min(MAP_HEIGHT - VIEW_HEIGHT, camera.y));
  } else {
    const targetCamX = state.player.x - VIEW_WIDTH / 2;
    const targetCamY = state.player.y - VIEW_HEIGHT / 2;
    camera.x += (Math.max(0, Math.min(MAP_WIDTH - VIEW_WIDTH, targetCamX)) - camera.x) * 0.12;
    camera.y += (Math.max(0, Math.min(MAP_HEIGHT - VIEW_HEIGHT, targetCamY)) - camera.y) * 0.12;
  }

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

  // 4. Historical NPCs Rendering
  drawHistoricalNPCs(context, time);

  // 4.1 Historical Citizens in Need Rendering
  for (const citizen of activeCitizens) {
    if (!resolvedCitizenIds.has(citizen.id)) {
      drawCitizenInNeedEntity(context, citizen.x, citizen.y, time);
    }
  }

  // 5. Interactive World Entities
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

  // 6. Dynamic Moving Hazards / Historical Items
  for (const [id, mHazard] of movingHazardsState.entries()) {
    if (state.collectedIds.has(id) || state.resolvedCollisionIds.has(id)) continue;
    if (
      mHazard.kind === "item" ||
      mHazard.type === "rice_sheaf" ||
      mHazard.type === "yarn_spool" ||
      mHazard.type === "survey_doc" ||
      mHazard.type === "directive_100" ||
      mHazard.type === "crisis_pkg" ||
      mHazard.type === "crisis_item"
    ) {
      drawItemEntity(context, mHazard, time);
    } else {
      drawHazardEntity(context, mHazard, time);
    }
  }

  // 7. Remote Players
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

  // 8. Local Player
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

  // 9. Particles
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

  // 10. Floating Text
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
    context.font = "bold 13px 'Segoe UI', 'Inter', system-ui, sans-serif";
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

  // On-Screen RPG Quest Tracker HUD Banner (Top Left)
  if (options.role === "player") {
    const answeredNpcCount = Array.from(answeredNpcIds).length;
    const totalNpcs = activeNpcs.length || 2;
    const resolvedCitizenCount = activeCitizens.filter(c => resolvedCitizenIds.has(c.id)).length;
    const isStationDone = Boolean(state.taskCompletedByPlayer);

    const trackerX = 14;
    const trackerY = 14;
    const trackerW = 310;
    const trackerH = state.activeQuest ? 104 : 88;

    context.fillStyle = "rgba(15, 23, 42, 0.94)";
    context.fillRect(trackerX, trackerY, trackerW, trackerH);
    context.strokeStyle = "rgba(245, 158, 11, 0.7)";
    context.lineWidth = 1.5;
    context.strokeRect(trackerX, trackerY, trackerW, trackerH);

    // Title
    context.fillStyle = "#facc15";
    context.font = "bold 10.5px 'Segoe UI', 'Inter', system-ui, sans-serif";
    context.textAlign = "left";
    context.fillText(`📜 NHẬT KÝ NHIỆM VỤ (${phaseKey.toUpperCase()})`, trackerX + 8, trackerY + 14);

    // Main Quest Line
    context.font = "9.5px 'Segoe UI', 'Inter', system-ui, sans-serif";
    context.fillStyle = isStationDone ? "#34d399" : "#fef08a";
    context.fillText(
      `${isStationDone ? "✅" : "📍"} Khảo sát: ${isStationDone ? "Đã hoàn thành (+5đ)" : (state.policyStation?.shortLabel || "Chưa khảo sát")}`,
      trackerX + 8,
      trackerY + 30
    );

    // NPC Dialogue Line
    context.fillStyle = answeredNpcCount >= totalNpcs ? "#34d399" : "#c084fc";
    context.fillText(
      `💬 Phỏng vấn lịch sử: ${answeredNpcCount}/${totalNpcs} nhân vật (+${answeredNpcCount * 10}đ)`,
      trackerX + 8,
      trackerY + 45
    );

    // Citizen Aid Line
    context.fillStyle = resolvedCitizenCount >= activeCitizens.length ? "#34d399" : "#f472b6";
    context.fillText(
      `💖 Trợ giúp xã viên: ${resolvedCitizenCount}/${activeCitizens.length} nguyện vọng (+${resolvedCitizenCount * 8}đ)`,
      trackerX + 8,
      trackerY + 60
    );

    // Delivery or Combo Line
    if (state.activeQuest) {
      context.fillStyle = "#38bdf8";
      context.fillText(
        `📦 Giao hàng: ${state.activeQuest.title}...`,
        trackerX + 8,
        trackerY + 75
      );
    } else if (state.sprintTimer > 0) {
      context.fillStyle = "#f59e0b";
      context.fillText(
        `🔥 TĂNG TỐC ĐỔI MỚI (x2 Điểm): ${Math.ceil(state.sprintTimer)}s`,
        trackerX + 8,
        trackerY + 75
      );
    } else {
      context.fillStyle = "#94a3b8";
      context.fillText(
        `✨ Nhận thêm nhiệm vụ vận chuyển tại các tòa nhà`,
        trackerX + 8,
        trackerY + 75
      );
    }

    if (state.activeQuest && state.sprintTimer > 0) {
      context.fillStyle = "#f59e0b";
      context.fillText(
        `🔥 TĂNG TỐC ĐỔI MỚI (x2 Điểm): ${Math.ceil(state.sprintTimer)}s`,
        trackerX + 8,
        trackerY + 92
      );
    }
  }

  // Interactive Bottom Prompt
  if (options.role === "player") {
    let promptText = null;
    let promptColor = "#fef08a";
    let promptBorder = "#facc15";

    // Check if near NPC
    const nearNpc = activeNpcs.find(n => Math.hypot(state.player.x - n.x, state.player.y - n.y) <= 85);

    // Check if near Citizen in Need
    const nearCitizen = activeCitizens.find(c => !resolvedCitizenIds.has(c.id) && Math.hypot(state.player.x - c.x, state.player.y - c.y) <= 85);

    // Check if near Station
    let isNearStation = false;
    if (state.policyStation && !state.taskCompletedByPlayer) {
      const stX = state.policyStation.stationX !== undefined ? state.policyStation.stationX : toWorldX(state.policyStation.x);
      const stY = state.policyStation.stationY !== undefined ? state.policyStation.stationY : toWorldY(state.policyStation.y);
      if (Math.hypot(state.player.x - stX, state.player.y - stY) <= 160) {
        isNearStation = true;
      }
    }

    if (state.frozen || state.freezeTimer > 0) {
      promptText = "❓ ĐANG XỬ LÝ CÂU HỎI TÌNH HUỐNG TRÊN MÀN HÌNH";
      promptColor = "#fecaca";
      promptBorder = "#ef4444";
    } else if (nearNpc) {
      const isAns = answeredNpcIds.has(nearNpc.id);
      promptText = isAns
        ? `✓ ĐÃ HOÀN TẤT ĐỐI THOẠI VỚI: ${nearNpc.name.toUpperCase()}`
        : `💬 BẤM [E / SPACE] ĐỂ ĐỐI THOẠI VỚI: ${nearNpc.name.toUpperCase()} (+10Đ)`;
      promptColor = isAns ? "#34d399" : "#c084fc";
      promptBorder = isAns ? "#10b981" : "#a855f7";
    } else if (nearCitizen) {
      promptText = `💖 BẤM [E / SPACE] ĐỂ: TRỢ GIÚP ${nearCitizen.name.toUpperCase()} (+8Đ)`;
      promptColor = "#f472b6";
      promptBorder = "#ec4899";
    } else if (isNearStation) {
      promptText = `⚡ BẤM [E / SPACE] ĐỂ KHẢO SÁT THỰC ĐỊA: ${(state.policyStation.label || "TRẠM KHẢO SÁT").toUpperCase()} (+5Đ)`;
      promptColor = "#fde047";
      promptBorder = "#facc15";
    } else if (state.activeQuest) {
      const currentStep = state.activeQuest.steps[state.activeQuest.currentStepIndex];
      const targetBldg = getBuildingById(currentStep.bldgId);
      const distToStation = targetBldg ? Math.hypot(state.player.x - targetBldg.stationX, state.player.y - targetBldg.stationY) : 999;
      const isAtTarget = distToStation <= 160 || (state.nearbyBuilding && state.nearbyBuilding.id === currentStep.bldgId);

      if (isAtTarget) {
        promptText = `⚡ ĐÃ ĐẾN NƠI! BẤM [E / SPACE] ĐỂ: ${currentStep.actionText.toUpperCase()} (+5Đ)`;
        promptColor = "#34d399";
        promptBorder = "#10b981";
      } else {
        promptText = `➔ ĐANG VẬN CHUYỂN ĐẾN: ${targetBldg ? targetBldg.name : "ĐÍCH ĐẾN"} (THEO MŨI TÊN)`;
        promptColor = "#38bdf8";
        promptBorder = "#0284c7";
      }
    } else if (state.nearbyBuilding) {
      promptText = `⚡ BẤM [E / SPACE] ĐỂ: ${state.nearbyBuilding.actionLabel.toUpperCase()}`;
      promptColor = "#38bdf8";
      promptBorder = state.nearbyBuilding.accentColor || "#38bdf8";
    }

    if (promptText) {
      const promptY = VIEW_HEIGHT - 22;
      context.fillStyle = "rgba(15, 23, 42, 0.95)";
      context.fillRect(VIEW_WIDTH / 2 - 340, promptY - 14, 680, 28);
      context.strokeStyle = promptBorder;
      context.lineWidth = 2;
      context.strokeRect(VIEW_WIDTH / 2 - 340, promptY - 14, 680, 28);

      context.fillStyle = promptColor;
      context.font = "bold 11px 'Segoe UI', 'Inter', system-ui, sans-serif";
      context.textAlign = "center";
      context.fillText(promptText, VIEW_WIDTH / 2, promptY + 4);
    }
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

  // Sprint Timer Decay & Speed Trail Effect
  if (state.sprintTimer > 0) {
    state.sprintTimer -= deltaSeconds;
    if (state.sprintTimer <= 0) {
      state.sprintTimer = 0;
      if (state.player) state.player.speedMultiplier = 1.0;
    } else {
      if (options.role === "player" && activeInput() && Math.random() < 0.4) {
        spawnParticles(state.player.x, state.player.y + 10, "#facc15", 2, 45, "star");
      }
    }
  }

  // Dynamic Emergency Historical Crisis Event Check (around 35s into phase)
  const phaseKey = getActivePhaseKey();
  if (!state.crisisTriggeredForPhase) state.crisisTriggeredForPhase = new Set();
  if (!state.crisisTriggeredForPhase.has(phaseKey) && state.gameTime >= 35) {
    state.crisisTriggeredForPhase.add(phaseKey);
    triggerEmergencyCrisis(phaseKey);
  }

  updateMovingHazards(deltaSeconds);
  advanceRemotePlayers(deltaSeconds);

  // Move player with SOLID BUILDING COLLISION BLOCKING (Direct Keyboard & D-Pad Control)
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

// Keyboard Controls (Supporting Code, Key, and Vietnamese IMEs)
const KEY_TO_DIRECTION = {
  ArrowUp: "up", KeyW: "up", w: "up", W: "up", ư: "up", Ư: "up",
  ArrowDown: "down", KeyS: "down", s: "down", S: "down",
  ArrowLeft: "left", KeyA: "left", a: "left", A: "left",
  ArrowRight: "right", KeyD: "right", d: "right", D: "right", đ: "right", Đ: "right",
};

window.addEventListener("keydown", (event) => {
  if (state.frozen || state.freezeTimer > 0) {
    event.preventDefault();
    return;
  }

  if (
    event.code === "KeyE" ||
    event.code === "Space" ||
    event.code === "Enter" ||
    event.key === "e" ||
    event.key === "E" ||
    event.key === " "
  ) {
    event.preventDefault();
    executePlayerAction();
    return;
  }

  const direction = KEY_TO_DIRECTION[event.code] || KEY_TO_DIRECTION[event.key];
  if (!direction) return;
  getAudioContext();
  event.preventDefault();
  state.moveTarget = null;
  setDirection(direction, true);
});

window.addEventListener("keyup", (event) => {
  const direction = KEY_TO_DIRECTION[event.code] || KEY_TO_DIRECTION[event.key];
  if (!direction) return;
  event.preventDefault();
  setDirection(direction, false);
});

window.addEventListener("blur", () => {
  // Clear any stuck inputs when window loses focus
  for (const k of Object.keys(input)) {
    input[k] = false;
  }
});

// Canvas Direct Click/Tap Interaction Handler
let hostDragging = false;
let hostLastX = 0;
let hostLastY = 0;

window.addEventListener("pointermove", (e) => {
  if (options.role === "host" && hostDragging) {
    const dx = e.clientX - hostLastX;
    const dy = e.clientY - hostLastY;
    hostLastX = e.clientX;
    hostLastY = e.clientY;
    const rect = canvas.getBoundingClientRect();
    camera.x -= dx * (VIEW_WIDTH / rect.width);
    camera.y -= dy * (VIEW_HEIGHT / rect.height);
    camera.x = Math.max(0, Math.min(MAP_WIDTH - VIEW_WIDTH, camera.x));
    camera.y = Math.max(0, Math.min(MAP_HEIGHT - VIEW_HEIGHT, camera.y));
  }
});

window.addEventListener("pointerup", () => { hostDragging = false; });

canvas.addEventListener("pointerdown", (event) => {
  getAudioContext();

  if (options.role === "host") {
    hostDragging = true;
    hostLastX = event.clientX;
    hostLastY = event.clientY;
    return;
  }

  // Focus game frame so keyboard commands work immediately
  window.focus();
  try { canvas.focus(); } catch (_) {}

  if (state.frozen || state.freezeTimer > 0) return;

  const rect = canvas.getBoundingClientRect();
  const clickCanvasX = (event.clientX - rect.left) * (VIEW_WIDTH / rect.width);
  const clickCanvasY = (event.clientY - rect.top) * (VIEW_HEIGHT / rect.height);
  const worldClickX = clickCanvasX + camera.x;
  const worldClickY = clickCanvasY + camera.y;

  // 1. Check if clicked directly on an interactive Historical NPC
  const activeNpcs = getActivePhaseNPCs();
  for (const npc of activeNpcs) {
    if (Math.hypot(worldClickX - npc.x, worldClickY - npc.y) <= 75) {
      executePlayerAction();
      return;
    }
  }

  // 2. Check if clicked on a Citizen in need
  const activeCitizens = getActivePhaseCitizens();
  for (const citizen of activeCitizens) {
    if (!resolvedCitizenIds.has(citizen.id) && Math.hypot(worldClickX - citizen.x, worldClickY - citizen.y) <= 75) {
      executePlayerAction();
      return;
    }
  }

  // 3. Check if clicked on a Policy Station
  const currentBuildings = getCurrentPhaseBuildings();
  for (const bldg of currentBuildings) {
    const dist = Math.hypot(worldClickX - bldg.stationX, worldClickY - bldg.stationY);
    if (dist <= bldg.radius + 40) {
      executePlayerAction();
      return;
    }
  }

  // 4. Clicked on empty terrain: just render a light click ripple, NO uncontrolled auto-walking
  spawnParticles(worldClickX, worldClickY, "#38bdf8", 6, 25, "circle");
});

// Parent Window PostMessage Listener
window.addEventListener("message", (event) => {
  if (event.source !== window.parent) return;
  const message = event.data;
  if (!message || typeof message !== "object") return;

  if (message.type === "POLICY_GAME_SNAPSHOT" || message.type === "GAME_SNAPSHOT") {
    const nextPhase = typeof message.phaseId === "string" ? message.phaseId : (typeof message.phase === "string" ? message.phase : state.phase);
    const phaseChanged = nextPhase !== state.phase
      && nextPhase !== "waiting"
      && nextPhase !== "finished";

    if (phaseChanged) {
      state.player.localPositionInitialized = false;
      remotePlayerRenderState.clear();
      movingHazardsState.clear();
      state.collectedIds.clear();
      state.resolvedCollisionIds.clear();
      state.activeQuest = null;
      answeredNpcIds.clear();
      state.taskCompletedByPlayer = false;
      state.moveTarget = null;
      if (nextPhase !== "waiting" && nextPhase !== "finished") {
        state.phase = nextPhase;
      }
      initAmbientHazards();
    } else if (nextPhase !== "waiting" && nextPhase !== "finished") {
      state.phase = nextPhase;
    }

    state.policyStation = message.station || null;
    state.taskCompletedByPlayer = Boolean(message.taskCompletedByPlayer);
    state.snapshot = normalizeSnapshot(message);
    updatePlayerFromSnapshot();
    if (message.players) {
      syncRemotePlayerTargets(message.players);
    }
    setStatus(`${options.role === "host" ? "Chế độ Ban Tổ Chức (Host)" : "Người chơi"}: ${state.phase}`);
    return;
  }
  if (message.type === "PLAYER_POSITION") {
    applyPlayerPositionDelta(message);
  } else if (message.type === "SET_INPUT") {
    getAudioContext();
    if (message.input && typeof message.input === "object") {
      state.moveTarget = null;
      for (const dir of ["up", "down", "left", "right"]) {
        if (dir in message.input) {
          input[dir] = Boolean(message.input[dir]);
        }
      }
    }
  } else if (message.type === "SET_DIRECTION") {
    getAudioContext();
    if (message.direction in input) {
      state.moveTarget = null;
      input[message.direction] = Boolean(message.active);
    }
  } else if (message.type === "DPAD_MOVE") {
    getAudioContext();
    state.moveTarget = null;
    if (!state.frozen && state.freezeTimer <= 0) {
      if (message.dir === "stop") {
        for (const key of Object.keys(input)) input[key] = false;
      } else if (message.dir in input) {
        for (const key of Object.keys(input)) input[key] = false;
        input[message.dir] = true;
      }
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
  } else if (message.type === "NPC_DIALOGUE_ANSWERED") {
    if (message.npcId) answeredNpcIds.add(message.npcId);
  } else if (message.type === "SPAWN_EXTRA_ITEMS") {
    spawnExtraThematicItems(5);
  } else if (message.type === "TOGGLE_SOUND") {
    soundEnabled = !soundEnabled;
  }
});

// Initial Setup
setStatus(options.role === "host" ? "Chế độ Host sẵn sàng" : `Cán bộ ${options.playerName} sẵn sàng`);
postToParent({ type: "RPG_READY", role: options.role, playerId: options.playerId });
requestAnimationFrame(frame);
