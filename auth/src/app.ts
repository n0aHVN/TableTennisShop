import express, { Request,Response } from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import {router as signInRouter} from './routes/signin';
import {router as signOutRouter} from './routes/signout';
import {router as signUpRouter} from './routes/signup';
import {router as currentUserRouter} from './routes/current-user';
import { ErrorHandlerMiddleware } from '@tabletennisshop/common';
import cookieSession from 'cookie-session';
const app = express();

app.set('trust proxy', true);
app.use(json());

app.use(cookieSession({
    signed: false,
    secure: false
}));

app.get("/api/users/hello",(req: Request, res: Response)=>{
    res.send("HelloWorld");
});

app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);
app.use(currentUserRouter);

app.use(ErrorHandlerMiddleware);



export { app };