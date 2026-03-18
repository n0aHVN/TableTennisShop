import { ErrorHandlerMiddleware } from '@tabletennisshop/common';
import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { orderRouter } from './routes/order-route';
import { analyticsRouter } from './routes/analytics-route';
const app = express();
app.use(express.json());
app.use(cookieSession({
    signed: false,
    secure: false
}));
app.use(orderRouter);
app.use(analyticsRouter);
app.get("/api/orders/hello", (req, res) => {
    res.send("Hello from the orders API");
});
app.use(ErrorHandlerMiddleware);
export { app };