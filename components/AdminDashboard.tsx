"use client";

import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  getShoots,
  createShoot,
  updateShoot,
  deleteShoot,
  getShootImages,
  addShootImage,
  deleteShootImage,
  type Shoot,
  type ShootImage,
} from "@/lib/firestore";
import { storage } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { MOCK_SHOOTS, MOCK_IMAGES } from "@/lib/mockData";

const isMock = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

type View = "shoots" | "shoot";

// ── Mock state (lives outside component so it survives navigation) ──────────
let mockShoots: Shoot[] = MOCK_SHOOTS.map((s) => ({ ...s }));
const mockImages: Record<string, ShootImage[]> = Object.fromEntries(
  Object.entries(MOCK_IMAGES).map(([k, v]) => [k, v.map((i) => ({ ...i }))])
);

function useMockShoots() {
  const [shoots, setShoots] = useState<Shoot[]>([...mockShoots]);
  const reload = () => setShoots([...mockShoots]);
  return { shoots, reload };
}

export default function AdminPage() {
  const [view, setView] = useState<View>("shoots");
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [selectedShoot, setSelectedShoot] = useState<Shoot | null>(null);
  const [images, setImages] = useState<ShootImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showNewShoot, setShowNewShoot] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newDesc, setNewDesc] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const load = async () => {
    setLoading(true);
    try {
      if (isMock) {
        setShoots([...mockShoots]);
      } else {
        setShoots(await getShoots());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const loadImages = async (shoot: Shoot) => {
    if (isMock) {
      setImages([...(mockImages[shoot.id] ?? [])]);
    } else {
      setImages(await getShootImages(shoot.id));
    }
  };

  const openShoot = async (shoot: Shoot) => {
    setSelectedShoot(shoot);
    await loadImages(shoot);
    setView("shoot");
  };

  // ── Create shoot ────────────────────────────────────────────────────────────
  const handleCreateShoot = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setUploading(true);
    try {
      if (isMock) {
        const file = coverInputRef.current?.files?.[0];
        const coverUrl = file ? URL.createObjectURL(file) : "";
        const newShoot: Shoot = {
          id: `mock-${Date.now()}`,
          name: newName,
          date: newDate,
          description: newDesc,
          coverUrl,
          coverPath: "",
          imageCount: 0,
          createdAt: null,
        };
        mockShoots = [newShoot, ...mockShoots];
        mockImages[newShoot.id] = [];
        await load();
        showToast(`"${newName}" created`);
      } else {
        let coverUrl = "";
        let coverPath = "";
        const file = coverInputRef.current?.files?.[0];
        if (file) {
          const path = `covers/${Date.now()}_${file.name}`;
          const sRef = storageRef(storage, path);
          await uploadBytes(sRef, file);
          coverUrl = await getDownloadURL(sRef);
          coverPath = path;
        }
        await createShoot({ name: newName, date: newDate, description: newDesc, coverUrl, coverPath, imageCount: 0 });
        await load();
        showToast(`"${newName}" created`);
      }
      setNewName("");
      setNewDate(new Date().toISOString().slice(0, 10));
      setNewDesc("");
      setShowNewShoot(false);
    } finally {
      setUploading(false);
    }
  };

  // ── Delete shoot ────────────────────────────────────────────────────────────
  const handleDeleteShoot = async (shoot: Shoot) => {
    if (!confirm(`Delete "${shoot.name}"?`)) return;
    if (isMock) {
      mockShoots = mockShoots.filter((s) => s.id !== shoot.id);
      delete mockImages[shoot.id];
      await load();
      showToast(`"${shoot.name}" deleted`);
    } else {
      await deleteShoot(shoot.id);
      await load();
      showToast(`"${shoot.name}" deleted`);
    }
  };

  // ── Upload images ───────────────────────────────────────────────────────────
  const handleUploadImages = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!selectedShoot || !e.target.files) return;
    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      if (isMock) {
        const existing = mockImages[selectedShoot.id] ?? [];
        let order = existing.length;
        for (const file of files) {
          const url = URL.createObjectURL(file);
          existing.push({ id: `img-${Date.now()}-${order}`, url, path: "", name: file.name, order, createdAt: null });
          order++;
        }
        mockImages[selectedShoot.id] = existing;
        const updated = mockShoots.map((s) =>
          s.id === selectedShoot.id ? { ...s, imageCount: existing.length } : s
        );
        mockShoots = updated;
        setSelectedShoot(updated.find((s) => s.id === selectedShoot.id) ?? selectedShoot);
        await loadImages(selectedShoot);
        showToast(`${files.length} photo${files.length > 1 ? "s" : ""} added`);
      } else {
        let order = images.length;
        for (const file of files) {
          const path = `shoots/${selectedShoot.id}/${Date.now()}_${file.name}`;
          const sRef = storageRef(storage, path);
          await uploadBytes(sRef, file);
          const url = await getDownloadURL(sRef);
          await addShootImage(selectedShoot.id, { url, path, name: file.name, order });
          order++;
        }
        await updateShoot(selectedShoot.id, { imageCount: images.length + files.length });
        await loadImages(selectedShoot);
        showToast(`${files.length} photo${files.length > 1 ? "s" : ""} added`);
      }
    } finally {
      setUploading(false);
      if (imagesInputRef.current) imagesInputRef.current.value = "";
    }
  };

  // ── Delete image ────────────────────────────────────────────────────────────
  const handleDeleteImage = async (img: ShootImage) => {
    if (!selectedShoot || !confirm(`Remove this photo?`)) return;
    if (isMock) {
      mockImages[selectedShoot.id] = (mockImages[selectedShoot.id] ?? []).filter((i) => i.id !== img.id);
      const updated = mockShoots.map((s) =>
        s.id === selectedShoot.id
          ? { ...s, imageCount: mockImages[selectedShoot.id].length }
          : s
      );
      mockShoots = updated;
      setSelectedShoot(updated.find((s) => s.id === selectedShoot.id) ?? selectedShoot);
      await loadImages(selectedShoot);
      showToast("Photo removed");
    } else {
      try { await deleteObject(storageRef(storage, img.path)); } catch {}
      await deleteShootImage(selectedShoot.id, img.id);
      await updateShoot(selectedShoot.id, { imageCount: Math.max(0, (selectedShoot.imageCount ?? 1) - 1) });
      await loadImages(selectedShoot);
      showToast("Photo removed");
    }
  };

  return (
    <div style={{ paddingTop: "6rem" }} className="min-h-dvh">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 text-xs tracking-widest uppercase"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--accent-foreground)",
              borderRadius: "var(--radius)",
              whiteSpace: "nowrap",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-8 md:px-20">
        {/* Header */}
        <div className="py-12 flex items-end justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          {view === "shoot" && selectedShoot ? (
            <div>
              <button
                onClick={() => { setView("shoots"); load(); }}
                className="text-xs tracking-widest uppercase mb-4 block cursor-pointer"
                style={{ color: "var(--muted-foreground)", background: "none", border: "none", fontFamily: "inherit", padding: 0 }}
              >
                ← All shoots
              </button>
              <h1 className="text-4xl" style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)" }}>
                {selectedShoot.name}
              </h1>
              <p className="text-xs mt-2 tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
                {selectedShoot.date} · {images.length} images
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--accent)" }}>
                Admin
              </p>
              <h1 className="text-4xl" style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)" }}>
                Shoots
              </h1>
              <p className="text-xs mt-2 tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
                {shoots.length} shoot{shoots.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            {view === "shoots" && (
              <button
                onClick={() => setShowNewShoot(true)}
                className="px-5 py-2.5 text-xs tracking-widest uppercase cursor-pointer"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontFamily: "inherit",
                }}
              >
                + New Shoot
              </button>
            )}
            {view === "shoot" && (
              <label
                className="px-5 py-2.5 text-xs tracking-widest uppercase cursor-pointer inline-block"
                style={{
                  backgroundColor: uploading ? "var(--muted)" : "var(--primary)",
                  color: uploading ? "var(--muted-foreground)" : "var(--primary-foreground)",
                  borderRadius: "var(--radius)",
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading ? "Uploading…" : "+ Add Photos"}
                <input
                  ref={imagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUploadImages}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Mock mode banner */}
        {isMock && (
          <div className="mt-4 px-4 py-3 text-xs" style={{ backgroundColor: "var(--muted)", borderRadius: "var(--radius)", color: "var(--muted-foreground)", borderLeft: "2px solid var(--accent)" }}>
            <span style={{ color: "var(--accent)" }}>Preview mode</span> — changes are local only. Connect Firebase to persist data.
          </div>
        )}

        {/* Shoots list */}
        {view === "shoots" && (
          <div className="py-6">
            {loading && (
              <p className="text-sm tracking-widest uppercase py-20 text-center" style={{ color: "var(--muted-foreground)" }}>
                Loading…
              </p>
            )}
            {!loading && shoots.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <p className="text-sm tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
                  No shoots yet
                </p>
                <button
                  onClick={() => setShowNewShoot(true)}
                  className="text-xs tracking-widest uppercase underline cursor-pointer"
                  style={{ color: "var(--accent)", background: "none", border: "none", fontFamily: "inherit" }}
                >
                  Create your first shoot
                </button>
              </div>
            )}
            <div className="flex flex-col">
              {shoots.map((shoot, i) => (
                <motion.div
                  key={shoot.id}
                  className="flex items-center justify-between py-4 group cursor-pointer"
                  style={{ borderBottom: "1px solid var(--border)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => openShoot(shoot)}
                >
                  <div className="flex items-center gap-5">
                    <div
                      className="w-16 h-12 overflow-hidden flex-shrink-0"
                      style={{ borderRadius: "var(--radius)", backgroundColor: "var(--muted)" }}
                    >
                      {shoot.coverUrl && (
                        <img src={shoot.coverUrl} alt={shoot.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {shoot.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {shoot.date} · {shoot.imageCount ?? 0} images
                      </p>
                      {shoot.description && (
                        <p className="text-xs mt-1 max-w-sm truncate" style={{ color: "var(--muted-foreground)" }}>
                          {shoot.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span
                      className="text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--accent)" }}
                    >
                      Manage →
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteShoot(shoot); }}
                      className="text-xs tracking-widest uppercase cursor-pointer px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        color: "#e57373",
                        background: "none",
                        border: "1px solid rgba(229,115,115,0.25)",
                        borderRadius: "var(--radius)",
                        fontFamily: "inherit",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Images grid */}
        {view === "shoot" && (
          <div className="py-8">
            {images.length === 0 && !uploading && (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <p className="text-sm tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
                  No photos yet
                </p>
                <label
                  className="text-xs tracking-widest uppercase underline cursor-pointer"
                  style={{ color: "var(--accent)" }}
                >
                  Upload your first photo
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadImages}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
              layout
            >
              <AnimatePresence mode="popLayout">
                {images.map((img) => (
                  <motion.div
                    key={img.id}
                    className="relative group overflow-hidden"
                    style={{ aspectRatio: "1", backgroundColor: "var(--muted)", borderRadius: "var(--radius)" }}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.25 }}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <motion.div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                      style={{ backgroundColor: "rgba(8,8,8,0)" }}
                      whileHover={{ backgroundColor: "rgba(8,8,8,0.72)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        className="flex flex-col items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <p
                          className="text-xs tracking-widest uppercase text-center px-4 leading-relaxed"
                          style={{ color: "var(--foreground)" }}
                        >
                          {img.name}
                        </p>
                        <button
                          onClick={() => handleDeleteImage(img)}
                          className="text-xs tracking-widest uppercase cursor-pointer px-3 py-1.5"
                          style={{
                            color: "#e57373",
                            background: "none",
                            border: "1px solid rgba(229,115,115,0.4)",
                            borderRadius: "var(--radius)",
                            fontFamily: "inherit",
                          }}
                        >
                          Remove
                        </button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>

      {/* New shoot modal */}
      <AnimatePresence>
        {showNewShoot && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-8"
            style={{ backgroundColor: "rgba(8,8,8,0.9)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowNewShoot(false)}
          >
            <motion.div
              className="w-full max-w-md p-8"
              style={{
                backgroundColor: "var(--card)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
              }}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2
                className="text-2xl mb-8"
                style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)" }}
              >
                New Shoot
              </h2>
              <form onSubmit={handleCreateShoot} className="flex flex-col gap-5">
                <Field label="Name">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="e.g. Golden Hour — Hackney"
                    className="w-full px-4 py-3 text-sm bg-transparent outline-none"
                    style={{ border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: "var(--radius)" }}
                  />
                </Field>
                <Field label="Date">
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-transparent outline-none"
                    style={{ border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: "var(--radius)", colorScheme: "dark" }}
                  />
                </Field>
                <Field label="Description (optional)">
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={3}
                    placeholder="A short note about this shoot…"
                    className="w-full px-4 py-3 text-sm bg-transparent outline-none resize-none"
                    style={{ border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: "var(--radius)" }}
                  />
                </Field>
                <Field label="Cover photo (optional)">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="text-sm"
                    style={{ color: "var(--muted-foreground)" }}
                  />
                </Field>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewShoot(false)}
                    className="flex-1 py-3 text-xs tracking-widest uppercase cursor-pointer"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--muted-foreground)",
                      background: "none",
                      borderRadius: "var(--radius)",
                      fontFamily: "inherit",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !newName}
                    className="flex-1 py-3 text-xs tracking-widest uppercase cursor-pointer disabled:opacity-40"
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground)",
                      border: "none",
                      borderRadius: "var(--radius)",
                      fontFamily: "inherit",
                    }}
                  >
                    {uploading ? "Creating…" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
