# Project status

## Working

- First complete table: three-ball game, charged plunger, shooter lane, inlanes/outlanes, two powered flippers, rubber posts, three pop bumpers, two slingshots, scoring and game over.
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

## Complete example-table refinement

- Shortened and raised both slings, opened the right aiming corridor, widened the lane passages, and moved downhill guide exits above the heels. The former persistent left and right heel pockets release in the revised layout; motors, materials, scores and calibration are preserved.
- Repeatable review: `node scripts/layout-review.js` and `node scripts/layout-audit.js`. Tracked before definition and arrivals live in `scenarios/`; [LAYOUT_REVIEW.md](LAYOUT_REVIEW.md) records timing intervals, return findings, negative tests and limits.
- All three bumpers remain reachable from both flippers at three sampled arrival speeds. Default center timing sweeps reach 21/25 left and 20/25 right; reachability is not a claim about direct aiming or feel.
- Broad matched audit: 686 trials per layout and both actuator models. All revised trials drain within 30 seconds after scripted release/retry; nine old stationary heel cases persist through 100-second extensions. The 96-case lane family also drains after release. Held catches are now permitted by the full-game regression and must drain naturally after release; no drain timer or automatic save was added.
- Type checking and all 35 tests pass, covering stroke/hold/release, lane feeds, all-bumper access, shooter charge/gate behavior, replay and three-ball play.
- Isolated Edge browser verification passed for both actuator models: rendering, keyboard launch/flippers, pointer plunge, scoring, ball advance, restart, worker timing search and scrubbing. Browser timing counts match Node; no runtime or resource errors observed. Screenshots inspected. Human playtesting remains necessary for aiming, catches, outlane rebounds and fairness.

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

- Added dependency-free Pages packaging: `node scripts/build-pages.js` / `pnpm run build:pages`. HTML references content-versioned CSS, the full module graph, module worker and vendored physics in `dist/assets/<hash>/`; unchanged source bytes preserve the Node/browser physics baseline.
- Added `.github/workflows/pages.yml` for `main` and manual dispatch. It restores the last successful Pages artifact when available, preserving old asset paths for cached HTML/open tabs, then packages and deploys `dist/`. Artifact retention is 90 days. Requires Pages publishing source **GitHub Actions**; remote settings and deployment have not been changed in this session.
- Type checking and all 36 tests pass. An isolated Edge test with caching enabled under `/pinball/` verified two asset versions, fresh table code after reload, a still-working old-tab worker, the new worker, launch and all 20 calibration rows; no browser errors. Existing HTML can remain cached until revalidation; assets update together when fresh HTML is loaded.
- Live publishing diagnosis: the first custom deployment succeeded, then the legacy branch publisher finished 18 seconds later and overwrote it with unversioned HTML. Added an explicit publishing-mode guard to the workflow. Set Pages Source to GitHub Actions and rerun deployment to stop the competing publisher; the repository setting has not been changed locally.

- Vendored Planck 1.5.0 with its source map and MIT license. Browser pages, module workers and headless scenarios use the same checked-in module; no runtime node_modules or build step is needed.
- Fixed play/back links and the servo comparison link to stay inside the deployment subdirectory.
- Type checking and all 29 scenarios pass. Browser launch, restart and shot-worker execution verified under /pinball/ on a static server that rejects node_modules requests.


## Drainability after playtesting feedback

- Removed the powered center-save post so center misses can drain without an automatic kick back into play.
- Reversed uphill inlane guide ramps to descend toward the flipper pivots, removing the left resting pocket. Moved the right lane post/guide left by 0.1 units to leave ball-diameter clearance beside the shooter divider.
- Type checking and all 30 tests pass, including natural three-ball game-over runs with quick, half and full launches, both actuator models, and either released or continuously held flippers. No ball teleportation or drain timer is used in this regression.
- A separate seven-charge servo probe drained all sampled shots, released or held, within 50 seconds. These specific trajectories demonstrate drainability; they do not establish gameplay balance or feel.

- Browser verification: quick Space launch scored 400, drained naturally, and advanced to ball 2 with the plunger ready.

## Directional nudge evaluation

- Added tick-stamped nudge vectors to simulation and shot commands: magnitude at most 1, resulting ball motion relative to the fixed table, +x right/+y down. Browser Z/X/C bump left/up/right. Each press applies up to 1.2 arcade velocity units with a 30-tick cooldown; held input does not repeat. Ready, drained, game-over and isolated calibration states do not receive jolts. Prototype calibration disables nudges. No cabinet calibration or tilt mechanic is claimed.
- Added searchNudges and scripts/nudge-review.js: 24 matched lower-feed baselines with released/held flippers and 288 direction/strength/delay variants. At five seconds, 284 variants drained and four were censored. Contacts and trajectories remain separate; these probes do not establish controllable feeds or fair difficulty. Reports can be regenerated from the tracked script.
- Type checking and all 39 tests pass, including bounded input, cooldown, held-input suppression, inactive phases, deterministic replay/report reconstruction and a controlled near-drain recovery comparison. Edge startup, launch and all three keyboard-generated physics nudge events verified without page errors. Lower-playfield geometry is unchanged; human playtesting and return-path improvements remain outstanding.

## Protected lower feeds on the demo board

