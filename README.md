# Embedded Systems Engineering Roadmap

An interactive, white-theme learning platform for embedded systems engineering.
**Designed & developed by [Naresh Yadav](https://github.com/naresh-yadav45)** · B.Tech 2nd Year Student.

## Features
- Interactive roadmap (React Flow): zoom, pan, fit, reset, full screen, collapse/expand groups, jump to group
- Select a topic → highlights connected topics and lines, opens a details panel
- Priority filters (Required / Recommended / Optional) with legend
- Mobile: expandable topic groups instead of the graph
- Global search (Ctrl/Cmd + K, or `/`) across topics, descriptions and resources, with category & priority filters
- Complete topic outline (all 186 README topics), expand/collapse/search/export
- 7 learning paths, 14 projects (extensible JSON)
- Resource library: **all original links** (YouTube videos, playlists, channels, courses, books, docs…) with filters, bookmarks, in-site YouTube preview (official embed, fallback button)
- Progress tracker with notes + bookmarks (localStorage), export / import / reset
- Export roadmap as PNG, PDF, or print; export outline (Markdown); export progress (JSON)

## Run it
```bash
npm install
npm run dev        # development
npm run build      # type-check + production build into dist/
npm run preview
```

## Data pipeline
Source files live in `reference/` (original README + `map.json`).

```bash
npm run build:data   # regenerates src/data/roadmap.json, resources.json, validation-report.json
npm run check:links  # (needs internet) HTTP-checks every link -> src/data/link-check-report.json
```
- `src/data/roadmap.json` – topics, graph nodes, curated connections (with reasons), outline hierarchy
- `src/data/resources.json` – every unique URL, its original title/note, type, YouTube IDs and **all topic associations**
- `src/data/validation-report.json` – URL structure, duplicates, missing titles/topics, counts
- `src/data/learningPaths.json`, `projects.json` – hand-written content you can edit

Links are never silently dropped; anything with a structural problem is flagged `needsVerification`.
HTTP status is **not** checked at build time (run `check:links`).

## Credits & licence
Roadmap structure, topic descriptions, connections and learning resources are based on
[Embedded Engineering Roadmap](https://github.com/m3y54m/Embedded-Engineering-Roadmap) by Meysam Parvizi,
licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). This project keeps that licence
(see `reference/LICENSE.original`). The user interface is an original implementation.
