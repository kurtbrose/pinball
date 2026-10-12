# Signature devices

These cards separate a reusable family from a famous implementation. Adaptation guidance is ours; consult the machine record before borrowing specific behavior. All require engine extensions.

## Rotating multi-face toy

- **ID/category:** rotating-toy / moving geometry.
- **Behavior/use:** a motorized centerpiece changes what can be hit or entered at a fixed aim.
- **Placement/tradeoff:** teach the active face; preserve clearance during movement.
- **Evidence:** [Theatre of Magic](../machines/theatre-of-magic-1995.md), trunk.
- **Status:** Extension: motor/index state, face-specific collision/capture and Rules synchronization.
- **Probe:** each face, mid-rotation arrival, rejected entrance and release failure.

## Ball dispenser

- **ID/category:** ball-dispenser / storage toy.
- **Behavior/use:** a themed physical device stores and delivers balls as part of a shot's reward.
- **Placement/tradeoff:** count balls separately from animation; successful entry cannot leave an untracked ball.
- **Evidence:** [Twilight Zone](../machines/twilight-zone-1993.md), gumball machine.
- **Status:** Extension: storage capacity, feed sequence and identity-preserving delivery.
- **Probe:** empty/full states, jammed feed, repeated command and accounting after drain/reset.

## Magnetic mini-playfield

- **ID/category:** magnetic-mini-field / alternate control.
- **Behavior/use:** player-operated magnets replace ordinary bats in a secondary play region.
- **Placement/tradeoff:** make entry, alternate controls and return obvious; avoid an unbounded hold.
- **Evidence:** [Twilight Zone](../machines/twilight-zone-1993.md), Battle the Power.
- **Status:** Extension: bounded force field, region state and control routing.
- **Probe:** field edge, weak arrival, timeout and exit; nonmagnetic-ball response where supported.

## Ball-property variant

- **ID/category:** ball-property-variant / ball identity.
- **Behavior/use:** a different mass/material changes control and device interactions.
- **Placement/tradeoff:** rules and appearance should explain the difference; do not globally retune every ball.
- **Evidence:** [Twilight Zone](../machines/twilight-zone-1993.md), nonmagnetic ceramic Powerball.
- **Status:** Extension: per-ball properties and identity across storage/release; permanent calibration remains separate.
- **Probe:** matched trajectories by ball type, magnet response and storage identity.

## Moving ramp or target facade

- **ID/category:** moving-route-toy / moving geometry.
- **Behavior/use:** a motorized device changes a familiar shot or exposes a new entrance.
- **Placement/tradeoff:** review each state as a route graph, including transition hazards.
- **Evidence:** [Godzilla](../machines/godzilla-2021.md), Premium/LE bridge and rotating bank.
- **Status:** Extension: moving fixtures, elevation, indexed states and collision-safe transitions.
- **Probe:** every route state, transition occupancy, weak shot and incorrect timing.

## Vertical secondary playfield

- **ID/category:** vertical-playfield / alternate region.
- **Behavior/use:** transfers the ball into a steep secondary play area with its own control and return.
- **Placement/tradeoff:** entry/re-entry and camera readability are essential; do not reuse the main incline unchanged.
- **Evidence:** [Banzai Run](../machines/banzai-run-1988.md), backglass Hill.
- **Status:** Extension: transfer mechanism, region-specific dynamics and rendering snapshot support.
- **Probe:** transfer miss, regional drain returning to main field, disabled controls and accounting throughout transit.
