import { Document, Model, Schema, model, Types } from 'mongoose';
import { OrderStatusEnum } from '@tabletennisshop/common';
import { PaymentMethodEnum } from '@tabletennisshop/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
export interface OrderAttrs {
    _id: string;
    user_id: string;// FK to User
    products: {
        product_id: string;
        price: number;
        quantity: number;
    }[];
    status: OrderStatusEnum;
    payment_method: PaymentMethodEnum;
    total_price: number;
    version: number;
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
  total_price: number;
  version: number;
}

interface OrderModel extends Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const OrderSchema = new Schema<OrderDoc>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true },// FK to User
    products: [
      {
        product_id: { type: Schema.Types.ObjectId, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
      { _id: false }
    ],
    status: { type: String, enum: OrderStatusEnum, required: true },
    payment_method: { type: String, enum: Object.values(PaymentMethodEnum), required: true },
    total_price: { type: Number, required: true }
  },
  { collection: 'order' }
);

OrderSchema.set('versionKey', 'version');
OrderSchema.plugin(updateIfCurrentPlugin);

OrderSchema.statics.build = (attrs: OrderAttrs) => {
  return new OrderModel(attrs);
};

export const OrderModel = model<OrderDoc, OrderModel>('Order', OrderSchema);
