import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";

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
type SceneryTheme = "shipwreck" | "aquarium" | "temple" | "abyss" | "kelp";

type Scenery = {
  name: string;
  theme: SceneryTheme;
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
  isNight: boolean;
};

const SCENERIES_NIGHT: Scenery[] = [
  {
    name: "Coral Galleon",
    theme: "shipwreck",
    water: ["#1e293b", "#0f172a", "#172554", "#1e1b4b", "#111827", "#090d16", "#050810", "#03050a", "#010205"],
    surface: "#38bdf8", glint: "#93c5fd", ray: "#38bdf8", plankton: "#38bdf8",
    sand: "#1e293b", sandDark: "#334155", sandLine: "#0f172a",
    speckleLight: "#22d3ee", speckleDark: "#020617",
    kelp: "#0d9488", kelpDark: "#115e59", rock: "#090d16",
    isNight: true,
  },
  {
    name: "Sunken Temple",
    theme: "temple",
    water: ["#0f172a", "#082f49", "#0c4a6e", "#075985", "#0369a1", "#024a77", "#023253", "#011e33", "#01101c"],
    surface: "#67e8f9", glint: "#a5f3fc", ray: "#22d3ee", plankton: "#67e8f9",
    sand: "#1e293b", sandDark: "#334155", sandLine: "#0f172a",
    speckleLight: "#38bdf8", speckleDark: "#031d2e",
    kelp: "#0d9488", kelpDark: "#042f2e", rock: "#0b1322",
    isNight: true,
  },
  {
    name: "Abyssal Reef",
    theme: "abyss",
    water: ["#1e1b4b", "#2e1065", "#3b0764", "#4a044e", "#37033d", "#28012e", "#1b0020", "#100014", "#08000a"],
    surface: "#e9d5ff", glint: "#f5d0fe", ray: "#c084fc", plankton: "#f0abfc",
    sand: "#1e1b4b", sandDark: "#312e81", sandLine: "#0f172a",
    speckleLight: "#e879f9", speckleDark: "#020617",
    kelp: "#9333ea", kelpDark: "#581c87", rock: "#020617",
    isNight: true,
  },
  {
    name: "Kelp Forest",
    theme: "kelp",
    water: ["#052e16", "#042612", "#021d0d", "#02170b", "#011208", "#010d05", "#010a04", "#000703", "#000401"],
    surface: "#86efac", glint: "#bbf7d0", ray: "#4ade80", plankton: "#86efac",
    sand: "#1c1917", sandDark: "#292524", sandLine: "#0c0a09",
    speckleLight: "#4ade80", speckleDark: "#0c0a09",
    kelp: "#15803d", kelpDark: "#14532d", rock: "#1c1917",
    isNight: true,
  },
  {
    name: "Aquarium Park",
    theme: "aquarium",
    water: ["#0284c7", "#0369a1", "#075985", "#0c4a6e", "#082f49", "#041e2e", "#021524", "#010e1a", "#000810"],
    surface: "#38bdf8", glint: "#7dd3fc", ray: "#0ea5e9", plankton: "#38bdf8",
    sand: "#0f172a", sandDark: "#1e293b", sandLine: "#020617",
    speckleLight: "#38bdf8", speckleDark: "#020617",
    kelp: "#059669", kelpDark: "#064e3b", rock: "#0f172a",
    isNight: true,
  },
];

const SCENERIES_DAY: Scenery[] = [
  {
    name: "Coral Galleon",
    theme: "shipwreck",
    water: ["#99f6e4", "#5eead4", "#2dd4bf", "#14b8a6", "#0d9488", "#0f766e", "#115e59", "#134e4a", "#0f3835"],
    surface: "#ccfbf1", glint: "#ffffff", ray: "#fef08a", plankton: "#ffffff",
    sand: "#fde68a", sandDark: "#fffbeb", sandLine: "#f59e0b",
    speckleLight: "#ffffff", speckleDark: "#d97706",
    kelp: "#22c55e", kelpDark: "#15803d", rock: "#475569",
    isNight: false,
  },
  {
    name: "Sunken Temple",
    theme: "temple",
    water: ["#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e", "#082f49", "#04202c"],
    surface: "#e0f2fe", glint: "#ffffff", ray: "#fef9c3", plankton: "#e0f2fe",
    sand: "#e2e8f0", sandDark: "#ffffff", sandLine: "#cbd5e1",
    speckleLight: "#ffffff", speckleDark: "#94a3b8",
    kelp: "#14b8a6", kelpDark: "#0f766e", rock: "#475569",
    isNight: false,
  },
  {
    name: "Abyssal Reef",
    theme: "abyss",
    water: ["#e9d5ff", "#d8b4fe", "#c084fc", "#a855f7", "#9333ea", "#7e22ce", "#6b21a8", "#4c1d95", "#2e1065"],
    surface: "#faf5ff", glint: "#ffffff", ray: "#fbcfe8", plankton: "#f5d0fe",
    sand: "#e2e8f0", sandDark: "#ffffff", sandLine: "#cbd5e1",
    speckleLight: "#ffffff", speckleDark: "#a855f7",
    kelp: "#c084fc", kelpDark: "#9333ea", rock: "#475569",
    isNight: false,
  },
  {
    name: "Kelp Forest",
    theme: "kelp",
    water: ["#d9f99d", "#bef264", "#a3e635", "#84cc16", "#65a30d", "#4d7c0f", "#3f6212", "#27420c", "#1a2e05"],
    surface: "#f7fee7", glint: "#ffffff", ray: "#fef08a", plankton: "#f7fee7",
    sand: "#fef08a", sandDark: "#ffffff", sandLine: "#eab308",
    speckleLight: "#ffffff", speckleDark: "#ca8a04",
    kelp: "#16a34a", kelpDark: "#14532d", rock: "#57534e",
    isNight: false,
  },
  {
    name: "Aquarium Park",
    theme: "aquarium",
    water: ["#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e", "#082f49", "#041e2e"],
    surface: "#bae6fd", glint: "#ffffff", ray: "#fef9c3", plankton: "#e0f2fe",
    sand: "#fef3c7", sandDark: "#ffffff", sandLine: "#fde68a",
    speckleLight: "#ffffff", speckleDark: "#d4b46a",
    kelp: "#10b981", kelpDark: "#047857", rock: "#475569",
    isNight: false,
  },
];

function sceneryFor(year: number, isDark = true): Scenery {
  const baseYear = 2026;
  const list = isDark ? SCENERIES_NIGHT : SCENERIES_DAY;
  const idx = (((year - baseYear) % list.length) + list.length) % list.length;
  const found = list[idx];
  return found ?? list[0]!;
}

const CORAL_POOL = ["#d90429", "#ff5d8f", "#e9c46a", "#ef476f", "#ff9e00", "#8338ec", "#3a86ff"];

function yearFromCalendar(cal: ContributionCalendar): number {
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  const last = days.length > 0 ? days[days.length - 1] : undefined;
  const parsed = last ? Number.parseInt(last.date.slice(0, 4), 10) : Number.NaN;
  return Number.isFinite(parsed) ? (parsed as number) : new Date().getFullYear();
}

