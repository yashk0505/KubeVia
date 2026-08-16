"use client";

import { useEffect, useState } from "react";
import { isoBox, polyPoints } from "@/lib/iso";

const PLAT_W = 200;
const PLAT_D = 72;
const PLAT_H = 12;
const SLOT_W = 32;
const SLOT_D = 28;
const SLOT_H = 22;
const SLOT_GAP = 10;
const SLOT_COUNT = 4;

// evenly distribute slots across the platform, centered in both axes —
// no arbitrary fudge offsets
const SLOTS_TOTAL_W = SLOT_COUNT * SLOT_W + (SLOT_COUNT - 1) * SLOT_GAP;
const SLOT_MARGIN = (PLAT_W - SLOTS_TOTAL_W) / 2;
const SLOT_Y0 = -SLOT_D / 2;

function useElapsed(cycle: number) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      setT((now - start) % cycle);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cycle]);
  return t;
}

const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

export default function IsoNodeRow({
  label,
  activeSlots,
  cycleMs = 4200,
  phaseOffset = 0,
  color = "#3DDC97",
}: {
  label: string;
  /** how many container slots are "filled" at the peak of the loop (1-4) */
  activeSlots?: number;
  cycleMs?: number;
  phaseOffset?: number;
  color?: string;
}) {
  const a2 = (hex: string, alpha: string) => `${hex}${alpha}`;
  const raw = useElapsed(cycleMs);
  const t = (raw + phaseOffset) % cycleMs;

  // slots fill up one by one, hold, then empty out — a gentle breathing loop
  const fillWindow = cycleMs * 0.45;
  const holdWindow = cycleMs * 0.15;
  const drainStart = fillWindow + holdWindow;

  const targetActive = activeSlots ?? SLOT_COUNT;

  const platform = isoBox(-PLAT_W / 2, -PLAT_D / 2, 0, PLAT_W, PLAT_D, PLAT_H);
  const contactRing = isoBox(-PLAT_W / 2, -PLAT_D / 2, PLAT_H, PLAT_W, PLAT_D, 0).top;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="-135 -100 270 185"
        className="h-auto w-full max-w-[260px]"
        fill="none"
        aria-hidden="true"
      >
        <ellipse cx="0" cy="82" rx="98" ry="9" fill="#00000070" />

        <polygon points={polyPoints(platform.top)} fill="#171B24" stroke="#2A3038" strokeWidth="1.1" />
        <polygon points={polyPoints(platform.front)} fill="#0D0F13" stroke="#2A3038" strokeWidth="1.1" />
        <polygon points={polyPoints(platform.side)} fill="#08090B" stroke="#2A3038" strokeWidth="1.1" />
        <polygon points={polyPoints(contactRing)} fill="none" stroke={a2(color, "30")} strokeWidth="0.8" />

        {Array.from({ length: SLOT_COUNT }).map((_, i) => {
          const slotStart = (i / SLOT_COUNT) * fillWindow;
          const slotEnd = slotStart + fillWindow / SLOT_COUNT;
          const isActiveSlot = i < targetActive;

          let h = 0;
          if (isActiveSlot) {
            if (t < slotStart) h = 0;
            else if (t < slotEnd) h = easeOut((t - slotStart) / (slotEnd - slotStart));
            else if (t < drainStart) h = 1;
            else {
              const drainP = (t - drainStart) / (cycleMs - drainStart);
              h = Math.max(0, 1 - drainP);
            }
          }

          if (h <= 0.01) return null;

          const x0 = -PLAT_W / 2 + SLOT_MARGIN + i * (SLOT_W + SLOT_GAP);
          const box = isoBox(x0, SLOT_Y0, PLAT_H, SLOT_W, SLOT_D, SLOT_H * h);

          return (
            <g key={i}>
              <polygon points={polyPoints(box.top)} fill={a2(color, "36")} stroke={color} strokeWidth="1.2" />
              <polygon points={polyPoints(box.front)} fill={a2(color, "1F")} stroke={color} strokeWidth="1.2" />
              <polygon points={polyPoints(box.side)} fill={a2(color, "12")} stroke={color} strokeWidth="1.2" />
            </g>
          );
        })}
      </svg>

      <div className="-mt-2 font-mono text-[11px] uppercase tracking-wider text-dim">
        {label}
      </div>
    </div>
  );
}
