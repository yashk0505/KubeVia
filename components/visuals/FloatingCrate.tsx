import { isoBox, polyPoints } from "@/lib/iso";

export default function FloatingCrate({
  color = "#3DDC97",
  size = 70,
  rotate = -6,
  className = "",
  style = {},
}: {
  color?: string;
  size?: number;
  rotate?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const box = isoBox(-20, -14, 0, 40, 28, 20);
  return (
    <svg
      width={size}
      height={size * 0.8}
      viewBox="-34 -32 68 60"
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ ["--rot" as string]: `${rotate}deg`, transform: `rotate(${rotate}deg)`, ...style }}
    >
      <polygon points={polyPoints(box.top)} fill={`${color}40`} stroke={color} strokeWidth="1.6" />
      <polygon points={polyPoints(box.front)} fill={`${color}26`} stroke={color} strokeWidth="1.6" />
      <polygon points={polyPoints(box.side)} fill={`${color}16`} stroke={color} strokeWidth="1.6" />
    </svg>
  );
}
