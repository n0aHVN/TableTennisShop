import { IRatingAttrs, ProductModel, UserModel } from "@tabletennisshop/common"
import { Types } from "mongoose";

export const getRatingData = async (): Promise<IRatingAttrs[]> => {
    const user1 = await UserModel.findOne({ username: "superherodung123" });
    const user2 = await UserModel.findOne({ username: "hoangnam456" });

    const product1 = await ProductModel.findOne({ name: "Timo Boll ALC" });
    const product2 = await ProductModel.findOne({ name: "Zhang Jike ALC NDN" });

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