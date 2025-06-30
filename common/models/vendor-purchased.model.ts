import { Schema, model, Types, Document } from 'mongoose';

export interface IVendorPurchase {
  vendor_id: Types.ObjectId;
  products: {
    product_id: Types.ObjectId;
    serials?: string[];
    price: number;
    quantity: number;
  }[];
  date: Date;
}

interface VendorPurchaseDoc extends IVendorPurchase, Document {
  createdAt: Date;
  updatedAt: Date;
}

const VendorPurchaseSchema = new Schema<VendorPurchaseDoc>(
  {
    vendor_id: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    products: {
      type: [{
        product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        serials: { type: [String], required: false },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      }],
      required: true
    },
    date: { type: Date, required: true },
  },
  {
    collection: 'vendor_purchase',
    timestamps: true,
  }
);
VendorPurchaseSchema.statics.build = (attrs: IVendorPurchase) => {
  return new VendorPurchaseModel(attrs);
}


export const VendorPurchaseModel = model<VendorPurchaseDoc>(
  'VendorPurchase',
  VendorPurchaseSchema
);
