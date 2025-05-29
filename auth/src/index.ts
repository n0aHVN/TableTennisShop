import express, { json, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import {app} from './app';
import { Client } from "../models/ClientModel";
import mongooseSequence from 'mongoose-sequence';
const start = async () => {
    try{
        await mongoose.connect("mongodb://mongo-service:27017/");
        console.log("Connected to Mongo");
    }
    catch(e){
        console.log(e);
        throw new Error("Cannot Connect to MongoDB");
    }
    try{
        const client = new Client({
        email: "superherodung123@gmail.com",
        password: "tridung123",
        full_name: "Nguyen Tri Dung",
        address: "address1",
        province: "province1",
        district: "district1",
        ward: "ward1",
        phone_number: "0123456789"
    });
        await client.save();
    }
    catch(e){
        console.log(e);
    }

}
console.clear();
app.listen(3000, () => {
    console.log('Listening on port 3000');
});

start();
