"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Badge from "./Badge";

export default function ModuleHeader({
  index,
  title,
  lead,
  color = "#3DDC97",
  num = "01",
}: {
  index: string;
  title: React.ReactNode;
  lead: string;
  color?: string;
  num?: string;
}) {
  return (
    <div className="relative pt-40">
      <span
        className="pointer-events-none absolute right-2 top-2 select-none font-mono text-[100px] font-medium leading-none opacity-[0.08] sm:text-[140px]"
        style={{ color }}
      >
        {num}
      </span>
      <Link
        href="/"
        className="font-mono text-[11px] uppercase tracking-[0.15em] text-faint transition-colors hover:text-dim"
      >
        ← All modules
      </Link>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-6"
      >
        <Badge color={color} rotate={-3}>{index}</Badge>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-balance mt-6 max-w-[600px] font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5 max-w-[480px] text-base text-dim"
      >
        {lead}
      </motion.p>
    </div>
  );
}
