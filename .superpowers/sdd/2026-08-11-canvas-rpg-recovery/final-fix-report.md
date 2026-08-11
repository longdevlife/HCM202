# Final Fix Wave Report: RPG progression reachability and Firebase idempotency

## Outcome

The final review findings are resolved in one coherent change:

- Every real `PHASE_CONFIGS` mission can now be completed from its generated world.
- All seven host event buttons append matching books, NPCs, or hazards to Firebase while retaining the audit record.
- Book and NPC rewards are canonical, per-player, multiplayer-safe, and idempotent across duplicate/reloaded messages.
- Final-gate progress, completion metadata, and the `+100` phase bonus are one player transaction and require all three phase-3 prerequisites.
- Hazard penalties come from the canonical `traps/{id}` record, never iframe-provided score/integrity fields.
- Claimed entities are hidden only for the player who claimed them; other players can still collect the same global entity.
- The host spectator remains read-only and no longer draws a phantom local player.

## Root-cause evidence

1. `createPhaseWorld` filled all `maxBooks` slots from `bookReward`, so configured feedback/support goal types were absent.
2. `handleMarketEvent` wrote only `marketEvents/{id}`; no gameplay collection consumed that record.
3. Book claims used one scalar `claimedBy`, then deleted the shared book. NPC rewards had no claim at all.
4. Gate progress and bonus were separate/unconditional operations, so missing prerequisites and repeated messages both succeeded.
5. `DINH_BAY` applied score, integrity, duration, and messaging directly from the iframe payload.
6. The host canvas always drew its initialized local avatar, even in spectator mode.

## Files changed

- `src/minigame/rpgBridge.js`
  - deterministic reward scheduling from real progress goals
  - deterministic host-event entity generation
  - stricter hazard message ID contract and canonical hazard resolution
- `src/minigame/HostView.jsx`
  - host-event multi-location Firebase updates
  - reset of the new per-player claim ledger on a new game
- `src/minigame/gameStateUtils.js`
  - pure transaction reducers for entity rewards and final-gate completion
- `src/minigame/RpgGamePlay.jsx`
  - canonical Firebase reads
  - per-player transactions and shared entity claim/completion maps
  - prerequisite-gated, one-time final completion
- `public/rpg/game-core.js`, `public/rpg/game.js`
  - per-player resolved-entity filtering
  - host spectator avatar cleanup
- `src/minigame/rpgBridge.test.js`
  - real-config reachability, event effects, deterministic generation, canonical hazard tests
- `src/minigame/rpgProgression.test.js`
  - two-player claim semantics, duplicate claims, NPC recovery, gate prerequisite/idempotency tests
- `src/minigame/rpgGameCore.test.js`, `src/minigame/rpgBrowser.test.js`
  - per-player visibility and host spectator regressions

The pure reducers stayed in the existing `gameStateUtils.js` helper module rather than adding a second state-helper module; this keeps the Firebase transaction callbacks small and directly reuses `applyPlayerDelta`.

## TDD evidence

### RED

- Real phase reachability: `node --test src/minigame/rpgBridge.test.js`
  - 3 failures: phase 1 lacked `positive_feedback`, phase 2 lacked `transparency`, phase 3 lacked `accountability`/`serve_people`.
- Host events: same focused command
  - 2 failures: `case_peak` created no books and the deterministic event result was absent.
- Transaction reducers: `node --test src/minigame/rpgProgression.test.js`
  - 4/4 failures before book/NPC claim and final-gate reducers existed.
- Hazard ID validation: bridge test was 11 pass / 1 fail because a score-bearing payload without a canonical ID was accepted.
- Canonical hazard selection: focused test failed with `undefined !== -30` before canonical resolution existed.
- Per-player visibility: core test was 5 pass / 1 fail before claim maps were interpreted per player.
- Host phantom avatar: focused Playwright test failed because the canvas center pixel was the local-player color `[0, 170, 255, 255]`.

### GREEN

- Bridge focused suite: 13/13 pass after mixed reward scheduling, event generation, ID validation, and canonical hazard selection.
- Progression focused suite: 4/4 pass, including two players claiming one entity independently, duplicate suppression, all three missing-prerequisite cases, and one-time gate bonus.
- Core focused suite: 6/6 pass.
- Browser focused/full suite: 7/7 pass, including host read-only collisions, parent-source guard, collision de-duplication, movement direction, and no phantom host avatar.

## Final verification

- `node --test src/minigame/*.test.js`
  - exit `0`
  - 45 tests, 45 pass, 0 fail, 0 skipped
  - includes the Playwright browser smoke tests against the recovery worktree's live Vite server on `127.0.0.1:5173`
- `npm run build`
  - exit `0`
  - Vite 4.1.4, 681 modules transformed
- `git diff --check`
  - exit `0`; no whitespace errors

Build output retains the repository's existing advisory warnings for outdated Browserslist data, ignored dependency-level `use client` directives, `eval` in `three-stdlib`, and a chunk above 500 kB. None are introduced by this fix wave and the production build succeeds.

## Self-review against the brief

- Reachability:
  - phase 1 generates 8 `case_file` and 2 `positive_feedback` items.
  - phase 2 generates 4 `integrity_item` and 2 `transparency` items.
  - phase 3 generates 3 `transparency`, 1 `accountability`, 1 `serve_people`, and 1 `public_center` gate.
  - IDs/coordinates remain deterministic for a given phase and seed.
- Host events:
  - `case_peak`, `feedback_wave`, `surprise_inspection`, and `recovery_chance` create matching positive items.
  - `citizen_support` and `citizen_feedback` create matching NPC rewards.
  - `final_pressure` creates matching configured hazards.
  - Audit and entities are written in one root update without overwriting the active collections.
- Multiplayer/idempotency:
  - global books/NPCs are never deleted on claim.
  - player score/integrity/progress and the player's claim ledger change in one transaction.
  - global `claimedBy[playerId]`/`completedBy[playerId]` maps preserve per-player canvas visibility.
  - duplicate and concurrent messages cannot add the reward or phase bonus twice.
- Gate:
  - the transaction checks current phase-3 `transparency`, `accountability`, and `serve_people` progress.
  - `public_center`, completion fields, claim ledger, and `+100` are atomic and one-time.
- Security/protocol:
  - iframe event names remain exactly `NHAT_SACH`, `DINH_BAY`, `FOUND_LOYAL_CUSTOMER`, and `ESCAPED_GATE`.
  - both source guards remain (`e.source === iframe.contentWindow` and `event.source === window.parent`).
  - hazards use persisted Firebase metadata after ID matching.
- Preservation:
  - host collision mutation remains disabled.
  - both Firebase collection subscription effects still return all unsubscribe callbacks.
  - existing phase/vote/reset scoring flow remains intact; reset now also clears the new claim ledger.
  - no CDN, engine, or dependency was added.

## Concerns

- The repository has no Firebase emulator integration harness, so Firebase transaction wiring is covered by pure transaction-reducer tests plus production build/browser smoke tests rather than a live backend end-to-end test. The transaction callbacks themselves are deterministic and tested with duplicate and multi-player state.
- The existing build advisory warnings noted above remain unchanged and are non-blocking.
