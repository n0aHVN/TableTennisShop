import { NextFunction } from "express"
import axios from "axios";
import { NotAuthorizedError } from "../errors/not-authorized-error";
export const CheckAuthorizedMiddleware= async (req: Request, res: Response, next: NextFunction)=>{
    const axiosRes = await axios.get("localhost:3000/api/users/current-user");
    if (axiosRes.status != 200){
        throw new NotAuthorizedError("Not Authorized");
    }
    next();
}