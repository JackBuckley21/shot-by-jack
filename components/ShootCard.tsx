"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import type { Shoot } from "@/lib/firestore";

interface Props {
  shoot: Shoot;
  index: number;
}

export default function ShootCard({ shoot, index }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "0.6 1"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);

  const isEven = index % 2 === 0;

  return (
    <motion.div ref={ref} style={{ opacity, y, scale }}>
      <Link href={`/shoot?id=${shoot.id}`} className="group block">
        <div
          className={`grid gap-0 ${isEven ? "md:grid-cols-[60fr_40fr]" : "md:grid-cols-[40fr_60fr]"}`}
        >
          <div
            className={`relative overflow-hidden bg-zinc-900 ${isEven ? "" : "md:order-2"}`}
            style={{ aspectRatio: "4/3" }}
          >
            {shoot.coverUrl ? (
              <img
                src={shoot.coverUrl}
                alt={shoot.name}
                loading="lazy"
                decoding="async"
                fetchPriority="high"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: "var(--muted)" }}
              >
                <span className="text-xs tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
                  No cover
                </span>
              </div>
            )}
          </div>
          <div
            className={`flex flex-col justify-end p-10 ${isEven ? "" : "md:order-1"}`}
            style={{ backgroundColor: "var(--card)" }}
          >
            <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
              {shoot.date}
            </p>
            <h2
              className="text-4xl md:text-5xl mb-4 leading-none"
              style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)" }}
            >
              {shoot.name}
            </h2>
            {shoot.description && (
              <p className="text-sm font-light leading-relaxed mb-8" style={{ color: "var(--muted-foreground)" }}>
                {shoot.description}
              </p>
            )}
            <div
              className="flex items-center gap-2 text-xs tracking-widest uppercase"
              style={{ color: "var(--muted-foreground)" }}
            >
              <span>{shoot.imageCount ?? 0} images</span>
              <span className="inline-block w-8 h-px" style={{ backgroundColor: "var(--border)" }} />
              <span style={{ color: "var(--accent)" }}>View shoot →</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
