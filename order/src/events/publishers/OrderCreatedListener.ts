import {OrderCreatedEventInterface, PublisherAbstract } from "@tabletennisshop/common";
import { SubjectsEnum } from "@tabletennisshop/common/build/enums/event-subject.enum";

export class OrderCreatedPublisher extends PublisherAbstract<OrderCreatedEventInterface> {
    subject: SubjectsEnum.OrderCreated = SubjectsEnum.OrderCreated;
}