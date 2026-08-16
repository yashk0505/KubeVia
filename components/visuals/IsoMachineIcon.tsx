import { isoBox, polyPoints } from "@/lib/iso";

export default function IsoMachineIcon({
  size = 28,
  status = "healthy",
}: {
  size?: number;
  status?: "healthy" | "offline";
}) {
  const color = status === "healthy" ? "#3DDC97" : "#E8544C";
  const box = isoBox(-14, -6, 0, 28, 12, 7);

  return (
    <svg
      width={size}
      height={size * 0.77}
      viewBox="-22 -21 44 34"
      fill="none"
      aria-hidden="true"
    >
      <polygon points={polyPoints(box.top)} fill={`${color}36`} stroke={color} strokeWidth="1.2" />
      <polygon points={polyPoints(box.front)} fill={`${color}20`} stroke={color} strokeWidth="1.2" />
      <polygon points={polyPoints(box.side)} fill={`${color}12`} stroke={color} strokeWidth="1.2" />
    </svg>
  );
}
