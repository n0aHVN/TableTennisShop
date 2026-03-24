import express from "express";
import { getLandingHeroVideo, getProductMedia } from "../controller/productMedia.controller";

const minioRouter = express.Router();

minioRouter.get("/api/media/landing/hero-video", getLandingHeroVideo);
minioRouter.get("/api/media", getProductMedia);

export { minioRouter };
