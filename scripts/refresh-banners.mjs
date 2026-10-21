/**
 * Rebuilds banner-data.js from Joe's Blue Archive Tools forecast page.
 *
 *   node scripts/refresh-banners.mjs                 fetch the live page
 *   node scripts/refresh-banners.mjs --html page.html  parse a saved copy
 *
 * The page is a Next.js app, so alongside the HTML it ships its data as a
 * React Server Components payload (the self.__next_f.push(...) script tags).
 * Each banner is a card element keyed "<start ms>,<end ms>", and its pickups
 * are BannerPickupList props: { students, isSelectablePickup, freePulls }.
 * Reading those is far steadier than scraping the rendered text.
 *
 * The file is only rewritten when the banners themselves change, so a daily
 * run with nothing new leaves no commit behind. When the page cannot be read
 * or looks wrong, the script exits non-zero and the old file stays as it was.
 */

import { readFileSync, writeFileSync } from "node:fs";

const SOURCE_URL = "https://ba.joexyz.online/global/banners";
const OUTPUT = new URL("../banner-data.js", import.meta.url);

/** Joins the RSC chunks pushed by the page's inline scripts into one stream. */
function extractPayload(html) {
  const chunks = [];
  const pattern = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  for (const match of html.matchAll(pattern)) chunks.push(JSON.parse(match[1]));
  if (chunks.length === 0) throw new Error("No RSC payload found on the page.");
  return chunks.join("");
}

/**
 * Splits the RSC stream into rows by id. Rows are "id:<json>\n", except text
 * rows "id:T<hex byte length>,<text>" which have no terminator. Rows that are
 * not plain JSON (module imports and the like) are skipped.
 */
function parseRows(payload) {
  const bytes = Buffer.from(payload, "utf8");
  const rows = new Map();
  let pos = 0;
  while (pos < bytes.length) {
    const colon = bytes.indexOf(":", pos);
    if (colon < 0) break;
    const id = bytes.toString("utf8", pos, colon);
    if (bytes[colon + 1] === 0x54 /* T */) {
      const comma = bytes.indexOf(",", colon);
      const length = parseInt(bytes.toString("utf8", colon + 2, comma), 16);
      rows.set(id, bytes.toString("utf8", comma + 1, comma + 1 + length));
      pos = comma + 1 + length;
      continue;
    }
    let end = bytes.indexOf("\n", colon);
    if (end < 0) end = bytes.length;
    try {
      rows.set(id, JSON.parse(bytes.toString("utf8", colon + 1, end)));
    } catch {
      // Not JSON: an import ("I[...]"), hint or error row. Not needed here.
    }
    pos = end + 1;
  }
  return rows;
}

/**
 * Walks a node depth-first, calling visit on every value (strings included)
 * and following "$L<id>" references into other rows. visit returning false
 * stops the walk from going below that node.
 */
function walk(node, rows, visit, seen = new Set()) {
  if (visit(node) === false) return;
  if (typeof node === "string") {
    const ref = node.match(/^\$L?([0-9a-f]+)$/);
    if (ref && rows.has(ref[1]) && !seen.has(ref[1])) {
      seen.add(ref[1]);
      walk(rows.get(ref[1]), rows, visit, seen);
    }
    return;
  }
  if (!node || typeof node !== "object") return;
  for (const child of Array.isArray(node) ? node : Object.values(node)) walk(child, rows, visit, seen);
}

/** "2026-10-27" from a timestamp, in UTC: Global banners turn over at 02:00 UTC. */
const utcDate = (ms) => new Date(ms).toISOString().slice(0, 10);

function toStudent(raw) {
  const student = { id: raw.schaleDbId, name: raw.name };
  if (raw.isFestGlobal) student.tag = "Fes";
  else if (raw.isLimitedGlobal) student.tag = "Limited";
  return student;
}

