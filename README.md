# Browser Pinball — First contact

Milestone 1: one ball, boundaries, two powered flippers, and drain/reset. Static HTML, Canvas, JavaScript modules, and Planck 1.5.0; no build step or backend.

## Run

With Node 22+ and pnpm (or npm):

```sh
pnpm install
pnpm start
```

Open http://localhost:5173. Hold A / Left Arrow and D / Right Arrow for flippers. Press Space or click **Drop a fresh ball** to reset. On-screen buttons support pointer/touch input.

```sh
pnpm run check
```

This runs JSDoc type checking and headless Node physics scenarios. `node scripts/check.js` runs the same checks directly, and `node scripts/serve.js` starts directly if your package-manager launcher is unavailable.

## Physics and structure

- `src/table.js`: dimensions and tuning. Units are metres; x points right, y points down. Effective gravity represents an inclined playfield rather than full free-fall gravity.
- `src/simulation.js`: authoritative fixed 120 Hz world, bullet ball with continuous collision detection, motor-driven revolute joints and angular limits. Contacts transfer flipper energy; there is no artificial flipper kick.
- `src/renderer.js`: draws snapshots without changing gameplay.
- `src/main.js`: keyboard/pointer input, fixed-tick loop, tick-stamped input recording.
- `test/simulation.test.js`: repeatability, flipper limits/contact, wall collision, and drain lifecycle.

`replay(commands, ticks)` accepts full input snapshots with tick stamps. Inputs remain held until the next command; reset is a one-tick command and must be cleared in the next snapshot. Replay guarantees are limited to the same engine/runtime. No randomness is currently used.

Planck is provisional: these scenarios support initial suitability, not a comprehensive pinball physics evaluation. Human playtesting should assess shot control, flipper response, and return paths before adding mechanisms. No plunger, bumpers, scoring, ball limit, or game-over rules yet.

For static deployment, include the Planck module from `node_modules/planck/dist/planck.mjs` and its license, or copy it to a vendor folder and adjust the import map. The development server is local only and not a production server.
