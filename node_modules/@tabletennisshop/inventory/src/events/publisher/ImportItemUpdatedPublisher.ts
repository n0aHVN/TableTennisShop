import { ImportItemUpdatedEventInterface, PublisherAbstract, SubjectsEnum } from "@tabletennisshop/common";

export class ImportItemUpdatedPublisher extends PublisherAbstract<ImportItemUpdatedEventInterface> {
    subject: SubjectsEnum.ImportItemUpdated = SubjectsEnum.ImportItemUpdated;
}
