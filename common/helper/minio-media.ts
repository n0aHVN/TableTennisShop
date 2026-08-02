import type { Client } from "minio";
import type { Readable } from "stream";
import { BadRequestError } from "../errors/bad-request-error";
import { NotFoundError } from "../errors/not-found-error";

type RangeParse =
  | { kind: "none" }
  | { kind: "partial"; start: number; end: number }
  | { kind: "unsatisfiable" };

function parseRangeHeader(rangeHeader: string | undefined, size: number): RangeParse {
  if (!rangeHeader || !rangeHeader.startsWith("bytes=")) {
    return { kind: "none" };
  }
  const token = rangeHeader.slice("bytes=".length).trim();
  const dash = token.indexOf("-");
  if (dash < 0) return { kind: "unsatisfiable" };
  const left = token.slice(0, dash);
  const right = token.slice(dash + 1);

  if (left === "" && right !== "") {
    const suffix = parseInt(right, 10);
    if (Number.isNaN(suffix) || suffix <= 0) return { kind: "unsatisfiable" };
    const start = Math.max(0, size - suffix);
    return { kind: "partial", start, end: size - 1 };
  }

  const start = left === "" ? 0 : parseInt(left, 10);
  const end = right === "" ? size - 1 : parseInt(right, 10);
  if (Number.isNaN(start) || start < 0) return { kind: "unsatisfiable" };
  if (Number.isNaN(end)) return { kind: "unsatisfiable" };
  if (start >= size) return { kind: "unsatisfiable" };
  const endClamped = Math.min(end, size - 1);
  if (start > endClamped) return { kind: "unsatisfiable" };
  return { kind: "partial", start, end: endClamped };
}

function isNoSuchKeyError(err: unknown): boolean {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code?: string }).code;
    return code === "NoSuchKey" || code === "NotFound";
  }
  return false;
}

/** Encode each path segment so keys like `landing/hero.mp4` become valid path-style URLs. */
export function encodeMediaKeyPathSegments(key: string): string {
  return key
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

export function assertSafeObjectKey(key: string): void {
  if (!key || key.length > 1024) {
    throw new BadRequestError("Invalid key");
  }
  if (key.startsWith("/") || key.includes("..")) {
    throw new BadRequestError("Invalid key");
  }
}

/** S3-style bucket name guard (lowercase DNS bucket labels). */
export function assertSafeBucketName(bucket: string): void {
  if (!bucket || bucket.length < 1 || bucket.length > 63) {
    throw new BadRequestError("Invalid bucket");
  }
  if (bucket.includes("..") || bucket.includes("/") || bucket.includes("\\")) {
    throw new BadRequestError("Invalid bucket");
  }
  if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$|^[a-z0-9]$/.test(bucket)) {
    throw new BadRequestError("Invalid bucket");
  }
}

/**
 * Parse `/api/media/{bucket}/{key...}` from a request pathname.
 * @param urlPath pathname only (no query), e.g. `/api/media/my-bucket/folder/file.png`
 */
export function parseMediaPathSegments(urlPath: string, basePrefix: string): { bucket: string; key: string } {
  const base = basePrefix.replace(/\/$/, "");
  const pathOnly = urlPath.split("?")[0] ?? urlPath;
  if (!pathOnly.startsWith(base + "/")) {
    throw new BadRequestError("Invalid media path");
  }
  const tail = pathOnly.slice(base.length + 1);
  const rawSegments = tail.split("/").filter(Boolean);
  if (rawSegments.length < 2) {
    throw new BadRequestError("Media path must include bucket and object key");
  }
  let segments: string[];
  try {
    segments = rawSegments.map((s) => decodeURIComponent(s));
  } catch {
    throw new BadRequestError("Invalid media path encoding");
  }
  const bucket = segments[0]!;
  const key = segments.slice(1).join("/");
  assertSafeBucketName(bucket);
  assertSafeObjectKey(key);
  return { bucket, key };
}

export type MinioMediaResult =
  | { statusCode: 416; headers: Record<string, string>; stream: null }
  | { statusCode: 200 | 206; headers: Record<string, string>; stream: Readable };

export type GetMinioMediaOptions = {
  rangeHeader?: string | undefined;
  /** Used when object has no stored content-type and key does not imply video/mp4 */
  defaultVideoContentType?: string;
};

/**
 * Resolve MinIO object metadata and a readable stream (full or ranged).
 * Caller maps `headers` + `statusCode` onto the HTTP response and pipes `stream`.
 */
export async function getMinioMedia(
  client: Client,
  bucket: string,
  key: string,
  options: GetMinioMediaOptions = {}
): Promise<MinioMediaResult> {
  const defaultVideoType = options.defaultVideoContentType ?? "video/mp4";
  let stat;
  try {
    stat = await client.statObject(bucket, key);
  } catch (err: unknown) {
    if (isNoSuchKeyError(err)) {
      throw new NotFoundError("Object not found");
    }
    throw new NotFoundError("Object not found");
  }

  const size = stat.size;
  const contentType =
    stat.metaData?.["content-type"] ||
    stat.metaData?.["Content-Type"] ||
    (key.endsWith(".mp4") ? defaultVideoType : "application/octet-stream");

  const parsed = parseRangeHeader(options.rangeHeader, size);

  if (parsed.kind === "unsatisfiable") {
    return {
      statusCode: 416,
      headers: { "Content-Range": `bytes */${size}` },
      stream: null,
    };
  }

  const baseHeaders: Record<string, string> = {
    "Accept-Ranges": "bytes",
    "Content-Type": contentType,
  };

  if (parsed.kind === "partial") {
    const { start, end } = parsed;
    const chunkLength = end - start + 1;
    const stream = await client.getPartialObject(bucket, key, start, chunkLength);
    return {
      statusCode: 206,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Content-Length": String(chunkLength),
      },
      stream,
    };
  }

  const stream = await client.getObject(bucket, key);
  return {
    statusCode: 200,
    headers: {
      ...baseHeaders,
      "Content-Length": String(size),
    },
    stream,
  };
}
