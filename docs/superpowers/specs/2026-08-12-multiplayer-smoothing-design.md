# Multiplayer Movement Smoothing Design

## Problem

The minigame currently writes each player's position into the shared `players` record every 100 ms. Every player view listens to the entire `players` tree, and the RPG iframe receives a full world snapshot for every movement update. During a 30-player session this creates unnecessary Firebase callbacks, React renders, iframe messages, and repeated snapshot normalization.

The canvas also applies the received local-player position directly to its predicted position. A delayed snapshot can therefore move a player backward, producing visible rubber-banding even when the local frame loop is rendering smoothly.

## Goal

Make movement feel smooth for a room of approximately 30 players by reducing high-frequency React/Firebase work, preserving responsive local movement, and interpolating remote-player movement between network snapshots.

## Scope

- Store high-frequency movement under `positions/{playerId}` instead of `players/{playerId}/position`.
- Keep `players` for names, character metadata, scores, integrity, progress, and lifecycle state.
- Remove the duplicate `players` subscription from `RpgGamePlay`; reuse the player metadata already loaded by `PlayerView`.
- Subscribe to position children with add/change/remove events and send position deltas directly to the iframe.
- Keep full `GAME_SNAPSHOT` messages for iframe readiness, phase/world changes, and player metadata changes.
- Keep player prediction local and initialize or re-anchor it only when a new scene/phase requires it.
- Interpolate remote players toward their latest server target each animation frame.
- Cap movement writes at one update every 125 ms (at most 8 writes/second per player).
- Remove stale positions when the host resets the game.
- Preserve existing scoring, collision, and parent event contracts.

## Non-goals

- Do not replace Firebase with a dedicated game server or WebRTC.
- Do not redesign the dashboard or pixel-art map.
- Do not change scoring, quest progression, hazard penalties, or collision ownership.
- Do not cache the static canvas map in this pass; measure the network/runtime improvement first and only revisit rendering if FPS remains below the acceptance threshold.

## Architecture

### Firebase data split

`players` remains the authoritative metadata and progression collection. Position writes use the new shape:

```text
players/{playerId}
  name, character, color, score, integrity, status, progress, ...

positions/{playerId}
  x, y, direction
```

The existing `players/{playerId}/position` value remains readable as a compatibility fallback when an older client or existing database record still contains it. New movement writes must use `positions/{playerId}` only.

### Parent-to-iframe synchronization

The parent React component remains the only Firebase owner. It maintains a position ref without putting every position event into React state.

- On iframe ready or a world/phase/metadata change, post one full `GAME_SNAPSHOT` containing the latest metadata and positions.
- On a position child add/change, post one `PLAYER_POSITION` delta:

```js
{
  type: "PLAYER_POSITION",
  playerId: "player_abc",
  position: { x: 480, y: 293, direction: "right" }
}
```

- On a child removal, post the same message with `position: null` so the iframe removes the stale remote player.

The player parent and host parent use the same position subscription behavior. Position events must not trigger a dashboard React render.

### Canvas runtime

The iframe keeps `state.snapshot` as the authoritative latest target data. On `GAME_SNAPSHOT` it updates metadata and target positions. On `PLAYER_POSITION` it updates only the specified target.

The local player continues to move every animation frame. A local snapshot updates appearance and metadata, but does not overwrite the predicted `x`/`y` after the initial scene anchor. When the phase changes, the next valid local position may re-anchor the player once.

Remote players maintain a render position and a target position. Each frame moves the render position toward the target using a frame-rate-independent interpolation factor. If a target is invalid or removed, it is ignored or deleted. This makes 8 Hz network updates appear continuous without adding server writes.

### Compatibility and cleanup

- `buildRpgSnapshot` accepts an optional positions collection and merges valid positions over legacy player coordinates.
- Invalid positions are ignored by the same finite-coordinate rules already used by the bridge.
- Host reset paths remove `positions` along with `players` and other phase data.
- Host mode remains read-only and never emits `PLAYER_MOVE` or gameplay mutation events.

## Interfaces

The pure bridge/runtime helpers will expose behavior equivalent to:

```js
buildRpgSnapshot(gameState, collections, positions = {})
interpolatePosition(current, target, alpha)
```

The existing `PLAYER_MOVE` iframe-to-parent message remains unchanged. Only its Firebase destination and write cadence change. `GAME_SNAPSHOT`, `RPG_READY`, and all existing gameplay event names remain compatible.

## Testing

- Add bridge tests proving valid position records override legacy player coordinates and malformed records are ignored.
- Add game-core tests proving interpolation moves toward a target, clamps the interpolation factor, and preserves the target direction.
- Add browser coverage proving a `PLAYER_POSITION` delta updates the scene without producing a gameplay mutation event.
- Keep all existing game-state, bridge, core, and browser tests passing.
- Run `npm run build` after implementation.
- Run a local browser probe with approximately 30 synthetic players and compare position updates, frame cadence, and canvas call counts against the current baseline.

## Acceptance Criteria

- A 30-player room sends no more than 8 position writes per active player per second.
- Position-only updates do not cause `PlayerView`, `RpgGamePlay`, or `HostView` dashboard React renders.
- The local player does not move backward when an older position snapshot arrives.
- Remote players visibly move continuously between position updates.
- Position add/change/remove events correctly appear, update, and disappear in both player and host iframes.
- Existing score, integrity, progress, hazard, NPC, gate, and reset behavior remains unchanged.
- Build and the complete automated test suite pass.
