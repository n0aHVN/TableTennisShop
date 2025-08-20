import express, { json } from 'express';
import 'express-async-errors'; // <-- Add this line
import { cartRouter } from './routes/cart-routes';
import { ErrorHandlerMiddleware } from '@tabletennisshop/common';
import cookieSession from 'cookie-session';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
    signed: false,
    secure: false
}));

app.use(cartRouter);

app.use(ErrorHandlerMiddleware);

export {app};