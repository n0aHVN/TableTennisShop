import { CustomError } from "./custom-error";

export class NotAuthorizedError extends CustomError{
    statusCode: number = 401;
    constructor(message: string){
        super(message);
        Object.setPrototypeOf(this, NotAuthorizedError.prototype);
    }

    serializeErrors(): { message: string; details?: any; }[] {
        return [{message: this.message}];
    }
}