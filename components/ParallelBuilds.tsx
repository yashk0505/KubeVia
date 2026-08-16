"use client";

import { useEffect, useState } from "react";

const containers = [
  { name: "web", offset: 0 },
  { name: "api", offset: 400 },
  { name: "worker", offset: 850 },
];

const STATES = ["queued", "building", "running"] as const;
const CYCLE_MS = 2600;

function useElapsed() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      setT((now - start) % 100000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

export default function ParallelBuilds() {
  const t = useElapsed();

  return (
    <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {containers.map((c) => {
        const local = (t + c.offset) % CYCLE_MS;
        const progress = Math.min(1, local / (CYCLE_MS * 0.75));
        const stateIdx =
          local < CYCLE_MS * 0.15 ? 0 : local < CYCLE_MS * 0.75 ? 1 : 2;
        const state = STATES[stateIdx];
        const running = state === "running";

        return (
          <div
            key={c.name}
            className={`border p-4 transition-colors duration-500 ${
              running ? "border-signal/40 bg-signal/[0.06]" : "border-line bg-surface/40"
            }`}
          >
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider">
              <span className={running ? "text-ink" : "text-dim"}>
                {c.name}
              </span>
              <span className={running ? "text-signal" : "text-faint"}>
                {state}
              </span>
            </div>
            <div className="mt-4 h-1 w-full overflow-hidden bg-line">
              <div
                className="h-full bg-signal transition-[width] duration-150 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
