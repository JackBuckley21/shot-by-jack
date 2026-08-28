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
      <div className="flex items-center justify-center min-h-dvh">
        <span className="text-sm tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
          Loading…
        </span>
      </div>
    );
  }

  if (!shoot) {
    return (
      <div className="flex items-center justify-center min-h-dvh flex-col gap-6">
        <p className="text-sm tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
          Shoot not found
        </p>
        <Link href="/" className="text-xs tracking-widest uppercase underline" style={{ color: "var(--accent)" }}>
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
