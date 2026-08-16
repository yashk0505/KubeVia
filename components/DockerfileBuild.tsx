"use client";

import { useEffect, useState } from "react";

const CYCLE = 6400;

const LINES = [
  { code: "FROM node:20-slim", layer: "base image" },
  { code: "WORKDIR /app", layer: "workdir" },
  { code: "COPY package.json .", layer: "manifest" },
  { code: "RUN npm install", layer: "dependencies" },
  { code: "COPY . .", layer: "app code" },
  { code: 'CMD ["npm", "start"]', layer: "entrypoint" },
];

const STEP = CYCLE / LINES.length;

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

export default function DockerfileBuild() {
  const t = useElapsed(CYCLE);
  const raw = t / STEP;
  const activeIndex = Math.min(LINES.length - 1, Math.floor(raw));
  const builtCount = Math.min(
    LINES.length,
    Math.floor(raw) + (raw % 1 > 0.55 ? 1 : 0)
  );

  return (
    <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
      {/* the Dockerfile itself */}
      <div className="glass-panel bracket-corner rounded-lg" style={{ color: "#3DD6FF", borderColor: "#3DD6FF35" }}>
        <div className="border-b border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-dim">
          Dockerfile
        </div>
        <div className="px-4 py-3">
          {LINES.map((l, i) => {
            const active = i === activeIndex;
            const done = i < builtCount;
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 py-[5px] font-mono text-[12px] transition-colors duration-300"
                style={{
                  color: active ? "#F5F1FF" : done ? "#BEB8D8" : "#6E6890",
                }}
              >
                <span
                  className="h-1 w-1 shrink-0 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor: active || done ? "#3DD6FF" : "#2E2450",
                  }}
                />
                {l.code}
              </div>
            );
          })}
        </div>
      </div>

      {/* the image it produces, layer by layer */}
      <div className="glass-panel bracket-corner rounded-lg" style={{ color: "#3DD6FF", borderColor: "#3DD6FF35" }}>
        <div className="border-b border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-dim">
          resulting image
        </div>
        <div className="flex flex-col-reverse gap-1.5 px-4 py-3">
          {LINES.map((l, i) => {
            const on = i < builtCount;
            return (
              <div
                key={i}
                className="flex h-8 items-center justify-between rounded border px-3 font-mono text-[10.5px] uppercase tracking-wider transition-all duration-500 ease-out"
                style={{
                  borderColor: on ? "#3DD6FF" : "#2E2450",
                  backgroundColor: on ? "#3DD6FF14" : "transparent",
                  color: on ? "#F5F1FF" : "#6E6890",
                  opacity: on ? 1 : 0.4,
                  transform: on ? "translateX(0)" : "translateX(-10px)",
                }}
              >
                <span>{l.layer}</span>
                {on && <span className="text-cyan">layer {i + 1}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
