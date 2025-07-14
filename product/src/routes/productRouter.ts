import express, { Request, Response, Router } from "express";
import { ProductController } from "../controller/product.controller";
import { IPaginationMetaData} from "../types/pagination.types";
import { createPaginationMeta } from "../utils/pagination";
import { ProductEnum } from "@tabletennisshop/common/build/enums/product.enum";

const productRouter = express.Router();

productRouter.get("/api/products/",async (req: Request, res: Response)=>{
    const page = parseInt(req.query.page as string) || 1;
    const type = req.query.type as ProductEnum;
    const products = await ProductController.pagingProducts({page, type});
    const totalItems = await ProductController.countAllProducts();

    const meta : IPaginationMetaData = createPaginationMeta({
        totalItems: totalItems,
        currentPage: page}
    );
    res.status(200).send({
        items: products,
        meta: meta
    })
});

export {productRouter};