"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";

interface DirectionAwareCardProps {
  imageSrc: string;
  label: string;
  description: string;
  icon: LucideIcon;
  gradientColor: string;
}

type Direction = "top" | "bottom" | "left" | "right";

function getDirection(
  ev: React.MouseEvent<HTMLDivElement>,
  el: HTMLDivElement
): Direction {
  const rect = el.getBoundingClientRect();
  const x = ev.clientX - rect.left - rect.width / 2;
  const y = ev.clientY - rect.top - rect.height / 2;

  // Use atan2 to get the angle, then map to 4 directions
  const angle = Math.atan2(y, x) * (180 / Math.PI) + 180; // 0-360

  if (angle >= 315 || angle < 45) return "left";
  if (angle >= 45 && angle < 135) return "top";
  if (angle >= 135 && angle < 225) return "right";
  return "bottom";
}

function getTranslateValues(direction: Direction) {
  switch (direction) {
    case "top":
      return { x: 0, y: "-100%" };
    case "bottom":
      return { x: 0, y: "100%" };
    case "left":
      return { x: "-100%", y: 0 };
    case "right":
      return { x: "100%", y: 0 };
  }
}

export default function DirectionAwareCard({
  imageSrc,
  label,
  description,
  icon: Icon,
  gradientColor,
}: DirectionAwareCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [enterDir, setEnterDir] = useState<Direction>("top");
  const [exitDir, setExitDir] = useState<Direction>("bottom");

  const handleMouseEnter = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const dir = getDirection(ev, ref.current);
    setEnterDir(dir);
    setIsHovered(true);
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const dir = getDirection(ev, ref.current);
    setExitDir(dir);
    setIsHovered(false);
  };

  const enterTranslate = getTranslateValues(enterDir);
  const exitTranslate = getTranslateValues(exitDir);

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-2xl overflow-hidden aspect-[16/9] group"
    >
      {/* Background Image */}
      <Image
        src={imageSrc}
        alt={label}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width: 768px) 50vw, 25vw"
      />

      {/* Dark gradient overlay always visible at bottom for label */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent z-10 pointer-events-none" />

      {/* Static label at bottom */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-4 md:p-5 pointer-events-none">
        <span className="text-xs md:text-sm font-bold text-white tracking-wider drop-shadow-lg">
          {label}
        </span>
      </div>

      {/* Direction-aware hover overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{
              x: enterTranslate.x,
              y: enterTranslate.y,
            }}
            animate={{
              x: 0,
              y: 0,
            }}
            exit={{
              x: exitTranslate.x,
              y: exitTranslate.y,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            }}
            className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-5 bg-gradient-to-br ${gradientColor}`}
          >
            {/* Animated icon */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 18,
                delay: 0.05,
              }}
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3"
            >
              <Icon className="h-7 w-7 md:h-8 md:w-8 text-white" />
            </motion.div>

            {/* Label */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.25 }}
              className="text-sm md:text-base font-bold text-white tracking-wide text-center"
            >
              {label}
            </motion.h3>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.25 }}
              className="mt-2 text-xs md:text-sm text-white/80 text-center leading-relaxed max-w-[200px]"
            >
              {description}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
