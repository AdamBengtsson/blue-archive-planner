/**
 * Everything that touches the page: rendering the tables, reading the inputs,
 * and saving after each change.
 *
 * The state shape is { settings, planning, archive, gemLog } — see
 * seed-data.js and storage.js. Planning rows are the only editable banners;
 * archive rows are read-only. Gem counts are edited in the History.
 */

/** What the visitor may see; see storage.js. Signed out until Firebase says otherwise. */
let appMode = "public";
let state = seedState();

/** True when the visitor sees their own gems, units and settings, not just the forecast. */
function isPrivateView() {
  return appMode === "owner";
}

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


/** Builds one editable input cell bound to a field on a planning row or gem count. */
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
    const mine = isPrivateView();
    if (item.isPast) tr.classList.add("past");
    if (mine && item.isAnchorRow) tr.classList.add("anchor");

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
    // Signed out, a row is just the banner: units and balances are personal.
    if (!mine) {
      body.appendChild(tr);
      return;
    }
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
      actions.appendChild(
        deleteButton("Delete this banner", () => {
          state.planning.splice(index, 1);
          commit("Banner deleted.");
        })
      );
    }
    tr.appendChild(actions);

    body.appendChild(tr);
  });

  if (rows.length === 0) emptyRow(body, 9, "No upcoming banners in the forecast.");
}

/** A one-cell row saying a table has nothing to show. */
function emptyRow(body, columns, text) {
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  td.colSpan = columns;
  td.className = "empty";
  td.textContent = text;
  tr.appendChild(td);
  body.appendChild(tr);
}

/** A ✕ button that runs `onClick`. */
function deleteButton(title, onClick) {
  const button = document.createElement("button");
  button.className = "link";
  button.textContent = "✕";
  button.title = title;
  button.addEventListener("click", onClick);
  return button;
}

/**
 * The History: past banners and gem counts in one list, newest first. Each
 * count carries the income-estimate gap that ends on it, and the banners
 * between two counts are the ones whose spend that gap counted.
 */
function renderHistory(estimate) {
  const body = el("historyBody");
  body.textContent = "";
  const pulled = (row) => typeof row.units === "number" && row.units > 0;
  const onlyMine = Boolean(state.settings.archiveOnlyMine);
  el("archiveOnlyMine").checked = onlyMine;

  const key = (date) => (date ? formatDate(date) : "");
  const entries = new Map(state.gemLog.map((entry) => [key(parseDate(entry.date)), entry]));
  const gaps = new Map(estimate.gaps.map((gap) => [key(gap.to), gap]));
  const counts = collectGemLogs(state.gemLog, state.settings).map((count) => ({ date: key(count.date), count }));
  const pastBanners = state.archive
    .filter((row) => !onlyMine || pulled(row))
    .map((row) => ({ date: key(spendDate(row)), row }));
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  el("historyCount").textContent = `${plural(state.archive.length, "banner")}, ${plural(counts.length, "gem count")}`;

  // Newest first. A count goes above the banners that started that same day,
  // since they count as paid by then.
  const items = counts.concat(pastBanners).sort((a, b) => b.date.localeCompare(a.date) || (b.count ? 1 : 0) - (a.count ? 1 : 0));

  items.forEach(({ date, count, row }) => {
    const tr = document.createElement("tr");
    if (row) {
      tr.classList.add("banner-row");
      if (pulled(row)) tr.classList.add("pulled");
      const name = document.createElement("td");
      name.textContent = row.banner;
      if (row.note) {
        const note = document.createElement("div");
        note.className = "banner-when";
        note.textContent = row.note;
        name.appendChild(note);
      }
      const rest = document.createElement("td");
      rest.colSpan = 4;
      tr.append(calcCell(describeDates(row)), name, calcCell(String(row.units ?? ""), "", "Units"), rest);
      body.appendChild(tr);
      return;
    }

    tr.classList.add("count-row");
    const entry = entries.get(date);
    if (entry) {
      tr.append(inputCell(entry, "date", "date", "col-date"), inputCell(entry, "gems", "number", "col-gems"));
    } else {
      tr.append(calcCell(displayDate(date)), calcCell(`${gems(count.gems)} (starting count in Settings)`));
    }
    tr.appendChild(calcCell(""));

    const gap = gaps.get(date);
    const signed = (n) => (n > 0 ? "+" : "") + gems(n);
    const perMonth = gap && gap.days > 0 ? (gap.earned / gap.days) * DAYS_PER_MONTH : null;
    tr.append(
      calcCell(gap ? signed(gap.change) : "", gap && gap.change < 0 ? "negative" : "", "Change"),
      calcCell(gap ? gems(gap.earned) : "", "", "Earned"),
      calcCell(perMonth === null ? "" : gems(perMonth), gap && !gap.used ? "unused" : "", "Per month")
    );

    const actions = document.createElement("td");
    if (entry) {
      actions.appendChild(
        deleteButton("Delete this gem count", () => {
          state.gemLog = state.gemLog.filter((other) => other !== entry);
          commit("Gem count deleted.");
        })
      );
    }
    tr.appendChild(actions);
    body.appendChild(tr);
  });

  if (items.length === 0) emptyRow(body, 7, "Nothing here yet. Log your gem count above.");
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

/** The sign-in line at the top, and the notices that go with each mode. */
function renderAccount() {
  document.body.classList.toggle("public-view", !isPrivateView());
  el("planningHeading").textContent = isPrivateView() ? "Planning" : "Upcoming banners";
  const text = {
    public: "Upcoming Blue Archive banners on Global. Sign in to see your gems and plan your pulls.",
    owner: "Signed in.",
    empty: "Signed in.",
    denied: "Signed in."
  }[appMode];
  el("accountText").textContent = text;
  el("signIn").classList.toggle("hidden", appMode !== "public");
  el("signOut").classList.toggle("hidden", appMode === "public");
  if (appMode !== "owner") el("cloudStatus").textContent = "";
  el("emptyNotice").classList.toggle("hidden", appMode !== "empty");
  el("deniedNotice").classList.toggle("hidden", appMode !== "denied");
}

function render() {
  renderAccount();
  const estimate = currentEstimate();
  renderSummary(estimate);
  renderPlanning(estimate);
  renderHistory(estimate);
  if (typeof renderBanners === "function") renderBanners();
}

/* Actions -------------------------------------------------------------- */

/** Moves every row whose End date has passed into the archive. */
function archivePast() {
  const { keep, past } = splitPastRows(state.planning);
  if (past.length === 0) return;
  const stamp = formatDate(today());
  past.forEach((row) => {
    row.note = [row.note, `Archived ${stamp}`].filter(Boolean).join(" · ");
  });
  state.archive = state.archive.concat(past);
  state.planning = keep;
  // Signed out, archiving is housekeeping on the forecast, not news.
  commit(isPrivateView() ? `Archived ${past.length} banner${past.length === 1 ? "" : "s"}.` : "");
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
        if (appMode === "empty") appMode = "owner";
        if (!isPrivateView()) return;
        state = imported;
        prepareState();
        renderSettings();
        commit("Backup imported.");
      })
      .catch(() => flash("That file could not be read as a planner backup."))
      .finally(() => {
        event.target.value = "";
      });
  });

  el("emptyImport").addEventListener("click", () => el("importFile").click());

  el("resetData").addEventListener("click", () => {
    const warning =
      "Clear all your data? Your gem log, units, notes and settings will be lost" +
      " on every device you sign in on. Export a backup first if you might want them back.";
    if (!window.confirm(warning)) return;
    state = seedState();
    renderSettings();
    commit("Data cleared.");
  });
}

