# Project status

## Working

- First complete table: three-ball game, charged plunger, shooter lane, inlanes/outlanes, two powered flippers, rubber posts, three pop bumpers, two slingshots, tunable energetic center post, scoring and game over.
- Ball drains advance after a short delay; shooter-lane returns permit another plunge. New game resets score and ball count.
- Canvas presentation, activation flashes, keyboard controls, pointer/touch controls, and compact layout with the full table visible.
- Simulation accepts an ordinary table definition. Pivots, walls, ball spawn, gravity and material settings are configurable. Original calibration fixture and playable layout remain separate definitions.
- Physical mechanisms emit tick-stamped events; Rules consumes those events to apply table-defined points.
- Servo remains the provisional baseline; stroke/hold comparison remains available. Neither has been accepted by human playtesting as realistic.

## Verification

- Type checking and 20 automated tests pass, including a deterministic 20-shot calibration sweep, both fixture orders/unrelated-contact rejection, raised/midstroke arrivals, complete-table replay, both inlanes, configurable geometry/materials, seven launch charge levels with both actuator models, one-way shooter gate passage/deflection, quick-tap latching, shooter-lane return, mechanism events and kicks, separate scoring, three drains/game over/restart, and earlier collision/flipper scenarios.
- Browser startup, full table rendering, Space launch and restart verified locally. No browser console errors observed.
- Calibration remains available permanently at /calibration.html and through node scripts/calibrate.js.

## Explicit limits

- Deliberate arcade scale: 6 × 10 world units, gravity 5.5 units/s². Ball/flipper ratio on the playable table is approximately 0.343. Speeds have no real-machine calibration reference and should not be interpreted as regulation pinball speeds.
- Surface rolling/sliding resistance and spin coupling remain simplified damping. Defer further tuning until gameplay identifies a problem.
- No sound, elaborate modes, ramps, multiball, editor, or general mechanism framework.
- Calibration arrivals are controlled flipper-state probes. Five-second rise measurements can be limited by the trial duration or a later contact.
- Scenario tests cover specific cases; they do not guarantee that every fast collision or trajectory is stable or that the table is fun.

## Next priority

Human playtesting of the complete table: compare actuator models, evaluate aiming/catching and return paths, watch for stalls, and assess drain frequency. Choose the final actuation baseline from that feedback. Add one table/mechanism improvement at a time.

## Shot laboratory

- `/shot-lab.html` runs editable scenarios in a module worker and displays trajectories, a scrubber, position heatmaps, events, metrics and timing success/failure overlays. Results can be downloaded as self-contained JSON.
- `runShot` reconstructs a fresh world from the full table, initial ball state, optional flipper warmup and commands. `searchTimings` repeats that setup for candidate delays without arbitrary state cloning. CLI: `node scripts/shot-lab.js --help`.
- Reports include observed survival/censoring, drain position, flipper contact episodes, hit distribution/coverage, low-speed runs, return crossings, target reachability, and all trajectory samples. Multiball is explicitly unsupported (`null`). No combined quality or fun score.
- Type checking and 29 tests pass, including deterministic report replay, unchanged input definitions, sample-independent heatmaps/metrics, swept target crossings, drain termination, timeout/escape/stall distinctions, contact filtering, warmup and timing reconstruction.
- The initial left-flipper sweep ran 25 three-second trials (9,000 physics ticks) in approximately 0.27 seconds on this environment. 21 timings reached the center bumper; all 25 observations were time-limited. This measures reachability in one setup, not full-game balance.
- A diagnostic finding for the next table pass: after 60 ticks of left-flipper hold, its angle is approximately -0.257 radians on the full table versus the configured -0.5. Removing the slingshots in a controlled definition restores the full stroke. The lab exposes this collision; gameplay geometry has not been retuned in this change.
- Automated players, game batches, multi-objective layout optimization and real-world physics calibration remain later stages. Human playtesting remains necessary.
- Browser verification: automatic shot execution, worker timing search (21/25, matching Node), selection of an unsuccessful timing and trajectory scrubbing all work. A worker-ready handshake prevents early messages being lost during asynchronous physics-module loading.

## Shooter exit correction

Full-strength launches could enter the playfield and then rebound through the open shooter mouth. Added a sloped one-way gate: upward launches pass, downward returns deflect left using native collision response. The launch regression now tracks 10 seconds after each of seven charge levels for both actuator models and rejects any shooter-return event, rather than accepting momentary playfield entry.

## Static GitHub Pages deployment

- Vendored Planck 1.5.0 with its source map and MIT license. Browser pages, module workers and headless scenarios use the same checked-in module; no runtime node_modules or build step is needed.
- Fixed play/back links and the servo comparison link to stay inside the deployment subdirectory.
- Type checking and all 29 scenarios pass. Browser launch, restart and shot-worker execution verified under /pinball/ on a static server that rejects node_modules requests.

