"use client";

import { motion } from "framer-motion";
import ModuleCard from "./ModuleCard";

type Module = {
  href: string;
  index: string;
  title: string;
  description: string;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function ModuleCardList({ modules }: { modules: Module[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="mt-12"
    >
      {modules.map((m) => (
        <motion.div key={m.href} variants={item}>
          <ModuleCard {...m} />
        </motion.div>
      ))}
    </motion.div>
  );
}
