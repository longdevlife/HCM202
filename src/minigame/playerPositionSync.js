import { onChildAdded, onChildChanged, onChildRemoved, ref } from "firebase/database";

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const finiteCoordinate = (value) => typeof value === "number" && Number.isFinite(value);
const DIRECTIONS = new Set(["up", "down", "left", "right"]);

const errorText = (error) => [error?.code, error?.message, error]
  .filter((value) => value !== undefined && value !== null)
  .join(" ")
  .toUpperCase();

export function isPermissionDenied(error) {
  const text = errorText(error);
  return text.includes("PERMISSION_DENIED") || text.includes("PERMISSION-DENIED");
}

export function createPositionWriter({ writeModern, writeLegacy }) {
  let useLegacyStorage = false;

  const write = async (move) => {
    if (useLegacyStorage) {
      await writeLegacy(move);
      return "legacy";
    }

    try {
      await writeModern(move);
      return "positions";
    } catch (error) {
      if (!isPermissionDenied(error)) throw error;
      useLegacyStorage = true;
      await writeLegacy(move);
      return "legacy";
    }
  };

  write.write = write;
  return write;
}

export function normalizePosition(value) {
  if (!isObject(value) || !finiteCoordinate(value.x) || !finiteCoordinate(value.y)) return null;
  return {
    x: value.x,
    y: value.y,
    ...(DIRECTIONS.has(value.direction) ? { direction: value.direction } : {}),
  };
}

export function applyPositionEvent(positions, eventType, playerId, value) {
  const next = isObject(positions) ? { ...positions } : {};
  if (typeof playerId !== "string" || playerId.length === 0) return next;
  if (eventType === "removed") {
    delete next[playerId];
    return next;
  }

  const normalized = normalizePosition(value);
  if (normalized) next[playerId] = normalized;
  else delete next[playerId];
  return next;
}

export function subscribeToPlayerPositions(database, onEvent) {
  if (typeof onEvent !== "function") return () => {};

  const positionsRef = ref(database, "positions");
  const emit = (eventType) => (snapshot) => {
    const playerId = snapshot.key;
    if (typeof playerId !== "string" || playerId.length === 0) return;
    onEvent({
      eventType,
      playerId,
      position: eventType === "removed" ? null : normalizePosition(snapshot.val()),
    });
  };

  const unsubscribeAdded = onChildAdded(positionsRef, emit("added"));
  const unsubscribeChanged = onChildChanged(positionsRef, emit("changed"));
  const unsubscribeRemoved = onChildRemoved(positionsRef, emit("removed"));

  return () => {
    unsubscribeAdded();
    unsubscribeChanged();
    unsubscribeRemoved();
  };
}
