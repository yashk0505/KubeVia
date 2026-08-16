"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AmbientTracks from "./AmbientTracks";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const word = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <section
      id="top"
      ref={ref}
      className="flex min-h-screen items-center pt-24"
    >
      <motion.div
        style={{ opacity, scale, y }}
        className="mx-auto max-w-[860px] px-8"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-faint"
        >
          <span className="h-[5px] w-[5px] animate-pulse2 rounded-full bg-signal shadow-[0_0_8px_#3DDC97]" />
          Interactive Kubernetes learning
        </motion.div>

        {/* project name — the primary heading */}
        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-6 text-[64px] font-medium leading-[1.05] tracking-tight md:text-[72px]"
        >
          <motion.span variants={word} className="inline-block text-ink">
            Kube
          </motion.span>
          <motion.span variants={word} className="inline-block text-signal">
            Verse
          </motion.span>
        </motion.h1>

        {/* tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance mt-4 max-w-[480px] text-2xl font-light leading-snug text-dim"
        >
          Watch Kubernetes run, not just explained.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 max-w-[460px] text-base text-dim"
        >
          Every process on this page is actually animating — packages
          building, pods scheduling, traffic flowing. Nothing here is a
          static diagram.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="mt-11 flex items-center gap-5"
        >
          <a
            href="#about"
            className="group flex items-center gap-2.5 border border-line px-[22px] py-3 font-mono text-xs text-ink transition-colors hover:border-signal hover:text-signal"
          >
            Begin
            <span className="transition-transform group-hover:translate-x-[3px]">
              →
            </span>
          </a>
          <span className="font-mono text-[11px] text-faint">
            03 MODULES · ~10 MIN
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <AmbientTracks />
          <div className="mt-5 flex items-center gap-2 font-mono text-[11px] text-faint">
            <span className="h-1.5 w-1.5 animate-pulse2 rounded-full bg-signal" />
            3 processes running
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
