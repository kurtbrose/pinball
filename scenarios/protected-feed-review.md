# Protected lower feeds

Revision: `layout-before-protected-feeds.json` versus current `firstTable`; servo actuator, 120 Hz. Reproduce with `node scripts/protected-feed-review.js`. Full reports and summaries go to `results/`.

| Shot | Origin | Reachable | Return | Problem |
| --- | --- | --- | --- | --- |
| Left protected feed | x=1.5/1.7/1.9, y=7.6; vx=-0.4/0/0.4, vy=0.5/2 | Upward diagnostic reached in 13/18 arrival families, previously 8/18 | Continuous guide feeds outer heel; timed paddle response observed | Five families still lack sampled successful timing |
| Right protected feed | x=4.1/4.2/4.25, same velocities | Upward diagnostic reached in 18/18 families before and after | Guide now joins heel, closing exterior gap | Does not establish forgiving human timing |
| Outer loss lanes | Outside lower guides | Deliberate loss route retained | No automatic save | Detailed nudge recovery of outlane entries untested |

- Evidence: 36 matched arrivals per revision; 13 activation delays from 0 to 96 ticks, spacing 8, held 24 ticks, 10-second observations. Target is x=1..4.8, y=6.1..6.25; starting below it and reaching it shows upward redirection, not merely paddle contact. Successful timing samples rose from 124/468 to 166/468. Per-arrival sampled intervals remain in the generated summary; these counts do not imply continuous windows.
- Nudge comparison: each arrival has a held-flipper no-nudge baseline and 12 variants (left/right/up/full and up/half, delays 0/12/24), five-second observations. Target hits rose from 31/432 to 83/432. Time limits are censored, not successful saves.
- Negative tests: lateral misses and slow feeds included. Longest released-feed low-speed run fell from 9.83 to 0.55 seconds. Existing both-actuator tests cover inlane starts at y=6.6, low speed, held catches followed by release, full paddle sweep, center draining, and natural three-ball termination. No persistent trap observed in these scenarios.
- Decision: replace disconnected lower feed ends with continuous downhill guides terminating at the flipper pivots. No global physics or actuator changes. Edge verifies displayed guide geometry, launch, both flippers, nudge and reset. Actual successful upper-shot return distributions and human catch/aim difficulty remain untested; human playtesting is still needed.
