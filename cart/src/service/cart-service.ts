import { CartModel, ICartAttrs } from "@tabletennisshop/common";
import { Types } from "mongoose";

export class CartService{
    public static addCart(cart: ICartAttrs){
        const newCart = CartModel.build(cart);
        return newCart.save();
    }

    public static async getCartByUserId(userId: string) {
        return await CartModel.findOne({ user_id: userId });
    }
    public static async getAllCarts() {
        return await CartModel.find({});
    }
}