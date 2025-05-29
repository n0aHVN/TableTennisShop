import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { NotAuthorizedError } from "@tabletennisshop/common";


const router = express.Router();

router.get(
    "/api/users/current-user",
    (req: Request,res: Response)=>{
        if (!req.session?.jwt){
            throw new NotAuthorizedError("Not Authorized!");
        }
        res.status(200).send({message: "Authorized!"});
    }
);
router.post(
    "api/users/current-user",
    (req: Request, res: Response)=>{
        res.redirect(303,'/api/users/current-user')
    }
)

export {router};