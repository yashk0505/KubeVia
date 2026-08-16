"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

interface LayerInfo {
  id: number;
  title: string;
  subtitle: string;
  desc: string;
  icon: string;
  color: string;
  detail: string;
  size: string;
}

const layers: LayerInfo[] = [
  {
    id: 4,
    title: "04. Application Layer (Read-Write Diff)",
    subtitle: "Your compiled binaries, static assets, and application code.",
    desc: "Contains only the execution logic and specific assets needed for runtime. Uses copy-on-write (CoW) overlay.",
    icon: "📦",
    color: "#ecb2ff",
    detail: "Application files (/app/dist, server.js) packaged without OS clutter.",
    size: "4.2 MB",
  },
  {
    id: 3,
    title: "03. Runtime Environment",
    subtitle: "Node.js 20, Python 3.11, OpenJDK, or Go runtime.",
    desc: "Provides the language runtime, standard libraries, and environment variables required for execution.",
    icon: "⚡",
    color: "#47d6ff",
    detail: "Language interpreter & dependencies isolated from host machine versioning.",
    size: "18.5 MB",
  },
  {
    id: 2,
    title: "02. Libs & System Binaries",
    subtitle: "Minimal OS dependencies (glibc, musl, libssl, ca-certificates, curl).",
    desc: "Stripped-down userland libraries based on Alpine Linux or Debian Slim base.",
    icon: "📚",
    color: "#e5d7ff",
    detail: "Dynamic shared objects linked by the application runtime.",
    size: "7.1 MB",
  },
  {
    id: 1,
    title: "01. Host OS Kernel (Shared)",
    subtitle: "Shared Linux kernel. Not bundled inside the container image.",
    desc: "Leverages host kernel namespaces, cgroups v2, and seccomp profiles directly with zero hypervisor overhead.",
    icon: "⚙️",
    color: "#859399",
    detail: "Zero hypervisor overhead: native syscall performance directly on host CPU.",
    size: "0 MB (Host Shared)",
  },
];

type LifecycleState = "none" | "built" | "created" | "running" | "paused" | "stopped";
type ContainerSubModule = "anatomy" | "dockerfile" | "lifecycle" | "namespaces" | "benchmark" | "usecases";

