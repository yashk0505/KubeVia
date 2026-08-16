"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let mx = 0;
    let my = 0;
    const apply = () => {
      ref.current?.style.setProperty("--mx", `${mx}px`);
      ref.current?.style.setProperty("--my", `${my}px`);
      raf = 0;
    };
    const handler = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handler);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          "radial-gradient(600px circle at var(--mx, 50%) var(--my, 20%), #3DDC9710, transparent 70%)",
      }}
    />
  );
}
