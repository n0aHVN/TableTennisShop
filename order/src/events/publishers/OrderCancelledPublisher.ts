import { OrderCancelledEventInterface, PublisherAbstract } from "@tabletennisshop/common";
import { SubjectsEnum } from "@tabletennisshop/common/build/enums/event-subject.enum";

export class OrderCancelledPublisher extends PublisherAbstract<OrderCancelledEventInterface> {
    subject: SubjectsEnum.OrderCancelled = SubjectsEnum.OrderCancelled;
}