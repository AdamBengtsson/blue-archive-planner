/**
 * Everything that touches the page: rendering the tables, reading the inputs,
 * and saving after each change.
 *
 * The state shape is { settings, planning, archive, gemLog } — see
 * seed-data.js and storage.js. Planning rows are the only editable banners;
 * archive rows are read-only. The gem log is edited in its own section.
 */

let state = loadState();

const el = (id) => document.getElementById(id);
const gems = (n) => (typeof n === "number" ? Math.round(n).toLocaleString("en-US") : "");

/** An empty banner row, filled in from a forecast banner. */
function blankRow() {
  return { start: "", end: "", banner: "", units: null, note: "" };
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

/** The income estimate, worked out from the gem log and every banner, archive included. */
function currentEstimate() {
  return estimateIncome(state.archive.concat(state.planning), state.gemLog, state.settings);
}

/** Adds a gem count to the log, replacing any count already logged that day. */
function logGems(date, gems) {
  state.gemLog = sortGemLog(state.gemLog.filter((entry) => entry.date !== date).concat({ date, gems }));
}

/** "Aug 5, 2025" for a date shown to the user; stored dates stay yyyy-mm-dd. */
function displayDate(value) {
  const date = value instanceof Date ? value : parseDate(value);
  if (!date) return value || "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* Rendering ------------------------------------------------------------ */

/** Running now / starts in N days, counted from today. */
function describeWhen(banner) {
  const start = parseDate(banner.start);
  const end = parseDate(banner.end);
  const now = today();
  if (!start || !end) return "";
  const plural = (n) => `${n} day${n === 1 ? "" : "s"}`;
  if (start <= now) return `Running now · ends in ${plural(daysBetween(now, end))}`;
  return `Starts in ${plural(daysBetween(now, start))}`;
}

/** "Oct 27 – Nov 3", with the year only where it changes from this year. */
function describeDates(banner) {
  if (!parseDate(banner.start) || !parseDate(banner.end)) return "No dates";
  const thisYear = today().getFullYear();
  const fmt = (value) => {
    const date = parseDate(value);
    const options = { month: "short", day: "numeric" };
    if (date.getFullYear() !== thisYear) options.year = "numeric";
    return date.toLocaleDateString("en-US", options);
  };
  return `${fmt(banner.start)} – ${fmt(banner.end)}`;
}


/** Builds one editable input cell bound to a field on a planning row or gem log entry. */
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

/** The Units input with − and + buttons either side, so planning a banner is one tap. */
function unitsCell(row) {
  const td = inputCell(row, "units", "number", "col-units");
  const input = td.querySelector("input");
  input.min = "0";
  input.setAttribute("aria-label", "Units");
  const units = typeof row.units === "number" ? row.units : 0;

  const step = (label, title, delta) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "step";
    button.textContent = label;
    button.title = title;
    button.disabled = units + delta < 0;
    button.addEventListener("click", () => {
      const next = units + delta;
      // Back to empty rather than 0, the same as a banner never planned.
      row.units = next > 0 ? next : null;
      commit();
    });
    return button;
  };

  const stepper = document.createElement("div");
  stepper.className = "stepper";
  stepper.append(step("−", "One unit fewer", -1), input, step("+", "One unit more", 1));
  td.appendChild(stepper);
  return td;
}

/** The dates as text, with how soon the banner starts or ends under them. */
function whenCell(banner) {
  const td = document.createElement("td");
  td.className = "col-when";
  const dates = document.createElement("div");
  dates.className = "banner-dates";
  dates.textContent = describeDates(banner);
  const when = document.createElement("div");
  when.className = "banner-when";
  when.textContent = describeWhen(banner);
  td.append(dates, when);
  return td;
}

/**
 * Builds one read-only calculated cell. The label names the value on phones,
 * where the table's header row is hidden and each row is a card.
 */
function calcCell(text, className, label) {
  const td = document.createElement("td");
  td.className = "calc";
  if (label) td.dataset.label = label;
  if (!text) return td;
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
  const { rows } = computePlan(state.planning, state.gemLog, state.settings, estimate.perDay);

  rows.forEach((item, index) => {
    const row = item.row;
    const tr = document.createElement("tr");
    if (item.isPast) tr.classList.add("past");
    if (item.isAnchorRow) tr.classList.add("anchor");

    // Portraits from the forecast once banners-ui.js has loaded; otherwise
    // the name the row was saved with.
    const details = typeof forecastDetails === "function" ? forecastDetails(row) : null;
    const when = whenCell(row);
    if (details) when.appendChild(statusBadge(details.dataset.status));
    tr.appendChild(when);
    const bannerCell = document.createElement("td");
    bannerCell.className = "col-banner";
    if (details) {
      bannerCell.appendChild(details);
    } else {
      const name = document.createElement("div");
      name.className = "banner-name";
      name.textContent = row.banner;
      const hint = document.createElement("div");
      hint.className = "banner-when";
      hint.textContent = "Not in the forecast. Kept because it has units planned.";
      bannerCell.append(name, hint);
    }
    tr.appendChild(bannerCell);
    // Limited and Fes students leave the pool when the banner ends, so those rows stand out.
    if (details && details.dataset.limited) tr.classList.add("limited");
    tr.appendChild(unitsCell(row));
    tr.appendChild(calcCell(item.plannedSpend ? gems(item.plannedSpend) : "", "", "Planned spend"));
    tr.appendChild(calcCell(item.income ? gems(item.income) : "", "", "Income"));
    const expected = calcCell(
      item.expectedAfter === null ? "" : gems(item.expectedAfter),
      item.expectedAfter !== null && item.expectedAfter < 0 ? "negative" : "",
      "Expected after"
    );
    if (item.isLowPoint) {
      tr.classList.add("low-point");
      const note = document.createElement("div");
      note.className = "low-point-note";
      note.textContent = "Lowest point";
      expected.appendChild(note);
    }
    tr.appendChild(expected);

    tr.appendChild(
      calcCell(
        item.lowestAhead === null ? "" : gems(item.lowestAhead),
        item.lowestAhead !== null && item.lowestAhead < 0 ? "negative" : "",
        "Lowest ahead"
      )
    );
    tr.appendChild(
      calcCell(
        item.roomForExtra,
        item.roomForExtra.startsWith("Short") ? "short" : "room",
        "Room for extra?"
      )
    );

    // Forecast rows come back on the next sync, so only rows of your own can
    // be deleted. Set Units to 0 to skip a forecast banner instead.
    const actions = document.createElement("td");
    actions.className = "col-actions";
    if (!details) {
      const remove = document.createElement("button");
      remove.className = "link";
      remove.textContent = "✕";
      remove.title = "Delete this banner";
      remove.addEventListener("click", () => {
        state.planning.splice(index, 1);
        commit("Banner deleted.");
      });
      actions.appendChild(remove);
    }
    tr.appendChild(actions);

    body.appendChild(tr);
  });

  if (rows.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 9;
    td.className = "empty";
    td.textContent = "No upcoming banners in the forecast.";
    tr.appendChild(td);
    body.appendChild(tr);
  }
}

function renderArchive() {
  const body = el("archiveBody");
  body.textContent = "";
  const pulled = (row) => typeof row.units === "number" && row.units > 0;
  const onlyMine = Boolean(state.settings.archiveOnlyMine);
  el("archiveCount").textContent = state.archive.length;
  el("archivePulledCount").textContent = state.archive.filter(pulled).length;
  el("archiveOnlyMine").checked = onlyMine;

  // Newest first: when looking back, recent banners are the interesting ones.
  state.archive
    .slice()
    .reverse()
    .filter((row) => !onlyMine || pulled(row))
    .forEach((row) => {
      const tr = document.createElement("tr");
      if (pulled(row)) tr.classList.add("pulled");
      [displayDate(row.start), displayDate(row.end), row.banner, row.units ?? "", row.note || ""].forEach(
        (value) => {
          const td = document.createElement("td");
          td.textContent = value === null || value === undefined ? "" : value;
          tr.appendChild(td);
        }
      );
      body.appendChild(tr);
    });
}

/** The gem log, newest first, with each count editable in place. */
function renderGemLog() {
  const body = el("gemLogBody");
  body.textContent = "";
  el("gemLogCount").textContent = state.gemLog.length;

  // Sorted here rather than on edit, so a corrected date lands in place.
  sortGemLog(state.gemLog)
    .reverse()
    .forEach((entry, i, newestFirst) => {
      const tr = document.createElement("tr");
      tr.appendChild(inputCell(entry, "date", "date", "col-date"));
      tr.appendChild(inputCell(entry, "gems", "number", "col-gems"));

      const previous = newestFirst[i + 1];
      const change =
        previous && typeof entry.gems === "number" && typeof previous.gems === "number"
          ? entry.gems - previous.gems
          : null;
      tr.appendChild(
        calcCell(change === null ? "" : (change > 0 ? "+" : "") + gems(change), change < 0 ? "negative" : "")
      );

      const actions = document.createElement("td");
      const remove = document.createElement("button");
      remove.className = "link";
      remove.textContent = "✕";
      remove.title = "Delete this entry";
      remove.addEventListener("click", () => {
        state.gemLog = state.gemLog.filter((other) => other !== entry);
        commit("Gem count deleted.");
      });
      actions.appendChild(remove);
      tr.appendChild(actions);

      body.appendChild(tr);
    });

  if (state.gemLog.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.className = "empty";
    td.textContent = "Nothing logged yet. Log your gem count above.";
    tr.appendChild(td);
    body.appendChild(tr);
  }
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
        displayDate(gap.from),
        displayDate(gap.to),
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
    td.textContent = "Log your gem count at least twice to get an estimate.";
    tr.appendChild(td);
    body.appendChild(tr);
  }
}

