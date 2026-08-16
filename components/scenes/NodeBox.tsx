"use client";

import { AnimatePresence } from "framer-motion";
import { useCluster } from "@/lib/simulation/store";
import PodChip from "./PodChip";
import MachineIcon from "@/components/visuals/IsoMachineIcon";
import type { NodeModel, PodModel } from "@/lib/simulation/types";

export default function NodeBox({ node, pods }: { node: NodeModel; pods: PodModel[] }) {
  const failNode = useCluster((s) => s.failNode);
  const recoverNode = useCluster((s) => s.recoverNode);
  const isFailed = node.status === "offline";
  const load = Math.min(100, pods.length * 22);
  const c = isFailed ? "#FF3D9A" : "#3DDC97";

  return (
    <div
      data-node-id={node.id}
      className="bracket-corner glass-panel relative min-h-[190px] rounded-lg p-4 transition-all duration-500"
      style={{ color: c, borderColor: `${c}35`, opacity: isFailed ? 0.6 : 1 }}
    >
      <div className="flex items-start justify-between border-b border-white/10 pb-2">
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink">
          <MachineIcon size={15} status={isFailed ? "offline" : "healthy"} />
          {node.name}
        </span>
        <button
          onClick={() => (isFailed ? recoverNode(node.id) : failNode(node.id))}
          className="flex items-center gap-1.5 rounded bg-white/5 px-2 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors hover:bg-white/10"
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}` }} />
          {isFailed ? "notready" : "ready"}
        </button>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex justify-between font-mono text-[9px] text-dim">
          <span>CPU</span><span>{isFailed ? 0 : load}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${isFailed ? 0 : load}%`, backgroundColor: c }}
          />
        </div>
        <div className="flex justify-between font-mono text-[9px] text-dim">
          <span>MEM</span><span>{isFailed ? 0 : Math.round(load * 0.6)}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-purple transition-all duration-500"
            style={{ width: `${isFailed ? 0 : load * 0.6}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex min-h-[44px] flex-wrap gap-1.5 rounded border border-dashed border-white/10 p-2">
        <AnimatePresence>
          {pods.map((p) => (
            <PodChip key={p.id} id={p.id} name={p.name} />
          ))}
        </AnimatePresence>
        {pods.length === 0 && (
          <span className="flex w-full items-center justify-center font-mono text-[9px] text-faint">
            drop pods here
          </span>
        )}
      </div>
    </div>
  );
}
