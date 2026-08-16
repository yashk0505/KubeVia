"use client";

import { useEffect, useRef, useState } from "react";

export default function LazyMount({
  children,
  minHeight = 280,
}: {
  children: React.ReactNode;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={!visible ? { minHeight } : undefined}>
      {visible ? children : null}
    </div>
  );
}