type Species =
  | "clown"
  | "tang"
  | "angel"
  | "lionfish"
  | "whale"
  | "betta"
  | "swordfish"
  | "sunfish"
  | "puffer"
  | "turtle"
  | "koi"
  | "goldfish";

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
  if (tier >= 4) {
    if (rand < 0.28) return "whale";
    if (rand < 0.52) return "sunfish";
    if (rand < 0.74) return "turtle";
    if (rand < 0.88) return "swordfish";
    return "lionfish";
  }
  if (tier === 3) {
    if (rand < 0.22) return "angel";
    if (rand < 0.42) return "lionfish";
    if (rand < 0.60) return "betta";
    if (rand < 0.76) return "swordfish";
    if (rand < 0.90) return "koi";
    return "tang";
  }
  if (tier === 2) {
    if (rand < 0.22) return "clown";
    if (rand < 0.42) return "tang";
    if (rand < 0.58) return "goldfish";
    if (rand < 0.74) return "koi";
    if (rand < 0.88) return "puffer";
    return "betta";
  }
  // Tier 1 (Small fry)
  if (rand < 0.30) return "clown";
  if (rand < 0.55) return "tang";
  if (rand < 0.75) return "goldfish";
  if (rand < 0.90) return "puffer";
  return "koi";
}

function R(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}

type PlotFn = (lx: number, ly: number, w: number, h: number, color: string) => void;

function makePlotter(ctx: CanvasRenderingContext2D, cx: number, cy: number, dir: 1 | -1): PlotFn {
  return (lx: number, ly: number, w: number, h: number, color: string) => {
    const sx = dir === 1 ? cx + lx : cx - lx - w;
    const sy = cy + ly;
    R(ctx, sx, sy, w, h, color);
  };
}

type FishBounds = {
  hitR: number;
  mouthLx: number;
  mouthLy: number;
  minLx: number;
  maxLx: number;
  minLy: number;
  maxLy: number;
};

function getFishBounds(species: Species, tier: 1 | 2 | 3 | 4): FishBounds {
  switch (species) {
    case "whale":
      return { hitR: 16, mouthLx: 12, mouthLy: 0, minLx: -14, maxLx: 12, minLy: -6, maxLy: 6 };
    case "sunfish":
      return { hitR: 14, mouthLx: 7, mouthLy: 0, minLx: -7, maxLx: 7, minLy: -11, maxLy: 11 };
    case "swordfish":
      return { hitR: 13, mouthLx: 13, mouthLy: 0, minLx: -12, maxLx: 13, minLy: -5, maxLy: 5 };
    case "turtle":
      return { hitR: 12, mouthLx: 8, mouthLy: 0, minLx: -7, maxLx: 8, minLy: -4, maxLy: 6 };
    case "lionfish":
      return { hitR: 11, mouthLx: 6, mouthLy: 0, minLx: -8, maxLx: 6, minLy: -7, maxLy: 5 };
    case "angel":
      return { hitR: 11, mouthLx: 6, mouthLy: 0, minLx: -8, maxLx: 6, minLy: -9, maxLy: 8 };
    case "betta":
      return { hitR: 11, mouthLx: 6, mouthLy: 0, minLx: -13, maxLx: 6, minLy: -5, maxLy: 6 };
    case "koi": {
      const lg = tier >= 3;
      return {
        hitR: lg ? 11 : 8,
        mouthLx: lg ? 8 : 5,
        mouthLy: 0,
        minLx: lg ? -9 : -6,
        maxLx: lg ? 8 : 5,
        minLy: lg ? -4 : -3,
        maxLy: lg ? 4 : 3,
      };
    }
    case "goldfish":
      return { hitR: 9, mouthLx: 5, mouthLy: 0, minLx: -7, maxLx: 5, minLy: -4, maxLy: 4 };
    case "puffer": {
      const sm = tier === 1;
      return {
        hitR: sm ? 6 : 9,
        mouthLx: sm ? 4 : 5,
        mouthLy: 0,
        minLx: sm ? -5 : -6,
        maxLx: sm ? 4 : 5,
        minLy: sm ? -3 : -4,
        maxLy: sm ? 3 : 4,
      };
    }
    case "tang": {
      const sm = tier === 1;
      return {
        hitR: sm ? 6 : 9,
        mouthLx: sm ? 4 : 6,
        mouthLy: 0,
        minLx: sm ? -5 : -9,
        maxLx: sm ? 4 : 6,
        minLy: sm ? -3 : -4,
        maxLy: sm ? 3 : 4,
      };
    }
    case "clown":
    default: {
      const sm = tier === 1;
      return {
        hitR: sm ? 6 : 9,
        mouthLx: sm ? 4 : 6,
        mouthLy: 0,
        minLx: sm ? -5 : -8,
        maxLx: sm ? 4 : 6,
        minLy: sm ? -3 : -4,
        maxLy: sm ? 3 : 4,
      };
    }
  }
}

function drawClownfish(p: PlotFn, tier: 1 | 2 | 3 | 4, frame: boolean) {
  const tailWag = frame ? -1 : 1;
  if (tier === 1) {
    p(-5, -2 + tailWag, 2, 3, OUTLINE);
    p(-4, -2, 8, 5, OUTLINE);
    p(-3, -1, 6, 3, "#ea580c");
    p(-2, -1, 4, 1, "#fb923c");
    p(-3, 1, 6, 1, "#fdba74");
    p(1, -1, 1, 3, "#ffffff");
    p(-1, -1, 1, 3, "#ffffff");
    p(-5, -1 + tailWag, 2, 2, "#f97316");
    p(-4, -1 + tailWag, 1, 2, "#ffffff");
    p(2, -1, 1, 1, "#ffffff");
    p(2, -1, 1, 1, OUTLINE);
  } else {
    p(-7, -3 + tailWag, 3, 6, OUTLINE);
    p(-6, -3, 12, 7, OUTLINE);
    p(6, -1, 1, 3, OUTLINE);
    p(-5, -2, 10, 5, "#ea580c");
    p(-4, -2, 8, 1, "#fb923c");
    p(-5, 2, 10, 1, "#fed7aa");
    p(3, -2, 1, 5, "#ffffff");
    p(2, -2, 1, 1, OUTLINE);
    p(2, 2, 1, 1, OUTLINE);
    p(-1, -3, 2, 6, "#ffffff");
    p(-2, -3, 1, 6, OUTLINE);
    p(1, -3, 1, 6, OUTLINE);
    p(-5, -1, 1, 3, "#ffffff");
    p(0, -4, 3, 1, OUTLINE);
    p(0, -3, 3, 1, "#f97316");
    p(0, 3, 2, 1, "#f97316");
    p(-7, -2 + tailWag, 2, 4, "#ea580c");
    p(-8, -2 + tailWag, 1, 4, "#fb923c");
    p(-6, -1 + tailWag, 1, 3, "#ffffff");
    p(4, -1, 2, 2, "#ffffff");
    p(4, -1, 1, 1, OUTLINE);
  }
}

function drawBlueTang(p: PlotFn, tier: 1 | 2 | 3 | 4, frame: boolean) {
  const tailWag = frame ? -1 : 1;
  if (tier === 1) {
    p(-5, -2 + tailWag, 2, 3, OUTLINE);
    p(-4, -2, 8, 5, OUTLINE);
    p(-3, -1, 6, 3, "#2563eb");
    p(-2, -1, 5, 1, "#60a5fa");
    p(-1, 0, 3, 1, "#0f172a");
    p(-5, -1 + tailWag, 2, 2, "#facc15");
    p(2, -1, 1, 1, "#ffffff");
    p(2, -1, 1, 1, OUTLINE);
  } else {
    p(-8, -3 + tailWag, 3, 6, OUTLINE);
    p(-6, -3, 12, 7, OUTLINE);
    p(6, -1, 1, 3, OUTLINE);
    p(-5, -2, 11, 5, "#1d4ed8");
    p(-4, -2, 9, 1, "#3b82f6");
    p(-5, 2, 10, 1, "#172554");
    p(-2, -2, 6, 1, "#0f172a");
    p(3, -1, 1, 2, "#0f172a");
    p(-4, -1, 2, 3, "#0f172a");
    p(-2, 1, 5, 1, "#0f172a");
    p(-2, -3, 6, 1, "#1e40af");
    p(-3, 3, 6, 1, "#1e40af");
    p(1, 1, 2, 1, "#facc15");
    p(-7, -2 + tailWag, 2, 5, "#facc15");
    p(-8, -3 + tailWag, 2, 6, "#facc15");
    p(-9, -2 + tailWag, 1, 4, "#eab308");
    p(4, -1, 2, 2, "#ffffff");
    p(4, -1, 1, 1, OUTLINE);
    p(5, -1, 1, 1, "#ffffff");
  }
}

