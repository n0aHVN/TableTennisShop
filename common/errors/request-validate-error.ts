import { CustomError } from './custom-error';
import { ValidationError } from 'express-validator';
export class RequestValidateError extends CustomError{
    statusCode = 400;
    private errors: ValidationError[];
    constructor(errors: ValidationError[]){
        //Assign message to CustomError abstract class
        super("Invalid request parameters");
        this.errors = errors;
        Object.setPrototypeOf(this, RequestValidateError.prototype);
    }
    serializeErrors() {
        return this.errors.map((err)=>{
            return {message: err.msg};
        });
    }
}