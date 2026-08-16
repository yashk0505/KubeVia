"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

interface Scene {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
}

const scenes: Scene[] = [
  { id: 1, title: "Your Application", subtitle: "Where every digital experience begins", tag: "SCENE 01 // ORIGIN" },
  { id: 2, title: "Containers", subtitle: "Isolating code and dependencies with Linux primitives", tag: "SCENE 02 // PACKAGING" },
  { id: 3, title: "The Scaling Crisis", subtitle: "Why manual container operations fail under traffic", tag: "SCENE 03 // SURGE" },
  { id: 4, title: "Kubernetes Enters", subtitle: "The automated cluster orchestrator takes command", tag: "SCENE 04 // THE BRAIN" },
  { id: 5, title: "The Pod (Atomic Unit)", subtitle: "The fundamental schedulable building block", tag: "SCENE 05 // ATOM" },
  { id: 6, title: "Worker Nodes", subtitle: "The compute fleet executing your workloads", tag: "SCENE 06 // FLEET" },
  { id: 7, title: "The Cluster", subtitle: "Control plane + worker nodes unified as one supercomputer", tag: "SCENE 07 // MATRIX" },
  { id: 8, title: "The Scheduler", subtitle: "Intelligent resource allocation & placement engine", tag: "SCENE 08 // PLACEMENT" },
  { id: 9, title: "Traffic & Services", subtitle: "Stable networking over ephemeral IP addresses", tag: "SCENE 09 // DATA FLOW" },
  { id: 10, title: "Self-Healing & Failure", subtitle: "Declarative reconciliation repairing crashes in real-time", tag: "SCENE 10 // RESILIENCE" },
  { id: 11, title: "The Complete Journey", subtitle: "The unified mental model from code to Kubernetes", tag: "SCENE 11 // SYNTHESIS" },
  { id: 12, title: "Continue Your Mastery", subtitle: "Choose your next interactive deep dive", tag: "SCENE 12 // NEXT" },
];

