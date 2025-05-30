import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken'
interface UserPayload {
    id?: string;
    email: string;
}
// Another controller can access this information in the future
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const CurrentUserMiddleware = (req: Request, res: Response, next: NextFunction)=>{
    if (!req.session?.jwt){
        next();
    }

    /*
        Try to verify jwt to {id: "", email: ""}
        and save it into req.currentUser.
        Finally req.currentUser back to client.
    */
    try {
        const payload = jwt.verify(
            req.session?.jwt,
            "secretkey"
        ) as UserPayload;
        req.currentUser = payload;
        
    } catch (err) {
        console.log(err);
        next();
    }
    next();
}