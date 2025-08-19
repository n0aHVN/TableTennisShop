import express, { json, Request, Response } from 'express';
    
import { cartRouter } from './routes/cart-routes';

const app = express();
app.use(json());
app.use(cartRouter);
export {app};