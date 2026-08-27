"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { Shoot } from "@/lib/firestore";

interface Props {
  shoot: Shoot;
}

export default function ScrollHero({ shoot }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  return (
    <div ref={ref} className="relative h-dvh overflow-hidden">
      <motion.div className="absolute inset-0" style={{ scale }}>
        {shoot.coverUrl ? (
          <img src={shoot.coverUrl} alt={shoot.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: "var(--muted)" }} />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.2) 0%, rgba(8,8,8,0.7) 100%)" }}
        />
      </motion.div>

      <motion.div
        className="absolute bottom-16 left-12 right-12 md:left-20"
        style={{ opacity, y: titleY }}
      >
        <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
          {shoot.date}
        </p>
        <h1
          className="text-6xl md:text-8xl leading-none"
          style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)" }}
        >
          {shoot.name}
        </h1>
        {shoot.description && (
          <p className="mt-4 text-base font-light max-w-md" style={{ color: "rgba(240,235,228,0.7)" }}>
            {shoot.description}
          </p>
        )}
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity }}
      >
        <span className="text-xs tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
          Scroll
        </span>
        <motion.div
          className="w-px h-8"
          style={{ backgroundColor: "var(--muted-foreground)" }}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
