"use client";

import { motion } from "framer-motion";
import { useCluster } from "@/lib/simulation/store";
import ContainerIcon from "@/components/visuals/ContainerIcon";

export default function PodChip({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const movePod = useCluster((s) => s.movePod);
  const killPod = useCluster((s) => s.killPod);

  return (
    <motion.div
      layoutId={id}
      drag
      dragMomentum={false}
      dragElastic={0.15}
      whileDrag={{ scale: 1.08, zIndex: 20, cursor: "grabbing" }}
      onDragEnd={(event) => {
        const pointerEvent = event as PointerEvent;
        const el = document.elementFromPoint(
          pointerEvent.clientX,
          pointerEvent.clientY
        );
        const nodeEl = el?.closest("[data-node-id]");
        const nodeId = nodeEl?.getAttribute("data-node-id");
        if (nodeId) movePod(id, nodeId);
      }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative flex cursor-grab items-center gap-1.5 border border-signal/40 bg-signal/10 px-2 py-1 font-mono text-[10px] text-signal active:cursor-grabbing"
    >
      <ContainerIcon size={11} color="#3DDC97" />
      {name}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          killPod(id);
        }}
        aria-label={`kill ${name}`}
        className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-[#E8544C]"
      >
        ×
      </button>
    </motion.div>
  );
}
