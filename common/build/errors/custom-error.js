"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message) {
        super(message);
        /*
        Always use this line in subclasses
        This will ensure that return true for "instanceof"
            const error = new CustomError("message");
            console.log(error instanceof CustomError);
        */
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
exports.CustomError = CustomError;
