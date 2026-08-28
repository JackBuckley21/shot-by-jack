"use client";

import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import type { ShootImage } from "@/lib/firestore";

interface Props {
  images: ShootImage[];
}

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
  const [selected, setSelected] = useState<ShootImage | null>(null);
  const [current, setCurrent] = useState(0);
  const [downloading, setDownloading] = useState<"sd" | "hd" | "original" | null>(null);

  const openModal = (img: ShootImage, idx: number) => {
    setSelected(img);
    setCurrent(idx);
  };

  const closeModal = () => setSelected(null);

  const navigate = (dir: 1 | -1, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const idx = (current + dir + images.length) % images.length;
    setCurrent(idx);
    setSelected(images[idx]);
  };

  const handleDownload = async (type: "sd" | "hd" | "original") => {
    if (!selected || downloading) return;
    setDownloading(type);
    try {
      const base = selected.name.replace(/\.[^/.]+$/, "") || "photo";

      if (type === "original") {
        const downloadUrl = selected.originalUrl || selected.url;
        const res = await fetch(downloadUrl);
        if (!res.ok) {
          throw new Error(`Failed to fetch image: ${res.statusText}`);
        }
        const rawBlob = await res.blob();
        const ext = selected.name.includes(".") ? selected.name.split(".").pop() : "jpg";
        triggerBlobDownload(rawBlob, `${base}_original.${ext}`);
      } else {
        const res = await fetch(selected.url);
        if (!res.ok) {
          throw new Error(`Failed to fetch image: ${res.statusText}`);
        }
        const displayBlob = await res.blob();
        const maxWidth = type === "sd" ? 1080 : 2560;
        const resizedBlob = await resizeImageBlob(displayBlob, maxWidth);
        triggerBlobDownload(resizedBlob, `${base}_${type.toUpperCase()}.jpg`);
      }
    } catch (err) {
      console.error("Download failed:", err);
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

  const meta = selected?.meta;

  return (
    <>
      <LayoutGroup>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {images.map((img, idx) => (
            <motion.div
              key={img.id}
              layoutId={`photo-${img.id}`}
              className="relative overflow-hidden cursor-pointer bg-zinc-900 group"
              style={{ aspectRatio: "4/3" }}
              onClick={() => openModal(img, idx)}
            >
              <motion.img
                layoutId={`img-${img.id}`}
                src={img.url}
                alt={img.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
                style={{ background: "linear-gradient(to top, rgba(8,8,8,0.7) 0%, transparent 60%)" }}
              >
                <span className="text-xs tracking-widest uppercase" style={{ color: "var(--foreground)" }}>
                  {img.name}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selected && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 z-50"
                style={{ backgroundColor: "rgba(8,8,8,0.97)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
              />

              {/* Image */}
              <motion.div
                layoutId={`photo-${selected.id}`}
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{ pointerEvents: "none" }}
              >
                <motion.img
                  layoutId={`img-${selected.id}`}
                  src={selected.url}
                  alt={selected.name}
                  loading="lazy"
                  decoding="async"
                  className="max-h-[80dvh] max-w-[85vw] object-contain"
                  style={{ pointerEvents: "none" }}
                />
              </motion.div>

              {/* Top bar: close + counter */}
              <motion.div
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-xs tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
                  {current + 1} / {images.length}
                </p>
                <button
                  onClick={closeModal}
                  className="text-xs tracking-widest uppercase cursor-pointer"
                  style={{ color: "var(--muted-foreground)", background: "none", border: "none", fontFamily: "inherit" }}
                >
                  Close ✕
                </button>
              </motion.div>

              {/* Prev / Next */}
              <div className="fixed inset-y-0 left-0 right-0 z-50 flex items-center justify-between px-6 pointer-events-none">
                <button
                  className="pointer-events-auto p-3 cursor-pointer text-lg transition-colors"
                  style={{ color: "var(--muted-foreground)", background: "none", border: "none" }}
                  onClick={(e) => navigate(-1, e)}
                >
                  ←
                </button>
                <button
                  className="pointer-events-auto p-3 cursor-pointer text-lg transition-colors"
                  style={{ color: "var(--muted-foreground)", background: "none", border: "none" }}
                  onClick={(e) => navigate(1, e)}
                >
                  →
                </button>
              </div>

              {/* Bottom bar: metadata left, downloads right */}
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-between px-8 py-6 pointer-events-none"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.12, duration: 0.3 }}
              >
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
                    {selected.name}
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
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </>
  );
}
