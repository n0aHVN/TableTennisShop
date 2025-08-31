import { BadRequestError, NotFoundError } from "@tabletennisshop/common";
import { InventoryDoc, InventoryModel } from "../models/inventory.model";
import { InventoryUpdatedPublisher } from "../events/publisher/InventoryUpdatedPublisher";
import { natsWrapper } from "../NatsWrapper";
import { Types } from "mongoose";
import { InventoryCreatedPublisher } from "../events/publisher/InventoryCreatedPublisher";

type UpdateInventoryParams = Omit<Partial<InventoryDoc>, "_id" | "version"> & {
    _id: string;
}

export class InventoryService {
    static async getInventoryByProductId(product_id: string) {
        const inventory = await InventoryModel.findOne({ product_id});
        if (!inventory) {
            throw new NotFoundError("Inventory not found");
        }
        return inventory;
    }
    static async getInventoryIdByProductId(product_id: string) {
        const inventory = await InventoryModel.findOne({ product_id });
        if (!inventory) {
            throw new NotFoundError("Inventory not found");
        }
        return inventory._id.toHexString();
    }

    static async addQuantity({ quantity, inventory_id }: { quantity: number, inventory_id: string }) {
        const product = await InventoryModel.findById(inventory_id);
        if (!product) {
            throw new NotFoundError("Product not found");
        }

        product.total_quantity += quantity;
        await product.save();
        new InventoryUpdatedPublisher(natsWrapper.client).publish({
            _id: product._id.toHexString(),
            total_quantity: product.total_quantity,
            version: product.version,
            product_id: product.product_id.toHexString()
        });
        return product;
    }

    static async subtractQuantity({ quantity, inventory_id }: { quantity: number, inventory_id: string }) {
        const product = await InventoryModel.findById(inventory_id);
        if (!product) {
            throw new NotFoundError("Product not found");
        }
        
        product.total_quantity -= quantity;
        if (product.total_quantity < 0) {
            throw new BadRequestError("Insufficient quantity");
        }
        await product.save();
        
        new InventoryUpdatedPublisher(natsWrapper.client).publish({
            _id: product._id.toHexString(),
            total_quantity: product.total_quantity,
            version: product.version,
            product_id: product.product_id.toHexString()
        });
        return product;
    }

    static async createInventory({ product_id, total_quantity }: { product_id: string; total_quantity: number }) {
        const existingInventory = await InventoryModel.findOne({ product_id });
        if (existingInventory) {
            throw new BadRequestError("Inventory for this product already exists");
        }
        const inventory = await InventoryModel.build({
            product_id,
            total_quantity: total_quantity
        });
        await inventory.save();

        new InventoryCreatedPublisher(natsWrapper.client).publish({
            _id: inventory._id.toHexString(),
            product_id: inventory.product_id.toHexString(),
            total_quantity: inventory.total_quantity,
            version: inventory.version
        });

        return inventory;
    }
    static async updateInventory(data: UpdateInventoryParams) {
        const inventory = await InventoryModel.findOne({_id: data._id});
        if(!inventory) throw new Error("Inventory not found");
        if (data.product_id !== undefined) inventory.product_id = data.product_id;
        if (data.total_quantity !== undefined) inventory.total_quantity = data.total_quantity;
        inventory.set(data);
        const updatedInventory = await inventory.save();
        new InventoryUpdatedPublisher(natsWrapper.client).publish({
            _id: updatedInventory._id.toHexString(),
            total_quantity: updatedInventory.total_quantity,
            version: updatedInventory.version,
            product_id: updatedInventory.product_id.toHexString()
        });
        return updatedInventory;
    }
}