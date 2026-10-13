---
name: design-table-layout
description: Design, review or tune this Browser Pinball repo's playfield geometry, shot entrances, return paths, component placement and drainability using its deterministic shot laboratory. Use for layout work; ordinary deployment, visual styling and score-only changes do not need this skill.
---

# Design table layout

Create a coherent, controllable playfield with deliberate shot and return routes. Use the current repo instructions and table definition; preserve permanent calibration, headless simulation and replay. This skill does not authorize new subsystems or external publishing.

The canonical reference is [TABLE_DESIGN.md](../../../TABLE_DESIGN.md), relative to this skill directory. Read only sections relevant to the task:

- New layout or broad review: **Design brief and layout patterns**, **Shot geometry**, **Component placement**, and **Agency, difficulty and reward**.
- Every layout review: **Operational route review**. Broad refinement covers the ordinary route map; narrow changes cover the affected routes and upstream/downstream neighbors.
- Blocked shots or poor feeds: **Shot geometry**, **Clearance and passive returns**, and **Evaluation with the shot laboratory**.
- Stalls or unexpectedly endless play: **Clearance and passive returns**, **Agency, difficulty and reward**, and the findings table in **Evaluation with the shot laboratory**.
- Punishing drains, missing safe areas beside flippers, or broad refinement: **Lower-playfield control review** as well as **Component placement** and **Agency, difficulty and reward**. Treat reported loss of control as a layout issue even when drainability checks pass.
- A supplied real-machine reference or named style: **Working from real layouts** and **Sources and their limits**. Inspect the actual reference rather than inferring measurements from a designer's name.
- Requested ramp work: **Ramps and elevation** and **Shot geometry**. Distinguish a proposed future model from implemented mechanics.

For a new table, new shot family or request for real-machine building blocks, start with [PINBALL_MECHANISMS.md](../../../PINBALL_MECHANISMS.md). Read only the relevant pattern cards and linked machine records. Select the interaction and complete route to borrow; distinguish source observations from our adaptations, check evidence confidence and list missing simulation capabilities. Library entries are not measured prefabs. For research expansion use [research/sources.md](../../../research/sources.md). Narrow tuning of an existing route does not require browsing the whole library.

Inspect `src/table.js`, relevant scenarios/tests, and current `STATUS.md` before changing a layout. Define the shot's origin, entrance, completion, successful return and near-miss behavior. Check full-ball clearance and moving flipper geometry; passive guides need exits for slow balls. Support intentional capture with a real release mechanism.

For an ordinary two-flipper lower playfield, begin with a conventional reference arrangement: paired flippers, triangular inward-active slings, protected inlane guides to the heels, and separate outer loss lanes. Inspect supplied references before inventing geometry; explain intentional departures. Passive lane borders must not trigger sling kicks. Simulation validates the chosen arrangement; passing probes alone does not justify an unconventional layout.

For a fresh layout or broad lower-field redesign, perform the **Visual assembly review** in TABLE_DESIGN.md before numerical tuning and again after geometry changes. Compare the actual rendered whole assembly with the reference at rest and fully raised: proportions, sling footprint, pivot/tip spacing, connected lane boundaries and apron. Name visible departures and inspect collision-aligned boundaries. A component inventory or passing simulator report cannot satisfy this review. Preserve review images and separate visual findings from route evidence; unresolved structural mismatches mean the redesign is incomplete.

Run the default generated evaluation through `node scripts/check.js` (or `node scripts/evaluate-layout.js` alone). It covers a fixed spatial lattice, geometry-derived edges/corners, upstream feed families and bumper timings without manually selecting every scenario. Core contract failures block checks/deployment; diagnostic warnings remain explicit. Review saved counterexamples and the profile's declared bounds/contracts before adjusting geometry. Do not erase warnings or relax a contract solely to make a layout pass.

Build an evidence map before declaring refinement complete: for each applicable principle, state its intended behavior, a failure example, a probe and the supported/problem/untested finding. Follow complete ball routes from plausible upstream starts, not only component-local setups. Include wall descents into lane branches, successful-shot returns, misses and slow arrivals. A downstream test does not cover its feeder. Resolve demonstrated mechanical failures within scope; disclose gaps and human judgments. Do not use passing clearance, contact or drain tests as substitutes for control or fair difficulty.

Use `runShot` and timing searches for specific reachability/return questions, varying plausible arrivals rather than relying on a single favorable setup. Preserve reproducible scenarios and failed trials. Report target hits, sampled timing intervals, drains/censoring and low-speed diagnostics separately. Saved reports contain old table definitions; rerun common inputs against the new definition for comparisons. Full three-ball behavior needs `Simulation`, not the single-shot runner.

For every important shot under review, test at least one plausible miss and one low-speed arrival. Check both for unintended traps, impossible clearance and indefinite passive cycles. Inspect suspicious outcomes; a time limit alone cannot prove an indefinite cycle. Record untested cases and uncertainty explicitly.

For broad layout refinement or changes affecting lower returns, review both inlane-to-flipper transitions and protection beside the outer flipper ends. Follow **Lower-playfield control review**: distinguish reaching the lower playfield from an opportunity to catch, hold or redirect. Mechanical clearance and natural draining do not satisfy this review. Report missing control evidence as unresolved rather than declaring the layout fixed.

Use the **Standard layout-review report** in `TABLE_DESIGN.md`: Shot, Origin, Reachable, Return, Problem, with scenario evidence and negative-test findings below the table. Keep stable shot names across reviews and scenarios. Shared shot metadata in the table definition is future work; introduce it only when several meaningful implemented shots need it, rather than adding a schema during documentation or isolated tuning.

Iterate on the smallest relevant geometry before changing global actuator or material settings. Follow **Iteration and delivery** for checks and browser verification when implementing changes. Leave a short account of design intent, changed routes, evidence and unresolved playtesting questions. Never describe passing scenarios as proof of fun, fairness or realistic feel.
