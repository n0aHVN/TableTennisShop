import { ICartAttrs, ProductModel, UserModel } from "@tabletennisshop/common"
import { Types } from "mongoose";
export const getCartData = async (): Promise<ICartAttrs[]> => {
    console.log("Adding cart data...");
    let user1, user2, product1, product2;

    try {
        user1 = await UserModel.findOne({ username: 'superherodung123' });
    } catch (error) {
        console.error('Error finding user1:', error);
        throw new Error('Failed to find user: superherodung123');
    }

    try {
        user2 = await UserModel.findOne({ username: 'tranquang456' });
    } catch (error) {
        console.error('Error finding user2:', error);
        throw new Error('Failed to find user: tranquang456');
    }

    try {
        product1 = await ProductModel.findOne({ name: 'Zhang Jike ALC' });
    } catch (error) {
        console.error('Error finding product1:', error);
        throw new Error('Failed to find product: Zhang Jike ALC');
    }

    try {
        product2 = await ProductModel.findOne({ name: 'Fan Zhendong ALC' });
    } catch (error) {
        console.error('Error finding product2:', error);
        throw new Error('Failed to find product: Fan Zhendong ALC');
    }
    const cartData: ICartAttrs[] = [
        {
            user_id: user1?._id as Types.ObjectId,
            products: [
                {
                    product_id: product1?._id as Types.ObjectId,
                    quantity: 2
                },
                {
                    product_id: product2?._id as Types.ObjectId,
                    quantity: 1
                }
            ]
        },
        {
            user_id: user2?._id as Types.ObjectId,
            products: [
                {
                    product_id: product1?._id as Types.ObjectId,
                    quantity: 1
                }
            ]
        }
    ]
    return cartData;
}