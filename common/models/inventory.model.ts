import { Document, Model, Schema, Types, model } from "mongoose";

export interface IInventory {
    product_id: Types.ObjectId;
    total_quantity: number;
    serials?: string[];
}

interface InventoryDoc extends IInventory, Document {
    createdAt: Date;
    updatedAt: Date;
}

interface InventoryModelType extends Model<InventoryDoc> {
    build(attrs: IInventory): InventoryDoc;
}

const InventorySchema = new Schema<InventoryDoc>({
    product_id: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
    total_quantity: { type: Number, required: true, default: 0 },
    serials: { type: [String], required: false },
}, {
    timestamps: true,
    collection: 'inventory'
});

InventorySchema.statics.build = (attrs: IInventory) => {
    return new InventoryModel(attrs);
};

export const InventoryModel = model<InventoryDoc, InventoryModelType>('Inventory', InventorySchema);

