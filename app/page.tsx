"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [traffic, setTraffic] = useState(140);
  const [podStatus, setPodStatus] = useState<"running" | "failed">("running");
  const [replicas, setReplicas] = useState(3);

  const handleSimulatePodFailure = () => {
    if (podStatus === "failed") return;
    setPodStatus("failed");
    setTimeout(() => {
      setPodStatus("running");
    }, 2200);
  };

  const modules = [
    {
      num: "01",
      title: "Explore Journey",
      href: "/explore",
      desc: "12-Scene sequential cinematic odyssey from bare-metal origins to self-healing clusters.",
      color: "border-primary/40 text-primary hover:border-primary",
      glow: "hover:shadow-[0_0_25px_rgba(0,210,255,0.2)]",
      badge: "12 SCENES",
      icon: "🧭",
    },
    {
      num: "02",
      title: "Linux Containers",
      href: "/containers",
      desc: "Anatomy of isolation: Namespaces, cgroups v2 limits, multi-stage layer builds & OOM killer.",
      color: "border-cyan/40 text-cyan hover:border-cyan",
      glow: "hover:shadow-[0_0_25px_rgba(0,210,255,0.2)]",
      badge: "6 LABS",
      icon: "📦",
    },
    {
      num: "03",
      title: "Kubernetes Engine",
      href: "/kubernetes",
      desc: "Pod design patterns, Workload Controllers, zero-downtime rolling updates & HPA autoscaling.",
      color: "border-magenta/40 text-magenta hover:border-magenta",
      glow: "hover:shadow-[0_0_25px_rgba(255,61,154,0.2)]",
      badge: "8 SUBMODULES",
      icon: "⚙️",
    },
    {
      num: "04",
      title: "Networking & CNI",
      href: "/networking",
      desc: "Live Packet Journey simulator: Browser ➔ Ingress ➔ Service VIP ➔ Dataplane ➔ Target Pod.",
      color: "border-success-glow/40 text-success-glow hover:border-success-glow",
      glow: "hover:shadow-[0_0_25px_rgba(0,255,194,0.2)]",
      badge: "PACKET ROUTER",
      icon: "🌐",
    },
    {
      num: "05",
      title: "Cluster Topology",
      href: "/topology",
      desc: "Control Plane orchestration, etcd Raft state store, taints & tolerations, Cordon & Drain.",
      color: "border-desired-state/40 text-desired-state hover:border-desired-state",
      glow: "hover:shadow-[0_0_25px_rgba(189,0,255,0.2)]",
      badge: "FLEET CANVAS",
      icon: "◈",
    },
    {
      num: "06",
      title: "Sandbox Matrix",
      href: "/playground",
      desc: "Free-form cluster sandbox with live YAML manifest editor & 5 guided challenge missions.",
      color: "border-amber-400/40 text-amber-400 hover:border-amber-400",
      glow: "hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]",
      badge: "5 MISSIONS",
      icon: "🕹️",
    },
  ];

  return (
    <main className="relative min-h-screen bg-[#050608] text-[#e2e2e8] overflow-x-hidden flex flex-col font-sans">
      <Nav />

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-6 pt-28 pb-16 text-center">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 font-mono text-xs text-primary shadow-[0_0_20px_rgba(0,210,255,0.2)]">
            <span className="h-2 w-2 rounded-full bg-success-glow animate-pulse" />
            <span>KUBEVERSE // MOTION-FIRST VISUAL LABORATORY</span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-extrabold uppercase tracking-tight text-white drop-shadow-[0_0_35px_rgba(0,210,255,0.3)]">
            KUBE<span className="text-primary">VERSE</span>
          </h1>

          <p className="mx-auto max-w-2xl font-sans text-lg sm:text-xl text-on-surface-variant leading-relaxed">
            Understand what actually happens behind your cloud native applications.
            Watch containers assemble, pods schedule, nodes heal, packets route, and clusters orchestrate in real-time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/explore"
              className="glass-panel group flex items-center gap-2 rounded-full border-2 border-primary/60 px-8 py-3.5 font-mono text-xs font-bold uppercase text-primary hover:bg-primary/20 hover:border-primary transition-all duration-300 shadow-[0_0_25px_rgba(0,210,255,0.25)]"
            >
              <span>Explore Interactive Journey</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              href="/playground"
              className="rounded-full bg-surface-container border border-white/10 px-8 py-3.5 font-mono text-xs font-bold uppercase text-on-surface hover:bg-surface-bright hover:border-primary/40 transition-all duration-200"
            >
              Launch Sandbox Matrix →
            </Link>
          </div>
        </div>

        {/* 6-Module Curriculum Grid */}
        <div className="mt-20 w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
          {modules.map((m) => (
            <Link
              key={m.num}
              href={m.href}
              className={`glass-panel rounded-2xl p-6 border ${m.color} ${m.glow} transition-all group module-nav-card flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-xs font-bold">MODULE {m.num}</span>
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-black/40 border border-white/10 text-white font-bold">
                    {m.badge}
                  </span>
                </div>
                <div className="text-2xl mb-2">{m.icon}</div>
                <h3 className="font-display text-lg font-bold text-white group-hover:text-primary transition-colors">
                  {m.title}
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-2 leading-relaxed">
                  {m.desc}
                </p>
              </div>

              <div className="mt-5 font-mono text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-3 border-t border-white/5">
                <span>Launch Module</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Showcase 1: Self-Healing Pod Telemetry & Autoscaling */}
      <section className="relative z-10 py-24 px-6 border-t border-white/5 bg-[#090b10]/60">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/30 rounded-full font-mono text-xs text-primary">
              INTERACTIVE LABORATORY TEASER
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Declarative Reconciliation &amp; Autoscaling
            </h2>
            <p className="font-sans text-sm text-on-surface-variant">
              Experience the control loop in action. Modify incoming traffic or kill pods to see Kubernetes self-heal instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Live Pod Card */}
            <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-white/10 tech-border">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                <span className="font-mono text-xs text-white">pod/web-frontend-7f9b8c</span>
                <span
                  className={`font-mono text-xs font-bold flex items-center gap-1.5 ${
                    podStatus === "running" ? "text-success-glow" : "text-error-pulse"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      podStatus === "running" ? "bg-success-glow pulse-dot" : "bg-error-pulse error-pulse-dot"
                    }`}
                  />
                  {podStatus === "running" ? "RUNNING" : "FAILED (CrashLoop)"}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-on-surface-variant mb-1">
                    <span>CPU Usage</span>
                    <span>{podStatus === "running" ? "45m / 200m" : "0m"}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        podStatus === "running" ? "bg-primary w-[45%]" : "bg-error-pulse w-[5%]"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-on-surface-variant mb-1">
                    <span>Memory Allocation</span>
                    <span>{podStatus === "running" ? "128Mi / 256Mi" : "12Mi"}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        podStatus === "running" ? "bg-secondary w-[55%]" : "bg-error-pulse w-[10%]"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={handleSimulatePodFailure}
                  disabled={podStatus === "failed"}
                  className="w-full py-2.5 rounded-lg font-mono text-xs uppercase font-bold border border-error-pulse/60 bg-error-pulse/10 text-error-pulse hover:bg-error-pulse/20 transition-all disabled:opacity-50"
                >
                  {podStatus === "running" ? "⚡ Simulate Pod Crash" : "Self-Healing (Auto-restarting)..."}
                </button>
              </div>
            </div>

            {/* Traffic & Autoscaling Controls */}
            <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-white/10 tech-border space-y-6">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs uppercase text-primary font-bold">Traffic Scaling Simulation</span>
                <span className="font-mono text-xs text-success-glow bg-success-glow/10 px-2.5 py-1 rounded border border-success-glow/30">
                  {traffic} REQ/S
                </span>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={traffic}
                  onChange={(e) => setTraffic(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between font-mono text-[10px] text-on-surface-variant">
                  <span>1 req/s</span>
                  <span>500 req/s</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-lg bg-surface-container p-3 border border-white/5">
                  <div className="font-mono text-[10px] text-on-surface-variant">Active HPA Replicas</div>
                  <div className="font-mono text-lg font-bold text-primary mt-1">
                    {Math.min(10, Math.ceil(traffic / 50))} Pods
                  </div>
                </div>
                <div className="rounded-lg bg-surface-container p-3 border border-white/5">
                  <div className="font-mono text-[10px] text-on-surface-variant">Service Latency</div>
                  <div className="font-mono text-lg font-bold text-success-glow mt-1">
                    {(12 + traffic * 0.04).toFixed(1)} ms
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase 2: Direct Gateway Cards */}
      <section className="relative z-10 py-20 px-6 border-t border-white/5">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/networking"
            className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-success-glow/50 transition-all group module-nav-card space-y-3"
          >
            <div className="text-3xl text-success-glow">🌐</div>
            <h3 className="font-display text-lg font-bold text-white">Live Packet Journey</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Trace network packets step-by-step from Browser ➔ Ingress ➔ ClusterIP VIP ➔ Dataplane DNAT ➔ Pod container with microsecond telemetry.
            </p>
            <div className="font-mono text-xs text-success-glow font-bold pt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Launch Packet Simulator →
            </div>
          </Link>

          <Link
            href="/topology"
            className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-desired-state/50 transition-all group module-nav-card space-y-3"
          >
            <div className="text-3xl text-desired-state">◈</div>
            <h3 className="font-display text-lg font-bold text-white">Cluster Fleet Canvas</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Interact with the Master Control Plane, inspect etcd Raft state store revisions, apply hardware node taints, and trigger live Cordon &amp; Drain.
            </p>
            <div className="font-mono text-xs text-desired-state font-bold pt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Cluster Topology →
            </div>
          </Link>

          <Link
            href="/playground"
            className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-amber-400/50 transition-all group module-nav-card space-y-3"
          >
            <div className="text-3xl text-amber-400">🕹️</div>
            <h3 className="font-display text-lg font-bold text-white">Interactive Sandbox &amp; GitOps</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Edit live YAML manifests with <code className="text-white">kubectl apply -f</code> syncing, inject chaos node outages, and solve 5 guided missions.
            </p>
            <div className="font-mono text-xs text-amber-400 font-bold pt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Enter Sandbox →
            </div>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
