import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken'
interface UserPayload {
    username: string;
    email: string;
    type: string;
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
        When a user logs in, a JWT is created and stored "id" and "email" in the session.
        So to verify the user, we need to decode the JWT.
        This code try to verify and decode jwt to {id: "", email: ""}
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