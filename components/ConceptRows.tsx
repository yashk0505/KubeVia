export default function ConceptRows({
  items,
  color = "#3DDC97",
}: {
  items: { term: string; desc: string }[];
  color?: string;
}) {
  return (
    <div className="mt-14 grid grid-cols-1 gap-3">
      {items.map((c) => (
        <div
          key={c.term}
          className="glass-panel group grid grid-cols-1 gap-3 rounded-lg border px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 sm:grid-cols-[160px_1fr] sm:gap-6"
          style={{ borderColor: "#2E245040" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${color}60`)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2E245040")}
        >
          <div className="font-mono text-[13px] text-ink transition-colors duration-300" style={{ color }}>
            {c.term}
          </div>
          <div className="max-w-[440px] text-sm text-dim">{c.desc}</div>
        </div>
      ))}
    </div>
  );
}
