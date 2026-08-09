"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

const SLIDES = [
  {
    src: "/images/hero-docs-1.jpg",
    alt: "Contracts and risk analysis reports on a desk",
  },
  {
    src: "/images/hero-docs-2.jpg",
    alt: "Business reports with charts and graphs",
  },
  {
    src: "/images/hero-docs-3.jpg",
    alt: "Annotated contract review with sticky notes",
  },
  {
    src: "/images/hero-docs-4.jpg",
    alt: "Compliance and financial report documents",
  },
  {
    src: "/images/privacy.jpg",
    alt: "Privacy policy documents and risk printouts",
  },
];

interface DocumentSlideshowBackgroundProps {
  children: ReactNode;
  className?: string;
}

export default function DocumentSlideshowBackground({
  children,
  className = "",
}: DocumentSlideshowBackgroundProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={`relative overflow-hidden bg-neutral-900 ${className}`}>
      {/* Slideshow images */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={SLIDES[index].src}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={SLIDES[index].src}
              alt={SLIDES[index].alt}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Neutral readability overlays — no purple theme */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.45)_100%)]" />
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index
                ? "w-6 bg-white"
                : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
