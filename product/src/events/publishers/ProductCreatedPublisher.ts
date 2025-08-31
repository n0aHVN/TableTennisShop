import { ProductCreatedEventInterface, PublisherAbstract, SubjectsEnum } from "@tabletennisshop/common";

export class ProductCreatedPublisher extends PublisherAbstract<ProductCreatedEventInterface> {
    subject: SubjectsEnum.ProductCreated = SubjectsEnum.ProductCreated;
}