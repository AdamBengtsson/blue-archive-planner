# Blue Archive Gem Planner

A static web version of the `Blue_Archive_Gem_Planner.xlsx` spreadsheet: plan which
Blue Archive banners to spend gems on, and see how far ahead the plan holds.

Hosted on GitHub Pages, no build step.

## Project structure
- [index.html](index.html): page structure and the order scripts load in
- [styles.css](styles.css): all styling, carried over from the cardnamer page
- [seed-data.js](seed-data.js): the banner list migrated out of the spreadsheet, without any personal data
- [archive-fixes.js](archive-fixes.js): corrected archive dates and names, checked against the Global banner list on bluearchive.wiki. Applied on every load, so saved data gets them too
- [planner-core.js](planner-core.js): the planning maths, ported from the sheet's formulas
- [storage.js](storage.js): load/save, moving browser data into the account, and JSON backup import/export
- [planner-ui.js](planner-ui.js): rendering and event handling
- [banner-data.js](banner-data.js): the forecast of upcoming Global banners (generated)
- [scripts/refresh-banners.mjs](scripts/refresh-banners.mjs): rebuilds banner-data.js from the forecast page
- [banners-ui.js](banners-ui.js): the forecast inside the planning table, plus live checks against SchaleDB
- [firebase-config.js](firebase-config.js): Firebase web config
- [firebase-logic.js](firebase-logic.js): passphrase sign-in and the account's Firestore document
- [firestore.rules](firestore.rules): the Firestore rules, kept here for reference

## How it works
- One row per banner, earliest first: dates, characters, units planned. The rows
  come from the forecast by themselves; only Units is typed in, or set with the
  &minus; and + buttons next to it. Rows with a Limited or Fes student are tinted red.
- **Units** is how many banners you want to spend on. Each costs the default
  24,000, the worst case, even when a unit comes cheaper in game.
- **Income** is not typed in. It is estimated from your gem log: for each gap
  between two logged counts, earned = the change in your count + the units spent
  on banners that started in between (at the default cost).
  The monthly rate is the total earned over the total days, for the gaps in the
  last 12 months (*Estimate income from the last* in Settings). Each banner row
  then earns that rate for its days, and the *Income estimate* panel shows the
  working.
- The estimate is only as good as the logs. Units you spent but did not enter
  make it read low. Pyroxene spent on anything other than banners is assumed to
  be negligible.
- Because every unit is counted at the full 24,000, a unit that came cheaper
  still adds the full cost back as spend, so the income estimate reads a little
  high. That is accepted: tracking the real spend per banner is too much work.
- **Expected after** is your gem anchor + income so far &minus; planned spend so far.
- **Lowest ahead** is the lowest the balance is projected to get between that row and
  the end of the plan. At or above 0 means everything planned fits. The row where
  the balance bottoms out is marked *Lowest point*: that banner is what limits
  planning more.
- **Room for extra?** appears when that lowest point still covers another unit.

### Your gem anchor
Type your real gem count into *Log your gems* under the summary. It is saved for
today (or another date, to fill in a count you forgot), and the latest one is the
anchor the plan counts forward from. A banner that had already started on the day
you logged is assumed to be paid for already. Until you log one, the starting count
in Settings is used instead. Every count is listed in the *Gem log* section, where
a wrong one can be corrected or deleted.

Counts used to be typed into an *Actual gems* column on banner rows. Saved data
from then is moved into the gem log automatically, dated on each row's End date.

### Archiving
Banners whose End date has passed are moved to the Archive when the page loads, or
on demand with the *Archive past banners* button. The Archive is read-only history;
it is not part of the projection. Banners you pulled on are highlighted, and
*Only banners I pulled on* hides the rest. This replaces the `ArchiveScript.gs` Apps Script.

## Upcoming banners
Global runs JP's banners in the same order a few months later, so the upcoming
Global schedule can be read off JP's. The forecast lives inside the Planning
table rather than in a section of its own:

- Every upcoming forecast banner is a row, with its portraits, limited/Fes tags
  and *Predicted* or *Confirmed*. Dates and names are not typed in; only
  *Units* is. Rows take the forecast's dates whenever they move.
- Older hand-typed rows that match no forecast banner are dropped when they fall
  inside the forecast and have no units. One with units stays, marked as not in
  the forecast, so nothing you planned disappears silently.

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
- A planner row matches a banner when it names the banner's first student and
  starts within a week of it.

## Data, sign-in and backups
Anyone can open the page and see the upcoming banners. Everything personal (gems,
units, the gem log, the archive's pulls, notes and settings) appears only after
signing in with the passphrase, and is saved to that account's Firestore document,
`users/{uid}`. The [Firestore rules](firestore.rules) let only the owner's account
read or write it. The page's code and [seed-data.js](seed-data.js) hold only the
public banner list, so a signed-out visitor never receives anyone's data.

- The document holds plain fields you can read in the Firebase console:
  `settings` (a map), `gemLog`, `planning` and `archive` (lists of entries) and
  `updatedAt`. Everything is one document, so a save is one write.
- Changes save to the cloud a moment after each edit, and show up on other
  signed-in devices without a reload.
- The first sign-in moves data saved in that browser by the old, browser-only
  version into the account. The old copy is left in the browser but never read again.
- Signing in on a device with no saved data and an empty account shows a notice
  instead of starting blank, so it can never overwrite the real data. Import a
  backup there, or sign in first on the browser that has the data.
- *Export backup* writes a `.json` file; *Import backup* reads one back.
  *Clear my data* empties the account.

## Firebase setup
1. Create a Firebase project and add a web app to it. Paste the config it gives
   you into [firebase-config.js](firebase-config.js). These values are public by
   design; the rules are what protect the data.
2. In Authentication > Sign-in method, enable **Email/Password**. Then under
   Users, click *Add user* with the email `owner@blue-archive-planner.app` (the
   fixed account in [firebase-logic.js](firebase-logic.js); it is not a real
   mailbox) and the passphrase as the password. Copy the user's UID from the list.
3. Create a Firestore database in production mode.
4. Put that UID in [firestore.rules](firestore.rules) (it holds the current
   owner's), paste the rules into Firestore > Rules, and publish. (Signing in before this
   step shows the same rules, filled in, on the page.)

Signing in is one passphrase box. Firebase slows down repeated wrong guesses, so
four or more random words is plenty. To change the passphrase, reset the user's
password in the Firebase console.

Without a config the planner still works, saving in the browser only.

## Local preview
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000 in a browser.
