"use client";

import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import type { ShootImage } from "@/lib/firestore";

interface Props {
  images: ShootImage[];
}

function buildDownloadUrl(url: string, width: number): string {
  try {
    const u = new URL(url);
    u.searchParams.set("w", String(width));
    u.searchParams.set("fit", "max");
    u.searchParams.set("auto", "format");
    return u.toString();
  } catch {
    return url;
  }
}

function originalUrl(url: string): string {
  try {
    const u = new URL(url);
    // Strip resize params to get the closest-to-original Unsplash delivers
    u.searchParams.delete("w");
    u.searchParams.delete("h");
    u.searchParams.set("fit", "max");
    u.searchParams.set("auto", "format");
    return u.toString();
  } catch {
    return url;
  }
}

async function triggerDownload(href: string, filename: string) {
  const res = await fetch(href);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(blobUrl);
}

export default function ImageGallery({ images }: Props) {
  const [selected, setSelected] = useState<ShootImage | null>(null);
  const [current, setCurrent] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);

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
      const filename = `${base}_${type}.jpg`;
      const url =
        type === "sd" ? buildDownloadUrl(selected.url, 640) :
        type === "hd" ? buildDownloadUrl(selected.url, 1920) :
        originalUrl(selected.url);
      await triggerDownload(url, filename);
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
                <div className="flex flex-col gap-2 pointer-events-auto">
                  {meta?.camera && (
                    <p className="text-xs tracking-widest uppercase" style={{ color: "var(--accent)" }}>
                      {meta.camera}
                    </p>
                  )}
                  <div className="flex items-center gap-5 flex-wrap">
                    {meta?.shutterSpeed && (
                      <MetaItem label="Shutter" value={meta.shutterSpeed} />
                    )}
                    {meta?.aperture && (
                      <MetaItem label="Aperture" value={meta.aperture} />
                    )}
                    {meta?.iso && (
                      <MetaItem label="ISO" value={meta.iso} />
                    )}
                    {meta?.focalLength && (
                      <MetaItem label="Focal" value={meta.focalLength} />
                    )}
                    {!meta && (
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        No metadata
                      </p>
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                    {selected.name}
                  </p>
                </div>

                {/* Download options */}
                <div className="flex items-center gap-1 pointer-events-auto">
                  {(["sd", "hd", "original"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleDownload(type)}
                      disabled={!!downloading}
                      className="px-3 py-2 text-xs tracking-widest uppercase cursor-pointer disabled:opacity-40 transition-colors"
                      style={{
                        color: downloading === type ? "var(--accent)" : "var(--muted-foreground)",
                        background: "none",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        fontFamily: "inherit",
                      }}
                    >
                      {downloading === type ? "…" : type === "sd" ? "SD" : type === "hd" ? "HD" : "Original"}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <span className="text-sm font-light" style={{ color: "var(--foreground)", fontFamily: "var(--font-sans)" }}>
        {value}
      </span>
    </div>
  );
}
