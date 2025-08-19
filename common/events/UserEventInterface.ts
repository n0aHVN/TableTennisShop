import { SubjectsEnum } from "../enums/event-subject.enum";
import { UserAttrs } from "../models/user.model";

type OptionalUser = Partial<UserAttrs>;

export interface UserUpdatedEventInterface{
    subject: SubjectsEnum.UserUpdated;
    data: OptionalUser;
}
export interface UserDeletedEventInterface {
    subject: SubjectsEnum.UserDeleted;
    data: {
        id: string;
    };
}
export interface UserCreatedEventInterface {
    subject: SubjectsEnum.UserCreated;
    data: UserAttrs;
}