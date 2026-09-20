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
const initialCharacterId = searchParams.get("character") || searchParams.get("roleId") || "worker_leader";
const initialGender = searchParams.get("gender") || (initialCharacterId.startsWith("female") ? "female" : "male");
const initialPhaseParam = searchParams.get("phase");

// Audio System
let audioCtx = null;
let soundEnabled = true;
let bgmEnabled = false; // Default OFF as requested by user

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

// ----------------------------------------------------
// 🎵 BACKGROUND MUSIC: LOVELY GARDEN (PIXABAY TRACK 540008)
// Only plays when enabled and during active gameplay; pauses when Host resolves phase!
// ----------------------------------------------------
let lovelyGardenAudio = null;

function getLovelyGardenAudio() {
  if (!lovelyGardenAudio && typeof Audio !== "undefined") {
    try {
      lovelyGardenAudio = new Audio("./lovely-garden.mp3");
      lovelyGardenAudio.loop = true;
      lovelyGardenAudio.volume = 0.35;
      lovelyGardenAudio.addEventListener("error", () => {
        if (lovelyGardenAudio && lovelyGardenAudio.src.indexOf("/lovely-garden.mp3") === -1) {
          lovelyGardenAudio.src = "/lovely-garden.mp3";
        }
      });
    } catch (e) {
      console.warn("Audio creation error:", e);
    }
  }
  return lovelyGardenAudio;
}

function startBgm() {
  if (options.role === "host") return; // Host music is managed directly by HostView.jsx
  if (!soundEnabled || !bgmEnabled) return;
  // If phase is resolved, Host has stopped the situation -> NO MUSIC!
  if (state.phaseStatus === "resolved") {
    stopBgm();
    return;
  }

  const audio = getLovelyGardenAudio();
  if (audio) {
    audio.play().catch(() => {});
  }
}

function stopBgm() {
  if (lovelyGardenAudio) {
    try {
      lovelyGardenAudio.pause();
    } catch (_) {}
  }
}

function toggleBgm(forceState) {
  if (typeof forceState === "boolean") {
    bgmEnabled = forceState;
  } else {
    bgmEnabled = !bgmEnabled;
  }
  if (!bgmEnabled) {
    stopBgm();
  } else {
    startBgm();
  }
  postToParent({ type: "BGM_STATE", muted: !bgmEnabled });
  return bgmEnabled;
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
  boost: () => {
    [440, 554, 659, 880, 1108].forEach((f, i) => {
      setTimeout(() => playTone(f, "sawtooth", 0.08, 0.14), i * 35);
    });
  },
  shield: () => {
    playTone(330, "sine", 0.1, 0.2);
    setTimeout(() => playTone(660, "triangle", 0.15, 0.25), 50);
  },
  carHonk: () => {
    // Dual-tone retro-modern automotive horn "BÍP BÍP!"
    playTone(440, "sawtooth", 0.12, 0.26);
    playTone(554.37, "sawtooth", 0.12, 0.26);
    setTimeout(() => {
      playTone(440, "sawtooth", 0.14, 0.28);
      playTone(554.37, "sawtooth", 0.14, 0.28);
    }, 130);
  },
};

// ----------------------------------------------------
// CHƯƠNG 5: CƠ CẤU XÃ HỘI - GIAI CẤP & LIÊN MINH GIAI TẦNG
// ----------------------------------------------------
const BUILDING_TEMPLATES = {
  // ==================== CHẶNG 1: KHÁI LUẬN CCXH & CCXH-GC ====================
  bldg_ccxh_central: {
    id: "bldg_ccxh_central",
    name: "TRUNG TÂM KHẢO SÁT CƠ CẤU XÃ HỘI",
    sub: "Viện Hàn Lâm Khoa Học Xã Hội - Trạm Trung Tâm",
    icon: "🏛️",
    actionLabel: "Khảo sát hệ thống CCXH",
    type: "academy",
    themeColor: "#0f766e",
    accentColor: "#2dd4bf",
  },
  bldg_demographics: {
    id: "bldg_demographics",
    name: "VIỆN DÂN CƯ & LAO ĐỘNG NGHỀ NGHIỆP",
    sub: "Thống Kê Cơ Cấu Dân Cư & Biến Động Nghề Nghiệp",
    icon: "👥",
    actionLabel: "Khảo sát dân cư & nghề",
    type: "demographics",
    themeColor: "#0369a1",
    accentColor: "#38bdf8",
  },
  bldg_production_means: {
    id: "bldg_production_means",
    name: "CƠ QUAN QUẢN LÝ TƯ LIỆU SẢN XUẤT",
    sub: "Giám Sát Quan Hệ Sở Hữu & Quản Lý Lao Động",
    icon: "⚙️",
    actionLabel: "Kiểm tra quan hệ TLSX",
    type: "production",
    themeColor: "#b45309",
    accentColor: "#fbbf24",
  },
  bldg_benefit_distribution: {
    id: "bldg_benefit_distribution",
    name: "TRUNG TÂM PHÂN PHỐI LỢI ÍCH & AN SINH",
    sub: "Địa Vị Chính Trị - Xã Hội & Phân Phối Thu Nhập",
    icon: "⚖️",
    actionLabel: "Khảo sát phân phối an sinh",
    type: "distribution",
    themeColor: "#15803d",
    accentColor: "#4ade80",
  },
  bldg_social_management: {
    id: "bldg_social_management",
    name: "TÒA NHÀ TỔ CHỨC QUẢN LÝ XÃ HỘI",
    sub: "Quan Hệ Điều Hành & Tổ Chức Lao Động Xã Hội",
    icon: "📋",
    actionLabel: "Khảo sát quản lý",
    type: "management",
    themeColor: "#0284c7",
    accentColor: "#38bdf8",
  },

  // ==================== CHẶNG 2: VỊ TRÍ CCXH-GC & TÁC ĐỘNG TƯƠNG HỖ ====================
  bldg_class_relations: {
    id: "bldg_class_relations",
    name: "VIỆN QUAN HỆ GIAI TẦNG & ĐẠI ĐOÀN KẾT",
    sub: "Vị Trí Trung Tâm Chi Phối Cơ Cấu Xã Hội",
    icon: "🏛️",
    actionLabel: "Khảo sát vị trí CCXH-GC",
    type: "unity",
    themeColor: "#b91c1c",
    accentColor: "#f87171",
  },
  bldg_ethnic_board: {
    id: "bldg_ethnic_board",
    name: "CƠ QUAN BAN DÂN TỘC TRUNG ƯƠNG",
    sub: "Đoàn Kết 54 Dân Tộc & Tác Động Tương Hỗ",
    icon: "🏔️",
    actionLabel: "Khảo sát cơ cấu dân tộc",
    type: "ethnic",
    themeColor: "#c2410c",
    accentColor: "#fb923c",
  },
  bldg_religious_board: {
    id: "bldg_religious_board",
    name: "TÒA NHÀ TÔN GIÁO & ĐỜI SỐNG TÂM LINH",
    sub: "Tôn Trọng Tín Ngưỡng & Hòa Hợp Xã Hội",
    icon: "🕊️",
    actionLabel: "Khảo sát cơ cấu tôn giáo",
    type: "religion",
    themeColor: "#7c3aed",
    accentColor: "#c084fc",
  },
  bldg_political_economy: {
    id: "bldg_political_economy",
    name: "VIỆN KINH TẾ - CHÍNH TRỊ TRUNG ƯƠNG",
    sub: "Giai Cấp Gắn Với Sở Hữu TLSX & Kinh Tế",
    icon: "🏢",
    actionLabel: "Phân tích nền tảng kinh tế",
    type: "pol_econ",
    themeColor: "#0e7490",
    accentColor: "#22d3ee",
  },

  // ==================== CHẶNG 3: QUY LUẬT BIẾN ĐỔI & LIÊN MINH GIAI CẤP ====================
  bldg_alliance_hall: {
    id: "bldg_alliance_hall",
    name: "HỘI TRƯỜNG LIÊN MINH GIAI CẤP CHIẾN LƯỢC",
    sub: "Hội Nghị Biểu Quyết Chiến Lược Liên Minh",
    icon: "🤝",
    actionLabel: "Hội nghị biểu quyết",
    type: "alliance_hall",
    themeColor: "#dc2626",
    accentColor: "#facc15",
  },
  bldg_hightech_industry: {
    id: "bldg_hightech_industry",
    name: "TỔ HỢP CÔNG NGHIỆP CÔNG NGHỆ CAO",
    sub: "Giai Cấp Công Nhân Tiên Phong Hiện Đại Hóa",
    icon: "🏭",
    actionLabel: "Khảo sát công nghiệp 4.0",
    type: "industry_tech",
    themeColor: "#1d4ed8",
    accentColor: "#60a5fa",
  },
  bldg_eco_agriculture: {
    id: "bldg_eco_agriculture",
    name: "VÙNG NÔNG NGHIỆP SINH THÁI HIỆN ĐẠI",
    sub: "Giai Cấp Nông Dân & Nông Thôn Văn Minh",
    icon: "🌾",
    actionLabel: "Khảo sát nông nghiệp số",
    type: "eco_agri",
    themeColor: "#16a34a",
    accentColor: "#86efac",
  },
  bldg_innovation_hub: {
    id: "bldg_innovation_hub",
    name: "TRUNG TÂM ĐỔI MỚI SÁNG TẠO QUỐC GIA",
    sub: "Đội Ngũ Trí Thức & Kinh Tế Tri Thức Số",
    icon: "💡",
    actionLabel: "Khảo sát kinh tế tri thức",
    type: "innovation",
    themeColor: "#9333ea",
    accentColor: "#d8b4fe",
  },
  bldg_enterprise_center: {
    id: "bldg_enterprise_center",
    name: "TÒA NHÀ DOANH NHÂN & DOANH NGHIỆP",
    sub: "Đội Ngũ Doanh Nhân & Kinh Tế Đa Thành Phần",
    icon: "🏢",
    actionLabel: "Khảo sát tầng lớp doanh nhân",
    type: "enterprise",
    themeColor: "#d97706",
    accentColor: "#fde047",
  },

  // Backward-compatibility aliases
  bldg_doan_xa: { id: "bldg_doan_xa", name: "TRUNG TÂM KHẢO SÁT CƠ CẤU XÃ HỘI", sub: "Viện Hàn Lâm Khoa Học Xã Hội", icon: "🏛️", actionLabel: "Khảo sát", type: "academy", themeColor: "#0f766e", accentColor: "#2dd4bf" },
  bldg_rice_field: { id: "bldg_rice_field", name: "VIỆN DÂN CƯ & LAO ĐỘNG NGHỀ NGHIỆP", sub: "Thống Kê Cơ Cấu Dân Cư & Nghề", icon: "👥", actionLabel: "Khảo sát", type: "demographics", themeColor: "#0369a1", accentColor: "#38bdf8" },
  bldg_granary: { id: "bldg_granary", name: "CƠ QUAN QUẢN LÝ TƯ LIỆU SẢN XUẤT", sub: "Quan Hệ Sở Hữu TLSX", icon: "⚙️", actionLabel: "Kiểm kê", type: "production", themeColor: "#b45309", accentColor: "#fbbf24" },
  bldg_tractor: { id: "bldg_tractor", name: "TRUNG TÂM PHÂN PHỐI LỢI ÍCH", sub: "Địa Vị Xã Hội & An Sinh", icon: "⚖️", actionLabel: "Kiểm tra", type: "distribution", themeColor: "#15803d", accentColor: "#4ade80" },
  bldg_thanh_cong: { id: "bldg_thanh_cong", name: "VIỆN QUAN HỆ GIAI TẦNG & ĐẠI ĐOÀN KẾT", sub: "Vị Trí Trung Tâm Chi Phối", icon: "🏛️", actionLabel: "Khảo sát", type: "unity", themeColor: "#b91c1c", accentColor: "#f87171" },
  bldg_yarn_warehouse: { id: "bldg_yarn_warehouse", name: "CƠ QUAN BAN DÂN TỘC TRUNG ƯƠNG", sub: "Đoàn Kết Các Dân Tộc", icon: "🏔️", actionLabel: "Khảo sát", type: "ethnic", themeColor: "#c2410c", accentColor: "#fb923c" },
  bldg_port: { id: "bldg_port", name: "TÒA NHÀ TÔN GIÁO & ĐỜI SỐNG TÂM LINH", sub: "Tín Ngưỡng & Xã Hội", icon: "🕊️", actionLabel: "Khảo sát", type: "religion", themeColor: "#7c3aed", accentColor: "#c084fc" },
  bldg_director_office: { id: "bldg_director_office", name: "VIỆN KINH TẾ - CHÍNH TRỊ TRUNG ƯƠNG", sub: "Cơ Sở Kinh Tế & Địa Vị Xã Hội", icon: "🏢", actionLabel: "Đối thoại", type: "pol_econ", themeColor: "#0e7490", accentColor: "#22d3ee" },
  bldg_tw_survey: { id: "bldg_tw_survey", name: "HỘI TRƯỜNG LIÊN MINH GIAI CẤP", sub: "Chiến Lược Liên Minh", icon: "🤝", actionLabel: "Biểu quyết", type: "alliance_hall", themeColor: "#dc2626", accentColor: "#facc15" },
  bldg_long_an_gov: { id: "bldg_long_an_gov", name: "TỔ HỢP CÔNG NGHIỆP CÔNG NGHỆ CAO", sub: "Công Nhân Hiện Đại Hóa", icon: "🏭", actionLabel: "Khảo sát", type: "industry_tech", themeColor: "#1d4ed8", accentColor: "#60a5fa" },
  bldg_rice_market: { id: "bldg_rice_market", name: "VÙNG NÔNG NGHIỆP SINH THÁI", sub: "Nông Dân & Nông Thôn Văn Minh", icon: "🌾", actionLabel: "Khảo sát", type: "eco_agri", themeColor: "#16a34a", accentColor: "#86efac" },
  bldg_river_port: { id: "bldg_river_port", name: "TRUNG TÂM ĐỔI MỚI SÁNG TẠO", sub: "Trí Thức & Kinh Tế Tri Thức", icon: "💡", actionLabel: "Khảo sát", type: "innovation", themeColor: "#9333ea", accentColor: "#d8b4fe" },
  bldg_policy_hall: { id: "bldg_policy_hall", name: "HỘI TRƯỜNG LIÊN MINH GIAI CẤP", sub: "Hội Nghị Chiến Lược", icon: "🤝", actionLabel: "Biểu quyết", type: "alliance_hall", themeColor: "#dc2626", accentColor: "#facc15" },
  bldg_planning_committee: { id: "bldg_planning_committee", name: "TỔ HỢP CÔNG NGHIỆP CÔNG NGHỆ CAO", sub: "Công Nhân Tiên Phong", icon: "🏭", actionLabel: "Khảo sát", type: "industry_tech", themeColor: "#1d4ed8", accentColor: "#60a5fa" },
  bldg_econ_institute: { id: "bldg_econ_institute", name: "TRUNG TÂM ĐỔI MỚI SÁNG TẠO", sub: "Trí Thức Số", icon: "💡", actionLabel: "Khảo sát", type: "innovation", themeColor: "#9333ea", accentColor: "#d8b4fe" },
  bldg_monument: { id: "bldg_monument", name: "TÒA NHÀ DOANH NHÂN & DOANH NGHIỆP", sub: "Doanh Nhân Năng Động", icon: "🏢", actionLabel: "Khảo sát", type: "enterprise", themeColor: "#d97706", accentColor: "#fde047" },
};

// ----------------------------------------------------
// BẢN ĐỒ 3 CHẶNG CHƯƠNG 5 (KHÁI LUẬN, VỊ TRÍ, LIÊN MINH)
// ----------------------------------------------------
const PHASE_MAPS = {
  phase_1: {
    name: "TRUNG TÂM KHẢO SÁT CƠ CẤU XÃ HỘI (CHẶNG 1)",
    theme: "ccxh_academy",
    groundColor: "#0f172a",
    roadColor: "#1e293b",
    laneColor: "#38bdf8",
    // Layout: "Học viện" — 1 tòa chính giữa phía Bắc + 4 tòa phụ ở 4 góc
    buildings: [
      { id: "bldg_ccxh_central",        x: 1200, y: 260,  w: 620, h: 280, stationX: 1200, stationY: 380, radius: 95 },
      { id: "bldg_demographics",         x: 280,  y: 280,  w: 380, h: 240, stationX: 280,  stationY: 380, radius: 80 },
      { id: "bldg_benefit_distribution", x: 2120, y: 280,  w: 380, h: 240, stationX: 2120, stationY: 380, radius: 80 },
      { id: "bldg_production_means",     x: 280,  y: 1100, w: 380, h: 260, stationX: 280,  stationY: 990, radius: 80 },
      { id: "bldg_social_management",    x: 1200, y: 1100, w: 520, h: 260, stationX: 1200, stationY: 990, radius: 85 },
      { id: "bldg_benefit_distribution", x: 2120, y: 1100, w: 380, h: 260, stationX: 2120, stationY: 990, radius: 80 },
    ],
  },
  phase_2: {
    name: "VIỆN QUAN HỆ GIAI TẦNG & KHỐI ĐẠI ĐOÀN KẾT (CHẶNG 2)",
    theme: "unity_center",
    groundColor: "#2b0f12",
    roadColor: "#450a0a",
    laneColor: "#facc15",
    // Layout: "Quảng trường" — 2 tòa lớn hai bên trục chính + 4 tòa nhỏ rải rác
    buildings: [
      { id: "bldg_class_relations",  x: 700,  y: 280,  w: 540, h: 260, stationX: 700,  stationY: 390, radius: 90 },
      { id: "bldg_ethnic_board",     x: 1700, y: 280,  w: 540, h: 260, stationX: 1700, stationY: 390, radius: 90 },
      { id: "bldg_religious_board",  x: 200,  y: 240,  w: 280, h: 220, stationX: 200,  stationY: 330, radius: 70 },
      { id: "bldg_political_economy",x: 2200, y: 240,  w: 280, h: 220, stationX: 2200, stationY: 330, radius: 70 },
      { id: "bldg_ethnic_board",     x: 500,  y: 1100, w: 440, h: 260, stationX: 500,  stationY: 990, radius: 80 },
      { id: "bldg_religious_board",  x: 1900, y: 1100, w: 440, h: 260, stationX: 1900, stationY: 990, radius: 80 },
    ],
  },
  phase_3: {
    name: "QUẢNG TRƯỜNG LIÊN MINH GIAI CẤP & ĐỔI MỚI SÁNG TẠO (CHẶNG 3)",
    theme: "alliance_metro",
    groundColor: "#022c22",
    roadColor: "#0f172a",
    laneColor: "#10b981",
    // Layout: "Siêu Đô Thị CNH-HĐH" — 3 cột x 2 tầng cân đối hoàn hảo, tách biệt trục đại lộ
    buildings: [
      { id: "bldg_hightech_industry", x: 275,  y: 280,  w: 360, h: 240, stationX: 275,  stationY: 410, radius: 80 },
      { id: "bldg_alliance_hall",     x: 1200, y: 250,  w: 640, h: 280, stationX: 1200, stationY: 390, radius: 95 },
      { id: "bldg_eco_agriculture",   x: 2125, y: 280,  w: 360, h: 240, stationX: 2125, stationY: 410, radius: 80 },
      { id: "bldg_innovation_hub",    x: 275,  y: 1080, w: 360, h: 260, stationX: 275,  stationY: 960, radius: 80 },
      { id: "bldg_enterprise_center", x: 1200, y: 1080, w: 560, h: 260, stationX: 1200, stationY: 960, radius: 85 },
      { id: "bldg_political_economy", x: 2125, y: 1080, w: 360, h: 260, stationX: 2125, stationY: 960, radius: 80 },
    ],
  },
  phase_4: {
    name: "QUẢNG TRƯỜNG LIÊN MINH GIAI CẤP & ĐỔI MỚI SÁNG TẠO (CHẶNG 3)",
    theme: "alliance_metro",
    groundColor: "#022c22",
    roadColor: "#0f172a",
    laneColor: "#10b981",
    buildings: [
      { id: "bldg_hightech_industry", x: 275,  y: 280,  w: 360, h: 240, stationX: 275,  stationY: 410, radius: 80 },
      { id: "bldg_alliance_hall",     x: 1200, y: 250,  w: 640, h: 280, stationX: 1200, stationY: 390, radius: 95 },
      { id: "bldg_eco_agriculture",   x: 2125, y: 280,  w: 360, h: 240, stationX: 2125, stationY: 410, radius: 80 },
      { id: "bldg_innovation_hub",    x: 275,  y: 1080, w: 360, h: 260, stationX: 275,  stationY: 960, radius: 80 },
      { id: "bldg_enterprise_center", x: 1200, y: 1080, w: 560, h: 260, stationX: 1200, stationY: 960, radius: 85 },
      { id: "bldg_political_economy", x: 2125, y: 1080, w: 360, h: 260, stationX: 2125, stationY: 960, radius: 80 },
    ],
  },
};

