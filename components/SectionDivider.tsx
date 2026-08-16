export default function SectionDivider({ color = "#3DDC97" }: { color?: string }) {
  return (
    <div className="relative h-6 overflow-hidden border-y-2 border-line" style={{ backgroundColor: `${color}12` }}>
      <div
        className="absolute -left-4 -right-4 top-1/2 h-3 -translate-y-1/2 -skew-y-1"
        style={{ backgroundColor: `${color}22` }}
      />
    </div>
  );
}
