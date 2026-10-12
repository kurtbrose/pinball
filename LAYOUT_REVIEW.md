# Complete example-table refinement

2026-10-11. Review covers the lower playfield, all three bumpers, the shooter,
outer loss routes, and natural three-ball play. The before definition is saved
in `scenarios/layout-before-full.json` (the table after the first sling-tip fix).
The after definition is current `firstTable`. No external machine reference was
used. Calibration, mechanics, motors, materials and scores remain unchanged.

Design intent: both flippers can aim into the bumper group; inlanes feed playable
flipper regions; misses can drain; raised catches can be released. Corrections:

- Shortened and raised the slings so their lower edges clear flipper motion and
  feed exits. Pulled the right inner tip out of the center-shot approach.
- Ended downhill guides above the heels, instead of joining the pivots and
  creating inaccessible pockets. The left bend now sits below the sling to
  avoid bouncing routine feeds straight into its powered face.
- Widened straight inlanes: ideal ball-center widths are 0.39 left / 0.24 right,
  versus 0.14 / 0.04 before. Right lane-post/shooter clearance is 0.11 versus 0.06.
  Ball diameter is 0.36. Rounded joins and moving contacts still need probes.

The following timing counts use servo, vy=2, 25 delays per shot. Completion is
an event on the named bumper, including later rebounds; a hit is not necessarily
a direct shot. The entrance is the open approach from the lower flippers.
Desired success returns cross back into a flipper contact region; observed
crossings alone do not demonstrate a controlled catch.

| Shot | Origin | Reachable (before -> after) | Return | Problem |
| --- | --- | --- | --- | --- |
| Center bumper aim | Left flipper | 23/25 -> 21/25 | Nominal after shot crossed y=7.2 at x=2.824, then drained at 7.192 s | Timing-dependent access; controlled feed not established |
| Center bumper aim | Right flipper | 14/25 -> 20/25 | Nominal after shot crossed at x=2.759 and later x=4.692, drained at 4.758 s | Some successful shots still return toward an outlane |
| Left bumper aim | Left / right flipper | 8/25 -> 10/25; 13/25 -> 10/25 | Multiple rebound routes retained in reports | No persistent trap found; access tradeoffs remain |
| Right bumper aim | Left / right flipper | 12/25 -> 9/25; 5/25 -> 9/25 | Multiple rebound routes retained in reports | Access varies by speed and timing |
| Left inlane feed | x=1.15, y=6.6, vy=0.1 | Contacts the lower flippers | Released: drains at 5.408 s; held then released: 11.808 s | Old held heel pocket resolved in this probe |
| Right inlane feed | x=4.25, y=6.6, vy=0.1 | Contacts the lower flippers | Released: drains at 2.992 s; held: 2.858 s | Old right lane has no common full-ball starting corridor here; no invalid baseline comparison |
| Shooter exit | Seven charge levels; both actuators | All tested launches enter play | One-way gate keeps sampled returns out of shooter | No issue reproduced in launch/gate regressions |

## Evidence and observations

Run `node scripts/layout-review.js` and `node scripts/layout-audit.js`. Tracked
inputs are in `scenarios/layout-refinement.json`; the audit uses a fixed grid
with overlap checks against both definitions, including initial flipper states.
All successes and failures, table definitions, tick inputs, metrics and sampled
paths are preserved in ignored `results/layout-refinement.json` and
`results/broad-trials.json`. Compact summaries are `results/layout-summary.json`
and `results/broad-audit.json`. Heatmaps/metrics continue to use every tick.

Timing families start at (2.5,8.1) / (3.5,8.1), vx=-0.4 / +0.4, and vy=1/2/3.
Delays are 0..48 in steps of 2 ticks, held 24 ticks, observed for 360 ticks (3 s).
All three bumpers were reached from both sides at all three sampled speeds.
For center aim, counts at vy=1/2/3 are left 24/21/17 and right 20/20/13.
At vy=2, successful center delays form these sampled intervals:

- Left: [0,28], [34,36], [42,48].
- Right: [0,36], {40}.

Intervals contain tested delays only; unsampled ticks are unknown. The complete
lists for other speeds and targets are in the summary. At vy=2, left trials had
7 drains / 18 censored at 3 s; right had 4 / 21. These are the same trajectories
re-evaluated for three targets, not three independent survival populations.
Longest slow runs were 0.133 s left / 0.117 s right in these sweeps.

The broad audit runs matched low-speed starts across the playfield, both
actuators and released/raised initial flipper states. Velocity is (0.03,0.1).
It releases held inputs at 10 s, retries both flippers at 11 s for 24 ticks, then
observes without input. Of 686 trials per definition, before had 668 drains and
18 censored at 30 s. Extensions to 100 s found nine stationary heel-pocket
cases despite release and retry. After had 686 drains, no censoring at 30 s,
no observed escape and no persistent candidate trap. This establishes behavior
for these starts and inputs, not universal drainability or infinite-life claims.

## Negative cases and release behavior

Off-center center-aim arrivals (x=2.9 / 3.1, y=8.1, vx=-0.4 / +0.4, vy=2;
press at tick 8, release at 32) both miss and drain in 7.717 / 3.142 s.
Slow center arrivals (vy=0.1, vx=-0.05 / +0.05) both hit and drain in
3.500 / 6.008 s, without a long low-speed run.

Each outer bumper and the center has tracked weak and off-center approaches.
Weak approaches start 0.8 below the bumper with vy=-0.2; misses offset x by
0.7 and travel outward with vy=-2. These may reach a target later through a
rebound. After results: left weak/miss drain in 2.400 / 4.050 s, neither hits;
center weak/miss in 1.492 / 9.717 s, only the miss later hits; right weak/miss
in 5.775 / 1.992 s, only the weak trial later hits. No sustained low-speed
period or escape was found in these probes.

The 96-case lane regression varies eight lateral positions, three speeds,
both actuators and held/released state. All sampled feeds drain within 30 s
when a held input releases at 5 s. The former left held-heel scenario, including
release at 10 s and retry at 11 s, now drains at 14.417 s rather than remaining
stationary at the 60 s limit.

A ball can rest on the bare pivot rubber or in a raised-flipper catch; these
are responsive catches, not inaccessible guide pockets. A tracked bare-heel
probe can be played out with a stroke. Quick full-game launches can settle
against a held left flipper; releasing ejects the tested catches. The natural
three-ball regression therefore permits a held catch and requires a natural
loss after release. No drain timer, teleport, extra kick or automatic save was
added. Guide exits clear moving flipper bodies; a raised flipper can close the
ball's feed temporarily, so whole-ball passage in every held state is not claimed.

## Delivery and limits

Type checking and the headless scenarios include full flipper stroke/hold/release,
all-bumper access, lane feeds, natural three-ball play, replay and shooter gate
checks. An isolated Edge browser verified both actuator pages, full rendering,
keyboard flippers and launch, pointer plunge, score and ball advance, restart,
shot-worker execution, timing selection and scrubbing. Browser center timing
results match Node: 21/25 left and 20/25 right. No runtime, worker or resource
errors were observed. Screenshots are saved in `results/` and were inspected.

The obvious reproducible geometry faults found in this pass are resolved.
The upper bumper arrangement, posts and shooter gate needed no geometry change.
Timing tradeoffs and chaotic outlane rebounds remain; passing tests does not
establish aiming feel, fun or fairness. Human playtesting should evaluate the
new feeds and releases, narrower right sling, and loss frequency.
