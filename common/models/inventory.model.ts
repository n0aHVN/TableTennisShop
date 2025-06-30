import { Document, Schema, Types, model } from "mongoose";

export interface IInventory {
    product_id: Types.ObjectId; // Product ID
    total_quantity: number; // Total quantity of the product in inventory
    serials?: string[]; // Optional array of serial numbers for the product
}

interface InventoryDoc extends IInventory, Document {
    createdAt: Date; // Timestamp for when the inventory record was created
    updatedAt: Date; // Timestamp for when the inventory record was last updated
}

// Define the schema for the inventory model
const InventorySchema = new Schema<InventoryDoc>({
    product_id: { type: Schema.Types.ObjectId, required: true, ref: 'Product' }, // Reference to the Product model
    total_quantity: { type: Number, required: true, default: 0 }, // Total quantity of the product
    serials: { type: [String], required: false }, // Optional array of serial numbers
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    collection: 'inventory' // Name of the collection in MongoDB
});
InventorySchema.statics.build = (attrs: IInventory) => {
    return new InventoryModel(attrs);
}

// Create the Inventory model
export const InventoryModel = model<InventoryDoc>('Inventory', InventorySchema);

