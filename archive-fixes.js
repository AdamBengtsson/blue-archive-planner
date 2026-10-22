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
 * Units and notes are left alone, unless a fix sets units Adam has
 * confirmed. Gem counts typed on a banner row were moved
 * into the gem log under that row's End date, so when a fix moves the End
 * date, a count logged on the old End date moves with it (unless the fix
 * says `keepGemLog`, for a count that belongs to another row ending that day).
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
    // The count logged on 03-03 belongs to the next Wildhunt row, so it stays.
    match: { start: "2026-02-17", end: "2026-03-03", banner: "Wildhunt" },
    set: { start: "2026-02-10", end: "2026-02-24" },
    keepGemLog: true
  },
  {
    match: { start: "2026-03-02", end: "2026-03-03", banner: "Wildhunt" },
    set: { start: "2026-02-24", banner: "Ritsu, Shigure & Miyu" }
  },
  {
    // Adam pulled Suzumi and Reisa (Magical).
    match: { start: "2026-03-10", end: "2026-03-24", banner: "Magical girls" },
    set: { units: 2 }
  },
  {
    // Adam thinks he pulled Subaru here.
    match: { start: "2026-03-31", end: "2026-04-07", banner: "Trinity Swimsuits & New Arius" },
    set: { units: 1, note: "1 unit (Subaru), probably" }
  },
  {
    // Adam was missing a limited unit and pulled here, not on the banners around it.
    match: { start: "2026-04-21", end: "2026-04-28", banner: "Idol Rerun" },
    set: { units: 1 }
  },
  {
    after: { start: "2026-04-28", end: "2026-05-12", banner: "Hyakkiyako Dress" },
    add: {
      start: "2026-05-05",
      end: "2026-05-12",
      banner: "Anniversary Archive (Wakamo, Hoshino Swimsuit, Mika)",
      units: 0,
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
    // Adam owns Rio and Himari (Battle), so he pulled here.
    set: { banner: "*Limited* Rio & Himari (Battle)", units: 2 }
  },
  {
    // Adam owns Kei and Arisu (Battle), so he pulled here.
    match: { start: "2026-06-09", end: "2026-06-16", banner: "FEST 2" },
    set: { units: 2 }
  },
  {
    match: { start: "2026-06-16", end: "2026-06-23", banner: "Intermission" },
    set: { banner: "Ichika, Kasumi, Sakurako & Eimi (Swimsuit)" }
  },
  {
    // The 1 unit was an old plan; Adam was low on gems and did not pull.
    match: { start: "2026-06-23", end: "2026-07-07", banner: "Yuzu & Eimi Battle" },
    set: { units: 0 }
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
  },

  // November 2023 to September 2024, then the banners that ran during
  // Adam's break (September 2024 to March 2025)
  {
    match: { start: "2023-11-22", end: "2023-11-29", banner: "Summertime Trinity" },
    set: { start: "2023-11-21", end: "2023-11-28" }
  },
  {
    match: { start: "2023-11-29", end: "2023-12-13", banner: "China" },
    set: { start: "2023-11-28", end: "2023-12-12" }
  },
  {
    match: { start: "2023-12-13", end: "2023-12-20", banner: "Russia & Buns 1+2" },
    set: { start: "2023-12-12", end: "2023-12-19" }
  },
  {
    match: { start: "2023-12-20", end: "2023-12-27", banner: "Buns 3+4" },
    set: { start: "2023-12-19", end: "2023-12-26" }
  },
  {
    match: { start: "2023-12-27", end: "2024-01-10", banner: "SummerSRT" },
    set: { start: "2023-12-26", end: "2024-01-09" }
  },
  {
    match: { start: "2024-01-10", end: "2024-01-17", banner: "SummerGehenna" },
    set: { start: "2024-01-09", end: "2024-01-16" }
  },
  {
    match: { start: "2024-01-17", end: "2024-01-24", banner: "Nothing?" },
    set: { start: "2024-01-16", end: "2024-01-23", banner: "China: Shun (Kid), Saya (Casual), Kokona & Kirino" }
  },
  {
    match: { start: "2024-01-24", end: "2024-01-31", banner: "SummerAbydos + Wakamo" },
    set: { start: "2024-01-23", end: "2024-01-30" }
  },
  {
    match: { start: "2024-01-31", end: "2024-02-07", banner: "SummerTrinity FREE PULLS" },
    set: { start: "2024-01-30", end: "2024-02-08" }
  },
  {
    match: { start: "2024-02-07", end: "2024-02-14", banner: "SummerTrinity & Wakamo %UP" },
    set: { start: "2024-02-08", end: "2024-02-15" }
  },
  {
    match: { start: "2024-02-14", end: "2024-02-21", banner: "China (changed to Sumire&Eimi)" },
    set: { start: "2024-02-15", end: "2024-02-20", banner: "Sumire & Eimi" }
  },
  {
    match: { start: "2024-02-21", end: "2024-02-28", banner: "SummerHyakidakikado" },
    set: { start: "2024-02-20", end: "2024-02-27" }
  },
  {
    match: { start: "2024-02-28", end: "2024-03-13", banner: "Meru" },
    set: { start: "2024-02-27", end: "2024-03-12" }
  },
  {
    match: { start: "2024-03-13", end: "2024-03-22", banner: "Cheerleaders" },
    set: { start: "2024-03-12", end: "2024-03-21" }
  },
  {
    match: { start: "2024-03-22", end: "2024-04-03", banner: "Gym" },
    set: { start: "2024-03-21", end: "2024-04-02" }
  },
  {
    match: { start: "2024-04-04", end: "2024-04-14", banner: "Ichika & Kasumi" },
    set: { start: "2024-04-02", end: "2024-04-16" }
  },
  {
    match: { start: "2024-04-17", end: "2024-04-24", banner: "Red Winter Hot Springs" },
    set: { start: "2024-04-16", end: "2024-04-23" }
  },
  {
    match: { start: "2024-04-24", end: "2024-04-30", banner: "Shigure & Megu" },
    set: { start: "2024-04-23" }
  },
  {
    match: { start: "2024-04-30", end: "2024-05-15", banner: "Railgun Collab!" },
    set: { end: "2024-05-14" }
  },
  {
    match: { start: "2024-05-15", end: "2024-05-22", banner: "Yukari" },
    set: { start: "2024-05-14", end: "2024-05-21" }
  },
  {
    match: { start: "2024-05-22", end: "2024-05-29", banner: "Arius" },
    set: { start: "2024-05-21", end: "2024-05-28" }
  },
  {
    match: { start: "2024-05-29", end: "2024-06-14", banner: "Renge & Kikyou" },
    set: { start: "2024-05-28", end: "2024-06-11" }
  },
  {
    match: { start: "2024-06-14", end: "2024-06-20", banner: "S.Eimi & Himari" },
    set: { start: "2024-06-11", end: "2024-06-18" }
  },
  {
    match: { start: "2024-06-20", end: "2024-06-27", banner: "Sumire & Eimi" },
    remove: true
  },
  {
    match: { start: "2024-06-27", end: "2024-07-04", banner: "C&C (Bunnies)" },
    set: { start: "2024-06-18", end: "2024-06-25" }
  },
  {
    match: { start: "2024-07-04", end: "2024-07-10", banner: "Veritas (Camping)" },
    set: { start: "2024-06-25", end: "2024-07-09" }
  },
  {
    match: { start: "2024-07-10", end: "2024-07-17", banner: "Newyear rerun" },
    set: { start: "2024-07-09", end: "2024-07-16" }
  },
  {
    match: { start: "2024-07-17", end: "2024-07-24", banner: "Arius " },
    set: { start: "2024-07-16", end: "2024-07-23" }
  },
  {
    match: { start: "2024-08-01", end: "2024-08-08", banner: "Gehenna FES" },
    set: { start: "2024-07-23", end: "2024-07-30", banner: "*Limited* Gehenna: Makoto & Ako (Dress)" }
  },
  {
    match: { start: "2024-08-09", end: "2024-08-18", banner: "Gehenna FES part 2" },
    set: { start: "2024-07-30", end: "2024-08-06", banner: "Gehenna FES: Hina (Dress) & Hoshino (Swimsuit)" }
  },
  {
    match: { start: "2024-08-18", end: "2024-08-25", banner: "Knights rerun (Christmas)" },
    set: { start: "2024-08-06", end: "2024-08-13" }
  },
  {
    match: { start: "2024-08-25", end: "2024-09-01", banner: "Chihiro & Mine" },
    set: { start: "2024-08-13", end: "2024-08-20" }
  },
  {
    match: { start: "2024-09-01", end: "2024-09-14", banner: "Problem solver (Dress)" },
    set: { start: "2024-08-20", end: "2024-09-03" }
  },
  {
    match: { start: "2024-09-14", end: "2024-09-28", banner: "Food Gehenna (New Year)" },
    set: { start: "2024-09-03", end: "2024-09-17" }
  },
  {
    match: { start: "2024-09-28", end: "2024-10-05", banner: "Ui & Hinata" },
    set: { start: "2024-09-17", end: "2024-09-24" }
  },
  {
    // A spreadsheet marker for Adam's break from the game; the real banners follow.
    match: { start: null, end: null, banner: "~~" },
    remove: true
  },
  {
    after: { start: "2024-09-17", end: "2024-09-24", banner: "Ui & Hinata" },
    add: {
      start: "2024-09-24",
      end: "2024-10-08",
      banner: "Tsubaki (Guide), Umika, Mimori, Izuna & Shizuko",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2024-09-24", end: "2024-10-08", banner: "Tsubaki (Guide), Umika, Mimori, Izuna & Shizuko" },
    add: {
      start: "2024-10-08",
      end: "2024-10-15",
      banner: "Kazusa, Reisa, Natsu & Mari",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2024-10-08", end: "2024-10-15", banner: "Kazusa, Reisa, Natsu & Mari" },
    add: {
      start: "2024-10-15",
      end: "2024-10-22",
      banner: "*Limited* Toki, Nagisa & Koyuki",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2024-10-15", end: "2024-10-22", banner: "*Limited* Toki, Nagisa & Koyuki" },
    add: {
      start: "2024-10-22",
      end: "2024-11-05",
      banner: "*Limited* Kazusa (Band), Yoshimi (Band) & Ako",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2024-10-22", end: "2024-11-05", banner: "*Limited* Kazusa (Band), Yoshimi (Band) & Ako" },
    add: {
      start: "2024-11-05",
      end: "2024-11-12",
      banner: "Kirara, Kaede, Tsukuyo & Kaho",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2024-11-05", end: "2024-11-12", banner: "Kirara, Kaede, Tsukuyo & Kaho" },
    add: {
      start: "2024-11-12",
      end: "2024-11-19",
      banner: "Rumi, Mina, Shun & Kokona",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2024-11-12", end: "2024-11-19", banner: "Rumi, Mina, Shun & Kokona" },
    add: {
      start: "2024-11-19",
      end: "2024-12-03",
      banner: "Momoi (Maid), Midori (Maid), Arisu (Maid) & Toki (Bunny Girl)",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2024-11-19", end: "2024-12-03", banner: "Momoi (Maid), Midori (Maid), Arisu (Maid) & Toki (Bunny Girl)" },
    add: {
      start: "2024-12-03",
      end: "2024-12-14",
      banner: "Serika (Swimsuit), Nonomi (Swimsuit), Wakamo (Swimsuit) & Shiroko (Swimsuit)",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2024-12-03", end: "2024-12-14", banner: "Serika (Swimsuit), Nonomi (Swimsuit), Wakamo (Swimsuit) & Shiroko (Swimsuit)" },
    add: {
      start: "2024-12-14",
      end: "2024-12-24",
      banner: "*Limited* Izuna (Swimsuit), Chise (Swimsuit) & Mimori (Swimsuit)",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2024-12-14", end: "2024-12-24", banner: "*Limited* Izuna (Swimsuit), Chise (Swimsuit) & Mimori (Swimsuit)" },
    add: {
      start: "2024-12-24",
      end: "2025-01-07",
      banner: "Kanna (Swimsuit) & Fubuki (Swimsuit)",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2024-12-24", end: "2025-01-07", banner: "Kanna (Swimsuit) & Fubuki (Swimsuit)" },
    add: {
      start: "2025-01-07",
      end: "2025-01-16",
      banner: "Moe (Swimsuit), Miyako (Swimsuit) & Saki (Swimsuit)",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2025-01-07", end: "2025-01-16", banner: "Moe (Swimsuit), Miyako (Swimsuit) & Saki (Swimsuit)" },
    add: {
      start: "2025-01-16",
      end: "2025-01-23",
      banner: "Hina & Hoshino",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2025-01-16", end: "2025-01-23", banner: "Hina & Hoshino" },
    add: {
      start: "2025-01-23",
      end: "2025-01-30",
      banner: "FEST: Hoshino (Battle), Shiroko＊Terror & Mika",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2025-01-23", end: "2025-01-30", banner: "FEST: Hoshino (Battle), Shiroko＊Terror & Mika" },
    add: {
      start: "2025-01-30",
      end: "2025-02-08",
      banner: "*Limited* Saori (Swimsuit) & Hiyori (Swimsuit)",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2025-01-30", end: "2025-02-08", banner: "*Limited* Saori (Swimsuit) & Hiyori (Swimsuit)" },
    add: {
      start: "2025-02-08",
      end: "2025-02-18",
      banner: "Meru, Momiji, Cherino, Marina, Minori & Shigure (Hot Spring)",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2025-02-08", end: "2025-02-18", banner: "Meru, Momiji, Cherino, Marina, Minori & Shigure (Hot Spring)" },
    add: {
      start: "2025-02-18",
      end: "2025-03-04",
      banner: "Marina (Qipao) & Tomoe (Qipao)",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2025-02-18", end: "2025-03-04", banner: "Marina (Qipao) & Tomoe (Qipao)" },
    add: {
      start: "2025-03-04",
      end: "2025-03-11",
      banner: "*Limited* Ui (Swimsuit), Hinata (Swimsuit), Iroha & Miyu",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    after: { start: "2025-03-04", end: "2025-03-11", banner: "*Limited* Ui (Swimsuit), Hinata (Swimsuit), Iroha & Miyu" },
    add: {
      start: "2025-03-11",
      end: "2025-03-18",
      banner: "*Limited* Neru (Bunny Girl), Karin (Bunny Girl), Asuna (Bunny Girl) & Akane (Bunny Girl)",
      units: null,
      note: "Break, not tracked"
    }
  },
  {
    // Adam pulled Niko and Kurumi here (2026-10-22).
    match: { start: "2026-08-18", end: "2026-09-01", banner: "SRT FOX" },
    set: { units: 2 }
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
    if (!fix.keepGemLog && to && to !== from && !log.some((entry) => entry.date === to)) {
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