/** Every banner card on the page, earliest first, as banner-data.js entries. */
function readBanners(rows) {
  const banners = [];
  const cardKey = /^(\d{12,}),(\d{12,})$/;
  for (const row of rows.values()) {
    walk(row, rows, (node) => {
      // A React element is ["$", type, key, props].
      if (!Array.isArray(node) || node[0] !== "$" || !cardKey.test(String(node[2]))) return;
      const [, startMs, endMs] = String(node[2]).match(cardKey).map(Number);
      const regular = [];
      const pickups = [];
      let freePulls = 0;
      let selectableTitle = null;
      walk(node[3], rows, (inner) => {
        if (typeof inner === "string" && /Recollection Recruitment/.test(inner)) selectableTitle = inner;
        if (inner && Array.isArray(inner.students) && "isSelectablePickup" in inner) {
          freePulls = Math.max(freePulls, inner.freePulls || 0);
          (inner.isSelectablePickup ? pickups : regular).push(...inner.students.map(toStudent));
          return false;
        }
      });
      const base = { start: utcDate(startMs), end: utcDate(endMs + 1000), status: "predicted" };
      if (regular.length) {
        const banner = Object.assign({}, base, { students: regular });
        if (freePulls) banner.note = `${freePulls} free pulls.`;
        banners.push(banner);
      }
      if (pickups.length) {
        banners.push(Object.assign({}, base, {
          title: (selectableTitle || "Recollection Recruitment").replace(/\s*\d+$/, ""),
          note: "Pick one of these to rate up.",
          students: pickups
        }));
      }
      return false;
    });
  }
  // The same card can be reached from more than one row; keep one copy.
  const unique = new Map(banners.map((b) => [`${b.start}|${b.title || ""}|${b.students.map((s) => s.id)}`, b]));
  return [...unique.values()].sort((a, b) => a.start.localeCompare(b.start) || (a.title ? 1 : -1));
}

/** Refuses output that looks like the page changed shape under us. */
function validate(banners) {
  if (banners.length < 3) throw new Error(`Only ${banners.length} banners found; the page may have changed.`);
  for (const banner of banners) {
    if (!/^\d{4}-\d\d-\d\d$/.test(banner.start) || banner.end <= banner.start)
      throw new Error(`Bad dates on a banner: ${JSON.stringify(banner)}`);
    if (!banner.students.every((s) => Number.isInteger(s.id) && s.name))
      throw new Error(`Bad student on a banner: ${JSON.stringify(banner)}`);
  }
}

/** The current file's settings and banners, so unchanged data is not rewritten. */
function readCurrent() {
  try {
    const text = readFileSync(OUTPUT, "utf8");
    return JSON.parse(text.slice(text.indexOf("= {") + 2, text.lastIndexOf("}") + 1));
  } catch {
    return { jpLagDays: 104, banners: [] };
  }
}

function render(data) {
  return `/**
 * Upcoming Global banners. GENERATED by scripts/refresh-banners.mjs, which
 * the "Refresh upcoming banners" GitHub workflow runs every day; hand edits
 * are overwritten on the next change upstream.
 *
 * Global runs the same banners as JP, in the same order, a few months later.
 * The source, Joe's Blue Archive Tools (${SOURCE_URL}),
 * maps JP's schedule onto Global dates, so everything here is a forecast that
 * Global may still merge, shorten or skip. banners-ui.js checks SchaleDB on
 * load for the banner that is actually live and marks it confirmed.
 *
 *   updated     when the banners last changed upstream
 *   jpLagDays   how far Global trails JP; used to place JP's live banner on
 *               the Global calendar when it is not in the list yet
 *   banners     earliest first. tag marks a limited unit ("Limited" or "Fes").
 */
const BANNER_DATA = ${JSON.stringify(data, null, 2)};
`;
}

async function main() {
  const htmlFlag = process.argv.indexOf("--html");
  const html =
    htmlFlag > 0
      ? readFileSync(process.argv[htmlFlag + 1], "utf8")
      : await fetch(SOURCE_URL, { headers: { "User-Agent": "blue-archive-planner banner refresh" } }).then(
          (response) => {
            if (!response.ok) throw new Error(`${SOURCE_URL}: HTTP ${response.status}`);
            return response.text();
          }
        );

  const banners = readBanners(parseRows(extractPayload(html)));
  validate(banners);

  const current = readCurrent();
  if (JSON.stringify(current.banners) === JSON.stringify(banners)) {
    console.log(`No change: ${banners.length} banners, same as before.`);
    return;
  }
  const updated = new Date().toISOString().slice(0, 10);
  writeFileSync(OUTPUT, render({ updated, jpLagDays: current.jpLagDays ?? 104, banners }));
  console.log(`Wrote ${banners.length} banners, ${banners[0].start} to ${banners.at(-1).end}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
