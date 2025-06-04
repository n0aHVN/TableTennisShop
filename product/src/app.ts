import express, { json, Request, Response } from 'express';
import { productRouter } from './routes/productRouter';

const app = express();
app.get("/api/products/hello", async (req: Request, res: Response)=>{
    res.status(200).send("HelloWorld");
});
app.use(json());
app.use(productRouter);
export {app};
