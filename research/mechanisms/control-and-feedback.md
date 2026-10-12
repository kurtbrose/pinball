# Control and feedback

All **Use**, **Placement/tradeoff** and **Probe** fields below are our adaptation guidance, not sourced dimensions or claims about a reference machine's feel. **Evidence** identifies the observed device or interaction. Status is the repo capability boundary in the library index.

## Lower flipper pair

- **ID/category:** lower-flipper-pair / control.
- **Behavior/use:** player-controlled bats turn a descending feed into an aimed shot; define a control base before upper mechanisms.
- **Placement/tradeoff:** leave room for the complete moving sweep, ball passage and distinct center/outer loss routes. More protection can reduce danger but also remove meaningful loss.
- **Evidence:** [Theatre of Magic](../machines/theatre-of-magic-1995.md) describes an ordinary lower pair.
- **Status:** Available; physical actuation remains provisional.
- **Probe:** both-side catches, releases and redirections over several arrival speeds; held-flipper passive cycles.

## Protected inlane

- **ID/category:** protected-inlane / feed.
- **Behavior/use:** a separated lane brings a ball beside the sling toward a flipper heel.
- **Placement/tradeoff:** guide continuously into a playable control region; clearance alone does not show a catch opportunity. Overprotection can create pockets.
- **Evidence:** [Theatre of Magic](../machines/theatre-of-magic-1995.md) documents ramps ending at inlanes.
- **Status:** Available geometry; control depends on tuning.
- **Probe:** slow wall descent, late arrivals and released/held paddles; distinguish reaching the flipper from useful control.

## Paired slingshots

- **ID/category:** paired-slings / propulsion.
- **Behavior/use:** ball-triggered rubber kickers add energetic sideways motion near the lower field.
- **Placement/tradeoff:** frame the shot fan without blocking the raised flippers; kicks can create outlane danger.
- **Evidence:** [Pinball Makers Basics](https://pinballmakers.com/wiki/index.php?title=Basics), mechanism types.
- **Status:** Available; emits `sling.hit` with table points.
- **Probe:** grazing hits on both tips, fast approaches and rebound paths toward each outlane.

## Rubber post separator

- **ID/category:** post-separator / passive geometry.
- **Behavior/use:** a passive round obstacle separates adjacent routes and changes rebounds.
- **Placement/tradeoff:** use full-ball clearance; a narrow gap can wedge rather than offer a skillful choice.
- **Evidence:** [Pinball Makers Basics](https://pinballmakers.com/wiki/index.php?title=Basics) distinguishes passive rubber from active devices; exact separator arrangement here is our synthesis.
- **Status:** Available as `post`; current game also awards post-hit points.
- **Probe:** contacts on either side and low-speed arrival at the narrowest gap.

## Pop bumper nest

- **ID/category:** pop-nest / propulsion.
- **Behavior/use:** nearby ball contact triggers outward kicks; a cluster creates a contrasting activity region.
- **Placement/tradeoff:** provide an entry and eventual exit; don't let a nest obstruct every deliberate upper shot.
- **Evidence:** [Twilight Zone](../machines/twilight-zone-1993.md) has three pops; [Basics](https://pinballmakers.com/wiki/index.php?title=Basics) explains the device.
- **Status:** Available bumper primitives; arrangement is a geometry candidate.
- **Probe:** direct access, glancing entry, slow exit and exit-speed distribution; time limits remain censored.

## Manual plunge and skill shot

- **ID/category:** manual-plunge-skill-shot / launch.
- **Behavior/use:** player-selected launch strength chooses an initial destination rather than only starting motion.
- **Placement/tradeoff:** create a reachable reward window plus ordinary stronger/weaker outcomes; don't force every launch into immediate danger.
- **Evidence:** [FunHouse](../machines/funhouse-1990.md) describes a strength-dependent top-loop rollback skill shot.
- **Status:** Plunge Available; skill-shot sensing/reward Extension.
- **Probe:** launch-strength sweep, weak rollback, overshoot and shooter re-entry; preserve one-way exit behavior.

## Upper flipper feed

- **ID/category:** upper-flipper-feed / control.
- **Behavior/use:** a secondary paddle enables an aim unavailable from the lower pair.
- **Placement/tradeoff:** design its upstream feed and missed-shot descent together; a paddle without controllable arrivals adds clutter.
- **Evidence:** [High Speed](../machines/high-speed-1986.md) describes a kickout feeding the upper-right flipper.
- **Status:** Configurable flippers exist; extra-paddle layout/input behavior must be inspected and validated before calling it supported.
- **Probe:** release timing, late arrival, underpowered shot and safe transition to the lower field.

## Magna-Save

- **ID/category:** magna-save / player rescue.
- **Behavior/use:** earned player-controlled magnetic intervention can recover a threatened ball into a return lane.
- **Placement/tradeoff:** field and release must create a recoverable route; communicate availability and activation clearly.
- **Evidence:** [Black Knight](../machines/black-knight-1980.md).
- **Status:** Extension: bounded magnetic force, extra input, charge/duration Rules state and tick-stamped activation/release.
- **Probe:** early/late/missed activation and expiry; successful rescue must lead to control, not indefinite hold.

## Outlane kickback

- **ID/category:** outlane-kickback / rescue.
- **Behavior/use:** an enabled kicker reverses an outlane loss, usually after qualification.
- **Placement/tradeoff:** preserve a loss route while disabled; return velocity should not create automatic repeated saves.
- **Evidence:** [High Speed](../machines/high-speed-1986.md) describes relighting its kickback.
- **Status:** Extension: outlane sensing, enable state and directional impulse; existing bumper kicks are not a complete kickback.
- **Probe:** enabled/disabled entry, reset after use, weak rescue and re-entry into the outlane.
