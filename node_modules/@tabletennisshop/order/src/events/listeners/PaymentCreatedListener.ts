import { ListenerAbstract, OrderStatusEnum, PaymentCreatedEventInterface, SubjectsEnum } from "@tabletennisshop/common";
import { queueGroupName } from "../queueGroupName";
import { Message } from "node-nats-streaming";
import { OrderService } from "../../services/order-service";

export class PaymentCreatedListener extends ListenerAbstract<PaymentCreatedEventInterface> {
    subject: SubjectsEnum.PaymentCreated = SubjectsEnum.PaymentCreated;
    queueGroupName: string = queueGroupName;
    // Listener implementation
    async onMessage(data: PaymentCreatedEventInterface['data'], msg: Message) {
        await OrderService.updateOrderByUser({_id: data.order_id, user_id: data.user_id, status: OrderStatusEnum.FINISHED});
        msg.ack();
    }
}