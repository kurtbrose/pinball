# Targets and progress

Device facts are linked; selection, placement and validation guidance is our synthesis. Rules belong in Rules, with mechanics emitting tick-stamped events.

## Standup target bank

- **ID/category:** standup-bank / scoring.
- **Behavior/use:** stationary hit switches provide separately aimable objectives and visible completion.
- **Placement/tradeoff:** predictable rebound risk; separate target faces from decorative art.
- **Evidence:** [Basics](https://pinballmakers.com/wiki/index.php?title=Basics); [Godzilla](../machines/godzilla-2021.md) has powerline standups.
- **Status:** Extension: target fixtures/sensors, hit debounce and completion state; posts are not standups.
- **Probe:** glancing contacts, repeated hit, completion/reset and drainward rebound.

## Drop target bank

- **ID/category:** drop-bank / moving geometry.
- **Behavior/use:** hits remove targets from the ball plane; clearing a bank can expose a route or award progress.
- **Placement/tradeoff:** design both up/down states and timed resets; a reset must not trap a passing ball.
- **Evidence:** [Black Knight](../machines/black-knight-1980.md) uses timed banks; [Basics](https://pinballmakers.com/wiki/index.php?title=Basics) explains dropping.
- **Status:** Extension: fixture state, hit/reset events and bank Rules state.
- **Probe:** first/last target, reset while occupied, ball behind the bank and weak hits.

## Spinner shot

- **ID/category:** spinner-shot / scoring.
- **Behavior/use:** a ball-driven rotating target rewards a shot's momentum with multiple switch activations.
- **Placement/tradeoff:** put it on a useful route; counting contact frames would misrepresent revolutions.
- **Evidence:** [High Speed](../machines/high-speed-1986.md), Freeway spinners; [Basics](https://pinballmakers.com/wiki/index.php?title=Basics).
- **Status:** Extension: pivoted body or explicit spin state and revolution events.
- **Probe:** low/high speed traversal, reverse hit, simultaneous hits in future multiball and stable scoring per revolution.

## Rollover lanes and lane change

- **ID/category:** rollover-lanes / progress.
- **Behavior/use:** passage activates a lane switch; flipper-button lane change gives the player a choice during passive travel.
- **Placement/tradeoff:** separate ordinary rolling from button selection; don't make lane collection depend on display sampling.
- **Evidence:** [Theatre of Magic](../machines/theatre-of-magic-1995.md) describes top lanes and lane change.
- **Status:** Extension: per-tick passage sensing, lane bits and input-edge Rules behavior.
- **Probe:** swept crossing, rollback, held versus newly pressed buttons and bank completion.

## Captive ball

- **ID/category:** captive-ball / indirect target.
- **Behavior/use:** the live ball transfers momentum to a constrained ball which reaches a scoring contact.
- **Placement/tradeoff:** reward transmitted motion rather than mere enclosure contact; containment needs slow-ball exits for the live ball.
- **Evidence:** [Banzai Run](../machines/banzai-run-1988.md) documents captive balls.
- **Status:** Extension: additional physical ball and confinement, sensing; distinct from multiple free balls in play.
- **Probe:** weak transmission, hard rebounds, captive containment and live-ball release.

## Inlane-lit opposite shot

- **ID/category:** inlane-opposite-shot / rule pattern.
- **Behavior/use:** a return lane briefly qualifies a shot naturally reachable from its flipper, making the feed meaningful.
- **Placement/tradeoff:** the time window should include a plausible next action; uncontrolled arrivals can make the award arbitrary.
- **Evidence:** [High Speed](../machines/high-speed-1986.md), opposite Freeway lighting.
- **Status:** Extension: lane events and tick-based eligibility window; geometry may use existing primitives.
- **Probe:** return → aimed shot as a full sequence, missed follow-up, timer edge and ball change.

## Qualify then collect

- **ID/category:** qualify-collect / rule pattern.
- **Behavior/use:** progress at one device enables a distinct collect shot, encouraging travel between regions.
- **Placement/tradeoff:** make qualification visible and collectible; avoid rewarding inaccessible geometry.
- **Evidence:** [Black Knight](../machines/black-knight-1980.md), drop-bank qualification of Magna-Save; application to a simpler collect target is our adaptation.
- **Status:** Extension: small Rules state machine; device needs depend on the chosen qualification/collect pair.
- **Probe:** unqualified collect, final qualifying hit, expiration, reset and deterministic event ordering.

## Timed shot combo

- **ID/category:** timed-combo / rule pattern.
- **Behavior/use:** an ordered route sequence earns an extra award, giving returns a reason to support the next aim.
- **Placement/tradeoff:** geometry must offer the follow-up; a timer alone cannot create flow.
- **Evidence:** [FunHouse](../machines/funhouse-1990.md) describes ramp/Gangway/loop combinations.
- **Status:** Extension: identified shot events, ordered Rules state and tick deadline.
- **Probe:** complete sequence, wrong order, deadline boundary, miss and natural reset.
