"use client";

import Link from "next/link";
import { motion } from "motion/react";
// To switch back to the live archive gallery once shoots are ready:
// import ArchiveGallery from "@/components/ArchiveGallery";
// export default function Page() { return <ArchiveGallery />; }

const EASING: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: EASING,
    },
  },
};

export default function ComingSoonPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div
      className="min-h-dvh flex flex-col justify-between"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Main Content Area */}
      <motion.div
        className="flex-1 flex flex-col justify-center px-8 md:px-20 pt-32 pb-16 max-w-6xl mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Status Pill & Camera Badge */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center gap-3 md:gap-4 mb-8"
        >
          <span
            className="text-xs tracking-[0.25em] uppercase font-medium"
            style={{ color: "var(--accent)" }}
          >
            Sony a6400 · Archive
          </span>

          <span
            className="hidden sm:inline-block w-1 h-1 rounded-full"
            style={{ backgroundColor: "var(--border)" }}
          />

          {/* Live Status Indicator */}
          <div
            className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full text-[11px] tracking-wider uppercase font-light"
            style={{
              backgroundColor: "rgba(200, 169, 126, 0.06)",
              border: "1px solid rgba(200, 169, 126, 0.2)",
              color: "var(--foreground)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <motion.span
                animate={{ scale: [1, 2.2, 1], opacity: [0.75, 0, 0.75] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inline-flex h-full w-full rounded-full"
                style={{ backgroundColor: "var(--accent)" }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: "var(--accent)" }}
              />
            </span>
            <span style={{ color: "rgba(240, 235, 228, 0.85)" }}>
              Status: Curating recent captures
            </span>
          </div>
        </motion.div>

        {/* Large Editorial Headline */}
        <motion.div variants={itemVariants}>
          <h1
            className="text-6xl sm:text-7xl md:text-9xl leading-[0.92] tracking-tight mb-8"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--foreground)",
            }}
          >
            Coming Soon<span style={{ color: "var(--accent)" }}>.</span>
          </h1>
        </motion.div>

        {/* Editorial Subtitle & Curation Note */}
        <motion.div variants={itemVariants} className="max-w-2xl">
          <p
            className="text-base sm:text-lg md:text-xl font-light leading-relaxed mb-12"
            style={{ color: "var(--muted-foreground)" }}
          >
            An evolving photography archive capturing street, landscape, and portrait work.
            Recent shoots are currently being curated, color-graded, and uploaded to the database.
          </p>
        </motion.div>

        {/* Curated Categories Preview Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="space-y-1.5">
            <p
              className="text-xs tracking-[0.2em] uppercase font-medium"
              style={{ color: "var(--accent)" }}
            >
              01 / Street
            </p>
            <p
              className="text-sm font-light leading-snug"
              style={{ color: "var(--muted-foreground)" }}
            >
              Raw moments, fleeting geometry, and candid urban light.
            </p>
          </div>

          <div className="space-y-1.5">
            <p
              className="text-xs tracking-[0.2em] uppercase font-medium"
              style={{ color: "var(--accent)" }}
            >
              02 / Landscape
            </p>
            <p
              className="text-sm font-light leading-snug"
              style={{ color: "var(--muted-foreground)" }}
            >
              Atmospheric horizons, coastal textures, and quiet vistas.
            </p>
          </div>

          <div className="space-y-1.5">
            <p
              className="text-xs tracking-[0.2em] uppercase font-medium"
              style={{ color: "var(--accent)" }}
            >
              03 / Portrait
            </p>
            <p
              className="text-sm font-light leading-snug"
              style={{ color: "var(--muted-foreground)" }}
            >
              Natural light, environmental frames, and character studies.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer / Discreet Admin Access */}
      <footer
        className="w-full px-8 md:px-20 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs tracking-widest uppercase"
        style={{
          borderTop: "1px solid var(--border)",
          color: "var(--muted-foreground)",
        }}
      >
        <p>© {currentYear} Shot By Jack · All Rights Reserved</p>

        <div className="flex items-center gap-6">
          <span className="hidden sm:inline-block">Sony Alpha Series</span>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[#f0ebe4] focus:outline-none"
            style={{ color: "inherit" }}
          >
            <span>Studio Admin</span>
            <span style={{ color: "var(--accent)" }}>→</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
