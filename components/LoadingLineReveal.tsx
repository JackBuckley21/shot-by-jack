"use client";

import { motion } from "motion/react";

interface LoadingLineRevealProps {
  title?: string;
  label?: string;
  text?: string;
  subtext?: string;
}

export default function LoadingLineReveal({
  title,
  label,
  text,
  subtext,
}: LoadingLineRevealProps) {
  const displayTitle = title || text || "SHOT BY JACK";
  const displayLabel = label || subtext || "LOADING SHOOT...";

  return (
    <motion.div
      key="loading-line-reveal"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { delay: 0.8, duration: 0.3 } }}
    >
      {/* Left Curtain */}
      <motion.div
        className="absolute top-0 bottom-0 left-0 w-1/2"
        style={{ backgroundColor: "#0d0d0d" }}
        initial={{ x: 0 }}
        exit={{
          x: "-100%",
          transition: { duration: 0.85, ease: [0.65, 0, 0.35, 1], delay: 0.25 },
        }}
      />

      {/* Right Curtain */}
      <motion.div
        className="absolute top-0 bottom-0 right-0 w-1/2"
        style={{ backgroundColor: "#0d0d0d" }}
        initial={{ x: 0 }}
        exit={{
          x: "100%",
          transition: { duration: 0.85, ease: [0.65, 0, 0.35, 1], delay: 0.25 },
        }}
      />

      {/* Center Full-Height Bronze Laser Line */}
      <motion.div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-20 w-[1px] origin-center pointer-events-none bg-gradient-to-b from-[#c8a97e]/0 via-[#c8a97e] to-[#c8a97e]/0"
        style={{
          boxShadow:
            "0 0 10px rgba(200, 169, 126, 0.8), 0 0 20px rgba(200, 169, 126, 0.5), 0 0 40px rgba(200, 169, 126, 0.25)",
        }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{
          scaleY: [0, 1, 1],
          opacity: [0, 1, 0.9],
        }}
        exit={{
          opacity: 0,
          scaleY: 1,
          transition: { duration: 0.25 },
        }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Central Split Layout Container */}
      <div className="relative z-30 flex items-center justify-center w-full max-w-3xl px-6 pointer-events-none">
        {/* Left Side: Title animating outwards to the left */}
        <motion.div
          className="w-1/2 flex justify-end text-right pr-6"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28, transition: { duration: 0.25 } }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="text-xs sm:text-sm tracking-[0.25em] uppercase font-medium select-none whitespace-nowrap"
            style={{ color: "#c8a97e" }}
          >
            {displayTitle}
          </span>
        </motion.div>

        {/* Right Side: Subtitle/Status animating outwards to the right */}
        <motion.div
          className="w-1/2 flex justify-start text-left pl-6"
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28, transition: { duration: 0.25 } }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-light select-none whitespace-nowrap"
            style={{ color: "rgba(240, 235, 228, 0.65)" }}
          >
            {displayLabel}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
