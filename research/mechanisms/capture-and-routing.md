# Capture and routing

Use and probe fields are proposed engineering guidance. Capture needs intentional storage and release, not a geometry stall.

## Scoop or saucer with kickout

- **ID/category:** capture-kickout / capture.
- **Behavior/use:** an entrance holds a ball briefly, then ejects it toward a deliberate feed.
- **Placement/tradeoff:** a pause contrasts with traveling shots; poorly aimed ejection can punish success.
- **Evidence:** [Basics](https://pinballmakers.com/wiki/index.php?title=Basics) distinguishes scoops; [High Speed](../machines/high-speed-1986.md) documents an eject-hole feed.
- **Status:** Extension: capture occupancy, inactive ball state, timed release impulse and events.
- **Probe:** weak entry, rejected lip hit, capture timeout, occupied entry and downstream catch/redirection.

## Physical lock and staged release

- **ID/category:** physical-lock / storage.
- **Behavior/use:** holds an actual ball while another is served, then releases stored balls for multiball.
- **Placement/tradeoff:** define capacity, overflow and feed ordering; a virtual qualification counter is a different implementation.
- **Evidence:** [High Speed](../machines/high-speed-1986.md), side hideouts; [Black Knight](../machines/black-knight-1980.md), upper lock.
- **Status:** Extension: multiple ball identities, occupancy, trough/serve accounting and simultaneous-ball simulation.
- **Probe:** full lock, interrupted qualification, drain during staging, release spacing and replay. Single-shot runShot cannot verify multiball.

## State-dependent diverter

- **ID/category:** state-diverter / moving routing.
- **Behavior/use:** the same entrance leads to different destinations according to device/rule state.
- **Placement/tradeoff:** communicate the active route; transition timing and occupied switching are mechanical cases.
- **Evidence:** [FunHouse](../machines/funhouse-1990.md), center ramp to Steps versus inlane.
- **Status:** Extension: moving fixture or explicit routed state, transition timing and output events. Current gates are one-way, not commanded diverters.
- **Probe:** every destination, weak arrival, occupied transition and release after switching.

## Subway transport

- **ID/category:** subway / hidden routing.
- **Behavior/use:** carries a captured ball beneath the visible field to another exit.
- **Placement/tradeoff:** hidden travel can surprise or delay; retain ball identity and a reliable release destination.
- **Evidence:** [Basics](https://pinballmakers.com/wiki/index.php?title=Basics) describes scoop-to-subway routing; no machine-specific subway record is verified in this seed.
- **Status:** Extension: separate path/transport state, occupancy and deterministic exit.
- **Probe:** slow transit, occupied exit, multiple queued balls if supported and ball-search recovery.
