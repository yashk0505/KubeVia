"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// Types
type HealthState = "healthy" | "degraded" | "error";

interface ServiceNode {
  id: string;
  name: string;
  type: string;
  x: number; // Percentage X
  y: number; // Percentage Y
  health: HealthState;
  baseLatency: number;
  baseRps: number;
  latency: number;
  rps: number;
  errorRate: number;
  history: number[];
}

interface Edge {
  source: string;
  target: string;
}

// Initial Data Setup
const initialNodes: ServiceNode[] = [
  { id: "ingress", name: "ingress-nginx", type: "Gateway", x: 50, y: 15, health: "healthy", baseLatency: 5, baseRps: 1200, latency: 5, rps: 1200, errorRate: 0.1, history: Array(10).fill(1200) },
  { id: "frontend", name: "frontend-web", type: "Frontend", x: 20, y: 45, health: "healthy", baseLatency: 15, baseRps: 600, latency: 15, rps: 600, errorRate: 0.2, history: Array(10).fill(600) },
  { id: "auth", name: "auth-service", type: "Backend", x: 40, y: 45, health: "healthy", baseLatency: 25, baseRps: 800, latency: 25, rps: 800, errorRate: 0.1, history: Array(10).fill(800) },
  { id: "order", name: "order-processor", type: "Backend", x: 60, y: 45, health: "healthy", baseLatency: 45, baseRps: 300, latency: 45, rps: 300, errorRate: 0.5, history: Array(10).fill(300) },
  { id: "payment", name: "payment-gateway", type: "External", x: 80, y: 45, health: "healthy", baseLatency: 120, baseRps: 150, latency: 120, rps: 150, errorRate: 1.2, history: Array(10).fill(150) },
  { id: "db", name: "postgres-cluster", type: "Database", x: 50, y: 80, health: "healthy", baseLatency: 8, baseRps: 2000, latency: 8, rps: 2000, errorRate: 0.05, history: Array(10).fill(2000) },
];

const edges: Edge[] = [
  { source: "ingress", target: "frontend" },
  { source: "ingress", target: "auth" },
  { source: "frontend", target: "auth" },
  { source: "frontend", target: "order" },
  { source: "order", target: "payment" },
  { source: "order", target: "db" },
  { source: "auth", target: "db" },
  { source: "payment", target: "db" },
];

