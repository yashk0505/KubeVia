"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/explore", label: "Explore", color: "#00D2FF" },
  { href: "/containers", label: "Containers", color: "#FFC93D" },
  { href: "/kubernetes", label: "Kubernetes", color: "#FF3D9A" },
  { href: "/networking", label: "Networking", color: "#00FFC2" },
  { href: "/topology", label: "Topology", color: "#BD00FF" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#111318]/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40"
          : "bg-[#050608]/60 backdrop-blur-sm border-b border-white/5"
      }`}
    >
      <div className="h-0.5 w-full bg-gradient-to-r from-cyan via-magenta to-signal opacity-80" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tighter text-primary hover:opacity-90 transition-opacity"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/40 text-primary text-xs font-mono">
              KV
            </span>
            <span>
              KUBE<span className="text-secondary-container">VIA</span>
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-container border border-white/5 text-[11px] font-mono text-on-surface-variant">
            <span className="h-1.5 w-1.5 rounded-full bg-success-glow animate-pulse" />
            <span>CLUSTER: OPERATIONAL</span>
          </div>
        </div>

        {/* Desktop Links (Containers, Docker, Kubernetes, Service Map, Topology) */}
        <ul className="hidden lg:flex items-center gap-1.5">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="relative rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-200 block"
                  style={{
                    color: active ? l.color : "#bbc9cf",
                    backgroundColor: active ? `${l.color}15` : "transparent",
                    border: active ? `1px solid ${l.color}50` : "1px solid transparent",
                    boxShadow: active ? `0 0 12px ${l.color}25` : "none",
                  }}
                >
                  {l.label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-4 rounded-full"
                      style={{ backgroundColor: l.color }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Action Controls: Launch Sandbox Button & GitHub */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/yashk0505/KubeVia.git"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-surface-container px-3 py-2 font-mono text-xs text-on-surface-variant hover:text-white hover:border-primary/40 transition-all duration-200"
            title="View on GitHub"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>

          <Link
            href="/playground"
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/15 px-4 py-2 font-mono text-xs font-bold text-primary hover:bg-primary/25 hover:border-primary transition-all duration-200 shadow-[0_0_15px_rgba(165,231,255,0.25)] hover:shadow-[0_0_25px_rgba(0,210,255,0.4)]"
          >
            <span>▶</span>
            <span>Launch Sandbox</span>
          </Link>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex p-2 text-on-surface-variant hover:text-white rounded-lg bg-surface-container border border-white/10"
            aria-label="Toggle Navigation"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#111318]/95 backdrop-blur-xl px-6 py-4 space-y-2">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-lg px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider"
                style={{
                  color: active ? l.color : "#bbc9cf",
                  backgroundColor: active ? `${l.color}15` : "transparent",
                  border: active ? `1px solid ${l.color}40` : "1px solid transparent",
                }}
              >
                <span>{l.label}</span>
                {active && <span className="text-[10px]">● CURRENT</span>}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-white/10">
            <Link
              href="/playground"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary/20 border border-primary/50 py-2.5 font-mono text-xs font-bold text-primary uppercase"
            >
              <span>▶</span>
              <span>Launch Sandbox</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
