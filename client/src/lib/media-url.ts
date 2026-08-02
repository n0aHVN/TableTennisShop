/**
 * Segment-wise encoding for `/api/media/{bucket}/{key...}` — matches
 * `encodeMediaKeyPathSegments` in `@tabletennisshop/common` so URLs align with the product service proxy.
 */
export function encodeMediaKeyPathSegments(key: string): string {
  return key
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

/** Proxied MinIO GET path used by the product service (`GET /api/media/:bucket/...`). */
export function proxiedMediaPath(bucket: string, objectKey: string): string {
  const envOrigin = process.env.NEXT_PUBLIC_PRODUCT_API_ORIGIN;
  const origin = (
    envOrigin === undefined ? "http://localhost:3002" : envOrigin.replace(/\/$/, "")
  );
  return `${origin}/api/media/${bucket}/${encodeMediaKeyPathSegments(objectKey)}`;
}
