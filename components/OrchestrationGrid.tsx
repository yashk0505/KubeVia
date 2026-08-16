"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import MachineIcon from "./visuals/IsoMachineIcon";
import ContainerIcon from "./visuals/ContainerIcon";

const NODES = ["node-a", "node-b", "node-c"];
const NODE_LEFT = ["16.6%", "50%", "83.3%"];

type Assign = Record<string, string | null>;
type Step = { assign: Assign; failed?: string; caption: string };

const steps: Step[] = [
  {
    assign: { "web-1": null, "api-1": null, "cache-1": null },
    caption: "Three pods waiting to be scheduled.",
  },
  {
    assign: { "web-1": "node-a", "api-1": null, "cache-1": null },
    caption: "Scheduler places web-1 on node-a.",
  },
  {
    assign: { "web-1": "node-a", "api-1": "node-b", "cache-1": null },
    caption: "api-1 goes to node-b.",
  },
  {
    assign: { "web-1": "node-a", "api-1": "node-b", "cache-1": "node-c" },
    caption: "cache-1 goes to node-c — cluster fully scheduled.",
  },
  {
    assign: {
      "web-1": "node-a",
      "web-2": "node-a",
      "api-1": "node-b",
      "cache-1": "node-c",
    },
    caption: "Traffic rises — Kubernetes scales web to 2 replicas.",
  },
  {
    assign: {
      "web-1": "node-a",
      "web-2": "node-a",
      "api-1": "node-b",
      "api-2": "node-c",
      "cache-1": "node-c",
    },
    caption: "api scales too — a second replica lands on node-c.",
  },
  {
    assign: {
      "web-1": "node-a",
      "web-2": "node-a",
      "api-1": "node-b",
      "api-2": "node-c",
      "cache-1": "node-c",
    },
    failed: "node-b",
    caption: "node-b goes offline.",
  },
  {
    assign: {
      "web-1": "node-a",
      "web-2": "node-a",
      "api-1": "node-c",
      "api-2": "node-c",
      "cache-1": "node-c",
    },
    failed: "node-b",
    caption: "api-1 is rescheduled onto node-c automatically.",
  },
  {
    assign: {
      "web-1": "node-a",
      "web-2": "node-a",
      "api-1": "node-c",
      "api-2": "node-c",
      "cache-1": "node-c",
    },
    caption: "node-b recovers and rejoins the cluster.",
  },
  {
    assign: {
      "web-1": "node-a",
      "api-1": "node-c",
      "api-2": "node-c",
      "cache-1": "node-c",
    },
    caption: "Traffic settles — web scales back down to 1 replica.",
  },
];

const STEP_MS = 2000;

function useTrafficDots(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: NODE_LEFT[i % NODE_LEFT.length],
        delay: (i * 0.7) % 2.4,
        dur: 1.6 + (i % 3) * 0.3,
      })),
    [count]
  );
}

export default function OrchestrationGrid() {
  const [i, setI] = useState(0);
  const dots = useTrafficDots(6);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % steps.length), STEP_MS);
    return () => clearInterval(id);
  }, []);

  const step = steps[i];

  return (
    <div className="mt-14">
      {/* service bar */}
      <div className="border border-line bg-surface/40 py-2 text-center font-mono text-[11px] uppercase tracking-wider text-dim">
        service
      </div>

      {/* live traffic falling from the service into whichever nodes are healthy */}
      <div className="relative h-16">
        {dots.map((d) => (
          <span
            key={d.id}
            className="absolute h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-signal"
            style={{
              left: d.left,
              animation: `traffic-fall ${d.dur}s linear ${d.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <LayoutGroup>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {NODES.map((node) => {
            const isFailed = step.failed === node;
            const pods = Object.entries(step.assign).filter(
              ([, n]) => n === node
            );
            return (
              <div
                key={node}
                className={`relative min-h-[136px] border p-4 transition-colors duration-500 ${
                  isFailed
                    ? "border-[#E8544C]/40 bg-[#E8544C]/[0.05]"
                    : "border-line bg-surface/40"
                }`}
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, transparent, transparent 7px, #ffffff05 7px, #ffffff05 8px)",
                }}
              >
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider">
                  <span
                    className={`flex items-center gap-2 ${
                      isFailed ? "text-[#E8544C]/80" : "text-dim"
                    }`}
                  >
                    <MachineIcon size={15} status={isFailed ? "offline" : "healthy"} />
                    {node}
                  </span>
                  {isFailed && (
                    <span className="text-[#E8544C]/80">offline</span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <AnimatePresence>
                    {pods.map(([pod]) => (
                      <motion.div
                        key={pod}
                        layoutId={pod}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                        className="flex items-center gap-1.5 border border-signal/40 bg-signal/10 px-2 py-1 font-mono text-[10px] text-signal"
                      >
                        <ContainerIcon size={11} color="#3DDC97" />
                        {pod}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </LayoutGroup>

      <div className="mt-5 flex items-center gap-2 font-mono text-[11px] text-faint">
        <span className="h-1.5 w-1.5 animate-pulse2 rounded-full bg-signal" />
        {step.caption}
      </div>
    </div>
  );
}
