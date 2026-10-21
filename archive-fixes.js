/**
 * Corrections to banner archive rows, checked against the Global banner list
 * on bluearchive.wiki (Banner_List_(Global)).
 *
 * The archive came from the spreadsheet with hand-typed, estimated dates.
 * Each fix names a row by its old start, end and banner, so it only touches
 * that exact row and does nothing once applied. They run on every load, on
 * the seed and on saved or imported data alike, so a browser that already
 * has the old rows gets corrected too.
 *
 * A fix either sets new values on the row (`set`) or deletes it (`remove`).
 * Units and notes are left alone. Gem counts typed on a banner row were moved
 * into the gem log under that row's End date, so when a fix moves the End
 * date, a count logged on the old End date moves with it.
 */
const ARCHIVE_FIXES = [
  // April 2025
  {
    match: { start: "2025-04-01", end: "2025-04-07", banner: "Shanghaijing" },
    set: { end: "2025-04-08", banner: "*Limited* Trinity Swimsuits" }
  },
  {
    match: { start: "2025-04-07", end: "2025-04-09", banner: "Swimsuit reruns" },
    remove: true
  },
  {
    match: { start: "2025-04-09", end: "2025-04-16", banner: "Hyakkiyouran" },
    set: { start: "2025-04-08", end: "2025-04-15" }
  },
  {
    match: { start: "2025-04-16", end: "2025-04-23", banner: "*Limited* Idols" },
    set: { start: "2025-04-15", end: "2025-04-29" }
  },
  {
    match: { start: "2025-04-11", end: "2025-04-18", banner: "Hinata & Saori" },
    set: { start: "2025-04-29", end: "2025-05-06" }
  },
  {
    match: { start: "2025-04-18", end: "2025-04-25", banner: "*Limited* Gehenna Swimsuit" },
    set: { start: "2025-05-06", end: "2025-05-13" }
  },
  {
    match: { start: "2025-04-25", end: "2025-05-08", banner: "*Limited* Pandaemonium society" },
    set: { start: "2025-05-13", end: "2025-05-27" }
  }
];

/**
 * Applies every fix whose row is still there, unchanged. Returns the fixed
 * archive and gem log; the inputs are not changed.
 */
function applyArchiveFixes(archive, gemLog) {
  let rows = archive;
  let log = gemLog;
  ARCHIVE_FIXES.forEach((fix) => {
    const isMatch = (row) => Object.keys(fix.match).every((key) => row[key] === fix.match[key]);
    if (!rows.some(isMatch)) return;
    if (fix.remove) {
      rows = rows.filter((row) => !isMatch(row));
      return;
    }
    rows = rows.map((row) => (isMatch(row) ? Object.assign({}, row, fix.set) : row));
    const from = fix.match.end;
    const to = fix.set.end;
    if (to && to !== from && !log.some((entry) => entry.date === to)) {
      log = log.map((entry) => (entry.date === from ? Object.assign({}, entry, { date: to }) : entry));
    }
  });
  return { archive: rows, gemLog: log };
}
