import { Document, Model, Schema, model, Types } from 'mongoose';
import { AddressSchema, IAddress } from './address.schema';
import { OrderStatusEnum } from '../enums/order-status.enum';
import { IStatusTimestamps, StatusTimestampsSchema } from './status-timestamp.schema';
import { PaymentMethodEnum } from '../enums/payment-method.enum';

export interface IOrderProduct {
  product_id: Types.ObjectId; // FK to Product
  quantity: number;
}


export interface OrderAttrs {
  user_id: Types.ObjectId; // FK to User
  address: IAddress;
  products: IOrderProduct[];
  status: OrderStatusEnum;
  statusTimestamps: IStatusTimestamps;
  payment_method: PaymentMethodEnum;
}

export interface OrderDoc extends Document {
  user_id: Types.ObjectId;// FK to User
  address: IAddress;
  products: IOrderProduct[];
  status?: OrderStatusEnum;
  statusTimestamps: IStatusTimestamps;
  payment_method: PaymentMethodEnum;
}

interface OrderModel extends Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const OrderSchema = new Schema<OrderDoc>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },// FK to User
    address: { type: AddressSchema, required: true },
    products: [
      {
        product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },// FK to Product
        quantity: { type: Number, required: true },
      },
    ],
    status: { type: String, required: true },
    statusTimestamps: {type: StatusTimestampsSchema, require: true},
    payment_method: { type: String, enum: PaymentMethodEnum,required: true }
  },
  { collection: 'order'}
);

OrderSchema.statics.build = (attrs: OrderAttrs) => {
  return new OrderModel(attrs);
};

export const OrderModel = model<OrderDoc, OrderModel>('Order', OrderSchema);
