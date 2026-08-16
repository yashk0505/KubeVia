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

interface Challenge {
  id: number;
  title: string;
  description: string;
  xp: number;
  tasks: { id: string; text: string; completed: boolean }[];
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
  const [mode, setMode] = useState<"explore" | "challenges">("explore");
  const [nodes, setNodes] = useState<PlaygroundNode[]>(initialNodes);
  const [selectedType, setSelectedType] = useState<AppType>("web");
  const [traffic, setTraffic] = useState(20);
  const [logs, setLogs] = useState<Array<{ text: string; type: "info" | "success" | "warn" | "error"; time: string }>>([
    { text: "KubeVia Sandbox Engine Initialized.", type: "info", time: "00:00:00" },
    { text: "6 Nodes discovered. Status: Ready.", type: "success", time: "00:00:01" },
    { text: "Awaiting deployment instructions...", type: "info", time: "00:00:02" },
  ]);
  const [flashNodes, setFlashNodes] = useState<Record<string, boolean>>({});

  // Challenge System State
  const [currentChallengeId, setCurrentChallengeId] = useState(1);
  const [userXp, setUserXp] = useState(250);
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
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 1,
      title: "Mission 1: High Availability Deployment",
      description: "Deploy multiple web pods and verify self-healing when a node fails.",
      xp: 100,
      tasks: [
        { id: "t1", text: "Deploy at least 4 total Pods across the cluster", completed: false },
        { id: "t2", text: "Trigger Chaos to simulate node failure", completed: false },
        { id: "t3", text: "Observe automatic self-healing pod rescheduling", completed: false },
      ],
    },
    {
      id: 2,
      title: "Mission 2: Traffic Surge & Autoscale",
      description: "Scale ingress traffic to trigger Horizontal Pod Autoscaler (HPA).",
      xp: 150,
      tasks: [
        { id: "t2_1", text: "Increase Ingress Traffic slider above 70 req/s", completed: false },
        { id: "t2_2", text: "Wait for HPA to automatically spawn web pods", completed: false },
      ],
    },
    {
      id: 3,
      title: "Mission 3: Full Fleet Diversity",
      description: "Deploy all 5 distinct workload types into the runtime.",
      xp: 200,
      tasks: [
        { id: "t3_1", text: "Click 'Scale All' to deploy Web, API, Worker, Cache, and DB", completed: false },
        { id: "t3_2", text: "Maintain all 6 worker nodes in Ready status", completed: false },
      ],
    },
    {
      id: 4,
      title: "Mission 4: Node Maintenance & Drain",
      description: "Take down a node for maintenance and migrate all pods safely.",
      xp: 250,
      tasks: [
        { id: "t4_1", text: "Click status on Node-A to trigger node outage", completed: false },
        { id: "t4_2", text: "Restore Node-A back to Ready status", completed: false },
      ],
    },
    {
      id: 5,
      title: "Mission 5: Declarative YAML GitOps",
      description: "Apply a custom manifest directly into the cluster runtime.",
      xp: 300,
      tasks: [
        { id: "t5_1", text: "Open the YAML Manifest Editor", completed: false },
        { id: "t5_2", text: "Click 'Apply Manifest (kubectl apply -f)'", completed: false },
      ],
    },
  ]);

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
        const ny = nodeRect.top - canvasRect.top + 4;
        newLines.push({ x1: lx, y1: ly + lbRect.height / 2, x2: nx, y2: ny, nodeId: node.id });
      });
      setLines(newLines);
    };
    updateLines();
    window.addEventListener("resize", updateLines);
    const t = setTimeout(updateLines, 100);
    return () => { window.removeEventListener("resize", updateLines); clearTimeout(t); };
  }, [nodes.length]);

  // Periodic heartbeat pulse
  useEffect(() => {
    const interval = setInterval(() => {
      const readyNodes = nodes.filter((n) => n.status === "ready");
      if (readyNodes.length > 0) {
        const target = readyNodes[Math.floor(Math.random() * readyNodes.length)];
        flashNode(target.id);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [nodes]);

  // Challenge task verification observer
  useEffect(() => {
    const totalPods = nodes.flatMap((n) => n.pods).length;
    const hasAllTypes = ["web", "api", "worker", "cache", "db"].every((t) =>
      nodes.some((n) => n.pods.some((p) => p.type === t))
    );
    const allReady = nodes.every((n) => n.status === "ready");

    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === 1) {
          const updated = [...c.tasks];
          if (totalPods >= 4) updated[0].completed = true;
          return { ...c, tasks: updated };
        }
        if (c.id === 2) {
          const updated = [...c.tasks];
          if (traffic > 70) updated[0].completed = true;
          if (traffic > 70 && totalPods > 5) updated[1].completed = true;
          return { ...c, tasks: updated };
        }
        if (c.id === 3) {
          const updated = [...c.tasks];
          if (hasAllTypes) updated[0].completed = true;
          if (allReady && hasAllTypes) updated[1].completed = true;
          return { ...c, tasks: updated };
        }
        return c;
      })
    );
  }, [nodes, traffic]);

  const flashNode = (nodeId: string) => {
    setFlashNodes((prev) => ({ ...prev, [nodeId]: true }));
    setTimeout(() => setFlashNodes((prev) => ({ ...prev, [nodeId]: false })), 700);
  };

  const findBestNode = (nodeList: PlaygroundNode[]) => {
    const healthy = nodeList.filter((n) => n.status === "ready");
    if (healthy.length === 0) return null;
    return healthy.reduce((prev, curr) => (prev.pods.length < curr.pods.length ? prev : curr));
  };

  const handleDeploy = () => {
    const bestNode = findBestNode(nodes);
    if (!bestNode) { addLog("Scheduler: No Ready nodes available.", "error"); return; }
    const podId = `${selectedType}-${Math.random().toString(36).substring(2, 6)}`;
    setNodes((prev) => prev.map((n) => (n.id === bestNode.id ? { ...n, pods: [...n.pods, { id: podId, type: selectedType }] } : n)));
    addLog(`Scheduler: Placed ${podId} → ${bestNode.id} (LeastAllocated)`, "success");
    flashNode(bestNode.id);
  };

  const handleDeletePod = (nodeId: string, podId: string) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, pods: n.pods.filter((p) => p.id !== podId) } : n)));
    addLog(`Kubelet: Terminated pod ${podId} on ${nodeId}`, "warn");
  };

  const handleToggleNode = (nodeId: string) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;
    if (target.status === "ready") {
      const movingPods = [...target.pods];
      addLog(`NodeController: ${nodeId} → NotReady (Failure Simulated)`, "error");
      
      // Update challenge 1 task
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === 1 ? { ...c, tasks: c.tasks.map((t, idx) => (idx === 1 ? { ...t, completed: true } : t)) } : c
        )
      );

      setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, status: "offline", pods: [] } : n)));
      if (movingPods.length > 0) {
        addLog(`EvictionManager: Evicting ${movingPods.length} pods from ${nodeId}...`, "warn");
        setTimeout(() => {
          setNodes((currentNodes) => {
            let rescheduledCount = 0;
            const updated = currentNodes.map((node) => ({ ...node, pods: [...node.pods] }));
            movingPods.forEach((pod) => {
              const best = findBestNode(updated);
              if (best) { best.pods.push(pod); rescheduledCount++; flashNode(best.id); }
            });
            if (rescheduledCount > 0) {
              addLog(`Scheduler: Self-healed ${rescheduledCount} pods to healthy nodes.`, "success");
              setChallenges((ch) =>
                ch.map((c) =>
                  c.id === 1 ? { ...c, tasks: c.tasks.map((t, idx) => (idx === 2 ? { ...t, completed: true } : t)) } : c
                )
              );
            } else {
              addLog("Scheduler: Failed to reschedule pods. Cluster full.", "error");
            }
            return updated;
          });
        }, 1200);
      }
    } else {
      setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, status: "ready" } : n)));
      addLog(`NodeController: ${nodeId} rejoined cluster. Status: Ready`, "success");
      flashNode(nodeId);
    }
  };

  // Chaos: kill random node
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
      const { podId, fromNodeId } = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (fromNodeId === toNodeId) return;
      const targetNode = nodes.find((n) => n.id === toNodeId);
      if (!targetNode || targetNode.status !== "ready") { addLog(`Scheduler: Cannot schedule on ${toNodeId} (NotReady)`, "error"); return; }
      setNodes((prev) => {
        let movedPod: PodItem | undefined;
        const next = prev.map((n) => { if (n.id === fromNodeId) { movedPod = n.pods.find((p) => p.id === podId); return { ...n, pods: n.pods.filter((p) => p.id !== podId) }; } return n; });
        if (movedPod) {
          addLog(`Admin: Migrated ${podId} → ${toNodeId}`, "info");
          flashNode(toNodeId);
          return next.map((n) => (n.id === toNodeId ? { ...n, pods: [...n.pods, movedPod!] } : n));
        }
        return prev;
      });
    } catch { /* ignore */ }
  };

  const handleReset = () => {
    setNodes(initialNodes);
    setTraffic(20);
    addLog("Cluster Admin: Full reset. All namespaces restored.", "warn");
  };

  // Computed stats
  const totalPods = nodes.flatMap((n) => n.pods).length;
  const readyCount = nodes.filter((n) => n.status === "ready").length;
  const avgCpu = nodes.length ? Math.floor(nodes.reduce((acc, n) => acc + (n.status === "ready" ? Math.min(100, (n.pods.length / 8) * 100) : 0), 0) / nodes.length) : 0;

  const currentChallenge = challenges.find((c) => c.id === currentChallengeId) || challenges[0];

  return (
    <main className="min-h-screen bg-[#050608] text-[#e2e2e8] overflow-x-hidden">
      <Nav />

      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-6">
        {/* Mode Selector & Summary Bar */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 tech-border flex flex-wrap gap-4 items-center justify-between font-mono text-sm">
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-container p-1 rounded-xl border border-white/10 font-mono text-xs">
              <button
                onClick={() => setMode("explore")}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  mode === "explore"
                    ? "bg-primary text-black font-bold shadow-[0_0_12px_rgba(0,210,255,0.4)]"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                🕹️ Explore Sandbox
              </button>
              <button
                onClick={() => setMode("challenges")}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  mode === "challenges"
                    ? "bg-desired-state text-white font-bold shadow-[0_0_12px_rgba(189,0,255,0.4)]"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                🏆 Guided Challenges
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-desired-state/15 border border-desired-state/30 text-desired-state text-xs font-bold">
              <span>⭐</span>
              <span>{userXp} XP EARNED</span>
            </div>
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

        {/* ══════════ CHALLENGES HUD (If in Challenges Mode) ══════════ */}
        {mode === "challenges" && (
          <div className="glass-panel rounded-2xl p-6 border border-desired-state/40 tech-border space-y-4 animate-fadeIn shadow-[0_0_25px_rgba(189,0,255,0.15)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="text-desired-state font-mono text-xs font-bold uppercase tracking-wide">
                  ACTIVE CHALLENGE MISSION
                </div>
                <h2 className="font-display text-xl font-bold text-white mt-0.5">
                  {currentChallenge.title}
                </h2>
                <p className="font-sans text-xs text-on-surface-variant mt-1">
                  {currentChallenge.description}
                </p>
              </div>

              {/* Challenge Selector */}
              <div className="flex gap-2 font-mono text-xs">
                {challenges.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCurrentChallengeId(c.id)}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${
                      currentChallengeId === c.id
                        ? "bg-desired-state/20 border-desired-state text-desired-state font-bold shadow-[0_0_12px_rgba(189,0,255,0.3)]"
                        : "bg-surface-container border-white/10 text-on-surface-variant hover:text-white"
                    }`}
                  >
                    Mission {c.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentChallenge.tasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border font-mono text-xs flex items-center gap-3 transition-all ${
                    task.completed
                      ? "bg-success-glow/15 border-success-glow text-success-glow shadow-[0_0_15px_rgba(0,255,194,0.2)]"
                      : "bg-black/40 border-white/10 text-on-surface-variant"
                  }`}
                >
                  <span className="text-base">{task.completed ? "✓" : "○"}</span>
                  <span className={task.completed ? "font-bold text-white" : ""}>
                    {idx + 1}. {task.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
              onClick={() => {
                setShowYamlEditor(!showYamlEditor);
                setChallenges((prev) =>
                  prev.map((c) =>
                    c.id === 5 ? { ...c, tasks: c.tasks.map((t, idx) => (idx === 0 ? { ...t, completed: true } : t)) } : c
                  )
                );
              }}
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
                  setChallenges((prev) =>
                    prev.map((c) =>
                      c.id === 5 ? { ...c, tasks: c.tasks.map((t, idx) => (idx === 1 ? { ...t, completed: true } : t)) } : c
                    )
                  );
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
              const isReady = node?.status === "ready";
              const isPulsing = flashNodes[line.nodeId];
              const hasPods = (node?.pods.length || 0) > 0;
              const strokeColor = !isReady ? "#FF005C" : "#00D2FF";
              const particleSpeed = Math.max(0.8, 3 - traffic / 40);

              return (
                <g key={line.nodeId}>
                  {/* Base connection line */}
                  <line
                    x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                    stroke={strokeColor}
                    strokeWidth={isPulsing ? 2.5 : 1}
                    strokeOpacity={isPulsing ? 0.9 : !isReady ? 0.2 : hasPods ? 0.4 : 0.15}
                    strokeDasharray={!isReady ? "6 6" : "4 4"}
                    style={{ transition: "all 0.3s" }}
                  >
                    {isReady && (
                      <animate attributeName="stroke-dashoffset" from="16" to="0" dur={`${particleSpeed}s`} repeatCount="indefinite" />
                    )}
                  </line>

                  {/* Traffic particle flowing down (LB → Node) */}
                  {isReady && hasPods && (
                    <circle r={isPulsing ? 5 : 3} fill={strokeColor} opacity={isPulsing ? 1 : 0.6} filter={isPulsing ? "url(#lb-glow)" : undefined}>
                      <animateMotion dur={`${particleSpeed}s`} repeatCount="indefinite" path={`M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}`} />
                    </circle>
                  )}

                  {/* Response particle flowing up (Node → LB) */}
                  {isReady && hasPods && (
                    <circle r="2" fill="#00FFC2" opacity="0.35">
                      <animateMotion dur={`${particleSpeed + 1}s`} repeatCount="indefinite" path={`M ${line.x2} ${line.y2} L ${line.x1} ${line.y1}`} />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* ── LOAD BALANCER HUB ── */}
          <div className="flex justify-center pt-6 pb-3 relative z-10">
            <div ref={lbRef} className="relative">
              <div className="relative w-32 h-32 rounded-full border border-data-flow/30 bg-[#0d0f14] flex items-center justify-center shadow-[0_0_35px_rgba(0,210,255,0.15)]">
                <div className="absolute inset-0 rounded-full border border-data-flow/15 animate-[ping_4s_ease-in-out_infinite]" />
                <div className="text-center z-10">
                  <div className="font-mono text-xs text-data-flow font-bold tracking-wider">INGRESS</div>
                  <div className="font-mono text-[10px] text-on-surface-variant">LOAD BALANCER</div>
                  <div className="font-mono text-[10px] text-data-flow mt-1">{traffic} req/s</div>
                </div>

                {/* Satellite badges */}
                <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high border border-success-glow/40 font-mono text-[8px] font-bold text-success-glow shadow-[0_0_8px_rgba(0,255,194,0.3)]">
                  L4
                </div>
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high border border-primary/40 font-mono text-[8px] font-bold text-primary shadow-[0_0_8px_rgba(165,231,255,0.3)]">
                  L7
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high border border-desired-state/40 font-mono text-[8px] font-bold text-desired-state shadow-[0_0_8px_rgba(189,0,255,0.3)]">
                  TLS
                </div>
              </div>
            </div>
          </div>

          {/* ── WORKER NODES ── */}
          <div className="px-5 pb-5 pt-3 relative z-10">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="font-mono text-xs text-primary font-bold">WORKER FLEET</span>
              <div className="flex gap-2">
                {(Object.entries(appConfig) as [AppType, typeof appConfig[AppType]][]).map(([type, conf]) => (
                  <div key={type} className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${conf.bg.replace("/20", "")}`} />
                    <span className="font-mono text-[9px] uppercase text-on-surface-variant">{conf.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nodes.map((node) => {
                const maxPods = 8;
                const cpuUsage = node.status === "ready" ? Math.min(100, (node.pods.length / maxPods) * 100) : 0;
                const memUsage = node.status === "ready" ? Math.min(100, (node.pods.length / maxPods) * 80 + 10) : 0;
                const isOffline = node.status === "offline";
                const isPulsing = flashNodes[node.id];
                const cpuWarning = cpuUsage > 75;

                return (
                  <div
                    key={node.id}
                    ref={(el) => { nodeRefs.current[node.id] = el; }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, node.id)}
                    className={`glass-panel relative rounded-xl p-4 border flex flex-col gap-2.5 min-h-[220px] transition-all duration-300 overflow-hidden ${
                      isOffline ? "border-error-pulse/40 opacity-75" :
                      isPulsing ? "border-data-flow/60 shadow-[0_0_15px_rgba(0,210,255,0.15)]" :
                      "border-white/10 hover:border-white/20"
                    }`}
                  >
                    {/* Offline overlay */}
                    {isOffline && (
                      <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,0,92,0.2) 10px, rgba(255,0,92,0.2) 20px)" }} />
                    )}

                    {/* Heartbeat flash */}
                    {isPulsing && <div className="absolute inset-0 bg-data-flow/5 pointer-events-none animate-pulse rounded-xl" />}

                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <div className="font-mono text-xs font-bold text-primary">{node.id}</div>
                        <div className="font-mono text-[10px] text-on-surface-variant">{node.name}</div>
                      </div>
                      <button onClick={() => handleToggleNode(node.id)}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container border border-white/5 hover:border-white/20 transition-colors font-mono text-[10px]"
                      >
                        <span className={`h-2 w-2 rounded-full ${isOffline ? "bg-error-pulse" : "bg-success-glow pulse-dot"}`} />
                        <span className={isOffline ? "text-error-pulse" : "text-success-glow"}>{isOffline ? "NotReady" : "Ready"}</span>
                      </button>
                    </div>

                    {/* CPU / MEM */}
                    <div className="space-y-1 font-mono text-[10px] text-on-surface-variant relative z-10">
                      <div className="flex justify-between">
                        <span>CPU</span>
                        <span className={cpuWarning ? "text-error-pulse" : ""}>{cpuUsage.toFixed(0)}%</span>
                      </div>
                      <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 rounded-full ${cpuWarning ? "bg-error-pulse" : "bg-primary"}`} style={{ width: `${cpuUsage}%` }} />
                      </div>
                      <div className="flex justify-between pt-0.5">
                        <span>MEM</span>
                        <span>{memUsage.toFixed(0)}%</span>
                      </div>
                      <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-secondary transition-all duration-300 rounded-full" style={{ width: `${memUsage}%` }} />
                      </div>
                    </div>

                    {/* Pods (Dropzone) */}
                    <div className="flex-1 rounded bg-black/40 border border-dashed border-white/10 p-2 overflow-y-auto flex flex-wrap content-start gap-1.5 relative z-10 min-h-[60px]">
                      {node.pods.map((pod) => {
                        const conf = appConfig[pod.type] || appConfig.web;
                        return (
                          <div key={pod.id} draggable onDragStart={(e) => handleDragStart(e, pod.id, node.id)}
                            className={`${conf.bg} ${conf.border} border rounded px-2 py-0.5 flex items-center justify-between gap-1 w-[calc(50%-0.25rem)] group cursor-grab active:cursor-grabbing`}
                          >
                            <span className={`font-mono text-[9px] font-bold ${conf.text} truncate`}>{pod.id}</span>
                            <button onClick={() => handleDeletePod(node.id, pod.id)} className="opacity-0 group-hover:opacity-100 text-error-pulse hover:text-white text-[10px] transition-opacity">✕</button>
                          </div>
                        );
                      })}
                      {node.pods.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-white/20 pointer-events-none">Drop Pods Here</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Event Stream */}
        <div className="glass-panel rounded-2xl border border-white/10 flex flex-col max-h-[280px] overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface-bright/20 shrink-0">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-primary">
              <span>⚡</span><span>CLUSTER EVENT STREAM</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
          </div>
          <div className="flex-1 p-4 font-mono text-[11px] leading-5 overflow-y-auto terminal-scroll space-y-1 bg-black/50">
            {logs.map((item, idx) => {
              let color = "text-on-surface-variant";
              if (item.type === "success") color = "text-success-glow";
              if (item.type === "warn") color = "text-amber-400";
              if (item.type === "error") color = "text-error-pulse";
              if (item.type === "info") color = "text-primary";
              return (
                <div key={idx} className={color}>
                  <span className="opacity-40">[{item.time}]</span> {item.text}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Module Navigation */}
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 hover:border-primary transition-all font-bold module-nav-card shadow-[0_0_15px_rgba(0,210,255,0.25)]"
          >
            <span>Restart Journey: Explore</span>
            <span>↺</span>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
