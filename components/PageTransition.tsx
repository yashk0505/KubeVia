"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import KubeLoader from "./KubeLoader";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [targetPath, setTargetPath] = useState<string>("/");
  const prevPathname = useRef(pathname);

  // Intercept internal link clicks to trigger the lightweight transition loader
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:")) {
        return;
      }

      const cleanHref = href.split("?")[0].split("#")[0];
      if (cleanHref && cleanHref !== pathname) {
        setTargetPath(cleanHref);
        setIsNavigating(true);
      }
    };

    document.addEventListener("click", handleGlobalClick, { capture: true });
    return () => document.removeEventListener("click", handleGlobalClick, { capture: true });
  }, [pathname]);

  // When pathname finishes updating, dismiss loader smoothly
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      window.scrollTo({ top: 0, behavior: "instant" });

      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 450);

      return () => clearTimeout(timer);
    } else {
      setIsNavigating(false);
    }
  }, [pathname]);

  return (
    <>
      {/* ── Top Progress Laser Bar ── */}
      <div
        className={`fixed top-0 left-0 right-0 h-[2.5px] z-[99999] pointer-events-none transition-all duration-300 ${
          isNavigating ? "opacity-100 shadow-[0_0_15px_#00d2ff]" : "opacity-0"
        }`}
        style={{
          background: "linear-gradient(90deg, #00d2ff 0%, #bd00ff 50%, #00ffc2 100%)",
          transform: isNavigating ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: isNavigating ? "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)" : "opacity 0.2s ease",
        }}
      />

      {/* ── Seamless Inter-Page Transition Overlay ── */}
      {isNavigating && (
        <div className="fixed inset-0 z-[99990] pointer-events-none flex items-center justify-center bg-[#050608]/85 backdrop-blur-md transition-opacity duration-300 animate-fadeIn p-6">
          <KubeLoader mode="transition" destination={targetPath} />
        </div>
      )}

      {/* ── Page Content ── */}
      <div key={pathname} className="page-route-enter">
        {children}
      </div>
    </>
  );
}
