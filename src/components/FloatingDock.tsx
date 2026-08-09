"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface DockItem {
  title: string;
  icon: LucideIcon;
  href: string;
  gradient?: string;
  isPrimary?: boolean;
}

/* ─────────── Desktop Dock ─────────── */
function DesktopDock({ items }: { items: DockItem[] }) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="hidden md:flex items-end gap-3 rounded-2xl border border-gray-200/60 bg-white/70 backdrop-blur-xl px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
    >
      {items.map((item) => (
        <DockIcon key={item.title} mouseX={mouseX} item={item} />
      ))}
    </motion.div>
  );
}

/* ─────────── Single Dock Icon ─────────── */
function DockIcon({
  mouseX,
  item,
}: {
  mouseX: ReturnType<typeof useMotionValue<number>>;
  item: DockItem;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate distance from mouse to center of this icon
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: 0,
    };
    return val - bounds.x - bounds.width / 2;
  });

  // Map distance → size: close = big, far = normal
  const widthTransform = useTransform(distance, [-150, 0, 150], [44, 72, 44]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [44, 72, 44]);
  const iconSizeTransform = useTransform(
    distance,
    [-150, 0, 150],
    [18, 30, 18]
  );

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const iconSize = useSpring(iconSizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const Icon = item.icon;

  return (
    <Link href={item.href} scroll={true}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative flex items-center justify-center rounded-xl transition-colors ${
          item.isPrimary
            ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-200/50"
            : "bg-gray-100/80 text-gray-600 hover:bg-gray-200/80"
        }`}
      >
        {/* Tooltip */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-10 left-1/2 w-max rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xl"
            >
              {item.title}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-gray-900" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          style={{ width: iconSize, height: iconSize }}
          className="flex items-center justify-center"
        >
          <Icon style={{ width: "100%", height: "100%" }} />
        </motion.div>
      </motion.div>
    </Link>
  );
}

/* ─────────── Mobile Dock ─────────── */
function MobileDock({ items }: { items: DockItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.4 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="absolute bottom-full right-0 mb-3 flex flex-col gap-2 origin-bottom rounded-2xl border border-gray-200/60 bg-white/90 backdrop-blur-xl p-2 shadow-xl"
          >
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  scroll={true}
                  onClick={() => setOpen(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                      item.isPrimary
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {item.title}
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
        aria-label="Toggle navigation"
      >
        <motion.svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          className="text-gray-600"
          animate={open ? "open" : "closed"}
        >
          <motion.line
            x1="3"
            x2="15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            variants={{
              closed: { y1: 4, y2: 4, rotate: 0 },
              open: { y1: 9, y2: 9, rotate: 45 },
            }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ originX: "50%", originY: "50%" }}
          />
          <motion.line
            x1="3"
            x2="15"
            y1="9"
            y2="9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 },
            }}
          />
          <motion.line
            x1="3"
            x2="15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            variants={{
              closed: { y1: 14, y2: 14, rotate: 0 },
              open: { y1: 9, y2: 9, rotate: -45 },
            }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ originX: "50%", originY: "50%" }}
          />
        </motion.svg>
      </button>
    </div>
  );
}

/* ─────────── Combined Export ─────────── */
export default function FloatingDock({ items }: { items: DockItem[] }) {
  return (
    <>
      <DesktopDock items={items} />
      <MobileDock items={items} />
    </>
  );
}
