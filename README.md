# Browser Pinball — First contact

A complete small three-ball table: two flippers, a charged plunger, three pop bumpers, rubber posts, an energetic center save post, slingshots, inlanes/outlanes, scoring, and game over. Static HTML, Canvas, JavaScript modules and Planck 1.5.0; no build step or backend.

## Run

With Node 22+ and pnpm (or npm):

```sh
pnpm install
pnpm start
```

Open http://localhost:5173. Hold A / Left Arrow and D / Right Arrow for flippers. Hold Space to compress the plunger, then release. R or **New game** restarts the three-ball game. Touch/pointer buttons provide the same controls. Drains automatically prepare the next ball; shooter-lane returns allow another plunge without costing a ball.

A sloped one-way gate at the shooter exit passes upward plunges and deflects returning balls left into the playfield. Gate geometry and allowed travel direction are configured in the table definition; native collisions produce the deflection.

```sh
node scripts/check.js
```

This single command runs JSDoc type checking and all headless scenarios. `pnpm run check` is equivalent. `node scripts/serve.js` starts directly if your package-manager launcher is unavailable.

## Definitions and boundaries

`new Simulation(options, definition)` accepts the definition directly. `src/table.js` exports `table` (the original calibration fixture) and `firstTable` (the playable layout). Definitions control dimensions, gravity, walls, flipper pivots and geometry, ball spawn, materials/damping, mechanisms, plunger range, drain timing, ball count, and point values. This is ordinary JavaScript, not an editor or schema framework.

- `src/simulation.js`: authoritative fixed 120 Hz world, mechanical actuation, plunger and ball lifecycle. Mechanism contacts emit `{type, id, tick}` events; active bumpers/slingshots apply explicit impulses after the physics step. A 12-tick debounce prevents overlapping fixtures from retriggering immediately.
- `src/rules.js`: consumes events and applies the table's scoring policy. `bumper.hit` = 100, `sling.hit` = 50, `post.hit` = 10 on this table. Physical components do not award points.
- `src/renderer.js`: draws simulation snapshots, including short activation flashes, without changing gameplay.
- `src/main.js`: keyboard/pointer input and fixed-tick input recording. Quick plunger releases are latched so they cannot fall between ticks.
- `test/`: collision, flipper, calibration, configurable-table, mechanism/event, launch, inlane, replay and three-ball lifecycle scenarios.

`replay(commands, ticks, definition, options)` accepts full input snapshots with tick stamps. Inputs persist until the next command; reset and plungerRelease are one-tick commands and should be cleared in the following snapshot. Same-engine/runtime repeatability is supported; cross-platform bit-for-bit determinism is not promised. No random mechanisms currently exist.

## Explicit scale and baseline

The playable table intentionally retains the prototype's arcade scale: 6 × 10 world units and gravity 5.5 units/s². Its 0.36-unit ball diameter / 1.05-unit flipper length ratio is about 0.343. Values reported as m/s by the legacy calibration page belong to its original nominal units; they are not real-machine speed references. We have not normalized this to a physical cabinet or modeled playfield rolling/sliding and spin coupling.

Servo actuation remains the provisional playable baseline because it retains the existing response and bounded approach to the stop. `/?actuation=solenoid` provides the alternate powered-stroke/reduced-hold model. Human playtesting must select the final baseline; passing automated scenarios cannot establish feel or realistic shot speeds.

## Permanent calibration

Open `/calibration.html` for 20 repeatable isolated shots: two actuator models, four positions with stationary and incoming balls, plus incoming midstroke and already-raised cases at mid-flipper for both models. The page provides animated replay, exit speed/direction, flight rise, and peak angular speed during contacts. `node scripts/calibrate.js` prints full JSON, including outgoing velocity and first-impact speed.

Measurements only accept contacts between the ball and the tested flipper, in either fixture order. The alternate model uses torque-limited target speed through the stroke, native stops, reduced holding torque and weaker return torque. It is inspired by Visual Pinball's EOS settings: https://github.com/vpinball/vpinball/blob/master/docs/Script%20API%20Reference.md . It is not a port or a calibrated solenoid model.

Exit velocity is sampled after the initial 16 measured ticks and three ticks without an impact impulse, avoiding transient fixture separations. Rise ends at the apex, next impact, or five-second trial limit. Peak contact speed is the maximum absolute post-solver angular speed over the initial contact sequence. Midstroke/raised cases warm up the flipper away from the ball, then introduce an incoming ball just outside the current rubber surface. They are controlled state probes, not complete inlane approach trajectories.

For static deployment, include `node_modules/planck/dist/planck.mjs` and its license, or copy it to a vendor folder and adjust the import map. The local development server is not a production server.
