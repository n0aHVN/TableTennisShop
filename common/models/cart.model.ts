import { Document, model, Model, Schema, Types } from "mongoose";

export interface ICartAttrs{
    user_id: Types.ObjectId,
    products: {
        product_id: Types.ObjectId,
        quantity: number
    }[];
}

interface CartDoc extends Document{
    user_id: Types.ObjectId,
    products: {
        product_id: Types.ObjectId,
        quantity: number
    }[];
}

interface CartModel extends Model<CartDoc>{
    build(attrs: ICartAttrs): CartDoc;
}
const CartSchema = new Schema<CartDoc>({
    user_id: {type: Schema.Types.ObjectId, ref:'User',required: true},
    products: {
        type: [{
            product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }],
        required: true
    }
},{
    collection: "cart"
})

CartSchema.statics.build = (attrs: ICartAttrs) => {
  return new CartModel(attrs);
};

export const CartModel = model<CartDoc, CartModel>('Cart', CartSchema);