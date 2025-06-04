import { Schema, model, Types, Document } from 'mongoose';

interface IVendorPurchase {
  vendor_id: Types.ObjectId;
  products: {
    product_id: Types.ObjectId;
    price: number;
    quantity: number;
  }[];
  date: Date;
}

interface VendorPurchaseDoc extends IVendorPurchase, Document {}

const VendorPurchaseSchema = new Schema<VendorPurchaseDoc>(
  {
    vendor_id: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    products: [
      {
        product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    date: { type: Date, required: true },
  },
  {
    collection: 'vendor_purchase',
    timestamps: true,
  }
);

export const VendorPurchaseModel = model<VendorPurchaseDoc>(
  'VendorPurchase',
  VendorPurchaseSchema
);
