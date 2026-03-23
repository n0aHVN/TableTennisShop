import express,{NextFunction, Request, Response } from "express";
import { CustomError } from "../errors/custom-error";
import { RequestValidateError } from "../errors/request-validate-error";

export const ErrorHandlerMiddleware = (
    err:Error, 
    req: Request, 
    res: Response, 
    next: NextFunction
)=>{
    console.log(err);
    if (err instanceof CustomError){
        res.status(err.statusCode).send({errors: err.serializeErrors()});
        return;
    }
    res.status(400).send({errors: [{message: err.message}]});
    return;
}