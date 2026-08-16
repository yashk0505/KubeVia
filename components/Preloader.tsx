"use client";

import { useState, useEffect } from "react";
import KubeLoader from "./KubeLoader";

export default function Preloader() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Respect reduced motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const seen = sessionStorage.getItem("kubeverse_brand_intro_seen");
    if (!seen) {
      setIsVisible(true);
      const timerFade = setTimeout(() => {
        setIsFading(true);
      }, 2100);

      const timerDone = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem("kubeverse_brand_intro_seen", "true");
      }, 2500);

      return () => {
        clearTimeout(timerFade);
        clearTimeout(timerDone);
      };
    }
  }, []);

  // Listen for replay requests from buttons or navigation
  useEffect(() => {
    const handleReplay = () => {
      setIsVisible(true);
      setIsFading(false);
      setTimeout(() => setIsFading(true), 2100);
      setTimeout(() => setIsVisible(false), 2500);
    };

    window.addEventListener("replay-preloader", handleReplay);
    return () => window.removeEventListener("replay-preloader", handleReplay);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#050608] text-white p-6 transition-all duration-400 select-none ${
        isFading ? "opacity-0 pointer-events-none scale-105" : "opacity-100 pointer-events-auto scale-100"
      }`}
    >
      <div className="w-full max-w-sm sm:max-w-md">
        <KubeLoader
          mode="initial"
          destination="/"
          customTitle="INITIALIZING KUBEVIA"
          customSubtitle="Preparing interactive cloud native laboratory"
        />
      </div>
    </div>
  );
}
