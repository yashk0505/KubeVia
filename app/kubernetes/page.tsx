"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

type WorkloadKind = "Deployment" | "StatefulSet" | "DaemonSet" | "Job";
type K8sSubModule = "architecture" | "pods" | "workloads" | "rollout" | "scaling" | "storage" | "config" | "usecases";

interface PodUnit {
  id: string;
  version: "v1" | "v2";
  status: "running" | "terminating" | "provisioning";
  cpu: number;
}

export default function KubernetesPage() {
  const [activeSubModule, setActiveSubModule] = useState<K8sSubModule>("workloads");
  const [selectedWorkload, setSelectedWorkload] = useState<WorkloadKind>("Deployment");

  // Replicas & Self-healing state
  const [replicas, setReplicas] = useState(3);
  const [pods, setPods] = useState<PodUnit[]>([
    { id: "web-7f9a-1", version: "v1", status: "running", cpu: 32 },
    { id: "web-7f9a-2", version: "v1", status: "running", cpu: 45 },
    { id: "web-7f9a-3", version: "v1", status: "running", cpu: 28 },
  ]);
  const [isReconciling, setIsReconciling] = useState(false);

  // Pod Patterns state (Sidecar vs InitContainer)
  const [podPattern, setPodPattern] = useState<"single" | "sidecar" | "init">("sidecar");

  // Rolling Update state
  const [isRollingOut, setIsRollingOut] = useState(false);
  const [activeVersion, setActiveVersion] = useState<"v1" | "v2">("v1");
  const [rolloutLogs, setRolloutLogs] = useState<string[]>([
    "ReplicaSet web-v1 active with 3 ready replicas.",
  ]);

  // HPA Auto-scaling state
  const [hpaTraffic, setHpaTraffic] = useState(35);
  const [hpaTargetCpu, setHpaTargetCpu] = useState(60);

  // ConfigMap state
  const [envLogLevel, setEnvLogLevel] = useState("INFO");
  const [dbHost, setDbHost] = useState("postgres.production.db");

  // PVC state
  const [pvcSize, setPvcSize] = useState(50);
  const [isBound, setIsBound] = useState(true);

  const addRolloutLog = (msg: string) => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setRolloutLogs((prev) => [`[${time}] ${msg}`, ...prev].slice(0, 10));
  };

  const handleReconcile = (targetCount: number) => {
    setReplicas(targetCount);
    setIsReconciling(true);

    if (targetCount > pods.length) {
      const needed = targetCount - pods.length;
      const newItems: PodUnit[] = Array.from({ length: needed }, (_, i) => ({
        id: `web-${Math.random().toString(36).substring(2, 6)}-${pods.length + i + 1}`,
        version: activeVersion,
        status: "provisioning",
        cpu: Math.floor(Math.random() * 30) + 20,
      }));
      setPods((prev) => [...prev, ...newItems]);

      setTimeout(() => {
        setPods((prev) => prev.map((p) => ({ ...p, status: "running" })));
        setIsReconciling(false);
      }, 600);
    } else if (targetCount < pods.length) {
      setPods((prev) => prev.slice(0, targetCount));
      setTimeout(() => {
        setIsReconciling(false);
      }, 300);
    } else {
      setIsReconciling(false);
    }
  };

  const handleKillRandomPod = () => {
    if (pods.length === 0 || isReconciling) return;
    setIsReconciling(true);

    const randomIndex = Math.floor(Math.random() * pods.length);
    const targetPod = pods[randomIndex];

    setPods((prev) =>
      prev.map((p, idx) => (idx === randomIndex ? { ...p, status: "terminating" } : p))
    );
    addRolloutLog(`Pod ${targetPod.id} terminated. Reconciliation loop triggered.`);

    setTimeout(() => {
      const newPod: PodUnit = {
        id: `web-${Math.random().toString(36).substring(2, 6)}-${Date.now().toString().slice(-2)}`,
        version: activeVersion,
        status: "provisioning",
        cpu: Math.floor(Math.random() * 30) + 20,
      };

      setPods((prev) => [...prev.filter((p) => p.id !== targetPod.id), newPod]);

      setTimeout(() => {
        setPods((prev) => prev.map((p) => ({ ...p, status: "running" })));
        setIsReconciling(false);
        addRolloutLog(`Replacement pod ${newPod.id} scheduled and running.`);
      }, 500);
    }, 1000);
  };

  const triggerRollingUpdate = () => {
    if (isRollingOut) return;
    setIsRollingOut(true);
    const nextVer = activeVersion === "v1" ? "v2" : "v1";
    addRolloutLog(`Triggered deployment update: Image updated to app:${nextVer}.0 (maxSurge=1, maxUnavailable=0)`);

    setTimeout(() => {
      setPods((prev) => [
        ...prev,
        { id: `web-${nextVer}-${Math.random().toString(36).substring(2, 5)}`, version: nextVer, status: "provisioning", cpu: 25 },
      ]);
      addRolloutLog(`ReplicaSet app-${nextVer} scaled up to 1 replica (Surge).`);

      setTimeout(() => {
        setPods((prev) => {
          const updated = prev.map((p) => (p.status === "provisioning" ? { ...p, status: "running" as const } : p));
          const oldIndex = updated.findIndex((p) => p.version === activeVersion);
          if (oldIndex !== -1) updated.splice(oldIndex, 1);
          return updated;
        });
        addRolloutLog(`ReplicaSet app-${activeVersion} scaled down to 2 replicas.`);

        setTimeout(() => {
          setPods([
            { id: `web-${nextVer}-01`, version: nextVer, status: "running", cpu: 30 },
            { id: `web-${nextVer}-02`, version: nextVer, status: "running", cpu: 35 },
            { id: `web-${nextVer}-03`, version: nextVer, status: "running", cpu: 28 },
          ]);
          setActiveVersion(nextVer);
          setIsRollingOut(false);
          addRolloutLog(`✓ Rollout complete: 3/3 replicas updated to app:${nextVer}.0 with zero downtime.`);
        }, 1200);
      }, 1000);
    }, 800);
  };

  const triggerRollback = () => {
    if (isRollingOut) return;
    addRolloutLog(`$ kubectl rollout undo deployment/web ➔ Rolling back to previous revision.`);
    triggerRollingUpdate();
  };

  // HPA Auto-scaler Effect
  useEffect(() => {
    const calculatedReplicas = Math.min(8, Math.max(2, Math.ceil((hpaTraffic / hpaTargetCpu) * 3)));
    if (calculatedReplicas !== pods.length && !isReconciling && !isRollingOut) {
      handleReconcile(calculatedReplicas);
    }
  }, [hpaTraffic, hpaTargetCpu]);

  return (
    <main className="min-h-screen bg-[#050608] text-[#e2e2e8] overflow-x-hidden flex flex-col font-sans">
      <Nav />

      {/* Floating Status */}
      <div className="fixed top-20 right-6 z-30 hidden lg:flex items-center gap-2.5 rounded-full border border-magenta/30 bg-surface-container/80 px-4 py-1.5 backdrop-blur-md">
        <span className={`h-2 w-2 rounded-full ${isReconciling || isRollingOut ? "bg-amber-400 animate-spin" : "bg-success-glow pulse-dot"}`} />
        <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface">
          Cluster State: {isReconciling ? "Reconciling..." : isRollingOut ? "Rolling Out..." : "Synced"}
        </span>
      </div>

      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto w-full flex-1 space-y-8">
        {/* Module Header & Submodule Switcher */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 tech-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-magenta mb-1">
              <span className="h-2 w-2 rounded-full bg-magenta animate-pulse" />
              <span>MODULE 02 // KUBERNETES ORCHESTRATION</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              The Orchestrator&apos;s Engine
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1">
              Master cluster architecture, pod design patterns, workload controllers, rolling updates, and storage persistence.
            </p>
          </div>

          {/* Submodule Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-surface-container p-1 rounded-xl border border-white/10 font-mono text-xs">
            {[
              { key: "architecture", label: "Architecture" },
              { key: "pods", label: "Pod Patterns" },
              { key: "workloads", label: "Workload Types" },
              { key: "rollout", label: "⚡ Rolling Updates" },
              { key: "scaling", label: "HPA Autoscaling" },
              { key: "storage", label: "PVC Storage" },
              { key: "config", label: "Config & Secrets" },
              { key: "usecases", label: "Real-World Usecases" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSubModule(tab.key as K8sSubModule)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeSubModule === tab.key
                    ? "bg-magenta text-white font-bold shadow-[0_0_12px_rgba(255,61,154,0.4)]"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════ SUBMODULE 1: Architecture Overview ══════════ */}
        {activeSubModule === "architecture" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Control Plane &amp; Worker Node Architecture</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                Kubernetes divides responsibilities cleanly between the Control Plane (brain) and Worker Nodes (compute muscle).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Control Plane Box */}
              <div className="p-5 rounded-xl border border-magenta/40 bg-magenta/5 space-y-4 font-mono text-xs">
                <div className="text-magenta font-bold uppercase border-b border-magenta/20 pb-2 flex justify-between">
                  <span>Control Plane (Master Components)</span>
                  <span className="text-[10px] text-on-surface-variant">Ports 6443, 2379</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded bg-black/40 border border-white/5">
                    <span className="text-primary font-bold">kube-apiserver:</span> Front-door REST API verifying auth, RBAC, and admission webhooks.
                  </div>
                  <div className="p-2.5 rounded bg-black/40 border border-white/5">
                    <span className="text-desired-state font-bold">etcd:</span> Distributed, highly consistent Raft key-value database.
                  </div>
                  <div className="p-2.5 rounded bg-black/40 border border-white/5">
                    <span className="text-secondary font-bold">kube-scheduler:</span> Evaluates node capacity and places unassigned pods.
                  </div>
                  <div className="p-2.5 rounded bg-black/40 border border-white/5">
                    <span className="text-tertiary font-bold">kube-controller-manager:</span> Runs reconciliation loops (Node, ReplicaSet, Endpoint).
                  </div>
                </div>
              </div>

              {/* Worker Node Box */}
              <div className="p-5 rounded-xl border border-cyan/40 bg-cyan/5 space-y-4 font-mono text-xs">
                <div className="text-cyan font-bold uppercase border-b border-cyan/20 pb-2 flex justify-between">
                  <span>Worker Node (Execution Fleet)</span>
                  <span className="text-[10px] text-on-surface-variant">Ports 10250, 10256</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded bg-black/40 border border-white/5">
                    <span className="text-success-glow font-bold">kubelet:</span> Node daemon communicating with master and executing PodSpecs via CRI.
                  </div>
                  <div className="p-2.5 rounded bg-black/40 border border-white/5">
                    <span className="text-white font-bold">containerd (CRI):</span> Container runtime pulling images and managing OCI lifecycle.
                  </div>
                  <div className="p-2.5 rounded bg-black/40 border border-white/5">
                    <span className="text-amber-400 font-bold">kube-proxy:</span> Manages iptables/IPVS packet forwarding rules for Services.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SUBMODULE 2: Pod Design Patterns ══════════ */}
        {activeSubModule === "pods" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-white">Pod Design Patterns</h2>
                <p className="font-sans text-xs text-on-surface-variant mt-1">
                  Pods can co-locate multiple containers that share localhost networking and local volumes.
                </p>
              </div>

              <div className="flex gap-1.5 font-mono text-xs">
                {[
                  { key: "single", label: "Single Container" },
                  { key: "sidecar", label: "Sidecar Pattern" },
                  { key: "init", label: "InitContainer Flow" },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPodPattern(p.key as typeof podPattern)}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${
                      podPattern === p.key
                        ? "bg-magenta/20 border-magenta text-magenta font-bold shadow-[0_0_12px_rgba(255,61,154,0.3)]"
                        : "bg-surface-container border-white/10 text-on-surface-variant hover:text-white"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern Canvas */}
            <div className="rounded-2xl border-2 border-dashed border-magenta/40 bg-magenta/5 p-6 space-y-4">
              <div className="flex justify-between items-center font-mono text-xs border-b border-magenta/20 pb-2">
                <span className="text-magenta font-bold">POD: checkout-service-9d84f</span>
                <span className="text-success-glow">IP: 10.244.2.14 (Shared Loopback 127.0.0.1)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {podPattern === "init" && (
                  <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500 text-amber-300 font-mono text-xs space-y-1">
                    <div className="font-bold">🚀 1. InitContainer (Pre-flight)</div>
                    <div className="text-[10px] text-on-surface-variant">Runs database migrations before main container starts. Exits with 0.</div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-surface-container border border-white/10 font-mono text-xs space-y-1">
                  <div className="text-primary font-bold">📦 Main Application</div>
                  <div className="text-[10px] text-on-surface-variant">Node.js Checkout API serving customer traffic on port 8080.</div>
                </div>

                {podPattern === "sidecar" && (
                  <div className="p-4 rounded-xl bg-desired-state/20 border border-desired-state text-desired-state font-mono text-xs space-y-1 animate-scaleIn">
                    <div className="font-bold">🛰️ Sidecar (Fluentbit Logger)</div>
                    <div className="text-[10px] text-on-surface-variant">Tails app logs from shared volume and streams to ElasticSearch.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SUBMODULE 3: Workload Types ══════════ */}
        {activeSubModule === "workloads" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["Deployment", "StatefulSet", "DaemonSet", "Job"] as WorkloadKind[]).map((kind) => (
                <button
                  key={kind}
                  onClick={() => setSelectedWorkload(kind)}
                  className={`p-4 rounded-xl border text-left font-mono text-xs transition-all ${
                    selectedWorkload === kind
                      ? "bg-magenta/20 border-magenta text-white font-bold shadow-[0_0_15px_rgba(255,61,154,0.3)]"
                      : "bg-surface-container border-white/10 text-on-surface-variant hover:text-white"
                  }`}
                >
                  <div className="text-xl mb-1">{kind === "Deployment" ? "🔄" : kind === "StatefulSet" ? "💾" : kind === "DaemonSet" ? "🛡️" : "⏱️"}</div>
                  <div className="font-bold">{kind}</div>
                </button>
              ))}
            </div>

            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="font-mono text-xs text-magenta font-bold uppercase">{selectedWorkload} Controller</span>
                  <h2 className="font-display text-xl font-bold text-white mt-0.5">
                    {selectedWorkload === "Deployment" && "Stateless Replicated Pod Fleet"}
                    {selectedWorkload === "StatefulSet" && "Ordered, Persistent Identity (db-0, db-1)"}
                    {selectedWorkload === "DaemonSet" && "One Pod Per Node Daemon (Logging/Monitoring)"}
                    {selectedWorkload === "Job" && "Run-to-Completion Batch Processing"}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleKillRandomPod}
                    disabled={isReconciling || pods.length === 0}
                    className="px-4 py-2 rounded-lg bg-error-pulse/20 border border-error-pulse text-error-pulse font-mono text-xs font-bold uppercase hover:bg-error-pulse/30 transition-all disabled:opacity-40"
                  >
                    💥 Kill Random Pod
                  </button>
                </div>
              </div>

              {/* Slider for Replicas */}
              <div className="p-4 rounded-xl bg-surface-container border border-white/10 space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span>Desired Replicas (`spec.replicas`):</span>
                  <span className="text-magenta font-bold">{replicas} Replicas</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={replicas}
                  onChange={(e) => handleReconcile(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Pod Cluster Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {pods.map((pod) => (
                  <div
                    key={pod.id}
                    className={`p-4 rounded-xl border font-mono text-xs transition-all duration-300 ${
                      pod.status === "terminating"
                        ? "border-error-pulse bg-error-pulse/20 opacity-50 line-through"
                        : pod.status === "provisioning"
                        ? "border-amber-400 bg-amber-500/20 animate-pulse"
                        : "border-magenta/40 bg-magenta/10 shadow-[0_0_15px_rgba(255,61,154,0.2)]"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{pod.id}</span>
                      <span className="text-[10px] text-magenta font-bold">{pod.version}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-on-surface-variant mt-2">
                      <span>Status: {pod.status}</span>
                      <span className={pod.status === "running" ? "text-success-glow font-bold" : "text-amber-400"}>
                        {pod.status === "running" ? "● Ready" : "⚡ Syncing"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-black/60 border border-white/10 p-3 text-center font-mono text-xs text-magenta">
                Reconciliation Loop: Desired ({replicas}) == Actual ({pods.filter((p) => p.status === "running").length})
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SUBMODULE 4: Rolling Updates & Rollback ══════════ */}
        {activeSubModule === "rollout" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-white">Zero-Downtime Rolling Update Simulator</h2>
                <p className="font-sans text-xs text-on-surface-variant mt-1">
                  Kubernetes creates a new ReplicaSet alongside the old one, progressively migrating traffic without dropping requests.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={triggerRollingUpdate}
                  disabled={isRollingOut}
                  className="px-5 py-2.5 rounded-xl bg-cyan/20 border border-cyan text-cyan font-mono text-xs font-bold uppercase hover:bg-cyan/30 transition-all shadow-[0_0_15px_rgba(0,210,255,0.3)] disabled:opacity-40"
                >
                  {isRollingOut ? "Rolling Out..." : `⚡ Deploy ${activeVersion === "v1" ? "v2.0" : "v1.0"}`}
                </button>
                <button
                  onClick={triggerRollback}
                  disabled={isRollingOut}
                  className="px-4 py-2.5 rounded-xl bg-amber-400/20 border border-amber-400 text-amber-400 font-mono text-xs font-bold uppercase hover:bg-amber-400/30 transition-all disabled:opacity-40"
                >
                  ↺ Undo Rollout
                </button>
              </div>
            </div>

            {/* Dual ReplicaSets Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-xl border border-emerald-500/40 bg-emerald-500/5 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-emerald-500/20 pb-2">
                  <span>ReplicaSet: app-v1 (Stable)</span>
                  <span>{pods.filter((p) => p.version === "v1").length} Pods</span>
                </div>
                <div className="space-y-1 text-on-surface-variant text-[11px]">
                  <div>Image: <span className="text-white">my-app:v1.0</span></div>
                  <div>Status: {pods.some((p) => p.version === "v1") ? "Active Traffic Target" : "Scaled to 0 (Preserved for Instant Rollback)"}</div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-cyan/40 bg-cyan/5 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-cyan font-bold border-b border-cyan/20 pb-2">
                  <span>ReplicaSet: app-v2 (Target)</span>
                  <span>{pods.filter((p) => p.version === "v2").length} Pods</span>
                </div>
                <div className="space-y-1 text-on-surface-variant text-[11px]">
                  <div>Image: <span className="text-white">my-app:v2.0</span></div>
                  <div>Strategy: <span className="text-cyan font-bold">RollingUpdate (maxSurge=1)</span></div>
                </div>
              </div>
            </div>

            {/* Live Logs Stream */}
            <div className="rounded-xl bg-black/60 border border-white/10 p-4 font-mono text-xs space-y-1">
              <div className="text-[10px] text-on-surface-variant border-b border-white/10 pb-1 uppercase font-bold">
                Deployment Controller Telemetry Stream
              </div>
              <div className="space-y-1 pt-1">
                {rolloutLogs.map((log, i) => (
                  <div key={i} className="text-cyan text-[11px]">{log}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SUBMODULE 5: HPA Autoscaling ══════════ */}
        {activeSubModule === "scaling" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Horizontal Pod Autoscaler (HPA)</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                The HPA controller queries Metrics Server every 15s and scales replicas proportionally to match target CPU utilization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-surface-container border border-white/10 space-y-4 font-mono text-xs">
                <div className="text-magenta font-bold border-b border-white/10 pb-2">HPA Configuration</div>
                <div>
                  <div className="flex justify-between text-on-surface-variant text-[10px] mb-1">
                    <span>Simulated Ingress Load:</span>
                    <span className="text-white font-bold">{hpaTraffic}% Load</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={hpaTraffic}
                    onChange={(e) => setHpaTraffic(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-on-surface-variant text-[10px] mb-1">
                    <span>Target Average CPU:</span>
                    <span className="text-magenta font-bold">{hpaTargetCpu}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="80"
                    value={hpaTargetCpu}
                    onChange={(e) => setHpaTargetCpu(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="p-5 rounded-xl bg-black/60 border border-magenta/40 space-y-3 font-mono text-xs flex flex-col justify-center">
                <div className="text-magenta font-bold">HPA Autoscaler Status</div>
                <div className="space-y-1 text-on-surface-variant text-[11px]">
                  <div>Current Replicas: <span className="text-white font-bold">{pods.length} (Min: 2, Max: 8)</span></div>
                  <div>Calculated Formula: <code>ceil(currentReplicas * (currentCPU / targetCPU))</code></div>
                  <div className="text-success-glow font-bold pt-2">
                    ✓ Autoscaling healthy. Fleet load balanced across all worker nodes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SUBMODULE 6: Storage & PVC ══════════ */}
        {activeSubModule === "storage" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Persistent Storage &amp; PVC Binding</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                Containers are stateless by default. PersistentVolumeClaims (PVC) request durable block storage from cloud CSI drivers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs pt-2">
              <div className="p-4 rounded-xl bg-surface-container border border-white/10 space-y-2">
                <div className="text-primary font-bold">1. StorageClass</div>
                <div className="text-[10px] text-on-surface-variant">Provisioner: ebs.csi.aws.com (gp3 SSD)</div>
                <div className="text-[10px] text-primary">ReclaimPolicy: Retain</div>
              </div>

              <div className="p-4 rounded-xl bg-success-glow/10 border border-success-glow/40 space-y-2">
                <div className="text-success-glow font-bold">2. PersistentVolumeClaim</div>
                <div className="text-[10px] text-white">Size: {pvcSize} GiB</div>
                <div className="text-[10px] text-success-glow font-bold">Status: {isBound ? "Bound (pv-vol-0842)" : "Pending"}</div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container border border-white/10 space-y-2">
                <div className="text-desired-state font-bold">3. Pod Volume Mount</div>
                <div className="text-[10px] text-on-surface-variant">MountPath: /var/lib/data</div>
                <div className="text-[10px] text-white">ReadWriteOnce (RWO)</div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SUBMODULE 7: ConfigMap & Secret Live Injection ══════════ */}
        {activeSubModule === "config" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-white">ConfigMap &amp; Secret Decoupling</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                Inject configuration and encrypted secrets at runtime without rebuilding container images.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-surface-container border border-white/10 space-y-4 font-mono text-xs">
                <div className="text-desired-state font-bold border-b border-white/10 pb-2">
                  ConfigMap: app-config
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-on-surface-variant block mb-1">LOG_LEVEL</label>
                    <select
                      value={envLogLevel}
                      onChange={(e) => setEnvLogLevel(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-white"
                    >
                      <option value="DEBUG">DEBUG</option>
                      <option value="INFO">INFO</option>
                      <option value="WARN">WARN</option>
                      <option value="ERROR">ERROR</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-on-surface-variant block mb-1">DB_HOST</label>
                    <input
                      type="text"
                      value={dbHost}
                      onChange={(e) => setDbHost(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-black/60 border border-desired-state/40 space-y-3 font-mono text-xs">
                <div className="text-desired-state font-bold border-b border-desired-state/20 pb-2">
                  Pod Environment Injection (Live Readout)
                </div>
                <div className="space-y-1 text-[11px] text-emerald-400">
                  <div>$ echo $LOG_LEVEL ➔ <span className="text-white font-bold">{envLogLevel}</span></div>
                  <div>$ echo $DB_HOST ➔ <span className="text-white font-bold">{dbHost}</span></div>
                  <div>$ echo $API_SECRET_KEY ➔ <span className="text-amber-400 font-bold">****************</span> (From Secret)</div>
                </div>
                <div className="text-[10px] text-on-surface-variant pt-2 border-t border-white/10">
                  ✓ Config injected dynamically into container environment.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SUBMODULE 8: Real-World Usecases ══════════ */}
        {activeSubModule === "usecases" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <div className="glass-panel p-6 rounded-2xl border border-magenta/30 space-y-3">
              <div className="text-2xl">🛍️</div>
              <h3 className="font-display text-lg font-bold text-white">1. E-Commerce Flash Sale</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Horizontal Pod Autoscaling monitors CPU and request latency, expanding checkout pods from 3 to 60 replicas in seconds to handle massive order spikes.
              </p>
              <div className="pt-2 font-mono text-[10px] text-magenta">
                ✓ Zero dropped checkouts
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-cyan/30 space-y-3">
              <div className="text-2xl">💾</div>
              <h3 className="font-display text-lg font-bold text-white">2. High-Availability Database Cluster</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                StatefulSets guarantee sticky network identities (`postgres-0`, `postgres-1`) with dedicated EBS volume attachments for master-replica database failover.
              </p>
              <div className="pt-2 font-mono text-[10px] text-cyan">
                ✓ 100% data persistence
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-success-glow/30 space-y-3">
              <div className="text-2xl">🛡️</div>
              <h3 className="font-display text-lg font-bold text-white">3. Cluster-Wide Observability</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                DaemonSets automatically deploy metric collectors (Prometheus node-exporter) and log shippers (Fluentbit) onto every newly joined worker node.
              </p>
              <div className="pt-2 font-mono text-[10px] text-success-glow">
                ✓ Complete fleet telemetry
              </div>
            </div>
          </div>
        )}

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
            href="/networking"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success-glow/15 border border-success-glow/40 text-success-glow hover:bg-success-glow/25 hover:border-success-glow transition-all font-bold module-nav-card shadow-[0_0_15px_rgba(0,255,194,0.2)]"
          >
            <span>Next: Module 03 Networking</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
