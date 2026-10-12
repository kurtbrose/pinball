# Demo board route and principle evidence map

Purpose: an open, single-level three-ball demo with aimable bumpers, recoverable ordinary returns, active slings and deliberate center/outlane losses. This is a mechanical review with bounded samples; fairness, shot identity and feel remain partial.

Baseline: `layout-before-route-review.json`; revision: current `firstTable`, servo actuator at 120 Hz. Reproduce with `node scripts/route-review.js`; full inputs, table definitions, successful and failed trials, trajectories, ordered stages, events and censoring go to `results/route-review.json`, summaries to `results/route-summary.json`.

| Shot / route | Origin | Reachable | Return | Problem / finding |
| --- | --- | --- | --- | --- |
| Left wall descent | y=4.5, center 0.03/0.15 beyond wall clearance, vx=-0.4/0/0.4, vy=0.1/2/5 | Protected inlane then paddle in 17/18 families | Collector rolls inward before lane split | Offset=0.15, vx=-0.4, vy=5 lacks ordered inlane passage and a sampled redirect; paddle contact alone is not control |
| Right wall descent | Same family, inside shooter divider | Protected inlane then paddle in 18/18 families | Collector and wider sling clearance feed paddle | Supported mechanically; human timing untested |
| Launch / gate | Speeds 11/13.5/16 from shooter; game tests cover seven charge levels and both actuators | All three enter main playfield; no shooter return in existing charge regressions | Post-entry paddle contacts observed | Supported for tested charges; launch feel untested |
| Bumper aims and exits | Both flipper presets, each of three bumpers; delays 0..48 every 2 ticks | All six origins/targets reached in sampled timing searches | First successful timing per target replayed for 20 seconds; all six receive later paddle contact | Return contact supported; reacquisition timing and independently selectable shot identity untested |
| Left / right sling rebound | Upward approach from below sling | Both activated | Later paddle contacts, no persistent slow state in these probes | Weak/miss sling arrivals and control after the rebound remain untested |
| Left / right protected feed | Inlane starts y=6.6, vy=0.1/2 plus existing grid tests | Paddle contacts observed | Existing lower-feed timing/release tests support redirection and movable catches | Upstream wall coverage is separate; natural upper-shot arrival distributions incomplete |
| Left / right outlane branch | From playfield x=1.15/4.3, y=5.9, outward vx=2, vy=0.1 | Ordered outlane crossing then drain on both sides | No paddle contact in these intentional misses | Supports accessible loss branches, not fair probability or all nudge rescues |
| Center miss | x=3, y=8.7, vy=0.1 | Natural drain | No automatic save | Supported; difficulty judgment remains human |
| Bumper weak arrivals / misses | Six existing upstream negative probes | Hits and misses reported individually | All drain in 20-second observations; maximum slow run below 1 second | Supported for these negative cases; not an exhaustive chaos/escape proof |

## Comparison and limits

- 36 wall arrivals per revision: ordered inlane-to-paddle passage improved from 1/36 to 35/36; any paddle contact 9/36 to 36/36. A timing sweep from the original upstream starts achieved paddle contact followed by an upper-region return in 35/36 families, previously 2/36. No-input baselines complete none of those upward-return contracts. The remaining family is explicitly unresolved, not counted as controlled because it touched a paddle.
- Timing delays are 0..360 at 12-tick spacing, held 24 ticks, observed 1,800 ticks (15 seconds). Preserve per-arrival successful delays; counts do not imply continuous timing windows. Nudge comparisons use directions left/right/up at delays 24/48/72, 900 ticks (7.5 seconds). Keep their target crossings, contacts and censoring separate from ordered control evidence.
- No wall baseline is censored; none has a two-second low-speed run. The broad grid is servo-only; existing local release, sweep, bumper-access and full-game tests cover both actuators. Extend upstream route families to solenoid if selecting that model.
- Clearance: collector endpoint to lane-post center is 0.55 left and approximately 0.552 right. Subtract post radius 0.13 and ball diameter 0.36: remaining center-path margin about 0.06/0.062. These narrow lateral loss entrances are intentionally distinct from wall feeds. Passage is demonstrated with upstream lateral misses; this arithmetic does not establish all oblique approaches.
- The review exposed a collector/post resting pocket in an early variant. A tracked regression reconstructs that rejected geometry and upstream miss, verifies its long stationary interval, then verifies the current geometry drains. Moving the upstream posts, changing collector geometry and using explicitly passive contact restitution removes that observed failure. Normal Planck restitution mixing alone did not make the collectors passive.
- Browser: Edge verified startup, launch, both flippers, nudge and reset with no page errors. Screenshot inspection confirms rendered collectors, posts and sling placement match collision geometry. Human recognition and reaction difficulty are untested.

## Obligations beyond those routes

| Applicable guidance | Finding | Next evidence needed |
| --- | --- | --- |
| Full-ball clearance and complete flipper sweep | Supported in tested junctions and both-actuator sweep regressions | Extend off-angle branch probes if players report pinches |
| Accessible targets | Supported reachability for three bumpers from both flippers | Independent aiming from naturally arriving balls, not only preset setups |
| Successful return supports next action | Wall-route redirection supported; bumper/sling contact alone is incomplete | Add second-action timing variants from the original successful shot input history |
| Passive exits and capture release | No inaccessible trap observed in final route samples; existing catch/release tests pass | Inspect any new long slow interval before interpreting it as a valid catch |
| Risk matched to reward / distinct shot identity | Untested; all bumpers share 100 points in this deliberately small demo | Human aiming feedback before introducing differentiated rewards or modes |
| Legible collision geometry | Browser inspection supported | Human recognition of feed/loss branches |
| Replay, tick telemetry and censoring | Existing replay tests plus ordered-stage sampling tests supported | Maintain same-runtime replay for future inputs |
| Real-machine style, ramps, capture devices | Not applicable: no real-machine reference, elevated routes or capture device introduced | Apply corresponding guidance only if those mechanics are requested |
| Overall fairness and good feel | Untested | Human playtest; do not substitute survival totals or passing tests |
