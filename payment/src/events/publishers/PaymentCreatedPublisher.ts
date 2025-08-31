import { PaymentCreatedEventInterface, PublisherAbstract, SubjectsEnum } from "@tabletennisshop/common";

export class PaymentCreatedPublisher extends PublisherAbstract<PaymentCreatedEventInterface>{
    subject: SubjectsEnum.PaymentCreated = SubjectsEnum.PaymentCreated;
}