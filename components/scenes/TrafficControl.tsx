"use client";

import { useEffect, useMemo } from "react";
import { useCluster } from "@/lib/simulation/store";

export default function TrafficControl() {
  const trafficRate = useCluster((s) => s.trafficRate);
  const setTrafficRate = useCluster((s) => s.setTrafficRate);
  const reconcileAutoPods = useCluster((s) => s.reconcileAutoPods);

  const desired = Math.max(1, Math.min(4, Math.round(trafficRate / 25) + 1));

  useEffect(() => {
    reconcileAutoPods(desired);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desired]);

  const dots = useMemo(
    () =>
      Array.from({ length: Math.max(1, Math.round(trafficRate / 12)) }).map((_, i) => ({
        id: i,
        left: `${10 + ((i * 37) % 80)}%`,
        delay: (i * 0.35) % 2,
        dur: 1.3 + (i % 3) * 0.3,
      })),
    [trafficRate]
  );

  return (
    <div className="glass-panel bracket-corner rounded-lg p-4" style={{ color: "#B47FFF", borderColor: "#B47FFF35" }}>
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider">
        <span className="text-ink">ingress traffic</span>
        <span className="text-purple">{trafficRate} req/s</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={trafficRate}
        onChange={(e) => setTrafficRate(Number(e.target.value))}
        className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#B47FFF]"
      />

      <div className="relative mt-4 h-8 overflow-hidden">
        {dots.map((d) => (
          <span
            key={d.id}
            className="absolute h-1.5 w-1.5 rounded-full bg-purple"
            style={{ left: d.left, animation: `traffic-fall ${d.dur}s linear ${d.delay}s infinite` }}
          />
        ))}
      </div>

      <p className="mt-2 font-mono text-[10.5px] text-faint">target replicas: {desired}</p>
    </div>
  );
}
