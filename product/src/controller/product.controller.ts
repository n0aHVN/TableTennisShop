import {ProductDoc, ProductEnum, ProductModel} from '@tabletennisshop/common';
export class ProductController{
    static async getProductBaseOnId({id}:{id: number}): Promise<ProductDoc|null>{
        return await ProductModel.findById(id);
    }
    static async pagingAllProducts({page}: {page: number}): Promise<ProductDoc[]|null>{
        const limit = 24;
        const skip = (page - 1)* limit;
        const products = await ProductModel.find().skip(skip).limit(limit).exec();
        return products;
    }
    static async pagingProductsOnType(
        {type, page}:{type: ProductEnum, page: number}
    ): Promise<ProductDoc[]|null>{
        const limit = 24;
        const skip = (page - 1)* limit;
        const products = await ProductModel.find().where('type').equals(type)
                            .skip(skip).limit(limit).exec();
        return products;
    }
    static async countAllProducts(): Promise<number>{
        const result = await ProductModel.countDocuments().exec();
        return result;
    }
    
}