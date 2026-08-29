"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type PanInfo, type Variants } from "motion/react";
import type { ShootImage } from "@/lib/firestore";

interface Props {
  images: ShootImage[];
}

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.96,
  }),
};

async function resizeImageBlob(blob: Blob, maxWidth: number, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not initialize canvas context"));
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (resizedBlob) => {
          if (resizedBlob) {
            resolve(resizedBlob);
          } else {
            reject(new Error("Canvas export failed"));
          }
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
    img.src = objectUrl;
  });
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

export default function ImageGallery({ images }: Props) {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState<"sd" | "hd" | "original" | null>(null);

  const openModal = (_img: ShootImage, idx: number) => {
    setPage([idx, 0]);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const paginate = useCallback(
    (newDirection: number, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setPage(([prevPage]) => {
        const nextPage = (prevPage + newDirection + images.length) % images.length;
        return [nextPage, newDirection];
      });
    },
    [images.length]
  );

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: PanInfo
  ) => {
    const swipeThreshold = 60;
    const velocityThreshold = 500;
    if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      paginate(1);
    } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      paginate(-1);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        paginate(1);
      } else if (e.key === "ArrowLeft") {
        paginate(-1);
      } else if (e.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, paginate]);

  const currentImage = images[page];

  const handleDownload = async (type: "sd" | "hd" | "original") => {
    if (!currentImage || downloading) return;
    setDownloading(type);
    try {
      const base = currentImage.name.replace(/\.[^/.]+$/, "") || "photo";

      if (type === "original") {
        const downloadUrl = currentImage.originalUrl || currentImage.url;
        const res = await fetch(downloadUrl);
        if (!res.ok) {
          throw new Error(`Failed to fetch image: ${res.statusText}`);
        }
        const rawBlob = await res.blob();
        const ext = currentImage.name.includes(".") ? currentImage.name.split(".").pop() : "jpg";
        triggerBlobDownload(rawBlob, `${base}_original.${ext}`);
      } else {
        const res = await fetch(currentImage.url);
        if (!res.ok) {
          throw new Error(`Failed to fetch image: ${res.statusText}`);
        }
        const displayBlob = await res.blob();
        const maxWidth = type === "sd" ? 1080 : 2560;
        const resizedBlob = await resizeImageBlob(displayBlob, maxWidth);
        triggerBlobDownload(resizedBlob, `${base}_${type.toUpperCase()}.jpg`);
      }
    } catch {
      // Ignore download cancel / network error
    } finally {
      setDownloading(null);
    }
  };

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center py-40">
        <p className="text-sm tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
          No images yet
        </p>
      </div>
    );
  }

  const meta = currentImage?.meta;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
        {images.map((img, idx) => (
          <div
            key={img.id}
            className="relative overflow-hidden cursor-pointer bg-zinc-900 group"
            style={{ aspectRatio: "4/3" }}
            onClick={() => openModal(img, idx)}
          >
            <img
              src={img.url}
              alt={img.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
              style={{ background: "linear-gradient(to top, rgba(8,8,8,0.7) 0%, transparent 60%)" }}
            >
              <span className="text-xs tracking-widest uppercase" style={{ color: "var(--foreground)" }}>
                {img.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isOpen && currentImage && (
          <motion.div
            key="lightbox-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 overflow-hidden touch-none select-none"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 touch-none"
              style={{ backgroundColor: "rgba(8,8,8,0.97)" }}
              onClick={closeModal}
            />

            {/* Directional Carousel Slide */}
            <AnimatePresence custom={direction} initial={false} mode="popLayout">
              <motion.div
                key={page}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto"
                style={{ position: "absolute", inset: 0 }}
              >
                <motion.img
                  src={currentImage.url}
                  alt={currentImage.name}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="max-h-[80dvh] max-w-[85vw] object-contain pointer-events-none select-none"
                />
              </motion.div>
            </AnimatePresence>

            {/* Top bar: close + counter */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6 pointer-events-none">
              <p className="text-xs tracking-widest uppercase pointer-events-auto" style={{ color: "var(--muted-foreground)" }}>
                {page + 1} / {images.length}
              </p>
              <button
                onClick={closeModal}
                className="text-xs tracking-widest uppercase cursor-pointer pointer-events-auto"
                style={{ color: "var(--muted-foreground)", background: "none", border: "none", fontFamily: "inherit" }}
              >
                Close ✕
              </button>
            </div>

            {/* Prev / Next buttons */}
            <div className="absolute inset-y-0 left-0 right-0 z-10 flex items-center justify-between px-6 pointer-events-none">
              <button
                className="pointer-events-auto p-3 cursor-pointer text-lg transition-colors"
                style={{ color: "var(--muted-foreground)", background: "none", border: "none" }}
                onClick={(e) => paginate(-1, e)}
                aria-label="Previous image"
              >
                ←
              </button>
              <button
                className="pointer-events-auto p-3 cursor-pointer text-lg transition-colors"
                style={{ color: "var(--muted-foreground)", background: "none", border: "none" }}
                onClick={(e) => paginate(1, e)}
                aria-label="Next image"
              >
                →
              </button>
            </div>

            {/* Bottom bar: metadata left, downloads right */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between px-8 py-6 pointer-events-none">
              {/* EXIF metadata */}
              <div className="flex flex-col gap-1.5 pointer-events-auto max-w-xl">
                {meta && Object.keys(meta).length > 0 ? (
                  <div className="flex items-center gap-2 flex-wrap text-xs font-mono text-neutral-200 leading-relaxed">
                    {[
                      meta.camera,
                      meta.lens,
                      meta.focalLength,
                      meta.aperture,
                      meta.shutterSpeed,
                      meta.iso,
                    ]
                      .filter(Boolean)
                      .map((item, idx, arr) => (
                        <span key={idx} className="inline-flex items-center gap-2">
                          <span>{item}</span>
                          {idx < arr.length - 1 && (
                            <span className="text-neutral-500 select-none">•</span>
                          )}
                        </span>
                      ))}
                  </div>
                ) : (
                  <p className="text-xs font-mono text-neutral-400">No EXIF metadata</p>
                )}
                <p className="text-xs tracking-wider uppercase text-neutral-400 font-sans">
                  {currentImage.name}
                </p>
              </div>

              {/* Download options */}
              <div className="flex items-center gap-2 pointer-events-auto flex-wrap justify-end">
                {(
                  [
                    { type: "sd", label: "SD (1080px)" },
                    { type: "hd", label: "HD (2560px)" },
                    { type: "original", label: "Original" },
                  ] as const
                ).map(({ type, label }) => {
                  const isLoading = downloading === type;
                  return (
                    <button
                      key={type}
                      onClick={() => handleDownload(type)}
                      disabled={!!downloading}
                      className="px-3 py-2 text-xs tracking-widest uppercase cursor-pointer disabled:opacity-40 transition-colors inline-flex items-center gap-1.5"
                      style={{
                        color: isLoading ? "var(--accent)" : "var(--muted-foreground)",
                        background: "none",
                        border: `1px solid ${isLoading ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: "var(--radius)",
                        fontFamily: "inherit",
                      }}
                    >
                      {isLoading && (
                        <svg
                          className="animate-spin h-3 w-3"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      )}
                      <span>
                        {isLoading
                          ? type === "original"
                            ? "Downloading…"
                            : "Resizing…"
                          : label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