export default function ExplorePage() {
  const [currentScene, setCurrentScene] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false);

  // Scene 2 state: Container lifecycle
  const [containerState, setContainerState] = useState<"stopped" | "starting" | "running">("running");

  // Scene 3 state: Scaling users slider
  const [trafficUsers, setTrafficUsers] = useState(250);

  // Scene 5 state: Pod sidecar toggle
  const [hasSidecar, setHasSidecar] = useState(false);

  // Scene 6 state: Worker nodes fleet
  const [workerPods, setWorkerPods] = useState<{ alpha: number; beta: number; gamma: number }>({
    alpha: 2,
    beta: 3,
    gamma: 4,
  });

  // Scene 7 state: Control plane component inspector
  const [selectedCpComp, setSelectedCpComp] = useState<"api" | "etcd" | "sched" | "ctrl">("api");

  // Scene 8 state: Scheduler simulation
  const [scheduledNode, setScheduledNode] = useState<string | null>("node-1");

  // Scene 9 state: Interactive packet routing
  const [scene9Routing, setScene9Routing] = useState(false);
  const [scene9ActivePod, setScene9ActivePod] = useState<number>(1);

  // Scene 10 state: Self-healing pod simulation
  const [podStatus, setPodStatus] = useState<"healthy" | "crashed" | "healing">("healthy");

  // Autoplay timer
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev < scenes.length ? prev + 1 : 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const handleCrashSimulation = () => {
    if (podStatus !== "healthy") return;
    setPodStatus("crashed");
    setTimeout(() => {
      setPodStatus("healing");
      setTimeout(() => {
        setPodStatus("healthy");
      }, 1500);
    }, 1200);
  };

  const nextScene = () => setCurrentScene((p) => Math.min(scenes.length, p + 1));
  const prevScene = () => setCurrentScene((p) => Math.max(1, p - 1));

  return (
    <main className="min-h-screen bg-[#050608] text-[#e2e2e8] overflow-x-hidden flex flex-col font-sans">
      <Nav />

      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto w-full flex-1 space-y-6">
        {/* ── Journey Control Strip ── */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 tech-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/40 text-primary font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,210,255,0.3)]">
              {currentScene.toString().padStart(2, "0")}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span>{scenes[currentScene - 1].tag}</span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
                {scenes[currentScene - 1].title}
              </h1>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-xs transition-all ${
                autoPlay
                  ? "bg-success-glow/20 border-success-glow/50 text-success-glow font-bold shadow-[0_0_12px_rgba(0,255,194,0.3)]"
                  : "bg-surface-container border-white/10 text-on-surface-variant hover:text-white"
              }`}
            >
              {autoPlay ? "⏸ Auto-Playing" : "▶ Auto-Play"}
            </button>

            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-white/10">
              <button
                onClick={prevScene}
                disabled={currentScene === 1}
                className="px-3 py-1.5 rounded font-mono text-xs text-on-surface-variant hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="px-2 font-mono text-xs text-primary font-bold">
                {currentScene} / {scenes.length}
              </span>
              <button
                onClick={nextScene}
                disabled={currentScene === scenes.length}
                className="px-3 py-1.5 rounded bg-primary/20 border border-primary/40 font-mono text-xs font-bold text-primary hover:bg-primary/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* ── Scene Timeline Progress Bar ── */}
        <div className="grid grid-cols-12 gap-1.5">
          {scenes.map((s) => (
            <button
              key={s.id}
              onClick={() => setCurrentScene(s.id)}
              className={`h-2 rounded-full transition-all duration-300 ${
                s.id === currentScene
                  ? "bg-primary shadow-[0_0_10px_#00d2ff]"
                  : s.id < currentScene
                  ? "bg-primary/40"
                  : "bg-surface-container"
              }`}
              title={`${s.tag}: ${s.title}`}
            />
          ))}
        </div>

        {/* ── Dynamic Scene Canvas ── */}
        <div className="glass-panel rounded-2xl border border-white/10 tech-border min-h-[500px] p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between">
          <div className="scan-line" />

          {/* ══════════ SCENE 01: Application ══════════ */}
          {currentScene === 1 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="max-w-2xl space-y-2">
                <span className="font-mono text-xs text-primary font-bold uppercase">The Genesis</span>
                <h2 className="font-display text-3xl font-bold text-white">Your Web Application</h2>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Every cloud system starts as source code written by engineers. On a developer&apos;s laptop, it runs directly on top of the host operating system with specific runtime versions, packages, and system files.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
                <div className="rounded-xl bg-black/60 border border-white/10 p-5 font-mono text-xs space-y-2 shadow-inner">
                  <div className="text-secondary font-bold border-b border-white/10 pb-2 flex justify-between">
                    <span>server.js (Node.js App)</span>
                    <span className="text-success-glow">PORT: 3000</span>
                  </div>
                  <pre className="text-on-surface-variant overflow-x-auto text-[11px] leading-relaxed">
                    <span className="text-primary">const</span> express = require(&apos;express&apos;);{"\n"}
                    <span className="text-primary">const</span> app = express();{"\n\n"}
                    app.get(&apos;/api/v1/checkout&apos;, (req, res) =&gt; &#123;{"\n"}
                    &nbsp;&nbsp;res.json(&#123; status: &apos;success&apos;, timestamp: Date.now() &#125;);{"\n"}
                    &#125;);{"\n\n"}
                    app.listen(3000, () =&gt; console.log(&apos;Server online&apos;));
                  </pre>
                </div>

                <div className="space-y-4">
                  <div className="glass-panel p-5 rounded-xl border border-amber-500/30 space-y-2">
                    <div className="font-mono text-xs text-amber-400 font-bold flex items-center gap-2">
                      <span>⚠️</span>
                      <span>The Classic Dilemma: &quot;It works on my machine&quot;</span>
                    </div>
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                      Deploying this raw application to production servers often causes failures because of mismatched Node.js versions, missing environment variables, or conflicting global dependencies.
                    </p>
                  </div>

                  <button
                    onClick={nextScene}
                    className="w-full py-3 rounded-xl bg-primary/20 border border-primary/50 text-primary font-mono text-xs font-bold uppercase hover:bg-primary/30 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,210,255,0.2)]"
                  >
                    <span>Step 2: Package Into Container</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ SCENE 02: Containers ══════════ */}
          {currentScene === 2 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="max-w-2xl space-y-2">
                <span className="font-mono text-xs text-primary font-bold uppercase">Isolation Primitive</span>
                <h2 className="font-display text-3xl font-bold text-white">The Container Solution</h2>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  We package the application code + runtime dependencies into an immutable container image. Using Linux Namespaces and cgroups, it runs as an isolated process that behaves identically on every machine.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
                <div className="md:col-span-6 space-y-4">
                  <div className="flex gap-2 font-mono text-xs">
                    <button
                      onClick={() => setContainerState("running")}
                      className={`flex-1 py-2 rounded-lg border font-bold ${
                        containerState === "running"
                          ? "bg-success-glow/20 border-success-glow text-success-glow shadow-[0_0_12px_rgba(0,255,194,0.3)]"
                          : "bg-surface-container border-white/10 text-on-surface-variant hover:text-white"
                      }`}
                    >
                      ▶ Start Container
                    </button>
                    <button
                      onClick={() => setContainerState("stopped")}
                      className={`flex-1 py-2 rounded-lg border font-bold ${
                        containerState === "stopped"
                          ? "bg-error-pulse/20 border-error-pulse text-error-pulse shadow-[0_0_12px_rgba(255,0,92,0.3)]"
                          : "bg-surface-container border-white/10 text-on-surface-variant hover:text-white"
                      }`}
                    >
                      ⏹ Stop Container
                    </button>
                  </div>

                  <div className="rounded-xl bg-black/50 border border-white/10 p-4 font-mono text-xs space-y-2">
                    <div className="text-primary font-bold">Container Metadata</div>
                    <div className="text-[11px] text-on-surface-variant space-y-1">
                      <div>Image: <span className="text-white">my-app:v1.0 (Alpine 3.18)</span></div>
                      <div>PID Namespace: <span className="text-secondary">Isolated Process PID 1</span></div>
                      <div>CGROUP Memory Limit: <span className="text-cyan">256MB</span></div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-6 flex justify-center">
                  <div className={`relative w-64 h-64 rounded-2xl border-2 flex flex-col items-center justify-center p-6 transition-all duration-500 ${
                    containerState === "running"
                      ? "border-success-glow bg-success-glow/5 shadow-[0_0_30px_rgba(0,255,194,0.25)]"
                      : "border-white/20 bg-surface-container opacity-50"
                  }`}>
                    <div className="text-4xl mb-2">{containerState === "running" ? "📦" : "💤"}</div>
                    <div className="font-mono text-sm font-bold text-white">app-container-1</div>
                    <div className="font-mono text-xs mt-1 text-on-surface-variant">
                      Status: <span className={containerState === "running" ? "text-success-glow font-bold" : "text-error-pulse"}>{containerState.toUpperCase()}</span>
                    </div>
                    {containerState === "running" && (
                      <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-success-glow">
                        <span className="h-2 w-2 rounded-full bg-success-glow animate-ping" />
                        <span>Port 3000 Bound</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ SCENE 03: The Scaling Crisis ══════════ */}
          {currentScene === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="max-w-2xl space-y-2">
                <span className="font-mono text-xs text-error-pulse font-bold uppercase">The Real-World Reality</span>
                <h2 className="font-display text-3xl font-bold text-white">The Scaling Challenge</h2>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  One container was easy. But real apps face unpredictable traffic spikes. When thousands of users arrive, a single container crashes from CPU exhaustion. You need multiple instances across multiple servers.
                </p>
              </div>

              <div className="space-y-6 pt-2">
                <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-3">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-on-surface-variant">Incoming User Traffic</span>
                    <span className="text-primary font-bold">{trafficUsers} Active Users</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    value={trafficUsers}
                    onChange={(e) => setTrafficUsers(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {Array.from({ length: Math.min(12, Math.ceil(trafficUsers / 80)) }).map((_, idx) => (
                    <div
                      key={idx}
                      className="glass-panel p-3 rounded-xl border border-primary/30 text-center font-mono text-xs animate-scaleIn"
                    >
                      <div className="text-xl mb-1">📦</div>
                      <div className="text-[10px] text-white font-bold truncate">container-{idx + 1}</div>
                      <div className="text-[9px] text-success-glow mt-0.5">{(trafficUsers / (idx + 1) * 0.1).toFixed(0)} req/s</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 font-mono text-xs text-amber-400">
                  ⚠️ <strong>Manual Overhead:</strong> Who restarts containers when they crash? Who balances user traffic across them? Who deploys new versions without downtime?
                </div>
              </div>
            </div>
          )}

          {/* ══════════ SCENE 04: Kubernetes Enters ══════════ */}
          {currentScene === 4 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="max-w-2xl space-y-2">
                <span className="font-mono text-xs text-desired-state font-bold uppercase">The Master Solution</span>
                <h2 className="font-display text-3xl font-bold text-white">Enter Kubernetes</h2>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Kubernetes (K8s) is the open-source orchestrator that automates container deployment, scaling, healing, and network routing across fleets of machines. You declare what you want, and Kubernetes makes it happen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="glass-panel p-6 rounded-2xl border border-primary/30 space-y-2">
                  <div className="text-3xl mb-2">🧠</div>
                  <h3 className="font-display text-lg font-bold text-primary">Automated Scheduling</h3>
                  <p className="font-sans text-xs text-on-surface-variant">
                    Watches your fleet and places containers onto servers with available CPU/memory automatically.
                  </p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-success-glow/30 space-y-2">
                  <div className="text-3xl mb-2">🩹</div>
                  <h3 className="font-display text-lg font-bold text-success-glow">Self-Healing</h3>
                  <p className="font-sans text-xs text-on-surface-variant">
                    Continuously replaces and restarts failed containers and reschedules them if a physical server dies.
                  </p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-desired-state/30 space-y-2">
                  <div className="text-3xl mb-2">🌐</div>
                  <h3 className="font-display text-lg font-bold text-desired-state">Traffic Management</h3>
                  <p className="font-sans text-xs text-on-surface-variant">
                    Load-balances incoming requests across all healthy instances using built-in virtual IP routing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ SCENE 05: The Pod ══════════ */}
          {currentScene === 5 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="max-w-2xl space-y-2">
                <span className="font-mono text-xs text-cyan font-bold uppercase">Atomic Building Block</span>
                <h2 className="font-display text-3xl font-bold text-white">The Pod</h2>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  In Kubernetes, you don&apos;t run containers directly. You run <strong>Pods</strong>. A Pod is a wrapper around one or more tightly coupled containers that share the exact same network IP and storage volumes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
                <div className="md:col-span-5 space-y-4">
                  <button
                    onClick={() => setHasSidecar(!hasSidecar)}
                    className="w-full py-2.5 rounded-xl border border-cyan/40 bg-cyan/10 font-mono text-xs font-bold text-cyan hover:bg-cyan/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{hasSidecar ? "− Remove Sidecar Container" : "+ Add Sidecar (Log Shipper)"}</span>
                  </button>

                  <div className="rounded-xl bg-black/50 border border-white/10 p-4 font-mono text-xs space-y-2">
                    <div className="text-primary font-bold">Pod Properties</div>
                    <div className="text-[11px] text-on-surface-variant space-y-1">
                      <div>IP Address: <span className="text-success-glow font-bold">10.244.1.42</span> (Shared)</div>
                      <div>Localhost: <span className="text-white">Containers talk via 127.0.0.1</span></div>
                      <div>Storage: <span className="text-secondary">Shared volume mount</span></div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-7 flex justify-center">
                  <div className="w-full max-w-md rounded-2xl border-2 border-dashed border-cyan/60 bg-cyan/5 p-6 space-y-4 shadow-[0_0_30px_rgba(0,210,255,0.15)]">
                    <div className="flex justify-between items-center font-mono text-xs border-b border-cyan/20 pb-2">
                      <span className="font-bold text-cyan">POD: web-frontend-7f9b8c</span>
                      <span className="text-success-glow">IP: 10.244.1.42</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-surface-container border border-white/10 p-3 text-center font-mono text-xs">
                        <div className="text-2xl mb-1">📦</div>
                        <div className="font-bold text-white">Main App</div>
                        <div className="text-[10px] text-on-surface-variant mt-0.5">Node.js Server</div>
                      </div>

                      {hasSidecar ? (
                        <div className="rounded-xl bg-desired-state/20 border border-desired-state/50 p-3 text-center font-mono text-xs animate-scaleIn">
                          <div className="text-2xl mb-1">🛰️</div>
                          <div className="font-bold text-desired-state">Sidecar</div>
                          <div className="text-[10px] text-on-surface-variant mt-0.5">Fluentbit Logger</div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/10 p-3 flex items-center justify-center text-center font-mono text-[10px] text-on-surface-variant/40">
                          Single Container Pod
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ SCENE 06: Worker Nodes ══════════ */}
          {currentScene === 6 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="max-w-2xl space-y-2">
                <span className="font-mono text-xs text-secondary font-bold uppercase">The Compute Infrastructure</span>
                <h2 className="font-display text-3xl font-bold text-white">Worker Nodes</h2>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Pods run on <strong>Worker Nodes</strong> (physical servers or cloud VMs). Each node runs three essential Kubernetes components: the <strong>Kubelet</strong> (node agent), <strong>Container Runtime</strong> (containerd), and <strong>kube-proxy</strong> (network proxy).
                </p>
              </div>

              {/* Interactive Fleet Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-on-surface-variant">Interact:</span>
                <button
                  onClick={() => setWorkerPods((p) => ({ ...p, alpha: Math.min(6, p.alpha + 1) }))}
                  className="px-3 py-1.5 rounded-lg bg-surface-container border border-white/10 hover:border-primary text-primary font-mono text-xs"
                >
                  + Pod to Alpha
                </button>
                <button
                  onClick={() => setWorkerPods((p) => ({ ...p, beta: Math.min(6, p.beta + 1) }))}
                  className="px-3 py-1.5 rounded-lg bg-surface-container border border-white/10 hover:border-secondary text-secondary font-mono text-xs"
                >
                  + Pod to Beta
                </button>
                <button
                  onClick={() => setWorkerPods((p) => ({ ...p, gamma: Math.min(6, p.gamma + 1) }))}
                  className="px-3 py-1.5 rounded-lg bg-surface-container border border-white/10 hover:border-success-glow text-success-glow font-mono text-xs"
                >
                  + Pod to Gamma
                </button>
                <button
                  onClick={() => setWorkerPods({ alpha: 2, beta: 3, gamma: 4 })}
                  className="px-3 py-1.5 rounded-lg bg-surface-container border border-white/10 text-on-surface-variant hover:text-white font-mono text-xs"
                >
                  Reset Fleet ↺
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                {[
                  { key: "alpha", name: "node-worker-alpha", pods: workerPods.alpha, color: "border-primary/40 text-primary" },
                  { key: "beta", name: "node-worker-beta", pods: workerPods.beta, color: "border-secondary/40 text-secondary" },
                  { key: "gamma", name: "node-worker-gamma", pods: workerPods.gamma, color: "border-success-glow/40 text-success-glow" },
                ].map((node) => (
                  <div key={node.key} className={`glass-panel p-5 rounded-2xl border ${node.color} space-y-3 transition-all`}>
                    <div className="flex justify-between items-center font-mono text-xs">
                      <span className="font-bold text-white">{node.name}</span>
                      <span className="text-[10px] text-success-glow">● Ready</span>
                    </div>
                    <div className="rounded bg-black/40 p-2.5 font-mono text-[10px] text-on-surface-variant space-y-0.5 border border-white/5">
                      <div className="flex justify-between">
                        <span>kubelet:</span> <span className="text-success-glow">active (Heartbeat OK)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>containerd:</span> <span className="text-white">v1.7.12</span>
                      </div>
                      <div className="flex justify-between">
                        <span>kube-proxy:</span> <span className="text-cyan">IPVS mode</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="text-[10px] font-mono text-on-surface-variant mb-1.5 flex justify-between">
                        <span>Hosted Pods:</span>
                        <span className="text-white font-bold">{node.pods} pods</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                        {Array.from({ length: node.pods }).map((_, podIdx) => (
                          <span key={podIdx} className="font-mono text-[9px] px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 animate-scaleIn">
                            pod-{podIdx + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ SCENE 07: The Cluster Matrix ══════════ */}
          {currentScene === 7 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="max-w-2xl space-y-2">
                <span className="font-mono text-xs text-desired-state font-bold uppercase">The Grand Architecture</span>
                <h2 className="font-display text-3xl font-bold text-white">The Kubernetes Cluster</h2>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  A Cluster unites the <strong>Control Plane</strong> (the brain) and the <strong>Worker Fleet</strong> (the muscle). Click any control plane component to inspect its exact responsibilities.
                </p>
              </div>

              <div className="flex flex-col items-center gap-6 pt-2">
                {/* Control Plane Box */}
                <div className="w-full max-w-3xl rounded-2xl glass-panel border border-desired-state/50 p-6 shadow-[0_0_30px_rgba(189,0,255,0.15)] space-y-4">
                  <div className="flex justify-between items-center border-b border-desired-state/20 pb-3">
                    <div className="font-mono text-xs text-desired-state font-bold uppercase">
                      Control Plane (Master Node Hub)
                    </div>
                    <span className="text-[10px] font-mono text-on-surface-variant">Click component to inspect</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                    {[
                      { id: "api", name: "kube-apiserver", role: "REST Gateway & Auth", color: "text-primary border-primary/40 bg-primary/10" },
                      { id: "etcd", name: "etcd Database", role: "Raft State Store", color: "text-desired-state border-desired-state/40 bg-desired-state/10" },
                      { id: "sched", name: "kube-scheduler", role: "Pod Placement", color: "text-secondary border-secondary/40 bg-secondary/10" },
                      { id: "ctrl", name: "kube-controller", role: "Reconciliation Loops", color: "text-tertiary border-tertiary/40 bg-tertiary/10" },
                    ].map((comp) => {
                      const isSelected = selectedCpComp === comp.id;
                      return (
                        <button
                          key={comp.id}
                          onClick={() => setSelectedCpComp(comp.id as any)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? `${comp.color} shadow-[0_0_15px_rgba(0,210,255,0.3)] font-bold scale-102`
                              : "bg-surface-container border-white/5 text-on-surface-variant hover:text-white"
                          }`}
                        >
                          <div className="font-bold text-[11px] text-white">{comp.name}</div>
                          <div className="text-[9px] mt-0.5 text-on-surface-variant">{comp.role}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Component Inspector Detail */}
                  <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-on-surface-variant">
                    {selectedCpComp === "api" && (
                      <div>
                        <strong className="text-primary">kube-apiserver:</strong> The central nervous system of Kubernetes. Every <code>kubectl</code> command, controller loop, and worker node talks exclusively to the API Server. Authenticates requests, applies admission webhooks, and writes state to etcd.
                      </div>
                    )}
                    {selectedCpComp === "etcd" && (
                      <div>
                        <strong className="text-desired-state">etcd:</strong> Consistent and highly-available key-value store using the Raft consensus algorithm. Holds the entire declarative state of the cluster (deployments, pods, secrets, ingress routes).
                      </div>
                    )}
                    {selectedCpComp === "sched" && (
                      <div>
                        <strong className="text-secondary">kube-scheduler:</strong> Continuously monitors newly created Pods with no assigned node. Filters nodes by memory/CPU and scores them based on topology spread, affinity, and taints.
                      </div>
                    )}
                    {selectedCpComp === "ctrl" && (
                      <div>
                        <strong className="text-tertiary">kube-controller-manager:</strong> Runs core daemon loops (NodeController, DeploymentController, EndpointSliceController, JobController). Continuously shifts actual state toward desired state.
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-6 w-0.5 bg-gradient-to-b from-desired-state to-primary" />

                {/* Worker Fleet Row */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">
                  {["Worker Alpha (10.0.0.11)", "Worker Beta (10.0.0.12)", "Worker Gamma (10.0.0.13)"].map((w, i) => (
                    <div key={w} className="glass-panel p-3 rounded-xl border border-primary/30 text-center font-mono text-xs">
                      <div className="font-bold text-white text-[11px]">{w}</div>
                      <div className="text-[10px] text-success-glow mt-1">● Kubelet Syncing</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ SCENE 08: The Scheduler ══════════ */}
          {currentScene === 8 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="max-w-2xl space-y-2">
                <span className="font-mono text-xs text-primary font-bold uppercase">Placement Engine</span>
                <h2 className="font-display text-3xl font-bold text-white">The Kubernetes Scheduler</h2>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  When you submit a new Pod, it enters the <strong>Pending</strong> queue. The Scheduler evaluates all nodes for CPU, memory, affinity rules, and taints, then assigns the Pod to the best node.
                </p>
              </div>

              <div className="space-y-6 pt-2">
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      const nodes = ["node-1", "node-2", "node-3"];
                      setScheduledNode(nodes[Math.floor(Math.random() * nodes.length)]);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-primary/20 border border-primary/50 text-primary font-mono text-xs font-bold hover:bg-primary/30 transition-all shadow-[0_0_15px_rgba(0,210,255,0.2)]"
                  >
                    ⚡ Submit New Pod &amp; Schedule
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { id: "node-1", name: "Worker Alpha", cpu: "20% load" },
                    { id: "node-2", name: "Worker Beta", cpu: "65% load" },
                    { id: "node-3", name: "Worker Gamma", cpu: "40% load" },
                  ].map((node) => (
                    <div
                      key={node.id}
                      className={`glass-panel p-5 rounded-2xl border transition-all duration-500 ${
                        scheduledNode === node.id
                          ? "border-primary bg-primary/15 shadow-[0_0_25px_rgba(0,210,255,0.3)] scale-105"
                          : "border-white/10 opacity-75"
                      }`}
                    >
                      <div className="flex justify-between items-center font-mono text-xs">
                        <span className="font-bold text-white">{node.name}</span>
                        <span className="text-[10px] text-primary">{node.cpu}</span>
                      </div>
                      {scheduledNode === node.id && (
                        <div className="mt-4 rounded-lg bg-primary/20 border border-primary p-2 font-mono text-xs text-primary font-bold text-center animate-scaleIn">
                          ✓ Assigned Target Node
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ SCENE 09: Traffic & Services ══════════ */}
          {currentScene === 9 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="max-w-2xl space-y-2">
                <span className="font-mono text-xs text-success-glow font-bold uppercase">Stable Abstraction</span>
                <h2 className="font-display text-3xl font-bold text-white">Services &amp; Ingress</h2>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Pods are ephemeral — they die and are replaced with new IP addresses. A <strong>Service</strong> provides a single, permanent IP address and DNS name that automatically load-balances user traffic across all healthy Pods.
                </p>
              </div>

              <div className="flex flex-col items-center gap-6 pt-2">
                {/* Trigger Button */}
                <button
                  onClick={() => {
                    if (scene9Routing) return;
                    setScene9Routing(true);
                    const target = Math.floor(Math.random() * 3) + 1;
                    setScene9ActivePod(target);
                    setTimeout(() => {
                      setScene9Routing(false);
                    }, 1400);
                  }}
                  disabled={scene9Routing}
                  className="px-6 py-2.5 rounded-xl bg-success-glow/20 border border-success-glow/50 text-success-glow font-mono text-xs font-bold uppercase hover:bg-success-glow/30 transition-all shadow-[0_0_20px_rgba(0,255,194,0.3)] disabled:opacity-50"
                >
                  {scene9Routing ? "⏳ Dispatching HTTP Request..." : "▶ Send User HTTP Request"}
                </button>

                <div className={`px-6 py-3 rounded-full border font-mono text-xs font-bold transition-all ${
                  scene9Routing
                    ? "bg-data-flow/30 border-data-flow text-white shadow-[0_0_20px_rgba(0,210,255,0.4)] scale-105"
                    : "bg-data-flow/20 border-data-flow text-data-flow"
                }`}>
                  🌐 User Ingress: https://api.mycompany.com/checkout
                </div>

                <div className={`h-6 w-0.5 transition-all ${scene9Routing ? "bg-success-glow scale-y-125" : "bg-data-flow animate-pulse"}`} />

                <div className="px-8 py-4 rounded-xl glass-panel border border-success-glow/50 text-center font-mono text-xs shadow-[0_0_25px_rgba(0,255,194,0.2)]">
                  <div className="text-success-glow font-bold">K8s Service (ClusterIP: 10.96.0.1)</div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">Round-Robin EndpointSlice Selector</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl">
                  {[
                    { id: 1, name: "Pod-1", ip: "10.244.1.5" },
                    { id: 2, name: "Pod-2", ip: "10.244.2.8" },
                    { id: 3, name: "Pod-3", ip: "10.244.3.11" },
                  ].map((p) => {
                    const isReceiving = scene9Routing && scene9ActivePod === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`glass-panel p-4 rounded-xl border text-center font-mono text-xs transition-all duration-300 ${
                          isReceiving
                            ? "border-success-glow bg-success-glow/20 text-success-glow shadow-[0_0_25px_rgba(0,255,194,0.4)] scale-105"
                            : "border-primary/40 text-white"
                        }`}
                      >
                        <div className="text-lg mb-1">{isReceiving ? "⚡" : "📦"}</div>
                        <div className="text-[11px] font-bold">{p.name}</div>
                        <div className="text-[9px] text-on-surface-variant">{p.ip}</div>
                        <div className={`text-[9px] mt-1 font-bold ${isReceiving ? "text-success-glow animate-pulse" : "text-on-surface-variant"}`}>
                          {isReceiving ? "Handling Request (200 OK) ✓" : "33% Traffic Share"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ SCENE 10: Self-Healing ══════════ */}
          {currentScene === 10 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="max-w-2xl space-y-2">
                <span className="font-mono text-xs text-error-pulse font-bold uppercase">The Self-Healing Loop</span>
                <h2 className="font-display text-3xl font-bold text-white">Declarative Reconciliation</h2>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  In Kubernetes, you declare your desired state: <code>replicas: 3</code>. The Controller Manager constantly checks: <em>&quot;Is actual state == desired state?&quot;</em> When a pod crashes, Kubernetes automatically spawns a replacement.
                </p>
              </div>

              <div className="space-y-6 pt-2">
                <div className="flex justify-center">
                  <button
                    onClick={handleCrashSimulation}
                    disabled={podStatus !== "healthy"}
                    className="px-6 py-2.5 rounded-xl bg-error-pulse/20 border border-error-pulse/50 text-error-pulse font-mono text-xs font-bold uppercase hover:bg-error-pulse/30 transition-all disabled:opacity-50"
                  >
                    {podStatus === "healthy" ? "⚡ Simulate Pod Crash (SIGKILL)" : "Reconciling State..."}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-5 max-w-2xl mx-auto">
                  <div className="glass-panel p-4 rounded-xl border border-success-glow/40 text-center font-mono text-xs">
                    <div className="text-2xl mb-1">📦</div>
                    <div className="font-bold text-white">pod-web-1</div>
                    <div className="text-[10px] text-success-glow mt-1">● Running</div>
                  </div>

                  <div className={`glass-panel p-4 rounded-xl border text-center font-mono text-xs transition-all duration-500 ${
                    podStatus === "crashed"
                      ? "border-error-pulse bg-error-pulse/20 shadow-[0_0_25px_rgba(255,0,92,0.3)]"
                      : podStatus === "healing"
                      ? "border-amber-400 bg-amber-500/20 animate-pulse"
                      : "border-success-glow/40"
                  }`}>
                    <div className="text-2xl mb-1">{podStatus === "crashed" ? "💥" : podStatus === "healing" ? "🔄" : "📦"}</div>
                    <div className="font-bold text-white">{podStatus === "healing" ? "pod-web-2-new" : "pod-web-2"}</div>
                    <div className={`text-[10px] mt-1 font-bold ${
                      podStatus === "crashed" ? "text-error-pulse" : podStatus === "healing" ? "text-amber-400" : "text-success-glow"
                    }`}>
                      {podStatus === "crashed" ? "✕ CRASHED" : podStatus === "healing" ? "Provisioning Replacement..." : "● Running"}
                    </div>
                  </div>

                  <div className="glass-panel p-4 rounded-xl border border-success-glow/40 text-center font-mono text-xs">
                    <div className="text-2xl mb-1">📦</div>
                    <div className="font-bold text-white">pod-web-3</div>
                    <div className="text-[10px] text-success-glow mt-1">● Running</div>
                  </div>
                </div>

                <div className="rounded-xl bg-black/50 border border-white/10 p-3 text-center font-mono text-xs text-primary max-w-xl mx-auto">
                  Reconciliation Loop: Desired: 3 | Actual: {podStatus === "crashed" ? "2 (Fixing...)" : "3 (Healthy)"}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ SCENE 11: Summary Synthesis ══════════ */}
          {currentScene === 11 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="max-w-2xl space-y-2">
                <span className="font-mono text-xs text-primary font-bold uppercase">The Mental Model</span>
                <h2 className="font-display text-3xl font-bold text-white">The Kubernetes Hierarchy</h2>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  You have completed the fundamental journey. Here is the entire system hierarchy in one cohesive mental map.
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 max-w-md mx-auto font-mono text-xs pt-2">
                {[
                  { title: "APPLICATION", desc: "Your code and business logic", color: "border-white/20 text-white" },
                  { title: "CONTAINER", desc: "Process packaging & Linux namespace isolation", color: "border-cyan/50 text-cyan bg-cyan/5" },
                  { title: "POD", desc: "Atomic scheduling unit with shared IP & volumes", color: "border-primary/50 text-primary bg-primary/5" },
                  { title: "NODE", desc: "Worker host running Kubelet, Containerd & kube-proxy", color: "border-secondary/50 text-secondary bg-secondary/5" },
                  { title: "CLUSTER", desc: "Control plane coordinating all worker nodes", color: "border-desired-state/50 text-desired-state bg-desired-state/5" },
                  { title: "KUBERNETES", desc: "The automated cloud-native orchestrator", color: "border-success-glow/50 text-success-glow bg-success-glow/10 shadow-[0_0_20px_rgba(0,255,194,0.2)]" },
                ].map((item, idx) => (
                  <div key={item.title} className="w-full flex flex-col items-center">
                    <div className={`w-full p-3 rounded-xl border text-center font-bold ${item.color}`}>
                      <div>{item.title}</div>
                      <div className="text-[10px] font-normal text-on-surface-variant mt-0.5">{item.desc}</div>
                    </div>
                    {idx < 5 && <div className="h-3 w-0.5 bg-white/20 my-0.5" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ SCENE 12: Next Steps ══════════ */}
          {currentScene === 12 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="max-w-2xl space-y-2">
                <span className="font-mono text-xs text-success-glow font-bold uppercase">Journey Complete</span>
                <h2 className="font-display text-3xl font-bold text-white">Where to Go Next</h2>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  Now that you understand the big picture, dive deeper into specialized interactive modules or start experimenting in the sandbox playground.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                <Link href="/containers" className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan/50 transition-all module-nav-card group">
                  <div className="text-3xl mb-2">📦</div>
                  <h3 className="font-display text-base font-bold text-white">01. Containers</h3>
                  <p className="font-sans text-xs text-on-surface-variant mt-1">Dockerfiles, image layers, and runtime namespaces.</p>
                  <div className="mt-3 font-mono text-xs text-cyan flex items-center gap-1 group-hover:translate-x-1 transition-transform">Explore →</div>
                </Link>

                <Link href="/kubernetes" className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-magenta/50 transition-all module-nav-card group">
                  <div className="text-3xl mb-2">⚙️</div>
                  <h3 className="font-display text-base font-bold text-white">02. Kubernetes</h3>
                  <p className="font-sans text-xs text-on-surface-variant mt-1">Deployments, ReplicaSets, HPA, and ConfigMaps.</p>
                  <div className="mt-3 font-mono text-xs text-magenta flex items-center gap-1 group-hover:translate-x-1 transition-transform">Explore →</div>
                </Link>

                <Link href="/networking" className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-success-glow/50 transition-all module-nav-card group">
                  <div className="text-3xl mb-2">🌐</div>
                  <h3 className="font-display text-base font-bold text-white">03. Networking</h3>
                  <p className="font-sans text-xs text-on-surface-variant mt-1">Interactive Packet Journey, Ingress, and DNS.</p>
                  <div className="mt-3 font-mono text-xs text-success-glow flex items-center gap-1 group-hover:translate-x-1 transition-transform">Explore →</div>
                </Link>

                <Link href="/playground" className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-primary/50 transition-all module-nav-card group">
                  <div className="text-3xl mb-2">🕹️</div>
                  <h3 className="font-display text-base font-bold text-white">04. Sandbox</h3>
                  <p className="font-sans text-xs text-on-surface-variant mt-1">Live cluster playground, chaos testing &amp; challenges.</p>
                  <div className="mt-3 font-mono text-xs text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">Launch →</div>
                </Link>
              </div>
            </div>
          )}

          {/* Bottom Scene Bar Controls */}
          <div className="pt-8 border-t border-white/10 flex justify-between items-center font-mono text-xs">
            <button
              onClick={prevScene}
              disabled={currentScene === 1}
              className="flex items-center gap-1 text-on-surface-variant hover:text-white disabled:opacity-30"
            >
              <span>←</span>
              <span>Previous Scene</span>
            </button>
            <span className="text-[10px] text-on-surface-variant">
              Scene {currentScene} of {scenes.length}: {scenes[currentScene - 1].title}
            </span>
            <button
              onClick={nextScene}
              disabled={currentScene === scenes.length}
              className="flex items-center gap-1 text-primary font-bold hover:underline disabled:opacity-30"
            >
              <span>Next Scene</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
