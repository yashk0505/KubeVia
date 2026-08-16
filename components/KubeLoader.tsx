"use client";

import { useState, useEffect } from "react";
import { EducationalEntry, EDUCATIONAL_TIPS, getRouteMeta } from "@/lib/tipsAndFacts";

interface KubeLoaderProps {
  mode?: "initial" | "transition" | "simulation";
  destination?: string;
  customTitle?: string;
  customSubtitle?: string;
  progress?: number;
  onComplete?: () => void;
}

export default function KubeLoader({
  mode = "transition",
  destination = "/",
  customTitle,
  customSubtitle,
  progress,
  onComplete,
}: KubeLoaderProps) {
  const meta = getRouteMeta(destination);
  const [tipIndex, setTipIndex] = useState(0);
  const [fadeTip, setFadeTip] = useState(true);

  // Initialize random tip and rotate every 3.2s
  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * EDUCATIONAL_TIPS.length));
    const interval = setInterval(() => {
      setFadeTip(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % EDUCATIONAL_TIPS.length);
        setFadeTip(true);
      }, 200);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const currentTip: EducationalEntry = EDUCATIONAL_TIPS[tipIndex] || EDUCATIONAL_TIPS[0];
  const title = customTitle || meta.title;
  const subtitle = customSubtitle || meta.subtitle;

  return (
    <div className="flex flex-col items-center justify-center text-center select-none w-full max-w-sm sm:max-w-md mx-auto animate-fadeIn">
      {/* ── Central Minimalist Geometric KubeVerse Symbol ── */}
      <div className="relative mb-5 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-16 h-16 sm:w-20 sm:h-20"
          style={{ filter: "drop-shadow(0 0 16px rgba(0, 210, 255, 0.3))" }}
        >
          {/* Subtle Outer Orbit Ring */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="rgba(0, 210, 255, 0.15)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Connection Lines (Center to 3 Satellites at 90°, 210°, 330°) */}
          <line x1="50" y1="50" x2="50" y2="20" stroke="#00d2ff" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="50" y1="50" x2="76" y2="65" stroke="#00d2ff" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="50" y1="50" x2="24" y2="65" stroke="#00d2ff" strokeWidth="1.5" strokeLinecap="round" />

          {/* Satellite Nodes */}
          <circle cx="50" cy="20" r="4.5" fill="#050608" stroke="#00d2ff" strokeWidth="1.8" />
          <circle cx="76" cy="65" r="4.5" fill="#050608" stroke="#ecb2ff" strokeWidth="1.8" />
          <circle cx="24" cy="65" r="4.5" fill="#050608" stroke="#00ffc2" strokeWidth="1.8" />

          {/* Gliding Telemetry Pulse Along Vector Lines */}
          <circle r="1.8" fill="#00ffc2">
            <animateMotion dur="1.2s" repeatCount="indefinite" path="M 50 50 L 50 20" />
          </circle>
          <circle r="1.8" fill="#00ffc2">
            <animateMotion dur="1.2s" repeatCount="indefinite" path="M 50 50 L 76 65" />
          </circle>
          <circle r="1.8" fill="#00ffc2">
            <animateMotion dur="1.2s" repeatCount="indefinite" path="M 50 50 L 24 65" />
          </circle>

          {/* Central Container Hexagon */}
          <polygon
            points="50,42 57,46 57,54 50,58 43,54 43,46"
            fill="#00d2ff"
            fillOpacity="0.25"
            stroke="#00d2ff"
            strokeWidth="1.8"
          />
          <circle cx="50" cy="50" r="2" fill="#ffffff" />
        </svg>
      </div>

      {/* ── Compact Technical Status Box ── */}
      <div className="w-full glass-panel rounded-2xl p-5 border border-white/10 tech-border space-y-4 shadow-2xl bg-[#090b10]/90 backdrop-blur-xl">
        {/* Micro-Metadata Header */}
        <div className="flex justify-between items-center text-[10px] font-mono text-on-surface-variant border-b border-white/10 pb-2.5">
          <span className="text-primary font-bold">{meta.tag}</span>
          <span className="flex items-center gap-1.5 text-success-glow font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-success-glow animate-pulse" />
            <span>SYNCING</span>
          </span>
        </div>

        {/* Destination-Aware Title & Subtitle */}
        <div className="space-y-1">
          <h2 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
            {title}
          </h2>
          <p className="font-sans text-xs text-on-surface-variant">
            {subtitle}
          </p>
        </div>

        {/* Progress Bar: Deterministic or Smooth Indeterminate Gradient */}
        <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden relative">
          {typeof progress === "number" ? (
            <div
              className="h-full bg-gradient-to-r from-cyan via-magenta to-success-glow transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          ) : (
            <div
              className="h-full w-full rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent, #00d2ff, #bd00ff, transparent)",
                backgroundSize: "200% 100%",
                animation: "laserSweep 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
              }}
            />
          )}
        </div>

        {/* ── Educational Tip / Fact Area ── */}
        <div
          className={`pt-2 transition-all duration-300 ${
            fadeTip ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
        >
          <div className="rounded-xl bg-black/50 border border-white/5 p-3 text-left space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  currentTip.category === "TIP"
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : currentTip.category === "FACT"
                    ? "bg-secondary/15 text-secondary border border-secondary/30"
                    : "bg-success-glow/15 text-success-glow border border-success-glow/30"
                }`}
              >
                {currentTip.category}
              </span>
              <span className="font-mono text-[9px] text-on-surface-variant">K8s Knowledge</span>
            </div>
            <p className="font-sans text-[11px] text-on-surface leading-relaxed">
              {currentTip.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
