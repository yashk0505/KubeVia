"use client";

import { useEffect, useId, useState } from "react";

type Stage = { label: string };

export default function ProcessDiagram({
  stages,
  duration = 3000,
  bounce = false,
}: {
  stages: Stage[];
  /** total ms for one full pass across all stages */
  duration?: number;
  /** if true, the signal travels forward then back (for request/response flows) */
  bounce?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const width = 780;
  const y = 30;
  const margin = 40;

  const positions = stages.map((_, i) =>
    stages.length === 1
      ? width / 2
      : margin + (i * (width - margin * 2)) / (stages.length - 1)
  );

  const forwardCycle = positions.map((_, i) => i);
  const cycle = bounce
    ? [...forwardCycle, ...[...forwardCycle].reverse().slice(1, -1)]
    : forwardCycle;

  const [active, setActive] = useState(0);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % cycle.length;
      setActive(cycle[i]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, duration / cycle.length);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, cycle.length]);

  const first = positions[0];
  const last = positions[positions.length - 1];
  const pathD = bounce ? `M${first},${y} L${last},${y} L${first},${y}` : `M${first},${y} L${last},${y}`;
  const dotDur = bounce ? (duration * 2) / 1000 : duration / 1000;

  return (
    <div className="mt-14">
      <svg
        viewBox={`0 0 ${width} 90`}
        fill="none"
        className="h-auto w-full overflow-visible"
        aria-hidden="true"
      >
        <line
          x1={first}
          y1={y}
          x2={last}
          y2={y}
          stroke="#20242A"
          strokeWidth="1.5"
        />

        {positions.map((cx, i) => (
          <circle
            key={i}
            cx={cx}
            cy={y}
            r="16"
            fill={active === i ? "#3DDC9722" : "#111417"}
            stroke={active === i ? "#3DDC97" : "#20242A"}
            strokeWidth="1.5"
            style={{ transition: "stroke .3s ease, fill .3s ease" }}
          />
        ))}

        <circle r="4" fill="#3DDC97" filter={`url(#glow-${uid})`}>
          <animateMotion
            dur={`${dotDur}s`}
            repeatCount="indefinite"
            path={pathD}
            calcMode="linear"
          />
        </circle>

        <defs>
          <filter
            id={`glow-${uid}`}
            x="-200%"
            y="-200%"
            width="500%"
            height="500%"
          >
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {positions.map((cx, i) => (
          <text
            key={i}
            x={cx}
            y="65"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="10.5"
            letterSpacing="0.06em"
            style={{ textTransform: "uppercase", transition: "fill .3s ease" }}
            fill={active === i ? "#EDEFF2" : "#83898F"}
          >
            {stages[i].label}
          </text>
        ))}
      </svg>
    </div>
  );
}
