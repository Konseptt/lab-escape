"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
  door: { x: number; y: number; horizontal: boolean };
}

/**
 * Animated laboratory blueprint.
 *
 * A faint architectural floor plan drifts beneath the hero while a slow
 * scan line sweeps across it, briefly raising the luminance of what it
 * passes. Deliberately quiet: peak brightness stays low so the type wins.
 */
export function LabCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let rooms: Room[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const seedRooms = () => {
      rooms = [];
      const cell = 160;
      const cols = Math.ceil(width / cell) + 1;
      const rowsN = Math.ceil(height / cell) + 1;
      let n = 0;
      for (let r = 0; r < rowsN; r++) {
        for (let c = 0; c < cols; c++) {
          // Deterministic pseudo-random from grid position.
          const h = Math.abs(Math.sin(c * 127.1 + r * 311.7) * 43758.5453) % 1;
          if (h < 0.35) continue;
          const w = cell * (0.5 + (h % 0.4));
          const hh = cell * (0.45 + ((h * 7) % 0.4));
          const x = c * cell + ((h * 13) % 0.3) * cell;
          const y = r * cell + ((h * 29) % 0.3) * cell;
          const horizontal = h > 0.6;
          rooms.push({
            x,
            y,
            w,
            h: hh,
            door: {
              x: horizontal ? x + w * 0.3 : x,
              y: horizontal ? y : y + hh * 0.35,
              horizontal,
            },
          });
          n++;
        }
      }
      void n;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedRooms();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const start = performance.now();

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      const scanX = reduce ? width * 0.4 : ((t * 42) % (width + 480)) - 240;

      for (const room of rooms) {
        // Distance from scan line drives brightness.
        const cx = room.x + room.w / 2;
        const d = Math.abs(cx - scanX);
        const glow = Math.max(0, 1 - d / 320);
        const alpha = 0.045 + glow * 0.075;

        ctx.strokeStyle = `rgba(235, 232, 226, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(room.x, room.y, room.w, room.h);

        // Door gap
        ctx.strokeStyle = "rgba(19, 19, 18, 1)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (room.door.horizontal) {
          ctx.moveTo(room.door.x, room.door.y);
          ctx.lineTo(room.door.x + 18, room.door.y);
        } else {
          ctx.moveTo(room.door.x, room.door.y);
          ctx.lineTo(room.door.x, room.door.y + 18);
        }
        ctx.stroke();

        // Fixation point in scanned rooms
        if (glow > 0.55) {
          ctx.fillStyle = `rgba(255, 122, 61, ${(glow - 0.55) * 0.9})`;
          ctx.beginPath();
          ctx.arc(room.x + room.w / 2, room.y + room.h / 2, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Scan line itself, barely there.
      const grad = ctx.createLinearGradient(scanX - 120, 0, scanX + 4, 0);
      grad.addColorStop(0, "rgba(255, 122, 61, 0)");
      grad.addColorStop(1, "rgba(255, 122, 61, 0.05)");
      ctx.fillStyle = grad;
      ctx.fillRect(scanX - 120, 0, 124, height);

      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [reduce]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
