import { Document, model, Model, Schema, Types } from "mongoose";

interface CartAttrs{
    user_id: Types.ObjectId,
    products: [{
        product_id: Types.ObjectId,
        quantity: number
    }]
}

interface CartDoc extends Document{
    user_id: Types.ObjectId,
    products: [{
        product_id: Types.ObjectId,
        quantity: number
    }]
}

interface CartModel extends Model<CartDoc>{
    build(attrs: CartAttrs): CartDoc;
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
})

CartSchema.statics.build = (attrs: CartAttrs) => {
  return new CartModel(attrs);
};

export const CartModel = model<CartDoc, CartModel>('Cart', CartSchema);