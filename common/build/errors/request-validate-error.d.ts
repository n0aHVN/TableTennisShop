import { CustomError } from './custom-error';
import { ValidationError } from 'express-validator';
export declare class RequestValidateError extends CustomError {
    statusCode: number;
    private errors;
    constructor(errors: ValidationError[]);
    serializeErrors(): {
        message: any;
    }[];
}
