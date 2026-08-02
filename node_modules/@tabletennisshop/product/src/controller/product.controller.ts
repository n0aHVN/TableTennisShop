import { body, param } from "express-validator";
import {
  routeParam,
  ApiResponse,
  ProductTypeEnum,
  ProductStatusEnum,
} from "@tabletennisshop/common";
import { ProductService } from "../services/product.service";
import { ProductModel, ProductDoc } from "../models/product.model";
import { attachGalleryUrls } from "../utils/product-gallery";
import { Request, Response } from "express";
import { natsWrapper } from "../NatsWrapper";
import { ProductCreatedPublisher } from "../events/publishers/ProductCreatedPublisher";

export class ProductController {
  static readonly addProductValidation = [
    body("name").isString().notEmpty().withMessage("Name is required"),
    body("slug").isString().notEmpty().withMessage("Slug is required"),
    body("brand").isString().notEmpty().withMessage("Brand is required"),
    body("description").optional().isString(),
    body("type")
      .isString()
      .notEmpty()
      .withMessage("Type is required")
      .isIn(Object.values(ProductTypeEnum))
      .withMessage("Type must be one of: " + Object.values(ProductTypeEnum).join(", ")),
    body("attributes").isObject().withMessage("Attributes must be a JSON object"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("status")
      .optional()
      .isString()
      .isIn(Object.values(ProductStatusEnum))
      .withMessage(
        "Status must be one of: " + Object.values(ProductStatusEnum).join(", ")
      ),
  ];

  static readonly putProductValidation = [
    param("id").isMongoId().withMessage("Invalid product ID"),
    body("version").isNumeric().withMessage("Version must be a number"),
    body("status")
      .optional()
      .isString()
      .isIn(Object.values(ProductStatusEnum))
      .withMessage(
        "Status must be one of: " + Object.values(ProductStatusEnum).join(", ")
      ),
  ];

  static async getProductBySlug(req: Request, res: Response) {
    const slug = routeParam(req, "slug");
    const product = await ProductService.getProductBaseOnSlug({ slug });
    res.status(200).send({
      product: attachGalleryUrls(product),
    });
  }

  static async pagingAllProducts(req: Request, res: Response) {
    const { page, limit } = req.query;
    const pagination = await ProductService.pagingAllProducts({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
    res.status(200).send({
      data: pagination,
      page: page,
      limit: limit,
    });
  }

  static async addProduct(req: Request, res: Response<ApiResponse>) {
    const product = req.body;
    const productDoc = (ProductModel as any).buildProduct(product);
    await productDoc.save();
    const response: ApiResponse = {
      success: true,
      data: productDoc,
      statusCode: 201,
    };

    new ProductCreatedPublisher(natsWrapper.client).publish({
      _id: productDoc._id.toHexString(),
      price: productDoc.price,
      status: productDoc.status,
      version: productDoc.version,
    });

    res.status(201).json(response);
  }

  static async putProduct(req: Request, res: Response<ApiResponse>) {
    const id = routeParam(req, "id");
    const body = req.body;

    const updatedProduct = await ProductService.updateProduct({
      _id: id,
      ...body,
    });

    res.status(200).send({
      statusCode: 200,
      data: attachGalleryUrls(updatedProduct),
      success: true,
    });
  }
}
