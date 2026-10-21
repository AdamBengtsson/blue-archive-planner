/**
 * Upcoming Global banners, shown inside the planning table: portraits in
 * each planner row that matches a forecast banner, and a faded row with an
 * "Add to plan" button for each banner not planned yet. Matched rows follow
 * the forecast's dates.
 *
 * The list starts from the bundled BANNER_DATA (see banner-data.js), so it
 * always renders, even offline. SchaleDB is then asked which banners are live
 * on Global and JP right now; when it answers, the live Global banner is
 * marked confirmed and JP's live banner is added as an estimate if the bundled
 * list does not reach that far yet. When SchaleDB cannot be reached the bundled
 * list is shown as it is.
 */

const SCHALEDB = "https://schaledb.com";
const portraitUrl = (id) => `${SCHALEDB}/images/student/collection/${id}.webp`;
const studentUrl = (id) => `${SCHALEDB}/student/${id}`;

let banners = BANNER_DATA.banners.map((banner) => Object.assign({}, banner));
let liveStatus = "Checking SchaleDB for live banners…";

/** "Kisaki (Swimsuit)" -> "Kisaki", for loose matching against typed rows. */
function baseName(name) {
  return name.replace(/\s*\(.*\)\s*$/, "").trim();
}

/** The text a banner gets in the planning table's Banner column. */
function bannerLabel(banner) {
  const names = banner.students.map((s) => s.name).join(" & ");
  return banner.title ? `${banner.title}: ${names}` : names;
}

/**
 * How far a hand-typed planner row is from this banner, in days, or null when
 * it is not a candidate: the row must name the banner's first student and
 * start within a week of it, so "Kisaki & Shun Swimsuits" counts for the
 * Kisaki banner even when the forecast has shifted it by a week.
 */
function rowDistance(banner, row) {
  const rowStart = parseDate(row.start);
  if (!rowStart || !String(row.banner).toLowerCase().includes(firstName(banner))) return null;
  const distance = Math.abs(daysBetween(parseDate(banner.start), rowStart));
  return distance <= 7 ? distance : null;
}

const firstName = (banner) => baseName(banner.students[0].name).toLowerCase();

/**
 * The planner row for this banner, if there is one. Rows added from here match
 * on their label. A hand-typed row goes to the nearest banner it could be, so
 * "Makoto & Satsuki Swimsuits" is not also claimed by the plain Makoto banner
 * a week earlier.
 */
function findPlannedRow(banner) {
  const label = bannerLabel(banner);
  return state.planning.concat(state.archive).find((row) => {
    if (row.banner === label) return true;
    const distance = rowDistance(banner, row);
    if (distance === null) return false;
    return banners.every((other) => {
      const otherDistance = other === banner ? null : rowDistance(other, row);
      return otherDistance === null || otherDistance > distance;
    });
  });
}

function studentTile(student) {
  const link = document.createElement("a");
  link.className = "student";
  link.href = studentUrl(student.id);
  link.target = "_blank";
  link.rel = "noopener";
  link.title = `${student.name} on SchaleDB`;

  const frame = document.createElement("div");
  frame.className = "portrait";
  const img = document.createElement("img");
  img.src = portraitUrl(student.id);
  img.alt = student.name;
  img.loading = "lazy";
  // Without the image, fall back to the initial so the tile keeps its shape.
  img.addEventListener("error", () => {
    frame.textContent = student.name.charAt(0);
    frame.classList.add("missing");
  });
  frame.appendChild(img);
  link.appendChild(frame);

  if (student.tag) {
    const tag = document.createElement("span");
    tag.className = `tag tag-${student.tag.toLowerCase()}`;
    tag.textContent = student.tag;
    link.appendChild(tag);
  }

  const name = document.createElement("span");
  name.className = "student-name";
  name.textContent = student.name;
  link.appendChild(name);
  return link;
}

/** The portraits and badge shown in a planning row's Banner column. */
function bannerDetails(banner) {
  const details = document.createElement("div");
  details.className = "banner-details";

  const roster = document.createElement("div");
  roster.className = "roster";
  banner.students.forEach((student) => roster.appendChild(studentTile(student)));
  details.appendChild(roster);

  const meta = document.createElement("div");
  meta.className = "banner-meta";
  const badge = document.createElement("span");
  badge.className = `badge ${banner.status}`;
  badge.textContent = banner.status === "confirmed" ? "Confirmed" : "Predicted";
  meta.appendChild(badge);
  if (banner.title) {
    const title = document.createElement("span");
    title.className = "banner-title";
    title.textContent = banner.title;
    meta.appendChild(title);
  }
  if (banner.note) {
    const note = document.createElement("span");
    note.className = "banner-note";
    note.textContent = banner.note;
    meta.appendChild(note);
  }
  details.appendChild(meta);
  return details;
}

/** Called from renderPlanning() for each planner row: its forecast details, or null. */
function forecastDetails(row) {
  const banner = banners.find((candidate) => findPlannedRow(candidate) === row);
  return banner ? bannerDetails(banner) : null;
}

/**
 * A forecast banner nobody has planned yet, as a faded row in the planning
 * table. It has no units, so it changes none of the sums until it is added.
 */
