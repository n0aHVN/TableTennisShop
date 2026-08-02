import { Request, Response } from "express";
import multer from "multer";
import mongoose from "mongoose";
import imageSize from "image-size";
import { ProductModel } from "../models/product.model";
import { ImageModel } from "../models/image.model";
import {
  buildGalleryObjectKey,
  deleteImage,
  uploadImageAtKey,
  uploadIntroductionVideo,
  minioClient,
} from "../utils/minio";
import { attachGalleryUrls } from "../utils/product-gallery";
import {
  ApiResponse,
  NotFoundError,
  BadRequestError,
  routeParam,
  getMinioMedia,
  parseMediaPathSegments,
} from "@tabletennisshop/common";

const DEFAULT_VIDEO_TYPE = "video/mp4";
const MEDIA_PATH_PREFIX = "/api/media";

/** Max gallery images per product (must match multer `.array(..., n)` in productRouter). */
export const MAX_PRODUCT_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Max introduction videos per product (must match multer `.array(..., n)` in productRouter). */
export const MAX_PRODUCT_VIDEOS = 5;
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

function normalizeRangeHeader(req: Request): string | undefined {
  const h = req.headers["range"] as string | string[] | undefined;
  if (typeof h === "string") return h;
  if (Array.isArray(h) && h.length > 0 && typeof h[0] === "string") return h[0];
  return undefined;
}

async function sendMinioObject(req: Request, res: Response, bucket: string, key: string): Promise<void> {
  const result = await getMinioMedia(minioClient, bucket, key, {
    rangeHeader: normalizeRangeHeader(req),
    defaultVideoContentType: DEFAULT_VIDEO_TYPE,
  });
  res.status(result.statusCode);
  for (const [name, value] of Object.entries(result.headers)) {
    res.setHeader(name, value);
  }
  if (result.stream) {
    result.stream.on("error", () => {
      if (!res.writableEnded) res.destroy();
    });
    result.stream.pipe(res);
  } else {
    res.end();
  }
}

/**
 * GET `/api/media/{bucket}` with no object key — reject before other routers treat it as a product slug.
 */
export async function rejectMediaPathMissingKey(_req: Request, _res: Response): Promise<void> {
  throw new BadRequestError("Media path must include bucket and object key");
}

/**
 * GET `/api/media/{bucket}/{key...}` — path-style proxy to MinIO (same bytes as GetObject).
 */
export async function getMinioMediaByPath(req: Request, res: Response): Promise<void> {
  const { bucket, key } = parseMediaPathSegments(req.path, MEDIA_PATH_PREFIX);
  await sendMinioObject(req, res, bucket, key);
}

function readImageDimensions(buffer: Buffer): { width: number; height: number } {
  let dim;
  try {
    dim = imageSize(buffer);
  } catch {
    throw new BadRequestError("Could not read image dimensions");
  }
  if (!dim.width || !dim.height) {
    throw new BadRequestError("Could not read image dimensions");
  }
  return { width: dim.width, height: dim.height };
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

  if (product.images.length + files.length > MAX_PRODUCT_IMAGES) {
    throw new BadRequestError(
      `A product can have at most ${MAX_PRODUCT_IMAGES} images. Current: ${product.images.length}, uploading: ${files.length}`
    );
  }

  const productId = product._id.toHexString();
  let maxOrder =
    product.images.length === 0
      ? -1
      : Math.max(...product.images.map((e) => e.order));
  const hadNoImages = product.images.length === 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const { width, height } = readImageDimensions(file.buffer);
    const key = buildGalleryObjectKey(productId, file.originalname);
    await uploadImageAtKey(file.buffer, key, file.mimetype);
    const imgDoc = await ImageModel.create({
      key,
      width,
      height,
      size: file.buffer.byteLength,
      mimeType: file.mimetype,
    });
    maxOrder += 1;
    product.images.push({
      imageId: imgDoc._id,
      order: maxOrder,
      isPrimary: hadNoImages && i === 0,
    });
  }

  await product.save();

  const refreshed = await ProductModel.findById(id).populate("images.imageId");
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: attachGalleryUrls(refreshed!) as unknown as ApiResponse["data"],
  });
}

export async function removeProductImage(req: Request, res: Response<ApiResponse>) {
  const id = routeParam(req, "id");
  const imageIdParam = routeParam(req, "imageId");

  if (!mongoose.Types.ObjectId.isValid(imageIdParam)) {
    throw new BadRequestError("Invalid image ID");
  }
  const imageObjectId = new mongoose.Types.ObjectId(imageIdParam);

  const product = await ProductModel.findById(id);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const imageIndex = product.images.findIndex((e) => e.imageId.equals(imageObjectId));
  if (imageIndex === -1) {
    throw new NotFoundError("Image not found");
  }

  const imageDoc = await ImageModel.findById(imageObjectId);
  if (!imageDoc) {
    throw new NotFoundError("Image not found");
  }

  await deleteImage(imageDoc.key);
  await ImageModel.deleteOne({ _id: imageObjectId });

  product.images.splice(imageIndex, 1);
  await product.save();

  const refreshed = await ProductModel.findById(id).populate("images.imageId");
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: attachGalleryUrls(refreshed!) as unknown as ApiResponse["data"],
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
  if (existing.length + files.length > MAX_PRODUCT_VIDEOS) {
    throw new BadRequestError(
      `A product can have at most ${MAX_PRODUCT_VIDEOS} introduction videos. Current: ${existing.length}, uploading: ${files.length}`
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
