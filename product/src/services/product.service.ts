import { ProductDoc, ProductModel } from "@tabletennisshop/common";

export class ProductService{
    static async getProductBaseOnId({id}:{id: number}): Promise<ProductDoc|null>{
        return await ProductModel.findById(id);
    }

}