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
 * A fix either sets new values on the row (`set`) or deletes it (`remove`),
 * or adds a banner the archive is missing (`add`, placed after the row named
 * in `after`, and only if no row with its start, end and banner exists yet).
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
  },

  // August to October 2025
  {
    match: { start: "2025-07-27", end: "2025-08-10", banner: "Casual & Part-timers" },
    set: { start: "2025-08-05", end: "2025-08-19" }
  },
  {
    match: { start: "2025-08-10", end: "2025-08-17", banner: "Christmas Knights" },
    remove: true
  },
  {
    match: { start: "2025-08-17", end: "2025-08-24", banner: "*Limited* New year" },
    set: { start: "2025-08-19", end: "2025-08-26", banner: "*Limited* New year & Christmas Knights" }
  },
  {
    match: { start: "2025-08-24", end: "2025-09-08", banner: "Sports club" },
    set: { start: "2025-08-26", end: "2025-09-09" }
  },
  {
    match: { start: "2025-08-16", end: "2025-08-23", banner: "PS68" },
    remove: true
  },
  {
    match: { start: "2025-08-09", end: "2025-08-16", banner: "Saori" },
    set: { start: "2025-09-09", end: "2025-09-16", banner: "Saori & PS68 (Dress)" }
  },
  {
    match: { start: "2025-08-23", end: "2025-08-30", banner: "Shanghaijing" },
    set: { start: "2025-09-16", end: "2025-09-23" }
  },
  {
    match: { start: "2025-08-30", end: "2025-09-13", banner: "Highlanders" },
    set: { start: "2025-09-23", end: "2025-10-07" }
  },
  {
    match: { start: "2025-09-13", end: "2025-09-20", banner: "Arius" },
    set: { start: "2025-10-07", end: "2025-10-14" }
  },
  {
    match: { start: "2025-09-20", end: "2025-09-27", banner: "Guides" },
    set: { start: "2025-10-14", end: "2025-10-21" }
  },

  // November 2025 to September 2026
  {
    match: { start: "2025-12-16", end: "2025-12-16", banner: "FEST" },
    set: { end: "2025-12-23", banner: "*Limited* Seia & Hasumi Swimsuits" }
  },
  {
    match: { start: "2026-02-10", end: "2026-02-17", banner: "CnC Bunny Girls" },
    remove: true
  },
  {
    match: { start: "2026-02-17", end: "2026-03-03", banner: "Wildhunt" },
    set: { start: "2026-02-10", end: "2026-02-24" }
  },
  {
    match: { start: "2026-03-02", end: "2026-03-03", banner: "Wildhunt" },
    set: { start: "2026-02-24", banner: "Ritsu, Shigure & Miyu" }
  },
  {
    after: { start: "2026-04-28", end: "2026-05-12", banner: "Hyakkiyako Dress" },
    add: {
      start: "2026-05-05",
      end: "2026-05-12",
      banner: "Anniversary Archive (Wakamo, Hoshino Swimsuit, Mika)",
      units: 0,
      unitCost: null,
      note: ""
    }
  },
  {
    match: { start: "2026-05-12", end: "2026-05-26", banner: "Millenium Sportswear" },
    remove: true
  },
  {
    match: { start: "2026-05-12", end: "2026-05-26", banner: "Reijo / Kisaki" },
    set: { banner: "*Limited* Millennium Sportswear & Reijo / Kisaki" }
  },
  {
    match: { start: "2026-05-26", end: "2026-06-09", banner: "FEST 1" },
    set: { banner: "*Limited* Rio & Himari (Battle)" }
  },
  {
    match: { start: "2026-06-16", end: "2026-06-23", banner: "Intermission" },
    set: { banner: "Ichika, Kasumi, Sakurako & Eimi (Swimsuit)" }
  },
  {
    match: { start: "2026-07-07", end: "2026-07-14", banner: "Game Development maid" },
    remove: true
  },
  {
    match: { start: "2026-07-07", end: "2026-07-14", banner: "Newyear rerun" },
    set: { banner: "Newyear rerun & Game Development maid" }
  },
  {
    match: { start: "2026-07-14", end: "2026-07-21", banner: "Pajama" },
    remove: true
  },
  {
    match: { start: "2026-07-14", end: "2026-07-21", banner: "Newyear Limited" },
    set: { banner: "Newyear Limited & Pajama" }
  },
  {
    match: { start: "2026-08-04", end: "2026-08-18", banner: "Rerun" },
    set: { banner: "*Limited* School Uniform rerun (Seia, Asuna)" }
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
    if (fix.add) {
      rows = addRow(rows, fix);
      return;
    }
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

/** Inserts a fix's missing banner after its `after` row, once. */
function addRow(rows, fix) {
  const same = (row, other) => ["start", "end", "banner"].every((key) => row[key] === other[key]);
  if (rows.some((row) => same(row, fix.add))) return rows;
  const index = rows.findIndex((row) => same(row, fix.after));
  if (index === -1) return rows;
  return rows.slice(0, index + 1).concat(Object.assign({}, fix.add), rows.slice(index + 1));
}
