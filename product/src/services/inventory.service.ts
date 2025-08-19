import { InventoryModel } from "@tabletennisshop/common";
import { ObjectId } from "mongoose";

export class InventoryService {
    static async buyProduct({product_id, quantity}:{product_id: string, quantity: number}) {
        const product = await InventoryModel.findById(product_id);

        if(!product) {
           throw new Error("Product not found");
        }

        if(product.total_quantity < quantity) {
            throw new Error("Insufficient stock");
        }

        product.total_quantity -= quantity;
        await product.save();
        return product;
    }
}