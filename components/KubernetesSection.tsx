"use client";

import ProcessDiagram from "./ProcessDiagram";

const concepts = [
  {
    term: "pod",
    desc: "The smallest deployable unit — one or more containers that always run together.",
  },
  {
    term: "node",
    desc: "A machine, physical or virtual, that runs pods. A cluster usually has several.",
  },
  {
    term: "cluster",
    desc: "All the nodes together, managed as one system by Kubernetes.",
  },
];

export default function KubernetesSection() {
  return (
    <section id="kubernetes" className="border-t border-line py-[140px]">
      <div className="mx-auto max-w-[860px] px-8">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
          <span className="h-[5px] w-[5px] rounded-full bg-signal shadow-[0_0_8px_#3DDC97]" />
          03 · The orchestrator
        </div>

        <h2 className="text-balance mt-5 max-w-[560px] text-[32px] font-light leading-[1.25] tracking-tight">
          Kubernetes decides where things run — and keeps them running.
        </h2>

        <div className="mt-16">
          {concepts.map((c) => (
            <div
              key={c.term}
              className="grid grid-cols-1 gap-3 border-t border-line py-[22px] last:border-b sm:grid-cols-[140px_1fr] sm:gap-6"
            >
              <div className="font-mono text-[13px] text-ink">{c.term}</div>
              <div className="max-w-[420px] text-sm text-dim">{c.desc}</div>
            </div>
          ))}
        </div>

        <p className="mt-16 max-w-[460px] text-base text-dim">
          Scheduling, live:
        </p>
        <ProcessDiagram
          stages={[
            { label: "deploy" },
            { label: "scheduler" },
            { label: "node" },
            { label: "running pod" },
          ]}
          duration={3400}
        />

        <p className="mt-14 max-w-[460px] text-base text-dim">
          Then traffic finds it, live:
        </p>
        <ProcessDiagram
          stages={[
            { label: "user" },
            { label: "service" },
            { label: "pod" },
            { label: "response" },
          ]}
          duration={2800}
          bounce
        />

        <div className="mt-14 max-w-[560px] border-t border-line pt-8 text-sm text-dim">
          <span className="font-medium text-ink">Self-healing:</span> if a
          node goes offline, Kubernetes reschedules its pods onto a healthy
          node automatically — the flow above simply re-routes, without
          anyone noticing.
        </div>
      </div>
    </section>
  );
}
