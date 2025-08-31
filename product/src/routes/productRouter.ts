import express, { Request, Response, Router } from "express";
import { ProductController } from "../controller/product.controller";
import { addProductController, addProductValidation } from "../controller/addProduct.controller";
import { putProductController, putProductValidation } from "../controller/putProduct.controller";
import { ValidateRequestMiddleware } from "@tabletennisshop/common";

const productRouter = express.Router();

productRouter.get("/api/products/:slug", ProductController.getProductBySlug);

productRouter.get("/api/products", ProductController.pagingAllProducts);

productRouter.post("/api/products", addProductValidation, ValidateRequestMiddleware, addProductController);

productRouter.put("/api/products/:id", putProductValidation, ValidateRequestMiddleware, putProductController);

export { productRouter };