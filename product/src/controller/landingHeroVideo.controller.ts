import { Request, Response } from "express";
import { minioClient } from "../utils/minio";
import { NotFoundError } from "@tabletennisshop/common";

const HERO_BUCKET =
  process.env.MINIO_MEDIA_BUCKET || process.env.MINIO_BUCKET || "product-images";
const HERO_KEY = process.env.MINIO_HERO_VIDEO_KEY || "landing/hero.mp4";
const DEFAULT_VIDEO_TYPE = "video/mp4";

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

export async function getLandingHeroVideo(req: Request, res: Response): Promise<void> {
  let stat;
  try {
    stat = await minioClient.statObject(HERO_BUCKET, HERO_KEY);
  } catch (err: unknown) {
    if (isNoSuchKeyError(err)) {
      throw new NotFoundError("Hero video not found");
    }
    throw new NotFoundError("Hero video not found");
  }

  const size = stat.size;
  const contentType =
    stat.metaData?.["content-type"] || stat.metaData?.["Content-Type"] || DEFAULT_VIDEO_TYPE;

  const rangeHeader = req.headers.range;
  const parsed = parseRangeHeader(typeof rangeHeader === "string" ? rangeHeader : undefined, size);

  if (parsed.kind === "unsatisfiable") {
    res.status(416);
    res.setHeader("Content-Range", `bytes */${size}`);
    res.end();
    return;
  }

  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Content-Type", contentType);

  if (parsed.kind === "partial") {
    const { start, end } = parsed;
    const chunkLength = end - start + 1;
    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
    res.setHeader("Content-Length", String(chunkLength));
    const stream = await minioClient.getPartialObject(HERO_BUCKET, HERO_KEY, start, chunkLength);
    stream.on("error", () => {
      if (!res.writableEnded) res.destroy();
    });
    stream.pipe(res);
    return;
  }

  res.status(200);
  res.setHeader("Content-Length", String(size));
  const stream = await minioClient.getObject(HERO_BUCKET, HERO_KEY);
  stream.on("error", () => {
    if (!res.writableEnded) res.destroy();
  });
  stream.pipe(res);
}
