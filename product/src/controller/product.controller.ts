import {ProductDoc, ProductModel} from '@tabletennisshop/common';
import { ProductService } from '../services/product.service';
import { Request, Response } from 'express';
export class ProductController{
    static async getProductBySlug(req: Request, res: Response){
        const {slug} = req.params;
        const product = await ProductService.getProductBaseOnSlug({slug});
        res.status(200).send({
            product
        });
    };

    static async pagingAllProducts (req: Request, res: Response){
        const { page, limit } = req.query;
        const pagination = await ProductService.pagingAllProducts({
            page: Number(page) || 1,
            limit: Number(limit) || 10
        });
        res.status(200).send({
            data: pagination,
            page: page,
            limit: limit
        });
    }
}