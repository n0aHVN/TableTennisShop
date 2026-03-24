import { Client } from "minio";
import crypto from "crypto";

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

/** Encode each path segment so keys like `landing/hero.mp4` become valid path-style URLs. */
function encodeObjectKeyForUrlPath(key: string): string {
  return key
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

/**
 * Browser-facing URL for an object. Prefer `MINIO_PUBLIC_BASE_URL` for direct GET against MinIO.
 * Otherwise proxy URL uses `?path=` (object key inside the bucket, e.g. landing/hero.mp4).
 */
function buildStoredMediaUrl(key: string): string {
  const base = process.env.MINIO_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (base) {
    return `${base}/${MINIO_BUCKET}/${encodeObjectKeyForUrlPath(key)}`;
  }
  return `${MEDIA_API_PATH}?path=${encodeURIComponent(key)}`;
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

  return { key, url: buildStoredMediaUrl(key) };
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
  return { key, url: buildStoredMediaUrl(key) };
}

function generateKeyForMedia(originalName: string): string {
  const ext = originalName.includes(".")
    ? originalName.substring(originalName.lastIndexOf("."))
    : "";
  const hash = crypto.randomUUID();
  return `${Date.now()}-${hash}${ext}`;
}
