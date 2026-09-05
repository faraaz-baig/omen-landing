"use client";

import { useEffect, useRef } from "react";

/* ── model ──────────────────────────────────────────────────────────────
   A B-DNA double helix drawn with a painter's algorithm. Everything —
   backbone segments, base pairs, nucleotide nodes — goes into one list
   keyed by depth, gets sorted, and is painted back-to-front. That single
   choice is what sells the volume: strands genuinely pass behind each
   other instead of overlapping like flat ribbons.                       */

const PAIRS = 26; // base pairs rendered
const TURNS = 2.5; // helical turns across the visible strand
const SAMPLES = 160; // backbone resolution, per strand
const AXIS_TILT = 0.52; // ~30°, the helix lies on the diagonal
/* Real B-DNA backbones aren't 180° apart — the ~144°/216° split is what
   carves the minor and major grooves. Without this it reads as a generic
   twisted ladder. */
const GROOVE = Math.PI * 0.8;

const NEAR = [242, 238, 230] as const; // bone white, closest to the viewer
const FAR = [86, 100, 108] as const; // cold slate, receding into the black
const SIGNAL = [206, 240, 234] as const; // the pulse — the only colour on the page

const PULSE_PERIOD = 8.4; // seconds between signal sweeps
const PULSE_WIDTH = 0.055; // gaussian sigma, in strand-length units

type Item = {
  z: number;
  paint: () => void;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const smoothstep = (e: number) =>
  e <= 0 ? 0 : e >= 1 ? 1 : e * e * (3 - 2 * e);

export default function Helix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    const startedAt = performance.now();

    // pointer parallax, eased toward the target every frame
    const tilt = { current: 0, target: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    /** colour at depth `d` (0 far → 1 near), pushed toward the signal hue by `s` */
    const shade = (d: number, s: number) => {
      const r = lerp(lerp(FAR[0], NEAR[0], d), SIGNAL[0], s);
      const g = lerp(lerp(FAR[1], NEAR[1], d), SIGNAL[1], s);
      const b = lerp(lerp(FAR[2], NEAR[2], d), SIGNAL[2], s);
      return `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`;
    };

    /** fade the strand out at both ends so it emerges from and dissolves into black */
    const envelope = (u: number) => smoothstep(Math.min(u, 1 - u) / 0.16);

    const draw = (now: number) => {
      const t = reduced ? 6 : (now - startedAt) / 1000;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const span = height * 0.88;
      const top = cy - span / 2;
      // slow breath in and out of the barrel radius
      const radius =
        Math.min(width * 0.13, 34) * (1 + Math.sin(t * 0.55) * 0.03);
      const spin = t * 0.4;

      tilt.current += (tilt.target - tilt.current) * 0.05;
      ctx.translate(cx, cy);
      ctx.rotate(AXIS_TILT + tilt.current * 0.05);
      ctx.translate(-cx, -cy);

      // the signal sweeps along the strand, then rests off-screen before returning
      const pulseHead = 1.35 - ((t % PULSE_PERIOD) / PULSE_PERIOD) * 1.7;
      const signalAt = (u: number) =>
        Math.exp(-((u - pulseHead) ** 2) / (2 * PULSE_WIDTH ** 2));

      const point = (u: number, strand: 0 | 1) => {
        const angle = u * TURNS * Math.PI * 2 + spin + strand * GROOVE;
        return {
          x: cx + Math.sin(angle) * radius,
          y: top + u * span,
          z: Math.cos(angle), // −1 behind the axis, +1 in front
        };
      };

      const items: Item[] = [];

      // ── backbones ────────────────────────────────────────────────────
      for (let strand = 0; strand < 2; strand++) {
        // the trailing strand sits a touch quieter; perfect symmetry looks synthetic
        const weight = strand === 0 ? 1 : 0.84;

        for (let i = 0; i < SAMPLES; i++) {
          const u0 = i / SAMPLES;
          const u1 = (i + 1) / SAMPLES;
          const a = point(u0, strand as 0 | 1);
          const b = point(u1, strand as 0 | 1);

          const um = (u0 + u1) / 2;
          const env = envelope(um);
          if (env <= 0.001) continue;

          const z = (a.z + b.z) / 2;
          const d = (z + 1) / 2;
          const s = signalAt(um) * 0.85;

          const alpha = env * weight * (0.09 + 0.74 * d * d) + s * 0.28 * env;
          const lineWidth = 0.45 + 1.35 * d * d + s * 0.45;
          const color = shade(d, s);

          items.push({
            z,
            paint: () => {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(${color}, ${alpha})`;
              ctx.lineWidth = lineWidth;
              ctx.lineCap = "round";
              ctx.stroke();
            },
          });
        }
      }

      // ── base pairs + nucleotides ─────────────────────────────────────
      for (let i = 0; i < PAIRS; i++) {
        const u = 0.03 + (i / (PAIRS - 1)) * 0.94;
        const env = envelope(u);
        if (env <= 0.001) continue;

        const a = point(u, 0);
        const b = point(u, 1);
        const s = signalAt(u);
        const da = (a.z + 1) / 2;
        const db = (b.z + 1) / 2;

        // rung: a gradient so each half fades independently with its own depth
        items.push({
          z: (a.z + b.z) / 2 - 0.02,
          paint: () => {
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(
              0,
              `rgba(${shade(da, s * 0.7)}, ${env * (0.06 + 0.42 * da) + s * env * 0.2})`,
            );
            grad.addColorStop(
              0.5,
              `rgba(${shade((da + db) / 2, s * 0.7)}, ${env * 0.07 + s * env * 0.14})`,
            );
            grad.addColorStop(
              1,
              `rgba(${shade(db, s * 0.7)}, ${env * (0.06 + 0.42 * db) + s * env * 0.2})`,
            );
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.7 + 0.35 * ((da + db) / 2);
            ctx.stroke();
          },
        });

        for (const [p, d, weight] of [
          [a, da, 1],
          [b, db, 0.84],
        ] as const) {
          const r = (0.8 + 1.35 * d * d) * (1 + s * 0.55);
          const alpha = env * weight * (0.12 + 0.78 * d * d) + s * env * 0.3;
          const color = shade(d, s * 0.9);
          // glow only where it earns it: near nodes and the passing signal
          const glow = (d * d * 4.5 + s * 8) * weight;

          items.push({
            z: p.z,
            paint: () => {
              ctx.beginPath();
              ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${color}, ${Math.min(alpha, 1)})`;
              ctx.shadowColor = `rgba(${color}, ${0.5 * alpha})`;
              ctx.shadowBlur = glow;
              ctx.fill();
              ctx.shadowBlur = 0;
            },
          });
        }
      }

      items.sort((p, q) => p.z - q.z);
      for (const item of items) item.paint();

      if (!reduced) frame = requestAnimationFrame(draw);
    };

    const onPointerMove = (e: PointerEvent) => {
      tilt.target = (e.clientX / window.innerWidth) * 2 - 1;
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (reduced) draw(performance.now());
    });
    observer.observe(canvas);

    resize();
    frame = requestAnimationFrame(draw);
    if (!reduced) window.addEventListener("pointermove", onPointerMove);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="h-[240px] w-[240px] sm:h-[300px] sm:w-[300px]"
    />
  );
}
