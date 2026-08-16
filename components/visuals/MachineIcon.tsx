export default function MachineIcon({
  size = 20,
  status = "healthy",
}: {
  size?: number;
  status?: "healthy" | "offline";
}) {
  const color = status === "healthy" ? "#3DDC97" : "#E8544C";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="6" rx="1" stroke={color} strokeWidth="1.3" />
      <rect x="2" y="11" width="20" height="6" rx="1" stroke={color} strokeWidth="1.3" />
      <rect
        x="2"
        y="19"
        width="20"
        height="2.5"
        rx="1"
        stroke={color}
        strokeOpacity="0.5"
        strokeWidth="1.1"
      />
      <circle cx="19" cy="6" r="1" fill={color}>
        {status === "healthy" && (
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      <circle cx="19" cy="14" r="1" fill={color} />
    </svg>
  );
}
