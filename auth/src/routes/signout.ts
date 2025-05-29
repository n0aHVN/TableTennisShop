import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";


const router = express.Router();

router.get("/api/users/signout", async (req: Request, res: Response, next: NextFunction) => {
    // Clear the cookie session
    req.session = null;

    // Send a response indicating successful sign-out
    res.status(200).send({ message: "Successfully signed out" });
});

export {router};