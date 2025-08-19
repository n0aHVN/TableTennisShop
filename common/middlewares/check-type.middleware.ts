import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
export const CheckType = (roles: string[])=>{
    return (req: Request, res: Response, next: NextFunction)=>{
        const currentUser = req.currentUser;
        if(!currentUser) {
            throw new Error("Not Authorized");
        }
        if (!currentUser.type || !roles.includes(currentUser.type)){
            throw new Error("Not Authorized");
        }
        next();
    }
}