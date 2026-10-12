# Research sources and intake

This is a curated descriptive library, not an automated harvest. Reviewed on 2026-10-11. The pattern cards' placement advice, tradeoffs and probes are our engineering synthesis; machine observations have source links and evidence limits. No source supplied our simulator coordinates.

## Evidence and confidence

- **Primary documented:** manufacturer manual, feature matrix or explicit instruction card. Supports only the documented model/revision.
- **Firsthand rulesheet:** named author describing play; useful for route/rule relationships. Preserve version and the author's uncertainties.
- **Catalog descriptive:** historical feature listing, useful for discovery; corroborate operation with manuals or play evidence.
- **Provisional:** recollection, unclear photo, search excerpt or community recreation alone. Do not turn it into precise geometry or an invention claim.

Confidence is per observation. A source can establish that a device exists without establishing its exact timing, location or successful return distribution. Machine dates are identifiers, not claims of first invention. Leave `first_seen` out unless independent historical evidence establishes it.

## Reviewed sources

| Source | Evidence used | Limit |
| --- | --- | --- |
| [Pinball Makers Basics](https://pinballmakers.com/wiki/index.php?title=Basics) | Device definitions: flippers, pops, slings, switches, capture and storage | Builder reference, not a measured layout; paraphrase rather than copy its diagrams |
| [Black Knight rules](https://www.pinball.org/rules/blackknight.html) | Ray Johnson revision of Larry DeMar's original; banks, locks, Magna-Save | Adjustable timing; not an exact geometry specification |
| [High Speed rules](https://www.pinball.org/rules/highspeed.html) | Bill Ung v1.10, including machine instruction card and route descriptions | Settings differ; source contains historical commentary not used as engineering evidence |
| [FunHouse rules](https://www.pinball.org/rules/funhouse.html) | Mark Phaedrus, 16 Apr 1991; skill shot, ramp routing, combo | Author states incomplete coverage and revision dependence |
| [Theatre of Magic rules](https://www.pinball.org/rules/theatreofmagic.html) | Bowen Kerins, A1.0/P-1 context, later update; loops, ramps, trunk | Route observations do not establish modern operator settings |
| [Twilight Zone IPDB](https://www.ipdb.org/search.pl?id=2684) | Catalog feature description available through search result | Direct IPDB requests were blocked; no manual/photo inspected |
| [Banzai Run rules](https://www.pinball.org/rules/banzairun.html) | Bowen Kerins; Hill transfer, upper field, captive balls | Explicitly based on memory; details provisional |
| [Godzilla manufacturer](https://www.sternpinball.com/game/Godzilla/) and [2021 feature matrix](https://sternpinball.com/wp-content/uploads/2021/09/Godzilla-Pinball-Feature-Matrix-3kjhasdf.pdf) | Model-specific device presence and routing description | Product description, not proof of shot difficulty or feed quality |
| [VPXTool](https://github.com/francisdb/vpxtool) | Documented selective JSON/script extraction | Community recreation data is separate evidence from original hardware |

[IPDB](https://www.ipdb.org/), [PinWiki](https://www.pinwiki.com/wiki/) and [Pinball Archive](https://www.pinball.org/rules/) are discovery starting points. Fetch the actual supporting page before adding a verified observation. Record blocked access honestly instead of claiming a homepage proves a mechanism.

## Add a machine and deduplicate patterns

1. Pick a machine that fills a coverage gap. Next batches should include EM, early solid state, 2000–2015 and modern designs, including unusual devices rather than only popular games. Seed coverage: 1980, 1986, 1988, 1990, 1993, 1995, 2021.
2. Create `research/machines/<name>-<year>.md` using the compact structure in existing records: identity/model, sources with evidence/confidence, observed features, linked reusable cards, proposed lesson and gaps.
3. Inspect a manual/rulesheet and overhead reference when available. Record orientation, scale assumptions and entrances, success returns, weak shots, misses, control opportunities and loss routes. Mark unknowns rather than infer dimensions from perspective art.
4. Reuse an existing card ID if behavior, control and route role match. Add a variant under it for a different implementation. Create a new family only when it changes the design decision; thematic names alone are not new mechanisms.
5. Give each new card a stable ID/category, behavior/use, placement/tradeoff, linked evidence, implementation status and a useful negative probe. Cross-link it from the index and machine record.
6. After a batch, count new families and remaining gaps. Expand toward 50–100 useful families only when evidence adds diversity. No arbitrary machine-count target is a completeness claim.

Digital-only ideas belong in a separately labeled speculative collection; this library concerns real devices and patterns. No copied photos, ROMs, table files, scripts or asset bundles are checked in.

## Optional VPX pilot

Use legally obtained local recreations with identifiable authors, versions and licenses. Keep raw/extracted files outside the tracked library until redistribution terms are known. Do not bulk scrape or download a table collection as part of ordinary design work.

The upstream README documents:

```sh
vpxtool extract --only script.vbs --only 'gameitems/*.json' table.vpx
```

`--no-media` excludes images/audio but still extracts other content, including meshes; selective JSON/script extraction is the narrower intake. Check the installed version's help. No tool installation or extraction was performed for this seed.

For a future small pilot, inspect several contrasting tables; record original-machine identity separately from recreation author/version. Inventory flippers, bumpers, kickers, targets, gates and paths. Primitive meshes and scripts may conceal compound devices, so an object count is not a mechanism inventory. Compare inferred functions with original-machine sources. Preserve coordinates in the recreation's own convention; normalization for our x-right/y-down world needs an explicit transform and scale evidence. Never transplant recreation physics as real-machine calibration.

Scale automation only if the pilot reliably answers useful questions: device-family identification, route connectivity, return destination and unsupported ambiguity. Save normalized factual observations and source URLs; keep original-versus-recreation disagreements visible. A database, schema and scraper can wait until repeated intake demonstrates a concrete need.
