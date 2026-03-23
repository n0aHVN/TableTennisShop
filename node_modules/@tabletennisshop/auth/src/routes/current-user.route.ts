import express from "express";
import { currentUserController } from "../controllers/current-user.controller";
import { CurrentUserMiddleware } from "@tabletennisshop/common";

const router = express.Router();

router.get("/api/users/currentuser", CurrentUserMiddleware, currentUserController);

export { router as currentUserRouter };
