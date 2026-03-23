import { SubjectsEnum } from "../enums/event-subject.enum";
interface PaymentAttrs{
    _id: string;
    order_id: string;
    user_id: string;
}

export interface PaymentCreatedEventInterface{
    subject: SubjectsEnum.PaymentCreated;
    data: PaymentAttrs;
}
