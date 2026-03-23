import { Document, Model, Schema, Types, model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export interface ImportAttrs {
    product_id: string;
    quantity: number;
    import_price: number;
    supplier?: string;
    note?: string;
}

export interface ImportDoc extends Document {
    _id: Types.ObjectId;
    product_id: Types.ObjectId;
    quantity: number;
    import_price: number;
    supplier?: string;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}

interface ImportModelType extends Model<ImportDoc> {
    build(attrs: ImportAttrs): ImportDoc;
}

const ImportSchema = new Schema<ImportDoc>({
    product_id: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, min: 1 },
    import_price: { type: Number, required: true, min: 0 },
    supplier: { type: String },
    note: { type: String, default: '' },
}, {
    timestamps: true,
    collection: 'import'
});

ImportSchema.set('versionKey', 'version');
ImportSchema.plugin(updateIfCurrentPlugin);

ImportSchema.statics.build = (attrs: ImportAttrs) => {
    return new ImportModel(attrs);
};

export const ImportModel = model<ImportDoc, ImportModelType>('Import', ImportSchema);
