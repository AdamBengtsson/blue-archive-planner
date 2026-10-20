/**
 * Pure planning maths. No DOM, no storage, no side effects.
 *
 * This is a port of the formulas that used to live in the Planning columns of
 * Blue_Archive_Gem_Planner.xlsx, so the rules it encodes are the ones from the
 * spreadsheet's "How to use" tab:
 *
 *  - Your gem anchor is the most recent "Actual gems" you logged, falling back
 *    to the one-time starting count until you have logged anything.
 *  - Monthly income lands on the banner whose End date is the first to reach
 *    into a new month, and never for the month the anchor itself is from
 *    (that income is assumed already inside the logged count).
 *  - A banner is still to be paid until its End date has passed.
 *  - "Lowest balance from here on" looks forward to the end of the plan, so a
 *    row is only safe if everything after it fits too.
 */

/** Months since year 0, so month boundaries can be counted by subtraction. */
function monthIndex(date) {
  return date.getFullYear() * 12 + date.getMonth();
}

/** Parses a yyyy-mm-dd string as a local date. Returns null for blanks. */
function parseDate(value) {
  if (!value) return null;
  const [y, m, d] = String(value).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** Formats a Date back to yyyy-mm-dd, the only date format this app uses. */
function formatDate(date) {
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Today at midnight, so date comparisons ignore the time of day. */
function today() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/** Whole days between two dates, rounded down. */
function daysBetween(from, to) {
  return Math.floor((to - from) / 86400000);
}

/**
 * Finds the gem anchor: the last row (in list order) with a logged gem count.
 * Falls back to the one-time starting count from settings.
 */
function findAnchor(rows, settings) {
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const row = rows[i];
    if (typeof row.actualGems === "number" && row.end) {
      return { gems: row.actualGems, date: parseDate(row.end), rowIndex: i, logged: true };
    }
  }
  return {
    gems: settings.startingGems,
    date: parseDate(settings.startingDate),
    rowIndex: -1,
    logged: false
  };
}

/**
 * Runs the whole projection over a list of banner rows.
 *
 * Returns one computed object per input row (same order, same length) plus the
 * anchor that was used, so the UI can show where the numbers are counting from.
 * Rows are expected to already be in date order, earliest first.
 */
function computePlan(rows, settings) {
  const anchor = findAnchor(rows, settings);
  const anchorMonth = anchor.date ? monthIndex(anchor.date) : -Infinity;
  const now = today();

  let incomeSoFar = 0;
  let spendSoFar = 0;
  let highWaterMonth = anchorMonth; // latest month boundary already paid out
  const computed = [];

  rows.forEach((row) => {
    const start = parseDate(row.start);
    const end = parseDate(row.end);
    const units = typeof row.units === "number" ? row.units : 0;
    // Per-row cost disabled: planning always assumes the default (worst-case) cost.
    // const unitCost = typeof row.unitCost === "number" ? row.unitCost : settings.defaultUnitCost;
    const unitCost = settings.defaultUnitCost;

    // Income arrives on the row whose End date is the first to reach a new month.
    let income = 0;
    if (end) {
      const months = monthIndex(end) - highWaterMonth;
      if (months > 0) {
        income = settings.monthlyIncome * months;
        highWaterMonth = monthIndex(end);
      }
    }

    // Banners that ended on or before the anchor date are already paid for:
    // their cost is assumed to be reflected in the logged gem count already.
    const countsSpend = Boolean(end) && Boolean(anchor.date) && end > anchor.date;
    // Rows that ended before the anchor are history and show no projection.
    // The anchor row itself still shows one, which is simply your logged count.
    const inProjection = !end || !anchor.date || end >= anchor.date;
    const plannedSpend = units * unitCost;

    incomeSoFar += income;
    if (countsSpend) spendSoFar += plannedSpend;

    const expectedAfter = inProjection ? anchor.gems + incomeSoFar - spendSoFar : null;

    computed.push({
      row,
      start,
      end,
      units,
      unitCost,
      plannedSpend,
      income,
      expectedAfter,
      isPast: Boolean(end && end < now),
      isNewMonth: income > 0,
      isAnchorRow: computed.length === anchor.rowIndex,
      lowestAhead: null,
      roomForExtra: ""
    });
  });

  // "Lowest balance from here on" is a backwards running minimum, so it has to
  // be filled in on a second pass once every expectedAfter is known.
  let lowest = null;
  for (let i = computed.length - 1; i >= 0; i -= 1) {
    const item = computed[i];
    if (item.expectedAfter === null) continue;
    lowest = lowest === null ? item.expectedAfter : Math.min(lowest, item.expectedAfter);
    item.lowestAhead = lowest;
    item.roomForExtra = describeRoom(lowest, settings.defaultUnitCost);
  }

  return { rows: computed, anchor };
}

/** Turns a lowest-balance number into the wording the old sheet used. */
function describeRoom(lowest, unitCost) {
  if (lowest === null) return "";
  if (lowest < 0) return `Short by ${Math.abs(lowest).toLocaleString("en-US")}`;
  const spare = Math.floor(lowest / unitCost);
  if (spare < 1) return "";
  return `Room for +${spare} ${spare > 1 ? "units" : "unit"}`;
}

/**
 * Splits rows into those still worth planning and those whose End date has
 * passed. The old Apps Script did this move on a daily trigger; here it runs
 * whenever the app loads.
 */
function splitPastRows(rows) {
  const now = today();
  const keep = [];
  const past = [];
  rows.forEach((row) => {
    const end = parseDate(row.end);
    if (end && end < now) past.push(row);
    else keep.push(row);
  });
  return { keep, past };
}

/** Sorts banner rows by start date, then end date. Undated rows sink to the end. */
function sortRows(rows) {
  return rows.slice().sort((a, b) => {
    const as = parseDate(a.start) || parseDate(a.end);
    const bs = parseDate(b.start) || parseDate(b.end);
    if (!as && !bs) return 0;
    if (!as) return 1;
    if (!bs) return -1;
    if (as - bs !== 0) return as - bs;
    const ae = parseDate(a.end) || as;
    const be = parseDate(b.end) || bs;
    return ae - be;
  });
}
