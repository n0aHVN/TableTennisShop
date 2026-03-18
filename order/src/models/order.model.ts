import { Document, Model, Schema, model, Types } from 'mongoose';
import { OrderStatusEnum } from '@tabletennisshop/common';
import { PaymentMethodEnum } from '@tabletennisshop/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
export interface IOrderProduct {
  product_id: string; // FK to Product
  price: number; // Price of the product at the time of order
  quantity: number;
}

export interface OrderAttrs {
  user_id: string; // FK to User
  products: IOrderProduct[];
  status: OrderStatusEnum;
  payment_method: PaymentMethodEnum;
  total_price: number;
  expiresAt: Date; // Expiration date of the order
}

export interface OrderDoc extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;// FK to User
  products: {
    product_id: Types.ObjectId;
    price: number;
    quantity: number;
  }[];
  status: OrderStatusEnum;
  payment_method: PaymentMethodEnum;
  version: number;
  total_price: number;
  expiresAt: Date; // Expiration date of the order
}

interface OrderModel extends Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const OrderSchema = new Schema<OrderDoc>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true },// FK to User
    products: {
      type: [
        {
          product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },// FK to Product
          price: { type: Number, required: true }, // Price of the product at the time of order
          quantity: { type: Number, required: true },
          _id: false // Disable automatic creation of _id for subdocuments
        },
      ]
    },
    status: { type: String, enum: OrderStatusEnum, required: true },
    payment_method: { type: String, enum: Object.values(PaymentMethodEnum), required: true },
    total_price: { type: Number, required: true },
    expiresAt: { type: Date, required: true }
  },
  { collection: 'order' }
);
OrderSchema.set('versionKey', 'version');
OrderSchema.plugin(updateIfCurrentPlugin);

// Add indexes for analytics and query optimization
OrderSchema.index({ createdAt: 1 }); // For date-range queries
OrderSchema.index({ status: 1 }); // For status filtering
OrderSchema.index({ user_id: 1 }); // For customer-specific queries
OrderSchema.index({ payment_method: 1 }); // For payment method breakdown
OrderSchema.index({ createdAt: 1, status: 1 }); // Compound index for common queries

OrderSchema.statics.build = (attrs: OrderAttrs) => {
  return new OrderModel(attrs);
};

export const OrderModel = model<OrderDoc, OrderModel>('Order', OrderSchema);
