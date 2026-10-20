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
  return JSON.parse(JSON.stringify(SEED_DATA));
}

/** Fills in anything a saved state is missing, so old saves keep working. */
function normaliseState(state) {
  const base = seedState();
  return {
    settings: Object.assign({}, base.settings, state.settings || {}),
    planning: Array.isArray(state.planning) ? state.planning : base.planning,
    archive: Array.isArray(state.archive) ? state.archive : base.archive
  };
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
