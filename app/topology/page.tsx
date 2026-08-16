"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type PodType = "web" | "api" | "worker" | "cache" | "db";

interface Pod {
  id: string;
  type: PodType;
  name: string;
  failed?: boolean;
  draining?: boolean;
}

interface TopologyNode {
  id: string;
  name: string;
  role: "worker";
  status: "Ready" | "Cordoned" | "NotReady";
  draining?: boolean;
  pods: Pod[];
}

type LogType = "info" | "success" | "warning" | "error";

interface LogMessage {
  id: number;
  text: string;
  type: LogType;
}

const POD_COLORS: Record<PodType, string> = {
  web: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  api: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  worker: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  cache: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
  db: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const initialWorkerNodes: TopologyNode[] = [
  {
    id: "node-1", name: "worker-alpha", role: "worker", status: "Ready",
    pods: [
      { id: "p1", name: "web-pod-1", type: "web" },
      { id: "p2", name: "api-pod-1", type: "api" },
    ],
  },
  {
    id: "node-2", name: "worker-beta", role: "worker", status: "Ready",
    pods: [
      { id: "p3", name: "db-pod-1", type: "db" },
      { id: "p4", name: "cache-pod-1", type: "cache" },
    ],
  },
  {
    id: "node-3", name: "worker-gamma", role: "worker", status: "Ready",
    pods: [{ id: "p5", name: "worker-pod-1", type: "worker" }],
  },
];

let podCounter = 6;
let nodeCounter = 4;
let logIdCounter = 1;

export default function TopologyPage() {
  const [nodes, setNodes] = useState<TopologyNode[]>(initialWorkerNodes);
  const [topologyTab, setTopologyTab] = useState<"map" | "app" | "etcd" | "affinity" | "usecases">("map");
  const [taintNode, setTaintNode] = useState<string>("node-1");
  const [selectedTaint, setSelectedTaint] = useState<string>("gpu=true:NoSchedule");
  const [podToleration, setPodToleration] = useState<boolean>(false);
  const [affinityResult, setAffinityResult] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>([
    { id: 0, text: "[Topology] Cluster initialized: 1 Control Plane + 3 Workers", type: "info" },
  ]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeDeployNode, setActiveDeployNode] = useState<string | null>(null);
  const [heartbeatPulse, setHeartbeatPulse] = useState<Record<string, boolean>>({});
  const canvasRef = useRef<HTMLDivElement>(null);
  const masterRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // SVG line coordinates
  const [lines, setLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number; nodeId: string }>>([]);

  const getNodeMetrics = (node: TopologyNode) => {
    const activePods = node.pods.filter((p) => !p.failed);
    const count = activePods.length;
    if (node.status === "NotReady") return { cpu: 0, mem: 0, warning: false };
    if (count === 0) return { cpu: 2, mem: 5, warning: false };
    const isWarning = count > 5;
    const baseCpu = isWarning ? 82 + (count - 5) * 2 : count * 15;
    const baseMem = isWarning ? 85 + (count - 5) * 1.5 : count * 12;
    return { cpu: Math.min(100, baseCpu), mem: Math.min(100, baseMem), warning: isWarning };
  };

  const addLog = (text: string, type: LogType = "info") => {
    setLogs((prev) => [{ id: logIdCounter++, text, type }, ...prev].slice(0, 12));
  };

  // Recalculate SVG lines when layout changes
  useEffect(() => {
    const updateLines = () => {
      if (!canvasRef.current || !masterRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const masterRect = masterRef.current.getBoundingClientRect();
      const mx = masterRect.left + masterRect.width / 2 - canvasRect.left;
      const my = masterRect.top + masterRect.height / 2 - canvasRect.top;

      const newLines: typeof lines = [];
      nodes.forEach((node) => {
        const el = nodeRefs.current[node.id];
        if (!el) return;
        const nodeRect = el.getBoundingClientRect();
        const nx = nodeRect.left + nodeRect.width / 2 - canvasRect.left;
        const ny = nodeRect.top - canvasRect.top + 4;
        newLines.push({ x1: mx, y1: my + masterRect.height / 2, x2: nx, y2: ny, nodeId: node.id });
      });
      setLines(newLines);
    };

    updateLines();
    window.addEventListener("resize", updateLines);
    const timeout = setTimeout(updateLines, 100);
    return () => {
      window.removeEventListener("resize", updateLines);
      clearTimeout(timeout);
    };
  }, [nodes]);

  // Kubelet Heartbeat simulation — pulse lines and add logs
  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        "[Kubelet] Heartbeat received from worker nodes",
        "[Scheduler] Checking resource allocations across fleet",
        "[Controller] Syncing desired deployment states",
        "[Kube-Proxy] Syncing IPVS rules on worker fleet",
        "[API Server] Watch event dispatched to controllers",
        "[etcd] Key-value sync complete (cluster healthy)",
      ];
      const types: LogType[] = ["info", "success"];
      addLog(messages[Math.floor(Math.random() * messages.length)], types[Math.floor(Math.random() * types.length)]);

      // Pulse random heartbeat lines
      const readyNodes = nodes.filter((n) => n.status === "Ready");
      if (readyNodes.length > 0) {
        const target = readyNodes[Math.floor(Math.random() * readyNodes.length)];
        setHeartbeatPulse((prev) => ({ ...prev, [target.id]: true }));
        setTimeout(() => setHeartbeatPulse((prev) => ({ ...prev, [target.id]: false })), 800);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [nodes]);

  const handleAddNode = () => {
    const newNode: TopologyNode = {
      id: `node-${nodeCounter}`, name: `worker-delta-${nodeCounter}`, role: "worker", status: "Ready", pods: [],
    };
    nodeCounter++;
    setNodes((prev) => [...prev, newNode]);
    addLog(`[NodeController] Provisioned new worker: ${newNode.name}`, "success");
    setTimeout(() => {
      // Force re-calculate lines
      setNodes((p) => [...p]);
    }, 50);
  };

  const handleRemoveNode = (nodeId: string) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;
    if (targetNode.pods.length > 0) {
      handleDrainNode(nodeId, () => {
        setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        addLog(`[NodeController] Removed ${targetNode.name} from cluster`, "warning");
      });
    } else {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      addLog(`[NodeController] Removed ${targetNode.name} from cluster`, "warning");
    }
  };

  const handleToggleCordon = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const isCurrentlyCordoned = n.status === "Cordoned";
          const nextStatus = isCurrentlyCordoned ? "Ready" : "Cordoned";
          if (nextStatus === "Cordoned") {
            addLog(
              `[kubectl] node/${n.name} cordoned. Existing pods (${n.pods.length}) remain running; new pod scheduling is blocked.`,
              "warning"
            );
          } else {
            addLog(
              `[kubectl] node/${n.name} uncordoned. Node is Ready for new workload scheduling.`,
              "success"
            );
          }
          return { ...n, status: nextStatus, draining: false };
        }
        return n;
      })
    );
  };

  const handleDrainNode = (nodeId: string, callback?: () => void) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) { callback?.(); return; }

    if (targetNode.pods.length === 0) {
      setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, status: "Cordoned" } : n)));
      addLog(`[kubectl] node/${targetNode.name} is already empty (0 pods). Marked as Cordoned.`, "info");
      callback?.();
      return;
    }

    const availableNodes = nodes.filter((n) => n.id !== nodeId && n.status === "Ready");
    if (availableNodes.length === 0) {
      addLog(
        `[Scheduler] Cannot drain ${targetNode.name}: No other Ready nodes available to receive evicted pods!`,
        "error"
      );
      return;
    }

    addLog(
      `[kubectl] Draining node/${targetNode.name}: Cordoning node & evicting ${targetNode.pods.length} pods...`,
      "warning"
    );

    // Step 1: Cordon the node immediately + set draining state on node and its pods
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              status: "Cordoned",
              draining: true,
              pods: n.pods.map((p) => ({ ...p, draining: true })),
            }
          : n
      )
    );

    // Flash the draining node's connection line
    setHeartbeatPulse((prev) => ({ ...prev, [nodeId]: true }));

    // Step 2: Evict and re-schedule after smooth animation delay
    setTimeout(() => {
      setNodes((prev) => {
        const currentTarget = prev.find((n) => n.id === nodeId);
        const movingPods = currentTarget?.pods.map((p) => ({ ...p, draining: false, id: `p${podCounter++}` })) || [];
        let newNodes = prev.map((n) => (n.id === nodeId ? { ...n, pods: [], draining: false } : n));
        const availIds = availableNodes.map((n) => n.id);

        movingPods.forEach((pod, idx) => {
          const destId = availIds[idx % availIds.length];
          newNodes = newNodes.map((n) => (n.id === destId ? { ...n, pods: [...n.pods, pod] } : n));
          // Flash receiving nodes
          setHeartbeatPulse((hp) => ({ ...hp, [destId]: true }));
        });
        return newNodes;
      });

      addLog(`[Scheduler] Evicted pods successfully rescheduled onto healthy worker nodes.`, "success");
      addLog(`[NodeController] node/${targetNode.name} fully drained (0 pods). Status: Cordoned.`, "info");
      setTimeout(() => setHeartbeatPulse({}), 1000);
      callback?.();
    }, 1200);
  };

  const handleDeployPod = (nodeId: string, podType: PodType) => {
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode || targetNode.status !== "Ready") {
      addLog(`[Scheduler] Cannot deploy to ${targetNode?.name} — ${targetNode?.status}`, "error");
      return;
    }
    const newPod: Pod = { id: `p${podCounter++}`, type: podType, name: `${podType}-pod-${Math.floor(Math.random() * 1000)}` };
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, pods: [...n.pods, newPod] } : n)));
    addLog(`[Kubelet] Deployed ${newPod.name} → ${targetNode.name}`, "success");

    // Flash heartbeat on deployment
    setHeartbeatPulse((prev) => ({ ...prev, [nodeId]: true }));
    setTimeout(() => setHeartbeatPulse((prev) => ({ ...prev, [nodeId]: false })), 800);
  };

  const handleKillPod = (nodeId: string, podId: string) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, pods: n.pods.filter((p) => p.id !== podId) } : n)));
    addLog(`[Kubelet] Terminated pod ${podId}`, "warning");
  };

  const handleMigratePod = (fromNodeId: string, podId: string) => {
    const fromNode = nodes.find((n) => n.id === fromNodeId);
    const pod = fromNode?.pods.find((p) => p.id === podId);
    if (!fromNode || !pod) return;
    const readyNodes = nodes.filter((n) => n.id !== fromNodeId && n.status === "Ready");
    if (readyNodes.length === 0) { addLog("[Scheduler] No ready nodes for migration", "error"); return; }
    readyNodes.sort((a, b) => a.pods.length - b.pods.length);
    const target = readyNodes[0];
    setNodes((prev) => prev.map((n) => {
      if (n.id === fromNodeId) return { ...n, pods: n.pods.filter((p) => p.id !== podId) };
      if (n.id === target.id) return { ...n, pods: [...n.pods, pod] };
      return n;
    }));
    addLog(`[Scheduler] Migrated ${pod.name} → ${target.name}`, "info");
    setHeartbeatPulse((prev) => ({ ...prev, [fromNodeId]: true, [target.id]: true }));
    setTimeout(() => setHeartbeatPulse((prev) => ({ ...prev, [fromNodeId]: false, [target.id]: false })), 800);
  };

  const simulateFailure = () => {
    const readyNodes = nodes.filter((n) => n.status === "Ready");
    if (readyNodes.length === 0) return;
    const targetNode = readyNodes[Math.floor(Math.random() * readyNodes.length)];
    addLog(`[NodeMonitor] CRITICAL: ${targetNode.name} stopped reporting!`, "error");
    setNodes((prev) => prev.map((n) =>
      n.id === targetNode.id ? { ...n, status: "NotReady", pods: n.pods.map((p) => ({ ...p, failed: true })) } : n
    ));
    setTimeout(() => {
      addLog(`[ControllerManager] Self-healing: rescheduling ${targetNode.name}'s pods`, "warning");
      setNodes((prev) => {
        const currentTarget = prev.find((n) => n.id === targetNode.id);
        const failedPods = currentTarget?.pods.filter((p) => p.failed) || [];
        let newNodes = prev.map((n) => (n.id === targetNode.id ? { ...n, pods: [] } : n));
        const availableNodes = newNodes.filter((n) => n.status === "Ready");
        if (availableNodes.length > 0) {
          const availIds = availableNodes.map((n) => n.id);
          failedPods.forEach((pod, idx) => {
            const destId = availIds[idx % availIds.length];
            newNodes = newNodes.map((n) =>
              n.id === destId ? { ...n, pods: [...n.pods, { ...pod, failed: false, id: `p${podCounter++}` }] } : n
            );
          });
          addLog("[Scheduler] Self-healing complete. Pods rescheduled.", "success");
        } else {
          addLog("[Scheduler] Self-healing failed: No ready nodes.", "error");
        }
        return newNodes;
      });
    }, 3000);
  };

  const totalPods = nodes.reduce((acc, n) => acc + n.pods.filter((p) => !p.failed).length, 0);
  const totalCpu = nodes.length ? Math.floor(nodes.reduce((acc, n) => acc + getNodeMetrics(n).cpu, 0) / nodes.length) : 0;
  const totalMem = nodes.length ? Math.floor(nodes.reduce((acc, n) => acc + getNodeMetrics(n).mem, 0) / nodes.length) : 0;
  const onlineNodes = nodes.filter((n) => n.status === "Ready").length;

  return (
    <main className="min-h-screen bg-[#050608] text-[#e2e2e8] overflow-x-hidden">
      <Nav />

      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto space-y-8">
        {/* Summary Bar */}
        <div className="glass-panel rounded-xl p-4 border border-white/10 tech-border flex flex-wrap gap-6 items-center justify-between font-mono text-sm">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-on-surface-variant text-[10px] uppercase">Cluster</span>
              <span className="text-success-glow flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success-glow animate-pulse" />Online
              </span>
            </div>
            <div className="h-8 w-px bg-white/10 hidden md:block" />
            <div className="flex flex-col">
              <span className="text-on-surface-variant text-[10px] uppercase">Pods</span>
              <span className="text-white">{totalPods} Active</span>
            </div>
            <div className="flex flex-col">
              <span className="text-on-surface-variant text-[10px] uppercase">Nodes</span>
              <span className="text-white">{onlineNodes} / {nodes.length} Ready</span>
            </div>
          </div>
          <div className="flex items-center gap-6 flex-1 md:flex-none justify-end">
            <div className="flex flex-col min-w-[100px]">
              <div className="flex justify-between text-[10px] uppercase mb-1">
                <span className="text-on-surface-variant">Avg CPU</span>
                <span className={totalCpu > 80 ? "text-error-pulse" : "text-primary"}>{totalCpu}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${totalCpu > 80 ? "bg-error-pulse" : "bg-primary"}`} style={{ width: `${totalCpu}%` }} />
              </div>
            </div>
            <div className="flex flex-col min-w-[100px]">
              <div className="flex justify-between text-[10px] uppercase mb-1">
                <span className="text-on-surface-variant">Avg Mem</span>
                <span className={totalMem > 80 ? "text-error-pulse" : "text-secondary"}>{totalMem}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${totalMem > 80 ? "bg-error-pulse" : "bg-secondary"}`} style={{ width: `${totalMem}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Header & Tab Controls */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 tech-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-desired-state mb-1">
              <span className="h-2 w-2 rounded-full bg-desired-state animate-pulse" />
              <span>MODULE 05 // CLUSTER TOPOLOGY &amp; CONTROL PLANE</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface">Topology &amp; Control Plane</h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1">
              Live control plane orchestration, etcd Raft state store, taints &amp; tolerations, and worker heartbeat telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Tab Switcher */}
            <div className="flex flex-wrap bg-surface-container p-1 rounded-xl border border-white/10 font-mono text-xs">
              <button
                onClick={() => setTopologyTab("map")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  topologyTab === "map"
                    ? "bg-primary text-black font-bold shadow-[0_0_12px_rgba(0,210,255,0.4)]"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                ◈ Cluster Map
              </button>
              <button
                onClick={() => setTopologyTab("app")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  topologyTab === "app"
                    ? "bg-cyan text-black font-bold shadow-[0_0_12px_rgba(0,210,255,0.4)]"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                📊 App Tiers
              </button>
              <button
                onClick={() => setTopologyTab("etcd")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  topologyTab === "etcd"
                    ? "bg-desired-state text-white font-bold shadow-[0_0_12px_rgba(189,0,255,0.4)]"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                🗄️ etcd Store
              </button>
              <button
                onClick={() => setTopologyTab("affinity")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  topologyTab === "affinity"
                    ? "bg-amber-400 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                🎯 Affinity &amp; Taints
              </button>
              <button
                onClick={() => setTopologyTab("usecases")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  topologyTab === "usecases"
                    ? "bg-success-glow text-black font-bold shadow-[0_0_12px_rgba(0,255,194,0.4)]"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                💡 Usecases
              </button>
            </div>

            {topologyTab === "map" && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const types: PodType[] = ["web", "api", "worker", "cache", "db"];
                    const randomType = types[Math.floor(Math.random() * types.length)];
                    const readyNodes = nodes.filter((n) => n.status === "Ready");
                    if (readyNodes.length === 0) {
                      addLog("[Scheduler] No Ready nodes available", "error");
                      return;
                    }
                    readyNodes.sort((a, b) => a.pods.length - b.pods.length);
                    handleDeployPod(readyNodes[0].id, randomType);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-success-glow/15 border border-success-glow/40 text-success-glow font-mono text-xs font-bold hover:bg-success-glow/25 transition-all shadow-[0_0_12px_rgba(0,255,194,0.2)]"
                >
                  + Quick Deploy
                </button>
                <button onClick={simulateFailure} className="px-3 py-1.5 rounded-lg bg-error-pulse/10 border border-error-pulse/30 text-error-pulse font-mono text-xs hover:bg-error-pulse/20 transition-colors">
                  Chaos
                </button>
                <button onClick={handleAddNode} className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-mono text-xs hover:bg-primary/20 transition-colors">
                  + Node
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ══════════ TAB 2: etcd Key-Value Store Matrix ══════════ */}
        {topologyTab === "etcd" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-desired-state/40 tech-border space-y-6 animate-fadeIn shadow-[0_0_25px_rgba(189,0,255,0.15)]">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-white">etcd v3 Distributed Key-Value Store</h2>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  The single source of truth for the entire cluster. All kubectl commands, scheduler decisions, and pod manifests are committed here via Raft consensus.
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-desired-state/20 border border-desired-state text-desired-state font-mono text-xs font-bold">
                Raft Leader: Active (Port 2379)
              </div>
            </div>

            <div className="rounded-xl bg-black/70 border border-white/10 p-4 font-mono text-xs space-y-3 overflow-x-auto">
              <div className="grid grid-cols-12 gap-2 text-on-surface-variant text-[10px] uppercase font-bold border-b border-white/10 pb-2">
                <div className="col-span-6">etcd Key (Hierarchical Schema)</div>
                <div className="col-span-2">Raft Rev</div>
                <div className="col-span-4">Decoded Value (State)</div>
              </div>

              {nodes.map((node, i) => (
                <div key={node.id} className="grid grid-cols-12 gap-2 text-[11px] py-1 border-b border-white/5 items-center">
                  <div className="col-span-6 text-desired-state truncate">/registry/minions/{node.id}</div>
                  <div className="col-span-2 text-on-surface-variant">rev: {1042 + i}</div>
                  <div className="col-span-4 text-white font-bold truncate">Status: {node.status}, Pods: {node.pods.length}</div>
                </div>
              ))}

              {nodes.flatMap((n) => n.pods).map((pod, i) => (
                <div key={pod.id} className="grid grid-cols-12 gap-2 text-[11px] py-1 border-b border-white/5 items-center">
                  <div className="col-span-6 text-primary truncate">/registry/pods/default/{pod.name}</div>
                  <div className="col-span-2 text-on-surface-variant">rev: {2180 + i}</div>
                  <div className="col-span-4 text-success-glow truncate">&#123; phase: &apos;Running&apos;, type: &apos;{pod.type}&apos; &#125;</div>
                </div>
              ))}

              <div className="grid grid-cols-12 gap-2 text-[11px] py-1 items-center">
                <div className="col-span-6 text-secondary truncate">/registry/services/specs/default/kubernetes</div>
                <div className="col-span-2 text-on-surface-variant">rev: 1001</div>
                <div className="col-span-4 text-cyan truncate">ClusterIP: 10.96.0.1 (TCP:443)</div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ TAB 3: Taints & Affinity Simulator ══════════ */}
        {topologyTab === "affinity" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-amber-400/40 tech-border space-y-6 animate-fadeIn shadow-[0_0_25px_rgba(245,158,11,0.15)]">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Node Taints &amp; Pod Tolerations Engine</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Taints repel pods from nodes. Only pods with matching tolerations are permitted to be scheduled on tainted nodes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-surface-container border border-white/10 space-y-3 font-mono text-xs">
                <div className="text-amber-400 font-bold border-b border-white/10 pb-2">1. Apply Taint to Worker Node</div>
                <div>
                  <label className="text-[10px] text-on-surface-variant block mb-1">Target Node:</label>
                  <select
                    value={taintNode}
                    onChange={(e) => setTaintNode(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-white"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-on-surface-variant block mb-1">Taint Rule:</label>
                  <select
                    value={selectedTaint}
                    onChange={(e) => setSelectedTaint(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-white"
                  >
                    <option value="gpu=true:NoSchedule">gpu=true:NoSchedule (Hard Repel)</option>
                    <option value="disk=ssd:PreferNoSchedule">disk=ssd:PreferNoSchedule (Soft)</option>
                    <option value="node.kubernetes.io/unreachable:NoExecute">node.kubernetes.io/unreachable:NoExecute</option>
                  </select>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-surface-container border border-white/10 space-y-3 font-mono text-xs">
                <div className="text-primary font-bold border-b border-white/10 pb-2">2. Pod Manifest Toleration</div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/10">
                  <span className="text-white">Inject matching toleration into Pod:</span>
                  <button
                    onClick={() => setPodToleration(!podToleration)}
                    className={`px-3 py-1.5 rounded font-bold transition-all ${
                      podToleration
                        ? "bg-success-glow/20 border border-success-glow text-success-glow"
                        : "bg-surface-container border border-white/10 text-on-surface-variant"
                    }`}
                  >
                    {podToleration ? "✓ Toleration Present" : "✕ No Toleration"}
                  </button>
                </div>

                <button
                  onClick={() => {
                    const target = nodes.find((n) => n.id === taintNode);
                    if (!target) return;
                    if (!podToleration) {
                      const fallback = nodes.find((n) => n.id !== taintNode && n.status === "Ready");
                      setAffinityResult(`❌ Blocked on ${target.name}: Taint [${selectedTaint}] repelled pod. Scheduler placed pod on fallback ${fallback?.name || "Pending queue"}.`);
                      addLog(`[Scheduler] Predicate MatchNodeTolerations failed for ${target.name}`, "warning");
                    } else {
                      setAffinityResult(`✓ Success: Pod scheduled on ${target.name}! Toleration satisfied taint [${selectedTaint}].`);
                      addLog(`[Scheduler] Pod placed on tainted node ${target.name} via matching toleration.`, "success");
                    }
                  }}
                  className="w-full py-2.5 rounded-lg bg-amber-400/20 border border-amber-400 text-amber-400 font-bold uppercase hover:bg-amber-400/30 transition-all mt-2"
                >
                  ⚡ Test Schedule Decision
                </button>
              </div>
            </div>

            {affinityResult && (
              <div className="rounded-xl bg-black/70 border border-white/10 p-4 font-mono text-xs text-center animate-scaleIn text-white">
                {affinityResult}
              </div>
            )}
          </div>
        )}

        {/* ══════════ TAB 4: Application Tiers View ══════════ */}
        {topologyTab === "app" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-cyan/40 tech-border space-y-6 animate-fadeIn shadow-[0_0_25px_rgba(0,210,255,0.15)]">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-white">Application Microservice Tiers</h2>
                <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                  Logical topology grouped by service tiers across the cluster, showing dependency call chains and pod counts.
                </p>
              </div>
              <span className="font-mono text-xs text-cyan font-bold">5 Service Tiers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Frontend Web", type: "web", count: nodes.flatMap((n) => n.pods).filter((p) => p.type === "web").length, desc: "Next.js / React SSR ingress target", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
                { name: "Core API Gateway", type: "api", count: nodes.flatMap((n) => n.pods).filter((p) => p.type === "api").length, desc: "REST & GraphQL business layer", color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400" },
                { name: "Background Workers", type: "worker", count: nodes.flatMap((n) => n.pods).filter((p) => p.type === "worker").length, desc: "Async task queue & RabbitMQ consumers", color: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
                { name: "Redis Cache Cluster", type: "cache", count: nodes.flatMap((n) => n.pods).filter((p) => p.type === "cache").length, desc: "In-memory session & query caching", color: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-400" },
                { name: "PostgreSQL Database", type: "db", count: nodes.flatMap((n) => n.pods).filter((p) => p.type === "db").length, desc: "Primary transactional data store", color: "border-purple-500/40 bg-purple-500/10 text-purple-400" },
              ].map((tier) => (
                <div key={tier.name} className={`p-5 rounded-xl border font-mono text-xs space-y-2 ${tier.color}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-white">{tier.name}</span>
                    <span className="px-2 py-0.5 rounded bg-black/40 text-xs font-bold border border-white/10">{tier.count} Pods</span>
                  </div>
                  <p className="font-sans text-[11px] text-on-surface-variant">{tier.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ TAB 5: Real-World Usecases View ══════════ */}
        {topologyTab === "usecases" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <div className="glass-panel p-6 rounded-2xl border border-primary/30 space-y-3">
              <div className="text-2xl">🛠️</div>
              <h3 className="font-display text-lg font-bold text-white">1. Zero-Downtime Host OS Patching</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Operators execute <code>kubectl drain &lt;node&gt;</code> to safely evict all active workloads to healthy nodes before upgrading the Linux kernel or security patches.
              </p>
              <div className="pt-2 font-mono text-[10px] text-primary">
                ✓ Continuous 100% uptime SLA
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-success-glow/30 space-y-3">
              <div className="text-2xl">⚡</div>
              <h3 className="font-display text-lg font-bold text-white">2. Dedicated Hardware GPU Taints</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Taints like <code>nvidia.com/gpu=true:NoSchedule</code> reserve expensive GPU nodes exclusively for AI/LLM inference and prevent web pods from taking up GPU memory.
              </p>
              <div className="pt-2 font-mono text-[10px] text-success-glow">
                ✓ Hardware cost optimization
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-desired-state/30 space-y-3">
              <div className="text-2xl">🌐</div>
              <h3 className="font-display text-lg font-bold text-white">3. Multi-Zone High Availability</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Topology Spread Constraints evenly distribute replicas across AWS availability zones (`us-east-1a`, `us-east-1b`, `us-east-1c`) to survive datacenter power outages.
              </p>
              <div className="pt-2 font-mono text-[10px] text-desired-state">
                ✓ Disaster recovery resilience
              </div>
            </div>
          </div>
        )}

        {/* ══════════ TAB 1: UNIFIED TOPOLOGY CANVAS ══════════ */}
        {topologyTab === "map" && (
        <div ref={canvasRef} className="glass-panel rounded-2xl border border-white/10 tech-border relative overflow-hidden min-h-[200px]">
          <div className="scan-line" />

          {/* SVG Connection Lines — Master to each Worker Node */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <filter id="line-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {lines.map((line) => {
              const node = nodes.find((n) => n.id === line.nodeId);
              const isReady = node?.status === "Ready";
              const isFailed = node?.status === "NotReady";
              const isPulsing = heartbeatPulse[line.nodeId];
              const strokeColor = isFailed ? "#FF005C" : !isReady ? "#F59E0B" : "#A5E7FF";

              return (
                <g key={line.nodeId}>
                  {/* Base line */}
                  <line
                    x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                    stroke={strokeColor}
                    strokeWidth={isPulsing ? 2.5 : 1}
                    strokeOpacity={isPulsing ? 0.9 : isFailed ? 0.3 : 0.35}
                    strokeDasharray={isFailed ? "6 6" : "4 4"}
                    style={{ transition: "all 0.3s" }}
                  >
                    {isReady && (
                      <animate attributeName="stroke-dashoffset" from="16" to="0" dur="2s" repeatCount="indefinite" />
                    )}
                  </line>

                  {/* Moving heartbeat particle on active lines */}
                  {isReady && (
                    <circle r={isPulsing ? 5 : 3} fill={strokeColor} opacity={isPulsing ? 1 : 0.6} filter={isPulsing ? "url(#line-glow)" : undefined}>
                      <animateMotion dur={isPulsing ? "0.8s" : "2.5s"} repeatCount="indefinite" path={`M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}`} />
                    </circle>
                  )}

                  {/* Reverse particle for bidirectional comms */}
                  {isReady && (
                    <circle r="2" fill={strokeColor} opacity="0.3">
                      <animateMotion dur="3s" repeatCount="indefinite" path={`M ${line.x2} ${line.y2} L ${line.x1} ${line.y1}`} />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* ── CONTROL PLANE (MASTER HUB) ── */}
          <div className="flex justify-center pt-8 pb-4 relative z-10">
            <div ref={masterRef} className="relative">
              <div className="relative w-36 h-36 rounded-full border border-white/20 bg-[#0d0f14] flex items-center justify-center shadow-[0_0_40px_rgba(165,231,255,0.15)]">
                {/* Heartbeat ping ring */}
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-[ping_4s_ease-in-out_infinite]" />
                <div className="absolute inset-2 rounded-full border border-primary/10 animate-[ping_4s_ease-in-out_infinite_1s]" />

                <div className="text-center z-10">
                  <div className="font-mono text-xs text-primary font-bold tracking-wider">CONTROL</div>
                  <div className="font-mono text-[10px] text-on-surface-variant">PLANE</div>
                </div>

                {/* Orbiting component badges */}
                <div className="absolute -top-3 -left-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high border border-primary/50 text-primary font-mono text-[9px] font-bold shadow-[0_0_12px_rgba(165,231,255,0.3)]">
                  API
                </div>
                <div className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high border border-desired-state/50 text-desired-state font-mono text-[9px] font-bold shadow-[0_0_12px_rgba(189,0,255,0.3)]">
                  etcd
                </div>
                <div className="absolute -bottom-3 -left-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high border border-secondary/50 text-secondary font-mono text-[9px] font-bold shadow-[0_0_12px_rgba(236,178,255,0.3)]">
                  SCH
                </div>
                <div className="absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high border border-tertiary/50 text-tertiary font-mono text-[9px] font-bold shadow-[0_0_12px_rgba(229,215,255,0.3)]">
                  CTL
                </div>
              </div>
            </div>
          </div>

          {/* ── WORKER NODE FLEET ── */}
          <div className="px-6 pb-6 pt-4 relative z-10">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-primary font-bold">WORKER FLEET</span>
                <div className="flex gap-2">
                  {(Object.entries(POD_COLORS) as [PodType, string][]).map(([type, cls]) => (
                    <div key={type} className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${cls.split(" ")[0]}`} />
                      <span className="font-mono text-[9px] uppercase text-on-surface-variant">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {nodes.map((node) => {
                const metrics = getNodeMetrics(node);
                const isMaintenance = node.status === "Cordoned";
                const isFailed = node.status === "NotReady";
                const isSelected = selectedNodeId === node.id;
                const isPulsing = heartbeatPulse[node.id];

                return (
                  <div
                    key={node.id}
                    ref={(el) => { nodeRefs.current[node.id] = el; }}
                    onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                    className={`glass-panel relative rounded-2xl p-5 border cursor-pointer transition-all duration-300 overflow-hidden ${
                      isFailed ? "border-error-pulse/50 opacity-80" :
                      isMaintenance ? "border-amber-500/30" :
                      isSelected ? "border-primary shadow-[0_0_20px_rgba(165,231,255,0.2)]" :
                      isPulsing ? "border-primary/60 shadow-[0_0_15px_rgba(165,231,255,0.15)]" :
                      "border-white/10 hover:border-white/20"
                    }`}
                  >
                    {/* Maintenance stripe overlay */}
                    {isMaintenance && (
                      <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(245,158,11,0.2) 10px, rgba(245,158,11,0.2) 20px)" }} />
                    )}

                    {/* Heartbeat flash */}
                    {isPulsing && (
                      <div className="absolute inset-0 bg-primary/5 pointer-events-none animate-pulse rounded-2xl" />
                    )}

                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <div>
                        <span className="font-mono text-[10px] text-primary font-bold uppercase">{node.id}</span>
                        <h3 className={`font-mono text-sm font-bold ${isFailed ? "text-error-pulse" : "text-white"}`}>{node.name}</h3>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${
                          node.status === "Ready" ? "bg-success-glow/10 text-success-glow border-success-glow/30" :
                          node.draining ? "bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse" :
                          node.status === "Cordoned" ? "bg-amber-500/15 text-amber-400 border-amber-500/40" :
                          "bg-error-pulse/10 text-error-pulse border-error-pulse/30"
                        }`}>
                          <span>
                            {node.status === "Ready" ? "● Ready" :
                             node.draining ? "⚡ Evicting..." :
                             node.pods.length === 0 ? "🔒 Drained" :
                             "🔒 Cordoned"}
                          </span>
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveNode(node.id); }} className="text-on-surface-variant hover:text-error-pulse transition-colors text-sm" title="Remove Node">&times;</button>
                      </div>
                    </div>

                    {/* Resource Bars */}
                    <div className="space-y-2 font-mono text-xs mb-4 relative z-10">
                      <div>
                        <div className="flex justify-between text-[10px] text-on-surface-variant mb-0.5">
                          <span>CPU</span>
                          <span className={metrics.warning ? "text-error-pulse" : ""}>{metrics.cpu}%</span>
                        </div>
                        <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${metrics.warning ? "bg-error-pulse" : "bg-primary"}`} style={{ width: `${metrics.cpu}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-on-surface-variant mb-0.5">
                          <span>Memory</span>
                          <span className={metrics.warning ? "text-error-pulse" : ""}>{metrics.mem}%</span>
                        </div>
                        <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${metrics.warning ? "bg-error-pulse" : "bg-secondary"}`} style={{ width: `${metrics.mem}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Pods Section */}
                    <div className="mb-4 relative z-10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-[10px] text-on-surface-variant font-bold">
                          Pods ({node.pods.length})
                        </span>
                        {node.status === "Ready" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDeployNode(activeDeployNode === node.id ? null : node.id);
                            }}
                            className={`text-[10px] font-mono px-2 py-0.5 border rounded transition-all font-bold ${
                              activeDeployNode === node.id
                                ? "bg-primary text-black border-primary"
                                : "text-primary hover:text-white border-primary/40 bg-primary/10 hover:bg-primary/20"
                            }`}
                          >
                            {activeDeployNode === node.id ? "✕ Close" : "+ Deploy Pod"}
                          </button>
                        ) : (
                          <span className="font-mono text-[9px] text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            Scheduling Disabled
                          </span>
                        )}
                      </div>

                      {/* Stateful Pod Type Selector Rack */}
                      {activeDeployNode === node.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-lg bg-[#0d1017] border border-primary/50 p-2.5 mb-2.5 shadow-[0_0_20px_rgba(0,210,255,0.2)] animate-in fade-in space-y-1.5"
                        >
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-primary font-bold">Select Workload Type:</span>
                          </div>
                          <div className="grid grid-cols-5 gap-1 pt-0.5">
                            {(Object.keys(POD_COLORS) as PodType[]).map((type) => (
                              <button
                                key={type}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeployPod(node.id, type);
                                  setActiveDeployNode(null);
                                }}
                                className={`py-1 text-[10px] font-mono font-bold uppercase rounded text-center border transition-all hover:scale-105 active:scale-95 shadow-sm ${POD_COLORS[type]}`}
                                title={`Deploy ${type} pod`}
                              >
                                +{type}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                        {node.pods.map((p) => (
                          <div
                            key={p.id}
                            className={`font-mono text-[9px] px-2 py-0.5 rounded flex items-center gap-1 border transition-all duration-500
                              ${p.failed ? "bg-error-pulse/20 text-error-pulse border-error-pulse/50 line-through" : POD_COLORS[p.type]}
                              ${p.draining ? "opacity-0 scale-50" : "opacity-100 scale-100"}
                            `}
                          >
                            <span>{p.name.split("-").slice(0, 2).join("-")}</span>
                            {!p.failed && (
                              <div className="flex items-center gap-0.5 ml-0.5 pl-0.5 border-l border-current/20">
                                <button onClick={(e) => { e.stopPropagation(); handleMigratePod(node.id, p.id); }} title="Migrate" className="hover:text-white opacity-70 hover:opacity-100">&rarr;</button>
                                <button onClick={(e) => { e.stopPropagation(); handleKillPod(node.id, p.id); }} title="Kill" className="hover:text-white opacity-70 hover:opacity-100">&times;</button>
                              </div>
                            )}
                          </div>
                        ))}
                        {node.pods.length === 0 && <span className="font-mono text-[10px] text-outline-variant italic">No active pods</span>}
                      </div>
                    </div>

                    {/* Node Actions: Cordon vs Drain */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 relative z-10">
                      {/* Cordon Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleCordon(node.id); }}
                        disabled={isFailed || node.draining}
                        title={node.status === "Cordoned" ? "Uncordon: Re-enable pod scheduling on this node" : "Cordon: Keep existing pods running, but prevent new pod scheduling"}
                        className={`py-1.5 rounded font-mono text-[10px] uppercase font-bold transition-all disabled:opacity-40 ${
                          node.status === "Cordoned"
                            ? "bg-success-glow/15 border border-success-glow/50 text-success-glow hover:bg-success-glow/25 shadow-[0_0_10px_rgba(0,255,194,0.2)]"
                            : "bg-surface-container border border-white/10 text-on-surface hover:bg-surface-bright"
                        }`}
                      >
                        {node.status === "Cordoned" ? "✓ Uncordon" : "🔒 Cordon"}
                      </button>

                      {/* Drain Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDrainNode(node.id); }}
                        disabled={isFailed || node.draining || (node.status === "Cordoned" && node.pods.length === 0)}
                        title="Drain: Evict and migrate all running pods to other nodes, and cordon this node"
                        className={`py-1.5 rounded font-mono text-[10px] uppercase font-bold transition-all disabled:opacity-40 ${
                          node.draining
                            ? "bg-amber-500/20 border border-amber-500 text-amber-300 animate-pulse cursor-wait"
                            : node.status === "Cordoned" && node.pods.length === 0
                            ? "bg-surface-container border border-white/5 text-on-surface-variant/50 cursor-not-allowed"
                            : "bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500"
                        }`}
                      >
                        {node.draining
                          ? "Evicting..."
                          : node.status === "Cordoned" && node.pods.length === 0
                          ? "Drained"
                          : "⚡ Drain"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}

        {/* Event Stream */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 tech-border">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <span className="font-mono text-xs text-primary font-bold">KUBELET EVENT STREAM</span>
            <span className="flex h-2 w-2 rounded-full bg-success-glow animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 font-mono text-[10px]">
            {logs.map((log) => {
              let colorClass = "text-on-surface-variant border-white/5";
              if (log.type === "success") colorClass = "text-success-glow border-success-glow/20 bg-success-glow/5";
              if (log.type === "warning") colorClass = "text-amber-400 border-amber-500/20 bg-amber-500/5";
              if (log.type === "error") colorClass = "text-error-pulse border-error-pulse/20 bg-error-pulse/5";
              return (
                <div key={log.id} className={`rounded p-2 border ${colorClass}`}>{log.text}</div>
              );
            })}
          </div>
        </div>

        {/* Bottom Module Navigation */}
        <div className="border-t border-white/10 pt-8 flex justify-between items-center font-mono text-xs">
          <Link
            href="/networking"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container border border-white/10 text-on-surface-variant hover:text-white hover:border-white/30 transition-all module-nav-card"
          >
            <span>←</span>
            <span>Module 04 Networking</span>
          </Link>
          <Link
            href="/playground"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 hover:border-primary transition-all font-bold module-nav-card shadow-[0_0_15px_rgba(0,210,255,0.25)]"
          >
            <span>Launch Sandbox Matrix</span>
            <span>▶</span>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
