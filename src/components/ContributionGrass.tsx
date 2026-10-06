import { useEffect, useRef, useState } from "react";

type ContributionDay = { contributionCount: number; date: string; weekday: number };
type ContributionCalendar = { totalContributions: number; weeks: Array<{ contributionDays: ContributionDay[] }> };
type Tooltip = ContributionDay & { x: number; y: number };
type YearMeta = { year: number; totalContributions: number; activeDays: number };

const username = "cmosqueda";
const outputBase = `https://raw.githubusercontent.com/${username}/readme/output`;
const artworkUrl = `${outputBase}/output.png`;
/** Legacy sliding-window snapshot (kept as a fallback). */
const dataUrl = `${outputBase}/contributions.json`;
const yearsUrl = `${outputBase}/years.json`;
const yearDataUrl = (year: number) => `${outputBase}/contributions-${year}.json`;

const TARGET_FPS = 28;
const FRAME_MS = 1000 / TARGET_FPS;
/**
 * One fish per active day, so e.g. 20 commit-days in a year renders exactly
 * 20 fish. Capped well above 366 (a full leap year) so a busy year still
 * stays readable and cheap to draw.
 */
const MAX_FISH = 180;
/** Feed interaction tuning (all in low-res buffer pixels / seconds). */
const MAX_FEEDS = 6;
const ATTRACT_R = 64;
const EAT_R = 6;
const FEED_LIFE = 10;
/**
 * Low-res pixel buffer height. The scene is drawn 1px = 1 square here,
 * then upscaled with smoothing off — authentic chunky pixels, fewer fill
 * calls, and motion that snaps to the grid like 16-bit games.
 */
const LOW_H = 168;

/** Demo calendar for a full calendar year, seeded by year so local previews show distinct reefs per year. */
function createDemoCalendarForYear(year: number): ContributionCalendar {
  const rand = mulberry32(year * 31 + 7);
  const busyness = 0.3 + rand() * 0.45;
  const startWeekday = new Date(year, 0, 1).getDay();
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const totalDays = isLeap ? 366 : 365;
  const weeks: ContributionCalendar["weeks"] = [];
  let current: ContributionDay[] = [];
  for (let i = 0; i < totalDays; i += 1) {
    const date = new Date(year, 0, 1 + i);
    const weekday = (startWeekday + i) % 7;
    const roll = rand();
    const contributionCount = roll > busyness ? 0 : roll > busyness * 0.7 ? 1 : roll > busyness * 0.4 ? 4 : roll > busyness * 0.15 ? 9 : 18;
    current.push({ contributionCount, date: date.toISOString().slice(0, 10), weekday });
    if (current.length === 7) {
      weeks.push({ contributionDays: current });
      current = [];
    }
  }
  if (current.length > 0) weeks.push({ contributionDays: current });
  return { totalContributions: weeks.flatMap((week) => week.contributionDays).reduce((total, day) => total + day.contributionCount, 0), weeks };
}

function createDemoCalendar(): ContributionCalendar {
  return createDemoCalendarForYear(new Date().getFullYear());
}

function fishTier(count: number) {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 7) return 2;
  if (count < 14) return 3;
  return 4;
}

/** Deterministic PRNG so the school layout is stable per data snapshot. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tiny string hash so each contribution day maps to stable fish placement. */
function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Yearly scenery themes. The tank resets every January: each year picks a
 * theme by year (rotating, so consecutive years always look different) and
 * lays out its decor from a year-seeded PRNG, so revisiting a year shows
 * the same reef it had.
 */
type Scenery = {
  name: string;
  water: string[];
  surface: string;
  glint: string;
  ray: string;
  plankton: string;
  sand: string;
  sandDark: string;
  sandLine: string;
  speckleLight: string;
  speckleDark: string;
  kelp: string;
  kelpDark: string;
  rock: string;
};

const SCENERIES: Scenery[] = [
  {
    name: "Lagoon",
    water: ["#6fe3c1", "#4ed6b6", "#35c0c8", "#2aa8c4", "#1f8ab8", "#1a6fa8", "#155a94", "#10467e", "#0d3a6e"],
    surface: "#a7f3d0", glint: "#ecfdf5", ray: "#a7f3d0", plankton: "#d1fae5",
    sand: "#e8d49a", sandDark: "#fff7d6", sandLine: "#d9b96a",
    speckleLight: "#fff7d6", speckleDark: "#c49a52",
    kelp: "#22c55e", kelpDark: "#2e7d32", rock: "#8d7b68",
  },
  {
    name: "Ember Reef",
    water: ["#ffd6a5", "#ffb4a2", "#ff8fa3", "#e07a9a", "#c86b98", "#a8558f", "#7e3f7d", "#5e2f63", "#43204a"],
    surface: "#ffe5d9", glint: "#fff1e6", ray: "#ffd6a5", plankton: "#ffe5d9",
    sand: "#e9c46a", sandDark: "#fff3d6", sandLine: "#c98f3d",
    speckleLight: "#fff3d6", speckleDark: "#b07a3a",
    kelp: "#84cc16", kelpDark: "#4d7c0f", rock: "#7c4a21",
  },
  {
    name: "Abyss",
    water: ["#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e", "#082f49", "#041e2e"],
    surface: "#bae6fd", glint: "#e0f2fe", ray: "#7dd3fc", plankton: "#bae6fd",
    sand: "#9db4c0", sandDark: "#e0eef5", sandLine: "#5c6b73",
    speckleLight: "#e0eef5", speckleDark: "#4a5a63",
    kelp: "#2dd4bf", kelpDark: "#0f766e", rock: "#475569",
  },
  {
    name: "Kelp Forest",
    water: ["#bef264", "#a3e635", "#84cc16", "#65a30d", "#4d7c0f", "#3f6212", "#33520f", "#27420c", "#1a2e05"],
    surface: "#ecfccb", glint: "#f7fee7", ray: "#d9f99d", plankton: "#ecfccb",
    sand: "#d6c48f", sandDark: "#fff7d6", sandLine: "#a8894a",
    speckleLight: "#fff7d6", speckleDark: "#8a7440",
    kelp: "#16a34a", kelpDark: "#14532d", rock: "#6b5d4f",
  },
  {
    name: "Dusk Tide",
    water: ["#e9d5ff", "#d8b4fe", "#c084fc", "#a855f7", "#9333ea", "#7e22ce", "#6b21a8", "#581c87", "#3b0764"],
    surface: "#f3e8ff", glint: "#faf5ff", ray: "#d8b4fe", plankton: "#f3e8ff",
    sand: "#c4b5fd", sandDark: "#f1eaff", sandLine: "#7c6bb0",
    speckleLight: "#f1eaff", speckleDark: "#6d5fa3",
    kelp: "#34d399", kelpDark: "#065f46", rock: "#5b536e",
  },
];

