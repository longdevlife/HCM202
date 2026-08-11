import {
  circlesOverlap,
  collisionMessage,
  movePlayer,
  normalizeSnapshot,
  parseGameOptions,
} from "./game-core.js";

const canvas = document.querySelector("#game-canvas");
const status = document.querySelector("#game-status");
const context = canvas.getContext("2d");
const options = parseGameOptions(window.location.search);
const bounds = { width: canvas.width, height: canvas.height };
const input = { up: false, down: false, left: false, right: false };
const state = {
  frozen: false,
  phase: "waiting",
  snapshot: normalizeSnapshot(),
  player: { id: options.playerId, name: options.playerName, color: options.color, x: bounds.width / 2, y: bounds.height / 2, radius: 12 },
  collectedIds: new Set(),
  hazardCooldownUntil: 0,
  lastMovePostedAt: 0,
  lastFrameAt: performance.now(),
};

const postToParent = (message) => window.parent?.postMessage(message, "*");
const activeInput = () => input.up || input.down || input.left || input.right;

function setStatus(message) {
  status.textContent = message;
}

function updatePlayerFromSnapshot() {
  const remote = state.snapshot.players[options.playerId];
  if (remote) state.player = { ...state.player, ...remote, id: options.playerId, radius: 12 };
}

function setDirection(direction, active) {
  if (direction in input) input[direction] = active;
}

function applyDpadMove(direction) {
  for (const key of Object.keys(input)) input[key] = false;
  if (direction !== "stop") setDirection(direction, true);
}

function handleCollision(entity, now) {
  if (options.role !== "player") return;
  const radius = Number.isFinite(entity.radius) ? entity.radius : 16;
  if (!circlesOverlap(state.player, { ...entity, radius })) return;
  const event = collisionMessage(entity);
  if (!event) return;
  if (entity.kind === "item") {
    if (state.collectedIds.has(entity.id)) return;
    state.collectedIds.add(entity.id);
  }
  if (entity.kind === "hazard") {
    if (now < state.hazardCooldownUntil) return;
    state.hazardCooldownUntil = now + 1500;
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

function drawFloor() {
  context.fillStyle = "#183a5c";
  context.fillRect(0, 0, bounds.width, bounds.height);
  for (let y = 0; y < bounds.height; y += 48) {
    for (let x = 0; x < bounds.width; x += 48) {
      context.fillStyle = (x / 48 + y / 48) % 2 ? "#204a71" : "#1c4167";
      context.fillRect(x + 1, y + 1, 46, 46);
    }
  }
}

function drawDesk(x, y, width, label) {
  context.fillStyle = "#5b3d2e";
  context.fillRect(x, y, width, 44);
  context.fillStyle = "#c99a69";
  context.fillRect(x + 5, y + 5, width - 10, 8);
  context.fillStyle = "#eff7ff";
  context.font = "12px system-ui";
  context.fillText(label, x + 8, y + 31);
}

function drawEntity(entity, fallbackId) {
  if (entity.kind === "item" && state.collectedIds.has(entity.id || fallbackId)) return;
  const x = entity.x;
  const y = entity.y;
  if (entity.kind === "item") {
    context.fillStyle = "#ffdf6e";
    context.fillRect(x - 9, y - 12, 18, 24);
    context.fillStyle = "#d47d2b";
    context.fillRect(x - 6, y - 9, 12, 18);
  } else if (entity.kind === "hazard") {
    context.fillStyle = "#ed6a5a";
    context.beginPath(); context.moveTo(x, y - 15); context.lineTo(x + 15, y + 14); context.lineTo(x - 15, y + 14); context.fill();
  } else if (entity.kind === "gate") {
    context.fillStyle = "#8cd6f7";
    context.fillRect(x - 18, y - 24, 36, 48);
  } else {
    context.fillStyle = "#b9e1ff";
    context.beginPath(); context.arc(x, y, 13, 0, Math.PI * 2); context.fill();
  }
  if (entity.label || entity.name) {
    context.fillStyle = "#eff7ff";
    context.font = "12px system-ui";
    context.fillText(entity.label || entity.name, x + 18, y - 18);
  }
}

function drawPlayer(player, local) {
  context.fillStyle = player.color || (local ? options.color : "#b9e1ff");
  context.beginPath(); context.arc(player.x, player.y, 12, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#ffffff";
  context.fillRect(player.x - 5, player.y - 3, 3, 3);
  context.fillRect(player.x + 2, player.y - 3, 3, 3);
  context.fillStyle = "#eff7ff";
  context.font = "12px system-ui";
  context.fillText(player.name || player.id || "Player", player.x - 20, player.y - 20);
}

function drawScene() {
  drawFloor();
  drawDesk(70, 70, 210, "Citizen service");
  drawDesk(660, 70, 220, "Information desk");
  context.fillStyle = "#8b5d3b";
  context.fillRect(315, 405, 330, 70);
  context.fillStyle = "#fff2c2";
  context.font = "16px system-ui";
  context.fillText("SERVICE COUNTER", 405, 447);

  for (const [kind, entities] of Object.entries(state.snapshot)) {
    if (kind === "players" || !entities || typeof entities !== "object") continue;
    for (const [id, entity] of Object.entries(entities)) drawEntity({ ...entity, id: entity.id || id, kind: entity.kind || kind.slice(0, -1) }, id);
  }
  for (const [id, remote] of Object.entries(state.snapshot.players)) {
    if (id !== options.playerId) drawPlayer(remote, false);
  }
  drawPlayer(state.player, true);
  canvas.dataset.rendered = "true";
}

function frame(now) {
  const deltaSeconds = Math.min(0.1, Math.max(0, (now - state.lastFrameAt) / 1000));
  state.lastFrameAt = now;
  if (!state.frozen && options.role === "player" && activeInput()) {
    state.player = movePlayer(state.player, input, deltaSeconds, bounds);
    if (now - state.lastMovePostedAt >= 100) {
      state.lastMovePostedAt = now;
      postToParent({ type: "PLAYER_MOVE", playerId: options.playerId, x: state.player.x, y: state.player.y });
    }
  }
  checkCollisions(now);
  drawScene();
  requestAnimationFrame(frame);
}

const keyboardDirections = {
  ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down",
  ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
};

window.addEventListener("keydown", (event) => {
  const direction = keyboardDirections[event.code];
  if (!direction) return;
  event.preventDefault();
  setDirection(direction, true);
});
window.addEventListener("keyup", (event) => {
  const direction = keyboardDirections[event.code];
  if (!direction) return;
  event.preventDefault();
  setDirection(direction, false);
});
window.addEventListener("message", (event) => {
  const message = event.data;
  if (!message || typeof message !== "object") return;
  if (message.type === "GAME_SNAPSHOT") {
    state.snapshot = normalizeSnapshot(message);
    state.phase = typeof message.phase === "string" ? message.phase : "waiting";
    updatePlayerFromSnapshot();
    setStatus(`${options.role === "host" ? "Host view" : "Player view"}: ${state.phase}`);
  } else if (message.type === "DPAD_MOVE") {
    applyDpadMove(message.dir);
  } else if (message.type === "FREEZE") {
    state.frozen = true;
    setStatus("Movement paused");
  } else if (message.type === "UNFREEZE") {
    state.frozen = false;
    setStatus(`${options.role === "host" ? "Host view" : "Player view"}: ${state.phase}`);
  }
});

setStatus(options.role === "host" ? "Host view ready" : `Player ${options.playerName} ready`);
postToParent({ type: "RPG_READY", role: options.role, playerId: options.playerId });
requestAnimationFrame(frame);