const COLORS = {
  healthy: "#00FFC2",
  degraded: "#FFB000",
  error: "#FF005C",
  primary: "#A5E7FF",
  dataFlow: "#00D2FF"
};

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.1;
  const range = max - min || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d - min) / range) * 100}`).join(" ");
  
  return (
    <svg className="w-full h-12 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function ServiceMap() {
  const [nodes, setNodes] = useState<ServiceNode[]>(initialNodes);
  const [trafficMultiplier, setTrafficMultiplier] = useState<number>(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    setMounted(true);
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Simulation Loop
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setNodes(prev => {
        let updated = [...prev];
        
        // Cascading failures (simple logic: if upstream is bad, downstream might be bad)
        // We'll evaluate node states based on traffic and injected faults
        
        updated = updated.map(node => {
          let currentHealth = node.health;
          
          // If node isn't explicitly dead, calculate dynamic state
          if (currentHealth !== "error") {
            // High traffic degradation
            if (trafficMultiplier > 2.0 && Math.random() > 0.8) {
              currentHealth = "degraded";
            }
          }

          // Calculate current stats with some jitter
          const jitter = 0.9 + Math.random() * 0.2;
          let newRps = node.health === "error" ? 0 : Math.floor(node.baseRps * trafficMultiplier * jitter);
          let newLatency = node.health === "error" ? 0 : node.baseLatency * (trafficMultiplier > 1.5 ? 1.5 : 1);
          let newErrorRate = node.health === "error" ? 100 : node.errorRate;

          if (currentHealth === "degraded") {
            newLatency *= (2 + Math.random() * 2);
            newErrorRate += (5 + Math.random() * 10);
            newRps = Math.floor(newRps * 0.7);
          }

          // Add to history
          const newHistory = [...node.history.slice(1), newRps];

          return {
            ...node,
            health: currentHealth,
            latency: Math.floor(newLatency),
            rps: newRps,
            errorRate: parseFloat(newErrorRate.toFixed(2)),
            history: newHistory
          };
        });

        // Resolve cascades: an edge with source "error" severely degrades target
        edges.forEach(edge => {
          const source = updated.find(n => n.id === edge.source);
          const target = updated.find(n => n.id === edge.target);
          if (source && target && source.health === "error" && target.health !== "error") {
             // target gets degraded due to cascade
             target.health = "degraded";
             target.errorRate += 20;
             target.latency *= 3;
          }
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mounted, trafficMultiplier]);

  const injectLatency = (id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, health: "degraded" } : n));
  };

  const killService = (id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, health: "error", latency: 0, rps: 0 } : n));
  };

  const recoverAll = () => {
    setNodes(initialNodes.map(n => ({ ...n, health: "healthy" })));
    setTrafficMultiplier(1);
  };

  const getNodeColor = (health: HealthState) => COLORS[health] || COLORS.primary;

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!mounted) return <div className="min-h-screen bg-[#050608]" />;

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col font-mono selection:bg-[#BD00FF]/30">
      <Nav />
      
      <main className="flex-grow flex p-6 gap-6 pt-24 max-w-[1600px] mx-auto w-full h-[calc(100vh-64px)]">
        {/* Left Col: Chaos & Controls */}
        <div className="w-80 flex flex-col gap-6 shrink-0 z-10">
          <div className="glass-panel p-5 relative overflow-hidden group border border-[#00FFC2]/20 shadow-[0_0_15px_rgba(0,255,194,0.05)] bg-[#0A0D14]/80 backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00D2FF] to-transparent opacity-50" />
            <h2 className="text-xl font-display mb-4 text-[#A5E7FF] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse"></span>
              Traffic Control
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2 text-sm text-gray-400">
                  <span>Volume Multiplier</span>
                  <span className="text-[#00FFC2]">{trafficMultiplier.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" max="3" step="0.1"
                  value={trafficMultiplier}
                  onChange={(e) => setTrafficMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-[#00D2FF]"
                />
              </div>
              <p className="text-xs text-gray-500">
                Pushing traffic above 2.0x may trigger automatic degradation in downstream services.
              </p>
            </div>
          </div>

          <div className="glass-panel p-5 relative overflow-hidden group border border-[#FF005C]/30 shadow-[0_0_15px_rgba(255,0,92,0.1)] bg-[#0A0D14]/80 backdrop-blur-xl flex-grow">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF005C] to-transparent opacity-70" />
             <h2 className="text-xl font-display mb-4 text-[#FF005C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF005C] animate-pulse"></span>
              Chaos Engineering
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-400 mb-2">Target Service:</p>
                <select 
                  className="w-full bg-[#050608] border border-[#FF005C]/30 text-[#A5E7FF] p-2 rounded outline-none focus:border-[#FF005C] font-mono text-sm"
                  onChange={(e) => setSelectedNodeId(e.target.value)}
                  value={selectedNodeId || ""}
                >
                  <option value="" disabled>Select a service...</option>
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
              
              <div className="space-y-3">
                <button 
                  disabled={!selectedNodeId}
                  onClick={() => selectedNodeId && injectLatency(selectedNodeId)}
                  className="w-full py-2 bg-[#FFB000]/10 border border-[#FFB000]/50 text-[#FFB000] hover:bg-[#FFB000]/20 transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  INJECT LATENCY (200ms+)
                </button>
                <button 
                  disabled={!selectedNodeId}
                  onClick={() => selectedNodeId && killService(selectedNodeId)}
                  className="w-full py-2 bg-[#FF005C]/10 border border-[#FF005C]/50 text-[#FF005C] hover:bg-[#FF005C]/20 transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  KILL SERVICE (SIGKILL)
                </button>
              </div>

              <div className="pt-6 border-t border-gray-800">
                 <button 
                  onClick={recoverAll}
                  className="w-full py-2 bg-[#00FFC2]/10 border border-[#00FFC2]/50 text-[#00FFC2] hover:bg-[#00FFC2]/20 transition-all text-sm"
                >
                  RECOVER ALL SYSTEMS
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Interactive SVG Map */}
        <div className="flex-grow glass-panel relative overflow-hidden border border-gray-800 bg-[#0A0D14]/50 shadow-inner z-0" ref={containerRef}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                {/* Glow Filters */}
                <filter id="glow-healthy" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-degraded" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-error" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                {/* Animation Patterns for lines */}
                <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="transparent" />
                   <stop offset="50%" stopColor="#00D2FF" />
                   <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>

              {/* Draw Edges */}
              {edges.map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const sx = (sourceNode.x / 100) * dimensions.width;
                const sy = (sourceNode.y / 100) * dimensions.height;
                const tx = (targetNode.x / 100) * dimensions.width;
                const ty = (targetNode.y / 100) * dimensions.height;

                // Edge health determined by target
                const edgeHealth = targetNode.health === "error" || sourceNode.health === "error" ? "error" 
                                 : targetNode.health === "degraded" ? "degraded" : "healthy";
                const edgeColor = COLORS[edgeHealth];
                
                // Animation speed based on traffic, paused if error
                const animDuration = edgeHealth === "error" ? "0s" : `${2 / trafficMultiplier}s`;
                const isError = edgeHealth === "error";

                return (
                  <g key={`${edge.source}-${edge.target}`}>
                    {/* Base Line */}
                    <line 
                      x1={sx} y1={sy} x2={tx} y2={ty}
                      stroke={edgeColor}
                      strokeWidth="2"
                      strokeOpacity={isError ? "0.3" : "0.5"}
                      strokeDasharray={isError ? "none" : "5,5"}
                    >
                      {!isError && (
                        <animate 
                          attributeName="stroke-dashoffset" 
                          from="20" to="0" 
                          dur={animDuration} 
                          repeatCount="indefinite" 
                        />
                      )}
                    </line>
                    
                    {/* Moving Particle (only if healthy or degraded) */}
                    {!isError && (
                      <circle r="4" fill={edgeColor} filter={`url(#glow-${edgeHealth})`}>
                        <animateMotion 
                          dur={animDuration} 
                          repeatCount="indefinite"
                          path={`M ${sx} ${sy} L ${tx} ${ty}`}
                        />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Draw Nodes (HTML overlaid on SVG for interactivity) */}
            {nodes.map(node => {
               const isActive = selectedNodeId === node.id;
               const nodeColor = getNodeColor(node.health);
               return (
                <div 
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg cursor-pointer transition-all duration-300 backdrop-blur-md border ${isActive ? 'scale-110 z-20' : 'hover:scale-105 z-10'}`}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    borderColor: nodeColor,
                    backgroundColor: `${nodeColor}10`,
                    boxShadow: isActive ? `0 0 20px ${nodeColor}40, inset 0 0 10px ${nodeColor}20` : `0 0 10px ${nodeColor}20`
                  }}
                >
                  <div className="flex flex-col items-center justify-center gap-1 min-w-[120px]">
                    <span className="text-xs text-gray-400 tracking-wider uppercase">{node.type}</span>
                    <span className="text-sm font-bold truncate w-full text-center" style={{ color: nodeColor }}>{node.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${node.health === 'error' ? 'animate-none' : 'animate-pulse'}`} style={{ backgroundColor: nodeColor }}></span>
                      <span className="text-xs">{node.rps} rps</span>
                    </div>
                  </div>

                  {/* Tech corners */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50" style={{ color: nodeColor }} />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-50" style={{ color: nodeColor }} />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-50" style={{ color: nodeColor }} />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50" style={{ color: nodeColor }} />
                </div>
               );
            })}
        </div>

        {/* Right Col: Live Metrics Inspector */}
        <div className="w-80 flex flex-col gap-6 shrink-0 z-10">
          <div className="glass-panel p-5 h-full relative overflow-hidden group border border-gray-800 bg-[#0A0D14]/80 backdrop-blur-xl flex flex-col">
            <h2 className="text-xl font-display mb-6 text-white flex items-center gap-2 border-b border-gray-800 pb-4">
              Service Inspector
            </h2>
            
            {selectedNode ? (
              <div className="space-y-6 flex-grow flex flex-col">
                <div className="mb-2">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">{selectedNode.type}</div>
                  <div className="text-lg font-bold text-[#A5E7FF] truncate">{selectedNode.name}</div>
                  <div className="inline-block px-2 py-1 mt-2 text-xs border rounded" style={{ borderColor: getNodeColor(selectedNode.health), color: getNodeColor(selectedNode.health) }}>
                    STATUS: {selectedNode.health.toUpperCase()}
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="bg-[#050608] border border-gray-800 p-3 rounded">
                     <div className="text-xs text-gray-500 mb-1">TRAFFIC (RPS)</div>
                     <div className="text-2xl text-[#00D2FF] font-light">{selectedNode.rps}</div>
                     <div className="mt-3">
                        <Sparkline data={selectedNode.history} color="#00D2FF" />
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                     <div className="bg-[#050608] border border-gray-800 p-3 rounded">
                       <div className="text-xs text-gray-500 mb-1">LATENCY</div>
                       <div className="text-xl" style={{ color: selectedNode.health === 'error' ? COLORS.error : selectedNode.latency > selectedNode.baseLatency * 2 ? COLORS.degraded : COLORS.healthy }}>
                         {selectedNode.latency}ms
                       </div>
                     </div>
                     <div className="bg-[#050608] border border-gray-800 p-3 rounded">
                       <div className="text-xs text-gray-500 mb-1">ERROR RATE</div>
                       <div className="text-xl" style={{ color: selectedNode.errorRate > 5 ? COLORS.error : selectedNode.errorRate > 1 ? COLORS.degraded : COLORS.healthy }}>
                         {selectedNode.errorRate}%
                       </div>
                     </div>
                   </div>

                   <div className="bg-[#050608] border border-gray-800 p-3 rounded">
                      <div className="text-xs text-gray-500 mb-2">LATENCY DISTRIBUTION</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>P50</span> <span>{selectedNode.latency}ms</span></div>
                        <div className="flex justify-between"><span>P95</span> <span className="text-gray-400">{Math.floor(selectedNode.latency * 1.5)}ms</span></div>
                        <div className="flex justify-between"><span>P99</span> <span className="text-gray-400">{Math.floor(selectedNode.latency * 2.2)}ms</span></div>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-gray-600">
                <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="text-sm text-center">Select a service node on<br/>the map to view metrics.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Module Navigation */}
      <div className="max-w-[1600px] mx-auto w-full px-6 pb-12">
        <div className="border-t border-white/10 pt-8 flex justify-between items-center font-mono text-xs">
          <Link
            href="/kubernetes"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container border border-white/10 text-on-surface-variant hover:text-white hover:border-white/30 transition-all module-nav-card"
          >
            <span>←</span>
            <span>Module 03 Kubernetes</span>
          </Link>
          <Link
            href="/topology"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-desired-state/15 border border-desired-state/40 text-desired-state hover:bg-desired-state/25 hover:border-desired-state transition-all font-bold module-nav-card shadow-[0_0_15px_rgba(189,0,255,0.2)]"
          >
            <span>Next: Module 05 Topology</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
