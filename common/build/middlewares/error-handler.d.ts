import { NextFunction, Request, Response } from "express";
export declare const ErrorHandlerMiddleware: (err: Error, req: Request, res: Response, next: NextFunction) => void;
