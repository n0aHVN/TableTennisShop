import { NotFoundError, ProductStatusEnum } from "@tabletennisshop/common";
import { ProductAttrsBase, ProductModel } from "../models/product.model";

export class ProductService {
    static async updateProduct({ _id, status, price }: { _id: string, status: ProductStatusEnum, price: number }) {
        // Update the product with the new status and price
        const productDoc = await ProductModel.findById(_id);

        if (!productDoc) {
            throw new NotFoundError("Product not found");
        }
        productDoc.status = status;
        productDoc.price = price;
        await productDoc.save();
        return productDoc;
    }
    static async createProduct({ _id, price, status, version }: ProductAttrsBase) {
        // Create a new product in the database
        const productDoc = new ProductModel({
            _id,
            price,
            status,
            version,
        });
        await productDoc.save();
        return productDoc;
    }
}