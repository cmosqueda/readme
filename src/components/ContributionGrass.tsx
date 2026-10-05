import { useEffect, useRef, useState } from "react";

type ContributionDay = { contributionCount: number; date: string; weekday: number };
type ContributionCalendar = { totalContributions: number; weeks: Array<{ contributionDays: ContributionDay[] }> };
type Tooltip = ContributionDay & { x: number; y: number };

const username = "cmosqueda";
const artworkUrl = `https://raw.githubusercontent.com/${username}/readme/output/output.png`;
const dataUrl = `https://raw.githubusercontent.com/${username}/readme/output/contributions.json`;

const TARGET_FPS = 28;
const FRAME_MS = 1000 / TARGET_FPS;
/** Hard cap so a very active year stays readable and cheap to draw. */
const MAX_FISH = 32;
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

function createDemoCalendar(): ContributionCalendar {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 370 - start.getDay());
  const weeks = Array.from({ length: 53 }, (_, week) => ({
    contributionDays: Array.from({ length: 7 }, (_, weekday) => {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + weekday);
      const pattern = (week * 17 + weekday * 11 + Math.floor(week / 5) * 3) % 20;
      const contributionCount = pattern < 7 ? 0 : pattern < 12 ? 1 : pattern < 16 ? 4 : pattern < 19 ? 9 : 18;
      return { contributionCount, date: date.toISOString().slice(0, 10), weekday };
    }),
  }));
  return { totalContributions: weeks.flatMap((week) => week.contributionDays).reduce((total, day) => total + day.contributionCount, 0), weeks };
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

