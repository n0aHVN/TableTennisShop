import { ICartAttrs, ProductModel, UserModel } from "@tabletennisshop/common"
import { Types } from "mongoose";
export const getCartData = async (): Promise<ICartAttrs[]> => {
    const user1 =  await UserModel.findOne({ username: 'superherodung123' });
    const user2 =  await UserModel.findOne({ username: 'tranquang456' });

    const product1 = await ProductModel.findOne({ name: 'Zhang Jike ALC' });
    const product2 = await ProductModel.findOne({ name: 'Fan Zhendong ALC' });
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