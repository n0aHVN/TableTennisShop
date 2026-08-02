import { SubjectsEnum } from "../enums/event-subject.enum";
import { ProductStatusEnum } from "../enums/product-status.enum";

interface ProductAttrs{
    _id: string,
    status: ProductStatusEnum,
    price: number,
    version: number,
}

export interface ProductUpdatedEventInterface{
    subject: SubjectsEnum.ProductUpdated;
    data: ProductAttrs;
}

export interface ProductCreatedEventInterface{
    subject: SubjectsEnum.ProductCreated;
    data: ProductAttrs;
}

export interface ProductDeletedEventInterface{
    subject: SubjectsEnum.ProductDeleted;
    data: ProductAttrs;
}