// Build-time real Git commit history aggregator for the Credits page's 52-week static SVG heatmap.
// Reads `git log --format=%cs` once per build and degrades gracefully when Git history is unavailable.
import { execFileSync } from "node:child_process";

const DAY_MS = 86_400_000;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function toIsoUtc(date) {
  return date.toISOString().slice(0, 10);
}

function parseIsoUtc(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function intensityLevel(count, maxPerDay) {
  if (!count || count <= 0) return 0;
  if (maxPerDay <= 4) return Math.min(4, count);
  return Math.min(4, Math.max(1, Math.ceil(Math.sqrt(count / maxPerDay) * 4)));
}

export function buildHeatmapGrid(dateCounts, { endDate, weeks = 52 } = {}) {
  const counts = new Map();
  let latestDate = null;
  for (const [day, raw] of Object.entries(dateCounts ?? {})) {
    const n = Number(raw);
    if (!ISO_DAY.test(day) || !Number.isFinite(n) || n <= 0) continue;
    counts.set(day, n);
    if (!latestDate || day > latestDate) latestDate = day;
  }

  const end = endDate && ISO_DAY.test(endDate)
    ? parseIsoUtc(endDate)
    : latestDate
      ? parseIsoUtc(latestDate)
      : new Date();
  const endIso = toIsoUtc(end);

  // Align the grid to end on the Saturday of `end`'s week (GitHub convention: Sun=0..Sat=6).
  const endDow = end.getUTCDay();
  const gridEnd = new Date(end.getTime() + (6 - endDow) * DAY_MS);
  const totalDays = weeks * 7;
  const gridStart = new Date(gridEnd.getTime() - (totalDays - 1) * DAY_MS);
  const startIso = toIsoUtc(gridStart);

  let totalCommits = 0;
  let activeDays = 0;
  let maxPerDay = 0;

  // First pass: calculate range totals & max inside the displayed window.
  for (let i = 0; i < totalDays; i++) {
    const dayIso = toIsoUtc(new Date(gridStart.getTime() + i * DAY_MS));
    if (dayIso > endIso) continue;
    const count = counts.get(dayIso) ?? 0;
    if (count > 0) {
      totalCommits += count;
      activeDays++;
      if (count > maxPerDay) maxPerDay = count;
    }
  }

  // Second pass: emit week columns with month markers.
  const columns = [];
  let prevMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const days = [];
    let monthKey = null;
    for (let d = 0; d < 7; d++) {
      const dateObj = new Date(gridStart.getTime() + (w * 7 + d) * DAY_MS);
      const iso = toIsoUtc(dateObj);
      const future = iso > endIso;
      const count = future ? 0 : (counts.get(iso) ?? 0);
      const month = dateObj.getUTCMonth();
      if (d === 0 && month !== prevMonth) {
        monthKey = `${dateObj.getUTCFullYear()}-${String(month + 1).padStart(2, "0")}`;
        prevMonth = month;
      }
      days.push({
        date: iso,
        count,
        level: future ? 0 : intensityLevel(count, maxPerDay),
        future,
      });
    }
    columns.push({ index: w, monthKey, days });
  }

  return {
    totalCommits,
    activeDays,
    maxPerDay,
    latestDate: latestDate && latestDate >= startIso ? latestDate : null,
    startDate: startIso,
    endDate: endIso,
    weeks: columns,
  };
}

const cache = new Map();

export function getGitActivity({ cwd = process.cwd(), weeks = 52, now } = {}) {
  const cacheKey = `${cwd}:${weeks}:${now ?? ""}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const dateCounts = {};
  try {
    const stdout = execFileSync(
      "git",
      ["log", "--format=%cs", `--since=${weeks * 7 + 14} days ago`],
      { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 5000 },
    );
    for (const line of stdout.split(/\r?\n/)) {
      const day = line.trim();
      if (!ISO_DAY.test(day)) continue;
      dateCounts[day] = (dateCounts[day] ?? 0) + 1;
    }
  } catch {
    // Missing git binary or non-git tarball: return an honest empty heatmap.
  }
  const endDate = now ?? Object.keys(dateCounts).sort().at(-1) ?? toIsoUtc(new Date());
  const result = buildHeatmapGrid(dateCounts, { endDate, weeks });
  cache.set(cacheKey, result);
  return result;
}
