"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import ScrollHero from "@/components/ScrollHero";
import ImageGallery from "@/components/ImageGallery";
import { getShoot, getShootImages, type Shoot, type ShootImage } from "@/lib/firestore";

export default function ShootDetail() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [shoot, setShoot] = useState<Shoot | null>(null);
  const [images, setImages] = useState<ShootImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    Promise.all([getShoot(id), getShootImages(id)])
      .then(([s, imgs]) => {
        setShoot(s);
        setImages(imgs);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col justify-between">
        {/* Hero Loading Skeleton */}
        <div className="relative h-dvh w-full overflow-hidden" style={{ backgroundColor: "var(--muted)" }}>
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: "linear-gradient(to bottom, rgba(8,8,8,0.2) 0%, rgba(8,8,8,0.85) 100%)",
            }}
          />
          <div className="absolute bottom-16 left-12 right-12 md:left-20 max-w-2xl space-y-4 animate-pulse">
            <div className="h-3 w-28 rounded" style={{ backgroundColor: "rgba(200, 169, 126, 0.3)" }} />
            <div className="h-12 sm:h-16 md:h-20 w-3/4 rounded" style={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }} />
            <div className="h-4 w-1/2 rounded" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }} />
          </div>
        </div>

        {/* Subheader Skeleton */}
        <div
          className="px-8 md:px-20 py-12 flex items-center justify-between animate-pulse"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="space-y-2">
            <div className="h-3 w-20 rounded" style={{ backgroundColor: "rgba(200, 169, 126, 0.3)" }} />
            <div className="h-7 w-48 rounded" style={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }} />
          </div>
          <div className="h-3 w-24 rounded" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }} />
        </div>

        {/* Gallery Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-full animate-pulse"
              style={{
                aspectRatio: "4/3",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!shoot) {
    return (
      <div className="flex items-center justify-center min-h-dvh flex-col gap-6 px-8 text-center">
        <p className="text-sm tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
          Shoot not found
        </p>
        <Link
          href="/"
          className="text-xs tracking-widest uppercase underline transition-colors"
          style={{ color: "var(--accent)" }}
        >
          Back to archive
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ScrollHero shoot={shoot} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div
          className="px-8 md:px-20 py-12 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "var(--accent)" }}>
              {shoot.date}
            </p>
            <h2
              className="text-2xl md:text-3xl"
              style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)" }}
            >
              {shoot.name}
            </h2>
          </div>
          <div className="flex items-center gap-8">
            <span className="text-xs tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
              {images.length} images
            </span>
            <Link href="/" className="text-xs tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
              ← Archive
            </Link>
          </div>
        </div>

        <ImageGallery images={images} />

        <div className="px-8 md:px-20 py-16" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/" className="text-xs tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
            ← Back to archive
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
