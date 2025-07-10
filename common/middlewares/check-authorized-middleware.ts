import { NextFunction, Request, Response } from "express"
import { NotAuthorizedError } from "../errors/not-authorized-error";

export const CheckAuthorizedMiddleware= async (req: Request, res: Response, next: NextFunction)=>{
    //This can be wrong
    if (!req.session?.jwt){
        throw new NotAuthorizedError("Not Authorized");
    }
    next();
}