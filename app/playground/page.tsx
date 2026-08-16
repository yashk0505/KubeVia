"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type AppType = "web" | "api" | "worker" | "cache" | "db";

interface PodItem {
  id: string;
  type: AppType;
}

interface PlaygroundNode {
  id: string;
  name: string;
  status: "ready" | "offline";
  pods: PodItem[];
}

const initialNodes: PlaygroundNode[] = [
  { id: "Node-A", name: "worker-pool-1", status: "ready", pods: [{ id: "web-01", type: "web" }, { id: "api-01", type: "api" }] },
  { id: "Node-B", name: "worker-pool-2", status: "ready", pods: [{ id: "worker-01", type: "worker" }] },
  { id: "Node-C", name: "gpu-pool-1", status: "ready", pods: [{ id: "cache-01", type: "cache" }] },
  { id: "Node-D", name: "memory-opt-1", status: "ready", pods: [{ id: "db-01", type: "db" }] },
  { id: "Node-E", name: "edge-node-1", status: "ready", pods: [] },
  { id: "Node-F", name: "edge-node-2", status: "ready", pods: [] },
];

const appConfig: Record<AppType, { label: string; text: string; bg: string; border: string }> = {
  web: { label: "Web", text: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/40" },
  api: { label: "API", text: "text-cyan-400", bg: "bg-cyan-500/20", border: "border-cyan-500/40" },
  worker: { label: "Worker", text: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/40" },
  cache: { label: "Cache", text: "text-fuchsia-400", bg: "bg-fuchsia-500/20", border: "border-fuchsia-500/40" },
  db: { label: "DB", text: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/40" },
};

export default function PlaygroundPage() {
  const [nodes, setNodes] = useState<PlaygroundNode[]>(initialNodes);
  const [selectedType, setSelectedType] = useState<AppType>("web");
  const [traffic, setTraffic] = useState(20);
  const [logs, setLogs] = useState<Array<{ text: string; type: "info" | "success" | "warn" | "error"; time: string }>>([
    { text: "KubeVia Sandbox Engine Initialized.", type: "info", time: "00:00:00" },
    { text: "6 Nodes discovered. Status: Ready.", type: "success", time: "00:00:01" },
    { text: "Awaiting deployment instructions...", type: "info", time: "00:00:02" },
  ]);
  const [flashNodes, setFlashNodes] = useState<Record<string, boolean>>({});
  const [showYamlEditor, setShowYamlEditor] = useState(false);
  const [yamlContent, setYamlContent] = useState<string>(
`apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-frontend
  labels:
    app: web
spec:
  replicas: 4
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:alpine
        resources:
          limits:
            memory: "128Mi"
            cpu: "200m"`
  );

  // Refs for SVG line calculation
  const canvasRef = useRef<HTMLDivElement>(null);
  const lbRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [lines, setLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number; nodeId: string }>>([]);

  const addLog = (text: string, type: "info" | "success" | "warn" | "error" = "info") => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [{ text, type, time }, ...prev].slice(0, 20));
  };

  // Recalculate SVG lines between LB hub and worker nodes
  useEffect(() => {
    const updateLines = () => {
      if (!canvasRef.current || !lbRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const lbRect = lbRef.current.getBoundingClientRect();
      const lx = lbRect.left + lbRect.width / 2 - canvasRect.left;
      const ly = lbRect.top + lbRect.height / 2 - canvasRect.top;
      const newLines: typeof lines = [];
      nodes.forEach((node) => {
        const el = nodeRefs.current[node.id];
        if (!el) return;
        const nodeRect = el.getBoundingClientRect();
        const nx = nodeRect.left + nodeRect.width / 2 - canvasRect.left;
        const ny = nodeRect.top + nodeRect.height / 2 - canvasRect.top;
        newLines.push({ x1: lx, y1: ly, x2: nx, y2: ny, nodeId: node.id });
      });
      setLines(newLines);
    };

    updateLines();
    window.addEventListener("resize", updateLines);
    const t = setTimeout(updateLines, 200);
    return () => {
      window.removeEventListener("resize", updateLines);
      clearTimeout(t);
    };
  }, [nodes]);

  // Flash node effect
  const flashNode = (nodeId: string) => {
    setFlashNodes((prev) => ({ ...prev, [nodeId]: true }));
    setTimeout(() => setFlashNodes((prev) => ({ ...prev, [nodeId]: false })), 800);
  };

  // Least loaded node selector
  const findBestNode = (currentNodes: PlaygroundNode[]): PlaygroundNode | null => {
    const ready = currentNodes.filter((n) => n.status === "ready");
    if (ready.length === 0) return null;
    return ready.reduce((min, n) => (n.pods.length < min.pods.length ? n : min), ready[0]);
  };

  // Deploy single pod
  const handleDeploy = () => {
    const bestNode = findBestNode(nodes);
    if (!bestNode) {
      addLog("Deployment Failed: No nodes in Ready status.", "error");
      return;
    }
    const newId = `${selectedType}-${Math.random().toString(36).substring(2, 5)}`;
    setNodes((prev) =>
      prev.map((n) => (n.id === bestNode.id ? { ...n, pods: [...n.pods, { id: newId, type: selectedType }] } : n))
    );
    flashNode(bestNode.id);
    addLog(`Scheduled ${newId} (${selectedType.toUpperCase()}) → ${bestNode.name}`, "info");
  };

  // Kill pod
  const handleKillPod = (nodeId: string, podId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, pods: n.pods.filter((p) => p.id !== podId) } : n))
    );
    addLog(`Terminated ${podId} on ${nodeId}`, "warn");
  };

  // Toggle node status / self-healing
  const handleToggleNode = (nodeId: string) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;
    const isGoingOffline = target.status === "ready";
    if (isGoingOffline) {
      const evictedPods = [...target.pods];
      setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, status: "offline", pods: [] } : n)));
      addLog(`Node Failure: ${target.name} is NotReady. Evicting ${evictedPods.length} pods...`, "error");

      // Reschedule evicted pods
      if (evictedPods.length > 0) {
        setTimeout(() => {
          setNodes((currentNodes) => {
            const available = currentNodes.filter((n) => n.id !== nodeId && n.status === "ready");
            if (available.length === 0) {
              addLog(`Self-Healing Failed: No available Ready nodes to reschedule ${evictedPods.length} pods.`, "error");
              return currentNodes;
            }
            const updated = currentNodes.map((n) => ({ ...n, pods: [...n.pods] }));
            evictedPods.forEach((pod) => {
              const best = available.reduce((min, n) => {
                const updatedNode = updated.find((un) => un.id === n.id)!;
                const minNode = updated.find((un) => un.id === min.id)!;
                return updatedNode.pods.length < minNode.pods.length ? n : min;
              }, available[0]);
              const targetNode = updated.find((n) => n.id === best.id);
              if (targetNode) {
                targetNode.pods.push(pod);
                flashNode(best.id);
                addLog(`Self-Healing: Rescheduled ${pod.id} → ${targetNode.name}`, "success");
              }
            });
            return updated;
          });
        }, 900);
      }
    } else {
      setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, status: "ready" } : n)));
      addLog(`Node Recovered: ${target.name} is Ready. Kubelet connected.`, "success");
      flashNode(nodeId);
    }
  };

  // Chaos: simulate random node failure
  const handleChaos = () => {
    const readyNodes = nodes.filter((n) => n.status === "ready");
    if (readyNodes.length === 0) { addLog("Chaos: No ready nodes to disrupt.", "error"); return; }
    const victim = readyNodes[Math.floor(Math.random() * readyNodes.length)];
    handleToggleNode(victim.id);
  };

  // Scale all: deploy one of each type
  const handleScaleAll = () => {
    const types: AppType[] = ["web", "api", "worker", "cache", "db"];
    let deployed = 0;
    setNodes((prev) => {
      const updated = prev.map((n) => ({ ...n, pods: [...n.pods] }));
      types.forEach((type) => {
        const best = findBestNode(updated);
        if (best) {
          const podId = `${type}-${Math.random().toString(36).substring(2, 5)}`;
          best.pods.push({ id: podId, type });
          deployed++;
        }
      });
      if (deployed > 0) addLog(`BatchDeploy: Scaled out ${deployed} pods across fleet.`, "success");
      return updated;
    });
  };

  // HPA auto-scaling on traffic spike
  useEffect(() => {
    if (traffic > 70) {
      addLog(`HPA: Traffic spike (${traffic} req/s). Auto-scaling web pods...`, "warn");
      const interval = setInterval(() => {
        setNodes((currentNodes) => {
          const webPods = currentNodes.flatMap((n) => n.pods).filter((p) => p.type === "web").length;
          const desired = Math.ceil((traffic / 100) * 12);
          if (webPods < desired) {
            const best = findBestNode(currentNodes);
            if (best) {
              const podId = `web-auto-${Math.random().toString(36).substring(2, 5)}`;
              addLog(`HPA: Scaled up ${podId} → ${best.id}`, "info");
              flashNode(best.id);
              return currentNodes.map((n) => (n.id === best.id ? { ...n, pods: [...n.pods, { id: podId, type: "web" }] } : n));
            }
          }
          return currentNodes;
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [traffic]);

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, podId: string, fromNodeId: string) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ podId, fromNodeId }));
  };
  const handleDrop = (e: React.DragEvent, toNodeId: string) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const { podId, fromNodeId } = data;
      if (fromNodeId === toNodeId) return;
      const targetNode = nodes.find((n) => n.id === toNodeId);
      if (!targetNode || targetNode.status !== "ready") {
        addLog(`Cannot migrate to ${toNodeId}: Node is offline.`, "error");
        return;
      }
      let movedPod: PodItem | undefined;
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === fromNodeId) {
            movedPod = n.pods.find((p) => p.id === podId);
            return { ...n, pods: n.pods.filter((p) => p.id !== podId) };
          }
          return n;
        }).map((n) => {
          if (n.id === toNodeId && movedPod) {
            return { ...n, pods: [...n.pods, movedPod] };
          }
          return n;
        })
      );
      flashNode(toNodeId);
      addLog(`Manual Migration: Moved ${podId} from ${fromNodeId} → ${toNodeId}`, "info");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Reset fleet
  const handleReset = () => {
    setNodes(initialNodes);
    setTraffic(20);
    addLog("Fleet Reset to clean default topology.", "info");
  };

  const totalPods = nodes.reduce((sum, n) => sum + n.pods.length, 0);
  const readyCount = nodes.filter((n) => n.status === "ready").length;

  return (
    <main className="min-h-screen bg-[#050608] text-[#e2e2e8] overflow-x-hidden">
      <Nav />

      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-6">
        {/* Top Summary & Status Bar */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 tech-border flex flex-wrap gap-4 items-center justify-between font-mono text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold shadow-[0_0_15px_rgba(0,210,255,0.2)]">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>🕹️ EXPLORE SANDBOX</span>
            </div>
            <span className="text-xs text-on-surface-variant hidden md:inline">
              Interactive Cluster Fleet &amp; Declarative GitOps
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-on-surface-variant text-[10px] uppercase">Pods</span>
              <span className="text-white font-bold">{totalPods} Running</span>
            </div>
            <div className="flex flex-col">
              <span className="text-on-surface-variant text-[10px] uppercase">Nodes</span>
              <span className="text-white font-bold">{readyCount} / {nodes.length} Ready</span>
            </div>
            <div className="flex flex-col">
              <span className="text-on-surface-variant text-[10px] uppercase">Traffic</span>
              <span className="text-data-flow font-bold">{traffic} req/s</span>
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 tech-border flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-on-surface-variant">Deploy:</span>
            {(Object.keys(appConfig) as AppType[]).map((type) => {
              const conf = appConfig[type];
              const active = selectedType === type;
              return (
                <button key={type} onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded font-mono text-xs transition-all border ${active ? `${conf.bg} ${conf.text} ${conf.border} font-bold` : "border-white/10 bg-surface-container text-on-surface-variant hover:text-white"}`}
                >{conf.label}</button>
              );
            })}
            <button onClick={handleDeploy} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary/20 border border-primary/50 font-mono text-xs font-bold text-primary hover:bg-primary/30 transition-all">
              <span>+</span> Deploy {appConfig[selectedType].label}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-surface-container p-2.5 rounded-lg border border-white/5 flex flex-col gap-1 min-w-[180px]">
              <div className="flex justify-between font-mono text-[10px] text-on-surface-variant">
                <span>Ingress Traffic</span>
                <span className="text-data-flow font-bold">{traffic} req/s</span>
              </div>
              <input type="range" min="1" max="100" value={traffic} onChange={(e) => setTraffic(Number(e.target.value))} className="w-full" />
            </div>

            <button
              onClick={() => setShowYamlEditor(!showYamlEditor)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all ${
                showYamlEditor
                  ? "bg-cyan text-black border-cyan"
                  : "bg-surface-container border-cyan/40 text-cyan hover:bg-cyan/15"
              }`}
            >
              📄 {showYamlEditor ? "Hide YAML" : "YAML Manifest"}
            </button>
            <button onClick={handleScaleAll} className="px-3 py-1.5 rounded-lg bg-desired-state/10 border border-desired-state/30 text-desired-state font-mono text-xs hover:bg-desired-state/20 transition-colors" title="Deploy one of each type">
              Scale All
            </button>
            <button onClick={handleChaos} className="px-3 py-1.5 rounded-lg bg-error-pulse/10 border border-error-pulse/30 text-error-pulse font-mono text-xs hover:bg-error-pulse/20 transition-colors">
              ⚡ Chaos
            </button>
            <button onClick={handleReset} className="px-3 py-1.5 rounded-lg bg-surface-container border border-white/10 text-on-surface-variant font-mono text-xs hover:text-white hover:border-white/20 transition-colors">
              Reset ↺
            </button>
          </div>
        </div>

        {/* ══════════ EXPANDABLE LIVE YAML MANIFEST EDITOR ══════════ */}
        {showYamlEditor && (
          <div className="glass-panel rounded-2xl p-6 border border-cyan/40 tech-border space-y-4 animate-scaleIn shadow-[0_0_25px_rgba(0,210,255,0.15)]">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <span className="font-mono text-xs text-cyan font-bold uppercase">Declarative GitOps Editor</span>
                <h3 className="font-display text-lg font-bold text-white mt-0.5">Deployment Manifest (deployment.yaml)</h3>
              </div>
              <button
                onClick={() => {
                  handleScaleAll();
                  addLog("GitOps: Applied deployment.yaml via kubectl apply -f. 4 replicas synced.", "success");
                }}
                className="px-4 py-2 rounded-lg bg-cyan text-black font-mono text-xs font-bold uppercase hover:bg-cyan/80 transition-all shadow-[0_0_15px_rgba(0,210,255,0.3)]"
              >
                ▶ Apply Manifest (`kubectl apply -f`)
              </button>
            </div>

            <textarea
              value={yamlContent}
              onChange={(e) => setYamlContent(e.target.value)}
              rows={12}
              className="w-full rounded-xl bg-black/80 border border-white/10 p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-cyan"
            />
          </div>
        )}

        {/* ══════════ UNIFIED SANDBOX CANVAS ══════════ */}
        <div ref={canvasRef} className="glass-panel rounded-2xl border border-white/10 tech-border relative overflow-hidden min-h-[200px]">
          <div className="scan-line" />

          {/* SVG Connection Lines — Load Balancer to each Worker Node */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <filter id="lb-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {lines.map((line) => {
              const node = nodes.find((n) => n.id === line.nodeId);
              const isOffline = node?.status === "offline";
              return (
                <g key={line.nodeId}>
                  <line
                    x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                    stroke={isOffline ? "#ff005c" : "#00d2ff"}
                    strokeWidth={isOffline ? "1" : "1.5"}
                    strokeOpacity={isOffline ? 0.2 : 0.45}
                    strokeDasharray={isOffline ? "4 4" : undefined}
                    filter={isOffline ? undefined : "url(#lb-glow)"}
                  />
                  {!isOffline && (
                    <circle r="3" fill="#00ffc2" opacity="0.85">
                      <animateMotion
                        dur={`${Math.max(0.6, 2.5 - traffic * 0.02)}s`}
                        repeatCount="indefinite"
                        path={`M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}`}
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Canvas Content */}
          <div className="relative z-10 p-6 sm:p-8 flex flex-col items-center gap-8">
            {/* Top Load Balancer / Ingress Node */}
            <div ref={lbRef} className="glass-panel rounded-2xl px-6 py-3 border border-primary/50 flex items-center gap-3 shadow-[0_0_25px_rgba(0,210,255,0.25)]">
              <span className="text-xl">🌐</span>
              <div className="font-mono text-xs">
                <span className="text-primary font-bold">K8s Ingress Controller</span>
                <span className="text-on-surface-variant text-[10px] block">Round-Robin Traffic Dispatcher</span>
              </div>
              <span className="font-mono text-xs text-data-flow font-bold ml-2 bg-primary/10 px-2 py-0.5 rounded border border-primary/30">
                {traffic} req/s
              </span>
            </div>

            {/* Worker Nodes Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nodes.map((node) => {
                const isOffline = node.status === "offline";
                const isFlashing = flashNodes[node.id];
                const cpuUsage = Math.min(100, node.pods.length * 25);
                return (
                  <div
                    key={node.id}
                    ref={(el) => { nodeRefs.current[node.id] = el; }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, node.id)}
                    className={`rounded-2xl p-5 border transition-all duration-300 relative ${
                      isOffline
                        ? "border-error-pulse/40 bg-error-pulse/5 opacity-60"
                        : isFlashing
                        ? "border-primary bg-primary/15 shadow-[0_0_30px_rgba(0,210,255,0.4)]"
                        : "glass-panel border-white/10 hover:border-white/20"
                    }`}
                  >
                    {/* Node Header */}
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="font-mono text-xs font-bold text-white flex items-center gap-2">
                          <span>{node.id}</span>
                          <span className="text-[10px] text-on-surface-variant font-normal">({node.name})</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleNode(node.id)}
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                          isOffline
                            ? "bg-error-pulse/20 text-error-pulse border-error-pulse/40 hover:bg-error-pulse/30"
                            : "bg-success-glow/15 text-success-glow border-success-glow/30 hover:bg-error-pulse/15 hover:text-error-pulse hover:border-error-pulse/30"
                        }`}
                        title={isOffline ? "Click to recover node" : "Click to simulate node failure"}
                      >
                        {isOffline ? "✕ NotReady (Click to Recover)" : "● Ready"}
                      </button>
                    </div>

                    {/* Metrics Bar */}
                    <div className="space-y-1 mb-4 font-mono text-[10px]">
                      <div className="flex justify-between text-on-surface-variant">
                        <span>CPU Allocation</span>
                        <span>{cpuUsage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            cpuUsage > 80 ? "bg-error-pulse" : cpuUsage > 50 ? "bg-amber-400" : "bg-primary"
                          }`}
                          style={{ width: `${cpuUsage}%` }}
                        />
                      </div>
                    </div>

                    {/* Pods Container */}
                    <div className="min-h-[110px] rounded-xl bg-black/40 border border-white/5 p-3 flex flex-wrap gap-2 content-start">
                      {node.pods.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-on-surface-variant py-6">
                          {isOffline ? "Node Offline" : "Drop Pods Here"}
                        </div>
                      ) : (
                        node.pods.map((pod) => {
                          const conf = appConfig[pod.type];
                          return (
                            <div
                              key={pod.id}
                              draggable={!isOffline}
                              onDragStart={(e) => handleDragStart(e, pod.id, node.id)}
                              className={`group/pod cursor-grab active:cursor-grabbing px-2.5 py-1 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-all ${conf.bg} ${conf.border} ${conf.text} hover:scale-105`}
                              title="Drag to move pod"
                            >
                              <span className="text-[10px] font-bold">{pod.id}</span>
                              <button
                                onClick={(e) => handleKillPod(node.id, pod.id, e)}
                                className="opacity-40 group-hover/pod:opacity-100 hover:text-error-pulse transition-opacity text-[10px] ml-1"
                                title="Kill Pod"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Logs Terminal */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 tech-border font-mono text-xs space-y-2">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span>CLUSTER TELEMETRY EVENT LOG</span>
            </span>
            <button
              onClick={() => setLogs([])}
              className="text-[10px] text-on-surface-variant hover:text-white transition-colors"
            >
              Clear Logs
            </button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                <span className="text-on-surface-variant text-[10px] select-none">{log.time}</span>
                <span
                  className={
                    log.type === "success"
                      ? "text-success-glow"
                      : log.type === "error"
                      ? "text-error-pulse"
                      : log.type === "warn"
                      ? "text-amber-400"
                      : "text-primary"
                  }
                >
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-white/10 pt-8 flex justify-between items-center font-mono text-xs">
          <Link
            href="/topology"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container border border-white/10 text-on-surface-variant hover:text-white hover:border-white/30 transition-all module-nav-card"
          >
            <span>←</span>
            <span>Module 05 Topology</span>
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 hover:border-primary transition-all font-bold module-nav-card shadow-[0_0_15px_rgba(0,210,255,0.2)]"
          >
            <span>Restart Odyssey</span>
            <span>↺</span>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
