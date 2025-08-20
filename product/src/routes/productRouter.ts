import express, { Request, Response, Router } from "express";
import { ProductController } from "../controller/product.controller";

const productRouter = express.Router();

productRouter.get("/api/products/:slug", ProductController.getProductBySlug);

productRouter.get("/api/products", ProductController.pagingAllProducts);

export { productRouter };