import { Document, Model, Schema, model, Types } from 'mongoose';
import { OrderStatusEnum } from '@tabletennisshop/common';
import { PaymentMethodEnum } from '@tabletennisshop/common';

export interface OrderAttrs {
  user_id: Types.ObjectId; // FK to User
  status: OrderStatusEnum;
  payment_method: PaymentMethodEnum;
  total_price: number;
}

export interface OrderDoc extends Document {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;// FK to User
  status: OrderStatusEnum;
  payment_method: PaymentMethodEnum;
  total_price: number;
  version: number;
}

interface OrderModel extends Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const OrderSchema = new Schema<OrderDoc>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true },// FK to User
    status: { type: String, enum: OrderStatusEnum, required: true },
    payment_method: { type: String, enum: Object.values(PaymentMethodEnum), required: true },
    total_price: { type: Number, required: true }
  },
  { collection: 'order' }
);

OrderSchema.statics.build = (attrs: OrderAttrs) => {
  return new OrderModel(attrs);
};

export const OrderModel = model<OrderDoc, OrderModel>('Order', OrderSchema);