function drawMoorishIdol(p: PlotFn, frame: boolean) {
  const sWag = frame ? 0 : 1;
  p(-2, -6, 2, 1, "#ffffff");
  p(-4, -7, 2, 1, "#ffffff");
  p(-6 - sWag, -8, 2, 1, "#ffffff");
  p(-8 - sWag, -9, 2, 1, "#ffffff");
  p(-6, -4, 11, 9, OUTLINE);
  p(-2, -6, 4, 3, OUTLINE);
  p(-1, 4, 3, 4, OUTLINE);
  p(5, -1, 2, 2, OUTLINE);
  p(3, -2, 2, 4, "#18181b");
  p(5, 0, 1, 1, "#fbbf24");
  p(0, -4, 3, 8, "#facc15");
  p(1, -3, 2, 6, "#ffffff");
  p(-3, -3, 3, 7, "#18181b");
  p(-5, -2, 2, 4, "#ffffff");
  p(-1, 4, 1, 4, "#18181b");
  p(0, 4, 1, 3, "#ffffff");
  p(-7, -2, 2, 4, "#fef08a");
  p(-8, -2, 1, 4, "#18181b");
  p(3, -1, 1, 1, "#ffffff");
  p(4, -1, 1, 1, OUTLINE);
}

function drawLionfish(p: PlotFn, frame: boolean) {
  const fWag = frame ? 1 : 0;
  p(3, -6 - fWag, 1, 3, OUTLINE);
  p(3, -6 - fWag, 1, 2, "#ffffff");
  p(1, -7 + fWag, 1, 4, OUTLINE);
  p(1, -7 + fWag, 1, 3, "#f87171");
  p(-1, -7 - fWag, 1, 4, OUTLINE);
  p(-1, -7 - fWag, 1, 3, "#ffffff");
  p(-3, -6 + fWag, 1, 4, OUTLINE);
  p(-3, -6 + fWag, 1, 3, "#f87171");
  p(-5, -5 - fWag, 1, 3, OUTLINE);
  p(-5, -5 - fWag, 1, 2, "#ffffff");
  p(-6, -3, 12, 7, OUTLINE);
  p(-5, -2, 10, 5, "#b91c1c");
  p(2, -2, 1, 5, "#fef3c7");
  p(-1, -2, 1, 5, "#fef3c7");
  p(-4, -2, 1, 5, "#fef3c7");
  p(0, 1, 4, 4, OUTLINE);
  p(0, 1, 3, 3, "#fca5a5");
  p(1, 2, 2, 2, "#b91c1c");
  p(2, 3, 1, 1, "#fef3c7");
  p(-7, -2 + fWag, 2, 4, "#fca5a5");
  p(-8, -3 + fWag, 1, 6, "#b91c1c");
  p(4, -1, 2, 2, "#ffffff");
  p(4, -1, 1, 1, OUTLINE);
}

function drawWhaleShark(p: PlotFn, frame: boolean) {
  const tWag = frame ? -1 : 1;
  p(-14, -4 + tWag, 4, 8, OUTLINE);
  p(-11, -4, 22, 9, OUTLINE);
  p(11, -2, 2, 5, OUTLINE);
  p(-1, -6, 4, 3, OUTLINE);
  p(-1, -5, 3, 2, "#1e293b");
  p(-6, -4, 2, 2, "#1e293b");
  p(-10, -3, 20, 4, "#1e293b");
  p(-9, -3, 18, 1, "#334155");
  p(-10, 1, 20, 3, "#cbd5e1");
  p(11, -1, 1, 3, "#1e293b");
  p(4, -1, 1, 3, "#0f172a");
  p(6, -1, 1, 3, "#0f172a");
  p(8, -1, 1, 3, "#0f172a");
  p(1, -2, 1, 1, "#ffffff");
  p(3, -1, 1, 1, "#ffffff");
  p(-1, -1, 1, 1, "#93c5fd");
  p(-3, -2, 1, 1, "#ffffff");
  p(-5, -1, 1, 1, "#ffffff");
  p(-7, -2, 1, 1, "#93c5fd");
  p(-8, 0, 1, 1, "#ffffff");
  p(-4, 0, 1, 1, "#ffffff");
  p(0, 0, 1, 1, "#ffffff");
  p(3, 4, 4, 2, OUTLINE);
  p(3, 3, 4, 2, "#1e293b");
  p(-12, -3 + tWag, 2, 6, "#1e293b");
  p(-14, -5 + tWag, 2, 4, "#1e293b");
  p(-14, 1 + tWag, 2, 3, "#1e293b");
  p(9, -2, 1, 1, "#ffffff");
  p(10, -2, 1, 1, OUTLINE);
}

function drawBetta(p: PlotFn, frame: boolean) {
  const f = frame ? 1 : -1;
  p(-8, -4 - f, 4, 8, OUTLINE);
  p(-12, -5 - f * 2, 5, 10, OUTLINE);
  p(-7, -3 - f, 3, 6, "#dc2626");
  p(-10, -4 - f * 2, 4, 8, "#b91c1c");
  p(-12, -3 - f * 2, 3, 6, "#f87171");
  p(-2, -5, 6, 2, OUTLINE);
  p(-2, -4, 5, 2, "#dc2626");
  p(-1, -5, 3, 1, "#fca5a5");
  p(-5, -2, 10, 5, OUTLINE);
  p(-4, -1, 9, 3, "#991b1b");
  p(-3, -1, 7, 1, "#ef4444");
  p(-4, 1, 8, 1, "#7f1d1d");
  p(0, 3, 1, 4, OUTLINE);
  p(0, 3, 1, 3, "#f87171");
  p(3, -1, 2, 2, "#ffffff");
  p(3, -1, 1, 1, OUTLINE);
}

function drawSwordfish(p: PlotFn, frame: boolean) {
  const tWag = frame ? -1 : 1;
  p(6, 0, 7, 1, "#334155");
  p(12, 0, 1, 1, "#94a3b8");
  p(0, -5, 4, 4, OUTLINE);
  p(1, -5, 2, 3, "#1e3a8a");
  p(1, -4, 2, 2, "#38bdf8");
  p(-9, -2, 15, 5, OUTLINE);
  p(-8, -1, 13, 2, "#1d4ed8");
  p(-7, -1, 11, 1, "#60a5fa");
  p(-8, 1, 13, 2, "#f8fafc");
  p(-10, -2 + tWag, 2, 5, OUTLINE);
  p(-12, -4 + tWag, 2, 3, "#1e3a8a");
  p(-12, 2 + tWag, 2, 3, "#1e3a8a");
  p(4, -1, 2, 2, "#ffffff");
  p(4, -1, 1, 1, OUTLINE);
}

function drawSunfish(p: PlotFn, frame: boolean) {
  const tilt = frame ? 1 : -1;
  p(-2 + tilt, -11, 3, 7, OUTLINE);
  p(-1 + tilt, -10, 2, 6, "#475569");
  p(0 + tilt, -9, 1, 4, "#94a3b8");
  p(-2 - tilt, 5, 3, 7, OUTLINE);
  p(-1 - tilt, 5, 2, 6, "#475569");
  p(0 - tilt, 6, 1, 4, "#94a3b8");
  p(-6, -5, 12, 11, OUTLINE);
  p(6, -1, 1, 3, OUTLINE);
  p(-5, -4, 10, 9, "#64748b");
  p(-3, -3, 7, 3, "#94a3b8");
  p(-4, 2, 8, 2, "#cbd5e1");
  p(-6, -3, 1, 2, "#334155");
  p(-7, -1, 1, 3, "#334155");
  p(-6, 2, 1, 2, "#334155");
  p(4, -2, 2, 2, "#ffffff");
  p(4, -2, 1, 1, OUTLINE);
  p(6, 0, 1, 1, "#fca5a5");
}

