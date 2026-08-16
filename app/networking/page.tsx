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

  // Packet Journey State
  const [packetStep, setPacketStep] = useState<PacketStep>("idle");
  const [selectedPodTarget, setSelectedPodTarget] = useState<number>(1);
  const [packetLogs, setPacketLogs] = useState<string[]>([
    "Ready to initiate packet transmission.",
  ]);

  // Service Types State
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>("ClusterIP");

  // Ingress Routing State
  const [ingressPath, setIngressPath] = useState<string>("/api/v1/checkout");

  // DNS State
  const [dnsQuery, setDnsQuery] = useState("auth-service.production.svc.cluster.local");
  const [dnsResult, setDnsResult] = useState<string | null>(null);

  // NetworkPolicy State
  const [allowDbAccess, setAllowDbAccess] = useState(false);
  const [policyTestStatus, setPolicyTestStatus] = useState<"idle" | "allowed" | "blocked">("idle");

  // VXLAN Overlay Simulation State
  const [vxlanStep, setVxlanStep] = useState<"idle" | "veth" | "cni0" | "encap" | "wire" | "decap" | "pod2">("idle");
  const [vxlanLogs, setVxlanLogs] = useState<string[]>([
    "VXLAN Tunnel Engine Ready. Click 'Transmit Cross-Node Packet' to initiate encapsulation.",
  ]);

  const startVxlanSimulation = () => {
    if (vxlanStep !== "idle" && vxlanStep !== "pod2") return;
    setVxlanStep("veth");
    setVxlanLogs(["[0.0ms] Pod-1 (10.244.1.5) kernel sends IP packet to default gateway via veth pair."]);

    setTimeout(() => {
      setVxlanStep("cni0");
      setVxlanLogs((p) => ["[0.3ms] cni0 Linux bridge intercepts packet. Determines destination 10.244.2.8 is off-node.", ...p]);

      setTimeout(() => {
        setVxlanStep("encap");
        setVxlanLogs((p) => ["[0.7ms] CNI VXLAN Device (flannel.1 / cilium_vxlan): Prepends VNI=1 + Outer UDP Header (Src: 192.168.1.10, Dst: 192.168.1.20:8472).", ...p]);

        setTimeout(() => {
          setVxlanStep("wire");
          setVxlanLogs((p) => ["[1.4ms] Physical Underlay Switch routes UDP/8472 packet across data center network fabric.", ...p]);

          setTimeout(() => {
            setVxlanStep("decap");
            setVxlanLogs((p) => ["[2.0ms] Node-B (192.168.1.20) Kernel decapsulates outer VXLAN frame. Inner packet exposed.", ...p]);

            setTimeout(() => {
              setVxlanStep("pod2");
              setVxlanLogs((p) => ["[2.4ms] ✅ Packet delivered directly to Pod-2 eth0 namespace with original IP intact (10.244.2.8)!", ...p]);
            }, 700);
          }, 700);
        }, 700);
      }, 700);
    }, 700);
  };

  const startPacketJourney = () => {
    if (packetStep !== "idle" && packetStep !== "response") return;

    const randomTarget = Math.floor(Math.random() * 3) + 1;
    setSelectedPodTarget(randomTarget);
    setPacketStep("browser");
    setPacketLogs([`[0ms] User Browser dispatching GET /api/v1/data`]);

    setTimeout(() => {
      setPacketStep("ingress");
      setPacketLogs((p) => [`[4ms] Ingress Controller: TLS terminated, host routing evaluated`, ...p]);

      setTimeout(() => {
        setPacketStep("service");
        setPacketLogs((p) => [`[8ms] K8s Service (ClusterIP): Resolving EndpointSlice targets`, ...p]);

        setTimeout(() => {
          setPacketStep("dataplane");
          setPacketLogs((p) => [`[12ms] kube-proxy / eBPF: Executing DNAT to 10.244.${randomTarget}.15`, ...p]);

          setTimeout(() => {
            setPacketStep("pod");
            setPacketLogs((p) => [`[16ms] Pod-${randomTarget} eth0: Packet received on virtual interface`, ...p]);

            setTimeout(() => {
              setPacketStep("container");
              setPacketLogs((p) => [`[20ms] Container Process: HTTP 200 OK generated`, ...p]);

              setTimeout(() => {
                setPacketStep("response");
                setPacketLogs((p) => [`[25ms] Response safely returned to user browser (200 OK)`, ...p]);
              }, 800);
            }, 800);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const handleDnsLookup = () => {
    if (dnsQuery.includes("auth-service")) {
      setDnsResult("10.96.14.88 (ClusterIP VIP)");
    } else if (dnsQuery.includes("payment")) {
      setDnsResult("10.96.220.104 (ClusterIP VIP)");
    } else {
      setDnsResult("10.96.0.42 (Resolved via CoreDNS 10.96.0.10)");
    }
  };

  const handleTestPolicy = () => {
    setPolicyTestStatus("idle");
    setTimeout(() => {
      setPolicyTestStatus(allowDbAccess ? "allowed" : "blocked");
    }, 400);
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
              Trace packets from client browsers through Ingress controllers, L4 services, CoreDNS discovery, and zero-trust firewalls.
            </p>
          </div>

          {/* Submodule Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-surface-container p-1 rounded-xl border border-white/10 font-mono text-xs">
            {[
              { key: "journey", label: "⚡ Packet Journey" },
              { key: "overlay", label: "Pod Overlay (CNI)" },
              { key: "services", label: "Services (L4)" },
              { key: "ingress", label: "Ingress (L7)" },
              { key: "dns", label: "CoreDNS" },
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

        {/* ══════════ SUBMODULE 1: Signature Packet Journey ══════════ */}
        {activeSubModule === "journey" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border relative overflow-hidden space-y-8">
              <div className="scan-line" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Live Packet Journey Simulation</h2>
                  <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                    Click Send Request to watch a packet traverse the complete Kubernetes networking data plane in real-time.
                  </p>
                </div>
                <button
                  onClick={startPacketJourney}
                  disabled={packetStep !== "idle" && packetStep !== "response"}
                  className="px-6 py-3 rounded-xl bg-success-glow/20 border border-success-glow/50 text-success-glow font-mono text-xs font-bold uppercase hover:bg-success-glow/30 transition-all shadow-[0_0_20px_rgba(0,255,194,0.3)] disabled:opacity-40"
                >
                  {packetStep === "idle" || packetStep === "response" ? "▶ Send Request" : "⚡ Routing Packet..."}
                </button>
              </div>

              {/* Packet Pipeline Diagram */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 pt-2">
                {[
                  { key: "browser", title: "1. Browser", desc: "GET /api/v1/data", icon: "💻" },
                  { key: "ingress", title: "2. Ingress", desc: "TLS & L7 Router", icon: "🌐" },
                  { key: "service", title: "3. Service", desc: "ClusterIP VIP", icon: "⚙️" },
                  { key: "dataplane", title: "4. Dataplane", desc: "DNAT iptables/eBPF", icon: "⚡" },
                  { key: "pod", title: "5. Pod eth0", desc: `Target: Pod-${selectedPodTarget}`, icon: "📦" },
                  { key: "container", title: "6. Container", desc: "HTTP 200 OK", icon: "🚀" },
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
                      className={`p-4 rounded-xl border font-mono text-xs text-center transition-all duration-300 relative ${
                        isActive
                          ? "bg-success-glow/20 border-success-glow text-success-glow shadow-[0_0_25px_rgba(0,255,194,0.35)] scale-105"
                          : isPassed
                          ? "bg-surface-container border-success-glow/40 text-white"
                          : "bg-surface-container/50 border-white/5 text-on-surface-variant opacity-60"
                      }`}
                    >
                      <div className="text-2xl mb-1">{step.icon}</div>
                      <div className="font-bold text-[11px]">{step.title}</div>
                      <div className="text-[9px] text-on-surface-variant mt-0.5">{step.desc}</div>
                      {isActive && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-success-glow text-black font-bold text-[8px] animate-bounce">
                          ACTIVE
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Live Target Pod Fleet */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-xs text-primary font-bold">ENDPOINTSLICE TARGET POOL</span>
                  <span className="font-mono text-[10px] text-on-surface-variant">Round-Robin Load Balancing</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((podId) => {
                    const isTargeted = selectedPodTarget === podId && (packetStep === "pod" || packetStep === "container");
                    return (
                      <div
                        key={podId}
                        className={`p-4 rounded-xl border font-mono text-xs transition-all duration-300 ${
                          isTargeted
                            ? "border-success-glow bg-success-glow/15 shadow-[0_0_20px_rgba(0,255,194,0.3)] scale-102"
                            : "border-white/10 bg-surface-container"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">pod-app-instance-{podId}</span>
                          <span className="text-[10px] text-success-glow">● Healthy</span>
                        </div>
                        <div className="text-[10px] text-on-surface-variant mt-1">IP: 10.244.{podId}.15</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Packet Telemetry Logs */}
              <div className="rounded-xl bg-black/60 border border-white/10 p-4 font-mono text-xs space-y-1 max-h-36 overflow-y-auto">
                <div className="text-[10px] text-on-surface-variant border-b border-white/10 pb-1 uppercase font-bold">
                  Data Plane Telemetry Stream
                </div>
                {packetLogs.map((log, i) => (
                  <div key={i} className="text-success-glow text-[11px]">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SUBMODULE 2: Pod-to-Pod Overlay (CNI) ══════════ */}
        {activeSubModule === "overlay" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-8 animate-fadeIn">
            {/* Header & Controls */}
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
                        PACKET HERE
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

        {/* ══════════ SUBMODULE 3: Service Types (L4) ══════════ */}
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

            <div className="glass-panel rounded-2xl p-6 border border-white/10 tech-border space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="font-mono text-xs text-primary font-bold uppercase">{selectedServiceType} Specification</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
                  K8s Core V1
                </span>
              </div>

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

        {/* ══════════ SUBMODULE 4: Ingress (L7) ══════════ */}
        {activeSubModule === "ingress" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Ingress Controller (L7 HTTP Routing)</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                Ingress routes HTTP/HTTPS requests based on hostnames and URL paths, terminating SSL/TLS certificates at the edge.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-container border border-white/10 space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span>Test Request Path:</span>
                  <span className="text-cyan font-bold">https://api.mycompany.com{ingressPath}</span>
                </div>
                <div className="flex gap-2">
                  {["/api/v1/checkout", "/api/v1/auth", "/app/dashboard"].map((path) => (
                    <button
                      key={path}
                      onClick={() => setIngressPath(path)}
                      className={`px-3 py-1.5 rounded font-mono text-xs border ${
                        ingressPath === path ? "bg-cyan/20 border-cyan text-cyan font-bold" : "bg-black/40 border-white/10 text-on-surface-variant"
                      }`}
                    >
                      {path}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-black/60 border border-cyan/40 font-mono text-xs space-y-2">
                <div className="text-cyan font-bold">Ingress Route Resolution:</div>
                <div className="text-[11px] text-white">
                  Target Service:{" "}
                  <span className="text-success-glow font-bold">
                    {ingressPath.includes("checkout") ? "checkout-service:8080 (3 Replicas)" : ingressPath.includes("auth") ? "auth-service:4000 (2 Replicas)" : "frontend-service:80 (5 Replicas)"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SUBMODULE 5: CoreDNS ══════════ */}
        {activeSubModule === "dns" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-white">CoreDNS Cluster Resolution</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                Kubernetes runs CoreDNS as an internal naming authority. Every service automatically receives a standard DNS entry: <code>&lt;service&gt;.&lt;namespace&gt;.svc.cluster.local</code>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={dnsQuery}
                onChange={(e) => setDnsQuery(e.target.value)}
                className="flex-1 rounded-xl bg-surface-container border border-white/10 px-4 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-desired-state"
                placeholder="Enter service DNS query..."
              />
              <button
                onClick={handleDnsLookup}
                className="px-6 py-2.5 rounded-xl bg-desired-state/20 border border-desired-state text-desired-state font-mono text-xs font-bold uppercase hover:bg-desired-state/30 transition-all shadow-[0_0_15px_rgba(189,0,255,0.25)]"
              >
                Resolve DNS
              </button>
            </div>

            {dnsResult && (
              <div className="rounded-xl bg-black/60 border border-desired-state/40 p-4 font-mono text-xs space-y-1 animate-scaleIn">
                <div className="text-desired-state font-bold">✓ CoreDNS Response (Authoritative Answer)</div>
                <div className="text-white">Query: {dnsQuery}</div>
                <div className="text-success-glow font-bold">Address: {dnsResult}</div>
              </div>
            )}
          </div>
        )}

        {/* ══════════ SUBMODULE 6: NetworkPolicy Firewall ══════════ */}
        {activeSubModule === "policy" && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 tech-border space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-display text-xl font-bold text-white">NetworkPolicy Zero-Trust Firewall</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                By default, all pods can talk to all pods. NetworkPolicies enforce zero-trust firewalls using pod label selectors.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container border border-white/10">
              <span className="font-mono text-xs text-white">Allow Frontend Pods to access Database Pods:</span>
              <button
                onClick={() => setAllowDbAccess(!allowDbAccess)}
                className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                  allowDbAccess
                    ? "bg-success-glow/20 border border-success-glow text-success-glow"
                    : "bg-error-pulse/20 border border-error-pulse text-error-pulse"
                }`}
              >
                {allowDbAccess ? "POLICY: ALLOWED (Whitelist)" : "POLICY: DENIED (Default Isolation)"}
              </button>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={handleTestPolicy}
                className="px-6 py-2.5 rounded-xl bg-amber-400/20 border border-amber-400/50 text-amber-400 font-mono text-xs font-bold uppercase hover:bg-amber-400/30 transition-all"
              >
                ⚡ Test Network Connection (Frontend ➔ DB)
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

        {/* ══════════ SUBMODULE 7: Real-World Usecases ══════════ */}
        {activeSubModule === "usecases" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <div className="glass-panel p-6 rounded-2xl border border-success-glow/30 space-y-3">
              <div className="text-2xl">🔒</div>
              <h3 className="font-display text-lg font-bold text-white">1. PCI-DSS Compliance Isolation</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                NetworkPolicies isolate payment tokenization pods in a dedicated namespace, allowing ingress ONLY from the verified API Gateway.
              </p>
              <div className="pt-2 font-mono text-[10px] text-success-glow">
                ✓ Zero lateral movement attack vectors
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-cyan/30 space-y-3">
              <div className="text-2xl">⚖️</div>
              <h3 className="font-display text-lg font-bold text-white">2. Canary Traffic Splitting</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Ingress annotations split user traffic: 90% goes to production v1.0 and 10% to canary v2.0 to test performance under live production load.
              </p>
              <div className="pt-2 font-mono text-[10px] text-cyan">
                ✓ Zero risk releases
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-desired-state/30 space-y-3">
              <div className="text-2xl">🌐</div>
              <h3 className="font-display text-lg font-bold text-white">3. Multi-Cluster Service Discovery</h3>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                CoreDNS forwarding connects on-prem Kubernetes clusters to cloud AWS/GCP clusters for hybrid multi-cloud failover.
              </p>
              <div className="pt-2 font-mono text-[10px] text-desired-state">
                ✓ Seamless hybrid cloud routing
              </div>
            </div>
          </div>
        )}

        {/* Bottom Module Navigation */}
        <div className="border-t border-white/10 pt-8 flex justify-between items-center font-mono text-xs">
          <Link
            href="/kubernetes"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container border border-white/10 text-on-surface-variant hover:text-white hover:border-white/30 transition-all module-nav-card"
          >
            <span>←</span>
            <span>Module 02 Kubernetes</span>
          </Link>
          <Link
            href="/topology"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-desired-state/15 border border-desired-state/40 text-desired-state hover:bg-desired-state/25 hover:border-desired-state transition-all font-bold module-nav-card shadow-[0_0_15px_rgba(189,0,255,0.2)]"
          >
            <span>Next: Module 04 Topology</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
