const DEFAULT_COLOR = "#00aaff";
const DEFAULT_PLAYER_ID = "player";
const DEFAULT_PLAYER_NAME = "Player";
const PLAYER_RADIUS = 12;
const MOVE_SPEED = 120;

const finiteCoordinate = (value) => typeof value === "number" && Number.isFinite(value);

export function parseGameOptions(search = "") {
  const params = new URLSearchParams(typeof search === "string" ? search : "");
  const requestedRole = params.get("role");
  const role = requestedRole === "host" || requestedRole === "player" ? requestedRole : "player";
  const valueOrDefault = (key, fallback) => {
    const value = params.get(key);
    return value === null || value.trim() === "" ? fallback : value;
  };
  return {
    role,
    playerId: valueOrDefault("id", DEFAULT_PLAYER_ID),
    playerName: valueOrDefault("name", DEFAULT_PLAYER_NAME),
    color: valueOrDefault("color", DEFAULT_COLOR),
  };
}

export function normalizeSnapshot(value) {
  const source = value && typeof value === "object" ? value : {};
  const normalized = {};
  for (const key of ["players", "items", "hazards", "npcs", "gates"]) {
    const collection = source[key];
    normalized[key] = {};
    if (!collection || typeof collection !== "object" || Array.isArray(collection)) continue;
    for (const [id, entity] of Object.entries(collection)) {
      if (!entity || typeof entity !== "object" || Array.isArray(entity)) continue;
      if (!finiteCoordinate(entity.x) || !finiteCoordinate(entity.y)) continue;
      normalized[key][id] = { ...entity };
    }
  }
  return normalized;
}

export function movePlayer(player, input = {}, deltaSeconds = 0, bounds = {}) {
  const x = finiteCoordinate(player?.x) ? player.x : 0;
  const y = finiteCoordinate(player?.y) ? player.y : 0;
  const delta = Number.isFinite(deltaSeconds) && deltaSeconds > 0 ? deltaSeconds : 0;
  let dx = input?.right ? 1 : 0;
  dx -= input?.left ? 1 : 0;
  let dy = input?.down ? 1 : 0;
  dy -= input?.up ? 1 : 0;
  const length = Math.hypot(dx, dy) || 1;
  const width = finiteCoordinate(bounds?.width) ? bounds.width : Infinity;
  const height = finiteCoordinate(bounds?.height) ? bounds.height : Infinity;
  return {
    ...player,
    x: Math.max(PLAYER_RADIUS, Math.min(width - PLAYER_RADIUS, x + (dx / length) * MOVE_SPEED * delta)),
    y: Math.max(PLAYER_RADIUS, Math.min(height - PLAYER_RADIUS, y + (dy / length) * MOVE_SPEED * delta)),
  };
}

export function circlesOverlap(a, b) {
  if (!a || !b || !finiteCoordinate(a.x) || !finiteCoordinate(a.y) || !finiteCoordinate(b.x) || !finiteCoordinate(b.y)) return false;
  const radiusA = finiteCoordinate(a.radius) ? a.radius : 0;
  const radiusB = finiteCoordinate(b.radius) ? b.radius : 0;
  return Math.hypot(a.x - b.x, a.y - b.y) <= radiusA + radiusB;
}

export function collisionMessage(entity) {
  if (!entity || typeof entity !== "object") return null;
  if (entity.kind === "item") return { type: "NHAT_SACH", bookId: entity.id };
  if (entity.kind === "hazard") return { type: "DINH_BAY", hazard: entity };
  if (entity.kind === "npc") return { type: "FOUND_LOYAL_CUSTOMER", npcId: entity.id };
  if (entity.kind === "gate") return { type: "ESCAPED_GATE", gateId: entity.id };
  return null;
}

export function isEntityResolvedForPlayer(entity, playerId) {
  if (!entity || typeof entity !== "object" || typeof playerId !== "string") return false;
  for (const field of ["claimedBy", "completedBy"]) {
    const resolutionMap = entity[field];
    if (resolutionMap
      && typeof resolutionMap === "object"
      && !Array.isArray(resolutionMap)
      && Object.prototype.hasOwnProperty.call(resolutionMap, playerId)) return true;
  }
  return false;
}
