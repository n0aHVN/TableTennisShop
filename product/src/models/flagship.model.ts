import { Document, Model, Schema, Types, model } from "mongoose";

/**
 * Homepage / marketing "flagship" lineup: ordered references to products.
 * Collection name: `flagship` (MongoDB collection; analogous to a table).
 */
export interface FlagshipAttrs {
  product_id: string;
  sortOrder: number;
  active?: boolean;
}

export interface FlagshipDoc extends Document {
  _id: Types.ObjectId;
  product_id: Types.ObjectId;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface FlagshipModelType extends Model<FlagshipDoc> {
  build(attrs: FlagshipAttrs): FlagshipDoc;
}

const FlagshipSchema = new Schema<FlagshipDoc>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sortOrder: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "flagship" }
);

FlagshipSchema.index({ product_id: 1 }, { unique: true });
FlagshipSchema.index({ active: 1, sortOrder: 1 });

FlagshipSchema.statics.build = function (attrs: FlagshipAttrs) {
  return new (this as unknown as FlagshipModelType)({
    product_id: attrs.product_id,
    sortOrder: attrs.sortOrder,
    active: attrs.active ?? true,
  });
};

export const FlagshipModel = model<FlagshipDoc, FlagshipModelType>("Flagship", FlagshipSchema);
