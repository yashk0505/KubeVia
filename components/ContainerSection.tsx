"use client";

import ProcessDiagram from "./ProcessDiagram";

export default function ContainerSection() {
  return (
    <section id="container" className="border-t border-line py-[140px]">
      <div className="mx-auto max-w-[860px] px-8">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
          <span className="h-[5px] w-[5px] rounded-full bg-signal shadow-[0_0_8px_#3DDC97]" />
          01 · The problem
        </div>

        <h2 className="text-balance mt-5 max-w-[520px] text-[32px] font-light leading-[1.25] tracking-tight">
          &ldquo;It works on my machine.&rdquo;
        </h2>

        <p className="mt-5 max-w-[460px] text-base text-dim">
          A container packs your app and everything it depends on — runtime,
          libraries, config — into one portable, identical unit. Watch one
          get built, continuously:
        </p>

        <ProcessDiagram
          stages={[
            { label: "code" },
            { label: "build" },
            { label: "image" },
            { label: "container" },
          ]}
          duration={3000}
        />

        <div className="mt-14 max-w-[560px] border-t border-line pt-8 text-sm text-dim">
          <span className="font-medium text-ink">Why not just Docker?</span>{" "}
          Docker runs one container well on one machine. Real systems need
          dozens of containers coordinated across many machines, restarted
          when they fail, and balanced under load — that coordination
          problem is what Kubernetes exists to solve.
        </div>
      </div>
    </section>
  );
}
