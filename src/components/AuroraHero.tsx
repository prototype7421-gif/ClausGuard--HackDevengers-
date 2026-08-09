"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DocumentSlideshowBackground from "./DocumentSlideshowBackground";

export default function AuroraHero() {
  return (
    <DocumentSlideshowBackground className="min-h-[85vh] flex items-center justify-center">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 text-center">
        {/* Tag line */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm font-semibold uppercase tracking-widest text-white/80 mb-6"
        >
          AI-Powered Contract Protection
        </motion.p>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.45)]"
        >
          <span className="text-white">SCAN YOUR</span>
          <br />
          <span className="text-white">CONTRACTS</span>
          <br />
          <span className="text-white">FOR HIDDEN TRAPS</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mx-auto mt-8 max-w-2xl text-lg text-white/80 leading-relaxed drop-shadow"
        >
          Upload any Terms of Service, rental agreement, or freelance contract.
          Get an instant Risk Score and every hidden gotcha explained in plain English.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0 }}
          className="mt-12 flex items-center justify-center gap-4 flex-wrap"
        >
          <Link
            href="/analyze"
            className="group relative inline-flex items-center gap-2 rounded-full px-10 py-4 text-sm font-bold text-white overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-black/30"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 transition-opacity" />
            <span className="absolute inset-0 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="relative z-10 flex items-center gap-2">
              Start Analyzing
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          <Link
            href="/#how-it-works"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/25 bg-black/20 px-8 py-3.5 text-sm font-bold text-white/90 hover:text-white hover:border-white/40 hover:bg-black/35 backdrop-blur-sm transition-all"
          >
            Learn More
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="mt-16 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/55 uppercase tracking-widest">
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border-2 border-white/40 flex items-start justify-center p-1"
          >
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4], height: [4, 10, 4] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-1 rounded-full bg-white/70"
            />
          </motion.div>
        </motion.div>
      </div>
    </DocumentSlideshowBackground>
  );
}
