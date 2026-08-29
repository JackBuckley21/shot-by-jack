"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import ScrollHero from "@/components/ScrollHero";
import ImageGallery from "@/components/ImageGallery";
import LoadingLineReveal from "@/components/LoadingLineReveal";
import { getShoot, getShootImages, type Shoot, type ShootImage } from "@/lib/firestore";

interface ShootDetailProps {
  shootId?: string;
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (!url) {
      resolve();
      return;
    }
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

export default function ShootDetail({ shootId }: ShootDetailProps) {
  const id = shootId;

  const [shoot, setShoot] = useState<Shoot | null>(null);
  const [images, setImages] = useState<ShootImage[]>([]);
  const [isReady, setIsReady] = useState(!id);

  useEffect(() => {
    if (!id) return;
    let isCancelled = false;
    Promise.all([getShoot(id), getShootImages(id)])
      .then(async ([s, imgs]) => {
        if (!isCancelled) {
          setShoot(s);
          setImages(imgs);
        }

        const urlsToPreload: string[] = [];
        if (s?.coverUrl) urlsToPreload.push(s.coverUrl);
        const topImageUrls = imgs.slice(0, 4).map((img) => img.url).filter(Boolean);
        urlsToPreload.push(...topImageUrls);

        await Promise.all(urlsToPreload.map(preloadImage));
      })
      .catch(() => {
        if (!isCancelled) {
          setShoot(null);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsReady(true);
        }
      });
    return () => {
      isCancelled = true;
    };
  }, [id]);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isReady && <LoadingLineReveal title="SHOT BY JACK" label="LOADING SHOOT..." />}
      </AnimatePresence>

      {isReady && !shoot && (
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
      )}

      {shoot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <ScrollHero shoot={shoot} />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
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
        </motion.div>
      )}
    </>
  );
}
