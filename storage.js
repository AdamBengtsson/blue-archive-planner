/**
 * Loading and saving the planner state.
 *
 * With Firebase set up (firebase-config.js), the signed-in account's Firestore
 * document is where the state lives; see firebase-logic.js. Browser
 * localStorage is then only read once, to move data saved there before sign-in
 * existed into the account.
 *
 * Without Firebase, localStorage is the only store, as before.
 *
 * appMode, set in planner-ui.js, says which applies right now:
 *   local    Firebase not set up; this browser's storage
 *   owner    signed in; the account's cloud document
 *   public   signed out; only the banner forecast, nothing is saved
 *   empty    signed in, nothing saved for the account yet; nothing is saved
 *            until a backup is imported or old browser data is moved across
 *   denied   signed in with an account the rules keep out; nothing is saved
 */

const STORAGE_KEY = "blueArchivePlanner.state.v1";
const MOVED_KEY = "blueArchivePlanner.movedToCloud";

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
  // Rows used to carry their own cost per unit; every unit now costs the default.
  archive.concat(planning).forEach((row) => delete row.unitCost);
  const fixed = applyArchiveFixes(archive, gemLog);
  return { settings, planning, archive: fixed.archive, gemLog: sortGemLog(fixed.gemLog) };
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

/** The state saved in this browser before sign-in existed, or null when there is none. */
function loadLocalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normaliseState(JSON.parse(raw)) : null;
  } catch (error) {
    console.warn("Could not read the planner state saved in this browser.", error);
    return null;
  }
}

/**
 * Notes that this browser's data was copied into the cloud. The old copy is
 * left in place as a safety net, but it is never read again.
 */
function markMovedToCloud() {
  try {
    localStorage.setItem(MOVED_KEY, new Date().toISOString());
  } catch (error) {
    // Nothing to do: the data is in the cloud either way.
  }
}

/** Writes the state wherever the current mode keeps it. */
function saveState(state) {
  if (appMode === "owner") {
    cloudSave(state);
    return;
  }
  if (appMode !== "local") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Could not save planner state.", error);
  }
}

/** Throws away every change and starts again from the empty starting data. */
function resetToSeed() {
  if (appMode === "local") localStorage.removeItem(STORAGE_KEY);
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
