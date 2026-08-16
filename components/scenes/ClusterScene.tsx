"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LayoutGroup } from "framer-motion";
import { useCluster, APP_COLORS } from "@/lib/simulation/store";
import type { AppType } from "@/lib/simulation/types";
import NodeBox from "./NodeBox";
import TrafficControl from "./TrafficControl";
import EventLog from "./EventLog";

if (typeof window !== "undefined") { gsap.registerPlugin(ScrollTrigger); }

const APPS: { app: AppType; label: string }[] = [
  { app: "web", label: "web" },
  { app: "api", label: "api" },
  { app: "worker", label: "worker" },
  { app: "cache", label: "cache" },
  { app: "db", label: "db" },
];

export default function ClusterScene() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const nodeRowRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  const nodes = useCluster((s) => s.nodes);
  const pods = useCluster((s) => s.pods);
  const deployApp = useCluster((s) => s.deployApp);
  const selectedApp = useCluster((s) => s.selectedApp);
  const setSelectedApp = useCluster((s) => s.setSelectedApp);
  const reset = useCluster((s) => s.reset);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const nodeEls = nodeRowRef.current ? Array.from(nodeRowRef.current.children) : [];
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "+=120%", scrub: 0.6, pin: true },
      });
      tl.from(nodeEls, { opacity: 0, y: 50, stagger: 0.2, duration: 0.6 })
        .from(controlsRef.current, { opacity: 0, y: 24, duration: 0.4 });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const activeColor = APP_COLORS[selectedApp];

  return (
    <section ref={sectionRef} className="relative flex min-h-screen items-center overflow-hidden border-t-2 border-line py-24">
      <div className="mx-auto w-full max-w-[1100px] px-8">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
          <span className="h-[5px] w-[5px] rounded-full bg-signal shadow-[0_0_8px_#3DDC97]" />
          Interactive — try it
        </div>
        <h2 className="text-balance mt-4 max-w-[560px] font-display text-4xl leading-[1.1] tracking-tight">
          This is a real, running simulation.
        </h2>
        <p className="mt-3 max-w-[460px] text-sm text-dim">
          Deploy apps, drag them between nodes, kill a node and watch Kubernetes reschedule, or raise traffic and watch it scale.
        </p>

        {/* Deployment Matrix control panel */}
        <div
          className="glass-panel bracket-corner relative mt-8 flex flex-col gap-5 overflow-hidden rounded-xl p-5 xl:flex-row xl:items-center xl:justify-between"
          style={{ color: activeColor, borderColor: `${activeColor}35` }}
        >
          <div className="scan-sweep" style={{ color: activeColor }} />
          <div className="relative z-10 flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[11px] uppercase tracking-wider text-dim">app type</span>
            {APPS.map(({ app, label }) => (
              <button
                key={app}
                onClick={() => setSelectedApp(app)}
                className="rounded border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: selectedApp === app ? APP_COLORS[app] : "#3A2E5040",
                  color: selectedApp === app ? APP_COLORS[app] : "#7A6FA0",
                  backgroundColor: selectedApp === app ? `${APP_COLORS[app]}18` : "transparent",
                  boxShadow: selectedApp === app ? `0 0 10px ${APP_COLORS[app]}40` : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4 sm:flex-row">
            <button
              onClick={() => deployApp(selectedApp)}
              className="flex items-center gap-2 rounded border-2 bg-bg px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-all hover:-translate-y-1"
              style={{ borderColor: activeColor, color: activeColor, boxShadow: `0 0 14px ${activeColor}30` }}
            >
              + Deploy <span>{selectedApp}</span>
            </button>
            <button onClick={reset} className="font-mono text-xs text-faint transition-colors hover:text-dim">
              reset cluster
            </button>
          </div>
        </div>

        <div ref={nodeRowRef} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <LayoutGroup>
            {nodes.map((node) => (
              <NodeBox key={node.id} node={node} pods={pods.filter((p) => p.nodeId === node.id)} />
            ))}
          </LayoutGroup>
        </div>

        {pods.some((p) => p.nodeId === null) && (
          <p className="mt-2 font-mono text-[11px] text-faint">
            pending: {pods.filter((p) => p.nodeId === null).map((p) => p.name).join(", ")}
          </p>
        )}

        <div ref={controlsRef} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TrafficControl />
          <EventLog />
        </div>
      </div>
    </section>
  );
}
