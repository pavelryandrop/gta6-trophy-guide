# Leonida Trophy Guide — Grand Theft Auto VI

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun rank](https://make.fun/badge/gta6-trophy-guide-01/pavelryandrop/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun reward](https://make.fun/badge/gta6-trophy-guide-01/pavelryandrop/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze), built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Every trophy** with its official name, description and grade as PlayStation publishes them, plus a guide written for this entry — what to do, where and how, and when it can be missed — with its sources named beside it.
- **A roadmap to the platinum** in four stages (story, 100% checklist, strangers & cleanup, platinum), built from the official descriptions: which story chapters and missions, which collectibles and counts, in what order.
- **The one missable trophy flagged**: Positive Mental Attitude (the Chapter 1 meditation at Jason's house). Everything else can be finished in free-roam after the story.
- **A tracker**: tick trophies off and progress is saved in the browser (localStorage); export it to a file and import it back.
- **Filters** by kind (story, missable, collectibles, activities, side missions, crime, money, odd ones — and online, of which this game has none), by grade, and by search text.
- **Spoiler-safe mode**: hides the names and descriptions of story trophies until they are earned.
- **Honest about what is unknown**: five hidden trophies have no confirmed method in any published guide yet, and this guide says so instead of guessing.

## Run it

The guide is plain static files under `app/` — no build step, no network requests, nothing to install:

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `app/` with any static file server. It works with the network off.

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

The trophy list (names, descriptions, grades) follows the PSNProfiles / Exophase trophy list. Each trophy's guide cites the published guide it draws on — PowerPyx, Push Square, KeenGamer, GameMapa, Mobalytics, GTAScoop, GTA Vice City Hub, eGamers, GamesFuze, Vice City Hustle and GTA Spotter — listed in full in the app's Sources section. All guidance text is written for this entry; sources are cited, never copied.

This is an unofficial fan guide, not affiliated with Rockstar Games or PlayStation. No Rockstar logo, artwork or game screenshots are used.

## License

MIT — see [LICENSE](LICENSE).
