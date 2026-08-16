"use client";

import { useEffect, useState } from "react";
import { iso, isoBox, polyPoints } from "@/lib/iso";

const CYCLE = 6000;
const RISE_START = 500;
const RISE_END = 1800;
const RIDGE_END = 2400;
const DOOR_END = 3000;
const FADE_START = CYCLE - 500;

function useElapsed(cycle: number, run: boolean) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      setT((now - start) % cycle);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cycle, run]);
  return t;
}

const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
const a2 = (hex: string, alpha: string) => `${hex}${alpha}`;

const PLAT_W = 170;
const PLAT_D = 72;
const PLAT_H = 14;
const CONT_W = 118;
const CONT_D = 50;
const CONT_H = 34;
const OFFSET_X = (PLAT_W - CONT_W) / 2;
const OFFSET_Y = (PLAT_D - CONT_D) / 2;

export default function IsoContainer({
  variant = "build",
  color = "#3DDC97",
}: {
  variant?: "build" | "static";
  color?: string;
}) {
  const t = useElapsed(CYCLE, variant === "build");

  const riseP =
    variant === "static"
      ? 1
      : easeOut(Math.max(0, Math.min(1, (t - RISE_START) / (RISE_END - RISE_START))));
  const ridgeP =
    variant === "static"
      ? 1
      : Math.max(0, Math.min(1, (t - RISE_END) / (RIDGE_END - RISE_END)));
  const doorP =
    variant === "static"
      ? 1
      : Math.max(0, Math.min(1, (t - RIDGE_END) / (DOOR_END - RIDGE_END)));
  const running = variant === "static" || t > DOOR_END;
  const fadeOut =
    variant === "static" ? 1 : t > FADE_START ? (CYCLE - t) / (CYCLE - FADE_START) : 1;

  const phase =
    variant === "static"
      ? "container running"
      : t < RISE_START
      ? "positioning platform"
      : t < RISE_END
      ? "assembling walls"
      : t < RIDGE_END
      ? "reinforcing frame"
      : t < DOOR_END
      ? "sealing door"
      : "container running";

  const platform = isoBox(0, 0, 0, PLAT_W, PLAT_D, PLAT_H);
  const container = isoBox(OFFSET_X, OFFSET_Y, PLAT_H, CONT_W, CONT_D, CONT_H * riseP);
  const contactRing = isoBox(OFFSET_X, OFFSET_Y, PLAT_H, CONT_W, CONT_D, 0).top;

  const currentH = CONT_H * riseP;
  const ridgeXs = [0.18, 0.38, 0.58, 0.78].map((f) => OFFSET_X + CONT_W * f);
  const doorX = OFFSET_X + CONT_W * 0.86;

  return (
    <div className="mt-14 flex flex-col items-center">
      <svg
        viewBox="-85 -55 260 190"
        className="h-auto w-[300px]"
        fill="none"
        aria-hidden="true"
        style={{ opacity: fadeOut }}
      >
        <ellipse cx="45" cy="98" rx="88" ry="9" fill="#00000070" />

        <polygon points={polyPoints(platform.top)} fill="#171B24" stroke="#2A3038" strokeWidth="1.2" />
        <polygon points={polyPoints(platform.front)} fill="#0D0F13" stroke="#2A3038" strokeWidth="1.2" />
        <polygon points={polyPoints(platform.side)} fill="#08090B" stroke="#2A3038" strokeWidth="1.2" />

        <polygon points={polyPoints(contactRing)} fill="none" stroke={a2(color, "40")} strokeWidth="1" />

        {riseP > 0.02 && (
          <>
            <polygon points={polyPoints(container.top)} fill={a2(color, "55")} stroke={color} strokeWidth="1.6" />
            <polygon points={polyPoints(container.front)} fill={a2(color, "38")} stroke={color} strokeWidth="1.6" />
            <polygon points={polyPoints(container.side)} fill={a2(color, "22")} stroke={color} strokeWidth="1.6" />

            {ridgeXs.map((x, i) => {
              const p1 = iso(x, OFFSET_Y, PLAT_H);
              const p2 = iso(x, OFFSET_Y, PLAT_H + currentH);
              return (
                <line
                  key={i}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#0B0D10"
                  strokeOpacity={0.4}
                  strokeWidth="1.2"
                />
              );
            })}

            {(() => {
              const p1 = iso(doorX, OFFSET_Y, PLAT_H);
              const p2 = iso(doorX, OFFSET_Y, PLAT_H + currentH);
              return (
                <>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#0B0D10"
                    strokeOpacity={0.55}
                    strokeWidth="1.8"
                  />
                  {doorP > 0.95 && (
                    <circle cx={(p1.x + p2.x) / 2} cy={(p1.y + p2.y) / 2} r="2.2" fill="#0B0D10" />
                  )}
                </>
              );
            })()}
          </>
        )}
      </svg>

      <div className="mt-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-dim">
        <span
          className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
          style={{ backgroundColor: running ? color : "#4B5157", boxShadow: running ? `0 0 6px ${color}` : "none" }}
        />
        <span style={{ color: running ? color : undefined }}>{phase}</span>
      </div>
    </div>
  );
}