function sceneryFor(year: number): Scenery {
  const idx = ((year % SCENERIES.length) + SCENERIES.length) % SCENERIES.length;
  const found = SCENERIES[idx];
  return found ?? SCENERIES[0]!;
}

const CORAL_POOL = ["#d90429", "#ff5d8f", "#e9c46a", "#ef476f", "#ff9e00", "#8338ec", "#3a86ff"];

function yearFromCalendar(cal: ContributionCalendar): number {
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  const last = days.length > 0 ? days[days.length - 1] : undefined;
  const parsed = last ? Number.parseInt(last.date.slice(0, 4), 10) : Number.NaN;
  return Number.isFinite(parsed) ? (parsed as number) : new Date().getFullYear();
}

type Species = "koi" | "tang" | "clown" | "purple" | "angel" | "puffer" | "turtle";

type SchoolFish = {
  day: ContributionDay;
  tier: 1 | 2 | 3 | 4;
  nx: number;
  yFrac: number;
  speed: number;
  dir: 1 | -1;
  depth: number;
  species: Species;
  phase: number;
  /** Munch cooldown after a bite — fish hovers instead of cruising. */
  eatT: number;
};

type Bubble = {
  nx: number;
  y: number;
  s: number;
  /** Slow upward drift (normalized units/sec) — kept lazy, not fizzy. */
  speed: number;
  /** Independent horizontal sway clock so bubbles drift different ways. */
  drift: number;
  swaySpeed: number;
  swayAmp: number;
  bobAmp: number;
};
type Crab = { nx: number; dir: 1 | -1; speed: number; phase: number };
type FishHit = { x: number; y: number; r: number; day: ContributionDay };
/** A dropped pinch of feed (normalized coords so it survives resizes). */
type Feed = { nx: number; ny: number; vy: number; amount: number; life: number; seed: number };
/** Crumbs that pop off a pellet when a fish bites it. */
type Crumb = { nx: number; ny: number; vx: number; vy: number; life: number };
/** Expanding "plop" ring where feed hits the water. */
type Ripple = { nx: number; ny: number; r: number; life: number };

const OUTLINE = "#0b1e2d";

function pickSpecies(rand: number, tier: number): Species {
  // Big catches get the rare silhouettes; small fry stay common.
  if (tier >= 4) {
    if (rand < 0.3) return "koi";
    if (rand < 0.55) return "tang";
    if (rand < 0.75) return "angel";
    return "turtle";
  }
  if (rand < 0.25) return "clown";
  if (rand < 0.45) return "purple";
  if (rand < 0.62) return "tang";
  if (rand < 0.76) return "koi";
  if (rand < 0.88) return "angel";
  return "puffer";
}

function paletteFor(species: Species) {
  switch (species) {
    case "koi": return { top: "#ff5a2a", mid: "#ff8c42", belly: "#fff4e0", fin: "#2b50aa", stripe: "#ffffff" };
    case "tang": return { top: "#123a8f", mid: "#2f7fe0", belly: "#d2ecff", fin: "#ffd23f" };
    case "clown": return { top: "#e85d04", mid: "#ff9e00", belly: "#ffecd2", fin: "#9d0208", stripe: "#ffffff" };
    case "purple": return { top: "#5a3fd4", mid: "#8b7bff", belly: "#e9e4ff", fin: "#2d1b8f" };
    case "angel": return { top: "#e8a100", mid: "#ffd60a", belly: "#fff3b0", fin: "#023e8a", stripe: "#3a0ca3" };
    case "puffer": return { top: "#d90429", mid: "#ff5d8f", belly: "#ffe5ec", fin: "#6a040f", stripe: "#ffffff" };
    case "turtle": return { top: "#5c4a1e", mid: "#7a6a2e", belly: "#c9e265", fin: "#2e7d32" };
    default: return { top: "#2f7fe0", mid: "#5fb4ff", belly: "#e8f6ff", fin: "#ffd23f" };
  }
}

function R(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}

/**
 * Blocky 16-bit fish drawn only with squares. Tier sets the footprint,
 * species sets the colorful palette. Tail alternates between 2 frames.
 */
