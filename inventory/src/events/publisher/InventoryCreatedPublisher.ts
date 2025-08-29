import { InventoryCreatedEventInterface, PublisherAbstract, SubjectsEnum } from "@tabletennisshop/common";

export class InventoryCreatedPublisher extends PublisherAbstract<InventoryCreatedEventInterface>{
    subject: SubjectsEnum.InventoryCreated = SubjectsEnum.InventoryCreated;
}