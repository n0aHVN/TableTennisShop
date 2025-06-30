import { IRatingAttrs, ProductModel, UserModel } from "@tabletennisshop/common"
import { Types } from "mongoose";

export const getRatingData = async (): Promise<IRatingAttrs[]> => {
    console.log("Adding rating data...");
    let user1, user2, product1, product2;

    try {
        user1 = await UserModel.findOne({ username: "superherodung123" });
    } catch (error) {
        console.error('Error finding user1:', error);
        throw new Error('Failed to find user: superherodung123');
    }

    try {
        user2 = await UserModel.findOne({ username: "hoangnam456" });
    } catch (error) {
        console.error('Error finding user2:', error);
        throw new Error('Failed to find user: hoangnam456');
    }

    try {
        product1 = await ProductModel.findOne({ name: "Timo Boll ALC" });
    } catch (error) {
        console.error('Error finding product1:', error);
        throw new Error('Failed to find product: Timo Boll ALC');
    }

    try {
        product2 = await ProductModel.findOne({ name: "Zhang Jike ALC NDN" });
    } catch (error) {
        console.error('Error finding product2:', error);
        throw new Error('Failed to find product: Zhang Jike ALC NDN');
    }

    return [
        {
            user_id: user1?._id as Types.ObjectId,
            product_id: product1?._id as Types.ObjectId,
            comment: "Great product, highly recommend!",
            rate_score: 5
        },
        {
            user_id: user2?._id as Types.ObjectId,
            product_id: product2?._id as Types.ObjectId,
            comment: "Not bad, but could be better.",
            rate_score: 4
        }
    ];
}