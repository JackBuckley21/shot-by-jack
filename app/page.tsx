"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import ShootCard from "@/components/ShootCard";
import { getShoots, type Shoot } from "@/lib/firestore";

export default function HomePage() {
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getShoots()
      .then(setShoots)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingTop: "6rem" }}>
      <motion.div
        className="px-8 md:px-20 py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--accent)" }}>
          Sony a6400
        </p>
        <h1
          className="text-6xl md:text-8xl leading-none mb-6"
          style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)" }}
        >
          Shot By Jack
        </h1>
        <p className="text-base font-light max-w-sm" style={{ color: "var(--muted-foreground)" }}>
          A collection of shoots — street, portrait, landscape, and everything in between whilst I learn the world of photography.
        </p>
      </motion.div>

      <div className="w-full" style={{ borderTop: "1px solid var(--border)" }} />

      {loading && (
        <div className="flex items-center justify-center py-40">
          <span className="text-sm tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
            Loading…
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-40">
          <p className="text-xs max-w-sm text-center" style={{ color: "var(--muted-foreground)" }}>
            {error}
          </p>
        </div>
      )}

      {!loading && !error && shoots.length === 0 && (
        <div className="flex items-center justify-center py-40">
          <p className="text-sm tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
            No shoots yet — add one in the admin area.
          </p>
        </div>
      )}

      {!loading && !error && shoots.length > 0 && (
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
          {shoots.map((shoot, i) => (
            <ShootCard key={shoot.id} shoot={shoot} index={i} />
          ))}
        </div>
      )}

      <footer
        className="px-8 md:px-20 py-16 flex items-center justify-between"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p className="text-xs tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
          Archive — Sony a6400
        </p>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
