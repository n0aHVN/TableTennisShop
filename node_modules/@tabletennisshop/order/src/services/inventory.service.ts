import { Types } from "mongoose";
import { InventoryModel } from "../models/inventory.model";
import { NotFoundError, ProductStatusEnum } from "@tabletennisshop/common";
import { ProductService } from "./product.service";

export class InventoryService {

    static async getInventoryByProductId(product_id: string) {
        const inventory = await InventoryModel.findOne({ product_id: product_id });
        if (!inventory) {
            throw new NotFoundError("Inventory not found");
        }
        return inventory;
    }

    static async buyInventory({product_id, quantity}:{product_id: string, quantity: number}) {
        const product = await InventoryModel.findOne({ product_id: product_id });

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

    static async createInventory({_id, product_id, quantity, version}:{_id: string, product_id: string, quantity: number, version: number}) {
        console.log("Creating product in inventory:", { product_id, quantity });
        const product = InventoryModel.build({ _id, product_id, total_quantity: quantity, version });
        await product.save();
        return product;
    }

    static async addInventory({product_id, quantity}:{product_id: string, quantity: number}) {
        console.log("Adding product to inventory:", { product_id, quantity });
        let product = await InventoryModel.findOne({ product_id: product_id });

        if(!product) {
           throw new NotFoundError("Product not found");
        }
        
        product.total_quantity += quantity;
        await product.save();
        return product;
    }
    static async updateInventory({ _id, product_id, quantity, version }: { _id: string, product_id: string; quantity: number; version: number }) {
        const inventory = await InventoryModel.findOne({ _id, version: version - 1 });

        if (!inventory) {
            throw new Error("Product not found");
        }

        inventory.product_id = new Types.ObjectId(product_id);
        inventory.total_quantity = quantity;
        await inventory.save();
        return inventory;
    }
}