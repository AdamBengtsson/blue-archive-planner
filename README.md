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
- [banner-data.js](banner-data.js): the forecast of upcoming Global banners (generated)
- [scripts/refresh-banners.mjs](scripts/refresh-banners.mjs): rebuilds banner-data.js from the forecast page
- [banners-ui.js](banners-ui.js): the Upcoming banners cards, plus live checks against SchaleDB
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

## Upcoming banners
Global runs JP's banners in the same order a few months later, so the upcoming
Global schedule can be read off JP's. The *Upcoming banners* section shows one
card per banner with portraits, dates and limited/Fes tags, and *Add to planner*
copies a banner into the planning table.

- The forecast lives in [banner-data.js](banner-data.js), generated from
  [Joe's Blue Archive Tools](https://ba.joexyz.online/global/banners), which
  maps JP's schedule onto Global dates. The *Refresh upcoming banners* GitHub
  workflow re-reads that page every day at 03:17 UTC and commits straight to
  `main` when the banners changed, so there is nothing to do by hand. It can
  also be run from the repo's Actions tab. If the page is down or changes
  shape, the run fails, the old list stays, and GitHub emails you.
- On load the page asks [SchaleDB](https://schaledb.com) which banners are live.
  The live Global banner is marked *Confirmed*, and JP's live banner is appended
  as an estimate (`jpLagDays` later) when the bundled list does not reach it yet.
  If SchaleDB cannot be reached, the bundled list is shown as is.
- Portraits are loaded from SchaleDB by student id; a missing one shows the
  student's initial instead.
- A card says *In planner* when a planning row already names its first student
  within a week of its start date. If that row's dates differ from the forecast,
  the button offers to move the row onto the forecast dates instead.

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