function drawFish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tier: 1 | 2 | 3 | 4,
  species: Species,
  dir: 1 | -1,
  frame: boolean,
  highlight: boolean,
) {
  const c = paletteFor(species);
  // Footprint in buffer pixels: small fry vs. big catches.
  const len = tier === 1 ? 8 : tier === 2 ? 10 : tier === 3 ? 13 : 16;
  const h = tier === 1 ? 4 : tier === 2 ? 5 : tier === 3 ? 6 : 8;
  const d = dir;
  const x0 = d === 1 ? Math.round(x) : Math.round(x) - len;
  const y0 = Math.round(y);

  // Dark pixel outline.
  R(ctx, x0 - 1 - (d === 1 ? 2 : 0), y0 - 1, len + 3, h + 2, OUTLINE);
  // Tail: 2-frame wag (tail block jumps 1px up/down).
  const tailY = y0 + 1 + (frame ? -1 : 1);
  R(ctx, d === 1 ? x0 - 3 : x0 + len + 1, tailY, 2, 2, OUTLINE);
  R(ctx, d === 1 ? x0 - 2 : x0 + len, tailY, 1, 1, c.fin);
  // Body bands.
  R(ctx, x0 + 1, y0, len - 2, 1, c.top);
  R(ctx, x0, y0 + 1, len, h - 2, c.mid);
  R(ctx, x0 + 1, y0 + h - 1, len - 2, 1, c.belly);
  // Dorsal fin.
  R(ctx, x0 + Math.floor(len / 2) - 1, y0 - 1, 3, 1, c.fin);
  // Species patterning.
  if ((species === "koi" || species === "clown" || species === "puffer") && "stripe" in c && c.stripe) {
    R(ctx, x0 + 3, y0 + 1, 1, h - 2, c.stripe as string);
    R(ctx, x0 + len - 4, y0 + 1, 1, h - 2, species === "clown" ? OUTLINE : (c.stripe as string));
  }
  if (species === "angel") {
    R(ctx, x0 + 2, y0 + 1, 1, h - 2, (c as { stripe: string }).stripe);
    R(ctx, x0 + 5, y0 + 1, 1, h - 2, (c as { stripe: string }).stripe);
    R(ctx, x0 + len - 2, y0, 2, 1, c.fin);
  }
  if (species === "turtle") {
    // Flippers.
    R(ctx, x0 + 2, y0 - 1, 2, 1, c.fin);
    R(ctx, x0 + len - 4, y0 + h, 2, 1, c.fin);
    R(ctx, x0 + 3, y0 + 1, len - 6, h - 2, c.top);
  }
  // Eye.
  const ex = d === 1 ? x0 + len - 2 : x0 + 1;
  R(ctx, ex, y0 + 1, 1, 1, "#ffffff");
  R(ctx, ex, y0 + 1, 1, 1, OUTLINE);
  // Hover brackets.
  if (highlight) {
    R(ctx, x0 - 3, y0 - 3, 3, 1, "#ffffff");
    R(ctx, x0 - 3, y0 - 3, 1, 3, "#ffffff");
    R(ctx, x0 + len, y0 - 3, 3, 1, "#ffffff");
    R(ctx, x0 + len + 2, y0 - 3, 1, 3, "#ffffff");
    R(ctx, x0 - 3, y0 + h + 1, 3, 1, "#ffffff");
    R(ctx, x0 - 3, y0 + h - 1, 1, 3, "#ffffff");
    R(ctx, x0 + len, y0 + h + 1, 3, 1, "#ffffff");
    R(ctx, x0 + len + 2, y0 + h - 1, 1, 3, "#ffffff");
  }
}

function drawCrab(ctx: CanvasRenderingContext2D, x: number, y: number, frame: boolean) {
  const x0 = Math.round(x);
  const y0 = Math.round(y);
  R(ctx, x0 - 4, y0, 9, 1, OUTLINE);
  R(ctx, x0 - 3, y0 - 2, 7, 3, "#d90429");
  R(ctx, x0 - 3, y0 - 2, 7, 1, "#ff5d5d");
  R(ctx, x0 - 5, y0 - 1, 2, 2, "#9d0208");
  R(ctx, x0 + 4, y0 - 1, 2, 2, "#9d0208");
  R(ctx, x0 - 2 + (frame ? 1 : 0), y0 + 1, 1, 1, "#9d0208");
  R(ctx, x0 + 2 - (frame ? 1 : 0), y0 + 1, 1, 1, "#9d0208");
  R(ctx, x0 - 1, y0 - 1, 1, 1, OUTLINE);
  R(ctx, x0 + 1, y0 - 1, 1, 1, OUTLINE);
}

function drawKelp(ctx: CanvasRenderingContext2D, x: number, baseY: number, h: number, sway: number, color: string, dark = "#2e7d32") {
  const x0 = Math.round(x);
  for (let i = 0; i < h; i += 1) {
    const step = i > h * 0.5 ? sway : 0;
    R(ctx, x0 + step, baseY - i, 1, 1, i % 3 === 2 ? dark : color);
    if (i % 3 === 1) R(ctx, x0 + step + (i % 6 === 1 ? 1 : -1), baseY - i, 1, 1, color);
  }
}

function drawCoral(ctx: CanvasRenderingContext2D, x: number, baseY: number, color: string, tall: number, sway: number) {
  const x0 = Math.round(x);
  R(ctx, x0, baseY - tall, 2, tall, OUTLINE);
  R(ctx, x0, baseY - tall, 1, tall, color);
  R(ctx, x0 - 3 + sway, baseY - tall + 2, 3, 1, color);
  R(ctx, x0 + 1 + sway, baseY - tall + 4, 3, 1, color);
  R(ctx, x0 - 3 + sway, baseY - tall + 1, 1, 2, color);
  R(ctx, x0 + 3 + sway, baseY - tall + 3, 1, 2, color);
}

/** A pinch of feed: 1px brown crumbs with a dark outline, shrinking as eaten. */
function drawFeed(ctx: CanvasRenderingContext2D, x: number, y: number, amount: number, tick: number) {
  const x0 = Math.round(x);
  const y0 = Math.round(y);
  const wob = tick % 2 === 0 ? 0 : 1;
  // Soft chum shimmer so pellets are spottable while they sink.
  R(ctx, x0 - 2, y0 - 2, 5, 5, "rgba(255,248,220,0.25)");
  if (amount >= 3) {
    R(ctx, x0 - 1, y0 - 1, 3, 3, OUTLINE);
    R(ctx, x0 - 1, y0 - 1, 2, 2, "#a9743c");
    R(ctx, x0 + 1 + wob, y0, 2, 2, OUTLINE);
    R(ctx, x0 + 1 + wob, y0, 1, 1, "#7c4a21");
  } else if (amount === 2) {
    R(ctx, x0 - 1, y0, 3, 2, OUTLINE);
    R(ctx, x0 - 1, y0, 2, 1, "#a9743c");
  } else {
    R(ctx, x0, y0, 1, 1, "#a9743c");
  }
}

