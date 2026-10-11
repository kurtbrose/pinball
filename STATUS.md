# Project status

## Working

- First complete table: three-ball game, charged plunger, shooter lane, inlanes/outlanes, two powered flippers, rubber posts, three pop bumpers, two slingshots, tunable energetic center post, scoring and game over.
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

## Shooter exit correction

Full-strength launches could enter the playfield and then rebound through the open shooter mouth. Added a sloped one-way gate: upward launches pass, downward returns deflect left using native collision response. The launch regression now tracks 10 seconds after each of seven charge levels for both actuator models and rejects any shooter-return event, rather than accepting momentary playfield entry.
