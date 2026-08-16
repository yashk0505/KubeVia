export default function Badge({
  children,
  color = "#3DDC97",
  rotate = -2,
}: {
  children: React.ReactNode;
  color?: string;
  rotate?: number;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1 font-mono text-[11px] uppercase tracking-wider backdrop-blur-sm"
      style={{
        borderColor: `${color}50`,
        color,
        backgroundColor: `${color}14`,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {children}
    </span>
  );
}