export default function ContributionGrass() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [calendar, setCalendar] = useState<ContributionCalendar>(createDemoCalendar);
  const [years, setYears] = useState<YearMeta[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [calendars, setCalendars] = useState<Record<number, ContributionCalendar>>({});
  const [hasLiveData, setHasLiveData] = useState(false);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  /** True while the manifest or a newly picked year is still fetching. */
  const [yearLoading, setYearLoading] = useState(true);
  const requestRef = useRef(0);
  /** Random pinch of feed for the button / keyboard users. */
  const feedRef = useRef<() => void>(() => {});
  const calendarsRef = useRef<Record<number, ContributionCalendar>>({});
  calendarsRef.current = calendars;
  /** Collapsible year picker overlay inside the tank. */
  const [yearOpen, setYearOpen] = useState(false);
  const yearBoxRef = useRef<HTMLDivElement>(null);

  // Close the year picker on outside click or Escape.
  useEffect(() => {
    if (!yearOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (yearBoxRef.current && !yearBoxRef.current.contains(event.target as Node)) setYearOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setYearOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [yearOpen]);

  // Load the year manifest, then the selected year's snapshot. Each year is
  // its own tank: empty in January, one fish per active day, scenery by year.
  useEffect(() => {
    const controller = new AbortController();
    const cacheKey = new Date().toISOString().slice(0, 10);
    setYearLoading(true);
    const loadYear = (year: number, signal: AbortSignal) =>
      fetch(`${yearDataUrl(year)}?v=${cacheKey}`, { signal })
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`No data for ${year}`))))
        .then((data: ContributionCalendar) => {
          if (signal.aborted) return;
          setCalendars((prev) => ({ ...prev, [year]: data }));
          setCalendar(data);
          setHasLiveData(true);
          setYearLoading(false);
        });
    fetch(`${yearsUrl}?v=${cacheKey}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("No year manifest"))))
      .then((metas: YearMeta[]) => {
        const sorted = [...metas].sort((a, b) => a.year - b.year);
        setYears(sorted);
        const latest = sorted.length > 0 ? sorted[sorted.length - 1] : undefined;
        const year = latest ? latest.year : new Date().getFullYear();
        setSelectedYear(year);
        return loadYear(year, controller.signal);
      })
      .catch(() => {
        // Legacy fallback: single sliding-window snapshot.
        fetch(`${dataUrl}?v=${cacheKey}`, { signal: controller.signal })
          .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Contribution data is unavailable"))))
          .then((data: ContributionCalendar) => {
            if (controller.signal.aborted) return;
            const year = yearFromCalendar(data);
            const activeDays = data.weeks.flatMap((w) => w.contributionDays).filter((d) => d.contributionCount > 0).length;
            setYears([{ year, totalContributions: data.totalContributions, activeDays }]);
            setSelectedYear(year);
            setCalendars({ [year]: data });
            setCalendar(data);
            setHasLiveData(true);
            setYearLoading(false);
          })
          .catch((error: unknown) => {
            if (!(error instanceof DOMException && error.name === "AbortError")) {
              // Local/demo mode: synthesize 3 demo years so the collapsible
              // year picker is visible and testable without live data.
              const nowYear = new Date().getFullYear();
              const demoYears = [nowYear - 2, nowYear - 1, nowYear];
              const demoCalendars: Record<number, ContributionCalendar> = {};
              const demoMetas: YearMeta[] = demoYears.map((year) => {
                const cal = createDemoCalendarForYear(year);
                demoCalendars[year] = cal;
                const activeDays = cal.weeks.flatMap((w) => w.contributionDays).filter((d) => d.contributionCount > 0).length;
                return { year, totalContributions: cal.totalContributions, activeDays };
              });
              setYears(demoMetas);
              setSelectedYear(nowYear);
              setCalendars(demoCalendars);
              setCalendar(demoCalendars[nowYear] ?? createDemoCalendar());
              setHasLiveData(false);
              setYearLoading(false);
            }
          });
      });
    return () => controller.abort();
  }, []);

  // Switching years swaps in that year's preserved reef (cached after load).
  // Uncached years keep showing the current reef with a loading overlay until
  // the fetch resolves, so the year label, scenery, and fish swap atomically.
  const selectYear = (year: number) => {
    if (yearLoading || year === selectedYear) return;
    const cached = calendarsRef.current[year];
    if (cached) {
      setSelectedYear(year);
      setTooltip(null);
      setCalendar(cached);
      return;
    }
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setYearLoading(true);
    setTooltip(null);
    const cacheKey = new Date().toISOString().slice(0, 10);
    fetch(`${yearDataUrl(year)}?v=${cacheKey}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`No data for ${year}`))))
      .then((data: ContributionCalendar) => {
        if (requestRef.current !== requestId) return;
        setCalendars((prev) => ({ ...prev, [year]: data }));
        setCalendar(data);
        setSelectedYear(year);
        setYearLoading(false);
      })
      .catch(() => {
        // Keep the current reef on failure; the selector stays put.
        if (requestRef.current === requestId) setYearLoading(false);
      });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const view = canvas.getContext("2d");
    if (!view) return;
    // Low-res pixel buffer: everything is squares in here.
    const buf = document.createElement("canvas");
    const ctx = buf.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const days = calendar.weeks.flatMap((week) => week.contributionDays);
    // The tank resets every January: scenery is seeded by year alone so a
    // revisited year shows the same reef, while fish are seeded per day so
    // each active day keeps its own fish as the year fills in.
    const year = selectedYear ?? yearFromCalendar(calendar);
    const scenery = sceneryFor(year);
    const decorRand = mulberry32(year * 97 + 13);

    const hovered = { index: -1 };
    const hits: FishHit[] = [];
    /** Indices of fish currently darting at feed (for a faster tail wag). */
    const seeking = new Set<number>();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let inView = true;
    let documentVisible = !document.hidden;
    let raf = 0;
    let lastFrame = 0;
    let lastTime = 0;
    let width = 0;
    let height = 0;
    let sandTop = 0;
    let scale = 1;

    // The school IS the contributions: each fish carries one active day.
    const active = days.filter((d) => d.contributionCount > 0).sort((a, b) => b.contributionCount - a.contributionCount);
    const chosen = active.slice(0, MAX_FISH);
    const school: SchoolFish[] = chosen.map((day, i) => {
      const frand = mulberry32(hashStr(day.date) || 7);
      const tier = Math.max(1, fishTier(day.contributionCount)) as 1 | 2 | 3 | 4;
      const species = pickSpecies(frand(), tier);
      const depth = 0.55 + frand() * 0.45;
      return {
        day,
        tier,
        nx: frand(),
        yFrac: 0.08 + frand() * 0.7,
        speed: (tier >= 4 ? 26 : tier === 3 ? 20 : 13) + frand() * 14,
        dir: (i % 4 === 0 ? -1 : 1) as 1 | -1,
        depth,
        species,
        phase: frand() * Math.PI * 2,
        eatT: 0,
      };
    });
    school.sort((a, b) => a.depth - b.depth);
    // Dropped feed + bite crumbs. Capped + short-lived so it stays cheap.
    const feeds: Feed[] = [];
    const crumbs: Crumb[] = [];
    const ripples: Ripple[] = [];

    const bubbles: Bubble[] = Array.from({ length: 22 }, (_, i) => ({
      nx: decorRand(),
      y: decorRand(),
      s: decorRand() < 0.7 ? 2 : 3,
      // ~5x slower than before: lazy rise, some barely hover.
      speed: 0.008 + decorRand() * 0.02,
      // Stagger phases/directions: even/odd sway opposite ways at own pace.
      drift: decorRand() * Math.PI * 2,
      swaySpeed: (0.35 + decorRand() * 0.85) * (i % 2 === 0 ? 1 : -1),
      swayAmp: 1 + Math.floor(decorRand() * 3),
      bobAmp: decorRand() < 0.4 ? 1 : 0,
    }));
    const crabs: Crab[] = [
      { nx: 0.3, dir: 1, speed: 0.008, phase: decorRand() * 6 },
      { nx: 0.55, dir: -1, speed: 0.006, phase: decorRand() * 6 },
    ];
    const speckles = Array.from({ length: 120 }, () => ({ nx: decorRand(), yFrac: decorRand(), light: decorRand() < 0.4 }));
    const kelpSpots = Array.from({ length: 7 + Math.floor(decorRand() * 5) }, () => ({ nx: decorRand(), h: 8 + Math.floor(decorRand() * 10) }));
    const hutNx = 0.2 + decorRand() * 0.5;
    const coralPool = [...CORAL_POOL].sort(() => decorRand() - 0.5);
    const coralSpots = [0.06, 0.38, 0.68, 0.84].map((base, i) => ({
      nx: Math.min(0.95, Math.max(0.05, base + (decorRand() - 0.5) * 0.08)),
      color: coralPool[i % coralPool.length] ?? "#ef476f",
      tall: 7 + Math.floor(decorRand() * 5),
    }));

    const ensureSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return false;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.round(rect.width);
      height = Math.round(Math.max(240, Math.min(330, rect.width * 0.52)));
      if (canvas.width !== Math.round(width * pixelRatio) || canvas.height !== Math.round(height * pixelRatio)) {
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
      }
      view.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      view.imageSmoothingEnabled = false;
      // Size the pixel buffer from the display aspect: small squares, cheap fills.
      const bw = Math.max(240, Math.min(480, Math.round((LOW_H * width) / height)));
      if (buf.width !== bw || buf.height !== LOW_H) {
        buf.width = bw;
        buf.height = LOW_H;
      }
      sandTop = Math.round(LOW_H * 0.66);
      scale = width / buf.width;
      return true;
    };

    // Banded water — flat squares, no gradients. Palette swaps per year.
    const WATER = scenery.water;
    const drawWater = (tick: number) => {
      const BW = buf.width;
      const bandH = Math.max(1, Math.floor(sandTop / WATER.length));
      WATER.forEach((color, i) => {
        R(ctx, 0, i * bandH, BW, i === WATER.length - 1 ? sandTop - i * bandH + 1 : bandH, color);
      });
      // Pixel surface with a blocky wave.
      R(ctx, 0, 0, BW, 4, scenery.surface);
      for (let x = 0; x < BW; x += 4) {
        const wob = (x % 8 === 0 ? 1 : 0) + (tick % 2 === 0 && x % 16 === 0 ? 1 : 0);
        R(ctx, x, 4 + wob, 3, 1, scenery.glint);
      }
      // Stepped light rays (dithered squares, quantized drift).
      const drift = tick % 4;
      for (let r = 0; r < 3; r += 1) {
        const base = Math.floor(BW * (0.22 + r * 0.26)) + drift;
        for (let y = 0; y < sandTop; y += 2) {
          const x = base + Math.floor(y * 0.25);
          if (((x + y) & 1) === 0) R(ctx, x, y, 2, 1, scenery.ray);
        }
      }
      // Sparse drifting plankton squares.
      for (let i = 0; i < 24; i += 1) {
        const px = (i * 53 + tick) % BW;
        const py = (i * 37) % sandTop;
        if (((px + py) & 3) === 0) R(ctx, px, py, 1, 1, scenery.plankton);
      }
    };

    const drawSand = (tick: number) => {
      const BW = buf.width;
      const BH = buf.height;
      // Jagged dune edge + outline, all squares.
      for (let x = 0; x < BW; x += 1) {
        const dune = Math.round(Math.sin(x / 18) * 2 + Math.sin(x / 7) * 1);
        const top = sandTop + dune;
        R(ctx, x, top, 1, 1, scenery.sandDark);
        R(ctx, x, top + 1, 1, BH - top, scenery.sand);
      }
      R(ctx, 0, sandTop + 5, BW, 1, scenery.sandLine);
      speckles.forEach((s) => {
        R(ctx, s.nx * BW, sandTop + 7 + s.yFrac * (BH - sandTop - 9), 1, 1, s.light ? scenery.speckleLight : scenery.speckleDark);
      });
      // Seaweed blobs + kelp + corals + a tiny hut, like the reference.
      kelpSpots.forEach((k, i) => {
        const sway = (tick % 4 < 2 ? 1 : -1) * (i % 2 === 0 ? 1 : 0);
        drawKelp(ctx, k.nx * BW, BH - 4, k.h, sway, scenery.kelp, scenery.kelpDark);
      });
      coralSpots.forEach((c, i) => {
        const sway = tick % 4 < 2 ? 1 : 0;
        drawCoral(ctx, c.nx * BW, BH - 3, c.color, c.tall, i % 2 === 0 ? sway : -sway);
        R(ctx, c.nx * BW - 3, BH - 3, 7, 2, scenery.rock);
      });
      // Hut ruin (drifts along the sand year to year).
      const hx = Math.floor(BW * hutNx);
      const hy = BH - 4;
      R(ctx, hx - 12, hy - 12, 24, 2, "#7c4a21");
      R(ctx, hx - 10, hy - 10, 20, 8, "#a9743c");
      R(ctx, hx - 3, hy - 8, 6, 6, "#2d1c0e");
      R(ctx, hx - 10, hy - 3, 3, 1, "#5c3a1a");
      R(ctx, hx + 7, hy - 3, 3, 1, "#5c3a1a");
      // Crabs shuffling on the sand.
      crabs.forEach((crab) => {
        drawCrab(ctx, crab.nx * BW, BH - 3, tick % 2 === 0);
      });
      // Foreground silhouette blades at edges.
      R(ctx, 1, sandTop - 6, 2, 8, "#14532d");
      R(ctx, BW - 3, sandTop - 8, 2, 10, "#14532d");
    };

    const step = (dt: number, time: number, tick: number) => {
      const BW = buf.width;
      if (dt > 0) {
        const dtS = Math.min(0.05, dt / 1000);
        school.forEach((fish) => {
          const pxPerSec = fish.speed * (0.5 + fish.depth * 0.7);
          fish.nx += ((fish.dir * pxPerSec * dtS) / Math.max(1, width)) * (width / 900 + 0.6);
          if (fish.dir === 1 && fish.nx > 1.1) {
            fish.nx = -0.1;
            fish.yFrac = 0.08 + Math.random() * 0.7;
          } else if (fish.dir === -1 && fish.nx < -0.1) {
            fish.nx = 1.1;
            fish.yFrac = 0.08 + Math.random() * 0.7;
          }
          // Gentle vertical wander so cruising paths feel alive, not railed.
          const span0 = Math.max(1, sandTop - 22);
          fish.yFrac = Math.min(
            0.95,
            Math.max(0.02, fish.yFrac + (Math.sin(time / 1700 + fish.phase * 2) * 9 * dtS) / span0),
          );
          if (fish.eatT > 0) fish.eatT -= dtS;
        });
        // Feed pellets sink, expire, and get nibbled away.
        const floorNy = (sandTop - 2) / LOW_H;
        for (let i = feeds.length - 1; i >= 0; i -= 1) {
          const f = feeds[i];
          if (!f) continue;
          f.life -= dtS;
          if (f.ny < floorNy) f.ny = Math.min(floorNy, f.ny + f.vy * dtS);
          if (f.life <= 0 || f.amount <= 0) feeds.splice(i, 1);
        }
        for (let i = crumbs.length - 1; i >= 0; i -= 1) {
          const c = crumbs[i];
          if (!c) continue;
          c.life -= dtS;
          c.nx += c.vx * dtS;
          c.ny += c.vy * dtS;
          c.vy += 0.05 * dtS;
          if (c.life <= 0) crumbs.splice(i, 1);
        }
        for (let i = ripples.length - 1; i >= 0; i -= 1) {
          const rp = ripples[i];
          if (!rp) continue;
          rp.life -= dtS;
          rp.r += 14 * dtS;
          if (rp.life <= 0) ripples.splice(i, 1);
        }
        // Nearby fish steer toward the closest pellet and take bites.
        seeking.clear();
        let eaten: Feed | null = null;
        school.forEach((fish, si) => {
          if (fish.eatT > 0 || feeds.length === 0) return;
          const fx = fish.nx * BW;
          const fy = 6 + fish.yFrac * (sandTop - 22);
          let best: Feed | null = null;
          let bestD = ATTRACT_R;
          for (const f of feeds) {
            const dx = f.nx * BW - fx;
            const dy = f.ny * LOW_H - fy;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < bestD) {
              bestD = d;
              best = f;
            }
          }
          const target = best;
          if (!target) return;
          seeking.add(si);
          const tx = target.nx - fish.nx;
          const ty = target.ny * LOW_H - fy;
          if (Math.abs(tx * BW) > 2) fish.dir = tx > 0 ? 1 : -1;
          const agility = 0.7 + fish.depth * 0.5;
          const stepX = ((34 / BW) * agility * dtS);
          fish.nx += Math.max(-stepX, Math.min(stepX, tx));
          const span = Math.max(1, sandTop - 22);
          const stepY = ((30 / span) * agility * dtS);
          fish.yFrac = Math.min(0.95, Math.max(0.02, fish.yFrac + Math.max(-stepY, Math.min(stepY, ty / span))));
          if (bestD < EAT_R + fish.tier) {
            target.amount -= 1;
            fish.eatT = 0.7;
            for (let k = 0; k < 2; k += 1) {
              crumbs.push({
                nx: target.nx + (Math.random() - 0.5) * 0.012,
                ny: target.ny - 0.004,
                vx: (Math.random() - 0.5) * 0.03,
                vy: -0.015 - Math.random() * 0.02,
                life: 0.55,
              });
            }
            if (crumbs.length > 30) crumbs.splice(0, crumbs.length - 30);
            if (target.amount <= 0) eaten = target;
          }
        });
        if (eaten) feeds.splice(feeds.indexOf(eaten), 1);
        bubbles.forEach((b) => {
          b.y -= b.speed * dtS;
          // Each bubble sways on its own clock/direction — not in sync.
          b.drift += b.swaySpeed * dtS;
          if (b.y < -0.02) {
            b.y = 1.02;
            b.nx = Math.random();
          }
        });
        crabs.forEach((crab) => {
          crab.nx += crab.dir * crab.speed * dtS;
          if (crab.nx > 0.95) crab.dir = -1;
          if (crab.nx < 0.05) crab.dir = 1;
        });
      }
      drawWater(tick);
      drawSand(tick);

      hits.length = 0;
      // Feed pellets sit under the fish so a bite looks like a bite.
      // Sinking pellets wobble 1px side to side as they fall.
      feeds.forEach((f) => {
        const wob = Math.round(Math.sin(time / 480 + f.seed * Math.PI * 2) * 1);
        drawFeed(ctx, f.nx * BW + wob, f.ny * LOW_H, f.amount, tick);
      });
      // Expanding "plop" rings where feed landed.
      ripples.forEach((rp) => {
        const rr = Math.round(rp.r);
        const cx = Math.round(rp.nx * BW);
        const cy = Math.round(rp.ny * LOW_H);
        R(ctx, cx - rr, cy - 1, rr * 2, 1, "#ecfdf5");
        R(ctx, cx - rr, cy + 1, rr * 2, 1, "#ecfdf5");
        R(ctx, cx - rr, cy - 1, 1, 3, "#ecfdf5");
        R(ctx, cx + rr - 1, cy - 1, 1, 3, "#ecfdf5");
      });
      school.forEach((fish, i) => {
        // Snap to whole buffer pixels — motion stays on the grid.
        const fx = Math.round(fish.nx * BW);
        const fy = Math.round(6 + fish.yFrac * (sandTop - 22) + Math.round(Math.sin(time / 800 + fish.phase) * 1.5));
        // Blocky depth shadow.
        R(ctx, fx - 4, fy + 8, 9, 1, "#0a2e4a");
        const excited = seeking.has(i) || fish.eatT > 0;
        const frame = Math.floor(time / (excited ? 130 : 260) + fish.phase) % 2 === 0;
        drawFish(ctx, fx, fy, fish.tier, fish.species, fish.dir, frame, i === hovered.index);
        if (fish.eatT > 0) {
          // Munch sparkle at the mouth.
          const len = fish.tier === 1 ? 8 : fish.tier === 2 ? 10 : fish.tier === 3 ? 13 : 16;
          const mx = fish.dir === 1 ? fx + Math.floor(len / 2) : fx - Math.floor(len / 2);
          R(ctx, mx, fy, 1, 1, "#ffffff");
          R(ctx, mx + (tick % 2 === 0 ? 1 : -1), fy - 1, 1, 1, "#fff8dc");
        }
        hits.push({ x: fx * scale, y: (fy + 3) * scale, r: Math.max(16, (fish.tier * 7 + 8) * scale * 0.6), day: fish.day });
      });
      // Bite crumbs drift down and fade.
      crumbs.forEach((c) => {
        R(ctx, c.nx * BW, c.ny * LOW_H, 1, 1, "#fff8dc");
      });

      // Hollow-square bubbles: quantized 1px steps, each its own direction.
      bubbles.forEach((b) => {
        const sway = Math.round(Math.sin(b.drift) * b.swayAmp);
        const bob = b.bobAmp === 0 ? 0 : Math.round(Math.cos(b.drift * 0.7) * b.bobAmp);
        const bx = Math.round(b.nx * BW + sway);
        const by = Math.round(4 + b.y * (sandTop - 8) + bob);
        const s = b.s;
        R(ctx, bx, by, s, 1, "#d1fae5");
        R(ctx, bx, by + s - 1, s, 1, "#d1fae5");
        R(ctx, bx, by, 1, s, "#d1fae5");
        R(ctx, bx + s - 1, by, 1, s, "#d1fae5");
      });

      if (school.length === 0) {
        ctx.fillStyle = "#ecfdf5";
        ctx.font = "8px monospace";
        ctx.textAlign = "center";
        ctx.fillText("NO CONTRIBUTIONS - QUIET WATER", Math.floor(BW / 2), Math.floor(sandTop / 2));
        ctx.textAlign = "start";
      }

      // Upscale: one blit, smoothing off = big crisp squares.
      view.imageSmoothingEnabled = false;
      view.clearRect(0, 0, width, height);
      view.drawImage(buf, 0, 0, buf.width, buf.height, 0, 0, width, height);
    };

    const draw = (time = 0) => {
      if (!ensureSize()) return;
      if (reducedMotion) {
        lastTime = time;
        step(0, 0, 0);
        return;
      }
      if (time - lastFrame < FRAME_MS) {
        raf = inView && documentVisible ? requestAnimationFrame(draw) : 0;
        return;
      }
      const dt = lastTime ? time - lastTime : FRAME_MS;
      lastFrame = time;
      lastTime = time;
      // Quantized tick: background sways in whole-pixel steps, 2 per frame.
      const tick = Math.floor(time / (FRAME_MS * 2));
      step(dt, time, tick);
      raf = inView && documentVisible ? requestAnimationFrame(draw) : 0;
    };

    const dropAt = (nxFrac: number, nyFrac: number) => {
      const maxNy = (sandTop - 2) / LOW_H;
      const nx = Math.min(0.98, Math.max(0.02, nxFrac));
      const ny = Math.min(maxNy, Math.max(0.04, nyFrac));
      feeds.push({
        nx,
        ny,
        vy: 0.09 + Math.random() * 0.05,
        amount: 3,
        life: FEED_LIFE,
        seed: Math.random(),
      });
      if (feeds.length > MAX_FEEDS) feeds.splice(0, feeds.length - MAX_FEEDS);
      // "Plop" ring where the pinch lands.
      ripples.push({ nx, ny, r: 1, life: 0.7 });
      if (ripples.length > 8) ripples.splice(0, ripples.length - 8);
      if (reducedMotion) draw();
    };
    // Exposed for the accessible "drop feed" button (random pinch near the top).
    feedRef.current = () => {
      dropAt(0.15 + Math.random() * 0.7, 0.06);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      for (let i = hits.length - 1; i >= 0; i -= 1) {
        const h = hits[i];
        if (!h) continue;
        const dx = x - h.x;
        const dy = y - h.y;
        if (dx * dx + dy * dy <= h.r * h.r) {
          hovered.index = i;
          setTooltip({ ...h.day, x, y });
          if (reducedMotion) draw();
          return;
        }
      }
      if (hovered.index !== -1) {
        hovered.index = -1;
        setTooltip(null);
        if (reducedMotion) draw();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        dropAt((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
      }
      onPointerMove(event);
    };
    const clearPointer = () => {
      hovered.index = -1;
      setTooltip(null);
      if (reducedMotion) draw();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? false;
        if (inView && !reducedMotion && documentVisible && !raf) {
          lastFrame = 0;
          raf = requestAnimationFrame(draw);
        }
      },
      { threshold: 0.05 },
    );
    const onVisibilityChange = () => {
      documentVisible = !document.hidden;
      if (documentVisible && inView && !reducedMotion && !raf) {
        lastFrame = 0;
        raf = requestAnimationFrame(draw);
      }
    };
    const resizeObserver = new ResizeObserver(() => {
      if (reducedMotion) draw();
      else if (!raf && inView && documentVisible) raf = requestAnimationFrame(draw);
    });
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerleave", clearPointer);
    document.addEventListener("visibilitychange", onVisibilityChange);
    observer.observe(canvas);
    resizeObserver.observe(canvas);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerleave", clearPointer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [calendar, selectedYear]);

  const displayYear = selectedYear ?? yearFromCalendar(calendar);
  const activeDays = calendar.weeks.flatMap((w) => w.contributionDays).filter((d) => d.contributionCount > 0).length;
  const sceneryName = sceneryFor(displayYear).name;

  return (
    <div className="github-grass-card">
      <div className="github-grass-heading">
        <span>Contribution aquarium · {displayYear} reef</span>
        <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer">
          @{username}
        </a>
      </div>
      <div className="contribution-aquarium">
        {years.length > 1 && selectedYear !== null && (
          <div className="aquarium-year" ref={yearBoxRef}>
            <button
              type="button"
              className="aquarium-feed-btn aquarium-year-toggle"
              aria-expanded={yearOpen}
              aria-haspopup="listbox"
              onClick={() => setYearOpen((open) => !open)}
              title="Show reefs from past years"
              disabled={yearLoading}
            >
              {yearLoading ? "Loading…" : `${displayYear} ${yearOpen ? "▾" : "▸"}`}
            </button>
            {yearOpen && !yearLoading && (
              <ul className="aquarium-year-list" role="listbox" aria-label="Select aquarium year">
                {[...years].reverse().map((meta) => (
                  <li key={meta.year}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={meta.year === selectedYear}
                      className={meta.year === selectedYear ? "aquarium-year-option aquarium-year-option--active" : "aquarium-year-option"}
                      onClick={() => {
                        selectYear(meta.year);
                        setYearOpen(false);
                      }}
                    >
                      {meta.year} · {meta.activeDays} fish
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {yearLoading && (
          <div className="aquarium-loading" role="status" aria-live="polite">
            <span>Loading {selectedYear ? `${selectedYear} ` : ""}reef…</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="contribution-aquarium-canvas"
          aria-label={`${calendar.totalContributions} GitHub contributions in ${displayYear} visualized as pixel fish in the ${sceneryName} reef. Activate the Drop feed button or click the tank to feed them.`}
          title="Click to drop fish feed"
        />
        <button
          type="button"
          className="aquarium-feed-btn aquarium-feed-btn--overlay"
          onClick={() => feedRef.current()}
          title="Drop a pinch of fish feed"
        >
          Drop feed
        </button>
        {tooltip && (
          <div className="contribution-aquarium-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            {tooltip.date} · {tooltip.contributionCount}{" "}
            {tooltip.contributionCount === 1 ? "contribution" : "contributions"}
          </div>
        )}
      </div>
      <noscript>
        <img src={artworkUrl} alt="GitHub contribution artwork" className="github-grass-image" loading="lazy" />
      </noscript>
      <p>
        {hasLiveData
          ? `${displayYear} ${sceneryName} reef — ${activeDays} active ${activeDays === 1 ? "day" : "days"} = ${Math.min(activeDays, MAX_FISH)} fish, ${calendar.totalContributions} contributions. The tank resets every January with new scenery; pick a year to revisit its reef. Hover a fish, or click the water to drop feed and watch them swarm it.`
          : "Demo reefs shown locally — use the year toggle in the tank to preview past years. Live GitHub activity refreshes daily after the workflow runs. Click the water to drop feed."}
      </p>
    </div>
  );
}