function drawPufferfish(p: PlotFn, tier: 1 | 2 | 3 | 4, frame: boolean) {
  const f = frame ? 1 : 0;
  if (tier === 1) {
    p(-4, -2, 7, 5, OUTLINE);
    p(-3, -1, 5, 3, "#d97706");
    p(-2, 1, 4, 1, "#fef3c7");
    p(0, -3, 1, 1, "#92400e");
    p(0, 3, 1, 1, "#92400e");
    p(-5, -1 + f, 1, 2, "#d97706");
    p(1, -1, 2, 2, "#ffffff");
    p(2, -1, 1, 1, OUTLINE);
  } else {
    p(2, -4, 1, 1, "#b45309");
    p(-1, -4, 1, 1, "#b45309");
    p(-3, -3, 1, 1, "#b45309");
    p(2, 4, 1, 1, "#b45309");
    p(-1, 4, 1, 1, "#b45309");
    p(4, 2, 1, 1, "#b45309");
    p(-5, -3, 10, 7, OUTLINE);
    p(5, -1, 1, 3, OUTLINE);
    p(-4, -2, 8, 5, "#d97706");
    p(-3, -2, 6, 2, "#f59e0b");
    p(-4, 1, 8, 2, "#fef3c7");
    p(-2, 2, 4, 1, "#fde68a");
    p(-2, -4, 2, 1, "#f59e0b");
    p(-2, 3, 2, 1, "#f59e0b");
    p(-6, -1 + f, 2, 3, "#d97706");
    p(2, -2, 2, 2, "#ffffff");
    p(3, -2, 1, 1, OUTLINE);
    p(2, -2, 1, 1, "#ffffff");
  }
}

function drawSeaTurtle(p: PlotFn, frame: boolean) {
  const f = frame ? 1 : 0;
  p(2, 2 + f * 2, 4, 3, OUTLINE);
  p(2, 2 + f * 2, 3, 2, "#65a30d");
  p(3, 3 + f * 2, 2, 1, "#84cc16");
  p(-5, 2, 3, 2, "#4d7c0f");
  p(-5, -3, 10, 6, OUTLINE);
  p(-4, -2, 8, 4, "#78350f");
  p(-2, -2, 3, 2, "#b45309");
  p(-1, -2, 2, 1, "#f59e0b");
  p(1, -1, 2, 2, "#d97706");
  p(-4, -1, 2, 2, "#d97706");
  p(5, -1, 3, 3, OUTLINE);
  p(5, 0, 3, 2, "#65a30d");
  p(6, 0, 1, 1, OUTLINE);
}

function drawKoi(p: PlotFn, tier: 1 | 2 | 3 | 4, frame: boolean) {
  const tailWag = frame ? -1 : 1;
  const len = tier >= 3 ? 14 : 10;
  const half = Math.floor(len / 2);
  const h = tier >= 3 ? 5 : 4;
  const halfH = Math.floor(h / 2);
  p(-half - 2, -halfH + tailWag, 2, h, OUTLINE);
  p(-half, -halfH, len, h + 1, OUTLINE);
  p(half, 0, 1, 1, OUTLINE);
  p(-half + 1, -halfH + 1, len - 2, h - 1, "#ffffff");
  p(-half + 1, halfH, len - 2, 1, "#f1f5f9");
  p(1, -halfH + 1, 2, 2, "#ea580c");
  p(0, -halfH + 1, 1, 1, "#f97316");
  p(-half + 2, -halfH + 1, 2, 2, "#ea580c");
  p(-1, 0, 1, 1, "#1e293b");
  p(-3, -halfH + 1, 1, 1, "#1e293b");
  p(-half - 2, -1 + tailWag, 2, 3, "#ffffff");
  p(-half - 3, 0 + tailWag, 1, 2, "#fed7aa");
  p(half - 2, -halfH + 1, 1, 1, OUTLINE);
}

function drawGoldfish(p: PlotFn, tier: 1 | 2 | 3 | 4, frame: boolean) {
  const tailWag = frame ? -1 : 1;
  p(2, -3, 3, 2, OUTLINE);
  p(2, -3, 3, 1, "#dc2626");
  p(3, -2, 2, 1, tier >= 3 ? "#fef08a" : "#f87171");
  p(-4, -2, 8, 5, OUTLINE);
  p(-3, -1, 6, 3, "#ea580c");
  p(-2, -1, 4, 1, tier >= 2 ? "#fed7aa" : "#fb923c");
  p(-3, 1, 6, 1, "#fbbf24");
  p(-5, -2 + tailWag, 2, 4, OUTLINE);
  p(-6, -3 + tailWag, 2, 5, "#f97316");
  p(-7, -2 + tailWag, 1, 4, "#fed7aa");
  p(-5, 0 - tailWag, 2, 3, "#fb923c");
  p(3, -1, 2, 2, "#ffffff");
  p(4, -1, 1, 1, OUTLINE);
}

