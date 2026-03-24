import { Request, Response } from "express";
import multer from "multer";
import { ProductModel } from "../models/product.model";
import { uploadIntroductionVideo, deleteImage } from "../utils/minio";
import { ApiResponse, BadRequestError, NotFoundError, routeParam } from "@tabletennisshop/common";

const MAX_VIDEOS = 5;
const MAX_FILE_SIZE = 80 * 1024 * 1024; // 80 MB
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const storage = multer.memoryStorage();

export const uploadVideoMulter = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestError(
          `Invalid video type: ${file.mimetype}. Allowed: ${ALLOWED_TYPES.join(", ")}`
        )
      );
    }
  },
});

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
