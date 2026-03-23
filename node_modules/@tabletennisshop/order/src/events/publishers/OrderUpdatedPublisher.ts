import { OrderUpdatedEventInterface, PublisherAbstract, SubjectsEnum } from "@tabletennisshop/common";

export class OrderUpdatedPublisher extends PublisherAbstract<OrderUpdatedEventInterface> {
    subject: SubjectsEnum.OrderUpdated = SubjectsEnum.OrderUpdated;
}