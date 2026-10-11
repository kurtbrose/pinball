# Browser Pinball — First contact

A complete small three-ball table: two flippers, a charged plunger, three pop bumpers, rubber posts, an energetic center save post, slingshots, inlanes/outlanes, scoring, and game over. Static HTML, Canvas, JavaScript modules and Planck 1.5.0; no build step or backend.

## Run

With Node 24+ and pnpm (or npm):

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

Static deployment needs no install or build step. Planck 1.5.0 is checked in at `vendor/planck.mjs`, with its source map and MIT license. Browser play, workers and Node scenarios load this same copy; the package dependency supplies declarations for type checking. Serve the repository as static files, including `vendor/`. Relative assets and navigation work under the GitHub Pages `/pinball/` prefix. When upgrading Planck, update the package version and vendored module, map and license together, then run checks. The local development server is not a production server.

## Headless shot laboratory

Open `/shot-lab.html` for editable shot scenarios, trajectory scrubbing, a per-shot heatmap, feature hits, an event log, and a 25-timing search with successful/unsuccessful paths. Simulations run in a cancellable module worker; no backend is needed. JSON downloads include the full table definition and inputs. The preset menu provides left/right approaches and a full-strength shooter exit. Search intentionally replaces the scenario's commands with the selected timing experiment.

```sh
node scripts/shot-lab.js --preset left --out results/left-shot.json
node scripts/shot-lab.js --input scenarios/left-approach.json --out results/example-shot.json
node scripts/shot-lab.js --preset left --search left --out results/left-search.json
node scripts/shot-lab.js --input results/left-shot.json --out results/replayed-shot.json
```

The command reports actual physics ticks (including warmup) and measured throughput; timing is outside the deterministic result. Generated reports under `results/` are ignored by Git. To replay a search trial, supply its `result.config` as a scenario. A downloaded single-shot browser report is accepted directly. Input files that omit `table` use First contact; saved reports always include the full table.

The reusable JavaScript API is `runShot(spec)` and `searchTimings(spec, {side, delays, holdTicks})` from `src/shot-lab.js`. A spec contains:

```js
{
  table: firstTable,
  initial: { x: 2.5, y: 8.1, vx: -0.4, vy: 2, spin: 0 },
  ticks: 360,
  sampleEvery: 3,
  actuation: 'servo',
  commands: [
    { tick: 8, input: { left: true } },
    { tick: 32, input: {} }
  ],
  target: { mechanismId: 'pop-center' }
}
```

Commands replace the entire held input, and accept only boolean left/right controls. Tick 0 precedes the first measured step. An optional `warmup: {ticks: 60, input: {left: true}}` moves the actuator with the ball inactive before placing the initial ball; warmup is excluded from telemetry. Each shot builds a fresh world, disables automatic game respawn/shooter resets, and ends at first drain, out-of-bounds escape, or tick limit. It does not restore arbitrary Planck contact/solver state.

Targets can also be rectangles: `{id:'entrance', x:1, y:2, width:0.5, height:0.3}`. Rectangle success tests the swept ball centre between adjacent physics ticks, so narrow targets cannot be skipped merely because trajectory samples are sparse. Mechanism success requires its hit event. Both indicate reachability within the trial; ricochets can count, so inspect the trajectory before interpreting a successful timing as an intentional shot.

Metrics remain separate:

- `survivalSeconds` is observed duration, not predicted ball lifetime; `censored: true` identifies tick-limited shots.
- Drain position records the centre at the first drain tick; it does not label a drain fair or unfair.
- Flipper contacts count episodes with positive impulses involving the ball and a flipper; gaps shorter than three ticks are merged to suppress fixture/solver chatter.
- Feature coverage is the fraction of defined mechanisms hit at least once; no mechanisms yields `null`.
- `stuckSeconds` totals low-speed runs lasting at least `stuckAfterTicks` (default 120), with speed below `slowSpeed` (default 0.1 world units/s). This is a possible-stall diagnostic; it can include an intentional catch and does not detect every trapped orbit.
- Return crossings record downward crossings of a plane one unit above the highest flipper pivot; full trajectories remain available.
- Heatmaps count every in-bounds post-step ball centre, independent of `sampleEvery`. Out-of-bounds samples are omitted and counted indirectly by the difference from elapsed ticks.
- Multiball duration is `null` because the simulation supports one ball. No quality/fun score is assigned.

The worker and Node now load the same Planck module URL via `src/physics.js`. Workers cannot use the document import map. For vendored/static deployment, update that URL as well as the calibration page's import map.

Random/reactive/predictive players and automatic layout optimization are future stages. This lab provides their scenario, measurement, and replay foundation first.