function getActivePhaseKey() {
  if (state.phase === "phase_2" || state.phase === "situation_2") return "phase_2";
  if (state.phase === "phase_3" || state.phase === "phase_4" || state.phase === "finished") return "phase_3";
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
  // ==================== CHẶNG 1: KHÁI LUẬN CCXH & CCXH-GC ====================
  bldg_demographics: {
    questKey: "bldg_demographics",
    title: "Chuyển Giao Dữ Liệu Dân Cư & Nghề Nghiệp",
    icon: "📊",
    color: "#38bdf8",
    steps: [
      {
        bldgId: "bldg_ccxh_central",
        instruction: "Chuyển giao báo cáo biến động cơ cấu dân cư & nghề nghiệp về Trung Tâm Khảo Sát",
        actionText: "Bàn giao dữ liệu dân cư",
      },
    ],
  },
  bldg_production_means: {
    questKey: "bldg_production_means",
    title: "Hồ Sơ Quan Hệ Sở Hữu & TLSX",
    icon: "⚙️",
    color: "#f59e0b",
    steps: [
      {
        bldgId: "bldg_ccxh_central",
        instruction: "Chuyển hồ sơ giám sát quan hệ sở hữu tư liệu sản xuất về Trung Tâm Khảo Sát",
        actionText: "Nộp hồ sơ sở hữu TLSX",
      },
    ],
  },
  bldg_benefit_distribution: {
    questKey: "bldg_benefit_distribution",
    title: "Phương Án Phân Phối Lợi Ích & An Sinh",
    icon: "⚖️",
    color: "#10b981",
    steps: [
      {
        bldgId: "bldg_demographics",
        instruction: "Chuyển phương án phân phối thu nhập và an sinh xã hội sang Viện Dân Cư & Lao Động",
        actionText: "Chuyển giao phương án an sinh",
      },
    ],
  },

  // ==================== CHẶNG 2: VỊ TRÍ CCXH-GC & TÁC ĐỘNG TƯƠNG HỖ ====================
  bldg_ethnic_board: {
    questKey: "bldg_ethnic_board",
    title: "Báo Cáo Cơ Cấu Dân Tộc & Đoàn Kết Xã Hội",
    icon: "🏔️",
    color: "#fb923c",
    steps: [
      {
        bldgId: "bldg_class_relations",
        instruction: "Chuyển báo cáo tác động biện chứng giữa giai tầng và 54 dân tộc về Viện Quan Hệ Giai Tầng",
        actionText: "Nộp báo cáo dân tộc",
      },
    ],
  },
  bldg_religious_board: {
    questKey: "bldg_religious_board",
    title: "Tư Liệu Tôn Giáo & Đời Sống Tâm Linh",
    icon: "🕊️",
    color: "#c084fc",
    steps: [
      {
        bldgId: "bldg_class_relations",
        instruction: "Chuyển tư liệu chính sách tự do tín ngưỡng và hòa hợp giai tầng về Viện Quan Hệ Giai Tầng",
        actionText: "Nộp tư liệu tôn giáo",
      },
    ],
  },
  bldg_political_economy: {
    questKey: "bldg_political_economy",
    title: "Luận Điểm Vị Trí Trung Tâm Của CCXH-GC",
    icon: "🏢",
    color: "#22d3ee",
    steps: [
      {
        bldgId: "bldg_class_relations",
        instruction: "Chuyển bản phân tích vị trí hàng đầu chi phối của cơ cấu giai cấp về Viện Quan Hệ Giai Tầng",
        actionText: "Trình luận điểm vị trí trung tâm",
      },
    ],
  },

  // ==================== CHẶNG 3: QUY LUẬT BIẾN ĐỔI & LIÊN MINH GIAI CẤP ====================
  bldg_hightech_industry: {
    questKey: "bldg_hightech_industry",
    title: "Kế Hoạch Tiên Phong CNH - HĐH (Công Nhân)",
    icon: "🏭",
    color: "#60a5fa",
    steps: [
      {
        bldgId: "bldg_alliance_hall",
        instruction: "Chuyển dự thảo vai trò tiên phong của Giai cấp Công nhân lên Hội Trường Liên Minh",
        actionText: "Đệ trình kế hoạch công nhân",
      },
    ],
  },
  bldg_eco_agriculture: {
    questKey: "bldg_eco_agriculture",
    title: "Chiến Lược Nông Nghiệp Sinh Thái (Nông Dân)",
    icon: "🌾",
    color: "#4ade80",
    steps: [
      {
        bldgId: "bldg_alliance_hall",
        instruction: "Chuyển đề án phát triển nông nghiệp sinh thái hiện đại của Giai cấp Nông dân lên Hội Trường",
        actionText: "Đệ trình chiến lược nông dân",
      },
    ],
  },
  bldg_innovation_hub: {
    questKey: "bldg_innovation_hub",
    title: "Đề Án Kinh Tế Tri Thức Số (Trí Thức)",
    icon: "💡",
    color: "#d8b4fe",
    steps: [
      {
        bldgId: "bldg_alliance_hall",
        instruction: "Chuyển đề án phát triển kinh tế số & đổi mới sáng tạo của Đội ngũ Trí thức lên Hội Trường",
        actionText: "Đệ trình đề án trí thức",
      },
    ],
  },
  bldg_enterprise_center: {
    questKey: "bldg_enterprise_center",
    title: "Bản Cam Kết Đổi Mới Của Đội Ngũ Doanh Nhân",
    icon: "🏢",
    color: "#fde047",
    steps: [
      {
        bldgId: "bldg_alliance_hall",
        instruction: "Chuyển cam kết đầu tư và liên kết của Tầng lớp Doanh nhân mới lên Hội Trường Liên Minh",
        actionText: "Đệ trình cam kết doanh nhân",
      },
    ],
  },

  // Backward-compatibility quest aliases
  bldg_rice_field: { questKey: "bldg_rice_field", title: "Khảo Sát Dân Cư & Nghề Nghiệp", icon: "👥", color: "#38bdf8", steps: [{ bldgId: "bldg_doan_xa", instruction: "Chuyển hồ sơ cơ cấu dân cư về Trung Tâm Khảo Sát", actionText: "Giao hồ sơ" }] },
  bldg_tractor: { questKey: "bldg_tractor", title: "Giám Sát Tư Liệu Sản Xuất", icon: "⚙️", color: "#f59e0b", steps: [{ bldgId: "bldg_doan_xa", instruction: "Chuyển hồ sơ sở hữu tư liệu sản xuất về Trung Tâm Khảo Sát", actionText: "Nộp hồ sơ" }] },
  bldg_granary: { questKey: "bldg_granary", title: "Phân Phối Lợi Ích & An Sinh", icon: "⚖️", color: "#10b981", steps: [{ bldgId: "bldg_doan_xa", instruction: "Chuyển phương án phân phối an sinh về Trung Tâm", actionText: "Giao phương án" }] },
  bldg_port: { questKey: "bldg_port", title: "Báo Cáo Tôn Giáo & Đoàn Kết", icon: "🕊️", color: "#c084fc", steps: [{ bldgId: "bldg_thanh_cong", instruction: "Chuyển báo cáo hòa hợp giai tầng về Viện Quan Hệ", actionText: "Nộp báo cáo" }] },
  bldg_director_office: { questKey: "bldg_director_office", title: "Phân Tích Cơ Sở Kinh Tế", icon: "🏢", color: "#22d3ee", steps: [{ bldgId: "bldg_thanh_cong", instruction: "Chuyển luận cứ kinh tế chính trị về Viện Quan Hệ", actionText: "Trình luận cứ" }] },
  bldg_yarn_warehouse: { questKey: "bldg_yarn_warehouse", title: "Hồ Sơ 54 Dân Tộc", icon: "🏔️", color: "#fb923c", steps: [{ bldgId: "bldg_thanh_cong", instruction: "Chuyển dữ liệu dân tộc về Viện Quan Hệ Giai Tầng", actionText: "Giao dữ liệu" }] },
  bldg_rice_market: { questKey: "bldg_rice_market", title: "Kế Hoạch Nông Dân Chiến Lược", icon: "🌾", color: "#4ade80", steps: [{ bldgId: "bldg_tw_survey", instruction: "Chuyển dự thảo nông dân lên Hội Trường Liên Minh", actionText: "Trình dự thảo" }] },
  bldg_river_port: { questKey: "bldg_river_port", title: "Đề Án Trí Thức Sáng Tạo", icon: "💡", color: "#d8b4fe", steps: [{ bldgId: "bldg_tw_survey", instruction: "Chuyển đề án trí thức lên Hội Trường Liên Minh", actionText: "Trình đề án" }] },
  bldg_long_an_gov: { questKey: "bldg_long_an_gov", title: "Kế Hoạch Công Nhân Tiên Phong", icon: "🏭", color: "#60a5fa", steps: [{ bldgId: "bldg_tw_survey", instruction: "Chuyển kế hoạch công nhân lên Hội Trường Liên Minh", actionText: "Trình kế hoạch" }] },
  bldg_policy_hall: { questKey: "bldg_policy_hall", title: "Văn Kiện Liên Minh Toàn Thể", icon: "🤝", color: "#facc15", steps: [{ bldgId: "bldg_alliance_hall", instruction: "Bàn giao biểu quyết lên Hội Trường", actionText: "Biểu quyết" }] },
};

