import { CurrentUserMiddleware } from "@tabletennisshop/common";
import express, { Request, Response } from "express";

const router = express.Router();

router.get(
    "/api/users/current-user",
    CurrentUserMiddleware,
    (req: Request,res: Response)=>{
        res.status(200).send(
            req.currentUser ?
            {message: "Authorized", currentUser: req.currentUser}
            :
            {message: "Not Authorized", currentUser: null}
        );
    }
);
router.post(
    "api/users/current-user",
    (req: Request, res: Response)=>{
        res.redirect(303,'/api/users/current-user')
    }
)

export {router};