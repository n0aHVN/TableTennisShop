import { InventoryUpdatedEventInterface, PublisherAbstract, SubjectsEnum } from "@tabletennisshop/common";

export class InventoryUpdatedPublisher extends PublisherAbstract<InventoryUpdatedEventInterface>{
    subject: SubjectsEnum.InventoryUpdated = SubjectsEnum.InventoryUpdated;
}