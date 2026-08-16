import Link from "next/link";

export default function ModuleCard({
  href,
  index,
  title,
  description,
}: {
  href: string;
  index: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group block border-t border-line py-8 transition-colors last:border-b hover:border-signal/30"
    >
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-xs text-faint">{index}</span>
          <h3 className="text-xl font-light text-ink transition-colors group-hover:text-signal">
            {title}
          </h3>
        </div>
        <span className="font-mono text-xs text-dim transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
      <p className="mt-2 max-w-md text-sm text-dim">{description}</p>
    </Link>
  );
}
