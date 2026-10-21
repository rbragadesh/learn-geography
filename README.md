# 🌏 GeoExplorer

An iPad-first geography app for a young explorer (age 7+): India's states and capitals, countries,
continents, maps and directions, landforms, resources, the solar system - up to geography-bee style
challenges. It works offline once installed, reads every question aloud, and keeps progress on the device.

**Live app:** https://rbragadesh.github.io/learn-geography/ (once GitHub Pages is on - see *Deploying*).

## What's inside

| Zone | What she learns |
|---|---|
| 🇮🇳 India | All 28 states + 8 UTs on the map with capitals, regions, neighbours, rivers, mountain ranges, seas, famous places |
| 🌏 World | 7 continents, 5 oceans, 196 countries (capitals, flags, map position), world wonders, a passport of stamps |
| 🧭 Map Skills | Directions game (4, then 8 directions), map keys, globe, Equator, hemispheres, latitude/longitude, time zones |
| 🌋 Our Earth | Landforms and water bodies (with diagrams), weather and seasons, water cycle, Earth's layers, volcanoes, biomes |
| 🪐 Space | Interactive solar system, planet order and sizes, day/night, seasons, Indian space missions |
| ⛏️ Resources | India's crops and minerals by state, world resources, renewable vs non-renewable energy |
| 🏆 Geo Champion | ~65 harder questions in geography-bee / Geo Genius style, plus "which states touch?" puzzles |

About 1,070 facts in total, each taught first, then quizzed.

### How it teaches
- **Daily Adventure** (8-10 min): a few new facts, each *taught* before it is asked, mixed with reviews.
- **Spaced repetition**: a right answer brings a fact back after 1, 2, 4, 8, 16, 32 days; a mistake brings it back tomorrow.
- **Adventure Path**: 36 stops. The defaults introduce all 36 states/UTs in roughly 6-7 weeks; the parent area shows the projected date and can switch to "India first".
- **Maps, not lists**: "find it on the map" questions with forgiving taps for tiny places (Delhi, Goa, Singapore), named wrong taps and hints.
- **Read-aloud**: every question and explanation (prefers an Indian English voice).
- **Rewards**: stars, streaks, a sticker per completed adventure, badges (e.g. *South India Expert*, *All of India!*).

### Grown-ups area (🔒, behind a multiplication question)
Progress, the semester projection, weak spots, the full plan, a curriculum map (CBSE/NCERT, ICSE, Singapore MOE,
England KS1-KS2, IB PYP, US standards), settings (pace, voice, focus, countries she has lived in), and backup/restore.

## Using it on the iPad
1. Open the live link in **Safari**.
2. Share → **Add to Home Screen**. Open it from that icon from then on.
   This matters: Safari can wipe a website's saved data after ~7 days unused; home-screen apps are exempt, run full-screen and work offline.
3. Make a backup from Grown-ups → Backup every week or two.
4. Optional: Settings → Accessibility → Spoken Content → Voices → English → **India** to download a better voice.

## Development
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # data integrity + learning engine tests
npm run build    # production build in dist/
npm run maps     # rebuild public/data/*.json from the source map data
```
Stack: Vite + React + TypeScript, d3-geo for map projections, TopoJSON map data, vite-plugin-pwa for offline use.
No backend, no accounts, no tracking - progress is saved in the browser's local storage.

Content lives in `src/data/` (`india.ts`, `countries.ts`, `world.ts`, `facts.ts`, `syllabus.ts`).
The learning engine (cards, units, question generation, badges) is `src/lib/curriculum.ts`.

## Deploying
`.github/workflows/deploy.yml` tests, builds and publishes to GitHub Pages on every push to `main`.
One-time setup: repository **Settings → Pages → Source: GitHub Actions**.

## Data
Map data: Natural Earth (public domain) and INDIAN-SHAPEFILES (MIT). Borders follow the Government of India's
official depiction. See [DATA_LICENSES.md](DATA_LICENSES.md).
Facts were checked as of October 2026 (e.g. Port Blair → Sri Vijaya Puram, Amaravati as Andhra Pradesh's capital,
the Chenab rail bridge, Shubhanshu Shukla's 2025 ISS flight). Facts that change (producer rankings, moon counts) are
phrased to stay true, but report anything that looks wrong.
