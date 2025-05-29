import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError{
    statusCode: number = 401;
    constructor(message: string){
        super(message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
    serializeErrors(): { message: string; details?: any; }[] {
        return [{message: this.message}];
    }
}