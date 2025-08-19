import {ProductDoc, ProductModel} from '@tabletennisshop/common';
import { ProductService } from '../services/product.service';
export class ProductController{
    static async countAllProducts(): Promise<number>{
        const result = await ProductModel.countDocuments().exec();
        return result;
    }
    
}