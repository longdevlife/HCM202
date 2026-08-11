const WORLD_WIDTH = 960;
const WORLD_HEIGHT = 540;
const SPAWN_MARGIN = 40;
const PLAYER_RADIUS = 12;

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const finiteCoordinate = (value) => typeof value === "number" && Number.isFinite(value);
const nonNegativeCount = (value) => Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;

// A small, stable LCG keeps generated Firebase keys and coordinates reproducible
// without depending on browser or runtime randomness.
const createRandom = (seed) => {
  let state = Number.isFinite(seed) ? Number(seed) >>> 0 : 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const coordinate = (random, lower, upper) => Math.floor(random() * (upper - lower + 1)) + lower;
const entityKey = (phaseKey, seed, index) => `${phaseKey}_${seed}_${index}`;

const mapCollection = (collection, kind) => {
  if (!isObject(collection)) return {};
  return Object.fromEntries(Object.entries(collection).flatMap(([id, value]) => {
    if (!isObject(value)) return [];
    const position = kind === "player" && isObject(value.position) ? value.position : {};
    const coordinates = {
      ...(finiteCoordinate(position.x) ? { x: position.x } : {}),
      ...(finiteCoordinate(position.y) ? { y: position.y } : {}),
    };
    return [[id, { ...value, ...coordinates, id: value.id || id, kind }]];
  }));
};

/** Create the deterministic collections consumed by Firebase and the canvas iframe. */
export function createPhaseWorld(phaseKey, config = {}, seed = 0) {
  const phase = typeof phaseKey === "string" && phaseKey ? phaseKey : "phase_1";
  const phaseConfig = isObject(config) ? config : {};
  const numericSeed = Number.isFinite(seed) ? Number(seed) : 0;
  const random = createRandom(numericSeed);
  const books = {};
  const traps = {};
  const npcs = {};
  const gates = {};
  const maxBooks = nonNegativeCount(phaseConfig.maxBooks);
  const trapCount = nonNegativeCount(phaseConfig.trapCount);
  const hazards = Array.isArray(phaseConfig.hazards) ? phaseConfig.hazards : [];

  for (let index = 0; index < maxBooks; index += 1) {
    const id = entityKey(phase, numericSeed, index);
    books[id] = {
      ...(isObject(phaseConfig.bookReward) ? { ...phaseConfig.bookReward } : {}),
      id,
      kind: "item",
      x: coordinate(random, SPAWN_MARGIN, WORLD_WIDTH - SPAWN_MARGIN),
      y: coordinate(random, SPAWN_MARGIN, WORLD_HEIGHT - SPAWN_MARGIN),
    };
  }

  for (let index = 0; index < trapCount; index += 1) {
    const id = entityKey(phase, numericSeed, index);
    const hazard = hazards.length > 0 && isObject(hazards[index % hazards.length])
      ? hazards[index % hazards.length]
      : {};
    traps[id] = {
      ...hazard,
      id,
      kind: "hazard",
      x: coordinate(random, SPAWN_MARGIN, WORLD_WIDTH - SPAWN_MARGIN),
      y: coordinate(random, SPAWN_MARGIN, WORLD_HEIGHT - SPAWN_MARGIN),
    };
  }

  if (phase === "phase_3") {
    const id = entityKey(phase, numericSeed, 0);
    gates[id] = {
      id,
      kind: "gate",
      type: "public_center",
      label: "Trung tâm Công khai & Giải trình",
      message: "Đã đến Trung tâm Công khai!",
      x: WORLD_WIDTH - SPAWN_MARGIN,
      y: WORLD_HEIGHT - SPAWN_MARGIN,
    };
  }

  return {
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    books,
    traps,
    npcs,
    gates,
  };
}

/** Convert Firebase's collection names into the groups expected by the canvas game. */
export function buildRpgSnapshot(gameState = {}, collections = {}) {
  const state = isObject(gameState) ? gameState : {};
  const source = isObject(collections) ? collections : {};
  return {
    type: "GAME_SNAPSHOT",
    phase: typeof state.status === "string" ? state.status : "waiting",
    players: mapCollection(source.players, "player"),
    items: mapCollection(source.books, "item"),
    hazards: mapCollection(source.traps, "hazard"),
    npcs: mapCollection(source.npcs, "npc"),
    gates: mapCollection(source.gates, "gate"),
  };
}

const messageHasFiniteCoordinates = (value) => finiteCoordinate(value.x) && finiteCoordinate(value.y);

/** Validate the small set of messages exchanged between the parent and iframe. */
export function isRpgMessage(value) {
  if (!isObject(value) || typeof value.type !== "string") return false;
  switch (value.type) {
    case "PLAYER_MOVE":
      return messageHasFiniteCoordinates(value)
        && ["up", "down", "left", "right"].includes(value.direction);
    case "GAME_SNAPSHOT":
      return typeof value.phase === "string";
    case "RPG_READY":
      return true;
    case "DPAD_MOVE":
      return ["up", "down", "left", "right", "stop"].includes(value.dir);
    case "FREEZE":
    case "UNFREEZE":
      return true;
    case "NHAT_SACH":
      return typeof value.bookId === "string" && value.bookId.length > 0;
    case "DINH_BAY":
      return isObject(value.hazard);
    case "FOUND_LOYAL_CUSTOMER":
      return typeof value.npcId === "string" && value.npcId.length > 0;
    case "ESCAPED_GATE":
      return typeof value.gateId === "string" && value.gateId.length > 0;
    default:
      return false;
  }
}

/** Normalize a player move to the playable canvas bounds. */
export function normalizePlayerMove(value) {
  if (!isObject(value) || !messageHasFiniteCoordinates(value)) return null;
  const move = {
    x: Math.max(PLAYER_RADIUS, Math.min(WORLD_WIDTH - PLAYER_RADIUS, value.x)),
    y: Math.max(PLAYER_RADIUS, Math.min(WORLD_HEIGHT - PLAYER_RADIUS, value.y)),
  };
  if (typeof value.direction === "string") move.direction = value.direction;
  if (typeof value.playerId === "string") move.playerId = value.playerId;
  return move;
}
