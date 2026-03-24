import express, { json } from "express";
import { configRouter } from "./routes/configRouter";
import { ErrorHandlerMiddleware } from "@tabletennisshop/common";

const app = express();
app.use(json());
app.use(configRouter);
app.use(ErrorHandlerMiddleware);

export { app };
