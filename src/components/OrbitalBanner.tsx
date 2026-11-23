import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import BrandMark from "./BrandMark";

type Star = {
  x: number;
  y: number;
  r: number;
  layer: number;
  phase: number;
  twinkleSpeed: number;
  baseAlpha: number;
};

type Streak = {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
};

type IonSpark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
};

type PointerPhysics = {
  x: number;
  y: number;
  nx: number;
  ny: number;
  active: boolean;
  smoothX: number;
  smoothY: number;
  smoothNx: number;
  smoothNy: number;
  strength: number;
  vx: number;
  vy: number;
};

function createSeededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function OrbitalBanner() {
  const stripRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const pointerRef = useRef<PointerPhysics>({
    x: 0,
    y: 0,
    nx: 0,
    ny: 0,
    active: false,
    smoothX: 0,
    smoothY: 0,
    smoothNx: 0,
    smoothNy: 0,
    strength: 0,
    vx: 0,
    vy: 0,
  });

  const rawPointerX = useMotionValue(0);
  const rawPointerY = useMotionValue(0);
  const wordmarkX = useSpring(rawPointerX, { stiffness: 120, damping: 20 });
  const wordmarkY = useSpring(rawPointerY, { stiffness: 120, damping: 20 });

  const rocketParallaxX = useMotionValue(0);
  const rocketParallaxY = useMotionValue(0);
  const rocketTilt = useMotionValue(0);
  const rocketSpringX = useSpring(rocketParallaxX, { stiffness: 85, damping: 16 });
  const rocketSpringY = useSpring(rocketParallaxY, { stiffness: 85, damping: 16 });
  const rocketSpringRotate = useSpring(rocketTilt, { stiffness: 95, damping: 18 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rng = createSeededRng(20261123);
    const stars: Star[] = Array.from({ length: 78 }, (_, idx) => {
      const layer = idx % 3;
      return {
        x: rng(),
        y: rng(),
        r: layer === 2 ? 1.45 : layer === 1 ? 1.05 : 0.75,
        layer,
        phase: rng() * Math.PI * 2,
        twinkleSpeed: 0.9 + rng() * 1.8,
        baseAlpha: layer === 2 ? 0.85 : layer === 1 ? 0.58 : 0.36,
      };
    });

    const streaks: Streak[] = [];
    const sparks: IonSpark[] = [];
    let nextStreakAt = 1.4;
    let sparkAccumulator = 0;

    let width = 960;
    let height = 220;
    let dpr = 1;
    let rafId = 0;
    let inView = true;
    let docVisible = typeof document !== "undefined" ? !document.hidden : true;
    let lastTime = 0;

    const syncSize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(320, Math.round(rect.width || 960));
      height = Math.max(160, Math.round(rect.height || 220));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.round(width * dpr);
      const targetH = Math.round(height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      const p = pointerRef.current;
      if (!p.active && p.smoothX === 0 && p.smoothY === 0) {
        p.x = width * 0.72;
        p.y = height * 0.55;
        p.smoothX = p.x;
        p.smoothY = p.y;
      }
    };

    const drawQuantumGrid = (t: number, p: PointerPhysics) => {
      const vanishX = width * (0.58 + p.smoothNx * 0.14);
      const vanishY = -height * 0.75;
      const totalSpan = height - vanishY;
      const rows = 10;
      const flowOffset = prefersReducedMotion ? 0 : (t * 0.4) % 1;
      const waveCenter = prefersReducedMotion
        ? width * 0.72
        : ((t * 110) % (width * 1.4)) - width * 0.2;

      const warpR = 175;
      const warpPoint = (px: number, py: number): [number, number] => {
        if (prefersReducedMotion || p.strength <= 0.005) return [px, py];
        const dx = px - p.smoothX;
        const dy = py - p.smoothY;
        const dist = Math.hypot(dx, dy);
        if (dist >= warpR) return [px, py];
        const cosFalloff = Math.cos((dist / warpR) * (Math.PI / 2));
        const f = cosFalloff * cosFalloff;
        const pull = p.strength * f * 26;
        const inv = dist > 0.5 ? 1 / dist : 0;
        return [px + dx * inv * pull, py + dy * inv * pull + p.strength * f * 10];
      };

      // Subtle radial gravity-well aura across full banner
      if (!prefersReducedMotion && p.strength > 0.01) {
        const wellGlow = ctx.createRadialGradient(
          p.smoothX,
          p.smoothY,
          0,
          p.smoothX,
          p.smoothY,
          warpR * 0.95,
        );
        wellGlow.addColorStop(0, `rgba(56, 189, 248, ${0.18 * p.strength})`);
        wellGlow.addColorStop(0.5, `rgba(59, 130, 246, ${0.07 * p.strength})`);
        wellGlow.addColorStop(1, "transparent");
        ctx.fillStyle = wellGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // Full-height flowing 3D latitude rows (tight at top, wider toward bottom)
      const hSegments = 28;
      const rowYs: number[] = [];
      ctx.lineWidth = 1;
      for (let r = -1; r <= rows + 1; r += 1) {
        const u = (r + flowOffset) / rows;
        const d = 0.5 + 0.58 * u;
        const y = vanishY + totalSpan * Math.pow(Math.max(0.05, d), 1.45);
        if (y < -30 || y > height + 30) continue;
        rowYs.push(y);

        const depthAlpha = 0.055 + Math.max(0, Math.min(1, y / height)) * 0.115;
        ctx.strokeStyle = `rgba(96, 165, 250, ${depthAlpha})`;
        ctx.beginPath();
        for (let s = 0; s <= hSegments; s += 1) {
          const sx = -60 + (s / hSegments) * (width + 120);
          const [wx, wy] = warpPoint(sx, y);
          if (s === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }

      // Full-width converging perspective meridians spanning y = -24 to height + 24
      const colStep = 56;
      const topScale = (0 - vanishY) / totalSpan;
      const colSpan = Math.ceil((width * 1.4) / (colStep * topScale)) + 4;
      const vSegments = 18;
      const yStart = -24;
      const yEnd = height + 24;

      for (let i = -colSpan; i <= colSpan; i += 1) {
        const bottomX = vanishX + i * colStep;
        const topX = vanishX + (bottomX - vanishX) * topScale;
        if (
          (bottomX < -100 && topX < -100) ||
          (bottomX > width + 100 && topX > width + 100)
        ) {
          continue;
        }

        ctx.strokeStyle = "rgba(56, 189, 248, 0.1)";
        ctx.beginPath();
        for (let s = 0; s <= vSegments; s += 1) {
          const ly = yStart + (s / vSegments) * (yEnd - yStart);
          const tFrac = (ly - vanishY) / totalSpan;
          const lx = vanishX + (bottomX - vanishX) * tFrac;
          const [wx, wy] = warpPoint(lx, ly);
          if (s === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();

        // Travelling quantum wave pulse + cursor proximity highlights at 3D intersections
        for (let r = 0; r < rowYs.length; r += 1) {
          const iy = rowYs[r];
          if (iy === undefined) continue;
          const tFrac = (iy - vanishY) / totalSpan;
          const ix = vanishX + (bottomX - vanishX) * tFrac;
          if (ix < -40 || ix > width + 40) continue;

          const waveDist = Math.abs(ix - waveCenter);
          const wavePulse =
            waveDist < 120
              ? (1 - waveDist / 120) * (0.35 + Math.max(0, Math.min(1, iy / height)) * 0.45)
              : 0;

          const cursorDist = Math.hypot(ix - p.smoothX, iy - p.smoothY);
          const cursorPulse =
            !prefersReducedMotion && p.strength > 0.01 && cursorDist < warpR
              ? (1 - cursorDist / warpR) * p.strength
              : 0;

          if (wavePulse > 0.01 || cursorPulse > 0.02) {
            const [wx, wy] = warpPoint(ix, iy);
            const intensity = Math.min(1, wavePulse + cursorPulse);
            const nodeSize = 2.4 + cursorPulse * 2;
            ctx.fillStyle =
              cursorPulse > 0.35
                ? `rgba(224, 242, 254, ${0.25 + intensity * 0.72})`
                : `rgba(56, 189, 248, ${0.14 + intensity * 0.65})`;
            ctx.fillRect(wx - nodeSize / 2, wy - nodeSize / 2, nodeSize, nodeSize);
          }
        }
      }
    };

    const drawFrame = (timeMs: number) => {
      syncSize();
      const t = timeMs / 1000;
      const dt = lastTime ? Math.min(0.05, (timeMs - lastTime) / 1000) : 0.016;
      lastTime = timeMs;

      const p = pointerRef.current;
      if (!prefersReducedMotion) {
        const lerp = 1 - Math.exp(-9 * dt);
        const targetNx = p.active ? p.nx : 0;
        const targetNy = p.active ? p.ny : 0;
        const targetStrength = p.active ? 1 : 0;

        p.smoothX += (p.x - p.smoothX) * lerp;
        p.smoothY += (p.y - p.smoothY) * lerp;
        p.smoothNx += (targetNx - p.smoothNx) * lerp;
        p.smoothNy += (targetNy - p.smoothNy) * lerp;
        p.strength += (targetStrength - p.strength) * lerp;

        const damp = Math.exp(-6 * dt);
        p.vx *= damp;
        p.vy *= damp;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Deep obsidian space canvas
      const baseGrad = ctx.createLinearGradient(0, 0, width, height);
      baseGrad.addColorStop(0, "#02050c");
      baseGrad.addColorStop(0.5, "#030814");
      baseGrad.addColorStop(1, "#02050d");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient studio rim lights shifting gently with pointer
      const leftGlow = ctx.createRadialGradient(
        width * (0.1 + p.smoothNx * 0.04),
        height * (0.45 + p.smoothNy * 0.05),
        0,
        width * 0.1,
        height * 0.45,
        width * 0.42,
      );
      leftGlow.addColorStop(0, "rgba(56, 139, 253, 0.24)");
      leftGlow.addColorStop(0.55, "rgba(37, 99, 235, 0.07)");
      leftGlow.addColorStop(1, "transparent");
      ctx.fillStyle = leftGlow;
      ctx.fillRect(0, 0, width, height);

      const rightGlow = ctx.createRadialGradient(
        width * (0.86 + p.smoothNx * 0.05),
        height * (0.48 + p.smoothNy * 0.08),
        0,
        width * 0.86,
        height * 0.48,
        width * 0.36,
      );
      rightGlow.addColorStop(0, "rgba(56, 189, 248, 0.24)");
      rightGlow.addColorStop(0.5, "rgba(59, 130, 246, 0.1)");
      rightGlow.addColorStop(1, "transparent");
      ctx.fillStyle = rightGlow;
      ctx.fillRect(0, 0, width, height);

      // Spacetime-warped quantum coordinate grid
      drawQuantumGrid(t, p);

      // Parallax twinkling stars + cursor swipe drift
      for (let i = 0; i < stars.length; i += 1) {
        const star = stars[i];
        if (!star) continue;
        if (!prefersReducedMotion) {
          const speed = (star.layer + 1) * 0.008;
          star.x -= speed * dt + (p.vx * (star.layer + 1) * 0.00018);
          star.y += speed * 0.35 * dt - (p.vy * (star.layer + 1) * 0.00018);
          if (star.x < -0.04) star.x += 1.08;
          if (star.x > 1.04) star.x -= 1.08;
          if (star.y < -0.04) star.y += 1.08;
          if (star.y > 1.04) star.y -= 1.08;
        }
        const twinkle = prefersReducedMotion
          ? 1
          : 0.58 + 0.42 * Math.sin(t * star.twinkleSpeed + star.phase);
        const alpha = star.baseAlpha * twinkle;
        const parallaxX = prefersReducedMotion ? 0 : -p.smoothNx * (star.layer + 1) * 14;
        const parallaxY = prefersReducedMotion ? 0 : -p.smoothNy * (star.layer + 1) * 9;
        const sx = star.x * width + parallaxX;
        const sy = star.y * height + parallaxY;

        ctx.fillStyle = star.layer === 2
          ? `rgba(191, 219, 254, ${alpha})`
          : `rgba(148, 163, 184, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, star.r, 0, Math.PI * 2);
        ctx.fill();

        if (star.layer === 2 && twinkle > 0.9) {
          ctx.fillStyle = `rgba(56, 189, 248, ${(twinkle - 0.9) * 3.5})`;
          ctx.fillRect(sx - 3, sy - 0.5, 6, 1);
          ctx.fillRect(sx - 0.5, sy - 3, 1, 6);
        }
      }

      if (!prefersReducedMotion) {
        // Periodic minimalist starlight streaks
        if (t >= nextStreakAt) {
          streaks.push({
            x: width * (0.25 + Math.random() * 0.7),
            y: height * (0.08 + Math.random() * 0.45),
            len: 28 + Math.random() * 34,
            speed: 240 + Math.random() * 140,
            alpha: 0.55,
          });
          nextStreakAt = t + 2.6 + Math.random() * 3.2;
        }

        for (let i = streaks.length - 1; i >= 0; i -= 1) {
          const st = streaks[i];
          if (!st) continue;
          st.x -= st.speed * dt;
          st.y += st.speed * 0.42 * dt;
          st.alpha -= 0.7 * dt;
          if (st.alpha <= 0) {
            streaks.splice(i, 1);
            continue;
          }
          const grad = ctx.createLinearGradient(st.x, st.y, st.x + st.len, st.y - st.len * 0.42);
          grad.addColorStop(0, `rgba(186, 230, 253, ${st.alpha})`);
          grad.addColorStop(1, "transparent");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.moveTo(st.x, st.y);
          ctx.lineTo(st.x + st.len, st.y - st.len * 0.42);
          ctx.stroke();
        }

        // Ion thruster micro-sparks tracking the rocket's shifted engine position
        sparkAccumulator += dt;
        const emitInterval = p.strength > 0.1 ? 0.03 : 0.045;
        if (sparkAccumulator >= emitInterval) {
          sparkAccumulator = 0;
          const originX = width * 0.855 + p.smoothNx * 34;
          const originY = height * 0.63 + p.smoothNy * 24;
          sparks.push({
            x: originX + (Math.random() - 0.5) * 10,
            y: originY + (Math.random() - 0.5) * 10,
            vx: -38 - Math.random() * 36 - p.smoothNx * 22,
            vy: 64 + Math.random() * 44 - p.smoothNy * 16,
            life: 0,
            maxLife: 0.65 + Math.random() * 0.45,
            size: 1.1 + Math.random() * 1.4,
          });
        }

        for (let i = sparks.length - 1; i >= 0; i -= 1) {
          const sp = sparks[i];
          if (!sp) continue;
          sp.life += dt;
          if (sp.life >= sp.maxLife) {
            sparks.splice(i, 1);
            continue;
          }
          sp.x += sp.vx * dt;
          sp.y += sp.vy * dt;
          const pAlpha = (1 - sp.life / sp.maxLife) * 0.72;
          ctx.fillStyle = `rgba(56, 189, 248, ${pAlpha})`;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size * (1 - (sp.life / sp.maxLife) * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!prefersReducedMotion && inView && docVisible) {
        rafId = requestAnimationFrame(drawFrame);
      } else {
        rafId = 0;
      }
    };

    const startLoop = () => {
      if (!rafId && !prefersReducedMotion && inView && docVisible) {
        lastTime = 0;
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      if (prefersReducedMotion) drawFrame(0);
      else startLoop();
    });
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? false;
        if (inView) startLoop();
        else if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      },
      { threshold: 0.05 },
    );
    const onVisibility = () => {
      docVisible = !document.hidden;
      if (docVisible) startLoop();
      else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);

    drawFrame(0);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [prefersReducedMotion]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !stripRef.current) return;
    const rect = stripRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const nx = px / rect.width - 0.5;
    const ny = py / rect.height - 0.5;

    const p = pointerRef.current;
    if (p.active) {
      p.vx = Math.max(-45, Math.min(45, (px - p.x) * 1.4));
      p.vy = Math.max(-45, Math.min(45, (py - p.y) * 1.4));
    }
    p.x = px;
    p.y = py;
    p.nx = nx;
    p.ny = ny;
    p.active = true;

    rawPointerX.set(nx * 8);
    rawPointerY.set(ny * 5);
    rocketParallaxX.set(nx * 36);
    rocketParallaxY.set(ny * 26);
    rocketTilt.set(nx * 14 - ny * 8);
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
    rawPointerX.set(0);
    rawPointerY.set(0);
    rocketParallaxX.set(0);
    rocketParallaxY.set(0);
    rocketTilt.set(0);
  };

  return (
    <div
      ref={stripRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="orbital-banner-strip"
    >
      <canvas ref={canvasRef} className="orbital-banner-canvas" aria-hidden="true" />

      {/* Centered Stepped-Diamond Wordmark */}
      <motion.div
        className="orbital-banner-wordmark"
        style={prefersReducedMotion ? undefined : { x: wordmarkX, y: wordmarkY }}
      >
        <BrandMark size={22} />
        <span>cmosqueda.vercel.app</span>
      </motion.div>

      {/* Floating Minimalist Vector Rocket */}
      <motion.div
        className="orbital-banner-rocket"
        aria-hidden="true"
        style={
          prefersReducedMotion
            ? undefined
            : { x: rocketSpringX, y: rocketSpringY, rotate: rocketSpringRotate }
        }
      >
        <motion.svg
          viewBox="0 0 180 220"
          className="h-full w-full overflow-visible"
          animate={
            prefersReducedMotion
              ? { rotate: 26 }
              : {
                  y: [-7, 7, -7],
                  x: [0, 3, 0],
                  rotate: [25, 29, 25],
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: 5.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        >
          <defs>
            <linearGradient id="minimalRocketHull" x1="0.15" y1="0" x2="0.85" y2="1">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="32%" stopColor="#1e3a8a" />
              <stop offset="72%" stopColor="#091326" />
              <stop offset="100%" stopColor="#030712" />
            </linearGradient>
            <linearGradient id="minimalRocketFin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#040b18" />
            </linearGradient>
            <linearGradient id="ionPlumeGrad" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Pulsing Ion Thruster Plume */}
          <motion.g
            style={{ originX: "90px", originY: "162px" }}
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    scaleY: [0.88, 1.16, 0.88],
                    opacity: [0.65, 0.95, 0.65],
                  }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          >
            <path
              d="M78 160 L90 212 L102 160 Z"
              fill="url(#ionPlumeGrad)"
            />
            <path
              d="M84 160 L90 192 L96 160 Z"
              fill="#e0f2fe"
              opacity="0.7"
            />
          </motion.g>

          {/* Swept Minimalist Side Fins */}
          <path
            d="M66 116 C40 132, 26 156, 22 182 C42 174, 57 162, 68 148 Z"
            fill="url(#minimalRocketFin)"
            stroke="#38bdf8"
            strokeOpacity="0.75"
            strokeWidth="1.4"
          />
          <path
            d="M114 116 C140 132, 154 156, 158 182 C138 174, 123 162, 112 148 Z"
            fill="url(#minimalRocketFin)"
            stroke="#38bdf8"
            strokeOpacity="0.75"
            strokeWidth="1.4"
          />

          {/* Sleek Main Fuselage */}
          <path
            d="M90 14 C118 52, 124 108, 110 158 L70 158 C56 108, 62 52, 90 14 Z"
            fill="url(#minimalRocketHull)"
            stroke="#60a5fa"
            strokeWidth="1.6"
          />

          {/* Specular Edge Highlight */}
          <path
            d="M89 24 C73 56, 68 102, 75 150"
            fill="none"
            stroke="#bae6fd"
            strokeOpacity="0.55"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Nozzle Collar */}
          <rect
            x="74"
            y="156"
            width="32"
            height="6"
            rx="3"
            fill="#0b1424"
            stroke="#60a5fa"
            strokeWidth="1.2"
          />

          {/* Minimalist Viewport Porthole */}
          <circle
            cx="90"
            cy="82"
            r="15"
            fill="#030814"
            stroke="#60a5fa"
            strokeWidth="2"
          />
          <circle
            cx="90"
            cy="82"
            r="9.5"
            fill="none"
            stroke="#38bdf8"
            strokeOpacity="0.45"
            strokeWidth="1"
          />
          <circle cx="86" cy="78" r="2.2" fill="#e0f2fe" opacity="0.85" />

          {/* Center Spine Fin */}
          <path
            d="M90 124 L90 162"
            stroke="#60a5fa"
            strokeOpacity="0.7"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </motion.svg>
      </motion.div>
    </div>
  );
}
