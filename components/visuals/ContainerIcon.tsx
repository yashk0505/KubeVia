export default function ContainerIcon({
  size = 20,
  color = "#3DDC97",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  const w = size * 1.4;
  const h = size;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 42 30"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="40" height="28" rx="2" stroke={color} strokeWidth="1.4" />
      {/* corrugated ridges */}
      {[7, 13, 19, 25, 31].map((x) => (
        <line
          key={x}
          x1={x}
          y1="1.5"
          x2={x}
          y2="28.5"
          stroke={color}
          strokeOpacity="0.3"
          strokeWidth="1"
        />
      ))}
      {/* door seam */}
      <line x1="34" y1="1" x2="34" y2="29" stroke={color} strokeWidth="1.4" />
      <circle cx="36.5" cy="15" r="1" fill={color} />
    </svg>
  );
}
