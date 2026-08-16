"use client";

import dynamic from "next/dynamic";

const ContainerScene3D = dynamic(() => import("./ContainerScene3D"), {
  ssr: false,
  loading: () => (
    <div className="mt-14 flex h-[280px] w-full items-center justify-center font-mono text-[11px] text-faint">
      loading 3D scene…
    </div>
  ),
});

export default ContainerScene3D;
