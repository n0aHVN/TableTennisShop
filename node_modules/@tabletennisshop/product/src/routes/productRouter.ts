import express from "express";
import { ProductController } from "../controller/product.controller";
import {
  addIntroductionVideos,
  addProductImages,
  MAX_PRODUCT_IMAGES,
  MAX_PRODUCT_VIDEOS,
  removeIntroductionVideo,
  removeProductImage,
  upload,
  uploadVideoMulter,
} from "../controller/productMedia.controller";
import {
  addFlagshipEntry,
  addFlagshipValidation,
  getFlagshipProducts,
  removeFlagshipEntry,
} from "../controller/flagship.controller";
import { ValidateRequestMiddleware } from "@tabletennisshop/common";

const productRouter = express.Router();

/** Register before `/api/products/:slug` so fixed segments are not captured as slugs. */
productRouter.get("/api/products/flagship", getFlagshipProducts);
productRouter.post(
  "/api/products/flagship",
  addFlagshipValidation,
  ValidateRequestMiddleware,
  addFlagshipEntry
);
productRouter.delete("/api/products/flagship/:id", removeFlagshipEntry);

productRouter.get("/api/products/:slug", ProductController.getProductBySlug);

productRouter.get("/api/products", ProductController.pagingAllProducts);

productRouter.post(
  "/api/products",
  ProductController.addProductValidation,
  ValidateRequestMiddleware,
  ProductController.addProduct
);

productRouter.put(
  "/api/products/:id",
  ProductController.putProductValidation,
  ValidateRequestMiddleware,
  ProductController.putProduct
);

productRouter.post(
  "/api/products/:id/images",
  upload.array("images", MAX_PRODUCT_IMAGES),
  addProductImages
);

productRouter.delete("/api/products/:id/images/:imageId", removeProductImage);

productRouter.post(
  "/api/products/:id/videos",
  uploadVideoMulter.array("videos", MAX_PRODUCT_VIDEOS),
  addIntroductionVideos
);

productRouter.delete("/api/products/:id/videos", removeIntroductionVideo);

export { productRouter };
