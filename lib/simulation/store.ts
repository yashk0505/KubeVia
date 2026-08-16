"use client";

import { create } from "zustand";
import type { NodeModel, PodModel, ClusterEvent, AppType } from "./types";
import { pickNode } from "./scheduler";

let podSeq = 1;
const nextId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`;

export const APP_COLORS: Record<AppType, string> = {
  web: "#3DDC97",
  api: "#3DD6FF",
  worker: "#FFC93D",
  cache: "#FF3D9A",
  db: "#B47FFF",
};

interface ClusterState {
  nodes: NodeModel[];
  pods: PodModel[];
  events: ClusterEvent[];
  trafficRate: number; // 0-100
  selectedApp: AppType;

  setSelectedApp: (app: AppType) => void;
  logEvent: (message: string) => void;
  deployPod: () => void;
  deployApp: (app?: AppType) => void;
  killPod: (id: string) => void;
  movePod: (id: string, nodeId: string) => void;
  failNode: (id: string) => void;
  recoverNode: (id: string) => void;
  setTrafficRate: (n: number) => void;
  /** reconciles the number of "auto" pods to match desired replica count */
  reconcileAutoPods: (desired: number) => void;
  reset: () => void;
}

const initialNodes: NodeModel[] = [
  { id: "node-a", name: "node-a", status: "healthy" },
  { id: "node-b", name: "node-b", status: "healthy" },
  { id: "node-c", name: "node-c", status: "healthy" },
  { id: "node-d", name: "node-d", status: "healthy" },
  { id: "node-e", name: "node-e", status: "healthy" },
];

export const useCluster = create<ClusterState>((set, get) => ({
  nodes: initialNodes,
  pods: [],
  events: [],
  trafficRate: 20,
  selectedApp: "web",

  setSelectedApp(app) {
    set({ selectedApp: app });
  },

  logEvent(message) {
    set((s) => ({
      events: [
        { id: nextId(), message, ts: Date.now() },
        ...s.events,
      ].slice(0, 10),
    }));
  },

  deployPod() {
    const { nodes, pods, selectedApp } = get();
    const nodeId = pickNode(nodes, pods);
    const name = `${selectedApp}-${podSeq++}`;
    const pod: PodModel = { id: nextId(), name, nodeId, origin: "manual", type: selectedApp };
    set((s) => ({ pods: [...s.pods, pod] }));
    get().logEvent(
      nodeId
        ? `Scheduler placed ${name} on ${nodeId}.`
        : `${name} is pending — no healthy nodes available.`
    );
  },

  deployApp(app) {
    const targetApp = app || get().selectedApp;
    const { nodes, pods } = get();
    const nodeId = pickNode(nodes, pods);
    const name = `${targetApp}-${podSeq++}`;
    const pod: PodModel = { id: nextId(), name, nodeId, origin: "manual", type: targetApp };
    set((s) => ({ pods: [...s.pods, pod] }));
    get().logEvent(
      nodeId
        ? `Scheduler placed ${name} on ${nodeId} (Least Loaded).`
        : `${name} is pending — no healthy nodes available.`
    );
  },

  killPod(id) {
    const pod = get().pods.find((p) => p.id === id);
    set((s) => ({ pods: s.pods.filter((p) => p.id !== id) }));
    if (pod) get().logEvent(`${pod.name} was terminated.`);
  },

  movePod(id, nodeId) {
    const pod = get().pods.find((p) => p.id === id);
    if (!pod || pod.nodeId === nodeId) return;
    const targetHealthy = get().nodes.find((n) => n.id === nodeId)?.status === "healthy";
    if (!targetHealthy) return;
    set((s) => ({
      pods: s.pods.map((p) => (p.id === id ? { ...p, nodeId } : p)),
    }));
    get().logEvent(`${pod.name} migrated to ${nodeId}.`);
  },

  failNode(id) {
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, status: "offline" } : n)),
    }));
    get().logEvent(`${id} marked as NotReady (Simulated Failure).`);

    // reschedule anything that was running there
    const orphaned = get().pods.filter((p) => p.nodeId === id);
    orphaned.forEach((p) => {
      const newNode = pickNode(get().nodes, get().pods);
      set((s) => ({
        pods: s.pods.map((pp) =>
          pp.id === p.id ? { ...pp, nodeId: newNode } : pp
        ),
      }));
      get().logEvent(
        newNode
          ? `${p.name} rescheduled onto ${newNode}.`
          : `${p.name} is pending — no healthy nodes available.`
      );
    });
  },

  recoverNode(id) {
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, status: "healthy" } : n)),
    }));
    get().logEvent(`${id} recovered and rejoined the cluster.`);
  },

  setTrafficRate(n) {
    set({ trafficRate: n });
  },

  reconcileAutoPods(desired) {
    const { pods } = get();
    const auto = pods.filter((p) => p.origin === "auto");
    const diff = desired - auto.length;

    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        const nodeId = pickNode(get().nodes, get().pods);
        const name = `web-auto-${podSeq++}`;
        const pod: PodModel = { id: nextId(), name, nodeId, origin: "auto", type: "web" };
        set((s) => ({ pods: [...s.pods, pod] }));
        get().logEvent(
          nodeId
            ? `HPA: Traffic rising — scaled up ${name} on ${nodeId}.`
            : `${name} is pending — no healthy nodes available.`
        );
      }
    } else if (diff < 0) {
      const toRemove = auto.slice(0, -diff);
      toRemove.forEach((p) => {
        set((s) => ({ pods: s.pods.filter((pp) => pp.id !== p.id) }));
        get().logEvent(`HPA: Traffic easing — scaled down ${p.name}.`);
      });
    }
  },

  reset() {
    podSeq = 1;
    set({ nodes: initialNodes, pods: [], events: [], trafficRate: 20, selectedApp: "web" });
  },
}));
