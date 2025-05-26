import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import {config} from '../configs/env';

interface AuthenticationRequest extends Request{
    user?: {username: string, password: string}
}

export const authenticateToken = (req: AuthenticationRequest, res: Response, next: NextFunction) =>{
    const token = req.cookies.jwt;
    if (!token){
        return res.status(401).json({message:"Unauthorized"});
    }

    try{
        const decoded = jwt.verify(token, config.jwtSecret) as { username: string; password: string };
        req.user = decoded;
        next();
    } catch (err){
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}