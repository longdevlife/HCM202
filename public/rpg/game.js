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
    playTone(523.25, "square", 0.08, 0.15); // C5
    setTimeout(() => playTone(659.25, "square", 0.08, 0.15), 60); // E5
    setTimeout(() => playTone(783.99, "square", 0.08, 0.15), 120); // G5
    setTimeout(() => playTone(1046.5, "triangle", 0.15, 0.2), 180); // C6
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
      size: Math.random() * 3 + 2,
      life: 0,
      maxLife: Math.random() * 0.4 + 0.3,
    });
  }
}

function spawnFloatingText(x, y, text, color = "#ffdf6e") {
  floatingTexts.push({
    x,
    y: y - 10,
    text,
    color,
    life: 0,
    maxLife: 1.2,
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
    animFrame: 0,
  },
  collectedIds: new Set(),
  resolvedCollisionIds: new Set(),
  hazardCooldownUntil: 0,
  lastMovePostedAt: 0,
  lastFrameAt: performance.now(),
  gameTime: 0,
  screenShakeTimer: 0,
  screenShakeIntensity: 0,
  scanlines: true,
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

// Handle Collisions
function handleCollision(entity, now) {
  if (options.role !== "player") return;
  if (isEntityResolvedForPlayer(entity, options.playerId)) return;
  const radius = Number.isFinite(entity.radius) ? entity.radius : 16;
  if (!circlesOverlap(state.player, { ...entity, radius })) return;
  const event = collisionMessage(entity);
  if (!event) return;

  if (entity.kind === "item") {
    if (state.collectedIds.has(entity.id)) return;
    state.collectedIds.add(entity.id);
    sfx.pickup();
    spawnParticles(entity.x, entity.y, entity.color || "#ffdf6e", 12, 80, "star");
    spawnFloatingText(entity.x, entity.y, entity.message || "+ Hồ sơ", entity.color || "#ffdf6e");
  }

  if (entity.kind === "npc") {
    if (state.resolvedCollisionIds.has(entity.id)) return;
    state.resolvedCollisionIds.add(entity.id);
    sfx.npc();
    spawnParticles(entity.x, entity.y, "#26c6da", 10, 70, "star");
    spawnFloatingText(entity.x, entity.y, entity.message || "✓ Tiếp nhận ý kiến", "#26c6da");
  }

  if (entity.kind === "gate") {
    if (state.resolvedCollisionIds.has(entity.id)) return;
    state.resolvedCollisionIds.add(entity.id);
    sfx.gate();
    spawnParticles(entity.x, entity.y, "#8cd6f7", 20, 100, "star");
    spawnFloatingText(entity.x, entity.y, "⭐ HOÀN THÀNH GIẢI TRÌNH ⭐", "#8cd6f7");
  }

  if (entity.kind === "hazard") {
    if (now < state.hazardCooldownUntil) return;
    state.hazardCooldownUntil = now + 1500;
    sfx.hazard();
    triggerScreenShake(7, 0.3);
    spawnParticles(entity.x, entity.y, "#c5272d", 14, 90, "ember");
    spawnFloatingText(entity.x, entity.y, entity.message || "Bị cảnh cáo!", "#ff5252");
  }

  postToParent(event);
}

function checkCollisions(now) {
  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (!Array.isArray(entities) && entities && typeof entities === "object") {
      for (const [id, entity] of Object.entries(entities)) {
        if (kind === "players" || !entity) continue;
        handleCollision({ ...entity, id: entity.id || id, kind: entity.kind || kind.slice(0, -1) }, now);
      }
    }
  }
}

// ----------------------------------------------------
// PIXEL ART DRAWING ENGINE
// ----------------------------------------------------

// Draw Floor & Office Background
function drawEnvironment(time) {
  // Parquet / Marble Tile Base
  const tileSize = 48;
  for (let y = 0; y < bounds.height; y += tileSize) {
    for (let x = 0; x < bounds.width; x += tileSize) {
      const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      context.fillStyle = isAlt ? "#1e293b" : "#182234";
      context.fillRect(x, y, tileSize, tileSize);

      // Tile grout lines
      context.fillStyle = "rgba(0, 0, 0, 0.25)";
      context.fillRect(x, y, tileSize, 1);
      context.fillRect(x, y, 1, tileSize);

      // Soft highlight on tile edge
      context.fillStyle = isAlt ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)";
      context.fillRect(x + 1, y + 1, tileSize - 2, 2);
    }
  }

  // Red Welcome Carpet Runner in the center aisle
  const carpetX = 400;
  const carpetW = 160;
  context.fillStyle = "#80181c";
  context.fillRect(carpetX, 60, carpetW, bounds.height - 60);
  context.fillStyle = "#a82025";
  context.fillRect(carpetX + 4, 60, carpetW - 8, bounds.height - 60);
  // Gold carpet borders
  context.fillStyle = "#d4af37";
  context.fillRect(carpetX + 2, 60, 3, bounds.height - 60);
  context.fillRect(carpetX + carpetW - 5, 60, 3, bounds.height - 60);

  // Top Wall / Header Panel
  context.fillStyle = "#0f172a";
  context.fillRect(0, 0, bounds.width, 56);
  context.fillStyle = "#334155";
  context.fillRect(0, 54, bounds.width, 3);
  context.fillStyle = "#000000";
  context.fillRect(0, 57, bounds.width, 2);

  // Decorative Wall Slogan Banner
  const bannerW = 460;
  const bannerX = (bounds.width - bannerW) / 2;
  context.fillStyle = "#b91c1c";
  context.fillRect(bannerX, 8, bannerW, 36);
  context.fillStyle = "#f59e0b";
  context.strokeRect(bannerX + 2, 10, bannerW - 4, 32);

  context.fillStyle = "#fef08a";
  context.font = "bold 13px 'Silkscreen', 'VT323', monospace, sans-serif";
  context.textAlign = "center";
  context.fillText("★ TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG ★", bounds.width / 2, 26);
  context.font = "11px 'VT323', monospace, sans-serif";
  context.fillStyle = "#ffffff";
  context.fillText("LIÊM CHÍNH - MINH BẠCH - VÌ NHÂN DÂN PHỤC VỤ", bounds.width / 2, 38);

  // Animated Ticking Wall Clock
  const clockX = 65;
  const clockY = 28;
  context.fillStyle = "#475569";
  context.beginPath(); context.arc(clockX, clockY, 15, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#f8fafc";
  context.beginPath(); context.arc(clockX, clockY, 13, 0, Math.PI * 2); context.fill();
  context.strokeStyle = "#0f172a";
  context.lineWidth = 1.5;
  // Clock hands
  const secAngle = (time * 1.5) % (Math.PI * 2);
  const minAngle = (time * 0.15) % (Math.PI * 2);
  context.beginPath();
  context.moveTo(clockX, clockY);
  context.lineTo(clockX + Math.cos(secAngle) * 9, clockY + Math.sin(secAngle) * 9);
  context.stroke();
  context.beginPath();
  context.moveTo(clockX, clockY);
  context.lineTo(clockX + Math.cos(minAngle) * 6, clockY + Math.sin(minAngle) * 6);
  context.stroke();
  context.lineWidth = 1;
}

// Draw Furniture & Props (Desks, Computers, Plants)
function drawOfficeFurniture(time) {
  // Service Counter Left
  drawServiceDesk(50, 70, 260, "BỘ PHẬN TIẾP NHẬN", time);
  // Service Counter Right
  drawServiceDesk(650, 70, 260, "TRẢ KẾT QUẢ & GIẢI TRÌNH", time + 1);

  // Waiting benches at the bottom
  drawBench(90, 470, 180);
  drawBench(690, 470, 180);

  // Indoor Potted Plants
  drawPottedPlant(24, 75);
  drawPottedPlant(936, 75);
  drawPottedPlant(24, 490);
  drawPottedPlant(936, 490);
  drawPottedPlant(360, 75);
  drawPottedPlant(600, 75);
}

function drawServiceDesk(x, y, width, label, animOffset = 0) {
  const height = 48;
  // Main Desk Body
  context.fillStyle = "#451a03";
  context.fillRect(x, y, width, height);
  // Desk Top Surface
  context.fillStyle = "#78350f";
  context.fillRect(x, y, width, 14);
  context.fillStyle = "#b45309";
  context.fillRect(x + 2, y + 2, width - 4, 4);

  // Glass Divider Plate
  context.fillStyle = "rgba(147, 197, 253, 0.35)";
  context.fillRect(x + 10, y - 16, width - 20, 16);
  context.fillStyle = "rgba(255, 255, 255, 0.7)";
  context.fillRect(x + 12, y - 15, width - 24, 2);

  // Desktop Computer Terminal
  const compX = x + width / 2 - 16;
  const compY = y - 12;
  context.fillStyle = "#1e293b";
  context.fillRect(compX, compY, 32, 22);
  // Glowing green monitor screen
  context.fillStyle = (Math.sin(state.gameTime * 4 + animOffset) > 0) ? "#10b981" : "#059669";
  context.fillRect(compX + 3, compY + 3, 26, 16);
  // Green terminal code scanline
  context.fillStyle = "#a7f3d0";
  context.fillRect(compX + 5, compY + 6, 18, 2);
  context.fillRect(compX + 5, compY + 10, 14, 2);
  context.fillRect(compX + 5, compY + 14, 20, 2);

  // Document Tray / Folders
  context.fillStyle = "#3b82f6";
  context.fillRect(x + 20, y + 2, 20, 8);
  context.fillStyle = "#f59e0b";
  context.fillRect(x + 22, y + 4, 18, 6);

  // Label sign
  context.fillStyle = "#fef3c7";
  context.font = "bold 11px 'Silkscreen', 'VT323', monospace, sans-serif";
  context.textAlign = "center";
  context.fillText(label, x + width / 2, y + 36);
}

function drawBench(x, y, width) {
  context.fillStyle = "#1e293b";
  context.fillRect(x, y, width, 18);
  context.fillStyle = "#334155";
  context.fillRect(x + 2, y + 2, width - 4, 6);
  // Bench Legs
  context.fillStyle = "#0f172a";
  context.fillRect(x + 6, y + 18, 6, 8);
  context.fillRect(x + width - 12, y + 18, 6, 8);
}

function drawPottedPlant(x, y) {
  // Terracotta Pot
  context.fillStyle = "#9a3412";
  context.fillRect(x - 8, y, 16, 16);
  context.fillStyle = "#c2410c";
  context.fillRect(x - 9, y - 2, 18, 4);

  // Green Foliage
  context.fillStyle = "#15803d";
  context.beginPath(); context.arc(x, y - 8, 12, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#22c55e";
  context.beginPath(); context.arc(x - 4, y - 10, 7, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#4ade80";
  context.beginPath(); context.arc(x + 3, y - 12, 6, 0, Math.PI * 2); context.fill();
}

// ----------------------------------------------------
// PIXEL SPRITE RENDERERS
// ----------------------------------------------------

// Draw Pixel Character Sprite
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

  // Trousers / Pants
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x - 7, bobY + 4, 14, 7);

  // Torso / Suit / Shirt
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
  ctx.fillStyle = "#fed7aa"; // Skin tone hands
  ctx.fillRect(x - 10, bobY + 3 - footOffset * 0.5, 3, 3);
  ctx.fillRect(x + 7, bobY + 3 + footOffset * 0.5, 3, 3);

  // Head / Skin
  ctx.fillStyle = "#fed7aa";
  ctx.fillRect(x - 6, bobY - 17, 12, 11);

  // Hair
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(x - 7, bobY - 20, 14, 6);
  ctx.fillRect(x - 7, bobY - 17, 3, 5);

  // Eyes & Glasses
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 4, bobY - 12, 2, 3);
  ctx.fillRect(x + 2, bobY - 12, 2, 3);

  // Local Player Arrow / Indicator
  if (isLocal) {
    const arrowY = bobY - 28 + Math.sin(time * 6) * 3;
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(x, arrowY + 6);
    ctx.lineTo(x - 5, arrowY);
    ctx.lineTo(x + 5, arrowY);
    ctx.closePath();
    ctx.fill();
  }

  // Name Tag
  ctx.fillStyle = isLocal ? "rgba(15, 23, 42, 0.9)" : "rgba(30, 41, 59, 0.85)";
  const tagW = Math.max(50, name.length * 7 + 10);
  ctx.fillRect(x - tagW / 2, bobY - 30, tagW, 14);
  ctx.strokeStyle = isLocal ? "#38bdf8" : "#64748b";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - tagW / 2, bobY - 30, tagW, 14);

  ctx.fillStyle = isLocal ? "#38bdf8" : "#f1f5f9";
  ctx.font = "bold 9px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(name, x, bobY - 20);
}

