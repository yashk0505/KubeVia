export default function Marquee({ items }: { items: string[] }) {
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden border-y-2 border-line bg-surface py-3">
      <div className="flex w-max animate-marquee gap-8 font-mono text-xs uppercase tracking-[0.2em] text-dim">
        {loop.map((it, i) => (
          <span key={i} className="flex items-center gap-8">
            {it}
            <span className="text-magenta">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
