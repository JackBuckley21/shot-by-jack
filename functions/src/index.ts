import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as admin from "firebase-admin";
import sharp from "sharp";
import exifr from "exifr";
import { randomUUID } from "crypto";

admin.initializeApp();
const db = admin.firestore();

export const processUploadedPhoto = onObjectFinalized(
    {
        memory: "1GiB",
        timeoutSeconds: 120,
    },
    async (event) => {
        const filePath = event.data.name; // e.g. shoots/{shootId}/raw/{timestamp}_{fileName} or shoots/{shootId}/cover/raw/{timestamp}_{fileName}
        const contentType = event.data.contentType;

        // Only process raw images
        if (!filePath || !filePath.includes("/raw/") || !contentType?.startsWith("image/")) {
            return;
        }

        const bucket = admin.storage().bucket(event.data.bucket);
        const [rawBuffer] = await bucket.file(filePath).download();
        const pathParts = filePath.split("/");
        const rawFileName = pathParts[pathParts.length - 1];
        const baseName = rawFileName.replace(/\.[^/.]+$/, "");

        // ── Handle Shoot Cover Photos ──────────────────────────────────────────
        // e.g. shoots/{shootId}/cover/raw/{filename} or covers/raw/{filename}
        const isCover = filePath.includes("/cover/raw/") || filePath.startsWith("covers/raw/");

        if (isCover) {
            let shootId: string | undefined;
            let coverDisplayPath: string;

            if (filePath.startsWith("shoots/")) {
                shootId = pathParts[1];
                coverDisplayPath = `shoots/${shootId}/cover/display/${baseName}.webp`;
            } else {
                shootId = event.data.metadata?.shootId as string | undefined;
                coverDisplayPath = `covers/display/${baseName}.webp`;
            }

            // Generate 2560px WebP cover version
            const coverBuffer = await sharp(rawBuffer)
                .resize({ width: 2560, withoutEnlargement: true })
                .webp({ quality: 85 })
                .toBuffer();

            const coverToken = randomUUID();
            const coverFile = bucket.file(coverDisplayPath);
            await coverFile.save(coverBuffer, {
                contentType: "image/webp",
                metadata: {
                    firebaseStorageDownloadTokens: coverToken,
                    cacheControl: "public, max-age=31536000",
                },
            });

            const coverUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(coverDisplayPath)}?alt=media&token=${coverToken}`;

            if (shootId) {
                await db.collection("shoots").doc(shootId).update({
                    coverUrl,
                    coverPath: coverDisplayPath,
                });
            }
            return;
        }

        // ── Handle Shoot Gallery Photos ────────────────────────────────────────
        // e.g. shoots/{shootId}/raw/{timestamp}_{fileName}
        const shootId = pathParts[1];
        if (!shootId) return;

        // 1. Extract camera EXIF metadata
        let meta: Record<string, string> = {};
        try {
            const parsedExif = await exifr.parse(rawBuffer, {
                tiff: true,
                xmp: true,
                exif: true,
                mergeOutput: true,
            });

            if (parsedExif) {
                const rawCamera = parsedExif.Model || parsedExif.Make;
                const camera = rawCamera ? String(rawCamera).trim() : "Sony a6400";
                const rawLens = parsedExif.LensModel || parsedExif.Lens || parsedExif.LensType;
                const lens = rawLens ? String(rawLens).trim() : undefined;

                let focalLength: string | undefined;
                if (parsedExif.FocalLength !== undefined && parsedExif.FocalLength !== null) {
                    const fl = Number(parsedExif.FocalLength);
                    if (!isNaN(fl) && fl > 0) {
                        focalLength = `${Math.round(fl)}mm`;
                    }
                }

                let aperture: string | undefined;
                if (parsedExif.FNumber !== undefined && parsedExif.FNumber !== null) {
                    const fn = Number(parsedExif.FNumber);
                    if (!isNaN(fn) && fn > 0) {
                        aperture = `f/${fn % 1 === 0 ? fn.toFixed(0) : fn.toFixed(1)}`;
                    }
                }

                let shutterSpeed: string | undefined;
                if (parsedExif.ExposureTime !== undefined && parsedExif.ExposureTime !== null) {
                    const exp = Number(parsedExif.ExposureTime);
                    if (!isNaN(exp) && exp > 0) {
                        shutterSpeed = exp < 1 ? `1/${Math.round(1 / exp)}s` : `${exp}s`;
                    }
                }

                const rawIso = parsedExif.ISO || parsedExif.PhotographicSensitivity || parsedExif.ISOSpeedRatings;
                let iso: string | undefined;
                if (rawIso !== undefined && rawIso !== null) {
                    iso = `ISO ${rawIso}`;
                }

                const rawMeta: Record<string, string | undefined> = {
                    camera,
                    lens,
                    focalLength,
                    aperture,
                    shutterSpeed,
                    iso,
                };

                meta = Object.fromEntries(
                    Object.entries(rawMeta).filter(([_, v]) => v !== undefined && v !== "")
                ) as Record<string, string>;
            }
        } catch (err) {
            console.warn("Could not parse EXIF:", err);
        }

        // 2. Generate 1920px WebP display version
        const displayBuffer = await sharp(rawBuffer)
            .resize({ width: 1920, withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer();

        const displayPath = `shoots/${shootId}/display/${baseName}.webp`;
        const displayFile = bucket.file(displayPath);
        const displayToken = randomUUID();
        const originalToken = randomUUID();

        // Save WebP display version with permanent download token
        await displayFile.save(displayBuffer, {
            contentType: "image/webp",
            metadata: {
                firebaseStorageDownloadTokens: displayToken,
                cacheControl: "public, max-age=31536000",
            },
        });

        // Set permanent download token on raw original file
        await bucket.file(filePath).setMetadata({
            metadata: {
                firebaseStorageDownloadTokens: originalToken,
            },
        });

        // 3. Construct permanent Firebase Storage download URLs
        const displayUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(displayPath)}?alt=media&token=${displayToken}`;
        const originalUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${originalToken}`;

        // 4. Create record in Firestore subcollection
        const imagesRef = db.collection("shoots").doc(shootId).collection("images");
        const countSnap = await imagesRef.count().get();

        await imagesRef.add({
            name: rawFileName.replace(/^\d+_/, ""),
            url: displayUrl,
            originalUrl: originalUrl,
            path: displayPath,
            originalPath: filePath,
            meta,
            order: countSnap.data().count,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update parent shoot image counter
        await db.collection("shoots").doc(shootId).update({
            imageCount: admin.firestore.FieldValue.increment(1),
        });
    }
);