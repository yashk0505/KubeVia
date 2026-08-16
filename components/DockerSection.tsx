"use client";

import ProcessDiagram from "./ProcessDiagram";

export default function DockerSection() {
  return (
    <section id="docker" className="border-t border-line py-[140px]">
      <div className="mx-auto max-w-[860px] px-8">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
          <span className="h-[5px] w-[5px] rounded-full bg-signal shadow-[0_0_8px_#3DDC97]" />
          02 · One machine, one box
        </div>

        <h2 className="text-balance mt-5 max-w-[520px] text-[32px] font-light leading-[1.25] tracking-tight">
          Docker runs the container.
        </h2>

        <p className="mt-5 max-w-[460px] text-base text-dim">
          A request comes in, the Docker daemon starts the image, and a
          container is live. This loop runs constantly in production:
        </p>

        <ProcessDiagram
          stages={[
            { label: "request" },
            { label: "docker daemon" },
            { label: "running container" },
          ]}
          duration={2400}
        />

        <div className="mt-14 max-w-[560px] border-t border-line pt-8 text-sm text-dim">
          <span className="font-medium text-ink">The limit:</span> if that
          one machine goes down, nothing restarts the container or moves it
          elsewhere. Production needs something watching over many
          containers, on many machines — that&apos;s Kubernetes.
        </div>
      </div>
    </section>
  );
}