// Draw Item (Document Dossier, Golden Shield, Stars, Transparency Glass)
function drawItemEntity(ctx, entity, time) {
  const x = entity.x;
  const floatY = entity.y + Math.sin(time * 3 + (entity.x % 10)) * 4;
  const type = entity.type || "case_file";
  const label = entity.label || entity.name || (type === "case_file" ? "Hồ sơ" : "Liêm chính");

  // Glowing Aura Underneath
  const pulse = (Math.sin(time * 4 + entity.x) + 1) * 0.5;
  ctx.fillStyle = `rgba(251, 191, 36, ${0.15 + pulse * 0.15})`;
  ctx.beginPath();
  ctx.ellipse(x, entity.y + 12, 14 + pulse * 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Floating Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(x, entity.y + 12, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Item Graphics based on Type
  if (type === "integrity_item" || type === "transparency") {
    // Golden / Emerald Integrity Shield
    ctx.fillStyle = "#10b981";
    ctx.fillRect(x - 9, floatY - 11, 18, 14);
    ctx.beginPath();
    ctx.moveTo(x - 9, floatY + 3);
    ctx.lineTo(x, floatY + 12);
    ctx.lineTo(x + 9, floatY + 3);
    ctx.closePath();
    ctx.fill();

    // Gold Shield Border
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 8, floatY - 10, 16, 12);
    // Shield Star
    ctx.fillStyle = "#facc15";
    ctx.beginPath(); ctx.arc(x, floatY - 1, 3, 0, Math.PI * 2); ctx.fill();
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
    // Official Blue Dossier / Case File Folder
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(x - 10, floatY - 12, 20, 18);
    // Manila Paper Inserts
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(x - 7, floatY - 14, 14, 6);
    // Red Ribbon / Stamp
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

// Draw Hazard (Trap: Envelope, Waste, Bureaucracy, Bệnh thành tích)
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

  // Dark Hazard Base
  ctx.fillStyle = "rgba(185, 28, 28, 0.2)";
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fill();

  if (type === "envelope") {
    // Red bribe envelope
    ctx.fillStyle = "#b91c1c";
    ctx.fillRect(x - 12, y - 8, 24, 16);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 12, y - 8, 24, 16);
    // Flap
    ctx.fillStyle = "#991b1b";
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 8);
    ctx.lineTo(x, y + 2);
    ctx.lineTo(x + 12, y - 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (type === "waste") {
    // Toxic Leaking Waste Barrel
    ctx.fillStyle = "#475569";
    ctx.fillRect(x - 10, y - 12, 20, 20);
    ctx.fillStyle = "#eab308";
    ctx.fillRect(x - 8, y - 6, 16, 8);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("☣", x, y + 1);
  } else {
    // Generic Warning Hazard
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.moveTo(x, y - 14);
    ctx.lineTo(x + 14, y + 10);
    ctx.lineTo(x - 14, y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("!", x, y + 7);
  }

  // Warning pulse icon
  ctx.fillStyle = "#f87171";
  ctx.font = "bold 10px sans-serif";
  ctx.fillText("⚠", x + 12, y - 10 + pulse);

  // Label
  ctx.fillStyle = "#7f1d1d";
  ctx.fillRect(x - 30, y + 14, 60, 12);
  ctx.fillStyle = "#fca5a5";
  ctx.font = "bold 8px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label.slice(0, 11), x, y + 23);
}

// Draw NPC (Citizen / Visitor)
function drawNpcEntity(ctx, entity, time) {
  const x = entity.x;
  const y = entity.y;
  const label = entity.label || entity.name || "Người dân";

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath(); ctx.ellipse(x, y + 12, 12, 5, 0, 0, Math.PI * 2); ctx.fill();

  // Body
  ctx.fillStyle = "#0284c7";
  ctx.fillRect(x - 7, y - 5, 14, 13);
  // Head
  ctx.fillStyle = "#fed7aa";
  ctx.fillRect(x - 6, y - 16, 12, 11);
  // Hair
  ctx.fillStyle = "#94a3b8"; // Silver hair
  ctx.fillRect(x - 7, y - 18, 14, 5);
  // Eyes
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(x - 4, y - 11, 2, 2);
  ctx.fillRect(x + 2, y - 11, 2, 2);

  // Animated Thought/Speech Bubble
  const bubbleY = y - 28 + Math.sin(time * 4) * 2;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(x, bubbleY, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 3, bubbleY + 7);
  ctx.lineTo(x, bubbleY + 12);
  ctx.lineTo(x + 3, bubbleY + 7);
  ctx.closePath();
  ctx.fill();

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

// Draw Gate / Exit Portal ("Trung tâm Công khai & Giải trình")
function drawGateEntity(ctx, entity, time) {
  const x = entity.x;
  const y = entity.y;
  const width = 80;
  const height = 90;

  // Swirling Vortex Background
  const rot = time * 2;
  const grad = ctx.createRadialGradient(x, y, 5, x, y, 40);
  grad.addColorStop(0, "rgba(56, 189, 248, 0.9)");
  grad.addColorStop(0.5, "rgba(14, 165, 233, 0.6)");
  grad.addColorStop(1, "rgba(3, 105, 161, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(x, y, 38, 0, Math.PI * 2); ctx.fill();

  // Swirling Energy Particles
  for (let i = 0; i < 6; i++) {
    const angle = rot + (i * Math.PI) / 3;
    const dist = 14 + Math.sin(time * 3 + i) * 12;
    ctx.fillStyle = i % 2 === 0 ? "#facc15" : "#38bdf8";
    ctx.beginPath();
    ctx.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stone Archway Pillars
  ctx.fillStyle = "#334155";
  ctx.fillRect(x - width / 2, y - height / 2, 14, height);
  ctx.fillRect(x + width / 2 - 14, y - height / 2, 14, height);
  // Gold Caps
  ctx.fillStyle = "#d97706";
  ctx.fillRect(x - width / 2 - 2, y - height / 2 - 4, 18, 6);
  ctx.fillRect(x + width / 2 - 16, y - height / 2 - 4, 18, 6);

  // Top Arch
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x - width / 2 - 4, y - height / 2 - 14, width + 8, 14);
  ctx.fillStyle = "#facc15";
  ctx.strokeRect(x - width / 2 - 4, y - height / 2 - 14, width + 8, 14);

  // Emblem
  ctx.fillStyle = "#ef4444";
  ctx.beginPath(); ctx.arc(x, y - height / 2 - 7, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#facc15";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("★", x, y - height / 2 - 4);

  // Title Banner
  ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
  ctx.fillRect(x - 70, y + height / 2 + 2, 140, 16);
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 9px 'Silkscreen', 'VT323', monospace, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("TT CÔNG KHAI & GIẢI TRÌNH", x, y + height / 2 + 13);
}

// ----------------------------------------------------
// MAIN RENDER SCENE
// ----------------------------------------------------

function drawScene() {
  const time = state.gameTime;

  // Screen shake transform
  context.save();
  if (state.screenShakeTimer > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShakeIntensity * 2;
    const shakeY = (Math.random() - 0.5) * state.screenShakeIntensity * 2;
    context.translate(shakeX, shakeY);
  }

  // 1. Environment & Office Furniture
  drawEnvironment(time);
  drawOfficeFurniture(time);

  // 2. Interactive World Entities
  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (kind === "players" || !entities || typeof entities !== "object") continue;
    for (const [id, entity] of Object.entries(entities)) {
      if (!entity) continue;
      const fullEntity = { ...entity, id: entity.id || id, kind: entity.kind || kind.slice(0, -1) };

      if (fullEntity.kind === "item") {
        if (state.collectedIds.has(fullEntity.id)) continue;
        if (options.role === "player" && isEntityResolvedForPlayer(fullEntity, options.playerId)) continue;
        drawItemEntity(context, fullEntity, time);
      } else if (fullEntity.kind === "hazard") {
        drawHazardEntity(context, fullEntity, time);
      } else if (fullEntity.kind === "npc") {
        if (options.role === "player" && isEntityResolvedForPlayer(fullEntity, options.playerId)) continue;
        drawNpcEntity(context, fullEntity, time);
      } else if (fullEntity.kind === "gate") {
        if (options.role === "player" && isEntityResolvedForPlayer(fullEntity, options.playerId)) continue;
        drawGateEntity(context, fullEntity, time);
      }
    }
  }

  // 3. Remote Players
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

  // 4. Local Player
  if (options.role === "player") {
    drawPixelCharacter(context, state.player.x, state.player.y, {
      name: state.player.name || options.playerName,
      color: state.player.color || options.color,
      isLocal: true,
      isMoving: activeInput() && !state.frozen,
    });
  }

  // 5. Particles Update & Render
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

  // 6. Floating Text Update & Render
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
    // Text Shadow
    context.fillStyle = "#000000";
    context.fillText(ft.text, ft.x + 1, ft.y + 1);
    // Main Text
    context.fillStyle = ft.color || "#ffdf6e";
    context.fillText(ft.text, ft.x, ft.y);
    context.restore();
  }

  // 7. Frozen Overlay Effect
  if (state.frozen) {
    context.fillStyle = "rgba(14, 165, 233, 0.25)";
    context.fillRect(0, 0, bounds.width, bounds.height);
    context.fillStyle = "#f0f9ff";
    context.font = "bold 20px 'Silkscreen', 'VT323', monospace, sans-serif";
    context.textAlign = "center";
    context.fillText("❄ ĐANG TẠM DỪNG / ĐÓNG BĂNG ❄", bounds.width / 2, bounds.height / 2);
  }

  // 8. Scanline Retro Overlay (if enabled)
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

  // Screen shake decay
  if (state.screenShakeTimer > 0) {
    state.screenShakeTimer -= deltaSeconds;
  }

  // Local Player Movement
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

// Click / Touch to activate AudioContext
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
