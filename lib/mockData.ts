import type { Shoot, ShootImage, ImageMeta } from "./firestore";

function img(id: string, name: string, url: string, order: number, meta: ImageMeta): ShootImage {
  return { id, url, path: "", name, order, meta, createdAt: null };
}

export const MOCK_SHOOTS: Shoot[] = [
  {
    id: "mock-street",
    name: "Night Drift",
    date: "2024-11-14",
    description: "Late-night walk through the city — wet streets, sodium lights, and the occasional neon sign bleeding into the dark.",
    coverUrl: "https://images.unsplash.com/photo-1599060052009-24d6d0b0161c?w=1400&h=900&fit=crop&auto=format",
    coverPath: "",
    imageCount: 6,
    createdAt: null,
  },
  {
    id: "mock-portrait",
    name: "Studio Series I",
    date: "2024-10-03",
    description: "Natural light portraits — north-facing window, late afternoon. Nothing else.",
    coverUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1400&h=900&fit=crop&auto=format",
    coverPath: "",
    imageCount: 6,
    createdAt: null,
  },
  {
    id: "mock-landscape",
    name: "Golden Hour — Peak District",
    date: "2024-09-21",
    description: "Drove out before sunrise. Stayed until the last light dropped behind the ridge.",
    coverUrl: "https://images.unsplash.com/photo-1531117367049-4af500fc6ab9?w=1400&h=900&fit=crop&auto=format",
    coverPath: "",
    imageCount: 6,
    createdAt: null,
  },
];

export const MOCK_IMAGES: Record<string, ShootImage[]> = {
  "mock-street": [
    img("s1", "Empty road, midnight",  "https://images.unsplash.com/photo-1453413453658-27fec8f43f29?w=1200&h=900&fit=crop&auto=format", 0, { iso: "3200", aperture: "f/1.8", shutterSpeed: "1/60s", focalLength: "35mm", camera: "Sony a6400" }),
    img("s2", "Building lights",        "https://images.unsplash.com/photo-1710163956790-76c279d76386?w=1200&h=900&fit=crop&auto=format", 1, { iso: "1600", aperture: "f/2.8", shutterSpeed: "1/80s", focalLength: "50mm", camera: "Sony a6400" }),
    img("s3", "Traffic signal",          "https://images.unsplash.com/photo-1590347945111-a14c8efd9249?w=1200&h=900&fit=crop&auto=format", 2, { iso: "800",  aperture: "f/4.0", shutterSpeed: "1/125s", focalLength: "35mm", camera: "Sony a6400" }),
    img("s4", "Wet asphalt",             "https://images.unsplash.com/photo-1554103577-c0d26e9b90e0?w=1200&h=900&fit=crop&auto=format", 3, { iso: "6400", aperture: "f/1.4", shutterSpeed: "1/30s",  focalLength: "24mm", camera: "Sony a6400" }),
    img("s5", "Motorcycle neon",         "https://images.unsplash.com/photo-1599060052009-24d6d0b0161c?w=1200&h=900&fit=crop&auto=format", 4, { iso: "4000", aperture: "f/2.0", shutterSpeed: "1/100s", focalLength: "35mm", camera: "Sony a6400" }),
    img("s6", "Storefront dusk",         "https://images.unsplash.com/photo-1624075250557-9e020cecaaf6?w=1200&h=900&fit=crop&auto=format", 5, { iso: "2500", aperture: "f/2.8", shutterSpeed: "1/50s",  focalLength: "50mm", camera: "Sony a6400" }),
  ],
  "mock-portrait": [
    img("p1", "Pinstripe",   "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&h=900&fit=crop&auto=format", 0, { iso: "200",  aperture: "f/1.8", shutterSpeed: "1/200s", focalLength: "85mm", camera: "Sony a6400" }),
    img("p2", "Blonde close","https://images.unsplash.com/photo-1568038479111-87bf80659645?w=1200&h=900&fit=crop&auto=format", 1, { iso: "160",  aperture: "f/2.0", shutterSpeed: "1/250s", focalLength: "85mm", camera: "Sony a6400" }),
    img("p3", "Ponytail",    "https://images.unsplash.com/photo-1674932668403-33398b81c92f?w=1200&h=900&fit=crop&auto=format", 2, { iso: "400",  aperture: "f/1.4", shutterSpeed: "1/160s", focalLength: "50mm", camera: "Sony a6400" }),
    img("p4", "Blue eyes",   "https://images.unsplash.com/photo-1563170446-9c3c0622d8a9?w=1200&h=900&fit=crop&auto=format", 3, { iso: "320",  aperture: "f/2.2", shutterSpeed: "1/180s", focalLength: "85mm", camera: "Sony a6400" }),
    img("p5", "Greyscale",   "https://images.unsplash.com/photo-1574526783053-c3afac70d448?w=1200&h=900&fit=crop&auto=format", 4, { iso: "100",  aperture: "f/4.0", shutterSpeed: "1/500s", focalLength: "85mm", camera: "Sony a6400" }),
    img("p6", "White shirt", "https://images.unsplash.com/photo-1519744434498-a0de604df9db?w=1200&h=900&fit=crop&auto=format", 5, { iso: "250",  aperture: "f/1.8", shutterSpeed: "1/320s", focalLength: "50mm", camera: "Sony a6400" }),
  ],
  "mock-landscape": [
    img("l1", "Sea of clouds",   "https://images.unsplash.com/photo-1560529621-67dda50eeb8d?w=1200&h=900&fit=crop&auto=format", 0, { iso: "100",  aperture: "f/8.0",  shutterSpeed: "1/400s",  focalLength: "18mm", camera: "Sony a6400" }),
    img("l2", "Zion road",       "https://images.unsplash.com/photo-1529651121800-01d45d421ec9?w=1200&h=900&fit=crop&auto=format", 1, { iso: "200",  aperture: "f/11",   shutterSpeed: "1/250s",  focalLength: "18mm", camera: "Sony a6400" }),
    img("l3", "City cloudscape", "https://images.unsplash.com/photo-1510792670681-a2d704640d74?w=1200&h=900&fit=crop&auto=format", 2, { iso: "400",  aperture: "f/6.3",  shutterSpeed: "1/320s",  focalLength: "24mm", camera: "Sony a6400" }),
    img("l4", "Silhouette ridge","https://images.unsplash.com/photo-1531117367049-4af500fc6ab9?w=1200&h=900&fit=crop&auto=format", 3, { iso: "800",  aperture: "f/5.6",  shutterSpeed: "1/160s",  focalLength: "35mm", camera: "Sony a6400" }),
    img("l5", "Mountain range",  "https://images.unsplash.com/photo-1680204247114-0a5fd4fffd8b?w=1200&h=900&fit=crop&auto=format", 4, { iso: "100",  aperture: "f/9.0",  shutterSpeed: "1/500s",  focalLength: "18mm", camera: "Sony a6400" }),
    img("l6", "Tree silhouette", "https://images.unsplash.com/photo-1540040599774-639d4a254c21?w=1200&h=900&fit=crop&auto=format", 5, { iso: "640",  aperture: "f/4.0",  shutterSpeed: "1/200s",  focalLength: "35mm", camera: "Sony a6400" }),
  ],
};
