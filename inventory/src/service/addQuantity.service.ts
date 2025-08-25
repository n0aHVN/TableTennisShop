import { BadRequestError, NotFoundError } from "@tabletennisshop/common";
import { InventoryModel } from "../models/inventory.model";

export const addQuantityService = async ({product_id, quantity}: {product_id: string, quantity: number}) => {
    // Logic to add quantity to inventory
    const product = await InventoryModel.findById(product_id);
    if (!product) {
        throw new NotFoundError("Product not found");
    }

    product.total_quantity += quantity;
    await product.save();

    return product;
}