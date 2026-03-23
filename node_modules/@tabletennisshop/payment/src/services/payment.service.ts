import { NotFoundError } from "@tabletennisshop/common";
import { PaymentAttrs, PaymentModel } from "../models/payment.model";
import { PaymentCreatedPublisher } from "../events/publishers/PaymentCreatedPublisher";
import { natsWrapper } from "../NatsWrapper";
import { OrderModel } from "../models/order.model";

type UpdatePaymentAttrs = Partial<PaymentAttrs> & { _id: string };

export class PaymentService{
    static async createPayment(data: PaymentAttrs){
        const existingOrder = await OrderModel.findById(data.order_id);
        if (!existingOrder) {
            throw new NotFoundError('Order not found');
        }
        const payment = PaymentModel.build(data);
        await payment.save();
        new PaymentCreatedPublisher(natsWrapper.client).publish({
            _id: payment._id.toHexString(),
            user_id: payment.user_id.toHexString(),
            order_id: payment.order_id.toHexString(),
        });
        return payment;
    }
}
