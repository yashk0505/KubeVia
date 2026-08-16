"use client";

import { useEffect, useState } from "react";

const layers = ["base os", "runtime", "dependencies", "app code"];

export default function LayerStack() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible((v) => (v + 1) % (layers.length + 2));
    }, 850);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-14 flex max-w-sm flex-col-reverse gap-1.5">
      {layers.map((l, i) => {
        const on = i < visible;
        return (
          <div
            key={l}
            className="flex h-10 items-center justify-between border px-4 font-mono text-[11px] uppercase tracking-wider transition-all duration-500 ease-out"
            style={{
              borderColor: on ? "#3DDC97" : "#20242A",
              backgroundColor: on ? "#3DDC9714" : "#111417",
              color: on ? "#EDEFF2" : "#4B5157",
              opacity: on ? 1 : 0.45,
              transform: on ? "translateX(0)" : "translateX(-14px)",
            }}
          >
            <span>{l}</span>
            {on && <span className="text-signal">+</span>}
          </div>
        );
      })}
    </div>
  );
}
