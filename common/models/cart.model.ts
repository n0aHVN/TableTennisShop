import { Document, model, Model, Schema } from "mongoose";

interface CartAttrs{
    userId: string,
    products: [{
        product_id: string,
        quantity: number
    }]
}

interface CartDoc extends Document{
    userId: string,
    products: [{
        product_id: string,
        quantity: number
    }]
}

interface CartModel extends Model<CartDoc>{
    build(attrs: CartAttrs): CartDoc;
}
const CartSchema = new Schema<CartDoc>({
    userId: {type: String, required: true},
    products: {
        type: [{
            product_id: { type: String, required: true },
            quantity: { type: Number, required: true }
        }],
        required: true
    }
})

CartSchema.statics.build = (attrs: CartAttrs) => {
  return new CartModel(attrs);
};

export const CartModel = model<CartDoc, CartModel>('Cart', CartSchema);