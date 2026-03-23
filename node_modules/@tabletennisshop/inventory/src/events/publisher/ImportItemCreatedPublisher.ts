import { ImportItemCreatedEventInterface, PublisherAbstract, SubjectsEnum } from "@tabletennisshop/common";

export class ImportItemCreatedPublisher extends PublisherAbstract<ImportItemCreatedEventInterface> {
    subject: SubjectsEnum.ImportItemCreated = SubjectsEnum.ImportItemCreated;
}