/**
 * Tidies a freshly loaded state: sorted, ended banners archived (like the old
 * daily script) and the plan matched to the forecast. Saves if that changed it.
 */
function prepareState() {
  state.planning = sortRows(state.planning);
  archivePast();
  if (typeof syncPlanWithForecast === "function") syncPlanWithForecast();
}

/** Switches mode and redraws everything. */
function showMode(mode) {
  appMode = mode;
  renderSettings();
  render();
}

/**
 * Shows the seed data in a mode that saves nothing. The mode is set first so
 * archiving the seed's ended banners can never save over an account.
 */
function showSeed(mode) {
  appMode = mode;
  state = seedState();
  prepareState();
  showMode(mode);
}

/** What the page does for each sign-in situation; see firebase-logic.js. */
const cloudCallbacks = {
  signedOut: () => showSeed("public"),
  loaded(cloudState) {
    const first = appMode !== "owner";
    appMode = "owner";
    state = normaliseState(cloudState);
    prepareState();
    // Saves only if loading changed anything, such as a banner archived.
    saveState(state);
    showMode("owner");
    if (!first) flash("Updated from another device.");
  },
  // Nothing is saved until a backup is imported, so a blank start can never
  // overwrite real data.
  empty: () => showSeed("empty"),
  denied: () => showSeed("denied"),
  status(text) {
    el("cloudStatus").textContent = text;
  }
};

function bindAccount() {
  el("signIn").addEventListener("submit", (event) => {
    event.preventDefault();
    const passphrase = el("passphrase").value;
    if (!passphrase) return;
    const button = el("signIn").querySelector("button");
    button.disabled = true;
    el("accountText").textContent = "Signing in…";
    cloudSignIn(passphrase).then((problem) => {
      button.disabled = false;
      el("passphrase").value = "";
      if (problem) el("accountText").textContent = problem;
    });
  });
  el("signOut").addEventListener("click", () => cloudSignOut());
}

function init() {
  prepareState();
  renderSettings();
  bindSettings();
  bindLogForm();
  bindToolbar();
  bindAccount();
  render();
  if (!startCloud(cloudCallbacks)) {
    // Firebase failed to load; say so rather than showing a sign-in that cannot work.
    el("accountText").textContent = "Sign-in could not start. Reload the page to try again.";
    el("signIn").classList.add("hidden");
  }
}

init();
