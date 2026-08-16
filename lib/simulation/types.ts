export type NodeStatus = "healthy" | "offline";

export type AppType = "web" | "api" | "worker" | "cache" | "db";

export interface NodeModel {
  id: string;
  name: string;
  status: NodeStatus;
}

export interface PodModel {
  id: string;
  name: string;
  type?: AppType;
  /** null = pending / unschedulable right now */
  nodeId: string | null;
  /** "auto" pods are managed by the traffic autoscaler; "manual" pods came from the Deploy button */
  origin: "auto" | "manual";
}

export interface ClusterEvent {
  id: string;
  message: string;
  ts: number;
}
