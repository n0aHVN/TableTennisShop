import { ProductDoc, ProductModel } from "../models/product.model";
import { ProductAttrsBase } from "../models/product.model";
import { RacketAttrs } from "../models/racket.model";
import { ShirtAttrs } from "../models/shirt.model";
import { SpongeAttrs } from "../models/sponge.model";

export class ProductService{
    static async getProductBaseOnSlug({slug}:{slug: string}): Promise<ProductDoc|null>{
        return await ProductModel.findOne({slug});
    }
    static async pagingAllProducts({page, limit}:{page: number, limit: number}){
        const total = await ProductModel.countDocuments();
        const products = await ProductModel.find()
            .skip((page - 1) * limit)
            .limit(limit);
        return products;
    }
    static async addProduct(
        product: RacketAttrs | ShirtAttrs | SpongeAttrs
    ): Promise<ProductDoc> {
        const productDoc = (ProductModel as any).buildProduct(product);
        await productDoc.save();
        return productDoc;
    }
}