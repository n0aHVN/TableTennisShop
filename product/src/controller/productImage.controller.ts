import { Request, Response } from 'express';
import multer from 'multer';
import { ProductModel } from '../models/product.model';
import { uploadImage, deleteImage } from '../utils/minio';
import { ApiResponse, NotFoundError, BadRequestError } from '@tabletennisshop/common';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError(`Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_TYPES.join(', ')}`));
    }
  },
});

export async function addProductImages(req: Request, res: Response<ApiResponse>) {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new BadRequestError('No files provided');
  }

  const product = await ProductModel.findById(id);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  if (product.images.length + files.length > MAX_FILES) {
    throw new BadRequestError(`A product can have at most ${MAX_FILES} images. Current: ${product.images.length}, uploading: ${files.length}`);
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
  const { id, key } = req.params;

  const product = await ProductModel.findById(id);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const imageIndex = product.images.findIndex((img) => img.key === key);
  if (imageIndex === -1) {
    throw new NotFoundError("Image not found");
  }

  await deleteImage(key as string);

  product.images.splice(imageIndex, 1);
  await product.save();

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: product,
  });
}
