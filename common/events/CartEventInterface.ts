import { Types } from "mongoose";
import { SubjectsEnum } from "../enums/event-subject.enum";

interface ICartAttrs{
    _id: Types.ObjectId;
    user_id: Types.ObjectId,
    products: {
        product_id: Types.ObjectId,
        quantity: number
    }[];
    version: number;
}

export interface CartCreatedEventInterface {
    subject: SubjectsEnum.CartCreated;
    data: ICartAttrs;
}

export interface CartUpdatedEventInterface {
    subject: SubjectsEnum.CartUpdated;
    data: Partial<ICartAttrs>;
}

export interface CartDeletedEventInterface {
    subject: SubjectsEnum.CartDeleted;
    data: {
        id: string;
    };
}
