# Working on Browser Pinball

Keep changes small and playable. Use JavaScript ES modules with JSDoc checking; Canvas for presentation and Planck for physics. Do not add a framework, backend, editor, ECS, or broad abstraction without a concrete need.

Simulation owns mechanics and rules and must run without browser APIs. Rendering consumes snapshots. Table tuning belongs in src/table.js. Use metres, x right, y down, and fixed 120 Hz ticks. Use physical motors/contacts for flippers; explicit kickers may apply impulses when introduced.

Commands: `pnpm start` (localhost:5173), `pnpm run check` (type checking and headless scenarios). `node scripts/serve.js` and `node scripts/check.js` also work directly. If npm is broken on this machine, use the bundled pnpm launcher instead of changing global tooling.

For substantial changes, run checks, verify browser startup and relevant interactions, and update STATUS.md. Never claim good feel from tests alone. Maintain same-runtime replay. The user has now authorized the first complete table: posts, bumpers, slingshots, plunger, lanes, scoring, and three-ball play. Keep calibration permanent; do not expand into elaborate modes or editors.

Simulation accepts a table definition as its second argument. Prototype calibration uses `table`; browser play uses `firstTable`. Mechanisms emit tick-stamped events; scoring lives in Rules and table points. The playable table uses deliberate arcade world units, not calibrated real-machine metres. Preserve the servo baseline and optional solenoid comparison until human feedback selects the actuation model.