function renderSummary(estimate) {
  const { rows, anchor } = computePlan(state.planning, state.gemLog, state.settings, estimate.perDay);
  const future = rows.filter((item) => item.expectedAfter !== null);

  el("statAnchor").textContent = gems(anchor.gems);
  el("statAnchorHint").textContent = anchor.logged
    ? `Logged on ${displayDate(anchor.date)}.`
    : "From your starting count — log your gems to replace it.";

  const lowest = future.length ? future[0].lowestAhead : null;
  const lowestCell = el("statLowest");
  lowestCell.textContent = lowest === null ? "—" : gems(lowest);
  lowestCell.className = "value " + (lowest === null ? "" : lowest < 0 ? "bad" : "good");
  el("statLowestHint").textContent =
    lowest === null
      ? "Nothing planned ahead yet."
      : lowest < 0
        ? `Short by ${gems(Math.abs(lowest))} at the worst point.`
        : (describeRoom(lowest, state.settings.defaultUnitCost) || "Everything planned fits") + ".";
  const lowPoint = rows.find((item) => item.isLowPoint);
  if (lowPoint) el("statLowestHint").textContent += ` Lowest after the ${describeDates(lowPoint.row)} banner.`;

  const incomeCell = el("statIncome");
  incomeCell.textContent = estimate.perMonth === null ? "—" : gems(estimate.perMonth);
  incomeCell.className = "value " + (estimate.perMonth !== null && estimate.perMonth < 0 ? "bad" : "");
  el("statIncomeHint").textContent =
    estimate.perMonth === null
      ? "Log your gems twice to estimate it."
      : `From your gem logs since ${displayDate(estimate.since)}.`;

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
  renderGemLog();
  renderIncome(estimate);
  renderArchive();
  if (typeof renderBanners === "function") renderBanners();
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

function bindLogForm() {
  el("logDate").value = formatDate(today());
  el("logForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const count = numberOrNull(el("logGems").value);
    const date = el("logDate").value || formatDate(today());
    if (count === null) {
      flash("Type your gem count first.");
      return;
    }
    logGems(date, count);
    el("logGems").value = "";
    el("logDate").value = formatDate(today());
    commit(`Logged ${gems(count)} gems.`);
  });
}

function bindToolbar() {
  el("archivePast").addEventListener("click", () => archivePast(true));

  el("archiveOnlyMine").addEventListener("change", (event) => {
    state.settings.archiveOnlyMine = event.target.checked;
    commit();
  });

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
  bindLogForm();
  bindToolbar();
  render();
  if (typeof startCloudSync === "function") startCloudSync(applyCloudState);
}

init();
