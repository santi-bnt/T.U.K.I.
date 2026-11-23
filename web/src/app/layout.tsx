import type { Metadata } from "next";
import "./globals.css";
import "./storytelling.css";
import { SiteShell } from "@/components/site-shell";
export const metadata: Metadata = { title: "TUKI — Your motion. Your machine.", description: "Explore the TUKI tendon-driven robotic hand concept through an interactive digital twin." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><SiteShell>{children}</SiteShell></body></html>; }
