"use client";

export default function NodeStatCard({
  name,
  cpu,
  mem,
  color = "#3DDC97",
  failed = false,
}: {
  name: string;
  cpu: number;
  mem: number;
  color?: string;
  failed?: boolean;
}) {
  const c = failed ? "#FF3D9A" : color;
  return (
    <div
      className="bracket-corner glass-panel relative overflow-hidden rounded-lg p-4 transition-transform hover:-translate-y-1"
      style={{ color: c, borderColor: `${c}40` }}
    >
      <div className="scan-sweep" style={{ color: c }} />
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
        <span className="font-mono text-[11px] text-ink">{name}</span>
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: c, boxShadow: `0 0 8px ${c}` }}
        />
      </div>
      <div className="space-y-2">
        <div>
          <div className="mb-1 flex justify-between font-mono text-[10px] text-dim">
            <span>CPU</span><span>{cpu}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full" style={{ width: `${cpu}%`, backgroundColor: c }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between font-mono text-[10px] text-dim">
            <span>MEM</span><span>{mem}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-purple" style={{ width: `${mem}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
