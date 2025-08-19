import { SubjectsEnum } from "../enums/event-subject.enum";
import { IRatingAttrs } from "../models/rating.model";

export interface RatingCreatedEventInterface {
    subject: SubjectsEnum.RatingCreated;
    data: IRatingAttrs;
}

export interface RatingUpdatedEventInterface {
    subject: SubjectsEnum.RatingUpdated;
    data: Partial<IRatingAttrs>;
}

export interface RatingDeletedEventInterface {
    subject: SubjectsEnum.RatingDeleted;
    data: {
        id: string;
    };
}