// ----------------------------------------------------
// CITIZENS IN NEED THEMATIC MISSIONS (HỖ TRỢ ĐỒNG BÀO THỰC ĐỊA)
// ----------------------------------------------------
const HISTORICAL_CITIZENS_CONFIG = {
  phase_1: [
    {
      id: "citizen_p1_1",
      name: "Điều Tra Viên Thống Kê",
      sub: "Cần bảng hướng dẫn phân loại cơ cấu xã hội",
      x: 1620,
      y: 840,
      needText: "Xin mẫu phân loại các loại hình cơ cấu: dân cư, nghề nghiệp, giai cấp!",
      resolvedText: "Đã cung cấp bộ tiêu chuẩn khảo sát 5 loại hình cơ cấu xã hội (+8đ)!",
      scoreDelta: 8,
    },
  ],
  phase_2: [
    {
      id: "citizen_p2_1",
      name: "Đại Biểu Đồng Bào Dân Tộc",
      sub: "Cần tài liệu chính sách khối đại đoàn kết toàn dân",
      x: 820,
      y: 840,
      needText: "Xin tài liệu định hướng gắn kết giai cấp với cơ cấu dân tộc, tôn giáo!",
      resolvedText: "Đã trao tài liệu định hướng gắn kết giai tầng và khối đại đoàn kết (+8đ)!",
      scoreDelta: 8,
    },
  ],
  phase_3: [
    {
      id: "citizen_p3_1",
      name: "Kỹ Sư Công Nghệ Trẻ",
      sub: "Cần kết nối sáng tạo với công đoàn và nông hội",
      x: 1620,
      y: 840,
      needText: "Xin nghị quyết liên minh công nhân - nông dân - trí thức và doanh nhân!",
      resolvedText: "Đã chuyển giao chương trình hợp tác liên minh đa tầng lớp (+8đ)!",
      scoreDelta: 8,
    },
  ],
  phase_4: [
    {
      id: "citizen_p4_1",
      name: "Kỹ Sư Công Nghệ Trẻ",
      sub: "Cần kết nối sáng tạo với công đoàn và nông hội",
      x: 1620,
      y: 840,
      needText: "Xin nghị quyết liên minh công nhân - nông dân - trí thức và doanh nhân!",
      resolvedText: "Đã chuyển giao chương trình hợp tác liên minh đa tầng lớp (+8đ)!",
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
// DEDICATED CHAPTER 5 THEMATIC COLLECTIBLE SPAWNS
// ----------------------------------------------------
const movingHazardsState = new Map();


// ----------------------------------------------------
// CHAPTER 5 EXPERTS & NPCS BY PHASE
// ----------------------------------------------------
const HISTORICAL_NPCS_DATA = {
  phase_1: [
    {
      id: "npc_p1_theorist",
      name: "GS. Nguyễn Văn An",
      sub: "Lý luận Xã hội học Mác - Lênin",
      icon: "📚",
      avatarColor: "#0284c7",
      gender: "male",
      x: 600,
      y: 520,
      radius: 24,
    },
    {
      id: "npc_p1_statistician",
      name: "Chuyên Viên Thống Kê",
      sub: "Nghiên cứu Khảo sát Giai tầng",
      icon: "📊",
      avatarColor: "#15803d",
      gender: "male",
      x: 1480,
      y: 520,
      radius: 24,
    },
  ],
  phase_2: [
    {
      id: "npc_p2_moderator",
      name: "Ban Dân Tộc - Tôn Giáo",
      sub: "Chính sách Đại đoàn kết TW",
      icon: "🤝",
      avatarColor: "#b91c1c",
      gender: "male",
      x: 600,
      y: 520,
      radius: 24,
    },
    {
      id: "npc_p2_theorist_note",
      name: "Chuyên Gia Phương Pháp Luận",
      sub: "Hội đồng Lý luận TW",
      icon: "⚖️",
      avatarColor: "#d97706",
      gender: "male",
      x: 1480,
      y: 520,
      radius: 24,
    },
  ],
  phase_3: [
    {
      id: "npc_p3_union_leader",
      name: "Đại Biểu Công Đoàn CNH",
      sub: "Tiên phong Công nhân CNH",
      icon: "⚙️",
      avatarColor: "#0284c7",
      gender: "male",
      x: 470,
      y: 520,
      radius: 24,
    },
    {
      id: "npc_p3_innovator",
      name: "TS. Lê Thị Mai Lan",
      sub: "Kinh tế tri thức & Đổi mới",
      icon: "💡",
      avatarColor: "#7c3aed",
      gender: "female",
      x: 1480,
      y: 520,
      radius: 24,
    },
  ],
  phase_4: [
    {
      id: "npc_p3_union_leader",
      name: "Đại Biểu Công Đoàn CNH",
      sub: "Tiên phong Công nhân CNH",
      icon: "⚙️",
      avatarColor: "#0284c7",
      gender: "male",
      x: 470,
      y: 520,
      radius: 24,
    },
    {
      id: "npc_p3_innovator",
      name: "TS. Lê Thị Mai Lan",
      sub: "Kinh tế tri thức & Đổi mới",
      icon: "💡",
      avatarColor: "#7c3aed",
      gender: "female",
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
    // 📊 HỒ SƠ KHẢO SÁT CƠ CẤU XÃ HỘI (PHASE 1)
    { id: "p1_ccxh_1", type: "ccxh_survey_data", label: "Hồ Sơ CCXH", x: 380, y: 440, message: "📊 Thu thập dữ liệu Cơ cấu xã hội - Dân cư! (+2đ)" },
    { id: "p1_ccxh_2", type: "ccxh_survey_data", label: "Hồ Sơ CCXH", x: 750, y: 440, message: "📊 Dữ liệu Cơ cấu xã hội - Dân tộc & Tôn giáo! (+2đ)" },
    { id: "p1_ccxh_3", type: "ccxh_survey_data", label: "Hồ Sơ CCXH", x: 1200, y: 440, message: "📊 Khảo sát Cơ cấu xã hội - Giai cấp cốt lõi! (+2đ)" },
    { id: "p1_ccxh_4", type: "ccxh_survey_data", label: "Hồ Sơ CCXH", x: 1650, y: 440, message: "📊 Tài liệu Địa vị kinh tế - xã hội của các tập đoàn! (+2đ)" },
    { id: "p1_ccxh_5", type: "ccxh_survey_data", label: "Hồ Sơ CCXH", x: 2020, y: 440, message: "📊 Báo cáo Quan hệ sở hữu Tư liệu sản xuất! (+2đ)" },
    { id: "p1_ccxh_6", type: "ccxh_survey_data", label: "Hồ Sơ CCXH", x: 750, y: 700, message: "📊 Phân tích Vai trò trong tổ chức lao động xã hội! (+2đ)" },
    { id: "p1_ccxh_7", type: "ccxh_survey_data", label: "Hồ Sơ CCXH", x: 1650, y: 700, message: "📊 Dữ liệu Hình thức & Quy mô phân phối lợi ích! (+2đ)" },
    { id: "p1_ccxh_8", type: "ccxh_survey_data", label: "Hồ Sơ CCXH", x: 380, y: 920, message: "📊 Hồ sơ Cơ cấu xã hội - Nghề nghiệp đa dạng! (+2đ)" },
    { id: "p1_ccxh_9", type: "ccxh_survey_data", label: "Hồ Sơ CCXH", x: 1200, y: 920, message: "📊 Xu hướng xích lại gần nhau giữa các giai tầng! (+2đ)" },
    { id: "p1_ccxh_10", type: "ccxh_survey_data", label: "Hồ Sơ CCXH", x: 2020, y: 920, message: "📊 Dữ liệu Khảo sát thực tiễn Cơ cấu xã hội hoàn tất! (+2đ)" },
  ],
  phase_2: [
    // 📜 TÀI LIỆU BIẾN ĐỔI CCXH-GC (PHASE 2)
    { id: "p2_doc_1", type: "class_structure_doc", label: "Biến Đổi CCXH", x: 380, y: 440, message: "📜 Dữ liệu Giai cấp Công nhân - lực lượng tiên phong! (+2đ)" },
    { id: "p2_doc_2", type: "class_structure_doc", label: "Biến Đổi CCXH", x: 750, y: 440, message: "📜 Dữ liệu Giai cấp Nông dân - chủ thể nông nghiệp & NTM! (+2đ)" },
    { id: "p2_doc_3", type: "class_structure_doc", label: "Biến Đổi CCXH", x: 1200, y: 440, message: "📜 Dữ liệu Đội ngũ Trí thức - nguồn lực kinh tế tri thức! (+2đ)" },
    { id: "p2_doc_4", type: "class_structure_doc", label: "Biến Đổi CCXH", x: 1650, y: 440, message: "📜 Dữ liệu Đội ngũ Doanh nhân - phát triển kinh tế bền vững! (+2đ)" },
    { id: "p2_doc_5", type: "class_structure_doc", label: "Biến Đổi CCXH", x: 2020, y: 440, message: "📜 Dữ liệu Đội ngũ Thanh niên - rường cột nước nhà! (+2đ)" },
    { id: "p2_doc_6", type: "class_structure_doc", label: "Biến Đổi CCXH", x: 750, y: 700, message: "📜 Dữ liệu Đội ngũ Phụ nữ - bình đẳng và tiến bộ xã hội! (+2đ)" },
    { id: "p2_doc_7", type: "class_structure_doc", label: "Biến Đổi CCXH", x: 1650, y: 700, message: "📜 Báo cáo Biến đổi CCXH gắn với kinh tế nhiều thành phần! (+2đ)" },
    { id: "p2_doc_8", type: "class_structure_doc", label: "Biến Đổi CCXH", x: 380, y: 920, message: "📜 Dữ liệu Tính quy luật trong biến đổi cơ cấu xã hội! (+2đ)" },
    { id: "p2_doc_9", type: "class_structure_doc", label: "Biến Đổi CCXH", x: 1200, y: 920, message: "📜 Báo cáo Mức độ phân hóa xã hội và định hướng tiến bộ! (+2đ)" },
    { id: "p2_doc_10", type: "class_structure_doc", label: "Biến Đổi CCXH", x: 2020, y: 920, message: "📜 Tổng hợp Biến đổi cơ cấu xã hội - giai cấp Việt Nam! (+2đ)" },
  ],
  phase_3: [
    // ⭐ VĂN KIỆN LIÊN MINH GIAI CẤP, TẦNG LỚP (PHASE 3)
    { id: "p3_all_1", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 275, y: 460, message: "⭐ Nội dung Chính trị: Giữ vững vai trò lãnh đạo của Đảng! (+2đ)" },
    { id: "p3_all_2", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 610, y: 440, message: "⭐ Xây dựng Nhà nước pháp quyền XHCN của Nhân dân! (+2đ)" },
    { id: "p3_all_3", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 1200, y: 460, message: "⭐ Nội dung Kinh tế: Cơ sở vững chắc nhất của khối liên minh! (+2đ)" },
    { id: "p3_all_4", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 1790, y: 440, message: "⭐ Hợp tác Công nghiệp - Nông nghiệp - Dịch vụ - KHCN! (+2đ)" },
    { id: "p3_all_5", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 2125, y: 460, message: "⭐ Kết hợp hài hòa các quan hệ lợi ích kinh tế! (+2đ)" },
    { id: "p3_all_6", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 320, y: 670, message: "⭐ Nội dung Văn hóa: Nền văn hóa tiên tiến, đậm đà bản sắc! (+2đ)" },
    { id: "p3_all_7", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 1200, y: 670, message: "⭐ Nội dung Xã hội: An sinh xã hội, giảm nghèo bền vững! (+2đ)" },
    { id: "p3_all_8", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 2080, y: 670, message: "⭐ Phương hướng: Đẩy mạnh CNH-HĐH gắn với kinh tế tri thức! (+2đ)" },
    { id: "p3_all_9", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 275, y: 890, message: "⭐ Phương hướng: Hoàn thiện thể chế kinh tế thị trường XHCN! (+2đ)" },
    { id: "p3_all_10", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 1200, y: 890, message: "⭐ Toàn văn: Tăng cường khối đại đoàn kết toàn dân tộc! (+2đ)" },
  ],
  phase_4: [
    // Phase 4 (Đại biểu/Thể chế hóa kế thừa Phase 3)
    { id: "p4_res_1", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 275, y: 460, message: "⭐ Nội dung Chính trị: Bản lĩnh và lập trường giai cấp công nhân! (+2đ)" },
    { id: "p4_res_2", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 610, y: 440, message: "⭐ Cơ sở kinh tế: Thống nhất lợi ích giai cấp và xã hội! (+2đ)" },
    { id: "p4_res_3", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 1200, y: 460, message: "⭐ Đại biểu Trí thức đóng góp sáng kiến KHCN! (+2đ)" },
    { id: "p4_res_4", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 1790, y: 440, message: "⭐ Đại biểu Doanh nhân cam kết đầu tư sản xuất bền vững! (+2đ)" },
    { id: "p4_res_5", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 2125, y: 460, message: "⭐ Đại biểu Nông dân phát triển nông nghiệp công nghệ cao! (+2đ)" },
    { id: "p4_res_6", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 320, y: 670, message: "⭐ Đại biểu Công nhân làm chủ dây chuyền hiện đại! (+2đ)" },
    { id: "p4_res_7", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 1200, y: 670, message: "⭐ Phát huy sức mạnh khối Đại đoàn kết toàn dân tộc! (+2đ)" },
    { id: "p4_res_8", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 2080, y: 670, message: "⭐ Xây dựng hệ thống chính trị trong sạch, vững mạnh! (+2đ)" },
    { id: "p4_res_9", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 275, y: 890, message: "⭐ Văn kiện Đồng thuận toàn diện giữa các giai tầng! (+2đ)" },
    { id: "p4_res_10", type: "alliance_charter", label: "Văn Kiện Liên Minh", x: 1200, y: 890, message: "⭐ Hoàn thành xuất sắc sứ mệnh lịch sử của liên minh! (+2đ)" },
  ],
};

// ----------------------------------------------------
// DYNAMIC PATROLS, HISTORICAL HAZARDS & FREEZE TRAPS ❄️
// ----------------------------------------------------
const PHASE_HAZARDS_CONFIG = {
  phase_1: [
    { id: "h_p1_bias", type: "bias_prejudice", label: "Bẫy Định Kiến Xã Hội", message: "Định kiến sai lệch về cơ cấu giai cấp! (-3đ)", x: 780, y: 700, vx: 80, vy: 35, radius: 22 },
    { id: "h_p1_imbalance", type: "imbalance_dist", label: "Mất Cân Đối Phân Phối", message: "Mất cân đối trong phân phối lợi ích xã hội! (-3đ)", x: 1620, y: 700, vx: -75, vy: -45, radius: 22 },
    { id: "h_p1_freeze", type: "freeze_trap", label: "Bẫy Đóng Băng Giáo Điều", message: "❄️ Bị kẹt trong tư duy giáo điều máy móc 2.5s! (-3đ)", x: 1200, y: 700, vx: 45, vy: 0, radius: 24 },
  ],
  phase_2: [
    { id: "h_p2_divide", type: "class_divide", label: "Bẫy Chia Rẽ Giai Tầng", message: "Âm mưu chia rẽ mối quan hệ giữa các giai tầng! (-3đ)", x: 920, y: 680, vx: 90, vy: 0, radius: 24 },
    { id: "h_p2_polarize", type: "polarization", label: "Phân Hóa Giàu Nghèo", message: "Phân hóa giàu nghèo thiếu kiểm soát! (-3đ)", x: 1480, y: 680, vx: -85, vy: 50, radius: 22 },
    { id: "h_p2_freeze", type: "freeze_trap", label: "Bẫy Cục Bộ Bè Phái", message: "❄️ Tư tưởng cục bộ địa phương làm tê liệt 2.5s! (-3đ)", x: 1200, y: 700, vx: -50, vy: 35, radius: 24 },
  ],
  phase_3: [
    { id: "h_p3_sabotage", type: "alliance_sabotage", label: "Bẫy Phá Hoại Liên Minh", message: "Tư tưởng đối kháng làm suy yếu khối liên minh! (-3đ)", x: 610, y: 380, vx: 0, vy: 65, radius: 24 },
    { id: "h_p3_bureaucracy", type: "bureaucracy", label: "Tệ Quan Liêu Lãng Phí", message: "Tệ quan liêu, xa rời thực tiễn dân sinh! (-3đ)", x: 1790, y: 380, vx: 0, vy: -65, radius: 24 },
    { id: "h_p3_freeze", type: "freeze_trap", label: "Bẫy Trì Trệ Thể Chế", message: "❄️ Trì trệ thể chế làm chậm nhịp độ phát triển 2.5s! (-3đ)", x: 880, y: 670, vx: 55, vy: 0, radius: 24 },
  ],
  phase_4: [
    { id: "h_p4_debate", type: "alliance_sabotage", label: "Nguy Cơ Xa Rời Mục Tiêu", message: "Nguy cơ chệch hướng định hướng XHCN! (-3đ)", x: 610, y: 920, vx: 0, vy: 60, radius: 24 },
    { id: "h_p4_freeze", type: "freeze_trap", label: "Bẫy Đóng Băng Thể Chế", message: "❄️ Chậm trễ hoàn thiện thể chế kinh tế 2.5s! (-3đ)", x: 1520, y: 670, vx: -55, vy: 0, radius: 24 },
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
      // Phase 3: Horizontal Boulevard, West Avenue, East Avenue, or Central Promenade
      const zone = Math.floor(Math.random() * 5);
      if (zone === 0) {
        // Horizontal Expressway
        candidateX = 140 + Math.random() * (MAP_WIDTH - 280);
        candidateY = 630 + Math.random() * 80;
      } else if (zone === 1) {
        // West Vertical Avenue (x = 610)
        candidateX = 610 + (Math.random() - 0.5) * 50;
        candidateY = 160 + Math.random() * 1080;
      } else if (zone === 2) {
        // East Vertical Avenue (x = 1790)
        candidateX = 1790 + (Math.random() - 0.5) * 50;
        candidateY = 160 + Math.random() * 1080;
      } else if (zone === 3) {
        // North Promenade Forecourts
        candidateX = 140 + Math.random() * (MAP_WIDTH - 280);
        candidateY = 430 + Math.random() * 70;
      } else {
        // South Promenade Forecourts
        candidateX = 140 + Math.random() * (MAP_WIDTH - 280);
        candidateY = 870 + Math.random() * 70;
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
    phase_1: "⚡ SỰ KIỆN: Xuất hiện Văn Kiện Cương Lĩnh Đặc Biệt (+10đ)!",
    phase_2: "⚡ SỰ KIỆN: Xuất hiện Báo Cáo Quan Hệ Giai Tầng Đặc Biệt (+10đ)!",
    phase_3: "⚡ SỰ KIỆN: Xuất hiện Nghị Quyết Đại Hội Liên Minh Đặc Biệt (+10đ)!",
    phase_4: "⚡ SỰ KIỆN: Xuất hiện Nghị Quyết Đại Hội Liên Minh Đặc Biệt (+10đ)!",
  };

  const bannerText = crisisTitles[phaseKey] || "⚡ SỰ KIỆN: Xuất hiện Văn Kiện Khẩn Cấp (+10đ)!";
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
      label: "Hòm Văn Kiện Đặc Biệt",
      message: `⭐ Tiếp nhận Văn Kiện Cương Lĩnh Đặc Biệt (+10đ)!`,
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
        hazard.type === "ccxh_survey_data" ? "#38bdf8" :
        hazard.type === "class_structure_doc" ? "#f59e0b" :
        hazard.type === "alliance_charter" ? "#ef4444" :
        hazard.type === "crisis_pkg" ? "#fbbf24" : "#fef08a"
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
  workerShield: true,
  dashCooldown: 0,
  lastSpeedPadAt: 0,
  crisisTriggeredForPhase: new Set(),
  dizzyTimer: 0,
  carHitCooldown: 0,
};

if (typeof window !== "undefined") {
  window.__rpg_game = { camera, state, options, canvas };
}

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
    characterId: remote.character || remote.roleId || state.player.characterId,
    gender: remote.gender || ((remote.character || remote.roleId)?.startsWith("female") ? "female" : state.player.gender),
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

  // WHEN FROZEN OR DIZZY: Strict lock, do nothing until timer expires!
  if (state.frozen || state.freezeTimer > 0 || state.dizzyTimer > 0) return;

  
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
    const stX = state.policyStation.stationX !== undefined ? state.policyStation.stationX : toWorldX(state.policyStation.x);
    const stY = state.policyStation.stationY !== undefined ? state.policyStation.stationY : toWorldY(state.policyStation.y);
    const dist = Math.hypot(state.player.x - stX, state.player.y - stY);
    if (dist <= (state.policyStation.radius || 45) + state.player.radius + 50) {
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

    // WORKER SHIELD PERK: Blocks 1 hazard hit per phase
    if (state.player.characterId === "worker_leader" && state.workerShield) {
      state.workerShield = false;
      sfx.shield();
      state.screenShakeTimer = 0.15;
      state.screenShakeIntensity = 3;
      spawnParticles(state.player.x, state.player.y, "#38bdf8", 30, 110, "star");
      spawnFloatingText(
        state.player.x,
        state.player.y - 20,
        "🛡️ KHIÊN TIÊN PHONG: ĐÃ CHỐNG ĐỠ BẪY AN TOÀN!",
        "#38bdf8"
      );
      return;
    }

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
  // FARMER EXTRA BOUNTY PERK: +1 bonus point on harvesting data
  if (state.player.characterId === "farmer_strategic") {
    baseDelta += 1;
    spawnFloatingText(state.player.x, state.player.y - 14, "🌾 NÔNG DÂN: +1đ NÔNG SẢN TRI THỨC!", "#4ade80");
  }

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

  const currentPhase = getActivePhaseKey();
  const itemType = entity.type || (
    currentPhase === "phase_1" ? "ccxh_survey_data" :
    currentPhase === "phase_2" ? "class_structure_doc" : "alliance_charter"
  );
  const particleColor = (
    isCrisis ? "#facc15" :
    itemType === "ccxh_survey_data" ? "#38bdf8" :
    itemType === "class_structure_doc" ? "#f59e0b" :
    itemType === "alliance_charter" ? "#ef4444" : "#4ade80"
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

// Speed Booster Pads on main thoroughfares (direction matching traffic)
const SPEED_BOOSTER_PADS = [
  { x: 420, y: 700, w: 95, h: 36, label: "⚡ TĂNG TỐC >>>" },
  { x: 1200, y: 625, w: 95, h: 36, label: "<<< TĂNG TỐC ⚡" },
  { x: 1950, y: 700, w: 95, h: 36, label: "⚡ TĂNG TỐC >>>" },
];

function drawSpeedBoosterPads(ctx, time) {
  for (const pad of SPEED_BOOSTER_PADS) {
    const pulse = Math.sin(time * 6 + pad.x) * 0.2 + 0.8;
    ctx.save();
    ctx.fillStyle = `rgba(56, 189, 248, ${0.16 * pulse})`;
    ctx.fillRect(pad.x - pad.w / 2, pad.y - pad.h / 2, pad.w, pad.h);
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.85 * pulse})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(pad.x - pad.w / 2, pad.y - pad.h / 2, pad.w, pad.h);

    ctx.fillStyle = `rgba(250, 204, 21, ${pulse})`;
    ctx.font = "bold 10.5px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(pad.label, pad.x, pad.y + 4);
    ctx.restore();
  }
}

function triggerClassPerk() {
  if (options.role !== "player" || state.frozen || state.freezeTimer > 0) return;
  const charId = state.player.characterId;

  if (charId === "entrepreneur_dynamic") {
    if (state.dashCooldown > 0) {
      spawnFloatingText(state.player.x, state.player.y - 18, `⏳ Hồi chiêu lướt: ${Math.ceil(state.dashCooldown)}s`, "#94a3b8");
      return;
    }
    state.dashCooldown = 9.0;
    state.sprintTimer = 3.5;
    state.player.speedMultiplier = 1.45;
    sfx.boost();
    spawnParticles(state.player.x, state.player.y, "#fbbf24", 30, 140, "star");
    spawnFloatingText(state.player.x, state.player.y - 22, "⚡ BỨT PHÁ DOANH NHÂN: +45% TỐC ĐỘ! 🚀", "#fde047");
  } else if (charId === "worker_leader") {
    spawnFloatingText(
      state.player.x,
      state.player.y - 18,
      state.workerShield ? "🛡️ KHIÊN TIÊN PHONG: ĐANG SẴN SÀNG (Chống 1 bẫy)" : "🛡️ KHIÊN TIÊN PHONG: ĐÃ DÙNG TRONG CHẶNG NÀY",
      "#38bdf8"
    );
  } else if (charId === "farmer_strategic") {
    spawnFloatingText(state.player.x, state.player.y - 18, "🌾 ĐẶC QUYỀN NÔNG DÂN: TỰ ĐỘNG +1đ KHI THU THẬP", "#34d399");
  } else if (charId === "intellectual_core") {
    spawnFloatingText(state.player.x, state.player.y - 18, "💡 ĐẶC QUYỀN TRÍ THỨC: TỰ ĐỘNG LOẠI TRỪ 1 ĐÁP ÁN SAI TRONG ĐỐI THOẠI", "#c084fc");
  }
}

// ----------------------------------------------------
// 🚗 URBAN SMART TRAFFIC SIMULATION & VEHICLE PHYSICS
// ----------------------------------------------------
let activeTrafficVehicles = [];
let lastTrafficPhase = null;

function initPhaseTraffic(phaseKey) {
  lastTrafficPhase = phaseKey;
  if (phaseKey === "phase_1") {
    return [
      { id: "p1_wb1", axis: "horizontal", dir: "west", laneCoord: 625, x: 2200, y: 625, speed: 145, type: "bus", color: "#0f766e", w: 82, h: 32 },
      { id: "p1_wb2", axis: "horizontal", dir: "west", laneCoord: 625, x: 900, y: 625, speed: 170, type: "sedan", color: "#f8fafc", w: 58, h: 26 },
      { id: "p1_eb1", axis: "horizontal", dir: "east", laneCoord: 715, x: 300, y: 715, speed: 160, type: "taxi", color: "#10b981", w: 58, h: 26 },
      { id: "p1_eb2", axis: "horizontal", dir: "east", laneCoord: 715, x: 1600, y: 715, speed: 185, type: "sedan", color: "#b91c1c", w: 58, h: 26 },
      { id: "p1_sb1", axis: "vertical", dir: "south", laneCoord: 555, x: 555, y: 200, speed: 130, type: "van", color: "#ea580c", w: 28, h: 64 },
      { id: "p1_nb1", axis: "vertical", dir: "north", laneCoord: 625, x: 625, y: 1100, speed: 140, type: "sedan", color: "#38bdf8", w: 26, h: 58 },
      { id: "p1_sb2", axis: "vertical", dir: "south", laneCoord: 1595, x: 1595, y: 900, speed: 135, type: "taxi", color: "#10b981", w: 26, h: 58 },
      { id: "p1_nb2", axis: "vertical", dir: "north", laneCoord: 1665, x: 1665, y: 400, speed: 145, type: "sedan", color: "#64748b", w: 26, h: 58 },
    ];
  } else if (phaseKey === "phase_2") {
    return [
      { id: "p2_wb1", axis: "horizontal", dir: "west", laneCoord: 625, x: 2100, y: 625, speed: 145, type: "bus", color: "#b45309", w: 82, h: 32 },
      { id: "p2_wb2", axis: "horizontal", dir: "west", laneCoord: 625, x: 800, y: 625, speed: 175, type: "sedan", color: "#fef08a", w: 58, h: 26 },
      { id: "p2_eb1", axis: "horizontal", dir: "east", laneCoord: 715, x: 200, y: 715, speed: 160, type: "taxi", color: "#10b981", w: 58, h: 26 },
      { id: "p2_eb2", axis: "horizontal", dir: "east", laneCoord: 715, x: 1500, y: 715, speed: 180, type: "sedan", color: "#dc2626", w: 58, h: 26 },
      { id: "p2_sb1", axis: "vertical", dir: "south", laneCoord: 1095, x: 1095, y: 250, speed: 135, type: "van", color: "#ea580c", w: 28, h: 64 },
      { id: "p2_nb1", axis: "vertical", dir: "north", laneCoord: 1165, x: 1165, y: 1150, speed: 140, type: "sedan", color: "#38bdf8", w: 26, h: 58 },
    ];
  } else {
    // Phase 3: Siêu Đô Thị Liên Minh CNH-HĐH (Strictly on Expressway & 2 Avenues)
    return [
      // Horizontal Expressway (Upper: y=625 Westbound, Lower: y=715 Eastbound)
      { id: "p3_wb1", axis: "horizontal", dir: "west", laneCoord: 625, x: 2350, y: 625, speed: 140, type: "bus", color: "#0284c7", w: 82, h: 32 },
      { id: "p3_wb2", axis: "horizontal", dir: "west", laneCoord: 625, x: 1050, y: 625, speed: 175, type: "sedan", color: "#f8fafc", w: 58, h: 26 },
      { id: "p3_eb1", axis: "horizontal", dir: "east", laneCoord: 715, x: 250, y: 715, speed: 165, type: "taxi", color: "#10b981", w: 58, h: 26 },
      { id: "p3_eb2", axis: "horizontal", dir: "east", laneCoord: 715, x: 1550, y: 715, speed: 190, type: "sedan", color: "#b91c1c", w: 58, h: 26 },
      // West Avenue (Left: x=575 Southbound, Right: x=645 Northbound)
      { id: "p3_sb1", axis: "vertical", dir: "south", laneCoord: 575, x: 575, y: 200, speed: 130, type: "van", color: "#ea580c", w: 28, h: 64 },
      { id: "p3_nb1", axis: "vertical", dir: "north", laneCoord: 645, x: 645, y: 1150, speed: 135, type: "sedan", color: "#059669", w: 26, h: 58 },
      // East Avenue (Left: x=1755 Southbound, Right: x=1825 Northbound)
      { id: "p3_sb2", axis: "vertical", dir: "south", laneCoord: 1755, x: 1755, y: 850, speed: 140, type: "sedan", color: "#38bdf8", w: 26, h: 58 },
      { id: "p3_nb2", axis: "vertical", dir: "north", laneCoord: 1825, x: 1825, y: 350, speed: 135, type: "taxi", color: "#10b981", w: 26, h: 58 },
    ];
  }
}

function updateTrafficVehicles(deltaSeconds) {
  const phaseKey = getActivePhaseKey();
  if (lastTrafficPhase !== phaseKey || !activeTrafficVehicles || activeTrafficVehicles.length === 0) {
    activeTrafficVehicles = initPhaseTraffic(phaseKey);
  }

  const wrapMargin = 120;
  for (const car of activeTrafficVehicles) {
    if (car.axis === "horizontal") {
      car.y = car.laneCoord; // Strictly locked to lane center!
      if (car.dir === "west") {
        car.x -= car.speed * deltaSeconds;
        if (car.x < -wrapMargin) car.x = MAP_WIDTH + wrapMargin;
      } else {
        car.x += car.speed * deltaSeconds;
        if (car.x > MAP_WIDTH + wrapMargin) car.x = -wrapMargin;
      }
    } else {
      car.x = car.laneCoord; // Strictly locked to lane center!
      if (car.dir === "north") {
        car.y -= car.speed * deltaSeconds;
        if (car.y < -wrapMargin) car.y = MAP_HEIGHT + wrapMargin;
      } else {
        car.y += car.speed * deltaSeconds;
        if (car.y > MAP_HEIGHT + wrapMargin) car.y = -wrapMargin;
      }
    }
  }
}

function checkTrafficCollisions(now) {
  if (options.role !== "player" || !state.player) return;
  if (state.frozen || state.freezeTimer > 0) return;
  if (state.carHitCooldown > 0) return;

  const px = state.player.x;
  const py = state.player.y;
  const pr = 14;

  for (const car of activeTrafficVehicles) {
    const carLeft = car.x - car.w / 2;
    const carRight = car.x + car.w / 2;
    const carTop = car.y - car.h / 2;
    const carBottom = car.y + car.h / 2;

    const closestX = Math.max(carLeft, Math.min(px, carRight));
    const closestY = Math.max(carTop, Math.min(py, carBottom));
    const distX = px - closestX;
    const distY = py - closestY;

    if (distX * distX + distY * distY < pr * pr) {
      handleCarHit(car, now);
      break;
    }
  }
}

function handleCarHit(car, now) {
  // 1. Worker shield perk absorbs the collision
  if (state.workerShield) {
    state.workerShield = false;
    sfx.shield();
    spawnParticles(state.player.x, state.player.y, "#38bdf8", 30, 150, "star");
    spawnFloatingText(state.player.x, state.player.y - 20, "🛡️ KHIÊN BẢO HỘ ĐÃ ĐỠ ĐÒN VA CHẠM XE!", "#38bdf8");
    state.carHitCooldown = 1.8;
    return;
  }

  // 2. Play automotive horn & screen shake
  sfx.carHonk();
  triggerScreenShake(9, 0.4);

  // 3. Impact sparks
  spawnParticles(state.player.x, state.player.y, "#ef4444", 25, 120, "star");
  spawnParticles(state.player.x, state.player.y, "#facc15", 15, 80, "square");

  // 4. Knockback to sidewalk curb
  let targetX = state.player.x;
  let targetY = state.player.y;
  if (car.axis === "horizontal") {
    if (car.y <= 670) {
      targetY -= 48;
    } else {
      targetY += 48;
    }
  } else {
    if (state.player.x <= car.x) {
      targetX -= 48;
    } else {
      targetX += 48;
    }
  }
  const resolved = resolveSolidBuildingCollisions(targetX, targetY, state.player.radius || 14);
  state.player.x = Math.max(20, Math.min(MAP_WIDTH - 20, resolved.x));
  state.player.y = Math.max(20, Math.min(MAP_HEIGHT - 20, resolved.y));

  // 5. Stun & Invulnerability cooldown
  state.dizzyTimer = 1.5;
  state.carHitCooldown = 2.8;

  // 6. Traffic fine & warning message
  const msg = "💥 BỊ ĐỤNG XE! Chú ý an toàn giao thông (-1đ)";
  spawnFloatingText(state.player.x, state.player.y - 32, msg, "#f87171");
  postToParent({
    type: "POLICY_ITEM_COLLECT",
    itemId: `traffic_hit_${Date.now()}`,
    itemType: "traffic_violation",
    scoreDelta: -1,
    message: msg,
  });
}

function drawPixelCar(ctx, car, time) {
  const { x, y, w, h, dir, type, color } = car;
  ctx.save();

  // 1. Volumetric Headlight Beams (Projected onto dark asphalt)
  const beamLen = 110;
  const beamSpread = 26;
  ctx.save();
  if (dir === "east") {
    const startX = x + w / 2;
    const grad = ctx.createLinearGradient(startX, y, startX + beamLen, y);
    grad.addColorStop(0, "rgba(254, 240, 138, 0.35)");
    grad.addColorStop(1, "rgba(254, 240, 138, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(startX, y - 8);
    ctx.lineTo(startX + beamLen, y - 8 - beamSpread);
    ctx.lineTo(startX + beamLen, y + 8 + beamSpread);
    ctx.lineTo(startX, y + 8);
    ctx.closePath();
    ctx.fill();
  } else if (dir === "west") {
    const startX = x - w / 2;
    const grad = ctx.createLinearGradient(startX, y, startX - beamLen, y);
    grad.addColorStop(0, "rgba(254, 240, 138, 0.35)");
    grad.addColorStop(1, "rgba(254, 240, 138, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(startX, y - 8);
    ctx.lineTo(startX - beamLen, y - 8 - beamSpread);
    ctx.lineTo(startX - beamLen, y + 8 + beamSpread);
    ctx.lineTo(startX, y + 8);
    ctx.closePath();
    ctx.fill();
  } else if (dir === "south") {
    const startY = y + h / 2;
    const grad = ctx.createLinearGradient(x, startY, x, startY + beamLen);
    grad.addColorStop(0, "rgba(254, 240, 138, 0.35)");
    grad.addColorStop(1, "rgba(254, 240, 138, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x - 8, startY);
    ctx.lineTo(x - 8 - beamSpread, startY + beamLen);
    ctx.lineTo(x + 8 + beamSpread, startY + beamLen);
    ctx.lineTo(x + 8, startY);
    ctx.closePath();
    ctx.fill();
  } else if (dir === "north") {
    const startY = y - h / 2;
    const grad = ctx.createLinearGradient(x, startY, x, startY - beamLen);
    grad.addColorStop(0, "rgba(254, 240, 138, 0.35)");
    grad.addColorStop(1, "rgba(254, 240, 138, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x - 8, startY);
    ctx.lineTo(x - 8 - beamSpread, startY - beamLen);
    ctx.lineTo(x + 8 + beamSpread, startY - beamLen);
    ctx.lineTo(x + 8, startY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 2. Ground Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.beginPath();
  ctx.ellipse(x, y + 2, w / 2 + 2, h / 2 + 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Wheels
  ctx.fillStyle = "#18181b";
  if (car.axis === "horizontal") {
    const wheelW = 10;
    const wheelH = 4;
    ctx.fillRect(x - w * 0.34, y - h / 2 - 1, wheelW, wheelH);
    ctx.fillRect(x + w * 0.34 - wheelW, y - h / 2 - 1, wheelW, wheelH);
    ctx.fillRect(x - w * 0.34, y + h / 2 - 3, wheelW, wheelH);
    ctx.fillRect(x + w * 0.34 - wheelW, y + h / 2 - 3, wheelW, wheelH);
  } else {
    const wheelW = 4;
    const wheelH = 10;
    ctx.fillRect(x - w / 2 - 1, y - h * 0.34, wheelW, wheelH);
    ctx.fillRect(x - w / 2 - 1, y + h * 0.34 - wheelH, wheelW, wheelH);
    ctx.fillRect(x + w / 2 - 3, y - h * 0.34, wheelW, wheelH);
    ctx.fillRect(x + w / 2 - 3, y + h * 0.34 - wheelH, wheelW, wheelH);
  }

  // 4. Car Body
  const bx = x - w / 2;
  const by = y - h / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(bx, by, w, h, 6);
  } else {
    ctx.rect(bx, by, w, h);
  }
  ctx.fill();
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 5. Cabin & Windows
  if (car.axis === "horizontal") {
    const cabW = type === "bus" ? w - 16 : w * 0.52;
    const cabH = h - 6;
    const cabX = dir === "east" ? bx + 12 : bx + w - 12 - cabW;
    const cabY = by + 3;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(cabX, cabY, cabW, cabH);

    ctx.fillStyle = "#38bdf8";
    if (dir === "east") {
      ctx.fillRect(cabX + cabW - 5, cabY + 1, 4, cabH - 2);
      ctx.fillRect(cabX + 1, cabY + 1, 3, cabH - 2);
    } else {
      ctx.fillRect(cabX + 1, cabY + 1, 4, cabH - 2);
      ctx.fillRect(cabX + cabW - 4, cabY + 1, 3, cabH - 2);
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(cabX + cabW * 0.35, cabY + 1, 3, cabH - 2);

    if (type === "taxi") {
      ctx.fillStyle = "#facc15";
      ctx.fillRect(x - 8, y - 4, 16, 8);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 6px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("TAXI", x, y);
    } else if (type === "bus") {
      ctx.fillStyle = "#0c4a6e";
      ctx.fillRect(x - 16, y - 5, 32, 10);
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 6.5px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("BUS ELECTRIC", x, y);
    }
  } else {
    const cabW = w - 6;
    const cabH = type === "bus" ? h - 16 : h * 0.52;
    const cabX = bx + 3;
    const cabY = dir === "south" ? by + 12 : by + h - 12 - cabH;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(cabX, cabY, cabW, cabH);

    ctx.fillStyle = "#38bdf8";
    if (dir === "south") {
      ctx.fillRect(cabX + 1, cabY + cabH - 5, cabW - 2, 4);
      ctx.fillRect(cabX + 1, cabY + 1, cabW - 2, 3);
    } else {
      ctx.fillRect(cabX + 1, cabY + 1, cabW - 2, 4);
      ctx.fillRect(cabX + 1, cabY + cabH - 4, cabW - 2, 3);
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(cabX + 1, cabY + cabH * 0.35, cabW - 2, 3);

    if (type === "taxi") {
      ctx.fillStyle = "#facc15";
      ctx.fillRect(x - 5, y - 6, 10, 12);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 6px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("TX", x, y);
    }
  }

  // 6. Headlights & Taillights
  if (dir === "east") {
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(bx + w - 2, by + 3, 2, 5);
    ctx.fillRect(bx + w - 2, by + h - 8, 2, 5);
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(bx, by + 3, 2, 5);
    ctx.fillRect(bx, by + h - 8, 2, 5);
  } else if (dir === "west") {
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(bx, by + 3, 2, 5);
    ctx.fillRect(bx, by + h - 8, 2, 5);
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(bx + w - 2, by + 3, 2, 5);
    ctx.fillRect(bx + w - 2, by + h - 8, 2, 5);
  } else if (dir === "south") {
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(bx + 3, by + h - 2, 5, 2);
    ctx.fillRect(bx + w - 8, by + h - 2, 5, 2);
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(bx + 3, by, 5, 2);
    ctx.fillRect(bx + w - 8, by, 5, 2);
  } else if (dir === "north") {
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(bx + 3, by, 5, 2);
    ctx.fillRect(bx + w - 8, by, 5, 2);
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(bx + 3, by + h - 2, 5, 2);
    ctx.fillRect(bx + w - 8, by + h - 2, 5, 2);
  }

  ctx.restore();
}

function drawTrafficVehicles(ctx, time) {
  if (!activeTrafficVehicles || activeTrafficVehicles.length === 0) return;
  for (const car of activeTrafficVehicles) {
    drawPixelCar(ctx, car, time);
  }
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
      mHazard.type === "ccxh_survey_data" ||
      mHazard.type === "class_structure_doc" ||
      mHazard.type === "alliance_charter" ||
      mHazard.type === "crisis_pkg" ||
      mHazard.type === "crisis_item" ||
      mHazard.type === "rice_sheaf" ||
      mHazard.type === "yarn_spool" ||
      mHazard.type === "survey_doc" ||
      mHazard.type === "directive_100";

    const dynamicEntity = {
      ...(snapHazard || {}),
      id,
      type: mHazard.type || snapHazard?.type || "bias_prejudice",
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

  // 3. Innovation Speed Booster Pads check
  if (options.role === "player" && !state.frozen && state.freezeTimer <= 0) {
    for (const pad of SPEED_BOOSTER_PADS) {
      if (Math.abs(state.player.x - pad.x) < 45 && Math.abs(state.player.y - pad.y) < 25) {
        if (now - (state.lastSpeedPadAt || 0) > 4000) {
          state.lastSpeedPadAt = now;
          state.sprintTimer = 3.5;
          state.player.speedMultiplier = 1.45;
          sfx.boost();
          spawnParticles(pad.x, pad.y, "#38bdf8", 25, 120, "star");
          spawnFloatingText(state.player.x, state.player.y - 18, "⚡ ĐỆM TĂNG TỐC ĐỔI MỚI! +45% TỐC ĐỘ 🚀", "#38bdf8");
        }
        break;
      }
    }
  }

  // 4. Urban Traffic Vehicle Collisions
  checkTrafficCollisions(now);
}

// ----------------------------------------------------
// 3 RICH, DISTINCT STANDALONE PHASE MAPS
// ----------------------------------------------------

function drawCityGround() {
  const time = state.gameTime;
  const phaseKey = getActivePhaseKey();

  if (phaseKey === "phase_1") {
    drawPhase1CcxhMap(time);
  } else if (phaseKey === "phase_2") {
    drawPhase2UnityMap(time);
  } else if (phaseKey === "phase_3") {
    drawPhase3AllianceMap(time);
  } else {
    drawPhase3AllianceMap(time);
  }

  // Draw Innovation Speed Booster Pads on city roads
  drawSpeedBoosterPads(context, time);
}

// ----------------------------------------------------
// 🛣️ BEAUTIFUL PIXEL ROAD MARKINGS SYSTEM
// ----------------------------------------------------

function drawZebraCrosswalk(ctx, x, y, width, height, isVertical = false, stripeColor = "#f8fafc") {
  ctx.save();
  ctx.fillStyle = stripeColor;
  if (!isVertical) {
    const barW = 8;
    const gap = 8;
    const count = Math.floor((width - 4) / (barW + gap));
    const startX = x + (width - (count * (barW + gap) - gap)) / 2;
    for (let i = 0; i < count; i++) {
      ctx.fillRect(startX + i * (barW + gap), y + 2, barW, height - 4);
    }
  } else {
    const barH = 8;
    const gap = 8;
    const count = Math.floor((height - 4) / (barH + gap));
    const startY = y + (height - (count * (barH + gap) - gap)) / 2;
    for (let i = 0; i < count; i++) {
      ctx.fillRect(x + 2, startY + i * (barH + gap), width - 4, barH);
    }
  }
  ctx.restore();
}

function drawStopLine(ctx, x, y, length, isVertical = false, color = "#f8fafc") {
  ctx.save();
  ctx.fillStyle = color;
  if (!isVertical) {
    ctx.fillRect(x, y, length, 4);
  } else {
    ctx.fillRect(x, y, 4, length);
  }
  ctx.restore();
}

function drawRoadArrow(ctx, x, y, type = "straight", rotation = 0, color = "rgba(248, 250, 252, 0.75)") {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  // Arrow shaft
  ctx.fillRect(-2.5, -8, 5, 20);

  // Arrow tip
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(-8, -8);
  ctx.lineTo(8, -8);
  ctx.closePath();
  ctx.fill();

  if (type === "turn_left") {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-6, -2, -12, -7);
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-18, -7);
    ctx.lineTo(-10, -13);
    ctx.lineTo(-10, -1);
    ctx.closePath();
    ctx.fill();
  } else if (type === "turn_right") {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(6, -2, 12, -7);
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(18, -7);
    ctx.lineTo(10, -13);
    ctx.lineTo(10, -1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawHatchedJunction(ctx, x, y, w, h, color = "rgba(250, 204, 21, 0.35)") {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  ctx.beginPath();
  const step = 20;
  for (let offset = 0; offset <= w + h; offset += step) {
    const x1 = Math.max(x, x + offset - h);
    const y1 = Math.min(y + h, y + offset);
    const x2 = Math.min(x + w, x + offset);
    const y2 = Math.max(y, y + offset - w);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    const x3 = Math.max(x, x + offset - h);
    const y3 = Math.max(y, y + h - offset);
    const x4 = Math.min(x + w, x + offset);
    const y4 = Math.min(y + h, y + 2 * h - offset);
    ctx.moveTo(x3, y3);
    ctx.lineTo(x4, y4);
  }
  ctx.stroke();
  ctx.restore();
}

function drawDoubleCenterLine(ctx, x1, y1, x2, y2, gap = 6, lineWidth = 2.5, color = "#facc15") {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  const isHoriz = Math.abs(y1 - y2) < 2;
  ctx.beginPath();
  if (isHoriz) {
    ctx.moveTo(x1, y1 - gap / 2); ctx.lineTo(x2, y1 - gap / 2);
    ctx.moveTo(x1, y1 + gap / 2); ctx.lineTo(x2, y1 + gap / 2);
  } else {
    ctx.moveTo(x1 - gap / 2, y1); ctx.lineTo(x1 - gap / 2, y2);
    ctx.moveTo(x1 + gap / 2, y1); ctx.lineTo(x1 + gap / 2, y2);
  }
  ctx.stroke();
  ctx.restore();
}

// ----------------------------------------------------
// MAP 1: VIỆN HÀN LÂM KHẢO SÁT CƠ CẤU XÃ HỘI (PHASE 1)
// ----------------------------------------------------
function drawPhase1CcxhMap(time) {
  // 1. Deep Slate Research Campus Pavement
  context.fillStyle = "#0f172a";
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // 2. Academic Quadrant Courtyards — matching Phase 1 "Học viện" layout
  const campusPlots = [
    { x: 60,   y: 70,  w: 440, h: 480 },   // NW plot (around bldg at 280,280)
    { x: 860,  y: 50,  w: 680, h: 500 },   // NC plot (around main bldg at 1200,260)
    { x: 1900, y: 70,  w: 440, h: 480 },   // NE plot (around bldg at 2120,280)
    { x: 60,   y: 780, w: 440, h: 520 },   // SW plot (around bldg at 280,1100)
    { x: 910,  y: 780, w: 580, h: 520 },   // SC plot (around bldg at 1200,1100)
    { x: 1900, y: 780, w: 440, h: 520 },   // SE plot (around bldg at 2120,1100)
  ];

  for (const plot of campusPlots) {
    context.fillStyle = "#1e293b";
    context.fillRect(plot.x, plot.y, plot.w, plot.h);
    context.strokeStyle = "#334155";
    context.lineWidth = 2;
    context.strokeRect(plot.x, plot.y, plot.w, plot.h);

    // Subtle grid pattern for academic surveying campus
    context.strokeStyle = "rgba(51, 65, 85, 0.4)";
    context.lineWidth = 1;
    for (let gx = plot.x + 30; gx < plot.x + plot.w; gx += 40) {
      context.beginPath(); context.moveTo(gx, plot.y); context.lineTo(gx, plot.y + plot.h); context.stroke();
    }
    for (let gy = plot.y + 30; gy < plot.y + plot.h; gy += 40) {
      context.beginPath(); context.moveTo(plot.x, gy); context.lineTo(plot.x + plot.w, gy); context.stroke();
    }
  }

  // 3. Wide Research Boulevards (horizontal + vertical corridors)
  context.fillStyle = "#161f30";
  context.fillRect(0, 580, MAP_WIDTH, 180);     // Horizontal main road y=580-760
  context.fillRect(520, 0, 140, MAP_HEIGHT);    // Vertical road 1
  context.fillRect(1560, 0, 140, MAP_HEIGHT);   // Vertical road 2

  // Crisp Stone Curbs (Mép vỉa hè)
  context.fillStyle = "#475569";
  context.fillRect(0, 577, MAP_WIDTH, 4);
  context.fillRect(0, 759, MAP_WIDTH, 4);
  context.fillRect(517, 0, 4, MAP_HEIGHT);
  context.fillRect(659, 0, 4, MAP_HEIGHT);
  context.fillRect(1557, 0, 4, MAP_HEIGHT);
  context.fillRect(1699, 0, 4, MAP_HEIGHT);

  // Double Solid Yellow Centerlines (Vạch đôi liền vàng trung tâm)
  drawDoubleCenterLine(context, 0, 670, 480, 670, 6, 2.5, "#facc15");
  drawDoubleCenterLine(context, 700, 670, 1520, 670, 6, 2.5, "#facc15");
  drawDoubleCenterLine(context, 1740, 670, MAP_WIDTH, 670, 6, 2.5, "#facc15");

  // Vertical Road Centerlines
  drawDoubleCenterLine(context, 590, 0, 590, 540, 6, 2.5, "#facc15");
  drawDoubleCenterLine(context, 590, 800, 590, MAP_HEIGHT, 6, 2.5, "#facc15");
  drawDoubleCenterLine(context, 1630, 0, 1630, 540, 6, 2.5, "#facc15");
  drawDoubleCenterLine(context, 1630, 800, 1630, MAP_HEIGHT, 6, 2.5, "#facc15");

  // Lane Divider Dashes (Vạch đứt phân làn)
  context.strokeStyle = "rgba(203, 213, 225, 0.55)";
  context.lineWidth = 2;
  context.setLineDash([18, 14]);
  context.beginPath();
  context.moveTo(0, 625); context.lineTo(490, 625);
  context.moveTo(690, 625); context.lineTo(1530, 625);
  context.moveTo(1730, 625); context.lineTo(MAP_WIDTH, 625);
  context.moveTo(0, 715); context.lineTo(490, 715);
  context.moveTo(690, 715); context.lineTo(1530, 715);
  context.moveTo(1730, 715); context.lineTo(MAP_WIDTH, 715);
  context.stroke();
  context.setLineDash([]);

  // Pedestrian Zebra Crossings & Stop Bars (Vạch qua đường & vạch dừng)
  // Junction 1 (x: 590, y: 670)
  drawZebraCrosswalk(context, 525, 544, 130, 26, false, "#f8fafc");
  drawStopLine(context, 525, 574, 130, false, "#f8fafc");
  drawZebraCrosswalk(context, 525, 770, 130, 26, false, "#f8fafc");
  drawStopLine(context, 525, 766, 130, false, "#f8fafc");
  drawZebraCrosswalk(context, 485, 585, 26, 170, true, "#f8fafc");
  drawStopLine(context, 515, 585, 170, true, "#f8fafc");
  drawZebraCrosswalk(context, 669, 585, 26, 170, true, "#f8fafc");
  drawStopLine(context, 665, 585, 170, true, "#f8fafc");
  drawHatchedJunction(context, 522, 582, 136, 176, "rgba(250, 204, 21, 0.3)");

  // Junction 2 (x: 1630, y: 670)
  drawZebraCrosswalk(context, 1565, 544, 130, 26, false, "#f8fafc");
  drawStopLine(context, 1565, 574, 130, false, "#f8fafc");
  drawZebraCrosswalk(context, 1565, 770, 130, 26, false, "#f8fafc");
  drawStopLine(context, 1565, 766, 130, false, "#f8fafc");
  drawZebraCrosswalk(context, 1525, 585, 26, 170, true, "#f8fafc");
  drawStopLine(context, 1555, 585, 170, true, "#f8fafc");
  drawZebraCrosswalk(context, 1709, 585, 26, 170, true, "#f8fafc");
  drawStopLine(context, 1705, 585, 170, true, "#f8fafc");
  drawHatchedJunction(context, 1562, 582, 136, 176, "rgba(250, 204, 21, 0.3)");

  // Directional Lane Arrows
  drawRoadArrow(context, 350, 625, "straight", -Math.PI / 2);
  drawRoadArrow(context, 200, 715, "straight", Math.PI / 2);
  drawRoadArrow(context, 1000, 625, "straight", -Math.PI / 2);
  drawRoadArrow(context, 1150, 715, "straight", Math.PI / 2);
  drawRoadArrow(context, 2100, 625, "straight", -Math.PI / 2);
  drawRoadArrow(context, 1950, 715, "straight", Math.PI / 2);
  drawRoadArrow(context, 555, 450, "straight", Math.PI);  // Southbound (Left lane)
  drawRoadArrow(context, 625, 450, "straight", 0);        // Northbound (Right lane)
  drawRoadArrow(context, 1595, 450, "straight", Math.PI); // Southbound (Left lane)
  drawRoadArrow(context, 1665, 450, "straight", 0);       // Northbound (Right lane)

  // 4. Campus Reflecting Pools — placed inside courtyards, away from roads
  const pools = [
    { x: 100,  y: 160, w: 130, h: 60 },  // NW courtyard pool
    { x: 1920, y: 160, w: 130, h: 60 },  // NE courtyard pool
    { x: 100,  y: 1200, w: 130, h: 60 }, // SW courtyard pool
    { x: 1920, y: 1200, w: 130, h: 60 }, // SE courtyard pool
  ];
  for (const pool of pools) {
    context.fillStyle = "#0c4a6e";
    context.fillRect(pool.x, pool.y, pool.w, pool.h);
    context.strokeStyle = "#38bdf8";
    context.lineWidth = 2;
    context.strokeRect(pool.x, pool.y, pool.w, pool.h);
    const ripple = (time * 30) % pool.w;
    context.fillStyle = "#38bdf8";
    context.fillRect(pool.x + ripple, pool.y + pool.h / 2, 25, 3);
  }

  // 5. Academic Campus Trees — placed at courtyard corners, OFF roads
  drawPixelTree(100,  490, "oak", time);   // NW plot SW corner
  drawPixelTree(460,  140, "oak", time);   // NW plot NE corner
  drawPixelTree(1940, 490, "oak", time);   // NE plot SW corner
  drawPixelTree(2300, 140, "oak", time);   // NE plot NE corner
  drawPixelTree(100,  870, "oak", time);   // SW plot NW corner
  drawPixelTree(2300, 870, "oak", time);   // SE plot NW corner

  // Streetlamps along road edges (not on road center)
  const lamps = [
    { x: 510, y: 570 }, { x: 670, y: 570 }, { x: 1550, y: 570 }, { x: 1710, y: 570 },
    { x: 510, y: 770 }, { x: 670, y: 770 }, { x: 1550, y: 770 }, { x: 1710, y: 770 },
  ];
  for (const lp of lamps) drawStreetLamp(lp.x, lp.y, time);
}

// ----------------------------------------------------
// MAP 2: QUẢNG TRƯỜNG ĐẠI ĐOÀN KẾT & BIẾN ĐỔI CCXH-GC (PHASE 2)
// ----------------------------------------------------
function drawPhase2UnityMap(time) {
  // 1. Warm Granite Stone Paving
  context.fillStyle = "#1c1917";
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // 2. Civic Forums — matching Phase 2 "Quảng trường" layout
  const forums = [
    { x: 40,   y: 60,  w: 320, h: 400 },   // NW small (around bldg 200,240)
    { x: 400,  y: 60,  w: 620, h: 480 },   // N-left (around bldg 700,280)
    { x: 1400, y: 60,  w: 620, h: 480 },   // N-right (around bldg 1700,280)
    { x: 2040, y: 60,  w: 320, h: 400 },   // NE small (around bldg 2200,240)
    { x: 250,  y: 780, w: 520, h: 520 },   // SW (around bldg 500,1100)
    { x: 1650, y: 780, w: 520, h: 520 },   // SE (around bldg 1900,1100)
  ];
  for (const fm of forums) {
    context.fillStyle = "#292524";
    context.fillRect(fm.x, fm.y, fm.w, fm.h);
    context.strokeStyle = "#44403c";
    context.lineWidth = 2;
    context.strokeRect(fm.x, fm.y, fm.w, fm.h);
  }

  // 3. Grand Ceremonial Red & Gold Boulevard (Trục Đại Lộ Đoàn Kết)
  context.fillStyle = "#330808";
  context.fillRect(0, 580, MAP_WIDTH, 180);
  context.fillStyle = "#450a0a";
  context.fillRect(0, 600, MAP_WIDTH, 140);

  // Ceremonial Golden Curb Trims
  context.fillStyle = "#b45309";
  context.fillRect(0, 577, MAP_WIDTH, 4);
  context.fillRect(0, 759, MAP_WIDTH, 4);
  context.fillStyle = "#f59e0b";
  context.fillRect(0, 579, MAP_WIDTH, 2);
  context.fillRect(0, 759, MAP_WIDTH, 2);

  // Vertical Corridors
  context.fillStyle = "#292524";
  context.fillRect(1060, 0, 140, MAP_HEIGHT);   // Central vertical road
  context.fillRect(800,  780, 140, MAP_HEIGHT - 780);  // SW-center corridor
  context.fillStyle = "#78716c";
  context.fillRect(1057, 0, 4, MAP_HEIGHT);
  context.fillRect(1199, 0, 4, MAP_HEIGHT);

  // Double Solid Gold Centerlines (Vạch đôi vàng hoàng gia)
  drawDoubleCenterLine(context, 0, 670, 1020, 670, 6, 2.5, "#facc15");
  drawDoubleCenterLine(context, 1240, 670, MAP_WIDTH, 670, 6, 2.5, "#facc15");
  drawDoubleCenterLine(context, 1130, 0, 1130, 540, 6, 2.5, "#facc15");
  drawDoubleCenterLine(context, 1130, 800, 1130, MAP_HEIGHT, 6, 2.5, "#facc15");

  // Lane Divider Dashes
  context.strokeStyle = "rgba(251, 191, 36, 0.45)";
  context.lineWidth = 2;
  context.setLineDash([20, 16]);
  context.beginPath();
  context.moveTo(0, 625); context.lineTo(1030, 625);
  context.moveTo(1230, 625); context.lineTo(MAP_WIDTH, 625);
  context.moveTo(0, 715); context.lineTo(1030, 715);
  context.moveTo(1230, 715); context.lineTo(MAP_WIDTH, 715);
  context.stroke();
  context.setLineDash([]);

  // Grand Ceremonial Pedestrian Crossings (Vạch sang đường lễ hội đỏ-vàng)
  drawZebraCrosswalk(context, 1065, 544, 130, 26, false, "#fef08a");
  drawStopLine(context, 1065, 574, 130, false, "#facc15");
  drawZebraCrosswalk(context, 1065, 770, 130, 26, false, "#fef08a");
  drawStopLine(context, 1065, 766, 130, false, "#facc15");
  drawZebraCrosswalk(context, 1025, 585, 26, 170, true, "#fef08a");
  drawStopLine(context, 1055, 585, 170, true, "#facc15");
  drawZebraCrosswalk(context, 1209, 585, 26, 170, true, "#fef08a");
  drawStopLine(context, 1205, 585, 170, true, "#facc15");
  drawHatchedJunction(context, 1062, 582, 136, 176, "rgba(250, 204, 21, 0.4)");

  // Directional Arrows in Gold
  drawRoadArrow(context, 600, 625, "straight", -Math.PI / 2, "rgba(250, 204, 21, 0.7)");
  drawRoadArrow(context, 450, 715, "straight", Math.PI / 2, "rgba(250, 204, 21, 0.7)");
  drawRoadArrow(context, 1600, 625, "straight", -Math.PI / 2, "rgba(250, 204, 21, 0.7)");
  drawRoadArrow(context, 1750, 715, "straight", Math.PI / 2, "rgba(250, 204, 21, 0.7)");
  drawRoadArrow(context, 1095, 450, "straight", Math.PI, "rgba(250, 204, 21, 0.7)"); // Southbound (Left lane)
  drawRoadArrow(context, 1165, 450, "straight", 0, "rgba(250, 204, 21, 0.7)");       // Northbound (Right lane)

  // 4. Memorial Plazas — placed inside courtyard plots, NOT on roads
  drawMemorialPlaza(700,  490, 55, "lotus");   // Inside N-left plot bottom
  drawMemorialPlaza(1700, 490, 55, "lotus");   // Inside N-right plot bottom
  drawMemorialPlaza(500,  870, 55, "lotus");   // Inside SW plot top area
  drawMemorialPlaza(1900, 870, 55, "lotus");   // Inside SE plot top area

  // 5. Civic Trees — placed at courtyard edges, NOT on roads
  drawPixelTree(80,  410, "pine", time);    // NW plot bottom edge
  drawPixelTree(2100, 410, "pine", time);   // NE plot bottom edge
  drawPixelTree(320,  870, "pine", time);   // SW plot top-left
  drawPixelTree(700,  1220, "pine", time);  // SW plot bottom
  drawPixelTree(1720, 870, "pine", time);   // SE plot top
  drawPixelTree(2100, 1220, "pine", time);  // SE plot bottom-right

  // Streetlamps along boulevard edges
  const lamps2 = [
    { x: 1050, y: 570 }, { x: 1210, y: 570 }, { x: 400, y: 570 }, { x: 2000, y: 570 },
    { x: 1050, y: 770 }, { x: 1210, y: 770 }, { x: 400, y: 770 }, { x: 2000, y: 770 },
  ];
  for (const lp of lamps2) drawStreetLamp(lp.x, lp.y, time);
}

// ----------------------------------------------------
// MAP 3: SIÊU ĐÔ THỊ LIÊN MINH 4 KHỐI & CNH-HĐH (PHASE 3)
// ----------------------------------------------------
function drawPhase3AllianceMap(time) {
  // 1. High-Tech Dark Carbon Metropolis Ground
  context.fillStyle = "#090d16";
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // 2. High-Tech Sector Platforms (6 Districts matching the 6 Buildings)
  // Perfectly balanced 3-column grid: West [50..500], Center [720..1680], East [1900..2350]
  const sectors = [
    // North Row (y: 40/50 to 550)
    { x: 50,   y: 50,  w: 450, h: 500, color: "rgba(12, 74, 110, 0.45)",  border: "#0284c7", label: "KHU CÔNG NGHIỆP CÔNG NGHỆ CAO", accent: "#38bdf8" },
    { x: 720,  y: 40,  w: 960, h: 510, color: "rgba(69, 10, 10, 0.45)",   border: "#ef4444", label: "ĐẠI HỘI TRƯỜNG LIÊN MINH CHIẾN LƯỢC", accent: "#facc15" },
    { x: 1900, y: 50,  w: 450, h: 500, color: "rgba(6, 78, 59, 0.45)",   border: "#10b981", label: "VÙNG NÔNG NGHIỆP SINH THÁI HIỆN ĐẠI", accent: "#4ade80" },

    // South Row (y: 790 to 1340)
    { x: 50,   y: 790, w: 450, h: 550, color: "rgba(30, 27, 75, 0.45)",   border: "#a855f7", label: "TRUNG TÂM ĐỔI MỚI SÁNG TẠO SỐ", accent: "#c084fc" },
    { x: 720,  y: 790, w: 960, h: 550, color: "rgba(24, 24, 27, 0.55)",   border: "#f59e0b", label: "TÒA NHÀ DOANH NHÂN & DOANH NGHIỆP", accent: "#fde047" },
    { x: 1900, y: 790, w: 450, h: 550, color: "rgba(8, 47, 73, 0.45)",   border: "#38bdf8", label: "VIỆN KINH TẾ - CHÍNH TRỊ TRUNG ƯƠNG", accent: "#22d3ee" },
  ];

  for (const sec of sectors) {
    // Platform Base
    context.fillStyle = sec.color;
    context.fillRect(sec.x, sec.y, sec.w, sec.h);
    context.strokeStyle = sec.border;
    context.lineWidth = 2.5;
    context.strokeRect(sec.x, sec.y, sec.w, sec.h);

    // Subtle Cyber Grid Pattern inside Platform
    context.save();
    context.strokeStyle = `${sec.border}1a`;
    context.lineWidth = 1;
    for (let gx = sec.x + 50; gx < sec.x + sec.w; gx += 50) {
      context.beginPath(); context.moveTo(gx, sec.y); context.lineTo(gx, sec.y + sec.h); context.stroke();
    }
    for (let gy = sec.y + 50; gy < sec.y + sec.h; gy += 50) {
      context.beginPath(); context.moveTo(sec.x, gy); context.lineTo(sec.x + sec.w, gy); context.stroke();
    }

    // High-Tech Cyber Corner Brackets (Góc vát dạ quang công nghệ cao)
    const cLen = 22;
    context.strokeStyle = sec.accent;
    context.lineWidth = 3;
    // Top-left
    context.beginPath(); context.moveTo(sec.x, sec.y + cLen); context.lineTo(sec.x, sec.y); context.lineTo(sec.x + cLen, sec.y); context.stroke();
    // Top-right
    context.beginPath(); context.moveTo(sec.x + sec.w - cLen, sec.y); context.lineTo(sec.x + sec.w, sec.y); context.lineTo(sec.x + sec.w, sec.y + cLen); context.stroke();
    // Bottom-left
    context.beginPath(); context.moveTo(sec.x, sec.y + sec.h - cLen); context.lineTo(sec.x, sec.y + sec.h); context.lineTo(sec.x + cLen, sec.y + sec.h); context.stroke();
    // Bottom-right
    context.beginPath(); context.moveTo(sec.x + sec.w - cLen, sec.y + sec.h); context.lineTo(sec.x + sec.w, sec.y + sec.h); context.lineTo(sec.x + sec.w, sec.y + sec.h - cLen); context.stroke();
    context.restore();
  }

  // 3. Smart Expressway Corridors (Mặt đường siêu đô thị hiện đại)
  // Horizontal Expressway (y = 580..760, height 180)
  // Two Vertical Avenues: West Avenue (x = 540..680) & East Avenue (x = 1720..1860)
  context.fillStyle = "#0a0f1d";
  context.fillRect(0, 580, MAP_WIDTH, 180);
  context.fillRect(540, 0, 140, MAP_HEIGHT);
  context.fillRect(1720, 0, 140, MAP_HEIGHT);

  // Glowing Neon Cyan Curb Edges (Viền vỉa hè dạ quang)
  context.fillStyle = "rgba(2, 132, 199, 0.85)";
  context.fillRect(0, 577, MAP_WIDTH, 4);
  context.fillRect(0, 759, MAP_WIDTH, 4);
  context.fillRect(537, 0, 4, MAP_HEIGHT);
  context.fillRect(679, 0, 4, MAP_HEIGHT);
  context.fillRect(1717, 0, 4, MAP_HEIGHT);
  context.fillRect(1859, 0, 4, MAP_HEIGHT);

  // Double Solid Glowing Median Lines (Vạch đôi phân cách trung tâm phát sáng)
  // Horizontal Boulevard
  drawDoubleCenterLine(context, 0, 670, 500, 670, 6, 2.5, "#38bdf8");
  drawDoubleCenterLine(context, 720, 670, 1680, 670, 6, 2.5, "#38bdf8");
  drawDoubleCenterLine(context, 1900, 670, MAP_WIDTH, 670, 6, 2.5, "#38bdf8");

  // Vertical Avenues Centerlines
  drawDoubleCenterLine(context, 610, 0, 610, 540, 6, 2.5, "#38bdf8");
  drawDoubleCenterLine(context, 610, 800, 610, MAP_HEIGHT, 6, 2.5, "#38bdf8");
  drawDoubleCenterLine(context, 1790, 0, 1790, 540, 6, 2.5, "#38bdf8");
  drawDoubleCenterLine(context, 1790, 800, 1790, MAP_HEIGHT, 6, 2.5, "#38bdf8");

  // Animated Neon Cyan Data Busway Lane Dividers (Vạch đứt chuyển động nhịp nhàng theo chiều xe chạy)
  context.save();
  context.strokeStyle = "rgba(56, 189, 248, 0.75)";
  context.lineWidth = 2.5;
  context.setLineDash([26, 16]);

  // Westbound upper lane (y = 625) -> Animate to West (left) matching traffic
  context.lineDashOffset = time * 45;
  context.beginPath();
  context.moveTo(0, 625); context.lineTo(510, 625);
  context.moveTo(710, 625); context.lineTo(1690, 625);
  context.moveTo(1890, 625); context.lineTo(MAP_WIDTH, 625);
  context.stroke();

  // Eastbound lower lane (y = 715) -> Animate to East (right) matching traffic
  context.lineDashOffset = -time * 45;
  context.beginPath();
  context.moveTo(0, 715); context.lineTo(510, 715);
  context.moveTo(710, 715); context.lineTo(1690, 715);
  context.moveTo(1890, 715); context.lineTo(MAP_WIDTH, 715);
  context.stroke();

  context.setLineDash([]);
  context.restore();

  // Smart High-Tech Pedestrian Crosswalks & Stop Bars (Vạch qua đường công nghệ cao)
  // West Junction (x: 610, y: 670)
  drawZebraCrosswalk(context, 545, 544, 130, 26, false, "#38bdf8");
  drawStopLine(context, 545, 574, 130, false, "#38bdf8");
  drawZebraCrosswalk(context, 545, 770, 130, 26, false, "#38bdf8");
  drawStopLine(context, 545, 766, 130, false, "#38bdf8");
  drawZebraCrosswalk(context, 505, 585, 26, 170, true, "#38bdf8");
  drawStopLine(context, 535, 585, 170, true, "#38bdf8");
  drawZebraCrosswalk(context, 689, 585, 26, 170, true, "#38bdf8");
  drawStopLine(context, 685, 585, 170, true, "#38bdf8");
  drawHatchedJunction(context, 542, 582, 136, 176, "rgba(56, 189, 248, 0.4)");

  // East Junction (x: 1790, y: 670)
  drawZebraCrosswalk(context, 1725, 544, 130, 26, false, "#38bdf8");
  drawStopLine(context, 1725, 574, 130, false, "#38bdf8");
  drawZebraCrosswalk(context, 1725, 770, 130, 26, false, "#38bdf8");
  drawStopLine(context, 1725, 766, 130, false, "#38bdf8");
  drawZebraCrosswalk(context, 1685, 585, 26, 170, true, "#38bdf8");
  drawStopLine(context, 1715, 585, 170, true, "#38bdf8");
  drawZebraCrosswalk(context, 1869, 585, 26, 170, true, "#38bdf8");
  drawStopLine(context, 1865, 585, 170, true, "#38bdf8");
  drawHatchedJunction(context, 1722, 582, 136, 176, "rgba(56, 189, 248, 0.4)");

  // Directional Expressway Arrows (Đúng chiều Luật Giao Thông bên phải)
  // Westbound Upper Lane (y = 625 -> Chạy sang Tây / Trái)
  drawRoadArrow(context, 250, 625, "straight", -Math.PI / 2, "rgba(56, 189, 248, 0.75)");
  drawRoadArrow(context, 910, 625, "straight", -Math.PI / 2, "rgba(56, 189, 248, 0.75)");
  drawRoadArrow(context, 1200, 625, "straight", -Math.PI / 2, "rgba(56, 189, 248, 0.75)");
  drawRoadArrow(context, 1490, 625, "straight", -Math.PI / 2, "rgba(56, 189, 248, 0.75)");
  drawRoadArrow(context, 2150, 625, "straight", -Math.PI / 2, "rgba(56, 189, 248, 0.75)");
  // Eastbound Lower Lane (y = 715 -> Chạy sang Đông / Phải)
  drawRoadArrow(context, 250, 715, "straight", Math.PI / 2, "rgba(56, 189, 248, 0.75)");
  drawRoadArrow(context, 910, 715, "straight", Math.PI / 2, "rgba(56, 189, 248, 0.75)");
  drawRoadArrow(context, 1200, 715, "straight", Math.PI / 2, "rgba(56, 189, 248, 0.75)");
  drawRoadArrow(context, 1490, 715, "straight", Math.PI / 2, "rgba(56, 189, 248, 0.75)");
  drawRoadArrow(context, 2150, 715, "straight", Math.PI / 2, "rgba(56, 189, 248, 0.75)");
  // West Avenue Arrows (x = 610)
  drawRoadArrow(context, 575, 450, "straight", Math.PI, "rgba(56, 189, 248, 0.75)"); // Làn trái: Chạy xuống Nam (Southbound)
  drawRoadArrow(context, 645, 450, "straight", 0, "rgba(56, 189, 248, 0.75)");       // Làn phải: Chạy lên Bắc (Northbound)
  drawRoadArrow(context, 575, 920, "straight", Math.PI, "rgba(56, 189, 248, 0.75)"); // Làn trái: Chạy xuống Nam (Southbound)
  drawRoadArrow(context, 645, 920, "straight", 0, "rgba(56, 189, 248, 0.75)");       // Làn phải: Chạy lên Bắc (Northbound)
  // East Avenue Arrows (x = 1790)
  drawRoadArrow(context, 1755, 450, "straight", Math.PI, "rgba(56, 189, 248, 0.75)"); // Làn trái: Chạy xuống Nam (Southbound)
  drawRoadArrow(context, 1825, 450, "straight", 0, "rgba(56, 189, 248, 0.75)");       // Làn phải: Chạy lên Bắc (Northbound)
  drawRoadArrow(context, 1755, 920, "straight", Math.PI, "rgba(56, 189, 248, 0.75)"); // Làn trái: Chạy xuống Nam (Southbound)
  drawRoadArrow(context, 1825, 920, "straight", 0, "rgba(56, 189, 248, 0.75)");       // Làn phải: Chạy lên Bắc (Northbound)

  // 5. Modern Smart Eco Trees — Placed strictly at sector perimeter corners (OFF roadways!)
  // North Zone Courtyards
  drawPixelTree(80,   480, "palm", time);
  drawPixelTree(470,  480, "palm", time);
  drawPixelTree(750,  480, "palm", time);
  drawPixelTree(1650, 480, "palm", time);
  drawPixelTree(1930, 480, "palm", time);
  drawPixelTree(2320, 480, "palm", time);

  // South Zone Courtyards
  drawPixelTree(80,   850, "palm", time);
  drawPixelTree(470,  850, "palm", time);
  drawPixelTree(750,  850, "palm", time);
  drawPixelTree(1650, 850, "palm", time);
  drawPixelTree(1930, 850, "palm", time);
  drawPixelTree(2320, 850, "palm", time);

  // 6. Smart Urban Streetlamps along Road Curbs (NOT in roadway)
  const lamps3 = [
    // Along Horizontal Expressway Curbs
    { x: 280,  y: 565 }, { x: 720,  y: 565 }, { x: 1080, y: 565 }, { x: 1320, y: 565 }, { x: 1680, y: 565 }, { x: 2120, y: 565 },
    { x: 280,  y: 775 }, { x: 720,  y: 775 }, { x: 1080, y: 775 }, { x: 1320, y: 775 }, { x: 1680, y: 775 }, { x: 2120, y: 775 },
    // Along West Avenue Curbs
    { x: 525,  y: 280 }, { x: 695,  y: 280 }, { x: 525,  y: 1050 }, { x: 695,  y: 1050 },
    // Along East Avenue Curbs
    { x: 1705, y: 280 }, { x: 1875, y: 280 }, { x: 1705, y: 1050 }, { x: 1875, y: 1050 },
  ];
  for (const lp of lamps3) drawStreetLamp(lp.x, lp.y, time);
}

// Backward-compatibility aliases
function drawPhase1RuralMap(time) { drawPhase1CcxhMap(time); }
function drawPhase2FactoryMap(time) { drawPhase2UnityMap(time); }
function drawPhase3SurveyMap(time) { drawPhase3AllianceMap(time); }
function drawPhase4PolicyHallMap(time) { drawPhase3AllianceMap(time); }

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
    // Phase 1 (Chương 5: Khảo Sát Cơ Cấu Xã Hội)
    case "bldg_ccxh_central":
    case "bldg_doan_xa":
      drawCcxhCentralBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_demographics":
    case "bldg_rice_field":
      drawDemographicsBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_production_means":
    case "bldg_granary":
      drawProductionMeansBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_benefit_distribution":
    case "bldg_tractor":
      drawBenefitDistributionBuilding(bx, by, bldg, time, isTarget);
      break;

    // Phase 2 (Chương 5: Biến Đổi Cơ Cấu Xã Hội - Giai Cấp)
    case "bldg_social_management":
    case "bldg_thanh_cong":
      drawSocialManagementBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_class_relations":
    case "bldg_yarn_warehouse":
      drawClassRelationsBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_ethnic_board":
    case "bldg_port":
      drawEthnicBoardBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_religious_board":
    case "bldg_director_office":
      drawReligiousBoardBuilding(bx, by, bldg, time, isTarget);
      break;

    // Phase 3 (Chương 5: Liên Minh Giai Cấp & CNH-HĐH)
    case "bldg_political_economy":
    case "bldg_tw_survey":
      drawPoliticalEconomyBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_alliance_hall":
    case "bldg_long_an_gov":
      drawAllianceHallBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_hightech_industry":
    case "bldg_rice_market":
      drawHighTechIndustryBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_eco_agriculture":
    case "bldg_river_port":
      drawEcoAgricultureBuilding(bx, by, bldg, time, isTarget);
      break;

    // Phase 4 (Chương 5: Đổi Mới Sáng Tạo & Doanh Nghiệp)
    case "bldg_innovation_hub":
    case "bldg_policy_hall":
      drawInnovationHubBuilding(bx, by, bldg, time, isTarget);
      break;
    case "bldg_enterprise_center":
    case "bldg_committee":
    case "bldg_institute":
    case "bldg_monument":
      drawEnterpriseCenterBuilding(bx, by, bldg, time, isTarget);
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


// ====================================================
// CHƯƠNG 5: CÁC CÔNG TRÌNH KIẾN TRÚC CƠ CẤU XÃ HỘI & LIÊN MINH
// ====================================================

// 1. Viện Hàn Lâm Khảo Sát Cơ Cấu Xã Hội (Neoclassical Academic Dome, Colonnade, Survey Globe)
function drawCcxhCentralBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#1e293b";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#38bdf8";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái vòm học thuật cổ điển xanh lam sapphire
  context.fillStyle = "#0369a1";
  context.beginPath();
  context.arc(bldg.x, by + 10, bldg.w * 0.35, Math.PI, 0);
  context.fill();
  context.strokeStyle = "#38bdf8";
  context.lineWidth = 2;
  context.stroke();

  // Đỉnh vòm: Quả cầu khảo sát cơ cấu xã hội xoay
  const orbY = by - bldg.w * 0.35 + 10;
  context.fillStyle = "#facc15";
  context.beginPath(); context.arc(bldg.x, orbY, 12, 0, Math.PI * 2); context.fill();
  context.strokeStyle = "#0284c7";
  context.lineWidth = 1.5;
  context.beginPath(); context.ellipse(bldg.x, orbY, 16, 6, time * 2, 0, Math.PI * 2); context.stroke();

  // Hàng cột học thuật Hy Lạp - La Mã
  const cols = 6;
  for (let c = 0; c < cols; c++) {
    const cx = bx + 25 + c * ((bldg.w - 50) / (cols - 1));
    context.fillStyle = "#cbd5e1";
    context.fillRect(cx - 5, by + 18, 10, bldg.h - 60);
    context.fillStyle = "#94a3b8";
    context.fillRect(cx - 7, by + 14, 14, 5);
    context.fillRect(cx - 7, by + bldg.h - 44, 14, 5);
  }

  // Cửa đại sảnh trung tâm
  const ex = bldg.stationX - 55;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#0c4a6e";
  context.fillRect(ex, ey, 110, 40);
  context.fillStyle = "#38bdf8";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🏛️ VIỆN HÀN LÂM CCXH", bldg.stationX, ey - 6);
}

// 2. Trung Tâm Cơ Cấu Dân Cư & Dân Tộc (Terracotta, Community Forum, Civic Crest)
function drawDemographicsBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#78350f";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#fbbf24";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái ngói đa tầng màu đất nung
  context.fillStyle = "#b45309";
  context.beginPath();
  context.moveTo(bx - 10, by + 18);
  context.lineTo(bldg.x, by - 24);
  context.lineTo(bx + bldg.w + 10, by + 18);
  context.closePath();
  context.fill();
  context.strokeStyle = "#facc15";
  context.lineWidth = 2;
  context.stroke();

  // Biểu tượng cộng đồng dân tộc
  context.fillStyle = "#fef08a";
  context.beginPath(); context.arc(bldg.x, by - 6, 14, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#78350f";
  context.font = "bold 12px sans-serif";
  context.textAlign = "center";
  context.fillText("👥", bldg.x, by - 2);

  // Cửa vòm dân tộc
  const cols = 4;
  for (let c = 0; c < cols; c++) {
    const wx = bx + 30 + c * ((bldg.w - 60) / cols);
    context.fillStyle = "#d97706";
    context.beginPath();
    context.arc(wx + 15, by + 46, 15, Math.PI, 0);
    context.fillRect(wx, by + 46, 30, 20);
    context.fill();
  }

  const ex = bldg.stationX - 50;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#451a03";
  context.fillRect(ex, ey, 100, 40);
  context.fillStyle = "#fde047";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🌐 CƠ CẤU DÂN CƯ", bldg.stationX, ey - 6);
}

// 3. Cục Quản Lý Tư Liệu Sản Xuất (Cobalt Steel Architecture & Logistics Gateway)
function drawProductionMeansBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#1e1b4b";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#6366f1";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái công nghiệp hiện đại vát thép
  context.fillStyle = "#312e81";
  context.fillRect(bx - 6, by - 12, bldg.w + 12, 22);
  context.fillStyle = "#818cf8";
  context.fillRect(bx, by + 6, bldg.w, 4);

  // Icon bánh răng tư liệu sản xuất xoay nhẹ
  const gearX = bldg.x;
  const gearY = by + 45;
  context.fillStyle = "#a5b4fc";
  context.beginPath(); context.arc(gearX, gearY, 20, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#1e1b4b";
  context.beginPath(); context.arc(gearX, gearY, 10, 0, Math.PI * 2); context.fill();

  // Băng chuyền điều phối tài sản
  context.fillStyle = "#4338ca";
  context.fillRect(bx + 20, by + 76, bldg.w - 40, 14);
  context.fillStyle = "#c7d2fe";
  for (let i = 0; i < 5; i++) {
    const px = (bx + 25 + i * 40 + time * 30) % (bldg.w - 50) + bx + 20;
    context.fillRect(px, by + 78, 12, 10);
  }

  const ex = bldg.stationX - 55;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#312e81";
  context.fillRect(ex, ey, 110, 40);
  context.fillStyle = "#818cf8";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("⚙️ QUẢN LÝ TLSX", bldg.stationX, ey - 6);
}

// 4. Viện Phân Phối Lợi Ích & Việc Làm (Emerald & Bronze Balance Facade)
function drawBenefitDistributionBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#064e3b";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#10b981";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái hiên xanh ngọc bích
  context.fillStyle = "#047857";
  context.fillRect(bx - 8, by - 14, bldg.w + 16, 24);
  context.fillStyle = "#34d399";
  context.fillRect(bx - 4, by + 6, bldg.w + 8, 4);

  // Cân công lý phân phối lợi ích hài hòa
  const sx = bldg.x;
  const sy = by + 45;
  context.strokeStyle = "#facc15";
  context.lineWidth = 2.5;
  context.beginPath();
  context.moveTo(sx, sy - 18); context.lineTo(sx, sy + 14);
  context.moveTo(sx - 26, sy - 8); context.lineTo(sx + 26, sy - 8);
  context.stroke();
  const tilt = Math.sin(time * 3) * 4;
  context.beginPath();
  context.arc(sx - 26, sy - 8 + tilt + 12, 10, 0, Math.PI);
  context.arc(sx + 26, sy - 8 - tilt + 12, 10, 0, Math.PI);
  context.fillStyle = "#facc15";
  context.fill();

  const ex = bldg.stationX - 55;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#022c22";
  context.fillRect(ex, ey, 110, 40);
  context.fillStyle = "#34d399";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("⚖️ PHÂN PHỐI LỢI ÍCH", bldg.stationX, ey - 6);
}

// 5. Trung Tâm Quản Lý Xã Hội (Grand Civic Palace, High Glass Atrium, State Seal)
function drawSocialManagementBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#0f172a";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#38bdf8";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái vòm kính hiện đại phản quang
  context.fillStyle = "#0284c7";
  context.beginPath();
  context.arc(bldg.x, by + 12, bldg.w * 0.38, Math.PI, 0);
  context.fill();
  context.strokeStyle = "#38bdf8";
  context.lineWidth = 2;
  context.stroke();

  // Biểu tượng sao vàng quản lý nhà nước
  context.fillStyle = "#dc2626";
  context.fillRect(bldg.x - 18, by - 36, 36, 24);
  context.fillStyle = "#facc15";
  context.font = "bold 14px sans-serif";
  context.textAlign = "center";
  context.fillText("★", bldg.x, by - 19);

  // Cửa kính thông minh LED
  const cols = 5;
  for (let c = 0; c < cols; c++) {
    const wx = bx + 24 + c * ((bldg.w - 48) / cols);
    context.fillStyle = "#0369a1";
    context.fillRect(wx, by + 40, 24, 28);
    context.fillStyle = "#7dd3fc";
    context.fillRect(wx + 3, by + 43, 18, 22);
  }

  const ex = bldg.stationX - 60;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#0c4a6e";
  context.fillRect(ex, ey, 120, 40);
  context.fillStyle = "#38bdf8";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🏛️ QUẢN LÝ XÃ HỘI", bldg.stationX, ey - 6);
}

// 6. Cục Nghiên Cứu Quan Hệ Giai Cấp (Solidarity Colonnade & Matrix Screen)
function drawClassRelationsBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#1e1b4b";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#a855f7";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái vòm tím hoàng gia
  context.fillStyle = "#581c87";
  context.fillRect(bx - 6, by - 14, bldg.w + 12, 24);
  context.fillStyle = "#c084fc";
  context.fillRect(bx, by + 6, bldg.w, 4);

  // Ma trận 4 khối giai cấp kết nối
  const mx = bldg.x;
  const my = by + 46;
  const pts = [
    { x: mx - 20, y: my - 12, label: "CN", col: "#38bdf8" },
    { x: mx + 20, y: my - 12, label: "ND", col: "#4ade80" },
    { x: mx - 20, y: my + 14, label: "TT", col: "#c084fc" },
    { x: mx + 20, y: my + 14, label: "DN", col: "#facc15" },
  ];
  context.strokeStyle = "rgba(255, 255, 255, 0.4)";
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(pts[0].x, pts[0].y); context.lineTo(pts[1].x, pts[1].y);
  context.lineTo(pts[3].x, pts[3].y); context.lineTo(pts[2].x, pts[2].y);
  context.closePath();
  context.stroke();
  for (const p of pts) {
    context.fillStyle = p.col;
    context.beginPath(); context.arc(p.x, p.y, 8, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#000000";
    context.font = "bold 8px sans-serif";
    context.textAlign = "center";
    context.fillText(p.label, p.x, p.y + 3);
  }

  const ex = bldg.stationX - 55;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#3b0764";
  context.fillRect(ex, ey, 110, 40);
  context.fillStyle = "#c084fc";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🤝 QUAN HỆ GIAI CẤP", bldg.stationX, ey - 6);
}

// 7. Ban Cơ Cấu Dân Tộc & Tôn Giáo (Multicultural Solidarity Pavilion)
function drawEthnicBoardBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#7c2d12";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#f97316";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái nhà rông cách điệu vút cao đại ngàn
  context.fillStyle = "#9a3412";
  context.beginPath();
  context.moveTo(bx - 12, by + 16);
  context.lineTo(bldg.x, by - 36);
  context.lineTo(bx + bldg.w + 12, by + 16);
  context.closePath();
  context.fill();
  context.strokeStyle = "#fbbf24";
  context.lineWidth = 2;
  context.stroke();

  // Hoa văn thổ cẩm mặt tiền
  context.fillStyle = "#facc15";
  for (let i = 0; i < 6; i++) {
    const fx = bx + 20 + i * ((bldg.w - 40) / 5);
    context.beginPath();
    context.moveTo(fx, by + 26);
    context.lineTo(fx + 6, by + 34);
    context.lineTo(fx - 6, by + 34);
    context.closePath();
    context.fill();
  }

  const ex = bldg.stationX - 55;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#431407";
  context.fillRect(ex, ey, 110, 40);
  context.fillStyle = "#fb923c";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🌿 DÂN TỘC & TÔN GIÁO", bldg.stationX, ey - 6);
}

// 8. Viện Phân Tích Biến Đổi Xã Hội (Ivory & Amber Rotunda, Harmony Arches)
function drawReligiousBoardBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#451a03";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#eab308";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái cong hài hòa màu hổ phách
  context.fillStyle = "#b45309";
  context.beginPath();
  context.arc(bldg.x, by + 14, bldg.w * 0.32, Math.PI, 0);
  context.fill();
  context.strokeStyle = "#fef08a";
  context.lineWidth = 2;
  context.stroke();

  // Biểu tượng biến đổi xã hội hình sóng tiến hóa
  context.strokeStyle = "#facc15";
  context.lineWidth = 3;
  context.beginPath();
  for (let i = 0; i < 60; i++) {
    const wx = bldg.x - 30 + i;
    const wy = by + 50 + Math.sin(time * 3 + i * 0.15) * 8;
    if (i === 0) context.moveTo(wx, wy); else context.lineTo(wx, wy);
  }
  context.stroke();

  const ex = bldg.stationX - 55;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#292524";
  context.fillRect(ex, ey, 110, 40);
  context.fillStyle = "#facc15";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("📊 BIẾN ĐỔI XÃ HỘI", bldg.stationX, ey - 6);
}

// 9. Trung Tâm Kinh Tế - Xã Hội (Financial & Macroeconomic Pulse)
function drawPoliticalEconomyBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#090d16";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#38bdf8";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái vòm kim loại cao cấp
  context.fillStyle = "#0369a1";
  context.fillRect(bx - 6, by - 12, bldg.w + 12, 22);
  context.fillStyle = "#38bdf8";
  context.fillRect(bx, by + 6, bldg.w, 4);

  // Đồ thị nhịp đập kinh tế số LED
  context.fillStyle = "#0c4a6e";
  context.fillRect(bx + 18, by + 34, bldg.w - 36, 32);
  context.strokeStyle = "#38bdf8";
  context.lineWidth = 2;
  context.beginPath();
  for (let i = 0; i < bldg.w - 44; i += 8) {
    const py = by + 50 + Math.sin(time * 4 + i * 0.2) * 10;
    if (i === 0) context.moveTo(bx + 22 + i, py); else context.lineTo(bx + 22 + i, py);
  }
  context.stroke();

  const ex = bldg.stationX - 55;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#082f49";
  context.fillRect(ex, ey, 110, 40);
  context.fillStyle = "#38bdf8";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("📈 KINH TẾ - XÃ HỘI", bldg.stationX, ey - 6);
}

// 10. Đại Hội Trường Liên Minh 4 Khối (Monumental Alliance Hall, 4 Grand Pillars)
function drawAllianceHallBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#450a0a";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#ef4444";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái ngói đỏ vĩ đại của Hội trường Liên Minh
  context.fillStyle = "#991b1b";
  context.beginPath();
  context.moveTo(bx - 16, by + 18);
  context.lineTo(bldg.x, by - 36);
  context.lineTo(bx + bldg.w + 16, by + 18);
  context.closePath();
  context.fill();
  context.strokeStyle = "#facc15";
  context.lineWidth = 2.5;
  context.stroke();

  // Ngôi sao vàng trên đỉnh vòm
  context.fillStyle = "#facc15";
  context.font = "bold 18px sans-serif";
  context.textAlign = "center";
  context.fillText("⭐", bldg.x, by - 12);

  // 4 cột trụ đại diện cho 4 khối liên minh
  const pillarLabels = ["CÔNG", "NÔNG", "TRÍ", "DOANH"];
  const pillarColors = ["#38bdf8", "#4ade80", "#c084fc", "#facc15"];
  for (let i = 0; i < 4; i++) {
    const px = bx + 30 + i * ((bldg.w - 60) / 3);
    context.fillStyle = "#f8fafc";
    context.fillRect(px - 6, by + 18, 12, bldg.h - 60);
    context.fillStyle = pillarColors[i];
    context.fillRect(px - 8, by + 14, 16, 5);
    context.fillRect(px - 8, by + bldg.h - 44, 16, 5);
    context.font = "bold 7px sans-serif";
    context.textAlign = "center";
    context.fillText(pillarLabels[i], px, by + 30);
  }

  const ex = bldg.stationX - 60;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#7f1d1d";
  context.fillRect(ex, ey, 120, 40);
  context.fillStyle = "#facc15";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🏛️ HỘI TRƯỜNG LIÊN MINH", bldg.stationX, ey - 6);
}

// 11. Tổ Hợp Công Nghiệp Công Nghệ Cao (Đại diện giai cấp Công nhân)
function drawHighTechIndustryBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#0f172a";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#0284c7";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái thép công nghiệp xanh neon & tấm pin năng lượng mặt trời
  context.fillStyle = "#0369a1";
  context.fillRect(bx - 6, by - 14, bldg.w + 12, 24);
  context.fillStyle = "#38bdf8";
  context.fillRect(bx, by + 6, bldg.w, 4);

  // Cánh tay robot tự động hoạt họa
  const armX = bldg.x;
  const armY = by + 46;
  const armAngle = Math.sin(time * 3) * 0.4;
  context.strokeStyle = "#eab308";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(armX - 16, armY);
  context.lineTo(armX, armY - 14 + Math.sin(armAngle) * 6);
  context.lineTo(armX + 16, armY + Math.cos(armAngle) * 6);
  context.stroke();

  // Biểu tượng công nhân tiên phong
  context.fillStyle = "#38bdf8";
  context.font = "bold 14px sans-serif";
  context.textAlign = "center";
  context.fillText("⚙️🔧", bldg.x, by + 74);

  const ex = bldg.stationX - 55;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#0c4a6e";
  context.fillRect(ex, ey, 110, 40);
  context.fillStyle = "#38bdf8";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("⚙️ CÔNG NGHIỆP CÔNG NGHỆ CAO", bldg.stationX, ey - 6);
}

// 12. Trung Tâm Nông Nghiệp Sinh Thái Hiện Đại (Đại diện giai cấp Nông dân)
function drawEcoAgricultureBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#064e3b";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#10b981";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Nhà kính vòm thủy canh hiện đại
  context.fillStyle = "#047857";
  context.beginPath();
  context.arc(bldg.x, by + 12, bldg.w * 0.36, Math.PI, 0);
  context.fill();
  context.strokeStyle = "#34d399";
  context.lineWidth = 2;
  context.stroke();

  // Bông lúa vàng sinh thái
  context.fillStyle = "#facc15";
  context.font = "bold 16px sans-serif";
  context.textAlign = "center";
  context.fillText("🌾🌿", bldg.x, by + 46);

  // Vườn thẳng đứng khí canh
  context.fillStyle = "#059669";
  context.fillRect(bx + 16, by + 56, bldg.w - 32, 14);
  context.fillStyle = "#a7f3d0";
  for (let i = 0; i < 7; i++) {
    context.fillRect(bx + 20 + i * ((bldg.w - 48) / 6), by + 58, 8, 10);
  }

  const ex = bldg.stationX - 55;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#022c22";
  context.fillRect(ex, ey, 110, 40);
  context.fillStyle = "#34d399";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("🌾 NÔNG NGHIỆP SINH THÁI", bldg.stationX, ey - 6);
}

// 13. Viện Đổi Mới Sáng Tạo & Trí Thức (Đại diện đội ngũ Trí thức)
function drawInnovationHubBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#1e1b4b";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#a855f7";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Tháp pha lê công nghệ tri thức đỉnh cao
  context.fillStyle = "#581c87";
  context.beginPath();
  context.moveTo(bldg.x - 24, by + 14);
  context.lineTo(bldg.x, by - 42);
  context.lineTo(bldg.x + 24, by + 14);
  context.closePath();
  context.fill();
  context.strokeStyle = "#e879f9";
  context.lineWidth = 2;
  context.stroke();

  // Pha lê lượng tử phát sáng
  const pulseR = 8 + Math.sin(time * 5) * 3;
  context.fillStyle = "#c084fc";
  context.beginPath(); context.arc(bldg.x, by - 16, pulseR, 0, Math.PI * 2); context.fill();

  // Biểu tượng trí tuệ sáng tạo
  context.fillStyle = "#e9d5ff";
  context.font = "bold 14px sans-serif";
  context.textAlign = "center";
  context.fillText("💡🧪", bldg.x, by + 52);

  const ex = bldg.stationX - 55;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#3b0764";
  context.fillRect(ex, ey, 110, 40);
  context.fillStyle = "#c084fc";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("💡 ĐỔI MỚI SÁNG TẠO", bldg.stationX, ey - 6);
}

// 14. Trung Tâm Doanh Nhân & Hợp Tác (Đại diện đội ngũ Doanh nhân)
function drawEnterpriseCenterBuilding(bx, by, bldg, time, isTarget) {
  context.fillStyle = "#18181b";
  context.fillRect(bx, by, bldg.w, bldg.h - 35);
  context.strokeStyle = isTarget ? "#facc15" : "#fbbf24";
  context.lineWidth = 3;
  context.strokeRect(bx, by, bldg.w, bldg.h - 35);

  // Mái vát kính cao cấp mạ vàng
  context.fillStyle = "#27272a";
  context.fillRect(bx - 6, by - 14, bldg.w + 12, 24);
  context.fillStyle = "#facc15";
  context.fillRect(bx, by + 6, bldg.w, 4);

  // Huy hiệu vàng thương gia
  context.fillStyle = "#facc15";
  context.beginPath(); context.arc(bldg.x, by + 42, 16, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#18181b";
  context.font = "bold 13px sans-serif";
  context.textAlign = "center";
  context.fillText("💼", bldg.x, by + 47);

  // Cửa kính sang trọng
  const cols = 5;
  for (let c = 0; c < cols; c++) {
    const wx = bx + 22 + c * ((bldg.w - 44) / cols);
    context.fillStyle = "#3f3f46";
    context.fillRect(wx, by + 64, 22, 14);
  }

  const ex = bldg.stationX - 55;
  const ey = by + bldg.h - 40;
  context.fillStyle = "#27272a";
  context.fillRect(ex, ey, 110, 40);
  context.fillStyle = "#fde047";
  context.font = "bold 10px sans-serif";
  context.textAlign = "center";
  context.fillText("💼 DOANH NHÂN & HỢP TÁC", bldg.stationX, ey - 6);
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

  ctx.save();
  if (isLocal && state.carHitCooldown > 0) {
    if (Math.floor(time * 15) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }
  }

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

  // ----------------------------------------------------
  // TORSO / OUTFIT & CLASS IDENTIFIERS
  // ----------------------------------------------------
  const isWorker = charId === "worker_leader" || charId === "det_thanh_cong_industry";
  const isFarmer = charId === "farmer_strategic" || charId === "doan_xa_agriculture";
  const isIntellectual = charId === "intellectual_core" || charId === "long_an_reform";
  const isEntrepreneur = charId === "entrepreneur_dynamic" || charId === "ba_thi_distribution";

  if (isWorker) {
    // Công nhân: Áo bảo hộ xanh dương công nghiệp + sọc phản quang neon vàng
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(x - 8, bobY - 6, 16, 11);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(x - 8, bobY - 2, 16, 3);
  } else if (isFarmer) {
    // Nông dân: Áo bà ba truyền thống + Khăn rằn Nam Bộ đỏ trắng vắt vai
    ctx.fillStyle = "#15803d";
    ctx.fillRect(x - 8, bobY - 6, 16, 11);
    // Khăn rằn
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(x - 6, bobY - 6, 3, 10);
    ctx.fillRect(x + 3, bobY - 6, 3, 10);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - 6, bobY - 4, 3, 2);
    ctx.fillRect(x + 3, bobY - 4, 3, 2);
  } else if (isIntellectual) {
    // Trí thức: Áo vest học thuật tím thẫm / xanh navy + cổ sơ mi trắng + bút ngực
    ctx.fillStyle = "#4338ca";
    ctx.fillRect(x - 8, bobY - 6, 16, 11);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(x - 4, bobY - 6); ctx.lineTo(x + 4, bobY - 6); ctx.lineTo(x, bobY - 1);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#38bdf8"; // Cây bút cài túi
    ctx.fillRect(x - 6, bobY - 3, 2, 4);
  } else if (isEntrepreneur) {
    // Doanh nhân: Bộ vest cao cấp đen than + cà vạt vàng cam lụa + huy hiệu vàng
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(x - 8, bobY - 6, 16, 11);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(x - 4, bobY - 6); ctx.lineTo(x + 4, bobY - 6); ctx.lineTo(x, bobY - 1);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#f59e0b"; // Cà vạt vàng lụa
    ctx.fillRect(x - 1, bobY - 4, 2, 6);
    ctx.fillStyle = "#facc15"; // Huy hiệu mạ vàng
    ctx.fillRect(x - 6, bobY - 4, 2, 2);
  } else {
    // Cán bộ mặc định
    ctx.fillStyle = color;
    ctx.fillRect(x - 8, bobY - 6, 16, 11);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(x - 4, bobY - 6); ctx.lineTo(x + 4, bobY - 6); ctx.lineTo(x, bobY - 1);
    ctx.closePath(); ctx.fill();
    if (gender === "male") {
      ctx.fillStyle = "#b91c1c";
      ctx.fillRect(x - 1, bobY - 4, 2, 6);
    }
  }

  // Arms & Sleeves
  const armColor = isWorker ? "#0284c7" : isFarmer ? "#15803d" : isIntellectual ? "#4338ca" : isEntrepreneur ? "#0f172a" : color;
  ctx.fillStyle = armColor;
  ctx.fillRect(x - 10, bobY - 5 - footOffset * 0.5, 3, 8);
  ctx.fillRect(x + 7, bobY - 5 + footOffset * 0.5, 3, 8);
  ctx.fillStyle = "#fed7aa";
  ctx.fillRect(x - 10, bobY + 3 - footOffset * 0.5, 3, 3);
  ctx.fillRect(x + 7, bobY + 3 + footOffset * 0.5, 3, 3);

  // Tools & Items in hands
  if (isWorker) {
    // Mỏ lết thép trên tay phải
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(x + 9, bobY + 2 - footOffset * 0.5, 2, 6);
    ctx.fillRect(x + 8, bobY + 1 - footOffset * 0.5, 4, 2);
  } else if (isFarmer) {
    // Bông lúa vàng trên tay phải
    ctx.fillStyle = "#ca8a04";
    ctx.fillRect(x + 9, bobY + 1 - footOffset * 0.5, 2, 6);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(x + 9, bobY - 3 - footOffset * 0.5, 3, 4);
  } else if (isIntellectual) {
    // Máy tính bảng thông minh / kẹp tài liệu tay trái
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(x - 13, bobY + 1 - footOffset * 0.5, 4, 7);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(x - 12, bobY + 2 - footOffset * 0.5, 2, 5);
  } else if (isEntrepreneur) {
    // Cặp táp doanh nhân tay phải
    ctx.fillStyle = "#78350f";
    ctx.fillRect(x + 9, bobY + 2 - footOffset * 0.5, 5, 5);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(x + 11, bobY + 3 - footOffset * 0.5, 1, 2);
  }

  // Head & Skin Tone
  ctx.fillStyle = "#fed7aa";
  ctx.fillRect(x - 6, bobY - 17, 12, 11);

  // Eyes & Eyewear
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 4, bobY - 12, 2, 3);
  ctx.fillRect(x + 2, bobY - 12, 2, 3);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 3, bobY - 12, 1, 1);
  ctx.fillRect(x + 3, bobY - 12, 1, 1);

  if (isIntellectual) {
    // Kính trí thức gọng xanh cyan
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 5, bobY - 13, 4, 4);
    ctx.strokeRect(x + 1, bobY - 13, 4, 4);
    ctx.beginPath(); ctx.moveTo(x - 1, bobY - 11); ctx.lineTo(x + 1, bobY - 11); ctx.stroke();
  }

  // Soft Blush for Female Characters
  if (gender === "female") {
    ctx.fillStyle = "rgba(244, 114, 182, 0.85)";
    ctx.fillRect(x - 5, bobY - 9, 2, 1.5);
    ctx.fillRect(x + 3, bobY - 9, 2, 1.5);
  }

  // Distinct Hairstyle & Headgear for the 4 Classes
  const hairColor = options.hairColor || (gender === "female" ? "#1c1917" : "#331800");

  if (isWorker) {
    // Nón bảo hộ công nghiệp vàng tươi + đèn pin an toàn
    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.arc(x, bobY - 16, 8, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x - 8, bobY - 17, 16, 3);
    // Đèn nón pin trắng
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - 2, bobY - 20, 4, 3);
  } else if (isFarmer) {
    // Nón lá Việt Nam vành rộng truyền thống
    ctx.fillStyle = "#d97706";
    ctx.beginPath();
    ctx.moveTo(x - 11, bobY - 15);
    ctx.lineTo(x, bobY - 26);
    ctx.lineTo(x + 11, bobY - 15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#fde047";
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (isIntellectual) {
    // Tóc nhà khoa học / học giả bồng bềnh lịch lãm
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x - 7, bobY - 21, 14, 6);
    ctx.fillRect(x - 8, bobY - 18, 3, 7);
    ctx.fillRect(x + 5, bobY - 18, 3, 7);
  } else if (isEntrepreneur) {
    // Tóc doanh nhân chải chuốt bóng mượt
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(x - 7, bobY - 21, 14, 6);
    ctx.fillRect(x - 7, bobY - 18, 2, 5);
    ctx.fillRect(x + 5, bobY - 18, 2, 5);
    ctx.fillStyle = "#334155";
    ctx.fillRect(x - 4, bobY - 22, 8, 2);
  } else {
    // Mặc định
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
          targetLabel = `💖 HỖ TRỢ: ${unassistedCitizen.name}`;
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

  // 💫 CAR HIT DIZZY STUN EFFECT (Spinning stars & stun badge)
  if (isLocal && state.dizzyTimer > 0) {
    ctx.save();
    const starCount = 3;
    const starRadius = 18;
    const spinAngle = time * 7;
    for (let i = 0; i < starCount; i++) {
      const angle = spinAngle + (i * (Math.PI * 2 / starCount));
      const starX = x + Math.cos(angle) * starRadius;
      const starY = (bobY - 34) + Math.sin(angle) * (starRadius * 0.4);
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⭐", starX, starY);
    }

    // Floating Stun Status Badge
    ctx.fillStyle = "rgba(220, 38, 38, 0.95)";
    ctx.fillRect(x - 42, bobY - 56, 84, 16);
    ctx.strokeStyle = "#fde047";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 42, bobY - 56, 84, 16);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("😵 CHOÁNG VÁNG!", x, bobY - 44);
    ctx.restore();
  }

  ctx.restore();
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
    // ⭐ Hòm Văn Kiện Cương Lĩnh Đặc Biệt (Executive Red & Gold Archive Chest)
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

    // Red-gold Executive Archive Chest
    ctx.fillStyle = "#7f1d1d";
    ctx.fillRect(x - 13, floatY - 11, 26, 22);
    ctx.fillStyle = "#991b1b";
    ctx.fillRect(x - 11, floatY - 9, 22, 18);
    // Gold straps and handle
    ctx.fillStyle = "#facc15";
    ctx.fillRect(x - 8, floatY - 14, 16, 4);
    ctx.fillRect(x - 7, floatY - 9, 3, 18);
    ctx.fillRect(x + 4, floatY - 9, 3, 18);
    ctx.fillRect(x - 3, floatY - 2, 6, 5);

    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⭐", x, floatY + 3);

  } else if (type === "ccxh_survey_data" || type === "rice_sheaf" || type === "rice" || phaseKey === "phase_1") {
    // 📊 Hồ Sơ Khảo Sát Cơ Cấu Xã Hội (Cyan Data Crystal)
    ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
    ctx.beginPath(); ctx.arc(x, floatY, glowRadius, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#0369a1";
    ctx.fillRect(x - 11, floatY - 13, 22, 26);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(x - 9, floatY - 11, 18, 22);
    ctx.fillStyle = "#0c4a6e";
    ctx.fillRect(x - 7, floatY - 8, 14, 16);

    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📊", x, floatY + 5);

  } else if (type === "class_structure_doc" || type === "yarn_spool" || type === "cotton" || phaseKey === "phase_2") {
    // 📜 Hồ Sơ Biến Đổi Cơ Cấu Giai Cấp (Gold Parchment & Crimson Seal)
    ctx.fillStyle = "rgba(245, 158, 11, 0.35)";
    ctx.beginPath(); ctx.arc(x, floatY, glowRadius, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#78350f";
    ctx.fillRect(x - 11, floatY - 13, 22, 26);
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(x - 9, floatY - 11, 18, 22);
    ctx.fillStyle = "#dc2626";
    ctx.beginPath(); ctx.arc(x, floatY + 3, 5, 0, Math.PI * 2); ctx.fill();

    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📜", x, floatY + 5);

  } else {
    // ⭐ Văn Kiện Liên Minh 4 Khối (Alliance Red & Gold Treaty)
    ctx.fillStyle = "rgba(220, 38, 38, 0.35)";
    ctx.beginPath(); ctx.arc(x, floatY, glowRadius, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#991b1b";
    ctx.fillRect(x - 12, floatY - 14, 24, 28);
    ctx.fillStyle = "#fef2f2";
    ctx.fillRect(x - 10, floatY - 12, 20, 24);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(x - 10, floatY - 12, 20, 4);

    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⭐", x, floatY + 5);
  }

  // Label tag above item (Dynamic width with full Vietnamese support)
  const label = entity.label || (
    type === "crisis_pkg" ? "Văn Kiện Đặc Biệt (+10đ)" :
    phaseKey === "phase_1" ? "Hồ Sơ CCXH" :
    phaseKey === "phase_2" ? "Biến Đổi CCXH" : "Văn Kiện Liên Minh"
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
  ctx.fillText("💬 CẦN HỖ TRỢ", x, bubbleY + 1);

  // Floating Pulsing Heart above
  const heartScale = 1 + Math.sin(time * 6) * 0.2;
  ctx.fillStyle = "#ec4899";
  ctx.font = `bold ${Math.round(13 * heartScale)}px sans-serif`;
  ctx.fillText("❤️", x, bubbleY - 15);

  // Footer Tag (Dynamic Width)
  const citizenLabel = "Hỗ trợ đại biểu (+8đ)";
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

  if (type === "bias_prejudice") {
    // ⚡ Định Kiến Xã Hội
    ctx.fillStyle = "#4c1d95";
    ctx.fillRect(x - 12, y - 12, 24, 24);
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 12, y - 12, 24, 24);
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚡", x, y + 5);
  } else if (type === "imbalance_dist") {
    // ⚖️ Mất Cân Đối Phân Phối
    ctx.fillStyle = "#7c2d12";
    ctx.fillRect(x - 12, y - 12, 24, 24);
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 12, y - 12, 24, 24);
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚖️", x, y + 5);
  } else if (type === "class_divide") {
    // 💥 Chia Rẽ Giai Tầng
    ctx.fillStyle = "#831843";
    ctx.fillRect(x - 12, y - 12, 24, 24);
    ctx.strokeStyle = "#ec4899";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 12, y - 12, 24, 24);
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("💥", x, y + 5);
  } else if (type === "polarization") {
    // ↔️ Phân Hóa Giàu Nghèo
    ctx.fillStyle = "#701a75";
    ctx.fillRect(x - 12, y - 12, 24, 24);
    ctx.strokeStyle = "#d946ef";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 12, y - 12, 24, 24);
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("↔️", x, y + 5);
  } else if (type === "alliance_sabotage") {
    // 💣 Phá Hoại Liên Minh
    ctx.fillStyle = "#7f1d1d";
    ctx.fillRect(x - 12, y - 12, 24, 24);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 12, y - 12, 24, 24);
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("💣", x, y + 5);
  } else if (type === "bureaucracy") {
    // 📑 Quan Liêu Trì Trệ
    ctx.fillStyle = "#334155";
    ctx.fillRect(x - 12, y - 12, 24, 24);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 12, y - 12, 24, 24);
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📑", x, y + 5);
  } else {
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.moveTo(x, y - 14); ctx.lineTo(x + 14, y + 10); ctx.lineTo(x - 14, y + 10);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.5;
    ctx.stroke();
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
  // Ground zones & roads on Minimap
  context.fillStyle = "rgba(51, 65, 85, 0.65)";
  if (phaseKey === "phase_1") {
    context.fillRect(mmX, mapToMmY(580), mmW, (180 / MAP_HEIGHT) * mmH);
    context.fillRect(mapToMmX(520), mmY, (140 / MAP_WIDTH) * mmW, mmH);
    context.fillRect(mapToMmX(1560), mmY, (140 / MAP_WIDTH) * mmW, mmH);
  } else if (phaseKey === "phase_2") {
    context.fillRect(mmX, mapToMmY(580), mmW, (180 / MAP_HEIGHT) * mmH);
    context.fillRect(mapToMmX(1130), mmY, (140 / MAP_WIDTH) * mmW, mmH);
    context.fillStyle = "rgba(180, 83, 9, 0.35)";
    context.fillRect(mapToMmX(640), mapToMmY(480), (1120 / MAP_WIDTH) * mmW, (440 / MAP_HEIGHT) * mmH);
  } else {
    // Phase 3 & 4 Siêu Đô Thị
    context.fillStyle = "rgba(10, 15, 29, 0.85)";
    context.fillRect(mmX, mapToMmY(580), mmW, (180 / MAP_HEIGHT) * mmH);
    context.fillRect(mapToMmX(540), mmY, (140 / MAP_WIDTH) * mmW, mmH);
    context.fillRect(mapToMmX(1720), mmY, (140 / MAP_WIDTH) * mmW, mmH);
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

  // 2.1 Dynamic City Traffic Vehicles (Strictly running on road lanes)
  drawTrafficVehicles(context, time);

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
        characterId: rendered?.character || rendered?.roleId || remote.character || remote.roleId || "worker_leader",
        gender: rendered?.gender || remote.gender || ((remote.character || remote.roleId)?.startsWith("female") ? "female" : "male"),
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

    // Class Perk Active Badge (Below Tracker)
    const charId = state.player.characterId;
    let perkText = "";
    let perkCol = "#38bdf8";
    if (charId === "worker_leader") {
      perkText = `🛡️ KHIÊN CÔNG NHÂN: ${state.workerShield ? "SẴN SÀNG" : "ĐÃ HẾT"}`;
      perkCol = state.workerShield ? "#38bdf8" : "#94a3b8";
    } else if (charId === "farmer_strategic") {
      perkText = "🌾 ĐẶC QUYỀN NÔNG DÂN: +1Đ MỖI DỮ LIỆU";
      perkCol = "#34d399";
    } else if (charId === "intellectual_core") {
      perkText = "💡 TUỆ GIÁC TRÍ THỨC: LOẠI TRỪ 1 ĐÁP ÁN SAI";
      perkCol = "#c084fc";
    } else if (charId === "entrepreneur_dynamic") {
      const cd = Math.ceil(state.dashCooldown || 0);
      perkText = `⚡ BỨT PHÁ DOANH NHÂN: [SHIFT/Q] ${cd > 0 ? `(${cd}s)` : "SẴN SÀNG"}`;
      perkCol = cd > 0 ? "#94a3b8" : "#fde047";
    }

    if (perkText) {
      const perkY = trackerY + trackerH + 6;
      context.fillStyle = "rgba(15, 23, 42, 0.9)";
      context.fillRect(trackerX, perkY, trackerW, 20);
      context.strokeStyle = perkCol;
      context.lineWidth = 1;
      context.strokeRect(trackerX, perkY, trackerW, 20);
      context.fillStyle = perkCol;
      context.font = "bold 9px 'Segoe UI', 'Inter', system-ui, sans-serif";
      context.textAlign = "left";
      context.fillText(perkText, trackerX + 8, perkY + 14);
    }
  }

  // Top Right BGM Sound Toggle Button (rendered on canvas for player role)
  if (options.role === "player") {
    const soundBtnW = 146;
    const soundBtnH = 26;
    const soundBtnX = VIEW_WIDTH - soundBtnW - 14;
    const soundBtnY = 14;
    context.fillStyle = bgmEnabled ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)";
    context.fillRect(soundBtnX, soundBtnY, soundBtnW, soundBtnH);
    context.strokeStyle = bgmEnabled ? "#10b981" : "#ef4444";
    context.lineWidth = 1.5;
    context.strokeRect(soundBtnX, soundBtnY, soundBtnW, soundBtnH);
    context.fillStyle = bgmEnabled ? "#34d399" : "#fca5a5";
    context.font = "bold 10px 'Segoe UI', 'Inter', system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText(bgmEnabled ? "🔊 NHẠC (Lovely Garden)" : "🔇 TẮT NHẠC", soundBtnX + soundBtnW / 2, soundBtnY + 17);
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

  if (state.dizzyTimer > 0) {
    state.dizzyTimer -= deltaSeconds;
    if (state.dizzyTimer < 0) state.dizzyTimer = 0;
  }

  if (state.carHitCooldown > 0) {
    state.carHitCooldown -= deltaSeconds;
    if (state.carHitCooldown < 0) state.carHitCooldown = 0;
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
  updateTrafficVehicles(deltaSeconds);
  advanceRemotePlayers(deltaSeconds);

  // Move player with SOLID BUILDING COLLISION BLOCKING (Direct Keyboard & D-Pad Control)
  if (!state.frozen && state.freezeTimer <= 0 && state.dizzyTimer <= 0 && options.role === "player" && activeInput()) {
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
  getAudioContext();
  startBgm();

  if (state.frozen || state.freezeTimer > 0) {
    event.preventDefault();
    return;
  }

  if (
    event.code === "ShiftLeft" ||
    event.code === "ShiftRight" ||
    event.code === "KeyQ" ||
    event.key === "q" ||
    event.key === "Q"
  ) {
    event.preventDefault();
    triggerClassPerk();
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
  startBgm();

  if (options.role === "host") {
    hostDragging = true;
    hostLastX = event.clientX;
    hostLastY = event.clientY;
    return;
  }

  // Focus game frame so keyboard commands work immediately
  window.focus();
  try { canvas.focus(); } catch (_) {}

  const rect = canvas.getBoundingClientRect();
  const clickCanvasX = (event.clientX - rect.left) * (VIEW_WIDTH / rect.width);
  const clickCanvasY = (event.clientY - rect.top) * (VIEW_HEIGHT / rect.height);

  // Check if clicked Top Right Sound Toggle Button
  if (clickCanvasX >= VIEW_WIDTH - 160 && clickCanvasX <= VIEW_WIDTH - 14 && clickCanvasY >= 14 && clickCanvasY <= 40) {
    toggleBgm();
    return;
  }

  if (state.frozen || state.freezeTimer > 0) return;

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
    const prevPhaseStatus = state.phaseStatus;
    const nextPhaseStatus = typeof message.phaseStatus === "string" ? message.phaseStatus : "active";
    state.phaseStatus = nextPhaseStatus;

    if (nextPhaseStatus === "resolved") {
      stopBgm();
    } else if (nextPhaseStatus === "active" && (prevPhaseStatus === "resolved" || !lovelyGardenAudio || lovelyGardenAudio.paused)) {
      startBgm();
    }

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
  } else if (message.type === "TOGGLE_BGM") {
    toggleBgm();
  } else if (message.type === "SET_BGM_MUTED") {
    toggleBgm(!message.muted);
  } else if (message.type === "ACTIVATE_PERK") {
    triggerClassPerk();
  }
});

// Initial Setup
setStatus(options.role === "host" ? "Chế độ Host sẵn sàng" : `Cán bộ ${options.playerName} sẵn sàng`);
postToParent({ type: "RPG_READY", role: options.role, playerId: options.playerId });
requestAnimationFrame(frame);
