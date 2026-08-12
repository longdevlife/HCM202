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
const eventEntityKey = (phaseKey, eventType, seed, index) => `${phaseKey}_${eventType}_${seed}_${index}`;

// Building footprints per phase in 960x540 space (with buffer padding to prevent spawning on roofs)
const BUILDING_EXCLUSION_ZONES = {
  phase_1: [
    { minX: 190, maxX: 460, minY: 20, maxY: 180 },
    { minX: 20, maxX: 160, minY: 20, maxY: 170 },
    { minX: 800, maxX: 940, minY: 20, maxY: 170 },
    { minX: 20, maxX: 160, minY: 360, maxY: 520 },
    { minX: 510, maxX: 760, minY: 360, maxY: 520 },
    { minX: 800, maxX: 940, minY: 360, maxY: 520 },
  ],
  phase_2: [
    { minX: 340, maxX: 620, minY: 190, maxY: 350 },
    { minX: 350, maxX: 610, minY: 10, maxY: 150 },
    { minX: 30, maxX: 210, minY: 10, maxY: 150 },
    { minX: 750, maxX: 930, minY: 10, maxY: 150 },
    { minX: 30, maxX: 210, minY: 390, maxY: 530 },
    { minX: 750, maxX: 930, minY: 390, maxY: 530 },
  ],
  phase_3: [
    { minX: 320, maxX: 640, minY: 10, maxY: 180 },
    { minX: 340, maxX: 620, minY: 380, maxY: 530 },
    { minX: 70, maxX: 290, minY: 10, maxY: 170 },
    { minX: 670, maxX: 890, minY: 10, maxY: 170 },
    { minX: 70, maxX: 290, minY: 380, maxY: 530 },
    { minX: 670, maxX: 890, minY: 380, maxY: 530 },
  ],
};

const isInsideExclusionZone = (x, y, phaseKey) => {
  const zones = BUILDING_EXCLUSION_ZONES[phaseKey] || BUILDING_EXCLUSION_ZONES.phase_1;
  return zones.some((z) => x >= z.minX && x <= z.maxX && y >= z.minY && y <= z.maxY);
};

const safeCoordinate = (random, phaseKey) => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const x = coordinate(random, SPAWN_MARGIN, WORLD_WIDTH - SPAWN_MARGIN);
    const y = coordinate(random, SPAWN_MARGIN, WORLD_HEIGHT - SPAWN_MARGIN);
    if (!isInsideExclusionZone(x, y, phaseKey)) {
      return { x, y };
    }
  }
  return {
    x: coordinate(random, 140, 820),
    y: coordinate(random, 240, 300),
  };
};

