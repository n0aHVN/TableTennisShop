import { ImportItemStatusEnum } from "@tabletennisshop/common";
import { Document, Model, Schema, Types, model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export interface ImportItemAttrs {
    import_id: string;
    product_id: string;
    item_code: string;
    import_price: number;
    status?: ImportItemStatusEnum;
}

export interface ImportItemDoc extends Document {
    _id: Types.ObjectId;
    import_id: Types.ObjectId;
    product_id: Types.ObjectId;
    item_code: string;
    import_price: number;
    status: ImportItemStatusEnum;
    order_id?: Types.ObjectId;
    sold_at?: Date;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}

interface ImportItemModelType extends Model<ImportItemDoc> {
    build(attrs: ImportItemAttrs): ImportItemDoc;
}

const ImportItemSchema = new Schema<ImportItemDoc>({
    import_id: { type: Schema.Types.ObjectId, required: true, ref: 'Import' },
    product_id: { type: Schema.Types.ObjectId, required: true },
    item_code: { type: String, required: true, unique: true },
    import_price: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: Object.values(ImportItemStatusEnum),
        default: ImportItemStatusEnum.IN_STOCK
    },
    order_id: { type: Schema.Types.ObjectId },
    sold_at: { type: Date },
}, {
    timestamps: true,
    collection: 'import_item'
});

ImportItemSchema.index({ product_id: 1, status: 1, createdAt: 1 });
ImportItemSchema.index({ order_id: 1 });

ImportItemSchema.set('versionKey', 'version');
ImportItemSchema.plugin(updateIfCurrentPlugin);

ImportItemSchema.statics.build = (attrs: ImportItemAttrs) => {
    return new ImportItemModel(attrs);
};

export const ImportItemModel = model<ImportItemDoc, ImportItemModelType>('ImportItem', ImportItemSchema);