function drawKelp(ctx: CanvasRenderingContext2D, x: number, baseY: number, h: number, sway: number, color: string) {
  const x0 = Math.round(x);
  for (let i = 0; i < h; i += 1) {
    const step = i > h * 0.5 ? sway : 0;
    R(ctx, x0 + step, baseY - i, 1, 1, i % 3 === 2 ? "#2e7d32" : color);
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
  const [hasLiveData, setHasLiveData] = useState(false);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  /** Random pinch of feed for the button / keyboard users. */
  const feedRef = useRef<() => void>(() => {});

  useEffect(() => {
    const controller = new AbortController();
    const cacheKey = new Date().toISOString().slice(0, 10);
    fetch(`${dataUrl}?v=${cacheKey}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Contribution data is unavailable"))))
      .then((data: ContributionCalendar) => {
        setCalendar(data);
        setHasLiveData(true);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setHasLiveData(false);
      });
    return () => controller.abort();
  }, []);

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
    const seed = calendar.totalContributions * 31 + calendar.weeks.length * 101;
    const rand = mulberry32(seed || 7);

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
      const tier = Math.max(1, fishTier(day.contributionCount)) as 1 | 2 | 3 | 4;
      const species = pickSpecies(rand(), tier);
      const depth = 0.55 + rand() * 0.45;
      return {
        day,
        tier,
        nx: rand(),
        yFrac: 0.08 + rand() * 0.7,
        speed: (tier >= 4 ? 26 : tier === 3 ? 20 : 13) + rand() * 14,
        dir: (i % 4 === 0 ? -1 : 1) as 1 | -1,
        depth,
        species,
        phase: rand() * Math.PI * 2,
        eatT: 0,
      };
    });
    school.sort((a, b) => a.depth - b.depth);
    // Dropped feed + bite crumbs. Capped + short-lived so it stays cheap.
    const feeds: Feed[] = [];
    const crumbs: Crumb[] = [];
    const ripples: Ripple[] = [];

    const bubbles: Bubble[] = Array.from({ length: 22 }, (_, i) => ({
      nx: rand(),
      y: rand(),
      s: rand() < 0.7 ? 2 : 3,
      // ~5x slower than before: lazy rise, some barely hover.
      speed: 0.008 + rand() * 0.02,
      // Stagger phases/directions: even/odd sway opposite ways at own pace.
      drift: rand() * Math.PI * 2,
      swaySpeed: (0.35 + rand() * 0.85) * (i % 2 === 0 ? 1 : -1),
      swayAmp: 1 + Math.floor(rand() * 3),
      bobAmp: rand() < 0.4 ? 1 : 0,
    }));
    const crabs: Crab[] = [
      { nx: 0.3, dir: 1, speed: 0.008, phase: rand() * 6 },
      { nx: 0.55, dir: -1, speed: 0.006, phase: rand() * 6 },
    ];
    const speckles = Array.from({ length: 120 }, () => ({ nx: rand(), yFrac: rand(), light: rand() < 0.4 }));
    const kelpSpots = Array.from({ length: 9 }, () => ({ nx: rand(), h: 8 + Math.floor(rand() * 10) }));
    const coralSpots = [
      { nx: 0.06, color: "#d90429", tall: 10 },
      { nx: 0.38, color: "#ff5d8f", tall: 7 },
      { nx: 0.68, color: "#e9c46a", tall: 8 },
      { nx: 0.84, color: "#ef476f", tall: 11 },
    ];

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

    // Banded teal water — flat squares, no gradients.
    const WATER = ["#6fe3c1", "#4ed6b6", "#35c0c8", "#2aa8c4", "#1f8ab8", "#1a6fa8", "#155a94", "#10467e", "#0d3a6e"];
    const drawWater = (tick: number) => {
      const BW = buf.width;
      const bandH = Math.max(1, Math.floor(sandTop / WATER.length));
      WATER.forEach((color, i) => {
        R(ctx, 0, i * bandH, BW, i === WATER.length - 1 ? sandTop - i * bandH + 1 : bandH, color);
      });
      // Pixel surface with a blocky wave.
      R(ctx, 0, 0, BW, 4, "#a7f3d0");
      for (let x = 0; x < BW; x += 4) {
        const wob = (x % 8 === 0 ? 1 : 0) + (tick % 2 === 0 && x % 16 === 0 ? 1 : 0);
        R(ctx, x, 4 + wob, 3, 1, "#ecfdf5");
      }
      // Stepped light rays (dithered squares, quantized drift).
      const drift = tick % 4;
      for (let r = 0; r < 3; r += 1) {
        const base = Math.floor(BW * (0.22 + r * 0.26)) + drift;
        for (let y = 0; y < sandTop; y += 2) {
          const x = base + Math.floor(y * 0.25);
          if (((x + y) & 1) === 0) R(ctx, x, y, 2, 1, "#a7f3d0");
        }
      }
      // Sparse drifting plankton squares.
      for (let i = 0; i < 24; i += 1) {
        const px = (i * 53 + tick) % BW;
        const py = (i * 37) % sandTop;
        if (((px + py) & 3) === 0) R(ctx, px, py, 1, 1, "#d1fae5");
      }
    };

    const drawSand = (tick: number) => {
      const BW = buf.width;
      const BH = buf.height;
      // Jagged dune edge + outline, all squares.
      for (let x = 0; x < BW; x += 1) {
        const dune = Math.round(Math.sin(x / 18) * 2 + Math.sin(x / 7) * 1);
        const top = sandTop + dune;
        R(ctx, x, top, 1, 1, "#fff7d6");
        R(ctx, x, top + 1, 1, BH - top, "#e8d49a");
      }
      R(ctx, 0, sandTop + 5, BW, 1, "#d9b96a");
      speckles.forEach((s) => {
        R(ctx, s.nx * BW, sandTop + 7 + s.yFrac * (BH - sandTop - 9), 1, 1, s.light ? "#fff7d6" : "#c49a52");
      });
      // Seaweed blobs + kelp + corals + a tiny hut, like the reference.
      kelpSpots.forEach((k, i) => {
        const sway = (tick % 4 < 2 ? 1 : -1) * (i % 2 === 0 ? 1 : 0);
        drawKelp(ctx, k.nx * BW, BH - 4, k.h, sway, "#22c55e");
      });
      coralSpots.forEach((c, i) => {
        const sway = tick % 4 < 2 ? 1 : 0;
        drawCoral(ctx, c.nx * BW, BH - 3, c.color, c.tall, i % 2 === 0 ? sway : -sway);
        R(ctx, c.nx * BW - 3, BH - 3, 7, 2, "#8d7b68");
      });
      // Hut ruin.
      const hx = Math.floor(BW * 0.3);
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
  }, [calendar]);

  return (
    <div className="github-grass-card">
      <div className="github-grass-heading">
        <span>Contribution aquarium</span>
        <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer">
          @{username}
        </a>
      </div>
      <div className="contribution-aquarium">
        <canvas
          ref={canvasRef}
          className="contribution-aquarium-canvas"
          aria-label={`${calendar.totalContributions} GitHub contributions visualized as pixel fish. Activate the Drop feed button or click the tank to feed them.`}
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
          ? `Live GitHub activity as pixel fish — ${calendar.totalContributions} contributions, bigger fish mean busier days. Hover a fish, or click the water to drop feed and watch them swarm it.`
          : "Demo school shown locally; live GitHub activity refreshes daily after the workflow runs. Click the water to drop feed."}
      </p>
    </div>
  );
}
