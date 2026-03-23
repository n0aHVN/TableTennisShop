import express, { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { RequestValidateError } from '../errors/request-validate-error';

export const ValidateRequestMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new RequestValidateError(errors.array());
    }
    next();
}