const createRewardSchedule = (phaseConfig, maxBooks) => {
  const rewardOptions = [
    phaseConfig.bookReward,
    phaseConfig.feedbackReward,
    phaseConfig.supportReward,
  ].filter(isObject);
  const rewardsByType = new Map(rewardOptions
    .filter(({ type }) => typeof type === "string" && type.length > 0)
    .map((reward) => [reward.type, reward]));
  const schedule = [];

  const goalTypes = Array.isArray(phaseConfig.progressGoals)
    ? phaseConfig.progressGoals.filter(isObject).map((g) => g.type)
    : [];

  const availableRewards = goalTypes
    .map((t) => rewardsByType.get(t))
    .filter(isObject);

  if (availableRewards.length === 0) {
    availableRewards.push(...rewardOptions);
  }
  if (availableRewards.length === 0 && isObject(phaseConfig.bookReward)) {
    availableRewards.push(phaseConfig.bookReward);
  }

  let idx = 0;
  while (schedule.length < maxBooks && availableRewards.length > 0) {
    schedule.push(availableRewards[idx % availableRewards.length]);
    idx += 1;
  }

  const fallbackReward = isObject(phaseConfig.bookReward) ? phaseConfig.bookReward : {};
  while (schedule.length < maxBooks) schedule.push(fallbackReward);
  return schedule;
};

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
  const rewardSchedule = createRewardSchedule(phaseConfig, maxBooks);
  const trapCount = nonNegativeCount(phaseConfig.trapCount);
  const hazards = Array.isArray(phaseConfig.hazards) ? phaseConfig.hazards : [];

  for (let index = 0; index < maxBooks; index += 1) {
    const id = entityKey(phase, numericSeed, index);
    const pos = safeCoordinate(random, phase);
    books[id] = {
      ...rewardSchedule[index],
      id,
      kind: "item",
      x: pos.x,
      y: pos.y,
    };
  }

  for (let index = 0; index < trapCount; index += 1) {
    const id = entityKey(phase, numericSeed, index);
    const pos = safeCoordinate(random, phase);
    const hazard = hazards.length > 0 && isObject(hazards[index % hazards.length])
      ? hazards[index % hazards.length]
      : {};
    traps[id] = {
      ...hazard,
      id,
      kind: "hazard",
      x: pos.x,
      y: pos.y,
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
      x: Math.round((1200 / 2400) * WORLD_WIDTH),
      y: Math.round((900 / 1400) * WORLD_HEIGHT),
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

/** Create deterministic entities appended by the host's configured event buttons. */
export function createMarketEventEntities(eventType, phaseKey, config = {}, seed = 0) {
  const phase = typeof phaseKey === "string" && phaseKey ? phaseKey : "phase_1";
  const phaseConfig = isObject(config) ? config : {};
  const numericSeed = Number.isFinite(seed) ? Number(seed) : 0;
  const random = createRandom(numericSeed);
  const result = { books: {}, traps: {}, npcs: {} };
  const positiveEvents = {
    case_peak: { collection: "books", count: 3, kind: "item", reward: phaseConfig.bookReward },
    citizen_support: { collection: "npcs", count: 1, kind: "npc", reward: phaseConfig.supportReward },
    feedback_wave: { collection: "books", count: 2, kind: "item", reward: phaseConfig.feedbackReward },
    surprise_inspection: { collection: "books", count: 1, kind: "item", reward: phaseConfig.feedbackReward },
    citizen_feedback: { collection: "npcs", count: 1, kind: "npc", reward: phaseConfig.supportReward },
    recovery_chance: { collection: "books", count: 1, kind: "item", reward: phaseConfig.supportReward },
  };
  const eventConfig = positiveEvents[eventType];

  if (eventConfig && isObject(eventConfig.reward)) {
    for (let index = 0; index < eventConfig.count; index += 1) {
      const id = eventEntityKey(phase, eventType, numericSeed, index);
      const pos = safeCoordinate(random, phase);
      result[eventConfig.collection][id] = {
        ...eventConfig.reward,
        id,
        kind: eventConfig.kind,
        x: pos.x,
        y: pos.y,
      };
    }
  }

  if (eventType === "final_pressure") {
    const hazards = Array.isArray(phaseConfig.hazards) ? phaseConfig.hazards.filter(isObject) : [];
    for (let index = 0; index < Math.min(2, hazards.length); index += 1) {
      const id = eventEntityKey(phase, eventType, numericSeed, index);
      const pos = safeCoordinate(random, phase);
      result.traps[id] = {
        ...hazards[index],
        id,
        kind: "hazard",
        x: pos.x,
        y: pos.y,
      };
    }
  }

  return result;
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
    case "ACTION_INTERACT":
      return true;
    case "NHAT_SACH":
      return typeof value.bookId === "string" && value.bookId.length > 0;
    case "DINH_BAY":
      return isObject(value.hazard)
        && typeof value.hazard.id === "string"
        && value.hazard.id.length > 0;
    case "FOUND_LOYAL_CUSTOMER":
      return typeof value.npcId === "string" && value.npcId.length > 0;
    case "ESCAPED_GATE":
      return typeof value.gateId === "string" && value.gateId.length > 0;
    default:
      return false;
  }
}

export function resolveCanonicalHazard(reportedHazard, persistedHazard) {
  if (!isObject(reportedHazard)
    || !isObject(persistedHazard)
    || typeof reportedHazard.id !== "string"
    || reportedHazard.id !== persistedHazard.id) return null;
  return persistedHazard;
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
