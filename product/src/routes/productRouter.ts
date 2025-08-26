import express, { Request, Response, Router } from "express";
import { ProductController } from "../controller/product.controller";
import { addProductController, addProductValidation } from "../controller/addProduct.controller";

const productRouter = express.Router();

productRouter.get("/api/products/:slug", ProductController.getProductBySlug);

productRouter.get("/api/products", ProductController.pagingAllProducts);

productRouter.post("/api/products", addProductValidation, addProductController);

export { productRouter };