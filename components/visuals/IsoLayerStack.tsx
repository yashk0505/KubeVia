"use client";

import { useEffect, useState } from "react";
import { isoBox, polyPoints } from "@/lib/iso";

const PLAT_W = 150;
const PLAT_D = 60;
const PLAT_H = 10;
const SLAB_W = 96;
const SLAB_D = 40;
const SLAB_H = 9;
const LAYERS = 5;
const CYCLE = 5200;

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
const a2 = (hex: string, alpha: string) => `${hex}${alpha}`;

export default function IsoLayerStack({ color = "#3DD6FF" }: { color?: string }) {
  const t = useElapsed(CYCLE);
  const perLayer = CYCLE / (LAYERS + 1.4);

  const offsetX = (PLAT_W - SLAB_W) / 2;
  const offsetY = (PLAT_D - SLAB_D) / 2;
  const platform = isoBox(0, 0, 0, PLAT_W, PLAT_D, PLAT_H);
  const contactRing = isoBox(offsetX, offsetY, PLAT_H, SLAB_W, SLAB_D, 0).top;

  return (
    <div className="mt-14 flex flex-col items-center">
      <svg viewBox="-75 -95 220 195" className="h-auto w-[260px]" fill="none" aria-hidden="true">
        <ellipse cx="0" cy="72" rx="76" ry="8" fill="#00000070" />
        <polygon points={polyPoints(platform.top)} fill="#171B24" stroke="#2A3038" strokeWidth="1.1" />
        <polygon points={polyPoints(platform.front)} fill="#0D0F13" stroke="#2A3038" strokeWidth="1.1" />
        <polygon points={polyPoints(platform.side)} fill="#08090B" stroke="#2A3038" strokeWidth="1.1" />
        <polygon points={polyPoints(contactRing)} fill="none" stroke={a2(color, "30")} strokeWidth="0.8" />

        {Array.from({ length: LAYERS }).map((_, i) => {
          const start = i * perLayer;
          const p = Math.max(0, Math.min(1, (t - start) / (perLayer * 0.7)));
          if (p <= 0) return null;
          const zBase = PLAT_H + i * SLAB_H;
          const box = isoBox(offsetX, offsetY, zBase, SLAB_W, SLAB_D, SLAB_H * easeOut(p));
          return (
            <g key={i}>
              <polygon points={polyPoints(box.top)} fill={a2(color, "58")} stroke={color} strokeWidth="1.3" />
              <polygon points={polyPoints(box.front)} fill={a2(color, "3A")} stroke={color} strokeWidth="1.3" />
              <polygon points={polyPoints(box.side)} fill={a2(color, "22")} stroke={color} strokeWidth="1.3" />
            </g>
          );
        })}
      </svg>
      <div className="mt-2 font-mono text-[11px] uppercase tracking-wider text-dim">
        image layers
      </div>
    </div>
  );
}
