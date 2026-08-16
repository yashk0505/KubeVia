export interface EducationalEntry {
  category: "TIP" | "FACT" | "DID YOU KNOW?";
  text: string;
  module?: string;
}

export interface RouteMeta {
  title: string;
  subtitle: string;
  tag: string;
}

export const ROUTE_LOADING_META: Record<string, RouteMeta> = {
  "/": {
    title: "INITIALIZING KUBEVERSE",
    subtitle: "Preparing interactive cloud native experience",
    tag: "CORE // COMMAND CENTER",
  },
  "/explore": {
    title: "PREPARING KUBERNETES JOURNEY",
    subtitle: "Loading step-by-step interactive curriculum",
    tag: "MODULE 00 // ODYSSEY",
  },
  "/containers": {
    title: "PREPARING CONTAINER LAB",
    subtitle: "Mounting namespaces, cgroups & layer visualizer",
    tag: "MODULE 01 // CONTAINERS",
  },
  "/docker": {
    title: "LOADING DOCKER BLUEPRINTS",
    subtitle: "Initializing build cache engine & images",
    tag: "MODULE 02 // DOCKER",
  },
  "/kubernetes": {
    title: "INITIALIZING KUBERNETES CONCEPTS",
    subtitle: "Loading workload controllers & state reconciliation",
    tag: "MODULE 03 // ORCHESTRATION",
  },
  "/networking": {
    title: "BUILDING NETWORK TOPOLOGY",
    subtitle: "Connecting Ingress, Services, CoreDNS & CNI",
    tag: "MODULE 04 // NETWORKING",
  },
  "/service-map": {
    title: "COMPUTING SERVICE MESH",
    subtitle: "Tracing microservice endpoints & traffic flow",
    tag: "MODULE 04 // SERVICE MESH",
  },
  "/topology": {
    title: "GENERATING CLUSTER TOPOLOGY",
    subtitle: "Synchronizing control plane & worker fleet",
    tag: "MODULE 05 // TOPOLOGY",
  },
  "/playground": {
    title: "STARTING KUBERNETES SIMULATION",
    subtitle: "Spawning sandbox runtime & node matrix",
    tag: "SANDBOX // SIMULATION RUNTIME",
  },
};

export const EDUCATIONAL_TIPS: EducationalEntry[] = [
  {
    category: "TIP",
    text: "A Pod is the smallest schedulable and deployable unit in Kubernetes.",
    module: "kubernetes",
  },
  {
    category: "TIP",
    text: "A Pod can contain one or more containers that share the exact same network IP and storage volumes.",
    module: "kubernetes",
  },
  {
    category: "TIP",
    text: "Kubernetes continuously reconciles actual cluster state against your declared desired state.",
    module: "kubernetes",
  },
  {
    category: "TIP",
    text: "Services provide a stable virtual IP address and DNS name for dynamic, ephemeral Pods.",
    module: "networking",
  },
  {
    category: "TIP",
    text: "Containers share the host Linux kernel, eliminating virtual machine hypervisor overhead.",
    module: "containers",
  },
  {
    category: "TIP",
    text: "The kube-scheduler evaluates CPU, memory limits, and node taints to place incoming Pods.",
    module: "topology",
  },
  {
    category: "TIP",
    text: "When a Pod crashes, the Controller Manager detects the state mismatch and spawns a replacement.",
    module: "kubernetes",
  },
  {
    category: "TIP",
    text: "Worker Nodes run kubelet, containerd runtime, and kube-proxy to execute workloads.",
    module: "topology",
  },
  {
    category: "FACT",
    text: "Kubernetes was originally designed by Google engineers and derived from the internal Borg system.",
  },
  {
    category: "FACT",
    text: "Kubernetes is commonly abbreviated as K8s (representing the 8 letters between 'K' and 's').",
  },
  {
    category: "DID YOU KNOW?",
    text: "The name Kubernetes originates from the Greek word κυβερνήτης, meaning 'helmsman' or 'pilot'.",
  },
  {
    category: "DID YOU KNOW?",
    text: "Kubernetes is open-source and graduated under the Cloud Native Computing Foundation (CNCF).",
  },
  {
    category: "DID YOU KNOW?",
    text: "etcd uses the Raft consensus algorithm to maintain distributed, strongly consistent cluster state.",
    module: "topology",
  },
  {
    category: "TIP",
    text: "NetworkPolicies act as zero-trust firewalls between pods using label selectors.",
    module: "networking",
  },
  {
    category: "TIP",
    text: "ConfigMaps and Secrets decouple configuration and sensitive keys from container images.",
    module: "kubernetes",
  },
];

export function getRandomTip(): EducationalEntry {
  return EDUCATIONAL_TIPS[Math.floor(Math.random() * EDUCATIONAL_TIPS.length)];
}

export function getRouteMeta(pathname: string): RouteMeta {
  const cleanPath = pathname.split("?")[0].split("#")[0];
  return (
    ROUTE_LOADING_META[cleanPath] || {
      title: "LOADING KUBERNETES MODULE",
      subtitle: "Preparing visual learning interactive canvas",
      tag: `ROUTE // ${cleanPath.toUpperCase().replace("/", "") || "ROOT"}`,
    }
  );
}
