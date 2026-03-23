import { ProductDoc, ProductModel } from "../models/product.model";
import { RacketAttrs, RacketDoc } from "../models/racket.model";
import { ShirtAttrs } from "../models/shirt.model";
import { SpongeAttrs } from "../models/sponge.model";
import { ProductUpdatePublisher } from "../events/publishers/ProductUpdatePublisher";
import { NotFoundError, OrderStatusEnum, ProductTypeEnum } from "@tabletennisshop/common";
import { natsWrapper } from "../NatsWrapper";

type UpdateProductAttrs = Omit<
  Partial<RacketAttrs | ShirtAttrs | SpongeAttrs>,
  "_id"
> & {
  _id: string;
};

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
    static async updateProduct(
        data: UpdateProductAttrs
    ): Promise<ProductDoc> {

        const productDoc = await ProductModel.findOne({ _id: data._id });
        
        if (!productDoc){
            throw new NotFoundError("Product not found");
        }

        // Update base fields if provided
        if (data.price !== undefined) productDoc.price = data.price;
        if (data.status !== undefined) productDoc.status = data.status;
        if (data.name !== undefined) productDoc.name = data.name;
        if (data.brand !== undefined) productDoc.brand = data.brand;
        if (data.description !== undefined) productDoc.description = data.description;
        if (data.sport !== undefined) productDoc.sport = data.sport;
        if (data.attributes !== undefined) productDoc.attributes = data.attributes;
        if (data.slug !== undefined) productDoc.slug = data.slug;
        
        // If type-specific logic is needed, you can add it here
        // For example, if you want to ensure the type matches:
        if (data.type && productDoc.type !== data.type) {
            productDoc.type = data.type;
        }
        await productDoc.save();

        new ProductUpdatePublisher(natsWrapper.client).publish({
            _id: productDoc._id.toHexString(),
            price: productDoc.price,
            status: productDoc.status,
            version: productDoc.version
        });

        return productDoc;
    }
}