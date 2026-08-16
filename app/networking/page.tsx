"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type ServiceType = "ClusterIP" | "NodePort" | "LoadBalancer" | "ExternalName";
type PacketStep = "browser" | "ingress" | "service" | "dataplane" | "pod" | "container" | "response" | "idle";
type NetSubModule = "journey" | "overlay" | "services" | "ingress" | "dns" | "policy" | "usecases";

export default function NetworkingPage() {
  const [activeSubModule, setActiveSubModule] = useState<NetSubModule>("journey");

  // ══════════ Submodule 1: Packet Journey State ══════════
  const [packetStep, setPacketStep] = useState<PacketStep>("idle");
  const [selectedPodTarget, setSelectedPodTarget] = useState<number>(1);
  const [packetLogs, setPacketLogs] = useState<string[]>([
    "Data Plane Telemetry Stream Initialized. Click 'Dispatch Packet' to trace end-to-end routing.",
  ]);

  // ══════════ Submodule 2: VXLAN Overlay State ══════════
  const [vxlanStep, setVxlanStep] = useState<"idle" | "veth" | "cni0" | "encap" | "wire" | "decap" | "pod2">("idle");
  const [vxlanLogs, setVxlanLogs] = useState<string[]>([
    "VXLAN Tunnel Engine Ready. Click 'Transmit Cross-Node Packet' to initiate encapsulation.",
  ]);

  // ══════════ Submodule 3: Service Types State ══════════
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>("ClusterIP");
  const [serviceSimActive, setServiceSimActive] = useState(false);
  const [serviceTargetPod, setServiceTargetPod] = useState(1);

  // ══════════ Submodule 4: Ingress State ══════════
  const [ingressPath, setIngressPath] = useState<string>("/api/v1/checkout");
  const [ingressSimActive, setIngressSimActive] = useState(false);

  // ══════════ Submodule 5: CoreDNS Simulation Studio State ══════════
  const [dnsQuery, setDnsQuery] = useState("auth-service.production.svc.cluster.local");
  const [dnsResolving, setDnsResolving] = useState(false);
  const [dnsStep, setDnsStep] = useState<"idle" | "client" | "search" | "coredns" | "resolved">("idle");
  const [dnsUseCache, setDnsUseCache] = useState(true);
  const [dnsResult, setDnsResult] = useState<{
    ip: string;
    type: string;
    ttl: number;
    latency: string;
    cacheStatus: "HIT" | "MISS";
    zone: string;
    resolvedName: string;
    rcode: string;
  } | null>(null);
  const [showCorefile, setShowCorefile] = useState(false);

  // ══════════ Submodule 6: NetworkPolicy State ══════════
  const [allowDbAccess, setAllowDbAccess] = useState(false);
  const [policyTesting, setPolicyTesting] = useState(false);
  const [policyTestStatus, setPolicyTestStatus] = useState<"idle" | "allowed" | "blocked">("idle");

  // ── 1. Packet Journey Simulation ──
  const startPacketJourney = () => {
    if (packetStep !== "idle" && packetStep !== "response") return;

    const randomTarget = Math.floor(Math.random() * 3) + 1;
    setSelectedPodTarget(randomTarget);
    setPacketStep("browser");
    setPacketLogs([`[0.0ms] 💻 Client Browser: Dispatched HTTP GET /api/v1/data (TCP SYN)`]);

    setTimeout(() => {
      setPacketStep("ingress");
      setPacketLogs((p) => [`[3.8ms] 🌐 Ingress Controller: Terminated TLS certificate, matched host routing rules`, ...p]);

      setTimeout(() => {
        setPacketStep("service");
        setPacketLogs((p) => [`[7.9ms] ⚙️ K8s Service (ClusterIP 10.96.0.1): Selected EndpointSlice candidate Pod-0${randomTarget}`, ...p]);

        setTimeout(() => {
          setPacketStep("dataplane");
          setPacketLogs((p) => [`[11.4ms] ⚡ kube-proxy / eBPF: Executed DNAT rewrite ➔ 10.244.${randomTarget}.15:8080`, ...p]);

          setTimeout(() => {
            setPacketStep("pod");
            setPacketLogs((p) => [`[15.6ms] 📦 Pod-0${randomTarget} eth0: Packet received on virtual interface`, ...p]);

            setTimeout(() => {
              setPacketStep("container");
              setPacketLogs((p) => [`[19.8ms] 🚀 Container Process: Generated HTTP 200 OK payload (2.8KB)`, ...p]);

              setTimeout(() => {
                setPacketStep("response");
                setPacketLogs((p) => [`[24.5ms] ✅ Response 200 OK safely delivered to Client Browser!`, ...p]);
              }, 750);
            }, 750);
          }, 750);
        }, 750);
      }, 750);
    }, 750);
  };

  // ── 2. VXLAN Simulation ──
  const startVxlanSimulation = () => {
    if (vxlanStep !== "idle" && vxlanStep !== "pod2") return;
    setVxlanStep("veth");
    setVxlanLogs(["[0.0ms] 📦 Pod-1 (10.244.1.5) kernel routes IP packet to veth pair interface."]);

    setTimeout(() => {
      setVxlanStep("cni0");
      setVxlanLogs((p) => ["[0.4ms] 🔀 cni0 Linux bridge intercepts packet. Determines 10.244.2.8 is on remote Node-B.", ...p]);

      setTimeout(() => {
        setVxlanStep("encap");
        setVxlanLogs((p) => ["[0.8ms] 🔒 CNI VXLAN (flannel.1): Prepends outer UDP/8472 header (Src: 192.168.1.10, Dst: 192.168.1.20, VNI: 1).", ...p]);

        setTimeout(() => {
          setVxlanStep("wire");
          setVxlanLogs((p) => ["[1.5ms] ⚡ Physical Underlay Network: Routing encapsulated UDP frame across Top-of-Rack switch fabric.", ...p]);

          setTimeout(() => {
            setVxlanStep("decap");
            setVxlanLogs((p) => ["[2.1ms] 🔓 Node-B (192.168.1.20) Kernel: Strips outer VXLAN UDP wrapper. Discovers inner 10.244.2.8 frame.", ...p]);

            setTimeout(() => {
              setVxlanStep("pod2");
              setVxlanLogs((p) => ["[2.5ms] ✅ Packet delivered to Pod-2 eth0 with original source IP 10.244.1.5 preserved!", ...p]);
            }, 700);
          }, 700);
        }, 700);
      }, 700);
    }, 700);
  };

  // ── 3. Service Simulation ──
  const handleTestServiceRoute = () => {
    if (serviceSimActive) return;
    setServiceSimActive(true);
    const target = Math.floor(Math.random() * 2) + 1;
    setServiceTargetPod(target);
    setTimeout(() => {
      setServiceSimActive(false);
    }, 1800);
  };

  // ── 4. Ingress Simulation ──
  const handleTestIngress = (path: string) => {
    setIngressPath(path);
    setIngressSimActive(true);
    setTimeout(() => {
      setIngressSimActive(false);
    }, 1500);
  };

  // ── 5. CoreDNS Simulation Studio ──
  const handleExecuteDns = (queryOverride?: string) => {
    const q = (queryOverride || dnsQuery).trim();
    if (!q || dnsResolving) return;

    setDnsResolving(true);
    setDnsStep("client");
    setDnsResult(null);

    // Step 1: Client Query
    setTimeout(() => {
      setDnsStep("search");

      // Step 2: Search Path Expansion
      setTimeout(() => {
        setDnsStep("coredns");

        // Step 3: CoreDNS Server Processing & Cache Lookup
        setTimeout(() => {
          setDnsStep("resolved");
          setDnsResolving(false);

          if (q.includes("auth-service")) {
            setDnsResult({
              ip: "10.96.14.88",
              type: "A (ClusterIP VIP)",
              ttl: dnsUseCache ? 28 : 30,
              latency: dnsUseCache ? "0.2ms" : "1.8ms",
              cacheStatus: dnsUseCache ? "HIT" : "MISS",
              zone: "production.svc.cluster.local",
              resolvedName: "auth-service.production.svc.cluster.local",
              rcode: "NOERROR",
            });
          } else if (q.includes("payment")) {
            setDnsResult({
              ip: "10.96.220.104",
              type: "A (ClusterIP VIP)",
              ttl: dnsUseCache ? 25 : 30,
              latency: dnsUseCache ? "0.3ms" : "2.1ms",
              cacheStatus: dnsUseCache ? "HIT" : "MISS",
              zone: "staging.svc.cluster.local",
              resolvedName: "payment-service.staging.svc.cluster.local",
              rcode: "NOERROR",
            });
          } else if (q.includes("postgres") || q.includes("database")) {
            setDnsResult({
              ip: "10.96.55.200",
              type: "A (Headless Service Pod IP: 10.244.2.91)",
              ttl: 10,
              latency: dnsUseCache ? "0.2ms" : "1.9ms",
              cacheStatus: dnsUseCache ? "HIT" : "MISS",
              zone: "database.svc.cluster.local",
              resolvedName: "postgres-master.database.svc.cluster.local",
              rcode: "NOERROR",
            });
          } else if (q.includes("stripe") || q.includes("google") || q.includes("external")) {
            setDnsResult({
              ip: "199.60.103.106",
              type: "CNAME / Upstream Forward (8.8.8.8)",
              ttl: 300,
              latency: "14.2ms",
              cacheStatus: "MISS",
              zone: "Upstream WAN Root",
              resolvedName: q,
              rcode: "NOERROR",
            });
          } else if (q.includes("ghost") || q.includes("unknown")) {
            setDnsResult({
              ip: "0.0.0.0",
              type: "NXDOMAIN",
              ttl: 0,
              latency: "3.2ms",
              cacheStatus: "MISS",
              zone: "cluster.local",
              resolvedName: q,
              rcode: "NXDOMAIN (Non-Existent Domain)",
            });
          } else {
            setDnsResult({
              ip: "10.96.0.42",
              type: "A (ClusterIP VIP)",
              ttl: 30,
              latency: dnsUseCache ? "0.3ms" : "2.4ms",
              cacheStatus: dnsUseCache ? "HIT" : "MISS",
              zone: "default.svc.cluster.local",
              resolvedName: `${q}.default.svc.cluster.local`,
              rcode: "NOERROR",
            });
          }
        }, 600);
      }, 500);
    }, 400);
  };

  // ── 6. NetworkPolicy Simulation ──
  const handleTestPolicy = () => {
    if (policyTesting) return;
    setPolicyTesting(true);
    setPolicyTestStatus("idle");

    setTimeout(() => {
      setPolicyTesting(false);
      setPolicyTestStatus(allowDbAccess ? "allowed" : "blocked");
    }, 900);
  };

  return (
    <main className="min-h-screen bg-[#050608] text-[#e2e2e8] overflow-x-hidden flex flex-col font-sans">
      <Nav />

      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto w-full flex-1 space-y-8">
        {/* Module Header & Submodule Switcher */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 tech-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-success-glow mb-1">
              <span className="h-2 w-2 rounded-full bg-success-glow animate-pulse" />
              <span>MODULE 03 // KUBERNETES NETWORKING &amp; CNI</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Packet Journey &amp; Service Mesh
            </h1>
            <p className="font-sans text-sm text-on-surface-variant mt-1">
              Trace packets across L7 Ingress, virtual ClusterIP VIPs, cross-node VXLAN tunnels, CoreDNS discovery, and zero-trust firewalls.
            </p>
          </div>

          {/* Submodule Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-surface-container p-1.5 rounded-xl border border-white/10 font-mono text-xs">
            {[
              { key: "journey", label: "⚡ Packet Journey" },
              { key: "overlay", label: "Pod Overlay (CNI)" },
              { key: "services", label: "Services (L4)" },
              { key: "ingress", label: "Ingress (L7)" },
              { key: "dns", label: "🔍 CoreDNS Studio" },
              { key: "policy", label: "NetworkPolicy" },
              { key: "usecases", label: "Usecases" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSubModule(tab.key as NetSubModule)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeSubModule === tab.key
                    ? "bg-success-glow text-black font-bold shadow-[0_0_12px_rgba(0,255,194,0.4)]"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SUBMODULE 1: Signature Packet Journey (End-to-End)
        ══════════════════════════════════════════════════════════════════ */}
        {activeSubModule === "journey" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border relative overflow-hidden space-y-8">
              <div className="scan-line" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="font-mono text-xs text-success-glow uppercase font-bold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success-glow animate-ping" />
                    <span>L3/L4/L7 END-TO-END DATA PLANE TRACER</span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-white mt-1">Live Packet Journey Simulation</h2>
                  <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                    Click Dispatch Packet to trace the real-time execution loop from client browser through virtual interfaces.
                  </p>
                </div>
                <button
                  onClick={startPacketJourney}
                  disabled={packetStep !== "idle" && packetStep !== "response"}
                  className="px-6 py-3 rounded-xl bg-success-glow text-black font-mono text-xs font-bold uppercase hover:bg-success-glow/80 transition-all shadow-[0_0_20px_rgba(0,255,194,0.3)] disabled:opacity-40"
                >
                  {packetStep === "idle" || packetStep === "response" ? "▶ Dispatch Packet" : "⚡ Routing in Progress..."}
                </button>
              </div>

              {/* High-Tech Animated Flow Pipeline */}
              <div className="relative">
                {/* SVG Flow Connecting Laser Beam */}
                <svg className="hidden md:block absolute top-1/2 left-0 w-full h-8 -translate-y-1/2 pointer-events-none z-0">
                  <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeDasharray="4 4" />
                  {packetStep !== "idle" && (
                    <line
                      x1="5%" y1="50%" x2="95%" y2="50%"
                      stroke="#00ffc2"
                      strokeWidth="2.5"
                      strokeDasharray="8 8"
                      className="animate-pulse"
                    />
                  )}
                </svg>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 pt-2 relative z-10 font-mono text-xs">
                  {[
                    { key: "browser", title: "1. Client Browser", desc: "GET /api/v1/data", icon: "💻", tag: "SYN/ACK" },
                    { key: "ingress", title: "2. Ingress Router", desc: "TLS & L7 Rule", icon: "🌐", tag: "PORT 443" },
                    { key: "service", title: "3. ClusterIP VIP", desc: "10.96.0.1 Virtual IP", icon: "⚙️", tag: "PORT 80" },
                    { key: "dataplane", title: "4. DNAT Engine", desc: "eBPF / iptables", icon: "⚡", tag: "KERNEL" },
                    { key: "pod", title: "5. Pod eth0", desc: `Target: Pod-${selectedPodTarget}`, icon: "📦", tag: `10.244.${selectedPodTarget}.15` },
                    { key: "container", title: "6. App Runtime", desc: "HTTP 200 OK", icon: "🚀", tag: "NODE.JS" },
                  ].map((step, idx) => {
                    const isActive = packetStep === step.key;
                    const isPassed =
                      (packetStep === "ingress" && idx === 0) ||
                      (packetStep === "service" && idx <= 1) ||
                      (packetStep === "dataplane" && idx <= 2) ||
                      (packetStep === "pod" && idx <= 3) ||
                      (packetStep === "container" && idx <= 4) ||
                      (packetStep === "response");

                    return (
                      <div
                        key={step.key}
                        className={`p-4 rounded-xl border text-center transition-all duration-300 relative ${
                          isActive
                            ? "bg-success-glow/20 border-success-glow text-success-glow shadow-[0_0_25px_rgba(0,255,194,0.35)] scale-105"
                            : isPassed
                            ? "bg-surface-container border-success-glow/40 text-white"
                            : "bg-surface-container/50 border-white/5 text-on-surface-variant opacity-60"
                        }`}
                      >
                        <div className="text-2xl mb-1">{step.icon}</div>
                        <div className="font-bold text-[11px] text-white">{step.title}</div>
                        <div className="text-[9px] text-on-surface-variant mt-0.5">{step.desc}</div>
                        <div className="mt-1.5 inline-block px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[8px] text-cyan">
                          {step.tag}
                        </div>
                        {isActive && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-success-glow text-black font-bold text-[8px] animate-bounce shadow-md">
                            ACTIVE
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Endpoint Pool Flow Status */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex justify-between items-center mb-3 font-mono text-xs">
                  <span className="text-primary font-bold flex items-center gap-2">
                    <span>ENDPOINTSLICE TARGET POOL</span>
                    <span className="text-[10px] text-on-surface-variant font-normal">(Dynamic Load Balancing)</span>
                  </span>
                  <span className="text-data-flow text-[11px]">
                    {packetStep !== "idle" ? `Flow Status: Dispatched ➔ Pod-${selectedPodTarget}` : "Awaiting request dispatch"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                  {[1, 2, 3].map((podId) => {
                    const isTargeted = selectedPodTarget === podId && (packetStep === "pod" || packetStep === "container");
                    return (
                      <div
                        key={podId}
                        className={`p-4 rounded-xl border transition-all duration-300 relative ${
                          isTargeted
                            ? "border-success-glow bg-success-glow/20 shadow-[0_0_25px_rgba(0,255,194,0.4)] scale-105"
                            : "border-white/10 bg-surface-container text-white"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold">pod-instance-0{podId}</span>
                          <span className="text-[10px] text-success-glow">● Healthy</span>
                        </div>
                        <div className="text-[10px] text-on-surface-variant mt-1">IP: 10.244.{podId}.15:8080</div>
                        {isTargeted && (
                          <div className="mt-2 text-[9px] text-success-glow font-bold animate-pulse flex items-center gap-1">
                            <svg className="w-3 h-3 text-success-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>DNAT Target Received (200 OK Handshake)</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Packet Telemetry Logs */}
              <div className="rounded-xl bg-black/60 border border-white/10 p-4 font-mono text-xs space-y-1 max-h-36 overflow-y-auto">
                <div className="text-[10px] text-on-surface-variant border-b border-white/10 pb-1 uppercase font-bold flex justify-between">
                  <span>Data Plane Telemetry Stream</span>
                  <span className="text-success-glow">RTT: ~24.5ms</span>
                </div>
                {packetLogs.map((log, i) => (
                  <div key={i} className="text-success-glow text-[11px] leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SUBMODULE 2: Pod-to-Pod Overlay (CNI VXLAN)
        ══════════════════════════════════════════════════════════════════ */}
        {activeSubModule === "overlay" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="font-mono text-xs font-bold text-cyan uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
                  <span>CROSS-NODE PACKET ENCAPSULATION SIMULATOR</span>
                </div>
                <h2 className="font-display text-xl font-bold text-white mt-1">
                  CNI Overlay Networking &amp; VXLAN Tunneling
                </h2>
                <p className="font-sans text-xs text-on-surface-variant mt-1">
                  Every pod gets its own unique routable IP. Watch how the CNI plugin encapsulates cross-node packets inside UDP port 8472 frames without physical router reconfiguration.
                </p>
              </div>

              <button
                onClick={startVxlanSimulation}
                disabled={vxlanStep !== "idle" && vxlanStep !== "pod2"}
                className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 shrink-0 ${
                  vxlanStep !== "idle" && vxlanStep !== "pod2"
                    ? "bg-surface-container border border-white/10 text-on-surface-variant cursor-not-allowed"
                    : "bg-cyan text-black hover:bg-cyan/80 shadow-[0_0_20px_rgba(0,210,255,0.4)]"
                }`}
              >
                <span>{vxlanStep !== "idle" && vxlanStep !== "pod2" ? "⏳ Routing Packet..." : "▶ Transmit Cross-Node Packet"}</span>
              </button>
            </div>

            {/* Visual Step Pipeline */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
              {[
                { key: "veth", label: "1. Pod-1 veth", node: "Node-A", desc: "10.244.1.5 egress" },
                { key: "cni0", label: "2. cni0 Bridge", node: "Node-A", desc: "Layer 2 Switching" },
                { key: "encap", label: "3. VXLAN Encap", node: "flannel.1", desc: "Wrap UDP:8472" },
                { key: "wire", label: "4. Underlay Wire", node: "DC Switch", desc: "192.168.1.x wire" },
                { key: "decap", label: "5. VXLAN Decap", node: "Node-B", desc: "Unwrap Outer IP" },
                { key: "pod2", label: "6. Pod-2 eth0", node: "Node-B", desc: "10.244.2.8 delivery" },
              ].map((step) => {
                const isCurrent = vxlanStep === step.key;
                const stepOrder = ["veth", "cni0", "encap", "wire", "decap", "pod2"];
                const isPassed = vxlanStep !== "idle" && stepOrder.indexOf(vxlanStep) > stepOrder.indexOf(step.key as any);

                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-xl border text-center transition-all relative ${
                      isCurrent
                        ? "bg-cyan/20 border-cyan text-cyan font-bold shadow-[0_0_20px_rgba(0,210,255,0.4)] scale-105"
                        : isPassed
                        ? "bg-surface-container border-cyan/30 text-white"
                        : "bg-surface-container/40 border-white/5 text-on-surface-variant opacity-60"
                    }`}
                  >
                    <div className="font-bold text-[11px]">{step.label}</div>
                    <div className="text-[9px] text-on-surface-variant mt-0.5">{step.node}</div>
                    <div className="text-[8px] text-cyan/80 mt-1">{step.desc}</div>
                    {isCurrent && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-cyan text-black font-bold text-[8px] animate-bounce">
                        FLOW
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dynamic Packet Header Inspection Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NODE-A RACK */}
              <div className={`p-5 rounded-2xl border transition-all space-y-3 font-mono text-xs ${
                vxlanStep === "veth" || vxlanStep === "cni0" || vxlanStep === "encap"
                  ? "border-cyan bg-cyan/10 shadow-[0_0_25px_rgba(0,210,255,0.2)]"
                  : "border-white/10 bg-surface-container"
              }`}>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="font-bold text-white">🖥️ Node-A (Host IP: 192.168.1.10)</span>
                  <span className="text-cyan text-[10px]">SRC HOST</span>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                  <div className="text-emerald-400 font-bold flex items-center justify-between">
                    <span>📦 Pod-1 (10.244.1.5)</span>
                    <span className="text-[9px] text-on-surface-variant">veth0 ➔ cni0</span>
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    Initial IP Header: <code>SRC: 10.244.1.5 ➔ DST: 10.244.2.8</code>
                  </div>
                </div>

                {vxlanStep === "encap" || vxlanStep === "wire" ? (
                  <div className="p-3 rounded-xl bg-cyan/15 border border-cyan/40 text-[10px] space-y-1 animate-fadeIn">
                    <div className="text-cyan font-bold uppercase">🔒 Outer VXLAN Frame Prepended:</div>
                    <div className="text-white">• Outer Src: 192.168.1.10 (Node-A physical IP)</div>
                    <div className="text-white">• Outer Dst: 192.168.1.20:8472 (Node-B physical IP)</div>
                    <div className="text-cyan">• VXLAN VNI: 1 (Virtual Network Identifier)</div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-black/30 border border-dashed border-white/10 text-[10px] text-on-surface-variant text-center">
                    VXLAN Tunnel device flannel.1 idle
                  </div>
                )}
              </div>

              {/* NODE-B RACK */}
              <div className={`p-5 rounded-2xl border transition-all space-y-3 font-mono text-xs ${
                vxlanStep === "decap" || vxlanStep === "pod2"
                  ? "border-success-glow bg-success-glow/10 shadow-[0_0_25px_rgba(0,255,194,0.2)]"
                  : "border-white/10 bg-surface-container"
              }`}>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="font-bold text-white">🖥️ Node-B (Host IP: 192.168.1.20)</span>
                  <span className="text-success-glow text-[10px]">DST HOST</span>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                  <div className="text-success-glow font-bold flex items-center justify-between">
                    <span>📦 Pod-2 (10.244.2.8)</span>
                    <span className="text-[9px] text-on-surface-variant">cni0 ➔ veth0</span>
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    Target Pod Namespace listening on port :80
                  </div>
                </div>

                {vxlanStep === "decap" || vxlanStep === "pod2" ? (
                  <div className="p-3 rounded-xl bg-success-glow/15 border border-success-glow/40 text-[10px] space-y-1 animate-fadeIn">
                    <div className="text-success-glow font-bold uppercase">🔓 Outer VXLAN Frame Stripped:</div>
                    <div className="text-white">• UDP 8472 wrapper removed by kernel socket</div>
                    <div className="text-white">• Inner packet untouched: 10.244.1.5 ➔ 10.244.2.8</div>
                    <div className="text-success-glow">• Packet forwarded into Pod-2 namespace</div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-black/30 border border-dashed border-white/10 text-[10px] text-on-surface-variant text-center">
                    Awaiting incoming UDP packet on port 8472
                  </div>
                )}
              </div>
            </div>

            {/* VXLAN Event Telemetry Log */}
            <div className="rounded-xl bg-black/60 border border-white/10 p-4 font-mono text-xs space-y-1 max-h-36 overflow-y-auto">
              <div className="text-[10px] text-on-surface-variant border-b border-white/10 pb-1 uppercase font-bold flex justify-between">
                <span>CNI Data Plane Event Log</span>
                <span className="text-cyan">VXLAN / UDP:8472</span>
              </div>
              {vxlanLogs.map((log, i) => (
                <div key={i} className="text-cyan text-[11px] leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SUBMODULE 3: Service Types (L4 Routing)
        ══════════════════════════════════════════════════════════════════ */}
        {activeSubModule === "services" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["ClusterIP", "NodePort", "LoadBalancer", "ExternalName"] as ServiceType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedServiceType(type)}
                  className={`p-4 rounded-xl border text-left font-mono transition-all ${
                    selectedServiceType === type
                      ? "bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(0,210,255,0.3)]"
                      : "bg-surface-container border-white/10 text-on-surface-variant hover:text-white"
                  }`}
                >
                  <div className="text-xl mb-1">{type === "ClusterIP" ? "🔒" : type === "NodePort" ? "🚪" : type === "LoadBalancer" ? "⚖️" : "🔗"}</div>
                  <div className="font-bold text-xs">{type}</div>
                </button>
              ))}
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-white/10 tech-border space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-3">
                <div>
                  <span className="font-mono text-xs text-primary font-bold uppercase">{selectedServiceType} Specification &amp; Flow</span>
                  <div className="text-[11px] font-sans text-on-surface-variant">Test real-time load distribution across pods.</div>
                </div>
                <button
                  onClick={handleTestServiceRoute}
                  disabled={serviceSimActive}
                  className="px-4 py-2 rounded-xl bg-primary text-black font-mono text-xs font-bold uppercase hover:bg-primary/80 transition-all shadow-[0_0_15px_rgba(0,210,255,0.3)] disabled:opacity-50"
                >
                  {serviceSimActive ? "⚡ Routing Traffic..." : "▶ Test Traffic Route"}
                </button>
              </div>

              {/* Modern Visual Flow Diagram */}
              <div className="p-5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">Traffic Flow Architecture</span>
                  <span className="text-[10px] text-primary">{serviceSimActive ? "Traffic In-Flight" : "Ready"}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center">
                  {/* Origin */}
                  <div className="p-3.5 rounded-xl bg-surface-container border border-white/10">
                    <div className="text-white font-bold">
                      {selectedServiceType === "ClusterIP" ? "Client Pod (10.244.0.4)" : "Public Client"}
                    </div>
                    <div className="text-[9px] text-on-surface-variant mt-0.5">Origin</div>
                  </div>

                  {/* Flow Arrow 1 */}
                  <div className="flex justify-center items-center">
                    <svg className={`w-6 h-6 transition-all ${serviceSimActive ? "text-primary animate-pulse scale-125" : "text-white/20"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>

                  {/* Service Entrypoint */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    serviceSimActive ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_rgba(0,210,255,0.3)] scale-102" : "border-white/10 bg-surface-container text-white"
                  }`}>
                    <div className="font-bold">
                      {selectedServiceType === "ClusterIP"
                        ? "ClusterIP: 10.96.0.1:80"
                        : selectedServiceType === "NodePort"
                        ? "NodePort :30080"
                        : selectedServiceType === "LoadBalancer"
                        ? "Cloud NLB: 198.51.100.1"
                        : "CNAME: api.stripe.com"}
                    </div>
                    <div className="text-[9px] text-on-surface-variant mt-0.5">VIP Gateway</div>
                  </div>

                  {/* Flow Arrow 2 */}
                  <div className="flex justify-center items-center">
                    <svg className={`w-6 h-6 transition-all ${serviceSimActive ? "text-success-glow animate-pulse scale-125" : "text-white/20"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>

                  {/* Destination */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    serviceSimActive ? "border-success-glow bg-success-glow/20 text-success-glow shadow-[0_0_20px_rgba(0,255,194,0.3)] scale-102" : "border-white/10 bg-surface-container text-white"
                  }`}>
                    <div className="font-bold">
                      {selectedServiceType === "ExternalName" ? "External SaaS Cloud" : `Pod-0${serviceTargetPod} (10.244.${serviceTargetPod}.15)`}
                    </div>
                    <div className="text-[9px] text-on-surface-variant mt-0.5">Destination (200 OK)</div>
                  </div>
                </div>
              </div>

              {/* YAML Code Spec */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="rounded-xl bg-black/60 border border-white/10 p-4 font-mono text-xs text-on-surface-variant leading-relaxed">
                  <span className="text-secondary font-bold">apiVersion:</span> v1{"\n"}
                  <span className="text-secondary font-bold">kind:</span> Service{"\n"}
                  <span className="text-secondary font-bold">metadata:</span>{"\n"}
                  &nbsp;&nbsp;<span className="text-primary">name:</span> web-service{"\n"}
                  <span className="text-secondary font-bold">spec:</span>{"\n"}
                  &nbsp;&nbsp;<span className="text-primary">type:</span> {selectedServiceType}{"\n"}
                  &nbsp;&nbsp;<span className="text-primary">selector:</span>{"\n"}
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan">app:</span> frontend{"\n"}
                  &nbsp;&nbsp;<span className="text-primary">ports:</span>{"\n"}
                  &nbsp;&nbsp;&nbsp;&nbsp;- <span className="text-primary">port:</span> 80{"\n"}
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">targetPort:</span> 3000{"\n"}
                  {selectedServiceType === "NodePort" && (
                    <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-400">nodePort:</span> 30080{"\n"}</>
                  )}
                </div>

                <div className="space-y-3 font-sans text-xs text-on-surface-variant leading-relaxed">
                  <h3 className="font-display text-base font-bold text-white">How Traffic Routes:</h3>
                  {selectedServiceType === "ClusterIP" && (
                    <p>
                      <strong>ClusterIP</strong> assigns a virtual stable IP (e.g., <code>10.96.0.1</code>) only accessible from inside the cluster. Perfect for databases and backend microservices.
                    </p>
                  )}
                  {selectedServiceType === "NodePort" && (
                    <p>
                      <strong>NodePort</strong> opens a dedicated port (range 30000–32767) on <em>every single worker node</em>. Traffic to <code>&lt;NodeIP&gt;:30080</code> is automatically forwarded to the service endpoints.
                    </p>
                  )}
                  {selectedServiceType === "LoadBalancer" && (
                    <p>
                      <strong>LoadBalancer</strong> provisions an external Cloud Load Balancer (AWS NLB, GCP Cloud LB) and assigns a public IPv4. Traffic routes from internet ➔ LoadBalancer ➔ NodePort ➔ ClusterIP ➔ Pod.
                    </p>
                  )}
                  {selectedServiceType === "ExternalName" && (
                    <p>
                      <strong>ExternalName</strong> maps a Kubernetes service to an external DNS CNAME (e.g., <code>db.external-cloud.com</code>) without proxying data.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SUBMODULE 4: Ingress Controller (L7 Routing)
        ══════════════════════════════════════════════════════════════════ */}
        {activeSubModule === "ingress" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Ingress Controller (L7 HTTP Routing)</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                Ingress routes HTTP/HTTPS requests based on hostnames and URL paths, terminating SSL/TLS certificates at the edge.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-container border border-white/10 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span>Click path preset to test live L7 routing:</span>
                  <span className="text-cyan font-bold">https://api.mycompany.com{ingressPath}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { path: "/api/v1/checkout", label: "🛒 /checkout" },
                    { path: "/api/v1/auth", label: "🔑 /auth" },
                    { path: "/app/dashboard", label: "📊 /dashboard" },
                  ].map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleTestIngress(item.path)}
                      className={`px-4 py-2 rounded-xl font-mono text-xs border transition-all ${
                        ingressPath === item.path
                          ? "bg-cyan/20 border-cyan text-cyan font-bold shadow-[0_0_15px_rgba(0,210,255,0.3)]"
                          : "bg-black/40 border-white/10 text-on-surface-variant hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Path Flow */}
              <div className="p-5 rounded-xl bg-black/60 border border-cyan/40 font-mono text-xs space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-cyan font-bold">L7 Ingress Routing Engine:</span>
                  <span className={ingressSimActive ? "text-success-glow font-bold animate-pulse" : "text-on-surface-variant"}>
                    {ingressSimActive ? "⚡ Flowing Traffic..." : "● Synced"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-surface-container border border-white/10">
                    <div className="text-white font-bold">TLS Termination</div>
                    <div className="text-[10px] text-cyan mt-0.5">Let&apos;s Encrypt SSL</div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-container border border-cyan/40 text-cyan">
                    <div className="font-bold">Path Match: {ingressPath}</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">Regex Evaluator</div>
                  </div>
                  <div className="p-3 rounded-lg bg-success-glow/20 border border-success-glow text-success-glow font-bold">
                    <div>{ingressPath.includes("checkout") ? "checkout-svc:8080" : ingressPath.includes("auth") ? "auth-svc:4000" : "frontend-svc:80"}</div>
                    <div className="text-[9px] text-on-surface-variant font-normal mt-0.5">Selected Backend Pool</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SUBMODULE 5: CoreDNS Cluster Resolution Studio (UPGRADED)
        ══════════════════════════════════════════════════════════════════ */}
        {activeSubModule === "dns" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-8 animate-fadeIn">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="font-mono text-xs font-bold text-desired-state uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-desired-state animate-pulse" />
                  <span>INTERACTIVE COREDNS SIMULATION STUDIO</span>
                </div>
                <h2 className="font-display text-xl font-bold text-white mt-1">
                  CoreDNS Cluster Discovery &amp; Search Path Resolver
                </h2>
                <p className="font-sans text-xs text-on-surface-variant mt-1">
                  Kubernetes runs CoreDNS as an internal naming authority. Trace how client pods expand local service names, query UDP/53, evaluate in-memory caches, and forward upstream.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCorefile(!showCorefile)}
                  className="px-3.5 py-2 rounded-xl bg-surface-container border border-white/10 hover:border-desired-state text-on-surface-variant hover:text-white font-mono text-xs transition-all"
                >
                  {showCorefile ? "Hide Corefile" : "📄 View Corefile"}
                </button>
                <button
                  onClick={() => handleExecuteDns()}
                  disabled={dnsResolving}
                  className="px-5 py-2.5 rounded-xl bg-desired-state text-white font-mono text-xs font-bold uppercase hover:bg-desired-state/80 transition-all shadow-[0_0_20px_rgba(189,0,255,0.4)] disabled:opacity-50"
                >
                  {dnsResolving ? "⚡ Querying UDP:53..." : "▶ Dispatch DNS Query"}
                </button>
              </div>
            </div>

            {/* Corefile Modal / Viewer */}
            {showCorefile && (
              <div className="rounded-xl bg-black/80 border border-desired-state/50 p-5 font-mono text-xs space-y-2 animate-scaleIn">
                <div className="flex justify-between items-center text-desired-state font-bold border-b border-white/10 pb-2">
                  <span>/etc/coredns/Corefile ConfigMap</span>
                  <span className="text-[10px] text-on-surface-variant">Port :53 (TCP/UDP)</span>
                </div>
                <pre className="text-cyan text-[11px] leading-relaxed overflow-x-auto">
{`.:53 {
    errors
    health {
       lameduck 5s
    }
    ready
    kubernetes cluster.local in-addr.arpa ip6.arpa {
       pods insecure
       fallthrough in-addr.arpa ip6.arpa
       ttl 30
    }
    prometheus :9153
    forward . /etc/resolv.conf {
       max_concurrent 1000
    }
    cache 30
    loop
    reload
    loadbalance
}`}
                </pre>
              </div>
            )}

            {/* Interactive Query Input & Preset Pills */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={dnsQuery}
                  onChange={(e) => setDnsQuery(e.target.value)}
                  className="flex-1 rounded-xl bg-surface-container border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-desired-state"
                  placeholder="Enter DNS query (e.g., auth-service.production)..."
                />
                <button
                  onClick={() => setDnsUseCache(!dnsUseCache)}
                  className={`px-4 py-2 rounded-xl border transition-all ${
                    dnsUseCache
                      ? "bg-success-glow/20 border-success-glow text-success-glow"
                      : "bg-surface-container border-white/10 text-on-surface-variant"
                  }`}
                >
                  {dnsUseCache ? "⚡ Cache: WARM (0.2ms)" : "❄️ Cache: BYPASS"}
                </button>
              </div>

              {/* Preset Query Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] text-on-surface-variant">Presets:</span>
                {[
                  { q: "auth-service.production.svc.cluster.local", label: "auth-service.production (ClusterIP)" },
                  { q: "payment-service.staging", label: "payment.staging (Search Path)" },
                  { q: "postgres-master.database", label: "postgres (Headless SRV)" },
                  { q: "api.stripe.com", label: "api.stripe.com (External Upstream)" },
                  { q: "ghost-service.unknown", label: "ghost-service (NXDOMAIN)" },
                ].map((item) => (
                  <button
                    key={item.q}
                    onClick={() => {
                      setDnsQuery(item.q);
                      handleExecuteDns(item.q);
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] transition-all ${
                      dnsQuery === item.q
                        ? "bg-desired-state/20 border-desired-state text-desired-state font-bold"
                        : "bg-surface-container border-white/5 text-on-surface-variant hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4-Stage Interactive Visual Flow Pipeline */}
            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-on-surface-variant">
                <span>DNS Protocol Resolution Lifecycle</span>
                <span className="text-desired-state">
                  {dnsStep === "client" ? "1. Client Resolv.conf Triggered" : dnsStep === "search" ? "2. Expanding Search Domains" : dnsStep === "coredns" ? "3. CoreDNS Cluster Querying" : dnsStep === "resolved" ? "4. Record Answer Delivered" : "Awaiting Query"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Stage 1: Client Pod */}
                <div className={`p-4 rounded-xl border transition-all ${
                  dnsStep === "client" || dnsStep === "search"
                    ? "border-cyan bg-cyan/15 text-white shadow-[0_0_20px_rgba(0,210,255,0.3)] scale-102"
                    : "border-white/10 bg-surface-container text-on-surface-variant"
                }`}>
                  <div className="flex justify-between items-center text-cyan font-bold mb-1">
                    <span>1. Client Pod</span>
                    <span className="text-[9px]">10.244.1.42</span>
                  </div>
                  <div className="text-[10px] text-white">App: <code>checkout-frontend</code></div>
                  <div className="text-[9px] text-on-surface-variant mt-1">Dispatches UDP:53 socket query</div>
                </div>

                {/* Stage 2: resolv.conf Search Engine */}
                <div className={`p-4 rounded-xl border transition-all ${
                  dnsStep === "search"
                    ? "border-desired-state bg-desired-state/15 text-white shadow-[0_0_20px_rgba(189,0,255,0.3)] scale-102"
                    : "border-white/10 bg-surface-container text-on-surface-variant"
                }`}>
                  <div className="flex justify-between items-center text-desired-state font-bold mb-1">
                    <span>2. /etc/resolv.conf</span>
                    <span className="text-[9px]">ndots:5</span>
                  </div>
                  <div className="text-[10px] text-white truncate"><code>nameserver 10.96.0.10</code></div>
                  <div className="text-[9px] text-on-surface-variant mt-1">Expands <code>.production.svc.cluster.local</code></div>
                </div>

                {/* Stage 3: CoreDNS Cluster */}
                <div className={`p-4 rounded-xl border transition-all ${
                  dnsStep === "coredns"
                    ? "border-primary bg-primary/20 text-white shadow-[0_0_20px_rgba(0,210,255,0.4)] scale-102"
                    : "border-white/10 bg-surface-container text-on-surface-variant"
                }`}>
                  <div className="flex justify-between items-center text-primary font-bold mb-1">
                    <span>3. CoreDNS HA Fleet</span>
                    <span className="text-[9px]">10.96.0.10:53</span>
                  </div>
                  <div className="text-[10px] text-white">2 Replicas Active</div>
                  <div className="text-[9px] text-on-surface-variant mt-1">Plugin: <code>kubernetes + cache</code></div>
                </div>

                {/* Stage 4: DNS Answer */}
                <div className={`p-4 rounded-xl border transition-all ${
                  dnsStep === "resolved" && dnsResult
                    ? dnsResult.rcode === "NOERROR"
                      ? "border-success-glow bg-success-glow/20 text-white shadow-[0_0_20px_rgba(0,255,194,0.3)] scale-102"
                      : "border-error-pulse bg-error-pulse/20 text-white shadow-[0_0_20px_rgba(255,0,92,0.3)] scale-102"
                    : "border-white/10 bg-surface-container text-on-surface-variant"
                }`}>
                  <div className="flex justify-between items-center font-bold mb-1">
                    <span className={dnsResult?.rcode === "NOERROR" ? "text-success-glow" : "text-error-pulse"}>
                      4. Answer Record
                    </span>
                    <span className="text-[9px]">{dnsResult?.latency || "Ready"}</span>
                  </div>
                  <div className="text-[10px] text-white truncate">{dnsResult?.ip || "Awaiting DNS reply"}</div>
                  <div className="text-[9px] text-on-surface-variant mt-1">{dnsResult?.rcode || "Status: IDLE"}</div>
                </div>
              </div>
            </div>

            {/* Real-Time Protocol Header Inspector */}
            {dnsResult && (
              <div className="rounded-2xl bg-black/70 border border-desired-state/40 p-5 font-mono text-xs space-y-4 animate-scaleIn">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-desired-state font-bold">✓ DNS Header Inspection</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      dnsResult.rcode === "NOERROR" ? "bg-success-glow/20 text-success-glow" : "bg-error-pulse/20 text-error-pulse"
                    }`}>
                      RCODE: {dnsResult.rcode}
                    </span>
                  </div>
                  <div className="text-[10px] text-on-surface-variant flex items-center gap-3">
                    <span>Cache: <strong className={dnsResult.cacheStatus === "HIT" ? "text-success-glow" : "text-amber-400"}>{dnsResult.cacheStatus}</strong></span>
                    <span>Round-Trip: <strong className="text-white">{dnsResult.latency}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded-xl bg-surface-container border border-white/5 space-y-1">
                    <div className="text-[10px] text-on-surface-variant uppercase font-bold">Query Question</div>
                    <div className="text-white font-bold truncate">{dnsResult.resolvedName}</div>
                    <div className="text-[10px] text-cyan">Record Class: IN (Internet) | Type: A</div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container border border-white/5 space-y-1">
                    <div className="text-[10px] text-on-surface-variant uppercase font-bold">Resolved Answer</div>
                    <div className="text-success-glow font-bold text-sm truncate">{dnsResult.ip}</div>
                    <div className="text-[10px] text-on-surface-variant">TTL Remaining: {dnsResult.ttl}s</div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container border border-white/5 space-y-1">
                    <div className="text-[10px] text-on-surface-variant uppercase font-bold">Authoritative Authority</div>
                    <div className="text-white truncate">Zone: {dnsResult.zone}</div>
                    <div className="text-[10px] text-desired-state">CoreDNS Server (10.96.0.10:53)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SUBMODULE 6: NetworkPolicy Zero-Trust Firewall
        ══════════════════════════════════════════════════════════════════ */}
        {activeSubModule === "policy" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-white">NetworkPolicy Zero-Trust Firewall</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                By default, all pods can talk to all pods. NetworkPolicies enforce zero-trust microsegmentation using pod label selectors.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container border border-white/10">
              <span className="font-mono text-xs text-white">Allow Frontend Pods to access Database Pods (Port 5432):</span>
              <button
                onClick={() => setAllowDbAccess(!allowDbAccess)}
                className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                  allowDbAccess
                    ? "bg-success-glow/20 border border-success-glow text-success-glow"
                    : "bg-error-pulse/20 border border-error-pulse text-error-pulse"
                }`}
              >
                {allowDbAccess ? "POLICY: ALLOWED (Whitelist Rule)" : "POLICY: DENIED (Default Isolation)"}
              </button>
            </div>

            {/* Visual Firewall Packet Gate */}
            <div className="p-5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs space-y-4">
              <div className="text-[10px] text-on-surface-variant uppercase font-bold">Live Firewall Transmission Gate</div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center">
                <div className="p-3.5 rounded-xl bg-surface-container border border-cyan/30 text-cyan">
                  <div className="font-bold">Frontend Pod</div>
                  <div className="text-[9px] text-on-surface-variant">role: frontend</div>
                </div>

                <div className="flex justify-center items-center">
                  <svg className={`w-6 h-6 transition-all ${policyTesting ? "text-amber-400 animate-pulse scale-125" : "text-white/20"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                <div className={`p-3.5 rounded-xl border font-bold transition-all ${
                  allowDbAccess
                    ? "border-success-glow bg-success-glow/20 text-success-glow shadow-[0_0_20px_rgba(0,255,194,0.3)]"
                    : "border-error-pulse bg-error-pulse/20 text-error-pulse shadow-[0_0_20px_rgba(255,0,92,0.3)]"
                }`}>
                  <div>{allowDbAccess ? "🛡️ Firewall: OPEN" : "⛔ Firewall: DROP"}</div>
                  <div className="text-[9px] text-on-surface-variant mt-0.5">{allowDbAccess ? "Rule #1 Matched" : "No Ingress Rule"}</div>
                </div>

                <div className="flex justify-center items-center">
                  <svg className={`w-6 h-6 transition-all ${policyTesting ? (allowDbAccess ? "text-success-glow" : "text-error-pulse") + " animate-pulse scale-125" : "text-white/20"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container border border-purple-400/40 text-purple-400">
                  <div className="font-bold">PostgreSQL DB</div>
                  <div className="text-[9px] text-on-surface-variant">role: db (5432)</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={handleTestPolicy}
                disabled={policyTesting}
                className="px-6 py-2.5 rounded-xl bg-amber-400/20 border border-amber-400/50 text-amber-400 font-mono text-xs font-bold uppercase hover:bg-amber-400/30 transition-all disabled:opacity-50"
              >
                {policyTesting ? "⚡ Testing Connection..." : "⚡ Test Network Connection (Frontend ➔ DB)"}
              </button>
            </div>

            {policyTestStatus !== "idle" && (
              <div
                className={`rounded-xl p-4 font-mono text-xs text-center border animate-scaleIn ${
                  policyTestStatus === "allowed"
                    ? "bg-success-glow/15 border-success-glow text-success-glow shadow-[0_0_20px_rgba(0,255,194,0.2)]"
                    : "bg-error-pulse/15 border-error-pulse text-error-pulse shadow-[0_0_20px_rgba(255,0,92,0.2)]"
                }`}
              >
                {policyTestStatus === "allowed"
                  ? "✓ Connection Succeeded: Ingress rule matched pod selector `role: frontend` on port 5432."
                  : "✕ Connection Blocked: Dropped by CNI (calico/cilium) policy filter. No matching ingress rule."}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SUBMODULE 7: Real-World Usecases
        ══════════════════════════════════════════════════════════════════ */}
        {activeSubModule === "usecases" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <div className="glass-panel p-6 rounded-2xl border border-success-glow/30 space-y-3">
              <div className="text-2xl">🔒</div>
              <h3 className="font-display text-lg font-bold text-white">1. PCI-DSS Compliance Isolation</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Use zero-trust NetworkPolicies to completely isolate payment gateway pods from public web nodes, preventing lateral movement in case of security breaches.
              </p>
              <div className="pt-2 font-mono text-[10px] text-success-glow">
                ✓ Default Deny ingress / egress
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-cyan/30 space-y-3">
              <div className="text-2xl">⚡</div>
              <h3 className="font-display text-lg font-bold text-white">2. eBPF High-Performance Routing</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Modern CNIs like Cilium bypass iptables bottlenecks by injecting eBPF bytecode directly into Linux socket layers, reducing packet latency by up to 50%.
              </p>
              <div className="pt-2 font-mono text-[10px] text-cyan">
                ✓ Line-rate 100Gbps packet forwarding
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-desired-state/30 space-y-3">
              <div className="text-2xl">🌐</div>
              <h3 className="font-display text-lg font-bold text-white">3. Global Multi-Cluster Mesh</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Connect Kubernetes clusters in different cloud regions via WireGuard encrypted tunnels, enabling cross-region service discovery and seamless failover.
              </p>
              <div className="pt-2 font-mono text-[10px] text-desired-state">
                ✓ End-to-end mTLS zero-trust mesh
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
