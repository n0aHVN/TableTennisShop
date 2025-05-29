"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestValidateError = void 0;
const custom_error_1 = require("./custom-error");
class RequestValidateError extends custom_error_1.CustomError {
    constructor(errors) {
        //Assign message to CustomError abstract class
        super("Invalid request parameters");
        this.statusCode = 400;
        this.errors = errors;
        Object.setPrototypeOf(this, RequestValidateError.prototype);
    }
    serializeErrors() {
        return this.errors.map((err) => {
            return { message: err.msg };
        });
    }
}
exports.RequestValidateError = RequestValidateError;
