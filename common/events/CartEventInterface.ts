import { SubjectsEnum } from "../enums/event-subject.enum";
import { ICartAttrs } from "../models/cart.model";

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