- Extended both downhill inlane guides to the outer flipper heels, closing the bypass gaps while leaving distinct outer loss lanes and the center drain. Rendering uses the same wall geometry. Prototype calibration and actuator settings are preserved.
- Matched control review: 36 lower arrivals per revision, 468 timing trials and 432 nudge variants each. Upward redirection without nudges improved from 26/36 to 31/36 arrival families (left 8→13 of 18, right 18/18); successful timing samples 124→166. Nudge target hits 31→83. Longest released low-speed run 9.83→0.55 seconds. See scenarios/protected-feed-review.md for target definitions, censored observations, negative tests and remaining coverage gaps; regenerate reports with scripts/protected-feed-review.js.
- Type checking and all 40 tests pass, including newly demonstrated outer-heel redirection, existing both-actuator feed-release/trap checks, bumper access and natural three-ball draining. Edge verified launch, both flippers, nudge, reset and visible guide geometry without page errors. Human feedback is required for feel; upper-shot return distributions and outlane rescue coverage remain outstanding.

## Operational route review and wall collectors

- Updated design-table-layout and TABLE_DESIGN.md with a scope-based route map and evidence obligations: entry, interaction, exit, control opportunity and miss/loss route. Clearance, contact, survival and control cannot substitute for one another; applicable findings must be supported, problematic or explicitly untested. See scenarios/route-review.md for the first full demo-board evidence map and remaining human/second-action coverage gaps.
- Added runRoute in src/route-lab.js: ordered rectangular passages and simulation events checked every physics tick, independently of trajectory display sampling. scripts/route-review.js preserves matched baseline/final inputs, successful and failed timing/nudge trials, successful bumper-shot returns and negative approaches. Reproduce with node scripts/route-review.js.
- Added passive wall collectors with explicit contact restitution (Planck otherwise mixes by maximum), moved upper posts clear of the collectors and widened the right inlane beside the sling. Both outlane entrances remain reachable from upstream lateral misses. Prototype geometry and global actuator/material settings are preserved.
- Across 36 upstream wall arrivals, ordered inlane-to-paddle routes improved 1→35, paddle contacts 9→36, and arrival families with a sampled contact-then-upward-return timing 2→35. No-input baselines complete zero upward-return contracts. No final wall baseline is censored or has a two-second low-speed run. One fast angled left arrival is explicitly unresolved; no universal control/fairness claim is made.
- Browser startup, launch, both flippers, nudge and reset verified in Edge without page errors; rendered guides inspected against collision geometry. Tests cover ordered stage timing, upstream protected feeds, accessible outlane branches and the rejected collector/post pocket reconstructed as a regression. Human feel, independent bumper aiming and second-action control of actual successful bumper/sling returns remain outstanding.
- Final validation: type checking and all 46 tests pass; git diff --check passes.

## Real-machine building-block library

- Added PINBALL_MECHANISMS.md, 31 pattern cards grouped by gameplay role, seven source-linked machine records and research/sources.md. Entries separate observations from proposed adaptations, record evidence limits and identify current geometry versus missing engine capabilities.
- Seed spans 1980–2021; EM and 2000–2015 coverage remain gaps. No measured layout extraction, VPX intake or invention-date claims. VPXTool selective extraction is documented as an optional future pilot.
- Integrated reference selection into the existing design skill and guide. Documentation only; no runtime or table geometry changes in this work. Checked local links and card IDs; no browser verification needed for these Markdown additions.

## Conventional lower field and routine generated evaluation

- Used the user's Star Trek photo and Pinball Star screenshot as structural references: paired flippers centered in playable width, triangular slings, protected inlanes and distinct outlanes. Saved the previous layout in scenarios/layout-before-conventional-lower.json. Prototype calibration remains unchanged.
- Slings now trigger only on their inward face, with passive low-bounce inlane borders. Active rubber is highlighted in the renderer. Shot presets follow current paddle positions; local heel tests now use current table-relative arrivals instead of obsolete fixed coordinates.
- Normal node scripts/check.js / pnpm run check automatically runs generated layout evaluation. Standalone: pnpm run evaluate:layout. It tests a fixed spatial lattice plus geometry-derived edges/corners, upstream wall-route families, bumper timing and downstream returns. Valid-start screening excludes outside/overlapping states and the explicitly separate shooter-ready region. Required mechanical failures stop checks and Pages deployment; diagnostics remain visible, saved with full replay inputs and trajectories in results/layout-evaluation.json and a CI artifact.
- Current evaluation: 2,133 simulations, 217 spatial starts, 36 wall arrivals, 12 bumper approach families; zero required failures and 12 diagnostics. Diagnostics include moving timeouts, input-responsive balances/catches and one fast right-bumper success without later paddle contact. No fairness or quality score is claimed. See scenarios/conventional-lower-review.md for reference interpretation, route coverage and limitations.
- Verification: generator repeatability/clear starts, automatic discovery of removed collectors, generated inaccessible-pocket finding and exact counterexample replay tested. Edge startup, launch, both paddles, nudge and reset verified without errors; active-face/geometry screenshot inspected. Human feel and broader second-action timing remain outstanding.
- Final verification: type checking, all 50 tests, default generated evaluation and git diff --check pass.

## Fresh reference-led demo and visual assembly review

- Updated design-table-layout and TABLE_DESIGN.md to require rendered whole-assembly comparison with references at rest and fully raised, named departures, connected lane boundaries, proportions and apron. Visual evidence remains separate from route validation.
- Rebuilt the lower assembly with wider triangular slings, shorter paired flippers, short diagonal heel feeds, labeled in/out lanes and a presentation-only apron; recentered the upper bumper nest. Prior demo saved in scenarios/layout-before-fresh-assembly.json. Permanent calibration and launch mechanics retained.
- See scenarios/fresh-layout-review.md and its two saved renders. Browser launch, flippers, all nudge keys and reset verified without errors. Type checking and all 50 tests pass. Generated evaluation: 2,115 simulations, zero required failures, 19 diagnostics; four slow angled arrivals lack sampled upward redirection, seven moving observations are censored and eight low-speed states respond to input. Human recognition/feel and second-action control remain unresolved.
