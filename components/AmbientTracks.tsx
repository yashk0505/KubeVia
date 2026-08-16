"use client";

const tracks = [
  { label: "pod/web-7f8", y: 20, dur: "3.2s", begin: "0s" },
  { label: "pod/api-3ac", y: 60, dur: "4.1s", begin: "0.6s" },
  { label: "pod/cache-e1", y: 100, dur: "3.6s", begin: "1.1s" },
];

export default function AmbientTracks() {
  return (
    <div className="mt-14">
      <svg
        viewBox="0 0 780 130"
        fill="none"
        className="h-auto w-full overflow-visible"
        aria-hidden="true"
      >
        {tracks.map((t) => (
          <line
            key={t.label}
            x1="0"
            y1={t.y}
            x2="780"
            y2={t.y}
            stroke="#20242A"
            strokeWidth="1"
          />
        ))}
        {tracks.map((t) => (
          <circle key={t.label + "-dot"} r="3" fill="#3DDC97">
            <animateMotion
              dur={t.dur}
              begin={t.begin}
              repeatCount="indefinite"
              path={`M0,${t.y} L780,${t.y}`}
            />
          </circle>
        ))}
        {tracks.map((t) => (
          <text
            key={t.label + "-label"}
            x="0"
            y={t.y - 12}
            fontFamily="var(--font-mono)"
            fontSize="10.5"
            letterSpacing="0.06em"
            fill="#83898F"
          >
            {t.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
