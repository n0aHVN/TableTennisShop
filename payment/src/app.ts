import { ErrorHandlerMiddleware } from '@tabletennisshop/common';
import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { paymentRouter } from './routes/route';
const app = express();
app.use(express.json());
app.use(cookieSession({
    signed: false,
    secure: false
}));
app.use(paymentRouter);
app.get("/api/payments/hello", (req, res) => {
    res.send("Hello from the payments API");
});
app.use(ErrorHandlerMiddleware);
export { app };