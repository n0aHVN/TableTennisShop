import { Request, Response } from "express";
import multer from "multer";
import { ProductModel } from "../models/product.model";
import { uploadImage, deleteImage, uploadIntroductionVideo, minioClient, MINIO_BUCKET } from "../utils/minio";
import {
  ApiResponse,
  NotFoundError,
  BadRequestError,
  routeParam,
} from "@tabletennisshop/common";

const HERO_KEY = process.env.MINIO_HERO_VIDEO_KEY || "landing/hero.mp4";
const DEFAULT_VIDEO_TYPE = "video/mp4";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_VIDEOS = 5;
const MAX_VIDEO_SIZE = 80 * 1024 * 1024;
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const imageStorage = multer.memoryStorage();

export const upload = multer({
  storage: imageStorage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestError(`Invalid file type: ${file.mimetype}. Allowed: ${IMAGE_TYPES.join(", ")}`)
      );
    }
  },
});

export const uploadVideoMulter = multer({
  storage: imageStorage,
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter: (_req, file, cb) => {
    if (VIDEO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestError(
          `Invalid video type: ${file.mimetype}. Allowed: ${VIDEO_TYPES.join(", ")}`
        )
      );
    }
  },
});

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

function assertSafeObjectKey(key: string): void {
  if (!key || key.length > 1024) {
    throw new BadRequestError("Invalid key");
  }
  if (key.startsWith("/") || key.includes("..")) {
    throw new BadRequestError("Invalid key");
  }
}

async function streamObject(bucket: string, key: string, req: Request, res: Response): Promise<void> {
  let stat;
  try {
    stat = await minioClient.statObject(bucket, key);
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
    (key.endsWith(".mp4") ? DEFAULT_VIDEO_TYPE : "application/octet-stream");

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
    const stream = await minioClient.getPartialObject(bucket, key, start, chunkLength);
    stream.on("error", () => {
      if (!res.writableEnded) res.destroy();
    });
    stream.pipe(res);
    return;
  }

  res.status(200);
  res.setHeader("Content-Length", String(size));
  const stream = await minioClient.getObject(bucket, key);
  stream.on("error", () => {
    if (!res.writableEnded) res.destroy();
  });
  stream.pipe(res);
}

/**
 * GET ?path=landing/hero.mp4 (or legacy ?key=) — object path in the bucket = MinIO object key.
 * Same bytes as a public GetObject; unsafe paths (`..`, leading `/`) are rejected.
 */
export async function getProductMedia(req: Request, res: Response): Promise<void> {
  const raw = req.query.path ?? req.query.key;
  if (typeof raw !== "string" || !raw.trim()) {
    throw new BadRequestError("Query parameter `path` (or `key`) is required");
  }
  const objectKey = raw.trim();
  assertSafeObjectKey(objectKey);

  await streamObject(MINIO_BUCKET, objectKey, req, res);
}

export async function getLandingHeroVideo(req: Request, res: Response): Promise<void> {
  assertSafeObjectKey(HERO_KEY);
  await streamObject(MINIO_BUCKET, HERO_KEY, req, res);
}

export async function addProductImages(req: Request, res: Response<ApiResponse>) {
  const id = routeParam(req, "id");
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new BadRequestError("No files provided");
  }

  const product = await ProductModel.findById(id);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  if (product.images.length + files.length > MAX_IMAGES) {
    throw new BadRequestError(
      `A product can have at most ${MAX_IMAGES} images. Current: ${product.images.length}, uploading: ${files.length}`
    );
  }

  const uploaded = await Promise.all(
    files.map((file) => uploadImage(file.buffer, file.originalname, file.mimetype))
  );

  product.images.push(...uploaded);
  await product.save();

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: product,
  });
}

export async function removeProductImage(req: Request, res: Response<ApiResponse>) {
  const id = routeParam(req, "id");
  const key = routeParam(req, "key");

  const product = await ProductModel.findById(id);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const imageIndex = product.images.findIndex((img) => img.key === key);
  if (imageIndex === -1) {
    throw new NotFoundError("Image not found");
  }

  await deleteImage(key);

  product.images.splice(imageIndex, 1);
  await product.save();

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: product,
  });
}

export async function addIntroductionVideos(req: Request, res: Response<ApiResponse>) {
  const id = routeParam(req, "id");
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new BadRequestError("No video files provided");
  }

  const product = await ProductModel.findById(id);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const existing = product.introductionVideos ?? [];
  if (existing.length + files.length > MAX_VIDEOS) {
    throw new BadRequestError(
      `A product can have at most ${MAX_VIDEOS} introduction videos. Current: ${existing.length}, uploading: ${files.length}`
    );
  }

  const uploaded = await Promise.all(
    files.map((file) =>
      uploadIntroductionVideo(file.buffer, file.originalname, file.mimetype)
    )
  );

  product.introductionVideos = [...existing, ...uploaded];
  await product.save();

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: product,
  });
}

export async function removeIntroductionVideo(req: Request, res: Response<ApiResponse>) {
  const id = routeParam(req, "id");
  const key = req.query.key as string;

  if (!key || typeof key !== "string") {
    throw new BadRequestError("Query parameter `key` (MinIO object key) is required");
  }

  const product = await ProductModel.findById(id);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const videos = product.introductionVideos ?? [];
  const idx = videos.findIndex((v) => v.key === key);
  if (idx === -1) {
    throw new NotFoundError("Video not found on this product");
  }

  await deleteImage(key);
  videos.splice(idx, 1);
  product.introductionVideos = videos;
  await product.save();

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: product,
  });
}
