# Designing Browser Pinball tables

This is the project's layout design reference. Load the relevant sections when designing, reviewing or tuning a playfield; ordinary deployment, UI and scoring edits do not need the whole guide. The repo-local entrypoint is [design-table-layout](.agents/skills/design-table-layout/SKILL.md).

The source summaries below are paraphrases. The workflow, calculations, diagnostic examples and evaluation contract are our engineering synthesis for this simulator, not specifications from those authors. Principles are heuristics: a deliberate exception needs an intended behavior and evidence, not automatic rejection.

## Contents

- [Design brief and layout patterns](#design-brief-and-layout-patterns)
- [Shot geometry](#shot-geometry)
- [Shot identity](#shot-identity)
- [Clearance and passive returns](#clearance-and-passive-returns)
- [Component placement](#component-placement)
- [Operational route review](#operational-route-review)
- [Agency, difficulty and reward](#agency-difficulty-and-reward)
- [Working from real layouts](#working-from-real-layouts)
- [Evaluation with the shot laboratory](#evaluation-with-the-shot-laboratory)
- [Ramps and elevation](#ramps-and-elevation)
- [Iteration and delivery](#iteration-and-delivery)
- [Sources and their limits](#sources-and-their-limits)

## Design brief and layout patterns

State what a player should do: which shots they can aim at, what returns enable another shot, and where danger enters. Begin with the lower playfield and a few purposeful routes, then add mechanisms that serve those routes. An attractive distribution of objects is not a shot map.

For the ordinary two-flipper demo, choose the established lower-playfield arrangement before numerical tuning: inward-active triangular slings above paired flippers, protected inlanes leading to their outer heels, and separate outlanes beyond the lane dividers. Center that assembly in the playable width, excluding the shooter channel. The supplied Star Trek photo and Pinball Star screenshot show this shared structure; they do not supply calibrated dimensions for our arcade units. Make departures explicit. Simulation should challenge a chosen reference arrangement, rather than inventing disconnected guides because a few probes pass.

Distinguish active sling rubber from passive lane borders. The demo's `activeNormal` defines the inward trigger face; outside/underneath contacts are passive and do not score or kick. Render the active face consistently. Full-ball clearance, moving flipper clearance, and incoming/outgoing routes still require validation after adapting proportions.

Pinball Makers distinguishes **flow**, where returns support ongoing shot sequences, from **stop-and-go**, where capture and redirection interrupt the sequence. It uses Attack From Mars and Twilight Zone as examples. Neither style requires every shot to behave alike. [Source: Pinball Makers](https://pinballmakers.com/wiki/index.php/Design)

For this project, use these patterns as design options rather than templates to stamp out:

| Pattern | Intended experience | Questions before adding it |
| --- | --- | --- |
| Fan of entrances | Several distinguishable aims from the lower flippers | Can adjacent shots be selected independently? Does one obstruction block several routes? |
| Orbit or loop | A traveling shot that returns for another attempt | What are the exit direction and speed? Can either flipper control that feed? |
| Capture and release | Pause, aim, then receive a deliberate feed | Is capture implemented? When and how does the ball leave? |
| Open single-level table | Fewer mechanisms, more attention to aiming and rebounds | Are there meaningful choices beyond repeatedly hitting the same bumper? |
| Elevated return | A route crosses another route and feeds a chosen lane | Does the simulator support height and correct collision separation? |

Specify mechanics directly when requesting a style. For example: “fast outer return, two distinct center aims, and an opposite-flipper feed” is more actionable than “make it like designer X.” Kineticist describes recurring designer tendencies but explicitly cautions that designers do not always follow them. [Source: Kineticist](https://www.kineticist.com/news/a-beginners-guide-to-pinball-designers)

## Shot geometry

The VP Workshop guide starts with the intended shot and the flipper region that can send a ball toward it, then aligns the entrance and channel with that approach. This is a useful geometric starting point; it is not a prediction of our simulated contact dynamics. [Source: Designing Good Shots](https://www.vpforums.org/index.php?app=tutorials&article=150)

Keep a small shot specification in the layout discussion or scenario notes:

| Field | What to record |
| --- | --- |
| Purpose | Player goal and why this route belongs on the table |
| Origin | Flipper, arrival family, approximate contact region |
| Entrance | Position, direction and usable clearance |
| Completion | Mechanism event or a precisely placed target region |
| Success return | Destination lane/flipper, direction and expected speed range |
| Miss | Near misses, rebounds and any rollback path |
| Evidence | Scenario file, table revision, timing results and browser observations |

Draw an approach corridor, not just a centerline. Reserve room for the ball on both sides, align the first channel segment, and check neighboring posts. A shot entrance facing across the expected approach can be effectively narrower than it looks.

Use a geometric ray to identify candidate placements, then simulate contact. Launch direction depends on arrival velocity, where the ball meets the rubber, flipper angle and angular velocity, restitution and actuator state. A line drawn from the pivot does not capture those factors. Do not repair an inaccessible entrance by globally increasing motor strength before checking alignment and clearance.

For a channel, a rectangle target should sit far enough inside the entrance to distinguish entering from brushing its mouth. Our rectangle detector follows the swept **ball center**; it does not establish whole-ball clearance or successful travel through the entire channel. Mechanism targets require a hit event. Choose the target that corresponds to the intended outcome and inspect the subsequent return separately.

## Shot identity

Use stable names for intended shots in design notes, scenario names and review reports so successes and failures can accumulate into comparable examples. A shot describes a route and player intention; it is not necessarily identical to a mechanism hit. Keep its entrance, completion condition and return destination distinct.

When several meaningful implemented shots need common references across simulation, the laboratory, Rules and rendering, consider lightweight shot metadata in the table definition. The following is conceptual only; it is not the current schema or an instruction to implement it now:

```js
shots: [{
  id: 'left-orbit',
  origin: 'right-flipper',
  entrance: 'left-orbit-entry',
  completion: 'left-orbit-exit',
  return: 'left-inlane',
}]
```

Choose the eventual shape from actual consumers and routes, including shots with multiple origins. Metadata alone does not implement completion detection, scoring, or a return path. Until shared identity solves a concrete need, keep names in documentation and scenarios; do not introduce a registry, resolver or event framework for hypothetical shots.

## Clearance and passive returns

Mission Pinball recommends using real geometry and testing approaches, exits and potential traps. It also notes that a lane's physical width overstates its available aiming width because the ball occupies space. [Source: Planning Layout with CAD](https://missionpinball.org/dev/physical_building/planning_layout_with_cad/)

Use the current table definition for every calculation. `firstTable` uses deliberate arcade units; the permanent calibration `table` is a different fixture. Do not mix their radii or treat the playable scale as calibrated real-machine metres.

For a straight opening of width `W` and ball radius `r`, the ideal center-path width is `W - 2r`. A zero result means exact tangency, not useful clearance. Allow margin for joins, oblique approaches and collision tolerances.

Two useful local calculations are:

- Between round posts: center spacing minus both post radii minus `2r`.
- Between a round post and straight wall: perpendicular post-center distance to the wall minus the post radius minus `2r`.

For example, an opening of `0.32` cannot pass a ball of diameter `0.36`, even if the drawing looks open. An opening of `0.42` leaves only `0.06` for the center path. These are illustrative arithmetic, not recommended universal lane widths.

For arbitrary geometry, reason about expanding obstacles by the ball radius and tracing a point through the remaining space. Turns, edge endpoints and moving parts can make a nominally wide opening unusable. Include the flipper's fixture thickness and rounded ends when checking its full swept area.

Pinball Makers calls out hangups where geometry prevents a ball from rolling away, including poorly angled guides and returns behind posts. [Source: Pinball Makers](https://pinballmakers.com/wiki/index.php/Design)

In our flat model, gravity points toward increasing `y`. Passive return guides should normally lead toward increasing `y` with an exit. Check each junction for a local pocket: can a nearly stationary ball continue without a kick or player action? The monotonic rule applies to passive returns, not powered uphill shots, orbit crowns or intentional capture mechanisms.

Test corners from several nearby positions with small downward and lateral velocities. A fast trajectory can jump over a trap that catches a slow ball. Distinguish an intentional flipper cradle from a stationary ball against an inaccessible guide. An intentional capture feature needs implemented release behavior; a future kicker is not a release mechanism today.

### Lessons from this prototype

The drainability pass removed a powered center-save post, replaced uphill lower inlane guides, and widened clearance beside the right lane post. These are examples of failures to avoid, not proof that the revised layout is finished. Natural-drain tests cover selected launches only.

An earlier shot-lab observation also found incomplete left-flipper travel near a slingshot. Recheck the current geometry before assuming that diagnosis still applies. A calibration fixture can pass while a table mechanism physically blocks the same actuator.

## Component placement

### Operational route review

Review the chain **entry → interaction → exit → next control opportunity → miss/loss route**. Maintain a route map for launch/gate, both wall descents, bumper exits, sling rebounds, both inlanes, outlane branch points, flipper aims and their actual returns, and center misses. Omit unimplemented routes explicitly. For a narrow change, include affected routes and their upstream/downstream neighbors; for broad refinement, give every ordinary route a finding.

Turn applicable guidance into evidence obligations:

| Intent | Failure example | Probe/evidence | Misleading substitute |
| --- | --- | --- | --- |
| Accessible shot | Local launch reaches a target but ordinary feed cannot | Plausible feed plus timing/aim variants and observed completion | One favorable hit |
| Passive return | Wall descent never enters the protected feed | Start upstream; trace branch, exit and paddle response | Starting inside the inlane |
| Clearance and sweep | Fast ball passes but slow ball pinches; paddle stalls | Full-ball clearance, slow junction tests, moving/held mechanism states | Visible opening |
| Player control | Paddle is touched but ball cannot be redirected | Observed catch/release or input-dependent redirection | Contact or return-line crossing |
| Chaos with escape | Bumper/sling loop or corner monopolizes the ball | Actual hit then downstream trajectory, weak arrival and miss | Target activation alone |
| Distinct loss route | Routine feed falls into an unmarked loss corridor | Branch-point arrivals and deliberate misses; compare intended feed/loss | Eventual natural drain |
| Legible mechanics | Artwork suggests a different corridor | Browser inspect collision-aligned presentation and interactions | Headless pass |
| Appropriate difficulty | Only exact timing saves routine returns | Sampled windows plus human playtesting | Survival or a quality score |

Use **supported in tested cases**, **problem found**, or **untested** for each obligation, with scenario identities and limits. Split mixed findings rather than treating a row as globally passed. Existing checks count only for the behavior and starting states they actually cover. Include sampled failures and no-input baselines, release intentional catches, and keep nudges separate from ordinary-feed control. Reconstruct complete routes from fresh worlds; do not transplant convenient downstream states as evidence of upstream success.

Completion of a broad mechanical review requires evidence for each applicable mechanical obligation or an explicit unresolved finding with a next probe. Report the scope as partial when important routes remain untested. Human fairness and feel remain outstanding until human feedback; an automated review never establishes them. `node scripts/route-review.js` provides reproducible demo-board route families and matched table comparisons, not a universal certification.

`runRoute(spec, stages)` in `src/route-lab.js` checks ordered rectangular passages and simulation events at every tick, independently of displayed trajectory sampling. For example, require inlane passage then paddle contact; to test a subsequent redirection, require paddle contact then an upper return region. An early upper-region crossing cannot satisfy a return stage before the contact. Keep a no-input baseline: passive rebounds must not be credited as input-dependent control. `complete` refers only to the declared stages, not overall layout quality. Passive collectors use explicit contact restitution in `table.guides`; normal Planck maximum restitution mixing would otherwise preserve the ball's bounce even on a low-restitution guide.

Treat this section as project-specific review guidance, not a mandated real-machine arrangement.

| Component | Design responsibility | Useful probe |
| --- | --- | --- |
| Flippers and lower guides | Accessible return, controllable contact and an open drain route | Slow inlane feed; rest, stroke and held positions; center miss |
| Slingshots | Lateral variation without blocking actuator travel or lane exits | Full flipper sweep; low-speed approaches; direction after contact |
| Bumper group | A purposeful chaotic region with entry and escape routes | Multiple entry angles; repeated contact locations; exit speeds |
| Posts | Define boundaries and rebounds without pinching lanes | Whole-ball clearance; slow arrivals around each junction |
| Shooter lane and gate | Launch enters play, then return follows the intended route | Charge range; gate passage both ways; shooter-return events |
| Inlanes and outlanes | Distinct feed and loss routes | Low-speed passage; branch points; controllability of the feed |
| Future target or capture | Meaningful aim, rebound or deliberate release | Target hit, near miss and the resulting return |

Keep collision geometry legible in the renderer. If artwork suggests an opening or obstacle that physics disagrees with, fix that mismatch. Do not use cosmetic ramps or rails to imply functioning routes.

## Agency, difficulty and reward

Players should be able to learn a relationship between their action and the outcome. Review which arrivals permit an aimed shot, catch, hold or redirection, and which intentionally add chaos. Do not claim a specific real-pinball technique works until observed in this simulator.

Consider risk at three stages: approaching the entrance, missing it, and receiving its return. A narrow entrance with a controlled return differs from a wide target that rebounds toward the drain. Match the table's reward to its intended challenge; avoid changing points to hide broken geometry.

Drain fairness needs human feedback. A drain after an uncontrolled miss may be appropriate; a routine successful feed that repeatedly bypasses all controllable regions may need redesign. Conversely, automatic saves, repeated powered kicks or passive cycles can make aiming irrelevant. Long survival is neither an automatic success nor an automatic defect.

Compare released-flipper and continuously-held behavior as diagnostics. Both should be checked for geometry traps and unintended indefinite play. Do not require every initial state to drain within a fixed deadline: some deliberate cradles or trajectories legitimately survive. Keep any regression deadline specific to its scenario and intended behavior.

### Lower-playfield control review

Directional arcade nudges are available in shot commands as `nudge:{x,y}` (magnitude at most 1; +x right, +y down). They apply a table-configured relative ball velocity jolt on a rising input edge, with a cooldown; release before another attempt. `searchNudges` in `src/shot-lab.js` compares a no-nudge baseline with direction, strength and delay variants, optionally holding flippers. `node scripts/nudge-review.js results/nudge-review.json` runs matched lower-feed families and retains complete reports. Inspect contacts and responses; longer survival alone does not prove control. Prototype calibration disables nudges.

For broad refinement, punishing-drain feedback, or changes to lower guides and returns, explicitly review both sides of the flipper area. Drainability is a separate requirement: removing a pocket must not silently turn an ordinary inlane feed into a loss route.

Identify each protected inlane path, its transition onto the flipper, and the separate outlane loss path. Inspect protection beside each outer flipper end/pivot: can a normal feed slip behind or outside the paddle without a playable contact? Lower guides should deliver balls into the flipper's usable contact region with full-ball clearance through its sweep. A safe feed means an opportunity for control, not guaranteed survival or a stationary pocket. Validate deliberate exceptions against the intended difficulty and player feedback.

Probe plausible arrivals along each inlane and beside each outer flipper end, including slow feeds and nearby lateral misses. Vary arrival position, downward/lateral speed, and released, moving and held flipper states; search activation timing where relevant. Trace actual successful-shot returns into this area too, rather than using only convenient synthetic starts. Compare the same scenario families before and after a change.

Record whether each arrival offers a catch, hold or redirection opportunity, bypasses the usable paddle region, drains, or becomes trapped. Support control claims with observed contact and subsequent response to inputs; crossing a return line or merely touching a flipper is insufficient. Keep these outcomes and sampled timing intervals separate from survival statistics. No universal safe-area size or acceptable success percentage is implied; describe the tested range and leave untested arrivals explicit.

In browser play, check ordinary returns on both sides and whether the player can recognize and use the control opportunity. Headless scenarios establish behavior for supplied arrivals and inputs, not human reaction difficulty or fair feel. If browser play or human feedback remains outstanding, state that limitation instead of treating passing mechanical checks as completion of the control review.

## Working from real layouts

Prefer overhead diagrams or photographs where the flippers and guides can be identified. Mission Pinball discusses aligning reference imagery to the proposed layout before borrowing a shot. [Source: Planning Layout with CAD](https://missionpinball.org/dev/physical_building/planning_layout_with_cad/)

For each reference actually used, record the machine, source URL, image orientation, scale assumptions and these annotations:

- Major shot entrances and which flipper can plausibly approach each.
- Success returns, missed-shot routes and intentional capture/release devices.
- Lower guides, lane separations, drains and elevated crossings.
- The specific lesson being borrowed and what our simulator cannot reproduce.

A perspective photo can suggest structure but should not supply precise dimensions without rectification or a known scale. Inspect physical boundaries separately from inserts, decorations and plastics. An elevated crossing in a photo cannot be copied as two intersecting walls in the same collision plane.

Use IPDB as a lookup starting point for machine records and reference material. Its homepage could not be retrieved during this guide's preparation; no machine-specific measurements were extracted from it. [IPDB](https://www.ipdb.org/)

Start with [PINBALL_MECHANISMS.md](PINBALL_MECHANISMS.md) and its source-linked machine records when choosing reusable devices or route patterns. The seed is descriptive, not measured geometry; inspect the original reference before adapting a specific layout. Fan, orbit-focused, capture-focused, simple single-level and multilevel designs provide useful variety. For any example, separate a source-supported observation from our proposed adaptation.

## Evaluation with the shot laboratory

The existing laboratory evaluates reproducible individual shots. It does not currently generate layouts, optimize them, implement an automated player or provide a table-wide quality validator.

Routine `node scripts/check.js` now also runs `scripts/evaluate-layout.js` (standalone: `pnpm run evaluate:layout`). Its fixed profile in `scenarios/default-layout-evaluation.json` declares playable bounds and ordinary wall-feed contracts. It generates a lattice plus geometry-derived edge/corner arrivals, three small lateral velocities, upstream wall variations and bumper timing trials. Invalid/overlapping/outside starts are screened; the shooter-ready region is explicitly excluded and tested through game scenarios. No randomness or optimization is involved.

Required straight wall feeds, blocked declared approaches, unreachable sampled bumper aims, escapes and persistent low-speed states after bounded multi-direction recovery probes fail normal checks and Pages publishing. Angled feed/control gaps, moving timeouts, input-responsive low-speed states and successful shots without later paddle contact remain diagnostics. These categories are declared contracts and heuristic findings, not universal fairness thresholds. A warning is unresolved evidence, not an automatic pass on feel. Full configurations and counterexample trajectories are saved to `results/layout-evaluation.json` and CI artifacts; replay with the saved `config`. Preserve a demonstrated failure as a tracked regression before changing its contract.

### Establish a baseline

Inspect `src/table.js`, `src/shot-presets.js` and current `STATUS.md`. Record the table revision and actuator model. Run relevant baseline scenarios before changing geometry. A saved report embeds its table definition; replaying it later evaluates the saved layout, not automatically the latest layout. To compare revisions, rerun the same initial states and inputs with the new definition.

Current CLI examples:

```sh
node scripts/shot-lab.js --help
node scripts/shot-lab.js --preset left --out results/left-baseline.json
node scripts/shot-lab.js --preset right --search right --out results/right-timings.json
node scripts/shot-lab.js --preset shooter --out results/shooter-baseline.json
```

The browser laboratory is `shot-lab.html` relative to the site root, including under the Pages `/pinball/` prefix. `results/` is ignored by Git; preserve a useful regression in `scenarios/` or `test/`, not only in an ignored report.

### Define an arrival family

Use several plausible ball positions and speeds, both sides, and relevant resting/midstroke/held flipper states. Keep changing inputs separate from changing geometry. The starting state should correspond to a possible feed, not an arbitrary favorable placement inside an obstacle.

For every important shot under review, test at least one plausible miss and one low-speed arrival. Examples include an off-center entrance approach, a weak shot that rebounds before completion, or a slow feed at a guide/post junction. Check both negative cases for unintended capture, impossible clearance and passive cycles that sustain play without control. Record initial states, commands, observation limits and outcomes. Inspect slow or repeated motion and extend a targeted observation when needed; timeout alone does not prove an indefinite cycle. Do not label an untested case safe.

An illustrative single-shot scenario using the current CLI's default table:

```json
{
  "name": "Left approach to center bumper",
  "initial": {"x": 2.5, "y": 8.1, "vx": -0.4, "vy": 2},
  "ticks": 360,
  "sampleEvery": 3,
  "commands": [
    {"tick": 8, "input": {"left": true}},
    {"tick": 32, "input": {}}
  ],
  "target": {"mechanismId": "pop-center"},
  "actuation": "servo"
}
```

This is an example of input structure, not a claim about current success. The CLI supplies `firstTable` when a JSON scenario omits `table`; the JavaScript `runShot(spec)` API requires the full definition. Shot commands are tick-stamped full left/right snapshots, not plunger commands. Warmup advances actuator state with the ball inactive and is excluded from observed shot time. Full launch and three-ball lifecycle tests use `Simulation`, since `runShot` disables game respawn and ends at the first drain.

### Measure timing windows

The CLI/browser timing sweep currently tries delays `0..48` in steps of `2`, holding for `24` ticks. Search replaces the supplied scenario commands. Use `searchTimings` directly when a different range, spacing or hold duration is needed; its base scenario must have empty commands.

Sort successful delays into contiguous runs at the tested spacing. Report each interval, the number of successful samples and the spacing. At 120 Hz, one tick is about `8.33 ms`; a two-tick sampling interval is about `16.67 ms`. The elapsed span from the first to last successful sample is not proof that every intermediate time succeeds. Refine near boundaries when the distinction matters.

For example, sampled successes at ticks `8, 10, 12, 24` form a three-sample interval `[8,12]` and an isolated success at `24`, not one window `[8,24]`. This is illustrative, not a measurement. Do not equate an isolated hit with forgiving access, or choose a universal acceptable width without player feedback.

### Keep findings separate

| Observation | Supported conclusion | What it does not establish |
| --- | --- | --- |
| Target reached | Reachable from this setup and inputs | Generally accessible, complete route or good feel |
| Successful timing interval | Several tested activation delays work | All arrivals or unsampled delays work |
| Drain | Observed loss time and position | Overall drain fairness |
| Timeout / censored | Survived the observation limit | Infinite survival, a trap or measured eventual lifetime |
| Extended low speed | Candidate hangup worth inspecting | Accidental cup rather than a valid catch |
| Concentrated heatmap/hits | Frequent occupancy or contacts | An enjoyable or balanced region |
| Return crossing | Downward passage across a diagnostic line | A controllable feed or catch |
| Controllable feed in sampled trials | Observed catch, hold or redirection with stated arrivals and inputs | Forgiving timing, all returns or human usability |
| Escape | Ball left modeled bounds | A normal drain |

Heatmaps and metrics already use every physics tick, independently of trajectory downsampling. Keep this invariant. Review events and trajectories to locate the cause, then change the smallest relevant geometry. Save both failed and successful timing trials.

### Standard layout-review report

Use this compact format for layout reviews and before/after comparisons. State the table revision, actuator model and scenario family above the table. Keep shot names stable. Scope a narrow review to the affected shots; identify important omitted shots as untested.

| Shot | Origin | Reachable | Return | Problem |
| --- | --- | --- | --- | --- |
| Left orbit | Right flipper | Yes, 4/25 sampled trials | Left inlane observed | Narrow sampled timing interval |
| Center target | Either; list each tested side | Yes in tested setups | Chaotic rebound observed | None observed in tested cases |
| Right ramp | Left flipper | Not reached, 0/25 sampled trials | Untested | Entrance obstruction confirmed by inspection |

All rows above are illustrative, not measurements or implemented features of this table. In a real report, distinguish **not reached in tested trials** from proven geometric blockage, **untested** from failure, and intended returns from observed returns. Report each origin separately when results differ. "None observed" is limited to the stated evidence, not a blanket claim.

Below the table, include:

- **Evidence:** scenario/report paths, initial states or family identifiers, target/completion definitions, successful sampled timing intervals and spacing, observation limits and censoring. Tie each result to its shot and origin; compare the same inputs between revisions.
- **Negative tests:** the plausible miss and low-speed arrival for each important shot, observed return/drain or candidate trap/cycle, and any unresolved diagnosis.
- **Lower-playfield control (when applicable):** left and right protected feeds, outer-end bypasses and distinct loss routes; arrival/state coverage, observed control responses, browser findings and unresolved human feedback. Include these as return rows even when they are not scoring shots.
- **Decision:** the smallest proposed or applied change, its measured effect, and outstanding human playtesting questions.

Keep raw successes and failures as concrete examples of this runtime. Preserve useful scenarios and regressions in tracked files; ignored `results/` reports alone are not a durable design history. Avoid collapsing the report into an overall quality score.

## Ramps and elevation

Ramps remain future mechanics. The current Planck world is a flat collision plane and Canvas consumes its snapshots. Rendering a ramp in perspective does not implement elevation, rollback or an overpass.

When a ramp is actually requested, first specify its shot contract: entrance corridor, permitted approach, climb and loss of speed, insufficient-speed rollback, guided travel, return destination and transitions to/from the playfield. Decide how raised travel avoids collisions with objects below it and whether airborne behavior is needed. Preserve headless execution and same-runtime replay.

A constrained path with a height profile is one possible incremental model; full free-flight 3D is a different scope. Neither is selected by this document. Check energy and return behavior rather than forcing every entrance hit to complete the ramp. Cosmetic presentation must follow whichever mechanics are implemented.

## Iteration and delivery

For a layout change, leave a concise record of the intended shot/return, reference used, geometry changed, baseline comparison and remaining uncertainty. Keep table tuning in `src/table.js`; preserve calibration and both actuator options. Add regression cases for demonstrated failures, not tests that merely confirm the edited coordinates.

Run `node scripts/check.js` for implementation changes. Verify relevant browser interactions and update `STATUS.md` for substantial changes. A documentation-only update does not require replaying the game suite. Human playtesting remains necessary for aiming, feedback, fairness and feel.

A proposal should clearly distinguish implemented routes, demonstrated behavior, and future mechanics. Do not imply permission to add modes, editors, optimization systems or a new renderer simply because a reference machine has them.

## Sources and their limits

Reviewed on 2026-10-11. These are design resources, not a physics specification for this runtime. Retain links and summarize in original words; consult the original when detailed construction or attribution matters.

| Resource | Contribution | Limit |
| --- | --- | --- |
| [VP Workshop: Designing Good Shots](https://www.vpforums.org/index.php?app=tutorials&article=150) | Relate flipper contact location to entrance/channel alignment | Geometric construction does not replace dynamic simulation |
| [Mission Pinball: Planning Layout with CAD](https://missionpinball.org/dev/physical_building/planning_layout_with_cad/) | Reference overlays, ball-size clearance, approach/exit inspection | Borrowed geometry still needs validation with our scale and physics |
| [Pinball Makers: Design](https://pinballmakers.com/wiki/index.php/Design) | Layout styles and gravity-driven hangup concerns | Broad design guidance, not quantitative acceptance thresholds |
| [Kineticist: Beginner's Guide to Pinball Designers](https://www.kineticist.com/news/a-beginners-guide-to-pinball-designers) | Vocabulary for different designers' recurring approaches | Secondary overview; tendencies are not fixed rules or recipes |
| [Internet Pinball Database](https://www.ipdb.org/) | Starting point for real-machine reference discovery | Homepage unavailable during preparation; no specific layouts verified here |
