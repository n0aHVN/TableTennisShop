import { ProductDoc, ProductModel } from "@tabletennisshop/common";

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
}