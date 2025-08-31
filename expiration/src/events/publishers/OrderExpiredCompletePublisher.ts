import { OrderExpiredCompleteEventInterface, PublisherAbstract, SubjectsEnum } from "@tabletennisshop/common";

export class ExpirationCompletePublisher extends PublisherAbstract<
  OrderExpiredCompleteEventInterface
> {
  subject: SubjectsEnum.OrderExpired = SubjectsEnum.OrderExpired;
}
