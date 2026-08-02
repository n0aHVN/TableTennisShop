import express from "express";
import { getMinioMediaByPath, rejectMediaPathMissingKey } from "../controller/productMedia.controller";

const minioRouter = express.Router();

/** GET `/api/media/{bucket}` — object key is required; use `/api/media/{bucket}/{key...}`. */
minioRouter.get("/api/media/:bucket", rejectMediaPathMissingKey);
/** GET `/api/media/{bucket}/{key...}` — stream object from MinIO (bucket + path key only). */
minioRouter.get(/^\/api\/media\/[^/]+\/.+$/, getMinioMediaByPath);

export { minioRouter };
