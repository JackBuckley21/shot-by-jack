import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { MOCK_SHOOTS, MOCK_IMAGES } from "./mockData";

const isMock = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export interface Shoot {
  id: string;
  name: string;
  date: string;
  description: string;
  coverUrl: string;
  coverPath: string;
  imageCount: number;
  createdAt: Timestamp | null;
}

export interface ImageMeta {
  iso?: string;
  aperture?: string;
  shutterSpeed?: string;
  focalLength?: string;
  camera?: string;
}

export interface ShootImage {
  id: string;
  url: string;
  originalUrl?: string;
  path: string;
  originalPath?: string;
  name: string;
  order: number;
  meta?: ImageMeta;
  createdAt: Timestamp | null;
}

export async function getShoots(): Promise<Shoot[]> {
  if (isMock) return MOCK_SHOOTS;
  const q = query(collection(db, "shoots"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Shoot));
}

export async function getShoot(id: string): Promise<Shoot | null> {
  if (isMock) return MOCK_SHOOTS.find((s) => s.id === id) ?? null;
  const snap = await getDoc(doc(db, "shoots", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Shoot;
}

export async function createShoot(data: Omit<Shoot, "id" | "createdAt">) {
  return addDoc(collection(db, "shoots"), { ...data, createdAt: serverTimestamp() });
}

export async function updateShoot(id: string, data: Partial<Shoot>) {
  return updateDoc(doc(db, "shoots", id), data);
}

export async function deleteShoot(id: string) {
  return deleteDoc(doc(db, "shoots", id));
}

export async function getShootImages(shootId: string): Promise<ShootImage[]> {
  if (isMock) return MOCK_IMAGES[shootId] ?? [];
  const q = query(
    collection(db, "shoots", shootId, "images"),
    orderBy("order", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShootImage));
}

export async function addShootImage(
  shootId: string,
  data: Omit<ShootImage, "id" | "createdAt">
) {
  return addDoc(collection(db, "shoots", shootId, "images"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function deleteShootImage(shootId: string, imageId: string) {
  return deleteDoc(doc(db, "shoots", shootId, "images", imageId));
}

export function subscribeToShootImages(
  shootId: string,
  callback: (images: ShootImage[]) => void
): () => void {
  if (isMock) {
    callback(MOCK_IMAGES[shootId] ?? []);
    return () => {};
  }
  const q = query(
    collection(db, "shoots", shootId, "images"),
    orderBy("order", "asc")
  );
  return onSnapshot(q, (snap) => {
    const images = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShootImage));
    callback(images);
  });
}
