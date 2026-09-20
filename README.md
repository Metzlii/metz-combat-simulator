# Metz Combat Simulator

A combat simulator for [Milky Way Idle](https://www.milkywayidle.com/) planets and dungeons that runs entirely in
your browser: <https://metzlii.github.io/metz-combat-simulator/>

- **Simulate** a character or a whole party in any planet or dungeon, at any tier, for as many simulated hours as you
  like: kills, deaths, XP, loot and profit per hour.
- **Optimize:**
  - **Upgrades:** the gear and ability upgrades worth the most per coin, priced through enhancing, mirrors and books.
  - **Trigger values:** your abilities' enemy-HP thresholds, tuned two passes deep.
  - **Skill levelling:** which combat skill repays its levelling time, drawn as curves over the days it takes.
- **Import a whole party at once** with the [MWI Party Export](https://greasyfork.org/en/scripts/596494-mwi-party-export)
  userscript: open each member's profile once, then paste.

Nothing is sent to a server: the combat kernel is compiled to WebAssembly and every simulation runs on your machine.

## This repository

This repository holds the **built site only**: what GitHub Pages serves. The source is kept in a private repository,
and each release replaces this one's contents with a new build. Issues and suggestions are welcome here.

## Found something wrong?

Mail Metzli in-game, or open an issue. Numbers that look off are worth reporting with your export and the zone you
ran: a seed makes a run reproducible.

## Credits

- The combat kernel is a Rust port of the community MWI Combat Simulator (AmVoidGuy, shykai, azhu949), by gragatrim,
  used with permission, and further optimized by Metzli: 4–9× faster per simulation, with identical results.
- Weylan measured the gap between one fight ending and the next starting, on planets.
- Star wrote the core-count probe, so a browser that hides how many cores you have no longer costs you lanes.
- Kim, Mango and Zhiwen provided test data.
- Enhancement costs follow [Enhancelator](https://github.com/doh-nuts/Enhancelator) by doh-nuts.

Full licence texts are in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). Game data and art belong to Milky Way
Idle.

## Licence

MIT: see [LICENSE](LICENSE).
