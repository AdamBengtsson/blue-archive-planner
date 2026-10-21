/**
 * The Upcoming banners section: one card per Global banner, with portraits,
 * dates, and a button that copies the banner into the planning table.
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

/** Running now / starts in N days, counted from today. */
function describeWhen(banner) {
  const start = parseDate(banner.start);
  const end = parseDate(banner.end);
  const now = today();
  const plural = (n) => `${n} day${n === 1 ? "" : "s"}`;
  if (start <= now) return `Running now · ends in ${plural(daysBetween(now, end))}`;
  return `Starts in ${plural(daysBetween(now, start))}`;
}

/** "Oct 27 – Nov 3", with the year only where it changes from this year. */
function describeDates(banner) {
  const thisYear = today().getFullYear();
  const fmt = (value) => {
    const date = parseDate(value);
    const options = { month: "short", day: "numeric" };
    if (date.getFullYear() !== thisYear) options.year = "numeric";
    return date.toLocaleDateString("en-US", options);
  };
  return `${fmt(banner.start)} – ${fmt(banner.end)}`;
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

function bannerCard(banner) {
  const card = document.createElement("article");
  card.className = `banner-card ${banner.status}`;

  const head = document.createElement("div");
  head.className = "banner-head";
  const dates = document.createElement("div");
  dates.className = "banner-dates";
  dates.textContent = describeDates(banner);
  const badge = document.createElement("span");
  badge.className = `badge ${banner.status}`;
  badge.textContent = banner.status === "confirmed" ? "Confirmed" : "Predicted";
  head.append(dates, badge);
  card.appendChild(head);

  const when = document.createElement("div");
  when.className = "banner-when";
  when.textContent = banner.title ? `${banner.title} · ${describeWhen(banner)}` : describeWhen(banner);
  card.appendChild(when);

  const roster = document.createElement("div");
  roster.className = "roster";
  banner.students.forEach((student) => roster.appendChild(studentTile(student)));
  card.appendChild(roster);

  if (banner.note) {
    const note = document.createElement("p");
    note.className = "banner-note";
    note.textContent = banner.note;
    card.appendChild(note);
  }

  const add = document.createElement("button");
  add.className = "add-banner";
  const planned = findPlannedRow(banner);
  const moved = planned && (planned.start !== banner.start || planned.end !== banner.end);
  if (moved && state.planning.includes(planned)) {
    // Hand-typed dates are guesses; offer to move the row onto the forecast.
    add.textContent = `Move planner row to ${describeDates(banner)}`;
    add.title = `The planner has this banner from ${planned.start} to ${planned.end}.`;
    add.addEventListener("click", () => {
      Object.assign(planned, { start: banner.start, end: banner.end });
      state.planning = sortRows(state.planning);
      commit("Planner row moved to the forecast dates.");
    });
  } else if (planned) {
    add.textContent = "In planner";
    add.disabled = true;
  } else {
    add.textContent = "Add to planner";
    add.addEventListener("click", () => {
      state.planning.push(
        Object.assign(blankRow(), { start: banner.start, end: banner.end, banner: bannerLabel(banner) })
      );
      state.planning = sortRows(state.planning);
      commit("Banner added to the planner.");
    });
  }
  card.appendChild(add);
  return card;
}

/** Called from render() in planner-ui.js, so the buttons follow the planner. */
function renderBanners() {
  const grid = el("bannerGrid");
  if (!grid) return;
  grid.textContent = "";
  const now = today();
  const upcoming = banners.filter((banner) => parseDate(banner.end) > now);
  upcoming.forEach((banner) => grid.appendChild(bannerCard(banner)));

  if (upcoming.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Every banner in the bundled list has ended. banner-data.js needs a refresh.";
    grid.appendChild(empty);
  }
  el("bannerSource").textContent = `Forecast checked ${BANNER_DATA.updated}. ${liveStatus}`;
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
      liveStatus = "SchaleDB could not be reached, so this is the bundled list only.";
    })
    .finally(renderBanners);
}

renderBanners();
loadLiveBanners();
