import { InventoryModel } from "@tabletennisshop/common";

export class InventoryService {
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

    static async createInventory({product_id, quantity}:{product_id: string, quantity: number}) {
        console.log("Creating product in inventory:", { product_id, quantity });
        const product = new InventoryModel({ product_id, total_quantity: quantity });
        await product.save();
        return product;
    }

    static async addInventory({product_id, quantity}:{product_id: string, quantity: number}) {
        console.log("Adding product to inventory:", { product_id, quantity });
        let product = await InventoryModel.findOne({ product_id: product_id });

        if(!product) {
           product = await this.createInventory({product_id, quantity});
        }
        
        product.total_quantity += quantity;
        await product.save();
        return product;
    }
}