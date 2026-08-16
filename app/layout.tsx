import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Archivo_Black } from "next/font/google";
import "./globals.css";
import ScrollProgress from "@/components/ScrollProgress";
import CursorGlow from "@/components/CursorGlow";
import HudSidebar from "@/components/HudSidebar";
import PageTransition from "@/components/PageTransition";

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const display = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KubeVerse — Learn Kubernetes by Watching It Happen",
  description:
    "An interactive, visual introduction to containers and Kubernetes. No docs, no jargon walls — just watch it run.",
};

import Preloader from "@/components/Preloader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable} ${display.variable}`}>
      <body className="bg-bg font-sans font-light text-ink antialiased">
        <Preloader />
        <ScrollProgress />
        <CursorGlow />
        <HudSidebar />
        <PageTransition>
          <div className="relative z-10">{children}</div>
        </PageTransition>
      </body>
    </html>
  );
}
