import * as Minio from 'minio';
import crypto from 'crypto';

const ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const PORT = parseInt(process.env.MINIO_PORT || '9000', 10);
const BUCKET = process.env.MINIO_BUCKET || 'product-images';
const ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';

export const minioClient = new Minio.Client({
  endPoint: ENDPOINT,
  port: PORT,
  useSSL: false,
  accessKey: ACCESS_KEY,
  secretKey: SECRET_KEY,
});

export async function ensureBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET);

    const publicPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(BUCKET, JSON.stringify(publicPolicy));
  }
}

function generateKey(originalName: string): string {
  const ext = originalName.substring(originalName.lastIndexOf('.'));
  const hash = crypto.randomUUID();
  return `${Date.now()}-${hash}${ext}`;
}

function buildPublicUrl(key: string): string {
  return `http://${ENDPOINT}:${PORT}/${BUCKET}/${key}`;
}

export async function uploadImage(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ key: string; url: string }> {
  const key = generateKey(originalName);

  await minioClient.putObject(BUCKET, key, buffer, buffer.length, {
    'Content-Type': mimeType,
  });

  return { key, url: buildPublicUrl(key) };
}

export async function deleteImage(key: string): Promise<void> {
  await minioClient.removeObject(BUCKET, key);
}
