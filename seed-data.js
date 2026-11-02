/**
 * Starting data: the banner list migrated from Blue_Archive_Gem_Planner.xlsx.
 *
 * It holds only public banner information, never anyone's gems, units or
 * notes. Those are saved per account in the cloud (see firebase-logic.js), so
 * a visitor who is not signed in never receives them.
 *
 * It is what a new account, a cleared account, or a browser without Firebase
 * starts from:
 *
 *   settings  defaults: income lookback, unit cost
 *   planning  current and upcoming banners, earliest first
 *   archive   past banners, kept only for looking back at
 */
const SEED_DATA = {
  "settings": {
    "incomeLookbackMonths": 12,
    "defaultUnitCost": 24000,
    "staleDays": 14
  },
  "planning": [
    {
      "start": "2026-09-15",
      "end": "2026-09-29",
      "banner": "Problem Solver Dress",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-09-29",
      "end": "2026-10-06",
      "banner": "Nagusa Swimsuit",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-10-06",
      "end": "2026-10-13",
      "banner": "Band Rerun",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-10-13",
      "end": "2026-10-27",
      "banner": "Kisaki & Shun Swimsuits",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-10-27",
      "end": "2026-11-10",
      "banner": "Limited Reruns",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-11-10",
      "end": "2026-11-17",
      "banner": "Limited Reruns",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-11-17",
      "end": "2026-11-24",
      "banner": "Makoto & Satsuki Swimsuits",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-11-24",
      "end": "2026-12-01",
      "banner": "Iroha & Ibuki Swimsuits",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-12-01",
      "end": "2026-12-15",
      "banner": "Casual Rerun",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-12-15",
      "end": "2026-12-29",
      "banner": "Odyssey Maritime School",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-12-29",
      "end": "2027-01-12",
      "banner": "Swimsuit Reruns",
      "units": null,
      "note": ""
    },
    {
      "start": "2027-01-12",
      "end": "2027-01-26",
      "banner": "Red Winter Engineers",
      "units": null,
      "note": ""
    }
  ],
  "archive": [
    {
      "start": "2023-11-22",
      "end": "2023-11-29",
      "banner": "Summertime Trinity",
      "units": null,
      "note": ""
    },
    {
      "start": "2023-11-29",
      "end": "2023-12-13",
      "banner": "China",
      "units": null,
      "note": ""
    },
    {
      "start": "2023-12-13",
      "end": "2023-12-20",
      "banner": "Russia & Buns 1+2",
      "units": null,
      "note": ""
    },
    {
      "start": "2023-12-20",
      "end": "2023-12-27",
      "banner": "Buns 3+4",
      "units": null,
      "note": ""
    },
    {
      "start": "2023-12-27",
      "end": "2024-01-10",
      "banner": "SummerSRT",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-01-10",
      "end": "2024-01-17",
      "banner": "SummerGehenna",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-01-17",
      "end": "2024-01-24",
      "banner": "Nothing?",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-01-24",
      "end": "2024-01-31",
      "banner": "SummerAbydos + Wakamo",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-01-31",
      "end": "2024-02-07",
      "banner": "SummerTrinity FREE PULLS",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-02-07",
      "end": "2024-02-14",
      "banner": "SummerTrinity & Wakamo %UP",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-02-14",
      "end": "2024-02-21",
      "banner": "China (changed to Sumire&Eimi)",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-02-21",
      "end": "2024-02-28",
      "banner": "SummerHyakidakikado",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-02-28",
      "end": "2024-03-13",
      "banner": "Meru",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-03-13",
      "end": "2024-03-22",
      "banner": "Cheerleaders",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-03-22",
      "end": "2024-04-03",
      "banner": "Gym",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-04-04",
      "end": "2024-04-14",
      "banner": "Ichika & Kasumi",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-04-17",
      "end": "2024-04-24",
      "banner": "Red Winter Hot Springs",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-04-24",
      "end": "2024-04-30",
      "banner": "Shigure & Megu",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-04-30",
      "end": "2024-05-15",
      "banner": "Railgun Collab!",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-05-15",
      "end": "2024-05-22",
      "banner": "Yukari",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-05-22",
      "end": "2024-05-29",
      "banner": "Arius",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-05-29",
      "end": "2024-06-14",
      "banner": "Renge & Kikyou",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-06-14",
      "end": "2024-06-20",
      "banner": "S.Eimi & Himari",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-06-20",
      "end": "2024-06-27",
      "banner": "Sumire & Eimi",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-06-27",
      "end": "2024-07-04",
      "banner": "C&C (Bunnies)",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-07-04",
      "end": "2024-07-10",
      "banner": "Veritas (Camping)",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-07-10",
      "end": "2024-07-17",
      "banner": "Newyear rerun",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-07-17",
      "end": "2024-07-24",
      "banner": "Arius ",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-08-01",
      "end": "2024-08-08",
      "banner": "Gehenna FES",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-08-09",
      "end": "2024-08-18",
      "banner": "Gehenna FES part 2",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-08-18",
      "end": "2024-08-25",
      "banner": "Knights rerun (Christmas)",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-08-25",
      "end": "2024-09-01",
      "banner": "Chihiro & Mine",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-09-01",
      "end": "2024-09-14",
      "banner": "Problem solver (Dress)",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-09-14",
      "end": "2024-09-28",
      "banner": "Food Gehenna (New Year)",
      "units": null,
      "note": ""
    },
    {
      "start": "2024-09-28",
      "end": "2024-10-05",
      "banner": "Ui & Hinata",
      "units": null,
      "note": ""
    },
    {
      "start": null,
      "end": null,
      "banner": "~~",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-03-18",
      "end": "2025-04-01",
      "banner": "Kisaki & Reijo",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-04-01",
      "end": "2025-04-07",
      "banner": "Shanghaijing",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-04-07",
      "end": "2025-04-09",
      "banner": "Swimsuit reruns",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-04-09",
      "end": "2025-04-16",
      "banner": "Hyakkiyouran",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-04-16",
      "end": "2025-04-23",
      "banner": "*Limited* Idols",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-04-11",
      "end": "2025-04-18",
      "banner": "Hinata & Saori",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-04-18",
      "end": "2025-04-25",
      "banner": "*Limited* Gehenna Swimsuit",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-04-25",
      "end": "2025-05-08",
      "banner": "*Limited* Pandaemonium society",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-05-08",
      "end": "2025-05-15",
      "banner": "Kasumi & Ichika",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-05-15",
      "end": "2025-05-22",
      "banner": "Cheerleaders",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-05-22",
      "end": "2025-05-29",
      "banner": "*Limited* Sportswear",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-05-29",
      "end": "2025-06-13",
      "banner": "Pajama",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-06-13",
      "end": "2025-06-20",
      "banner": "*Limited* New year",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-06-20",
      "end": "2025-06-23",
      "banner": "Game Development maid",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-06-23",
      "end": "2025-06-30",
      "banner": "*Limited* Anniversary part 1",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-06-30",
      "end": "2025-07-06",
      "banner": "*Limited* Anniversary part 2",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-07-06",
      "end": "2025-07-13",
      "banner": "Himari & Eimi",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-07-13",
      "end": "2025-07-27",
      "banner": "Camping",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-07-27",
      "end": "2025-08-10",
      "banner": "Casual & Part-timers",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-08-10",
      "end": "2025-08-17",
      "banner": "Christmas Knights",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-08-17",
      "end": "2025-08-24",
      "banner": "*Limited* New year",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-08-24",
      "end": "2025-09-08",
      "banner": "Sports club",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-08-09",
      "end": "2025-08-16",
      "banner": "Saori",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-08-16",
      "end": "2025-08-23",
      "banner": "PS68",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-08-23",
      "end": "2025-08-30",
      "banner": "Shanghaijing",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-08-30",
      "end": "2025-09-13",
      "banner": "Highlanders",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-09-13",
      "end": "2025-09-20",
      "banner": "Arius",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-09-20",
      "end": "2025-09-27",
      "banner": "Guides",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-10-21",
      "end": "2025-11-04",
      "banner": "Nagusa / Niya",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-11-04",
      "end": "2025-11-18",
      "banner": "Band",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-11-18",
      "end": "2025-12-02",
      "banner": "Swimsuit reruns",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-12-02",
      "end": "2025-12-09",
      "banner": "Hyakkiyouran Swimsuits",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-12-09",
      "end": "2025-12-16",
      "banner": "SRT Swimsuits",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-12-16",
      "end": "2025-12-16",
      "banner": "FEST",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-12-23",
      "end": "2025-12-30",
      "banner": "FEST 2",
      "units": null,
      "note": ""
    },
    {
      "start": "2025-12-30",
      "end": "2026-01-06",
      "banner": "Valkyrie Swimsuits",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-01-06",
      "end": "2026-01-13",
      "banner": "Toki / Nagisa",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-01-13",
      "end": "2026-01-27",
      "banner": "Wildhunt",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-01-27",
      "end": "2026-02-10",
      "banner": "Arius Swimsuits",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-02-10",
      "end": "2026-02-17",
      "banner": "CnC Bunny Girls",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-02-17",
      "end": "2026-03-03",
      "banner": "Wildhunt",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-03-02",
      "end": "2026-03-03",
      "banner": "Wildhunt",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-03-03",
      "end": "2026-03-10",
      "banner": "Gehenna Swimsuit",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-03-10",
      "end": "2026-03-24",
      "banner": "Magical girls",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-03-24",
      "end": "2026-03-31",
      "banner": "SRT & Qipao",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-03-31",
      "end": "2026-04-07",
      "banner": "Trinity Swimsuits & New Arius",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-04-07",
      "end": "2026-04-21",
      "banner": "Red Winter Yakumo / Takane",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-04-21",
      "end": "2026-04-28",
      "banner": "Idol Rerun",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-04-28",
      "end": "2026-05-12",
      "banner": "Hyakkiyako Dress",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-05-12",
      "end": "2026-05-26",
      "banner": "Millenium Sportswear",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-05-12",
      "end": "2026-05-26",
      "banner": "Reijo / Kisaki",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-05-26",
      "end": "2026-06-09",
      "banner": "FEST 1",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-06-09",
      "end": "2026-06-16",
      "banner": "FEST 2",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-06-16",
      "end": "2026-06-23",
      "banner": "Intermission",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-06-23",
      "end": "2026-07-07",
      "banner": "Yuzu & Eimi Battle",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-07-07",
      "end": "2026-07-14",
      "banner": "Newyear rerun",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-07-07",
      "end": "2026-07-14",
      "banner": "Game Development maid",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-07-14",
      "end": "2026-07-21",
      "banner": "Newyear Limited",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-07-14",
      "end": "2026-07-21",
      "banner": "Pajama",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-07-21",
      "end": "2026-08-04",
      "banner": "Rena & Konoka",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-08-04",
      "end": "2026-08-18",
      "banner": "Rerun",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-08-18",
      "end": "2026-09-01",
      "banner": "SRT FOX",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-09-01",
      "end": "2026-09-08",
      "banner": "Newyear Rerun",
      "units": null,
      "note": ""
    },
    {
      "start": "2026-09-08",
      "end": "2026-09-15",
      "banner": "Erika",
      "units": null,
      "note": ""
    }
  ]
};
