/**
 * Everything that touches the page: rendering the tables, reading the inputs,
 * and saving after each change.
 *
 * The state shape is { settings, planning, archive } — see seed-data.js.
 * Planning rows are the only editable ones; archive rows are read-only.
 */

let state = loadState();

const el = (id) => document.getElementById(id);
const gems = (n) => (typeof n === "number" ? Math.round(n).toLocaleString("en-US") : "");

/** An empty banner row, used by "Add banner". */
function blankRow() {
  return { start: "", end: "", banner: "", units: null, unitCost: null, actualGems: null, note: "" };
}

/** Reads a numeric input, treating an empty field as "not set" rather than 0. */
function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Saves and redraws. Called after every edit. */
function commit(message) {
  saveState(state);
  render();
  if (message) flash(message);
}

/** Briefly shows a line of text next to the toolbar buttons. */
let flashTimer = null;
function flash(message) {
  const status = el("saveStatus");
  status.textContent = message;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => {
    status.textContent = "";
  }, 2500);
}

/** The income estimate, worked out from every row with a gem log, archive included. */
function currentEstimate() {
  return estimateIncome(state.archive.concat(state.planning), state.settings);
}

/* Rendering ------------------------------------------------------------ */

/** Builds one editable input cell bound to a field on a planning row. */
function inputCell(row, field, type, className) {
  const td = document.createElement("td");
  td.className = className;
  const input = document.createElement("input");
  input.type = type;
  input.className = "entry";
  const value = row[field];
  input.value = value === null || value === undefined ? "" : value;
  if (type === "number") input.step = "1";

  input.addEventListener("change", () => {
    row[field] = type === "number" ? numberOrNull(input.value) : input.value;
    // Re-sorting on every keystroke would move the field out from under the
    // cursor, so dates only trigger a sort once the field is left.
    if (field === "start" || field === "end") state.planning = sortRows(state.planning);
    commit();
  });

  td.appendChild(input);
  return td;
}

/** Builds one read-only calculated cell. */
function calcCell(text, className) {
  const td = document.createElement("td");
  td.className = "calc";
  if (className) {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    td.appendChild(span);
  } else {
    td.textContent = text;
  }
  return td;
}

function renderPlanning(estimate) {
  const body = el("planningBody");
  body.textContent = "";
  const { rows } = computePlan(state.planning, state.settings, estimate.perDay);

  rows.forEach((item, index) => {
    const row = item.row;
    const tr = document.createElement("tr");
    if (item.isNewMonth) tr.classList.add("new-month");
    if (item.isPast) tr.classList.add("past");
    if (item.isAnchorRow) tr.classList.add("anchor");

    tr.appendChild(inputCell(row, "start", "date", "col-date"));
    tr.appendChild(inputCell(row, "end", "date", "col-date"));
    tr.appendChild(inputCell(row, "banner", "text", "col-banner"));
    tr.appendChild(inputCell(row, "units", "number", "col-num"));
    // Per-row cost disabled: planning always assumes the default cost.
    // tr.appendChild(inputCell(row, "unitCost", "number", "col-num"));
    tr.appendChild(calcCell(item.plannedSpend ? gems(item.plannedSpend) : ""));
    tr.appendChild(calcCell(item.income ? gems(item.income) : ""));
    tr.appendChild(
      calcCell(
        item.expectedAfter === null ? "" : gems(item.expectedAfter),
        item.expectedAfter !== null && item.expectedAfter < 0 ? "negative" : ""
      )
    );
    tr.appendChild(inputCell(row, "actualGems", "number", "col-gems"));
    tr.appendChild(
      calcCell(
        item.lowestAhead === null ? "" : gems(item.lowestAhead),
        item.lowestAhead !== null && item.lowestAhead < 0 ? "negative" : ""
      )
    );
    tr.appendChild(
      calcCell(item.roomForExtra, item.roomForExtra.startsWith("Short") ? "short" : "room")
    );

    const actions = document.createElement("td");
    const remove = document.createElement("button");
    remove.className = "link";
    remove.textContent = "✕";
    remove.title = "Delete this banner";
    remove.addEventListener("click", () => {
      state.planning.splice(index, 1);
      commit("Banner deleted.");
    });
    actions.appendChild(remove);
    tr.appendChild(actions);

    body.appendChild(tr);
  });

  if (rows.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 12;
    td.className = "empty";
    td.textContent = "No banners planned yet. Add one to get started.";
    tr.appendChild(td);
    body.appendChild(tr);
  }
}

function renderArchive() {
  const body = el("archiveBody");
  body.textContent = "";
  el("archiveCount").textContent = state.archive.length;

  // Newest first: when looking back, recent banners are the interesting ones.
  state.archive
    .slice()
    .reverse()
    .forEach((row) => {
      const tr = document.createElement("tr");
      [row.start, row.end, row.banner, row.units ?? "", gems(row.actualGems), row.note || ""].forEach(
        (value) => {
          const td = document.createElement("td");
          td.textContent = value === null || value === undefined ? "" : value;
          tr.appendChild(td);
        }
      );
      body.appendChild(tr);
    });
}

