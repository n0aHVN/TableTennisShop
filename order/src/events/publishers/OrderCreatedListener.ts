import { OrderAttrs, OrderCreatedEventInterface, OrderModel, OrderStatusEnum, PublisherAbstract } from "@tabletennisshop/common";
import { SubjectsEnum } from "@tabletennisshop/common/build/enums/event-subject.enum";
import {queueGroupName} from "../queueGroupName"
import { Message } from "node-nats-streaming";

export class OrderCreatedPublisher extends PublisherAbstract<OrderCreatedEventInterface> {
    subject: SubjectsEnum.OrderCreated = SubjectsEnum.OrderCreated;
}