# Canvas RPG Recovery Design

## Problem

Both `RpgGamePlay.jsx` and `HostView.jsx` embed `/rpg/index.html`, but the repository contains no `public/rpg` directory. Vite therefore serves the application fallback instead of a game scene, while the iframe wrapper remains black. The role-selection screen and the parent React/Firebase application continue to work.

## Goal

Provide a lightweight, reliable 2D minigame scene that renders immediately, supports player and host modes, and preserves the event contracts already handled by the React minigame.

## Scope

- Add a native Canvas 2D scene under `public/rpg` with no Phaser or CDN dependency.
- Support keyboard controls (WASD and arrow keys) plus the existing D-pad messages.
- Render a pixel-art public-service office map, the local player, remote players, positive objects, hazards, support NPCs, and the public-accountability center.
- Preserve the existing parent event names: `NHAT_SACH`, `DINH_BAY`, `FOUND_LOYAL_CUSTOMER`, and `ESCAPED_GATE`.
- Provide a read-only host spectator mode.
- Display useful loading and connection states instead of an empty black surface.
- Do not redesign the surrounding Host/Player dashboards or change scoring rules.

## Architecture

### Static scene

`public/rpg/index.html` owns the canvas and loads focused static modules. The scene renders independently of network state, so a configuration or connection failure cannot produce a blank screen.

### Pure game core

`public/rpg/game-core.js` contains deterministic helpers for URL configuration, coordinate clamping, collision detection, movement, and collision-event selection. It has no DOM or Firebase dependency and is covered by Node tests.

### Browser runtime

`public/rpg/game.js` owns input, the animation loop, canvas drawing, entity cooldowns, resize behavior, and the `postMessage` bridge. It receives snapshots from the parent and sends player movement and gameplay events back to the parent.

### React/Firebase bridge

The existing React layer remains the sole Firebase owner. `RpgGamePlay.jsx` subscribes to the scene data already stored in Firebase and posts normalized snapshots into the player iframe. It accepts movement messages from that iframe and writes the local player's position. `HostView.jsx` posts the same read-only snapshot into the host iframe. Both bridges validate message source and event shape before acting.

This avoids loading a second Firebase SDK inside every iframe and keeps database configuration in one place.

## Message Protocol

Parent to iframe:

- `GAME_SNAPSHOT`: `{ phase, players, items, hazards, npcs, gates }`
- `DPAD_MOVE`: `{ dir: "up" | "down" | "left" | "right" | "stop" }`
- `FREEZE` and `UNFREEZE`

Iframe to parent:

- `RPG_READY`: scene is rendered and ready for its first snapshot
- `PLAYER_MOVE`: `{ x, y, direction }`, throttled by the parent before Firebase writes
- Existing gameplay events with their current payloads: `NHAT_SACH`, `DINH_BAY`, `FOUND_LOYAL_CUSTOMER`, and `ESCAPED_GATE`

The host iframe never emits player movement or gameplay events.

## Gameplay Behavior

- The player spawns at a stable default position or their last valid Firebase position.
- Movement is frame-rate independent and clamped to map bounds.
- Positive-object collisions emit once per object until the parent removes or changes it.
- Hazard collisions use a cooldown to prevent repeated penalties every animation frame.
- NPC and gate collisions emit once per entity per scene session.
- Player appearance uses the existing character color passed in the iframe query string.
- Host mode fits all known players into a shared spectator view and clearly labels disconnected/empty state.

## Error Handling

- The map and local player render before any snapshot arrives.
- A status badge distinguishes waiting for data, connected, frozen, and spectator states.
- Invalid query parameters or malformed snapshots fall back to safe defaults.
- Unknown messages and invalid coordinates are ignored.
- Canvas resize retains world coordinates and does not reset progress.

## Testing

- Node unit tests cover query parsing, movement, bounds, collision geometry, snapshot normalization, and collision-event mapping.
- Existing `gameStateUtils` tests continue to pass.
- A production build must succeed.
- Browser verification checks that `/rpg/index.html?role=player` and `?role=host` both render meaningful canvas content without an error overlay or console error.
- The integrated minigame check verifies that the iframe loads rather than resolving to the Vite application fallback.

## Success Criteria

- Entering any RPG phase shows the office map instead of a black frame.
- Player controls work on desktop and through the existing mobile D-pad.
- Existing score, integrity, progress, freeze, NPC, and gate flows still receive their expected events.
- Host spectator mode renders without allowing gameplay mutations.
- The scene remains visibly usable when realtime data is delayed or unavailable.
