import { InventoryModel } from "../models/inventory.model";
import { Types } from "mongoose";
export const addInventoryService = async ({ product_id, quantity }: { product_id: Types.ObjectId; quantity: number }) => {
    // Logic to add inventory
    const inventory = await InventoryModel.build({
        product_id,
        total_quantity: quantity
    });
    await inventory.save();
    return inventory;
}