function forecastRow(banner) {
  const tr = document.createElement("tr");
  tr.className = "forecast";
  tr.dataset.start = banner.start;
  tr.appendChild(whenCell(banner));

  const roster = document.createElement("td");
  roster.className = "col-banner";
  roster.appendChild(bannerDetails(banner));
  tr.appendChild(roster);

  const units = document.createElement("td");
  units.colSpan = 7;
  const add = document.createElement("button");
  add.className = "small primary";
  add.textContent = "Add to plan";
  add.addEventListener("click", () => {
    state.planning.push(
      Object.assign(blankRow(), { start: banner.start, end: banner.end, banner: bannerLabel(banner) })
    );
    state.planning = sortRows(state.planning);
    commit("Banner added to the planner.");
  });
  units.appendChild(add);
  tr.appendChild(units);
  return tr;
}

/**
 * Dates are not typed in any more, so a planner row that matches a forecast
 * banner takes the forecast's dates whenever they differ. Saves only when a
 * row actually moved.
 */
function followForecastDates() {
  let moved = false;
  banners.forEach((banner) => {
    const row = findPlannedRow(banner);
    if (!row || !state.planning.includes(row)) return;
    if (row.start === banner.start && row.end === banner.end) return;
    Object.assign(row, { start: banner.start, end: banner.end });
    moved = true;
  });
  if (!moved) return;
  state.planning = sortRows(state.planning);
  saveState(state);
}

/**
 * Called at the end of renderPlanning(): slots each upcoming banner that is
 * not in the plan yet in among the planner rows, by start date.
 */
function insertForecastRows(body) {
  const now = today();
  banners
    .filter((banner) => parseDate(banner.end) > now && !findPlannedRow(banner))
    .forEach((banner) => {
      const before = Array.from(body.children).find(
        (tr) => tr.dataset.start !== undefined && (!tr.dataset.start || tr.dataset.start > banner.start)
      );
      body.insertBefore(forecastRow(banner), before || null);
    });
}

/** Called from render() in planner-ui.js: the line on where the forecast comes from. */
function renderBanners() {
  const ended = banners.every((banner) => parseDate(banner.end) <= today());
  const stale = ended ? " Every banner in the forecast has ended; check the Refresh upcoming banners workflow on GitHub." : "";
  el("bannerSource").textContent = `Forecast last changed ${BANNER_DATA.updated}. ${liveStatus}${stale}`;
}

/* Live data from SchaleDB ------------------------------------------------ */

const fromUnix = (seconds) => formatDate(new Date(seconds * 1000));

function fetchJson(path) {
  return fetch(`${SCHALEDB}${path}`).then((response) => {
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.json();
  });
}

/** The bundled banner sharing a student with a live gacha, if any. */
function matchBanner(gacha) {
  return banners.find((banner) => banner.students.some((s) => gacha.characters.includes(s.id)));
}

/** Student records from SchaleDB, fetched only when a banner needs names. */
let studentsById = null;
function loadStudentNames() {
  if (!studentsById) studentsById = fetchJson("/data/en/students.min.json");
  return studentsById;
}

function studentsFor(ids, names) {
  return ids.map((id) => ({ id, name: (names[id] && names[id].Name) || `Student ${id}` }));
}

/**
 * Folds SchaleDB's live banners into the list:
 *  - a live Global banner confirms the bundled one it matches, taking its
 *    dates, or is added as confirmed when it is not in the list at all;
 *  - a live JP banner the list has not reached yet is added as an estimate,
 *    jpLagDays later, so the view always reaches as far as JP does.
 */
async function applyLiveBanners(config) {
  const region = (name) => config.Regions.find((r) => r.Name === name) || { CurrentGacha: [] };
  const global = region("Global").CurrentGacha;
  const jp = region("Jp").CurrentGacha;
  const unmatchedGlobal = global.filter((gacha) => !matchBanner(gacha));
  const unmatchedJp = jp.filter((gacha) => !matchBanner(gacha));

  global.forEach((gacha) => {
    const banner = matchBanner(gacha);
    if (!banner) return;
    Object.assign(banner, { start: fromUnix(gacha.start), end: fromUnix(gacha.end), status: "confirmed" });
  });

  if (unmatchedGlobal.length || unmatchedJp.length) {
    const names = await loadStudentNames();
    unmatchedGlobal.forEach((gacha) => {
      banners.push({
        start: fromUnix(gacha.start),
        end: fromUnix(gacha.end),
        status: "confirmed",
        students: studentsFor(gacha.characters, names)
      });
    });
    const lag = BANNER_DATA.jpLagDays * 86400;
    unmatchedJp.forEach((gacha) => {
      banners.push({
        start: fromUnix(gacha.start + lag),
        end: fromUnix(gacha.end + lag),
        status: "predicted",
        note: "Running on JP now. The Global date is a rough estimate.",
        students: studentsFor(gacha.characters, names)
      });
    });
  }

  banners.sort((a, b) => a.start.localeCompare(b.start));
}

function loadLiveBanners() {
  fetchJson("/data/config.min.json")
    .then(applyLiveBanners)
    .then(() => {
      liveStatus = "Live banners checked against SchaleDB just now.";
    })
    .catch((error) => {
      console.warn("Could not load live banners from SchaleDB.", error);
      liveStatus = "SchaleDB could not be reached, so the live banner is not confirmed.";
    })
    .finally(() => {
      followForecastDates();
      render();
    });
}

// planner-ui.js rendered before this file loaded, so draw again with the forecast.
followForecastDates();
render();
loadLiveBanners();
