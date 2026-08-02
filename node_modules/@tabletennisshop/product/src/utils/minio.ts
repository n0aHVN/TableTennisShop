import { Client } from "minio";
import crypto from "crypto";
import { encodeMediaKeyPathSegments } from "@tabletennisshop/common";

const ENDPOINT = process.env.MINIO_ENDPOINT || "localhost";
const PORT = parseInt(process.env.MINIO_PORT || "9000", 10);
export const MINIO_BUCKET = process.env.MINIO_BUCKET || "product-images";
const ACCESS_KEY = process.env.MINIO_ACCESS_KEY || "minioadmin";
const SECRET_KEY = process.env.MINIO_SECRET_KEY || "minioadmin";

const MEDIA_API_PATH = process.env.PRODUCT_MEDIA_API_PATH || "/api/media";

export const minioClient = new Client({
  endPoint: ENDPOINT,
  port: PORT,
  useSSL: false,
  accessKey: ACCESS_KEY,
  secretKey: SECRET_KEY,
});

/**
 * Creates the bucket if needed and sets anonymous **read-only** access (`s3:GetObject` only).
 * Put/delete still require MinIO credentials (e.g. root user / access key).
 */
export async function ensureBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(MINIO_BUCKET);
  if (!exists) {
    await minioClient.makeBucket(MINIO_BUCKET);
  }
  const publicReadOnlyPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${MINIO_BUCKET}/*`],
      },
    ],
  };
  await minioClient.setBucketPolicy(MINIO_BUCKET, JSON.stringify(publicReadOnlyPolicy));
}

function generateKey(originalName: string): string {
  const ext = originalName.substring(originalName.lastIndexOf("."));
  const hash = crypto.randomUUID();
  return `${Date.now()}-${hash}${ext}`;
}

/** Gallery object key: `products/<productId>/<yyyy>/<MM>/<uuid>.<ext>` */
export function buildGalleryObjectKey(productId: string, originalName: string): string {
  const ext = originalName.includes(".")
    ? originalName.substring(originalName.lastIndexOf("."))
    : "";
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const id = crypto.randomUUID();
  return `products/${productId}/${yyyy}/${MM}/${id}${ext}`;
}

/**
 * Browser-facing URL for an object. Prefer `MINIO_PUBLIC_BASE_URL` for direct GET against MinIO.
 * Otherwise proxy URL is `/api/media/{bucket}/{key...}` (path segments encoded per segment).
 */
export function buildPublicMediaUrl(key: string): string {
  const base = process.env.MINIO_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (base) {
    return `${base}/${MINIO_BUCKET}/${encodeMediaKeyPathSegments(key)}`;
  }
  const apiBase = MEDIA_API_PATH.replace(/\/$/, "");
  return `${apiBase}/${MINIO_BUCKET}/${encodeMediaKeyPathSegments(key)}`;
}

export async function uploadImage(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ key: string; url: string }> {
  const key = generateKey(originalName);

  await minioClient.putObject(MINIO_BUCKET, key, buffer, buffer.length, {
    "Content-Type": mimeType,
  });

  return { key, url: buildPublicMediaUrl(key) };
}

/** Upload bytes to an explicit object key (gallery layout). */
export async function uploadImageAtKey(
  buffer: Buffer,
  key: string,
  mimeType: string
): Promise<{ key: string; url: string }> {
  await minioClient.putObject(MINIO_BUCKET, key, buffer, buffer.length, {
    "Content-Type": mimeType,
  });
  return { key, url: buildPublicMediaUrl(key) };
}

export async function deleteImage(key: string): Promise<void> {
  await minioClient.removeObject(MINIO_BUCKET, key);
}

export async function uploadIntroductionVideo(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ key: string; url: string }> {
  const key = `intro-videos/${generateKeyForMedia(originalName)}`;
  await minioClient.putObject(MINIO_BUCKET, key, buffer, buffer.length, {
    "Content-Type": mimeType,
  });
  return { key, url: buildPublicMediaUrl(key) };
}

function generateKeyForMedia(originalName: string): string {
  const ext = originalName.includes(".")
    ? originalName.substring(originalName.lastIndexOf("."))
    : "";
  const hash = crypto.randomUUID();
  return `${Date.now()}-${hash}${ext}`;
}
