/**
 * Seed data migrated from Blue_Archive_Gem_Planner.xlsx.
 *
 * This is the starting content the app loads the very first time it runs
 * (or after "Reset to seed data"). Once the user has saved anything, the
 * copy in browser storage wins and this file is no longer read.
 *
 *   settings  one-time starting gem count/date, monthly income, unit cost
 *   planning  current and upcoming banners, earliest first
 *   archive   past banners, kept only for looking back at
 */
const SEED_DATA = {
  "settings": {
    "startingGems": 63835,
    "startingDate": "2026-09-24",
    "monthlyIncome": 13000,
    "defaultUnitCost": 24000,
    "staleDays": 14
  },
  "planning": [
    {
      "start": "2026-09-15",
      "end": "2026-09-29",
      "banner": "Problem Solver Dress",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-09-29",
      "end": "2026-10-06",
      "banner": "Nagusa Swimsuit",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-10-06",
      "end": "2026-10-13",
      "banner": "Band Rerun",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-10-13",
      "end": "2026-10-27",
      "banner": "Kisaki & Shun Swimsuits",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-10-27",
      "end": "2026-11-10",
      "banner": "Limited Reruns",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-11-10",
      "end": "2026-11-17",
      "banner": "Limited Reruns",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-11-17",
      "end": "2026-11-24",
      "banner": "Makoto & Satsuki Swimsuits",
      "units": 2,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-11-24",
      "end": "2026-12-01",
      "banner": "Iroha & Ibuki Swimsuits",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-12-01",
      "end": "2026-12-15",
      "banner": "Casual Rerun",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-12-15",
      "end": "2026-12-29",
      "banner": "Odyssey Maritime School",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-12-29",
      "end": "2027-01-12",
      "banner": "Swimsuit Reruns",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2027-01-12",
      "end": "2027-01-26",
      "banner": "Red Winter Engineers",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    }
  ],
  "archive": [
    {
      "start": "2023-11-22",
      "end": "2023-11-29",
      "banner": "Summertime Trinity",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2023-11-29",
      "end": "2023-12-13",
      "banner": "China",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "Income 140160"
    },
    {
      "start": "2023-12-13",
      "end": "2023-12-20",
      "banner": "Russia & Buns 1+2",
      "units": 2,
      "unitCost": null,
      "actualGems": 118485,
      "note": "2 Unit 92160"
    },
    {
      "start": "2023-12-20",
      "end": "2023-12-27",
      "banner": "Buns 3+4",
      "units": 2,
      "unitCost": null,
      "actualGems": 99373,
      "note": "2 Unit 44160"
    },
    {
      "start": "2023-12-27",
      "end": "2024-01-10",
      "banner": "SummerSRT",
      "units": 2,
      "unitCost": null,
      "actualGems": null,
      "note": "2 Unit 9160 Date auto-fixed (day/month swap): end was 2024-10-01"
    },
    {
      "start": "2024-01-10",
      "end": "2024-01-17",
      "banner": "SummerGehenna",
      "units": null,
      "unitCost": null,
      "actualGems": 101700,
      "note": "Date auto-fixed (day/month swap): start was 2024-10-01"
    },
    {
      "start": "2024-01-17",
      "end": "2024-01-24",
      "banner": "Nothing?",
      "units": null,
      "unitCost": null,
      "actualGems": 104675,
      "note": ""
    },
    {
      "start": "2024-01-24",
      "end": "2024-01-31",
      "banner": "SummerAbydos + Wakamo",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "CALCULATION"
    },
    {
      "start": "2024-01-31",
      "end": "2024-02-07",
      "banner": "SummerTrinity FREE PULLS",
      "units": 1,
      "unitCost": null,
      "actualGems": 108052,
      "note": "1 Unit 100435 Date auto-fixed (day/month swap): end was 2024-07-02"
    },
    {
      "start": "2024-02-07",
      "end": "2024-02-14",
      "banner": "SummerTrinity & Wakamo %UP",
      "units": 1,
      "unitCost": null,
      "actualGems": null,
      "note": "1 Unit 76435 Date auto-fixed (day/month swap): start was 2024-07-02"
    },
    {
      "start": "2024-02-14",
      "end": "2024-02-21",
      "banner": "China (changed to Sumire&Eimi)",
      "units": null,
      "unitCost": null,
      "actualGems": 88717,
      "note": ""
    },
    {
      "start": "2024-02-21",
      "end": "2024-02-28",
      "banner": "SummerHyakidakikado",
      "units": null,
      "unitCost": null,
      "actualGems": 94593,
      "note": ""
    },
    {
      "start": "2024-02-28",
      "end": "2024-03-13",
      "banner": "Meru",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2024-03-13",
      "end": "2024-03-22",
      "banner": "Cheerleaders",
      "units": null,
      "unitCost": null,
      "actualGems": 104574,
      "note": ""
    },
    {
      "start": "2024-03-22",
      "end": "2024-04-03",
      "banner": "Gym",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "Date auto-fixed (day/month swap): end was 2024-03-04"
    },
    {
      "start": "2024-04-04",
      "end": "2024-04-14",
      "banner": "Ichika & Kasumi",
      "units": null,
      "unitCost": null,
      "actualGems": 115844,
      "note": ""
    },
    {
      "start": "2024-04-17",
      "end": "2024-04-24",
      "banner": "Red Winter Hot Springs",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2024-04-24",
      "end": "2024-04-30",
      "banner": "Shigure & Megu",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2024-04-30",
      "end": "2024-05-15",
      "banner": "Railgun Collab!",
      "units": 2,
      "unitCost": null,
      "actualGems": 113147,
      "note": "2 Unit 54435"
    },
    {
      "start": "2024-05-15",
      "end": "2024-05-22",
      "banner": "Yukari",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "CALCULATION"
    },
    {
      "start": "2024-05-22",
      "end": "2024-05-29",
      "banner": "Arius",
      "units": 1,
      "unitCost": null,
      "actualGems": null,
      "note": "1 Unit 85838"
    },
    {
      "start": "2024-05-29",
      "end": "2024-06-14",
      "banner": "Renge & Kikyou",
      "units": null,
      "unitCost": null,
      "actualGems": 82545,
      "note": ""
    },
    {
      "start": "2024-06-14",
      "end": "2024-06-20",
      "banner": "S.Eimi & Himari",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2024-06-20",
      "end": "2024-06-27",
      "banner": "Sumire & Eimi",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2024-06-27",
      "end": "2024-07-04",
      "banner": "C&C (Bunnies)",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "Date auto-fixed (day/month swap): end was 2024-04-07"
    },
    {
      "start": "2024-07-04",
      "end": "2024-07-10",
      "banner": "Veritas (Camping)",
      "units": null,
      "unitCost": null,
      "actualGems": 89675,
      "note": "Date auto-fixed (day/month swap): start was 2024-04-07, end was 2024-10-07"
    },
    {
      "start": "2024-07-10",
      "end": "2024-07-17",
      "banner": "Newyear rerun",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "Date auto-fixed (day/month swap): start was 2024-10-07"
    },
    {
      "start": "2024-07-17",
      "end": "2024-07-24",
      "banner": "Arius ",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2024-08-01",
      "end": "2024-08-08",
      "banner": "Gehenna FES",
      "units": 2,
      "unitCost": null,
      "actualGems": null,
      "note": "2 Unit 76838 Date auto-fixed (day/month swap): start was 2024-01-08; CHECK: expected gems looks too high (typo?)"
    },
    {
      "start": "2024-08-09",
      "end": "2024-08-18",
      "banner": "Gehenna FES part 2",
      "units": 2,
      "unitCost": null,
      "actualGems": null,
      "note": "2 Unit 52838 Date auto-fixed (day/month swap): start was 2024-09-08"
    },
    {
      "start": "2024-08-18",
      "end": "2024-08-25",
      "banner": "Knights rerun (Christmas)",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2024-08-25",
      "end": "2024-09-01",
      "banner": "Chihiro & Mine",
      "units": null,
      "unitCost": null,
      "actualGems": 74414,
      "note": "Date auto-fixed (day/month swap): end was 2024-01-09"
    },
    {
      "start": "2024-09-01",
      "end": "2024-09-14",
      "banner": "Problem solver (Dress)",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2024-09-14",
      "end": "2024-09-28",
      "banner": "Food Gehenna (New Year)",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2024-09-28",
      "end": "2024-10-05",
      "banner": "Ui & Hinata",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "Date auto-fixed (day/month swap): end was 2024-05-10"
    },
    {
      "start": null,
      "end": null,
      "banner": "~~",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "CALCULATION"
    },
    {
      "start": "2025-03-18",
      "end": "2025-04-01",
      "banner": "Kisaki & Reijo",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-04-01",
      "end": "2025-04-07",
      "banner": "Shanghaijing",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-04-07",
      "end": "2025-04-09",
      "banner": "Swimsuit reruns",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-04-09",
      "end": "2025-04-16",
      "banner": "Hyakkiyouran",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-04-16",
      "end": "2025-04-23",
      "banner": "*Limited* Idols",
      "units": 1,
      "unitCost": null,
      "actualGems": 99928,
      "note": "1 unit 99403"
    },
    {
      "start": "2025-04-11",
      "end": "2025-04-18",
      "banner": "Hinata & Saori",
      "units": null,
      "unitCost": null,
      "actualGems": 104562,
      "note": ""
    },
    {
      "start": "2025-04-18",
      "end": "2025-04-25",
      "banner": "*Limited* Gehenna Swimsuit",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-04-25",
      "end": "2025-05-08",
      "banner": "*Limited* Pandaemonium society",
      "units": 2,
      "unitCost": null,
      "actualGems": 90000,
      "note": "2 unit 64403"
    },
    {
      "start": "2025-05-08",
      "end": "2025-05-15",
      "banner": "Kasumi & Ichika",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-05-15",
      "end": "2025-05-22",
      "banner": "Cheerleaders",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-05-22",
      "end": "2025-05-29",
      "banner": "*Limited* Sportswear",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-05-29",
      "end": "2025-06-13",
      "banner": "Pajama",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-06-13",
      "end": "2025-06-20",
      "banner": "*Limited* New year",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-06-20",
      "end": "2025-06-23",
      "banner": "Game Development maid",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-06-23",
      "end": "2025-06-30",
      "banner": "*Limited* Anniversary part 1",
      "units": 2,
      "unitCost": null,
      "actualGems": null,
      "note": "2 unit 29403"
    },
    {
      "start": "2025-06-30",
      "end": "2025-07-06",
      "banner": "*Limited* Anniversary part 2",
      "units": 2,
      "unitCost": null,
      "actualGems": null,
      "note": "2 unit -6403"
    },
    {
      "start": "2025-07-06",
      "end": "2025-07-13",
      "banner": "Himari & Eimi",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "CALCULATION"
    },
    {
      "start": "2025-07-13",
      "end": "2025-07-27",
      "banner": "Camping",
      "units": null,
      "unitCost": null,
      "actualGems": 70000,
      "note": ""
    },
    {
      "start": "2025-07-27",
      "end": "2025-08-10",
      "banner": "Casual & Part-timers",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-08-10",
      "end": "2025-08-17",
      "banner": "Christmas Knights",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-08-17",
      "end": "2025-08-24",
      "banner": "*Limited* New year",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-08-24",
      "end": "2025-09-08",
      "banner": "Sports club",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-08-09",
      "end": "2025-08-16",
      "banner": "Saori",
      "units": 1,
      "unitCost": null,
      "actualGems": null,
      "note": "1 unit 65000"
    },
    {
      "start": "2025-08-16",
      "end": "2025-08-23",
      "banner": "PS68",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-08-23",
      "end": "2025-08-30",
      "banner": "Shanghaijing",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-08-30",
      "end": "2025-09-13",
      "banner": "Highlanders",
      "units": 2,
      "unitCost": null,
      "actualGems": 72483,
      "note": "2 unit 30000"
    },
    {
      "start": "2025-09-13",
      "end": "2025-09-20",
      "banner": "Arius",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-09-20",
      "end": "2025-09-27",
      "banner": "Guides",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-10-21",
      "end": "2025-11-04",
      "banner": "Nagusa / Niya",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-11-04",
      "end": "2025-11-18",
      "banner": "Band",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-11-18",
      "end": "2025-12-02",
      "banner": "Swimsuit reruns",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-12-02",
      "end": "2025-12-09",
      "banner": "Hyakkiyouran Swimsuits",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-12-09",
      "end": "2025-12-16",
      "banner": "SRT Swimsuits",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2025-12-16",
      "end": "2025-12-16",
      "banner": "FEST",
      "units": 2,
      "unitCost": null,
      "actualGems": null,
      "note": "2 unit 21000"
    },
    {
      "start": "2025-12-23",
      "end": "2025-12-30",
      "banner": "FEST 2",
      "units": 2,
      "unitCost": null,
      "actualGems": null,
      "note": "2 unit -27000"
    },
    {
      "start": "2025-12-30",
      "end": "2026-01-06",
      "banner": "Valkyrie Swimsuits",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "CALCULATION"
    },
    {
      "start": "2026-01-06",
      "end": "2026-01-13",
      "banner": "Toki / Nagisa",
      "units": null,
      "unitCost": null,
      "actualGems": 89200,
      "note": ""
    },
    {
      "start": "2026-01-13",
      "end": "2026-01-27",
      "banner": "Wildhunt",
      "units": 1,
      "unitCost": null,
      "actualGems": null,
      "note": "1 unit 66200"
    },
    {
      "start": "2026-01-27",
      "end": "2026-02-10",
      "banner": "Arius Swimsuits",
      "units": 1,
      "unitCost": null,
      "actualGems": null,
      "note": "1 unit 36200"
    },
    {
      "start": "2026-02-10",
      "end": "2026-02-17",
      "banner": "CnC Bunny Girls",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-02-17",
      "end": "2026-03-03",
      "banner": "Wildhunt",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-03-02",
      "end": "2026-03-03",
      "banner": "Wildhunt",
      "units": null,
      "unitCost": null,
      "actualGems": 82664,
      "note": ""
    },
    {
      "start": "2026-03-03",
      "end": "2026-03-10",
      "banner": "Gehenna Swimsuit",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-03-10",
      "end": "2026-03-24",
      "banner": "Magical girls",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-03-24",
      "end": "2026-03-31",
      "banner": "SRT & Qipao",
      "units": null,
      "unitCost": null,
      "actualGems": 72788,
      "note": ""
    },
    {
      "start": "2026-03-31",
      "end": "2026-04-07",
      "banner": "Trinity Swimsuits & New Arius",
      "units": null,
      "unitCost": null,
      "actualGems": 78193,
      "note": ""
    },
    {
      "start": "2026-04-07",
      "end": "2026-04-21",
      "banner": "Red Winter Yakumo / Takane",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-04-21",
      "end": "2026-04-28",
      "banner": "Idol Rerun",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-04-28",
      "end": "2026-05-12",
      "banner": "Hyakkiyako Dress",
      "units": null,
      "unitCost": null,
      "actualGems": 68398,
      "note": ""
    },
    {
      "start": "2026-05-12",
      "end": "2026-05-26",
      "banner": "Millenium Sportswear",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-05-12",
      "end": "2026-05-26",
      "banner": "Reijo / Kisaki",
      "units": null,
      "unitCost": null,
      "actualGems": 84338,
      "note": ""
    },
    {
      "start": "2026-05-26",
      "end": "2026-06-09",
      "banner": "FEST 1",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-06-09",
      "end": "2026-06-16",
      "banner": "FEST 2",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": ""
    },
    {
      "start": "2026-06-16",
      "end": "2026-06-23",
      "banner": "Intermission",
      "units": 0,
      "unitCost": null,
      "actualGems": null,
      "note": "Moved from Planning on 2026-09-23"
    },
    {
      "start": "2026-06-23",
      "end": "2026-07-07",
      "banner": "Yuzu & Eimi Battle",
      "units": 1,
      "unitCost": null,
      "actualGems": null,
      "note": "Moved from Planning on 2026-09-24"
    },
    {
      "start": "2026-07-07",
      "end": "2026-07-14",
      "banner": "Newyear rerun",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "Moved from Planning on 2026-09-24"
    },
    {
      "start": "2026-07-07",
      "end": "2026-07-14",
      "banner": "Game Development maid",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "Moved from Planning on 2026-09-24"
    },
    {
      "start": "2026-07-14",
      "end": "2026-07-21",
      "banner": "Newyear Limited",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "Moved from Planning on 2026-09-24"
    },
    {
      "start": "2026-07-14",
      "end": "2026-07-21",
      "banner": "Pajama",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "Moved from Planning on 2026-09-24"
    },
    {
      "start": "2026-07-21",
      "end": "2026-08-04",
      "banner": "Rena & Konoka",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "Moved from Planning on 2026-09-24"
    },
    {
      "start": "2026-08-04",
      "end": "2026-08-18",
      "banner": "Rerun",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "Moved from Planning on 2026-09-24"
    },
    {
      "start": "2026-08-18",
      "end": "2026-09-01",
      "banner": "SRT FOX",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "Moved from Planning on 2026-09-24"
    },
    {
      "start": "2026-09-01",
      "end": "2026-09-08",
      "banner": "Newyear Rerun",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "Moved from Planning on 2026-09-24"
    },
    {
      "start": "2026-09-08",
      "end": "2026-09-15",
      "banner": "Erika",
      "units": null,
      "unitCost": null,
      "actualGems": null,
      "note": "Moved from Planning on 2026-09-24"
    }
  ]
};
