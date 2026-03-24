import express, { json, Request, Response } from "express";
import { productRouter } from "./routes/productRouter";
import { minioRouter } from "./routes/minioRouter";
import { ErrorHandlerMiddleware } from "@tabletennisshop/common";

const app = express();
app.get("/api/products/hello", async (req: Request, res: Response) => {
  res.status(200).send("HelloWorld");
});
app.use(json());
app.use(minioRouter);
app.use(productRouter);
app.use(ErrorHandlerMiddleware);
export {app};
