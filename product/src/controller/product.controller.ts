import {ProductDoc, ProductEnum, ProductModel} from '@tabletennisshop/common';
import { ProductService } from '../services/product.service';
export class ProductController{
    static async pagingProducts(
        {type, page}:{type: ProductEnum, page: number}
    ): Promise<ProductDoc[]|null>{
        const products = await ProductService.pagingProducts({page, type});
        return products;
    }
    static async countAllProducts(): Promise<number>{
        const result = await ProductModel.countDocuments().exec();
        return result;
    }
    
}