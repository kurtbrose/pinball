# Real pinball building blocks

Use this library to choose proven kinds of interaction before drawing a new table. [TABLE_DESIGN.md](TABLE_DESIGN.md) explains layout and validation; this library supplies candidate ingredients. These are design references, not executable prefabs or calibrated geometry.

Start with one route pattern, a control opportunity, and a contrasting interaction. Read the linked cards and machine context, then write origin → entrance → interaction → exit → next controllable shot, plus weak-shot and miss routes. Preserve only the lesson you need; validate the adaptation with the shot laboratory and human play.

## Find a building block

| Need | Pattern cards | Real context |
| --- | --- | --- |
| A clear lower control area | [Flipper pair, protected inlane, slings, posts](research/mechanisms/control-and-feedback.md) | [Theatre of Magic](research/machines/theatre-of-magic-1995.md) |
| A launch with player choice | [Manual plunge, skill shot](research/mechanisms/control-and-feedback.md#manual-plunge-and-skill-shot) | [FunHouse](research/machines/funhouse-1990.md) |
| A lively scoring region | [Pop nest, rollovers](research/mechanisms/control-and-feedback.md#pop-bumper-nest) | [Twilight Zone](research/machines/twilight-zone-1993.md) |
| Flow and repeatable shots | [Orbit, inner loop, ramp, wireform](research/mechanisms/routes-and-feeds.md) | [High Speed](research/machines/high-speed-1986.md), [Theatre of Magic](research/machines/theatre-of-magic-1995.md) |
| Precision and visible progress | [Standup bank, drop bank, spinner, captive ball](research/mechanisms/targets-and-progress.md) | [Black Knight](research/machines/black-knight-1980.md), [Godzilla](research/machines/godzilla-2021.md) |
| A pause and deliberate feed | [Scoop, physical lock, diverter, subway](research/mechanisms/capture-and-routing.md) | [FunHouse](research/machines/funhouse-1990.md), [High Speed](research/machines/high-speed-1986.md) |
| A secondary skill or rescue | [Upper flipper, Magna-Save, kickback](research/mechanisms/control-and-feedback.md#upper-flipper-feed), [magnetic mini-field](research/mechanisms/signature-devices.md#magnetic-mini-playfield) | [Black Knight](research/machines/black-knight-1980.md), [Banzai Run](research/machines/banzai-run-1988.md) |
| One memorable centerpiece | [Rotating toy, dispenser, moving ramp, vertical field](research/mechanisms/signature-devices.md) | [Theatre of Magic](research/machines/theatre-of-magic-1995.md), [Twilight Zone](research/machines/twilight-zone-1993.md), [Godzilla](research/machines/godzilla-2021.md) |
| A reason to follow the return | [Inlane-lit opposite shot, qualify then collect, timed combo](research/mechanisms/targets-and-progress.md#inlane-lit-opposite-shot) | [High Speed](research/machines/high-speed-1986.md), [FunHouse](research/machines/funhouse-1990.md) |

## Capability boundary

Status describes this repo, not a real machine. Recheck [src/table.js](src/table.js) and simulation before implementation; the table is actively being tuned.

- **Available:** powered flippers, passive posts/walls/guides, bumper and sling kicks, charged plunge, one-way gate, single active ball, tick-stamped mechanism events, table points and three sequential balls.
- **Geometry candidate:** single-plane lanes, loops, nests and protected feeds can use current primitives, but each arrangement needs route evidence. A generic shape is not a finished playable shot.
- **Extension:** rollover/target/spinner sensing, drop/reset state, capture/ejection, movable routing, magnets, elevation and simultaneous multiball require new mechanics. Three-ball play does not mean multiball support. The shot lab's rectangular targets are probes, not scoring switches.

Do not fake a physical lock with a passive trap, a magnet with a post, or an elevated crossing with intersecting same-plane walls. Use a deliberately named simpler adaptation or propose the missing capability. Keep calibration, headless mechanics, fixed 120 Hz ticks and same-runtime replay intact.

## Example starting briefs

These are our proposed combinations, not measured copies of the reference machines:

- **Current-engine control and contrast:** paired lower flippers + protected inlanes + one open direct bumper aim + offset pop nest + a perimeter return. Borrow the separation of deliberate shots and bumper activity; test the perimeter feed before adding targets. No claim that an orbit is already implemented.
- **One modest extension:** the same control base + two standups qualifying a third collect shot. Add tick-stamped target sensing and Rules state, keeping all routes in one plane. A future design proposal, not authorization to expand the current game.
- **Future stop-and-go:** scoop with controlled ejection + upper-flipper feed + a loop that qualifies the scoop. Requires capture and release first; defer elevated shortcuts and multiball.

For each brief compare plausible timings, success returns, near misses and low-speed arrivals. Track reachability, contact, survival and control separately. Borrowing a pattern does not establish fun or fair difficulty.

## Scope and expansion

The seed contains **31 cards and seven machine records**. It intentionally includes unsupported devices to widen the design vocabulary. Evidence is descriptive: no measured layout dimensions, invention dates, photo rectification or VPX extraction has been completed. Coverage is biased toward 1980s–1990s games; EM and 2000–2015 machines are the next sampling gaps.

[Research process and sources](research/sources.md) explains evidence levels, deduplication, optional VPX intake and how to expand the collection. Search with `rg -n 'magnet|return|Extension' PINBALL_MECHANISMS.md research`.
