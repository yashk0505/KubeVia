"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/explore", label: "01. Explore", color: "#00D2FF" },
  { href: "/containers", label: "02. Containers", color: "#FFC93D" },
  { href: "/kubernetes", label: "03. Kubernetes", color: "#FF3D9A" },
  { href: "/networking", label: "04. Networking", color: "#00FFC2" },
  { href: "/topology", label: "05. Topology", color: "#BD00FF" },
];

export default function HudSidebar() {
  const pathname = usePathname();
  const [minimized, setMinimized] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);

  return (
    <>
      {/* Minimized Trigger Floating Pill */}
      {minimized && (
        <button
          onClick={() => setMinimized(false)}
          className="glass-panel fixed right-6 top-20 z-50 hidden xl:flex items-center gap-2.5 rounded-full px-4 py-2 border border-primary/40 bg-[#111318]/90 text-primary font-mono text-xs shadow-[0_0_20px_rgba(0,210,255,0.25)] hover:bg-primary/20 hover:scale-105 transition-all duration-200"
          title="Open KubeVerse HUD"
        >
          <span className="h-2 w-2 rounded-full bg-success-glow animate-pulse" />
          <span className="font-bold tracking-wider">◈ HUD</span>
          <span className="text-[10px] text-on-surface-variant">◀</span>
        </button>
      )}

      {/* Expanded HUD Sidebar */}
      {!minimized && (
        <aside className="glass-panel fixed right-6 top-20 z-40 hidden w-64 flex-col gap-3 rounded-xl p-4 xl:flex shadow-2xl transition-all duration-300 border border-white/10 bg-[#111318]/90 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 text-primary">
                <span className="text-xs">◈</span>
              </div>
              <div>
                <h2 className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary-container">
                  KubeVia HUD
                </h2>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-success-glow">
                  <span className="h-1.5 w-1.5 rounded-full bg-success-glow animate-pulse" />
                  <span>Telemetry Live</span>
                </div>
              </div>
            </div>

            {/* Minimize button */}
            <button
              onClick={() => setMinimized(true)}
              className="flex h-6 w-6 items-center justify-center rounded bg-surface-container text-on-surface-variant hover:text-white hover:bg-surface-bright transition-colors text-xs font-mono"
              title="Minimize HUD"
            >
              —
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 font-mono text-[11px] uppercase tracking-wide transition-all ${
                    active
                      ? "bg-primary/20 text-primary font-semibold border border-primary/30 shadow-[0_0_10px_rgba(165,231,255,0.15)]"
                      : "text-on-surface-variant hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: l.color }}
                    />
                    <span>{l.label}</span>
                  </span>
                  {active && <span className="text-[10px] text-primary">●</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
            <Link
              href="/playground"
              className="w-full flex items-center justify-center gap-1.5 rounded border border-primary/50 bg-primary/20 py-2 text-center font-mono text-[11px] uppercase tracking-wider text-primary hover:bg-primary/30 transition-all font-bold shadow-[0_0_12px_rgba(0,210,255,0.2)]"
            >
              <span>▶</span>
              <span>Launch Sandbox</span>
            </Link>

            <button
              onClick={() => setLegendOpen(true)}
              className="w-full rounded border border-white/10 bg-surface-container py-1.5 text-center font-mono text-[10px] uppercase tracking-wider text-on-surface-variant hover:text-white hover:bg-surface-bright transition-colors"
            >
              Open Legend
            </button>
          </div>
        </aside>
      )}

      {/* Legend Modal */}
      {legendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-white/15 tech-border">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <h3 className="font-display text-lg font-bold text-primary">Architecture Legend</h3>
              <button
                onClick={() => setLegendOpen(false)}
                className="text-on-surface-variant hover:text-white font-mono text-sm px-2 py-1 bg-surface-container rounded"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 font-mono text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-primary" />
                <span>Control Plane (API/etcd)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-secondary-container" />
                <span>Worker Node (Kubelet)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-success-glow" />
                <span>Healthy Pod (Running)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-error-pulse" />
                <span>Failed Pod / Offline Node</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-desired-state" />
                <span>Desired State Target</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-data-flow" />
                <span>Data Flow / Ingress</span>
              </div>
            </div>

            <button
              onClick={() => setLegendOpen(false)}
              className="mt-2 w-full rounded bg-primary/20 border border-primary/40 py-2 font-mono text-xs font-bold text-primary uppercase hover:bg-primary/30"
            >
              Close Legend
            </button>
          </div>
        </div>
      )}
    </>
  );
}
