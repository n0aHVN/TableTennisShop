import { SubjectsEnum } from "../enums/event-subject.enum";
import { ProductStatusEnum } from "../enums/product-status.enum";

interface ProductImageAttrs {
  key: string;
  url: string;
}

interface ProductAttrs{
  _id: string,
  status: ProductStatusEnum,
  price: number,
  version: number,
  images?: ProductImageAttrs[],
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