function renderIncome(estimate) {
  const body = el("incomeBody");
  body.textContent = "";
  estimate.gaps
    .slice()
    .reverse()
    .forEach((gap) => {
      const tr = document.createElement("tr");
      if (!gap.used) tr.classList.add("past");
      const perMonth = gap.days > 0 ? (gap.earned / gap.days) * DAYS_PER_MONTH : null;
      [
        formatDate(gap.from),
        formatDate(gap.to),
        gap.days,
        gems(gap.change),
        gap.spend ? gems(gap.spend) : "",
        gems(gap.earned),
        gems(perMonth)
      ].forEach((value) => tr.appendChild(calcCell(String(value))));
      body.appendChild(tr);
    });

  if (estimate.gaps.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 7;
    td.className = "empty";
    td.textContent = "Log Actual gems on at least two banners to get an estimate.";
    tr.appendChild(td);
    body.appendChild(tr);
  }
}

function renderSummary(estimate) {
  const { rows, anchor } = computePlan(state.planning, state.settings, estimate.perDay);
  const future = rows.filter((item) => item.expectedAfter !== null);

  el("statAnchor").textContent = gems(anchor.gems);
  el("statAnchorHint").textContent = anchor.logged
    ? `Logged on the banner ending ${formatDate(anchor.date)}.`
    : "From your starting count — log an Actual gems entry to replace it.";

  const lowest = future.length ? future[0].lowestAhead : null;
  const lowestCell = el("statLowest");
  lowestCell.textContent = lowest === null ? "—" : gems(lowest);
  lowestCell.className = "value " + (lowest === null ? "" : lowest < 0 ? "bad" : "good");
  el("statLowestHint").textContent =
    lowest === null
      ? "Nothing planned ahead yet."
      : lowest < 0
        ? `Short by ${gems(Math.abs(lowest))} at the worst point.`
        : describeRoom(lowest, state.settings.defaultUnitCost) || "Everything planned fits.";

  const incomeCell = el("statIncome");
  incomeCell.textContent = estimate.perMonth === null ? "—" : gems(estimate.perMonth);
  incomeCell.className = "value " + (estimate.perMonth !== null && estimate.perMonth < 0 ? "bad" : "");
  el("statIncomeHint").textContent =
    estimate.perMonth === null
      ? "Log Actual gems on two banners to estimate it."
      : `From your gem logs since ${formatDate(estimate.since)}.`;

  const units = future.reduce((sum, item) => sum + item.units, 0);
  el("statUnits").textContent = units;
  el("statUnitsHint").textContent = `Across ${future.length} upcoming banner${
    future.length === 1 ? "" : "s"
  }.`;

  const days = anchor.date ? daysBetween(anchor.date, today()) : null;
  const staleCell = el("statStale");
  staleCell.textContent = days === null ? "—" : `${days}d ago`;
  staleCell.className = "value " + (days !== null && days > state.settings.staleDays ? "warn" : "");
  el("statStaleHint").textContent =
    days !== null && days > state.settings.staleDays
      ? "Time to log your real gem count."
      : "Anchor is recent.";
}

function renderSettings() {
  el("startingGems").value = state.settings.startingGems ?? "";
  el("startingDate").value = state.settings.startingDate ?? "";
  el("incomeLookbackMonths").value = state.settings.incomeLookbackMonths ?? "";
  el("defaultUnitCost").value = state.settings.defaultUnitCost ?? "";
}

function render() {
  const estimate = currentEstimate();
  renderSummary(estimate);
  renderPlanning(estimate);
  renderIncome(estimate);
  renderArchive();
}

/* Actions -------------------------------------------------------------- */

/** Moves every row whose End date has passed into the archive. */
function archivePast(announce) {
  const { keep, past } = splitPastRows(state.planning);
  if (past.length === 0) {
    if (announce) flash("Nothing to archive — no banner has ended yet.");
    return;
  }
  const stamp = formatDate(today());
  past.forEach((row) => {
    row.note = [row.note, `Archived ${stamp}`].filter(Boolean).join(" · ");
  });
  state.archive = state.archive.concat(past);
  state.planning = keep;
  commit(`Archived ${past.length} banner${past.length === 1 ? "" : "s"}.`);
}

function bindSettings() {
  const fields = [
    ["startingGems", "number"],
    ["startingDate", "text"],
    ["incomeLookbackMonths", "number"],
    ["defaultUnitCost", "number"]
  ];
  fields.forEach(([id, type]) => {
    el(id).addEventListener("change", (event) => {
      state.settings[id] = type === "number" ? numberOrNull(event.target.value) : event.target.value;
      commit("Settings saved.");
    });
  });
}

function bindToolbar() {
  el("addRow").addEventListener("click", () => {
    state.planning.push(blankRow());
    commit();
  });

  el("archivePast").addEventListener("click", () => archivePast(true));

  el("exportData").addEventListener("click", () => exportState(state));

  el("importData").addEventListener("click", () => el("importFile").click());

  el("importFile").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    importState(file)
      .then((imported) => {
        state = imported;
        renderSettings();
        commit("Backup imported.");
      })
      .catch(() => flash("That file could not be read as a planner backup."))
      .finally(() => {
        event.target.value = "";
      });
  });

  el("resetData").addEventListener("click", () => {
    const warning =
      "Reset to the data migrated from the spreadsheet? Everything you have changed here will be lost.";
    if (!window.confirm(warning)) return;
    state = resetToSeed();
    renderSettings();
    commit("Reset to seed data.");
  });
}

/** Replaces the whole state when Firebase hands back a newer copy. */
function applyCloudState(cloudState) {
  state = normaliseState(cloudState);
  renderSettings();
  render();
  flash("Loaded from the cloud.");
}

function init() {
  state.planning = sortRows(state.planning);
  archivePast(false); // keep Planning to current and future, like the old daily script
  renderSettings();
  bindSettings();
  bindToolbar();
  render();
  if (typeof startCloudSync === "function") startCloudSync(applyCloudState);
}

init();
