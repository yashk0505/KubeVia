"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Edges } from "@react-three/drei";
import type { Mesh } from "three";

function ContainerMesh({ color }: { color: string }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.25;
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[2.2, 1, 0.9]} />
      <meshStandardMaterial color={color} transparent opacity={0.12} />
      <Edges color={color} />
    </mesh>
  );
}

export default function ContainerScene3D({ color = "#3DDC97" }: { color?: string }) {
  return (
    <div className="mt-14 h-[280px] w-full cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [3, 2, 3], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[4, 4, 4]} intensity={40} color={color} />
        <ContainerMesh color={color} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
      </Canvas>
      <p className="mt-2 text-center font-mono text-[11px] uppercase tracking-wider text-faint">
        drag to rotate — real WebGL
      </p>
    </div>
  );
}
