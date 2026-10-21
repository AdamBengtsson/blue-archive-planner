/**
 * Loading and saving the planner state.
 *
 * Browser localStorage is the source of truth and always works offline.
 * Firebase, when configured, is a sync layer on top: it is read once on load
 * and written after every change. See firebase-logic.js.
 */

const STORAGE_KEY = "blueArchivePlanner.state.v1";

/** A fresh copy of the seed data, so edits never mutate the seed itself. */
function seedState() {
  return normaliseState(SEED_DATA);
}

/**
 * Gem counts used to be typed into an "Actual gems" column on banner rows.
 * They now live in their own dated log, so each row's count moves into the
 * log under that row's End date, and the field is dropped from the row.
 */
function migrateActualGems(rows, gemLog) {
  rows.forEach((row) => {
    if (typeof row.actualGems === "number" && row.end) {
      if (!gemLog.some((entry) => entry.date === row.end)) {
        gemLog.push({ date: row.end, gems: row.actualGems });
      }
    }
    delete row.actualGems;
  });
}

/** Fills in anything a saved state is missing, so old saves keep working. */
function normaliseState(state) {
  const base = SEED_DATA;
  const settings = Object.assign({}, base.settings, state.settings || {});
  // Income used to be one typed-in number; it is now estimated from gem logs.
  delete settings.monthlyIncome;
  const copy = (rows) => JSON.parse(JSON.stringify(rows));
  const planning = copy(Array.isArray(state.planning) ? state.planning : base.planning);
  const archive = copy(Array.isArray(state.archive) ? state.archive : base.archive);
  const gemLog = copy(Array.isArray(state.gemLog) ? state.gemLog : []);
  migrateActualGems(archive.concat(planning), gemLog);
  return { settings, planning, archive, gemLog: sortGemLog(gemLog) };
}

/** Oldest first, the order every gem log calculation expects. */
function sortGemLog(gemLog) {
  return gemLog.slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

/** Reads the saved state, falling back to the seed on first run or bad data. */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    return normaliseState(JSON.parse(raw));
  } catch (error) {
    console.warn("Could not read saved planner state, using seed data.", error);
    return seedState();
  }
}

/** Writes the state to localStorage and, if available, mirrors it to Firebase. */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Could not save planner state.", error);
  }
  if (typeof pushStateToCloud === "function") pushStateToCloud(state);
}

/** Throws away local changes and starts again from the migrated spreadsheet. */
function resetToSeed() {
  localStorage.removeItem(STORAGE_KEY);
  return seedState();
}

/** Offers the current state as a .json download, for backups. */
function exportState(state) {
  const stamp = formatDate(today());
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `blue-archive-planner-${stamp}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Reads a previously exported .json file back in. */
function importState(file) {
  return file.text().then((text) => normaliseState(JSON.parse(text)));
}
