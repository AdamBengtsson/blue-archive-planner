# Blue Archive Gem Planner

A static web version of the `Blue_Archive_Gem_Planner.xlsx` spreadsheet: plan which
Blue Archive banners to spend gems on, and see how far ahead the plan holds.

Hosted on GitHub Pages, no build step.

## Project structure
- [index.html](index.html): page structure and the order scripts load in
- [styles.css](styles.css): all styling, carried over from the cardnamer page
- [seed-data.js](seed-data.js): the data migrated out of the spreadsheet, used on first run
- [planner-core.js](planner-core.js): the planning maths, ported from the sheet's formulas
- [storage.js](storage.js): load/save, reset, and JSON backup import/export
- [planner-ui.js](planner-ui.js): rendering and event handling
- [firebase-config.js](firebase-config.js): Firebase web config (placeholder)
- [firebase-logic.js](firebase-logic.js): optional Firestore sync

## How it works
- One row per banner, earliest first: start date, end date, characters, units planned.
- **Units** is how many banners you want to spend on. Each costs 24,000 by default;
  type a cheaper figure in *Cost / unit* on a row when you get lucky.
- **Income** of 13,000 lands on the banner whose End date is the first to reach into
  a new month. That row is tinted green.
- **Expected after** is your gem anchor + income so far &minus; planned spend so far.
- **Lowest ahead** is the lowest the balance is projected to get between that row and
  the end of the plan. At or above 0 means everything planned fits.
- **Room for extra?** appears when that lowest point still covers another unit.

### Your gem anchor
The anchor is the most recent *Actual gems* figure you logged on a row. Everything
below it counts forward from that number, so you only ever type your real gem count
in one place. Until you log one, the starting count in Settings is used instead.

### Archiving
Banners whose End date has passed are moved to the Archive when the page loads, or
on demand with the *Archive past banners* button. The Archive is read-only history;
it is not part of the projection. This replaces the `ArchiveScript.gs` Apps Script.

## Data and backups
Everything is saved to browser localStorage, so the planner works offline and
needs no account. *Export backup* writes a `.json` file; *Import backup* reads one
back. *Reset to seed data* returns to the migrated spreadsheet contents.

## Firebase setup (optional)
Sync across devices is off until a project is configured.
1. Create a new Firebase project and add a web app to it.
2. Paste the config it gives you into [firebase-config.js](firebase-config.js).
3. Create a Firestore database. The planner writes a single `planner/state` document.
4. Restrict the Firestore rules before storing anything you care about.

## Local preview
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000 in a browser.
