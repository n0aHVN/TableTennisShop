export abstract class CustomError extends Error{
    abstract statusCode: number;
    constructor(message: string) {
        super(message);
        /*
        Always use this line in subclasses
        This will ensure that return true for "instanceof"
            const error = new CustomError("message");
            console.log(error instanceof CustomError);
        */
        Object.setPrototypeOf(this, CustomError.prototype);
    }
    abstract serializeErrors(): {message: string, details?: any}[];
}