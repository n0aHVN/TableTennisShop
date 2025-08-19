import { ListenerAbstract, OrderAttrs, OrderCreatedEventInterface, OrderModel, OrderStatusEnum } from "@tabletennisshop/common";
import { SubjectsEnum } from "@tabletennisshop/common/build/enums/event-subject.enum";
import {queueGroupName} from "../queueGroupName"
import { Message } from "node-nats-streaming";
export class OrderCreatedListener extends ListenerAbstract<OrderCreatedEventInterface>{
    subject: SubjectsEnum.OrderCreated = SubjectsEnum.OrderCreated;

    queueGroupName: string = queueGroupName;

    async onMessage(data: OrderCreatedEventInterface['data'], msg: Message): Promise<void> {
        const order = OrderModel.build(data).set({status: OrderStatusEnum.PENDING});
        await order.save();
        msg.ack();
    }
}