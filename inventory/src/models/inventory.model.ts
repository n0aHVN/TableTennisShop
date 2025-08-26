import { Document, Model, Schema, Types, model } from "mongoose";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
export interface InventoryAttrs {
    product_id: Types.ObjectId;
    total_quantity: number;
}

export interface InventoryDoc extends InventoryAttrs, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}

interface InventoryModelType extends Model<InventoryDoc> {
    build(attrs: InventoryAttrs): InventoryDoc;
}

const InventorySchema = new Schema<InventoryDoc>({
    product_id: { type: Schema.Types.ObjectId, required: true},
    total_quantity: { type: Number, required: true, default: 0 },
}, {
    timestamps: true,
    collection: 'inventory'
});

InventorySchema.set('versionKey', 'version');
InventorySchema.plugin(updateIfCurrentPlugin);

InventorySchema.statics.build = (attrs: InventoryAttrs) => {
    return new InventoryModel(attrs);
};

export const InventoryModel = model<InventoryDoc, InventoryModelType>('Inventory', InventorySchema);