export default function ContainersPage() {
  const [activeSubModule, setActiveSubModule] = useState<ContainerSubModule>("anatomy");
  const [activeLayer, setActiveLayer] = useState<LayerInfo>(layers[0]);

  // Multi-stage build state
  const [buildStrategy, setBuildStrategy] = useState<"standard" | "multistage">("multistage");

  // Dockerfile cache builder state
  const [modifiedLine, setModifiedLine] = useState<number | null>(null);

  // Lifecycle State Machine
  const [lifecycleState, setLifecycleState] = useState<LifecycleState>("running");
  const [cliLogs, setCliLogs] = useState<string[]>([
    "[10:00:00] $ docker run -d --name web-app -p 8080:8080 -e NODE_ENV=production my-app:v1.0",
    "[10:00:01] Container 8f4a3e21 started. PID 1 allocated in isolated namespace.",
    "[10:00:02] Health check passed: HTTP GET /healthz ➔ 200 OK (3ms latency)",
  ]);

  // Namespace & Cgroups State
  const [selectedNamespace, setSelectedNamespace] = useState<"pid" | "net" | "mnt" | "cgroups">("pid");
  const [cgroupMemLimit, setCgroupMemLimit] = useState(256);
  const [cgroupMemUsed, setCgroupMemUsed] = useState(120);
  const [isOomKilled, setIsOomKilled] = useState(false);

  // Architecture Benchmark State
  const [instanceCount, setInstanceCount] = useState(15);

  const addCliLog = (msg: string) => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setCliLogs((prev) => [`[${time}] ${msg}`, ...prev].slice(0, 15));
  };

  const handleBuild = () => {
    setLifecycleState("built");
    addCliLog("$ docker build -t my-app:v1.0 . ➔ Built 4 layers in 1.8s (Size: 29.8MB)");
  };

  const handleCreate = () => {
    setLifecycleState("created");
    addCliLog("$ docker create --name app-container my-app:v1.0 ➔ Allocated container UUID 7c9a1b2c");
  };

  const handleStart = () => {
    setLifecycleState("running");
    addCliLog("$ docker start app-container ➔ Process running with PID 1. Ports bound 8080:8080.");
  };

  const handlePause = () => {
    const next = lifecycleState === "paused" ? "running" : "paused";
    setLifecycleState(next);
    if (next === "paused") {
      addCliLog("$ docker pause app-container ➔ Process freezer cgroup SIGSTOP applied.");
    } else {
      addCliLog("$ docker unpause app-container ➔ Process freezer cgroup SIGCONT sent. Resumed.");
    }
  };

  const handleStop = () => {
    setLifecycleState("stopped");
    addCliLog("$ docker stop app-container ➔ Sent SIGTERM, graceful drain finished, exit code 0.");
  };

  const handleRemove = () => {
    setLifecycleState("none");
    addCliLog("$ docker rm app-container ➔ Namespaces released, read-write diff layer purged.");
  };

  const handleStressMemory = () => {
    setCgroupMemUsed(cgroupMemLimit + 50);
    setIsOomKilled(true);
    addCliLog(`⚠️ CGROUP ALERT: Memory usage (306MB) exceeded hard limit (${cgroupMemLimit}MB).`);
    addCliLog("💥 Linux OOM-Killer triggered: SIGKILL dispatched to PID 1.");
    setTimeout(() => {
      setLifecycleState("stopped");
    }, 800);
  };

  const handleResetMemory = () => {
    setCgroupMemUsed(120);
    setIsOomKilled(false);
    setLifecycleState("running");
    addCliLog("✓ Memory cgroup reset. Container restarted safely.");
  };

  return (
    <main className="min-h-screen bg-[#050608] text-[#e2e2e8] overflow-x-hidden flex flex-col font-sans">
      <Nav />

      {/* Floating Status Indicator */}
      <div className="fixed top-20 right-6 z-30 hidden lg:flex items-center gap-2.5 rounded-full border border-primary/30 bg-surface-container/80 px-4 py-1.5 backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-primary status-dot-running" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-primary">
          Container Engine: Active (containerd v1.7)
        </span>
      </div>

      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto w-full flex-1 space-y-8">
        {/* Module Header & Submodule Navigation Tabs */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 tech-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-primary mb-1">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>MODULE 01 // CONTAINERS, IMAGES &amp; DOCKER</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Container Foundations &amp; Isolation
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1">
              Understand the anatomy of container images, Dockerfile caching, Linux namespaces, and resource limits.
            </p>
          </div>

          {/* Submodule Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-surface-container p-1 rounded-xl border border-white/10 font-mono text-xs">
            {[
              { key: "anatomy", label: "Layer Anatomy" },
              { key: "dockerfile", label: "Dockerfile Caching" },
              { key: "lifecycle", label: "⚡ Lifecycle Machine" },
              { key: "namespaces", label: "Kernel Namespaces" },
              { key: "benchmark", label: "Container vs VM" },
              { key: "usecases", label: "Real-World Usecases" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSubModule(tab.key as ContainerSubModule)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeSubModule === tab.key
                    ? "bg-primary text-black font-bold shadow-[0_0_12px_rgba(0,210,255,0.4)]"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════ SUBMODULE 1: Anatomy & Multi-Stage Builds ══════════ */}
        {activeSubModule === "anatomy" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Interactive Stack (Left Column) */}
              <div className="lg:col-span-6 flex flex-col gap-3 relative">
                <div className="flex justify-between items-center px-1 mb-1 font-mono text-xs">
                  <span className="text-primary font-bold">IMAGE LAYER HIERARCHY</span>
                  <span className="text-on-surface-variant">Total: {buildStrategy === "multistage" ? "29.8 MB" : "1.14 GB"}</span>
                </div>
                {layers.map((l) => {
                  const isSelected = activeLayer.id === l.id;
                  return (
                    <div
                      key={l.id}
                      onClick={() => setActiveLayer(l)}
                      className={`glass-panel p-5 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-4 ${
                        isSelected
                          ? "border-primary bg-primary/15 shadow-[0_0_20px_rgba(0,210,255,0.2)]"
                          : "border-white/10 bg-surface-container/60 hover:border-white/20"
                      } ${l.id === 1 ? "opacity-75" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-bright border border-white/10 text-lg"
                          style={{ color: l.color }}
                        >
                          {l.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: l.color }}>
                              {l.title}
                            </h3>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-on-surface-variant border border-white/5">
                              {l.size}
                            </span>
                          </div>
                          <p className="font-sans text-xs text-on-surface-variant mt-0.5">{l.subtitle}</p>
                        </div>
                      </div>
                      {isSelected && <span className="font-mono text-xs text-primary">◀</span>}
                    </div>
                  );
                })}
              </div>

              {/* Layer Detail Inspector (Right Column) */}
              <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-white/10 tech-border flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="border-b border-white/10 pb-3 flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[10px] text-primary uppercase font-bold">LAYER INSPECTOR</span>
                      <h3 className="font-display text-xl font-bold text-white mt-1">{activeLayer.title}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-primary/20 text-primary font-mono text-xs font-bold">
                      {activeLayer.size}
                    </span>
                  </div>

                  <div className="rounded-lg bg-black/50 p-4 border border-white/5 font-mono text-xs text-primary leading-relaxed">
                    {activeLayer.detail}
                  </div>

                  <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                    {activeLayer.desc}
                  </p>
                </div>

                {/* Multi-Stage Build Comparison Switcher */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex justify-between items-center font-mono text-xs">
                    <span className="text-white font-bold">Multi-Stage Build Optimization:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setBuildStrategy("standard")}
                        className={`px-2.5 py-1 rounded ${
                          buildStrategy === "standard" ? "bg-error-pulse text-white font-bold" : "text-on-surface-variant"
                        }`}
                      >
                        Single-Stage (1.14 GB)
                      </button>
                      <button
                        onClick={() => setBuildStrategy("multistage")}
                        className={`px-2.5 py-1 rounded ${
                          buildStrategy === "multistage" ? "bg-success-glow text-black font-bold" : "text-on-surface-variant"
                        }`}
                      >
                        Multi-Stage (29.8 MB)
                      </button>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-on-surface-variant">
                    {buildStrategy === "multistage"
                      ? "✓ Build stage compiles assets using full Node.js/Go SDK, then only the minimal binary is copied into a scratch/Alpine production image. 97% size reduction."
                      : "⚠️ Single stage includes the full compiler, build caches, git, and devDependencies in the final image, expanding the attack surface and download times."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SUBMODULE 2: Dockerfile & Cache Invalidation ══════════ */}
        {activeSubModule === "dockerfile" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Dockerfile Layer Caching Mechanics</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                Docker builds images top-to-bottom. If a layer changes, all subsequent layers must be rebuilt (cache miss).
                Click on any Dockerfile line below to see how cache invalidation propagates down the stack.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Interactive Dockerfile Lines */}
              <div className="lg:col-span-7 space-y-2 font-mono text-xs">
                {[
                  { line: 1, cmd: "FROM node:20-alpine AS base", comment: "Base OS image", time: "0.1s", size: "7.1MB" },
                  { line: 2, cmd: "WORKDIR /app", comment: "Set working directory", time: "0.0s", size: "0B" },
                  { line: 3, cmd: "COPY package*.json ./", comment: "Dependencies manifest (Changes rarely)", time: "0.2s", size: "2.4KB" },
                  { line: 4, cmd: "RUN npm ci --only=production", comment: "Install node_modules", time: "12.4s", size: "18.5MB" },
                  { line: 5, cmd: "COPY src/ ./src", comment: "Application code (Changes on every commit)", time: "0.4s", size: "4.2MB" },
                  { line: 6, cmd: "EXPOSE 8080", comment: "Container metadata", time: "0.0s", size: "0B" },
                  { line: 7, cmd: 'CMD ["node", "src/server.js"]', comment: "Execution command", time: "0.0s", size: "0B" },
                ].map((item) => {
                  const isModified = modifiedLine === item.line;
                  const isCacheBusted = modifiedLine !== null && item.line >= modifiedLine;

                  return (
                    <div
                      key={item.line}
                      onClick={() => setModifiedLine(isModified ? null : item.line)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isModified
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                          : isCacheBusted
                          ? "bg-error-pulse/15 border-error-pulse/40 text-error-pulse"
                          : "bg-surface-container border-white/10 text-white hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-on-surface-variant text-[10px]">{item.line}</span>
                        <div>
                          <div className="font-bold">{item.cmd}</div>
                          <div className="text-[10px] text-on-surface-variant mt-0.5">{item.comment}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCacheBusted
                            ? "bg-error-pulse/20 text-error-pulse border border-error-pulse/30"
                            : "bg-success-glow/20 text-success-glow border border-success-glow/30"
                        }`}>
                          {isCacheBusted ? "CACHE BUSTED ✕" : "CACHED ✓"}
                        </span>
                        <div className="text-[9px] text-on-surface-variant mt-0.5">
                          {isCacheBusted ? `Rebuilding (${item.time})` : "0.0s (Instant)"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cache Analysis Panel */}
              <div className="lg:col-span-5 glass-panel rounded-xl p-5 border border-white/10 flex flex-col justify-between font-mono text-xs space-y-4">
                <div>
                  <div className="text-primary font-bold border-b border-white/10 pb-2">
                    Build Cache Analysis
                  </div>
                  <div className="space-y-3 pt-3 text-on-surface-variant">
                    <div>
                      Selected Invalidation Point:{" "}
                      <span className="text-white font-bold">
                        {modifiedLine ? `Line ${modifiedLine}` : "None (100% Cache Hit)"}
                      </span>
                    </div>
                    <div>
                      Build Duration:{" "}
                      <span className="text-cyan font-bold">
                        {modifiedLine === null ? "0.3s (Cached)" : modifiedLine <= 4 ? "14.2s (Reinstalling npm)" : "1.8s (Fast Delta Build)"}
                      </span>
                    </div>
                    <div className="text-[11px] leading-relaxed pt-2 border-t border-white/10">
                      💡 <strong>Best Practice Rule:</strong> Place rarely changing layers (`package.json`, `RUN npm install`) BEFORE frequently changing layers (`COPY src/`). This ensures fast 1-second builds for code changes!
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setModifiedLine(null)}
                  className="py-2 rounded-lg bg-surface-container border border-white/10 text-on-surface-variant hover:text-white text-center font-bold"
                >
                  Reset Cache
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SUBMODULE 3: Lifecycle Simulator ══════════ */}
        {activeSubModule === "lifecycle" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-8 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Container Lifecycle State Machine</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                Walk through the exact states an OCI container progresses through from build to execution and cleanup.
              </p>
            </div>

            {/* Lifecycle Stages Visualization */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { state: "none", label: "0. No Container", icon: "⚪" },
                { state: "built", label: "1. Image Built", icon: "📦" },
                { state: "created", label: "2. Created", icon: "📝" },
                { state: "running", label: "3. Running", icon: "▶️" },
                { state: "paused", label: "4. Paused", icon: "⏸️" },
                { state: "stopped", label: "5. Stopped", icon: "⏹️" },
              ].map((s) => {
                const isActive = lifecycleState === s.state;
                return (
                  <div
                    key={s.state}
                    className={`p-3 rounded-xl border text-center font-mono text-xs transition-all ${
                      isActive
                        ? "bg-success-glow/20 border-success-glow text-success-glow font-bold shadow-[0_0_20px_rgba(0,255,194,0.3)] scale-105"
                        : "bg-surface-container border-white/5 text-on-surface-variant opacity-60"
                    }`}
                  >
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="text-[11px]">{s.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={handleBuild}
                className="px-4 py-2 rounded-lg bg-surface-container border border-white/10 hover:border-primary text-primary font-mono text-xs font-bold"
              >
                1. docker build
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-lg bg-surface-container border border-white/10 hover:border-cyan text-cyan font-mono text-xs font-bold"
              >
                2. docker create
              </button>
              <button
                onClick={handleStart}
                className="px-4 py-2 rounded-lg bg-success-glow/20 border border-success-glow text-success-glow font-mono text-xs font-bold shadow-[0_0_12px_rgba(0,255,194,0.2)]"
              >
                3. docker start
              </button>
              <button
                onClick={handlePause}
                className="px-4 py-2 rounded-lg bg-surface-container border border-white/10 hover:border-amber-400 text-amber-400 font-mono text-xs font-bold"
              >
                4. docker {lifecycleState === "paused" ? "unpause" : "pause"}
              </button>
              <button
                onClick={handleStop}
                className="px-4 py-2 rounded-lg bg-surface-container border border-white/10 hover:border-error-pulse text-error-pulse font-mono text-xs font-bold"
              >
                5. docker stop
              </button>
              <button
                onClick={handleRemove}
                className="px-4 py-2 rounded-lg bg-surface-container border border-white/10 hover:border-white text-on-surface-variant font-mono text-xs font-bold"
              >
                6. docker rm
              </button>
            </div>

            {/* Live Terminal Stream */}
            <div className="rounded-xl bg-black/70 border border-white/10 p-4 font-mono text-xs space-y-1">
              <div className="text-[10px] text-on-surface-variant border-b border-white/10 pb-1 uppercase font-bold flex justify-between">
                <span>Docker Engine Daemon Stream</span>
                <span className="text-success-glow">LIVE</span>
              </div>
              <div className="space-y-1 pt-1 max-h-36 overflow-y-auto">
                {cliLogs.map((log, i) => (
                  <div key={i} className="text-[11px] text-emerald-400">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SUBMODULE 4: Linux Namespaces & Cgroups ══════════ */}
        {activeSubModule === "namespaces" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Linux Kernel Namespaces &amp; Cgroups</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                Containers do not exist as hardware objects. They are standard Linux processes wrapped in kernel isolation boundaries.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "pid", label: "PID (Process IDs)" },
                { key: "net", label: "NET (Network Devices)" },
                { key: "mnt", label: "MNT (OverlayFS)" },
                { key: "cgroups", label: "CGROUPS (Resource Limits & OOM)" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedNamespace(tab.key as typeof selectedNamespace)}
                  className={`px-4 py-2 rounded-lg font-mono text-xs transition-all border ${
                    selectedNamespace === tab.key
                      ? "bg-desired-state text-white border-desired-state font-bold shadow-[0_0_15px_rgba(189,0,255,0.3)]"
                      : "bg-surface-container border-white/10 text-on-surface-variant hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {selectedNamespace === "pid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-2">
                  <div className="font-mono text-xs text-on-surface-variant uppercase font-bold">Host Kernel View</div>
                  <div className="rounded bg-black/50 p-3 font-mono text-[11px] text-white space-y-1">
                    <div>PID 1: systemd</div>
                    <div>PID 482: containerd</div>
                    <div>PID 28414: node server.js (Target Container)</div>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-xl border border-desired-state/50 bg-desired-state/5 space-y-2">
                  <div className="font-mono text-xs text-desired-state uppercase font-bold">Inside Container PID Namespace</div>
                  <div className="rounded bg-black/50 p-3 font-mono text-[11px] text-emerald-400 space-y-1">
                    <div>PID 1: node server.js (Root of isolated tree)</div>
                    <div className="text-on-surface-variant text-[10px] mt-2">
                      Notice: Container cannot see PID 1 (systemd) or any sibling processes on the host.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedNamespace === "net" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-2">
                  <div className="font-mono text-xs text-on-surface-variant uppercase font-bold">Host Network</div>
                  <div className="rounded bg-black/50 p-3 font-mono text-[11px] text-white space-y-1">
                    <div>Interface: eth0 (192.168.1.105)</div>
                    <div>Bridge: docker0 (172.17.0.1)</div>
                    <div>Port Mapping: 0.0.0.0:8080 ➔ 172.17.0.2:8080</div>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-xl border border-desired-state/50 bg-desired-state/5 space-y-2">
                  <div className="font-mono text-xs text-desired-state uppercase font-bold">Container Net Namespace</div>
                  <div className="rounded bg-black/50 p-3 font-mono text-[11px] text-emerald-400 space-y-1">
                    <div>Interface: eth0 (172.17.0.2) via veth pair</div>
                    <div>Loopback: 127.0.0.1 (Isolated from host localhost)</div>
                    <div>Routes: Default gateway 172.17.0.1</div>
                  </div>
                </div>
              </div>
            )}

            {selectedNamespace === "mnt" && (
              <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-4 pt-2">
                <div className="font-mono text-xs text-primary uppercase font-bold">OverlayFS 3-Tier Layering</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-surface-container border border-white/10">
                    <div className="text-primary font-bold">UpperDir (Read-Write)</div>
                    <div className="text-[10px] text-on-surface-variant mt-1">
                      Ephemerally stores files modified or created during container runtime.
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container border border-white/10">
                    <div className="text-secondary font-bold">LowerDir (Read-Only)</div>
                    <div className="text-[10px] text-on-surface-variant mt-1">
                      Immutable image layers stacked and shared across all container instances.
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-desired-state/20 border border-desired-state text-desired-state font-bold">
                    <div>MergedDir (Unified)</div>
                    <div className="text-[10px] text-on-surface-variant mt-1 font-normal">
                      The single unified root filesystem `/` presented to the running process.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedNamespace === "cgroups" && (
              <div className="space-y-4 pt-2">
                <div className="glass-panel p-5 rounded-xl border border-amber-400/40 space-y-3">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-amber-400 font-bold">CGROUP Memory Hard Limit: {cgroupMemLimit} MB</span>
                    <span className={isOomKilled ? "text-error-pulse font-bold" : "text-emerald-400"}>
                      Used: {cgroupMemUsed} MB {isOomKilled && "(OOM KILLED)"}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOomKilled ? "bg-error-pulse" : "bg-emerald-400"
                      }`}
                      style={{ width: `${Math.min(100, (cgroupMemUsed / cgroupMemLimit) * 100)}%` }}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleStressMemory}
                      disabled={isOomKilled}
                      className="px-4 py-2 rounded-lg bg-error-pulse/20 border border-error-pulse text-error-pulse font-mono text-xs font-bold hover:bg-error-pulse/30 transition-all disabled:opacity-40"
                    >
                      💥 Trigger Memory Leak (Force OOM Kill)
                    </button>
                    {isOomKilled && (
                      <button
                        onClick={handleResetMemory}
                        className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-mono text-xs font-bold"
                      >
                        ✓ Restart Process &amp; Reset Limits
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════ SUBMODULE 5: Container vs VM Benchmark ══════════ */}
        {activeSubModule === "benchmark" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Container vs Virtual Machine Benchmark</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                See how density and startup speeds scale when multiplexing applications on the same physical host.
              </p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span>Simulated App Workload Instances:</span>
                <span className="text-amber-400 font-bold">{instanceCount} Instances</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={instanceCount}
                onChange={(e) => setInstanceCount(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-emerald-500/40 bg-emerald-500/5 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-emerald-500/20 pb-2">
                  <span>📦 Linux Containers (Docker)</span>
                  <span>Lightweight</span>
                </div>
                <div className="space-y-1.5 text-on-surface-variant text-[11px]">
                  <div>Boot Time: <span className="text-white font-bold">~45 ms (Instant Process Fork)</span></div>
                  <div>RAM Consumed: <span className="text-white font-bold">{(instanceCount * 8).toFixed(0)} MB</span> (Shared Kernel)</div>
                  <div>Hypervisor Overhead: <span className="text-emerald-400 font-bold">0% (Native Syscalls)</span></div>
                  <div>Max Density on 16GB Host: <span className="text-white font-bold">~1,800 containers</span></div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-error-pulse/40 bg-error-pulse/5 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-error-pulse font-bold border-b border-error-pulse/20 pb-2">
                  <span>💻 Full Virtual Machines (KVM/ESXi)</span>
                  <span>Heavy Footprint</span>
                </div>
                <div className="space-y-1.5 text-on-surface-variant text-[11px]">
                  <div>Boot Time: <span className="text-white font-bold">~35,000 ms (Full OS Initialization)</span></div>
                  <div>RAM Consumed: <span className="text-white font-bold">{(instanceCount * 1200).toFixed(0)} MB</span> (Redundant Guest Kernels)</div>
                  <div>Hypervisor Overhead: <span className="text-error-pulse font-bold">12–18% CPU penalty</span></div>
                  <div>Max Density on 16GB Host: <span className="text-white font-bold">~12 VMs maximum</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SUBMODULE 6: Real-World Usecases ══════════ */}
        {activeSubModule === "usecases" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <div className="glass-panel p-6 rounded-2xl border border-primary/30 space-y-3">
              <div className="text-2xl">⚡</div>
              <h3 className="font-display text-lg font-bold text-white">1. Microservices Architecture</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Break large monoliths into polyglot services (Go for payments, Python for ML, Node for web), each isolated with independent release cycles.
              </p>
              <div className="pt-2 font-mono text-[10px] text-primary">
                ✓ Fast zero-downtime rolling deploys
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-success-glow/30 space-y-3">
              <div className="text-2xl">🛡️</div>
              <h3 className="font-display text-lg font-bold text-white">2. CI/CD Ephemeral Runners</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Spin up clean, identical test environments in 50ms for every pull request, run unit tests, and destroy the container without leftover state.
              </p>
              <div className="pt-2 font-mono text-[10px] text-success-glow">
                ✓ 100% reproducible test matrix
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-desired-state/30 space-y-3">
              <div className="text-2xl">💰</div>
              <h3 className="font-display text-lg font-bold text-white">3. Cloud Cost Efficiency</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Pack dozens of microservices onto a single cloud compute instance with strict cgroups memory and CPU limits to prevent noisy neighbors.
              </p>
              <div className="pt-2 font-mono text-[10px] text-desired-state">
                ✓ 70%+ compute infrastructure savings
              </div>
            </div>
          </div>
        )}

        {/* Bottom Module Navigation */}
        <div className="border-t border-white/10 pt-8 flex justify-between items-center font-mono text-xs">
          <Link
            href="/explore"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container border border-white/10 text-on-surface-variant hover:text-white hover:border-white/30 transition-all module-nav-card"
          >
            <span>←</span>
            <span>The Journey (Explore)</span>
          </Link>
          <Link
            href="/kubernetes"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-magenta/15 border border-magenta/40 text-magenta hover:bg-magenta/25 hover:border-magenta transition-all font-bold module-nav-card shadow-[0_0_15px_rgba(255,61,154,0.2)]"
          >
            <span>Next: Module 02 Kubernetes</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
