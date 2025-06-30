import { OrderAttrs, OrderStatusEnum, PaymentMethodEnum, ProductModel, UserModel } from "@tabletennisshop/common";
import { Types } from "mongoose";

export const getOrderData = async (): Promise<OrderAttrs[]> => {
    const user1 = await UserModel.findOne({ username: 'superherodung123' });
    const user2 = await UserModel.findOne({ username: 'tranquang456' });

    const product1 = await ProductModel.findOne({ name: 'Zhang Jike ALC' });
    const product2 = await ProductModel.findOne({ name: 'Fan Zhendong ALC' });

    const data: OrderAttrs[] = [
        {
            user_id: user1?._id as Types.ObjectId,
            address: user1?.addresses[0]!,
            products: [
                {
                    product_id: product1?._id as Types.ObjectId,
                    price: product1?.price!,
                    quantity: 2
                },
                {
                    product_id: product2?._id as Types.ObjectId,
                    price: product2?.price!,
                    quantity: 1
                }
            ],
            status: OrderStatusEnum.FINISHED,
            statusTimestamps:{},
            payment_method: PaymentMethodEnum.COD,
            
        },
        {
            user_id: user2?._id as Types.ObjectId,
            products: [
                {
                    product_id: product1?._id as Types.ObjectId,
                    price: 3000000,
                    quantity: 1
                }
            ],
            status: OrderStatusEnum.PENDING,
            statusTimestamps: {},
            payment_method: PaymentMethodEnum.BANKING,
            address: user2?.addresses[0]!
        }
    ];
    return data;
}