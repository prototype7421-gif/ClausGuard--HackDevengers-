"use client";

import Link from "next/link";
import {
  Shield,
  Layers,
  Settings,
  Info,
  Rocket,
} from "lucide-react";
import FloatingDock from "./FloatingDock";
import type { DockItem } from "./FloatingDock";

const dockItems: DockItem[] = [
  {
    title: "Features",
    icon: Layers,
    href: "/#features",
  },
  {
    title: "How It Works",
    icon: Settings,
    href: "/#how-it-works",
  },
  {
    title: "About",
    icon: Info,
    href: "/#about",
  },
  {
    title: "Get Started",
    icon: Rocket,
    href: "/analyze",
    isPrimary: true,
  },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Glass background */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-xl border-b border-gray-100/80" />

      <div className="relative mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Shield className="h-7 w-7 text-brand-pink group-hover:text-brand-purple transition-colors" />
          <span className="text-xl font-extrabold tracking-tight">
            CLAUSE<span className="text-brand-pink">GUARD</span>
          </span>
        </Link>

        {/* Floating Dock */}
        <FloatingDock items={dockItems} />
      </div>
    </nav>
  );
}
