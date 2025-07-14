import { ProductDoc, ProductEnum, ProductModel } from "@tabletennisshop/common";

export class ProductService{
    static async getProductBaseOnId({id}:{id: number}): Promise<ProductDoc|null>{
        return await ProductModel.findById(id);
    }
    static async pagingProducts({page, type}: {page: number, type?: ProductEnum}): Promise<ProductDoc[]|null>{
        const limit = 24;
        const skip = (page - 1) * limit;
        const products = type ? await ProductModel.find().where('type').equals(type)
                            .select(type).skip(skip).limit(limit).exec()
                            : await ProductModel.find().skip(skip).limit(limit).exec();
        return products;
    }

}