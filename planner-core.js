/**
 * Pure planning maths. No DOM, no storage, no side effects.
 *
 * This is a port of the formulas that used to live in the Planning columns of
 * Blue_Archive_Gem_Planner.xlsx, so the rules it encodes are the ones from the
 * spreadsheet's "How to use" tab:
 *
 *  - Your gem anchor is the most recent entry in the gem log, falling back
 *    to the one-time starting count until you have logged anything. A banner
 *    that had already started on the day you logged counts as paid for.
 *  - Income is not typed in. It is estimated from your own gem logs: how much
 *    the count rose between logs, plus what the banners in between cost (see
 *    estimateIncome). Each row then earns that daily rate for the days since
 *    the previous counted End date, so nothing before the anchor counts twice.
 *  - A banner is still to be paid until its End date has passed.
 *  - "Lowest balance from here on" looks forward to the end of the plan, so a
 *    row is only safe if everything after it fits too.
 */

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

/**
 * Calendar days from one date to another. Done in UTC so a daylight saving
 * change in between never loses or gains a day.
 */
function calendarDays(from, to) {
  const utc = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((utc(to) - utc(from)) / 86400000);
}

/** Average days in a month, for turning a daily rate into a monthly one. */
const DAYS_PER_MONTH = 365.25 / 12;

/** Whole days between two dates, rounded down. */
function daysBetween(from, to) {
  return Math.floor((to - from) / 86400000);
}

/**
 * Every gem count you have logged, oldest first, as { date, gems, logged }:
 * the starting count from settings plus each gem log entry. Two counts on the
 * same day keep the gem log one.
 */
function collectGemLogs(gemLog, settings) {
  const byDate = new Map();
  const start = parseDate(settings.startingDate);
  if (start && typeof settings.startingGems === "number") {
    byDate.set(formatDate(start), { date: start, gems: settings.startingGems, logged: false });
  }
  (gemLog || []).forEach((entry) => {
    const date = parseDate(entry.date);
    if (date && typeof entry.gems === "number") {
      byDate.set(formatDate(date), { date, gems: entry.gems, logged: true });
    }
  });
  return Array.from(byDate.values()).sort((a, b) => a.date - b.date);
}

/**
 * Finds the gem anchor: the latest logged count, or the one-time starting
 * count from settings when nothing newer has been logged.
 */
function findAnchor(gemLog, settings) {
  const logs = collectGemLogs(gemLog, settings);
  const latest = logs[logs.length - 1];
  if (latest) return latest;
  return { gems: settings.startingGems, date: parseDate(settings.startingDate), logged: false };
}

/**
 * The date a banner's spend is booked on: its start, since a banner that is
 * live when you log is assumed to be pulled on already. Falls back to the end
 * for rows with no start date.
 */
function spendDate(row) {
  return parseDate(row.start) || parseDate(row.end);
}

/**
 * Estimates income from the gem logs.
 *
 * Between two logs, earned = (later count - earlier count) + spend, where
 * spend is the units on every banner that started in between at the default
 * cost. The rate is the total earned over the total days, across the gaps
 * that end inside the lookback window, so a long gap weighs more than a short
 * one and one odd week cannot swing the whole plan.
 *
 * `rows` should be every banner you have, archive included, so the spend
 * between older logs is known. Returns the daily and monthly rate plus the
 * gaps used, so the UI can show its working; rates are null with fewer than
 * two logs.
 */
function estimateIncome(rows, gemLog, settings) {
  const logs = collectGemLogs(gemLog, settings);
  const spent = rows
    .map((row) => ({ date: spendDate(row), units: typeof row.units === "number" ? row.units : 0 }))
    .filter((item) => item.date && item.units > 0);

  const gaps = [];
  for (let i = 1; i < logs.length; i += 1) {
    const from = logs[i - 1];
    const to = logs[i];
    const days = calendarDays(from.date, to.date);
    const spend = spent
      .filter((item) => item.date > from.date && item.date <= to.date)
      .reduce((sum, item) => sum + item.units * settings.defaultUnitCost, 0);
    const change = to.gems - from.gems;
    gaps.push({ from: from.date, to: to.date, days, change, spend, earned: change + spend, used: false });
  }

  // Only gaps ending within the lookback window count. With too little recent
  // history, fall back to every gap rather than giving no estimate at all.
  const latest = logs.length ? logs[logs.length - 1].date : null;
  let used = [];
  if (latest) {
    const cutoff = new Date(latest);
    cutoff.setMonth(cutoff.getMonth() - (settings.incomeLookbackMonths || 12));
    used = gaps.filter((gap) => gap.to > cutoff);
    if (used.length === 0) used = gaps;
  }
  used.forEach((gap) => {
    gap.used = true;
  });

  const days = used.reduce((sum, gap) => sum + gap.days, 0);
  const earned = used.reduce((sum, gap) => sum + gap.earned, 0);
  const perDay = days > 0 ? earned / days : null;
  return {
    perDay,
    perMonth: perDay === null ? null : perDay * DAYS_PER_MONTH,
    days,
    since: used.length ? used[0].from : null,
    logCount: logs.length,
    gaps
  };
}

/**
 * Runs the whole projection over a list of banner rows.
 *
 * Returns one computed object per input row (same order, same length) plus the
 * anchor that was used, so the UI can show where the numbers are counting from.
 * Rows are expected to already be in date order, earliest first.
 */
function computePlan(rows, gemLog, settings, perDay) {
  const anchor = findAnchor(gemLog, settings);
  const now = today();
  const rate = perDay > 0 ? perDay : 0;

  let incomeSoFar = 0;
  let spendSoFar = 0;
  let highWater = anchor.date; // latest End date income has been counted up to
  const computed = [];

  rows.forEach((row) => {
    const start = parseDate(row.start);
    const end = parseDate(row.end);
    const units = typeof row.units === "number" ? row.units : 0;
    // Every unit costs the default, the worst case.
    const unitCost = settings.defaultUnitCost;

    // Each row earns the daily rate for the days since the latest End date
    // already counted. A row ending inside an earlier, longer banner earns
    // nothing extra. Rounding the running total keeps the rows adding up.
    let income = 0;
    if (end && highWater && end > highWater) {
      const totalDays = calendarDays(anchor.date, end);
      income = Math.round(rate * totalDays) - incomeSoFar;
      highWater = end;
    }

    // Banners that had started by the anchor date are already paid for: their
    // cost is assumed to be reflected in the logged gem count already.
    const paidFrom = spendDate(row);
    const countsSpend = Boolean(paidFrom) && Boolean(anchor.date) && paidFrom > anchor.date;
    // Rows that ended before the anchor are history and show no projection.
    // A row live on the anchor date still shows one.
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
      isAnchorRow: Boolean(anchor.date && start && end && start <= anchor.date && end >= anchor.date),
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
