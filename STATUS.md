# Project status

## Working

- Milestone 1 implemented: steel ball, playfield walls and return guides, two powered flippers, drain detection, fresh-ball reset.
- Canvas presentation, keyboard controls, and pointer/touch flipper buttons.
- Fixed 120 Hz simulation independent of rendering; tick-stamped command replay.
- Type checking and six automated scenarios pass: replay, flipper travel, response time/overshoot, flipper contact energy transfer, fast wall rebound, drain/reset.
- Flipper tuning after initial feedback: motor torque 80 → 400 N·m, maximum upstroke speed 22 → 30 rad/s, separate 22 rad/s return speed, and proportional braking near travel stops. Both flippers reach within 0.04 radians of raised position in 100 ms in the unloaded scenario.

## Validation and limits

- Browser startup, rendered table, drain status, and reset interaction verified locally.
- Planck 1.5.0 is the provisional physics choice. Revolute motors reach their limits and transfer upward momentum in a focused test; a 35 m/s wall scenario rebounds without tunneling. This does not cover every geometry/contact combination.
- Human playtesting has not established that flippers feel convincing or shots are controllable.
- No interpolated rendering yet; narrow screens scroll to fit the table.
- No plunger, posts, bumpers, scoring, sounds, or three-ball rules. Those belong to later milestones.
- Cross-platform bit-for-bit determinism is not promised. No random mechanisms exist yet.

## Next priority

Playtest flipper timing, aiming, drain frequency, and return guides. Tune the small table before authorizing Milestone 2.
