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
  },

  // May to July 2025. Global ran some of the banners expected from JP as
  // one bigger banner, so those pairs become one row.
  {
    match: { start: "2025-05-08", end: "2025-05-15", banner: "Kasumi & Ichika" },
    set: { start: "2025-05-27", end: "2025-06-03" }
  },
  {
    match: { start: "2025-05-15", end: "2025-05-22", banner: "Cheerleaders" },
    remove: true
  },
  {
    match: { start: "2025-05-22", end: "2025-05-29", banner: "*Limited* Sportswear" },
    set: { start: "2025-06-03", end: "2025-06-10", banner: "*Limited* Sportswear & Cheerleaders" }
  },
  {
    match: { start: "2025-05-29", end: "2025-06-13", banner: "Pajama" },
    set: { start: "2025-06-10", end: "2025-06-24" }
  },
  {
    match: { start: "2025-06-13", end: "2025-06-20", banner: "*Limited* New year" },
    set: { start: "2025-06-24", end: "2025-07-01" }
  },
  {
    match: { start: "2025-06-20", end: "2025-06-23", banner: "Game Development maid" },
    set: { start: "2025-07-01", end: "2025-07-08" }
  },
  {
    match: { start: "2025-06-23", end: "2025-06-30", banner: "*Limited* Anniversary part 1" },
    set: { start: "2025-07-08", end: "2025-07-15" }
  },
  {
    match: { start: "2025-06-30", end: "2025-07-06", banner: "*Limited* Anniversary part 2" },
    set: { start: "2025-07-15", end: "2025-07-22" }
  },
  {
    match: { start: "2025-07-06", end: "2025-07-13", banner: "Himari & Eimi" },
    remove: true
  },
  {
    match: { start: "2025-07-13", end: "2025-07-27", banner: "Camping" },
    set: { start: "2025-07-22", end: "2025-08-05", banner: "Camping, Himari & Eimi", note: "CALCULATION" }
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
