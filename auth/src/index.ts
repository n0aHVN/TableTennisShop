import express, { json, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
const app = express();

app.set('trust proxy', true);
app.use(json());



app.listen(3000, () => {
    console.log('Listening on port 3000');
});