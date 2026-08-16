# 🌐 KubeVerse — Motion-First Cloud Native Visual Laboratory

> **See • Understand • Interact**  
> An interactive, cinematic visual laboratory designed to help engineers, students, and architects master Linux Containers, Docker, Kubernetes, and Cloud Native Networking through live simulations rather than text walls.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/yashk0505/kubeverse/blob/main/LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

---

## 🚀 Interactive Curriculum & Modules

KubeVerse breaks down complex distributed systems into 6 interactive modules with live controls, step debuggers, and real-world scenarios:

```
KUBEVERSE
├── 01. EXPLORE JOURNEY (/explore)
│   └── 12-Scene sequential cinematic learning odyssey from bare-metal to self-healing.
│
├── 02. LINUX CONTAINERS (/containers)
│   ├── Layer Anatomy: Single-stage (1.14GB) vs Multi-stage (29.8MB) image optimizer.
│   ├── Dockerfile Caching Simulator: Line-by-line build cache hits & cache misses.
│   ├── Lifecycle State Machine: Direct controls for build, create, start, pause, stop, rm.
│   ├── Kernel Namespaces & Cgroups: PID, NET veth, OverlayFS & OOM-Killer trigger.
│   └── Container vs VM Benchmark: RAM footprint (8MB vs 1.2GB) & boot latency slider.
│
├── 03. KUBERNETES ENGINE (/kubernetes)
│   ├── Control Plane Architecture: API Server, etcd, Scheduler, Controller Manager.
│   ├── Pod Design Patterns: Single container, Sidecar logging, InitContainer flows.
│   ├── Workload Controllers: Deployment, StatefulSet (sticky IDs), DaemonSet, Job.
│   ├── Zero-Downtime Rolling Update: maxSurge=1 rollover & instant kubectl rollout undo.
│   ├── Horizontal Pod Autoscaler (HPA): Real-time traffic load scaling pod replicas.
│   ├── Persistent Storage (PVC): StorageClass gp3 ➔ PVC 50Gi ➔ PV volume binding.
│   └── ConfigMaps & Secrets: Live environment variable injection without rebuilds.
│
├── 04. NETWORKING & CNI (/networking)
│   ├── Signature Packet Journey: Browser ➔ Ingress ➔ Service VIP ➔ Dataplane ➔ Pod.
│   ├── CNI Pod Overlay: VXLAN cross-node encapsulation & decapsulation.
│   ├── L4 Services: ClusterIP, NodePort :30080, LoadBalancer, ExternalName.
│   ├── L7 Ingress Controller: Path-based routing (/api, /auth, /checkout) & SSL.
│   ├── CoreDNS Discovery: Authoritative cluster.local DNS query simulator.
│   └── NetworkPolicy Firewall: Zero-trust microsegmentation & whitelist rules.
│
├── 05. CLUSTER TOPOLOGY (/topology)
│   ├── Fleet Canvas: Control Plane hub connected via live SVG lines to Worker nodes.
│   ├── Application Tiers: Frontend, API Gateway, Workers, Redis Cache, PostgreSQL.
│   ├── etcd Raft Store Matrix: Key-value table (/registry/pods, /services) & revisions.
│   ├── Affinity & Taints Engine: Node taints (gpu=true:NoSchedule) & tolerations.
│   └── Node Fleet Maintenance: Differentiated Cordon & Drain eviction workflows.
│
└── 06. SANDBOX MATRIX (/playground)
    ├── Explore Sandbox: Load Balancer hub, traffic generator, drag-and-drop pods, chaos.
    ├── Declarative GitOps Editor: Live in-browser YAML editor with kubectl apply -f sync.
    └── 5 Guided Missions: HA Self-healing, Traffic Surges, Diversity, Node Drain, GitOps.
```

---

## ⚡ Key Architectural Features

- **Zero-Lag Vector Brand Preloader**: Clean geometric SVG identity icon (Container ➔ Pod ➔ Node ➔ Cluster) with smooth 2.3s intro and skip support.
- **Contextual Inter-Page Transition**: Destination-aware loader displaying verified Kubernetes tips, facts, and did-you-know trivia during navigation.
- **Real-Time Interactive State**: Dynamic self-healing loops, Chaos node disrupters, traffic surge sliders, and packet tracers.
- **Responsive & Dark-First Aesthetic**: Tailored for high-end technical visualization with subtle grids, neon vector paths, and micro-interactions.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Client Hooks)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS Hardware-Accelerated Transforms
- **Icons & Graphics**: Pure vector SVGs & Lucide Icons
- **Fonts**: Inter, Archivo Black, and IBM Plex Mono (Google Fonts)

---

## 💻 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yashk0505/kubeverse.git

# Enter project directory
cd kubeverse

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
# Compile and build static application
npm run build

# Start production server
npm run start
```

---

## 📂 Project Structure

```
kubeverse/
├── app/                  # Next.js App Router routes
│   ├── layout.tsx        # Root layout with HUD sidebar, nav, & transition loader
│   ├── page.tsx          # Main homepage curriculum & feature showcases
│   ├── explore/          # 12-scene Kubernetes cinematic journey
│   ├── containers/       # Linux namespaces, cgroups, layers & lifecycle
│   ├── docker/           # Docker build caching and images
│   ├── kubernetes/       # Workload controllers, rolling updates, HPA & storage
│   ├── networking/       # Packet Journey, CNI, Services, Ingress, & NetworkPolicy
│   ├── topology/         # Control plane ↔ worker fleet, etcd, & taints
│   └── playground/       # Sandbox mode, live YAML GitOps, & 5 guided missions
├── components/           # Reusable UI & visualization components
│   ├── KubeLoader.tsx    # Technical transition loader & educational tips system
│   ├── Preloader.tsx     # Brand intro first-load animation
│   ├── Nav.tsx           # Global header navigation bar
│   ├── Footer.tsx        # Clean minimalist footer
│   ├── HudSidebar.tsx    # Telemetry HUD sidebar
│   └── PageTransition.tsx# Inter-page route transition manager
├── lib/                  # Utilities & data models
│   └── tipsAndFacts.ts   # Educational tips, facts, and route metadata
├── public/               # Static assets & web fonts
├── tailwind.config.ts    # Design tokens & color palettes
└── package.json
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

**Yash**  
- GitHub: [@yashk0505](https://github.com/yashk0505)
- Repository: [https://github.com/yashk0505/kubeverse](https://github.com/yashk0505/kubeverse)
