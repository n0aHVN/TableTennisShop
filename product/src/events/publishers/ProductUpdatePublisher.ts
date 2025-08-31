import { ProductUpdatedEventInterface, PublisherAbstract, SubjectsEnum } from "@tabletennisshop/common";

export class ProductUpdatePublisher extends PublisherAbstract<ProductUpdatedEventInterface>{
    subject: ProductUpdatedEventInterface['subject'] = SubjectsEnum.ProductUpdated;
}