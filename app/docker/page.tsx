"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

interface BuildStep {
  step: number;
  title: string;
  command: string;
  layerId: number;
  hash: string;
  tag: string;
  detail: string;
}

const buildSteps: BuildStep[] = [
  { step: 1, title: "Base Image", command: "FROM node:18-alpine", layerId: 1, hash: "74d89fa11124", tag: "BASE", detail: "Pulling minimal Linux userland + Node.js 18 runtime" },
  { step: 2, title: "Dependencies", command: "RUN npm install --production", layerId: 2, hash: "85e90fb22235", tag: "R/O", detail: "Installing locked production npm dependencies (cached)" },
  { step: 3, title: "Application Code", command: "COPY . .", layerId: 3, hash: "96f01fc33346", tag: "R/O", detail: "Injecting app source code and static assets into /app" },
  { step: 4, title: "Writable Layer", command: "CMD [\"node\", \"server.js\"]", layerId: 4, hash: "ephemeral", tag: "R/W", detail: "Container runtime initialized with top-level read/write layer" },
];

export default function DockerPage() {
  const [activeLayers, setActiveLayers] = useState<number[]>([1, 2, 3, 4]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "Ready to build image 'kubeverse-app:latest'...",
    "Click 'Execute Build' to watch layer compilation.",
  ]);

  const handleSimulateBuild = () => {
    if (isBuilding) return;
    setIsBuilding(true);
    setActiveLayers([]);
    setTerminalLogs(["> Initiating docker build -t kubeverse-app:latest ."]);

    buildSteps.forEach((step, idx) => {
      setTimeout(() => {
        setActiveLayers((prev) => [...prev, step.layerId]);
        setTerminalLogs((prev) => [
          ...prev,
          `Step ${step.step}/4 : ${step.command}`,
          ` ---> ${step.detail}`,
          ` ---> Layer hash: ${step.hash}`,
        ]);

        if (idx === buildSteps.length - 1) {
          setTimeout(() => {
            setTerminalLogs((prev) => [
              ...prev,
              "Successfully built 96f01fc33346",
              "Successfully tagged kubeverse-app:latest",
              "> Container instance ready for runtime.",
            ]);
            setIsBuilding(false);
          }, 300);
        }
      }, (idx + 1) * 450);
    });
  };

  return (
    <main className="min-h-screen bg-[#0A0C10] text-[#e2e2e8] overflow-x-hidden">
      <Nav />

      {/* Floating Status */}
      <div className="fixed top-20 right-6 z-30 hidden lg:flex items-center gap-2.5 rounded-full border border-cyan/30 bg-surface-container/80 px-4 py-1.5 backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-cyan">
          Docker Daemon: {isBuilding ? "Building Image" : "Ready"}
        </span>
      </div>

      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-16">
        {/* Header Strip */}
        <section className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 font-mono text-[11px] text-cyan">
            MODULE 02 • IMMUTABLE BLUEPRINT & BUILD ENGINE
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-on-surface">
            The Blueprint & Build
          </h1>
          <p className="font-sans text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Define your environment through declarative Dockerfile instructions. Every command creates an immutable cached layer.
          </p>
        </section>

        {/* The Blueprint (Dockerfile) & Layered Architecture Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Dockerfile Code */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl font-bold text-white">The Blueprint</h2>
              <span className="font-mono text-xs text-on-surface-variant">Dockerfile</span>
            </div>

            <div className="glass-panel rounded-2xl border border-white/10 code-glow tech-border overflow-hidden">
              <div className="bg-surface-container-high px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-error-pulse/70" />
                  <span className="h-3 w-3 rounded-full bg-amber/70" />
                  <span className="h-3 w-3 rounded-full bg-success-glow/70" />
                </div>
                <span className="font-mono text-[11px] text-on-surface-variant">/workspace/Dockerfile</span>
              </div>

              <div className="p-5 font-mono text-xs leading-loose bg-black/40 text-on-surface-variant space-y-1">
                <div>
                  <span className="text-secondary font-bold">FROM</span> <span className="text-primary-fixed">node:18-alpine</span>
                </div>
                <div className="text-outline-variant text-[11px]"># Set working directory</div>
                <div>
                  <span className="text-secondary font-bold">WORKDIR</span> <span className="text-tertiary-fixed">/app</span>
                </div>
                <div className="text-outline-variant text-[11px]"># Lock dependencies for caching</div>
                <div>
                  <span className="text-secondary font-bold">COPY</span> <span className="text-tertiary-fixed">package*.json ./</span>
                </div>
                <div className="text-outline-variant text-[11px]"># Build dependencies</div>
                <div>
                  <span className="text-secondary font-bold">RUN</span> <span className="text-primary-fixed">npm install --production</span>
                </div>
                <div className="text-outline-variant text-[11px]"># Bundle source code</div>
                <div>
                  <span className="text-secondary font-bold">COPY</span> <span className="text-tertiary-fixed">. .</span>
                </div>
                <div className="text-outline-variant text-[11px]"># Expose network port</div>
                <div>
                  <span className="text-secondary font-bold">EXPOSE</span> <span className="text-primary">8080</span>
                </div>
                <div className="text-outline-variant text-[11px]"># Execution entrypoint</div>
                <div>
                  <span className="text-secondary font-bold">CMD</span> <span className="text-on-surface">[ &quot;node&quot;, &quot;server.js&quot; ]</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Layer Stack & Build Trigger */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl font-bold text-white">Layered Architecture</h2>
              <button
                onClick={handleSimulateBuild}
                disabled={isBuilding}
                className="rounded-lg bg-space-black border border-cyan px-5 py-2.5 font-mono text-xs font-bold uppercase text-cyan hover:bg-cyan/15 hover:shadow-[0_0_20px_rgba(61,214,255,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <span>⚡</span>
                <span>{isBuilding ? "Compiling Layers..." : "Execute Build"}</span>
              </button>
            </div>

            {/* Visual Layer Stack */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10 tech-border flex flex-col gap-3 min-h-[260px] justify-end">
              {buildSteps.map((step) => {
                const isVisible = activeLayers.includes(step.layerId);
                const isRW = step.tag === "R/W";

                return (
                  <div
                    key={step.step}
                    className={`rounded-xl p-3.5 border transition-all duration-300 flex items-center justify-between ${
                      isVisible
                        ? isRW
                          ? "border-success-glow bg-success-glow/10 shadow-[0_0_15px_rgba(0,255,194,0.2)]"
                          : "border-cyan bg-cyan/10 shadow-[0_0_15px_rgba(61,214,255,0.15)]"
                        : "border-white/5 bg-surface-container/30 opacity-20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-on-surface">
                        Layer {step.step}: {step.title}
                      </span>
                      <span className="font-mono text-[10px] text-on-surface-variant font-mono">
                        ({step.command})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-outline-variant">{step.hash}</span>
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isRW
                            ? "bg-success-glow/20 text-success-glow border-success-glow/40"
                            : "bg-surface-container text-cyan border-cyan/40"
                        }`}
                      >
                        {step.tag}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Build Output Terminal */}
            <div className="rounded-xl bg-black/60 border border-white/10 p-4 font-mono text-xs text-on-surface-variant h-44 overflow-y-auto terminal-scroll space-y-1">
              <div className="text-primary font-bold border-b border-white/10 pb-1 mb-2 flex justify-between">
                <span>Docker Build Terminal</span>
                <span>tty: buildkit</span>
              </div>
              {terminalLogs.map((line, idx) => (
                <div key={idx} className={line.startsWith(">") ? "text-cyan font-bold" : "text-on-surface-variant"}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Image vs Container Blueprint Matrix */}
        <section className="border-t border-white/10 pt-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="font-display text-2xl font-bold text-white">Static Blueprint vs. Live Instance</h3>
            <p className="font-sans text-sm text-on-surface-variant">
              An Image is a read-only template containing immutable file-system changes. A Container is a runnable instance with an attached thin read-write layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel rounded-2xl p-6 border border-white/10 tech-border text-center space-y-4">
              <div className="text-4xl">📦</div>
              <h4 className="font-display text-lg font-bold text-on-surface">Docker Image</h4>
              <p className="font-sans text-xs text-on-surface-variant max-w-sm mx-auto">
                Immutable, stored on disk or registry. Made of stacked read-only layers.
              </p>
              <div className="space-y-1.5 max-w-xs mx-auto pt-2">
                <div className="h-6 rounded bg-surface-container-high border border-white/10 font-mono text-[10px] flex items-center justify-center text-on-surface-variant">
                  Layer 3: Application Code
                </div>
                <div className="h-6 rounded bg-surface-container-high border border-white/10 font-mono text-[10px] flex items-center justify-center text-on-surface-variant">
                  Layer 2: Node Runtime
                </div>
                <div className="h-6 rounded bg-surface-container-high border border-white/10 font-mono text-[10px] flex items-center justify-center text-on-surface-variant">
                  Layer 1: Alpine Base OS
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-success-glow/40 tech-border text-center space-y-4 shadow-[0_0_25px_rgba(0,255,194,0.1)]">
              <div className="text-4xl">🚀</div>
              <h4 className="font-display text-lg font-bold text-success-glow">Docker Container</h4>
              <p className="font-sans text-xs text-on-surface-variant max-w-sm mx-auto">
                Ephemeral running process. Adds a thin, isolated Read/Write layer on top.
              </p>
              <div className="space-y-1.5 max-w-xs mx-auto pt-2">
                <div className="h-7 rounded bg-success-glow/20 border border-success-glow font-mono text-[10px] flex items-center justify-center text-success-glow font-bold">
                  Ephemeral Read/Write Layer (Runtime)
                </div>
                <div className="h-6 rounded bg-surface-container-high border border-white/10 font-mono text-[10px] flex items-center justify-center text-on-surface-variant opacity-75">
                  Read-Only Image Layers
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="border-t border-white/10 pt-8 flex justify-between items-center font-mono text-xs">
          <Link
            href="/containers"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container border border-white/10 text-on-surface-variant hover:text-white hover:border-white/30 transition-all module-nav-card"
          >
            <span>←</span>
            <span>Module 01 Containers</span>
          </Link>
          <Link
            href="/kubernetes"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-magenta/15 border border-magenta/40 text-magenta hover:bg-magenta/25 hover:border-magenta transition-all font-bold module-nav-card shadow-[0_0_15px_rgba(255,61,154,0.2)]"
          >
            <span>Next: Module 03 Kubernetes</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
