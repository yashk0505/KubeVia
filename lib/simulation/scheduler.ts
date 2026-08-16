import type { NodeModel, PodModel } from "./types";

/**
 * Picks the least-loaded healthy node for a new pod.
 * Pure function — the same logic a real scheduler would run,
 * kept completely separate from any component.
 */
export function pickNode(
  nodes: NodeModel[],
  pods: PodModel[]
): string | null {
  const healthy = nodes.filter((n) => n.status === "healthy");
  if (healthy.length === 0) return null;

  const loads = healthy.map((n) => ({
    id: n.id,
    count: pods.filter((p) => p.nodeId === n.id).length,
  }));

  loads.sort((a, b) => a.count - b.count);
  return loads[0].id;
}