/**
 * Pixel fish drawn with high-contrast outlines and species-specific silhouettes
 * inspired by classic retro 16-bit aquarium pixel art.
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
  const cx = Math.round(x);
  const cy = Math.round(y);
  const p = makePlotter(ctx, cx, cy, dir);
  const bounds = getFishBounds(species, tier);

  switch (species) {
    case "clown": drawClownfish(p, tier, frame); break;
    case "tang": drawBlueTang(p, tier, frame); break;
    case "angel": drawMoorishIdol(p, frame); break;
    case "lionfish": drawLionfish(p, frame); break;
    case "whale": drawWhaleShark(p, frame); break;
    case "betta": drawBetta(p, frame); break;
    case "swordfish": drawSwordfish(p, frame); break;
    case "sunfish": drawSunfish(p, frame); break;
    case "puffer": drawPufferfish(p, tier, frame); break;
    case "turtle": drawSeaTurtle(p, frame); break;
    case "koi": drawKoi(p, tier, frame); break;
    case "goldfish": drawGoldfish(p, tier, frame); break;
    default: drawClownfish(p, tier, frame); break;
  }

  // Hover brackets: crisp targeting corners that hug this fish's bounds
  if (highlight) {
    const x1 = dir === 1 ? cx + bounds.minLx - 2 : cx - bounds.maxLx - 2;
    const x2 = dir === 1 ? cx + bounds.maxLx + 2 : cx - bounds.minLx + 2;
    const y1 = cy + bounds.minLy - 2;
    const y2 = cy + bounds.maxLy + 2;
    R(ctx, x1, y1, 3, 1, "#ffffff");
    R(ctx, x1, y1, 1, 3, "#ffffff");
    R(ctx, x2 - 2, y1, 3, 1, "#ffffff");
    R(ctx, x2, y1, 1, 3, "#ffffff");
    R(ctx, x1, y2, 3, 1, "#ffffff");
    R(ctx, x1, y2 - 2, 1, 3, "#ffffff");
    R(ctx, x2 - 2, y2, 3, 1, "#ffffff");
    R(ctx, x2, y2 - 2, 1, 3, "#ffffff");
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

function drawKelp(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  h: number,
  sway: number,
  color: string,
  dark = "#14532d",
) {
  const x0 = Math.round(x);
  for (let i = 0; i < h; i += 1) {
    const s = Math.round(Math.sin((i / 5) + sway) * 2);
    R(ctx, x0 + s, baseY - i, 1, 1, i % 3 === 0 ? dark : color);
    if (i > 3 && i % 4 === 1) {
      R(ctx, x0 + s + (i % 8 === 1 ? 2 : -2), baseY - i, 2, 1, color);
      R(ctx, x0 + s + (i % 8 === 1 ? 3 : -3), baseY - i - 1, 1, 1, "#4ade80");
    }
  }
}

function drawBranchingCoral(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  color: string,
  highlight: string,
  tall: number,
  sway: number,
) {
  const x0 = Math.round(x);
  const y0 = Math.round(baseY);
  R(ctx, x0 - 1, y0 - 3, 3, 3, color);
  R(ctx, x0 - 3 + sway, y0 - tall + 4, 2, tall - 4, color);
  R(ctx, x0 - 5 + sway, y0 - tall + 2, 2, 4, color);
  R(ctx, x0 - 5 + sway, y0 - tall + 1, 1, 1, highlight);
  R(ctx, x0 - 2 + sway, y0 - tall, 1, 3, color);
  R(ctx, x0 - 2 + sway, y0 - tall, 1, 1, highlight);
  R(ctx, x0 + 1 + sway, y0 - tall + 3, 2, tall - 3, color);
  R(ctx, x0 + 3 + sway, y0 - tall + 1, 2, 5, color);
  R(ctx, x0 + 4 + sway, y0 - tall, 1, 1, highlight);
  R(ctx, x0 + 1 + sway, y0 - tall - 1, 1, 3, color);
  R(ctx, x0 + 1 + sway, y0 - tall - 1, 1, 1, highlight);
}

function drawTubeSponges(ctx: CanvasRenderingContext2D, x: number, baseY: number, _tick: number) {
  const x0 = Math.round(x);
  const y0 = Math.round(baseY);
  R(ctx, x0 - 3, y0 - 10, 3, 10, "#ca8a04");
  R(ctx, x0 - 2, y0 - 9, 2, 9, "#facc15");
  R(ctx, x0 - 3, y0 - 10, 3, 1, "#422006");
  R(ctx, x0, y0 - 15, 4, 15, "#a16207");
  R(ctx, x0 + 1, y0 - 14, 2, 14, "#fde047");
  R(ctx, x0, y0 - 15, 4, 1, "#422006");
  R(ctx, x0 + 4, y0 - 7, 3, 7, "#ca8a04");
  R(ctx, x0 + 5, y0 - 6, 2, 6, "#facc15");
  R(ctx, x0 + 4, y0 - 7, 3, 1, "#422006");
}

function drawCoralShelves(ctx: CanvasRenderingContext2D, BW: number, sandTop: number, tick: number, isNight = true) {
  const rockDark = isNight ? "#1e293b" : "#475569";
  const rockLight = isNight ? "#475569" : "#64748b";
  const sandCap = isNight ? "#d9b96a" : "#fde68a";

  const leftW = 34;
  R(ctx, 0, sandTop - 8, leftW, 14, rockDark);
  R(ctx, 0, sandTop - 8, leftW - 2, 2, rockLight);
  R(ctx, 2, sandTop - 7, leftW - 6, 1, sandCap);
  R(ctx, 0, sandTop - 22, leftW - 12, 15, rockDark);
  R(ctx, 0, sandTop - 22, leftW - 14, 2, rockLight);
  R(ctx, 1, sandTop - 21, leftW - 18, 1, sandCap);

  drawBranchingCoral(ctx, 10, sandTop - 22, "#be185d", "#f472b6", 11, tick % 4 < 2 ? 1 : 0);
  drawBranchingCoral(ctx, 22, sandTop - 8, "#ea580c", "#fb923c", 9, tick % 4 < 2 ? 0 : 1);
  drawTubeSponges(ctx, 4, sandTop - 22, tick);

  const rightW = 32;
  const rightX = BW - rightW;
  R(ctx, rightX, sandTop - 12, rightW, 18, rockDark);
  R(ctx, rightX + 2, sandTop - 12, rightW - 2, 2, rockLight);
  R(ctx, rightX + 4, sandTop - 11, rightW - 6, 1, sandCap);
  R(ctx, rightX + 12, sandTop - 24, rightW - 12, 13, rockDark);
  R(ctx, rightX + 14, sandTop - 24, rightW - 14, 2, rockLight);

  drawBranchingCoral(ctx, BW - 18, sandTop - 24, "#8b5cf6", "#c4b5fd", 10, tick % 4 < 2 ? -1 : 0);
  drawBranchingCoral(ctx, BW - 8, sandTop - 12, "#e11d48", "#fda4af", 8, tick % 4 < 2 ? 0 : -1);
  drawTubeSponges(ctx, BW - 24, sandTop - 12, tick);
}

function drawStarfish(ctx: CanvasRenderingContext2D, x: number, y: number, color = "#ea580c") {
  const x0 = Math.round(x);
  const y0 = Math.round(y);
  R(ctx, x0, y0, 1, 1, "#ffffff");
  R(ctx, x0 - 1, y0, 3, 1, color);
  R(ctx, x0, y0 - 1, 1, 3, color);
  R(ctx, x0 - 2, y0 - 1, 1, 1, color);
  R(ctx, x0 + 2, y0 - 1, 1, 1, color);
  R(ctx, x0 - 1, y0 + 2, 1, 1, color);
  R(ctx, x0 + 1, y0 + 2, 1, 1, color);
}

function drawShipwreck(ctx: CanvasRenderingContext2D, x: number, y: number, tick: number, isNight = true) {
  const x0 = Math.round(x);
  const y0 = Math.round(y);

  // Distant rear yardarm / mast shadows
  R(ctx, x0 - 18, y0 - 36, 2, 28, isNight ? "#1a0f0a" : "#2d1b10");
  R(ctx, x0 - 24, y0 - 30, 16, 2, isNight ? "#1a0f0a" : "#2d1b10");

  // Stern Castle (Tilted Quarterdeck on the right)
  R(ctx, x0 + 10, y0 - 22, 16, 12, isNight ? "#1c110a" : "#382012");
  R(ctx, x0 + 11, y0 - 21, 14, 10, isNight ? "#3d2213" : "#5a341c");
  R(ctx, x0 + 12, y0 - 20, 12, 2, isNight ? "#5a341c" : "#784425");
  R(ctx, x0 + 13, y0 - 17, 3, 3, isNight ? "#0b1220" : "#1e293b");
  R(ctx, x0 + 14, y0 - 16, 1, 1, isNight ? "#1e3a8a" : "#38bdf8");
  R(ctx, x0 + 19, y0 - 17, 3, 3, isNight ? "#0b1220" : "#1e293b");
  R(ctx, x0 + 20, y0 - 16, 1, 1, isNight ? "#1e3a8a" : "#38bdf8");
  R(ctx, x0 + 10, y0 - 24, 16, 2, isNight ? "#6e4023" : "#854d0e");
  R(ctx, x0 + 11, y0 - 22, 1, 2, isNight ? "#1c110a" : "#382012");
  R(ctx, x0 + 17, y0 - 22, 1, 2, isNight ? "#1c110a" : "#382012");
  R(ctx, x0 + 24, y0 - 22, 1, 2, isNight ? "#1c110a" : "#382012");

  // Main deck railing sloping down to the bow
  R(ctx, x0 - 28, y0 - 12, 38, 2, isNight ? "#6e4023" : "#854d0e");
  for (let rx = x0 - 26; rx < x0 + 10; rx += 6) {
    R(ctx, rx, y0 - 10, 1, 2, isNight ? "#1c110a" : "#382012");
  }

  // Curved Bow (Prow) sweeping up on the left
  R(ctx, x0 - 34, y0 - 12, 6, 3, isNight ? "#3d2213" : "#5a341c");
  R(ctx, x0 - 32, y0 - 9, 6, 3, isNight ? "#4d2b17" : "#6e4023");
  R(ctx, x0 - 40, y0 - 14, 8, 2, isNight ? "#4d2b17" : "#6e4023");
  R(ctx, x0 - 46, y0 - 17, 7, 2, isNight ? "#3d2213" : "#5a341c");
  R(ctx, x0 - 50, y0 - 19, 5, 1, isNight ? "#27160c" : "#382012");

  // Curved Hull Planking Rows (Tapered from top to keel - NO rectangular box!)
  R(ctx, x0 - 28, y0 - 8, 46, 3, isNight ? "#54331d" : "#784425");
  R(ctx, x0 - 28, y0 - 8, 46, 1, isNight ? "#784425" : "#a16207");
  R(ctx, x0 - 26, y0 - 5, 42, 3, isNight ? "#422514" : "#5a341c");
  R(ctx, x0 - 22, y0 - 2, 36, 3, isNight ? "#331b0e" : "#422514");
  R(ctx, x0 - 16, y0 + 1, 26, 3, isNight ? "#26140b" : "#331b0e");
  R(ctx, x0 - 10, y0 + 4, 15, 3, isNight ? "#1a0c06" : "#26140b");

  // Plank horizontal seam lines & rivets
  R(ctx, x0 - 26, y0 - 5, 42, 1, "#1c0f08");
  R(ctx, x0 - 22, y0 - 2, 36, 1, "#1c0f08");
  R(ctx, x0 - 16, y0 + 1, 26, 1, "#1c0f08");
  for (let px = x0 - 22; px < x0 + 14; px += 7) {
    R(ctx, px, y0 - 3, 1, 1, isNight ? "#b45309" : "#fbbf24");
  }

  // Broken Hull Breach & Curved Wooden Ribs
  R(ctx, x0 - 11, y0 - 5, 10, 6, "#090503");
  R(ctx, x0 - 9, y0 - 6, 1, 7, isNight ? "#6e4023" : "#854d0e");
  R(ctx, x0 - 5, y0 - 6, 1, 7, isNight ? "#6e4023" : "#854d0e");
  R(ctx, x0 - 1, y0 - 5, 1, 6, isNight ? "#6e4023" : "#854d0e");

  // Portholes (Gunports)
  R(ctx, x0 + 6, y0 - 4, 3, 3, "#090503");
  R(ctx, x0 + 5, y0 - 5, 5, 1, isNight ? "#b45309" : "#fbbf24");
  R(ctx, x0 - 18, y0 - 3, 3, 3, "#090503");
  R(ctx, x0 - 19, y0 - 4, 5, 1, isNight ? "#b45309" : "#fbbf24");

  // Mainmast (tall broken mast tilted slightly right)
  R(ctx, x0 - 3, y0 - 44, 3, 34, "#150d07");
  R(ctx, x0 - 2, y0 - 43, 2, 33, isNight ? "#5c341d" : "#784425");
  R(ctx, x0 - 2, y0 - 43, 1, 33, isNight ? "#784425" : "#a16207");
  R(ctx, x0 - 3, y0 - 45, 1, 2, isNight ? "#784425" : "#a16207");
  R(ctx, x0 - 1, y0 - 46, 1, 3, isNight ? "#784425" : "#a16207");

  // Crow's nest platform
  R(ctx, x0 - 6, y0 - 34, 9, 3, "#150d07");
  R(ctx, x0 - 5, y0 - 33, 7, 2, isNight ? "#5c341d" : "#784425");
  R(ctx, x0 - 6, y0 - 36, 9, 1, isNight ? "#6e4023" : "#854d0e");
  R(ctx, x0 - 5, y0 - 35, 1, 1, "#150d07");
  R(ctx, x0 + 2, y0 - 35, 1, 1, "#150d07");

  // Mainmast yardarm (crossbar spar)
  R(ctx, x0 - 15, y0 - 31, 25, 2, "#150d07");
  R(ctx, x0 - 14, y0 - 30, 23, 1, isNight ? "#5c341d" : "#784425");

  // Foremast (shorter broken mast)
  R(ctx, x0 - 22, y0 - 29, 3, 18, "#150d07");
  R(ctx, x0 - 21, y0 - 28, 2, 17, isNight ? "#4d2b17" : "#6e4023");
  R(ctx, x0 - 27, y0 - 23, 13, 2, "#150d07");
  R(ctx, x0 - 26, y0 - 22, 11, 1, isNight ? "#4d2b17" : "#6e4023");

  // Rigging ropes (dithered lines)
  for (let s = 0; s < 12; s += 2) {
    R(ctx, x0 - 14 - Math.floor(s * 1.5), y0 - 30 + s, 1, 1, isNight ? "#6e594d" : "#a88978");
    R(ctx, x0 + 9 + Math.floor(s * 1.2), y0 - 30 + s, 1, 1, isNight ? "#6e594d" : "#a88978");
  }

  // Clinging seaweed, moss, and corals
  R(ctx, x0 - 42, y0 - 12, 2, 6, "#15803d");
  R(ctx, x0 - 41, y0 - 10, 1, 8, "#22c55e");
  R(ctx, x0 - 28, y0 - 8, 3, 5, "#15803d");
  R(ctx, x0 - 14, y0 - 7, 2, 6, "#16a34a");
  R(ctx, x0 - 6, y0 - 29, 2, 5, "#15803d");
  R(ctx, x0 + 8, y0 + 1, 4, 3, "#be185d");
  R(ctx, x0 + 9, y0, 2, 2, "#f43f5e");
  R(ctx, x0 - 20, y0 + 1, 3, 2, "#ea580c");

  // Soft sandy drift covering the bottom keel so the ship is sunken into the sand
  R(ctx, x0 - 24, y0 + 2, 44, 2, isNight ? "#d9b96a" : "#f59e0b");
  R(ctx, x0 - 20, y0 + 4, 38, 3, isNight ? "#e8d49a" : "#fde68a");

  // Bubble vent rising from the hull breach
  const bPhase = (tick % 24);
  const b1Y = y0 - 6 - bPhase * 2;
  const b1X = x0 - 7 + Math.round(Math.sin((bPhase + tick) * 0.4) * 2);
  if (b1Y > 10) {
    R(ctx, b1X, b1Y, 2, 2, isNight ? "#38bdf8" : "#ecfdf5");
    R(ctx, b1X, b1Y, 1, 1, "#ffffff");
  }
}

function drawAquariumPark(ctx: CanvasRenderingContext2D, BW: number, sandTop: number, tick: number, isNight = true) {
  const tLeft = Math.floor(BW * 0.10);
  const tRight = Math.floor(BW * 0.90);
  const tW = tRight - tLeft;
  const tunnelFloor = sandTop + 3;
  const tunnelRoof = sandTop - 22;
  const tunnelH = tunnelFloor - tunnelRoof;

  // 1. Transparent Acrylic Glass Tunnel Canopy
  const canopyFill = isNight ? "rgba(8, 47, 73, 0.45)" : "rgba(186, 230, 253, 0.28)";
  const ambientGlow = isNight ? "rgba(254, 240, 138, 0.08)" : "rgba(255, 255, 255, 0.15)";
  R(ctx, tLeft, tunnelRoof, tW, tunnelH, canopyFill);
  R(ctx, tLeft, tunnelRoof + 3, tW, tunnelH - 5, ambientGlow);

  // Upper curved glass roofline (continuous arched highlight)
  R(ctx, tLeft, tunnelRoof, tW, 2, isNight ? "rgba(186, 230, 253, 0.85)" : "rgba(255, 255, 255, 0.95)");
  R(ctx, tLeft + 2, tunnelRoof + 2, tW - 4, 1, isNight ? "rgba(224, 242, 254, 0.45)" : "rgba(255, 255, 255, 0.65)");
  for (let gx = tLeft + 18; gx < tRight; gx += 44) {
    R(ctx, gx, tunnelRoof + 2, 7, 1, "#ffffff");
    R(ctx, gx + 5, tunnelRoof + 3, 5, 1, "rgba(255, 255, 255, 0.6)");
  }

  // 2. Structural Steel Arch Rings
  const ribSpacing = 24;
  for (let rx = tLeft; rx <= tRight; rx += ribSpacing) {
    R(ctx, rx - 1, tunnelRoof, 3, tunnelH, isNight ? "#0f172a" : "#334155");
    R(ctx, rx, tunnelRoof, 2, tunnelH, isNight ? "#334155" : "#64748b");
    R(ctx, rx, tunnelRoof, 1, tunnelH, isNight ? "#64748b" : "#94a3b8");
    R(ctx, rx, tunnelRoof + 3, 1, 1, "#e2e8f0");
    R(ctx, rx, tunnelFloor - 3, 1, 1, "#e2e8f0");
  }

  // 3. Walkway Floor & Neon Floor Guide Lighting
  R(ctx, tLeft, tunnelFloor, tW, 3, isNight ? "#0f172a" : "#1e293b");
  const ledGlow = isNight ? (tick % 4 < 2 ? "#38bdf8" : "#0ea5e9") : (tick % 4 < 2 ? "#0284c7" : "#0ea5e9");
  R(ctx, tLeft, tunnelFloor - 1, tW, 1, ledGlow);

  // 4. Sprites of People Walking & Interacting Inside the Tunnel

  // A. Couple walking together holding hands (left)
  const cX = tLeft + 24;
  const walkFrame = tick % 4 < 2;
  R(ctx, cX, tunnelFloor - 12, 3, 3, "#78350f");
  R(ctx, cX - 1, tunnelFloor - 9, 5, 5, "#1e3a8a");
  R(ctx, cX, tunnelFloor - 4, 2, walkFrame ? 4 : 3, "#0f172a");
  R(ctx, cX + 6, tunnelFloor - 12, 3, 3, "#fde047");
  R(ctx, cX + 5, tunnelFloor - 9, 5, 5, "#f43f5e");
  R(ctx, cX + 6, tunnelFloor - 4, 2, walkFrame ? 3 : 4, "#e2e8f0");
  R(ctx, cX + 3, tunnelFloor - 7, 3, 1, "#fde047");

  // B. Parent and Child watching the fish (mid-left)
  const pX = tLeft + Math.floor(tW * 0.32);
  R(ctx, pX, tunnelFloor - 13, 3, 3, "#1f2937");
  R(ctx, pX - 1, tunnelFloor - 10, 5, 6, "#854d0e");
  R(ctx, pX, tunnelFloor - 4, 3, 4, "#1e293b");
  const chX = pX + 8;
  R(ctx, chX, tunnelFloor - 8, 2, 2, "#ef4444");
  R(ctx, chX - 1, tunnelFloor - 6, 4, 3, "#facc15");
  R(ctx, chX + 2, tunnelFloor - 9, 1, 4, "#facc15");
  R(ctx, chX, tunnelFloor - 3, 2, 3, "#1e293b");

  // C. Photographer taking pictures (center)
  const phX = tLeft + Math.floor(tW * 0.50);
  R(ctx, phX, tunnelFloor - 12, 3, 3, "#475569");
  R(ctx, phX - 1, tunnelFloor - 9, 5, 5, "#15803d");
  R(ctx, phX + 3, tunnelFloor - 8, 2, 2, "#e2e8f0");
  if (tick % 16 === 0) {
    R(ctx, phX + 5, tunnelFloor - 9, 2, 2, "#ffffff");
  }
  R(ctx, phX, tunnelFloor - 4, 3, 4, "#0f172a");

  // D. Two friends standing and chatting (center-right)
  const fX = tLeft + Math.floor(tW * 0.68);
  R(ctx, fX, tunnelFloor - 12, 3, 3, "#d97706");
  R(ctx, fX - 1, tunnelFloor - 9, 5, 5, "#7c3aed");
  R(ctx, fX + 3, tunnelFloor - 7, 2, 2, "#fef08a");
  R(ctx, fX, tunnelFloor - 4, 3, 4, "#1e293b");
  R(ctx, fX + 9, tunnelFloor - 12, 3, 3, "#374151");
  R(ctx, fX + 8, tunnelFloor - 9, 5, 5, "#0d9488");
  R(ctx, fX + 6, tunnelFloor - 7, 2, 1, "#fde047");
  R(ctx, fX + 9, tunnelFloor - 4, 3, 4, "#0f172a");

  // E. Solitary Observer in awe (right)
  const obsX = tRight - 26;
  R(ctx, obsX, tunnelFloor - 13, 3, 3, "#0f172a");
  R(ctx, obsX - 1, tunnelFloor - 10, 5, 6, "#64748b");
  R(ctx, obsX + 1, tunnelFloor - 14, 2, 2, "#fed7aa");
  R(ctx, obsX, tunnelFloor - 4, 3, 4, "#1e293b");

  // F. Walking visitor moving along the tunnel
  const walkProgress = ((tick * 0.4) % Math.max(1, tW - 80));
  const wX = tLeft + 36 + Math.floor(walkProgress);
  const wLeg = Math.floor(tick / 2) % 2 === 0;
  R(ctx, wX, tunnelFloor - 12, 3, 3, "#b45309");
  R(ctx, wX - 1, tunnelFloor - 9, 5, 5, "#ea580c");
  R(ctx, wX, tunnelFloor - 4, 2, wLeg ? 4 : 3, "#1e293b");
  R(ctx, wX + 1, tunnelFloor - 4, 2, wLeg ? 3 : 4, "#1e293b");
}

function drawSunkenTemple(ctx: CanvasRenderingContext2D, x: number, y: number, _tick: number, isNight = true) {
  const x0 = Math.round(x);
  const y0 = Math.round(y);

  const dX = x0 + 52;
  const dY = y0 - 32;
  const domeColor = isNight ? "#083344" : "#38bdf8";
  R(ctx, dX - 18, dY - 4, 36, 12, domeColor);
  R(ctx, dX - 3, dY - 26, 2, 22, domeColor);
  R(ctx, dX - 10, dY - 18, 14, 1, domeColor);
  R(ctx, dX - 12, dY - 18, 2, 14, domeColor);

  R(ctx, x0 - 36, y0 + 6, 72, 4, "#1e293b");
  R(ctx, x0 - 34, y0 + 7, 68, 3, "#475569");
  R(ctx, x0 - 32, y0 + 2, 64, 4, "#334155");
  R(ctx, x0 - 30, y0 + 3, 60, 3, "#64748b");
  R(ctx, x0 - 28, y0 - 2, 56, 4, "#475569");
  R(ctx, x0 - 26, y0 - 1, 52, 3, "#94a3b8");

  const c1X = x0 - 22;
  R(ctx, c1X - 2, y0 - 28, 6, 26, "#334155");
  R(ctx, c1X - 1, y0 - 27, 4, 25, "#94a3b8");
  R(ctx, c1X, y0 - 27, 2, 25, "#e2e8f0");
  R(ctx, c1X - 3, y0 - 31, 8, 3, "#cbd5e1");

  const c2X = x0 - 8;
  R(ctx, c2X - 2, y0 - 28, 6, 26, "#334155");
  R(ctx, c2X - 1, y0 - 27, 4, 25, "#94a3b8");
  R(ctx, c2X, y0 - 27, 2, 25, "#e2e8f0");
  R(ctx, c2X - 3, y0 - 31, 8, 3, "#cbd5e1");

  const c3X = x0 + 6;
  R(ctx, c3X - 2, y0 - 14, 6, 12, "#334155");
  R(ctx, c3X - 1, y0 - 13, 4, 11, "#94a3b8");
  R(ctx, c3X, y0 - 13, 2, 11, "#e2e8f0");
  R(ctx, c3X - 2, y0 - 16, 2, 2, "#94a3b8");
  R(ctx, c3X + 1, y0 - 15, 2, 2, "#94a3b8");

  const c4X = x0 + 20;
  R(ctx, c4X - 1, y0 - 26, 6, 24, "#334155");
  R(ctx, c4X, y0 - 25, 4, 23, "#94a3b8");
  R(ctx, c4X + 1, y0 - 25, 2, 23, "#e2e8f0");
  R(ctx, c4X - 2, y0 - 29, 8, 3, "#cbd5e1");

  R(ctx, c1X - 4, y0 - 34, 38, 4, "#334155");
  R(ctx, c1X - 3, y0 - 33, 36, 3, "#94a3b8");
  R(ctx, c1X - 3, y0 - 33, 36, 1, "#e2e8f0");
  R(ctx, c1X + 31, y0 - 34, 3, 2, "#cbd5e1");

  R(ctx, x0 + 8, y0 + 1, 10, 4, "#64748b");
  R(ctx, x0 + 9, y0 + 2, 8, 2, "#cbd5e1");

  R(ctx, c1X - 2, y0 - 18, 2, 6, "#15803d");
  R(ctx, c2X + 3, y0 - 12, 4, 4, "#f43f5e");
  R(ctx, c4X - 3, y0 - 6, 3, 5, "#be185d");
  R(ctx, x0 - 26, y0 + 1, 5, 3, "#facc15");
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

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document !== "undefined") {
      return (document.documentElement.dataset.theme as "light" | "dark") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const updateTheme = () => {
      const current = (document.documentElement.dataset.theme as "light" | "dark") || "dark";
      setTheme(current);
    };
    updateTheme();
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "data-theme") {
          updateTheme();
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const isDark = theme === "dark";

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
    const scenery = sceneryFor(year, isDark);
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

      // 1. Jagged dune edge + outline (The seabed foundation)
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

      // 2. Theme Landmark Centerpiece (Drawn on top of the seabed)
      if (scenery.theme === "shipwreck") {
        drawShipwreck(ctx, Math.floor(BW * 0.72), sandTop + 4, tick, scenery.isNight);
      } else if (scenery.theme === "aquarium") {
        drawAquariumPark(ctx, BW, sandTop, tick, scenery.isNight);
      } else if (scenery.theme === "temple") {
        drawSunkenTemple(ctx, Math.floor(BW * 0.44), sandTop + 4, tick, scenery.isNight);
      } else if (scenery.theme === "abyss") {
        drawShipwreck(ctx, Math.floor(BW * 0.72), sandTop + 4, tick, scenery.isNight);
      } else if (scenery.theme === "kelp") {
        const bx = Math.floor(BW * 0.48);
        const by = sandTop + 4;
        const stoneDark = scenery.isNight ? "#1c1917" : "#44403c";
        const stoneLight = scenery.isNight ? "#44403c" : "#78716c";
        R(ctx, bx - 14, by - 16, 28, 20, stoneDark);
        R(ctx, bx - 12, by - 14, 24, 16, stoneLight);
        R(ctx, bx - 5, by - 10, 10, 10, "#0284c7");
        R(ctx, bx - 4, by - 9, 8, 8, "#38bdf8");
        R(ctx, bx - 3, by - 8, 6, 6, "#e0f2fe");
      }

      // 3. Tiered Coral Reef Shelves on Left & Right Flanks
      if (scenery.theme === "shipwreck" || scenery.theme === "abyss" || scenery.theme === "temple" || scenery.theme === "kelp") {
        drawCoralShelves(ctx, BW, sandTop, tick, scenery.isNight);
      }

      // 4. Kelp ribbons + branching corals on the sand
      kelpSpots.forEach((k, i) => {
        const sway = (tick % 4 < 2 ? 1 : -1) * (i % 2 === 0 ? 1 : 0);
        drawKelp(ctx, k.nx * BW, BH - 4, k.h, sway, scenery.kelp, scenery.kelpDark);
      });
      coralSpots.forEach((c, i) => {
        const sway = tick % 4 < 2 ? 1 : 0;
        drawBranchingCoral(ctx, c.nx * BW, BH - 3, c.color, "#ffffff", c.tall, i % 2 === 0 ? sway : -sway);
        R(ctx, c.nx * BW - 3, BH - 3, 7, 2, scenery.rock);
      });

      // 5. Starfish resting on the sand
      drawStarfish(ctx, Math.floor(BW * 0.2), sandTop + 13, "#ea580c");
      drawStarfish(ctx, Math.floor(BW * 0.58), sandTop + 17, "#f43f5e");

      // 6. Crabs crawling on the sand
      crabs.forEach((crab) => {
        drawCrab(ctx, crab.nx * BW, BH - 3, tick % 2 === 0);
      });

      // 7. Foreground silhouette blades at edges
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
        const bounds = getFishBounds(fish.species, fish.tier);
        // Depth shadow tailored to fish size
        const shadowW = Math.max(8, Math.round(bounds.hitR * 1.2));
        R(ctx, fx - Math.floor(shadowW / 2), fy + bounds.maxLy + 3, shadowW, 1, "#0a2e4a");
        const excited = seeking.has(i) || fish.eatT > 0;
        const frame = Math.floor(time / (excited ? 130 : 260) + fish.phase) % 2 === 0;
        drawFish(ctx, fx, fy, fish.tier, fish.species, fish.dir, frame, i === hovered.index);
        if (fish.eatT > 0) {
          // Munch sparkle right at the mouth of this species
          const mx = fish.dir === 1 ? fx + bounds.mouthLx : fx - bounds.mouthLx;
          const my = fy + bounds.mouthLy;
          R(ctx, mx, my, 1, 1, "#ffffff");
          R(ctx, mx + (tick % 2 === 0 ? 1 : -1), my - 1, 1, 1, "#fff8dc");
        }
        hits.push({ x: fx * scale, y: fy * scale, r: Math.max(16, bounds.hitR * scale * 1.1), day: fish.day });
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
        const bubbleColor = scenery.isNight ? "#38bdf8" : "#ecfdf5";
        R(ctx, bx, by, s, 1, bubbleColor);
        R(ctx, bx, by + s - 1, s, 1, bubbleColor);
        R(ctx, bx, by, 1, s, bubbleColor);
        R(ctx, bx + s - 1, by, 1, s, bubbleColor);
      });

      if (school.length === 0) {
        ctx.fillStyle = scenery.isNight ? "#38bdf8" : "#0f766e";
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
  }, [calendar, selectedYear, isDark]);

  const displayYear = selectedYear ?? yearFromCalendar(calendar);
  const activeDays = calendar.weeks.flatMap((w) => w.contributionDays).filter((d) => d.contributionCount > 0).length;
  const sceneryName = sceneryFor(displayYear, isDark).name;

  return (
    <div className="github-grass-card">
      <div className="github-grass-heading">
        <span className="inline-flex items-center gap-1.5 flex-wrap">
          Contribution aquarium · {displayYear} reef
          <span className="inline-flex items-center gap-1 text-[11px] font-normal text-[var(--gh-muted)]">
            · {isDark ? <Moon size={11} /> : <Sun size={11} />} {isDark ? "Night" : "Day"}
          </span>
        </span>
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
          aria-label={`${calendar.totalContributions} GitHub contributions in ${displayYear} visualized as pixel fish in the ${isDark ? "night" : "day"} ${sceneryName} reef. Activate the Drop feed button or click the tank to feed them.`}
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
