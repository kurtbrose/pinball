---
name: design-table-layout
description: Design, review or tune this Browser Pinball repo's playfield geometry, shot entrances, return paths, component placement and drainability using its deterministic shot laboratory. Use for layout work; ordinary deployment, visual styling and score-only changes do not need this skill.
---

# Design table layout

Create a coherent, controllable playfield with deliberate shot and return routes. Use the current repo instructions and table definition; preserve permanent calibration, headless simulation and replay. This skill does not authorize new subsystems or external publishing.

The canonical reference is [TABLE_DESIGN.md](../../../TABLE_DESIGN.md), relative to this skill directory. Read only sections relevant to the task:

- New layout or broad review: **Design brief and layout patterns**, **Shot geometry**, **Component placement**, and **Agency, difficulty and reward**.
- Blocked shots or poor feeds: **Shot geometry**, **Clearance and passive returns**, and **Evaluation with the shot laboratory**.
- Stalls or unexpectedly endless play: **Clearance and passive returns**, **Agency, difficulty and reward**, and the findings table in **Evaluation with the shot laboratory**.
- A supplied real-machine reference or named style: **Working from real layouts** and **Sources and their limits**. Inspect the actual reference rather than inferring measurements from a designer's name.
- Requested ramp work: **Ramps and elevation** and **Shot geometry**. Distinguish a proposed future model from implemented mechanics.

Inspect `src/table.js`, relevant scenarios/tests, and current `STATUS.md` before changing a layout. Define the shot's origin, entrance, completion, successful return and near-miss behavior. Check full-ball clearance and moving flipper geometry; passive guides need exits for slow balls. Support intentional capture with a real release mechanism.

Use `runShot` and timing searches for specific reachability/return questions, varying plausible arrivals rather than relying on a single favorable setup. Preserve reproducible scenarios and failed trials. Report target hits, sampled timing intervals, drains/censoring and low-speed diagnostics separately. Saved reports contain old table definitions; rerun common inputs against the new definition for comparisons. Full three-ball behavior needs `Simulation`, not the single-shot runner.

For every important shot under review, test at least one plausible miss and one low-speed arrival. Check both for unintended traps, impossible clearance and indefinite passive cycles. Inspect suspicious outcomes; a time limit alone cannot prove an indefinite cycle. Record untested cases and uncertainty explicitly.

Use the **Standard layout-review report** in `TABLE_DESIGN.md`: Shot, Origin, Reachable, Return, Problem, with scenario evidence and negative-test findings below the table. Keep stable shot names across reviews and scenarios. Shared shot metadata in the table definition is future work; introduce it only when several meaningful implemented shots need it, rather than adding a schema during documentation or isolated tuning.

Iterate on the smallest relevant geometry before changing global actuator or material settings. Follow **Iteration and delivery** for checks and browser verification when implementing changes. Leave a short account of design intent, changed routes, evidence and unresolved playtesting questions. Never describe passing scenarios as proof of fun, fairness or realistic feel.
