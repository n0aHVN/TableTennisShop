import { Types } from "mongoose";
import { SubjectsEnum } from "../enums/event-subject.enum";
import { PaymentStatus } from "../enums/payment-status.enum";

interface PaymentAttrs{
    _id: string;
    order_id: string;
    status: PaymentStatus;
    version: string;
}

export interface PaymentCreatedEventInterface{
    subject: SubjectsEnum.PaymentCreated;
    data: PaymentAttrs;
}

export interface PaymentUpdatedEventInterface{
    subject: SubjectsEnum.PaymentUpdated;
    data: PaymentAttrs;
}

export interface PaymentExpiredEventInterface{
    subject: SubjectsEnum.PaymentExpired;
    data: PaymentAttrs;
}
