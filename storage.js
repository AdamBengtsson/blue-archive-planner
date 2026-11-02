/**
 * The planner state: starting data, tidying a loaded state, and JSON backups.
 *
 * The signed-in account's Firestore document is where the state is saved; see
 * firebase-logic.js. Nothing is kept in the browser.
 *
 * appMode, set in planner-ui.js, says what the page is showing right now:
 *   public   signed out; only the banner forecast, nothing is saved
 *   owner    signed in; the account's cloud document
 *   empty    signed in, nothing saved for the account yet; nothing is saved
 *            until a backup is imported
 *   denied   signed in with an account the rules keep out; nothing is saved
 */

/** A fresh copy of the seed data, so edits never mutate the seed itself. */
function seedState() {
  return normaliseState(SEED_DATA);
}

/** Fills in anything a saved state is missing and applies the archive fixes. */
function normaliseState(state) {
  const base = SEED_DATA;
  const settings = Object.assign({}, base.settings, state.settings || {});
  const copy = (rows) => JSON.parse(JSON.stringify(rows));
  const planning = copy(Array.isArray(state.planning) ? state.planning : base.planning);
  const archive = copy(Array.isArray(state.archive) ? state.archive : base.archive);
  const gemLog = copy(Array.isArray(state.gemLog) ? state.gemLog : []);
  const fixed = applyArchiveFixes(archive, gemLog);
  return { settings, planning, archive: fixed.archive, gemLog: sortGemLog(fixed.gemLog) };
}

/** Oldest first, the order every gem log calculation expects. */
function sortGemLog(gemLog) {
  return gemLog.slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

/** Saves the state to the account. Only the owner's own data is ever saved. */
function saveState(state) {
  if (appMode === "owner") cloudSave(state);
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
