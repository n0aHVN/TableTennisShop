import express from "express";
import { ProductController } from "../controller/product.controller";
import { addProductImages, removeProductImage, upload } from "../controller/productImage.controller";
import {
  addIntroductionVideos,
  removeIntroductionVideo,
  uploadVideoMulter,
} from "../controller/productVideo.controller";
import {
  addFlagshipEntry,
  addFlagshipValidation,
  getFlagshipProducts,
  removeFlagshipEntry,
} from "../controller/flagship.controller";
import { getLandingHeroVideo } from "../controller/landingHeroVideo.controller";
import { ValidateRequestMiddleware } from "@tabletennisshop/common";

const productRouter = express.Router();

/** Register before `/api/products/:slug` so `flagship` is not captured as a slug. */
productRouter.get("/api/products/landing/hero-video", getLandingHeroVideo);
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

productRouter.post("/api/products/:id/images", upload.array('images', 5), addProductImages);

productRouter.delete("/api/products/:id/images/:key", removeProductImage);

productRouter.post(
  "/api/products/:id/videos",
  uploadVideoMulter.array("videos", 5),
  addIntroductionVideos
);

productRouter.delete("/api/products/:id/videos", removeIntroductionVideo);

export { productRouter };