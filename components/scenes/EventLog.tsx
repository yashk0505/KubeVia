"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCluster } from "@/lib/simulation/store";

function timeStr(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", { hour12: false });
}

export default function EventLog() {
  const events = useCluster((s) => s.events);

  return (
    <div className="glass-panel bracket-corner rounded-lg" style={{ color: "#3DD6FF", borderColor: "#3DD6FF35" }}>
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink">event log</span>
        <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
      </div>
      <div className="flex min-h-[110px] flex-col gap-1 p-4 font-mono text-[11px] leading-5">
        <AnimatePresence initial={false}>
          {events.length === 0 && (
            <p className="text-faint">[system] awaiting deployment instructions…</p>
          )}
          {events.map((e) => (
            <motion.p
              key={e.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-dim"
            >
              <span className="text-faint">[{timeStr(e.ts)}]</span> {e.message}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
